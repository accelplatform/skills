---
name: bpm-scripts-generator
description: IM-BPM for Accel Platform 上で BPMプロセスを動かすために必要なリソース（画面・ファンクションコンテナ・DDL/SQL・ルーティング設定・テナント環境セットアップ資材、該当する場合はバッチ・IM-LogicDesigner・IM-Workflow 資材）を、bpm-docs-generator が作成した仕様書（specification.md・<機能名>-screen.md・<機能名>-logic.md 等）を元に生成する。「BPM仕様書を元に必要なリソースを作成して」「仕様書を元にスクリプトを作成して」「仕様書からプログラムを作って」「BPMNの仕様書を実装に落として」「BPMプロセスの画面・APIを生成して」と言及されたときに使用。仕様書自体の新規作成は bpm-docs-generator を使うこと。本スキルで生成した画面・ルーティング情報を BPMN-XML の formKey 等へ反映する後続作業は bpm-xml-reflector を使うこと。BPMNファイル自体をテナント環境セットアップへ組み込む場合は bpm-tenant-setup-generator を使用すること。
---

# BPMS リソース生成スキル

## 目的
仕様書をもとにBPMS化に必要なリソースを生成するスキルセット。
リソースは、intra-mart Accel Platform のスクリプト開発モデル（JSSP）にて生成する。
基本的には、jssp-page-generatorの指針に合わせるが、スクラッチ画面連携向けにIM-BPMの独自の要素を記載する。

## 参照Skills

以下のスキルセットを参考にリソースを生成する。なお IM-BPM for Accel Platform 向けの実装条件は、後述の「リファレンス」および「IM-BPMリソースの注意事項」を参照

| Skills | 取り扱い |
|---------|------|
| `.claude/skills/jssp-page-generator/SKILL.md` + `.claude/skills/jssp-imds-theme/SKILL.md` | 🟢 **必読**  仕様書の画面定義・ロジック定義に対応 |
| `.claude/skills/jssp-localize-support/SKILL.md` | 多言語化の要望がある場合、必読 |
| `.claude/skills/jssp-im-job-generator/SKILL.md` | 仕様書にジョブ利用がある場合、必読（※1 未導入の場合あり） |
| `.claude/skills/jssp-tenant-setup-generator/SKILL.md` | 業務データのDDL・サンプルDML、ロール・認可資材、Importer設定XMLなどのテナント環境セットアップ資材を生成する場合、必読 |
| `.claude/skills/jssp-im-logic-generator/SKILL.md` | BPMN に `activiti:type="logicdesigner"` の serviceTask があり、`<BPMプロセス名>-prompt` に LogicDesigner の仕様が明確に記載されている場合、生成要否をユーザに確認した上で使用 |
| `.claude/skills/base-im-workflow-generator/SKILL.md` / `.claude/skills/jssp-im-workflow-usage/SKILL.md` | BPMN に `activiti:type="applyworkflow"` または `activiti:type="draftworkflow"` の serviceTask があり、`<BPMプロセス名>-prompt` にワークフローの仕様が明確に記載されている場合、生成要否をユーザに確認した上で使用 |
| `.claude/skills/bpm-tenant-setup-generator/SKILL.md` | BPMNファイルをテナント環境セットアップへ組み込む場合に使用 |

※1 `jssp-im-job-generator` は intra-mart Accel Platform のプロジェクトテンプレートに同梱される任意スキルの一つであり、プロジェクト作成時の選択によっては本プロジェクトに導入されていない場合がある。参照前に `.claude/skills/jssp-im-job-generator/SKILL.md` の存在を確認すること。存在しない場合は、記憶や推測でジョブスケジューラ固有の実装を補わず、未導入である旨をユーザに伝えた上でバッチ資材の生成要否・対応方針（スキルの追加導入を待つ／今回のスコープから除外する等）を確認すること。

## リファレンス

