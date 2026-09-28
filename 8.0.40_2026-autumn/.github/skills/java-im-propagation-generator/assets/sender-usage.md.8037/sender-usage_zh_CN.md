# 发送方实现模式（PropagationManager / Encoder / GenericModel）

`PropagationManager`/`Encoder`/`AbstractGeneric` 的签名与内部行为请参见 `reference/propagation-api-reference.md`。本文展示典型的实现模式。

## 实现顺序

1. 数据模型（发送源 POJO，可直接使用现有的业务实体）
2. GenericModel（继承 `AbstractGeneric`，是从数据模型转换后的序列化数据）
3. Encoder（继承 `AbstractEncoder`，负责数据模型 → GenericModel 的转换）
4. 发送配置文件（`propagation-senders-config`）
5. `PropagationManager` 调用代码（位于执行业务处理的服务类等中）

## 模式1：定义 GenericModel

继承 `AbstractGeneric` 并定义要发送的字段。继承而来的 `executeTenantId`/`executeUserCd`/`ownerTenantId`/`ownerUserCd` 可自动使用（若未显式设置，`PropagationManager` 一侧会从执行上下文中补充）。

```java
package jp.co.intra_mart.sample.leave.propagation;

import jp.co.intra_mart.foundation.propagation.model.generic.AbstractGeneric;

/**
 * 用于传达请假申请审批完成的 GenericModel。
 */
public class LeaveApprovedGeneric extends AbstractGeneric {

    private static final long serialVersionUID = 1L;

    private String applicationId;
    private String applicantUserCd;
    private String approvedDate;

    public String getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(final String applicationId) {
        this.applicationId = applicationId;
    }

    public String getApplicantUserCd() {
        return applicantUserCd;
    }

    public void setApplicantUserCd(final String applicantUserCd) {
        this.applicantUserCd = applicantUserCd;
    }

    public String getApprovedDate() {
        return approvedDate;
    }

    public void setApprovedDate(final String approvedDate) {
        this.approvedDate = approvedDate;
    }
}
```

- `AbstractGeneric` 已实现 `Serializable`，但添加字段的子类仍应显式声明自己的 `serialVersionUID`
- 字段类型只能使用实现了 `Serializable` 的类型（基本类型、包装类型、`String`、日期类型等）
- 接收方不必使用完全相同的 `GenericModel` 类，但字段名/类型差异过大会导致还原时数据丢失；收发双方共享同一个类（例如放置于共享库中）是最安全的做法

## 模式2：实现 Encoder

```java
package jp.co.intra_mart.sample.leave.propagation.encoder;

import jp.co.intra_mart.foundation.propagation.exception.ConvertException;
import jp.co.intra_mart.foundation.propagation.sender.AbstractEncoder;

import jp.co.intra_mart.sample.leave.entity.LeaveApplicationEntity;
import jp.co.intra_mart.sample.leave.propagation.LeaveApprovedGeneric;

/**
 * 将请假申请实体转换为 LeaveApprovedGeneric 的 Encoder。
 */
public class LeaveApprovedEncoder extends AbstractEncoder<LeaveApplicationEntity, LeaveApprovedGeneric> {

    @Override
    public LeaveApprovedGeneric encode(final LeaveApplicationEntity data) throws ConvertException {
        if (data == null || data.getApplicationId() == null) {
            throw new ConvertException("源数据缺少必需项。");
        }

        final LeaveApprovedGeneric generic = new LeaveApprovedGeneric();
        generic.setApplicationId(data.getApplicationId());
        generic.setApplicantUserCd(data.getApplicantUserCd());
        generic.setApprovedDate(data.getApprovedDate());
        return generic;
    }

    @Override
    public Class<LeaveApprovedGeneric> getGenericDataClass() {
        return LeaveApprovedGeneric.class;
    }
}
```

- 转换失败时（必需项缺失、类型转换错误等）应抛出 `ConvertException`（或其子类）。不得抛出 `PropagationManagerException`
- `getGenericDataClass()` 原样返回所生成 `GenericModel` 的 `Class` 对象（框架内部用于类解析）
- 若需通过发送配置文件的 `param` 元素传递自定义参数，可通过 `AbstractEncoder#getParamKeys()`/`getParamValue(String)`/`getParamValues(String)` 引用（`setParamValuesMap` 由框架自动调用，无需自行实现）

## 模式3：发送配置文件

存放于 `WEB-INF/conf/propagation-senders-config/{任意名}.xml`（项目中的 `src/main/conf/propagation-senders-config/` 下）。`source` 应指定数据模型（Encoder 的类型参数 `D`）的完全限定类名。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<propagation-senders-config xmlns="http://www.intra-mart.jp/propagation/senders-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/propagation/senders-config propagation-senders-config.xsd">
  <sender source="jp.co.intra_mart.sample.leave.entity.LeaveApplicationEntity"
          operationType="DATA_UPDATED">
    <encoder class="jp.co.intra_mart.sample.leave.propagation.encoder.LeaveApprovedEncoder" />
  </sender>
