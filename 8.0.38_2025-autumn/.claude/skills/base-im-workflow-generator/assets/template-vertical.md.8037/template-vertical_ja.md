# 縦配置（並列）ルート XML テンプレート

## 概要

複数の承認者が**同時に**（並列で順不同に）処理を行う縦配置ルート。
ノードが縦に分岐してつながり、全員の承認が完了するまで待機する。
`nodeTyp_Vertical` ノードを使用し、フローの `attributes` で承認者数を設定する。
承認者の数はフロー設定時に動的に決定できる。

横配置（Horizontal）との違い・順不同承認のノード選択ガイドは `SKILL.md` の「順不同の承認者が複数いる場合のノード選択」を参照。

## ルート図

```
[Start] → [Apply] → [Vertical] → [End]
                      ├─ 承認者1（並列・順不同で処理）
                      ├─ 承認者2
                      └─ 承認者N
```

## 使用例

- 「購買申請。3人の承認者が並列で承認する縦配置ルートで」
- 「出張申請。承認者全員が順不同で承認する。承認者の人数は案件ごとに異なる」

## パラメータ

template-straight.md のパラメータに加え:

| パラメータ | 必須 | 説明 | 例 |
|-----------|------|------|-----|
| verticalName_ja | YES | 縦配置ノード名（日本語） | `並列承認` |
| verticalName_en | YES | 縦配置ノード名（英語） | `Parallel approval` |

## contents セクション

直線ルートと同一。template-straight.md を参照。

## route セクション（縦配置固有部分）

縦配置ルートでは、Apply と End の間に `nodeTyp_Vertical` ノードを 1 つ配置する。
縦配置ノードにはプラグインを設定せず、承認者の割り当てはフロー側で行う。

#### ノード定義

XML の全体構造は `sample-complete-branch.md` に従う。

| nodeId | nodeName | nodeType | nodeVariety | prev | next | plugins | x | traceId |
|--------|----------|----------|-------------|------|------|---------|----|---------|
| `{{name}}_start` | Start | nodeTyp_Start | system | (なし) | apply | 空 | 50 | 0.0 |
| `{{name}}_apply` | Apply | nodeTyp_Apply | human | start | vertical | 申請権限 | 160 | 0.1 |
| `{{name}}_vertical` | {{verticalNodeName}} | nodeTyp_Vertical | human | apply | end | **空** | 260 | 0.2-0.0 |
| `{{name}}_end` | End | nodeTyp_End | system | vertical | (なし) | 空 | 360 | 0.0 |

- Vertical ノードの plugins は**空配列**（承認者の割り当てはフロー側で行う）
- 全ノード y=50

ルートレベルの `plugins` には Apply のプラグインのみ記述する（Vertical ノードにはプラグイン不要）。

### 座標計算式（縦配置ルート）

| ノード | x 座標 | y 座標 |
|--------|--------|--------|
| Start | 50 | 50 |
| Apply | 160 | 50 |
| Vertical | 260 | 50 |
| End | 360 | 50 |

座標の折り返し規則は template-straight.md を参照（ルートデザイナ: 10000 x 5000 px、x > 9500 で折り返し）。

## flow セクション（縦配置固有部分）

縦配置ノードのフロー設定では `nodeType` を `12`（Vertical）とし、`attributes` で承認者の配置数を設定する。

| nodeId | nodeType | フラグ類 | details | unions |
|--------|----------|---------|---------|--------|
| `{{name}}_vertical` | `12` | 全て null | 空配列 | 空配列 |

#### attributes（1エントリのみ）

| プロパティ | 値 | 説明 |
|-----------|-----|------|
| no | ランダムID（15桁、`[0-9A-Za-z]`）| ロケール間で共有 |
| attributeType | `1` | ノード属性 |
| attributeKey | `5` | 縦配置の承認者数設定 |
| value | `0` | デフォルト（フロー設定に従う） |

attributes の各エントリには `no`, `flowId`, `flowVersionId`, `contentsVersionId`, `routeVersionId`, `nodeId`, `localeId` も含める。

attributes の `no` の採番規則・直線ルートとの組み合わせパターンは `reference/node-types.md` の「フローノードの attributes」を参照。

## 生成チェックリスト

- [ ] template-straight.md のチェックリストすべて
- [ ] Vertical ノードの nodeType が `nodeTyp_Vertical` である
- [ ] Vertical ノードの plugins が空配列である
- [ ] フローの nodes 内で Vertical ノードの nodeType が `12` である
- [ ] attributes の no がロケール間で一致している
- [ ] attributes の attributeType / attributeKey / value が正しい
