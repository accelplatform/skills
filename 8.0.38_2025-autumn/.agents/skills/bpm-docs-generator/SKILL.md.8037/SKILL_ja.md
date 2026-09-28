---
name: bpm-docs-generator
description: bpmn(xml)を解析し仕様書を生成する。また、生成済みの仕様書を intra-mart Knowledge へインポート可能な zip ファイルに変換する。仕様書の構成・変換仕様は本スキルの仕様に従う。
---

# BPMN 仕様書生成スキル

## 目的

BPMN 形式の XML を解析し、仕様書を生成するスキルセット。
BPMN のプロセス定義から、プロセスの概要、フローの説明、タスクの詳細、条件分岐のロジックなどを抽出、アーティファクトやメモに記載されている内容を元にマークダウン方式で記載した仕様書を生成する。
本スキルによって生成された仕様書は、スクリプト開発モデル（JSSP）生成時の入力プロンプトとしても使用する。

## 使用タイミング（仕様書の作成）
ユーザが以下のような依頼をした場合：
- 「この BPMN の仕様書を作成して」
- 「このプロセスのドキュメントを生成して」
- 「この XML からフローの説明を出力して」

## 使用タイミング（IM-Knowledge向けインポートファイル作成）
ユーザが以下のような依頼をした場合：
- 「`doc/<BPMプロセス名>-prompt/` の仕様書を Knowledge にインポートできる zip に変換して」
- 「BPM 仕様書を Knowledge 形式に変換して」
- 「ナレッジ用の zip を作って」
- 「Knowledge にインポートできる zip にして」
- 「仕様書を Knowledge 形式に変換して」


## 生成する仕様書のファイル構成
```
doc                           ...　ディレクトリ
 └─ <BPMプロセス名>-prompt     ...　ディレクトリ
      ├─ specification.md     ...  BPMプロセスの概要や全体像などを記載
      ├─ <BPMプロセス名>.bpmn  ...  XML形式のBPMNファイル、元にしたbpmnファイルをコピーする
      ├─ business-data.md     ...  業務データ定義（テーブル構成　複数定義可能）
      ├─ to-be-discussed.md   ...  要検討事項を記載
      ├─ spec-to-bpmn-fixes.json ... 仕様書の内容をBPMNへ反映するための機械可読データ（bpm-xml-reflector 反映用。to-be-discussed.md のエラー訂正案に加え、ロールID・タスク色・プロセス変数・シグナル・メッセージ・プロセス定義キー置換・コールアクティビティ呼び出し先置換等の業務要件反映内容も含む）
      ├─ supplement.md        ...  仕様採用方針と補足事項を記載
      ├─ interactive-log.md   ...  対話履歴、結果報告などを記載（結果報告このファイルに記載し、コンソールには表示しないこと）
      └─ ＜機能ディレクトリ＞   ...  BPMタスクに紐づく機能の仕様書を格納するディレクトリ（複数定義可能）
           ├─ <機能名>-screen.md   ...  画面定義（機能単位）
           └─ <機能名>-logic.md    ...  ロジック（機能単位）
```

  - ** 仕様書の構成は上記の通りであるが、必要に応じてファイルやディレクトリを追加してもよい。**

## 仕様書スタイルガイド
- 用語の統一: BPMN の要素（タスク、ゲートウェイ、イベントなど）を説明する際は、BPMN 仕様で定義されている正式な用語を使用すること。
- フォーマット規約: 仕様書の各セクションは見出しで区切り、箇条書きや表を活用して情報を整理すること。
- 例示の活用: 複雑なフローや条件分岐の説明には、具体的な例を挙げてわかりやすく説明すること。
- 簡潔な表現: 仕様書は読みやすさを重視し、冗長な表現を避け、簡潔に要点を伝えること。
- 技術的な詳細は適切なセクションにまとめ、全体の流れを妨げないようにすること。
- 仕様書の内容は、BPMN XML の構造に忠実であること。XML の要素を正確に反映し、誤解を招く表現を避けること。
- 仕様書の内容は、BPMN のプロセス定義を理解するために必要な情報を網羅すること。重要なフローやタスク、条件分岐などを漏れなく説明すること。
- 仕様の採用方針は、<BPMプロセス名>-prompt/supplement.mdにまとめること。
- 要素特定は「要素名」を第一キーとし、ID単独での要素特定を禁止すること。
- 要素名だけで特定困難な場合は、要素種類・レーン名・前後要素名を補足すること。
- IDは原則として本文に出さず、必要な場合のみ括弧内補足（例: 要素名（ID: xxx））で使用すること。

> **記載禁止・表現ルール詳細:** `.agents/skills/bpm-docs-generator/reference/guide-to-be-discussed.md` の「出力失敗ゲート」および「専門語の禁止と置換」を参照すること。

## 各仕様生成のガイド
| ファイル | 内容 |
|---------|------|
| `.agents/skills/bpm-docs-generator/reference/guide-specification.md` | 仕様書の構成 |
| `.agents/skills/bpm-docs-generator/reference/guide-business-data.md` | 業務データ定義の注意事項 |
| `.agents/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` | BPMN 構文・参照整合性検証の具体手順と記載ルール |
| `.agents/skills/bpm-docs-generator/reference/guide-bpmn-validation-rules.md` | `validate-bpmn.js` の `--rules <rules.json>` に渡す入力ルール定義（rules.json）の仕様 |
| `.agents/skills/bpm-docs-generator/reference/guide-to-be-discussed.md`  | 要検討事項の説明 |
| `.agents/skills/bpm-docs-generator/reference/guide-screen.md` | 画面定義の主要要素の構成と説明 |
| `.agents/skills/bpm-docs-generator/reference/guide-logic.md` | ロジックの主要要素の構成と説明 |
| `.agents/skills/bpm-docs-generator/reference/guide-process-definition-key-replacement.md` | プロセス定義キー（processのid）の置換ルール |

