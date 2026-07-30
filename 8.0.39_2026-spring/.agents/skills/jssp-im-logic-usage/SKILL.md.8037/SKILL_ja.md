---
name: jssp-im-logic-usage
description: 既存の IM-LogicDesigner ルーティング定義（ロジックフローAPI）を JSSP プレゼンテーションページから呼び出すコードを生成する。swagger spec（`<BASE-URL>/logic/all-api-docs`）を取得・解析し、リクエストパラメータとレスポンス構造を特定した上で fetch 呼び出しコードを生成する。IM-LogicDesigner のフローを呼び出したい、ロジックフローAPIを叩きたい、logic/api を呼び出したい、既存のルーティング定義を使いたい、と言及されたときに使用。ロジックフロー定義（flow_definition.json）やルーティング定義（flow_route.json）を新規作成する場合は jssp-im-logic-generator を使うこと。
---

# IM-LogicDesigner ルーティング呼び出しコード生成スキル

## 概要

IM-LogicDesigner のロジックフローに設定済みの**既存のルーティング定義**（`<BASE-URL>/logic/api/<route>`）を、JSSP プレゼンテーションページ（ブラウザ側 JS）から呼び出すコードを生成するスキルセット。

本スキルは「呼び出す側」を担当する。ロジックフロー・ルーティングの**新規作成**は `jssp-im-logic-generator` の担当であり、本スキルの対象外。

## 適用方針

**JSSP 画面から IM-LogicDesigner のロジックフローを呼び出す必要が生じた場合は、必ずルーティング定義経由でアクセスすること。** ロジックフローを直接実行する API はなく、`flow_route.json` としてルーティング定義済みのフローのみが `<BASE-URL>/logic/api/<route>` で HTTP 実行できる。

呼び出し対象のフローにルーティング定義がまだ無い場合は、先に `jssp-im-logic-generator` でルーティング定義（`routes` spec）を作成する必要がある。ユーザに確認し、無ければその旨を伝えること。

## 実装手順

### 1. 呼び出し対象の特定

ユーザに以下を確認する（一部はユーザの依頼文から自明な場合は省略可）：
- 呼び出したいロジックフロー・機能（route パスの一部、タグ名等）
- HTTPメソッド（GET/POST/PUT/DELETE のいずれかで登録されているはずなので、後述の swagger spec から確定させる）
- 画面側で必要な入力項目・表示項目

### 2. swagger spec の取得

IM-LogicDesigner は、テナントに登録済みの全ルーティング定義を Swagger 2.0 形式で公開するエンドポイントを持つ。

```
<BASE-URL>/logic/all-api-docs
```

例: `http://127.0.0.1/imart/logic/all-api-docs`

`scripts/fetch-logic-swagger.js` を使って取得・抽出すること（生データをそのまま読み込むとcontextを消費するため、キーワードで絞り込んで取得する）。

```bash
# 全route一覧（path, method, summary, tags, operationId）
node scripts/fetch-logic-swagger.js --base-url http://127.0.0.1/imart --list

# 対象routeの詳細（$ref を解決したリクエスト/レスポンススキーマ付き）
node scripts/fetch-logic-swagger.js --base-url http://127.0.0.1/imart --route <キーワード>
```

**`<BASE-URL>` の決定方法**: プロジェクト内の開発サーバURL設定（`.mcp.json` 等）を確認する。手がかりが無い場合は `http://127.0.0.1/imart` を既定値として使用し、ユーザに確認する。

#### 401 / 403 が返る場合（必須対応）

このエンドポイントは認可設定で保護されている。取得に失敗し HTTP 401 または 403 が返った場合、**推測やリトライで回避しようとせず**、以下のメッセージをそのままユーザに提示すること。

> 認可設定画面の「画面・処理」で「IM-LogicDesigner」-「Swagger specification」に「ゲストユーザ」を許可してください

