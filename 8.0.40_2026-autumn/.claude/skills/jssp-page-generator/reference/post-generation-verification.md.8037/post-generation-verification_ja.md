---
paths:
  - "src/main/jssp/**/*.js"
  - "src/main/jssp/**/*.sql"
  - "src/main/jssp/**/*.html"
---

# 生成後の必須検証ステップ

コード生成完了後、ユーザに報告する**前に**以下の検証を自動実行すること。
各ステップは Grep ツール等を使い、生成したファイルに対して機械的に確認する。

## 1. SQL ファイル検証

### 1-1. バインドプレースホルダの構文

生成した `.sql` ファイルに `/*$` が含まれていないことを確認する。

- `/*param*/'dummy'` — バインドプレースホルダ（PreparedStatement 方式）。**こちらを使う**
- `/*$param*/dummy` — 直接埋め込み。ORDER BY のカラム名等、バインド変数が使えない箇所**のみ**許可（ホワイトリスト検証必須）

**検証方法:** 生成した SQL ファイルに対して `/*$` を grep し、意図しない直接埋め込みがないことを確認する。

### 1-2. `/*BEGIN*/` ブロックの正しい使用

`/*BEGIN*/` は WHERE 句の **全条件** が `/*IF*/〜/*END*/` に囲まれている場合のみ使用する。
固定条件（常に評価される `status = '1'` 等）がある場合は `/*BEGIN*/` を使用してはならない。

```sql
-- NG: /*BEGIN*/ 内に固定条件がある（r.status = '1'）→ SQL 構文エラーになる
WHERE
  /*BEGIN*/
  r.status = '1'
  /*IF roomId != null*/
  AND r.room_id = /*roomId*/'dummy'
  /*END*/
  /*END*/

-- OK: 固定条件は /*BEGIN*/ の外に置き、WHERE を直書きする
WHERE
  r.status = '1'
  /*IF roomId != null*/
  AND r.room_id = /*roomId*/'dummy'
  /*END*/

-- OK: 全条件が /*IF*/ で囲まれている場合は /*BEGIN*/ を使用できる
/*BEGIN*/
WHERE
  /*IF userId != null*/
  user_id = /*userId*/'dummy'
  /*END*/
/*END*/
```

**検証方法:** 生成した `.sql` ファイルで `/*BEGIN*/` を grep し、その直下に `/*IF*/` で囲まれていない SQL 条件行がないか確認する（`validate-jssp-code.js` の `JSSP-SQL-001` が自動検出する）。

### 1-3. ダミー値の構文

バインドプレースホルダのダミー値が、SQL として正しい構文になっていることを確認する。

- 文字列カラム: `/*param*/''`（シングルクォートで囲む）
- 数値カラム: `/*param*/0`

## 2. tsc 型チェック

生成した `.js` ファイルに対して TypeScript コンパイラによる型検査を実行する。
`d.ts/` に定義された API の型情報を使い、**存在しないプロパティへのアクセス・型の不一致**を静的に検出できる。
`validate-jssp-code.js` が検出できないクラスのミスマッチ（例: `result.data === 0` → 正しくは `result.countRow`）もここで拾える。

```bash
# 機能単位で実行（例: room 機能全体）
npm run check:types:room

# 任意のパスを対象にする場合
bash .claude/skills/jssp-page-generator/scripts/check-types.sh src/main/jssp/src/{機能名}/
```

**0 issues になるまで修正する。**

抑制されるエラー（誤検知）: `TS2304`（d.ts に未定義のクラス）、`TS2451/TS6200`（バインド変数の再宣言）、`type 'unknown'/'any'` 上のプロパティエラー。
それ以外のエラーは実バグの可能性が高いため必ず修正すること。

**特に検出されやすいパターン:**

| エラー例 | 原因 | 修正 |
|---|---|---|
| `data` と `number` に重複なし（TS2367） | `executeByTemplate` の戻り値 `data` は配列なので `=== 0` と比較できない | `countRow === 0` に変更 |
| プロパティ `xxx` は型 `YYY` に存在しない（TS2339） | d.ts に存在しないメソッド・プロパティを推測で呼び出している | d.ts を確認して正しい名前に修正 |

## 3. ファンクションコンテナ検証（DB アクセス）

