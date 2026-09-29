---
paths:
  - "src/main/jssp/src/**/*.js"
---

# IM-ContentsSearch Java API 参考资料（面向 SSJS）

汇总了从 SSJS（Rhino）通过 `Packages.***` 语法使用的 Java 类的完整限定类名、主要方法及 SSJS 特有限制的参考资料。

---

## Java 类列表

| 类名（简称） | 完整限定类名 |
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

## 各类主要方法

### ContentsSearchManager

用于注册、删除和检索内容的核心类。在局部作用域中创建实例。

```javascript
let ContentsSearchManager = Packages.jp.co.intra_mart.foundation.contentssearch.ContentsSearchManager;

// 作为局部变量实例化（不得在全局作用域中 new）
// 指定检索服务器组名（groupName）
let manager = new ContentsSearchManager(groupName);
```

检索服务器组名通过 Job 参数 `groupName` 指定（默认为 `'default'`）。iAP 的初始设置使用 `'default'`，但为 Solr 连接设定准备了自定义配置的环境可能使用不同的值。

| 方法 | 参数 | 说明 |
|---------|------|------|
| `add(InputContent)` | `StandardInputContent` | 将内容添加到索引（相同 ID 时覆盖） |
| `delete(Searchable)` | `Condition` | 删除符合条件的内容 |
| `deleteAll()` | 无 | 删除所有已注册的内容 |
| `deleteByType(String)` | TYPE 值 | 删除指定 TYPE 的所有内容 |
| `commit()` | 无 | 向 Solr 提交（处理后调用） |

---

### StandardInputContent

表示要注册到 Solr 的内容的类。

```javascript
let StandardInputContent = Packages.jp.co.intra_mart.foundation.contentssearch.model.content.StandardInputContent;

let content = new StandardInputContent();
```

| 方法 | 参数 | 说明 |
|---------|------|------|
| `setId(String)` | 内容 ID | 系统全局唯一 ID（例：`"feature_name_" + code`） |
| `setTypes(String[])` | TYPE 值数组 | 以 JS 数组传入（支持 varargs） |
| `addType(String...)` | TYPE 值（可变长） | 添加 TYPE（varargs → 以 JS 数组传入） |
| `setUrl(String)` | 相对 URL | 指向详情页的链接（点击检索结果时） |
| `setOriginalId(String)` | 源数据主键 | 源数据标识符（可作为 `id_original` 引用） |
| `setTitle(String)` | 标题 | 用于检索和显示的标题 |
| `addText(String[])` | 文本数组 | 添加全文检索对象文本（varargs → 以 JS 数组传入） |
| `setRecordDate(java.util.Date)` | 更新日期时间 | 用于标准检索画面的日期范围检索 |
| `setValue(BasicField, value)` | 字段、值 | 设置单值动态字段 |
| `addValue(BasicField, value)` | 字段、值 | 向多值字段添加值（每个元素逐个调用） |
| `addAttachment(Attachment[])` | 附件数组 | 添加附件（varargs → 以 JS 数组传入） |
| `addACIBuilder(ACIBuilder[])` | 访问控制构建器数组 | 访问控制设置（varargs → 以 JS 数组传入） |

---

### Fields（动态字段类型）

生成动态字段键的枚举类。通过 `Fields.STRING.toField("key")` 获取 `DynamicField`。

```javascript
let Fields = Packages.jp.co.intra_mart.foundation.contentssearch.model.field.Fields;

// 设置单值字段的示例
content.setValue(Fields.STRING.toField('category'), row.category);
content.setValue(Fields.INT.toField('price'), new java.lang.Integer(row.price));

// 设置多值字段的示例（每个元素调用 addValue）
content.addValue(Fields.STRING_MLT.toField('tags'), tagValue);
```

详情请参考 `reference/dynamic-fields.md`。

---

### Condition（检索条件）

在 Crawler 的删除处理和模板的检索处理中均可使用。条件对象通过静态工厂方法创建。

