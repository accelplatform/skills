# インポート画面の実装例

imds テーマのコンポーネントを組み合わせた、業務インポート画面の実装例。
「アシスタント定義」画面を題材に、ヘッダ・ステッパー・ファイル選択・内容確認・インポート結果の構成パターンを示す。

本ページはヘッダを固定表示し、ステッパーの各ステップ内容のみを縦スクロールさせる。固定クラス名 `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` / `pgstyle-layout-footer` を用いたレイアウト制御パターンを使用する（`height: 100%` ベースのため `<imart type="head">` での `theme-conditional-layout.css` の読み込みが必須。詳細は「実装上の注意」を参照）。機能ごとに異なるプレースホルダー prefix を使う旧方式の解説は [imds-common-fixed-header-layout.md](../reference/imds-common-fixed-header-layout.md) を参照。

## 使用コンポーネント一覧

| コンポーネント | reference | 本例での用途 |
|---------------|-----------|-------------|
| Header | [imds-html-header.md](../reference/imds-html-header.md) | 関連画面メニュー付きページヘッダ |
| Stepper | [imds-html-stepper.md](../reference/imds-html-stepper.md) | インポート工程の進捗表示（3 ステップ） |
| Message | [imds-html-message.md](../reference/imds-html-message.md) | インポート条件の補足説明 |
| FileUpload | [imds-html-file-upload.md](../reference/imds-html-file-upload.md) | ファイルアップロード + アップロード後の一覧表示 |
| CollapseMessage | [imds-html-collapse-message.md](../reference/imds-html-collapse-message.md) | ステータス補足・注意事項の折りたたみ表示 |
| Table | [imds-html-table.md](../reference/imds-html-table.md) | インポート内容確認テーブル・結果サマリテーブル |
| Checkbox | [imds-html-checkbox.md](../reference/imds-html-checkbox.md) | 「失敗のみ表示」フィルタ |
| Button | [imds-html-button.md](../reference/imds-html-button.md) | 各ステップの実行・戻るボタン |

## 全体構成

`imds-container` に `pgstyle-layout-container`（2 行グリッド）、`<main>` に `pgstyle-layout-main`（縦 flex）、ステップ内容のスクロール領域に `pgstyle-layout-content`（`flex:1 0 0; overflow:auto`）、固定フッタに `pgstyle-layout-footer`（`flex:0 0 auto`）を付与する。

```
div.imds-container.pgstyle-layout-container    ... ルート div（intra-mart テーマの imui-container の内側に配置されるため id は付与しない、中間ラッパーも挟まない）
├── header.imds-header               ... ページヘッダ（関連画面メニュー・タイトル。固定表示）
└── main.pgstyle-layout-main（縦 flex コンテナ）
    ├── div.imds-stepper              ... 進捗ステッパー（3 ステップ。固定表示、flex:0 0 auto）
    └── section.pgstyle-layout-content（ステップごとに切替。imds-scrollbar 付与、flex:1 0 0; overflow:auto）
        ├── ステップ1: ファイルを選択
        │   ├── imds-message         ... 補足メッセージ（対応形式等）
        │   ├── imds-file-upload      ... ファイルアップロード領域
        │   ├── imds-file-upload-list ... アップロード済みファイル一覧
        │   └── button                ... 内容の確認へ
        ├── ステップ2: 内容の確認
        │   ├── imds-collapse-message × N ... ステータス補足・注意事項
        │   ├── imds-table            ... インポート内容一覧（ステータス列あり）
        │   └── div.pgstyle-layout-footer（main 直下・スクロール領域の外、flex:0 0 auto） ... 戻る・インポート実行
        └── ステップ3: インポート結果
            ├── sample-import-result-container ... 結果アイコン + メッセージ + 操作ボタン
            └── imds-table            ... 結果サマリテーブル
```

```html
<div class="imds-container pgstyle-layout-container">
  <header class="imds-header">…</header>
  <main class="pgstyle-layout-main">
    <div class="imds-stepper">…</div>
    <section class="imds-py-4 imds-px-6 pgstyle-layout-content imds-scrollbar">
      <!-- ステップごとの内容（下記 3〜5 参照） -->
    </section>
  </main>
</div>
```

