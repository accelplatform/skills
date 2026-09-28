# エクスポート画面の実装例

imds テーマのコンポーネントを組み合わせた、業務エクスポート画面の実装例。
「アシスタント定義」画面を題材に、ヘッダ・ステッパー・エクスポート方法選択・対象選択（一覧）・実行確認の構成パターンを示す。

## 使用コンポーネント一覧

| コンポーネント | reference | 本例での用途 |
|---------------|-----------|-------------|
| Header | [header.md](../reference/header.md) | 関連画面メニュー付きページヘッダ |
| Stepper | [stepper.md](../reference/stepper.md) | エクスポート工程の進捗表示 |
| Message | [message.md](../reference/message.md) | エクスポート内容の補足説明 |
| Radio | [radio.md](../reference/radio.md) | エクスポート方法の選択 |
| Button | [button.md](../reference/button.md) | エクスポート実行ボタン・次へボタン |
| EmptyState | [imds-html-empty-state.md](../reference/imds-html-empty-state.md) | 対象選択エリアが空のときの表示 |
| Table | [table.md](../reference/table.md) | エクスポート対象一覧テーブル |
| Confirm | [confirm.md](../reference/confirm.md) | エクスポート実行前の確認ダイアログ |

## 全体構成

```
div.imds-container                   ... ルート div（intra-mart テーマの imui-container の内側に配置されるため id は付与しない、中間ラッパーも挟まない）
├── header.imds-header              ... ページヘッダ（関連画面メニュー・タイトル）
└── main
    ├── div.imds-stepper             ... 進捗ステッパー（2 ステップ）
    └── section（ステップごとに切替）
        ├── ステップ1: エクスポート方法選択
        │   ├── imds-message         ... 補足メッセージ（任意）
        │   ├── imds-radio × 2        ... 「すべて」/「選択して」の選択肢
        │   └── button                ... エクスポート実行 or 次へ
        └── ステップ2: エクスポート対象選択（一覧画面に準拠）
            ├── button-area           ... 検索欄
            ├── imds-table            ... 対象一覧（チェックボックス列あり）
            └── フッタ                 ... 戻る・エクスポートボタン
```

## 1. ページヘッダ

エクスポート画面は他の関連画面（インポート画面・一覧画面等）への切り替えメニューを持つことが多いため、`imds-header-nav`（Popover 併用）パターンを使用する。単独画面で関連画面メニューが不要な場合は、一覧画面と同様に `imds-header-icon` パターンでもよい。

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
            <li><a href="#"><span>アシスタント定義インポート</span></a></li>
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
- ヘッダには `imds-header-icon` / `imds-header-back-button` / `imds-header-nav` のいずれか 1 つを必ず配置する（SKILL.md の必須ルールに準拠）。関連画面への遷移が必要な場合は `imds-header-nav` を選ぶ
- `imds-header-actions` にエクスポート実行ボタンは置かない（業務操作ボタンはヘッダに置かない原則はエクスポート画面にも適用される）

## 2. ステッパー

エクスポート画面は「エクスポート方法を選択」→「エクスポート対象を選択」の 2 ステップで構成する。

```html
<div class="imds-stepper">
  <ul>
    <li class="imds-stepper-step is-active">
      <button disabled><span>1.エクスポート方法を選択</span></button>
    </li>
    <li class="imds-stepper-step">
      <button disabled><span>2.エクスポート対象を選択</span></button>
    </li>
  </ul>
</div>
```

**ポイント:**
- `is-active` クラスを JavaScript で付け替え、現在のステップを表示する
- 各 `<button>` は `disabled` のままにする（ステッパーは進捗表示専用であり、クリックでのステップ間ジャンプは提供しない）

## 3. ステップ1: エクスポート方法を選択

補足メッセージ（任意）+ ラジオボタン（すべて / 選択して）+ アクションボタンで構成する。