```javascript
let Condition = Packages.jp.co.intra_mart.foundation.contentssearch.model.query.Condition;
let Fields    = Packages.jp.co.intra_mart.foundation.contentssearch.model.field.Fields;
```

| 方法 | 参数 | 用途 |
|---------|------|------|
| `Condition.all()` | 无 | 针对所有内容 |
| `Condition.type(String...)` | TYPE 值（可变长） | 按 TYPE 筛选 → 以 JS 数组传入 |
| `Condition.term(BasicField, value)` | 字段 + 值 | 精确匹配 |
| `Condition.keyword(String...)` | 关键词 | 全文检索（AND 组合） |
| `Condition.exists(BasicField)` | 字段 | 字段存在值 |
| `Condition.range(BasicField, start, end, inclusive)` | 字段 + 范围 + 边界标志 | 范围检索 |
| `Condition.and(Searchable...)` | 条件（可变长） | AND 组合 → 以 JS 数组传入 |
| `Condition.or(Searchable...)` | 条件（可变长） | OR 组合 → 以 JS 数组传入 |

> **注意**：`Condition.id()` **不存在**。按 ID 筛选请使用 `Condition.term(Fields.ID, id)`。

#### 基本用法：TYPE + 关键词（方法链）

工厂方法的返回值提供了可继续添加条件的方法。这是指南推荐的使用模式。

```javascript
// 按 TYPE 筛选，且包含"检索词"
let cond = Condition.type(['my_feature']).keyword(['检索词']);

// 按 TYPE 筛选，且包含关键词，且指定字段存在值
let cond = Condition.type(['my_feature'])
                    .keyword(['检索词'])
                    .exists(Fields.STRING.toField('category'));
```

#### 字段精确匹配

```javascript
// 对标准字段（ID）进行精确匹配
let cond = Condition.term(Fields.ID, 'my_feature_001');

// 对动态字段（STRING）进行精确匹配
let cond = Condition.term(Fields.STRING.toField('category'), 'electronics');
```

#### 范围检索

`range()` 的 start / end 类型须与动态字段的泛型类型一致。INT / LONG 字段须传入 `java.lang.Integer` / `java.lang.Long`（直接传入 JS Number 会导致类型不匹配）。

```javascript
// INT 字段的范围（两端包含）
let cond = Condition.range(
  Fields.INT.toField('price'),
  new java.lang.Integer(1000),
  new java.lang.Integer(5000),
  true
);

// DATE 字段的范围
let cond = Condition.range(
  Fields.DATE.toField('release_date'),
  new java.util.Date(startDate.getTime()),
  new java.util.Date(endDate.getTime()),
  true
);
```

#### AND / OR 组合

组合多个条件时，以 JS 数组传入 `Condition.and()` / `Condition.or()`。

```javascript
// AND：TYPE 筛选 + 价格范围
let cond = Condition.and([
  Condition.type(['my_feature']),
  Condition.range(Fields.INT.toField('price'),
    new java.lang.Integer(1000), new java.lang.Integer(5000), true)
]);

// OR：分类 A 或 分类 B
let cond = Condition.or([
  Condition.term(Fields.STRING.toField('category'), 'electronics'),
  Condition.term(Fields.STRING.toField('category'), 'kitchen')
]);

// AND 与 OR 嵌套
let cond = Condition.and([
  Condition.type(['my_feature']),
  Condition.or([
    Condition.term(Fields.STRING.toField('category'), 'electronics'),
    Condition.term(Fields.STRING.toField('category'), 'kitchen')
  ])
]);
```

#### 在 Crawler（删除）中的使用示例

```javascript
// 按 ID 单条删除
manager.delete(Condition.term(Fields.ID, id));

// 按 TYPE 全量删除（与 deleteByType 等效）
manager.delete(Condition.type(['my_feature']));
```

---

### LastCrawlingDateHolder

管理差异爬取中最后执行日期时间的类。

