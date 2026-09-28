# MessageManager API リファレンス（Java 版）

intra-mart Accel Platform コアソース（`im_core_base` モジュール）の実クラス定義に基づく。記憶や推測でメソッドを補わないこと。

## パッケージ構成

```
jp.co.intra_mart.foundation.security.message
└── MessageManager                … 公開 API。メッセージ取得のエントリポイント（final クラス、シングルトン）

jp.co.intra_mart.foundation.security.exception
├── AccessSecurityException        … MessageManager が送出する例外の基底（FoundationException を継承）
└── IllegalArgumentException       … 引数不正時に送出される例外（AccessSecurityException を継承）
```

`IllegalArgumentException` は `jp.co.intra_mart.foundation.security.exception` パッケージのクラスであり、`java.lang.IllegalArgumentException` とは別クラスである。import 時に取り違えないこと。

## `MessageManager` クラス

```java
package jp.co.intra_mart.foundation.security.message;

public final class MessageManager {

    /**
     * メッセージマネージャのインスタンスを取得します。
     * @return メッセージマネージャのインスタンス
     */
    public static synchronized MessageManager getInstance();

    // ---- ユーザのロケールでメッセージを取得するメソッド ----

    public String getMessage(String key) throws AccessSecurityException;
    public String getMessage(String key, String arg) throws AccessSecurityException;
    public String getMessage(String key, String arg1, String arg2) throws AccessSecurityException;
    public String getMessage(String key, String arg1, String arg2, String arg3) throws AccessSecurityException;
    public String getMessage(String key, String[] args) throws AccessSecurityException;

    // ---- 指定したロケールでメッセージを取得するメソッド ----

    public String getMessage(Locale locale, String key) throws AccessSecurityException;
    public String getMessage(Locale locale, String key, String arg) throws AccessSecurityException;
    public String getMessage(Locale locale, String key, String arg1, String arg2) throws AccessSecurityException;
    public String getMessage(Locale locale, String key, String arg1, String arg2, String arg3) throws AccessSecurityException;
    public String getMessage(Locale locale, String key, String[] args) throws AccessSecurityException;

    // ---- テナントロケールでメッセージを取得するメソッド ----

    /**
     * @since 8.0
     */
    public String getTenantMessage(String key, String... args) throws AccessSecurityException;

    // ---- メッセージの存在確認 ----

    /**
     * @since 8.0
     */
    public boolean hasMessage(String key) throws AccessSecurityException;

    /**
     * @since 8.0
     */
    public boolean hasMessage(Locale locale, String key) throws AccessSecurityException;

    /**
     * @since 8.0
     */
    public boolean hasTenantMessage(String key) throws AccessSecurityException;
}
```

- `final` クラス。継承不可。コンストラクタは `private`
- インスタンスは `getInstance()`（`synchronized` な遅延初期化のシングルトン）で取得する。`new MessageManager()` はコンパイルエラーになる
- 状態を持つのはクラス初期化・`getInstance()` 時に読み込まれるメッセージプロバイダのみで、呼び出し側で追加の初期化は不要

### 置換文字列（`arg` / `args`）の扱い

`{@link java.text.MessageFormat#format(String, Object[])}` に準じてプレースホルダを置換する。メッセージ本文（プロパティファイルの値）は `{0}`, `{1}`, ... 形式の `MessageFormat` パターンとして記述する。

- 置換結果に `'`（シングルクォート）を出力したい場合は `''` と記述する
- 置換結果に `{` を出力したい場合は `'{` と記述する
- `args` に空配列を渡した場合、`MessageFormat#format` を経由せず、取得したメッセージをそのまま返す（`{0}` 等のプレースホルダを含むメッセージでも変換されない）

### 例外

| 状況 | 例外 |
|------|------|
| `key` / `locale` / `args` に `null` を渡した | `AccessSecurityException`（実体は `IllegalArgumentException`） |
| 指定したキーのメッセージがどのロケールにも存在しない | 例外は送出されない。後述の未定義時フォールバック文字列が返る |

