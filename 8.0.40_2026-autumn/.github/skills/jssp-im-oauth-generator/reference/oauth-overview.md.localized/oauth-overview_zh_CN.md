# im_oauth REST-API 全体概述

intra-mart Accel Platform 内置了 OAuth 2.0 提供方功能（`im_oauth_provider`），可以向外部客户端应用程序公开带 OAuth 授权的 REST-API。
在 JSSP（脚本开发模型）中，将函数容器注册为「资源的实现」，通过 `oauth-client-resources-config` 映射到访问 URL。

## 所需资材（4 种）

要新增一个经由 OAuth 公开的 REST-API，需要齐备以下 4 个文件。

| # | 种别 | 存放位置 | 作用 |
|---|------|--------|------|
| 1 | 范围定义 XML | `src/main/conf/oauth-client-scopes-config/{任意的文件名}.xml` | 定义访问范围（scope） |
| 2 | 资源 URL 设置 XML | `src/main/conf/oauth-client-resources-config/{任意的文件名}.xml` | URL ↔ JSSP 资源（或 Java 类）的映射、所需 scope 的声明 |
| 3 | 客户端详细设置 XML | `src/main/conf/oauth-client-details-config/{任意的文件名}.xml` | 允许访问的客户端应用程序（client_id / client_secret / 授权种别 / 使用 scope） |
| 4 | 资源实现 .js | `src/main/jssp/src/{功能名}/oauth/{file}.js` | 实际的 REST-API 处理（init 函数） |

> **注意:** 放置在 `src/main/conf/` 下的设置文件，在构建・部署后将被放置到 WAR 的 `WEB-INF/conf/...`。intra-mart 官方参考中的「`WEB-INF/conf/...`」表示部署后的路径，本项目源码中指向 `src/main/conf/...`。

## 与常规 JSSP REST-API（经由 routing-jssp-config）的差异

| 观点 | 常规 REST-API | OAuth REST-API |
|------|----------------|----------------|
| URL 映射 | `src/main/conf/routing-jssp-config/*.xml` 的 `<file-mapping>` | `oauth-client-resources-config` 的 `<client-resource path="..." target="..." />` |
| 认证 | 租户登录会话（Cookie） | OAuth 访问令牌（`Authorization: Bearer ...`）。由平台验证 |
| 授权 | `<authz>` 的 URI/action 指定（可选） | `<authz>` 中选择 `welcome-all`（允许任何人）或 `uri/action`（通过授权资源控制）。此外，访问令牌的 **scope** 必须与 `<client-resource>` 的 `<scope id>` 一致（AND 评估） |
| CSRF 对策（安全令牌） | 更新类必需 | **不需要**（OAuth 令牌作为认证起作用。不要附加 `X-Intramart-Secure-Token` 验证） |
| 认证用户获取 | `Contexts.getAccountContext()` | 同样为 `Contexts.getAccountContext()`。令牌持有用户的上下文会被设置 |
| `.html` 配对文件 | 画面情况下必须 | **不需要**（因为不是展示页面） |

## 端点 URL 的格式

`oauth-client-resources-config` 的 `<client-resource path="...">` 中所写的值，将直接作为公开 URL 的路径使用。
客户端应用程序按以下格式访问:

```
GET {上下文路径}{path}
Authorization: Bearer <访问令牌>
```

`{path}` 的示例:
- `<client-resource path="/oauth/jssp/sample" ... />` → `https://example.com/imart/oauth/jssp/sample`
- `<client-resource path="/oauth/sample_oauth/get_user" ... />` → `https://example.com/imart/oauth/sample_oauth/get_user`

> 项目内惯例使用以 `/oauth/...` 开头的 URL（实际 URL 前缀取决于 OAuth 提供方功能的调度器实现，部署后请务必进行动作确认）。

## scope 与 authz 的关系（重要）

OAuth REST-API 的访问控制以 **2 个阶段** 进行（AND 评估）。

1. **访问令牌的 scope 检查**: 客户端通过授权码流程获取的访问令牌与用户同意的 scope 集合相关联。必须与 `<client-resource>` 的 `<scope id="...">` 完全一致
2. **授权（authz）检查**: 在 `<client-resource>` 的 `<authz>` 中指定。写法有 2 种:
   - (A) 省略 `<authz>`（回退至顶部的 `<authz-default mapper="welcome-all" />`）… 授权判定恒为通过（仅由 scope 控制）。**无需追加成果物即可运行**。显式书写 `<authz mapper="welcome-all" />` 属于冗余，应避免（与 routing-jssp-config 相同的规约）
   - (B) `<authz uri="service://..." action="execute" />` … 通过授权资源 URI/action 按角色／用户单位控制。**需另行准备授权资源的导入资材**（若不准备则始终返回 403）

两者都不满足时，平台在调用应用程序的 `init` 之前会返回 401 / 403。
(A)(B) 的选择标准请参考 `oauth-resources-config.md` 的「`<authz>` 的写法」。

## 4 个步骤的作业顺序

1. **决定 scope** → 编写 `oauth-client-scopes-config`
2. **决定资源 URL（path）与 JSSP 文件路径（target）** → 编写 `oauth-client-resources-config`（在 `<scope>` 中引用 1）
3. **决定客户端详细信息**（client_id / client_secret / 使用 scope）→ 编写 `oauth-client-details-config`（在 `<scope>` 中引用 1）
4. **实现 JSSP（.js）** → 放置到 2 中 `target` 指定的路径

## 相关参考

- `oauth-scopes-config.md` - scope 设置 XML 的写法
- `oauth-resources-config.md` - 资源 URL 设置 XML 的写法
- `oauth-client-details-config.md` - 客户端详细设置 XML 的写法
- `oauth-resource-implementation.md` - JSSP（.js）的实现规则

## 一次信息

- intra-mart Accel Platform OAuth 编程指南
  - 「intra-mart Accel Platform 上的资源提供方法（脚本开发模型）」
    `https://document.intra-mart.jp/library/iap/public/im_oauth/im_oauth_programming_guide/texts/script/index.html`
- 设置文件参考
  - `oauth-client-scopes-config`
    `https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_oauth/oauth-client-scopes-config/index.html`
  - `oauth-client-resources-config`
    `https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_oauth/oauth-client-resources-config/index.html`
  - `oauth-client-details-config`
    `https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_oauth/oauth-client-details-config/index.html`
