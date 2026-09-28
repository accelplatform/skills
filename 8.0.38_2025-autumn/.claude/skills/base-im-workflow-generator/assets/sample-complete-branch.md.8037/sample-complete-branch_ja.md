# ネスト分岐ルート完全版サンプル XML

## 概要

IM-Workflow のインポート用 XML の**完全版サンプル**。
実際にインポートに成功したネスト分岐ルート定義（商品発注申請）をベースに、構造を示す。

**新規に XML を生成する際は、このサンプルの構造（タグ名・ネスト・プロパティ順序）を厳守すること。**
独自のタグ名やプロパティ名を使用してはならない。

## ルート構成

```
Start -> Apply -> Dept.Approve(01) -> Manager(02) -> Branch1_Start (単価で分岐)
  +- 単価<20000 -> Branch2_Start (合計で分岐)
  |   +- 合計<100000 -> (直行) Branch2_End
  |   +- 合計>=100000 -> President -> Branch2_End
  | Branch2_End -> Branch1_End
  +- 単価>=20000 -> Director -> Branch3_Start (合計で分岐)
      +- 合計<100000 -> (直行) Branch3_End
      +- 合計>=100000 -> President -> Branch3_End
    Branch3_End -> Branch1_End
Branch1_End -> End
```

## ノード一覧

| nodeId | nodeName | nodeType | 説明 |
|--------|----------|----------|------|
| prd_ord_start | Start | nodeTyp_Start | 開始 |
| prd_ord_apply | Apply | nodeTyp_Apply | 申請 |
| prd_ord_01 | Dept. Approve | nodeTyp_Approve | 同組織承認 |
| prd_ord_02 | Manager | nodeTyp_Approve | 課長承認 |
| prd_ord_brs1 | Start branch | nodeTyp_Branch_Start | 分岐1（単価） |
| prd_ord_brs2 | Start branch | nodeTyp_Branch_Start | 分岐2（合計、単価<20000時） |
| prd_ord_prs1 | President | nodeTyp_Approve | 社長（単価<20000 かつ 合計>=100000） |
| prd_ord_bre2 | End branch | nodeTyp_Branch_End | 分岐2終了 |
| prd_ord_dir | Director | nodeTyp_Approve | 部長（単価>=20000） |
| prd_ord_brs3 | Start branch | nodeTyp_Branch_Start | 分岐3（合計、単価>=20000時） |
| prd_ord_prs2 | President | nodeTyp_Approve | 社長（単価>=20000 かつ 合計>=100000） |
| prd_ord_bre3 | End branch | nodeTyp_Branch_End | 分岐3終了 |
| prd_ord_bre1 | End branch | nodeTyp_Branch_End | 分岐1終了 |
| prd_ord_end | End | nodeTyp_End | 終了 |

## ルール一覧

| ruleId | 条件 | 使用箇所 |
|--------|------|---------|
| rule_prd_ord_01 | unitPrice < 20000 | Branch1: Path A |
| rule_prd_ord_02 | unitPrice >= 20000 | Branch1: Path B |
| rule_prd_ord_03 | totalAmount < 100000 | Branch2/Branch3: 直行パス |
| rule_prd_ord_04 | totalAmount >= 100000 | Branch2/Branch3: 社長パス |

## 注意事項

- **ノード名（nodeName）は多言語対応しない。** 全ロケールで同一の英語名を使用する
- ルール名（ruleName）は多言語対応する。ただし英語名に `<` `>` を含める場合は `&lt;` `&gt;` にエスケープすること
- 分岐ルールは単条件にし、ネスト分岐で組み合わせることで複合条件を実現する
- ネスト分岐の traceId は階層的に伸びる（例: `0.4-1.1-0.0`, `0.4-1.1-2.1`）

## XML 全体構造

3 ロケール（en, ja, zh_CN）分の繰り返しは構造が同一のため、以下では **en ロケール 1 件分のみ** を掲載する。
ja / zh_CN は `localeId` と各名称のみが異なり、それ以外（ID・構造・プラグイン設定・ノード名）は en と完全に同一。

### ロケール別名称対応表

生成時は以下の対応表を参照して ja / zh_CN ロケールの名称を設定すること。

| フィールド | en | ja | zh_CN |
|-----------|----|----|-------|
| contentsName | Product Order | 商品発注 | 产品订单 |
| routeName | Product Order | 商品発注 | 产品订单 |
| flowName | Product Order | 商品発注 | 产品订单 |

| フィールド（pageName） | en | ja | zh_CN |
|----------------------|----|----|-------|
| pageType 0 | Apply | 申請 | 申请 |
| pageType 1 | Temporary save | 仮保存 | 临时保存 |
| pageType 2 | Apply (task) | 申請（タスク） | 申请（任务） |
| pageType 3 | Re-apply | 再申請 | 重新申请 |
| pageType 4 | Process | 処理 | 处理 |
| pageType 5 | Confirm | 確認 | 确认 |
| pageType 6 | Process details | 処理内容 | 处理内容 |
| pageType 7 | Refer details | 参照内容 | 参考内容 |

| フィールド（matterPropertyName） | en | ja | zh_CN |
|-------------------------------|----|----|-------|
| unitPrice | Unit Price | 単価 | 单价 |
| totalAmount | Total Amount | 合計金額 | 合计金额 |

| フィールド（ruleName） | en | ja | zh_CN |
|---------------------|----|----|-------|
| rule_prd_ord_01 | UnitPrice less than 20000 | 単価20000未満 | 单价不足20000 |
| rule_prd_ord_02 | UnitPrice 20000 or more | 単価20000以上 | 单价20000以上 |
| rule_prd_ord_03 | Total less than 100000 | 合計100000未満 | 合计不足100000 |
| rule_prd_ord_04 | Total 100000 or more | 合計100000以上 | 合计100000以上 |

