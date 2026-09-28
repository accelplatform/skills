---
name: bpm-xml-reflector
description: bpm-docs-generator が生成した仕様書（specification.md・to-be-discussed.md・spec-to-bpmn-fixes.json 等）や bpm-scripts-generator が生成したスクリプト設定の内容を、BPMN-XML（doc/<BPMプロセス名>-prompt/<BPMプロセス名>.bpmn のコピー版）へ反映する。「仕様書の内容を BPMN XML に反映してほしい」「生成スクリプトの内容を BPMN XML に反映してほしい」「spec-to-bpmn-fixes.json を BPMN に反映して」「BPMN にロールID・タスク色・プロセス変数・シグナル・メッセージを反映して」「開始イベント/ユーザタスクに formKey を設定して」「process id を置換して BPMN に反映して」「コールアクティビティの呼び出し先プロセスを置換して」「validate-bpmn.js のエラー訂正案を BPMN に反映して」と言及されたときに使用。仕様書・スクリプト自体の新規作成は bpm-docs-generator / bpm-scripts-generator を使うこと。本スキルは、それらの成果物から機械的に決まる属性・要素の書き込みに専念し、BPMN の構造編集（要素の新規追加・削除・図形情報同期等）は対象外。
---

# BPMN-XML 仕様・スクリプト内容反映スキル

## 目的
IM-BPM上で運用するために必要な事項を、BPMN-XMLに反映するためのスキルセット。
`bpm-docs-generator` を利用して作成した仕様書の内容をBPMN-XMLに反映する。
`bpm-scripts-generator` を利用して生成したスクリプトの内容をBPMN-XMLに反映する。

## ファイル構成

```
bpm-xml-reflector/
├── SKILL.md                            # このファイル
├── scripts/
│   ├── bpmn-scripts-reflector.js  # 生成スクリプト内容をBPMNへ反映するための各種関数
│   ├── bpmn-specs-reflector.js         # 仕様書の内容をBPMNへ反映するための各種関数（CLI実行でID置換の検証も可能）
│   └── bpmn-reflector-utils.js         # 上記2ファイル共通のユーティリティ関数
└── reference/
    ├── bpmn-scripts-reflector.md       # スクリプト生成物の内容をBPMN XMLへ反映するための仕様
    └── bpmn-specs-reflector.md         # 仕様書の内容をBPMN XMLへ反映 するための仕様
```
