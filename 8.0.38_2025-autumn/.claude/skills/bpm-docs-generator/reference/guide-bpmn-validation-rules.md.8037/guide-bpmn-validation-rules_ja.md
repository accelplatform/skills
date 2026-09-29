# 入力ルール定義仕様（rules.json）

本書は、BPMN 検証で利用する入力ルール定義ファイル（`rules.json`）の仕様を定義する。
主目的は「ルール記述の一貫性確保」と「実装依存の挙動を含む解釈ルールの明文化」である。

## 1. 適用範囲

- 対象: `--rules <rules.json>` 形式で読み込まれる入力ルール定義
- 形式: JSON 配列（ルールエントリのリスト）
- 単位: 1 エントリ = 1 選択条件 + 1 検証対象値 + 1 制約セット

## 2. ルールエントリ仕様

### 2.1 構造

```jsonc
{
  "id": "process.id",                 // 必須。違反識別子
  "selector": "bpmn:Process",         // 必須。検証対象 BPMN 型
  "path": "id",                       // 必須。selector 一致要素から値を取得するパス
  "label": "process id",              // 任意。表示名（省略時は path）
  "when": { "activiti:type": "mail" }, // 任意。selector 一致要素に対する属性フィルタ
  "forEach": { "extensionType": "activiti:in" }, // 任意。子要素反復
  "rule": { "required": true, "maxLength": 255 } // 必須。制約定義
}
```

### 2.2 必須項目

- `id`
- `selector`
- `path`
- `rule`

実装上は、`selector` または `path` が欠けたエントリは無視される。`rule` 省略時は空オブジェクトとして扱われ、`id` 省略時はエラーメッセージの文脈に `label`（または `path`）が代用される。
本書では `id` を仕様上の必須項目として扱う（実装側の代替挙動は後方互換のための挙動であり、新規ルール定義では `id` を必ず付与すること）。

### 2.3 解釈ルール

- `selector` は BPMN ツリーを再帰探索し、一致した全要素に適用される。
- 同一 `selector` に複数一致がある場合、要素ごとに独立して判定される。
- 同一対象に複数制約を課す場合は `rule` 内に複数キーを定義できる。
- `path` または `when` が異なる条件はエントリを分割する。

## 3. エラーメッセージ仕様

出力例:

```
ERROR: [input(mailTask.to.required)] mail task field[to] (ServiceTask#mail-task_1) is required
```

- `[input(...)]` にはルールエントリの `id`（必須項目）を使用する。
- `label (...)` は違反インスタンス特定情報を含む。
- 後方互換として `id` が省略されたルールでは、`[input(...)]` の `...` に `label`（未指定時は `path`）が代用される。
- 違反箇所となった BPMN 要素自体に `id` 属性がない場合は、`id` 属性を持つ直近祖先要素を識別子として利用する（この `id` はルールエントリの `id` とは別物であり、BPMN 要素側の `id` 属性を指す）。

## 4. path 記法仕様

`path` は `.` 区切りで評価される。

| セグメント | 意味 |
|---|---|
| `id` / `name` / `isExecutable` | 通常プロパティ |
| `activiti:type` / `activiti:class` | 名前空間属性（`$attrs` フォールバックあり） |
| `errorRef` / `messageRef` / `signalRef` | 参照属性（IDREF） |
| `field(<name>)` | `activiti:field[name=<name>]` の選択 |
| `value` | 子要素（`activiti:string`/`activiti:expression`）の値 |
| `text` | FormalExpression 系要素の本文 |

`field(name).value` を使うと、フィールド存在・子要素存在・値入力を 1 ルールで表現できる。

- `field(<name>)` は同一 `extensionElements` 内で同名の `activiti:field` が複数存在する場合、先頭（XML 上の出現順で最初）の 1 件のみを選択する（2 件目以降は無視される）。
- 同一 `extensionElements` 内での `activiti:field` name 重複自体は、`activiti:field` name は同一要素内で一意であるべきという前提のもと、入力ルール（`path`/`rule`）とは別に、BPMN モデル自体の構造チェック（`[model]` 文脈）として常時検出・エラー扱いとする。

```jsonc
{
  "id": "mailTask.to.required",
  "selector": "bpmn:ServiceTask",
  "when": { "activiti:type": "mail" },
  "path": "field(to).value",
  "label": "mail task field[to]",
  "rule": { "required": true }
}
```

## 5. 参照属性（IDREF）取り扱い

