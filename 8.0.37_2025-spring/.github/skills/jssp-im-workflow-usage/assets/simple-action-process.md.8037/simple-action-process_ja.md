# ワークフロー アクション処理テンプレート

## 概要

IM-Workflow のアクション処理プログラムのテンプレート。
画面を持たず、ワークフローの各処理（申請・承認・否認・差戻し等）のタイミングで実行されるバッチ的な処理である。
各関数は parameter（ワークフローパラメータ）と userParam（ユーザデータ）を受け取り、処理結果を返却する。

**注意**: このプログラム中では DB トランザクションを張らないこと。

## ファイル構成

```
src/main/jssp/src/{機能名}/workflow/
  └── action/
      └── action_process.js     # アクション処理
```

---

## parameter（ワークフローパラメータ）

| プロパティ | 型 | 説明 |
|-----------|------|------|
| loginGroupId | String | ログイングループID（非推奨。テナントID と同値） |
| localeId | String | ロケールID |
| targetLocales | String | ターゲットロケールID |
| contentsId | String | コンテンツID |
| contentsVersionId | String | コンテンツバージョンID |
| routeId | String | ルートID |
| routeVersionId | String | ルートバージョンID |
| flowId | String | フローID |
| flowVersionId | String | フローバージョンID |
| applyBaseDate | String | 申請基準日 |
| processDate | String | 処理日/到達日 |
| systemMatterId | String | システム案件ID |
| userDataId | String | ユーザデータID |
| matterName | String | 案件名 |
| matterNumber | String | 案件番号 |
| priorityLevel | String | 優先度 |
| parameter | String | 実行プログラムパス |
| actFlag | String | 代理フラグ |
| nodeId | String | ノードID |
| nextNodeIds | String | 移動先ノードID（差戻し・引戻し・案件操作時に設定） |
| authUserCd | String | 処理権限者コード |
| execUserCd | String | 処理実行者コード |
| resultStatus | String | 処理結果ステータス |
| authCompanyCode | String | 権限会社コード |
| authOrgzSetCode | String | 権限組織セットコード |
| authOrgzCode | String | 権限組織コード |
| processComment | String | 処理コメント |
| lumpProcessFlag | String | 一括処理フラグ |
| autoProcessFlag | String | 自動処理フラグ（自動承認やバッチ自動処理時に設定） |
| DCNodeConfigModels | Object | 動的・確認ノード設定情報（申請・未申請状態からの申請・再申請・承認時に設定） |
| HVNodeConfigModels | Object | 横配置・縦配置ノード設定情報（申請・未申請状態からの申請・再申請・承認時に設定） |
| branchSelectModels | Object | 分岐先選択情報（申請・未申請状態からの申請・再申請・承認時に設定） |

## 返却値

| プロパティ | 型 | 説明 |
|-----------|------|------|
| resultFlag | Boolean | 結果フラグ（`true`: 成功 / `false`: 失敗） |
| message | String | 結果メッセージ（失敗の場合のみ） |
| data | String | 案件番号（最大20バイト。申請/再申請系のみ。`null` 以外の場合に案件番号を上書き） |

## 関数一覧

| 関数名 | 処理タイミング | data 返却 |
|--------|--------------|-----------|
| apply | 申請 | あり（案件番号上書き可） |
| reapply | 再申請 | あり |
| applyFromTempSave | 申請（一時保存案件） | あり |
| applyFromUnapply | 申請（未申請状態案件） | あり |
| approve | 承認 | なし |
| approveEnd | 承認終了 | なし |
| deny | 否認 | なし |
| sendBack | 差戻し | なし |
| pullBack | 引戻し | なし |
| sendBackToPullBack | 差戻し後引戻し | なし |
| discontinue | 取止め | なし |
| reserve | 保留 | なし |
| reserveCancel | 保留解除 | なし |
| matterHandle | 案件操作 | なし |
| tempSaveCreate | 一時保存（新規登録） | なし |
| tempSaveUpdate | 一時保存（更新） | なし |
| tempSaveDelete | 一時保存（削除） | なし |

---

## アクション処理（action_process.js）

