# Authz API 参考手册（Java 版）

基于 intra-mart Accel Platform 核心源代码（`im_authz_base` 模块 = 公开 API）中的实际接口定义编写。请勿凭记忆或推测补充方法。

`im_authz_base` **仅公开接口**，实现类（`im_authz_impl` 模块中的 `InHouse*` 系列）不应被直接引用。所有 manager／service 均需通过对应的 `*Factory` 类获取。

各接口大多规模较大，拥有大量用于检索・计数的重载方法（`ResourceManager` 约有 60 个方法，`SubjectManager` 约有 30 个）。本参考手册仅聚焦于 CRUD 与权限确认的核心模式。如需完整的检索条件，请直接查阅原始接口（核心源代码）。

## 包结构

```
jp.co.intra_mart.foundation.authz.model
├── I18nValue<V>                        … 按语言环境区分的值（HashMap<Locale, V> 的子类）
├── resources.Resource                  … 资源模型（Serializable 接口）
├── resources.ResourceGroup             … 资源组模型（保存资源的名称、说明及层级关系）
├── resources.ResourceType<T>           … 资源类型（决定候选操作的要素）
├── subjects.Subject                    … 主体模型
├── subjects.SubjectGroup               … 主体组模型（由 Expression 生成）
├── subjects.SubjectType<T>             … 主体类型
├── actions.Action                      … 操作模型
└── policies.{Policy, Effect}           … 策略模型・Effect 枚举（PERMIT/DENY/BLOCK/NOT_APPLICABLE）

jp.co.intra_mart.foundation.authz.util.expression
└── Expression                          … 主体表达式（AND/OR/NOT 逻辑运算）
    └── (services.admin.)SubjectExpression.S(subject) … 将单个 Subject 转换为 Expression 的起点

jp.co.intra_mart.foundation.authz.services.admin
├── ResourceManager (+ ResourceManagerFactory)          … 资源／资源组的 CRUD
├── SubjectManager (+ SubjectManagerFactory)            … 主体组的 CRUD
├── PolicyManager (+ PolicyManagerFactory)              … 策略的 CRUD
├── ResourceAttributeManager (+ ...Factory)             … 资源属性管理
├── PolicyAdminInformation (+ ...Factory)               … 面向管理画面的辅助信息
└── block.{ResourceBlocker, CachedResourceBlocker} (+ ...Factory)  … 资源闭塞（BLOCK）控制

jp.co.intra_mart.foundation.authz.services.decision
└── PolicyDecisionService (+ PolicyDecisionServiceFactory)   … PDP（主要供内部使用）

jp.co.intra_mart.foundation.authz.client
├── AuthorizationClient (+ AuthorizationClientFactory)  … 权限确认的推荐入口点
└── PolicyInformationService (+ PolicyInformationServicetFactory)  … PIP（主要供内部使用。Factory 名称的拼写 `Servicet` 与原文一致）
```

## 模型接口

### `Resource`

```java
package jp.co.intra_mart.foundation.authz.model.resources;

public interface Resource extends Serializable {
    /** 资源ID（系统内部使用，通常不使用） */
    String getResourceId();
    /** 资源类型 */
    ResourceType<?> getType();
    /** 资源URI（RESOURCE-TYPE-ID:IDENTIFIER-COMPONENT 格式。例：service://authz/settings/basic） */
    String getUri();
}
```

- 资源的键是 **资源URI**。资源本身不持有名称・说明，这些由与之成对的 `ResourceGroup` 保存
- 通过 `ResourceManager` 注册资源时，会同时创建一个与之成对的 `ResourceGroup`

### `Subject`

```java
package jp.co.intra_mart.foundation.authz.model.subjects;

public interface Subject extends Serializable {
    /** 主体ID（系统内部使用，通常不使用） */
    String getSubjectId();
    /** 主体类型 */
    SubjectType<?> getType();
}
```

