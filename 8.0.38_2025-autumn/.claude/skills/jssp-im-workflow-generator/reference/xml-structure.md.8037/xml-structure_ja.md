# IM-Workflow インポート XML 構造リファレンス

## 概要

IM-Workflow のインポート XML は、ワークフロー定義を一括でインポートするための XML ファイルである。
エンコーディングは `UTF-16`、ルート要素は `<data>` で、各定義要素は `type` 属性で値の型を示す。

### XML 特殊文字のエスケープ

XML の要素値に特殊文字を含める場合は、必ずエスケープすること。
エスケープを怠るとインポート時に SAXParseException が発生する。

| 文字 | エスケープ | よくある混入箇所 |
|------|-----------|----------------|
| `<` | `&lt;` | ルール名の条件式（例: `Amount<10000` → `Amount&lt;10000`） |
| `>` | `&gt;` | ルール名の条件式（例: `Amount>=50000` → `Amount&gt;=50000`） |
| `&` | `&amp;` | 名称に `&` を含む場合 |
| `"` | `&quot;` | 属性値内 |
| `'` | `&apos;` | 属性値内 |

**特に注意:** ルール名（`ruleName`）に比較演算子を含めると高確率で混入する。
日本語名（例: `単価20000未満`）には問題ないが、英語名（例: `UnitPrice<20000`）で発生しやすい。

## 全体構造

```xml
<?xml version="1.0" encoding="UTF-16"?>
<data>
  <contents id="{contentsId}">...</contents>      <!-- コンテンツ定義 -->
  <route id="{routeId}">...</route>                <!-- ルート定義 -->
  <flow id="{flowId}">...</flow>                   <!-- フロー定義 -->
  <matter_property id="{key}">...</matter_property> <!-- 案件プロパティ（Phase 2） -->
  <rule id="{ruleId}">...</rule>                   <!-- 分岐ルール（Phase 2） -->
  <mail id="{mailId}">...</mail>                   <!-- メール通知（Phase 3） -->
  <imBox id="{imBoxId}">...</imBox>                <!-- IMBox通知（Phase 3） -->
  <list_pattern id="{patternId}">...</list_pattern> <!-- 一覧パターン（Phase 3） -->
  <message_template id="{templateId}">...</message_template> <!-- メッセージ（Phase 3） -->
</data>
```

**重要: `<data>` 直下のタグ名は上記の通り厳守すること。**
独自のタグ名（例: `<contentsDataList>`, `<routeDataList>`, `<contentsData>`, `<contentsVersion>` 等）を使用してはならない。
IM-Workflow のインポーターは上記の固定タグ名のみを認識する。
各定義要素の内部構造も、後述のプロパティ名（`contentsId`, `routeId`, `flowId`, `details`, `pages` 等）をそのまま使用すること。

## 型属性

XML の各要素は `type` 属性で値の型を明示する。

| type 値 | 意味 | 例 |
|---------|------|-----|
| `string` | 文字列 | `<flowId type="string">flow_01</flowId>` |
| `number` | 数値 | `<x type="number">50</x>` |
| `array` | 配列 | `<value type="array"><value type="object">...</value></value>` |
| `object` | オブジェクト | `<value type="object"><key type="string">val</key></value>` |
| `null` | null 値 | `<note type="null" />` |

## ロケール構造

すべての定義要素は 3 ロケール（`en`, `ja`, `zh_CN`）分を `<value type="array">` で並べる。
ロケールごとに `localeId` を持ち、名称等をローカライズする。

### 多言語対応する項目・しない項目

| 項目 | 多言語対応 | 説明 |
|------|-----------|------|
| contentsName | する | コンテンツ名 |
| routeName | する | ルート名 |
| flowName | する | フロー名 |
| pageName | する | 画面名 |
| ruleName | する | ルール名 |
| matterPropertyName | する | 案件プロパティ名 |
| **nodeName** | **しない** | **全ロケールで同一の英語名を使用すること** |

**重要: `nodeName`（ノード名）は多言語対応しない。**
IM-Workflow のルートエディタ上でノード名は言語に関係なく共通表示されるため、全ロケール（en / ja / zh_CN）で同一の英語名を設定すること。
日本語や中国語のノード名を設定すると、エクスポート・再インポート時に不整合が発生する可能性がある。

```xml
<contents id="contents_sample">
  <value type="array">
    <value type="object">
      <contentsId type="string">contents_sample</contentsId>
      <localeId type="string">en</localeId>
      <contentsName type="string">English name</contentsName>
      ...
    </value>
    <value type="object">
      <contentsId type="string">contents_sample</contentsId>
      <localeId type="string">ja</localeId>
      <contentsName type="string">日本語名</contentsName>
      ...
    </value>
    <value type="object">
      <contentsId type="string">contents_sample</contentsId>
      <localeId type="string">zh_CN</localeId>
      <contentsName type="string">中文名</contentsName>
      ...
    </value>
  </value>
</contents>
```

