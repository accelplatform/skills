# ワークフロー 確認画面テンプレート（workflowOpenPage 方式 / 旧型）

## 概要

IM-Workflow の確認（pageType=5）画面プログラムのテンプレート。
申請画面で入力された部品コード・部品名・単価・合計金額・理由を読み取り専用で表示し、確認者が確認操作を行うサンプル画面である。

`simple-approve-screen.md`（承認画面）と同じ `workflowOpenPage` 方式で、処理ボタンの呼び出しを `workflowOpenPage('5')`（確認）に置き換えた構成である。
確認/差戻し等の選択・コメント入力は `workflowOpenPage('5')` 呼び出し後に IM-Workflow エンジンの標準ダイアログ内で完結する。

> **モーダル方式（新型）との使い分け**: `imWorkflow.modal.showConfirm()` を使う新型は `modal-confirm-screen.md` を参照。新規開発では新型を推奨。本テンプレートは workflowOpenPage 方式（旧型）の確認画面が必要な場合に使用する。

## 申請内容の復元（重要）

確認画面・処理画面には、IM-Workflow エンジンから **`imwSystemMatterId`（システム案件ID）のみ**が渡される。
**`imwUserDataId` は渡らない**（`reference/imart-tag-workflow-open-page.md` の「画面種別ごとの必須属性」表で、`imwUserDataId` は一時保存(1)のみ ○、処理(4)・確認(5)は対象外）。

そのため申請内容の復元には、ユーザデータIDをキーにする `UserActvMatterPropertyValue.getMatterPropertyList(userDataId)` は使用できない。
**システム案件IDをキーに未完了案件の案件プロパティを取得する `ActvMatter` を使用すること**（`reference/api-user-actv-matter-property-value.md`：「システム案件IDをキーに未完了案件からユーザデータ案件プロパティ情報を取得する場合は `ActvMatter` を使用する」）。

```javascript
// OK: 確認画面は systemMatterId をキーに ActvMatter で取得（getMatterPropertyList は引数なし）
let manager = new ActvMatter(systemMatterId);
let result = manager.getMatterPropertyList();

// NG: 確認画面には imwUserDataId が渡らないため復元されない
let manager = new UserActvMatterPropertyValue();
let result = manager.getMatterPropertyList(userDataId);  // userDataId は空
```

---

## ファンクションコンテナ（confirm/index.js）

```javascript
/**
 * ワークフロー 確認画面（workflowOpenPage 方式）
 *
 * @file index.js
 * @description 部品発注の確認画面を構成します。
 *              ワークフローパラメータを受け取り、申請済みデータを取得して表示します。
 *              処理ボタンにより workflowOpenPage('5')（確認）でエンジンに処理を委譲します。
 *              IM-Workflow パラメータ: imwSystemMatterId（システム案件ID）, imwNodeId（ノードID）
 */

// ========================================
// バインド変数（プレゼンテーションページ連携用）
// ========================================

// 画面タイトル
let $title = '部品発注確認';
let $subTitle = '部品管理ワークフロー';

// 画面データ
let $data = '{}';

// ワークフローパラメータ
let $imwSystemMatterId = '';
let $imwAuthUserCode = '';
let $imwNodeId = '';
let $imwCallOriginalParams = '';
let $imwNextPagePath = '';
let $imwNextScriptPath = '';
let $imwNextApplicationId = '';
let $imwNextServiceId = '';

// ========================================
// エントリーポイント
// ========================================
/**
 * 画面表示のエントリーポイントです。
 * ワークフローエンジンから画面が呼び出されたとき、最初に実行されます。
 *
 * @param {Object} request - リクエストオブジェクト
 */
function init(request) {
  // ワークフローパラメータの取得
  $imwSystemMatterId     = request['imwSystemMatterId']       || '';
  $imwAuthUserCode       = request['imwAuthUserCode']         || '';
  $imwNodeId             = request['imwNodeId']               || '';
  $imwCallOriginalParams = request['imwCallOriginalParams']   || '';
  $imwNextPagePath       = request['imwCallOriginalPagePath'] || '';
  $imwNextScriptPath     = request['imwNextScriptPath']       || '';
  $imwNextApplicationId  = request['imwNextApplicationId']    || '';
  $imwNextServiceId      = request['imwNextServiceId']        || '';

  // メイン処理を実行
  let response = main(request);

  // JSON 形式で $data に格納
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
      code: '',
      message: ''
    }
  };

  try {
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('確認画面表示中にエラーが発生しました。{}', e.message);
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
 * システム案件IDをキーに申請済みデータ（案件プロパティ）を取得します。
 *
 * @param {Object} request - リクエストパラメータ
 * @return {Object} 処理結果
 */
function processBusinessLogic(request) {
  let systemMatterId = request['imwSystemMatterId'] || '';
  let nodeId         = request['imwNodeId']         || '';

  if (!systemMatterId || !nodeId) {
    throw new Error('imwSystemMatterId または imwNodeId が指定されていません。');
  }

  let result = {
    partCode: '',
    partName: '',
    unitPrice: '',
    quantity: '',
    totalAmount: '',
    reason: ''
  };

  // 確認画面には imwUserDataId が渡らない（imwSystemMatterId のみ）。
  // 未完了案件の案件プロパティはシステム案件ID をキーに ActvMatter で取得する。
  getMatterProperties(result, systemMatterId);

  return result;
}

/**
 * 案件プロパティから申請内容を取得して processResult に反映します。
 * システム案件ID をキーに未完了案件の案件プロパティを取得する。
 *
 * @param {Object} processResult - 処理結果
 * @param {String} systemMatterId - システム案件ID
 */
function getMatterProperties(processResult, systemMatterId) {
  let manager = new ActvMatter(systemMatterId);
  let result = manager.getMatterPropertyList();
  if (!result.resultFlag) {
    throw new Error('案件プロパティの取得に失敗しました。');
  }

  for (let i = 0; i < result.data.length; i++) {
    let matterProperty = result.data[i];
    if (matterProperty.matterPropertyKey in processResult) {
      processResult[matterProperty.matterPropertyKey] = matterProperty.matterPropertyValue || '';
    }
  }
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
  let param = {
    title: 'システムエラーが発生しました',
    message: [code, message].join('\n')
  };
  Transfer.toErrorPage(param);
}
```

