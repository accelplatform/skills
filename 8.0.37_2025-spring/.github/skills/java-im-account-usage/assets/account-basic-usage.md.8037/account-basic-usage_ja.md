# Account API 基本利用パターン（Java 版）

`AccountInfoManager` / `AccountInfo` / `AccountRoleInfo` / `AccountPasswordAdapter` のシグネチャ・内部動作は
`reference/account-api-reference.md` を参照。ここでは典型的な呼び出しパターンを示す。

**ロール定義自体（新規登録・階層・カテゴリ）の操作はこのスキルの対象外である。** ここで扱うのは「ユーザにロールを割り当てる」処理のみで、ロール定義の作成・変更は `java-im-role-usage` を使用すること。

## パターン1: アカウント情報の新規登録

ログイン設定（ロケール・タイムゾーン・カレンダー・週開始曜日）を併せて設定する例。

```java
package jp.co.example.foo.service;

import java.util.Locale;

import jp.co.intra_mart.foundation.admin.account.AccountInfoManager;
import jp.co.intra_mart.foundation.admin.account.model.AccountInfo;
import jp.co.intra_mart.foundation.admin.exception.AdminException;

import jp.co.example.foo.exception.AccountRegistrationException;

/**
 * アカウント情報の新規登録処理を提供します。
 */
public class AccountRegistrationService {

    /**
     * アカウント情報を新規登録します。<br>
     * ログイン設定（ロケール・タイムゾーン・カレンダー・週開始曜日）も併せて設定します。
     *
     * @param userCd ユーザコード
     * @param password パスワード（保存方式がハッシュ化の場合、プラットフォーム側で内部的にハッシュ化されて保存されます）
     * @throws AccountRegistrationException アカウント情報の登録に失敗した場合
     */
    public void registerAccount(final String userCd, final String password) throws AccountRegistrationException {
        final AccountInfo accountInfo = new AccountInfo(userCd);
        accountInfo.setPassword(password);
        accountInfo.setLocale(Locale.JAPAN);
        accountInfo.setTimeZoneId("Asia/Tokyo");
        accountInfo.setCalendarId("standard");
        accountInfo.setFirstDayOfWeek(1);

        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            accountInfoManager.addAccountInfo(accountInfo);
        } catch (final AdminException e) {
            throw new AccountRegistrationException("アカウント情報の登録に失敗しました: userCd=" + userCd, e);
        }
    }
}
```

- `AccountInfo` のコンストラクタ引数は `userCd` 必須。有効開始日・有効終了日は自動でシステム最小/最大日付が設定されるため、無期限で有効なアカウントを作る場合は明示的に設定不要
- `locale` は `String` ではなく `java.util.Locale` 型で設定する

## パターン2: アカウント情報の取得・更新（パスワードは更新対象外にする）

`AccountInfo#getPassword()` がハッシュ化保存時に `null` になる性質を利用し、パスワードを触らずに他フィールドだけ更新する。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.admin.account.AccountInfoManager;
import jp.co.intra_mart.foundation.admin.account.model.AccountInfo;
import jp.co.intra_mart.foundation.admin.exception.AdminException;

import jp.co.example.foo.exception.AccountUpdateException;

/**
 * アカウント情報の更新処理を提供します。
 */
public class AccountProfileUpdateService {

    /**
     * アカウントの備考欄を更新します。<br>
     * {@link AccountInfoManager#getAccountInfo(String)} で取得した {@link AccountInfo} をそのまま
     * {@link AccountInfoManager#updateAccountInfo(AccountInfo)} に渡すことで、
     * パスワード保存方式がハッシュ化の場合は password が null のまま保持され、パスワード以外のみが更新されます。
     *
     * @param userCd ユーザコード
     * @param notes 備考
     * @throws AccountUpdateException アカウント情報の取得・更新に失敗した場合
     */
    public void updateNotes(final String userCd, final String notes) throws AccountUpdateException {
        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            final AccountInfo accountInfo = accountInfoManager.getAccountInfo(userCd);
            if (accountInfo == null) {
                throw new AccountUpdateException("アカウント情報が存在しません: userCd=" + userCd);
            }

            // password には触れない（取得した値のまま updateAccountInfo に渡す）ことで、更新対象から除外する
            accountInfo.setNotes(notes);
            accountInfoManager.updateAccountInfo(accountInfo);
        } catch (final AdminException e) {
            throw new AccountUpdateException("アカウント情報の更新に失敗しました: userCd=" + userCd, e);
        }
    }
}
```

- 必ず `getAccountInfo()` で既存の値を取得してから一部フィールドのみ変更すること。`new AccountInfo(userCd)` を都度生成して未設定のフィールドを初期値のまま `updateAccountInfo()` に渡すと、他フィールドが意図せず上書きされる（詳細はアンチパターン参照）

## パターン3: パスワード照合を使ったログイン確認処理

`AccountInfo#getPassword()` を直接比較せず、必ず `AccountPasswordAdapter#collate()` を使う。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.admin.account.password.AccountPasswordAdapter;
import jp.co.intra_mart.foundation.admin.exception.PasswordException;