## バージョン構造

IM-Workflow の仕様上、`2000/01/01` 〜 `2999/12/31` の全期間をカバーするバージョンが必要。
定義の登録がない期間は `versionStatus=9`（空白期間）で埋める。

各定義の `details` 配列は必ず 2 バージョンを持つ。
有効バージョンの `startDate` は XML 生成日（当日）を設定し、空白期間の `limitDate` はその前日とする。

| バージョン | startDate | limitDate | versionStatus | 用途 |
|-----------|-----------|-----------|---------------|------|
| 空白期間 | 2000/01/01 | **生成日の前日**（例: `2026/03/31`） | 9 | 定義登録のない期間（空データ） |
| 有効 | **生成日**（例: `2026/04/01`） | 2999/12/31 | 1 | 使用中の有効なデータ |

### versionStatus の値

| 値 | 説明 |
|----|------|
| 0 | 無効（定義は登録済みだが一時的に無効化している） |
| 1 | 有効（使用中） |
| 9 | 空白期間（定義の登録がない期間を埋めるためのダミー） |

バージョンID の命名規則: `{parentId}_{連番}`（0始まりの連番。例: `cnt_purchase_0`, `cnt_purchase_1`, ...）

---

## 1. contents（コンテンツ定義）

コンテンツはワークフローで使用する画面パスを定義する。

### 主要プロパティ

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| contentsId | string | コンテンツID（一意） |
| localeId | string | ロケールID（en/ja/zh_CN） |
| contentsName | string | コンテンツ名 |
| contentsType | string | `0` = スクリプト開発モデル |
| updateCount | string | 更新カウント（`1`） |

### pages（画面パス定義）

有効バージョンの `pages` 配列に画面パスを定義する。

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| pagePathId | string | 画面パスID（`{prefix}_page_{連番}`） |
| pageName | string | 画面名 |
| pageType | string | 画面種別（下表参照） |
| defaultFlag | string | `1` = デフォルト |
| pathType | string | `0` = スクリプトパス |
| scriptPath | string | JSSP ファイルパス（拡張子なし、`src/main/jssp/src/` からの相対パス）。**実際のファイル配置に合わせて指定する**こと。ファイルが `apply/index.js` の場合は `{basePath}/apply/index` とする（例: `wf_auto_parts/apply/index`）。ルーティングの URL パスではない |
| applicationId | string/null | Java EE の場合に使用 |
| serviceId | string/null | Java EE の場合に使用 |
| pagePath | string/null | Java EE の場合に使用 |

### pageType（画面種別）

| 値 | 画面種別 | 説明 |
|----|---------|------|
| 0 | 申請画面 | 新規申請時の入力画面 |
| 1 | 一時保存画面 | 一時保存からの再開画面 |
| 2 | 申請（処理）画面 | 申請業務画面 |
| 3 | 再申請画面 | 差戻し後の再申請画面 |
| 4 | 処理画面 | 承認・否認・差戻しの処理画面 |
| 5 | 確認画面 | 確認者用の閲覧画面 |
| 6 | 処理詳細画面 | 処理済み案件の詳細画面 |
| 7 | 参照詳細画面 | 参照用の詳細画面 |

### rules（ルール紐付け）

コンテンツの**有効バージョン**の `rules` 配列に、使用するルール定義への参照を記述する。
この紐付けがないと、ルール定義をインポートしてもコンテンツ定義と連携しない。

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| contentsRuleId | string | 紐付けるルールID（`rule` セクションの `ruleId` と一致） |
| contentsId | string | コンテンツID |
| contentsVersionId | string | コンテンツバージョンID |
| ruleData | string/null | ルールデータ（通常 null） |

```xml
<rules type="array">
  <value type="object">
    <contentsRuleId type="string">{{ruleId}}</contentsRuleId>
    <contentsId type="string">{{contentsId}}</contentsId>
    <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
    <ruleData type="null" />
  </value>
</rules>
```

**注意:** 空白期間バージョン（versionStatus=9）の `rules` は空配列のままにする。

### plugins（コンテンツプラグイン）

コンテンツの**有効バージョン**の `plugins` 配列に、プラグインプログラムの参照を記述する。
プラグインの種類は `exPointId` で区別する。

