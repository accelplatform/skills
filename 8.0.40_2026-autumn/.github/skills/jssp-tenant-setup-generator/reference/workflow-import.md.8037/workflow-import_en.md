# IM-Workflow Import Specification

During tenant environment setup, IM-Workflow import data (contents / route / flow / matter properties / rules) is loaded via `DataImportExecutor`. Because the Importer's standard `<tenant-master>` section has no IM-Workflow specific element, the form is to call `WorkflowXmlImporter` from the extended import JS (`doImport`).

## spec.json Specification

```json
"workflowImport": {
  "files": [
    "im_workflow-simple_approval-import.xml"
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `workflowImport.files` | string[] | Enumerates file names under `src/main/storage/public/im_workflow/`. Multiple entries are allowed and they are loaded in the order specified |

When omitted or when `files` is an empty array, nothing is output.

## Build-Time Artifacts

The build script outputs the following.

| Kind | Path |
|---|---|
| Import XML (copy) | `src/main/storage/system/products/import/basic/<key>/<version>/<file>.xml` |
| Extended import JS | `src/main/jssp/src/<key>/initialize/<version>/<key>_workflow_import.js` |
| Addition to import-config.xml | A `<extends-import-class>` line is added to the `<extends-import>` section |

### Copy Processing

`src/main/storage/public/im_workflow/<file>.xml` is copied to `src/main/storage/system/products/import/basic/<key>/<version>/<file>.xml`. No subdirectories are created; files are placed flat directly under `<version>/`.

### Extended Import JS

`<key>_workflow_import.js` has `doImport(tenantId)` as its entry point, and loads each XML in the order of `spec.workflowImport.files` to perform the import.

When `spec.extendsImport === true` is used together, **both** `<key>_import.js` and `<key>_workflow_import.js` are generated, and **both are output in parallel** in the `<extends-import>` section (in the order `<key>_import.js` → `<key>_workflow_import.js`). Application-specific initialization and WF import are separated as different concerns.

## Processing Performed by the Extended Import JS

```
doImport(tenantId)
  ├ resolveTenantLocaleId(tenantId)         Obtain the tenant's default locale (falls back to 'ja' on failure)
  └ for each sourceFile:
      importWorkflowFile()
        ├ Read the XML from SystemStorage in UTF-16
        └ for each dataType ('matter_property' → 'rule' → 'contents' → 'route' → 'flow'):
            importSingleSection()
              ├ Slice out every occurrence of the tag as an array with extractTopLevelSections()
              └ for each block:
                  importSectionBody()
                    ├ Write it out as a temporary XML in UTF-16
                    ├ Call DataImportExecutor.importData() via executeImport()
                    └ Delete the temporary file (finally)
```

### dataType Values

The `dataType` options recognized by `WorkflowXmlImporter` match the tag names directly under `<data>`. The loading order is **referenced side → referencing side**:

| Order | dataType | XML Tag | Purpose |
|---|---|---|---|
| 1 | `matter_property` | `<matter_property>` | Matter properties |
| 2 | `rule` | `<rule>` | Branch rules |
| 3 | `contents` | `<contents>` | Contents definition |
| 4 | `route` | `<route>` | Route definition |
| 5 | `flow` | `<flow>` | Flow definition |

When the relevant section does not exist in the original XML, an info log is output and it is skipped.

### XML Splitting

`WorkflowXmlImporter` requires that **a single section corresponding to `dataType` is the root element of the XML for each `importData` invocation**. Because the original import XML stores multiple sections together directly under `<data>`, the relevant section is sliced out with `extractTopLevelSections`, reconstructed as a temporary XML prepended with `<?xml version="1.0" encoding="UTF-16"?>`, and then passed in.

`<contents>` / `<route>` / `<flow>` / `<matter_property>` normally appear only once, but `<rule>` (branch rules) is often repeated multiple times directly under `<data>` to cover multiple approval patterns. `extractTopLevelSections` scans every occurrence of the tag and **returns all blocks as an array** (looping and advancing the search position each time a match is found, rather than a single `indexOf` lookup). `importSingleSection` receives this array and calls `importSectionBody` once per block to turn each into its own temporary XML and `importData` call, so no occurrence is dropped no matter how many same-named tags are present.

`extractTopLevelSections` picks up only tags whose **line begins with 2 spaces of indentation** as the top level, so it does not mis-match nested same-named tags (e.g. `<contents>` inside `<contents>`). If the original XML uses indentation other than 2 spaces, adjustment is necessary.

### Temporary Files

The temporary XML is created under **PublicStorage** at the path `tmp/<key>_<tenantId>_<dataType>_<index>.xml`, and is always deleted in `finally`. Besides the tenant ID, dataType, and key, it also includes a sequential `index` (the block's position in the array returned by `extractTopLevelSections`) to cover the case of multiple same-named tags, avoiding collisions during parallel execution or loading for multiple tenants.

Before writing, `ensureTemporaryDirectory()` is called, and if the `tmp/` directory does not exist in PublicStorage it is created with `makeDirectories()`. Because SystemStorage fails when writing to an uncreated directory, PublicStorage is adopted, and on top of that the pre-creation of `tmp/` is guaranteed.

## Execution Timing

JS in the `<extends-import>` section is invoked immediately after the tenant master data (database / authz / menu / job, etc.) within that config has been loaded. See [extends-import.md](extends-import.md) for details.

## Required Versions

| API | Required Version |
|---|---|
| `DataImportExecutor` | 8.0.37 (2025 Spring) or later |
| `ByteReader` | 8.0.37 (2025 Spring) or later |
| `SystemStorage` | 8.0.37 (2025 Spring) or later |
| `TenantInfoManager` | 8.0.37 (2025 Spring) or later |

On earlier environments, WF data cannot be imported from SSJS (it is limited to loading from the admin screen or the CLI).

## Version Upgrade Operation

- If there are differences in the import XML, increment `spec.configNumber` to 2, 3, ... and place the new WF XML under the corresponding `spec.version`
- Do not touch files in older version directories (the copy destination XML, `<version>/<key>_workflow_import.js`)
- The build script's existing-file protection prevents accidental overwrites (intentional overwrite uses `--force`)

## Cautions

| Item | Content |
|---|---|
| Character encoding | The original XML is in **UTF-16**. Align all three sites of reading, temporary writing, and the XML declaration to UTF-16 |
| Indentation | Tags directly under `<data>` are assumed to use 2-space indentation. When importing XMLs generated outside this skill, verification is needed |
| Transaction | `DataImportExecutor` opens its own transaction internally, so do not wrap it with `Transaction.begin` on the `doImport` side |
| Idempotency | Whether re-injecting the same XML is treated as an update or is rejected depends on the operation of IDs and revision numbers. Control via the `configNumber` split operation so that re-execution does not occur |
| Behavior on error | If the result of `executor.importData` is `error` or `!success`, an exception is thrown and the entire `doImport` is treated as failed. The whole Importer also becomes failed, so be careful so that the tenant master does not end up in a half-baked state |

## Related References

- [extends-import.md](extends-import.md): General specification of extended import JS
- [import-config.md](import-config.md): Structure of import-`<artifactId>`-config-`<N>`.xml (the `<extends-import>` section)
