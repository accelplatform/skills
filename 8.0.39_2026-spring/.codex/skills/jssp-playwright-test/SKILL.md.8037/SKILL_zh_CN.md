---
name: jssp-playwright-test
description: 为 intra-mart JSSP 表示页面（HTML）生成 Playwright E2E 测试。解析画面的 HTML 结构，根据表格、对话框、表单、按钮样式等测试观点生成测试代码。在提及 E2E 测试、UI 测试、画面测试、Playwright、浏览器测试、集成测试、画面行为确认、创建测试时使用。画面系的测试请使用本技能。
---

■■ 参考规则 清单（必须） ■■

实施前必须确认以下内容。有未确认项目时不得开始。

- [ ] [jssp-testing](../../../requirements/jssp-testing/AGENTS.md) 已参考并理解内容


# Playwright E2E 测试生成技能

## 概要

为 intra-mart Accel Platform 表示页面（HTML）生成 Playwright E2E 测试的技能集。
解析目标页面的 HTML 结构（表格、对话框、表单、按钮等），根据测试观点生成测试代码。

## 使用时机

当用户提出以下类型的请求时：
- "为○○画面创建测试"
- "用 Playwright 编写测试"
- "添加 E2E 测试"
- "创建 UI 测试"

## 测试生成步骤

1. 加载目标表示页面（HTML）
2. 从 HTML 结构中确定可测试的元素（表格、表单、对话框、按钮等）
3. 根据 `{{AGENT_RULES}}/jssp-testing{{AGENT_RULE_FILE}}.md` 的测试观点设计测试用例
4. **在生成测试代码之前**，向用户确认以下 2 项（不得先生成代码）

   **确认 ①：截图（布局视认用）**
   > 「是否要加入使用 `takeScreenshot()` 的截图功能？
   > 供编码代理在测试执行后读取图像，目视确认布局异常。」

   **确认 ②：视觉回归测试（退化检测用）**
   > 「是否要添加使用 `toHaveScreenshot()` 的视觉回归测试？
   > 首次运行时生成基线图像，再次测试时自动检测外观变化。」

5. 收到用户的回答后再生成测试代码（参考 `assets/` 目录下的示例代码）

## 参考资料

| 文件 | 内容 |
|---------|------|
| `assets/playwright-config.md` | playwright.config.ts 的配置示例和注意事项 |
| `assets/test-helpers.md` | 测试公共辅助函数模式集 |
| `assets/test-list-page.md` | 列表画面（表格、分页、排序）的测试实例 |
| `assets/test-crud-dialog.md` | CRUD 对话框（新建、编辑、删除）的测试实例 |
| `assets/test-validation.md` | 验证（必填、字符类型、字符数、范围、重复、实时解除）的测试实例 |
| `assets/test-button-style.md` | 按钮样式（is-primary / is-danger）及确认对话框的测试实例 |
| `assets/test-mailpit.md` | 使用 mailpit 对邮件发送功能的 E2E 测试（通过 HTTP API 验证邮件、在代理之下访问 mailpit 的方法、获取 CSRF 安全令牌的模式） |
| `{{AGENT_RULES}}/jssp-testing{{AGENT_RULE_FILE}}.md` | 测试观点和配置规范 |

## 测试设计原则

### 登录处理

E2E 测试在跳转到画面前可能需要登录。
如果测试指令中包含"登录"，则在 `test.describe` 的 `beforeEach` 中包含以下登录处理。

- 如果指定了用户编码，则使用该用户编码和密码
- 如果有"以租户管理员登录"的指示且未指定用户编码，则默认使用 `tenant`（无密码）

```typescript
// 登录（指定用户编码时）
await page.goto('login');
await page.locator('#im_user').fill('aoyagi');        // 用户编码：aoyagi
await page.locator('#im_password').fill('aoyagi');    // 密码：aoyagi
await page.locator('input[type="submit"]').click();
```

```typescript
// 登录（租户管理员时）
await page.goto('login');
await page.locator('#im_user').fill('tenant');        // 用户编码：tenant
await page.locator('input[type="submit"]').click();   // 无密码
```

### 文件结构

- 测试文件放置在 `src/test/e2e/<module-name>.spec.ts`
- 每个模块（画面）一个测试文件
- 使用 `test.describe` 按类别对测试进行分组

### URL 指定

- 以 `baseURL` 的相对路径指定（例：`'./product_stock'`）
- 不使用绝对路径或带前导斜杠的路径

### 画面跳转后的验证（防止 404 漏检 — 必须）