### 2-1. DbParameter ラップ

**すべての DB アクセスメソッド**のパラメータが `DbParameter.xxx()` でラップされていることを確認する。

| メソッド | パラメータ形式 | 例 |
|---|---|---|
| `db.select(sql, params)` / `db.execute(sql, params)` | `DbParameter[]`（**配列**） | `[DbParameter.string(userCd), DbParameter.string(fiscalYear)]` |
| `db.executeByTemplate(path, params)` / `db.fetchByTemplate(path, params)` | `{ key: DbParameter }`（**オブジェクト**） | `{ userId: DbParameter.string(userId) }` |

**検証方法:** 生成した `.js` ファイルで `db.select` / `db.execute` / `executeByTemplate` / `fetchByTemplate` の呼び出し箇所を検索し、パラメータの全値が `DbParameter.string()`、`DbParameter.number()` 等で始まっていることを確認する。
生の文字列・数値を直接渡すと `ClassCastException` が発生する。

### 2-2. DbParameter の型選択

DDL のカラム型と `DbParameter` の型メソッドが一致していることを確認する。

| DDL カラム型 | DbParameter メソッド |
|---|---|
| `VARCHAR` / `CHAR` / `TEXT` | `DbParameter.string()` |
| `INTEGER` / `BIGINT` | `DbParameter.number()` |
| `DECIMAL` / `NUMERIC` | `DbParameter.number()` |
| `DATE` | `DbParameter.date()` |
| `TIMESTAMP` | `DbParameter.timestamp()` |

**特に注意:**
- 値が数字のみでも、DDL が `VARCHAR` なら `DbParameter.string()` を使う（例: 年度 `VARCHAR(4)`）
- `DbParameter.number()` の引数は **Number 型でなければならない**。`userParam`（画面フォームから渡される値）は全て文字列型のため、必ず `Number()` で変換してから渡すこと（例: `DbParameter.number(Number(userParam.quantity))`）。変換しないと `IllegalArgumentException` が発生する

## 3. ファンクションコンテナ検証（API 呼び出し）

### 3-1. d.ts との照合

生成した `.js` ファイルで使用しているグローバルクラス・API について、以下を d.ts で確認する。

- **static vs instance**: `new Xxx().method()` と `Xxx.method()` の混同がないか
- **メソッド名**: d.ts に存在するメソッド名か（推測で書いていないか）
- **引数の型と個数**: d.ts の引数定義と一致しているか

**検証方法:** 生成した `.js` ファイルで `new ` を grep し、各クラスのインスタンス化が d.ts の定義と合致するか確認する。
特に `DateTimeFormatter`、`Format` 等のユーティリティクラスは static メソッドが多いため注意。

**特に確認が必要なクラス（実績上の誤りやすい API）:**

| クラス | NG パターン | 正しい使い方 |
|---|---|---|
| `Identifier` | `new Identifier().getString()` | `Identifier.get()` （静的メソッド） |

### 3-2. Rhino の Date 文字列パース制限

Rhino では `new Date('YYYY-MM-DD HH:mm:ss')` や `new Date('YYYY-MM-DDTHH:mm:ss')` のパースが不安定で `Invalid Date` になる場合がある。
`getMinutes()` 等が `NaN` を返し、以降の比較演算が全て誤動作する。

**検証方法:** 生成した `.js` ファイルで `new Date(` を grep し、引数が変数（文字列型の request パラメータやDB値）の場合は以下の `parseLocalDateTime` ヘルパーで置き換える。

```javascript
// NG: Rhino で Invalid Date になる場合がある
let startDate = new Date(startAt);                   // 'YYYY-MM-DD HH:mm:ss' 形式
let startDate = new Date(startAt.replace(' ', 'T')); // 'YYYY-MM-DDTHH:mm:ss' 形式もNG

// OK: 多引数コンストラクタは常にローカル日時として確実に動作する
function parseLocalDateTime(str) {
  let parts = str.split(/[-: ]/);
  return new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10),
    parseInt(parts[3], 10),
    parseInt(parts[4], 10),
    parseInt(parts[5], 10)
  );
}
let startDate = parseLocalDateTime(startAt);
```

