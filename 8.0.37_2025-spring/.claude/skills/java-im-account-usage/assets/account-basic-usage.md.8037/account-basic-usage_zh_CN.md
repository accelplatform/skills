# Account API 基本使用模式（Java 版）

关于 `AccountInfoManager` / `AccountInfo` / `AccountRoleInfo` / `AccountPasswordAdapter` 的签名与内部行为，请参考
`reference/account-api-reference.md`。这里展示典型的调用模式。

**角色定义本身（新建、层级、分类）的操作不在本技能范围内。** 这里仅涉及"为用户分配角色"的处理；创建或变更角色定义应使用 `java-im-role-usage`。

## 模式1: 新建注册账户信息

同时设置登录设置（区域设置・时区・日历・周起始日）的示例。

```java
package jp.co.example.foo.service;

import java.util.Locale;

import jp.co.intra_mart.foundation.admin.account.AccountInfoManager;
import jp.co.intra_mart.foundation.admin.account.model.AccountInfo;
import jp.co.intra_mart.foundation.admin.exception.AdminException;

import jp.co.example.foo.exception.AccountRegistrationException;

/**
 * 提供账户信息的新建注册处理。
 */
public class AccountRegistrationService {

    /**
     * 新建注册账户信息。<br>
     * 同时设置登录设置（区域设置・时区・日历・周起始日）。
     *
     * @param userCd 用户代码
     * @param password 密码（若保存方式为哈希化，将由平台内部自动哈希化后保存）
     * @throws AccountRegistrationException 账户信息注册失败时抛出
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
            throw new AccountRegistrationException("账户信息注册失败: userCd=" + userCd, e);
        }
    }
}
```

- `AccountInfo` 的构造函数参数 `userCd` 为必填项。有效开始日・有效结束日会自动设置为系统最小/最大日期，因此若希望账户无限期有效，无需显式设置
- `locale` 应以 `java.util.Locale` 类型而非 `String` 设置

## 模式2: 获取・更新账户信息（将密码排除在更新对象之外）

利用密码保存方式为哈希化时 `AccountInfo#getPassword()` 返回 `null` 的特性，在不改动密码的情况下仅更新其他字段。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.admin.account.AccountInfoManager;
import jp.co.intra_mart.foundation.admin.account.model.AccountInfo;
import jp.co.intra_mart.foundation.admin.exception.AdminException;

import jp.co.example.foo.exception.AccountUpdateException;

/**
 * 提供账户信息的更新处理。
 */
public class AccountProfileUpdateService {

    /**
     * 更新账户的备注字段。<br>
     * 将通过 {@link AccountInfoManager#getAccountInfo(String)} 获取到的 {@link AccountInfo} 原样传给
     * {@link AccountInfoManager#updateAccountInfo(AccountInfo)}，当密码保存方式为哈希化时，
     * password 会保持为 null，从而仅更新密码以外的字段。
     *
     * @param userCd 用户代码
     * @param notes 备注
     * @throws AccountUpdateException 账户信息的获取・更新失败时抛出
     */
    public void updateNotes(final String userCd, final String notes) throws AccountUpdateException {
        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            final AccountInfo accountInfo = accountInfoManager.getAccountInfo(userCd);
            if (accountInfo == null) {
                throw new AccountUpdateException("账户信息不存在: userCd=" + userCd);
            }

            // 不触碰 password（保持获取到的值原样传给 updateAccountInfo），从而将其排除在更新对象之外
            accountInfo.setNotes(notes);
            accountInfoManager.updateAccountInfo(accountInfo);
        } catch (final AdminException e) {
            throw new AccountUpdateException("账户信息更新失败: userCd=" + userCd, e);
        }
    }
}
```

- 务必先通过 `getAccountInfo()` 获取现有值，再仅修改所需的字段。若每次都新建 `new AccountInfo(userCd)` 并将未设置字段保持初始值传给 `updateAccountInfo()`，会导致其他字段被意外覆盖（详见反模式部分）

## 模式3: 使用密码校验实现登录确认处理

不要直接比较 `AccountInfo#getPassword()`，务必使用 `AccountPasswordAdapter#collate()`。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.admin.account.password.AccountPasswordAdapter;
import jp.co.intra_mart.foundation.admin.exception.PasswordException;

import jp.co.example.foo.exception.AccountAuthenticationException;

/**
 * 提供账户的登录认证处理。
 */
public class AccountAuthenticationService {

    /**
     * 确认输入的密码是否与账户已保存的密码一致。<br>
     * 若密码保存方式为哈希化，无法直接获取・比较明文密码，因此必须使用
     * {@link AccountPasswordAdapter#collate(String, String)}。
     *
     * @param userCd 用户代码
     * @param password 输入的密码（明文）
     * @return 密码一致时返回 true
     * @throws AccountAuthenticationException 密码校验处理失败时抛出
     */
    public boolean authenticate(final String userCd, final String password) throws AccountAuthenticationException {
        final AccountPasswordAdapter accountPasswordAdapter = new AccountPasswordAdapter();
        try {
            return accountPasswordAdapter.collate(userCd, password);
        } catch (final PasswordException e) {
            throw new AccountAuthenticationException("密码校验处理失败: userCd=" + userCd, e);
        }
    }
}
```

- 请注意 `PasswordException` 是与 `AdminException` 不同体系的受检异常（继承层级不同，需要分别编写 `catch`）
- 当 `canDecrypt()` 为 false（不可逆＝哈希化）时，`AccountPasswordAdapter#decrypt()` 返回 null。若实现前提是可以解密，应事先确认 `canDecrypt()`

