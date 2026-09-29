# IM-Propagation API Reference (Java Version)

Based on the actual class definitions and Javadoc of the intra-mart Accel Platform core source (the `im_propagation` module). Do not supplement methods from memory or guesswork.

## Package structure

```
jp.co.intra_mart.foundation.propagation
├── PropagationManager          ... The entry point for sending data (interface)
├── PropagationManagerFactory   ... The factory for obtaining a PropagationManager (abstract class)
├── Encoder<D, G>                ... The Data Model -> GenericModel conversion interface
├── Decoder<G, D>                ... The GenericModel -> Data Model conversion interface
└── Procedure<D, R>              ... The business-logic interface for received data

jp.co.intra_mart.foundation.propagation.sender
└── AbstractEncoder<D, G extends Serializable>     ... The abstract implementation of Encoder (extended by the sender side)

jp.co.intra_mart.foundation.propagation.receiver
├── AbstractDecoder<G extends Serializable, D>              ... The abstract implementation of Decoder (extended by the receiver side)
├── AbstractProcedure<D, R extends Serializable>            ... The abstract implementation of Procedure (rides on a DB transaction)
└── AbstractSessionableProcedure<D, R extends Serializable> ... The abstract implementation of Procedure (custom lifecycle control)

jp.co.intra_mart.foundation.propagation.model
├── SendResult<R extends Serializable>     ... The return value of send()
├── ReceiveResult<R extends Serializable>  ... The return value of onReceive()
├── ReceiveParameter                        ... The parameter passed to onReceive()
├── InitializeParameter / InitializeResult  ... The argument/return value of onInitialize()
├── PrepareParameter / PrepareResult        ... The argument/return value of onPrepare()
├── DecideParameter / DecideResult          ... The argument/return value of onDecide()
├── AbortParameter / AbortResult            ... The argument/return value of onAbort()
├── EmptyObject                              ... A placeholder for when no return value is needed
└── generic
    ├── AbstractGeneric                      ... The base class for a GenericModel
    └── imbox
        ├── GenericSendNoticeThread / GenericSendNoticeMessage
        ├── GenericSendWatchThread / GenericSendWatchMessage
        ├── GenericWatch / GenericUnwatch     ... IM-Box's standard GenericModel classes

jp.co.intra_mart.foundation.propagation.code
├── OperationType    ... Standard constants for operationType
└── EventStatus      ... The enum type for the receiving-side processing result status

jp.co.intra_mart.foundation.propagation.exception
└── (The exception hierarchy; described below)
```

## The `PropagationManager` interface

```java
package jp.co.intra_mart.foundation.propagation;

public interface PropagationManager {

    /** Starts a session. Starts a new DB transaction if none is active in the execution context. */
    void begin() throws BeginException;

    /**
     * Sends data (the source data's class is automatically inferred from the actual data).
     * @param operationType The operation type
     * @param data The source data
     * @param resultClass The class of the return value from the receiver side (use EmptyObject.class if not needed)
     */
    <D, R extends Serializable> SendResult<R> send(String operationType, D data, Class<R> resultClass)
            throws SendException;

    /**
     * Sends data (explicitly specifying the source data's class).
     * Use this when the data implements an interface/superclass and you want to resolve source
     * by a different type than the actual class.
     */
    <D, R extends Serializable> SendResult<R> send(String operationType, Class<D> dataClass, D data,
            Class<R> resultClass) throws SendException;

    /** Finalizes (commits) the session. Notifies the receiver side of the commit. A no-op if already ended. */
    void decide() throws DecideException;

    /** Rolls back the session. Notifies the receiver side of the abort. A no-op if already ended. */
    void abort();

    /**
     * Executes a Callable, automating begin/decide/abort.
     * Calls abort if the return value is null or an exception is thrown, and decide otherwise.
     */
    <V> V execute(Callable<V> caller) throws Exception;

    /** Releases resources. Safe to call multiple times. */
    void close();
}
```

