---
paths:
  - "src/main/tssp/**/*.ts"
---

# Identifier API リファレンス

## 概要

Identifier は、ユニークなIDを自動生成するオブジェクトである。
static メソッドのみで構成されており、インスタンス化せずに直接利用できる。

- ID形式: 15バイト文字列
- 時間軸に対してユニーク
- 分散環境を含めてシステム一意

## メソッド一覧

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| get() | String | ユニークIDを生成して返却 |

## 使用例

### ユニークIDの生成

```typescript
let uniqueId = Identifier.get();
```

### レコード登録時のID採番

```typescript
function registData(request: Request): void {
  let id = Identifier.get();
  let name: string = request['name'];
  let sql = 'INSERT INTO sample_table (id, name, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)';
  let result = new TenantDatabase().execute(sql, [DbParameter.string(id), DbParameter.string(name)]);
}
```
