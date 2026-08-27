# Temporary File Handling Pattern (SessionScopeStorage)

`SessionScopeStorage` handles a temporary area tied to the currently executing session. **It is not persistent, but there is no documented guarantee on the platform code side of when automatic deletion occurs — the operational premise is that the caller reliably deletes it** (the same operational caution is documented as a comment in `WorkflowAttachFileUtil` of `im_workflow_core`).

## Basic Pattern: Saving, Reading, and Deleting Temporary Files

```java
package jp.co.intra_mart.sample.storage;

import java.io.IOException;

import jp.co.intra_mart.foundation.service.client.file.SessionScopeStorage;

/**
 * Temporary file operation utility.
 */
public final class TempFileUtil {

    private TempFileUtil() {
    }

    /**
     * Saves a temporary file.
     * @param tempPath path relative to the session-scope storage root
     * @param content content to save
     * @throws IOException if saving fails
     */
    public static void saveTempFile(final String tempPath, final String content) throws IOException {
        final SessionScopeStorage storage = new SessionScopeStorage(tempPath);
        storage.write(content);
    }

    /**
     * Reads a temporary file.
     * @param tempPath path relative to the session-scope storage root
     * @return null if the file does not exist
     * @throws IOException if reading fails
     */
    public static String readTempFile(final String tempPath) throws IOException {
        final SessionScopeStorage storage = new SessionScopeStorage(tempPath);
        if (!storage.exists()) {
            return null;
        }
        return storage.read();
    }

    /**
     * Deletes a temporary file.
     * @param tempPath path relative to the session-scope storage root
     * @throws IOException if deletion fails
     */
    public static void removeTempFile(final String tempPath) throws IOException {
        final SessionScopeStorage storage = new SessionScopeStorage(tempPath);
        if (storage.exists()) {
            storage.remove(storage.isDirectory());
        }
    }
}
```

## Recommended Pattern: Reliable Deletion Both After Processing Completes and on Exception

For processing that uses temporary files, delete them in a `finally` block regardless of whether the processing ends normally or abnormally.

```java
import jp.co.intra_mart.foundation.service.client.file.SessionScopeStorage;

/**
 * Saves the uploaded binary to a temporary area, performs processing on it,
 * and deletes the temporary file regardless of success or failure.
 * @param uploadData uploaded binary data
 * @throws IOException if an I/O error occurs
 * @throws SomeBusinessException if the processing fails
 */
public void processUploadedFile(final byte[] uploadData) throws IOException, SomeBusinessException {
    final String tempPath = "upload/" + System.currentTimeMillis() + ".tmp";
    final SessionScopeStorage tempStorage = new SessionScopeStorage(tempPath);

    try {
        tempStorage.save(uploadData);
        doBusinessProcess(tempStorage);
    } finally {
        if (tempStorage.exists()) {
            tempStorage.remove();
        }
    }
}
```

## Committing from the Temporary Area to the Persistent Area

A common two-stage approach is to temporarily save to `SessionScopeStorage` immediately after upload, then copy to `PublicStorage` once business confirmation occurs, deleting the temporary file afterward (the same idea as the usage split between `getTempDirPathOnSessionScopeStorage` / `getTempDirPathOnPublicStorage` in `WorkflowAttachFileUtil`).

```java
import jp.co.intra_mart.foundation.service.client.file.PublicStorage;
import jp.co.intra_mart.foundation.service.client.file.SessionScopeStorage;

/**
 * Commits a file in the temporary area to the persistent area.
 * @param tempPath temporary file path on session-scope storage
 * @param publicPath destination path on public storage
 * @throws IOException if an I/O error occurs
 */
public static void commitToPublicStorage(final String tempPath, final String publicPath) throws IOException {
    final SessionScopeStorage tempStorage = new SessionScopeStorage(tempPath);
    final PublicStorage publicStorage = new PublicStorage(publicPath);

    try {
        tempStorage.copy(publicStorage, true); // true: allow overwrite
    } finally {
        if (tempStorage.exists()) {
            tempStorage.remove();
        }
    }
}
```

## Notes

- Include a timestamp or unique ID in the temporary file name to avoid collisions within the same session (e.g., do not use `System.currentTimeMillis()` or the upload source file name as-is)
- When using user input (such as the upload source file name) directly as part of a temporary file path, always apply path traversal countermeasures (removing `..` and separator characters)
- Temporary files continue to consume disk space, so **delete them promptly once business processing completes**. Thoroughly use `try-finally` so that deletion also occurs on long-running jobs or abnormal termination
