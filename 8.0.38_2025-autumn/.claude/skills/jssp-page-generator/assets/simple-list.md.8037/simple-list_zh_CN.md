# 简单列表画面模板

## 概述

使用简单表格列表和分页的画面构成模板。
画面初始显示时，将服务器端获取的值显示在呈现页面中；表格渲染、按搜索关键词筛选和翻页由客户端JavaScript处理。
列表首列（商品名称）为跳转到编辑画面的链接。数据为 0 条时显示空状态 UI。

### 与 imds 模板的对应关系

- 画面构成遵循 `jssp-imds-theme` 技能的列表画面模板 `assets/imds-list-page.md`

## 文件结构

```
src/main/jssp/src/sample/simple_list/view/
  ├── index.js              # 功能容器
  └── index.html            # 呈现页面

src/main/conf/routing-jssp-config/
  └── simple_list.xml       # 路由配置
```

---

## 功能容器（sample/simple_list/view/index.js）

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

## 呈现页面（sample/simple_list/view/index.html）

```html
<!-- 头部 -->
<imart type="head">
  <!-- 标题 -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- 用于控制各主题不同的内容显示区域高度和宽度的 CSS -->
  <link rel="stylesheet" type="text/css" href="im_design_system/theme/css/theme-conditional-layout.css" />
  <!-- 呈现页面自定义样式 -->
  <style>
    /* 布局控制样式 */
    .pgstyle-layout-container {
      grid-template-rows: 5rem minmax(0, 1fr);
      grid-template-columns: 100%;
      height: 100%;
      display: grid;
    }
    .pgstyle-layout-container > .imds-header {
      grid-row: 1 / 2;
    }
    .pgstyle-layout-main {
      flex-direction: column;
      grid-row: 2 / 3;
      height: 100%;
      display: flex;
    }
    .pgstyle-layout-content {
      flex: 1 0 0;
      overflow: auto;
    }
    .pgstyle-table-wrapper {
      display: flex;
      flex-direction: column;
    }
    .pgstyle-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: 100%;
      justify-content: space-between;
      gap: 0.5em 1em;
    }
    /* 搜索栏宽度（数值可按画面调整） */
    .pgstyle-toolbar > .imds-input-group {
      max-width: 30em;
      flex: 1 0 20em;
    }
  </style>
  <!-- 呈现页面脚本（将 $data 通过 IIFE 作用域化，而不放入全局作用域） -->
  <script>
  (function($data) {
  document.addEventListener('DOMContentLoaded', () => {
    // 常量
    const STORAGE_KEY = 'product_stock_data';
    const COLUMN_COUNT = 6;
    const RANGE_LENGTH = 3;
    const RECORDS_PER_PAGE_OPTIONS = [100, 125, 150, 175, 200];

    // 每页显示条数（默认 100 条）
    let pageSize = 100;
    // 当前页
    let currentPage = 1;
    // 搜索关键词
    let keyword = '';

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

    // 获取按搜索关键词筛选后的数据（对商品名称、商品代码、仓库编号、备注进行部分匹配）
    function getFilteredData(allData) {
      if (!keyword) {
        return allData;
      }
      let lowerKeyword = keyword.toLowerCase();
      return allData.filter((item) => {
        return [item.productName, item.productCode, item.warehouseNumber, item.remarks].some((value) => {
          return String(value || '').toLowerCase().indexOf(lowerKeyword) !== -1;
        });
      });
    }

    // 生成仅包含文本的单元格
    function createTextCell(text, className) {
      let td = document.createElement('td');
      if (className) {
        td.className = className;
      }
      let span = document.createElement('span');
      span.textContent = text;
      td.appendChild(span);
      return td;
    }

    // 生成数据行（首列的商品名称作为跳转到编辑画面的链接）
    function createRow(item) {
      let tr = document.createElement('tr');

      // TODO: 实现编辑画面（sample/simple_list/edit）。有 productCode 参数时作为编辑处理，没有时作为新增登记处理
      let link = document.createElement('a');
      link.textContent = item.productName;
      link.setAttribute('href', 'sample/simple_list/edit?productCode=' + encodeURIComponent(item.productCode));
      let linkSpan = document.createElement('span');
      linkSpan.appendChild(link);
      let linkCell = document.createElement('td');
      linkCell.appendChild(linkSpan);
      tr.appendChild(linkCell);

      tr.appendChild(createTextCell(item.productCode));
      tr.appendChild(createTextCell(Number(item.unitPrice).toLocaleString(), 'has-text-right'));
      tr.appendChild(createTextCell(String(item.stockQuantity), 'has-text-right'));
      tr.appendChild(createTextCell(item.warehouseNumber || ''));

      // 备注以 1 行省略显示，可通过 title 查看全文
      let remarksCell = createTextCell(item.remarks || '');
      let remarksSpan = remarksCell.firstChild;
      remarksSpan.className = 'imds-line-clamp-1';
      remarksSpan.setAttribute('title', item.remarks || '');
      tr.appendChild(remarksCell);

      return tr;
    }

    // 生成搜索结果为 0 条时的行（放置在表格内的空状态 UI：is-small）
    function createEmptyRow() {
      let tr = document.createElement('tr');
      let td = document.createElement('td');
      td.setAttribute('colspan', String(COLUMN_COUNT));
      td.innerHTML =
        '<div class="imds-empty-state-container">' +
          '<div class="imds-empty-state is-small">' +
            '<div class="imds-empty-state-message-wrapper">' +
              '<span class="imds-empty-state-icon">' +
                '<span class="imds-icon is-gray-light"><i class="fa-solid fa-circle-info"></i></span>' +
              '</span>' +
              '<div class="imds-empty-state-message"><p class="imds-empty-state-message-title">未找到符合条件的数据。请重新确认搜索关键词。</p></div>' +
            '</div>' +
          '</div>' +
        '</div>';
      tr.appendChild(td);
      return tr;
    }

    // 未登记数据时，隐藏操作区域、表格和分页，仅显示空状态 UI
    function toggleNoDataState(hasData) {
      document.getElementById('search-form').style.display = hasData ? '' : 'none';
      document.getElementById('stock-table').style.display = hasData ? '' : 'none';
      document.getElementById('no-data-state').style.display = hasData ? 'none' : '';
    }

    // 渲染表格
    function renderTable() {
      let allData = getAllData();
      let pagination = document.getElementById('pagination');

      if (allData.length === 0) {
        toggleNoDataState(false);
        pagination.style.display = 'none';
        return;
      }
      toggleNoDataState(true);

      let filteredData = getFilteredData(allData);
      let totalItems = filteredData.length;
      let totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

      if (currentPage > totalPages) {
        currentPage = totalPages;
      }

      let startIndex = (currentPage - 1) * pageSize;
      let endIndex = Math.min(startIndex + pageSize, totalItems);
      let pageData = filteredData.slice(startIndex, endIndex);

      let tbody = document.getElementById('stock-table-body');
      tbody.textContent = '';

      if (pageData.length === 0) {
        tbody.appendChild(createEmptyRow());
        pagination.style.display = 'none';
        return;
      }

      pageData.forEach((item) => {
        tbody.appendChild(createRow(item));
      });

      pagination.style.display = '';
      renderPagination(totalPages, totalItems, startIndex + 1, endIndex);
    }

    // 计算分页的页码列表
    // 显示当前页前后 RANGE_LENGTH 页，不对仅 1 页进行省略
    function getPageNumbers(current, total) {
      let pages = [];

      if (total <= RANGE_LENGTH * 2 + 5) {
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
        return pages;
      }

      let start = Math.max(Math.min(current - RANGE_LENGTH, total - RANGE_LENGTH * 2 - 2), 3);
      let end = Math.min(Math.max(current + RANGE_LENGTH, RANGE_LENGTH * 2 + 3), total - 2);

      pages.push(1);
      pages.push(start > 3 ? '...' : 2);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      pages.push(end < total - 2 ? '...' : total - 1);
      pages.push(total);

      return pages;
    }

    // 生成上一页・下一页按钮
    function createMoveButton(title, iconClass, disabled, targetPage) {
      let button = document.createElement('button');
      button.type = 'button';
      button.className = 'imds-button is-ghost';
      button.title = title;
      button.disabled = disabled;
      button.innerHTML = '<span class="imds-icon"><i class="fa-solid ' + iconClass + '"></i></span>';
      button.addEventListener('click', () => {
        currentPage = targetPage;
        renderTable();
      });
      return button;
    }

    // 生成页码按钮（或省略号）
    function createPageNumberItem(page) {
      if (page === '...') {
        let ellipsis = document.createElement('div');
        ellipsis.className = 'imds-pagination-page-ellipsis';
        ellipsis.innerHTML = '<span>…</span>';
        return ellipsis;
      }
      let pageButton = document.createElement('button');
      pageButton.type = 'button';
      pageButton.className = 'imds-button ' + (page === currentPage ? 'is-primary' : 'is-ghost');
      pageButton.textContent = String(page);
      pageButton.addEventListener('click', () => {
        if (page !== currentPage) {
          currentPage = page;
          renderTable();
        }
      });
      return pageButton;
    }

    // 生成翻页按钮组
    function createPaginationControls(totalPages) {
      let controls = document.createElement('div');
      controls.className = 'imds-pagination-controls';

      // 上一页按钮
      controls.appendChild(createMoveButton('上一页', 'fa-angle-left', currentPage <= 1, currentPage - 1));

      // 页码
      let pageNumberContainer = document.createElement('div');
      pageNumberContainer.className = 'imds-pagination-page-number';
      getPageNumbers(currentPage, totalPages).forEach((page) => {
        pageNumberContainer.appendChild(createPageNumberItem(page));
      });
      controls.appendChild(pageNumberContainer);

      // 下一页按钮
      controls.appendChild(createMoveButton('下一页', 'fa-angle-right', currentPage >= totalPages, currentPage + 1));

      return controls;
    }

    // 生成选项区域（每页显示条数 + 件数信息）
    function createPaginationOptions(totalItems, startNum, endNum) {
      let options = document.createElement('div');
      options.className = 'imds-pagination-options';

      // 每页显示条数
      let recordsPerPage = document.createElement('div');
      recordsPerPage.className = 'imds-pagination-records-per-page';
      let label = document.createElement('label');
      label.setAttribute('for', 'records-per-page');
      label.textContent = '显示条数';
      recordsPerPage.appendChild(label);
      let select = document.createElement('select');
      select.id = 'records-per-page';
      select.className = 'imds-select';
      RECORDS_PER_PAGE_OPTIONS.forEach((value) => {
        let option = document.createElement('option');
        option.value = String(value);
        option.textContent = String(value);
        option.selected = (value === pageSize);
        select.appendChild(option);
      });
      select.addEventListener('change', () => {
        pageSize = Number(select.value);
        currentPage = 1;
        renderTable();
      });
      recordsPerPage.appendChild(select);
      options.appendChild(recordsPerPage);

      // 件数信息
      let info = document.createElement('span');
      info.textContent = startNum + ' - ' + endNum + ' / ' + totalItems;
      options.appendChild(info);

      return options;
    }

    // 渲染分页
    function renderPagination(totalPages, totalItems, startNum, endNum) {
      let container = document.getElementById('pagination');
      container.textContent = '';

      let nav = document.createElement('nav');
      nav.className = 'imds-pagination is-small';
      nav.appendChild(createPaginationControls(totalPages));
      nav.appendChild(createPaginationOptions(totalItems, startNum, endNum));

      container.appendChild(nav);
    }

    // 跳转到新建画面
    function moveToCreate() {
      location.href = 'sample/simple_list/edit';
    }

    // 搜索表单 submit 事件（统一 Enter 键与搜索按钮的执行路径）
    document.getElementById('search-form').addEventListener('submit', (event) => {
      event.preventDefault();
      keyword = document.getElementById(':searchKeywords:').value.trim();
      currentPage = 1;
      renderTable();
    });

    // 新建按钮点击事件
    document.getElementById('create-button').addEventListener('click', moveToCreate);
    document.getElementById('no-data-create-button').addEventListener('click', moveToCreate);

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

<!-- 页面整体容器（会被放置在 intra-mart 主题的 imui-container 内部，因此不附加 id） -->
<div class="imds-container pgstyle-layout-container">
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
  <main class="pgstyle-layout-main">
    <div class="imds-px-3 imds-py-2 pgstyle-table-wrapper pgstyle-layout-content imds-scrollbar">
      <!-- 操作区域（搜索栏 + 新建按钮） -->
      <form id="search-form" class="imds-form">
        <div class="pgstyle-toolbar imds-mb-2">
          <div class="imds-input-group">
            <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="搜索关键词" aria-label="搜索关键词">
            <button type="submit" title="搜索" class="imds-button is-outlined">
              <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
            </button>
          </div>
          <button type="button" id="create-button" class="imds-button is-primary" style="min-width: 8em;">新建</button>
        </div>
      </form>
      <!-- 列表表格 -->
      <div class="imds-table is-area-bordered is-bordered is-sticky is-narrow is-hoverable" id="stock-table" style="height: 100%">
        <div class="imds-table-inner">
          <table>
            <thead>
              <tr>
                <th><span>商品名称</span></th>
                <th><span>商品代码</span></th>
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
      <!-- 分页 -->
      <div class="imds-mt-2" id="pagination"></div>
      <!-- 未登记数据时的空状态 UI（仅在没有任何数据时显示） -->
      <div class="imds-empty-state-container" id="no-data-state" style="display: none;">
        <div class="imds-empty-state">
          <div class="imds-empty-state-message-wrapper">
            <span class="imds-empty-state-icon">
              <span class="imds-icon is-gray-light"><i class="fa-solid fa-circle-info"></i></span>
            </span>
            <div class="imds-empty-state-message">
              <p class="imds-empty-state-message-title">尚未登记任何数据</p>
              <p class="imds-empty-state-message-content">请通过新建按钮登记数据。</p>
            </div>
          </div>
          <div class="imds-empty-state-content imds-mt-7">
            <button type="button" id="no-data-create-button" class="imds-button is-large is-primary">新建</button>
          </div>
        </div>
      </div>
    </div>
  </main>
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
  - 表格列表显示和分页（带每页显示条数选择）
  - 搜索关键词和新建按钮（搜索通过 `<form>` 的 submit 执行，在客户端对初始显示时已获取的列表进行筛选）
  - 在首列（商品名称）设置跳转到编辑画面的链接
  - 未登记数据时与搜索结果为 0 条时的空状态 UI
  - 数据量较大、无法在客户端保存全部数据时，将搜索和翻页替换为服务端处理（通过 API 重新获取）

### 生成时的指示示例

当用户请求"创建列表画面"时，参考此assets中的代码，生成适当定制的版本。
