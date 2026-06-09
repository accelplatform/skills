---
paths:
  - "src/main/jssp/**/*.js"
---

# Debug API 参考手册

## 概述

Debug 是在开发过程中用于调试的对象。
提供将变量信息输出到浏览器、控制台和文件的功能。
仅由静态方法构成，可以不实例化直接使用。

## 方法列表

| 方法 | 说明 | 输出目标 |
|---------|------|--------|
| browse(arg, args...) | 在浏览器页面上显示变量信息 | 浏览器 |
| console(arg, args...) | 以JSON格式在控制台显示对象内容 | 控制台 |
| print(msg) | 向控制台输出消息 | 控制台 |
| write(msg) | 向文件输出消息 | debug.txt |

## 方法详情

### browse(arg, args...)

在浏览器页面上显示变量信息。

| 参数 | 类型 | 说明 |
|-----------|------|------|
| arg | Object | 要显示的变量 |
| args... | Object | 追加的变量（任意个数） |

- 可以指定任意JavaScript变量类型
- **执行后，后续程序将不再执行**
- 不可在try...catch语句中使用

### console(arg, args...)

以JSON格式在控制台上显示对象内容。

| 参数 | 类型 | 说明 |
|-----------|------|------|
| arg | Object | 要显示的变量 |
| args... | Object | 追加的变量（任意个数） |

- 以JSON格式输出，可以将输出内容复制到源代码中进行对象化
- 作为JSON格式无效的属性不会显示

### print(msg)

向控制台输出消息。

| 参数 | 类型 | 说明 |
|-----------|------|------|
| msg | String | 要输出的消息 |

### write(msg)

向文件输出消息。输出目标为主目录下的 `debug.txt`（默认设置下为 `WEB-INF/debug.txt`）。多次调用时以追加模式运行。

| 参数 | 类型 | 说明 |
|-----------|------|------|
| msg | String | 要输出的消息 |

## 使用示例

### 向控制台输出调试信息

```javascript
let sampleObject = {
  'property1': '字符串1',
  'property2': new Date(),
  'property3': 256
};
Debug.console(sampleObject);

Debug.print('处理开始');
```

### 向文件输出调试信息

```javascript
Debug.write('变量值：' + value);
```

### 在浏览器上显示变量

```javascript
// 注意：后续程序将不再执行
Debug.browse(request, response);
```
