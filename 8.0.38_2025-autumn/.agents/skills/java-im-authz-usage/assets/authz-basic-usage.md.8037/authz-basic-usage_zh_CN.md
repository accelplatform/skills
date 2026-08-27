# Authz API 基本使用模式（Java 版）

关于 `ResourceManager` / `SubjectManager` / `PolicyManager` / `AuthorizationClient` 的签名和内部行为，请参见 `reference/authz-api-reference.md`。本文档展示典型的调用模式。

## 模式1：注册资源

使用 `ResourceManager#registerAsResource(...)` 将资源URI注册为认可对象，并获得与之成对的 `ResourceGroup` 的基本形式。

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
 * 提供认可资源的注册处理。
 */
public class AuthzResourceRegistrationService {

    /** 本应用程序的资源类型ID */
    private static final String RESOURCE_TYPE_ID = "service://myapp/orders";

    /**
     * 将订单数据注册为资源。
     * @param orderId 订单ID
     * @param displayName 资源组的显示名称（日语）
     * @throws ResourceRegistrationException 注册失败时抛出
     */
    public void registerOrderResource(final String orderId, final String displayName) throws ResourceRegistrationException {
        // 资源URI采用 "RESOURCE-TYPE-ID:IDENTIFIER-COMPONENT" 格式
        final String resourceUri = RESOURCE_TYPE_ID + ":" + orderId;
        final I18nValue<String> name = new I18nValue<String>(Locale.JAPANESE, displayName);

        // Manager 实例不应跨租户重复使用，每次都应从 Factory 重新获取
        final ResourceManager resourceManager = ResourceManagerFactory.getInstance().getResourceManager();
        try {
            final ResourceGroup resourceGroup = resourceManager.registerAsResource(resourceUri, name);
            // 如有需要，可将 resourceGroup.getResourceGroupId() 等返回给调用方
        } catch (final InvalidResourceUriException e) {
            throw new ResourceRegistrationException("资源URI的格式不正确: resourceUri=" + resourceUri, e);
        }
    }
}
```

- 资源URI采用 `RESOURCE-TYPE-ID:IDENTIFIER-COMPONENT` 格式。为避免与其他应用程序冲突，应以应用程序名、组件名划分层级来设计
- `I18nValue<String>` 是 `HashMap<Locale, String>` 的子类。如需持有多个区域设置的显示名称，可额外调用 `put(locale, value)`
- `Manager` 实例不应缓存在字段中，每次调用都应从 `Factory` 重新获取（因为该设计会导致在切换租户时重复使用实例会使部分 API 失败）

## 模式2：注册主体组（通过 `Expression` 构建条件表达式）

主体（Subject）不能单独注册，必须先通过 `SubjectExpression.S(subject)` 转换为表达式，再传给 `SubjectManager#registerSubjectGroup(Expression, ...)`。

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
 * 提供主体组的注册处理。
 */
public class AuthzSubjectRegistrationService {

    /**
     * 注册表示单个主体（例如：特定角色）的主体组。
     * @param subject 目标主体（具体实现由扩展模块提供，例如 ImPublicGroupRoleSubject 等）
     * @param displayName 主体组的显示名称
     * @return 已注册的主体组
     */
    public SubjectGroup registerSingleSubjectGroup(final Subject subject, final String displayName) {
        final Expression expression = SubjectExpression.S(subject);
        final I18nValue<String> name = new I18nValue<String>(Locale.JAPANESE, displayName);

        final SubjectManager subjectManager = SubjectManagerFactory.getInstance().getSubjectManager();
        return subjectManager.registerSubjectGroup(expression, name);
    }

    /**
     * 注册组合多个条件（AND/OR/NOT）的主体组。
     * 例如：符合 subjectA 且不符合 subjectB 的用户群。
     * @param subjectA AND 条件的目标主体
     * @param subjectB NOT 条件的目标主体
     * @param displayName 主体组的显示名称
     * @return 已注册的主体组
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

- `Subject` 的具体实现（部门、公共组、角色等）不在本技能范围内（由 `im_master_subjecttypes` 等扩展模块提供）。应设计为从调用方接收 `Subject` 实例
- 如果只是想为「所有用户」「未认证用户」设置策略，无需新注册主体组，直接使用内置组 `SubjectManager#getAuthenticatedUsers()` / `getGuestSubjectGroup()`（参见模式3）

## 模式3：设置策略（登记许可・禁止）

通过 `PolicyManager#setPolicy(...)` 登记资源组、主体组、动作、效果的组合。

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
 * 提供策略的设置处理。
 */
public class AuthzPolicyConfigurationService {

