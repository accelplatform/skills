# ワークフロー 申請画面テンプレート

## 概要

IM-Workflow の申請画面プログラムのテンプレート。
部品コード・部品名・単価・合計金額・理由を入力して申請するサンプル画面である。
画面初期表示時は、ワークフローパラメータをファンクションコンテナで受け取り、プレゼンテーションページに引き渡す。
申請・一時保存ボタンにより `workflowOpenPage` 関数でワークフローエンジンに処理を委譲する。

フォーム内の入力項目は、アクション処理の `userParameter` として渡される。

## ファイル構成

```
src/main/jssp/src/{機能名}/workflow/
  ├── apply/
  │   ├── index.js              # ファンクションコンテナ
  │   └── index.html            # プレゼンテーションページ
  └── action/
      └── action_process.js     # アクション処理（別テンプレート）
```

**注意:** IM-Workflow の画面はコンテンツ定義で JSSP パスを直接指定するため、ルーティングテーブルは不要。

---

## ファンクションコンテナ（apply/index.js）

```javascript
/**
 * ワークフロー 申請画面
 *
 * @file index.js
 * @description 部品発注の申請画面を構成します。
 *              ワークフローパラメータを受け取り、プレゼンテーションページに引き渡します。
 */

// ========================================
// バインド変数（プレゼンテーションページ連携用）
// ========================================

// 画面タイトル
let $title = '部品発注申請';
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
    logger.error('申請画面表示中にエラーが発生しました。{}', e.message);
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
 * 一時保存からの復帰時は保存済みデータを取得します。
 *
 * @param {Object} request - リクエストパラメータ
 * @return {Object} 処理結果
 */
function processBusinessLogic(request) {
  let result = {
    partCode: '',
    partName: '',
    unitPrice: '',
    quantity: '',
    totalAmount: '',
    reason: ''
  };

  // 一時保存からの復帰時は、userDataId をキーに保存済みデータを取得
  let userDataId = request['imwUserDataId'];
  if (userDataId) {
    getMatterProperties(result, userDataId);
  }

  return result;
}

/**
 * 案件プロパティからデータを取得します。
 *
 * @param {Object} processResult - 処理結果
 * @param {String} userDataId - ユーザデータID
 */
function getMatterProperties(processResult, userDataId) {
  let manager = new UserActvMatterPropertyValue();
  let result = manager.getMatterPropertyList(userDataId);
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

## プレゼンテーションページ（apply/index.html）

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
    // プレゼンテーションページ連携用のバインド変数
    const $data = <imart type="string" value=$data escapeXml="false" escapeJs="false" />;

    document.addEventListener('DOMContentLoaded', () => {
      // バリデーションチェック常時実行フラグ
      let activeValidation = false;

      // 画面の初期表示
      function initializeView(result) {
        document.getElementById(':partCode:').value = result.partCode;
        document.getElementById(':partName:').value = result.partName;
        document.getElementById(':unitPrice:').value = result.unitPrice;
        document.getElementById(':quantity:').value = result.quantity;
        document.getElementById(':totalAmount:').value = result.totalAmount;
        document.getElementById(':reason:').value = result.reason;
      }

      // バリデーションエラー表示初期化
      function clearValidationError() {
        document.querySelectorAll('.imds-validation-error').forEach((element) => {
          element.classList.remove('imds-validation-error');
        });
        document.querySelectorAll('.imds-error-text').forEach((element) => {
          element.style.display = 'none';
        });
      }

      // バリデーションエラー表示
      function showValidationError(errors) {
        errors.forEach((error) => {
          const errorElement = document.querySelector(`.imds-error-text[for=":${error.name}:"]`);
          if (errorElement) {
            errorElement.textContent = error.message;
            errorElement.style.display = '';
            const fieldElement = errorElement.closest('.imds-field');
            if (fieldElement) {
              fieldElement.classList.add('imds-validation-error');
            }
          }
        });
        activeValidation = true;
      }

      // リクエストパラメータを作成
      function createRequest() {
        return {
          partCode:    document.getElementById(':partCode:').value,
          partName:    document.getElementById(':partName:').value,
          unitPrice:   document.getElementById(':unitPrice:').value,
          quantity:     document.getElementById(':quantity:').value,
          totalAmount: document.getElementById(':totalAmount:').value,
          reason:      document.getElementById(':reason:').value
        };
      }

      // バリデーションエラー取得
      // TODO: フィールド仕様に応じてバリデーションルールをカスタマイズすること
      function getValidationErrors() {
        const request = createRequest();
        const errors = [];

        // 部品コード: 必須
        const partCode = request['partCode'];
        if (!partCode || partCode.length === 0) {
          errors.push({ name: 'partCode', message: '部品コードは必須です。' });
        }

        // TODO: 他のフィールドのバリデーションルールを追加

        return errors;
      }

      // リアルタイム再バリデーション
      function resetValidationError() {
        clearValidationError();
        const errors = getValidationErrors();
        if (errors.length > 0) {
          showValidationError(errors);
        }
      }

      // バリデーション実行
      function validateCurrentStep() {
        clearValidationError();
        const errors = getValidationErrors();
        if (errors.length > 0) {
          showValidationError(errors);
          return false;
        }
        return true;
      }

      // リアルタイム再バリデーション用イベントリスナー
      // TODO: バリデーション対象の全フィールドにリスナーを登録すること
      // テキスト入力フィールド（input, textarea）には "input" イベントを使用
      [':partCode:', ':partName:', ':reason:'].forEach((id) => {
        document.getElementById(id).addEventListener('input', () => {
          if (activeValidation) {
            resetValidationError();
          }
        });
      });
      // セレクトボックス、日付入力、数値入力等には "change" イベントを使用
      [':unitPrice:', ':quantity:', ':totalAmount:'].forEach((id) => {
        document.getElementById(id).addEventListener('change', () => {
          if (activeValidation) {
            resetValidationError();
          }
        });
      });

      // 「戻る」ボタン クリック時イベント
      document.getElementById('imw-back-button').addEventListener('click', () => {
        document.getElementById('imw-back-form').submit();
      });

      // 案件名を組み立てる
      // TODO: フロー定義の案件名ルールに合わせてカスタマイズすること
      function buildMatterName() {
        return '部品発注申請_' + $data.result.partCode;
      }

      // 申請ボタン クリック時イベント
      document.getElementById('apply-button').addEventListener('click', () => {
        if (!validateCurrentStep()) {
          return;
        }
        // 案件名を設定
        document.getElementById('imwMatterName').value = buildMatterName();

        // imwSystemMatterId が存在する場合は再申請（引き戻し後）
        // 存在しない場合は新規申請
        let systemMatterId = '<imart type="string" value=$imwSystemMatterId escapeXml="false" escapeJs="true"></imart>';
        if (systemMatterId) {
          workflowOpenPage('3');  // 再申請
        } else {
          workflowOpenPage('0');  // 新規申請
        }
      });

      // 一時保存ボタン クリック時イベント
      document.getElementById('temp-save-button').addEventListener('click', () => {
        workflowOpenPage('1');
      });

      // エントリーポイント
      clearValidationError();
      if ($data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      } else {
        initializeView($data.result);
        // 再申請モードの場合、ボタンラベルを変更
        let systemMatterId = '<imart type="string" value=$imwSystemMatterId escapeXml="false" escapeJs="true"></imart>';
        if (systemMatterId) {
          document.getElementById('apply-button').textContent = '再申請';
        }
      }
    });
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

  <!-- 案件名（申請ボタン押下時に JavaScript で設定） -->
  <input type="hidden" id="imwMatterName" name="imwMatterName" value="" />

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
                  <span class="imds-required-label-required" data-required-label="必須">部品コード</span>
                </div>
                <div class="imds-field-group-control">
                  <div class="imds-field" for=":partCode:">
                    <div class="imds-field-control">
                      <input type="text" id=":partCode:" class="imds-textbox" name="partCode" value="" />
                    </div>
                    <span class="imds-error-text" for=":partCode:" style="display:none;"></span>
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
                      <input type="text" id=":partName:" class="imds-textbox" name="partName" value="" />
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
                      <input type="number" id=":unitPrice:" class="imds-textbox" name="unitPrice" value="" />
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
                      <input type="number" id=":quantity:" class="imds-textbox" name="quantity" value="" />
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
                      <input type="number" id=":totalAmount:" class="imds-textbox" name="totalAmount" value="" />
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
                      <textarea id=":reason:" class="imds-textarea" name="reason" rows="4"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="button-spacing imds-py-2 imds-px-8 imds-border-t-1">
          <button type="button" id="apply-button" class="imds-button is-primary" style="min-width: 8em;">申請</button>
          <button type="button" id="temp-save-button" class="imds-button is-outlined is-primary" style="min-width: 8em;">一時保存</button>
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

## 使用可能なテンプレート

- **申請画面**: [assets/simple-apply.md](assets/simple-apply.md)
  - IM-Workflow の申請画面（workflowOpenPage タグ使用）
  - ワークフローパラメータの受け渡しパターン
  - フォーム内の入力項目はアクション処理の `userParameter` に渡される
  - 申請ボタン: `workflowOpenPage('0')`、一時保存ボタン: `workflowOpenPage('1')`

### 生成時の指示例

ユーザが「ワークフローの申請画面を作成して」と依頼した場合、この assets のコードを参考にして適切にカスタマイズして生成する。

### 生成時の注意事項

- **`<imart type="workflowOpenPage">` タグに `id` 属性を付けてはならない**。
  - `workflowOpenPage` タグは `id` 属性をサポートしておらず、生成される `<form>` 要素に `id` が付与されない。`document.getElementById('workflowOpenPageForm')` は `null` を返す
  - フォーム要素を JS から参照する場合は `name` 属性を使い、`document.forms['workflowOpenPageForm']` でアクセスすること
- **`workflowOpenPage` フォーム内の入力フィールドに `name` 属性を付けてはならない**。
  - フォーム内に `<input type="hidden" name="vendorId">` と `<select name="vendorId">` のように同じ `name` が存在すると、フォーム送信時に `userParam.vendorId` が配列（NativeArray）になり、アクション処理で `Cannot convert NativeArray` エラーが発生する。
  - 入力フィールド（`select`, `input[type=text]`, `input[type=number]`, `textarea`）からは `name` を除去し、申請ボタン押下時に JS で hidden フィールドに値をコピーすること。
  - **ラジオボタン**はグループ化のために `name` が必要だが、hidden フィールドとは異なる名前にすること（例: 入力用 `name="urgencyTypeInput"` / hidden `name="urgencyType"`）
- **`<imart>` タグに `filter` 属性は存在しない**。
  - JSON 内の個別の値（ユーザ名・部署名等）を HTML に表示するには、`<span id="..."></span>` を配置し、JavaScript の `initializeView` 内で `element.textContent = result.xxx` でセットすること。
  - `<imart type="string" value=$data filter="json:result.xxx" />` のような記法は動作しない
- **アイコンとテキストを併用するボタン**では、テキストを必ず `<span class="imds-button-text">` で囲むこと。直接テキストノードを配置するとレイアウトが崩れる（imds-html-icon-button.md 参照）
- **アイコン単品のボタン**（テキストなし、例: 削除ゴミ箱アイコン）は通常サイズを使用すること。`is-small` / `is-x-small` にするとアイコンが小さすぎて操作しにくい
- 必須入力項目のラベルには必ず必須マークを付与すること（`imds-required-label-required` クラス + `data-required-label="必須"`）
- 日付入力には `<input type="date">` ではなく `imuiCalendar`（`floatable="true"` を必ず指定）を使用すること。インライン表示（`floatable` 未指定）は使用しない
- **バリデーションの実装は `rules/jssp-presentation-page.md` の規約に従うこと**（以下は主要ルール）:
  - `maxlength` 属性は使用しない。文字数制限はバリデーションエラーメッセージで通知する
  - バリデーション関連関数は `clearValidationError` → `showValidationError` → `createRequest` → `getValidationErrors` → `resetValidationError` → `validateCurrentStep` の順で定義する
  - `showValidationError` は `errorElement.closest('.imds-field')` で親を取得し、末尾で `activeValidation = true` を設定する
  - 初回バリデーションエラー後、入力値変更時にリアルタイム再バリデーションを行う（`activeValidation` フラグ + `input`/`change` イベントリスナー）
  - エントリーポイントで `clearValidationError()` を呼び出す
  - 必須フィールドの `imds-field` タグに `for=":fieldName:"` 属性を付与し、直下に `<span class="imds-error-text" for=":fieldName:" style="display:none;"></span>` を配置する
  - ボタンのイベントは `onclick` 属性ではなく `addEventListener` で登録する
- **imuiCalendar（altField）とリアルタイム再バリデーションの併用時の注意**: imuiCalendar の `altField` は jQuery の `.val()` で DOM プロパティを直接セットするため、ネイティブの `change` イベントが発火しない。`Object.defineProperty` で `value` プロパティのセッターをオーバーライドし、`change` イベントを発行すること:
  ```javascript
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  Object.defineProperty(el, 'value', {
    get: function () { return descriptor.get.call(this); },
    set: function (val) {
      descriptor.set.call(this, val);
      this.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  ```
- **IM-共通マスタ検索（imACMSearch）コールバックとリアルタイム再バリデーションの併用時の注意**:
  `imACMSearch` のコールバック関数はグローバルスコープに定義するため、`DOMContentLoaded` 内の `activeValidation` や `resetValidationError` に直接アクセスできない。`window._resetValidationError` として再バリデーション関数を公開し、コールバック内から呼び出すこと:
  ```javascript
  // DOMContentLoaded 内
  window._resetValidationError = () => {
    if (activeValidation) { resetValidationError(); }
  };
  // グローバルコールバック内
  function callbackXxxSearch(result) {
    // ... 値セット処理 ...
    if (window._resetValidationError) { window._resetValidationError(); }
  }
  ```
