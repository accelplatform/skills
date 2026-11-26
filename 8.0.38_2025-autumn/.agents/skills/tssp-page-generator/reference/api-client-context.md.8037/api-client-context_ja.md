# ClientContext API リファレンス

## 概要

ClientContext は、クライアントに関連する情報を保持するアクセスコンテキストである。
実行環境のクライアント情報（クライアントタイプなど）にアクセスできる。

### 取得方法

```typescript
let clientContext = Contexts.getClientContext();
```

## プロパティ一覧

| プロパティ | 型 | 説明 |
|-----------|------|------|
| clientTypeId | String | クライアントタイプID（`pc` または `sp`） |

## 使用例

### クライアントタイプの取得

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
