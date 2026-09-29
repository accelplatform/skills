# 按钮样式测试示例

## 概述

验证按钮 CSS 类（`is-primary` / `is-danger`）和确认对话框显示模式的测试模式。
确认根据操作的重要程度应用了适当的样式。

## 按钮样式验证

```typescript
test.describe('按钮和操作样式', () => {
  test('新建按钮指定了 is-primary 类', async ({ page }) => {
    await openPage(page);

    await expect(page.locator('#create-button')).toHaveClass(/is-primary/);
  });

  test('更新按钮指定了 is-primary 类', async ({ page }) => {
    await openPage(page);
    await openCreateDialog(page);

    await expect(page.locator('#update-button')).toHaveClass(/is-primary/);
  });

  test('删除按钮指定了 is-danger 类', async ({ page }) => {
    await openPage(page);
    await openEditDialog(page);

    await expect(page.locator('#delete-button')).toHaveClass(/is-danger/);
  });

  test('删除确认对话框的 OK 按钮指定了 is-danger 类', async ({ page }) => {
    await openPage(page);
    await openEditDialog(page);

    await page.click('#delete-button');

    const okButton = page.locator('.imds-confirm-ok-button');
    await expect(okButton).toHaveClass(/is-danger/);
  });
});
```

## 样式验证判断标准

确认对话框的 OK 按钮样式根据 imdsConfirm 的第5个参数 `options.mode` 而变化。

| 操作类型 | 按钮类 | imdsConfirm 的 mode | 示例 |
|---------|--------|---------------------|------|
| 主要操作（注册・更新・搜索） | `is-primary` | `info`（默认） | 新建、更新 |
| 警告操作（不可撤销的更新） | `is-primary` | `warning` | 批量更新 |
| 危险操作（删除） | `is-danger` | `danger` | 数据删除 |