## 模式4: 账户锁定・解锁

在 `AccountInfo#setLockDate(Date)` 设置非 null 值即为锁定状态，设置 null 即为解锁状态。

```java
package jp.co.example.foo.service;

import java.util.Date;

import jp.co.intra_mart.foundation.admin.account.AccountInfoManager;
import jp.co.intra_mart.foundation.admin.account.model.AccountInfo;
import jp.co.intra_mart.foundation.admin.exception.AdminException;

import jp.co.example.foo.exception.AccountLockException;

/**
 * 提供账户锁定的控制处理。
 */
public class AccountLockService {

    /**
     * 锁定账户。<br>
     * 在 {@link AccountInfo#setLockDate(Date)} 设置当前日期时间，使其进入锁定状态。
     *
     * @param userCd 用户代码
     * @throws AccountLockException 账户锁定失败时抛出
     */
    public void lock(final String userCd) throws AccountLockException {
        updateLockDate(userCd, new Date());
    }

    /**
     * 解除账户锁定。<br>
     * 在 {@link AccountInfo#setLockDate(Date)} 设置 null，使其进入解锁状态。
     *
     * @param userCd 用户代码
     * @throws AccountLockException 账户解锁失败时抛出
     */
    public void unlock(final String userCd) throws AccountLockException {
        updateLockDate(userCd, null);
    }

    private void updateLockDate(final String userCd, final Date lockDate) throws AccountLockException {
        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            final AccountInfo accountInfo = accountInfoManager.getAccountInfo(userCd);
            if (accountInfo == null) {
                throw new AccountLockException("账户信息不存在: userCd=" + userCd);
            }

            accountInfo.setLockDate(lockDate);
            accountInfoManager.updateAccountInfo(accountInfo);
        } catch (final AdminException e) {
            throw new AccountLockException("账户锁定状态变更失败: userCd=" + userCd, e);
        }
    }
}
```

- 通过 `getLockDate() != null` 判断是否处于锁定状态
- 若要基于登录失败次数（`loginFailureCount`）实现自动锁定，也应遵循同样的流程：`getAccountInfo()` → 修改字段 → `updateAccountInfo()`

## 模式5: 账户属性的 get/set

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.admin.account.AccountInfoManager;
import jp.co.intra_mart.foundation.admin.exception.AdminException;

import jp.co.example.foo.exception.AccountAttributeException;

/**
 * 提供账户属性的获取・设置处理。
 */
public class AccountAttributeService {

    /** 用于存储员工编号的账户属性名。 */
    private static final String ATTR_EMPLOYEE_NUMBER = "employeeNumber";

    /**
     * 获取账户的员工编号属性。
     *
     * @param userCd 用户代码
     * @return 员工编号。属性不存在时返回 null
     * @throws AccountAttributeException 属性获取失败时抛出
     */
    public String getEmployeeNumber(final String userCd) throws AccountAttributeException {
        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            return accountInfoManager.getAttribute(userCd, ATTR_EMPLOYEE_NUMBER);
        } catch (final AdminException e) {
            throw new AccountAttributeException("账户属性获取失败: userCd=" + userCd, e);
        }
    }

    /**
     * 设置账户的员工编号属性。<br>
     * userCd・属性名・属性值均不允许为 null 或空字符串（若已存在则更新，若不存在则新建）。
     *
     * @param userCd 用户代码
     * @param employeeNumber 员工编号
     * @throws AccountAttributeException 属性设置失败时抛出
     */
    public void setEmployeeNumber(final String userCd, final String employeeNumber) throws AccountAttributeException {
        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            accountInfoManager.setAttribute(userCd, ATTR_EMPLOYEE_NUMBER, employeeNumber);
        } catch (final AdminException e) {
            throw new AccountAttributeException("账户属性设置失败: userCd=" + userCd, e);
        }
    }
}
```

## 模式6: 为用户分配角色与获取有效角色列表

仅涉及通过 `addAccountRoleInfo()` 进行的角色"分配"。角色定义本身（新建、层级、分类）的操作不在本技能范围内（应使用 `java-im-role-usage`）。

```java
package jp.co.example.foo.service;

import java.util.Date;
import java.util.List;

import jp.co.intra_mart.foundation.admin.account.AccountInfoManager;
import jp.co.intra_mart.foundation.admin.account.model.AccountRoleInfo;
import jp.co.intra_mart.foundation.admin.exception.AdminException;

import jp.co.example.foo.exception.AccountRoleAssignmentException;

/**
 * 提供为用户分配角色的处理。<br>
 * 角色定义本身（新建、层级、分类）的操作不在本类范围内。角色定义的操作请使用其他技能（java-im-role-usage）。
 */
