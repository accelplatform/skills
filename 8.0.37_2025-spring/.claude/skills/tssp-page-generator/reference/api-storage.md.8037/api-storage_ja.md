---
paths:
  - "src/main/tssp/**/*.ts"
---

# ファイル操作規約

## Storage クラスの使い分け

| クラス | 用途 | 有効期限 | 配置場所 |
|--------|------|----------|----------|
| `PublicStorage` | 共有ファイル、アップロードファイル | 永続的 | storage/public |
| `SessionScopeStorage` | 一時ファイル、処理中データ | セッション終了時に自動削除 | セッション依存 |
| `SystemStorage` | システム内部リソース | 永続的 | storage/system |

```typescript
// 共有ファイル（通常はこちらを使用）
let publicStorage = new PublicStorage('data/users.txt');

// 一時ファイル（セッション終了時に自動削除）
let sessionScopeStorage = new SessionScopeStorage('temp/upload.tmp');

// システム内部リソース（基盤やアプリ内部処理用）
let systemStorage = new SystemStorage('config/settings.xml');
```

## 推奨パターン: コールバック関数

リソースリーク防止のため、コールバック関数を使用した読み書きを推奨。

### ファイル読み込み

```typescript
/**
 * テキストファイル読み込み（推奨パターン）
 */
function readTextFile(filePath: string): string {
  let logger = Logger.getLogger();
  let storage = new PublicStorage(filePath);
  let content = '';

  storage.openAsText(function(reader: TextReader, error: Error | null): void {
    if (error) {
      logger.error('ファイル読み込みエラー: {}', error.message);
      throw error;
    }

    reader.eachLine(function(line) {
      content += line + '\n';
    });
  });
  // コールバック終了時に自動的にリソース解放

  return content;
}

/**
 * バイナリファイル読み込み
 */
function readBinaryFile(filePath: string): number[] {
  let logger = Logger.getLogger();
  let storage = new PublicStorage(filePath);
  let data: number[] = [];

  storage.openAsBinary(function(reader: ByteReader, error: Error | null): void {
    if (error) {
      logger.error('ファイル読み込みエラー: {}', error.message);
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

### ファイル書き込み

```typescript
/**
 * テキストファイル書き込み（推奨パターン）
 */
function writeTextFile(filePath: string, content: string): void {
  let logger = Logger.getLogger();
  let storage = new PublicStorage(filePath);

  storage.createAsText(function(writer: TextWriter, error: Error | null): void {
    if (error) {
      logger.error('ファイル書き込みエラー: {}', error.message);
      throw error;
    }

    writer.write(content);
  });
  // コールバック終了時に自動的にリソース解放
}

/**
 * ファイル追記
 */
function appendTextFile(filePath: string, content: string): void {
  let logger = Logger.getLogger();
  let storage = new PublicStorage(filePath);

  storage.appendAsText(function(writer: TextWriter, error: Error | null): void {
    if (error) {
      logger.error('ファイル追記エラー: {}', error.message);
      throw error;
    }

    writer.write(content);
  });
}

/**
 * バイナリファイル書き込み
 */
function writeBinaryFile(filePath: string, data: number[]): void {
  let logger = Logger.getLogger();
  let storage = new PublicStorage(filePath);

  storage.createAsBinary(function(writer: ByteWriter, error: Error | null): void {
    if (error) {
      logger.error('ファイル書き込みエラー: {}', error.message);
      throw error;
    }

    writer.write(data);
  });
}
```

## ディレクトリ操作

```typescript
/**
 * ディレクトリ作成（親ディレクトリも含めて作成）
 */
function createDirectory(dirPath: string): void {
  let storage = new PublicStorage(dirPath);
  storage.makeDirectories();
}

/**
 * ファイル一覧取得
 */
function listFiles(dirPath: string): string[] {
  let storage = new PublicStorage(dirPath);
  return storage.files();  // ファイル名の配列
}

/**
 * ファイル一覧取得（再帰）
 */
function listFilesRecursive(dirPath: string): string[] {
  let storage = new PublicStorage(dirPath);
  return storage.files(true);  // true: 再帰的に取得
}

/**
 * ディレクトリ一覧取得
 */
function listDirectories(dirPath: string): string[] {
  let storage = new PublicStorage(dirPath);
  return storage.directories();
}

