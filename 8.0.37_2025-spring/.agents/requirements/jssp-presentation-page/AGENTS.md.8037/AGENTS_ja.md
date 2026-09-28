# プレゼンテーションページ規約

> **適用範囲**: 🟢 **常時** — プレゼンテーションページ（`.html`）を生成する際に適用。HTML 構造、バリデーション、id 命名規約等。

## プレゼンテーションページの標準実装方針

### 基本構造

```html
<!-- ヘッダ -->
<imart type="head">
  <!-- タイトル -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart>
  </title>
  <!-- セキュアトークン -->
  <meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">
  <!-- プレゼンテーションページの独自スタイル -->
  <style>
    /* TODO: ここにカスタムスタイルを追加します */
    .button-spacing {
      display: flex;
      gap: 3em;
    }
  </style>
  <!-- プレゼンテーションページのスクリプト（$data をグローバル領域に置かず IIFE でスコープ化する） -->
  <script>
  (function($data) {
    // ページロード後の処理
    document.addEventListener('DOMContentLoaded', () => {
      // セキュアトークン取得
      function getSecureToken() {
        return document.querySelector('meta[name=im_secure_token]').content;
      }

      // 画面の初期表示
      function initializeView(result) {
        // TODO: ここに画面の初期化処理を追加します
      }

      // バリデーションの表示初期化
      function clearValidationError() {
        // TODO: ここにバリデーションの表示初期化処理を追加します
      }

      // バリデーションエラー表示
      function showValidationError(errors) {
        // TODO: ここにバリデーションエラーの画面表示処理を追加します
      }

      // バリデーション（ロジックをここに集約）
      function getValidationErrors() {
        // TODO: ここにバリデーション実行処理を追加します
        return [];
      }

      // リクエストパラメータを作成
      function createRequest() {
        // TODO: ここにリクエストパラメータを作成する処理を追加します
        return {
          foo: document.getElementById(':foo:').value,
          bar: document.getElementById(':bar:').value
        };
      }

      // バリデーションエラーのリセット
      function resetValidationError() {
        clearValidationError();
        const errors = getValidationErrors();
        if (errors.length > 0) {
          showValidationError(errors);
          return false;
        } else {
          return true;
        }
      }

      // 登録処理、その他ビジネスロジック
      async function register(request) {
        // TODO: ここにデータ登録処理を追加します
      }

      // イベント処理
      document.getElementById('register-button').addEventListener('click', () => {
        // TODO: ここにイベント処理を追加します
      });

      // エントリーポイント
      clearValidationError();
      if ($data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      } else {
        initializeView($data.result);
      }
    });
  })(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
  </script>
</imart>

<!-- ページ全体のコンテナ（intra-mart テーマが出力する <div id="imui-container"> の内側に配置されるため、画面側で id は付与しない。class は使用する UI テーマの規約に従う） -->
<div>
  <main>
    <!-- メインコンテンツ -->
  </main>
</div>
```

### 実装方針

- 追加で必要な JavaScript と CSS は、<imart type="head"> タグ内にインラインで実装する
  - 標準的な CSS は intra-mart のテーマで設定済みのため、ここでは別途設計書で指示されたものだけ定義する
  - 明確な見た目の変更指示がない場合は、CSS を定義してはならない
- 必要な JavaScript ライブラリは、<imart type="head"> タグ内に <script> タグで追加する
  - ただし、極力ライブラリは採用せず、vanilla JavaScript で実装できる場合は、vanilla で実装する
  - Microsoft Edge, Chrome, Safari で動作するコードにする
- ルートタグは `<div>` とし、**画面側で `id` 属性を付与しない**
  - intra-mart のテーマ機能により、プレゼンテーションページの内容は常に `<div id="imui-container">` の内側へ自動的に配置される。画面側で重ねて `id="container"` を付与すると `<div id="imui-container"><div id="container">...</div></div>` という無駄な二重ラッパーになるため、付与しない
  - ルートタグの `class` は、プロジェクトで採用する UI テーマの規約に従う（本ページは特定の UI テーマに依存しない基本規約のため、具体的なクラス名はここでは規定しない）。**imds テーマを使用する場合は** `.agents/skills/jssp-imds-theme` の規約に従い `class="imds-container"` を付与する。UI テーマを使用しない場合は class 自体不要
  - 必要なタグは、ルートタグ配下にすべて実装する
  - **例外**: 同一ポータル画面にポートレット（部品）として複数配置されうる画面に限り、ルートタグに `id="app-portlet-{機能ID}-container"` を付与する（詳細は `.agents/skills/jssp-page-generator/assets/simple-portlet.md` 参照）
