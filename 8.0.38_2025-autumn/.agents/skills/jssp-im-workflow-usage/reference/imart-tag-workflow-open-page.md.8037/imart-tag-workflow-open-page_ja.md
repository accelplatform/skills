# IMART workflowOpenPage タグ リファレンス

## 概要

`<imart type="workflowOpenPage">` は、ワークフロー処理を実行する画面を表示するための HTML フォームタグを生成するタグである。
申請・一時保存・再申請・処理・確認の各画面に対応する。

`<imart type="workflowOpenPageCsjs" />` タグと併せて使用し、クライアントサイド JavaScript 関数 `workflowOpenPage(pageType, callback)` を呼び出して画面を表示する。

## 画面種別（pageType）

| 値 | 説明 |
|------|------|
| `"0"` | 申請画面 |
| `"1"` | 一時保存画面 |
| `"2"` | 申請（起票案件）画面 |
| `"3"` | 再申請画面 |
| `"4"` | 処理画面 |
| `"5"` | 確認画面 |

## 属性一覧

### 必須属性

| 属性 | 型 | 説明 |
|------|------|------|
| imwApplyBaseDate | String | 申請基準日（`yyyy/MM/dd` 形式）。申請・一時保存画面で必須 |
| imwFlowId | String | フローID。申請・一時保存画面で必須 |
| imwSystemMatterId | String | システム案件ID。起票案件・再申請・処理・確認画面で必須 |
| method | String | FORM タグの method 属性 |

### オプション属性

| 属性 | 型 | デフォルト | 説明 |
|------|------|-----------|------|
| imwAuthUserCode | String | - | 権限者コード（代理元ユーザコード） |
| imwUserDataId | String | - | ユーザデータID。一時保存画面で必須 |
| imwNodeId | String | - | ノードID |
| imwCallOriginalParams | String | - | 呼出元パラメータ。「戻る」ボタンや処理完了後の遷移時にリクエストパラメータとして使用 |
| imwNextScriptPath | String | - | 遷移先スクリプトパス（スクリプト開発モデル用） |
| imwNextApplicationId | String | - | 遷移先アプリケーションID（JavaEE 開発モデル用） |
| imwNextServiceId | String | - | 遷移先サービスID（JavaEE 開発モデル用） |
| imwNextPagePath | String | - | 遷移先ページパス（JSP/Servlet 用） |
| name | String | - | FORM タグの name 属性 |
| target | String | `_top` | FORM タグの target 属性 |
| useContextPath | String | `"true"` | URL 生成時にコンテキストパスを含めるか |

### 画面種別ごとの必須属性

| 属性 | 申請(0) | 一時保存(1) | 起票案件(2) | 再申請(3) | 処理(4) | 確認(5) |
|------|:---:|:---:|:---:|:---:|:---:|:---:|
| imwApplyBaseDate | ○ | ○ | - | - | - | - |
| imwFlowId | ○ | ○ | - | - | - | - |
| imwSystemMatterId | - | - | ○ | ○ | ○ | ○ |
| imwUserDataId | - | ○ | - | - | - | - |

## 遷移先パラメータ

遷移先は以下の3パターンから1つを指定する。すべて未指定の場合、処理完了後に画面を閉じて終了する。

| 開発モデル | 使用する属性 |
|-----------|-------------|
| スクリプト開発 | `imwNextScriptPath` |
| JavaEE 開発 | `imwNextApplicationId` + `imwNextServiceId` |
| JSP/Servlet | `imwNextPagePath` |

## 使用例

### プレゼンテーションページ

```html
<imart type="head">
  <!-- ワークフロー画面遷移用 CSJS -->
  <imart type="workflowOpenPageCsjs" />
</imart>

<!-- ワークフロー画面呼び出し用フォーム -->
<imart type="workflowOpenPage"
    name="workflowOpenPageForm"
    method="POST"
    target="_top"
    imwAuthUserCode=imwAuthUserCode
    imwSystemMatterId=imwSystemMatterId
    imwUserDataId=imwUserDataId
    imwNodeId=imwNodeId
    imwApplyBaseDate=imwApplyBaseDate
    imwFlowId=imwFlowId
    imwCallOriginalParams=imwCallOriginalParams
    imwNextScriptPath=imwNextScriptPath
    imwNextApplicationId=imwNextApplicationId
    imwNextServiceId=imwNextServiceId
    imwNextPagePath=imwNextPagePath>

  <!-- ユーザデータ -->
  <input type="hidden" name="user_data_1" value="foo">
  <input type="hidden" name="user_data_2" value="bar">

  <!-- 処理ボタン -->
  <input type="button" value="申請" onclick="workflowOpenPage('0')" />
  <input type="button" value="処理" onclick="workflowOpenPage('4')" />
  <input type="button" value="確認" onclick="workflowOpenPage('5')" />
</imart>
```

### JavaScript 関数呼び出し

```javascript
// 申請画面を表示
workflowOpenPage('0');

// 処理画面を表示（コールバック付き）
workflowOpenPage('4', 'onWorkflowClose');

// コールバック関数（処理画面が閉じられた際に呼び出される）
function onWorkflowClose() {
  // 画面を閉じた後の処理
  location.reload();
}
```

## 注意事項

- `<imart type="workflowOpenPageCsjs" />` タグを `<head>` 内に配置すること（CSJS 関数の読み込みに必要）
- `callback` 引数は省略可能。指定された関数が存在しない場合は実行されない
- `useContextPath="true"` の場合は `/imart/aaa/bbb` 形式、`"false"` の場合は `aaa/bbb` 形式で URL が出力される
- `imwNextPagePath` / `imwNextApplicationId` + `imwNextServiceId` を使用する場合は SafeUrlManager への登録が必要
