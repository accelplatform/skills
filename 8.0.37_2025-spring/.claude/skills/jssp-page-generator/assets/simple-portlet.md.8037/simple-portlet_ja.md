# シンプルポートレット画面テンプレート

## 概要

ポータル画面のポートレット（部品）として埋め込まれる小さな一覧画面のテンプレート。
通常の画面（1 画面単独で URL アクセスされる想定）と異なり、**同一ポータル画面に同じ画面が複数配置されうる**ため、以下の点で標準テンプレート（`assets/simple-list.md`）と異なる。

- **ヘッダ・フッタを含まない**: `imds-header`（アイコン・タイトルの大きい見出し部）やページネーション等の周辺 UI は付けず、コンテンツ本体（テーブル等）のみを配置する
- **ルーティング設定（`.xml`）・ルーティング認可を作成しない**: ポートレットはポータル機能（`b_m_portlet_info.path`）から直接呼び出され、`routing-jssp-config/` 配下のルーティングテーブルを経由しない。そのため `file-mapping` / `<authz uri="service://...">` によるルーティング認可は不要（アクセス制御はポートレット自体の認可 `im-portal-portlet` / `im-portal-portlet-editmode` で行う。詳細は `.claude/skills/jssp-tenant-setup-generator/reference/portlet-import.md` 参照）

なお、バインド変数 `$data` を IIFE でスコープ化する点はポートレット固有の差分ではなく、全画面共通の標準実装（`.claude/rules/jssp-presentation-page.md` の「バインド変数 `$data` のスコープ化（IIFE）」セクション参照）である。

## ファイル構成

```
src/main/jssp/src/{機能名}/view/
  └── index.js              # ファンクションコンテナ
  └── index.html            # プレゼンテーションページ
```

ルーティング設定（`src/main/conf/routing-jssp-config/`）は作成しない。

---

## ファンクションコンテナ（{機能名}/view/index.js）

```javascript
/**
 * {画面名}
 *
 * @file index.js
 * @description ポータル画面のポートレット部品として表示する一覧を構成します。
 */

// ========================================
// バインド変数（プレゼンテーションページ連携用）
// ========================================
let $title = '一覧';
let $subTitle = 'ポートレット';
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
  // JSON 内に </script> が含まれていると、スクリプトが終了して任意コードを差し込めるなどの脆弱性の原因となるため、
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
      message: ''                // エラーメッセージ
    }
  };

  try {
    // ビジネスロジックのメイン処理を実行
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('ポートレット表示中にエラーが発生しました。{}', e.message);
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
      { itemCode: 'ITM001', itemName: 'サンプル項目A', status: '対応中' },
      { itemCode: 'ITM002', itemName: 'サンプル項目B', status: '完了' },
      { itemCode: 'ITM003', itemName: 'サンプル項目C', status: '未着手' }
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

## プレゼンテーションページ（{機能名}/view/index.html）

```html
<!-- ヘッダ -->
<imart type="head">
  <!-- タイトル -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- セキュアトークン -->
  <meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">
  <!-- プレゼンテーションページのスクリプト（1画面に複数配置されるポートレットのため、$data をグローバル領域に置かず IIFE でスコープ化する） -->
  <script>
  (function($data) {
    document.addEventListener('DOMContentLoaded', () => {
      // HTML エスケープ
      function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value;
        return div.innerHTML;
      }

      // 一覧テーブル描画
      function renderTable(list) {
        const tbody = document.getElementById('portlet-sample-table-body');
        tbody.innerHTML = '';

        if (list.length === 0) {
          const tr = document.createElement('tr');
          const td = document.createElement('td');
          td.setAttribute('colspan', '3');
          td.style.textAlign = 'center';
          td.textContent = 'データがありません。';
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

      // エントリーポイント
      if ($data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      } else {
        renderTable($data.result.list);
      }
    });
  })(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
  </script>
</imart>

<!-- ページ全体のコンテナ（ポートレット部品のため、ヘッダ・フッタは含めない。同一ポータル画面に異なるポートレットが複数配置された場合に DOM 操作のスコープを画面ごとに区別するため、id="app-portlet-{機能名}-container" を付与する） -->
<div id="app-portlet-{機能名}-container" class="imds-container">
  <main>
    <div class="imds-table is-narrow" id="portlet-sample-table">
      <div class="imds-table-inner">
        <table>
          <thead>
            <tr>
              <th><span>項目コード</span></th>
              <th><span>項目名</span></th>
              <th><span>ステータス</span></th>
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

## 使用可能なテンプレート

- **シンプルポートレット**: [assets/simple-portlet.md](assets/simple-portlet.md)
  - ポータル画面のポートレット部品として埋め込む小さな一覧
  - ヘッダ・フッタなし、`$data` は IIFE でスコープ化
  - 検索・ページネーション・編集リンクなどの周辺 UI は持たない最小構成

### 生成時の指示例

ユーザが「ポートレット画面を作成して」「ポータルの部品として一覧を作って」等と依頼した場合、この assets のコードを参考にして、複数配置を前提とした構造・スコープ化を維持したままカスタマイズして生成する。
テーブルの列や表示件数など、内容面はユーザの要件に応じて変更してよいが、以下は変更しないこと。

- `imds-header` 等の視覚的ヘッダ・フッタを追加しないこと
- `$data` を IIFE の外（グローバルスコープ）に定義しないこと
- ルーティング設定（`.xml`）・ルーティング認可（`service://...`）を作成しないこと
