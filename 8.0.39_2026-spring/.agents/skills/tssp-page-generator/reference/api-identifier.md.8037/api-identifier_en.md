# Identifier API Reference

## Overview

Identifier is an object that automatically generates unique IDs.
It consists only of static methods and can be used directly without instantiation.

- ID format: 15-byte string
- Unique along the time axis
- System-unique including distributed environments

## Method List

| Method | Return Value | Description |
|---------|--------|------|
| get() | String | Generate and return a unique ID |

## Usage Examples

### Generating a Unique ID

```typescript
let uniqueId = Identifier.get();
```

### Assigning an ID When Registering a Record

```typescript
function registData(request: Request): void {
  let id = Identifier.get();
  let name: string = request['name'];
  let sql = 'INSERT INTO sample_table (id, name, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)';
  let result = new TenantDatabase().execute(sql, [DbParameter.string(id), DbParameter.string(name)]);
}
```
