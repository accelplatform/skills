# IM-LogicDesigner インポート仕様

テナント環境セットアップ時に、IM-LogicDesigner のインポートデータ（ZIP）を `LogicFlowImporter` 経由で取り込む。IM-Workflow と異なり、`<data>` セクション分割は不要で、エクスポート時の ZIP をそのまま `importData(InputStream)` に渡す。

## spec.json での指定

```json
"logicImport": {
  "files": [
    "im-logicdesigner-data-sample-simple.zip"
  ]
}
```

| フィールド | 型 | 内容 |
|---|---|---|
| `logicImport.files` | string[] | `src/main/storage/public/im_logic/` 配下のファイル名を列挙。複数指定可能。指定順に取り込まれる |

省略時または `files` が空配列のときは何も出力されない。

## ビルド時の生成物

build スクリプトは以下を出力する。

| 種別 | パス |
|---|---|
| インポート ZIP（コピー） | `src/main/storage/system/products/import/basic/<key>/<version>/<file>.zip` |
| 拡張インポート JS | `src/main/jssp/src/<key>/initialize/<version>/<key>_logic_import.js` |
| import-config.xml への追加 | `<extends-import>` セクションに `<extends-import-class>` 行を追加 |

### コピー処理

`src/main/storage/public/im_logic/<file>.zip` を `src/main/storage/system/products/import/basic/<key>/<version>/<file>.zip` にコピーする。サブディレクトリは設けず、`<version>/` 直下にフラットに配置する（IM-Workflow と同じ）。

### 拡張インポート JS

`<key>_logic_import.js` は `doImport(tenantId)` をエントリポイントとし、`spec.logicImport.files` の順に各 ZIP を読み込んで取り込む。

`spec.extendsImport` / `workflowImport` / `logicImport` を併用した場合、それぞれの JS が独立して生成され、`<extends-import>` セクションに **以下の順で並列出力** される:

```
<extends-import-class>...<key>_import.js</extends-import-class>             ← extendsImport
<extends-import-class>...<key>_workflow_import.js</extends-import-class>    ← workflowImport
<extends-import-class>...<key>_logic_import.js</extends-import-class>       ← logicImport
```

## 拡張インポート JS の処理内容

```
doImport(tenantId)
  ├ LogicServiceProvider.getInstance().getLogicFlowImporter()  Java 直接アクセスで importer 取得
  └ for each sourceFile:
      importLogicFile()
        ├ readAllBytes()       SystemStorage の全バイトを Java byte[] に集約
        ├ ByteArrayInputStream を生成
        ├ importer.importData(inputStream)
        └ inputStream.close()（finally）

readAllBytes(sourceStorage)
  ├ ByteArrayOutputStream を確保
  ├ ByteReader#eachBytes で chunk（8KB 単位）ごとに output へ追記
  └ output.toByteArray() で Java byte[] を取り出す
```

## API 利用方法

### Java 直接アクセスが必要

IM-LogicDesigner には、IM-Workflow の `DataImportExecutor` に相当する **汎用 SSJS API が公開されていない**。`jp.co.intra_mart.foundation.logic.LogicFlowImporter` は Java インタフェースで、SSJS からは `Packages.***` 経由で参照する。

```javascript
let importer = Packages.jp.co.intra_mart.foundation.logic.LogicServiceProvider
  .getInstance()
  .getLogicFlowImporter();
importer.importData(inputStream);
```

これは `.agents/requirements/jssp-security/AGENTS.md` の「Java 直接アクセス禁止」原則の例外となる用途。**業務 SSJS では一律禁止**、**テナント環境セットアップの拡張インポート JS でのみ容認** する。理由:

- IM-LogicDesigner の取り込みは SSJS API では実現できず、Java 経由しか手段がない
- 拡張インポート JS はテナント管理用の特殊なエントリポイントで、外部入力を扱わないため攻撃面が限定的
- WF と統一感のある実装手順を提供することで、ユーザのアプリ初期化処理を統一できる

### LogicFlowImporter#importData の挙動

| シグネチャ | 動作 |
|---|---|
| `importData(InputStream stream)` | 上書きなし。既存データと衝突するとエラー、トランザクションロールバック |
| `importData(InputStream stream, boolean isUpdate)` | `isUpdate=true` で既存データを上書き可 |

