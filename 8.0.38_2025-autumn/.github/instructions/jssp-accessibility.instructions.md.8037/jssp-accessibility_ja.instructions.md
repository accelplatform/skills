---
applyTo: "src/main/jssp/**/*.html"
description: "アクセシビリティ規約（スクリーンリーダー対応、ARIA、キーボード操作、WCAG 2.1 AA）"
---

# アクセシビリティ規約（スクリーンリーダー対応）

> **適用範囲**: 🟠 **業務要件依存** — 仕様書で明示指示があった場合のみ厚く適用する。指示がなければ最小限（`imdsConfirm` 使用、`<button>` への `aria-label`、装飾アイコンへの `aria-hidden="true"` 等の基本のみ）に留め、`aria-describedby`・`aria-invalid` 動的制御・`role="group"` + `aria-labelledby` の手厚い実装は仕様書要求がない限り入れない。

intra-mart Accel Platform のスクリプト開発で作成する画面は、スクリーンリーダー（NVDA / JAWS / VoiceOver / Narrator）で操作可能であること。
WCAG 2.1 レベル AA 相当を目標とする。

## 基本原則

1. **意味のある HTML を使う** - `div` / `span` の濫用を避け、`button` `a` `nav` `main` `header` `table` `label` 等の意味的要素を優先する
2. **キーボードのみで全機能が操作できる** - マウス前提の UI を作らない
3. **フォーカスが視覚的に分かる** - `outline` を `none` で消さない
4. **動的な変化を伝える** - DOM 書き換え・非同期処理の結果はライブリージョンで通知する
5. **画像・アイコン単独では情報を伝えない** - テキストまたは代替テキストを必ず併記する

## ページ全体の構造

### ランドマーク

intra-mart Accel Platform のグローバルヘッダ・グローバルメニュー・フッタは **プラットフォーム（テーマ）が出力する**。
そのため、各プレゼンテーションページで `<header>` / `<nav>` / `<footer>` を **追加してはならない**（プラットフォーム提供のランドマークと二重になる）。

画面のルート構造は `jssp-presentation-page.md` の規約に従い、`<main>` のみを配置する。

```html
<div id="container">
  <div class="imds-container">
    <main>
      <h1>画面タイトル</h1>
      <!-- メインコンテンツ -->
    </main>
  </div>
</div>
```

- `<main>` は HTML5 の意味的要素であり、暗黙で `role="main"` を持つため `role="main"` を併記しない
- 1 ページに `<main>` は 1 つだけ
- 画面内に複数の領域がありセクション分けが必要な場合は `<section aria-labelledby="...">` を使う（`<nav>` 等は使用しない）

### 見出し階層

- ページタイトルは `h1`、その配下は `h2` → `h3` の順に **階層を飛ばさず** 記述する
- 見た目のために見出しレベルを選ばない（サイズは CSS で調整）
- 1 ページに `h1` は 1 つ

### 言語属性

```html
<html lang="ja">
```

多言語化対応時はサーバ側で `lang` を切り替えること。

## フォーム

### ラベル

すべての入力要素には **明示的な `label`** を関連付ける。

JSSP の慣習として、入力要素の `id` は `:userName:` のようにコロンで囲む。

```html
<!-- OK: for / id で関連付け -->
<label for=":userName:">ユーザ名</label>
<input type="text" id=":userName:" name="userName">

<!-- NG: プレースホルダのみ -->
<input type="text" placeholder="ユーザ名">
```

- ラベルを視覚的に隠す場合も DOM には残し、`class="visually-hidden"` 等で隠す（`display:none` は NG）
- アイコンのみのボタンは `aria-label` または `title` を必須

### 必須項目

```html
<label for=":email:">メールアドレス <span aria-hidden="true">*</span></label>
<input type="email" id=":email:" required aria-required="true">
```

`*` は装飾なので `aria-hidden="true"`、必須の事実は `aria-required` または `required` で伝える。

### エラー表示

`jssp-presentation-page.md` の標準パターン（`.imds-field` + `.imds-validation-error` クラス、`.imds-error-text` を `style.display` で出し入れ）を踏襲した上で、ARIA 属性を追加する。

```html
<div class="imds-field" for=":age:">
  <label for=":age:">年齢</label>
  <input type="number" id=":age:"
         aria-describedby=":age:-error">
  <span class="imds-error-text" for=":age:" id=":age:-error" style="display:none;"></span>
</div>
```

