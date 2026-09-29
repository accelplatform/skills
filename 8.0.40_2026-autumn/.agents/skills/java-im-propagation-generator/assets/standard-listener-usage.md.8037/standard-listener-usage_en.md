# Sending/Receiving Patterns for intra-mart Standard Data (Standard Listeners)

intra-mart Accel Platform sends, via IM-Propagation, change notifications for data it updates as part of its own standard features, and a custom module can receive these as a "receiver." Conversely, a custom module can also act as a "sender," sending data to receiving processes (with Decoder/Procedure already implemented) prepared by intra-mart standard features such as IM-Box. In both cases, the `source`/`operationType` combination is fixed, so use the values listed in this file as-is rather than guessing them yourself.

## Pattern 1: Receiving an intra-mart standard change notification

The implementation method is exactly the same as "receiving data sent from another custom module" (see `assets/receiver-usage.md`). The difference is that the receiver configuration file's `source`/`operationType` specify the fixed values used by the intra-mart standard feature that is the sender, and that `G` in `Decoder<G, D>` must be **an official common model class provided by intra-mart specifically for IM-Propagation.**

### [Most Important] Do Not Use a Domain Model Class Directly for `G` — Use a `Generic*` Class from the `jp.co.intra_mart.foundation.propagation.model.generic` Package

The `jp.co.intra_mart.foundation.propagation.model.generic` package provides roughly 30 common model classes extending `AbstractGeneric` (`GenericAccount`, `GenericTenant`, `GenericRole`, `GenericAdministrator`, `GenericAuthzResource`, `GenericAuthzPolicy`, `GenericAuthzResourceGroup`, `GenericAuthzSubjectGroup`, `GenericMenuGroup`, `GenericMenuItem`, `GenericCalendar`, `GenericDay`, `GenericJobnet`, `GenericJobnetTrigger`, `GenericUpdatedTenant`, etc.). This package's Javadoc explicitly states the requirements a class holding propagated data must satisfy (summarized from the original text):

1. Must not use generics (type parameters)
2. Must be a serializable class consisting of simple getters/setters
3. Must have a zero-argument constructor
4. Field types must be limited to primitive types, or classes/interfaces that can be converted to and from serialized data within the propagation feature (including `BigDecimal`/`BigInteger`/`Calendar`/`Collection`/`Date`/`List`/`Locale`/`Map`/`String`/`TimeZone`/`URI`/`URL`/`UUID`, their wrapper types, and arrays of these)

Domain model classes provided by IM common master data or various admin/management APIs — such as `jp.co.intra_mart.foundation.admin.account.model.AccountInfo` — **are not guaranteed to satisfy the above requirements (especially requirement 3, a no-argument constructor).** `AccountInfo` has only the one-argument constructor `public AccountInfo(String userCd)` and does not meet this requirement. Registering it directly as `G` in `Decoder<G, D>` for receiving causes the following serious problem.

- IM-Propagation does not use standard Java serialization to hand off a GenericModel; internally it uses a **JSON-based conversion (the JSONIC library)**. The receiver side reconstructs the class returned by `Decoder#getGenericDataClass()` from JSON via reflection (a no-argument constructor)
- Attempting to use `AccountInfo`, which lacks a no-argument constructor, for this reconstruction causes a `NoSuchMethodException` -> `JSONException` -> `SendException`, and **the sender — the intra-mart standard feature itself (the account update process itself) — fails, regardless of whether the receiver-side implementation is correct**
- As a result, as long as that receiver configuration file remains deployed, **account information can no longer be updated tenant-wide** — a serious impact that is not merely "cannot receive" but "the sender's own standard feature breaks"

**This problem is resolved by specifying `jp.co.intra_mart.foundation.propagation.model.generic.GenericAccount` for `G` instead of `AccountInfo`.** `GenericAccount` is an official class provided by intra-mart, designed to satisfy the four requirements above.

**Therefore, when receiving intra-mart standard data, always follow this policy:**

