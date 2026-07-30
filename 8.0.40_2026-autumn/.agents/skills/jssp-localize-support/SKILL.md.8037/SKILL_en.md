---
name: jssp-localize-support
description: Internationalizes (i18n) hardcoded Japanese strings in intra-mart JSSP screens and function containers. Use when mentioned internationalizing, localizing, creating message properties, multi-language support, localize, or i18n. Externalizes labels and messages to property files, creates message property files, and rewrites code to use <imart type="message"> tags or the MessageManager API.
---

■■ Required Rules Checklist (Mandatory) ■■

Confirm the following before starting implementation. Do not proceed if any item is unchecked.

- [ ] [jssp-code-style](../../../requirements/jssp-code-style/AGENTS.md) has been read and understood
- [ ] [jssp-naming](../../../requirements/jssp-naming/AGENTS.md) has been read and understood


# JSSP Internationalization Support Skill

## Purpose

Externalizes hardcoded strings (labels, messages, error messages, etc.) in intra-mart Accel Platform JSSP code to message property files, achieving multi-language support.

## Confirm the Key Prefix (Vendor Identifier) [Required Before Starting]

The second segment of a message key, `APP` (e.g., `CAP.Z.APP.<product>.<feature>...`, `MSG.<error-type>.APP.<product>...`), is a string that identifies the vendor (provider) / application. **The default is `APP`** (a generic application identifier). For development for another company, this `APP` part must be changed to an identifier that matches that company or project.

**Before starting the internationalization work (before any of: creating spec.json, generating property files, or rewriting source), you MUST ask the user the following:**

> Do you want to keep the vendor identifier part of the message keys as `APP` (default), or change it to a different string? If changing, please specify the string (e.g., `ACME`).

- Use the identifier the user specifies **consistently** across the spec.json keys, the property files, and the source code rewrites.
- If the user answers "keep the default" / "`APP` is fine," or if there is an explicit instruction in advance, use `APP`.
- Reinterpret the `APP` used in the samples, examples, and tables within this skill according to the result of this confirmation.

## Supported Locales

Create the following 4 types of property files:

| Locale | File suffix | Content |
|---------|-------------|------|
| Japanese | `_ja` | Japanese messages |
| English | `_en` | English messages |
| Chinese | `_zh_CN` | Chinese (Simplified) messages |
| Default | (none) | Used when no locale matches. Same content as English |

## Script-Based Automation Workflow

Creating property files manually is prone to key inconsistencies between locales, encoding errors, and filename mistakes.
It is recommended to generate files in bulk from a spec JSON using **`build-i18n.js`** and verify with **`validate-i18n.js`**.

### Step Overview

```
1. Create spec JSON (list captions / messages / logMessages)
2. Bulk generate property files with build-i18n.js (12 files)
3. Verify with validate-i18n.js (fix until 0 errors)
4. Rewrite source code (see Step 3)
```

### build-i18n.js — Bulk Property File Generation

```bash
node .agents/skills/jssp-localize-support/scripts/build-i18n.js <spec.json> [--out <outputDir>]
```

If `--out` is omitted, the `outputDir` field in spec.json is used.

**spec.json format:**

```jsonc
{
  "outputDir": "src/main/conf/message/sample/my_feature",
  "captions": [
    { "key": "CAP.Z.APP.SAMPLE.MY.FEATURE.TITLE", "en": "My Feature", "ja": "マイ機能", "zh_CN": "我的功能" }
  ],
  "messages": [
    { "key": "MSG.E.APP.SAMPLE.MY.FEATURE.SYSTEM.ERROR", "en": "An unexpected error occurred.", "ja": "予期しないエラーが発生しました。", "zh_CN": "发生了意外错误。" }
  ],
  "logMessages": [
    { "key": "E.APP.SAMPLE.MY.FEATURE.00001", "en": "An error occurred while displaying the screen.", "ja": "画面表示中にエラーが発生しました。", "zh_CN": "显示画面时发生了错误。" }
  ]
}
```

Generated files (12 files):

| Category | Files |
|---------|--------|
| Caption | `caption.properties` (default=English), `caption_en.properties`, `caption_ja.properties`, `caption_zh_CN.properties` |
| Message | `message.properties`, `message_en.properties`, `message_ja.properties`, `message_zh_CN.properties` |
| Log message | `log-message.properties`, `log-message_en.properties`, `log-message_ja.properties`, `log-message_zh_CN.properties` |

### validate-i18n.js — Validation Script

```bash
node .agents/skills/jssp-localize-support/scripts/validate-i18n.js <messageDir> [--src <jssp_src_dir>]
```

**Validation items:**

| # | Check content |
|---|------------|
| 1 | Do all 12 files exist? |
| 2 | Do the default file (no suffix) and `_en` file have the same content? |
| 3 | Are key sets consistent across all locales? |
| 4 | Does the key comply with naming conventions (dot-delimited, no underscores or hyphens)? |
| 5 | Does the English file contain non-ASCII characters? |
| 6 | Are non-ASCII characters in ja / zh_CN files escaped in `\uXXXX` format? |
| 7 | Are line endings LF? |
| 8 | Do source files (when --src is specified) still contain Japanese string literals? (WARNING) |

