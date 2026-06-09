# 作业调度器 XML 规范

注册作业、作业网络的**定义**（类别 / 种类 / 实现路径 / 作业网络构成）。
作业的**实现本体**（Java 类或 JSSP）需要另行准备（请参照 `jssp-im-job-generator` 技能）。

## 命名空间

```xml
<root xmlns="http://www.intra-mart.jp/job-scheduler/data">
  ...
</root>
```

## 构成元素

在一个文件内排列**多个 `<im-job-scheduler-data>` 块**。每个块以块为单位定义一个元素（类别 / 作业 / 作业网络）。

| 元素 | 内容 |
|------|------|
| `<job-category>` | 作业的类别 |
| `<job-detail>` | 作业本体（指定类型和实现路径） |
| `<jobnet-category>` | 作业网络的类别 |
| `<jobnet>` | 作业网络（定义多个作业的执行顺序） |

## 基础文件（`<key>-job-scheduler.xml`）

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

### `<job-detail>` 的主要字段

| 元素 | 必需 | 内容 |
|------|------|------|
| `<category-id>` | YES | 所属的 `<job-category>` 的 ID |
| `<job-type>` | YES | `JAVA`（Java 类）或 `SCRIPT`（JSSP）两种 |
| `<job-path>` | YES | 实现路径。`JAVA` → FQCN、`SCRIPT` → JSSP 的相对路径（不含扩展名 `.js`，例如：`file_exchange/common/job/completely_delete_expired_data`） |
| `<parameter key="...">` | NO | 作业参数（可指定多个）。`key` 指定键名，元素正文指定值 |

#### SCRIPT 类型的示例

```xml
<job-detail id="imexc-job-detail-completely-delete-expired-file">
  <category-id>imexc-job-category</category-id>
  <job-type>SCRIPT</job-type>
  <job-path>file_exchange/common/job/completely_delete_expired_data</job-path>
  <parameter key="retentionPeriod">365</parameter>
</job-detail>
```

使用 `SCRIPT` 类型时，需要在 `<job-path>` 指定的 JSSP（`src/main/jssp/src/<job-path>.js`）中创建作业实现。作业程序本体的实现请使用 `jssp-im-job-generator` 技能。

### `<jobnet>` 的主要字段

| 元素 | 必需 | 内容 |
|------|------|------|
| `<category-id>` | YES | 所属的 `<jobnet-category>` 的 ID |
| `<disallowConcurrent>` | NO | `true` 表示禁止重复启动 |
| `<serialize>` | YES | 执行的作业的顺序（将多个 `<job-id>` 串联） |

## 语言别文件（`<key>-job-scheduler_<locale>.xml`）

使用 `<localize>` 元素添加显示名。通过 `<job-category>` / `<job-detail>` / `<jobnet-category>` / `<jobnet>` 的 `id` 属性进行对应。

```xml
<im-job-scheduler-data>
  <job-detail id="app-job-sample-batch">
    <localize locale="ja">
      <name>サンプルバッチ</name>
    </localize>
  </job-detail>
</im-job-scheduler-data>
```

### 关于 `<description>` 元素（重要）

**输出空的 `<description></description>` 会导致 XSD 校验错误（`cvc-complex-type.2.4.d`），从而配置失败。** 因此：

- **不要写** `<description>`（默认行为）
- 仅在想加入描述时，在 spec.json 中指定 `descriptions` 字段（多语言、按 locale 区分）

仅对在 spec 的 `descriptions` 中指定的 locale 输出 `<description>{值}</description>`，未指定的 locale 则不输出 `<description>` 行。

```xml
<!-- 仅在指定了 descriptions.ja 时输出 -->
<im-job-scheduler-data>
  <job-detail id="app-job-sample-batch">
    <localize locale="ja">
      <name>サンプルバッチ</name>
      <description>毎日深夜に売上データを集計するジョブ</description>
    </localize>
  </job-detail>
</im-job-scheduler-data>
```

