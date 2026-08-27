# EmptyState

## 基本情報

EmptyState は、ユーザが初めてアプリケーションを開いた際に、コンテンツが存在しない場合に表示する部品です。
現在の状態の簡潔な説明と、次の行動を促すメッセージやボタンを配置する。

**設計原則（DESIGN.md）**: EmptyState は中立のプレースホルダーであり、severity 色（error/success/warning/info）は使用しない。アイコンは `is-gray-light` の中立トーンで表示する。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-emptystate--documentation
- 基本クラス: imds-empty-state

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-empty-state-container | div 要素 | EmptyState 全体のコンテナ | 必須 |
| imds-empty-state | div 要素 | EmptyState 本体（サイズ・整列クラスを付与） | 必須 |
| imds-empty-state-message-wrapper | div 要素 | アイコン + メッセージのラッパー | 必須 |
| imds-empty-state-icon | span 要素 | アイコンのラッパー | オプション（省略可） |
| imds-empty-state-message | div 要素 | メッセージ（タイトル + 詳細）のラッパー | 必須 |
| imds-empty-state-message-title | p 要素 | 状態の簡潔な説明（タイトル） | 必須 |
| imds-empty-state-message-content | p 要素 | 次の行動を促す詳細メッセージ | オプション（is-x-small/is-small では使用不可） |
| imds-empty-state-content | div 要素 | アクションボタンのラッパー | オプション（is-x-small/is-small では使用不可） |
| is-x-small | imds-empty-state | 極小サイズ（Popover 等の狭いエリア用） | オプション |
| is-small | imds-empty-state | 小サイズ（Table や右ペイン等の狭いエリア用） | オプション |
| is-medium | imds-empty-state | 中サイズ（Dialog 等の比較的広いエリア用） | オプション |
| is-large | imds-empty-state | 大サイズ（デフォルト。ウィンドウ・ページ全体用） | オプション |
| is-vertical | imds-empty-state | 要素を垂直方向に整列 | オプション |
| is-horizontal | imds-empty-state | 要素を水平方向に整列 | オプション |

## HTML スニペット

### 基本形（is-large 相当）

```html
<div class="imds-empty-state-container">
  <div class="imds-empty-state">
    <div class="imds-empty-state-message-wrapper">
      <span class="imds-empty-state-icon">
        <span class="imds-icon is-gray-light"><i class="fa-solid fa-circle-info"></i></span>
      </span>
      <div class="imds-empty-state-message">
        <p class="imds-empty-state-message-title">アプリケーションが作成されていません</p>
        <p class="imds-empty-state-message-content">新規作成ボタンからアプリケーションを作成してください。</p>
      </div>
    </div>
    <div class="imds-empty-state-content imds-mt-7">
      <button type="button" class="imds-button is-large is-primary">
        アプリケーションを新規作成
      </button>
    </div>
  </div>
</div>
```

以降は基本形からの差分のみを示す。

## バリエーション

### アイコン

基本的には「info」アイコン（`fa-circle-info`）を `is-gray-light` トーンで使用する。他に使用できるアイコンについては icon-font（imds-html-icon-font.md）を参照すること。severity 色（`is-danger`・`is-warning`・`is-success` 等）はアイコンに付与しない。

### size（サイズ）

`imds-empty-state` にサイズクラスを付与する。通常は `is-large`（デフォルト）を使用し、利用箇所に応じて選択する。

```html
<div class="imds-empty-state-container">
  <div class="imds-empty-state is-x-small">   <!-- 極小: Popover などの狭いエリア -->
    <div class="imds-empty-state-message-wrapper">
      <span class="imds-empty-state-icon">
        <span class="imds-icon is-gray-light"><i class="fa-solid fa-circle-info"></i></span>
      </span>
      <div class="imds-empty-state-message"><p class="imds-empty-state-message-title">処理は設定されていません。</p></div>
    </div>
  </div>
</div>
```

```html
<div class="imds-empty-state-container">
  <div class="imds-empty-state is-small">     <!-- 小: Table や右ペインなどの狭いエリア -->
    <div class="imds-empty-state-message-wrapper">
      <span class="imds-empty-state-icon">
        <span class="imds-icon is-gray-light"><i class="fa-solid fa-circle-info"></i></span>
      </span>
      <div class="imds-empty-state-message"><p class="imds-empty-state-message-title">エンティティ項目が存在しません。「エンティティ項目編集」ボタンから追加してください。</p></div>
    </div>
  </div>
</div>
```

