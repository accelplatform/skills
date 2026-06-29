# ワークフロー 申請画面テンプレート（処理モーダル方式）

## 概要

IM-Workflow の申請画面プログラムのテンプレート（処理モーダル方式）。
`imWorkflow.modal.showApply()` / `imWorkflow.modal.showTemporarySave()` API を使用して
IM-Workflow の標準モーダル UI で申請・一時保存を行う。

申請と一時保存は同一の JSSP 画面で提供する（`simple-apply-screen.md` と同様）。
`showApply()` と `showTemporarySave()` を同一フォーム上の別々のボタンに割り当てる。

申請画面はスタンドアローンな JSSP 画面として URL から直接アクセスされる。
一時保存済み案件を再編集する場合は、URL パラメータ `userDataId` にユーザデータ ID を付与してアクセスする。

## ファイル構成

```
src/main/jssp/src/{機能名}/workflow/
  └── apply/
      ├── index.js              # ファンクションコンテナ
      └── index.html            # プレゼンテーションページ

src/main/conf/routing-jssp-config/
  └── {機能名}.xml              # ルーティング設定（申請画面へのURLマッピング）
```

**注意:** 処理モーダル方式の申請画面は URL から直接アクセスされる**スタンドアローン画面**であるため、`src/main/conf/routing-jssp-config/` へのルーティング XML 登録が必要。（workflowOpenPage 方式と異なる点）

---

## ルーティング設定（routing-jssp-config/{機能名}.xml）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<routing-jssp-config
    xmlns="http://www.intra-mart.jp/router/routing-jssp-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/router/routing-jssp-config routing-jssp-config.xsd">

  <!-- TODO: path と page を機能名に合わせて変更すること -->
  <file-mapping path="/{機能名}/workflow/apply" page="{機能名}/workflow/apply/index">
    <authz uri="service://{機能名}/workflow/apply" action="execute" />
  </file-mapping>

</routing-jssp-config>
```

---

## ファンクションコンテナ（apply/index.js）

```javascript
/**
 * ワークフロー 申請画面（処理モーダル方式）
 *
 * @file index.js
 * @description {機能名}の申請画面を構成します。
 *              新規申請・一時保存は処理モーダル（imWorkflow.modal.showApply / showTemporarySave）を使用します。
 *              imwSystemMatterId が採番済み（既に申請された案件＝引戻し後の未申請状態等）の場合は
 *              再申請が必要なため、画面側で showProcess（再申請）に切り替え、一時保存は不可とします。
 *              IM-Workflow パラメータ:
 *                imwFlowId（→ flowId、新規申請時）
 *                imwSystemMatterId（→ systemMatterId、採番済みなら再申請モード）
 *                imwNodeId（→ nodeId、再申請時の処理対象ノード）
 *                imwUserDataId（→ userDataId、一時保存済み案件の再編集時の取得・更新キー）
 */

// ========================================
// バインド変数（プレゼンテーションページ連携用）
// ========================================
let $title = '{画面タイトル}';        // TODO: 画面タイトルを設定
let $subTitle = '{サブタイトル}';     // TODO: サブタイトルを設定
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
 *
 * @param {Object} request - リクエストパラメータ
 * @return {Object} 処理結果
 */
function processBusinessLogic(request) {
  let result = {
    imwParameter: {
      // systemMatterId が採番済みの場合は、再申請モード
      isReapply:      !isBlank(request['imwSystemMatterId']),
      // 未申請時の情報（isReapply = false の場合）
      flowId:         request['imwFlowId']         || '',
      userDataId:     request['imwUserDataId']     || '',
      applyBaseDate:  request['imwApplyBaseDate']  || '',
      // 申請済みの情報（isReapply = true の場合）
      systemMatterId: request['imwSystemMatterId'] || '',
      nodeId:         request['imwNodeId']         || ''
    },
    formParameter: {
      // TODO: フォームの初期値フィールドをここで定義する
      // field1: '', field2: '', field3: ''
    }
  };

  if (result.imwParameter.userDataId) {
    getMatterProperties(result.formParameter, result.imwParameter.userDataId);
  }

  return result;
}

