---
name: jssp-im-contents-search-generator
description: IM-ContentsSearch の独自クローラ（Solr インデックス登録・削除ジョブ）と独自コンテンツ表示テンプレートを生成する。クローラを作成、Solr に登録、全文検索に対応、コンテンツ検索を追加、IM-ContentsSearch を拡張、検索結果テンプレートを作成、と言及されたときに使用。jssp-im-job-generator と組み合わせてジョブ登録手順も案内すること。
---

■■ 参照ルール チェックリスト（必須） ■■

実装着手前に、以下を確認すること。未チェック項目がある場合は着手不可。

- [ ] [jssp-accessibility](../../../requirements/jssp-accessibility/AGENTS.md) を参照し、内容を理解した
- [ ] [jssp-code-style](../../../requirements/jssp-code-style/AGENTS.md) を参照し、内容を理解した
- [ ] [jssp-error-handling](../../../requirements/jssp-error-handling/AGENTS.md) を参照し、内容を理解した
- [ ] [jssp-file-structure](../../../requirements/jssp-file-structure/AGENTS.md) を参照し、内容を理解した
- [ ] [jssp-logging](../../../requirements/jssp-logging/AGENTS.md) を参照し、内容を理解した
- [ ] [jssp-naming](../../../requirements/jssp-naming/AGENTS.md) を参照し、内容を理解した
- [ ] [jssp-overview](../../../requirements/jssp-overview/AGENTS.md) を参照し、内容を理解した
- [ ] [jssp-presentation-page](../../../requirements/jssp-presentation-page/AGENTS.md) を参照し、内容を理解した
- [ ] [jssp-security](../../../requirements/jssp-security/AGENTS.md) を参照し、内容を理解した


# IM-ContentsSearch 拡張 プログラム生成スキル

## 目的

intra-mart Accel Platform の IM-ContentsSearch 機能を拡張し、独自コンテンツの Solr への登録（クローラジョブ）と独自の検索結果表示（テンプレート JSSP）を生成するスキル。

SSJS 向け API は公式には提供されていないため、Rhino の `Packages.***` 構文で Java クラスを直接呼び出して実装する。

## 生成対象

| カテゴリ | ファイル | 役割 | 多言語 |
|------|---------|------|-------|
| クローラジョブプログラム | サーバサイド JavaScript として認識される場所（`src/main/jssp/src/` など）に配置されればファイル名などの規約は特に持たない（例: `src/main/jssp/src/{機能名}/job/crawler.js`） | クローラジョブ（Solr インデックス登録・削除） | - |
| 検索結果テンプレート | スクリプト開発モデル（JSSP）の構成に準じていればファイル名などの規約は特に持たない（例: `src/main/jssp/src/im_contents_search/template/{機能名}.js`） | 検索結果テンプレート（ファンクションコンテナ） | - |
| 検索結果テンプレート | スクリプト開発モデル（JSSP）の構成に準じていればファイル名などの規約は特に持たない（例: `src/main/jssp/src/im_contents_search/template/{機能名}.html`） | 検索結果テンプレート（プレゼンテーションページ） | - |
| 検索結果テンプレート | `src/main/conf/contentssearch-template-config/{機能名}.xml` | テンプレート設定（TYPE・テンプレートパス・動的フィールド定義） | - |
| 検索結果テンプレート | `src/main/conf/message/` 配下にメッセージプロパティファイルを作成済みの場合は、専用のメッセージプロパティファイルを用意せずに、作成済みのメッセージプロパティファイルにキーを追加しても可（例: `src/main/conf/message/{モジュール識別子}/{機能名}/contents_search/caption*.properties`） | 検索結果の表示用メッセージプロパティファイル（TYPE 表示名・フィールドラベルなどを定義） | ja / en / zh_CN |

