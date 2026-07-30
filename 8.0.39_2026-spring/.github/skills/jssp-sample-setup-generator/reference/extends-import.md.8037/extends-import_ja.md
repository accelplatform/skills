# 拡張インポート（doImport）仕様

`<extends-import-class>` で参照する JSSP のスクリプト。`<extends-import>` セクションの記述順で順次呼び出される。

エントリーポイント `doImport(tenantId)` の仕様・利用可能な API・トランザクション制御のパターン・サンプル実装はテナント環境セットアップと同一。
`.github/skills/jssp-tenant-setup-generator/reference/extends-import.md` を参照。

## 差分

| | テナント環境セットアップ | **サンプルデータセットアップ** |
|---|---|---|
| 配置パス | `jssp/src/<key>/initialize/<version>/<key>_import.js` | `jssp/src/<key>/initialize/<key>_import.js`（`<version>` なし） |
| 再実行 | セットアップ済みはスキップ | **毎回実行される** → べき等必須 |
| 例外時 | Importer 全体が即時停止 | **後続処理は継続実行される** → ログ必須 |
| 順序制御 | `configNumber` 分割 または 記述順 | **記述順のみ** |

```xml
<extends-import>
  <extends-import-class>any_app/initialize/any_app_import.js</extends-import-class>
</extends-import>
```

## 実行順序

```
database(DDL → DML) → tenant-master(role/authz/menu/job) → extends-import(doImport)
```

`doImport` はテナントマスタ投入直後に呼ばれる。設定ファイルは 1 つしか作れないため、config 分割による順序制御はできない。

| やりたいこと | 手段 |
|---|---|
| 複数の拡張インポート間の順序制御 | `<extends-import-class>` の記述順 |
| テナントマスタを拡張インポートの後に投入 | **不可能**。テナント環境セットアップ側（`configNumber` 分割）で行う |

具体例: [imw-logic-plugin-import.md](imw-logic-plugin-import.md)、[logic-import.md](logic-import.md#ルーティング向け認可ポリシーは投入できない)

## べき等性

毎回実行されるため、再実行しても同じ結果になるよう実装する。

| パターン | 実装方針 |
|---|---|
| データ投入 | 洗い替え（削除 → 作成）が確実。または存在チェック後の INSERT |
| ファイル配置 | 既存チェックしてから書く。または常に上書き |
| 外部システム連携 | 二重実行しても副作用がないことを確認する |

洗い替えの実例は [imw-logic-plugin-import.md](imw-logic-plugin-import.md)（`deleteLogicFlow` → `createLogicFlow`）。

## エラー検知

例外を投げても Importer 全体は止まらない（後続のセットアップ処理が継続実行される）。**`Logger` による開始 / 完了 / 例外のログ出力が必須。** ログがないと失敗を見逃す。

## spec.json での指定

```json
"extendsImport": true
```

`true` で空の `doImport(tenantId)` スケルトンを生成し、`<extends-import-class>` 行を追加する。実装は生成後に追記する。
