---
paths:
  - "src/main/jssp/src/**/*.js"
---

# 动态字段参考资料

汇总了 IM-ContentsSearch 的动态字段类型（`Fields.*`）以及从 SSJS 进行类型转换模式的参考资料。

---

## Fields 类型一览

| `Fields` 类型 | Solr 后缀 | Java 输入类型 | 多值 | 用途 |
|--------------|----------------|------------|------|------|
| `STRING` | `*_string` | `String` | | 用于精确匹配检索的字符串 |
| `INT` | `*_integer` | `java.lang.Integer` | | 整数值（支持范围检索） |
| `LONG` | `*_long` | `java.lang.Long` | | 长整数值（支持范围检索） |
| `DATE` | `*_date` | `java.util.Date` | | 日期时间值（支持范围检索） |
| `BOOLEAN` | `*_boolean` | `java.lang.Boolean` | | 布尔值 |
| `NGRAM` | `*_ngram` | `String` | | N-gram 全文检索（CJK bigram） |
| `MORPH` | `*_morph` | `String` | | 全文检索（形态素分析） |
| `WHITESPACE` | `*_ws` | `String` | | 空格分隔的词元检索 |
| `STRING_MLT` | `*_string_mlt` | `String` | ○ | 精确匹配、多值 |
| `INT_MLT` | `*_integer_mlt` | `java.lang.Integer` | ○ | 整数、多值 |
| `LONG_MLT` | `*_long_mlt` | `java.lang.Long` | ○ | 长整数、多值 |
| `DATE_MLT` | `*_date_mlt` | `java.util.Date` | ○ | 日期时间、多值 |
| `BOOLEAN_MLT` | `*_boolean_mlt` | `java.lang.Boolean` | ○ | 布尔值、多值 |
| `NGRAM_MLT` | `*_ngram_mlt` | `String` | ○ | N-gram 全文检索、多值 |
| `MORPH_MLT` | `*_morph_mlt` | `String` | ○ | 形态素分析、多值 |
| `WHITESPACE_MLT` | `*_ws_mlt` | `String` | ○ | 空格分隔、多值 |

> **字段名示例**：`Fields.STRING.toField("category")` → Solr 字段名为 `category_string`

---

## 设置单值字段（StandardInputContent.setValue）

### STRING

```javascript
// 直接传入 JS 字符串。建议在 null / 空值时跳过
if (row.category) {
  content.setValue(Fields.STRING.toField('category'), row.category);
}
```

### INT

```javascript
// Integer.valueOf() / Long.valueOf() 不可使用，因为 Rhino 会将返回值转回 JS Number
// 使用 new 构造函数替代
if (row.price !== null && row.price !== undefined) {
  content.setValue(Fields.INT.toField('price'),
    new java.lang.Integer(row.price));
}
```

### LONG

```javascript
if (row.stock_count !== null && row.stock_count !== undefined) {
  content.setValue(Fields.LONG.toField('stock_count'),
    new java.lang.Long(row.stock_count));
}
```

### DATE

```javascript
// DATE 字段的输入类型为 java.util.Date
// 对于 java.sql.Timestamp 类型的值，使用 getTime() 获取 long 后转换为 java.util.Date
if (row.release_date) {
  content.setValue(Fields.DATE.toField('release_date'),
    new java.util.Date(row.release_date.getTime()));
}
```

### BOOLEAN

```javascript
// 从 0/1 的 SMALLINT 值转换（0 也是有效值，因此需严格进行 null 检查）
if (row.is_active !== null && row.is_active !== undefined) {
  content.setValue(Fields.BOOLEAN.toField('is_active'),
    new java.lang.Boolean(parseInt(String(row.is_active), 10) !== 0));
}

// 从 true/false 字符串转换时
// new java.lang.Boolean(row.flag === 'true')
```

### NGRAM / MORPH / WHITESPACE

