---
applyTo: "**/*.java"
description: "ログ出力規約（Java）（SLF4J/Logback、ログレベルの使い分け）"
---

# 日志输出规约（Java）

> **适用范围**: 🟡 **上下文依赖** — 仅在实现日志功能时适用。不输出日志的类无需参考本文件。

intra-mart Accel Platform 提供了基于 SLF4J + Logback 的日志基础设施。应使用 `jp.co.intra_mart.common.platform.log.Logger` 输出日志。

## 日志级别的使用区分

| 级别 | 用途 | 记述语言 |
|--------|------|----------|
| ERROR | 系统错误、非预期异常、需要通知管理员的故障 | 英语 |
| WARN | 业务规则违反、可恢复的错误、使用了已废弃功能 | 英语 |
| INFO | 业务操作的开始・结束、主要状态变更、服务调用 | 英语 |
| DEBUG | 详细的执行流程、参数值 | 英语 |
| TRACE | 更详细的调试信息 | 英语 |

## Logger 的实现

### 基本模式

```java
import jp.co.intra_mart.common.platform.log.Logger;

public class UserService {

  private static final Logger LOGGER = Logger.getLogger(UserService.class);

  public void execute() {
    LOGGER.info("Started processing");
  }
}
```

- **必须** 为每个类定义 `private static final` 的 Logger 字段
- **必须** `Logger.getLogger()` 的参数应指定**输出日志的类自身的 `.class`**（例如在 `UserService` 类中应为 `UserService.class`）
  - 理由：这样可以正确记录输出日志的类（包层级），使 `conf/log/{module_id}.xml` 中基于 logger 名（按包）的级别控制能够按预期生效
- 直接指定 logger 名称（如 `Logger.getLogger("my.custom.logger.name")`）的方式也可使用，但仅限于希望按功能对 logger 分组等特殊情形

### 日志输出模式

```java
private static final Logger LOGGER = Logger.getLogger(UserService.class);

// 带上下文的错误日志
LOGGER.error("Failed to process registration for user: " + userId, e);

// 业务警告
LOGGER.warn("Business rule violation: category is not editable. categoryId=" + categoryId);

// 操作的信息日志
LOGGER.info("Started registUser processing for user: " + userId + ", tenant: " + tenantId);

// 用于排查问题的调试日志
LOGGER.debug("Processing registUser with parameters: " + parameters);
```

## 敏感信息的处理

### 禁止输出的项目

- 密码
- 认证令牌
- 信用卡号
- 个人信息（如需输出，须进行脱敏处理）

- **禁止** 不得将敏感信息（密码、令牌、个人数据）输出到日志中

## 按异常类型判断日志级别

| 异常类型 | 日志级别 | 理由 |
|---|---|---|
| ValidationException（输入校验） | 不输出日志 | 用户的输入错误，非系统故障 |
| AuthorizationException（授权错误） | 不输出日志 | 由授权框架处理 |
| NotFoundException（无检索结果） | 不输出日志 | 正常的业务流程 |
| BusinessException（业务规则违反） | WARN | 可恢复的业务逻辑问题 |
| RepositoryException（数据访问错误） | ERROR | 基础设施故障，需要排查 |
| RuntimeException（非预期错误） | ERROR | 编程错误，需立即排查 |

### 基本方针

- **必须** 仅对需要通知管理员的错误输出日志
- **禁止** 不得对输入校验异常输出日志
- **禁止** 不得对权限校验异常输出日志
- **推荐** 将返回给客户端的错误信息与日志输出分离

### 正确模式

```java
@Path("/users")
public class UserEndpoint {

  private static final Logger LOGGER = Logger.getLogger(UserEndpoint.class);

  @POST
  public Response createUser(UserRequest request) {
    try {
      List<String> errors = request.validate();
      if (!errors.isEmpty()) {
        // 输入校验错误不输出日志
        return Response.badRequest(errors);
      }

      User user = userService.createUser(request);
      return Response.ok(user);

    } catch (AuthorizationException e) {
      // 权限校验错误不输出日志
      return Response.forbidden();

    } catch (BusinessException e) {
      // 业务异常可选择以 WARN 级别输出
      LOGGER.warn("Business error occurred. code: " + e.getBusinessCode(), e);
      return Response.conflict(e.getMessage());

    } catch (Exception e) {
      // 仅对非预期错误以 ERROR 级别输出
      LOGGER.error("Unexpected error during createUser processing", e);
      return Response.internalServerError();
    }
  }
}
```

## 按层的日志模式

