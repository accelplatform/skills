# UserManager API 参考手册（Java 版）

基于 `im_master-main` 模块（`jp.co.intra_mart.foundation.master.user.*`）的实际类定义。不要凭记忆或推测补充方法・属性。

## 类概要

```java
package jp.co.intra_mart.foundation.master.user;

/**
 * 负责获取与管理用户信息的管理器类
 * @since 7.2
 */
public class UserManager extends AbstractManager {
```

- 负责 IM-通用主数据（`im_master-main`）用户信息 CRUD・检索的管理器。继承自 `AbstractManager`（持有更新者用户代码・默认区域设置・登录组 ID 的通用基类）
- 内部持有扩展点（`jp.co.intra_mart.foundation.master.accessor.user`），实际的读取/写入/通知/导入/导出均委托给插件实现（`UserReader`/`UserWriter`/`UserListener`/`UserImporter`/`UserExporter`）

## 构造函数

| 签名 | 概要 |
|---|---|
| `public UserManager() throws BizApiException` | **推荐。** 更新者用户代码・默认区域设置使用「当前登录用户」的值 |
| `public UserManager(String updateUserCd) throws BizApiException` | 显式指定更新者用户代码。默认区域设置为当前登录用户的区域设置 |
| `public UserManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 同时显式指定更新者用户代码・默认区域设置 |
| `public UserManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（请使用 `UserManager()`） |

类 JavaDoc 中明确说明省略参数时采用「当前登录用户」的值（`updateUserCd`/`defaultLocale` 可分别独立省略）。

## 异常

`jp.co.intra_mart.foundation.exception.BizApiException`（继承 `FoundationException` → `Exception` 的**受检异常**）。构造函数・公开方法几乎全部声明 `throws BizApiException`。

## 方法一览（用户本体・`User`）

均以 `IUserBizKey`（持有用户代码的接口，`User` 也实现该接口）作为参数起点。省略/传入 `null` 的 `locale` 将获取所有语言的国际化信息。`date` 为基准日（用于期间管理）。

```java
// 单体获取（4 个重载：是否带 locale / isDisable）
public User getUser(IUserBizKey bizKey, Date date) throws BizApiException;
public User getUser(IUserBizKey bizKey, Date date, boolean isDisable) throws BizApiException;
public User getUser(IUserBizKey bizKey, Date date, Locale locale) throws BizApiException;
public User getUser(IUserBizKey bizKey, Date date, Locale locale, boolean isDisable) throws BizApiException;

// 获取指定用户的所有期间
public User[] getUserList(IUserBizKey bizKey) throws BizApiException; // + 存在 Locale / isDisable 的重载

// 批量获取多个用户
public User[] getUsers(IUserBizKey[] bizKey, Date date) throws BizApiException; // + 存在 Locale / isDisable 的重载

// 条件检索・一览（list 系与 search 系拥有相同的签名结构。3 种模式：无附加参数/带 start・count/带 isDisable）
public UserListNode[] listUser(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public UserListNode[] listUser(AppCmnSearchCondition condition, Date date, Locale locale, int start, int count) throws BizApiException;
public UserListNode[] listUser(AppCmnSearchCondition condition, Date date, Locale locale, int start, int count, boolean isDisable) throws BizApiException;
public UserListNode[] searchUser(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // 结构相同的独立方法组

// 件数获取
public int countUser(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable 重载。locale 必须指定
public int totalUser(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable 重载。不指定 locale（面向所有语言）

// 新建/更新（根据期间代码是否存在自动判定。该方法无法变更期间本身）
public ITerm[] setUser(User user) throws BizApiException;

// 删除（3 个重载）
public void removeUser(IUserBizKey bizKey) throws BizApiException; // 删除所有语言（含关联信息）
public void removeUser(IUserBizKey bizKey, Locale locale) throws BizApiException; // 仅删除指定语言
public void removeUser(Locale locale) throws BizApiException; // 从所有用户中删除指定语言的数据

// 期间操作
public void mergeBackwardTermUser(IUserBizKey bizKey, String termCd) throws BizApiException; // 与前一期间合并
public void mergeForwardTermUser(IUserBizKey bizKey, String termCd) throws BizApiException; // 与后一期间合并
public ITerm[] moveTermUser(IUserBizKey bizKey, ITerm term) throws BizApiException; // 变更期间
public ITerm separateTermUser(IUserBizKey bizKey, String termCd, Date date) throws BizApiException; // 按指定日期分割期间
```

### `setUser` 的新建/更新判定

JavaDoc：「对于作为参数给出的用户信息，若未指定期间代码，则新建该用户信息；若已指定期间代码，则更新该用户信息。此方法无法变更期间。」

