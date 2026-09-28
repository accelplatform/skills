# HTTPResponse API 参考手册

## 概述

HTTPResponse 是一个用于支持向客户端发送响应处理的对象。
通过 `Web.getHTTPResponse()` 方法获取。

### 获取方法

```javascript
let response = Web.getHTTPResponse();
```

## 方法列表

### 响应设置

| 方法 | 说明 |
|---------|------|
| setContentType(type) | 设置Content-Type |
| setContentLength(len) | 设置Content-Length |
| setStatus(sc) | 设置状态码 |

### 请求头操作

| 方法 | 说明 |
|---------|------|
| setHeader(name, value) | 设置响应头（覆盖已有内容） |
| addHeader(name, value) | 追加响应头 |
| setDateHeader(name, date) | 设置日期头（Date或毫秒） |
| addDateHeader(name, date) | 追加日期头（Date或毫秒） |

### Cookie

| 方法 | 说明 |
|---------|------|
| addCookie(cookie) | 在响应中设置Cookie对象 |

### 数据发送

| 方法 | 说明 |
|---------|------|
| sendMessageBody(strm) | 发送数据 |
| sendMessageBodyString(str) | 自动转换字符编码并发送数据 |
| sendMessageBodyFile(file, isDelete?) | 发送文件（isDelete：发送后是否删除。默认 `false`） |
| sendMessageBodyAsBinary(source) | 以二进制格式发送Storage的数据 |
| sendMessageBodyAsText(source, charsetName) | 以文本格式发送Storage的数据 |
| sendError(sc, msg?) | 发送错误响应。失败时返回 `false` |

**注意：** `sendMessageBody*` 方法执行后，JavaScript的处理将被中断。不可在try...catch构造中使用。

## 使用示例

### 返回JSON响应

```javascript
let response = Web.getHTTPResponse();
response.setContentType('application/json; charset=utf-8');

let data = JSON.stringify({status: 'success', message: '注册完成'});
response.sendMessageBodyString(data);
```

### 下载CSV文件

```javascript
let response = Web.getHTTPResponse();
response.setContentType('text/csv; charset=Shift_JIS');
response.setHeader('Content-Disposition', 'attachment; filename="data.csv"');

let csvData = '姓名,年龄\nTanaka,30\nSuzuki,25';
response.sendMessageBodyString(csvData);
```

### 下载文件

```javascript
let file = new File('path/to/file.pdf');
let response = Web.getHTTPResponse();
response.setContentType('application/pdf');
response.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
response.sendMessageBodyFile(file);
```

### 从Storage发送二进制数据

```javascript
let storage = new PublicStorage('path/to/file.xlsx');
let response = Web.getHTTPResponse();
response.setContentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
response.setHeader('Content-Disposition', 'attachment; filename="data.xlsx"');
response.sendMessageBodyAsBinary(storage);
```

### 发送错误响应

```javascript
let response = Web.getHTTPResponse();
response.sendError(404, '找不到指定的资源');
```

### 设置Cookie

```javascript
let response = Web.getHTTPResponse();
let cookie = new Cookie('session_key', 'abc123');
cookie.setMaxAge(60 * 60); // 1小时
cookie.setPath('/');
cookie.setHttpOnly(true);
response.addCookie(cookie);
```