IM-BPM for Accel Platform 固有の実装条件は、記憶や推測で書かず必ず以下の reference ファイルを読み込んで確認すること。

| ファイル | 内容 | 参照タイミング |
|---------|------|----------------|
| `.claude/skills/bpm-scripts-generator/reference/guide-bpm-form.md` | リクエスト種別判定・権限チェック・業務データ取得・モード判定・画面表示制御のサンプルコード | 🟢 **必読** — 画面（プレゼンテーションページ／ファンクションコンテナの画面処理）を実装する場合 |
| `.claude/skills/bpm-scripts-generator/reference/guide-bpm-api.md` | プロセスインスタンス開始処理・タスク完了処理等の BPM API 呼び出しパターン | 🟢 **必読** — ファンクションコンテナにプロセス連携処理（開始イベント／ユーザタスクに紐づく処理）を実装する場合 |

**サブエージェントへ委譲する場合の注意:**
画面エージェント・API エージェントへ作業を委譲する際は、オーケストレータ側のプロンプトで上記 reference ファイルの**具体的なパス**を明示すること。サブエージェントは新規コンテキストで起動されるため、スキル名を伝えるだけでは reference ファイルの存在に気づけない。

## 使用タイミング

ユーザが以下のような依頼をした場合：
- 「BPM仕様書を元に必要なリソースを作成して」
- 「仕様書を元にスクリプトを作成して」
- 「仕様書からプログラムを作って」

上記の依頼では、JSSP資材だけでなく、仕様書に業務データ定義やロール・認可定義がある場合、テナント環境セットアップ資材も生成対象として扱う。

## 生成着手前後の確認フロー

スクリプト生成に着手する前に、以下の手順（1〜6）に沿って生成予定物・オプション資材の要否・既存成果物への対応方針を確定し、**ステップ4の最終確認でユーザーの明示的な承認を得てから**スクリプト生成を実施すること。

### 1. 生成予定物のリストアップ

仕様書（`<BPMプロセス名>-prompt` 配下、`.claude/skills/bpm-docs-generator/SKILL.md` が作成したもの）と元の BPMN を読み込み、生成予定のファイル・資材を種別ごとに一覧化してユーザに提示する。

**列挙の根拠（種別ごとの一次情報）**

種別ごとに以下の一次情報を参照し、**そこに記載があるものだけ**を列挙する。一次情報に無いものを BPMN から推測して補ってはならない。

| 種別 | 一次情報 |
|------|---------|
| DDL / SQL（テーブル定義・SQLテンプレート。ファンクションコンテナが実行時に呼び出す2WaySQL、`src/main/jssp/src/<機能名>/sql/` に配置） | `business-data.md` の業務データ定義 |
| テナント環境セットアップ資材（DDL・サンプルDML。Importer投入用、`src/main/storage/system/products/import/basic/<key>/<version>/` に配置） | `business-data.md` の業務データ定義 |
| テナント環境セットアップ資材（ロール・認可） | `specification.md` のアクター・ロール定義、画面・API のルーティング設定の認可URI宣言、および `-prompt` の補足仕様 |
| Importer設定XML | 上記のテナント環境セットアップ資材と、`jssp-tenant-setup-generator` のヒアリング結果 |
| 画面（プレゼンテーションページ + ファンクションコンテナ） | `<機能ディレクトリ>/<機能名>-screen.md` の「画面の一覧」 |
| API（ファンクションコンテナ） | `<機能ディレクトリ>/<機能名>-logic.md`、`specification.md` のプロセス詳細 |
| バッチ（`.claude/skills/jssp-im-job-generator/SKILL.md` 対象、該当する場合。※1 未導入の場合あり） | `specification.md` / `-logic.md` のジョブ記載 |
| ルーティング・テナント設定 | 上記で確定した画面・API |
| **（該当する場合）IM-LogicDesigner 資材**（`.claude/skills/jssp-im-logic-generator/SKILL.md` で生成する `flow_definition.json` 等） | ステップ2の判定結果 |
| **（該当する場合）IM-Workflow 資材**（`.claude/skills/base-im-workflow-generator/SKILL.md` によるインポート XML、`.claude/skills/jssp-im-workflow-usage/SKILL.md` によるアクション処理・画面） | ステップ2の判定結果 |

