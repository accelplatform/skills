# SecureToken Implementation Patterns (Java)

A collection of implementation patterns for issuing and verifying tokens using `jp.co.intra_mart.foundation.secure_token.SecureTokenManager`. Refer to `reference/secure-token-api-reference.md` for the exact method signatures.

## Token Lifecycle

1. **Issuance**: On a screen or process reached through the legitimate flow, call `createToken()` to generate a token (the generated token is automatically stored in the session)
2. **Handoff**: Send the generated token string (`SecureToken#getString()`) as a parameter of the next request (`SecureTokenManager.REQUEST_PARAMETER_NAME` = `"im_secure_token"`) — a hidden form field, an Ajax request parameter, etc.
3. **Verification**: On the receiving side, call `verify()` to determine whether the token included in the request is the valid one stored in the session
4. **Expiration**: A one-time token (`useOneTimeToken = true`) is invalidated once used for verification and cannot be reused

## Pattern 1: Basic Token Issuance and Verification (Servlet)

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
            // Issue a non-reusable (one-time) token
            final SecureToken token = tokenManager.createToken(true);
            request.setAttribute("secureToken", token.getString());
        } catch (final SecureTokenException e) {
            throw new ServletException("Failed to create secure token.", e);
        }
        // ... forward to the form screen, setting secureToken into a hidden field
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
            // Automatically retrieves and verifies the token from the request parameter (im_secure_token)
            valid = tokenManager.verify();
        } catch (final SecureTokenException e) {
            throw new ServletException("Failed to verify secure token.", e);
        }

        if (!valid) {
            // Reject as an illegitimate access that did not go through the form screen
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        // ... proceed with subsequent processing as a legitimate request
    }
}
```

## Pattern 2: Issuance/Verification in a Context Without a Direct `HttpServletRequest` Argument

In places where `HttpServletRequest` isn't passed as an argument — custom tags, utility classes, etc. — obtain it via `HTTPContextManager`.

```java
package jp.co.example.foo.util;

import javax.servlet.http.HttpServletRequest;

import jp.co.intra_mart.common.aid.jsdk.javax.servlet.http.HTTPContextManager;
import jp.co.intra_mart.foundation.secure_token.SecureToken;
import jp.co.intra_mart.foundation.secure_token.SecureTokenException;
import jp.co.intra_mart.foundation.secure_token.SecureTokenManager;

public class FooSecureTokenIssuer {

    /**
     * Issues a one-time token tied to the current HTTP request.
     * @return the token string
     * @throws SecureTokenException if an exception occurs while generating the token
     */
    public String issue() throws SecureTokenException {
        final HttpServletRequest request = HTTPContextManager.getInstance().getCurrentContext().getRequest();
        final SecureTokenManager tokenManager = new SecureTokenManager(request);
        final SecureToken token = tokenManager.createToken(true);
        return token.getString();
    }
}
```

## Pattern 3: Parameter-Bound Tokens (Tamper Detection)

If the parameters specified at issuance time don't match those specified at verification time, the token is judged invalid. Use this when you want to confirm that important form values (an amount, a quantity, etc.) were not tampered with during the screen transition.

```java
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Issuing side: generate a token that includes the amount as a parameter
final Map<String, List<String>> parameter = new HashMap<>();
parameter.put("amount", Arrays.asList("10000"));
final SecureToken token = tokenManager.createToken(true, parameter);
```

```java
// Verifying side: verify by passing the actually-received amount in the same format
final Map<String, List<String>> parameter = new HashMap<>();
parameter.put("amount", Arrays.asList(request.getParameter("amount")));
final boolean valid = tokenManager.verify(request.getParameter(SecureTokenManager.REQUEST_PARAMETER_NAME), parameter);
```

Since `verify` returns `false` if the value has changed, use this in addition to ordinary CSRF protection wherever tamper detection is also needed — screen transitions involving business-critical parameters such as an amount or a permission level.

## Pattern 4: Choosing Between One-Time and Reusable Tokens

| Type | `createToken` argument | Use case |
|------|---------------------|------|
| One-time token | `true` | A one-off state-changing operation (registration, update, deletion, login processing, etc.). **Default to this unless the user specifies otherwise** |
| Reusable token | `false` | An operation that may send multiple requests from the same screen (a paginated search form, etc.) |

```java
// Use a one-time token for state-changing operations
final SecureToken token = tokenManager.createToken(true);

// Use a reusable token for a search form that may be resubmitted many times
final SecureToken searchToken = tokenManager.createToken(false);
```

## Pattern 5: Exception Handling

Both `createToken` and `verify` throw the checked exception `SecureTokenException`. A failure in the token processing itself is normally an abnormal condition the calling business logic cannot continue past, so wrap it in a business exception or propagate it upward as-is.

```java
try {
    final boolean valid = tokenManager.verify();
    if (!valid) {
        // A token mismatch (a possible illegitimate access) is treated as access denial, not a business exception
        response.sendError(HttpServletResponse.SC_FORBIDDEN);
        return;
    }
} catch (final SecureTokenException e) {
    // A failure in the token processing itself (a session inconsistency, etc.) is treated as a system error
    throw new ServletException("Failed to verify secure token.", e);
}
```

**Do not confuse `verify()` returning `false` with a `SecureTokenException` being thrown.** The former is a normal judgment result indicating "an access that didn't go through the legitimate flow" (reject with `403`, etc.); the latter is an abnormality in the token processing itself (log it and investigate the cause).

## Notes

- **`createToken()` stores the token in the session tied to the `HttpServletRequest` passed to the constructor.** It does not work correctly when there is no session (i.e., `request.getSession(false)` returns `null`). This assumes it's used in a state where a session has been established (a screen after login, etc.)
- **Do not enable the development-only system property that skips verification (`...SecureTokenManager.ignore_token_check`) in a production environment.** Unintentionally deploying to production with it left `true` disables CSRF protection
- **A one-time token is invalidated after verification.** Calling `getString()`/`getParameterNameSet()`/`isOneTime()` again on a `SecureToken` that was successfully verified throws a `SecureTokenException`, so retrieve any values you need before verification
- If you want secure token verification on a Web API Maker endpoint (`@Path`/an HTTP method annotation), don't call this skill's API directly — use the `@Secured` annotation from `java-im-web-api-maker-usage` instead (it performs equivalent verification declaratively)
