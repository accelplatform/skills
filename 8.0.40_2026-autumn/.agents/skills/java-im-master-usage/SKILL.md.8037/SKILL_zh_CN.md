---
name: java-im-master-usage
description: 用于在 Java（JavaEE 开发模型）中使用 intra-mart 特有的 IM-通用主数据 API（`UserManager`/`CompanyManager`/分组系4个类（`Public|Private|Company|Corporation`）/`CorporationManager`/`CustomerManager`/`ItemCategoryManager`/`ItemManager`/`CurrencyManager`，均属于 `jp.co.intra_mart.foundation.master.*`、`im_master-main` 模块）的技能集。提供用户・公司・组织・组织集合・职位・用户组织归属，公开/私有/公司/法人分组，法人・取引方・品目分类・品目・货币（含 `CurrencyConversion`/`CurrencyPrecision`/`CurrencyRate`）的获取・检索・新建・更新・删除，以及组织/公开分组/品目分类层级结构（树）获取、用户分类・公开分组分类・组织分类（`UserCtg`/`PublicGroupCtg`/`DepartmentCtg` 等）获取的实现模式。当用户提及想在 Java 中处理用户・公司・组织・分组・法人・取引方・品目・货币的基本信息、想使用上述任一 Manager 类、想在 JavaEE 开发模型中实现 IM-通用主数据的 CRUD、想获取组织层级结构或分组层级结构・品目分类层级结构时使用。用户头像图片请使用 `java-im-profile-usage`，角色定义・角色分配请使用 `java-im-role-usage`/`java-im-account-usage`，认可请使用 `java-im-authz-usage`。
---

# intra-mart IM-通用主数据 API（Java 版）使用支持技能

## 目的

支持使用 intra-mart Accel Platform 面向 **JavaEE 开发模型** 提供的 IM-通用主数据 API，在 Java 代码中对用户・公司・组织・职位・公开/私有/公司/法人分组的基本信息进行 CRUD 与检索的技能集。

## 类结构（重要）

**「公司」「组织」「职位」「用户的组织归属」均由 `CompanyManager` 这一个类处理。** 不存在与 `DepartmentManager`/`OrganizationManager` 相当的独立类（通过对 `jp.co.intra_mart.foundation.master.*` 下所有 `*Manager` 类进行全数确认后得出的事实）。与此相对，**分组系每种类型各自拥有一个专用的管理类**（并非像 `CompanyManager` 那样由一个类兼顾多个对象的结构）。

| 对象 | 负责类 | 包 | 模型类 |
|---|---|---|---|
| 用户信息 | `UserManager` | `jp.co.intra_mart.foundation.master.user` | `User`（+ 分类 `UserCtg`/`UserCtgItm`） |
| 公司 | `CompanyManager` | `jp.co.intra_mart.foundation.master.company` | `Company`（仅有公司代码・排序键。**不含多语言名称，无法通过 Java API 新建**） |
| 组织・组织集合 | `CompanyManager` | 同上 | `Department`/`DepartmentSet`（+ 组织分类 `DepartmentCtg`/`DepartmentCtgItm`） |
| 职位 | `CompanyManager` | 同上 | `CompanyPost` |
| 用户的组织归属（含主归属标志） | `CompanyManager`（`setUserAttach`/`removeUserAttach`） | 同上 | 无专用模型 |
| 公开分组 | `PublicGroupManager` | `jp.co.intra_mart.foundation.master.public_group` | `PublicGroup`（+ 分组集合 `PublicGroupSet`、分类 `PublicGroupCtg`/`PublicGroupCtgItm`、角色 `PublicGroupRole`） |
| 私有分组 | `PrivateGroupManager` | `jp.co.intra_mart.foundation.master.private_group` | `PrivateGroup` |
| 公司分组 | `CompanyGroupManager` | `jp.co.intra_mart.foundation.master.company_group` | `CompanyGroup`（+ 分组集合 `CompanyGroupSet`） |
| 法人分组 | `CorporationGroupManager` | `jp.co.intra_mart.foundation.master.corporation_group` | `CorporationGroup`（+ 分组集合 `CorporationGroupSet`） |
| 法人 | `CorporationManager` | `jp.co.intra_mart.foundation.master.corporation` | `Corporation`（+ 与取引方的归属关系）。**与 `CorporationGroupManager`（法人分组）是不同的类** |
| 取引方 | `CustomerManager` | `jp.co.intra_mart.foundation.master.customer` | `Customer`。CRUD・检索方法名不含实体名，为通用命名（`get`/`set`/`remove`/`list`/`search`/`count`/`total`） |
| 品目分类 | `ItemCategoryManager` | `jp.co.intra_mart.foundation.master.item_category` | `ItemCategory`（+ 集合 `ItemCategorySet`、层级结构树、与品目的归属关系）。方法名使用 `Category` 表记 |
| 品目 | `ItemManager` | `jp.co.intra_mart.foundation.master.item` | `Item`。与 `CustomerManager` 同型的通用方法名 |
| 货币 | `CurrencyManager` | `jp.co.intra_mart.foundation.master.currency` | `Currency`/`CurrencyConversion`/`CurrencyPrecision`/`CurrencyRate`（仅 `CurrencyRate` 具备期间管理） |

