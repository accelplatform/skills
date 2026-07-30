# Identifier API 参考手册

## 概述

Identifier 是一个自动生成唯一ID的对象。
仅由静态方法构成，可以不实例化直接使用。

- ID格式：15字节字符串
- 在时间轴上保证唯一性
- 包括分布式环境在内的系统范围内唯一

## 方法列表

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| get() | String | 生成并返回唯一ID |

## 使用示例

### 生成唯一ID

```javascript
let uniqueId = Identifier.get();
```

### 注册记录时的ID编号

```javascript
function registData(request) {
  let id = Identifier.get();
  let sql = 'INSERT INTO sample_table (id, name, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)';
  let result = new TenantDatabase().execute(sql, [id, request.name]);
}
```