**`getMessage` / `getTenantMessage` は、メッセージキーが未定義でも例外を送出しない。** 存在確認には後述の `hasMessage` / `hasTenantMessage` を使うこと。

## メッセージ取得の解決順序

### ユーザのロケールで取得するメソッド（`getMessage(String, ...)`）

1. ユーザのロケール（`AccountContext#getLocale()`）でメッセージを取得
2. 存在しなければテナントのロケールで取得
3. 存在しなければシステムのデフォルトロケールで取得
4. 存在しなければロケール指定のないメッセージ properties ファイルから取得
5. それでも存在しなければ、ユーザのロケールで「未定義」を表す文字列（メッセージキー `MessageCap.CAP_Z_IWP_MESSAGE_UNDEFINED` に対応するメッセージ）を返す
6. その「未定義」メッセージ自体も存在しなければ、固定文字列 `"undefined"` を返す

### ロケールを指定して取得するメソッド（`getMessage(Locale, String, ...)`）

1. 指定したロケールでメッセージを取得
2. 存在しなければロケール指定のないメッセージ properties ファイルから取得
3. それでも存在しなければ、固定文字列 `"undefined"` を返す（このパスでは「未定義」メッセージ自体の多言語解決は行わない）

### テナントロケールで取得するメソッド（`getTenantMessage`）

1. テナントのロケールでメッセージを取得
2. 存在しなければシステムのデフォルトロケールで取得
3. 存在しなければロケール指定のないメッセージ properties ファイルから取得
4. それでも存在しなければ、テナントのロケールで「未定義」を表す文字列を返す。それも存在しなければ `"undefined"`

`getTenantMessage` の Javadoc には次の注記がある: 「`getTenantMessage` は、intra-mart Accel Platform内部のログ、例外に用いるメッセージを取得するためのメソッドなので、通常、アプリケーション開発では使用しません。」— アプリケーション開発では原則 `getMessage` 系（ユーザロケール）または `getMessage(Locale, ...)` 系（ロケール明示指定）を使う。

「ロケール指定のないメッセージ properties ファイル」とは、例えば `<CONTEXT_PATH>/WEB-INF/conf/message` 配下に `foo_en.properties` / `foo_ja.properties` / `foo.properties` の 3 ファイルが存在する場合の、ロケール接尾辞のない `foo.properties` を指す。

## メッセージプロパティファイルの配置

Javadoc に基づき、メッセージ properties ファイルはデプロイ後 `<CONTEXT_PATH>/WEB-INF/conf/message` 配下に配置される。intra-mart の Maven プロジェクト（`im_module` パッケージング）のソースツリー上は `src/main/conf/message/` 配下に置く（`src/main/webapp/WEB-INF/conf/message/` ではない。`src/main/conf/` はビルド時に `WEB-INF/conf/` へそのままの相対構造でコピーされる）。標準の `maven-war-plugin` を使う一般的な Java Web アプリケーションプロジェクトの場合は `src/main/webapp/WEB-INF/conf/message/` に相当するが、intra-mart プロジェクトでは通常このパッケージングを使わない。

## 実プラットフォームコードでの利用例（挙動の参考）

`jp.co.intra_mart.system.box.message.BoxCap`（`im_box-main` モジュール）:

```java
return MessageManager.getInstance().getMessage(key, args);
// ロケール指定版
return MessageManager.getInstance().getMessage(locale, key, args);
```

`jp.co.intra_mart.system.ui.page.Caption`（`im_ui-main` モジュール）でも同様に `MessageManager.getInstance().getMessage(...)` の呼び出しパターンが使われている。いずれも `getInstance()` で取得したインスタンスに対して都度 `getMessage` を呼び出しており、インスタンスをフィールドにキャッシュする実装にはなっていない（`getInstance()` 自体が `synchronized` な遅延初期化のシングルトンであるため、毎回の呼び出しコストは小さい）。
