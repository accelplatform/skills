# Storage API Reference (Java Version)

Based on the actual class definitions in the intra-mart Accel Platform core source (`im_core_base` module). Do not supplement methods from memory or guesswork.

## Package Structure

```
jp.co.intra_mart.foundation.service.client.file
├── Storage<T extends Storage<T>>          … Interface. Defines all I/O methods
├── AbstractStorage<T extends Storage<T>>  … Common implementation of Storage (delegates to delegate)
├── PublicStorage extends AbstractStorage<PublicStorage>
├── SessionScopeStorage extends AbstractStorage<SessionScopeStorage>
├── SystemStorage extends AbstractStorage<SystemStorage>
├── SynchronizedPublicStorage / SynchronizedSystemStorage  … Synchronized versions (only when multithreaded mutual exclusion is required)
├── AbstractSynchronizedStorage
└── StoragenameFilter / StorageFilter      … Filter interfaces for list/listStorages
```

All three of `PublicStorage` / `SessionScopeStorage` / `SystemStorage` extend `AbstractStorage`, and the actual I/O processing is delegated to an internal `delegate` (an implementation class generated via reflection). **Application code never handles the `delegate` directly.** The only difference among the three classes is the "root path" resolved in the constructor.

## Constructors

### PublicStorage

```java
// Under storage/public
public PublicStorage(CharSequence path)
public PublicStorage(CharSequence parent, CharSequence child)
public PublicStorage(PublicStorage parent, CharSequence child)
```

Internally resolves `new StorageInformation().getPublicStorageRootPath()` as the root path.

### SystemStorage

```java
// Under storage/system
public SystemStorage(CharSequence path)
public SystemStorage(CharSequence parent, CharSequence child)
public SystemStorage(SystemStorage parent, CharSequence child)
```

Internally resolves `new StorageInformation().getSystemStorageRootPath()` as the root path.

### SessionScopeStorage

```java
// Under the temporary area per session ID
public SessionScopeStorage(CharSequence path)
public SessionScopeStorage(CharSequence parent, CharSequence child)
public SessionScopeStorage(SessionScopeStorage parent, CharSequence child)
```

Internally determines the root path dynamically:
1. Sets the session-scope storage usage flag (`SessionScopeStorage.class.getName() + ".useStorage"`) on the `SessionAttributeResolver`
2. Obtains the session ID via `SessionIdResolver.get().resolve()`
3. If a `SessionScopeStorageResolver` (SPI) is registered, prioritizes its root path
4. Otherwise uses the temporary area root path from `StorageInformation` plus the session ID

**The caller does not need to be aware of the session ID or resolver.** Simply calling the constructor automatically resolves the session-specific area tied to the currently executing request.

## Common Constants of the Storage&lt;T&gt; Interface

| Constant | Type | Content |
|------|-----|------|
| `FILE_SEPARATOR_CHAR` | `char` | File separator character. **Always fixed as `'/'`** (defined as `public static final char FILE_SEPARATOR_CHAR = '/';` in `jp.co.intra_mart.system.service.client.file.StorageInformation`, and re-exposed by `Storage<T>`) |
| `FILE_SEPARATOR` | `String` | File separator string. **Always fixed as `"/"`** (`String.valueOf(FILE_SEPARATOR_CHAR)`) |
| `CHARSET` | `Charset` | Default charset based on platform settings |

### Note on Path Separators (Required Reading Before Implementation)

- The Storage API's path separator is **always `/`, regardless of OS**. It does not become `\` even if the runtime environment is Windows
- **Do not use Java's standard `File.separator` / `File.separatorChar` (OS-dependent).** Using them by mistake results in unintended paths on Windows environments
- When building paths, prefer the **two-argument constructors such as `PublicStorage(parent, child)`**, which avoid handling the separator directly
- If you need to build a path via string concatenation, do not hardcode `"/"` — use the `Storage.FILE_SEPARATOR` constant instead

## Method List

All methods `throws IOException` (except `getName()` / `getParent()` / `getPath()` / `equals()` / `hashCode()` / `compareTo()`).

### Path and Attribute Retrieval

| Method | Return value | Description |
|---------|--------|------|
| `getName()` | `String` | The name of the file/directory indicated by this storage |
| `getPath()` | `String` | The path name string |
| `getParent()` | `String` | The parent path |
| `getCanonicalPath()` | `String` | The normalized path (resolves `.` and `..`, trims leading/trailing separators) |
| `getRelativePath(T target)` | `String` | The relative path between this storage and `target` |
| `getRootStorage()` | `T` | The root storage |
| `getParentStorage()` | `T` (`null` if this storage is the root) | The parent storage |
| `resolve(CharSequence other)` | `T` | The relative storage from this storage |

