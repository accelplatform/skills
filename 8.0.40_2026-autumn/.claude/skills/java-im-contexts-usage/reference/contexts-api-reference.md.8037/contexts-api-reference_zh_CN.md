# Contexts API 参考（Java 版）

基于 intra-mart Accel Platform 核心源码（`im_core_base` / `im_user_context` / `im_job_scheduler_base` 模块）的实际类定义。不要凭记忆或推测补充方法。

## 包结构

```
jp.co.intra_mart.foundation.context（im_core_base）
├── Contexts                     … 公开 API。get(Class) 是唯一入口点
├── ContextStatus                … 认证/管理员判定的快捷方式
├── ContextNotFoundException     … 非受检异常（RuntimeException 的子类）
└── model
    ├── Context                  … 所有 Context 接口的公共标记接口
    ├── AccountContext           … 账户、认证、区域设置信息
    ├── ClientContext            … 客户端类型
    ├── ExternalUserContext      … 外部用户判定
    └── UserType                 … 表示用户种别的枚举类型

jp.co.intra_mart.foundation.user_context.model（im_user_context）
├── UserContext                  … 用户资料与组织信息
├── UserProfile
├── Department / DepartmentPost
├── Company
├── PublicGroup / PublicGroupRole
└── UserCategory

jp.co.intra_mart.foundation.job_scheduler（im_job_scheduler_base）
├── JobSchedulerContext          … 任务执行上下文
└── BaseJob                      … 任务实现的基类（提供获取 JobSchedulerContext 的工具方法）
```

## `Contexts` 类

```java
package jp.co.intra_mart.foundation.context;

public final class Contexts {

    /**
     * 获取访问上下文。
     * 从访问上下文存储区中获取与参数匹配的访问上下文并返回。
     * 可用的访问上下文种类因环境而异。
     * @param <T> 表示上下文种类的类
     * @param type 上下文种类（表示访问上下文种类的接口类型）
     * @return 与参数匹配的访问上下文实例
     * @throws ContextNotFoundException 尝试获取系统中未定义的访问上下文时抛出。
     */
    public static <T extends Context> T get(final Class<T> type);
}
```

- 仅有 `private` 构造方法的工具类（不可实例化）
- 内部将上下文解析委托给 `ContextProducer`（`jp.co.intra_mart.system.context.ContextProducer`）
- **`ContextNotFoundException` 是 `RuntimeException` 的子类，属于非受检异常。** 方法签名上未附加
  `throws` 声明（JavaDoc 中的 `@throws` 仅用于文档目的，编译器不强制要求 `catch` 或 `throws` 声明）

## `ContextStatus` 类

```java
package jp.co.intra_mart.foundation.context;

public final class ContextStatus {

    /** 根据 AccountContext 的用户种别判定。 */
    public static boolean isAdministrator();

    /** 根据 AccountContext 的认证状况判定。 */
    public static boolean isAuthenticated();

    /**
     * 检查账户上下文登录签名的完整性。
     * 未认证用户始终返回 false。
     */
    public static boolean validate();
}
```

- 内部只是调用 `Contexts.get(AccountContext.class)` 的薄封装。若还需要 `AccountContext` 的其他信息，避免将通过 `ContextStatus` 的调用与直接调用 `Contexts.get(AccountContext.class)` 混用，应复用已获取的实例（禁止保存在字段中；在方法内作为局部变量复用则没有问题）

## `AccountContext` 接口

包：`jp.co.intra_mart.foundation.context.model`（`im_core_base`）

> 保存访问账户相关信息的访问上下文。可获取用户代码、区域设置等账户信息及认证状况。
> **是必需的访问上下文，运行期间始终可获取。**
> 各设置值按 账户设置信息 → 租户账户设置信息 → 浏览器信息 → 系统默认账户设置信息 → 服务器
> 环境设置信息 的顺序解析。

```java
public interface AccountContext extends Context {

    /** 获取应用许可证列表。 */
    Set<String> getApplicationLicenses();

    /** 获取日历ID。 */
    String getCalendarId();

    /**
     * 获取日期时间显示格式列表。供内部 API 使用，通常无需直接使用。
     * @see jp.co.intra_mart.foundation.i18n.datetime.format.SystemDateTimeFormat#getFormats
     */
    Map<String, String> getDateTimeFormats();

    /** 获取数值格式ID。 @since 8.0.15 */
    String getDecimalFormatId();

    /** 获取字符编码。 */
    String getEncoding();

    /**
     * 获取一周的起始星期。取值与 java.util.Calendar#SUNDAY 至 SATURDAY 相同。
     */
    int getFirstDayOfWeek();

    /** 获取主页URL。 */
    String getHomeUrl();

    /** 获取区域设置。 */
    Locale getLocale();

    /**
     * 获取登录组ID。与租户ID相同的值。
     * @deprecated 仅用于兼容的属性，通常不应使用，请使用 {@link #getTenantId()}。
     */
    @Deprecated
    String getLoginGroupId();

    /** 获取登录时间。 */
    Date getLoginTime();

    /** 获取角色ID列表。包含子角色。 */
    Set<String> getRoleIds();

    /** 获取登录签名。 */
    String getSignature();

    /**
     * 获取租户ID。返回与访问用户对应的租户ID。
     * 对于系统启动等不依赖用户的处理，返回 null。
     * @since 8.0.7
     */
    String getTenantId();

    /** 获取主题ID。 */
    String getThemeId();

    /** 获取时区。 */
    TimeZone getTimeZone();

    /**
     * 获取用户代码。系统管理员时返回系统管理员的用户代码，未认证用户时返回表示未认证用户的用户代码。
     * 不要仅凭此代码进行处理，务必与 getUserType() / isAuthenticated() 结合使用。
     */
    String getUserCd();

    /** 获取用户种别。 */
    UserType getUserType();

    /** 获取认证状况。已认证时返回 true。 */
    boolean isAuthenticated();
}
```

