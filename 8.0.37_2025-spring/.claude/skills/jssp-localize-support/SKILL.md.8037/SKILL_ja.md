---
name: jssp-localize-support
description: intra-mart JSSP の画面やファンクションコンテナに含まれるハードコードされた日本語文字列を多言語化（i18n）する。多言語化して、ローカライズして、国際化して、メッセージプロパティを作って、多言語対応して、localize、i18n と言及されたときに使用。ラベルやメッセージの外部化、メッセージプロパティファイルの作成、<imart type="message"> タグや MessageManager API への書き換えを行う。
allowed-tools: Bash, Read, Write, Glob
---

# JSSP 多言語化支援スキル

## 目的

intra-mart Accel Platform の JSSP コードに含まれるハードコードされた文字列（ラベル、メッセージ、エラーメッセージ等）を、メッセージプロパティファイルに外部化し、多言語対応を実現する。

## キープレフィックス（ベンダー識別子）の確認【作業開始前に必須】

メッセージキーの 2 番目のセグメント `APP`（例: `CAP.Z.APP.<製品名>.<機能名>...`、`MSG.<エラータイプ>.APP.<製品名>...`）は、ベンダー（提供元）・アプリケーションを識別する文字列であり、**デフォルトは `APP`**（汎用のアプリケーション識別子）である。他社向けの開発では、この `APP` 部分をその会社・プロジェクトに合わせた識別子に変更する必要がある。

**多言語化の作業を開始する前に（spec.json の作成・プロパティファイル生成・ソース書き換えのいずれよりも前に）、必ずユーザに以下を質問すること:**

> メッセージキーのベンダー識別子部分を `APP`（デフォルト）のままにしますか？それとも別の文字列に変更しますか？変更する場合はその文字列（例: `ACME`）を指定してください。

- ユーザが指定した識別子を、spec.json のキー・プロパティファイル・ソースコードの書き換えすべてで**一貫して**使用する。
- ユーザが「デフォルトのまま」「`APP` でよい」と回答した場合、または事前に明示的な指示がある場合は `APP` を使用する。
- 本スキル内のサンプル・例・テーブルで使用している `APP` は、この確認結果に応じて読み替えること。

## 対応ロケール

以下の 4 種類のプロパティファイルを作成する：

| ロケール | ファイル接尾辞 | 内容 |
|---------|-------------|------|
| 日本語 | `_ja` | 日本語メッセージ |
| 英語 | `_en` | 英語メッセージ |
| 中国語 | `_zh_CN` | 中国語（簡体字）メッセージ |
| デフォルト | （なし） | どのロケールにも該当しない場合に使用。英語と同一内容 |

## スクリプトによる自動化ワークフロー

手動でプロパティファイルを作成すると、ロケール間のキー不整合・エンコーディングミス・ファイル名誤りが発生しやすい。
**`build-i18n.js`** を使ってスペック JSON から一括生成し、**`validate-i18n.js`** で検証することを推奨する。

### ステップ概要

```
1. スペック JSON を作成（captions / messages / logMessages を列挙）
2. build-i18n.js でプロパティファイルを一括生成（12ファイル）
3. validate-i18n.js で検証（0 error になるまで修正）
4. ソースコードを書き換え（Step 3 参照）
```

### build-i18n.js — プロパティファイル一括生成

```bash
node .claude/skills/jssp-localize-support/scripts/build-i18n.js <spec.json> [--out <outputDir>]
```

`--out` を省略した場合、spec.json の `outputDir` フィールドが使用される。

**spec.json の形式:**

