# IMART message 标签参考

## 概述

`<imart type="message">` 是一种将消息 ID 指定的字符串插入到标签所在位置的标签。
它根据登录用户的区域设置，以多语言形式显示消息属性文件中定义的消息。

## 属性列表

### 必须属性

| 属性 | 类型 | 说明 |
|------|------|------|
| id | String | 消息 ID。指定属性文件中的键。 |

### 可选属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| args | Array/String | - | 消息内占位符（`{0}`、`{1}`、...）的替换参数 |
| locale | String | 登录用户的区域设置 | 明确指定要获取消息的区域设置 |
| escapeXml | Boolean | 遵循页面设置 | XML 转义。将 `&<>"'` 转换为实体引用 |
| escapeJs | Boolean | 遵循页面设置 | JavaScript 转义。转换控制字符 |
| nl2br | Boolean | false | 将换行符转换为 `<br>` 标签 |

## 使用示例

### HTML 内的多语言显示（含 XSS 防护）

```html
<h1><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE" escapeXml="true" escapeJs="false" /></h1>
```

### 在 JavaScript 内嵌入消息

```html
<script>
  imuiShowErrorMessage('<imart type="message" id="MSG.E.APP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR" escapeXml="false" escapeJs="true" />');
</script>
```

### 在 HTML 属性内嵌入

```html
<span class="imds-required-label-required" data-required-label="<imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.REQUIRED" escapeXml="true" escapeJs="false" />">
```

### 带占位符的消息

属性文件：
```properties
MSG.E.APP.SKILLS.SIMPLE.FORM.OVER.MAX.LENGTH={0}\u306f\u6700\u5927{1}\u6587\u5b57\u3067\u3059\u3002
```

HTML：
```html
<imart type="message" id="MSG.E.APP.SKILLS.SIMPLE.FORM.OVER.MAX.LENGTH" args=$msgArgs escapeXml="true" escapeJs="false" />
```

### 指定区域设置

```html
<imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE" locale="en" escapeXml="true" escapeJs="false" />
```

## 转义使用说明

| 上下文 | escapeXml | escapeJs | 原因 |
|--------|-----------|----------|------|
| HTML 文本 | `true` | `false` | XSS 防护 |
| JavaScript 字符串 | `false` | `true` | 转义 JS 字符串字面量内的特殊字符 |
| HTML 属性值 | `true` | `false` | 属性值的 XSS 防护 |

## 注意事项

- 不包含子标签（自闭合标签）。
- 在 HTML 中显示时，请设置 `escapeXml="true"`（XSS 防护）。
- 嵌入 JavaScript 中时，请设置 `escapeJs="true"`。
- 在函数容器（服务器端 JS）中，请使用 `MessageManager.getMessage()` API（此标签不可用）。
