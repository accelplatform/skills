---
paths:
  - "**/*.java"
---

# 命名規則（Java）

> **適用範囲**: 🟢 **常時** — パッケージ・クラス・メソッド・変数の命名すべてに適用。

## 命名規則一覧

| 対象 | 規則 | 例 |
|------|------|-----|
| パッケージ名 | 全て小文字、区切りはドット | `jp.co.intra_mart.sample.service` |
| クラス名 / インタフェース名 | パスカルケース | `UserService`, `Repository` |
| メソッド名 | キャメルケース | `getUserInfo`, `validateInput` |
| 変数名 | キャメルケース | `userId`, `itemList` |
| 定数（`static final`） | 大文字スネークケース | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT` |
| 型パラメータ | 大文字1文字 | `T`, `E`, `K`, `V` |

## クラス名・インタフェース名

### レイヤ別のサフィックス

| レイヤ | サフィックス | 例 |
|---|---|---|
| エンティティ | `Entity` | `UserEntity`, `CategoryEntity` |
| ドメインモデル | なし（ドメイン名そのまま） | `User`, `Category` |
| サービス | `Service` | `UserService`, `CategoryService` |
| リポジトリ | `Repository` | `UserRepository`, `CategoryRepository` |
| DAO | `DAO` | `UserDAO`, `CategoryDAO` |
| REST API エンドポイント | `Endpoint` | `UserEndpoint` |
| バッチジョブ | `Job` | `CategoryBatchJob` |
| 例外 | `Exception` | `CategoryServiceException`, `RepositoryException` |
| リクエスト/レスポンス | `Request` / `Response` | `UserRequest`, `UserResponse` |

### インタフェースと実装クラス

- インタフェース名に `I` プレフィックスは付けない（Java の慣習に反するため）
  - 良い例: `interface Repository` / `class RepositoryImpl implements Repository`
  - 悪い例: `interface IRepository`
- 実装クラスが1つしかない場合、無理に `Impl` サフィックスを付けず実装内容が分かる具体的な名前にしてもよい（例: `StandardCategoryRepository`）

## メソッド名

### 命名パターン

| プレフィックス | 用途 | 例 |
|--------------|------|-----|
| `get` | データ取得 | `getUserInfo`, `getItemList` |
| `set` | データ設定 | `setUserStatus`, `setDefaultValue` |
| `is` / `has` | 真偽値を返す | `isValid`, `hasPermission` |
| `validate` | 検証処理 | `validateInput`, `validateUserData` |
| `create` | 新規作成 | `createUser`, `createOrder` |
| `update` | 更新処理 | `updateUser`, `updateStatus` |
| `delete` | 削除処理 | `deleteUser`, `deleteItem` |
| `find` / `search` | 検索処理（`find`: 単一件、`search`: 複数件・条件検索） | `findById`, `searchUsers` |
| `convert` / `to` | 変換処理 | `convertToJson`, `toEntity` |
| `format` | 整形処理 | `formatDate`, `formatNumber` |

- `find` 系メソッドは対象が存在しない場合 `null` または `Optional` を返す（例外をスローしない）。存在しないこと自体がエラーとなる場合のみ `get` 系メソッドで例外をスローする

## 変数名

良い例:
```java
final String userId = "user001"; // 意味が明確
final List<User> userList = new ArrayList<>(); // 複数形でリストを表現
final boolean isActive = true; // 真偽値は is/has プレフィックス
final int maxRetryCount = 3; // 意味のある名前
final Timestamp startDate = new Timestamp(System.currentTimeMillis()); // 日付であることが明確
```

悪い例:
```java
final String a = "user001"; // 意味不明
final List<User> data = new ArrayList<>(); // 何のデータか不明
final boolean flag = true; // 何のフラグか不明
final User tmp = getUser(); // 一時変数の乱用
final List<User> list1 = new ArrayList<>(); // 連番は避ける
```

## 定数

```java
private static final int MAX_RETRY_COUNT = 3;
private static final long DEFAULT_TIMEOUT = 30000L;
private static final String STATUS_ACTIVE = "1";
private static final String STATUS_INACTIVE = "0";
private static final String ERROR_CODE_NOT_FOUND = "E001";
private static final String ERROR_CODE_INVALID_INPUT = "E002";
```

## パッケージ構成

レイヤ単位でパッケージを分割する。

```
jp.co.intra_mart.sample
├── entity          // エンティティ（DBマッピング）
├── model           // ドメインモデル
├── repository      // リポジトリ（DBアクセス）
├── dao             // DAO（im_mirage によるテーブル操作・SQL実行）
├── service         // サービス（ビジネスロジック）
├── endpoint        // REST API エンドポイント
├── job             // バッチジョブ
└── exception       // 例外クラス
```

## 省略形の禁止

変数名・メソッド名・引数名は **省略せずフルスペルで書く** ことを原則とする。
省略すると意味の取り違えやコードレビュー時の認知負荷増加につながるため、文字数の短さよりも明確さを優先する。

### 禁止する省略形の例

| NG: 省略形 | OK: フルスペル |
|----------|-------------|
| `btn` | `button` |
| `msg` | `message` |
| `err` / `e`（catch 引数を除く） | `error` |
| `req` | `request` |
| `res` / `resp` | `response` |
| `idx` | `index` |
| `cnt` | `count` |
| `num` | `number` |
| `str` | `string` |
| `val` | `value` |
| `param` | `parameter`（複数形は `parameters`） |
| `prop` | `property` |
| `arr` | `array` |
| `obj` | `object` |
| `func` / `fn` | `function` |
| `ctx` | `context` |
| `cfg` / `conf` | `config` / `configuration` |
| `tmp` | `temporary` または用途を示した名前 |
| `impl`（クラス名のサフィックス以外） | `implementation` |

### 許容される例外

以下は省略形を許容する。

- **広く定着した略語**: `id`, `url`, `uri`, `html`, `css`, `json`, `xml`, `api`, `ui`, `db`, `dao`, `dto`, `i18n`, `a11y`
- **ループカウンタの `i` / `j` / `k`**: 短いループ内のインデックス変数
- **`catch (Exception e)`**: 例外オブジェクトの引数名としての `e`
- **クラス名サフィックスの `Impl`**: 実装クラスであることを示す慣習的なサフィックス
- **業務上の正式略語**: `vat`（付加価値税）など、業務ドメインで標準化されている略語

### 良い例 / 悪い例

```java
// 悪い例:
final User tmpUser = repository.find(userId);
final String msg = request.getParameter("msg");
final String errMsg = e.getMessage();
final List<User> userArr = new ArrayList<>();

// 良い例:
final User targetUser = repository.find(userId);
final String message = request.getParameter("message");
final String errorMessage = e.getMessage();
final List<User> userList = new ArrayList<>();
```

## 予約語・衝突回避

以下の名前は使用を避けること:
- Java 予約語: `class`, `interface`, `return`, `var`, `if`, `else`, `default` 等
- `java.lang` の既存クラス名との衝突: `String`, `Object`, `System`, `Thread` 等をクラス名として再利用しない
- intra-mart Accel Platform が提供するクラス名との衝突（`import` した API クラスと同名のクラスを同一パッケージ内に作らない）
