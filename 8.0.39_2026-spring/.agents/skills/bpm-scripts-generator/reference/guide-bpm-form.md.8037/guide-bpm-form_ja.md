# BPM 画面フォーム リファレンス

## 概要

IM-BPM のスクラッチ画面連携に利用する画面フォームの生成ガイドライン。

### 画面処理（業務データ取得）の流れ

1.リクエスト種別の判定
- ファンクションコンテナ init関数のrequest パラメータより判定する。
  - request に `processDefinitionId`がある場合、開始イベントからのリクエスト。
  - request に `historicProcessInstanceId`がある場合、開始イベントの履歴参照リクエスト。
  - request に `historicTaskId`がある場合、タスクの履歴参照リクエスト。
  - request に `taskId`がある場合、ユーザタスクからのリクエスト。ユーザタスクは request に `processInstanceId` を含むこともある。

2.権限のチェック
- リクエストがプロセス開始画面の場合、bpm.BPMAuthorityHelper#canStartProcessにて権限判定する
- リクエストがタスク画面の場合、bpm.BPMAuthorityHelper#canCompleteTaskにて権限判定する
- リクエストがタスクの履歴参照の場合、bpm.BPMAuthorityHelper#canReferTaskにて権限判定する
- リクエストが開始イベントの履歴参照（`historicProcessInstanceId`）の場合、またはinit関数のrequest パラメータに `processInstanceId`がある場合、bpm.BPMAuthorityHelper#canReferProcessInstance にて権限判定する

※ ユーザタスクからのリクエスト（`taskId`）が `processInstanceId` を併せ持つ場合は、`canCompleteTask` と `canReferProcessInstance` の2つの権限チェックを両方とも行うこと（片方のみで判定しない）。

3.リクエストパターンの判定
- リクエストの内容からパターンを判定する
  - request に `processDefinitionId`がある場合は `startProcess`。
  - request に `historicProcessInstanceId`がある場合は `referProcessInstance`。
  - request に `historicTaskId`がある場合は `referTask`。
  - request に `taskId`がある場合は `completeTask`。

4.業務データ取得
- 業務データの取得を行う。`validateBPMRequest` の戻り値がリクエストパターンを返すので、その値でデータ取得の有無やデータ取得時に利用する主キー値の判定を行う。
  - リクエストパターンが `startProcess` の場合、業務データ取得を行わない。
  - リクエストパターンが `referProcessInstance` の場合、`historicProcessInstanceId`をキーに業務データを取得する。
  - リクエストパターンが `referTask` の場合、`historicTaskId`をキーに業務データを取得する。
  - 上記以外（`completeTask`）は、業務データの主キー方式に応じて取得条件を切り替える。
    - **複合主キー方式（`プロセスインスタンスID + タスクID` で「1タスク完了=1行」管理。既定方式）**: 自タスクより前に完了した開始イベント・ユーザタスクの入力データを表示・引き継ぐ場合、`request.processInstanceId`（または暗黙オブジェクト）と、前工程のタスクIDを保持するプロセス変数（例: `applyTaskId`。取得は `bpm.RuntimeService#getVariable` 等）を検索条件として業務データを取得する。
      - 承認・確認等、前工程の入力データを画面表示するだけのタスクでは、この取得結果をそのまま表示に用いる。
      - 前工程の入力データに今回の画面入力値を加えて新規レコードを登録するタスクでは、取得結果を hidden 項目等で保持し、登録処理（後述）へ引き継ぐ。
    - **Update方式（業務データにタスクIDがない、または明示的な要望によりUpdate方式を採用した場合）**: 業務データの主キー（プロセス変数等で持ち回る値）を検索条件として業務データを取得する。

5.モード判定
- リクエストパターンが `referProcessInstance` か `referTask` の場合、参照モード。
- リクエストパターンが `startProcess` の場合、新規モード。
- 上記以外は業務データを検索し、データがあれば編集モード、なければ新規モード。

6.モードによる画面表示の制御
- 参照モードである場合
  - 画面の入力項目は編集できないようにすること。
  - 検索ダイアログなどは非表示にして、操作できないようにすること。
  - 登録・編集・削除・キャンセルボタンなどは非表示にする。
  - 参照モードの画面表示は、別ウィンドウになるため「戻る」ボタンは不要。

## サンプルコード

### ファンクションコンテナ

