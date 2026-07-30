# UserActvMatterPropertyValue API Reference

## Overview

`UserActvMatterPropertyValue` is the user data matter property information manager object.
It performs new registration, update, and deletion of user data matter property information.

This object performs search and update operations using the **user data ID** as the key.
The target table for search and update operations is the active matter related table `imw_t_user_data`.

- To operate user data property information for completed matters, use `UserCplMatterPropertyValue`
- To operate user data property information for archive matters, use `UserArcMatterPropertyValue`
- To retrieve user data matter property information from active matters using the system matter ID as key, use `ActvMatter`

## Constructor

```javascript
let manager = new UserActvMatterPropertyValue();
```

No arguments.

## Method List

| Method | Return Value | Description |
|---------|--------|------|
| createMatterProperty(Array) | WorkflowResultInfo\<null\> | Register new matter property information |
| updateMatterProperty(Array) | WorkflowResultInfo\<null\> | Update matter property information |
| deleteMatterProperty(Array) | WorkflowResultInfo\<null\> | Delete matter property information |
| getMatterPropertyList(String) | WorkflowResultInfo\<UserMatterPropertyInfo[]\> | Get matter property list by user data ID |
| getMatterProperty(String, String) | WorkflowResultInfo\<UserMatterPropertyInfo\> | Get matter property by user data ID and key |
| getMatterPropertyListCount(String) | WorkflowResultInfo\<number\> | Get matter property count by user data ID |

## Method Details

### createMatterProperty

Registers new user data matter property information.

```javascript
WorkflowResultInfo<null> createMatterProperty(Array matterProperty)
```

| Argument | Type | Description |
|------|------|------|
| matterProperty | UserMatterPropertyInfo[] | Array of user data matter property information objects |

| Return Value | Description |
|--------|------|
| WorkflowResultInfo\<null\> | Processing result. The `data` attribute is set to `null` |

- Registers to the `imw_t_user_data` table via **insert**
- If the array is not set, returns a result object containing error information
- If the number of items in the registration target array differs from the actual number of successful registrations, also returns an error
- If the same key already exists, it results in a **unique constraint violation error** (no overwrite is performed)
- **Does not perform internal transaction control**. External control is required

### updateMatterProperty

Updates user data matter property information.

```javascript
WorkflowResultInfo<null> updateMatterProperty(Array matterProperty)
```

| Argument | Type | Description |
|------|------|------|
| matterProperty | UserMatterPropertyInfo[] | Array of user data matter property information objects |

| Return Value | Description |
|--------|------|
| WorkflowResultInfo\<null\> | Processing result. The `data` attribute is set to `null` |

- Updates non-key values using "user data ID" and "matter property key" as keys
- Items not set (items with `null`) are **excluded from update targets**
- If the array is not set, returns an error
- If the number of updated data is less than 1, also returns an error
- **Does not perform internal transaction control**. External control is required

### deleteMatterProperty

Deletes user data matter property information.

```javascript
WorkflowResultInfo<null> deleteMatterProperty(Array matterProperty)
```

| Argument | Type | Description |
|------|------|------|
| matterProperty | UserMatterPropertyInfo[] | Array of user data matter property information objects |

| Return Value | Description |
|--------|------|
| WorkflowResultInfo\<null\> | Processing result |

- **Does not perform internal transaction control**. External control is required

### getMatterPropertyList

Retrieves a list of matter property information linked to the specified user data ID.

```javascript
WorkflowResultInfo<UserMatterPropertyInfo[]> getMatterPropertyList(String userDataId)
```

| Argument | Type | Description |
|------|------|------|
| userDataId | String | User data ID |

| Return Value | Description |
|--------|------|
| WorkflowResultInfo\<UserMatterPropertyInfo[]\> | Stores an array of matter property information objects in `data` |

### getMatterProperty

Retrieves the matter property information matching the specified user data ID and matter property key.

```javascript
WorkflowResultInfo<UserMatterPropertyInfo> getMatterProperty(String userDataId, String key)
```

| Argument | Type | Description |
|------|------|------|
| userDataId | String | User data ID |
| key | String | Matter property key |

