# Contexts API Reference (Java Version)

Based on the actual class definitions in the intra-mart Accel Platform core source (`im_core_base` / `im_user_context` / `im_job_scheduler_base` modules). Do not supplement methods from memory or guesswork.

## Package Structure

```
jp.co.intra_mart.foundation.context (im_core_base)
├── Contexts                     … Public API. get(Class) is the sole entry point
├── ContextStatus                … Shortcut for authentication/administrator checks
├── ContextNotFoundException     … Unchecked exception (a RuntimeException subclass)
└── model
    ├── Context                  … Common marker interface for all Context interfaces
    ├── AccountContext           … Account, authentication, locale info
    ├── ClientContext            … Client type
    ├── ExternalUserContext      … External-user detection
    └── UserType                 … Enum representing the user type

jp.co.intra_mart.foundation.user_context.model (im_user_context)
├── UserContext                  … User profile and organization info
├── UserProfile
├── Department / DepartmentPost
├── Company
├── PublicGroup / PublicGroupRole
└── UserCategory

jp.co.intra_mart.foundation.job_scheduler (im_job_scheduler_base)
├── JobSchedulerContext          … Job execution context
└── BaseJob                      … Base class for job implementations (provides utilities to obtain JobSchedulerContext)
```

## The `Contexts` Class

```java
package jp.co.intra_mart.foundation.context;

public final class Contexts {

    /**
     * Retrieves an access context.
     * Retrieves the access context matching the argument from the access context store and returns it.
     * The available access context types are provided per environment.
     * @param <T> the class representing the context type
     * @param type the context type (the interface type representing the kind of access context)
     * @return the access context instance matching the argument
     * @throws ContextNotFoundException thrown when attempting to retrieve an access context undefined in the system.
     */
    public static <T extends Context> T get(final Class<T> type);
}
```

- A utility class with only a `private` constructor (cannot be instantiated)
- Internally delegates context resolution to `ContextProducer` (`jp.co.intra_mart.system.context.ContextProducer`)
- **`ContextNotFoundException` is a subclass of `RuntimeException` — an unchecked exception.** The method
  signature carries no `throws` declaration (the `@throws` in the JavaDoc is documentation only; the compiler does not require a `catch` or `throws` declaration)

## The `ContextStatus` Class

```java
package jp.co.intra_mart.foundation.context;

public final class ContextStatus {

    /** Determined from AccountContext's user type. */
    public static boolean isAdministrator();

    /** Determined from AccountContext's authentication state. */
    public static boolean isAuthenticated();

    /**
     * Checks the integrity of the account context's login signature.
     * Always false for an unauthenticated user.
     */
    public static boolean validate();
}
```

- A thin wrapper that internally just calls `Contexts.get(AccountContext.class)`. If you also need other `AccountContext` information, avoid mixing calls through `ContextStatus` with direct `Contexts.get(AccountContext.class)` calls — reuse a locally retrieved instance instead (holding it in a field is still forbidden; reuse as a local variable within a method is fine)

## The `AccountContext` Interface

Package: `jp.co.intra_mart.foundation.context.model` (`im_core_base`)

> An access context holding information about the accessing account. Provides account information such as
> the user code and locale, and the authentication state. **A required access context, always retrievable
> while the system is running.**
> Each setting value is resolved in the order: account settings → tenant account settings → browser info →
> system default account settings → server environment settings.