</propagation-senders-config>
```

- `source` 必须与传给 `PropagationManager#send()` 的 `data`（或显式指定的 `dataClass`）的完全限定类名一致
- `operationType` 应优先使用 `reference/propagation-api-reference.md` 中 `OperationType` 的标准常量（`DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED`/`PROC_STARTED`/`PROC_COMPLETED` 等）。仅在表示自定义业务事件时才定义自定义字符串常量
- 若需向 `encoder` 传递自定义参数，可在 `<encoder class="...">` 下添加子元素 `<params><param key="...">值</param></params>`
- 若为同一 `source`+`operationType` 组合定义多个 `sender` 元素，则会调用多个 Encoder（仅在确有需要时使用）

## 模式4：通过 `PropagationManager` 发送数据

### 基本形式（`begin`/`send`/`decide`/`abort`）

```java
package jp.co.intra_mart.sample.leave.service;

import jp.co.intra_mart.foundation.propagation.PropagationManager;
import jp.co.intra_mart.foundation.propagation.PropagationManagerFactory;
import jp.co.intra_mart.foundation.propagation.exception.PropagationException;
import jp.co.intra_mart.foundation.propagation.model.EmptyObject;
import jp.co.intra_mart.foundation.propagation.model.SendResult;

import jp.co.intra_mart.sample.leave.entity.LeaveApplicationEntity;

/**
 * 通知请假申请已完成审批。
 */
public class LeaveApprovalService {

    public void notifyApproved(final LeaveApplicationEntity entity) throws PropagationException {
        final PropagationManager manager = PropagationManagerFactory.getInstance().getPropagationManager();
        try {
            manager.begin();

            // 在此处执行数据库更新处理（保存审批状态等）

            final SendResult<EmptyObject> result =
                    manager.send("DATA_UPDATED", entity, EmptyObject.class);

            manager.decide();
        } finally {
            manager.abort();
            manager.close();
        }
    }
}
```

- `begin()` 开启会话；若执行上下文中没有活动的数据库事务，则会新建一个。**业务上的数据库更新处理应在 `begin()` 之后、`decide()` 之前进行**（以便纳入同一事务）
- 对已经 `decide()` 过的会话调用 `abort()` 是安全的（空操作），因此可以始终将其放在 `finally` 中
- 若不需要返回值，`resultClass` 可指定为 `jp.co.intra_mart.foundation.propagation.model.EmptyObject`
- 为释放资源，务必在 `abort()`/`decide()` 之后调用 `close()`（多次调用也是安全的）

### 使用 `execute(Callable)` 的形式（自动完成 begin/decide/abort）

```java
final PropagationManager manager = PropagationManagerFactory.getInstance().getPropagationManager();
try {
    manager.execute(() -> {
        // 数据库更新处理
        return manager.send("DATA_UPDATED", entity, EmptyObject.class);
    });
} finally {
    manager.close();
}
```

- `execute()` 内部会调用 `begin()`；若 `Callable` 正常返回值则自动调用 `decide()`，若返回 `null` 或抛出异常则自动调用 `abort()`
- `send()` 本身可能抛出受检异常 `SendException`。由于可以直接搭载在 `Callable#call()` 的 `throws Exception` 上，调用方通常无需单独进行 try-catch

### 无需会话管理的场景（不与数据库事务联动的单次发送）

```java
final PropagationManager manager = PropagationManagerFactory.getInstance().getPropagationManager();
try {
    manager.send("DATA_UPDATED", entity, EmptyObject.class);
} finally {
    manager.close();
}
```

- 也可以不调用 `begin()`/`decide()`，仅调用 `send()`。但若希望与数据库更新在同一事务内完成（即接收方的 `AbstractProcedure` 预期搭载在宿主事务上），则必须使用 `begin()`/`decide()` 包裹

## 反模式（应避免）

```java
// 错误：通过 begin() 开启的会话未通过 decide()/abort()/close() 中的任何一个结束
manager.begin();
manager.send("DATA_UPDATED", entity, EmptyObject.class);
manager.decide();
// 未调用 close()（可能导致资源泄漏）

// 错误：Encoder 在转换失败时抛出了 ConvertException 以外的异常
@Override
public LeaveApprovedGeneric encode(final LeaveApplicationEntity data) {
    return new LeaveApprovedGeneric(); // 未检查必需项就返回了不完整的数据

// 错误：source 中指定的 FQCN 与实际传给 send() 的数据类不一致
// （sender 元素的 source 为 LeaveApplicationEntity，但代码中调用的是
//   send("DATA_UPDATED", someOtherClassInstance, EmptyObject.class)）

// 错误：发送配置文件与调用代码中的 operationType 不一致（例如配置为 "DATA_UPDATED"，代码为 "UPDATED"）
manager.send("UPDATED", entity, EmptyObject.class);
```