```javascript
/**
 * ワークフロー アクション処理
 *
 * @file action_process.js
 * @description ワークフローの各処理タイミングで実行されるアクション処理プログラムです。
 *              このプログラム中では DB トランザクションを張らないでください。
 */

// ========================================
// 申請系
// ========================================
/**
 * 申請処理を実行します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 * @param {Object} userParam - ユーザデータ
 * @return {Object} 処理結果
 */
function apply(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: '',
        data: null
    };
    logger.info('[apply] 申請処理開始 systemMatterId={}', parameter.systemMatterId);
    try {
        result.data = createMatterNumber();
        processBusinessLogic('apply', parameter, userParam);
        logger.info('[apply] 申請処理完了 systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[apply] エラーが発生しました。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 再申請処理を実行します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 * @param {Object} userParam - ユーザデータ
 * @return {Object} 処理結果
 */
function reapply(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: '',
        data: null
    };
    logger.info('[reapply] 再申請処理開始 systemMatterId={}', parameter.systemMatterId);
    try {
        processBusinessLogic('reapply', parameter, userParam);
        logger.info('[reapply] 再申請処理完了 systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[reapply] エラーが発生しました。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 申請（一時保存案件）処理を実行します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 * @param {Object} userParam - ユーザデータ
 * @return {Object} 処理結果
 */
function applyFromTempSave(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: '',
        data: null
    };
    logger.info('[applyFromTempSave] 申請（一時保存案件）処理開始 systemMatterId={}', parameter.systemMatterId);
    try {
        result.data = createMatterNumber();
        processBusinessLogic('applyFromTempSave', parameter, userParam);
        logger.info('[applyFromTempSave] 申請（一時保存案件）処理完了 systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[applyFromTempSave] エラーが発生しました。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 申請（未申請状態案件）処理を実行します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 * @param {Object} userParam - ユーザデータ
 * @return {Object} 処理結果
 */
function applyFromUnapply(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: '',
        data: null
    };
    logger.info('[applyFromUnapply] 申請（未申請状態案件）処理開始 systemMatterId={}', parameter.systemMatterId);
    try {
        result.data = createMatterNumber();
        processBusinessLogic('applyFromUnapply', parameter, userParam);
        logger.info('[applyFromUnapply] 申請（未申請状態案件）処理完了 systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[applyFromUnapply] エラーが発生しました。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 案件番号を採番します。
 *
 * @return {String} 案件番号
 */
function createMatterNumber() {
    let result = WorkflowNumberingManager.getNumber();
    if (!result.resultFlag) {
        throw new Error('案件番号の採番に失敗しました。');
    }

    return result.data;
}

// ========================================
// 承認系
// ========================================
/**
 * 承認処理を実行します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 * @param {Object} userParam - ユーザデータ
 * @return {Object} 処理結果
 */
function approve(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('approve', parameter, userParam);
    } catch (e) {
        logger.error('[approve] エラーが発生しました。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 承認終了処理を実行します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 * @param {Object} userParam - ユーザデータ
 * @return {Object} 処理結果
 */
function approveEnd(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('approveEnd', parameter, userParam);
    } catch (e) {
        logger.error('[approveEnd] エラーが発生しました。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 否認処理を実行します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 * @param {Object} userParam - ユーザデータ
 * @return {Object} 処理結果
 */
function deny(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('deny', parameter, userParam);
    } catch (e) {
        logger.error('[deny] エラーが発生しました。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 差戻し処理を実行します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 * @param {Object} userParam - ユーザデータ
 * @return {Object} 処理結果
 */
function sendBack(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('sendBack', parameter, userParam);
    } catch (e) {
        logger.error('[sendBack] エラーが発生しました。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

// ========================================
// 引戻し系
// ========================================
/**
 * 引戻し処理を実行します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 * @param {Object} userParam - ユーザデータ
 * @return {Object} 処理結果
 */
function pullBack(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('pullBack', parameter, userParam);
    } catch (e) {
        logger.error('[pullBack] エラーが発生しました。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 差戻し後引戻し処理を実行します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 * @param {Object} userParam - ユーザデータ
 * @return {Object} 処理結果
 */
function sendBackToPullBack(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('sendBackToPullBack', parameter, userParam);
    } catch (e) {
        logger.error('[sendBackToPullBack] エラーが発生しました。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

// ========================================
// 取止め・保留系
// ========================================
/**
 * 取止め処理を実行します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 * @param {Object} userParam - ユーザデータ
 * @return {Object} 処理結果
 */
function discontinue(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('discontinue', parameter, userParam);
    } catch (e) {
        logger.error('[discontinue] エラーが発生しました。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 保留処理を実行します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 * @param {Object} userParam - ユーザデータ
 * @return {Object} 処理結果
 */
function reserve(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('reserve', parameter, userParam);
    } catch (e) {
        logger.error('[reserve] エラーが発生しました。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 保留解除処理を実行します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 * @param {Object} userParam - ユーザデータ
 * @return {Object} 処理結果
 */
function reserveCancel(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('reserveCancel', parameter, userParam);
    } catch (e) {
        logger.error('[reserveCancel] エラーが発生しました。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

// ========================================
// 案件操作
// ========================================
/**
 * 案件操作処理を実行します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 * @param {Object} userParam - ユーザデータ
 * @return {Object} 処理結果
 */
function matterHandle(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('matterHandle', parameter, userParam);
    } catch (e) {
        logger.error('[matterHandle] エラーが発生しました。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

// ========================================
// 一時保存系
// ========================================
/**
 * 一時保存（新規登録）処理を実行します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 * @param {Object} userParam - ユーザデータ
 * @return {Object} 処理結果
 */
function tempSaveCreate(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };
    logger.info('[tempSaveCreate] 一時保存（新規登録）処理開始 systemMatterId={}', parameter.systemMatterId);
    try {
        processBusinessLogic('tempSaveCreate', parameter, userParam);
        logger.info('[tempSaveCreate] 一時保存（新規登録）処理完了 systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[tempSaveCreate] エラーが発生しました。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 一時保存（更新）処理を実行します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 * @param {Object} userParam - ユーザデータ
 * @return {Object} 処理結果
 */
function tempSaveUpdate(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };
    logger.info('[tempSaveUpdate] 一時保存（更新）処理開始 systemMatterId={}', parameter.systemMatterId);
    try {
        processBusinessLogic('tempSaveUpdate', parameter, userParam);
        logger.info('[tempSaveUpdate] 一時保存（更新）処理完了 systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[tempSaveUpdate] エラーが発生しました。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 一時保存（削除）処理を実行します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 * @param {Object} userParam - ユーザデータ
 * @return {Object} 処理結果
 */
function tempSaveDelete(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('tempSaveDelete', parameter, userParam);
    } catch (e) {
        logger.error('[tempSaveDelete] エラーが発生しました。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

// ========================================
// ビジネスロジック
// ========================================
/**
 * ビジネスロジックのメイン処理を実行します。
 * 各アクション関数から呼び出されます。
 *
 * @param {String} actionType - アクション種別
 * @param {Object} parameter - ワークフローパラメータ
 * @param {Object} userParam - ユーザデータ
 */
function processBusinessLogic(actionType, parameter, userParam) {
    // TODO: ここで actionType に応じたビジネスロジックを実装してください
    //
    // 利用可能な主要パラメータ:
    //   parameter.systemMatterId  - システム案件ID
    //   parameter.userDataId      - ユーザデータID
    //   parameter.authUserCd      - 処理権限者コード
    //   parameter.execUserCd      - 処理実行者コード
    //   parameter.processComment  - 処理コメント

    // 案件プロパティにユーザデータを保存
    saveToMatterProperty(parameter, userParam);
}

/**
 * 案件プロパティにユーザデータを保存します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 * @param {Object} userParam - ユーザデータ
 */
function saveToMatterProperty(parameter, userParam) {
    let matterPropertyInfo = [{
        userDataId         : parameter.userDataId,
        matterPropertyKey  : 'partCode',
        matterPropertyValue: userParam.partCode
    }, {
        userDataId         : parameter.userDataId,
        matterPropertyKey  : 'partName',
        matterPropertyValue: userParam.partName
    }, {
        userDataId         : parameter.userDataId,
        matterPropertyKey  : 'unitPrice',
        matterPropertyValue: userParam.unitPrice
    }, {
        userDataId         : parameter.userDataId,
        matterPropertyKey  : 'quantity',
        matterPropertyValue: userParam.quantity
    }, {
        userDataId         : parameter.userDataId,
        matterPropertyKey  : 'totalAmount',
        matterPropertyValue: String(Number(userParam.unitPrice) * Number(userParam.quantity))
    }];

    let property = new UserActvMatterPropertyValue();
    let result = property.createMatterProperty(matterPropertyInfo);
    if (!result.resultFlag) {
        throw new Error('案件プロパティの保存に失敗しました。');
    }
}
```

