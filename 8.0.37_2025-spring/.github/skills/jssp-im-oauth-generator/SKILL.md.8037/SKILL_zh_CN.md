---
name: jssp-im-oauth-generator
description: 新建 intra-mart Accel Platform OAuth 提供方功能（im_oauth）公开的 REST-API 资源。通过创建 spec.json 并执行 scripts/build-oauth.js，一次性生成 scope 定义 XML、资源 URL 映射 XML、客户端详细设置 XML 和 JSSP 资源实现（.js 骨架）。当提及"创建 OAuth REST-API"、"用 OAuth 保护对外公开的 API"、"添加用 OAuth 令牌认证的 API"、"创建 im_oauth 资源"、"定义 OAuth 范围"、"添加 oauth-client-resources-config"时使用。CSRF 安全令牌版的 REST-API 请使用 jssp-page-generator。
allowed-tools: Bash, Read, Write, Glob
---

# im_oauth REST-API 资源生成技能

## 目的

使用 intra-mart Accel Platform 的 **OAuth 提供方功能**，向外部客户端应用程序新公开带 OAuth 访问令牌认证的 REST-API 的技能。
采用 **从一个 `spec.json` 通过 `scripts/build-oauth.js` 一次性生成 4 种资材（scope 定义、资源 URL 映射、客户端详细设置、JSSP 资源实现的骨架）** 的方式（与 `jssp-im-workflow-generator` 同方式）。
编码代理只编写 spec.json，XML 的细节结构和 JSSP 的共通骨架由脚本自动生成。

## 生成对象

- **范围（scope）定义 XML** - `src/main/conf/oauth-client-scopes-config/{功能名}.xml`
- **资源 URL 设置 XML** - `src/main/conf/oauth-client-resources-config/{功能名}.xml`
- **客户端详细设置 XML** - `src/main/conf/oauth-client-details-config/{功能名}.xml`
- **资源实现 .js** - `src/main/jssp/src/{功能名}/oauth/{file}.js`

注：含展示页面（`.html`）的画面、作业、工作流联动处理分别使用 `jssp-page-generator` / `jssp-im-job-generator` / `jssp-im-workflow-usage`。
注：通过浏览器租户登录会话调用的常规 REST-API（带 CSRF 安全令牌验证）请使用 `jssp-page-generator`（本技能面向外部系统）。

## 使用时机

当用户做出以下类型的请求时:

- "创建 OAuth REST-API"
- "公开可由外部系统使用 OAuth 令牌使用的 API"
- "添加 im_oauth 资源"
- "在 oauth-client-resources-config 中添加新 URL"
- "新定义 OAuth 范围"

---

## 文件构成

```
jssp-im-oauth-generator/
├── SKILL.md
├── scripts/
│   └── build-oauth.js              # spec.json → XML 3 种 + JSSP 骨架，一次性生成
├── reference/
│   ├── oauth-overview.md           # 全体概述、与常规 REST-API 的差异
│   ├── oauth-scopes-config.md      # scope 定义 XML 参考
│   ├── oauth-resources-config.md   # 资源 URL 设置 XML 参考
│   ├── oauth-client-details-config.md  # 客户端详细设置 XML 参考
│   └── oauth-resource-implementation.md # JSSP (.js) 实现规则
├── examples/
│   └── sample_oauth.spec.json       # spec.json 示例（用户信息查询 API）
└── assets/
    └── sample-oauth-get-user.md     # 完整示例（用于抄写、与 CSRF 版的差异）
```

---

## 综合工作流程

**请按从上到下的顺序执行此工作流程。禁止省略步骤或更改顺序。**
每一步完成后再进入下一步。在步骤 6 完成后才向用户报告。

---

### 步骤 1：需求访谈

向用户确认以下内容（未给出时进行询问）。