- DOM 操作でルート要素を特定する必要がある場合（React.js / Vue.js のマウント先指定、直接 DOM 操作でのスコープ限定等）は、通常画面では `document.getElementById('imui-container')` を使用する
  - **注意**: intra-mart の一部ポータル構成ではポートレットが iframe で分離されないケースがある。同一ページ内に他画面の DOM が同居しうるため、`document.querySelectorAll()` 等をページ全体に対して無制限に行わず、必ず自画面のルート要素（`imui-container` またはポートレットの `app-portlet-{機能ID}-container`）配下に限定して DOM 操作を行うこと
- <imart> タグの value 属性は、ダブルクォートで囲んではならない
- ページロード時の初期化処理は、`DOMContentLoaded` イベントを使用する

### 変数宣言

プレゼンテーションページ内の JavaScript はブラウザで実行されるため、Rhino の制約は適用されない。
`jssp-code-style.md` の `const` 制限はファンクションコンテナ（`.js`）専用であり、HTML 内スクリプトには適用しないこと。

- **再代入しない変数**: `const` を使用する
- **再代入する変数**: `let` を使用する
- `var` は使用しない

```javascript
// 良い例
const token = getSecureToken();        // 再代入なし → const
const roomList = result.roomList || []; // 再代入なし → const
let participants = [];                  // 後で再代入 → let
let activeValidation = false;           // 後で再代入 → let

// 悪い例
let token = getSecureToken();           // 再代入しないのに let
var participants = [];                  // var は使用しない
```

### imart タグの制約

`<imart>` タグは通常の HTML タグとは異なり、属性値のクォーテーションに厳密なルールがある。

| 属性の種類 | ダブルクォート | 例 |
|-----------|:---:|-----|
| type, escapeXml, escapeJs 等の固定値属性 | 必須 | `type="string"` |
| value 等のバインド変数属性 | 禁止 | `value=$data` |

#### 1. バインド変数以外の属性値は、必ずダブルクォート（`"`）で囲む

シングルクォート（`'`）やクォートなし（バインド変数を除く）は使用してはならない。

悪い例:
```html
<imart type='string' escapeXml='true' escapeJs='false'>  <!-- シングルクォート NG -->
<imart type=string escapeXml=true escapeJs=false>         <!-- クォートなし NG -->
```

良い例:
```html
<imart type="string" escapeXml="true" escapeJs="false">   <!-- ダブルクォート OK -->
```

#### 2. バインド変数（value 属性）は、ダブルクォートで囲んではならない

バインド変数は `$` プレフィックス付きの変数名をそのまま記述する。

悪い例:
```html
<imart type="string" value="$data" escapeXml="false" escapeJs="false" />  <!-- NG -->
```

良い例:
```html
<imart type="string" value=$data escapeXml="false" escapeJs="false" />    <!-- OK -->
```

## バインド変数の使用方法

### 単なる文字列の出力で使用する場合

```html
<title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></title>
```

- <imart> タグの value 属性は、ダブルクォートで囲んではならない
- `escapeXml` 属性は必ず `true` に設定する
  - 脆弱性防止のため
- `escapeJs` 属性は必ず `false` に設定する
  - 不要なエスケープによって文字列が破壊されるため
- <script> タグ内で <imart> タグを使用する場合は、以下の「JSON を埋め込む場合」または「JavaScript の文字列リテラルとして使用する場合」のパターンに従うこと

### JSON を埋め込む場合

`$data` はグローバル変数として定義せず、即時実行関数（IIFE）の引数として渡し、スコープ内に閉じ込める（後述の「バインド変数 `$data` のスコープ化（IIFE）」を参照）。