**いつ含めるか:**
- **案件プロパティを使用する場合（分岐ルート等）**: 必須。申請時にフォームデータを案件プロパティに保存するアクション処理を申請ノードに指定する。この設定がないと分岐条件の評価でエラーになる
- **案件プロパティを使用しない場合（直線ルート等）**: アクション処理が不要であれば空配列でよい。業務ロジック（DB保存等）をアクション処理で行う場合は含める
- **ユーザプログラム方式の分岐**: 分岐条件プログラムの登録が必要

#### アクション処理プラグイン

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| contentsPluginId | string | プラグインID（ランダムID（15桁、`[0-9A-Za-z]`）、ロケール間で共有） |
| localeId | string | ロケールID |
| contentsId | string | コンテンツID |
| contentsVersionId | string | コンテンツバージョンID |
| exPointId | string | `jp.co.intra_mart.workflow.plugin.event.node.action.process` |
| pluginId | string | `jp.co.intra_mart.workflow.plugin.event.node.action.process.pluginScriptExecutor` |
| pluginName | string | プラグイン名（任意） |
| parameter | string | アクション処理の JSSP ファイルパス（拡張子なし） |
| nodeType | string | ノード種別番号（`reference/node-types.md` の数値コード参照）。申請ノードで使用するなら `2` を指定 |
| defaultFlag | string | `1` |
| executeOrder | string | `0`, `1`, ...（プラグインごとに連番） |

```xml
<plugins type="array">
  <value type="object">
    <contentsPluginId type="string">{{contentsPluginId}}</contentsPluginId>
    <localeId type="string">{{localeId}}</localeId>
    <contentsId type="string">{{contentsId}}</contentsId>
    <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
    <exPointId type="string">jp.co.intra_mart.workflow.plugin.event.node.action.process</exPointId>
    <pluginId type="string">jp.co.intra_mart.workflow.plugin.event.node.action.process.pluginScriptExecutor</pluginId>
    <pluginName type="string">action_process</pluginName>
    <parameter type="string">{{actionProcessPath}}</parameter>
    <nodeType type="string">2</nodeType>
    <defaultFlag type="string">1</defaultFlag>
    <executeOrder type="string">0</executeOrder>
    <note type="string" />
  </value>
</plugins>
```

#### 分岐条件プラグイン（ユーザプログラム方式の分岐で使用）

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| contentsPluginId | string | プラグインID（ランダムID（15桁、`[0-9A-Za-z]`）、ロケール間で共有）。flow の details で `cooperationId` として参照される |
| localeId | string | ロケールID |
| contentsId | string | コンテンツID |
| contentsVersionId | string | コンテンツバージョンID |
| exPointId | string | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule` |
| pluginId | string | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule.pluginScriptExecutor` |
| pluginName | string | プラグイン名（任意） |
| parameter | string | 分岐条件プログラムの JSSP ファイルパス（拡張子なし） |
| nodeType | string | 空文字列 |
| defaultFlag | string | `0` |
| executeOrder | string | `0`, `1`, ...（プラグインごとに連番） |

```xml
<value type="object">
  <contentsPluginId type="string">{{contentsPluginId_rule}}</contentsPluginId>
  <localeId type="string">{{localeId}}</localeId>
  <contentsId type="string">{{contentsId}}</contentsId>
  <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
  <exPointId type="string">jp.co.intra_mart.workflow.plugin.event.node.branch.rule</exPointId>
  <pluginId type="string">jp.co.intra_mart.workflow.plugin.event.node.branch.rule.pluginScriptExecutor</pluginId>
  <pluginName type="string">{{pluginName}}</pluginName>
  <parameter type="string">{{ruleScriptPath}}</parameter>
  <nodeType type="string" />
  <defaultFlag type="string">0</defaultFlag>
  <executeOrder type="string">0</executeOrder>
  <note type="string" />
</value>
```

#### 案件終了処理プラグイン

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| contentsPluginId | string | プラグインID（ランダムID、ロケール間で共有） |
| localeId | string | ロケールID |
| contentsId | string | コンテンツID |
| contentsVersionId | string | コンテンツバージョンID |
| exPointId | string | トランザクションあり: `jp.co.intra_mart.workflow.plugin.event.flow.matter.end.process` / トランザクションなし: `jp.co.intra_mart.workflow.plugin.event.flow.matter.end.process.no.transaction` |
| pluginId | string | `{exPointId}.pluginScriptExecutor` |
| pluginName | string | `matter_end_process` |
| parameter | string | 案件終了処理の JSSP ファイルパス（拡張子なし） |
| nodeType | string | 空文字列 |
| defaultFlag | string | `1` |
| executeOrder | string | アクション処理プラグインの後の連番 |