状況に応じてクローラのみ・テンプレートのみの生成も可能。

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `jssp-function-container.md` | 🟢 **必読** — テンプレート JS の `init()` 構造 |
| `jssp-naming.md` / `jssp-code-style.md` | 🟢 必読 |
| `jssp-error-handling.md` / `jssp-logging.md` | 🟢 **必読** — クローラは詳細ログとエラー処理が必須 |
| `jssp-2way-sql.md` | 🟡 **2WaySQL を使用する場合のみ参照**（クローラ対象の検索に 2WaySQL を使用する場合など） |
| `jssp-presentation-page.md` | 🟡 テンプレート HTML の基本構造（imcs 専用クラスは本スキルの assets を優先） |
| `jssp-security.md` | 🟡 テンプレート HTML 実装時は XSS 対策セクションを参照。検索結果コンテンツ（`request` 引数）のデータは Apache Solr 由来のデータのため、格納型 XSS の可能性はゼロではない。DOM 操作では `textContent` を使用し `innerHTML` は iAP 内部生成 HTML のみに限定すること |

---

## 実装手順

**このワークフローを上から順番に実行すること。ステップの省略・順序変更は禁止。**

---

### ステップ 1: 要件ヒアリング

以下の情報をユーザから確認する。未定の項目はスキルが適切なデフォルトを提案する。

**クローラを生成する場合:**

| 確認項目 | 補足 |
|---------|------|
| 機能名（物理名） | ファイルパス・定数に使用（例: `sales_order`）。スネークケース推奨 |
| コンテンツ生成元データ | 登録用コンテンツを生成するデータソース（DB に登録されているデータからコンテンツを生成して登録するなら対象テーブル名やカラム定義など） |
| コンテンツ定義 | 登録用コンテンツの構造を設計するための定義情報（標準フィールドや動的フィールドの定義、データ型、変換ルールなど） ※Solr フィールド種別は `reference/dynamic-fields.md` の種別表を参照 |
| TYPE 値の設計 | 親 TYPE（例: `sales_order`）＋ 子 TYPE（分類ごと）の階層が必要か。**iAP 製品が使用している TYPE（`workflow` / `imbox` / `iac` / `bpw` / `acceldocuments` / `wdc` / `iag` / `imkb`）は使用禁止。** 今後の製品追加でこれ以外の TYPE が追加される可能性もあるため、独自 TYPE には機能名や会社識別子を含む固有の名称を使うこと |
| 詳細ページの URL | 検索結果に付与する元情報のページへのリンク（`content.setUrl()` に設定する相対パス）（例: `sales_order/detail`） |
| 権限設定 | 利用可能なビルダーは `reference/aci-builders.md` を参照。代表的なものは「認証ユーザ全員」`EveryoneACIBuilder` / 「特定ロール」`StandardRoleACIBuilder` / 「特定ユーザ」`StandardUserACIBuilder` / 「組織」`StandardDepartmentACIBuilder` など。データ行ごとに動的に設定することも可能 |

**テンプレートを生成する場合:**

| 確認項目 | 補足 |
|---------|------|
| 検索結果テンプレートに表示するフィールド | 標準フィールドと、表示する動的フィールド（クローラと一致させる） |
| 多言語対応の要否 | 必要な場合は各言語の表示文言を確認 |

---

### ステップ 2: アセットの読み込み

生成するプログラムに応じて以下のアセットを **Read ツールで読み込む**。**このステップを省略してはならない。**

| 生成対象 | 読み込むファイル |
|---------|----------------|
| クローラ | `assets/simple-crawler.md` |
| テンプレート（JS・HTML） | `assets/simple-template.md` |

---

### ステップ 3: Java API リファレンスの読み込み

以下の reference ファイルを **Read ツールで必ず読み込む**。記憶や推測で Java クラス名・メソッドを書いてはならない。

| ファイル | 読む条件 |
|---------|---------|
| `reference/java-api-classes.md` | **常に読む** — 全 Java クラスの完全修飾名・主要メソッド・SSJS 制約 |
| `reference/aci-builders.md` | **常に読む** — 利用可能な権限ビルダー全 9 種のコンストラクタと SSJS 呼び出しパターン |
| `reference/dynamic-fields.md` | 動的フィールドを使う場合 — `Fields.*` 種別とデータ型変換パターン |
| `reference/template-config.md` | テンプレートを生成する場合 — XML 設定の構造 |

