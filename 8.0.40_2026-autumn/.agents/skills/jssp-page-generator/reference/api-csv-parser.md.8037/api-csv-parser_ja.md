# CSVParser API リファレンス

## 概要

CSVParser は、CSV 形式で書かれている文字列から2次元配列を作成するオブジェクトである。
static メソッドのみで構成されており、インスタンス化せずに直接利用できる。

## メソッド一覧

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| parse(csvtext, delimita) | Array | CSV 形式の文字列を解析し、2次元配列に変換する |

## メソッド詳細

### parse(csvtext, delimita)

CSV形式の文字列の解析を行い、2次元配列データに変換する。

| パラメータ | 型 | 説明 |
|-----------|------|------|
| csvtext | String | CSV形式の文字列 |
| delimita | String | 区切り文字（`,` `\t` ` ` など1文字で指定） |

**戻り値**: Array - 文字列の2次元配列データ

## 使用例

### カンマ区切り CSV の解析

```javascript
let csv = 'name,age,email\nTanaka,30,tanaka@example.com\nSuzuki,25,suzuki@example.com';
let result = CSVParser.parse(csv, ',');
// result[0] => ["name", "age", "email"]
// result[1] => ["Tanaka", "30", "tanaka@example.com"]
// result[2] => ["Suzuki", "25", "suzuki@example.com"]
```

### タブ区切り TSV の解析

```javascript
let tsv = 'col1\tcol2\tcol3\nval1\tval2\tval3';
let result = CSVParser.parse(tsv, '\t');
```
