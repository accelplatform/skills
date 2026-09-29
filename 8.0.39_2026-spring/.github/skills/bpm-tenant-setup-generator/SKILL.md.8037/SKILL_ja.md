---
name: bpm-tenant-setup-generator
description: 編集したBPMN（IM-BPM プロセスデザイナのBPMプロセス）ファイルを、intra-mart Accel Platform のテナント環境セットアップ（Importer）用資材一式に組み込む。「BPMNのインポートをセットアップに組み込んで」「BPMNをテナント環境セットアップで取り込みたい」「IM-BPMのプロセスをテナント環境にインポートしたい」「BPMプロセスをプロセスデザイナへ登録する資材を作って」と言及されたときに使用。
---

# テナント環境セットアップ資材生成スキル（BPMN用）

## 目的

jssp-tenant-setup-generator（`.github/skills/jssp-tenant-setup-generator/SKILL.md`）が生成するテナントセットアップ用資材に、BPMNファイルを組み込むためのスキル。
生成された資材は、テナント環境管理（テナント環境セットアップ）から取り込み可能。


## 生成対象

| カテゴリ | 出力ファイル | 多言語 |
|---------|-------------|--------|
| インポートBPMN（bpmn） | `storage/system` 配下にコピー | - |
| BPMN インポート JS | `<key>/initialize/<version>/<key>_bpm_import.js` | - |
| ロール・認可資材（未生成時のみリカバリー）|`.github/skills/jssp-tenant-setup-generator/SKILL.md`を参照|-|
| DDL（未生成時のみリカバリー）|`.github/skills/jssp-tenant-setup-generator/SKILL.md`を参照|-|
| import-config.xml への追加 | `<extends-import>` セクションに `<extends-import-class>` 行を追加（手動追記） | - |


## ファイル構成

```
bpm-tenant-setup-generator/
├── SKILL.md                            # このファイル
└── reference/
    └── bpm-import.md                   # BPMNのアップロード仕様
```

## 出力先

`.github/skills/jssp-tenant-setup-generator` の build スクリプト（`.github/skills/jssp-tenant-setup-generator/scripts/build-setup-import.js`）は `bpmImport` に未対応のため、以下は build スクリプトではなく本スキルの生成手順（ステップ 2〜3）で出力する。

| 種別 | 出力先 |
|------|--------|
| インポートBPMN（bpmn） | `src/main/storage/system/products/import/basic/<key>/<version>/<file>.bpmn` |
| BPMN インポート JS | `src/main/jssp/src/<key>/initialize/<version>/<key>_bpm_import.js` |
| ロール・認可資材（未生成時のみリカバリー）|`.github/skills/jssp-tenant-setup-generator/SKILL.md`を参照|
| DDL（未生成時のみリカバリー）|`.github/skills/jssp-tenant-setup-generator/SKILL.md`を参照|
| import-config.xml への追加 | `<extends-import>` セクションに `<extends-import-class>` 行を追加（手動追記） |

### import-config の選択規則

- 同一リリースの初回セットアップ資材を組み立てている途中で、既存の import-config にロール・認可・DDL等が生成済みの場合は、その**同じconfig（通常はconfig-1）**へBPMNインポート用の `<extends-import>` を追記する。configが存在することだけを理由にconfig番号を増やしてはならない。
- config-(N+1)を新規作成するのは、既存configがリリース済み・テナント投入済みで変更不可の場合、ユーザが差分リリース／バージョンアップを明示した場合、または実行順序を分離する必要がある場合に限る。該当するか不明で結果が変わる場合はユーザに確認する。
- 既存configに `<extends-import>` が無ければ、`<database>`・`<tenant-master>` の後へ新設する。既に存在する場合は、[reference/bpm-import.md](reference/bpm-import.md) の実行順序に従って `<extends-import-class>` を追加する。

