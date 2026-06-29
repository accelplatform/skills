---
name: jssp-im-master-usage
description: 生成调用 intra-mart IM 通用主数据检索（imACMSearch）搜索对话框的代码。提供用户检索、组织检索、公司检索、公共组检索、角色检索等弹窗实现模式。在提及用户检索、组织选择、主数据检索、用户选择对话框、选择员工、检索部门时使用。imACMSearch 标签的参数和回调结构不得凭记忆编写，必须参考本技能的 reference。
---

■■ 参考规则 清单（必须） ■■

实施前必须确认以下内容。有未确认项目时不得开始。

- [ ] [jssp-accessibility](../../../requirements/jssp-accessibility/AGENTS.md) 已参考并理解内容
- [ ] [jssp-presentation-page](../../../requirements/jssp-presentation-page/AGENTS.md) 已参考并理解内容


# IM 通用主数据检索 代码生成技能

## 概要

在 intra-mart Accel Platform 中，使用 IM 通用主数据检索（imACMSearch）生成搜索对话框调用代码的技能集。
实现用户检索、组织检索、公司检索、公共组检索等各类主数据检索画面的弹窗调用。

## 适用方针

**画面中需要从 IM 通用主数据（用户・组织・公司・公共组・私有组・角色）选择值时，必须使用本技能嵌入主数据检索对话框。** 不得自行制作 `<input type="text">` 或 `<select>` 让用户手动输入代码。

原因：

- 手动输入用户代码、组织代码等容易出错，可能引入不存在的代码
- 无法跟随组织变更和人事调动
- imACMSearch 标准支持多语言显示、权限控制、树形/关键字切换

使用 `jssp-im-workflow-usage` 或 `jssp-page-generator` 生成画面时，若遇到此情况，请配合使用本技能。

## 需参照的规约

本技能生成嵌入画面的 HTML 片段（`imACMSearch` 调用）。本技能单独不生成 `.js`，因此应参照的规约集中于 HTML 系。全局视图请参阅 `{{AGENT_RULES}}/README.md`。

| 规约 | 处理方式 |
|------|---------|
| `jssp-presentation-page.md` | 🟢 **必读** — HTML 结构、id 命名 |
| `jssp-naming.md` / `jssp-file-structure.md` | 🟢 必读 |
| `jssp-imds-theme` 技能的 reference | 🟢 必读（不得凭记忆书写 imds 类名） |
| `jssp-function-container.md` / `jssp-2way-sql.md` / `jssp-error-handling.md` 等 | 🔴 **本技能单独不需要**（由调用方技能适用） |
| `jssp-accessibility.md` | 🟠 **业务需求依赖** — 主数据检索对话框通过 imds 标准实现已具备基础 ARIA，通常无需追加厚涂 |

## 完成品示例

- `assets/user-search.md` — 用户检索完成品（HTML 片段）
- `assets/company-search.md` — 公司检索完成品（HTML 片段）
- `assets/department-search.md` — 组织检索完成品（HTML 片段）
- `assets/public-group-search.md` — 公共组检索完成品（HTML 片段）
- `assets/private-group-search.md` — 私有组检索完成品（HTML 片段）
- `assets/role-search.md` — 角色检索完成品（HTML 片段）

## 参考资料

- `reference/imart-tag-acm-search.md` — `imACMSearch` 标签的 API 参考（参数、插件ID、回调结构）

## 使用时机

当用户提出以下类型的请求时：
- "添加用户检索"
- "实现组织选择对话框"
- "添加主数据检索弹窗"
- "创建用户选择字段"

## 实现步骤

### 需求确认

确认以下内容：
- **检索对象**：用户 / 组织 / 公司 / 公共组 / 角色 / 其他
- **选择模式**：单选（single）/ 多选（multiple）
- **使用标签页**：关键字检索 / 树形检索 / 多标签页
- **获取项目**：编码、名称及其他必要字段
- **放置位置**：添加到现有画面还是新建画面

### 参考资料查阅

