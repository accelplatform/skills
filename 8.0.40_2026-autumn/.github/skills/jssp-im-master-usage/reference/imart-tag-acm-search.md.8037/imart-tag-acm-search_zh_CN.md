---
paths:
  - "src/main/jssp/**/*.html"
---

# IMART imACMSearch 标签参考手册

## 概述

`<imart type="imACMSearch" />` 标签用于生成以弹出方式调用 IM-共通主数据搜索画面的对象。
使用生成的对象的 `open` 方法以弹出方式显示搜索画面，搜索结果将以对象形式作为回调函数的参数传递。

## 属性一览

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-----------|------|
| name | String | `"imACMSearch"` | 生成的对象名称 |
| noscript | Boolean | false | 为 `true` 时不加载脚本 |

## 参数一览

在传递给 `open` 方法的对象中进行设置。

### 必填参数

| 参数 | 类型 | 说明 |
|-----------|------|------|
| callback_function | String | 回调函数名称 |

### 主要可选参数

| 参数 | 类型 | 默认值 | 说明 |
|-----------|------|-----------|------|
| tabs | Array | - | 使用的标签页集合。`{id, title}` 的数组。不指定 `target` 时为必填 |
| target | String | - | 搜索对象（插件 ID）。省略后用 `tabs` 明确指定时，只显示指定的标签页 |
| prop | Object | - | 要获取的信息（项目）。以标签页 ID 为键，字段名数组为值 |
| default_tab_id | String | - | 标签页的初始焦点（指定标签页的 `id`） |
| type | String | - | 选择模式。`"single"`（单选）/ `"multiple"`（多选） |
| wnd_title | String | - | 窗口标题 |
| message | String | - | 标题栏消息 |
| wnd_close | Boolean | - | 选择后是否关闭窗口 |
| width | Number | - | 窗口宽度 |
| height | Number | - | 窗口高度 |
| basic_area | String | - | 基本条件区域设置 |
| target_date | Date | - | 搜索基准日期 |
| target_locale | String | - | 显示语言区域 |
| deleted_data | Boolean | false | 是否包含已删除数据 |
| default_selected | Array | - | 初始选中对象 |

### 用户搜索专有参数

| 参数 | 类型 | 默认值 | 说明 |
|-----------|------|-----------|------|
| additional_disp | Boolean | - | 是否显示补充信息 |
| additional_user_search_name | Boolean | - | 是否显示搜索名称 |
| additional_dept | Boolean | - | 是否显示所属 |

## 搜索画面标签页插件 ID

### 用户搜索

| 插件 ID | 说明 |
|-------------|------|
| `jp.co.intra_mart.master.app.search.tabs.user.list_user` | 用户（关键词） |
| `jp.co.intra_mart.master.app.search.tabs.user.list_user_non_authz` | 用户（关键词・不考虑授权） |
| `jp.co.intra_mart.master.app.search.tabs.user.list_department` | 用户（公司组织・关键词） |
| `jp.co.intra_mart.master.app.search.tabs.user.tree_department` | 用户（公司组织・树形） |
| `jp.co.intra_mart.master.app.search.tabs.user.list_public_group` | 用户（公共组・关键词） |
| `jp.co.intra_mart.master.app.search.tabs.user.tree_public_group` | 用户（公共组・树形） |
| `jp.co.intra_mart.master.app.search.tabs.user.list_private_group` | 用户（私有组） |
| `jp.co.intra_mart.master.app.search.tabs.user.list_role` | 用户（角色） |

### 公司・组织搜索

| 插件 ID | 说明 |
|-------------|------|
| `jp.co.intra_mart.master.app.search.tabs.company.list` | 公司（关键词） |
| `jp.co.intra_mart.master.app.search.tabs.department_set.tree` | 组织集（树形） |
| `jp.co.intra_mart.master.app.search.tabs.department.list` | 组织（关键词） |
| `jp.co.intra_mart.master.app.search.tabs.department.tree` | 组织（树形） |
| `jp.co.intra_mart.master.app.search.tabs.company_post.tree` | 职位（树形） |
| `jp.co.intra_mart.master.app.search.tabs.department_post.tree` | 组织・职位（树形） |
| `jp.co.intra_mart.master.app.search.tabs.attached_department_post.tree` | 所属职位（树形） |