```javascript

// ========================================
// IM-BPM リクエストパラメタと権限チェック
// ========================================
/**
 * IM-BPM リクエストパラメタと権限をチェックします。
 *
 * @param {Object} request - リクエストパラメータ
 * @return {string} - リクエストパターン
 * @throws {Error} エラーメッセージ
 */
function validateBPMRequest(request) {

  if (!request) {
    throw new Error('BPMプロセスの処理に必要なパラメタが指定されていません。');
  }

  let reqPattern = '';
  let bpmAuthorityHelper = new bpm.BPMAuthorityHelper();

  // 開始イベントからのリクエスト
  if (request['processDefinitionId']){
    const resultCanStart = bpmAuthorityHelper.canStartProcess(request['processDefinitionId']);
    if (resultCanStart.error) throw new Error(resultCanStart.errorMessage);
    if (resultCanStart.data) {
      reqPattern = 'startProcess';
      // 開始イベントなので業務データ取得は基本的に無し
    } else {
      throw new Error('プロセスの開始権限がありません。');
    }
  }
  // 開始イベントの履歴参照リクエスト？
  else if (request['historicProcessInstanceId']) {
    const resultCanReferProcess = bpmAuthorityHelper.canReferProcessInstance(request['historicProcessInstanceId']);
    if (resultCanReferProcess.error) throw new Error(resultCanReferProcess.errorMessage);
    if (resultCanReferProcess.data) {
      reqPattern = 'referProcessInstance';
    } else {
      throw new Error('参照権限がありません。');
    }
  }
  // タスクの履歴参照リクエスト？
  else if (request['historicTaskId']) {
    const resultCanReferTask = bpmAuthorityHelper.canReferTask(request['historicTaskId']);
    if (resultCanReferTask.error) throw new Error(resultCanReferTask.errorMessage);
    if (resultCanReferTask.data) {
      reqPattern = 'referTask';
    } else {
      throw new Error('参照権限がありません。');
    }
  }
  // ユーザタスクからのリクエスト
  else if (request['taskId']) {
    const resultCanCompleteTask = bpmAuthorityHelper.canCompleteTask(request['taskId']);
    if (resultCanCompleteTask.error) throw new Error(resultCanCompleteTask.errorMessage);
    if (resultCanCompleteTask.data) {
      reqPattern = 'completeTask';
    } else {
      throw new Error('タスクの完了権限がありません。');
    }

    // プロセスインスタンスの権限判定
    if (request['processInstanceId']) {
      const result = bpmAuthorityHelper.canReferProcessInstance(request['processInstanceId']);
      if (result.error) throw new Error(result.errorMessage);
      if (!result.data) {
        throw new Error('参照権限がありません。');
      }
    }

  } else {
    throw new Error('BPMプロセスの処理に必要なパラメタが指定されていません。');
  }
  return reqPattern;
}


```

**処理後の画面遷移について**
- 画面処理完了後、リクエストパラメータの callbackPath に指定された画面に遷移すること。
  - 仕様上に画面遷移先が明記されている場合はその指定に従う。

**callbackPath を PageManager.redirect() に渡す際の必須変換（重要・頻発バグ）**
- IM-BPM から渡される `callbackPath`（例: `'bpm/task/list?group.retains...'`）は**先頭スラッシュなしのコンテキストパス相対パス**である。
- `PageManager.redirect(url)` は指定した `url` をそのまま HTML フォームの `action` 属性に設定する仕様のため、先頭スラッシュなしの `callbackPath` を**そのまま渡すと、現在表示中の画面パス（例: `/equipment_purchase/purchase_apply`）を基点とした相対パスとして解釈され、`/equipment_purchase/bpm/task/list` のような誤った URL になり 404 になる**（実際に発生した不具合）。
- 必ず `Web.getContextPath()` を使って、Web アプリケーションルートを基点とした絶対パスに変換してから `PageManager.redirect()` に渡すこと。

```javascript
// NG: callbackPath をそのまま渡す → 現在画面基準の相対パスとして解釈され 404 になる
let result = PageManager.redirect(callbackPath, 'GET');

// OK: Web.getContextPath() でコンテキストパスを付与した絶対パスに変換する
function buildAbsoluteCallbackPath(callbackPath) {
  let relativePath = callbackPath.charAt(0) === '/' ? callbackPath.substring(1) : callbackPath;
  return Web.getContextPath() + '/' + relativePath;
}
let result = PageManager.redirect(buildAbsoluteCallbackPath(callbackPath), 'GET');
```

- `callbackPath` はリクエストパラメータ（POST ボディの hidden フィールド等）経由で渡されるため、上記変換の前に、外部サイトへのオープンリダイレクトを防ぐ安全性検証（URI スキーム・`//`・バックスラッシュ・制御文字の拒否）を別途実施すること（`.agents/requirements/jssp-security/AGENTS.md` の「入力バリデーション」のホワイトリスト方式の考え方に準拠。同ファイルにオープンリダイレクト対策の記載はないため、本項の検証観点に従って実装すること）。安全性検証とパス解決（絶対パス変換）は責務を分離し、検証 → 変換の順で呼び出すこと。
