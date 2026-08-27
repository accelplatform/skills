# Identifier API 基本利用パターン（Java 版）

`Identifier` のシグネチャ・内部動作は `reference/identifier-api-reference.md` を参照。ここでは典型的な呼び出しパターンを示す。

## パターン1: 分散環境で一意な ID を採番する（`get()`、業務データ向け）

伝票番号・申請番号・レコードの主キー等、他のアプリケーションサーバで生成された ID と重複してはならない業務データの採番に使う。`IOException` を業務例外にラップして呼び出し元へ伝播させる。

```java
package jp.co.example.foo.service;

import java.io.IOException;

import jp.co.intra_mart.foundation.service.client.information.Identifier;

/**
 * 受注番号の採番処理を提供します。
 */
public class OrderNumberGenerator {

    /**
     * 受注番号を新規採番します。<br>
     * 分散環境（複数アプリケーションサーバ構成）でも重複しないことを保証します。
     *
     * @return 採番した受注番号
     * @throws OrderNumberGenerationException 採番処理でエラーが発生した場合
     */
    public String generate() throws OrderNumberGenerationException {
        final Identifier identifier = new Identifier();
        try {
            return identifier.get();
        } catch (final IOException e) {
            throw new OrderNumberGenerationException("受注番号の採番に失敗しました。", e);
        }
    }
}
```

- `IOException` をそのまま `throws` で伝播させてよい場面（呼び出し元が既に `IOException` を扱っている等）では、業務例外へのラップを省略してよい。プロジェクトに Java 向けのエラーハンドリング規約が別途追加された場合はそちらの方針を優先する
- `Identifier` はメソッドを呼ぶたびに `new Identifier()` してよい（状態を持たないため、インスタンス生成コストは軽微）

## パターン2: アプリケーションサーバ内で一意な ID を採番する（`make()`、プロセス内一時識別子向け）

ログのトレース ID、リクエストスコープ内の相関 ID 等、プロセス内で一意であれば足りる識別子に使う。静的メソッドなのでインスタンス化不要、チェック例外もない。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.service.client.information.Identifier;

/**
 * 処理トレース用の相関 ID を発行します。
 */
public class TraceIdIssuer {

    /**
     * 相関 ID を発行します。<br>
     * アプリケーションサーバ内で一意であることのみを保証します。分散環境での一意性は保証しません。
     *
     * @return 相関 ID
     */
    public String issue() {
        return Identifier.make();
    }
}
```

## パターン3: ループ内で複数件を採番する場合

`get()` は呼び出しのたびに Server Manager と通信するため、大量件数を一括採番する処理ではパフォーマンスに影響しうる。件数が多い場合は事前にユーザへ性能面の懸念を伝え、必要であれば別の採番方式（DB シーケンス等）の採用も検討候補として提示する。

```java
package jp.co.example.foo.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import jp.co.intra_mart.foundation.service.client.information.Identifier;

public class BulkOrderNumberGenerator {

    public List<String> generate(final int count) throws OrderNumberGenerationException {
        final Identifier identifier = new Identifier();
        final List<String> numbers = new ArrayList<String>(count);
        try {
            for (int i = 0; i < count; i++) {
                numbers.add(identifier.get());
            }
        } catch (final IOException e) {
            throw new OrderNumberGenerationException("受注番号の一括採番に失敗しました。", e);
        }
        return numbers;
    }
}
```

## アンチパターン（避けること）

```java
// NG: セキュリティトークンとして使用（推測可能な値のため不適切）
String resetToken = Identifier.make(); // パスワードリセットトークンには使わない

// NG: IOException を握りつぶす
try {
    id = new Identifier().get();
} catch (IOException e) {
    // 何もしない ← NG。採番失敗を握りつぶすと後続処理が不整合データを生む
}

// NG: 分散環境が要件なのに make() を使う
String orderNo = Identifier.make(); // 複数サーバで同時に採番されると重複しうる
```