- `Subject` 无法单独注册。需先通过 `SubjectExpression.S(subject)` 转换为 `Expression`，再通过 `SubjectManager#registerSubjectGroup(Expression, ...)` 以 `SubjectGroup` 的形式注册
- 具体的 `Subject` 实现（组织、公共组、角色等）由 `im_master_subjecttypes` 等扩展模块提供（例如 `ImDepartmentSubject`、`ImPublicGroupRoleSubject`）

### `Policy`

```java
package jp.co.intra_mart.foundation.authz.model.policies;

public interface Policy extends Serializable {
    /** 策略ID（系统内部使用） */
    String getPolicyId();
    /** 表示资源（对象是什么）的资源组ID */
    String getResourceGroupId();
    /** 资源类型ID（决定候选操作的要素，需与操作成对处理） */
    String getResourceTypeId();
    /** 表示主体（谁）的主体组ID */
    String getSubjectGroupId();
    /** 操作（做什么） */
    String getAction();
    void setAction(Action action);
    void setAction(String action);
    /** 效果（允许・禁止） */
    Effect getEffect();
    /** 继承来源的策略。若为显式注册则为 null */
    Policy getDeclaredPolicy();
    /** 是否为显式注册的策略 */
    boolean isDeclared();
}
```

### `Effect`（枚举）

```java
package jp.co.intra_mart.foundation.authz.model.policies;

public enum Effect {
    /** 允许 */
    PERMIT,
    /** 拒绝 */
    DENY,
    /** 闭塞（仅可作为认可判断结果使用。若将 PERMIT/DENY 以外的枚举常量注册为策略，将抛出 IllegalSerializationException） */
    BLOCK,
    /** 无法判断 */
    NOT_APPLICABLE
}
```

- 通过 `PolicyManager#setPolicy(...)` 可注册的基本上仅限 `PERMIT` / `DENY`。`BLOCK` 仅是认可判断的**结果**中会出现的值，若直接将其注册为策略会引发异常

### `AuthorizeResult`（枚举，`client` 包）

```java
package jp.co.intra_mart.foundation.authz.client;

public enum AuthorizeResult {
    /** 允许 */
    Permit,
    /** 禁止 */
    Deny,
    /** 闭塞 */
    Block
}
```

- 判定时务必采用 `AuthorizeResult.Permit.equals(result)` 的形式（而非 `result == AuthorizeResult.Permit`，应使用 `.equals()`）。这是 Javadoc 中明确给出的推荐做法，即使今后新增枚举常量，也能安全地进行判定

## `ResourceManager`（资源 CRUD）