- `User` 的 `termCd`（源自 `ITerm` 接口）为 `null`/未设置 → 新建（返回值中包含新建的 `ITerm[]`）
- `termCd` 已设置 → 更新（返回值为空数组）
- **新建时（`termCd` 未设置时），`startDate`/`endDate` 均为必须项。** `AppCmnValidationManager.validateModel` 在 `termCd == null` 时会检查 `startDate`/`endDate` 是否非 null，以及是否满足 `startDate < endDate`；若未设置便调用 `setUser`，将抛出 `BizApiException`（「開始日にnullが設定されています」等信息）。应设置系统开始日（固定值 `1900/01/01`）〜系统结束日（默认值 `3000/01/01`，可通过扩展点 `jp.co.intra_mart.master.config.system_end_date` 变更）范围内的日期
- 若需变更期间本身，请使用 `moveTermUser`/`separateTermUser`/`mergeForwardTermUser`/`mergeBackwardTermUser`

## 方法一览（用户分类区分・分类区分项目）

与 `User` 相同结构的 CRUD・检索模式，同样适用于分类区分（`UserCtg`）・分类区分项目（`UserCtgItm`）。

```java
public UserCtg getUserCategory(IUserCtgBizKey bizKey) throws BizApiException; // + Locale 重载
public UserCtgItm getUserCategoryItem(IUserCtgItmBizKey bizKey) throws BizApiException; // + Locale 重载

public UserCtgListNode[] listUserCategory(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public UserCtgItmListNode[] listUserCategoryItem(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable

public int countUserCategory(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int countUserCategoryItem(AppCmnSearchCondition condition, Locale locale) throws BizApiException;

public void setUserCategory(UserCtg userCategory) throws BizApiException; // Upsert
public void setUserCategoryItem(UserCtgItm userCategoryItem) throws BizApiException; // Upsert

public void removeUserCategory(IUserCtgBizKey bizKey) throws BizApiException; // + Locale 重载、仅 Locale 的全件版
public void removeUserCategoryItem(IUserCtgItmBizKey bizKey) throws BizApiException; // + Locale 重载、仅 Locale 的全件版
```

### 用户⇔分类区分项目的归属关系

```java
// 授予归属（将分类区分项目与用户关联。带期间）
public void setUserCategoryItemAttach(IUserBizKey userBizKey, IUserCtgItmBizKey itemBizKey, ITerm term) throws BizApiException;
public void removeUserCategoryItemAttach(IUserBizKey userBizKey, IUserCtgItmBizKey itemBizKey, String termCd) throws BizApiException;
public ITerm getUserCategoryItemAttachTerm(IUserBizKey userBizKey, IUserCtgItmBizKey itemBizKey, Date date) throws BizApiException;
public ITerm[] getUserCategoryItemAttachTermList(IUserBizKey userBizKey, IUserCtgItmBizKey itemBizKey) throws BizApiException; // + isDisable

// 交叉检索（与特定用户关联的分类区分项目 / 已被授予特定分类区分项目的用户）
public UserCtgItmListNode[] listUserCategoryItemWithUser(IUserBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale, int start, int count, boolean isDisable) throws BizApiException;
public UserListNode[] listUserWithUserCategoryItem(IUserCtgItmBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale, int start, int count, boolean isDisable) throws BizApiException;
public int countUserCategoryItemWithUser(IUserBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countUserWithUserCategoryItem(IUserCtgItmBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
```

## `UserCtg` / `UserCtgItm` 模型类

```java
package jp.co.intra_mart.foundation.master.user.model;

public class UserCtg implements IUserCtgBizKey, ISortable, IDisable, IRecorder, IWithLocale<IUserCtgElement>, IUserCtgElement {
    private String categoryCd;      // 业务键
    private String categoryType;    // 分类类型（不属于 IUserCtgBizKey 的附带字段）
    private Locale defaultLocale;
    private final Map<Locale, IUserCtgElement> localeElementMap; // categoryName / notes
    private boolean disable;
    private int sortKey;
    private Date recordDate;
    private String recordUserCd;
}

public class UserCtgItm implements IUserCtgItmBizKey, ISortable, IDisable, IRecorder, IWithLocale<IUserCtgItmElement> {
    private String categoryCd;
    private String categoryItemCd;  // 业务键（与 categoryCd 共同构成复合键）
    private Locale defaultLocale;
    private final Map<Locale, IUserCtgItmElement> localeElementMap; // categoryItemName / notes
    private boolean disable;
    private int sortKey;
    private Date recordDate;
    private String recordUserCd;
}
```

两者均不实现期间管理（`ITerm`）。`IUserCtgBizKey`（`categoryCd`）・`IUserCtgItmBizKey`（`categoryCd`/`categoryItemCd`）为对应的业务键接口。与 `PublicGroupCtg`/`PublicGroupCtgItm`（参见 `reference/public-group-manager-api-reference.md`）结构几乎相同。

