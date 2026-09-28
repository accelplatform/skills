---
paths:
  - "src/main/jssp/src/**/*.js"
---

# 動的フィールド リファレンス

IM-ContentsSearch の動的フィールド種別（`Fields.*`）と、SSJS からの型変換パターンをまとめた参照資料。

---

## Fields 種別一覧

| `Fields` 種別 | Solr サフィックス | Java 入力型 | 多値 | 用途 |
|--------------|----------------|------------|------|------|
| `STRING` | `*_string` | `String` | | 完全一致検索用の文字列 |
| `INT` | `*_integer` | `java.lang.Integer` | | 整数値（範囲検索可） |
| `LONG` | `*_long` | `java.lang.Long` | | 長整数値（範囲検索可） |
| `DATE` | `*_date` | `java.util.Date` | | 日時値（範囲検索可） |
| `BOOLEAN` | `*_boolean` | `java.lang.Boolean` | | 真偽値 |
| `NGRAM` | `*_ngram` | `String` | | N-gram 全文検索（CJK bigram） |
| `MORPH` | `*_morph` | `String` | | 形態素解析全文検索 |
| `WHITESPACE` | `*_ws` | `String` | | スペース区切りトークン検索 |
| `STRING_MLT` | `*_string_mlt` | `String` | ○ | 完全一致・多値 |
| `INT_MLT` | `*_integer_mlt` | `java.lang.Integer` | ○ | 整数・多値 |
| `LONG_MLT` | `*_long_mlt` | `java.lang.Long` | ○ | 長整数・多値 |
| `DATE_MLT` | `*_date_mlt` | `java.util.Date` | ○ | 日時・多値 |
| `BOOLEAN_MLT` | `*_boolean_mlt` | `java.lang.Boolean` | ○ | 真偽値・多値 |
| `NGRAM_MLT` | `*_ngram_mlt` | `String` | ○ | N-gram 全文検索・多値 |
| `MORPH_MLT` | `*_morph_mlt` | `String` | ○ | 形態素解析・多値 |
| `WHITESPACE_MLT` | `*_ws_mlt` | `String` | ○ | スペース区切り・多値 |

> **フィールド名の例**: `Fields.STRING.toField("category")` → Solr フィールド名は `category_string`

---

## 単一値フィールドの設定（StandardInputContent.setValue）

### STRING

```javascript
// JS 文字列をそのまま渡す。null / 空の場合はスキップ推奨
if (row.category) {
  content.setValue(Fields.STRING.toField('category'), row.category);
}
```

### INT

```javascript
// Integer.valueOf() / Long.valueOf() は Rhino が戻り値を JS Number に戻してしまうため不可
// new によるコンストラクタ生成を使う
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
// DATE フィールドの入力型は java.util.Date
// java.sql.Timestamp 型の値の場合は getTime() で long を取得し java.util.Date に変換
if (row.release_date) {
  content.setValue(Fields.DATE.toField('release_date'),
    new java.util.Date(row.release_date.getTime()));
}
```

### BOOLEAN

```javascript
// 0/1 の SMALLINT 値から変換（0 も有効値のため null チェックを厳密に行う）
if (row.is_active !== null && row.is_active !== undefined) {
  content.setValue(Fields.BOOLEAN.toField('is_active'),
    new java.lang.Boolean(parseInt(String(row.is_active), 10) !== 0));
}

// true/false 文字列から変換する場合
// new java.lang.Boolean(row.flag === 'true')
```

### NGRAM / MORPH / WHITESPACE

