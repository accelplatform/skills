# 授权主体组 XML 规范

定义"在授权策略的 subject 栏中显示的候选组"。
这些会在用户于 intra-mart 管理画面进行授权设置时作为 **下拉候选项** 出现。

## 命名空间

```xml
<subject-groups xmlns="http://www.intra-mart.jp/authz/imex/subject-group">
  ...
</subject-groups>
```

请注意 **根元素为 `<subject-groups>`**（而非 `<root>`）。

## 基础文件（`<key>-authz-subject-group.xml`）

仅定义 `sort-key` 和 `expression`。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<subject-groups xmlns="http://www.intra-mart.jp/authz/imex/subject-group">
  <authz-subject-group sort-key="900">
    <expression>S(b_m_role:app_manager)</expression>
  </authz-subject-group>
</subject-groups>
```

| 属性 / 子元素 | 必填 | 内容 |
|--------------|------|------|
| `sort-key` 属性 | YES | 显示顺序（值越小越靠前）。按惯例使用 100-999 |
| `<expression>` | YES | subject 表达式（如 `S(b_m_role:...)` 等）。与 `authz-policy.md` 中的 subject 格式相同 |

## 语言别文件（`<key>-authz-subject-group_<locale>.xml`）

通过 `expression` 进行匹配，并附加显示名称。

```xml
<authz-subject-group sort-key="900">
  <display-name>
    <name locale="ja">Any App 管理者</name>
  </display-name>
  <expression>S(b_m_role:app_manager)</expression>
</authz-subject-group>
```

`sort-key` 与 `<expression>` 两者均为与基础文件的匹配键。

## spec.json 中的写法

```json
"authzSubjectGroups": [
  {
    "sortKey": 900,
    "expression": "S(b_m_role:app_manager)",
    "displayNames": {
      "ja": "Any App 管理者",
      "en": "Any App Manager",
      "zh_CN": "Any App 管理者"
    }
  }
]
```

## 注意

- `expression` 所指向的角色 / 用户 / 组织必须 **事先存在**（即使是由同一 Importer 投入的角色，处理顺序也设定为先处理角色定义）
- 请为每个应用分配独立的 `sort-key` 数值范围，以免与其他应用冲突。由于 intra-mart 标准广泛使用 10 到 10000 左右的值，新应用应选择能避免冲突的合适值
- 与其他 XML 不同，根元素是复数形式的 `<subject-groups>`。需要注意，XML 命名空间本身为 `subject-group`（单数形式）
