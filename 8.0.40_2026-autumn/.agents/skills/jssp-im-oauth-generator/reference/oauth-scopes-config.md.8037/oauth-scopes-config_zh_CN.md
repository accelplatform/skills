# oauth-client-scopes-config（范围设置）

定义 OAuth 提供方提供的 **访问范围（scope）** 的设置文件。
此为客户端应用程序向用户请求同意时的单位。

## 存放位置

```
src/main/conf/oauth-client-scopes-config/{任意的文件名}.xml
```

部署后将放置在 `WEB-INF/conf/oauth-client-scopes-config/...`。
文件名可以按功能单位或 scope 组单位拆分（例：`sample_oauth.xml`、`account_scopes.xml`）。

## XML 结构

```
<oauth-client-scopes-config>
  <scopes>
    <scope id="...">                 ← 1 个以上、可重复
      <default-subject>...</default-subject>
      <localizations>
        <localize locale="...">      ← 按要提供的语言区域重复
          <subject>...</subject>
          <text>...</text>
        </localize>
      </localizations>
    </scope>
  </scopes>
</oauth-client-scopes-config>
```

## 元素・属性一览

| 元素 / 属性 | 必填 | 说明 |
|-------------|:----:|------|
| `oauth-client-scopes-config`（根） | ○ | 命名空间 `http://intra-mart.co.jp/system/oauth/provider/client/scope/config/oauth-client-scopes-config` |
| `scopes` | ○ | scope 的父元素 |
| `scope` | ○ | 单独的访问范围。可在 1 个文件中定义多个 |
| `scope/@id` | ○ | 标识 scope 的唯一 ID。由客户端详细设置・资源设置引用 |
| `default-subject` | ○ | 当与语言区域对应的显示名不存在时所使用的默认显示名 |
| `localizations` | × | 按语言区域显示的父元素 |
| `localize` | × | 按语言区域显示的 1 条 |
| `localize/@locale` | ○ | 语言区域 ID（例：`ja`、`en`、`zh_CN`） |
| `subject` | ○ | 同意画面上显示的 scope 名称（按语言区域） |
| `text` | ○ | 同意画面上显示的 scope 说明（按语言区域） |

## 示例

XML 由 `scripts/build-oauth.js` 根据 `spec.json` 自动生成。编码代理不会手写。
- **spec.json 示例**: [examples/sample_oauth.spec.json](../examples/sample_oauth.spec.json) 的 `"scopes": [...]` 段
- **生成的 XML 实例**: `src/main/conf/oauth-client-scopes-config/sample_oauth.xml`

关于 spec.json 的 `scopes[]` 字段与 XML 元素的对应关系，请参考上文「元素・属性一览」。

## 命名规则（推荐）

- `scope/@id` 应为 **反映应用程序名或功能名的唯一 ID**
- 字符种类：小写英数字・下划线（例：`account_read`、`equipment_lending`）
- 行业标准的 `openid` / `profile` / `email` 等值可能被 OpenID Connect 预留，因此自定义 scope 请使用其他名称
- 1 个功能中 **分 read / write 时应分割 scope**（例：`equipment_read`、`equipment_write`）

## 检查清单

- [ ] `scope/@id` 在项目内是否唯一？
- [ ] `default-subject` 是否非空字符串？
- [ ] 使用的语言区域（`ja` / `en` / `zh_CN` 等）是否全部准备了 `<localize>`？
- [ ] `oauth-client-resources-config` / `oauth-client-details-config` 端是否引用了相同的 `id`？