`"YYYY-MM-DD HH:mm:ss"` 形式の日時文字列を扱う全ての `.js` ファイルに `parseLocalDateTime` ヘルパーを定義し、`new Date(変数)` の代わりに使用すること。

### 3-3. DB タイムスタンプの正規化

TIMESTAMP カラムの値を JSON レスポンスやフォームフィールドに返す場合、JDBC ドライバによって返却型が異なる（文字列 `"2026-04-21 10:00:00.0"` / Date オブジェクト / ISO 文字列等）ため、必ず以下の `formatTimestamp` ヘルパーで正規化すること。

`String(dateObject)` は `"Tue Apr 21 2026 10:00:00 GMT+0900"` 等を返すため、Date オブジェクトを直接文字列変換してはならない。

```javascript
function formatTimestamp(value) {
  if (value instanceof Date) {
    let year    = value.getFullYear();
    let month   = ('0' + (value.getMonth() + 1)).slice(-2);
    let day     = ('0' + value.getDate()).slice(-2);
    let hours   = ('0' + value.getHours()).slice(-2);
    let minutes = ('0' + value.getMinutes()).slice(-2);
    let seconds = ('0' + value.getSeconds()).slice(-2);
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
  }
  let str = String(value).replace('T', ' ');
  if (str.length > 19) {
    str = str.substring(0, 19);
  }
  return str;
}

// 使用例
startAt: formatTimestamp(row.start_at),
endAt:   formatTimestamp(row.end_at),
```

**検証方法:** 生成した `.js` ファイルで TIMESTAMP カラム（`_at`, `_date`, `start`, `end` 等）を JSON に含める箇所を grep し、`formatTimestamp()` でラップされているか確認する。

### 3-4. 共通モジュールの読み込みは `load()` を使う（`include()` は誤用）

別ファイル（`common/` 配下等）で定義した定数・関数を他の `.js` から利用する場合、**必ず `load(path)` を使用する**こと。`include(path)` を使うと、呼び出し先スクリプトが**独立スコープで実行**されるため、そこで宣言された変数・関数は呼び出し元から一切参照できず、実行時に `ReferenceError: "XXX" is not defined` となる。

| 関数 | 挙動 | 用途 |
|------|------|------|
| `load('xxx/common/yyy')` | 呼び出し先の変数・関数を呼び出し元スコープに取り込む | **共通モジュールの読み込み** |
| `include('xxx/view/zzz')` | 呼び出し先を独立スコープで実行し、その `init()` を呼ぶ | ページ遷移・画面フォワード |

```javascript
// OK: 共通モジュールは load() で読み込む
load('room/common/rm_constants');
load('room/common/rm_datetime');

function init(request) {
  // rm_constants.js のトップレベル変数を参照できる
  let errorCode = RM_ERROR_SYSTEM;
}

// NG: include() だと呼び出し先の変数・関数が見えない
include('room/common/rm_constants');  // RM_ERROR_SYSTEM は undefined のまま
```

共通モジュールのトップレベル定数は **`let` で宣言してよい**。`load()` は呼び出し先の関数・変数を呼び出し元のスコープに取り込むため、`let` でも問題なく参照できる（`include()` ではスコープが分離されるため参照不可になる）。つまり解決すべきは **`load()` を使うこと**であって、宣言キーワードを `var` に変える必要はない。

```javascript
// rm_constants.js（共通モジュール）
let RM_ERROR_SYSTEM = 'ROOM-E999';   // OK: load() 先から参照可能

// 呼び出し側（view / api / job）
load('room/common/rm_constants');
// これ以降 RM_ERROR_SYSTEM を参照できる
```

**検証方法:** `validate-jssp-code.js` の `JSSP-JS-024` が `include('**/common/**')` パターンを自動検出する。

#### `load()` の引数に `.js` 拡張子を含めない

`load()` は引数のパス末尾に **内部で `.js` を自動付与する** 仕様。したがって `load('/room/common/foo.js')` と書くと `/room/common/foo.js.js` を解決しようとして `FileNotFoundException: Function-Container not found: ..._foo_95_js_46_js </room/common/foo.js.js>` になる。

```javascript
// NG: 拡張子を明示 → 実行時 FileNotFoundException
load('/room/common/datetime_util.js');

// OK: 拡張子なし
load('/room/common/datetime_util');
```

