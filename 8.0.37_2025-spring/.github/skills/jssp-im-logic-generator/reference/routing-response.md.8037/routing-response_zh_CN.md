# 路由响应配置

根据逻辑流路由的 `responseType`，需要在流的 `outputDataDefinition` 中定义的属性有所不同。

参考：https://document.intra-mart.jp/library/iap/public/im_logic/im_logic_specification/texts/function_specification/routing/index.html#routing-response

## responseType 列表与输出数据要求

### imJsonResponse（转换为 JSON 返回）

将流的整个输出数据转换为 JSON 格式并返回。
不需要 `body` 属性。输出定义中包含的所有属性将直接转换为 JSON。

```
output <object>
  └ (任意属性)
```

### imTextResponse（以文本形式返回）

| 属性 | 类型 | 必填 | 说明 |
|-----------|-----|------|------|
| `body` | `string` 或 `storage` | 必填 | 响应正文 |

```
output <object>
  └ body <string>
```

### imHtmlResponse（以 HTML 形式返回）

| 属性 | 类型 | 必填 | 说明 |
|-----------|-----|------|------|
| `body` | `string` 或 `storage` | 必填 | HTML 内容 |

```
output <object>
  └ body <string>
```

### imXmlResponse（以 XML 形式返回）

| 属性 | 类型 | 必填 | 说明 |
|-----------|-----|------|------|
| `body` | `string` 或 `storage` | 必填 | XML 内容 |

```
output <object>
  └ body <string>
```

### imJsonStringResponse（以 JSON 形式返回）

| 属性 | 类型 | 必填 | 说明 |
|-----------|-----|------|------|
| `body` | `string` 或 `storage` | 必填 | JSON 字符串 |

与 `imJsonResponse` 的区别：`imJsonResponse` 会自动将整个输出数据转换为 JSON，而 `imJsonStringResponse` 会原样返回存储在 `body` 中的 JSON 字符串。

```
output <object>
  └ body <string>
```

### imAnyContentTypeResponse（以任意 Content-Type 返回）

| 属性 | 类型 | 必填 | 说明 |
|-----------|-----|------|------|
| `body` | `string` 或 `storage` | 必填 | 响应正文 |
| `Content-Type` | `string` | 可选 | MIME 类型。在输出数据或路由的 responseHeader 中指定。两者都未指定时默认为 `application/octet-stream` |

```
output <object>
  ├ body <string> or <storage>
  └ Content-Type <string>
```

### imFileDownload（文件下载）

| 属性 | 类型 | 必填 | 说明 |
|-----------|-----|------|------|
| `body` | `storage` | 必填 | 要下载的文件 |
| `Content-Type` | `string` | 可选 | MIME 类型。未指定时根据文件扩展名自动判断 |

```
output <object>
  ├ body <storage>
  └ Content-Type <string>
```

### imInlineFile（以内联方式返回文件）

| 属性 | 类型 | 必填 | 说明 |
|-----------|-----|------|------|
| `body` | `storage` | 必填 | 要内联显示的文件 |
| `Content-Type` | `string` | 可选 | MIME 类型。未指定时根据文件扩展名自动判断 |

```
output <object>
  ├ body <storage>
  └ Content-Type <string>
```

### imFileBinary（以二进制方式返回文件）

| 属性 | 类型 | 必填 | 说明 |
|-----------|-----|------|------|
| `body` | `storage` | 必填 | 二进制数据 |
| `Content-Type` | `string` | 可选 | MIME 类型。未指定时根据文件扩展名自动判断 |

```
output <object>
  ├ body <storage>
  └ Content-Type <string>
```

## 汇总

| responseType | body 类型 | Content-Type | 备注 |
|---|---|---|---|
| `imJsonResponse` | 不需要 | - | 整个输出转换为 JSON |
| `imTextResponse` | `string` / `storage` | - | |
| `imHtmlResponse` | `string` / `storage` | - | |
| `imXmlResponse` | `string` / `storage` | - | |
| `imJsonStringResponse` | `string` / `storage` | - | 原样返回 body 中的 JSON 字符串 |
| `imAnyContentTypeResponse` | `string` / `storage` | 可选 | 未指定时默认为 `application/octet-stream` |
| `imFileDownload` | `storage` | 可选 | 未指定时根据文件扩展名自动判断 |
| `imInlineFile` | `storage` | 可选 | 未指定时根据文件扩展名自动判断 |
| `imFileBinary` | `storage` | 可选 | 未指定时根据文件扩展名自动判断 |