    /**
     * 对所有已认证用户，许可指定的资源组和动作。
     * @param resourceGroup 目标资源组（通过 ResourceManager#registerAsResource 等已获取的资源组）
     * @param resourceTypeId 资源类型ID
     * @param action 动作（例如："view"）
     * @return 已登记的策略
     */
    public Policy permitForAllAuthenticatedUsers(final ResourceGroup resourceGroup, final String resourceTypeId, final String action) {
        final SubjectManager subjectManager = SubjectManagerFactory.getInstance().getSubjectManager();
        final SubjectGroup authenticatedUsers = subjectManager.getAuthenticatedUsers();

        final PolicyManager policyManager = PolicyManagerFactory.getInstance().getPolicyManager();
        // 字符串版本的 setPolicy 直接指定 resourceGroupId / subjectGroupId / resourceTypeId / action / effect
        return policyManager.setPolicy(
                resourceGroup.getResourceGroupId(), authenticatedUsers.getSubjectGroupId(),
                resourceTypeId, action, Effect.PERMIT.toString());
    }
}
```

- 作为 `Effect` 基本上只能登记 `PERMIT` / `DENY`。`BLOCK` 只是作为认可判断的**结果**才会出现的值，若直接作为策略登记会引发 `IllegalSerializationException`
- 对同一 (资源组, 主体组, 资源类型, 动作) 组合再次调用 `setPolicy` 时，会覆盖已有的策略（该 API 同时兼具新登记和更新两种功能）

## 模式4：权限确认（`AuthorizationClient`）

当开发者需要实际判断「该用户是否可以执行此操作」时，使用 `AuthorizationClient`。通常无需直接调用 `PolicyDecisionService`/`PolicyInformationService`。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.authz.client.AuthorizationClient;
import jp.co.intra_mart.foundation.authz.client.AuthorizationClientFactory;
import jp.co.intra_mart.foundation.authz.client.AuthorizeResult;

import jp.co.example.foo.exception.ForbiddenOperationException;

/**
 * 提供针对订单数据的权限确认处理。
 */
public class OrderAuthorizationService {

    /** 本应用程序的资源类型ID */
    private static final String RESOURCE_TYPE_ID = "service://myapp/orders";

    /**
     * 确认账户上下文中的用户是否被许可对指定的订单数据执行操作。
     * @param orderId 订单ID
     * @param action 动作（例如："view", "approve"）
     * @throws ForbiddenOperationException 权限未被许可时抛出
     */
    public void assertPermitted(final String orderId, final String action) throws ForbiddenOperationException {
        final String resourceUri = RESOURCE_TYPE_ID + ":" + orderId;

        final AuthorizationClient client = AuthorizationClientFactory.getInstance().getAuthorizationClient();
        final AuthorizeResult result = client.authorize(resourceUri, action);

        // 判定必须使用 .equals()（对未来枚举常量的增加更安全）
        if (!AuthorizeResult.Permit.equals(result)) {
            throw new ForbiddenOperationException(
                    "该操作未被许可: resourceUri=" + resourceUri + ", action=" + action + ", result=" + result);
        }
    }

    /**
     * 使用指定的用户代码进行权限确认（想确认账户上下文以外的用户时使用）。
     * @param userCd 用户代码
     * @param orderId 订单ID
     * @param action 动作
     * @return 已被许可时返回 true
     */
    public boolean isPermittedFor(final String userCd, final String orderId, final String action) {
        final String resourceUri = RESOURCE_TYPE_ID + ":" + orderId;
        final AuthorizationClient client = AuthorizationClientFactory.getInstance().getAuthorizationClient();
        return AuthorizeResult.Permit.equals(client.authorize(resourceUri, action, userCd));
    }
}
```

- 省略参数时，会自动以账户上下文（当前登录用户）进行判断。在批处理等场景中如需明确指定用户，请使用传递 `userCd` 的重载
- `resourceURI` 必须与模式1中登记的值完全一致。组装字符串的地方（如 `RESOURCE_TYPE_ID + ":" + orderId`）在登记处理和确认处理中应使用相同的逻辑（推荐提取为常量或公共方法）

## 模式5：参照与删除实效策略

区分使用 `getDeclaredPolicy`（仅明确设置的策略）和 `getActualPolicy`（已补充继承的策略）。在管理画面中显示「当前该组合实际应用了哪个权限」时，使用 `getActualPolicy`。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.authz.model.policies.Policy;
import jp.co.intra_mart.foundation.authz.services.admin.PolicyManager;
import jp.co.intra_mart.foundation.authz.services.admin.PolicyManagerFactory;

/**
 * 提供策略的参照・解除处理。
 */
public class AuthzPolicyInspectionService {

