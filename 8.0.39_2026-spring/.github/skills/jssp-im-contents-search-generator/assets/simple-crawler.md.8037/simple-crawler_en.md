# Crawler Job Template

## Overview

A template for custom Crawler Jobs for IM-ContentsSearch.
The Job scheduler calls `execute()`, which handles Solr index registration and deletion.
Since no SSJS API exists, Java classes are used directly via `Packages.***`.

Because the data source for Contents can vary widely — databases, resources on PublicStorage, etc. — implement the data retrieval portion (`fetchItems()`) to match your data source.

## File Structure

```
src/main/jssp/src/{feature_name}/
└── job/
    └── crawler.js    # Crawler Job (SSJS Job)
```

※ The template uses this structure, but there is no naming convention requirement to follow.

---

## crawler.js

```javascript
/**
 * {feature_name} Crawler Job
 *
 * @file crawler.js
 * @description A Crawler Job that updates the Solr index for {feature_name}.
 *              Since no SSJS API exists, Java classes are used directly via Packages.***.
 */

// ========================================
// Constants
// ========================================
let CONTENT_TYPE = '{feature_name}';
let CONTENT_URL  = '{feature_name}/detail';

// ========================================
// Java class references
// ========================================
let ContentsSearchManager  = Packages.jp.co.intra_mart.foundation.contentssearch.ContentsSearchManager;
let StandardInputContent   = Packages.jp.co.intra_mart.foundation.contentssearch.model.content.StandardInputContent;
let Fields                 = Packages.jp.co.intra_mart.foundation.contentssearch.model.field.Fields;
let Condition              = Packages.jp.co.intra_mart.foundation.contentssearch.model.query.Condition;
let LastCrawlingDateHolder = Packages.jp.co.intra_mart.foundation.contentssearch.indexing.util.LastCrawlingDateHolder;
let EveryoneACIBuilder     = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.EveryoneACIBuilder;
// Enable only when using attachments
// let PublicStorage           = Packages.jp.co.intra_mart.foundation.service.client.file.PublicStorage;
// let PublicStorageAttachment = Packages.jp.co.intra_mart.foundation.contentssearch.model.attachment.PublicStorageAttachment;
// Enable only when using optimization
// let StandardUpdateService   = Packages.jp.co.intra_mart.foundation.contentssearch.service.StandardUpdateService;

// ========================================
// Data retrieval (implement based on your data source)
// ========================================

/**
 * Retrieves a list of Contents.
 * Implement based on your data source (DB, PublicStorage, etc.).
 * Ideally, return only Contents updated after `since` for differential retrieval.
 * If the data source does not support differential retrieval, it is acceptable to return all items.
 *
 * @param {java.util.Date} since - Retrieve data updated after this date-time
 * @returns {Array} List of Contents. Each element must have the properties referenced in addContent()
 */
function fetchItems(since) {
  // TODO: Implement based on your data source
  throw new Error('fetchItems() is not implemented');
}

// ========================================
// Contents registration
// ========================================

/**
 * Registers one Contents item to the Solr index.
 * Updates if Contents with the same ID already exists.
 *
 * @param {Object} item - One Contents item returned by fetchItems()
 * @param {Object} manager - ContentsSearchManager instance
 */
function addContent(item, manager) {
  let logger = Logger.getLogger();
  let content = new StandardInputContent();

  // --- Set Standard fields ---
  content.setId(CONTENT_TYPE + '_' + item.id);
  // setTypes is varargs, so pass as a JS array
  content.setTypes([CONTENT_TYPE]);
  content.setUrl(CONTENT_URL);
  content.setOriginalId(item.id);
  content.setTitle(item.title);

  if (item.body) {
    // addText is varargs, so pass as a JS array
    content.addText([item.body]);
  }

  // setRecordDate requires java.util.Date. Convert types that have getTime() (e.g., Timestamp)
  content.setRecordDate(new java.util.Date(item.record_date.getTime()));

  // --- Set Dynamic fields (set the fields declared in require-dynamic-fields) ---
  setDynamicFields(content, item, logger);

  // --- Set attachments (only if a file exists on PublicStorage) ---
  // if (item.file_path) {
  //   setAttachment(content, item.file_path, logger);
  // }

  // --- Access control settings ---
  content.addACIBuilder([new EveryoneACIBuilder()]);

  manager.add(content);
}

/**
 * Sets Dynamic fields on the content.
 * Registers fields declared in require-dynamic-fields using setValue / addValue.
 *
 * @param {Object} content - StandardInputContent instance
 * @param {Object} item - One Contents item returned by fetchItems()
 */
function setDynamicFields(content, item) {
  // --- Single-value fields (setValue) ---

  // STRING: Pass JS strings as-is
  if (item.category) {
    content.setValue(Fields.STRING.toField('category'), item.category);
  }

  // INT: The generic type is java.lang.Integer, so wrap with new java.lang.Integer()
  // (Passing as JS Number causes it to be treated as java.lang.Double, resulting in a type mismatch)
  if (item.price !== null && item.price !== undefined) {
    content.setValue(Fields.INT.toField('price'), new java.lang.Integer(item.price));
  }

  // DATE: Pass java.util.Date. Convert types that have getTime()
  if (item.expire_date) {
    content.setValue(Fields.DATE.toField('expire_date'),
      new java.util.Date(item.expire_date.getTime()));
  }

  // BOOLEAN: When converting from a SMALLINT value of 0/1 (varies by data source — see reference/dynamic-fields.md for details)
  if (item.is_active !== null && item.is_active !== undefined) {
    content.setValue(Fields.BOOLEAN.toField('is_active'),
      new java.lang.Boolean(parseInt(String(item.is_active), 10) !== 0));
  }

  // --- Multi-value fields (addValue) ---
  // See reference/dynamic-fields.md for details
}

// ========================================
// Attachment settings
// ========================================

// function setAttachment(content, filePath, logger) {
//   let storage = new PublicStorage(filePath);
//   try {
//     if (storage.isFile()) {
//       content.addAttachment([new PublicStorageAttachment(storage)]);
//     }
//   } catch (e) {
//     logger.warn('[setAttachment] Failed to retrieve the attachment. path={} message={}',
//       [filePath, e.message]);
//   }
// }

// ========================================
// Contents deletion
// ========================================

/**
 * Deletes all Contents of the specified TYPE in bulk.
 * Used in Remove Crawling and Recreate Crawling.
 *
 * @param {Object} manager - ContentsSearchManager instance
 */
function deleteContentsByType(manager) {
  manager.deleteByType(CONTENT_TYPE);
}

/**
 * Deletes the Contents with the specified ID (use when individual deletion is needed).
 *
 * @param {String} id - Primary key value of the source data
 * @param {Object} manager - ContentsSearchManager instance
 */
function deleteContentById(id, manager) {
  manager.delete(Condition.term(Fields.ID, CONTENT_TYPE + '_' + id));
}

// ========================================
// Crawling
// ========================================

/**
 * Performs Differential Crawling.
 * Registers Contents retrieved by fetchItems() to Solr.
 *
 * @param {Object} manager - ContentsSearchManager instance
 * @param {Boolean} withCommit - When true, commits after registration
 */
function executeDelta(manager, withCommit) {
  let logger = Logger.getLogger();

  let crawlingDateHolder = LastCrawlingDateHolder.getHolder(CONTENT_TYPE);
  let lastCrawlingDate   = crawlingDateHolder.getLastCrawlingDate();
  // Record the execution date-time to update after commit in advance
  let crawlingDate       = new java.util.Date();

  let items = fetchItems(lastCrawlingDate);

  for (let i = 0; i < items.length; i++) {
    addContent(items[i], manager);
  }

  logger.info('[executeDelta] Index registration complete. count={}', items.length);

  if (withCommit) {
    manager.commit();
  }

  crawlingDateHolder.updateLastCrawlingDate(crawlingDate);
}

/**
 * Performs Remove Crawling.
 * Deletes all Contents and resets the last execution date-time.
 *
 * @param {Object} manager - ContentsSearchManager instance
 * @param {Boolean} withCommit - When true, commits after deletion
 */
function executeDelete(manager, withCommit) {
  let logger = Logger.getLogger();

  deleteContentsByType(manager);
  logger.info('[executeDelete] TYPE-based deletion complete. type={}', CONTENT_TYPE);

  if (withCommit) {
    manager.commit();
  }

  // clearLastCrawlingDate() does not exist; reset by setting epoch (0)
  let crawlingDateHolder = LastCrawlingDateHolder.getHolder(CONTENT_TYPE);
  crawlingDateHolder.updateLastCrawlingDate(new java.util.Date(0));
}

/**
 * Performs optimization.
 * Since ContentsSearchManager does not expose optimize(), StandardUpdateService is used directly.
 * When maxSegments is 1 (default), calls the no-argument overload.
 *
 * @param {String} groupName   - Search server group name
 * @param {number} maxSegments - Number of segments (1 or more)
 * @param {Object} logger      - Logger instance
 */
function executeOptimize(groupName, maxSegments, logger) {
  logger.info('[executeOptimize] Starting optimization. groupName={} maxSegments={}', [groupName, maxSegments]);
  let updateService = new StandardUpdateService(groupName);
  if (maxSegments > 1) {
    updateService.optimize(maxSegments);
  } else {
    updateService.optimize();
  }
  logger.info('[executeOptimize] Optimization complete.');
}

/**
 * Entry point for the Crawler Job.
 * Switches the Crawling type based on Job parameters.
 *
 * Job parameters (conforming to BaseCrawlingJob):
 *   - crawlingType:  'DELTA' (differential) / 'DELETE' (removal) / 'REINDEX' (recreate). Defaults to 'DELTA'
 *   - withCommit:    Specify 'false' to skip commit. Defaults to true
 *   - withOptimize:  Specify 'true' to run optimization after Crawling. Defaults to false
 *   - maxSegments:   Number of segments for optimization (integer >= 1). Defaults to 1
 *   - groupName:     Search server group name. Defaults to 'default'
 * @parameter crawlingType DELTA
 * @parameter withCommit true
 * @parameter withOptimize false
 * @parameter maxSegments 1
 * @parameter groupName default
 * @return {Object} Execution result object (JobResult object)
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
  logger.info('[crawler] Crawling started. crawlingType={} withCommit={} withOptimize={} groupName={}',
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
      logger.warn('[crawler] Unknown Crawling type. crawlingType={}', crawlingType);
    }

    if (withOptimize) {
      executeOptimize(groupName, maxSegments, logger);
    }

    logger.info('[crawler] Crawling complete. crawlingType={}', crawlingType);
    return { status: 'success', message: 'Crawling complete. crawlingType=' + crawlingType };

  } catch (e) {
    logger.error('[crawler] An error occurred during Crawling. crawlingType={} message={}',
      crawlingType, e.message);
    return { status: 'error', message: e.message };
  }
}
```

