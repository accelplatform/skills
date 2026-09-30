# IM-BPM Import Specification

During tenant setup, this creates an IM-BPM Process Designer project and uploads BPMN files. Because the Importer's standard sections have no IM-BPM-specific elements, this is loaded from an extends import JS (`doImport`).

> **Note on the communication method**: The BPM REST API (`/api/bpm/webdesigner/...`) results in an authentication error and cannot be used in the execution context of the extends import JS, so instead the Java implementation classes that back the REST API (`ProjectResourceImpl` / `ResourceResourceImpl`, in the `im_activiti_web_designer` module) are obtained via `ProjectFactory` / `ResourceFactory` and called directly via Rhino's LiveConnect. Because the authorization checks inside the implementation methods remain in effect, the execution user needs BPM project edit/deploy permission.

> **Note on implementation status**: The `bpmImport` described in this document is not supported by `.claude/skills/jssp-tenant-setup-generator/scripts/build-setup-import.js` (the source implementation of `workflowImport` / `logicImport`). At present, running this build script produces no output from a `bpmImport` section. To generate according to this document's content, either the build script needs to be updated, or the `<extends-import-class>` entry must be added manually.

## Table of Contents

- [Specification in spec.json](#specification-in-specjson)
- [Generated Artifacts](#generated-artifacts)
  - [Copy Processing](#copy-processing)
- [Processing Content of the Extends Import JS](#processing-content-of-the-extends-import-js)
  - [Exception Handling](#exception-handling)
- [Details of Direct Java Calls](#details-of-direct-java-calls)
  - [Project Existence Check](#project-existence-check)
  - [Creating a New Project](#creating-a-new-project)
  - [BPMN Resource Existence Check](#bpmn-resource-existence-check)
    - [Computing resourceName](#computing-resourcename)
  - [BPMN Upload / Update](#bpmn-upload--update)
    - [BPMN Text Conversion](#bpmn-text-conversion)
- [Required Version](#required-version)
- [Version Upgrade Operations](#version-upgrade-operations)
- [Notes](#notes)
- [Execution Timing](#execution-timing)
- [Related References](#related-references)

## Specification in spec.json

```json
"bpmImport": {
  "projectId": "any-app",
  "projectName": "Any App",
  "files": [
    "01_sample.bpmn",
    "02_other.bpmn"
  ]
}
```

| Field | Type | Content |
|---|---|---|
| `bpmImport.projectId` | string | The Process Designer project ID. The initial value presented for user confirmation is the artifactId |
| `bpmImport.projectName` | string | The Process Designer project name. The initial value presented for user confirmation is the `<name>` from pom.xml |
| `bpmImport.files` | string[] | Enumerate the BPMN file names already copied under `src/main/storage/system/products/import/basic/<key>/<version>/`. The copy source is `doc/<BPM process name>-prompt/` (selected and copied during the requirements-gathering step of the SKILL.md generation procedure). Multiple entries are allowed; files are uploaded in the specified order |

When omitted, or when `files` is an empty array, nothing is output.

## Generated Artifacts

The following are generated/appended **directly by this skill, following the generation procedure in SKILL.md (steps 2-3)**, rather than by the build script (see the "Note on implementation status" at the top for details on what is unsupported).

| Type | Path |
|---|---|
| Import BPMN (copied) | `src/main/storage/system/products/import/basic/<key>/<version>/<file>.bpmn` |
| Extends import JS | `src/main/jssp/src/<key>/initialize/<version>/<key>_bpm_import.js` |
| Addition to import-config.xml | Add an `<extends-import-class>` line to the `<extends-import>` section (manual addition) |

As with IM-Workflow / IM-LogicDesigner, the BPMN file is copied to `storage/system`. When `doImport` runs, it reads the file from `SystemStorage` and calls Java classes directly to create the project and perform the upload.

### Copy Processing

Copy the BPMN file selected from under `doc/<BPM process name>-prompt/` to `src/main/storage/system/products/import/basic/<key>/<version>/<file>.bpmn`. No subdirectories are created — files are placed flat directly under `<version>/` (this is done during the requirements-gathering step of the SKILL.md generation procedure).

## Processing Content of the Extends Import JS

> **Use `var` for variable declarations**: Although `.claude/rules/jssp-code-style.md` recommends `let`, the extends import JS runs in Rhino's ES5-compatible context, so `let` / `const` / arrow functions cannot be used (see "Implementation Constraints" in `.claude/skills/jssp-tenant-setup-generator/reference/extends-import.md`). All samples in this document are likewise unified on `var`.

```
doImport(tenantId)
  ├ checkProjectExists(projectId)
  │    Calls ProjectService.isExistProject(projectId) directly (boolean)
  │    ├ true : Project exists → skip to BPMN upload
  │    └ false: Project does not exist → go to createProject()
  ├ createProject()
  │    Assembles a ProjectRequest and calls ProjectFactory.getInstance().getProjectResource().post(projectRequest, null)
  └ for each file:
       uploadOrUpdateBpmnFile()
         ├ Retrieve the file (byte[]) via SystemStorage('products/import/basic/<key>/<version>/<file>.bpmn')
         ├ Convert the retrieved byte[] to a UTF-8 string (used as the processDefinition string; see "BPMN Text Conversion" for details)
         ├ Compute resourceName (strip the extension from the file name and append ResourceType.DEFINITION.getExtension()="`.bpmn`")
         ├ ★ Existence check ★
         │    Calls ResourceService.getActiveResource(projectId, "DEFINITION", resourceName) directly
         │    ├ Non-null: Existing resource found → set the returned (ResourceEntity's) recordDate into the ResourceRequest ... update
         │    └ null    : No existing resource → do not set recordDate                                                ... new registration
         └ Assembles a ResourceRequest and calls ResourceFactory.getInstance().getResourceResource().post(resourceRequest, null, null)
              (uses the post(ResourceRequest,...) overload — see "BPMN Upload / Update" and "Notes" for the reason)
```

### Exception Handling

Wrap the whole of `doImport` in a try-catch and **log the error message and then re-throw** (following "Always wrap exception handling in try/catch, record it with Logger, and then re-throw" in `.claude/skills/jssp-tenant-setup-generator/reference/extends-import.md`). Re-throwing makes the Importer as a whole count as failed, so the fact that the BPMN could not be imported shows up in the setup result. It must not be swallowed.

Do not catch per file: as soon as the upload of one file fails, **abort without processing the remaining files**.

```javascript
function doImport(tenantId) {
  var logger = Logger.getLogger('<key>.initialize.bpm');
  var index;

  logger.info('[<key>] BPM import started. tenantId={}', tenantId);

  try {
    if (!checkProjectExists(PROJECT_ID)) {
      createProject(PROJECT_ID, PROJECT_NAME);
      logger.info('[<key>] BPM project created. projectId={}', PROJECT_ID);
    }

    for (index = 0; index < BPMN_FILES.length; index += 1) {
      uploadOrUpdateBpmnFile(PROJECT_ID, BPMN_FILES[index]);
      logger.info('[<key>] BPMN imported. file={}', BPMN_FILES[index]);
    }
  } catch (error) {
    logger.error('[<key>] BPM import failed. error={}', toErrorMessage(error));
    throw error;   // Re-throw so that the Importer as a whole is treated as failed
  }

  logger.info('[<key>] BPM import completed. fileCount={}', BPMN_FILES.length);
}

/**
 * Extracts a message for logging from an exception.
 *
 * @param {*} error The exception
 * @return {string} The message for logging
 */
function toErrorMessage(error) {
  if (error && error.javaException && error.javaException.getMessage) {
    return String(error.javaException.getMessage());
  }
  if (error && error.getMessage) {
    return String(error.getMessage());
  }
  return String(error && (error.message || error));
}
```

Because `ActivitiWebDesignerException` is a Java exception, in Rhino it may be caught wrapped as a `JavaException`. Calling `error.getMessage()` directly can therefore yield `undefined`, so obtain the message via a helper that looks at `error.javaException` first, as shown above.

## Details of Direct Java Calls

### Project Existence Check

| Item | Content |
|---|---|
| Class | `jp.co.intra_mart.activiti.webdesigner.service.ProjectService` |
| Method | `public static boolean isExistProject(String projectId)` |
| Return value | `true`: project exists → proceed to BPMN upload / `false`: project does not exist → proceed to project creation |

### Creating a New Project

| Item | Content |
|---|---|
| Obtained from | `jp.co.intra_mart.activiti.webdesigner.rest.service.api.project.ProjectFactory#getInstance().getProjectResource()` (returns the singleton instance of `ProjectResourceImpl` typed as the `ProjectResource` interface) |
| Method | `public void post(ProjectRequest projectRequest, HttpServletRequest request)` |
| `request` argument | Not referenced inside the method, so it can safely be called with `null` |

Assembling `ProjectRequest` (`jp.co.intra_mart.activiti.webdesigner.rest.service.api.project.ProjectRequest`, a Lombok `@Data` bean):

| Setter | Value |
|---|---|
| `setProjectId(String)` | `<projectId>` |
| `setProjectName(String)` | `<projectName>` |
| `setSortNumber(int)` | `0` |
| `setLocalizes(Map<Locale, ProjectLocalize>)` | An empty `java.util.HashMap` (the internal `ProjectService.insertLocal` / `ImBpmWebDesignerProjectResource.registerResource` handle an empty map and null checks properly, so this will not cause a `NullPointerException`) |

On success there is no return value (`void`). On failure, an `ActivitiWebDesignerException` is thrown (project ID/name required checks, permission checks, etc.).

### BPMN Resource Existence Check

| Item | Content |
|---|---|
| Class | `jp.co.intra_mart.activiti.webdesigner.service.ResourceService` |
| Method | `public static ResourceEntity getActiveResource(String projectId, String resourceType, String resourceName)` |
| Arguments | `projectId` = the project ID / `resourceType` = `ResourceType.DEFINITION.getValue()` (`"DEFINITION"`) / `resourceName` = see "Computing resourceName" below |
| Return value | A `ResourceEntity` if a resource for the same `projectId`+`resourceType`+`resourceName` combination that is currently active (within the range from `start_active_time` to `end_active_time`) exists; `null` if it does not |

There is no existence-check-only, resource-level, boolean-returning method equivalent to `ProjectService.isExistProject`. Existence is determined by whether the return value of this method is `null`. Note that the effective identification unit of a resource is the combination of `projectId`+`resourceType`+`resourceName`, not `ResourceEntity.resourceId` (an internal key newly assigned per version).

`ResourceEntity` (`jp.co.intra_mart.activiti.webdesigner.mirage.resource.ResourceEntity`) has public fields such as `resourceId` / `projectId` / `resourceType` / `resourceName` / `recordDate` (inherited from the parent class `WebDesignerEntity`, of type `java.sql.Timestamp`). On update, pass this `recordDate` as-is to `ResourceRequest.setRecordDate()` described below.

#### Computing resourceName

Compute `resourceName` from the file name being uploaded using the same logic as the implementation (the `resourceType==null` branch of `ResourceResourceImpl.java`): strip the extension and append `ResourceType.DEFINITION.getExtension()` (`".bpmn"`).

```javascript
var ResourceType = Packages.jp.co.intra_mart.activiti.webdesigner.common.ResourceType;
var extension = String(ResourceType.DEFINITION.getExtension());
var dotIndex = fileName.lastIndexOf('.');
var baseName = dotIndex > -1 ? fileName.substring(0, dotIndex) : fileName;
var resourceName = baseName + extension;
```

### BPMN Upload / Update

| Item | Content |
|---|---|
| Obtained from | `jp.co.intra_mart.activiti.webdesigner.rest.service.api.resource.ResourceFactory#getInstance().getResourceResource()` (returns the singleton instance of `ResourceResourceImpl` typed as the `ResourceResource` interface) |
| Method | `public ResourceResponse post(ResourceRequest resourceRequest, HttpServletRequest request, HttpServletResponse response)` |

> **Note**: The `post(AttachmentFile file, ..., Long recordDate, ...)` overload (the older approach that is always called with `resourceType=null`) cannot be used for updates, because its implementation never references the `recordDate` argument internally (calling it against an existing resource always results in an `MSG_E_BPM_DESIGNER_RESOURCE_CREATED` exception). Unify both new registration and update on the `ResourceRequest` approach described in this section.

Assembling `ResourceRequest` (`jp.co.intra_mart.activiti.webdesigner.rest.service.api.resource.ResourceRequest`, a Lombok `@Data` bean):

| Setter | Value |
|---|---|
| `setProjectId(String)` | `<projectId>` |
| `setResourceType(String)` | `ResourceType.DEFINITION.getValue()` (`"DEFINITION"`) |
| `setResourceName(String)` | The value computed in "Computing resourceName" above |
| `setDescription(String)` | `""` |
| `setProcessDefinition(String)` | The content of the BPMN (the string obtained in "BPMN Text Conversion" below) |
| `setIsRegisterEvenInNG(Boolean)` | `false` (do not register on schema/process validation failure — throw an exception instead) |
| `setIsValidateProcess(Boolean)` | `false` (perform only schema validation without process validity validation — the same default as the existing `post(AttachmentFile,...)` path) |
| `setRecordDate(Timestamp)` | **Only when an existing resource exists**, set the `ResourceEntity.recordDate` obtained in "BPMN Resource Existence Check" (= update). When no existing resource exists, do not call this / leave it unset (= new registration) |

The `request` / `response` arguments are not referenced along this call path, so they can safely be called with `null`.

The return value is a `ResourceResponse` (information about the uploaded/updated resource, including the newly assigned `resourceId`). On failure, an `ActivitiWebDesignerException` is thrown (see "Notes" for details).

The substance of an "update" is not an overwrite via an UPDATE statement, but rather **versioning via optimistic locking**: calling `post` with a `recordDate` causes the existing resource to be `suspended` (its `end_active_time` is updated, i.e. it becomes historical), and a new version is inserted with a new `resourceId`.

#### BPMN Text Conversion

`ResourceRequest.setProcessDefinition(String)` receives the content of the BPMN as a **string** (an `AttachmentFile` is not used). `SystemStorage` does have `read(charsetName)` / `load()`, which return the whole file as a string, but **both are `@deprecated`**, and the `TextReader` returned by the non-deprecated `openAsText()` has no method that reads the entire content (only `readLine()` / `eachLine()` / `read(buffer, offset, length)` / `transferTo()`). Therefore, against the `ByteReader` obtained via `openAsBinary()`, loop `read(buffer, offset, length)` into a buffer pre-allocated to the file size obtained from `SystemStorage#length()` (pre-allocation is required, because calling `read()` with an empty array is a pitfall that always yields 0 bytes read), and convert the resulting byte sequence into a UTF-8 string.

Note that `length()` is a method on **`SystemStorage`**, not on `ByteReader` (it is the file size). `ByteReader` has no `length()`.

The calling side:

```javascript
var storage = new SystemStorage('products/import/basic/<key>/<version>/<file>.bpmn');
if (!storage.exists()) {
  throw new Error('BPMN file does not exist in SystemStorage: ' + storage.getPath());
}
request.setProcessDefinition(convertBytesToText(readAllBytes(storage)));
```

Implementation of the helper functions (define them as-is in `<key>_bpm_import.js`):

```javascript
/**
 * Reads all bytes of a SystemStorage file.
 *
 * @param {SystemStorage} storage The read target
 * @return {number[]} All bytes (an array of Numbers in the range 0-255)
 */
function readAllBytes(storage) {
  var reader = storage.openAsBinary();
  var length = Number(storage.length());
  var buffer = createZeroFilledBuffer(length);
  var offset = 0;
  var readLength;

  try {
    while (offset < length) {
      readLength = reader.read(buffer, offset, length - offset);
      if (readLength <= 0) {
        break;
      }
      offset += readLength;
    }
  } finally {
    reader.close();
  }

  if (offset !== length) {
    throw new Error('Failed to read complete BPMN file. expected=' + length + ', actual=' + offset);
  }
  return buffer;
}

/**
 * Creates a zero-filled buffer of the specified length.
 * Pre-allocation is required, because passing an empty array to ByteReader#read() always reads only 0 bytes.
 *
 * @param {number} length The buffer length
 * @return {number[]} The zero-filled buffer
 */
function createZeroFilledBuffer(length) {
  var buffer = [];
  var index;

  for (index = 0; index < length; index += 1) {
    buffer.push(0);
  }
  return buffer;
}

/**
 * Converts a byte sequence into a UTF-8 string.
 *
 * @param {number[]} bytes The byte sequence
 * @return {string} The UTF-8 text
 */
function convertBytesToText(bytes) {
  // ActivitiUtils.getSystemXmlEncoding() is implemented as fixed to 'UTF-8', so convert using the literal value directly
  return String(new Packages.java.lang.String(
    bytes,
    Packages.java.nio.charset.StandardCharsets.UTF_8
  ));
}
```

Implementation notes:

| Item | Content |
|---|---|
| Return value of `reader.read()` | One of three values: the number of bytes read / `-1` at EOF / `null` on failure (`d.ts/platform/storage/im-ssjs-byte-reader.d.ts`). `readLength <= 0` catches both `-1` and `null` (which is converted to `0` in a numeric comparison, so the condition holds) and breaks out of the loop |
| Detecting an incomplete read | After breaking out of the loop, check `offset !== length` and raise an exception if they do not match. Whether the loop ended early due to EOF or a read failure, an incomplete BPMN is never passed to `setProcessDefinition()` |
| `Number(storage.length())` | Wrap the return value in `Number()` so that the subsequent comparisons and additions are reliably JS numeric operations |
| `reader.close()` | Always executed in `finally` |
| Memory consumption | The entire file is expanded in memory. BPMN files are normally tens to hundreds of KB, so this is not a problem |
| Argument passed to `convertBytesToText()` | What `readAllBytes()` returns is a Number array of 0-255. Because LiveConnect automatically converts a JavaScript Number array into a Java `byte[]`, it can be passed as-is to `new java.lang.String(bytes, charset)`, just as it can to `new java.io.ByteArrayInputStream(bytes)` and similar calls |

## Required Version

Keep the following points in mind.

| Item | Content |
|---|---|
| Dependent classes | `ProjectService` / `ResourceService` / `ProjectFactory` / `ResourceFactory` / `ProjectResourceImpl` / `ResourceResourceImpl` / `ResourceRequest` / `ResourceEntity` / `ResourceType` (all are non-public implementation classes within the `im_activiti_web_designer` module) |
| Compatibility risk | The above are not a public contract like the REST API, and their method signatures or internal logic may be changed or removed without notice in an intra-mart version upgrade. Re-verify against the actual source when the version changes |
| `SystemStorage` | Continues to be used for reading BPMN files |

## Version Upgrade Operations

The basic policy for multi-config operations (incrementing `configNumber`, describing only the diff, and the principle of never touching existing files) follows `.claude/skills/jssp-tenant-setup-generator/reference/multi-config.md`.

The files specific to this skill are the following two:
- The copied-to BPMN (`<version>/<file>.bpmn`)
- `<key>_bpm_import.js` (`<version>/<key>_bpm_import.js`)

## Notes

| Item | Content |
|---|---|
| Authorization permission required | Although the REST-layer annotations (`@Secured`/`@Authz`) are bypassed, the authorization checks inside the implementation methods (`ImBpmWebDesignerProjectResource.isEditAuthzResource`, etc.) remain in effect. The execution context of the tenant setup (the import execution user) needs BPM project edit permission. Do not use low-level APIs (`ResourceService.terminateInsert`, etc.) directly, as doing so would bypass this authorization check |
| When the project already exists | If `ProjectService.isExistProject` returns `true`, skip project creation and execute only the BPMN upload (including the new-registration/update determination) |
| Duplicate BPMN upload (new-registration/update determination) | If the return value of `ResourceService.getActiveResource(projectId, resourceType, resourceName)` is `null`, register as new; if non-`null`, pass its `recordDate` to `ResourceRequest.setRecordDate()` to update. See "BPMN Resource Existence Check" and "BPMN Upload / Update" for details. Calling `post` against an existing resource without passing `recordDate` results in an `MSG_E_BPM_DESIGNER_RESOURCE_CREATED` exception |
| Optimistic locking error | If the value passed to `setRecordDate()` does not match the actual `recordDate` of the active resource at the time `post` is executed (e.g. another user or process updated the same resource during the import), an `MSG_E_BPM_DESIGNER_RESOURCE_UPDATED` exception occurs. This does not normally happen in the execution context of tenant setup, but should be caught as an unexpected error |
| BPMN file path | Only the file name (no path separators) is specified in `files`. Only files already copied directly under `src/main/storage/system/products/import/basic/<key>/<version>/` are targeted (the copy source is `doc/<BPM process name>-prompt/`) |
| Transactions | Because `ProjectResourceImpl.post` / `ResourceResourceImpl.post` start their own transactions internally (Mirage's `SessionTemplate`), do not wrap them in `Transaction.begin` on the `doImport` side |
| Exception handling | Since there is no longer a success/failure determination based on HTTP status codes, wrap the whole of `doImport` in try-catch, log the error message and then **re-throw** so that the Importer as a whole is treated as failed (do not swallow it). When the upload of one file fails, abort without processing the remaining files. For the implementation, see "Exception Handling" under "Processing Content of the Extends Import JS". The main exception codes are `MSG_E_BPM_DESIGNER_PROJECT_IS_NOT_PERMIT` (no edit permission), `MSG_E_BPM_DESIGNER_PROJECT_DELETED` (project does not exist), `MSG_E_BPM_DESIGNER_RESOURCE_CREATED` (missing existence check), `MSG_E_BPM_DESIGNER_RESOURCE_UPDATED` (optimistic-lock conflict), `MSG_E_BPM_DESIGNER_RESOURCE_PROCESS_DEFINITION_CHECK_NG` (schema/process validation failure), and `MSG_E_BPM_DESIGNER_RESOURCE_NAME_MAX_LENGTH` (resource name too long) |
| Internal API dependency risk | All call targets are non-public internal implementation classes. Verify behavior against the target version, and re-confirm this document's assumptions (signatures, argument meanings) at the time of an intra-mart version upgrade |

## Execution Timing

For the execution timing and call order of the `<extends-import>` section, see `.claude/skills/jssp-tenant-setup-generator/reference/extends-import.md`. When `extendsImport` / `workflowImport` / `logicImport` are used together, the output order of `<extends-import-class>` follows the order diagram in `.claude/skills/jssp-tenant-setup-generator/reference/logic-import.md`.

`bpmImport` (`<key>_bpm_import.js`) is not included in the automatic output described above (see the "Note on implementation status" at the top for the reason). When adding it manually, add it **after** the existing `<extends-import-class>` lines (`extendsImport` → `workflowImport` → `logicImport`).

## Related References

- `.claude/skills/jssp-tenant-setup-generator/reference/extends-import.md`: The specification for extends import JS in general
- `.claude/skills/jssp-tenant-setup-generator/reference/workflow-import.md`: IM-Workflow import (a sibling feature)
- `.claude/skills/jssp-tenant-setup-generator/reference/logic-import.md`: IM-LogicDesigner import (a sibling feature)
  - It has a `readAllBytes()` of the same name, but that one obtains a Java `byte[]` via `ByteReader#eachBytes` + `java.io.ByteArrayOutputStream`. This skill adopts the `read(buffer, offset, length)` approach described in "BPMN text conversion", so do not confuse the two
- `.claude/skills/jssp-tenant-setup-generator/reference/import-config.md`: The structure of import-`<artifactId>`-config-`<N>`.xml (the `<extends-import>` section)
