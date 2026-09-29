---
paths:
  - "src/main/jssp/src/**/*.js"
---

# Dynamic Field Reference

A reference document summarizing Dynamic field types (`Fields.*`) for IM-ContentsSearch and data type conversion patterns from SSJS.

---

## Fields Type List

| `Fields` Type | Solr Suffix | Java Input Type | Multi-value | Usage |
|--------------|----------------|------------|------|------|
| `STRING` | `*_string` | `String` | | String for exact-match search |
| `INT` | `*_integer` | `java.lang.Integer` | | Integer value (range search supported) |
| `LONG` | `*_long` | `java.lang.Long` | | Long integer value (range search supported) |
| `DATE` | `*_date` | `java.util.Date` | | Date-time value (range search supported) |
| `BOOLEAN` | `*_boolean` | `java.lang.Boolean` | | Boolean value |
| `NGRAM` | `*_ngram` | `String` | | N-gram full-text search (CJK bigram) |
| `MORPH` | `*_morph` | `String` | | Full-text search with morphological analysis |
| `WHITESPACE` | `*_ws` | `String` | | Whitespace-delimited token search |
| `STRING_MLT` | `*_string_mlt` | `String` | ○ | Exact-match, multi-value |
| `INT_MLT` | `*_integer_mlt` | `java.lang.Integer` | ○ | Integer, multi-value |
| `LONG_MLT` | `*_long_mlt` | `java.lang.Long` | ○ | Long integer, multi-value |
| `DATE_MLT` | `*_date_mlt` | `java.util.Date` | ○ | Date-time, multi-value |
| `BOOLEAN_MLT` | `*_boolean_mlt` | `java.lang.Boolean` | ○ | Boolean, multi-value |
| `NGRAM_MLT` | `*_ngram_mlt` | `String` | ○ | N-gram full-text search, multi-value |
| `MORPH_MLT` | `*_morph_mlt` | `String` | ○ | Morphological analysis, multi-value |
| `WHITESPACE_MLT` | `*_ws_mlt` | `String` | ○ | Whitespace-delimited, multi-value |

> **Field name example**: `Fields.STRING.toField("category")` → Solr field name is `category_string`

---

## Setting Single-Value Fields (StandardInputContent.setValue)

### STRING

```javascript
// Pass JS strings as-is. Recommended to skip if null or empty
if (row.category) {
  content.setValue(Fields.STRING.toField('category'), row.category);
}
```

### INT

```javascript
// Integer.valueOf() / Long.valueOf() cannot be used because Rhino converts the return value back to a JS Number
// Use the new constructor instead
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
// The input type for DATE fields is java.util.Date
// For java.sql.Timestamp values, get the long via getTime() and convert to java.util.Date
if (row.release_date) {
  content.setValue(Fields.DATE.toField('release_date'),
    new java.util.Date(row.release_date.getTime()));
}
```

### BOOLEAN

```javascript
// Convert from a SMALLINT value of 0/1 (check null strictly since 0 is a valid value)
if (row.is_active !== null && row.is_active !== undefined) {
  content.setValue(Fields.BOOLEAN.toField('is_active'),
    new java.lang.Boolean(parseInt(String(row.is_active), 10) !== 0));
}

// To convert from a true/false string
// new java.lang.Boolean(row.flag === 'true')
```

### NGRAM / MORPH / WHITESPACE

```javascript
// Input type is String. Skip if null or empty
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

**Differences in Text Search:**

| Type | Analysis Method | Suitable Use Cases |
|------|---------|--------------|
| `NGRAM` | CJK bigram (2-character N-gram) | Partial match, Japanese short text |
| `MORPH` | Morphological analysis | Japanese natural language text |
| `WHITESPACE` | Whitespace-delimited tokenization | Tags, codes, keyword sequences |

---

## Setting Multi-Value Fields (StandardInputContent.addValue)

For multi-value fields, use `addValue` instead of `setValue`, and call it **once for each value**.

### STRING_MLT / NGRAM_MLT / MORPH_MLT / WHITESPACE_MLT

```javascript
/**
 * Parses a JSON array (e.g., '["AAA","BBB","CCC"]') and adds each value to a multi-value field.
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

// Usage example
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
 * Parses a date-time string through multiple formats sequentially and returns a java.util.Date.
 * Returns null if all formats fail.
 *
 * Supported formats (in priority order):
 *   1. yyyy-MM-dd HH:mm:ss        SQL style
 *   2. yyyy-MM-dd'T'HH:mm:ssX    ISO 8601 with timezone (+09:00 / Z, etc.)
 *   3. yyyy-MM-dd'T'HH:mm:ss     ISO 8601 local
 *   4. yyyy-MM-dd                Date only (time is treated as 00:00:00)
 *   5. yyyy/MM/dd HH:mm:ss       Slash-separated
 *   6. yyyy/MM/dd                Slash-separated date only
 *
 * @param {String} dateStr - Date-time string to parse
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
      // Try the next format
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
      logger.warn('[addMultiDateValues] Failed to parse the date in any supported format. value={}', [val]);
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

## Referencing Dynamic Fields in Templates

### The `request` Object for `init(request)`

The `request` argument passed to the template's `init(request)` has only the following 3 types of properties.

**Standard fields (always present):**

| Property | Type | Description |
|----------|----|------|
| `request.id` | String | Contents ID |
| `request.id_original` | String | Primary key of the source data (set via `setOriginalId()`) |
| `request.title` | String | Title (set via `setTitle()`) |
| `request.url` | String | Detail page URL (set via `setUrl()`) |
| `request.type` | String | Contents TYPE |
| `request.record_date` | Date | Last updated (set via `setRecordDate()`) |

> The `text` field set by `addText()` and the `attachment` field set by `addAttachment()` are **not included in the request object**.

**iAP-generated fields (always present):**

| Property | Type | Description |
|----------|----|------|
| `request.typeBreadcrumbs` | String | TYPE hierarchy breadcrumb (generated by iAP) |
| `request.snippets` | Array\<String\> | Highlighted snippets (generated by iAP) |

**Dynamic fields (only those declared in `<require-dynamic-fields>` are present):**

Property names match the key name passed to `Fields.*.toField("{key_name}")`. Fields that are not declared will not be present in `request` and cannot be referenced from the template.

```xml
<require-dynamic-fields>
  <field type="string">category</field>
  <field type="int">price</field>
</require-dynamic-fields>
```

With the above configuration, the following properties are included in the request object.

| XML `type` Attribute | Field Key Example | Actual Solr Field Name | request Property Name | Type in Rhino |
|----------------|-----------------|-------------------|------------------|-------------|
| `string` | `category` | `category_string` | `request.category` | String |
| `int` | `price` | `price_integer` | `request.price` | Number |

> **Note**: The value of the `type` attribute is not the Solr field type suffix; specify one of the following (16 types in total):
> `string` / `string_mlt` / `int` / `int_mlt` / `long` / `long_mlt` / `date` / `date_mlt` /
> `boolean` / `boolean_mlt` / `ngram` / `ngram_mlt` / `morph` / `morph_mlt` / `whitespace` / `whitespace_mlt`
