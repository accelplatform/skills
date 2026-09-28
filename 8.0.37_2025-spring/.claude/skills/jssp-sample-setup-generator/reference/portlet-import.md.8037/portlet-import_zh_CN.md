# Portlet 注册（`portletImport`）

## 概述

用于生成向 intra-mart 标准表（`b_m_portlet_*`）的 DML，将 JSSP 展示页面注册为门户页面的 Portlet（部件）的机制。

Portlet 的注册通常在门户管理画面中手动进行，此时写入的数据库记录分散在以下三张表中。

| 表 | 内容 |
|---------|------|
| `b_m_portlet_info` | Portlet 本体（要显示的展示页面的路径等） |
| `b_m_portlet_mode` | Portlet 的动作模式（`portlet_mode` 固定为 `EDIT`；实际是否可查看・编辑通过 `user_flag` 切换） |
| `b_m_portlet_title_info` | 显示名称（`name`）・应用程序名称（`application`）・说明（`description`）× ja/en/zh_CN |

`build-sample-setup-import.js` 会根据 `spec.json` 中的 `portletImport.portlets`，向这三张表生成**实际可运行的 DELETE / INSERT 语句**（并非像 `<key>-ddl.sql` 那样仅有注释的占位符），输出到 `<key>-dml.sql`。此外，还会根据 `editable`（详见后文）的值，自动生成**授予租户管理者查看・编辑权限的授权策略**（`<key>-authz-policy.xml`）。

## 哪些 Portlet 适合在示例数据设置中注册

示例数据设置是**为试用模块而投入示例数据**，不在生产环境中执行。Portlet 也按相同标准划分。

| Portlet 的性质 | 注册的位置 |
|---|---|
| 作为模块功能始终必需（生产环境也使用） | 租户环境设置（`jssp-tenant-setup-generator`） |
| 用于试用时的演示·示例展示 | **示例数据设置（本技能）** |

若租户环境设置一侧已注册相同的 `portletCd`，请不要在示例一侧重新定义（全量刷新会覆盖租户一侧的注册内容）。

## 幂等性：DELETE -> INSERT 的全量刷新

示例数据设置**在每次执行设置时都会运行**。单纯的 `INSERT` 会在第 2 次违反唯一约束，因此生成的 DML 会针对每个 Portlet 按以下顺序输出。

```sql
DELETE FROM b_m_portlet_title_info WHERE title_type = 'portlet' AND identification_id = '<portletCd>';
DELETE FROM b_m_portlet_mode WHERE portlet_cd = '<portletCd>';
DELETE FROM b_m_portlet_info WHERE portlet_cd = '<portletCd>';

INSERT INTO b_m_portlet_info (...) VALUES (...);
INSERT INTO b_m_portlet_mode (...) VALUES (...);
INSERT INTO b_m_portlet_title_info (...) VALUES (...);   -- name / application / description × 3 种语言
```

`DELETE` / `INSERT` 均控制在标准 SQL 的范围内，在 PostgreSQL / Oracle / SQL Server 上都可直接执行（无需指定 `dmlPerDialect`）。

全量刷新的对象仅为本技能管理的三张表，不涉及 `b_m_portlet_layout` / `b_m_portlet_display_set`（后述的范围外表）。

## 不涉及的范围：门户配置与显示设置

以下两张表**不涉及**。它们是关于"将 Portlet 放置在哪个门户的第几列第几行、以何种显示（窗口状态）呈现"的**门户运维侧设置**，与 Portlet 本身的定义性质不同，因此不包含在示例数据设置统一投放的 DML 中。

- `b_m_portlet_layout`（门户上的配置位置）
- `b_m_portlet_display_set`（窗口显示设置）

若需要在门户上配置，请在示例数据设置之后从门户管理画面手动进行。

## Portlet 不需要路由配置・路由授权

作为 Portlet 显示的 JSSP 展示页面，会由门户功能通过 `b_m_portlet_info.path` 直接调用，不像普通画面那样经由 `routing-jssp-config/` 的路由表。因此，**请不要创建**通过 `file-mapping` / `<authz uri="service://...">` 的路由配置・路由授权。访问控制仅由本 reference 所涉及的 `im-portal-portlet` / `im-portal-portlet-editmode` 授权策略进行。详情请参见 `.claude/skills/jssp-page-generator/assets/simple-portlet.md` 以及 `.claude/rules/jssp-file-structure.md` 的「不经由路由表调用的画面的例外规约」。

## spec.json 的结构

