# クローラジョブ テンプレート

## 概要

IM-ContentsSearch の独自クローラジョブのテンプレート。
ジョブスケジューラから `execute()` が呼び出され、Solr インデックスの登録・削除を行う。
SSJS 向け API は存在しないため、`Packages.***` 経由で Java クラスを直接利用する。

コンテンツのデータソースは DB や PublicStorage 上のリソースなど多様なケースがあるので、データ取得部分（`fetchItems()`）はデータソースに応じて実装すること。

## ファイル構成

```
src/main/jssp/src/{機能名}/
└── job/
    └── crawler.js    # クローラジョブ（SSJS ジョブ）
```

※テンプレートでは上記構成としているが、命名規約はないため順守する必要はない

---

## crawler.js

```javascript
/**
 * {機能名} クローラジョブ
 *
 * @file crawler.js
 * @description {機能名} の Solr インデックスを更新するクローラジョブです。
 *              SSJS 向け API は存在しないため、Packages.*** 経由で Java クラスを直接利用します。
 */

// ========================================
// 定数定義
// ========================================
let CONTENT_TYPE = '{機能名}';
let CONTENT_URL  = '{機能名}/detail';

// ========================================
// Java クラス参照
// ========================================
let ContentsSearchManager  = Packages.jp.co.intra_mart.foundation.contentssearch.ContentsSearchManager;
let StandardInputContent   = Packages.jp.co.intra_mart.foundation.contentssearch.model.content.StandardInputContent;
let Fields                 = Packages.jp.co.intra_mart.foundation.contentssearch.model.field.Fields;
let Condition              = Packages.jp.co.intra_mart.foundation.contentssearch.model.query.Condition;
let LastCrawlingDateHolder = Packages.jp.co.intra_mart.foundation.contentssearch.indexing.util.LastCrawlingDateHolder;
let EveryoneACIBuilder     = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.EveryoneACIBuilder;
// 添付ファイルを使う場合のみ有効化
// let PublicStorage           = Packages.jp.co.intra_mart.foundation.service.client.file.PublicStorage;
// let PublicStorageAttachment = Packages.jp.co.intra_mart.foundation.contentssearch.model.attachment.PublicStorageAttachment;
// 最適化処理を使う場合のみ有効化
// let StandardUpdateService   = Packages.jp.co.intra_mart.foundation.contentssearch.service.StandardUpdateService;

// ========================================
// データ取得（データソースに応じて実装する）
// ========================================

/**
 * コンテンツ一覧を取得します。
 * DB・PublicStorage など、データソースに応じて実装してください。
 * since 以降に更新されたコンテンツのみを返す差分取得が理想ですが、
 * データソースが差分取得に対応していない場合は全件返しても構いません。
 *
 * @param {java.util.Date} since - この日時以降に更新されたデータを取得する
 * @returns {Array} コンテンツのリスト。各要素は addContent() で参照するプロパティを持つこと
 */
function fetchItems(since) {
  // TODO: データソースに応じて実装する
  throw new Error('fetchItems() が実装されていません');
}

// ========================================
// コンテンツ登録処理
// ========================================

/**
 * 1 件分のコンテンツを Solr インデックスに登録します。
 * 同一 ID のコンテンツが既に存在する場合は更新されます。
 *
 * @param {Object} item - fetchItems() が返したコンテンツ 1 件
 * @param {Object} manager - ContentsSearchManager インスタンス
 */
function addContent(item, manager) {
  let logger = Logger.getLogger();
  let content = new StandardInputContent();

  // --- 標準フィールドの設定 ---
  content.setId(CONTENT_TYPE + '_' + item.id);
  // setTypes は varargs のため JS 配列で渡す
  content.setTypes([CONTENT_TYPE]);
  content.setUrl(CONTENT_URL);
  content.setOriginalId(item.id);
  content.setTitle(item.title);

  if (item.body) {
    // addText は varargs のため JS 配列で渡す
    content.addText([item.body]);
  }

  // setRecordDate は java.util.Date を要求する。getTime() を持つ型（Timestamp 等）は変換すること
  content.setRecordDate(new java.util.Date(item.record_date.getTime()));

  // --- 動的フィールドの設定（require-dynamic-fields で宣言したフィールドを設定する） ---
  setDynamicFields(content, item, logger);

  // --- 添付ファイルの設定（PublicStorage 上のファイルがある場合のみ） ---
  // if (item.file_path) {
  //   setAttachment(content, item.file_path, logger);
  // }

  // --- 権限設定 ---
  content.addACIBuilder([new EveryoneACIBuilder()]);

  manager.add(content);
}

/**
 * 動的フィールドを content に設定します。
 * require-dynamic-fields で宣言したフィールドを setValue / addValue で登録します。
 *
 * @param {Object} content - StandardInputContent インスタンス
 * @param {Object} item - fetchItems() が返したコンテンツ 1 件
 */
function setDynamicFields(content, item) {
  // --- 単一値フィールド (setValue) ---

  // STRING: JS の文字列をそのまま渡す
  if (item.category) {
    content.setValue(Fields.STRING.toField('category'), item.category);
  }

  // INT: Generics 型が java.lang.Integer のため new java.lang.Integer() でラップする
  // （JS Number のまま渡すと java.lang.Double として扱われ型不一致になる）
  if (item.price !== null && item.price !== undefined) {
    content.setValue(Fields.INT.toField('price'), new java.lang.Integer(item.price));
  }

  // DATE: java.util.Date を渡す。getTime() を持つ型は変換すること
  if (item.expire_date) {
    content.setValue(Fields.DATE.toField('expire_date'),
      new java.util.Date(item.expire_date.getTime()));
  }

  // BOOLEAN: 0/1 の SMALLINT 値から変換する場合（データソースにより異なる — 詳細は reference/dynamic-fields.md 参照）
  if (item.is_active !== null && item.is_active !== undefined) {
    content.setValue(Fields.BOOLEAN.toField('is_active'),
      new java.lang.Boolean(parseInt(String(item.is_active), 10) !== 0));
  }

  // --- 多値フィールド (addValue) ---
  // 詳細は reference/dynamic-fields.md を参照
}

// ========================================
// 添付ファイル設定
// ========================================

// function setAttachment(content, filePath, logger) {
//   let storage = new PublicStorage(filePath);
//   try {
//     if (storage.isFile()) {
//       content.addAttachment([new PublicStorageAttachment(storage)]);
//     }
//   } catch (e) {
//     logger.warn('[setAttachment] 添付ファイルの取得に失敗しました。path={} message={}',
//       [filePath, e.message]);
//   }
// }

// ========================================
// コンテンツ削除処理
// ========================================

/**
 * TYPE 指定で全コンテンツを一括削除します。
 * 削除クローリング・再作成クローリングで使用します。
 *
 * @param {Object} manager - ContentsSearchManager インスタンス
 */
function deleteContentsByType(manager) {
  manager.deleteByType(CONTENT_TYPE);
}

/**
 * 指定 ID のコンテンツを削除します（個別削除が必要な場合に使用）。
 *
 * @param {String} id - 元データの主キー値
 * @param {Object} manager - ContentsSearchManager インスタンス
 */
function deleteContentById(id, manager) {
  manager.delete(Condition.term(Fields.ID, CONTENT_TYPE + '_' + id));
}

// ========================================
// クローリング処理
// ========================================

/**
 * 差分クローリングを実行します。
 * fetchItems() で取得したコンテンツを Solr に登録します。
 *
 * @param {Object} manager - ContentsSearchManager インスタンス
 * @param {Boolean} withCommit - true のとき登録後にコミットを実行する
 */
function executeDelta(manager, withCommit) {
  let logger = Logger.getLogger();

  let crawlingDateHolder = LastCrawlingDateHolder.getHolder(CONTENT_TYPE);
  let lastCrawlingDate   = crawlingDateHolder.getLastCrawlingDate();
  // コミット後に更新する実行日時を先に記録する
  let crawlingDate       = new java.util.Date();

  let items = fetchItems(lastCrawlingDate);

  for (let i = 0; i < items.length; i++) {
    addContent(items[i], manager);
  }

  logger.info('[executeDelta] インデックス登録完了。件数={}', items.length);

  if (withCommit) {
    manager.commit();
  }

  crawlingDateHolder.updateLastCrawlingDate(crawlingDate);
}

/**
 * 削除クローリングを実行します。
 * 全コンテンツを削除し、最終実行日時をリセットします。
 *
 * @param {Object} manager - ContentsSearchManager インスタンス
 * @param {Boolean} withCommit - true のとき削除後にコミットを実行する
 */
function executeDelete(manager, withCommit) {
  let logger = Logger.getLogger();

  deleteContentsByType(manager);
  logger.info('[executeDelete] TYPE 指定削除完了。type={}', CONTENT_TYPE);

  if (withCommit) {
    manager.commit();
  }

  // clearLastCrawlingDate() は存在しないため、エポック(0) でリセットする
  let crawlingDateHolder = LastCrawlingDateHolder.getHolder(CONTENT_TYPE);
  crawlingDateHolder.updateLastCrawlingDate(new java.util.Date(0));
}

/**
 * 最適化処理を実行します。
 * ContentsSearchManager は optimize() を公開していないため StandardUpdateService を直接使用します。
 * maxSegments が 1（デフォルト）の場合は引数なしオーバーロードを呼び出します。
 *
 * @param {String} groupName   - 検索サーバグループ名
 * @param {number} maxSegments - セグメント数（1 以上）
 * @param {Object} logger      - Logger インスタンス
 */
function executeOptimize(groupName, maxSegments, logger) {
  logger.info('[executeOptimize] 最適化処理を開始します。groupName={} maxSegments={}', [groupName, maxSegments]);
  let updateService = new StandardUpdateService(groupName);
  if (maxSegments > 1) {
    updateService.optimize(maxSegments);
  } else {
    updateService.optimize();
  }
  logger.info('[executeOptimize] 最適化処理が完了しました。');
}

/**
 * クローラジョブのエントリーポイントです。
 * ジョブパラメータに応じてクローリングタイプを切り替えます。
 *
 * ジョブパラメータ（BaseCrawlingJob 準拠）:
 *   - crawlingType:  'DELTA'（差分）/ 'DELETE'（削除）/ 'REINDEX'（再作成）。省略時は 'DELTA'
 *   - withCommit:    'false' を指定するとコミットをスキップ。省略時は true
 *   - withOptimize:  'true' を指定するとクローリング完了後に最適化を実行。省略時は false
 *   - maxSegments:   最適化のセグメント数（1 以上の整数）。省略時は 1
 *   - groupName:     検索サーバグループ名。省略時は 'default'
 * @parameter crawlingType DELTA
 * @parameter withCommit true
 * @parameter withOptimize false
 * @parameter maxSegments 1
 * @parameter groupName default
 * @return {Object} 実行結果オブジェクト（JobResult オブジェクト）
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
  logger.info('[crawler] クローリング開始。crawlingType={} withCommit={} withOptimize={} groupName={}',
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
      logger.warn('[crawler] 未知のクローリングタイプです。crawlingType={}', crawlingType);
    }

    if (withOptimize) {
      executeOptimize(groupName, maxSegments, logger);
    }

    logger.info('[crawler] クローリング完了。crawlingType={}', crawlingType);
    return { status: 'success', message: 'クローリング完了。crawlingType=' + crawlingType };

  } catch (e) {
    logger.error('[crawler] クローリング中にエラーが発生しました。crawlingType={} message={}',
      crawlingType, e.message);
    return { status: 'error', message: e.message };
  }
}
```