```javascript
let LastCrawlingDateHolder = Packages.jp.co.intra_mart.foundation.contentssearch.indexing.util.LastCrawlingDateHolder;

// 获取和更新最后执行日期时间
let holder = LastCrawlingDateHolder.getHolder(CONTENT_TYPE);
let lastDate = holder.getLastCrawlingDate();       // 返回 java.util.Date
holder.updateLastCrawlingDate(new java.util.Date()); // 以当前日期时间更新
```

| 方法 | 说明 |
|---------|------|
| `LastCrawlingDateHolder.getHolder(String type)` | 获取指定 TYPE 对应的持有者（静态） |
| `holder.getLastCrawlingDate()` | 获取最后爬取日期时间（`java.util.Date`） |
| `holder.updateLastCrawlingDate(java.util.Date)` | 更新最后爬取日期时间 |

> **注意**：`LastCrawlingDateHolder` 不存在清除日期时间的方法。删除爬取后的重置，可通过 `updateLastCrawlingDate(new java.util.Date(0))` 等设置过去日期时间来实现。

---

### PublicStorage / PublicStorageAttachment

用于附加 iAP 公共存储上的文件时使用。

```javascript
let PublicStorage           = Packages.jp.co.intra_mart.foundation.service.client.file.PublicStorage;
let PublicStorageAttachment = Packages.jp.co.intra_mart.foundation.contentssearch.model.attachment.PublicStorageAttachment;

function setAttachment(content, filePath, logger) {
  let storage = new PublicStorage(filePath); // 创建 Java 实例（不是 SSJS 的 PublicStorage 对象）
  try {
    if (storage.isFile()) {
      content.addAttachment([new PublicStorageAttachment(storage)]);
    }
  } catch (e) {
    logger.warn('[setAttachment] 失败。path={} message={}', [filePath, e.message]);
  }
}
```

---

### FileAttachment

用于附加文件系统上的 `java.io.File`。适用于不经过 PublicStorage 的情况，例如将数据库二进制数据写入临时文件时。

**构造函数：**

| 构造函数 | 说明 |
|-------------|------|
| `FileAttachment(java.io.File)` | 以文件初始化。显示名使用文件名 |
| `FileAttachment(java.io.File, String displayName)` | 以文件和显示名初始化。`displayName` 为 `null` 时使用文件名 |

> **重要 — `displayName` 中指定的文件名必须使用适当的扩展名。**
> IM-ContentsSearch 通过扩展名判断文件类型并执行文本提取（使用 iAP 专有文本提取器）。指定错误的扩展名可能导致文本提取失败（例如对 Excel 文件指定 `.txt` 扩展名）。

> **临时文件的生命周期**：
> 附件在调用 `ContentsSearchManager.add()` 时被读取。因此，即使调用了 `StandardInputContent.addAttachment()`，也不得删除临时文件。
> 创建临时文件后，应在调用 `ContentsSearchManager.add()` 之后再删除。

**通过临时文件附加数据库二进制（BYTEA/BLOB）时：**

`TenantDatabase.executeByTemplate()` 不返回 BLOB/BYTEA 列的值（值为 `null`）。获取二进制数据请使用 `TenantDatabase.getByteReader()`，在回调中通过 `eachBytes()` 分块读取。