### Existence Check and Type Determination

| Method | Return value | Description |
|---------|--------|------|
| `exists()` | `boolean` | Whether the file/directory exists |
| `isDirectory()` | `boolean` | Whether it is a directory |
| `isFile()` | `boolean` | Whether it is a regular file |
| `lastModified()` | `long` | Last modified time (epoch milliseconds; `0L` if it does not exist) |
| `length()` | `long` | File size in bytes (`0L` if it does not exist) |

### Listing

| Method | Return value | Description |
|---------|--------|------|
| `list()` | `Collection<String>` | Relative paths of files and directories underneath (non-recursive; equivalent to `list(false)`) |
| `list(boolean recursive)` | `Collection<String>` | Same as above (recursion can be specified) |
| `list(StoragenameFilter<T> filter)` | `Collection<String>` | Only entries satisfying the filter condition (non-recursive) |
| `listStorages()` / `listStorages(boolean)` / `listStorages(StoragenameFilter<T>)` / `listStorages(StorageFilter<T>)` | `Collection<T>` | `Storage` object versions of the above |
| `directories()` / `directories(boolean recursive)` | `Collection<String>` | Only directories underneath |
| `directoriesStorages()` / `directoriesStorages(boolean)` | `Collection<T>` | `Storage` object version of the above |
| `files()` / `files(boolean recursive)` | `Collection<String>` | Only files underneath |
| `filesStorages()` / `filesStorages(boolean)` | `Collection<T>` | `Storage` object version of the above |

All of these return an empty collection or `null` "if this storage does not indicate a directory, or if it is empty" (this varies by method, so consult the individual JavaDoc).

### Reading

| Method | Return value | Description |
|---------|--------|------|
| `read()` | `String` | Gets the content as a string using the default charset |
| `read(String charsetName)` | `String` | Gets the content using the specified charset name |
| `read(Charset charset)` | `String` | Gets the content using the specified `Charset` |
| `load()` | `byte[]` | Gets the content as a byte array |
| `open()` | `InputStream` | Gets an input stream. **Must be closed by the caller** |

### Writing

| Method | Return value | Description |
|---------|--------|------|
| `write(CharSequence src)` | `void` | Writes using the default charset (overwrite) |
| `write(CharSequence src, String charsetName)` | `void` | Writes using the specified charset name |
| `write(CharSequence src, Charset charset)` | `void` | Writes using the specified `Charset` |
| `save(byte[] byteArray)` | `void` | Writes a byte array |
| `append(CharSequence src)` / `append(CharSequence src, String charsetName)` / `append(CharSequence src, Charset charset)` | `void` | Appends a string |
| `create()` | `OutputStream` | Gets an output stream (new/overwrite). **Must be closed by the caller** |
| `append()` | `OutputStream` | Gets an output stream in append mode. **Must be closed by the caller** |

### Directory and File Operations

| Method | Return value | Description |
|---------|--------|------|
| `makeDirectories()` | `boolean` | Creates the directory, including any necessary parent directories |
| `move(CharSequence newPath)` | `boolean` | Moves the file/directory |
| `remove()` | `boolean` | Deletes (non-recursive) |
| `remove(boolean recursive)` | `boolean` | Deletes (`true` for recursive deletion) |
| `copy(T to, boolean overwrite)` | `void` | Copies to `to`. For directories, behaves in a merge-like manner (see the branching specification in the JavaDoc for details; be careful about how same-named folders are handled) |

### Comparison

| Method | Return value | Description |
|---------|--------|------|
| `compareTo(T storage)` | `int` | Lexical comparison (`Comparable` implementation) |
| `equals(Object obj)` | `boolean` | Equality check |
| `hashCode()` | `int` | Hash code |

## Branching Specification of `copy()` (Summary of the Original JavaDoc)

- If this instance does not exist: `IOException` (`FileNotFoundException`)
- If this instance is a file
  - `to` does not exist: copies to `to`
  - `to` is a file: follows the `overwrite` argument
  - `to` is a directory: `IOException`
- If this instance is a directory
  - `to` does not exist: creates the `to` directory and copies
  - `to` is a file: `IOException`
  - `to` is a directory and files/folders exist underneath: follows `overwrite` (if a same-named folder exists at the same hierarchy level, `IOException`)
  - `to` is a directory and it is empty underneath: copies as-is
  - If a file exists on the `to` side that does not match the copy source: does nothing (merge behavior; if you want deletion, call `remove(true)` on the `to` side beforehand)
