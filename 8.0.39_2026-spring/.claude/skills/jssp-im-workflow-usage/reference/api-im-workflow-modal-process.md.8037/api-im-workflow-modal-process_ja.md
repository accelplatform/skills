# imWorkflow.modal.showProcess API リファレンス

IM-Workflow の処理モーダル API。クライアントサイドで IM-Workflow の標準処理（承認・否認・差戻し等）モーダルを起動する。

## インポート

画面の `<imart type="head">` 内に以下を記述する。`defer` 属性は必須。

```html
<script src="im_workflow/js/api_base.js" defer></script>
```

また、セキュアトークン用のメタタグを以下の形式で記述する。`name` 形式では動作しない点に注意。

```html
<meta http-equiv="X-Intramart-Secure-Token" content="<imart type="imSecureToken" mode="value" />"/>
```

## メソッド

### `imWorkflow.modal.showProcess(parameter)`

処理（承認・否認・差戻し等）モーダルを開く。

**戻り値**: `Promise<{ isProcessDone: boolean }>`

#### パラメータ

```javascript
imWorkflow.modal.showProcess({
  processParameter: {
    systemMatterId:        '',   // システム案件 ID
    nodeId:                '',   // ノード ID
    processType:           [],   // 処理種別の配列（省略時は自動決定）
    matterName:            '',   // 案件名
    authUserDepartmentInfo: {},  // 権限者所属組織情報
    priorityLevel:         '',   // 優先度
    processComment:        '',   // 処理コメントの初期値
    branchSelects:         [],   // 分岐選択情報
    sendBackNodeIds:       [],   // 差戻し先ノード ID
    dynamicNodeConfigs:    [],   // 動的ノード設定
    confirmNodeConfigs:    [],   // 確認ノード設定
    horizontalNodeConfigs: [],   // 水平ノード設定
    verticalNodeConfigs:   [],   // 垂直ノード設定
    interfaceControl:      {}    // フィールド表示・編集制御
  },
  optionalParameter: {
    userParameter: {}            // アクション処理に渡す業務データ
  },
  rebootModal: false
});
```

#### processParameter（主要パラメータ）

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `systemMatterId` | string | - | システム案件 ID。処理対象の案件を特定する |
| `nodeId` | string | - | ノード ID。処理対象のノードを特定する |
| `processType` | string[] | - | 処理種別の配列。省略時はフロー定義に従い自動決定 |
| `matterName` | string | - | 案件名 |
| `authUserDepartmentInfo` | Object | - | 権限者所属組織情報 |
| `priorityLevel` | string | - | 優先度 |
| `processComment` | string | - | 処理コメントの初期値（2000 バイト以内） |
| `branchSelects` | Object[] | - | 分岐選択情報 |
| `sendBackNodeIds` | string[] | - | 差戻し先として選択できるノード ID の一覧 |
| `interfaceControl` | Object | - | フィールドの表示・編集・必須制御 |

#### authUserDepartmentInfo

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `companyCd` | string | ✓ | 会社コード |
| `departmentSetCd` | string | ✓ | 組織セットコード |
| `departmentCd` | string | ✓ | 組織コード |

#### interfaceControl

| フィールド名 | 制御可能な属性 |
|------------|--------------|
| `matterNumber` | `display` |
| `matterName` | `display`, `readonly` |
| `applyBaseDate` | `display` |
| `applyDate` | `display` |
| `applyAuthUserCd` | `display` |
| `authUserDepartmentInfo` | `display` |
| `priorityLevel` | `display`, `readonly` |
| `processComment` | `display`, `readonly`, `required` |

#### optionalParameter

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `userParameter` | Object | アクション処理に `userParam` として渡される業務データ |
| `formaParam.items` | Object | Forma 連携パラメータ |

#### rebootModal

| 値 | 動作 |
|----|------|
| `false`（デフォルト） | モーダルを閉じても入力内容をコンテンツ画面に保持する |
| `true` | モーダルを閉じると入力内容を破棄する |

#### 戻り値

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| `isProcessDone` | boolean | `true`: 処理が完了 / `false`: ユーザがモーダルを閉じた |

## 使用例

```javascript
document.getElementById('process-button').addEventListener('click', async () => {

  const result = await imWorkflow.modal.showProcess({
    processParameter: {
      systemMatterId: $data.result.systemMatterId,
      nodeId:         $data.result.nodeId,
      interfaceControl: {
        processComment: { display: true, required: true }
      }
    },
    optionalParameter: {
      userParameter: {
        reviewNote: document.getElementById(':review-note:').value
      }
    },
    rebootModal: false
  });

  // 処理完了後のページ遷移（完了・キャンセルどちらの場合も呼び出す）
  imWorkflow.transition.afterProcess();
});
```

## `imWorkflow.transition.afterProcess()` について

処理モーダルが閉じた後（完了・キャンセルどちらの場合も）、必ず `imWorkflow.transition.afterProcess()` を呼び出すこと。IM-Workflow の標準ページ遷移処理（タスク一覧への戻り等）を実行する。

## 注意事項

- `imWorkflow.modal.showProcess()` はクライアントサイドの API。サーバサイド（SSJS / Rhino）では使用不可
- `systemMatterId` と `nodeId` は URL パラメータ等から取得する必要がある
- `processType` を省略するとフロー定義で許可されているすべての処理種別がモーダル内に表示される
- 処理画面には独自の「戻る」ボタンを配置しないこと。`imWorkflow.transition.afterProcess()` に遷移を委ねること
