---
name: java-im-propagation-generator
description: A skillset for using the intra-mart-specific inter-module data linkage API (`jp.co.intra_mart.foundation.propagation.*`, `im_propagation` module) in Java (JavaEE development model) to newly create the full set of data sending via `PropagationManager`, `Encoder`/`GenericModel` (sender side), `Decoder`/`Procedure` (receiver side), and the send/receive configuration files (`propagation-senders-config`/`propagation-receivers-config`/`propagation-config`). Also provides implementation patterns for a listener that receives, in a custom module, data that intra-mart sends by default (change notifications for tenants, accounts, roles, IM-Authz, menus, calendars, jobnets, etc.), as well as patterns for sending data to intra-mart standard features such as IM-Box (app notifications/watches). Use when the user mentions wanting to implement inter-module data linkage in Java, wanting to use `PropagationManager`/`Encoder`/`Decoder`/`Procedure`, wanting to send/receive data with IM-Propagation, or wanting to create a listener that receives an intra-mart standard change notification (tenant creation, role update, etc.). No equivalent API for JSSP (script development model) is provided.
allowed-tools: Bash, Read, Write, Glob
---

# IM-Propagation (Inter-Module Data Linkage) Implementation Support Skill (Java Version)

## Purpose

A skillset for newly implementing the following using the inter-module data linkage API (IM-Propagation, `jp.co.intra_mart.foundation.propagation.*`) provided for the **JavaEE development model** by intra-mart Accel Platform.

1. Sending data from a custom module to another module (or an intra-mart standard feature) — the full sender-side set
2. Processing, in a custom module, data sent from another module (or an intra-mart standard feature) — the full receiver-side set
3. The full set of configuration files that define the send/receive correspondence

IM-Propagation is a loosely-coupled linkage foundation that lets "module A convey a data change or event to module B, within the same transaction (not asynchronously), without knowing module B's implementation (classes)." The sender side never references the receiver side's implementation classes at all — they are tied together solely through the combination of the configuration file's `source` (the fully qualified class name of the data model) and `operationType`.

## Basic Concepts (Most Important)

IM-Propagation's cast consists of 3 sender-side classes, 3 receiver-side classes (6 total), and 3 kinds of configuration files.

```
Sender side                                              Receiver side
────────────                                             ─────────────
(1) Data Model (POJO)                                    (4) Data Model (POJO; need not be the same class as (1))
(2) GenericModel (extends AbstractGeneric; the restorable serialized data shared between sender and receiver)
(3) Encoder (converts (1) -> (2))                         (5) Decoder (converts (2) -> (4))
                                                           (6) Procedure (receives (4) and executes the business logic)

PropagationManager#send(operationType, dataClass, data, resultClass)
  -> propagation-senders-config.xml resolves the Encoder from source(FQCN of (1))+operationType -> produces (2)
  -> propagation-receivers-config.xml resolves the Decoder/Procedure from source(FQCN of (1))+operationType
  -> the Decoder converts (2) -> (4) -> Procedure#onReceive(parameter, (4)) executes the business logic
```

- **`GenericModel` (extends `AbstractGeneric`) is the only data form actually exchanged between the sender and receiver.** The sender's original data ((1)) and the receiver's restored data ((4)) are used only internally within each module and are never exposed externally
- **The sender never knows the receiver's implementation classes (Decoder/Procedure) at all.** The linkage is done solely through the combination of `source` (the fully qualified class name of the data model) + `operationType` in `propagation-senders-config.xml`/`propagation-receivers-config.xml`; no listener registration in Java code is needed
- **The FQCN of the data model specified in `source` is, in effect, an identifier equivalent to a "topic name," and is difficult to change afterward.** Give it a stable name that includes the module ID and feature name (e.g., `jp.co.intra_mart.sample.leave.propagation.LeaveApprovedData`)
- `PropagationManager` is the entry point for sending data, providing session control (often linked to a DB transaction) via `begin()`/`send()`/`decide()`/`abort()`. See `reference/propagation-api-reference.md` for detailed signatures

