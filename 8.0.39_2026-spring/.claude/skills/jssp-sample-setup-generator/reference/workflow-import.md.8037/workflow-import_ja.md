# IM-Workflow インポート仕様

サンプルデータセットアップ時に、IM-Workflow のインポートデータ（コンテンツ / ルート / フロー / 案件プロパティ / ルール）を `DataImportExecutor` 経由で取り込む。

`workflowImport.files` の指定方法・生成 JS の処理フロー・`dataType` の取り込み順序・XML の分割（`extractTopLevelSections`。`<rule>` 等の同名タグが複数並ぶ場合も全ブロックを取り込む）・UTF-16 の扱い・一時ファイル・トランザクション・必須バージョン（8.0.37 以降）はテナント環境セットアップと同一。
`.claude/skills/jssp-tenant-setup-generator/reference/workflow-import.md` を参照。

## 差分

| | テナント環境セットアップ | **サンプルデータセットアップ** |
|---|---|---|
| インポート XML のコピー先 | `storage/system/products/import/basic/<key>/<version>/<file>.xml` | `storage/system/products/import/sample/<key>/<file>.xml` |
| 拡張インポート JS | `jssp/src/<key>/initialize/<version>/<key>_workflow_import.js` | `jssp/src/<key>/initialize/<key>_workflow_import.js` |
| 再投入の防止 | `configNumber` 分割 | **手段なし**（毎回実行される） |
| エラー時 | Importer 全体が即時停止 | **後続処理は継続実行される** |

コピー元（`src/main/storage/public/im_workflow/`）は同じ。

**ユーザが明示的に指示した場合のみ** `workflowImport` を追加する（SKILL.md「デフォルトポリシー」参照）。

## べき等性

同じ WF XML が毎回投入される。テナント環境セットアップでは `configNumber` の分割運用で再実行を防げたが、**サンプルデータセットアップにはその手段が無い**。再投入時に更新扱いになるか弾かれるかは WF 定義の ID と版数の運用次第。

| 手段 | 説明 |
|---|---|
| 再投入で更新扱いになる ID / 版数運用にする | WF 定義側の設計で対応（推奨） |
| エラーを許容する | 2 回目以降のエラーを運用上許容する（ログを必ず確認） |

**初回実行時と 2 回目実行時の両方のログを確認すること。**

## エラー検知

`executor.importData` の結果が `error` または `!success` だと例外を投げるが、**後続のセットアップ処理は継続実行される**。完了表示だけでは成功したか分からないため、`<key>.workflow_import` ロガーに `workflow import completed.` が出ているか確認する。

## 資材の更新

1. `storage/public/im_workflow/` の元 XML を更新
2. `--force` を付けて build スクリプトを再実行（`storage/system` 配下のコピーを上書き）

旧バージョンディレクトリを残す運用は行わない。

## 関連 reference

- [extends-import.md](extends-import.md)
- [logic-import.md](logic-import.md)
- [imw-logic-plugin-import.md](imw-logic-plugin-import.md): LD フローを WF プラグインとして登録する場合の実行順序
