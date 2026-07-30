# ワークフロー 処理画面テンプレート（処理モーダル方式）

## 概要

IM-Workflow の処理画面プログラムのテンプレート（処理モーダル方式）。
`imWorkflow.modal.showProcess()` API を使用して IM-Workflow の標準モーダル UI で承認・否認・差戻し等の処理を行う。

処理画面はコンテンツ定義（または URL 直接アクセス）経由で IM-Workflow の処理を行う画面。
IM-Workflow エンジンが渡す `imwSystemMatterId` および `imwNodeId` を使って処理モーダルを起動する。

## ファイル構成

```
src/main/jssp/src/{機能名}/workflow/
  └── approve/
      ├── index.js              # ファンクションコンテナ
      └── index.html            # プレゼンテーションページ

src/main/conf/routing-jssp-config/
  └── {機能名}.xml              # ルーティング設定（処理画面への URL マッピング）
```

**注意:** 処理モーダル方式の処理画面は URL から直接アクセスされる**スタンドアローン画面**であるため、`src/main/conf/routing-jssp-config/` へのルーティング XML 登録が必要。

---

## ルーティング設定（routing-jssp-config/{機能名}.xml）

既存の `{機能名}.xml` に追加する場合は `<file-mapping>` 要素のみ追記する。

```xml
<!-- TODO: path と page を機能名に合わせて変更すること -->
<file-mapping path="/{機能名}/workflow/approve" page="{機能名}/workflow/approve/index">
  <authz uri="service://{機能名}/workflow/approve" action="execute" />
</file-mapping>
```

---

## ファンクションコンテナ（approve/index.js）