```javascript
// エラー表示時
function showValidationError(errors) {
  errors.forEach((error) => {
    const fieldElement = document.querySelector(`.imds-field[for=":${error.name}:"]`);
    if (fieldElement) {
      fieldElement.classList.add('imds-validation-error');
    }
    const errorElement = document.querySelector(`.imds-error-text[for=":${error.name}:"]`);
    if (errorElement) {
      errorElement.textContent = error.message;
      errorElement.style.display = '';
    }
    // 入力要素に aria-invalid を付与
    const inputElement = document.getElementById(`:${error.name}:`);
    if (inputElement) {
      inputElement.setAttribute('aria-invalid', 'true');
    }
  });
}

// エラークリア時
function clearValidationError() {
  document.querySelectorAll('.imds-field.imds-validation-error').forEach((el) => {
    el.classList.remove('imds-validation-error');
  });
  document.querySelectorAll('.imds-error-text').forEach((el) => {
    el.style.display = 'none';
  });
  document.querySelectorAll('[aria-invalid="true"]').forEach((el) => {
    el.removeAttribute('aria-invalid');
  });
}
```

- `aria-describedby` はメッセージ要素の `id` を指す（HTML 上の配置はユーザが手動で変えても関連付けが壊れない）
- エラーがある入力に `aria-invalid="true"` を付与し、解除時に除去する
- メッセージ要素は `style.display = 'none'` で隠す既存パターンを維持する（`display:none` の要素は `aria-describedby` の対象でも読み上げられないが、表示時に読まれるため問題ない）
- 送信時にエラーが発生した場合、最初のエラー項目にフォーカスを移動する

### グルーピング

ラジオ・チェックボックス群は `fieldset` + `legend` で囲む。

```html
<fieldset>
  <legend>性別</legend>
  <label><input type="radio" name="gender" value="m"> 男性</label>
  <label><input type="radio" name="gender" value="f"> 女性</label>
</fieldset>
```

#### imds コンポーネント利用時

`imds-radio-group` / `imds-checkbox-group` は構造上 `fieldset` / `legend` を使えない。
代わりに `imds-radio-group` / `imds-checkbox-group` の `div` に `role="group"` と `aria-labelledby` を付与し、フィールドラベルの `id` を参照することで同等のグルーピングを実現する。

```html
<div class="imds-field">
  <div class="imds-field-label">
    <span id=":gender:-label">性別</span>
  </div>
  <div class="imds-field-control">
    <div class="imds-radio-group is-horizontal"
         role="group" aria-labelledby=":gender:-label">
      <label class="imds-radio">
        <input type="radio" name="gender" value="m" />
        <span>男性</span>
      </label>
      <label class="imds-radio">
        <input type="radio" name="gender" value="f" />
        <span>女性</span>
      </label>
    </div>
  </div>
</div>
```

- グループラベルは `<label for="...">` ではなく `<span id="...">` にする（`label` の `for` は単一入力にしか効かないため）
- `aria-labelledby` の参照先 `id` とフィールドラベルの `id` を一致させる

## ボタン・リンク

- **クリック可能要素は `button` か `a` を使う**。`div onclick` は禁止
- リンク（画面遷移）は `a`、画面内アクションは `button`
- アイコンのみのボタンは必ず `aria-label` を付ける

```html
<!-- NG -->
<div class="btn" onclick="save()">保存</div>

<!-- OK -->
<button type="button" onclick="save()">保存</button>

<!-- アイコンのみ -->
<button type="button" aria-label="削除">
  <span class="imds-icon imds-icon-trash" aria-hidden="true"></span>
</button>
```

## テーブル

データテーブルには **アクセシブルな名前** を必ず与える。`<th>` には `scope` を必ず指定する。

### アクセシブルな名前の付け方

以下のいずれかの方法で `<table>` にアクセシブルな名前を与える。

| 方法 | 用途 |
|------|------|
| `aria-labelledby="..."` | 画面上の見出し（`<h1>` 等）が既にある場合の **第一選択**。文言の二重管理が不要 |
| `aria-label="..."` | 画面上に対応する見出しが無い場合 |
| `<caption>` | 視覚的にもキャプションを表示したい場合 |

**注意:**
- imds テーマには `<caption>` を視覚的に隠すユーティリティクラス（`sr-only` 相当）が存在しない。
- `<caption>` を使うと表示が崩れるため、imds 環境では原則 `aria-labelledby` または `aria-label` を使用する。

### 推奨パターン: `aria-labelledby` で `<h1>` を参照

```html
<header class="imds-header">
  <div class="imds-header-title">
    <h1 id="page-title">ユーザ一覧</h1>
  </div>
</header>

...

<table aria-labelledby="page-title">
  <thead>
    <tr>
      <th scope="col">ユーザID</th>
      <th scope="col">氏名</th>
      <th scope="col">所属</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">U001</th>
      <td>山田太郎</td>
      <td>営業部</td>
    </tr>
  </tbody>
</table>
```

