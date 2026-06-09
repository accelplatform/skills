# メニューグループ XML 仕様

intra-mart 管理メニュー（サイトマップ）に表示する **メニューグループ** とその配下の **メニュー項目** を定義する。

## 名前空間

```xml
<root xmlns="http://intra-mart.co.jp/im_menu/menu-group-data">
  ...
</root>
```

## 構造

ルート `<root>` の下に複数の `<menu-group-data>` を配置できる。各 `<menu-group-data>` は **1 つのトップレベル `<menu-item>` を含み、その中にメニュー項目を入れ子で並べる**。

```
<root>
  <menu-group-data id="<key>_sm-pc">
    <category id="im_sitemap_pc"/>
    <menu-item .../>          ← トップフォルダ（menu-id は <menu-group-data> と同じ）
      <menu-item .../>        ← 子（item または folder）
      <menu-item ...>         ← folder の場合さらにネスト
        <menu-item .../>
      </menu-item>
  </menu-group-data>
</root>
```

## `<menu-item>` の属性

| 属性 | 必須 | 説明 |
|------|------|------|
| `menu-id` | YES | メニュー項目の一意 ID。慣例として `_sm-pc` サフィックスを付ける（サイトマップ PC 用） |
| `sort-number` | YES | 同階層内の表示順序（数値、小さいほど上位） |
| `type` | YES | `folder`（子を持つ）または `item`（リーフ、URL リンク） |
| `url` | type=item で YES | リンク先 URL。`<authz>` の path から先頭 `/` を除いた相対形（例: `equip/dashboard/list`） |
| `image-path` | YES | アイコンパス。指定なしでも空文字 `""` で属性を必ず出力する |
| `method` | YES | HTTP メソッド。通常 `get` |
| `use-iframe` | YES | iframe で開くか。通常 `false` |
| `use-popup` | YES | ポップアップで開くか。通常 `false` |

`type="folder"` の場合 `url` 属性は **出力しない**。

## カテゴリ

`<category id="im_sitemap_pc">` は intra-mart 標準の「サイトマップ（PC 用）」を指す。

本プロジェクトでは **`im_sitemap_pc` のみ対象**とする。他の category（モバイル等）も intra-mart 側に存在するが、本スキルセットでは扱わない。

## 基底ファイル（`<key>-menu-group.xml`）

ID・属性・階層のみで、表示名は含めない。**兄弟要素間に空行は入れない**（実例準拠）。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns="http://intra-mart.co.jp/im_menu/menu-group-data">
  <menu-group-data id="equip_sm-pc">
    <category id="im_sitemap_pc"></category>

    <menu-item menu-id="equip_sm-pc" sort-number="2000" type="folder" image-path="" method="get" use-iframe="false" use-popup="false">
      <menu-item menu-id="equip_dashboard_sm-pc" sort-number="10" type="item" url="equip/dashboard/list" image-path="" method="get" use-iframe="false" use-popup="false"></menu-item>
      <menu-item menu-id="equip_master_sm-pc" sort-number="100" type="folder" image-path="" method="get" use-iframe="false" use-popup="false">
        <menu-item menu-id="equip_master_equipment_sm-pc" sort-number="10" type="item" url="equip/master/equipment/list" image-path="" method="get" use-iframe="false" use-popup="false"></menu-item>
      </menu-item>
    </menu-item>
  </menu-group-data>
</root>
```

## 言語別ファイル（`<key>-menu-group_<locale>.xml`）

同じ構造を再現し、各 `<menu-item>` に `<display-names><display-name locale="..">...</display-name></display-names>` を追加する。**可読性のため兄弟要素間に空行を入れる**（実例準拠）。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns="http://intra-mart.co.jp/im_menu/menu-group-data">
  <menu-group-data id="equip_sm-pc">
    <category id="im_sitemap_pc"></category>

    <menu-item menu-id="equip_sm-pc" sort-number="2000" type="folder" image-path="" method="get" use-iframe="false" use-popup="false">
      <display-names>
        <display-name locale="ja">社内備品貸出システム</display-name>
      </display-names>

      <menu-item menu-id="equip_dashboard_sm-pc" sort-number="10" type="item" url="equip/dashboard/list" image-path="" method="get" use-iframe="false" use-popup="false">
        <display-names>
          <display-name locale="ja">ダッシュボード</display-name>
        </display-names>
      </menu-item>
    </menu-item>
  </menu-group-data>
</root>
```