スケルトン JS は **上書きなし版**（第 1 引数のみ）を採用。再投入時の挙動は IM-Workflow と同様 `configNumber` 分割運用で制御することを想定する。上書きが必要な運用なら、生成後の JS で `importer.importData(inputStream, true)` に書き換える。

### InputStream の作り方

`SystemStorage` は外部ストレージプラグインや分散構成（AP サーバとストレージサーバが別ノード）の可能性があり、`getCanonicalPath()` で取得したローカルパスから `FileInputStream` で開けないことがある。そのため、**`openAsBinary()` で取得した `ByteReader` から全バイトをメモリに読み出し、Java の `ByteArrayInputStream` 経由で渡す** 方式を採用する。

```javascript
function readAllBytes(sourceStorage) {
  let output = new Packages.java.io.ByteArrayOutputStream();
  let reader = sourceStorage.openAsBinary();
  try {
    reader.eachBytes(function (chunk, index, bytesRead) {
      for (let i = 0; i < bytesRead; i++) {
        output.write(chunk[i]);
      }
    }, 8192);
  } finally {
    reader.close();
  }
  return output.toByteArray();
}

let byteArray = readAllBytes(sourceStorage);
let inputStream = new Packages.java.io.ByteArrayInputStream(byteArray);
```

`ByteReader#eachBytes` は chunk size を指定したコールバック方式で、JavaScript 側で 1 バイトずつ `ByteArrayOutputStream.write(int)` へ転記する。chunk size 8KB はストレージ I/O の標準的なバッファサイズ。

**メモリ消費**: 取り込みファイル全体をメモリに展開するため、極端に大きい ZIP（数百 MB 以上）には不向き。一般的な IM-LogicDesigner のエクスポート ZIP は数 MB 程度であり、テナント環境セットアップ時の単発実行ならメモリ負荷は問題にならない想定。

## 実行タイミング

`<extends-import>` セクションの JS は、その config 内のテナントマスタ（database / authz / menu / job 等）が投入された直後に呼ばれる。詳細は [extends-import.md](extends-import.md) を参照。

## ルーティング向け認可ポリシーの投入順序

LogicDesigner のロジックフローに **ルーティング定義（REST API エンドポイント）が含まれる場合**、インポート時に `flow_route.json` の `authzUri`（例: `im-logic-rest://<flowId>`）に対する認可リソースが自動生成される（type は `im-logic-rest`）。このリソースを参照する `authz-policy` は **同じ config 内で投入できない**。

### 問題

`config-N.xml` の実行順序は [extends-import.md](extends-import.md) のとおり:

```
database → tenant-master(authz / menu / job) → extends-import(doImport)
```

`<authz-policy-file>` は `<tenant-master>` 配下で評価されるため、LogicDesigner 拡張インポートが走る **前** に処理される。ルーティングが作るリソースを参照するポリシーを同じ config に書くと、リソース未登録のまま参照されて Importer がエラーになる。

### 解決策: configNumber を分割する

`spec.configNumber` を分けて、ポリシー専用の `config-(N+1).xml` を別途生成する。Importer は config 番号順に実行するため、後続 config の投入時点ではルーティングのリソースが登録済みになる。

| config | 内容 |
|---|---|
| `config-1.xml` | `logicImport` で LogicDesigner を取り込む（URI リソースが生成される） |
| `config-2.xml` | LogicDesigner ルーティング向け `authzPolicies` のみ記述（既存リソースを参照する） |