```xml
<value type="object">
  <contentsPluginId type="string">{{contentsPluginId}}</contentsPluginId>
  <localeId type="string">{{localeId}}</localeId>
  <contentsId type="string">{{contentsId}}</contentsId>
  <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
  <exPointId type="string">jp.co.intra_mart.workflow.plugin.event.flow.matter.end.process</exPointId>
  <pluginId type="string">jp.co.intra_mart.workflow.plugin.event.flow.matter.end.process.pluginScriptExecutor</pluginId>
  <pluginName type="string">matter_end_process</pluginName>
  <parameter type="string">{{matterEndProcessPath}}</parameter>
  <nodeType type="string" />
  <defaultFlag type="string">1</defaultFlag>
  <executeOrder type="string">1</executeOrder>
  <note type="null" />
</value>
```

**注意:** 空白期間バージョン（versionStatus=9）の `plugins` は空配列のままにする。

---

## 2. route（ルート定義）

ルートはワークフローのノード構成と接続関係を定義する。

### 主要プロパティ

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| routeId | string | ルートID（一意） |
| routeName | string | ルート名 |
| routeType | string | `0` = 標準 |

### routeXmlFile（ルート定義本体）

有効バージョンの `routeXmlFile` にノード構成を記述する。

```xml
<routeXmlFile type="object">
  <routeId type="string">{routeId}</routeId>
  <routeVersionId type="string">{routeVersionId}</routeVersionId>
  <routeType type="string">0</routeType>
  <nodes type="array">
    <!-- ノード定義の配列 -->
  </nodes>
  <comments type="array" />
  <swimlanes type="array" />
</routeXmlFile>
```

### nodes（ノード定義）

各ノードの構造:

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| nodeId | string | ノードID（一意） |
| nodeName | string | ノード表示名（**最大100バイト、全ロケールで同一の英語名を使用**） |
| nodeType | string | ノード種別番号（`reference/node-types.md` の数値コード参照） |
| nodeVariety | string | `system` / `human` |
| previousNodeIds | array | 前ノードID の配列 |
| nextNodeIds | array | 次ノードID の配列 |
| plugins | array | 権限プラグインの配列 |
| x | number | X 座標（ルートエディタ上の配置位置） |
| y | number | Y 座標 |
| startNodeFlag | string | `true` = 開始ノード |
| endNodeFlag | string | `true` = 終了ノード |
| traceId | string | トレースID（下記規則参照） |
| routeTemplateId | null/string | テンプレートルートID |
| routeTemplateName | null/string | テンプレートルート名 |
| parentNode | string/null | 親ノードID |

### traceId の規則

| ノード種別 | traceId | 例 |
|-----------|---------|-----|
| Start / End | `0.0` | `0.0` |
| 直線ノード（Apply, Approve） | `0.{連番}` | `0.1`, `0.2`, `0.3` |
| Branch_Start / Branch_End（対で同じ値） | `{前ノードの次の連番}-0.0` | `0.3-0.0` |
| 分岐パス内ノード | `{分岐の traceIdプレフィックス}-{パス番号}.{ノード番号}` | `0.3-1.1`, `0.3-2.1` |

- Branch_Start と対応する Branch_End は**同じ traceId** を持つ（対の特定に使用）
- 横配置・縦配置ノードも `-0.0` で終わる（ルート定義時点では末尾は常に `-0.0`）
- パス番号は `1` から始まる連番。ノード番号も `1` から
- 「直行パス」（Branch_Start → Branch_End の直結）はパス番号 `1`

#### ネスト分岐の traceId

分岐パス内にさらに分岐がある場合、traceId は階層的に伸びる。

```
Start (0.0) → Apply (0.1) → Approve_A (0.2) → Branch_Start_01 (0.3-0.0)
  ├─ 直行パス → Branch_End_01 (0.3-0.0)
  └─ パス2: Approve_B (0.3-2.1) → Branch_Start_02 (0.3-2.2-0.0)
       ├─ 直行パス → Branch_End_02 (0.3-2.2-0.0)
       └─ パス2: Approve_C (0.3-2.2-2.1) → Branch_End_02
  Branch_End_01 → End (0.0)
```

| ノード | traceId | 説明 |
|--------|---------|------|
| Approve_A | `0.2` | 分岐前の直線ノード |
| Branch_Start_01 / Branch_End_01 | `0.3-0.0` | 外側分岐の対 |
| Approve_B | `0.3-2.1` | 外側分岐パス2, ノード1 |
| Branch_Start_02 / Branch_End_02 | `0.3-2.2-0.0` | 内側分岐の対（パス2のノード2の位置） |
| Approve_C | `0.3-2.2-2.1` | 内側分岐パス2, ノード1 |

### plugins（権限プラグイン）

