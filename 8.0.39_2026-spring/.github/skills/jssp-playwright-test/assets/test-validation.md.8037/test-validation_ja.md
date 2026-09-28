# バリデーションのテスト実例

## 概要

フォーム入力のバリデーションテストパターン。
必須チェック、文字種チェック、文字数チェック、範囲チェック、重複チェック、エラー表示（クラス付与）、リアルタイム解消を含む。

## 必須チェック

```typescript
test('必須項目が空の状態で更新ボタンを押すとバリデーションエラー', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  // 何も入力せずに更新ボタン
  await page.click('#update-button');

  // 各必須フィールドのエラーメッセージが表示される
  const productCodeError = page.locator('.imds-error-text[for="\\:productCode\\:"]');
  await expect(productCodeError).toBeVisible();
  await expect(productCodeError).toHaveText('商品コードは必須です。');

  const productNameError = page.locator('.imds-error-text[for="\\:productName\\:"]');
  await expect(productNameError).toBeVisible();
  await expect(productNameError).toHaveText('商品名は必須です。');

  const unitPriceError = page.locator('.imds-error-text[for="\\:unitPrice\\:"]');
  await expect(unitPriceError).toBeVisible();
  await expect(unitPriceError).toHaveText('単価は必須です。');

  const stockQuantityError = page.locator('.imds-error-text[for="\\:stockQuantity\\:"]');
  await expect(stockQuantityError).toBeVisible();
  await expect(stockQuantityError).toHaveText('在庫数は必須です。');
});
```

## エラー表示（imds-validation-error クラス付与）

```typescript
test('必須項目が空の場合にimds-validation-errorクラスが付与される', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.click('#update-button');

  // 対象フィールドの .imds-field に imds-validation-error クラスが付与される
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

## 文字種チェック

```typescript
test('商品コードに日本語を入力するとバリデーションエラー', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.fill('#\\:productCode\\:', 'テスト');
  await page.fill('#\\:productName\\:', 'テスト商品');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '10');

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:productCode\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('商品コードは半角英数字のみ入力できます。');
});

test('倉庫番号に日本語を入力するとバリデーションエラー', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.fill('#\\:productCode\\:', 'NEWITEM004');
  await page.fill('#\\:productName\\:', 'テスト商品');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '10');
  await page.fill('#\\:warehouseNumber\\:', '倉庫A');

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:warehouseNumber\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('倉庫番号は半角英数字のみ入力できます。');
});
```

## 文字数チェック

maxlength 属性は使用しない方針のため、バリデーションメッセージで検証する。

```typescript
test('商品コードが20文字を超えるとバリデーションエラー', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.fill('#\\:productCode\\:', 'A'.repeat(21));
  await page.fill('#\\:productName\\:', 'テスト商品');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '10');

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:productCode\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('商品コードは20文字以内で入力してください。');
});

test('商品名が100文字を超えるとバリデーションエラー', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.fill('#\\:productCode\\:', 'NEWITEM002');
  await page.fill('#\\:productName\\:', 'あ'.repeat(101));
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '10');

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:productName\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('商品名は100文字以内で入力してください。');
});

test('備考が1000文字を超えるとバリデーションエラー', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.fill('#\\:productCode\\:', 'NEWITEM005');
  await page.fill('#\\:productName\\:', 'テスト商品');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '10');
  await page.fill('#\\:remarks\\:', 'あ'.repeat(1001));

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:remarks\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('備考は1000文字以内で入力してください。');
});
```

## 範囲チェック

```typescript
test('在庫数が範囲外だとバリデーションエラー', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.fill('#\\:productCode\\:', 'NEWITEM001');
  await page.fill('#\\:productName\\:', 'テスト商品');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '1000');

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:stockQuantity\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('在庫数は0から999の範囲で入力してください。');
});

