# HttpClient API 参考手册

## 概述

HttpClient 是用于发送HTTP请求的对象。
支持GET、POST、PUT、DELETE、PATCH、HEAD、OPTIONS方法。

## 构造函数

```typescript
// 基本
let client = new HttpClient();

// 指定超时等选项
let configuredClient = new HttpClient({
  'connection-request-timeout-millis': 30000,
  'connect-timeout-millis': 30000,
  'socket-timeout-millis': 30000,
  'redirects-enabled': true,
  'max-redirects': 10,
  'ignore-ssl-errors': true
});
```

| 参数 | 说明 |
|-----------|------|
| connection-request-timeout-millis | 连接请求超时（毫秒） |
| connect-timeout-millis | 连接超时（毫秒） |
| socket-timeout-millis | 套接字超时（毫秒） |
| redirects-enabled | 重定向启用标志 |
| max-redirects | 最大重定向次数 |
| ignore-ssl-errors | SSL证书错误忽略标志 |

## 属性

| 属性 | 类型 | 说明 |
|-----------|------|------|
| cookieStore | Array(HttpClientCookie) | Cookie存储 |

## 方法列表

### HTTP请求

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| get(url, parameters?) | HttpClientResult | 发送GET请求 |
| post(url, parameters?) | HttpClientResult | 发送POST请求 |
| put(url, parameters?) | HttpClientResult | 发送PUT请求 |
| patch(url, parameters?) | HttpClientResult | 发送PATCH请求 |
| doDelete(url, parameters?) | HttpClientResult | 发送DELETE请求 |
| head(url, parameters?) | HttpClientResult | 发送HEAD请求 |
| options(url, parameters?) | HttpClientResult | 发送OPTIONS请求 |
| close() | Boolean | 释放资源（请求完成后必须调用） |

### 请求参数格式

```typescript
let parameters: HttpClient.PostParameters = {
  headers: { /* 请求头 */ },
  body: { /* 请求体 */ },
  'default-charset': 'UTF-8',
  multipart: true  // 多部分发送时
};
```

参数的类型为 d.ts（`d.ts/platform/http/im-ssjs-http-client.d.ts`）中的 `HttpClient.GetParameters` / `HttpClient.PostParameters` 等。将字符串作为 `body` 传递时，需要在 `headers` 中指定 `'Content-Type'`（不指定的话，`tssp build` 的类型检查会失败）。

## HttpClientResult

请求的返回值，为 `ResultObject` 格式。

| 属性 | 类型 | 说明 |
|-----------|------|------|
| error | Boolean | 是否发生错误 |
| data | Object | 响应数据（见下文） |

### data的属性与方法

| 属性/方法 | 类型 | 说明 |
|-------------------|------|------|
| status | Number | HTTP状态码 |
| responseHeaders | Array | 响应头数组（每个元素包含 `name`、`value`） |
| openAsText(callback, enc) | TextReader | 以文本方式读取请求体 |
| openAsBinary(callback) | ByteReader | 以二进制方式读取请求体 |
| close() | Boolean | 释放响应资源 |

d.ts 将 `openAsText` / `openAsBinary` 的 `callback` 声明为 `Function` 类型，因此需要为回调函数的参数标注类型（不标注的话，`tssp build` 会因 TS7006 而失败）。第 1 个参数为 `TextReader`（`openAsBinary` 中为 `ByteReader`），出错时为 `null`。第 2 个参数在出错时为 `Error`，成功时为 `null`。

## 使用示例

### GET请求

```typescript
let client = new HttpClient();

try {
  let response = client.get('https://api.example.com/users');

  if (!response.error) {
    response.data.openAsText(function(textReader: TextReader | null, error: Error | null): void {
      if (error === null && textReader !== null) {
        let body = '';
        let line: string | null;
        while ((line = textReader.readLine()) !== null) {
          body += line;
        }
        let data = JSON.parse(body);
      }
    }, 'UTF-8');
    response.data.close();
  }
} finally {
  client.close();
}
```

### POST请求（JSON）

```typescript
let client = new HttpClient();

try {
  let response = client.post('https://api.example.com/users', {
    headers: {'Content-Type': 'application/json; charset=UTF-8'},
    body: ImJson.toJSONString({'name': 'Tanaka', 'email': 'tanaka@example.com'})
  });

  if (!response.error) {
    // 处理响应
    response.data.close();
  }
} finally {
  client.close();
}
```

### POST请求（表单）

```typescript
let client = new HttpClient();

try {
  let response = client.post('https://api.example.com/search', {
    body: {
      'keyword': '搜索关键词',
      'category': 'cat1'
    }
  });

  if (!response.error) {
    response.data.close();
  }
} finally {
  client.close();
}
```

