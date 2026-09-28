# IM-通用主数据 分组相关（公开/私有/公司/法人）实现模式（Java 版）

使用 `PublicGroupManager`/`PrivateGroupManager`/`CompanyGroupManager`/`CorporationGroupManager` 的实现模式集合。方法的准确签名请参照 `reference/` 下对应的参考资料。

## 通用事项：管理类的创建

```java
// 使用当前登录用户作为更新者・默认区域设置（推荐）
final PublicGroupManager publicGroupManager = new PublicGroupManager();
final PrivateGroupManager privateGroupManager = new PrivateGroupManager();
final CompanyGroupManager companyGroupManager = new CompanyGroupManager();
final CorporationGroupManager corporationGroupManager = new CorporationGroupManager();
```

四个类均会抛出受检异常 `jp.co.intra_mart.foundation.exception.BizApiException`。须在调用方处理。

## 检索条件（`AppCmnSearchCondition`）基础

与 `java-im-master-usage` 的 `UserManager`/`CompanyManager` 设计相同。传递给 `list*`/`search*`/`count*`/`total*` 系列方法的 `AppCmnSearchCondition` 的列指定，须从对应枚举类型（`ImmPublicGroupColumn`/`ImmCompanyGroupColumn`/`ImmCorporationGroupColumn` 等，均实现 `ImmTableColumn`）的 `toString()`（返回实际的数据库列名）中获取。

```java
import jp.co.intra_mart.foundation.database.Operator;
import jp.co.intra_mart.foundation.master.common.search.AppCmnSearchCondition;
import jp.co.intra_mart.foundation.master.company_group.model.ImmCompanyGroupColumn;

final AppCmnSearchCondition condition = new AppCmnSearchCondition();
condition.addCondition(ImmCompanyGroupColumn.COMPANY_GROUP_CD.toString(), "group001");
condition.addCondition(ImmCompanyGroupColumn.COMPANY_GROUP_NAME.toString(), "%" + keyword + "%", Operator.LIKE);
```

**枚举类型无法传递给 `AppCmnSearchCondition` 的 `SearchTarget` 参数版重载。** 须先通过 `toString()` 转换为字符串，再使用 `addCondition(String, Object[, Operator])`。

## 模式 1：公开分组的获取・检索

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
        // 若向 date 传递当前日期时间，将获取该日期时间点处于有效期间内的公开分组信息
        return publicGroupManager.getPublicGroup(keyHolder, new Date(), Locale.JAPANESE);
    }
}
```

- 若对象不存在，`getPublicGroup` 不会抛出异常，而是返回 `null`
- `PublicGroupBizKey` 是 `IPublicGroupBizKey` 的轻量级实现类。只需设置代码（`publicGroupSetCd`/`publicGroupCd`）即可作为键传递

## 模式 2：公开分组的层级结构（树）获取

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

- 公开分组集合整体的树使用 `getTree`，以特定公开分组为起点的部分树使用 `getBranch`
- 公开分组具备分类（相当于 `PublicGroupCategory`/`CategoryItem`）・角色（`PublicGroupRole`）的管理功能，这是与其他分组相关类的差异所在。详情请参照 `reference/public-group-manager-api-reference.md`

## 模式 3：私有分组的新建・用户关联

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
        privateGroup.setUserCd(ownerUserCd); // 所有者代码（IPrivateGroupBizKey 的 userCd 表示「所有者」）
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

- 由于 `PrivateGroup` 未实现 `ITerm`，因此不像 `User`/`Department` 那样根据 `termCd` 的有无来判定新建/更新。无论新建还是更新均调用相同的 `setPrivateGroup`/`setUserAttach`，对象数据是否存在由内部（扩展点一侧）判定
- `IPrivateGroupBizKey` 的业务键是「私有分组代码 + 所有者代码」的组合。须注意 `userCd` 并非一般意义上的「操作对象用户」，而是表示「分组的所有者」

## 模式 4：公司分组的获取・检索

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

        final int start = (page - 1) * pageSize + 1; // start 从 1 开始
        return companyGroupManager.searchCompanyGroup(condition, new Date(), Locale.JAPANESE, start, pageSize);
    }
}
```

- 检索系（`list*`/`search*`/`count*`）必须指定 `locale`
- 公司分组与公司（`Company`）的关联通过 `setCompanyAttach`/`removeCompanyAttach` 操作（与 `java-im-master-usage` 中 `setUserAttach` 相同的设计思路）

## 模式 5：法人分组的获取・检索（限定公司代码）

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
     * 仅获取指定公司所属的法人分组集合。
     * 须注意无参数版的 getCorporationGroupSetAll() 会获取所有公司的法人分组集合。
     */
    public CorporationGroupSet[] listSetsByCompany(final String companyCd) throws BizApiException {
        final CorporationGroupManager corporationGroupManager = new CorporationGroupManager();
        return corporationGroupManager.getCorporationGroupSetAll(companyCd);
    }
}
```

- 法人分组的业务键由 `companyCd`/`corporationGroupSetCd`/`corporationGroupCd` 三个要素构成（比公司分组多一个要素）
- 不要混淆 `getCorporationGroupSetAll()`（无参数，面向所有公司）与 `getCorporationGroupSetAll(String companyCd)`（限定公司）这两种重载

## 注意事项

- **单体获取系（`get*`）在对象不存在时不会抛出异常，而是返回 `null`。** 调用方须务必进行空值检查
- **四个类的功能范围并不相同。** 仅公开分组具备分类・角色・树功能，私有分组不具备分类・角色・树功能，以用户关联为主的最小化配置
- **私有分组的新建/更新判定并非基于 `termCd` 的有无。** `PrivateGroup` 未实现 `ITerm`，其判定由扩展点一侧（`PrivateGroupWriter`）根据对象数据是否存在来进行
- **法人分组的模型与公司分组不同，额外持有 `companyCd`。** 须注意业务键的要素数量有所不同
- 检索系方法（`list*`/`search*`/`count*`）传递给 `AppCmnSearchCondition` 的列指定，须先通过对应枚举类型的 `toString()` 转换为字符串后再传递
- 四个类均会抛出受检异常 `BizApiException`。调用方须务必声明 `throws` 或使用 `try-catch`