| 确认项 | 示例 |
|---------|-----|
| 功能名（目录名・XML 文件名） | `sample_oauth`、`equipment_api` |
| API 名・文件名 | `get_user`、`list_equipments` |
| 公开 URL（`path`） | `/oauth/sample_oauth/get_user` |
| HTTP 方法 | `GET` / `POST` / `PUT` / `DELETE` |
| 查询／正文参数 | `userCd` 必填、字符串最长 100 字符等 |
| 所需 scope（新定义或使用既有） | `sample_oauth_user_read` 新建 |
| **授权资源（`<authz>`）** | 每个资源必须指定 `uri/action` 授权资源（禁止使用 `welcome-all` 跳过授权）。`uri` 为 `service://{功能名}/{API名}`，`action` 通常为 `execute`。详情请参考 `reference/oauth-resources-config.md`「`<authz>` 的写法与 scope 的关系」。**须向用户确认同时需要生成授权资源导入资材（`jssp-tenant-setup-generator`）** |
| 客户端信息（使用既有客户端或新建） | client_id、client_secret、redirect-uri |
| 业务逻辑内容 | 从 AccountInfoManager 获取并以 JSON 返回等（由于是手工补充因此只要概述即可） |

判断有分歧的项目，请勿擅自决定，须向用户确认。

---

### 步骤 2：参考文件的读入

使用 **Read 工具打开并读入** 以下 5 个文件。不得凭记忆或推测书写。

| 文件 | 内容 |
|---------|------|
| `reference/oauth-overview.md` | 全体概述，与常规 REST-API 的差异 |
| `reference/oauth-scopes-config.md` | scope 定义 XML 规格 |
| `reference/oauth-resources-config.md` | 资源 URL 设置 XML 规格（特别是 `<authz>` 的 (A)(B) 选择） |
| `reference/oauth-client-details-config.md` | 客户端详细设置 XML 规格 |
| `reference/oauth-resource-implementation.md` | JSSP (.js) 实现方针・业务逻辑写法 |

实现业务逻辑时，JSSP 的标准编码规约・错误处理・安全规约 **均适用**。视需要参考以下内容。

- `.github/instructions/jssp-function-container.instructions.md` - 基本结构
- `.github/instructions/jssp-error-handling.instructions.md` - 错误响应・HTTP 状态码
- `.github/instructions/jssp-logging.instructions.md` - 日志输出
- `.github/instructions/jssp-security.instructions.md` - SQL 注入・机密信息处理
- `.github/instructions/jssp-2way-sql.instructions.md` - 涉及 DB 访问时
- `.github/skills/jssp-page-generator/reference/api-web.md` - `Web.getHTTPResponse()`
- `.github/skills/jssp-page-generator/reference/api-account-context.md` - 获取认证用户
- `.github/skills/jssp-page-generator/reference/argument-request.md` - `request` 参数

---

### 步骤 3：组装 spec.json

用 Read 工具打开 `examples/sample_oauth.spec.json` **必须确认结构**，再以访谈结果创建 `/tmp/{功能名}.spec.json`。
spec.json 的结构与参考 XML 一一对应，因此无需边看参考边决定字段名。

