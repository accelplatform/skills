---
paths:
  - "src/main/jssp/**/*.js"
  - "src/main/jssp/**/*.html"
  - "src/main/conf/routing-jssp-config/**/*.xml"
  - "src/test/jssp/**/*.test.js"
---

# ファイル構成規約

> **適用範囲**: 🟢 **常時** — 全ての JSSP 実装で適用。ファイル配置を決める際は必ず参照。

## ディレクトリ構造

```
src/
├── main/
│   ├── conf/
│   │   └── routing-jssp-config/                # ルーティング設定
│   └── jssp/
│       └── src/                                # JSSP ソースルート
│           └── {category}/                     # 類似機能をまとめた名称
│               ├── view/                       # 画面
│               │   ├── {view}.js               # ファンクションコンテナ
│               │   └── {view}.html             # プレゼンテーションページ
│               ├── api/                        # REST-API プログラム
│               │   └── {api}.js                # API 実装（スクリプト開発モデル）
│               ├── job/                        # ジョブプログラム
│               │   └── {job}.js                # ジョブ実装（スクリプト開発モデル）
│               ├── workflow/                   # IM-Workflow 連携プログラム
│               │   ├── apply/                  # 申請画面（ディレクトリで画面種別を区別、後述の例外規約参照）
│               │   │   ├── index.js
│               │   │   └── index.html
│               │   ├── approve/                # 承認画面
│               │   │   ├── index.js
│               │   │   └── index.html
│               │   ├── {action}.js             # アクション処理（スクリプト開発モデル）
│               │   ├── {process}.js            # 案件開始処理・案件終了処理（スクリプト開発モデル）
│               │   └── {rule}.js               # ルール判定処理（スクリプト開発モデル）
│               └── common/                     # 共通処理
│                   └── {function}.js           # 関数
├── test/
│   ├── jssp/
│   │   └── src/                                # Jest on Rhino 単体テスト
│   │       └── {category}/                     # ソースと同一構造
│   │           ├── view/{view}.test.js
│   │           ├── api/{api}.test.js
│   │           └── common/{function}.test.js
│   └── e2e/                                    # Playwright E2E テスト
│       └── {module-name}.spec.ts
```

### 基本方針

- 機能単位でフォルダを分割し、関連ファイルをまとめる
- `{function}` 配下の js ファイルで実装がまったく同じで共通で使われる処理は、`common/` 配下に集約する
  - 1機能1ファイルとする
- フォルダ名は小文字英数字、アンダースコアを使用する

## ファイル命名規則

### 基本ルール

| 項目 | 規則 | 例 |
|------|------|-----|
| 文字種 | 小文字英数字、アンダースコア | `user_master.js` |
| ペアリング | .js と .html は同名・**必ずペアで存在** | `user_edit.js` + `user_edit.html` |
| 拡張子 | 必ず小文字 | `.js`, `.html` |

### ルーティングテーブル経由で呼ばれない画面の例外規約

本ページで規定する `view/{view}.js` パターン（snake_case の画面ごとの固有名）は、**ルーティングテーブル経由で URL アクセスによって呼ばれる画面**を対象とする。

以下のように、ルーティングテーブルを通さず**別経路で呼び出される画面**については、各専用スキルが定める **別系統の規約** に従うこと（呼び出し元が異なるため、本規約と矛盾するわけではない）:

| 呼び出し経路 | 配置・命名規約 | 担当スキル |
|------------|--------------|-----------|
| IM-Workflow エンジン経由（XML の `scriptPath`） | `{機能名}/workflow/{画面種別}/index.js`（ディレクトリで画面種別を区別、ファイル名は `index` に統一） | `jssp-im-workflow-usage` |
| ポータル機能経由（`b_m_portlet_info.path`） | `{機能名}/view/index.js`（本ページの `view/{view}.js` パターンで配置するが、ルーティング設定・ルーティング認可は作成しない） | `jssp-page-generator`（`assets/simple-portlet.md`） |
| IM-ContentsSearch 経由（`<template-path>`） | `im_contents_search/template/{機能名}.js` / `.html`（スクリプト開発モデルの構成に準ずればファイル名規約なし。ルーティング設定・ルーティング認可は作成しない） | `jssp-im-contents-search-generator` |