ルートレベルとノードレベルの両方に同じ plugins を定義する（二重記述が必要）。

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| routePluginId | string | プラグインID（**最大20バイト**。`plg_{短縮名}_{連番}`） |
| routeId | string | ルートID（**最大20バイト**） |
| routeVersionId | string | ルートバージョンID（**最大20バイト**） |
| nodeId | string | 対象ノードID（**最大20バイト**） |
| nodeType | string | ノード種別番号（`reference/node-types.md` の数値コード参照） |
| extensionPointId | string | 拡張ポイントID（node-types.md 参照） |
| pluginId | string | プラグインID（`reference/authority-plugins.md` 参照） |
| parameter | string | プラグインごとに指定するパラメータ（`reference/authority-plugins.md` 参照） |
| targetType | string | 権限プラグインの targetType（`reference/authority-plugins.md` 参照） |
| targetCode | string | parameter と同じ値を設定する |

---

## 3. flow（フロー定義）

フローはコンテンツとルートを紐付け、ワークフロー全体の動作設定を定義する。

### 主要プロパティ

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| flowId | string | フローID（一意） |
| flowName | string | フロー名 |
| contentsId | string | 紐付けるコンテンツID |
| routeId | string | 紐付けるルートID |

### フロー設定フラグ

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| lumpProcessFlag | string | `1` | 一括処理可否（`0`=不可, `1`=可） |
| lumpConfirmFlag | string | `1` | 一括確認可否（`0`=不可, `1`=可） |
| attachFileFlag | string | `1` | 添付ファイル可否（**フローレベルでは** `0`=不可, `1`=可。**ノード単位では** `0`=不可, `1`=添付可・削除不可, `2`=添付・削除可） |
| confirmUserSetupFlag | string | `0` | 確認者設定可否（`0`=不可, `1`=可） |
| completeMatterConfirmFlag | string | `0` | 完了案件確認可否 |
| autoProcessFlag | string | `0` | 自動処理（`0`=しない, `1`=する） |
| autoProcessLimitDay | number/null | null | 自動処理期限日数 |
| autoProcessLimitType | string | `0` | 自動処理期限種別 |
| autoPressFlag | string | `0` | 自動催促可否（`0`=不可, `1`=可） |
| autoPressLimitDay | number/null | null | 自動催促期限日数 |
| asyncProcessFlag | string/null | null | 非同期処理可否（`0`/null=不可, `1`=可） |
| sysDateTargetExpandFlag | string/null | null | システム日付対象展開可否（`0`/null=不可, `1`=可） |
| calendarId | string/null | null | カレンダーID |

### handleUsers（参照者）

ワークフロー案件を参照・操作できるユーザを定義する。設定は任意（空配列でもよい）。
有効バージョンの `handleUsers` 配列に設定する。空白期間バージョン（versionStatus=9）は空配列のままにする。
**ユーザから参照者の指示がない場合は空配列を指定すること。** サンプルデータの値をデフォルトで入れてはならない。
参照: https://document.intra-mart.jp/library/iap/public/im_workflow/im_workflow_specification/texts/detail_guide/operation_reference/index.html

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| no | string | 一意ID（ランダムID（15桁、`[0-9A-Za-z]`）、ロケール間で共有） |
| flowId | string | フローID |
| flowVersionId | string | フローバージョンID |
| extensionPointId | string | `jp.co.intra_mart.workflow.plugin.authority.administrator.flow.handle` |
| pluginId | string | プラグインID（`reference/authority-plugins.md` 参照） |
| parameter | string | プラグインごとに指定するパラメータ（`reference/authority-plugins.md` 参照） |
| targetType | string | 権限プラグインの targetType（`reference/authority-plugins.md` 参照） |
| targetCode | string | parameter と同じ値を設定する |
| handleLevel | string | `0` |
| reserveCancelFlag | string | 予約取消可否（`0`=不可, `1`=可） |
| changeUserFlag | string | 処理者変更可否（`0`=不可, `1`=可） |
| expandUserFlag | string | 展開可否（`0`=不可, `1`=可） |
| deleteDynamicNodeFlag | string | 動的ノード削除可否（`0`=不可, `1`=可） |
| undeleteDynamicNodeFlag | string | 動的ノード削除取消可否（`0`=不可, `1`=可） |
| horizontalNodeConfigFlag | string | 横配置ノード設定可否（`0`=不可, `1`=可） |
| verticalNodeConfigFlag | string | 縦配置ノード設定可否（`0`=不可, `1`=可） |
| handleMoveForwardFlag | string | 案件進行可否（`0`=不可, `1`=可） |
| handleMoveBackwardFlag | string | 案件差戻し可否（`0`=不可, `1`=可） |
| handleTerminateFlag | string | 案件終了可否（`0`=不可, `1`=可） |

