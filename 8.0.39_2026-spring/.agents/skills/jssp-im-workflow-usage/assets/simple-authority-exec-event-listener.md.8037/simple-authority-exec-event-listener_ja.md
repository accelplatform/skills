# ワークフロー 処理対象者プラグインテンプレート

## 概要

IM-Workflow の処理対象者プラグインプログラムのテンプレート。
画面を持たず、案件処理時にノードの処理対象者を動的に決定するためのプラグインである。
3つの関数を実装する必要がある。

| 関数名 | 用途 |
|--------|------|
| execute | 処理対象者の取得（案件処理時に呼び出される） |
| getDisplayName | プラグイン設定情報の表示名取得 |
| getTargetUserList | 対象者状況確認画面のユーザ一覧取得 |

## ファイル構成

```
src/main/jssp/src/{機能名}/workflow/
  └── plugin/
      └── authority_exec_event_listener.js      # 処理対象者プラグイン
```

---

## execute - 処理対象者取得

### workflowParam（ワークフローパラメータ）

| プロパティ | 型 | 説明 |
|-----------|------|------|
| loginGroupId | String | ログイングループID（非推奨。テナントID と同値） |
| localeId | String | ロケールID |
| targetLocales | String | ターゲットロケールID |
| applyBaseDate | String | 申請基準日 |
| parameter | String | パラメータ |
| targetCodes | Array | ターゲットコード配列（引戻し・差戻し・案件操作によるノード移動時に設定） |

### matterParam（案件パラメータ）

| プロパティ | 型 | 説明 |
|-----------|------|------|
| contentsId | String | コンテンツID |
| contentsVersionId | String | コンテンツバージョンID |
| routeId | String | ルートID |
| routeVersionId | String | ルートバージョンID |
| flowId | String | フローID |
| flowVersionId | String | フローバージョンID |
| nodeId | String | ノードID |
| systemMatterId | String | システム案件ID |
| userDataId | String | ユーザデータID |

### 返却値

| プロパティ | 型 | 説明 |
|-----------|------|------|
| resultFlag | Boolean | 結果フラグ（`true`: 成功 / `false`: 失敗） |
| message | String | 結果メッセージ（失敗の場合のみ） |
| data | Array | 処理対象者情報の配列 |

### data 配列の要素

| プロパティ | 型 | 説明 |
|-----------|------|------|
| userCode | String | 処理対象者のユーザコード |
| userName | String | 処理対象者のユーザ名 |
| localeId | String | 処理対象者のロケールID |
| userOrgzModels | Array | 処理対象者の所属一覧配列（担当組織の選択肢になる） |

### userOrgzModels 配列の要素

| プロパティ | 型 | 説明 |
|-----------|------|------|
| companyName | String | 会社名 |
| orgzName | String | 組織名 |
| companyCode | String | 会社コード |
| orgzSetCode | String | 組織セットコード |
| orgzCode | String | 組織コード |

---

## getDisplayName - 表示名取得

### workflowParam（ワークフローパラメータ）

`execute` と同じ項目（`targetCodes` を除く）。

### 返却値

| プロパティ | 型 | 説明 |
|-----------|------|------|
| resultFlag | Boolean | 結果フラグ（`true`: 成功 / `false`: 失敗） |
| message | String | 結果メッセージ（失敗の場合のみ） |
| data | Object | ロケールID をキーとした表示名オブジェクト |

---

## getTargetUserList - 対象者状況確認

### 引数

| 引数名 | 型 | 説明 |
|--------|------|------|
| workflowParam | Object | ワークフローパラメータ（`execute` と同じ項目。`targetCodes` を除く） |
| matterParam | Object | 案件パラメータ（`execute` と同じ項目） |
| sort | Array | ソート条件配列 |

### 返却値

| プロパティ | 型 | 説明 |
|-----------|------|------|
| resultFlag | Boolean | 結果フラグ（`true`: 成功 / `false`: 失敗） |
| message | String | 結果メッセージ（失敗の場合のみ） |
| data | Object | ロケールID をキーとした処理対象者配列 |

### data[localeId] 配列の要素

| プロパティ | 型 | 説明 |
|-----------|------|------|
| userCode | String | 処理対象者のユーザコード |
| userName | String | 処理対象者の表示名 |
| localeId | String | 処理対象者のロケールID |

---

## 処理対象者プラグイン（authority_exec_event_listener.js）

