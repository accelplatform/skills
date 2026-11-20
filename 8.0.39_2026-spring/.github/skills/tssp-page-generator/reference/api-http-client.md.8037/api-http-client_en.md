---
paths:
  - "src/main/tssp/**/*.ts"
---

# HttpClient API Reference

## Overview

HttpClient is an object for sending HTTP requests.
It supports GET, POST, PUT, DELETE, PATCH, HEAD, and OPTIONS methods.

## Constructor

```typescript
// Basic
let client = new HttpClient();

// With timeout and other options
let configuredClient = new HttpClient({
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

```typescript
let parameters: HttpClient.PostParameters = {
  headers: { /* headers */ },
  body: { /* request body */ },
  'default-charset': 'UTF-8',
  multipart: true  // For multipart transmission
};
```

The argument types are `HttpClient.GetParameters` / `HttpClient.PostParameters` and so on in the d.ts (`d.ts/platform/http/im-ssjs-http-client.d.ts`). When passing a string as `body`, specify `'Content-Type'` in `headers` (otherwise the type checking of `tssp build` fails).

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

The d.ts declares the `callback` of `openAsText` / `openAsBinary` as the `Function` type, so write types for the callback parameters (otherwise `tssp build` fails with TS7006). The first parameter is a `TextReader` (a `ByteReader` for `openAsBinary`), and is `null` on error. The second parameter is an `Error` on error and `null` on success.

## Usage Examples

### GET Request

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

### POST Request (JSON)

```typescript
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

```typescript
let client = new HttpClient();

try {
  let response = client.post('https://api.example.com/search', {
    body: {
      'keyword': 'search term',
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

The d.ts `HttpClient.BodyParameter` does not declare an array of strings as a value, so sending multiple values under the same name (`'categories': ['cat1', 'cat2']`) does not pass the type checking of `tssp build`. To send multiple values under the same name, specify `'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'` in `headers` and pass a string assembled like `'categories=' + encodeURIComponent('cat1') + '&categories=' + encodeURIComponent('cat2')` as `body`.

### POST Request (Multipart / File Upload)

```typescript
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
// Updated cookies can be referenced in client.cookieStore
```

The d.ts `HttpClientCookie` declares all properties of a retrieved cookie (`comment`, `expiryDate`, `expired()`, etc.) as required. Match the type of an object that contains only the properties used for setting with `as HttpClientCookie` (without it, the type checking of `tssp build` fails).

### Basic Authentication

The d.ts has no Base64 encoding API, so receive the Base64-encoded "username:password" value (`basicCredentials` in the example) as an already-encoded value and attach `'Basic ' + basicCredentials` to the `Authorization` header.

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

### OAuth Authentication (Bearer Token)

Attach the access token obtained from the authorization server (`accessToken` in the example) to the `Authorization` header in the form `'Bearer ' + accessToken`.

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

## Error Handling and Retry

When waiting for a certain period during retry processing, use Client.sleep, but note that this is a deprecated method. For such complex processing, it is recommended to use Java alternatives, and this should be indicated in a comment.

```typescript
/**
 * API call with retry functionality
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
      logger.warn('API call exception, retrying: {}', (e as Error).message);
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
