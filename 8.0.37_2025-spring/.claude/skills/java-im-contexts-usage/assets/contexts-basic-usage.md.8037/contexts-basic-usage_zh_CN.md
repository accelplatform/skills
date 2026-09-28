# Contexts API 基本使用模式（Java 版）

基于 `reference/contexts-api-reference.md` 中方法签名的实现模式集合。实际的方法名和返回值类型务必参考该文档确认，不要凭记忆或推测编写。

## 模式1：在服务层获取用户信息、进行认证检查

```java
import jp.co.intra_mart.foundation.context.Contexts;
import jp.co.intra_mart.foundation.context.model.AccountContext;

public class {ServiceName}Service {

    public void process() {
        // Contexts.get() 不会返回 null（无法获取时会抛出 ContextNotFoundException），
        // 因此无需对 account 进行空值检查（AccountContext 是必需上下文，通常也不会抛出该异常）
        final AccountContext account = Contexts.get(AccountContext.class);
        if (!account.isAuthenticated()) {
            throw new {ServiceName}ServiceException("需要已认证的用户");
        }
        final String userCd = account.getUserCd();
        final String tenantId = account.getTenantId();
        // 使用 userCd / tenantId 的业务处理
    }
}
```

使用 `ContextStatus` 可以写得更简洁（但若还需要 `userCd` 等信息，最终仍需获取 `AccountContext`）。

```java
import jp.co.intra_mart.foundation.context.ContextStatus;

if (!ContextStatus.isAuthenticated()) {
    throw new {ServiceName}ServiceException("需要已认证的用户");
}
```

## 模式2：使用区域设置/时区实现国际化

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

## 模式3：获取用户所属组织信息

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
    // 对于没有主所属的用户，mainDept 会为 null，务必进行空值检查
}
```

## 模式4：获取用户资料信息

```java
import jp.co.intra_mart.foundation.context.Contexts;
import jp.co.intra_mart.foundation.user_context.model.UserContext;
import jp.co.intra_mart.foundation.user_context.model.UserProfile;

final UserContext userCtx = Contexts.get(UserContext.class);
final UserProfile profile = userCtx.getUserProfile();
// 即使 UserContext 本身获取成功，getUserProfile() 仍可能返回 null
// （例如执行用户是在 IM 通用主数据中没有对应记录的技术账号时）
if (profile != null) {
    final String userName = profile.getUserName();
    final String email = profile.getEmailAddress1();
    // userName / email 不要输出到日志（属于个人信息）
}
```

## 模式5：在任务中获取参数（继承 `BaseJob`）

```java
import jp.co.intra_mart.foundation.job_scheduler.BaseJob;
import jp.co.intra_mart.foundation.job_scheduler.JobResult;
import jp.co.intra_mart.foundation.job_scheduler.exception.InvalidParameterException;
import jp.co.intra_mart.foundation.job_scheduler.exception.JobExecuteException;

public class {JobName}Job extends BaseJob {

    @Override
    public JobResult execute() throws JobExecuteException {
        try {
            // 必需参数（不存在时抛出 InvalidParameterException）
            final String targetCd = getParameter("targetCd");

            // 可选参数（不存在时返回默认值，不抛出异常）
            final String mode = getParameter("mode", "default");
            final int retryCount = getParameterAsInteger("retryCount", 3);

            // 业务处理
            return JobResult.success("处理已完成");

        } catch (final InvalidParameterException e) {
            throw new JobExecuteException("未指定必需参数：" + e.getMessage(), e);
        }
    }
}
```

也可以直接通过 `Contexts.get(JobSchedulerContext.class)` 获取 `JobSchedulerContext`，但若继承了 `BaseJob`，应优先使用其提供的 `protected` 方法（`getParameter()` / `getParameterAsInteger()` 等），这些方法已经实现了空值判断、类型转换、默认值处理。

**`JobResult` 不存在 `SUCCESS` 等常量。** 必须通过静态工厂方法 `success(String)` / `waring(String)`
（**注意平台实际的拼写是 `waring`，而非 "warning"。调用 `warning(String)` 会因方法不存在而编译失败**）/ `error(String)` 之一并传入消息来生成。详情请参考 `reference/contexts-api-reference.md`。

## 模式6：客户端类型、外部用户判定

```java
import jp.co.intra_mart.foundation.context.Contexts;
import jp.co.intra_mart.foundation.context.model.ClientContext;
import jp.co.intra_mart.foundation.context.model.ExternalUserContext;

final ClientContext clientCtx = Contexts.get(ClientContext.class);
final String clientTypeId = clientCtx.getClientTypeId();

final ExternalUserContext externalCtx = Contexts.get(ExternalUserContext.class);
if (externalCtx.isExternalUser()) {
    // 面向外部用户的分支处理
}
```

## 反模式

| 模式 | 问题 | 对策 |
|---|---|---|
| 对 `Contexts.get()` 的返回值进行空值检查 | 永远不会执行的死代码（`Contexts.get()` 不会返回 null，无法获取时会抛出 `ContextNotFoundException`） | 不应做空值检查，而应在可能无法获取上下文的运行环境中考虑捕获 `ContextNotFoundException` |
| 遗漏嵌套 getter 返回值（如 `getMainDepartment()` / `getUserProfile()`）的空值检查 | `NullPointerException` | 与 `Contexts.get()` 本身不同，这些方法按规范确实可能返回 null（`getUserProfile()` 平台自身 JavaDoc 未记载），应加以检查 |
| 遗漏认证检查 | 未认证用户也能执行业务处理 | 检查 `isAuthenticated()` |
| 持有或缓存上下文到字段 | 用户信息在多个请求间混淆 | 在方法内每次重新获取 |
| 在任务中获取 `UserContext` | 取决于运行环境可能无法获取 | 改用 `JobSchedulerContext`（通过 `BaseJob`） |
| 在基础设施层（DAO/Repository）直接调用 `Contexts` | 违反分层依赖规则 | 由服务层通过参数传入 |
| 将 `UserProfile` 的个人信息（姓名、邮箱等）输出到日志 | 存在个人信息泄露风险 | 仅输出用户代码 |
| 在新代码中使用 `getLoginGroupId()` | 依赖已废弃（`@Deprecated`）的属性 | 改用 `getTenantId()` |