```html
<section class="imds-py-6 imds-px-8 imds-scrollbar" data-mode="new">
  <div class="imds-message is-outlined is-info imds-mb-5">
    <div class="imds-message-title">
      <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
      <p>アシスタント定義のエクスポート</p>
    </div>
    <div class="imds-message-content">
      <p>アシスタント定義をエクスポートします。</p>
      <p>エクスポート方法を選択し、エクスポートボタンをクリックしてください。</p>
    </div>
  </div>
  <h2 class="imds-heading is-size-4">エクスポート方法</h2>
  <div>
    <div>
      <label class="imds-radio is-medium has-text-weight-bold">
        <input type="radio" name="export-method" value="all" checked="">
        <span>すべてエクスポート</span>
      </label>
      <span class="imds-help-text imds-ml-7">すべてのアシスタント定義をエクスポートします。</span>
    </div>
    <div>
      <label class="imds-radio is-medium has-text-weight-bold">
        <input type="radio" name="export-method" value="select">
        <span>任意のアシスタント定義を選択してエクスポート</span>
      </label>
      <span class="imds-help-text imds-ml-7">一覧から選択したアシスタント定義をエクスポートします。</span>
    </div>
  </div>
  <button type="button" id="export-action-button" class="imds-button is-normal is-primary imds-mt-6" style="min-width:8em;">
    エクスポート
  </button>
</section>
```

**ポイント:**
- 初期表示では「すべてエクスポート」を選択状態にする
- ラジオボタンの選択に応じて、下部ボタンのキャプションと動作を切り替える
  - 「すべてエクスポート」選択時: ボタンキャプションは「エクスポート」、押下でそのままエクスポート処理を実行
  - 「任意を選択してエクスポート」選択時: ボタンキャプションは「次へ」、押下でステップ2（対象選択）に遷移
- メッセージ（`imds-message`）の表示は必須ではなく、補足が必要な場合のみ配置する

## 4. ステップ2: エクスポート対象を選択

**レイアウトは一覧画面（`imds-list-page.md`）に準拠する。** 検索欄・チェックボックス列付きテーブル・「選択済みのみ表示」チェックボックスで構成する。

```html
<section class="imds-py-6 imds-px-8 imds-scrollbar">
  <div class="button-area imds-mb-3">
    <div class="imds-input-group">
      <input type="search" class="imds-textbox" placeholder="アシスタント定義名を検索" aria-label="アシスタント定義名を検索">
      <button type="button" title="検索" class="imds-button is-outlined">
        <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
      </button>
    </div>
  </div>
  <label class="imds-checkbox imds-mb-3">
    <input type="checkbox" id="show-selected-only">
    <span>選択済みのみ表示</span>
  </label>
  <div class="imds-table is-sticky" style="max-height: 420px;">
    <div class="imds-table-inner">
      <table>
        <thead>
          <tr>
            <th class="has-text-centered"><label class="imds-checkbox"><input type="checkbox" id="select-all"></label></th>
            <th><span>アシスタント定義名</span></th>
            <th><span>更新者</span></th>
            <th>
              <div class="imds-table-column-actions">
                <button type="button" class="imds-table-sorter" title="更新日時でソート">
                  <span class="imds-table-sort-label">更新日時</span>
                  <span class="imds-icon"><i class="fa-solid fa-sort-up"></i><i class="fa-solid fa-sort-down"></i></span>
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody id="export-target-table-body"></tbody>
      </table>
    </div>
  </div>
</section>
<div class="sample-layout-footer imds-py-2 imds-px-8 imds-border-t-1">
  <button type="button" id="back-button" class="imds-button is-outlined" style="min-width:8em;">戻る</button>
  <button type="button" id="export-execute-button" class="imds-button is-primary" style="min-width:8em;" disabled>エクスポート</button>
</div>
```

**ポイント:**
- 検索部品はツリー/リスト側と詳細一覧側の両方に配置する場合、カテゴリ間を移動しても入力内容を保持する
- キーワード検索の対象が詳細検索の項目と連動する場合は、検索実行時に詳細検索の Popover に `is-applied` クラスを付与する
- 「更新者」「更新日時」列を必ず含め、更新日時列はソート可能にする（実 DOM 構造は `th > div.imds-table-column-actions > button.imds-table-sorter[title] > span.imds-table-sort-label + span.imds-icon`。`fa-sort-up` と `fa-sort-down` の 2 アイコンを両方配置する）
- チェックボックス列のヘッダには「すべて選択」チェックボックスを配置する。テーブル内のチェックボックスは `label.imds-checkbox > input` のみで、余分な `<span>` は付けない
- データ取得負荷が高い場合は、初期表示でツリー未選択・一覧空とし、カテゴリ選択後のみ一覧を取得する。一覧が空の間は `reference/imds-html-empty-state.md` の EmptyState（例:「ツリーからカテゴリを選択してください。」）を表示する
- フッタの「エクスポート」ボタンは、対象が 1 件も選択されていない間は `disabled` にする
- 「戻る」ボタン押下でステップ1に戻る