---

### ステップ 4: クローラジョブの生成

`assets/simple-crawler.md` を参考にクローラジョブプログラム（例: `src/main/jssp/src/{機能名}/job/crawler.js`）を生成する。

※ジョブプログラムは `jssp-im-job-generator` を使うこと。

**クローラジョブプログラムの必須構造:**

1. Java クラス参照（`let ContentsSearchManager = Packages.***` 等）
2. `execute()` — ジョブエントリーポイント（パラメータは `Contexts.getJobSchedulerContext().getParameter()` で取得）
3. `executeDelta(manager, withCommit)` — 差分クローリング
4. `executeDelete(manager, withCommit)` — 削除クローリング
5. コンテンツ登録（標準フィールド + 動的フィールド + 添付 + 権限）・削除用のヘルパー関数（必要な場合）

**禁止事項:**
- `BaseCrawlingJob` の継承（SSJS では不可能。`execute()` 関数を直接実装する）
- `java.lang.Integer.valueOf()` 等の `valueOf` 使用（Rhino が戻り値を JS Number に変換するため。`new java.lang.Integer()` コンストラクタを使う）
- INT / LONG フィールドを JS Number のまま `setValue` すること

---

### ステップ 5: テンプレートの生成

`assets/simple-template.md` をベースに検索結果テンプレート（ファンクションコンテナ / プレゼンテーションページ）を生成する。

生成ファイル例:
- `src/main/jssp/src/im_contents_search/template/{機能名}.js`
- `src/main/jssp/src/im_contents_search/template/{機能名}.html`

**テンプレート JS の必須実装:**
1. `let $data = '{}';` のグローバル変数宣言（JSON 文字列として初期化）
2. `init(request)` 関数 — iAP が 1 件ずつ呼び出すエントリーポイント。`main(request)` を呼び出し、戻り値の `response` を `JSON.stringify(response).replace(/\//g, '\\/')` で `$data` に格納する
3. `main(request)` 関数 — try/catch でエラーハンドリングし、`{ result: null, error: { code, message } }` 形式のオブジェクトを返す
4. `processBusinessLogic(request)` 関数 — 表示データを構築して返す。画面表示用ラベルは `MessageManager.getMessage()` でサーバ側に取得し `labels` プロパティに含める
5. 日付・数値フォーマット用のヘルパー関数（必要な場合）

**プレゼンテーションページの必須実装:**
- ルートは `<div>` とし、各 CSS クラス（`imcs-content-detail-title` / `imcs-content-detail-subtitle` / `imcs-content-detail-option` / `imcs-content-detail-snippets`）を持つ HTML スケルトンを先に記述する
- `<div>` の末尾に IIFE 形式の `<script>` ブロックを置く
- `<script>` タグの直後に `(function($data) {` を配置し、IIFE の引数として `<imart type="string" value=$data escapeXml="false" escapeJs="false" />` で展開した JSON を受け取る（`$data` をグローバル変数にしない）
- `$data.error.code` が設定されている場合はコンテナを非表示にして処理を中断する
- `document.currentScript.parentElement` でコンテナを取得し、`querySelector` で各要素を参照して `textContent` / `innerHTML` で値をセットする

**禁止事項:**
- ユーザ由来の値（`$data.result.title` / 動的フィールド値など）に `innerHTML` を使用すること（XSS）— `textContent` を使うこと
- `innerHTML` は `$data.result.snippets`（iAP がキーワードを `<b>` タグでマークアップしたテキスト）のみに使用すること
- テンプレートから `ContentsSearchManager.search()` を呼び出すこと（テンプレートは受け身）

---

### ステップ 6: テンプレート設定 XML の生成

`reference/template-config.md` を参照して以下のファイルを生成する。

**生成ファイル:**
- `src/main/conf/contentssearch-template-config/{機能名}.xml`

