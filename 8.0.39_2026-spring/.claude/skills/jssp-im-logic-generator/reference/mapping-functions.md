# マッピング関数リファレンス

IM-LogicDesigner の変数間マッピングで使用可能な関数の一覧。
`mappingRules.source.type = "function"` で使用し、`source.name` に関数名を指定する。

以下は基本関数（52件）。
追加の関数は MCP `listMappingFunctions` / `getMappingFunction` で取得する。

## 配列操作（9件）

| 関数名 | 引数 | 説明 |
|---|---|---|
| `im_array_size` | (array) | 配列の要素数を返す |
| `im_array_first` | (array) | 配列の最初の要素を返す |
| `im_array_last` | (array) | 配列の最後の要素を返す |
| `im_array_get` | (array, index) | 指定インデックスの要素を返す |
| `im_array_push` | (array, value) | 末尾に要素を追加した配列を返す |
| `im_array_unshift` | (array, array) | 先頭に配列を結合した配列を返す |
| `im_array_insert` | (array, index, value) | 指定位置に要素を挿入した配列を返す |
| `im_array_remove` | (array, index) | 指定位置の要素を削除した配列を返す |
| `im_array_replace` | (array, index, value) | 指定位置の要素を置換した配列を返す |

## 文字列操作（7件）

| 関数名 | 引数 | 説明 |
|---|---|---|
| `im_string_concat` | (str1, str2) | 文字列を連結する |
| `im_string_substring` | (str, start, end) | 部分文字列を取得する |
| `im_string_replace` | (str, search, replacement) | 文字列を置換する |
| `im_string_split` | (str, separator) | 文字列を分割して配列を返す |
| `im_string_join` | (array, separator) | 配列を結合して文字列を返す |
| `im_string_trim` | (str) | 前後の空白を除去する |
| `im_string_el` | (expression) | EL式を評価して文字列を返す |

## 数値演算（12件）

| 関数名 | 引数 | 説明 |
|---|---|---|
| `im_math_addition` | (a, b) | 加算（a + b） |
| `im_math_subtraction` | (a, b) | 減算（a - b） |
| `im_math_multiplication` | (a, b) | 乗算（a * b） |
| `im_math_division` | (a, b, scale) | 除算（a / b、scale は小数点以下桁数） |
| `im_math_modulus` | (a, b) | 剰余（a % b） |
| `im_math_pow` | (base, exponent) | 累乗（base ^ exponent） |
| `im_math_abs` | (value) | 絶対値 |
| `im_math_max` | (a, b) | 最大値（数値・日付に対応） |
| `im_math_min` | (a, b) | 最小値（数値・日付に対応） |
| `im_math_roundUp` | (value, scale) | 切り上げ |
| `im_math_roundDown` | (value, scale) | 切り捨て |
| `im_math_roundHalfUp` | (value, scale) | 四捨五入 |

## 数値フォーマット（2件）

| 関数名 | 引数 | 説明 |
|---|---|---|
| `im_number_formatnumber` | (number, pattern) | 数値をパターン文字列でフォーマットする |
| `im_number_parsenumber` | (str, pattern) | パターン文字列で数値をパースする |

## 日付操作（10件）

| 関数名 | 引数 | 説明 |
|---|---|---|
| `im_date_formatdate` | (date, pattern) | 日付をパターン文字列でフォーマット（システムタイムゾーン） |
| `im_date_parsedate` | (str, pattern) | パターン文字列で日付をパース（システムタイムゾーン） |
| `im_date_account_formatdate` | (date, pattern) | 日付をアカウントタイムゾーンでフォーマット |
| `im_date_account_parsedate` | (date, pattern) | 日付をアカウントタイムゾーンでパース |
| `im_date_calculate` | (date, days) | 日付に日数を加算する |
| `im_date_interval` | (date1, date2) | 2つの日付の差（日数）を返す |
| `im_date_beginning_of_the_month` | (date) | 月初日を返す |
| `im_date_end_of_the_month` | (date) | 月末日を返す |
| `im_date_convertdate_in_account_tz` | (date) | システムTZ → アカウントTZ に変換 |
| `im_date_convertdate_in_system_tz` | (date) | アカウントTZ → システムTZ に変換 |

## オブジェクト操作（6件）

| 関数名 | 引数 | 説明 |
|---|---|---|
| `im_object_keys` | (object) | オブジェクトのキー一覧を配列で返す |
| `im_object_values` | (object) | オブジェクトの値一覧を配列で返す |
| `im_object_to_lower_camel_case` | (object) | キー名を lowerCamelCase に変換 |
| `im_object_to_upper_camel_case` | (object) | キー名を UpperCamelCase に変換 |
| `im_object_to_lower_snake_case` | (object) | キー名を lower_snake_case に変換 |
| `im_object_to_upper_snake_case` | (object) | キー名を UPPER_SNAKE_CASE に変換 |

## JSON 変換（2件）

| 関数名 | 引数 | 説明 |
|---|---|---|
| `im_parse_json` | (str) | JSON 文字列をオブジェクトにパースする |
| `im_to_json` | (object) | オブジェクトを JSON 文字列に変換する |

## バイナリ / Base64（2件）

| 関数名 | 引数 | 説明 |
|---|---|---|
| `im_binary_encode_base64` | (binary) | バイナリを Base64 文字列にエンコードする |
| `im_base64_decode_binary` | (str) | Base64 文字列をバイナリにデコードする |

## ID 生成（2件）

| 関数名 | 引数 | 説明 |
|---|---|---|
| `im_id_uuid` | （なし） | UUID を生成する |
| `im_id_identifier` | （なし） | intra-mart 識別子を生成する |

## spec での使い方

```jsonc
{
  "target": "$variable/itemCount",
  "source": {
    "type": "function",
    "name": "im_array_size",
    "path": null,
    "arguments": [
      { "type": "value", "name": null, "path": "im_repositorySearchEntityData1", "arguments": null }
    ]
  }
}
```

### 関数のネスト（引数に別の関数を渡す）

```jsonc
{
  "target": "$variable/result",
  "source": {
    "type": "function",
    "name": "im_string_concat",
    "path": null,
    "arguments": [
      { "type": "value", "name": null, "path": "$input/prefix", "arguments": null },
      {
        "type": "function",
        "name": "im_to_json",
        "path": null,
        "arguments": [
          { "type": "value", "name": null, "path": "$input/data", "arguments": null }
        ]
      }
    ]
  }
}
```

### 引数なし関数

`im_id_uuid` / `im_id_identifier` は引数なしで呼び出す:

```jsonc
{
  "target": "$variable/newId",
  "source": {
    "type": "function",
    "name": "im_id_uuid",
    "path": null,
    "arguments": []
  }
}
```
