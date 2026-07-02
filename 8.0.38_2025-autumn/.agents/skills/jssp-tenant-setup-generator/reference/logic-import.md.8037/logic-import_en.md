# IM-LogicDesigner Import Specification

During tenant environment setup, IM-LogicDesigner import data (ZIP) is loaded via `LogicFlowImporter`. Unlike IM-Workflow, splitting into `<data>` sections is not required; the ZIP produced at export time is passed directly to `importData(InputStream)`.

## spec.json Specification

```json
"logicImport": {
  "files": [
    "im-logicdesigner-data-sample-simple.zip"
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `logicImport.files` | string[] | Enumerates file names under `src/main/storage/public/im_logic/`. Multiple entries are allowed and they are loaded in the order specified |

When omitted or when `files` is an empty array, nothing is output.

## Build-Time Artifacts

The build script outputs the following.

| Kind | Path |
|---|---|
| Import ZIP (copy) | `src/main/storage/system/products/import/basic/<key>/<version>/<file>.zip` |
| Extended import JS | `src/main/jssp/src/<key>/initialize/<version>/<key>_logic_import.js` |
| Addition to import-config.xml | A `<extends-import-class>` line is added to the `<extends-import>` section |

### Copy Processing

`src/main/storage/public/im_logic/<file>.zip` is copied to `src/main/storage/system/products/import/basic/<key>/<version>/<file>.zip`. No subdirectories are created; files are placed flat directly under `<version>/` (same as IM-Workflow).

### Extended Import JS

`<key>_logic_import.js` has `doImport(tenantId)` as its entry point, and loads each ZIP in the order of `spec.logicImport.files` to perform the import.

When `spec.extendsImport` / `workflowImport` / `logicImport` are used together, each JS is generated independently and **output in parallel in the following order** within the `<extends-import>` section:

```
<extends-import-class>...<key>_import.js</extends-import-class>             ← extendsImport
<extends-import-class>...<key>_workflow_import.js</extends-import-class>    ← workflowImport
<extends-import-class>...<key>_logic_import.js</extends-import-class>       ← logicImport
```

## Processing Performed by the Extended Import JS

```
doImport(tenantId)
  ├ LogicServiceProvider.getInstance().getLogicFlowImporter()  Obtain importer via direct Java access
  └ for each sourceFile:
      importLogicFile()
        ├ readAllBytes()       Aggregate all bytes from SystemStorage into a Java byte[]
        ├ Create a ByteArrayInputStream
        ├ importer.importData(inputStream)
        └ inputStream.close() (finally)

readAllBytes(sourceStorage)
  ├ Allocate a ByteArrayOutputStream
  ├ Append output for each chunk (8KB units) via ByteReader#eachBytes
  └ Extract the Java byte[] with output.toByteArray()
```

## How to Use the API

### Direct Java Access Is Required

IM-LogicDesigner has **no general-purpose SSJS API** corresponding to IM-Workflow's `DataImportExecutor`. `jp.co.intra_mart.foundation.logic.LogicFlowImporter` is a Java interface and must be referenced from SSJS via `Packages.***`.

```javascript
let importer = Packages.jp.co.intra_mart.foundation.logic.LogicServiceProvider
  .getInstance()
  .getLogicFlowImporter();