- For `send()`'s `operationType`, use a standard constant from the `OperationType` class, or a custom string constant
- `dataClass`/`data` (or `data.getClass()`) must match the `source` attribute of the sender configuration file's (`propagation-senders-config`) `sender` element
- `resultClass` must implement `java.io.Serializable`. Use `EmptyObject.class` when no return value is needed

## The `PropagationManagerFactory` class

```java
package jp.co.intra_mart.foundation.propagation;

public abstract class PropagationManagerFactory {

    /** Obtains the factory instance. */
    public static PropagationManagerFactory getInstance();

    /** Obtains the PropagationManager. */
    public abstract PropagationManager getPropagationManager();
}
```

- Always call it in the form `PropagationManagerFactory.getInstance().getPropagationManager()`

## `Encoder<D, G>` / `AbstractEncoder<D, G>`

```java
package jp.co.intra_mart.foundation.propagation;

public interface Encoder<D, G> {
    G encode(D data) throws ConvertException;
    Class<G> getGenericDataClass();
    void setParamValuesMap(Map<String, List<String>> map);
}
```

```java
package jp.co.intra_mart.foundation.propagation.sender;

public abstract class AbstractEncoder<D, G extends Serializable> implements Encoder<D, G> {

    /** Converts the Data Model (D) into a GenericModel (G). Throws ConvertException on conversion failure. */
    public abstract G encode(D data) throws ConvertException;

    /** Returns the Class object of the GenericModel produced. */
    public abstract Class<G> getGenericDataClass();

    /** Called automatically by the framework. Does not need to be called from application code. */
    public void setParamValuesMap(Map<String, List<String>> map);

    /** Gets the list of keys from the param elements in the sender configuration file. */
    protected Set<String> getParamKeys();

    /** Gets a single (the first) param value for the given key. */
    protected String getParamValue(String key);

    /** Gets multiple param values for the given key. */
    protected List<String> getParamValues(String key);
}
```

- An implementation class must override both `encode` and `getGenericDataClass`
- `getParamKeys`/`getParamValue`/`getParamValues` correspond to `<encoder class="..."><params><param key="...">value</param></params></encoder>` in the sender configuration file

## `Decoder<G, D>` / `AbstractDecoder<G, D>`

```java
package jp.co.intra_mart.foundation.propagation;

public interface Decoder<G, D> {
    D decode(G generic) throws ConvertException;
    Class<G> getGenericDataClass();
    void setParamValuesMap(Map<String, List<String>> map);
}
```

```java
package jp.co.intra_mart.foundation.propagation.receiver;

public abstract class AbstractDecoder<G extends Serializable, D> implements Decoder<G, D> {

    /** Converts a GenericModel (G) into a Data Model (D). Throws ConvertException on conversion failure. */
    public abstract D decode(G generic) throws ConvertException;

    /** Returns the Class object of the GenericModel to be received. */
    public abstract Class<G> getGenericDataClass();

    // setParamValuesMap / getParamKeys / getParamValue / getParamValues are the same as in AbstractEncoder
}
```

## `Procedure<D, R>` / `AbstractProcedure<D, R>` / `AbstractSessionableProcedure<D, R>`

```java
package jp.co.intra_mart.foundation.propagation;

public interface Procedure<D, R> {
    ReceiveResult<R> onReceive(ReceiveParameter parameter, D data) throws ProcedureException, PropagationManagerException;
    InitializeResult onInitialize(InitializeParameter parameter);
    PrepareResult onPrepare(PrepareParameter parameter);
    DecideResult onDecide(DecideParameter parameter) throws ProcedureException;
    AbortResult onAbort(AbortParameter parameter);
    void setParamValuesMap(Map<String, List<String>> map);
}
```

