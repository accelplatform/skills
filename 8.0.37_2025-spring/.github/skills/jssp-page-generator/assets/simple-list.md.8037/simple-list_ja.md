# シンプル一覧画面テンプレート

## 概要

シンプルなテーブル一覧とページネーションを使用した画面構成のテンプレート。
画面初期表示時はサーバ側で取得した値をプレゼンテーションページに表示し、テーブルの描画・検索キーワードによる絞り込み・ページ送りはクライアント側 JavaScript で行う。
一覧の先頭列（商品名）は編集画面へのリンクになっている。データが 0 件の場合は空状態 UI を表示する。

### imds テンプレートとの対応

- 画面構成は `jssp-imds-theme` スキルの一覧画面テンプレート `assets/imds-list-page.md` に準拠する

## ファイル構成

```
src/main/jssp/src/sample/simple_list/view/
  ├── index.js              # ファンクションコンテナ
  └── index.html            # プレゼンテーションページ

src/main/conf/routing-jssp-config/
  └── simple_list.xml       # ルーティング設定
```

---

## ファンクションコンテナ（sample/simple_list/view/index.js）

```javascript
/**
 * シンプルな一覧画面
 *
 * @file index.js
 * @description データの一覧表示とページネーションを提供する画面を構成します。
 */

// ========================================
// バインド変数（プレゼンテーションページ連携用）
// ========================================
let $title = '一覧';
let $subTitle = 'サンプル管理';
let $data = '{}';

// ========================================
// エントリーポイント
// ========================================
/**
 * 画面表示のエントリーポイントです。
 * 画面のURLにアクセスされたとき、最初に実行されます。
 *
 * @param {Object} request - リクエストオブジェクト
 */
function init(request) {
  // メイン処理を実行
  let response = main(request);

  // JSON 形式で $data に格納
  // JSON 内に </script> が含まれていると、スクリプトが終了してしまうため、
  // レスポンス中の '/' を '\/' に全置換する
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

// ========================================
// メイン処理
// ========================================
/**
 * メイン処理を実行します。
 *
 * @param {Object} request - リクエストパラメータ
 * @return {Object} 処理結果
 */
function main(request) {
  let logger = Logger.getLogger();
  let response = {
    result: null,
    error: {
      code: '',                 // エラーコード
      message: ''               // エラーメッセージ
    }
  };

  try {
    // ビジネスロジックのメイン処理を実行
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('画面表示中にエラーが発生しました。{}', e.message);
    transferErrorPage('E001', '予期しないエラーが発生しました。');
    return response;
  }

  return response;
}

// ========================================
// ビジネスロジック
// ========================================
/**
 * ビジネスロジックのメイン処理を実行します。
 *
 * @param {Object} request - リクエストパラメータ
 * @return {Object} 処理結果
 */
function processBusinessLogic(request) {
  // TODO: ここで、データベースからの一覧データ取得処理を行ってください
  return {
    list: [
      { productCode: 'PRD001', productName: 'ボールペン（黒）', unitPrice: 150, stockQuantity: 500, warehouseNumber: 'WH01', remarks: '定番商品' },
      { productCode: 'PRD002', productName: 'ボールペン（赤）', unitPrice: 150, stockQuantity: 300, warehouseNumber: 'WH01', remarks: '' },
      { productCode: 'PRD003', productName: 'ボールペン（青）', unitPrice: 150, stockQuantity: 250, warehouseNumber: 'WH01', remarks: '' },
      { productCode: 'PRD004', productName: 'シャープペンシル 0.5mm', unitPrice: 280, stockQuantity: 180, warehouseNumber: 'WH01', remarks: '' },
      { productCode: 'PRD005', productName: 'シャープペンシル 0.3mm', unitPrice: 350, stockQuantity: 120, warehouseNumber: 'WH01', remarks: '在庫少' },
      { productCode: 'PRD006', productName: '消しゴム', unitPrice: 80, stockQuantity: 600, warehouseNumber: 'WH02', remarks: '' },
      { productCode: 'PRD007', productName: '修正テープ', unitPrice: 230, stockQuantity: 150, warehouseNumber: 'WH02', remarks: '' },
      { productCode: 'PRD008', productName: '蛍光ペン（黄）', unitPrice: 120, stockQuantity: 400, warehouseNumber: 'WH02', remarks: '' },
      { productCode: 'PRD009', productName: '蛍光ペン（ピンク）', unitPrice: 120, stockQuantity: 350, warehouseNumber: 'WH02', remarks: '' },
      { productCode: 'PRD010', productName: '蛍光ペン（緑）', unitPrice: 120, stockQuantity: 200, warehouseNumber: 'WH02', remarks: '' },
      { productCode: 'PRD011', productName: 'ノート A4 罫線', unitPrice: 180, stockQuantity: 800, warehouseNumber: 'WH03', remarks: '大量在庫' },
      { productCode: 'PRD012', productName: 'ノート B5 罫線', unitPrice: 150, stockQuantity: 700, warehouseNumber: 'WH03', remarks: '' },
      { productCode: 'PRD013', productName: 'ノート A5 方眼', unitPrice: 200, stockQuantity: 300, warehouseNumber: 'WH03', remarks: '' },
      { productCode: 'PRD014', productName: 'クリアファイル A4', unitPrice: 50, stockQuantity: 999, warehouseNumber: 'WH03', remarks: '在庫上限' },
      { productCode: 'PRD015', productName: '付箋紙 75x75mm', unitPrice: 160, stockQuantity: 450, warehouseNumber: 'WH02', remarks: '' },
      { productCode: 'PRD016', productName: '付箋紙 75x25mm', unitPrice: 120, stockQuantity: 500, warehouseNumber: 'WH02', remarks: '' },
      { productCode: 'PRD017', productName: 'ホチキス', unitPrice: 480, stockQuantity: 90, warehouseNumber: 'WH04', remarks: '' },
      { productCode: 'PRD018', productName: 'ホチキス針 No.10', unitPrice: 150, stockQuantity: 400, warehouseNumber: 'WH04', remarks: '' },
      { productCode: 'PRD019', productName: 'セロハンテープ', unitPrice: 100, stockQuantity: 350, warehouseNumber: 'WH04', remarks: '' },
      { productCode: 'PRD020', productName: '両面テープ', unitPrice: 180, stockQuantity: 200, warehouseNumber: 'WH04', remarks: '' },
      { productCode: 'PRD021', productName: 'ハサミ', unitPrice: 350, stockQuantity: 100, warehouseNumber: 'WH04', remarks: '' },
      { productCode: 'PRD022', productName: 'カッターナイフ', unitPrice: 280, stockQuantity: 80, warehouseNumber: 'WH04', remarks: '' },
      { productCode: 'PRD023', productName: '定規 30cm', unitPrice: 200, stockQuantity: 150, warehouseNumber: 'WH04', remarks: '' },
      { productCode: 'PRD024', productName: 'マグネット（白）', unitPrice: 90, stockQuantity: 600, warehouseNumber: 'WH05', remarks: '' },
      { productCode: 'PRD025', productName: 'ホワイトボードマーカー', unitPrice: 180, stockQuantity: 250, warehouseNumber: 'WH05', remarks: '赤・青・黒セット' }
    ]
  };
}

// ========================================
// エラーページ遷移
// ========================================
/**
 * エラーが発生したときにエラーメッセージを全画面に表示します。
 *
 * @param {String} code - エラーコード
 * @param {String} message - エラーメッセージ
 */
function transferErrorPage(code, message) {
  let parameter = {
    title: 'システムエラーが発生しました',
    message: [code, message].join('\n')
  };
  Transfer.toErrorPage(parameter);
}
```