`scripts/fetch-logic-swagger.js` は 401/403 時にこのメッセージを標準エラー出力にそのまま出力する（終了コード1）。スクリプトの出力をそのままユーザに転記してよい。

### 3. リクエスト・レスポンス構造の特定

取得した spec から、対象 route の `paths["<path>"][<method>]` を確認する。

| 項目 | 参照箇所 |
|------|---------|
| HTTPメソッド | `paths["<path>"]` のキー（`get`/`post`/`put`/`delete`） |
| リクエストパラメータ | `parameters[].schema.$ref` → `definitions[<ref名>].properties` |
| レスポンス構造 | `responses.default.schema.$ref` → `definitions[<ref名>].properties` |
| 機能タグ | `tags` |

`--route` オプション付きで実行した場合、`$ref` は既にインライン展開済みなので `definitions` を別途参照する必要はない。

詳細な構造の読み方・型対応表は `reference/swagger-routing-call.md` を必ず参照すること。

### 4. 呼び出しコードの生成

`reference/swagger-routing-call.md` の fetch 呼び出しパターンに従い、JSSP プレゼンテーションページの `<script>` にコードを実装する。完成品サンプルは `assets/sample-call.md` を参照。

実装時の必須ルール:
- 呼び出しURLは `logic/api/<route>` の相対パスで指定する（`jssp-presentation-page.md` の URL 指定方針に準拠）
- レスポンスの正常/異常判定は、JSSP 独自の `{error, errorMessage}` 形式ではなく **HTTPステータス（`response.ok`）** で行う（ルーティングのレスポンスはフローの出力データそのものであり、JSSP の API レスポンス規約とは異なる）
- リクエストボディの型は `definitions` の `properties` に厳密に合わせる（推測で項目を増減させない）
- 型が不明・spec上の情報が不足する場合は、コード生成前にユーザに確認する

## 参照すべき規約

| 規約・スキル | 取り扱い |
|------|---------|
| `jssp-presentation-page.md` | 🟢 必読 — URL指定方針・`fetch` 呼び出しの基本形 |
| `reference/swagger-routing-call.md`（本スキル） | 🟢 必読 — swagger構造の読み方・fetch呼び出しパターン・注意点 |
| `jssp-im-logic-generator` の `reference/route_definition.schema.json` / `routing-response.md` | 🟡 参考 — ルーティング定義側の仕様（`secured`・`responseType`等）。swagger には出てこない情報の裏付けに使う |
| `jssp-error-handling.md` | 🔴 本スキール単独では不要 — ロジックフローAPIのレスポンスは JSSP のAPIレスポンス規約に従わないため |
| `jssp-security.md` | 🟡 参考 — CSRFトークン（`X-Intramart-Secure-Token`）は、対象ルーティングの `secured: true` が確認できた場合のみ付与する |

## 参照

- `reference/swagger-routing-call.md` - swagger spec の構造解説・fetch 呼び出しコードパターン・既知の注意点
- `scripts/fetch-logic-swagger.js` - swagger spec 取得・抽出ヘルパースクリプト（Node.js、依存なし）
- `assets/sample-call.md` - 完成品サンプル（GET ルート呼び出しの HTML + JS）

## 制限事項

- swagger spec には `secured`（セキュアトークン要否）・`authentication`（認証方式）・`authzUri`（認可URI）は含まれない。これらはルーティング定義（`flow_route.json`）側の設定情報であり、spec からは判別できない。不明な場合はセキュアトークン無しで実装し、実機での動作確認をユーザに依頼すること。
- 対象フローにルーティング定義が無い場合、本スキルの対象外（`jssp-im-logic-generator` でルーティング定義を新規作成すること）。
- GET メソッドで登録されたルートでも `parameters[].in` が `body` として記述されることがある（intra-mart のswagger生成の特性）。ブラウザの `fetch` はGETリクエストにHTTPボディを持たせられないため、実装時は `reference/swagger-routing-call.md` の「GETメソッドでの body パラメータ」を必ず確認すること。
