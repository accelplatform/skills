# IM Common Master (User / Company / Organization) Implementation Patterns (Java)

A collection of implementation patterns using `UserManager`/`CompanyManager`. Refer to `reference/user-manager-api-reference.md`/`reference/company-manager-api-reference.md` for exact method signatures.

## Common: Creating a Manager

```java
// Use the currently logged-in user as the updater and default locale (recommended)
final UserManager userManager = new UserManager();
final CompanyManager companyManager = new CompanyManager();
```

The constructors of `UserManager`/`CompanyManager`, and nearly every method covered below, throw the checked exception `jp.co.intra_mart.foundation.exception.BizApiException`. Handle it at the call site.

## Search Condition Basics (`AppCmnSearchCondition`)

The `list*`/`search*`/`count*`/`total*` methods take an `AppCmnSearchCondition` as their condition. `AppCmnSearchCondition` extends `SearchCondition`, and the target column is specified by passing a column-name string to `addCondition(String columnName, Object value[, Operator operator])` (inherited from `SearchCondition`). The column name is obtained from `toString()` (which returns the actual DB column name) on the enum corresponding to the target table (`ImmUserColumn`/`ImmCompanyColumn`/`ImmDepartmentColumn`/`ImmCompanyPostColumn`, etc. — all of which implement `ImmTableColumn`).

```java
import jp.co.intra_mart.foundation.database.Operator;
import jp.co.intra_mart.foundation.master.common.search.AppCmnSearchCondition;
import jp.co.intra_mart.foundation.master.user.model.ImmUserColumn;

final AppCmnSearchCondition condition = new AppCmnSearchCondition();
// Exact match (equivalent to EQ when Operator is omitted). ImmUserColumn is an ImmTableColumn implementation, not a SearchTarget — convert it with toString() before passing
condition.addCondition(ImmUserColumn.USER_CD.toString(), "user001");
// Partial match (LIKE). The caller assembles the wildcard
condition.addCondition(ImmUserColumn.USER_NAME.toString(), "%" + keyword + "%", Operator.LIKE);
```

**Note: `ImmUserColumn`, etc. cannot be passed to the `SearchTarget`-typed overload `addCondition(SearchTarget, Object[, Operator])` that `AppCmnSearchCondition` also has (`ImmTableColumn` and `SearchTarget` are unrelated interfaces/enums).** Always convert with `toString()` first and use the `addCondition(String, Object[, Operator])` family inherited from `SearchCondition`.

## Pattern 1: Retrieving a User

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
        // Passing the current date/time as date retrieves the user information for the term valid at that date
        return userManager.getUser(keyHolder, new Date());
    }
}
```

- Since `User` implements `IUserBizKey`, a `User` instance with only `userCd` set can be passed directly as a search key
- When the target user does not exist for the given term/date, `getUser` throws no exception and returns `null`

## Pattern 2: Searching Users (Keyword Search, Paging)

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

        final int start = (page - 1) * pageSize + 1; // start is 1-based
        return userManager.listUser(condition, new Date(), Locale.JAPANESE, start, pageSize);
    }
}
```

- Passing `0` for `count` retrieves all records (no paging)
- `locale` is required. Unlike the `getUser` family, which retrieves internationalized information for all languages when omitted, search methods require an explicit locale

## Pattern 3: Creating/Updating a User (`setUser`)

**On creation (when `termCd` is unset), both `startDate` and `endDate` must be set.** Calling `setUser` without them throws a `BizApiException` (something like "開始日にnullが設定されています" — "startDate is set to null"). The dates must fall within the system start date (fixed at `1900/01/01`) through the system end date (default `3000/01/01`, configurable via the `jp.co.intra_mart.master.config.system_end_date` extension point).