```javascript
(function($data) {
  // ここに $data を参照する処理を実装する
})(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
```

- <imart> タグの value 属性は、ダブルクォートで囲んではならない
- `escapeXml` 属性は必ず `false` に設定する
  - 不要なエスケープによって JSON が破壊されるため
- `escapeJs` 属性は必ず `false` に設定する
  - 不要なエスケープによって JSON が破壊されるため

### JavaScript の文字列リテラルとして使用する場合

```javascript
let value = '<imart type="string" value=$imwSystemMatterId escapeXml="false" escapeJs="true"></imart>';
```

- `escapeXml` 属性は必ず `false` に設定する
  - `<script>` 内では HTML パーサーが通らないため、XML エスケープは不要
- `escapeJs` 属性は必ず `true` に設定する
  - 値にクォートやバックスラッシュ等の JS 特殊文字が含まれる場合にエスケープが必要

**注意**: `escapeXml="true" escapeJs="false"` にすると、値に `&` や `<` が含まれる場合に `&amp;` 等に変換され、JavaScript の文字列として不正になる

### 処理順序

プレゼンテーションページの表示は、以下の順序で行われる。

1. サーバ側から処理が開始する
2. ファンクションコンテナの初期処理（init 関数）を実行する
3. バインド変数 `$data` に処理結果をバインドする
4. プレゼンテーションページの HTML を生成する
   - このとき <imart> タグが解釈され動的に HTML ソースが生成される
   - `$data` にバインドされた JSON 文字列が、そのまま HTML 内に出力される
5. クライアントへレスポンスを送信する
6. レスポンスを受け取ったクライアント側（ブラウザ等）へ処理が移動する
7. DOMContentLoaded でブラウザ側の初期化処理を実行する

## バインド変数 `$data` のスコープ化（IIFE）

### 適用条件

**全ての画面で適用する。** 通常の 1 画面単独表示の画面、ポータル画面のポートレット（部品）として複数配置される画面の別を問わず、以下の IIFE パターンを使用する。

### 理由

`const $data = <imart>...</imart>;` を独立した `<script>` タグでそのまま定義すると、`$data` はグローバル変数になる。1 画面が単独で表示される限りは問題にならないが、同一ポータル画面に同じ画面（ポートレット）が複数配置されると、後から読み込まれたインスタンスの `$data` が先に読み込まれたインスタンスの `$data` を上書きしてしまい、意図しない表示になる。全画面で IIFE スコープ化を標準にしておくことで、後から画面をポートレット化する際にも改修が不要になり、グローバル名前空間の汚染も避けられる。

### 実装パターン

```html
<script>
(function($data) {
  document.addEventListener('DOMContentLoaded', () => {
    // TODO: ここに画面の初期化処理を追加します（$data を参照する）
  });
})(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
</script>
```

- `const $data = <imart>...</imart>;` を独立した `<script>` タグとして書く旧パターンは使わず、即時実行関数（IIFE）の引数として `$data` を渡す
- IIFE の引数として渡す場合も `escapeXml="false" escapeJs="false"` という値は変更しない（`<script>` 内で JSON をそのまま出力する「JSON を埋め込む場合」と同じ判定基準のため）
- `DOMContentLoaded` イベントリスナーや `initializeView` 等の処理はすべて IIFE 内に含め、`$data` 以外のローカル変数・関数もスコープ内に閉じ込める
- 基本構造の詳細は本ページ冒頭の「基本構造」を参照。ポートレット固有の追加事項（ヘッダ・フッタの省略等）は `.agents/skills/jssp-page-generator/assets/simple-portlet.md` を参照すること

### 注意: 要素 id の衝突

IIFE 化によって `$data` の衝突は防げるが、`id="xxx-table"` 等の要素 id は依然として画面ごとに固定のままである。ポータル側が同一 DOM 内に複数インスタンスをそのまま並べる方式（iframe で分離されない方式）の場合、id の重複により `document.getElementById()` が最初のインスタンスの要素しか返さない問題が起こりうる。

