# 授权资源、资源组 XML 规范

定义授权对象的 **资源**（具有 URI 的单位），以及将其聚合的 **资源组**（层级结构）。

## 授权资源组

### 命名空间

```xml
<root xmlns="http://www.intra-mart.jp/authz/imex/resource-group">
  ...
</root>
```

### 基础文件（`<key>-authz-resource-group.xml`）

仅定义 ID 和父组。

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

| 属性 / 子元素 | 必填 | 内容 |
|--------------|------|------|
| `id` 属性 | YES | 组 ID（推荐使用 kebab-case） |
| `<parent-group>` | NO | 父组的 ID。可指定标准组（如 `http-services` 等） |

### 语言别文件（`<key>-authz-resource-group_<locale>.xml`）

仅记述显示名称。

```xml
<authz-resource-group id="any-app-http-services">
  <display-name>
    <name locale="ja">Any App</name>
  </display-name>
</authz-resource-group>
```

## 授权资源

### 命名空间

```xml
<root xmlns="http://www.intra-mart.jp/authz/imex/resource">
  ...
</root>
```

### 基础文件（`<key>-authz-resource.xml`）

定义 ID、URI 和父组。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns="http://www.intra-mart.jp/authz/imex/resource">
  <authz-resource id="any-app-content-maintenance" uri="service://any_app/maintenance/content">
    <parent-group id="any-app-http-services" />
  </authz-resource>
</root>
```

| 属性 / 子元素 | 必填 | 内容 |
|--------------|------|------|
| `id` 属性 | YES | 资源 ID。由 `authz-policy` 的 `resource` 属性引用 |
| `uri` 属性 | YES | 资源 URI。**本项目仅支持 `service://...`**（详见后文"URI 方案"） |
| `<parent-group>` | YES | 所属的资源组 ID |

### 语言别文件（`<key>-authz-resource_<locale>.xml`）

通过 `uri` 进行匹配，仅记述显示名称（不需要 `id` 属性）。

```xml
<authz-resource uri="service://any_app/maintenance/content">
  <display-name>
    <name locale="ja">Any App コンテンツ管理</name>
  </display-name>
</authz-resource>
```

## URI 方案

`spec.authzResources`（本节所说明的、由用户手写的授权资源）仅使用 `service://`。

| 方案 | 用途 |
|------|------|
| `service://<key>/<path>` | HTTP / 内部服务（包含从画面、API、作业调用的处理在内的所有授权对象） |

intra-mart 可能还存在其他授权资源 URI 方案，但本技能集合仅针对 `service://`，将包括画面、路由在内的所有处理均以 `service://` 表示。

### 例外：`portletImport` 自动生成的授权资源

指定 `spec.portletImport.portlets` 时，会自动生成使用 `im-portal-portlet://<portletCd>` / `im-portal-portlet-editmode://<portletCd>` 方案的授权资源到 `<key>-authz-resource.xml` 中（无需在 `spec.authzResources` 中手写）。这是 `spec.authzResources` 的 `service://` 限定规则范围之外的特例，用于将 `authz-policy` 一侧直接把哈希值写入 `resource`（不经过 `id`）的方式，在管理画面中可视化呈现。详情请参阅 [portlet-import.md](portlet-import.md#授权资源key-authz-resourcexml的自动生成)。

## spec.json 中的写法

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

- 由 `authzResources[].parentGroup` 引用的组 ID 必须存在于 `authzResourceGroups` 中，或是 intra-mart 标准组 `http-services`（本项目仅使用 `http-services`）
- 资源 ID 与 URI 的对应关系必须为 **1:1**（不可对同一 URI 分配多个 ID）
- 语言别文件以 `uri` 属性而非 `id` 属性进行匹配（请注意不要与基础文件产生偏差）