- 2WaySQL の `executeByTemplate` / `fetchByTemplate` に渡すパスも同様に `.sql` を付けないルール（`jssp-2way-sql.md` 参照）。intra-mart の外部リソース参照パス指定は **拡張子を含めないのが原則** と覚える
- 機能フォルダ起点の絶対パス（先頭スラッシュあり）で統一する: `load('/room/common/xxx')`

**検証方法:** `validate-jssp-code.js` の `JSSP-JS-025` が `load('...*.js')` パターンを自動検出する。

### 3-7. Transaction.begin の戻り値チェック（必須）

`Transaction.begin(callback)` は **例外を再スローせず `DatabaseResult` を返す** 仕様。
コールバック内で `throw` された例外は自動ロールバックされるが呼び出し元には伝搬しないため、
戻り値を無視すると失敗が検知できず、「HTTP 200 成功だが DB には何も入っていない」状態が発生する。

#### 必須パターン

戻り値を変数で受け、`isSuccess()` で失敗判定する。業務例外はコールバック内でキャプチャして再スローし、トランザクション後に外側へ投げ直す。

```javascript
function executeCreate(data) {
  let reservationId = Identifier.get();
  let now = new Date();
  let businessError = null;

  let txResult = Transaction.begin(function() {
    try {
      let db = new TenantDatabase();
      ensureNoOverlap(db, data.roomId, data.startAt, data.endAt, null);
      insertReservation(db, reservationId, data, now);
    } catch (e) {
      businessError = e;   // 業務例外を外側に運ぶ
      throw e;             // ロールバックのため再スロー
    }
  });

  if (businessError) {
    throw businessError;                // 業務メッセージをフロントに返す
  }
  if (!txResult.isSuccess()) {
    throw new Error('DB エラー: ' + (txResult.errorMessage || ''));
  }

  return { reservationId: reservationId };
}
```

#### アンチパターン

```javascript
// NG: 戻り値無視 → 失敗しても例外が上がらず、成功扱いで HTTP 200 が返る
Transaction.begin(function() {
  let db = new TenantDatabase();
  ensureNoOverlap(...);       // ここで throw しても...
  insertReservation(...);
});
// 呼び出し元には何も伝わらない
return { reservationId: reservationId };
```

**検証方法:** `validate-jssp-code.js` の `JSSP-JS-026` が戻り値を受けていない `Transaction.begin(...)` 呼び出しを自動検出する。

### 3-8. Rhino における JDBC `java.sql.Timestamp` の扱い

Rhino 環境で `db.executeByTemplate` / `db.select` の結果行の TIMESTAMP カラム（`row.xxx_at` 等）は **`java.sql.Timestamp` オブジェクト** として返る。これは **Java のクラス**であり、JavaScript の `Date` とは別物。

#### 重要な挙動

1. **`instanceof Date` は false を返す** — JavaScript の Date 判定に使えない
2. **`String(timestamp)` は `"2026-04-20 10:00:00.0"` 形式** — 末尾にミリ秒 `.0` が付く
3. JavaScript の `getFullYear()` / `getMonth()` / `getDate()` メソッドは**存在しない**

#### 推奨実装

TIMESTAMP 値を扱うユーティリティ関数では、`instanceof Date` ではなく **`typeof value.getFullYear === 'function'` で JavaScript Date を判定** し、それ以外は `String()` → 正規表現でパースする。

```javascript
function parseLocalDateTime(value) {
  if (!value) return null;
  // 末尾の ".N"（ミリ秒）を許容する
  let pattern = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/;
  let matched = pattern.exec(value);
  if (!matched) return null;
  return new Date(
    parseInt(matched[1], 10),
    parseInt(matched[2], 10) - 1,
    parseInt(matched[3], 10),
    parseInt(matched[4], 10),
    parseInt(matched[5], 10),
    matched[6] ? parseInt(matched[6], 10) : 0,
    0
  );
}

function formatTimestamp(date) {
  if (!date) return '';
  let d = null;
  if (typeof date.getFullYear === 'function') {
    d = date;                               // JavaScript Date
  } else {
    d = parseLocalDateTime(String(date));   // java.sql.Timestamp → 文字列経由でパース
  }
  if (!d) return '';
  // ... "YYYY-MM-DD HH:mm:ss" を組み立てて返す
}
```

