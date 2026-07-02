# imWorkflow.modal.showTemporarySave API リファレンス

IM-Workflow の処理モーダル API。クライアントサイドで IM-Workflow の標準一時保存モーダルを起動する。

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

### `imWorkflow.modal.showTemporarySave(parameter)`

一時保存モーダルを開く。

**戻り値**: `Promise<{ isProcessDone: boolean, data: { userDataId: string } }>`

#### パラメータ

```javascript
imWorkflow.modal.showTemporarySave({
  processParameter: {
    flowId:         '',        // 新規一時保存時に必要（更新時は不要）
    userDataId:     '',        // 既存一時保存の更新時に指定
    matterName:     '',        // 案件名（200 バイト以内）
    applyBaseDate:  '',        // 申請基準日（省略時は当日）
    applyAuthUserCd: '',       // 代理申請者ユーザコード
    processComment: '',        // 処理コメント（2000 バイト以内）
    interfaceControl: {}       // フィールド表示・編集制御
  },
  optionalParameter: {
    userParameter: {}          // アクション処理に渡す業務データ
  },
  rebootModal: false           // モーダルを閉じたときに入力内容を破棄するか
});
```

#### processParameter

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `flowId` | string | △ | フロー ID。新規一時保存時に必要。`userDataId` がある場合は不要 |
| `userDataId` | string | △ | 既存一時保存のユーザデータ ID。既存の一時保存を更新する場合に指定 |
| `matterName` | string | - | 案件名（最大 200 バイト） |
| `applyBaseDate` | Date or string | - | 申請基準日。省略時は当日 |
| `applyAuthUserCd` | string | - | 代理申請者のユーザコード |
| `processComment` | string | - | 処理コメント（最大 2000 バイト） |
| `interfaceControl` | Object | - | フィールドの表示・編集・必須制御 |

#### interfaceControl

| フィールド名 | 制御可能な属性 |
|------------|--------------|
| `matterName` | `display`, `readonly` |
| `applyBaseDate` | `display` |
| `applyAuthUserCd` | `display` |
| `processComment` | `display`, `readonly`, `required` |

```javascript
interfaceControl: {
  processComment: { display: true, readonly: false, required: true }
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
| `isProcessDone` | boolean | `true`: 一時保存が完了 / `false`: ユーザがモーダルを閉じた |
| `data.userDataId` | string | 一時保存されたユーザデータ ID（`isProcessDone` が `true` のときのみ有効） |

## 使用例

```javascript
document.getElementById('tempsave-button').addEventListener('click', async () => {
  if (!validateCurrentStep()) { return; }

  const result = await imWorkflow.modal.showTemporarySave({
    processParameter: {
      flowId:     $data.result.flowId || '',
      userDataId: $data.result.userDataId || '',
      matterName: '申請下書き_' + document.getElementById(':field1:').value
    },
    optionalParameter: {
      userParameter: {
        field1: document.getElementById(':field1:').value,
        field2: document.getElementById(':field2:').value
      }
    },
    rebootModal: false
  });

  if (result && result.isProcessDone) {
    // 次回アクセス時に同じ下書きを再編集できるよう、userDataId を保持する
    imuiShowSuccessMessage('一時保存が完了しました。');
  }

  // 処理モーダルを閉じた後のページ遷移（完了・キャンセルどちらの場合も呼び出す）
  imWorkflow.transition.afterProcess();
});
```

## `flowId` と `userDataId` の使い分け

| 操作 | flowId | userDataId |
|------|--------|-----------|
| 新規一時保存 | 必須 | 空文字 or 省略 |
| 既存一時保存の更新 | 省略可 | 必須（前回保存時の戻り値） |

## `imWorkflow.transition.afterProcess()` について

一時保存モーダルが閉じた後（完了・キャンセルどちらの場合も）、必ず `imWorkflow.transition.afterProcess()` を呼び出すこと。IM-Workflow の標準ページ遷移処理（タスク一覧への戻り等）を実行する。

`showApply()` と異なり、一時保存完了後は多くの場合タスク一覧に戻るため `afterProcess()` が重要。

## 注意事項

- `imWorkflow.modal.showTemporarySave()` はクライアントサイドの API。サーバサイド（SSJS / Rhino）では使用不可
- `isProcessDone: true` の `data.userDataId` を保持しておくと、次回アクセス時に同じ下書きを再編集できる
- `showApply()` を呼び出す際に `userDataId` は渡せない。一時保存を本申請に変換する機能は `showApply()` モーダル内で提供される
