# Authz API Basic Usage Patterns (Java Edition)

For the signatures and internal behavior of `ResourceManager` / `SubjectManager` / `PolicyManager` / `AuthorizationClient`, see `reference/authz-api-reference.md`. This document shows the typical call patterns.

## Pattern 1: Registering a Resource

The basic form of registering a resource URI as an authorization target with `ResourceManager#registerAsResource(...)`, obtaining the paired `ResourceGroup`.

```java
package jp.co.example.foo.service;

import java.util.Locale;

import jp.co.intra_mart.foundation.authz.model.I18nValue;
import jp.co.intra_mart.foundation.authz.model.resources.InvalidResourceUriException;
import jp.co.intra_mart.foundation.authz.model.resources.ResourceGroup;
import jp.co.intra_mart.foundation.authz.services.admin.ResourceManager;
import jp.co.intra_mart.foundation.authz.services.admin.ResourceManagerFactory;

import jp.co.example.foo.exception.ResourceRegistrationException;

/**
 * Provides registration processing for authorization resources.
 */
public class AuthzResourceRegistrationService {

    /** The resource URI prefix (the leading "flat-crud" is the resource type ID) */
    private static final String RESOURCE_URI_PREFIX = "flat-crud://myapp/orders/";

    /**
     * Registers order data as a resource.
     * @param orderId the order ID
     * @param displayName the display name of the resource group (Japanese)
     * @throws ResourceRegistrationException if registration fails
     */
    public void registerOrderResource(final String orderId, final String displayName) throws ResourceRegistrationException {
        final String resourceUri = RESOURCE_URI_PREFIX + orderId;   // e.g. flat-crud://myapp/orders/ORD001
        final I18nValue<String> name = new I18nValue<String>(Locale.JAPANESE, displayName);

        // Manager instances must not be reused across tenants; always obtain a fresh one from the Factory each time
        final ResourceManager resourceManager = ResourceManagerFactory.getInstance().getResourceManager();
        try {
            final ResourceGroup resourceGroup = resourceManager.registerAsResource(resourceUri, name);
            // If needed, return resourceGroup.getResourceGroupId() etc. to the caller
        } catch (final InvalidResourceUriException e) {
            throw new ResourceRegistrationException("The resource URI format is invalid: resourceUri=" + resourceUri, e);
        }
    }
}
```

- The resource URI is in the `RESOURCE-TYPE-ID:IDENTIFIER-COMPONENT` format (for the resource types you can use, see "Standard Resource Types and Actions" in `reference/authz-api-reference.md`). To keep it from colliding with other applications, express the hierarchy of application name and component name in the path part that follows the resource type ID
- `I18nValue<String>` is a subclass of `HashMap<Locale, String>`. If you want to hold display names for multiple locales, call `put(locale, value)` additionally
- Do not cache `Manager` instances in a field; obtain a fresh one from the `Factory` on every call (because the design causes some APIs to fail if an instance is reused across a tenant switch)

## Pattern 2: Registering a Subject Group (Building Conditional Expressions with `Expression`)

A subject cannot be registered on its own — it must first be converted into an expression with `SubjectExpression.S(subject)` and then passed to `SubjectManager#registerSubjectGroup(Expression, ...)`.

```java
package jp.co.example.foo.service;

import java.util.Locale;

import jp.co.intra_mart.foundation.authz.model.I18nValue;
import jp.co.intra_mart.foundation.authz.model.subjects.Subject;
import jp.co.intra_mart.foundation.authz.model.subjects.SubjectGroup;
import jp.co.intra_mart.foundation.authz.services.admin.SubjectExpression;
import jp.co.intra_mart.foundation.authz.services.admin.SubjectManager;
import jp.co.intra_mart.foundation.authz.services.admin.SubjectManagerFactory;
import jp.co.intra_mart.foundation.authz.util.expression.Expression;

/**
 * Provides registration processing for subject groups.
 */
public class AuthzSubjectRegistrationService {

    /**
     * Registers a subject group representing a single subject (e.g., a specific role).
     * @param subject the target subject (concrete implementations are provided by extension modules such as ImPublicGroupRoleSubject)
     * @param displayName the display name of the subject group
     * @return the registered subject group
     */
    public SubjectGroup registerSingleSubjectGroup(final Subject subject, final String displayName) {
        final Expression expression = SubjectExpression.S(subject);
        final I18nValue<String> name = new I18nValue<String>(Locale.JAPANESE, displayName);

        final SubjectManager subjectManager = SubjectManagerFactory.getInstance().getSubjectManager();
        return subjectManager.registerSubjectGroup(expression, name);
    }

    /**
     * Registers a subject group combining multiple conditions (AND/OR/NOT).
     * Example: the group of users who match subjectA but do not match subjectB.
     * @param subjectA the target subject for the AND condition
     * @param subjectB the target subject for the NOT condition
     * @param displayName the display name of the subject group
     * @return the registered subject group
     */
    public SubjectGroup registerCombinedSubjectGroup(final Subject subjectA, final Subject subjectB, final String displayName) {
        final Expression expression = Expression.AND(
                SubjectExpression.S(subjectA),
                Expression.NOT(SubjectExpression.S(subjectB)));
        final I18nValue<String> name = new I18nValue<String>(Locale.JAPANESE, displayName);

        final SubjectManager subjectManager = SubjectManagerFactory.getInstance().getSubjectManager();
        return subjectManager.registerSubjectGroup(expression, name);
    }
}
```

