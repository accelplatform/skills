# IM-ContentsSearch Java API リファレンス（SSJS 向け）

SSJS（Rhino）から `Packages.***` 構文で利用する Java クラスの完全修飾クラス名・主要メソッド・SSJS 固有の制約をまとめた参照資料。

---

## Java クラス一覧

| クラス名（短縮） | 完全修飾クラス名 |
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

## クラス別 主要メソッド

### ContentsSearchManager

コンテンツの登録・削除・検索を行う中心クラス。インスタンスはローカルスコープで生成する。

```javascript
let ContentsSearchManager = Packages.jp.co.intra_mart.foundation.contentssearch.ContentsSearchManager;

// ローカル変数でインスタンス化（グローバルスコープで new してはならない）
// 検索サーバグループ名（groupName）を指定する
let manager = new ContentsSearchManager(groupName);
```

検索サーバグループ名は、ジョブパラメータ `groupName` で指定する（省略時は `'default'`）。
iAP の初期設定では `'default'` が使用されるが、独自に Solr 接続設定を用意している環境では異なる値になる場合がある。

| メソッド | 引数 | 説明 |
|---------|------|------|
| `add(InputContent)` | `StandardInputContent` | コンテンツをインデックスに追加（同一 ID は上書き） |
| `delete(Searchable)` | `Condition` | 条件に一致するコンテンツを削除 |
| `deleteAll()` | なし | 登録済みコンテンツを全件削除 |
| `deleteByType(String)` | TYPE 値 | 指定 TYPE のコンテンツを全件削除 |
| `commit()` | なし | Solr にコミット（処理後に呼ぶ） |

---

### StandardInputContent

Solr に登録するコンテンツを表すクラス。

```javascript
let StandardInputContent = Packages.jp.co.intra_mart.foundation.contentssearch.model.content.StandardInputContent;

let content = new StandardInputContent();
```

| メソッド | 引数 | 説明 |
|---------|------|------|
| `setId(String)` | コンテンツ ID | システム全体で一意な ID（例: `"feature_name_" + code`） |
| `setTypes(String[])` | TYPE 値の配列 | JS 配列で渡す（varargs 対応） |
| `addType(String...)` | TYPE 値（可変長） | TYPE を追加（varargs → JS 配列で渡す） |
| `setUrl(String)` | 相対 URL | 詳細ページへのリンク（検索結果クリック時） |
| `setOriginalId(String)` | 元データ主キー | 元のデータ識別子（`id_original` として参照可能） |
| `setTitle(String)` | タイトル | 検索対象・表示用タイトル |
| `addText(String[])` | テキスト配列 | 全文検索対象テキスト追加（varargs → JS 配列で渡す） |
| `setRecordDate(java.util.Date)` | 更新日時 | 標準検索画面の日付レンジ検索に使用 |
| `setValue(BasicField, value)` | フィールド, 値 | 単一値の動的フィールドを設定 |
| `addValue(BasicField, value)` | フィールド, 値 | 多値フィールドへ値を追加（要素ごとに呼ぶ） |
| `addAttachment(Attachment[])` | 添付ファイル配列 | 添付ファイルを追加（varargs → JS 配列で渡す） |
| `addACIBuilder(ACIBuilder[])` | 権限ビルダー配列 | 権限設定（varargs → JS 配列で渡す） |

---

### Fields（動的フィールド種別）

動的フィールドのキーを生成する列挙クラス。`Fields.STRING.toField("key")` で `DynamicField` を取得する。

```javascript
let Fields = Packages.jp.co.intra_mart.foundation.contentssearch.model.field.Fields;

// 単一値フィールドの設定例
content.setValue(Fields.STRING.toField('category'), row.category);
content.setValue(Fields.INT.toField('price'), new java.lang.Integer(row.price));

// 多値フィールドの設定例（要素ごとに addValue を呼ぶ）
content.addValue(Fields.STRING_MLT.toField('tags'), tagValue);
```

詳細は `reference/dynamic-fields.md` を参照。

---

### Condition（検索条件）

クローラの削除処理とテンプレートの検索処理の両方で使用する。条件オブジェクトは static ファクトリメソッドで生成する。