**This skill covers only Java source files (`.java`) and configuration files (`WEB-INF/conf/propagation-*-config/*.xml`, `WEB-INF/conf/propagation-config.xml`).** No equivalent SSJS API for JSSP (`.js`) is provided.

## Conventions to Reference

| Convention | Handling |
|------|---------|
| `.claude/rules/java-naming.md` | 🟢 **Required reading** — package/class/method/variable naming |
| `.claude/rules/java-code-style.md` | 🟢 **Required reading** — `final` local variables, string literals, etc. |
| `.claude/rules/java-javadoc.md` | 🟢 **Required reading** — class/method JavaDoc |
| `.claude/rules/java-logging.md` | 🟡 When implementing logging (e.g., error logging inside a `Procedure`) |

No dedicated IM-Propagation convention exists under `.claude/rules`. Follow the patterns in `assets/sender-usage.md`/`assets/receiver-usage.md` for the structure and naming of the data model, `GenericModel`, and `Encoder`/`Decoder`/`Procedure`.

`jssp-*` conventions are out of scope for this skill (they do not apply to Java files).

## API Overview

`PropagationManager` (in the `jp.co.intra_mart.foundation.propagation` package) is obtained via `PropagationManagerFactory.getInstance().getPropagationManager()`. On the sender side, implement by extending `AbstractEncoder<D, G>` (in the `jp.co.intra_mart.foundation.propagation.sender` package); on the receiver side, extend `AbstractDecoder<G, D>` and `AbstractProcedure<D, R>`/`AbstractSessionableProcedure<D, R>` (both in the `jp.co.intra_mart.foundation.propagation.receiver` package). The shared data type extends `AbstractGeneric` (in the `jp.co.intra_mart.foundation.propagation.model.generic` package). Always refer to `reference/propagation-api-reference.md` for the detailed signatures and exception hierarchy of all classes, and to `reference/propagation-config-reference.md` for the configuration files' XML elements/attributes/XSD namespaces (do not write these from memory or guesswork).

## What to Generate and Which Templates to Use

### Sending your own data (sender side)

| What to generate | Extends/implements | Template | Approximate location |
|---------|------------|------------|-----------|
| Data Model (the source POJO) | None (an ordinary POJO) | `assets/sender-usage.md` | `{featureName}/propagation/` |
| GenericModel | Extends `AbstractGeneric` | `assets/sender-usage.md` | `{featureName}/propagation/` |
| Encoder | Extends `AbstractEncoder<D, G>` | `assets/sender-usage.md` | `{featureName}/propagation/encoder/` |
| Send processing (calling `PropagationManager`) | None (call-site code) | `assets/sender-usage.md` | Inside a service class or other business-logic class |
| Sender configuration file | `propagation-senders-config` | `assets/sender-usage.md` | `WEB-INF/conf/propagation-senders-config/{any name}.xml` |

### Receiving data from another module or an intra-mart standard feature (receiver side)

| What to generate | Extends/implements | Template | Approximate location |
|---------|------------|------------|-----------|
| Data Model (the target POJO) | None (an ordinary POJO) | `assets/receiver-usage.md` | `{featureName}/propagation/` |
| Decoder | Extends `AbstractDecoder<G, D>` | `assets/receiver-usage.md` | `{featureName}/propagation/decoder/` |
| Procedure (for DB processing) | Extends `AbstractProcedure<D, R>` | `assets/receiver-usage.md` | `{featureName}/propagation/procedure/` |
| Procedure (for non-DB resources, or when custom transaction control is needed) | Extends `AbstractSessionableProcedure<D, R>` | `assets/receiver-usage.md` | `{featureName}/propagation/procedure/` |
| Receiver configuration file | `propagation-receivers-config` | `assets/receiver-usage.md` | `WEB-INF/conf/propagation-receivers-config/{any name}.xml` |

### Sending/receiving intra-mart standard data (standard listeners)

| Use case | Template |
|------|------------|
| Receiving, in a custom module, data that intra-mart sends by default (change notifications for tenants, accounts, roles, IM-Authz, menus, calendars, jobnets, Salesforce integration, Wiki, etc.) | `assets/standard-listener-usage.md` |
| Sending data from a custom module to the receiving process (`GenericModel`) prepared by an intra-mart standard feature, such as IM-Box (app notification, registering/canceling a watch) | `assets/standard-listener-usage.md` |

