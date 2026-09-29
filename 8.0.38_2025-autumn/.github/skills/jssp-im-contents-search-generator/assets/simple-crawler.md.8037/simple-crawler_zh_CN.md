# Crawler Job 模板

## 概述

IM-ContentsSearch 自定义 Crawler Job 的模板。
Job scheduler 调用 `execute()` 后，执行 Solr 索引的注册和删除操作。
由于不存在面向 SSJS 的官方 API，通过 `Packages.***` 语法直接调用 Java 类来实现。

内容数据来源多种多样，包括数据库和 PublicStorage 上的资源等，因此请根据实际数据来源实现数据获取部分（`fetchItems()`）。

## 文件结构

```
src/main/jssp/src/{功能名}/
└── job/
    └── crawler.js    # Crawler Job（SSJS Job）
```

※ 模板采用上述结构，但由于没有命名规约，无需严格遵守

---

## crawler.js

```javascript
/**
 * {功能名} Crawler Job
 *
 * @file crawler.js
 * @description 更新 {功能名} Solr 索引的 Crawler Job。
 *              由于不存在面向 SSJS 的官方 API，通过 Packages.*** 语法直接调用 Java 类来实现。
 */

// ========================================
// 常量定义
// ========================================
let CONTENT_TYPE = '{功能名}';
let CONTENT_URL  = '{功能名}/detail';

// ========================================
// Java 类引用
// ========================================
let ContentsSearchManager  = Packages.jp.co.intra_mart.foundation.contentssearch.ContentsSearchManager;
let StandardInputContent   = Packages.jp.co.intra_mart.foundation.contentssearch.model.content.StandardInputContent;
let Fields                 = Packages.jp.co.intra_mart.foundation.contentssearch.model.field.Fields;
let Condition              = Packages.jp.co.intra_mart.foundation.contentssearch.model.query.Condition;
let LastCrawlingDateHolder = Packages.jp.co.intra_mart.foundation.contentssearch.indexing.util.LastCrawlingDateHolder;
let EveryoneACIBuilder     = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.EveryoneACIBuilder;
// 仅在使用附件时启用
// let PublicStorage           = Packages.jp.co.intra_mart.foundation.service.client.file.PublicStorage;
// let PublicStorageAttachment = Packages.jp.co.intra_mart.foundation.contentssearch.model.attachment.PublicStorageAttachment;
// 仅在使用优化处理时启用
// let StandardUpdateService   = Packages.jp.co.intra_mart.foundation.contentssearch.service.StandardUpdateService;

// ========================================
// 数据获取（根据数据来源实现）
// ========================================

/**
 * 获取内容列表。
 * 请根据数据库、PublicStorage 等实际数据来源进行实现。
 * 理想情况下仅返回 since 之后更新的内容（差异获取），
 * 但如果数据来源不支持差异获取，返回全量数据也可以。
 *
 * @param {java.util.Date} since - 获取该日期时间之后更新的数据
 * @returns {Array} 内容列表。每个元素须包含 addContent() 中引用的属性
 */
function fetchItems(since) {
  // TODO: 根据数据来源实现
  throw new Error('fetchItems() 未实现');
}

// ========================================
// 内容注册处理
// ========================================

/**
 * 将单条内容注册到 Solr 索引。
 * 如果相同 ID 的内容已存在，则更新该内容。
 *
 * @param {Object} item - fetchItems() 返回的单条内容
 * @param {Object} manager - ContentsSearchManager 实例
 */
function addContent(item, manager) {
  let logger = Logger.getLogger();
  let content = new StandardInputContent();

  // --- 设置标准字段 ---
  content.setId(CONTENT_TYPE + '_' + item.id);
  // setTypes 是 varargs 方法，以 JS 数组传入
  content.setTypes([CONTENT_TYPE]);
  content.setUrl(CONTENT_URL);
  content.setOriginalId(item.id);
  content.setTitle(item.title);

  if (item.body) {
    // addText 是 varargs 方法，以 JS 数组传入
    content.addText([item.body]);
  }

  // setRecordDate 要求 java.util.Date 类型。具有 getTime() 的类型（如 Timestamp）须进行转换
  content.setRecordDate(new java.util.Date(item.record_date.getTime()));

  // --- 设置动态字段（设置在 require-dynamic-fields 中声明的字段） ---
  setDynamicFields(content, item, logger);

  // --- 设置附件（仅在 PublicStorage 上存在文件时） ---
  // if (item.file_path) {
  //   setAttachment(content, item.file_path, logger);
  // }

  // --- 权限设置 ---
  content.addACIBuilder([new EveryoneACIBuilder()]);

  manager.add(content);
}

/**
 * 将动态字段设置到 content 中。
 * 通过 setValue / addValue 注册在 require-dynamic-fields 中声明的字段。
 *
 * @param {Object} content - StandardInputContent 实例
 * @param {Object} item - fetchItems() 返回的单条内容
 */
function setDynamicFields(content, item) {
  // --- 单值字段 (setValue) ---

  // STRING: 直接传入 JS 字符串
  if (item.category) {
    content.setValue(Fields.STRING.toField('category'), item.category);
  }

  // INT: 泛型类型为 java.lang.Integer，须使用 new java.lang.Integer() 包装
  // （直接传入 JS Number 会被当作 java.lang.Double 处理，导致类型不匹配）
  if (item.price !== null && item.price !== undefined) {
    content.setValue(Fields.INT.toField('price'), new java.lang.Integer(item.price));
  }

  // DATE: 传入 java.util.Date 类型。具有 getTime() 的类型须进行转换
  if (item.expire_date) {
    content.setValue(Fields.DATE.toField('expire_date'),
      new java.util.Date(item.expire_date.getTime()));
  }

  // BOOLEAN: 从 0/1 的 SMALLINT 值转换（因数据来源而异 — 详情请参考 reference/dynamic-fields.md）
  if (item.is_active !== null && item.is_active !== undefined) {
    content.setValue(Fields.BOOLEAN.toField('is_active'),
      new java.lang.Boolean(parseInt(String(item.is_active), 10) !== 0));
  }

  // --- 多值字段 (addValue) ---
  // 详情请参考 reference/dynamic-fields.md
}

// ========================================
// 附件设置
// ========================================

// function setAttachment(content, filePath, logger) {
//   let storage = new PublicStorage(filePath);
//   try {
//     if (storage.isFile()) {
//       content.addAttachment([new PublicStorageAttachment(storage)]);
//     }
//   } catch (e) {
//     logger.warn('[setAttachment] 获取附件失败。path={} message={}',
//       [filePath, e.message]);
//   }
// }

// ========================================
// 内容删除处理
// ========================================

/**
 * 按 TYPE 批量删除所有内容。
 * 用于删除爬取和重新索引爬取。
 *
 * @param {Object} manager - ContentsSearchManager 实例
 */
function deleteContentsByType(manager) {
  manager.deleteByType(CONTENT_TYPE);
}

/**
 * 删除指定 ID 的内容（需要单条删除时使用）。
 *
 * @param {String} id - 源数据的主键值
 * @param {Object} manager - ContentsSearchManager 实例
 */
function deleteContentById(id, manager) {
  manager.delete(Condition.term(Fields.ID, CONTENT_TYPE + '_' + id));
}

// ========================================
// 爬取处理
// ========================================

/**
 * 执行差异爬取。
 * 将 fetchItems() 获取的内容注册到 Solr。
 *
 * @param {Object} manager - ContentsSearchManager 实例
 * @param {Boolean} withCommit - 为 true 时，注册完成后执行提交
 */
function executeDelta(manager, withCommit) {
  let logger = Logger.getLogger();

  let crawlingDateHolder = LastCrawlingDateHolder.getHolder(CONTENT_TYPE);
  let lastCrawlingDate   = crawlingDateHolder.getLastCrawlingDate();
  // 提前记录提交后将更新的执行日期时间
  let crawlingDate       = new java.util.Date();

  let items = fetchItems(lastCrawlingDate);

  for (let i = 0; i < items.length; i++) {
    addContent(items[i], manager);
  }

  logger.info('[executeDelta] 索引注册完成。件数={}', items.length);

  if (withCommit) {
    manager.commit();
  }

  crawlingDateHolder.updateLastCrawlingDate(crawlingDate);
}

/**
 * 执行删除爬取。
 * 删除所有内容并重置最后执行日期时间。
 *
 * @param {Object} manager - ContentsSearchManager 实例
 * @param {Boolean} withCommit - 为 true 时，删除完成后执行提交
 */
function executeDelete(manager, withCommit) {
  let logger = Logger.getLogger();

  deleteContentsByType(manager);
  logger.info('[executeDelete] 按 TYPE 删除完成。type={}', CONTENT_TYPE);

  if (withCommit) {
    manager.commit();
  }

  // 由于不存在 clearLastCrawlingDate()，使用纪元时间(0) 重置
  let crawlingDateHolder = LastCrawlingDateHolder.getHolder(CONTENT_TYPE);
  crawlingDateHolder.updateLastCrawlingDate(new java.util.Date(0));
}

/**
 * 执行优化处理。
 * 由于 ContentsSearchManager 未公开 optimize()，直接使用 StandardUpdateService。
 * maxSegments 为 1（默认值）时，调用无参数重载。
 *
 * @param {String} groupName   - 检索服务器组名
 * @param {number} maxSegments - 分段数（1 以上）
 * @param {Object} logger      - Logger 实例
 */
function executeOptimize(groupName, maxSegments, logger) {
  logger.info('[executeOptimize] 开始优化处理。groupName={} maxSegments={}', [groupName, maxSegments]);
  let updateService = new StandardUpdateService(groupName);
  if (maxSegments > 1) {
    updateService.optimize(maxSegments);
  } else {
    updateService.optimize();
  }
  logger.info('[executeOptimize] 优化处理完成。');
}

/**
 * Crawler Job 的入口点。
 * 根据 Job 参数切换爬取类型。
 *
 * Job 参数（遵循 BaseCrawlingJob 规范）:
 *   - crawlingType:  'DELTA'（差异）/ 'DELETE'（删除）/ 'REINDEX'（重新索引）。省略时默认为 'DELTA'
 *   - withCommit:    指定 'false' 时跳过提交。省略时默认为 true
 *   - withOptimize:  指定 'true' 时在爬取完成后执行优化。省略时默认为 false
 *   - maxSegments:   优化的分段数（1 以上的整数）。省略时默认为 1
 *   - groupName:     检索服务器组名。省略时默认为 'default'
 * @parameter crawlingType DELTA
 * @parameter withCommit true
 * @parameter withOptimize false
 * @parameter maxSegments 1
 * @parameter groupName default
 * @return {Object} 执行结果对象（JobResult 对象）
 */
function execute() {
  let jobSchedulerContext = Contexts.getJobSchedulerContext();
  let crawlingType     = (jobSchedulerContext.getParameter('crawlingType') || 'DELTA').toUpperCase();
  let withCommit       = jobSchedulerContext.getParameter('withCommit') !== 'false';
  let withOptimize     = jobSchedulerContext.getParameter('withOptimize') === 'true';
  let maxSegmentsParam = jobSchedulerContext.getParameter('maxSegments');
  let maxSegments      = maxSegmentsParam ? parseInt(String(maxSegmentsParam), 10) : 1;
  let groupName        = jobSchedulerContext.getParameter('groupName') || 'default';

  let logger = Logger.getLogger();
  logger.info('[crawler] 爬取开始。crawlingType={} withCommit={} withOptimize={} groupName={}',
    [crawlingType, withCommit, withOptimize, groupName]);

  let manager = new ContentsSearchManager(groupName);

  try {
    if (crawlingType === 'DELTA') {
      executeDelta(manager, withCommit);
    } else if (crawlingType === 'DELETE') {
      executeDelete(manager, withCommit);
    } else if (crawlingType === 'REINDEX') {
      executeDelete(manager, false);
      executeDelta(manager, withCommit);
    } else {
      logger.warn('[crawler] 未知的爬取类型。crawlingType={}', crawlingType);
    }

    if (withOptimize) {
      executeOptimize(groupName, maxSegments, logger);
    }

    logger.info('[crawler] 爬取完成。crawlingType={}', crawlingType);
    return { status: 'success', message: '爬取完成。crawlingType=' + crawlingType };

  } catch (e) {
    logger.error('[crawler] 爬取过程中发生错误。crawlingType={} message={}',
      crawlingType, e.message);
    return { status: 'error', message: e.message };
  }
}
```