pluginId・targetType・parameter の指定方法、サンプルデータは `reference/authority-plugins.md` を参照。
複数の参照者を設定する場合は `handleUsers` 配列に複数エントリを並べる。
各エントリの `no` はエントリごとに異なるランダムIDを設定すること（ロケール間では共有）。

### テンプレート

```xml
<handleUsers type="array">
  <value type="object">
    <no type="string">{{handleUserNo}}</no>
    <flowId type="string">flow_{{name}}</flowId>
    <flowVersionId type="string">flow_{{name}}_1</flowVersionId>
    <extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.administrator.flow.handle</extensionPointId>
    <pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.administrator.flow.handle.{{サフィックス}}</pluginId>
    <parameter type="string">{{parameter}}</parameter>
    <targetType type="string">{{targetType}}</targetType>
    <targetCode type="string">{{parameter}}</targetCode>
    <handleLevel type="string">0</handleLevel>
    <reserveCancelFlag type="string">0</reserveCancelFlag>
    <changeUserFlag type="string">0</changeUserFlag>
    <expandUserFlag type="string">0</expandUserFlag>
    <deleteDynamicNodeFlag type="string">0</deleteDynamicNodeFlag>
    <undeleteDynamicNodeFlag type="string">0</undeleteDynamicNodeFlag>
    <horizontalNodeConfigFlag type="string">0</horizontalNodeConfigFlag>
    <verticalNodeConfigFlag type="string">0</verticalNodeConfigFlag>
    <handleMoveForwardFlag type="string">0</handleMoveForwardFlag>
    <handleMoveBackwardFlag type="string">0</handleMoveBackwardFlag>
    <handleTerminateFlag type="string">0</handleTerminateFlag>
  </value>
  <!-- 複数設定する場合はエントリを繰り返す -->
</handleUsers>
```

### defaultOrgzs / flows

- `defaultOrgzs`: 申請基準組織のデフォルト設定。通常は空配列。
- `flows`: サブフロー定義。通常は空配列。

### nodes（フローノード設定）

フロー内の各ノードに対する個別設定:

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| flowId | string | フローID |
| flowVersionId | string | フローバージョンID |
| contentsVersionId | string | コンテンツバージョンID |
| routeVersionId | string | ルートバージョンID |
| nodeId | string | ノードID（ルートのノードIDと一致） |
| nodeType | string | ノード種別番号（`reference/node-types.md` の数値コード参照） |
| lumpProcessFlag | string/null | ノード単位の一括処理設定 |
| attachFileFlag | string/null | ノード単位の添付ファイル（`0`=不可, `1`=添付可・削除不可, `2`=添付・削除可） |
| details | array | 分岐ノードのルール紐付け配列（通常ノードは空配列） |
| attributes | array | ノード属性配列 |
| unions | array | 分岐ノードのパス紐付け配列（通常ノードは空配列） |
| routeNode | string/null | ルートノード |

### details（分岐ノードの条件紐付け）

Branch_Start ノード（nodeType=9）の `details` 配列で、各分岐パスに適用する条件を指定する。
分岐方式によって `cooperationType` が異なる。

| cooperationType | cooperationClassify | cooperationId の参照先 | 分岐方式 |
|-----------------|--------------------|-----------------------|---------|
| `19` | `2` | rule セクションの `ruleId` | ルール自動判定 |
| `4` | `0` | contents plugins の `contentsPluginId` | ユーザプログラム |

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| no | string | 一意ID（ランダムID（15桁、`[0-9A-Za-z]`）、unions の `branchUnionId` と対応） |
| cooperationType | string | `19`（ルール）/ `4`（ユーザプログラム） |
| cooperationClassify | string | `2`（ルール）/ `0`（プログラム） |
| cooperationId | string | 紐付け先の ID（上表参照） |
| emptyFlag | string | `0`（固定値） |

※ 通常の Apply / Approve ノードの details は空配列。

### unions（分岐ノードのパス紐付け）

Branch_Start ノード（nodeType=9）の `unions` 配列で、ルールが成立した際の分岐先を指定する。
details と 1:1 で対応する。

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| branchUnionId | string | details の `no` と**同じ値**（紐付けキー） |
| branchUnionGroupId | string | グループID（ランダムID（15桁、`[0-9A-Za-z]`）、各 union ごとに異なる一意値） |
| branchUnionGroupClassify | string | `0`（固定値） |
| countTrue | string | `1`（固定値） |
| countTargetNodeId | string | 分岐先パスの先頭ノードID |

※ 通常の Apply / Approve ノード、および Branch_End ノードの unions は空配列。

---

## 4. matter_property（案件プロパティ）

