# Role API 基本利用パターン（Java 版）

`RoleInfoManager` のシグネチャ・内部動作は `reference/role-api-reference.md` を参照。ここでは典型的な呼び出しパターンを示す。

## パターン1: ロールの新規登録

`RoleInfo(roleId, roleName)` コンストラクタでロールID・ロール名を明示指定し、`addRoleInfo()` で登録する基本形。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.admin.exception.AdminException;
import jp.co.intra_mart.foundation.admin.role.RoleInfoManager;
import jp.co.intra_mart.foundation.admin.role.model.RoleInfo;

import jp.co.example.foo.exception.RoleRegistrationException;

/**
 * ロールの登録処理を提供します。
 */
public class RoleRegistrationService {

    /**
     * ロールを新規登録します。
     * @param roleId ロールID
     * @param roleName ロール名
     * @param category カテゴリ
     * @throws RoleRegistrationException 登録に失敗した場合
     */
    public void registerRole(final String roleId, final String roleName, final String category) throws RoleRegistrationException {
        final RoleInfo roleInfo = new RoleInfo(roleId, roleName);
        roleInfo.setCategory(category);

        final RoleInfoManager roleInfoManager = new RoleInfoManager();
        try {
            roleInfoManager.addRoleInfo(roleInfo);
        } catch (final AdminException e) {
            throw new RoleRegistrationException("ロールの登録に失敗しました: roleId=" + roleId, e);
        }
    }
}
```

- `RoleInfo(roleId, roleName)` は例外を投げないため `try` の外で生成してよい
- `addRoleInfo()` は `AdminException`（チェック例外）を宣言するため、業務例外にラップするか `throws` で伝播させる
- ロールIDを `Identifier` による自動採番に任せたい場合は `RoleInfo()`（引数なし）を使う。ただし `IOException` をスローするため、別途 `try`/`catch` が必要（パターン5参照のような複合例外ハンドリングになる）

## パターン2: ロールの取得・更新（null チェック込み）

`getRoleInfo()` はロールが存在しない場合に例外ではなく `null` を返すため、更新前に必ず null チェックを行う。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.admin.exception.AdminException;
import jp.co.intra_mart.foundation.admin.role.RoleInfoManager;
import jp.co.intra_mart.foundation.admin.role.model.RoleInfo;

import jp.co.example.foo.exception.RoleNotFoundException;
import jp.co.example.foo.exception.RoleUpdateException;

/**
 * ロールの更新処理を提供します。
 */
public class RoleUpdateService {

    /**
     * ロールの表示名を更新します。
     * @param roleId ロールID
     * @param displayName 更新後の表示名
     * @param locale 表示名を設定するロケール
     * @throws RoleNotFoundException 指定したロールが存在しない場合
     * @throws RoleUpdateException 更新処理に失敗した場合
     */
    public void updateDisplayName(final String roleId, final String displayName, final Locale locale)
            throws RoleNotFoundException, RoleUpdateException {
        final RoleInfoManager roleInfoManager = new RoleInfoManager();

        final RoleInfo roleInfo;
        try {
            roleInfo = roleInfoManager.getRoleInfo(roleId);
        } catch (final AdminException e) {
            throw new RoleUpdateException("ロールの取得に失敗しました: roleId=" + roleId, e);
        }

        // getRoleInfo() は該当ロールが存在しない場合、例外ではなく null を返す
        if (roleInfo == null) {
            throw new RoleNotFoundException("指定したロールが存在しません: roleId=" + roleId);
        }

        roleInfo.getDisplayName().put(locale, displayName);

        try {
            roleInfoManager.updateRoleInfo(roleInfo);
        } catch (final AdminException e) {
            throw new RoleUpdateException("ロールの更新に失敗しました: roleId=" + roleId, e);
        }
    }
}
```

- `getRoleInfo()` の戻り値が `null` の可能性があることを忘れると `NullPointerException` を招く。呼び出し側で必ず null チェックする
- `RoleInfo` の `displayName` は `Map<Locale, String>` のため、特定ロケールの表示名のみを更新する場合は `getDisplayName().put(locale, displayName)` のように `Map` へ直接反映する

## パターン3: サブロール階層の構築と階層検索

`addSubRoleInfo()` で親子関係を構築し、`getAllSubRoleIds()`（全階層）と `getSubRoleIds()`（1階層のみ）の違いを示す。

