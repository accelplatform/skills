# ワークフロー 承認画面テンプレート（workflowOpenPage 方式 / 旧型）

## 概要

IM-Workflow の承認（処理）画面プログラムのテンプレート。
申請画面で入力された部品コード・部品名・単価・合計金額・理由を読み取り専用で表示し、承認者が処理を行うサンプル画面である。
画面初期表示時は、ワークフローパラメータとユーザデータIDをもとに申請済みデータを取得して表示する。
処理ボタンにより `workflowOpenPage` 関数でワークフローエンジンに処理を委譲する。

> **モーダル方式（新型）との使い分け**: `imWorkflow.modal.showProcess()` を使う新型は `modal-approve-screen.md` を参照。新規開発では新型を推奨。本テンプレートは workflowOpenPage 方式（旧型）の承認（処理）画面が必要な場合に使用する。

## ファイル構成

```
src/main/jssp/src/{機能名}/workflow/
  ├── approve/
  │   ├── index.js              # ファンクションコンテナ
  │   └── index.html            # プレゼンテーションページ
  └── action/
      └── action_process.js     # アクション処理（別テンプレート）
```

**注意:** IM-Workflow の画面はコンテンツ定義で JSSP パスを直接指定するため、ルーティングテーブルは不要。

---

## ファンクションコンテナ（approve/index.js）

```javascript
/**
 * ワークフロー 承認画面
 *
 * @file index.js
 * @description 部品発注の承認画面を構成します。
 *              ワークフローパラメータを受け取り、申請済みデータを取得して表示します。
 */

// ========================================
// バインド変数（プレゼンテーションページ連携用）
// ========================================

// 画面タイトル
let $title = '部品発注承認';
let $subTitle = '部品管理ワークフロー';

// 画面データ
let $data = '{}';

// ワークフローパラメータ
let $imwSystemMatterId = '';
let $imwUserDataId = '';
let $imwApplyBaseDate = '';
let $imwFlowId = '';
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
  $imwUserDataId         = request['imwUserDataId']           || '';
  $imwApplyBaseDate      = request['imwApplyBaseDate']        || '';
  $imwFlowId             = request['imwFlowId']               || '';
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
    logger.error('承認画面表示中にエラーが発生しました。{}', e.message);
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
 * システム案件ID をキーに申請済みデータ（案件プロパティ）を取得します。
 *
 * @param {Object} request - リクエストパラメータ
 * @return {Object} 処理結果
 */
function processBusinessLogic(request) {
  let systemMatterId = request['imwSystemMatterId'] || '';

  if (!systemMatterId) {
    throw new Error('imwSystemMatterId が指定されていません。');
  }

  let result = {
    partCode: '',
    partName: '',
    unitPrice: '',
    quantity: '',
    totalAmount: '',
    reason: ''
  };

  // 処理画面には imwUserDataId が渡らない（imwSystemMatterId のみ）。
  // 未完了案件の案件プロパティはシステム案件ID をキーに ActvMatter で取得する。
  getMatterProperties(result, systemMatterId);

  return result;
}

/**
 * 案件プロパティから申請内容を取得して processResult に反映します。
 * システム案件ID をキーに未完了案件の案件プロパティを取得する。
 * （処理画面には imwUserDataId が渡らないため UserActvMatterPropertyValue(userDataId) は使えない。
 *   reference/imart-tag-workflow-open-page.md の「画面種別ごとの必須属性」表を参照）
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
// IM-共通マスタ ヘルパー
// ========================================
/**
 * ユーザ名を取得します。
 * locales の null チェック + ロケールフォールバック付き。
 *
 * @param {String} userCd - ユーザコード
 * @return {String} ユーザ名
 */
function getUserName(userCd) {
  let accountContext = Contexts.getAccountContext();
  let locale = accountContext.locale;
  let tenantLocale = new TenantInfoManager().getTenantInfo().data.locale;
  let manager = new IMMUserManager();
  let result = manager.getUser({ userCd: userCd }, new Date(), locale);

  if (!result.data || !result.data.locales) {
    return '';
  }
  let locales = result.data.locales;
  let localeInfo = locales[locale] || locales[tenantLocale] || locales[Object.keys(locales)[0]];
  return (localeInfo && localeInfo.userName) ? localeInfo.userName : '';
}

/**
 * 所属部署名を取得します。
 * locales の null チェック + ロケールフォールバック付き。
 *
 * @param {String} userCd - ユーザコード
 * @return {String} 部署名
 */
function getDepartmentName(userCd) {
  // ログインユーザ自身の場合、カレント組織を優先する
  let accountContext = Contexts.getAccountContext();
  if (userCd === accountContext.userCd) {
    let userContext = Contexts.getUserContext();
    if (userContext && userContext.currentDepartment) {
      return userContext.currentDepartment.departmentName || '';
    }
  }

  // カレント組織が取得できない場合、または他ユーザの場合は IM共通マスタ API で取得
  let locale = accountContext.locale;
  let manager = new IMMCompanyManager();
  let condition = new AppCmnSearchCondition();
  // 戻り値は DepartmentListNodeInfo[]（displayName を直接持つフラット構造）
  let result = manager.listDepartmentWithUser({ userCd: userCd }, condition, false, new Date(), locale);

  if (!result.data || result.data.length === 0) {
    return '';
  }
  return result.data[0].displayName || '';
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

## プレゼンテーションページ（approve/index.html）

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

      // 「処理」ボタン クリック時イベント
      // 承認/差戻し/否認/保留/保留解除の選択は workflowOpenPage('4') 呼び出し後に
      // IM-Workflow エンジンの標準ダイアログで行われる
      document.getElementById('process-button').addEventListener('click', () => {
        workflowOpenPage('4');
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
    imwUserDataId=$imwUserDataId
    imwNodeId=$imwNodeId
    imwApplyBaseDate=$imwApplyBaseDate
    imwFlowId=$imwFlowId
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
          <button type="button" id="imw-back-button" class="imds-button is-ghost is-large">
            <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left"></i></span>
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
          <button type="button" id="process-button" class="imds-button is-primary" style="min-width: 8em;">処理</button>
        </div>
      </main>
    </div>
  </div>
</imart>

<!-- ワークフローページ遷移用フォーム -->
<imart type="tag" tagname="form" name="imwBackForm" id="imwBackForm" method="POST" action=$imwNextPagePath escapeXml="true" escapeJs="false" >
  <imart type="hidden" imwCallOriginalParams=$imwCallOriginalParams escapeXml="true" escapeJs="false" />
</imart>
```

