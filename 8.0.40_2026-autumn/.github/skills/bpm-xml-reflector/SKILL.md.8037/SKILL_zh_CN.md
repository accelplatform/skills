---
name: bpm-xml-reflector
description: 将 bpm-docs-generator 生成的规格书（specification.md、to-be-discussed.md、spec-to-bpmn-fixes.json 等）以及 bpm-scripts-generator 生成的脚本设置内容，反映到 BPMN-XML（doc/<BPM流程名>-prompt/<BPM流程名>.bpmn 的副本版）中。当提及「希望将规格书的内容反映到 BPMN XML」「希望将生成脚本的内容反映到 BPMN XML」「将 spec-to-bpmn-fixes.json 反映到 BPMN」「将角色ID・任务颜色・流程变量・信号・消息反映到 BPMN」「为开始事件/用户任务设置 formKey」「替换 process id 并反映到 BPMN」「替换调用活动的被调用流程」「将 validate-bpmn.js 的错误订正方案反映到 BPMN」时使用。规格书・脚本本身的新建请使用 bpm-docs-generator / bpm-scripts-generator。本技能专注于写入由这些成果物机械性确定的属性・元素，BPMN 的结构编辑（新增・删除元素、图形信息同步等）不在适用范围内。
---

# BPMN-XML 规格・脚本内容反映技能

## 目的
用于将 IM-BPM 上运行所需的事项反映到 BPMN-XML 中的技能集。
将使用 `bpm-docs-generator` 创建的规格书内容反映到 BPMN-XML 中。
将使用 `bpm-scripts-generator` 生成的脚本内容反映到 BPMN-XML 中。

## 文件结构

```
bpm-xml-reflector/
├── SKILL.md                            # 本文件
├── scripts/
│   ├── bpmn-scripts-reflector.js  # 用于将生成脚本内容反映到 BPMN 的各类函数
│   ├── bpmn-specs-reflector.js         # 用于将规格书内容反映到 BPMN 的各类函数（也可通过 CLI 执行进行 ID 替换验证）
│   └── bpmn-reflector-utils.js         # 上述两个文件共用的工具函数
└── reference/
    ├── bpmn-scripts-reflector.md       # 用于将脚本生成物内容反映到 BPMN XML 的规格
    └── bpmn-specs-reflector.md         # 用于将规格书内容反映到 BPMN XML 的规格
```