**実装ポイント:**
- TYPE 階層（親・子）をクローラの `setTypes()` 設計と一致させる
- 子の TYPE の `type` 属性には `"<親の TYPE>$<子の TYPE>"` ではなく子の TYPE のみ指定し、`<parent-type>` で親を明示する
- `<require-dynamic-fields>` にはテンプレート HTML で **表示する動的フィールドのみ**を宣言する
- `<template-path>` には `.jssp` 拡張子を使う（`.js` / `.html` のペアを指す）

**検索結果テンプレートに `routing-jssp-config/` のルーティング設定は不要**。テンプレートは IM-ContentsSearch が `<template-path>` を介して直接呼び出すため、通常の画面のような URL ルーティングを経由しない（詳細は `.agents/requirements/jssp-file-structure/AGENTS.md` の「ルーティングテーブル経由で呼ばれない画面の例外規約」参照）。

---

### ステップ 7: メッセージプロパティの生成

表示用メッセージプロパティファイルに画面表示用の名称を設定する。

`src/main/conf/message/` 配下にメッセージプロパティファイルを作成済みの場合は、専用のメッセージプロパティファイルを用意せずに、作成済みのメッセージプロパティファイルにキーを追加することも可。

※プロパティファイルの作成は `jssp-localize-support` を使うこと。

**必須キー:**

- TYPE（親）の画面表示用プロパティキー
- 子 TYPE の画面表示用プロパティキー（子 TYPE がある場合）
- 検索結果に表示するフィールドの画面表示用プロパティキー（独自に検索結果に表示したいフィールドがある場合）

日本語・中国語の `caption_ja.properties` / `caption_zh_CN.properties` は **必ず Unicode エスケープ形式**で記述する（`native2ascii` 相当）。

---

### ステップ 8: ジョブスケジューラへの登録案内

クローラを生成した場合、以下の情報をユーザに案内する。

**クローラジョブのパラメータ設計:**

`BaseCrawlingJob.java` の Javadoc で定義されているパラメータキーと初期値に準拠すること。

| パラメータ名 | デフォルト | 許容値 | 動作 |
|------------|-----------|--------|------|
| `crawlingType` | `DELTA` | `DELTA` / `DELETE` / `REINDEX` | クローリング種別 |
| `withCommit` | `true` | boolean 文字列 | 処理完了後にコミットを実行する |
| `withOptimize` | `false` | boolean 文字列 | 処理完了後に最適化を実行する。負荷が高いため、ジョブネットワーク末尾に `OptimizeJob` を配置する構成を推奨 |
| `maxSegments` | `1` | 1 以上の整数 | 最適化のセグメント数。値が小さいほど最適化の精度が高いが処理負荷も増加する。`withOptimize=true` のときに有効 |
| `groupName` | `"default"` | 文字列 | 検索サーバグループ名 |

**初回実行:** `crawlingType=REINDEX` で全件インデックスを作成する。
**定期実行:** `crawlingType=DELTA` でスケジュール実行する。

---

## SSJS (Rhino) 固有の制約

詳細は `reference/java-api-classes.md` を参照すること。主要な制約一覧:

| 制約 | 対応策 |
|------|--------|
| Java varargs に単値を渡すと解決できない場合がある | JS 配列で包む（例: `content.addText([description])`、`content.setTypes([type1, type2])`） |
| プリミティブ型（int / long など）ではなくラッパークラス（Integer / Long など）を引数の型にしているメソッドを実行する場合は、明示的に型変換を行う必要がある | `new java.lang.Integer(val)` または `new java.lang.Long(val)` で明示的に変換してから渡す。また、`Integer.valueOf()` などによる型変換は、戻り値を Rhino が Number 型に変換するため使用できない |
| `LastCrawlingDateHolder` には日時クリア用のメソッドが存在しない | `updateLastCrawlingDate(new java.util.Date(0))` などで過去日時を設定してリセットする |
| Java `List` に `for...in` は使えない | `for (let i = 0; i < list.size(); i++) list.get(i)` で反復する |