---

## プレゼンテーションページ（confirm/index.html）

```html
<!-- ヘッダ -->
<imart type="head">
  <!-- タイトル -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></title>
  <!-- ワークフロー画面遷移用 CSJS -->
  <imart type="workflowOpenPageCsjs" />
  <!-- プレゼンテーションページの独自スタイル -->
  <style>
    .button-spacing {
      display: flex;
      gap: 3em;
    }
  </style>
  <!-- プレゼンテーションページのスクリプト -->
  <script>
    (function($data) {

    document.addEventListener('DOMContentLoaded', () => {
      // 画面の初期表示
      function initializeView(result) {
        document.getElementById(':partCode:').textContent = result.partCode;
        document.getElementById(':partName:').textContent = result.partName;
        document.getElementById(':unitPrice:').textContent = result.unitPrice;
        document.getElementById(':quantity:').textContent = result.quantity;
        document.getElementById(':totalAmount:').textContent = result.totalAmount;
        document.getElementById(':reason:').textContent = result.reason;
      }

      // 「戻る」ボタン クリック時イベント
      document.getElementById('imw-back-button').addEventListener('click', () => {
        // 前画面に戻る
        document.getElementById('imw-back-form').submit();
      });

      // 「確認」ボタン クリック時イベント
      // 確認/差戻し等の選択・コメント入力は workflowOpenPage('5') 呼び出し後に
      // IM-Workflow エンジンの標準ダイアログで行われる
      document.getElementById('confirm-button').addEventListener('click', () => {
        workflowOpenPage('5');
      });

      // エントリーポイント
      if ($data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      } else {
        initializeView($data.result);
      }
    });
    })(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
  </script>
</imart>

<!-- ワークフロー画面呼び出し用フォーム -->
<imart type="workflowOpenPage"
    name="workflowOpenPageForm"
    method="POST"
    target="_top"
    imwAuthUserCode=$imwAuthUserCode
    imwSystemMatterId=$imwSystemMatterId
    imwNodeId=$imwNodeId
    imwCallOriginalParams=$imwCallOriginalParams
    imwNextPagePath=$imwNextPagePath
    imwNextScriptPath=$imwNextScriptPath
    imwNextApplicationId=$imwNextApplicationId
    imwNextServiceId=$imwNextServiceId>

  <!-- ページ全体のコンテナ -->
  <div id="container">
    <div class="imds-container">
      <header class="imds-header">
        <div class="imds-header-back-button">
          <button type="button" id="imw-back-button" class="imds-button is-ghost is-large" aria-label="戻る">
            <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i></span>
          </button>
        </div>
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
      <main>
        <div class="imds-form has-background-color-gray sample-layout-content imds-scrollbar imds-py-4 imds-px-6">
          <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
            <h2 class="imds-heading is-bordered is-size-2 is-cyan">発注情報</h2>
            <div class="imds-field-container has-accent-color">
              <div class="imds-field-group is-horizontal imds-w-15">
                <div class="imds-field-group-label">
                  <span>部品コード</span>
                </div>
                <div class="imds-field-group-control">
                  <div class="imds-field">
                    <div class="imds-field-control">
                      <span id=":partCode:" class="imds-text"></span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="imds-field-group is-horizontal imds-w-15">
                <div class="imds-field-group-label">
                  <span>部品名</span>
                </div>
                <div class="imds-field-group-control">
                  <div class="imds-field">
                    <div class="imds-field-control">
                      <span id=":partName:" class="imds-text"></span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="imds-field-group is-horizontal imds-w-15">
                <div class="imds-field-group-label">
                  <span>単価</span>
                </div>
                <div class="imds-field-group-control">
                  <div class="imds-field">
                    <div class="imds-field-control">
                      <span id=":unitPrice:" class="imds-text"></span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="imds-field-group is-horizontal imds-w-15">
                <div class="imds-field-group-label">
                  <span>個数</span>
                </div>
                <div class="imds-field-group-control">
                  <div class="imds-field">
                    <div class="imds-field-control">
                      <span id=":quantity:" class="imds-text"></span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="imds-field-group is-horizontal imds-w-15">
                <div class="imds-field-group-label">
                  <span>合計金額</span>
                </div>
                <div class="imds-field-group-control">
                  <div class="imds-field">
                    <div class="imds-field-control">
                      <span id=":totalAmount:" class="imds-text"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
            <h2 class="imds-heading is-bordered is-size-2 is-cyan">申請理由</h2>
            <div class="imds-field-container has-accent-color">
              <div class="imds-field-group is-horizontal imds-w-15">
                <div class="imds-field-group-label">
                  <span>理由</span>
                </div>
                <div class="imds-field-group-control">
                  <div class="imds-field">
                    <div class="imds-field-control">
                      <span id=":reason:" class="imds-text"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="button-spacing imds-py-2 imds-px-8 imds-border-t-1">
          <button type="button" id="confirm-button" class="imds-button is-primary" style="min-width: 8em;">確認</button>
        </div>
      </main>
    </div>
  </div>
</imart>

<!-- ワークフローページ遷移用フォーム -->
<imart type="tag" tagname="form" id="imw-back-form" method="POST" action=$imwNextPagePath escapeXml="true" escapeJs="false" >
  <imart type="hidden" imwCallOriginalParams=$imwCallOriginalParams escapeXml="true" escapeJs="false" />
</imart>
```