public class AccountRoleAssignmentService {

    /**
     * 为用户分配角色。<br>
     * 有效期判定为"开始日 &lt;= 判定日 &lt; 结束日"。将结束日设置为 null 会重置为系统最大日期。
     *
     * @param userCd 用户代码
     * @param roleId 角色ID（角色定义须事先创建完成）
     * @param validStartDate 角色有效开始日
     * @param validEndDate 角色有效结束日（若希望无限期，指定 null 使其重置为系统最大日期）
     * @throws AccountRoleAssignmentException 角色分配失败时抛出
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
            throw new AccountRoleAssignmentException("角色分配失败: userCd=" + userCd + ", roleId=" + roleId, e);
        }
    }

    /**
     * 获取用户直接分配的有效角色ID列表。<br>
     * 不含子角色。仅针对在指定日期时点有效的直接分配。
     *
     * @param userCd 用户代码
     * @param date 判定日期时间
     * @return 有效角色ID列表（仅直接分配）
     * @throws AccountRoleAssignmentException 角色ID列表获取失败时抛出
     */
    public List<String> getDirectRoleIds(final String userCd, final Date date) throws AccountRoleAssignmentException {
        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            return accountInfoManager.getAccountRoleIds(userCd, date);
        } catch (final AdminException e) {
            throw new AccountRoleAssignmentException("角色ID列表获取失败: userCd=" + userCd, e);
        }
    }

    /**
     * 递归获取用户所持有的有效角色ID列表（含子角色）。<br>
     * 与 {@link #getDirectRoleIds(String, Date)} 的不同之处在于，直接分配角色下属的子角色也会包含在结果中。
     *
     * @param userCd 用户代码
     * @param date 判定日期时间
     * @return 含子角色的有效角色ID列表
     * @throws AccountRoleAssignmentException 角色ID列表获取失败时抛出
     */
    public List<String> getAllRoleIdsRecursively(final String userCd, final Date date) throws AccountRoleAssignmentException {
        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            return accountInfoManager.getAccountRoleIdsRecursively(userCd, date);
        } catch (final AdminException e) {
            throw new AccountRoleAssignmentException("角色ID列表获取失败: userCd=" + userCd, e);
        }
    }
}
```

- `getDirectRoleIds()`（内部调用 `getAccountRoleIds(userCd, date)`）与 `getAllRoleIdsRecursively()`（内部调用 `getAccountRoleIdsRecursively(userCd, date)`）的区别在于是否包含子角色。若要判断用户实际持有的角色（例如权限检查），应使用递归版本
- 与"从用户代码查询角色"相反，若要"从角色ID查询已分配的用户"，`getUserCdsByAccountRoleId()`（仅直接匹配）与 `getUserCdsByRoleId()`（考虑层级与有效期）行为不同。使用区分请参考 `SKILL.md` 的注意事项部分

## 反模式（应避免）

```java
// NG: 未考虑密码哈希化，直接比较 AccountInfo#getPassword() 来判断登录
final AccountInfo accountInfo = accountInfoManager.getAccountInfo(userCd);
if (password.equals(accountInfo.getPassword())) {
    // 若密码保存方式为哈希化，getPassword() 始终返回 null，
    // 会导致 NullPointerException，或始终被判定为不一致
}

// NG: 不使用 getAccountInfo()，每次都新建 new AccountInfo(userCd) 后传给 updateAccountInfo()
final AccountInfo accountInfo = new AccountInfo(userCd);
accountInfo.setNotes(notes);
accountInfoManager.updateAccountInfo(accountInfo);
// 未获取的字段（区域设置・时区・锁定状态等）会被意外覆盖为初始值

// NG: 在 updateAccountInfo() 中意外覆盖密码
final AccountInfo accountInfo = accountInfoManager.getAccountInfo(userCd);
accountInfo.setPassword(""); // 设置空字符串（非 null）会导致密码被更新为空字符串
accountInfo.setNotes(notes);
accountInfoManager.updateAccountInfo(accountInfo);

// NG: 吞没 AdminException / PasswordException
try {
    accountInfoManager.updateAccountInfo(accountInfo);
} catch (final AdminException e) {
    // 什么都不做（在原因不明的情况下继续处理）
}

// NG: 将角色有效期结束日手动计算为一个遥远的未来日期，意图表示"无限期"
accountRoleInfo.setRoleValidEndDate(new Date(Long.MAX_VALUE));
// 设置 null 即可自动重置为系统最大日期，手动计算既无必要，也可能被当作非法日期处理

// NG: 混淆直接匹配检索与考虑层级的检索
accountInfoManager.getUserCdsByAccountRoleId(parentRoleId);
// getUserCdsByAccountRoleId() 仅为直接匹配，不会追溯角色层级。
// 若想以父角色ID检索子角色持有者，结果可能为空。
// 需要考虑层级时应使用 getUserCdsByRoleId(roleId, date)

// NG: 使用已标记 @Deprecated 的 isUpdate(Date) 判断是否发生了更新
if (accountInfoManager.isUpdate(someDate)) {
    // 自 8.0.4 起始终返回 true，作为判定条件已无意义
}
```