```jsonc
{
  "feature": "sample_oauth",                    // 功能名（目录・XML 文件名）
  "errorCodeProduct": "IWP",                    // 错误代码前缀 E.{IWP}.{FEATURE}.{API}.NNNNN

  "scopes": [                                   // 可多个。标准准备 3 种语言 (ja/en/zh_CN)
    {
      "id": "sample_oauth_user_read",
      "defaultSubject": "Sample OAuth user-read scope",
      "localizations": {
        "ja": { "subject": "...", "text": "..." },
        "en": { "subject": "...", "text": "..." },
        "zh_CN": { "subject": "...", "text": "..." }
      }
    }
  ],

  "resources": [                                // 公开的 REST-API 的 URL 映射（可多个）
    {
      "id": "sample-oauth-get-user",            // <client-resource id>
      "path": "/oauth/sample_oauth/get_user",   // 公开 URL
      "type": "jssp",                           // jssp 或 java
      "file": "get_user",                       // JSSP 文件名（不含扩展名）
                                                //   → target 自动为 {feature}/oauth/{file}
      "authz": { "uri": "service://sample_oauth/get_user", "action": "execute" },
                                                // 必填。不可使用 welcome-all。指定 uri/action 时
                                                //   会输出 <authz uri="..." action="..." />
                                                //   （省略或指定 "welcome-all" 会使 build-oauth.js 报错停止）
      "scopes": ["sample_oauth_user_read"],

      "api": {                                  // JSSP 骨架生成用参数
        "title": "用户信息查询 REST-API（OAuth 公开版）",
        "description": "...（@description 注释的内容）",
        "logPrefix": "sample_oauth/get_user",   // logger 内的 [...] 前缀
        "allowedMethods": ["GET"],
        "parameters": [                         // 用于自动生成验证
          {
            "name": "userCd",
            "required": true,
            "maxLength": 100,
            "pattern": "^[0-9A-Za-z_@.+!\\-]+$",
            "patternMessage": "userCd 的格式不正确。"
          }
        ],
        "extraErrorCodes": [                    // 除 ERROR_CODE_INVALID_REQUEST / METHOD_NOT_ALLOWED / INTERNAL 之外
          { "name": "USER_NOT_FOUND", "code": "00004" }
        ]
      }
    }
  ],

  "clients": [                                  // 客户端应用程序注册（可多个）
    {
      "clientId": "sample-oauth-client",
      "grantType": "authorization_code",
      "clientSecret": "change-me-in-production",  // 生产值不得直接写入仓库
      "redirectUri": "https://example.com/sample_oauth/callback",
      "accessTokenValiditySeconds": 3600,
      "codeChallenge": "S256",
      "defaultName": "Sample OAuth Client",
      "localizations": {
        "ja":    { "clientName": "...", "description": "..." },
        "en":    { "clientName": "...", "description": "..." },
        "zh_CN": { "clientName": "...", "description": "..." }
      },
      "scopes": ["sample_oauth_user_read"]
    }
  ]
}
```

**编写 spec.json 时的注意事项:**
- `feature` 只能为 **lowercase snake_case**（小写英数字、下划线）
- `scopes[].id` 必须从 `resources[].scopes[]` 与 `clients[].scopes[]` **以一致的名称引用**（不一致由 build 脚本检测并报错）
- `path` 应与 `routing-jssp-config` 的 URL 不重复，事先用 Glob 确认 `src/main/conf/routing-jssp-config/`
- `<localizations>` 的 3 种语言 (`ja` / `en` / `zh_CN`) **标准全部写入**
- `api.parameters` 由 build 脚本自动展开为 `validateRequest()`。如果在 spec 中表达必填／最大长度／正则，则会生成相应的验证代码
- `api.extraErrorCodes` 只列出 `INVALID_REQUEST` / `METHOD_NOT_ALLOWED` / `INTERNAL` 以外需要的错误代码

---

### 步骤 4：执行 build-oauth.js

```bash
node .github/skills/jssp-im-oauth-generator/scripts/build-oauth.js \
     /tmp/{功能名}.spec.json
```

build-oauth.js 自动执行的内容:
- 验证 spec.json（检测 scope ID 不一致、必填字段缺失、模式不正确，并立即停止）
- 生成 `src/main/conf/oauth-client-scopes-config/{feature}.xml`（覆盖既有）
- 生成 `src/main/conf/oauth-client-resources-config/{feature}.xml`（覆盖既有）
- 生成 `src/main/conf/oauth-client-details-config/{feature}.xml`（覆盖既有）
- 生成 `src/main/jssp/src/{feature}/oauth/{file}.js`（**若文件已存在则跳过并警告**，以防业务逻辑误删除）
- 3 种语言区域展开、错误代码常量的连号、验证函数的自动展开、JSDoc 整形

**选项:**
- `--xml-only` … 只更新 3 个 XML 文件，不触动 JSSP。在 **变更 spec 后想保护已实现业务逻辑的 .js 同时仅重新生成 XML** 时使用

```bash
# spec 更新 → 仅重新生成 XML（保持 JSSP 业务逻辑）
node .github/skills/jssp-im-oauth-generator/scripts/build-oauth.js \
     /tmp/{功能名}.spec.json --xml-only
```

**想强制重新生成 JSSP 骨架时：** 手动删除目标 `.js` 文件后重新执行。

