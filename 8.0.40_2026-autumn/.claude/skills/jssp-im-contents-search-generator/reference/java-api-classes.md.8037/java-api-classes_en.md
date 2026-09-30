---
paths:
  - "src/main/jssp/src/**/*.js"
---

# IM-ContentsSearch Java API Reference (for SSJS)

A reference document summarizing fully qualified class names, key methods, and SSJS-specific constraints for Java classes used from SSJS (Rhino) via the `Packages.***` syntax.

---

## Java Class List

| Class Name (abbreviated) | Fully Qualified Class Name |
|----------------|----------------|
| `ContentsSearchManager` | `jp.co.intra_mart.foundation.contentssearch.ContentsSearchManager` |
| `StandardInputContent` | `jp.co.intra_mart.foundation.contentssearch.model.content.StandardInputContent` |
| `Fields` | `jp.co.intra_mart.foundation.contentssearch.model.field.Fields` |
| `Condition` | `jp.co.intra_mart.foundation.contentssearch.model.query.Condition` |
| `LastCrawlingDateHolder` | `jp.co.intra_mart.foundation.contentssearch.indexing.util.LastCrawlingDateHolder` |
| `PublicStorage` | `jp.co.intra_mart.foundation.service.client.file.PublicStorage` |
| `PublicStorageAttachment` | `jp.co.intra_mart.foundation.contentssearch.model.attachment.PublicStorageAttachment` |
| `FileAttachment` | `jp.co.intra_mart.foundation.contentssearch.model.attachment.FileAttachment` |
| `StandardUpdateService` | `jp.co.intra_mart.foundation.contentssearch.service.StandardUpdateService` |
| `EveryoneACIBuilder` | `jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.EveryoneACIBuilder` |
| `StandardRoleACIBuilder` | `jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardRoleACIBuilder` |

---

## Key Methods by Class

### ContentsSearchManager

The central class for registering, deleting, and searching Contents. Create instances in local scope.

```javascript
let ContentsSearchManager = Packages.jp.co.intra_mart.foundation.contentssearch.ContentsSearchManager;

// Instantiate as a local variable (do not new in global scope)
// Specify the search server group name (groupName)
let manager = new ContentsSearchManager(groupName);
```

The search server group name is specified by the Job parameter `groupName` (defaults to `'default'`). The iAP default setting uses `'default'`, but environments with a custom Solr connection setting may use a different value.

| Method | Arguments | Description |
|---------|------|------|
| `add(InputContent)` | `StandardInputContent` | Adds Contents to the index (overwrites if the same ID exists) |
| `delete(Searchable)` | `Condition` | Deletes Contents matching the condition |
| `deleteAll()` | None | Deletes all registered Contents |
| `deleteByType(String)` | TYPE value | Deletes all Contents of the specified TYPE |
| `commit()` | None | Commits to Solr (call after processing) |

---

### StandardInputContent

A class representing Contents to be registered in Solr.

```javascript
let StandardInputContent = Packages.jp.co.intra_mart.foundation.contentssearch.model.content.StandardInputContent;

let content = new StandardInputContent();
```

| Method | Arguments | Description |
|---------|------|------|
| `setId(String)` | Contents ID | A system-wide unique ID (e.g., `"feature_name_" + code`) |
| `setTypes(String[])` | Array of TYPE values | Pass as a JS array (varargs compatible) |
| `addType(String...)` | TYPE value (variadic) | Add a TYPE (varargs → pass as a JS array) |
| `setUrl(String)` | Relative URL | Link to the detail page (when a search result is clicked) |
| `setOriginalId(String)` | Source data primary key | Source data identifier (accessible as `id_original`) |
| `setTitle(String)` | Title | Title for search indexing and display |
| `addText(String[])` | Text array | Add full-text search target text (varargs → pass as a JS array) |
| `setRecordDate(java.util.Date)` | Last updated | Used in date range search on the standard search screen |
| `setValue(BasicField, value)` | Field, value | Sets a single-value Dynamic field |
| `addValue(BasicField, value)` | Field, value | Adds a value to a multi-value field (call per element) |
| `addAttachment(Attachment[])` | Attachment array | Adds attachments (varargs → pass as a JS array) |
| `addACIBuilder(ACIBuilder[])` | Access control builder array | Access control settings (varargs → pass as a JS array) |

---

### Fields (Dynamic field types)

An enum class that generates Dynamic field keys. Obtain a `DynamicField` using `Fields.STRING.toField("key")`.

