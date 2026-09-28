# 流程功能设置（flowSettings）

通过 `spec.json` 的 `flowSettings` 对象控制 IM-Workflow 流程定义的功能设置。
省略时使用默认值。

```jsonc
{
  "flowSettings": {
    "lumpProcess": true,            // 批量处理功能（默认：true）
    "attachFile": false,            // 附件（默认：true）
    "confirmUserSetup": false,      // 确认者设置（默认：false）
    "completedMatterConfirm": true, // 已完成案件的确认（默认：false）
    "autoProcess": false,           // 自动处理（默认：false）
    "autoProcessLimitDay": null,    // 自动处理期限天数（autoProcess=true 时设置）
    "autoProcessLimitType": null,   // 期限后处理类型：0=审批/1=否决/2=退回（autoProcess=true 时默认：0）
    "autoPress": false,             // 自动催促（默认：false）
    "autoPressLimitDay": null,      // 自动催促期限天数（autoPress=true 时设置）
    "asyncProcess": false,          // 异步处理（默认：false）
    "sysDateTargetExpand": false,   // 对象者展开日：true=处理日/false=案件开始日（默认：false）
    "calendarId": null              // 日历 ID（默认：null=标准日历）
  }
}
```

| 字段 | XML 标签 | 默认值 | 说明 |
|---|---|---|---|
| `lumpProcess` | `lumpProcessFlag` | `true` | 是否使用批量处理功能 |
| `attachFile` | `attachFileFlag` | `true` | 是否使用附件 |
| `confirmUserSetup` | `confirmUserSetupFlag` | `false` | 是否使用确认者设置 |
| `completedMatterConfirm` | `completeMatterConfirmFlag` | `false` | 已完成案件的确认 |
| `autoProcess` | `autoProcessFlag` | `false` | 是否使用自动处理 |
| `autoProcessLimitDay` | `autoProcessLimitDay` | `null` | 自动处理期限天数 |
| `autoProcessLimitType` | `autoProcessLimitType` | `0`（autoProcess=true 时） | 期限后处理：0=审批, 1=否决, 2=退回 |
| `autoPress` | `autoPressFlag` | `false` | 是否使用自动催促 |
| `autoPressLimitDay` | `autoPressLimitDay` | `null` | 自动催促期限天数 |
| `asyncProcess` | `asyncProcessFlag` | `false` | 是否使用异步处理 |
| `sysDateTargetExpand` | `sysDateTargetExpandFlag` | `false` | 对象者展开日（false=案件开始日, true=处理日） |
| `calendarId` | `calendarId` | `null` | 日历 ID（null=标准日历） |

**注意：** 以下设置超出导入 XML 的范围，需在管理画面手动设置：
- 防止申请者自我审批（`applyUserApprovePreventFlag`）
- 案件操作权限者（`handleUsers` 输出为空数组）
- 标准组织（`defaultOrgzs` 输出为空数组）