### 公共组搜索

| 插件 ID | 说明 |
|-------------|------|
| `jp.co.intra_mart.master.app.search.tabs.public_group.list` | 公共组（关键词） |
| `jp.co.intra_mart.master.app.search.tabs.public_group.tree` | 公共组（树形） |
| `jp.co.intra_mart.master.app.search.tabs.public_group_set_role.tree` | 角色（树形） |
| `jp.co.intra_mart.master.app.search.tabs.public_group_role.tree` | 公共组・角色（树形） |
| `jp.co.intra_mart.master.app.search.tabs.attached_public_group_role.tree` | 所属角色（树形） |

### 其他搜索

| 插件 ID | 说明 |
|-------------|------|
| `jp.co.intra_mart.master.app.search.tabs.private_group.list` | 私有组 |
| `jp.co.intra_mart.master.app.search.tabs.role.list` | 角色 |
| `jp.co.intra_mart.master.app.search.tabs.account.list` | 账户（关键词） |
| `jp.co.intra_mart.master.app.search.tabs.application_role.list` | 应用程序角色 |

### 复合搜索

| 插件 ID | 说明 |
|-------------|------|
| `jp.co.intra_mart.master.app.search.tabs.department_and_role.tree_and_list` | 组织＋角色 |
| `jp.co.intra_mart.master.app.search.tabs.department_and_user_category_item.tree_and_list` | 组织＋用户分类项目 |
| `jp.co.intra_mart.master.app.search.tabs.public_group_and_role.tree_and_list` | 公共组＋角色 |

### 智能手机用

| 插件 ID | 说明 |
|-------------|------|
| `jp.co.intra_mart.im_master.app.search.tabs.user.department.tree_with_list.smartphone` | 用户搜索（组织树形） |

## 回调函数的参数

回调函数接收对象数组。各元素的结构如下。

| 属性 | 类型 | 说明 |
|-----------|------|------|
| keyFields | String[] | 唯一标识对象的字段名 |
| displayName | String | 画面显示用字符串 |
| deleteFlag | Boolean | 逻辑删除标志 |
| type | String | 数据类型（基本表名） |
| data | Object | 从数据库获取的记录内容 |
| basic_info | Object | 基本条件信息 |

### data 对象的主要字段

显示各搜索标签页的 `type`、`keyFields` 以及 `data` 中包含的默认获取项目。
通过 `prop` 参数额外指定的项目也会包含在 `data` 中。

#### 用户搜索

| 项目 | 值 |
|------|------|
| type | `imm_user` |
| keyFields | `["user_cd"]` |

| 字段 | 说明 |
|-----------|------|
| user_cd | 用户代码 |
| user_name | 用户名 |
| delete_flag | 删除标志 |

#### 组织搜索

| 项目 | 值 |
|------|------|
| type | `imm_department` |
| keyFields | `["company_cd", "department_set_cd", "department_cd"]` |

| 字段 | 说明 |
|-----------|------|
| company_cd | 公司代码 |
| department_set_cd | 组织集代码 |
| department_cd | 组织代码 |
| department_name | 组织名称 |
| delete_flag | 删除标志 |

#### 公司搜索

| 项目 | 值 |
|------|------|
| type | `imm_company` |
| keyFields | `["company_cd"]` |

| 字段 | 说明 |
|-----------|------|
| company_cd | 公司代码 |
| department_set_cd | 组织集代码 |
| department_cd | 组织代码 |
| department_name | 组织名称 |
| delete_flag | 删除标志 |

#### 公共组搜索

| 项目 | 值 |
|------|------|
| type | `imm_public_grp` |
| keyFields | `["public_group_set_cd", "public_group_cd"]` |

| 字段 | 说明 |
|-----------|------|
| public_group_set_cd | 公共组集代码 |
| public_group_cd | 公共组代码 |
| public_group_name | 公共组名称 |
| delete_flag | 删除标志 |

#### 私有组搜索

