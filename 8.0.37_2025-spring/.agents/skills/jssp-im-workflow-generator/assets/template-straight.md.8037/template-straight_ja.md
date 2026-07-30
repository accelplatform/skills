# 直線ルート XML テンプレート

## 概要

最もシンプルなワークフロー定義。
`Start → Apply → Approve（1つ以上） → End` の直線構成。

## ルート図

```
[Start] → [Apply] → [Approve1] → [Approve2] → ... → [End]
```

## 使用例

「購買申請のワークフロー定義を作って。申請→課長承認→部長承認→完了の直線ルートで」

## パラメータ

| パラメータ | 必須 | 説明 | 例 |
|-----------|------|------|-----|
| name | YES | ワークフロー名（ID生成に使用。**バージョンID が 20 文字以内になるよう調整**。長い場合は接頭辞を `cnt_`/`rte_`/`flw_` に短縮。詳細は `reference/xml-structure.md` の ID 命名規則を参照） | `purchase` |
| short | YES | プラグインID用の短縮名（`plg_{short}_NN` が20文字以内になるよう） | `purch` |
| flowName_ja | YES | フロー名（日本語） | `購買申請` |
| flowName_en | YES | フロー名（英語） | `Purchase Request` |
| flowName_zh | YES | フロー名（中国語） | `采购申请` |
| contentsName_ja | NO | コンテンツ名（省略時はフロー名） | - |
| routeName_ja | NO | ルート名（省略時はフロー名） | - |
| screenBasePath | YES | 画面 JSSP ファイルのベースパス（`src/main/jssp/src/` からの相対パス）。ルーティング URL ではなく、実際のファイル配置場所を指定する | `wf_purchase` |
| approveNodes | YES | 承認ノード定義の配列 | 下記参照 |

### approveNodes 定義

```
[
  { nodeName: "Manager", targetType: "role", targetCode: "im_workflow_user" },
  { nodeName: "Director", targetType: "role", targetCode: "im_workflow_user" }
]
```

**注意:** `nodeName` は全ロケールで共通の英語名を使用する（多言語対応しない）。

## テンプレート

XML の全体構造（タグ名・ネスト・プロパティ順序）は `assets/sample-complete-branch.md` に厳密に従う。
以下では直線ルート固有のノード構成・接続・座標・フロー設定のみを記述する。

### contents セクション

`sample-complete-branch.md` の contents セクションと同一構造。以下のみ置換:

| 項目 | 値 |
|------|-----|
| contentsId | `contents_{{name}}` |
| contentsVersionId | `contents_{{name}}_0`（blank）/ `contents_{{name}}_1`（active） |
| contentsName | ロケールに応じた名称 |
| pagePathId | `{{name}}_page_0` 〜 `{{name}}_page_7` |
| scriptPath | 下記 scriptPath 対応表 |
| plugins | 空配列（直線ルートでは rule 不使用） |
| rules | 空配列 |

#### scriptPath 対応表

| pageType | scriptPath |
|----------|-----------|
| 0〜3（申請系） | `{{screenBasePath}}/apply/index` |
| 4（処理） | `{{screenBasePath}}/approve/index` |
| 5（確認） | `{{screenBasePath}}/confirm/index` |
| 6〜7（詳細系） | `{{screenBasePath}}/detail/index` |

#### pageName のロケール対応表

| pageType | ja | en | zh_CN |
|----------|-----|-----|-------|
| 0 | 申請 | Apply | 申请 |
| 1 | 一時保存 | Temporary save | 临时保存 |
| 2 | 申請（処理） | Apply (task) | 申请（处理） |
| 3 | 再申請 | Re-apply | 重新申请 |
| 4 | 処理 | Process | 处理 |
| 5 | 確認 | Confirm | 确认 |
| 6 | 処理詳細 | Process details | 处理详细 |
| 7 | 参照詳細 | Refer details | 参照详细 |

---

### route セクション

#### ノード定義