## spec.json 中的记述

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
      "triggers": [                                       // 任意。指定执行计划
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

`jobs[].path` 的指定会原样展开为 `<job-path>`。

## 触发器（执行计划）

作业网络的执行计划作为**与 `<jobnet>` 块不同的 `<im-job-scheduler-data>` 块**，紧接在 `<jobnet>` 后输出。

```xml
<im-job-scheduler-data>
  <trigger id="<触发器 ID>">
    <jobnet-id>{作业网络 ID}</jobnet-id>
    <description>...</description>                 <!-- 任意（空标签不输出） -->
    <enable>true|false</enable>                    <!-- 必需 -->
    <start-date>YYYY-MM-DDTHH:mm:ss.SSS+TZ</start-date>  <!-- 必需，ISO 8601 -->
    <!-- 指定以下其中之一 -->
    <repeat>...</repeat>
    <datetime>...</datetime>
    <business-day>...</business-day>
  </trigger>
</im-job-scheduler-data>
```

### 触发器种类

#### 1. `<repeat>` —— 简单重复

| 子元素 | 内容 |
|---|---|
| `<count>` | 执行次数（任意） |
| `<interval>` | 执行间隔（秒，任意） |

| count | interval | 动作 |
|---|---|---|
| 1 | - | 仅执行 1 次 |
| 3 | 600 | 每 600 秒共执行 3 次 |
| - | 3600 | 每 3600 秒无限执行 |

#### 2. `<datetime>` —— 日历指定（每月/每周的特定时刻）

| 子元素 | 取值范围 | 备注 |
|---|---|---|
| `<time-zone>` | `Asia/Tokyo` 等 | TZ 字符串 |
| `<months>` | **0-11**（**0 起始**：0=1月、3=4月） | 可指定多个 |
| `<days-of-month>` | 1-31 | 可指定多个 |
| `<days-of-week>` | **1-7**（**1 起始**：1=日、2=一、3=二、4=三、5=四、6=五、7=六） | 可指定多个 |
| `<hours>` | 0-23 | 可指定多个 |
| `<minutes>` | 0-59 | 可指定多个 |

示例：周一至周五的 6 时、12 时、18 时 0 分 → `daysOfWeek: [2,3,4,5,6]`、`hours: [6,12,18]`、`minutes: [0]`

#### 3. `<business-day>` —— 日历营业日指定

| 子元素 | 内容 |
|---|---|
| `<calendar-id>` | intra-mart 的日历 ID（例如：`JPN_CAL`） |
| `<time-zone>` | TZ 字符串 |
| `<hours>` | 执行时（可指定多个） |
| `<minutes>` | 执行分（可指定多个） |

### spec.json 中 triggers 的记述

```jsonc
"jobnets": [
  {
    "id": "app-jobnet-sample-batch",
    "displayNames": { ... },
    "jobs": ["..."],
    "triggers": [
      // 简单重复
      {
        "id": "...",                                // 可省略。省略时按 <jobnetId>_trigger_<N> 自动编号
        "description": "1 回だけ",                  // 任意
        "enable": false,                            // 必需
        "startDate": "2026-05-14T00:00:00.000+09:00", // 必需（ISO 8601）
        "repeat": { "count": 1 }
      },
      // 日历指定
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
      // 营业日指定
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

### 触发器的注意事项

- **`repeat` / `datetime` / `businessDay` 中仅指定一个**（指定多个时按 repeat → datetime → businessDay 的优先级采用首先找到的）
- `description` 为空字符串或未指定时，**`<description>` 行不输出**（XSD 校验对策）
- `id` 省略时的自动编号：`<jobnetId>_trigger_<N>`（N 为 1 起始的连号）
- 触发器**仅包含在 base 文件（`<key>-job-scheduler.xml`）中**。语言别文件（`_ja` / `_en` / `_zh_CN`）中不包含
- `enable: false` 的触发器会被注册但不启动。用于作为模板预先注册、在运行时通过管理界面启用的用途

## 注意

- `<job-path>` 引用的 Java 类 / JSSP 必须**在导入前已部署**。如果找不到类，作业网络执行时将出错
- 作业 ID 在 intra-mart 整个系统中唯一。建议按应用添加 `<shortName>-job-...` 等前缀的运用方式
- 编写作业的**实现本体**时请使用 `jssp-im-job-generator` 技能（提供 execute() / JobResult 返回 / 事务管理等的模板）
- 作业的**启动计划**（cron 配置）不包含在导入数据中。导入后请在作业调度器管理界面进行配置