案件に紐づく業務データ項目を定義する。分岐ルールの条件変数や一覧表示の列として使用。

### 主要プロパティ

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| matterPropertyKey | string | プロパティキー（一意、ID として使用） |
| localeId | string | ロケールID |
| matterPropertyName | string | 表示名 |
| matterPropertyModelType | string | データ型（`1` = 数値, `0` = 文字列） |
| matterPropertyTypeListPattern | string | 一覧パターンで使用可（`1` = 可） |
| matterPropertyTypeMailTemplate | string | メールテンプレートで使用可（`0` = 不可） |
| matterPropertyTypeImBoxTpl | string | IMBox テンプレートで使用可（`0` = 不可） |
| matterPropertyTypeRule | string | 分岐ルールで使用可（`1` = 可） |
| alignType | string | 表示寄せ（`0` = 左, `1` = 中央, `2` = 右） |
| searchRangeType | string | 検索範囲種別（`0` = 一致, `1` = 範囲） |
| commaSeparatedFlag | string | カンマ区切り表示（`0` = しない） |
| calendarFlag | string | カレンダー使用（`0` = しない） |
| updateCount | string | 更新カウント（`1`） |

### テンプレート

```xml
<matter_property id="{{propertyKey}}">
  <value type="array">
    <!-- ロケールごとに繰り返し（ja, en, zh_CN） -->
    <value type="object">
      <matterPropertyKey type="string">{{propertyKey}}</matterPropertyKey>
      <localeId type="string">{{localeId}}</localeId>
      <matterPropertyName type="string">{{propertyName}}</matterPropertyName>
      <matterPropertyModelType type="string">{{modelType}}</matterPropertyModelType>
      <matterPropertyTypeListPattern type="string">1</matterPropertyTypeListPattern>
      <matterPropertyTypeMailTemplate type="string">0</matterPropertyTypeMailTemplate>
      <matterPropertyTypeImBoxTpl type="string">0</matterPropertyTypeImBoxTpl>
      <matterPropertyTypeRule type="string">1</matterPropertyTypeRule>
      <alignType type="string">2</alignType>
      <searchRangeType type="string">1</searchRangeType>
      <commaSeparatedFlag type="string">0</commaSeparatedFlag>
      <calendarFlag type="string">0</calendarFlag>
      <note type="null" />
      <updateCount type="string">1</updateCount>
    </value>
  </value>
</matter_property>
```

---

## 5. rule（分岐ルール）

分岐ルートで使用する条件判定ルールを定義する。案件プロパティの値を比較条件と照合する。

### 主要プロパティ

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| ruleId | string | ルールID（一意） |
| ruleName | string | ルール名（条件の説明） |
| ruleUnionCondition | string | 複合条件の結合方法（`0` = AND、`1` = OR） |
| updateCount | string | 更新カウント（`1`） |

### ruleDetailModel（条件詳細）

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| no | string | 条件ID（15文字ランダム文字列）。**同一条件の `no` は全ロケールで同一値を使用すること** |
| ruleId | string | 親ルールID |
| compareRuleId | string | 比較演算子（下表参照） |
| compareVariable | string | 比較対象の案件プロパティキー |
| conditionValue | string | 比較値 |
| conditionValueType | string | 値の型（`0` = 固定値） |

### compareRuleId（条件種別: ConditionType）

公式リファレンス: https://api.intra-mart.jp/im_workflow_v72/com/imwCodeList.html#ConditionType

| 値 | コード名 | 説明 |
|----|---------|------|
| 0 | condTyp_Include | に次を含む |
| 1 | condTyp_NotInclude | に次を含まない |
| 2 | condTyp_Corresponding | が次と一致する |
| 3 | condTyp_Different | が次と異なる |
| 4 | condTyp_Start | が次で始まる |
| 5 | condTyp_End | が次で終わる |
| 6 | condTyp_Larger | が次より大きい |
| 7 | condTyp_More | が次以上 |
| 8 | condTyp_Smaller | が次より小さい |
| 9 | condTyp_Less | が次以下 |
| 10 | condTyp_CorrespondingEither | が次のいずれかと一致する |

**よく使う値:** 金額等の数値比較では `7`（以上）と `8`（より小さい＝未満）を使用する。

### テンプレート

