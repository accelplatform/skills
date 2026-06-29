---
paths:
  - "src/main/jssp/**/*.js"
---

# Logger API リファレンス

## 概要

Logger は、ログ出力を行うオブジェクトである。
5段階のログレベル（trace < debug < info < warn < error）を提供する。

### Logger の取得方法

```javascript
// ソースファイルパスに基づく自動命名（推奨）
let logger = Logger.getLogger();

// 名前を指定して取得
let logger = Logger.getLogger('jp.co.example.sample');
```

`getLogger()` を引数なしで呼び出した場合、ソースファイルのパスからロガー名が自動生成される（パス区切りをドットに置換、拡張子なし）。

## メソッド一覧

### ログ出力メソッド

各レベル（`trace`, `debug`, `info`, `warn`, `error`）で同一のシグネチャを持つ。

| メソッド | 説明 |
|---------|------|
| `void level(msg)` | メッセージ文字列を出力 |
| `void level(format, arg)` | フォーマット文字列にパラメータ1つを埋め込んで出力 |
| `void level(format, arg1, arg2)` | フォーマット文字列にパラメータ2つを埋め込んで出力 |
| `void level(format, args)` | フォーマット文字列に配列のパラメータを埋め込んで出力 |

※ `level` は `trace`, `debug`, `info`, `warn`, `error` のいずれか

フォーマット文字列では `{}` がプレースホルダとなる。

### ログレベル判定メソッド

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| isTraceEnabled() | Boolean | trace レベルが有効か |
| isDebugEnabled() | Boolean | debug レベルが有効か |
| isInfoEnabled() | Boolean | info レベルが有効か |
| isWarnEnabled() | Boolean | warn レベルが有効か |
| isErrorEnabled() | Boolean | error レベルが有効か |

## 使用例

### 基本的なログ出力

```javascript
let logger = Logger.getLogger();

logger.error('エラーが発生しました');
logger.warn("パラメータ: '{}'", 'value1');
logger.info("処理開始 userId='{}', action='{}'", 'user01', 'regist');
logger.debug("詳細情報: '{}'", JSON.stringify(data));
logger.trace('トレース情報');
```

### 配列パラメータによるログ出力

```javascript
let logger = Logger.getLogger();
let args = ['param1', 123, new Date(), true];
logger.debug("パラメータ: '{}' '{}' '{}' '{}'", args);
```

### ログレベル判定による出力制御

```javascript
let logger = Logger.getLogger();

if (logger.isDebugEnabled()) {
  // 重い処理を伴うログ出力はレベル判定で囲む
  logger.debug("詳細データ: '{}'", JSON.stringify(largeObject));
}
```