```java
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.user.UserManager;
import jp.co.intra_mart.foundation.master.user.model.IUserElement;
import jp.co.intra_mart.foundation.master.user.model.User;

public class UserRegistrationService {

    /** A project-wide "far future date" used as the end date when no expiry is intended (same as the system end date's default). */
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
        // Not setting termCd = treated as creation
        user.setStartDate(new Date()); // Required on creation
        user.setEndDate(FAR_FUTURE_DATE);

        final Locale locale = Locale.JAPANESE;
        user.setDefaultLocale(locale);
        final IUserElement element = user.createLocaleElement();
        element.setUserName(userName);
        user.putLocaleElement(locale, element);

        userManager.setUser(user); // Creation (because termCd is not set)
    }

    public void updateName(final String userCd, final Date baseDate, final String newName) throws BizApiException {
        final UserManager userManager = new UserManager();

        final User keyHolder = new User();
        keyHolder.setUserCd(userCd);

        // startDate/endDate are required on update too, so carry over the currently registered values
        // (leaving them unset throws a BizApiException because the target and specified dates are treated as differing)
        final User current = userManager.getUser(keyHolder, baseDate);

        final User user = new User();
        user.setUserCd(userCd);
        user.setTermCd(current.getTermCd()); // Setting termCd = treated as update
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

- **Whether it's a creation or an update is auto-decided solely by the presence of `termCd`.** The caller does not need to explicitly distinguish between a "creation method" and an "update method"
- **Both creation (`termCd` unset) and update (`termCd` set) require `startDate`/`endDate` to be set.** Leaving them unset (null) on an update throws a `BizApiException` ("the start/end dates of the target data and the specified data differ"), because it is treated as a mismatch against the values stored for the target record. On update, explicitly set the same values used at registration, or the currently registered values (retrieved via `get*`)
- For an update, the `User` passed to `setUser` must be built with not only the fields being changed but also every field that isn't (this is a full-object replacement, not a partial update). Retrieving the existing data with `getUser` first, changing only the necessary values, then passing it to `setUser` is the safer pattern
- To change the term itself (start/end dates), use `moveTermUser`/`separateTermUser`/`mergeForwardTermUser`/`mergeBackwardTermUser` instead of `setUser`

## Pattern 4: Retrieving/Updating a Company (Creation Is Not Possible)

**`updateCompany` is update-only against an existing company record; it cannot create a new company.** The standard implementation issues only a SQL `UPDATE` keyed on `company_cd`, and if the target does not exist, it throws no exception and simply completes without updating anything (this can easily look like the call "succeeded" even though nothing was created, so be careful). If a new company needs to be provisioned, confirm with the user whether it should go through `importData` (the import mechanism) or tenant setup import materials.

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
     * Updates the sort key of an existing company.
     * Note: if companyCd is not already registered, no exception occurs, but nothing is updated either.
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

**Note: `Company` only holds a company code, sort key, etc., and has no multilingual company-name field.** If a displayable company name is required, either design the name to be managed on the organization (`Department`) side, or consider a project-specific extension (see the constraints on the `Company` model in `reference/company-manager-api-reference.md`).

## Pattern 5: Creating/Updating an Organization and Retrieving the Hierarchy

**`DepartmentSet` shares the same constraint as `Company`: `updateDepartmentSet` is update-only against an existing record (creation is not possible).** `Department`/`CompanyPost` can be created via the `set*` pattern, but on creation `startDate`/`endDate` must be set (see Pattern 3).

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
     * Registers an organization. Assumes the target DepartmentSet has already been created
     * (e.g. via an import) beforehand.
     */
    public void register(final String companyCd, final String departmentSetCd, final String departmentCd, final String departmentName) throws BizApiException {
        final CompanyManager companyManager = new CompanyManager();

        final Department department = new Department();
        department.setCompanyCd(companyCd);
        department.setDepartmentSetCd(departmentSetCd);
        department.setDepartmentCd(departmentCd);
        // Not setting termCd = creation
        department.setStartDate(new Date()); // Required on creation
        department.setEndDate(FAR_FUTURE_DATE);

        final Locale locale = Locale.JAPANESE;
        department.setDefaultLocale(locale);
        final IDepartmentElement element = department.createLocaleElement();
        element.setDepartmentName(departmentName);
        department.putLocaleElement(locale, element);

        companyManager.setDepartment(department); // Same as User: creation vs. update decided by termCd presence
    }

    public DepartmentTreeNode getOrganizationTree(final IDepartmentSetBizKey departmentSetBizKey) throws BizApiException {
        final CompanyManager companyManager = new CompanyManager();
        return companyManager.getTree(departmentSetBizKey, new Date(), Locale.JAPANESE);
    }
}
```