---

## 自定义要点

### 以数据库为数据来源时

使用 `TenantDatabase` 实现 `fetchItems()` 的示例。
SQL 采用 2WaySQL 格式编写，通过 `lastCrawlingDate` 参数实现差异获取。

```javascript
function fetchItems(since) {
  let logger = Logger.getLogger();
  let db = new TenantDatabase();
  let dbResult = db.executeByTemplate('/{功能名}/sql/select_for_crawling', {
    lastCrawlingDate: DbParameter.timestamp(new Date(since.getTime()))
  });

  if (!dbResult.isSuccess()) {
    logger.error('[fetchItems] 数据库获取失败。message={}', dbResult.errorMessage);
    throw new Error('数据获取失败。');
  }

  return dbResult.data;
}
```

SQL（`src/main/jssp/src/{功能名}/sql/select_for_crawling.sql`）:

```sql
SELECT
  {主键列}      AS id
, {标题列}      AS title
, {正文列}      AS body
, {更新日期时间列} AS record_date
FROM
  {表名}
WHERE
  {更新日期时间列} >= /*lastCrawlingDate*/'1970-01-01 00:00:00'
ORDER BY
  {更新日期时间列} ASC
```

- `/*lastCrawlingDate*/` 是 2WaySQL 的绑定变量，通过 `DbParameter.timestamp()` 传入
- `'1970-01-01 00:00:00'` 是单独执行 SQL 时的默认值（与纪元时间 0 对应）
- `ORDER BY ... ASC` 按时间正序处理（确保重新爬取时的一致性）
- `addContent()` 中引用的属性名（`item.id`、`item.title` 等）须与 SQL 列别名保持一致

