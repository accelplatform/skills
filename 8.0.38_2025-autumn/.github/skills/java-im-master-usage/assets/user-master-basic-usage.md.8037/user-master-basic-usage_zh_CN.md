# IM-通用主数据（用户・公司・组织）实现模式（Java 版）

使用 `UserManager`/`CompanyManager` 的实现模式集。方法的准确签名请参照 `reference/user-manager-api-reference.md`/`reference/company-manager-api-reference.md`。

## 通用事项：管理器的创建

```java
// 使用当前登录用户作为更新者・默认区域设置（推荐）
final UserManager userManager = new UserManager();
final CompanyManager companyManager = new CompanyManager();
```

`UserManager`/`CompanyManager` 的构造函数，以及以下涉及的几乎全部方法，都会抛出受检异常 `jp.co.intra_mart.foundation.exception.BizApiException`。请在调用方进行处理。

## 检索条件（`AppCmnSearchCondition`）基础

`list*`/`search*`/`count*`/`total*` 系方法以 `AppCmnSearchCondition` 作为条件参数。`AppCmnSearchCondition` 继承自 `SearchCondition`，目标列通过向 `addCondition(String columnName, Object value[, Operator operator])`（继承自 `SearchCondition`）传递列名字符串来指定。列名可从与目标表对应的枚举类型（`ImmUserColumn`/`ImmCompanyColumn`/`ImmDepartmentColumn`/`ImmCompanyPostColumn` 等，均实现 `ImmTableColumn`）的 `toString()`（返回实际的 DB 列名）获取。

```java
import jp.co.intra_mart.foundation.database.Operator;
import jp.co.intra_mart.foundation.master.common.search.AppCmnSearchCondition;
import jp.co.intra_mart.foundation.master.user.model.ImmUserColumn;

final AppCmnSearchCondition condition = new AppCmnSearchCondition();
// 完全匹配（省略 Operator 时相当于 EQ）。ImmUserColumn 是 ImmTableColumn 的实现，并非 SearchTarget，须先通过 toString() 转为字符串再传递
condition.addCondition(ImmUserColumn.USER_CD.toString(), "user001");
// 部分匹配（LIKE）。通配符由调用方自行拼接
condition.addCondition(ImmUserColumn.USER_NAME.toString(), "%" + keyword + "%", Operator.LIKE);
```

**注意：`ImmUserColumn` 等无法传递给 `AppCmnSearchCondition` 同时拥有的 `SearchTarget` 类型重载 `addCondition(SearchTarget, Object[, Operator])`（`ImmTableColumn` 与 `SearchTarget` 是互不相关的独立接口/枚举）。** 务必先通过 `toString()` 转为字符串，再使用继承自 `SearchCondition` 的 `addCondition(String, Object[, Operator])` 系列方法。

## 模式 1：获取用户

```java
import java.util.Date;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.user.UserManager;
import jp.co.intra_mart.foundation.master.user.model.User;

public class UserLookupService {

    public User findByUserCd(final String userCd) throws BizApiException {
        final UserManager userManager = new UserManager();
        final User keyHolder = new User();
        keyHolder.setUserCd(userCd);
        // 传入当前日期时间作为 date，将获取该日期时点有效期间内的用户信息
        return userManager.getUser(keyHolder, new Date());
    }
}
```

- 由于 `User` 实现了 `IUserBizKey`，因此可将仅设置了 `userCd` 的 `User` 实例直接作为检索键传递
- 指定的期间・日期不存在对应用户时，`getUser` 不会抛出异常，而是返回 `null`

## 模式 2：用户检索（关键字检索・分页）

```java
import java.util.Date;
import java.util.Locale;

import jp.co.intra_mart.foundation.database.Operator;
import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.common.search.AppCmnSearchCondition;
import jp.co.intra_mart.foundation.master.user.UserManager;
import jp.co.intra_mart.foundation.master.user.model.ImmUserColumn;
import jp.co.intra_mart.foundation.master.user.model.UserListNode;

public class UserSearchService {

    public UserListNode[] searchByName(final String keyword, final int page, final int pageSize) throws BizApiException {
        final UserManager userManager = new UserManager();

        final AppCmnSearchCondition condition = new AppCmnSearchCondition();
        condition.addCondition(ImmUserColumn.USER_NAME.toString(), "%" + keyword + "%", Operator.LIKE);

        final int start = (page - 1) * pageSize + 1; // start 从 1 开始
        return userManager.listUser(condition, new Date(), Locale.JAPANESE, start, pageSize);
    }
}
```

- `count` 指定为 `0` 时将获取全部记录（不分页）
- `locale` 为必须项。与省略时会获取所有语言国际化信息的 `getUser` 系方法不同，检索系方法必须显式指定区域设置

