# SecureToken 実装パターン（Java 版）

`jp.co.intra_mart.foundation.secure_token.SecureTokenManager` を使ったトークン発行・検証の実装パターン集。メソッドの正確なシグネチャは `reference/secure-token-api-reference.md` を参照すること。

## トークンのライフサイクル

1. **発行**: 正規の手順で到達した画面・処理で `createToken()` を呼び、トークンを生成する（生成したトークンは自動的にセッションへ格納される）
2. **受け渡し**: 生成したトークン文字列（`SecureToken#getString()`）を、次のリクエストのパラメータ（`SecureTokenManager.REQUEST_PARAMETER_NAME` = `"im_secure_token"`）に載せて送信する（フォームの hidden フィールド、Ajax リクエストのパラメータ等）
3. **検証**: 受け取り側の処理で `verify()` を呼び、リクエストに含まれるトークンがセッションに格納された正当なものかを判定する
4. **失効**: ワンタイムトークン（`useOneTimeToken = true`）は一度検証に使われると無効化され、再利用できない

## パターン1: 基本的なトークンの発行と検証（Servlet）

```java
package jp.co.example.foo.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jp.co.intra_mart.foundation.secure_token.SecureToken;
import jp.co.intra_mart.foundation.secure_token.SecureTokenException;
import jp.co.intra_mart.foundation.secure_token.SecureTokenManager;

public class FooFormServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(final HttpServletRequest request, final HttpServletResponse response) throws ServletException, IOException {
        final SecureTokenManager tokenManager = new SecureTokenManager(request);
        try {
            // 再利用不可（ワンタイム）のトークンを発行する
            final SecureToken token = tokenManager.createToken(true);
            request.setAttribute("secureToken", token.getString());
        } catch (final SecureTokenException e) {
            throw new ServletException("Failed to create secure token.", e);
        }
        // ... フォーム画面へフォワードし、hidden フィールドに secureToken をセットする
    }
}
```

```java
package jp.co.example.foo.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jp.co.intra_mart.foundation.secure_token.SecureTokenException;
import jp.co.intra_mart.foundation.secure_token.SecureTokenManager;

public class FooFormReceiverServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doPost(final HttpServletRequest request, final HttpServletResponse response) throws ServletException, IOException {
        final SecureTokenManager tokenManager = new SecureTokenManager(request);
        final boolean valid;
        try {
            // リクエストパラメータ（im_secure_token）から自動的にトークンを取得して検証する
            valid = tokenManager.verify();
        } catch (final SecureTokenException e) {
            throw new ServletException("Failed to verify secure token.", e);
        }

        if (!valid) {
            // フォーム画面を経由しない不正なアクセスとして拒否する
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        // ... 正規のリクエストとして後続処理を行う
    }
}
```

## パターン2: `HttpServletRequest` を引数で受け取らない文脈での発行・検証

カスタムタグ・ユーティリティクラス等、`HttpServletRequest` が引数で渡されない場所では `HTTPContextManager` から取得する。

```java
package jp.co.example.foo.util;

import javax.servlet.http.HttpServletRequest;

import jp.co.intra_mart.common.aid.jsdk.javax.servlet.http.HTTPContextManager;
import jp.co.intra_mart.foundation.secure_token.SecureToken;
import jp.co.intra_mart.foundation.secure_token.SecureTokenException;
import jp.co.intra_mart.foundation.secure_token.SecureTokenManager;

public class FooSecureTokenIssuer {

    /**
     * 現在の HTTP リクエストに紐づくワンタイムトークンを発行します。
     * @return トークン文字列
     * @throws SecureTokenException トークン生成中に例外が発生した場合
     */
    public String issue() throws SecureTokenException {
        final HttpServletRequest request = HTTPContextManager.getInstance().getCurrentContext().getRequest();
        final SecureTokenManager tokenManager = new SecureTokenManager(request);
        final SecureToken token = tokenManager.createToken(true);
        return token.getString();
    }
}
```

