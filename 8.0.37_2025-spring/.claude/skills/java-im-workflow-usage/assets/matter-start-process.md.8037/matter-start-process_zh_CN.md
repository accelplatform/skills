# 工作流 案件开始处理模板（Java / JavaEE 开发模型）

## 概述

用 Java 实现 IM-Workflow 案件开始处理（案件开始扩展处理）的模板。在案件新开始时执行。

继承抽象类 `jp.co.intra_mart.foundation.workflow.plugin.process.matter_start.MatterStartProcessEventListener`，并覆盖 `execute` 方法。

## 父类

| 项目 | 值 |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.plugin.process.matter_start.MatterStartProcessEventListener` |
| 类型 | 抽象类 |
| 参数类 | `jp.co.intra_mart.foundation.workflow.plugin.process.matter_start.MatterStartProcessParameter` |
| 方法 | `execute(MatterStartProcessParameter parameter)` |
| 返回值 | `void` |

`MatterStartProcessParameter` 的字段一览请参见 [reference/parameter-reference.md](../reference/parameter-reference.md)。

## 文件结构

```
src/main/java/{basePackage 路径}/{功能名}/workflow/
  └── {Feature}MatterStartProcess.java
```

---

## 案件开始处理类（{Feature}MatterStartProcess.java）

```java
package {basePackage}.{功能名}.workflow;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.plugin.process.matter_start.MatterStartProcessEventListener;
import jp.co.intra_mart.foundation.workflow.plugin.process.matter_start.MatterStartProcessParameter;

/**
 * {功能名} 工作流 案件开始处理类。<br>
 * 在案件新开始时执行。<br>
 * 请勿在本类的处理中开启 DB 事务。
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}MatterStartProcess extends MatterStartProcessEventListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}MatterStartProcess.class);

    /**
     * 作为案件开始扩展处理执行。
     *
     * @param parameter 案件开始处理参数
     * @throws Exception 发生异常时
     */
    @Override
    public void execute(final MatterStartProcessParameter parameter) throws Exception {
        LOGGER.info("Started matter start process. flowId=" + parameter.getFlowId());

        // TODO：请在此处实现案件开始时的业务逻辑。
        //
        // 可用的主要参数：
        //   parameter.getRouteId()  - 路由ID
        //   parameter.getFlowId()   - 流程ID
        //   parameter.getUserDataId() - 用户数据ID
    }
}
```

## 生成时的注意事项

- 请勿在本类的处理中开启 DB 事务
- 案件开始处理以「案件已开始」为触发条件执行。需注意这与申请处理（`apply` 动作处理）的时机不同