```javascript
/**
 * ワークフロー 処理画面（処理モーダル方式）
 *
 * @file index.js
 * @description {機能名}の処理画面（承認/否認/差戻し）を構成します。
 *              処理モーダル（imWorkflow.modal.showProcess）を使用して処理します。
 *              IM-Workflow パラメータ: imwSystemMatterId（システム案件ID）, imwNodeId（ノードID）
 */

// ========================================
// バインド変数（プレゼンテーションページ連携用）
// ========================================
let $title = '{画面タイトル}（処理）';       // TODO: 画面タイトルを設定
let $subTitle = '{サブタイトル}';            // TODO: サブタイトルを設定
let $data = '{}';

// ========================================
// エントリーポイント
// ========================================
/**
 * 画面表示のエントリーポイントです。
 *
 * @param {Object} request - リクエストオブジェクト
 */
function init(request) {
  let response = main(request);
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
    logger.error('処理画面表示中にエラーが発生しました。{}', e.message);
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
  let result = {
    imwParameter: {
      systemMatterId: request['imwSystemMatterId'] || '',
      nodeId:         request['imwNodeId']         || ''
    },
    formParameter: {
      // TODO: 申請内容フィールドをここで定義する
    }
  };

  if (!result.imwParameter.systemMatterId || !result.imwParameter.nodeId) {
    throw new Error('imwSystemMatterId または imwNodeId が指定されていません。');
  }

  // 処理画面（未完了案件）には imwUserDataId が渡らないため、システム案件IDをキーに取得する
  getMatterProperties(result.formParameter, result.imwParameter.systemMatterId);

  return result;
}

// ========================================
// 案件プロパティ取得
// ========================================
/**
 * 案件プロパティから申請内容を取得して processResult に反映します。
 * 処理画面は未完了案件が対象で userDataId が渡らないため、システム案件IDをキーに ActvMatter で取得します。
 * （userDataId をキーにする UserActvMatterPropertyValue は使わない）
 *
 * @param {Object} processResult - 反映先オブジェクト（formParameter）
 * @param {String} systemMatterId - システム案件ID
 */
function getMatterProperties(processResult, systemMatterId) {
  let actvMatter = new ActvMatter(systemMatterId);
  let result = actvMatter.getMatterPropertyList();
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

## プレゼンテーションページ（approve/index.html）

```html
<!-- ヘッダ -->
<imart type="head">
  <!-- タイトル -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></title>
  <!-- セキュアトークン（処理モーダル方式では http-equiv 形式を使用すること） -->
  <meta http-equiv="X-Intramart-Secure-Token" content="<imart type="imSecureToken" mode="value" />"/>
  <!-- 処理モーダル API（defer 必須） -->
  <script src="im_workflow/js/api_base.js" defer></script>
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

      // 画面の初期表示（申請内容を読み取り専用で表示）
      function initializeView(result) {
        // TODO: 申請内容フィールドを表示する
        // 例: document.getElementById(':field1:').textContent = result.field1;
      }

      // 戻るボタン クリック時イベント
      document.getElementById('back-button').addEventListener('click', () => {
        imWorkflow.transition.returnTo();
      });

      // 処理ボタン クリック時イベント（async 必須）
      document.getElementById('process-button').addEventListener('click', async () => {

        // TODO: 必要に応じて userParameter を設定する（アクション処理に渡すデータ）
        const userParameter = {
          // TODO: フィールドに合わせて変更
          // field1: document.getElementById(':field1:').textContent,
        };

        // 処理モーダルを開く
        const result = await imWorkflow.modal.showProcess({
          processParameter: {
            systemMatterId: $data.result.imwParameter.systemMatterId,
            nodeId:         $data.result.imwParameter.nodeId
            // processType: [],           // TODO: 使用する処理種別を配列で指定（未指定時は全種別が選択可能）
            // processComment: '',        // TODO: 処理コメントの初期値を設定する場合は指定
          },
          optionalParameter: {
            userParameter: userParameter
          },
          rebootModal: false
        });

        // 処理完了後の処理
        if (result && result.isProcessDone) {
          imuiShowSuccessMessage('処理が完了しました。');
          imWorkflow.transition.afterProcess();
        }
      });

      // エントリーポイント
      if ($data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      } else {
        initializeView($data.result.formParameter);
      }
    });
    })(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
  </script>
</imart>

<!-- ページ全体のコンテナ -->
<div id="container">
  <div class="imds-container">
    <header class="imds-header">
      <div class="imds-header-back-button">
        <button type="button" id="back-button" class="imds-button is-ghost is-large" aria-label="戻る">
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
        <!-- TODO: 申請内容を読み取り専用で表示するセクションをここに実装する -->
        <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
          <h2 class="imds-heading is-bordered is-size-2 is-cyan">{セクションタイトル}</h2>
          <div class="imds-field-container has-accent-color">
            <!-- 読み取り専用フィールド例（申請者が入力した値を表示） -->
            <div class="imds-field-group is-horizontal imds-w-15">
              <div class="imds-field-group-label">
                <span>{フィールドラベル}</span>
              </div>
              <div class="imds-field-group-control">
                <div class="imds-field">
                  <div class="imds-field-control">
                    <!-- 読み取り専用のため span で表示（id は initializeView から参照） -->
                    <span id=":field1:" class="imds-text"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <!-- 処理ボタン（承認/否認/差戻し等はモーダル内で選択） -->
      <div class="button-spacing imds-py-2 imds-px-8 imds-border-t-1">
        <button type="button" id="process-button" class="imds-button is-primary" style="min-width: 8em;">処理</button>
      </div>
    </main>
  </div>
</div>
```

---

## 生成時の注意事項

- **`imwSystemMatterId` と `imwNodeId` は IM-Workflow エンジンが渡すパラメータであること**
  - コンテンツ定義の `scriptPath` 経由でこの処理画面を開く際、IM-Workflow エンジンが自動的に渡す
  - `processBusinessLogic()` 内で必須バリデーションを行い、未指定の場合はエラーページへ遷移すること
- **`imwParameter` と `formParameter` を分離すること**
  - `imwParameter`: IM-Workflow エンジンへ渡すパラメータ（`systemMatterId`, `nodeId`）
  - `formParameter`: 処理画面に表示する申請内容（案件プロパティから取得した読み取り専用データ）
  - 分離することで `processParameter` に誤って業務フィールドが混入することを防ぐ
- **`showProcess()` 完了後は `isProcessDone` が true のときのみ `imWorkflow.transition.afterProcess()` を呼び出すこと**
  - 処理が完了した場合のみ遷移する（完了メッセージも表示する）
  - キャンセル時（`isProcessDone` が false）は画面に留まり、処理者が再度モーダルを開けるようにする
- **`processType` パラメータの指定**
  - 未指定（空配列または省略）の場合、モーダル内でユーザが選択できる処理種別が自動決定される
  - 特定の処理種別のみ許可したい場合は `processType` 配列を指定する
- **ヘッダに「戻る」ボタンを配置すること**
  - `imds-header-back-button` div + `back-button` id のボタンを `imds-header-icon` の前に配置する
  - クリック時は `imWorkflow.transition.returnTo()` を呼び出す（呼び出し元の申請一覧・案件一覧等に戻る API）
- **申請内容は読み取り専用で表示すること**
  - 処理画面では申請者が入力した内容を確認するだけで編集は不要
  - 処理画面は未完了案件が対象で `imwUserDataId` が渡らないため、案件プロパティの取得には **`ActvMatter(systemMatterId).getMatterPropertyList()`（引数なし）** を使用すること。`userDataId` をキーにする `UserActvMatterPropertyValue` は使わない（申請画面の一時保存再編集とは取得元が異なる）
  - 案件プロパティ値 API は `reference/api-user-actv-matter-property-value.md` を参照（`ActvMatter` の説明も同ファイル冒頭に記載）
- **セキュアトークンと `api_base.js` は申請画面と同様**
  - `<meta http-equiv="X-Intramart-Secure-Token">` 形式を使用すること
  - `defer` 属性必須