test('単価に負の値を入力するとバリデーションエラー', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.fill('#\\:productCode\\:', 'NEWITEM003');
  await page.fill('#\\:productName\\:', 'テスト商品');
  await page.fill('#\\:unitPrice\\:', '-1');
  await page.fill('#\\:stockQuantity\\:', '10');

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:unitPrice\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('単価は0以上で入力してください。');
});
```

## 重複チェック

```typescript
test('重複する商品コードで登録するとバリデーションエラー', async ({ page }) => {
  await openPage(page);

  // 先頭行の商品コードを取得
  const existingCode = await page.locator('#stock-table-body tr:first-child td:nth-child(2)').textContent();

  await openCreateDialog(page);
  await page.fill('#\\:productCode\\:', existingCode!.trim());
  await page.fill('#\\:productName\\:', '重複テスト');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '10');

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:productCode\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('この商品コードは既に使用されています。');
});
```

## リアルタイムバリデーション（即時エラー解消）

imds フォームでは、バリデーションエラー発生後（`activeValidation = true`）に入力値を修正すると、`input` イベントで即時に再バリデーションが走り、エラーが解消される。
テスト生成時は以下の **全パターン** を必ず含めること。

### 観点一覧

| # | 観点 | 内容 |
|---|------|------|
| 1 | 必須フィールドごとの即時解消 | 各必須フィールドについて、空→値入力でエラーが消えることを個別に検証 |
| 2 | 任意フィールドの即時解消 | 任意フィールド（倉庫番号等）の文字種/文字数エラーが正しい値で消えることを検証 |
| 3 | エラー種別の切り替わり解消 | 文字種エラー・範囲エラー等が正しい値への修正で消えることを検証 |
| 4 | バリデーション発動前の無反応 | 更新ボタン押下前（activeValidation=false）は入力してもエラーが表示されないことを検証 |
| 5 | 複数フィールドの個別解消 | 複数エラーが出た状態で1つずつ修正し、対応するエラーだけが消えることを検証 |
| 6 | imds-validation-error クラスの付与と除去 | `.imds-field` への `imds-validation-error` クラスの付与・除去を検証 |

### 1. 必須フィールドごとの即時解消

各必須フィールドについて個別にテストを作成する。

```typescript
test('商品コードの入力修正でエラーが即時解消される', async ({ page }) => {
  await page.click('#update-button');
  await expect(
    page.locator('.imds-error-text[for="\\:productCode\\:"]')
  ).toContainText('商品コードは必須です。');

  await page.fill('#\\:productCode\\:', 'NEW001');
  await expect(
    page.locator('.imds-error-text[for="\\:productCode\\:"]')
  ).toBeHidden();
});

test('商品名の入力修正でエラーが即時解消される', async ({ page }) => {
  await page.click('#update-button');
  await expect(
    page.locator('.imds-error-text[for="\\:productName\\:"]')
  ).toContainText('商品名は必須です。');

  await page.fill('#\\:productName\\:', 'テスト商品');
  await expect(
    page.locator('.imds-error-text[for="\\:productName\\:"]')
  ).toBeHidden();
});

test('単価の入力修正でエラーが即時解消される', async ({ page }) => {
  await page.click('#update-button');
  await expect(
    page.locator('.imds-error-text[for="\\:unitPrice\\:"]')
  ).toContainText('単価は必須です。');

  await page.fill('#\\:unitPrice\\:', '100');
  await expect(
    page.locator('.imds-error-text[for="\\:unitPrice\\:"]')
  ).toBeHidden();
});

test('在庫数の入力修正でエラーが即時解消される', async ({ page }) => {
  await page.click('#update-button');
  await expect(
    page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')
  ).toContainText('在庫数は必須です。');

  await page.fill('#\\:stockQuantity\\:', '10');
  await expect(
    page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')
  ).toBeHidden();
});
```

### 2. 任意フィールドの即時解消

任意フィールドでも、不正値→正しい値への修正で即時解消されることを検証する。

```typescript
test('倉庫番号の入力修正でエラーが即時解消される', async ({ page }) => {
  // 不正値を入力してエラーを出す
  await page.fill('#\\:productCode\\:', 'NEW001');
  await page.fill('#\\:productName\\:', 'テスト');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '10');
  await page.fill('#\\:warehouseNumber\\:', 'WH-01'); // 記号を含む不正値
  await page.click('#update-button');

  await expect(
    page.locator('.imds-error-text[for="\\:warehouseNumber\\:"]')
  ).toContainText('倉庫番号は半角英数字のみ入力できます。');

  // 正しい値に修正するとエラーが消える
  await page.fill('#\\:warehouseNumber\\:', 'WH01');
  await expect(
    page.locator('.imds-error-text[for="\\:warehouseNumber\\:"]')
  ).toBeHidden();
});
```

### 3. エラー種別の切り替わり解消

文字種エラーや範囲エラーなど、必須以外のバリデーションルールのエラーが正しい値で即時解消されることを検証する。

```typescript
test('商品コードの文字種エラーが正しい値に修正すると即時解消される', async ({ page }) => {
  await page.fill('#\\:productCode\\:', 'PRD-001'); // 記号を含む
  await page.click('#update-button');

  await expect(
    page.locator('.imds-error-text[for="\\:productCode\\:"]')
  ).toContainText('商品コードは半角英数字のみ入力できます。');

  await page.fill('#\\:productCode\\:', 'PRD001NEW');
  await expect(
    page.locator('.imds-error-text[for="\\:productCode\\:"]')
  ).toBeHidden();
});

