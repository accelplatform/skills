---
paths:
  - "src/main/jssp/**/*.js"
---

# 二进制流（ByteReader / ByteWriter / RequestParameter）

接收文件上传、写入 PublicStorage 等处理二进制数据时的参考文档。

## 相关类

| 类 | 用途 |
|----|------|
| `RequestParameter` | 通过 `request.getParameter('file')` 获取。表示以 multipart/form-data 上传的文件等 |
| `ByteReader` | 读取二进制流。可通过 `request.openMessageBodyAsBinary()` / `requestParameter.openValueAsBinary()` / `storage.openAsBinary()` 获取 |
| `ByteWriter` | 写入二进制流。可通过 `storage.createAsBinary()` / `storage.appendAsBinary()` 获取 |

## 接收并保存上传文件

### 推荐模式：使用 `transferTo` 进行流式传输

ByteReader → ByteWriter 的复制必须使用 **`reader.transferTo(writer, chunkSize)`**。
通过指定块大小，可以在抑制内存消耗的同时完成全部数据的传输。

```javascript
/**
 * 将上传的文件保存到 PublicStorage。
 *
 * @param {Object} uploadedFile - 通过 request.getParameter('file') 获取的 RequestParameter
 * @param {string} fileKey - 保存路径（如 uploads/xxx/yyy.ext）
 * @return {number} 已写入的字节数
 */
function saveUpload(uploadedFile, fileKey) {
  let TRANSFER_CHUNK_SIZE = 8192;
  let storage = new PublicStorage(fileKey);

  // 如父目录不存在则创建
  let parent = storage.getParentStorage();
  if (!parent.exists()) {
    parent.makeDirectories();
  }

  let reader = uploadedFile.openValueAsBinary();
  let writer = storage.createAsBinary();
  try {
    if (!reader.transferTo(writer, TRANSFER_CHUNK_SIZE)) {
      throw new Error('文件写入失败。');
    }
    writer.flush();
  } finally {
    try { writer.close(); } catch (ignored) {}
    try { reader.close(); } catch (ignored) {}
  }
  return uploadedFile.getLength();
}
```

### 禁止模式：直接调用 `ByteReader.read(buffer, offset, length)`

`ByteReader.read()` 相当于 Java 的 `InputStream.read(byte[], int, int)`，
**要求调用方传入预分配容量的数组**。
传入 JavaScript 的空数组 `[]` 时，字节不会被写入，结果是
**始终返回 0 次读取**，导致输出文件为 **0 字节**。

```javascript
// NG：导致 0 字节保存的陷阱
let reader = uploadedFile.openValueAsBinary();
let writer = storage.createAsBinary();
let buffer = [];   // ← 仍是空数组，read() 无法写入字节
while (true) {
  let bytesRead = reader.read(buffer, 0, 8192);  // 始终返回 0
  if (bytesRead <= 0) break;
  writer.write(buffer, 0, bytesRead);            // 没有任何写入
}
```

几乎没有使用 `reader.read()` 的场景。**用于传输时必须使用 `transferTo`。**

### 回调版本

向 `openValueAsBinary` / `createAsBinary` 传入回调时，处理结束后将自动 `close`。
嵌套虽然较深，但可避免漏掉 close。

```javascript
function saveUploadWithCallback(uploadedFile, fileKey) {
  let TRANSFER_CHUNK_SIZE = 8192;
  let storage = new PublicStorage(fileKey);
  let parent = storage.getParentStorage();
  if (!parent.exists()) {
    parent.makeDirectories();
  }

  uploadedFile.openValueAsBinary(function(reader, readerError) {
    if (readerError) throw readerError;
    storage.createAsBinary(function(writer, writerError) {
      if (writerError) throw writerError;
      reader.transferTo(writer, TRANSFER_CHUNK_SIZE);
      writer.flush();
    });
  });
  return uploadedFile.getLength();
}
```

## 接收上传时的检查

确认 `RequestParameter` 是否以文件形式发送。

```javascript
let uploadedFile = request.getParameter('file');
if (!uploadedFile || !uploadedFile.getFileName()) {
  // 未附带文件（例如同名的文本参数）
  throw new Error('未指定上传文件。');
}

let length = uploadedFile.getLength();
if (length <= 0) {
  throw new Error('上传文件为空。');
}
if (length > MAX_FILE_SIZE_BYTES) {
  throw new Error('文件大小超过上限。');
}
```

