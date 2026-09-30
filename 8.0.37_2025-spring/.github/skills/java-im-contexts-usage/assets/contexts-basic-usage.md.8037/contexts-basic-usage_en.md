# Contexts API Basic Usage Patterns (Java Version)

Implementation patterns based on the method signatures in `reference/contexts-api-reference.md`. Always verify actual method names and return types against the reference — never rely on memory or guesswork.

## Pattern 1: Getting User Info / Authentication Check in the Service Layer

```java
import jp.co.intra_mart.foundation.context.Contexts;
import jp.co.intra_mart.foundation.context.model.AccountContext;

public class {ServiceName}Service {

    public void process() {
        // Contexts.get() never returns null (it throws ContextNotFoundException instead when unavailable),
        // so no null check is needed for account (and AccountContext is a required context, so the
        // exception normally does not occur either)
        final AccountContext account = Contexts.get(AccountContext.class);
        if (!account.isAuthenticated()) {
            throw new {ServiceName}ServiceException("An authenticated user is required");
        }
        final String userCd = account.getUserCd();
        final String tenantId = account.getTenantId();
        // Business logic using userCd / tenantId
    }
}
```

`ContextStatus` gives a more concise form (though if `userCd` etc. are also needed, you still need `AccountContext`).

```java
import jp.co.intra_mart.foundation.context.ContextStatus;

if (!ContextStatus.isAuthenticated()) {
    throw new {ServiceName}ServiceException("An authenticated user is required");
}
```

## Pattern 2: Internationalization Using Locale/Time Zone

```java
import java.text.SimpleDateFormat;
import java.util.Locale;
import java.util.TimeZone;
import jp.co.intra_mart.foundation.context.Contexts;
import jp.co.intra_mart.foundation.context.model.AccountContext;

final AccountContext account = Contexts.get(AccountContext.class);
final Locale locale = account.getLocale();
final TimeZone timeZone = account.getTimeZone();

final SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd", locale);
sdf.setTimeZone(timeZone);
```

## Pattern 3: Getting the User's Organization Info

```java
import jp.co.intra_mart.foundation.context.Contexts;
import jp.co.intra_mart.foundation.user_context.model.Department;
import jp.co.intra_mart.foundation.user_context.model.UserContext;

final UserContext userCtx = Contexts.get(UserContext.class);
final Department mainDept = userCtx.getMainDepartment();
if (mainDept != null) {
    final String deptCd = mainDept.getDepartmentCd();
    final String deptName = mainDept.getDepartmentName();
    final String companyCd = mainDept.getCompanyCd();
    // mainDept is null for a user with no main department — always null-check it
}
```

## Pattern 4: Getting User Profile Info

```java
import jp.co.intra_mart.foundation.context.Contexts;
import jp.co.intra_mart.foundation.user_context.model.UserContext;
import jp.co.intra_mart.foundation.user_context.model.UserProfile;

final UserContext userCtx = Contexts.get(UserContext.class);
final UserProfile profile = userCtx.getUserProfile();
// getUserProfile() can return null even when UserContext itself was retrieved successfully
// (e.g. when the execution user is a technical account with no matching IM Common Master record)
if (profile != null) {
    final String userName = profile.getUserName();
    final String email = profile.getEmailAddress1();
    // Never log userName / email (personal information)
}
```

## Pattern 5: Getting Parameters Inside a Job (Extending `BaseJob`)

```java
import jp.co.intra_mart.foundation.job_scheduler.BaseJob;
import jp.co.intra_mart.foundation.job_scheduler.JobResult;
import jp.co.intra_mart.foundation.job_scheduler.exception.InvalidParameterException;
import jp.co.intra_mart.foundation.job_scheduler.exception.JobExecuteException;

public class {JobName}Job extends BaseJob {

    @Override
    public JobResult execute() throws JobExecuteException {
        try {
            // Required parameter (InvalidParameterException if missing)
            final String targetCd = getParameter("targetCd");

            // Optional parameter (returns the default value if missing, no exception)
            final String mode = getParameter("mode", "default");
            final int retryCount = getParameterAsInteger("retryCount", 3);

            // Business logic
            return JobResult.success("Processing completed");

        } catch (final InvalidParameterException e) {
            throw new JobExecuteException("A required parameter was not specified: " + e.getMessage(), e);
        }
    }
}
```

You can also retrieve `JobSchedulerContext` directly via `Contexts.get(JobSchedulerContext.class)`, but when extending `BaseJob`, prefer its `protected` utility methods (`getParameter()` / `getParameterAsInteger()`, etc.), which already implement null checks, type conversion, and default-value handling.

**`JobResult` has no constant such as `SUCCESS`.** Create one via the static factory methods
`success(String)` / `waring(String)` (**note the platform's actual spelling — `waring`, not "warning". Calling `warning(String)` does not compile, since no such method exists**) / `error(String)`, passing a message. See `reference/contexts-api-reference.md` for details.

## Pattern 6: Client Type / External-User Detection

```java
import jp.co.intra_mart.foundation.context.Contexts;
import jp.co.intra_mart.foundation.context.model.ClientContext;
import jp.co.intra_mart.foundation.context.model.ExternalUserContext;

final ClientContext clientCtx = Contexts.get(ClientContext.class);
final String clientTypeId = clientCtx.getClientTypeId();

final ExternalUserContext externalCtx = Contexts.get(ExternalUserContext.class);
if (externalCtx.isExternalUser()) {
    // Branch for external-user-specific processing
}
```

## Anti-Patterns

| Pattern | Problem | Fix |
|---|---|---|
| Null-checking the return value of `Contexts.get()` | Dead code that never executes (`Contexts.get()` never returns null — it throws `ContextNotFoundException` instead when unavailable) | Instead of a null check, consider catching `ContextNotFoundException` in environments where the context may be unavailable |
| Missing a null check on a nested getter's return value (e.g. `getMainDepartment()` / `getUserProfile()`) | `NullPointerException` | Unlike `Contexts.get()` itself, these can genuinely return null by spec (`getUserProfile()` is undocumented in the platform's own JavaDoc) — check them |
| Missing authentication check | Business processing runs for an unauthenticated user | Check `isAuthenticated()` |
| Holding/caching a context in a field | User info gets mixed up across requests | Retrieve it fresh within each method |
| Retrieving `UserContext` inside a job | May not be retrievable depending on the execution environment | Use `JobSchedulerContext` (via `BaseJob`) instead |
| Calling `Contexts` directly from the infrastructure layer (DAO/Repository) | Violates the layer dependency rule | Pass values in as arguments from the service layer |
| Logging `UserProfile` personal info (name, email, etc.) | Risk of personal information leakage | Log only the user code |
| Using `getLoginGroupId()` in new code | Dependency on a deprecated (`@Deprecated`) property | Use `getTenantId()` instead |
