# PublicGroupManager API Reference (Java)

Based on the actual class definitions of the `im_master-main` module (`jp.co.intra_mart.foundation.master.public_group.*`). Do not supplement methods or attributes from memory or guesswork.

## Class Overview

```java
package jp.co.intra_mart.foundation.master.public_group;

/**
 * Manager class that retrieves and manages public group information
 * @since 7.2
 */
public class PublicGroupManager extends AbstractManager {
```

**This single class handles public groups (PublicGroup), public group sets (PublicGroupSet), public group categories/category items (PublicGroupCtg/PublicGroupCtgItm), and public group roles (PublicGroupRole).**

Internally, like `CompanyManager`/`UserManager`, it delegates processing to a plugin implementation (`PublicGroupReader`/`PublicGroupWriter`/`PublicGroupListener`/`PublicGroupImporter`/`PublicGroupExporter`) via an extension point (default `jp.co.intra_mart.foundation.master.accessor.public_group`). However, `PublicGroupManager` has no public method equivalent to `changeExecutor(String)` (runtime switching of the extension point) found on `CompanyManager`/`UserManager`. Extension point setup is performed only by the internal-only `setUpExecutor()`, called from the constructor.

## Constructors

| Signature | Overview |
|---|---|
| `public PublicGroupManager() throws BizApiException` | **Recommended.** Uses the value of the "currently logged-in user" for the update user code and default locale |
| `public PublicGroupManager(String updateUserCd) throws BizApiException` | Explicitly specifies the update user code |
| `public PublicGroupManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | Explicitly specifies both the update user code and default locale |
| `public PublicGroupManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`** (use `PublicGroupManager()` instead) |

When arguments are omitted, the value of the "currently logged-in user" is adopted.

## Exceptions

`jp.co.intra_mart.foundation.exception.BizApiException` (checked exception). The constructors, CRUD methods, and search methods all consistently declare only this exception (only `getExportCategories()`/`getImportCategories()` declare no exception).

## Public Group (`PublicGroup`) Methods

For the `getPublicGroup` family, if the target does not exist, no exception is thrown and `null` is returned.

```java
public PublicGroup getPublicGroup(IPublicGroupBizKey bizKey, Date date) throws BizApiException; // overloads with Locale/isDisable combinations exist (4 variants total)

public PublicGroupListNode[] listPublicGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public PublicGroupListNode[] searchPublicGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // a separate family with the same shape as listPublicGroup