所有类均属于 `im_master-main` 模块，继承自 `AbstractManager`。不存在与「法人分组」相当的别名类（如 `HoldingGroup` 等），`CorporationGroupManager`/`CorporationGroup` 即为对应类。

**`Company`/`DepartmentSet` 虽拥有 `updateCompany`/`updateDepartmentSet` 方法，但这些方法仅是针对既有记录的更新专用，仅凭 `CompanyManager`（Java API）无法新建。** 标准实现仅发出以目标代码为条件的 SQL `UPDATE` 语句，若目标不存在，不会抛出异常，只是在未更新任何内容的情况下正常结束。新建公司・组织集合须通过 `importData` 或租户环境搭建资材完成。而 `User`/`Department`/`CompanyPost`/用户组织归属，则均采用「通过单一 `set*` 方法、根据期间代码（`termCd`）是否存在自动判定新建或更新」的通用模式，这些可通过 Java API 新建。**须注意不同实体是否可新建这一点有所差异。**

**这四个分组类的 API 规模・功能范围差异很大。**

- **公开分组（`PublicGroupManager`）是四个类中 API 规模最大的。** 除分组本体・分组集合外，还具备分类（类别・类别项目）・角色的管理功能，以及 `getTree`/`getBranch`/`getChildren`/`getParent`/`getAbsoluteXxx` 系列的树操作。其余三个类不具备分类・角色管理功能
- **公司分组・法人分组（`CompanyGroupManager`/`CorporationGroupManager`）是同系列的中等规模 API。** 具备分组・分组集合的 CRUD・检索・期间操作（`moveTerm*`/`mergeForwardTerm*`/`mergeBackwardTerm*`/`separateTerm*`）
- **法人分组的模型（`CorporationGroup`/`ICorporationGroupBizKey` 等）与公司分组几乎同型，差异在于额外持有 `companyCd`（公司代码）。** `CorporationGroupManager#getCorporationGroupSetAll()` 存在无参数版与 `(String companyCd)` 版（仅获取指定公司所属的分组集合）两种
- **私有分组（`PrivateGroupManager`）是四个类中规模最小的 API。** 不具备分类・角色・树功能，以分组本体的 CRUD・检索以及与用户的关联（`setUserAttach`/`removeUserAttach`/`*WithPrivateGroup` 系列）为主

**法人・取引方・品目分类・品目・货币这 5 个类也各自拥有独立的 API 规模。**