---

## カスタマイズポイント

### DB をデータソースとする場合

`fetchItems()` を `TenantDatabase` で実装する例。
SQL は 2WaySQL 形式で記述し、`lastCrawlingDate` パラメータで差分取得を行う。

```javascript
function fetchItems(since) {
  let logger = Logger.getLogger();
  let db = new TenantDatabase();
  let dbResult = db.executeByTemplate('/{機能名}/sql/select_for_crawling', {
    lastCrawlingDate: DbParameter.timestamp(new Date(since.getTime()))
  });

  if (!dbResult.isSuccess()) {
    logger.error('[fetchItems] DB 取得に失敗しました。message={}', dbResult.errorMessage);
    throw new Error('データの取得に失敗しました。');
  }

  return dbResult.data;
}
```

SQL（`src/main/jssp/src/{機能名}/sql/select_for_crawling.sql`）:

```sql
SELECT
  {主キーカラム}    AS id
, {タイトルカラム}  AS title
, {本文カラム}      AS body
, {更新日時カラム}  AS record_date
FROM
  {テーブル名}
WHERE
  {更新日時カラム} >= /*lastCrawlingDate*/'1970-01-01 00:00:00'
ORDER BY
  {更新日時カラム} ASC
```

- `/*lastCrawlingDate*/` は 2WaySQL のバインド変数。`DbParameter.timestamp()` で渡す
- `'1970-01-01 00:00:00'` は SQL 単体実行時のデフォルト値（エポック 0 に合わせる）
- `ORDER BY ... ASC` で古い順に処理（再クローリング時の一貫性確保）
- `addContent()` 内で参照するプロパティ名（`item.id`、`item.title` 等）と SQL の列別名を合わせること

### ファイルシステム上のファイルを添付する場合（FileAttachment）

iAP の PublicStorage を経由せず、ファイルシステム上の `java.io.File` を直接添付するケース。
サーバローカルのファイルや、DB バイナリを一時ファイルに書き出した場合に使用する。
添付ファイルは `ContentsSearchManager.add()` 呼び出し時に読み込まれる。そのため、一時ファイルは `StandardInputContent.addAttachment()` が呼び出されても削除してはならない。

Java クラス参照を追加する:

```javascript
let FileAttachment = Packages.jp.co.intra_mart.foundation.contentssearch.model.attachment.FileAttachment;
```

**一時ファイルを添付する場合:**

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

### TYPE 階層を設計する場合

```javascript
content.setTypes([CONTENT_TYPE, CONTENT_TYPE + '$' + item.category]);
```

### コンテンツの参照権限を設定する場合

ロールによる参照権限をコンテンツに付与する例。
詳細は `reference/aci-builders.md` を参照

```javascript
let StandardRoleACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardRoleACIBuilder;

content.addACIBuilder([new StandardRoleACIBuilder('role_code_here')]);
```
