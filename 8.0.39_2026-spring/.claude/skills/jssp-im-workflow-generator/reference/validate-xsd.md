# インポート XML の XSD 検証

生成した IM-Workflow インポート XML を、記述的スキーマ `reference/im_workflow-import.xsd` で構造検証する手順。

このスキーマは IM-Workflow 公式の規範スキーマではなく、本スキルセットがサポートしている `contents` / `route` / `flow` / `matter_property` / `rule` のみ、各セクション・配下のオブジェクト構造・配列構造を XSD 1.0 互換で表現している。

## 前提

- Node.js（v18 以降推奨。`TextDecoder` と `await` トップレベルが使用可能なバージョン）が利用できること
- 生成した XML は `src/main/storage/public/im_workflow/im_workflow-{name}-import.xml` に UTF-16LE で配置されていること
- `xmllint-wasm` がプロジェクトの `node_modules` に解決できること（初回のみ `npm install --no-save xmllint-wasm`）

## 実行

検証スクリプトはスキル内に同梱されている。プロジェクトルートから以下を実行する。

```bash
node .claude/skills/jssp-im-workflow-generator/scripts/validate-xsd.js \
     src/main/storage/public/im_workflow/im_workflow-{name}-import.xml
```

挙動:

- UTF-16LE / UTF-16BE / UTF-8 を BOM から自動判定し、UTF-8 に正規化したうえで `reference/im_workflow-import.xsd` を用いて `xmllint-wasm`（WASM 版 libxml2）で検証する
- 子プロセスで ESM の `.mjs` を起動して `xmllint-wasm` を読み込む。`xmllint-wasm` のパスは `pathToFileURL()` で `file://` URL に正規化されるため、Linux / macOS / Windows いずれでも動作する

> **制約:** Node.js v20+ では `xmllint-wasm` を同一プロセスで ESM 直接 `import` すると内部 Worker スレッドの WASM VFS 初期化に失敗することがある（ErrnoError F:44）。本スクリプトでは子プロセスに委譲することでこれを回避している。

## 期待結果

- 成功: `OK: ... is valid against the schema`（終了コード 0）
- 失敗: `NG: ...` とエラー一覧（先頭 30 件、終了コード 1）

## エラー例と対処

| エラー | 原因 | 対処 |
|--------|------|------|
| `Element 'XXX': This element is not expected.` | XSD で未定義のフィールド名を出力した | サンプル XML（`assets/sample-complete-branch.md` ないし実エクスポート `sample.xml`）で該当タグの正しい配置を確認し、XML 側を修正する。実エクスポートに存在するフィールドであれば、XSD 側に追加する |
| `Start tag expected, '<' not found` | UTF-16 文字列を UTF-8 として読んでいる / encoding 宣言と実バイトが不一致 | エンコーディングを `scripts/validate-xml-encoding.js` で先に検証・修復する。XML 側の `encoding="UTF-16"` 宣言と実エンコーディング（UTF-16LE/BE + BOM）の整合を確認 |
| `complex type 'XXX': The content model is not deterministic` | XSD 1.0 の UPA 制約違反（名前付き要素と xs:any の混在等） | 該当 complexType を pure choice か pure any に統一する |

## 注意

- XSD は XSD 1.0 互換で記述されているため、`xmllint-wasm`（libxml2 ベース）で検証可能
- 検証は構造（要素名・親子関係・属性必須）のみを対象とし、ID 参照整合性・順序・業務ルールは検出しない
- 業務ルールのチェックは `reference/import-xml-checklist.md` のセルフチェックと併用すること
