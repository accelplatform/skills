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
