# Notification / Display Template Reference

## Overview

The following sections related to notifications and display can be included in the IM-Workflow import XML.
However, these are **system default templates** that come pre-installed in the intra-mart environment.
If customization is not needed, they do not need to be included in the import XML.

## Section List

| Section | Purpose | Exists by Default |
|---------|---------|-------------------|
| `<mail>` | Email notification template | YES |
| `<imBox>` | IMBox notification template | YES |
| `<list_pattern>` | Display pattern for workflow list | YES |
| `<message_template>` | Various message templates | YES |

## mail (Email Notification Template)

### Template Types (mailId)

| mailId | Purpose | mailType |
|--------|---------|----------|
| act | Proxy notification | 4 |
| autopress | Auto reminder | 5 |
| confirm | Confirmation notification | 8 |
| negotiation | Negotiation notification | 9 |
| processing | Processing notification | 1 |
| reference | Reference notification | 7 |
| result | Result notification | 2 |
| targetchange | Target change notification | 6 |
| transfer | Transfer notification | 3 |

### Structure

```xml
<mail id="{{mailId}}">
  <value type="array">
    <!-- Repeat per locale (ja, en, zh_CN) -->
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

### Variables Available in Mail Body (Substitution Strings)

Official reference (substitution string IDs): https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/com/imwCodeList.html

In the subject and body of emails, substitution strings can be used in the format `{^variable^}`.
For the complete list of available variables, refer to the "Substitution String IDs" section of the above official reference.

Representative variables:

| Variable | Description |
|----------|-------------|
| `{^Date^}` | Current date and time |
| `{^IM_URL^}` | System URL |
| `{^Matter_Nm^}` | Matter name |
| `{^Flow_Nm^}` | Flow name |
| `{^Node_Nm^}` | Node name |
| `{^Apply_Nm^}` | Applicant name |
| `{^Process_Nm^}` | Processor name |
| `{^Process_Cmt^}` | Processing comment |
| `{^Process_Result^}` | Processing result |

---

## imBox (IMBox Notification Template)

Same structure as mail. Replace `mailId` → `imBoxId`, `mailType` → `imBoxType`.
No mail-specific items (Subject, Cc, Bcc, ReplyTo); only From/To/Body.

---

## list_pattern (List Display Pattern)

### Pattern Types (listPageType)

| listPageType | Purpose | Default patternId |
|-------------|---------|---------------------|
| 0 | Application list | default_pattern_0 |
| 1 | Temporary save list | default_pattern_1 |
| 2 | Pending list | default_pattern_2 |
| 25 | Processed list (confirmation) | default_pattern_25 |
| 3 | Processed list | default_pattern_3 |
| 4 | Reference list | default_pattern_4 |
| 5 | Confirmation list | default_pattern_5 |
| 6 | Completed matters list | default_pattern_6 |
| 7 | Past matters list | default_pattern_7 |
| 8 | Matter operations list | default_pattern_8 |
| 9 | Matter operations list (admin) | default_pattern_9 |

### Display Columns (columnId)

| columnId | Display content |
|----------|----------------|
| listPageCol_Apply | Apply button |
| listPageCol_FlowName | Flow name |
| listPageCol_FlowVersionNote | Version note |
| listPageCol_Flow | Flow operations |
| listPageCol_MatterName | Matter name |
| listPageCol_ApplyDate | Application date |
| listPageCol_NodeName | Node name |
| listPageCol_Status | Status |

---

## message_template (Message Template)

### Template Types (prefix)

| prefix | Delivery target |
|--------|----------------|
| appbox_ | Application box |
| desktop_ | Desktop notification |
| history_ | Processing history |
| mail_ | Email notification |
| mobile_ | Mobile notification |
| task_ | Task notification |

### Event Types (suffix)

| suffix | Event |
|--------|-------|
| ar | Auto Remind |
| cr | Confirm |
| dn | Deny |
| n | Negotiation |
| pbk | Pull Back |
| pr | Processing |
| prn | Processing notification |
| ptcn | Participant Change |
| rr | Result |
| tn | Transfer |

The message_template ID is in the format `{prefix}{suffix}` (e.g., `appbox_pr`, `mail_dn`).

---

## Recommendations for Generation

1. **Do not include by default**: mail / imBox / list_pattern / message_template use system defaults, so they do not need to be included in the import XML.
2. **Include only for customization**: Include only when changes such as subject/body modifications or adding display columns are needed.
3. **Export from existing environment**: When customizing, it is safer to use the XML exported from an existing environment as a base and modify it.
