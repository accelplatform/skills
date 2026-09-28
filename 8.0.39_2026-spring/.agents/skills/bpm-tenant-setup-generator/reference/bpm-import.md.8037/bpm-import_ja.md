# IM-BPM インポート仕様

テナント環境セットアップ時に、IM-BPM プロセスデザイナのプロジェクトを作成し、BPMN ファイルをアップロードする。Importer の標準セクションには IM-BPM 専用要素がないため、拡張インポート JS（`doImport`）から取り込む。

> **通信方式に関する注記**: BPM の REST API（`/api/bpm/webdesigner/...`）は拡張インポート JS の実行コンテキストでは認証エラーとなり利用できないため、REST API の実体である Java 実装クラス（`ProjectResourceImpl` / `ResourceResourceImpl`、`im_activiti_web_designer` モジュール）を `ProjectFactory` / `ResourceFactory` 経由で取得し、Rhino の LiveConnect 経由で直接呼び出す。実装メソッド内部の認可チェックは残るため、実行ユーザには BPM プロジェクトの編集・デプロイ権限が必要。

> **実装状況の注記**: 本ドキュメントが記述する `bpmImport` は、`.agents/skills/jssp-tenant-setup-generator/scripts/build-setup-import.js`（`workflowImport` / `logicImport` の実装元）には未対応。現時点でこのビルドスクリプトを実行しても `bpmImport` セクションからの生成物は出力されない。本ドキュメントの内容に沿って生成する場合は、ビルドスクリプト側の対応、または手動での `<extends-import-class>` 追記が必要になる。

## 目次

