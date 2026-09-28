---
paths:
  - "src/main/jssp/**/*.js"
---

# JobSchedulerContext API リファレンス

## 概要

JobSchedulerContext は、ジョブスケジューラにより起動したジョブ実行時に利用可能なアクセスコンテキストである。
ジョブネット実行の全情報を格納する。

### 取得方法

```javascript
let jobSchedulerContext = Contexts.getJobSchedulerContext();
```

## プロパティ一覧

| プロパティ | 型 | 説明 |
|-----------|------|------|
| fireDate | Date | 実行日時 |
| jobDetail | JobDetail | ジョブ情報オブジェクト |
| jobnet | Jobnet | ジョブネット情報オブジェクト |
| mergedParameters | Object | ジョブ・ジョブネット・トリガ・実行時パラメータを優先度順にマージしたパラメータ |
| monitorId | String | モニタID |
| nextFireDate | Date | 次回実行日時 |
| parameters | Object | 実行中に追加されたパラメータ（ジョブ設定値は含まない） |
| previousFireDate | Date | 前回実行日時 |
| taskId | String | タスクID |
| trigger | Trigger | トリガ情報オブジェクト |

## メソッド一覧

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| getMergedParameters() | Object | 各パラメータを優先度順にマージして取得 |
| getParameter(key) | String | 指定キーのパラメータを優先度順に取得 |
| putParameter(key, value) | void | 実行中パラメータへ追加 |
| putParameters(parameters) | void | 実行中パラメータへ複数を一括追加 |

### パラメータ優先度

パラメータは以下の優先度で解決される（上が高い）。

1. 実行中に追加されたパラメータ
2. トリガのパラメータ
3. ジョブネットのパラメータ
4. ジョブのパラメータ

## メソッド詳細

### getParameter(key)

指定キーのパラメータを優先度に準じて取得する。

| パラメータ | 型 | 説明 |
|-----------|------|------|
| key | String | パラメータキー |

**戻り値**: String - パラメータ値

### putParameter(key, value)

実行中パラメータへ指定パラメータを追加する。追加されたパラメータは `getParameter()` で優先的に返却される。

| パラメータ | 型 | 説明 |
|-----------|------|------|
| key | String | パラメータキー |
| value | String | パラメータ値 |

### putParameters(parameters)

実行中パラメータへ複数のパラメータを一括追加する。

| パラメータ | 型 | 説明 |
|-----------|------|------|
| parameters | Object | パラメータオブジェクト（キーと値は文字列で指定） |

## 関連オブジェクト

### JobDetail

ジョブ定義の詳細情報を格納する。

| プロパティ | 型 | 説明 |
|-----------|------|------|
| id | String | ジョブID |
| categoryId | String | ジョブカテゴリID |
| jobType | String | ジョブ実行言語（`JAVA` または `SCRIPT`） |
| localizes | Object | 国際化情報（ロケール別の name, description） |
| parameters | Object | ジョブパラメータ |

### Jobnet

ジョブネット情報を格納する。

| プロパティ | 型 | 説明 |
|-----------|------|------|
| id | String | ジョブネットID |
| categoryId | String | ジョブネットカテゴリID |
| disallowConcurrent | Boolean | 並列実行不可の場合 `true` |
| jobIds | Array(String) | 実行ジョブ配列（実行順） |
| useJobIds | Array(String) | ジョブネットで利用するジョブIDの配列 |
| localizes | Object | 国際化情報（ロケール別の name, description） |
| parameters | Object | ジョブネットパラメータ |

### Trigger

トリガ情報オブジェクト。トリガ種別により以下の3つに分かれる。

- **DatetimeTrigger** - 日時指定トリガ
- **RepeatTrigger** - 繰り返し指定トリガ
- **BusinessDayTrigger** - 営業日指定トリガ

## 使用例

### パラメータの取得

```javascript
function init(request) {
  let context = Contexts.getJobSchedulerContext();

  // 優先度に準じたパラメータ取得
  let value = context.getParameter('KEY');

  // ジョブの設定パラメータを直接取得
  let jobParam = context.jobDetail.parameters.KEY;

  // マージされた全パラメータを取得
  let allParams = context.getMergedParameters();
}
```

### 実行中のパラメータ追加

```javascript
function init(request) {
  let context = Contexts.getJobSchedulerContext();

  // 単一パラメータの追加
  context.putParameter('resultKey', 'resultValue');

  // 複数パラメータの一括追加
  context.putParameters({
    'key1': 'value1',
    'key2': 'value2'
  });
}
```

### ジョブ実行情報の取得

```javascript
function init(request) {
  let context = Contexts.getJobSchedulerContext();

  let jobId = context.jobDetail.id;
  let jobnetId = context.jobnet.id;
  let monitorId = context.monitorId;
  let fireDate = context.fireDate;
  let nextFireDate = context.nextFireDate;
}
```
