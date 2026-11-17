---
paths:
  - "src/main/tssp/**/*.ts"
---

# File Operation Guidelines

## Storage Class Usage

| Class | Purpose | Expiration | Location |
|-------|---------|-----------|----------|
| `PublicStorage` | Shared files, uploaded files | Persistent | storage/public |
| `SessionScopeStorage` | Temporary files, in-progress data | Auto-deleted when session ends | Session-dependent |
| `SystemStorage` | System internal resources | Persistent | storage/system |

```typescript
// Shared files (normally use this)
let publicStorage = new PublicStorage('data/users.txt');

// Temporary files (auto-deleted when session ends)
let sessionScopeStorage = new SessionScopeStorage('temp/upload.tmp');

// System internal resources (for platform and app internal processing)
let systemStorage = new SystemStorage('config/settings.xml');
```

## Recommended Pattern: Callback Functions

Use callback functions for reading and writing to prevent resource leaks.

### File Reading

```typescript
/**
 * Text file reading (recommended pattern)
 */
function readTextFile(filePath: string): string {
  let logger = Logger.getLogger();
  let storage = new PublicStorage(filePath);
  let content = '';

  storage.openAsText(function(reader: TextReader, error: Error | null): void {
    if (error) {
      logger.error('File read error: {}', error.message);
      throw error;
    }

    reader.eachLine(function(line) {
      content += line + '\n';
    });
  });
  // Resources are automatically released when the callback ends

  return content;
}

/**
 * Binary file reading
 */
function readBinaryFile(filePath: string): number[] {
  let logger = Logger.getLogger();
  let storage = new PublicStorage(filePath);
  let data: number[] = [];

  storage.openAsBinary(function(reader: ByteReader, error: Error | null): void {
    if (error) {
      logger.error('File read error: {}', error.message);
      throw error;
    }

    reader.eachBytes(function(bytes, index, bytesRead) {
      for (let i = 0; i < bytesRead; i++) {
        data.push(bytes[i]);
      }
    }, 8192);
  });

  return data;
}
```

### File Writing

```typescript
/**
 * Text file writing (recommended pattern)
 */
function writeTextFile(filePath: string, content: string): void {
  let logger = Logger.getLogger();
  let storage = new PublicStorage(filePath);

  storage.createAsText(function(writer: TextWriter, error: Error | null): void {
    if (error) {
      logger.error('File write error: {}', error.message);
      throw error;
    }

    writer.write(content);
  });
  // Resources are automatically released when the callback ends
}

/**
 * File append
 */
function appendTextFile(filePath: string, content: string): void {
  let logger = Logger.getLogger();
  let storage = new PublicStorage(filePath);

  storage.appendAsText(function(writer: TextWriter, error: Error | null): void {
    if (error) {
      logger.error('File append error: {}', error.message);
      throw error;
    }

    writer.write(content);
  });
}

/**
 * Binary file writing
 */
function writeBinaryFile(filePath: string, data: number[]): void {
  let logger = Logger.getLogger();
  let storage = new PublicStorage(filePath);

  storage.createAsBinary(function(writer: ByteWriter, error: Error | null): void {
    if (error) {
      logger.error('File write error: {}', error.message);
      throw error;
    }

    writer.write(data);
  });
}
```

## Directory Operations

```typescript
/**
 * Create directory (including parent directories)
 */
function createDirectory(dirPath: string): void {
  let storage = new PublicStorage(dirPath);
  storage.makeDirectories();
}

/**
 * Get file list
 */
function listFiles(dirPath: string): string[] {
  let storage = new PublicStorage(dirPath);
  return storage.files();  // Array of file names
}

/**
 * Get file list (recursive)
 */
function listFilesRecursive(dirPath: string): string[] {
  let storage = new PublicStorage(dirPath);
  return storage.files(true);  // true: retrieve recursively
}

/**
 * Get directory list
 */
function listDirectories(dirPath: string): string[] {
  let storage = new PublicStorage(dirPath);
  return storage.directories();
}

/**
 * Get file and directory list
 */
function listAll(dirPath: string): string[] {
  let storage = new PublicStorage(dirPath);
  return storage.list();  // Both files and directories
}
```

## File Operations

```typescript
/**
 * Copy file
 */
function copyFile(srcPath: string, destPath: string): void {
  let srcStorage = new PublicStorage(srcPath);
  let destStorage = new PublicStorage(destPath);

  srcStorage.copy(destStorage, true);  // true: allow overwrite
}

/**
 * Move file
 */
function moveFile(srcPath: string, destPath: string): void {
  let storage = new PublicStorage(srcPath);
  storage.move(destPath);
}

/**
 * Delete file
 */
function deleteFile(filePath: string): void {
  let storage = new PublicStorage(filePath);

  if (storage.exists()) {
    storage.remove();
  }
}

/**
 * Delete directory (recursive)
 */
function deleteDirectory(dirPath: string): void {
  let storage = new PublicStorage(dirPath);

  if (storage.exists() && storage.isDirectory()) {
    storage.remove(true);  // true: recursive deletion
  }
}
```

