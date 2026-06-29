# 映射函数参考

IM-LogicDesigner 变量间映射中可使用的函数列表。
使用 `mappingRules.source.type = "function"` 时，在 `source.name` 中指定函数名。

以下是基本函数（共 52 个）。
其他函数可通过 MCP `mcp__im_logic__list_mapping_functions` / `mcp__im_logic__get_mapping_function` 获取。

## 数组操作（9 个）

| 函数名 | 参数 | 说明 |
|---|---|---|
| `im_array_size` | (array) | 返回数组的元素数量 |
| `im_array_first` | (array) | 返回数组的第一个元素 |
| `im_array_last` | (array) | 返回数组的最后一个元素 |
| `im_array_get` | (array, index) | 返回指定索引处的元素 |
| `im_array_push` | (array, value) | 返回在末尾追加元素后的数组 |
| `im_array_unshift` | (array, array) | 返回在开头合并指定数组后的数组 |
| `im_array_insert` | (array, index, value) | 返回在指定位置插入元素后的数组 |
| `im_array_remove` | (array, index) | 返回删除指定位置元素后的数组 |
| `im_array_replace` | (array, index, value) | 返回替换指定位置元素后的数组 |

## 字符串操作（7 个）

| 函数名 | 参数 | 说明 |
|---|---|---|
| `im_string_concat` | (str1, str2) | 拼接字符串 |
| `im_string_substring` | (str, start, end) | 获取子字符串 |
| `im_string_replace` | (str, search, replacement) | 替换字符串 |
| `im_string_split` | (str, separator) | 分割字符串并返回数组 |
| `im_string_join` | (array, separator) | 将数组合并并返回字符串 |
| `im_string_trim` | (str) | 去除前后空白 |
| `im_string_el` | (expression) | 对 EL 表达式求值并返回字符串 |

## 数值运算（12 个）

| 函数名 | 参数 | 说明 |
|---|---|---|
| `im_math_addition` | (a, b) | 加法（a + b） |
| `im_math_subtraction` | (a, b) | 减法（a - b） |
| `im_math_multiplication` | (a, b) | 乘法（a * b） |
| `im_math_division` | (a, b, scale) | 除法（a / b，scale 为小数位数） |
| `im_math_modulus` | (a, b) | 取余（a % b） |
| `im_math_pow` | (base, exponent) | 幂运算（base ^ exponent） |
| `im_math_abs` | (value) | 绝对值 |
| `im_math_max` | (a, b) | 最大值（支持数值和日期） |
| `im_math_min` | (a, b) | 最小值（支持数值和日期） |
| `im_math_roundUp` | (value, scale) | 向上取整 |
| `im_math_roundDown` | (value, scale) | 向下取整（截断） |
| `im_math_roundHalfUp` | (value, scale) | 四舍五入 |

## 数值格式化（2 个）

| 函数名 | 参数 | 说明 |
|---|---|---|
| `im_number_formatnumber` | (number, pattern) | 使用格式字符串格式化数值 |
| `im_number_parsenumber` | (str, pattern) | 使用格式字符串解析数值 |

## 日期操作（10 个）

| 函数名 | 参数 | 说明 |
|---|---|---|
| `im_date_formatdate` | (date, pattern) | 使用格式字符串格式化日期（系统时区） |
| `im_date_parsedate` | (str, pattern) | 使用格式字符串解析日期（系统时区） |
| `im_date_account_formatdate` | (date, pattern) | 以账号时区格式化日期 |
| `im_date_account_parsedate` | (date, pattern) | 以账号时区解析日期 |
| `im_date_calculate` | (date, days) | 在日期上加上指定天数 |
| `im_date_interval` | (date1, date2) | 返回两个日期的差（天数） |
| `im_date_beginning_of_the_month` | (date) | 返回月初日期 |
| `im_date_end_of_the_month` | (date) | 返回月末日期 |
| `im_date_convertdate_in_account_tz` | (date) | 将系统时区转换为账号时区 |
| `im_date_convertdate_in_system_tz` | (date) | 将账号时区转换为系统时区 |

## 对象操作（6 个）

| 函数名 | 参数 | 说明 |
|---|---|---|
| `im_object_keys` | (object) | 以数组形式返回对象的键列表 |
| `im_object_values` | (object) | 以数组形式返回对象的值列表 |
| `im_object_to_lower_camel_case` | (object) | 将键名转换为 lowerCamelCase |
| `im_object_to_upper_camel_case` | (object) | 将键名转换为 UpperCamelCase |
| `im_object_to_lower_snake_case` | (object) | 将键名转换为 lower_snake_case |
| `im_object_to_upper_snake_case` | (object) | 将键名转换为 UPPER_SNAKE_CASE |

## JSON 转换（2 个）

| 函数名 | 参数 | 说明 |
|---|---|---|
| `im_parse_json` | (str) | 将 JSON 字符串解析为对象 |
| `im_to_json` | (object) | 将对象转换为 JSON 字符串 |

## 二进制 / Base64（2 个）

| 函数名 | 参数 | 说明 |
|---|---|---|
| `im_binary_encode_base64` | (binary) | 将二进制编码为 Base64 字符串 |
| `im_base64_decode_binary` | (str) | 将 Base64 字符串解码为二进制 |

## ID 生成（2 个）

| 函数名 | 参数 | 说明 |
|---|---|---|
| `im_id_uuid` | （无） | 生成 UUID |
| `im_id_identifier` | （无） | 生成 intra-mart 标识符 |

## 在 spec 中的使用方法

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

### 函数嵌套（将另一个函数作为参数传入）

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

### 无参数函数

`im_id_uuid` / `im_id_identifier` 不带参数调用：

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
