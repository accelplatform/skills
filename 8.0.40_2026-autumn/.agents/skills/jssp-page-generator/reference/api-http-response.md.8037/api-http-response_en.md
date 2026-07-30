# HTTPResponse API Reference

## Overview

HTTPResponse is an object that supports the process of sending responses to clients.
It is obtained via the `Web.getHTTPResponse()` method.

### How to Retrieve

```javascript
let response = Web.getHTTPResponse();
```

## Method List

### Response Settings

| Method | Description |
|---------|------|
| setContentType(type) | Set Content-Type |
| setContentLength(len) | Set Content-Length |
| setStatus(sc) | Set status code |

### Header Operations

| Method | Description |
|---------|------|
| setHeader(name, value) | Set response header (overwrites existing) |
| addHeader(name, value) | Add response header |
| setDateHeader(name, date) | Set date header (Date or milliseconds) |
| addDateHeader(name, date) | Add date header (Date or milliseconds) |

### Cookie

| Method | Description |
|---------|------|
| addCookie(cookie) | Set a Cookie object in the response |

### Data Transmission

| Method | Description |
|---------|------|
| sendMessageBody(strm) | Send data |
| sendMessageBodyString(str) | Send data with automatic character encoding conversion |
| sendMessageBodyFile(file, isDelete?) | Send a file (isDelete: whether to delete after sending; default `false`) |
| sendMessageBodyAsBinary(source) | Send Storage data in binary format |
| sendMessageBodyAsText(source, charsetName) | Send Storage data in text format |
| sendError(sc, msg?) | Send error response. Returns `false` on failure |

**Note:** After executing `sendMessageBody*` methods, JavaScript processing is interrupted. Cannot be used in try...catch blocks.

## Usage Examples

### Returning a JSON Response

```javascript
let response = Web.getHTTPResponse();
response.setContentType('application/json; charset=utf-8');

let data = JSON.stringify({status: 'success', message: 'Registration complete'});
response.sendMessageBodyString(data);
```

### Downloading a CSV File

```javascript
let response = Web.getHTTPResponse();
response.setContentType('text/csv; charset=Shift_JIS');
response.setHeader('Content-Disposition', 'attachment; filename="data.csv"');

let csvData = 'Name,Age\nTanaka,30\nSuzuki,25';
response.sendMessageBodyString(csvData);
```

### Downloading a File

```javascript
let file = new File('path/to/file.pdf');
let response = Web.getHTTPResponse();
response.setContentType('application/pdf');
response.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
response.sendMessageBodyFile(file);
```

### Sending Binary Data from Storage

```javascript
let storage = new PublicStorage('path/to/file.xlsx');
let response = Web.getHTTPResponse();
response.setContentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
response.setHeader('Content-Disposition', 'attachment; filename="data.xlsx"');
response.sendMessageBodyAsBinary(storage);
```

### Sending an Error Response

```javascript
let response = Web.getHTTPResponse();
response.sendError(404, 'The specified resource was not found');
```

### Setting a Cookie

```javascript
let response = Web.getHTTPResponse();
let cookie = new Cookie('session_key', 'abc123');
cookie.setMaxAge(60 * 60); // 1 hour
cookie.setPath('/');
cookie.setHttpOnly(true);
response.addCookie(cookie);
```