/**
 * ファイル・ディレクトリ一覧取得
 */
function listAll(dirPath: string): string[] {
  let storage = new PublicStorage(dirPath);
  return storage.list();  // ファイルとディレクトリ両方
}
```

## ファイル操作

```typescript
/**
 * ファイルコピー
 */
function copyFile(srcPath: string, destPath: string): void {
  let srcStorage = new PublicStorage(srcPath);
  let destStorage = new PublicStorage(destPath);

  srcStorage.copy(destStorage, true);  // true: 上書き許可
}

/**
 * ファイル移動
 */
function moveFile(srcPath: string, destPath: string): void {
  let storage = new PublicStorage(srcPath);
  storage.move(destPath);
}

/**
 * ファイル削除
 */
function deleteFile(filePath: string): void {
  let storage = new PublicStorage(filePath);

  if (storage.exists()) {
    storage.remove();
  }
}

/**
 * ディレクトリ削除（再帰）
 */
function deleteDirectory(dirPath: string): void {
  let storage = new PublicStorage(dirPath);

  if (storage.exists() && storage.isDirectory()) {
    storage.remove(true);  // true: 再帰削除
  }
}
```

## ファイル情報取得

```typescript
/** ファイル情報 */
interface FileInfo {
  exists: boolean;
  isFile: boolean;
  isDirectory: boolean;
  size: number;
  lastModified: number;
}

/**
 * ファイル情報取得
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
 * ファイル存在チェック
 */
function fileExists(filePath: string): boolean {
  let storage = new PublicStorage(filePath);
  return storage.exists() && storage.isFile();
}

/**
 * ディレクトリ存在チェック
 */
function directoryExists(dirPath: string): boolean {
  let storage = new PublicStorage(dirPath);
  return storage.exists() && storage.isDirectory();
}
```

## SessionScopeStorageの使用例

一時ファイルはSessionScopeStorageを使用。セッション終了時に自動削除される。

```typescript
/**
 * 一時ファイルの保存
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
 * 一時ファイルの読み込み
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
 * アップロードファイルの一時保存
 *
 * @param uploadFile - request.getParameter('file') で取得したアップロードファイル
 */
function saveTempUpload(uploadFile: RequestParameter): string {
  // クライアントが送るファイル名は sanitizeFileName（「ファイル名の検証」）を通してからパスに使う
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

## 注意事項

### リソースリークの防止

- 必ずコールバック関数パターンを使用する
- try-finallyでのリソース解放は不要（コールバック使用時）

良い例:
```typescript
// コールバックパターン（リソースは自動解放）
storage.openAsText(function(reader: TextReader, error: Error | null): void {
  // 処理
});
```

悪い例:
```typescript
// read()メソッド（ファイル全体をメモリに読み込む）
let content = storage.read();  // 大容量ファイルでメモリ不足の可能性
```

### ファイルパスの扱い

- Storage APIは相対パスで指定
- `PublicStorage('data/users.txt')` → `storage/public/data/users.txt`
- 絶対パスは使用不可

良い例:
```typescript
let storage = new PublicStorage('data/users.txt');
```

悪い例:
```typescript
// 絶対パスは使用不可
let storage = new PublicStorage('/var/data/users.txt');
```

### 大容量ファイルの注意

- 大容量ファイルはストリーム処理を使用
- `read()`（非推奨）はファイル全体をメモリに読み込むため避ける
- 行単位処理には`eachLine()`を使用

```typescript
// 大容量ファイルの行単位処理
storage.openAsText(function(reader: TextReader, error: Error | null): void {
  if (error) throw error;

  reader.eachLine(function(line) {
    // 1行ずつ処理（メモリ効率が良い）
    processLine(line);
  });
});
```

### ファイル名の検証

ユーザ入力をファイル名に使用する場合は、パストラバーサル対策が必要。

```typescript
/**
 * ファイル名のサニタイズ
 */
function sanitizeFileName(fileName: string): string {
  // パストラバーサル対策
  let sanitized = fileName.replace(/\.\./g, '');
  sanitized = sanitized.replace(/[\/\\]/g, '_');
  sanitized = sanitized.replace(/[<>:"|?*]/g, '_');

  return sanitized;
}
```