## 1. ページヘッダ

エクスポート画面と対になることが多く、同様に `imds-header-nav`（Popover 併用）パターンを基本とする。

```html
<header class="imds-header">
  <div class="imds-popover is-left imds-header-nav">
    <button
      type="button"
      class="imds-button is-ghost is-large"
      aria-haspopup="true"
      aria-controls="imds-popover-nav">
      <span class="imds-icon is-medium is-primary"><i class="imds-iconfont imds-application"></i></span>
      <span class="imds-icon is-x-small is-primary"><i class="fa-solid fa-caret-down"></i></span>
    </button>
    <div id="imds-popover-nav" role="menu" class="imds-popover-menu">
      <div class="imds-popover-content">
        <nav class="imds-menu">
          <ul class="imds-menu-list">
            <li><a href="#"><span>アシスタント定義一覧</span></a></li>
            <li><a href="#"><span>アシスタント定義エクスポート</span></a></li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
  <div class="imds-header-title">
    <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
    <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
  </div>
</header>
```

**ポイント:**
- ヘッダには `imds-header-icon` / `imds-header-back-button` / `imds-header-nav` のいずれか 1 つを必ず配置する
- `imds-header-actions` にインポート実行ボタンは置かない（業務操作ボタンをヘッダに置かない原則はインポート画面にも適用される）

## 2. ステッパー

インポート画面は「ファイルを選択」→「内容の確認」→「インポート結果」の 3 ステップで構成する。

```html
<div class="imds-stepper">
  <ul>
    <li class="imds-stepper-step is-active">
      <button disabled><span>1.ファイルを選択</span></button>
    </li>
    <li class="imds-stepper-step">
      <button disabled><span>2.内容の確認</span></button>
    </li>
    <li class="imds-stepper-step">
      <button disabled><span>3.インポート結果</span></button>
    </li>
  </ul>
</div>
```

## 3. ステップ1: ファイルを選択

補足メッセージ + ファイルアップロード領域 + アップロード後のファイル一覧で構成する。

```html
<section class="imds-py-4 imds-px-6 pgstyle-layout-content imds-scrollbar">
  <div class="imds-message is-outlined is-info imds-mb-4">
    <div class="imds-message-title">
      <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
      <p>ファイルを選択</p>
    </div>
    <div class="imds-message-content">
      <p>アシスタント定義のエクスポートデータをインポートします。</p>
      <p>ファイルを選択して、内容の確認へボタンをクリックしてください。</p>
      <p>インポートできるファイル形式は、zip のみです。</p>
    </div>
  </div>
  <div class="imds-file-upload">
    <div class="imds-file-upload-drop-area">
      <input type="file" accept=".zip">
      <span class="imds-icon"><i class="fa-solid fa-file-arrow-up"></i></span>
      <p class="imds-file-upload-message">ここにファイルをドラッグ＆ドロップしてください</p>
      <p class="imds-file-upload-text">または</p>
      <button type="button" class="imds-button is-outlined is-small is-primary">ファイルを選択</button>
    </div>
  </div>
  <!-- アップロード完了後にJSで挿入するファイル一覧 -->
  <div class="imds-file-upload-list" id="uploaded-file-list">
    <table>
      <tbody>
        <tr>
          <td>
            <span>
              <span class="imds-icon is-gray-light imds-file-upload-file-icon"><i class="fa-regular fa-file"></i></span>
              <span class="imds-file-upload-name">assistant-definitions.zip</span>
            </span>
          </td>
          <td class="imds-file-upload-date"><span>2026/07/24 10:00</span></td>
          <td class="imds-file-upload-size"><span>1.2MB</span></td>
          <td>
            <button type="button" class="imds-button is-ghost" title="削除">
              <span class="imds-icon"><i class="fa-regular fa-circle-xmark"></i></span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <button type="button" id="to-confirm-button" class="imds-button is-primary imds-mt-7" style="min-width: 8em;" disabled>
    内容の確認へ
  </button>
</section>
```