---

## 案件プロパティ

### 概要

案件プロパティとは、ワークフローの案件に紐づくキー・バリュー形式のユーザ定義データである。
IM-Workflow が管理するテーブル `imw_t_user_data` に `userDataId`（ユーザデータID）をキーとして保存される。

アクション処理（`apply` / `approve` 等）の中で `UserActvMatterPropertyValue` API を使って登録・更新する。

### 目的

案件プロパティの主な目的は、**ワークフロー標準一覧画面への項目表示** である。

IM-Workflow の標準一覧画面（未処理一覧・処理済一覧・案件一覧等）に、申請データの内容（金額・件名・申請者部署など）を列として表示するには、案件プロパティとして保存する必要がある。
案件プロパティに保存した値は、管理者画面の「案件プロパティ定義」で一覧の表示列として設定できる。

### 使用するかどうかの判定基準

以下の条件を満たす場合は、案件プロパティを使用する。
- ルールの条件分岐判定で使用したい場合
  - 例: 合計金額が５万円を超える場合は、別途社長決裁が必要
  - 例: 宿泊を伴う出張旅費申請の場合は、別途経理部門の承認が必要
- 申請・承認一覧画面の案件一覧の項目として値を表示したい場合

### 注意点

案件プロパティ値の最大桁数
- `matter_property_value` カラムは **VARCHAR(2000)**（2000文字）である
- サロゲートペア文字を含む場合、UTF-8 で最大約 8000 バイトになる
- PostgreSQL 環境ではインデックスサイズ上限により、案件完了時（`imw_t_cpl_matter_user_data` への移行時）にエラーが発生する場合がある
- 長文テキストを案件プロパティに保存する場合は、文字数に注意する