```javascript
/**
 * ワークフロー 処理対象者プラグイン
 *
 * @file authority_exec_event_listener.js
 * @description 案件処理時にノードの処理対象者を動的に決定するプラグインです。
 */

// ========================================
// 処理対象者取得
// ========================================
/**
 * 処理対象者を取得します。
 * 案件処理時に実行されます。
 *
 * @param {Object} workflowParam - ワークフローパラメータ
 * @param {Object} matterParam - 案件パラメータ
 * @return {Object} 処理結果
 */
function execute(workflowParam, matterParam) {
  let logger = Logger.getLogger();
  let result = {
    resultFlag: true,
    message: '',
    data: []
  };

  try {
    result.data = resolveTargetUsers(workflowParam, matterParam);
  } catch (e) {
    logger.error('[authorityPlugin] エラーが発生しました。nodeId={}, error={}', matterParam.nodeId, e.message);
    result.resultFlag = false;
    result.message = e.message;
  }

  return result;
}

// ========================================
// 表示名取得
// ========================================
/**
 * プラグインの表示名を取得します。
 * ロケール毎に設定する必要があります。
 *
 * @param {Object} workflowParam - ワークフローパラメータ
 * @return {Object} 処理結果
 */
function getDisplayName(workflowParam) {
  let result = {
    resultFlag: true,
    message: '',
    data: {
      'ja': '処理対象者プラグイン',
      'en': 'Authority Plugin'
    }
  };

  return result;
}

// ========================================
// 対象者状況確認
// ========================================
/**
 * 対象者状況確認画面に表示するユーザ一覧を取得します。
 * [案件操作]-[ノード編集]画面の「状況確認」ボタン押下時に呼び出されます。
 *
 * @param {Object} workflowParam - ワークフローパラメータ
 * @param {Object} matterParam - 案件パラメータ
 * @param {Array} sort - ソート条件配列
 * @return {Object} 処理結果
 */
function getTargetUserList(workflowParam, matterParam, sort) {
  let logger = Logger.getLogger();
  let result = {
    resultFlag: true,
    message: '',
    data: {}
  };

  try {
    result.data = resolveTargetUserList(workflowParam, matterParam, sort);
  } catch (e) {
    logger.error('[authorityPlugin] 対象者一覧取得エラー。nodeId={}, error={}', matterParam.nodeId, e.message);
    result.resultFlag = false;
    result.message = e.message;
  }

  return result;
}

// ========================================
// ビジネスロジック
// ========================================
/**
 * 処理対象者を解決します。
 *
 * @param {Object} workflowParam - ワークフローパラメータ
 * @param {Object} matterParam - 案件パラメータ
 * @return {Array} 処理対象者情報の配列
 */
function resolveTargetUsers(workflowParam, matterParam) {
  // TODO: ここで処理対象者を決定するビジネスロジックを実装してください
  //
  // workflowParam.targetCodes が設定されている場合:
  //   引戻し・差戻し・案件操作によるノード移動で到達している
  //   前回の処理者を返却することで、再処理待ち状態を実現可能
  //
  // 返却値の例:
  //   [{
  //       userCode: "aoyagi",
  //       userName: "青柳 辰巳",
  //       localeId: "ja",
  //       userOrgzModels: [{
  //           companyName: "サンプル会社",
  //           orgzName: "営業部",
  //           companyCode: "comp_sample_01",
  //           orgzSetCode: "comp_sample_01_set_01",
  //           orgzCode: "comp_sample_01_section_sales"
  //       }]
  //   }]

  return [];
}

/**
 * 対象者状況確認画面に表示するユーザ一覧を解決します。
 *
 * @param {Object} workflowParam - ワークフローパラメータ
 * @param {Object} matterParam - 案件パラメータ
 * @param {Array} sort - ソート条件配列
 * @return {Object} ロケールIDをキーとした処理対象者配列
 */
function resolveTargetUserList(workflowParam, matterParam, sort) {
  // TODO: ここで対象者一覧を返却するビジネスロジックを実装してください

  return {};
}
```

---

## targetCodes について

`workflowParam.targetCodes` は以下のケースでユーザコードの配列として渡される。

- 引戻し
- 差戻し
- 案件操作機能によるノード移動（戻る）

当プラグインを設定したノードに対して最後に処理したユーザコードがセットされる。
`targetCodes` で渡されたユーザを返却値に採用することで、前回の処理者による案件の再処理待ち状態を実現できる。

---

## 使用可能なテンプレート

- **処理対象者プラグイン（SSJS 実装）**: [assets/simple-authority-exec-event-listener.md](assets/simple-authority-exec-event-listener.md)
  - 案件処理時にノードの処理対象者を動的に決定
  - `execute`, `getDisplayName`, `getTargetUserList` の3関数を実装
  - `targetCodes` による再処理待ち状態の実現が可能

- **処理対象者プラグイン（IM-LogicDesigner 連携）**: [assets/logic-flow-authority-plugin.md](assets/logic-flow-authority-plugin.md)
  - SSJS を書かずにロジックフローで処理対象者を決定する方式
  - IM-Workflow ルート定義で `.logic_flow_user` サフィックスを使用
  - 承認ノード・確認ノード・参照者設定に対応（実機確認済み）

### 方式の選択指針

**SSJS プラグインを選ぶ場合:**
- IM-LogicDesigner では実現しにくい複雑なロジック（複数の API 連携・動的クエリ等）
- リリースサイクルに合わせた変更管理が必要

**IM-LogicDesigner 連携を選ぶ場合:**
- 管理画面からフローを変更・公開できる運用を望む場合
- IM-LogicDesigner の既存タスクで対応可能なロジック（DB 検索・条件分岐等）

### 生成時の指示例

ユーザが「ワークフローの処理対象者プラグインを作成して」と依頼した場合、どちらの方式にするか確認してから実装に進む。
- SSJS 実装 → この assets のコードを参考にカスタマイズして生成する
- IM-LogicDesigner 連携 → `assets/logic-flow-authority-plugin.md` の spec.json テンプレートを使ってフロー定義を生成する
