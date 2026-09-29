# IM-LogicDesigner インポート仕様

サンプルデータセットアップ時に、IM-LogicDesigner のインポートデータ（ZIP）を `LogicFlowImporter` 経由で取り込む。

`logicImport.files` の指定方法・生成 JS の処理フロー・Java 直接アクセス（`Packages.***`）が必要な理由と容認の根拠・`InputStream` の作り方・トランザクション・必須バージョンはテナント環境セットアップと同一。
`.agents/skills/jssp-tenant-setup-generator/reference/logic-import.md` を参照。

## 差分

| | テナント環境セットアップ | **サンプルデータセットアップ** |
|---|---|---|
| インポート ZIP のコピー先 | `storage/system/products/import/basic/<key>/<version>/<file>.zip` | `storage/system/products/import/sample/<key>/<file>.zip` |
| 拡張インポート JS | `jssp/src/<key>/initialize/<version>/<key>_logic_import.js` | `jssp/src/<key>/initialize/<key>_logic_import.js` |
| `importData` のシグネチャ | `importData(inputStream)`（上書きなし） | **`importData(inputStream, true)`（上書きあり）** |
| ルーティング向け認可ポリシー | `configNumber` 分割で投入可 | **投入不可** |
| エラー時 | Importer 全体が即時停止 | **後続処理は継続実行される** |

コピー元（`src/main/storage/public/im_logic/`）は同じ。

**ユーザが明示的に指示した場合のみ** `logicImport` を追加する（SKILL.md「デフォルトポリシー」参照）。

## `importData` は上書きあり版を使う

毎回実行され、config 分割による再実行防止もできないため、上書きなし版では 2 回目以降必ず衝突エラーになる。

```javascript
// 第 2 引数 true: 既存フローを上書きする
importer.importData(inputStream, true);
```

上書きを避ける場合は生成後の JS で `importer.importData(inputStream)` に書き換える（2 回目以降のエラーを許容することになる）。

## ルーティング向け認可ポリシーは投入できない

ロジックフローにルーティング定義が含まれる場合、インポート時に `flow_route.json` の `authzUri`（例: `im-logic-rest://<flowId>`）に対する認可リソースが自動生成される（type は `im-logic-rest`）。

**このリソースを参照する `authz-policy` はサンプルデータセットアップでは投入できない。**

実行順序:

```
database → tenant-master(authz / menu / job) → extends-import(doImport)
```

`<authz-policy-file>` は `<tenant-master>` 配下で、LogicDesigner 拡張インポートより **前** に処理される。リソース未登録のまま投入され、**Importer がエラーになる（後続処理は継続する）**。テナント環境セットアップでは `configNumber` を分けて解決できるが、**サンプルデータセットアップは設定ファイルを 1 つしか作れないため分割できない。**

**対処**: テナント環境セットアップ側（`jssp-tenant-setup-generator` の `configNumber` 分割）で投入する。ポリシーの書き方（`type` は `service` ではなく `im-logic-rest`、`resource` は `authzUri` の SHA-256）は
`.agents/skills/jssp-tenant-setup-generator/reference/logic-import.md` の「ルーティング向け認可ポリシーの投入順序」を参照。

build スクリプトは `type="im-logic-rest"` を検出すると警告を出す。

## エラー検知

`LogicServiceException` がスローされると `catch` が拾い再 throw するが、**後続のセットアップ処理は継続実行される**。`<key>.logic_import` ロガーに `logic import completed.` が出ているか確認する。

## 資材の更新

1. `storage/public/im_logic/` の元 ZIP を更新
2. `--force` を付けて build スクリプトを再実行（`storage/system` 配下のコピーを上書き）

旧バージョンディレクトリを残す運用は行わない。

## 関連 reference

- [extends-import.md](extends-import.md)
- [workflow-import.md](workflow-import.md)
- [imw-logic-plugin-import.md](imw-logic-plugin-import.md)
