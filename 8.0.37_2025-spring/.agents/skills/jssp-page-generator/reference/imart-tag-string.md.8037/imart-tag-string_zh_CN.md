# IMART string 标签参考

## 概述

`<imart type="string">` 是在指定位置将指定数据作为字符串插入的标签。
标签部分被指定字符串替换。

## 属性列表

### 必填属性

| 属性 | 类型 | 说明 |
|------|------|------|
| value | String | 要插入的数据。转义处理对象属性 |

### 可选属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| escapeXml | Boolean | 遵循页面设置 | XML转义。将 `&<>"'` 转换为实体引用 |
| escapeJs | Boolean | 遵循页面设置 | JavaScript转义。转换控制字符 |
| escapeSpace | Boolean | false | 将半角空格转换为 `&nbsp;` |
| nl2br | Boolean | false | 将换行符转换为 `<br>` 标签 |
| exclusionEscapeXml | String | - | 不作为XML转义对象的字符串 |
| exclusionEscapeJs | String | - | 不作为JavaScript转义对象的字符串 |
| delimiter4exclusionEscapeXml | String | `:` | XML转义排除字符串的分隔符 |
| delimiter4exclusionEscapeJs | String | `:` | JavaScript转义排除字符串的分隔符 |

## 转义对象字符

### XML转义（escapeXml="true"）

| 原始字符 | 转换后 |
|---------|--------|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `'` | `&#039;` |
| `"` | `&#034;` |

### JavaScript转义（escapeJs="true"）

转义 `\` `'` `"` 以及退格、换行、制表符、换页和回车。

处理顺序：XML转义 → JavaScript转义

## 使用示例

### 在 HTML 内显示字符串（含XSS防护）

```html
<span><imart type="string" value=$userName escapeXml="true" escapeJs="false"></imart></span>
```

### 在 JavaScript 内嵌入字符串

```html
<script>
(function($data) {
  console.log($data);
})(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
</script>
```

### 将换行转换为br标签显示

```html
<p><imart type="string" value=$comment escapeXml="true" escapeJs="false" nl2br="true"></imart></p>
```

## 注意事项

- 作为XSS防护，在HTML内显示时必须设置 `escapeXml="true"`
- 在JavaScript内嵌入JSON字符串时，两者都设为 `false`，从函数容器侧传递已转义的值
- 使用 `exclusionEscapeXml` / `exclusionEscapeJs` 时要注意安全风险增加
