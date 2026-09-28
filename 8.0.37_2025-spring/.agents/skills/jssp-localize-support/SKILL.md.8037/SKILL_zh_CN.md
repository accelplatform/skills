---
name: jssp-localize-support
description: 对 intra-mart JSSP 画面和函数容器中硬编码的日文字符串进行多语言化（i18n）。在提及多语言化、本地化、国际化、创建消息属性文件、多语言支持、localize、i18n 时使用。将标签和消息外部化，创建消息属性文件，并改写为使用 <imart type="message"> 标签或 MessageManager API。
---

■■ 参考规则 清单（必须） ■■

实施前必须确认以下内容。有未确认项目时不得开始。

- [ ] [jssp-code-style](../../../requirements/jssp-code-style/AGENTS.md) 已参考并理解内容
- [ ] [jssp-naming](../../../requirements/jssp-naming/AGENTS.md) 已参考并理解内容


# JSSP 多语言化支援技能

## 目的

将 intra-mart Accel Platform JSSP 代码中硬编码的字符串（标签、消息、错误消息等）外部化到消息属性文件中，实现多语言支持。

## 确认键前缀（供应商标识符）【开始作业前必须】

消息键的第 2 个段 `APP`（例：`CAP.Z.APP.<产品名>.<功能名>...`、`MSG.<错误类型>.APP.<产品名>...`）是用于标识供应商（提供方）/ 应用程序的字符串，**默认为 `APP`**（通用的应用程序标识符）。面向其他公司的开发时，需要将此 `APP` 部分更改为符合该公司或项目的标识符。

**在开始多语言化作业之前（先于创建 spec.json、生成属性文件、改写源代码中的任何一项），必须向用户询问以下内容：**

> 消息键的供应商标识符部分要保持为 `APP`（默认），还是更改为其他字符串？如需更改，请指定该字符串（例：`ACME`）。

- 将用户指定的标识符在 spec.json 的键、属性文件、源代码改写中**一致地**使用。
- 当用户回答「保持默认」「`APP` 即可」，或事先已有明确指示时，使用 `APP`。
- 本技能内的示例、范例和表格中使用的 `APP`，应根据此确认结果进行替换理解。

## 支持的地区设置

创建以下 4 种属性文件：

| 地区设置 | 文件后缀 | 内容 |
|---------|-------------|------|
| 日语 | `_ja` | 日语消息 |
| 英语 | `_en` | 英语消息 |
| 中文 | `_zh_CN` | 中文（简体）消息 |
| 默认 | （无） | 不符合任何地区设置时使用。与英语内容相同 |

## 通过脚本的自动化工作流

手动创建属性文件容易导致地区设置间的键不一致、编码错误和文件名错误。
推荐使用 **`build-i18n.js`** 从规格 JSON 批量生成，并用 **`validate-i18n.js`** 进行验证。

### 步骤概要

```
1. 创建规格 JSON（列举 captions / messages / logMessages）
2. 用 build-i18n.js 批量生成属性文件（12 个文件）
3. 用 validate-i18n.js 验证（修正直到 0 个错误）
4. 改写源代码（参考步骤 3）
```

### build-i18n.js — 属性文件批量生成

```bash
node .agents/skills/jssp-localize-support/scripts/build-i18n.js <spec.json> [--out <outputDir>]
```

省略 `--out` 时，使用 spec.json 的 `outputDir` 字段。

**spec.json 的格式：**

```jsonc
{
  "outputDir": "src/main/conf/message/sample/my_feature",
  "captions": [
    { "key": "CAP.Z.APP.SAMPLE.MY.FEATURE.TITLE", "en": "My Feature", "ja": "マイ機能", "zh_CN": "我的功能" }
  ],
  "messages": [
    { "key": "MSG.E.APP.SAMPLE.MY.FEATURE.SYSTEM.ERROR", "en": "An unexpected error occurred.", "ja": "予期しないエラーが発生しました。", "zh_CN": "发生了意外错误。" }
  ],
  "logMessages": [
    { "key": "E.APP.SAMPLE.MY.FEATURE.00001", "en": "An error occurred while displaying the screen.", "ja": "画面表示中にエラーが発生しました。", "zh_CN": "显示画面时发生了错误。" }
  ]
}
```

生成的文件（12 个文件）：

| 类别 | 文件 |
|---------|--------|
| 标题 | `caption.properties`（默认=英语）、`caption_en.properties`、`caption_ja.properties`、`caption_zh_CN.properties` |
| 消息 | `message.properties`、`message_en.properties`、`message_ja.properties`、`message_zh_CN.properties` |
| 日志消息 | `log-message.properties`、`log-message_en.properties`、`log-message_ja.properties`、`log-message_zh_CN.properties` |

### validate-i18n.js — 验证脚本

```bash
node .agents/skills/jssp-localize-support/scripts/validate-i18n.js <messageDir> [--src <jssp_src_dir>]
```

**验证项目：**

| # | 检查内容 |
|---|------------|
| 1 | 12 个文件是否全部存在 |
| 2 | 默认文件（无后缀）与 `_en` 文件的内容是否一致 |
| 3 | 所有地区设置间的键集是否一致 |
| 4 | 键命名规则是否合规（点分隔，禁止下划线和连字符） |
| 5 | 英语文件是否包含非 ASCII 字符 |
| 6 | ja / zh_CN 文件的非 ASCII 字符是否以 `\uXXXX` 格式转义 |
| 7 | 换行符是否为 LF |
| 8 | 源文件（指定 --src 时）是否还残留日语字符串字面量（WARNING） |

