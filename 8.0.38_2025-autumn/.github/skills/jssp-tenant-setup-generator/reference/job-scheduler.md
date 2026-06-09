# ジョブスケジューラ XML 仕様

ジョブ・ジョブネットの **定義**（カテゴリ / 種別 / 実装パス / ジョブネット構成）を登録する。
ジョブの**実装本体**（Java クラスや JSSP）は別途用意すること（`jssp-im-job-generator` スキル参照）。

## 名前空間

```xml
<root xmlns="http://www.intra-mart.jp/job-scheduler/data">
  ...
</root>
```

## 構成要素

1 つのファイル内に **複数の `<im-job-scheduler-data>` ブロック** を並べる。ブロック単位で 1 つの要素（カテゴリ / ジョブ / ジョブネット）を定義する。

| 要素 | 内容 |
|------|------|
| `<job-category>` | ジョブのカテゴリ |
| `<job-detail>` | ジョブ本体（タイプと実装パスを指定） |
| `<jobnet-category>` | ジョブネットのカテゴリ |
| `<jobnet>` | ジョブネット（複数ジョブの実行順序を定義） |

## 基底ファイル（`<key>-job-scheduler.xml`）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns="http://www.intra-mart.jp/job-scheduler/data">
  <im-job-scheduler-data>
    <job-category id="app-job-category">
    </job-category>
  </im-job-scheduler-data>

  <im-job-scheduler-data>
    <job-detail id="app-job-sample-batch">
      <category-id>app-job-category</category-id>
      <job-type>JAVA</job-type>
      <job-path>com.example.any_app.job.SampleBatchJob</job-path>
    </job-detail>
  </im-job-scheduler-data>

  <im-job-scheduler-data>
    <jobnet-category id="app-jobnet-category">
    </jobnet-category>
  </im-job-scheduler-data>

  <im-job-scheduler-data>
    <jobnet id="app-jobnet-sample-batch">
      <category-id>app-jobnet-category</category-id>
      <disallowConcurrent>true</disallowConcurrent>
      <serialize>
        <job-id>app-job-sample-batch</job-id>
      </serialize>
    </jobnet>
  </im-job-scheduler-data>
</root>
```

### `<job-detail>` の主要フィールド

| 要素 | 必須 | 内容 |
|------|------|------|
| `<category-id>` | YES | 所属する `<job-category>` の ID |
| `<job-type>` | YES | `JAVA`（Java クラス）または `SCRIPT`（JSSP）の 2 種類 |
| `<job-path>` | YES | 実装パス。`JAVA` → FQCN、`SCRIPT` → JSSP の相対パス（拡張子 `.js` なし、例: `file_exchange/common/job/completely_delete_expired_data`） |
| `<parameter key="...">` | NO | ジョブパラメータ（複数指定可）。`key` でキー名、要素本文で値を指定 |

#### SCRIPT 型のサンプル

```xml
<job-detail id="imexc-job-detail-completely-delete-expired-file">
  <category-id>imexc-job-category</category-id>
  <job-type>SCRIPT</job-type>
  <job-path>file_exchange/common/job/completely_delete_expired_data</job-path>
  <parameter key="retentionPeriod">365</parameter>
</job-detail>
```

`SCRIPT` 型を使う場合、`<job-path>` で指定した JSSP（`src/main/jssp/src/<job-path>.js`）にジョブ実装を作成する必要がある。ジョブプログラム本体の実装は `jssp-im-job-generator` スキルを使うこと。

### `<jobnet>` の主要フィールド

| 要素 | 必須 | 内容 |
|------|------|------|
| `<category-id>` | YES | 所属する `<jobnet-category>` の ID |
| `<disallowConcurrent>` | NO | `true` で多重起動禁止 |
| `<serialize>` | YES | 実行するジョブの順序（複数 `<job-id>` を直列化） |

## 言語別ファイル（`<key>-job-scheduler_<locale>.xml`）

`<localize>` 要素で表示名を付与する。`<job-category>` / `<job-detail>` / `<jobnet-category>` / `<jobnet>` の `id` 属性で対応付ける。

```xml
<im-job-scheduler-data>
  <job-detail id="app-job-sample-batch">
    <localize locale="ja">
      <name>サンプルバッチ</name>
    </localize>
  </job-detail>