```java
package jp.co.intra_mart.foundation.authz.services.admin;

public interface ResourceManager {

    /**
     * 将资源URI注册为资源，并创建与之成对的资源组。
     * @param resourceURI 资源URI
     * @param displayName 资源组的显示名称
     * @throws InvalidResourceUriException 资源URI格式不正确时抛出
     */
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName) throws InvalidResourceUriException;
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName, I18nValue<String> description) throws InvalidResourceUriException;
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName, I18nValue<String> description, ResourceGroup parent) throws InvalidResourceUriException;
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName, I18nValue<String> description, String newGroupId) throws InvalidResourceUriException;
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName, I18nValue<String> description, String newGroupId, ResourceGroup parent) throws InvalidResourceUriException;
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName, ResourceGroup parent) throws InvalidResourceUriException;
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName, String newGroupId) throws InvalidResourceUriException;
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName, String newGroupId, ResourceGroup parent) throws InvalidResourceUriException;

    /** 注册一个不持有资源、仅用于分类目的的资源组。 */
    ResourceGroup registerResourceGroup(String newGroupId, I18nValue<String> displayName);
    ResourceGroup registerResourceGroup(String newGroupId, I18nValue<String> displayName, I18nValue<String> description);

    /** 在指定的父级下注册子组。 */
    ResourceGroup registerSubGroup(String newGroupId, ResourceGroup parent, I18nValue<String> displayName);
    ResourceGroup registerSubGroup(String newGroupId, ResourceGroup parent, I18nValue<String> displayName, I18nValue<String> description);

    /** 删除资源组（这是一个会连同其下的资源・策略一并删除的破坏性操作）。 */
    void removeResourceGroup(ResourceGroup resourceGroup);
    void removeResourceGroup(String resourceGroupId);

    /** 解除资源组的父子关系（从层级结构中移除包含关系）。 */
    void removeResourceGroupInclusion(ResourceGroup sub);

    /** 更新资源组的内容（显示名称・说明等 ResourceGroup 所持有的全部字段）。 */
    void setResourceGroup(ResourceGroup resourceGroup);
    /** 仅更新资源组的说明。 */
    void setResourceGroupDescriptions(String resourceGroupId, I18nValue<String> description);
    /** 设置资源组的父子关系（层级结构中的包含关系）。 */
    void setResourceGroupInclusion(ResourceGroup sub, ResourceGroup parent);
    /** 仅更新资源组的显示名称。 */
    void setResourceGroupNames(String resourceGroupId, I18nValue<String> displayName);
    /** 设置子组的显示顺序。 */
    void setSubGroupOrder(String parentResourceGroupId, List<String> childResourceGroupIds);

    /** 根据资源ID获取资源。 */
    Resource getResource(String resourceId);

    // 此外还存在 countActionsForAllGroups(Tree)、countActionsForGroupByName、
    // getResourceGroup(By...)、getResourceGroups(...) 等大量检索・计数系方法。
}
```

- `registerAsResource(...)` 的各重载根据是否指定 `newGroupId`（显式指定与之成对的资源组ID，省略时自动编号）和 `parent`（直接配置到父组下）来区分使用
- `removeResourceGroup(...)` 是会连同其下的资源・策略设置一并删除的**破坏性操作**

## `SubjectManager`（主体 CRUD）

```java
package jp.co.intra_mart.foundation.authz.services.admin;

public interface SubjectManager {

    /** 根据 Expression（主体表达式）注册主体组。 */
    SubjectGroup registerSubjectGroup(Expression e, I18nValue<String> displayName);
    SubjectGroup registerSubjectGroup(Expression e, I18nValue<String> displayName, I18nValue<String> description);

    /** 删除主体（从主体组的表达式中移除该主体）。 */
    void removeSubject(Subject subject) throws SubjectManagingException;
    /** 删除主体组（破坏性操作，相关策略中对其的引用也会被解除）。 */
    void removeSubjectGroup(SubjectGroup subjectGroup) throws SubjectManagingException;

    /** 根据主体组ID获取主体组。 */
    SubjectGroup getSubjectGroup(String subjectGroupId);
    /** 根据 Expression（已规范化的表达式）获取匹配的主体组。 */
    SubjectGroup getSubjectGroupByExpression(Expression e);
    /** 获取表示全体已认证用户的内置主体组。 */
    SubjectGroup getAuthenticatedUsers();
    /** 获取表示未认证用户（访客）的内置主体组。 */
    SubjectGroup getGuestSubjectGroup();

    /** 根据主体类型ID获取主体类型（用于 SubjectExpression 的内部解析等场景）。 */
    SubjectType<?> getSubjectType(String subjectTypeId);

    // 此外还存在 countSubjectGroupsByName(AndTypeIds/AndTypes)、countRegisteredSubjectGroups 等
    // 大量检索・计数系方法。
}
```

- 不存在针对**单个**主体的注册 API。必须将通过 `Expression`（后述）组合而成的条件表达式以 `SubjectGroup` 的形式注册
- `getAuthenticatedUsers()` / `getGuestSubjectGroup()` 是在为「全体用户」「未认证用户」设置策略时经常使用的内置组

## `Expression` / `SubjectExpression`（主体表达式）

