# 多言語の入力欄（common-parts）

## 基本情報

intra-mart Accel Platform の多言語機能を使い、入力値を複数言語で登録する場合に使用する複合パターンである。
標準言語（日本語）フィールドの隣に globe ボタンを配置し、クリックで追加言語フィールドを展開/折りたたむ。

- 抽出元: `uiux-share/common-parts/多言語の入力欄.md`
- 標準以外の言語フィールドは動的に生成する（プラットフォームの言語設定に依存する）。
- 要件に「多言語」「ローカライズ」「言語切り替え」「言語別入力」が含まれる場合に適用する。
- 名称・説明等の多言語対応フィールドや、設定画面・マスタ管理画面、インポート画面のフォームで用いる。

## 構成コンポーネント

| 使用する基本コンポーネント | 対応 reference |
|---|---|
| FieldGroup（`imds-field-group`） | [imds-html-field-group.md](imds-html-field-group.md) |
| Field（`imds-field`） | [imds-html-field.md](imds-html-field.md) |
| Textbox（`imds-textbox`） | [imds-html-textbox.md](imds-html-textbox.md) |
| Button（`imds-button`） | [imds-html-button.md](imds-html-button.md) |
| Divider（`imds-divider`） | [imds-html-divider.md](imds-html-divider.md) |

## HTML スニペット

### 縦型（デフォルト）

`imds-w-15` は FieldGroup 全体の幅クラス、`imds-w-25` は内部フィールドの幅クラスである（幅クラスの一覧は [imds-html-field.md](imds-html-field.md) を参照）。

> **幅クラス**: 標準フィールドと追加言語フィールドは、必ず同じ幅クラス（例: `imds-w-25`）を全ての `imds-field` に明示的に付与する。省略すると生成結果でフィールドごとに入力欄の長さが揃わなくなるため注意。

```html
<div class="imds-field-group imds-w-15">
  <div class="imds-field-group-label"><span>多言語</span></div>
  <div class="imds-field-group-control">
    <div class="imds-field imds-w-25">
      <div class="imds-field-label">
        <label for="[REPLACE: std-input-id]">標準</label>
      </div>
      <div class="imds-field-control">
        <input type="text" id="[REPLACE: std-input-id]" class="imds-textbox" value="" />
        <button id="[REPLACE: toggle-btn-id]" type="button" class="imds-button">
          <span class="imds-icon"><i class="fa-solid fa-globe"></i></span>
        </button>
      </div>
    </div>
    <!-- 追加言語フィールド（初期非表示・JS で切り替え）。実際の言語構成はプラットフォーム設定に依存し動的生成される。以下は代表例（日本語・英語・中国語） -->
    <hr id="[REPLACE: divider-id]" class="imds-divider" style="display: none;" />
    <div id="[REPLACE: localized-group-id]" style="display: none;">
      <div class="imds-field imds-w-25">
        <div class="imds-field-label">
          <label for="[REPLACE: lang-input-id-ja]">日本語</label>
        </div>
        <div class="imds-field-control">
          <input type="text" id="[REPLACE: lang-input-id-ja]" class="imds-textbox" value="" />
        </div>
      </div>
      <div class="imds-field imds-w-25">
        <div class="imds-field-label">
          <label for="[REPLACE: lang-input-id-en]">英語</label>
        </div>
        <div class="imds-field-control">
          <input type="text" id="[REPLACE: lang-input-id-en]" class="imds-textbox" value="" />
        </div>
      </div>
      <div class="imds-field imds-w-25">
        <div class="imds-field-label">
          <label for="[REPLACE: lang-input-id-zh]">中国語（中華人民共和国）</label>
        </div>
        <div class="imds-field-control">
          <input type="text" id="[REPLACE: lang-input-id-zh]" class="imds-textbox" value="" />
        </div>
      </div>
      <!-- 言語が増減する場合はこの imds-field を増減させる -->
    </div>
  </div>
</div>
```

### 水平型（`is-horizontal`）

ラベルとコントロールを横並びにする場合。

