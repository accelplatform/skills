# SecureToken 实现模式（Java 版）

使用 `jp.co.intra_mart.foundation.secure_token.SecureTokenManager` 进行令牌签发・验证的实现模式集合。方法的准确签名请参照 `reference/secure-token-api-reference.md`。

## 令牌的生命周期

1. **签发**：在经由正规流程到达的画面・处理中调用 `createToken()` 生成令牌（生成的令牌会自动存储到会话中）
2. **传递**：将生成的令牌字符串（`SecureToken#getString()`）放入下一次请求的参数（`SecureTokenManager.REQUEST_PARAMETER_NAME` = `"im_secure_token"`）中发送（表单的隐藏字段、Ajax 请求参数等）
3. **验证**：在接收方的处理中调用 `verify()`，判断请求中包含的令牌是否为存储在会话中的正当令牌
4. **失效**：一次性令牌（`useOneTimeToken = true`）在被用于一次验证后即失效，无法再次使用

## 模式 1：基本的令牌签发与验证（Servlet）

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
            // 签发不可重用的（一次性）令牌
            final SecureToken token = tokenManager.createToken(true);
            request.setAttribute("secureToken", token.getString());
        } catch (final SecureTokenException e) {
            throw new ServletException("Failed to create secure token.", e);
        }
        // ... 转发到表单画面，将 secureToken 设置到隐藏字段中
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
            // 自动从请求参数（im_secure_token）中获取令牌并进行验证
            valid = tokenManager.verify();
        } catch (final SecureTokenException e) {
            throw new ServletException("Failed to verify secure token.", e);
        }

        if (!valid) {
            // 作为未经过表单画面的非法访问予以拒绝
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        // ... 作为正当请求继续后续处理
    }
}
```

## 模式 2：未以参数形式接收 `HttpServletRequest` 的场景下的签发与验证

在自定义标签、工具类等未以参数形式传递 `HttpServletRequest` 的场景下，通过 `HTTPContextManager` 获取。

```java
package jp.co.example.foo.util;

import javax.servlet.http.HttpServletRequest;

import jp.co.intra_mart.common.aid.jsdk.javax.servlet.http.HTTPContextManager;
import jp.co.intra_mart.foundation.secure_token.SecureToken;
import jp.co.intra_mart.foundation.secure_token.SecureTokenException;
import jp.co.intra_mart.foundation.secure_token.SecureTokenManager;

public class FooSecureTokenIssuer {

    /**
     * 签发与当前 HTTP 请求关联的一次性令牌。
     * @return 令牌字符串
     * @throws SecureTokenException 生成令牌过程中发生异常时抛出
     */
    public String issue() throws SecureTokenException {
        final HttpServletRequest request = HTTPContextManager.getInstance().getCurrentContext().getRequest();
        final SecureTokenManager tokenManager = new SecureTokenManager(request);
        final SecureToken token = tokenManager.createToken(true);
        return token.getString();
    }
}
```

## 模式 3：参数绑定令牌（篡改检测）

若签发时指定的参数与验证时指定的参数不一致，令牌将被判定为不正当。适用于希望确认表单内容（金额・数量等重要值）在画面跳转期间未被篡改的场景。

```java
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// 签发方：将金额作为参数包含在内生成令牌
final Map<String, List<String>> parameter = new HashMap<>();
parameter.put("amount", Arrays.asList("10000"));
final SecureToken token = tokenManager.createToken(true, parameter);
```

```java
// 验证方：以相同格式传入实际接收到的金额进行验证
final Map<String, List<String>> parameter = new HashMap<>();
parameter.put("amount", Arrays.asList(request.getParameter("amount")));
final boolean valid = tokenManager.verify(request.getParameter(SecureTokenManager.REQUEST_PARAMETER_NAME), parameter);
```

若值被更改，`verify` 会返回 `false`，因此除通常的 CSRF 防护外，在还需要篡改检测的场景（涉及金额・权限级别等业务上重要参数的画面跳转）中可以使用此模式。

## 模式 4：一次性令牌与可重用令牌的选择

| 类型 | `createToken` 的参数 | 用途 |
|------|---------------------|------|
| 一次性令牌 | `true` | 一次性的状态变更操作（注册・更新・删除・登录处理等）。**若用户无明确指定，默认使用此类型** |
| 可重用令牌 | `false` | 同一画面可能多次提交请求的操作（带分页的检索表单等） |

```java
// 状态变更操作使用一次性令牌
final SecureToken token = tokenManager.createToken(true);

// 可能被多次重新提交的检索表单等使用可重用令牌
final SecureToken searchToken = tokenManager.createToken(false);
```

## 模式 5：异常处理

`createToken`/`verify` 均会抛出受检异常 `SecureTokenException`。令牌处理本身的失败通常是调用方业务逻辑无法继续的异常情况，应将其包装为业务异常，或直接向上层传播。

```java
try {
    final boolean valid = tokenManager.verify();
    if (!valid) {
        // 令牌不一致（可能是非法访问）不作为业务异常，而是作为拒绝访问处理
        response.sendError(HttpServletResponse.SC_FORBIDDEN);
        return;
    }
} catch (final SecureTokenException e) {
    // 令牌处理本身的失败（会话不一致等）作为系统错误处理
    throw new ServletException("Failed to verify secure token.", e);
}
```

**不要混淆 `verify()` 返回 `false` 与抛出 `SecureTokenException`。** 前者是表示「未经正规流程的访问」的正常判定结果（以 `403` 等拒绝），后者是令牌处理本身的异常（应记录日志并排查原因）。

## 注意事项

- **`createToken()` 会将令牌存储到与构造函数传入的 `HttpServletRequest` 关联的会话中。** 在没有会话的状态下（即 `request.getSession(false)` 返回 `null` 的状态）调用将无法正常工作。前提是在会话已建立的状态（登录后的画面等）下使用
- **不要在生产环境中启用仅供开发使用的验证跳过系统属性（`...SecureTokenManager.ignore_token_check`）。** 若因疏忽在保持 `true` 的状态下部署到生产环境，将导致 CSRF 防护失效
- **一次性令牌在验证后会失效。** 对已成功验证的 `SecureToken` 再次调用 `getString()`/`getParameterNameSet()`/`isOneTime()` 会抛出 `SecureTokenException`，因此需要的值应在验证前获取
- 若需要在 Web API Maker 端点（`@Path`/HTTP 方法注解）上进行安全令牌验证，不要直接调用本技能的 API，而应使用 `java-im-web-api-maker-usage` 的 `@Secured` 注解（可声明式地执行等效验证）
