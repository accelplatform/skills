---
paths:
  - "src/main/jssp/**/*.js"
---

# 文件操作规范

## Storage 类的使用区分

| 类 | 用途 | 有效期 | 存放位置 |
|----|------|--------|---------|
| `PublicStorage` | 共享文件、上传文件 | 持久 | storage/public |
| `SessionScopeStorage` | 临时文件、处理中数据 | 会话结束时自动删除 | 依赖会话 |
| `SystemStorage` | 系统内部资源 | 持久 | storage/system |

```javascript
// 共享文件（通常使用此类）
let publicStorage = new PublicStorage('data/users.txt');

// 临时文件（会话结束时自动删除）
let sessionStorage = new SessionScopeStorage('temp/upload.tmp');

// 系统内部资源（用于平台和应用内部处理）
let systemStorage = new SystemStorage('config/settings.xml');
```

## 推荐模式：回调函数

为防止资源泄漏，推荐使用回调函数进行读写。

### 文件读取

```javascript
/**
 * 文本文件读取（推荐模式）
 */
function readTextFile(filePath) {
  let logger = Logger.getLogger();
  let storage = new PublicStorage(filePath);
  let content = '';

  storage.openAsText(function(reader, error) {
    if (error) {
      logger.error('文件读取错误: {}', error.message);
      throw error;
    }

    reader.eachLine(function(line) {
      content += line + '\n';
    });
  });
  // 回调结束时自动释放资源

  return content;
}

/**
 * 二进制文件读取
 */
function readBinaryFile(filePath) {
  let logger = Logger.getLogger();
  let storage = new PublicStorage(filePath);
  let data = null;

  storage.openAsBinary(function(reader, error) {
    if (error) {
      logger.error('文件读取错误: {}', error.message);
      throw error;
    }

    data = reader.readAll();
  });

  return data;
}
```

### 文件写入

```javascript
/**
 * 文本文件写入（推荐模式）
 */
function writeTextFile(filePath, content) {
  let logger = Logger.getLogger();
  let storage = new PublicStorage(filePath);

  storage.createAsText(function(writer, error) {
    if (error) {
      logger.error('文件写入错误: {}', error.message);
      throw error;
    }

    writer.write(content);
  });
  // 回调结束时自动释放资源
}

/**
 * 文件追加
 */
function appendTextFile(filePath, content) {
  let logger = Logger.getLogger();
  let storage = new PublicStorage(filePath);

  storage.appendAsText(function(writer, error) {
    if (error) {
      logger.error('文件追加错误: {}', error.message);
      throw error;
    }

    writer.write(content);
  });
}

/**
 * 二进制文件写入
 */
function writeBinaryFile(filePath, data) {
  let logger = Logger.getLogger();
  let storage = new PublicStorage(filePath);

  storage.createAsBinary(function(writer, error) {
    if (error) {
      logger.error('文件写入错误: {}', error.message);
      throw error;
    }

    writer.write(data);
  });
}
```

## 目录操作

```javascript
/**
 * 创建目录（包括父目录）
 */
function createDirectory(dirPath) {
  let storage = new PublicStorage(dirPath);
  storage.makeDirectories();
}

/**
 * 获取文件列表
 */
function listFiles(dirPath) {
  let storage = new PublicStorage(dirPath);
  return storage.files();  // 文件名数组
}

/**
 * 获取文件列表（递归）
 */
function listFilesRecursive(dirPath) {
  let storage = new PublicStorage(dirPath);
  return storage.files(true);  // true: 递归获取
}

/**
 * 获取目录列表
 */
function listDirectories(dirPath) {
  let storage = new PublicStorage(dirPath);
  return storage.directories();
}

/**
 * 获取文件和目录列表
 */
function listAll(dirPath) {
  let storage = new PublicStorage(dirPath);
  return storage.list();  // 文件和目录都获取
}
```

## 文件操作

```javascript
/**
 * 复制文件
 */
function copyFile(srcPath, destPath) {
  let srcStorage = new PublicStorage(srcPath);
  let destStorage = new PublicStorage(destPath);

  srcStorage.copy(destStorage, true);  // true: 允许覆盖
}

/**
 * 移动文件
 */
function moveFile(srcPath, destPath) {
  let storage = new PublicStorage(srcPath);
  storage.move(destPath);
}

/**
 * 删除文件
 */
function deleteFile(filePath) {
  let storage = new PublicStorage(filePath);

  if (storage.exists()) {
    storage.remove();
  }
}

/**
 * 删除目录（递归）
 */
function deleteDirectory(dirPath) {
  let storage = new PublicStorage(dirPath);

  if (storage.exists() && storage.isDirectory()) {
    storage.remove(true);  // true: 递归删除
  }
}
```

## 文件信息获取

```javascript
/**
 * 获取文件信息
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
 * 检查文件是否存在
 */
function fileExists(filePath) {
  let storage = new PublicStorage(filePath);
  return storage.exists() && storage.isFile();
}

/**
 * 检查目录是否存在
 */
function directoryExists(dirPath) {
  let storage = new PublicStorage(dirPath);
  return storage.exists() && storage.isDirectory();
}
```

## SessionScopeStorage 使用示例

临时文件使用 SessionScopeStorage。会话结束时自动删除。

```javascript
/**
 * 保存临时文件
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
 * 读取临时文件
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
 * 上传文件的临时保存
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

## 注意事项

### 防止资源泄漏

- 必须使用回调函数模式
- 使用回调时无需用 try-finally 释放资源

正确示例：
```javascript
// 回调模式（资源自动释放）
storage.openAsText(function(reader, error) {
  // 处理
});
```

错误示例：
```javascript:
// read() 方法（将整个文件读入内存）
let content = storage.read();  // 大文件可能导致内存不足
```

### 文件路径的处理

- Storage API 使用相对路径指定
- `PublicStorage('data/users.txt')` → `storage/public/data/users.txt`
- 不能使用绝对路径

正确示例：
```javascript
let storage = new PublicStorage('data/users.txt');
```

错误示例：
```javascript
// 不能使用绝对路径
let storage = new PublicStorage('/var/data/users.txt');
```

### 大文件注意事项

- 大文件使用流处理
- 避免使用 `read()`（不推荐），因为它会将整个文件读入内存
- 逐行处理使用 `eachLine()`

```javascript
// 大文件的逐行处理
storage.openAsText(function(reader, error) {
  if (error) throw error;

  reader.eachLine(function(line) {
    // 逐行处理（内存效率高）
    processLine(line);
  });
});
```

### 文件名的验证

将用户输入用作文件名时，需要进行路径遍历防护。

```javascript
/**
 * 文件名净化
 */
function sanitizeFileName(fileName) {
  // 路径遍历防护
  let sanitized = fileName.replace(/\.\./g, '');
  sanitized = sanitized.replace(/[\/\\]/g, '_');
  sanitized = sanitized.replace(/[<>:"|?*]/g, '_');

  return sanitized;
}
```