- **Keep the `source` attribute as the sender data's fully qualified class name (e.g., the FQCN of `AccountInfo`).** This is a routing identifier and does not need to change
- **For `G` in `Decoder<G, D>` and the return value of `getGenericDataClass()`, specify the corresponding `Generic*` class under the `jp.co.intra_mart.foundation.propagation.model.generic` package — not the `source` class** (see the "Generic Class to Use" column in the table below)
- If no corresponding `Generic*` class can be found or confirmed to exist, you may work around this by **writing your own mirror class extending `AbstractGeneric`** (designed to satisfy this package's four requirements), but always prefer an official intra-mart class when one exists (since it will be kept up to date with field additions and spec changes)
- Never specify the `source` domain model class (such as `AccountInfo`) directly for `G`. Domain model classes from admin/management APIs are not guaranteed to satisfy IM-Propagation's requirements

### List of standard senders

| Category | `source` (fully qualified class name of the sender data) | `operationType` | Generic Class to Use (under `jp.co.intra_mart.foundation.propagation.model.generic`) |
|---|---|---|---|
| Tenant setup completion | `jp.co.intra_mart.system.service.provider.updater.propagation.UpdatedTenant` | `PROC_COMPLETED` | `GenericUpdatedTenant` |
| Tenant info | `jp.co.intra_mart.foundation.admin.tenant.model.TenantInfo` | `DATA_CREATING`/`DATA_CREATED`/`DATA_UPDATING`/`DATA_UPDATED`/`DATA_DELETING`/`DATA_DELETED` | `GenericTenant` |
| System administrator info | `jp.co.intra_mart.foundation.admin.tenant.model.Administrator` | Same set as above | `GenericAdministrator` |
| Account info | `jp.co.intra_mart.foundation.admin.account.model.AccountInfo` | Same set as above | **`GenericAccount` (see the implementation example below)** |
| Role | `jp.co.intra_mart.foundation.admin.role.model.RoleInfo` | Same set as above | `GenericRole` |
| IM-Authz resource group | `jp.co.intra_mart.foundation.authz.model.resources.ResourceGroup` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED` | `GenericAuthzResourceGroup` |
| IM-Authz resource | `jp.co.intra_mart.foundation.authz.model.resources.Resource` | `DATA_CREATED`/`DATA_DELETED` | `GenericAuthzResource` |
| IM-Authz subject group | `jp.co.intra_mart.foundation.authz.model.subjects.SubjectGroup` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED` | `GenericAuthzSubjectGroup` |
| IM-Authz policy | `jp.co.intra_mart.foundation.authz.model.policies.Policy` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED` | `GenericAuthzPolicy` |
| Menu group | `jp.co.intra_mart.foundation.menu.model.MenuGroup` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED` | `GenericMenuGroup` |
| Menu item | `jp.co.intra_mart.system.menu.propagation.HierarchicalMenuItem` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED` | `GenericMenuItem` |
| Calendar info | `jp.co.intra_mart.foundation.calendar.model.CalendarInfo` | `DATA_CREATING`/`DATA_CREATED`/`DATA_UPDATING`/`DATA_UPDATED`/`DATA_DELETING`/`DATA_DELETED` | `GenericCalendar` |
| Day info | `jp.co.intra_mart.foundation.calendar.model.DayInfo` | Same set as above | `GenericDay` |
| Jobnet definition | `jp.co.intra_mart.foundation.job_scheduler.model.jobnet.Jobnet` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED` | `GenericJobnet` |
| Jobnet execution completion | `jp.co.intra_mart.system.job_scheduler.propagation.CompletedJobnetInfoModel` | `PROC_COMPLETED` | `GenericJobnet` (a single class represents both the definition and the execution result, via fields such as `Status`/`StartDate`/`EndDate`) |
| Salesforce watched object | `jp.co.intra_mart.foundation.salesforce.streaming.model.SalesforceEventNotification` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED`/`DATA_UN_DELETED` | No corresponding class was found within the `jp.co.intra_mart.foundation.propagation.model.generic` package. Check the Javadoc individually before implementing |
| Wiki content | `jp.co.intra_mart.foundation.wiki.logic.trigger.WikiContentsInfo` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED` | No corresponding class was found within the `jp.co.intra_mart.foundation.propagation.model.generic` package. Check the Javadoc individually before implementing |

### Implementation example (receiving an account info update, using `GenericAccount`)

```java
package jp.co.intra_mart.sample.audit.propagation.decoder;

import jp.co.intra_mart.foundation.propagation.exception.ConvertException;
import jp.co.intra_mart.foundation.propagation.model.generic.GenericAccount;
import jp.co.intra_mart.foundation.propagation.receiver.AbstractDecoder;

import jp.co.intra_mart.sample.audit.propagation.AccountAuditData;

/**
 * Decoder that converts the intra-mart standard GenericAccount into audit-log data.
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
  <!-- source stays the sender data's (AccountInfo's) FQCN. Only G (the class the decoder actually receives) becomes GenericAccount -->
  <receiver source="jp.co.intra_mart.foundation.admin.account.model.AccountInfo"
            operationType="DATA_UPDATED">
    <decoder class="jp.co.intra_mart.sample.audit.propagation.decoder.AccountInfoDecoder" />
    <procedure class="jp.co.intra_mart.sample.audit.propagation.procedure.AccountAuditProcedure" />
  </receiver>
</propagation-receivers-config>
```

- **Do not change the `source` attribute from the sender data's (`AccountInfo`'s) FQCN.** It is independent from the class used for `G` (`GenericAccount`)
- Main fields of `GenericAccount`: `userCd`/`password`/`locale`/`timeZoneId`/`calendarId`/`encoding`/`firstDayOfWeek`/`dateTimeFormats` (`Map<String, String>`)/`themeIds` (`Map<String, String>`)/`loginFailureCount`/`lockDate` (`Date`)/`validStartDate` (`Date`)/`validEndDate` (`Date`)/`notes`, plus the four fields inherited from `AbstractGeneric` (`executeTenantId`/`executeUserCd`/`ownerTenantId`/`ownerUserCd`)
- The sender-side (intra-mart itself) configuration/implementation cannot be changed. Only the receiver side (the Decoder/Procedure and receiver configuration file generated by this skill) needs to be implemented

