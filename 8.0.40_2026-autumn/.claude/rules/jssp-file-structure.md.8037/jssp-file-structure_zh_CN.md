---
paths:
  - "src/main/jssp/**/*.js"
  - "src/main/jssp/**/*.html"
  - "src/main/conf/routing-jssp-config/**/*.xml"
  - "src/test/jssp/**/*.test.js"
---

# 文件结构规约

> **适用范围**: 🟢 **始终** — 适用于所有 JSSP 实现。决定文件位置时必须参考。

## 目录结构

```
src/
├── main/
│   ├── conf/
│   │   └── routing-jssp-config/                # 路由配置
│   └── jssp/
│       └── src/                                # JSSP 源代码根目录
│           └── {category}/                     # 归类相似功能的名称
│               ├── view/                       # 画面
│               │   ├── {view}.js               # 函数容器
│               │   └── {view}.html             # 展示页面
│               ├── api/                        # REST-API 程序
│               │   └── {api}.js                # API 实现（脚本开发模型）
│               ├── job/                        # 作业程序
│               │   └── {job}.js                # 作业实现（脚本开发模型）
│               ├── workflow/                   # IM-Workflow 联动程序
│               │   ├── apply/                  # 申请画面（以目录区分画面种类，详见下方例外规约）
│               │   │   ├── index.js
│               │   │   └── index.html
│               │   ├── approve/                # 审批画面
│               │   │   ├── index.js
│               │   │   └── index.html
│               │   ├── {action}.js             # 动作处理（脚本开发模型）
│               │   ├── {process}.js            # 案件开始/结束处理（脚本开发模型）
│               │   └── {rule}.js               # 规则判断处理（脚本开发模型）
│               └── common/                     # 公共处理
│                   └── {function}.js           # 函数
├── test/
│   ├── jssp/
│   │   └── src/                                # Jest on Rhino 单元测试
│   │       └── {category}/                     # 与源代码相同的目录结构
│   │           ├── view/{view}.test.js
│   │           ├── api/{api}.test.js
│   │           └── common/{function}.test.js
│   └── e2e/                                    # Playwright E2E 测试
│       └── {module-name}.spec.ts
```

### 基本方针

- 按功能单元划分文件夹，将相关文件归类存放
- `{function}` 目录下实现完全相同且被公共使用的 `.js` 文件处理，集中到 `common/` 目录下
  - 一个功能对应一个文件
- 文件夹名使用小写英文字母、数字和下划线

## 文件命名规则

### 基本规则

| 项目 | 规则 | 示例 |
|------|------|------|
| 字符类型 | 小写英文字母、数字、下划线 | `user_master.js` |
| 配对 | .js 与 .html 同名，**必须成对存在** | `user_edit.js` + `user_edit.html` |
| 扩展名 | 必须为小写 | `.js`, `.html` |

### 不经过路由表调用的画面的例外规约

本页所定义的 `view/{view}.js` 模式（每个画面的 snake_case 唯一名）适用于**经过路由表、通过 URL 访问调用的画面**。

对于**不经过路由表、通过其他途径被调用的画面**，请遵循各专用技能定义的**另一套规约**（这并非与本规约矛盾，而是源于调用方不同）：

| 调用途径 | 放置・命名规约 | 负责技能 |
|---------|--------------|---------|
| IM-Workflow 引擎（XML 的 `scriptPath`） | `{功能名}/workflow/{画面种类}/index.js`（以目录区分画面种类，文件名统一为 `index`） | `jssp-im-workflow-usage` |
| 门户功能（`b_m_portlet_info.path`） | `{功能名}/view/index.js`（按本页 `view/{view}.js` 模式放置，但不创建路由配置・路由授权） | `jssp-page-generator`（`assets/simple-portlet.md`） |
| IM-ContentsSearch（`<template-path>`） | `im_contents_search/template/{功能名}.js` / `.html`（只要符合脚本开发模型的结构即可，无文件命名规约；不创建路由配置・路由授权） | `jssp-im-contents-search-generator` |

这些例外画面由内容定义 XML 或平台功能直接调用，因此无需 URL 路由（IM-Workflow 情形下一个功能内还可以存在多个画面，如 apply / approve / detail 等）。
新规生成时请参阅各负责技能的 SKILL.md。

### .html 文件的必要性

在 JSSP 的画面（`view/` 目录下），**即使展示页面没有内容需要显示，也必须放置与 `.js` 同名的 `.html` 文件**。
文件不存在时，画面请求将发生错误。若没有内容需要显示，创建**空文件**（0 字节）即可。

```
content/view/content_list.js    # 函数容器
content/view/content_list.html  # 展示页面（即使为空也是必需的）
```

### 禁止事项

- 使用大写字母（例如：`UserMaster.js` 不可）
- 使用连字符（例如：`user-master.js` 不可）
- 使用空格或日文字符

### 推荐模式

```
# 画面相关
{功能名}_{画面类型}.js/.html

示例：
user_list.js        # 用户列表
user_edit.js        # 用户编辑
travel_apply.js     # 申请画面
travel_approve.js   # 审批画面

# 处理相关（无画面）
{动作类型}_{处理对象}.js

示例：
search_user.js      # 搜索处理
register_user.js    # 注册处理
update_user.js      # 更新处理
delete_user.js      # 删除处理
```

## 路由配置

路由配置文件放置在 `routing-jssp-config/` 目录下。

### 基本结构

```xml
<?xml version="1.0" encoding="UTF-8"?>
<routing-jssp-config
    xmlns="http://www.intra-mart.jp/router/routing-jssp-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/router/routing-jssp-config routing-jssp-config.xsd">

  <!-- URL 与脚本的映射（每个 file-mapping 都必须明示 authz） -->
  <file-mapping path="/sample/user/list" page="user/view/user_list">
    <authz uri="service://sample/user/list" action="execute" />
  </file-mapping>

</routing-jssp-config>
```

### page 属性的指定方式

`page` 属性指定以 `src/main/jssp/src/` 为起点的相对路径（不含扩展名）。
源文件放置在 `src/main/jssp/src/` 目录下，在路由的 `page` 中写入其中的相对路径。

```
src/main/jssp/src/{category}/view/{view}.js
                    ↓
page="{category}/view/{view}"
```

| 文件路径 | page 属性值 |
|---------|-----------|
| `src/main/jssp/src/simple_form/view/index.js` | `simple_form/view/index` |
| `src/main/jssp/src/sample_wizard/view/index.js` | `sample_wizard/view/index` |
| `src/main/jssp/src/simple_form/api/register.js` | `simple_form/api/register` |

### 授权配置指南

- **原则上禁止使用 `welcome-all`（跳过授权）**。也不要使用 `<authz-default mapper="welcome-all" />`。
- 每个 `file-mapping` 都**必须明示** `<authz uri="service://{功能名}/{处理}" action="execute" />`。
- `uri` 所引用的授权资源（policy / resource / resource-group / subject-group）须使用 `jssp-tenant-setup-generator` 技能进行定义并导入。
- 请注意：若未准备授权资源，部署后的访问将始终被拒绝。

| 写法 | 用途 | 说明 |
|------|------|------|
| `<authz uri="..." action="..." />` | 全部画面・全部 API（原则） | 对授权资源判定访问权限 |
| `welcome-all` / `authz-default` | （不推荐・原则上不使用） | 因会跳过授权，故不得使用 |
