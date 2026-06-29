---
paths:
  - "src/main/jssp/**/*.js"
---

# File Operation Guidelines

## Storage Class Usage

| Class | Purpose | Expiration | Location |
|-------|---------|-----------|----------|
| `PublicStorage` | Shared files, uploaded files | Persistent | storage/public |
| `SessionScopeStorage` | Temporary files, in-progress data | Auto-deleted when session ends | Session-dependent |
| `SystemStorage` | System internal resources | Persistent | storage/system |

```javascript
// Shared files (normally use this)
let publicStorage = new PublicStorage('data/users.txt');

// Temporary files (auto-deleted when session ends)
let sessionStorage = new SessionScopeStorage('temp/upload.tmp');

// System internal resources (for platform and app internal processing)
let systemStorage = new SystemStorage('config/settings.xml');
```

## Recommended Pattern: Callback Functions

Use callback functions for reading and writing to prevent resource leaks.

### File Reading

```javascript
/**
 * Text file reading (recommended pattern)
 */
function readTextFile(filePath) {
  let logger = Logger.getLogger();
  let storage = new PublicStorage(filePath);
  let content = '';

  storage.openAsText(function(reader, error) {
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
function readBinaryFile(filePath) {
  let logger = Logger.getLogger();
  let storage = new PublicStorage(filePath);
  let data = null;

  storage.openAsBinary(function(reader, error) {
    if (error) {
      logger.error('File read error: {}', error.message);
      throw error;
    }

    data = reader.readAll();
  });

  return data;
}
```

### File Writing

```javascript
/**
 * Text file writing (recommended pattern)
 */
function writeTextFile(filePath, content) {
  let logger = Logger.getLogger();
  let storage = new PublicStorage(filePath);

  storage.createAsText(function(writer, error) {
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
function appendTextFile(filePath, content) {
  let logger = Logger.getLogger();
  let storage = new PublicStorage(filePath);

  storage.appendAsText(function(writer, error) {
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
function writeBinaryFile(filePath, data) {
  let logger = Logger.getLogger();
  let storage = new PublicStorage(filePath);

  storage.createAsBinary(function(writer, error) {
    if (error) {
      logger.error('File write error: {}', error.message);
      throw error;
    }

    writer.write(data);
  });
}
```

## Directory Operations

```javascript
/**
 * Create directory (including parent directories)
 */
function createDirectory(dirPath) {
  let storage = new PublicStorage(dirPath);
  storage.makeDirectories();
}

/**
 * Get file list
 */
function listFiles(dirPath) {
  let storage = new PublicStorage(dirPath);
  return storage.files();  // Array of file names
}

/**
 * Get file list (recursive)
 */
function listFilesRecursive(dirPath) {
  let storage = new PublicStorage(dirPath);
  return storage.files(true);  // true: retrieve recursively
}

/**
 * Get directory list
 */
function listDirectories(dirPath) {
  let storage = new PublicStorage(dirPath);
  return storage.directories();
}

/**
 * Get file and directory list
 */
function listAll(dirPath) {
  let storage = new PublicStorage(dirPath);
  return storage.list();  // Both files and directories
}
```

## File Operations

```javascript
/**
 * Copy file
 */
function copyFile(srcPath, destPath) {
  let srcStorage = new PublicStorage(srcPath);
  let destStorage = new PublicStorage(destPath);

  srcStorage.copy(destStorage, true);  // true: allow overwrite
}

/**
 * Move file
 */
function moveFile(srcPath, destPath) {
  let storage = new PublicStorage(srcPath);
  storage.move(destPath);
}

/**
 * Delete file
 */
function deleteFile(filePath) {
  let storage = new PublicStorage(filePath);

  if (storage.exists()) {
    storage.remove();
  }
}

/**
 * Delete directory (recursive)
 */
function deleteDirectory(dirPath) {
  let storage = new PublicStorage(dirPath);

  if (storage.exists() && storage.isDirectory()) {
    storage.remove(true);  // true: recursive deletion
  }
}
```

## File Information Retrieval

```javascript
/**
 * Get file information
 */
function getFileInfo(filePath) {
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
function fileExists(filePath) {
  let storage = new PublicStorage(filePath);
  return storage.exists() && storage.isFile();
}

/**
 * Check if directory exists
 */
function directoryExists(dirPath) {
  let storage = new PublicStorage(dirPath);
  return storage.exists() && storage.isDirectory();
}
```

## SessionScopeStorage Usage Examples

Use SessionScopeStorage for temporary files. They are automatically deleted when the session ends.

```javascript
/**
 * Save temporary file
 */
function saveTempFile(fileName, content) {
  let storage = new SessionScopeStorage(fileName);

  storage.createAsText(function(writer, error) {
    if (error) throw error;
    writer.write(content);
  });

  return fileName;
}

/**
 * Read temporary file
 */
function readTempFile(fileName) {
  let storage = new SessionScopeStorage(fileName);
  let content = '';

  if (!storage.exists()) {
    return null;
  }

  storage.openAsText(function(reader, error) {
    if (error) throw error;
    reader.eachLine(function(line) {
      content += line + '\n';
    });
  });

  return content;
}

/**
 * Temporary save of uploaded file
 */
function saveTempUpload(uploadFile) {
  let tempPath = 'upload_' + new Date().getTime() + '_' + uploadFile.fileName;
  let storage = new SessionScopeStorage(tempPath);

  storage.createAsBinary(function(writer, error) {
    if (error) throw error;
    writer.write(uploadFile.data);
  });

  return tempPath;
}
```

## Notes

### Preventing Resource Leaks

- Always use the callback function pattern
- No need to release resources with try-finally (when using callbacks)

Good example:
```javascript
// Callback pattern (resources are automatically released)
storage.openAsText(function(reader, error) {
  // Processing
});
```

Bad example:
```javascript:
// read() method (loads entire file into memory)
let content = storage.read();  // Risk of running out of memory with large files
```

### Handling File Paths

- Specify relative paths with the Storage API
- `PublicStorage('data/users.txt')` → `storage/public/data/users.txt`
- Absolute paths cannot be used

Good example:
```javascript
let storage = new PublicStorage('data/users.txt');
```

Bad example:
```javascript
// Absolute paths cannot be used
let storage = new PublicStorage('/var/data/users.txt');
```

### Notes on Large Files

- Use stream processing for large files
- Avoid `read()` (deprecated) as it loads the entire file into memory
- Use `eachLine()` for line-by-line processing

```javascript
// Line-by-line processing for large files
storage.openAsText(function(reader, error) {
  if (error) throw error;

  reader.eachLine(function(line) {
    // Process one line at a time (memory efficient)
    processLine(line);
  });
});
```

### File Name Validation

When using user input as file names, path traversal countermeasures are necessary.

```javascript
/**
 * Sanitize file name
 */
function sanitizeFileName(fileName) {
  // Path traversal countermeasures
  let sanitized = fileName.replace(/\.\./g, '');
  sanitized = sanitized.replace(/[\/\\]/g, '_');
  sanitized = sanitized.replace(/[<>:"|?*]/g, '_');

  return sanitized;
}
```
