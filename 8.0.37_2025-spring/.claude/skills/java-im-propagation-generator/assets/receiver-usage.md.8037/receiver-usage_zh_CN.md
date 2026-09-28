# 接收方实现模式（Decoder / Procedure）

`Decoder`/`Procedure`/`AbstractProcedure`/`AbstractSessionableProcedure` 的签名与内部行为请参见 `reference/propagation-api-reference.md`。本文展示典型的实现模式。

## 实现顺序

1. 数据模型（接收目标 POJO，不必与发送方是同一个类）
2. Decoder（继承 `AbstractDecoder`，负责 GenericModel → 数据模型的转换）
3. Procedure（继承 `AbstractProcedure` 或 `AbstractSessionableProcedure`，执行业务处理）
4. 接收配置文件（`propagation-receivers-config`）

**`source`/`operationType` 必须与发送方的值完全一致**（自定义模块情形下为发送配置文件，intra-mart 标准数据情形下为 `assets/standard-listener-usage.md` 中的清单）。

## 模式1：实现 Decoder

```java
package jp.co.intra_mart.sample.notify.propagation.decoder;

import jp.co.intra_mart.foundation.propagation.exception.ConvertException;
import jp.co.intra_mart.foundation.propagation.receiver.AbstractDecoder;

import jp.co.intra_mart.sample.leave.propagation.LeaveApprovedGeneric;
import jp.co.intra_mart.sample.notify.propagation.LeaveApprovedNotifyData;

/**
 * 将 LeaveApprovedGeneric 转换为通知处理用数据的 Decoder。
 */
public class LeaveApprovedDecoder extends AbstractDecoder<LeaveApprovedGeneric, LeaveApprovedNotifyData> {

    @Override
    public LeaveApprovedNotifyData decode(final LeaveApprovedGeneric generic) throws ConvertException {
        if (generic == null || generic.getApplicationId() == null) {
            throw new ConvertException("接收数据缺少必需项。");
        }

        final LeaveApprovedNotifyData data = new LeaveApprovedNotifyData();
        data.setApplicationId(generic.getApplicationId());
        data.setApplicantUserCd(generic.getApplicantUserCd());
        data.setApprovedDate(generic.getApprovedDate());
        return data;
    }

    @Override
    public Class<LeaveApprovedGeneric> getGenericDataClass() {
        return LeaveApprovedGeneric.class;
    }
}
```

- 转换失败时应抛出 `ConvertException`（或其子类）。不得抛出 `PropagationManagerException`
- `getGenericDataClass()` 返回所接收 `GenericModel` 的 `Class` 对象
- 与 `AbstractEncoder` 相同，可通过 `getParamKeys()`/`getParamValue(String)`/`getParamValues(String)` 引用接收配置文件中的 `param`

## 模式2：实现 Procedure（搭载于数据库事务的常规模式）

对于数据库更新等，需要与发送方在同一事务内完成的业务处理，使用 `AbstractProcedure`。

```java
package jp.co.intra_mart.sample.notify.propagation.procedure;

import jp.co.intra_mart.foundation.propagation.code.EventStatus;
import jp.co.intra_mart.foundation.propagation.exception.ProcedureException;
import jp.co.intra_mart.foundation.propagation.model.EmptyObject;
import jp.co.intra_mart.foundation.propagation.model.ReceiveParameter;
import jp.co.intra_mart.foundation.propagation.model.ReceiveResult;
import jp.co.intra_mart.foundation.propagation.receiver.AbstractProcedure;

import jp.co.intra_mart.sample.notify.entity.NotifyEntity;
import jp.co.intra_mart.sample.notify.propagation.LeaveApprovedNotifyData;
import jp.co.intra_mart.sample.notify.repository.NotifyRepository;

/**
 * 接收请假申请审批完成通知，并登记到通知表的 Procedure。
 */
public class LeaveApprovedProcedure extends AbstractProcedure<LeaveApprovedNotifyData, EmptyObject> {

    private final NotifyRepository notifyRepository;

    public LeaveApprovedProcedure() {
        this.notifyRepository = new NotifyRepository();
    }

    @Override
    public ReceiveResult<EmptyObject> onReceive(final ReceiveParameter parameter,
            final LeaveApprovedNotifyData data) throws ProcedureException {
        try {
            final NotifyEntity entity = new NotifyEntity();
            entity.setApplicationId(data.getApplicationId());
            entity.setUserCd(data.getApplicantUserCd());
            entity.setMessage("您的请假申请已获批准。");
            notifyRepository.insert(entity);

            return new ReceiveResult<EmptyObject>(EventStatus.SUCCEEDED);
        } catch (final RuntimeException e) {
            throw new ProcedureException("通知登记处理失败。", e);
        }
    }
}
```

- **`AbstractProcedure` 通过类加载器实例化（必须提供无参构造函数）。** 不要将构造函数设为 `private`
- 不得在 `onReceive()` 内部自行进行事务控制（相当于 begin/commit）。由于其前提是搭载在发送方所承载的事务上，数据库更新可以直接执行
- 处理结果通过携带 `EventStatus`（`SUCCEEDED`/`NOT_AFFECTED`/`NOT_IMPLEMENTED`/`FAILED`）的 `ReceiveResult` 返回。若不需要返回值，类型参数可使用 `EmptyObject`
- 处理失败时应抛出 `ProcedureException`（或其子类）。抛出后会导致发送方的 `decide()` 失败，从而使发送方的整个会话回滚（并通过 `abort()` 通知给其他接收方）

## 模式3：实现 Procedure（处理非数据库资源的情形）

对于外部 API 调用、文件操作等无法搭载在数据库事务上的处理，或需要在提交前自行进行确定性判断的处理，使用 `AbstractSessionableProcedure`。

