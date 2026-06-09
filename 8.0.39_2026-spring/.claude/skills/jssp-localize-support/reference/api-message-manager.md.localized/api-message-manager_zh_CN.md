# MessageManager API

通过用户区域设置或指定区域设置，从消息属性文件中获取消息的 API。
在函数容器（服务器端 JS）中使用。

## 类型定义

```typescript
declare class MessageManager {
  /**
   * 以当前用户的区域设置获取消息。
   * @param key 消息键
   * @param args 占位符替换参数（对应 {0}, {1}, ...）
   * @return 消息字符串
   */
  static getMessage(key: string, ...args: any[]): string;

  /**
   * 以指定的区域设置获取消息。
   * @param localeId 区域设置 ID（"ja"、"en"、"zh_CN" 等）
   * @param key 消息键
   * @param args 占位符替换参数
   * @return 消息字符串
   */
  static getLocaleMessage(localeId: string, key: string, ...args: any[]): string;

  /**
   * 判断当前用户的区域设置中是否存在指定消息。
   * @param key 消息键
   * @return 消息存在时返回 true
   */
  static hasMessage(key: string): boolean;

  /**
   * 判断指定区域设置中是否存在指定消息。
   * @param localeId 区域设置 ID
   * @param key 消息键
   * @return 消息存在时返回 true
   */
  static hasLocaleMessage(localeId: string, key: string): boolean;
}
```

## 使用示例

### 基本用法

```javascript
// 根据用户区域设置获取消息
let title = MessageManager.getMessage('CAP.Z.IWP.SKILLS.SIMPLE.FORM.TITLE');

// 获取错误消息
let errorMsg = MessageManager.getMessage('MSG.E.IWP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR');
```

### 占位符替换

在属性文件中定义 `{0}`、`{1}` 等占位符，并通过参数进行替换。

```properties
# log-message_ja.properties
E.IWP.SKILLS.SIMPLE.FORM.00001=\u753b\u9762\u8868\u793a\u4e2d\u306b\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f\u3002{0}
```

```javascript
// 将 e.message 插入 {0}
Logger.error(MessageManager.getMessage('E.IWP.SKILLS.SIMPLE.FORM.00001', e.message));
```

### 指定区域设置获取

```javascript
// 明确指定日语区域设置获取
let jaTitle = MessageManager.getLocaleMessage('ja', 'CAP.Z.IWP.SKILLS.SIMPLE.FORM.TITLE');
```

### 消息存在确认

```javascript
if (MessageManager.hasMessage('CAP.Z.IWP.SKILLS.SIMPLE.FORM.TITLE')) {
  // 消息存在时的处理
}
```

## 注意事项

- `getMessage` 会自动判断当前登录用户的区域设置，通常使用此方法。
- `getLocaleMessage` 用于需要明确指定区域设置的场景（例如希望日志输出固定使用系统区域设置时）。
- 展示页面（HTML）中不能使用 `MessageManager`，请改用 `<imart type="message">` 标签。
