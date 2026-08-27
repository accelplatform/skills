---
name: java-im-role-usage
description: intra-mart 固有のロール管理 API（`jp.co.intra_mart.foundation.admin.role.RoleInfoManager`）を Java（JavaEE 開発モデル）で使用するためのスキルセット。ロールの新規登録・更新・削除、サブロール階層（追加・削除・全親/全サブロール取得）、カテゴリ管理（一覧・移動・削除）、ロールID/ロール名/カテゴリによる検索・ページネーションの実装パターンを提供する。Java でロールを新規作成したい、Java で RoleInfoManager を使いたい、JavaEE 開発モデルでロール階層やカテゴリを管理したい、と言及されたときに使用。特定ユーザへのロール割当（`addAccountRoleInfo` 等）は `java-im-account-usage` を使うこと。JSSP（スクリプト開発モデル）で同等の処理を作る場合は SSJS 版の RoleInfoManager API（`d.ts/tenant/standard/im-ssjs-role-info-manager.d.ts`）を使うこと。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart Role Management API（Java 版）利用支援スキル

## 目的

intra-mart Accel Platform が提供する **JavaEE 開発モデル**向けのロール管理 API（`jp.co.intra_mart.foundation.admin.role.RoleInfoManager`）を使い、Java コードでロール定義自体の新規登録・更新・削除・階層（サブロール）管理・カテゴリ管理・検索を実装するためのスキルセット。

## ロールとアカウントの境界（最重要）

**このスキルが扱うのはロール定義自体の CRUD・階層・カテゴリのみである。** 特定ユーザへのロール割当（例: `AccountInfoManager#addAccountRoleInfo`）は対象外。

| 操作 | 対象 API | 担当スキル |
|------|---------|-----------|
| ロールの新規登録・更新・削除 | `RoleInfoManager#addRoleInfo` / `updateRoleInfo` / `deleteRoleInfo` | **本スキル** |
| サブロール階層の追加・削除・参照 | `RoleInfoManager#addSubRoleInfo` / `deleteSubRoleInfo(s)` / `get(All)SubRoleIds` / `get(All)ParentRoleIds` | **本スキル** |
| カテゴリの一覧・移動・削除 | `RoleInfoManager#getCategories` / `moveCategory` / `deleteCategory(ies)` | **本スキル** |
| ロールの検索・ページネーション | `RoleInfoManager#searchRoleInfosBy*` | **本スキル** |
| **特定ユーザへのロール割当・解除** | `AccountInfoManager#addAccountRoleInfo` 等 | **`java-im-account-usage`（本スキルの対象外）** |

「ユーザにロールを割り当てたい」「アカウントの保有ロールを変更したい」という依頼が来た場合は、ロール定義自体の操作ではないため `java-im-account-usage` に誘導すること。

**このスキルが扱うのは Java ソースファイル（`.java`）のみ。** JSSP（`.js`）での実装は、対応する SSJS 版 API（`d.ts/tenant/standard/im-ssjs-role-info-manager.d.ts`）を使うこと。

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `.claude/rules/java-naming.md` | 🟢 **必読** — パッケージ・クラス・メソッド・変数命名 |
| `.claude/rules/java-code-style.md` | 🟢 **必読** — `final` ローカル変数、文字列リテラル等 |
| `.claude/rules/java-javadoc.md` | 🟢 **必読** — クラス/メソッド JavaDoc |

`.claude/rules` 配下には例外処理を定めた Java 向け専用規約は存在しない（2026年時点）。`RoleInfoManager` の全メソッドは `AdminException`（チェック例外）をスローする設計であり、業務例外へのラップ方針は `assets/role-basic-usage.md` のパターンに従う。

`jssp-*` の規約はこのスキルの対象外（Java ファイルには適用しない）。

## API 概要

`RoleInfoManager` クラスは `jp.co.intra_mart.foundation.admin.role` パッケージに属する、`final` ではない通常のクラス。ロールの新規登録・更新・削除、サブロール階層管理、カテゴリ管理、検索・ページネーションを提供する。詳細なシグネチャ・関連クラスは `reference/role-api-reference.md` を参照すること（記憶や推測で書かない）。