```javascript
// 输入类型为 String。在 null / 空值时跳过
if (row.summary) {
  content.setValue(Fields.NGRAM.toField('summary'), row.summary);
}
if (row.detail) {
  content.setValue(Fields.MORPH.toField('detail'), row.detail);
}
if (row.keywords) {
  content.setValue(Fields.WHITESPACE.toField('keywords'), row.keywords);
}
```

**文本检索的区别：**

| 类型 | 分析方法 | 适用场景 |
|------|---------|--------------|
| `NGRAM` | CJK bigram（2字符 N-gram） | 部分匹配、日语短文 |
| `MORPH` | 形态素分析 | 日语自然语言文本 |
| `WHITESPACE` | 空格分隔的词元化 | 标签、代码、关键词序列 |

---

## 设置多值字段（StandardInputContent.addValue）

多值字段使用 `addValue` 而非 `setValue`，**每个值逐个调用**。

### STRING_MLT / NGRAM_MLT / MORPH_MLT / WHITESPACE_MLT

```javascript
/**
 * 解析 JSON 数组格式（例：'["AAA","BBB","CCC"]'），将每个值添加到多值字段。
 */
function addMultiStringValues(content, field, jsonValue) {
  if (!jsonValue) {
    return;
  }
  let values = JSON.parse(String(jsonValue));
  for (let i = 0; i < values.length; i++) {
    if (values[i]) {
      content.addValue(field, values[i]);
    }
  }
}

// 调用示例
addMultiStringValues(content, Fields.STRING_MLT.toField('tags'), row.tags);
addMultiStringValues(content, Fields.NGRAM_MLT.toField('feature_list'), row.feature_list);
addMultiStringValues(content, Fields.MORPH_MLT.toField('note_list'), row.note_list);
addMultiStringValues(content, Fields.WHITESPACE_MLT.toField('tag_list'), row.tag_list);
```

### INT_MLT

```javascript
function addMultiIntValues(content, field, jsonValue) {
  if (!jsonValue) {
    return;
  }
  let values = JSON.parse(String(jsonValue));
  for (let i = 0; i < values.length; i++) {
    if (values[i] !== null && values[i] !== undefined) {
      content.addValue(field, new java.lang.Integer(values[i]));
    }
  }
}

addMultiIntValues(content, Fields.INT_MLT.toField('scores'), row.scores);
```

### LONG_MLT

```javascript
function addMultiLongValues(content, field, jsonValue) {
  if (!jsonValue) {
    return;
  }
  let values = JSON.parse(String(jsonValue));
  for (let i = 0; i < values.length; i++) {
    if (values[i] !== null && values[i] !== undefined) {
      content.addValue(field, new java.lang.Long(values[i]));
    }
  }
}

addMultiLongValues(content, Fields.LONG_MLT.toField('monthly_sales'), row.monthly_sales);
```

### DATE_MLT

```javascript
/**
 * 按顺序通过多种格式解析日期时间字符串，返回 java.util.Date。
 * 所有格式均失败时返回 null。
 *
 * 支持的格式（按优先顺序）：
 *   1. yyyy-MM-dd HH:mm:ss        SQL 格式
 *   2. yyyy-MM-dd'T'HH:mm:ssX    ISO 8601 含时区（+09:00 / Z 等）
 *   3. yyyy-MM-dd'T'HH:mm:ss     ISO 8601 本地时间
 *   4. yyyy-MM-dd                仅日期（时间视为 00:00:00）
 *   5. yyyy/MM/dd HH:mm:ss       斜杠分隔格式
 *   6. yyyy/MM/dd                斜杠分隔仅日期
 *
 * @param {String} dateStr - 待解析的日期时间字符串
 * @returns {java.util.Date|null}
 */
function parseDate(dateStr) {
  let formats = [
    'yyyy-MM-dd HH:mm:ss',
    "yyyy-MM-dd'T'HH:mm:ssX",
    "yyyy-MM-dd'T'HH:mm:ss",
    'yyyy-MM-dd',
    'yyyy/MM/dd HH:mm:ss',
    'yyyy/MM/dd'
  ];
  for (let i = 0; i < formats.length; i++) {
    try {
      let sdf = new java.text.SimpleDateFormat(formats[i]);
      sdf.setLenient(false);
      return new java.util.Date(sdf.parse(dateStr).getTime());
    } catch (e) {
      // 尝试下一种格式
    }
  }
  return null;
}

function addMultiDateValues(content, field, jsonValue, logger) {
  if (!jsonValue) {
    return;
  }
  let values = JSON.parse(String(jsonValue));
  for (let i = 0; i < values.length; i++) {
    let val = values[i];
    if (!val) {
      continue;
    }
    let date = parseDate(val);
    if (date !== null) {
      content.addValue(field, date);
    } else {
      logger.warn('[addMultiDateValues] 无法用任何支持的格式解析日期。value={}', [val]);
    }
  }
}

addMultiDateValues(content, Fields.DATE_MLT.toField('restock_dates'), row.restock_dates, logger);
```

