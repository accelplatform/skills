# ボタンスタイルのテスト実例

## 概要

ボタンの CSS クラス（`is-primary` / `is-danger`）および確認ダイアログの表示モードを検証するテストパターン。
操作の重要度に応じて適切なスタイルが適用されていることを確認する。

## ボタンスタイルの検証

```typescript
test.describe('ボタン・操作のスタイル', () => {
  test('新規作成ボタンにis-primaryクラスが指定されている', async ({ page }) => {
    await openPage(page);

    await expect(page.locator('#create-button')).toHaveClass(/is-primary/);
  });

  test('更新ボタンにis-primaryクラスが指定されている', async ({ page }) => {
    await openPage(page);
    await openCreateDialog(page);

    await expect(page.locator('#update-button')).toHaveClass(/is-primary/);
  });

  test('削除ボタンにis-dangerクラスが指定されている', async ({ page }) => {
    await openPage(page);
    await openEditDialog(page);

    await expect(page.locator('#delete-button')).toHaveClass(/is-danger/);
  });

  test('削除の確認ダイアログのOKボタンにis-dangerクラスが指定されている', async ({ page }) => {
    await openPage(page);
    await openEditDialog(page);

    await page.click('#delete-button');

    const okButton = page.locator('.imds-confirm-ok-button');
    await expect(okButton).toHaveClass(/is-danger/);
  });
});
```

## スタイル検証の判断基準

imdsConfirm の第5引数 `options.mode` に応じて、確認ダイアログの OK ボタンのスタイルが変わる。

| 操作の種類 | ボタンクラス | imdsConfirm の mode | 例 |
|-----------|------------|--------------------|----|
| 主要操作（登録・更新・検索） | `is-primary` | `info`（デフォルト） | 新規作成、更新 |
| 警告操作（UNDO 不可の更新） | `is-primary` | `warning` | 一括更新 |
| 危険操作（削除） | `is-danger` | `danger` | データ削除 |
