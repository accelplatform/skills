# Job scheduler XML specification

Registers the **definitions** of jobs and jobnets (category / type / implementation path / jobnet composition).
The **implementation body** of the job (Java class or JSSP) must be prepared separately (see the `jssp-im-job-generator` skill).

## Namespace

```xml
<root xmlns="http://www.intra-mart.jp/job-scheduler/data">
  ...
</root>
```

## Components

Within a single file, **multiple `<im-job-scheduler-data>` blocks** are arranged. Each block defines one element (category / job / jobnet).

| Element | Content |
|------|------|
| `<job-category>` | Job category |
| `<job-detail>` | Job body (specifies type and implementation path) |
| `<jobnet-category>` | Jobnet category |
| `<jobnet>` | Jobnet (defines the execution order of multiple jobs) |

## Base file (`<key>-job-scheduler.xml`)

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

### Main fields of `<job-detail>`

| Element | Required | Content |
|------|------|------|
| `<category-id>` | YES | The ID of the `<job-category>` to which it belongs |
| `<job-type>` | YES | Two types: `JAVA` (Java class) or `SCRIPT` (JSSP) |
| `<job-path>` | YES | Implementation path. `JAVA` -> FQCN, `SCRIPT` -> relative path of the JSSP (without the `.js` extension; e.g., `file_exchange/common/job/completely_delete_expired_data`) |
| `<parameter key="...">` | NO | Job parameters (multiple can be specified). The `key` attribute specifies the key name, and the element body specifies the value |

#### Sample of SCRIPT type

```xml
<job-detail id="imexc-job-detail-completely-delete-expired-file">
  <category-id>imexc-job-category</category-id>
  <job-type>SCRIPT</job-type>
  <job-path>file_exchange/common/job/completely_delete_expired_data</job-path>
  <parameter key="retentionPeriod">365</parameter>
</job-detail>
```

When using the `SCRIPT` type, the job implementation must be created in the JSSP (`src/main/jssp/src/<job-path>.js`) specified by `<job-path>`. Use the `jssp-im-job-generator` skill for implementing the job program body.

### Main fields of `<jobnet>`

| Element | Required | Content |
|------|------|------|
| `<category-id>` | YES | The ID of the `<jobnet-category>` to which it belongs |
| `<disallowConcurrent>` | NO | `true` to prohibit concurrent execution |
| `<serialize>` | YES | The execution order of jobs (serialize multiple `<job-id>`) |

## Locale-specific files (`<key>-job-scheduler_<locale>.xml`)

Use the `<localize>` element to add display names. Correlate by the `id` attribute of `<job-category>` / `<job-detail>` / `<jobnet-category>` / `<jobnet>`.

```xml
<im-job-scheduler-data>
  <job-detail id="app-job-sample-batch">
    <localize locale="ja">
      <name>サンプルバッチ</name>
    </localize>
  </job-detail>
</im-job-scheduler-data>
```

### About the `<description>` element (important)

**Outputting an empty `<description></description>` causes the setup to fail with an XSD validation error (`cvc-complex-type.2.4.d`).** Therefore:

- **Do not write** `<description>` (default behavior)
- Only when you want to include a description, specify the `descriptions` field in spec.json (multilingual, per locale)

`<description>{value}</description>` is output only for locales for which the spec's `descriptions` is specified, and the `<description>` line does not appear for unspecified locales.

```xml
<!-- Output only when descriptions.ja is specified -->
<im-job-scheduler-data>
  <job-detail id="app-job-sample-batch">
    <localize locale="ja">
      <name>サンプルバッチ</name>
      <description>毎日深夜に売上データを集計するジョブ</description>
    </localize>
  </job-detail>
</im-job-scheduler-data>
```

