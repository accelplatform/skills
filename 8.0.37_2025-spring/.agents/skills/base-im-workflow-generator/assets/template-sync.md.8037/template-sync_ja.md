# 同期ルート XML テンプレート

## 概要

複数の承認パスを**並列で同時に処理**するワークフロー定義。
`Sync_Start` / `Sync_End` ノードで並列区間を囲み、**全パスの処理が完了するまで Sync_End で待機**する。
分岐ルートとの違い: 分岐は条件に合致した1パスのみ実行するが、同期は全パスを並列に実行する。

## ルート図

```
[Start] → [Apply] → [Sync_Start] ─┬─ [Approve_1] ─┬─ [Sync_End] → [End]
                                   └─ [Approve_2] ─┘
```

パス内に複数ノードを配置することも可能:

```
[Start] → [Apply] → [Sync_Start] ─┬─ [Approve_A1] → [Approve_A2] ─┬─ [Sync_End] → [End]
                                   └─ [Approve_B1] ────────────────┘
```

## 使用例

- 「購買申請。経理部と法務部の両方の承認が必要（順序不問）」
- 「出張申請。上長と総務部が並列で承認」

## パラメータ

template-straight.md のパラメータに加え:

| パラメータ | 必須 | 説明 | 例 |
|-----------|------|------|-----|
| syncPaths | YES | 同期パスの配列 | 下記参照 |

### syncPaths 定義

```
[
  {
    name: "path_a",
    nodes: [
      { name_ja: "経理部長", name_en: "Finance Manager", targetType: "post", targetCode: "comp_sample_01^comp_sample_01^ps002" }
    ]
  },
  {
    name: "path_b",
    nodes: [
      { name_ja: "法務部長", name_en: "Legal Manager", targetType: "post", targetCode: "comp_sample_01^comp_sample_01^ps002" }
    ]
  }
]
```

## contents セクション

直線ルートと同一。template-straight.md を参照。
同期ルートでは rule（分岐条件）は不要。

## route セクション（同期固有部分）

### ノード構成

直線ルートの route テンプレートをベースに、Apply → End の間を以下のノードで置き換える。

#### ノード定義（同期区間）

XML の全体構造は `sample-complete-branch.md` に従う。以下は同期固有のノード仕様。

| nodeId | nodeName | nodeType | nodeVariety | prev | next | plugins |
|--------|----------|----------|-------------|------|------|---------|
| `{{name}}_sync_s` | 同期開始 | nodeTyp_Sync_Start | system | Apply | 全パス先頭ノード | 空 |
| `{{name}}_{{path}}_{{N}}` | {{nodeName}} | nodeTyp_Approve | human | 前ノード（先頭は Sync_Start） | 次ノード（最終は Sync_End） | 承認権限 |
| `{{name}}_sync_e` | 同期終了 | nodeTyp_Sync_End | system | 全パス最終ノード | End | 空 |

- Apply の nextNodeIds を `{{name}}_sync_s` に変更、End の previousNodeIds を `{{name}}_sync_e` に変更
- Sync_Start / Sync_End の traceId: `{{SYNC_TRACE_PREFIX}}-0.0`
- パスノードの traceId: `{{SYNC_TRACE_PREFIX}}-{パス番号}.{ノード番号}`（パス番号は 1 から、ノード番号も 1 から）
- 全ノード共通: `startNodeFlag=false`, `endNodeFlag=false`, `routeTemplateId=null`, `routeTemplateName=null`, `parentNode=null`

### SYNC_TRACE_PREFIX の算出

分岐ルートと同じ規則。Sync_Start の直前ノードの traceId 連番の次の値。

| パターン | 直前ノードの traceId | SYNC_TRACE_PREFIX |
|---------|---------------------|-------------------|
| Apply(0.1) → Sync_Start | `0.1` | `0.2` |
| Approve(0.2) → Sync_Start | `0.2` | `0.3` |

### 座標計算式（同期ルート）