**`categoryType` 是 `varchar(1)` 的单字符列。** 虽然标注了 `@NotNullValidation`，但没有 `@LengthValidation`，因此 Java 端的校验无法检测超长值——设置2个字符以上时，只有在 SQL 执行阶段才会失败，抛出包裹 `PSQLException`（提示值过长）的 `BizApiException`。

**`IUserCtgElement#getNotes()`/`IUserCtgItmElement#getNotes()` 仅标注了 `@LengthValidation`，没有 `@NotNullValidation`（即该字段为可选项），但在其保持未设置（null）的状态下调用 `setUserCategory`/`setUserCategoryItem`，会抛出 `NullPointerException`。** 原因在于平台的校验实现（`LengthPropertyValidityChecker`）在对值调用 `toString()` 时没有做 null 检查。即使不使用 `notes`，也应显式设置为空字符串。

## 导入・导出

```java
public Set<String> getExportCategories(); // 无异常
public Set<String> getImportCategories(); // 无异常
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```

若 `categoryName` 不在对应的 Categories 范围内，将抛出 `BizApiException`（"Export category not found: ..." / "Import category not found: ..."）。

## `User` 模型类

```java
package jp.co.intra_mart.foundation.master.user.model;

public class User implements IUserBizKey, ISortable, IDisable, IRecorder, IWithLocale<IUserElement>, ITerm, IUserElement {
```

| 字段 | 类型 | 概要 |
|---|---|---|
| `userCd` | `String` | 用户代码（`IUserBizKey`） |
| `defaultLocale` | `Locale` | 默认区域设置 |
| `localeElementMap` | `Map<Locale, IUserElement>` | 按区域设置划分的国际化信息（`IWithLocale`） |
| `disable` | `boolean` | 逻辑删除标志 |
| `startDate` / `endDate` / `termCd` | `Date` / `Date` / `String` | 期间信息（`ITerm`） |
| `recordDate` / `recordUserCd` | `Date` / `String` | 更新日期・更新者用户代码（`IRecorder`） |
| `sex` | `String`（默认 `""`） | 性别。JavaDoc：`0: 男性 1: 女性 2: 其他 9: 不作答` |
| `sortKey` | `int` | 排序键（`ISortable`） |

国际化信息（`IUserElement`，可通过委托给默认区域设置的方式访问）：`userName`（姓名）、`userSearchName`（检索用姓名）、`address1`〜`address3`（地址）、`zipCode`（邮政编码）、`countryCd`（国家代码）、`telephoneNumber`（电话号码）、`extensionNumber`（分机号码）、`faxNumber`（传真号码）、`extensionFaxNumber`（分机传真号码）、`mobileNumber`（手机号码）、`emailAddress1`/`emailAddress2`（邮箱地址）、`mobileEmailAddress`（手机邮箱地址）、`url`（URL）、`notes`（备注）。

```java
// 委托给默认区域设置国际化信息的访问器示例
@Override
public IUserElement getDefaultLocaleElement() {
    return localeElementMap.get(defaultLocale);
}

@Override
public String getAddress1() {
    return getDefaultLocaleElement().getAddress1();
}

@Override
public void putLocaleElement(Locale locale, IUserElement element) {
    localeElementMap.put(locale, element);
}
```

`createLocaleElement()` 是生成新的 `IUserElement` 实现（`UserElement`）实例的工厂方法。按区域设置注册姓名・地址等信息时，须先通过 `putLocaleElement(locale, user.createLocaleElement())` 创建元素，再调用各 setter。

## `IUserBizKey` 接口

```java
package jp.co.intra_mart.foundation.master.user.model;

public interface IUserBizKey {
    String getUserCd();
    void setUserCd(String userCd);
}
```

仅持有用户代码的业务键。由于 `User` 实现了该接口，因此可将 `User` 实例直接作为 `IUserBizKey` 参数传递。若只想传递用户代码，可创建 `IUserBizKey` 的轻量实现类，或生成 `User` 后仅调用 `setUserCd`。

## 验证基础设施（补充）

各方法在处理主体之前，会通过以下工具类进行参数验证。验证出错时会抛出 `BizApiException` 系列异常。

- `jp.co.intra_mart.foundation.validation.ModelValidationManager` — `validateNotNull`（null 检查）、`validateProperty`（`IUserBizKey` 等属性验证）
- `jp.co.intra_mart.system.master.validation.AppCmnValidationManager` — `validateDateRange`（检查基准日是否在系统开始日〜结束日范围内）、`validateModel`（模型整体验证）、`validateTerm`/`convertTerm`（期间信息的验证・规范化）

## 主数据更新日志

新建・更新・删除系方法使用 `jp.co.intra_mart.system.log.masterlog.MasterLog`，在 `finally` 块中必定输出处理结果（成功/失败）的日志。日志消息 ID 遵循 `IM-MASTERLOG.IMMUserManager.<方法名>.<序号>` 的命名规约。应用侧无需显式调用日志（`UserManager` 内部会自动执行）。
