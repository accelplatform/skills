---
paths:
  - "src/main/conf/contentssearch-template-config/**/*.xml"
---

# contentssearch-template-config XML リファレンス

TYPE ごとのテンプレートパスと動的フィールドを定義する設定ファイルの構造リファレンス。

---

## ファイル配置場所

```
src/main/conf/contentssearch-template-config/{機能名}.xml
```

---

## XML 全体構造

```xml
<?xml version="1.0" encoding="UTF-8"?>
<contentssearch-template-config
    xmlns="http://intra-mart.co.jp/system/contentssearch/web/config/contentssearch-template-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://intra-mart.co.jp/system/contentssearch/web/config/contentssearch-template-config
                        ../../schema/contentssearch-template-config.xsd">

  <template-pages>

    <!-- 親 TYPE（絞り込みツリーの最上位） -->
    <template-page type="{機能名}" sort-key="20">
      <type-display-key>CAP.Z.APP.{機能名大文字}.CONTENTSSEARCH.TYPE</type-display-key>
      <template-path>im_contents_search/template/{機能名}.jssp</template-path>
      <require-dynamic-fields>
        <field type="string">category</field>
        <field type="int">price</field>
      </require-dynamic-fields>
    </template-page>

    <!-- 子 TYPE（親の下位に表示される） -->
    <template-page type="{サブ TYPE}" sort-key="1">
      <parent-type>{機能名}</parent-type>
      <type-display-key>CAP.Z.APP.{機能名大文字}.CONTENTSSEARCH.TYPE.{サブ TYPE 大文字}</type-display-key>
      <template-path>im_contents_search/template/{機能名}.jssp</template-path>
      <require-dynamic-fields>
        <field type="string">category</field>
        <field type="int">price</field>
      </require-dynamic-fields>
    </template-page>

  </template-pages>
</contentssearch-template-config>
```

---

## 属性・タグの説明

### `<template-page>` 属性

| 属性 | 必須 | 説明 |
|-----|------|------|
| `type` | 必須 | TYPE 値。クローラで `setTypes()` に設定した値と一致させる |
| `sort-key` | 任意 | 絞り込みツリーでの表示順（小さいほど上位に表示） |

### `<template-page>` 子タグ

| タグ | 必須 | 説明 |
|-----|------|------|
| `<parent-type>` | 子 TYPE のみ | 親 TYPE の `type` 属性値を指定。階層をプラットフォームが解決する |
| `<type-display-key>` | 必須 | 絞り込みツリーの表示名。メッセージプロパティのキーを指定 |
| `<template-path>` | 必須 | テンプレート JSSP のパス。`.jssp` 拡張子を使う（`.js` + `.html` のペアを指す） |
| `<require-dynamic-fields>` | 任意 | テンプレートに渡す動的フィールド。ここで宣言したものが `request` 引数のプロパティになる |

### `<field>` 属性（require-dynamic-fields 内）

| 属性 | 必須 | 説明 |
|-----|------|------|
| `type` | 必須 | フィールド種別（下表参照） |
| 内容（テキスト） | 必須 | フィールドキー名（`Fields.STRING.toField("category")` の引数部分） |

**`type` 属性の値と対応する `Fields.*`:**

| XML `type` 値 | 対応する `Fields.*` | Solr サフィックス |
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

## 使用禁止 TYPE

iAP 製品が使用している以下の TYPE 値は**使用禁止**。クローラの `setTypes()` にも XML の `type` 属性にも指定しないこと。

| TYPE | 使用製品 |
|------|---------|
| `workflow` | IM-Workflow |
| `imbox` | IMBox |
| `iac` | Accel Collaboration |
| `bpw` | ドキュメントワークフロー（BPW） |
| `acceldocuments` | Accel Documents |
| `wdc` | Accel Archive |
| `iag` | グループメール |
| `imkb` | IM-Knowledge |

