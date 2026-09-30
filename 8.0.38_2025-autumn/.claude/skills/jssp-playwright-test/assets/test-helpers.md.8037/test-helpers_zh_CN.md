# 测试通用辅助函数

## 概述

放置在测试文件开头的通用辅助函数模式集合。
根据目标画面的结构选择并自定义所需的函数。

## 页面跳转

```typescript
import { test, expect, type Page } from '@playwright/test';

const URL = './module_name';

// 打开页面并等待表格渲染完成
async function openPage(page: Page) {
  await page.goto(URL);
  await page.waitForSelector('#table-body tr');
}
```

## 画面跳转后的验证（防止 404 漏检）

对于通过按钮、链接、表单提交跳转到其他画面的测试，**必须** 使用此辅助函数进行验证。
仅以部分匹配的正则使用 `toHaveURL` 时，会让跳转到上下文路径（`/imart/`）外的 404 页面仍然通过测试，因为 URL 字符串仍可匹配。

```typescript
/**
 * 通过 3 项验证确认画面跳转成功。
 *
 * @param page         - Playwright Page
 * @param urlRegex     - 期望 URL 的正则（须含上下文路径。例：/imart\/equip\/equipment\/search/）
 * @param titleRegex   - 期望页面标题的正则（可省略）
 * @param headingId    - 期望标题元素的 id（默认：'page-title'）
 */
async function expectNavigated(
  page: Page,
  urlRegex: RegExp,
  titleRegex?: RegExp,
  headingId: string = 'page-title'
) {
  // ① 含上下文路径的 URL —— 排除脱离上下文路径的 404
  await expect(page).toHaveURL(urlRegex);
  // ② 标题 —— 确认未返回其他页面
  if (titleRegex) {
    await expect(page).toHaveTitle(titleRegex);
  }
  // ③ 页面主体的标题 —— 确认 DOM 已正确渲染
  await expect(page.locator(`h1#${headingId}`)).toBeVisible();
}
```

使用示例：

```typescript
test('点击备品检索按钮跳转到备品检索画面', async ({ page }) => {
  await page.locator('#goto-search').click();
  await expectNavigated(page, /imart\/equip\/equipment\/search/, /备品检索/);
});
```

**urlRegex 书写原则**：
- 必须包含 baseURL 的末尾段（intra-mart 为 `imart`）
- 例：baseURL 为 `http://127.0.0.1/imart/` 时使用 `/imart\/equip\/.../`
- 由此可防止误跳转至 `http://127.0.0.1/equip/...`（脱离上下文路径）时的误匹配

## 对话框操作

```typescript
// 打开对话框（新建）
async function openCreateDialog(page: Page) {
  await page.click('#create-button');
  await expect(page.locator('#dialog-overlay')).toHaveClass(/is-active/);
}

// 打开对话框（编辑 — 第一行的编辑按钮）
async function openEditDialog(page: Page) {
  await page.click('#table-body tr:first-child [data-edit-code]');
  await expect(page.locator('#dialog-overlay')).toHaveClass(/is-active/);
}
```

## 确认对话框操作

```typescript
// 点击确认对话框的"执行"按钮
async function confirmOk(page: Page) {
  await page.click('.imds-confirm-ok-button');
}

// 点击确认对话框的"取消"按钮
async function confirmCancel(page: Page) {
  await page.click('.imds-confirm-cancel-button');
}
```

## 数据操作

```typescript
// 删除所有数据使其为空（适用于使用 sessionStorage 的画面）
async function deleteAllData(page: Page) {
  await page.evaluate(() => {
    sessionStorage.setItem('storage_key', JSON.stringify([]));
  });
  await page.reload();
}
```

## 定位器的转义

imds 组件的 id 格式为 `:fieldName:`，因此在 CSS 选择器中需要转义。

```typescript
// 字段输入
await page.fill('#\\:productCode\\:', 'ABC123');

// 获取错误消息
const error = page.locator('.imds-error-text[for="\\:productCode\\:"]');

// 字段的验证错误类
const field = page.locator('#dialog .imds-field[for="\\:productCode\\:"]');
await expect(field).toHaveClass(/imds-validation-error/);
```

## 表格行的定位

表格单元格为 `<td><span>文本</span></td>` 结构，需要注意。