```xml
<?xml version="1.0" encoding="UTF-16"?>
<data>

  <!-- ============================================================ -->
  <!-- contents（コンテンツ定義）                                     -->
  <!-- ============================================================ -->
  <contents id="cnt_prd_ord">
    <value type="array">
      <!-- locale: en -->
      <value type="object">
        <contentsId type="string">cnt_prd_ord</contentsId>
        <localeId type="string">en</localeId>
        <contentsName type="string">Product Order</contentsName>
        <contentsType type="string">0</contentsType>
        <note type="null" />
        <updateCount type="string">1</updateCount>
        <details type="array">
          <value type="object">
            <contentsId type="string">cnt_prd_ord</contentsId>
            <contentsVersionId type="string">cnt_prd_ord_0</contentsVersionId>
            <localeId type="string">en</localeId>
            <startDate type="string">2000/01/01</startDate>
            <limitDate type="string">2026/04/01</limitDate>
            <versionStatus type="string">9</versionStatus>
            <note type="null" />
            <pages type="array" />
            <plugins type="array" />
            <mails type="array" />
            <rules type="array" />
            <imBoxs type="array" />
            <messages type="array" />
          </value>
          <value type="object">
            <contentsId type="string">cnt_prd_ord</contentsId>
            <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
            <localeId type="string">en</localeId>
            <startDate type="string">2026/04/02</startDate>
            <limitDate type="string">2999/12/31</limitDate>
            <versionStatus type="string">1</versionStatus>
            <note type="null" />
            <pages type="array">
              <value type="object">
                <pagePathId type="string">prd_ord_page_0</pagePathId>
                <localeId type="string">en</localeId>
                <contentsId type="string">cnt_prd_ord</contentsId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <pageName type="string">Apply</pageName>
                <pageType type="string">0</pageType>
                <note type="null" />
                <defaultFlag type="string">1</defaultFlag>
                <pathType type="string">0</pathType>
                <scriptPath type="string">product_order/workflow/apply/index</scriptPath>
                <applicationId type="null" />
                <serviceId type="null" />
                <pagePath type="null" />
              </value>
              <value type="object">
                <pagePathId type="string">prd_ord_page_1</pagePathId>
                <localeId type="string">en</localeId>
                <contentsId type="string">cnt_prd_ord</contentsId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <pageName type="string">Temporary save</pageName>
                <pageType type="string">1</pageType>
                <note type="null" />
                <defaultFlag type="string">1</defaultFlag>
                <pathType type="string">0</pathType>
                <scriptPath type="string">product_order/workflow/apply/index</scriptPath>
                <applicationId type="null" />
                <serviceId type="null" />
                <pagePath type="null" />
              </value>
              <value type="object">
                <pagePathId type="string">prd_ord_page_2</pagePathId>
                <localeId type="string">en</localeId>
                <contentsId type="string">cnt_prd_ord</contentsId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <pageName type="string">Apply (task)</pageName>
                <pageType type="string">2</pageType>
                <note type="null" />
                <defaultFlag type="string">1</defaultFlag>
                <pathType type="string">0</pathType>
                <scriptPath type="string">product_order/workflow/apply/index</scriptPath>
                <applicationId type="null" />
                <serviceId type="null" />
                <pagePath type="null" />
              </value>
              <value type="object">
                <pagePathId type="string">prd_ord_page_3</pagePathId>
                <localeId type="string">en</localeId>
                <contentsId type="string">cnt_prd_ord</contentsId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <pageName type="string">Re-apply</pageName>
                <pageType type="string">3</pageType>
                <note type="null" />
                <defaultFlag type="string">1</defaultFlag>
                <pathType type="string">0</pathType>
                <scriptPath type="string">product_order/workflow/apply/index</scriptPath>
                <applicationId type="null" />
                <serviceId type="null" />
                <pagePath type="null" />
              </value>
              <value type="object">
                <pagePathId type="string">prd_ord_page_4</pagePathId>
                <localeId type="string">en</localeId>
                <contentsId type="string">cnt_prd_ord</contentsId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <pageName type="string">Process</pageName>
                <pageType type="string">4</pageType>
                <note type="null" />
                <defaultFlag type="string">1</defaultFlag>
                <pathType type="string">0</pathType>
                <scriptPath type="string">product_order/workflow/approve/index</scriptPath>
                <applicationId type="null" />
                <serviceId type="null" />
                <pagePath type="null" />
              </value>
              <value type="object">
                <pagePathId type="string">prd_ord_page_5</pagePathId>
                <localeId type="string">en</localeId>
                <contentsId type="string">cnt_prd_ord</contentsId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <pageName type="string">Confirm</pageName>
                <pageType type="string">5</pageType>
                <note type="null" />
                <defaultFlag type="string">1</defaultFlag>
                <pathType type="string">0</pathType>
                <scriptPath type="string">product_order/workflow/detail/index</scriptPath>
                <applicationId type="null" />
                <serviceId type="null" />
                <pagePath type="null" />
              </value>
              <value type="object">
                <pagePathId type="string">prd_ord_page_6</pagePathId>
                <localeId type="string">en</localeId>
                <contentsId type="string">cnt_prd_ord</contentsId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <pageName type="string">Process details</pageName>
                <pageType type="string">6</pageType>
                <note type="null" />
                <defaultFlag type="string">1</defaultFlag>
                <pathType type="string">0</pathType>
                <scriptPath type="string">product_order/workflow/detail/index</scriptPath>
                <applicationId type="null" />
                <serviceId type="null" />
                <pagePath type="null" />
              </value>
              <value type="object">
                <pagePathId type="string">prd_ord_page_7</pagePathId>
                <localeId type="string">en</localeId>
                <contentsId type="string">cnt_prd_ord</contentsId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <pageName type="string">Refer details</pageName>
                <pageType type="string">7</pageType>
                <note type="null" />
                <defaultFlag type="string">1</defaultFlag>
                <pathType type="string">0</pathType>
                <scriptPath type="string">product_order/workflow/detail/index</scriptPath>
                <applicationId type="null" />
                <serviceId type="null" />
                <pagePath type="null" />
              </value>
            </pages>
            <plugins type="array">
              <value type="object">
                <contentsPluginId type="string">Rk3mX7pL9nQ2wT4</contentsPluginId>
                <localeId type="string">en</localeId>
                <contentsId type="string">cnt_prd_ord</contentsId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <exPointId type="string">jp.co.intra_mart.workflow.plugin.event.node.action.process</exPointId>
                <pluginId type="string">jp.co.intra_mart.workflow.plugin.event.node.action.process.pluginScriptExecutor</pluginId>
                <pluginName type="string">action_process</pluginName>
                <parameter type="string">product_order/workflow/action/action_process</parameter>
                <nodeType type="string">2</nodeType>
                <defaultFlag type="string">1</defaultFlag>
                <executeOrder type="string">0</executeOrder>
                <note type="string" />
              </value>
            </plugins>
            <mails type="array" />
            <rules type="array">
              <value type="object">
                <contentsRuleId type="string">rule_prd_ord_01</contentsRuleId>
                <contentsId type="string">cnt_prd_ord</contentsId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <ruleData type="null" />
              </value>
              <value type="object">
                <contentsRuleId type="string">rule_prd_ord_02</contentsRuleId>
                <contentsId type="string">cnt_prd_ord</contentsId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <ruleData type="null" />
              </value>
              <value type="object">
                <contentsRuleId type="string">rule_prd_ord_03</contentsRuleId>
                <contentsId type="string">cnt_prd_ord</contentsId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <ruleData type="null" />
              </value>
              <value type="object">
                <contentsRuleId type="string">rule_prd_ord_04</contentsRuleId>
                <contentsId type="string">cnt_prd_ord</contentsId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <ruleData type="null" />
              </value>
            </rules>
            <imBoxs type="array" />
            <messages type="array" />
          </value>
        </details>
      </value>
      <!-- locale: ja (same structure, only localeId/contentsName/pageName differ) -->
      <!-- locale: zh_CN (same structure, only localeId/contentsName/pageName differ) -->
    </value>
  </contents>

  <!-- ============================================================ -->
  <!-- route（ルート定義）                                           -->
  <!-- ============================================================ -->
  <route id="rte_prd_ord">
    <value type="array">
      <!-- locale: en -->
        <routeId type="string">rte_prd_ord</routeId>
        <localeId type="string">en</localeId>
        <routeName type="string">Product Order</routeName>
        <routeType type="string">0</routeType>
        <note type="null" />
        <updateCount type="string">1</updateCount>
        <details type="array">
          <value type="object">
            <routeId type="string">rte_prd_ord</routeId>
            <routeVersionId type="string">rte_prd_ord_0</routeVersionId>
            <localeId type="string">en</localeId>
            <startDate type="string">2000/01/01</startDate>
            <limitDate type="string">2026/04/01</limitDate>
            <versionStatus type="string">9</versionStatus>
            <note type="null" />
            <routeFilePath type="null" />
            <routeXmlFile type="null" />
            <plugins type="array" />
          </value>
          <value type="object">
            <routeId type="string">rte_prd_ord</routeId>
            <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
            <localeId type="string">en</localeId>
            <startDate type="string">2026/04/02</startDate>
            <limitDate type="string">2999/12/31</limitDate>
            <versionStatus type="string">1</versionStatus>
            <note type="null" />
            <routeFilePath type="string">im_workflow/data/default/master/route/rte_prd_ord/rte_prd_ord_1/route.xml</routeFilePath>
            <routeXmlFile type="object">
              <routeId type="string">rte_prd_ord</routeId>
              <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
              <routeType type="string">0</routeType>
              <nodes type="array">
                <value type="object">
                  <nodeId type="string">prd_ord_start</nodeId>
                  <nodeName type="string">Start</nodeName>
                  <nodeType type="string">nodeTyp_Start</nodeType>
                  <nodeVariety type="string">system</nodeVariety>
                  <previousNodeIds type="array" />
                  <nextNodeIds type="array">
                    <value type="string">prd_ord_apply</value>
                  </nextNodeIds>
                  <plugins type="array" />
                  <x type="number">50</x>
                  <y type="number">50</y>
                  <startNodeFlag type="string">true</startNodeFlag>
                  <endNodeFlag type="string">false</endNodeFlag>
                  <traceId type="string">0.0</traceId>
                  <routeTemplateId type="null" />
                  <routeTemplateName type="null" />
                  <parentNode type="null" />
                </value>
                <value type="object">
                  <nodeId type="string">prd_ord_apply</nodeId>
                  <nodeName type="string">Apply</nodeName>
                  <nodeType type="string">nodeTyp_Apply</nodeType>
                  <nodeVariety type="string">human</nodeVariety>
                  <previousNodeIds type="array">
                    <value type="string">prd_ord_start</value>
                  </previousNodeIds>
                  <nextNodeIds type="array">
                    <value type="string">prd_ord_01</value>
                  </nextNodeIds>
                  <plugins type="array">
                    <value type="object">
                      <routePluginId type="string">plg_prdord_01</routePluginId>
                      <routeId type="string">rte_prd_ord</routeId>
                      <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                      <nodeId type="string">prd_ord_apply</nodeId>
                      <nodeType type="string">2</nodeType>
                      <extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.node.apply</extensionPointId>
                      <pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.apply.role</pluginId>
                      <parameter type="string">im_workflow_user</parameter>
                      <targetType type="string">role</targetType>
                      <targetCode type="string">im_workflow_user</targetCode>
                    </value>
                  </plugins>
                  <x type="number">160</x>
                  <y type="number">50</y>
                  <startNodeFlag type="string">false</startNodeFlag>
                  <endNodeFlag type="string">false</endNodeFlag>
                  <traceId type="string">0.1</traceId>
                  <routeTemplateId type="null" />
                  <routeTemplateName type="null" />
                  <parentNode type="null" />
                </value>
                <value type="object">
                  <nodeId type="string">prd_ord_01</nodeId>
                  <nodeName type="string">Dept. Approve</nodeName>
                  <nodeType type="string">nodeTyp_Approve</nodeType>
                  <nodeVariety type="string">human</nodeVariety>
                  <previousNodeIds type="array">
                    <value type="string">prd_ord_apply</value>
                  </previousNodeIds>
                  <nextNodeIds type="array">
                    <value type="string">prd_ord_02</value>
                  </nextNodeIds>
                  <plugins type="array">
                    <value type="object">
                      <routePluginId type="string">plg_prdord_02</routePluginId>
                      <routeId type="string">rte_prd_ord</routeId>
                      <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                      <nodeId type="string">prd_ord_01</nodeId>
                      <nodeType type="string">3</nodeType>
                      <extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve</extensionPointId>
                      <pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.department</pluginId>
                      <parameter type="string">comp_sample_01^comp_sample_01^dept_sample_10</parameter>
                      <targetType type="string">department</targetType>
                      <targetCode type="string">comp_sample_01^comp_sample_01^dept_sample_10</targetCode>
                    </value>
                  </plugins>
                  <x type="number">270</x>
                  <y type="number">50</y>
                  <startNodeFlag type="string">false</startNodeFlag>
                  <endNodeFlag type="string">false</endNodeFlag>
                  <traceId type="string">0.2</traceId>
                  <routeTemplateId type="null" />
                  <routeTemplateName type="null" />
                  <parentNode type="null" />
                </value>
                <value type="object">
                  <nodeId type="string">prd_ord_02</nodeId>
                  <nodeName type="string">Manager</nodeName>
                  <nodeType type="string">nodeTyp_Approve</nodeType>
                  <nodeVariety type="string">human</nodeVariety>
                  <previousNodeIds type="array">
                    <value type="string">prd_ord_01</value>
                  </previousNodeIds>
                  <nextNodeIds type="array">
                    <value type="string">prd_ord_brs1</value>
                  </nextNodeIds>
                  <plugins type="array">
                    <value type="object">
                      <routePluginId type="string">plg_prdord_03</routePluginId>
                      <routeId type="string">rte_prd_ord</routeId>
                      <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                      <nodeId type="string">prd_ord_02</nodeId>
                      <nodeType type="string">3</nodeType>
                      <extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve</extensionPointId>
                      <pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.post</pluginId>
                      <parameter type="string">comp_sample_01^comp_sample_01^ps003</parameter>
                      <targetType type="string">post</targetType>
                      <targetCode type="string">comp_sample_01^comp_sample_01^ps003</targetCode>
                    </value>
                  </plugins>
                  <x type="number">380</x>
                  <y type="number">50</y>
                  <startNodeFlag type="string">false</startNodeFlag>
                  <endNodeFlag type="string">false</endNodeFlag>
                  <traceId type="string">0.3</traceId>
                  <routeTemplateId type="null" />
                  <routeTemplateName type="null" />
                  <parentNode type="null" />
                </value>
                <value type="object">
                  <nodeId type="string">prd_ord_brs1</nodeId>
                  <nodeName type="string">Start branch</nodeName>
                  <nodeType type="string">nodeTyp_Branch_Start</nodeType>
                  <nodeVariety type="string">system</nodeVariety>
                  <previousNodeIds type="array">
                    <value type="string">prd_ord_02</value>
                  </previousNodeIds>
                  <nextNodeIds type="array">
                    <value type="string">prd_ord_brs2</value>
                    <value type="string">prd_ord_dir</value>
                  </nextNodeIds>
                  <plugins type="array" />
                  <x type="number">490</x>
                  <y type="number">50</y>
                  <startNodeFlag type="string">false</startNodeFlag>
                  <endNodeFlag type="string">false</endNodeFlag>
                  <traceId type="string">0.4-0.0</traceId>
                  <routeTemplateId type="null" />
                  <routeTemplateName type="null" />
                  <parentNode type="null" />
                </value>
                <value type="object">
                  <nodeId type="string">prd_ord_brs2</nodeId>
                  <nodeName type="string">Start branch</nodeName>
                  <nodeType type="string">nodeTyp_Branch_Start</nodeType>
                  <nodeVariety type="string">system</nodeVariety>
                  <previousNodeIds type="array">
                    <value type="string">prd_ord_brs1</value>
                  </previousNodeIds>
                  <nextNodeIds type="array">
                    <value type="string">prd_ord_bre2</value>
                    <value type="string">prd_ord_prs1</value>
                  </nextNodeIds>
                  <plugins type="array" />
                  <x type="number">670</x>
                  <y type="number">110</y>
                  <startNodeFlag type="string">false</startNodeFlag>
                  <endNodeFlag type="string">false</endNodeFlag>
                  <traceId type="string">0.4-1.1-0.0</traceId>
                  <routeTemplateId type="null" />
                  <routeTemplateName type="null" />
                  <parentNode type="null" />
                </value>
                <value type="object">
                  <nodeId type="string">prd_ord_prs1</nodeId>
                  <nodeName type="string">President</nodeName>
                  <nodeType type="string">nodeTyp_Approve</nodeType>
                  <nodeVariety type="string">human</nodeVariety>
                  <previousNodeIds type="array">
                    <value type="string">prd_ord_brs2</value>
                  </previousNodeIds>
                  <nextNodeIds type="array">
                    <value type="string">prd_ord_bre2</value>
                  </nextNodeIds>
                  <plugins type="array">
                    <value type="object">
                      <routePluginId type="string">plg_prdord_04</routePluginId>
                      <routeId type="string">rte_prd_ord</routeId>
                      <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                      <nodeId type="string">prd_ord_prs1</nodeId>
                      <nodeType type="string">3</nodeType>
                      <extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.static</extensionPointId>
                      <pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.static.post</pluginId>
                      <parameter type="string">comp_sample_01^comp_sample_01^ps001</parameter>
                      <targetType type="string">post</targetType>
                      <targetCode type="string">comp_sample_01^comp_sample_01^ps001</targetCode>
                    </value>
                  </plugins>
                  <x type="number">850</x>
                  <y type="number">170</y>
                  <startNodeFlag type="string">false</startNodeFlag>
                  <endNodeFlag type="string">false</endNodeFlag>
                  <traceId type="string">0.4-1.1-2.1</traceId>
                  <routeTemplateId type="null" />
                  <routeTemplateName type="null" />
                  <parentNode type="null" />
                </value>
                <value type="object">
                  <nodeId type="string">prd_ord_bre2</nodeId>
                  <nodeName type="string">End branch</nodeName>
                  <nodeType type="string">nodeTyp_Branch_End</nodeType>
                  <nodeVariety type="string">system</nodeVariety>
                  <previousNodeIds type="array">
                    <value type="string">prd_ord_brs2</value>
                    <value type="string">prd_ord_prs1</value>
                  </previousNodeIds>
                  <nextNodeIds type="array">
                    <value type="string">prd_ord_bre1</value>
                  </nextNodeIds>
                  <plugins type="array" />
                  <x type="number">980</x>
                  <y type="number">110</y>
                  <startNodeFlag type="string">false</startNodeFlag>
                  <endNodeFlag type="string">false</endNodeFlag>
                  <traceId type="string">0.4-1.1-0.0</traceId>
                  <routeTemplateId type="null" />
                  <routeTemplateName type="null" />
                  <parentNode type="null" />
                </value>
                <value type="object">
                  <nodeId type="string">prd_ord_dir</nodeId>
                  <nodeName type="string">Director</nodeName>
                  <nodeType type="string">nodeTyp_Approve</nodeType>
                  <nodeVariety type="string">human</nodeVariety>
                  <previousNodeIds type="array">
                    <value type="string">prd_ord_brs1</value>
                  </previousNodeIds>
                  <nextNodeIds type="array">
                    <value type="string">prd_ord_brs3</value>
                  </nextNodeIds>
                  <plugins type="array">
                    <value type="object">
                      <routePluginId type="string">plg_prdord_05</routePluginId>
                      <routeId type="string">rte_prd_ord</routeId>
                      <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                      <nodeId type="string">prd_ord_dir</nodeId>
                      <nodeType type="string">3</nodeType>
                      <extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.static</extensionPointId>
                      <pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.static.post</pluginId>
                      <parameter type="string">comp_sample_01^comp_sample_01^ps002</parameter>
                      <targetType type="string">post</targetType>
                      <targetCode type="string">comp_sample_01^comp_sample_01^ps002</targetCode>
                    </value>
                  </plugins>
                  <x type="number">600</x>
                  <y type="number">290</y>
                  <startNodeFlag type="string">false</startNodeFlag>
                  <endNodeFlag type="string">false</endNodeFlag>
                  <traceId type="string">0.4-2.1</traceId>
                  <routeTemplateId type="null" />
                  <routeTemplateName type="null" />
                  <parentNode type="null" />
                </value>
                <value type="object">
                  <nodeId type="string">prd_ord_brs3</nodeId>
                  <nodeName type="string">Start branch</nodeName>
                  <nodeType type="string">nodeTyp_Branch_Start</nodeType>
                  <nodeVariety type="string">system</nodeVariety>
                  <previousNodeIds type="array">
                    <value type="string">prd_ord_dir</value>
                  </previousNodeIds>
                  <nextNodeIds type="array">
                    <value type="string">prd_ord_bre3</value>
                    <value type="string">prd_ord_prs2</value>
                  </nextNodeIds>
                  <plugins type="array" />
                  <x type="number">730</x>
                  <y type="number">290</y>
                  <startNodeFlag type="string">false</startNodeFlag>
                  <endNodeFlag type="string">false</endNodeFlag>
                  <traceId type="string">0.4-2.2-0.0</traceId>
                  <routeTemplateId type="null" />
                  <routeTemplateName type="null" />
                  <parentNode type="null" />
                </value>
                <value type="object">
                  <nodeId type="string">prd_ord_prs2</nodeId>
                  <nodeName type="string">President</nodeName>
                  <nodeType type="string">nodeTyp_Approve</nodeType>
                  <nodeVariety type="string">human</nodeVariety>
                  <previousNodeIds type="array">
                    <value type="string">prd_ord_brs3</value>
                  </previousNodeIds>
                  <nextNodeIds type="array">
                    <value type="string">prd_ord_bre3</value>
                  </nextNodeIds>
                  <plugins type="array">
                    <value type="object">
                      <routePluginId type="string">plg_prdord_06</routePluginId>
                      <routeId type="string">rte_prd_ord</routeId>
                      <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                      <nodeId type="string">prd_ord_prs2</nodeId>
                      <nodeType type="string">3</nodeType>
                      <extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.static</extensionPointId>
                      <pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.static.post</pluginId>
                      <parameter type="string">comp_sample_01^comp_sample_01^ps001</parameter>
                      <targetType type="string">post</targetType>
                      <targetCode type="string">comp_sample_01^comp_sample_01^ps001</targetCode>
                    </value>
                  </plugins>
                  <x type="number">910</x>
                  <y type="number">350</y>
                  <startNodeFlag type="string">false</startNodeFlag>
                  <endNodeFlag type="string">false</endNodeFlag>
                  <traceId type="string">0.4-2.2-2.1</traceId>
                  <routeTemplateId type="null" />
                  <routeTemplateName type="null" />
                  <parentNode type="null" />
                </value>
                <value type="object">
                  <nodeId type="string">prd_ord_bre3</nodeId>
                  <nodeName type="string">End branch</nodeName>
                  <nodeType type="string">nodeTyp_Branch_End</nodeType>
                  <nodeVariety type="string">system</nodeVariety>
                  <previousNodeIds type="array">
                    <value type="string">prd_ord_brs3</value>
                    <value type="string">prd_ord_prs2</value>
                  </previousNodeIds>
                  <nextNodeIds type="array">
                    <value type="string">prd_ord_bre1</value>
                  </nextNodeIds>
                  <plugins type="array" />
                  <x type="number">1040</x>
                  <y type="number">290</y>
                  <startNodeFlag type="string">false</startNodeFlag>
                  <endNodeFlag type="string">false</endNodeFlag>
                  <traceId type="string">0.4-2.2-0.0</traceId>
                  <routeTemplateId type="null" />
                  <routeTemplateName type="null" />
                  <parentNode type="null" />
                </value>
                <value type="object">
                  <nodeId type="string">prd_ord_bre1</nodeId>
                  <nodeName type="string">End branch</nodeName>
                  <nodeType type="string">nodeTyp_Branch_End</nodeType>
                  <nodeVariety type="string">system</nodeVariety>
                  <previousNodeIds type="array">
                    <value type="string">prd_ord_bre2</value>
                    <value type="string">prd_ord_bre3</value>
                  </previousNodeIds>
                  <nextNodeIds type="array">
                    <value type="string">prd_ord_end</value>
                  </nextNodeIds>
                  <plugins type="array" />
                  <x type="number">1150</x>
                  <y type="number">50</y>
                  <startNodeFlag type="string">false</startNodeFlag>
                  <endNodeFlag type="string">false</endNodeFlag>
                  <traceId type="string">0.4-0.0</traceId>
                  <routeTemplateId type="null" />
                  <routeTemplateName type="null" />
                  <parentNode type="null" />
                </value>
                <value type="object">
                  <nodeId type="string">prd_ord_end</nodeId>
                  <nodeName type="string">End</nodeName>
                  <nodeType type="string">nodeTyp_End</nodeType>
                  <nodeVariety type="string">system</nodeVariety>
                  <previousNodeIds type="array">
                    <value type="string">prd_ord_bre1</value>
                  </previousNodeIds>
                  <nextNodeIds type="array" />
                  <plugins type="array" />
                  <x type="number">1260</x>
                  <y type="number">50</y>
                  <startNodeFlag type="string">false</startNodeFlag>
                  <endNodeFlag type="string">true</endNodeFlag>
                  <traceId type="string">0.0</traceId>
                  <routeTemplateId type="null" />
                  <routeTemplateName type="null" />
                  <parentNode type="null" />
                </value>
              </nodes>
              <comments type="array" />
              <swimlanes type="array" />
            </routeXmlFile>
            <plugins type="array">
              <value type="object">
                <routePluginId type="string">plg_prdord_01</routePluginId>
                <routeId type="string">rte_prd_ord</routeId>
                <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                <nodeId type="string">prd_ord_apply</nodeId>
                <nodeType type="string">2</nodeType>
                <extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.node.apply</extensionPointId>
                <pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.apply.role</pluginId>
                <parameter type="string">im_workflow_user</parameter>
                <targetType type="string">role</targetType>
                <targetCode type="string">im_workflow_user</targetCode>
              </value>
              <value type="object">
                <routePluginId type="string">plg_prdord_02</routePluginId>
                <routeId type="string">rte_prd_ord</routeId>
                <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                <nodeId type="string">prd_ord_01</nodeId>
                <nodeType type="string">3</nodeType>
                <extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve</extensionPointId>
                <pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.department</pluginId>
                <parameter type="string">comp_sample_01^comp_sample_01^dept_sample_10</parameter>
                <targetType type="string">department</targetType>
                <targetCode type="string">comp_sample_01^comp_sample_01^dept_sample_10</targetCode>
              </value>
              <value type="object">
                <routePluginId type="string">plg_prdord_03</routePluginId>
                <routeId type="string">rte_prd_ord</routeId>
                <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                <nodeId type="string">prd_ord_02</nodeId>
                <nodeType type="string">3</nodeType>
                <extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve</extensionPointId>
                <pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.post</pluginId>
                <parameter type="string">comp_sample_01^comp_sample_01^ps003</parameter>
                <targetType type="string">post</targetType>
                <targetCode type="string">comp_sample_01^comp_sample_01^ps003</targetCode>
              </value>
              <value type="object">
                <routePluginId type="string">plg_prdord_04</routePluginId>
                <routeId type="string">rte_prd_ord</routeId>
                <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                <nodeId type="string">prd_ord_prs1</nodeId>
                <nodeType type="string">3</nodeType>
                <extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.static</extensionPointId>
                <pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.static.post</pluginId>
                <parameter type="string">comp_sample_01^comp_sample_01^ps001</parameter>
                <targetType type="string">post</targetType>
                <targetCode type="string">comp_sample_01^comp_sample_01^ps001</targetCode>
              </value>
              <value type="object">
                <routePluginId type="string">plg_prdord_05</routePluginId>
                <routeId type="string">rte_prd_ord</routeId>
                <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                <nodeId type="string">prd_ord_dir</nodeId>
                <nodeType type="string">3</nodeType>
                <extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.static</extensionPointId>
                <pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.static.post</pluginId>
                <parameter type="string">comp_sample_01^comp_sample_01^ps002</parameter>
                <targetType type="string">post</targetType>
                <targetCode type="string">comp_sample_01^comp_sample_01^ps002</targetCode>
              </value>
              <value type="object">
                <routePluginId type="string">plg_prdord_06</routePluginId>
                <routeId type="string">rte_prd_ord</routeId>
                <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                <nodeId type="string">prd_ord_prs2</nodeId>
                <nodeType type="string">3</nodeType>
                <extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.static</extensionPointId>
                <pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.static.post</pluginId>
                <parameter type="string">comp_sample_01^comp_sample_01^ps001</parameter>
                <targetType type="string">post</targetType>
                <targetCode type="string">comp_sample_01^comp_sample_01^ps001</targetCode>
              </value>
            </plugins>
          </value>
        </details>
      </value>
      <!-- locale: ja (same structure, only localeId/routeName differ. nodeName is same) -->
      <!-- locale: zh_CN (same structure, only localeId/routeName differ. nodeName is same) -->
    </value>
  </route>

  <!-- ============================================================ -->
  <!-- flow（フロー定義）                                            -->
  <!-- ============================================================ -->
  <flow id="flw_prd_ord">
    <value type="array">
      <!-- locale: en -->
        <flowId type="string">flw_prd_ord</flowId>
        <localeId type="string">en</localeId>
        <flowName type="string">Product Order</flowName>
        <note type="null" />
        <updateCount type="string">1</updateCount>
        <details type="array">
          <value type="object">
            <flowId type="string">flw_prd_ord</flowId>
            <flowVersionId type="string">flw_prd_ord_0</flowVersionId>
            <localeId type="string">en</localeId>
            <startDate type="string">2000/01/01</startDate>
            <limitDate type="string">2026/04/01</limitDate>
            <versionStatus type="string">9</versionStatus>
            <note type="null" />
            <contentsId type="null" />
            <routeId type="null" />
            <lumpProcessFlag type="null" />
            <lumpConfirmFlag type="null" />
            <attachFileFlag type="null" />
            <confirmUserSetupFlag type="null" />
            <completeMatterConfirmFlag type="null" />
            <autoProcessFlag type="null" />
            <autoProcessLimitDay type="null" />
            <autoProcessLimitType type="null" />
            <autoPressFlag type="null" />
            <autoPressLimitDay type="null" />
            <asyncProcessFlag type="null" />
            <sysDateTargetExpandFlag type="null" />
            <calendarId type="null" />
            <enabledContentsId type="null" />
            <contentsVersionId type="null" />
            <enabledRouteId type="null" />
            <routeVersionId type="null" />
            <handleUsers type="array" />
            <defaultOrgzs type="array" />
            <flows type="array" />
            <nodes type="array" />
          </value>
          <value type="object">
            <flowId type="string">flw_prd_ord</flowId>
            <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
            <localeId type="string">en</localeId>
            <startDate type="string">2026/04/02</startDate>
            <limitDate type="string">2999/12/31</limitDate>
            <versionStatus type="string">1</versionStatus>
            <note type="null" />
            <contentsId type="string">cnt_prd_ord</contentsId>
            <routeId type="string">rte_prd_ord</routeId>
            <lumpProcessFlag type="string">1</lumpProcessFlag>
            <lumpConfirmFlag type="string">1</lumpConfirmFlag>
            <attachFileFlag type="string">1</attachFileFlag>
            <confirmUserSetupFlag type="string">0</confirmUserSetupFlag>
            <completeMatterConfirmFlag type="string">0</completeMatterConfirmFlag>
            <autoProcessFlag type="string">0</autoProcessFlag>
            <autoProcessLimitDay type="null" />
            <autoProcessLimitType type="string">0</autoProcessLimitType>
            <autoPressFlag type="string">0</autoPressFlag>
            <autoPressLimitDay type="null" />
            <asyncProcessFlag type="null" />
            <sysDateTargetExpandFlag type="null" />
            <calendarId type="null" />
            <enabledContentsId type="null" />
            <contentsVersionId type="null" />
            <enabledRouteId type="null" />
            <routeVersionId type="null" />
            <handleUsers type="array">
              <value type="object">
                <no type="string">y3Z4a5B6c7D8e9F</no>
                <flowId type="string">flw_prd_ord</flowId>
                <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                <extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.administrator.flow.handle</extensionPointId>
                <pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.administrator.flow.handle.role</pluginId>
                <parameter type="string">im_workflow_user</parameter>
                <targetType type="string">role</targetType>
                <targetCode type="string">im_workflow_user</targetCode>
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
            </handleUsers>
            <defaultOrgzs type="array" />
            <flows type="array" />
            <nodes type="array">
              <value type="object">
                <flowId type="string">flw_prd_ord</flowId>
                <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                <nodeId type="string">prd_ord_apply</nodeId>
                <nodeType type="string">2</nodeType>
                <lumpProcessFlag type="string">1</lumpProcessFlag>
                <attachFileFlag type="string">2</attachFileFlag>
                <autoProcessFlag type="string">0</autoProcessFlag>
                <autoProcessLimitDay type="null" />
                <autoProcessLimitType type="string">0</autoProcessLimitType>
                <autoPressFlag type="string">0</autoPressFlag>
                <autoPressLimitDay type="null" />
                <localeId type="string">en</localeId>
                <details type="array" />
                <attributes type="array" />
                <unions type="array" />
                <routeNode type="null" />
              </value>
              <value type="object">
                <flowId type="string">flw_prd_ord</flowId>
                <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                <nodeId type="string">prd_ord_01</nodeId>
                <nodeType type="string">3</nodeType>
                <lumpProcessFlag type="string">1</lumpProcessFlag>
                <attachFileFlag type="string">0</attachFileFlag>
                <autoProcessFlag type="string">0</autoProcessFlag>
                <autoProcessLimitDay type="null" />
                <autoProcessLimitType type="string">0</autoProcessLimitType>
                <autoPressFlag type="string">0</autoPressFlag>
                <autoPressLimitDay type="null" />
                <localeId type="string">en</localeId>
                <details type="array" />
                <attributes type="array">
                  <value type="object">
                    <no type="string">i8J9k0L1m2N3o4P</no>
                    <flowId type="string">flw_prd_ord</flowId>
                    <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                    <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                    <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                    <nodeId type="string">prd_ord_01</nodeId>
                    <localeId type="string">en</localeId>
                    <attributeType type="string">1</attributeType>
                    <attributeKey type="string">5</attributeKey>
                    <value type="string">0</value>
                  </value>
                </attributes>
                <unions type="array" />
                <routeNode type="null" />
              </value>
              <value type="object">
                <flowId type="string">flw_prd_ord</flowId>
                <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                <nodeId type="string">prd_ord_02</nodeId>
                <nodeType type="string">3</nodeType>
                <lumpProcessFlag type="string">1</lumpProcessFlag>
                <attachFileFlag type="string">0</attachFileFlag>
                <autoProcessFlag type="string">0</autoProcessFlag>
                <autoProcessLimitDay type="null" />
                <autoProcessLimitType type="string">0</autoProcessLimitType>
                <autoPressFlag type="string">0</autoPressFlag>
                <autoPressLimitDay type="null" />
                <localeId type="string">en</localeId>
                <details type="array" />
                <attributes type="array">
                  <value type="object">
                    <no type="string">q5R6s7T8u9V0w1X</no>
                    <flowId type="string">flw_prd_ord</flowId>
                    <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                    <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                    <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                    <nodeId type="string">prd_ord_02</nodeId>
                    <localeId type="string">en</localeId>
                    <attributeType type="string">1</attributeType>
                    <attributeKey type="string">5</attributeKey>
                    <value type="string">0</value>
                  </value>
                </attributes>
                <unions type="array" />
                <routeNode type="null" />
              </value>
              <value type="object">
                <flowId type="string">flw_prd_ord</flowId>
                <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                <nodeId type="string">prd_ord_brs1</nodeId>
                <nodeType type="string">9</nodeType>
                <lumpProcessFlag type="null" />
                <attachFileFlag type="null" />
                <autoProcessFlag type="null" />
                <autoProcessLimitDay type="null" />
                <autoProcessLimitType type="null" />
                <autoPressFlag type="null" />
                <autoPressLimitDay type="null" />
                <localeId type="string">en</localeId>
                <details type="array">
                  <value type="object">
                    <no type="string">m7N8o9P0q1R2s3T</no>
                    <flowId type="string">flw_prd_ord</flowId>
                    <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                    <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                    <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                    <nodeId type="string">prd_ord_brs1</nodeId>
                    <cooperationType type="string">19</cooperationType>
                    <cooperationClassify type="string">2</cooperationClassify>
                    <cooperationId type="string">rule_prd_ord_01</cooperationId>
                    <emptyFlag type="string">0</emptyFlag>
                  </value>
                  <value type="object">
                    <no type="string">u4V5w6X7y8Z9a0B</no>
                    <flowId type="string">flw_prd_ord</flowId>
                    <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                    <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                    <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                    <nodeId type="string">prd_ord_brs1</nodeId>
                    <cooperationType type="string">19</cooperationType>
                    <cooperationClassify type="string">2</cooperationClassify>
                    <cooperationId type="string">rule_prd_ord_02</cooperationId>
                    <emptyFlag type="string">0</emptyFlag>
                  </value>
                </details>
                <attributes type="array">
                  <value type="object">
                    <no type="string">y2Z3a4B5c6D7e8F</no>
                    <flowId type="string">flw_prd_ord</flowId>
                    <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                    <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                    <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                    <nodeId type="string">prd_ord_brs1</nodeId>
                    <localeId type="string">en</localeId>
                    <attributeType type="string">7</attributeType>
                    <attributeKey type="string">NoSetting</attributeKey>
                    <value type="string">1</value>
                  </value>
                </attributes>
                <unions type="array">
                  <value type="object">
                    <branchUnionId type="string">m7N8o9P0q1R2s3T</branchUnionId>
                    <flowId type="string">flw_prd_ord</flowId>
                    <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                    <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                    <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                    <nodeId type="string">prd_ord_brs1</nodeId>
                    <branchUnionGroupId type="string">s5T6u7V8w9X0y1Z</branchUnionGroupId>
                    <branchUnionGroupClassify type="string">0</branchUnionGroupClassify>
                    <countTrue type="string">1</countTrue>
                    <countTargetNodeId type="string">prd_ord_brs2</countTargetNodeId>
                  </value>
                  <value type="object">
                    <branchUnionId type="string">u4V5w6X7y8Z9a0B</branchUnionId>
                    <flowId type="string">flw_prd_ord</flowId>
                    <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                    <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                    <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                    <nodeId type="string">prd_ord_brs1</nodeId>
                    <branchUnionGroupId type="string">a2B3c4D5e6F7g8H</branchUnionGroupId>
                    <branchUnionGroupClassify type="string">0</branchUnionGroupClassify>
                    <countTrue type="string">1</countTrue>
                    <countTargetNodeId type="string">prd_ord_dir</countTargetNodeId>
                  </value>
                </unions>
                <routeNode type="null" />
              </value>
              <value type="object">
                <flowId type="string">flw_prd_ord</flowId>
                <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                <nodeId type="string">prd_ord_brs2</nodeId>
                <nodeType type="string">9</nodeType>
                <lumpProcessFlag type="null" />
                <attachFileFlag type="null" />
                <autoProcessFlag type="null" />
                <autoProcessLimitDay type="null" />
                <autoProcessLimitType type="null" />
                <autoPressFlag type="null" />
                <autoPressLimitDay type="null" />
                <localeId type="string">en</localeId>
                <details type="array">
                  <value type="object">
                    <no type="string">c1D2e3F4g5H6i7J</no>
                    <flowId type="string">flw_prd_ord</flowId>
                    <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                    <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                    <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                    <nodeId type="string">prd_ord_brs2</nodeId>
                    <cooperationType type="string">19</cooperationType>
                    <cooperationClassify type="string">2</cooperationClassify>
                    <cooperationId type="string">rule_prd_ord_03</cooperationId>
                    <emptyFlag type="string">0</emptyFlag>
                  </value>
                  <value type="object">
                    <no type="string">k8L9m0N1o2P3q4R</no>
                    <flowId type="string">flw_prd_ord</flowId>
                    <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                    <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                    <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                    <nodeId type="string">prd_ord_brs2</nodeId>
                    <cooperationType type="string">19</cooperationType>
                    <cooperationClassify type="string">2</cooperationClassify>
                    <cooperationId type="string">rule_prd_ord_04</cooperationId>
                    <emptyFlag type="string">0</emptyFlag>
                  </value>
                </details>
                <attributes type="array">
                  <value type="object">
                    <no type="string">f0G1h2I3j4K5l6M</no>
                    <flowId type="string">flw_prd_ord</flowId>
                    <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                    <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                    <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                    <nodeId type="string">prd_ord_brs2</nodeId>
                    <localeId type="string">en</localeId>
                    <attributeType type="string">7</attributeType>
                    <attributeKey type="string">NoSetting</attributeKey>
                    <value type="string">1</value>
                  </value>
                </attributes>
                <unions type="array">
                  <value type="object">
                    <branchUnionId type="string">c1D2e3F4g5H6i7J</branchUnionId>
                    <flowId type="string">flw_prd_ord</flowId>
                    <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                    <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                    <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                    <nodeId type="string">prd_ord_brs2</nodeId>
                    <branchUnionGroupId type="string">i9J0k1L2m3N4o5P</branchUnionGroupId>
                    <branchUnionGroupClassify type="string">0</branchUnionGroupClassify>
                    <countTrue type="string">1</countTrue>
                    <countTargetNodeId type="string">prd_ord_bre2</countTargetNodeId>
                  </value>
                  <value type="object">
                    <branchUnionId type="string">k8L9m0N1o2P3q4R</branchUnionId>
                    <flowId type="string">flw_prd_ord</flowId>
                    <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                    <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                    <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                    <nodeId type="string">prd_ord_brs2</nodeId>
                    <branchUnionGroupId type="string">q6R7s8T9u0V1w2X</branchUnionGroupId>
                    <branchUnionGroupClassify type="string">0</branchUnionGroupClassify>
                    <countTrue type="string">1</countTrue>
                    <countTargetNodeId type="string">prd_ord_prs1</countTargetNodeId>
                  </value>
                </unions>
                <routeNode type="null" />
              </value>
              <value type="object">
                <flowId type="string">flw_prd_ord</flowId>
                <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                <nodeId type="string">prd_ord_prs1</nodeId>
                <nodeType type="string">3</nodeType>
                <lumpProcessFlag type="string">1</lumpProcessFlag>
                <attachFileFlag type="string">0</attachFileFlag>
                <autoProcessFlag type="string">0</autoProcessFlag>
                <autoProcessLimitDay type="null" />
                <autoProcessLimitType type="string">0</autoProcessLimitType>
                <autoPressFlag type="string">0</autoPressFlag>
                <autoPressLimitDay type="null" />
                <localeId type="string">en</localeId>
                <details type="array" />
                <attributes type="array">
                  <value type="object">
                    <no type="string">n7O8p9Q0r1S2t3U</no>
                    <flowId type="string">flw_prd_ord</flowId>
                    <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                    <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                    <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                    <nodeId type="string">prd_ord_prs1</nodeId>
                    <localeId type="string">en</localeId>
                    <attributeType type="string">1</attributeType>
                    <attributeKey type="string">5</attributeKey>
                    <value type="string">0</value>
                  </value>
                </attributes>
                <unions type="array" />
                <routeNode type="null" />
              </value>
              <value type="object">
                <flowId type="string">flw_prd_ord</flowId>
                <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                <nodeId type="string">prd_ord_bre2</nodeId>
                <nodeType type="string">10</nodeType>
                <lumpProcessFlag type="null" />
                <attachFileFlag type="null" />
                <autoProcessFlag type="null" />
                <autoProcessLimitDay type="null" />
                <autoProcessLimitType type="null" />
                <autoPressFlag type="null" />
                <autoPressLimitDay type="null" />
                <localeId type="string">en</localeId>
                <details type="array" />
                <attributes type="array" />
                <unions type="array" />
                <routeNode type="null" />
              </value>
              <value type="object">
                <flowId type="string">flw_prd_ord</flowId>
                <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                <nodeId type="string">prd_ord_dir</nodeId>
                <nodeType type="string">3</nodeType>
                <lumpProcessFlag type="string">1</lumpProcessFlag>
                <attachFileFlag type="string">0</attachFileFlag>
                <autoProcessFlag type="string">0</autoProcessFlag>
                <autoProcessLimitDay type="null" />
                <autoProcessLimitType type="string">0</autoProcessLimitType>
                <autoPressFlag type="string">0</autoPressFlag>
                <autoPressLimitDay type="null" />
                <localeId type="string">en</localeId>
                <details type="array" />
                <attributes type="array">
                  <value type="object">
                    <no type="string">v4W5x6Y7z8A9b0C</no>
                    <flowId type="string">flw_prd_ord</flowId>
                    <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                    <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                    <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                    <nodeId type="string">prd_ord_dir</nodeId>
                    <localeId type="string">en</localeId>
                    <attributeType type="string">1</attributeType>
                    <attributeKey type="string">5</attributeKey>
                    <value type="string">0</value>
                  </value>
                </attributes>
                <unions type="array" />
                <routeNode type="null" />
              </value>
              <value type="object">
                <flowId type="string">flw_prd_ord</flowId>
                <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                <nodeId type="string">prd_ord_brs3</nodeId>
                <nodeType type="string">9</nodeType>
                <lumpProcessFlag type="null" />
                <attachFileFlag type="null" />
                <autoProcessFlag type="null" />
                <autoProcessLimitDay type="null" />
                <autoProcessLimitType type="null" />
                <autoPressFlag type="null" />
                <autoPressLimitDay type="null" />
                <localeId type="string">en</localeId>
                <details type="array">
                  <value type="object">
                    <no type="string">t5U6v7W8x9Y0z1A</no>
                    <flowId type="string">flw_prd_ord</flowId>
                    <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                    <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                    <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                    <nodeId type="string">prd_ord_brs3</nodeId>
                    <cooperationType type="string">19</cooperationType>
                    <cooperationClassify type="string">2</cooperationClassify>
                    <cooperationId type="string">rule_prd_ord_03</cooperationId>
                    <emptyFlag type="string">0</emptyFlag>
                  </value>
                  <value type="object">
                    <no type="string">b2C3d4E5f6G7h8I</no>
                    <flowId type="string">flw_prd_ord</flowId>
                    <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                    <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                    <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                    <nodeId type="string">prd_ord_brs3</nodeId>
                    <cooperationType type="string">19</cooperationType>
                    <cooperationClassify type="string">2</cooperationClassify>
                    <cooperationId type="string">rule_prd_ord_04</cooperationId>
                    <emptyFlag type="string">0</emptyFlag>
                  </value>
                </details>
                <attributes type="array">
                  <value type="object">
                    <no type="string">d1E2f3G4h5I6j7K</no>
                    <flowId type="string">flw_prd_ord</flowId>
                    <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                    <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                    <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                    <nodeId type="string">prd_ord_brs3</nodeId>
                    <localeId type="string">en</localeId>
                    <attributeType type="string">7</attributeType>
                    <attributeKey type="string">NoSetting</attributeKey>
                    <value type="string">1</value>
                  </value>
                </attributes>
                <unions type="array">
                  <value type="object">
                    <branchUnionId type="string">t5U6v7W8x9Y0z1A</branchUnionId>
                    <flowId type="string">flw_prd_ord</flowId>
                    <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                    <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                    <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                    <nodeId type="string">prd_ord_brs3</nodeId>
                    <branchUnionGroupId type="string">j9K0l1M2n3O4p5Q</branchUnionGroupId>
                    <branchUnionGroupClassify type="string">0</branchUnionGroupClassify>
                    <countTrue type="string">1</countTrue>
                    <countTargetNodeId type="string">prd_ord_bre3</countTargetNodeId>
                  </value>
                  <value type="object">
                    <branchUnionId type="string">b2C3d4E5f6G7h8I</branchUnionId>
                    <flowId type="string">flw_prd_ord</flowId>
                    <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                    <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                    <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                    <nodeId type="string">prd_ord_brs3</nodeId>
                    <branchUnionGroupId type="string">r6S7t8U9v0W1x2Y</branchUnionGroupId>
                    <branchUnionGroupClassify type="string">0</branchUnionGroupClassify>
                    <countTrue type="string">1</countTrue>
                    <countTargetNodeId type="string">prd_ord_prs2</countTargetNodeId>
                  </value>
                </unions>
                <routeNode type="null" />
              </value>
              <value type="object">
                <flowId type="string">flw_prd_ord</flowId>
                <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                <nodeId type="string">prd_ord_prs2</nodeId>
                <nodeType type="string">3</nodeType>
                <lumpProcessFlag type="string">1</lumpProcessFlag>
                <attachFileFlag type="string">0</attachFileFlag>
                <autoProcessFlag type="string">0</autoProcessFlag>
                <autoProcessLimitDay type="null" />
                <autoProcessLimitType type="string">0</autoProcessLimitType>
                <autoPressFlag type="string">0</autoPressFlag>
                <autoPressLimitDay type="null" />
                <localeId type="string">en</localeId>
                <details type="array" />
                <attributes type="array">
                  <value type="object">
                    <no type="string">l8M9n0O1p2Q3r4S</no>
                    <flowId type="string">flw_prd_ord</flowId>
                    <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                    <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                    <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                    <nodeId type="string">prd_ord_prs2</nodeId>
                    <localeId type="string">en</localeId>
                    <attributeType type="string">1</attributeType>
                    <attributeKey type="string">5</attributeKey>
                    <value type="string">0</value>
                  </value>
                </attributes>
                <unions type="array" />
                <routeNode type="null" />
              </value>
              <value type="object">
                <flowId type="string">flw_prd_ord</flowId>
                <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                <nodeId type="string">prd_ord_bre3</nodeId>
                <nodeType type="string">10</nodeType>
                <lumpProcessFlag type="null" />
                <attachFileFlag type="null" />
                <autoProcessFlag type="null" />
                <autoProcessLimitDay type="null" />
                <autoProcessLimitType type="null" />
                <autoPressFlag type="null" />
                <autoPressLimitDay type="null" />
                <localeId type="string">en</localeId>
                <details type="array" />
                <attributes type="array" />
                <unions type="array" />
                <routeNode type="null" />
              </value>
              <value type="object">
                <flowId type="string">flw_prd_ord</flowId>
                <flowVersionId type="string">flw_prd_ord_1</flowVersionId>
                <contentsVersionId type="string">cnt_prd_ord_1</contentsVersionId>
                <routeVersionId type="string">rte_prd_ord_1</routeVersionId>
                <nodeId type="string">prd_ord_bre1</nodeId>
                <nodeType type="string">10</nodeType>
                <lumpProcessFlag type="null" />
                <attachFileFlag type="null" />
                <autoProcessFlag type="null" />
                <autoProcessLimitDay type="null" />
                <autoProcessLimitType type="null" />
                <autoPressFlag type="null" />
                <autoPressLimitDay type="null" />
                <localeId type="string">en</localeId>
                <details type="array" />
                <attributes type="array" />
                <unions type="array" />
                <routeNode type="null" />
              </value>
            </nodes>
          </value>
        </details>
      </value>
      <!-- locale: ja (same structure, only localeId/flowName differ) -->
      <!-- locale: zh_CN (same structure, only localeId/flowName differ) -->
    </value>
  </flow>

  <!-- ============================================================ -->
  <!-- matter_property（案件プロパティ）              -->
  <!-- ============================================================ -->
  <matter_property id="unitPrice">
    <value type="array">
      <value type="object">
        <matterPropertyKey type="string">unitPrice</matterPropertyKey>
        <localeId type="string">en</localeId>
        <matterPropertyName type="string">Unit Price</matterPropertyName>
        <matterPropertyModelType type="string">1</matterPropertyModelType>
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
      <!-- locale: ja (same structure, only localeId/matterPropertyName differ) -->
      <!-- locale: zh_CN (same structure, only localeId/matterPropertyName differ) -->
    </value>
  </matter_property>
  <matter_property id="totalAmount">
    <value type="array">
      <value type="object">
        <matterPropertyKey type="string">totalAmount</matterPropertyKey>
        <localeId type="string">en</localeId>
        <matterPropertyName type="string">Total Amount</matterPropertyName>
        <matterPropertyModelType type="string">1</matterPropertyModelType>
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
      <!-- locale: ja (same structure, only localeId/matterPropertyName differ) -->
      <!-- locale: zh_CN (same structure, only localeId/matterPropertyName differ) -->
    </value>
  </matter_property>

  <!-- ============================================================ -->
  <!-- rule（分岐ルール）                            -->
  <!-- ============================================================ -->
  <rule id="rule_prd_ord_01">
    <value type="array">
      <value type="object">
        <ruleId type="string">rule_prd_ord_01</ruleId>
        <localeId type="string">en</localeId>
        <ruleName type="string">UnitPrice less than 20000</ruleName>
        <note type="null" />
        <ruleUnionCondition type="string">0</ruleUnionCondition>
        <updateCount type="string">1</updateCount>
        <ruleDetailModel type="array">
          <value type="object">
            <no type="string">rule_prd_ord_01_1</no>
            <ruleId type="string">rule_prd_ord_01</ruleId>
            <compareRuleId type="string">8</compareRuleId>
            <compareVariable type="string">unitPrice</compareVariable>
            <conditionValue type="string">20000</conditionValue>
            <conditionValueType type="string">0</conditionValueType>
          </value>
        </ruleDetailModel>
      </value>
      <!-- locale: ja (same structure, only localeId/ruleName differ) -->
      <!-- locale: zh_CN (same structure, only localeId/ruleName differ) -->
    </value>
  </rule>
  <rule id="rule_prd_ord_02">
    <value type="array">
      <value type="object">
        <ruleId type="string">rule_prd_ord_02</ruleId>
        <localeId type="string">en</localeId>
        <ruleName type="string">UnitPrice 20000 or more</ruleName>
        <note type="null" />
        <ruleUnionCondition type="string">0</ruleUnionCondition>
        <updateCount type="string">1</updateCount>
        <ruleDetailModel type="array">
          <value type="object">
            <no type="string">rule_prd_ord_02_1</no>
            <ruleId type="string">rule_prd_ord_02</ruleId>
            <compareRuleId type="string">7</compareRuleId>
            <compareVariable type="string">unitPrice</compareVariable>
            <conditionValue type="string">20000</conditionValue>
            <conditionValueType type="string">0</conditionValueType>
          </value>
        </ruleDetailModel>
      </value>
      <!-- locale: ja (same structure, only localeId/ruleName differ) -->
      <!-- locale: zh_CN (same structure, only localeId/ruleName differ) -->
    </value>
  </rule>
  <rule id="rule_prd_ord_03">
    <value type="array">
      <value type="object">
        <ruleId type="string">rule_prd_ord_03</ruleId>
        <localeId type="string">en</localeId>
        <ruleName type="string">Total less than 100000</ruleName>
        <note type="null" />
        <ruleUnionCondition type="string">0</ruleUnionCondition>
        <updateCount type="string">1</updateCount>
        <ruleDetailModel type="array">
          <value type="object">
            <no type="string">rule_prd_ord_03_1</no>
            <ruleId type="string">rule_prd_ord_03</ruleId>
            <compareRuleId type="string">8</compareRuleId>
            <compareVariable type="string">totalAmount</compareVariable>
            <conditionValue type="string">100000</conditionValue>
            <conditionValueType type="string">0</conditionValueType>
          </value>
        </ruleDetailModel>
      </value>
      <!-- locale: ja (same structure, only localeId/ruleName differ) -->
      <!-- locale: zh_CN (same structure, only localeId/ruleName differ) -->
    </value>
  </rule>
  <rule id="rule_prd_ord_04">
    <value type="array">
      <value type="object">
        <ruleId type="string">rule_prd_ord_04</ruleId>
        <localeId type="string">en</localeId>
        <ruleName type="string">Total 100000 or more</ruleName>
        <note type="null" />
        <ruleUnionCondition type="string">0</ruleUnionCondition>
        <updateCount type="string">1</updateCount>
        <ruleDetailModel type="array">
          <value type="object">
            <no type="string">rule_prd_ord_04_1</no>
            <ruleId type="string">rule_prd_ord_04</ruleId>
            <compareRuleId type="string">7</compareRuleId>
            <compareVariable type="string">totalAmount</compareVariable>
            <conditionValue type="string">100000</conditionValue>
            <conditionValueType type="string">0</conditionValueType>
          </value>
        </ruleDetailModel>
      </value>
      <!-- locale: ja (same structure, only localeId/ruleName differ) -->
      <!-- locale: zh_CN (same structure, only localeId/ruleName differ) -->
    </value>
  </rule>

</data>
```

## 構造の詳細

XML の構造規則（タグ名・ロケール・バージョン・プラグイン二重登録・ID 命名規則等）は以下を参照:

- `reference/xml-structure.md` - 全体構造・ロケール・バージョン・nodeName の多言語非対応ルール等
- `reference/node-types.md` - ノード種別・traceId 規則・プラグイン設定
- `assets/template-branch.md` - 分岐ルートのテンプレート・ネスト分岐・複合条件の実現方法