- **品目分类（`ItemCategoryManager`）是这 5 个类中 API 规模最大的。** 除分类本体・分类集合外，还具备与 `Department`/`CorporationGroup` 同型的层级结构（树）操作、以及与品目的交叉检索功能（仅 `ItemCategoryManager.java` 一个文件就超过 4,800 行）
- **法人（`CorporationManager`）・取引方（`CustomerManager`）・品目（`ItemManager`）是不具备分类・树功能的简单 CRUD 结构。** 仅法人额外拥有与取引方的归属关系（`setCorporationAttach` 等）
- **取引方・品目的 CRUD・检索方法名不含实体名，为通用命名（`get`/`set`/`remove`/`list`/`search`/`count`/`total`），且 `search`/`list`/`count`/`total` 的第一个参数为 `companyCd`（公司范围）。** 须注意这与 `UserManager`/`CompanyManager` 等的命名规则不同
- **货币（`CurrencyManager`）在一个类中处理 4 种实体（`Currency`/`CurrencyConversion`/`CurrencyPrecision`/`CurrencyRate`）。** 其中仅 `CurrencyRate` 具备期间管理（`ITerm`），其余 3 种的 `set*` 均为返回 `void` 的简单 upsert

分类（`UserCtg`/`UserCtgItm`・`PublicGroupCtg`/`PublicGroupCtgItm`・`DepartmentCtg`/`DepartmentCtgItm`）分别是 `UserManager`/`PublicGroupManager`/`CompanyManager` 所包含的功能，不存在独立的管理类。`UserCtg`/`PublicGroupCtg` 的业务键仅为分类代码，但**仅 `DepartmentCtg`/`DepartmentCtgItm` 包含 `companyCd`（组织分类以公司为范围）**。

详细的属性签名、完整方法列表请务必参照 `reference/` 下各类专用的参考资料（不要凭记忆或推测编写——合计超过 14 个类，是非常庞大的 API，切勿凭空实现）。

## 应参照的规约

| 规约 | 处理方式 |
|------|---------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **必读** — 包・类・方法・变量命名 |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **必读** — `final` 局部变量、字符串字面量等 |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **必读** — 类/方法 JavaDoc |

`.agents/requirements` 下不存在 IM-通用主数据实现的 Java 专用规约。异常处理・多语言信息的注册步骤请遵循 `assets/user-master-basic-usage.md`，分组系的异常处理・检索条件的构建方式请遵循 `assets/group-master-basic-usage.md` 中的模式。

`jssp-*` 系列规约不适用于本技能（不应用于 Java 文件）。

## API 概要

`UserManager`/`CompanyManager` 均属于 `im_master-main` 模块，继承自 `AbstractManager`。默认构造函数 `UserManager()`/`CompanyManager()` 会将「当前登录用户」的值用作更新者用户代码与默认区域设置。两个类的公开方法几乎全部声明了受检异常 `jp.co.intra_mart.foundation.exception.BizApiException`。

四个分组类（`PublicGroupManager`/`PrivateGroupManager`/`CompanyGroupManager`/`CorporationGroupManager`）同样属于 `im_master-main` 模块，继承自 `AbstractManager`。均拥有 4 种共通构造函数（`()` / `(String updateUserCd)` / `(String updateUserCd, Locale defaultLocale)` / `(String updateUserCd, Locale defaultLocale, String loginGroupId)`；第 4 种已标注 `@Deprecated`），省略参数时将使用「当前登录用户」的值。几乎所有方法都一致声明了 `BizApiException`。**分组系的单体获取系（`get*`）在对象不存在时不会抛出异常，而是返回 `null`。** `count*`/`search*`/`list*` 以 `AppCmnSearchCondition`、基准日期（`Date`）、`Locale` 作为条件接收。所有分组类均拥有 `importData`/`exportData`/`getImportCategories`/`getExportCategories`。

法人・取引方・品目分类・品目・货币这 5 个类（`CorporationManager`/`CustomerManager`/`ItemCategoryManager`/`ItemManager`/`CurrencyManager`）同样遵循相同的 4 种构造函数模式、`BizApiException` 声明、`get*` 返回 `null`、`importData`/`exportData`。

详细信息请务必参照 `reference/` 下对应的参考资料（不要凭记忆或推测编写）。

## 生成对象与模板

