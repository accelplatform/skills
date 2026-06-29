# 横配置（順次）ルート XML テンプレート

## 概要

複数の承認者が**順番に**（1人ずつ順次）処理を行う横配置ルート。
ノードが横に1列につながり、配置順に上から順番に承認する。
`nodeTyp_Horizontal` ノードを使用し、フローの `attributes` で承認者数を設定する。
承認者の数はフロー設定時に動的に決定できる。

## ルート図

```
[Start] → [Apply] → [Horizontal] → [End]
                      承認者1 → 承認者2 → ... → 承認者N（順番に処理）
```

## 使用例

- 「経費申請。課長・部長・本部長の3人が順番に承認する横配置ルートで」
- 「稟議申請。承認者の人数が案件ごとに異なるので、動的に承認者を追加できるようにしたい」

## パラメータ

template-straight.md のパラメータに加え:

| パラメータ | 必須 | 説明 | 例 |
|-----------|------|------|-----|
| horizontalName_ja | YES | 横配置ノード名（日本語） | `順次承認` |
| horizontalName_en | YES | 横配置ノード名（英語） | `Sequential approval` |

## contents セクション

直線ルートと同一。template-straight.md を参照。

## route セクション（横配置固有部分）

横配置ルートでは、Apply と End の間に `nodeTyp_Horizontal` ノードを 1 つ配置する。
横配置ノードにはプラグインを設定せず、承認者の割り当てはフロー側で行う。

#### ノード定義

XML の全体構造は `sample-complete-branch.md` に従う。

| nodeId | nodeName | nodeType | nodeVariety | prev | next | plugins | x | traceId |
|--------|----------|----------|-------------|------|------|---------|----|---------|
| `{{name}}_start` | Start | nodeTyp_Start | system | (なし) | apply | 空 | 50 | 0.0 |
| `{{name}}_apply` | Apply | nodeTyp_Apply | human | start | horizontal | 申請権限 | 160 | 0.1 |
| `{{name}}_horizontal` | {{horizontalNodeName}} | nodeTyp_Horizontal | human | apply | end | **空** | 260 | 0.2-0.0 |
| `{{name}}_end` | End | nodeTyp_End | system | horizontal | (なし) | 空 | 360 | 0.0 |

- Horizontal ノードの plugins は**空配列**（承認者の割り当てはフロー側で行う）
- 全ノード y=50

ルートレベルの `plugins` には Apply のプラグインのみ記述する（Horizontal ノードにはプラグイン不要）。

### 座標計算式（横配置ルート）

| ノード | x 座標 | y 座標 |
|--------|--------|--------|
| Start | 50 | 50 |
| Apply | 160 | 50 |
| Horizontal | 260 | 50 |
| End | 360 | 50 |

座標の折り返し規則は template-straight.md を参照（ルートデザイナ: 10000 x 5000 px、x > 9500 で折り返し）。

## flow セクション（横配置固有部分）

横配置ノードのフロー設定では `nodeType` を `11`（Horizontal）とし、`attributes` で承認者の配置数を設定する。

| nodeId | nodeType | フラグ類 | details | unions |
|--------|----------|---------|---------|--------|
| `{{name}}_horizontal` | `11` | 全て null | 空配列 | 空配列 |

#### attributes（1エントリのみ）

| プロパティ | 値 | 説明 |
|-----------|-----|------|
| no | ランダムID（15桁、`[0-9A-Za-z]`）| ロケール間で共有 |
| attributeType | `1` | ノード属性 |
| attributeKey | `5` | 横配置の設定 |
| value | `0` | デフォルト（フロー設定に従う） |

attributes の各エントリには `no`, `flowId`, `flowVersionId`, `contentsVersionId`, `routeVersionId`, `nodeId`, `localeId` も含める。

attributes の `no` の採番規則・直線ルートとの組み合わせパターンは `reference/node-types.md` の「フローノードの attributes」を参照。

## 生成チェックリスト

- [ ] template-straight.md のチェックリストすべて
- [ ] Horizontal ノードの nodeType が `nodeTyp_Horizontal` である
- [ ] Horizontal ノードの plugins が空配列である
- [ ] フローの nodes 内で Horizontal ノードの nodeType が `11` である
- [ ] attributes の no がロケール間で一致している
- [ ] attributes の attributeType / attributeKey / value が正しい