| nodeId | nodeName | nodeType | nodeVariety | prev → next | plugins |
|--------|----------|----------|-------------|-------------|---------|
| `{{name}}_start` | Start | nodeTyp_Start | system | (なし) → apply | 空 |
| `{{name}}_apply` | Apply | nodeTyp_Apply | human | start → approve_1 | 申請権限 `plg_{{short}}_01` |
| `{{name}}_approve_{{N}}` | {{approveNodeName}} | nodeTyp_Approve | human | 前ノード → 次ノード | 承認権限 `plg_{{short}}_{{NN}}` |
| `{{name}}_end` | End | nodeTyp_End | system | 最後の approve → (なし) | 空 |

- `{{N}}` は 1 から連番。`{{NN}}` は 02 から連番（01 は Apply 用）
- Start の `startNodeFlag` = `true`、End の `endNodeFlag` = `true`、他は両方 `false`
- Start/End の `traceId` = `0.0`、Apply = `0.1`、Approve_N = `0.{{N+1}}`

#### プラグイン設定

**Apply ノード:**

| プロパティ | 値 |
|-----------|-----|
| routePluginId | `plg_{{short}}_01` |
| nodeType | `2` |
| extensionPointId | `jp.co.intra_mart.workflow.plugin.authority.node.apply` |
| pluginId | `jp.co.intra_mart.workflow.plugin.authority.node.apply.role` |
| parameter / targetCode | `im_workflow_user` |
| targetType | `role` |

**Approve ノード:**
- extensionPointId: 直前が人間ノード → `approve`、直前がシステムノード → `approve.static`
- pluginId / parameter / targetType / targetCode: `reference/authority-plugins.md`「承認者指示のデフォルト解釈ルール」に従う
- **ルートレベルの plugins にも同一内容を再掲すること**

#### 座標計算式

| ノード | x | y |
|--------|---|---|
| Start | 50 | 50 |
| Apply | 160 | 50 |
| Approve_N | 160 + N * 110 | 50 |
| End | 160 + (承認数 + 1) * 110 | 50 |

#### 座標の折り返し

ルートデザイナのサイズは **10000 x 5000 px**。
x 座標が 9500 を超える場合は折り返す。

```
[Node1] → [Node2] → ... → [NodeN] →
                                     ↓
[NodeN+3] ← [NodeN+2] ← [NodeN+1] ←
↓
[NodeN+4] → [NodeN+5] → ...
```

折り返し規則:
- x が 9500 を超えたら次のノードを折り返す
- 折り返し時の y = その行で配置した全ノードの最大 y 値 + 50
- 折り返し時の x は 50 に戻す
- 奇数行は左→右、偶数行は右→左（蛇行配置）

---

### flow セクション

`sample-complete-branch.md` の flow セクションと同一構造。直線ルート固有の差異は以下の通り。

#### フロー設定（active バージョン）

- `contentsId`: `contents_{{name}}`
- `routeId`: `route_{{name}}`
- `handleUsers`: 参照者設定（`reference/xml-structure.md` 参照。設定は任意）
- `nodes`: Apply + 各 Approve ノード（Start/End は含めない）

#### フローノード定義

| nodeId | nodeType | attachFileFlag | details | attributes | unions |
|--------|----------|---------------|---------|------------|--------|
| `{{name}}_apply` | `2` | `2` | 空配列 | 空配列 | 空配列 |
| `{{name}}_approve_{{N}}` | `3` | `0` | 空配列 | 空配列 | 空配列 |

全フローノード共通:
- `lumpProcessFlag`: `1`
- `autoProcessFlag`: `0` / `autoProcessLimitDay`: null / `autoProcessLimitType`: `0`
- `autoPressFlag`: `0` / `autoPressLimitDay`: null
- `routeNode`: null

**直線ルートでは details / attributes / unions は全て空配列。**
分岐ルートとの違い: 分岐では Branch_Start のフローノードに details（ルール紐付け）/ unions（パス定義）/ attributes（分岐方式）を設定する。

---

## 生成チェックリスト

- [ ] `reference/xml-structure.md` の共通規則（3ロケール・2バージョン・プラグイン二重記述・ID命名規則）を満たしている
- [ ] contents / route / flow の ID が一貫している
- [ ] ノードの previousNodeIds / nextNodeIds が双方向で整合している
- [ ] フローの contentsId / routeId がそれぞれの定義と一致している
- [ ] フローの nodes 内の contentsVersionId / routeVersionId が正しい
- [ ] X 座標が重複していない
