# セキュリティ規約

> **適用範囲**: 🟢 **常時** — ユーザ入力を扱う・外部に公開する全ての画面・API で適用。XSS / CSRF / 入力検証。

## 入力バリデーション（必須）

### 基本原則

- **すべての入力値はサーバサイドで検証する**
- クライアントサイドの検証は補助的なものとして扱う
- 許可リスト（ホワイトリスト）方式を優先

### 実装例

```javascript
/**
 * 入力値サニタイズ
 */
function sanitizeInput(input) {
  if (input === null || input === undefined) {
    return '';
  }
  let str = String(input);
  str = str.trim();
  str = str.replace(/[\x00-\x1F\x7F]/g, '');  // 制御文字を除去
  return str;
}

/**
 * 数値パラメータの検証
 */
function validateNumericParam(value, min, max) {
  if (!/^-?[0-9]+$/.test(value)) {
    return false;
  }
  let num = parseInt(value, 10);
  return num >= min && num <= max;
}
```

## SQLインジェクション対策（必須）

### 絶対禁止: 文字列連結でのSQL構築

```javascript
// 絶対禁止！！！
let sql = "SELECT * FROM users WHERE user_id = '" + userId + "'";  // 危険
let sql = "SELECT * FROM users WHERE user_name LIKE '%" + keyword + "%'";  // 危険
```

### 必須: パラメタライズドクエリ

```javascript
// 正しい実装
let sql = 'SELECT * FROM users WHERE user_id = ?';
let result = db.select(sql, [userId]);

// LIKE検索の場合
let sql = 'SELECT * FROM users WHERE user_name LIKE ?';
let result = db.select(sql, ['%' + keyword + '%']);

// 複数パラメータの場合
let sql = 'SELECT * FROM users WHERE status = ? AND department_cd = ?';
let result = db.select(sql, [status, departmentCd]);
```

## XSS（クロスサイトスクリプティング）対策

### IMART タグでのエスケープ属性

| 属性 | 用途 | デフォルト |
|------|------|-----------|
| `escapeXml` | `&`, `<`, `>`, `'`, `"` を XML エンティティに変換 | true |
| `escapeJs` | バックスラッシュ、クォート、制御文字をエスケープ | false |
| `escapeSpace` | 半角スペースを `&nbsp;` に変換 | false |
| `nl2br` | 改行を `<br>` タグに変換 | false |

```html
<!-- HTML 出力（デフォルトで escapeXml="true"） -->
<imart type="string" value=$userName />

<!-- HTML を含む場合（信頼できるデータのみ） -->
<imart type="string" value=$safeHtmlContent escapeXml="false" />
```

### JavaScript 出力時の注意

```html
<script type="text/javascript">
// JSON 埋め込み: escapeXml/escapeJs 両方を false に。$userData はグローバル変数にせず IIFE の引数としてスコープ化する
(function($userData) {
  // ...
})(<imart type="string" value=$userData escapeXml="false" escapeJs="false" />);

// 文字列リテラル: escapeXml=false, escapeJs=true
let value = '<imart type="string" value=$myValue escapeXml="false" escapeJs="true"></imart>';
</script>
```

**`<script>` 内での escape 属性の使い分け:**

| 用途 | `escapeXml` | `escapeJs` | 理由 |
|------|:-----------:|:----------:|------|
| JSON 埋め込み（IIFE の引数として渡す） | `false` | `false` | JSON 全体がそのまま出力されるため両方不要 |
| JS 文字列リテラル（`let x = '...'`） | `false` | **`true`** | クォート等の JS 特殊文字のエスケープが必要 |

**注意**: `escapeXml="false"` や `escapeJs="false"` を指定する場合は、データが信頼できるソースから来ていることを必ず確認すること。

## 禁止事項

### eval()の使用禁止

```javascript
// 絶対禁止！！！
let code = request['code'];
eval(code);  // 任意コード実行の危険性

// 絶対禁止！！！
let func = new Function(request['funcBody']);  // 同様に危険
```

### javaオブジェクトへの直接アクセス禁止

```javascript
// 禁止（blacklistで制限されている場合あり）
java.lang.Runtime.getRuntime().exec('command');

// 必要な場合は製品提供のAPIを使用
```

## セッション管理

```javascript
/**
 * セッションタイムアウトの考慮
 */
function checkSession() {
  let logger = Logger.getLogger();
  let accountContext = Contexts.getAccountContext();

  // アカウントコンテキストが取得できない or 認証済みフラグが false
  if (!accountContext || !accountContext.authenticated) {
    logger.warn('未認証アクセス検出');
    PageManager.redirect('login');
    return false;
  }

  return true;
}
```

## CSRF 対策

フォーム送信時には CSRF トークンを使用する。
`<imart type="imSecureToken" />` を使用すると、`<input type="imSecureToken" name="im_secure_token" value="<TOKEN>"` に変換されて出力される。

```html
<form method="POST" action="sample/user/edit">
  <!-- CSRF トークン（imui タグ使用時は自動付与） -->
  <imart type="imSecureToken" />

  <input type="text" name="userName" />
  <input type="submit" value="登録" />
</form>
```
