---
name: bpm-xml-reflector
description: 仕様書や生成スクリプトの内容をBPMN-XMLに反映する。
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
│   ├── bpmn-specs-reflector.js         # 仕様書の内容をBPMNへ反映するための各種関数
│   ├── check-process-id-replaced.js    # BPMNのIDが置換済みかチェックする関数
│   └── verify-process-id-reflection.js # ID置換の検証するための関数
└── reference/
    ├── bpmn-scripts-reflector.md       # スクリプト生成物の内容をBPMN XMLへ反映するための仕様
    └── bpmn-specs-reflector.md         # 仕様書の内容をBPMN XMLへ反映 するための仕様
```