```java
public interface AccountContext extends Context {

    /** Returns the list of application licenses. */
    Set<String> getApplicationLicenses();

    /** Returns the calendar ID. */
    String getCalendarId();

    /**
     * Returns the list of date/time display formats. Used by internal APIs; you typically do not need
     * to use this directly.
     * @see jp.co.intra_mart.foundation.i18n.datetime.format.SystemDateTimeFormat#getFormats
     */
    Map<String, String> getDateTimeFormats();

    /** Returns the numeric format ID. @since 8.0.15 */
    String getDecimalFormatId();

    /** Returns the character encoding. */
    String getEncoding();

    /**
     * Returns the first day of the week. The returned value matches one of
     * java.util.Calendar#SUNDAY through SATURDAY.
     */
    int getFirstDayOfWeek();

    /** Returns the home URL. */
    String getHomeUrl();

    /** Returns the locale. */
    Locale getLocale();

    /**
     * Returns the login group ID. Equal to the tenant ID.
     * @deprecated A compatibility-only property. Do not use it normally; use {@link #getTenantId()} instead.
     */
    @Deprecated
    String getLoginGroupId();

    /** Returns the login time. */
    Date getLoginTime();

    /** Returns the list of role IDs. Includes sub-roles. */
    Set<String> getRoleIds();

    /** Returns the login signature. */
    String getSignature();

    /**
     * Returns the tenant ID. The tenant ID corresponding to the accessing user is returned.
     * For processing that does not depend on a user, such as at system startup, null is returned.
     * @since 8.0.7
     */
    String getTenantId();

    /** Returns the theme ID. */
    String getThemeId();

    /** Returns the time zone. */
    TimeZone getTimeZone();

    /**
     * Returns the user code. For the system administrator, the administrator's user code is returned;
     * for an unauthenticated user, a code representing the unauthenticated user is returned.
     * Never use this code alone for processing — combine it with getUserType() / isAuthenticated().
     */
    String getUserCd();

    /** Returns the user type. */
    UserType getUserType();

    /** Returns the authentication state. true if authenticated. */
    boolean isAuthenticated();
}
```

### The `UserType` Enum

Package: `jp.co.intra_mart.foundation.context.model`

```java
public enum UserType {
    ADMINISTRATOR("administrator"),  // System administrator
    USER("user"),                    // General user
    PLATFORM("platform");            // Platform

    public static UserType value(final String value); // String -> enum constant (uppercases then valueOf)
    @Override
    public String toString(); // Returns the string form above ("administrator" etc.)
}
```

## The `ClientContext` Interface

Package: `jp.co.intra_mart.foundation.context.model` (`im_core_base`)

```java
public interface ClientContext extends Context {
    /** Returns the system-defined client type ID. */
    String getClientTypeId();
}
```

## The `ExternalUserContext` Interface

Package: `jp.co.intra_mart.foundation.context.model` (`im_core_base`, `@since 8.0.13`)

```java
public interface ExternalUserContext extends Context {
    /** Returns whether the user is an external user. */
    boolean isExternalUser();
}
```

## The `UserContext` Interface

Package: `jp.co.intra_mart.foundation.user_context.model` (`im_user_context`)

> Retrieves the user information from the IM Common Master for the user identified by
> `AccountContext.getUserCd()`. **Organization affiliation information is limited to the default
> organization set — sets other than the default cannot be handled.**

```java
public interface UserContext extends Context {

    /** Returns all departments the user belongs to. */
    List<Department> getAllDepartments();

    /** Returns all department posts the user holds. */
    List<DepartmentPost> getAllPosts();

    /** Returns all companies the user belongs to. */
    List<Company> getCompanyList();

    /** Returns the current department. */
    Department getCurrentDepartment();

    /** Returns all departments the user belongs to, grouped by company. */
    Map<String, List<Department>> getDepartmentByCompany();

    /** Returns the user's main department. Returns null if the user has no main department. */
    Department getMainDepartment();

    /** Returns the user's main department post(s). */
    List<DepartmentPost> getMainPostList();

    /** Returns all department posts the user holds, grouped by company. */
    Map<String, List<DepartmentPost>> getPostByCompany();

    /** Returns all public groups the user belongs to. */
    List<PublicGroup> getPublicGroupList();

    /** Returns all public group roles the user holds. */
    List<PublicGroupRole> getPublicGroupRoleList();

    /** Returns the user categories the user belongs to. */
    List<UserCategory> getUserCategoryList();

    /** Returns the user's profile. */
    UserProfile getUserProfile();
}
```

`Department` / `Company` / `DepartmentPost` / `PublicGroup` / `PublicGroupRole` / `UserCategory` all share the same locale-resolution rule for their locale-dependent data: the logged-in user's locale → the tenant's locale → the system locale → an undefined-name placeholder, in that order.