```java
package jp.co.intra_mart.foundation.propagation.receiver;

// For ordinary receiving processes that ride on a DB transaction
public abstract class AbstractProcedure<D, R extends Serializable> implements Procedure<D, R> {

    /** Processes the received data. Since the host (sender) side controls the DB transaction, do not begin/commit it yourself. */
    public abstract ReceiveResult<R> onReceive(ReceiveParameter parameter, D data)
            throws ProcedureException, PropagationManagerException;

    // onInitialize/onPrepare/onDecide/onAbort inherit a default implementation equivalent to "not implemented" (no need to override)
}

// For receiving processes that handle non-DB resources, or that need their own commit judgment
public abstract class AbstractSessionableProcedure<D, R extends Serializable> implements Procedure<D, R> {

    /** Called once at the start of the transaction. */
    public InitializeResult onInitialize(InitializeParameter parameter);

    /** Called on each data receipt. Does not finalize processing at this point. */
    public abstract ReceiveResult<R> onReceive(ReceiveParameter parameter, D data)
            throws ProcedureException, PropagationManagerException;

    /** Called before commit, to judge whether the process can be finalized. */
    public PrepareResult onPrepare(PrepareParameter parameter);

    /** Called at commit time, to perform the actual finalization (execution of side effects). */
    public DecideResult onDecide(DecideParameter parameter) throws ProcedureException;

    /** Called on rollback, to perform cleanup. */
    public AbortResult onAbort(AbortParameter parameter);

    /** A utility method to verify that execution is within a session. */
    protected void checkInSession(ReceiveParameter parameter) throws ProcedureException;

    // setParamValuesMap / getParamKeys / getParamValue / getParamValues are also provided
}
```

- **`AbstractProcedure` overrides only `onReceive`.** All other lifecycle methods inherit a default implementation meaning "not implemented"
- **`AbstractSessionableProcedure` may override only the lifecycle methods it needs.** For example, if no initialization is needed, leave `onInitialize` un-overridden, keeping the inherited default implementation
- Both classes are instantiated via a class loader at runtime, so **a no-argument constructor is required** (do not make the constructor `private`)

## Parameter/result classes (all in the `jp.co.intra_mart.foundation.propagation.model` package)

| Class | Constructor | Main methods |
|---|---|---|
| `SendResult<R>` | `SendResult()` | `addProcedureStatus(ProcedureStatus)` / `addResponse(R)` / `List<ProcedureStatus> getProcedureStatus()` / `List<R> getResponses()` |
| `ReceiveResult<R>` | `ReceiveResult(EventStatus)` / `ReceiveResult(EventStatus, R)` / `ReceiveResult(EventStatus, R, String message)` | `getStatus()` / `getResponse()` / `getMessage()` |
| `ReceiveParameter` | `ReceiveParameter(String dataId, String operationType, String source, boolean inSession)` | `getDataId()` / `getOperationType()` / `getSource()` / `isInSession()` |
| `InitializeParameter` | `InitializeParameter()` | None |
| `InitializeResult` | `InitializeResult(EventStatus)` / `InitializeResult(EventStatus, String message)` | `getStatus()` / `getMessage()` |
| `PrepareParameter` | `PrepareParameter()` | None |
| `PrepareResult` | `PrepareResult(EventStatus)` / `PrepareResult(EventStatus, String message)` | `getStatus()` / `getMessage()` |
| `DecideParameter` | `DecideParameter()` | None |
| `DecideResult` | `DecideResult(EventStatus)` / `DecideResult(EventStatus, String message)` | `getStatus()` / `getMessage()` |
| `AbortParameter` | `AbortParameter()` | None |
| `AbortResult` | `AbortResult(EventStatus)` / `AbortResult(EventStatus, String message)` | `getStatus()` / `getMessage()` |
| `EmptyObject` | `EmptyObject()` | None (a `Serializable` placeholder) |

- All of these implement `java.io.Serializable`
- The `Initialize`/`Prepare`/`Decide`/`Abort` `Parameter` classes have no public methods other than the no-argument constructor (used only internally by the framework)

## `AbstractGeneric` (the base class for a GenericModel)

