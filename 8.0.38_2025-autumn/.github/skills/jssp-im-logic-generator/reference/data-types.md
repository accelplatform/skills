# IM-LogicDesigner データ型リファレンス

IM-LogicDesigner のロジックフローで使用可能なデータ型（タイプID）の全量。
`inputDataDefinition` / `outputDataDefinition` / `variablesDataDefinition` の `typeId` や、`constants[].typeId` に指定する。

出典: [IM-LogicDesigner 仕様書 - データ型](https://document.intra-mart.jp/library/iap/public/im_logic/im_logic_specification/texts/function_specification/logic_flow/index.html#function-specification-logic-flow-data-type)

## プリミティブ型

### 文字列・真偽値

| タイプID | データ型 | 説明 |
|---|---|---|
| `string` | String | 文字列 |
| `boolean` | Boolean | 真偽値 |

### 整数

| タイプID | データ型 | 説明 |
|---|---|---|
| `byte` | Byte | 1バイト整数（-128 ~ 127） |
| `character` | Character | 2バイト文字データ（u0000 ~ uffff） |
| `short` | Short | 2バイト整数（-32768 ~ 32767） |
| `integer` | Integer | 4バイト整数（-2147483648 ~ 2147483647） |
| `long` | Long | 8バイト整数 |
| `biginteger` | BigInteger | 任意精度の符号付き整数 |

### 浮動小数点

| タイプID | データ型 | 説明 |
|---|---|---|
| `float` | Float | 4バイト単精度浮動小数点数 |
| `double` | Double | 8バイト倍精度浮動小数点数 |
| `bigdecimal` | BigDecimal | 任意精度の符号付き小数 |

### 日付・時刻

| タイプID | データ型 | 説明 |
|---|---|---|
| `calendar` | Calendar | 日付操作用カレンダー（日時、タイムゾーン情報を含む） |
| `date` | Date | 日時（タイムゾーン情報を含まない） |
| `imdatetime` | IM DateTime | 日時（intra-mart 独自、タイムゾーン情報を含む） |
| `imduration` | IM Duration | 期間 |
| `sqldate` | SQL Date | java.sql.Date に該当する日付型（タイムゾーン情報を含まない） |
| `sqltimestamp` | SQL Timestamp | java.sql.Timestamp に該当する日付型（タイムゾーン情報を含まない） |

### ロケール・タイムゾーン

| タイプID | データ型 | 説明 |
|---|---|---|
| `locale` | Locale | ロケール |
| `timezone` | TimeZone | タイムゾーン |

### データ・ストレージ

| タイプID | データ型 | 説明 |
|---|---|---|
| `binary` | Binary | バイナリデータ |
| `sqlclob` | SQL Clob | java.sql.Clob に該当する型 |
| `storage` | Storage | intra-mart Accel Platform 上で利用可能な Storage |
| `map` | Map | java.util.Map に相当する型 |

### 特殊型

| タイプID | データ型 | 説明 |
|---|---|---|
| `any` | Any | 不明な型。任意の値を受け付ける |

## 型の選び方

### 日付・時刻

**迷ったら `imdatetime` を使う。** 日時＋タイムゾーンを完全に保持するため、最も安全。

| 場面 | 推奨型 |
|---|---|
| 日時の入出力・変数全般 | `imdatetime` |
| Java Calendar との相互変換が必要 | `calendar` |
| タイムゾーン不要で日付のみ | `date` |
| DB カラムが java.sql.Date | `sqldate` |
| DB カラムが java.sql.Timestamp | `sqltimestamp` |
| 期間（日数・時間差など） | `imduration` |

### 整数

**通常は `integer` で十分。** `byte` / `short` はほとんど使わない。

| 場面 | 推奨型 |
|---|---|
| 件数・ID・一般的な整数 | `integer` |
| integer の範囲を超える大きい整数 | `long` |
| long でも足りない任意精度の整数 | `biginteger` |

### 小数

**基本は `bigdecimal` を採用。** 金額など計算誤差が許されない場面では必須。

| 場面 | 推奨型 |
|---|---|
| 金額・税率など精度が必要な計算 | `bigdecimal` |
| パフォーマンス優先で誤差を許容 | `double` |

### データ・ストレージ

| 場面 | 推奨型 |
|---|---|
| メモリ上のバイナリデータ（byte[] 相当） | `binary` |
| ストレージ上のファイル（ファイルパスで参照） | `storage` |
| SQL ユーザ定義のレスポンス（出力値のみ） | `sqlclob` |

**注意:**
- `sqlclob` は SQL を使用しない場合は使わない。
- `storage` 型へのマッピングは `string`（ファイルパス文字列）または `storage` 型のみサポート。他の型からはマッピングできない。

## 複合型

上記プリミティブ以外に、以下の複合型を `typeId` として使用する。
これらは `typeDefinitions` 内で `id` として定義し、`properties` でフィールドを持つ。

| パターン | 説明 | 例 |
|---|---|---|
| `imr_entity` | IM-Repository エンティティ | - |
| `imrepo_entity_*` | エンティティ参照型（imLogicResolveEntitySchema で解決） | `imrepo_entity_search_imprtl_portlet_info_tables_imprtl_portlet_info` |
| `im_logic_object_*` | フロー内ローカルオブジェクト型 | `im_logic_object_1` |
| `jp_co_intra_mart_*` | Java クラスベースの型（タスクの入出力定義内） | `jp_co_intra_mart_foundation_logic_element_authz_AuthorizeAuthzTaskResultObject` |
| `root` | 型定義のルート（entrypoint から参照） | - |

## listingType

`typeId` と組み合わせて `listingType` を指定することで、配列型を表現する。

| listingType | 意味 | 選定条件 |
|---|---|---|
| `none` | 単一値 | 値が1件のみの場合（スカラー値、オブジェクト1個） |
| `list` | リスト型配列 | ユーザ定義の入出力やフロー変数で複数件を扱う場合 |
| `array` | 配列型 | ビルトインタスクの出力定義（Java クラスベースの型）で複数件を返す場合 |

spec で入出力やフロー変数を定義する際は `none` または `list` を使用する。
`array` は主にビルトインタスクのテンプレート出力に現れるため、spec 作成時に明示的に指定する機会は少ない。