**アンチパターン（Rhino で動かない）:**

```javascript
// NG: instanceof Date は Java Timestamp に対して false
let d = (date instanceof Date) ? date : parseLocalDateTime(String(date));

// NG: parseLocalDateTime の正規表現が ".0" 付きにマッチしない
let pattern = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/;
```

**検証方法:** この問題は静的検出が難しいため、**カレンダー・一覧画面で実データが表示されているか** を必ず画面で確認する。`formatTimestamp()` が空文字を返してフロントに届くと、カレンダー上の日付マッチングが失敗して「空」に見える。

### 3-9. PostgreSQL の型厳格性（バインドパラメータ型の厳密選択）

PostgreSQL は **暗黙の型変換を行わない** ため、DDL カラムの型と `DbParameter.xxx()` の型が厳密に一致している必要がある。Oracle / SQLServer では暗黙変換されるため開発時は気付きにくく、PostgreSQL へ持っていった際に初めて顕在化する落とし穴。

#### 典型的なエラー

```
ERROR: 演算子が存在しません: timestamp without time zone >= character varying
  ヒント: 指定した名称と引数の型に合う演算子がありません。明示的な型キャストが必要かもしれません。
```

原因: TIMESTAMP カラムに対して `DbParameter.string("2026-04-20 10:00:00")` を渡し、`timestamp >= varchar` の比較演算子が存在しなかった。

#### 必須の対応表

| DDL カラム型 | 正しい DbParameter | よくある誤り |
|---|---|---|
| `TIMESTAMP` | `DbParameter.timestamp(Date)` | `DbParameter.string("YYYY-MM-DD HH:mm:ss")` |
| `DATE` | `DbParameter.date(Date)` | `DbParameter.string("YYYY-MM-DD")` |
| `DECIMAL` / `NUMERIC` | `DbParameter.number(value)` | `DbParameter.string(String(value))` |
| `CHAR(1)` フラグ | `DbParameter.string('0' / '1')` | `DbParameter.boolean(bool)` |

#### 実装パターン

文字列で受け取った日時はサーバ側で `parseLocalDateTime()` により Date に変換してから `DbParameter.timestamp()` に渡す。

```javascript
// OK: TIMESTAMP カラム → DbParameter.timestamp(Date)
let params = {
  rangeFrom: DbParameter.timestamp(parseLocalDateTime(request['rangeFrom'])),
  rangeTo:   DbParameter.timestamp(parseLocalDateTime(request['rangeTo']))
};

// NG: PostgreSQL で型不一致エラー
let params = {
  rangeFrom: DbParameter.string(request['rangeFrom']),
  rangeTo:   DbParameter.string(request['rangeTo'])
};
```

**検証方法:** `validate-jssp-code.js` の `JSSP-JS-027` が `DbParameter.string(startAt|endAt|rangeFrom|rangeTo|startDate|endDate|createdAt|updatedAt|...)` のような日時系変数名パターンを warning 検出する。変数名から判定するヒューリスティック検出のため、network `DDL` と SQL を突合して手動確認することも推奨。

### 3-5. intra-mart 内部テーブル参照禁止

生成した `.sql` ファイルに `im` で始まるテーブル名（`imm_`、`imw_`、`imr_`、`imjob_` 等）が含まれていないことを確認する。
intra-mart 製品が管理する内部テーブルは公開 API ではないため、バージョンアップ時にスキーマが変更される可能性がある。
ユーザから明確に「このテーブルを参照して」と指示された場合のみ許可する。

**検証方法:** 生成した SQL ファイルの FROM / JOIN 句に対して `im` で始まるテーブル名を grep する。

## 4. imACMSearch 連携検証

画面で `imACMSearch` を使ってユーザを選択・保存している場合、以下を確認する。

### 4-1. 取得 API でのユーザ名解決

imACMSearch で選択した `userId` はDBに保存されるが、`userName` はDB（`reservation_participant` 等）には存在しない。
編集画面で参加者タグ等にユーザ名を表示するには、取得 API 側で `IMMUserManager.getUser()` を呼び出してユーザ名を解決し、レスポンスに `userName` を含める必要がある。