| 生成对象 | 模板 | 内容 |
|---------|------------|------|
| 获取用户 | `assets/user-master-basic-usage.md` 模式 1 | `getUser` 的调用示例 |
| 检索用户（关键字・分页） | `assets/user-master-basic-usage.md` 模式 2 | 使用 `AppCmnSearchCondition`/`ImmUserColumn` 的 `listUser` |
| 用户的新建・更新 | `assets/user-master-basic-usage.md` 模式 3 | `setUser`（根据 `termCd` 自动判定，新建时须设置 `startDate`/`endDate`）、多语言信息的注册步骤 |
| 公司的获取・更新 | `assets/user-master-basic-usage.md` 模式 4 | `getCompany`/`updateCompany`（仅为更新专用，注意无法新建） |
| 组织的新建・更新、层级结构获取 | `assets/user-master-basic-usage.md` 模式 5 | `setDepartment`、`getTree`（`DepartmentSet` 须预先存在） |
| 用户的组织归属（主归属标志） | `assets/user-master-basic-usage.md` 模式 6 | `setUserAttach`/`removeUserAttach`（`term` 参数不可为 `null`） |
| 职位的新建・更新 | `assets/user-master-basic-usage.md` 模式 7 | `setCompanyPost`（新建时须设置 `startDate`/`endDate`） |
| 公开分组的获取・检索 | `assets/group-master-basic-usage.md` 模式 1 | `getPublicGroup`/`searchPublicGroup` 的调用示例 |
| 公开分组的层级结构（树）获取 | `assets/group-master-basic-usage.md` 模式 2 | `getTree`/`getBranch` |
| 私有分组的新建・用户关联 | `assets/group-master-basic-usage.md` 模式 3 | `setPrivateGroup`/`setUserAttach`/`removeUserAttach` |
| 公司分组的获取・检索 | `assets/group-master-basic-usage.md` 模式 4 | `getCompanyGroup`/`searchCompanyGroup` |
| 法人分组的获取・检索（限定公司代码） | `assets/group-master-basic-usage.md` 模式 5 | `getCorporationGroup`/`getCorporationGroupSetAll(companyCd)` |
| 法人的获取・新建，与取引方的关联 | `assets/business-master-basic-usage.md` 模式 1〜2 | `getCorporation`/`setCorporation`/`setCorporationAttach` |
| 取引方的检索（限定公司代码・分页） | `assets/business-master-basic-usage.md` 模式 3 | `CustomerManager#search`（第一个参数为 `companyCd`） |
| 品目分类的层级结构获取、与品目的关联检索 | `assets/business-master-basic-usage.md` 模式 4 | `getTree`/`getItemWithCategory` |
| 品目的新建 | `assets/business-master-basic-usage.md` 模式 5 | `ItemManager#set`（根据 `termCd` 自动判定） |
| 货币汇率的注册・获取 | `assets/business-master-basic-usage.md` 模式 6 | `setCurrencyRate`（具备期间管理）/`getCurrencyRate` |

### 参考资料

- `reference/user-manager-api-reference.md` — `UserManager`/`User`/`IUserBizKey`/`UserCtg`/`UserCtgItm` 的全部方法、签名
- `reference/company-manager-api-reference.md` — `CompanyManager`/`Company`/`Department`/`CompanyPost`/`DepartmentCtg`/`DepartmentCtgItm` 的全部方法、签名
- `reference/public-group-manager-api-reference.md` — `PublicGroupManager`/`PublicGroup`/`IPublicGroupBizKey`/`PublicGroupCtg`/`PublicGroupCtgItm` 等的全部方法・签名
- `reference/private-group-manager-api-reference.md` — `PrivateGroupManager`/`PrivateGroup`/`IPrivateGroupBizKey` 的全部方法・签名
- `reference/company-group-manager-api-reference.md` — `CompanyGroupManager`/`CompanyGroup`/`ICompanyGroupBizKey` 等的全部方法・签名
- `reference/corporation-group-manager-api-reference.md` — `CorporationGroupManager`/`CorporationGroup`/`ICorporationGroupBizKey` 等的全部方法・签名
- `reference/corporation-manager-api-reference.md` — `CorporationManager`/`Corporation`/`ICorporationBizKey` 的全部方法・签名
- `reference/customer-manager-api-reference.md` — `CustomerManager`/`Customer`/`ICustomerBizKey` 的全部方法・签名
- `reference/item-category-manager-api-reference.md` — `ItemCategoryManager`/`ItemCategory`/`ItemCategorySet`/`IItemCategoryBizKey` 等的全部方法・签名
- `reference/item-manager-api-reference.md` — `ItemManager`/`Item`/`IItemBizKey` 的全部方法・签名
- `reference/currency-manager-api-reference.md` — `CurrencyManager`/`Currency`/`CurrencyConversion`/`CurrencyPrecision`/`CurrencyRate` 等的全部方法・签名