    /**
     * 获取实际应用于指定组合的实效策略（已补充继承）。
     * @param resourceGroupId 资源组ID
     * @param subjectGroupId 主体组ID
     * @param resourceTypeId 资源类型ID
     * @param action 动作
     * @return 实效策略
     */
    public Policy getEffectivePolicy(final String resourceGroupId, final String subjectGroupId, final String resourceTypeId, final String action) {
        final PolicyManager policyManager = PolicyManagerFactory.getInstance().getPolicyManager();
        return policyManager.getActualPolicy(resourceGroupId, subjectGroupId, resourceTypeId, action);
    }

    /**
     * 仅解除明确登记的策略，回退到继承来源的设置。
     * @param resourceGroupId 资源组ID
     * @param subjectGroupId 主体组ID
     * @param resourceTypeId 资源类型ID
     * @param action 动作
     */
    public void resetToInherited(final String resourceGroupId, final String subjectGroupId, final String resourceTypeId, final String action) {
        final PolicyManager policyManager = PolicyManagerFactory.getInstance().getPolicyManager();
        final Policy declared = policyManager.getDeclaredPolicy(resourceGroupId, subjectGroupId, resourceTypeId, action);

        // 如果不存在明确设置（已经回退到继承来源），则不做任何处理
        if (declared != null) {
            policyManager.removePolicy(declared);
        }
    }
}
```

- `getDeclaredPolicy(...)` 在没有明确设置时返回 `null`。调用方必须务必进行 null 检查
- 请注意 `removePolicy(...)` 仅删除明确设置，回退到继承来源策略的状态仍然保留（不会变为完全「未设置」的状态）

## 模式6：反模式集（应避免的写法）

```java
// NG: 使用 == 或参数顺序相反的 equals 比较 AuthorizeResult
// (result.equals(AuthorizeResult.Permit) 本身可以运行，但 Javadoc 推荐的是
//  AuthorizeResult.Permit.equals(result) 的形式。从空值安全性的角度出发，也应以常量一侧为起点)
if (result == AuthorizeResult.Permit) { // 未来增加枚举常量时存在意外分支的风险
    // ...
}

// NG: 试图单独注册 Subject（不存在这样的 API）
// subjectManager.register(subject); // 编译错误

// NG: 将 Effect.BLOCK 直接作为策略登记
// BLOCK 是判断结果专用的值，策略登记时只能使用 PERMIT/DENY
policyManager.setPolicy(resourceGroupId, subjectGroupId, resourceTypeId, action, Effect.BLOCK.toString()); // IllegalSerializationException

// NG: 将 Manager/Client 实例跨租户缓存在字段中
public class BadService {
    // 缓存在 static 字段中，会导致在切换租户时部分 API 失败
    private static final ResourceManager RESOURCE_MANAGER = ResourceManagerFactory.getInstance().getResourceManager();
}

// NG: 忽略对 getDeclaredPolicy() 返回值的 null 检查
final Policy declared = policyManager.getDeclaredPolicy(resourceGroupId, subjectGroupId, resourceTypeId, action);
policyManager.removePolicy(declared); // declared 为 null 时，会导致依赖实现的异常或无意义的调用

// NG: 在登记处理和确认处理中重复资源URI的组装逻辑，导致写法不一致
// 登记侧: "service://myapp/orders:" + orderId
// 确认侧: "service://myapp/orders/" + orderId  ← 分隔符不同导致不一致，结果始终相当于 NOT_APPLICABLE
```