### 案件プロパティを使わずにユーザデータを保存する方法

案件プロパティが不要な場合や、桁数制限などで案件プロパティが使用できない場合は、アクション処理内で独自テーブルに直接保存する。
`parameter.systemMatterId` または `parameter.userDataId` を外部キーとして使用することで、後から案件と紐づけてデータを取得できる。

```javascript
function processBusinessLogic(actionType, parameter, userParam) {
  // 独自テーブルに保存する例
  let db = new TenantDatabase();
  let sql = 'INSERT INTO my_order_data'
      + ' (system_matter_id, user_data_id, part_code, part_name, unit_price, quantity)'
      + ' VALUES (?, ?, ?, ?, ?, ?)';
  let params = [
    DbParameter.string(parameter.systemMatterId),
    DbParameter.string(parameter.userDataId),
    DbParameter.string(userParam.partCode),
    DbParameter.string(userParam.partName),
    DbParameter.number(Number(userParam.unitPrice)),
    DbParameter.number(Number(userParam.quantity))
  ];
  let result = db.execute(sql, params);
  if (result.error) {
    throw new Error('データの保存に失敗しました。');
  }
}
```

この方法の場合、一覧表示には独自画面を作成するか、承認画面から `userDataId` をキーに独自テーブルを検索してデータを表示する。
案件プロパティとデータベースを使用したユーザデータの保存は併用可能。

---

## 使用可能なテンプレート

- **アクション処理**: [assets/simple-action.md](assets/simple-action.md)
  - ワークフローの各処理タイミングで実行されるバッチ的な処理
  - 申請・承認・否認・差戻し等の全17関数を網羅
  - DB トランザクションは張らないこと

### 生成時の指示例

ユーザが「ワークフローのアクション処理を作成して」と依頼した場合、この assets のコードを参考にして適切にカスタマイズして生成する。

### 生成時の注意事項

#### 関数シグネチャは必ず2引数 `(parameter, userParam)`

アクション処理の全関数は **`(parameter, userParam)` の2引数** で定義すること。
IM-Workflow エンジンは第1引数にワークフローパラメータ、第2引数にフォームの入力値（hidden フィールドの name/value）を渡す。