### `UserType` 枚举

包：`jp.co.intra_mart.foundation.context.model`

```java
public enum UserType {
    ADMINISTRATOR("administrator"),  // 系统管理员
    USER("user"),                    // 一般用户
    PLATFORM("platform");            // 平台

    public static UserType value(final String value); // 字符串 → 枚举常量（转大写后 valueOf）
    @Override
    public String toString(); // 返回上述字符串表示（"administrator" 等）
}
```

## `ClientContext` 接口

包：`jp.co.intra_mart.foundation.context.model`（`im_core_base`）

```java
public interface ClientContext extends Context {
    /** 获取系统定义的客户端类型ID。 */
    String getClientTypeId();
}
```

## `ExternalUserContext` 接口

包：`jp.co.intra_mart.foundation.context.model`（`im_core_base`，`@since 8.0.13`）

```java
public interface ExternalUserContext extends Context {
    /** 获取是否为外部用户。 */
    boolean isExternalUser();
}
```

## `UserContext` 接口

包：`jp.co.intra_mart.foundation.user_context.model`（`im_user_context`）

> 从 IM 通用主数据中获取与 `AccountContext.getUserCd()` 对应的用户信息。
> **组织所属信息仅限于默认组织集，无法处理默认组织集以外的信息。**

```java
public interface UserContext extends Context {

    /** 获取用户所属的全部组织。 */
    List<Department> getAllDepartments();

    /** 获取用户所属的全部组织职位。 */
    List<DepartmentPost> getAllPosts();

    /** 获取用户所属的全部公司。 */
    List<Company> getCompanyList();

    /** 获取当前组织。 */
    Department getCurrentDepartment();

    /** 按公司获取用户所属的全部组织。 */
    Map<String, List<Department>> getDepartmentByCompany();

    /** 获取用户的主所属组织。若无主所属，返回 null。 */
    Department getMainDepartment();

    /** 获取用户主所属的组织职位。 */
    List<DepartmentPost> getMainPostList();

    /** 按公司获取用户所属的全部组织职位。 */
    Map<String, List<DepartmentPost>> getPostByCompany();

    /** 获取用户所属的全部公共组。 */
    List<PublicGroup> getPublicGroupList();

    /** 获取用户所属的全部公共组角色。 */
    List<PublicGroupRole> getPublicGroupRoleList();

    /** 获取用户所属的用户分类。 */
    List<UserCategory> getUserCategoryList();

    /** 获取用户资料。 */
    UserProfile getUserProfile();
}
```

`Department` / `Company` / `DepartmentPost` / `PublicGroup` / `PublicGroupRole` / `UserCategory` 均具有相同的区域设置解析规则："与区域设置相关的数据按 登录用户的区域设置 → 租户区域设置 → 系统区域设置 → 名称未定义 的顺序解析"。

**`getUserProfile()` 可能返回 `null`（平台自身的 JavaDoc 未记载此行为）。**
在任务调度器执行环境中，`Contexts.get(UserContext.class)` 未抛出异常即成功获取，但 `getUserProfile()` 却返回了 `null`。推测原因是执行用户（`AccountContext.getUserCd()`）是 IM 通用主数据中没有对应记录的技术账号（如任务执行专用账号）。成功获取 `UserContext` 并不保证 `getUserProfile()` 一定返回非 `null` 值——调用方必须始终对其返回值进行空值检查。

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

### `DepartmentPost`（`Department` 的属性 + 职位信息）

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

### `PublicGroupRole`（`PublicGroup` 的属性 + 角色信息）

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

## `JobSchedulerContext` 接口

包：`jp.co.intra_mart.foundation.job_scheduler`（`im_job_scheduler_base`）

> 任务调度器服务调用任务执行处理时存入存储区的上下文。保存已执行任务网相关信息、用于获取正在
> 运行的监视器/任务的ID、任务网内共享的运行中参数等与任务网执行相关的全部信息。

