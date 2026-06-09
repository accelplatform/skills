# 菜单组 XML 规范

定义在 intra-mart 管理菜单（站点地图）中显示的**菜单组**以及其下的**菜单项**。

## 命名空间

```xml
<root xmlns="http://intra-mart.co.jp/im_menu/menu-group-data">
  ...
</root>
```

## 结构

可在根 `<root>` 下放置多个 `<menu-group-data>`。每个 `<menu-group-data>` **包含 1 个顶层 `<menu-item>`，并在其中嵌套放置菜单项**。

```
<root>
  <menu-group-data id="<key>_sm-pc">
    <category id="im_sitemap_pc"/>
    <menu-item .../>          ← 顶层文件夹（menu-id 与 <menu-group-data> 相同）
      <menu-item .../>        ← 子项（item 或 folder）
      <menu-item ...>         ← folder 时可进一步嵌套
        <menu-item .../>
      </menu-item>
  </menu-group-data>
</root>
```

## `<menu-item>` 的属性

| 属性 | 必需 | 说明 |
|------|------|------|
| `menu-id` | YES | 菜单项的唯一 ID。按惯例附加 `_sm-pc` 后缀（PC 用站点地图） |
| `sort-number` | YES | 同级中的显示顺序（数值越小越靠前） |
| `type` | YES | `folder`（有子项）或 `item`（叶子节点，URL 链接） |
| `url` | type=item 时 YES | 链接目标 URL。`<authz>` path 去掉开头 `/` 后的相对形式（例：`equip/dashboard/list`） |
| `image-path` | YES | 图标路径。未指定时也必须以空字符串 `""` 输出该属性 |
| `method` | YES | HTTP 方法。通常为 `get` |
| `use-iframe` | YES | 是否在 iframe 中打开。通常为 `false` |
| `use-popup` | YES | 是否以弹出窗口打开。通常为 `false` |

当 `type="folder"` 时，**不输出** `url` 属性。

## 分类

`<category id="im_sitemap_pc">` 指代 intra-mart 标准的"站点地图（PC 用）"。

本项目**仅以 `im_sitemap_pc` 为对象**。其他 category（移动端等）在 intra-mart 侧也存在，但本技能集合不涉及。

## 基础文件（`<key>-menu-group.xml`）

仅包含 ID、属性和层级，不包含显示名。**同级元素之间不插入空行**（依据实际例）。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns="http://intra-mart.co.jp/im_menu/menu-group-data">
  <menu-group-data id="equip_sm-pc">
    <category id="im_sitemap_pc"></category>

    <menu-item menu-id="equip_sm-pc" sort-number="2000" type="folder" image-path="" method="get" use-iframe="false" use-popup="false">
      <menu-item menu-id="equip_dashboard_sm-pc" sort-number="10" type="item" url="equip/dashboard/list" image-path="" method="get" use-iframe="false" use-popup="false"></menu-item>
      <menu-item menu-id="equip_master_sm-pc" sort-number="100" type="folder" image-path="" method="get" use-iframe="false" use-popup="false">
        <menu-item menu-id="equip_master_equipment_sm-pc" sort-number="10" type="item" url="equip/master/equipment/list" image-path="" method="get" use-iframe="false" use-popup="false"></menu-item>
      </menu-item>
    </menu-item>
  </menu-group-data>
</root>
```

## 多语言文件（`<key>-menu-group_<locale>.xml`）

重现相同的结构，并为每个 `<menu-item>` 追加 `<display-names><display-name locale="..">...</display-name></display-names>`。**为提升可读性，在同级元素之间插入空行**（依据实际例）。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns="http://intra-mart.co.jp/im_menu/menu-group-data">
  <menu-group-data id="equip_sm-pc">
    <category id="im_sitemap_pc"></category>

    <menu-item menu-id="equip_sm-pc" sort-number="2000" type="folder" image-path="" method="get" use-iframe="false" use-popup="false">
      <display-names>
        <display-name locale="ja">社内備品貸出システム</display-name>
      </display-names>

      <menu-item menu-id="equip_dashboard_sm-pc" sort-number="10" type="item" url="equip/dashboard/list" image-path="" method="get" use-iframe="false" use-popup="false">
        <display-names>
          <display-name locale="ja">ダッシュボード</display-name>
        </display-names>
      </menu-item>
    </menu-item>
  </menu-group-data>
</root>
```

## 菜单项选定标准

从规格书的画面一览中判断哪些画面应包含在菜单中的标准。

### 应包含的画面（入口点）

仅将作为业务流程起点的画面设为菜单项：

| 种别 | 例 |
|---|---|
| 仪表板 | "仪表板"、"主页"、"我的页面" |
| 一览画面 | "○○一览"、"○○管理"（以 list 结尾的画面） |
| 检索画面 | "○○检索" |
| 个人专用画面 | "申请一览（自己的）"、"审批一览（发给自己的）" |
| 统计、报表画面 | "使用统计仪表板"、"报表输出" |
| 用户个别设置画面 | "用户设置"、"通知设置" |

### 应排除的画面（跳转目标）

从入口点通过内部跳转打开的画面不包含在菜单中：

| 种别 | 排除理由 | 典型的打开方式 |
|---|---|---|
| 详细画面 | 从一览的行点击 / 搜索结果点击跳转 | `<a>` 链接、行双击 |
| 登记 / 编辑表单画面 | 从一览的"新建"、"编辑"按钮跳转 | 按钮 onClick 实现 URL 跳转 |
| 对话框形式的画面 | 从父画面以弹出形式打开 | `imdsModal` 等模态框 |
| API 端点 | 不用于直接 URL 访问 | 由 XHR/fetch 调用 |
| 打印 / 预览画面 | 通过画面内按钮在另一窗口显示 | `window.open` 等 |

