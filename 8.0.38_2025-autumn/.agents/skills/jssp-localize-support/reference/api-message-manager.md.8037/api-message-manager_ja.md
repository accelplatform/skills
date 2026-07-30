# MessageManager API

ユーザロケールまたは指定ロケールでメッセージプロパティからメッセージを取得する API。
ファンクションコンテナ（サーバサイド JS）で使用する。

## 型定義

```typescript
declare class MessageManager {
  /**
   * 現在のユーザのロケールでメッセージを取得する。
   * @param key メッセージキー
   * @param args プレースホルダ置換用の引数（{0}, {1}, ... に対応）
   * @return メッセージ文字列
   */
  static getMessage(key: string, ...args: any[]): string;

  /**
   * 指定されたロケールでメッセージを取得する。
   * @param localeId ロケールID（"ja", "en", "zh_CN" 等）
   * @param key メッセージキー
   * @param args プレースホルダ置換用の引数
   * @return メッセージ文字列
   */
  static getLocaleMessage(localeId: string, key: string, ...args: any[]): string;

  /**
   * 現在のユーザのロケールでメッセージが存在するかを判定する。
   * @param key メッセージキー
   * @return メッセージが存在する場合 true
   */
  static hasMessage(key: string): boolean;

  /**
   * 指定されたロケールでメッセージが存在するかを判定する。
   * @param localeId ロケールID
   * @param key メッセージキー
   * @return メッセージが存在する場合 true
   */
  static hasLocaleMessage(localeId: string, key: string): boolean;
}
```

## 使用例

### 基本的な使い方

```javascript
// ユーザのロケールに応じたメッセージを取得
let title = MessageManager.getMessage('CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE');

// エラーメッセージの取得
let errorMsg = MessageManager.getMessage('MSG.E.APP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR');
```

### プレースホルダ置換

プロパティファイルで `{0}`, `{1}` 等のプレースホルダを定義し、引数で置換できる。

```properties
# log-message_ja.properties
E.APP.SKILLS.SIMPLE.FORM.00001=\u753b\u9762\u8868\u793a\u4e2d\u306b\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f\u3002{0}
```

```javascript
// {0} に e.message が挿入される
Logger.error(MessageManager.getMessage('E.APP.SKILLS.SIMPLE.FORM.00001', e.message));
```

### ロケールを指定して取得

```javascript
// 明示的に日本語ロケールで取得
let jaTitle = MessageManager.getLocaleMessage('ja', 'CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE');
```

### メッセージの存在確認

```javascript
if (MessageManager.hasMessage('CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE')) {
  // メッセージが存在する場合の処理
}
```

## 注意

- `getMessage` は現在のログインユーザのロケールを自動判定する。通常はこちらを使う
- `getLocaleMessage` はロケールを明示的に指定したい場合に使う（ログ出力でシステムロケール固定にしたい場合等）
- プレゼンテーションページ（HTML）では `MessageManager` は使用不可。代わりに `<imart type="message">` タグを使う