```java
public interface JobSchedulerContext extends Context {

    /** 获取任务网。 */
    Jobnet getJobnet();

    /** 获取任务详情。 */
    JobDetail getJobDetail();

    /** 获取触发器。 */
    Trigger getTrigger();

    /** 获取监视器ID。 */
    String getMonitorId();

    /** 获取任务ID。 */
    String getTaskId();

    /** 获取执行日期时间（非当前时间，而是按触发器调度定义应执行的日期时间）。 */
    Date getFireDate();

    /** 获取上次执行日期时间。首次执行时为 null。 */
    Date getPreviousFireDate();

    /** 获取下次执行日期时间。最后一次触发时机时为 null。 */
    Date getNextFireDate();

    /**
     * 获取添加到运行中参数的参数。
     * 仅返回通过 putParameter(String, String) 添加的参数，不包含设置在任务、任务网、
     * 触发器上的参数。
     */
    Map<String, String> getParameters();

    /**
     * 获取按优先级从各参数合并后的参数映射。
     * 按 任务、任务网、触发器、运行中 的顺序覆盖后的参数映射。
     */
    Map<String, String> getMergedParameters();

    /**
     * 按优先级获取指定键的参数。
     * 按 运行中 → 触发器 → 任务网 → 任务 的顺序，返回第一个存在指定键的参数值
     * （若均不存在则为 null）。
     */
    String getParameter(final String key);

    /** 向运行中参数添加指定的参数。会被 getParameter() 优先返回。 */
    void putParameter(final String key, final String value);

    /** 向运行中参数添加指定的全部参数。 */
    void putParameters(final Map<String, String> map);
}
```

参数优先级为"运行中参数（通过 `putParameter` 添加）> 触发器 > 任务网 > 任务"。若同一键同时设置在任务和任务网上，则任务网一侧的值优先。

## `BaseJob` 类（任务实现的基类）

包：`jp.co.intra_mart.foundation.job_scheduler`（`im_job_scheduler_base`）

```java
public abstract class BaseJob implements Job {

    @Override
    public abstract JobResult execute() throws JobExecuteException;

    /** 获取任务上下文（Contexts.get(JobSchedulerContext.class) 的封装）。 */
    protected JobSchedulerContext getJobContext();

    /**
     * 按指定键从 JobSchedulerContext 获取参数并返回。
     * @throws InvalidParameterException 获取到的参数为 null 时抛出
     */
    protected String getParameter(final String key) throws InvalidParameterException;

    /**
     * 按指定键获取参数。若无法获取则返回默认值（不抛出异常）。
     */
    protected String getParameter(final String key, final String defaultValue);

    /**
     * 按指定键获取参数并转换为 int。
     * @throws InvalidParameterException 参数为 null 或无法转换为合法 int 值时抛出
     */
    protected int getParameterAsInteger(final String key) throws InvalidParameterException;

    /** 带默认值的 int 转换重载（转换失败时同样返回默认值，不抛出异常）。 */
    protected int getParameterAsInteger(final String key, final int defaultValue);
}
```

- 任务实现（`Job` 接口的实现类）通常继承此 `BaseJob` 并实现 `execute()`，这是标准模式
- 相比直接通过 `Contexts.get()` 获取 `JobSchedulerContext`，通过 `BaseJob` 的 `protected` 方法
  获取参数可省去每次编写空值判断、类型转换、默认值处理的工作

## `JobResult` 类（`execute()` 的返回值）

包：`jp.co.intra_mart.foundation.job_scheduler`（`im_job_scheduler_base`）

```java
public class JobResult {

    /** 生成新的任务执行结果。 */
    public JobResult(final Status status, final String message);

    /** 生成表示任务处理正常结束的执行结果。 */
    public static JobResult success(final String message);

    /**
     * 生成表示任务处理中发生警告（任务网可继续执行的错误）的执行结果。
     * 返回该结果时，任务调度器服务会继续执行任务网。
     */
    public static JobResult waring(final String message);

    /**
     * 生成表示任务处理中发生错误（任务网无法继续执行的错误）的执行结果。
     * 返回该结果时，任务调度器服务会结束任务网而不再继续。
     */
    public static JobResult error(final String message);

    public Status getStatus();
    public String getMessage();
}
```

- **不存在 `JobResult.SUCCESS` 之类的常量。** 必须通过静态工厂方法 `success(String)` / `waring(String)` /
  `error(String)` 之一并传入消息来生成实例
- **警告方法的实际拼写是 `waring`（而非 "warning"）。** 这是平台自身实现的拼写方式；调用
  `warning(String)` 会因方法不存在而编译失败。调用时不要"更正"拼写

## 参考文档

- Contexts JavaDoc：`jp.co.intra_mart.foundation.context.Contexts`
- AccountContext JavaDoc：`jp.co.intra_mart.foundation.context.model.AccountContext`
- UserContext JavaDoc：`jp.co.intra_mart.foundation.user_context.model.UserContext`
- JobSchedulerContext JavaDoc：`jp.co.intra_mart.foundation.job_scheduler.JobSchedulerContext`
