# 简单列表画面模板

## 概述

使用简单表格列表和分页的画面构成模板。
画面初始显示时，将服务器端获取的值显示在呈现页面中；表格渲染和翻页由客户端JavaScript处理。
列表各行设有编辑链接，可跳转到编辑画面。

## 文件结构

```
src/main/jssp/src/simple_list/view/
  └── index.js              # 功能容器
  └── index.html            # 呈现页面

src/main/conf/routing-jssp-config/
  └── simple_list.xml       # 路由配置
```

---

## 功能容器（simple_list/view/index.js）

```javascript
/**
 * 简单列表画面
 *
 * @file index.js
 * @description 构建提供数据列表显示和分页功能的画面。
 */

// ========================================
// 绑定变量（用于呈现页面联动）
// ========================================
let $title = '列表';
let $subTitle = '示例管理';
let $data = '{}';

// ========================================
// 入口点
// ========================================
/**
 * 画面显示的入口点。
 * 访问画面URL时，最先执行。
 *
 * @param {Object} request - 请求对象
 */
function init(request) {
  // 执行主处理
  let response = main(request);

  // 以JSON格式存储到$data
  // 如果JSON中包含</script>，脚本会终止，
  // 因此将响应中的'/'全部替换为'\/'
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
      message: ''               // 错误消息
    }
  };

  try {
    // 执行业务逻辑主处理
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('画面显示中发生错误。{}', e.message);
    transferErrorPage('E001', '发生了意外错误。');
    return response;
  }

  return response;
}

// ========================================
// 业务逻辑
// ========================================
/**
 * 执行业务逻辑主处理。
 *
 * @param {Object} request - 请求参数
 * @return {Object} 处理结果
 */
function processBusinessLogic(request) {
  // TODO: 在此处执行从数据库获取列表数据的处理
  return {
    list: [
      { productCode: 'PRD001', productName: '圆珠笔（黑）', unitPrice: 150, stockQuantity: 500, warehouseNumber: 'WH01', remarks: '常规商品' },
      { productCode: 'PRD002', productName: '圆珠笔（红）', unitPrice: 150, stockQuantity: 300, warehouseNumber: 'WH01', remarks: '' },
      { productCode: 'PRD003', productName: '圆珠笔（蓝）', unitPrice: 150, stockQuantity: 250, warehouseNumber: 'WH01', remarks: '' },
      { productCode: 'PRD004', productName: '自动铅笔 0.5mm', unitPrice: 280, stockQuantity: 180, warehouseNumber: 'WH01', remarks: '' },
      { productCode: 'PRD005', productName: '自动铅笔 0.3mm', unitPrice: 350, stockQuantity: 120, warehouseNumber: 'WH01', remarks: '库存少' },
      { productCode: 'PRD006', productName: '橡皮擦', unitPrice: 80, stockQuantity: 600, warehouseNumber: 'WH02', remarks: '' },
      { productCode: 'PRD007', productName: '修正带', unitPrice: 230, stockQuantity: 150, warehouseNumber: 'WH02', remarks: '' },
      { productCode: 'PRD008', productName: '荧光笔（黄）', unitPrice: 120, stockQuantity: 400, warehouseNumber: 'WH02', remarks: '' },
      { productCode: 'PRD009', productName: '荧光笔（粉红）', unitPrice: 120, stockQuantity: 350, warehouseNumber: 'WH02', remarks: '' },
      { productCode: 'PRD010', productName: '荧光笔（绿）', unitPrice: 120, stockQuantity: 200, warehouseNumber: 'WH02', remarks: '' },
      { productCode: 'PRD011', productName: '笔记本 A4 横线', unitPrice: 180, stockQuantity: 800, warehouseNumber: 'WH03', remarks: '大量库存' },
      { productCode: 'PRD012', productName: '笔记本 B5 横线', unitPrice: 150, stockQuantity: 700, warehouseNumber: 'WH03', remarks: '' },
      { productCode: 'PRD013', productName: '笔记本 A5 方格', unitPrice: 200, stockQuantity: 300, warehouseNumber: 'WH03', remarks: '' },
      { productCode: 'PRD014', productName: '透明文件夹 A4', unitPrice: 50, stockQuantity: 999, warehouseNumber: 'WH03', remarks: '库存上限' },
      { productCode: 'PRD015', productName: '便利贴 75x75mm', unitPrice: 160, stockQuantity: 450, warehouseNumber: 'WH02', remarks: '' },
      { productCode: 'PRD016', productName: '便利贴 75x25mm', unitPrice: 120, stockQuantity: 500, warehouseNumber: 'WH02', remarks: '' },
      { productCode: 'PRD017', productName: '订书机', unitPrice: 480, stockQuantity: 90, warehouseNumber: 'WH04', remarks: '' },
      { productCode: 'PRD018', productName: '订书钉 No.10', unitPrice: 150, stockQuantity: 400, warehouseNumber: 'WH04', remarks: '' },
      { productCode: 'PRD019', productName: '透明胶带', unitPrice: 100, stockQuantity: 350, warehouseNumber: 'WH04', remarks: '' },
      { productCode: 'PRD020', productName: '双面胶带', unitPrice: 180, stockQuantity: 200, warehouseNumber: 'WH04', remarks: '' },
      { productCode: 'PRD021', productName: '剪刀', unitPrice: 350, stockQuantity: 100, warehouseNumber: 'WH04', remarks: '' },
      { productCode: 'PRD022', productName: '美工刀', unitPrice: 280, stockQuantity: 80, warehouseNumber: 'WH04', remarks: '' },
      { productCode: 'PRD023', productName: '直尺 30cm', unitPrice: 200, stockQuantity: 150, warehouseNumber: 'WH04', remarks: '' },
      { productCode: 'PRD024', productName: '磁铁（白）', unitPrice: 90, stockQuantity: 600, warehouseNumber: 'WH05', remarks: '' },
      { productCode: 'PRD025', productName: '白板笔', unitPrice: 180, stockQuantity: 250, warehouseNumber: 'WH05', remarks: '红·蓝·黑套装' }
    ]
  };
}

// ========================================
// 错误页面跳转
// ========================================
/**
 * 发生错误时，在全屏显示错误消息。
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

## 呈现页面（simple_list/view/index.html）

```html
<!-- 头部 -->
<imart type="head">
  <!-- 标题 -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- 呈现页面自定义样式 -->
  <style>
    /* 表格上方区域使用flex布局 */
    .button-area {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: 100%;
      justify-content: space-between;
      gap: 0.5em 1em;
    }
    /* TODO: 以下表格布局根据用途适当修改 */
    #stock-table th,
    #stock-table td {
      white-space: nowrap;
    }
    #stock-table .col-remarks {
      white-space: normal;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .col-edit {
      width: 4em;
    }
  </style>
  <!-- 呈现页面脚本（将 $data 通过 IIFE 作用域化，而不放入全局作用域） -->
  <script>
  (function($data) {
  document.addEventListener('DOMContentLoaded', () => {
    // 常量
    const STORAGE_KEY = 'product_stock_data';
    const PAGE_SIZE = 10;

    // 当前页
    let currentPage = 1;

    // 在会话存储中初始化虚拟数据
    function initializeData() {
      if (!sessionStorage.getItem(STORAGE_KEY)) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify($data.result.list));
      }
    }

    // 获取全部数据
    function getAllData() {
      let data = sessionStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }

    // HTML转义
    function escapeHtml(str) {
      let div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    // 渲染表格
    function renderTable() {
      let allData = getAllData();
      let totalItems = allData.length;
      let totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

      if (currentPage > totalPages) {
        currentPage = totalPages;
      }

      let startIndex = (currentPage - 1) * PAGE_SIZE;
      let endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);
      let pageData = allData.slice(startIndex, endIndex);

      let tbody = document.getElementById('stock-table-body');
      tbody.innerHTML = '';

      if (pageData.length === 0) {
        let tr = document.createElement('tr');
        let td = document.createElement('td');
        td.setAttribute('colspan', '7');
        td.style.textAlign = 'center';
        td.style.padding = '2em';
        td.textContent = '没有数据。';
        tr.appendChild(td);
        tbody.appendChild(tr);
      } else {
        pageData.forEach((item) => {
          let tr = document.createElement('tr');
          tr.innerHTML =
            '<td class="col-edit has-content-only">' +
            '<button type="button" class="imds-button is-ghost is-small" data-edit-code="' + escapeHtml(item.productCode) + '">' +
            '<span class="imds-icon"><i class="fa-regular fa-file-lines"></i></span></button></td>' +
            '<td><span>' + escapeHtml(item.productCode) + '</span></td>' +
            '<td><span>' + escapeHtml(item.productName) + '</span></td>' +
            '<td class="has-text-right"><span>' + Number(item.unitPrice).toLocaleString() + '</span></td>' +
            '<td class="has-text-right"><span>' + item.stockQuantity + '</span></td>' +
            '<td><span>' + escapeHtml(item.warehouseNumber || '') + '</span></td>' +
            '<td class="col-remarks"><span>' + escapeHtml(item.remarks || '') + '</span></td>';
          tbody.appendChild(tr);
        });
      }

      // 编辑按钮事件
      tbody.querySelectorAll('[data-edit-code]').forEach((button) => {
        button.addEventListener('click', () => {
          location.href = 'product_stock/edit?productCode=' + encodeURIComponent(button.getAttribute('data-edit-code'));
        });
      });

      renderPagination(totalPages, totalItems, startIndex + 1, endIndex);
    }

    // 计算分页的页码列表
    function getPageNumbers(current, total) {
      let pages = [];
      let delta = 2;

      for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
          pages.push(i);
        } else if (pages[pages.length - 1]  !== '...') {
          pages.push('...');
        }
      }

      return pages;
    }

    // 渲染分页
    function renderPagination(totalPages, totalItems, startNum, endNum) {
      let container = document.getElementById('pagination');
      container.innerHTML = '';

      if (totalItems === 0) {
        return;
      }

      let nav = document.createElement('nav');
      nav.className = 'imds-pagination';

      // 翻页按钮组
      let controls = document.createElement('div');
      controls.className = 'imds-pagination-controls';

      // 上一页按钮
      let prevButton = document.createElement('button');
      prevButton.type = 'button';
      prevButton.className = 'imds-button is-ghost';
      prevButton.title = '上一页';
      prevButton.disabled = (currentPage <= 1);
      prevButton.innerHTML = '<span class="imds-icon"><i class="fa-solid fa-angle-left"></i></span>';
      prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderTable();
        }
      });
      controls.appendChild(prevButton);

      // 页码
      let pageNumberContainer = document.createElement('div');
      pageNumberContainer.className = 'imds-pagination-page-number';

      let pageNumbers = getPageNumbers(currentPage, totalPages);
      pageNumbers.forEach((page) => {
        if (page === '...') {
          let ellipsis = document.createElement('div');
          ellipsis.className = 'imds-pagination-page-ellipsis';
          ellipsis.innerHTML = '<span>…</span>';
          pageNumberContainer.appendChild(ellipsis);
        } else {
          let pageButton = document.createElement('button');
          pageButton.type = 'button';
          pageButton.className = 'imds-button ' + (page === currentPage ? 'is-primary' : 'is-ghost');
          pageButton.textContent = String(page);
          pageButton.addEventListener('click', (function(p) {
            return function() {
              if (p !== currentPage) {
                currentPage = p;
                renderTable();
              }
            };
          })(page));
          pageNumberContainer.appendChild(pageButton);
        }
      });

      controls.appendChild(pageNumberContainer);

      // 下一页按钮
      let nextButton = document.createElement('button');
      nextButton.type = 'button';
      nextButton.className = 'imds-button is-ghost';
      nextButton.title = '下一页';
      nextButton.disabled = (currentPage >= totalPages);
      nextButton.innerHTML = '<span class="imds-icon"><i class="fa-solid fa-angle-right"></i></span>';
      nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
          currentPage++;
          renderTable();
        }
      });
      controls.appendChild(nextButton);

      nav.appendChild(controls);

      // 件数信息
      let options = document.createElement('div');
      options.className = 'imds-pagination-options';
      let info = document.createElement('span');
      info.textContent = startNum + ' - ' + endNum + ' / ' + totalItems;
      options.appendChild(info);
      nav.appendChild(options);

      container.appendChild(nav);
    }

    // 新建按钮点击事件
    document.getElementById('create-button').addEventListener('click', () => {
      location.href = 'sample/simple_list/edit';
    });

    // 入口点
    if ($data.error.code) {
      imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
    } else {
      initializeData();
      renderTable();
    }
  });
  })(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
  </script>
</imart>

<!-- 页面整体容器 -->
<div id="container">
  <div class="imds-container">
    <!-- 头部 -->
    <header class="imds-header">
      <div class="imds-header-icon">
        <span class="imds-icon-wrapper is-large">
          <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
        </span>
      </div>
      <div class="imds-header-title">
        <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
        <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
      </div>
    </header>

    <!-- 主要内容 -->
    <main>
      <div class="imds-py-3">
        <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4">
          <div class="button-area imds-mb-3">
            <div class="imds-input-group">
              <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="搜索关键词">
              <button type="button" title="搜索" class="imds-button">
                <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
              </button>
            </div>
            <button type="button" id="create-button" class="imds-button is-primary">新建</button>
          </div>
          <div class="imds-table" id="stock-table">
            <div class="imds-table-inner">
              <table>
                <thead>
                  <tr>
                    <th class="col-edit has-text-centered"><span>编辑</span></th>
                    <th><span>商品代码</span></th>
                    <th><span>商品名称</span></th>
                    <th><span>单价</span></th>
                    <th><span>库存数量</span></th>
                    <th><span>仓库编号</span></th>
                    <th><span>备注</span></th>
                  </tr>
                </thead>
                <tbody id="stock-table-body"></tbody>
              </table>
            </div>
          </div>
          <div class="imds-py-3" id="pagination"></div>
        </section>
      </div>
    </main>
  </div>
</div>
```

---

## 路由配置（simple_list.xml）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<routing-jssp-config
    xmlns="http://www.intra-mart.jp/router/routing-jssp-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/router/routing-jssp-config routing-jssp-config.xsd">

  <!-- 列表画面 -->
  <file-mapping path="/sample/simple_list" page="sample/simple_list/view/index">
    <authz uri="service://sample/simple_list" action="execute" />
  </file-mapping>

</routing-jssp-config>
```

---

## 可用模板

- **简单列表**: [assets/simple-list.md](assets/simple-list.md)
  - 应用了intra-mart Design System（imds）主题的画面
  - 表格列表显示和分页
  - 搜索关键词输入和新建按钮
  - 各行设有编辑链接

### 生成时的指示示例

当用户请求"创建列表画面"时，参考此assets中的代码，生成适当定制的版本。