- `setDepartment`'s creation/update decision follows the same rule as `setUser` based on `termCd` presence. On creation, `startDate`/`endDate` must also be set
- **`DepartmentSet` has only the single method `updateDepartmentSet`, which is update-only against an existing record (creation is not possible).** Before registering a `Department`, the `DepartmentSet` it references must already exist (created via an import or similar means)
- Use `getTree` when the whole organization hierarchy is needed, and `getBranch` for a partial sub-tree rooted at a specific organization (see `reference/company-manager-api-reference.md`)

## Pattern 6: User-to-Organization Attachment (Main-Attachment Flag)

**The `term` argument to `setUserAttach` cannot be `null`.** Internally, it always checks that `startDate`/`endDate` are non-null (required for both new grants and updates), so construct an instance of `jp.co.intra_mart.foundation.master.common.model.Term` with the dates set, and pass that.

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

        // term cannot be null — build a Term with startDate/endDate set (termCd left unset = a new grant)
        final Term term = new Term();
        term.setStartDate(new Date());
        term.setEndDate(FAR_FUTURE_DATE);

        companyManager.setUserAttach(department, user, term, true); // isDepartmentMain = true (main attachment)
    }

    public void unassign(final Department department, final User user) throws BizApiException {
        final CompanyManager companyManager = new CompanyManager();
        companyManager.removeUserAttach(department, user);
    }
}
```

- Since both `Department` and `User` implement their corresponding business key interfaces (`IDepartmentBizKey`/`IUserBizKey`), instances with only the codes set (company code/organization set code/organization code, or user code) can be passed directly
- Registering with `isDepartmentMain = true` automatically releases the existing main attachment (see `reference/company-manager-api-reference.md`)

## Pattern 7: Creating/Updating a Post

**On creation (when `termCd` is unset), both `startDate` and `endDate` must be set (see Pattern 3).**

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
        // Not setting termCd = creation
        companyPost.setStartDate(new Date()); // Required on creation
        companyPost.setEndDate(FAR_FUTURE_DATE);

        final Locale locale = Locale.JAPANESE;
        companyPost.setDefaultLocale(locale);
        final ICompanyPostElement element = companyPost.createLocaleElement();
        element.setPostName(postName);
        companyPost.putLocaleElement(locale, element);

        companyManager.setCompanyPost(companyPost); // Creation vs. update decided by termCd presence
    }
}
```

## Notes

- **`Company`/`DepartmentSet` each have an `updateCompany`/`updateDepartmentSet` method, but these are update-only against an existing record; they cannot create new ones.** The standard implementation issues only a SQL `UPDATE` keyed on the target code, and if the target doesn't exist, throws no exception and simply completes without updating anything. Provisioning a new company or organization set requires going through `importData` or tenant setup import materials
- **Creation/updating of `User`/`Department`/`CompanyPost` are all unified into a single method (`set*`) that auto-decides based on the presence of `termCd`, rather than "a dedicated creation method + a dedicated update method".** However, **on creation (when `termCd` is unset), both `startDate` and `endDate` must be set explicitly.** Calling without them throws a `BizApiException`
- **The `term` argument to `setUserAttach` does not accept `null`.** Always pass an instance of `jp.co.intra_mart.foundation.master.common.model.Term` with `startDate`/`endDate` set (required for both new grants and updates)
- **For models requiring multilingual support (`User`/`Department`/`CompanyPost`), the internationalized information (name, address, organization name, etc.) is not saved unless the procedure `setDefaultLocale` → `createLocaleElement()` → each setter → `putLocaleElement(locale, element)` is followed.** Setting only the key fields (codes) and calling `set*` registers the record with empty names, etc.
- **The `Company` model has no field for holding a multilingual name.** Design how to manage a company name separately, according to requirements
- **Search methods (`list*`/`search*`/`count*`) require `locale`.** Note the difference in behavior from single-retrieval methods like `getUser`/`getCompany`, which retrieve information in all languages when `locale` is omitted
- To change the term itself (start/end dates), use the term-operation method corresponding to the entity (`moveTerm*`/`separateTerm*`/`mergeForwardTerm*`/`mergeBackwardTerm*`) instead of `set*`