```javascript
let Condition = Packages.jp.co.intra_mart.foundation.contentssearch.model.query.Condition;
let Fields    = Packages.jp.co.intra_mart.foundation.contentssearch.model.field.Fields;
```

| メソッド | 引数 | 用途 |
|---------|------|------|
| `Condition.all()` | なし | 全コンテンツ対象 |
| `Condition.type(String...)` | TYPE 値（可変長） | TYPE で絞り込み → JS 配列で渡す |
| `Condition.term(BasicField, value)` | フィールド + 値 | 完全一致 |
| `Condition.keyword(String...)` | キーワード | 全文検索（AND 結合） |
| `Condition.exists(BasicField)` | フィールド | フィールドに値が存在する |
| `Condition.range(BasicField, start, end, inclusive)` | フィールド + 範囲 + 境界フラグ | 範囲検索 |
| `Condition.and(Searchable...)` | 条件（可変長） | AND 結合 → JS 配列で渡す |
| `Condition.or(Searchable...)` | 条件（可変長） | OR 結合 → JS 配列で渡す |

> **注意**: `Condition.id()` は**存在しない**。ID による絞り込みは `Condition.term(Fields.ID, id)` を使う。

#### 基本：TYPE + キーワード（メソッドチェーン）

ファクトリメソッドの戻り値はさらに条件を追加するメソッドを持つ。
ガイドが推奨するパターン。

```javascript
// TYPE で絞り込み、かつ「検索ワード」を含む
let cond = Condition.type(['my_feature']).keyword(['検索ワード']);

// TYPE で絞り込み、かつキーワードを含み、かつ指定フィールドに値が存在する
let cond = Condition.type(['my_feature'])
                    .keyword(['検索ワード'])
                    .exists(Fields.STRING.toField('category'));
```

#### フィールド完全一致

```javascript
// 標準フィールド（ID）で完全一致
let cond = Condition.term(Fields.ID, 'my_feature_001');

// 動的フィールド（STRING）で完全一致
let cond = Condition.term(Fields.STRING.toField('category'), 'electronics');
```

#### 範囲検索

`range()` の start / end の型は動的フィールドの Generics 型に合わせる。
INT / LONG フィールドには `java.lang.Integer` / `java.lang.Long` を渡すこと（JS Number のまま渡すと型不一致になる）。

```javascript
// INT フィールドの範囲（両端を含む）
let cond = Condition.range(
  Fields.INT.toField('price'),
  new java.lang.Integer(1000),
  new java.lang.Integer(5000),
  true
);

// DATE フィールドの範囲
let cond = Condition.range(
  Fields.DATE.toField('release_date'),
  new java.util.Date(startDate.getTime()),
  new java.util.Date(endDate.getTime()),
  true
);
```

#### AND / OR 結合

複数の条件を組み合わせる場合は `Condition.and()` / `Condition.or()` に JS 配列で渡す。

```javascript
// AND：TYPE 絞り込み + 価格範囲
let cond = Condition.and([
  Condition.type(['my_feature']),
  Condition.range(Fields.INT.toField('price'),
    new java.lang.Integer(1000), new java.lang.Integer(5000), true)
]);

// OR：カテゴリ A または カテゴリ B
let cond = Condition.or([
  Condition.term(Fields.STRING.toField('category'), 'electronics'),
  Condition.term(Fields.STRING.toField('category'), 'kitchen')
]);

// AND と OR のネスト
let cond = Condition.and([
  Condition.type(['my_feature']),
  Condition.or([
    Condition.term(Fields.STRING.toField('category'), 'electronics'),
    Condition.term(Fields.STRING.toField('category'), 'kitchen')
  ])
]);
```

#### クローラ（削除）での使用例

```javascript
// ID 指定で個別削除
manager.delete(Condition.term(Fields.ID, id));

// TYPE を指定して全件削除（deleteByType と同等）
manager.delete(Condition.type(['my_feature']));
```

---

### LastCrawlingDateHolder

差分クローリングで最終実行日時を管理するクラス。