对于通过按钮、链接、表单提交跳转到其他画面的测试，**不得仅以 URL 的部分匹配进行判定**。
如果跳转目标 URL 错误并脱离了上下文路径（例如：上下文路径为 `/imart/`，却写成 `location.href = '/equip/...'` 这类带前导斜杠的绝对路径），HTTP 404 页面仍然显示但 URL 字符串恰好匹配，测试会在 404 状态下静默通过。

涉及跳转的测试 **必须同时验证以下 3 项**：

```typescript
// NG：仅 URL 部分匹配 — 404 也会通过
await expect(page).toHaveURL(/equip\/equipment\/search/);

// OK：3 项验证
await expect(page).toHaveURL(/imart\/equip\/equipment\/search/);  // ① 含上下文路径的 URL
await expect(page).toHaveTitle(/备品检索/);                       // ② 跳转目标页面的标题
await expect(page.locator('h1#page-title')).toBeVisible();        // ③ 页面主体的标题
```

| 验证项目 | 作用 |
|---------|------|
| ① URL（含上下文路径） | 排除脱离上下文路径的 404 |
| ② `toHaveTitle` | 确认未返回其他页面 |
| ③ 如 `h1#page-title` 等页面识别元素 | 确认 DOM 已正确渲染 |

通用辅助函数 `expectNavigated()` 已在 `assets/test-helpers.md` 中定义，推荐测试中使用。

### 定位器指定方针

- 优先使用 id 选择器（例：`#create-button`、`#stock-table-body`）
- imds 组件的 id 为 `:fieldName:` 格式，需要转义（例：`#\\:productCode\\:`）
- 表格单元格为 `<td><span>文本</span></td>` 结构，文本匹配使用 `toContainText`
- 行的定位使用 `page.locator('tr', { has: page.locator('text=...') })` 模式

### imds 组件的验证要点

- 验证错误：检查 `.imds-field` 是否添加了 `imds-validation-error` 类
- 错误消息：检查 `.imds-error-text[for=":fieldName:"]` 是否显示并包含适当的消息
- 对话框遮罩层：通过 `is-active` 类的添加/移除判断开关状态
- 确认对话框：使用 `.imds-confirm-ok-button` / `.imds-confirm-cancel-button` 操作
- 按钮样式：主要操作验证 `is-primary`，危险操作验证 `is-danger` 类

## 截图

辅助函数的实现请参考 `assets/test-helpers.md` 的"截图"部分。

### 布局视认用（`takeScreenshot`）

供编码代理在测试执行后读取截图，目视确认布局异常的用途。
**仅当用户在测试生成步骤的确认 ① 中回答「添加」时**，才在以下时机插入。

| 时机 | 示例 |
|------|------|
| 页面加载完成后 | `waitForSelector` 的紧接之后 |
| 对话框开关后 | 确认 `is-active` 类的紧接之后 |
| CRUD 操作后 | 注册、更新、删除结果反映后 |
| 验证错误显示后 | 确认错误类添加后的紧接之后 |

输出目录：`test-results/screenshots/<name>.png`

### 证迹用（`screenshotStep`）

仅当指示中包含"留下证迹"、"保存截图"、"evidence"等关键词时才使用。
用 `screenshotStep()` 替换普通的 `takeScreenshot()`，以 `fullPage: true` 记录各测试步骤。

输出目录：`test-results/evidence/<testName>_<label>.png`

### 视觉回归测试（`toHaveScreenshot`）

**仅当用户在测试生成步骤的确认 ② 中回答「添加」时**，才添加视觉回归用的 `test.describe` 块。
实现模式请参考 `assets/test-helpers.md` 的「视觉回归测试」部分。

若用户未作回答，可就确认 ② 再次询问。不得自行判断是否添加。

## 注意事项

- 测试观点的详情请参考 `{{AGENT_RULES}}/jssp-testing{{AGENT_RULE_FILE}}.md`
- 由于 HTML 的 `maxlength` 属性不使用，必须在验证测试中确认字符数超限
- `toHaveText` 可能不匹配单元格内的 `<span>` 结构，推荐使用 `toContainText`
- **实时验证（即时错误解除）的测试必须一次生成所有模式。** 不遗漏地包含 `assets/test-validation.md` 的"实时验证"部分定义的以下 6 个观点：
  - 每个必填字段的即时解除
  - 可选字段的即时解除
  - 错误类型切换时的解除
  - 验证触发前无反应
  - 多个字段的单独解除
  - `imds-validation-error` クラスの移除
