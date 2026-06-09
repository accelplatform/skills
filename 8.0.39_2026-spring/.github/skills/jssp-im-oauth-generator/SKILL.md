---
name: jssp-im-oauth-generator
description: intra-mart Accel Platform の OAuth プロバイダ機能（im_oauth）で公開する REST-API リソースを新規生成する。spec.json を作って scripts/build-oauth.js を実行することで、scope 定義 XML・リソース URL マッピング XML・クライアント詳細設定 XML・JSSP リソース実装（.js 骨格）を一括で生成する。「OAuth REST-API を作成」「外部公開 API を OAuth で守りたい」「OAuth トークンで認証する API を追加」「im_oauth リソースを作って」「OAuth スコープを定義」「oauth-client-resources-config を追加」と言及されたときに使用。CSRF セキュアトークン版の REST-API は jssp-page-generator を使うこと。
allowed-tools: Bash, Read, Write, Glob
---

# im_oauth REST-API リソース生成スキル

## 目的

intra-mart Accel Platform の **OAuth プロバイダ機能** を使用して、外部クライアントアプリケーションに OAuth アクセストークン認証付きの REST-API を新規公開するためのスキル。
**1 つの `spec.json` から `scripts/build-oauth.js` で 4 種類の資材（scope 定義・リソース URL マッピング・クライアント詳細設定・JSSP リソース実装の骨格）を一括生成** する方式を採る（`jssp-im-workflow-generator` と同方式）。
コーディングエージェントが書くのは spec.json のみで、XML の細かい構造や JSSP の共通骨格はスクリプトが自動生成する。

## 生成対象

- **スコープ定義 XML** - `src/main/conf/oauth-client-scopes-config/{機能名}.xml`
- **リソース URL 設定 XML** - `src/main/conf/oauth-client-resources-config/{機能名}.xml`
- **クライアント詳細設定 XML** - `src/main/conf/oauth-client-details-config/{機能名}.xml`
- **リソース実装 .js** - `src/main/jssp/src/{機能名}/oauth/{file}.js`

※ プレゼンテーションページ（`.html`）を伴う画面、ジョブ、ワークフロー連携処理はそれぞれ `jssp-page-generator` / `jssp-im-job-generator` / `jssp-im-workflow-usage` を使うこと。
※ ブラウザのテナントログインセッション経由で呼ばれる通常の REST-API（CSRF セキュアトークン検証あり）は `jssp-page-generator` を使うこと（このスキルは外部システム向け）。

## 使用タイミング

ユーザが以下のような依頼をした場合:

- 「OAuth REST-API を作成」
- 「外部システムから利用できる API を OAuth トークンで公開して」
- 「im_oauth のリソースを追加」
- 「oauth-client-resources-config に新しい URL を追加」
- 「OAuth スコープを新規定義」

---

## ファイル構成

```
jssp-im-oauth-generator/
├── SKILL.md
├── scripts/
│   └── build-oauth.js              # spec.json → XML 3 種 + JSSP 骨格 を一括生成
├── reference/
│   ├── oauth-overview.md           # 全体像・通常 REST-API との差異
│   ├── oauth-scopes-config.md      # scope 定義 XML リファレンス
│   ├── oauth-resources-config.md   # リソース URL 設定 XML リファレンス
│   ├── oauth-client-details-config.md  # クライアント詳細設定 XML リファレンス
│   └── oauth-resource-implementation.md # JSSP (.js) 実装ルール
├── examples/
│   └── sample_oauth.spec.json       # spec.json サンプル（ユーザ情報取得 API）
└── assets/
    └── sample-oauth-get-user.md     # 完全版サンプル（写経用、CSRF 版との差分）
```

---

## 統合ワークフロー

**このワークフローを上から順番に実行すること。ステップの省略・順序変更は禁止。**
各ステップは完了してから次へ進むこと。ユーザへの報告はステップ 6 完了後に行う。

---

### ステップ 1: 要件ヒアリング

ユーザから以下を確認する（与えられていない場合は質問する）。