```java
package jp.co.intra_mart.foundation.propagation.model.generic;

public abstract class AbstractGeneric implements Serializable {

    public String getExecuteTenantId();
    public void setExecuteTenantId(String executeTenantId);

    public String getExecuteUserCd();
    public void setExecuteUserCd(String executeUserCd);

    public String getOwnerTenantId();
    public void setOwnerTenantId(String ownerTenantId);

    public String getOwnerUserCd();
    public void setOwnerUserCd(String ownerUserCd);
}
```

- A custom `GenericModel` extends this class and adds the fields to be sent (declaring its own `serialVersionUID` is recommended)
- `executeTenantId`/`executeUserCd`/`ownerTenantId`/`ownerUserCd` may be automatically filled in from the execution context (the behavior when not set explicitly is implementation-dependent, so set them explicitly when needed)

### How a GenericModel Is Restored (Most Important)

Because `AbstractGeneric implements Serializable`, it is easy to assume that handing off a GenericModel uses standard Java serialization (`ObjectOutputStream`/`ObjectInputStream`), but **the actual internal implementation is a JSON-based conversion (the JSONIC library, `net.arnx.jsonic`).** The receiver side instantiates the class returned by `Decoder#getGenericDataClass()` from a JSON string via reflection (`Class#getDeclaredConstructor()`, **with no arguments**) before passing it to `decode()`.

Consequently, **the class specified as `G` (the GenericModel) in `Decoder<G, D>` must have a `public` no-argument constructor.** Merely implementing `Serializable` is not sufficient.

- A custom `GenericModel` (a class extending `AbstractGeneric`) can normally rely on the implicit default constructor (no-argument, `public`) as long as no explicit constructor is defined, so this is usually not an issue. **If you add a custom constructor, always keep a no-argument constructor as well**
- **Never register an intra-mart standard sender's Data Model (a domain model class from an admin/management API, such as `jp.co.intra_mart.foundation.admin.account.model.AccountInfo`) directly as `G` for receiving.** These classes were not necessarily designed specifically for propagation, and some lack a no-argument constructor. `AccountInfo` (which has only the one-argument constructor `public AccountInfo(String userCd)`) does not meet this requirement
- Registering a class without a no-argument constructor as `G` for receiving causes a `NoSuchMethodException` -> `JSONException` -> `SendException` at the point of JSON conversion, **regardless of whether the receiver-side implementation (Decoder/Procedure) is correct — meaning the sender's own processing fails.** When the sender is an intra-mart standard feature, this can render that entire standard feature (e.g., account updates) unusable — a serious impact

### The `jp.co.intra_mart.foundation.propagation.model.generic` Package (Official GenericModels for Receiving intra-mart Standard Data)

To address the problem above (domain model classes from admin/management APIs not meeting the GenericModel requirements), intra-mart officially provides roughly 30 common model classes extending `AbstractGeneric` in the `jp.co.intra_mart.foundation.propagation.model.generic` package (`GenericAccount`, `GenericTenant`, `GenericRole`, `GenericAdministrator`, `GenericAuthzResource`, `GenericAuthzPolicy`, `GenericAuthzResourceGroup`, `GenericAuthzSubjectGroup`, `GenericMenuGroup`, `GenericMenuItem`, `GenericCalendar`, `GenericDay`, `GenericJobnet`, `GenericJobnetTrigger`, `GenericUpdatedTenant`, etc.).

This package's Javadoc explicitly states the requirements a class holding propagated data must satisfy:

1. Must not use generics (type parameters)
2. Must be a serializable class consisting of simple getters/setters
3. Must have a zero-argument constructor
4. Field types must be limited to primitive types, or classes/interfaces that can be converted to and from serialized data within the propagation feature (including `BigDecimal`/`BigInteger`/`Calendar`/`Collection`/`Date`/`List`/`Locale`/`Map`/`String`/`TimeZone`/`URI`/`URL`/`UUID`, their wrapper types, and arrays of these)