---

### 步骤 5：补充 JSSP 业务逻辑

build-oauth.js 生成的 JSSP 骨架包含:
- `init(request)` 全体结构
- `checkMethod()` / `validateRequest()`（自动从 spec 的 `parameters` 展开）
- `throwApiError()` / `throwValidationError()`
- `sendJsonResponse()`
- `processBusinessLogic(request)` 作为 **带 TODO 注释的空函数** 占位

手工补充 `processBusinessLogic` 的内容。参考 `reference/oauth-resource-implementation.md` 与 `assets/sample-oauth-get-user.md` 的实现示例。

**补充时的规约:**
- 涉及 DB 访问时遵循 `.github/instructions/jssp-2way-sql.instructions.md`，将 SQL 文件外置于 `src/main/jssp/src/{功能名}/sql/` 目录下，使用 `executeByTemplate`
- 响应 JSON 不得包含 **机密信息（密码、认证令牌、未脱敏的个人信息）**
- 用户不存在等情况以 `throwApiError(ERROR_CODE_*, 404, '...')` 抛出（已在 spec 的 `extraErrorCodes` 中常量化）

---

### 步骤 6：手动检查

build-oauth.js 会自动验证以下内容，因此此处仅确认脚本无法检测的 **手动补充后的项目**。

> **build-oauth.js 已自动检查:** spec.json 的模式、必填字段、scope ID 的引用一致性（从 resources・clients 引用的 scope 是否存在于 `scopes[]`）

| 检查项 | 确认内容 |
|------------|---------|
| URL 无重复 | `oauth-client-resources-config` 的 `path` 是否与 `routing-jssp-config` 的 URL 重复（用 Glob 与 Grep 确认） |
| 无安全令牌验证 | 补充的业务逻辑中是否混入 `verifySecureToken` / `X-Intramart-Secure-Token` 字符串（用 Grep 确认） |
| **授权资源的整合** | 每个 `<client-resource>` 是否明示了 `<authz uri/action>`，且相应的授权资源导入资材（由 `jssp-tenant-setup-generator` 生成）是否准备好 |
| 业务逻辑的实现 | `processBusinessLogic` 中的 `// TODO:` 注释是否已删除 |
| jssp-page-generator 的脚本 | 若 `validate-jssp-code.js` 可用，则对生成的 `.js` 运行 |

**到此完成后向用户报告。**
报告中包含以下内容:

- 使用的 spec.json 路径
- 生成的文件清单（路径）
- 公开端点 URL（假定带上下文路径）
- 所需 scope
- 假定请求示例（`curl` 等）
- 使用既有客户端／新建客户端的哪一种
- 授权资源（`uri/action`）的指定内容。**须明示接下来需要用 `jssp-tenant-setup-generator` 生成相应的授权资材**
- 用户在 **部署后须确认的项目**（管理画面中 scope / client / resource 是否注册成功、构建过滤器是否替换了 client-secret、从其他源访问时是否需要 CORS 允许设置等）

---

## 常见失败模式

- **写入安全令牌验证**: OAuth REST-API 中不需要。误写会导致仅持有 OAuth 访问令牌的客户端被 400 拒绝
- **创建 `.html` 配对文件**: OAuth 资源不返回 HTML，因此无需创建配对文件
- **resources-config 与 details-config 中 scope ID 不一致**: 会出现客户端无法请求 scope、资源所需 scope 未提供等不一致
- **`path` 与 routing-jssp-config 重复**: 在平台端的调度中冲突
- **将 client-secret 的生产值直接写入仓库**: 泄露风险。请使用过滤器替换或按环境的设置切换

## 相关技能

- `jssp-page-generator` - 常规画面・REST-API（CSRF 安全令牌版）
- `jssp-im-master-usage` - IM 通用主数据检索（用户・组织・公司的检索对话框）
- `jssp-tenant-setup-generator` - 租户环境设置资材生成（在此处嵌入 OAuth 客户端信息的过滤器替换运用等）
- `jssp-code-review` / `jssp-security-check` - 生成后的质量检查
