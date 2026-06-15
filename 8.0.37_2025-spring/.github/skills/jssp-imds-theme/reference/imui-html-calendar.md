---
paths:
  - "src/main/jssp/**/*.html"
---

# imuiCalendar

## 基本情報

imuiCalendar は日付選択用のカレンダーコンポーネントです。
フローティング表示（テキストボックスと連動するポップアップ）を標準で使用します。

**重要: 日付入力には必ず `floatable="true"` を指定すること。**
インライン表示（`floatable="false"`）は複数日選択など特殊用途に限定し、通常のフォーム入力では使用しません。

- 抽出元URL: https://api.intra-mart.jp/iap/apilist-jssp-tagdoc/doc/pc/imuiCalendar/index.html
- タグ種別: imart タグ（`<imart type="imuiCalendar" />`）

カレンダーコンポーネントは imds ではなく imui のテーマに定義されている部品ですが、imds でも使用可能です。

## 属性リファレンス

| 属性 | 型 | 説明 | デフォルト | 必須/オプション |
|------|-----|------|-----------|----------------|
| floatable | Boolean | 表示モード（true: フローティング / false: インライン） | - | 必須 |
| altField | String | フローティング時の連動先テキストボックスのCSSセレクタ | - | フローティング時必須 |
| id | String | インライン表示時のカレンダー要素ID | 自動生成 | オプション |
| format | String | 日付書式（例: `yyyy/MM/dd`） | AccountContext設定値 | オプション |
| defaultDate | String/Date | 初期表示日 | サーバ日付 | オプション |
| minDate | String/Date | 選択可能な最小日付 | 1970/01/01 | オプション |
| maxDate | String/Date | 選択可能な最大日付 | 2999/12/31 | オプション |
| calendarId | String | 使用するカレンダーID | デフォルトカレンダー | オプション |
| changeMonth | Boolean | 月選択ドロップダウンの表示 | false | オプション |
| changeYear | Boolean | 年選択ドロップダウンの表示 | false | オプション |
| firstDayOfWeek | Number | 週の開始曜日（0=日〜6=土） | アカウント設定値 | オプション |
| multiSelectable | Boolean | 複数日選択（インライン表示専用） | false | オプション |
| showButtonPanel | Boolean | ボタンパネルの表示 | false | オプション |

## 日付フォーマット

フォーマット文字列には年月日のみ使用可能（時分秒は不可）。

| フォーマット文字 | 説明 | 例 |
|-----------------|------|-----|
| yyyy | 4桁年 | 2026 |
| MM | 2桁月（0埋め） | 03 |
| dd | 2桁日（0埋め） | 24 |
| M | 月（0埋めなし） | 3 |
| d | 日（0埋めなし） | 24 |

## HTML スニペット

### フローティング表示（テキストボックス連動）

最も一般的な使用パターン。テキストボックスとカレンダーを組み合わせる。

```html
<input type="text" id="sample-date" class="imds-textbox" style="max-width: 10em;" />
<imart type="imuiCalendar" floatable="true" altField="#sample-date" format="yyyy/MM/dd" />
```

### インライン表示

画面にカレンダーを直接埋め込む。

```html
<imart type="imuiCalendar" id="sample-calendar" floatable="false" />
```

### 書式・範囲指定

```html
<input type="text" id="sample-date" class="imds-textbox" style="max-width: 10em;" />
<imart type="imuiCalendar" floatable="true" altField="#sample-date" format="yyyy/MM/dd" minDate="2020/01/01" maxDate="2030/12/31" />
```

### imds-field でラップした場合

```html
<div class="imds-field">
  <div class="imds-field-control">
    <input type="text" id="sample-date" class="imds-textbox" name="sampleDate" value="" style="max-width: 10em;" />
    <imart type="imuiCalendar" floatable="true" altField="#sample-date" format="yyyy/MM/dd" />
  </div>
  <span class="imds-error-text" for="sample-date">エラーメッセージをここに表示します。</span>
</div>
```

## CSJS API（クライアントサイド JavaScript）

jQuery を使用してカレンダーを操作できる。
jQuery はテーマライブラリによってロード済みのため、別途 `<script>` タグでロードは不要。

```javascript
// 選択中の日付を取得
$('#sample-calendar').imuiCalendar('getDate');

// 日付を設定
$('#sample-calendar').imuiCalendar('setDate', targetDate);

// オプションを変更（例: カレンダーIDの変更）
$('#sample-calendar').imuiCalendar('option', 'calendarId', value);
```

## 実装上の注意

- **日付入力には `<input type="date">` ではなく imuiCalendar を使用すること**
  （intra-mart のカレンダー設定・ロケールと連動するため）
- フローティング表示では、`altField` に連動先の **表示用テキストボックス**の CSS セレクタを指定する。hidden フィールドを指定してはならない（カレンダーアイコンの表示位置が altField の要素に依存するため）
- HTML の記述順序は「**表示用テキストボックス → `<imart type="imuiCalendar">` → hidden フィールド**」とする。逆にするとカレンダーアイコンがテキストボックスの左側に表示される
- `altField` のセレクタで ID にコロン等の特殊文字が含まれる場合は、`\\` でエスケープが必要（例: `altField="#\\:myDate\\:"`）
- フォーマットには必ず年月日をすべて含めること。含まない場合、テキストボックスの入力がカレンダーに反映されない
- 複数日選択（`multiSelectable`）はインライン表示でのみ使用可能
- テキストボックスの幅は日付フォーマットに合わせて `max-width` を指定すること（`yyyy/MM/dd` の場合 `10em` 程度）
- 入力フォームで使用する場合は Field（`imds-field`）でラップする

## 日時入力（日付 + 時刻の組み合わせ）

「日時」を入力させる場合、1つのテキストボックスに手入力させるのではなく、**日付と時刻のフィールドを分けること**。

| 要素 | 使用コンポーネント | 備考 |
|------|-----------------|------|
| 日付部分 | `<imart type="imuiCalendar">` | `format="yyyy-MM-dd"` を指定（API連携が容易） |
| 時刻部分 | `<input type="time">` | `step="900"` で 15 分単位に制限 |

### HTML マークアップ例

```html
<div class="imds-field-inline">
  <input type="text" id=":startDate:" class="imds-textbox" style="max-width: 10em;" />
  <imart type="imuiCalendar" floatable="true" altField="#\\:startDate\\:" format="yyyy-MM-dd" />
  <input type="time" id=":startTime:" class="imds-textbox" step="900" style="max-width: 8em;" />
</div>
```

### 値の読み取り（API 送信時）

```javascript
const startAt = document.getElementById(':startDate:').value + ' ' + document.getElementById(':startTime:').value + ':00';
// → "2026-04-21 10:00:00"
```

### 値の初期設定（編集画面で既存データをセット）

API から `"YYYY-MM-DD HH:mm:ss"` 形式で受け取った値を分割してセットする。

```javascript
function setDateTimeFields(dateFieldId, timeFieldId, dateTimeStr) {
  if (!dateTimeStr) return;
  const parts = dateTimeStr.split(' ');
  document.getElementById(dateFieldId).value = parts[0];
  document.getElementById(timeFieldId).value = parts[1].substring(0, 5);
}
// 使用例
setDateTimeFields(':startDate:', ':startTime:', result.startAt);
```

### バリデーション

```javascript
if (!document.getElementById(':startDate:').value) {
  errors.push({ name: 'startDate', message: '開始日付を入力してください。' });
}
if (!document.getElementById(':startTime:').value) {
  errors.push({ name: 'startTime', message: '開始時刻を入力してください。' });
}
```
