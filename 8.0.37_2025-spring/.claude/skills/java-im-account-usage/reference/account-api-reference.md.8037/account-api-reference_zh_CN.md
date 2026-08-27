# Account API 参考手册（Java 版）

基于 intra-mart Accel Platform 核心源码（`im_admin_base` 模块）的实际类定义。请勿凭记忆或推测补充方法。

## 包结构

```
jp.co.intra_mart.foundation.admin.account
└── AccountInfoManager             … 公开 API。final class

jp.co.intra_mart.foundation.admin.account.model
├── AccountInfo                    … 账户信息模型（Serializable）
└── AccountRoleInfo                … 账户角色分配信息模型（Serializable）

jp.co.intra_mart.foundation.admin.account.password
└── AccountPasswordAdapter         … 密码的校验・加密・解密

jp.co.intra_mart.foundation.admin.exception
├── AdminException                 … 受检异常。AccountInfoManager 的全部方法均会抛出
└── PasswordException              … 受检异常。AccountPasswordAdapter 的全部方法均会抛出（与 AdminException 属于不同体系）
```

## `AccountInfoManager` 类

```java
package jp.co.intra_mart.foundation.admin.account;

public final class AccountInfoManager {

    /** 作为账户属性存储的数值格式属性名。 @since 8.0.15 */
    public static final String ATTR_DECIMAL_FORMAT = "im_i18n_decimal_format_id";

    public AccountInfoManager() {}

    /** 新建注册账户信息。 */
    public void addAccountInfo(final AccountInfo accountInfo) throws AdminException;

    /** 为用户分配角色。 */
    public void addAccountRoleInfo(final String userCd, final AccountRoleInfo accountRoleInfo) throws AdminException;

    /** 判断指定用户代码的账户是否存在。 */
    public boolean contains(final String userCd) throws AdminException;

    /** 删除账户信息。 */
    public void deleteAccountInfo(final String userCd) throws AdminException;

    /** 删除全部账户信息。 */
    public void deleteAccountInfos() throws AdminException;

    /** 解除用户已分配的特定角色。 */
    public void deleteAccountRoleInfo(final String userCd, final String roleId) throws AdminException;

    /** 解除用户已分配的全部角色。 */
    public void deleteAccountRoleInfos(final String userCd) throws AdminException;

    /** 删除账户属性。 */
    public void deleteAttribute(final String userCd, final String name) throws AdminException;

    /** 删除账户的全部属性。 */
    public void deleteAttributes(final String userCd) throws AdminException;

    /**
     * 获取账户信息。<br>
     * 若密码保存方式为"哈希化"，返回的 {@link AccountInfo} 的密码将为 null。
     */
    public AccountInfo getAccountInfo(final String userCd) throws AdminException;

    /** 获取账户信息的件数。 */
    public int getAccountInfoCount() throws AdminException;

    /** 获取全部账户信息的列表。无数据时返回空列表。 */
    public List<AccountInfo> getAccountInfos() throws AdminException;

    /** 按起始位置与件数获取账户信息列表。 */
    public List<AccountInfo> getAccountInfos(final int start, final int count) throws AdminException;

    /** 按用户代码获取账户信息列表。 */
    public List<AccountInfo> getAccountInfosByUserCds(final String... userCds) throws AdminException;

    /**
     * 获取用户直接分配的角色ID列表。<br>
     * 不进行有效期过滤，仅针对直接分配，不含子角色。
     */
    public List<String> getAccountRoleIds(final String userCd) throws AdminException;

    /**
     * 获取指定日期时点用户直接分配的、有效的角色ID列表。<br>
     * 有效性判定为"角色有效开始日 &lt;= date &lt; 角色有效结束日"。不含子角色。
     */
    public List<String> getAccountRoleIds(final String userCd, final Date date) throws AdminException;

    /**
     * 递归获取指定日期时点用户所持有的有效角色ID列表（含子角色）。<br>
     * 有效性判定方式与 {@link #getAccountRoleIds(String, Date)} 相同。
     */
    public List<String> getAccountRoleIdsRecursively(final String userCd, final Date date) throws AdminException;

    /** 获取用户直接分配的角色分配信息（{@link AccountRoleInfo}）列表。 */
    public List<AccountRoleInfo> getAccountRoleInfos(final String userCd) throws AdminException;

    /** 获取指定日期时点有效的角色分配信息（{@link AccountRoleInfo}）列表。 */
    public List<AccountRoleInfo> getAccountRoleInfos(final String userCd, final Date date) throws AdminException;

    /** 获取账户属性。无数据时返回 null。 */
    public String getAttribute(final String userCd, final String name) throws AdminException;

    /** 获取账户属性。无数据时返回默认值（第3个参数）。 */
    public String getAttribute(final String userCd, final String name, final String def) throws AdminException;

    /** 获取用户所持有的属性名列表。 */
    public List<String> getAttributeNames(final String userCd) throws AdminException;

    /** 获取全部用户代码列表。 */
    public List<String> getUserCds() throws AdminException;

    /**
     * 获取直接分配了指定角色ID的用户代码列表。<br>
     * 不进行角色层级检查（仅直接匹配）。
     */
    public List<String> getUserCdsByAccountRoleId(final String roleId) throws AdminException;

    /** 获取具有指定属性名・属性值组合的用户代码列表。 */
    public List<String> getUserCdsByAttribute(final String key, final String value) throws AdminException;

    /**
     * 沿父角色层级追溯，获取在指定日期时点持有有效的账户授予角色的用户代码列表。<br>
     * 与 {@link #getUserCdsByAccountRoleId(String)}（仅直接匹配）行为不同。
     */
    public List<String> getUserCdsByRoleId(final String roleId, final Date date) throws AdminException;

    /**
     * @deprecated 自 8.0.4 起始终返回 true，实质上已无意义。
     */
    @Deprecated
    public boolean isUpdate(final Date date) throws AdminException;

    /**
     * 使用用户代码的通配符搜索来检索账户信息。<br>
     * 通配符: {@code *} 表示0个以上字符，{@code ?} 表示1个字符。若密码保存方式为"哈希化"，返回的密码为 null。
     */
    public List<AccountInfo> searchAccountInfos(final String userCd) throws AdminException;

    /** 按起始位置与件数进行用户代码的通配符搜索。 */
    public List<AccountInfo> searchAccountInfos(final String userCd, final int start, final int count) throws AdminException;

    /**
     * 设置账户属性。若已存在则更新，若不存在则新建。<br>
     * userCd・name・value 均不允许为 null 或空字符串。
     */
    public void setAttribute(final String userCd, final String name, final String value) throws AdminException;

    /**
     * 更新账户信息。<br>
     * 若 {@link AccountInfo#getPassword()} 为 null，则仅更新密码以外的字段。
     */
    public void updateAccountInfo(final AccountInfo accountInfo) throws AdminException;

    /** 更新用户已分配的角色信息（有效期等）。 */
    public void updateAccountRoleInfo(final String userCd, final AccountRoleInfo accountRoleInfo) throws AdminException;
}
```

