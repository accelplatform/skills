---
name: jssp-im-contents-search-generator
description: Generates custom Crawlers for IM-ContentsSearch (Solr index registration/deletion Jobs) and custom content display Search Result Templates. Use when mentioned: create a Crawler, register to Solr, enable full-text search, add content search, extend IM-ContentsSearch, create a Search Result Template. Combine with jssp-im-job-generator to also guide Job registration steps.
---

■■ Required Rules Checklist (Mandatory) ■■

Confirm the following before starting implementation. Do not proceed if any item is unchecked.

- [ ] [jssp-accessibility](../../../requirements/jssp-accessibility/AGENTS.md) has been read and understood
- [ ] [jssp-code-style](../../../requirements/jssp-code-style/AGENTS.md) has been read and understood
- [ ] [jssp-error-handling](../../../requirements/jssp-error-handling/AGENTS.md) has been read and understood
- [ ] [jssp-file-structure](../../../requirements/jssp-file-structure/AGENTS.md) has been read and understood
- [ ] [jssp-logging](../../../requirements/jssp-logging/AGENTS.md) has been read and understood
- [ ] [jssp-naming](../../../requirements/jssp-naming/AGENTS.md) has been read and understood
- [ ] [jssp-overview](../../../requirements/jssp-overview/AGENTS.md) has been read and understood
- [ ] [jssp-presentation-page](../../../requirements/jssp-presentation-page/AGENTS.md) has been read and understood
- [ ] [jssp-security](../../../requirements/jssp-security/AGENTS.md) has been read and understood


# IM-ContentsSearch Extension Program Generation Skill

## Purpose

A skill for extending the IM-ContentsSearch feature of intra-mart Accel Platform, generating Solr registration (Crawler Jobs) for custom Contents and custom Search Result Templates (JSSP).

Because no official API is provided for SSJS, Java classes are called directly via Rhino's `Packages.***` syntax.

## Output Targets

| Category | File | Role | Multilingual |
|------|---------|------|-------|
| Crawler Job program | No specific naming convention as long as it is placed where server-side JavaScript is recognized (e.g., `src/main/jssp/src/`) (e.g., `src/main/jssp/src/{feature_name}/job/crawler.js`) | Crawler Job (Solr index registration/deletion) | - |
| Search Result Template | No specific naming convention as long as it follows the Script development model (JSSP) structure (e.g., `src/main/jssp/src/im_contents_search/template/{feature_name}.js`) | Search Result Template (Function container) | - |
| Search Result Template | No specific naming convention as long as it follows the Script development model (JSSP) structure (e.g., `src/main/jssp/src/im_contents_search/template/{feature_name}.html`) | Search Result Template (Presentation page) | - |
| Search Result Template | `src/main/conf/contentssearch-template-config/{feature_name}.xml` | Template configuration (TYPE, template path, Dynamic field definitions) | - |
| Search Result Template | If a Message properties file already exists under `src/main/conf/message/`, keys may be added to that existing file instead of creating a dedicated one (e.g., `src/main/conf/message/{module_identifier}/{feature_name}/contents_search/caption*.properties`) | Message properties file for search result display (defines TYPE display names, field labels, etc.) | ja / en / zh_CN |

Both Crawler-only and template-only generation are supported depending on the situation.

## Conventions to Follow