### 附加文件系统上的文件时（FileAttachment）

不经过 iAP 的 PublicStorage，直接附加文件系统上 `java.io.File` 的场景。
适用于服务器本地文件，或将数据库二进制数据写入临时文件的情况。
附件在调用 `ContentsSearchManager.add()` 时被读取，因此即使调用了 `StandardInputContent.addAttachment()`，也不得删除临时文件。

添加 Java 类引用：

```javascript
let FileAttachment = Packages.jp.co.intra_mart.foundation.contentssearch.model.attachment.FileAttachment;
```

**附加临时文件时：**

```javascript
function addContent(item, manager) {
  let tempFile = null;
  try {

    ...

    tempFile = createTempFile();
    content.addAttachment([new FileAttachment(tempFile)]);

    manager.add(content);
  } finally {
    if (tempFile !== null) {
      try { tempFile.delete(); } catch (ignored) {}
    }
  }
}
```

### 设计 TYPE 层次结构时

```javascript
content.setTypes([CONTENT_TYPE, CONTENT_TYPE + '$' + item.category]);
```

### 为内容设置查看权限时

以角色为内容授予查看权限的示例。
详情请参考 `reference/aci-builders.md`

```javascript
let StandardRoleACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardRoleACIBuilder;

content.addACIBuilder([new StandardRoleACIBuilder('role_code_here')]);
```