- `errorRef` / `messageRef` / `signalRef` は参照解決失敗時にモデル警告が発生する。
- 対応する入力ルールの `path` が実際に評価され、未解決参照の生値（moddle が解決できなかった元の文字列）の取得に成功した場合のみ、そのモデル警告を消費済みとして抑制する（同一要素×同一プロパティ名の完全一致で判定する決定的な仕組みであり、曖昧なヒューリスティックはない）。
- 入力ルール自体が未定義、または `path` が一致して生値取得に至らなかった場合は、その参照属性の失敗は消費されず、最終的にモデル警告として出力される。
- `itemSubjectRef` は IM-BPM 独自拡張の項目であり、`dataObject` の型（データ型）を特定するために参照される。標準の BPMN 参照整合検証の対象外として扱うため、参照解決失敗を常時抑制対象とする。

## 6. when 仕様（selector 一致要素フィルタ）

```jsonc
"when": { "activiti:type": "mail" }
```

```jsonc
"when": { "activiti:type": ["applyworkflow", "draftworkflow"] }
```

- 単一値: 完全一致
- 配列値: OR 一致
- 複数キー: AND 一致

`when` は `selector` で選択された要素自身に対して評価される（親要素探索は行わない）。

`bpmn:ServiceTask` のように同一型に複数用途が混在する場合は、`when` による分類を必須とする（運用規約上の必須。実装が機械的に強制するものではない）。

## 7. forEach 仕様（子要素反復）

`path` 単体では表現しにくい複数子要素の検証に使用する。

| 記述 | 対象 |
|---|---|
| `{ "extensionType": "activiti:in" }` | `extensionElements` 配下の指定型要素 |
| `{ "extensionFieldPrefix": "inputData_" }` | `name` が接頭辞一致する `activiti:field` |

`forEach` 指定時、`path` は反復対象子要素からの相対指定となる。

`when` は反復前に親側（`selector` 一致要素）で評価される。`forEach` で `extensionFieldPrefix` と `extensionType` の両方を指定した場合は `extensionFieldPrefix` が優先される。
`forEach` の反復対象が 0 件の場合、そのエントリ単体では違反を生成しない（件数下限を求める場合は別エントリで `required` などを定義する）。

```jsonc
{
  "id": "callActivity.in.target.maxLength",
  "selector": "bpmn:CallActivity",
  "forEach": { "extensionType": "activiti:in" },
  "path": "target",
  "label": "callActivity in target",
  "rule": { "maxLength": 255 }
}
```

`when` と `forEach` は併用可能。

## 8. rule 制約仕様

| キー | 仕様 |
|---|---|
| `required: true` | 空値（未設定・空文字）を禁止 |
| `requiredIfPresent: true` | XML 上に属性が明記されている場合のみ空文字を禁止（属性自体の省略はエラーにしない） |
| `requiredIf: { "path": "...", "equals": 値 }` | 条件成立時のみ必須 |
| `requiredGroup: ["a", "b", ...]` | 列挙パスのいずれか 1 つ以上を必須 |
| `invalidValues: ["ticket:"]` | 列挙値との完全一致を禁止 |
| `format: "regex"` | 正規表現一致を要求（`^...$` を付けない場合は部分一致になり得る） |
| `maxLength: number` | 最大文字数 |
| `requiredPrefix: ["${", "#{"]` | 指定接頭辞のいずれかを要求 |
| `invalidPrefix: ["urn:"]` | 指定接頭辞を禁止 |
| `requiredWithoutPrefix: true` | 先頭 `:` まで除去後の空値を禁止 |
| `requiredWithoutPrefixIf: { "path": "...", "equals": 値 }` | 上記の条件付き版 |

`requiredIfPresent` は単一セグメントの `path`（例: `activiti:version`, `field(to)`）で使うこと。複合 `path`（例: `field(to).value`）では「属性明記」の判定粒度が仕様意図と一致しないため非推奨とする。

評価は本表の掲載順（`required` → `requiredIfPresent` → `requiredIf` → `invalidValues` → `requiredGroup` → `format` → `maxLength` → `requiredPrefix` → `invalidPrefix` → `requiredWithoutPrefix`）で固定的に行われ、先に違反した制約で判定を終了する（1 エントリ・1 要素あたり最大 1 件）。JSON 上での `rule` オブジェクト内のキー記述順は評価順序に影響しない。
`requiredWithoutPrefixIf` は `requiredWithoutPrefix` の適用可否を決める前段条件として評価される（独立フェーズではない）。
この順序は `validateInputRuleOnElement()`（validate-bpmn.js）にハードコードされている。新しい制約キーを追加・変更する場合は、本表と `validateInputRuleOnElement()` の実装順の両方を対応させて更新すること。
複数観点を独立に検証したい場合は、エントリを分割する。

## 9. 運用ガイドライン

- ルールをカスタマイズしたい場合は `scripts/rules-validate-default.json` のエントリを複製して調整する。
- `path` + `rule` で表現困難な検証（相互参照整合、DSL 解釈など）はルール定義ではなく実装側のカスタム検証で扱う。
- ルール追加時は、対象型のばらつき（特に `ServiceTask`）を必ず `when` で明示分離する。