```javascript
// 入力型は String。null / 空の場合はスキップ
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

**テキスト検索の違い:**

| 種別 | 解析方法 | 向いている用途 |
|------|---------|--------------|
| `NGRAM` | CJK bigram（2文字 N-gram） | 部分一致・日本語短文 |
| `MORPH` | 形態素解析 | 日本語の自然言語テキスト |
| `WHITESPACE` | スペース区切りトークン化 | タグ・コード・キーワード列 |

---

## 多値フィールドの設定（StandardInputContent.addValue）

多値フィールドは `setValue` ではなく `addValue` を使い、**値の数だけ個別に呼ぶ**。

### STRING_MLT / NGRAM_MLT / MORPH_MLT / WHITESPACE_MLT

```javascript
/**
 * JSON 配列形式（例: '["AAA","BBB","CCC"]'）をパースし、各値を多値フィールドに追加します。
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

// 呼び出し例
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
 * 日時文字列を複数フォーマットで順にパースして java.util.Date を返します。
 * すべてのフォーマットで失敗した場合は null を返します。
 *
 * 対応フォーマット（優先順）:
 *   1. yyyy-MM-dd HH:mm:ss        SQL スタイル
 *   2. yyyy-MM-dd'T'HH:mm:ssX    ISO 8601 タイムゾーン付き（+09:00 / Z など）
 *   3. yyyy-MM-dd'T'HH:mm:ss     ISO 8601 ローカル
 *   4. yyyy-MM-dd                日付のみ（時刻は 00:00:00 として扱われる）
 *   5. yyyy/MM/dd HH:mm:ss       スラッシュ区切り
 *   6. yyyy/MM/dd                スラッシュ区切り日付のみ
 *
 * @param {String} dateStr - パース対象の日時文字列
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
      // 次のフォーマットを試す
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
      logger.warn('[addMultiDateValues] 対応フォーマットで日付をパースできませんでした。value={}', [val]);
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

## テンプレートでの動的フィールド参照

### `init(request)` の request オブジェクト

テンプレートの `init(request)` に渡される `request` 引数のプロパティは以下の 3 種類のみ。

**標準フィールド（常に存在）:**

| プロパティ | 型 | 説明 |
|----------|----|------|
| `request.id` | String | コンテンツ ID |
| `request.id_original` | String | 元データの主キー（`setOriginalId()` で設定） |
| `request.title` | String | タイトル（`setTitle()` で設定） |
| `request.url` | String | 詳細ページ URL（`setUrl()` で設定） |
| `request.type` | String | コンテンツ TYPE |
| `request.record_date` | Date | 更新日時（`setRecordDate()` で設定） |

> `addText()` で設定した `text` フィールドと `addAttachment()` で設定した `attachment` フィールドは **request オブジェクトに含まれない**。

**iAP 生成フィールド（常に存在）:**

| プロパティ | 型 | 説明 |
|----------|----|------|
| `request.typeBreadcrumbs` | String | TYPE 階層のパンくず（iAP が生成） |
| `request.snippets` | Array\<String\> | ハイライト済みスニペット（iAP が生成） |

**動的フィールド（`<require-dynamic-fields>` で宣言したもののみ存在）:**

プロパティ名は `Fields.*.toField("{キー名}")` に渡したキー名と一致する。宣言していないフィールドは `request` に存在しないため、テンプレートから参照できない。

```xml
<require-dynamic-fields>
  <field type="string">category</field>
  <field type="int">price</field>
</require-dynamic-fields>
```

上記設定の場合、以下のプロパティが request オブジェクトに含まれる。

| XML `type` 属性 | フィールドキーの例 | Solr 実フィールド名 | request プロパティ名 | Rhino での型 |
|----------------|-----------------|-------------------|------------------|-------------|
| `string` | `category` | `category_string` | `request.category` | String |
| `int` | `price` | `price_integer` | `request.price` | Number |

> **注意**: `type` 属性の値は Solr のフィールド型サフィックスではなく、次のいずれかを指定する（全 16 種類）:
> `string` / `string_mlt` / `int` / `int_mlt` / `long` / `long_mlt` / `date` / `date_mlt` /
> `boolean` / `boolean_mlt` / `ngram` / `ngram_mlt` / `morph` / `morph_mlt` / `whitespace` / `whitespace_mlt`