**画面の列挙ルール（厳守）**

- 画面は `<機能名>-screen.md` の「画面の一覧」の行と **1対1** で起こす。一覧に無い画面を生成予定物に含めてはならない。
- **BPMN に `userTask` / `startEvent` が存在することだけを根拠に画面を列挙してはならない。** BPMN 上のタスクは画面を伴わない場合があり、その判定は `specification.md` のプロセス詳細の「画面」欄（画面がない場合は `-`）が正である。
- 列挙した各画面には、**根拠となる `-screen.md` のパスと画面定義名を併記する**。根拠を示せない画面は列挙対象外とする。

### 2. 生成対象の判定と確認

#### 2-1. BPMN タグと仕様記載の両方が必須な資材（画面／LogicDesigner 資材／ワークフロー資材）

以下の資材は、BPMN のタグと `-prompt` の仕様記載の**両方が揃っている場合に限り**、生成対象とする。どちらか一方でも欠ける場合は当該資材の生成を行わない。「仕様が明確に記載されている」の判断基準は定めない。生成担当エージェントが `-prompt` の内容を読み、実装着手可能な具体性があるかで判断する。

| 資材 | BPMN 側の判定条件 | 仕様書側の判定条件 | 両方満たす場合の動作 |
|------|------------------|-------------------|---------------------|
| 画面 | 対象の `userTask` または `startEvent` が存在する | `<機能ディレクトリ>/<機能名>-screen.md` に当該画面の定義（画面項目・バリデーション・アクション処理）があり、かつ `specification.md` のプロセス詳細で当該タスクの「画面」欄が `-` でない | 生成対象に含める（画面ごとの個別確認は不要。ステップ4でまとめて提示する） |
| LogicDesigner 資材 | `<bpmn:serviceTask activiti:type="logicdesigner">` が存在する | `<BPMプロセス名>-prompt` に LogicDesigner の仕様（処理内容・入出力等）が明確に記載されている | `.claude/skills/jssp-im-logic-generator/SKILL.md` での生成を実施するか確認する |
| ワークフロー資材 | `<bpmn:serviceTask activiti:type="applyworkflow">` または `<bpmn:serviceTask activiti:type="draftworkflow">` が存在する | `<BPMプロセス名>-prompt` にワークフローの仕様（ルート構成・承認者等）が明確に記載されている | `.claude/skills/base-im-workflow-generator/SKILL.md` / `.claude/skills/jssp-im-workflow-usage/SKILL.md` での生成を実施するか確認する |

**判定結果の扱い（2-1: 画面）:**
- 両条件を満たす画面のみ生成する。
- **BPMN にタスクはあるが `-screen.md` に画面定義が無い場合、画面を推測して生成してはならない。** 画面項目・バリデーション・ボタン処理・レイアウトを仕様書外から補完することを含めて禁止する。
- 画面定義が無いタスクは「画面なし」として扱い、生成対象から除外した旨と対象タスク名を会話内でユーザへ簡潔に報告する。ファイルへの記録は不要。
- ユーザが当該タスクの画面を必要とする場合は、`.claude/skills/bpm-docs-generator/SKILL.md` に戻って `-screen.md` を作成してから本スキルを再実行するよう案内する。本スキル内で画面定義を作成してはならない。

**判定結果の扱い（2-1: LogicDesigner／ワークフロー）:**
- 両方の条件を満たす資材のみ、それぞれ個別に「◯◯を生成しますか？」と確認する。
- 実施が承認された資材は生成対象に残し、実施しないと回答された資材は生成対象から除外する（除外分は以降の一覧・完了報告からも外す）。
- **BPMN にタグはあるが `-prompt` の仕様記載が不明確・不足している場合、および仕様はあるが対応する BPMN タグがない場合は、確認を行わずに generator を利用した資材生成を行わない。** 判定結果や理由をファイルに記録する必要はなく、会話内でユーザへ簡潔に報告すればよい。

