# imWorkflow.modal.showApply API リファレンス

IM-Workflow の処理モーダル API。申請フォームからクライアントサイドで IM-Workflow の標準申請モーダルを起動する。

## インポート

申請画面の `<imart type="head">` 内に以下を記述する。`defer` 属性は必須。

```html
<script src="im_workflow/js/api_base.js" defer></script>
```

また、セキュアトークン用のメタタグを以下の形式で記述する。`name` 形式では動作しない点に注意。

```html
<meta http-equiv="X-Intramart-Secure-Token" content="<imart type="imSecureToken" mode="value" />"/>
```

## メソッド

### `imWorkflow.modal.showApply(parameter)`

申請処理モーダルを開く。

**戻り値**: `Promise<{ isProcessDone: boolean, data: { matterNumber: string, systemMatterId: string, userDataId: string } }>`

#### パラメータ

```javascript
imWorkflow.modal.showApply({
  processParameter: {
    flowId:     'flw_my_workflow',  // フロー ID（必須）
    matterName: '案件名'             // 案件名（必須）
  },
  optionalParameter: {
    userParameter: {                 // アクション処理に渡す業務データ（任意）
      key1: 'value1',
      key2: 'value2'
    }
  }
});
```

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `processParameter.flowId` | string | ✓ | IM-Workflow のフロー定義 ID |
| `processParameter.matterName` | string | ✓ | 申請案件名（一覧・検索画面に表示される） |
| `optionalParameter.userParameter` | Object | - | アクション処理に `userParam` として渡される業務データ |

#### 戻り値

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| `isProcessDone` | boolean | `true`: 申請が完了 / `false`: ユーザがモーダルを閉じた（キャンセル・一時保存等） |
| `data.matterNumber` | string | 申請済みの案件番号（`isProcessDone` が `true` のときのみ有効） |
| `data.systemMatterId` | string | システム案件 ID |
| `data.userDataId` | string | ユーザデータ ID |

#### 使用例

```javascript
document.getElementById('apply-button').addEventListener('click', async () => {
  // バリデーション
  if (!validateCurrentStep()) {
    return;
  }

  // 処理モーダルを開く
  const result = await imWorkflow.modal.showApply({
    processParameter: {
      flowId:     'flw_my_workflow',
      matterName: 'フォーム申請_' + document.getElementById(':formCode:').value
    },
    optionalParameter: {
      userParameter: {
        formCode:   document.getElementById(':formCode:').value,
        reason:     document.getElementById(':reason:').value
      }
    }
  });

  // 申請完了時の処理
  if (result && result.isProcessDone) {
    imuiShowSuccessMessage('申請が完了しました。案件番号: ' + result.data.matterNumber);
    clearForm();
  }
});
```

## アクション処理との連携

`optionalParameter.userParameter` に設定したオブジェクトは、アクション処理（`action_process.js`）の各関数の第2引数（`userParam`）として渡される。

```javascript
// アクション処理側（action_process.js）
function apply(parameter, userParam) {
  // userParam.formCode, userParam.reason で業務データを参照できる
  saveToMatterProperty(parameter, userParam);
}
```

`userParameter` のキー名は、アクション処理が参照するキー名と完全に一致させること。

## 注意事項

- `imWorkflow.modal.showApply()` はクライアントサイド（ブラウザ）の API であり、サーバサイド（SSJS / Rhino）では使用できない
- モーダルが表示中はページ操作がブロックされる（`await` で JS の実行が停止する）
- モーダルを閉じても例外は発生しない。`isProcessDone: false` が返るだけ
- ユーザが一時保存した場合は `isProcessDone: false` が返る（一時保存完了は `false`、申請完了のみ `true`）
- セキュアトークンのメタタグには `<meta name="im_secure_token">` 形式ではなく `<meta http-equiv="X-Intramart-Secure-Token">` 形式を使うこと
- 処理モーダル方式の申請画面は URL から直接アクセスされるスタンドアローン画面であるため、`routing-jssp-config` XML でのルーティング登録が必要