</im-job-scheduler-data>
```

### `<description>` 要素について（重要）

**空の `<description></description>` を出力すると XSD バリデーションエラー（`cvc-complex-type.2.4.d`）でセットアップが失敗する。** そのため:

- `<description>` を **書かない**（デフォルト挙動）
- 説明文を入れたい場合のみ、spec.json で `descriptions` フィールドを指定する（多言語、ロケール別）

spec の `descriptions` を指定したロケールだけ `<description>{値}</description>` が出力され、未指定のロケールには `<description>` 行が出ない。

```xml
<!-- descriptions.ja を指定した場合のみ出力される -->
<im-job-scheduler-data>
  <job-detail id="app-job-sample-batch">
    <localize locale="ja">
      <name>サンプルバッチ</name>
      <description>毎日深夜に売上データを集計するジョブ</description>
    </localize>
  </job-detail>
</im-job-scheduler-data>
```

## spec.json での記述

```json
"jobScheduler": {
  "jobCategory":    { "id": "app-job-category",    "displayNames": { ... } },
  "jobnetCategory": { "id": "app-jobnet-category", "displayNames": { ... } },
  "jobs": [
    {
      "id": "app-job-sample-batch",
      "type": "JAVA",
      "path": "com.example.any_app.job.SampleBatchJob",
      "displayNames": { "ja": "サンプルバッチ", "en": "...", "zh_CN": "..." },
      "descriptions": { "ja": "毎日深夜の売上集計", "en": "...", "zh_CN": "..." }    // 任意
    }
  ],
  "jobnets": [
    {
      "id": "app-jobnet-sample-batch",
      "disallowConcurrent": true,
      "jobs": ["app-job-sample-batch"],
      "displayNames": { "ja": "サンプルバッチ", "en": "...", "zh_CN": "..." },
      "triggers": [                                       // 任意。実行スケジュールを指定
        {
          "description": "営業日の 8 時",
          "enable": true,
          "startDate": "2026-05-14T00:00:00.000+09:00",
          "businessDay": {
            "calendarId": "JPN_CAL",
            "timeZone": "Asia/Tokyo",
            "hours": [8],
            "minutes": [0]
          }
        }
      ]
    }
  ]
}
```

`jobs[].path` の指定がそのまま `<job-path>` に展開される。

## トリガー（実行スケジュール）

ジョブネットの実行スケジュールは、`<jobnet>` ブロックとは **別の `<im-job-scheduler-data>` ブロック** として、`<jobnet>` の直後に並べて出力される。

```xml
<im-job-scheduler-data>
  <trigger id="<トリガーID>">
    <jobnet-id>{ジョブネットID}</jobnet-id>
    <description>...</description>                 <!-- 任意（空タグは出力しない） -->
    <enable>true|false</enable>                    <!-- 必須 -->
    <start-date>YYYY-MM-DDTHH:mm:ss.SSS+TZ</start-date>  <!-- 必須、ISO 8601 -->
    <!-- 以下のいずれか 1 つを指定 -->
    <repeat>...</repeat>
    <datetime>...</datetime>
    <business-day>...</business-day>
  </trigger>