```java
package jp.co.intra_mart.foundation.authz.util.expression;

public abstract class Expression implements Comparable<Expression>, Serializable {
    public static Expression AND(Expression... exps);
    public static Expression AND(List<Expression> exps);
    public static Expression OR(Expression... exps);
    public static Expression OR(List<Expression> exps);
    public static Expression NOT(Expression e);
    public abstract Expression normalize();
}
```

```java
package jp.co.intra_mart.foundation.authz.services.admin;

public class SubjectExpression extends Expression {
    /** 将 Subject 实例转换为主体表达式。 */
    public static Expression S(Subject subject);
}
```

- `SubjectExpression.S(subject)` 是将各个 `Subject` 转换为表达式的起点。多个条件通过 `Expression.AND(...)` / `Expression.OR(...)` / `Expression.NOT(...)` 进行组合
- 例：「属于部门A **且** 不具有角色B」的用户群 → `Expression.AND(SubjectExpression.S(departmentASubject), Expression.NOT(SubjectExpression.S(roleBSubject)))`

## `PolicyManager`（策略 CRUD）

```java
package jp.co.intra_mart.foundation.authz.services.admin;

public interface PolicyManager {

    /** 设置策略（兼具新规注册与覆盖更新两种功能）。 */
    void setPolicy(Policy policy);
    Policy setPolicy(ResourceGroup resourceGroup, Action action, SubjectGroup subjectGroup, Effect effect);
    Policy setPolicy(String resourceGroupId, String subjectGroupId, String resourceTypeId, String action, String effect);

    /** 仅删除显式注册的策略（恢复为未设置状态，将回退到继承来源）。 */
    void removePolicy(Policy policy);
    void removePolicy(String policyId);
    /** 删除设置在指定资源组上的全部策略（破坏性操作）。 */
    void removePoliciesForResourceGroup(String resourceGroupId);
    /** 删除设置在指定主体组上的全部策略（破坏性操作）。 */
    void removePoliciesForSubjectGroup(String subjectGroupId);
    /** 删除全部策略（影响整个系统的破坏性操作）。 */
    void removeAllPolicies();

    /** 仅获取显式注册的策略（未设置时返回 null）。 */
    Policy getDeclaredPolicy(ResourceGroup resourceGroup, SubjectGroup subjectGroup, Action action);
    Policy getDeclaredPolicy(String policyId);
    Policy getDeclaredPolicy(String resourceGroupId, String subjectGroupId, String resourceTypeId, String action);

    /** 获取经过继承补全后的实际生效策略（即使未显式设置，也会返回从继承来源解析得到的结果）。 */
    Policy getActualPolicy(String resourceGroupId, String subjectGroupId, String resourceTypeId, String action);
    List<Policy> getActualPolicies(String resourceGroupId, Set<String> subjectGroupIds, String resourceTypeId, String action);

    List<Policy> getAllPolicies();
    List<Policy> getAllPolicies(int offset, int length);
    List<Policy> getDeclaredPoliciesFor(Resource resource);
    List<Policy> getDeclaredPoliciesFor(Resource resource, Action action);

    // 此外还存在 countAllPolicies、countDeclaredPoliciesFor(ResourceGroup)、
    // countDeclaredPoliciesForResourceGroup/SubjectGroup 等计数系方法。
}
```

- **`getDeclaredPolicy(...)`（仅显式设置）与 `getActualPolicy(...)`（经继承补全）之间的区别十分重要。** 若想知道「该资源・主体实际生效的权限」，应使用 `getActualPolicy`/`getActualPolicies`；若要判断「是否可以对显式设置进行编辑／删除」（例如在管理画面确认编辑对象时），则应使用 `getDeclaredPolicy`
- `removePolicy(...)` 仅删除显式设置，仍会回退到继承来源的策略。`removePoliciesForResourceGroup`/`removePoliciesForSubjectGroup`/`removeAllPolicies` 均为批量删除的破坏性操作

## `AuthorizationClient`（权限确认・推荐入口点）

