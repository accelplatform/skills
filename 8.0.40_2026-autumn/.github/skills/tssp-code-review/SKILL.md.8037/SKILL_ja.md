---
name: tssp-code-review
description: intra-mart TSSP コード（src/main/tssp/src の .ts / .html）の品質レビュー。tssp build --dev（型検査・Rhino 向け lint）・型検査の回避（any / as any / @ts-ignore 等）の grep・validate-jssp-code.js（ビルド出力に対して実行）の結果に加え、コーディング規約（var禁止・命名規則・バインド変数）、型（interface・d.ts との一致）、セキュリティ（SQL インジェクション・XSS）、エラーハンドリング（forward・リカバリ）、構造（init関数・責務分離）を網羅的にチェックする。コードレビュー、品質確認、PR レビュー、コードをチェックして、規約に沿っているか確認して、と言及されたときに使用。
allowed-tools: Bash, Read, Glob
---

# TSSP コードレビュースキル

## 概要

intra-mart Accel Platform のスクリプト開発モデル（TSSP）で書かれたコードをレビューし、品質・規約準拠・セキュリティの観点からチェックを行う。

レビューでは次の 2 か所を扱う。`src/main/jssp/src` の `.js` / `.html` は `tssp build` の出力なので、指摘は `src/main/tssp/src` 側のファイル・行で示す。

| パス | 内容 |
|---|---|
| `src/main/tssp/src/{機能名}/` | レビュー対象のソース（`.ts` / `.html`） |
| `src/main/jssp/src/{機能名}/` | `tssp build` の出力（`.js` / `.html` / `.js.map`）と 2WaySQL の `.sql`（`tssp build` は `.sql` を出力しないため、ここに置かれている。`.sql` への指摘はこのファイルで示す）。Step 1 の `validate-jssp-code.js` はここを検証する |

## レビュー手順

### Step 1: 自動検証を実行

プロジェクトのルートで以下を実行し、ツールで検出可能な問題をまず洗い出す。最初に型検査の回避の 2 つの grep（対象機能の `.ts` と、`src/main/tssp/src` 全体の `declare global`）、`src/main/tssp` 配下の `.d.ts` の検索、`tssp build`（型検査・Rhino 向け lint）を実行する。`tssp build` を最後に置いているので、このブロックの終了コードは `tssp build` の終了コードになる。

`tssp build --dev` は package.json の `tssp:dev` スクリプトで実行する。`{パッケージマネージャ}` は、プロジェクトのパッケージマネージャ（`bun` / `npm` / `pnpm` / `yarn`）に置き換える。

```bash
grep -rnE "\bany\b|@ts-(ignore|expect-error|nocheck)|^[[:space:]]*(export[[:space:]]+)?declare[[:space:]]|^[[:space:]]*///[[:space:]]*<reference" src/main/tssp/src/{機能名}/ --include='*.ts'
grep -rlE "^[[:space:]]*(declare[[:space:]]+global|///[[:space:]]*<reference)" src/main/tssp/src --include='*.ts'
find src/main/tssp -name '*.d.ts'
{パッケージマネージャ} run tssp:dev
```

ビルドが成功した（終了コード 0）場合だけ、出力に対して `validate-jssp-code.js` を実行する（このスクリプトは `.js` / `.html` / `.sql` しか読まず、`.ts` は検証できない）。

```bash
node .github/skills/tssp-page-generator/scripts/validate-jssp-code.js src/main/jssp/src/{機能名}/
```

ビルドが失敗した（終了コードが 0 以外）場合、出力は今回の `.ts` を反映していない（型検査・lint・変換・衝突検査で失敗したときは何も書き出さない）。このときは `validate-jssp-code.js` を実行せず（前回のビルドの出力を検証してしまう）、「ビルド失敗のため未実行」と記録する。ビルドの失敗が対象機能の外の `.ts` によるものなら、その旨も記録する。

エラー・警告が出力された場合はそのまま記録し、Step 2 のレビュー結果と合わせて報告する。このスキルではコードを修正しない。

