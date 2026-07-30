# IM-Workflow インポート仕様

テナント環境セットアップ時に、IM-Workflow のインポートデータ（コンテンツ / ルート / フロー / 案件プロパティ / ルール）を `DataImportExecutor` 経由で取り込む。Importer の標準 `<tenant-master>` セクションには IM-Workflow 専用要素が無いため、拡張インポート JS（`doImport`）から `WorkflowXmlImporter` を呼び出す形を取る。

## spec.json での指定

```json
"workflowImport": {
  "files": [
    "im_workflow-simple_approval-import.xml"
  ]
}
```

| フィールド | 型 | 内容 |
|---|---|---|
| `workflowImport.files` | string[] | `src/main/storage/public/im_workflow/` 配下のファイル名を列挙。複数指定可能。指定順に取り込まれる |

省略時または `files` が空配列のときは何も出力されない。

## ビルド時の生成物

build スクリプトは以下を出力する。

| 種別 | パス |
|---|---|
| インポート XML（コピー） | `src/main/storage/system/products/import/basic/<key>/<version>/<file>.xml` |
| 拡張インポート JS | `src/main/jssp/src/<key>/initialize/<version>/<key>_workflow_import.js` |
| import-config.xml への追加 | `<extends-import>` セクションに `<extends-import-class>` 行を追加 |

### コピー処理

`src/main/storage/public/im_workflow/<file>.xml` を `src/main/storage/system/products/import/basic/<key>/<version>/<file>.xml` にコピーする。サブディレクトリは設けず、`<version>/` 直下にフラットに配置する。

### 拡張インポート JS

`<key>_workflow_import.js` は `doImport(tenantId)` をエントリポイントとし、`spec.workflowImport.files` の順に各 XML を読み込んで取り込む。

`spec.extendsImport === true` も併用した場合、`<key>_import.js` と `<key>_workflow_import.js` の **両方** が生成され、`<extends-import>` セクションに **両方が並列で出力される**（`<key>_import.js` → `<key>_workflow_import.js` の順）。アプリ固有の初期化と WF インポートは別関心事として分離する。

## 拡張インポート JS の処理内容

```
doImport(tenantId)
  ├ resolveTenantLocaleId(tenantId)         テナントのデフォルトロケール取得（失敗時は 'ja' フォールバック）
  └ for each sourceFile:
      importWorkflowFile()
        ├ SystemStorage で XML を UTF-16 で読込
        └ for each dataType ('matter_property' → 'rule' → 'contents' → 'route' → 'flow'):
            importSingleSection()
              ├ extractTopLevelSections() で該当タグの全ブロックを配列で切り出し
              └ for each block:
                  importSectionBody()
                    ├ 一時 XML として UTF-16 で書き出し
                    ├ executeImport() で DataImportExecutor.importData() 呼び出し
                    └ 一時ファイルを削除（finally）
```

### dataType の値

`WorkflowXmlImporter` が認識する `dataType` オプションは `<data>` 直下のタグ名と一致する。取り込み順序は **参照される側 → 参照する側**:

| 順序 | dataType | XML タグ | 用途 |
|---|---|---|---|
| 1 | `matter_property` | `<matter_property>` | 案件プロパティ |
| 2 | `rule` | `<rule>` | 分岐ルール |
| 3 | `contents` | `<contents>` | コンテンツ定義 |
| 4 | `route` | `<route>` | ルート定義 |
| 5 | `flow` | `<flow>` | フロー定義 |

元 XML に該当セクションが存在しないときは info ログを出してスキップする。

### XML の分割

`WorkflowXmlImporter` は **1 回の `importData` 呼び出しに対し、`dataType` に対応する単一セクションをルート要素とする XML** を要求する。元のインポート XML は `<data>` 直下に複数セクションをまとめて格納しているため、`extractTopLevelSections` で該当セクションを切り出し、`<?xml version="1.0" encoding="UTF-16"?>` を付加した一時 XML として再構成してから渡す。