| ノード | x 座標 | y 座標 |
|--------|--------|--------|
| Start | 50 | 50 |
| Apply | 160 | 50 |
| Sync_Start | 前ノード.x + 110 | 50 |
| パスA ノード | Sync_Start.x + 180 + (n-1)*130 | 50 |
| パスB ノード | Sync_Start.x + 180 + (n-1)*130 | 190 |
| パスC ノード | Sync_Start.x + 180 + (n-1)*130 | 330 |
| Sync_End | max(全パスノード.x) + 120 | 50 |
| End | Sync_End.x + 80 | 50 |

パスが増える場合は y を +140 ずつずらす（50, 190, 330, 470, ...）。

座標の折り返し規則は template-straight.md を参照（ルートデザイナ: 10000 x 5000 px、x > 9500 で折り返し）。

### nextNodeIds / previousNodeIds の規則

分岐ルートとの違い: **Sync_Start → Sync_End の直結パスは不要**。
同期ルートでは全パスを実行するため、「スキップ」パスは存在しない。

`Sync_Start` の `nextNodeIds`:
1. パスA の先頭ノード
2. パスB の先頭ノード
3. ...

`Sync_End` の `previousNodeIds`:
1. パスA の最終ノード
2. パスB の最終ノード
3. ...

## flow セクション（同期固有部分）

直線ルートと同様の構造をベースに、**Sync_Start ノードと Sync_End ノードもフローの `nodes` に含める**。
分岐ルートと異なり、Sync_Start には details（ルール紐付け）/ unions（分岐先紐付け）は不要。

### Sync_Start / Sync_End のフロー設定

| nodeId | nodeType | フラグ類 | details | attributes | unions |
|--------|----------|---------|---------|------------|--------|
| `{{name}}_sync_s` | `7` | 全て null | 空配列 | 空配列 | 空配列 |
| `{{name}}_sync_e` | `8` | 全て null | 空配列 | 空配列 | 空配列 |

「フラグ類」= lumpProcessFlag, attachFileFlag, autoProcessFlag, autoProcessLimitDay, autoProcessLimitType, autoPressFlag, autoPressLimitDay（全て `type="null"`）

### フロー nodes の記述順

```
1. Apply ノード（nodeType=2）
2. Sync_Start ノード（nodeType=7）— details/unions/attributes すべて空配列
3. 各承認ノード（nodeType=3）— パスA, パスB, ... の順に列挙
4. Sync_End ノード（nodeType=8）— details/unions/attributes すべて空配列
```

## 分岐ルートとの比較

| 項目 | 分岐ルート | 同期ルート |
|------|-----------|-----------|
| ノード型 | Branch_Start / Branch_End | Sync_Start / Sync_End |
| 実行パス | 条件に合致した1パスのみ | 全パスを並列実行 |
| rule の必要性 | 必要（分岐条件） | 不要 |
| contents の rules | ruleId を登録 | 空配列 |
| フローの details/unions | Branch_Start に設定 | 空配列 |
| 直結パス | 条件次第であり | なし |
| traceId 規則 | 同じ | 同じ |

## 生成チェックリスト

- [ ] template-straight.md のチェックリストすべて
- [ ] Sync_Start の nextNodeIds に全パスの先頭ノードが含まれている
- [ ] Sync_End の previousNodeIds に全パスの最終ノードが含まれている
- [ ] パス内ノードの接続が正しい（パス内で直列）
- [ ] 各パスの Y 座標が異なっている（重ならない）
- [ ] Sync_Start と Sync_End の traceId が同じ値（対の特定）
- [ ] traceId のパス番号が各パスでユニーク
- [ ] フローの nodes に Sync_Start（nodeType=7）と Sync_End（nodeType=8）が含まれている
- [ ] Sync_Start / Sync_End の details, unions, attributes がすべて空配列
- [ ] rule / contents の rules が不要であること（同期ルートは条件分岐なし）