**ポイント:**
- 「内容の確認へ」ボタンは、ファイルのアップロードが完了するまで `disabled` にする
- ファイルアップロードのみのステップでコンテンツ量が少ないため、ボタンは固定フッタにせずコンテンツの直下に配置する（[imds-html-stepper.md](../reference/imds-html-stepper.md)「実装上の注意」の例外に該当）
- ファイル一覧（`imds-file-upload-list`）はアップロード完了後に JavaScript で挿入する。各行にファイルアイコン・ファイル名・アップロード日時・サイズ・削除ボタンを配置する
- 削除ボタン押下でファイルを取り消した場合、一覧が空になれば「内容の確認へ」ボタンを再度 `disabled` に戻す

## 4. ステップ2: 内容の確認

アップロードしたファイルの内容をステータス別（新規・更新・削除・変更なし）に確認できる一覧を表示する。

```html
<section class="imds-py-4 imds-px-6 pgstyle-layout-content imds-scrollbar">
  <div class="imds-collapse-message is-outlined is-small is-info imds-mb-3">
    <input type="checkbox" id="status-note-toggle">
    <label for="status-note-toggle">
      <div class="imds-message-title">
        <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
        <p>ステータスの補足説明</p>
      </div>
      <span class="imds-icon imds-collapse-message-chevron"><i class="fa-solid fa-chevron-down"></i></span>
    </label>
    <div class="imds-message-content">
      <p>下記のステータスは特殊なケースに該当しますので、詳細はテーブルをご確認ください。</p>
      <div class="imds-table is-bordered is-area-bordered is-narrow">
        <div class="imds-table-inner">
          <table>
            <thead>
              <tr>
                <th><span>ステータス</span></th>
                <th><span>説明</span></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="is-warning">
                  <span>更新</span>
                  <span class="imds-icon imds-ml-2 is-warning"><i class="fa-solid fa-warning"></i></span>
                </td>
                <td><span>既存データが更新されます。</span></td>
              </tr>
              <tr>
                <td class="is-danger">
                  <span>削除</span>
                  <span class="imds-icon imds-ml-2 is-danger"><i class="fa-solid fa-triangle-exclamation"></i></span>
                </td>
                <td><span>既存データが削除されます。</span></td>
              </tr>
              <tr>
                <td><span>変更なし</span></td>
                <td><span>既存データとインポート内容が同一です。更新日時のみ更新されます。</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  <div class="imds-table is-area-bordered is-sticky is-narrow is-hoverable" style="max-height: 400px;">
    <div class="imds-table-inner">
      <table>
        <thead>
          <tr>
            <th><span>ステータス</span></th>
            <th><span>アシスタント定義名</span></th>
            <th><span>カテゴリ</span></th>
          </tr>
        </thead>
        <tbody id="import-preview-table-body"></tbody>
      </table>
    </div>
  </div>
</section>
<!-- フッタは main 直下・スクロール領域（section）の外に置き、pgstyle-layout-footer（flex:0 0 auto）で固定する -->
<div class="pgstyle-layout-footer imds-py-2 imds-px-6 imds-border-t-1">
  <button type="button" id="back-to-file-select" class="imds-button is-outlined" style="min-width: 8em;">戻る</button>
  <button type="button" id="import-execute-button" class="imds-button is-primary" style="min-width: 8em;">インポート</button>
</div>
```

**ポイント:**
- ステータスの補足説明や注意事項は `imds-collapse-message`（折りたたみ）で表示し、必要な場合のみ配置する。メッセージ内でテーブルを使う場合は `is-bordered is-area-bordered is-narrow` 等の Table バリエーションを使う
- 「変更なし」のデータもインポート対象に含まれ、更新者・更新日時のみが更新される旨を明示する
- 戻るボタン押下でステップ1（ファイル選択）に戻る
- 確認テーブルには `is-area-bordered is-sticky is-narrow is-hoverable` を付与する（[imds-html-table.md](../reference/imds-html-table.md)「実装上の注意」のバリエーションクラスの付与基準）
- フッタの横パディング（`imds-px-6`）はセクションの横パディングに揃える

## 5. ステップ3: インポート結果

インポート実行後の結果（成功・警告・エラー）に応じてサマリ表示を切り替える。

### 5-A. 成功時

