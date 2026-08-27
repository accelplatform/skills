# Authz API Reference (Java Edition)

Based on the actual interface definitions in the intra-mart Accel Platform core source (`im_authz_base` module = public API). Do not supplement methods from memory or guesswork.

`im_authz_base` exposes **interfaces only**; the implementation classes (the `InHouse*` family in the `im_authz_impl` module) must not be referenced directly. All managers/services are obtained via their corresponding `*Factory` class.

Each interface tends to be large, with many overloads for search/count operations (`ResourceManager` has around 60 methods, `SubjectManager` around 30). This reference focuses on the core CRUD and authorization-check patterns. If exhaustive search conditions are needed, consult the original interface (core source) directly.

## Package Structure

```
jp.co.intra_mart.foundation.authz.model
├── I18nValue<V>                        … Locale-specific value (subclass of HashMap<Locale, V>)
├── resources.Resource                  … Resource model (Serializable interface)
├── resources.ResourceGroup             … Resource group model (holds a resource's name, description, and hierarchy)
├── resources.ResourceType<T>           … Resource type (the element that determines candidate actions)
├── subjects.Subject                    … Subject model
├── subjects.SubjectGroup               … Subject group model (built from an Expression)
├── subjects.SubjectType<T>             … Subject type
├── actions.Action                      … Action model
└── policies.{Policy, Effect}           … Policy model / Effect enum (PERMIT/DENY/BLOCK/NOT_APPLICABLE)

jp.co.intra_mart.foundation.authz.util.expression
└── Expression                          … Subject expression (AND/OR/NOT logical operations)
    └── (services.admin.)SubjectExpression.S(subject) … Starting point that converts a single Subject into an Expression

jp.co.intra_mart.foundation.authz.services.admin
├── ResourceManager (+ ResourceManagerFactory)          … CRUD for resources / resource groups
├── SubjectManager (+ SubjectManagerFactory)            … CRUD for subject groups
├── PolicyManager (+ PolicyManagerFactory)              … CRUD for policies
├── ResourceAttributeManager (+ ...Factory)             … Manages resource attributes
├── PolicyAdminInformation (+ ...Factory)               … Auxiliary information for admin screens
└── block.{ResourceBlocker, CachedResourceBlocker} (+ ...Factory)  … Controls resource blocking (BLOCK)

jp.co.intra_mart.foundation.authz.services.decision
└── PolicyDecisionService (+ PolicyDecisionServiceFactory)   … PDP (mainly for internal use)

jp.co.intra_mart.foundation.authz.client
├── AuthorizationClient (+ AuthorizationClientFactory)  … Recommended entry point for authorization checks
└── PolicyInformationService (+ PolicyInformationServicetFactory)  … PIP (mainly for internal use. The Factory name's spelling `Servicet` is exactly as it appears in the original)
```

## Model Interfaces

### `Resource`

```java
package jp.co.intra_mart.foundation.authz.model.resources;

public interface Resource extends Serializable {
    /** Resource ID (for internal system use; not normally used) */
    String getResourceId();
    /** Resource type */
    ResourceType<?> getType();
    /** Resource URI (RESOURCE-TYPE-ID:IDENTIFIER-COMPONENT format. Example: service://authz/settings/basic) */
    String getUri();
}
```

- A resource's key is its **resource URI**. It does not hold a name or description; the paired `ResourceGroup` holds those
- Registering a resource via `ResourceManager` creates one paired `ResourceGroup`

### `Subject`

```java
package jp.co.intra_mart.foundation.authz.model.subjects;

public interface Subject extends Serializable {
    /** Subject ID (for internal system use; not normally used) */
    String getSubjectId();
    /** Subject type */
    SubjectType<?> getType();
}
```

- A `Subject` cannot be registered on its own. Convert it to an `Expression` with `SubjectExpression.S(subject)`, then register it as a `SubjectGroup` via `SubjectManager#registerSubjectGroup(Expression, ...)`
- Concrete `Subject` implementations (department, public group, role, etc.) are provided by extension modules such as `im_master_subjecttypes` (e.g. `ImDepartmentSubject`, `ImPublicGroupRoleSubject`)

### `Policy`

