# Directory Operation Patterns (Java Version)

## Creating a Directory

```java
package jp.co.intra_mart.sample.storage;

import java.io.IOException;

import jp.co.intra_mart.foundation.service.client.file.PublicStorage;

/**
 * Directory creation utility.
 */
public final class DirectoryUtil {

    private DirectoryUtil() {
    }

    /**
     * Creates a directory (including parent directories).
     * @param dirPath path relative to the storage root
     * @return true if creation succeeded
     * @throws IOException if creation fails
     */
    public static boolean createDirectory(final String dirPath) throws IOException {
        final PublicStorage storage = new PublicStorage(dirPath);
        return storage.makeDirectories();
    }
}
```

## Retrieving a List of Files/Directories

```java
import java.util.Collection;

/**
 * Retrieves a list of files (non-recursive).
 */
public static Collection<String> listFiles(final String dirPath) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    return storage.files();
}

/**
 * Retrieves a list of files (recursive).
 */
public static Collection<String> listFilesRecursive(final String dirPath) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    return storage.files(true);
}

/**
 * Retrieves a list of directories.
 */
public static Collection<String> listDirectories(final String dirPath) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    return storage.directories();
}

/**
 * Retrieves a list of both files and directories.
 */
public static Collection<String> listAll(final String dirPath) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    return storage.list();
}
```

## Retrieving as `Storage` Objects (When You Want to Operate Directly on Individual Files in Subsequent Processing)

```java
import java.util.Collection;

/**
 * Retrieves the files under a directory as Storage objects
 * and gets the size of each.
 */
public static java.util.Map<String, Long> listFileSizes(final String dirPath) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    final Collection<PublicStorage> files = storage.filesStorages(true);

    final java.util.Map<String, Long> sizes = new java.util.LinkedHashMap<String, Long>();
    for (final PublicStorage file : files) {
        sizes.put(file.getPath(), file.length());
    }
    return sizes;
}
```

## Retrieving a Filtered List

```java
import jp.co.intra_mart.foundation.service.client.file.StoragenameFilter;

/**
 * Retrieves a list of files filtered by extension.
 * @param dirPath path relative to the storage root
 * @param extension extension (e.g., ".csv")
 */
public static Collection<String> listFilesByExtension(final String dirPath, final String extension) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    return storage.list(new StoragenameFilter<PublicStorage>() {
        @Override
        public boolean accept(final PublicStorage dir, final String name) {
            return name.endsWith(extension);
        }
    });
}
```

Do not guess the signature of `StoragenameFilter<T>#accept(T dir, String name)` without checking `reference/storage-api-reference.md` (the signature can differ slightly by version, so always verify the latest definition with `find_symbol` or similar when implementing).

## Existence Check

```java
/**
 * Checks whether a file exists.
 */
public static boolean fileExists(final String filePath) throws IOException {
    final PublicStorage storage = new PublicStorage(filePath);
    return storage.exists() && storage.isFile();
}

/**
 * Checks whether a directory exists.
 */
public static boolean directoryExists(final String dirPath) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    return storage.exists() && storage.isDirectory();
}
```
