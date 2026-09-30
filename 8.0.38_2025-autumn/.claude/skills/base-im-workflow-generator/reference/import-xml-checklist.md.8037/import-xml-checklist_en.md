# IM-Workflow Import XML Checklist

Self-checklist for generating XML using the `base-im-workflow-generator` skill.

### Pre-generation Check (pre)

Complete these before writing even 1 line of XML.

- [ ] The XML portion of `assets/sample-complete-branch.md` was **actually read using the Read tool** (do not substitute with agent summaries or inference)
- [ ] The first 50+ lines of each section—contents / route / flow / matter_property / rule—were confirmed
- [ ] Confirmed that the output destination is `src/main/storage/public/im_workflow/`
- [ ] Confirmed that the output file is **1 XML file** named `im_workflow-{name}-import.xml` (do not split into 5 files)
- [ ] Confirmed that the XML root is `<data>` with direct children being `<contents id="...">`, `<route id="...">`, etc.

### Output Format Check (output)

- [ ] contents / route / flow / matter_property / rule are all contained **within 1 `<data>` element**
- [ ] Structure conforms to the sample: `<contents id="..."><value type="array"><value type="object">` (custom tags not allowed)
- [ ] XML declaration is `<?xml version="1.0" encoding="UTF-16"?>`
- [ ] Written with Write tool as UTF-8 → converted with `iconv -f UTF-8 -t UTF-16LE`
- [ ] Executed the verification script in `reference/validate-xml-encoding.md` (confirmed `OK` or `FIXED`)
- [ ] Executed XSD validation per the procedure in `reference/validate-xsd.md` (confirmed `OK: ... is valid against the schema`). If errors occurred, fix the XML based on the message and re-validate until it passes.

### XML Structure Check (structure)

#### contents (Contents Definition)

- [ ] Each locale contains versions (blank `_0` + active `_1`) in `<details type="array">`
- [ ] Version IDs are in the format `{contentsId}_0` (blank) and `{contentsId}_1` (active)
- [ ] Page definitions include `pagePathId`, `localeId`, `contentsId`, `contentsVersionId`, `pageName`, `pageType`, `defaultFlag`, `pathType`, `scriptPath`, `applicationId`, `serviceId`, `pagePath`
- [ ] Contents plugins include `contentsPluginId`, `localeId`, `contentsId`, `contentsVersionId`, `exPointId`, `pluginId`, `pluginName`, `parameter`, `nodeType`, `defaultFlag`, `executeOrder`, `note`
- [ ] Contents rule linkages include `contentsRuleId`, `contentsId`, `contentsVersionId`, `ruleData`
- [ ] 8 page types (0–7) are defined

#### route (Route Definition)

- [ ] Active version includes `routeFilePath` (format: `im_workflow/data/default/master/route/{routeId}/{routeVersionId}/route.xml`)
- [ ] `routeXmlFile` contains `routeId`, `routeVersionId`, `routeType`
- [ ] Each node includes `nodeId`, `nodeName`, `nodeType`, `nodeVariety`, `previousNodeIds`, `nextNodeIds`, `plugins`, `x`, `y`, `startNodeFlag`, `endNodeFlag`, `traceId`, `routeTemplateId`, `routeTemplateName`, `parentNode`
- [ ] Node-level plugins include `routePluginId`, `routeId`, `routeVersionId`, `nodeId`, `nodeType`, `extensionPointId`, `pluginId`, `parameter`, `targetType`, `targetCode`
- [ ] Route-level `<plugins type="array">` also redundantly contains the same plugins as node-level
- [ ] `routeXmlFile` contains `<comments type="array" />` and `<swimlanes type="array" />`
- [ ] `previousNodeIds` and `nextNodeIds` are bidirectionally consistent
- [ ] Coordinates (x, y) follow the formulas in each template (`assets/template-*.md`)
- [ ] Authority plugin extension points are correct based on the type of preceding node — preceding human node (application/approval etc.) → `approve.{suffix}`, preceding system node (branch start/sync start etc.) → `approve.static.{suffix}`
- [ ] Authority plugins use one of: direct specification (`.department`, `.post`, `.role`, etc.), combination specification (`.department_and_post`, etc.), or dynamic specification (`.apply_user_department_and_post`, etc.)
- [ ] Direct/combination specifications have values in `targetType` / `targetCode` (refer to the targetType list in `reference/authority-plugins.md`)
- [ ] Dynamic specifications have empty tags for `targetType` / `targetCode`, and `parameter` is in the format matching the suffix ending: `_department` only → empty tag, `_and_post` → `|{company}^{org set}^{position}`, `_and_role` → `|{role ID}`

#### flow (Flow Definition)

- [ ] Flow nodes include `flowId`, `flowVersionId`, `contentsVersionId`, `routeVersionId`, `nodeId`, `nodeType`, `localeId`
- [ ] Approval nodes (human) include `lumpProcessFlag`, `attachFileFlag`, `autoProcessFlag`, `autoProcessLimitDay`, `autoProcessLimitType`, `autoPressFlag`, `autoPressLimitDay`
- [ ] System nodes (Branch_Start/End, etc.) have the above flags as `type="null"`
- [ ] All nodes include `<details type="array" />`, `<attributes type="array">`, `<unions type="array">`, `<routeNode type="null" />`
- [ ] Branch node details include `no`, `flowId`, `flowVersionId`, `contentsVersionId`, `routeVersionId`, `nodeId`, `cooperationType`, `cooperationClassify`, `cooperationId`, `emptyFlag`
- [ ] Branch node unions include `branchUnionId`, `flowId`, `flowVersionId`, `contentsVersionId`, `routeVersionId`, `nodeId`, `branchUnionGroupId`, `branchUnionGroupClassify`, `countTrue`, `countTargetNodeId`
- [ ] `details[n].no` and `unions[n].branchUnionId` correspond to each other
- [ ] Branch node attributes have `attributeKey` as `"NoSetting"` and `value` as `"1"` (automatic rule evaluation)
- [ ] `handleUsers` array contains reference viewer settings
- [ ] Flow's nodes includes human nodes (Apply/Approve/Horizontal/Vertical) as well as Branch_Start/Branch_End/Sync_Start/Sync_End (Start/End nodes are not included)
- [ ] For 3 or more branch choices, each branch uses a single condition and combines them with nested branches (details: `assets/template-branch.md` "How to Achieve Compound Conditions (AND)")

