---
name: jssp-im-master-usage
description: intra-mart IM-共通マスタ検索（imACMSearch）の検索ダイアログ呼び出しコードを生成する。ユーザ検索、組織検索、会社検索、パブリックグループ検索、ロール検索等のポップアップ実装パターンを提供する。ユーザ検索、組織選択、マスタ検索、ユーザ選択ダイアログ、社員を選ぶ、部署を検索、と言及されたときに使用。imACMSearch タグのパラメータやコールバック構造は記憶で書かず、必ずこのスキルの reference を参照すること。
---

■■ 参照ルール チェックリスト（必須） ■■

実装着手前に、以下を確認すること。未チェック項目がある場合は着手不可。

- [ ] [jssp-accessibility](../../../requirements/jssp-accessibility/AGENTS.md) を参照し、内容を理解した
- [ ] [jssp-presentation-page](../../../requirements/jssp-presentation-page/AGENTS.md) を参照し、内容を理解した


# IM-共通マスタ検索 コード生成スキル

## 概要

intra-mart Accel Platform の IM-共通マスタ検索（imACMSearch）を利用した検索ダイアログの呼び出しコードを生成するスキルセット。
ユーザ検索、組織検索、会社検索、パブリックグループ検索など、各種マスタ検索画面のポップアップ呼び出しを実装する。

## 適用方針

**IM-共通マスタ（ユーザ・組織・会社・パブリックグループ・プライベートグループ・ロール）から値を選択させる必要が画面に生じた場合は、必ずこのスキルを使ってマスタ検索ダイアログを組み込むこと。** 自前で `<input type="text">` や `<select>` を作って入力させてはならない。

理由:

- ユーザコード・組織コード等の手入力は入力ミス・存在しないコードの混入リスクが高い
- 組織変更・人事異動への追従が困難
- imACMSearch は標準で多言語表示・権限制御・ツリー/キーワード切替に対応している

他スキル（`jssp-im-workflow-usage` / `jssp-page-generator`）で画面を生成する際にこのケースに該当したら、本スキルを併用すること。

## 参照すべき規約

本スキルは画面に組み込む HTML スニペット（`imACMSearch` 呼び出し）を生成する。本スキル単独では `.js` を生成しないため、参照すべき規約は HTML 系に絞られる。全体像は `{{AGENT_RULES}}/README.md` 参照。

| 規約 | 取り扱い |
|------|---------|
| `jssp-presentation-page.md` | 🟢 **必読** — HTML 構造・id 命名 |
| `jssp-naming.md` / `jssp-file-structure.md` | 🟢 必読 |
| `jssp-imds-theme` スキルの reference | 🟢 必読（HTML クラス名は記憶で書かない） |
| `jssp-function-container.md` / `jssp-2way-sql.md` / `jssp-error-handling.md` 等 | 🔴 **本スキル単独では不要**（呼び出し元スキル側で適用） |
| `jssp-accessibility.md` | 🟠 **業務要件次第** — マスタ検索ダイアログは imds 標準実装で基本的な ARIA を持つので、追加で厚塗りする必要は通常なし |

## 完成品サンプル

- `assets/user-search.md` - ユーザ検索の完成品（HTML スニペット）
- `assets/company-search.md` - 会社検索の完成品（HTML スニペット）
- `assets/department-search.md` - 組織検索の完成品（HTML スニペット）
- `assets/public-group-search.md` - パブリックグループ検索の完成品（HTML スニペット）
- `assets/private-group-search.md` - プライベートグループ検索の完成品（HTML スニペット）
- `assets/role-search.md` - ロール検索の完成品（HTML スニペット）

## リファレンス

- `reference/imart-tag-acm-search.md` - `imACMSearch` タグの API リファレンス（パラメータ、プラグインID、コールバック構造）

## 使用タイミング

ユーザが以下のような依頼をした場合：
- 「ユーザ検索を追加して」
- 「組織を選択するダイアログを実装して」
- 「マスタ検索のポップアップを付けて」
- 「ユーザ選択フィールドを作って」

## 実装手順

### 要件ヒアリング

以下を確認する：
- **検索対象**: ユーザ / 組織 / 会社 / パブリックグループ / ロール / その他
- **選択モード**: 単一選択（single）/ 複数選択（multiple）
- **使用タブ**: キーワード検索 / ツリー検索 / 複数タブ
- **取得項目**: コード、名称、その他必要なフィールド
- **配置先**: 既存画面への追加 or 新規画面

