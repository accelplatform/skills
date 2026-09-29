# Basic File Operation Patterns (Java Version)

Described using `PublicStorage` as the example, but `SessionScopeStorage` / `SystemStorage` have the same API aside from the constructor.

## Recommended Pattern: try-with-resources

Unlike the JSSP version, the Java version has no callback style. Since `open()` / `create()` / `append()` return the stream directly, **always close it with `try-with-resources`**.

### Reading a Text File

```java
package jp.co.intra_mart.sample.storage;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import jp.co.intra_mart.foundation.service.client.file.PublicStorage;
import jp.co.intra_mart.foundation.service.client.file.Storage;

/**
 * File reading utility.
 * @author INTRAMART
 */
public final class FileReadUtil {

    private FileReadUtil() {
    }

    /**
     * Reads a text file line by line.
     * @param filePath path relative to the storage root
     * @return list of lines
     * @throws IOException if reading fails
     */
    public static java.util.List<String> readLines(final String filePath) throws IOException {
        final PublicStorage storage = new PublicStorage(filePath);
        final java.util.List<String> lines = new java.util.ArrayList<String>();

        try (InputStream in = storage.open();
                InputStreamReader isr = new InputStreamReader(in, Storage.CHARSET);
                BufferedReader reader = new BufferedReader(isr)) {
            String line;
            while ((line = reader.readLine()) != null) {
                lines.add(line);
            }
        }

        return lines;
    }

    /**
     * Reads a small text file all at once as a string.
     * <p>For large files, use {@link #readLines(String)}.</p>
     * @param filePath path relative to the storage root
     * @return file content
     * @throws IOException if reading fails
     */
    public static String readAll(final String filePath) throws IOException {
        final PublicStorage storage = new PublicStorage(filePath);
        return storage.read();
    }
}
```

### Writing a Text File

```java
/**
 * Writes a text file (create new / overwrite).
 * @param filePath path relative to the storage root
 * @param content content to write
 * @throws IOException if writing fails
 */
public static void writeText(final String filePath, final String content) throws IOException {
    final PublicStorage storage = new PublicStorage(filePath);
    storage.write(content);
}

/**
 * Appends to a text file.
 * @param filePath path relative to the storage root
 * @param content content to append
 * @throws IOException if appending fails
 */
public static void appendText(final String filePath, final String content) throws IOException {
    final PublicStorage storage = new PublicStorage(filePath);
    storage.append(content);
}
```

### Reading/Writing Binary Files (Handling Streams Directly)

```java
import java.io.OutputStream;

/**
 * Writes a binary file.
 * @param filePath path relative to the storage root
 * @param data binary data
 * @throws IOException if writing fails
 */
public static void writeBinary(final String filePath, final byte[] data) throws IOException {
    final PublicStorage storage = new PublicStorage(filePath);

    // save() is more concise for small amounts of data
    storage.save(data);
}

/**
 * Copies a large binary file via streaming.
 * @param srcPath source relative path
 * @param destPath destination relative path
 * @throws IOException if the copy fails
 */
public static void copyLargeFile(final String srcPath, final String destPath) throws IOException {
    final PublicStorage src = new PublicStorage(srcPath);
    final PublicStorage dest = new PublicStorage(destPath);

    try (InputStream in = src.open();
            OutputStream out = dest.create()) {
        final byte[] buffer = new byte[8192];
        int len;
        while ((len = in.read(buffer)) != -1) {
            out.write(buffer, 0, len);
        }
    }
}
```

Using `Storage#copy(T to, boolean overwrite)` allows implementing a copy equivalent to the above in a single line (see the `copy()` branching specification in `reference/storage-api-reference.md`).

```java
public static void copyFile(final String srcPath, final String destPath) throws IOException {
    final PublicStorage src = new PublicStorage(srcPath);
    final PublicStorage dest = new PublicStorage(destPath);
    src.copy(dest, true); // true: allow overwrite
}
```

## File Operations

```java
/**
 * Moves a file.
 */
public static void moveFile(final String srcPath, final String destPath) throws IOException {
    final PublicStorage storage = new PublicStorage(srcPath);
    storage.move(destPath);
}

/**
 * Deletes a file (only if it exists).
 */
public static void deleteFile(final String filePath) throws IOException {
    final PublicStorage storage = new PublicStorage(filePath);
    if (storage.exists()) {
        storage.remove();
    }
}

/**
 * Recursively deletes a directory (only if it exists).
 */
public static void deleteDirectory(final String dirPath) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    if (storage.exists() && storage.isDirectory()) {
        storage.remove(true); // true: recursive deletion
    }
}
```

## Retrieving File Information

```java
/**
 * Retrieves file information.
 */
public static java.util.Map<String, Object> getFileInfo(final String filePath) throws IOException {
    final PublicStorage storage = new PublicStorage(filePath);
    final java.util.Map<String, Object> info = new java.util.HashMap<String, Object>();
    info.put("exists", storage.exists());
    info.put("isFile", storage.isFile());
    info.put("isDirectory", storage.isDirectory());
    info.put("size", storage.length());
    info.put("lastModified", storage.lastModified());
    return info;
}
```

## Notes

- `read()` / `load()` load the entire file into memory. For large files, use stream processing via `open()` (e.g., `BufferedReader#readLine()`)
- Always specify paths as relative to the root (absolute paths are not allowed)
- When using user input for file names or paths, apply path traversal countermeasures (removing or rejecting `..` and separator characters)
