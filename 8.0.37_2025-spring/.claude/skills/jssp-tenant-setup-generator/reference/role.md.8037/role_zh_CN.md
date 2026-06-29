# 角色定义 XML 规范

用于注册角色（业务上的角色）的 XML。由基础文件 + 语言别文件（ja/en/zh_CN）共 4 个文件构成。

## 命名空间

```xml
<root xmlns="http://intra-mart.co.jp/system/admin/role/role-data">
  ...
</root>
```

## 基础文件（`<key>-role.xml`）

定义角色的 ID、名称、类别。**不要写显示名**。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns="http://intra-mart.co.jp/system/admin/role/role-data">
  <role-data name="any_app_manager" id="app_manager">
    <category>any_app</category>
  </role-data>
</root>
```

| 属性 / 子元素 | 必需 | 内容 |
|--------------|------|------|
| `name` 属性 | YES | 角色名（系统内部名）。不可重复 |
| `id` 属性 | YES | 角色 ID（短的英数字）。由 subject 表达式 `S(b_m_role:<id>)` 引用。**不超过 20 字符** |
| `<category>` | NO | 角色类别。可为空 |

**角色 ID 的字符数限制：**
- 角色 ID 需要控制在 **20 字符以内**（intra-mart 的限制）
- 超过 20 字符时 Importer 执行时会出错
- 示例：`equip_admin`（11 字符 ✓）、`equip_accounting`（16 字符 ✓）、`some_very_long_role_name`（24 字符 ✗）

## 语言别文件（`<key>-role_<locale>.xml`）

仅记述显示名。`name` / `id` 需与基础文件保持一致（匹配键）。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns="http://intra-mart.co.jp/system/admin/role/role-data">
  <role-data name="any_app_manager" id="app_manager">
    <display-names>
      <display-name locale="ja">Any App 管理者</display-name>
    </display-names>
  </role-data>
</root>
```

`locale` 为 `ja` / `en` / `zh_CN` 之一。1 个文件对应 1 种 locale。

## spec.json 中的记述

```json
"roles": [
  {
    "id": "app_manager",
    "name": "any_app_manager",
    "category": "any_app",
    "displayNames": {
      "ja": "Any App 管理者",
      "en": "Any App Manager",
      "zh_CN": "Any App 管理者"
    }
  }
]
```

## 注意

- 角色 `id` 会被授权策略的 `subject` 表达式 `S(b_m_role:<id>)` 引用，因此需要与授权策略一侧的写法完全一致。
- `name` 与 `id` 的区分：`name` 是供人阅读的内部名，`id` 是用于 subject 表达式和 DB 主键的短代码。
- 角色名（`name` 和 `id` 两者）**如果规格书中已明示则使用其名称**。未明示时可自行决定合适的名称（例如：`<shortName>_<角色种类>` 或 `<key>_<角色种类>` 等，可读性高且不与现有角色冲突）。