主なポイント:
- **`RoleInfo` には3種類のコンストラクタがある。** `RoleInfo()`（ロールIDを `Identifier` で自動採番。**`IOException` をスローする**）、`RoleInfo(roleId)`（ロールID指定。ロール名はロールIDと同値になる）、`RoleInfo(roleId, roleName)`（両方指定）。用途に応じて使い分けること
- **`RoleInfo` の `displayName` は `Map<Locale, String>`。** 単一の `String` ではなく、ロケールごとに異なる表示名を保持できる構造になっている
- **`getRoleInfo(roleId)` はロールが存在しない場合、例外ではなく `null` を返す。** 呼び出し側での null チェックが必須（詳細は「注意事項」参照）

## 生成対象とテンプレート

| 生成対象 | テンプレート | 内容 |
|---------|------------|------|
| ロールの新規登録・取得・更新 | `assets/role-basic-usage.md` | `RoleInfo` コンストラクタの使い分け、`addRoleInfo`/`getRoleInfo`（null チェック込み）/`updateRoleInfo` の呼び出し例 |
| サブロール階層の構築・階層検索 | `assets/role-basic-usage.md` | `addSubRoleInfo`、`getAllSubRoleIds`/`getSubRoleIds` の使い分け |
| ロール内包チェック | `assets/role-basic-usage.md` | `certify` を使った業務ロジック例 |
| カテゴリ別検索・ページネーション | `assets/role-basic-usage.md` | `searchRoleInfosByCategoryAndRoleName` を使った一覧画面向け実装 |
| 大量サブロール登録の最適化 | `assets/role-basic-usage.md` | `WithoutCreatingSummary` 系 + `regenerateRoleSummary()` の組み合わせ |

### リファレンス

- `reference/role-api-reference.md` — `RoleInfoManager` / `RoleInfo` / `RoleInfoListItem` / `AdminException` の全メソッド・シグネチャ（プラットフォーム API の実クラス定義に基づく。記憶で書かない）

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「Java でロールを新規作成したい」
- 「JavaEE 開発モデルで RoleInfoManager API を使ってロール階層を管理したい」
- 「ロールにサブロールを追加・削除したい」
- 「ロールのカテゴリを一覧・移動したい」
- 「ロールIDやロール名で検索するページネーション付き一覧を作りたい」

「Java で」「JavaEE 開発モデルで」等の明示がない場合は、プロジェクトの既存実装がどちらのモデルかをユーザに確認する。JSSP（プロコード）の画面・ファンクションコンテナ内での実装であれば、SSJS 版 API（`d.ts/tenant/standard/im-ssjs-role-info-manager.d.ts`）を使う。

「ユーザにロールを割り当てたい」「特定アカウントの保有ロールを変更したい」という依頼は本スキルの対象外。`java-im-account-usage` に誘導する。

## 実装手順