- [spec.json での指定](#specjson-での指定)
- [生成物](#生成物)
  - [コピー処理](#コピー処理)
- [拡張インポート JS の処理内容](#拡張インポート-js-の処理内容)
  - [例外ハンドリング](#例外ハンドリング)
- [Java 直接呼び出し詳細](#java-直接呼び出し詳細)
  - [プロジェクト存在チェック](#プロジェクト存在チェック)
  - [プロジェクト新規作成](#プロジェクト新規作成)
  - [BPMN リソース存在チェック](#bpmn-リソース存在チェック)
    - [resourceName の算出](#resourcename-の算出)
  - [BPMN アップロード／更新](#bpmn-アップロード更新)
    - [BPMN テキスト変換](#bpmn-テキスト変換)
- [必須バージョン](#必須バージョン)
- [バージョンアップ運用](#バージョンアップ運用)
- [注意点](#注意点)
- [実行タイミング](#実行タイミング)
- [関連 reference](#関連-reference)

## spec.json での指定

```json
"bpmImport": {
  "projectId": "any-app",
  "projectName": "Any App",
  "files": [
    "01_sample.bpmn",
    "02_other.bpmn"
  ]
}
```

| フィールド | 型 | 内容 |
|---|---|---|
| `bpmImport.projectId` | string | プロセスデザイナのプロジェクト ID。初期値は artifactId を提示してユーザが確認する |
| `bpmImport.projectName` | string | プロセスデザイナのプロジェクト名。初期値は pom.xml の `<name>` を提示してユーザが確認する |
| `bpmImport.files` | string[] | `src/main/storage/system/products/import/basic/<key>/<version>/` 配下にコピー済みの BPMN ファイル名を列挙。コピー元は `doc/<BPMプロセス名>-prompt/`（SKILL.md 生成手順のヒアリング工程で選択・コピーする）。複数指定可能。指定順にアップロードされる |

省略時または `files` が空配列のときは何も出力されない。

## 生成物

以下は build スクリプトではなく **SKILL.md の生成手順（ステップ 2〜3）に従って本スキルが直接生成・追記する**（未対応の詳細は冒頭の「実装状況の注記」を参照）。

| 種別 | パス |
|---|---|
| インポート BPMN（コピー） | `src/main/storage/system/products/import/basic/<key>/<version>/<file>.bpmn` |
| 拡張インポート JS | `src/main/jssp/src/<key>/initialize/<version>/<key>_bpm_import.js` |
| import-config.xml への追加 | `<extends-import>` セクションに `<extends-import-class>` 行を追加（手動追記） |

IM-Workflow / IM-LogicDesigner と同様に、BPMN ファイルは `storage/system` へコピーされる。`doImport` 実行時に `SystemStorage` から読み取り、Java クラスを直接呼び出してプロジェクト作成・アップロードを行う。

### コピー処理

`doc/<BPMプロセス名>-prompt/` 配下から選択した BPMN ファイルを `src/main/storage/system/products/import/basic/<key>/<version>/<file>.bpmn` にコピーする。サブディレクトリは設けず、`<version>/` 直下にフラットに配置する（SKILL.md 生成手順のヒアリング工程で実施）。

## 拡張インポート JS の処理内容

> **変数宣言は `var` を使う**: `.agents/requirements/jssp-code-style/AGENTS.md` は `let` を推奨しているが、拡張インポート JS は Rhino の ES5 互換コンテキストで実行されるため `let` / `const` / アロー関数が使えない（`.agents/skills/jssp-tenant-setup-generator/reference/extends-import.md` の「実装上の制約」）。本ドキュメントのサンプルもすべて `var` で統一している。

```
doImport(tenantId)
  ├ checkProjectExists(projectId)
  │    ProjectService.isExistProject(projectId) を直接呼び出し（boolean）
  │    ├ true : プロジェクトあり → BPMN アップロードへスキップ
  │    └ false: プロジェクトなし → createProject() へ
  ├ createProject()
  │    ProjectRequest を組み立て、ProjectFactory.getInstance().getProjectResource().post(projectRequest, null) を呼び出し
  └ for each file:
       uploadOrUpdateBpmnFile()
         ├ SystemStorage('products/import/basic/<key>/<version>/<file>.bpmn') でファイル取得（byte[]）
         ├ 取得した byte[] を UTF-8 文字列に変換（processDefinition 文字列として使用。詳細は「BPMN テキスト変換」を参照）
         ├ resourceName を算出（ファイル名から拡張子を除去し ResourceType.DEFINITION.getExtension()="`.bpmn`" を付与）
         ├ ★ 存在チェック ★
         │    ResourceService.getActiveResource(projectId, "DEFINITION", resourceName) を直接呼び出し
         │    ├ 非null: 既存リソースあり → 戻り値（ResourceEntity）の recordDate を ResourceRequest に設定 … 更新
         │    └ null  : 既存リソースなし → recordDate は設定しない                                    … 新規登録
         └ ResourceRequest を組み立て、ResourceFactory.getInstance().getResourceResource().post(resourceRequest, null, null) を呼び出し
              （post(ResourceRequest,...) オーバーロードを使用。理由は「BPMN アップロード／更新」「注意点」を参照）
```

### 例外ハンドリング

`doImport` 全体を try-catch で覆い、**エラーメッセージをログ出力したうえで再 throw** する（`.agents/skills/jssp-tenant-setup-generator/reference/extends-import.md` の「例外処理は必ず try/catch で覆い、Logger で記録してから再 throw」に従う）。再 throw により Importer 全体が失敗扱いになり、BPMN が取り込めていないことがセットアップ結果に現れる。握りつぶしてはならない。

ファイル単位で catch はせず、1 ファイルのアップロードに失敗した時点で **後続ファイルは処理せず中断**する。

```javascript
function doImport(tenantId) {
  var logger = Logger.getLogger('<key>.initialize.bpm');
  var index;

  logger.info('[<key>] BPM import started. tenantId={}', tenantId);

  try {
    if (!checkProjectExists(PROJECT_ID)) {
      createProject(PROJECT_ID, PROJECT_NAME);
      logger.info('[<key>] BPM project created. projectId={}', PROJECT_ID);
    }

    for (index = 0; index < BPMN_FILES.length; index += 1) {
      uploadOrUpdateBpmnFile(PROJECT_ID, BPMN_FILES[index]);
      logger.info('[<key>] BPMN imported. file={}', BPMN_FILES[index]);
    }
  } catch (error) {
    logger.error('[<key>] BPM import failed. error={}', toErrorMessage(error));
    throw error;   // Importer 全体を失敗扱いにするため再 throw する
  }

  logger.info('[<key>] BPM import completed. fileCount={}', BPMN_FILES.length);
}

/**
 * 例外からログ出力用のメッセージを取り出す。
 *
 * @param {*} error 例外
 * @return {string} ログ用メッセージ
 */
function toErrorMessage(error) {
  if (error && error.javaException && error.javaException.getMessage) {
    return String(error.javaException.getMessage());
  }
  if (error && error.getMessage) {
    return String(error.getMessage());
  }
  return String(error && (error.message || error));
}
```

`ActivitiWebDesignerException` は Java 例外のため、Rhino では `JavaException` としてラップされて catch される場合がある。`error.getMessage()` を直接呼ぶと `undefined` になり得るので、上記のように `error.javaException` を優先して参照するヘルパ経由でメッセージを取得する。

## Java 直接呼び出し詳細

### プロジェクト存在チェック

| 項目 | 内容 |
|---|---|
| クラス | `jp.co.intra_mart.activiti.webdesigner.service.ProjectService` |
| メソッド | `public static boolean isExistProject(String projectId)` |
| 戻り値 | `true`: プロジェクトあり → BPMN アップロードへ／`false`: プロジェクトなし → プロジェクト作成へ |

### プロジェクト新規作成

| 項目 | 内容 |
|---|---|
| 取得元 | `jp.co.intra_mart.activiti.webdesigner.rest.service.api.project.ProjectFactory#getInstance().getProjectResource()`（`ProjectResourceImpl` のシングルトンインスタンスを `ProjectResource` インタフェース型で返す） |
| メソッド | `public void post(ProjectRequest projectRequest, HttpServletRequest request)` |
| `request` 引数 | メソッド内部で参照されないため `null` で安全に呼び出し可能 |

`ProjectRequest`（`jp.co.intra_mart.activiti.webdesigner.rest.service.api.project.ProjectRequest`、Lombok `@Data` の Bean）の組み立て：

| setter | 値 |
|---|---|
| `setProjectId(String)` | `<projectId>` |
| `setProjectName(String)` | `<projectName>` |
| `setSortNumber(int)` | `0` |
| `setLocalizes(Map<Locale, ProjectLocalize>)` | 空の `java.util.HashMap`（内部の `ProjectService.insertLocal` / `ImBpmWebDesignerProjectResource.registerResource` は空マップ・null チェック済みのため、これで `NullPointerException` にはならない） |

成功時は戻り値なし（`void`）。失敗時は `ActivitiWebDesignerException` が throw される（プロジェクト ID/名必須チェック、権限チェックなど）。

### BPMN リソース存在チェック

| 項目 | 内容 |
|---|---|
| クラス | `jp.co.intra_mart.activiti.webdesigner.service.ResourceService` |
| メソッド | `public static ResourceEntity getActiveResource(String projectId, String resourceType, String resourceName)` |
| 引数 | `projectId`＝プロジェクト ID／`resourceType`＝`ResourceType.DEFINITION.getValue()`（`"DEFINITION"`）／`resourceName`＝下記「resourceName の算出」を参照 |
| 戻り値 | 同一 `projectId`+`resourceType`+`resourceName` の組で、現在アクティブな（`start_active_time`〜`end_active_time` の範囲内にある）リソースが存在すれば `ResourceEntity`、存在しなければ `null` |

`ProjectService.isExistProject` に相当する、リソース単位・boolean 型の存在チェック専用メソッドは存在しない。存在有無は本メソッドの戻り値が `null` かどうかで判定する。`ResourceEntity.resourceId`（バージョンごとに新規採番される内部キー）ではなく、`projectId`+`resourceType`+`resourceName` の組がリソースの実質的な識別単位である点に注意。

`ResourceEntity`（`jp.co.intra_mart.activiti.webdesigner.mirage.resource.ResourceEntity`）は `resourceId` / `projectId` / `resourceType` / `resourceName` / `recordDate`（親クラス `WebDesignerEntity` 由来、`java.sql.Timestamp`）等を public フィールドとして持つ。更新時はこの `recordDate` を後述の `ResourceRequest.setRecordDate()` にそのまま渡す。

#### resourceName の算出

`resourceName` はアップロードするファイル名から、実装（`ResourceResourceImpl.java` の `resourceType==null` 分岐）と同じロジックで算出する：拡張子を除去し、`ResourceType.DEFINITION.getExtension()`（`".bpmn"`）を付与する。

```javascript
var ResourceType = Packages.jp.co.intra_mart.activiti.webdesigner.common.ResourceType;
var extension = String(ResourceType.DEFINITION.getExtension());
var dotIndex = fileName.lastIndexOf('.');
var baseName = dotIndex > -1 ? fileName.substring(0, dotIndex) : fileName;
var resourceName = baseName + extension;
```

### BPMN アップロード／更新

| 項目 | 内容 |
|---|---|
| 取得元 | `jp.co.intra_mart.activiti.webdesigner.rest.service.api.resource.ResourceFactory#getInstance().getResourceResource()`（`ResourceResourceImpl` のシングルトンインスタンスを `ResourceResource` インタフェース型で返す） |
| メソッド | `public ResourceResponse post(ResourceRequest resourceRequest, HttpServletRequest request, HttpServletResponse response)` |

> **注意**: `post(AttachmentFile file, ..., Long recordDate, ...)` オーバーロード（`resourceType=null` 固定で呼ぶ旧方式）は、内部で `recordDate` 引数を一切参照しない実装になっているため更新に使えない（既存リソースがあると必ず `MSG_E_BPM_DESIGNER_RESOURCE_CREATED` 例外になる）。新規登録・更新のいずれも本節の `ResourceRequest` 方式に統一すること。

`ResourceRequest`（`jp.co.intra_mart.activiti.webdesigner.rest.service.api.resource.ResourceRequest`、Lombok `@Data` の Bean）の組み立て：

| setter | 値 |
|---|---|
| `setProjectId(String)` | `<projectId>` |
| `setResourceType(String)` | `ResourceType.DEFINITION.getValue()`（`"DEFINITION"`） |
| `setResourceName(String)` | 上記「resourceName の算出」で求めた値 |
| `setDescription(String)` | `""` |
| `setProcessDefinition(String)` | BPMN の中身（下記「BPMN テキスト変換」で得た文字列） |
| `setIsRegisterEvenInNG(Boolean)` | `false`（スキーマ／プロセスバリデーション NG 時は登録せず例外にする） |
| `setIsValidateProcess(Boolean)` | `false`（プロセスの妥当性検証は行わず、スキーマ検証のみ行う。既存の `post(AttachmentFile,...)` 経路と同じデフォルト値） |
| `setRecordDate(Timestamp)` | **既存リソースがある場合のみ**、「BPMN リソース存在チェック」で取得した `ResourceEntity.recordDate` を設定する（＝更新）。既存リソースが無い場合は呼ばない・未設定のままにする（＝新規登録） |

`request` / `response` 引数はこの呼び出しパスでは参照されないため `null` で安全に呼び出し可能。

戻り値は `ResourceResponse`（アップロード／更新されたリソース情報。新しく発番された `resourceId` を含む）。失敗時は `ActivitiWebDesignerException` が throw される（詳細は「注意点」参照）。

「更新」の実体は UPDATE 文による上書きではなく、**楽観排他によるバージョニング**である：`recordDate` を渡して `post` すると、既存リソースが `suspend`（`end_active_time` 更新＝履歴化）され、新しい `resourceId` で新バージョンが insert される。

#### BPMN テキスト変換

`ResourceRequest.setProcessDefinition(String)` は BPMN の中身を **文字列**として受け取る（`AttachmentFile` は使わない）。`SystemStorage` にファイル全体を文字列で返す `read(charsetName)` / `load()` は存在するが **いずれも `@deprecated`** であり、非 deprecated の `openAsText()` が返す `TextReader` には全文読み出しメソッドが無い（`readLine()` / `eachLine()` / `read(buffer, offset, length)` / `transferTo()` のみ）。そのため `openAsBinary()` で取得した `ByteReader` に対し、`SystemStorage#length()` で得たファイルサイズぶん事前確保したバッファへ `read(buffer, offset, length)` をループして読み込み（空配列のまま `read()` を呼ぶと常に 0 バイトになる落とし穴があるため、事前確保が必須）、得られた byte 列を UTF-8 文字列に変換する。

なお `length()` は `ByteReader` ではなく **`SystemStorage` 側**のメソッド（ファイルサイズ）である。`ByteReader` に `length()` は存在しない。

呼び出し側:

```javascript
var storage = new SystemStorage('products/import/basic/<key>/<version>/<file>.bpmn');
if (!storage.exists()) {
  throw new Error('BPMN file does not exist in SystemStorage: ' + storage.getPath());
}
request.setProcessDefinition(convertBytesToText(readAllBytes(storage)));
```

ヘルパ関数の実装（`<key>_bpm_import.js` にそのまま定義する）:

```javascript
/**
 * SystemStorage の全バイトを読み出す。
 *
 * @param {SystemStorage} storage 読み込み対象
 * @return {number[]} 全バイト（0〜255 の Number 配列）
 */
function readAllBytes(storage) {
  var reader = storage.openAsBinary();
  var length = Number(storage.length());
  var buffer = createZeroFilledBuffer(length);
  var offset = 0;
  var readLength;

  try {
    while (offset < length) {
      readLength = reader.read(buffer, offset, length - offset);
      if (readLength <= 0) {
        break;
      }
      offset += readLength;
    }
  } finally {
    reader.close();
  }

  if (offset !== length) {
    throw new Error('Failed to read complete BPMN file. expected=' + length + ', actual=' + offset);
  }
  return buffer;
}

/**
 * 指定長のゼロ初期化バッファを生成する。
 * 空配列のまま ByteReader#read() に渡すと常に 0 バイトしか読めないため、事前確保が必須。
 *
 * @param {number} length バッファ長
 * @return {number[]} ゼロ初期化バッファ
 */
function createZeroFilledBuffer(length) {
  var buffer = [];
  var index;

  for (index = 0; index < length; index += 1) {
    buffer.push(0);
  }
  return buffer;
}

/**
 * バイト列を UTF-8 文字列に変換する。
 *
 * @param {number[]} bytes バイト列
 * @return {string} UTF-8 テキスト
 */
function convertBytesToText(bytes) {
  // ActivitiUtils.getSystemXmlEncoding() の実装は 'UTF-8' 固定のため、直値で変換する
  return String(new Packages.java.lang.String(
    bytes,
    Packages.java.nio.charset.StandardCharsets.UTF_8
  ));
}
```

実装ノート:

| 項目 | 内容 |
|---|---|
| `reader.read()` の戻り値 | 読み取りバイト数／EOF で `-1`／失敗時 `null` の 3 値（`d.ts/platform/storage/im-ssjs-byte-reader.d.ts`）。`readLength <= 0` は `-1` と `null`（数値比較で `0` に変換されるため条件成立）の両方を捕捉してループを抜ける |
| 読み込み不足の検出 | ループ脱出後に `offset !== length` を判定し、一致しなければ例外にする。EOF・読み取り失敗のどちらで途中終了しても、不完全な BPMN が `setProcessDefinition()` に渡らない |
| `Number(storage.length())` | 戻り値を `Number()` でラップし、以降の比較・加算が確実に JS の数値演算になるようにする |
| `reader.close()` | `finally` で必ず実行する |
| メモリ消費 | ファイル全体をメモリに展開する。BPMN は通常数十〜数百 KB のため問題にならない |
| `convertBytesToText()` への引数 | `readAllBytes()` が返すのは 0〜255 の Number 配列。LiveConnect が JavaScript の Number 配列を Java の `byte[]` へ自動変換するため、`new java.io.ByteArrayInputStream(bytes)` 等と同様、`new java.lang.String(bytes, charset)` にもそのまま渡してよい |

## 必須バージョン

以下の点に留意する。

| 項目 | 内容 |
|---|---|
| 依存クラス | `ProjectService` / `ResourceService` / `ProjectFactory` / `ResourceFactory` / `ProjectResourceImpl` / `ResourceResourceImpl` / `ResourceRequest` / `ResourceEntity` / `ResourceType`（いずれも `im_activiti_web_designer` モジュール内の非公開実装クラス） |
| 互換性リスク | 上記は REST API のような公開契約ではなく、intra-mart のバージョンアップでメソッドシグネチャや内部ロジックが無予告で変更・削除される可能性がある。バージョンが変わった場合は再度実ソースで確認すること |
| `SystemStorage` | 引き続き BPMN ファイル読み取りに使用 |

## バージョンアップ運用

複数 config 運用の基本方針（`configNumber` の増分・差分のみ記述・既存ファイル不可侵の原則）は `.agents/skills/jssp-tenant-setup-generator/reference/multi-config.md` に準拠する。

本スキル固有の対象ファイルは以下の 2 つ:
- コピー先 BPMN（`<version>/<file>.bpmn`）
- `<key>_bpm_import.js`（`<version>/<key>_bpm_import.js`）

## 注意点

| 項目 | 内容 |
|---|---|
| 認可権限が必要 | REST 層のアノテーション（`@Secured`/`@Authz`）はバイパスされるが、実装メソッド内部の認可チェック（`ImBpmWebDesignerProjectResource.isEditAuthzResource` 等）は残る。テナント環境セットアップの実行コンテキスト（インポート実行ユーザ）に BPM プロジェクトの編集権限が必要。低レベル API（`ResourceService.terminateInsert` 等）を直接使うとこの認可チェックを迂回してしまうため使用しないこと |
| プロジェクトが既存の場合 | `ProjectService.isExistProject` が `true` を返した場合はプロジェクト作成をスキップし、BPMN アップロード（新規登録／更新の判定含む）のみ実行する |
| BPMN 重複アップロード（新規登録／更新の判定） | `ResourceService.getActiveResource(projectId, resourceType, resourceName)` の戻り値が `null` なら新規登録、非 `null` ならその `recordDate` を `ResourceRequest.setRecordDate()` に渡して更新する。詳細は「BPMN リソース存在チェック」「BPMN アップロード／更新」を参照。`recordDate` を渡さずに既存リソースへ `post` すると `MSG_E_BPM_DESIGNER_RESOURCE_CREATED` 例外になる |
| 楽観排他エラー | `setRecordDate()` に渡した値が、`post` 実行時点でのアクティブリソースの実際の `recordDate` と一致しない場合（インポート実行中に他ユーザ・他プロセスが同一リソースを更新した等）、`MSG_E_BPM_DESIGNER_RESOURCE_UPDATED` 例外になる。テナント環境セットアップの実行コンテキストでは通常発生しないが、想定外エラーとして catch すること |
| BPMN ファイルパス | `files` に指定するのはファイル名のみ（パス区切りなし）。`src/main/storage/system/products/import/basic/<key>/<version>/` 直下にコピー済みのファイルのみ対象（コピー元は `doc/<BPMプロセス名>-prompt/`） |
| トランザクション | `ProjectResourceImpl.post` / `ResourceResourceImpl.post` 内部で独自トランザクション（Mirage の `SessionTemplate`）を張るため、`doImport` 側で `Transaction.begin` で包まない |
| 例外ハンドリング | HTTP ステータスコードによる成否判定が無くなるため、`doImport` 全体を try-catch し、エラーメッセージをログ出力したうえで **再 throw** して Importer 全体を失敗扱いにする（握りつぶさない）。1 ファイルのアップロード失敗時は後続ファイルを処理せず中断する。実装は「拡張インポート JS の処理内容」の「例外ハンドリング」を参照。主な例外コードは `MSG_E_BPM_DESIGNER_PROJECT_IS_NOT_PERMIT`（編集権限なし）、`MSG_E_BPM_DESIGNER_PROJECT_DELETED`（プロジェクト不存在）、`MSG_E_BPM_DESIGNER_RESOURCE_CREATED`（存在チェック漏れ）、`MSG_E_BPM_DESIGNER_RESOURCE_UPDATED`（楽観排他競合）、`MSG_E_BPM_DESIGNER_RESOURCE_PROCESS_DEFINITION_CHECK_NG`（スキーマ／プロセス検証 NG）、`MSG_E_BPM_DESIGNER_RESOURCE_NAME_MAX_LENGTH`（リソース名長超過） |
| 内部 API 依存リスク | 呼び出し先はいずれも非公開の内部実装クラス。対象バージョンでの動作確認を行い、intra-mart のバージョンアップ時は本ドキュメントの前提（シグネチャ・引数の意味）を再確認すること |

## 実行タイミング

`<extends-import>` セクションの実行タイミング・呼び出し順序は `.agents/skills/jssp-tenant-setup-generator/reference/extends-import.md` を参照。`extendsImport` / `workflowImport` / `logicImport` を併用した場合の `<extends-import-class>` 出力順序は `.agents/skills/jssp-tenant-setup-generator/reference/logic-import.md` の順序図のとおり。

`bpmImport`（`<key>_bpm_import.js`）は上記の自動出力には含まれない（理由は冒頭の「実装状況の注記」参照）。手動追記する際は、既存の `<extends-import-class>` 行（`extendsImport` → `workflowImport` → `logicImport`）の **後ろ** に追加する。

## 関連 reference

- `.agents/skills/jssp-tenant-setup-generator/reference/extends-import.md`: 拡張インポート JS 全般の仕様
- `.agents/skills/jssp-tenant-setup-generator/reference/workflow-import.md`: IM-Workflow インポート（兄弟機能）
- `.agents/skills/jssp-tenant-setup-generator/reference/logic-import.md`: IM-LogicDesigner インポート（兄弟機能）
  - 同名の `readAllBytes()` を持つが、あちらは `ByteReader#eachBytes` + `java.io.ByteArrayOutputStream` で Java `byte[]` を得る方式。本スキルは「BPMN テキスト変換」の `read(buffer, offset, length)` 方式を採るため、両者を混同しないこと
- `.agents/skills/jssp-tenant-setup-generator/reference/import-config.md`: import-`<artifactId>`-config-`<N>`.xml の構造（`<extends-import>` セクション）