- `getFileName()` 在 **非文件上传请求时返回 `null`**。可用于区分文本参数。
- `getLength()` 来源于 Content-Length。**可用于事前的大小限制检查。**

## 下载（PublicStorage → HTTP 响应）

将存储中的二进制数据直接流入响应时，使用 `HTTPResponse.sendMessageBodyAsBinary(storage)`。

```javascript
function sendFile(storage, downloadFileName) {
  let httpResponse = Web.getHTTPResponse();
  httpResponse.setStatus(200);
  httpResponse.setContentType('application/octet-stream');
  httpResponse.setHeader('Content-Disposition',
    'attachment; filename="' + downloadFileName + '"');
  let length = storage.length();
  if (length > 0) {
    httpResponse.setContentLength(length);
  }
  httpResponse.sendMessageBodyAsBinary(storage);
}
```

- 发送方法（`sendMessageBodyAsBinary` / `sendMessageBodyString` 等）执行后，**JavaScript 的执行将停止**
- 因此错误分支必须在**发送开始前**完成。一旦发送，便无法事后切换为 JSON 错误响应。

## 文件名安全化（防止路径穿越）

不要将用户提供的文件名直接拼入路径。
应取 basename 并将不允许的字符替换。

```javascript
function toSafeFileName(originalFileName) {
  let baseName = String(originalFileName);
  let slashIndex = baseName.lastIndexOf('/');
  if (slashIndex >= 0) {
    baseName = baseName.substring(slashIndex + 1);
  }
  let backslashIndex = baseName.lastIndexOf('\\');
  if (backslashIndex >= 0) {
    baseName = baseName.substring(backslashIndex + 1);
  }
  baseName = baseName.replace(/[^0-9A-Za-z_\-\.]/g, '_');
  baseName = baseName.replace(/^\.+/, '');
  return baseName || 'unnamed';
}
```

## 对接收的 key（fileKey）进行校验

对于像下载 API 那样使用客户端传入的路径打开存储的情况，
**必须进行白名单校验**。

```javascript
let FILE_KEY_PREFIX = 'uploads/';
let FILE_KEY_PATTERN = /^[0-9A-Za-z_\-\.\/]+$/;
let FILE_KEY_MAX_LENGTH = 256;

function validateFileKey(fileKey) {
  if (!fileKey || fileKey.length === 0) {
    throw new Error('fileKey 为必填项。');
  }
  if (fileKey.length > FILE_KEY_MAX_LENGTH) {
    throw new Error('fileKey 过长。');
  }
  if (!FILE_KEY_PATTERN.test(fileKey)) {
    throw new Error('fileKey 包含不允许使用的字符。');
  }
  if (fileKey.indexOf('..') >= 0) {
    throw new Error('fileKey 包含路径穿越字符。');
  }
  if (fileKey.indexOf(FILE_KEY_PREFIX) !== 0) {
    throw new Error('fileKey 必须位于 ' + FILE_KEY_PREFIX + ' 之下。');
  }
  return fileKey;
}
```

校验项：

| 校验 | 目的 |
|------|------|
| 必填、最大长度 | 提前排除异常值 |
| 字符种类白名单 | 禁止混入控制字符、空白、符号 |
| 不包含 `..` | 防止路径穿越 |
| 必须以 `uploads/` 开头 | 限制只能访问公开目录 |

## 检查清单

- [ ] 上传接收与写入之间的复制是否使用 `reader.transferTo(writer, chunkSize)`？
- [ ] 是否避免使用空数组调用 `ByteReader.read(buffer, ...)`（0 字节保存的元凶）？
- [ ] 上传文件的存在性是否通过 `getFileName()` 的 null 检查？
- [ ] 是否通过 `getLength()` 事前检查大小上限？
- [ ] 保存路径是否通过 `toSafeFileName()` 等等价处理进行净化？
- [ ] 来自客户端的 fileKey 是否通过白名单校验（前缀、字符种类、`..` 禁止）？
- [ ] 出错时是否在发送开始（`sendMessageBody*`）之前切换为 JSON 错误响应？

## 相关

- `reference/argument-request.md` - Request / RequestParameter 的方法一览
- `reference/api-storage.md` - PublicStorage / SessionScopeStorage / SystemStorage 的操作
- `reference/api-http-response.md` - HTTPResponse 的使用方法
- `reference/api-secure-token-manager.md` - 安全令牌（CSRF 防护）
- `assets/file-upload-download-api.md` - REST-API + 测试画面的参考实现