## 模式 3：用户的新建・更新（`setUser`）

**新建时（未设置 `termCd` 时），`startDate`/`endDate` 均为必须项。** 未设置便调用 `setUser`，将抛出 `BizApiException`（类似「開始日にnullが設定されています」——「开始日期被设置为 null」）。所设置的日期须处于系统开始日（固定值 `1900/01/01`）〜系统结束日（默认值 `3000/01/01`，可通过扩展点 `jp.co.intra_mart.master.config.system_end_date` 变更）的范围内。

```java
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.user.UserManager;
import jp.co.intra_mart.foundation.master.user.model.IUserElement;
import jp.co.intra_mart.foundation.master.user.model.User;

public class UserRegistrationService {

    /** 不设定期限时用作结束日期的项目通用「遥远的未来日期」（与系统结束日的默认值相同）。 */
    private static final Date FAR_FUTURE_DATE = buildFarFutureDate();

    private static Date buildFarFutureDate() {
        final Calendar calendar = Calendar.getInstance();
        calendar.set(3000, Calendar.JANUARY, 1, 0, 0, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    public void register(final String userCd, final String userName) throws BizApiException {
        final UserManager userManager = new UserManager();

        final User user = new User();
        user.setUserCd(userCd);
        // 不设置 termCd = 视为新建
        user.setStartDate(new Date()); // 新建时必须设置 startDate/endDate
        user.setEndDate(FAR_FUTURE_DATE);

        final Locale locale = Locale.JAPANESE;
        user.setDefaultLocale(locale);
        final IUserElement element = user.createLocaleElement();
        element.setUserName(userName);
        user.putLocaleElement(locale, element);

        userManager.setUser(user); // 新建（因为未设置 termCd）
    }

    public void updateName(final String userCd, final Date baseDate, final String newName) throws BizApiException {
        final UserManager userManager = new UserManager();

        final User keyHolder = new User();
        keyHolder.setUserCd(userCd);

        // 更新时也必须设置 startDate/endDate，因此沿用当前已注册的值
        // （保持未设置会被视为与目标数据已存储的值不一致，从而抛出 BizApiException）
        final User current = userManager.getUser(keyHolder, baseDate);

        final User user = new User();
        user.setUserCd(userCd);
        user.setTermCd(current.getTermCd()); // 设置 termCd = 视为更新
        user.setStartDate(current.getStartDate());
        user.setEndDate(current.getEndDate());

        final Locale locale = Locale.JAPANESE;
        user.setDefaultLocale(locale);
        final IUserElement element = user.createLocaleElement();
        element.setUserName(newName);
        user.putLocaleElement(locale, element);

        userManager.setUser(user);
    }
}
```

- **是新建还是更新，仅根据 `termCd` 是否存在自动判定。** 调用方无需显式区分「新建方法」「更新方法」
- **无论新建（未设置 `termCd`）还是更新（设置了 `termCd`），均须设置 `startDate`/`endDate`。** 更新时若保持未设置（null），会被视为与目标数据中已存储的值不一致，从而抛出 `BizApiException`（「対象データと指定されたデータの開始日、終了日が異なります」，即目标数据与指定数据的开始日、结束日不一致）。更新时须显式设置与注册时相同的值，或当前已注册的值（通过 `get*` 获取）
- 更新时，传给 `setUser` 的 `User` 不仅需要包含想要更新的字段，还须包含不需变更的字段（这是整体传递方式，而非局部更新方式）。先通过 `getUser` 获取既有数据，仅修改必要的值后再传给 `setUser`，是较为安全的模式
- 若需变更期间本身（开始日期・结束日期），请使用 `moveTermUser`/`separateTermUser`/`mergeForwardTermUser`/`mergeBackwardTermUser`，而非 `setUser`

## 模式 4：公司的获取・更新（无法新建）

**`updateCompany` 仅是针对既有公司记录的更新专用方法，无法新建公司。** 标准实现仅发出以 `company_cd` 为条件的 SQL `UPDATE` 语句，若目标不存在，不会抛出异常，只是在未更新任何内容的情况下正常结束（这容易让人误以为调用「成功」了，实际上却什么都没创建，须特别注意）。若需要准备新公司，须向用户确认是通过 `importData`（导入功能）还是租户环境搭建资材完成投入。

