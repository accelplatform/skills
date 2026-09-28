# Receiver-Side Implementation Patterns (Decoder / Procedure)

See `reference/propagation-api-reference.md` for the signatures and internal behavior of `Decoder`/`Procedure`/`AbstractProcedure`/`AbstractSessionableProcedure`. This file shows typical implementation patterns.

## Implementation order

1. Data Model (the target POJO; need not be the same class as the sender's)
2. Decoder (extends `AbstractDecoder`; converts GenericModel -> Data Model)
3. Procedure (extends `AbstractProcedure` or `AbstractSessionableProcedure`; executes the business logic)
4. Receiver configuration file (`propagation-receivers-config`)

**Make `source`/`operationType` match exactly with the sender-side value** (the sender configuration file for a custom module, or the list in `assets/standard-listener-usage.md` for intra-mart standard data).

## Pattern 1: Implementing the Decoder

```java
package jp.co.intra_mart.sample.notify.propagation.decoder;

import jp.co.intra_mart.foundation.propagation.exception.ConvertException;
import jp.co.intra_mart.foundation.propagation.receiver.AbstractDecoder;

import jp.co.intra_mart.sample.leave.propagation.LeaveApprovedGeneric;
import jp.co.intra_mart.sample.notify.propagation.LeaveApprovedNotifyData;

/**
 * Decoder that converts a LeaveApprovedGeneric into data for the notification process.
 */
public class LeaveApprovedDecoder extends AbstractDecoder<LeaveApprovedGeneric, LeaveApprovedNotifyData> {

    @Override
    public LeaveApprovedNotifyData decode(final LeaveApprovedGeneric generic) throws ConvertException {
        if (generic == null || generic.getApplicationId() == null) {
            throw new ConvertException("A required field is missing from the received data.");
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

- On a conversion failure, throw a `ConvertException` (or subclass). Do not throw `PropagationManagerException`
- `getGenericDataClass()` returns the `Class` object of the `GenericModel` being received
- As with `AbstractEncoder`, `getParamKeys()`/`getParamValue(String)`/`getParamValues(String)` can be used to reference the `param` values from the receiver configuration file

## Pattern 2: Implementing the Procedure (the normal pattern riding on a DB transaction)

Use `AbstractProcedure` for business logic — such as a DB update — that completes within the same transaction as the sender.

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
 * Procedure that receives the leave-approval-completed notification and inserts it into the notification table.
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
            entity.setMessage("Your leave application has been approved.");
            notifyRepository.insert(entity);

            return new ReceiveResult<EmptyObject>(EventStatus.SUCCEEDED);
        } catch (final RuntimeException e) {
            throw new ProcedureException("Failed to register the notification.", e);
        }
    }
}
```

- **`AbstractProcedure` is instantiated via a class loader (a no-argument constructor is required).** Do not make the constructor `private`
- Do not perform your own transaction control (a begin/commit equivalent) inside `onReceive()`. Since it is expected to ride on the transaction hosted by the sender, DB updates can simply be executed directly
- Return the processing result via a `ReceiveResult` carrying an `EventStatus` (`SUCCEEDED`/`NOT_AFFECTED`/`NOT_IMPLEMENTED`/`FAILED`). Use `EmptyObject` as the type parameter when no return value is needed
- On a processing failure, throw a `ProcedureException` (or subclass). Throwing it causes the sender's `decide()` to fail, rolling back the sender's entire session (this is also propagated to other receivers via `abort()`)

## Pattern 3: Implementing the Procedure (for non-DB resources)

Use `AbstractSessionableProcedure` for processing that cannot ride on a DB transaction (an external API call, file operation, etc.), or that needs its own finalization judgment before commit.

```java
package jp.co.intra_mart.sample.notify.propagation.procedure;

import jp.co.intra_mart.foundation.propagation.code.EventStatus;
import jp.co.intra_mart.foundation.propagation.exception.ProcedureException;
import jp.co.intra_mart.foundation.propagation.model.*;
import jp.co.intra_mart.foundation.propagation.receiver.AbstractSessionableProcedure;

import jp.co.intra_mart.sample.notify.propagation.LeaveApprovedNotifyData;

/**
 * Procedure that notifies an external system of a leave approval (has its own finalization step because it calls an external API).
 */
public class LeaveApprovedExternalNotifyProcedure
        extends AbstractSessionableProcedure<LeaveApprovedNotifyData, EmptyObject> {

    private String pendingPayload;

    @Override
    public InitializeResult onInitialize(final InitializeParameter parameter) {
        // Initialization called once at the start of the transaction (override only if needed)
        return new InitializeResult(EventStatus.SUCCEEDED);
    }

    @Override
    public ReceiveResult<EmptyObject> onReceive(final ReceiveParameter parameter,
            final LeaveApprovedNotifyData data) throws ProcedureException {
        // Do not finalize the external send at this point (only assemble the payload)
        this.pendingPayload = buildPayload(data);
        return new ReceiveResult<EmptyObject>(EventStatus.SUCCEEDED);
    }

    @Override
    public PrepareResult onPrepare(final PrepareParameter parameter) {
        // A final check before commit (e.g., whether the external system is reachable). Return "ready" if OK
        return new PrepareResult(EventStatus.SUCCEEDED);
    }

    @Override
    public DecideResult onDecide(final DecideParameter parameter) throws ProcedureException {
        try {
            sendToExternalSystem(pendingPayload);
            return new DecideResult(EventStatus.SUCCEEDED);
        } catch (final RuntimeException e) {
            throw new ProcedureException("Failed to send the notification to the external system.", e);
        }
    }

    @Override
    public AbortResult onAbort(final AbortParameter parameter) {
        // Cleanup for when the sender's session is rolled back (nothing in particular here)
        this.pendingPayload = null;
        return new AbortResult(EventStatus.SUCCEEDED);
    }

    private String buildPayload(final LeaveApprovedNotifyData data) {
        return data.getApplicationId() + ":" + data.getApplicantUserCd();
    }

    private void sendToExternalSystem(final String payload) {
        // An HTTP call to an external API, etc. (implementation omitted)
    }
}
```

- The lifecycle is called in the order `onInitialize` (once at transaction start) -> `onReceive` (on each data receipt) -> `onPrepare` (judging whether it can be finalized before commit) -> `onDecide` (finalization)/`onAbort` (cleanup on rollback) — a structure close to a two-phase commit
- **Do not finalize processing at the point of `onReceive()`.** Perform the actual side effect (the external API call, etc.) in `onDecide()`. If the sender subsequently calls `abort()`, a side effect already finalized in `onReceive()` cannot be undone
- Unused lifecycle methods may be left as the inherited default implementation (there is no need to force-override all of them)
- `checkInSession(ReceiveParameter)` is available as a utility method to verify the session state if needed

## Pattern 4: The receiver configuration file

Place it under `WEB-INF/conf/propagation-receivers-config/{any name}.xml` (the project's `src/main/conf/propagation-receivers-config/`). Specify the **sender-side** Data Model's fully qualified class name as `source` (note: not the FQCN of the receiver-side Data Model).

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

- `source`/`operationType` must match the sender-side value exactly (the `source`/`operationType` of the sender configuration file's `sender` element, or the listed value in `assets/standard-listener-usage.md` for intra-mart standard data)
- Multiple `receiver` elements may be defined for the same `source`+`operationType` (allowing the same sent data to be received independently by multiple custom modules). Processing order is not guaranteed, but each `receiver` is processed exclusively (one thread at a time)
- Adding `<params><param key="...">value</param></params>` as a child of `decoder`/`procedure` respectively allows referencing custom parameters inside `AbstractDecoder`/`AbstractProcedure` (and `AbstractSessionableProcedure` likewise)

## Anti-Patterns (Avoid)

```java
// BAD: Performing your own transaction control inside AbstractProcedure#onReceive()
// (it is expected to ride on the host's transaction, so a custom commit/rollback is both unnecessary and harmful)

// BAD: Finalizing an irreversible side effect (e.g., an external API call) at the point of
// AbstractSessionableProcedure#onReceive() (it cannot be undone in onAbort(), leaving data inconsistency
// even if the sender rolls back)

// BAD: Specifying the receiver-side Data Model's FQCN as the receiver configuration file's source
// (source must always specify the sender-side Data Model's FQCN)
<receiver source="jp.co.intra_mart.sample.notify.propagation.LeaveApprovedNotifyData" ...>

// BAD: Decoder/Procedure throwing PropagationManagerException instead of ConvertException/ProcedureException
// even where it would not cause a compile error (it is an exception reserved for internal framework use — do not misuse it)
```