</im-job-scheduler-data>
```

### トリガー種別

#### 1. `<repeat>` — 単純繰り返し

| 子要素 | 内容 |
|---|---|
| `<count>` | 実行回数（任意） |
| `<interval>` | 実行間隔（秒、任意） |

| count | interval | 動作 |
|---|---|---|
| 1 | - | 1 回だけ実行 |
| 3 | 600 | 600 秒ごとに合計 3 回 |
| - | 3600 | 3600 秒ごとに無限に実行 |

#### 2. `<datetime>` — 暦指定（毎月/毎週の特定時刻）

| 子要素 | 値範囲 | 備考 |
|---|---|---|
| `<time-zone>` | `Asia/Tokyo` 等 | TZ 文字列 |
| `<months>` | **0-11**（**0 始まり**: 0=1月、3=4月） | 複数指定可 |
| `<days-of-month>` | 1-31 | 複数指定可 |
| `<days-of-week>` | **1-7**（**1 始まり**: 1=日, 2=月, 3=火, 4=水, 5=木, 6=金, 7=土） | 複数指定可 |
| `<hours>` | 0-23 | 複数指定可 |
| `<minutes>` | 0-59 | 複数指定可 |

例: 月～金の 6 時・12 時・18 時 0 分 → `daysOfWeek: [2,3,4,5,6]`, `hours: [6,12,18]`, `minutes: [0]`

#### 3. `<business-day>` — カレンダー営業日指定

| 子要素 | 内容 |
|---|---|
| `<calendar-id>` | intra-mart のカレンダー ID（例: `JPN_CAL`） |
| `<time-zone>` | TZ 文字列 |
| `<hours>` | 実行時（複数指定可） |
| `<minutes>` | 実行分（複数指定可） |

### spec.json での triggers 記述

```jsonc
"jobnets": [
  {
    "id": "app-jobnet-sample-batch",
    "displayNames": { ... },
    "jobs": ["..."],
    "triggers": [
      // 単純繰り返し
      {
        "id": "...",                                // 省略可。省略時は <jobnetId>_trigger_<N> で自動採番
        "description": "1 回だけ",                  // 任意
        "enable": false,                            // 必須
        "startDate": "2026-05-14T00:00:00.000+09:00", // 必須（ISO 8601）
        "repeat": { "count": 1 }
      },
      // 暦指定
      {
        "description": "月～金の 8 時",
        "enable": true,
        "startDate": "2026-05-14T00:00:00.000+09:00",
        "datetime": {
          "timeZone": "Asia/Tokyo",
          "daysOfWeek": [2, 3, 4, 5, 6],
          "hours": [8],
          "minutes": [0]
        }
      },
      // 営業日指定
      {
        "description": "営業日の 9 時",
        "enable": true,
        "startDate": "2026-05-14T00:00:00.000+09:00",
        "businessDay": {
          "calendarId": "JPN_CAL",
          "timeZone": "Asia/Tokyo",
          "hours": [9],
          "minutes": [0]
        }
      }
    ]
  }
]
```

### トリガーの注意事項

- **`repeat` / `datetime` / `businessDay` のいずれか 1 つだけを指定**（複数指定時は repeat → datetime → businessDay の優先順位で先に見つかったものを採用）
- `description` を空文字や未指定にすると **`<description>` 行は出力されない**（XSD バリデーション対策）
- `id` 省略時の自動採番: `<jobnetId>_trigger_<N>`（N は 1 始まりの連番）
- トリガーは **base ファイル（`<key>-job-scheduler.xml`）にのみ含まれる**。言語別ファイル (`_ja` / `_en` / `_zh_CN`) には含まれない
- `enable: false` のトリガーは登録されるが起動しない。テンプレートとして登録しておき、運用時に管理画面で有効化する用途

## 注意

- `<job-path>` で参照する Java クラス / JSSP は **インポート前に配置されている** こと。クラスが見つからないとジョブネット実行時にエラーになる
- ジョブ ID は intra-mart 全体で一意。アプリごとに `<shortName>-job-...` 等のプレフィクスを付ける運用を推奨
- ジョブの**実装本体**を書く場合は `jssp-im-job-generator` スキルを使うこと（execute() / JobResult 返却 / トランザクション管理等のテンプレートあり）
- ジョブの**起動スケジュール**（cron 設定）はインポートデータには含めない。インポート後にジョブスケジューラ管理画面で設定する