---

## 画面レイヤで実装できない業務制約

`workflowOpenPage('4')` で開く IM-Workflow 標準処理ダイアログは、ユーザが「承認 / 差戻し / 否認」のどれを選ぶか・コメントを入力するかをダイアログ内で完結させる仕様のため、**画面側の JavaScript からは「選ばれたアクションに応じてコメント必須化を切り替える」といった制御ができない**。

このため、以下のような業務制約は **画面側では実装できない**:

- 「否認時は理由コメントを必須にする（承認時は任意）」
- 「コメント文字数の上限を 300 文字に制限する」
- 「特定のアクション選択時に追加項目を必須化する」

これらが要件に含まれる場合は、**画面側で無理に解決しようとせず、アクション処理側（`{機能名}/workflow/action/`）で検証する**ことを検討する。
具体的な実装方式（戻り値で失敗を表現する／例外を投げる／検証専用の別画面でラップする等）は要件に応じて柔軟に判断すること（本スキルではあえて一意の解決策を規定しない）。

アクション処理の詳細は [`simple-action-process.md`](simple-action-process.md) を参照。

---

## 使用可能なテンプレート

- **承認画面**: [assets/simple-approve.md](assets/simple-approve.md)
  - IM-Workflow の承認画面（workflowOpenPage タグ使用）
  - 申請済みデータを読み取り専用で表示
  - 処理ボタン: `workflowOpenPage('4')`

### 生成時の指示例

ユーザが「ワークフローの承認画面を作成して」と依頼した場合、この assets のコードを参考にして適切にカスタマイズして生成する。

### 詳細画面（確認・処理詳細・参照詳細）を生成する場合

承認画面のテンプレートをベースに、以下の要素を**すべて除外**すること:
- ヘッダーの「戻る」ボタン（`imw-back-button`）
- 「戻る」ボタンの JS イベントリスナー
- 戻り用フォーム（`imw-back-form`）
- 処理ボタン（`workflowOpenPage('4')`）

詳細画面はワークフローエンジンの iframe 内で表示されるため、戻り先のページパスが存在せず空ページに遷移してしまう。