```html
<section class="imds-py-4 imds-px-6 pgstyle-layout-content imds-scrollbar sample-import-result-container">
  <div class="sample-import-result-icon">
    <span class="imds-icon is-success"><i class="fa-regular fa-circle-check"></i></span>
  </div>
  <div class="sample-import-result-content">
    <div class="sample-import-result-message">
      <p>アシスタント定義のインポートが完了しました。</p>
      <p>詳細は一覧を確認してください。</p>
    </div>
    <div class="sample-import-result-button-group">
      <button type="button" class="imds-button is-primary">アシスタント定義一覧を開く</button>
      <button type="button" class="imds-button">インポート画面に戻る</button>
    </div>
  </div>
  <div class="imds-table is-bordered is-area-bordered sample-import-info-table">
    <div class="imds-table-inner">
      <table>
        <tbody>
          <tr>
            <th rowspan="2"><span>インポート件数</span></th>
            <th><span>カテゴリ</span></th>
            <td><span>10 件</span></td>
          </tr>
          <tr>
            <th><span>アシスタント定義</span></th>
            <td><span>10 件</span></td>
          </tr>
          <tr>
            <th colspan="2"><span>インポートファイル</span></th>
            <td><span>assistant-definitions.zip</span></td>
          </tr>
          <tr>
            <th colspan="2"><span>実行終了日時</span></th>
            <td><span>2026/07/24 10:05:00</span></td>
          </tr>
          <tr>
            <th colspan="2"><span>実行ユーザ</span></th>
            <td><span>テナント太郎</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>
```

### 5-B. 警告時（一部失敗）

```html
<section class="imds-py-4 imds-px-6 pgstyle-layout-content imds-scrollbar sample-import-result-container">
  <div class="sample-import-result-icon">
    <span class="imds-icon is-warning"><i class="imds-iconfont imds-warning"></i></span>
  </div>
  <div class="sample-import-result-content">
    <div class="sample-import-result-message">
      <p>アシスタント定義のインポートを実行しましたが、一部失敗しました。</p>
      <p>詳細は一覧を確認してください。</p>
    </div>
    <div class="sample-import-result-button-group">
      <button type="button" class="imds-button is-primary">アシスタント定義一覧を開く</button>
      <button type="button" class="imds-button">インポート画面に戻る</button>
    </div>
  </div>
  <div class="imds-table is-bordered is-area-bordered sample-import-info-table">
    <div class="imds-table-inner">
      <table>
        <tbody>
          <tr>
            <th rowspan="2"><span>インポート件数</span></th>
            <th><span>カテゴリ</span></th>
            <td><span>5/10 件</span></td>
          </tr>
          <tr>
            <th><span>アシスタント定義</span></th>
            <td><span>5/10 件</span></td>
          </tr>
          <tr>
            <th colspan="2"><span>インポートファイル</span></th>
            <td><span>assistant-definitions.zip</span></td>
          </tr>
          <tr>
            <th colspan="2"><span>実行終了日時</span></th>
            <td><span>2026/07/24 10:05:00</span></td>
          </tr>
          <tr>
            <th colspan="2"><span>実行ユーザ</span></th>
            <td><span>テナント太郎</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <label class="imds-checkbox imds-mt-3">
    <input type="checkbox" id="show-failed-only" checked>
    <span>失敗のみ表示</span>
  </label>
  <div class="imds-table is-area-bordered is-bordered is-sticky is-narrow is-hoverable" id="import-result-detail-table" style="max-height: 400px;">
    <div class="imds-table-inner">
      <table>
        <!-- 失敗データの詳細一覧（JSで生成） -->
      </table>
    </div>
  </div>
</section>
```

### 5-C. エラー時（すべて失敗）

