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
  <authz-default mapper="..." />                    ← 任意。<authz> 省略時のフォールバック
  <client-resources>
    <client-resource id="..." path="..." type="jssp|java" target="...">
      <authz ... />                                 ← 任意。下記「<authz> の書き方」参照（mapper / uri+action のどちらか）
                                                    ← <authz-default> と同じ内容（mapper="welcome-all"）になるなら省略する
      <scope id="..." />                            ← 必須。複数の scope を AND 条件で要求するなら繰り返し記述
    </client-resource>
  </client-resources>
</oauth-client-resources-config>
```

> ルーティングテーブル（`routing-jssp-config`）と同じく、`<authz-default mapper="welcome-all" />` をトップに置いている前提では、個別の `<client-resource>` で `<authz mapper="welcome-all" />` を書く必要はない。`build-oauth.js` も `spec.json` の `authz` が `"welcome-all"` または未指定の場合は `<authz>` を出力しない。`uri/action` を使う (B) のケースだけ `<authz>` を明示する。

## 要素・属性一覧

| 要素 / 属性 | 必須 | 説明 |
|-------------|:----:|------|
| `oauth-client-resources-config`（ルート） | ○ | 名前空間 `http://intra-mart.co.jp/system/oauth/provider/client/resource/config/oauth-client-resources-config` |
| `authz-default` | × | デフォルト認可設定。`<authz>` が省略された `<client-resource>` に適用される |
| `authz-default/@mapper` | × | 認可リソースマッパー名（例: `welcome-all` で誰でも許可） |
| `client-resources` | ○ | client-resource の親要素 |
| `client-resource` | ○ | 個別のリソース定義 |
| `client-resource/@id` | ○ | リソースの一意 ID（運用ログ等で識別に使用） |
| `client-resource/@path` | ○ | 公開する URL のパス（例: `/oauth/sample_oauth/get_user`） |
| `client-resource/@type` | ○ | `jssp` または `java` |
| `client-resource/@target` | ○ | `type="jssp"` の場合は `src/main/jssp/src/` を起点とした **拡張子なし** のパス。<br>`type="java"` の場合は実装クラスの FQCN |
| `authz` | × | この URL を呼び出すために必要な認可リソース |
| `authz/@uri` | × | 認可リソース URI（例: `service://sample_oauth/get_user`） |
| `authz/@action` | × | 認可アクション（多くは `execute`） |
| `authz/@mapper` | × | 認可リソースマッパー名（`welcome-all` 等） |
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

`<authz>` と `<scope>` は **AND で評価** される。`<authz>` の書き方には 2 通りあり、**どちらを採用するかはスキル実行時に必ずユーザへ確認**すること。

### 評価フロー

| `<authz>` | `<scope>` | 結果 |
|-----------|-----------|------|
| 通過 | 通過 | リソース実装の `init` が呼ばれる |
| 失敗 | - | 403 Forbidden（init は呼ばれない） |
| - | 失敗（scope 不足） | 403 Forbidden / `invalid_scope` |

### (A) `<authz>` を省略 — 誰でもアクセス可（`authz-default` にフォールバック）

```xml
<client-resource id="..." path="..." type="jssp" target="...">
  <!-- <authz> は書かない（authz-default mapper="welcome-all" にフォールバック） -->
  <scope id="..." />
</client-resource>
```

- 認可判定を常にパスし、**scope だけで制御**
- **追加成果物なし**で動く
- **推奨ユースケース:** PoC、社内向け、scope だけで十分制御できる API、最短で動作確認したい場合
- **デメリット:** ロールやユーザ単位での細かいアクセス制御ができない
- **書き方:** トップに `<authz-default mapper="welcome-all" />` を置いている前提で **`<authz>` 自体を書かない**。明示的に `<authz mapper="welcome-all" />` と書くのは冗長なので避ける（routing-jssp-config と同じ規約）。`spec.json` で `"authz": "welcome-all"` を指定した場合や `authz` フィールドを省略した場合は、`build-oauth.js` が自動で `<authz>` を出力しないようになっている

### (B) `<authz uri="service://..." action="execute" />` — 認可リソース URI/action で制御

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
- **推奨ユースケース:** 本番運用、複数ロールが混在し scope だけでは制御しきれない API
- **デメリット:** 認可リソース定義のインポート資材も併せて生成・保守する必要がある

### `uri/action` の命名規則（(B) を選んだ場合）

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
- [ ] `<authz>` の書き方が妥当か：
  - (A) `welcome-all` を許可するケースでは **`<authz>` 自体を省略**し、トップの `<authz-default mapper="welcome-all" />` にフォールバックさせているか（明示的に `<authz mapper="welcome-all" />` と書かない）
  - (B) `uri/action` を指定するケースでは、対応する認可リソースのインポート資材が存在するか
