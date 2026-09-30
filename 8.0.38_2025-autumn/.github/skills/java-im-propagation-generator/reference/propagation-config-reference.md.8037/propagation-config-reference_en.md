# IM-Propagation Configuration File Reference (Java Version)

Based on the intra-mart Accel Platform core source (`im_propagation` module) configuration file reference and XSD definitions. Do not supplement elements/attributes from memory or guesswork.

IM-Propagation has three kinds of configuration files.

| Configuration file | Role | Placement (project side) | Single/multiple |
|---|---|---|---|
| `propagation-senders-config` | On sending data, resolves the `Encoder` to use from `source`+`operationType` | `src/main/conf/propagation-senders-config/{any name}.xml` | Multiple files allowed |
| `propagation-receivers-config` | On receiving data, resolves the `Decoder`/`Procedure` to use from `source`+`operationType` | `src/main/conf/propagation-receivers-config/{any name}.xml` | Multiple files allowed |
| `propagation-config` | Global behavior settings for IM-Propagation (deadlock detection, etc.) | `src/main/conf/propagation-config.xml` | A single file |

All of these are copied as-is with the same relative structure into `WEB-INF/conf/` at build time. **Place files directly under the specified directory, without creating a package hierarchy.**

## `propagation-senders-config`

- Namespace: `http://www.intra-mart.jp/propagation/senders-config`
- Root element: `propagation-senders-config`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<propagation-senders-config xmlns="http://www.intra-mart.jp/propagation/senders-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/propagation/senders-config propagation-senders-config.xsd">
  <sender source="jp.co.example.module.SampleData" operationType="DATA_CREATED">
    <encoder class="jp.co.example.module.propagation.encoder.SampleEncoder">
      <params>
        <param key="customKey">customValue</param>
      </params>
    </encoder>
    <required-procedure class="jp.co.example.module.propagation.procedure.RequiredCheckProcedure" />
  </sender>
</propagation-senders-config>
```

### Elements/attributes

| Element/attribute | Required | Description |
|---|---|---|
| `sender` (element) | Required (one or more) | Defines a send target. Has `encoder` (required, one) and `required-procedure` (optional, may repeat) as child elements |
| `sender/@source` | Required | The fully qualified class name of the source data. Must match the class of the data (or the explicitly specified `dataClass`) passed to `PropagationManager#send()` |
| `sender/@operationType` | Required | The operation type. A standard constant from `OperationType`, or a custom string |
| `encoder` (element) | Required (one) | Defines the `Encoder` implementation to use |
| `encoder/@class` | Required | The fully qualified class name of a class implementing `AbstractEncoder` (or the `Encoder` interface) |
| `encoder/params/param` (element) | Optional | A custom parameter passed to the `Encoder`, referenced via `AbstractEncoder#getParamValue(key)`, etc. |
| `encoder/params/param/@key` | Required when `param` is used | The parameter's key |
| `required-procedure` (element) | Optional (may repeat) | Declares a `Procedure` that must always be executed before sending (e.g., for synchronous pre-validation) |
| `required-procedure/@class` | Required when `required-procedure` is used | The fully qualified class name of the `Procedure` implementation to execute |

- Defining multiple `sender` elements for the same `source`+`operationType` combination causes all matching Encoders to be invoked

## `propagation-receivers-config`

- Namespace: `http://www.intra-mart.jp/propagation/receivers-config`
- Root element: `propagation-receivers-config`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<propagation-receivers-config xmlns="http://www.intra-mart.jp/propagation/receivers-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/propagation/receivers-config propagation-receivers-config.xsd">
  <receiver source="jp.co.example.module.SampleData" operationType="DATA_CREATED">
    <decoder class="jp.co.example.other_module.propagation.decoder.SampleDecoder">
      <params>
        <param key="customKey">customValue</param>
      </params>
    </decoder>
    <procedure class="jp.co.example.other_module.propagation.procedure.SampleProcedure" />
  </receiver>
</propagation-receivers-config>
```

### Elements/attributes

| Element/attribute | Required | Description |
|---|---|---|
| `receiver` (element) | Required (one or more) | Defines a receive target. Has `decoder` (required, one) and `procedure` (required, one) as child elements |
| `receiver/@source` | Required | The fully qualified class name of the **sender-side** Data Model. Must match `sender/@source` in the sender configuration file (not the FQCN of the receiver-side Data Model) |
| `receiver/@operationType` | Required | The operation type. Must match `sender/@operationType` in the sender configuration file |
| `decoder` (element) | Required (one) | Defines the `Decoder` implementation to use |
| `decoder/@class` | Required | The fully qualified class name of a class implementing `AbstractDecoder` (or the `Decoder` interface) |
| `decoder/params/param` (element) | Optional | A custom parameter passed to the `Decoder` |
| `procedure` (element) | Required (one) | Defines the `Procedure` implementation to use |
| `procedure/@class` | Required | The fully qualified class name of a class implementing `AbstractProcedure`/`AbstractSessionableProcedure` (or the `Procedure` interface) |
| `procedure/params/param` (element) | Optional | A custom parameter passed to the `Procedure` |

- Multiple `receiver` elements can be defined for the same `source`+`operationType` combination (allowing multiple custom modules to independently receive the same sent data). Processing order is not guaranteed, but each `receiver` is processed exclusively (one thread at a time)

## `propagation-config`

- A single file. The project-side placement is `src/main/conf/propagation-config.xml` (copied to `WEB-INF/conf/propagation-config.xml`)
- Configures IM-Propagation's overall behavior (the sleep times used for deadlock detection)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<propagation-config xmlns="http://www.intra-mart.jp/propagation/config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/propagation/config propagation-config.xsd">
  <each-thread-sleep>100</each-thread-sleep>
  <max-thread-sleep>1000</max-thread-sleep>
</propagation-config>
```

| Element | Type | Default | Range | Description |
|---|---|---|---|---|
| `each-thread-sleep` | integer (milliseconds) | `100` | `0`–`1000` | The wait time per attempt when the same data-processing class is locked by another thread |
| `max-thread-sleep` | integer (milliseconds) | `1000` | `0`–`60000` | The maximum wait time before it is judged to be a deadlock |

- When a deadlock is detected, the send fails, and `PropagationManager#send()` throws `SendException`. Design the sender side to catch `SendException` and call `abort()` (which causes the receiver side's `onAbort` to be called)
- There is normally no need to change the values in this file in ordinary application development. If changing them, do so only after informing the user of the impact (on IM-Propagation processing speed tenant-wide)

## General notes on placement

- Place these under the project's `src/main/conf/` (**not** `src/main/webapp/WEB-INF/conf/`). They are copied into `WEB-INF/conf/` at build time with the same relative structure
- The file names under `propagation-senders-config`/`propagation-receivers-config` are arbitrary (multiple modules may each place their own independent file; including the module ID/feature name is recommended to avoid filename collisions)
- Since XSD validation is performed, write the namespace, element names, and attribute names precisely. Specifying an incorrect namespace prevents the configuration file itself from being loaded