| 项目 | 值 |
|------|------|
| type | `imm_private_grp` |
| keyFields | `["private_grp_cd"]` |

| 字段 | 说明 |
|-----------|------|
| private_group_cd | 私有组代码 |
| user_cd | 用户代码 |
| private_group_name | 私有组名称 |

#### 角色搜索

| 项目 | 值 |
|------|------|
| type | `b_m_role_b` |
| keyFields | `["role_id"]` |

| 字段 | 说明 |
|-----------|------|
| role_id | 角色 ID |

#### 账户搜索

| 项目 | 值 |
|------|------|
| type | `b_m_account_b` |
| keyFields | `["user_cd"]` |

| 字段 | 说明 |
|-----------|------|
| user_cd | 用户代码 |

#### 应用程序角色搜索

| 项目 | 值 |
|------|------|
| type | `application_role` |

| 字段 | 说明 |
|-----------|------|
| name | 应用程序角色名称 |
| type | 角色种类 |
| applicationId | 应用程序 ID |
| applicationName | 应用程序名称 |
| license | 许可证 |

## 使用示例

### 用户搜索（仅关键词・单选）

```html
<imart type="head">
  <!-- IM-共通主数据搜索画面调用标签 -->
  <imart type="imACMSearch" />

  <script>
    // 用户名 单击时事件
    document.getElementById(':userName:').addEventListener('click', () => {
      const parameter = {
        tabs: [{
          id   : 'jp.co.intra_mart.master.app.search.tabs.user.list_user',
          title: '关键词'
        }],
        prop: {
          'jp.co.intra_mart.master.app.search.tabs.user.list_user': ['user_cd', 'user_name']
        },
        callback_function           : 'callbackFromImMaster',
        wnd_title                   : '用户搜索',
        message                     : '用户搜索',
        wnd_close                   : true,
        type                        : 'single'
      };

      // 打开搜索画面
      imACMSearch.open(parameter);
    });

    // 回调函数
    function callbackFromImMaster(result) {
      if (result.length > 0) {
        console.log(result[0].data.user_code, result[0].data.user_name);
      } else {
        console.log('未选择用户');
      }
    }
    // 将函数放置到全局
    window.callbackFromImMaster = callbackFromImMaster;
  </script>
</imart>
```

### 用户搜索（关键词＋组织树形・多选）

```html
<imart type="head">
  <!-- IM-共通主数据搜索画面调用标签 -->
  <imart type="imACMSearch" />

  <script>
    // 用户名 单击时事件
    document.getElementById(':userName:').addEventListener('click', () => {
      const parameter = {
        tabs: [{
          id: 'jp.co.intra_mart.master.app.search.tabs.user.list_user',
          title: '关键词'
        }, {
          id: 'jp.co.intra_mart.master.app.search.tabs.department.tree',
          title: '组织（树形）'
        }],
        prop: {
          'jp.co.intra_mart.master.app.search.tabs.user.list_user': ['user_cd', 'user_name']
        },
        default_tab_id    : 'jp.co.intra_mart.master.app.search.tabs.department.tree',
        callback_function : 'callbackFromImMaster',
        wnd_title         : '用户搜索',
        wnd_close         : true,
        type              : 'multiple'
      };

      // 打开搜索画面
      imACMSearch.open(parameter);
    });

    // 回调函数
    function callbackFromImMaster(result) {
      for (let i = 0; i < result.length; i++) {
        console.log(result[i].data.user_cd, result[i].data.user_name);
      }
    }
    // 将函数放置到全局
    window.callbackFromImMaster = callbackFromImMaster;
  </script>
</imart>
```

## 注意事项

- `<imart type="imACMSearch" />` 标签必须放置在 HTML 的 `<head>` 标签内
- 回调函数必须在全局作用域中定义（在立即执行函数内无法引用）
- 指定 `target` 时，与该对象关联的所有标签页将全部启用。若只想显示特定标签页，请省略 `target` 并用 `tabs` 进行指定
- `target` 设置不当时可能会发生 parseJSON 错误
- 传递给 `prop` 的字段名必须与标签页实现返回的键一致