ルートタグへの `id="app-portlet-{機能ID}-container"` 付与（前述）は、**異なるポートレット同士**が同一ページに配置された場合の DOM スコープ分離には有効だが、**同一ポートレットが同一ページに複数配置されるケース**は、両インスタンスが同一の HTML ソースから描画されるため `{機能ID}` も同じ値になり、この方式だけでは id 重複を解決できない。同一ポートレットの複数配置を許容する運用の場合は、この制約を許容した上で運用するか、別途インスタンス単位の一意化（ポータル側から渡されるインスタンス識別子の付与等）を個別に検討すること。

## maxlength 属性の使用方針

- `maxlength` 属性は一律使用しない
- 文字数制限はすべてバリデーションエラーメッセージとしてユーザに明示する
- `maxlength` で入力を無言で打ち切ると、ユーザは文字数制限に気づけず、ペースト時に文字列が切れる問題がある

## id 属性の命名規約

要素種別ごとに id 属性の命名パターンを使い分ける。判断軸は **「JavaScript からのアクセス頻度」と「グローバル名前空間汚染リスク」** で、リスクが高いほどコロン `:` で囲む（コロンは JS 識別子として無効なため、`window.xxx` 経由でのアクセスができなくなる）。

| 要素種別 | id パターン | 例 | 補足 |
|---------|------------|-----|------|
| **入力要素**（input / select / textarea） | **`:fieldName:`**（コロン必須） | `id=":userName:"` | `.value` 等で頻繁にアクセス。コロンで `window.userName` のようなグローバル変数化を防ぐ |
| **エラー span**（`-error` サフィックス） | **`:fieldName:-error`** | `id=":userName:-error"` | 入力要素 id との対応性を視覚的に保つため `:` を維持 |
| **常時必須ラベル span**（accessibility 用、`-label` サフィックス） | **`:fieldName:-label`** | `id=":locationType:-label"` | `aria-labelledby` の参照対象。常時必須なので `imds-required-label-required` を **静的に付与**し、JS での動的制御は **不要** |
| **条件付き必須ラベル**（`-label` サフィックス、動的制御対象） | **`fieldName-label`**（コロンなし） | `id="locationDetail-label"` | `imds-required-label-required` を **静的には付与しない**。`toggleRequiredMark(id, condition)` で動的に付け外しする |
| **ボタン**（`-button` サフィックス） | **`xxx-button`**（コロンなし） | `id="apply-button"` | ハイフン含むのでグローバル汚染なし。`.value` 等のプロパティアクセスもしない |
| **ダイアログ**（`-dialog` サフィックス） | **`xxx-dialog`**（コロンなし） | `id="user-select-dialog"` | 同上 |
| **フォーム**（`-form` サフィックス） | **`xxx-form`**（コロンなし） | `id="main-form"` | 同上 |
| **通常画面のルートコンテナ** | id 付与なし | `<div>`（id なし。class は使用する UI テーマの規約に従う。例: imds テーマ使用時は `class="imds-container"`） | intra-mart テーマが `<div id="imui-container">` で画面内容を自動的に包むため、画面側で id を重ねて付与しない |
| **ポートレット画面のルートコンテナ** | **`app-portlet-{機能ID}-container`**（コロンなし） | `id="app-portlet-imds_demo-container"` | 同一ポータル画面に複数の異なるポートレットが配置された場合に、DOM 操作のスコープを画面ごとに区別するため。**{機能ID}** は画面のフォルダ名（機能名）を使用する。ただし同一ポートレットが同一ページに複数配置されるケースの id 重複までは解決しない（後述「注意: 要素 id の衝突」参照） |

### ラベル span の使い分け（常時必須 vs 条件付き必須）

**常時必須**（accessibility 用 id 付き）の例:

```html
<div class="imds-field-label">
  <span id=":locationType:-label"
        class="imds-required-label-required"
        data-required-label="必須">利用場所</span>
</div>
<div class="imds-field-control">
  <div id=":locationType:"
       class="imds-radio-group is-horizontal"
       role="group"
       aria-labelledby=":locationType:-label">
    ...
  </div>
</div>
```

ポイント:
- `imds-required-label-required` クラスを **HTML に静的付与**
- `aria-labelledby` で参照される id は **`:fieldName:-label`** 形式
- JS で `toggleRequiredMark()` を呼ぶ必要は **ない**