```jsonc
{
  "outputDir": "src/main/conf/message/sample/my_feature",
  "captions": [
    { "key": "CAP.Z.APP.SAMPLE.MY.FEATURE.TITLE", "en": "My Feature", "ja": "マイ機能", "zh_CN": "我的功能" }
  ],
  "messages": [
    { "key": "MSG.E.APP.SAMPLE.MY.FEATURE.SYSTEM.ERROR", "en": "An unexpected error occurred.", "ja": "予期しないエラーが発生しました。", "zh_CN": "发生了意外错误。" }
  ],
  "logMessages": [
    { "key": "E.APP.SAMPLE.MY.FEATURE.00001", "en": "An error occurred while displaying the screen.", "ja": "画面表示中にエラーが発生しました。", "zh_CN": "显示画面时发生了错误。" }
  ]
}
```

生成されるファイル（12ファイル）:

| カテゴリ | ファイル |
|---------|--------|
| キャプション | `caption.properties`（デフォルト=英語）、`caption_en.properties`、`caption_ja.properties`、`caption_zh_CN.properties` |
| メッセージ | `message.properties`、`message_en.properties`、`message_ja.properties`、`message_zh_CN.properties` |
| ログメッセージ | `log-message.properties`、`log-message_en.properties`、`log-message_ja.properties`、`log-message_zh_CN.properties` |

### validate-i18n.js — 検証スクリプト

```bash
node .claude/skills/jssp-localize-support/scripts/validate-i18n.js <messageDir> [--src <jssp_src_dir>]
```

**検証項目:**

| # | チェック内容 |
|---|------------|
| 1 | 12ファイルすべて存在するか |
| 2 | デフォルトファイル（接尾辞なし）と `_en` ファイルの内容が一致しているか |
| 3 | 全ロケール間でキーセットが一致しているか |
| 4 | キー命名規則（ドット区切り、アンダースコア・ハイフン禁止）に準拠しているか |
| 5 | 英語ファイルに非 ASCII 文字が含まれていないか |
| 6 | ja / zh_CN ファイルの非 ASCII 文字が `\uXXXX` 形式でエスケープされているか |
| 7 | 改行コードが LF であるか |
| 8 | ソースファイル（--src 指定時）に日本語文字列リテラルが残存していないか（WARNING） |

エラーが 0 件になるまで修正する（WARNING は確認のみ）。

---

## 手動での多言語化手順

スクリプトを使わず手動で作業する場合は以下の手順に従う。

### Step 1: ハードコード文字列の洗い出し

対象ファイル（.html / .js）を読み込み、以下のカテゴリに分類する：

| カテゴリ | プロパティファイル | 用途 | キー形式 |
|---------|-----------------|------|---------|
| キャプション | `caption_<locale>.properties` | タイトル、ラベル、ボタン名等の短い表示文字列 | `CAP.Z.APP.<製品名>.<機能名>.<キャプション名>` |
| メッセージ | `message_<locale>.properties` | エラーメッセージ、確認メッセージ、成功メッセージ等 | `MSG.<エラータイプ>.APP.<製品名>.<機能名>.<メッセージ名>` |
| ログメッセージ | `log-message_<locale>.properties` | Logger 出力用メッセージ | `<エラータイプ>.APP.<製品名>.<機能名>.<連番>` |

**エラータイプ:**
- `E` — エラーメッセージ
- `W` — 警告メッセージ
- `I` — 情報メッセージ
- `C` — 確認メッセージ

**ログメッセージの連番:** `00001` から始まる 5 桁の数値

**キー命名規則:**
- キー内の区切り文字にはドット（`.`）のみを使用する
- アンダースコア（`_`）やハイフン（`-`）はキー名に使用しない
- 機能名やメッセージ名が複数語の場合はドットで区切る（例: `SIMPLE.FORM`, `USER.CODE`, `SYSTEM.ERROR`）

### Step 2: メッセージプロパティファイルの作成

配置先: `src/main/conf/message/<機能ディレクトリ名>/`

1 つのカテゴリにつき 4 ファイル（ja, en, zh_CN, デフォルト）を作成する。

**重要: native2ascii エンコーディング**

プロパティファイル内の非 ASCII 文字は `\uXXXX` 形式でエスケープする。
Node.js で変換する方法：