これらの例外画面は、呼び出し元がコンテンツ定義 XML やプラットフォーム機能経由のため URL ルーティングが不要になる（IM-Workflow の場合はさらに 1 機能内に複数画面（apply / approve / detail 等）を持つ構造になる）。
新規生成時は各担当スキルの SKILL.md を参照すること。

### .html ファイルの必須化

JSSP の画面（`view/` 配下）では、**プレゼンテーションページに表示する内容がなくても、`.js` と同名の `.html` ファイルを必ず配置しなければならない**。
ファイルが存在しないと画面のリクエスト時にエラーとなるため、表示内容が無い場合は **空ファイル**（0 バイト）でも構わないので作成すること。

```
content/view/content_list.js    # ファンクションコンテナ
content/view/content_list.html  # プレゼンテーションページ（空でも必須）
```

### 禁止事項

- 大文字の使用（例: `UserMaster.js` は不可）
- ハイフンの使用（例: `user-master.js` は不可）
- スペースや日本語の使用

### 推奨パターン

```
# 画面系
{機能名}_{画面種別}.js/.html

例:
user_list.js        # ユーザ一覧
user_edit.js        # ユーザ編集
travel_apply.js     # 申請画面
travel_approve.js   # 承認画面

# 処理系（画面を持たない）
{動作種別}_{処理対象}.js

例:
search_user.js      # 検索処理
register_user.js    # 登録処理
update_user.js      # 更新処理
delete_user.js      # 削除処理
```

## ルーティング設定

ルーティング設定ファイルは `routing-jssp-config/` 配下に配置する。

### 基本構造

```xml
<?xml version="1.0" encoding="UTF-8"?>
<routing-jssp-config
    xmlns="http://www.intra-mart.jp/router/routing-jssp-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/router/routing-jssp-config routing-jssp-config.xsd">

  <!-- URLとスクリプトのマッピング（各 file-mapping に authz を必ず明示する） -->
  <file-mapping path="/sample/user/list" page="user/view/user_list">
    <authz uri="service://sample/user/list" action="execute" />
  </file-mapping>

</routing-jssp-config>
```

### page 属性の指定方法

`page` 属性には `src/main/jssp/src/` を起点とした相対パス（拡張子なし）を指定する。
ソースファイルは `src/main/jssp/src/` 配下に配置し、ルーティングの `page` にはその中の相対パスを書く。

```
src/main/jssp/src/{category}/view/{view}.js
                    ↓
page="{category}/view/{view}"
```

| ファイルパス | page 属性値 |
|-------------|-------------|
| `src/main/jssp/src/simple_form/view/index.js` | `simple_form/view/index` |
| `src/main/jssp/src/sample_wizard/view/index.js` | `sample_wizard/view/index` |
| `src/main/jssp/src/simple_form/api/register.js` | `simple_form/api/register` |

### 認可設定のガイドライン

- **`welcome-all`（認可スキップ）は原則禁止**。`<authz-default mapper="welcome-all" />` も使用しない。
- 各 `file-mapping` には `<authz uri="service://{機能名}/{処理}" action="execute" />` を**必ず明示**する。
- `uri` で参照する認可リソース（policy / resource / resource-group / subject-group）は `jssp-tenant-setup-generator` スキルで定義・インポートする。
- 認可リソースを用意しないと、デプロイ後のアクセスが常に拒否される点に注意する。

| 書き方 | 用途 | 説明 |
|--------|------|------|
| `<authz uri="..." action="..." />` | 全画面・全 API（原則） | 認可リソースに対するアクセス権を判定する |
| `welcome-all` / `authz-default` | （非推奨・原則使用しない） | 認可をスキップしてしまうため使用しない |