**検証方法:** `imACMSearch` を使う入力項目（参加者、担当者等）が画面にある場合、対応する取得 API（GET 系）の戻り値に `userId` と `userName` の両方が含まれているか確認する。`userId` のみ返している場合は `IMMUserManager.getUser()` による名前解決を追加する。

```javascript
// NG: userId のみ
participantList.push({ userId: participantResult.data[i].user_id });

// OK: IMMUserManager でユーザ名を解決して返す
participantList.push({
  userId:   userId,
  userName: getUserName(userId, localeId, tenantLocale)
});

function getUserName(userId, localeId, tenantLocale) {
  let result = new IMMUserManager().getUser({ userCd: userId }, new Date());
  if (!result.error && result.data && result.data.locales) {
    let locales    = result.data.locales;
    let localeInfo = locales[localeId] || locales[tenantLocale] || locales[Object.keys(locales)[0]];
    if (localeInfo && localeInfo.userName) {
      return localeInfo.userName;
    }
  }
  return userId;
}
```

**`getUser()`（単数）vs `getUsers()`（複数）の注意:**
- `IMMUserManager.getUsers()` はバルク取得だが、サーバ環境・バージョンによって `data` が空配列または `error: true` を返す場合がある（無音失敗）
- 参加者リスト等でユーザ名を確実に解決する必要がある場合は **`getUser()`（単数）をループで呼ぶ** こと
- `result.data.locales[locale].userName` でアクセスする（`displayName` プロパティは `UserListNodeInfo` のみに存在し、`UserInfo` には存在しない。`JSSP-JS-019` が誤用を自動検出する）
- `locales` 自体の null チェック＋ロケールフォールバックを必ず入れること（`jssp-function-container.md` 参照）
- 取得失敗時は `userId` をフォールバックとして使うこと（例外を握りつぶさず `warn` ログを出力すること）

### 4-2. 画面側の初期化コード

取得 API のレスポンスから参加者リスト等を初期化するとき、`userName` を参照していること。

```javascript
// NG: フォールバックが userId 固定
participants = list.map(function(p) { return { userId: p.userId, userName: p.userId }; });

// OK: API から userName を受け取り、なければ userId をフォールバック
participants = list.map(function(p) { return { userId: p.userId, userName: p.userName || p.userId }; });
```

### 4-3. グローバルコールバックと DOMContentLoaded スコープのブリッジ

imACMSearch のコールバック関数はグローバルスコープに定義する必要があるが、`DOMContentLoaded` 内で定義した関数はグローバルから直接参照できず `ReferenceError` になる。
コールバックから `DOMContentLoaded` 内の関数を呼び出す場合は、`window._functionName` として公開するブリッジパターンを使用すること。

**検証方法:** `imACMSearch` を使う画面で、グローバルコールバック関数が `DOMContentLoaded` 内の関数を `window._` 経由でなく直接呼び出していないか確認する。`validate-jssp-code.js` の `JSSP-HTML-017` が自動検出する。

```javascript
// NG: グローバルコールバックから DOMContentLoaded スコープの関数を直接呼び出し
function callbackUserSearch(result) {
  addSelectedUser(result[0].data.user_cd, result[0].data.user_name); // ReferenceError
}
window.callbackUserSearch = callbackUserSearch;

document.addEventListener('DOMContentLoaded', function() {
  function addSelectedUser(userId, userName) { /* ... */ }
  // ← window._addSelectedUser のブリッジ設定が漏れている
});

// OK: window._ ブリッジ経由で呼び出す
function callbackUserSearch(result) {
  if (typeof window._addSelectedUser === 'function') {
    window._addSelectedUser(result[0].data.user_cd, result[0].data.user_name);
  }
}
window.callbackUserSearch = callbackUserSearch;

document.addEventListener('DOMContentLoaded', function() {
  function addSelectedUser(userId, userName) { /* ... */ }
  window._addSelectedUser = addSelectedUser; // ← ブリッジ設定
});
```

## 5. 画面（プレゼンテーションページ）検証

### 5-1. imdsConfirm のインライン定義