importer.importData(inputStream);
```

This is an exception to the "no direct Java access" principle described in `.agents/requirements/jssp-security/AGENTS.md`. **It is strictly forbidden in business SSJS** and is **only permitted in extended import JS for tenant environment setup**. Reasons:

- IM-LogicDesigner imports cannot be performed via SSJS API, so going through Java is the only option
- Extended import JS is a special entry point for tenant administration and does not handle external input, so the attack surface is limited
- Providing implementation steps that are consistent with WF allows users to unify their application initialization processing

### Behavior of LogicFlowImporter#importData

| Signature | Behavior |
|---|---|
| `importData(InputStream stream)` | No overwrite. If it conflicts with existing data, an error occurs and the transaction is rolled back |
| `importData(InputStream stream, boolean isUpdate)` | When `isUpdate=true`, existing data can be overwritten |

The skeleton JS adopts the **no-overwrite version** (first argument only). The behavior on re-injection is expected to be controlled via the `configNumber` split operation, the same as IM-Workflow. If operation requires overwrite, edit the generated JS to use `importer.importData(inputStream, true)`.

### How to Create an InputStream

`SystemStorage` may be backed by an external storage plugin or a distributed configuration (AP server and storage server on separate nodes), and it may not be possible to open it with `FileInputStream` from a local path obtained via `getCanonicalPath()`. Therefore, **the approach is to read all bytes into memory from the `ByteReader` obtained via `openAsBinary()` and pass them through Java's `ByteArrayInputStream`**.

```javascript
function readAllBytes(sourceStorage) {
  let output = new Packages.java.io.ByteArrayOutputStream();
  let reader = sourceStorage.openAsBinary();
  try {
    reader.eachBytes(function (chunk, index, bytesRead) {
      for (let i = 0; i < bytesRead; i++) {
        output.write(chunk[i]);
      }
    }, 8192);
  } finally {
    reader.close();
  }
  return output.toByteArray();
}

let byteArray = readAllBytes(sourceStorage);
let inputStream = new Packages.java.io.ByteArrayInputStream(byteArray);
```

`ByteReader#eachBytes` is a callback-based method that takes a chunk size, and the JavaScript side transfers each byte one at a time to `ByteArrayOutputStream.write(int)`. A chunk size of 8KB is a standard buffer size for storage I/O.

**Memory consumption**: Because the entire import file is expanded into memory, this approach is not suitable for extremely large ZIPs (hundreds of MB or more). A typical IM-LogicDesigner export ZIP is around several MB, and a one-shot run during tenant environment setup is expected to pose no memory issues.

## Execution Timing

JS in the `<extends-import>` section is invoked immediately after the tenant master data (database / authz / menu / job, etc.) within that config has been loaded. See [extends-import.md](extends-import.md) for details.

## Order of Inserting Authz Policies for Routing

If a LogicDesigner logic flow **includes a routing definition (REST API endpoint)**, an authz resource for `flow_route.json`'s `authzUri` (e.g. `im-logic-rest://<flowId>`) is automatically generated at import time (type is `im-logic-rest`). An `authz-policy` that references this resource **cannot be loaded in the same config**.

### Problem

The execution order of `config-N.xml` is as in [extends-import.md](extends-import.md):

```
database → tenant-master(authz / menu / job) → extends-import(doImport)
```

`<authz-policy-file>` is evaluated under `<tenant-master>`, so it is processed **before** the LogicDesigner extended import runs. If a policy that references a resource created by routing is written in the same config, the resource is referenced while still unregistered and the Importer fails.

### Solution: Split configNumber

Split `spec.configNumber` and generate a separate `config-(N+1).xml` dedicated to policies. The Importer executes in order of config number, so by the time the subsequent config is loaded the routing resources are already registered.

| config | Content |
|---|---|
| `config-1.xml` | Load LogicDesigner via `logicImport` (URI resources are generated) |
| `config-2.xml` | Describe only `authzPolicies` for LogicDesigner routing (references existing resources) |