```java
package jp.co.intra_mart.sample.notify.propagation.procedure;

import jp.co.intra_mart.foundation.propagation.code.EventStatus;
import jp.co.intra_mart.foundation.propagation.exception.ProcedureException;
import jp.co.intra_mart.foundation.propagation.model.*;
import jp.co.intra_mart.foundation.propagation.receiver.AbstractSessionableProcedure;

import jp.co.intra_mart.sample.notify.propagation.LeaveApprovedNotifyData;

/**
 * 向外部系统通知请假申请审批完成的 Procedure（因调用外部 API，故拥有自己的确定处理步骤）。
 */
public class LeaveApprovedExternalNotifyProcedure
        extends AbstractSessionableProcedure<LeaveApprovedNotifyData, EmptyObject> {

    private String pendingPayload;

    @Override
    public InitializeResult onInitialize(final InitializeParameter parameter) {
        // 事务开始时仅调用一次的初始化处理（仅在需要时重写）
        return new InitializeResult(EventStatus.SUCCEEDED);
    }

    @Override
    public ReceiveResult<EmptyObject> onReceive(final ReceiveParameter parameter,
            final LeaveApprovedNotifyData data) throws ProcedureException {
        // 此时不确定外部发送(仅组装负载数据)
        this.pendingPayload = buildPayload(data);
        return new ReceiveResult<EmptyObject>(EventStatus.SUCCEEDED);
    }

    @Override
    public PrepareResult onPrepare(final PrepareParameter parameter) {
        // 提交前的最终确认(外部系统是否可达等)。若无问题则返回可确定状态
        return new PrepareResult(EventStatus.SUCCEEDED);
    }

    @Override
    public DecideResult onDecide(final DecideParameter parameter) throws ProcedureException {
        try {
            sendToExternalSystem(pendingPayload);
            return new DecideResult(EventStatus.SUCCEEDED);
        } catch (final RuntimeException e) {
            throw new ProcedureException("向外部系统发送通知失败。", e);
        }
    }

    @Override
    public AbortResult onAbort(final AbortParameter parameter) {
        // 发送方会话回滚时的善后处理(此处无需特别处理)
        this.pendingPayload = null;
        return new AbortResult(EventStatus.SUCCEEDED);
    }

    private String buildPayload(final LeaveApprovedNotifyData data) {
        return data.getApplicationId() + ":" + data.getApplicantUserCd();
    }

    private void sendToExternalSystem(final String payload) {
        // 对外部 API 的 HTTP 调用等(实现从略)
    }
}
```

- 生命周期按 `onInitialize`（事务开始时一次）→ `onReceive`（每次接收数据）→ `onPrepare`（提交前判断是否可确定）→ `onDecide`（确定处理）/`onAbort`（回滚时的善后）的顺序调用，接近两阶段提交的结构
- **不要在 `onReceive()` 阶段确定处理。** 实际的副作用（外部 API 调用等）应在 `onDecide()` 中执行。因为如果发送方之后调用 `abort()`，在 `onReceive()` 中已确定的副作用将无法撤销
- 未使用的生命周期方法可以保持继承而来的默认实现（无需强行重写全部方法）
- `checkInSession(ReceiveParameter)` 可作为需要时验证会话状态的工具方法使用

## 模式4：接收配置文件

存放于 `WEB-INF/conf/propagation-receivers-config/{任意名}.xml`（项目中的 `src/main/conf/propagation-receivers-config/` 下）。`source` 应指定**发送方**数据模型的完全限定类名（注意不是接收方数据模型的 FQCN）。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<propagation-receivers-config xmlns="http://www.intra-mart.jp/propagation/receivers-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/propagation/receivers-config propagation-receivers-config.xsd">
  <receiver source="jp.co.intra_mart.sample.leave.entity.LeaveApplicationEntity"
            operationType="DATA_UPDATED">
    <decoder class="jp.co.intra_mart.sample.notify.propagation.decoder.LeaveApprovedDecoder" />
    <procedure class="jp.co.intra_mart.sample.notify.propagation.procedure.LeaveApprovedProcedure" />
  </receiver>
</propagation-receivers-config>
```

- `source`/`operationType` 必须与发送方的值完全一致（发送配置文件 `sender` 元素的 `source`/`operationType`，或 intra-mart 标准数据情形下 `assets/standard-listener-usage.md` 中的清单值）
- 可以为同一 `source`+`operationType` 定义多个 `receiver` 元素（使多个自定义模块能够各自独立接收同一份发送数据）。处理顺序不作保证，但每个 `receiver` 是互斥处理的（一次一个线程）
- 分别在 `decoder`/`procedure` 下添加子元素 `<params><param key="...">值</param></params>`，即可在 `AbstractDecoder`/`AbstractProcedure`（`AbstractSessionableProcedure` 亦同）内部引用自定义参数

## 反模式（应避免）

```java
// 错误：在 AbstractProcedure#onReceive() 内部自行进行事务控制
// （其前提是搭载在宿主事务上，自行 commit/rollback 既无必要也有害）

// 错误：在 AbstractSessionableProcedure#onReceive() 阶段就确定了外部 API 调用等不可撤销的副作用
// （无法在 onAbort() 中撤销，即使发送方回滚也会残留数据不一致）

// 错误：在接收配置文件的 source 中指定了接收方数据模型的 FQCN
// （source 应始终指定发送方数据模型的 FQCN）
<receiver source="jp.co.intra_mart.sample.notify.propagation.LeaveApprovedNotifyData" ...>

// 错误：即使不会导致编译错误，Decoder/Procedure 也抛出了 ConvertException/ProcedureException 以外的
// PropagationManagerException（这是框架内部专用的异常，不应误用）
```