```typescript
// 定位行（text= 也匹配嵌套元素内的文本）
const row = page.locator('#table-body tr', {
  has: page.locator(`text=${productCode}`)
});

// 验证单元格文本（toContainText 也匹配包含子元素的文本）
await expect(row.locator('td:nth-child(3)')).toContainText('商品名称');

// NG: toHaveText 有时无法匹配 <span> 内的文本
// await expect(row.locator('td:nth-child(3)')).toHaveText('商品名称');
```

## 截图

截图保存到 `test-results/` 目录（Playwright 的默认 `outputDir`）。

### 布局视认用（供编码代理进行目视确认）

在页面加载后及主要 UI 操作后调用。代理在测试执行后通过 `Read` 工具打开 PNG 文件，对布局异常进行目视检查。

```typescript
async function takeScreenshot(page: Page, name: string) {
  const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
  await page.screenshot({ path: `test-results/screenshots/${safeName}.png` });
}
```

使用示例：

```typescript
test('列表画面初始显示', async ({ page }) => {
  await page.goto(URL);
  await page.waitForSelector('#table-body tr');
  await takeScreenshot(page, 'list-page-initial');         // 页面加载后
  await page.click('#create-button');
  await expect(page.locator('#dialog-overlay')).toHaveClass(/is-active/);
  await takeScreenshot(page, 'create-dialog-open');        // 对话框打开后
});
```

**调用时机参考**：
- 页面加载完成后（`waitForSelector` 的紧接之后）
- 对话框开关后
- CRUD 操作后（注册、更新、删除结果反映后）
- 验证错误显示后

### 证跡用（仅在明确指示时使用）

仅当指示中包含"留下证跡"、"保存截图"、"evidence"等关键词时才使用。
用 `screenshotStep()` 包裹各测试步骤，按顺序保存整页截图。

```typescript
async function screenshotStep(page: Page, testName: string, label: string) {
  const safeName = `${testName}_${label}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  await page.screenshot({ path: `test-results/evidence/${safeName}.png`, fullPage: true });
}
```

使用示例：

```typescript
test('新建注册流程', async ({ page }) => {
  await page.goto(URL);
  await page.waitForSelector('#table-body tr');
  await screenshotStep(page, 'create-product', '01_list-initial');

  await page.click('#create-button');
  await expect(page.locator('#dialog-overlay')).toHaveClass(/is-active/);
  await screenshotStep(page, 'create-product', '02_dialog-open');

  await page.fill('#\\:productCode\\:', 'ABC123');
  await page.fill('#\\:productName\\:', '测试商品');
  await screenshotStep(page, 'create-product', '03_form-filled');

  await page.click('#save-button');
  await page.click('.imds-confirm-ok-button');
  await page.waitForSelector('#table-body tr');
  await screenshotStep(page, 'create-product', '04_after-save');
});

## 视觉回归测试（退化检测）

使用 `toHaveScreenshot()`，可以将后续运行结果与首次运行时生成的基线图像自动比较，将外观上的变化作为测试失败来检测。

### 运行机制

| 执行时机 | 行为 |
|---------|------|
| 首次运行（无基线） | 生成并保存快照。测试始终通过 |
| 第二次及以后 | 与基线比较，若差异超出阈值则失败并输出差异图像 |

### 基本模式

```typescript
test('列表画面视觉回归测试', async ({ page }) => {
  await page.goto(URL);
  await page.waitForSelector('#table-body tr');

  // 与基线比较（文件名需固定）
  await expect(page).toHaveScreenshot('product-list.png');
});
```

### 指定允许的差异范围

当动画、日期时间等微小差异可以接受时，指定 `maxDiffPixelRatio`。

```typescript
await expect(page).toHaveScreenshot('product-list.png', {
  maxDiffPixelRatio: 0.01,  // 允许全体像素 1% 以内的差异
});
```

### 基线图像的管理

- 基线图像**必须纳入版本控制（Git）**
- Playwright 将基线保存在测试文件同级目录下的 `<spec-name>-snapshots/` 中
  - 示例：`src/test/e2e/sample_product.spec.ts` → `src/test/e2e/sample_product.spec.ts-snapshots/`
- 与 `test-results/` 不同，**不要**将此目录添加到 `.gitignore`
- 若需要有意更新基线，执行以下命令：

```bash
npx playwright test --update-snapshots
```

### 注意事项

- 包含动态内容（当前日期时间、随机 ID 等）的区域，请先用 `page.evaluate()` 遮蔽后再进行比较
- 操作系统或浏览器版本变化时会产生像素差异——需统一 CI 环境与本地环境的基线，或调整 `maxDiffPixelRatio`
```
