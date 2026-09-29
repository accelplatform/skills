# IM Common Master Group (Public/Private/Company/Corporation) Implementation Patterns (Java)

A collection of implementation patterns using `PublicGroupManager`/`PrivateGroupManager`/`CompanyGroupManager`/`CorporationGroupManager`. Consult the corresponding reference under `reference/` for the exact method signatures.

## Common: Creating a Manager

```java
// Use the currently logged-in user as the updater and default locale (recommended)
final PublicGroupManager publicGroupManager = new PublicGroupManager();
final PrivateGroupManager privateGroupManager = new PrivateGroupManager();
final CompanyGroupManager companyGroupManager = new CompanyGroupManager();
final CorporationGroupManager corporationGroupManager = new CorporationGroupManager();
```

All four classes throw the checked exception `jp.co.intra_mart.foundation.exception.BizApiException`. Handle it at the call site.

## Basics of Search Conditions (`AppCmnSearchCondition`)

The same design as `UserManager`/`CompanyManager` in `java-im-master-usage`. For the column specification passed to `AppCmnSearchCondition` in `list*`/`search*`/`count*`/`total*` methods, obtain it from the `toString()` (which returns the actual DB column name) of the corresponding enum (`ImmPublicGroupColumn`/`ImmCompanyGroupColumn`/`ImmCorporationGroupColumn`, etc., all implementing `ImmTableColumn`).

```java
import jp.co.intra_mart.foundation.database.Operator;
import jp.co.intra_mart.foundation.master.common.search.AppCmnSearchCondition;
import jp.co.intra_mart.foundation.master.company_group.model.ImmCompanyGroupColumn;

final AppCmnSearchCondition condition = new AppCmnSearchCondition();
condition.addCondition(ImmCompanyGroupColumn.COMPANY_GROUP_CD.toString(), "group001");
condition.addCondition(ImmCompanyGroupColumn.COMPANY_GROUP_NAME.toString(), "%" + keyword + "%", Operator.LIKE);
```

**The enum cannot be passed to the `SearchTarget`-argument overload of `AppCmnSearchCondition`.** Always convert it to a string with `toString()` first, then use `addCondition(String, Object[, Operator])`.

## Pattern 1: Retrieving/Searching Public Groups

```java
import java.util.Date;
import java.util.Locale;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.public_group.PublicGroupManager;
import jp.co.intra_mart.foundation.master.public_group.model.PublicGroup;
import jp.co.intra_mart.foundation.master.public_group.model.PublicGroupBizKey;

public class PublicGroupLookupService {

    public PublicGroup find(final String publicGroupSetCd, final String publicGroupCd) throws BizApiException {
        final PublicGroupManager publicGroupManager = new PublicGroupManager();
        final PublicGroupBizKey keyHolder = new PublicGroupBizKey();
        keyHolder.setPublicGroupSetCd(publicGroupSetCd);
        keyHolder.setPublicGroupCd(publicGroupCd);
        // Passing the current date/time to date retrieves the public group information valid as of that date
        return publicGroupManager.getPublicGroup(keyHolder, new Date(), Locale.JAPANESE);
    }
}
```

- When the target does not exist, `getPublicGroup` returns `null` rather than throwing an exception
- `PublicGroupBizKey` is a lightweight implementation class of `IPublicGroupBizKey`. It can be passed as a key by setting only the codes (`publicGroupSetCd`/`publicGroupCd`)

## Pattern 2: Retrieving the Public Group Hierarchy (Tree)

```java
import java.util.Date;
import java.util.Locale;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.public_group.PublicGroupManager;
import jp.co.intra_mart.foundation.master.public_group.model.IPublicGroupSetBizKey;
import jp.co.intra_mart.foundation.master.public_group.model.PublicGroupTreeNode;

public class PublicGroupTreeService {

    public PublicGroupTreeNode getTree(final IPublicGroupSetBizKey publicGroupSetBizKey) throws BizApiException {
        final PublicGroupManager publicGroupManager = new PublicGroupManager();
        return publicGroupManager.getTree(publicGroupSetBizKey, new Date(), Locale.JAPANESE);
    }
}
```

- Use `getTree` for the tree of an entire public group set, and `getBranch` for a subtree rooted at a specific public group
- Public groups have category (`PublicGroupCategory`/`CategoryItem`-equivalent) and role (`PublicGroupRole`) management features, which is a difference from the other group classes. See `reference/public-group-manager-api-reference.md` for details

## Pattern 3: Creating a Private Group and Linking It to a User

```java
import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.private_group.PrivateGroupManager;
import jp.co.intra_mart.foundation.master.private_group.model.PrivateGroup;
import jp.co.intra_mart.foundation.master.private_group.model.PrivateGroupBizKey;
import jp.co.intra_mart.foundation.master.user.model.User;

public class PrivateGroupService {

    public void register(final String privateGroupCd, final String ownerUserCd, final String groupName) throws BizApiException {
        final PrivateGroupManager privateGroupManager = new PrivateGroupManager();

        final PrivateGroup privateGroup = new PrivateGroup();
        privateGroup.setPrivateGroupCd(privateGroupCd);
        privateGroup.setUserCd(ownerUserCd); // Owner code (the userCd in IPrivateGroupBizKey means the "owner")
        privateGroup.setPrivateGroupName(groupName);

        privateGroupManager.setPrivateGroup(privateGroup);
    }

    public void addMember(final String privateGroupCd, final String ownerUserCd, final User member, final int sortKey) throws BizApiException {
        final PrivateGroupManager privateGroupManager = new PrivateGroupManager();

        final PrivateGroupBizKey privateGroupBizKey = new PrivateGroupBizKey();
        privateGroupBizKey.setPrivateGroupCd(privateGroupCd);
        privateGroupBizKey.setUserCd(ownerUserCd);

        privateGroupManager.setUserAttach(privateGroupBizKey, member, sortKey);
    }

    public void removeMember(final String privateGroupCd, final String ownerUserCd, final User member) throws BizApiException {
        final PrivateGroupManager privateGroupManager = new PrivateGroupManager();

        final PrivateGroupBizKey privateGroupBizKey = new PrivateGroupBizKey();
        privateGroupBizKey.setPrivateGroupCd(privateGroupCd);
        privateGroupBizKey.setUserCd(ownerUserCd);

        privateGroupManager.removeUserAttach(privateGroupBizKey, member);
    }
}
```

