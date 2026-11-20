---
name: tssp-usage
description: intra-mart の SSJS を TypeScript で書き、tssp CLI で Rhino 1.7.15.1 向けの JSSP に変換して開発するためのスキルセット。`.ts` と `.html` の置き場所（`src/main/tssp/src`）と出力先（`src/main/jssp/src`）、`tssp build` の処理順と終了コード、`export let $data` や `import type` などの書き方の約束、d.ts による型検査、Rhino 向け lint 17 規則の禁止事項と代わりの書き方、`.accel/tssp-generated.txt` による衝突の直し方、ソースマップを使ったデバッグ手順を提供する。TypeScript で SSJS/JSSP を書きたい、tssp build を実行したい、tssp のビルドエラーや型エラーを直したい、Rhino lint 違反を直したい、.ts と .html の置き場所を知りたい、.accel/tssp-generated.txt の衝突を解消したい、ソースマップでデバッグしたい、と言及されたときに使用。画面・API の生成そのものは tssp-page-generator を使うこと。
allowed-tools: Bash, Read, Write, Edit, Glob
---

# tssp 利用支援スキル

tssp は、TypeScript で書いた intra-mart の SSJS（サーバサイド JavaScript）を、Rhino 1.7.15.1（intra-mart の SSJS 実行エンジン）が実行できる JSSP の JavaScript に変換する CLI である。作業は次の順で行う。

1. 使う API の d.ts（API の型定義）を Read し、署名を控える（「型検査」）
2. `src/main/tssp/src` に `.ts` と `.html` を書く（「配置」「書き方の約束」「Rhino 制約」）
3. package.json の `tssp:dev` スクリプトを実行し、型エラーと lint 違反を 0 件にする（「ビルド」）

画面・API の生成手順は tssp-page-generator、生成後の検証は tssp-page-verifier を使う。

## 配置

| 置くもの | 場所 |
|---|---|
| `.ts`（ファンクションコンテナ）と `.html`（プレゼンテーションページ） | `src/main/tssp/src` 配下。対にする `.ts` と `.html` は同じディレクトリに同じ名前で置く |
| tssp の出力（`.js`、`.html`、`--dev` では `.js.map`） | `src/main/jssp/src` 配下。tssp が書くので、手で作成・編集しない |

tssp はディレクトリ構成を保って出力する。`.ts` は `.js` に変換し、`.html` はそのままコピーする。

| 入力 | 出力 |
|---|---|
| `src/main/tssp/src/sample/view/list.ts` | `src/main/jssp/src/sample/view/list.js` |
| `src/main/tssp/src/sample/view/list.html` | `src/main/jssp/src/sample/view/list.html` |

- `.ts` と `.html` 以外のファイル（`.d.ts`、`.css`、`.js` など）は出力されない
- 2WaySQL のテンプレート（`.sql`）は出力されないので、JSSP と同じ `src/main/jssp/src/{機能名}/sql/` に直接置く。出力先に手で置くのは、`tssp build` が出力しないファイル（この `.sql`、テナント環境セットアップの拡張インポート `*_import.js`、`source-config.xml`）だけ
- `.html` の書き方は JSSP と同じ

## ビルド

tssp は package.json の devDependencies（`@intra-mart/tssp`）に入っている。package.json の `scripts` にある次のスクリプトを、プロジェクトのルートで、プロジェクトのパッケージマネージャを使って実行する（`bun run tssp:dev`、`npm run tssp:dev`、`pnpm run tssp:dev`、`yarn run tssp:dev`）。node は 20.19 以上の 20 系か 22.12 以上を使う。

| スクリプト | 実行されるコマンド | `.ts` からの出力 | 用途 |
|---|---|---|---|
| `tssp:dev` | `tssp build --dev` | `.js`（minify なし）と `.js.map` | 開発中の検査、デバッグ |
| `tssp:build` | `tssp build`（`--production` と同じ） | minify した `.js`。ソースマップは出さない | 本番 |

- オプションを足すときはスクリプト名の後ろに書く（`bun run tssp:build --locale ja`）。npm だけは `--` を挟む（`npm run tssp:build -- --locale ja`）
- どちらも `.html` をコピーする。`--dev` と `--production` は同時に指定できない
- minify してもトップレベルの名前（`init`、`$data` など）と、`@parameter` を含むコメントは残る
- メッセージの言語は実行環境のロケールで決まる。`--locale ja|en|zh_CN` で指定できる（対応外の言語は en）。tsc の診断と、規則名やファイル位置など oxlint 自身の出力は `--locale` によらない