均基于平台 API 的实际类定义。不要凭记忆编写。

## 使用时机

当用户提出以下类似请求时使用本技能：
- 「创建获取・注册用户信息的 Java 代码」
- 「想在 Java 中使用 `UserManager`/`CompanyManager`」
- 「想在 JavaEE 开发模型中实现公司・组织的 CRUD」
- 「想获取组织层级结构（树）」
- 「想创建将用户归属到组织的处理」
- 「创建处理公开分组/私有分组/公司分组/法人分组的 Java 代码」
- 「想在 Java 中使用 `PublicGroupManager`/`PrivateGroupManager`/`CompanyGroupManager`/`CorporationGroupManager`」
- 「想处理公开分组的层级结构（树）或分类・角色」
- 「创建处理法人/取引方/品目分类/品目/货币的 Java 代码」
- 「想在 Java 中使用 `CorporationManager`/`CustomerManager`/`ItemCategoryManager`/`ItemManager`/`CurrencyManager`」
- 「想获取品目分类的层级结构（树）」「想注册・获取货币汇率」
- 「想处理用户分类/公开分组分类/组织分类（`UserCtg`/`PublicGroupCtg`/`DepartmentCtg`）」

若未明确说明是否面向 Java 或 JavaEE 开发模型，需向用户确认现有项目采用哪种开发模型。

若请求属于以下范畴，需说明其不在本技能范围内：
- 用户头像**图片**的获取・注册・删除 → `java-im-profile-usage`
- 角色定义本身（新建・层级・分类）・向用户分配角色 → `java-im-role-usage`/`java-im-account-usage`
- 认可资源・策略・权限确认 → `java-im-authz-usage`
- 登录设置・账户锁定等账户控制 → `java-im-account-usage`

## 实现步骤

1. 向用户收集需求（对象是用户/公司/组织/职位/组织归属/公开/私有/公司/法人分组中的哪一个、是单体获取还是检索、是新建还是更新、是否需要多语言支持・分类・角色・层级结构（树）操作）
2. 在 `reference/` 下对应的参考资料中准确确认对应方法（不要凭记忆或推测编写）
3. 用户・公司・组织系请参照 `assets/user-master-basic-usage.md`，分组系请参照 `assets/group-master-basic-usage.md`，法人・取引方・品目分类・品目・货币请参照 `assets/business-master-basic-usage.md` 进行实现
4. 进行新建时，确认对象是 `Company`/`DepartmentSet`（无法通过 Java API 新建，须向用户确认是否使用 `importData`/租户环境搭建资材）还是其他类型（通过 `termCd` 自动判定的 `set*`，新建时须设置 `startDate`/`endDate`）。但 `Currency`/`CurrencyConversion`/`CurrencyPrecision` 不具备期间这一概念本身，不在此列（`set*` 为简单的 `void` upsert）
5. 注册支持多语言的模型（`User`/`Department`/`CompanyPost`/`Corporation`/`Customer`/`ItemCategory`/`Item`/`Currency` 系列）时，须遵循 `setDefaultLocale` → `createLocaleElement()` → 各 setter → `putLocaleElement` 的步骤
6. 使用分组系・法人/取引方/品目分类/品目/货币的检索方法（`list*`/`search*`/`count*`）时，传递给 `AppCmnSearchCondition` 的列名须从各实体专用的枚举类型（如 `ImmPublicGroupColumn`/`ImmCustomerColumn` 等，即 `ImmTableColumn` 的实现）的 `toString()` 中获取
7. 使用 `CustomerManager`/`ItemManager` 的检索方法（`search`/`list`/`count`/`total`）时，须确认是否忘记传递第一个参数 `companyCd`（与其他类不同，其方法名不含实体名，为通用签名）
8. 由于分组系单体获取系（`get*`）在对象不存在时返回 `null`，调用方须进行空值检查
9. 确认是否符合 `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md`

