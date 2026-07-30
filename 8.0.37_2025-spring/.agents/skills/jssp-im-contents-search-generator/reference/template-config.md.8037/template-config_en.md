# contentssearch-template-config XML Reference

A structure reference for the configuration file that defines the template path and Dynamic fields for each TYPE.

---

## File Location

```
src/main/conf/contentssearch-template-config/{feature_name}.xml
```

---

## Overall XML Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<contentssearch-template-config
    xmlns="http://intra-mart.co.jp/system/contentssearch/web/config/contentssearch-template-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://intra-mart.co.jp/system/contentssearch/web/config/contentssearch-template-config
                        ../../schema/contentssearch-template-config.xsd">

  <template-pages>

    <!-- Parent TYPE (top of the filter tree) -->
    <template-page type="{feature_name}" sort-key="20">
      <type-display-key>CAP.Z.APP.{FEATURE_NAME}.CONTENTSSEARCH.TYPE</type-display-key>
      <template-path>im_contents_search/template/{feature_name}.jssp</template-path>
      <require-dynamic-fields>
        <field type="string">category</field>
        <field type="int">price</field>
      </require-dynamic-fields>
    </template-page>

    <!-- Child TYPE (displayed under the parent) -->
    <template-page type="{sub_TYPE}" sort-key="1">
      <parent-type>{feature_name}</parent-type>
      <type-display-key>CAP.Z.APP.{FEATURE_NAME}.CONTENTSSEARCH.TYPE.{SUB_TYPE}</type-display-key>
      <template-path>im_contents_search/template/{feature_name}.jssp</template-path>
      <require-dynamic-fields>
        <field type="string">category</field>
        <field type="int">price</field>
      </require-dynamic-fields>
    </template-page>

  </template-pages>
</contentssearch-template-config>
```

---

## Attribute and Tag Descriptions

### `<template-page>` Attributes

| Attribute | Required | Description |
|-----|------|------|
| `type` | Required | TYPE value. Must match the value set in `setTypes()` in the Crawler |
| `sort-key` | Optional | Display order in the filter tree (smaller values appear higher) |

### `<template-page>` Child Tags

| Tag | Required | Description |
|-----|------|------|
| `<parent-type>` | Child TYPE only | Specify the `type` attribute value of the parent TYPE. The platform resolves the hierarchy |
| `<type-display-key>` | Required | Display name in the filter tree. Specify the key for the Message properties |
| `<template-path>` | Required | Path to the template JSSP. Use the `.jssp` extension (refers to the `.js` + `.html` pair) |
| `<require-dynamic-fields>` | Optional | Dynamic fields passed to the template. What is declared here becomes properties of the `request` argument |

### `<field>` Attributes (inside require-dynamic-fields)

| Attribute | Required | Description |
|-----|------|------|
| `type` | Required | Field type (see the table below) |
| Content (text) | Required | Field key name (the argument of `Fields.STRING.toField("category")`) |

**Values of the `type` Attribute and Corresponding `Fields.*`:**

| XML `type` Value | Corresponding `Fields.*` | Solr Suffix |
|--------------|-------------------|----------------|
| `string` | `Fields.STRING` | `*_string` |
| `string_mlt` | `Fields.STRING_MLT` | `*_string_mlt` |
| `int` | `Fields.INT` | `*_integer` |
| `int_mlt` | `Fields.INT_MLT` | `*_integer_mlt` |
| `long` | `Fields.LONG` | `*_long` |
| `long_mlt` | `Fields.LONG_MLT` | `*_long_mlt` |
| `date` | `Fields.DATE` | `*_date` |
| `date_mlt` | `Fields.DATE_MLT` | `*_date_mlt` |
| `boolean` | `Fields.BOOLEAN` | `*_boolean` |
| `boolean_mlt` | `Fields.BOOLEAN_MLT` | `*_boolean_mlt` |
| `ngram` | `Fields.NGRAM` | `*_ngram` |
| `ngram_mlt` | `Fields.NGRAM_MLT` | `*_ngram_mlt` |
| `morph` | `Fields.MORPH` | `*_morph` |
| `morph_mlt` | `Fields.MORPH_MLT` | `*_morph_mlt` |
| `whitespace` | `Fields.WHITESPACE` | `*_ws` |
| `whitespace_mlt` | `Fields.WHITESPACE_MLT` | `*_ws_mlt` |

---

## Prohibited TYPEs

The following TYPE values used by iAP products are **prohibited**. Do not specify them in either the Crawler's `setTypes()` or the XML's `type` attribute.

| TYPE | Product Using It |
|------|---------|
| `workflow` | IM-Workflow |
| `imbox` | IMBox |
| `iac` | Accel Collaboration |
| `bpw` | Document Workflow (BPW) |
| `acceldocuments` | Accel Documents |
| `wdc` | Accel Archive |
| `iag` | Group Mail |
| `imkb` | IM-Knowledge |

> TYPEs other than those listed above may also be reserved by future product additions. Use unique names that include the feature name or company identifier for custom TYPEs (e.g., `mycompany_sales_order`).

---

## TYPE Hierarchy Design Patterns

### Pattern A: Single TYPE level (no hierarchy)

When setting only the parent TYPE in the Crawler, such as `content.setTypes([CONTENT_TYPE])`.

```xml
<template-page type="{feature_name}" sort-key="10">
  <type-display-key>CAP.Z.APP.{FEATURE_NAME}.CONTENTSSEARCH.TYPE</type-display-key>
  <template-path>im_contents_search/template/{feature_name}.jssp</template-path>
