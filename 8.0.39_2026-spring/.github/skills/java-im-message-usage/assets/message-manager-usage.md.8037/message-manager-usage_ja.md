# MessageManager 実装パターン（Java 版）

`jp.co.intra_mart.foundation.security.message.MessageManager` を使ったメッセージ取得の実装パターン集。メソッドの正確なシグネチャ・解決順序は `reference/message-manager-api-reference.md` を参照すること。

## メッセージキーの命名規約

本プロジェクトの JSSP 側スキル（`jssp-localize-support`）と共通のキー命名規約を用いる。メッセージ properties ファイルの仕組み自体が JSSP・Java 間で共通のため、キー体系を揃えることで、両モデルが混在するプロジェクトでもメッセージの使い回し・突合がしやすくなる。

| カテゴリ | properties ファイル | 用途 | キー形式 |
|---------|-----------------|------|---------|
| キャプション | `caption_<locale>.properties` | タイトル、ラベル等の短い表示文字列 | `CAP.Z.APP.<製品名>.<機能名>.<キャプション名>` |
| メッセージ | `message_<locale>.properties` | エラーメッセージ、確認メッセージ、成功メッセージ等 | `MSG.<エラータイプ>.APP.<製品名>.<機能名>.<メッセージ名>` |
| ログメッセージ | `log-message_<locale>.properties` | ログ出力用メッセージ | `<エラータイプ>.APP.<製品名>.<機能名>.<連番>` |

**エラータイプ:** `E`（エラー）/ `W`（警告）/ `I`（情報）/ `C`（確認）

**キー命名規則:**
- 区切り文字はドット（`.`）のみを使用する
- アンダースコア（`_`）・ハイフン（`-`）はキー名に使用しない
- キー 2 番目のセグメント `APP`（ベンダー識別子）はデフォルト値。プロジェクトで別の識別子を使っている場合はそちらに合わせる（`jssp-localize-support` の「キープレフィックス（ベンダー識別子）の確認」を参照）

## properties ファイルの形式

非 ASCII 文字は `\uXXXX` 形式（native2ascii）でエスケープする。英語ファイルは ASCII のみなのでエスケープ不要。改行コードは LF を使用する。

```properties
# message_ja.properties
MSG.E.APP.SAMPLE.USER.SYSTEM.ERROR=予期しないエラーが発生しました。{0}
```

```properties
# message_en.properties
MSG.E.APP.SAMPLE.USER.SYSTEM.ERROR=An unexpected error occurred. {0}
```

## パターン 1: 基本的なメッセージ取得（ユーザロケール）

タイトル・ラベル等、ログイン中ユーザのロケールに応じて出し分けたい文字列に使う。

```java
import jp.co.intra_mart.foundation.security.exception.AccessSecurityException;
import jp.co.intra_mart.foundation.security.message.MessageManager;

public class UserService {

    public String getScreenTitle() throws AccessSecurityException {
        final MessageManager messageManager = MessageManager.getInstance();
        return messageManager.getMessage("CAP.Z.APP.SAMPLE.USER.LIST.TITLE");
    }
}
```

## パターン 2: プレースホルダ置換

```properties
# message_ja.properties
MSG.E.APP.SAMPLE.USER.NOT.FOUND=ユーザコード {0} は存在しません。
```

```java
final MessageManager messageManager = MessageManager.getInstance();
final String message = messageManager.getMessage("MSG.E.APP.SAMPLE.USER.NOT.FOUND", userCode);
```

引数が 2 個・3 個の場合は `getMessage(key, arg1, arg2)` / `getMessage(key, arg1, arg2, arg3)` を使う。4 個以上の場合は `getMessage(key, String[])` を使う。

## パターン 3: ロケールを明示指定して取得

ログ出力等、ログイン中ユーザのロケールに依存させたくない場合に使う。

```java
import java.util.Locale;

final MessageManager messageManager = MessageManager.getInstance();
final String message = messageManager.getMessage(Locale.JAPANESE, "MSG.E.APP.SAMPLE.USER.SYSTEM.ERROR", cause.getMessage());
```

## パターン 4: 例外処理時のメッセージ取得と業務例外へのラップ

`getMessage` 自体は「引数が `null`」以外では例外を送出しない（未定義キーは `"undefined"` 文字列にフォールバックする）。そのため、業務ロジック内でメッセージ取得に失敗した場合の分岐は基本的に不要。`AccessSecurityException` は「呼び出し側のプログラミングミス（`null` 引数）」を示す例外であり、通常は catch して回復させる対象ではなく、そのまま上位に伝播させるか、原因不明の内部エラーとして扱う。

```java
import jp.co.intra_mart.foundation.security.exception.AccessSecurityException;
import jp.co.intra_mart.foundation.security.message.MessageManager;

public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(final String userCode) {
        super(buildMessage(userCode));
    }

    private static String buildMessage(final String userCode) {
        try {
            return MessageManager.getInstance().getMessage("MSG.E.APP.SAMPLE.USER.NOT.FOUND", userCode);
        } catch (final AccessSecurityException e) {
            // userCode が null の場合等、呼び出し側の実装ミス以外では通常到達しない
            throw new IllegalStateException("Failed to build exception message.", e);
        }
    }
}
```

## パターン 5: メッセージの存在確認

キーの存在自体を業務ロジックで分岐条件にしたい場合（例: オプション項目のラベルが定義されていれば表示する）に使う。

```java
final MessageManager messageManager = MessageManager.getInstance();
if (messageManager.hasMessage("CAP.Z.APP.SAMPLE.USER.OPTIONAL.LABEL")) {
    final String label = messageManager.getMessage("CAP.Z.APP.SAMPLE.USER.OPTIONAL.LABEL");
    // ラベルを使った処理
}
```

## 注意事項

- `MessageManager` はシングルトンであり、フィールドにキャッシュせず必要な箇所で毎回 `MessageManager.getInstance()` を呼び出してよい（`getInstance()` は軽量な `synchronized` メソッド）
- `import` 時、`jp.co.intra_mart.foundation.security.exception.IllegalArgumentException` を `java.lang.IllegalArgumentException` と取り違えないこと。IDE の自動 import 補完で誤って `java.lang` 版を import すると、`AccessSecurityException` の catch 節でコンパイルエラーになる
- `getTenantMessage` はプラットフォーム内部のログ・例外メッセージ取得用であり、通常のアプリケーション開発では使わない。アプリケーション側は `getMessage`（ユーザロケール）または `getMessage(Locale, ...)`（ロケール明示指定）を使う
- メッセージ本文（properties ファイルの値）に `{0}` 等のプレースホルダを含める場合、`'`（シングルクォート）は `''`、`{` は `'{` とエスケープしないと `MessageFormat` の解析でずれが生じる
- プレゼンテーション層（JSP 等）でのメッセージ表示方法は本スキルの対象外。ページ実装の規約に従うこと
