# SecureToken API リファレンス（Java 版）

`im_core_base` モジュール（`jp.co.intra_mart.foundation.secure_token.*`）の実クラス定義に基づく。記憶や推測でメソッド・属性を補わないこと。

## パッケージ構成

```
jp.co.intra_mart.foundation.secure_token
├── SecureTokenManager   … 公開 API。トークンの発行・検証のエントリポイント
├── SecureToken          … 発行されたトークンを表すモデルクラス
└── SecureTokenException … トークン処理に伴う例外（検査例外）
```

## `SecureTokenManager` クラス

```java
package jp.co.intra_mart.foundation.secure_token;

public class SecureTokenManager {

    /** トークンをリクエストパラメータにセットするときの名前（"im_secure_token"）。 */
    public static final String REQUEST_PARAMETER_NAME = "im_secure_token";

    /** トークンを格納するセッションの属性名。 */
    public static final String SESSION_ATTRIBUTE_NAME = "...";

    /**
     * コンストラクタ。
     * @param request リクエスト
     */
    public SecureTokenManager(ServletRequest request);

    /**
     * トークンを生成します。生成したトークンはセッションに格納されます。
     * このメソッドで生成されるトークンにはパラメータの情報を含めません。
     * @param useOneTimeToken true: 1回限り有効なトークン、false: 再利用可能なトークン
     * @return トークン
     * @throws SecureTokenException トークン生成中に例外が発生した場合
     */
    public SecureToken createToken(boolean useOneTimeToken) throws SecureTokenException;

    /**
     * トークンを生成します。パラメータを指定すると、パラメータをハッシュ化したトークンを生成できます。
     * 受け取り側でパラメータを同様にハッシュ化することで、パラメータが変更されていないか照合できます。
     * @param useOneTimeToken true: 1回限り有効なトークン、false: 再利用可能なトークン
     * @param parameter パラメータ（値が1個でも List で指定する）
     * @return トークン
     * @throws SecureTokenException トークン生成中に例外が発生した場合
     */
    public SecureToken createToken(boolean useOneTimeToken, Map<String, List<String>> parameter) throws SecureTokenException;

    /**
     * トークンの正当性をチェックします。リクエストパラメータ（"im_secure_token"）からトークンを取得します。
     * @return トークンが正当なら true
     * @throws SecureTokenException トークン検証中に例外が発生した場合
     */
    public boolean verify() throws SecureTokenException;

    /**
     * 指定したトークンの正当性をチェックします。
     * @param token 検証するトークン
     * @return トークンが正当なら true
     * @throws SecureTokenException トークン検証中に例外が発生した場合
     * @since 8.0.11
     */
    public boolean verify(String token) throws SecureTokenException;

    /**
     * 指定したトークンとパラメータの正当性をチェックします。
     * @param token 検証するトークン
     * @param parameter トークン生成時に使用したパラメータ（比較用）
     * @return トークンが正当なら true
     * @throws SecureTokenException トークン検証中に例外が発生した場合
     * @since 8.0.11
     */
    public boolean verify(String token, Map<String, List<String>> parameter) throws SecureTokenException;
}
```

### `verify()` が `false` を返す条件

- トークンがリクエストパラメータに含まれていない
- トークンが正当なものではない
- トークンを生成したときとはパラメータ値が違う
- トークンがすでに無効化されている（ワンタイムトークンを2回目以降に使用した等）

### 開発時のみの検証スキップ設定

システムプロパティ `jp.co.intra_mart.foundation.secure_token.SecureTokenManager.ignore_token_check` を `true` に設定すると、`verify()` 系メソッドは常に `true` を返す。**開発用の設定であり、運用環境では使用しないこと**（JavaDoc に明記）。

## `SecureToken` クラス（発行されたトークンのモデル）

```java
package jp.co.intra_mart.foundation.secure_token;

public class SecureToken implements Serializable {

    public SecureToken(String secureToken, boolean useOneTime, Set<String> parameterNameSet);

    /**
     * このトークンを無効化します（ワンタイムトークンの場合のみ実際に無効化される）。
     */
    public void disable();

    /**
     * トークン生成時に使用したパラメータ名の一覧を取得します。
     * @throws SecureTokenException すでに無効化されている場合
     */
    public Set<String> getParameterNameSet() throws SecureTokenException;

    /**
     * トークン文字列を取得します。
     * @throws SecureTokenException すでに無効化されている場合
     */
    public String getString() throws SecureTokenException;

    /**
     * ワンタイムトークンかどうかを返します。
     * @throws SecureTokenException すでに無効化されている場合
     */
    public boolean isOneTime() throws SecureTokenException;
}
```

- `disable()`/`getString()` 等はいずれも無効化状態を通じて **すでに使用済みのワンタイムトークンの再取得を防ぐ** ためのガードを持つ。無効化後に `getString()` 等を呼ぶと `SecureTokenException` が送出される
- `useOneTime = false`（再利用可能トークン）の場合、`disable()` を呼んでも実際には無効化されない（内部実装が `useOneTime` の場合のみ `enable` フラグを落とす）

## `SecureTokenException` クラス

```java
package jp.co.intra_mart.foundation.secure_token;

public class SecureTokenException extends Exception {

    public SecureTokenException();
    public SecureTokenException(String message);
    public SecureTokenException(String message, Throwable cause);
    public SecureTokenException(Throwable cause);
}
```

`java.lang.Exception` を継承する検査例外。`createToken`/`verify` 系メソッドはすべて `throws SecureTokenException` を宣言している。

## `HttpServletRequest` の取得方法

`SecureTokenManager` のコンストラクタは `ServletRequest` を要求する。Servlet の `doGet`/`doPost` のように引数で直接渡される文脈では、それをそのまま使用する。

**引数でリクエストが渡されない文脈**（カスタムタグ、ユーティリティクラス等）では、`HTTPContextManager` を使って現在のスレッドに関連付けられた `HttpServletRequest` を取得できる。

```java
package jp.co.intra_mart.common.aid.jsdk.javax.servlet.http;

public abstract class HTTPContextManager {

    /**
     * HTTP コンテキスト・マネージャのインスタンスを取得します。
     */
    public static HTTPContextManager getInstance();

    /**
     * 現在のスレッドに関連付けられた HTTP コンテキストを返します。
     */
    public HTTPContext getCurrentContext();
}

public interface HTTPContext {
    ServletContext getServletContext();
    HttpServletRequest getRequest();
    HttpServletResponse getResponse();
    HttpSession getSession();
    HttpSession getCurrentSession();
}
```

呼び出し例（プラットフォーム実クラス `jp.co.intra_mart.system.comet.jssp.tag.ReverseAjaxTag` での実例）:

```java
final HttpServletRequest request = HTTPContextManager.getInstance().getCurrentContext().getRequest();
final SecureTokenManager tokenManager = new SecureTokenManager(request);
final SecureToken token = tokenManager.createToken(false);
```

`getCurrentContext()` は「現在のスレッドに関連付けられた」コンテキストを返す実装であり、HTTP リクエスト処理スレッド内であれば、Servlet・カスタムタグ・その先で呼び出す任意の Java クラスのいずれからでも同じ `HttpServletRequest` を取得できる。
