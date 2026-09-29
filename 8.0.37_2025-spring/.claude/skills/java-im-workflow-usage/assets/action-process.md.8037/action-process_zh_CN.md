# 工作流 动作处理模板（Java / JavaEE 开发模型）

## 概述

用 Java 实现 IM-Workflow 动作处理的模板。
无需画面，在工作流的各处理时机（申请、审批、否决、退回等）执行。

继承抽象类 `jp.co.intra_mart.foundation.workflow.plugin.process.action.ActionProcessEventListener`，仅对需要实现的处理时机的方法进行 `@Override`。**由于父类为所有方法提供了空实现（`return null;` 等），无需对不使用的方法进行覆盖。**

**注意**：请勿在本类的处理中开启 DB 事务。

## 父类

| 项目 | 值 |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.plugin.process.action.ActionProcessEventListener` |
| 类型 | 抽象类（`public abstract class`） |
| 参数类 | `jp.co.intra_mart.foundation.workflow.plugin.process.action.ActionProcessParameter` |
| 用户参数 | `java.util.Map<String, Object>`（画面隐藏字段的 name/value。**所有值均为 `String`**） |

## 文件结构

```
src/main/java/{basePackage 路径}/{功能名}/workflow/action/
  └── {Feature}ActionProcess.java
```

---

## 可覆盖方法一览

| 方法名 | 处理时机 | 返回值 | 返回 data（案件编号） |
|-----------|--------------|--------|----------------------|
| `apply` | 申请 | `String` | 有（返回非 `null` 时会覆盖案件编号） |
| `reapply` | 再申请 | `String` | 有 |
| `applyFromTempSave` | 申请（临时保存案件） | `String` | 有 |
| `applyFromUnapply` | 申请（未申请状态案件） | `String` | 有 |
| `discontinue` | 中止 | `void` | 无 |
| `pullBack` | 撤回 | `void` | 无 |
| `sendBackToPullBack` | 退回后撤回 | `void` | 无 |
| `approve` | 审批 | `void` | 无 |
| `approveEnd` | 审批结束 | `void` | 无 |
| `deny` | 否决 | `void` | 无 |
| `sendBack` | 退回 | `void` | 无 |
| `reserve` | 保留 | `void` | 无 |
| `reserveCancel` | 解除保留 | `void` | 无 |
| `matterHandle` | 案件操作 | `void` | 无 |
| `tempSaveCreate` | 临时保存（新建） | `void` | 无 |
| `tempSaveUpdate` | 临时保存（更新） | `void` | 无 |
| `tempSaveDelete` | 临时保存（删除） | `void` | 无 |

所有方法的通用签名：

```java
public {返回值类型} {方法名}(final ActionProcessParameter parameter, final Map<String, Object> userParameter) throws Exception
```

`ActionProcessParameter` 的字段一览请参见 [reference/parameter-reference.md](../reference/parameter-reference.md)。

---

## 动作处理类（{Feature}ActionProcess.java）

```java
package {basePackage}.{功能名}.workflow.action;

import java.util.Map;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.plugin.process.action.ActionProcessEventListener;
import jp.co.intra_mart.foundation.workflow.plugin.process.action.ActionProcessParameter;