加载 `reference/imart-tag-acm-search.md`，确认以下内容：
- 对应检索对象的插件ID
- 回调函数中可获取的 data 字段
- 必要的参数设置

### 代码生成

以 `assets/user-search.md` 的完成品为基础，按以下结构生成代码：

#### head 部分（`<imart type="head">` 内）

```html
<imart type="head">
  <!-- 调用 IM 通用主数据检索画面用标签 -->
  <imart type="imACMSearch" />

  <script type="text/javascript">
    // 1. 打开搜索对话框的事件监听器
    // 2. 调用 imACMSearch.open(parameter)
    // 3. 定义回调函数
    // 4. 将回调函数注册到 window
  </script>
</imart>
```

#### body 部分（表单元素）

```html
<!-- 隐藏字段（用于保存编码值） -->
<input type="hidden" id=":xxxCode:" value="">
<!-- 显示字段（名称显示 + 放大镜图标） -->
<input type="text" id=":xxxName:" placeholder="..." class="imds-textbox" readonly value="">
<span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
```

### 实现必须遵守的规则

- `<imart type="imACMSearch" />` 必须放置在 `<imart type="head">` 内
- 回调函数在全局作用域中定义（通过 `window.函数名 = 函数名` 注册）
- 在 `tabs` 中明确指定插件ID，只显示必要的标签页
- `prop` 中指定的字段名必须与标签页实现返回的键一致
- 显示用字段设为 `readonly`，只允许通过对话框选择
- 多选模式（`type: 'multiple'`）中，将回调的 `result` 保存到变量中，在重新检索时作为 `default_selected` 参数传递，以便在对话框中恢复已选项目

## 各检索对象的设置示例

### 用户检索

- 插件ID：`jp.co.intra_mart.master.app.search.tabs.user.list_user`
- prop：`['user_cd', 'user_name']`
- 回调中获取：`result[i].data.user_cd`、`result[i].data.user_name`
- 完成品：参考 `assets/user-search.md`

### 组织检索

- 插件ID：`jp.co.intra_mart.master.app.search.tabs.department.list`（关键字）/ `.tree`（树形）
- prop：`['company_cd', 'department_cd', 'department_name']`
- 回调中获取：`result[i].data.department_cd`、`result[i].data.department_name`
- 完成品：参考 `assets/department-search.md`

### 公司检索

- 插件ID：`jp.co.intra_mart.master.app.search.tabs.company.list`
- prop：`['company_cd', 'department_set_cd']`
- 回调中获取：`result[i].data.company_cd`、`result[i].data.department_name`
- 完成品：参考 `assets/company-search.md`

### 公共组检索

- 插件ID：`jp.co.intra_mart.master.app.search.tabs.public_group.list`（关键字）/ `.tree`（树形）
- prop：`['public_group_set_cd', 'public_group_cd', 'public_group_name']`
- 回调中获取：`result[i].data.public_group_cd`、`result[i].data.public_group_name`
- 完成品：参考 `assets/public-group-search.md`

### 私有组检索

- 插件ID：`jp.co.intra_mart.master.app.search.tabs.private_group.list`
- prop：`['private_group_cd', 'private_group_name']`
- 回調中获取：`result[i].data.private_group_cd`、`result[i].data.private_group_name`
- 完成品：参考 `assets/private-group-search.md`

### 角色检索

- 插件ID：`jp.co.intra_mart.master.app.search.tabs.role.list`
- prop：`['role_id']`
- 回调中获取：`result[i].data.role_id`（角色名从 `result[i].displayName` 获取）
- 完成品：参考 `assets/role-search.md`

### 其他

插件ID 和获取字段的详情请参考 `reference/imart-tag-acm-search.md`。

## 注意事项

- 必须参考参考资料，不得凭记忆或推测使用插件ID或字段名
- 遵循完成品示例的结构模式（事件监听器、参数构建、回调、window 注册）
- HTML 部分遵循 `jssp-imds-theme` 技能的规范，使用 imds 的类名