```java
package jp.co.intra_mart.foundation.authz.model.policies;

public interface Policy extends Serializable {
    /** Policy ID (for internal system use) */
    String getPolicyId();
    /** Resource group ID indicating the resource (what) */
    String getResourceGroupId();
    /** Resource type ID (the element that determines candidate actions; handled as a set together with the action) */
    String getResourceTypeId();
    /** Subject group ID indicating the subject (who) */
    String getSubjectGroupId();
    /** Action (what to do) */
    String getAction();
    void setAction(Action action);
    void setAction(String action);
    /** Effect (permit / deny) */
    Effect getEffect();
    /** The policy this one inherits from. Null if this policy is explicitly registered */
    Policy getDeclaredPolicy();
    /** Whether this policy is explicitly registered */
    boolean isDeclared();
}
```

### `Effect` (enum)

```java
package jp.co.intra_mart.foundation.authz.model.policies;

public enum Effect {
    /** Permit */
    PERMIT,
    /** Deny */
    DENY,
    /** Block (usable only as an authorization-decision result. Registering any enum constant other than PERMIT/DENY as a policy raises IllegalSerializationException) */
    BLOCK,
    /** Undecidable */
    NOT_APPLICABLE
}
```

- What can be registered via `PolicyManager#setPolicy(...)` is essentially `PERMIT` / `DENY` only. `BLOCK` is a value that appears only as the **result** of an authorization decision; registering it directly as a policy raises an exception

### `AuthorizeResult` (enum, `client` package)

```java
package jp.co.intra_mart.foundation.authz.client;

public enum AuthorizeResult {
    /** Permit */
    Permit,
    /** Deny */
    Deny,
    /** Block */
    Block
}
```

- Always check the result using the form `AuthorizeResult.Permit.equals(result)` (use `.equals()`, not `result == AuthorizeResult.Permit`). This is an explicit recommendation stated in the Javadoc, so the check remains safe even if new enum constants are added in the future

## `ResourceManager` (Resource CRUD)

```java
package jp.co.intra_mart.foundation.authz.services.admin;

public interface ResourceManager {

    /**
     * Registers a resource URI as a resource and creates the paired resource group.
     * @param resourceURI the resource URI
     * @param displayName the display name of the resource group
     * @throws InvalidResourceUriException if the resource URI format is invalid
     */
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName) throws InvalidResourceUriException;
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName, I18nValue<String> description) throws InvalidResourceUriException;
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName, I18nValue<String> description, ResourceGroup parent) throws InvalidResourceUriException;
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName, I18nValue<String> description, String newGroupId) throws InvalidResourceUriException;
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName, I18nValue<String> description, String newGroupId, ResourceGroup parent) throws InvalidResourceUriException;
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName, ResourceGroup parent) throws InvalidResourceUriException;
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName, String newGroupId) throws InvalidResourceUriException;
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName, String newGroupId, ResourceGroup parent) throws InvalidResourceUriException;

    /** Registers a resource group used purely for classification purposes, without a resource. */
    ResourceGroup registerResourceGroup(String newGroupId, I18nValue<String> displayName);
    ResourceGroup registerResourceGroup(String newGroupId, I18nValue<String> displayName, I18nValue<String> description);

    /** Registers a subgroup under the specified parent. */
    ResourceGroup registerSubGroup(String newGroupId, ResourceGroup parent, I18nValue<String> displayName);
    ResourceGroup registerSubGroup(String newGroupId, ResourceGroup parent, I18nValue<String> displayName, I18nValue<String> description);

    /** Deletes a resource group (a destructive operation that also deletes the resources and policies beneath it). */
    void removeResourceGroup(ResourceGroup resourceGroup);
    void removeResourceGroup(String resourceGroupId);

    /** Releases a resource group's parent-child relationship (removes it from the hierarchy). */
    void removeResourceGroupInclusion(ResourceGroup sub);

    /** Updates the contents of a resource group (the entire set of fields held by ResourceGroup, such as display name and description). */
    void setResourceGroup(ResourceGroup resourceGroup);
    /** Updates only a resource group's description. */
    void setResourceGroupDescriptions(String resourceGroupId, I18nValue<String> description);
    /** Sets a resource group's parent-child relationship (inclusion in the hierarchy). */
    void setResourceGroupInclusion(ResourceGroup sub, ResourceGroup parent);
    /** Updates only a resource group's display name. */
    void setResourceGroupNames(String resourceGroupId, I18nValue<String> displayName);
    /** Sets the display order of subgroups. */
    void setSubGroupOrder(String parentResourceGroupId, List<String> childResourceGroupIds);

    /** Retrieves a resource from its resource ID. */
    Resource getResource(String resourceId);

    // There are also many other search/count methods, such as countActionsForAllGroups(Tree),
    // countActionsForGroupByName, getResourceGroup(By...), and getResourceGroups(...).
}
```

