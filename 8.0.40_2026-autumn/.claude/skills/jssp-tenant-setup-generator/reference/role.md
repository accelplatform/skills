# ロール定義 XML 仕様

ロール（業務上の役割）を登録する XML。基底ファイル + 言語別ファイル（ja/en/zh_CN）の 4 ファイル構成。

## 名前空間

```xml
<root xmlns="http://intra-mart.co.jp/system/admin/role/role-data">
  ...
</root>
```

## 基底ファイル（`<key>-role.xml`）

ロールの ID・名前・カテゴリを定義する。**表示名は書かない**。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns="http://intra-mart.co.jp/system/admin/role/role-data">
  <role-data name="any_app_manager" id="app_manager">
    <category>any_app</category>
  </role-data>
</root>
```

| 属性 / 子要素 | 必須 | 内容 |
|--------------|------|------|
| `name` 属性 | YES | ロール名（システム内部名）。重複不可 |
| `id` 属性 | YES | ロール ID（短い英数字）。subject 式 `S(b_m_role:<id>)` で参照される。**20 文字以内** |
| `<category>` | NO | ロールカテゴリ。空でも可 |

**ロール ID の文字数制限:**
- ロール ID は **20 文字以内** に収める必要がある（intra-mart の制約）
- 20 文字を超えると Importer 実行時にエラーになる
- 例: `equip_admin`（11文字 ✓）、`equip_accounting`（16文字 ✓）、`some_very_long_role_name`（24文字 ✗）

## 言語別ファイル（`<key>-role_<locale>.xml`）

表示名のみを記述する。`name` / `id` は基底と同一にすること（マッチングキー）。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns="http://intra-mart.co.jp/system/admin/role/role-data">
  <role-data name="any_app_manager" id="app_manager">
    <display-names>
      <display-name locale="ja">Any App 管理者</display-name>
    </display-names>
  </role-data>
</root>
```

`locale` は `ja` / `en` / `zh_CN` のいずれか。1 ファイル 1 ロケール。

## spec.json での記述

```json
"roles": [
  {
    "id": "app_manager",
    "name": "any_app_manager",
    "category": "any_app",
    "displayNames": {
      "ja": "Any App 管理者",
      "en": "Any App Manager",
      "zh_CN": "Any App 管理者"
    }
  }
]
```

## 注意

- ロール `id` は 認可ポリシーの `subject` 式 `S(b_m_role:<id>)` から参照されるため、認可ポリシー側と表記を完全一致させること。
- `name` と `id` の使い分け: `name` は人間が読む内部名、`id` は subject 式や DB の主キーに使われる短いコード。
- ロール名（`name`・`id` ともに）は**仕様書で明示されていればその名称を使う**。明示がない場合は適切な名称を決めてよい（例: `<shortName>_<role種別>` や `<key>_<role種別>` など、可読性が高く既存ロールと衝突しないもの）。