```javascript
let LastCrawlingDateHolder = Packages.jp.co.intra_mart.foundation.contentssearch.indexing.util.LastCrawlingDateHolder;

// 最終実行日時の取得・更新
let holder = LastCrawlingDateHolder.getHolder(CONTENT_TYPE);
let lastDate = holder.getLastCrawlingDate();       // java.util.Date を返す
holder.updateLastCrawlingDate(new java.util.Date()); // 現在日時で更新
```

| メソッド | 説明 |
|---------|------|
| `LastCrawlingDateHolder.getHolder(String type)` | TYPE に対応するホルダーを取得（静的） |
| `holder.getLastCrawlingDate()` | 最終クローリング日時を取得（`java.util.Date`） |
| `holder.updateLastCrawlingDate(java.util.Date)` | 最終クローリング日時を更新 |

> **注意**: `LastCrawlingDateHolder` には日時クリア用のメソッドが存在しない。削除クローリング後のリセットは `updateLastCrawlingDate(new java.util.Date(0))` などで過去日時を設定する。

---

### PublicStorage / PublicStorageAttachment

iAP のパブリックストレージ上のファイルを添付する場合に使用する。

```javascript
let PublicStorage           = Packages.jp.co.intra_mart.foundation.service.client.file.PublicStorage;
let PublicStorageAttachment = Packages.jp.co.intra_mart.foundation.contentssearch.model.attachment.PublicStorageAttachment;

function setAttachment(content, filePath, logger) {
  let storage = new PublicStorage(filePath); // java インスタンス生成（SSJS の PublicStorage オブジェクトではない）
  try {
    if (storage.isFile()) {
      content.addAttachment([new PublicStorageAttachment(storage)]);
    }
  } catch (e) {
    logger.warn('[setAttachment] 失敗。path={} message={}', [filePath, e.message]);
  }
}
```

---

### FileAttachment

ファイルシステム上の `java.io.File` を添付する場合に使用する。
DB バイナリを一時ファイルに書き出した場合など、PublicStorage を経由しないケースに対応する。

**コンストラクタ:**

| コンストラクタ | 説明 |
|-------------|------|
| `FileAttachment(java.io.File)` | ファイルで初期化。表示名はファイル名を使用 |
| `FileAttachment(java.io.File, String displayName)` | ファイルと表示名で初期化。`displayName` が `null` の場合はファイル名を使用 |

> **重要 — `displayName` に指定するファイル名には適切な拡張子を指定すること。**
> IM-ContentsSearch は拡張子でファイル種別を判定してテキスト抽出を行う（iAP 独自のテキスト抽出器を使用）。異なる拡張子付与するとテキスト抽出に失敗する可能性がある（Excel ファイルに `.txt` の拡張子を付与するなど）。

> **一時ファイルのライフサイクル**:
> 添付ファイルは `ContentsSearchManager.add()` 呼び出し時に読み込まれる。そのため、一時ファイルは `StandardInputContent.addAttachment()` が呼び出されても削除してはならない。
> 一時ファイルを作成した場合は、`ContentsSearchManager.add()` 呼び出し後に削除すること。

**DB バイナリ（BYTEA/BLOB）を一時ファイル経由で添付する場合:**

`TenantDatabase.executeByTemplate()` は BLOB/BYTEA カラムの値を返さない（`null` になる）。
バイナリ取得には `TenantDatabase.getByteReader()` を使い、コールバック内で `eachBytes()` でチャンク単位に読み取る。