```java
import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.company.CompanyManager;
import jp.co.intra_mart.foundation.master.company.model.Company;

public class CompanyService {

    public Company find(final String companyCd) throws BizApiException {
        final CompanyManager companyManager = new CompanyManager();
        final Company keyHolder = new Company();
        keyHolder.setCompanyCd(companyCd);
        return companyManager.getCompany(keyHolder);
    }

    /**
     * 更新既有公司的排序键。
     * 注意：若 companyCd 尚未注册，不会抛出异常，但也不会执行任何更新。
     */
    public void updateSortKey(final String companyCd, final int sortKey) throws BizApiException {
        final CompanyManager companyManager = new CompanyManager();
        final Company company = new Company();
        company.setCompanyCd(companyCd);
        company.setSortKey(sortKey);
        companyManager.updateCompany(company);
    }
}
```

**注意：`Company` 仅持有公司代码・排序键等信息，不含多语言公司名称字段。** 若需要显示公司名称，需在组织（`Department`）侧设计名称管理机制，或考虑项目自身的扩展（关于 `Company` 模型的限制，请参照 `reference/company-manager-api-reference.md`）。

## 模式 5：组织的新建・更新与层级结构获取

**`DepartmentSet` 与 `Company` 具有相同的限制，`updateDepartmentSet` 仅是针对既有记录的更新专用（无法新建）。** `Department`/`CompanyPost` 可通过 `set*` 模式新建，但新建时须设置 `startDate`/`endDate`（参照模式 3）。

```java
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.company.CompanyManager;
import jp.co.intra_mart.foundation.master.company.model.Department;
import jp.co.intra_mart.foundation.master.company.model.DepartmentTreeNode;
import jp.co.intra_mart.foundation.master.company.model.IDepartmentElement;
import jp.co.intra_mart.foundation.master.company.model.IDepartmentSetBizKey;

public class DepartmentService {

    private static final Date FAR_FUTURE_DATE = buildFarFutureDate();

    private static Date buildFarFutureDate() {
        final Calendar calendar = Calendar.getInstance();
        calendar.set(3000, Calendar.JANUARY, 1, 0, 0, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    /**
     * 注册组织。以目标 DepartmentSet 已（通过导入等方式）预先创建完成为前提。
     */
    public void register(final String companyCd, final String departmentSetCd, final String departmentCd, final String departmentName) throws BizApiException {
        final CompanyManager companyManager = new CompanyManager();

        final Department department = new Department();
        department.setCompanyCd(companyCd);
        department.setDepartmentSetCd(departmentSetCd);
        department.setDepartmentCd(departmentCd);
        // 不设置 termCd = 新建
        department.setStartDate(new Date()); // 新建时必须设置 startDate/endDate
        department.setEndDate(FAR_FUTURE_DATE);

        final Locale locale = Locale.JAPANESE;
        department.setDefaultLocale(locale);
        final IDepartmentElement element = department.createLocaleElement();
        element.setDepartmentName(departmentName);
        department.putLocaleElement(locale, element);

        companyManager.setDepartment(department); // 与 User 相同，根据 termCd 是否存在判定新建/更新
    }

    public DepartmentTreeNode getOrganizationTree(final IDepartmentSetBizKey departmentSetBizKey) throws BizApiException {
        final CompanyManager companyManager = new CompanyManager();
        return companyManager.getTree(departmentSetBizKey, new Date(), Locale.JAPANESE);
    }
}
```

- `setDepartment` 的新建/更新判定与 `setUser` 相同，均依据 `termCd` 是否存在。新建时还须设置 `startDate`/`endDate`
- **`DepartmentSet` 仅拥有 `updateDepartmentSet` 一个方法，且仅为针对既有记录的更新专用（无法新建）。** 注册 `Department` 之前，其所引用的 `DepartmentSet` 必须已经（通过导入等手段）创建完成
- 需要组织层级结构整体时使用 `getTree`，以特定组织为起点获取部分树时使用 `getBranch`（参照 `reference/company-manager-api-reference.md`）

## 模式 6：用户的组织归属（主归属标志）

**`setUserAttach` 的 `term` 参数不可传入 `null`。** 内部始终会检查 `startDate`/`endDate` 是否非 null（无论新建归属还是更新均为必须项），因此须生成设置了日期的 `jp.co.intra_mart.foundation.master.common.model.Term` 实例后传递。

