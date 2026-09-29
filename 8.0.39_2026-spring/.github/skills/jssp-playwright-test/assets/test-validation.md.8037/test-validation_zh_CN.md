# 验证测试示例

## 概述

表单输入验证测试模式。
包含必填检查、字符类型检查、字符数检查、范围检查、重复检查、错误显示（类添加）以及实时消除。

## 必填检查

```typescript
test('必填项为空时点击更新按钮出现验证错误', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  // 不输入任何内容直接点击更新按钮
  await page.click('#update-button');

  // 各必填字段的错误消息显示
  const productCodeError = page.locator('.imds-error-text[for="\\:productCode\\:"]');
  await expect(productCodeError).toBeVisible();
  await expect(productCodeError).toHaveText('商品编码为必填项。');

  const productNameError = page.locator('.imds-error-text[for="\\:productName\\:"]');
  await expect(productNameError).toBeVisible();
  await expect(productNameError).toHaveText('商品名称为必填项。');

  const unitPriceError = page.locator('.imds-error-text[for="\\:unitPrice\\:"]');
  await expect(unitPriceError).toBeVisible();
  await expect(unitPriceError).toHaveText('单价为必填项。');

  const stockQuantityError = page.locator('.imds-error-text[for="\\:stockQuantity\\:"]');
  await expect(stockQuantityError).toBeVisible();
  await expect(stockQuantityError).toHaveText('库存数量为必填项。');
});
```

## 错误显示（添加 imds-validation-error 类）

```typescript
test('必填项为空时添加 imds-validation-error 类', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.click('#update-button');

  // 对目标字段的 .imds-field 添加 imds-validation-error 类
  const productCodeField = page.locator('#edit-dialog .imds-field[for="\\:productCode\\:"]');
  await expect(productCodeField).toHaveClass(/imds-validation-error/);

  const productNameField = page.locator('#edit-dialog .imds-field[for="\\:productName\\:"]');
  await expect(productNameField).toHaveClass(/imds-validation-error/);

  const unitPriceField = page.locator('#edit-dialog .imds-field[for="\\:unitPrice\\:"]');
  await expect(unitPriceField).toHaveClass(/imds-validation-error/);

  const stockQuantityField = page.locator('#edit-dialog .imds-field[for="\\:stockQuantity\\:"]');
  await expect(stockQuantityField).toHaveClass(/imds-validation-error/);
});
```

## 字符类型检查

```typescript
test('商品编码输入日语时出现验证错误', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.fill('#\\:productCode\\:', 'テスト');
  await page.fill('#\\:productName\\:', '测试商品');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '10');

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:productCode\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('商品编码只能输入半角英数字。');
});

test('仓库编号输入日语时出现验证错误', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.fill('#\\:productCode\\:', 'NEWITEM004');
  await page.fill('#\\:productName\\:', '测试商品');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '10');
  await page.fill('#\\:warehouseNumber\\:', '倉庫A');

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:warehouseNumber\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('仓库编号只能输入半角英数字。');
});
```

## 字符数检查

方针是不使用 maxlength 属性，通过验证消息进行验证。

```typescript
test('商品编码超过 20 个字符时出现验证错误', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.fill('#\\:productCode\\:', 'A'.repeat(21));
  await page.fill('#\\:productName\\:', '测试商品');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '10');

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:productCode\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('商品编码请在 20 个字符以内输入。');
});

test('商品名称超过 100 个字符时出现验证错误', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.fill('#\\:productCode\\:', 'NEWITEM002');
  await page.fill('#\\:productName\\:', 'あ'.repeat(101));
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '10');

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:productName\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('商品名称请在 100 个字符以内输入。');
});

test('备注超过 1000 个字符时出现验证错误', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.fill('#\\:productCode\\:', 'NEWITEM005');
  await page.fill('#\\:productName\\:', '测试商品');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '10');
  await page.fill('#\\:remarks\\:', 'あ'.repeat(1001));

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:remarks\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('备注请在 1000 个字符以内输入。');
});
```

## 范围检查

