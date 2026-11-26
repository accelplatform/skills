# ClientContext API Reference

## Overview

ClientContext is an access context that holds information related to the client.
It provides access to client information of the execution environment (such as client type).

### How to Retrieve

```typescript
let clientContext = Contexts.getClientContext();
```

## Property List

| Property | Type | Description |
|-----------|------|------|
| clientTypeId | String | Client type ID (`pc` or `sp`) |

## Usage Examples

### Retrieving Client Type

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