import jp.co.example.foo.exception.AccountAuthenticationException;

/**
 * アカウントのログイン認証処理を提供します。
 */
public class AccountAuthenticationService {

    /**
     * 入力されたパスワードがアカウントの保存済みパスワードと一致するか確認します。<br>
     * パスワード保存方式がハッシュ化の場合、平文パスワードを直接取得・比較することはできないため、
     * 必ず {@link AccountPasswordAdapter#collate(String, String)} を使用すること。
     *
     * @param userCd ユーザコード
     * @param password 入力されたパスワード（平文）
     * @return パスワードが一致する場合 true
     * @throws AccountAuthenticationException パスワード照合処理に失敗した場合
     */
    public boolean authenticate(final String userCd, final String password) throws AccountAuthenticationException {
        final AccountPasswordAdapter accountPasswordAdapter = new AccountPasswordAdapter();
        try {
            return accountPasswordAdapter.collate(userCd, password);
        } catch (final PasswordException e) {
            throw new AccountAuthenticationException("パスワード照合処理に失敗しました: userCd=" + userCd, e);
        }
    }
}
```

- `PasswordException` は `AdminException` とは別系統のチェック例外である点に注意（継承階層が異なるため `catch` を分ける必要がある）
- `AccountPasswordAdapter#decrypt()` は `canDecrypt()` が false（不可逆＝ハッシュ化）の場合 null を返す。復号を前提にした実装をする場合は事前に `canDecrypt()` を確認すること

## パターン4: アカウントロック・ロック解除

`AccountInfo#setLockDate(Date)` に非 null 値を設定するとロック状態、null を設定するとロック解除状態になる。

```java
package jp.co.example.foo.service;

import java.util.Date;

import jp.co.intra_mart.foundation.admin.account.AccountInfoManager;
import jp.co.intra_mart.foundation.admin.account.model.AccountInfo;
import jp.co.intra_mart.foundation.admin.exception.AdminException;

import jp.co.example.foo.exception.AccountLockException;

/**
 * アカウントロックの制御処理を提供します。
 */
public class AccountLockService {

    /**
     * アカウントをロックします。<br>
     * {@link AccountInfo#setLockDate(Date)} に現在日時を設定することでロック状態にします。
     *
     * @param userCd ユーザコード
     * @throws AccountLockException アカウントのロックに失敗した場合
     */
    public void lock(final String userCd) throws AccountLockException {
        updateLockDate(userCd, new Date());
    }

    /**
     * アカウントのロックを解除します。<br>
     * {@link AccountInfo#setLockDate(Date)} に null を設定することでロック解除状態にします。
     *
     * @param userCd ユーザコード
     * @throws AccountLockException アカウントのロック解除に失敗した場合
     */
    public void unlock(final String userCd) throws AccountLockException {
        updateLockDate(userCd, null);
    }

    private void updateLockDate(final String userCd, final Date lockDate) throws AccountLockException {
        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            final AccountInfo accountInfo = accountInfoManager.getAccountInfo(userCd);
            if (accountInfo == null) {
                throw new AccountLockException("アカウント情報が存在しません: userCd=" + userCd);
            }

            accountInfo.setLockDate(lockDate);
            accountInfoManager.updateAccountInfo(accountInfo);
        } catch (final AdminException e) {
            throw new AccountLockException("アカウントのロック状態変更に失敗しました: userCd=" + userCd, e);
        }
    }
}
```

- ロック状態かどうかは `getLockDate() != null` で判定する
- ログイン失敗回数（`loginFailureCount`）を用いた自動ロック運用を行う場合も、同様に `getAccountInfo()` → フィールド変更 → `updateAccountInfo()` の流れで実装する