---

## プレゼンテーションページ（sample/simple_list/view/index.html）

```html
<!-- ヘッダ -->
<imart type="head">
  <!-- タイトル -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- テーマごとに異なるコンテンツ表示領域の高さ・幅を制御する CSS -->
  <link rel="stylesheet" type="text/css" href="im_design_system/theme/css/theme-conditional-layout.css" />
  <!-- プレゼンテーションページの独自スタイル -->
  <style>
    /* レイアウト制御用スタイル */
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
    /* 検索欄の幅（値は画面ごとに調整してよい） */
    .pgstyle-toolbar > .imds-input-group {
      max-width: 30em;
      flex: 1 0 20em;
    }
  </style>
  <!-- プレゼンテーションページのスクリプト（$data をグローバル領域に置かず IIFE でスコープ化する） -->
  <script>
  (function($data) {
  document.addEventListener('DOMContentLoaded', () => {
    // 定数
    const STORAGE_KEY = 'product_stock_data';
    const COLUMN_COUNT = 6;
    const RANGE_LENGTH = 3;
    const RECORDS_PER_PAGE_OPTIONS = [100, 125, 150, 175, 200];

    // 表示件数（初期値 100 件）
    let pageSize = 100;
    // 現在のページ
    let currentPage = 1;
    // 検索キーワード
    let keyword = '';

    // セッションストレージにダミーデータを初期化
    function initializeData() {
      if (!sessionStorage.getItem(STORAGE_KEY)) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify($data.result.list));
      }
    }

    // 全データ取得
    function getAllData() {
      let data = sessionStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }

    // 検索キーワードで絞り込んだデータを取得（商品名・商品コード・倉庫番号・備考の部分一致）
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

    // テキストのみを持つセルを生成
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

    // データ行を生成（先頭列の商品名を編集画面へのリンクにする）
    function createRow(item) {
      let tr = document.createElement('tr');

      // TODO: 編集画面（sample/simple_list/edit）を実装すること。productCode パラメータがあれば編集、なければ新規登録として扱う
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

      // 備考は 1 行で省略表示し、全文は title で確認できるようにする
      let remarksCell = createTextCell(item.remarks || '');
      let remarksSpan = remarksCell.firstChild;
      remarksSpan.className = 'imds-line-clamp-1';
      remarksSpan.setAttribute('title', item.remarks || '');
      tr.appendChild(remarksCell);

      return tr;
    }

    // 検索結果 0 件の行を生成（テーブル内に配置する空状態 UI: is-small）
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
              '<div class="imds-empty-state-message"><p class="imds-empty-state-message-title">該当するデータが見つかりませんでした。検索キーワードを見直してください。</p></div>' +
            '</div>' +
          '</div>' +
        '</div>';
      tr.appendChild(td);
      return tr;
    }

    // データ未登録時は操作エリア・テーブル・ページネーションを非表示にし、空状態 UI のみを表示する
    function toggleNoDataState(hasData) {
      document.getElementById('search-form').style.display = hasData ? '' : 'none';
      document.getElementById('stock-table').style.display = hasData ? '' : 'none';
      document.getElementById('no-data-state').style.display = hasData ? 'none' : '';
    }

    // テーブル描画
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

    // ページネーションのページ番号リストを算出
    // 現在ページの前後 RANGE_LENGTH ページを表示し、1 ページ分だけの省略は行わない
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

    // 前へ・次へボタンを生成
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

    // ページ番号ボタン（または省略記号）を生成
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

    // ページ送りボタン群を生成
    function createPaginationControls(totalPages) {
      let controls = document.createElement('div');
      controls.className = 'imds-pagination-controls';

      // 前へボタン
      controls.appendChild(createMoveButton('前へ', 'fa-angle-left', currentPage <= 1, currentPage - 1));

      // ページ番号
      let pageNumberContainer = document.createElement('div');
      pageNumberContainer.className = 'imds-pagination-page-number';
      getPageNumbers(currentPage, totalPages).forEach((page) => {
        pageNumberContainer.appendChild(createPageNumberItem(page));
      });
      controls.appendChild(pageNumberContainer);

      // 次へボタン
      controls.appendChild(createMoveButton('次へ', 'fa-angle-right', currentPage >= totalPages, currentPage + 1));

      return controls;
    }

    // オプション領域（表示件数 + 件数情報）を生成
    function createPaginationOptions(totalItems, startNum, endNum) {
      let options = document.createElement('div');
      options.className = 'imds-pagination-options';

      // 表示件数
      let recordsPerPage = document.createElement('div');
      recordsPerPage.className = 'imds-pagination-records-per-page';
      let label = document.createElement('label');
      label.setAttribute('for', 'records-per-page');
      label.textContent = '表示件数';
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

      // 件数情報
      let info = document.createElement('span');
      info.textContent = startNum + ' - ' + endNum + ' / ' + totalItems;
      options.appendChild(info);

      return options;
    }

    // ページネーション描画
    function renderPagination(totalPages, totalItems, startNum, endNum) {
      let container = document.getElementById('pagination');
      container.textContent = '';

      let nav = document.createElement('nav');
      nav.className = 'imds-pagination is-small';
      nav.appendChild(createPaginationControls(totalPages));
      nav.appendChild(createPaginationOptions(totalItems, startNum, endNum));

      container.appendChild(nav);
    }

    // 新規作成画面へ遷移
    function moveToCreate() {
      location.href = 'sample/simple_list/edit';
    }

    // 検索フォーム submit 時イベント（Enter キーと検索ボタンの経路を 1 本化する）
    document.getElementById('search-form').addEventListener('submit', (event) => {
      event.preventDefault();
      keyword = document.getElementById(':searchKeywords:').value.trim();
      currentPage = 1;
      renderTable();
    });

    // 新規作成ボタン クリック時イベント
    document.getElementById('create-button').addEventListener('click', moveToCreate);
    document.getElementById('no-data-create-button').addEventListener('click', moveToCreate);

    // エントリーポイント
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

<!-- ページ全体のコンテナ（intra-mart テーマの imui-container の内側に配置されるため id は付与しない） -->
<div class="imds-container pgstyle-layout-container">
  <!-- ヘッダ -->
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

  <!-- メインコンテンツ -->
  <main class="pgstyle-layout-main">
    <div class="imds-px-3 imds-py-2 pgstyle-table-wrapper pgstyle-layout-content imds-scrollbar">
      <!-- 操作エリア（検索欄 + 新規作成ボタン） -->
      <form id="search-form" class="imds-form">
        <div class="pgstyle-toolbar imds-mb-2">
          <div class="imds-input-group">
            <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="検索キーワード" aria-label="検索キーワード">
            <button type="submit" title="検索" class="imds-button is-outlined">
              <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
            </button>
          </div>
          <button type="button" id="create-button" class="imds-button is-primary" style="min-width: 8em;">新規作成</button>
        </div>
      </form>
      <!-- 一覧テーブル -->
      <div class="imds-table is-area-bordered is-bordered is-sticky is-narrow is-hoverable" id="stock-table" style="height: 100%">
        <div class="imds-table-inner">
          <table>
            <thead>
              <tr>
                <th><span>商品名</span></th>
                <th><span>商品コード</span></th>
                <th><span>単価</span></th>
                <th><span>在庫数</span></th>
                <th><span>倉庫番号</span></th>
                <th><span>備考</span></th>
              </tr>
            </thead>
            <tbody id="stock-table-body"></tbody>
          </table>
        </div>
      </div>
      <!-- ページネーション -->
      <div class="imds-mt-2" id="pagination"></div>
      <!-- データ未登録時の空状態 UI（データが 1 件も無い場合のみ表示） -->
      <div class="imds-empty-state-container" id="no-data-state" style="display: none;">
        <div class="imds-empty-state">
          <div class="imds-empty-state-message-wrapper">
            <span class="imds-empty-state-icon">
              <span class="imds-icon is-gray-light"><i class="fa-solid fa-circle-info"></i></span>
            </span>
            <div class="imds-empty-state-message">
              <p class="imds-empty-state-message-title">まだデータが登録されていません</p>
              <p class="imds-empty-state-message-content">新規作成ボタンからデータを登録してください。</p>
            </div>
          </div>
          <div class="imds-empty-state-content imds-mt-7">
            <button type="button" id="no-data-create-button" class="imds-button is-large is-primary">新規作成</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
```

---

## ルーティング設定（simple_list.xml）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<routing-jssp-config
    xmlns="http://www.intra-mart.jp/router/routing-jssp-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/router/routing-jssp-config routing-jssp-config.xsd">

  <!-- 一覧画面 -->
  <file-mapping path="/sample/simple_list" page="sample/simple_list/view/index">
    <authz uri="service://sample/simple_list" action="execute" />
  </file-mapping>

</routing-jssp-config>
```

---

## 使用可能なテンプレート

- **シンプル一覧**: [assets/simple-list.md](assets/simple-list.md)
  - intra-mart Design System（imds）のテーマを適用した画面
  - テーブル一覧表示とページネーション（表示件数選択付き）
  - 検索キーワードと新規作成ボタン（検索は `<form>` の submit で実行し、初期表示で取得済みの一覧をクライアント側で絞り込む）
  - 先頭列（商品名）に編集画面へのリンクを配置
  - データ未登録時・検索結果 0 件時の空状態 UI
  - データ量が多くクライアント側で全件を保持できない場合は、検索・ページ送りをサーバサイド（API での再取得）に置き換える

### 生成時の指示例

ユーザが「一覧画面を作成して」と依頼した場合、この assets のコードを参考にして適切にカスタマイズして生成する。