`imdsConfirm()` はプラットフォームのグローバル関数として提供されていない。
`imdsConfirm(...)` を呼び出す `.html` ファイルには、必ずページ内に `function imdsConfirm(...)` のインライン定義を含めること。

**検証方法:** 生成した `.html` ファイルで `imdsConfirm(` を grep し、同一ファイル内に `function imdsConfirm(` が存在するか確認する。
`validate-jssp-code.js` の `JSSP-HTML-015` が自動検出する。

```javascript
// 各画面に以下の定義を含めること
function imdsConfirm(message, title, onOk, onCancel, options) {
  let modal = document.getElementById('confirmModal');
  document.getElementById('confirmMessage').textContent = message;
  document.getElementById('confirmTitle').textContent   = title || '確認';
  modal.style.display = 'flex';
  document.getElementById('confirmOk').onclick = function() {
    modal.style.display = 'none';
    if (typeof onOk === 'function') onOk();
  };
  document.getElementById('confirmCancel').onclick = function() {
    modal.style.display = 'none';
    if (typeof onCancel === 'function') onCancel();
  };
}
```

また、`imdsConfirm` が参照する確認モーダルの HTML（`id="confirmModal"` を持つ `<div>`）も同一ファイルに存在することを確認する。

### 5-2. 画面間パラメータ渡しは送受両側をセットで実装する

画面 A が画面 B へ URL パラメータを渡すリンク・ボタンを実装したとき、**画面 B 側でそのパラメータを受け取り処理するコードも同じタスクで実装すること**。
送る側だけを実装して受け取り側を別タスクに先送りすると、ボタン押下後に何も起きない（パラメータが無視される）という不具合が確認されなくなる。

**ルール:**
- 画面 A に `?roomId=xxx&startAt=yyy` 等のクエリを付けたリンクを実装したら、画面 B の `DOMContentLoaded`（または `init()`）でそのパラメータを読み取り、フォームへの事前入力やダイアログのオープン等の処理まで実装する
- 受け取り側の実装を別タスクに分ける場合は、送る側のコードに `// TODO: 画面B側でroomId/startAt/endAtを受け取る処理を実装すること` を必ず残す

```javascript
// NG: 画面A でパラメータを URL に付けただけで、画面B側の受け取りが未実装
// calendar.html?roomId=R001&startAt=2026-05-01+09:00&endAt=2026-05-01+10:00
// → カレンダー画面を開いてもダイアログが表示されない（パラメータが読まれない）

// OK: 画面A（空き室検索）と画面B（カレンダー）を同じタスクで実装する
// 画面A 側: URLを組み立てて遷移
const url = '/room/reservation/calendar?roomId=' + encodeURIComponent(roomId)
  + '&startAt=' + encodeURIComponent(startAt)
  + '&endAt='   + encodeURIComponent(endAt);
location.href = url;

// 画面B 側: DOMContentLoaded + setTimeout でパラメータを受け取りダイアログを開く
(function() {
  const params  = new URLSearchParams(location.search);
  const roomId  = params.get('roomId');
  const startAt = params.get('startAt');
  const endAt   = params.get('endAt');
  if (!roomId || !startAt || !endAt) { return; }
  // 複数の DOMContentLoaded ハンドラ（会議室セレクト初期化等）が全て完了してから開く
  setTimeout(function() {
    const startParts = startAt.split(' ');
    const endParts   = endAt.split(' ');
    openCreateDialog(
      startParts[0],
      startParts[1] ? startParts[1].substring(0, 5) : '09:00',
      { roomId: roomId, endDate: endParts[0], endTime: endParts[1] ? endParts[1].substring(0, 5) : '10:00' }
    );
  }, 0);
})();
```

**検証方法:** 生成したコードに `location.href = '...'` や `<a href="...?xxx=` のような画面遷移コードがある場合、遷移先の `.html` ファイルでそのクエリパラメータを `URLSearchParams` / `request['xxx']` で読み取っているか確認する。読み取りコードが存在しない場合は実装漏れ。

## 6. 画面検証（IM-Workflow）

IM-Workflow 画面を生成した場合は、以下を順に実行する。

1. `validate-workflow-code.js` を実行し、0 error を確認する
2. `.claude/skills/jssp-im-workflow-usage/reference/screen-generation-checklist.md` の全項目を実行する