## パターン5: アカウント属性の get/set

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.admin.account.AccountInfoManager;
import jp.co.intra_mart.foundation.admin.exception.AdminException;

import jp.co.example.foo.exception.AccountAttributeException;

/**
 * アカウント属性の取得・設定処理を提供します。
 */
public class AccountAttributeService {

    /** 従業員番号を格納するアカウント属性名です。 */
    private static final String ATTR_EMPLOYEE_NUMBER = "employeeNumber";

    /**
     * アカウントの従業員番号属性を取得します。
     *
     * @param userCd ユーザコード
     * @return 従業員番号。属性が存在しない場合 null
     * @throws AccountAttributeException 属性の取得に失敗した場合
     */
    public String getEmployeeNumber(final String userCd) throws AccountAttributeException {
        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            return accountInfoManager.getAttribute(userCd, ATTR_EMPLOYEE_NUMBER);
        } catch (final AdminException e) {
            throw new AccountAttributeException("アカウント属性の取得に失敗しました: userCd=" + userCd, e);
        }
    }

    /**
     * アカウントの従業員番号属性を設定します。<br>
     * userCd・属性名・属性値のいずれも null・空文字は許可されません（存在すれば更新、なければ新規作成されます）。
     *
     * @param userCd ユーザコード
     * @param employeeNumber 従業員番号
     * @throws AccountAttributeException 属性の設定に失敗した場合
     */
    public void setEmployeeNumber(final String userCd, final String employeeNumber) throws AccountAttributeException {
        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            accountInfoManager.setAttribute(userCd, ATTR_EMPLOYEE_NUMBER, employeeNumber);
        } catch (final AdminException e) {
            throw new AccountAttributeException("アカウント属性の設定に失敗しました: userCd=" + userCd, e);
        }
    }
}
```

## パターン6: ユーザへのロール割当と有効ロール一覧取得

`addAccountRoleInfo()` によるロール「割当」のみを扱う。ロール定義自体（新規登録・階層・カテゴリ）の操作は対象外（`java-im-role-usage` を使用すること）。

```java
package jp.co.example.foo.service;

import java.util.Date;
import java.util.List;

import jp.co.intra_mart.foundation.admin.account.AccountInfoManager;
import jp.co.intra_mart.foundation.admin.account.model.AccountRoleInfo;
import jp.co.intra_mart.foundation.admin.exception.AdminException;

import jp.co.example.foo.exception.AccountRoleAssignmentException;

/**
 * ユーザへのロール割当処理を提供します。<br>
 * ロール定義自体（新規登録・階層・カテゴリ）の操作は対象外です。ロール定義の操作は別スキル（java-im-role-usage）を使用すること。
 */
public class AccountRoleAssignmentService {