**条件付き必須**（動的制御対象）の例:

```html
<div class="imds-field-label">
  <label for=":locationDetail:" id="locationDetail-label">利用場所詳細</label>
</div>
<div class="imds-field-control">
  <input type="text" id=":locationDetail:" class="imds-textbox" />
</div>
```

```javascript
function toggleLocationDetailRequired() {
  const label = document.getElementById('locationDetail-label');
  if (getSelectedLocationType() === 'external') {
    label.classList.add('imds-required-label-required');
    label.setAttribute('data-required-label', '必須');
  } else {
    label.classList.remove('imds-required-label-required');
    label.removeAttribute('data-required-label');
  }
}
```

ポイント:
- 初期 HTML では `imds-required-label-required` クラスを **付与しない**
- id は **`fieldName-label`**（コロンなし）形式
- JS で条件に応じて `classList.add/remove` で動的制御

### validator での検出

`jssp-page-generator/scripts/validate-jssp-code.js` の `JSSP-HTML-018` ルールは、上記の命名規約に基づいて誤検知を回避する:

- `id` が `:fieldName:-label` 形式 → **accessibility 用とみなしチェック対象外**
- `id` が `fieldName-label` 形式 → **`toggleRequiredMark()` 呼び出しチェックの対象**

## 日付入力・日時入力（imuiCalendar）

日付入力には `<input type="date">` ではなく `<imart type="imuiCalendar">` を使用する。
使用方法・属性・注意事項・日時入力（日付 + 時刻の組み合わせ）パターンは `.agents/skills/jssp-imds-theme/reference/imui-html-calendar.md` を参照すること。

## 入力フィールドの幅制御

入力フィールドは、内容に応じた適切な幅を指定すること。
未指定の場合、親要素の全幅に広がり、項目内容に対して不自然に大きくなる。

| フィールド種別 | 幅制御方法 | 目安 |
|--------------|----------|------|
| 日付入力（imuiCalendar） | `style="max-width: 10em;"` | `yyyy-MM-dd` 形式に適合する幅 |
| 時刻入力（input type="time"） | `style="max-width: 8em;"` | HH:mm 形式に適合する幅 |
| セレクトボックス | サイズクラス（`is-small` 等）または `max-width` | 最長の選択肢が収まる幅（例: `max-width: 15em;`） |
| 短いテキスト入力（コード、番号等） | サイズクラスまたは `max-width` | 想定される入力文字数に適合する幅 |
| 長いテキスト入力（名前、説明等） | 指定不要（デフォルト全幅） | - |
| テキストエリア | 指定不要（デフォルト全幅） | - |

### アンチパターン: カスタム `.max-width-NNem` / `.min-width-NNem` クラスを定義しない

幅指定のために `<style>` ブロック内に `.max-width-12em { max-width: 12em; }` や `.min-width-8em { min-width: 8em; }` 等のカスタムクラスを定義してはならない。
imds の既定スタイル（例: `.imds-textbox`、`.imds-button`）と CSS 詳細度が同等になるため、定義順次第で上書きできず、回避策として `!important` を多用することになる。

```css
/* NG: カスタムクラスでの幅指定 */
.max-width-12em { max-width: 12em; }
.max-width-20em { max-width: 20em; }
.min-width-8em  { min-width: 8em; }
```

```html
<!-- NG: カスタムクラスで幅指定 → imds-textbox / imds-button に上書きされうる -->
<input type="text" class="imds-textbox max-width-12em" />
<button type="button" class="imds-button is-primary min-width-8em">申請</button>

<!-- OK: インライン style は詳細度がクラスより上位なので !important 不要で勝つ -->
<input type="text" class="imds-textbox" style="max-width: 12em;" />
<button type="button" class="imds-button is-primary" style="min-width: 8em;">申請</button>
```

幅が複数箇所で同じ値になり DRY が気になる場合でも、まずインライン `style` で素直に書く。それでも重複が増えてきたら、CSS 変数（`--w-input-date: 12em;`）等の高詳細度の解決策を検討する。

このルールは `max-width` / `min-width` / `width` / `height` 等の **寸法系プロパティ全般** に適用する（imds 既定と衝突する可能性が高いため）。

