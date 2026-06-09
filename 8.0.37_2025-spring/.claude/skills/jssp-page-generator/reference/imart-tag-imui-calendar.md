---
paths:
  - "src/main/jssp/**/*.html"
---

# IMART imuiCalendar タグ リファレンス

## 概要

`<imart type="imuiCalendar">` は、日付選択カレンダーコンポーネントを提供するタグである。
テキストボックスと連携し、カレンダーから日付を選択して入力できる。

### 表示モード

| モード | `floatable` | 動作 | 推奨 |
|--------|------------|------|------|
| **フローティングモード** | `true` | テキストボックスにフォーカスまたはボタンクリックでカレンダーが表示される | **標準（常にこちらを使用）** |
| インラインモード | `false` | カレンダーがタグの位置に常時表示される | 複数日選択等の特殊用途のみ |

**重要: 日付入力フォームでは必ず `floatable="true"` を指定すること。**
`floatable` を省略するとインライン表示になり、テキストボックス＋カレンダーアイコンの標準 UI にならない。

## 属性一覧

### 主要属性

| 属性 | 型 | デフォルト | 説明 |
|------|------|-----------|------|
| floatable | Boolean | false | 表示モード。`true` = フローティング、`false` = インライン |
| altField | String | - | 連携するテキストボックス要素のセレクタ |
| format | String | AccountContext の入力日付フォーマット | 日付フォーマット。`yyyy/MM/dd` 等 |
| id | String | 自動生成 | インラインモード時のカレンダー要素の ID |
| defaultDate | String/Date | サーバの今日 | 初期表示日付 |
| minDate | String/Number/Date | 1970/01/01 | 選択可能な最小日付 |
| maxDate | String/Number/Date | 2999/12/31 | 選択可能な最大日付 |

### 表示制御属性

| 属性 | 型 | デフォルト | 説明 |
|------|------|-----------|------|
| showOn | String | `both` | カレンダー表示トリガー: `focus`, `button`, `both` |
| showButtonPanel | Boolean | false | ボタンパネル（今日・閉じる）の表示 |
| showAnim | String | `fadeIn` | 表示アニメーション: `show`, `slideDown`, `fadeIn`, `""` |
| buttonImage | String | `ui/images/calendar_btn.png` | カレンダーボタンのアイコン画像パス |
| buttonImageOnly | Boolean | true | 画像のみ表示（false の場合ボタン内に画像表示） |
| numberOfMonths | Number/Array | 1 | 表示月数。配列で `[行, 列]` 指定可 |
| changeMonth | Boolean | false | 月をドロップダウンで選択可能にする |
| changeYear | Boolean | false | 年をドロップダウンで選択可能にする |
| yearRange | String | `c-10:c+10` | 年ドロップダウンの範囲。相対: `c-10:c+10`、絶対: `2010:2020` |
| firstDayOfWeek | Number | AccountContext の値 | 週の開始曜日。0（日）〜 6（土） |
| disabled | Boolean | false | カレンダーを無効化する |

### 複数日選択属性

| 属性 | 型 | デフォルト | 説明 |
|------|------|-----------|------|
| multiSelectable | Boolean | false | 複数日選択モード（インラインモードのみ） |
| validTerms | Array | undefined | 選択可能な期間の配列。`[{start: "yyyy/MM/dd", end: "yyyy/MM/dd"}, ...]` |

### イベント属性

| 属性 | 型 | 説明 |
|------|------|------|
| onSelect | String(function) | 日付選択時に実行される関数名 |
| onClose | String(function) | カレンダーを閉じた時に実行される関数名 |
| onChangeMonthYear | String(function) | 年月変更後に実行される関数名 |
| beforeShow | String(function) | カレンダー表示前に実行される関数名 |
| beforeShowDay | String(function) | 各日付セル表示前に実行される関数名 |

### i18n 属性

| 属性 | 型 | 説明 |
|------|------|------|
| closeText | String | 閉じるボタンのテキスト |
| currentText | String | 今日ボタンのテキスト |
| prevText | String | 前月アイコンのツールチップ |
| nextText | String | 次月アイコンのツールチップ |
| appendText | String | テキストボックス横に表示するメッセージ |
| buttonText | String | カレンダー表示ボタンのタイトル |
| dayNames | Array | 曜日のフルネーム配列（日〜土） |
| dayNamesMin | Array | 曜日の最短名配列（カレンダーヘッダ用） |
| dayNamesShort | Array | 曜日の短縮名配列 |
| monthNames | Array | 月のフルネーム配列 |
| monthNamesShort | Array | 月の短縮名配列 |

## 日付フォーマット

### 置換文字