## `AccountInfo` 模型

```java
package jp.co.intra_mart.foundation.admin.account.model;

public class AccountInfo implements Serializable {

    private Map<String, String> dateTimeFormats; // 日期显示格式列表
    private String encoding;
    private String calendarId;
    private int firstDayOfWeek = -1;              // 周起始日
    private Locale locale;                        // java.util.Locale 类型（非字符串）
    private Date lockDate;                        // 账户锁定日期。未锁定时为 null
    private int loginFailureCount;
    private String notes;
    private String password;
    private Map<String, String> themeIds;          // 客户端类型ID → 主题ID
    private String timeZoneId;
    private String userCd;
    private Date validEndDate;
    private Date validStartDate;

    /**
     * 生成实例。<br>
     * userCd 为必填项。有效开始日・有效结束日会自动初始化为系统最小日期・系统最大日期。
     * @param userCd 用户代码
     */
    public AccountInfo(final String userCd);

    public String getUserCd();
    public void setUserCd(final String userCd);

    public String getPassword();
    /**
     * 设置密码。<br>
     * 若将 password 设为 null 后传给
     * {@link jp.co.intra_mart.foundation.admin.account.AccountInfoManager#updateAccountInfo(AccountInfo)}，
     * 则仅更新密码以外的字段。
     */
    public void setPassword(final String password);

    public Locale getLocale();
    /** 设置区域设置。以 java.util.Locale 类型而非字符串处理。 */
    public void setLocale(final Locale locale);

    public String getTimeZoneId();
    public void setTimeZoneId(final String timeZoneId);

    public String getCalendarId();
    public void setCalendarId(final String calendarId);

    public int getFirstDayOfWeek();
    public void setFirstDayOfWeek(final int firstDayOfWeek);

    public Map<String, String> getDateTimeFormats();
    public void setDateTimeFormats(final Map<String, String> dateTimeFormats);

    public Map<String, String> getThemeIds();
    public void setThemeIds(final Map<String, String> themeIds);

    public String getEncoding();
    public void setEncoding(final String encoding);

    public Date getLockDate();
    /**
     * 设置锁定日期。<br>
     * 设置非 null 值即为锁定状态，设置 null 即为解锁状态。
     */
    public void setLockDate(final Date lockDate);

    public int getLoginFailureCount();
    public void setLoginFailureCount(final int loginFailureCount);

    public String getNotes();
    public void setNotes(final String notes);

    public Date getValidStartDate();
    public void setValidStartDate(final Date validStartDate);

    public Date getValidEndDate();
    public void setValidEndDate(final Date validEndDate);
}
```

