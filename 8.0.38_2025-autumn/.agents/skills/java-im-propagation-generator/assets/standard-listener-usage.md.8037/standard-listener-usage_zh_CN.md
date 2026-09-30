# intra-mart 标准数据的收发模式(标准监听器)

intra-mart Accel Platform 会通过 IM-Propagation 发送其自身标准功能所更新数据的变更通知,自定义模块可以作为"接收方"接收这些通知。反之,自定义模块也可以作为"发送方",向 IM-Box 等 intra-mart 标准功能准备好的接收处理(已实现 Decoder/Procedure)发送数据。无论哪种情形,`source`/`operationType` 的组合都是固定的,因此应直接使用本文件中列出的值,而不要自行推测。

## 模式1:接收 intra-mart 标准变更通知

实现方法与"接收其他自定义模块发送的数据"完全相同(参见 `assets/receiver-usage.md`)。不同之处在于,接收配置文件的 `source`/`operationType` 需指定作为发送源的 intra-mart 标准功能所使用的固定值,并且 `Decoder<G, D>` 的 `G` 必须使用 **intra-mart 官方为 IM-Propagation 专门提供的通用模型类**。

### 【最重要】不要将领域模型类直接用作 `G`,应使用 `jp.co.intra_mart.foundation.propagation.model.generic` 包中的 `Generic*` 类

`jp.co.intra_mart.foundation.propagation.model.generic` 包提供了约30个继承 `AbstractGeneric` 的通用模型类(`GenericAccount`/`GenericTenant`/`GenericRole`/`GenericAdministrator`/`GenericAuthzResource`/`GenericAuthzPolicy`/`GenericAuthzResourceGroup`/`GenericAuthzSubjectGroup`/`GenericMenuGroup`/`GenericMenuItem`/`GenericCalendar`/`GenericDay`/`GenericJobnet`/`GenericJobnetTrigger`/`GenericUpdatedTenant` 等)。该包的 Javadoc 明确记载了存放传播数据的类应满足的要求(基于原文的摘要):

1. 不使用总称型(泛型)
2. 是仅由简单 getter/setter 构成的可序列化类
3. 具有零参数的构造函数
4. 字段类型仅限于基本类型,或在传播功能内可与序列化数据相互转换的类・已实现相应接口的类(包括 `BigDecimal`/`BigInteger`/`Calendar`/`Collection`/`Date`/`List`/`Locale`/`Map`/`String`/`TimeZone`/`URI`/`URL`/`UUID` 及其包装类型、以及这些类型的数组)

IM-共通主数据及各类管理 API 提供的领域模型类——例如 `jp.co.intra_mart.foundation.admin.account.model.AccountInfo`——**未必满足上述要求(尤其是第3项"无参构造函数")。** 实际将 `AccountInfo`(仅有 `public AccountInfo(String userCd)` 这一个带参构造函数)直接注册为接收方 `Decoder<G, D>` 的 `G` 后,实机确认出现了以下严重问题。

- IM-Propagation 传递 GenericModel 时并非使用 Java 标准序列化,而是内部采用**基于 JSON(JSONIC 库)的转换**。接收方会通过反射(无参构造函数)从 JSON 还原 `Decoder#getGenericDataClass()` 返回的类
- 若尝试用不具备无参构造函数的 `AccountInfo` 进行此还原,会产生 `NoSuchMethodException` → `JSONException` → `SendException`,**无论接收方实现是否正确,都会导致发送方——即 intra-mart 标准功能自身(账户更新处理本身)——失败**
- 结果是只要该接收配置文件仍处于部署状态,**整个租户都将无法更新账户信息**——这是一个不仅仅是"无法接收",而是"发送方的标准功能本身被破坏"的严重影响

**将 `G` 指定为 `jp.co.intra_mart.foundation.propagation.model.generic.GenericAccount` 而非 `AccountInfo`,即可解决此问题。** `GenericAccount` 是 intra-mart 提供的官方类,其设计满足上述4项要求。

**因此,接收 intra-mart 标准数据时,应始终遵循以下方针:**