```java
package jp.co.example.foo.service;

import java.util.List;

import jp.co.intra_mart.foundation.admin.exception.AdminException;
import jp.co.intra_mart.foundation.admin.role.RoleInfoManager;

import jp.co.example.foo.exception.RoleHierarchyException;

/**
 * ロール階層の構築・参照処理を提供します。
 */
public class RoleHierarchyService {

    /**
     * 親ロールにサブロールを追加します。
     * @param parentRoleId 親ロールID
     * @param subRoleId サブロールID
     * @throws RoleHierarchyException 追加に失敗した場合
     */
    public void addSubRole(final String parentRoleId, final String subRoleId) throws RoleHierarchyException {
        final RoleInfoManager roleInfoManager = new RoleInfoManager();
        try {
            roleInfoManager.addSubRoleInfo(parentRoleId, subRoleId);
        } catch (final AdminException e) {
            throw new RoleHierarchyException(
                    "サブロールの追加に失敗しました: parentRoleId=" + parentRoleId + ", subRoleId=" + subRoleId, e);
        }
    }

    /**
     * 指定したロール直下（1階層下）のサブロールID一覧を取得します。
     * @param roleId ロールID
     * @return 1階層下のサブロールIDのリスト
     * @throws RoleHierarchyException 取得に失敗した場合
     */
    public List<String> findDirectSubRoleIds(final String roleId) throws RoleHierarchyException {
        final RoleInfoManager roleInfoManager = new RoleInfoManager();
        try {
            // 1階層下のみ。ネストしたサブロール（サブロールのサブロール）は含まれない
            return roleInfoManager.getSubRoleIds(roleId);
        } catch (final AdminException e) {
            throw new RoleHierarchyException("サブロールIDの取得に失敗しました: roleId=" + roleId, e);
        }
    }

    /**
     * 指定したロールに属する全階層のサブロールID一覧を取得します。
     * @param roleId ロールID
     * @return ネストしたサブロールも含めた全サブロールIDのリスト
     * @throws RoleHierarchyException 取得に失敗した場合
     */
    public List<String> findAllSubRoleIds(final String roleId) throws RoleHierarchyException {
        final RoleInfoManager roleInfoManager = new RoleInfoManager();
        try {
            // ネストしたサブロール（孫ロール以下）も含めて全て取得する
            return roleInfoManager.getAllSubRoleIds(roleId);
        } catch (final AdminException e) {
            throw new RoleHierarchyException("全サブロールIDの取得に失敗しました: roleId=" + roleId, e);
        }
    }
}
```

- `getSubRoleIds(roleId)` は**1階層下のみ**。組織図でいう「直属の部下」に相当する
- `getAllSubRoleIds(roleId)` は**ネストした全階層**を再帰的に取得する。「配下の全員」を洗い出したい場合に使う
- 同様の関係が `getParentRoleIds`（1階層上のみ）と `getAllParentRoleIds`（全階層の親）にも成り立つ

## パターン4: `certify` を使ったロール内包チェック

あるユーザの保有ロール一覧（ネスト展開済み）が、特定のロール群のいずれかを内包しているかを判定する業務ロジック例。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.admin.exception.AdminException;
import jp.co.intra_mart.foundation.admin.role.RoleInfoManager;

import jp.co.example.foo.exception.RoleCertificationException;

/**
 * ロール保有チェック処理を提供します。
 */
public class RoleCertificationService {

    /** 承認権限を持つとみなすロールID群 */
    private static final String[] APPROVAL_ROLE_IDS = { "role_manager", "role_director" };

