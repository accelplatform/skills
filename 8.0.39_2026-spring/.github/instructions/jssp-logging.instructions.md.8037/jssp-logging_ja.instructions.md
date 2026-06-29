---
applyTo: "src/main/jssp/**/*.js"
description: "ログ出力規約（ログレベル、機密情報マスク）"
---

# ログ出力規約

> **適用範囲**: 🟡 **文脈依存** — ログ実装時のみ適用。ログ出力を行わない単純な画面では読まなくてよい。

## ログレベルの使い分け

| レベル | 用途 | 例 |
|--------|------|-----|
| ERROR | システムエラー、例外、復旧が必要な状態 | DB接続エラー、外部API呼び出し失敗 |
| WARN | 警告、想定外だが処理継続可能 | データ不整合の検出、非推奨機能の使用 |
| INFO | 重要な処理の開始・終了、業務イベント | ユーザ登録完了、バッチ処理開始/終了 |
| DEBUG | 開発時のデバッグ情報、詳細なトレース | 変数の値、処理フローの追跡 |

## ログ出力の実装

```javascript
/**
 * ログ出力ユーティリティ
 */
let LogUtil = (function() {
  let logger = Logger.getLogger();

  return {
    /**
     * 処理開始ログ
     */
    logStart: function(processName, params) {
      logger.info('[START] {} params={}', processName, JSON.stringify(params || {}));
    },

    /**
     * 処理終了ログ
     */
    logEnd: function(processName, result) {
      logger.info('[END] {} result={}', processName, (result ? 'success' : 'failure'));
    },

    /**
     * エラーログ
     */
    logError: function(processName, error, additionalInfo) {
      if (additionalInfo) {
        logger.error('[ERROR] {} message={} info={}', [processName, error.message, JSON.stringify(additionalInfo)]);
      } else {
        logger.error('[ERROR] {} message={}', processName, error.message);
      }

      if (error.stack) {
        logger.error('[STACK] {}', error.stack);
      }
    }
  };
})();

// 使用例
function registUser(userData) {
  LogUtil.logStart('registUser', {userId: userData.userId});

  try {
    let result = executeRegist(userData);
    LogUtil.logEnd('registUser', true);
    return result;

  } catch (e) {
    LogUtil.logError('registUser', e, {userId: userData.userId});
    LogUtil.logEnd('registUser', false);
    throw e;
  }
}
```

## 機密情報の取り扱い

### 出力禁止項目

- パスワード
- 認証トークン
- クレジットカード番号
- 個人情報（必要な場合はマスク処理）

### マスク処理の実装

```javascript
/**
 * 機密情報のマスク処理
 */
let MaskUtil = {
  /**
   * メールアドレスのマスク
   * example@domain.com → e***@d***.com
   */
  maskEmail: function(email) {
    if (!email) return '';
    let parts = email.split('@');
    if (parts.length !== 2) return '***';
    let local = parts[0].charAt(0) + '***';
    let domain = parts[1].charAt(0) + '***.' + parts[1].split('.').pop();
    return local + '@' + domain;
  },

  /**
   * 電話番号のマスク
   * 090-1234-5678 → 090-****-5678
   */
  maskPhone: function(phone) {
    if (!phone) return '';
    let digits = phone.replace(/[^0-9]/g, '');
    if (digits.length < 4) return '***';
    return digits.substring(0, 3) + '-****-' + digits.substring(digits.length - 4);
  },

  /**
   * ユーザIDのマスク（最初と最後の文字のみ表示）
   */
  maskUserId: function(userId) {
    if (!userId || userId.length < 2) return '***';
    return userId.charAt(0) + '***' + userId.charAt(userId.length - 1);
  }
};

// 使用例
let logger = Logger.getLogger();
logger.info('ユーザ情報: email={}', MaskUtil.maskEmail(userData.email));
```

## ログフォーマット

```javascript
// 推奨フォーマット
// [レベル] [処理名] メッセージ key1=value1, key2=value2
let logger = Logger.getLogger();
logger.info('[registUser] ユーザ登録処理開始 userId={}', userId);
logger.info('[registUser] ユーザ登録処理完了 userId={}, result=success', userId);
logger.error('[registUser] ユーザ登録処理エラー userId={}, error={}', userId, e.message);
// 3個以上のプレースホルダがある場合は配列で渡す
logger.error('[registUser] ユーザ登録処理エラー code={}, userId={}, error={}', [errorCode, userId, e.message]);
```

## プレースホルダ引数の渡し方

Logger のプレースホルダ `{}` に渡す引数は、個数に応じて呼び出し方が異なる。

| プレースホルダ数 | 呼び出し方 | 例 |
|:---:|---|---|
| 1個 | `logger.info('message {}', value)` | 第2引数に値を直接渡す |
| 2個 | `logger.info('message {} {}', value1, value2)` | 第2・第3引数に値を直接渡す |
| **3個以上** | `logger.info('message {} {} {}', [value1, value2, value3])` | **第2引数に配列で渡す** |

**3個以上のプレースホルダがある場合、必ず配列にまとめて第2引数として渡すこと。**
個別引数で渡すと、3番目以降の値が出力されない。

```javascript
// NG: 3個以上を個別引数で渡している（3番目以降が出力されない）
logger.info('[{}] 完了 count={}, elapsed={}ms', processName, count, elapsed);

// OK: 配列にまとめて渡す
logger.info('[{}] 完了 count={}, elapsed={}ms', [processName, count, elapsed]);
```