### BOOLEAN_MLT

```javascript
function addMultiBooleanValues(content, field, jsonValue) {
  if (!jsonValue) {
    return;
  }
  let values = JSON.parse(String(jsonValue));
  for (let i = 0; i < values.length; i++) {
    let val = values[i];
    if (val !== null && val !== undefined) {
      content.addValue(field, new java.lang.Boolean(val === true || val === 'true'));
    }
  }
}

addMultiBooleanValues(content, Fields.BOOLEAN_MLT.toField('feature_flags'), row.feature_flags);
```

---

## 在模板中引用动态字段

### `init(request)` 的 request 对象

传递给模板 `init(request)` 的 `request` 参数仅有以下 3 类属性。

**标准字段（始终存在）：**

| 属性 | 类型 | 说明 |
|----------|----|------|
| `request.id` | String | 内容 ID |
| `request.id_original` | String | 源数据的主键（通过 `setOriginalId()` 设置） |
| `request.title` | String | 标题（通过 `setTitle()` 设置） |
| `request.url` | String | 详情页 URL（通过 `setUrl()` 设置） |
| `request.type` | String | 内容 TYPE |
| `request.record_date` | Date | 更新日期时间（通过 `setRecordDate()` 设置） |

> 通过 `addText()` 设置的 `text` 字段和通过 `addAttachment()` 设置的 `attachment` 字段**不包含在 request 对象中**。

**iAP 生成字段（始终存在）：**

| 属性 | 类型 | 说明 |
|----------|----|------|
| `request.typeBreadcrumbs` | String | TYPE 层次结构面包屑导航（由 iAP 生成） |
| `request.snippets` | Array\<String\> | 高亮摘要（由 iAP 生成） |

**动态字段（仅 `<require-dynamic-fields>` 中声明的字段存在）：**

属性名与传给 `Fields.*.toField("{键名}")` 的键名一致。未声明的字段不存在于 `request` 中，因此无法从模板中引用。

```xml
<require-dynamic-fields>
  <field type="string">category</field>
  <field type="int">price</field>
</require-dynamic-fields>
```

采用上述配置时，request 对象中将包含以下属性。

| XML `type` 属性 | 字段键示例 | Solr 实际字段名 | request 属性名 | Rhino 中的类型 |
|----------------|-----------------|-------------------|------------------|-------------|
| `string` | `category` | `category_string` | `request.category` | String |
| `int` | `price` | `price_integer` | `request.price` | Number |

> **注意**：`type` 属性的值不是 Solr 字段类型后缀，而应指定以下之一（共 16 种）：
> `string` / `string_mlt` / `int` / `int_mlt` / `long` / `long_mlt` / `date` / `date_mlt` /
> `boolean` / `boolean_mlt` / `ngram` / `ngram_mlt` / `morph` / `morph_mlt` / `whitespace` / `whitespace_mlt`