d.ts 的 `HttpClient.BodyParameter` 没有将字符串数组声明为值的类型，因此以同一名称发送多个值的写法（`'categories': ['cat1', 'cat2']`）无法通过 `tssp build` 的类型检查。以同一名称发送多个值时，在 `headers` 中指定 `'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'`，并将 `'categories=' + encodeURIComponent('cat1') + '&categories=' + encodeURIComponent('cat2')` 这样拼接而成的字符串作为 `body` 传递。

### POST请求（多部分 / 文件上传）

```typescript
let client = new HttpClient();

try {
  let response = client.post('https://api.example.com/upload', {
    body: {
      'description': '上传文件',
      'file': new PublicStorage('upload/data.csv')
    },
    multipart: true
  });

  if (!response.error) {
    response.data.close();
  }
} finally {
  client.close();
}
```

### 通过Cookie维持会话

```typescript
let client = new HttpClient();
client.cookieStore = [{
  name: 'JSESSIONID',
  value: 'abcdefghijklmnopqrstu',
  domain: '127.0.0.1',
  path: '/',
  version: 0
} as HttpClientCookie];

let response = client.get('http://127.0.0.1/app');
// 可以在 client.cookieStore 中参照更新后的Cookie
```

d.ts 的 `HttpClientCookie` 将获取到的 Cookie 所具有的属性（`comment`、`expiryDate`、`expired()` 等）全部声明为必填。对于只包含用于设置的属性的对象，使用 `as HttpClientCookie` 来匹配类型（不添加的话，`tssp build` 的类型检查会失败）。

### Basic认证

d.ts 中没有 Base64 编码的 API，因此将对“用户名:密码”进行 Base64 编码后的值（示例中的 `basicCredentials`）作为已编码的值接收，并将 `'Basic ' + basicCredentials` 附加到 `Authorization` 头。

```typescript
let client = new HttpClient();

try {
  let response = client.get('https://api.example.com/users', {
    headers: {'Authorization': 'Basic ' + basicCredentials}
  });

  if (!response.error) {
    response.data.openAsText(function(textReader: TextReader | null, error: Error | null): void {
      if (error === null && textReader !== null) {
        let body = '';
        let line: string | null;
        while ((line = textReader.readLine()) !== null) {
          body += line;
        }
        let data = JSON.parse(body);
      }
    }, 'UTF-8');
    response.data.close();
  }
} finally {
  client.close();
}
```

### OAuth认证（Bearer Token）

在 `Authorization` 头中，以 `'Bearer ' + accessToken` 的形式附加从授权服务器获取的访问令牌（示例中的 `accessToken`）。

```typescript
let client = new HttpClient();

try {
  let response = client.get('https://api.example.com/users', {
    headers: {'Authorization': 'Bearer ' + accessToken}
  });

  if (!response.error) {
    response.data.openAsText(function(textReader: TextReader | null, error: Error | null): void {
      if (error === null && textReader !== null) {
        let body = '';
        let line: string | null;
        while ((line = textReader.readLine()) !== null) {
          body += line;
        }
        let data = JSON.parse(body);
      }
    }, 'UTF-8');
    response.data.close();
  }
} finally {
  client.close();
}
```

## 错误处理与重试

重试处理中需要等待一段时间时，使用Client.sleep，但由于该方法已废弃，进行此类复杂处理时，建议在注释中明确说明推荐使用Java替代方案。

```typescript
/**
 * 带重试功能的API调用
 */
function callApiWithRetry(url: string, maxRetries: number): unknown {
  let logger = Logger.getLogger();
  let retryCount = 0;

  while (retryCount < maxRetries) {
    let client = new HttpClient({
      'connect-timeout-millis': 30000,
      'socket-timeout-millis': 30000
    });

    try {
      let response = client.get(url, {
        headers: {'Content-Type': 'application/json'}
      });

      if (!response.error) {
        let statusCode = response.data.status;

        if (statusCode >= 200 && statusCode < 300) {
          let body = '';
          response.data.openAsText(function(textReader: TextReader | null, error: Error | null): void {
            if (error === null && textReader !== null) {
              let line: string | null;
              while ((line = textReader.readLine()) !== null) {
                body += line;
              }
            }
          }, 'UTF-8');
          response.data.close();
          return JSON.parse(body);
        }

        response.data.close();

        // 4xx错误不可重试
        if (statusCode >= 400 && statusCode < 500) {
          logger.error('客户端错误：statusCode={}', statusCode);
          return null;
        }

        logger.warn('服务器错误，正在重试：statusCode={}', statusCode);
      } else {
        logger.warn('API调用错误，正在重试：{}', response.errorMessage);
      }

    } catch (e) {
      logger.warn('API调用异常，正在重试：{}', (e as Error).message);
    } finally {
      client.close();
    }

    retryCount++;

    // 指数退避
    if (retryCount < maxRetries) {
      let waitTime = Math.pow(2, retryCount) * 1000;
      Client.sleep(waitTime);  // 已废弃的方法
    }
  }

  logger.error('API调用失败（超过重试上限）');
  return null;
}
```