```java
package jp.co.intra_mart.foundation.authz.client;

public interface AuthorizationClient {

    /** 使用账户上下文中的用户代码进行认可判断。 */
    AuthorizeResult authorize(Resource resource, Action action);
    AuthorizeResult authorize(String resourceURI, String action);

    /** 使用指定的主体组进行认可判断。 */
    AuthorizeResult authorize(Resource resource, Action action, Set<SubjectGroup> subjectGroups);
    AuthorizeResult authorize(String resourceURI, String action, Set<String> subjectGroupsIds);

    /** 使用指定的用户代码进行认可判断。 */
    AuthorizeResult authorize(Resource resource, Action action, String userCd);
    AuthorizeResult authorize(String resourceURI, String action, String userCd);

    /** 以模型类的形式指定资源来进行认可判断（需要认可机制能够解析的模型类型）。 */
    <T> AuthorizeResult authorize(T resourceModel, String action) throws UnexpectedResourceModelReceivedException;
    <T> AuthorizeResult authorize(T resourceModel, String action, Set<String> subjectGroupsIds) throws UnexpectedResourceModelReceivedException;
    <T> AuthorizeResult authorize(T resourceModel, String action, String userCd) throws UnexpectedResourceModelReceivedException;
}
```

```java
package jp.co.intra_mart.foundation.authz.client;

public abstract class AuthorizationClientFactory {
    public static AuthorizationClientFactory getInstance();
    public abstract AuthorizationClient getAuthorizationClient();
}
```

- 这是开发者进行权限确认时的**推荐入口点**。`resourceURI`（String 类型）采用 `RESOURCE-TYPE-ID:IDENTIFIER-COMPONENT` 格式，需与通过 `ResourceManager#registerAsResource` 预先注册的值保持一致
- 若省略主体，将自动使用账户上下文（当前登录用户）进行判断
- 返回值的判定务必采用 `AuthorizeResult.Permit.equals(result)` 的形式

## `PolicyDecisionService` / `PolicyInformationService`（主要供内部使用）

Javadoc 中明确记载：「通常无需直接操作此类。若要进行认可判断，请使用 `AuthorizationClient`」。仅在 `AuthorizationClient` 无法表达的特殊场景（例如希望单独获取主体组的解析结果，而非仅获取判断结果时）才考虑使用。

```java
package jp.co.intra_mart.foundation.authz.services.decision;

public interface PolicyDecisionService {
    Effect authorize(Set<String> userSubjectGroup, String resourceURI, String action);
    Effect authorize(Set<SubjectGroup> userSubjectGroup, Resource resource, Action action);
    Effect authorize(String userCd, Resource resource, Action action);
    Effect authorize(String userCd, String resourceURI, String action);
}
```

```java
package jp.co.intra_mart.foundation.authz.client;

public interface PolicyInformationService {
    /** 仅解析与资源无关的主体组ID（不使用 OnDemandSubjectResolver）。 */
    Set<String> resolveDeclaredSubjectGroupIds(String userCd);
    /** 也包含依赖资源的主体一并解析（也使用 OnDemandSubjectResolver，通常使用此方法）。 */
    Set<String> resolveSubjectGroupIds(String userCd, String resourceURI, String action);
    /** 将资源的模型转换为资源URI。 */
    <T> String resolveResourceUri(T model) throws UnexpectedResourceModelReceivedException;
}
```

## 禁止跨租户重复使用实例（重要）

这是 `ResourceManager` 的 Javadoc 中明确记载的注意事项，同样适用于其他各 manager／service 的设计约束：

> 请勿在多个租户之间共享 `ResourceManager` 的实例。若在同一线程上切换租户，请勿重复使用该实例，而应重新从 `ResourceManagerFactory` 类中获取。若重复使用实例，部分 API 的执行可能会失败。

- 安全的实现方式是：**不将 manager／client／service 的实例保存在字段中进行缓存，而是每次方法调用时都从 Factory 重新获取**
- 在批处理或作业中一边切换租户一边处理的场景下，需要格外注意