规格书中明确标注为**"对话框形式"、"表单"、"详细显示"**的画面基本上属于排除对象。

### 用文件夹归组的标准

当相关画面有 **2 个以上**时，使用 `type="folder"` 进行归组以构成层级。仅有 1 个时直接放置在顶层：

| 例 | 构成 |
|---|---|
| 主数据系（设备主数据、类别、保管场所） | 在 `備品マスタ管理` 文件夹下放置 3 个 |
| 盘点系（实施、历史） | 在 `棚卸管理` 文件夹下放置 2 个 |
| 使用统计（仅 1 个画面） | 不设文件夹直接放置在顶层 |

### sort-number 的赋值方式（推荐惯例）

| 层级 | 推荐步长 | 例 |
|---|---|---|
| 顶层文件夹本身（与 `<menu-group-data>` 的 id 相同） | 便于后续与其他菜单排序的位数 | `2000` |
| 顶层文件夹下的各菜单项 | **步长 10**（便于后续插入） | `10`、`20`、`30`、…… |
| 用于分组的文件夹（例：主数据管理） | **步长 100**（与兄弟节点呈现为不同分组） | `100`、`110`、`120`、…… |
| 文件夹内的各菜单项 | 以步长 10 独立编号 | `10`、`20`、`30` |

### 判定流程

阅读规格书时按以下顺序判定：

1. 画面的说明中含有 **"对话框形式"、"表单"、"详细显示"** → **排除**
2. 该画面 ID 被作为其他画面的"跳转目标"记述（例：作为"○○一览 → △△编辑画面跳转"中的 △△ 一侧） → **排除**
3. 该画面 ID 命名为 **`-list`、`-search`、`-dashboard`、`-history`、`-preference`** 等可独立访问的形式 → **包含**
4. 在上述之外仍犹豫不决时，以**"将 URL 直接登记为书签并打开是否有意义"**判定（Yes 则包含）

## 在 spec.json 中的描述

`menuGroups` 数组的每个元素对应 1 个 `<menu-group-data>`。`items` 可递归嵌套。

```jsonc
"menuGroups": [
  {
    "id": "equip_sm-pc",                       // <menu-group-data> 的 id（惯例：<key>_sm-pc）
    "category": "im_sitemap_pc",               // 省略时的默认值："im_sitemap_pc"
    "sortNumber": 2000,                        // 顶层文件夹的 sort-number
    "type": "folder",                          // 顶层始终为 folder（省略时，若有 items 则自动判定为 folder）
    "displayNames": { "ja": "...", "en": "...", "zh_CN": "..." },
    "items": [
      {
        "id": "equip_dashboard_sm-pc",
        "sortNumber": 10,
        "url": "equip/dashboard/list",         // type=item 时必需
        "displayNames": { "ja": "ダッシュボード", "en": "Dashboard", "zh_CN": "仪表板" }
      },
      {
        "id": "equip_master_sm-pc",
        "sortNumber": 100,
        "type": "folder",                      // 有子项的文件夹。无需 url
        "displayNames": { "ja": "備品マスタ管理", "en": "Equipment Master Management", "zh_CN": "设备主数据管理" },
        "items": [
          { "id": "equip_master_equipment_sm-pc", "sortNumber": 10, "url": "equip/master/equipment/list",
            "displayNames": { "ja": "備品マスタ一覧", "en": "Equipment List", "zh_CN": "设备一览" } }
        ]
      }
    ]
  }
]
```

### spec 的字段选项（可选值，几乎都可省略）

| 字段 | 默认值 | 说明 |
|-----------|-----------|------|
| `category` | `im_sitemap_pc` | 站点地图种类 |
| `sortNumber` | `10` | 显示顺序 |
| `type` | 当存在 `items` 时为 `folder`，否则为 `item` | 自动判定 |
| `imagePath` | `""` | 图标路径 |
| `method` | `get` | HTTP 方法 |
| `useIframe` | `false` | iframe 显示 |
| `usePopup` | `false` | 弹出显示 |
| `url` | `""` | type=item 的链接目标（type=folder 时不输出） |

## 对菜单组的授权

对菜单组的读取许可通过在 `authz-policy` 的 `resource` 中指定**菜单组 ID 的哈希值**来进行。

```xml
<authz-policy resource="d6f1918fc80494cfee9bfa30e8d179a0d46fd029132ad6a66be211f9f6a91b97"
              type="im-menu-group" action="read"
              subject="S(b_m_role:equip_admin)">PERMIT</authz-policy>
```

哈希值由 intra-mart 的以下逻辑决定：

```
SHA-256("im-menu-group://menugroups/" + <menu-group-data 的 id>)
```

例：`equip_sm-pc` → `df629efcf7244ec8901dfff950f670e73eaae5726a3a944542ad3d4da092fe6c`

当 build 脚本在 spec.json 中发现 `"resource": "REPLACE_WITH_MENU_GROUP_HASH"` 或 `"resource": "REPLACE_WITH_MENU_GROUP_HASH:<menuGroupId>"` 时，会按上述逻辑**自动展开为哈希值**。机制的详情请参见 [authz-policy.md](authz-policy.md)。

## 注意

- `<menu-group-data>` 的 `id` 命名为 **`<key>_sm-pc`** 是 intra-mart 标准（PC 用站点地图）。如需为移动端构建不同的结构，请以单独的文件（`_sm-sp` 等）并列展开
- 各 `<menu-item>` 的 `menu-id` 也应附加 `_sm-pc` 后缀
- `url` **不带开头斜杠**（如 `equip/dashboard/list`）。intra-mart 侧会补全 servlet context
- `image-path` / `method` / `use-iframe` / `use-popup` 即使为空也**必须作为属性输出**（intra-mart 的 XSD 中为必需）