```typescript
test('库存数量超出范围时出现验证错误', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.fill('#\\:productCode\\:', 'NEWITEM001');
  await page.fill('#\\:productName\\:', '测试商品');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '1000');

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:stockQuantity\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('库存数量请在 0 到 999 的范围内输入。');
});

test('单价输入负值时出现验证错误', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.fill('#\\:productCode\\:', 'NEWITEM003');
  await page.fill('#\\:productName\\:', '测试商品');
  await page.fill('#\\:unitPrice\\:', '-1');
  await page.fill('#\\:stockQuantity\\:', '10');

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:unitPrice\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('单价请输入 0 以上的值。');
});
```

## 重复检查

```typescript
test('使用重复的商品编码注册时出现验证错误', async ({ page }) => {
  await openPage(page);

  // 获取第一行的商品编码
  const existingCode = await page.locator('#stock-table-body tr:first-child td:nth-child(2)').textContent();

  await openCreateDialog(page);
  await page.fill('#\\:productCode\\:', existingCode!.trim());
  await page.fill('#\\:productName\\:', '重复测试');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '10');

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:productCode\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('此商品编码已被使用。');
});
```

## 实时验证（即时错误消除）

在 imds 表单中，验证错误发生后（`activeValidation = true`），修正输入值时，`input` 事件会立即触发重新验证，错误得到消除。
生成测试时必须包含以下**全部模式**。

### 验证点列表

| # | 验证点 | 内容 |
|---|--------|------|
| 1 | 各必填字段的即时消除 | 针对各必填字段，分别验证从空到输入值后错误消失 |
| 2 | 可选字段的即时消除 | 验证可选字段（仓库编号等）的字符类型/字符数错误在输入正确值后消失 |
| 3 | 错误类型切换消除 | 验证字符类型错误、范围错误等在修正为正确值后消失 |
| 4 | 验证激活前无反应 | 验证在点击更新按钮前（activeValidation=false）输入时不显示错误 |
| 5 | 多个字段的分别消除 | 验证出现多个错误时逐一修正，只有对应的错误消失 |
| 6 | imds-validation-error 类的添加与删除 | 验证对 `.imds-field` 的 `imds-validation-error` 类的添加与删除 |

### 1. 各必填字段的即时消除

针对各必填字段分别创建测试。

```typescript
test('修正商品编码输入时错误即时消除', async ({ page }) => {
  await page.click('#update-button');
  await expect(
    page.locator('.imds-error-text[for="\\:productCode\\:"]')
  ).toContainText('商品编码为必填项。');

  await page.fill('#\\:productCode\\:', 'NEW001');
  await expect(
    page.locator('.imds-error-text[for="\\:productCode\\:"]')
  ).toBeHidden();
});

test('修正商品名称输入时错误即时消除', async ({ page }) => {
  await page.click('#update-button');
  await expect(
    page.locator('.imds-error-text[for="\\:productName\\:"]')
  ).toContainText('商品名称为必填项。');

  await page.fill('#\\:productName\\:', '测试商品');
  await expect(
    page.locator('.imds-error-text[for="\\:productName\\:"]')
  ).toBeHidden();
});

test('修正单价输入时错误即时消除', async ({ page }) => {
  await page.click('#update-button');
  await expect(
    page.locator('.imds-error-text[for="\\:unitPrice\\:"]')
  ).toContainText('单价为必填项。');

  await page.fill('#\\:unitPrice\\:', '100');
  await expect(
    page.locator('.imds-error-text[for="\\:unitPrice\\:"]')
  ).toBeHidden();
});

test('修正库存数量输入时错误即时消除', async ({ page }) => {
  await page.click('#update-button');
  await expect(
    page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')
  ).toContainText('库存数量为必填项。');

  await page.fill('#\\:stockQuantity\\:', '10');
  await expect(
    page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')
  ).toBeHidden();
});
```

### 2. 可选字段的即时消除

验证即使是可选字段，从无效值修正为正确值时也会即时消除错误。

```typescript
test('修正仓库编号输入时错误即时消除', async ({ page }) => {
  // 输入无效值触发错误
  await page.fill('#\\:productCode\\:', 'NEW001');
  await page.fill('#\\:productName\\:', '测试');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '10');
  await page.fill('#\\:warehouseNumber\\:', 'WH-01'); // 包含符号的无效值
  await page.click('#update-button');

  await expect(
    page.locator('.imds-error-text[for="\\:warehouseNumber\\:"]')
  ).toContainText('仓库编号只能输入半角英数字。');

  // 修正为正确值后错误消失
  await page.fill('#\\:warehouseNumber\\:', 'WH01');
  await expect(
    page.locator('.imds-error-text[for="\\:warehouseNumber\\:"]')
  ).toBeHidden();
});
```