```html
<section class="imds-py-4 imds-px-6 pgstyle-layout-content imds-scrollbar sample-import-result-container">
  <div class="sample-import-result-icon">
    <span class="imds-icon is-error"><i class="fa-regular fa-circle-xmark"></i></span>
  </div>
  <div class="sample-import-result-content">
    <div class="sample-import-result-message">
      <p>アシスタント定義のインポートに失敗しました。</p>
      <p>詳細は一覧を確認してください。</p>
    </div>
    <div class="sample-import-result-button-group">
      <button type="button" class="imds-button is-primary">アシスタント定義一覧を開く</button>
      <button type="button" class="imds-button">インポート画面に戻る</button>
    </div>
  </div>
  <div class="imds-table is-bordered is-area-bordered sample-import-info-table">
    <div class="imds-table-inner">
      <table>
        <tbody>
          <tr>
            <th><span>インポートファイル</span></th>
            <td><span>assistant-definitions.zip</span></td>
          </tr>
          <tr>
            <th><span>実行日時</span></th>
            <td><span>2026/07/24 10:05:00</span></td>
          </tr>
          <tr>
            <th><span>実行ユーザ</span></th>
            <td><span>テナント太郎</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>
```

**ポイント:**
- 結果アイコンは成功 `is-success`（`fa-circle-check`）、警告 `is-warning`（`imds-warning`）、エラー `is-error`（`fa-circle-xmark`）で区別する
- 成功・警告時は「インポートに使用したファイル名」「実行終了日時」「実行ユーザ」に加えて、種別ごとのインポート件数（警告時は `成功件数/総数` 形式）を表示する。エラー時（全件失敗）は件数行を省き、ファイル名・実行日時・実行ユーザのみ表示する
- 警告時（一部失敗）のみ「失敗のみ表示」チェックボックスを配置する。**初期状態はチェック済み**（失敗データのみ表示）とし、チェックを外すとすべてのデータを表示する
- 「一覧を開く」ボタンで一覧画面へ、「インポート画面に戻る」ボタンでステップ1に戻す

## 実装上の注意

- ステップの切り替え・ファイルアップロード状態・インポート結果の判定（成功/警告/エラー）は JavaScript（およびサーバ側の処理結果）で制御する
- `${サンプル}` に相当する箇所（データ種別名）は、実装対象のデータ種別名に置き換えること
- インポートに使用できるファイル形式は `<input type="file" accept="...">` と補足メッセージの両方で明示すること
- エクスポート画面と対になる構成のため、ヘッダの `imds-header-nav` メニューにエクスポート画面・一覧画面への導線を含めることが多い
- ステップ2の確認テーブル・ステップ3の失敗詳細テーブルのように縦スクロールが発生しうる一覧テーブルには、`is-sticky` でヘッダを固定する（一覧画面テンプレートの `isSticky` の項を参照）
- `sample-import-*` はプレースホルダー prefix。実装時は機能名に応じた prefix に置き換えること（`imds-` で始まる標準クラスは変更しない）
- `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` / `pgstyle-layout-footer` は機能ごとに置き換えるプレースホルダー**ではない**固定クラス名である。生成時もクラス名は変更しないこと
- 本テンプレートは HTML 部分のみのため、`<imart type="head">` の `<style>` に以下のレイアウト制御用スタイルを定義すること（このファイルで使用するクラスのみを掲載する）

  ```css
  /* レイアウト制御用スタイル */
  .pgstyle-layout-container {
    grid-template-rows: 5rem minmax(0, 1fr);
    grid-template-columns: 100%;
    height: 100%;
    display: grid;
  }
  .pgstyle-layout-container > .imds-header {
    grid-row: 1 / 2;
  }
  .pgstyle-layout-main {
    flex-direction: column;
    grid-row: 2 / 3;
    height: 100%;
    display: flex;
  }
  .pgstyle-layout-content {
    flex: 1 0 0;
    overflow: auto;
  }
  .pgstyle-layout-footer {
    flex: 0 0 auto;
    display: flex;
    justify-content: left;
    gap: 2em;
  }
  ```

- `<imart type="head">` にはさらに `im_design_system/theme/css/theme-conditional-layout.css`（テーマごとに異なるコンテンツ表示領域の高さ・幅を制御する CSS）の読み込みが必須。これが無いと `.imds-container` の高さが確定せず、`pgstyle-layout-content` の `flex: 1 0 0` の伸長先が無くなってコンテンツ領域が高さ 0 に潰れる。

  ```html
  <!-- テーマごとに異なるコンテンツ表示領域の高さ・幅を制御する CSS -->
  <link rel="stylesheet" type="text/css" href="im_design_system/theme/css/theme-conditional-layout.css" />
  ```