- **`source` 属性应继续指定发送源数据的完全限定类名(如 `AccountInfo` 的 FQCN)。** 这是用于路由的标识符,无需更改
- **`Decoder<G, D>` 的 `G` 以及 `getGenericDataClass()` 的返回值,应指定 `jp.co.intra_mart.foundation.propagation.model.generic` 包下对应的 `Generic*` 类,而非 `source` 所指的类**(参见下表"应使用的 Generic 类"一列)
- 若找不到对应的 `Generic*` 类,或无法确认其是否存在,可以**自行编写继承 `AbstractGeneric` 的镜像类**(按满足本包4项要求的方式设计)作为替代方案,但只要存在 intra-mart 官方类,就应始终优先使用(因为官方类会随字段新增・规约变更而持续维护)
- 切勿将 `source` 所指的领域模型类(如 `AccountInfo`)直接用作 `G`。管理类 API 的模型类并不保证满足 IM-Propagation 的要求

### 标准发送源一览

| 类别 | `source`(发送源数据的完全限定类名) | `operationType` | 应使用的 Generic 类(位于 `jp.co.intra_mart.foundation.propagation.model.generic` 下) |
|---|---|---|---|
| 租户初始设置完成 | `jp.co.intra_mart.system.service.provider.updater.propagation.UpdatedTenant` | `PROC_COMPLETED` | `GenericUpdatedTenant` |
| 租户信息 | `jp.co.intra_mart.foundation.admin.tenant.model.TenantInfo` | `DATA_CREATING`/`DATA_CREATED`/`DATA_UPDATING`/`DATA_UPDATED`/`DATA_DELETING`/`DATA_DELETED` | `GenericTenant` |
| 系统管理员信息 | `jp.co.intra_mart.foundation.admin.tenant.model.Administrator` | 同上组合 | `GenericAdministrator` |
| 账户信息 | `jp.co.intra_mart.foundation.admin.account.model.AccountInfo` | 同上组合 | **`GenericAccount`(参见下方实现示例)** |
| 角色 | `jp.co.intra_mart.foundation.admin.role.model.RoleInfo` | 同上组合 | `GenericRole` |
| IM-Authz 资源组 | `jp.co.intra_mart.foundation.authz.model.resources.ResourceGroup` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED` | `GenericAuthzResourceGroup` |
| IM-Authz 资源 | `jp.co.intra_mart.foundation.authz.model.resources.Resource` | `DATA_CREATED`/`DATA_DELETED` | `GenericAuthzResource` |
| IM-Authz 主体组 | `jp.co.intra_mart.foundation.authz.model.subjects.SubjectGroup` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED` | `GenericAuthzSubjectGroup` |
| IM-Authz 策略 | `jp.co.intra_mart.foundation.authz.model.policies.Policy` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED` | `GenericAuthzPolicy` |
| 菜单组 | `jp.co.intra_mart.foundation.menu.model.MenuGroup` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED` | `GenericMenuGroup` |
| 菜单项 | `jp.co.intra_mart.system.menu.propagation.HierarchicalMenuItem` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED` | `GenericMenuItem` |
| 日历信息 | `jp.co.intra_mart.foundation.calendar.model.CalendarInfo` | `DATA_CREATING`/`DATA_CREATED`/`DATA_UPDATING`/`DATA_UPDATED`/`DATA_DELETING`/`DATA_DELETED` | `GenericCalendar` |
| 假日信息 | `jp.co.intra_mart.foundation.calendar.model.DayInfo` | 同上组合 | `GenericDay` |
| 作业网定义 | `jp.co.intra_mart.foundation.job_scheduler.model.jobnet.Jobnet` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED` | `GenericJobnet` |
| 作业网执行完成 | `jp.co.intra_mart.system.job_scheduler.propagation.CompletedJobnetInfoModel` | `PROC_COMPLETED` | `GenericJobnet`(通过 `Status`/`StartDate`/`EndDate` 等字段,同一个类同时表示定义信息与执行结果信息) |
| Salesforce 监控对象 | `jp.co.intra_mart.foundation.salesforce.streaming.model.SalesforceEventNotification` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED`/`DATA_UN_DELETED` | 在 `jp.co.intra_mart.foundation.propagation.model.generic` 包内未找到对应的类。实现前应单独查阅 Javadoc |
| Wiki 内容 | `jp.co.intra_mart.foundation.wiki.logic.trigger.WikiContentsInfo` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED` | 在 `jp.co.intra_mart.foundation.propagation.model.generic` 包内未找到对应的类。实现前应单独查阅 Javadoc |

### 实现示例(接收账户信息更新通知。使用 `GenericAccount`)

