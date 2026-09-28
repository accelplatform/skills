# Divider

## 基本情報

Divider は、コンテンツを水平あるいは垂直方向に区切ることで視覚的にグループ化するための部品です。
レイアウトや余白の調整だけではまとまりの区別が不十分な際に使用します。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-divider--documentation
- 基本クラス: imds-divider

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-divider | hr 要素（水平）/ div 要素（垂直） | 区切り線 | 必須 |
| is-horizontal | imds-divider | 水平方向の区切り線 | オプション |
| is-vertical | imds-divider | 垂直方向の区切り線 | オプション |
| is-small | imds-divider | 小サイズ（余白が小さい） | オプション |
| is-normal | imds-divider | 標準サイズ | オプション |
| is-large | imds-divider | 大サイズ（余白が大きい） | オプション |

## HTML スニペット

### 基本区切り線（水平）

```html
<div style="height: 4em; display: grid;"><hr class="imds-divider" /></div>
```

以降は基本区切り線からの差分のみを示す。

## バリエーション

### alignment（方向）

```html
<hr class="imds-divider is-horizontal">                                          <!-- 水平: hr 要素 -->
<div style="display: flex; height: 3rem"><div class="imds-divider is-vertical"></div></div>  <!-- 垂直: div 要素 -->
```

### size（サイズ）

```html
<hr class="imds-divider is-small">    <!-- 小 -->
<hr class="imds-divider is-normal">   <!-- 標準 -->
<hr class="imds-divider is-large">    <!-- 大 -->
```

### ナビゲーションエリア内のグループ化（垂直区切りの使用例）

ヘッダーなどのナビゲーションエリア内のアイテムをグループ化する場合に使用する。

```html
<div class="imds-header-actions">
  <button type="button" class="imds-button is-ghost is-normal">
    <span class="imds-icon"><i class="fa-solid fa-bell"></i></span>
  </button>
  <button type="button" class="imds-button is-ghost is-normal">
    <span class="imds-icon"><i class="fa-solid fa-comment"></i></span>
  </button>
  <div class="imds-divider is-vertical"></div>
  <button type="button" class="imds-button is-ghost is-normal">
    <span class="imds-icon"><i class="fa-solid fa-question-circle"></i></span>
  </button>
</div>
```

### メニュー内区切り（水平・小サイズ）

ポップオーバーメニュー等、リスト項目間の区切りには `hr.imds-divider.is-small` を使用する。

```html
<ul style="white-space: nowrap">
  <li><span>ユーザ設定</span></li>
  <li><span>アプリケーション設定</span></li>
  <hr class="imds-divider is-small" />
  <li><span>ログアウト</span></li>
</ul>
```

## 実装上の注意

- **水平方向（`is-horizontal` / 未指定時のデフォルト）は `hr` 要素を使用する**。`hr.imds-divider` が実DOMでの標準パターンである。
- **垂直方向（`is-vertical`）は `div` 要素を使用する**。`hr` に垂直方向の意味は無いため、垂直区切りには必ず `div` を用いる。
- 垂直方向の場合、親要素に高さと `display: grid` または `display: flex` を指定する必要がある