/**
 * {功能名} 工作流 动作处理类。<br>
 * 在工作流的各处理时机（申请、审批、否决、退回等）执行。<br>
 * 请勿在本类的处理中开启 DB 事务。
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}ActionProcess extends ActionProcessEventListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}ActionProcess.class);

    /**
     * 执行申请处理时调用。
     *
     * @param parameter 工作流参数
     * @param userParameter 用户参数
     * @return String 案件编号（大小：20字节）
     * @throws Exception 发生异常时
     */
    @Override
    public String apply(final ActionProcessParameter parameter, final Map<String, Object> userParameter) throws Exception {
        LOGGER.info("Started apply process. systemMatterId=" + parameter.getSystemMatterId());
        final String matterNumber = createMatterNumber();
        processBusinessLogic("apply", parameter, userParameter);
        LOGGER.info("Completed apply process. systemMatterId=" + parameter.getSystemMatterId());
        return matterNumber;
    }

    /**
     * 执行审批处理时调用。
     *
     * @param parameter 工作流参数
     * @param userParameter 用户参数
     * @throws Exception 发生异常时
     */
    @Override
    public void approve(final ActionProcessParameter parameter, final Map<String, Object> userParameter) throws Exception {
        processBusinessLogic("approve", parameter, userParameter);
    }

    /**
     * 执行否决处理时调用。
     *
     * @param parameter 工作流参数
     * @param userParameter 用户参数
     * @throws Exception 发生异常时
     */
    @Override
    public void deny(final ActionProcessParameter parameter, final Map<String, Object> userParameter) throws Exception {
        processBusinessLogic("deny", parameter, userParameter);
    }

    /**
     * 执行退回处理时调用。
     *
     * @param parameter 工作流参数
     * @param userParameter 用户参数
     * @throws Exception 发生异常时
     */
    @Override
    public void sendBack(final ActionProcessParameter parameter, final Map<String, Object> userParameter) throws Exception {
        processBusinessLogic("sendBack", parameter, userParameter);
    }

    /**
     * 生成案件编号。
     *
     * @return String 生成的案件编号
     * @throws Exception 编号生成失败时
     */
    private String createMatterNumber() throws Exception {
        // TODO：请根据项目方针实现编号方式。
        // JavaEE 开发模型中是否存在与 JSSP 版 WorkflowNumberingManager 相当的
        // 标准 API，需根据平台版本进行确认。
        throw new UnsupportedOperationException("案件编号的生成逻辑尚未实现。");
    }

    /**
     * 执行业务逻辑的主处理。
     * 由各动作方法调用。
     *
     * @param actionType 动作类型
     * @param parameter 工作流参数
     * @param userParameter 用户参数
     * @throws Exception 发生异常时
     */
    private void processBusinessLogic(final String actionType, final ActionProcessParameter parameter,
            final Map<String, Object> userParameter) throws Exception {
        // TODO：请在此处根据 actionType 实现相应的业务逻辑。
        //
        // 可用的主要参数：
        //   parameter.getSystemMatterId()  - 系统案件ID
        //   parameter.getUserDataId()      - 用户数据ID
        //   parameter.getAuthUserCd()      - 处理权限者代码
        //   parameter.getExecUserCd()      - 处理执行者代码
        //   parameter.getProcessComment()  - 处理注释
        //
        // userParameter 的值均为 String 类型。作为数值处理时需要进行转换。
    }
}
```

---

## 关于保存到案件属性・自定义表

与 JSSP 版相同，通过保存到案件属性（相当于 `UserActvMatterPropertyValue`）或项目专用表来持久化申请数据。由于 JavaEE 开发模型中的案件属性操作 API 不像 JSSP 那样有对应各平台版本的 `d.ts` 形式的 Java API 参考，**请务必先用 dev-knowledge（源代码搜索）确认相应 API 类的存在后再实现。** 不要凭记忆或猜测调用不存在的 API。

若选择保存到自定义表，请使用 `parameter.getSystemMatterId()` 或 `parameter.getUserDataId()` 作为外键。

## 生成时的注意事项

### 务必添加 `@Override`

签名的误写（参数类型、个数、返回值类型错误）不会导致编译错误，只会「多添加一个重载方法」，从而导致工作流引擎不会调用该方法的缺陷。添加 `@Override` 可让编译器验证与父类的一致性。

### userParameter 的值全部为字符串类型

`userParameter`（从画面表单传递的用户数据）的值**全部为 `String` 类型**（虽声明为 `Map<String, Object>`，但实际值为 `String`）。作为数值处理时，需要用 `Integer.parseInt(...)` / `new BigDecimal(...)` 等方法转换后再使用。

### apply 系列方法必须进行案件编号生成

`apply` / `applyFromTempSave` / `applyFromUnapply` 在返回非 `null` 的 `String` 时会更新案件编号。若规格书未指定编号方式，请先确认项目的编号方案（平台 API 或自定义序列）后再实现。**请用 dev-knowledge 确认与 JSSP 版 `WorkflowNumberingManager.getNumber()` 相当的 Java API 是否相同。**

### apply / applyFromUnapply 中的数据保存

在 `apply` 中向用户数据（业务表）执行 INSERT 时，需注意撤回后再申请（`applyFromUnapply`）时数据可能已经存在。若采用委托给 `apply` 处理的实现方式，应使用 UPSERT（先检查是否存在，再切换 INSERT/UPDATE）。与 JSSP 版 `simple-action-process.md` 的「apply / applyFromUnapply 中的数据保存」章节思路相同。

### 抛出异常时附带具体的消息

```java
// NG：无消息
throw new Exception();

// OK：包含排查问题所需的信息（日文，遵循 .claude/rules/java-javadoc.md）
throw new IllegalStateException(
    "案件编号生成失败。systemMatterId=" + parameter.getSystemMatterId());
```
