---
paths:
  - "src/main/tssp/**/*.ts"
---

# Request 对象参考

## 概述

Request 是保存来自客户端的请求信息的对象。
每次浏览器发出请求时创建，作为函数容器的 `init()` 函数或动作绑定函数的参数传递。

```typescript
export function init(request: Request): void {
  // URL参数可以作为属性直接访问
  let name: string = request['name'];

  // 或者使用 getParameterValue() 获取（不存在时为 null）
  let nameValue: string | null = request.getParameterValue('name');
}
```

`Request` 的类型声明在 `d.ts/platform/standard/im-ssjs-request.d.ts` 中。它带有用于读取 URL 参数的索引签名 `[key: string]: Request.Attribute`（`Request.Attribute` 为 `any`），因此以属性方式读取的值需要用带类型的变量接收。即使写了声明中不存在的方法名也能通过类型检查，因此请对照下表或 d.ts 确认方法名。

## 方法列表

### 参数获取

| 方法 | 返回值 | 说明 |
|------|--------|------|
| getParameterValue(key: string) | `string \| null` | 返回指定键的第一个URL参数。不存在时返回 `null` |
| getParameterValues(key: string) | `string[]` | 以数组形式返回指定键的所有URL参数。不存在时返回空数组 |
| getParameterNames() | `string[]` | 返回所有请求参数名 |
| getParameter(name: string) | `RequestParameter` | 以 RequestParameter 形式返回指定参数。不存在时返回 `null` |
| getParameters(name: string) | `RequestParameter[]` | 以 RequestParameter 数组形式返回指定参数的所有值 |

### 头部获取

| 方法 | 返回值 | 说明 |
|------|--------|------|
| getHeaderNames() | `string[]` | 返回所有头部名称的数组 |
| getHeader(name: string) | `string` | 返回指定头部的第一个值。不存在时返回 `null` |
| getHeaders(name: string) | `string[]` | 以数组形式返回指定头部的所有值。不存在时返回空数组 |

### Cookie 获取

| 方法 | 返回值 | 说明 |
|------|--------|------|
| getCookieNames() | `string[] \| null` | 返回所有Cookie名称的数组。无Cookie时返回 `null` |
| getCookie(name: string) | `string \| null` | 返回指定名称的Cookie值。不存在时返回 `null` |
| getCookies(name: string) | `string[]` | 以数组形式返回指定名称的所有Cookie值 |

### 消息体获取

| 方法 | 返回值 | 说明 |
|------|--------|------|
| getMessageBodyAsStream() | `string` | 不进行字符编码转换，直接返回二进制数据 |
| getMessageBodyAsString() | `string` | 使用 ServletRequest 编码将消息体转换为 Unicode 后返回 |
| getMessageBody(encoding: string) | `string` | 使用指定编码将消息体转换为 Unicode 后返回 |
| openMessageBodyAsBinary(callback?: Function) | `ByteReader` | 以 ByteReader 形式返回二进制数据 |
| openMessageBodyAsText(callback?: Function, encoding?: string) | `TextReader` | 以 TextReader 形式返回文本数据 |

### 请求信息

| 方法 | 返回值 | 说明 |
|------|--------|------|
| getMethod() | `string` | 返回HTTP方法名（`GET`、`POST` 等） |
| getContentLength() | `number` | 返回消息体的字节长度。未知时返回 `-1` |
| getContentType() | `string \| null` | 返回请求的MIME类型。未知时返回 `null` |
| getQueryString() | `string \| null` | 返回URL的查询字符串。无查询时返回 `null` |

### 属性操作

| 方法 | 返回值 | 说明 |
|------|--------|------|
| getAttributeNames() | `string[]` | 返回可用属性名的数组 |
| getAttribute(name: string) | `Request.Attribute \| null` | 返回指定属性值。不存在时返回 `null` |
| setAttribute(name: string, object: Request.Attribute) | `void` | 向请求设置属性 |
| removeAttribute(name: string) | `void` | 从请求删除属性 |

## 使用示例

### 获取参数

```typescript
export function init(request: Request): void {
  // 获取单一值（不存在时为 null）
  let userId: string | null = request.getParameterValue('user_id');

  // 也可以作为属性直接访问
  let userIdProperty: string = request['user_id'];

  // 获取多个值（复选框等）
  let selectedIds: string[] = request.getParameterValues('selected_ids');
}
```

### 获取POST请求的JSON正文

```typescript
/** 通过 POST 接收的 JSON 的形状（字段按用途定义） */
interface RequestBody {
  userCode: string;             // 用户代码
}

export function init(request: Request): void {
  if (request.getMethod() === 'POST') {
    let body: string = request.getMessageBodyAsString();
    // JSON.parse() 的返回值为 any，因此用带类型的变量接收
    let data: RequestBody = JSON.parse(body);
  }
}
```

### 获取头部和Cookie

```typescript
export function init(request: Request): void {
  let contentType: string | null = request.getHeader('Content-Type');
  let sessionId: string | null = request.getCookie('JSESSIONID');
}
```

### 属性传递

```typescript
/** 通过请求属性传递的处理结果 */
interface ProcessResult {
  status: string;               // 处理结果的状态
}

export function init(request: Request): void {
  request.setAttribute('processResult', {status: 'success'});

  // getAttribute() 的返回值为 Request.Attribute（any），因此用带类型的变量接收
  let result: ProcessResult | null = request.getAttribute('processResult');
}
```

## RequestParameter 对象

可以通过 `request.getParameter(name)` / `request.getParameters(name)` 获取的对象。
保存上传文件和请求数据相关信息。

### 方法列表

| 方法 | 返回值 | 说明 |
|------|--------|------|
| getName() | `string` | 获取参数名 |
| getValue() | `string` | 获取参数值（字符编码转换后） |
| getLength() | `number` | 获取数据长度（字节） |
| getFileName() | `string \| null` | 上传文件的文件名。非文件时返回 `null` |
| getHeaderNames() | `string[] \| null` | 头部名称列表。无头部时返回 `null` |
| getHeader(name: string) | `string` | 获取指定头部名称的值 |
| openValueAsBinary(callback?: Function) | `ByteReader` | 以二进制流形式获取参数值（不进行字符编码转换） |
| openValueAsText(callback?: Function, charsetName?: string) | `TextReader` | 以文本流形式获取参数值（转换为指定字符编码） |

### 文件上传处理示例

直接调用 `ByteReader.read(buffer, ...)` 存在陷阱：字节无法写入 JavaScript 的空数组，
导致**文件以 0 字节保存**。
传输用途时，请使用 `ByteReader.transferTo(writer, chunkSize)`。
详情请参考 `reference/api-binary-stream.md`。

```typescript
export function init(request: Request): void {
  let uploadedFile = request.getParameter('upload_file');

  // 若请求未以文件形式发送，getFileName() 将返回 null
  if (!uploadedFile || !uploadedFile.getFileName()) {
    return;
  }

  let fileName = uploadedFile.getFileName();
  let fileSize = uploadedFile.getLength();

  // 使用 transferTo 将二进制流复制到 Storage
  let storage = new PublicStorage('upload/' + fileName);
  let reader = uploadedFile.openValueAsBinary();
  let writer = storage.createAsBinary();
  try {
    reader.transferTo(writer, 8192);
    writer.flush();
  } finally {
    try { writer.close(); } catch (ignored) {}
    try { reader.close(); } catch (ignored) {}
  }
}
```

完整的文件上传/下载 REST-API 实现请参考 `assets/file-upload-download-api.md`。