## getValidationErrors 関数の実装パターン

クライアントサイドのバリデーション関数。DOM から直接値を読み取り、エラー配列を返す。
`resetValidationError()` と `validateCurrentStep()` の両方から呼ばれるため、ここにロジックを集約する。

### 基本構造

```javascript
function getValidationErrors() {
  const errors = [];
  // 各フィールドのバリデーションを実行
  return errors;
}
```

### 検証パターン

#### 必須チェック

```javascript
const value = document.getElementById(':fieldName:').value;
if (!value || value.length === 0) {
  errors.push({ name: 'fieldName', message: 'fieldName は必須です。' });
}
```

#### 必須 + 文字列長チェック（複合）

```javascript
const userCode = document.getElementById(':userCode:').value;
if (!userCode || userCode.length === 0) {
  errors.push({ name: 'userCode', message: 'ユーザコードは必須です。' });
} else if (userCode.length > 100) {
  errors.push({ name: 'userCode', message: 'ユーザコードは最大100文字です。' });
}
```

その他のパターン（数値・正規表現・メール・日付形式・任意項目等）は `.agents/skills/jssp-page-generator/assets/simple-form.md` の「バリデーションパターン集」を参照すること。

### 実装方針

- エラーが見つかっても配列に追加して次のフィールドのチェックを続行する（全エラーを一度に表示するため）
- チェックの順序: 必須 → 桁数 → フォーマット → 他フィールドとの相関
- 厳密等価演算子（`===`）を使用する

## バリデーションの実行タイミング

### 基本構造

- 画面初回表示時は、入力エラーがあっても、バリデーションエラーを表示しない
- 「申請」「実行」ボタン押下時など、初回にバリデーションチェックを行って、エラーがあった場合は、その時点から各入力要素の入力内容が変更されたタイミングで、再度バリデーションチェックを行う

### 実装方針

