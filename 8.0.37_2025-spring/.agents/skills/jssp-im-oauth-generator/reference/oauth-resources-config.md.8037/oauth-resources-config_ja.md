# oauth-client-resources-config（リソース URL 設定）

OAuth REST-API として公開する **URL（path）** と **JSSP リソース実装ファイル（target）** をマッピングする設定ファイル。
`routing-jssp-config` の OAuth 版にあたり、URL ごとの認可方式（`<authz>`）と必要な scope を同じ要素で宣言する。

## 配置先

```
src/main/conf/oauth-client-resources-config/{任意のファイル名}.xml
```

デプロイ後は `WEB-INF/conf/oauth-client-resources-config/...` に配置される。

## XML 構造

```
<oauth-client-resources-config>
  <client-resources>
    <client-resource id="..." path="..." type="jssp|java" target="...">
      <authz uri="service://..." action="execute" /> ← 必須。下記「<authz> の書き方」参照（uri/action を明示）
      <scope id="..." />                            ← 必須。複数の scope を AND 条件で要求するなら繰り返し記述
    </client-resource>
  </client-resources>
</oauth-client-resources-config>
```

> 各 `<client-resource>` には `<authz uri="service://..." action="execute" />` を **必ず明示** する。`welcome-all` による認可スキップ（`<authz-default>` を使ったフォールバックや `<authz mapper="welcome-all" />`）は禁止。`build-oauth.js` も `spec.json` の `authz` が `"welcome-all"` または未指定の場合はエラーで停止する。

## 要素・属性一覧

| 要素 / 属性 | 必須 | 説明 |
|-------------|:----:|------|
| `oauth-client-resources-config`（ルート） | ○ | 名前空間 `http://intra-mart.co.jp/system/oauth/provider/client/resource/config/oauth-client-resources-config` |
| `client-resources` | ○ | client-resource の親要素 |
| `client-resource` | ○ | 個別のリソース定義 |
| `client-resource/@id` | ○ | リソースの一意 ID（運用ログ等で識別に使用） |
| `client-resource/@path` | ○ | 公開する URL のパス（例: `/oauth/sample_oauth/get_user`） |
| `client-resource/@type` | ○ | `jssp` または `java` |
| `client-resource/@target` | ○ | `type="jssp"` の場合は `src/main/jssp/src/` を起点とした **拡張子なし** のパス。<br>`type="java"` の場合は実装クラスの FQCN |
| `authz` | ○ | この URL を呼び出すために必要な認可リソース（`uri/action` で必ず指定） |
| `authz/@uri` | ○ | 認可リソース URI（例: `service://sample_oauth/get_user`） |
| `authz/@action` | ○ | 認可アクション（多くは `execute`） |
| `scope` | ○ | 必要な scope。1 つ以上必須 |
| `scope/@id` | ○ | `oauth-client-scopes-config` で定義した scope の ID |

> `target` の指定例
> - `src/main/jssp/src/sample_oauth/oauth/get_user.js` を実装にする場合 → `target="sample_oauth/oauth/get_user"`
> - `src/main/jssp/src/equipment_api/oauth/list.js` を実装にする場合 → `target="equipment_api/oauth/list"`
>
> 機能ディレクトリ（`{機能名}/`）の直下に `oauth/` サブディレクトリを設けて REST-API リソースを集約する。
> 同じ `{機能名}/view/`・`{機能名}/api/`（CSRF セキュアトークン版）と並列に存在する想定。
> 表記は routing-jssp-config の `page` 属性と同じ（`src/main/jssp/src/` 起点・拡張子なし）。

## サンプル

XML は `scripts/build-oauth.js` が `spec.json` から自動生成する。コーディングエージェントが手書きすることはない。
- **spec.json サンプル**: [examples/sample_oauth.spec.json](../examples/sample_oauth.spec.json) の `"resources": [...]` セクション
- **生成される XML 実例**: `src/main/conf/oauth-client-resources-config/sample_oauth.xml`