```javascript
let Fields = Packages.jp.co.intra_mart.foundation.contentssearch.model.field.Fields;

// Example: setting a single-value field
content.setValue(Fields.STRING.toField('category'), row.category);
content.setValue(Fields.INT.toField('price'), new java.lang.Integer(row.price));

// Example: setting a multi-value field (call addValue per element)
content.addValue(Fields.STRING_MLT.toField('tags'), tagValue);
```

For details, see `reference/dynamic-fields.md`.

---

### Condition (Search conditions)

Used in both Crawler deletion and template search processing. Create condition objects via static factory methods.

```javascript
let Condition = Packages.jp.co.intra_mart.foundation.contentssearch.model.query.Condition;
let Fields    = Packages.jp.co.intra_mart.foundation.contentssearch.model.field.Fields;
```

| Method | Arguments | Usage |
|---------|------|------|
| `Condition.all()` | None | Target all Contents |
| `Condition.type(String...)` | TYPE value (variadic) | Filter by TYPE → pass as a JS array |
| `Condition.term(BasicField, value)` | Field + value | Exact match |
| `Condition.keyword(String...)` | Keywords | Full-text search (AND combined) |
| `Condition.exists(BasicField)` | Field | Field has a value |
| `Condition.range(BasicField, start, end, inclusive)` | Field + range + boundary flag | Range search |
| `Condition.and(Searchable...)` | Conditions (variadic) | AND combination → pass as a JS array |
| `Condition.or(Searchable...)` | Conditions (variadic) | OR combination → pass as a JS array |

> **Note**: `Condition.id()` **does not exist**. Use `Condition.term(Fields.ID, id)` to filter by ID.

#### Basic: TYPE + Keyword (method chaining)

The return value of factory methods provides additional methods for adding conditions. This is the pattern recommended by the guide.

```javascript
// Filter by TYPE and contains "search keyword"
let cond = Condition.type(['my_feature']).keyword(['search keyword']);

// Filter by TYPE, contains keywords, and specified field has a value
let cond = Condition.type(['my_feature'])
                    .keyword(['search keyword'])
                    .exists(Fields.STRING.toField('category'));
```

#### Field Exact Match

```javascript
// Exact match on Standard field (ID)
let cond = Condition.term(Fields.ID, 'my_feature_001');

// Exact match on Dynamic field (STRING)
let cond = Condition.term(Fields.STRING.toField('category'), 'electronics');
```

#### Range Search

The types of `start` / `end` in `range()` must match the generic type of the Dynamic field. Pass `java.lang.Integer` / `java.lang.Long` for INT / LONG fields (passing as JS Number will cause a type mismatch).

```javascript
// INT field range (inclusive on both ends)
let cond = Condition.range(
  Fields.INT.toField('price'),
  new java.lang.Integer(1000),
  new java.lang.Integer(5000),
  true
);

// DATE field range
let cond = Condition.range(
  Fields.DATE.toField('release_date'),
  new java.util.Date(startDate.getTime()),
  new java.util.Date(endDate.getTime()),
  true
);
```

#### AND / OR Combination

When combining multiple conditions, pass them as a JS array to `Condition.and()` / `Condition.or()`.

```javascript
// AND: TYPE filter + price range
let cond = Condition.and([
  Condition.type(['my_feature']),
  Condition.range(Fields.INT.toField('price'),
    new java.lang.Integer(1000), new java.lang.Integer(5000), true)
]);

// OR: Category A or Category B
let cond = Condition.or([
  Condition.term(Fields.STRING.toField('category'), 'electronics'),
  Condition.term(Fields.STRING.toField('category'), 'kitchen')
]);

// Nesting AND and OR
let cond = Condition.and([
  Condition.type(['my_feature']),
  Condition.or([
    Condition.term(Fields.STRING.toField('category'), 'electronics'),
    Condition.term(Fields.STRING.toField('category'), 'kitchen')
  ])
]);
```

#### Usage Example in Crawlers (Deletion)

```javascript
// Delete by ID
manager.delete(Condition.term(Fields.ID, id));

// Delete all by TYPE (equivalent to deleteByType)
manager.delete(Condition.type(['my_feature']));
```

---

### LastCrawlingDateHolder

A class for managing the last execution date-time in Differential Crawling.

```javascript
let LastCrawlingDateHolder = Packages.jp.co.intra_mart.foundation.contentssearch.indexing.util.LastCrawlingDateHolder;

// Get and update the last execution date-time
let holder = LastCrawlingDateHolder.getHolder(CONTENT_TYPE);
let lastDate = holder.getLastCrawlingDate();       // Returns java.util.Date
holder.updateLastCrawlingDate(new java.util.Date()); // Update with the current date-time
```