## メニューアイテム選定基準

仕様書の画面一覧から、どの画面をメニューに含めるかを判断する基準。

### 含める画面（エントリーポイント）

業務フローの開始点となる画面のみメニュー項目にする:

| 種別 | 例 |
|---|---|
| ダッシュボード | 「ダッシュボード」「ホーム」「マイページ」 |
| 一覧画面 | 「○○一覧」「○○管理」（list で終わる画面） |
| 検索画面 | 「○○検索」 |
| 自分専用画面 | 「申請一覧（自分の）」「承認一覧（自分宛）」 |
| 統計・レポート画面 | 「利用統計ダッシュボード」「レポート出力」 |
| ユーザ個別設定画面 | 「ユーザ設定」「通知設定」 |

### 除外する画面（遷移先）

エントリーポイントから内部遷移で開かれる画面はメニューに含めない:

| 種別 | 除外理由 | 典型的な開き方 |
|---|---|---|
| 詳細画面 | 一覧の行クリック / 検索結果クリックから遷移 | `<a>` リンク・行ダブルクリック |
| 登録 / 編集フォーム画面 | 一覧の「新規登録」「編集」ボタンから遷移 | ボタン onClick で URL 遷移 |
| ダイアログ形式の画面 | 親画面からポップアップで開く | `imdsModal` 等のモーダル |
| API エンドポイント | URL 直接アクセス用ではない | XHR/fetch から呼ばれる |
| 印刷 / プレビュー画面 | 画面内ボタンから別ウィンドウ表示 | `window.open` 等 |

仕様書に **「ダイアログ形式」「フォーム」「詳細表示」** と明記されている画面は基本的に除外対象。

### フォルダで束ねる基準

関連画面が **2 件以上** ある場合は `type="folder"` で束ねて階層化する。1 件しかない場合はトップレベルに直接配置:

| 例 | 構成 |
|---|---|
| マスタ系（備品マスタ・カテゴリ・保管場所） | `備品マスタ管理` フォルダ配下に 3 つ |
| 棚卸系（実施・履歴） | `棚卸管理` フォルダ配下に 2 つ |
| 利用統計（1 画面のみ） | フォルダなしでトップに配置 |

### sort-number の付け方（推奨慣例）

| 階層 | 推奨刻み | 例 |
|---|---|---|
| トップフォルダ自身（`<menu-group-data>` の id と同じ） | 後から他メニューと並べ替えやすい桁 | `2000` |
| トップフォルダ配下の各メニュー項目 | **10 刻み**（後から差し込み可能） | `10`, `20`, `30`, ... |
| グルーピング用フォルダ（例: マスタ管理） | **100 刻み**（兄弟と別グループに見せる） | `100`, `110`, `120`, ... |
| フォルダ内の各メニュー項目 | 10 刻みで独立採番 | `10`, `20`, `30` |

### 判定フロー

仕様書を読みながら以下を順に判定する:

1. 画面の説明に **「ダイアログ形式」「フォーム」「詳細表示」** とある → **除外**
2. 画面 ID が他の画面の「遷移先」として記述されている（例: 「○○一覧 → △△編集画面に遷移」の△△側） → **除外**
3. 画面 ID が **`-list`・`-search`・`-dashboard`・`-history`・`-preference`** など独立アクセス可能な命名 → **含める**
4. 上記以外で迷う場合は **「URL を直接ブックマークに登録して開く意味があるか」** で判断（Yes なら含める）