```javascript
/**
 * 将数据库二进制数据写入临时文件并返回。
 *
 * @param {String} tableName       - 表名
 * @param {String} columnName      - 二进制列名
 * @param {String} condition       - WHERE 子句（例：'code = ?'）
 * @param {Array}  params          - 绑定参数（例：[DbParameter.string(code)]）
 * @param {String} extension       - 文件扩展名
 * @param {Object} logger          - Logger 实例
 * @return {File|null} 临时文件。未注册时返回 null
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

// 调用示例：
let logger = Logger.getLogger();
let tempFile = null;
try {
  tempFile = readTenantDatabaseBinary('{表名}', '{二进制数据列名}', '{检索条件（例：id = ?）}', [DbParameter.string('SAMPLE_ID')], 'pdf', logger);
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

用于执行 Solr 索引优化的类。由于 `ContentsSearchManager` 未公开 `optimize()`，需要优化时直接使用 `StandardUpdateService`。

```javascript
let StandardUpdateService = Packages.jp.co.intra_mart.foundation.contentssearch.service.StandardUpdateService;
```

**构造函数：**

| 构造函数 | 说明 |
|-------------|------|
| `StandardUpdateService(String groupName)` | 以检索服务器组名初始化 |

须传入与 `ContentsSearchManager` 相同的 `groupName`。

**主要方法：**

| 方法 | 参数 | 说明 |
|---------|------|------|
| `optimize()` | 无 | 优化索引（默认行为） |
| `optimize(int maxSegments)` | 分段数（1 以上） | 指定分段数进行优化 |

> **优化时机**：优化处理负荷较高，不应频繁执行。在爬取完成后等大量注册内容之后再执行。

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

### 访问控制构建器

提供了包括用户、角色、部门、公司等在内的 9 种 ACIBuilder。详情请参考 `reference/aci-builders.md`。

```javascript
let EveryoneACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.EveryoneACIBuilder;
let StandardRoleACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardRoleACIBuilder;

// 全部用户（已认证）
content.addACIBuilder([new EveryoneACIBuilder()]);

// 限定角色（以参数指定角色代码）
content.addACIBuilder([new StandardRoleACIBuilder('role_code')]);
```

---

## SSJS（Rhino）特有限制及对策

### varargs 方法的调用

Rhino 1.7R4 中，向 Java 可变长参数（varargs）传入单个值时，可能无法正确解析。**请用 JavaScript 数组包装后传入**。

```javascript
// OK：以 JS 数组传入
content.setTypes(['type_a', 'type_b']);
content.addText([row.description]);
content.addAttachment([new PublicStorageAttachment(storage)]);
content.addACIBuilder([new EveryoneACIBuilder()]);

// NG：直接传入单个值（可能无法正确解析）
// content.addText(row.description);
```

### 数值类型转换

Rhino 会将 Java 的数值类型（`int`、`long` 等）转换为 JS Number 类型。Rhino 中的 JS Number 在内部被视为 `java.lang.Double`。在 `setValue(Fields.INT.toField(...), value)` 等泛型方法中，类型参数被解析为 `java.lang.Integer`，而 Java 无法自动将 `java.lang.Double` 转换为 `java.lang.Integer`，从而产生类型不匹配错误。请**使用构造函数**显式创建 Java 数值类型后再传入。

```javascript
// OK：使用构造函数创建
new java.lang.Integer(row.price)
new java.lang.Long(row.amount)

// NG：直接传入 JS Number（Rhino 将其视为 java.lang.Double，与 java.lang.Integer 类型不匹配）
// content.setValue(Fields.INT.toField('price'), row.price)
```

### 日期类型转换

从数据库获取的 TIMESTAMP 列为 `java.sql.Timestamp` 类型。由于 `setValue(DATE 字段)` 要求 `java.util.Date`，请使用 `getTime()` 进行转换。

```javascript
// OK
new java.util.Date(row.record_date.getTime())

// NG：直接传入 java.sql.Timestamp
// row.record_date
```

### BOOLEAN 类型转换

数据库的 BOOLEAN/SMALLINT 列的处理方式因数据库产品而异（0/1 整数、`true`/`false` 字符串等）。

```javascript
// 从 0/1 整数值转换（SMALLINT 的情况）
new java.lang.Boolean(parseInt(String(row.is_active), 10) !== 0)

// 从 true/false 字符串转换
new java.lang.Boolean(row.flag === 'true')
```

### Java List 的迭代

`getResultContentList()` 等返回的 `java.util.List` 无法使用 `for...in` 进行迭代。

```javascript
// OK：使用 size() / get(i) 迭代
let list = response.getResultContentList();
for (let i = 0; i < list.size(); i++) {
  let item = list.get(i);
}

// NG
// for (let item in list) { ... }
```
