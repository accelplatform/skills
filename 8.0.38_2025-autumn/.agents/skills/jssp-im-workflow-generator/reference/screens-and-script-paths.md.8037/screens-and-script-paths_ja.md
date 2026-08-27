# `screens` フィールドと画面パス（scriptPath）の指定方法

`spec.json` の `screens` は、各 pageType の出力を細かく制御できる。

```jsonc
"screens": {
  "apply": "leave/workflow/apply/index",        // 文字列 → そのパスを使用
  "tempSave": false,                            // false → XML から除外
  "confirm": false,                             // false → XML から除外
  "applyTask": "leave/workflow/apply_task/index"  // 文字列 → 出力対象に追加（applyTask はデフォルト省略のため、生成する場合は明示）
}
```

| 値の種類 | 意味 |
|---------|------|
| **文字列** | そのパスを `scriptPath` として XML に出力 |
| **`false`** | XML から該当 pageType の contentDef を完全除外（「明示的に不要」と宣言） |
| **`undefined` / `null` / 未記載** | デフォルト挙動（SKILL.md「pageType と usage の慣例ディレクトリの対応表」参照） |

## 画面省略・共用パターンの典型例

### パターン A: 最小構成（申請＋承認のみ）

「申請のみ実装し一時保存・確認画面は不要」のような最小構成。サンプル: [examples/minimal.spec.json](../examples/minimal.spec.json)。

```jsonc
"screens": {
  "tempSave": false,
  "confirm": false
}
```

→ 出力される pageType: `0` (apply), `3` (reapply, apply と共用), `4` (process), `6` (processDetail), `7` (referDetail, processDetail と共用)

### パターン B: 標準構成（デフォルトのまま）

`screens` 自体を省略すれば、SKILL.md の対応表のデフォルトが適用される。サンプル: [examples/straight.spec.json](../examples/straight.spec.json)。

→ 出力される pageType: `0, 1, 3, 4, 5, 6, 7`（applyTask=2 のみ除外）

### パターン C: 起票運用あり（applyTask を含む）

月報・期首目標設定など、ジョブで自動起票するワークフロー。

```jsonc
"screens": {
  "applyTask": "monthly_report/workflow/apply_task/index"
}
```

→ 上記 B に加えて pageType `2` も出力

### パターン D: 詳細画面が処理画面と大きく違う

処理画面と参照詳細で表示項目が大きく異なる場合、別実装にする。

```jsonc
"screens": {
  "processDetail": "leave/workflow/process_detail/index",
  "referDetail": "leave/workflow/refer_detail/index"   // 共用しない別パス
}
```

## 整合性の検証フロー

1. **XML 生成後**: `jssp-im-workflow-usage/scripts/validate-workflow-code.js` を XML / JS 両方を含むディレクトリに実行
2. `WF-XML-001` 警告（「XML が参照する JS ファイルが存在しない」）が出る場合、以下のいずれか:
   - **画面ファイル未生成（バグ）** → `jssp-im-workflow-usage` で該当画面を生成
   - **意図的に画面なし** → `spec.json` の `screens.xxx: false` で除外し、再ビルドする（推奨。警告ノイズを根絶できる）
