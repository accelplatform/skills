# Sender-Side Implementation Patterns (PropagationManager / Encoder / GenericModel)

See `reference/propagation-api-reference.md` for the signatures and internal behavior of `PropagationManager`/`Encoder`/`AbstractGeneric`. This file shows typical implementation patterns.

## Implementation order

1. Data Model (the source POJO; an existing business entity may be used as-is)
2. GenericModel (extends `AbstractGeneric`; the serialized data after conversion from the Data Model)
3. Encoder (extends `AbstractEncoder`; converts Data Model -> GenericModel)
4. Sender configuration file (`propagation-senders-config`)
5. `PropagationManager` call-site code (e.g., in a service class that performs the business logic)

## Pattern 1: Defining the GenericModel

Extend `AbstractGeneric` and define the fields to send. The inherited `executeTenantId`/`executeUserCd`/`ownerTenantId`/`ownerUserCd` are available automatically (if not set explicitly, `PropagationManager` may fill them in from the execution context).

```java
package jp.co.intra_mart.sample.leave.propagation;

import jp.co.intra_mart.foundation.propagation.model.generic.AbstractGeneric;

/**
 * GenericModel used to convey the completion of a leave application's approval.
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

- `AbstractGeneric` already implements `Serializable`, but the subclass adding fields should still declare its own `serialVersionUID`
- Field types must be limited to types that implement `Serializable` (primitives, wrapper types, `String`, date types, etc.)
- The receiver side does not have to use the exact same `GenericModel` class, but a divergence in field names/types loses data on restoration; sharing the same class (e.g., via a shared library) between sender and receiver is the safest approach

## Pattern 2: Implementing the Encoder

```java
package jp.co.intra_mart.sample.leave.propagation.encoder;

import jp.co.intra_mart.foundation.propagation.exception.ConvertException;
import jp.co.intra_mart.foundation.propagation.sender.AbstractEncoder;

import jp.co.intra_mart.sample.leave.entity.LeaveApplicationEntity;
import jp.co.intra_mart.sample.leave.propagation.LeaveApprovedGeneric;

/**
 * Encoder that converts a leave application entity into a LeaveApprovedGeneric.
 */
public class LeaveApprovedEncoder extends AbstractEncoder<LeaveApplicationEntity, LeaveApprovedGeneric> {

    @Override
    public LeaveApprovedGeneric encode(final LeaveApplicationEntity data) throws ConvertException {
        if (data == null || data.getApplicationId() == null) {
            throw new ConvertException("A required field is missing from the source data.");
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

- On a conversion failure (a missing required field, a type conversion error, etc.), throw a `ConvertException` (or subclass). Do not throw `PropagationManagerException`
- `getGenericDataClass()` returns the `Class` object of the `GenericModel` produced (used internally by the framework for class resolution)
- To pass custom parameters via the `param` elements in the sender configuration file, reference them with `AbstractEncoder#getParamKeys()`/`getParamValue(String)`/`getParamValues(String)` (`setParamValuesMap` is called automatically by the framework and does not need to be implemented)

## Pattern 3: The sender configuration file

Place it under `WEB-INF/conf/propagation-senders-config/{any name}.xml` (the project's `src/main/conf/propagation-senders-config/`). Specify the Data Model's (the Encoder's type parameter `D`) fully qualified class name as `source`.

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

- `source` must match the fully qualified class name of the `data` (or the explicitly specified `dataClass`) passed to `PropagationManager#send()`
- For `operationType`, prefer the standard constants in `OperationType` in `reference/propagation-api-reference.md` (`DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED`/`PROC_STARTED`/`PROC_COMPLETED`, etc.). Define a custom string constant only to represent a custom business event
- To pass custom parameters to the `encoder`, add `<params><param key="...">value</param></params>` as a child of `<encoder class="...">`
- Defining multiple `sender` elements for the same `source`+`operationType` combination invokes multiple Encoders (use only when there is a reason to)

## Pattern 4: Sending data via `PropagationManager`

### Basic form (`begin`/`send`/`decide`/`abort`)

```java
package jp.co.intra_mart.sample.leave.service;

import jp.co.intra_mart.foundation.propagation.PropagationManager;
import jp.co.intra_mart.foundation.propagation.PropagationManagerFactory;
import jp.co.intra_mart.foundation.propagation.exception.PropagationException;
import jp.co.intra_mart.foundation.propagation.model.EmptyObject;
import jp.co.intra_mart.foundation.propagation.model.SendResult;

import jp.co.intra_mart.sample.leave.entity.LeaveApplicationEntity;

/**
 * Notifies that a leave application has been approved.
 */
public class LeaveApprovalService {

    public void notifyApproved(final LeaveApplicationEntity entity) throws PropagationException {
        final PropagationManager manager = PropagationManagerFactory.getInstance().getPropagationManager();
        try {
            manager.begin();

            // Perform the DB update processing here (e.g., saving the approval status)

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

- `begin()` starts the session, starting a new DB transaction if none is active in the execution context. **Perform business-logic DB updates after `begin()` and before `decide()`** (to keep them within the same transaction)
- `abort()` is safe to call on a session that has already been `decide()`d (it is a no-op), so it can always be placed in a `finally` block
- When no return value is needed, specify `jp.co.intra_mart.foundation.propagation.model.EmptyObject` as `resultClass`
- Always call `close()` after `abort()`/`decide()` to release resources (safe to call multiple times)

### Using `execute(Callable)` (automates begin/decide/abort)

```java
final PropagationManager manager = PropagationManagerFactory.getInstance().getPropagationManager();
try {
    manager.execute(() -> {
        // DB update processing
        return manager.send("DATA_UPDATED", entity, EmptyObject.class);
    });
} finally {
    manager.close();
}
```

- `execute()` internally calls `begin()`, then automatically calls `decide()` if the `Callable` returns a normal value, or `abort()` if it returns `null` or throws
- `send()` itself can throw the checked exception `SendException`. Since it can simply ride on `Callable#call()`'s `throws Exception`, there is little need for the caller to try-catch it individually

### A case not requiring session management (a one-off send not linked to a DB transaction)

```java
final PropagationManager manager = PropagationManagerFactory.getInstance().getPropagationManager();
try {
    manager.send("DATA_UPDATED", entity, EmptyObject.class);
} finally {
    manager.close();
}
```

- It is also possible to call only `send()` without calling `begin()`/`decide()`. However, if the send must complete within the same transaction as a DB update (i.e., the receiver's `AbstractProcedure` is expected to ride on the host's transaction), always wrap it with `begin()`/`decide()`

## Anti-Patterns (Avoid)

```java
// BAD: A session started with begin() is not ended via decide()/abort()/close()
manager.begin();
manager.send("DATA_UPDATED", entity, EmptyObject.class);
manager.decide();
// close() is never called (can cause a resource leak)

// BAD: The Encoder throws something other than ConvertException on a conversion failure
@Override
public LeaveApprovedGeneric encode(final LeaveApplicationEntity data) {
    return new LeaveApprovedGeneric(); // returns incomplete data without checking required fields

// BAD: The FQCN specified as source does not match the class of the data actually passed to send()
// (the sender element's source is LeaveApplicationEntity, but the code calls
//  send("DATA_UPDATED", someOtherClassInstance, EmptyObject.class))

// BAD: operationType does not match between the sender configuration file and the call-site code
// (e.g., the configuration uses "DATA_UPDATED" while the code uses "UPDATED")
manager.send("UPDATED", entity, EmptyObject.class);
```