## Pattern 2: Sending data to IM-Box (app notifications/watches)

Using the standard `GenericModel` classes provided by IM-Box (in the `jp.co.intra_mart.foundation.propagation.model.generic.imbox` package), a custom module only has to act as the "sender," sending data; the standard implementation on the IM-Box side (the receiver configuration, Decoder, and Procedure are already implemented by intra-mart) processes it. **There is no need to create a new receiver configuration file for this use case.**

### List of standard GenericModel classes

| Use case | GenericModel (under `jp.co.intra_mart.foundation.propagation.model.generic.imbox`) | `operationType` | Description |
|---|---|---|---|
| App notification (thread level) | `GenericSendNoticeThread` | `SEND_NOTICE_THREAD` | Sends a thread-level app notification |
| App notification (message level) | `GenericSendNoticeMessage` | `SEND_NOTICE_MESSAGE` | Sends a message-level app notification |
| Watch notification (thread level) | `GenericSendWatchThread` | `SEND_WATCH_THREAD` | Sends a thread-level watch notification |
| Watch notification (message level) | `GenericSendWatchMessage` | `SEND_WATCH_MESSAGE` | Sends a message-level watch notification |
| Register a watch | `GenericWatch` | `WATCH` | Newly registers a watch |
| Cancel a watch | `GenericUnwatch` | `UNWATCH` | Cancels a watch |

Main fields of `GenericWatch`/`GenericUnwatch`:

- `GenericWatch`: `applicationCd` (the application code) / `watchUserCd` (the user code registering the watch) / `mapTargets` (`Map<String, String>`; key-value pairs identifying the watch target)
- `GenericUnwatch`: `applicationCd` / `unwatchUserCd` (the user code canceling the watch) / `mapTargets`

### Implementation example (registering a watch)

**No Encoder is needed.** Simply assemble the IM-Box standard `GenericModel` (`GenericWatch`) as-is and pass it to `PropagationManager#send()`.

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
 * Registers a leave application as a watch target in IM-Box.
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
            throw new PropagationException("Failed to register the watch.", e);
        } finally {
            manager.close();
        }
    }
}
```

The corresponding sender configuration file:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<propagation-senders-config xmlns="http://www.intra-mart.jp/propagation/senders-config">
  <sender source="jp.co.intra_mart.foundation.propagation.model.generic.imbox.GenericWatch"
          operationType="WATCH">
    <!-- Since GenericWatch is already a GenericModel itself, implement and register an identity (no-op) Encoder -->
    <encoder class="jp.co.intra_mart.sample.leave.propagation.encoder.GenericWatchIdentityEncoder" />
  </sender>
</propagation-senders-config>
```

- Because `PropagationManager#send()` is designed to always convert to a `GenericModel` via an Encoder, even when the data being sent is **already** a `GenericModel` (such as `GenericWatch`), you still need to implement an identity-conversion `Encoder` (returning the input as-is) and register it in the sender configuration file
- Example implementation of an identity-conversion Encoder:

```java
package jp.co.intra_mart.sample.leave.propagation.encoder;

import jp.co.intra_mart.foundation.propagation.exception.ConvertException;
import jp.co.intra_mart.foundation.propagation.sender.AbstractEncoder;
import jp.co.intra_mart.foundation.propagation.model.generic.imbox.GenericWatch;

/**
 * An identity-conversion Encoder for sending data that is already a GenericModel, as-is.
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

## Notes

- **Make the standard `source`/`operationType` match exactly the values listed in this file.** If they do not match, loading the sender/receiver configuration files itself still succeeds, but data never actually flows and nothing at all happens, with no error output
- **When receiving intra-mart standard data, never specify a domain model class (such as `AccountInfo`/`TenantInfo`/`RoleInfo`) directly for `G` in `Decoder<G, D>` — use the class listed in the "Generic Class to Use" column of the table above, from the `jp.co.intra_mart.foundation.propagation.model.generic` package.** Using a domain model class directly risks breaking the sender (an intra-mart standard feature) itself, e.g., due to a missing no-argument constructor. `AccountInfo` is a typical example of this
- **Use the `Generic*` classes as provided by intra-mart, as-is.** They cannot be customized, e.g., by adding fields
- **The `GenericModel` classes used for sending to a standard feature such as IM-Box (`GenericWatch`, etc.) must also be used as-is, as provided by intra-mart.** They cannot be customized, e.g., by adding fields
- If you want to use intra-mart standard data not listed in this file (e.g., a sender added in a newer version), consult the IM-Propagation configuration list (`im_propagation_configuration_list`) and the Javadoc for the `jp.co.intra_mart.foundation.propagation.model.generic` package for the relevant version, and precisely identify the `source`/`operationType`/corresponding `Generic*` class before implementing