## spec.json での記述

`menuGroups` 配列の各要素が 1 つの `<menu-group-data>` に対応する。`items` を再帰的にネストできる。

```jsonc
"menuGroups": [
  {
    "id": "equip_sm-pc",                       // <menu-group-data> の id（慣例: <key>_sm-pc）
    "category": "im_sitemap_pc",               // 省略時のデフォルト: "im_sitemap_pc"
    "sortNumber": 2000,                        // トップフォルダの sort-number
    "type": "folder",                          // トップは常に folder（省略時、items があれば folder に自動判定）
    "displayNames": { "ja": "...", "en": "...", "zh_CN": "..." },
    "items": [
      {
        "id": "equip_dashboard_sm-pc",
        "sortNumber": 10,
        "url": "equip/dashboard/list",         // type=item の場合 必須
        "displayNames": { "ja": "ダッシュボード", "en": "Dashboard", "zh_CN": "仪表板" }
      },
      {
        "id": "equip_master_sm-pc",
        "sortNumber": 100,
        "type": "folder",                      // 子を持つフォルダ。url は不要
        "displayNames": { "ja": "備品マスタ管理", "en": "Equipment Master Management", "zh_CN": "设备主数据管理" },
        "items": [
          { "id": "equip_master_equipment_sm-pc", "sortNumber": 10, "url": "equip/master/equipment/list",
            "displayNames": { "ja": "備品マスタ一覧", "en": "Equipment List", "zh_CN": "设备一览" } }
        ]
      }
    ]
  }
]
```

### spec のフィールドオプション（オプション値、ほぼ常に省略可）

| フィールド | デフォルト | 説明 |
|-----------|-----------|------|
| `category` | `im_sitemap_pc` | サイトマップ種別 |
| `sortNumber` | `10` | 表示順 |
| `type` | `items` があれば `folder`、なければ `item` | 自動判定 |
| `imagePath` | `""` | アイコンパス |
| `method` | `get` | HTTP メソッド |
| `useIframe` | `false` | iframe 表示 |
| `usePopup` | `false` | ポップアップ表示 |
| `url` | `""` | type=item のリンク先（type=folder では出力しない） |

## メニューグループに対する認可

メニューグループへの読み取り許可は **メニューグループ ID のハッシュ値** を `authz-policy` の `resource` に指定する形で行う。

```xml
<authz-policy resource="d6f1918fc80494cfee9bfa30e8d179a0d46fd029132ad6a66be211f9f6a91b97"
              type="im-menu-group" action="read"
              subject="S(b_m_role:equip_admin)">PERMIT</authz-policy>
```

ハッシュ値は intra-mart の以下のロジックで決定される:

```
SHA-256("im-menu-group://menugroups/" + <menu-group-data の id>)
```

例: `equip_sm-pc` → `df629efcf7244ec8901dfff950f670e73eaae5726a3a944542ad3d4da092fe6c`

build スクリプトは spec.json で `"resource": "REPLACE_WITH_MENU_GROUP_HASH"` または `"resource": "REPLACE_WITH_MENU_GROUP_HASH:<menuGroupId>"` を見つけると、上記ロジックで **自動的にハッシュ値に展開** する。仕組みの詳細は [authz-policy.md](authz-policy.md) を参照。

## 注意

- `<menu-group-data>` の `id` は **`<key>_sm-pc`** の命名が intra-mart 標準（サイトマップ PC 用）。モバイル別構造を作る場合は別ファイル（`_sm-sp` 等）で並列展開する
- 各 `<menu-item>` の `menu-id` も `_sm-pc` サフィックスを付ける
- `url` は **先頭スラッシュなし**（`equip/dashboard/list` のように）。intra-mart 側でサーブレットコンテキストを補完する
- `image-path` / `method` / `use-iframe` / `use-popup` は空でも **必ず属性として出力**（intra-mart の XSD で必須）