/**
 * 案件プロパティからデータを取得します。
 * 一時保存済みデータを画面の初期値として反映するために使用します。
 *
 * @param {Object} processResult - 処理結果オブジェクト（各フィールドが上書きされる）
 * @param {String} userDataId - ユーザデータ ID
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
    // プレゼンテーションページ連携用のバインド変数
    const $data = <imart type="string" value=$data escapeXml="false" escapeJs="false" />;

    document.addEventListener('DOMContentLoaded', () => {
      // バリデーションチェック常時実行フラグ
      let activeValidation = false;

      // 再申請モードかどうか
      const isReapply = $data.result.imwParameter.isReapply;

      // 画面の初期表示
      function initializeView(result) {
        // TODO: フィールドに合わせて変更
        // 例: document.getElementById(':field1:').value = result.formParameter.field1;

        // 再申請モードでは一時保存は不可のため、一時保存ボタンを非表示にし、
        // 申請ボタンのラベルを「再申請」に変更する
        if (isReapply) {
          document.getElementById('temp-save-button').style.display = 'none';
          document.getElementById('apply-button').textContent = '再申請';
        }
      }

      // フォームをクリア
      function clearForm() {
        // TODO: フィールドに合わせて変更
        // 例: document.getElementById(':field1:').value = '';
      }

      // バリデーションエラー表示初期化
      function clearValidationError() {
        document.querySelectorAll('.imds-field.imds-validation-error').forEach((element) => {
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

      // バリデーションエラー取得
      // TODO: フィールド仕様に応じてバリデーションルールをカスタマイズすること
      function getValidationErrors() {
        const errors = [];

        // TODO: 必須フィールドのバリデーション例
        // const fieldValue = document.getElementById(':field1:').value;
        // if (!fieldValue || fieldValue.length === 0) {
        //   errors.push({ name: 'field1', message: 'field1は必須です。' });
        // }

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
      // [':field1:', ':field2:'].forEach((id) => {
      //   document.getElementById(id).addEventListener('input', () => {
      //     if (activeValidation) { resetValidationError(); }
      //   });
      // });
      // セレクトボックス・数値入力等には "change" イベントを使用
      // [':field3:'].forEach((id) => {
      //   document.getElementById(id).addEventListener('change', () => {
      //     if (activeValidation) { resetValidationError(); }
      //   });
      // });

      // 案件名を組み立てる
      // TODO: フロー定義の案件名ルールに合わせてカスタマイズすること
      function buildMatterName() {
        // TODO: 実際の案件名生成ロジックに変更
        return '{案件名プレフィクス}_' + document.getElementById(':field1:').value;
      }

      // 現在のフォーム値から userParameter を組み立てる
      // TODO: フィールドに合わせて変更。キー名はアクション処理の userParam と一致させること
      function buildUserParameter() {
        return {
          // field1: document.getElementById(':field1:').value,
          // field2: document.getElementById(':field2:').value
        };
      }

      // 戻るボタン クリック時イベント
      document.getElementById('back-button').addEventListener('click', () => {
        imWorkflow.transition.returnTo();
      });

      // 申請（再申請）ボタン クリック時イベント（async 必須）
      document.getElementById('apply-button').addEventListener('click', async () => {
        if (!validateCurrentStep()) {
          return;
        }

        let result;
        if (isReapply) {
          // 再申請: systemMatterId が採番済みのため showProcess（再申請）を使用する。
          // 処理種別はフロー定義に従い自動決定（未申請状態のため再申請等が提示される）。
          result = await imWorkflow.modal.showProcess({
            processParameter: {
              systemMatterId: $data.result.imwParameter.systemMatterId,
              nodeId:         $data.result.imwParameter.nodeId,
              matterName:     buildMatterName()
            },
            optionalParameter: {
              userParameter: buildUserParameter()
            },
            rebootModal: false
          });
        } else {
          // 新規申請: showApply を使用する（systemMatterId は未採番）。
          // userDataId は一時保存の下書きを本申請に変換する場合に使用（新規申請時は空文字）。
          result = await imWorkflow.modal.showApply({
            processParameter: {
              flowId:        $data.result.imwParameter.flowId,
              userDataId:    $data.result.imwParameter.userDataId,
              applyBaseDate: $data.result.imwParameter.applyBaseDate,
              matterName:    buildMatterName()
            },
            optionalParameter: {
              userParameter: buildUserParameter()
            }
          });
        }

        // 申請/再申請完了後の処理
        if (result && result.isProcessDone) {
          imuiShowSuccessMessage(isReapply ? '再申請が完了しました。' : '申請が完了しました。');
          imWorkflow.transition.afterProcess();
        }
      });

      // 一時保存ボタン クリック時イベント（async 必須）
      document.getElementById('temp-save-button').addEventListener('click', async () => {
        if (!validateCurrentStep()) {
          return;
        }

        // 一時保存モーダルを開く
        // userDataId がある場合は既存の一時保存を更新、なければ新規作成
        const result = await imWorkflow.modal.showTemporarySave({
          processParameter: {
            flowId:        $data.result.imwParameter.flowId,             // 新規一時保存時に使用
            userDataId:    $data.result.imwParameter.userDataId || '',   // 更新時に使用（空文字の場合は新規）
            applyBaseDate: $data.result.imwParameter.applyBaseDate,
            matterName:    buildMatterName()
          },
          optionalParameter: {
            userParameter: buildUserParameter()
          },
          rebootModal: false
        });

        // 一時保存完了後の処理
        if (result && result.isProcessDone) {
          imuiShowSuccessMessage('一時保存が完了しました。');
          imWorkflow.transition.afterProcess();
        }
      });

      // エントリーポイント
      clearValidationError();
      if ($data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      } else {
        initializeView($data.result);
      }
    });
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
        <!-- TODO: セクション・フィールドをここに実装する -->
        <!-- 以下はサンプル構造（フィールド実装例） -->
        <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
          <h2 class="imds-heading is-bordered is-size-2 is-cyan">{セクションタイトル}</h2>
          <div class="imds-field-container has-accent-color">
            <!-- 必須フィールド例 -->
            <div class="imds-field-group is-horizontal imds-w-15">
              <div class="imds-field-group-label">
                <span class="imds-required-label-required" data-required-label="必須">{フィールドラベル}</span>
              </div>
              <div class="imds-field-group-control">
                <div class="imds-field" for=":field1:">
                  <div class="imds-field-control">
                    <input type="text" id=":field1:" class="imds-textbox" value="" />
                  </div>
                  <span class="imds-error-text" for=":field1:" style="display:none;"></span>
                </div>
              </div>
            </div>
            <!-- 任意フィールド例 -->
            <div class="imds-field-group is-horizontal imds-w-15">
              <div class="imds-field-group-label">
                <span>{フィールドラベル}</span>
              </div>
              <div class="imds-field-group-control">
                <div class="imds-field">
                  <div class="imds-field-control">
                    <input type="text" id=":field2:" class="imds-textbox" value="" />
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
```

---

## 生成時の注意事項

- **新規申請と再申請を `imwSystemMatterId` で分岐すること（必須）**
  - **`imwSystemMatterId` が採番済み = 既に申請された案件**（引戻し後の「未申請状態」等）であり、この状態では「申請」ではなく **「再申請」** が必要。再申請は **`showApply()` ではなく `showProcess()`** で行う（`showApply()` を呼ぶと userDataId / 案件の重複エラーになる）
  - 採番済みの場合（`isReapply`）: 申請ボタンのハンドラを `showProcess({ processParameter: { systemMatterId, nodeId }, ... })` に切り替え、**一時保存ボタンは非表示**にする（再申請時に一時保存は不可）。ボタンラベルは「再申請」に変更する
  - 未採番の場合: 従来どおり `showApply()`（新規申請）/ `showTemporarySave()`（一時保存）を使用する
  - 判定は `userDataId` ではなく **`systemMatterId`** で行うこと。一時保存の下書きは `userDataId` を持つが `systemMatterId` は未採番のため、新規申請モード（`showApply` で本申請に変換）として扱うのが正しい
  - 再申請モードで動作させるには、ファンクションコンテナで `imwSystemMatterId` / `imwNodeId` を受け取り `imwParameter` に格納しておくこと
- **申請と一時保存は同一画面に配置すること（新規申請モード時）**
  - `simple-apply-screen.md`（workflowOpenPage 方式）と同様に、申請・一時保存ボタンを同一フォーム上に配置する
  - 申請ボタン → `showApply()`、一時保存ボタン → `showTemporarySave()` の対応関係
- **一時保存済み案件の再編集（新規申請モード時）**
  - URL パラメータ `userDataId` を受け取った場合、`getMatterProperties()` でフォームを初期表示する
  - 再編集後に一時保存ボタンを押すと `userDataId` を使って既存の一時保存を更新する
  - 再編集後に申請ボタンを押すと `showApply()`（`userDataId` を渡す）で本申請に変換される
- **`flowId` に正しいフロー ID を設定すること**
  - IM-Workflow のフロー定義 XML で指定したフロー ID（`<flow id="...">` の値）を使用する
  - 間違ったフロー ID を指定すると、モーダルが正常に起動しない
- **`userParameter` のキー名をアクション処理の `userParam` と一致させること**
  - アクション処理（`action_process.js`）で `userParam.fieldName` として読み取るキー名と完全に一致させる
  - `buildUserParameter()` 関数にまとめることで申請・一時保存ボタン両方で同じデータを渡せる
- **`showApply()` / `showTemporarySave()` ともに `isProcessDone` が true のときのみ `imWorkflow.transition.afterProcess()` を呼び出すこと**
  - `showApply()`: 申請が完了した場合のみ呼び出す（申請完了後に申請一覧へ遷移）
  - `showTemporarySave()`: 一時保存が完了した場合のみ呼び出す（失敗・キャンセル時は画面に留まりユーザが修正できるようにする）
- **セキュアトークンタグの形式に注意すること**
  - `<meta name="im_secure_token">` ではなく `<meta http-equiv="X-Intramart-Secure-Token">` を使用する
- **`api_base.js` の `defer` 属性を省略しないこと**
- **ヘッダに「戻る」ボタンを配置すること**
  - `imds-header-back-button` div + `back-button` id のボタンを `imds-header-icon` の前に配置する
  - クリック時は `imWorkflow.transition.returnTo()` を呼び出す
- **申請・一時保存ボタンのイベントリスナーは `async` 関数にすること**
- **ルーティング XML の作成を忘れないこと**
  - 申請画面への URL が `routing-jssp-config` に登録されていないとアクセス不能になる