```jsonc
"portletImport": {
  "portlets": [
    {
      "portletCd": "portlet_sample",              // Portlet CD（英数字·下划线构成的唯一 ID。不得与既有 CD 重复）
      "path": "portlet_sample/view/index",         // 要显示的展示页面（相对 src/main/jssp/src/ 的路径，不带扩展名）
      "pageParam": "test=1",                       // 可选。传给 Portlet 的固定参数（page_param）。不需要时可省略
      "portletModeCd": "portlet_sample_mode",       // 可选。省略时自动生成 "<portletCd>_mode"
      "editable": false,                            // 可选。false（默认）：仅查看 / true：可查看·编辑（参见后文「查看・编辑权限的切换」）
      "titles": {
        "name":        { "ja": "サンプルポートレット", "en": "Sample Portlet", "zh_CN": "示例 Portlet" },
        "application": { "ja": "サンプルアプリケーション", "en": "Sample Application", "zh_CN": "示例 Application" },
        "description": { "ja": "説明", "en": "Description", "zh_CN": "说明" }
      }
    }
  ]
}
```

| 字段 | 必须 | 说明 |
|-----------|------|------|
| `portletCd` | YES | Portlet 的唯一 CD。请指定租户内不重复的英数字·下划线 ID。**intra-mart 标准的 `b_m_portlet_info.portlet_cd` 为 VARCHAR(20)，因此必须控制在 20 个字符以内**（超过时会在样本数据设置导入时因 `值は型character varying(20)としては長すぎます` 而失败；`build-sample-setup-import.js` 会在超过时于构建阶段报错） |
| `path` | YES | 作为 Portlet 显示的 JSSP 展示页面的路径（与路由配置的 `page` 属性同一格式） |
| `pageParam` | NO | 传给 Portlet 的 `init(request)` 的固定查询参数字符串。省略时为空字符串 |
| `portletModeCd` | NO | `b_m_portlet_mode` 的 CD。省略时为 `<portletCd>_mode`。由于 `b_m_portlet_mode.portlet_mode_cd` 同样为 VARCHAR(20)，因此也**必须控制在 20 个字符以内**（`<portletCd>_mode` 会额外增加 `_mode` 这 5 个字符，因此将 `portletCd` 控制在 15 个字符以内会比较稳妥） |
| `editable` | NO | `false`（默认）：仅查看（除创建者外不可编辑） / `true`：可查看且可编辑。详情请参见「查看・编辑权限的切换」 |
| `titles.name` | YES（3 种语言） | Portlet 的显示名称（显示在标题栏的标题） |
| `titles.application` | YES（3 种语言） | Portlet 的类别名称（添加 Portlet 对话框中的分类名） |
| `titles.description` | YES（3 种语言） | Portlet 的说明文字 |

## 生成的 DML 中的固定值

本机制专用于**直接显示 JSSP 展示页面的 Portlet**（`imart.PresentationPagePortlet`）。以下值为固定输出，无法从 spec.json 更改。

| 列 | 固定值 | 备注 |
|--------|--------|------|
| `producer_id` | 空字符串 | |
| `page_kind` | `pagebase` | 固定为 JSSP 页面型 |
| `menulinkset_cd` | 空字符串 | |
| `application_id` / `service_id` | 空字符串 | JavaEE 框架 Portlet 等其他类型不在范围内 |
| `sso_flag` | `0` | |
| `title_bar_flag` | `1` | 显示标题栏 |
| `cache_config` | `0` | |
| `entity_id_prefix` | `imart\|PresentationPagePortlet` | |
| `open_flag` / `user_portal_flag` / `group_portal_flag` | `1` | 用户门户、组织门户均可使用 |
| `portlet_height` | `-1` | 自动调整 |
| `rec_user_cd` | `system` | |
| `rec_date` | 构建执行时刻 | `build-sample-setup-import.js` 执行时的日期时间。**`rec_date` 并非 timestamp 类型，而是 varchar 类型，采用固定的 `yyyy/MM/dd\|HH:mm:ss` 格式**（并非标准 SQL 的日期时间字面量，请注意） |
| `portlet_mode`（`b_m_portlet_mode`） | `EDIT` | intra-mart 侧的固定值 |
| `access_check_flag`（`b_m_portlet_mode`） | `0` | |

仅 `user_flag`（`b_m_portlet_mode`）会根据 `editable` 变化（详见下一节）。

其他类型的 Portlet（JavaEE 框架 Portlet、RSS Portlet 等）以及包含门户配置在内的完全自动化，均不在本机制范围内。请手动追加 DML，或与用户单独商议。

