# 認可サブジェクトグループ XML 仕様

「認可ポリシーの subject 欄に表示する候補グループ」を定義する。
これは intra-mart 管理画面でユーザーが認可設定を行う際の **プルダウン候補** として現れる。

## 名前空間

```xml
<subject-groups xmlns="http://www.intra-mart.jp/authz/imex/subject-group">
  ...
</subject-groups>
```

**ルート要素は `<subject-groups>`** であることに注意（`<root>` ではない）。

## 基底ファイル（`<key>-authz-subject-group.xml`）

`sort-key` と `expression` のみ定義する。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<subject-groups xmlns="http://www.intra-mart.jp/authz/imex/subject-group">
  <authz-subject-group sort-key="900">
    <expression>S(b_m_role:app_manager)</expression>
  </authz-subject-group>
</subject-groups>
```

| 属性 / 子要素 | 必須 | 内容 |
|--------------|------|------|
| `sort-key` 属性 | YES | 表示順序（小さいほど上位）。慣例的に 100-999 を使う |
| `<expression>` | YES | subject 式（`S(b_m_role:...)` 等）。`authz-policy.md` の subject 書式と同一 |

## 言語別ファイル（`<key>-authz-subject-group_<locale>.xml`）

`expression` で対応付けて表示名を付与する。

```xml
<authz-subject-group sort-key="900">
  <display-name>
    <name locale="ja">Any App 管理者</name>
  </display-name>
  <expression>S(b_m_role:app_manager)</expression>
</authz-subject-group>
```

`sort-key` と `<expression>` の両方が基底とマッチングキー。

## spec.json での記述

```json
"authzSubjectGroups": [
  {
    "sortKey": 900,
    "expression": "S(b_m_role:app_manager)",
    "displayNames": {
      "ja": "Any App 管理者",
      "en": "Any App Manager",
      "zh_CN": "Any App 管理者"
    }
  }
]
```

## 注意

- `expression` が指すロール / ユーザ / 組織は **事前に存在している** こと（同じ Importer で投入するロールでも、ロール定義の方が先に処理される順序になっている）
- `sort-key` は他のアプリと衝突しないように、アプリごとに独立した数値帯を割り当てる。intra-mart 標準では 10 〜 10000 程度の値が広く使われているため、新規アプリは衝突を避けて適切な値を選ぶ
- ルート要素が `<subject-groups>` という複数形である点が他の XML と異なる。XML 名前空間も `subject-group`（単数）であることに注意