- The overloads of `registerAsResource(...)` differ based on whether `newGroupId` (explicitly specifying the paired resource group's ID; auto-numbered if omitted) and `parent` (placement directly under a parent group) are supplied
- `removeResourceGroup(...)` is a **destructive operation** that deletes the resources and policy settings beneath it as well

## `SubjectManager` (Subject CRUD)

```java
package jp.co.intra_mart.foundation.authz.services.admin;

public interface SubjectManager {

    /** Registers a subject group from an Expression (subject expression). */
    SubjectGroup registerSubjectGroup(Expression e, I18nValue<String> displayName);
    SubjectGroup registerSubjectGroup(Expression e, I18nValue<String> displayName, I18nValue<String> description);

    /** Deletes a subject (removes the given subject from its subject group's expression). */
    void removeSubject(Subject subject) throws SubjectManagingException;
    /** Deletes a subject group (a destructive operation; references from related policies are also removed). */
    void removeSubjectGroup(SubjectGroup subjectGroup) throws SubjectManagingException;

    /** Retrieves a subject group from its subject group ID. */
    SubjectGroup getSubjectGroup(String subjectGroupId);
    /** Retrieves the matching subject group from an Expression (a normalized expression). */
    SubjectGroup getSubjectGroupByExpression(Expression e);
    /** Retrieves the built-in subject group that represents all authenticated users. */
    SubjectGroup getAuthenticatedUsers();
    /** Retrieves the built-in subject group that represents unauthenticated (guest) users. */
    SubjectGroup getGuestSubjectGroup();

    /** Retrieves a subject type from its subject type ID (used, for example, when SubjectExpression resolves internally). */
    SubjectType<?> getSubjectType(String subjectTypeId);

    // There are also many other search/count methods, such as countSubjectGroupsByName(AndTypeIds/AndTypes)
    // and countRegisteredSubjectGroups.
}
```

- There is no API for registering a subject **on its own**. A condition expression built with `Expression` (described below) must always be registered as a `SubjectGroup`
- `getAuthenticatedUsers()` / `getGuestSubjectGroup()` are built-in groups commonly used when setting a policy for "all users" or "unauthenticated users"

## `Expression` / `SubjectExpression` (Subject Expressions)

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
    /** Converts a Subject instance into a subject expression. */
    public static Expression S(Subject subject);
}
```

- `SubjectExpression.S(subject)` is the starting point that converts an individual `Subject` into an expression. Multiple conditions are combined with `Expression.AND(...)` / `Expression.OR(...)` / `Expression.NOT(...)`
- Example: the group of users who "belong to department A **and** do not have role B" → `Expression.AND(SubjectExpression.S(departmentASubject), Expression.NOT(SubjectExpression.S(roleBSubject)))`

## `PolicyManager` (Policy CRUD)

```java
package jp.co.intra_mart.foundation.authz.services.admin;

public interface PolicyManager {

    /** Sets a policy (serves both as new registration and as an overwrite). */
    void setPolicy(Policy policy);
    Policy setPolicy(ResourceGroup resourceGroup, Action action, SubjectGroup subjectGroup, Effect effect);
    Policy setPolicy(String resourceGroupId, String subjectGroupId, String resourceTypeId, String action, String effect);

    /** Deletes only an explicitly registered policy (reverts to the unset state, so it falls back to whatever it inherits from). */
    void removePolicy(Policy policy);
    void removePolicy(String policyId);
    /** Deletes all policies set for the specified resource group (a destructive operation). */
    void removePoliciesForResourceGroup(String resourceGroupId);
    /** Deletes all policies set for the specified subject group (a destructive operation). */
    void removePoliciesForSubjectGroup(String subjectGroupId);
    /** Deletes all policies (a destructive operation affecting the entire system). */
    void removeAllPolicies();

    /** Retrieves only an explicitly registered policy (null if unset). */
    Policy getDeclaredPolicy(ResourceGroup resourceGroup, SubjectGroup subjectGroup, Action action);
    Policy getDeclaredPolicy(String policyId);
    Policy getDeclaredPolicy(String resourceGroupId, String subjectGroupId, String resourceTypeId, String action);