build スクリプトは `configNumber >= 2` のとき、ファイル名のベース部末尾に `-<N>` サフィックスを付与する（例: `equip-authz-policy-2.xml`）。詳細は [import-config.md](import-config.md#configNumber--1-のファイル名サフィックス) を参照。

### spec.json の構成例

初版 spec.json（LogicDesigner 取り込み）:

```jsonc
{
  "key": "any_app",
  "version": "1.0.0",
  "configNumber": 1,
  "logicImport": { "files": ["any_app-logic.zip"] }
  // authzPolicies には LogicDesigner ルーティング向けは含めない
}
```

ポリシー追加用 spec.json（同一バージョンで投入する場合は `version` は据え置きで可）:

```jsonc
{
  "key": "any_app",
  "version": "1.0.0",
  "configNumber": 2,
  "authzPolicies": [
    {
      "resource": "<authzUri の SHA-256 ハッシュ>",
      "type": "im-logic-rest",
      "action": "execute",
      "subject": "S(b_m_role:app_user)",
      "effect": "PERMIT"
    }
  ]
}
```

`type` は `im-logic-rest` を指定する（`service` ではない点に注意）。リソース ID（URI ハッシュ）の書き方は [authz-policy.md](authz-policy.md) を参照。

### ルーティングのリソース ID と type

LogicDesigner ルーティングが生成する認可リソースを `authzPolicies` で指定する場合:

| フィールド | 値 |
|---|---|
| `type` | `im-logic-rest`（**`service` ではない**） |
| `resource` | `flow_route.json` の `authzUri` 文字列の **SHA-256 ハッシュ（16 進数 lowercase）** |
| `action` | `execute` |

```
authzUri: "im-logic-rest://sample_simple"
↓ SHA-256
resource: "d01beab0f047ab86a94e9358a800a5f1119a5465486a94d011d9ca1243ee7f62"
type:     "im-logic-rest"
```

`type` を `service` にすると、リソースが LogicDesigner の `im-logic-rest` 名前空間に登録されているため **ポリシーが実リソースに紐付かず、Importer 実行時にサイレントに無視される**（エラーは出ないが認可が効かない）ので注意。

### 注意

- LogicDesigner ルーティング **以外** の通常リソース／ポリシーは `config-1.xml` に含めて問題ない。`config-2.xml` に切り出すのは **ルーティング向けポリシーだけ**
- 同一バージョンで `config-1` / `config-2` を運用する場合、`build-setup-import.js` を 2 つの spec.json で 2 回実行する
- 既存ファイル保護により、`config-1` 生成後に `configNumber: 2` の spec.json を流しても、`config-1.xml` や `1.0.0/` 配下の suffix なしファイルは上書きされない（新規分は `-2` 付きで出力される）
- ルーティングを追加するバージョンアップでは、その config のポリシーをさらに `config-(N+2).xml` などへ分離する運用が継続する

## 必須バージョン

| API | 必須バージョン |
|---|---|
| `LogicFlowImporter` | 8.0.0 以降（intra-mart 8 系全般） |
| `SystemStorage` / `ByteReader` | 8.0.37 (2025 Spring) 以降 |

`SystemStorage` / `ByteReader` の SSJS API は 8.0.37 以降なので、それ以前の環境ではこのスキルから生成された JS は動かない。

## バージョンアップ運用

- 取り込み ZIP の差分が出る場合は、`spec.configNumber` を 2, 3, ... と増やし、対応する `spec.version` 配下に新しい ZIP を配置する
- 旧バージョンディレクトリのファイル（コピー先 ZIP、`<version>/<key>_logic_import.js`）には触れない
- build スクリプトの既存ファイル保護により、誤上書きは防がれる（意図的な上書きは `--force`）

## 注意点

| 項目 | 内容 |
|---|---|
| トランザクション | `LogicFlowImporter#importData` 内部で独自トランザクションを張るため、`doImport` 側で `Transaction.begin` で包まない |
| ファイル形式 | LogicFlowImporter が受け付ける形式は **IM-LogicDesigner のエクスポート ZIP**。手作りした ZIP や別形式は不可 |
| エラー時挙動 | `LogicServiceException` がスローされると拡張インポート JS の `catch` が拾い、再 throw して Importer 全体を失敗扱いにする |
| ストレージ構成依存 | `SystemStorage` が AP サーバとは別ホスト・別マウントの場合でも、`openAsBinary()` 経由で透過的に読めるためコード変更は不要 |
| メモリ消費 | `byte[]` をメモリ全展開する。極端に大きい ZIP（数百 MB 以上）を扱う必要が出たら、ストリーミング方式（chunk ごとに `importData` へ渡す中間 InputStream を自作）への切り替えを検討する |

## 関連 reference

- [extends-import.md](extends-import.md): 拡張インポート JS 全般の仕様
- [workflow-import.md](workflow-import.md): IM-Workflow インポート（兄弟機能）
- [import-config.md](import-config.md): import-`<artifactId>`-config-`<N>`.xml の構造（`<extends-import>` セクション）