> **幅クラス**: 縦型と同様、標準フィールドと追加言語フィールドの全 `imds-field` に同じ `imds-w-25` を明示的に付与する。
> **アクセシビリティ注意**: この水平型パターンは `id` を `<input>` ではなく幅調整用の外側 `<div>` に付与するため、`<label for="...">` と `<input>` の関連付けが切れる。各 `<input>` に `aria-label="[言語名]"`（ラベルと同じ文言）を必ず付与すること（省略すると lint の `input-no-label` に抵触する）。

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label"><span>多言語</span></div>
  <div class="imds-field-group-control">
    <div class="imds-field imds-w-25">
      <div class="imds-field-label">
        <label for="[REPLACE: std-input-id]">標準</label>
      </div>
      <div class="imds-field-control">
        <input type="text" id="[REPLACE: std-input-id]" class="imds-textbox" value="" />
        <button id="[REPLACE: toggle-btn-id]" type="button" class="imds-button">
          <span class="imds-icon"><i class="fa-solid fa-globe"></i></span>
        </button>
      </div>
    </div>
    <!-- 実際の言語構成はプラットフォーム設定に依存し動的生成される。以下は代表例（日本語・英語・中国語） -->
    <hr id="[REPLACE: divider-id]" class="imds-divider" style="display: none;" />
    <div id="[REPLACE: localized-group-id]" class="imds-field-group" style="display: none;">
      <div class="imds-field-group-control">
        <div class="imds-field imds-w-25">
          <div class="imds-field-label">
            <label for="[REPLACE: lang-input-id-ja]">日本語</label>
          </div>
          <div class="imds-field-control">
            <div id="[REPLACE: lang-input-id-ja]" style="width: 100%; padding-right: calc(1em + 3.2rem);">
              <input type="text" class="imds-textbox" value="" aria-label="日本語">
            </div>
          </div>
        </div>
        <div class="imds-field imds-w-25">
          <div class="imds-field-label">
            <label for="[REPLACE: lang-input-id-en]">英語</label>
          </div>
          <div class="imds-field-control">
            <div id="[REPLACE: lang-input-id-en]" style="width: 100%; padding-right: calc(1em + 3.2rem);">
              <input type="text" class="imds-textbox" value="" aria-label="英語">
            </div>
          </div>
        </div>
        <div class="imds-field imds-w-25">
          <div class="imds-field-label">
            <label for="[REPLACE: lang-input-id-zh]">中国語（中華人民共和国）</label>
          </div>
          <div class="imds-field-control">
            <div id="[REPLACE: lang-input-id-zh]" style="width: 100%; padding-right: calc(1em + 3.2rem);">
              <input type="text" class="imds-textbox" value="" aria-label="中国語（中華人民共和国）">
            </div>
          </div>
        </div>
        <!-- 言語が増減する場合はこの imds-field を増減させる -->
      </div>
    </div>
  </div>
</div>
```

## JS 制御

globe ボタンのクリックで divider と追加言語グループの表示/非表示を切り替える。
`[REPLACE: toggle-btn-id]` / `[REPLACE: divider-id]` / `[REPLACE: localized-group-id]` は実際の id に置き換える。

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('[REPLACE: toggle-btn-id]');
  const divider = document.getElementById('[REPLACE: divider-id]');
  const localizedGroup = document.getElementById('[REPLACE: localized-group-id]');

  toggleButton.addEventListener('click', () => {
    const isHidden = divider.style.display === 'none';
    divider.style.display = isHidden ? '' : 'none';
    localizedGroup.style.display = isHidden ? '' : 'none';
  });
});
```

## 実装上の注意

- 標準フィールドと追加言語フィールドには必ず同じ幅クラス（例: `imds-w-25`）を明示的に付与すること。
- 水平型では `<input>` に `id` を付与せず外側 `div` に付与するため、`label` との関連付けが失われる。各 `<input>` に `aria-label` を必ず付与すること。
- 追加言語フィールドの数はプラットフォームの言語設定に依存して動的に増減する。日本語・英語・中国語は代表例であり、実装時は動的生成にすること。
