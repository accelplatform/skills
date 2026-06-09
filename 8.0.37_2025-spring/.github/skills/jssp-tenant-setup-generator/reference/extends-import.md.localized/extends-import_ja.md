# 拡張インポート（doImport）仕様

`<extends-import-class>` で参照する JSSP のスクリプト。`import-<artifactId>-config-N.xml` 内の **`<extends-import>` セクションの順序で順次呼び出される**。Importer の標準処理では行えないアプリ固有の初期化を実装する。

## 実行順序

intra-mart Importer は config-1.xml → config-2.xml → ... を **番号順に** 実行する。各 config 内では `<database>` → `<tenant-master>`（authz / menu / job 等）→ `<extends-import>` の順で処理される。

例: `config-1.xml` と `config-2.xml` がある場合の実行順:

```
config-1.xml: database → tenant-master(authz/menu/job) → extends-import(doImport)
config-2.xml: database → tenant-master(authz/menu/job) → extends-import(doImport)
```

つまり `config-1.xml` の `doImport` は **その config のテナントマスタが投入された直後** に呼ばれる。テナント環境セットアップ全体の最後ではない。

### バージョンアップ時の含意

- `config-1.xml` の `doImport` は、**そのバージョン (config-1) で投入されたマスタ** を前提に動く
- `config-2.xml` で追加されるマスタは、`config-1.xml` の `doImport` 実行時点ではまだ存在しない
- 各バージョンの `doImport` は、**自分の config 番号で投入された範囲** のみに依存するよう実装する

## 配置パス

```
src/main/jssp/src/<key>/initialize/<version>/<key>_import.js
```

`import-<artifactId>-config-1.xml` 内の `<extends-import-class>` は `src/main/jssp/src` からの相対パスで書く。

```xml
<extends-import>
  <extends-import-class>any_app/initialize/1.0.0/any_app_import.js</extends-import-class>
</extends-import>
```

**拡張子 `.js` は含める**（IM-Workflow と異なる点）。

`spec.configNumber >= 2` の場合、JS ファイル名末尾に `-<N>` サフィックスが付与される（例: `<key>_import-2.js`）。詳細は [import-config.md](import-config.md#configNumber--1-のファイル名サフィックス) を参照。
`<version>` の決定優先順位: spec.json の `"version"` → プロジェクトルートの `module.xml` または `pom.xml` の `<version>` → `1.0.0`。バージョンアップ時は新バージョンディレクトリに JS を新規生成して切り替える。

## エントリーポイント

```javascript
function doImport(tenantId) {
    // この config 内のテナントマスタ投入後に呼ばれる初期化処理を記述
}
```

| 引数 | 型 | 内容 |
|------|-----|------|
| `tenantId` | string | セットアップ対象のテナント ID |

戻り値は不要。例外をスローすると Importer 全体が失敗扱いになる。

## よくある用途

| 用途 | 実装例 |
|------|--------|
| 初期データの投入（DML では足りないもの） | `TenantDatabase.execute(...)` で INSERT |
| 初期設定ファイルの配置 | `PublicStorage.write(...)` |
| 既存システムとの同期 | 外部 API 呼び出し |
| マスタの整合性チェック | 投入後のレコード数チェック |

## 実装上の制約

- **Rhino JavaScript（ES5 互換）** で書く。`let` / `const` / アロー関数 / `import` / `export` は使えない
- **ファンクションコンテナと同等の API** が利用可能（`TenantDatabase`, `SystemStorage`, `PublicStorage`, `Logger` 等）
- スクリプト内でグローバル定義した関数は `doImport` 内から呼び出せる
- **テーブル操作（INSERT/UPDATE/DELETE）は `Transaction.begin(callback)` でトランザクション制御すること**。複数テーブルの整合性を保ち、途中失敗時にロールバックさせる
- `Transaction.begin` の戻り値（`DatabaseResult`）を必ず受け取り、`isSuccess()` で成否判定すること（戻り値を捨てると失敗が無視されてセットアップ全体が「成功」扱いになる）
- 例外処理は **必ず try/catch で覆い、Logger で記録してから再 throw** すること（標準ログだけだと運用時に原因追跡できない）

## サンプル実装

```javascript
function doImport(tenantId) {
    var logger = Logger.getLogger("any_app.initialize");
    logger.info("[any_app] doImport start. tenantId=" + tenantId);

    var businessError = null;
    var txResult = Transaction.begin(function() {
        try {
            var db = new TenantDatabase();
            // 例: アプリ固有の初期マスタ投入
            var result = db.execute(
                "INSERT INTO any_app_config (tenant_id, config_key, config_value) VALUES (?, ?, ?)",
                [
                    DbParameter.string(tenantId),
                    DbParameter.string("default_locale"),
                    DbParameter.string("ja")
                ]
            );
            if (result.error) {
                throw new Error("Failed to insert any_app_config: " + result.errorMessage);
            }
        } catch (e) {
            businessError = e;
            throw e;   // ロールバックのため再スロー
        }
    });

    if (businessError) {
        logger.error("[any_app] doImport failed.", businessError);
        throw businessError;
    }
    if (!txResult.isSuccess()) {
        var msg = "[any_app] doImport transaction failed: " + (txResult.errorMessage || "");
        logger.error(msg);
        throw new Error(msg);
    }

    logger.info("[any_app] doImport completed.");
}
```

### トランザクション制御のパターン

| パターン | 用途 |
|---|---|
| `Transaction.begin(callback)` でラップ | テーブル INSERT/UPDATE/DELETE（必須） |
| 戻り値 `txResult.isSuccess()` をチェック | トランザクション成否の判定（必須） |
| 業務例外を変数経由で外に運ぶ | コールバック内の `throw` は外側に伝搬しないため |

詳細は `{{AGENT_RULES}}/jssp-error-handling.instructions.md` および `jssp-page-generator/reference/post-generation-verification.md`（ステップ 3-7: Transaction.begin の戻り値チェック）も参照。

## spec.json での指定

```json
"extendsImport": true
```

`true` のとき、build スクリプトは空の `doImport(tenantId)` を持つスケルトン JS を生成し、`import-<artifactId>-config-1.xml` に `<extends-import-class>` 行を追加する。
`false` または省略時は生成しない。

実装は生成後にユーザが追記する。
