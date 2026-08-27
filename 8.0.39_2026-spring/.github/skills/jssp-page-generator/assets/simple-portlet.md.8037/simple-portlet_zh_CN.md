# 简单门户组件（Portlet）画面模板

## 概述

作为门户页面的 Portlet（部件）嵌入的小型列表画面模板。
与普通画面（假定通过 URL 单独访问）不同，**同一门户页面上可能会放置多个相同的画面**，因此本模板与标准模板（`assets/simple-list.md`）存在以下差异。

- **不包含页头、页脚**：不添加 `imds-header`（带图标和大标题的页头区域）或分页等周边 UI，仅放置内容主体（如表格）
- **不创建路由配置（`.xml`）・路由授权**：Portlet 由门户功能（`b_m_portlet_info.path`）直接调用，不经过 `routing-jssp-config/` 下的路由表。因此不需要通过 `file-mapping` / `<authz uri="service://...">` 进行路由授权（访问控制改由 Portlet 自身的授权 `im-portal-portlet` / `im-portal-portlet-editmode` 来实现，详见 `.github/skills/jssp-tenant-setup-generator/reference/portlet-import.md`）

需要说明的是，通过 IIFE 对绑定变量 `$data` 进行作用域隔离并非 Portlet 特有的差异，而是所有画面通用的标准实现（参见 `.github/instructions/jssp-presentation-page.instructions.md` 中的"绑定变量 `$data` 的作用域化（IIFE）"章节）。

## 文件结构

```
src/main/jssp/src/{功能名}/view/
  └── index.js              # 函数容器
  └── index.html            # 展示页面
```

不创建路由配置（`src/main/conf/routing-jssp-config/`）。

---

## 函数容器（{功能名}/view/index.js）

```javascript
/**
 * {画面名}
 *
 * @file index.js
 * @description 构成作为门户页面 Portlet 部件显示的列表。
 */

// ========================================
// 绑定变量（用于展示页面联动）
// ========================================
let $title = '列表';
let $subTitle = 'Portlet';
let $data = '{}';

// ========================================
// 入口点
// ========================================
/**
 * 画面显示的入口点。
 * 访问画面 URL 时首先执行。
 *
 * @param {Object} request - 请求对象
 */
function init(request) {
  // 执行主处理
  let response = main(request);

  // 以 JSON 格式存入 $data
  // 若 JSON 中包含 </script>，会导致脚本提前结束，从而带来可注入任意代码等安全隐患，
  // 因此对响应中的 '/' 进行全部转义
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

// ========================================
// 主处理
// ========================================
/**
 * 执行主处理。
 *
 * @param {Object} request - 请求参数
 * @return {Object} 处理结果
 */
function main(request) {
  let logger = Logger.getLogger();
  let response = {
    result: null,
    error: {
      code: '',                 // 错误代码
      message: ''                // 错误消息
    }
  };

  try {
    // 执行业务逻辑的主处理
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('显示 Portlet 时发生错误。{}', e.message);
    transferErrorPage('E001', '发生了预期之外的错误。');
    return response;
  }

  return response;
}

// ========================================
// 业务逻辑
// ========================================
/**
 * 执行业务逻辑的主处理。
 *
 * @param {Object} request - 请求参数
 * @return {Object} 处理结果
 */
function processBusinessLogic(request) {
  // TODO: 请在此处替换为从数据库获取列表数据的实际处理
  return {
    list: [
      { itemCode: 'ITM001', itemName: '示例项目 A', status: '处理中' },
      { itemCode: 'ITM002', itemName: '示例项目 B', status: '已完成' },
      { itemCode: 'ITM003', itemName: '示例项目 C', status: '未开始' }
    ]
  };
}

// ========================================
// 错误页面跳转
// ========================================
/**
 * 发生错误时，在整个画面上显示错误消息。
 *
 * @param {String} code - 错误代码
 * @param {String} message - 错误消息
 */
function transferErrorPage(code, message) {
  let parameter = {
    title: '发生了系统错误',
    message: [code, message].join('\n')
  };
  Transfer.toErrorPage(parameter);
}
```

---

## 展示页面（{功能名}/view/index.html）

```html
<!-- 页头 -->
<imart type="head">
  <!-- 标题 -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- 安全令牌 -->
  <meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">
  <!-- 展示页面的脚本（由于该 Portlet 可能在同一页面多重配置，不将 $data 置于全局作用域，而是通过 IIFE 进行作用域隔离） -->
  <script>
  (function($data) {
    document.addEventListener('DOMContentLoaded', () => {
      // HTML 转义
      function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value;
        return div.innerHTML;
      }

      // 渲染列表表格
      function renderTable(list) {
        const tbody = document.getElementById('portlet-sample-table-body');
        tbody.innerHTML = '';

        if (list.length === 0) {
          const tr = document.createElement('tr');
          const td = document.createElement('td');
          td.setAttribute('colspan', '3');
          td.style.textAlign = 'center';
          td.textContent = '没有数据。';
          tr.appendChild(td);
          tbody.appendChild(tr);
          return;
        }

        list.forEach((item) => {
          const tr = document.createElement('tr');
          tr.innerHTML =
            '<td><span>' + escapeHtml(item.itemCode) + '</span></td>' +
            '<td><span>' + escapeHtml(item.itemName) + '</span></td>' +
            '<td><span>' + escapeHtml(item.status) + '</span></td>';
          tbody.appendChild(tr);
        });
      }

      // 入口点
      if ($data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      } else {
        renderTable($data.result.list);
      }
    });
  })(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
  </script>
</imart>

<!-- 整个页面的容器（由于是 Portlet 部件，不包含页头、页脚。当同一门户页面配置了多个不同的 Portlet 时，为了按画面区分 DOM 操作的作用范围，附加 id="app-portlet-{功能名}-container"） -->
<div id="app-portlet-{功能名}-container" class="imds-container">
  <main>
    <div class="imds-table is-narrow" id="portlet-sample-table">
      <div class="imds-table-inner">
        <table>
          <thead>
            <tr>
              <th><span>项目代码</span></th>
              <th><span>项目名称</span></th>
              <th><span>状态</span></th>
            </tr>
          </thead>
          <tbody id="portlet-sample-table-body"></tbody>
        </table>
      </div>
    </div>
  </main>
</div>
```

---

## 可用模板

- **简单 Portlet**：[assets/simple-portlet.md](assets/simple-portlet.md)
  - 作为门户页面 Portlet 部件嵌入的小型列表
  - 不含页头、页脚，`$data` 通过 IIFE 进行作用域隔离
  - 不含搜索、分页、编辑链接等周边 UI 的最小结构

### 生成时的指示示例

当用户请求"创建 Portlet 画面"、"作为门户组件创建列表"等时，请参考本 assets 的代码，在保持假定多重配置的结构与作用域隔离的前提下，根据用户需求进行定制生成。
表格列、显示条数等内容方面可根据用户需求变更，但以下内容不得变更。

- 不得添加 `imds-header` 等视觉性页头、页脚
- 不得将 `$data` 定义在 IIFE 之外（全局作用域）
- 不得创建路由配置（`.xml`）・路由授权（`service://...`）