| Method | Description |
|---------|------|
| `LastCrawlingDateHolder.getHolder(String type)` | Gets the holder for the specified TYPE (static) |
| `holder.getLastCrawlingDate()` | Gets the last Crawling date-time (`java.util.Date`) |
| `holder.updateLastCrawlingDate(java.util.Date)` | Updates the last Crawling date-time |

> **Note**: `LastCrawlingDateHolder` has no method to clear the date-time. To reset after Remove Crawling, set a past date-time using `updateLastCrawlingDate(new java.util.Date(0))`.

---

### PublicStorage / PublicStorageAttachment

Used when attaching files from iAP's public storage.

```javascript
let PublicStorage           = Packages.jp.co.intra_mart.foundation.service.client.file.PublicStorage;
let PublicStorageAttachment = Packages.jp.co.intra_mart.foundation.contentssearch.model.attachment.PublicStorageAttachment;

function setAttachment(content, filePath, logger) {
  let storage = new PublicStorage(filePath); // Creates a Java instance (not the SSJS PublicStorage object)
  try {
    if (storage.isFile()) {
      content.addAttachment([new PublicStorageAttachment(storage)]);
    }
  } catch (e) {
    logger.warn('[setAttachment] Failed. path={} message={}', [filePath, e.message]);
  }
}
```

---

### FileAttachment

Used when attaching a `java.io.File` from the file system. Handles cases that do not go through PublicStorage, such as when DB binary data is written to a temporary file.

**Constructors:**

| Constructor | Description |
|-------------|------|
| `FileAttachment(java.io.File)` | Initialize with a file. Uses the file name as the display name |
| `FileAttachment(java.io.File, String displayName)` | Initialize with a file and display name. Uses the file name if `displayName` is `null` |