Each class in the `jp.co.intra_mart.foundation.propagation.model.generic` package is designed to satisfy these four requirements. **When receiving intra-mart standard data, keep the `source` attribute as the FQCN of the sender's data (e.g., `AccountInfo`), but specify the corresponding `Generic*` class (e.g., `GenericAccount`) — not the domain model class — as `G` in `Decoder<G, D>`.** This combination is possible because `source` (the routing identifier) and `G` (the class actually reconstructed from JSON) are independent concepts. The combination `AccountInfo` -> `GenericAccount` receives correctly. See `assets/standard-listener-usage.md` for the detailed correspondence table.

## `OperationType` (standard constants)

```java
package jp.co.intra_mart.foundation.propagation.code;

public final class OperationType {
    public static final String DATA_CREATED;
    public static final String DATA_UPDATED;
    public static final String DATA_DELETED;
    public static final String DATA_UN_DELETED;   // Since 8.0.9
    public static final String PROC_STARTED;
    public static final String PROC_SUSPENDED;
    public static final String PROC_RESUMED;
    public static final String PROC_ABORTED;
    public static final String PROC_COMPLETED;
    public static final String PROC_FAILED;
    public static final String REQUEST_SEND;
    public static final String REQUEST_COMMAND;
    public static final String REQUEST_NOTIFY;
    public static final String REQUEST_SEARCH;
}
```

- Use `DATA_*` for CRUD-style data events, `PROC_*` for process (batch/job, etc.) state transitions, and `REQUEST_*` for arbitrary request-style events
- Define a custom string constant only when no standard constant fits a custom business event

## `EventStatus` (the receiving result status)

```java
package jp.co.intra_mart.foundation.propagation.code;

public enum EventStatus {
    UNDEFINED,
    SUCCEEDED,
    NOT_AFFECTED,
    NOT_IMPLEMENTED,
    FAILED
}
```

| Value | Meaning |
|---|---|
| `SUCCEEDED` | Processing succeeded |
| `NOT_AFFECTED` | There was no effect, e.g., because the target of processing did not exist |
| `NOT_IMPLEMENTED` | The corresponding lifecycle process is not implemented (the value returned by the default implementation of `AbstractProcedure`/`AbstractSessionableProcedure`) |
| `FAILED` | Processing failed |
| `UNDEFINED` | Undefined |

## Exception hierarchy (`jp.co.intra_mart.foundation.propagation.exception`)

| Class | Purpose |
|---|---|
| `PropagationException` | The base exception for the whole of IM-Propagation |
| `PropagationManagerException` | Internal `PropagationManager` errors. **Must not be thrown from an Encoder/Decoder/Procedure implementation** |
| `PropagationRuntimeException` | An unrecoverable runtime exception |
| `BeginException` | A failure of `begin()` |
| `SendException` | A failure of `send()` (including deadlock detection) |
| `DecideException` | A failure of `decide()` |
| `SessionException` | A general session failure |
| `SessionRequiredException` | An attempt to process data outside a transaction |
| `DatabaseException` | A DB-related failure |
| `ConvertException` | Thrown by `Encoder`/`Decoder` on a conversion failure (application-facing) |
| `ProcedureException` | Thrown by `Procedure` on a processing failure (application-facing) |

**Implementation guideline:** `Encoder`/`Decoder` should throw a `ConvertException` (or subclass), and `Procedure` should throw a `ProcedureException` (or subclass). The `PropagationManagerException` family is for internal framework use only, and must not be thrown from application code.

## Troubleshooting a session leak

A session started with `begin()` must always be ended via one of `decide()`/`abort()`/`close()`. Leaving it unended can lead to serious problems such as a DB transaction never ending, or the entire section of code that uses IM-Propagation hanging thereafter.

Diagnostic steps (from the appendix):

1. Set the relevant logger's level to `trace` in `WEB-INF/conf/log/im_logger.xml`, then restart and reproduce the issue
2. Search the logs for the message `"primary already used, use secondary"`
3. Trace back from the `"use primary"` stack trace output immediately before that message, to identify the caller of the corresponding `PropagationManagerFactoryImpl.getPropagationManager`
4. Fix the identified caller so that one of `decide()`/`abort()`/`close()` is reliably called
