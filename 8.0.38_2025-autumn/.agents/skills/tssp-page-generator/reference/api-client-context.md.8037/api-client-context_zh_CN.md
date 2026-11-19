# ClientContext API 参考手册

## 概述

ClientContext 是一个保存客户端相关信息的访问上下文。
可以访问执行环境的客户端信息（如客户端类型等）。

### 获取方法

```typescript
let clientContext = Contexts.getClientContext();
```

## 属性列表

| 属性 | 类型 | 说明 |
|-----------|------|------|
| clientTypeId | String | 客户端类型ID（`pc` 或 `sp`） |

## 使用示例

### 获取客户端类型

```typescript
function isPC(): boolean {
  let clientContext = Contexts.getClientContext();
  return clientContext.clientTypeId === 'pc';
}

function isSmartPhone(): boolean {
  let clientContext = Contexts.getClientContext();
  return clientContext.clientTypeId === 'sp';
}
```