#### matter_property (Matter Property)

- [ ] Each property is an independent section with `<matter_property id="{key}">`
- [ ] Each property includes `matterPropertyKey`, `localeId`, `matterPropertyName`, `matterPropertyModelType`, `matterPropertyTypeListPattern`, `matterPropertyTypeMailTemplate`, `matterPropertyTypeImBoxTpl`, `matterPropertyTypeRule`, `alignType`, `searchRangeType`, `commaSeparatedFlag`, `calendarFlag`, `note`, `updateCount`
- [ ] Properties used in branch conditions have `matterPropertyTypeRule` set to `"1"`

#### rule (Branch Rule)

- [ ] Each rule is an independent section with `<rule id="{ruleId}">`
- [ ] Each rule includes `ruleId`, `localeId`, `ruleName`, `ruleUnionCondition`, `updateCount`, `ruleDetailModel`
- [ ] Rule conditions use `no`, `ruleId`, `compareRuleId`, `compareVariable`, `conditionValue`, `conditionValueType`
- [ ] `compareVariable` specifies the `matterPropertyKey` of the matter property (not the tag name `matterPropertyKey`)
- [ ] `conditionValue` specifies the comparison value (not the tag name `compareValue`)
- [ ] If the English `ruleName` contains `<` or `>`, they are escaped as `&lt;` and `&gt;`

### Locale/Version Check (locale)

- [ ] All 3 locales (en / ja / zh_CN) are present in all sections
- [ ] Each locale has 2 versions: blank period (`versionStatus="9"`) and active (`versionStatus="1"`)
- [ ] Blank period's `limitDate` is the day before the active version's `startDate`
- [ ] `nodeName` is the same English name across all locales (not localized)
- [ ] IDs and structure are identical across locales; only names (`contentsName`, `pageName`, `routeName`, `flowName`, `ruleName`, `matterPropertyName`) differ
- [ ] Random IDs for the same element (`contentsPluginId`, `pagePathId`, `no`, etc.) are identical across all locales

### Common Error Check (pitfall)

Checks based on past failures. Always verify after generation.

- [ ] Not outputting to the wrong directory like `src/main/conf/import/` → correct: `src/main/storage/public/im_workflow/`
- [ ] Not splitting into multiple files like contents.xml, route.xml, etc. → correct: single `im_workflow-{name}-import.xml`
- [ ] Not using custom tags like `<contents type="array"><content type="object">` → correct: `<contents id="..."><value type="array"><value type="object">`
- [ ] Not using `versionId` → correct: `contentsVersionId` / `routeVersionId` / `flowVersionId`
- [ ] Not omitting `startNodeFlag`, `endNodeFlag`, etc. from nodes → output all properties as in the sample
- [ ] Not omitting `targetType`, `targetCode` from plugins → include as in sample
- [ ] Not omitting `flowId`, `flowVersionId`, etc. from flow nodes → include as in sample
- [ ] Not using `matterPropertyKey`, `compareValue` tags in rules → correct: `compareVariable`, `conditionValue`, `conditionValueType`
- [ ] Not specifying `"0"` for branch `attributeKey` → correct: `"NoSetting"`
- [ ] Dynamic specification `parameter` matches the suffix ending → `_and_post` is `|{position}` format, `_and_role` is `|{role ID}` format, `_department` only is empty tag (details: `reference/authority-plugins.md`)
- [ ] Not using `approve.{suffix}` for approval nodes immediately after branch start / sync start system nodes → correct: `approve.static.{suffix}` (details: `reference/authority-plugins.md` "Choosing Between Static Approval (B-1) and Dynamic Approval (B-2)")
- [ ] Not using `.post` (direct) for position-name-only instructions (e.g., "Section Manager") → correct: `.apply_user_department_and_post` (details: `reference/authority-plugins.md` "Default Interpretation Rules for Approver Instructions")
- [ ] Not generating without reading the sample using the Read tool → **always read the sample before generating**
- [ ] No double company/org-set codes in dynamic plugin `parameter` → e.g., `|comp_sample_01^comp_sample_01^comp_sample_01^comp_sample_01^ps003` is wrong. Correct: `|comp_sample_01^comp_sample_01^ps003`. Automatically detected by the `[param]` check in `validate-workflow.js`. **In spec.json, specify only the position code etc. in `targetCode` for dynamic plugins; do not include company code or org-set code** (automatically added by `build-workflow.js`)
- [ ] Screen paths (`scriptPath` / `pagePath`) in contents definitions are consistent with the actual file locations → Screen paths are in `{feature}/workflow/...` format, and files are placed at `src/main/jssp/src/{feature}/workflow/...`
- [ ] `ruleId` / `contentsRuleId` / `cooperationId` are **20 characters or less** → IM-Workflow DB columns are VARCHAR(20). Generated in the form `rule_${shortName}_${rule.id}`, so if the combined length of `shortName` and `rule.id` is long, it may exceed the limit. Automatically detected by the `[len]` check in `validate-workflow.js`.