### Reference

- `reference/propagation-api-reference.md` — All methods and signatures of `PropagationManager`/`PropagationManagerFactory`/`Encoder`/`Decoder`/`Procedure`/`AbstractGeneric`/`ReceiveResult`/`EventStatus`/`OperationType`/the exception hierarchy (based on the actual platform API class definitions — do not write from memory)
- `reference/propagation-config-reference.md` — Details of the XML elements, attributes, XSD namespaces, and placement locations for `propagation-senders-config`/`propagation-receivers-config`/`propagation-config`

## When to Use This Skill

Use this skill when the user makes a request such as:
- "Implement inter-module data linkage in Java"
- "I want to send data using `PropagationManager`"
- "Create processing that sends custom data using Encoder/GenericModel"
- "Create processing that receives data from another module using Decoder/Procedure"
- "Create the sender configuration file (`propagation-senders-config`) / receiver configuration file (`propagation-receivers-config`)"
- "Implement a listener that receives an intra-mart standard change notification, such as tenant creation or a role update"
- "I want to register an IM-Box watch from a custom module"

Even without explicit mention of "in Java" or "in the JavaEE development model," this skill always applies, since no SSJS API equivalent to IM-Propagation exists for JSSP (script development model).

## Implementation Steps

1. Gather the user's requirements
   - Whether the custom module is the sender, the receiver, or both
   - If sender: the content of the data to send, the send timing (whether it should be in the same transaction as a DB update), and the `operationType` (chosen from the standard constants in `reference/propagation-api-reference.md`, or a custom string)
   - If receiver: whether the source is "another custom module" or "intra-mart standard data" (for the latter, `source`/`operationType` are fixed, so choose from the list in `assets/standard-listener-usage.md`), and whether the received data's processing can ride on a DB transaction (if not, consider `AbstractSessionableProcedure`)
