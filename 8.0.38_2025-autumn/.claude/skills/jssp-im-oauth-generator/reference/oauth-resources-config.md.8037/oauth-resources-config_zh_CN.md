# oauth-client-resources-config（资源 URL 设置）

将作为 OAuth REST-API 公开的 **URL（path）** 与 **JSSP 资源实现文件（target）** 进行映射的设置文件。
相当于 `routing-jssp-config` 的 OAuth 版，在同一元素中声明按 URL 的授权方式（`<authz>`）与所需 scope。

## 存放位置

```
src/main/conf/oauth-client-resources-config/{任意的文件名}.xml
```

部署后将放置在 `WEB-INF/conf/oauth-client-resources-config/...`。

## XML 结构

```
<oauth-client-resources-config>
  <client-resources>
    <client-resource id="..." path="..." type="jssp|java" target="...">
      <authz uri="service://..." action="execute" /> ← 必需。参考下文「<authz> 的写法」（明示 uri/action）
      <scope id="..." />                            ← 必需。如需以 AND 条件要求多个 scope 则重复书写
    </client-resource>
  </client-resources>
</oauth-client-resources-config>
```

> 每个 `<client-resource>` 必须 **明示** `<authz uri="service://..." action="execute" />`。禁止使用 `welcome-all` 跳过授权（通过 `<authz-default>` 回退或 `<authz mapper="welcome-all" />`）。`build-oauth.js` 也会在 `spec.json` 的 `authz` 为 `"welcome-all"` 或省略 `authz` 字段时报错停止。

## 元素・属性一览

| 元素 / 属性 | 必填 | 说明 |
|-------------|:----:|------|
| `oauth-client-resources-config`（根） | ○ | 命名空间 `http://intra-mart.co.jp/system/oauth/provider/client/resource/config/oauth-client-resources-config` |
| `client-resources` | ○ | client-resource 的父元素 |
| `client-resource` | ○ | 单独的资源定义 |
| `client-resource/@id` | ○ | 资源的唯一 ID（用于运维日志等的识别） |
| `client-resource/@path` | ○ | 要公开的 URL 路径（例：`/oauth/sample_oauth/get_user`） |
| `client-resource/@type` | ○ | `jssp` 或 `java` |
| `client-resource/@target` | ○ | `type="jssp"` 时为以 `src/main/jssp/src/` 为起点的 **不含扩展名** 的路径。<br>`type="java"` 时为实现类的 FQCN |
| `authz` | ○ | 调用此 URL 所需的授权资源（必须以 `uri/action` 指定） |
| `authz/@uri` | ○ | 授权资源 URI（例：`service://sample_oauth/get_user`） |
| `authz/@action` | ○ | 授权动作（多为 `execute`） |
| `scope` | ○ | 所需 scope。1 个以上必需 |
| `scope/@id` | ○ | `oauth-client-scopes-config` 中定义的 scope 的 ID |

> `target` 的指定示例
> - 以 `src/main/jssp/src/sample_oauth/oauth/get_user.js` 为实现时 → `target="sample_oauth/oauth/get_user"`
> - 以 `src/main/jssp/src/equipment_api/oauth/list.js` 为实现时 → `target="equipment_api/oauth/list"`
>
> 在功能目录（`{功能名}/`）正下方设置 `oauth/` 子目录以集中放置 REST-API 资源。
> 设计上与同样的 `{功能名}/view/`・`{功能名}/api/`（CSRF 安全令牌版）并列存在。
> 表记与 routing-jssp-config 的 `page` 属性相同（以 `src/main/jssp/src/` 为起点、不含扩展名）。

## 示例

XML 由 `scripts/build-oauth.js` 根据 `spec.json` 自动生成。编码代理不会手写。
- **spec.json 示例**: [examples/sample_oauth.spec.json](../examples/sample_oauth.spec.json) 的 `"resources": [...]` 段
- **生成的 XML 实例**: `src/main/conf/oauth-client-resources-config/sample_oauth.xml`

