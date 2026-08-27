---
applyTo: "**/*.java"
description: "ログ出力規約（Java）（SLF4J/Logback、ログレベルの使い分け）"
---

# ログ出力規約（Java）

> **適用範囲**: 🟡 **文脈依存** — ログ実装時のみ適用。ログ出力を行わないクラスでは読まなくてよい。

intra-mart Accel Platform は SLF4J + Logback をベースとしたロギング基盤を提供する。`jp.co.intra_mart.common.platform.log.Logger` を使用してログを出力すること。

## ログレベルの使い分け

| レベル | 用途 | 記述言語 |
|--------|------|----------|
| ERROR | システムエラー、予期しない例外、管理者への連絡が必要な障害 | 英語 |
| WARN | ビジネスルール違反、回復可能なエラー、非推奨機能の使用 | 英語 |
| INFO | 業務操作の開始・終了、主要な状態変更、サービス呼び出し | 英語 |
| DEBUG | 詳細な実行フロー、パラメータ値 | 英語 |
| TRACE | さらに詳細なデバッグ情報 | 英語 |

## Logger の実装

### 基本パターン

```java
import jp.co.intra_mart.common.platform.log.Logger;

public class UserService {

  private static final Logger LOGGER = Logger.getLogger(UserService.class);

  public void execute() {
    LOGGER.info("Started processing");
  }
}
```

- **必須** クラスごとに `private static final` な Logger フィールドを定義すること
- **必須** `Logger.getLogger()` の引数には、ログを出力する**そのクラス自身の `.class`**（例: `UserService` クラス内なら `UserService.class`）を指定すること
  - 理由: ログ出力元のクラス（パッケージ階層）が正しく記録され、`conf/log/{module_id}.xml` でのロガー名（パッケージ単位）によるレベル制御が意図通りに機能する
- ロガー名を直接指定する場合は `Logger.getLogger("my.custom.logger.name")` の形式も使用可（機能単位でロガーをまとめたい等、特別な理由がある場合のみ）

### ログ出力パターン

```java
private static final Logger LOGGER = Logger.getLogger(UserService.class);

// コンテキスト付きエラーログ
LOGGER.error("Failed to process registration for user: " + userId, e);

// ビジネス警告
LOGGER.warn("Business rule violation: category is not editable. categoryId=" + categoryId);

// 操作の情報ログ
LOGGER.info("Started registUser processing for user: " + userId + ", tenant: " + tenantId);

// トラブルシューティング用デバッグログ
LOGGER.debug("Processing registUser with parameters: " + parameters);
```

## 機密情報の取り扱い

### 出力禁止項目

- パスワード
- 認証トークン
- クレジットカード番号
- 個人情報（必要な場合はマスク処理）

- **禁止** 機密情報（パスワード、トークン、個人データ）をログに出力しないこと

## 例外タイプ別ログレベル判断

| 例外タイプ | ログレベル | 理由 |
|---|---|---|
| ValidationException（入力バリデーション） | ログ出力しない | ユーザの入力誤り。システム障害ではない |
| AuthorizationException（認可エラー） | ログ出力しない | 認可フレームワークが処理する |
| NotFoundException（検索結果なし） | ログ出力しない | 正常な業務フロー |
| BusinessException（ビジネスルール違反） | WARN | 回復可能なビジネスロジック上の問題 |
| RepositoryException（データアクセスエラー） | ERROR | インフラストラクチャ障害。調査が必要 |
| RuntimeException（予期しないエラー） | ERROR | プログラミングエラー。即座に調査が必要 |

### 基本方針

- **必須** 管理者への連絡が必要なエラーのみログ出力すること
- **禁止** 入力チェック例外でログ出力しないこと
- **禁止** 権限チェック例外でログ出力しないこと
- **推奨** クライアントに返すエラー情報とログ出力を分離すること

### 正しいパターン

```java
@Path("/users")
public class UserEndpoint {

  private static final Logger LOGGER = Logger.getLogger(UserEndpoint.class);

  @POST
  public Response createUser(UserRequest request) {
    try {
      List<String> errors = request.validate();
      if (!errors.isEmpty()) {
        // 入力チェックエラーはログ出力しない
        return Response.badRequest(errors);
      }

      User user = userService.createUser(request);
      return Response.ok(user);

    } catch (AuthorizationException e) {
      // 権限チェックエラーはログ出力しない
      return Response.forbidden();

    } catch (BusinessException e) {
      // ビジネス例外はWARNレベルで出力（任意）
      LOGGER.warn("Business error occurred. code: " + e.getBusinessCode(), e);
      return Response.conflict(e.getMessage());

    } catch (Exception e) {
      // 予期しないエラーのみERRORレベルで出力
      LOGGER.error("Unexpected error during createUser processing", e);
      return Response.internalServerError();
    }
  }
}
```

