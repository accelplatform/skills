# 認可リソース・リソースグループ XML 仕様

認可の対象となる **リソース**（URI を持つ単位）と、それを束ねる **リソースグループ**（階層構造）を定義する。

## 認可リソースグループ

### 名前空間

```xml
<root xmlns="http://www.intra-mart.jp/authz/imex/resource-group">
  ...
</root>
```

### 基底ファイル（`<key>-authz-resource-group.xml`）

ID と親グループのみ定義する。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns="http://www.intra-mart.jp/authz/imex/resource-group">
  <authz-resource-group id="any-app-content-root">
  </authz-resource-group>

  <authz-resource-group id="any-app-http-services">
    <parent-group id="http-services" />
  </authz-resource-group>
</root>
```

| 属性 / 子要素 | 必須 | 内容 |
|--------------|------|------|
| `id` 属性 | YES | グループ ID（ケバブケース推奨） |
| `<parent-group>` | NO | 親グループの ID。標準グループ（`http-services` 等）を指定可 |

### 言語別ファイル（`<key>-authz-resource-group_<locale>.xml`）

表示名のみ記述。

```xml
<authz-resource-group id="any-app-http-services">
  <display-name>
    <name locale="ja">Any App</name>
  </display-name>
</authz-resource-group>
```

## 認可リソース

### 名前空間

```xml
<root xmlns="http://www.intra-mart.jp/authz/imex/resource">
  ...
</root>
```

### 基底ファイル（`<key>-authz-resource.xml`）

ID・URI・親グループを定義する。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns="http://www.intra-mart.jp/authz/imex/resource">
  <authz-resource id="any-app-content-maintenance" uri="service://any_app/maintenance/content">
    <parent-group id="any-app-http-services" />
  </authz-resource>
</root>
```

| 属性 / 子要素 | 必須 | 内容 |
|--------------|------|------|
| `id` 属性 | YES | リソース ID。`authz-policy` の `resource` 属性から参照される |
| `uri` 属性 | YES | リソース URI。**本プロジェクトでは `service://...` のみ対応**（後述「URI スキーム」参照） |
| `<parent-group>` | YES | 所属するリソースグループ ID |

### 言語別ファイル（`<key>-authz-resource_<locale>.xml`）

`uri` で対応付け、表示名のみ記述する（`id` 属性は不要）。

```xml
<authz-resource uri="service://any_app/maintenance/content">
  <display-name>
    <name locale="ja">Any App コンテンツ管理</name>
  </display-name>
</authz-resource>
```

## URI スキーム

本プロジェクトでは `service://` のみ使用する。

| スキーム | 用途 |
|----------|------|
| `service://<key>/<path>` | HTTP / 内部サービス（画面・API・ジョブから呼び出される処理を含むすべての認可対象） |

intra-mart の認可リソース URI スキームは他にも存在する可能性があるが、本スキルセットでは `service://` のみを対象とし、画面・ルーティングを含むすべての処理を `service://` で表現する。

## spec.json での記述

```json
"authzResourceGroups": [
  { "id": "any-app-content-root", "displayNames": { ... } },
  { "id": "any-app-http-services", "parentGroup": "http-services",
    "displayNames": { "ja": "Any App", "en": "Any App", "zh_CN": "Any App" } }
],

"authzResources": [
  {
    "id": "any-app-content-maintenance",
    "uri": "service://any_app/maintenance/content",
    "parentGroup": "any-app-http-services",
    "displayNames": {
      "ja": "Any App コンテンツ管理",
      "en": "Any App Content Maintenance",
      "zh_CN": "Any App 内容管理"
    }
  }
]
```

## 注意

- `authzResources[].parentGroup` で参照されるグループ ID は、`authzResourceGroups` に存在しているか、または intra-mart 標準のグループ `http-services` であること（本プロジェクトでは `http-services` のみ使用）
- リソース ID と URI の対応は **1:1** であること（同一 URI に複数 ID を割り当てない）
- 言語別ファイルでは `id` 属性ではなく `uri` 属性でマッチングする（基底とずれないように注意）
