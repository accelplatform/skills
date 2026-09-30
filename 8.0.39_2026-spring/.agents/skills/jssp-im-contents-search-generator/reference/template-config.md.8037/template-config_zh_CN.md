# contentssearch-template-config XML 参考资料

定义各 TYPE 的模板路径和动态字段的配置文件结构参考资料。

---

## 文件存放位置

```
src/main/conf/contentssearch-template-config/{功能名}.xml
```

---

## XML 整体结构

```xml
<?xml version="1.0" encoding="UTF-8"?>
<contentssearch-template-config
    xmlns="http://intra-mart.co.jp/system/contentssearch/web/config/contentssearch-template-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://intra-mart.co.jp/system/contentssearch/web/config/contentssearch-template-config
                        ../../schema/contentssearch-template-config.xsd">

  <template-pages>

    <!-- 父 TYPE（筛选树的最上级） -->
    <template-page type="{功能名}" sort-key="20">
      <type-display-key>CAP.Z.APP.{功能名大写}.CONTENTSSEARCH.TYPE</type-display-key>
      <template-path>im_contents_search/template/{功能名}.jssp</template-path>
      <require-dynamic-fields>
        <field type="string">category</field>
        <field type="int">price</field>
      </require-dynamic-fields>
    </template-page>

    <!-- 子 TYPE（显示在父级之下） -->
    <template-page type="{子 TYPE}" sort-key="1">
      <parent-type>{功能名}</parent-type>
      <type-display-key>CAP.Z.APP.{功能名大写}.CONTENTSSEARCH.TYPE.{子 TYPE 大写}</type-display-key>
      <template-path>im_contents_search/template/{功能名}.jssp</template-path>
      <require-dynamic-fields>
        <field type="string">category</field>
        <field type="int">price</field>
      </require-dynamic-fields>
    </template-page>

  </template-pages>
</contentssearch-template-config>
```

---

## 属性和标签说明

### `<template-page>` 属性

| 属性 | 必填 | 说明 |
|-----|------|------|
| `type` | 必填 | TYPE 值。须与 Crawler 中 `setTypes()` 设置的值一致 |
| `sort-key` | 可选 | 在筛选树中的显示顺序（值越小显示越靠前） |

### `<template-page>` 子标签

| 标签 | 必填 | 说明 |
|-----|------|------|
| `<parent-type>` | 仅子 TYPE | 指定父 TYPE 的 `type` 属性值。平台负责解析层次结构 |
| `<type-display-key>` | 必填 | 筛选树中的显示名称。指定消息属性的键 |
| `<template-path>` | 必填 | 模板 JSSP 的路径。使用 `.jssp` 扩展名（指向 `.js` + `.html` 文件对） |
| `<require-dynamic-fields>` | 可选 | 传递给模板的动态字段。在此声明的字段将成为 `request` 参数的属性 |

### `<field>` 属性（在 require-dynamic-fields 内）

| 属性 | 必填 | 说明 |
|-----|------|------|
| `type` | 必填 | 字段类型（参见下表） |
| 内容（文本） | 必填 | 字段键名（`Fields.STRING.toField("category")` 的参数部分） |

**`type` 属性的值与对应的 `Fields.*`：**

| XML `type` 值 | 对应的 `Fields.*` | Solr 后缀 |
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

## 禁止使用的 TYPE

iAP 产品使用的以下 TYPE 值**禁止使用**。不得在 Crawler 的 `setTypes()` 或 XML 的 `type` 属性中指定。

| TYPE | 使用产品 |
|------|---------|
| `workflow` | IM-Workflow |
| `imbox` | IMBox |
| `iac` | Accel Collaboration |
| `bpw` | 文档工作流（BPW） |
| `acceldocuments` | Accel Documents |
| `wdc` | Accel Archive |
| `iag` | 组邮件 |
| `imkb` | IM-Knowledge |

> 上述列表之外的 TYPE 也可能在未来的产品更新中被预留。自定义 TYPE 应使用包含功能名或公司标识符的唯一名称（例：`mycompany_sales_order`）。

---

## TYPE 层次结构设计模式

### 模式 A：仅一个 TYPE 层级（无层次结构）

在 Crawler 中仅设置父 TYPE，如 `content.setTypes([CONTENT_TYPE])` 时。

```xml
<template-page type="{功能名}" sort-key="10">
  <type-display-key>CAP.Z.APP.{功能名大写}.CONTENTSSEARCH.TYPE</type-display-key>
  <template-path>im_contents_search/template/{功能名}.jssp</template-path>
</template-page>
```

### 模式 B：父 TYPE + 多个子 TYPE（按分类）

在 Crawler 中添加子 TYPE，如 `content.setTypes([CONTENT_TYPE, CONTENT_TYPE + '$' + category])` 时。

```xml
<!-- 父 TYPE -->
<template-page type="{功能名}" sort-key="20">
  <type-display-key>CAP.Z.APP.{功能名大写}.CONTENTSSEARCH.TYPE</type-display-key>
  <template-path>im_contents_search/template/{功能名}.jssp</template-path>
  <require-dynamic-fields>
    <field type="string">category</field>
  </require-dynamic-fields>
</template-page>

<!-- 子 TYPE: category_a -->
<template-page type="category_a" sort-key="1">
  <parent-type>{功能名}</parent-type>
  <type-display-key>CAP.Z.APP.{功能名大写}.CONTENTSSEARCH.TYPE.CATEGORY_A</type-display-key>
  <template-path>im_contents_search/template/{功能名}.jssp</template-path>
  <require-dynamic-fields>
    <field type="string">category</field>
  </require-dynamic-fields>
</template-page>

<!-- 子 TYPE: category_b -->
<template-page type="category_b" sort-key="2">
  <parent-type>{功能名}</parent-type>
  <type-display-key>CAP.Z.APP.{功能名大写}.CONTENTSSEARCH.TYPE.CATEGORY_B</type-display-key>
  <template-path>im_contents_search/template/{功能名}.jssp</template-path>
  <require-dynamic-fields>
    <field type="string">category</field>
  </require-dynamic-fields>
</template-page>
```

**重要：** 子 TYPE 的 `type` 属性只指定 `"category_a"`，而不是 `"{功能名}$category_a"`。`{功能名}$` 前缀是 Crawler `setTypes()` 中使用的命名规则，而 XML 配置通过 `type` 属性和 `<parent-type>` 标签来解析层次结构。

---

## Crawler 的 setTypes 与 XML 的 type 的对应关系

| Crawler `setTypes` 的值 | XML `type` 属性 | XML `<parent-type>` 标签 |
|------------------------|----------------|----------------------|
| `"feature_name"` | `type="feature_name"` | 无（父 TYPE） |
| `"feature_name$category_a"` | `type="category_a"` | `<parent-type>feature_name</parent-type>` |

---

## 与消息属性的对应关系

`<type-display-key>` 和 `imart type="message"` 的 `id` 属性中指定的键，在 `src/main/conf/message/` 下的 `.properties` 文件中定义。

配置示例：

```properties
CAP.Z.APP.{功能名大写}.CONTENTSSEARCH.TYPE=父 TYPE 在筛选树中的显示名称
CAP.Z.APP.{功能名大写}.CONTENTSSEARCH.TYPE.{子 TYPE 大写}=子 TYPE 在筛选树中的显示名称
```

模板中引用的消息属性配置示例：

```properties
CAP.Z.APP.{功能名大写}.CONTENTSSEARCH.FIELD_NAME.{字段键大写}=检索结果模板中显示的字段键的显示名称
```

**注意：** 日语和中文消息属性文件必须使用 Unicode 转义格式（`\uXXXX`）编写。