### リファレンス参照

`reference/imart-tag-acm-search.md` を読み込み、以下を確認する：
- 検索対象に対応するプラグインID
- コールバック関数で取得できる data フィールド
- 必要なパラメータ設定

### コード生成

`assets/user-search.md` の完成品をベースに、以下の構成でコードを生成する：

#### head 部（`<imart type="head">` 内）

```html
<imart type="head">
  <!-- IM-共通マスタ検索画面呼び出し用タグ -->
  <imart type="imACMSearch" />

  <script type="text/javascript">
    // 1. 検索ダイアログを開くイベントリスナー
    // 2. imACMSearch.open(parameter) の呼び出し
    // 3. コールバック関数の定義
    // 4. window へのコールバック関数の登録
  </script>
</imart>
```

#### body 部（フォーム要素）

```html
<!-- 隠しフィールド（コード値の保持用） -->
<input type="hidden" id=":xxxCode:" value="">
<!-- 表示フィールド（名称表示 + 虫眼鏡アイコン） -->
<input type="text" id=":xxxName:" placeholder="..." class="imds-textbox" readonly value="">
<span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
```

### 実装上の必須ルール

- `<imart type="imACMSearch" />` は必ず `<imart type="head">` 内に配置する
- コールバック関数はグローバルスコープで定義する（`window.関数名 = 関数名` で登録）
- `tabs` でプラグインIDを明示的に指定し、必要なタブのみ表示する
- `prop` に指定するフィールド名はタブ実装が返すキーと一致させる
- 表示用フィールドは `readonly` にして、ダイアログからの選択のみ許可する
- 複数選択モード（`type: 'multiple'`）では、コールバックの `result` を変数に保持し、再検索時に `default_selected` パラメータとして渡すことで、選択済みの項目をダイアログ上に復元する

## 検索対象別の設定例

### ユーザ検索

- プラグインID: `jp.co.intra_mart.master.app.search.tabs.user.list_user`
- prop: `['user_cd', 'user_name']`
- コールバックで取得: `result[i].data.user_cd`, `result[i].data.user_name`
- 完成品: `assets/user-search.md` を参照

### 組織検索

- プラグインID: `jp.co.intra_mart.master.app.search.tabs.department.list`（キーワード）/ `.tree`（ツリー）
- prop: `['company_cd', 'department_cd', 'department_name']`
- コールバックで取得: `result[i].data.department_cd`, `result[i].data.department_name`
- 完成品: `assets/department-search.md` を参照

### 会社検索

- プラグインID: `jp.co.intra_mart.master.app.search.tabs.company.list`
- prop: `['company_cd', 'department_set_cd']`
- コールバックで取得: `result[i].data.company_cd`, `result[i].data.department_name`
- 完成品: `assets/company-search.md` を参照

### パブリックグループ検索

- プラグインID: `jp.co.intra_mart.master.app.search.tabs.public_group.list`（キーワード）/ `.tree`（ツリー）
- prop: `['public_group_set_cd', 'public_group_cd', 'public_group_name']`
- コールバックで取得: `result[i].data.public_group_cd`, `result[i].data.public_group_name`
- 完成品: `assets/public-group-search.md` を参照

### プライベートグループ検索

- プラグインID: `jp.co.intra_mart.master.app.search.tabs.private_group.list`
- prop: `['private_group_cd', 'private_group_name']`
- コールバックで取得: `result[i].data.private_group_cd`, `result[i].data.private_group_name`
- 完成品: `assets/private-group-search.md` を参照

### ロール検索

- プラグインID: `jp.co.intra_mart.master.app.search.tabs.role.list`
- prop: `['role_id']`
- コールバックで取得: `result[i].data.role_id`（ロール名は `result[i].displayName` から取得）
- 完成品: `assets/role-search.md` を参照

### その他

プラグインID・取得フィールドの詳細は `reference/imart-tag-acm-search.md` を参照。

## 注意事項

- リファレンスを必ず参照し、記憶や推測でプラグインIDやフィールド名を使用しないこと
- 完成品サンプルの構成パターン（イベントリスナー、パラメータ構築、コールバック、window 登録）を踏襲すること
- HTML 部分は `jssp-imds-theme` スキルの規約に従い、imds のクラスを使用すること
