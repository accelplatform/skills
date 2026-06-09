# IM-Workflow 画面生成自我检查清单

画面程序（.html / .js）生成完成后，请使用以下检查清单进行自我验证。

**注意：** `validate-workflow-code.js` 自动检测的项目（imds 类名错误、pageType 无效值、DbParameter 类型转换遗漏、imart 标签属性、imuiCalendar hidden 误用）不包含在本检查清单中。仅记录脚本无法检测的项目。

## 通用（所有画面）

- [ ] 文件放置目录为 `src/main/jssp/src/{功能名}/workflow/{子目录}/`
- [ ] `<imart>` 标签的 `type`、`escapeXml`、`escapeJs` 等固定值属性用双引号括起
- [ ] `<imart>` 标签未使用 `filter` 属性（`filter` 属性不存在。要在 HTML 中显示 JSON 内的个别值（用户名、部门名等），请放置 `<span id="..."></span>`，并在 JavaScript 的 `initializeView` 中用 `element.textContent = result.xxx` 进行设置）
- [ ] 入口点进行了 `$data.error.code` 的判断
- [ ] 按钮事件通过 `addEventListener` 注册，而非 `onclick` 属性
- [ ] 使用 IM-共通主数据 API（`IMMUserManager` / `IMMCompanyManager`）时，实现了 `locales` 的 null 检查 + 区域设置回退（`locales[locale] || locales[tenantLocale] || locales[Object.keys(locales)[0]]`）
- [ ] 将从服务器获取的值（用户名、部门名等）显示在 HTML 中时，是在 JavaScript 的 `initializeView` 中用 `textContent` 设置，而非使用 `<imart>` 标签

### 图标按钮

- [ ] 图标与文字并用的按钮中，文字用 `<span class="imds-button-text">` 括起（不可直接放置文字节点）
- [ ] 仅图标的按钮（无文字，如删除垃圾桶图标）使用普通大小（不使用 `is-small` / `is-x-small`）

## 申请画面（含输入表单）

### 验证结构

- [ ] 符合 `{{AGENT_RULES}}/jssp-presentation-page.instructions.md` 规范的验证函数组（`clearValidationError`、`showValidationError`、`createRequest`、`getValidationErrors`、`resetValidationError`、`validateCurrentStep`）按此顺序定义
- [ ] 通过 `activeValidation` 标志实现实时再验证（文本输入使用 `input` 事件，选择框/日期使用 `change` 事件）

### 使用 imuiCalendar 时

- [ ] 指定了 `floatable="true"`（未指定时会出现内联显示，无法显示文本框＋日历图标的标准 UI）
- [ ] `altField` 引用的是显示用文本框（`<input type="text">`）（不得指定 hidden input）
- [ ] HTML 的放置顺序为"显示用文本框 → `<imart type="imuiCalendar">`"（顺序反转会导致日历图标显示在文本框左侧）
- [ ] 对 `altField` 引用的文本框应用了 `Object.defineProperty`，并在 value 的 setter 中发出 `change` 事件
- [ ] 日期变更时的事件监听器已注册到 `altField` 引用的文本框

### 使用 IM-共通主数据搜索（imACMSearch）时

- [ ] 以 `window._resetValidationError` 公开了再验证函数
- [ ] 在回调函数中设置值后调用了 `window._resetValidationError()`

### HTML 结构

- [ ] 验证对象的 `imds-field` 标签附有 `for=":fieldName:"` 属性
- [ ] 验证对象的 `imds-field` 配下放置了 `<span class="imds-error-text" for=":fieldName:" style="display:none;"></span>`
- [ ] 未使用 `maxlength` 属性（字符数限制通过验证错误消息通知）
- [ ] **始终必填**的标签以静态方式附有 `imds-required-label-required` 类 + `data-required-label="必须"`
  - 因 accessibility 需求（作为 `aria-labelledby` 的引用目标）需附加 `id` 时，请采用 **`:fieldName:-label`** 形式（冒号包裹）。**无需**调用 `toggleRequiredMark()`
- [ ] **条件必填**（根据特定输入值在必填/可选之间切换）字段的标签不以静态方式附加 `imds-required-label-required`，而是通过以下模式进行动态控制：
  - 在标签 span 上附加 `id="fieldName-label"`（**不含冒号**；不附加类名）
  - 定义 `toggleRequiredMark(id, condition)` 函数，并在与显示控制相同的时机调用
  - 示例：`toggleRequiredMark('period-end-label', periodType === 'temporary')`
  - id 命名规约的详情请参阅 `{{AGENT_RULES}}/jssp-presentation-page.instructions.md`「id 属性的命名规约」