#### 2-2. BPMN タグの有無を判定条件にしない資材（テナント環境セットアップ資材／Importer設定XML）

以下の資材は、BPMN にロール割当等のタグが反映されているかどうかに関わらず、各行に記載した一次情報のみで生成対象を機械的に判定する。**2-1 の「両方揃っている場合に限り」ルールはこれらの資材には適用しない。**

| 資材 | 生成対象と判断する一次情報 | 仕様から確定すべき項目 | 動作 |
|------|--------------------------|----------------------|------|
| テナント環境セットアップ資材（DDL・サンプルDML） | `business-data.md` に業務テーブル定義がある | テーブル名・カラム定義・型・必須条件など、DDLを生成できる定義がある | 生成対象に含める（個別確認は不要。ステップ4でまとめて提示する）。`jssp-tenant-setup-generator` に委譲し、`src/main/storage/system/products/import/basic/<key>/<version>/` に配置する |
| テナント環境セットアップ資材（ロール・認可） | `specification.md` のアクター・ロール表にロールID・ロール名の記載がある、または画面・API のルーティング設定に `<authz uri="service://...">` の宣言がある | ロールID、表示名、認可リソース、対象者、許可アクションが仕様から確定できる | 生成対象に含める（個別確認は不要。ステップ4でまとめて提示する）。BPMN 側にロール割当属性（`candidateGroups` 等）が未反映でも対象から除外しない。`jssp-tenant-setup-generator` に委譲し、ロール・認可資材を `src/main/storage/system/products/import/basic/<key>/<version>/` に配置する |
| Importer設定XML | DDL、ロール、認可、サンプルDMLのいずれかを生成する | `artifactId`、`version`、`configNumber`、`key` が確定している | 生成対象に含める（個別確認は不要）。`src/main/conf/products/import/basic/<artifactId>/import-<artifactId>-config-<N>.xml` を生成する |

**判定結果の扱い（2-2: テナント環境セットアップ資材／Importer設定XML）:**
- `business-data.md` に業務テーブル定義がある場合、DDLとサンプルDMLはテナント環境セットアップ資材として扱い、`.claude/skills/jssp-tenant-setup-generator/SKILL.md` に委譲する。
- テナント環境セットアップへ投入するDDL・サンプルDMLは `src/main/storage/system/products/import/basic/<key>/<version>/` に配置する。ファンクションコンテナが実行時に呼び出す2WaySQLは `src/main/jssp/src/<機能名>/sql/` に配置し、両者を混同してはならない。
- `specification.md` のアクター・ロール、画面・APIの認可要件（ルーティング設定の認可URI）が仕様から確定できる場合、ロール・認可資材を同じ `jssp-tenant-setup-generator` へ委譲する。**BPMN側にロール割当属性が反映されていないことを理由に生成を見送ってはならない。**
- DDL、サンプルDML、ロール、認可のいずれかを生成する場合は、Importer設定XMLも生成対象に含める。生成先は `src/main/conf/products/import/basic/<artifactId>/import-<artifactId>-config-<N>.xml` とする。
- 委譲前に、`key`、`artifactId`、`version`、`configNumber` を確定する。`configNumber` は既存テナントへの投入状況から自動推定せず、初回セットアップか差分追加かをユーザに確認する。詳細は `.claude/skills/jssp-tenant-setup-generator/SKILL.md` に従う。
- BPMNファイル自体をImporterへ組み込む場合は、`.claude/skills/bpm-tenant-setup-generator/SKILL.md` の対象として別途判定し、承認後に同スキルへ委譲する。DDL・ロール・認可・Importer設定の生成だけでは、BPMNファイルを自動的にコピーしてはならない。