| Return Value | Description |
|--------|------|
| WorkflowResultInfo\<UserMatterPropertyInfo\> | Stores a matter property information object in `data` |

### getMatterPropertyListCount

Retrieves the number of matter properties linked to the specified user data ID.

```javascript
WorkflowResultInfo<number> getMatterPropertyListCount(String userDataId)
```

| Argument | Type | Description |
|------|------|------|
| userDataId | String | User data ID |

| Return Value | Description |
|--------|------|
| WorkflowResultInfo\<number\> | Stores the number of matter properties in `data` |

## Structure of the Matter Property Information Object

The object used for each element in the argument arrays of `createMatterProperty` / `updateMatterProperty` / `deleteMatterProperty`, and in the `data` of the return values of `getMatterProperty` / `getMatterPropertyList`.

| Property | Type | Description |
|-----------|------|------|
| userDataId | String | User data ID |
| matterPropertyKey | String | Matter property key |
| matterPropertyValue | String | Matter property value |

## Usage Examples

### New Registration of Matter Properties

```javascript
let logger = Logger.getLogger();
let manager = new UserActvMatterPropertyValue();
let properties = [
  { userDataId: 'UD001', matterPropertyKey: 'product_code', matterPropertyValue: 'A001' },
  { userDataId: 'UD001', matterPropertyKey: 'product_name', matterPropertyValue: 'Sample Product' }
];

let result = manager.createMatterProperty(properties);
if (!result.resultFlag) {
  logger.error('Matter property registration failed. {}', result.resultStatus.messageId);
}
```

### Update of Matter Properties

```javascript
let logger = Logger.getLogger();
let manager = new UserActvMatterPropertyValue();
let properties = [
  { userDataId: 'UD001', matterPropertyKey: 'product_code', matterPropertyValue: 'A002' }
];

let result = manager.updateMatterProperty(properties);
if (!result.resultFlag) {
  logger.error('Matter property update failed. {}', result.resultStatus.messageId);
}
```

### Retrieval of Matter Properties

```javascript
let logger = Logger.getLogger();
let manager = new UserActvMatterPropertyValue();

// List retrieval
let listResult = manager.getMatterPropertyList('UD001');
for (let i = 0; i < listResult.data.length; i++) {
  logger.info('{} = {}', listResult.data[i].matterPropertyKey, listResult.data[i].matterPropertyValue);
}

// Single item retrieval
let itemResult = manager.getMatterProperty('UD001', 'product_code');
logger.info('product_code = {}', itemResult.data.matterPropertyValue);

// Count retrieval
let countResult = manager.getMatterPropertyListCount('UD001');
logger.info('Property count: {}', countResult.data);
```

### Register/Update Matter Properties (with existence check)

Since `createMatterProperty` causes a unique constraint violation if an existing key is present, check for existence and switch between registration or update.

```javascript
let logger = Logger.getLogger();
let manager = new UserActvMatterPropertyValue();
let userDataId = 'UD001';
let propertyKey = 'product_code';
let propertyValue = 'A003';

let existing = manager.getMatterProperty(userDataId, propertyKey);
let properties = [
  { userDataId: userDataId, matterPropertyKey: propertyKey, matterPropertyValue: propertyValue }
];

let result;
if (existing.data) {
  result = manager.updateMatterProperty(properties);
} else {
  result = manager.createMatterProperty(properties);
}

if (!result.resultFlag) {
  logger.error('Matter property processing failed. {}', result.resultStatus.messageId);
}
```

## Notes

- All methods **do not perform internal transaction control**. Use `Transaction.begin` etc. externally as needed
- `createMatterProperty` performs an insert, so if the same key already exists, it results in a unique constraint violation error. If uncertain whether a property is already registered, perform an existence check with `getMatterProperty`
- `updateMatterProperty` excludes `null` fields from update targets. Passing `null` to clear a value will not update it
- When a matter property definition is added later, matters applied before the addition will not have that property. Calling `updateMatterProperty` during approval will result in an error, so confirm existence with `getMatterProperty` and register with `createMatterProperty` if it does not exist