処理は次の順で進む。型検査から衝突検査までのどれかで失敗すると、何も書き出さずに終了する。

1. 型検査。tsconfig を読み、`target` を ES5 に上書きして検査する
2. lint。Rhino が受け付けない書き方を検査する
3. 変換。`.ts` を JavaScript にし、`.html` を読み込む
4. 衝突検査
5. 書き出し

`--tsconfig` を省略すると、次の順で最初に見つかった tsconfig を使う。`--tsconfig` に指定したファイルが無いときは、ほかの候補を探さずに終了コード 2 で終わる。

1. プロジェクトのルートの `tsconfig.json`
2. `src/main/tssp/tsconfig.json`
3. tssp に同梱の `tsconfig.default.json`。`strict: true`、`lib: ["ES2015"]` で、include は `src/main/tssp/src` と `d.ts/**/*.d.ts`

ルートの `tsconfig.json` か `src/main/tssp/tsconfig.json` を置くときは、同梱の既定と同じ `lib: ["ES2015"]` を書く。`lib` を書かないと DOM の型が入り、d.ts の `Request`、`File`、`URL`、`Storage`、`Cache` などと衝突して TS2300 になる。

| 終了コード | 意味 |
|---|---|
| 0 | 成功 |
| 1 | 型エラー、lint 違反、変換の失敗、衝突、I/O エラー |
| 2 | 引数の誤り、`--src` のディレクトリや `--tsconfig` のファイルが無い、`src/main/tssp/src` の `.ts` が tsconfig の対象に入っていない |

## 書き方の約束

```typescript
// src/main/tssp/src/sample/view/model.ts。型だけを置く
export interface Item {
  id: string;
  label: string;
}
```

```typescript
// src/main/tssp/src/sample/view/list.ts
import type { Item } from './model';

// list.html から参照するバインド変数
export let $title = '一覧';
export let $data = '{}';

export function init(request: Request): void {
  const keyword = request.getParameterValue('keyword') || '';
  const items: Item[] = [{ id: '1', label: keyword }];
  // JSON 内の </script> でスクリプトが終端しないよう、'/' を '\/' に置き換える
  $data = JSON.stringify({ list: items }).replace(/\//g, '\\/');
}
```

- バインド変数は `export let $data = ...`、エントリポイントは `export function init(request: Request): void` と書く。`export` は出力で外れる
- `const` は使ってよい。tssp が `let` に変換する
- `import` 文は出力から消える。ほかの `.ts` の型は `import type` で読む
- 共通モジュール（`common/` の `.ts`）の関数や定数を実行時に使うには、JSSP と同じく `load('sample/common/util');` で読み込む（引数は `src/main/jssp/src` からの拡張子なしのパス。読み込んだファイルのトップレベルの名前が呼び出し側のスコープに入る）。型検査のために `import { helper } from '../common/util';` も書く（出力からは消える）。共通モジュール側は、参照される名前を `export function` / `export let` で書く
- 関数や定数などの値を import しても、実行時には届かない。型検査と lint は通るが、出力の `.js` ではその名前が定義されていない
- `export default`、`export =`、`import =`、`import()`、`import.meta` は lint エラーになる
- `?.`、`??`、オブジェクトの spread と rest（`{ ...o }`、`const { a, ...rest } = o`）は tssp が Rhino 向けに書き換え（出力の `.js` に `var` を使う補助関数が入る）、アロー関数、テンプレートリテラル、分割代入はそのまま出力に残る。いずれもサーバ側のコードでは使わず、JSSP と同じく `function`、`+` の文字列連結、プロパティアクセスで書く。ビルド出力に対して実行する `validate-jssp-code.js`（`tssp-page-verifier` が使う）が JSSP-JS-002（`var`）/ 007（アロー関数）/ 012（テンプレートリテラル）として指摘するため。「Rhino 制約」の表に当たる形（配列の残余要素 `[a, ...b]`、計算キー、分割代入の既定値、既定引数、`catch` と rest 引数の分割代入、アロー関数の rest 引数、`async`）は、型検査か lint でビルドが止まる
- 型だけの `.ts`（例の `model.ts`）からも、実行する文の無い `.js` が出力される

## 型検査

型検査は、tsconfig が include する `d.ts/**/*.d.ts` の宣言と、tsconfig の `lib`（同梱の既定では ES2015）の宣言に対して行う。どちらにも無いグローバルや、型に宣言されていないメソッドを使うと型エラーで止まる。例外は `any` 型の値と、インデックスシグネチャ（`[key: string]: ...`）を持つ型で、宣言に無い名前のプロパティを読んでも型検査を通る。`lib` にあっても Rhino に無いもの（例: `Proxy`、`Reflect`）は型検査と lint を通り、実行時に ReferenceError になるので使わない。