- `find` が `.d.ts` を出力した場合は中身を確認する。グローバルの `declare` や、d.ts の型への `interface` の追加（`interface Logger { fakeMethod(): void }` のように d.ts に無いメソッドを足す書き方。grep に掛からない）があれば、機能ディレクトリの外にあっても型検査の回避として指摘に記録する。プラットフォームの d.ts は `d.ts/`（プロジェクト直下）にあり、`src/main/tssp` 配下には置かない。ルートか `src/main/tssp/` の `tsconfig.json` の `include` に `d.ts/` 以外の `.d.ts` を足している場合も、`find` には出ないが同じ回避として記録する
- grep のヒットは、`tssp build` が成功していても指摘として記録する（ヒットが無ければ何も出力されず、終了コードは 1）。コメントや文字列リテラルの中の英単語 "any" 等、コードでない箇所への一致は除く
- 1 つ目の grep に出た `/// <reference` は、`src/main/tssp` の外（`find` に出ない場所）の `.d.ts` も型検査に取り込むので、型検査の回避として記録する。2 つ目の grep は `src/main/tssp/src` 全体から `declare global` を探す。`declare global` は宣言したファイルの外の `.ts` の型検査にも効くので、対象機能の外のファイルでも型検査の回避として記録する
- `validate-jssp-code.js` の指摘の `file:line` は出力 `.js` の位置で、`.ts` とは行がずれる。指摘のコード片（関数名・変数名）で `src/main/tssp/src` の `.ts` を検索し、`.ts` のファイル・行で記録する。`.html` は `tssp build` が内容をそのままコピーするので、`src/main/tssp/src` の同じパス・同じ行で記録する
- `.ts` に書いていないコードへの指摘は、`.ts` 側の書き方が原因である。`var`（`JSSP-JS-002`）への指摘は、`.ts` に書いたもののほか、tssp が `?.` / `??`（左辺が変数でないとき）とオブジェクトの spread / rest を変換するときに出力へ入れる一時変数・補助関数にも出る。`includes()`（`JSSP-JS-009`）への指摘は、オブジェクトの rest を変換するときに入る補助関数にも出る（2-6 参照）

---

### Step 2: スクリプトで検出できない項目を LLM でレビュー

以下の項目はコードを読んで確認する。

#### 2-1. 命名規則

- [ ] ファイル名がスネークケースか（`user_master.ts`）
- [ ] 関数名・変数名がキャメルケースか（`getUserInfo`）
- [ ] 定数が大文字スネークケースか（`MAX_RETRY_COUNT`）
- [ ] 省略形を使っていないか（`btn` → `button`、`msg` → `message` 等）
- [ ] バインド変数に `$` プレフィクスがあるか（`$data`, `$title` 等）

#### 2-2. バインド変数

- [ ] バインド変数を `export let $data = ...` のようにトップレベルの `export let` で宣言しているか
- [ ] バインド変数が `JSON.stringify()` で文字列化されているか
- [ ] `JSON.stringify()` 後に `.replace(/\//g, '\\/')`  でエスケープされているか
- [ ] オブジェクトを変数に入れてから `JSON.stringify()` に渡し、`$data = JSON.stringify(<変数>).replace(/\//g, '\\/');` を 1 行で書いているか（オブジェクトリテラルを直接渡すと、プロパティが 2 つ以上あるとき（`{ list: [{ a: 1, b: 2 }] }` のように入れ子の内側を含む）、出力で複数行に整形されて `JSSP-JS-020` になる）
- [ ] プレゼンテーションページで `(function($data) { ... })(<imart ...>);` の IIFE 形式で受け取り、`$data` をグローバル変数にしていないか

#### 2-3. エラーハンドリング

- [ ] `try-catch` でエラーをキャッチしているか
- [ ] リカバリ不可エラーは `Transfer.toErrorPage()` でエラー画面へ遷移しているか
- [ ] リカバリ可能エラーはバインド変数の `error` プロパティに格納しているか
- [ ] エラー内容をログ（`Logger.getLogger().error()`）に出力しているか
- [ ] ユーザ向けメッセージが一般化されているか（内部情報を含んでいないか）

#### 2-4. 構造・設計

- [ ] `init()` 関数がエントリーポイントとして `export function init(request: Request): void` の形で実装されているか
- [ ] 関数が1責務になっているか（処理が混在していないか）
- [ ] 1関数が 50 行以内か（超える場合は分割が必要）
- [ ] ネストが 4 段階以内か
- [ ] `$data` を通じてプレゼンテーションページへデータを渡しているか
- [ ] `.ts` と `.html` を `src/main/tssp/src` に置き、対にする `.ts` と `.html` を同じディレクトリに同じ名前で置いているか。`src/main/jssp/src`（`tssp build` の出力先）に手書きの `.js` / `.html` を置いていないか（2WaySQL の `.sql` だけは `src/main/jssp/src/{機能名}/sql/` に置く）。`.accel/tssp-generated.txt`（tssp が書き出したファイルの一覧）に載っていない `.js` / `.html` が手書きのファイルである

#### 2-5. パフォーマンス・その他

- [ ] `new Packages.***`（Java クラスの直接インスタンス化）を使っていないか
- [ ] 不要なループや重複クエリがないか

#### 2-6. TypeScript（型・宣言・import）

