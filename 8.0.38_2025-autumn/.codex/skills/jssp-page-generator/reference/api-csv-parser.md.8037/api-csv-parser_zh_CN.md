# CSVParser API 参考手册

## 概述

CSVParser 是一个从CSV格式字符串创建二维数组的对象。
仅由静态方法构成，可以不实例化直接使用。

## 方法列表

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| parse(csvtext, delimita) | Array | 解析CSV格式字符串，转换为二维数组 |

## 方法详情

### parse(csvtext, delimita)

解析CSV格式字符串，并转换为二维数组数据。

| 参数 | 类型 | 说明 |
|-----------|------|------|
| csvtext | String | CSV格式字符串 |
| delimita | String | 分隔符（指定1个字符，如 `,`、`\t`、` ` 等） |

**返回值**: Array - 字符串的二维数组数据

## 使用示例

### 解析逗号分隔的CSV

```javascript
let csv = 'name,age,email\nTanaka,30,tanaka@example.com\nSuzuki,25,suzuki@example.com';
let result = CSVParser.parse(csv, ',');
// result[0] => ["name", "age", "email"]
// result[1] => ["Tanaka", "30", "tanaka@example.com"]
// result[2] => ["Suzuki", "25", "suzuki@example.com"]
```

### 解析制表符分隔的TSV

```javascript
let tsv = 'col1\tcol2\tcol3\nval1\tval2\tval3';
let result = CSVParser.parse(tsv, '\t');
```