## 支援機能の細則
| ファイル | 内容 |
|---------|------|
| `.agents/skills/bpm-docs-generator/reference/docs-to-knowledge-zip.md` | BPMの仕様書をintra-mart Knowledge へインポート可能な zip ファイルに変換 |


**注意事項**
- **BPMN のメモ・注釈は仕様の重要な入力情報として扱い、読み飛ばさないこと。**
- **IM-workflowで実現できる内容であっても、IM-BPM のプロセス定義に基づいて仕様書を生成すること。**


## BPMNからの仕様書作成手順

以下の手順にそって作業を行う。

## step.1 作成方法の確認（ユーザー回答必須）
- 既存仕様書ディレクトリを一覧表示し、差分反映か新規作成かをユーザーに質問する。
- **ユーザーの回答を得るまで、ディレクトリ作成を含む step.2 以降を実行してはならない。**
  - 既存の仕様書ディレクトリを選択したら、その仕様書へBPMNの内容を差分反映する。
  - 新規作成を選択したときは、ディレクトリ名を確認した後に仕様書を新規作成。

## step.2 BPMN のコピー
- prompt以下に<BPMプロセス名>.bpmnをコピーする。
- ** <BPMプロセス名>.bpmnのコピーは .agents/skills/bpm-docs-generator/scripts/bpmn-transform.js を利用して行う **
  - {{ENSURE_CMD}} .agents/skills/bpm-docs-generator/scripts/bpmn-transform.js <コピー元BPMN> <<BPMプロセス名>-prompt/<BPMプロセス名>.bpmn>
- **本変換により ixbpmn:/igx: 等 iGrafx 独自の名前空間要素・属性は除去される。** そのため iGrafx 独自要素の検出（`reference/guide-specification.md` 「参照BPMNがiGrafx製である場合に必須」）は、変換後の `<BPMプロセス名>.bpmn` ではなく、**コピー元BPMN（変換前の元ファイル）を Read ツールで直接参照して**行うこと。コピー元BPMNは複製せず、参照のみとし、内容の変更・上書きは禁止する。
- コピー元BPMNのパスは、以降の手順（特に step.4）でも参照するため失念しないよう `interactive-log.md` に一行記録しておくこと（例: `元BPMN: <コピー元BPMNへのパス>`）。ファイル本体は複製しない。


## step.3 BPMN 構文・参照整合性検証
- コピーしたBPMNファイル読み込み直後に、`.agents/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` の定義どおりに検証を1回実施し、結果を仕様書へ反映すること。**未実施・未反映の場合は step.4 へ進行してはならない。**

## step.4 仕様書作成
- 本スキルセットに沿って仕様書を作成する。
- **iGrafx 独自要素の検出**（`.agents/skills/bpm-docs-generator/reference/guide-specification.md` 「参照BPMNがiGrafx製である場合に必須」）は、`interactive-log.md` に記録したコピー元BPMN（変換前の元ファイル）を Read ツールで直接参照して判定すること。変換後の `<BPMプロセス名>-prompt/<BPMプロセス名>.bpmn` は ixbpmn:/igx: 要素が除去済みのため判定に使用してはならない。コピー元BPMNへの書き込み・変更は禁止（参照のみ）。
  - コピー元BPMNが既に存在しない・移動済み等で参照できない場合は、`to-be-discussed.md` の要検討事項としてユーザに再確認すること。
  - 判定結果は `specification.md` のプロセス詳細に記載するのに加え、`to-be-discussed.md` の1章「iGrafx固有要素の互換性チェック」（検証結果、重要度「高」固定）・6章「BPMNの改善案」（対処案）にも同じタイミングで反映すること。`spec-to-bpmn-fixes.json` への出力は行わない（iGrafx側で修正・再取り込みする運用のため）。
- **プロセス定義キー（process id）は「判定と提案のみ」を行うこと（置換実施は禁止）。**
  - 判定結果の解釈・記載形式は `.agents/skills/bpm-docs-generator/reference/guide-process-definition-key-replacement.md` を正とする。
- `to-be-discussed.md` の章立て・見出し採番・失敗扱い条件は `.agents/skills/bpm-docs-generator/reference/guide-to-be-discussed.md` に**必ず従うこと**。違反がある場合は出力失敗扱いとして修正後に再出力すること。
- `to-be-discussed.md` は `.agents/skills/bpm-docs-generator/reference/guide-to-be-discussed.md` の **「出力失敗ゲート」** を確認し、該当項目がある場合は修正してから出力すること。
- **BPMN への反映が必要な確定事項（validate-bpmn.js のエラー訂正案、ロールID・タスク色・プロセス変数・シグナル・メッセージ、プロセス定義キー置換、コールアクティビティ呼び出し先置換）は、`to-be-discussed.md`/`specification.md` への記載と同じタイミングで `spec-to-bpmn-fixes.json` にも出力すること。** BPMN への実反映は行わない（実施は `.agents/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` の `reflectFixes()` に委ねる）。エントリ構造・命名規則は `.agents/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` を正とする。

## Step.5 対話履歴の記録
- プロンプトへの依頼や生成結果の報告を `doc/<BPMプロセス名>-prompt/interactive-log.md` へ記載する。`interactive-log.md`に記録がある場合は追記すること。
  - ユーザから依頼された指示内容はそのまま記録すること。
  - 指示内容に対する回答もそのまま記録すること。
