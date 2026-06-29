# HttpClient API Reference

## Overview

HttpClient is an object for sending HTTP requests.
It supports GET, POST, PUT, DELETE, PATCH, HEAD, and OPTIONS methods.

## Constructor

```javascript
// Basic
let client = new HttpClient();

// With timeout and other options
let client = new HttpClient({
  'connection-request-timeout-millis': 30000,
  'connect-timeout-millis': 30000,
  'socket-timeout-millis': 30000,
  'redirects-enabled': true,
  'max-redirects': 10,
  'ignore-ssl-errors': true
});
```

| Parameter | Description |
|-----------|------|
| connection-request-timeout-millis | Connection request timeout (milliseconds) |
| connect-timeout-millis | Connection timeout (milliseconds) |
| socket-timeout-millis | Socket timeout (milliseconds) |
| redirects-enabled | Flag to enable redirects |
| max-redirects | Maximum number of redirects |
| ignore-ssl-errors | Flag to ignore SSL certificate errors |

## Properties

| Property | Type | Description |
|-----------|------|------|
| cookieStore | Array(HttpClientCookie) | Cookie store |

## Method List

### HTTP Requests

| Method | Return Value | Description |
|---------|--------|------|
| get(url, parameters?) | HttpClientResult | Send a GET request |
| post(url, parameters?) | HttpClientResult | Send a POST request |
| put(url, parameters?) | HttpClientResult | Send a PUT request |
| patch(url, parameters?) | HttpClientResult | Send a PATCH request |
| doDelete(url, parameters?) | HttpClientResult | Send a DELETE request |
| head(url, parameters?) | HttpClientResult | Send a HEAD request |
| options(url, parameters?) | HttpClientResult | Send an OPTIONS request |
| close() | Boolean | Release resources (must be called after request completion) |

### Request Parameter Format

```javascript
{
  headers: { /* headers */ },
  body: { /* request body */ },
  'default-charset': 'UTF-8',
  multipart: true  // For multipart transmission
}
```

## HttpClientResult

Return value of the request. In `ResultObject` format.

| Property | Type | Description |
|-----------|------|------|
| error | Boolean | Whether an error occurred |
| data | Object | Response data (see below) |

### Properties and Methods of data

| Property/Method | Type | Description |
|-------------------|------|------|
| status | Number | HTTP status code |
| responseHeaders | Array | Response header array (each element has `name` and `value`) |
| openAsText(callback, enc) | TextReader | Read the body as text |
| openAsBinary(callback) | ByteReader | Read the body as binary |
| close() | Boolean | Release response resources |

## Usage Examples

### GET Request

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

### POST Request (JSON)

```javascript
let client = new HttpClient();

try {
  let response = client.post('https://api.example.com/users', {
    headers: {'Content-Type': 'application/json; charset=UTF-8'},
    body: ImJson.toJSONString({'name': 'Tanaka', 'email': 'tanaka@example.com'})
  });

  if (!response.error) {
    // Handle response
    response.data.close();
  }
} finally {
  client.close();
}
```

### POST Request (Form)

```javascript
let client = new HttpClient();

try {
  let response = client.post('https://api.example.com/search', {
    body: {
      'keyword': 'search term',
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

### POST Request (Multipart / File Upload)

```javascript
let client = new HttpClient();

try {
  let response = client.post('https://api.example.com/upload', {
    body: {
      'description': 'Uploaded file',
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

### Maintaining Session with Cookie

```javascript
let client = new HttpClient();
client.cookieStore = [{
  name: 'JSESSIONID',
  value: 'abcdefghijklmnopqrstu',
  domain: 'localhost',
  path: '/',
  version: 0
}];

let response = client.get('http://localhost/app');
// Updated cookies can be referenced in client.cookieStore
```

### Basic Authentication

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

### OAuth Authentication (Bearer Token)

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

## Error Handling and Retry

When waiting for a certain period during retry processing, use Client.sleep, but note that this is a deprecated method. For such complex processing, it is recommended to use Java alternatives, and this should be indicated in a comment.

```javascript
/**
 * API call with retry functionality
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

        // 4xx errors are not retryable
        if (statusCode >= 400 && statusCode < 500) {
          logger.error('Client error: statusCode={}', statusCode);
          return null;
        }

        logger.warn('Server error, retrying: statusCode={}', statusCode);
      } else {
        logger.warn('API call error, retrying: {}', response.errorMessage);
      }

    } catch (e) {
      logger.warn('API call exception, retrying: {}', e.message);
    } finally {
      client.close();
    }

    retryCount++;

    // Exponential backoff
    if (retryCount < maxRetries) {
      let waitTime = Math.pow(2, retryCount) * 1000;
      Client.sleep(waitTime);  // Deprecated method
    }
  }

  logger.error('API call failed (max retries exceeded)');
  return null;
}
```