### 服务层

```java
private static final Logger LOGGER = Logger.getLogger(StandardCategoryService.class);

// 业务操作的开始・完成（INFO）
LOGGER.info("Started processing category: categoryId=" + categoryId + ", userCd=" + userCd);

// 业务规则违反（WARN）
LOGGER.warn("Business rule violation: category is not editable. categoryId="
    + categoryId + ", status=" + category.getStatus());

// 包装基础设施故障时（ERROR）
LOGGER.error("Failed to save category: categoryId=" + category.getCategoryId(), e);
throw new CategoryServiceException("カテゴリの保存に失敗しました", e);
```

- INFO：业务操作的开始・完成（应包含用户代码、租户 ID、操作对象 ID）
- WARN：业务规则违反（可恢复的错误）
- ERROR：仅在捕获基础设施故障时

### 仓储层

```java
private static final Logger LOGGER = Logger.getLogger(StandardCategoryRepository.class);

try {
  // DB 操作
} catch (SQLRuntimeException e) {
  LOGGER.error("Failed to find category: categoryId=" + categoryId, e);
  throw new RepositoryException("カテゴリの検索に失敗しました: categoryId=" + categoryId, e);
}
```

- 仅 ERROR：基础设施故障（DB 连接错误、SQL 执行错误等）
- find 返回 null 是正常行为，不输出日志
- 调试用途时使用 DEBUG 级别

### 作业层

```java
private static final Logger LOGGER = Logger.getLogger(CategoryBatchJob.class);

@Override
public JobResult execute() throws JobExecuteException {
  LOGGER.info("Started category batch job");

  int processedCount = 0;
  int errorCount = 0;

  for (Category category : categories) {
    try {
      processCategory(category);
      processedCount++;

      // 进度日志（每 100 条）
      if (processedCount % 100 == 0) {
        LOGGER.info("Progress: processed=" + processedCount + ", errors=" + errorCount);
      }
    } catch (Exception e) {
      errorCount++;
      LOGGER.error("Failed to process category: categoryId=" + category.getCategoryId(), e);
    }
  }

  LOGGER.info("Completed category batch job: processed=" + processedCount + ", errors=" + errorCount);

  if (errorCount > 0) {
    return JobResult.warning("処理完了（エラーあり）: 処理=" + processedCount + ", エラー=" + errorCount);
  }
  return JobResult.success("処理完了: " + processedCount + "件");
}
```

- INFO：开始・完成・进度（应包含处理件数）
- ERROR：单条记录的处理失败
- 进度日志应每 N 条输出一次（以 100 条或 1000 条为单位）

## 性能考量（DEBUG 日志的守卫）

```java
// NG: 字符串拼接总是被执行
LOGGER.debug("Processing with parameters: " + buildExpensiveString(params));

// OK: 仅在 DEBUG 有效时才执行字符串拼接
if (LOGGER.isDebugEnabled()) {
  LOGGER.debug("Processing with parameters: " + buildExpensiveString(params));
}
```

**何时需要守卫:**
- 涉及方法调用或复杂字符串拼接的情况
- 在循环内可能大量输出的情况
- 简单的字符串拼接（如 `"msg: " + id`）程度则无需守卫

## 日志配置文件

### 配置位置

```
conf/
  └── log/
    └── {module_id}.xml
```

### 模块专用配置示例

```xml
<?xml version="1.0" encoding="UTF-8"?>
<im-logger>
    <!-- 应用整体: INFO -->
    <logger name="{packageName}" level="INFO" />

    <!-- 基础设施层: WARN（抑制常规 DB 操作日志） -->
    <logger name="{packageName}.infrastructure" level="WARN" />

    <!-- 调试用设置（仅在开发时启用） -->
    <!-- <logger name="{packageName}" level="DEBUG" /> -->
</im-logger>
```

## 反模式

### REST API 中的冗余日志输出

```java
// NG: 对所有异常都输出 ERROR 日志
@POST
public Response createUser(UserRequest request) {
  try {
    // 处理
  } catch (ValidationException e) {
    LOGGER.error("Validation error", e);  // 不必要
    return Response.badRequest();
  } catch (AuthorizationException e) {
    LOGGER.error("Authorization error", e);  // 不必要
    return Response.forbidden();
  } catch (Exception e) {
    LOGGER.error("Unexpected error occurred", e);  // 仅此项是必要的
    return Response.internalServerError();
  }
}
```

### 其他禁止事项

- **禁止** 不得在循环内输出大量日志（进度日志应按 N 条间隔输出）