| Convention | Handling |
|------|---------|
| `jssp-function-container.md` | 🟢 **Required** — `init()` structure of the template JS |
| `jssp-naming.md` / `jssp-code-style.md` | 🟢 Required |
| `jssp-error-handling.md` / `jssp-logging.md` | 🟢 **Required** — Crawlers require detailed logging and error handling |
| `jssp-2way-sql.md` | 🟡 **Reference only when using 2WaySQL** (e.g., when using 2WaySQL for Crawler source queries) |
| `jssp-presentation-page.md` | 🟡 Basic structure of the template HTML (imcs-specific classes: refer to this skill's assets first) |
| `jssp-security.md` | 🟡 Refer to the XSS countermeasure section when implementing template HTML. Since search result content (the `request` argument) comes from Apache Solr, the risk of stored XSS is not zero. Use `textContent` for DOM manipulation and restrict `innerHTML` to iAP-internally-generated HTML only |

---

## Implementation Steps

**Execute this workflow in order from top to bottom. Skipping or reordering steps is not allowed.**

---

### Step 1: Requirements Gathering

Confirm the following information with the user. For any undecided items, the skill will propose appropriate defaults.

**When generating a Crawler:**

| Item | Notes |
|---------|------|
| Feature name (physical name) | Used in file paths and constants (e.g., `sales_order`). Snake case is recommended |
| Content source data | The data source used to generate Contents for registration (e.g., table names and column definitions if generating Contents from data stored in a DB) |
| Content definition | Definition information for designing the structure of Contents for registration (Standard field and Dynamic field definitions, data types, conversion rules, etc.) ※ Refer to the field type table in `reference/dynamic-fields.md` for Solr field types |
| TYPE design | Whether a hierarchy of a parent TYPE (e.g., `sales_order`) plus child TYPEs (per category) is needed. **TYPEs used by iAP products (`workflow` / `imbox` / `iac` / `bpw` / `acceldocuments` / `wdc` / `iag` / `imkb`) are prohibited.** Since additional TYPEs may be added by future product updates, use unique names that include the feature name or company identifier for custom TYPEs |
| Detail page URL | Link to the source information page attached to the search result (relative path set via `content.setUrl()`) (e.g., `sales_order/detail`) |
| Access control settings | See `reference/aci-builders.md` for available builders. Representative options: `EveryoneACIBuilder` (all authenticated users) / `StandardRoleACIBuilder` (specific Role) / `StandardUserACIBuilder` (specific user) / `StandardDepartmentACIBuilder` (department), etc. Can also be set dynamically per data row |

**When generating a template:**

| Item | Notes |
|---------|------|
| Fields to display in the Search Result Template | Standard fields and Dynamic fields to display (must match the Crawler) |
| Need for multilingual support | If needed, confirm display text for each language |

---

### Step 2: Load Assets

Load the following assets using the **Read tool** according to the program to be generated. **This step must not be skipped.**

| Target | File to Load |
|---------|----------------|
| Crawler | `assets/simple-crawler.md` |
| Template (JS/HTML) | `assets/simple-template.md` |

---

### Step 3: Load Java API Reference

Load the following reference files using the **Read tool**. Do not write Java class names or methods from memory or inference.

| File | When to Read |
|---------|---------|
| `reference/java-api-classes.md` | **Always** — fully qualified names, key methods, and SSJS constraints for all Java classes |
| `reference/aci-builders.md` | **Always** — constructors and SSJS call patterns for all 9 available access control builders |
| `reference/dynamic-fields.md` | When using Dynamic fields — `Fields.*` types and data type conversion patterns |
| `reference/template-config.md` | When generating a template — XML configuration structure |

---

### Step 4: Generate the Crawler Job

Generate the Crawler Job program (e.g., `src/main/jssp/src/{feature_name}/job/crawler.js`) using `assets/simple-crawler.md` as reference.

※ Use `jssp-im-job-generator` for the Job program.

**Required structure of the Crawler Job program:**

1. Java class references (`let ContentsSearchManager = Packages.***`, etc.)
2. `execute()` — Job entry point (retrieve parameters via `Contexts.getJobSchedulerContext().getParameter()`)
3. `executeDelta(manager, withCommit)` — Differential Crawling
4. `executeDelete(manager, withCommit)` — Remove Crawling
5. Helper functions for Contents registration (Standard fields + Dynamic fields + attachments + access control) and deletion (if needed)

**Prohibited:**
- Inheriting from `BaseCrawlingJob` (not possible in SSJS; implement the `execute()` function directly)
- Using `valueOf` such as `java.lang.Integer.valueOf()` (Rhino converts the return value back to a JS Number; use the `new` constructor instead)
- Passing INT/LONG field values as JS Numbers to `setValue`

---

### Step 5: Generate the Template

Generate the Search Result Template (Function container / Presentation page) based on `assets/simple-template.md`.

Example output files:
- `src/main/jssp/src/im_contents_search/template/{feature_name}.js`
- `src/main/jssp/src/im_contents_search/template/{feature_name}.html`

**Required implementations in the template JS:**
1. Global variable declaration `let $data = '{}';` (initialized as a JSON string)
2. `init(request)` function — entry point called by iAP for each item. Calls `main(request)` and stores the `response` return value into `$data` via `JSON.stringify(response).replace(/\//g, '\\/')`
3. `main(request)` function — handles errors with try/catch and returns an object in the form `{ result: null, error: { code, message } }`
4. `processBusinessLogic(request)` function — builds and returns the display data. Retrieve display labels server-side using `MessageManager.getMessage()` and include them in the `labels` property
5. Helper functions for date/number formatting (if needed)

**Required implementations in the Presentation page:**
- Use `<div>` as the root, preceded by an HTML skeleton with the CSS classes `imcs-content-detail-title` / `imcs-content-detail-subtitle` / `imcs-content-detail-option` / `imcs-content-detail-snippets`
- Place an IIFE-style `<script>` block at the end of the `<div>`
- Place `(function($data) {` immediately after the `<script>` tag, receiving the JSON expanded via `<imart type="string" value=$data escapeXml="false" escapeJs="false" />` as the IIFE argument (do not make `$data` a global variable)
- If `$data.error.code` is set, hide the container and stop processing
- Get the container via `document.currentScript.parentElement` and reference each element using `querySelector`, setting values with `textContent` / `innerHTML`

**Prohibited:**
- Using `innerHTML` for user-derived values (`$data.result.title`, Dynamic field values, etc.) — use `textContent` to prevent XSS
- `innerHTML` must be used only for `$data.result.snippets` (text in which iAP has marked up keywords with `<b>` tags)
- Calling `ContentsSearchManager.search()` from the template (the template is passive)

---

### Step 6: Generate the Template Configuration XML

Generate the following file with reference to `reference/template-config.md`.

**Output file:**
- `src/main/conf/contentssearch-template-config/{feature_name}.xml`

**Implementation points:**
- Align the TYPE hierarchy (parent/child) with the `setTypes()` design in the Crawler
- For child TYPEs, specify only the child TYPE in the `type` attribute (not `"<parent_TYPE>$<child_TYPE>"`), and explicitly declare the parent using `<parent-type>`
- In `<require-dynamic-fields>`, declare **only the Dynamic fields that are displayed** in the template HTML
- Use the `.jssp` extension for `<template-path>` (refers to the `.js` / `.html` pair)

**Search result templates do not need routing configuration under `routing-jssp-config/`.** The template is invoked directly by IM-ContentsSearch via `<template-path>`, so it does not go through URL routing like a normal screen (see the "Exception Rules for Screens Not Called Through the Routing Table" section in `.agents/requirements/jssp-file-structure/AGENTS.md` for details).

---

### Step 7: Generate Message Properties

Set display names in the Message properties file.

If a Message properties file already exists under `src/main/conf/message/`, keys may be added to that existing file instead of creating a dedicated one.

※ Use `jssp-localize-support` to create properties files.

**Required keys:**

- Message properties key for the parent TYPE display name
- Message properties key for child TYPE display names (if child TYPEs exist)
- Message properties key for field display names shown in the search results (if custom fields are displayed in the search results)

Japanese (`caption_ja.properties`) and Chinese (`caption_zh_CN.properties`) Message properties files **must be written in Unicode escape format** (equivalent to `native2ascii`).

---

### Step 8: Guide on Job Scheduler Registration

When a Crawler is generated, provide the user with the following information.

**Crawler Job parameter design:**

Follow the parameter keys and default values defined in the Javadoc of `BaseCrawlingJob.java`.

| Parameter | Default | Allowed Values | Behavior |
|------------|-----------|--------|------|
| `crawlingType` | `DELTA` | `DELTA` / `DELETE` / `REINDEX` | Crawling type |
| `withCommit` | `true` | boolean string | Commit after processing |
| `withOptimize` | `false` | boolean string | Optimize after Crawling completes. Since this is resource-intensive, it is recommended to place an `OptimizeJob` at the end of a Job network |
| `maxSegments` | `1` | Integer ≥ 1 | Number of segments for optimization. Smaller values yield higher optimization accuracy but higher processing load. Effective when `withOptimize=true` |
| `groupName` | `"default"` | String | Search server group name (Solr connection setting) |

**Initial run:** Create a full index with `crawlingType=REINDEX`.
**Scheduled run:** Run on a schedule with `crawlingType=DELTA`.

---

## SSJS (Rhino) Constraints

Refer to `reference/java-api-classes.md` for details. Summary of key constraints:

| Constraint | Workaround |
|------|--------|
| Passing a single value to a Java varargs method may not resolve correctly | Wrap in a JS array (e.g., `content.addText([description])`, `content.setTypes([type1, type2])`) |
| When calling a method whose parameter type is a wrapper class (Integer, Long, etc.) rather than a primitive type (int, long, etc.), explicit type conversion is required | Convert explicitly with `new java.lang.Integer(val)` or `new java.lang.Long(val)` before passing. Type conversion via `Integer.valueOf()` etc. cannot be used because Rhino converts the return value to a Number type |
| `LastCrawlingDateHolder` has no method to clear the date | Set a past date with `updateLastCrawlingDate(new java.util.Date(0))` to reset |
| `for...in` cannot be used on Java `List` | Iterate with `for (let i = 0; i < list.size(); i++) list.get(i)` |