| 確認項目 | 例 |
|---------|-----|
| 機能名（ディレクトリ名・XML ファイル名） | `sample_oauth`、`equipment_api` |
| API 名・ファイル名 | `get_user`、`list_equipments` |
| 公開 URL（`path`） | `/oauth/sample_oauth/get_user` |
| HTTP メソッド | `GET` / `POST` / `PUT` / `DELETE` |
| クエリ／ボディパラメータ | `userCd` 必須・文字列 100 文字以内 など |
| 必要な scope（新規定義か既存利用か） | `sample_oauth_user_read` 新規 |
| **認可方式（`<authz>`）** | (A) `welcome-all`（= `<authz>` を省略しトップの `<authz-default mapper="welcome-all" />` にフォールバック） か (B) `uri/action` の二択。詳細は `reference/oauth-resources-config.md`「`<authz>` の書き方と scope との関係」を参照。**必ずユーザに確認すること**（後者を選ぶと認可リソースのインポート資材生成も必要になる） |
| クライアント情報（既存クライアントを利用するか、新規作成するか） | client_id・client_secret・redirect-uri |
| 業務ロジック内容 | AccountInfoManager から取得して JSON 返却 など（手動補完するため概要だけで OK） |

判断が分かれる項目は、勝手に決めずユーザに確認すること。

---

### ステップ 2: リファレンスの読み込み

下記 5 ファイルを **Read ツールで開いて読み込む。** 記憶や推測で書いてはならない。

| ファイル | 内容 |
|---------|------|
| `reference/oauth-overview.md` | 全体像、通常 REST-API との差異 |
| `reference/oauth-scopes-config.md` | scope 定義 XML の仕様 |
| `reference/oauth-resources-config.md` | リソース URL 設定 XML の仕様（特に `<authz>` の (A)(B) 選択） |
| `reference/oauth-client-details-config.md` | クライアント詳細設定 XML の仕様 |
| `reference/oauth-resource-implementation.md` | JSSP（.js）実装方針・ビジネスロジックの書き方 |

業務ロジックを実装する際は JSSP の標準的なコーディング規約・エラーハンドリング・セキュリティ規約が **すべて適用される**。必要に応じて以下を参照すること。

- `instructions/jssp-function-container.instructions.md` - 基本構造
- `instructions/jssp-error-handling.instructions.md` - エラーレスポンス・HTTP ステータス
- `instructions/jssp-logging.instructions.md` - ログ出力
- `instructions/jssp-security.instructions.md` - SQL インジェクション・機密情報の取扱い
- `instructions/jssp-2way-sql.instructions.md` - DB アクセスがある場合
- `skills/jssp-page-generator/reference/api-web.md` - `Web.getHTTPResponse()`
- `skills/jssp-page-generator/reference/api-account-context.md` - 認証ユーザ取得
- `skills/jssp-page-generator/reference/argument-request.md` - `request` 引数

---

### ステップ 3: spec.json を組み立てる

`examples/sample_oauth.spec.json` を Read ツールで開いて **必ず構造を確認** し、ヒアリング結果を反映した `/tmp/{機能名}.spec.json` を作成する。
spec.json の構造はリファレンス XML と 1 対 1 対応しているので、リファレンスを見ながらフィールド名を決める必要はない。