### その他のルール

- `<th>` には必ず `scope="col"` または `scope="row"` を付ける
- レイアウト目的でテーブルを使わない（CSS Grid / Flexbox を使う）
- 1 ページに同種テーブルが複数ある場合、`aria-labelledby` の参照先 `id` がそれぞれ異なる見出しを指すようにする

## 画像・アイコン

| 種類 | 対応 |
|------|------|
| 意味のある画像 | `<img alt="説明文">` |
| 装飾画像 | `<img alt="">` |
| 意味のあるアイコンフォント | `aria-label` を付与 |
| 装飾アイコンフォント | `aria-hidden="true"` を付与 |
| インライン SVG（意味あり） | `span.imds-icon` に `aria-label` |
| インライン SVG（装飾） | `aria-hidden="true"` |

## ダイアログ・モーダル

確認ダイアログは **`imdsConfirm()` を第一選択** とする（`jssp-presentation-page.md` 参照）。
imds が提供する標準ダイアログは ARIA 属性・フォーカス制御・キーボード操作に対応している。

```javascript
imdsConfirm(
  '削除してもよろしいですか？',
  '削除',
  async () => {
    await deleteItem(id);
  },
  null,
  {
    mode: 'danger',
    okButton: { text: '削除' }
  }
);
```

### やむを得ず自前ダイアログを実装する場合

`imdsConfirm` で実現できない複雑な入力ダイアログ等を自作する場合のみ、以下を満たすこと。

- ダイアログ要素に `role="dialog"` および `aria-modal="true"` を付与
- `aria-labelledby` でタイトル要素、`aria-describedby` で説明要素と関連付ける
- 開いた瞬間に **ダイアログ内の最初のフォーカス可能要素にフォーカスを移動**
- 閉じたら **元のトリガ要素にフォーカスを戻す**
- `Escape` キーで閉じられること
- フォーカスはダイアログ内にトラップ（背後の要素にフォーカスが移らない）

```html
<div role="dialog" aria-modal="true"
     aria-labelledby="dialog-title" aria-describedby="dialog-description">
  <h2 id="dialog-title">削除確認</h2>
  <p id="dialog-description">この操作は取り消せません。続行しますか？</p>
  <button type="button">キャンセル</button>
  <button type="button">削除</button>
</div>
```

## 動的更新（通知）

非同期処理の結果やシステムメッセージなど、**画面遷移を伴わない更新** はスクリーンリーダーに通知する必要がある。

### 第一選択: imui の標準メッセージ関数

`jssp-presentation-page.md` の規約に従い、以下の関数を使用する。
これらは intra-mart のテーマが内部でライブリージョン相当の処理を行う。

| 用途 | 関数 |
|------|------|
| 正常終了通知 | `imuiShowSuccessMessage(message)` |
| 警告（回復可能なエラー） | `imuiShowWarningMessage(message)` |
| エラー（回復不能） | `imuiShowErrorMessage(message)` |

```javascript
// 正常終了
imuiShowSuccessMessage('ユーザ登録に成功しました。');

// エラー（API レスポンスの errorMessage は `[コード] メッセージ` 形式で組み立て済み）
imuiShowErrorMessage(result.errorMessage);
```

これらの imui 関数で表現できる通知については、自前のライブリージョンを作らないこと。

### 自前ライブリージョン（限定用途）

imui 関数で表現できないインライン更新（例: 検索結果件数のヘッダ表示、ステップウィザードの進捗表示）に限り、自前で `aria-live` を持つ要素を配置する。

```html
<!-- 検索結果件数表示 -->
<div id="search-result-count" role="status" aria-live="polite" aria-atomic="true"></div>
```

```javascript
document.getElementById('search-result-count').textContent =
  result.countRow + ' 件見つかりました';
```

- ライブリージョン要素は **ページ初期表示時から DOM に存在** させること（後から `appendChild` しても読まれない）
- `aria-live="polite"` を基本とする。`assertive` はユーザの操作を中断する重大通知のみ
- imui 関数と用途が重複する通知を二重に発しない

## キーボード操作

- `Tab` で論理順にフォーカスが移動すること（`tabindex` の正の値は使わない）
- カスタム UI で操作可能要素には `tabindex="0"` を付与
- フォーカス可能でない領域には `tabindex="-1"`
- フォーカスリング（`:focus` / `:focus-visible`）を CSS で消さない
- ショートカットキーを実装する場合は他のソフトのキーと衝突しない組み合わせにする