## 5. エクスポート実行確認ダイアログ

エクスポート実行前に、対象件数を明示した確認ダイアログを表示する。

```html
<dialog class="imds-dialog-wrapper">
  <div class="imds-confirm is-info">
    <div class="imds-confirm-content-wrapper">
      <button type="button" class="imds-confirm-close imds-button is-ghost">
        <span class="imds-icon"><i class="fa-solid fa-xmark"></i></span>
      </button>
      <div class="imds-confirm-content">
        <div class="imds-confirm-message-wrapper">
          <div class="imds-confirm-icon">
            <span class="imds-icon is-x-small is-info"><i class="fa-solid fa-circle-question"></i></span>
          </div>
          <div class="imds-confirm-message">
            <p class="imds-confirm-message-title">アシスタント定義をエクスポートしますか？</p>
            <div class="imds-confirm-message-content">エクスポート対象：10件</div>
          </div>
        </div>
      </div>
    </div>
    <div class="imds-confirm-footer">
      <div class="imds-confirm-footer-content">
        <button type="button" class="imds-button">キャンセル</button>
        <button type="button" class="imds-button is-primary">エクスポート</button>
      </div>
    </div>
  </div>
</dialog>
```

**ポイント:**
- 選択件数（例:「エクスポート対象：10件」）を必ず表示し、ユーザーが意図した対象を選択できているか事前確認できるようにする
- ダイアログのルート要素は `<dialog class="imds-dialog-wrapper">` を基本とする（`reference/imds-html-dialog.md` を参照）

## 全体コード（ステップ1）

ルート `<div>` には id を付与せず `class="imds-container ..."` のみを付与し、中間ラッパーを作らない。

```html
<div class="imds-container">
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
  <main>
    <div class="imds-stepper">
      <ul>
        <li class="imds-stepper-step is-active">
          <button disabled><span>1.エクスポート方法を選択</span></button>
        </li>
        <li class="imds-stepper-step">
          <button disabled><span>2.エクスポート対象を選択</span></button>
        </li>
      </ul>
    </div>
    <section class="imds-py-6 imds-px-8 imds-scrollbar" data-mode="new">
      <div class="imds-message is-outlined is-info imds-mb-5">
        <div class="imds-message-title">
          <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
          <p>アシスタント定義のエクスポート</p>
        </div>
        <div class="imds-message-content">
          <p>アシスタント定義をエクスポートします。</p>
          <p>エクスポート方法を選択し、エクスポートボタンをクリックしてください。</p>
        </div>
      </div>
      <h2 class="imds-heading is-size-4">エクスポート方法</h2>
      <div>
        <div>
          <label class="imds-radio is-medium has-text-weight-bold">
            <input type="radio" name="export-method" value="all" checked="">
            <span>すべてエクスポート</span>
          </label>
          <span class="imds-help-text imds-ml-7">すべてのアシスタント定義をエクスポートします。</span>
        </div>
        <div>
          <label class="imds-radio is-medium has-text-weight-bold">
            <input type="radio" name="export-method" value="select">
            <span>任意のアシスタント定義を選択してエクスポート</span>
          </label>
          <span class="imds-help-text imds-ml-7">一覧から選択したアシスタント定義をエクスポートします。</span>
        </div>
      </div>
      <button type="button" id="export-action-button" class="imds-button is-normal is-primary imds-mt-6" style="min-width:8em;">
        エクスポート
      </button>
    </section>
  </main>
</div>
```

## 実装上の注意

- ステップの切り替え（`is-active` の付け替え、表示するセクションの切り替え）は JavaScript で制御する
- `${サンプル}` に相当する箇所（データ種別名）は、実装対象のデータ種別名に置き換えること
- ステップ2 のテーブル・検索・ページネーションは `imds-list-page.md` の一覧画面パターンをそのまま踏襲する（重複を避けるため、詳細は一覧画面テンプレートを参照すること）
- エクスポート対象のチェックボックス列は、データ取得負荷が低い場合はツリー側にも配置し連動させる。負荷が高い場合はテーブル側のみに配置する
- インポート画面と対になる構成のため、ヘッダの `imds-header-nav` メニューにインポート画面・一覧画面への導線を含めることが多い