public int countPublicGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalPublicGroup(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable. No locale argument

public ITerm[] setPublicGroup(PublicGroup publicGroup) throws BizApiException; // create or update (auto-determined by presence of the term code)

public void removePublicGroup(IPublicGroupBizKey bizKey) throws BizApiException; // deletes all locales and related information
public void removePublicGroup(IPublicGroupBizKey bizKey, Locale locale) throws BizApiException; // for a specific locale only
public void removePublicGroup(Locale locale) throws BizApiException; // deletes data for a specific locale from all public groups
```

Unlike `Company`/`Department`, `PublicGroup` can be both created and updated via `setPublicGroup` (the pattern that auto-determines based on the presence of the term code `termCd`).

### Public Group Inclusion (Parent-Child Relationship) Operations

```java
public void setPublicGroupInclusion(IPublicGroupBizKey bizKey, String parentPublicGroupCd, String childPublicGroupCd) throws BizApiException;
public void removePublicGroupInclusion(IPublicGroupBizKey bizKey, String childPublicGroupCd) throws BizApiException;
```

### Term Operations

`mergeBackwardTermPublicGroup`/`mergeForwardTermPublicGroup`/`moveTermPublicGroup`/`separateTermPublicGroup` exist (the same design as `Department`/`CompanyPost`).

## Public Group Set (`PublicGroupSet`) Methods

`PublicGroupSet` has only 4 fields: `publicGroupSetCd`/`recordDate`/`recordUserCd`/`sortKey`; like `Company`/`DepartmentSet`, it has no multilingual name field and does not implement `ITerm`. **There is no `setPublicGroupSet` (creation method); `updatePublicGroupSet` is update-only for existing records.**

```java
public PublicGroupSet getPublicGroupSet(IPublicGroupSetBizKey bizKey) throws BizApiException;
public PublicGroupSet[] getPublicGroupSetAll() throws BizApiException;

public void updatePublicGroupSet(PublicGroupSet publicGroupSet) throws BizApiException; // update-only for existing records
public void removePublicGroupSet(IPublicGroupSetBizKey bizKey) throws BizApiException;

public void changePublicGroupSetState(IPublicGroupSetBizKey bizKey, String termCd, boolean disable) throws BizApiException; // updates the disable flag for the specified term
```

`mergeBackwardTermPublicGroupSet`/`mergeForwardTermPublicGroupSet`/`moveTermPublicGroupSet`/`separateTermPublicGroupSet` also exist. These do not operate on the term of the `PublicGroupSet` entity itself, but on the term of the **public group tree structure returned by `getTree`** underneath it.

## Public Group Category (`PublicGroupCtg`) / Category Item (`PublicGroupCtgItm`) Methods

Handles `PublicGroupCtg` (category code `categoryCd` + category type `categoryType` + multilingual name + disable flag) and `PublicGroupCtgItm` (category code `categoryCd` + category item code `categoryItemCd` + multilingual name + disable flag). Neither implements term management (`ITerm`).

```java
// Category (PublicGroupCtg)
public PublicGroupCtg getPublicGroupCategory(IPublicGroupCtgBizKey bizKey) throws BizApiException; // + Locale
public PublicGroupCtgListNode[] listPublicGroupCategory(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + start/count, isDisable
public PublicGroupCtgListNode[] searchPublicGroupCategory(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int countPublicGroupCategory(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int totalPublicGroupCategory(AppCmnSearchCondition condition) throws BizApiException;
public void setPublicGroupCategory(PublicGroupCtg publicGroupCtg) throws BizApiException; // create or update
public void removePublicGroupCategory(IPublicGroupCtgBizKey bizKey) throws BizApiException; // + Locale overload, and a Locale-only all-records variant

// Category item (PublicGroupCtgItm)
public PublicGroupCtgItm getPublicGroupCategoryItem(IPublicGroupCtgItmBizKey bizKey) throws BizApiException; // + Locale
public PublicGroupCtgItmListNode[] listPublicGroupCategoryItem(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + start/count, isDisable
public PublicGroupCtgItmListNode[] searchPublicGroupCategoryItem(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int countPublicGroupCategoryItem(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int totalPublicGroupCategoryItem(AppCmnSearchCondition condition) throws BizApiException;
public void setPublicGroupCategoryItem(PublicGroupCtgItm publicGroupCtgItm) throws BizApiException; // create or update
public void removePublicGroupCategoryItem(IPublicGroupCtgItmBizKey bizKey) throws BizApiException; // + Locale overload, and a Locale-only all-records variant
```

### Associating Public Groups with Category Items

```java
// Associate (attach)
public void setPublicGroupCategoryItemAttach(IPublicGroupBizKey publicGroupBizKey, IPublicGroupCtgItmBizKey categoryItemBizKey, ITerm term) throws BizApiException;
// Disassociate
public void removePublicGroupCategoryItemAttach(IPublicGroupBizKey publicGroupBizKey, IPublicGroupCtgItmBizKey categoryItemBizKey, String termCd) throws BizApiException;

// Search for public groups associated with a category item
public PublicGroupListNode[] listPublicGroupWithPublicGroupCategoryItem(IPublicGroupCtgItmBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public PublicGroupListNode[] searchPublicGroupWithPublicGroupCategoryItem(IPublicGroupCtgItmBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countPublicGroupWithPublicGroupCategoryItem(IPublicGroupCtgItmBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int totalPublicGroupWithPublicGroupCategoryItem(IPublicGroupCtgItmBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException;

// Search for category items associated with a public group
public PublicGroupCtgItmListNode[] listPublicGroupCategoryItemWithPublicGroup(IPublicGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public PublicGroupCtgItmListNode[] searchPublicGroupCategoryItemWithPublicGroup(IPublicGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countPublicGroupCategoryItemWithPublicGroup(IPublicGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int totalPublicGroupCategoryItemWithPublicGroup(IPublicGroupBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException;
```

Each family also has an overload that adds an `isDisable` argument.

## Public Group Role (`PublicGroupRole`) Methods

`PublicGroupRole` has a composite key of `publicGroupSetCd`/`roleCd` + term management (`termCd`/`startDate`/`endDate`) + multilingual name + a `rank` field — a model shape nearly identical to `Department`/`CompanyPost`.

```java
public PublicGroupRole getPublicGroupRole(IPublicGroupRoleBizKey bizKey, Date date) throws BizApiException; // overloads with Locale/isDisable combinations exist (4 variants total)

public PublicGroupRoleListNode[] listPublicGroupRole(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public PublicGroupRoleListNode[] searchPublicGroupRole(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countPublicGroupRole(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int totalPublicGroupRole(AppCmnSearchCondition condition, Date date) throws BizApiException;

public ITerm[] setPublicGroupRole(PublicGroupRole publicGroupRole) throws BizApiException; // create or update (auto-determined by presence of the term code)

public void removePublicGroupRole(IPublicGroupRoleBizKey bizKey) throws BizApiException; // + Locale overload, and a Locale-only all-records variant
```

`mergeBackwardTermPublicGroupRole`/`mergeForwardTermPublicGroupRole`/`moveTermPublicGroupRole`/`separateTermPublicGroupRole` also exist.

### Assigning Roles to Users (`PublicGroupRoleAttach`)

Assigns a role to a user belonging to a public group. There is no dedicated model class; this is manipulated via `setPublicGroupRoleAttach`/`removePublicGroupRoleAttach`.

```java
public ITerm[] setPublicGroupRoleAttach(IPublicGroupBizKey publicGroupBizKey, IUserBizKey userBizKey, IPublicGroupRoleBizKey roleBizKey, String termCd) throws BizApiException;
public void removePublicGroupRoleAttach(IPublicGroupBizKey publicGroupBizKey, IUserBizKey userBizKey, IPublicGroupRoleBizKey roleBizKey, String termCd) throws BizApiException;
```

### Role-Centric Searches for Users / Public Groups

Many method families exist for searching users/public groups filtered by role.

```java
// Search for roles a given user holds on a specific public group
public PublicGroupRoleListNode[] listPublicGroupRoleWithUserOnPublicGroup(IUserBizKey userBizKey, IPublicGroupBizKey publicGroupBizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;

// Search for users holding a specific role on a specific public group
public UserListNode[] listUserWithPublicGroupRoleOnPublicGroup(IPublicGroupRoleBizKey roleBizKey, IPublicGroupBizKey publicGroupBizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
// Variant that takes a List of (role, public group) key pairs as the condition
public UserListNode[] listUserWithPublicGroupRoleOnPublicGroup(List bizKeyList, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;

// Search for users holding a specific role (not limited to a public group)
public UserListNode[] listUserWithPublicGroupRole(IPublicGroupRoleBizKey roleBizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;

// List of public groups with roles held by a user
public AttachPublicGroupListNode[] listPublicGroupWithUserRole(IUserBizKey userBizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
```

The four families `list*`/`search*`/`count*`/`total*` each exist for `WithUserOnPublicGroup`/`WithPublicGroupRoleOnPublicGroup`/`WithPublicGroupRole` (single-key version and `List`-of-keys version) — this combinatorial pattern accounts for most of the 82 `*PublicGroup*` methods total. Refer to `PublicGroupManager.java` for every individual signature.

## Tree Operations

A family of methods for retrieving/operating on the tree (`PublicGroupTreeNode`) rooted at a `PublicGroupSet`.

```java
public PublicGroupTreeNode getTree(IPublicGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable. The entire tree for the public group set
public PublicGroupTreeNode getBranch(IPublicGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // the lower sub-tree (branch) rooted at the specified public group
public PublicGroupTreeNode getUpBranch(IPublicGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // the upward branch
public PublicGroupListNode[] getChildren(IPublicGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // immediate children
public PublicGroupListNode[] getParent(IPublicGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // parent
public PublicGroupListNode[] getIsolation(IPublicGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // isolated nodes not present in the tree
public PublicGroupTreeNode[] listTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public PublicGroupTreeNode[] searchTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int totalTreeRoot(AppCmnSearchCondition condition, Date date) throws BizApiException;
```

`getAbsoluteBranch`/`getAbsoluteUpBranch`/`getAbsoluteChildren`/`getAbsoluteParent`/`getAbsoluteIsolation` (absolute-position variants that also include logically deleted/disabled data) also exist.

## Model Classes

### `PublicGroup`

```java
package jp.co.intra_mart.foundation.master.public_group.model;

public class PublicGroup implements IPublicGroupElement, IPublicGroupBizKey, ISortable, IDisable, IRecorder, IWithLocale<IPublicGroupElement>, ITerm {
    private Locale defaultLocale;
    private boolean disable;
    private Date endDate;
    private final Map<Locale, IPublicGroupElement> localeElementMap; // multilingual name
    private String publicGroupCd;
    private String publicGroupSetCd;
    private Date recordDate;
    private String recordUserCd;
    private int sortKey;
    private Date startDate;
    private String termCd;
}
```

Like `Department`, this is the central model that has a composite key (`publicGroupCd`/`publicGroupSetCd`) + term management (`ITerm`) + a multilingual name (`IWithLocale`), forming the hierarchical structure (public group tree).

### `PublicGroupSet`

```java
public class PublicGroupSet implements IPublicGroupSetBizKey, ISortable, IRecorder {
    private String publicGroupSetCd;
    private Date recordDate;
    private String recordUserCd;
    private int sortKey;
}
```

### `PublicGroupCtg` / `PublicGroupCtgItm`

```java
public class PublicGroupCtg implements IPublicGroupCtgElement, IPublicGroupCtgBizKey, ISortable, IDisable, IRecorder, IWithLocale<IPublicGroupCtgElement> {
    private String categoryCd;
    private String categoryType;
    private Locale defaultLocale;
    private boolean disable;
    private final Map<Locale, IPublicGroupCtgElement> localeElementMap;
    private Date recordDate;
    private String recordUserCd;
    private int sortKey;
}

public class PublicGroupCtgItm implements IPublicGroupCtgItmElement, IPublicGroupCtgItmBizKey, ISortable, IDisable, IRecorder, IWithLocale<IPublicGroupCtgItmElement> {
    private String categoryCd;
    private String categoryItemCd;
    private Locale defaultLocale;
    private boolean disable;
    private final Map<Locale, IPublicGroupCtgItmElement> localeElementMap;
    private Date recordDate;
    private String recordUserCd;
    private int sortKey;
}
```

Neither implements term management (`ITerm`).

### `PublicGroupRole`

```java
public class PublicGroupRole implements IPublicGroupRoleBizKey, IPublicGroupRoleElement, ISortable, IDisable, IRecorder, IWithLocale<IPublicGroupRoleElement>, ITerm {
    private Locale defaultLocale;
    private boolean disable;
    private Date endDate;
    private final Map<Locale, IPublicGroupRoleElement> localeElementMap;
    private String publicGroupSetCd;
    private int rank;
    private Date recordDate;
    private String recordUserCd;
    private String roleCd;
    private int sortKey;
    private Date startDate;
    private String termCd;
}
```

### Business Key Interfaces / Implementation Classes

```java
public interface IPublicGroupBizKey {
    String getPublicGroupCd();
    String getPublicGroupSetCd();
    void setPublicGroupCd(String publicGroupCd);
    void setPublicGroupSetCd(String publicGroupSetCd);
}

public class PublicGroupBizKey implements IPublicGroupBizKey {
    // no-arg constructor + setPublicGroupCd/setPublicGroupSetCd
}

public class PublicGroupRoleBizKey implements IPublicGroupRoleBizKey {
    private String publicGroupSetCd;
    private String roleCd;
    // no-arg constructor + setPublicGroupSetCd/setRoleCd
}
```

`IPublicGroupSetBizKey` (`publicGroupSetCd` only), `IPublicGroupCtgBizKey` (`categoryCd`), and `IPublicGroupCtgItmBizKey` (`categoryCd`/`categoryItemCd`) also exist following the same pattern.

### `PublicGroupListNode` / `PublicGroupTreeNode`

```java
public class PublicGroupListNode implements ListNode, IPublicGroupBizKey {
    private String description = "";
    boolean disable;
    private String displayName = "";
    private String publicGroupCd;
    private String publicGroupSetCd;
    private String shortName = "";

    public String getDescription();
    public String getDisplayName();
    public String getPublicGroupCd();
    public String getPublicGroupSetCd();
    public boolean isDisable();
    public String getShortName();
}

public class PublicGroupTreeNode extends PublicGroupListNode implements TreeNode<PublicGroupTreeNode> {
    private List<PublicGroupTreeNode> childNodeList;

    public void addChild(PublicGroupTreeNode child);
    public PublicGroupTreeNode[] getChildren();
    public boolean hasChildren();
    public PublicGroupTreeNode removeChild(PublicGroupTreeNode child);
}
```

`PublicGroupRoleListNode`/`PublicGroupCtgListNode`/`PublicGroupCtgItmListNode`/`AttachPublicGroupListNode` also exist, each with the business key and display fields (`description`/`displayName`/`shortName`, etc.) of their corresponding model.

## Import / Export

```java
public Set<String> getExportCategories(); // no exception
public Set<String> getImportCategories(); // no exception
public void exportData(String categoryName, InputStream inputStream) throws BizApiException; // the parameter is named inputStream but is used for the export process (configuration file input stream)
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```