## 注意事项

### 用户・公司・组织系

- **`Company`/`DepartmentSet` 的 `updateCompany`/`updateDepartmentSet` 仅是针对既有记录的更新专用，无法新建。** 标准实现仅发出以目标代码为条件的 SQL `UPDATE` 语句，若目标不存在，不会抛出异常，只是在未更新任何内容的情况下正常结束。若需要新建公司・组织集合，须向用户确认是否使用 `importData` 或租户环境搭建资材。注册 `Department` 时，其所引用的 `DepartmentSet` 必须已经预先创建完成
- **`Company` 模型仅含公司代码・排序键等信息，不含多语言公司名称字段。** 若需要显示公司名称，需另行设计（例如在组织侧管理名称）
- **使用 `set*` 系列方法（`setUser`/`setDepartment`/`setCompanyPost`）新建时（即未设置 `termCd` 时），须同时设置 `startDate`/`endDate`。** 未设置便调用，将抛出 `BizApiException`。**更新时（设置了 `termCd`）也不得省略 `startDate`/`endDate`。** 若保持未设置（null），会被视为与目标数据中已存储的值不一致，从而抛出 `BizApiException`（「対象データと指定されたデータの開始日、終了日が異なります」，即目标数据与指定数据的开始日、结束日不一致）。更新时须显式设置与注册时相同的 `startDate`/`endDate`
- **`setUserAttach` 的 `term` 参数不可为 `null`。** 须始终传递设置了 `startDate`/`endDate` 的 `jp.co.intra_mart.foundation.master.common.model.Term` 实例
- **`set*` 系列方法（`setUser`/`setDepartment`/`setCompanyPost`/`setUserAttach`）无法变更期间本身（开始日期・结束日期）。** 变更期间需使用 `moveTerm*`/`separateTerm*`/`mergeForwardTerm*`/`mergeBackwardTerm*`
- **多语言信息（姓名・组织名称等）仅设置键项目后调用 `set*` 并不会被保存。** 必须遵循 `setDefaultLocale`/`createLocaleElement()`/`putLocaleElement` 的步骤
- **向 `setUser` 一次性传入多个语言环境的 `putLocaleElement`（无论是在新建时一次注册多个语言环境，还是通过设置了 `termCd` 的更新来追加尚不存在的语言环境），均会抛出 `NullPointerException`。** 单次 `setUser` 调用只能安全地注册一个语言环境（参见 `assets/user-master-basic-usage.md` 中的注册模式）
- **检索系方法（`list*`/`search*`/`count*`）必须指定 `locale`。** 注意这与单体获取系方法（`getUser`/`getCompany` 等）——省略 `locale` 时获取所有语言信息——的行为差异
- **`list*` 与 `search*` 的签名相同，但对「指定语言环境的数据不存在的记录」的处理方式不同。** `list*` 仍会将该记录纳入结果，其国际化信息（姓名等）返回为 `null`；`search*` 则会将该记录从结果中排除

### 分组系

- **这四个分组类的 API 规模・功能范围并不相同。** 仅公开分组具备分类・角色・树功能，私有分组则是以用户关联为主的最小化配置。须注意其他类的实现模式未必能直接套用
- **法人分组的模型额外持有公司代码（`companyCd`）。** 不要误认为与公司分组同型，须在 `reference/corporation-group-manager-api-reference.md` 中确认差异
- **单体获取系（`get*`）在对象不存在时不会抛出异常，而是返回 `null`。** 调用方须务必进行空值检查
- **检索系方法（`list*`/`search*`/`count*`）传递给 `AppCmnSearchCondition` 的列指定，须先通过对应枚举类型（`ImmTableColumn` 的实现）的 `toString()` 转换为字符串，再传递给 `addCondition(String, Object[, Operator])`。** 无法传递给 `SearchTarget` 参数版的重载