```java
import java.util.Calendar;
import java.util.Date;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.common.model.Term;
import jp.co.intra_mart.foundation.master.company.CompanyManager;
import jp.co.intra_mart.foundation.master.company.model.Department;
import jp.co.intra_mart.foundation.master.user.model.User;

public class UserDepartmentAssignmentService {

    private static final Date FAR_FUTURE_DATE = buildFarFutureDate();

    private static Date buildFarFutureDate() {
        final Calendar calendar = Calendar.getInstance();
        calendar.set(3000, Calendar.JANUARY, 1, 0, 0, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    public void assignAsMainDepartment(final Department department, final User user) throws BizApiException {
        final CompanyManager companyManager = new CompanyManager();

        // term 不可为 null，须生成设置了 startDate/endDate 的 Term（termCd 保持不设置 = 新建归属）
        final Term term = new Term();
        term.setStartDate(new Date());
        term.setEndDate(FAR_FUTURE_DATE);

        companyManager.setUserAttach(department, user, term, true); // isDepartmentMain = true（主归属）
    }

    public void unassign(final Department department, final User user) throws BizApiException {
        final CompanyManager companyManager = new CompanyManager();
        companyManager.removeUserAttach(department, user);
    }
}
```

- 由于 `Department`/`User` 均实现了对应的业务键接口（`IDepartmentBizKey`/`IUserBizKey`），因此可将仅设置了代码（公司代码・组织集合代码・组织代码／用户代码）的实例直接传递
- 以 `isDepartmentMain = true` 注册为主归属时，既有的主归属将被自动解除（参照 `reference/company-manager-api-reference.md`）

## 模式 7：职位的新建・更新

**新建时（未设置 `termCd` 时），`startDate`/`endDate` 均为必须项（参照模式 3）。**

```java
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.company.CompanyManager;
import jp.co.intra_mart.foundation.master.company.model.CompanyPost;
import jp.co.intra_mart.foundation.master.company.model.ICompanyPostElement;

public class CompanyPostService {

    private static final Date FAR_FUTURE_DATE = buildFarFutureDate();

    private static Date buildFarFutureDate() {
        final Calendar calendar = Calendar.getInstance();
        calendar.set(3000, Calendar.JANUARY, 1, 0, 0, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    public void register(final String companyCd, final String departmentSetCd, final String postCd, final String postName, final int rank) throws BizApiException {
        final CompanyManager companyManager = new CompanyManager();

        final CompanyPost companyPost = new CompanyPost();
        companyPost.setCompanyCd(companyCd);
        companyPost.setDepartmentSetCd(departmentSetCd);
        companyPost.setPostCd(postCd);
        companyPost.setRank(rank);
        // 不设置 termCd = 新建
        companyPost.setStartDate(new Date()); // 新建时必须设置 startDate/endDate
        companyPost.setEndDate(FAR_FUTURE_DATE);

        final Locale locale = Locale.JAPANESE;
        companyPost.setDefaultLocale(locale);
        final ICompanyPostElement element = companyPost.createLocaleElement();
        element.setPostName(postName);
        companyPost.putLocaleElement(locale, element);

        companyManager.setCompanyPost(companyPost); // 根据 termCd 是否存在判定新建/更新
    }
}
```

## 注意事项

- **`Company`/`DepartmentSet` 虽拥有 `updateCompany`/`updateDepartmentSet` 方法，但这些方法仅是针对既有记录的更新专用，无法新建。** 标准实现仅发出以目标代码为条件的 SQL `UPDATE` 语句，若目标不存在，不会抛出异常，只是在未更新任何内容的情况下正常结束。若需要新建公司・组织集合，须通过 `importData` 或租户环境搭建资材完成
- **`User`/`Department`/`CompanyPost` 的新建・更新，均统一为「并非专用的新建方法 + 专用的更新方法」，而是通过单一方法（`set*`）根据 `termCd` 是否存在自动判定。** 但**新建时（`termCd` 未设置时）须显式设置 `startDate`/`endDate`。** 未设置便调用，将抛出 `BizApiException`
- **`setUserAttach` 的 `term` 参数不接受 `null`。** 须始终传递设置了 `startDate`/`endDate` 的 `jp.co.intra_mart.foundation.master.common.model.Term` 实例（无论新建归属还是更新均为必须项）
- **需要多语言支持的模型（`User`/`Department`/`CompanyPost`），若不遵循 `setDefaultLocale` → `createLocaleElement()` → 各 setter → `putLocaleElement(locale, element)` 的步骤，国际化信息（姓名・地址・组织名称等）将不会被保存。** 仅设置键项目（代码类）后调用 `set*`，名称等信息将以空值注册
- **`Company` 模型不含用于保存多语言名称的字段。** 公司名称的管理方式需根据需求另行设计
- **检索系方法（`list*`/`search*`/`count*`）必须指定 `locale`。** 请注意这与 `getUser`/`getCompany` 等单体获取系方法——省略 `locale` 时将获取所有语言信息——的行为差异
- 若需变更期间本身（开始日期・结束日期），请使用各实体对应的期间操作方法（`moveTerm*`/`separateTerm*`/`mergeForwardTerm*`/`mergeBackwardTerm*`），而非 `set*`