## 色・コントラスト

- 情報を **色だけで伝えない**（必須項目を赤色だけで示す等は NG。アイコンや文言を併記）
- 文字色と背景のコントラスト比は **4.5:1 以上**（大文字は 3:1 以上）
- フォーカス表示は周囲とのコントラスト比 3:1 以上

## imds コンポーネント利用時

`jssp-imds-theme` スキルの各 reference に「アクセシビリティ対応」セクションがある。
コンポーネント生成時は対応する reference を参照し、必須属性（`scope`、`for`、`aria-label`、`aria-hidden` 等）を漏れなく付与すること。

| コンポーネント | 参照 reference |
|---------------|---------------|
| テーブル | `imds-html-table.md` |
| テキストボックス | `imds-html-textbox.md` / `imds-html-textbox-control.md` |
| セレクト | `imds-html-select.md` |
| ラジオ | `imds-html-radio.md` / `imds-html-radio-group.md` |
| チェックボックス | `imds-html-checkbox.md` / `imds-html-checkbox-group.md` |
| トグル | `imds-html-toggle.md` |
| メニュー | `imds-html-menu.md` |
| アコーディオン | `imds-html-accordion.md` |
| 確認ダイアログ | `imds-csjs-confirm.md` |
| 画像・アイコン | `imds-html-img.md` / `imds-html-icon-font.md` / `imds-html-inline-svg.md` |

## チェックリスト

### ページ構造

- [ ] ルートが `<div id="container"><div class="imds-container"><main>...</main></div></div>` の構造になっているか
- [ ] `<main>` がページに 1 つだけ、かつ `role="main"` を併記していないか
- [ ] 見出しが `h1` → `h2` → `h3` の順で階層を飛ばしていないか

### フォーム

- [ ] すべての入力要素に `label` が関連付けられているか（`for` / `id`）
- [ ] アイコンのみのボタンに `aria-label` または `title` があるか
- [ ] 必須項目に `required` / `aria-required` が指定されているか
- [ ] エラー時に入力要素へ `aria-invalid="true"` を付与し、解除時に除去しているか
- [ ] エラーメッセージ要素 (`.imds-error-text`) に `id` を付け、入力要素から `aria-describedby` で関連付けているか
- [ ] ラジオ・チェックボックス群が `fieldset` + `legend` で囲まれているか（imds 利用時は `role="group"` + `aria-labelledby` で代替されているか）

### 操作

- [ ] クリック可能要素が `button` / `a` で実装されているか（`div onclick` 禁止）
- [ ] キーボードのみで全機能が操作できるか
- [ ] フォーカスリングを CSS で消していないか
- [ ] `tabindex` に正の値を使っていないか

### テーブル

- [ ] `<table>` に `aria-labelledby`（既存見出しを参照）/ `aria-label` / `<caption>` のいずれかでアクセシブルな名前が与えられているか
- [ ] imds 環境では `<caption>` を使わず `aria-labelledby` または `aria-label` を使用しているか
- [ ] `th` に `scope` 属性が指定されているか
- [ ] レイアウト目的でテーブルを使っていないか

### 画像・アイコン

- [ ] 意味のある画像に `alt` 属性があるか
- [ ] 装飾画像に `alt=""` または `aria-hidden="true"` が指定されているか

### ダイアログ

- [ ] 確認ダイアログは `imdsConfirm()` を使用しているか
- [ ] 自前ダイアログを実装する場合、`role="dialog"` / `aria-modal="true"` / `aria-labelledby` が付与されているか
- [ ] 自前ダイアログの開閉時にフォーカス制御（移動・復帰・トラップ）が実装されているか
- [ ] 自前ダイアログが `Escape` キーで閉じられるか

### 動的更新

- [ ] システム通知は `imuiShowSuccessMessage` / `imuiShowWarningMessage` / `imuiShowErrorMessage` を使用しているか
- [ ] imui で表現できないインライン更新（検索結果件数等）に限り `role="status"` / `aria-live` を使用しているか
- [ ] 自前ライブリージョン要素は初期表示時から DOM に存在するか

### 色

- [ ] 情報を色だけで伝えていないか
- [ ] コントラスト比が 4.5:1 以上か

## 関連

- `.github/instructions/jssp-presentation-page.instructions.md` - プレゼンテーションページの基本構造
- `.github/skills/jssp-localize-support/` 関連 - 多言語化（読み上げ言語）
- `.github/skills/jssp-imds-theme/reference/` - imds コンポーネント別のアクセシビリティ対応