关于 spec.json 的 `resources[]` 字段与 XML 元素的对应关系，请参考上文「元素・属性一览」。
若要混入 `type="java"` 的实现，请在 spec.json 中以 `"type": "java", "target": "jp.co.intra_mart...."` 的形式直接指定 FQCN。

## path / target 设计指南

- `path` 推荐使用 `/oauth/{功能名}/{处理名}` 的形式（便于在项目内统一 URL 设计）
- `path` **必须不与** `routing-jssp-config` 的 URL 重复（在平台端调度时存在冲突风险）
- 1 个 URL 分配 1 个函数容器。HTTP 方法的分支（GET/POST/PUT/DELETE）在 JSSP 端通过 `request.getMethod()` 判别
- `target` 须 **不含扩展名** 编写（不要加 `.js`）

## `<authz>` 的写法与 scope 的关系

`<authz>` 与 `<scope>` 以 **AND 评估**。`<authz>` **必须** 采用通过 `uri/action` 的授权资源控制，作为 **必需且标准** 的方式。禁止使用 `welcome-all` 跳过授权（省略 `<authz>` 或回退）。在技能执行时须以指定 `<authz>` 为前提，向用户确认将定义授权资源。

### 评估流程

| `<authz>` | `<scope>` | 结果 |
|-----------|-----------|------|
| 通过 | 通过 | 调用资源实现的 `init` |
| 失败 | - | 403 Forbidden（不调用 init） |
| - | 失败（scope 不足） | 403 Forbidden / `invalid_scope` |

### `<authz uri="service://..." action="execute" />` — 通过授权资源 URI/action 控制（必需且标准）

```xml
<client-resource id="..." path="..." type="jssp" target="...">
  <authz uri="service://sample_oauth/get_user" action="execute" />
  <scope id="..." />
</client-resource>
```

- 判定令牌持有用户是否对授权资源 URI 拥有访问权
- **需要另行准备授权资源的导入资材**（policy / resource / resource-group / subject-group 的各 XML）
  - 若不准备，部署后的 API 调用 **始终以 403 失败**
  - 生成委托给 `jssp-tenant-setup-generator` 技能
- 可按角色或用户单位进行细粒度访问控制
- **禁止使用 `welcome-all` 跳过授权。** 当 `spec.json` 指定 `"authz": "welcome-all"` 或省略 `authz` 字段时，`build-oauth.js` 会报错停止

### `uri/action` 的命名规则

| 段 | 内容 | 例 |
|-----------|------|-----|
| `service://` | 授权资源 URI 的固定方案 | `service://` |
| `{功能名}/` | 对应功能目录名 | `sample_oauth/` |
| `{API 名}` | API 文件名（不含扩展名） | `get_user` |
| `action=` | 表示操作的名称。多为 `execute` | `execute` |

例: `<authz uri="service://sample_oauth/get_user" action="execute" />`

## 检查清单（设置文件单独的自我检查）

> 技能执行时的工作流程检查（需求访谈・最终整合确认）在 `SKILL.md` 的步骤 1 / 8 中。
> 此处仅列出 **仅查看设置文件时应确认的项目**。

- [ ] `client-resource/@path` 在项目内是否唯一（含 routing-jssp-config 的 URL 是否无重复）？
- [ ] `client-resource/@target` 是否为以 `src/main/jssp/src/` 为起点的不含扩展名的路径？
- [ ] 对应的 `.js` 文件是否存在于 `src/main/jssp/src/{target}.js`？
- [ ] `<scope id="...">` 是否与 `oauth-client-scopes-config` 中定义的 ID 一致？
- [ ] 更新类（POST/PUT/DELETE）资源是否分配了 **表示写权限的 scope**？
- [ ] 每个 `<client-resource>` 是否明示了 `<authz uri="service://..." action="execute" />`（是否未使用 `welcome-all` 跳过授权）？
- [ ] 指定的 `uri/action` 所对应的授权资源导入资材是否存在？