- Use `SubjectManager#registerAsSubject(subjectTypeId, keys)` to number a `Subject` instance (see the next section)
- If you only want to set a policy for "all users" or "unauthenticated users," do not register a new subject group — use the built-in groups `SubjectManager#getAuthenticatedUsers()` / `getGuestSubjectGroup()` (see Pattern 3)

### Making a Role or Similar into a Subject

`registerAsSubject` numbers a `Subject` from a subject type ID and key values. The following is the implementation for "granting a permission to the users who belong to a role."

```java
package jp.co.example.foo.service;

import java.util.Locale;

import jp.co.intra_mart.foundation.authz.model.I18nValue;
import jp.co.intra_mart.foundation.authz.model.subjects.Subject;
import jp.co.intra_mart.foundation.authz.model.subjects.SubjectGroup;
import jp.co.intra_mart.foundation.authz.services.admin.SubjectExpression;
import jp.co.intra_mart.foundation.authz.services.admin.SubjectManager;
import jp.co.intra_mart.foundation.authz.services.admin.SubjectManagerFactory;
import jp.co.intra_mart.foundation.authz.subjecttype.im_master.ImRole;
import jp.co.intra_mart.foundation.authz.util.expression.Expression;

/**
 * Provides registration processing for subject groups conditioned on a role.
 */
public class RoleSubjectRegistrationService {

    /**
     * Registers a subject group representing the users who belong to the specified role.
     * @param roleId the role ID
     * @param displayName the display name of the subject group
     * @return the registered subject group (the existing one if it already exists)
     */
    public SubjectGroup registerRoleSubjectGroup(final String roleId, final String displayName) {
        final SubjectManager subjectManager = SubjectManagerFactory.getInstance().getSubjectManager();

        // Numbers a subject from the subject type ID and the key values (for a role, a single role ID)
        final Subject subject = subjectManager.registerAsSubject(ImRole.B_M_ROLE, roleId);

        // A Subject cannot be registered on its own, so convert it into an Expression and register it as a SubjectGroup
        final Expression expression = SubjectExpression.S(subject);
        final I18nValue<String> name = new I18nValue<String>(Locale.JAPANESE, displayName);
        return subjectManager.registerSubjectGroup(expression, name);
    }
}
```

- The number and meaning of the key values differ for each subject type. For the list of IDs, see "Standard Subject Types" in `reference/authz-api-reference.md`
- `registerSubjectGroup` returns the existing instance when one already exists, so there is no need to check for existence in advance with `getSubjectGroupByExpression`

## Pattern 3: Setting a Policy (Registering Permit/Deny)

Use `PolicyManager#setPolicy(...)` to register a combination of resource group, subject group, action, and effect.

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.authz.model.policies.Effect;
import jp.co.intra_mart.foundation.authz.model.policies.Policy;
import jp.co.intra_mart.foundation.authz.model.resources.ResourceGroup;
import jp.co.intra_mart.foundation.authz.model.subjects.SubjectGroup;
import jp.co.intra_mart.foundation.authz.services.admin.PolicyManager;
import jp.co.intra_mart.foundation.authz.services.admin.PolicyManagerFactory;
import jp.co.intra_mart.foundation.authz.services.admin.SubjectManager;
import jp.co.intra_mart.foundation.authz.services.admin.SubjectManagerFactory;

/**
 * Provides policy configuration processing.
 */