```xml
<rule id="{{ruleId}}">
  <value type="array">
    <!-- ロケールごとに繰り返し（en, ja, zh_CN） -->
    <value type="object">
      <ruleId type="string">{{ruleId}}</ruleId>
      <localeId type="string">{{localeId}}</localeId>
      <ruleName type="string">{{ruleName}}</ruleName>
      <note type="null" />
      <!-- AND=0, OR=1 -->
      <ruleUnionCondition type="string">{{0|1}}</ruleUnionCondition>
      <updateCount type="string">1</updateCount>
      <ruleDetailModel type="array">
        <!-- 条件ごとに1エントリ。no は全ロケールで同一値を使用すること -->
        <value type="object">
          <no type="string">{{15文字ランダムID（全ロケール共通）}}</no>
          <ruleId type="string">{{ruleId}}</ruleId>
          <compareRuleId type="string">{{compareRuleId}}</compareRuleId>
          <compareVariable type="string">{{propertyKey}}</compareVariable>
          <conditionValue type="string">{{value}}</conditionValue>
          <conditionValueType type="string">0</conditionValueType>
        </value>
        <!-- 複数条件の場合: 条件ごとに追加（no はそれぞれ異なるが全ロケールで共有） -->
      </ruleDetailModel>
    </value>
  </value>
</rule>
```

### 使用例: 金額による 3 段階分岐

| ルール | 条件 | compareRuleId | conditionValue |
|--------|------|---------------|----------------|
| rule_01 | 10,000 未満 | 8 (未満) | 10000 |
| rule_02 | 10,000 以上 50,000 未満 | 7 (以上) + 8 (未満) | 10000, 50000 |
| rule_03 | 50,000 以上 | 7 (以上) | 50000 |

---

## ランダム ID 生成規則

XML 内の `no`、`contentsPluginId`、`branchUnionGroupId` 等のフィールドは、ランダム生成の一意IDを使用する。

| 項目 | 仕様 |
|------|------|
| 文字セット | 半角英数字 `[0-9A-Za-z]` |
| 桁数 | 15桁 |
| 一意性 | XML ファイル内で重複しないこと |
| ロケール間 | 同じ要素は 3 ロケールで同じ `no` を共有する |

例: `5hx2qt35p8oslxo`, `A3bC7dE9fG1hJ5k`

## ID 命名規則

**重要: コンテンツID・ルートID・フローID・各バージョンID・ノードID はすべて最大20バイト。**
バージョンID はサフィックス `_{連番}`（2文字〜）が付くため、親 ID はサフィックスを含めて20バイト以内に収めること。
名前が長い場合は `contents_` → `cnt_`、`route_` → `rte_`、`flow_` → `flw_` のように接頭辞を短縮する。

| 対象 | パターン | 上限 | 例 |
|------|---------|------|-----|
| コンテンツID | `cnt_{名前}` または `contents_{名前}` | **20バイト** | `cnt_purchase` |
| コンテンツバージョンID | `{contentsId}_{連番}` | **20バイト** | `cnt_purchase_1` |
| 画面パスID | `{prefix}_page_{連番}` | 20バイト | `purchase_page_0` |
| ルートID | `rte_{名前}` または `route_{名前}` | **20バイト** | `rte_purchase` |
| ルートバージョンID | `{routeId}_{連番}` | **20バイト** | `rte_purchase_1` |
| ノードID | `{routePrefix}_{連番}` / `{routePrefix}_start` / `{routePrefix}_end` | **20バイト** | `purchase_01`, `purchase_start` |
| フローID | `flw_{名前}` または `flow_{名前}` | **20バイト** | `flw_purchase` |
| フローバージョンID | `{flowId}_{連番}` | **20バイト** | `flw_purchase_1` |
| プラグインID | `plg_{短縮名}_{連番}` | **20バイト** | `plg_purch_01` |

### 接頭辞の短縮ガイド

名前部分（`{名前}`）が長く、標準接頭辞（`contents_` / `route_` / `flow_`）ではバージョンID が 20 文字を超える場合、以下の短縮接頭辞を使用する。

| 標準接頭辞 | 短縮接頭辞 | 使い分け |
|-----------|-----------|---------|
| `contents_` (9文字) | `cnt_` (4文字) | 名前が 10 文字以上の場合 |
| `route_` (6文字) | `rte_` (4文字) | 名前が 13 文字以上の場合 |
| `flow_` (5文字) | `flw_` (4文字) | 名前が 14 文字以上の場合 |

## 座標レイアウト規則

ノードの x, y 座標はルートエディタ上の配置位置を表す。

| ノード種別 | x 間隔 | y 位置 |
|-----------|--------|--------|
| Start | 50 | 50（メインライン） |
| Apply | 160 | 50 |
| Approve（直線） | +110 ずつ | 50 |
| End | 最後のノード +100 | 50 |
| Branch_Start | 前ノード +100 | 50 |
| Branch_End | 最後の分岐ノード +120~160 | 50 |
| 分岐先ノード（上） | Branch_Start +180 | 110 |
| 分岐先ノード（下） | Branch_Start +110~240 | 200~210 |
