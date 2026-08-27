---
applyTo: "**/entity/*.java"
description: "Entity クラス規約（Mirage ORM互換のpublicフィールド、監査証跡フィールド、ID採番方針）"
---

# Entity クラス規約

> **適用範囲**: 🟡 **文脈依存** — Entity クラス（`entity` パッケージ配下）を生成・編集する際に適用。ドメインモデルやその他の Java クラスでは読まなくてよい。

## エンティティクラス設計

- **必須** Mirage ORM互換性のためpublicフィールドを使用すること（getter/setterではなく直接アクセス）
  - 理由: Mirage ORMはpublicフィールドに直接値をマッピングする設計。private + getter/setterでは正しくマッピングされない
- **必須** デフォルトコンストラクタ（引数なし）を必ず用意すること
  - 理由: ORMがリフレクション経由で `Class.newInstance()` を使いエンティティを生成するため
- **必須** `GenerationType.APPLICATION` を使用すること。他のGenerationTypeは使用禁止
  - 理由: intra-mart Accel PlatformではDB側の自動採番（IDENTITY/SEQUENCE）ではなく、アプリケーション側でID生成を管理する設計方針。これによりDB非依存性とID事前取得が可能になる
- **必須** `@Table`, `@Column`, `@PrimaryKey` アノテーションを正しく付与すること

## 監査証跡フィールド（必須）

以下の4フィールドは全てのエンティティに必ず含めること。欠落している場合は実装前に追加を指摘すること。

```java
@Column(name = "create_user_cd")
public String createUserCd;

@Column(name = "create_date")
public Timestamp createDate;

@Column(name = "record_user_cd")
public String recordUserCd;

@Column(name = "record_date")
public Timestamp recordDate;
```

- `createUserCd`, `createDate`: レコード作成時の監査証跡
- `recordUserCd`, `recordDate`: レコード更新時の監査証跡
- AbstractDAOの基本メソッド（insert/update）使用時はこれらのフィールドが自動設定される。手動設定は禁止

## フィールドの型

- 文字列: `String`
- 日付/タイムスタンプ: `java.sql.Timestamp`（`java.util.Date` や `java.time.LocalDateTime` は使用しない — Mirage ORM非対応）
- 整数: `int`（小さな値）, `long`（大きな値・ID系）— DDLの型に合わせる
- 小数/金額: `java.math.BigDecimal`（**必須** — `double`/`float` は丸め誤差があるため金額・精密計算には使用禁止）
- フラグ: `String`（"0"/"1" 等、DBカラムに合わせる。Javaの `boolean` にマッピングしない）
- 列挙値: `String`（DBカラムの値をそのまま格納。Java enum への変換はドメインモデル層で行う）

### DB型→Java型 対応表

| DB型 | Java型 | 備考 |
|---|---|---|
| VARCHAR / NVARCHAR | `String` | |
| TIMESTAMP / DATETIME | `java.sql.Timestamp` | |
| INTEGER / INT | `int` または `long` | |
| DECIMAL / NUMERIC | `java.math.BigDecimal` | double禁止 |
| CHAR(1) フラグ | `String` | "0"/"1" |

## null処理

- エンティティのpublicフィールドはnull許容（DBのNULLABLEに対応）
- NOT NULLカラムに対応するフィールドでも、Java側ではnull制約を設けない（DAO層/DB側で制約を担保）

## エンティティとドメインモデルの違い

| 観点 | エンティティ（Entity） | ドメインモデル（Domain Model） |
|---|---|---|
| 所属レイヤ | インフラストラクチャ層 | ドメイン層 |
| 目的 | DBテーブルとの1:1マッピング | ビジネスロジックの表現 |
| フィールド | publicフィールド（ORM要件） | privateフィールド + getter |
| 可変性 | ミュータブル（ORMが値を設定） | イミュータブル推奨 |
| バリデーション | なし（DB制約に依存） | ビジネスルールを実装 |
| 変換 | リポジトリ層で相互変換 | リポジトリ層で相互変換 |

エンティティはDB構造の反映であり、ビジネスロジックを持たせない。ビジネスロジックはドメインモデルに実装すること。