public class AuthzPolicyConfigurationService {

    /**
     * Permits all authenticated users for the specified resource group and action.
     * @param resourceGroup the target resource group (already obtained via ResourceManager#registerAsResource, etc.)
     * @param resourceTypeId the resource type ID (e.g., "flat-crud")
     * @param action the action (a value defined by the resource type; for flat-crud, "c"/"r"/"u"/"d")
     * @return the registered policy
     */
    public Policy permitForAllAuthenticatedUsers(final ResourceGroup resourceGroup, final String resourceTypeId, final String action) {
        final SubjectManager subjectManager = SubjectManagerFactory.getInstance().getSubjectManager();
        final SubjectGroup authenticatedUsers = subjectManager.getAuthenticatedUsers();

        final PolicyManager policyManager = PolicyManagerFactory.getInstance().getPolicyManager();
        // The string version of setPolicy specifies resourceGroupId / subjectGroupId / resourceTypeId / action / effect directly
        return policyManager.setPolicy(
                resourceGroup.getResourceGroupId(), authenticatedUsers.getSubjectGroupId(),
                resourceTypeId, action, Effect.PERMIT.toString());
    }
}
```

- The only `Effect` values that can generally be registered are `PERMIT` / `DENY`. `BLOCK` is a value that appears only as the **result** of an authorization decision; registering it directly as a policy causes an `IllegalSerializationException`
- Calling `setPolicy` again for the same combination of (resource group, subject group, resource type, action) overwrites the existing policy (the API serves as both a new registration and an update)

## Pattern 4: Permission Checking (`AuthorizationClient`)

When a developer needs to actually determine "is this user allowed to perform this operation," use `AuthorizationClient`. There is normally no need to call `PolicyDecisionService`/`PolicyInformationService` directly.

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.authz.client.AuthorizationClient;
import jp.co.intra_mart.foundation.authz.client.AuthorizationClientFactory;
import jp.co.intra_mart.foundation.authz.client.AuthorizeResult;

import jp.co.example.foo.exception.ForbiddenOperationException;

/**
 * Provides permission-checking processing for order data.
 */
public class OrderAuthorizationService {

    /** The resource URI prefix (the leading "flat-crud" is the resource type ID). Always use the same constant as the registration processing */
    private static final String RESOURCE_URI_PREFIX = "flat-crud://myapp/orders/";

    /** The reference action ("r" in flat-crud) */
    public static final String ACTION_READ = "r";

    /** The update action ("u" in flat-crud) */
    public static final String ACTION_UPDATE = "u";

    /**
     * Checks whether the account-context user is permitted to perform the specified operation on the given order data.
     * @param orderId the order ID
     * @param action the action ({@link #ACTION_READ} / {@link #ACTION_UPDATE})
     * @throws ForbiddenOperationException if the permission is not granted
     */
    public void assertPermitted(final String orderId, final String action) throws ForbiddenOperationException {
        final String resourceUri = buildResourceUri(orderId);

        final AuthorizationClient client = AuthorizationClientFactory.getInstance().getAuthorizationClient();
        final AuthorizeResult result = client.authorize(resourceUri, action);

        // Always use .equals() for the comparison (safe against future additions of enum constants)
        if (!AuthorizeResult.Permit.equals(result)) {
            throw new ForbiddenOperationException(
                    "This operation is not permitted: resourceUri=" + resourceUri + ", action=" + action + ", result=" + result);
        }
    }

    /**
     * Performs a permission check using the specified user code (for when you want to check a user other than the account-context user).
     * @param userCd the user code
     * @param orderId the order ID
     * @param action the action
     * @return true if permitted
     */
    public boolean isPermittedFor(final String userCd, final String orderId, final String action) {
        final AuthorizationClient client = AuthorizationClientFactory.getInstance().getAuthorizationClient();
        return AuthorizeResult.Permit.equals(client.authorize(buildResourceUri(orderId), action, userCd));
    }

    /** Assembles the resource URI (shared between the registration processing and the checking processing). */
    private static String buildResourceUri(final String orderId) {
        return RESOURCE_URI_PREFIX + orderId;
    }
}
```

- If the argument is omitted, the decision is automatically made using the account context (the currently logged-in user). For batch processing where you want to specify the user explicitly, use the overload that takes `userCd`
- The `resourceURI` must exactly match the value registered in Pattern 1. Use the same logic wherever the string is assembled, in both the registration processing and the checking processing (extract it into a constant and a shared method, as `buildResourceUri` does above)

