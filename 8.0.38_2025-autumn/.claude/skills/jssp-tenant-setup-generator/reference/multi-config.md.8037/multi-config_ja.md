# 複数 config 運用

`import-<artifactId>-config-N.xml` を 2 つ以上に分けたいケースは大きく 2 パターンある。どちらも **既存の config-1.xml には触れず、新 config を追加** する点は共通だが、`spec.version` の扱いと出力先パスが異なる。

| パターン | `spec.version` | 出力先 | 用途 |
|---|---|---|---|
| **(I) バージョンアップ** | `1.0.0` → `1.1.0` 等に上げる | 新バージョンディレクトリ `1.1.0/`（資材ファイル名に suffix なし） | リリース後の機能追加・スキーマ拡張など、テナント側に追加投入したい差分 |
| **(II) 同一バージョン内 config 追加** | 据え置き（例: `1.0.0` のまま） | 同じ `1.0.0/` 配下にファイル名末尾 `-<N>` サフィックス付き（例: `equip-authz-policy-2.xml`） | LogicDesigner ルーティングが生成するリソースに後追いでポリシーを当てる等、**同一バージョンの初版投入時** に実行順序を制御したい場合 |

## 共通の設計原則

- **既存の `import-<artifactId>-config-N.xml` には触れない**（変更すると既存テナントへの再投入が必要になる）
- 新規分は **`import-<artifactId>-config-(N+1).xml`** を新規追加する
- セットアップは `config-1.xml` → `config-2.xml` → ... の順に **全て** 実行される（intra-mart Importer の仕様）
- そのため新 config には **差分のみ** を記述する（既に投入済みの内容は含めない）

## パターン (I): バージョンアップ運用

1. **差分 spec.json を作成**（例: `equip-v110.spec.json`）
   - `"version": "1.1.0"`, `"configNumber": 2` を指定
   - 追加・変更する要素のみ記述（既存ロールや認可は含めない）
2. **build スクリプト実行**
   ```bash
   node {{AGENT_ROOT}}/skills/jssp-tenant-setup-generator/scripts/build-setup-import.js equip-v110.spec.json
   ```
3. **既存ファイル保護**: 出力先に既存ファイルがあると **エラーで停止** する
   - 意図的に上書きする場合は `--force` フラグを付ける（通常は使わない）
4. **生成結果**:
   - `src/main/conf/products/import/basic/<artifactId>/import-<artifactId>-config-2.xml`（新規）
   - `src/main/storage/system/products/import/basic/<key>/1.1.0/...`（新規、差分のみ。**ファイル名に suffix なし**）
   - 既存の `config-1.xml` や `1.0.0/` は触られない

## パターン (II): 同一バージョン内 config 追加

`spec.version` を据え置きで `configNumber` だけ増やすと、出力ファイル名のベース部末尾に `-<N>` サフィックスが付く（例: `equip-authz-policy-2.xml`）。これにより同じ `<version>/` 配下に複数 config の資材が共存できる。

主なユースケース: LogicDesigner のルーティングと、それに対する認可ポリシーを **初版セットアップ内で実行順序制御** したい場合。詳細は [logic-import.md](logic-import.md#ルーティング向け認可ポリシーの投入順序) 参照。

## 差分 spec.json のサンプル

```jsonc
{
  "key": "equip",
  "version": "1.1.0",
  "configNumber": 2,                           // ← 既存 config-1.xml に影響しないよう 2 を指定
  "shortName": "eqp",
  "displayNames": { "ja": "...", "en": "...", "zh_CN": "..." },

  // 既存ロールには触れず、追加分のみ
  "roles": [
    {
      "id": "equip_auditor",
      "name": "equip_auditor",
      "category": "equip",
      "displayNames": { "ja": "監査担当者", "en": "Auditor", "zh_CN": "审计员" }
    }
  ],

  // 既存リソースには触れず、追加分のみ
  "authzResources": [
    {
      "id": "equip-audit-log",
      "uri": "service://equip/audit/log",
      "parentGroup": "equip-http-services",
      "displayNames": { "ja": "監査ログ", "en": "Audit Log", "zh_CN": "审计日志" }
    }
  ],

  // 新リソースに対する認可ポリシーのみ
  "authzPolicies": [
    { "resource": "equip-audit-log", "type": "service", "action": "execute",
      "subject": "S(b_m_role:equip_auditor)", "effect": "PERMIT" }
  ]
}
```

## パターン (I) の注意

- **DDL の差分**: 既存テーブルへ ALTER TABLE する場合、PostgreSQL/Oracle/SQL Server で構文が異なるため `1.1.0/equip-ddl_postgre.sql` 等の 3 方言別ファイルで対応
- **重複投入の防止**: config-1.xml で投入したロール ID を再度 config-2.xml に書かないこと（Importer がエラーまたは上書きする）
- **メニューグループ**: 既に投入済みのメニュー項目を変更したい場合は menu-id を維持しつつ menu-items の構造を差分で書くか、別途運用検討が必要
