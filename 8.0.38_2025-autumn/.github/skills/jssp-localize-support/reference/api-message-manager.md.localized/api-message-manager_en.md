# MessageManager API

API for retrieving messages from message property files using the user's locale or a specified locale.
Used in function containers (server-side JS).

## Type Definitions

```typescript
declare class MessageManager {
  /**
   * Retrieves a message in the current user's locale.
   * @param key Message key
   * @param args Arguments for placeholder replacement ({0}, {1}, ...)
   * @return Message string
   */
  static getMessage(key: string, ...args: any[]): string;

  /**
   * Retrieves a message in the specified locale.
   * @param localeId Locale ID ("ja", "en", "zh_CN", etc.)
   * @param key Message key
   * @param args Arguments for placeholder replacement
   * @return Message string
   */
  static getLocaleMessage(localeId: string, key: string, ...args: any[]): string;

  /**
   * Checks whether a message exists in the current user's locale.
   * @param key Message key
   * @return true if the message exists
   */
  static hasMessage(key: string): boolean;

  /**
   * Checks whether a message exists in the specified locale.
   * @param localeId Locale ID
   * @param key Message key
   * @return true if the message exists
   */
  static hasLocaleMessage(localeId: string, key: string): boolean;
}
```

## Usage Examples

### Basic Usage

```javascript
// Retrieve a message based on the user's locale
let title = MessageManager.getMessage('CAP.Z.IWP.SKILLS.SIMPLE.FORM.TITLE');

// Retrieve an error message
let errorMsg = MessageManager.getMessage('MSG.E.IWP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR');
```

### Placeholder Replacement

Define placeholders such as `{0}`, `{1}` in the properties file and replace them with arguments.

```properties
# log-message_ja.properties
E.IWP.SKILLS.SIMPLE.FORM.00001=\u753b\u9762\u8868\u793a\u4e2d\u306b\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f\u3002{0}
```

```javascript
// e.message is inserted into {0}
Logger.error(MessageManager.getMessage('E.IWP.SKILLS.SIMPLE.FORM.00001', e.message));
```

### Retrieve with Explicit Locale

```javascript
// Explicitly retrieve in Japanese locale
let jaTitle = MessageManager.getLocaleMessage('ja', 'CAP.Z.IWP.SKILLS.SIMPLE.FORM.TITLE');
```

### Check Message Existence

```javascript
if (MessageManager.hasMessage('CAP.Z.IWP.SKILLS.SIMPLE.FORM.TITLE')) {
  // Processing when the message exists
}
```

## Notes

- `getMessage` automatically determines the locale of the currently logged-in user. Use this in most cases.
- `getLocaleMessage` is used when you want to specify the locale explicitly (e.g., to fix the system locale for log output).
- `MessageManager` cannot be used in presentation pages (HTML). Use the `<imart type="message">` tag instead.