### 法人・取引方・品目分类・品目・货币

- **`CorporationManager`（法人）与 `CorporationGroupManager`（法人分组）是不同的类・不同的包。** 不要混淆
- **`CustomerManager`/`ItemManager` 的 CRUD・检索方法名不含实体名，为通用命名（`get`/`set`/`remove`/`list`/`search`/`count`/`total`），且 `search`/`list`/`count`/`total` 的第一个参数必为 `companyCd`。** 不要与 `UserManager`/`CompanyManager` 的命名规则混淆
- **`ItemCategoryManager` 的方法名以 `Category`（而非 `ItemCategory`）表记。** 如 `getCategory`/`setCategory`/`getCategorySet`/`setCategoryInclusion` 等
- **货币的 4 种实体中，仅 `CurrencyRate` 具备期间管理（`ITerm`）。** `Currency`/`CurrencyConversion`/`CurrencyPrecision` 的 `set*` 为返回 `void` 的简单 upsert，无需设置 `startDate`/`endDate`（模型中本就不含该字段）
- **单体获取系（`getCorporation`/`get`（Customer/Item）/`getCurrency*`）在对象不存在时不会抛出异常，而是返回 `null`。** 调用方须务必进行空值检查

### 共通

- `UserManager`/`CompanyManager`、四个分组类、法人・取引方・品目分类・品目・货币这 5 个类的几乎所有方法都会抛出受检异常 `BizApiException`。调用方须务必声明 `throws` 或使用 `try-catch`

## 生成后的确认

并非通过自动验证脚本，而是手动确认以下事项。

1. 是否尝试新建 `Company`/`DepartmentSet`（`updateCompany`/`updateDepartmentSet` 仅为更新专用，无法通过 Java API 新建；如需新建，是否已考虑使用 `importData`/租户环境搭建资材）
2. `User`/`Department`/`CompanyPost` 的新建・更新是否基于「根据 `termCd` 自动判定」这一前提实现，新建时是否设置了 `startDate`/`endDate`
3. `setUserAttach` 的 `term` 参数是否传入了 `null`（应为设置了 `startDate`/`endDate` 的 `Term` 实例）
4. 注册多语言支持模型时是否遵循了 `setDefaultLocale`/`createLocaleElement()`/`putLocaleElement` 的步骤
5. 检索系方法是否指定了 `locale`
6. 分组系是否针对目标分组类型（公开/私有/公司/法人）使用了正确的管理类与包
7. 分组系单体获取系方法的返回值是否在「可能为 `null`」的前提下进行了处理
8. 分组系检索系方法的列指定是否使用了枚举类型的 `toString()`（是否与 `SearchTarget` 版混淆）
9. `BizApiException` 是否被吞掉未处理
10. 是否混淆了 `CorporationManager`（法人）与 `CorporationGroupManager`（法人分组）
11. `CustomerManager`/`ItemManager` 的检索系方法是否传递了 `companyCd`
12. 是否试图为货币的 `Currency`/`CurrencyConversion`/`CurrencyPrecision` 设置本不存在的 `startDate`/`endDate`（仅 `CurrencyRate` 具备期间概念）
13. 是否符合 `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md`
14. `jssp-code-review` / `jssp-security-check` 为 JSSP 专用，不适用于本技能的生成物。若项目另有 Java 专用的代码评审/安全检查技能，请使用该技能

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| **Java（JavaEE 开发模型）中用户・公司・组织・职位・组织归属・公开/私有/公司/法人分组・法人・取引方・品目分类・品目・货币的 CRUD** | **本技能** |
| 用户头像图片的获取・注册・删除 | `java-im-profile-usage` |
| 角色定义本身（新建・层级・分类） | `java-im-role-usage` |
| 向用户分配角色、登录设置・账户锁定 | `java-im-account-usage` |
| 认可资源・策略・权限确认 | `java-im-authz-usage` |