    /**
     * ユーザが保有するロール（ネスト展開済み）が、承認権限ロール群のいずれかを内包しているか判定します。
     * @param userNestRoleIds ユーザが保有するロールID配列（ネスト展開済み。あらかじめ getAllParentRoleIds 等で解決しておく）
     * @return 承認権限ロールのいずれかを保有している場合 true
     * @throws RoleCertificationException 判定に失敗した場合
     */
    public boolean hasApprovalRole(final String[] userNestRoleIds) throws RoleCertificationException {
        final RoleInfoManager roleInfoManager = new RoleInfoManager();
        try {
            // nestRoleIds（第1引数）はネストしたロールも含めてチェックされる。
            // roleIds（第2引数）は直接一致のみでチェックされる非対称な仕様のため、
            // 「ユーザ側」を第1引数、「判定対象の固定ロール群」を第2引数に置く
            return roleInfoManager.certify(userNestRoleIds, APPROVAL_ROLE_IDS);
        } catch (final AdminException e) {
            throw new RoleCertificationException("ロール内包チェックに失敗しました", e);
        }
    }
}
```

- `certify(nestRoleIds, roleIds)` は第1引数と第2引数で「ネスト展開するかどうか」の扱いが**非対称**である点に注意。第1引数側はネストしたロールも含めて評価され、第2引数側は直接一致のみで評価される
- 引数の順序を取り違えると意図しない判定結果になるため、どちらの引数に何を渡すか（ネスト展開してよい側／直接一致のみでよい側）を実装前に明確にすること

## パターン5: カテゴリ別ロール検索とページネーション

`searchRoleInfosByCategoryAndRoleName()` を使った一覧画面向けの、総件数取得（`getRoleInfoCountByCategoryAndRoleName`）と検索（ページネーション付き）の組み合わせ例。

```java
package jp.co.example.foo.service;

import java.util.List;
import java.util.Locale;

import jp.co.intra_mart.foundation.admin.exception.AdminException;
import jp.co.intra_mart.foundation.admin.role.RoleInfoManager;
import jp.co.intra_mart.foundation.admin.role.model.RoleInfoListItem;

import jp.co.example.foo.exception.RoleSearchException;
import jp.co.example.foo.model.RoleSearchResult;

/**
 * ロール一覧画面向けの検索処理を提供します。
 */
public class RoleSearchService {

    /** 1ページあたりの表示件数 */
    private static final int PAGE_SIZE = 20;

    /**
     * カテゴリ・ロール名条件でロールをページネーション検索します。
     * @param category カテゴリ（検索条件。未指定時は null または空文字）
     * @param roleName ロール名（検索条件。未指定時は null または空文字）
     * @param pageNumber ページ番号（1始まり）
     * @param locale 表示名解決に使用するロケール
     * @return 総件数と該当ページの検索結果を含む検索結果
     * @throws RoleSearchException 検索に失敗した場合
     */
    public RoleSearchResult searchRoles(final String category, final String roleName, final int pageNumber, final Locale locale)
            throws RoleSearchException {
        final RoleInfoManager roleInfoManager = new RoleInfoManager();
        final int offset = (pageNumber - 1) * PAGE_SIZE;

        try {
            final int totalCount = roleInfoManager.getRoleInfoCountByCategoryAndRoleName(category, roleName, locale);
            final List<RoleInfoListItem> items = roleInfoManager.searchRoleInfosByCategoryAndRoleName(
                    category, roleName, locale, PAGE_SIZE, offset, "role_name", "ASC");
            return new RoleSearchResult(totalCount, items);
        } catch (final AdminException e) {
            throw new RoleSearchException("ロールの検索に失敗しました: category=" + category + ", roleName=" + roleName, e);
        }
    }
}
```

- 総件数（`getRoleInfoCountByCategoryAndRoleName`）と検索結果（`searchRoleInfosByCategoryAndRoleName`）は**同一の検索条件（category / roleName / locale）で対にして呼び出す**こと。条件がずれると画面上の総件数と実際の表示件数が食い違う
- `offset` は0始まりのため、1始まりのページ番号から変換する際は `(pageNumber - 1) * PAGE_SIZE` の計算式を使う
- `sortIndex` は `category` / `role_name` / `display_name` のいずれかのみ有効。それ以外の値を渡した場合の挙動は保証されないため、固定の許可リストから選ばせる（ユーザ入力をそのまま渡さない）

## パターン6: 大量サブロール登録時の `WithoutCreatingSummary` 系 + `regenerateRoleSummary()`

大量のサブロールを一括登録する場合、`addSubRoleInfo()` を都度呼ぶとロールサマリの再作成がボトルネックになる。`WithoutCreatingSummary` 系メソッドでサマリ再作成を抑止し、最後に1回だけ `regenerateRoleSummary()` を呼ぶ。

```java
package jp.co.example.foo.service;

import java.util.List;

import jp.co.intra_mart.foundation.admin.exception.AdminException;
import jp.co.intra_mart.foundation.admin.role.RoleInfoManager;

import jp.co.example.foo.exception.RoleBulkRegistrationException;
import jp.co.example.foo.model.SubRoleAssignment;

/**
 * サブロールの一括登録処理を提供します。
 */
public class RoleBulkRegistrationService {

