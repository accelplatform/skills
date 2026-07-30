---
name: bpm-xml-reflector
description: 将规格书和生成脚本的内容反映到 BPMN-XML 中。
---

# BPMN-XML 规格・脚本内容反映技能

## 目的
用于将在 IM-BPM 上运行所需的事项反映到 BPMN-XML 中的技能集。
将使用 `bpm-docs-generator` 创建的规格书内容反映到 BPMN-XML 中。
将使用 `bpm-scripts-generator` 生成的脚本内容反映到 BPMN-XML 中。

## 文件构成

```
bpm-xml-reflector/
├── SKILL.md                            # 本文件
├── scripts/
│   ├── bpmn-scripts-reflector.js       # 用于将生成脚本内容反映到 BPMN 的各种函数
│   ├── bpmn-specs-reflector.js         # 用于将规格书内容反映到 BPMN 的各种函数
│   ├── check-process-id-replaced.js    # 检查 BPMN 的 ID 是否已置换的函数
│   └── verify-process-id-reflection.js # 用于验证 ID 置换的函数
└── reference/
    ├── bpmn-scripts-reflector.md       # 用于将脚本生成物的内容反映到 BPMN XML 的规格
    └── bpmn-specs-reflector.md         # 用于将规格书的内容反映到 BPMN XML 的规格
```