### 3. 既存成果物の確認

1. でリストアップした生成予定物（DDL/SQL、テナント環境セットアップ資材、画面、API、バッチ、ルーティング・テナント設定、および該当する場合の LogicDesigner／Workflow 資材）について、対応する実ファイルが既に存在するか種別ごとに確認する。

- **既存の成果物がある種別（ユーザー回答必須）:**
  - 「この BPMN の内容を既存の〇〇（種別名）へ差分反映してよいか」をユーザに確認する。
  - **Yes の場合:** 当該種別は差分反映として生成・委譲を進める（サブエージェントへ委譲する場合は、差分反映対象である旨と既存ファイルパスを明示的に伝えること）。
  - **No の場合:** 差分反映を行わない代替案（例: ①当該種別を今回の生成対象から除外する、②既存ファイルを別名でバックアップした上で新規生成する、③その他ユーザー指定の方針）を提示し、採用する代替案をユーザーと確定する。
- **既存の成果物がない種別:** そのまま新規生成として進める。
- 種別によって既存有無が混在する場合は、種別ごとに個別判断してよい（例: DDL/SQL は新規、画面は差分反映、など）。

### 4. 生成着手の最終確認

1〜3で確定した内容（採否が決まったオプション資材、既存成果物への対応方針を反映した最終的な生成予定物リスト）を改めてユーザに提示し、「上記内容でスクリプト生成に着手してよいか」を明示的に確認する。

- **ユーザーから進めてよい旨の明示的な回答を受け取るまで、資材生成・各サブエージェントへの委譲を一切開始してはならない。** 一覧を提示した時点で回答内容を仮定し、自己判断で処理を継続することは禁止する。
- 修正・追加の指示があった場合は、当該指示を反映した上で再度リストを提示し、承認を得るまでこのステップを繰り返す。
- 本ステップは1〜3の内容にオプション資材・既存成果物の判定結果が一切ない場合（＝新規生成のみ）でも省略してはならない。

### 5. 生成完了後の BPMN 反映確認

画面（プレゼンテーションページ）を生成し、対応する `routing-jssp-config` のパスが確定した開始イベント・ユーザタスクについては、`doc/<BPMプロセス名>-prompt/<BPMプロセス名>.bpmn` へ `formKey`（ルーティングパス）を反映できる状態になる。**この反映は自動実行せず、必ずユーザーへの確認を経てから実施すること。**

1. 反映対象の一覧（開始イベント/ユーザタスクの id と、対応する routing-jssp-config のファイル名・パス）を提示する。
   - ステップ2で「画面なし」と判定し画面を生成しなかった開始イベント・ユーザタスクは対象外とする。
   - 既存 BPMN への差分反映（ステップ3で差分反映方針とした画面）の場合は、生成し直した／変更したルーティングパス分のみを一覧に含める。
2. 「上記内容で BPMN（コピー版）へ formKey を反映してよいか」を確認する。
   - **Yes の場合:** `.claude/skills/bpm-xml-reflector/SKILL.md`（生成スクリプト内容の反映: `reference/bpmn-scripts-reflector.md`）に委譲する。委譲時は 1. の対応関係を明示的に伝えること（`bpm-xml-reflector` は新規コンテキストで起動されるため、本スキル側の判定結果を引き継げない）。
   - **No の場合:** 反映を行わず、生成物のみで本ステップを完了とする。後で反映が必要になった場合は改めて `bpm-xml-reflector` を実行するよう案内する。

### 6. 対話履歴の記録
- プロンプトへの依頼や生成結果の報告を `doc/<BPMプロセス名>-prompt/interactive-log.md` へ記載する。`doc/<BPMプロセス名>-prompt/interactive-log.md`に記録がある場合は追記すること。
  - ユーザから依頼された指示内容はそのまま記録すること。
  - 指示内容に対する回答もそのまま記録すること。