    /**
     * ユーザにロールを割り当てます。<br>
     * 有効期間は「開始日 &lt;= 判定日 &lt; 終了日」で判定されます。終了日に null を設定するとシステム最大日付にリセットされます。
     *
     * @param userCd ユーザコード
     * @param roleId ロールID（ロール定義は事前に作成済みであること）
     * @param validStartDate ロール有効開始日
     * @param validEndDate ロール有効終了日（無期限にしたい場合は null を指定し、システム最大日付にリセットさせる）
     * @throws AccountRoleAssignmentException ロール割当に失敗した場合
     */
    public void assignRole(final String userCd, final String roleId, final Date validStartDate, final Date validEndDate)
            throws AccountRoleAssignmentException {
        final AccountRoleInfo accountRoleInfo = new AccountRoleInfo(roleId);
        accountRoleInfo.setRoleValidStartDate(validStartDate);
        accountRoleInfo.setRoleValidEndDate(validEndDate);

        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            accountInfoManager.addAccountRoleInfo(userCd, accountRoleInfo);
        } catch (final AdminException e) {
            throw new AccountRoleAssignmentException("ロール割当に失敗しました: userCd=" + userCd + ", roleId=" + roleId, e);
        }
    }

    /**
     * ユーザに直接割り当てられている有効ロールID一覧を取得します。<br>
     * サブロール（子ロール）は含みません。指定日時点で有効な直接割当のみが対象です。
     *
     * @param userCd ユーザコード
     * @param date 判定日時
     * @return 有効なロールID一覧（直接割当のみ）
     * @throws AccountRoleAssignmentException ロールID一覧の取得に失敗した場合
     */
    public List<String> getDirectRoleIds(final String userCd, final Date date) throws AccountRoleAssignmentException {
        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            return accountInfoManager.getAccountRoleIds(userCd, date);
        } catch (final AdminException e) {
            throw new AccountRoleAssignmentException("ロールID一覧の取得に失敗しました: userCd=" + userCd, e);
        }
    }

    /**
     * ユーザが保有する有効ロールID一覧を、サブロール（子ロール）を含めて再帰的に取得します。<br>
     * 直接割り当てられたロールの配下にあるサブロールも結果に含まれる点が {@link #getDirectRoleIds(String, Date)} と異なります。
     *
     * @param userCd ユーザコード
     * @param date 判定日時
     * @return サブロールを含む有効なロールID一覧
     * @throws AccountRoleAssignmentException ロールID一覧の取得に失敗した場合
     */
    public List<String> getAllRoleIdsRecursively(final String userCd, final Date date) throws AccountRoleAssignmentException {
        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            return accountInfoManager.getAccountRoleIdsRecursively(userCd, date);
        } catch (final AdminException e) {
            throw new AccountRoleAssignmentException("ロールID一覧の取得に失敗しました: userCd=" + userCd, e);
        }
    }
}
```

- `getDirectRoleIds()`（内部で `getAccountRoleIds(userCd, date)` を呼ぶ）と `getAllRoleIdsRecursively()`（内部で `getAccountRoleIdsRecursively(userCd, date)` を呼ぶ）の違いはサブロールを含むかどうか。権限チェック等でユーザの実質的な保有ロールを判定したい場合は再帰版を使うこと
- ユーザコードからロールIDを引く方向とは逆に、ロールIDから割当ユーザを引く場合は `getUserCdsByAccountRoleId()`（直接一致のみ）と `getUserCdsByRoleId()`（階層・有効期間を考慮）で挙動が異なる。使い分けは `SKILL.md` の注意事項を参照

## アンチパターン（避けること）

```java
// NG: パスワードのハッシュ化を考慮せず、AccountInfo#getPassword() を直接比較してログイン判定してしまう
final AccountInfo accountInfo = accountInfoManager.getAccountInfo(userCd);
if (password.equals(accountInfo.getPassword())) {
    // パスワード保存方式がハッシュ化の場合、getPassword() は常に null を返すため、
    // NullPointerException になるか、常に不一致と判定されてしまう
}

// NG: getAccountInfo() を使わず new AccountInfo(userCd) を都度生成して updateAccountInfo() に渡す
final AccountInfo accountInfo = new AccountInfo(userCd);
accountInfo.setNotes(notes);
accountInfoManager.updateAccountInfo(accountInfo);
// 取得していないフィールド（ロケール・タイムゾーン・ロック状態等）が初期値で意図せず上書きされる

// NG: updateAccountInfo() でパスワードを意図せず上書きしてしまう
final AccountInfo accountInfo = accountInfoManager.getAccountInfo(userCd);
accountInfo.setPassword(""); // 空文字を設定してしまうと、null ではないためパスワードが空文字で更新される
accountInfo.setNotes(notes);
accountInfoManager.updateAccountInfo(accountInfo);

// NG: AdminException / PasswordException を握りつぶす
try {
    accountInfoManager.updateAccountInfo(accountInfo);
} catch (final AdminException e) {
    // 何もしない（原因不明のまま処理が続行される）
}

// NG: ロール有効期間の終了日を「無期限」のつもりで手計算した遠い未来日にする
accountRoleInfo.setRoleValidEndDate(new Date(Long.MAX_VALUE));
// null を設定すればシステム最大日付に自動リセットされるため、手計算は不要かつ不正な日付として扱われる可能性がある

// NG: 直接一致検索と階層考慮検索を混同する
accountInfoManager.getUserCdsByAccountRoleId(parentRoleId);
// getUserCdsByAccountRoleId() はロール階層を辿らない直接一致のみ。
// 親ロールに割り当てたつもりで子ロール保有者を検索すると結果が空になる場合がある。
// 階層を考慮したい場合は getUserCdsByRoleId(roleId, date) を使う

// NG: @Deprecated の isUpdate(Date) を更新有無の判定に使う
if (accountInfoManager.isUpdate(someDate)) {
    // 8.0.4 以降は常に true を返すため、判定として意味を持たない
}
```