修正直到错误数为 0（WARNING 仅供确认）。

---

## 手动多语言化步骤

不使用脚本手动操作时，按以下步骤进行。

### 步骤 1：梳理硬编码字符串

加载目标文件（.html / .js），分类为以下类别：

| 类别 | 属性文件 | 用途 | 键格式 |
|---------|-----------------|------|---------|
| 标题 | `caption_<locale>.properties` | 标题、标签、按钮名称等短显示字符串 | `CAP.Z.APP.<产品名>.<功能名>.<标题名>` |
| 消息 | `message_<locale>.properties` | 错误消息、确认消息、成功消息等 | `MSG.<错误类型>.APP.<产品名>.<功能名>.<消息名>` |
| 日志消息 | `log-message_<locale>.properties` | Logger 输出用消息 | `<错误类型>.APP.<产品名>.<功能名>.<序号>` |

**错误类型：**
- `E` — 错误消息
- `W` — 警告消息
- `I` — 信息消息
- `C` — 确认消息

**日志消息序号：** 从 `00001` 开始的 5 位数字

**键命名规则：**
- 键内的分隔符只使用点（`.`）
- 键名中不使用下划线（`_`）或连字符（`-`）
- 功能名或消息名由多个词组成时用点分隔（例：`SIMPLE.FORM`、`USER.CODE`、`SYSTEM.ERROR`）

### 步骤 2：创建消息属性文件

放置位置：`src/main/conf/message/<功能目录名>/`

每个类别创建 4 个文件（ja、en、zh_CN、默认）。

**重要：native2ascii 编码**

属性文件内的非 ASCII 字符必须以 `\uXXXX` 格式转义。
用 Node.js 转换的方法：

```javascript
function native2ascii(str) {
  return str.split('').map(c => {
    const code = c.charCodeAt(0);
    if (code > 127) {
      return String.raw`\u` + code.toString(16).padStart(4, '0');
    }
    return c;
  }).join('');
}
```

英语属性文件只有 ASCII 字符，无需转义。
日语和中文需要转义。

**属性文件格式：**

```properties
CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE=\u30e6\u30fc\u30b6\u767b\u9332\u30fb\u524a\u9664
CAP.Z.APP.SKILLS.SIMPLE.FORM.SUBTITLE=\u30e6\u30fc\u30b6\u7ba1\u7406\u6a5f\u80fd
```

### 步骤 3：改写源代码

#### 表示页面（.html）的情况

使用 `<imart type="message">` 标签。

**在 HTML 内内联插入时：**

```html
<h1><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE" escapeXml="true" escapeJs="false" /></h1>
```

**在 JavaScript 内内联插入时（`<script>` 块内）：**

```javascript
imuiShowErrorMessage('<imart type="message" id="MSG.E.APP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR" escapeXml="false" escapeJs="true" />');
```

- HTML 上下文：`escapeXml="true" escapeJs="false"`
- JavaScript 上下文：`escapeXml="false" escapeJs="true"`

**在 HTML 属性内插入时：**

```html
<span class="imds-required-label-required" data-required-label="<imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.REQUIRED" escapeXml="true" escapeJs="false" />">
```

#### 函数容器（.js）的情况

使用 `MessageManager.getMessage()` API。
详情参考 `reference/api-message-manager.md`。

```javascript
// 仅键
let title = MessageManager.getMessage('CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE');

// 带占位符（用 {0}、{1}、... 替换）
Logger.error(MessageManager.getMessage('E.APP.SKILLS.SIMPLE.FORM.00001', e.message));
```

### 步骤 4：删除不需要的绑定变量

当表示页面改为直接使用 `<imart type="message">` 时，函数容器侧为标题等设置的绑定变量（`$title`、`$subTitle` 等）变得不必要，需删除。

**变更前（函数容器）：**
```javascript
let $title = 'ユーザ登録・削除';
let $subTitle = 'ユーザ管理機能';
```

**变更后：** 删除上述绑定变量声明。

**变更前（表示页面）：**
```html
<h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
```

**变更后：**
```html
<h1><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE" escapeXml="true" escapeJs="false" /></h1>
```

## 参考资料

| 文件 | 内容 |
|---------|------|
| `scripts/build-i18n.js` | 从规格 JSON 批量生成属性文件（12 个文件） |
| `scripts/validate-i18n.js` | 属性文件正确性验证脚本 |
| `examples/expense_report.i18n.json` | 规格 JSON 的示例（经费申请） |
| `reference/api-message-manager.md` | MessageManager API 的类型定义和使用示例 |
| `assets/localized-form-example.md` | 已多语言化的表单画面实现示例（源文件 + 属性文件全套） |

## 注意事项

- 属性文件的换行符使用 LF
- 键名的产品名和功能名部分根据项目命名（分隔符只用点，禁止下划线和连字符）
- 键的第 2 个段 `APP`（供应商标识符）为默认值；面向其他公司的开发时，应在开始作业前向用户确认是否更改（参见「确认键前缀（供应商标识符）」）
- 验证消息在客户端侧（HTML 内 JS）和服务端侧（API 的 JS）都需要多语言化
- 错误文本用 `<span>` 元素的默认文本设为空（因为由 JS 动态设置）
- 不要忘记将用 `<imart type="string">` 显示的绑定变量替换为 `<imart type="message">`
