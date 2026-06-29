# oauth-client-details-config（クライアント詳細設定）

OAuth REST-API を利用する **クライアントアプリケーション** を登録する設定ファイル。
クライアント識別子（`client_id`）・シークレット・認可種別・許可する scope などを定義する。

## 配置先

```
src/main/conf/oauth-client-details-config/{任意のファイル名}.xml
```

デプロイ後は `WEB-INF/conf/oauth-client-details-config/...` に配置される。
1 ファイルに複数のクライアントを定義してよいが、運用上はクライアントごとに別ファイル（例: `sample_oauth.xml`、`partner_app.xml`）に分けて管理すると識別しやすい。

## XML 構造

```
<oauth-client-details-config>
  <client-details>
    <client-detail client-id="..."
        authorized-grant-type="authorization_code|implicit"
        client-secret="..."
        redirect-uri="..."
        access-token-validity-seconds="..."
        icon-path="..."
        code-challenge="NONE|ALL|PLAIN|S256">

      <default-name>...</default-name>

      <localizations>
        <localize locale="...">
          <client-name>...</client-name>
          <description>...</description>
        </localize>
      </localizations>

      <scopes>
        <scope id="..." />
      </scopes>
    </client-detail>
  </client-details>
</oauth-client-details-config>
```

## 要素・属性一覧

### `<client-detail>`

| 属性 | 必須 | デフォルト | 説明 |
|------|:----:|------------|------|
| `client-id` | ○ | - | クライアント識別 ID。OAuth 認可リクエスト時にクライアントから送られる |
| `authorized-grant-type` | ○ | - | `authorization_code`（サーバ間 Web アプリ用）または `implicit`（SPA／ネイティブアプリ用） |
| `client-secret` | △ | - | `authorized-grant-type="authorization_code"` のとき必須 |
| `redirect-uri` | × | - | 認可コードを受け取るクライアント側のリダイレクトエンドポイント。**なりすまし防止のため設定推奨** |
| `access-token-validity-seconds` | × | `3600`（1 時間） | アクセストークン有効期限（秒） |
| `icon-path` | × | - | 同意画面に表示するアイコン（80x80 推奨） |
| `code-challenge` | × | `NONE` | PKCE 用コードチャレンジ方式。`NONE` / `ALL` / `PLAIN` / `S256` |

### 子要素

| 要素 | 必須 | 説明 |
|------|:----:|------|
| `default-name` | ○ | クライアント既定表示名（ロケール非依存） |
| `localizations` | × | ロケール別表示の親要素 |
| `localize` | × | ロケール別表示の 1 件 |
| `localize/@locale` | ○ | ロケール ID（例: `ja`, `en`, `zh_CN`） |
| `client-name` | ○ | ロケール別クライアント表示名 |
| `description` | ○ | ロケール別説明 |
| `scopes` | ○ | このクライアントが要求できる scope の親要素 |
| `scope` | ○ | 個別 scope |
| `scope/@id` | ○ | `oauth-client-scopes-config` で定義した scope ID |

## サンプル

XML は `scripts/build-oauth.js` が `spec.json` から自動生成する。コーディングエージェントが手書きすることはない。
- **spec.json サンプル**: [examples/sample_oauth.spec.json](../examples/sample_oauth.spec.json) の `"clients": [...]` セクション
- **生成される XML 実例**: `src/main/conf/oauth-client-details-config/sample_oauth.xml`

spec.json の `clients[]` フィールドと XML 要素の対応は上記「要素・属性一覧」を参照（例: spec の `clientId` → XML の `client-id` 属性、`grantType` → `authorized-grant-type`、`codeChallenge` → `code-challenge` 等）。

## 認可種別（authorized-grant-type）の選択

| 値 | 用途 | client-secret | 備考 |
|----|------|:-------------:|------|
| `authorization_code` | サーバを持つ Web アプリ | 必須 | 推奨。code を取得し、サーバ間通信でアクセストークンに交換する。PKCE 併用が望ましい |
| `implicit` | SPA／ネイティブアプリ | 不要 | 仕様上非推奨。最新の OAuth 2.1 では原則使わない。互換性のために残す程度に留めること |

## セキュリティ上の注意

- `client-secret` は **平文で XML に書き込まれる** ため、本ファイルは Git の機密管理対象。本番環境向けの値はリポジトリに直書きせず、**`@VARIABLE@`** 形式のフィルタ置換や `import` 時の上書き設定で渡すこと
- `redirect-uri` を未指定にすると、認可コード横取り型の攻撃（CSRF）が成立しうるため、**必ず指定**すること
- `code-challenge` は `S256` を推奨（PKCE 対応により認可コード横取り対策となる）
- `access-token-validity-seconds` は要件に応じて短く（例: `300`〜`1800`）。長くする場合はリフレッシュトークン運用とセットで検討

## チェックリスト

- [ ] `client-id` がプロジェクト・テナント内で一意か
- [ ] `authorized-grant-type="authorization_code"` の場合、`client-secret` を設定したか
- [ ] `redirect-uri` を指定したか（未指定だとセキュリティ低下）
- [ ] `<scope id="...">` がすべて `oauth-client-scopes-config` で定義済みか
- [ ] `client-secret` をリポジトリにコミットしてよい値か、それともフィルタ置換に置き換えるべきか確認したか
- [ ] `code-challenge` を `S256` にしたか（PKCE 対応）