```java
package jp.co.intra_mart.sample.audit.propagation.decoder;

import jp.co.intra_mart.foundation.propagation.exception.ConvertException;
import jp.co.intra_mart.foundation.propagation.model.generic.GenericAccount;
import jp.co.intra_mart.foundation.propagation.receiver.AbstractDecoder;

import jp.co.intra_mart.sample.audit.propagation.AccountAuditData;

/**
 * 将 intra-mart 标准的 GenericAccount 转换为审计记录用数据的 Decoder。
 */
public class AccountInfoDecoder extends AbstractDecoder<GenericAccount, AccountAuditData> {

    @Override
    public AccountAuditData decode(final GenericAccount generic) throws ConvertException {
        final AccountAuditData data = new AccountAuditData();
        data.setUserCd(generic.getUserCd());
        data.setLocked(generic.getLockDate() != null);
        return data;
    }

    @Override
    public Class<GenericAccount> getGenericDataClass() {
        return GenericAccount.class;
    }
}
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<propagation-receivers-config xmlns="http://www.intra-mart.jp/propagation/receivers-config">
  <!-- source 保持为发送源数据(AccountInfo)的 FQCN 不变。仅将 G(decoder 实际接收的类)改为 GenericAccount -->
  <receiver source="jp.co.intra_mart.foundation.admin.account.model.AccountInfo"
            operationType="DATA_UPDATED">
    <decoder class="jp.co.intra_mart.sample.audit.propagation.decoder.AccountInfoDecoder" />
    <procedure class="jp.co.intra_mart.sample.audit.propagation.procedure.AccountAuditProcedure" />
  </receiver>
</propagation-receivers-config>
```

- **`source` 属性应保持为发送源数据(`AccountInfo`)的 FQCN,不作更改。** 它与用作 `G` 的类(`GenericAccount`)相互独立
- `GenericAccount` 的主要字段:`userCd`/`password`/`locale`/`timeZoneId`/`calendarId`/`encoding`/`firstDayOfWeek`/`dateTimeFormats`(`Map<String, String>`)/`themeIds`(`Map<String, String>`)/`loginFailureCount`/`lockDate`(`Date`)/`validStartDate`(`Date`)/`validEndDate`(`Date`)/`notes`,以及继承自 `AbstractGeneric` 的4个字段(`executeTenantId`/`executeUserCd`/`ownerTenantId`/`ownerUserCd`)
- 发送方(intra-mart 本体)的配置・实现无法更改。只需实现接收方(本技能生成的 Decoder/Procedure + 接收配置文件)即可

## 模式2:向 IM-Box(应用通知・关注)发送数据

使用 IM-Box 提供的标准 `GenericModel`(`jp.co.intra_mart.foundation.propagation.model.generic.imbox` 包),自定义模块只需作为"发送方"发送数据,IM-Box 一侧的标准实现(接收配置・Decoder・Procedure 均已由 intra-mart 实现)即会进行处理。**此用途下无需新建接收配置文件。**

### 标准 GenericModel 一览

| 用途 | GenericModel(位于 `jp.co.intra_mart.foundation.propagation.model.generic.imbox` 下) | `operationType` | 说明 |
|---|---|---|---|
| 应用通知(线程单位) | `GenericSendNoticeThread` | `SEND_NOTICE_THREAD` | 发送线程级应用通知 |
| 应用通知(消息单位) | `GenericSendNoticeMessage` | `SEND_NOTICE_MESSAGE` | 发送消息级应用通知 |
| 关注通知(线程单位) | `GenericSendWatchThread` | `SEND_WATCH_THREAD` | 发送线程级关注通知 |
| 关注通知(消息单位) | `GenericSendWatchMessage` | `SEND_WATCH_MESSAGE` | 发送消息级关注通知 |
| 注册关注 | `GenericWatch` | `WATCH` | 新建关注 |
| 取消关注 | `GenericUnwatch` | `UNWATCH` | 取消关注 |

`GenericWatch`/`GenericUnwatch` 的主要字段:

- `GenericWatch`:`applicationCd`(应用代码)/`watchUserCd`(注册关注的用户代码)/`mapTargets`(`Map<String, String>`,用于标识关注对象的键值对)
- `GenericUnwatch`:`applicationCd`/`unwatchUserCd`(取消关注的用户代码)/`mapTargets`

### 实现示例(注册关注)

**无需 Encoder。** 只需原样组装 IM-Box 标准的 `GenericModel`(`GenericWatch`)并传给 `PropagationManager#send()` 即可。