test('在庫数の範囲エラーが正しい値に修正すると即時解消される', async ({ page }) => {
  await page.fill('#\\:productCode\\:', 'NEW001');
  await page.fill('#\\:productName\\:', 'テスト');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '1000'); // 上限超過
  await page.click('#update-button');

  await expect(
    page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')
  ).toContainText('在庫数は0から999の範囲で入力してください。');

  await page.fill('#\\:stockQuantity\\:', '999');
  await expect(
    page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')
  ).toBeHidden();
});
```

### 4. バリデーション発動前の無反応

更新ボタンを押す前（`activeValidation = false`）の状態では、不正値を入力してもエラーが表示されないことを検証する。

```typescript
test('バリデーション発動前は入力してもエラー表示されない', async ({ page }) => {
  // 更新ボタンを押す前の状態で不正値を入力
  await page.fill('#\\:productCode\\:', 'PRD-001');
  await expect(
    page.locator('.imds-error-text[for="\\:productCode\\:"]')
  ).toBeHidden();

  // 空にしてもエラーは出ない
  await page.fill('#\\:productCode\\:', '');
  await expect(
    page.locator('.imds-error-text[for="\\:productCode\\:"]')
  ).toBeHidden();
});
```

### 5. 複数フィールドの個別解消

複数のバリデーションエラーが同時に表示された状態で、1つずつ入力を修正していくと、対応するフィールドのエラーだけが消え、他のフィールドのエラーは残ることを検証する。

```typescript
test('複数フィールドのエラーが各フィールドの修正で個別に解消される', async ({ page }) => {
  // 全フィールド空で送信 → 全必須エラー
  await page.click('#update-button');
  await expect(page.locator('.imds-error-text[for="\\:productCode\\:"]')).toBeVisible();
  await expect(page.locator('.imds-error-text[for="\\:productName\\:"]')).toBeVisible();
  await expect(page.locator('.imds-error-text[for="\\:unitPrice\\:"]')).toBeVisible();
  await expect(page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')).toBeVisible();

  // 商品コードだけ入力 → 商品コードのエラーのみ消え、他は残る
  await page.fill('#\\:productCode\\:', 'NEW001');
  await expect(page.locator('.imds-error-text[for="\\:productCode\\:"]')).toBeHidden();
  await expect(page.locator('.imds-error-text[for="\\:productName\\:"]')).toBeVisible();
  await expect(page.locator('.imds-error-text[for="\\:unitPrice\\:"]')).toBeVisible();
  await expect(page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')).toBeVisible();

  // 商品名を入力 → 商品名のエラーも消える
  await page.fill('#\\:productName\\:', 'テスト商品');
  await expect(page.locator('.imds-error-text[for="\\:productName\\:"]')).toBeHidden();
  await expect(page.locator('.imds-error-text[for="\\:unitPrice\\:"]')).toBeVisible();

  // 単価を入力
  await page.fill('#\\:unitPrice\\:', '100');
  await expect(page.locator('.imds-error-text[for="\\:unitPrice\\:"]')).toBeHidden();
  await expect(page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')).toBeVisible();

  // 在庫数を入力 → 全エラー解消
  await page.fill('#\\:stockQuantity\\:', '10');
  await expect(page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')).toBeHidden();
});
```

### 6. imds-validation-error クラスの付与と除去

```typescript
test('バリデーションエラー解消で imds-validation-error クラスが除去される', async ({ page }) => {
  await page.click('#update-button');

  const field = page.locator('#edit-dialog .imds-field[for="\\:productCode\\:"]');
  await expect(field).toHaveClass(/imds-validation-error/);

  await page.fill('#\\:productCode\\:', 'ABC123');
  await expect(field).not.toHaveClass(/imds-validation-error/);
});
```