## Description in spec.json

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
      "descriptions": { "ja": "毎日深夜の売上集計", "en": "...", "zh_CN": "..." }    // Optional
    }
  ],
  "jobnets": [
    {
      "id": "app-jobnet-sample-batch",
      "disallowConcurrent": true,
      "jobs": ["app-job-sample-batch"],
      "displayNames": { "ja": "サンプルバッチ", "en": "...", "zh_CN": "..." },
      "triggers": [                                       // Optional. Specifies the execution schedule
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

The value of `jobs[].path` is expanded as-is into `<job-path>`.

## Triggers (execution schedule)

The execution schedule of a jobnet is output as **a separate `<im-job-scheduler-data>` block** from the `<jobnet>` block, placed immediately after the `<jobnet>`.

```xml
<im-job-scheduler-data>
  <trigger id="<trigger ID>">
    <jobnet-id>{jobnet ID}</jobnet-id>
    <description>...</description>                 <!-- Optional (empty tags are not output) -->
    <enable>true|false</enable>                    <!-- Required -->
    <start-date>YYYY-MM-DDTHH:mm:ss.SSS+TZ</start-date>  <!-- Required, ISO 8601 -->
    <!-- Specify exactly one of the following -->
    <repeat>...</repeat>
    <datetime>...</datetime>
    <business-day>...</business-day>
  </trigger>
</im-job-scheduler-data>
```

### Trigger types

#### 1. `<repeat>` -- Simple repetition

| Child element | Content |
|---|---|
| `<count>` | Number of executions (optional) |
| `<interval>` | Execution interval (in seconds, optional) |

| count | interval | Behavior |
|---|---|---|
| 1 | - | Execute only once |
| 3 | 600 | A total of 3 times every 600 seconds |
| - | 3600 | Execute infinitely every 3600 seconds |

#### 2. `<datetime>` -- Calendar specification (specific time per month/week)

| Child element | Value range | Note |
|---|---|---|
| `<time-zone>` | `Asia/Tokyo` etc. | TZ string |
| `<months>` | **0-11** (**0-based**: 0=January, 3=April) | Multiple can be specified |
| `<days-of-month>` | 1-31 | Multiple can be specified |
| `<days-of-week>` | **1-7** (**1-based**: 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat) | Multiple can be specified |
| `<hours>` | 0-23 | Multiple can be specified |
| `<minutes>` | 0-59 | Multiple can be specified |

Example: Mon-Fri at 6, 12, and 18 o'clock 0 minutes -> `daysOfWeek: [2,3,4,5,6]`, `hours: [6,12,18]`, `minutes: [0]`

#### 3. `<business-day>` -- Calendar business-day specification

| Child element | Content |
|---|---|
| `<calendar-id>` | intra-mart's calendar ID (e.g., `JPN_CAL`) |
| `<time-zone>` | TZ string |
| `<hours>` | Execution hours (multiple can be specified) |
| `<minutes>` | Execution minutes (multiple can be specified) |

### Description of triggers in spec.json

```jsonc
"jobnets": [
  {
    "id": "app-jobnet-sample-batch",
    "displayNames": { ... },
    "jobs": ["..."],
    "triggers": [
      // Simple repetition
      {
        "id": "...",                                // Can be omitted. When omitted, auto-numbered as <jobnetId>_trigger_<N>
        "description": "1 回だけ",                  // Optional
        "enable": false,                            // Required
        "startDate": "2026-05-14T00:00:00.000+09:00", // Required (ISO 8601)
        "repeat": { "count": 1 }
      },
      // Calendar specification
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
      // Business-day specification
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

### Notes on triggers

- **Specify exactly one of `repeat` / `datetime` / `businessDay`** (when multiple are specified, the one found first in the priority order repeat -> datetime -> businessDay is adopted)
- When `description` is an empty string or unspecified, **the `<description>` line is not output** (for XSD validation)
- Auto-numbering when `id` is omitted: `<jobnetId>_trigger_<N>` (N is a 1-based sequential number)
- Triggers are **included only in the base file (`<key>-job-scheduler.xml`)**. They are not included in locale-specific files (`_ja` / `_en` / `_zh_CN`)
- A trigger with `enable: false` is registered but does not start. This is for use cases where it is registered as a template and enabled via the administration screen during operation

## Notes

- The Java class / JSSP referenced by `<job-path>` must **be placed before import**. If the class cannot be found, an error will occur during jobnet execution
- Job IDs are unique across all of intra-mart. The recommended operation is to add a prefix such as `<shortName>-job-...` per application
- When writing the **implementation body** of the job, use the `jssp-im-job-generator` skill (templates for `execute()` / returning `JobResult` / transaction management etc. are available)
- The **startup schedule** of the job (cron configuration) is not included in the import data. Configure it on the job scheduler administration screen after import