**`getUserProfile()` can return `null` (not documented in the platform's own JavaDoc).** In a job
scheduler execution environment, `Contexts.get(UserContext.class)` succeeded without an exception, yet `getUserProfile()` returned `null`. This is presumed to be because the execution user (`AccountContext.getUserCd()`) was a technical account (e.g. one used for job execution) with no matching record in the IM Common Master. Successfully retrieving `UserContext` does not guarantee that `getUserProfile()` returns non-`null` — callers must always null-check its return value.

### `UserProfile`

```java
public interface UserProfile extends UserBizKeyConvertible, Serializable {
    String getAddress1();
    String getAddress2();
    String getAddress3();
    String getCountryCd();
    String getEmailAddress1();
    String getEmailAddress2();
    String getExtensionFaxNumber();
    String getExtensionNumber();
    String getFaxNumber();
    String getMobileEmailAddress();
    String getMobileNumber();
    String getNotes();
    String getSex();
    String getTelephoneNumber();
    String getUrl();
    String getUserCd();
    String getUserName();
    String getUserSearchName();
    String getZipCode();
}
```

### `Department`

```java
public interface Department extends DepartmentBizKeyConvertible, Serializable {
    String getCompanyCd();
    String getDepartmentCd();
    String getDepartmentFullName();
    String getDepartmentName();
    String getDepartmentSearchName();
    String getDepartmentSetCd();
    String getDepartmentShortName();
}
```

### `Company`

```java
public interface Company extends CompanyBizKeyConvertible, Serializable {
    String getCompanyCd();
    String getCompanyName();
    String getCompanySearchName();
    String getCompanyShortName();
}
```

### `DepartmentPost` (`Department`'s properties plus post information)

```java
public interface DepartmentPost extends DepartmentBizKeyConvertible, CompanyPostBizKeyConvertible, Serializable {
    String getCompanyCd();
    String getDepartmentCd();
    String getDepartmentFullName();
    String getDepartmentName();
    String getDepartmentSearchName();
    String getDepartmentSetCd();
    String getDepartmentShortName();
    String getPostCd();
    String getPostName();
    int getRank();
}
```

### `PublicGroup`

```java
public interface PublicGroup extends PublicGroupBizKeyConvertible, Serializable {
    String getPublicGroupCd();
    String getPublicGroupFullName();
    String getPublicGroupName();
    String getPublicGroupSearchName();
    String getPublicGroupSetCd();
    String getPublicGroupShortName();
}
```

### `PublicGroupRole` (`PublicGroup`'s properties plus role information)

```java
public interface PublicGroupRole extends PublicGroupBizKeyConvertible, PublicGroupRoleBizKeyConvertible, Serializable {
    String getPublicGroupCd();
    String getPublicGroupFullName();
    String getPublicGroupName();
    String getPublicGroupSearchName();
    String getPublicGroupSetCd();
    String getPublicGroupShortName();
    int getRank();
    String getRoleCd();
    String getRoleName();
}
```

### `UserCategory`

```java
public interface UserCategory extends UserCtgItmBizKeyConvertible, Serializable {
    String getCategoryCd();
    String getCategoryItemCd();
    String getCategoryItemName();
    String getCategoryName();
}
```

## The `JobSchedulerContext` Interface

Package: `jp.co.intra_mart.foundation.job_scheduler` (`im_job_scheduler_base`)

> A context stored when the job scheduler service invokes job execution processing. Holds information
> about the executed jobnet, IDs for retrieving the running monitor/task, execution parameters shared
> within the jobnet, and other information related to the jobnet's execution.

```java
public interface JobSchedulerContext extends Context {

    /** Returns the jobnet. */
    Jobnet getJobnet();

    /** Returns the job detail. */
    JobDetail getJobDetail();

    /** Returns the trigger. */
    Trigger getTrigger();

    /** Returns the monitor ID. */
    String getMonitorId();

    /** Returns the task ID. */
    String getTaskId();

    /** Returns the fire date (not the current time, but the date/time the trigger's schedule says it should fire). */
    Date getFireDate();

    /** Returns the previous fire date. null if this is the first execution. */
    Date getPreviousFireDate();

    /** Returns the next fire date. null if this is the final trigger occasion. */
    Date getNextFireDate();

    /**
     * Returns parameters added to the running parameters.
     * Returns only parameters added via putParameter(String, String); does not include parameters
     * configured on the job, jobnet, or trigger.
     */
    Map<String, String> getParameters();

    /**
     * Returns a parameter map merged from each parameter source according to priority.
     * A map with values overwritten in order: job, jobnet, trigger, running.
     */
    Map<String, String> getMergedParameters();

    /**
     * Returns the parameter for the given key according to priority.
     * Returns the value for the given key from the first source, in order: running → trigger →
     * jobnet → job (null if present in none of them).
     */
    String getParameter(final String key);

    /** Adds the given parameter to the running parameters. Returned preferentially by getParameter(). */
    void putParameter(final String key, final String value);

    /** Adds all given parameters to the running parameters. */
    void putParameters(final Map<String, String> map);
}
```

Parameter priority is "running parameters (added via `putParameter`) > trigger > jobnet > job". If the same key is set on both the job and the jobnet, the jobnet's value takes precedence.

## The `BaseJob` Class (Base Class for Job Implementations)

Package: `jp.co.intra_mart.foundation.job_scheduler` (`im_job_scheduler_base`)

```java
public abstract class BaseJob implements Job {

    @Override
    public abstract JobResult execute() throws JobExecuteException;

    /** Returns the job context (a wrapper around Contexts.get(JobSchedulerContext.class)). */
    protected JobSchedulerContext getJobContext();

    /**
     * Returns the parameter obtained from JobSchedulerContext for the given key.
     * @throws InvalidParameterException if the retrieved parameter was null
     */
    protected String getParameter(final String key) throws InvalidParameterException;

    /**
     * Returns the parameter for the given key. Returns the default value if it could not be retrieved
     * (no exception is thrown).
     */
    protected String getParameter(final String key, final String defaultValue);

    /**
     * Returns the parameter for the given key, converted to int.
     * @throws InvalidParameterException if the parameter was null or not a valid int
     */
    protected int getParameterAsInteger(final String key) throws InvalidParameterException;

    /** The int-conversion overload with a default value (returns the default on conversion failure too, no exception). */
    protected int getParameterAsInteger(final String key, final int defaultValue);
}
```

- Job implementations (classes implementing the `Job` interface) typically extend `BaseJob` and implement
  `execute()` as the standard pattern
- Retrieving parameters via `BaseJob`'s `protected` methods saves you from re-implementing null checks,
  type conversion, and default-value handling every time, compared to retrieving `JobSchedulerContext` directly via `Contexts.get()`

## The `JobResult` Class (`execute()`'s Return Type)

Package: `jp.co.intra_mart.foundation.job_scheduler` (`im_job_scheduler_base`)

```java
public class JobResult {

    /** Creates a new job execution result. */
    public JobResult(final Status status, final String message);

    /** Creates an execution result indicating the job processing completed successfully. */
    public static JobResult success(final String message);

    /**
     * Creates an execution result indicating a warning occurred during job processing (an error the
     * jobnet can continue past). When this result is returned, the job scheduler service continues the
     * jobnet.
     */
    public static JobResult waring(final String message);

    /**
     * Creates an execution result indicating an error occurred during job processing (an error the
     * jobnet cannot continue past). When this result is returned, the job scheduler service ends the
     * jobnet without continuing.
     */
    public static JobResult error(final String message);

    public Status getStatus();
    public String getMessage();
}
```

- **There is no constant such as `JobResult.SUCCESS`.** Always create an instance via one of the static
  factory methods `success(String)` / `waring(String)` / `error(String)`, passing a message
- **The warning method's actual spelling is `waring` (not "warning").** This is how the platform's own
  implementation spells it; calling `warning(String)` fails to compile since no such method exists. Do not "correct" the spelling when calling it

## Reference Documentation

- Contexts JavaDoc: `jp.co.intra_mart.foundation.context.Contexts`
- AccountContext JavaDoc: `jp.co.intra_mart.foundation.context.model.AccountContext`
- UserContext JavaDoc: `jp.co.intra_mart.foundation.user_context.model.UserContext`
- JobSchedulerContext JavaDoc: `jp.co.intra_mart.foundation.job_scheduler.JobSchedulerContext`