- [ ] `var` を使っていないか（`let` を使う。`const` は tssp が `let` に変換するので使ってよい）
- [ ] 型検査を `any` / `as any` / `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck` / 自前の `declare` で回避していないか（`catch (e)` の `e` は `unknown` なので `(e as Error).message` と書く）。Step 1 の grep に掛からない `as unknown as X` の二重キャストで、d.ts の型と合わない値を通していないか
- [ ] リクエストから受け取る値・レスポンス（`$data` に入れるオブジェクト、API の応答）・DB のレコードの形を `interface` で定義し、その型を変数・引数・戻り値に付けているか（例: `UserForm`、`ViewResponse { result: UserForm | null; error: { code: string; message: string } }`）
- [ ] 関数の引数・戻り値に型を書いているか（`init` 以外の関数も `request: Request` で受け、`function main(request: Request): ViewResponse` のように戻り値の型を書く。throw するだけの関数は `: never`）
- [ ] d.ts の API 定義どおりに呼び出しているか（推測で使っていないか）。使われている API の d.ts を Read して署名と照合する。API の引数・戻り値を扱う変数に d.ts の型（`JobResult`、`Transfer.TransferParam`、`DatabaseResult` 等）を使い、d.ts にある型を自前の `interface` で定義し直していないか
- [ ] `request` のメソッド名を d.ts（`d.ts/platform/standard/im-ssjs-request.d.ts`）で確かめているか。`Request` はインデックスシグネチャ（`[key: string]: Request.Attribute`。`Request.Attribute` は `any`）を持つため、`request.getParamterValue()` のような d.ts に無いメソッド名でも型検査を通る。`request.xxx` で読んだ URL 引数（`any`）は、型付きの `interface` か `string` の変数に入れてから使っているか
- [ ] `d.ts/workflow/enum/` に `declare const` で宣言されている定数オブジェクト（`NodeType`、`ProcessType`、`TaskStatus`、`MatterStatus` 等）を、式の中で値として参照していないか（`node.nodeType === NodeType.nodeTyp_Apply` など）。型検査・Rhino 向け lint・`validate-jssp-code.js` のすべてを通り、出力の `.js` にそのまま残るが、SSJS ランタイムにはこれらのオブジェクトが無いので実行時に ReferenceError になる。定数値（文字列リテラル）を直接書き、`NodeType` などの名前は型注釈の中（`typeof NodeType.nodeTyp_Apply`）にだけ書く
- [ ] `Proxy`・`Reflect`（Rhino に無く、実行時に ReferenceError になる）や `Promise`（サーバサイドは同期処理のみなので使わない）のように、tsconfig の `lib`（既定は ES2015）の型にあるが SSJS では使わないものを使っていないか（いずれも型検査・Rhino 向け lint・`validate-jssp-code.js` を通る）
- [ ] 共通モジュールの関数・定数を `import` している場合、同じモジュールを `load('...')` でも読み込んでいるか（`import` は出力から消えるため、`load()` が無いと型検査と lint は通るが、出力の `.js` ではその名前が定義されない）。型だけを読む `import` は `import type` で書いているか
- [ ] アロー関数・テンプレートリテラル・分割代入・オブジェクトの spread / rest・`?.` / `??` を使っていないか（`function`、`+` による連結、明示的な `null` 比較やプロパティの代入で書く。tssp はこれらを通すが、書き方によっては出力に補助関数や `var` が入るか、そのまま出力されて、Step 1 の `validate-jssp-code.js` の指摘（`JSSP-JS-002` / `007` / `009` / `012` / `013` 等）になる）

#### 2-7. ジョブスクリプト（job ディレクトリのみ）

job ディレクトリ配下の .ts ファイルが対象に含まれる場合のみ確認する。

- [ ] `execute()` 関数がエントリポイントとして `export function execute()` の形で実装されているか（`init()` ではない）
- [ ] 戻り値の型を d.ts の `JobResult`（`status: 'success' | 'warning' | 'error'`、`message: string`）にしているか（自前の型や `Object` にしていないか）
- [ ] `message` に機密情報を含めていないか（監視テーブルに記録されるため）
- [ ] ジョブ開始・終了をログに出力しているか
- [ ] エラー時に `status: 'error'` を返却しているか（`Transfer.toErrorPage()` は使用しない）

#### 2-8. ワークフロー画面外処理

`workflow/` 配下で、**同名の `.html` が存在しない `.ts` ファイル**かつ **`workflow/rule/` 以外**が対象に含まれる場合のみ確認する（画面ファイルおよびルール定義は対象外）。

- [ ] 処理の開始・終了をログに出力しているか

---

## 出力形式

```
## レビュー結果: {対象パス}

### Step 1: 自動検証結果

- tssp build: {成功 / 失敗（失敗時は出力をそのまま記載）}
- 型検査の回避の grep と `.d.ts` の検索: {ヒット・出力をそのまま記載 / ヒットなし}
- validate-jssp-code.js: {出力をそのまま記載 / ビルド失敗のため未実行}

### Step 2: LLM レビュー結果

| 種別 | ファイル | 行 | 内容 | 重要度 |
|------|---------|-----|------|--------|
| 命名規則 | user_edit.ts | 12 | 省略形変数名 `btn` を使用 | 中 |
| エラー処理 | user_edit.ts | 78 | Transfer.toErrorPage() 未使用 | 高 |
| 構造 | user_list.ts | - | init() が 80 行を超えている | 中 |
| 型 | user_edit.ts | 34 | `as unknown as UserForm` で d.ts の型と合わない値を通している | 高 |

### 改善提案

1. ...
2. ...
```

問題がない場合は「問題は検出されませんでした」と報告してください。
