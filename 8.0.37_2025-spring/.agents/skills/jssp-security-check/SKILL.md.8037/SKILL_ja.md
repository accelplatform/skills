---
name: jssp-security-check
description: JSSP コードのセキュリティ脆弱性を検出する専用スキル。SQL インジェクション、XSS（escapeXml/escapeJs/バインド変数スラッシュエスケープ漏れ）、eval/new Function、Java 直接アクセス、機密情報ログ出力、ハードコード認証情報、入力検証欠如を Grep パターンで網羅的にスキャンする。セキュリティチェック、脆弱性診断、セキュリティレビュー、安全性確認、と言及されたときに使用。コードレビューとは別に、セキュリティに特化した深い検査が必要な場合に使うこと。
---

# JSSP セキュリティチェックスキル

## 概要

intra-mart Accel Platform のスクリプト開発モデル（JSSP）で書かれたコードのセキュリティ脆弱性を検出する。

## 検出対象

### 1. SQL インジェクション（重大）

```javascript
// 検出パターン
'SELECT * FROM ' + table
"WHERE user_id = '" + userId + "'"
sql = sql + ' AND '
```

**検索コマンド例**:
```
Grep: SELECT.*\+
Grep: WHERE.*\+.*['"]
```

### 2. クロスサイトスクリプティング（XSS）（重大）

```html
<!-- 検出パターン: escapeXml/escapeJs が false の場合 -->
escapeXml="false"
escapeJs="false"
```

```javascript
// 検出パターン
document.write(
innerHTML =
```

### 3. 危険な関数使用（重大）

```javascript
// 検出パターン
eval(
new Function(
setTimeout(string
setInterval(string
```

**検索コマンド例**:
```
Grep: eval\s*\(
Grep: new\s+Function\s*\(
```

### 4. Java 直接アクセス（重大）

```javascript
// 検出パターン
java.lang.Runtime
java.io.File
java.net.URL
```

### 5. 機密情報のログ出力（高）

```javascript
// 検出パターン
logger.*password
logger.*token
logger.*secret
Debug.console.*password
```

### 6. ハードコードされた認証情報（高）

```javascript
// 検出パターン
password = "
apiKey = "
secret = "
token = "
```

### 7. バインド変数への JSON 代入時のスラッシュエスケープ漏れ（重大）

JSON 内の `</script>` によりプレゼンテーションページ上でスクリプトタグが終了し、XSS が可能になる。

```javascript
// 脆弱なコード（検出対象）
$data = JSON.stringify(response);

// 安全なコード
$data = JSON.stringify(response).replace(/\//g, '\\/');
```

**検索コマンド例**:
```
Grep: \$\w+\s*=\s*JSON\.stringify
```

### 8. 入力検証の欠如（中）

```javascript
// チェックポイント
// - request["param"] を直接使用していないか
// - parseInt/parseFloat 前の検証があるか
// - 長さ制限のチェックがあるか
```

## 検出手順

### Step 1: 高リスク脆弱性の検出

```
# SQLインジェクション
Grep: (SELECT|INSERT|UPDATE|DELETE).*\+

# eval/Function
Grep: eval\s*\(|new\s+Function

# Java直接アクセス
Grep: java\.(lang|io|net)
```

### Step 1.5: バインド変数のスラッシュエスケープ確認

```
# JSON.stringify をバインド変数に代入している箇所を検出
Grep: \$\w+\s*=\s*JSON\.stringify

# 検出された行に .replace(/\//g, "\\/") が含まれていなければ脆弱性あり
```

### Step 2: 中リスク脆弱性の検出

```
# 機密情報ログ
Grep: Logger\.(info|debug|error|warn).*password

# ハードコード認証情報
Grep: (password|apiKey|secret|token)\s*=\s*["']
```

### Step 3: 入力検証の確認

```
# request直接使用
Grep: request\[["'][^"']+["']\]

# validateなし
# 各ファイルでvalidate関数の存在を確認
```

## 出力形式

```
## セキュリティチェック結果

### 脆弱性サマリ

| 重大度 | 件数 |
|--------|------|
| 重大   | 2    |
| 高     | 3    |
| 中     | 5    |

### 検出された脆弱性

#### 重大

| ファイル | 行 | 種別 | 内容 |
|---------|-----|------|------|
| user_edit.js | 45 | SQLインジェクション | SQL文字列連結 |

#### 高

| ファイル | 行 | 種別 | 内容 |
|---------|-----|------|------|
| util.js | 23 | 機密情報漏洩 | パスワードのログ出力 |

### 修正推奨

1. **SQLインジェクション対策**
   - パラメタライズドクエリを使用

2. **機密情報保護**
   - ログ出力からパスワードを除外
```