```jsonc
{
  "feature": "sample_oauth",                    // 機能名（ディレクトリ・XML ファイル名）
  "errorCodeProduct": "IWP",                    // エラーコード接頭辞 E.{IWP}.{FEATURE}.{API}.NNNNN

  "scopes": [                                   // 複数可。3 言語 (ja/en/zh_CN) 標準で用意する
    {
      "id": "sample_oauth_user_read",
      "defaultSubject": "Sample OAuth user-read scope",
      "localizations": {
        "ja": { "subject": "...", "text": "..." },
        "en": { "subject": "...", "text": "..." },
        "zh_CN": { "subject": "...", "text": "..." }
      }
    }
  ],

  "resources": [                                // 公開する REST-API の URL マッピング（複数可）
    {
      "id": "sample-oauth-get-user",            // <client-resource id>
      "path": "/oauth/sample_oauth/get_user",   // 公開 URL
      "type": "jssp",                           // jssp または java
      "file": "get_user",                       // JSSP ファイル名（拡張子なし）
                                                //   → target は自動で {feature}/oauth/{file}
      "authz": "welcome-all",                   // (A) "welcome-all" を指定すると <authz> は出力されず
                                                //     トップの <authz-default mapper="welcome-all" /> にフォールバック
                                                //     （省略しても同じ挙動）
                                                // (B) { "uri": "service://...", "action": "execute" } を指定すると
                                                //     <authz uri="..." action="..." /> が出力される
      "scopes": ["sample_oauth_user_read"],

      "api": {                                  // JSSP 骨格生成用パラメータ
        "title": "ユーザ情報取得 REST-API（OAuth 公開版）",
        "description": "...（@description コメントの内容）",
        "logPrefix": "sample_oauth/get_user",   // logger 内の [...] プレフィクス
        "allowedMethods": ["GET"],
        "parameters": [                         // バリデーション自動生成用
          {
            "name": "userCd",
            "required": true,
            "maxLength": 100,
            "pattern": "^[0-9A-Za-z_@.+!\\-]+$",
            "patternMessage": "userCd の形式が正しくありません。"
          }
        ],
        "extraErrorCodes": [                    // ERROR_CODE_INVALID_REQUEST / METHOD_NOT_ALLOWED / INTERNAL 以外
          { "name": "USER_NOT_FOUND", "code": "00004" }
        ]
      }
    }
  ],

  "clients": [                                  // クライアントアプリケーション登録（複数可）
    {
      "clientId": "sample-oauth-client",
      "grantType": "authorization_code",
      "clientSecret": "change-me-in-production",  // 本番値はリポジトリに直書きしないこと
      "redirectUri": "https://example.com/sample_oauth/callback",
      "accessTokenValiditySeconds": 3600,
      "codeChallenge": "S256",
      "defaultName": "Sample OAuth Client",
      "localizations": {
        "ja":    { "clientName": "...", "description": "..." },
        "en":    { "clientName": "...", "description": "..." },
        "zh_CN": { "clientName": "...", "description": "..." }
      },
      "scopes": ["sample_oauth_user_read"]
    }
  ]
}
```

**spec.json 作成時の注意:**
- `feature` は **lowercase snake_case** のみ（小文字英数字・アンダースコア）
- `scopes[].id` を `resources[].scopes[]` と `clients[].scopes[]` から **必ず一致した名前で参照** する（不一致は build スクリプトが検出してエラー）
- `path` が `routing-jssp-config` の URL と重複しないか、事前に `src/main/conf/routing-jssp-config/` を Glob で確認すること
- `<localizations>` の 3 言語 (`ja` / `en` / `zh_CN`) は **標準で全部書く**
- `api.parameters` は build スクリプトが `validateRequest()` に自動展開する。必須／最大長／正規表現を spec で表現すれば、対応するバリデーションコードが生成される
- `api.extraErrorCodes` には、`INVALID_REQUEST` / `METHOD_NOT_ALLOWED` / `INTERNAL` 以外で必要なエラーコードのみを列挙する

---

### ステップ 4: build-oauth.js を実行

```bash
node .github/skills/jssp-im-oauth-generator/scripts/build-oauth.js \
     /tmp/{機能名}.spec.json
```

build-oauth.js が自動で行うこと:
- spec.json のバリデーション（scope ID 不一致・必須フィールド欠如・スキーマ不正をチェックして即停止）
- `src/main/conf/oauth-client-scopes-config/{feature}.xml` を生成（既存上書き）
- `src/main/conf/oauth-client-resources-config/{feature}.xml` を生成（既存上書き）
- `src/main/conf/oauth-client-details-config/{feature}.xml` を生成（既存上書き）
- `src/main/jssp/src/{feature}/oauth/{file}.js` を生成（**既存ファイルがあるとスキップして警告**、業務ロジックの誤消失防止）
- ロケール 3 言語の展開、エラーコード定数の連番付与、バリデーション関数の自動展開、JSDoc 整形

**フラグ:**
- `--xml-only` … XML 3 ファイルのみ更新し JSSP は触らない。**spec を後から変更したとき、業務ロジック実装済みの .js を保護したまま XML だけ再生成する**ために使う

```bash
# spec 更新 → XML だけ再生成（JSSP の業務ロジックは保持）
node .github/skills/jssp-im-oauth-generator/scripts/build-oauth.js \
     /tmp/{機能名}.spec.json --xml-only
```

**JSSP 骨格を強制再生成したい場合:** 対象の `.js` ファイルを手動で削除してから再実行する。

---

### ステップ 5: JSSP の業務ロジック補完