1. ユーザの要件をヒアリング（ロール定義の CRUD か、サブロール階層の操作か、カテゴリ管理か、検索・一覧画面か。ユーザへの割当が目的の場合は `java-im-account-usage` に誘導）
2. `RoleInfo` のコンストラクタ選択（ロールIDを自動採番するか、明示指定するか）と、ロール名・カテゴリ・表示名（ロケール別）の設定要否を決定
3. `assets/role-basic-usage.md` を参照して実装（メソッドのシグネチャは `reference/role-api-reference.md` を必ず参照し、記憶や推測で書かない）
4. サブロール階層を扱う場合、`addSubRoleInfo`/`deleteSubRoleInfo(s)`（サマリ自動更新版）をデフォルトとし、大量データの一括更新等パフォーマンスが問題になる場合のみ `WithoutCreatingSummary` 系＋最後に1回だけ `regenerateRoleSummary()` を使う設計にする
5. `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか確認

## 注意事項

- **`getRoleInfo(roleId)` はロールが存在しない場合に例外ではなく `null` を返す。** 呼び出し側で null チェックを行わずに戻り値を使用すると `NullPointerException` を招く。必ず null チェックを行うこと
- **`RoleInfo()`（引数なしコンストラクタ）は `IOException` をスローする**（`Identifier` による自動採番に失敗した場合）。他の2つのコンストラクタ（`RoleInfo(roleId)` / `RoleInfo(roleId, roleName)`）は例外を投げない。コンストラクタ選択時にこの非対称性を意識すること
- **`certify` の第1引数（`nestRoleIds`）と第2引数（`roleIds`）で「ネスト展開するかどうか」の扱いが非対称である。** 第1引数はネストしたロールも含めてチェックされ、第2引数は直接一致のみでチェックされる。引数の順序を取り違えると判定漏れにつながる
- **`getAllParentRoleIds`/`getAllSubRoleIds`（再帰・全階層）と `getParentRoleIds`/`getSubRoleIds`（1階層のみ）を使い分ける。** 「直属の親・子のみ」が必要か「全階層」が必要かを実装前に明確にすること
- **`WithoutCreatingSummary` 系メソッド（8.0.37 以降）を使った場合は、必ず `regenerateRoleSummary()` を別途呼び出す。** 呼び出さないとロールサマリが不整合になり、`getAllSubRoleIds`/`getAllParentRoleIds`/`certify` 等サマリに依存する検索結果が不正確になる。通常は `addSubRoleInfo`/`deleteSubRoleInfo(s)`（サマリ自動更新版）をデフォルトとし、大量データの一括更新等パフォーマンスが問題になる場合のみ `WithoutCreatingSummary` 系＋最後に1回だけ `regenerateRoleSummary()` を使う設計にすること
- **`getCategoryCount` は `@Deprecated`。** 新規実装では `getRoleInfoCountByCategory` を使うこと
- **`moveCategory` は該当カテゴリに属する全ロールのカテゴリ名を一括更新する破壊的操作である。** 呼び出し前に対象範囲・影響を確認すること

## 生成後の確認

JSSP 版のような専用検証スクリプト（`validate-jssp-code.js` 相当）は現時点で未整備。以下を手動で確認する。

1. `getRoleInfo()` の戻り値を使用する箇所すべてで null チェックを行っているか
2. `RoleInfo()`（引数なしコンストラクタ）を使用している箇所で `IOException` を適切にハンドリングしているか
3. `certify()` の第1引数・第2引数（ネスト展開の有無）を意図通りの順序で渡しているか
4. `WithoutCreatingSummary` 系メソッドを使用した箇所で、後続に `regenerateRoleSummary()` の呼び出しが漏れなく存在するか
5. `@Deprecated` の `getCategoryCount`・`isUpdate` を新規実装で使用していないか
6. `moveCategory`・`deleteRoleInfo(s)`・`deleteCategory(ies)` 等の破壊的操作について、要件通りの範囲でのみ実行されるか
7. `AdminException`（チェック例外）を握りつぶしていないか
8. `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか
9. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない。プロジェクトに Java 向けのコードレビュー・セキュリティチェックスキルが別途存在する場合はそちらを利用する

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| SSJS（JSSP）でのロール定義操作 | 対応する SSJS 版 API（`d.ts/tenant/standard/im-ssjs-role-info-manager.d.ts`）を使用（本スキルの対象外） |
| **Java（JavaEE 開発モデル）でのロール定義（CRUD・階層・カテゴリ・検索）** | **本スキル** |
| Java での特定ユーザへのロール割当・解除 | `java-im-account-usage` |
| Java でのファイル操作（`PublicStorage` 等） | `java-im-storage-usage` |
| Java での一意 ID 生成（`Identifier`） | `java-im-identifier-usage` |
| Java での排他制御（`NewLock`） | `java-im-lock-usage` |
| Java でのワークフロー連携処理 | `java-im-workflow-usage` |