`is-x-small` / `is-small` では `imds-empty-state-message-content`（詳細メッセージ）と `imds-empty-state-content`（アクションボタン）は使用不可。タイトルのみを表示する。

```html
<div class="imds-empty-state-container">
  <div class="imds-empty-state is-medium">    <!-- 中: Dialog などの比較的広いエリア -->
    <div class="imds-empty-state-message-wrapper">
      <span class="imds-empty-state-icon">
        <span class="imds-icon is-gray-light"><i class="fa-solid fa-circle-info"></i></span>
      </span>
      <div class="imds-empty-state-message">
        <p class="imds-empty-state-message-title">このエンティティを参照先としているエンティティはありません。</p>
      </div>
    </div>
  </div>
</div>
```

`is-medium` / `is-large` は必要に応じてメッセージ・アクションボタンを表示できる。

### Table 内に配置する場合（is-small）

```html
<div class="imds-table is-bordered is-area-bordered">
  <div class="imds-table-inner">
    <table>
      <thead>
        <tr>
          <th><span>主キー</span></th>
          <th><span>必須</span></th>
          <th><span>ID</span></th>
          <th><span>エンティティ項目</span></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="4">
            <div class="imds-empty-state-container">
              <div class="imds-empty-state is-small">
                <div class="imds-empty-state-message-wrapper">
                  <span class="imds-empty-state-icon">
                    <span class="imds-icon is-gray-light"><i class="fa-solid fa-circle-info"></i></span>
                  </span>
                  <div class="imds-empty-state-message"><p class="imds-empty-state-message-title">エンティティ項目が存在しません。「エンティティ項目編集」ボタンから追加してください。</p></div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### alignment（整列）

```html
<div class="imds-empty-state is-vertical">    <!-- 垂直整列 -->
<div class="imds-empty-state is-horizontal">  <!-- 水平整列 -->
```

### アイコンなし

`imds-empty-state-icon` を省略する。

```html
<div class="imds-empty-state-container">
  <div class="imds-empty-state">
    <div class="imds-empty-state-message-wrapper">
      <div class="imds-empty-state-message">
        <p class="imds-empty-state-message-title">アプリケーションが作成されていません</p>
        <p class="imds-empty-state-message-content">新規作成ボタンからアプリケーションを作成してください。</p>
      </div>
    </div>
    <div class="imds-empty-state-content imds-mt-7">
      <button type="button" class="imds-button is-large is-primary">
        アプリケーションを新規作成
      </button>
    </div>
  </div>
</div>
```

## レスポンシブ対応

EmptyState は親要素（コンテナ要素）の横幅に合わせてアイコンの表示位置が自動制御される。

- `is-medium` / `is-large`: コンテナ幅が 768px を下回ると自動的に垂直方向に整列する。
- `is-x-small` / `is-small`: コンテナ幅が 520px を下回ると自動的に垂直方向に整列する。ただし Table 内に配置した場合はコンテナ幅に関わらず常にアイコンとタイトルが横並び・左寄せで表示される。

## 実装上の注意

- **severity 色は使わない**（DESIGN.md「empty-state: 中立のプレースホルダー」）。アイコンは常に `is-gray-light` の中立トーンとし、`is-danger` 等のステータス色クラスを付与してはならない。空状態を表す文脈であっても error/warning とは無関係な中立表現に留める。
- アイコンは基本的に「info」（`fa-circle-info`）を使用する。
- メッセージ（タイトル）は状態を簡潔に記載し、詳細メッセージ（`imds-empty-state-message-content`）で次の行動を促す。
- ユーザが次に行うべき行動が明確な場合は、`imds-empty-state-content` 内にアクションボタン（`imds-button is-large is-primary` 等）を配置する。
- `is-x-small` / `is-small` サイズでは詳細メッセージとアクションボタンは使用できない（タイトルのみ）。
- 通常は `is-large`（デフォルト）を使用し、利用箇所の広さに応じて `is-x-small`〜`is-large` を選択する。