- `<version>` は、`src/main/storage/system/products/import/basic/<key>/` 配下に既存のバージョンフォルダ（ロール・認可資材／DDL／BPMN 等が既に入っているフォルダ）があれば、**そのフォルダ名をそのまま使う**。BPMN 関連資材（インポートBPMN・`<key>_bpm_import.js`）だけを別の新しいバージョンフォルダに分けて生成してはならない。既存フォルダが無い場合（本スキルによる初回生成）のみ、`.github/skills/jssp-tenant-setup-generator/SKILL.md` の解決順位（spec.json の `version` → module.xml/pom.xml の `<version>` → `1.0.0`）に従って新規に決定する。
  - バージョンアップ（`spec.version` を上げて新バージョンフォルダを作る運用。`.github/skills/jssp-tenant-setup-generator/reference/multi-config.md` のパターン(I)）は、ユーザが明示的にバージョンアップを指示した場合のみ行う。本スキルの生成過程で AI からバージョンアップの要否を尋ねたり、pom.xml のバージョン変化を理由に自動的に新バージョンフォルダへ切り替えたりしてはならない。
- `<key>` の値は、`.github/skills/jssp-tenant-setup-generator/SKILL.md`に準拠する。
- `<file>`はコピー元ファイル名をそのまま引き継ぐ。

## 使用タイミング

ユーザが以下のような依頼をした場合:

- 「BPMNをテナント環境セットアップで取り込みたい」
- 「BPMNと生成した資材をテナント環境セットアップで取り込みたい」

## 生成手順

### 1. ロール・認可資材／DDL の生成（未生成時のみ・リカバリー目的）

BPM プロジェクトの編集・デプロイには、実行ユーザに対する権限（ロール・認可資材）が必要であり、また対象テナントに DDL（テーブル定義）が未適用だと後続のインポートが失敗する。いずれも `.github/skills/jssp-tenant-setup-generator/SKILL.md` を参照。

- ロール・認可資材、DDL がいずれも既に生成済みの場合は、本ステップをスキップしてステップ 2 に進む。
- 未生成の資材がある場合のみ、リカバリーとして `.github/skills/jssp-tenant-setup-generator/SKILL.md` の生成手順のうち、不足しているロール・認可資材／DDL を生成する部分のみを実施する。メニュー・ジョブスケジューラ・ポートレット DML 等、他の資材が既に生成済みであれば再生成しない。

### 2. ヒアリング（BPMN）
- テナント環境セットアップから取り込みたいBPMNファイルを決める。
  - `doc/<BPMプロセス名>-prompt/` 配下の*.bpmnを一覧と選択欄を表示する。
  - 選択したBPMNファイルを「出力先」の「インポートBPMN（bpmn）」へコピーする。
- BPM プロセスデザイナへの取り込みに必要な値をヒアリングする（詳細は [reference/bpm-import.md](reference/bpm-import.md) の「spec.json での指定」を参照）。
  - `projectId`: プロセスデザイナのプロジェクト ID。artifactId を初期値として提示し、ユーザに確認する。
  - `projectName`: プロセスデザイナのプロジェクト名。pom.xml の `<name>` を初期値として提示し、ユーザに確認する。
  - `files`: 選択・コピーした BPMN ファイル名一覧。

### 3. BPMNのセットアップ用資材生成

`.github/skills/jssp-tenant-setup-generator/scripts/build-setup-import.js` の build スクリプトは `bpmImport` に未対応のため、以下は build スクリプトを実行せず本スキルが直接生成・追記する。

- `<key>_bpm_import.js` を生成する。処理内容は [reference/bpm-import.md](reference/bpm-import.md) の「拡張インポート JS の処理内容」「Java 直接呼び出し詳細」に従う（`checkProjectExists` → 存在しなければ `createProject` → 各 `files` を `uploadOrUpdateBpmnFile`。いずれも REST API ではなく `ProjectFactory` / `ResourceFactory` 経由の Java 直接呼び出し）。ステップ 2 でヒアリングした `projectId` / `projectName` / `files` を使用する。
- 上記「import-config の選択規則」で決定した `import-<artifactId>-config-<N>.xml` の `<extends-import>` セクションに `<extends-import-class>...<key>_bpm_import.js</extends-import-class>` 行を手動で追加する。既に `extendsImport` / `workflowImport` / `logicImport` の行が出力されている場合はそれらの後ろに追記する（順序は [reference/bpm-import.md](reference/bpm-import.md) の「実行タイミング」を参照）。


## 仕様生成のガイド
| ファイル | 内容 |
|---------|------|
| `.github/skills/bpm-tenant-setup-generator/reference/bpm-import.md` | BPMN アップロードの仕組み |
