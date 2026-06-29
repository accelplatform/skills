# Format API 参考手册

## 概述

Format 是一个执行字符串转换的静态对象。
提供数值、日期、字符串的格式转换API。

## 方法列表

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `get(format, arg, ...)` | String | 根据format指定将参数值转换为字符串 |
| `fromNumber(format, value)` | String | 按照格式指定将数值转换为字符串 |
| `toMoney(value)` | String | 生成每3位带逗号分隔的数字字符串 |

## get(format, arg, ...)

根据format指定将参数值转换为字符串的通用方法。
arg最多可以指定16个。

### 格式指定字符

| 指定字符 | 说明 | 示例 |
|----------|------|-----|
| `%s` | 字符串转换 | `%3s` 表示3字节 |
| `%n` | n进制转换 | `%4n` 表示4进制 |
| `%d` | 10进制转换 | `%8.3d` 表示整数8位、小数3位 |
| `%x` | 16进制转换 | `%4x` 表示4位0补充 |
| `%b` | 2进制转换 | `%8b` 表示8位0补充 |
| `%m` | 每3位逗号分隔 | |
| `%t` | 日期转换 | |
| `%%` | 显示"%"字符 | |

### 使用示例

```javascript
// 字符串转换
let result = Format.get('名前は「%4s」です。', 'intra-mart');

// 10进制转换（整数7位、小数3位）
let result = Format.get('金额：%7.3d 元', 1234567.89123);

// 16进制转换
let result = Format.get('16进制：%3x', 55);

// 2进制转换
let result = Format.get('2进制：%4b', 12);

// 每3位逗号分隔
let result = Format.get('合计：%m 元', 333444555666);

// 显示%字符
let result = Format.get('达成率：100%%');
```

## fromNumber(format, value)

按照格式指定将数值转换为字符串。

### 格式字符

| 字符 | 说明 |
|------|------|
| `0` | 数字显示（补零） |
| `#` | 数字显示（零不显示） |
| `.` | 小数点位置 |
| `,` | 分组分隔符位置 |

### 使用示例

```javascript
// 逗号分隔
let result = Format.fromNumber('#,##0', 1234567);
// → "1,234,567"

// 小数点2位
let result = Format.fromNumber('#,##0.00', 1234.5);
// → "1,234.50"
```

## toMoney(value)

生成每3位带逗号分隔的数字字符串。小数部分最多显示2位。

```javascript
let result = Format.toMoney(1234567);
// → "1,234,567"
```