build-oauth.js が生成する JSSP 骨格には:
- `init(request)` 全体構造
- `checkMethod()` / `validateRequest()`（spec の `parameters` から自動展開）
- `throwApiError()` / `throwValidationError()`
- `sendJsonResponse()`
- `processBusinessLogic(request)` が **TODO コメント付きの空関数** として配置される

`processBusinessLogic` の中身を手動補完すること。`reference/oauth-resource-implementation.md` と `assets/sample-oauth-get-user.md` の実装例を参考にする。

**補完時の規約:**
- DB アクセスを伴う場合は `instructions/jssp-2way-sql.instructions.md` に従い、`src/main/jssp/src/{機能名}/sql/` 配下に SQL ファイルを外部化し `executeByTemplate` を使う
- レスポンス JSON には **機密情報（パスワード・認証トークン・マスクなしの個人情報）を含めない**
- ユーザ未存在等は `throwApiError(ERROR_CODE_*, 404, '...')` でスロー（spec の `extraErrorCodes` で定数化済み）

---

### ステップ 6: 手動チェック

build-oauth.js が以下を自動検証するため、ここではスクリプトでは検出できない **手動補完後の項目** のみを確認する。

> **build-oauth.js が自動チェック済み:** spec.json のスキーマ・必須フィールド・scope ID の参照整合性（resources・clients から参照される scope が `scopes[]` に存在するか）

| チェック項目 | 確認内容 |
|------------|---------|
| URL 重複なし | `oauth-client-resources-config` の `path` が `routing-jssp-config` の URL と重複していないか（Glob と Grep で確認） |
| セキュアトークン検証不在 | 補完した業務ロジック内に `verifySecureToken` / `X-Intramart-Secure-Token` 文字列が混入していないか（Grep で確認） |
| **認可リソースの整合** | `<authz>` で `uri/action` を指定した場合、対応する認可リソースのインポート資材（`jssp-tenant-setup-generator` で生成）が用意されているか。`welcome-all`（= `<authz>` 省略）を選んだ場合はスキップ |
| 業務ロジックの実装 | `processBusinessLogic` の `// TODO:` コメントが残っていないか |
| jssp-page-generator のスクリプト | `validate-jssp-code.js` が利用可能なら、生成 `.js` に対して実行する |

**ここまで完了したらユーザに報告する。**
報告には以下を含める:

- 使用した spec.json のパス
- 生成したファイル一覧（パス）
- 公開エンドポイント URL（コンテキストパス付き想定）
- 要求 scope
- 想定リクエスト例（`curl` 等）
- 既存クライアントを利用 / 新規クライアント作成 のいずれを行ったか
- 認可方式（`welcome-all` か `uri/action` か）。`uri/action` を選んだ場合は **次に `jssp-tenant-setup-generator` で認可資材を生成する必要がある旨を明記**
- ユーザ側で **デプロイ後に確認すべき項目**（管理画面で scope / client / resource が登録されたか、ビルドフィルタで client-secret が置換されているか、別オリジンからアクセスする場合は CORS 許可設定が必要か 等）

---

## よくある失敗パターン

- **セキュアトークン検証を書いてしまう**: OAuth REST-API では不要。誤って書くと OAuth アクセストークンしか持たないクライアントが 400 で弾かれる
- **`.html` ペアファイルを作ってしまう**: OAuth リソースは HTML を返さないため、ペアファイルは作成不要
- **scope ID を resources-config と details-config で食い違わせる**: クライアントが要求できる scope が無い、リソースが要求する scope を持たない等の不整合になる
- **`path` を routing-jssp-config と重複させる**: プラットフォーム側のディスパッチで競合
- **client-secret をリポジトリに本番値で書く**: 漏洩リスク。フィルタ置換 or 環境ごとの設定差し替えに

## 関連スキル

- `jssp-page-generator` - 通常の画面・REST-API（CSRF セキュアトークン版）
- `jssp-im-master-usage` - IM-共通マスタ検索（ユーザ・組織・会社の検索ダイアログ）
- `jssp-tenant-setup-generator` - テナント環境セットアップ資材生成（OAuth クライアント情報のフィルタ置換運用などをここに組み込む）
- `jssp-code-review` / `jssp-security-check` - 生成後の品質チェック
