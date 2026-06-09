# `screens` 字段与画面脚本路径（scriptPath）的指定方法

`spec.json` 的 `screens` 可对各 pageType 的输出进行精细控制。

```jsonc
"screens": {
  "apply": "leave/workflow/apply/index",        // 字符串 → 使用该路径
  "tempSave": false,                            // false → 从 XML 中排除
  "confirm": false,                             // false → 从 XML 中排除
  "applyTask": "leave/workflow/apply_task/index"  // 字符串 → 添加到输出（applyTask 默认省略，如需生成请显式指定）
}
```

| 值 | 含义 |
|---|---|
| **字符串** | 将该路径作为 `scriptPath` 输出到 XML |
| **`false`** | 从 XML 中完全排除该 pageType 的 contentDef（明确声明「不需要」） |
| **`undefined` / `null` / 未填写** | 默认行为（参见 SKILL.md「pageType 与 usage 惯例目录的对应表」） |

## 画面省略·共用的典型模式

### 模式 A：最小配置（仅申请＋审批）

如「仅实现申请，不需要临时保存·确认画面」的最小配置。示例：[examples/minimal.spec.json](../examples/minimal.spec.json)。

```jsonc
"screens": {
  "tempSave": false,
  "confirm": false
}
```

→ 输出的 pageType：`0`（apply）、`3`（reapply，与 apply 共用）、`4`（process）、`6`（processDetail）、`7`（referDetail，与 processDetail 共用）

### 模式 B：标准配置（使用默认）

若省略 `screens` 本身，则应用 SKILL.md 对应表中的默认值。示例：[examples/straight.spec.json](../examples/straight.spec.json)。

→ 输出的 pageType：`0, 1, 3, 4, 5, 6, 7`（仅排除 applyTask=2）

### 模式 C：含起票运用（包含 applyTask）

如月报、期初目标设定等通过作业自动起票的工作流。

```jsonc
"screens": {
  "applyTask": "monthly_report/workflow/apply_task/index"
}
```

→ 在模式 B 的基础上添加 pageType `2`

### 模式 D：详情画面与处理画面差异较大

当处理画面与参照详情的显示项目差异较大时，分别实现。

```jsonc
"screens": {
  "processDetail": "leave/workflow/process_detail/index",
  "referDetail": "leave/workflow/refer_detail/index"   // 不共用；指定单独路径
}
```

## 一致性验证流程

1. **XML 生成后**：对同时包含 XML 与 JS 的目录运行 `jssp-im-workflow-usage/scripts/validate-workflow-code.js`。
2. 出现 `WF-XML-001` 警告（「XML 引用的 JS 文件不存在」）时，以下任一情形：
   - **画面文件未生成（缺陷）** → 使用 `jssp-im-workflow-usage` 生成对应画面。
   - **有意省略画面** → 通过 `spec.json` 的 `screens.xxx: false` 排除后重新构建（推荐；可从根本上消除警告噪声）。