- 上述各字段均有对应的标准 getter/setter
- 锁定状态通过 `getLockDate() != null` 判断（假定不存在专门的 `isLocked()` 之类辅助方法；除非确认其存在，否则不要调用）

## `AccountRoleInfo` 模型

```java
package jp.co.intra_mart.foundation.admin.account.model;

public class AccountRoleInfo implements Serializable {

    private String roleId;
    private Date roleValidEndDate;
    private Date roleValidStartDate;

    /**
     * 生成实例。<br>
     * roleId 为必填项。有效开始日会自动初始化为系统最小日期，有效结束日会自动初始化为系统最大日期。
     * @param roleId 角色ID
     */
    public AccountRoleInfo(final String roleId);

    public String getRoleId();

    public Date getRoleValidStartDate();
    public void setRoleValidStartDate(final Date roleValidStartDate);

    public Date getRoleValidEndDate();
    /**
     * 设置角色有效结束日。<br>
     * 设置 null 会重置为系统最大日期。仅保留日期部分（时间为 00:00:00），
     * 有效期至设置日的前一天为止（判定公式: 开始日 &lt;= 判定日 &lt; 结束日）。
     */
    public void setRoleValidEndDate(final Date roleValidEndDate);
}
```

## `AccountPasswordAdapter` 类

```java
package jp.co.intra_mart.foundation.admin.account.password;

public class AccountPasswordAdapter {

    public AccountPasswordAdapter();

    /** 判断密码保存方式是否可解密（即是否为可逆加密）。 */
    public boolean canDecrypt() throws PasswordException;

    /** 校验输入的密码是否与指定用户已保存的密码一致。 */
    public boolean collate(final String userCd, final String password) throws PasswordException;

    /**
     * 解密密码。<br>
     * 当 {@link #canDecrypt()} 为 false（不可逆＝哈希化保存）时返回 null。
     */
    public String decrypt(final String userCd, final String password) throws PasswordException;

    /** 按保存方式对密码进行加密（或哈希化）。 */
    public String encrypt(final String userCd, final String password) throws PasswordException;
}
```

## 异常的处理

```java
package jp.co.intra_mart.foundation.admin.exception;

/** AccountInfoManager 全部方法均会抛出的受检异常。 */
public class AdminException extends FoundationException {
    public AdminException(final String message);
    public AdminException(final String message, final Throwable cause);
    public AdminException(final Throwable cause);
}

/**
 * AccountPasswordAdapter 全部方法均会抛出的受检异常。<br>
 * 与 AdminException 属于不同的异常继承体系，因此同时处理两者的代码需要分别编写 catch 块。
 */
public class PasswordException extends Exception {
    public PasswordException(final String message);
    public PasswordException(final String message, final Throwable cause);
    public PasswordException(final Throwable cause);
}
```

- `AccountInfoManager` 的全部方法均抛出 `AdminException`（受检异常）。调用方必须 `try`/`catch`，或通过 `throws` 声明将其传播给调用者
- `AccountPasswordAdapter` 的全部方法均抛出 `PasswordException`（受检异常）。由于其与 `AdminException` 是不同的异常继承体系，若在同一方法中使用这两个 API，需要分别编写两种 `catch`，或通过共同的父类（`Exception`）统一捕获
- 两者均具有标准构造函数（仅消息／消息+cause／仅 cause）
