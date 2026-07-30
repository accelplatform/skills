# oauth-client-scopes-config（スコープ設定）

OAuth プロバイダが提供する **アクセス範囲（scope）** を定義する設定ファイル。
クライアントアプリケーションがユーザに同意を求める際の単位となる。

## 配置先

```
src/main/conf/oauth-client-scopes-config/{任意のファイル名}.xml
```

デプロイ後は `WEB-INF/conf/oauth-client-scopes-config/...` に配置される。
ファイル名は機能単位や scope のグループ単位で分けてよい（例: `sample_oauth.xml`、`account_scopes.xml`）。

## XML 構造

```
<oauth-client-scopes-config>
  <scopes>
    <scope id="...">                 ← 1 件以上、繰り返し可
      <default-subject>...</default-subject>
      <localizations>
        <localize locale="...">      ← 提供したいロケール分繰り返し
          <subject>...</subject>
          <text>...</text>
        </localize>
      </localizations>
    </scope>
  </scopes>
</oauth-client-scopes-config>
```

## 要素・属性一覧

| 要素 / 属性 | 必須 | 説明 |
|-------------|:----:|------|
| `oauth-client-scopes-config`（ルート） | ○ | 名前空間 `http://intra-mart.co.jp/system/oauth/provider/client/scope/config/oauth-client-scopes-config` |
| `scopes` | ○ | scope の親要素 |
| `scope` | ○ | 個別のアクセス範囲。1 ファイルに複数定義可 |
| `scope/@id` | ○ | scope を識別する一意の ID。クライアント詳細設定・リソース設定から参照される |
| `default-subject` | ○ | ロケールに該当する表示名が無い場合に使われる既定の表示名 |
| `localizations` | × | ロケール別表示の親要素 |
| `localize` | × | ロケール別表示の 1 件 |
| `localize/@locale` | ○ | ロケール ID（例: `ja`, `en`, `zh_CN`） |
| `subject` | ○ | 同意画面に表示される scope 名（ロケール別） |
| `text` | ○ | 同意画面に表示される scope の説明（ロケール別） |

## サンプル

XML は `scripts/build-oauth.js` が `spec.json` から自動生成する。コーディングエージェントが手書きすることはない。
- **spec.json サンプル**: [examples/sample_oauth.spec.json](../examples/sample_oauth.spec.json) の `"scopes": [...]` セクション
- **生成される XML 実例**: `src/main/conf/oauth-client-scopes-config/sample_oauth.xml`

spec.json の `scopes[]` フィールドと XML 要素の対応は上記「要素・属性一覧」を参照。

## 命名ルール（推奨）

- `scope/@id` は **アプリケーション名や機能名を反映した一意な ID** にすること
- 文字種: 小文字英数字・アンダースコア（例: `account_read`, `equipment_lending`）
- 業界標準で `openid` / `profile` / `email` 等の値は OpenID Connect 用に予約される可能性があるため、独自の scope は別名にする
- 1 機能で **read / write を分ける場合は scope を分割** する（例: `equipment_read`, `equipment_write`）

## チェックリスト

- [ ] `scope/@id` がプロジェクト内で一意か
- [ ] `default-subject` が空文字でないか
- [ ] 利用するロケール（`ja` / `en` / `zh_CN` 等）すべてに `<localize>` を用意したか
- [ ] `oauth-client-resources-config` / `oauth-client-details-config` 側で同じ `id` を参照しているか