```java
package jp.co.intra_mart.sample.leave.service;

import java.util.HashMap;
import java.util.Map;

import jp.co.intra_mart.foundation.propagation.PropagationManager;
import jp.co.intra_mart.foundation.propagation.PropagationManagerFactory;
import jp.co.intra_mart.foundation.propagation.exception.PropagationException;
import jp.co.intra_mart.foundation.propagation.model.EmptyObject;
import jp.co.intra_mart.foundation.propagation.model.generic.imbox.GenericWatch;

/**
 * 将请假申请案件注册为 IM-Box 的关注对象。
 */
public class LeaveWatchService {

    public void registerWatch(final String applicationCd, final String userCd, final String applicationId)
            throws PropagationException {
        final GenericWatch watch = new GenericWatch();
        watch.setApplicationCd(applicationCd);
        watch.setWatchUserCd(userCd);

        final Map<String, String> targets = new HashMap<String, String>();
        targets.put("applicationId", applicationId);
        watch.setMapTargets(targets);

        final PropagationManager manager = PropagationManagerFactory.getInstance().getPropagationManager();
        try {
            manager.execute(() -> manager.send("WATCH", GenericWatch.class, watch, EmptyObject.class));
        } catch (final Exception e) {
            throw new PropagationException("注册关注失败。", e);
        } finally {
            manager.close();
        }
    }
}
```

对应的发送配置文件:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<propagation-senders-config xmlns="http://www.intra-mart.jp/propagation/senders-config">
  <sender source="jp.co.intra_mart.foundation.propagation.model.generic.imbox.GenericWatch"
          operationType="WATCH">
    <!-- 由于 GenericWatch 本身已经是 GenericModel,需实现并注册一个不做转换的恒等 Encoder -->
    <encoder class="jp.co.intra_mart.sample.leave.propagation.encoder.GenericWatchIdentityEncoder" />
  </sender>
</propagation-senders-config>
```

- 由于 `PropagationManager#send()` 的机制是必定通过 Encoder 转换为 `GenericModel`,因此即使要发送的数据**本身已经是** `GenericModel`(如 `GenericWatch`),也需要实现一个进行恒等转换(原样返回)的 `Encoder` 并将其注册到发送配置文件中
- 恒等转换 Encoder 的实现示例:

```java
package jp.co.intra_mart.sample.leave.propagation.encoder;

import jp.co.intra_mart.foundation.propagation.exception.ConvertException;
import jp.co.intra_mart.foundation.propagation.sender.AbstractEncoder;
import jp.co.intra_mart.foundation.propagation.model.generic.imbox.GenericWatch;

/**
 * 用于原样发送已是 GenericModel 的数据的恒等转换 Encoder。
 */
public class GenericWatchIdentityEncoder extends AbstractEncoder<GenericWatch, GenericWatch> {

    @Override
    public GenericWatch encode(final GenericWatch data) throws ConvertException {
        return data;
    }

    @Override
    public Class<GenericWatch> getGenericDataClass() {
        return GenericWatch.class;
    }
}
```

## 注意事项

- **标准的 `source`/`operationType` 必须与本文件所列的值完全一致。** 若不一致,发送配置・接收配置文件本身仍可正常加载,但数据实际上不会流动,也不会输出任何错误,处于"什么都不会发生"的状态
- **接收 intra-mart 标准数据时,切勿将领域模型类(如 `AccountInfo`/`TenantInfo`/`RoleInfo`)直接用作 `Decoder<G, D>` 的 `G`,应使用上表"应使用的 Generic 类"一列中列出的、位于 `jp.co.intra_mart.foundation.propagation.model.generic` 包下的类。** 直接使用领域模型类,可能因缺少无参构造函数等原因导致发送方(intra-mart 标准功能)自身被破坏。`AccountInfo` 就是典型例子
- **`Generic*` 类也应直接使用 intra-mart 提供的类。** 无法通过增加字段等方式进行自定义
- **用于向 IM-Box 等标准功能发送的 `GenericModel`(如 `GenericWatch`)也应直接使用 intra-mart 提供的类。** 无法通过增加字段等方式进行自定义
- 若要使用本文件未列出的 intra-mart 标准数据(例如新版本中新增的发送源),应查阅对应版本的 IM-Propagation 配置清单(`im_propagation_configuration_list`)以及 `jp.co.intra_mart.foundation.propagation.model.generic` 包的 Javadoc,准确确定 `source`/`operationType`/对应的 `Generic*` 类后再进行实现
