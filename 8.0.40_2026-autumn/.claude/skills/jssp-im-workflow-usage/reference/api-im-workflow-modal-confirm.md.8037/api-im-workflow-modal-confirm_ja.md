# imWorkflow.modal.showConfirm API リファレンス

IM-Workflow の処理モーダル API。クライアントサイドで IM-Workflow の標準確認モーダルを起動する。

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

### `imWorkflow.modal.showConfirm(parameter)`

確認モーダルを開く。

**戻り値**: `Promise<{ isProcessDone: boolean }>`

#### パラメータ

```javascript
imWorkflow.modal.showConfirm({
  processParameter: {
    systemMatterId:        '',   // システム案件 ID
    nodeId:                '',   // ノード ID
    authUserDepartmentInfo: {},  // 権限者所属組織情報
    confirmComment:        '',   // 確認コメントの初期値
    interfaceControl:      {}    // フィールド表示・編集制御
  },
  optionalParameter: {
    userParameter: {}            // アクション処理に渡す業務データ
  },
  rebootModal: false
});
```

#### processParameter

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `systemMatterId` | string | - | システム案件 ID。確認対象の案件を特定する |
| `nodeId` | string | - | ノード ID。確認対象のノードを特定する |
| `authUserDepartmentInfo` | Object | - | 権限者所属組織情報 |
| `confirmComment` | string | - | 確認コメントの初期値（2000 バイト以内） |
| `interfaceControl` | Object | - | フィールドの表示・編集・必須制御 |

#### authUserDepartmentInfo

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `companyCd` | string | ✓ | 会社コード |
| `departmentSetCd` | string | ✓ | 組織セットコード |
| `departmentCd` | string | ✓ | 組織コード |

#### interfaceControl

以下のフィールドそれぞれに対して `display`（表示制御）、`readonly`（読み取り専用）、`required`（必須）を設定できる。

| フィールド名 | 制御可能な属性 |
|------------|--------------|
| `matterNumber` | `display` |
| `matterName` | `display`, `readonly` |
| `applyBaseDate` | `display` |
| `applyDate` | `display` |
| `applyAuthUserCd` | `display` |
| `authUserDepartmentInfo` | `display` |
| `priorityLevel` | `display`, `readonly` |
| `confirmComment` | `display`, `readonly`, `required` |

```javascript
interfaceControl: {
  confirmComment: { display: true, readonly: false, required: true }
}
```

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
| `isProcessDone` | boolean | `true`: 確認が完了 / `false`: ユーザがモーダルを閉じた |

## 使用例

```javascript
document.getElementById('confirm-button').addEventListener('click', async () => {

  const result = await imWorkflow.modal.showConfirm({
    processParameter: {
      systemMatterId: $data.result.systemMatterId,
      nodeId:         $data.result.nodeId,
      interfaceControl: {
        confirmComment: { display: true, required: false }
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

確認モーダルが閉じた後（完了・キャンセルどちらの場合も）、必ず `imWorkflow.transition.afterProcess()` を呼び出すこと。IM-Workflow の標準ページ遷移処理（タスク一覧への戻り等）を実行する。

## 注意事項

- `imWorkflow.modal.showConfirm()` はクライアントサイドの API。サーバサイド（SSJS / Rhino）では使用不可
- `systemMatterId` と `nodeId` は URL パラメータ等から取得する必要がある
- 確認画面には独自の「戻る」ボタンを配置しないこと。`imWorkflow.transition.afterProcess()` に遷移を委ねること
- `showProcess()` と異なり `processType` の指定がない（確認処理は単一のアクション）