### 输入字段的宽度控制

- [ ] imuiCalendar 的文本框指定了 `style="max-width: 10em;"`
- [ ] 选择框指定了 `max-width`，并根据选项的字符数设置了适当的宽度
- [ ] 尺寸（`max-width` / `min-width` / `width` / `height` 等）通过 **内联 `style="...: ...em;"`** 指定（不在 `<style>` 块中定义自定义 `.max-width-NNem` / `.min-width-NNem` 等类。其优先级与 imds 默认相同，无法覆盖并被迫滥用 `!important`）

### name 属性的重复防止

- [ ] `workflowOpenPage` 表单内的输入字段（`select`、`input[type=text]`、`textarea` 等）未附 `name` 属性（与 hidden 字段的 `name` 重复时，`userParam` 会变成数组，在动作处理中导致错误）
- [ ] 单选按钮组的 `name` 与 hidden 字段的 `name` 不同（例：输入用 `name="urgencyTypeInput"` / hidden `name="urgencyType"`）
- [ ] 值的传递方式为：申请按钮按下时通过 JS 将值复制到 hidden 字段

### 案件名称、再申请和按钮

- [ ] `workflowOpenPage` 表单内放置了 `<input type="hidden" id="imwMatterName" name="imwMatterName" value="" />`
- [ ] 申请按钮按下时，按照流程定义的案件名称规则向 `imwMatterName` 设置了值
- [ ] 通过 `imwSystemMatterId` 的有无切换 pageType（空=`'0'` 新规申请，有=`'3'` 再申请）
- [ ] 再申请模式时，将申请按钮的标签改为"再申请"
- [ ] 申请按钮调用了 `validateCurrentStep()`，为 `false` 时执行了 `return`

## 动作处理（.js）

- [ ] 所有函数的签名为 **2个参数** `(parameter, userParam)`（`parameter.userParameter` 不存在。表单值通过第2个参数 `userParam` 传递）
- [ ] 传递给 `executeByTemplate` 的参数对象键名与 SQL 模板的绑定变量名（`/*xxx*/`）**完全一致**（SQL 为蛇形命名法 `user_data_id` 时，JS 端也必须为 `user_data_id`；不得使用驼峰命名法 `userDataId`）
- [ ] `apply` 函数中通过 `WorkflowNumberingManager.getNumber()` 生成了案件编号，并设置到 `result.data`（规格说明中无格式指定时，也执行默认编号）
- [ ] `reapply` 函数中未生成案件编号（再申请时案件编号已存在）
- [ ] 案件属性操作使用了 `UserActvMatterPropertyValue` 的正确方法（`createMatterProperty(Array)` / `updateMatterProperty(Array)` / `getMatterProperty(String, String)`；`setMatterProperty` 不存在）
- [ ] 案件属性的参数为对象的**数组**（`[{ userDataId, key, value }]`）
- [ ] 在 d.ts 中确认了方法名和参数类型
- [ ] 在 `apply` 函数中执行 INSERT 数据时，判断了是否存在已有数据（撤回后的 `applyFromUnapply` 时数据已存在）

## 审批画面（只读）

- [ ] 所有字段用 `<span>` 元素显示（无输入字段）
- [ ] 选择框的值转换为标签后显示
- [ ] 处理按钮**只有1个**，调用 `workflowOpenPage('4')`（不使用单独的审批/退回/否决/保留按钮。处理类型在 IM-Workflow 标准对话框中选择）
- [ ] 画面上未放置注释输入栏（注释在 IM-Workflow 标准对话框中输入）

## 详细画面（只读）

- [ ] 所有字段用 `<span>` 元素显示
- [ ] **"返回"按钮不存在**（`imw-back-button` / `imw-back-form` / `workflowOpenPage` 标签全部省略）
- [ ] 处理按钮不存在
- [ ] 案件属性的获取对应未完成/已完成/历史案件3种模式
  - `imwArchiveMonth` 存在 → 使用 `UserArcMatterPropertyValue(archiveMonth)`
  - `imwArchiveMonth` 为空 且 未完成 API 有数据 → 使用 `UserActvMatterPropertyValue`
  - `imwArchiveMonth` 为空 且 未完成 API 数据为空 → 回退到 `UserCplMatterPropertyValue`
  - 仅用 `UserActvMatterPropertyValue` 实现时，打开已完成/历史案件时详情不显示