## レイヤー別ログパターン

### サービス層

```java
private static final Logger LOGGER = Logger.getLogger(StandardCategoryService.class);

// 業務操作の開始・完了（INFO）
LOGGER.info("Started processing category: categoryId=" + categoryId + ", userCd=" + userCd);

// ビジネスルール違反（WARN）
LOGGER.warn("Business rule violation: category is not editable. categoryId="
    + categoryId + ", status=" + category.getStatus());

// インフラ障害のラップ時（ERROR）
LOGGER.error("Failed to save category: categoryId=" + category.getCategoryId(), e);
throw new CategoryServiceException("カテゴリの保存に失敗しました", e);
```

- INFO: 業務操作の開始・完了（ユーザコード、テナントID、操作対象IDを含める）
- WARN: ビジネスルール違反（回復可能なエラー）
- ERROR: インフラ障害をキャッチした時のみ

### リポジトリ層

```java
private static final Logger LOGGER = Logger.getLogger(StandardCategoryRepository.class);

try {
  // DB操作
} catch (SQLRuntimeException e) {
  LOGGER.error("Failed to find category: categoryId=" + categoryId, e);
  throw new RepositoryException("カテゴリの検索に失敗しました: categoryId=" + categoryId, e);
}
```

- ERROR のみ: インフラストラクチャ障害（DB接続エラー、SQL実行エラー等）
- find で null が返るのは正常動作。ログ出力しない
- デバッグ用途の場合は DEBUG レベルを使用

### ジョブ層

```java
private static final Logger LOGGER = Logger.getLogger(CategoryBatchJob.class);

@Override
public JobResult execute() throws JobExecuteException {
  LOGGER.info("Started category batch job");

  int processedCount = 0;
  int errorCount = 0;

  for (Category category : categories) {
    try {
      processCategory(category);
      processedCount++;

      // 進捗ログ（100件ごと）
      if (processedCount % 100 == 0) {
        LOGGER.info("Progress: processed=" + processedCount + ", errors=" + errorCount);
      }
    } catch (Exception e) {
      errorCount++;
      LOGGER.error("Failed to process category: categoryId=" + category.getCategoryId(), e);
    }
  }

  LOGGER.info("Completed category batch job: processed=" + processedCount + ", errors=" + errorCount);

  if (errorCount > 0) {
    return JobResult.warning("処理完了（エラーあり）: 処理=" + processedCount + ", エラー=" + errorCount);
  }
  return JobResult.success("処理完了: " + processedCount + "件");
}
```

- INFO: 開始・完了・進捗（処理件数を含める）
- ERROR: 個別レコードの処理失敗
- 進捗ログは N 件ごと（100件 or 1000件単位）

## パフォーマンス考慮（DEBUG ログのガード）

```java
// NG: 常に文字列結合が実行される
LOGGER.debug("Processing with parameters: " + buildExpensiveString(params));

// OK: DEBUG 有効時のみ文字列結合が実行される
if (LOGGER.isDebugEnabled()) {
  LOGGER.debug("Processing with parameters: " + buildExpensiveString(params));
}
```

**いつガードが必要か:**
- メソッド呼び出しや複雑な文字列結合を含む場合
- ループ内で大量に出力する可能性がある場合
- 単純な文字列結合（`"msg: " + id`）程度ならガード不要

## ログ設定ファイル

### 配置場所

```
conf/
  └── log/
    └── {module_id}.xml
```

### モジュール固有設定例

```xml
<?xml version="1.0" encoding="UTF-8"?>
<im-logger>
    <!-- アプリケーション全体: INFO -->
    <logger name="{packageName}" level="INFO" />

    <!-- インフラストラクチャ層: WARN（通常時のDB操作ログを抑制） -->
    <logger name="{packageName}.infrastructure" level="WARN" />

    <!-- デバッグ用設定（開発時のみ有効化） -->
    <!-- <logger name="{packageName}" level="DEBUG" /> -->
</im-logger>
```

## アンチパターン

### REST API での冗長なログ出力

```java
// NG: すべての例外でERRORログを出力
@POST
public Response createUser(UserRequest request) {
  try {
    // 処理
  } catch (ValidationException e) {
    LOGGER.error("Validation error", e);  // 不要
    return Response.badRequest();
  } catch (AuthorizationException e) {
    LOGGER.error("Authorization error", e);  // 不要
    return Response.forbidden();
  } catch (Exception e) {
    LOGGER.error("Unexpected error occurred", e);  // これのみ必要
    return Response.internalServerError();
  }
}
```

### その他の禁止事項

- **禁止** ループ内で大量のログを出力しないこと（進捗ログは N 件ごとに間引く）