```javascript
// OK: 2引数で受け取る
function apply(parameter, userParam) {
  let vendorId = userParam.vendorId;  // フォームの hidden フィールドの値
}

// NG: 1引数で parameter.userParameter にアクセス → undefined
function apply(parameter) {
  let vendorId = parameter.userParameter.vendorId;  // エラー
}
```

#### `executeByTemplate` のパラメータキーは SQL テンプレートのバインド変数名と一致させる

2WaySQL テンプレートのバインド変数名（`/*user_data_id*/`, `/*vendor_id*/` 等）と、`executeByTemplate` に渡すパラメータオブジェクトのキー名は **完全一致** しなければならない。
SQL がスネークケース（`user_data_id`）なら、JS 側もスネークケースで渡すこと。

```javascript
// OK: SQL の /*user_data_id*/ と一致
db.executeByTemplate('/purchase/sql/select_request', {
  user_data_id: DbParameter.string(userDataId)
});

// NG: キャメルケースで渡している → "user_data_id" is not defined エラー
db.executeByTemplate('/purchase/sql/select_request', {
  userDataId: DbParameter.string(userDataId)
});
```

#### 案件番号の採番は必須

仕様書で案件番号のフォーマットが指定されていない場合でも、`apply` 関数内で `WorkflowNumberingManager.getNumber()` を使って案件番号を採番し、`result.data` にセットすること。
案件番号が未採番だと、IM-Workflow の一覧画面で案件を特定しにくくなる。

- `apply` — 新規申請時に採番する
- `applyFromTempSave` / `applyFromUnapply` — `apply` に委譲している場合は自動的に採番される
- `reapply` — 再申請時は既に案件番号が存在するため採番しない（`data: null`）

```javascript
function apply(parameter, userParam) {
  let result = { resultFlag: true, message: '', data: null };
  try {
    result.data = createMatterNumber();  // 案件番号の採番
    // ... ビジネスロジック ...
  } catch (e) { /* ... */ }
  return result;
}

function createMatterNumber() {
  let result = WorkflowNumberingManager.getNumber();
  if (!result.resultFlag) {
    throw new Error('案件番号の採番に失敗しました。');
  }
  return result.data;
}
```

#### userParam の値は全て文字列型

`userParam`（画面フォームから渡されるユーザデータ）の値は **全て文字列型** である。
`DbParameter.number()` に渡す場合は、必ず `Number()` で数値に変換してから渡すこと。
変換せずに文字列のまま渡すと `IllegalArgumentException: Data must be Number or null in case TYPE_NUMBER specified.` が発生する。

```javascript
// NG: userParam の値は文字列なので DbParameter.number() が例外を投げる
DbParameter.number(userParam.unitPrice)

// OK: Number() で変換してから渡す
DbParameter.number(Number(userParam.unitPrice))
```

#### apply / applyFromUnapply でのデータ保存

`apply` 関数でユーザデータ（業務テーブル）に INSERT する場合、**引き戻し後の再申請（`applyFromUnapply`）では既にデータが存在する**ことに注意すること。

- 引き戻し: 申請者が申請を引き戻す → 案件は「未申請状態」に戻る
- 再申請: 未申請状態の案件を再度申請 → **`applyFromUnapply` が呼ばれる**
- `applyFromUnapply` を `apply` に委譲している場合、`apply` 内の INSERT が一意制約違反になる

**対策:** `apply` 内でデータの INSERT 前に既存データの有無を判定し、INSERT / UPDATE を切り替える。

```javascript
function apply(parameter, userParam) {
  // ...
  saveLeaveRequest(parameter, userParam);  // INSERT or UPDATE
  // ...
}

function saveLeaveRequest(parameter, userParam) {
  let db = new TenantDatabase();
  let checkSql = 'SELECT COUNT(*) AS record_count FROM your_table WHERE user_data_id = ?';
  let checkResult = db.select(checkSql, [DbParameter.string(parameter.userDataId)]);
  let exists = checkResult.isSuccess() && checkResult.data.length > 0 &&
    (parseInt(checkResult.data[0].record_count, 10) || 0) > 0;

  if (exists) {
    updateRecord(parameter, userParam);
  } else {
    insertRecord(parameter, userParam);
  }
}
```
