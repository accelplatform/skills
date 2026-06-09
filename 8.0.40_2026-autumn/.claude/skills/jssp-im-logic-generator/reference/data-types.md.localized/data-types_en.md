# IM-LogicDesigner Data Type Reference

The complete set of data types (type IDs) available in IM-LogicDesigner logic flows.
Specified in the `typeId` of `inputDataDefinition` / `outputDataDefinition` / `variablesDataDefinition`, and in `constants[].typeId`.

Source: [IM-LogicDesigner Specification - Data Types](https://document.intra-mart.jp/library/iap/public/im_logic/im_logic_specification/texts/function_specification/logic_flow/index.html#function-specification-logic-flow-data-type)

## Primitive Types

### String and Boolean

| Type ID | Data Type | Description |
|---|---|---|
| `string` | String | String |
| `boolean` | Boolean | Boolean value |

### Integer

| Type ID | Data Type | Description |
|---|---|---|
| `byte` | Byte | 1-byte integer (-128 ~ 127) |
| `character` | Character | 2-byte character data (u0000 ~ uffff) |
| `short` | Short | 2-byte integer (-32768 ~ 32767) |
| `integer` | Integer | 4-byte integer (-2147483648 ~ 2147483647) |
| `long` | Long | 8-byte integer |
| `biginteger` | BigInteger | Arbitrary-precision signed integer |

### Floating Point

| Type ID | Data Type | Description |
|---|---|---|
| `float` | Float | 4-byte single-precision floating point number |
| `double` | Double | 8-byte double-precision floating point number |
| `bigdecimal` | BigDecimal | Arbitrary-precision signed decimal |

### Date and Time

| Type ID | Data Type | Description |
|---|---|---|
| `calendar` | Calendar | Calendar for date manipulation (includes date/time and timezone information) |
| `date` | Date | Date and time (does not include timezone information) |
| `imdatetime` | IM DateTime | Date and time (intra-mart proprietary, includes timezone information) |
| `imduration` | IM Duration | Duration |
| `sqldate` | SQL Date | Date type equivalent to java.sql.Date (does not include timezone information) |
| `sqltimestamp` | SQL Timestamp | Date type equivalent to java.sql.Timestamp (does not include timezone information) |

### Locale and Timezone

| Type ID | Data Type | Description |
|---|---|---|
| `locale` | Locale | Locale |
| `timezone` | TimeZone | Timezone |

### Data and Storage

| Type ID | Data Type | Description |
|---|---|---|
| `binary` | Binary | Binary data |
| `sqlclob` | SQL Clob | Type equivalent to java.sql.Clob |
| `storage` | Storage | Storage available on intra-mart Accel Platform |
| `map` | Map | Type equivalent to java.util.Map |

### Special Types

| Type ID | Data Type | Description |
|---|---|---|
| `any` | Any | Unknown type. Accepts any value |

## Choosing the Right Type

### Date and Time

**When in doubt, use `imdatetime`.** It fully preserves date/time and timezone, making it the safest choice.

| Situation | Recommended Type |
|---|---|
| General date/time input, output, and variables | `imdatetime` |
| Requires interoperability with Java Calendar | `calendar` |
| Date only without timezone | `date` |
| DB column is java.sql.Date | `sqldate` |
| DB column is java.sql.Timestamp | `sqltimestamp` |
| Duration (number of days, time difference, etc.) | `imduration` |

### Integer

**`integer` is sufficient in most cases.** `byte` / `short` are rarely used.

| Situation | Recommended Type |
|---|---|
| Count, ID, general integer | `integer` |
| Large integers exceeding the integer range | `long` |
| Arbitrary-precision integers that don't fit in long | `biginteger` |

### Decimal

**Adopt `bigdecimal` as the default.** Required in situations where calculation errors are not acceptable, such as monetary amounts.

| Situation | Recommended Type |
|---|---|
| Calculations requiring precision, such as amounts and tax rates | `bigdecimal` |
| Performance-first with acceptable error | `double` |

### Data and Storage

| Situation | Recommended Type |
|---|---|
| Binary data in memory (equivalent to byte[]) | `binary` |
| Files on storage (referenced by file path) | `storage` |
| SQL user-defined response (output values only) | `sqlclob` |

**Notes:**
- Do not use `sqlclob` when not using SQL.
- Mapping to `storage` type supports only `string` (file path string) or `storage` type. Mapping from other types is not supported.

## Complex Types

In addition to the above primitives, the following complex types can be used as `typeId`.
These are defined with `id` inside `typeDefinitions` and have fields via `properties`.

| Pattern | Description | Example |
|---|---|---|
| `imr_entity` | IM-Repository entity | - |
| `imrepo_entity_*` | Entity reference type (resolved by resolveEntitySchema) | `imrepo_entity_search_imprtl_portlet_info_tables_imprtl_portlet_info` |
| `im_logic_object_*` | Flow-local object type | `im_logic_object_1` |
| `jp_co_intra_mart_*` | Java class-based type (within task input/output definitions) | `jp_co_intra_mart_foundation_logic_element_authz_AuthorizeAuthzTaskResultObject` |
| `root` | Root of type definition (referenced from entrypoint) | - |

## listingType

By specifying `listingType` in combination with `typeId`, you can represent an array type.

| listingType | Meaning | Selection Criteria |
|---|---|---|
| `none` | Single value | When the value is a single item (scalar value, one object) |
| `list` | List-type array | When handling multiple items in user-defined input/output or flow variables |
| `array` | Array type | When a built-in task output definition (Java class-based type) returns multiple items |

When defining input/output or flow variables in the spec, use `none` or `list`.
`array` mainly appears in built-in task template outputs, so there are few occasions to explicitly specify it when creating the spec.