## Pattern 5: Inspecting and Removing Effective Policies

Use `getDeclaredPolicy` (explicit settings only) and `getActualPolicy` (with inheritance resolved) as appropriate. When displaying, in an admin screen, "which permission currently applies to this combination," use `getActualPolicy`.

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.authz.model.policies.Policy;
import jp.co.intra_mart.foundation.authz.services.admin.PolicyManager;
import jp.co.intra_mart.foundation.authz.services.admin.PolicyManagerFactory;

/**
 * Provides processing for inspecting and removing policies.
 */
public class AuthzPolicyInspectionService {

    /**
     * Retrieves the effective policy (with inheritance resolved) that actually applies to the specified combination.
     * @param resourceGroupId the resource group ID
     * @param subjectGroupId the subject group ID
     * @param resourceTypeId the resource type ID
     * @param action the action
     * @return the effective policy
     */
    public Policy getEffectivePolicy(final String resourceGroupId, final String subjectGroupId, final String resourceTypeId, final String action) {
        final PolicyManager policyManager = PolicyManagerFactory.getInstance().getPolicyManager();
        return policyManager.getActualPolicy(resourceGroupId, subjectGroupId, resourceTypeId, action);
    }

    /**
     * Removes only the explicitly registered policy, falling back to the inherited setting.
     * @param resourceGroupId the resource group ID
     * @param subjectGroupId the subject group ID
     * @param resourceTypeId the resource type ID
     * @param action the action
     */
    public void resetToInherited(final String resourceGroupId, final String subjectGroupId, final String resourceTypeId, final String action) {
        final PolicyManager policyManager = PolicyManagerFactory.getInstance().getPolicyManager();
        final Policy declared = policyManager.getDeclaredPolicy(resourceGroupId, subjectGroupId, resourceTypeId, action);

        // If there is no explicit setting (already fallen back to the inherited setting), do nothing
        if (declared != null) {
            policyManager.removePolicy(declared);
        }
    }
}
```

- `getDeclaredPolicy(...)` returns `null` when there is no explicit setting. The caller must always perform a null check
- Note that `removePolicy(...)` only removes the explicit setting; the fallback to the inherited policy remains (it does not result in a completely "unset" state)

## Pattern 6: Anti-Patterns (Avoid These)

```java
// NG: Comparing AuthorizeResult with == or with the arguments of equals reversed
// (result.equals(AuthorizeResult.Permit) itself works, but the Javadoc recommendation
//  is the AuthorizeResult.Permit.equals(result) form. From a null-safety standpoint too, start from the constant side)
if (result == AuthorizeResult.Permit) { // Risk of unintended branching if enum constants are added in the future
    // ...
}

// NG: Attempting to register a Subject on its own (no such API exists)
// subjectManager.register(subject); // compile error

// NG: Registering Effect.BLOCK directly as a policy
// BLOCK is a value reserved exclusively for decision results; only use PERMIT/DENY for policy registration
policyManager.setPolicy(resourceGroupId, subjectGroupId, resourceTypeId, action, Effect.BLOCK.toString()); // IllegalSerializationException

// NG: Caching a Manager/Client instance in a field across tenants
public class BadService {
    // Caching in a static field causes some APIs to fail on a tenant switch
    private static final ResourceManager RESOURCE_MANAGER = ResourceManagerFactory.getInstance().getResourceManager();
}

// NG: Neglecting to null-check the return value of getDeclaredPolicy()
final Policy declared = policyManager.getDeclaredPolicy(resourceGroupId, subjectGroupId, resourceTypeId, action);
policyManager.removePolicy(declared); // If declared is null, this results in an implementation-dependent exception or a meaningless call

// NG: Confusing the resource type ID with the resource URI
// The part before the first ":" (= "service") is resolved as the resource type ID.
// service is exclusively for URL-level authorization and its only action is execute, so view/approve and the like raise a NoSuchActionException
private static final String RESOURCE_TYPE_ID = "service://myapp/orders";
final String resourceUri = RESOURCE_TYPE_ID + ":" + orderId;

// NG: Duplicating the resource URI assembly logic between the registration processing and the checking processing, causing inconsistent notation
// Registration side: "flat-crud://myapp/orders/" + orderId
// Checking side: "flat-crud://myapp/orders:" + orderId  ← the delimiter differs, so they never match and the permission is never granted
```