# 授权策略 XML 规范

定义"谁能对什么资源执行哪个操作"。**无多语言版本**。

## 命名空间

```xml
<root xmlns="http://www.intra-mart.jp/authz/imex/policy">
  ...
</root>
```

## 结构

```xml
<authz-policy resource="any-app-content-maintenance"
              type="service"
              action="execute"
              subject="S(b_m_role:tenant_manager)">PERMIT</authz-policy>
```

| 属性 | 必填 | 内容 |
|------|------|------|
| `resource` | YES | 资源 ID（在 `authz-resource` 中定义的 `id` 属性）或资源的哈希值 |
| `type` | YES | 资源种类。参见下表 |
| `action` | YES | 操作名称。参见下表 |
| `subject` | YES | 目标主体的表达式（参见下一节） |
| 元素正文 | YES | `PERMIT`（允许）或 `DENY`（拒绝） |

### type 与 action 的对应关系

本项目使用的 type 如下。

| type | 用途 | 典型的 action |
|------|------|---------------|
| `service` | 画面、API、作业等 HTTP / 内部服务（在 authz-resource 中以 `service://...` 形式定义 URI） | `execute` |
| `im-menu-group` | 菜单组（resource 需指定菜单组 ID 的哈希值） | `read` |
| `im-logic-rest` | IM-LogicDesigner 路由（REST API 端点）。针对 `flow_route.json` 中 `authzUri`（例如 `im-logic-rest://<flowId>`）的授权。resource 需指定 authzUri 字符串的 **SHA-256 哈希值（十六进制小写）**。详情请参考 [logic-import.md](logic-import.md#路由授权策略的加载顺序) | `execute` |

## subject 表达式格式

基本形式：

```
S(<provider>:<value>)
```

可使用逻辑运算符组合（函数调用风格语法）：

```
AND(S(...), S(...), ...)   逻辑与
OR(S(...), S(...), ...)    逻辑或
NOT(S(...))                否定
```

可嵌套。例如：`AND(S(b_m_role:account_manager), NOT(S(imm_user:aoyagi)))`

### provider 一览

| provider | 值的格式（参数个数） | 例 |
|----------|--------------------|-----|
| `im_authz_meta_subject` | 元标识符（1） | `S(im_authz_meta_subject:authenticated)`（已认证用户）<br>`S(im_authz_meta_subject:anonymous)`（访客用户） |
| `b_m_role` | 角色 ID（1） | `S(b_m_role:tenant_manager)` |
| `imm_user` | IM 通用主数据的用户代码（1） | `S(imm_user:aoyagi)` |
| `imm_department` | IM 通用主数据的组织（4）<br>`<公司> <组织集> <组织> <类别>` | `S(imm_department:comp_sample_01 comp_sample_01 dept_other_11 le)` |
| `imm_company_post` | IM 通用主数据的公司职位（4）<br>`<公司> <组织集> <职位> <类别>` | `S(imm_company_post:comp_sample_01 comp_sample_01 ps001 eq)` |
| `imm_public_grp` | IM 通用主数据的公共组（3）<br>`<公共组集> <公共组> <类别>` | `S(imm_public_grp:sample_public public_group_a eq)` |
| `imm_public_grp_role` | 公共组内角色（3）<br>`<公共组集> <角色 ID> <类别>` | `S(imm_public_grp_role:sample_public 8hys58zblgeo1qh eq)` |

### 类别值（最后一个参数的比较运算符）

`imm_department` / `imm_company_post` / `imm_public_grp` / `imm_public_grp_role` 的最后一个参数是针对组织层级的比较运算符：

| 值 | 含义 |
|---|---|
| `eq` | equal（仅匹配指定组织） |
| `lt` | less than（上级组织，不包含自身） |
| `le` | less than or equal（上级组织 + 自身） |
| `gt` | greater than（下级组织，不包含自身） |
| `ge` | greater than or equal（下级组织 + 自身） |

例如：若要将部门 `dept_other_11` 之下的所有人员作为目标，使用 `ge`；仅自身则使用 `eq`；仅下级（不包含自身）则使用 `gt`。

### "公司"单位的 subject 指定

在 intra-mart 的组织体系中，"公司"被视为组织树的顶层。针对整个公司的 subject 表达式不使用专用 provider，而是通过 `imm_department` 表示：

```
S(imm_department:<公司代码> <公司代码> <公司代码> le)
```

将公司代码同时填入第 2 个参数（组织集代码）和第 3 个参数（组织代码），并以类别 `le` 表示"指定组织 + 上级"（因为公司位于顶层，结果就是将公司下的所有组织作为目标）。

实际示例：

```
S(imm_department:comp_sample_01 comp_sample_01 comp_sample_01 le)   # サンプル会社
S(imm_department:comp_other_01 comp_other_01 comp_other_01 le)      # その他会社
```

### 复合表达式的实际示例

```
# 持有 account_manager 角色，但排除用户 aoyagi
AND(S(b_m_role:account_manager), NOT(S(imm_user:aoyagi)))

# ueda 或 aoyagi 中的任一人
OR(S(imm_user:ueda), S(imm_user:aoyagi))

# 组织层级的复合条件（用 AND 组合上级到下级）
AND(
  S(imm_department:comp_other_01 comp_other_01 dept_other_11 lt),
  S(imm_department:comp_other_01 comp_other_01 dept_other_11 le),
  S(imm_department:comp_other_01 comp_other_01 dept_other_11 gt),
  S(imm_department:comp_other_01 comp_other_01 dept_other_11 ge)
)
```

### intra-mart 标准已注册的角色（`b_m_role`）

在租户环境初始化时默认存在、无需额外定义即可在 subject 表达式中使用的角色。

| 角色 ID | 用途 |
|---|---|
| `tenant_manager` | 租户管理员（全部权限） |
| `authz_manager` | 授权管理员 |
| `menu_manager` / `menu_operator` | 菜单管理员 / 运维管理员 |
| `account_manager` | 账户管理员 |
| `role_manager` | 角色管理员 |
| `calendar_manager` | 日历管理员 |
| `job_sche_manager` | 作业调度器管理员 |
| `im_master_manager` / `im_master_operator` | IM 通用主数据 管理员 / 运维管理员 |
| `portal_manager` / `imprtl_manager` / `imprtl_prlt_manager` | 门户类管理员 |
| `im_workflow_manager` / `im_workflow_operator` / `im_workflow_auditor` / `im_workflow_user` | IM-Workflow 类 |
| `imld_manager` | IM-LogicDesigner 管理员 |
| `imbm_manager` | IM-BloomMaker 管理员 |
| `imr_manager` / `imr_log_manager` | IM-Repository 类 |
| `viewcreator_manager` / `tablemainte_manager` / `file_exc_manager` | 实用工具类 |
| `accel_studio_manager` | Accel Studio 管理员 |
| 其他：`ticket_manager`, `im_knowledge_manager`, `im_knowledge_user`, `forma_app_manager`, `forma_app_creator`, `bis_manager`, `bis_business_manager`, `bis_auditor`, `bis_user`, `bis_ws_imw_user`, `forma_ws_imw_user` | 产品特定角色 |

这些角色不必在 `<key>-role.xml` 中定义即可直接用于 subject 表达式。要使用新角色（例如 `equip_admin`）时，需要在 `<key>-role.xml` 中定义。

## spec.json 中的写法

```json
"authzPolicies": [
  {
    "resource": "any-app-content-maintenance",
    "type": "service",
    "action": "execute",
    "subject": "S(b_m_role:tenant_manager)",
    "effect": "PERMIT"
  },
  {
    "resource": "any-app-search-master",
    "type": "service",
    "action": "execute",
    "subject": "S(im_authz_meta_subject:authenticated)",
    "effect": "PERMIT"
  }
]
```

省略 `effect` 时视为 `PERMIT`。

## 默认策略（租户管理员的自动授予）

**租户管理员（`tenant_manager`）作为隐式默认，始终对所有 service 资源和所有菜单组以 PERMIT 授予。**

`build-setup-import.js` 会**自动添加**以下策略（在生成 XML 末尾以 `<!-- 既定ポリシー: ... -->` 注释输出）：

| 对象 | 自动添加的策略 |
|------|----------------|
| `spec.authzResources` 中的每个 service 资源 | `type="service" action="execute" subject="S(b_m_role:tenant_manager)"` PERMIT |
| `spec.menuGroups` 中的每个菜单组 | `type="im-menu-group" action="read" subject="S(b_m_role:tenant_manager)"` PERMIT（`resource` 为菜单组 ID 的哈希值） |

- 因此**无需在 `authzPolicies` 中显式书写 `tenant_manager`**（service 资源与菜单组均如此）。即使书写，相同的 `(resource, type, tenant_manager)` 也不会重复输出。
- `tenant_manager` 以外的角色／用户，仅在**设计书或提示中明示时**才在 `authzPolicies` 中记述并授予。
- 这是为了保证租户管理员在出现问题时始终能够进行干预的规约。

## 针对菜单组的授权

当 `type="im-menu-group"` 时，`resource` 需指定 **菜单组 ID 的哈希值**。intra-mart 的授权资源 ID 按以下逻辑计算：

```
SHA-256("im-menu-group://menugroups/" + <menu-group-data 的 id>)
```

例如：对于 `equip_sm-pc` -> SHA-256(`"im-menu-group://menugroups/equip_sm-pc"`) = `df629efcf7244ec8901dfff950f670e73eaae5726a3a944542ad3d4da092fe6c`

```xml
<authz-policy resource="df629efcf7244ec8901dfff950f670e73eaae5726a3a944542ad3d4da092fe6c"
              type="im-menu-group" action="read"
              subject="S(b_m_role:equip_admin)">PERMIT</authz-policy>
```

### 在 spec.json 中的自动化

构建脚本识别以下占位符并自动展开为哈希值：

| 占位符 | 行为 |
|---|---|
| `REPLACE_WITH_MENU_GROUP_HASH` | 从 `spec.menuGroups[0].id` 自动计算 |
| `REPLACE_WITH_MENU_GROUP_HASH:<menuGroupId>` | 从显式指定的 id 计算（支持多个菜单组） |

```jsonc
"authzPolicies": [
  { "resource": "REPLACE_WITH_MENU_GROUP_HASH", "type": "im-menu-group", "action": "read",
    "subject": "S(b_m_role:equip_admin)", "effect": "PERMIT" }
]
```

## 针对 IM-LogicDesigner 路由的授权

当 `type="im-logic-rest"` 时，`resource` 需指定 **路由 `authzUri` 字符串的 SHA-256 哈希（十六进制小写）**。

```
SHA-256(<flow_route.json 中的 authzUri>)
```

例如：当 `flow_route.json` 中含有 `"authzUri": "im-logic-rest://sample_simple"` 时 -> SHA-256(`"im-logic-rest://sample_simple"`) = `d01beab0f047ab86a94e9358a800a5f1119a5465486a94d011d9ca1243ee7f62`

```xml
<authz-policy resource="d01beab0f047ab86a94e9358a800a5f1119a5465486a94d011d9ca1243ee7f62"
              type="im-logic-rest" action="execute"
              subject="S(im_authz_meta_subject:authenticated)">PERMIT</authz-policy>
```

若将 `type` 设为 `service`，由于资源已注册在 `im-logic-rest` 命名空间，策略不会与实际资源绑定，**在 Importer 执行时会被静默忽略**（不会报错，但授权不生效），请注意。

此外，该资源只在 `logicImport` 的扩展导入 JS 运行时才会被注册，因此 **在同一个 config-N.xml 的 `<authz-policy-file>` 中引用时，资源尚未注册便加载策略，会导致策略失效**。路由相关的策略必须分离到不同的 `configNumber`。运维步骤请参见 [logic-import.md](logic-import.md#路由授权策略的加载顺序)。

## 最佳实践

- 对于简单情况（允许特定角色），按每个资源一行的方式枚举。`AND` / `OR` / `NOT` **仅在复杂条件（排除特定用户、按组织层级过滤等）时**使用
- `tenant_manager` 会自动授予到所有 service 资源和所有菜单组（参见上文「默认策略」）。无需在 `authzPolicies` 中书写，**仅记述其他目标角色／用户**
- 对 `authenticated`（所有已认证用户）授予许可应限定为查询、选择类的轻量服务
- 将组织层级作为目标进行筛选时，最常用的是 `ge`（自身 + 下级）。需要注意层级边界条件（包含 / 不包含），灵活区分使用 `eq` / `lt` / `le` / `gt` / `ge`

## 限制事项

以下是 intra-mart 授权主体 DSL 的限制事项，请务必了解：

- **不可引用主体组**：在 `authz-subject-group.xml` 中定义的组本身不能在 subject 表达式中引用。即便希望在多个授权策略中使用相同的条件，也必须在每个 `authz-policy` 的 `subject` 中 **每次都直接写出 `S(...)` 表达式**（虽违反 DRY 原则，但属于规范）
- **IM 通用主数据系列的 provider 是固定的**：除 provider 一览（`imm_user` / `imm_department` / `imm_company_post` / `imm_public_grp` / `imm_public_grp_role`）以外，**不存在**在 subject 表达式中指定 IM 通用主数据的方法。例如"直接指定特定职位代码"、"以兼任关系作为条件"等均不可行
- **公司单位的指定无专用 provider**：以整个公司为目标时，需在 `imm_department` 中使用 `<公司代码> <公司代码> <公司代码> le` 的形式（参见前一节"'公司'单位的 subject 指定"）。不存在 `imm_company` 这样的专用 provider
