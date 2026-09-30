# Routing Response Configuration

The properties that should be defined in the flow's `outputDataDefinition` differ depending on the `responseType` of the logic flow routing.

Reference: https://document.intra-mart.jp/library/iap/public/im_logic/im_logic_specification/texts/function_specification/routing/index.html#routing-response

## responseType List and Output Data Requirements

### imJsonResponse (Return as JSON)

Converts the entire flow output data to JSON format and returns it.
The `body` property is not required. All properties included in the output definition are directly converted to JSON.

```
output <object>
  └ (any properties)
```

### imTextResponse (Return as Text)

| Property | Type | Required | Description |
|-----------|-----|------|------|
| `body` | `string` or `storage` | Required | Response body |

```
output <object>
  └ body <string>
```

### imHtmlResponse (Return as HTML)

| Property | Type | Required | Description |
|-----------|-----|------|------|
| `body` | `string` or `storage` | Required | HTML content |

```
output <object>
  └ body <string>
```

### imXmlResponse (Return as XML)

| Property | Type | Required | Description |
|-----------|-----|------|------|
| `body` | `string` or `storage` | Required | XML content |

```
output <object>
  └ body <string>
```

### imJsonStringResponse (Return as JSON)

| Property | Type | Required | Description |
|-----------|-----|------|------|
| `body` | `string` or `storage` | Required | JSON string |

Difference from `imJsonResponse`: `imJsonResponse` automatically converts the entire output data to JSON, whereas `imJsonStringResponse` returns the JSON string stored in `body` as-is.

```
output <object>
  └ body <string>
```

### imAnyContentTypeResponse (Return with Arbitrary Content-Type)

| Property | Type | Required | Description |
|-----------|-----|------|------|
| `body` | `string` or `storage` | Required | Response body |
| `Content-Type` | `string` | Optional | MIME type. Specified in the output data or in the routing's responseHeader. If neither is present, defaults to `application/octet-stream` |

```
output <object>
  ├ body <string> or <storage>
  └ Content-Type <string>
```

### imFileDownload (File Download)

| Property | Type | Required | Description |
|-----------|-----|------|------|
| `body` | `storage` | Required | File to download |
| `Content-Type` | `string` | Optional | MIME type. Automatically determined from file extension if not specified |

```
output <object>
  ├ body <storage>
  └ Content-Type <string>
```

### imInlineFile (Return File Inline)

| Property | Type | Required | Description |
|-----------|-----|------|------|
| `body` | `storage` | Required | File to display inline |
| `Content-Type` | `string` | Optional | MIME type. Automatically determined from file extension if not specified |

```
output <object>
  ├ body <storage>
  └ Content-Type <string>
```

### imFileBinary (Return File as Binary)

| Property | Type | Required | Description |
|-----------|-----|------|------|
| `body` | `storage` | Required | Binary data |
| `Content-Type` | `string` | Optional | MIME type. Automatically determined from file extension if not specified |

```
output <object>
  ├ body <storage>
  └ Content-Type <string>
```

## Summary

| responseType | body Type | Content-Type | Notes |
|---|---|---|---|
| `imJsonResponse` | Not required | - | Entire output is converted to JSON |
| `imTextResponse` | `string` / `storage` | - | |
| `imHtmlResponse` | `string` / `storage` | - | |
| `imXmlResponse` | `string` / `storage` | - | |
| `imJsonStringResponse` | `string` / `storage` | - | Returns the JSON string in body as-is |
| `imAnyContentTypeResponse` | `string` / `storage` | Optional | Defaults to `application/octet-stream` if not specified |
| `imFileDownload` | `storage` | Optional | Automatically determined from file extension if not specified |
| `imInlineFile` | `storage` | Optional | Automatically determined from file extension if not specified |
| `imFileBinary` | `storage` | Optional | Automatically determined from file extension if not specified |