`<contents>` / `<route>` / `<flow>` / `<matter_property>` は通常 1 セクションのみだが、`<rule>`（分岐ルール）は複数の申請パターンに対応するため `<data>` 直下に同名タグが連続して並ぶことが多い。`extractTopLevelSections` は該当タグの出現箇所をすべて走査し、**配列で全ブロックを返す**（`indexOf` の単発検索ではなく、1 件見つけるごとに検索位置を進めてループする）。`importSingleSection` はこの配列を受け取り、`importSectionBody` で 1 ブロックずつ個別に一時 XML 化・`importData` 呼び出しを行うため、同名タグが何個並んでいても取りこぼさない。

`extractTopLevelSections` は **行頭インデント 2 スペース** のタグだけをトップレベルとして拾うため、ネストされた同名タグ（例: `<contents>` 内の `<contents>`）に誤マッチしない。元 XML のインデントが 2 スペース以外になった場合は調整が必要。

### 一時ファイル

一時 XML は `tmp/<key>_<tenantId>_<dataType>_<index>.xml` というパスで **PublicStorage** 配下に作成し、`finally` で必ず削除する。テナント ID・dataType・key に加え、同名タグが複数並ぶ場合を想定して連番 `index`（`extractTopLevelSections` が返す配列内の位置）を含めることで、並列実行や複数テナント取り込み時の衝突を回避する。

書き込み前に `ensureTemporaryDirectory()` を呼び、PublicStorage の `tmp/` ディレクトリが存在しない場合は `makeDirectories()` で作成する。SystemStorage では未作成ディレクトリへの書き込みが失敗するため、PublicStorage を採用し、加えて `tmp/` の事前作成を保証している。

## 実行タイミング

`<extends-import>` セクションの JS は、その config 内のテナントマスタ（database / authz / menu / job 等）が投入された直後に呼ばれる。詳細は [extends-import.md](extends-import.md) を参照。

## 必須バージョン

| API | 必須バージョン |
|---|---|
| `DataImportExecutor` | 8.0.37 (2025 Spring) 以降 |
| `ByteReader` | 8.0.37 (2025 Spring) 以降 |
| `SystemStorage` | 8.0.37 (2025 Spring) 以降 |
| `TenantInfoManager` | 8.0.37 (2025 Spring) 以降 |

それ以前の環境では SSJS から WF データをインポートできない（管理画面または CLI からの取り込みに限られる）。

## バージョンアップ運用

- インポート XML の差分が出る場合は、`spec.configNumber` を 2, 3, ... と増やし、対応する `spec.version` 配下に新しい WF XML を配置する
- 旧バージョンディレクトリのファイル（コピー先 XML、`<version>/<key>_workflow_import.js`）には触れない
- build スクリプトの既存ファイル保護により、誤上書きは防がれる（意図的な上書きは `--force`）

## 注意点

| 項目 | 内容 |
|---|---|
| 文字エンコーディング | 元 XML は **UTF-16**。読込・一時書出し・XML 宣言の 3 箇所を UTF-16 で揃える |
| インデント | `<data>` 直下のタグは 2 スペースインデントが前提。スキル外で生成された XML をインポートする際は要確認 |
| トランザクション | `DataImportExecutor` 内部で独自トランザクションを張るため、`doImport` 側で `Transaction.begin` で包まない |
| べき等性 | 同じ XML を再投入すると更新扱いになるか弾かれるかは ID と版数の運用次第。`configNumber` の分割運用で再実行されないよう制御する |
| エラー時挙動 | `executor.importData` の結果が `error` または `!success` だと例外を投げ、`doImport` 全体が失敗扱いになる。Importer 全体も失敗扱いになるため、テナントマスタが中途半端な状態にならないよう注意 |

## 関連 reference

- [extends-import.md](extends-import.md): 拡張インポート JS 全般の仕様
- [import-config.md](import-config.md): import-`<artifactId>`-config-`<N>`.xml の構造（`<extends-import>` セクション）