    /** Retrieves the effective policy with inheritance resolved (returns a result resolved from its inherited source even when not explicitly set). */
    Policy getActualPolicy(String resourceGroupId, String subjectGroupId, String resourceTypeId, String action);
    List<Policy> getActualPolicies(String resourceGroupId, Set<String> subjectGroupIds, String resourceTypeId, String action);

    List<Policy> getAllPolicies();
    List<Policy> getAllPolicies(int offset, int length);
    List<Policy> getDeclaredPoliciesFor(Resource resource);
    List<Policy> getDeclaredPoliciesFor(Resource resource, Action action);

    // There are also count methods, such as countAllPolicies, countDeclaredPoliciesFor(ResourceGroup),
    // and countDeclaredPoliciesForResourceGroup/SubjectGroup.
}
```

- **The distinction between `getDeclaredPolicy(...)` (explicit settings only) and `getActualPolicy(...)` (with inheritance resolved) is important.** Use `getActualPolicy`/`getActualPolicies` when you want to know "the permission actually applied to this resource and subject." Use `getDeclaredPolicy` when determining "whether the explicit setting may be edited/deleted" (e.g. checking what an admin screen should let you edit)
- `removePolicy(...)` only deletes the explicit setting; the fallback to the inherited policy remains. `removePoliciesForResourceGroup`/`removePoliciesForSubjectGroup`/`removeAllPolicies` are all bulk, destructive delete operations

## `AuthorizationClient` (Authorization Checks; Recommended Entry Point)

```java
package jp.co.intra_mart.foundation.authz.client;

public interface AuthorizationClient {

    /** Makes the authorization decision using the account context's user code. */
    AuthorizeResult authorize(Resource resource, Action action);
    AuthorizeResult authorize(String resourceURI, String action);

    /** Makes the authorization decision using the specified subject groups. */
    AuthorizeResult authorize(Resource resource, Action action, Set<SubjectGroup> subjectGroups);
    AuthorizeResult authorize(String resourceURI, String action, Set<String> subjectGroupsIds);

    /** Makes the authorization decision using the specified user code. */
    AuthorizeResult authorize(Resource resource, Action action, String userCd);
    AuthorizeResult authorize(String resourceURI, String action, String userCd);

    /** Makes the authorization decision specifying the resource by its model class (requires a model type the authorization mechanism can interpret). */
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

- The **recommended entry point** for developers performing authorization checks. `resourceURI` (a String) is in `RESOURCE-TYPE-ID:IDENTIFIER-COMPONENT` format and must match the value pre-registered via `ResourceManager#registerAsResource`
- If the subject is omitted, the decision is made automatically using the account context (the currently logged-in user)
- Always check the return value using the form `AuthorizeResult.Permit.equals(result)`

## `PolicyDecisionService` / `PolicyInformationService` (Mainly for Internal Use)

The Javadoc explicitly states: "You normally do not need to handle this class directly. Use `AuthorizationClient` when you want to make an authorization decision." Consider these only for special cases that cannot be expressed via `AuthorizationClient` (e.g. wanting to obtain the resolved subject groups separately from the decision itself).

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
    /** Resolves only the resource-independent subject group IDs (does not use OnDemandSubjectResolver). */
    Set<String> resolveDeclaredSubjectGroupIds(String userCd);
    /** Resolves including resource-dependent subjects as well (also uses OnDemandSubjectResolver; normally use this one). */
    Set<String> resolveSubjectGroupIds(String userCd, String resourceURI, String action);
    /** Converts a resource model into a resource URI. */
    <T> String resolveResourceUri(T model) throws UnexpectedResourceModelReceivedException;
}
```

## Prohibition on Reusing an Instance Across Tenants (Important)

This is a caveat explicitly documented in `ResourceManager`'s Javadoc, and it is a design constraint that applies equally to the other managers/services:

> Do not share a `ResourceManager` instance across multiple tenants. If you switch tenants on the same thread, do not reuse the instance — obtain it again from the `ResourceManagerFactory` class. Reusing an instance may cause some API calls to fail.

- The safe implementation pattern is to **never hold manager/client/service instances in a field for caching, and instead obtain them from the Factory on every method call**
- Extra care is needed when switching tenants mid-processing in batch jobs or scheduled jobs
