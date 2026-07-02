# IMART hidden 标签参考

## 概述

`<imart type="hidden">` 是在提交表单时生成隐藏字段以将数据作为请求参数传递的标签。
标签的属性名成为参数名，属性值成为参数值。

## 属性列表

### 必填属性

无。使用任意属性名定义参数。

### 参数属性

| 属性 | 类型 | 说明 |
|------|------|------|
| （任意属性名） | String | 属性名成为请求参数名，属性值成为参数值。可指定多个 |

### 可选属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| escapeXml | Boolean | 遵循页面设置 | XML转义。将 `&<>"'` 转换为实体引用 |
| escapeJs | Boolean | 遵循页面设置 | JavaScript转义。转换控制字符 |

## 使用示例

### 基本用法

```html
<form>
  <imart type="hidden" arg_a="A" arg_b="B" />
</form>
```

服务器端获取：
```javascript
let a = request['arg_a'];  // "A"
let b = request['arg_b'];  // "B"
```

### 使用绑定变量的情况

```html
<imart type="hidden" userCode=$userCode mode=$mode />
```

服务器端获取：
```javascript
let userCode = request['userCode'];
let mode = request['mode'];
```

## 注意事项

- 无子标签（自闭合标签）
- 除 `escapeXml` / `escapeJs` 之外的所有属性都作为请求参数发送
- 不要直接传递高机密性数据（密码等）