    /**
     * 大量のサブロール割当を一括登録します。<br>
     * 通常は addSubRoleInfo（サマリ自動更新版）をデフォルトとしますが、
     * 大量データの一括更新でパフォーマンスが問題になる本メソッドでは
     * WithoutCreatingSummary 系を使用し、最後に1回だけロールサマリを再作成します。
     * @param assignments 親ロールIDとサブロールIDの組の一覧
     * @throws RoleBulkRegistrationException 登録に失敗した場合
     */
    public void bulkAddSubRoles(final List<SubRoleAssignment> assignments) throws RoleBulkRegistrationException {
        final RoleInfoManager roleInfoManager = new RoleInfoManager();

        try {
            for (final SubRoleAssignment assignment : assignments) {
                // ロールサマリの再作成を都度行わない軽量版。
                // この時点ではロールサマリが未更新のため、途中経過で getAllSubRoleIds 等の階層検索を呼び出さないこと
                roleInfoManager.addSubRoleInfoWithoutCreatingSummary(assignment.getParentRoleId(), assignment.getSubRoleId());
            }
        } catch (final AdminException e) {
            throw new RoleBulkRegistrationException("サブロールの一括登録に失敗しました", e);
        } finally {
            try {
                // WithoutCreatingSummary 系を使った場合は、成功・失敗にかかわらず必ずロールサマリを再作成して整合させる
                roleInfoManager.regenerateRoleSummary();
            } catch (final AdminException e) {
                throw new RoleBulkRegistrationException("ロールサマリの再作成に失敗しました", e);
            }
        }
    }
}
```

- `WithoutCreatingSummary` 系メソッド（8.0.37 以降）は、都度のロールサマリ再作成を省略することで大量データの一括更新を高速化する。**通常のサブロール追加・削除は `addSubRoleInfo`/`deleteSubRoleInfo(s)`（サマリ自動更新版）をデフォルトとし**、パフォーマンスが問題になる場合のみ本パターンを検討する
- `WithoutCreatingSummary` 系を呼び出した後、`regenerateRoleSummary()` を呼び出すまでの間はロールサマリが不整合な状態になる。この間に `getAllSubRoleIds`/`getAllParentRoleIds`/`certify` 等サマリに依存する検索系メソッドを呼び出さないこと
- `regenerateRoleSummary()` は全ロールのサマリを再作成する重い処理のため、ループの内側ではなく一括更新の**最後に1回だけ**呼び出す

## パターン7: アンチパターン集（避けること）

```java
// NG: getRoleInfo() の戻り値の null チェックを怠る
final RoleInfo roleInfo = roleInfoManager.getRoleInfo(roleId);
roleInfo.setCategory("new-category"); // roleId が存在しない場合 NullPointerException

// NG: RoleInfo() のチェック例外（IOException）を無視する
// RoleInfo() のみ IOException をスローする点を忘れ、他のコンストラクタと同様に例外処理なしで呼び出してしまう
final RoleInfo roleInfo = new RoleInfo(); // コンパイルエラー（IOException 未処理）または throws 宣言漏れ

// NG: WithoutCreatingSummary 系を使った後に regenerateRoleSummary() を呼び忘れる
roleInfoManager.addSubRoleInfoWithoutCreatingSummary(parentRoleId, subRoleId);
// regenerateRoleSummary() を呼ばないまま処理終了。以降 getAllSubRoleIds 等が不整合な結果を返す

// NG: AdminException を握りつぶす
try {
    roleInfoManager.addRoleInfo(roleInfo);
} catch (final AdminException e) {
    // 何もしない（原因調査が不可能になる）
}

// NG: certify() の引数（nestRoleIds / roleIds）の非対称性を意識せず、順序を取り違える
// 第2引数（roleIds）はネスト展開されないため、意図せず判定漏れが発生する
roleInfoManager.certify(APPROVAL_ROLE_IDS, userNestRoleIds); // 引数が逆

// NG: getCategoryCount()（@Deprecated）を新規実装で使い続ける
final int count = roleInfoManager.getCategoryCount(category); // getRoleInfoCountByCategory(String) を使う

// NG: moveCategory() が破壊的操作であることを意識せず、確認なしに呼び出す
// 該当カテゴリに属する全ロールのカテゴリ名が一括で書き換わる（元に戻すには再度 moveCategory を逆方向に呼ぶ必要がある）
roleInfoManager.moveCategory(oldCategory, newCategory);
```