```javascript
/**
 * DB バイナリを一時ファイルに書き出して返却します。
 *
 * @param {String} tableName       - テーブル名
 * @param {String} columnName      - バイナリカラム名
 * @param {String} condition       - WHERE 句（例: 'code = ?'）
 * @param {Array}  params          - バインドパラメータ（例: [DbParameter.string(code)]）
 * @param {String} extension       - ファイル拡張子
 * @param {Object} logger          - Logger インスタンス
 * @return {File|null} 一時ファイル。未登録の場合は null
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

// 呼び出し例:
let logger = Logger.getLogger();
let tempFile = null;
try {
  tempFile = readTenantDatabaseBinary('{テーブル名}', '{バイナリデータ格納カラム名}', '{検索条件（例: id = ?）}', [DbParameter.string('SAMPLE_ID')], 'pdf', logger);
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

Solr インデックスの最適化（optimize）を実行するクラス。
`ContentsSearchManager` は `optimize()` を公開していないため、最適化が必要な場合は `StandardUpdateService` を直接使用する。

```javascript
let StandardUpdateService = Packages.jp.co.intra_mart.foundation.contentssearch.service.StandardUpdateService;
```

**コンストラクタ:**

| コンストラクタ | 説明 |
|-------------|------|
| `StandardUpdateService(String groupName)` | 検索サーバグループ名で初期化 |

`ContentsSearchManager` と同じ `groupName` を渡すこと。

**主要メソッド:**

| メソッド | 引数 | 説明 |
|---------|------|------|
| `optimize()` | なし | インデックスを最適化（デフォルト動作） |
| `optimize(int maxSegments)` | セグメント数（1 以上） | セグメント数を指定して最適化 |

> **最適化のタイミング**: 最適化処理は負荷が高いため頻繁に行うべきではない。クローリング完了後など、コンテンツを大量に登録した後に実施する。

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

### 権限ビルダー

ユーザ・ロール・組織・会社など 9 種類の ACIBuilder が用意されている。
詳細は `reference/aci-builders.md` を参照。

```javascript
let EveryoneACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.EveryoneACIBuilder;
let StandardRoleACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardRoleACIBuilder;

// 全員（認証済みユーザ）
content.addACIBuilder([new EveryoneACIBuilder()]);

// ロール限定（ロールコードを引数で指定）
content.addACIBuilder([new StandardRoleACIBuilder('role_code')]);
```

---

## SSJS (Rhino) 固有の制約と対応策

### varargs メソッドの呼び出し

Rhino 1.7R4 では Java の可変長引数（varargs）に単一値を渡すと解決できない場合がある。
**JavaScript 配列で包んで渡す**こと。

```javascript
// OK: JS 配列で渡す
content.setTypes(['type_a', 'type_b']);
content.addText([row.description]);
content.addAttachment([new PublicStorageAttachment(storage)]);
content.addACIBuilder([new EveryoneACIBuilder()]);

// NG: 単一値をそのまま渡す（解決できない場合がある）
// content.addText(row.description);
```

### 数値型の変換

Rhino は Java の数値型（`int`, `long` 等）を JS Number 型に変換する。Rhino における JS Number は内部的に `java.lang.Double` として扱われる。
`setValue(Fields.INT.toField(...), value)` のような Generics メソッドでは型パラメータが `java.lang.Integer` として解決されるため、`java.lang.Double` から `java.lang.Integer` への変換は Java では自動で行えず型不一致エラーが発生する。
**コンストラクタ** で明示的に Java 数値型を生成して渡すこと。

```javascript
// OK: コンストラクタで生成
new java.lang.Integer(row.price)
new java.lang.Long(row.amount)

// NG: JS Number をそのまま渡す（Rhino が java.lang.Double として扱うため java.lang.Integer と型不一致になる）
// content.setValue(Fields.INT.toField('price'), row.price)
```

### 日付型の変換

DB から取得した TIMESTAMP カラムは `java.sql.Timestamp` 型。
`setValue(DATE フィールド)` は `java.util.Date` を要求するため、`getTime()` で変換する。

```javascript
// OK
new java.util.Date(row.record_date.getTime())

// NG: java.sql.Timestamp をそのまま渡す
// row.record_date
```

### BOOLEAN 型の変換

DB の BOOLEAN/SMALLINT カラムの扱いは DB 製品により異なる（0/1 の整数, `true`/`false` 文字列 等）。

```javascript
// 0/1 の整数値から変換（SMALLINT の場合）
new java.lang.Boolean(parseInt(String(row.is_active), 10) !== 0)

// true/false 文字列から変換
new java.lang.Boolean(row.flag === 'true')
```

### Java List の反復

`getResultContentList()` 等が返す `java.util.List` は `for...in` では反復できない。

```javascript
// OK: size() / get(i) で反復
let list = response.getResultContentList();
for (let i = 0; i < list.size(); i++) {
  let item = list.get(i);
}

// NG
// for (let item in list) { ... }
```