```
src/main/tssp/src/a.ts(1,21): error TS2551: Property 'getLoggr' does not exist on type 'typeof Logger'. Did you mean 'getLogger'?
型エラーがあるので変換しません
```

実装前に次の 3 段階を行う。

1. 使う API（クラス、グローバル関数、オブジェクト）を列挙する
2. 該当する d.ts を Read する。場所が分からなければ `grep -rnwE "(class|interface|type|namespace|function|const) Logger" d.ts/` のように宣言を探す
3. 引数と戻り値の型を控えてから書く。戻り値に `null` を含むメソッドは `null` の場合を処理する

| ディレクトリ | 内容 |
|---|---|
| `d.ts/platform/` | プラットフォーム標準 API。`Request` は `d.ts/platform/standard/im-ssjs-request.d.ts` |
| `d.ts/tenant/` | テナント管理 API |
| `d.ts/master/` | IM-共通マスタ API |
| `d.ts/workflow/` | IM-Workflow API。IM-Workflow を含むプロジェクトのみ |
| `d.ts/bpm/` | IM-BPM API。IM-BPM を含むプロジェクトのみ |

- `Request` は URL 引数をプロパティで読めるよう `[key: string]: Request.Attribute`（`Request.Attribute` は `any`）を持つ。`request.xxx` は d.ts に無い名前でも、メソッドとして呼んでも型検査を通るので、メソッド名は d.ts で確かめる
- 型検査を `any`、`as any`、`@ts-ignore`、`@ts-expect-error`、`@ts-nocheck`、自前の `declare` で回避しない。d.ts に見つからない API は使わず、ユーザに報告する
- tssp は型検査の `types` を空に上書きする。`process` や `require` など Node.js の名前は使えない（TS2591）
- 型検査の `target` は ES5 なので、`Set` や `Map` を `for...of` で回すと TS2802 になる。`forEach` で回す。配列は `for...of` で回せる。`lib` が ES5 だけの tsconfig では、`Set`、`Map`、`Promise`、`Symbol` を値として使うと TS2583・TS2585 になる

## Rhino 制約

lint は 17 規則で、Rhino 1.7.15.1 が受理しない書き方と、エラーなしに意味が変わる書き方を検出する。`no-loop-closure-capture` だけが警告（warning）で、ほかはエラー。tssp は警告も違反として扱い、どの規則に当たってもビルドは終了コード 1 で止まる。`.d.ts` と `declare` の内側は検査しない。

```
src/main/tssp/src/a.ts:1:17: error rhino(no-default-param): 既定引数はRhino 1.7.15.1で構文エラーになる
lint 違反があるので変換しません
```