| 文字 | 出力 | 例 |
|------|------|-----|
| `yyyy` | 4 桁の年 | 2012 |
| `yy` | 下 2 桁の年 | 12 |
| `MM` | ゼロ埋め月 | 08 |
| `M` | 月 | 8 |
| `dd` | ゼロ埋め日 | 09 |
| `d` | 日 | 9 |
| `EEEE` | 曜日フルネーム | Thursday |
| `E` | 曜日短縮名 | Thu |

### 特殊フォーマット

| パターン | 等価フォーマット | 例 |
|---------|----------------|-----|
| `ISO_8601` | `yyyy-MM-dd` | 2012-08-09 |
| `ATOM` | `yyyy-MM-dd` | 2012-08-09 |

## 使用例

### フローティングモード（基本）

```html
<input type="text" id=":registrationDate:" class="imds-textbox" style="max-width: 10em;" />
<imart type="imuiCalendar" floatable="true" altField="#\\:registrationDate\\:" format="yyyy/MM/dd" />
```

### インラインモード

```html
<imart type="imuiCalendar" id="calendar" floatable="false" />
```

### 日付範囲の制限

```html
<input type="text" id=":targetDate:" class="imds-textbox" />
<imart type="imuiCalendar" floatable="true" altField="#\\:targetDate\\:" format="yyyy/MM/dd" minDate="2010/01/01" maxDate="2025/12/31" />
```

### 年月ドロップダウン付き

```html
<input type="text" id=":birthDate:" class="imds-textbox" />
<imart type="imuiCalendar" floatable="true" altField="#\\:birthDate\\:" format="yyyy/MM/dd" changeYear="true" changeMonth="true" yearRange="1950:2025" />
```

### 複数選択可能な期間の指定（ファンクションコンテナ + HTML）

ファンクションコンテナ:
```javascript
let validTerms = [
    { start: '2012/01/01', end: '2012/01/04' },
    { start: '2012/01/07', end: '2012/01/10' }
];
```

HTML:
```html
<imart type="imuiCalendar" validTerms=validTerms />
```

## CSJS メソッド

フローティングモードでは `altField` のテキストボックス、インラインモードではカレンダー要素の ID をセレクタに使用する。

| メソッド | 説明 | 構文 |
|---------|------|------|
| `getDate` | 選択日を取得 | `$(selector).imuiCalendar('getDate')` → `Date` |
| `setDate` | 日付を選択状態にする | `$(selector).imuiCalendar('setDate', date)` |
| `getSelection` | 複数選択の日付を取得 | `$(selector).imuiCalendar('getSelection')` → `Date[]` |
| `setSelection` | 複数の日付を選択状態にする | `$(selector).imuiCalendar('setSelection', dates)` |
| `deleteSelection` | 複数選択の日付を解除する | `$(selector).imuiCalendar('deleteSelection', dates)` |
| `show` | カレンダーを表示 | `$(selector).imuiCalendar('show')` |
| `hide` | カレンダーを非表示 | `$(selector).imuiCalendar('hide')` |
| `enable` | カレンダーを有効化 | `$(selector).imuiCalendar('enable')` |
| `disable` | カレンダーを無効化 | `$(selector).imuiCalendar('disable')` |
| `destroy` | カレンダーを削除 | `$(selector).imuiCalendar('destroy')` |
| `refresh` | カレンダーを再描画 | `$(selector).imuiCalendar('refresh')` |
| `option` (get) | オプション値を取得 | `$(selector).imuiCalendar('option', name)` |
| `option` (set) | オプション値を設定 | `$(selector).imuiCalendar('option', name, value)` |

## イベントコールバック

### onSelect

```javascript
window.onDateSelect = function(dateText, inst) {
    // dateText: フォーマット済み日付文字列
    // inst: jQueryUI Widget インスタンス
};
```

```html
<imart type="imuiCalendar" floatable="true" altField="#\\:date\\:" onSelect="onDateSelect" />
```

### onChangeMonthYear

```javascript
window.onMonthYearChange = function(year, month, inst) {
    // year: 年（Number）, month: 月（Number）, inst: jQueryObject
};
```

## 注意事項

- `altField` のセレクタで `:fieldName:` 形式の ID を指定する場合はエスケープが必要（`#\\:fieldName\\:`）
- `format` には年（`y`）・月（`M`）・日（`d`）のみ使用可能。時分秒は未対応
- `multiSelectable` はインラインモード（`floatable="false"`）でのみ動作する
- カレンダーメンテナンスのデータはブラウザにキャッシュされ、同一月は再取得しない
- イベント属性にはグローバルスコープ（`window`）からアクセス可能な関数名を文字列で指定する