</template-page>
```

### Pattern B: Parent TYPE + multiple child TYPEs (by category)

When adding child TYPEs in the Crawler, such as `content.setTypes([CONTENT_TYPE, CONTENT_TYPE + '$' + category])`.

```xml
<!-- Parent TYPE -->
<template-page type="{feature_name}" sort-key="20">
  <type-display-key>CAP.Z.APP.{FEATURE_NAME}.CONTENTSSEARCH.TYPE</type-display-key>
  <template-path>im_contents_search/template/{feature_name}.jssp</template-path>
  <require-dynamic-fields>
    <field type="string">category</field>
  </require-dynamic-fields>
</template-page>

<!-- Child TYPE: category_a -->
<template-page type="category_a" sort-key="1">
  <parent-type>{feature_name}</parent-type>
  <type-display-key>CAP.Z.APP.{FEATURE_NAME}.CONTENTSSEARCH.TYPE.CATEGORY_A</type-display-key>
  <template-path>im_contents_search/template/{feature_name}.jssp</template-path>
  <require-dynamic-fields>
    <field type="string">category</field>
  </require-dynamic-fields>
</template-page>

<!-- Child TYPE: category_b -->
<template-page type="category_b" sort-key="2">
  <parent-type>{feature_name}</parent-type>
  <type-display-key>CAP.Z.APP.{FEATURE_NAME}.CONTENTSSEARCH.TYPE.CATEGORY_B</type-display-key>
  <template-path>im_contents_search/template/{feature_name}.jssp</template-path>
  <require-dynamic-fields>
    <field type="string">category</field>
  </require-dynamic-fields>
</template-page>
```

**Important:** For child TYPEs, specify only `"category_a"` in the `type` attribute, not `"{feature_name}$category_a"`. The `{feature_name}$` prefix is a naming convention used in the Crawler's `setTypes()`, but the XML configuration resolves the hierarchy through the `type` attribute and the `<parent-type>` tag.

---

## Mapping Between Crawler setTypes and XML type

| Crawler `setTypes` Value | XML `type` Attribute | XML `<parent-type>` Tag |
|------------------------|----------------|----------------------|
| `"feature_name"` | `type="feature_name"` | None (parent TYPE) |
| `"feature_name$category_a"` | `type="category_a"` | `<parent-type>feature_name</parent-type>` |

---

## Mapping to Message Properties

Keys specified in `<type-display-key>` and the `id` attribute of `imart type="message"` are defined in `.properties` files under `src/main/conf/message/`.

Configuration example:

```properties
CAP.Z.APP.{FEATURE_NAME}.CONTENTSSEARCH.TYPE=Parent TYPE display name in the filter tree
CAP.Z.APP.{FEATURE_NAME}.CONTENTSSEARCH.TYPE.{SUB_TYPE}=Child TYPE display name in the filter tree
```

Configuration example for Message properties referenced in the template:

```properties
CAP.Z.APP.{FEATURE_NAME}.CONTENTSSEARCH.FIELD_NAME.{FIELD_KEY}=Display name of the field key shown in the Search Result Template
```

**Note:** Japanese and Chinese Message properties files must be written in Unicode escape format (`\uXXXX`).