When `configNumber >= 2`, the build script appends a `-<N>` suffix to the end of the base part of each file name (e.g. `equip-authz-policy-2.xml`). See [import-config.md](import-config.md#configNumber--1-のファイル名サフィックス) for details.

### Example spec.json Configurations

Initial spec.json (LogicDesigner import):

```jsonc
{
  "key": "any_app",
  "version": "1.0.0",
  "configNumber": 1,
  "logicImport": { "files": ["any_app-logic.zip"] }
  // Do not include LogicDesigner routing entries in authzPolicies
}
```

spec.json for adding policies (when loading at the same version, `version` may stay unchanged):

```jsonc
{
  "key": "any_app",
  "version": "1.0.0",
  "configNumber": 2,
  "authzPolicies": [
    {
      "resource": "<SHA-256 hash of the authzUri>",
      "type": "im-logic-rest",
      "action": "execute",
      "subject": "S(b_m_role:app_user)",
      "effect": "PERMIT"
    }
  ]
}
```

Specify `im-logic-rest` for `type` (note: not `service`). For how to write the resource ID (URI hash), see [authz-policy.md](authz-policy.md).

### Resource ID and type for Routing

When specifying the authz resource generated by LogicDesigner routing in `authzPolicies`:

| Field | Value |
|---|---|
| `type` | `im-logic-rest` (**not `service`**) |
| `resource` | The **SHA-256 hash (lowercase hexadecimal)** of the `authzUri` string in `flow_route.json` |
| `action` | `execute` |

```
authzUri: "im-logic-rest://sample_simple"
↓ SHA-256
resource: "d01beab0f047ab86a94e9358a800a5f1119a5465486a94d011d9ca1243ee7f62"
type:     "im-logic-rest"
```

If `type` is set to `service`, because the resource is registered in LogicDesigner's `im-logic-rest` namespace, **the policy is not tied to a real resource and is silently ignored when the Importer runs** (no error is raised but authorization does not take effect), so be careful.

### Notes

- Ordinary resources / policies **other than** LogicDesigner routing can be included in `config-1.xml` without issue. Only **routing-related policies** should be split out to `config-2.xml`
- When operating `config-1` / `config-2` at the same version, run `build-setup-import.js` twice with the two spec.json files
- Due to existing-file protection, even if you run a spec.json with `configNumber: 2` after generating `config-1`, neither `config-1.xml` nor the unsuffixed files under `1.0.0/` will be overwritten (new portions are output with the `-2` suffix)
- For a version upgrade that adds routing, continue to operate by further splitting that config's policies into `config-(N+2).xml` and so on

## Required Versions

| API | Required Version |
|---|---|
| `LogicFlowImporter` | 8.0.0 or later (intra-mart 8.x in general) |
| `SystemStorage` / `ByteReader` | 8.0.37 (2025 Spring) or later |

The SSJS API for `SystemStorage` / `ByteReader` is available from 8.0.37 onward, so JS generated from this skill will not work on earlier environments.

## Version Upgrade Operation

- If there are differences in the imported ZIP, increment `spec.configNumber` to 2, 3, ... and place the new ZIP under the corresponding `spec.version`
- Do not touch files in older version directories (the copy destination ZIP, `<version>/<key>_logic_import.js`)
- The build script's existing-file protection prevents accidental overwrites (intentional overwrite uses `--force`)

## Cautions

| Item | Content |
|---|---|
| Transaction | `LogicFlowImporter#importData` opens its own transaction internally, so do not wrap it with `Transaction.begin` on the `doImport` side |
| File format | The format accepted by LogicFlowImporter is the **IM-LogicDesigner export ZIP**. Hand-crafted ZIPs or other formats are not allowed |
| Behavior on error | When `LogicServiceException` is thrown, the `catch` in the extended import JS catches it and rethrows to fail the entire Importer |
| Storage configuration dependency | Even when `SystemStorage` is on a different host or mount than the AP server, it can be read transparently via `openAsBinary()`, so no code changes are required |
| Memory consumption | The `byte[]` is fully expanded in memory. If you need to handle extremely large ZIPs (hundreds of MB or more), consider switching to a streaming approach (build your own intermediate InputStream that passes each chunk to `importData`) |

## Related References

- [extends-import.md](extends-import.md): General specification of extended import JS
- [workflow-import.md](workflow-import.md): IM-Workflow import (sibling feature)
- [import-config.md](import-config.md): Structure of import-`<artifactId>`-config-`<N>`.xml (the `<extends-import>` section)
