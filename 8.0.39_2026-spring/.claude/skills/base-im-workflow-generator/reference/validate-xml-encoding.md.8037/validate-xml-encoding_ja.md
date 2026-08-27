# IM-Workflow XML エンコーディング検証・修復

## 概要

IM-Workflow インポート用 XML は UTF-16（BOM 付き）で保存する必要がある。
LE / BE どちらの UTF-16 でも IM-Workflow は読み込み可能だが、BOM が無い・UTF-8 のままだと取り込みに失敗する。
生成時に以下の破損が発生することがあるため、保存後に必ず検証・修復を行う。

## よくある破損パターン

| # | 症状 | 原因 | 検出方法 |
|---|------|------|---------|
| 1 | BOM がない（LE） | iconv が BOM を付与しない | 先頭 2 バイトが `3C 00` |
| 2 | BOM がない（BE） | 同上 | 先頭 2 バイトが `00 3C` |
| 3 | UTF-8 のまま | iconv 変換が失敗 / 未実行 | 先頭バイトが `3C`（`<` の ASCII）または `EF BB BF`（UTF-8 BOM） |
| 4 | 二重 BOM（LE） | BOM 付与を 2 回実行 | 先頭 4 バイトが `FF FE FF FE` |
| 5 | 二重 BOM（BE） | 同上 | 先頭 4 バイトが `FE FF FE FF` |
| 6 | XML 宣言の encoding 不一致 | 変換後に encoding 属性が残っていない | `encoding="UTF-16"` が含まれていない |
| 7 | `</data>` で終わっていない | 変換途中でファイルが切れた | 末尾に `</data>` がない |

## 実行

検証・修復スクリプトはスキル内に同梱されている。XML 生成後、プロジェクトルートから以下を実行する。

```bash
node .claude/skills/base-im-workflow-generator/scripts/validate-xml-encoding.js <xml-path>
```

検出と修復の動作:

| 入力 | 動作 | 修復後のエンディアン |
|------|------|-------------------|
| UTF-16LE + BOM | そのまま `OK` | LE |
| UTF-16BE + BOM | そのまま `OK` | BE |
| UTF-16LE（BOM なし） | LE BOM を付与して上書き | LE |
| UTF-16BE（BOM なし） | BE BOM を付与して上書き | BE |
| UTF-8（BOM 付き / なし） | UTF-16LE（LE BOM 付き）に変換して上書き | LE |
| 二重 BOM（LE） | 余分な LE BOM を除去して上書き | LE |
| 二重 BOM（BE） | 余分な BE BOM を除去して上書き | BE |
| `encoding="UTF-16"` 宣言なし | `WARN` を出力（修復はしない） | — |
| `</data>` で終わっていない | `ERROR`（修復不可、ファイル再生成が必要） | — |

> UTF-16 同士の修復は元のエンディアンを保持する。UTF-8 系入力を UTF-16 に変換する場合は LE をデフォルトとする。
> `build-workflow.js` は UTF-16BE で出力するため、生成直後にこのスクリプトを通すと `OK` のまま素通りする想定。

## 出力の読み方

| 出力 | 意味 | 終了コード |
|------|------|------------|
| `OK: {path}` | 正常。修復不要 | 0 |
| `FIX: ... / FIXED: {path}` | 破損を検出し修復した | 0 |
| `WARN: ...` | 軽微な問題（手動確認推奨） | 0 |
| `ERROR: ...` | 致命的な問題（ファイル再生成が必要） | 1 |