## 查看・编辑权限的切换（`editable`）

Portlet 的"谁可以查看・编辑"由 `b_m_portlet_mode.user_flag` 与授权策略（`type="im-portal-portlet"` / `type="im-portal-portlet-editmode"`）的组合来控制。

授权策略与授权资源（`im-portal-portlet` 与 `im-portal-portlet-editmode` 两者）**无论 `editable` 的值为何都会始终生成**。`editable` 仅影响 `b_m_portlet_mode.user_flag`（即实际是否允许执行编辑操作本身）。这样一来，之后将 `editable` 从 `false` 切换为 `true` 时无需重新生成授权资料（租户管理者从一开始就拥有编辑权限策略，只是在 `user_flag=0` 期间，Portlet 本身处于仅查看模式，因此编辑操作会被阻止）。

| `editable` | `user_flag` | 含义 | 生成的授权策略・授权资源 |
|---|---|---|---|
| `false`（默认） | `0` | 仅查看。Portlet 本身处于不可编辑模式 | `im-portal-portlet` / `im-portal-portlet-editmode` 均对租户管理者授予 `PERMIT`（但由于 `user_flag=0`，实际无法执行编辑操作） |
| `true` | `1` | 可查看且可编辑 | 同上（`im-portal-portlet` / `im-portal-portlet-editmode` 均对租户管理者授予 `PERMIT`） |

### 授权资源 ID（哈希值）的计算方法

`im-portal-portlet` / `im-portal-portlet-editmode` 的 `resource` 属性是根据 Portlet CD 计算出的 SHA-256 哈希值，并非人类可读的 ID。intra-mart 内部对以下 base 字符串进行哈希化。

```
查看权限：sha256("im-portal-portlet://" + portletCd)
编辑权限：sha256("im-portal-portlet-editmode://" + portletCd)
```

`build-sample-setup-import.js` 将此计算实现为 `computePortletViewHash(portletCd)` / `computePortletEditHash(portletCd)`，并将其作为默认策略（对租户管理者授予 `PERMIT`）自动输出到 `<key>-authz-policy.xml` 中（与 `spec.menuGroups` 的默认策略自动授予采用相同机制）。若需要向租户管理者以外的角色・用户授予权限，请在 `spec.authzPolicies` 中显式指定 `type: "im-portal-portlet"` 或 `type: "im-portal-portlet-editmode"`，并将 `resource` 设为上述哈希值（哈希值可通过例如 `node -e "console.log(require('crypto').createHash('sha256').update('im-portal-portlet://' + '<portletCd>').digest('hex'))"` 计算得出）。

### 授权资源（`<key>-authz-resource.xml`）的自动生成

由于 `authz-policy` 不带 `id`，而是直接将上述哈希值写入 `resource` 属性，因此**若不做任何处理，该 Portlet 不会显示在管理画面的授权资源树中**（策略会处于没有对应资源的悬空状态）。为此，`build-sample-setup-import.js` 也会根据 `portletImport.portlets` 自动生成对应的 `authz-resource` 条目，输出到 `<key>-authz-resource.xml`（以及各语言文件）中。

- `id` 属性**必须与** `authz-policy` 的 `resource` 属性使用**相同的哈希值**（若使用人类可读的 id，则会与 authz-policy 一侧不一致，导致资源与策略无法关联）
- `uri` 属性为 `im-portal-portlet://<portletCd>` / `im-portal-portlet-editmode://<portletCd>`
- `<parent-group>` 指定 intra-mart 标准内置组 `im-portal-portlet` / `im-portal-portlet-editmode`（无需预先定义，视为默认已存在）
- 显示名称直接沿用 `titles.application` 的值；编辑模式一侧会附加各语言对应的后缀（`ja`：`（編集モード）` / `en`：` (Edit Mode)` / `zh_CN`：`（编辑模式）`）
- 即使 `spec.authzResources` 为空，只要存在 `portletImport.portlets`，也会生成 `<key>-authz-resource.xml`（及各语言文件），并自动作为 `<authz-resource-file>` 纳入 `import-<artifactId>-config.xml` 的 `<tenant-master>` 中

## 与输出文件的整合

`portletImport` 与既有的 `database`（专有表的 DDL/DML）章节输出到同一个 `<key>-dml.sql` 中。即使没有 `spec.database`，仅凭 `portletImport` 也会生成 DML 文件，并自动纳入 `import-<artifactId>-config.xml` 的 `<database><insert-file>` 中。DDL（`<key>-ddl_*.sql`）是专有表专用的机制，仅有 `portletImport` 时不会生成。