アーキテクチャの概要（完全実装は `.agents/skills/jssp-page-generator/assets/simple-form.md` を参照）:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  let activeValidation = false; // 初回表示時はエラー非表示

  function clearValidationError() {
    document.querySelectorAll('.imds-field.imds-validation-error').forEach((el) => el.classList.remove('imds-validation-error'));
    document.querySelectorAll('.imds-error-text').forEach((el) => { el.style.display = 'none'; });
  }
  function showValidationError(errors) {
    errors.forEach((error) => {
      const field = document.querySelector(`.imds-field[for=":${error.name}:"]`);
      if (field) field.classList.add('imds-validation-error');
      const msg = document.querySelector(`.imds-error-text[for=":${error.name}:"]`);
      if (msg) { msg.textContent = error.message; msg.style.display = ''; }
    });
    activeValidation = true; // 以降はリアルタイム再バリデーション
  }
  function getValidationErrors() { /* バリデーションロジックを1箇所に集約 */ return []; }
  function resetValidationError() { clearValidationError(); showValidationError(getValidationErrors()); }
  function validateCurrentStep() {
    clearValidationError();
    const errors = getValidationErrors();
    if (errors.length > 0) { showValidationError(errors); return false; }
    return true;
  }

  // テキスト入力: "input" / セレクト・日付・チェックボックス: "change"
  [':textField:'].forEach((id) => { document.getElementById(id).addEventListener('input', () => { if (activeValidation) resetValidationError(); }); });
  [':selectField:'].forEach((id) => { document.getElementById(id).addEventListener('change', () => { if (activeValidation) resetValidationError(); }); });
});
```

### プログラム的に値がセットされるフィールドの注意

リアルタイム再バリデーションは、ユーザ操作によって発火するネイティブの `input`/`change` イベントに依存している。
しかし、以下のコンポーネントはプログラム的に値をセットするため、ネイティブイベントが発火せず再バリデーションが動作しない。

#### imuiCalendar（altField）

`imuiCalendar` の `altField` オプションは、jQuery の `.val()` で DOM プロパティ (`element.value`) をセットする。
`.val()` はネイティブの `change` イベントを発火しないため、`Object.defineProperty` で `value` プロパティのセッターをオーバーライドし、`change` イベントを発行する。

```javascript
// imuiCalendar の altField 対象フィールドに対して適用する
[':dateField1:', ':dateField2:'].forEach((id) => {
  const el = document.getElementById(id);
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  Object.defineProperty(el, 'value', {
    get: function () {
      return descriptor.get.call(this);
    },
    set: function (val) {
      descriptor.set.call(this, val);
      this.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  el.addEventListener('change', () => {
    if (activeValidation) {
      resetValidationError();
    }
  });
});
```

#### グローバルスコープのコールバック関数（imACMSearch 等）

`imACMSearch`（IM-共通マスタ検索）のコールバック関数はグローバルスコープに定義する必要がある。
`DOMContentLoaded` 内の `activeValidation` や `resetValidationError` にはスコープの関係で直接アクセスできないため、`window._resetValidationError` として再バリデーション関数を公開し、コールバック内から呼び出す。

```javascript
// DOMContentLoaded 内で公開
window._resetValidationError = () => {
  if (activeValidation) {
    resetValidationError();
  }
};

// グローバルスコープのコールバック関数内
function callbackXxxSearch(result) {
  // ... 値セット処理 ...
  if (window._resetValidationError) {
    window._resetValidationError();
  }
}
```

## ハイパーリンク等で画面遷移する場合の URL 指定

### 実装方針

- ハイパーリンクや、同じホスト内の REST-API を呼び出す場合は、コンテキストパス配下を相対パスで指定する
  - 例: `http://127.0.0.1/imart/foo/bar` にアクセスする場合、URL 指定は `foo/bar` とする
- この相対パスは、ルーティング設定ファイルに定義した `file-mapping` タグの `path` 属性で、先頭の `/` を除去したものと一致する
  - 例： ルーティング設定ファイルが `<file-mapping path="/sample/user/list" page="sample/user/user_list">` の場合、プレゼンテーションページ `sample/user/user_list` を開く URL は `sample/user/list` と指定すること

### コンテキストパス

- コンテキストパスとは、ホスト名・ポート番号・デプロイ先のルートディレクトリ名で構成されている URL のこと
  - 例: `http://127.0.0.1/imart/`
- `<imart type="head">` タグによって、コンテキストパスが `<base>` タグに指定されているため、URL 指定時はコンテキストパス以降のパスを相対で指定することを推奨

## API の呼び出し

### 基本実装

```javascript
async function register(request) {
  // サーバ側へ送信
  const response = await fetch('sample/simple_form/api/register', {
    method: 'POST',
    headers: {
      'X-Intramart-Secure-Token': getSecureToken()
    },
    body: new URLSearchParams(request)
  });

  // レスポンス（API は 4xx/5xx でも {error: true, errorMessage} 形式の JSON を返す想定）
  // プロキシエラー等で JSON 以外が返ったときは null にフォールバックする
  const result = await response.json().catch(() => null);
  if (!result) {
    imuiShowErrorMessage('システムエラーが発生しました。');
    return false;
  }
  if (result.error) {
    imuiShowErrorMessage(result.errorMessage);
    return false;
  }

  imuiShowSuccessMessage('ユーザ登録に成功しました。');
  return true;
}
```

### 実装方針

- REST-API の呼び出しは `fetch` を使用する
- method は基本的に `POST` を使用する
- headers には、キー `X-Intramart-Secure-Token` でセキュアトークンを設定する
  - トークンを使用するかどうかは、API の実装側にまかせる
  - クライアントでは、使用有無にかかわらず、リクエストヘッダに設定する
- body には、API が想定する Content-Type によって変更する
  - Content-Type が application/x-www-form-urlencoded を想定している場合、リクエストパラメータを `URLSearchParams` で指定する
  - Content-Type が application/json を想定している場合、リクエストパラメータを `JSON.stringify()` で指定する
- 非同期処理は Promise を使用し、`async`, `await` を使用してコードを見やすくする
- レスポンス形式は `{error: bool, data | errorMessage}`（→ `jssp-error-handling.md`「API レスポンスの構造（JSON）」）
  - `result.error` で分岐し、エラー時は `result.errorMessage`（`[コード] メッセージ` 形式）をそのまま表示する
  - HTTP ステータスコード（200 / 400 / 405 / 500）は API 側が設定する。クライアントでは個別判定せず、`result.error` のみで判定する
- 正常終了時は `imuiShowSuccessMessage()` で処理完了メッセージを表示する
- エラー発生時は `imuiShowErrorMessage()` でエラーメッセージを表示する

## イベント

### 基本実装

```javascript
// リクエストパラメータを作成
function createRequest() {
  return {
    userCode: document.getElementById(':userCode:').value,
    userFirstName: document.getElementById(':userFirstName:').value,
    userLastName: document.getElementById(':userLastName:').value,
    age: document.getElementById(':age:').value
  };
}

document.getElementById('register-button').addEventListener('click', () => {
  // パラメータ情報の作成
  const request = createRequest();

  // バリデーション実行
  if (!resetValidationError()) return;

  // 確認メッセージ
  imdsConfirm(
    '登録してもよろしいですか？',     // メッセージ
    '登録',                         // ダイアログのタイトル
    async () => {                   // OKボタンクリック時の処理
      const isSuccess = await register(request);
      if (isSuccess) {
        clearValidationError();
      }
    }
  );
});
```

### 実装方針

- イベントは `addEventListener()` で定義する
- リクエストパラメータ情報の作成時は、使用を指定されている JavaScript ライブラリによって取得方法を変更する
  - React.js, Vue.js 等の JavaScript ライブラリ使用を指定されている場合は、state から取得する
  - 上記以外の場合は vanilla JavaScript の標準的な DOM 解決方法で取得する
- リクエストパラメータのバリデーションチェックを行う
  1. `clearValidationError()` で画面上のバリデーションエラーを解除する
  2. `getValidationErrors()` でバリデーションチェックを実行する
  3. バリデーションチェックでエラーがある場合、`showValidationError()` でバリデーションエラーを表示し終了する
- 確認メッセージを表示する場合は、`imdsConfirm()` を使用する
- `imdsConfirm()` の第5引数 `options` で、操作内容に応じた `mode` を必ず指定する
  - `info`（デフォルト）: 通常の確認（登録、検索など）
  - `warning`: UNDO できないデータ更新の確認
  - `danger`: データ削除の確認（`okButton.text` に「削除」を指定すること）
- OKボタンクリック時、第3引数のコールバックが実行される
  1. API を呼び出す
  2. API 処理が成功した場合、`clearValidationError()` で画面上のバリデーションエラーを解除する

## Enter キーイベントの実装

### IME 対応（必須）

日本語 IME で変換中に Enter を押すと `event.key === 'Enter'` が発火する。
この状態でフォーム送信や検索などの処理を実行すると、変換確定操作が誤って処理を起動してしまう。
**Enter キーイベントを拾う場合は必ず `!event.isComposing` を条件に加えること。**

```javascript
textarea.addEventListener('keydown', (event) => {
  if (
    event.key === 'Enter' &&
    !event.isComposing &&   // IME 変換中（未確定状態）でない ← 必須
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    !event.metaKey
  ) {
    event.preventDefault();
    // 処理
  }
});
```

`event.isComposing` は `compositionstart` ～ `compositionend` の間（IME で文字が未確定の状態）は `true` になる。変換確定後の Enter では `false` になる。

### 修飾キーの組み合わせ

| ユースケース | 条件 | 備考 |
|-------------|------|------|
| textarea で単独 Enter を拾う | `key==='Enter' && !isComposing && !ctrlKey && !shiftKey && !altKey && !metaKey` | 改行が不要なケースのみ |
| Ctrl+Enter で送信（改行を維持） | `key==='Enter' && !isComposing && ctrlKey && !shiftKey && !altKey && !metaKey` | 複数行コメント等で推奨 |

## エラーメッセージ表示パターン

### エラーメッセージの表示

処理が中断し、回復できないエラーを表示する場合は、`imuiShowErrorMessage` を使用する

```javascript
imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
```

### 警告メッセージの表示

処理が中断し、回復できるエラーを表示する場合は、`imuiShowWarningMessage` を使用する

```javascript
imuiShowWarningMessage([$data.error.code, $data.error.message].join('\n'));
```