---

## 承認画面（simple-approve-screen.md）との差分

旧型確認画面は承認画面テンプレートを写経元とし、以下のみを変更する。

| 項目 | 承認画面 | 確認画面 |
|------|---------|---------|
| 処理ボタンの呼び出し | `workflowOpenPage('4')` | `workflowOpenPage('5')` |
| ボタンラベル / id | `処理` / `process-button` | `確認` / `confirm-button` |
| タイトル | 部品発注承認 | 部品発注確認 |
| 申請内容の復元 | `ActvMatter(systemMatterId)` を使う | `ActvMatter(systemMatterId)` を使う |

> **補足**: 承認画面・確認画面はいずれも処理対象が未完了案件であり、`imwUserDataId` が渡らない（`imwSystemMatterId` のみ）。そのため申請内容の復元はシステム案件ID をキーにする `ActvMatter(systemMatterId).getMatterPropertyList()` を使う（`UserActvMatterPropertyValue.getMatterPropertyList(userDataId)` は申請済み未完了案件をユーザデータID で引く API のため、userDataId が渡らない処理・確認画面では使えない。`reference/imart-tag-workflow-open-page.md` の「画面種別ごとの必須属性」表を参照）。

## 画面が iframe 内で表示される運用の場合

確認画面がワークフローエンジンの iframe 内で表示される運用では、戻り先のページパスが存在せず空ページに遷移するため、`simple-approve-screen.md` の「詳細画面（確認・処理詳細・参照詳細）を生成する場合」の節に従い、以下を除外する。

- ヘッダーの「戻る」ボタン（`imw-back-button`）
- 「戻る」ボタンの JS イベントリスナー
- 戻り用フォーム（`imw-back-form`）

確認操作の送信ボタン（`confirm-button` / `workflowOpenPage('5')`）は残す。

## 生成後の必須検証

`SKILL.md` の「生成後の必須検証」に従い、`validate-workflow-code.js` → 手動チェック → `.github/skills/jssp-imds-theme/reference/` 照合を実施すること。
特に `<imart type="workflowOpenPage">` 配下の入力フィールドに `name` 属性を付けない（hidden フィールドのみ `name` を持つ）点を確認する。
