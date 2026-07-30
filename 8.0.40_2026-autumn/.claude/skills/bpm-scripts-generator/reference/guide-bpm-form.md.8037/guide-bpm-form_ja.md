# BPM 画面フォーム リファレンス

## 概要

IM-BPM のスクラッチ画面連携に利用する画面フォームの生成ガイドライン。

### 画面処理（業務データ取得）の流れ

1.リクエスト種別の判定
- ファンクションコンテナ init関数のrequest パラメータより判定する。
  - request に `processDefinitionId`がある場合、開始イベントからのリクエスト。
  - request に `historicProcessInstanceId`がある場合、開始イベントの履歴参照リクエスト。
  - request に `taskId`がある場合、ユーザタスクからのリクエスト。
  - request に `historicTaskId`がある場合、タスクの履歴参照リクエスト。

2.権限のチェック
- リクエストがプロセス開始画面の場合、bpm.BPMAuthorityHelper#canStartProcessにて権限判定する
- リクエストがタスク画面の場合、bpm.BPMAuthorityHelper#canCompleteTaskにて権限判定する
- リクエストがタスクの履歴参照の場合、bpm.BPMAuthorityHelper#canReferTaskにて権限判定する
- リクエストが開始イベントの履歴参照（`historicProcessInstanceId`）の場合、またはinit関数のrequest パラメータに `processInstanceId`がある場合、bpm.BPMAuthorityHelper#canReferProcessInstance にて権限判定する

※ 「タスクの履歴参照」と「開始イベントの履歴参照」は判定基準となるパラメータが異なるため、`canReferTask` と `canReferProcessInstance` を同一リクエストに重複適用しないこと。

3.業務データ取得
- 開始イベントは業務データ取得を行わない。
- 開始イベントの履歴参照リクエストは、`historicProcessInstanceId`をキーに業務データを取得する。
- タスクの履歴参照リクエストは、業務データの主キー、または、`historicTaskId`をキーに業務データを取得する。
- 上記以外は、業務データの主キー、またはプロセスインスタンスID・タスクID等を利用して業務データを取得する。

4.モード判定
- 履歴参照リクエストは参照モード。
- 開始イベントは新規モード。
- 上記以外は業務データを検索し、データがあれば編集モード、なければ新規モード。

5.モードによる画面表示の制御
- 参照モードである場合
  - 画面の入力項目は編集できないようにすること。
  - 検索ダイアログなどは非表示にして、操作できないようにすること。
  - 登録・編集・削除・キャンセルボタンなどは非表示にする。
  - 参照モードの画面表示は、別ウィンドウになるため「戻る」ボタンは不要。

## サンプルコード

### ファンクションコンテナ

```javascript

// ========================================
// IM-BPMスクラッチ画面連携 - 参照リクエスト判定
// ========================================
/**
 * リクエストパラメータの内容より、詳細画面からのリクエストであるか判定します。
 * モード判定（4.モード判定）専用。historicProcessInstanceId / historicTaskId のどちらか判別しないため、
 * タスク権限チェック等の分岐条件には使用しないこと。
 *
 * @param {Object} request - リクエストパラメータ
 */
function isReferenceRequest(request) {
  return (request['historicProcessInstanceId'] || request['historicTaskId']);
}

// ========================================
// IM-BPMスクラッチ画面連携 - 開始イベント判定
// ========================================
/**
 * リクエストパラメータの内容より、プロセス開始イベントからのリクエストであるか判定します
 *
 * @param {Object} request - リクエストパラメータ
 */
function isStartEventRequest(request) {
  return (request['processDefinitionId']);
}

// ========================================
// IM-BPM プロセスの開始権限チェック
// ========================================
/**
 * IM-BPM の開始権限をチェックします。
 *
 * @param {String} processDefinitionId - プロセス定義ID
 * @return {Boolean} - true:権限あり false:権限無し
 * @throws {Error} エラーメッセージ
 */
function hasStartProcessAuthority(processDefinitionId) {
  let BPMAuthorityHelper = new bpm.BPMAuthorityHelper();
  const result = BPMAuthorityHelper.canStartProcess(processDefinitionId);
  if (result.error) throw new Error(result.errorMessage);
  if (!result.error && result.data) return true;
  return false;
}


// ========================================
// IM-BPM プロセスインスタンスの参照権限チェック
// ========================================
/**
 * IM-BPM のプロセスインスタンス参照権限をチェックします。
 *
 * @param {String} processInstanceId - プロセスインスタンスID
 * @return {Boolean} - true:権限あり false:権限無し
 * @throws {Error} エラーメッセージ
 */
function hasReferProcessAuthority(processInstanceId) {
  let BPMAuthorityHelper = new bpm.BPMAuthorityHelper();
  const result = BPMAuthorityHelper.canReferProcessInstance(processInstanceId);
  if (result.error) throw new Error(result.errorMessage);
  if (!result.error && result.data) return true;
  return false;
}

// ========================================
// IM-BPM タスク権限チェック
// ========================================
/**
 * IM-BPM のタスク権限をチェックします。
 * 対象は taskId / historicTaskId を持つリクエストのみ。
 * historicProcessInstanceId（開始イベントの履歴参照）は対象外のため、hasReferProcessAuthority を使用すること。
 *
 * @param {Object} request - リクエストパラメータ
 * @return {Boolean} - true:権限あり false:権限無し
 * @throws {Error} エラーメッセージ
 */
function hasTaskAuthority(request) {
  let BPMAuthorityHelper = new bpm.BPMAuthorityHelper();
  if (request['historicTaskId']) {
    const historicTaskId = request['historicTaskId'];
    const result = BPMAuthorityHelper.canReferTask(historicTaskId)
    if (result.error) throw new Error(result.errorMessage);
    if (!result.error && result.data) return true;
  } else {
    const taskId = request['taskId'];
    const result = BPMAuthorityHelper.canCompleteTask(taskId)
    if (result.error) throw new Error(result.errorMessage);
    if (!result.error && result.data) return true;
  }
  return false;
}

```

**処理後の画面遷移について**
- 画面処理完了後、リクエストパラメータの callbackPath に指定された画面に遷移すること。
  - 仕様上に画面遷移先が明記されている場合はその指定に従う。