- Since `PrivateGroup` does not implement `ITerm`, there is no creation-vs-update decision based on the presence of `termCd`, unlike `User`/`Department`. The same `setPrivateGroup`/`setUserAttach` is called for both creation and update, and whether the target data exists is determined internally (on the extension point side)
- The business key of `IPrivateGroupBizKey` is the pair "private group code + owner code." Note that `userCd` here does not mean the general "target user being operated on" but rather the "owner of the group"

## Pattern 4: Retrieving/Searching Company Groups

```java
import java.util.Date;
import java.util.Locale;

import jp.co.intra_mart.foundation.database.Operator;
import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.common.search.AppCmnSearchCondition;
import jp.co.intra_mart.foundation.master.company_group.CompanyGroupManager;
import jp.co.intra_mart.foundation.master.company_group.model.CompanyGroupListNode;
import jp.co.intra_mart.foundation.master.company_group.model.ImmCompanyGroupColumn;

public class CompanyGroupSearchService {

    public CompanyGroupListNode[] searchByName(final String keyword, final int page, final int pageSize) throws BizApiException {
        final CompanyGroupManager companyGroupManager = new CompanyGroupManager();

        final AppCmnSearchCondition condition = new AppCmnSearchCondition();
        condition.addCondition(ImmCompanyGroupColumn.COMPANY_GROUP_NAME.toString(), "%" + keyword + "%", Operator.LIKE);

        final int start = (page - 1) * pageSize + 1; // start is 1-based
        return companyGroupManager.searchCompanyGroup(condition, new Date(), Locale.JAPANESE, start, pageSize);
    }
}
```

- Search methods (`list*`/`search*`/`count*`) require `locale`
- The association between a company group and a company (`Company`) is operated via `setCompanyAttach`/`removeCompanyAttach` (the same design philosophy as `setUserAttach` in `java-im-master-usage`)

## Pattern 5: Retrieving/Searching Corporation Groups (Scoped to a Company Code)

```java
import java.util.Date;
import java.util.Locale;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.corporation_group.CorporationGroupManager;
import jp.co.intra_mart.foundation.master.corporation_group.model.CorporationGroup;
import jp.co.intra_mart.foundation.master.corporation_group.model.CorporationGroupBizKey;
import jp.co.intra_mart.foundation.master.corporation_group.model.CorporationGroupSet;

public class CorporationGroupService {

    public CorporationGroup find(final String companyCd, final String corporationGroupSetCd, final String corporationGroupCd) throws BizApiException {
        final CorporationGroupManager corporationGroupManager = new CorporationGroupManager();

        final CorporationGroupBizKey keyHolder = new CorporationGroupBizKey();
        keyHolder.setCompanyCd(companyCd);
        keyHolder.setCorporationGroupSetCd(corporationGroupSetCd);
        keyHolder.setCorporationGroupCd(corporationGroupCd);

        return corporationGroupManager.getCorporationGroup(keyHolder, new Date());
    }

    /**
     * Retrieves only the corporation group sets belonging to the specified company.
     * Note that the no-argument version getCorporationGroupSetAll() retrieves the corporation group sets of all companies.
     */
    public CorporationGroupSet[] listSetsByCompany(final String companyCd) throws BizApiException {
        final CorporationGroupManager corporationGroupManager = new CorporationGroupManager();
        return corporationGroupManager.getCorporationGroupSetAll(companyCd);
    }
}
```

- The business key of a corporation group consists of three elements: `companyCd`/`corporationGroupSetCd`/`corporationGroupCd` (one more element than a company group)
- Do not confuse the two overloads `getCorporationGroupSetAll()` (no arguments, targets all companies) and `getCorporationGroupSetAll(String companyCd)` (scoped to a company)

## Notes

- **Single-retrieval methods (`get*`) return `null` rather than throwing an exception when the target does not exist.** Always perform a null check on the caller side
- **The feature scope is not the same across the four classes.** Only the public group has category, role, and tree features; the private group has no category, role, or tree features and is a minimal configuration centered on user linking
- **The creation-vs-update decision for a private group is not based on the presence of `termCd`.** `PrivateGroup` does not implement `ITerm`, and the decision is made on the extension point side (`PrivateGroupWriter`) based on whether the target data exists
- **Unlike the company group, the corporation group model additionally holds `companyCd`.** Note that the number of elements in the business key differs
- For the column specification passed to `AppCmnSearchCondition` in search methods (`list*`/`search*`/`count*`), convert it to a string via the `toString()` of the corresponding enum before passing it
- All four classes throw the checked exception `BizApiException`. Always declare `throws` or use `try-catch` at the call site