Fix until the error count reaches 0 (WARNINGs are for review only).

---

## Manual Internationalization Steps

Follow these steps if working manually without scripts.

### Step 1: Identify Hardcoded Strings

Load the target files (.html / .js) and classify into the following categories:

| Category | Property file | Purpose | Key format |
|---------|-----------------|------|---------|
| Caption | `caption_<locale>.properties` | Short display strings such as titles, labels, button names | `CAP.Z.APP.<product>.<feature>.<caption-name>` |
| Message | `message_<locale>.properties` | Error messages, confirmation messages, success messages, etc. | `MSG.<error-type>.APP.<product>.<feature>.<message-name>` |
| Log message | `log-message_<locale>.properties` | Messages for Logger output | `<error-type>.APP.<product>.<feature>.<sequence>` |

**Error types:**
- `E` — Error message
- `W` — Warning message
- `I` — Information message
- `C` — Confirmation message

**Log message sequence:** 5-digit number starting from `00001`

**Key naming conventions:**
- Use only dots (`.`) as separators within keys
- Do not use underscores (`_`) or hyphens (`-`) in key names
- When a feature name or message name consists of multiple words, separate with dots (e.g., `SIMPLE.FORM`, `USER.CODE`, `SYSTEM.ERROR`)

### Step 2: Create Message Property Files

Location: `src/main/conf/message/<feature-directory-name>/`

Create 4 files per category (ja, en, zh_CN, default).

**Important: native2ascii encoding**

Non-ASCII characters in property files must be escaped in `\uXXXX` format.
How to convert in Node.js:

```javascript
function native2ascii(str) {
  return str.split('').map(c => {
    const code = c.charCodeAt(0);
    if (code > 127) {
      return String.raw`\u` + code.toString(16).padStart(4, '0');
    }
    return c;
  }).join('');
}
```

English property files only contain ASCII so no escaping is needed.
Japanese and Chinese require escaping.

**Property file format:**

```properties
CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE=\u30e6\u30fc\u30b6\u767b\u9332\u30fb\u524a\u9664
CAP.Z.APP.SKILLS.SIMPLE.FORM.SUBTITLE=\u30e6\u30fc\u30b6\u7ba1\u7406\u6a5f\u80fd
```

### Step 3: Rewrite Source Code

#### For presentation pages (.html)

Use the `<imart type="message">` tag.

**Inserting inline within HTML:**

```html
<h1><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE" escapeXml="true" escapeJs="false" /></h1>
```

**Inserting inline within JavaScript (inside `<script>` blocks):**

```javascript
imuiShowErrorMessage('<imart type="message" id="MSG.E.APP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR" escapeXml="false" escapeJs="true" />');
```

- HTML context: `escapeXml="true" escapeJs="false"`
- JavaScript context: `escapeXml="false" escapeJs="true"`

**Inserting within HTML attributes:**

```html
<span class="imds-required-label-required" data-required-label="<imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.REQUIRED" escapeXml="true" escapeJs="false" />">
```

#### For function containers (.js)

Use the `MessageManager.getMessage()` API.
See `reference/api-message-manager.md` for details.

```javascript
// Key only
let title = MessageManager.getMessage('CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE');

// With placeholder (replaced by {0}, {1}, ...)
Logger.error(MessageManager.getMessage('E.APP.SKILLS.SIMPLE.FORM.00001', e.message));
```

### Step 4: Remove Unnecessary Bind Variables

When presentation pages are updated to use `<imart type="message">` directly, bind variables that were previously set in the function container for titles etc. (such as `$title`, `$subTitle`) become unnecessary and should be deleted.

**Before (function container):**
```javascript
let $title = 'ユーザ登録・削除';
let $subTitle = 'ユーザ管理機能';
```

**After:** Delete the above bind variable declarations.

**Before (presentation page):**
```html
<h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
```

**After:**
```html
<h1><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE" escapeXml="true" escapeJs="false" /></h1>
```

## References

| File | Content |
|---------|------|
| `scripts/build-i18n.js` | Bulk generate property files from spec JSON (12 files) |
| `scripts/validate-i18n.js` | Property file validity validation script |
| `examples/expense_report.i18n.json` | Sample spec JSON (expense report application) |
| `reference/api-message-manager.md` | MessageManager API type definitions and usage examples |
| `assets/localized-form-example.md` | Implementation example of a localized form screen (source + complete property file set) |

## Notes

- Use LF line endings in property files
- Name the product and feature name parts of key names according to the project (separator is dot only; underscores and hyphens are prohibited)
- The second key segment `APP` (vendor identifier) is a default value; for development for another company, confirm with the user whether to change it before starting work (see "Confirm the Key Prefix (Vendor Identifier)")
- Internationalize validation messages on both the client side (JS within HTML) and the server side (API JS)
- Set the default text of `<span>` elements for error text to empty (since it is dynamically set by JS)
- Do not forget to replace bind variables displayed with `<imart type="string">` with `<imart type="message">`
