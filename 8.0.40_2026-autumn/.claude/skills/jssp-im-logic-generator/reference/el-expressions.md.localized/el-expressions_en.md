# EL Expression Reference

In IM-LogicDesigner, EL (Expression Language) expressions can be embedded in certain fields.

## Where They Can Be Used

- `properties.condition` of `im_sequence`
- `properties.errorMessage` of `im_errorEnd`
- Other string-type properties that contain `${...}`

## Syntax

```
${ <expression> }
```

Outside `${}` is treated as a literal string as-is; inside is evaluated as an expression.
Expressions and strings can be mixed.

## What Can Be Used Inside Expressions

| Reference | Description |
|---|---|
| `$input.foo.bar` | Input data |
| `$output.data.xxx` | Output data |
| `$variable.xxx` | Flow variables |
| `$const.NAME` | Constants |
| `$session_properties.xxx` | Session information (see below for details) |
| `$account_context.xxx` | Account context (see below for details) |
| `$user_context.xxx` | User context (see below for details) |
| `$task_result.xxx` | Processing result information (see below for details) |
| `$external_user_context.xxx` | External user context (see below for details) |
| `<executeId>.<field>` | Output of the preceding task |

**Note:** Inside EL expressions, use `.` as separator; inside `source.path`, use `/` as separator. Do not confuse the two.

### $account_context

Account context. Allows referencing the session information of the logged-in user.

| Property | Type | Description |
|-----------|------|------|
| `applicationLicenses` | string[] | List of application licenses |
| `authenticated` | boolean | Whether authenticated |
| `calendarId` | string | Calendar ID |
| `dateTimeFormats` | object | Date/time format settings |
| `dateTimeFormats.dateInput` | string | Date input format |
| `dateTimeFormats.dateSimple` | string | Date simple format |
| `dateTimeFormats.dateStandard` | string | Date standard format |
| `dateTimeFormats.timeInput` | string | Time input format |
| `dateTimeFormats.timeStandard` | string | Time standard format |
| `dateTimeFormats.timeTimestamp` | string | Timestamp format |
| `encoding` | string | Character encoding |
| `firstDayOfWeek` | integer | First day of the week (`0`: Sunday ~ `6`: Saturday) |
| `homeUrl` | string | Home URL |
| `locale` | locale | Locale ("ja" / "en" / "zh_CN", etc.) |
| `loginTime` | date | Login date/time |
| `roleIds` | string[] | List of held role IDs |
| `tenantId` | string | Tenant ID |
| `themeId` | string | Theme ID |
| `timeZone` | timezone | Timezone |
| `userCd` | string | User code |
| `userType` | string | User type (`"user"`: regular user, `"administrator"`: system administrator) |

### $user_context

User context. Allows referencing the logged-in user's organization membership and profile information.

#### currentDepartment (Affiliated Organization)

| Property | Type | Description |
|-----------|------|------|
| `currentDepartment.companyCd` | string | Company code |
| `currentDepartment.departmentCd` | string | Organization code |
| `currentDepartment.departmentFullName` | string | Organization full name |
| `currentDepartment.departmentName` | string | Organization name |
| `currentDepartment.departmentSearchName` | string | Organization search name |
| `currentDepartment.departmentSetCd` | string | Organization set code |
| `currentDepartment.departmentShortName` | string | Organization abbreviated name |

#### userProfile (User Profile)

| Property | Type | Description |
|-----------|------|------|
| `userProfile.address1` | string | Address 1 |
| `userProfile.address2` | string | Address 2 |
| `userProfile.address3` | string | Address 3 |
| `userProfile.countryCd` | string | Country code (free input, no code system specified) |
| `userProfile.emailAddress1` | string | Email address 1 |
| `userProfile.emailAddress2` | string | Email address 2 |
| `userProfile.extensionFaxNumber` | string | FAX extension number |
| `userProfile.extensionNumber` | string | Extension number |
| `userProfile.faxNumber` | string | FAX number |
| `userProfile.mobileEmailAddress` | string | Mobile email address |
| `userProfile.mobileNumber` | string | Mobile phone number |
| `userProfile.notes` | string | Notes |
| `userProfile.sex` | string | Gender (`"0"`: Male, `"1"`: Female, `"9"`: Other) |
| `userProfile.telephoneNumber` | string | Telephone number |
| `userProfile.url` | string | URL |
| `userProfile.userCd` | string | User code |
| `userProfile.userName` | string | User name |
| `userProfile.userSearchName` | string | User search name |
| `userProfile.zipCode` | string | Zip code |

### $session_properties

Session properties. Allows referencing system information at the time of flow execution.

| Property | Type | Description |
|-----------|------|------|
| `baseUrl` | string | Base URL |
| `fileSeparator` | string | File separator |
| `flowId` | string | ID of the running flow |
| `lineSeparator` | string | Line separator |
| `startTime` | date | Flow start date/time |
| `systemDate` | date | System date |
| `version` | integer | Flow version |

### $task_result

Processing result information. Allows referencing error information from the most recent task execution result.

| Property | Type | Description |
|-----------|------|------|
| `error` | boolean | Whether an error occurred |
| `errorMessage` | string | Error message |
| `errorReport` | string | Error report |
| `executeId` | string | executeId of the executed task |
| `stackTrace` | string | Stack trace |

### $external_user_context

External user context. Allows determining whether the user is an external user.

| Property | Type | Description |
|-----------|------|------|
| `externalUser` | boolean | Whether the user is an external user |

## Operators and Functions

### Operators

- Ternary operator: `cond ? a : b`
- Comparison: `==`, `!=`, `<`, `>`, `<=`, `>=`
- Logical: `&&`, `||`, `!`

### Functions

| Function | Arguments | Return Value | Description |
|------|------|--------|------|
| `isEmpty(x)` | Array / Map / String / null / other | boolean | Determines if empty. Returns true for arrays/Maps with 0 elements, strings that are null or length 0, null values; returns false for others |
| `sizeOf(x)` | Array / Map / String | integer | Returns the number of elements or character count |
| `contains(collection, value)` | 1st argument: array or Map, 2nd argument: search value | boolean | Returns true if the element exists in the array or the key exists in the Map; false otherwise |
| `indexOf(x, search)` | 1st argument: array or string, 2nd argument: search value | integer | Returns the index of the first occurrence. Returns -1 if not found |
| `lastIndexOf(x, search)` | 1st argument: array or string, 2nd argument: search value | integer | Returns the index of the last occurrence. Returns -1 if not found |

## Samples

### gateway Conditional Branching

```jsonc
{
  "from": "im_gateway1",
  "to": "im_repositoryEntityDataUpdate1",
  "condition": "${!isEmpty(im_repositorySearchEntityData1)}"
}
```

### Multilingualization of errorMessage

```jsonc
{
  "type": "im_errorEnd",
  "properties": {
    "errorMessage": "${$account_context.locale=='ja'?$const.ERROR_NO_ARTICLE_FOUND_JA:($account_context.locale=='zh_CN'?$const.ERROR_NO_ARTICLE_FOUND_ZH_CN:$const.ERROR_NO_ARTICLE_FOUND_EN)}"
  }
}
```
