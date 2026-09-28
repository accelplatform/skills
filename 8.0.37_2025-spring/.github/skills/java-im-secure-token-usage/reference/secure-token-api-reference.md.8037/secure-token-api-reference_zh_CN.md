# SecureToken API 参考（Java 版）

基于 `im_core_base` 模块（`jp.co.intra_mart.foundation.secure_token.*`）的实际类定义。不要凭记忆或推测补充方法・属性。

## 包结构

```
jp.co.intra_mart.foundation.secure_token
├── SecureTokenManager   … 公开 API。令牌签发・验证的入口点
├── SecureToken          … 表示已签发令牌的模型类
└── SecureTokenException … 令牌处理相关的异常（受检异常）
```

## `SecureTokenManager` 类

```java
package jp.co.intra_mart.foundation.secure_token;

public class SecureTokenManager {

    /** 将令牌设置到请求参数时使用的名称（"im_secure_token"）。 */
    public static final String REQUEST_PARAMETER_NAME = "im_secure_token";

    /** 存储令牌的会话属性名。 */
    public static final String SESSION_ATTRIBUTE_NAME = "...";

    /**
     * 构造函数。
     * @param request 请求
     */
    public SecureTokenManager(ServletRequest request);

    /**
     * 生成令牌。生成的令牌会存储到会话中。
     * 通过此方法生成的令牌不包含参数信息。
     * @param useOneTimeToken true：仅一次有效的令牌；false：可重复使用的令牌
     * @return 令牌
     * @throws SecureTokenException 生成令牌过程中发生异常时抛出
     */
    public SecureToken createToken(boolean useOneTimeToken) throws SecureTokenException;

    /**
     * 生成令牌。指定参数后，可生成对参数进行哈希化的令牌。
     * 接收方以同样方式对接收到的参数进行哈希化，即可核对参数是否被篡改。
     * @param useOneTimeToken true：仅一次有效的令牌；false：可重复使用的令牌
     * @param parameter 参数（即使只有一个值也须以 List 形式指定）
     * @return 令牌
     * @throws SecureTokenException 生成令牌过程中发生异常时抛出
     */
    public SecureToken createToken(boolean useOneTimeToken, Map<String, List<String>> parameter) throws SecureTokenException;

    /**
     * 校验令牌的正当性。从请求参数（"im_secure_token"）中获取令牌。
     * @return 令牌正当则为 true
     * @throws SecureTokenException 校验令牌过程中发生异常时抛出
     */
    public boolean verify() throws SecureTokenException;

    /**
     * 校验指定令牌的正当性。
     * @param token 待校验的令牌
     * @return 令牌正当则为 true
     * @throws SecureTokenException 校验令牌过程中发生异常时抛出
     * @since 8.0.11
     */
    public boolean verify(String token) throws SecureTokenException;

    /**
     * 校验指定令牌与参数的正当性。
     * @param token 待校验的令牌
     * @param parameter 生成令牌时使用的参数（用于比对）
     * @return 令牌正当则为 true
     * @throws SecureTokenException 校验令牌过程中发生异常时抛出
     * @since 8.0.11
     */
    public boolean verify(String token, Map<String, List<String>> parameter) throws SecureTokenException;
}
```

### `verify()` 返回 `false` 的条件

- 请求参数中不包含令牌
- 令牌不正当
- 参数值与生成令牌时不同
- 令牌已被无效化

### 仅供开发使用的跳过校验设置

将系统属性 `jp.co.intra_mart.foundation.secure_token.SecureTokenManager.ignore_token_check` 设置为 `true`，`verify()` 系列方法将始终返回 `true`。**这是仅供开发使用的设置，切勿在生产环境中使用**（JavaDoc 中已明确说明）。

## `SecureToken` 类（已签发令牌的模型）

```java
package jp.co.intra_mart.foundation.secure_token;

public class SecureToken implements Serializable {

    public SecureToken(String secureToken, boolean useOneTime, Set<String> parameterNameSet);

    /**
     * 使该令牌失效（仅在一次性令牌的情况下才会实际失效）。
     */
    public void disable();

    /**
     * 获取生成令牌时使用的参数名集合。
     * @throws SecureTokenException 若已失效
     */
    public Set<String> getParameterNameSet() throws SecureTokenException;

    /**
     * 获取令牌字符串。
     * @throws SecureTokenException 若已失效
     */
    public String getString() throws SecureTokenException;

    /**
     * 返回是否为一次性令牌。
     * @throws SecureTokenException 若已失效
     */
    public boolean isOneTime() throws SecureTokenException;
}
```

- `disable()`/`getString()` 等方法均通过失效状态进行保护，**防止已使用过的一次性令牌被再次获取**。失效后再调用 `getString()` 等方法会抛出 `SecureTokenException`
- 当 `useOneTime = false`（可重复使用的令牌）时，即使调用 `disable()` 也不会实际失效（内部实现仅在 `useOneTime` 为 true 时才会关闭 `enable` 标志）

## `SecureTokenException` 类

```java
package jp.co.intra_mart.foundation.secure_token;

public class SecureTokenException extends Exception {

    public SecureTokenException();
    public SecureTokenException(String message);
    public SecureTokenException(String message, Throwable cause);
    public SecureTokenException(Throwable cause);
}
```

继承自 `java.lang.Exception` 的受检异常。`createToken`/`verify` 系列方法均声明了 `throws SecureTokenException`。

## `HttpServletRequest` 的获取方式

`SecureTokenManager` 的构造函数要求传入 `ServletRequest`。在以参数形式直接传递的场景（如 Servlet 的 `doGet`/`doPost`）中，直接使用该参数即可。

**在请求未以参数形式传递的场景**（自定义标签、工具类等）下，可通过 `HTTPContextManager` 获取绑定到当前线程的 `HttpServletRequest`。

```java
package jp.co.intra_mart.common.aid.jsdk.javax.servlet.http;

public abstract class HTTPContextManager {

    /**
     * 获取 HTTP 上下文管理器的实例。
     */
    public static HTTPContextManager getInstance();

    /**
     * 返回与当前线程关联的 HTTP 上下文。
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

调用示例（基于实际平台类 `jp.co.intra_mart.system.comet.jssp.tag.ReverseAjaxTag` 中的实际用法）：

```java
final HttpServletRequest request = HTTPContextManager.getInstance().getCurrentContext().getRequest();
final SecureTokenManager tokenManager = new SecureTokenManager(request);
final SecureToken token = tokenManager.createToken(false);
```

由于 `getCurrentContext()` 返回的是「与当前线程关联」的上下文，因此只要处于 HTTP 请求处理线程内，无论是 Servlet、自定义标签，还是由其进一步调用的任意 Java 类，都可以通过此方式获取到相同的 `HttpServletRequest`。