```javascript
function native2ascii(str) {
  return str.split('').map(c => {
    const code = c.charCodeAt(0);
    if (code > 127) {
      return String.raw`\u` + code.toString(16).padStart(4, '0');
    }
    return c;
  }).join('');
}
```

英語のプロパティファイルは ASCII のみなのでエスケープ不要。
日本語・中国語はエスケープが必要。

**プロパティファイルの形式:**

```properties
CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE=\u30e6\u30fc\u30b6\u767b\u9332\u30fb\u524a\u9664
CAP.Z.APP.SKILLS.SIMPLE.FORM.SUBTITLE=\u30e6\u30fc\u30b6\u7ba1\u7406\u6a5f\u80fd
```

### Step 3: ソースコードの書き換え

#### プレゼンテーションページ (.html) の場合

`<imart type="message">` タグを使用する。

**HTML 内にインラインで挿入する場合:**

```html
<h1><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE" escapeXml="true" escapeJs="false" /></h1>
```

**JavaScript 内にインラインで挿入する場合（`<script>` ブロック内）:**

```javascript
imuiShowErrorMessage('<imart type="message" id="MSG.E.APP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR" escapeXml="false" escapeJs="true" />');
```

- HTML コンテキスト: `escapeXml="true" escapeJs="false"`
- JavaScript コンテキスト: `escapeXml="false" escapeJs="true"`

**HTML 属性内に挿入する場合:**

```html
<span class="imds-required-label-required" data-required-label="<imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.REQUIRED" escapeXml="true" escapeJs="false" />">
```

#### ファンクションコンテナ (.js) の場合

`MessageManager.getMessage()` API を使用する。
詳細は `reference/api-message-manager.md` を参照。

```javascript
// キーのみ
let title = MessageManager.getMessage('CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE');

// プレースホルダ付き（{0}, {1}, ... で置換）
Logger.error(MessageManager.getMessage('E.APP.SKILLS.SIMPLE.FORM.00001', e.message));
```

### Step 4: 不要になったバインド変数の削除

プレゼンテーションページで `<imart type="message">` を直接使用するようにした場合、ファンクションコンテナ側でタイトル等を設定していたバインド変数（`$title`, `$subTitle` 等）は不要になるため削除する。

**変更前（ファンクションコンテナ）:**
```javascript
let $title = 'ユーザ登録・削除';
let $subTitle = 'ユーザ管理機能';
```

**変更後:** 上記のバインド変数宣言を削除する。

**変更前（プレゼンテーションページ）:**
```html
<h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
```

**変更後:**
```html
<h1><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE" escapeXml="true" escapeJs="false" /></h1>
```

## 参照先

| ファイル | 内容 |
|---------|------|
| `scripts/build-i18n.js` | スペック JSON からプロパティファイルを一括生成（12ファイル） |
| `scripts/validate-i18n.js` | プロパティファイルの正当性検証スクリプト |
| `examples/expense_report.i18n.json` | スペック JSON のサンプル（経費精算申請） |
| `reference/api-message-manager.md` | MessageManager API の型定義・使用例 |
| `assets/localized-form-example.md` | 多言語化済みフォーム画面の実装例（ソース＋プロパティファイル一式） |

## 注意事項

- プロパティファイルの改行コードは LF を使用する
- キー名の製品名・機能名部分はプロジェクトに合わせて命名する（区切り文字はドットのみ、アンダースコア・ハイフン禁止）
- キー 2 番目のセグメント `APP`（ベンダー識別子）はデフォルト値であり、他社向け開発では作業開始前にユーザへ変更要否を確認すること（「キープレフィックス（ベンダー識別子）の確認」参照）
- バリデーションメッセージは、クライアント側（HTML 内 JS）とサーバ側（API の JS）の両方で多言語化する
- エラーテキスト用の `<span>` 要素のデフォルトテキストは空にする（JS で動的に設定されるため）
- `<imart type="string">` で表示していたバインド変数を `<imart type="message">` に置き換えるのを忘れない