| 規則 | 禁止される書き方 | 代わりの書き方 |
|---|---|---|
| `no-array-rest-pattern` | 配列の分割代入の残余要素（`const [a, ...b] = xs`） | `xs[0]` と `xs.slice(1)` |
| `no-arrow-rest` | アロー関数の rest 引数（`(...xs) => xs`） | `function (...xs: number[]) { ... }` |
| `no-async` | `async` の関数・アロー関数・メソッド | 同期の関数で書く |
| `no-catch-destructuring` | `catch` の分割代入（`catch ({ message })`） | `catch (e)` で受け、`(e as Error).message` を読む |
| `no-class` | `class`、constructor 引数のアクセス修飾子（`private p` など） | `interface` で型を書き、オブジェクトを返す関数で作る |
| `no-computed-key` | オブジェクトリテラルと分割代入の計算キー（`{ [k]: v }`） | `const o: Record<string, number> = {};` のように型を付けて作ってから `o[k] = v`。読むときは `o[k]` |
| `no-default-param` | 既定引数（`function f(a = 1)`） | `a?: number` にし、本体で `a === undefined ? 1 : a` |
| `no-destructuring-default` | 分割代入の既定値（`const { a = 1 } = o`） | `const a = o.a === undefined ? 1 : o.a;` |
| `no-generator-method` | オブジェクトの generator メソッド（`{ *m() {} }`） | `m: function* () {}` か `function*` の宣言 |
| `no-helper-name` | 変換が使うヘルパー関数と同じ名前をトップレベルで宣言する（`ownKeys`、`defineProperty`、`toPropertyKey`、`toPrimitive`、`typeof`、`objectSpread`、`objectWithoutProperties`、`objectWithoutPropertiesLoose`、`usingCtx`。前に `_`、後ろに数字が付いたものを含む） | 別の名前にする。関数の中で宣言する名前は対象外 |
| `no-loop-closure-capture`（警告） | `for`・`for...in`・`for...of` の頭で `let`・`const` 宣言した変数を、ループ内のクロージャで参照する。Rhino では全反復が同じ変数を共有する | ループ本体で `const j = i;` と宣言し直し、`j` を参照する。`forEach`・`map` などへ直接渡すコールバックは対象外 |
| `no-module-runtime` | `export default`、`export =`、`import =`、`import()`、`import.meta` | 名前付きの `export` と `import type` |
| `no-namespace-value` | `namespace` 内の `export const`・`export let`・`export var` | 値は `namespace` の外に置く。`namespace` 内の `export function` と型は使える |
| `no-new-target` | `new.target` | 使わない |
| `no-rest-destructuring` | rest 引数の分割代入（`function f(...[a, b])`） | `function f(...args: number[])` で受け、本体で `args[0]`、`args[1]` を読む |
| `no-spread-call-array` | 呼び出し・`new`・配列リテラルの spread（`f(...xs)`、`[...xs]`） | `f.apply(null, xs)`（メソッドは `o.m.apply(o, xs)`）、`xs.concat(ys)`、`xs.slice()` |
| `no-unsupported-regexp` | 正規表現リテラルの名前付きグループ（`(?<y>...)`、`\k<y>`）、後読み（`(?<=...)`、`(?<!...)`）、修飾子グループ（`(?i:...)`）、`g` `i` `m` `s` `y` 以外のフラグ（`u`、`d`、`v`） | 前後の文字も含めて番号付きのグループ `(...)` で照合し、`m[1]` などで取り出す。正規表現リテラルのフラグは `g` `i` `m` だけを使う。`s` と `y` は lint を通るが型検査が TS1501 で止めるので、`new RegExp('a.b', 's')` と書く |

`no-unsupported-regexp` は正規表現リテラルだけを検査する。名前付きグループ、後読み、修飾子グループ、`u` `d` `v` フラグは、`new RegExp(...)` に渡すとビルドは通るが、実行時に SyntaxError になる。`s` と `y` は `new RegExp(...)` に渡せば型検査を通り、Rhino でも動く。名前付きグループと `u` `d` `v` の正規表現リテラルは、lint より前に型検査が TS1503・TS1501 で止める。tssp が `target` を ES5 に上書きするので、tsconfig の `target` を上げても直らない。

## 衝突

tssp は書き出したファイルを `.accel/tssp-generated.txt` に記録する。この一覧はコマンドを実行したディレクトリ（プロジェクトのルート）に置かれ、そこからの相対パスが 1 行に 1 つ並ぶ。

書き出す予定のパスに、一覧に無いファイルかディレクトリが既にあると衝突になる。tssp は衝突したパスを表示して終了コード 1 で終わり、何も書き出さない。

```
生成ファイル一覧（.accel/tssp-generated.txt）に無いファイルかディレクトリが、出力するパスに既にあるので、何も書きません:
  src/main/jssp/src/sample/view/list.js
```

直し方は次のどちらか。

1. そのファイルが tssp の出力なら、消してから再実行する
2. 手書きのファイルなら、対応する `.ts` か `.html` の名前を変える

- 一覧が無いときは、書き出す予定のパスにある既存のファイルとディレクトリがすべて衝突になる。予定のパスと重ならないファイルは衝突しない。既存のプロジェクトに導入するときは、出力先にある tssp の生成物を消してから最初のビルドを行う
- 一覧に載っている出力は、元の `.ts` や `.html` を消すと、次に成功したビルドで削除される。一覧に無いファイルは削除しない
- 書き出しや削除の途中で I/O エラーが起きると、それまでの書き出しと削除は元に戻らない。原因を直して同じコマンドを再実行する。一覧を保存できなかったときは、出力先にある tssp の生成物を消してからやり直す

## デバッグ

1. 出力先のパスに `jssp` という名前のディレクトリが含まれることを確かめる。既定の出力先 `src/main/jssp/src` は条件を満たす。`--out` で出力先を変えるときも、パスに `jssp` を含める。`--out` を変えてビルドすると、`.accel/tssp-generated.txt` に載っている前回の出力は、既定の出力先のものも含めて削除される。戻すときは `--out` を付けずに再ビルドする
2. `tssp:dev` スクリプトで変換する。`.js` と同じディレクトリに `.js.map` が出力される
3. デバッガで元の `.ts` にブレークポイントを置く

`--dev` を付けないビルドが成功すると、前回の `--dev` で出力された `.js.map` は削除される。