## **IM-BPMリソースの注意事項**
### **プロセスインスタンスIDとタスクIDは、ファンクションコンテナ の init 関数のパラメタより取得する。**
```
  function init(request) {
    // 開始イベントからのリクエスト
    request.processDefinitionId;
    // 開始イベントの履歴参照リクエスト
    request.historicProcessInstanceId;
    // ユーザタスクからのリクエスト
    request.taskId;
    // ユーザタスクからのリクエスト時に、リクエストパラメタに追加する想定
    request.processInstanceId;
    // タスクの履歴参照リクエスト
    request.historicTaskId;
    ‥‥‥
  }
```
- 上記パラメタを用いたリクエスト種別判定・権限チェック・モード判定の詳細手順とサンプルコードは `.claude/skills/bpm-scripts-generator/reference/guide-bpm-form.md` を参照すること（本セクションは概要のみ）。

### **業務データと画面の関係**
- 基本方針
  - 開始イベントやユーザタスクから業務データ登録画面を呼び出して業務データを登録する際は、insertを基本とする。
- 開始イベント・複数ユーザタスクが業務データの入出力に関わるプロセス（**同一画面か別画面かは問わない**）
  - 業務データ定義にタスクIDがある場合（`プロセスインスタンスID + タスクID` の複合主キーで管理される場合）、基本方針に沿い、開始イベント・各ユーザタスクの登録画面では、業務データを**insertする方式を既定**とする。
    - 開始イベント・ユーザタスク毎に、業務データにレコードを追加する。既存レコードへのUPDATEは行わない。
    - レコード件数を抑えたいなどの要望が**明示的に確認できた場合に限り**、最初の登録画面表示では業務データのInsert、後続ユーザタスクは業務データをUpdateする方針を代替案として採用してよい。
  - 業務データ定義にタスクIDがない場合、最初の登録画面表示では業務データのInsert、後続ユーザタスクは業務データをUpdateする。
    - 初回登録時（開始イベントまたは最初のユーザタスク）に業務データにレコードを追加し、後続ユーザタスクではそのレコードに対し画面入力データを更新する。
  - 初回登録以外の画面表示では、直前の開始イベントまたはユーザタスクで入力した業務データを取得・表示すること。
    - 業務データ定義にタスクIDがあり複合主キー方式（insert方式）の場合、取得条件は `プロセスインスタンスID` + **直前の開始イベント・ユーザタスクのタスクIDを保持するプロセス変数**とする（プロセス変数の設定パターンは `.claude/skills/bpm-scripts-generator/reference/guide-bpm-api.md` を参照。命名・提案方針は `.claude/skills/bpm-docs-generator/reference/guide-specification.md` を参照）。
    - 上記の取得条件を成立させるため、**当該複合主キー方式の各タスクの完了処理（`bpm.TaskService#complete`）では、自身の taskId を後続タスクが参照するプロセス変数として必ず設定すること**（`.claude/skills/bpm-scripts-generator/reference/guide-bpm-api.md` の「【複合主キー方式は原則必須】後続タスクへ自身のタスクIDを引き継ぐ場合」を参照。単純な complete(taskId) を選んではならない）。画面エージェント／APIエージェントを分けて委譲する場合は、オーケストレータが「どのタスクが誰の taskId を必要とするか」の対応関係を明示的に伝えること（後続タスク側の読み出し処理だけを実装したエージェントが、先行タスク側の書き込み処理の実装漏れに気づけないため）。
    - 業務データ定義にタスクIDがない、またはUpdate方式の場合、取得条件は業務データの主キー（プロセス変数等で持ち回る）とする。
  - insert方式で新規レコードを登録する場合、直前の取得内容（前工程の入力値）と今回の画面入力値をあわせて1レコードとして登録し、新規レコードのタスクIDには**当該開始イベント・ユーザタスク自身のタスクID**を設定すること（詳細な実装手順は `.claude/skills/bpm-scripts-generator/reference/guide-bpm-form.md` の「業務データ取得」を参照）。
