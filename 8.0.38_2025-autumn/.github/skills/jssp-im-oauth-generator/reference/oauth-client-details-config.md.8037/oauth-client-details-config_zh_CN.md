# oauth-client-details-config（客户端详细设置）

注册使用 OAuth REST-API 的 **客户端应用程序** 的设置文件。
定义客户端标识符（`client_id`）・密钥・授权种别・允许的 scope 等。

## 存放位置

```
src/main/conf/oauth-client-details-config/{任意的文件名}.xml
```

部署后将放置在 `WEB-INF/conf/oauth-client-details-config/...`。
可在 1 个文件中定义多个客户端，但运用上按客户端分别拆分为不同文件（例：`sample_oauth.xml`、`partner_app.xml`）便于识别管理。

## XML 结构

```
<oauth-client-details-config>
  <client-details>
    <client-detail client-id="..."
        authorized-grant-type="authorization_code|implicit"
        client-secret="..."
        redirect-uri="..."
        access-token-validity-seconds="..."
        icon-path="..."
        code-challenge="NONE|ALL|PLAIN|S256">

      <default-name>...</default-name>

      <localizations>
        <localize locale="...">
          <client-name>...</client-name>
          <description>...</description>
        </localize>
      </localizations>

      <scopes>
        <scope id="..." />
      </scopes>
    </client-detail>
  </client-details>
</oauth-client-details-config>
```

## 元素・属性一览

### `<client-detail>`

| 属性 | 必填 | 默认值 | 说明 |
|------|:----:|------------|------|
| `client-id` | ○ | - | 客户端识别 ID。OAuth 授权请求时由客户端发送 |
| `authorized-grant-type` | ○ | - | `authorization_code`（服务器端 Web 应用程序用）或 `implicit`（SPA／原生应用程序用） |
| `client-secret` | △ | - | `authorized-grant-type="authorization_code"` 时必需 |
| `redirect-uri` | × | - | 接收授权码的客户端侧重定向端点。**建议设置以防伪装** |
| `access-token-validity-seconds` | × | `3600`（1 小时） | 访问令牌有效期（秒） |
| `icon-path` | × | - | 同意画面上显示的图标（推荐 80x80） |
| `code-challenge` | × | `NONE` | PKCE 用代码挑战方式。`NONE` / `ALL` / `PLAIN` / `S256` |

### 子元素

| 元素 | 必填 | 说明 |
|------|:----:|------|
| `default-name` | ○ | 客户端默认显示名（与语言区域无关） |
| `localizations` | × | 按语言区域显示的父元素 |
| `localize` | × | 按语言区域显示的 1 条 |
| `localize/@locale` | ○ | 语言区域 ID（例：`ja`、`en`、`zh_CN`） |
| `client-name` | ○ | 按语言区域的客户端显示名 |
| `description` | ○ | 按语言区域的说明 |
| `scopes` | ○ | 此客户端可请求的 scope 的父元素 |
| `scope` | ○ | 单独 scope |
| `scope/@id` | ○ | `oauth-client-scopes-config` 中定义的 scope ID |

## 示例

XML 由 `scripts/build-oauth.js` 根据 `spec.json` 自动生成。编码代理不会手写。
- **spec.json 示例**: [examples/sample_oauth.spec.json](../examples/sample_oauth.spec.json) 的 `"clients": [...]` 段
- **生成的 XML 实例**: `src/main/conf/oauth-client-details-config/sample_oauth.xml`

关于 spec.json 的 `clients[]` 字段与 XML 元素的对应关系，请参考上文「元素・属性一览」（例：spec 的 `clientId` → XML 的 `client-id` 属性、`grantType` → `authorized-grant-type`、`codeChallenge` → `code-challenge` 等）。

## 授权种别（authorized-grant-type）的选择

| 值 | 用途 | client-secret | 备注 |
|----|------|:-------------:|------|
| `authorization_code` | 有服务器的 Web 应用程序 | 必需 | 推荐。获取 code，通过服务器间通信交换访问令牌。建议与 PKCE 并用 |
| `implicit` | SPA／原生应用程序 | 不需要 | 规范上不推荐。最新的 OAuth 2.1 原则上不使用。仅出于兼容性保留 |

## 安全方面的注意事项

- `client-secret` 以 **明文写入 XML**，因此本文件是 Git 的机密管理对象。生产环境的值不要直接写入仓库，须通过 **`@VARIABLE@`** 形式的过滤器替换或 `import` 时的覆盖设置传递
- 若未指定 `redirect-uri`，可能成立授权码截取型攻击（CSRF），因此 **必须指定**
- `code-challenge` 推荐为 `S256`（通过 PKCE 支持成为授权码截取的对策）
- `access-token-validity-seconds` 根据需求缩短（例：`300`〜`1800`）。若设置较长，须与刷新令牌的运用一同考虑

## 检查清单

- [ ] `client-id` 在项目・租户内是否唯一？
- [ ] `authorized-grant-type="authorization_code"` 时是否设置了 `client-secret`？
- [ ] 是否指定了 `redirect-uri`（未指定会降低安全性）？
- [ ] `<scope id="...">` 是否全部已在 `oauth-client-scopes-config` 中定义？
- [ ] 是否确认了 `client-secret` 是可提交到仓库的值，还是应替换为过滤器置换？
- [ ] `code-challenge` 是否设置为 `S256`（PKCE 支持）？