### 3. 错误类型切换消除

验证字符类型错误、范围错误等必填以外的验证规则错误在修正为正确值后即时消除。

```typescript
test('商品编码的字符类型错误在修正为正确值时即时消除', async ({ page }) => {
  await page.fill('#\\:productCode\\:', 'PRD-001'); // 包含符号
  await page.click('#update-button');

  await expect(
    page.locator('.imds-error-text[for="\\:productCode\\:"]')
  ).toContainText('商品编码只能输入半角英数字。');

  await page.fill('#\\:productCode\\:', 'PRD001NEW');
  await expect(
    page.locator('.imds-error-text[for="\\:productCode\\:"]')
  ).toBeHidden();
});

test('库存数量的范围错误在修正为正确值时即时消除', async ({ page }) => {
  await page.fill('#\\:productCode\\:', 'NEW001');
  await page.fill('#\\:productName\\:', '测试');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '1000'); // 超过上限
  await page.click('#update-button');

  await expect(
    page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')
  ).toContainText('库存数量请在 0 到 999 的范围内输入。');

  await page.fill('#\\:stockQuantity\\:', '999');
  await expect(
    page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')
  ).toBeHidden();
});
```

### 4. 验证激活前无反应

验证在点击更新按钮前（`activeValidation = false`）输入无效值时不显示错误。

```typescript
test('验证激活前输入时不显示错误', async ({ page }) => {
  // 在点击更新按钮前的状态下输入无效值
  await page.fill('#\\:productCode\\:', 'PRD-001');
  await expect(
    page.locator('.imds-error-text[for="\\:productCode\\:"]')
  ).toBeHidden();

  // 清空也不出现错误
  await page.fill('#\\:productCode\\:', '');
  await expect(
    page.locator('.imds-error-text[for="\\:productCode\\:"]')
  ).toBeHidden();
});
```

### 5. 多个字段的分别消除

验证多个验证错误同时显示的状态下，逐一修正输入时，只有对应字段的错误消失，其他字段的错误仍然存在。

```typescript
test('多个字段的错误通过各字段的修正分别消除', async ({ page }) => {
  // 所有字段为空提交 → 全部必填错误
  await page.click('#update-button');
  await expect(page.locator('.imds-error-text[for="\\:productCode\\:"]')).toBeVisible();
  await expect(page.locator('.imds-error-text[for="\\:productName\\:"]')).toBeVisible();
  await expect(page.locator('.imds-error-text[for="\\:unitPrice\\:"]')).toBeVisible();
  await expect(page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')).toBeVisible();

  // 只输入商品编码 → 只有商品编码的错误消失，其他仍存在
  await page.fill('#\\:productCode\\:', 'NEW001');
  await expect(page.locator('.imds-error-text[for="\\:productCode\\:"]')).toBeHidden();
  await expect(page.locator('.imds-error-text[for="\\:productName\\:"]')).toBeVisible();
  await expect(page.locator('.imds-error-text[for="\\:unitPrice\\:"]')).toBeVisible();
  await expect(page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')).toBeVisible();

  // 输入商品名称 → 商品名称的错误也消失
  await page.fill('#\\:productName\\:', '测试商品');
  await expect(page.locator('.imds-error-text[for="\\:productName\\:"]')).toBeHidden();
  await expect(page.locator('.imds-error-text[for="\\:unitPrice\\:"]')).toBeVisible();

  // 输入单价
  await page.fill('#\\:unitPrice\\:', '100');
  await expect(page.locator('.imds-error-text[for="\\:unitPrice\\:"]')).toBeHidden();
  await expect(page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')).toBeVisible();

  // 输入库存数量 → 全部错误消除
  await page.fill('#\\:stockQuantity\\:', '10');
  await expect(page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')).toBeHidden();
});
```

### 6. imds-validation-error 类的添加与删除

```typescript
test('验证错误消除时 imds-validation-error 类被删除', async ({ page }) => {
  await page.click('#update-button');

  const field = page.locator('#edit-dialog .imds-field[for="\\:productCode\\:"]');
  await expect(field).toHaveClass(/imds-validation-error/);

  await page.fill('#\\:productCode\\:', 'ABC123');
  await expect(field).not.toHaveClass(/imds-validation-error/);
});
```