spec.json の `resources[]` フィールドと XML 要素の対応は上記「要素・属性一覧」を参照。
`type="java"` 実装を混在させたい場合は、spec.json で `"type": "java", "target": "jp.co.intra_mart...."` のように直接 FQCN を指定する。

## path / target 設計のガイドライン

- `path` は `/oauth/{機能名}/{処理名}` の形を推奨（プロジェクト内で URL 設計を統一しやすい）
- `path` は `routing-jssp-config` の URL と **重複しないこと**（プラットフォーム側のディスパッチで衝突するリスクがある）
- 1 URL に対して 1 ファンクションコンテナを割り当てる。HTTP メソッドの分岐（GET/POST/PUT/DELETE）は JSSP 側で `request.getMethod()` を見て判別する
- `target` は **拡張子なし**で書く（`.js` は付けない）

## `<authz>` の書き方と scope との関係

`<authz>` と `<scope>` は **AND で評価** される。`<authz>` は `uri/action` による認可リソース制御を **必須・標準** とする。`welcome-all` による認可スキップ（`<authz>` の省略やフォールバック）は禁止。`<authz>` を指定する前提で認可リソースを定義することをスキル実行時にユーザへ確認すること。

### 評価フロー

| `<authz>` | `<scope>` | 結果 |
|-----------|-----------|------|
| 通過 | 通過 | リソース実装の `init` が呼ばれる |
| 失敗 | - | 403 Forbidden（init は呼ばれない） |
| - | 失敗（scope 不足） | 403 Forbidden / `invalid_scope` |

### `<authz uri="service://..." action="execute" />` — 認可リソース URI/action で制御（必須・標準）

```xml
<client-resource id="..." path="..." type="jssp" target="...">
  <authz uri="service://sample_oauth/get_user" action="execute" />
  <scope id="..." />
</client-resource>
```

- 認可リソース URI に対するアクセス権がトークン所有ユーザにあることを判定する
- **認可リソースのインポート資材を別途用意する必要がある**（policy / resource / resource-group / subject-group の各 XML）
  - 用意しないとデプロイ後の API 呼び出しが **常に 403** で失敗する
  - 生成は `jssp-tenant-setup-generator` スキルに委譲する
- ロールやユーザ単位での細かいアクセス制御が可能
- **`welcome-all` による認可スキップは禁止。** `spec.json` で `"authz": "welcome-all"` を指定した場合や `authz` フィールドを省略した場合は、`build-oauth.js` がエラーで停止する

### `uri/action` の命名規則

| セグメント | 内容 | 例 |
|-----------|------|-----|
| `service://` | 認可リソース URI の固定スキーム | `service://` |
| `{機能名}/` | 機能ディレクトリ名に対応 | `sample_oauth/` |
| `{API名}` | API ファイル名（拡張子なし） | `get_user` |
| `action=` | 操作を表す名前。多くは `execute` | `execute` |

例: `<authz uri="service://sample_oauth/get_user" action="execute" />`

## チェックリスト（設定ファイル単体の自己点検）

> スキル実行時のワークフローチェック（要件ヒアリング・最終整合確認）は `SKILL.md` のステップ 1 / 8 にある。
> ここでは **設定ファイル単体を見たときに確認すべき項目** に絞って列挙する。

- [ ] `client-resource/@path` がプロジェクト内で一意か（routing-jssp-config の URL も含めて重複していないか）
- [ ] `client-resource/@target` が `src/main/jssp/src/` を起点とした拡張子なしのパスになっているか
- [ ] 該当する `.js` ファイルが `src/main/jssp/src/{target}.js` に存在するか
- [ ] `<scope id="...">` が `oauth-client-scopes-config` で定義した ID と一致するか
- [ ] 更新系（POST/PUT/DELETE）のリソースには **書き込み権限を表す scope** が割り当てられているか
- [ ] 各 `<client-resource>` に `<authz uri="service://..." action="execute" />` が明示されているか（`welcome-all` による認可スキップになっていないか）
- [ ] 指定した `uri/action` に対応する認可リソースのインポート資材が存在するか
