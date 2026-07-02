---
paths:
  - "src/main/jssp/**/*.js"
---

# HttpClient API 参考手册

## 概述

HttpClient 是用于发送HTTP请求的对象。
支持GET、POST、PUT、DELETE、PATCH、HEAD、OPTIONS方法。

## 构造函数

```javascript
// 基本
let client = new HttpClient();

// 指定超时等选项
let client = new HttpClient({
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

```javascript
{
  headers: { /* 请求头 */ },
  body: { /* 请求体 */ },
  'default-charset': 'UTF-8',
  multipart: true  // 多部分发送时
}
```

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

## 使用示例

### GET请求

```javascript
let client = new HttpClient();

try {
  let response = client.get('https://api.example.com/users');

  if (!response.error) {
    response.data.openAsText(function(textReader, error) {
      if (error === null) {
        let body = '';
        let line;
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

```javascript
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

```javascript
let client = new HttpClient();

try {
  let response = client.post('https://api.example.com/search', {
    body: {
      'keyword': '搜索关键词',
      'categories': ['cat1', 'cat2']
    }
  });

  if (!response.error) {
    response.data.close();
  }
} finally {
  client.close();
}
```

### POST请求（多部分 / 文件上传）

```javascript
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

```javascript
let client = new HttpClient();
client.cookieStore = [{
  name: 'JSESSIONID',
  value: 'abcdefghijklmnopqrstu',
  domain: '127.0.0.1',
  path: '/',
  version: 0
}];

let response = client.get('http://127.0.0.1/app');
// 可以在 client.cookieStore 中参照更新后的Cookie
```

### Basic认证

```javascript
let client = new HttpClient();

try {
  let credentials = username + ':' + password;
  let token = Base64.encode(credentials);
  let response = client.get('https://api.example.com/users', {
    headers: {'Authorization': 'Bearer ' + token}
  });

  if (!response.error) {
    response.data.openAsText(function(textReader, error) {
      if (error === null) {
        let body = '';
        let line;
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

```javascript
let client = new HttpClient();

try {
  let credentials = clientId + ':' + clientSecret;
  let token = Base64.encode(credentials);
  let response = client.get('https://api.example.com/users', {
    headers: {'Authorization': 'Bearer ' + token}
  });

  if (!response.error) {
    response.data.openAsText(function(textReader, error) {
      if (error === null) {
        let body = '';
        let line;
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

```javascript
/**
 * 带重试功能的API调用
 */
function callApiWithRetry(url, maxRetries) {
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
          response.data.openAsText(function(textReader, error) {
            if (error === null) {
              let line;
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
      logger.warn('API调用异常，正在重试：{}', e.message);
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