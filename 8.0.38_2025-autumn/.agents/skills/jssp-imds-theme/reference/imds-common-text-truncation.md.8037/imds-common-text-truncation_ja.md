# 長いテキストの省略表示（common-parts）

## 基本情報

テーブルセル・詳細フォーム・カード等で長文テキストを初期1行省略し、クリックで展開/折りたたみする場合に使用する複合パターンである。
テキストの範囲選択（コピー）操作を妨げない配慮が含まれる。

- 抽出元: `uiux-share/common-parts/長いテキストの省略表示.md`
- テーブルの備考列・説明列で展開/折りたたみが必要な場合、詳細参照でフィールド内の長文テキストを省略表示する場合、カード・パネル等で長文説明を折りたたむ場合に用いる。

**既存パターン「テーブルセルの長文省略（LineClamp 単体）」との使い分け**:
- LineClamp 単体: `imds-line-clamp-*` クラスを付与するだけの静的省略。インタラクションなし。
- 本パターン: クリックで展開/折りたたみを切り替えるインタラクション付き。caret アイコンで状態を視覚化する。

## 構成コンポーネント

| 使用する基本コンポーネント | 対応 reference |
|---|---|
| IconFont（`imds-icon`） | [imds-html-icon-font.md](imds-html-icon-font.md) |

`imds-line-clamp-*` は helper 系のユーティリティクラス（LineClamp）であり、単独の reference ファイルは未整備。本パターンでは `imds-line-clamp-1`（1行省略）をトリガー要素内の `<p>` に付与する形で使用する。

## HTML スニペット

caret アイコンとテキストを flex で横並びにし、コンテナ全体をクリック領域にする。
`[REPLACE: unique-id]` にはページ内で一意な ID を付与し JS でバインドする。

```html
<div class="imds-line-clamp-trigger" id="[REPLACE: unique-id]" title="[REPLACE: テキストを開く]"
     style="display: flex; align-items: flex-start; cursor: pointer; max-width: 100%;">
  <span class="imds-icon imds-mr-2">
    <i class="fa-solid fa-caret-right"></i>
  </span>
  <p class="imds-line-clamp-1">
    [REPLACE: 省略表示したい長文テキスト]
  </p>
</div>
```

## JS 制御

複数の展開ブロックが同一画面にある場合、`.imds-line-clamp-trigger` クラスでまとめて対象要素を取得し、各コンテナ内の `p` / `i` を子孫探索で特定する。

```javascript
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".imds-line-clamp-trigger").forEach((container) => {
    const pElement = container.querySelector("p");
    const iconElement = container.querySelector("i");

    container.addEventListener("click", (event) => {
      event.stopPropagation();

      if (window.getSelection()?.toString()) {
        // テキスト選択中（コピー操作）はトグルしない
        return;
      }

      pElement.classList.toggle("imds-line-clamp-1");

      if (iconElement.classList.contains("fa-caret-right")) {
        iconElement.classList.remove("fa-caret-right");
        iconElement.classList.add("fa-caret-down");
        container.setAttribute("title", "閉じる");
      } else {
        iconElement.classList.remove("fa-caret-down");
        iconElement.classList.add("fa-caret-right");
        container.setAttribute("title", "開く");
      }
    });
  });
});
```

## CSS 意図

トリガーコンテナのレイアウト意図（`sample-explanation` に相当する説明用クラスは生成物には含めず、インライン `style` で代替する）:

- `display: flex; align-items: flex-start` → アイコンとテキストの先頭揃え横並び
- `cursor: pointer` → クリック可能を示す
- `max-width: 100%` → 親コンテナ幅に収める

## 実装上の注意

- `window.getSelection().toString()` が空でない場合（テキスト選択中）はトグルしない。コピー操作を妨げないための必須の配慮である。
- クリックのたびに `imds-line-clamp-1` の付与/除去と `fa-caret-right` / `fa-caret-down` の切り替え、`title` 属性の更新（「開く」⇔「閉じる」）を同期させること。
- `sample-*` の説明用クラスは生成物には含めない。レイアウトはインライン `style` で代替する。