---

## Customization

### When Using a Database as the Data Source

An example of implementing `fetchItems()` with `TenantDatabase`.
Write SQL in 2WaySQL format and use the `lastCrawlingDate` parameter for differential retrieval.

```javascript
function fetchItems(since) {
  let logger = Logger.getLogger();
  let db = new TenantDatabase();
  let dbResult = db.executeByTemplate('/{feature_name}/sql/select_for_crawling', {
    lastCrawlingDate: DbParameter.timestamp(new Date(since.getTime()))
  });

  if (!dbResult.isSuccess()) {
    logger.error('[fetchItems] Failed to retrieve data from DB. message={}', dbResult.errorMessage);
    throw new Error('Failed to retrieve data.');
  }

  return dbResult.data;
}
```

SQL (`src/main/jssp/src/{feature_name}/sql/select_for_crawling.sql`):

```sql
SELECT
  {primary_key_column}    AS id
, {title_column}          AS title
, {body_column}           AS body
, {updated_at_column}     AS record_date
FROM
  {table_name}
WHERE
  {updated_at_column} >= /*lastCrawlingDate*/'1970-01-01 00:00:00'
ORDER BY
  {updated_at_column} ASC
```

- `/*lastCrawlingDate*/` is a 2WaySQL bind variable. Pass it using `DbParameter.timestamp()`
- `'1970-01-01 00:00:00'` is the default value for standalone SQL execution (aligned with epoch 0)
- Process in ascending order with `ORDER BY ... ASC` (ensures consistency during re-crawling)
- Align the property names referenced in `addContent()` (e.g., `item.id`, `item.title`) with the SQL column aliases

### When Attaching Files from the File System (FileAttachment)

A case where a `java.io.File` from the file system is attached directly without going through iAP's PublicStorage.
Use this for server-local files or when DB binary data has been written to a temporary file.
The attached file is read when `ContentsSearchManager.add()` is called. Therefore, do not delete the temporary file when `StandardInputContent.addAttachment()` is called.

Add a Java class reference:

```javascript
let FileAttachment = Packages.jp.co.intra_mart.foundation.contentssearch.model.attachment.FileAttachment;
```

**When attaching a temporary file:**

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

### When Designing a TYPE Hierarchy

```javascript
content.setTypes([CONTENT_TYPE, CONTENT_TYPE + '$' + item.category]);
```

### When Setting Contents Access Control

An example of granting Role-based access control to Contents.
For details, see `reference/aci-builders.md`.

```javascript
let StandardRoleACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardRoleACIBuilder;

content.addACIBuilder([new StandardRoleACIBuilder('role_code_here')]);
```
