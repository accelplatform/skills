# 通知·显示模板参考

## 概述

IM-Workflow 的导入 XML 中可以包含以下与通知·显示相关的节。
但这些是 intra-mart 环境中预安装的**系统默认模板**。
无需自定义时，不必包含在导入 XML 中。

## 节列表

| 节 | 用途 | 默认存在 |
|----|------|---------|
| `<mail>` | 邮件通知模板 | YES |
| `<imBox>` | IMBox 通知模板 | YES |
| `<list_pattern>` | 工作流列表的显示模式 | YES |
| `<message_template>` | 各类消息模板 | YES |

## mail（邮件通知模板）

### 模板类型（mailId）

| mailId | 用途 | mailType |
|--------|------|----------|
| act | 代理通知 | 4 |
| autopress | 自动催促 | 5 |
| confirm | 确认通知 | 8 |
| negotiation | 根回し通知 | 9 |
| processing | 处理通知 | 1 |
| reference | 参照通知 | 7 |
| result | 结果通知 | 2 |
| targetchange | 对象变更通知 | 6 |
| transfer | 转移通知 | 3 |

### 结构

```xml
<mail id="{{mailId}}">
  <value type="array">
    <!-- 按语言环境重复（ja、en、zh_CN） -->
    <value type="object">
      <mailId type="string">{{mailId}}</mailId>
      <localeId type="string">{{localeId}}</localeId>
      <mailName type="string">{{mailName}}</mailName>
      <note type="string">{{note}}</note>
      <mailTemplatePath type="string">im_workflow/data/default/master/mail/{{mailId}}_{{localeId}}.xml</mailTemplatePath>
      <updateCount type="string">0</updateCount>
      <mailTempType type="array">
        <value type="object">
          <mailId type="string">{{mailId}}</mailId>
          <mailType type="string">{{mailType}}</mailType>
          <mailConfigType type="string">0</mailConfigType>
          <defaultFlag type="string">1</defaultFlag>
        </value>
      </mailTempType>
      <mailTempFileData type="object">
        <mailTemplateSubject type="string">{{subject}}</mailTemplateSubject>
        <mailTemplateFrom type="string">{{from}}</mailTemplateFrom>
        <mailTemplateTo type="array">
          <value type="string">{{to}}</value>
        </mailTemplateTo>
        <mailTemplateCc type="array"><value type="null" /></mailTemplateCc>
        <mailTemplateBcc type="array"><value type="null" /></mailTemplateBcc>
        <mailTemplateReplyTo type="array">
          <value type="string">{{replyTo}}</value>
        </mailTemplateReplyTo>
        <mailTemplateBody type="string">{{body}}</mailTemplateBody>
      </mailTempFileData>
    </value>
  </value>
</mail>
```

### 邮件正文中可使用的变量（替换字符串）

官方参考（替换字符串ID）：https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/com/imwCodeList.html

邮件的主题和正文中可以用 `{^变量名^}` 的格式使用替换字符串。
可用变量的完整列表请参阅上述官方参考的"替换字符串ID"。

代表性变量：

| 变量 | 说明 |
|------|------|
| `{^Date^}` | 当前日期时间 |
| `{^IM_URL^}` | 系统 URL |
| `{^Matter_Nm^}` | 案件名称 |
| `{^Flow_Nm^}` | 流程名称 |
| `{^Node_Nm^}` | 节点名称 |
| `{^Apply_Nm^}` | 申请者姓名 |
| `{^Process_Nm^}` | 处理者姓名 |
| `{^Process_Cmt^}` | 处理备注 |
| `{^Process_Result^}` | 处理结果 |

---

## imBox（IMBox 通知模板）

与 mail 结构相同。将 `mailId` → `imBoxId`，`mailType` → `imBoxType`。
没有邮件专有项目（Subject、Cc、Bcc、ReplyTo），仅有 From/To/Body。

---

## list_pattern（列表显示模式）

### 模式类型（listPageType）

| listPageType | 用途 | 默认 patternId |
|-------------|------|----------------|
| 0 | 申请列表 | default_pattern_0 |
| 1 | 临时保存列表 | default_pattern_1 |
| 2 | 待处理列表 | default_pattern_2 |
| 25 | 已处理列表（确认） | default_pattern_25 |
| 3 | 已处理列表 | default_pattern_3 |
| 4 | 参照列表 | default_pattern_4 |
| 5 | 确认列表 | default_pattern_5 |
| 6 | 已完成案件列表 | default_pattern_6 |
| 7 | 历史案件列表 | default_pattern_7 |
| 8 | 案件操作列表 | default_pattern_8 |
| 9 | 案件操作列表（管理员） | default_pattern_9 |

### 显示列（columnId）

| columnId | 显示内容 |
|----------|---------|
| listPageCol_Apply | 申请按钮 |
| listPageCol_FlowName | 流程名称 |
| listPageCol_FlowVersionNote | 版本备注 |
| listPageCol_Flow | 流程操作 |
| listPageCol_MatterName | 案件名称 |
| listPageCol_ApplyDate | 申请日期 |
| listPageCol_NodeName | 节点名称 |
| listPageCol_Status | 状态 |

---

## message_template（消息模板）

### 模板类型（prefix）

| prefix | 发送目标 |
|--------|---------|
| appbox_ | 应用程序箱 |
| desktop_ | 桌面通知 |
| history_ | 处理历史 |
| mail_ | 邮件通知 |
| mobile_ | 移动通知 |
| task_ | 任务通知 |

### 事件类型（suffix）

| suffix | 事件 |
|--------|------|
| ar | 自动催促（Auto Remind） |
| cr | 确认（Confirm） |
| dn | 否认（Deny） |
| n | 根回し（Negotiation） |
| pbk | 撤回（Pull Back） |
| pr | 处理（Processing） |
| prn | 处理通知 |
| ptcn | 对象变更（Participant Change） |
| rr | 结果（Result） |
| tn | 转移（Transfer） |

message_template 的 ID 格式为 `{prefix}{suffix}`（例：`appbox_pr`、`mail_dn`）。

---

## 生成时的建议

1. **通常不包含**：mail / imBox / list_pattern / message_template 将使用系统默认，因此不必包含在导入 XML 中。
2. **仅在自定义时包含**：仅在需要修改主题·正文、添加显示列等情况时才包含。
3. **从现有环境导出**：自定义时，以从现有环境导出的 XML 为基础进行修改更为安全。