2. When implementing the sender side, refer to `assets/sender-usage.md` and implement in the order: Data Model -> `GenericModel` (extends `AbstractGeneric`) -> `Encoder` (extends `AbstractEncoder`) -> `PropagationManager` call-site code -> sender configuration file (always refer to `reference/propagation-api-reference.md` for method signatures — do not write from memory or guesswork)
3. When implementing the receiver side, refer to `assets/receiver-usage.md` and implement in the order: `Decoder` (extends `AbstractDecoder`) -> `Procedure` (extends `AbstractProcedure` or `AbstractSessionableProcedure`) -> receiver configuration file. **Make `source`/`operationType` match exactly with the sender side (step 2 for a custom sender, or the list in `assets/standard-listener-usage.md` for intra-mart standard data)**. **Before implementing, always verify that the class specified as `G` in `Decoder<G, D>` has a `public` no-argument constructor** (registering one without it for receiving breaks the sender's own processing — see "Notes"). **When receiving intra-mart standard data, do not use a domain model class directly for `G` — use the corresponding `Generic*` class from the `jp.co.intra_mart.foundation.propagation.model.generic` package** (see the correspondence table in `assets/standard-listener-usage.md`, and also verify first in a test environment)
4. The `GenericModel` class and field composition need not be exactly the same class between sender and receiver, but a large divergence in field names/types loses data on restoration. Agree with the user on whether to use the same `GenericModel` class (e.g., placed in a shared library) between sender and receiver, or to define them individually with the field composition kept in mind
5. Confirm compliance with `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md`

## Placement Conventions

### Base package/directory

If the project already has a Java package convention, follow it. Otherwise, default to the following, following the example in `.claude/rules/java-naming.md`. **This default is only a fallback; the user's explicit instructions take priority.**

```
{basePackage}.{featureName}.propagation
{basePackage}.{featureName}.propagation.encoder    ... Encoder implementation (sender side only)
{basePackage}.{featureName}.propagation.decoder    ... Decoder implementation (receiver side only)
{basePackage}.{featureName}.propagation.procedure  ... Procedure implementation (receiver side only)
```

Example: feature name `leave` (leave application), base package `jp.co.intra_mart.sample`

```
jp.co.intra_mart.sample.leave.propagation            -> LeaveApprovedData.java (Data Model)
                                                         LeaveApprovedGeneric.java (GenericModel)
jp.co.intra_mart.sample.leave.propagation.encoder    -> LeaveApprovedEncoder.java
jp.co.intra_mart.sample.leave.propagation.decoder    -> LeaveApprovedDecoder.java
jp.co.intra_mart.sample.leave.propagation.procedure  -> LeaveApprovedProcedure.java
```

### Configuration file placement

```
src/main/conf/propagation-senders-config/{any name}.xml     ... Sender configuration (not src/main/webapp/WEB-INF/conf/)
src/main/conf/propagation-receivers-config/{any name}.xml   ... Receiver configuration
src/main/conf/propagation-config.xml                          ... Global configuration (deadlock detection, etc.; a single file)
```

All of these are copied as-is with the same relative structure into `WEB-INF/conf/` at build time (place files directly, without creating a package hierarchy).

### Class naming

Follow the PascalCase rules in `.claude/rules/java-naming.md`. Use suffixes matching the role:

| Role | Suffix | Example |
|------|------------|-----|
| GenericModel | `Generic` | `LeaveApprovedGeneric` |
| Encoder | `Encoder` | `LeaveApprovedEncoder` |
| Decoder | `Decoder` | `LeaveApprovedDecoder` |
| Procedure | `Procedure` | `LeaveApprovedProcedure` |

**Priority of placement paths:** If the user explicitly specifies a package/path in the prompt, that instruction takes top priority. This skill's default is only a fallback.

## Notes

- **[Most Important] The class specified as `G` (the GenericModel) in `Decoder<G, D>` must have a `public` no-argument constructor.** IM-Propagation does not use `Serializable` to hand off a GenericModel; internally it uses a JSON-based conversion, and the receiver side reconstructs the class via reflection (a no-argument constructor) before passing it to `decode()`. **If a class without a no-argument constructor is registered as `G` for receiving, the sender's own processing fails with a `SendException`, regardless of whether the receiver-side implementation is correct.** When the sender is an intra-mart standard feature, this can render that entire standard feature unusable — a serious impact. `jp.co.intra_mart.foundation.admin.account.model.AccountInfo` (which has only the one-argument constructor `public AccountInfo(String userCd)`) does not meet this requirement
- **When receiving intra-mart standard data, do not specify a domain model class such as `AccountInfo` directly as `G`; instead use the official `Generic*` classes (`GenericAccount`, `GenericTenant`, `GenericRole`, etc.) provided by the `jp.co.intra_mart.foundation.propagation.model.generic` package.** Keep the `source` attribute (used for routing) as the domain model class's FQCN, and only swap `G` (the class actually reconstructed from JSON) for the corresponding `Generic*` class. The combination `AccountInfo` -> `GenericAccount` receives correctly. See "The `jp.co.intra_mart.foundation.propagation.model.generic` Package" in `reference/propagation-api-reference.md` and the correspondence table in `assets/standard-listener-usage.md` for details. Only when no corresponding `Generic*` class can be found should you consider a custom mirror class satisfying this package's requirements (a no-argument constructor, etc.), and even then verify first in a test environment before deploying to anything resembling production
- **A `PropagationManager` session (one started with `begin()`) must always be ended via one of `decide()`/`abort()`/`close()`.** Leaving it unended can lead to serious problems such as a DB transaction never ending, or subsequent acquisitions via `PropagationManagerFactory` hanging. The standard pattern is to place `abort()` in a `finally` block (it is a safe no-op if `decide()` has already been called, so there is no need to fear a duplicate call)
- **`Encoder`/`Decoder` must throw a `ConvertException` (or subclass) on a conversion failure, and `Procedure` must throw a `ProcedureException` (or subclass) on a processing failure.** `PropagationManagerException` is an exception for internal framework use, and must not be thrown from application code (the Encoder/Decoder/Procedure implementations)
- **`operationType` must match exactly, as a string, between the sender and receiver sides.** Prefer the standard constants (the `OperationType` class: `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED`/`PROC_STARTED`/`PROC_COMPLETED`, etc.), and define a custom string constant only when representing a custom operation
- **The FQCN of the data model specified in the `source` attribute is difficult to change afterward.** When renaming a class (e.g., during a refactor), inform the user that both the running sender and receiver configuration files need to be updated
- **If the receiver-side Procedure is ordinary business logic that requires a DB transaction, use `AbstractProcedure`.** It rides on the host (sender) side's transaction, so the Procedure does not need to start/end its own transaction
- **If the receiver-side processing handles a non-DB resource (an external API call, file operation, etc.) and needs to perform its own judgment/finalization processing before commit, use `AbstractSessionableProcedure`.** Implement it with the two-phase-commit-like lifecycle: `onInitialize` -> `onReceive` -> `onPrepare` -> `onDecide`/`onAbort`
- `propagation-config.xml` (`each-thread-sleep`/`max-thread-sleep`) is a sleep-time setting for deadlock detection, and does not need to be changed in ordinary application development. If changing the values, confirm the intent with the user
- **When receiving intra-mart standard data, make `source`/`operationType` match exactly the values listed in `assets/standard-listener-usage.md`.** Using a value guessed independently causes the receiver configuration file to not function, with the receiving process silently never being called and no error at all
- **When sending to an intra-mart standard feature such as IM-Box, the corresponding receiver side (Decoder/Procedure) is already implemented on the intra-mart side, so there is no need for the application to create a receiver configuration file.** Implement only the full sender-side set (the data model, the standard-provided `GenericModel`, and the sender configuration file)

## Post-Generation Checks

Rather than an automated validation script, verify the following manually.

1. Whether the sender configuration file's `source`/`operationType` matches exactly with the receiver configuration file's `source`/`operationType` (or, for intra-mart standard data, the values listed in `assets/standard-listener-usage.md`)
2. Whether `Encoder`/`Decoder` throws a `ConvertException` (or subclass) on a conversion failure, and `Procedure` throws a `ProcedureException` (or subclass) on a processing failure (and that `PropagationManagerException` is not mistakenly thrown)
3. Whether the `PropagationManager` session (`begin()`) is reliably ended via one of `decide()`/`abort()`/`close()` on every execution path (both the normal path and exception paths)
4. Whether the `GenericModel` class (extending `AbstractGeneric`) correctly implements `Serializable` and defines `serialVersionUID`
5. **Whether the class specified as `G` in `Decoder<G, D>` has a `public` no-argument constructor (check especially carefully if a custom class defines additional constructors). When receiving intra-mart standard data, whether `G` uses the corresponding `Generic*` class from the `jp.co.intra_mart.foundation.propagation.model.generic` package rather than a domain model class directly, and whether this was verified in a test environment before deploying to anything resembling production**
6. Whether `AbstractProcedure`/`AbstractSessionableProcedure` is chosen appropriately depending on whether the receiver-side Procedure requires a DB transaction
7. Whether the configuration files are placed under `src/main/conf/propagation-senders-config/`/`src/main/conf/propagation-receivers-config/` (not `src/main/webapp/WEB-INF/conf/`)
8. Whether the code complies with `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md`
9. `jssp-code-review` / `jssp-security-check` are JSSP-specific and do not apply to this skill's output. If the project has a separate Java-specific code review / security check skill, use that instead

## Boundaries with Other Skills

| Responsibility | Owning Skill |
|------|-----------|
| **IM-Propagation send/receive implementation in Java (JavaEE development model) (`PropagationManager`/`Encoder`/`Decoder`/`Procedure`/configuration files)** | **This skill** |
| The equivalent implementation in JSSP (script development model) | No equivalent SSJS API is provided (out of scope for this skill) |
| IM-Workflow's action processing, arrival processing, etc. (an extension mechanism independent of IM-Propagation) | `java-im-workflow-usage` (Java) / `jssp-im-workflow-usage` (JSSP) |
| CRUD on the IM common master data itself (users, organizations, etc.) | `java-im-master-usage`. Use together with this skill when receiving IM common master change notifications via IM-Propagation |