## パターン3: パラメータ連動トークン（改ざん検知）

発行時に指定したパラメータと、検証時に指定したパラメータが一致しない場合、トークンは不正と判定される。フォームの内容（金額・数量等の重要な値）が画面遷移の間に改ざんされていないかを確認したい場合に使う。

```java
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// 発行側: 金額をパラメータに含めてトークンを生成する
final Map<String, List<String>> parameter = new HashMap<>();
parameter.put("amount", Arrays.asList("10000"));
final SecureToken token = tokenManager.createToken(true, parameter);
```

```java
// 検証側: 実際に受け取った金額を同じ形式で渡して検証する
final Map<String, List<String>> parameter = new HashMap<>();
parameter.put("amount", Arrays.asList(request.getParameter("amount")));
final boolean valid = tokenManager.verify(request.getParameter(SecureTokenManager.REQUEST_PARAMETER_NAME), parameter);
```

値が変更されていれば `verify` は `false` を返すため、通常の CSRF 対策に加えて改ざん検知が必要な場面（金額・権限レベル等、業務上重要なパラメータを含む画面遷移）で使う。

## パターン4: ワンタイムトークンと再利用可能トークンの使い分け

| 種別 | `createToken` の引数 | 用途 |
|------|---------------------|------|
| ワンタイムトークン | `true` | 1回限りの状態変更操作（登録・更新・削除・ログイン処理等）。**ユーザから明示の指定がなければこちらをデフォルトとする** |
| 再利用可能トークン | `false` | 同一画面から複数回リクエストを送信する可能性がある操作（ページング付き検索フォーム等） |

```java
// 状態変更操作にはワンタイムトークンを使う
final SecureToken token = tokenManager.createToken(true);

// 何度も再送信されうる検索フォーム等には再利用可能トークンを使う
final SecureToken searchToken = tokenManager.createToken(false);
```

## パターン5: 例外処理

`createToken`/`verify` はいずれも検査例外 `SecureTokenException` を送出する。トークン処理自体の失敗は、通常は呼び出し元のビジネスロジックが継続できない異常系であるため、業務例外へラップするか、そのまま上位へ伝播させる。

```java
try {
    final boolean valid = tokenManager.verify();
    if (!valid) {
        // トークン不一致（不正アクセスの可能性）はビジネス例外ではなくアクセス拒否として扱う
        response.sendError(HttpServletResponse.SC_FORBIDDEN);
        return;
    }
} catch (final SecureTokenException e) {
    // トークン処理自体の失敗（セッション不整合等）はシステムエラーとして扱う
    throw new ServletException("Failed to verify secure token.", e);
}
```

**`verify()` が `false` を返すケースと、`SecureTokenException` が送出されるケースを混同しないこと。** 前者は「正規の手順を経ていないアクセス」を示す正常な判定結果（`403` 等で拒否する）、後者はトークン処理自体の異常（ログして原因を調査する対象）である。

## 注意事項

- **`createToken()` はコンストラクタに渡した `HttpServletRequest` に紐づくセッションへトークンを格納する。** セッションが存在しない状態（`request.getSession(false)` が `null` を返す状態）で呼び出すと正しく機能しない。セッションが確立された状態（ログイン後の画面等）で使うことを前提とする
- **開発時のみの検証スキップ用システムプロパティ（`...SecureTokenManager.ignore_token_check`）を運用環境で有効にしない。** 意図せず `true` のまま本番デプロイすると CSRF 対策が無効化される
- **ワンタイムトークンは検証後に無効化される。** 検証に成功した `SecureToken` の `getString()`/`getParameterNameSet()`/`isOneTime()` を再度呼び出すと `SecureTokenException` が送出されるため、必要な値は検証前に取得しておく
- Web API Maker のエンドポイント（`@Path`/HTTP メソッドアノテーション）でセキュアトークン検証をしたい場合は、本スキルの API を直接呼ぶのではなく `java-im-web-api-maker-usage` の `@Secured` アノテーションを使う（宣言的に同等の検証が行われる）