## File Information Retrieval

```typescript
/** File information */
interface FileInfo {
  exists: boolean;
  isFile: boolean;
  isDirectory: boolean;
  size: number;
  lastModified: number;
}

/**
 * Get file information
 */
function getFileInfo(filePath: string): FileInfo {
  let storage = new PublicStorage(filePath);

  return {
    exists: storage.exists(),
    isFile: storage.isFile(),
    isDirectory: storage.isDirectory(),
    size: storage.length(),
    lastModified: storage.lastModified()
  };
}

/**
 * Check if file exists
 */
function fileExists(filePath: string): boolean {
  let storage = new PublicStorage(filePath);
  return storage.exists() && storage.isFile();
}

/**
 * Check if directory exists
 */
function directoryExists(dirPath: string): boolean {
  let storage = new PublicStorage(dirPath);
  return storage.exists() && storage.isDirectory();
}
```

## SessionScopeStorage Usage Examples

Use SessionScopeStorage for temporary files. They are automatically deleted when the session ends.

```typescript
/**
 * Save temporary file
 */
function saveTempFile(fileName: string, content: string): string {
  let storage = new SessionScopeStorage(fileName);

  storage.createAsText(function(writer: TextWriter, error: Error | null): void {
    if (error) throw error;
    writer.write(content);
  });

  return fileName;
}

/**
 * Read temporary file
 */
function readTempFile(fileName: string): string | null {
  let storage = new SessionScopeStorage(fileName);
  let content = '';

  if (!storage.exists()) {
    return null;
  }

  storage.openAsText(function(reader: TextReader, error: Error | null): void {
    if (error) throw error;
    reader.eachLine(function(line) {
      content += line + '\n';
    });
  });

  return content;
}

/**
 * Temporary save of uploaded file
 *
 * @param uploadFile - Uploaded file obtained with request.getParameter('file')
 */
function saveTempUpload(uploadFile: RequestParameter): string {
  // File names sent by the client must go through sanitizeFileName ("File Name Validation") before being used in a path
  let tempPath = 'upload_' + new Date().getTime() + '_' + sanitizeFileName(uploadFile.getFileName() || 'file');
  let storage = new SessionScopeStorage(tempPath);

  uploadFile.openValueAsBinary(function(reader: ByteReader, readerError: Error | null): void {
    if (readerError) throw readerError;
    storage.createAsBinary(function(writer: ByteWriter, writerError: Error | null): void {
      if (writerError) throw writerError;
      reader.transferTo(writer, 8192);
      writer.flush();
    });
  });

  return tempPath;
}
```

## Notes

### Preventing Resource Leaks

- Always use the callback function pattern
- No need to release resources with try-finally (when using callbacks)

Good example:
```typescript
// Callback pattern (resources are automatically released)
storage.openAsText(function(reader: TextReader, error: Error | null): void {
  // Processing
});
```

Bad example:
```typescript
// read() method (loads entire file into memory)
let content = storage.read();  // Risk of running out of memory with large files
```

### Handling File Paths

- Specify relative paths with the Storage API
- `PublicStorage('data/users.txt')` → `storage/public/data/users.txt`
- Absolute paths cannot be used

Good example:
```typescript
let storage = new PublicStorage('data/users.txt');
```

Bad example:
```typescript
// Absolute paths cannot be used
let storage = new PublicStorage('/var/data/users.txt');
```

### Notes on Large Files

- Use stream processing for large files
- Avoid `read()` (deprecated) as it loads the entire file into memory
- Use `eachLine()` for line-by-line processing

```typescript
// Line-by-line processing for large files
storage.openAsText(function(reader: TextReader, error: Error | null): void {
  if (error) throw error;

  reader.eachLine(function(line) {
    // Process one line at a time (memory efficient)
    processLine(line);
  });
});
```

### File Name Validation

When using user input as file names, path traversal countermeasures are necessary.

```typescript
/**
 * Sanitize file name
 */
function sanitizeFileName(fileName: string): string {
  // Path traversal countermeasures
  let sanitized = fileName.replace(/\.\./g, '');
  sanitized = sanitized.replace(/[\/\\]/g, '_');
  sanitized = sanitized.replace(/[<>:"|?*]/g, '_');

  return sanitized;
}
```
