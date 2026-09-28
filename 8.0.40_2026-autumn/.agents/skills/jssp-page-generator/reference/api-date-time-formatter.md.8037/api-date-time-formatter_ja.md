# DateTimeFormatter API リファレンス

## 概要

DateTimeFormatter は、日付および時刻情報の整形と解析を行う静的オブジェクトである。
Java の SimpleDateFormat と互換性のあるパターン記法に対応している。

タイムゾーンは以下の優先順序で適用される：

1. DateTime オブジェクトに含まれるタイムゾーン
2. メソッド引数で指定されたタイムゾーン
3. アカウントコンテキストのタイムゾーン

## 定数

| 定数 | 値 | 説明 |
|------|-----|------|
| `STANDARD_DATE_FORMAT_PATTERN` | `"yyyy-MM-dd"` | システム内部の日付フォーマットパターン |
| `STANDARD_DATE_TIME_FORMAT_PATTERN` | `"yyyy-MM-dd HH:mm:ss"` | システム内部の日付時刻フォーマットパターン |

## メソッド一覧

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `format(pattern, date, [locale])` | String | Date を文字列に整形 |
| `format(pattern, date, zone, [locale])` | String | タイムゾーン指定で Date を文字列に整形 |
| `format(pattern, dateTime, [locale])` | String | DateTime を文字列に整形 |
| `parseToDateTime(pattern, text, [locale])` | DateTime | 文字列を解析して DateTime を生成 |
| `parseToDateTime(pattern, text, zone, [locale])` | DateTime | タイムゾーン指定で文字列を DateTime に変換 |
| `parseToDate(pattern, text, [locale])` | Date | 文字列を解析して Date を生成 |
| `parseToDate(pattern, text, zone, [locale])` | Date | タイムゾーン指定で文字列を Date に変換 |

## format

Date または DateTime を指定パターンで文字列に整形する。

```javascript
// Date を整形
let str = DateTimeFormatter.format('yyyy/MM/dd', new Date());

// DateTime を整形
let dt = new DateTime();
let str = DateTimeFormatter.format('yyyy-MM-dd HH:mm:ss', dt);

// タイムゾーン指定
let zone = TimeZone.getTimeZone('America/New_York').data;
let str = DateTimeFormatter.format('yyyy/MM/dd HH:mm:ss', new Date(), zone);

// ロケール指定
let str = DateTimeFormatter.format('yyyy年MM月dd日(E)', new Date(), 'ja');
```

### パラメータ

| パラメータ | 型 | 説明 |
|-----------|------|------|
| `pattern` | String | 日付時刻フォーマットパターン |
| `date` / `dateTime` | Date / DateTime | 整形対象 |
| `zone` | TimeZone | タイムゾーン（省略可） |
| `locale` | String | ロケール（省略可） |

## parseToDateTime

文字列を解析して DateTime オブジェクトを生成する。

```javascript
// 文字列から DateTime を生成
let dt = DateTimeFormatter.parseToDateTime('yyyy/MM/dd', '2024/01/15');

// タイムゾーン指定
let zone = TimeZone.getTimeZone('Asia/Tokyo').data;
let dt = DateTimeFormatter.parseToDateTime('yyyy-MM-dd HH:mm:ss', '2024-01-15 14:30:00', zone);
```

### パラメータ

| パラメータ | 型 | 説明 |
|-----------|------|------|
| `pattern` | String | 日付時刻フォーマットパターン |
| `text` | String | 解析対象の文字列 |
| `zone` | TimeZone | タイムゾーン（省略可） |
| `locale` | String | ロケール（省略可） |

## parseToDate

文字列を解析して Date オブジェクトを生成する。

```javascript
// 文字列から Date を生成
let date = DateTimeFormatter.parseToDate('yyyy/MM/dd', '2024/01/15');

// タイムゾーン指定
let zone = TimeZone.getTimeZone('Asia/Tokyo').data;
let date = DateTimeFormatter.parseToDate('yyyy-MM-dd HH:mm:ss', '2024-01-15 14:30:00', zone);
```

### パラメータ

| パラメータ | 型 | 説明 |
|-----------|------|------|
| `pattern` | String | 日付時刻フォーマットパターン |
| `text` | String | 解析対象の文字列 |
| `zone` | TimeZone | タイムゾーン（省略可） |
| `locale` | String | ロケール（省略可） |

## フォーマットパターン文字

| 文字 | 説明 | 例 |
|------|------|-----|
| `y` | 年 | `yyyy` → 2024 |
| `M` | 月 | `MM` → 01 |
| `d` | 日 | `dd` → 15 |
| `H` | 時（0-23） | `HH` → 14 |
| `h` | 時（1-12） | `hh` → 02 |
| `m` | 分 | `mm` → 30 |
| `s` | 秒 | `ss` → 00 |
| `S` | ミリ秒 | `SSS` → 123 |
| `a` | 午前/午後 | `a` → AM |
| `E` | 曜日 | `E` → 月 |
| `'` | テキストエスケープ | `'T'` → T |