> 上記以外の TYPE も今後の製品追加によって予約される可能性がある。独自 TYPE には機能名や会社識別子を含む固有の名称（例: `mycompany_sales_order`）を使うこと。

---

## TYPE 階層の設計パターン

### パターン A: TYPE が 1 階層のみ（階層なし）

クローラで `content.setTypes([CONTENT_TYPE])` のように親 TYPE のみを設定する場合。

```xml
<template-page type="{機能名}" sort-key="10">
  <type-display-key>CAP.Z.APP.{機能名大文字}.CONTENTSSEARCH.TYPE</type-display-key>
  <template-path>im_contents_search/template/{機能名}.jssp</template-path>
</template-page>
```

### パターン B: 親 TYPE + 複数の子 TYPE（分類ごと）

クローラで `content.setTypes([CONTENT_TYPE, CONTENT_TYPE + '$' + category])` のように子 TYPE を追加する場合。

```xml
<!-- 親 TYPE -->
<template-page type="{機能名}" sort-key="20">
  <type-display-key>CAP.Z.APP.{機能名大文字}.CONTENTSSEARCH.TYPE</type-display-key>
  <template-path>im_contents_search/template/{機能名}.jssp</template-path>
  <require-dynamic-fields>
    <field type="string">category</field>
  </require-dynamic-fields>
</template-page>

<!-- 子 TYPE: category_a -->
<template-page type="category_a" sort-key="1">
  <parent-type>{機能名}</parent-type>
  <type-display-key>CAP.Z.APP.{機能名大文字}.CONTENTSSEARCH.TYPE.CATEGORY_A</type-display-key>
  <template-path>im_contents_search/template/{機能名}.jssp</template-path>
  <require-dynamic-fields>
    <field type="string">category</field>
  </require-dynamic-fields>
</template-page>

<!-- 子 TYPE: category_b -->
<template-page type="category_b" sort-key="2">
  <parent-type>{機能名}</parent-type>
  <type-display-key>CAP.Z.APP.{機能名大文字}.CONTENTSSEARCH.TYPE.CATEGORY_B</type-display-key>
  <template-path>im_contents_search/template/{機能名}.jssp</template-path>
  <require-dynamic-fields>
    <field type="string">category</field>
  </require-dynamic-fields>
</template-page>
```

**重要:** 子 TYPE の `type` 属性は `"{機能名}$category_a"` ではなく `"category_a"` のみ指定する。
`{機能名}$` プレフィックスはクローラの `setTypes()` で使う命名規則だが、XML 設定の `type` 属性と `parent-type` タグで階層を解決する仕組みになっている。

---

## クローラの setTypes と XML の type の対応

| クローラ `setTypes` の値 | XML `type` 属性 | XML `parent-type` タグ |
|------------------------|----------------|----------------------|
| `"feature_name"` | `type="feature_name"` | なし（親 TYPE） |
| `"feature_name$category_a"` | `type="category_a"` | `<parent-type>feature_name</parent-type>` |

---

## メッセージプロパティとの対応

`<type-display-key>` と `imart type="message"` の `id` 属性に指定するキーは、
`src/main/conf/message/` 配下の `.properties` ファイルに定義する。

設定例:

```properties
CAP.Z.APP.{機能名大文字}.CONTENTSSEARCH.TYPE=親 TYPE の絞り込みツリー表示名
CAP.Z.APP.{機能名大文字}.CONTENTSSEARCH.TYPE.{サブ TYPE 大文字}=子 TYPE の絞り込みツリー表示名
```

テンプレートで参照するメッセージプロパティの設定例:

```properties
CAP.Z.APP.{機能名大文字}.CONTENTSSEARCH.FIELD_NAME.{フィールドキー大文字}=検索結果テンプレートに表示するフィールドキーの表示名
```

**注意:** 日本語・中国語のメッセージプロパティファイルは必ず Unicode エスケープ形式（`\uXXXX`）で記述する。
