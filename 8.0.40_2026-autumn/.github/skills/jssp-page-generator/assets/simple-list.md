# シンプル一覧画面テンプレート

## 概要

シンプルなテーブル一覧とページネーションを使用した画面構成のテンプレート。
画面初期表示時はサーバ側で取得した値をプレゼンテーションページに表示し、テーブルの描画・ページ送りはクライアント側 JavaScript で行う。
一覧の各行には編集リンクがあり、編集画面への遷移が可能。

## ファイル構成

```
src/main/jssp/src/simple_list/view/
  └── index.js              # ファンクションコンテナ
  └── index.html            # プレゼンテーションページ

src/main/conf/routing-jssp-config/
  └── simple_list.xml       # ルーティング設定
```

---

## ファンクションコンテナ（simple_list/view/index.js）

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

## プレゼンテーションページ（simple_list/view/index.html）

```html
<!-- ヘッダ -->
<imart type="head">
  <!-- タイトル -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- プレゼンテーションページ連携用のバインド変数 -->
  <script>const $data = <imart type="string" value=$data escapeXml="false" escapeJs="false" />;</script>
  <!-- プレゼンテーションページの独自スタイル -->
  <style>
    /* テーブル上部のエリアはフレックスで配置 */
    .button-area {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: 100%;
      justify-content: space-between;
      gap: 0.5em 1em;
    }
    /* TODO: 以下のテーブル用レイアウトは、用途によって適宜変更する */
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
  <!-- プレゼンテーションページのスクリプト -->
  <script>
  document.addEventListener('DOMContentLoaded', () => {
    // 定数
    const STORAGE_KEY = 'product_stock_data';
    const PAGE_SIZE = 10;

    // 現在のページ
    let currentPage = 1;

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

    // HTML エスケープ
    function escapeHtml(str) {
      let div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    // テーブル描画
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
        td.textContent = 'データがありません。';
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

      // 編集ボタンイベント
      tbody.querySelectorAll('[data-edit-code]').forEach((button) => {
        button.addEventListener('click', () => {
          location.href = 'product_stock/edit?productCode=' + encodeURIComponent(button.getAttribute('data-edit-code'));
        });
      });

      renderPagination(totalPages, totalItems, startIndex + 1, endIndex);
    }

    // ページネーションのページ番号リストを算出
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

    // ページネーション描画
    function renderPagination(totalPages, totalItems, startNum, endNum) {
      let container = document.getElementById('pagination');
      container.innerHTML = '';

      if (totalItems === 0) {
        return;
      }

      let nav = document.createElement('nav');
      nav.className = 'imds-pagination';

      // ページ送りボタン群
      let controls = document.createElement('div');
      controls.className = 'imds-pagination-controls';

      // 前へボタン
      let prevButton = document.createElement('button');
      prevButton.type = 'button';
      prevButton.className = 'imds-button is-ghost';
      prevButton.title = '前へ';
      prevButton.disabled = (currentPage <= 1);
      prevButton.innerHTML = '<span class="imds-icon"><i class="fa-solid fa-angle-left"></i></span>';
      prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderTable();
        }
      });
      controls.appendChild(prevButton);

      // ページ番号
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

      // 次へボタン
      let nextButton = document.createElement('button');
      nextButton.type = 'button';
      nextButton.className = 'imds-button is-ghost';
      nextButton.title = '次へ';
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

      // 件数情報
      let options = document.createElement('div');
      options.className = 'imds-pagination-options';
      let info = document.createElement('span');
      info.textContent = startNum + ' - ' + endNum + ' / ' + totalItems;
      options.appendChild(info);
      nav.appendChild(options);

      container.appendChild(nav);
    }

    // 新規作成ボタン クリック時イベント
    document.getElementById('create-button').addEventListener('click', () => {
      location.href = 'sample/simple_list/edit';
    });

    // エントリーポイント
    if ($data.error.code) {
      imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
    } else {
      initializeData();
      renderTable();
    }
  });
  </script>
</imart>

<!-- ページ全体のコンテナ -->
<div id="container">
  <div class="imds-container">
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
    <main>
      <div class="imds-py-3">
        <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4">
          <div class="button-area imds-mb-3">
            <div class="imds-input-group">
              <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="検索キーワード">
              <button type="button" title="検索" class="imds-button">
                <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
              </button>
            </div>
            <button type="button" id="create-button" class="imds-button is-primary">新規作成</button>
          </div>
          <div class="imds-table" id="stock-table">
            <div class="imds-table-inner">
              <table>
                <thead>
                  <tr>
                    <th class="col-edit has-content-only"><span>編集</span></th>
                    <th><span>商品コード</span></th>
                    <th><span>商品名</span></th>
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
          <div class="imds-py-3" id="pagination"></div>
        </section>
      </div>
    </main>
  </div>
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

  <!-- 認可設定のデフォルト値 -->
  <authz-default mapper="welcome-all" />

  <!-- 一覧画面 -->
  <file-mapping path="/sample/simple_list" page="sample/simple_list/view/index">
  </file-mapping>

</routing-jssp-config>
```

---

## 使用可能なテンプレート

- **シンプル一覧**: [assets/simple-list.md](assets/simple-list.md)
  - intra-mart Design System（imds）のテーマを適用した画面
  - テーブル一覧表示とページネーション
  - 検索キーワード入力と新規作成ボタン
  - 各行に編集リンクを配置

### 生成時の指示例

ユーザが「一覧画面を作成して」と依頼した場合、この assets のコードを参考にして適切にカスタマイズして生成する。
