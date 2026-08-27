---
name: java-im-storage-usage
description: A skillset for using intra-mart-specific file operation APIs (PublicStorage / SessionScopeStorage / SystemStorage) in Java (JavaEE development model). Provides patterns for file reading/writing, directory operations, temporary file handling, and resource management. Use when the user mentions wanting to save files in Java, use the Storage API in Java, perform file operations in the JavaEE development model, use `PublicStorage` in Java, or handle temporary files with `SessionScopeStorage`. When building equivalent processing in JSSP (script development model), use `reference/api-storage.md` (the SSJS Storage API) in `jssp-page-generator` instead.
---

# intra-mart Storage API (Java Version) Support Skill

## Purpose

A skillset for implementing file reading/writing, directory operations, and temporary file handling in Java code, using the file operation API provided for the **JavaEE development model** by intra-mart Accel Platform (`PublicStorage` / `SessionScopeStorage` / `SystemStorage` under the `jp.co.intra_mart.foundation.service.client.file` package).

## Differences from the JSSP Version (Important)

The JSSP version (SSJS's `PublicStorage` etc., defined in `d.ts/platform/storage/*.d.ts`) and the Java version share the same names but are **entirely different classes in different packages**, with different API shapes. Carrying over the JSSP version's callback pattern from memory or analogy will produce incorrect code, so always follow the types and signatures in this document.

| Aspect | JSSP Version (SSJS) | Java Version |
|------|-----------------|---------|
| Class implementation | Global class on Rhino (defined in `d.ts/platform/storage/*.d.ts`) | `jp.co.intra_mart.foundation.service.client.file.{PublicStorage, SessionScopeStorage, SystemStorage}` |
| Basic read/write form | **Callback style** such as `openAsText(function(reader, error) {...})` (auto-closed when the callback ends) | `open()` / `create()` / `append()` return plain `InputStream` / `OutputStream` using **standard Java I/O**. **The caller must close them explicitly** (use `try-with-resources`) |
| Simple read/write | `read()` / `createAsText()` etc. | `read()` / `write()` / `load()` (`byte[]`) / `save(byte[])` exist similarly (types are Java strings / byte arrays) |
| Exception handling | Received via the `error` callback argument | All methods `throws IOException`. The caller must `try-catch` |
| Use cases | Presentation pages, function containers (JSSP) | Java sources such as servlets, EJBs, batch jobs, and workflow processing classes in the JavaEE development model |

**This skill covers only Java source files (`.java`).** For JSSP (`.js`) implementations, use `jssp-page-generator` (`reference/api-storage.md`).

## Conventions to Reference

| Convention | Handling |
|------|---------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **Required reading** — package, class, method, variable naming |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **Required reading** — `final` local variables, `try-with-resources`, string literals, etc. |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **Required reading** — class/method JavaDoc |
| `.agents/requirements/java-logging/AGENTS.md` | 🟡 When implementing logging (`Logger.getLogger(XxxClass.class)`) |

The `jssp-*` conventions are out of scope for this skill (do not apply them to Java files).

## Choosing Among the 3 Classes

| Class | FQCN | Purpose | Storage location (default root) | Lifecycle |
|--------|------|------|----------------------|----------------|
| `PublicStorage` | `jp.co.intra_mart.foundation.service.client.file.PublicStorage` | Persistent data such as shared files, uploaded files, attachments | `storage/public` | Persistent (remains until explicitly deleted) |
| `SessionScopeStorage` | `jp.co.intra_mart.foundation.service.client.file.SessionScopeStorage` | Temporary files during processing (temporary upload storage, data being processed, etc.) | Temporary area per session ID | Managed by the session infrastructure. **Must be explicitly deleted after use** (the actual platform code also documents the same operational caution) |
| `SystemStorage` | `jp.co.intra_mart.foundation.service.client.file.SystemStorage` | System internal resources, data for platform/application internal processing | `storage/system` | Persistent |

All 3 classes implement the `Storage<T>` interface (`jp.co.intra_mart.foundation.service.client.file.Storage`), and the actual I/O methods are common across them. The only difference is the root path resolved in the constructor. See `reference/storage-api-reference.md` for details.

## Generation Targets and Templates

| Generation target | Template | Content |
|---------|------------|------|
| Basic file read/write (text/binary, `try-with-resources`) | `assets/basic-file-operations.md` | `read`/`write`/`open`/`create`/`copy`/`move`/`remove` |
| Directory operations and listing | `assets/directory-operations.md` | `list`/`files`/`directories`/`makeDirectories`/filters |
| Temporary file handling (`SessionScopeStorage`) | `assets/temp-file-lifecycle.md` | Temporary storage of uploads, reliable deletion patterns after processing |

### Reference

- `reference/storage-api-reference.md` — Full list of `Storage<T>` interface methods, signatures, and JavaDoc summaries; constructor differences among the 3 classes (based on the actual class definitions of the platform API; do not write from memory)

## When to Use

Use this skill when the user makes requests such as:
- "Create processing to save a file in Java"
- "I want to use PublicStorage in the JavaEE development model"
- "I want to put uploaded files in a temporary area in Java"
- "Write processing in Java to read a configuration file with SystemStorage"
- "I want to delete SessionScopeStorage temporary files from a batch process"

If there is no explicit mention of "in Java" or "in the JavaEE development model," and the request is simply "create processing to save a file," **default to the JSSP version (`reference/api-storage.md` in `jssp-page-generator`)**. Only confirm with the user whether the Java version is appropriate when the project's existing implementation is primarily Java.

## Implementation Steps

1. Gather requirements from the user (persistent vs. temporary, text vs. binary, operation type such as read/write/delete, target package)
2. Decide which of `PublicStorage` / `SessionScopeStorage` / `SystemStorage` to use based on the purpose (see the table above; **prioritize the user's specification if given**)
3. Implement by referring to the relevant `assets/` template (always check method signatures in `reference/storage-api-reference.md`; do not write from memory or guesswork)
4. Confirm compliance with `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md`

## Notes

- **Preventing resource leaks is the top priority.** Unlike the JSSP version, there is no automatic closing via callbacks. Streams obtained from `open()` / `create()` / `append()` must always be closed with `try-with-resources`. `read()` / `write()` / `load()` / `save()` are convenience methods that close the stream internally, so prefer these for small amounts of data
- **For large files, use stream processing via `open()`/`create()`.** `read()`/`load()` load the entire file into memory, so avoid them for large files
- **Paths are always relative.** The `path` in each constructor is relative to the root (`storage/public`, etc.); absolute paths cannot be specified
- **The path separator is always fixed as `/`.** Do not use the OS-dependent `File.separator`. As a rule, leave path construction to the constructors (e.g., `new PublicStorage(parent, child)`). See "Note on Path Separators" in `reference/storage-api-reference.md` for details
- **Guard against path traversal.** Do not use user input directly as a file name or path. Sanitize or reject input containing `..` or `/`/`\` (refer to any project-specific Java security conventions if available; otherwise apply the thinking from `.agents/requirements/jssp-security/AGENTS.md` reinterpreted for Java's exception mechanism)
- **Explicitly delete `SessionScopeStorage` after use.** The actual platform code (`WorkflowAttachFileUtil`) also documents the operational caution that "files in the temporary area remain until the machine is stopped, so they must always be deleted after use." Ensure deletion via a `finally` block or an explicit `remove()` call after processing completes
- Either let `IOException` propagate via `throws IOException` or wrap it in a business exception. Write error messages descriptively in Japanese, following the conventions in `.agents/requirements/java-javadoc/AGENTS.md`

## Post-Generation Verification

A dedicated verification script equivalent to the JSSP version (`validate-jssp-code.js`) is not yet available. Verify the following manually.

1. Whether places using `open()`/`create()`/`append()` are closed with `try-with-resources`
2. Whether the choice of `PublicStorage` / `SessionScopeStorage` / `SystemStorage` matches the purpose (persistent/temporary, public/internal)
3. Whether temporary files using `SessionScopeStorage` are reliably deleted after processing completes or on exception
4. Whether places using user input in paths have path traversal countermeasures
5. Whether the code complies with `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md`
6. `jssp-code-review` / `jssp-security-check` are JSSP-specific and do not apply to output from this skill. If the project has separate code review/security check skills for Java, use those instead

## Boundaries with Other Skills

| Responsibility | Skill in charge |
|------|-----------|
| File operation implementation in SSJS (JSSP) | `jssp-page-generator` (`reference/api-storage.md`) |
| **File operation implementation in Java (JavaEE development model)** | **This skill** |
| IM-Workflow attachment file operations (on the platform standard feature side) | Platform standard features (`WorkflowAttachFileUtil`, etc.). New implementation on the business side normally does not occur |