> **Important — The file name specified in `displayName` must have an appropriate extension.**
> IM-ContentsSearch determines the file type by extension and performs text extraction (using the iAP's proprietary text extractor). Assigning an incorrect extension may cause text extraction to fail (e.g., assigning a `.txt` extension to an Excel file).

> **Temporary file lifecycle**:
> The attached file is read when `ContentsSearchManager.add()` is called. Therefore, do not delete the temporary file when `StandardInputContent.addAttachment()` is called.
> If a temporary file is created, delete it after calling `ContentsSearchManager.add()`.

**When attaching DB binary (BYTEA/BLOB) via a temporary file:**

`TenantDatabase.executeByTemplate()` does not return BLOB/BYTEA column values (they become `null`). Use `TenantDatabase.getByteReader()` to retrieve binary data, and read it in chunks using `eachBytes()` within the callback.

```javascript
/**
 * Writes DB binary data to a temporary file and returns it.
 *
 * @param {String} tableName       - Table name
 * @param {String} columnName      - Binary column name
 * @param {String} condition       - WHERE clause (e.g., 'code = ?')
 * @param {Array}  params          - Bind parameters (e.g., [DbParameter.string(code)])
 * @param {String} extension       - File extension
 * @param {Object} logger          - Logger instance
 * @return {File|null} Temporary file. Returns null if not registered.
 */
function readTenantDatabaseBinary(tableName, columnName, condition, params, extension, logger) {
  let tempFile = null;
  let db = new TenantDatabase();

  db.getByteReader(tableName, columnName, condition, params, function(result) {
    if (result.error || !result.data || result.countRow === 0) {
      return;
    }

    let baos = new java.io.ByteArrayOutputStream();
    try {
      result.data.eachBytes(function(elements, index, size) {
        baos.write(elements, 0, size);
      }, 1024 * 512);

      let allBytes = baos.toByteArray();
      if (allBytes.length === 0) {
        return;
      }

      tempFile = java.io.File.createTempFile('temp_', extension);
      let fos = new java.io.FileOutputStream(tempFile);
      try {
        fos.write(allBytes);
        fos.flush();
      } catch (e) {
        if (tempFile !== null) {
          tempFile.delete();
        }
        throw e;
      } finally {
        try { fos.close(); } catch (ignored) {}
      }
    } finally {
      try { baos.close(); } catch (ignored) {}
    }
  });

  return tempFile;
}

// Usage example:
let logger = Logger.getLogger();
let tempFile = null;
try {
  tempFile = readTenantDatabaseBinary('{table_name}', '{binary_column_name}', '{condition (e.g., id = ?)}', [DbParameter.string('SAMPLE_ID')], 'pdf', logger);
  content.addAttachment([new FileAttachment(tempFile)]);

  manager.add(content);
} finally {
  if (tempFile !== null) {
    try { tempFile.delete(); } catch (ignored) {}
  }
}
```


---

### StandardUpdateService

A class for executing Solr index optimization. Since `ContentsSearchManager` does not expose `optimize()`, use `StandardUpdateService` directly when optimization is needed.

```javascript
let StandardUpdateService = Packages.jp.co.intra_mart.foundation.contentssearch.service.StandardUpdateService;
```

**Constructors:**

| Constructor | Description |
|-------------|------|
| `StandardUpdateService(String groupName)` | Initialize with the search server group name |

Pass the same `groupName` as used for `ContentsSearchManager`.

**Key methods:**

| Method | Arguments | Description |
|---------|------|------|
| `optimize()` | None | Optimizes the index (default behavior) |
| `optimize(int maxSegments)` | Number of segments (≥ 1) | Optimizes with a specified number of segments |

> **When to optimize**: Optimization is resource-intensive and should not be performed frequently. Perform it after registering a large amount of Contents, such as after Crawling is complete.

```javascript
function executeOptimize(groupName, maxSegments, logger) {
  let updateService = new StandardUpdateService(groupName);
  if (maxSegments > 1) {
    updateService.optimize(maxSegments);
  } else {
    updateService.optimize();
  }
}
```

---

### Access Control Builders

Nine types of ACIBuilders are available, including user, Role, department, and company. For details, see `reference/aci-builders.md`.

```javascript
let EveryoneACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.EveryoneACIBuilder;
let StandardRoleACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardRoleACIBuilder;

// All users (authenticated)
content.addACIBuilder([new EveryoneACIBuilder()]);

// Restricted to Role (specify Role code as argument)
content.addACIBuilder([new StandardRoleACIBuilder('role_code')]);
```

---

## SSJS (Rhino) Constraints and Workarounds

### Calling varargs Methods

In Rhino 1.7R4, passing a single value to a Java varargs parameter may not resolve correctly. **Wrap the value in a JavaScript array before passing.**

```javascript
// OK: Pass as a JS array
content.setTypes(['type_a', 'type_b']);
content.addText([row.description]);
content.addAttachment([new PublicStorageAttachment(storage)]);
content.addACIBuilder([new EveryoneACIBuilder()]);

// NG: Pass a single value directly (may not resolve correctly)
// content.addText(row.description);
```

### Numeric Type Conversion

Rhino converts Java numeric types (`int`, `long`, etc.) to JS Number types. In Rhino, JS Number is internally treated as `java.lang.Double`. In generic methods such as `setValue(Fields.INT.toField(...), value)`, the type parameter resolves as `java.lang.Integer`, so Java cannot automatically convert `java.lang.Double` to `java.lang.Integer`, causing a type mismatch error. **Use the constructor** to explicitly create a Java numeric type before passing.

```javascript
// OK: Create with constructor
new java.lang.Integer(row.price)
new java.lang.Long(row.amount)

// NG: Pass JS Number directly (treated as java.lang.Double by Rhino, causing a type mismatch with java.lang.Integer)
// content.setValue(Fields.INT.toField('price'), row.price)
```

### Date Type Conversion

TIMESTAMP columns retrieved from a DB are of type `java.sql.Timestamp`. Since `setValue(DATE field)` requires `java.util.Date`, convert using `getTime()`.

```javascript
// OK
new java.util.Date(row.record_date.getTime())

// NG: Pass java.sql.Timestamp directly
// row.record_date
```

### BOOLEAN Type Conversion

Handling of DB BOOLEAN/SMALLINT columns varies by DB product (0/1 integer, `true`/`false` string, etc.).

```javascript
// Convert from an integer value of 0/1 (for SMALLINT)
new java.lang.Boolean(parseInt(String(row.is_active), 10) !== 0)

// Convert from a true/false string
new java.lang.Boolean(row.flag === 'true')
```

### Iterating over Java Lists

`java.util.List` returned by `getResultContentList()` etc. cannot be iterated with `for...in`.

```javascript
// OK: Iterate with size() / get(i)
let list = response.getResultContentList();
for (let i = 0; i < list.size(); i++) {
  let item = list.get(i);
}

// NG
// for (let item in list) { ... }
```
