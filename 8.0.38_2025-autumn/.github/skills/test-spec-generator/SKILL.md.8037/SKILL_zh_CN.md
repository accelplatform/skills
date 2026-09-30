---
name: test-spec-generator
description: 根据 spec/ 目录下的规格书（业务需求、验收标准），生成 xlsx 格式（使用 officecli）或 HTML 格式（无需 officecli）的测试观点一览表和测试项目书。分析既有测试项目书模板（xlsx）的工作表结构、列布局、格式（表头颜色、边框、字体）并加以沿用，为新功能生成测试资料。默认将输出保存到 docs/test-specs/xlsx/ 或 docs/test-specs/html/ 目录下。当用户提到"创建测试项目书""创建测试观点一览表""用xlsx创建测试用例""用officecli生成测试资料""基于此模板创建测试项目书""用HTML创建测试项目书""为没有officecli的环境创建测试资料"时使用。
allowed-tools: Bash, Read, Write, Glob
---

# 测试项目书生成技能 (test-spec-generator)

## 目的

根据 `spec/` 目录下规格书中的验收标准（AC-\* 等），生成：

1. **测试观点一览表** — 将全部功能的验收标准按功能、画面、优先级汇总的一览表
2. **测试项目书** — 按画面记录详细操作/预期结果的工作表（沿用既有模板的"容器型"布局）

输出格式有两种，**均可由同一份 spec.json 生成**。

| 格式 | 生成脚本 | 所需工具 | 用途 |
|---|---|---|---|
| xlsx | `scripts/build-test-spec.js` | officecli | 直接在 Excel 中打开用于分发・填写 |
| HTML | `scripts/build-test-spec-html.js` | 不需要（仅 Node） | 面向无法安装 officecli 的环境，在浏览器中查看 |

如果提供了既有的测试项目书 xlsx，将其作为模板分析工作表结构与格式，并以相同外观为新功能生成资料（仅限 xlsx 输出；HTML 输出不使用 officecli，因此不会还原模板精确的边框・颜色）。

输出默认保存到 **`docs/test-specs/xlsx/`** / **`docs/test-specs/html/`** 目录下（按格式分目录，文件名为 `<功能ID>-test.xlsx` / `<功能ID>-test.html`）。详情见 [reference/spec-schema.md](reference/spec-schema.md) 中的 `outputFile` / `outputFileHtml` / `key`。

## 前提条件

- xlsx 输出：需已安装 officecli（用 `which officecli` 确认）。若未安装，请用户先安装，或改用 HTML 输出。
- HTML 输出：仅需 Node.js 即可运行（无需额外工具）。

## 使用时机

- "创建〇〇功能的测试项目书""创建测试观点一览表"
- "以此xlsx为模板，创建△△的测试资料"（提供了既有模板时）
- "用officecli创建Excel测试用例"
- "为了在没有officecli的情况下也能查看，用HTML创建测试项目书"

## 生成步骤

### 1. 与用户确认输出格式（未指定时必须执行）

若用户的需求中已明确指定 xlsx 或 HTML（例如"用xlsx""用officecli""用HTML""面向没有officecli的环境"），则按其指定执行，无需再次确认。

若未明确指定，**必须**在开始生成前通过 AskUserQuestion 等方式向用户确认以下选项：

- **xlsx 格式**（使用 officecli，可直接在 Excel 中打开用于分发・填写）
- **HTML 格式**（无需 officecli，在浏览器中查看）
- 两者都要

若检测到未安装 officecli（`which officecli` 未找到），可告知用户并建议使用 HTML 格式，但最终仍应由用户决定（不得未经确认擅自选定一种格式）。

### 2. 模板分析（如有既有测试项目书 xlsx）

```bash
officecli view <template.xlsx> text                      # 列出内容（先掌握整体结构）
officecli get <template.xlsx> "/<工作表>/<单元格>" --json  # 获取单元格级别的格式
```

**重要**：`get` 返回的 `fill` 会将主题色 + tint（明度调整）简化为 `"dk2"` 这样的名称，并丢失 tint 值。若直接将其用于 `set` 的 `fill`（要求6位十六进制），会得到与原文件完全不同的颜色。若需精确还原表头颜色等，务必按照 [reference/officecli-fill-color.md](reference/officecli-fill-color.md) 的步骤，从 `raw` 计算出实际的十六进制值。**若被指出"与原文件外观不同"，应首先怀疑此处。**

officecli 命令的完整说明见 [reference/officecli-cheatsheet.md](reference/officecli-cheatsheet.md)。

若无模板，则按后述的默认工作表结构/格式从零生成。

### 3. 读取 spec/ 下的规格书

读取目标功能的 `spec/<功能ID>/` 目录（`business-requirements.md` 中的验收标准表、`system-requirements.md` 中的画面一览与功能需求、`detailed-design.md`）。若无验收标准表，可查阅 `README.md` 等确认相关文档位置。

### 4. 与用户确认范围（必须）

若规格书涉及的画面数量较多，以相同粒度为所有画面生成测试项目书会产生非常庞大的内容。**务必**在生成前通过 AskUserQuestion 等方式与用户确认范围。

- 测试观点一览表（覆盖全部验收标准）相对轻量，原则上可全量生成
- 测试项目书（按画面的详细操作项）应让用户选择：仅试做代表性画面，还是对全部画面完整生成

不要擅自决定（既不要未经许可对全部画面完整生成，也不要仅限于代表画面却报告为"已全面覆盖"）。

### 5. 组装 spec.json

按照 [reference/spec-schema.md](reference/spec-schema.md) 的格式组装 spec.json。注意一条验收标准常会拆解为多个测试项目，且备注栏必须记录原始验收标准ID（以保持可追溯性）。

**`itemSheets[].items[].action`（操作）必须写成测试人员可直接照做的具体操作步骤。** 不要仅用"检索・选择""点击"这类抽象标签敷衍了事。应以一行一个操作为原则，用 `\n` 分隔并加上"1. ""2. "……编号拆分为多行（xlsx 与 HTML 均会将 `\n` 原样渲染为单元格内换行；详情与示例见 [reference/spec-schema.md](reference/spec-schema.md#按画面制作测试项目书的方法原则)）。

示例：[examples/equip-001.spec.json](examples/equip-001.spec.json)（一个实际生成的 spec：内部备品借用系统的68条测试观点，以及3个代表画面的测试项目书——其 `action` 字段即为编号多行格式的实例）。

### 6. 执行生成脚本

xlsx（可使用 officecli 时）：

```bash
node .github/skills/test-spec-generator/scripts/build-test-spec.js <spec.json路径> [--out <output.xlsx>]
```

该脚本执行的操作：

- 通过 `officecli create` 创建新 xlsx（若目标文件已存在，则跳过创建，直接对其执行 batch）
- 添加 前提条件、集计（汇总）、试验观点一覧、试验项目书_\* 等各工作表
- 批量CSV导入（`officecli import`）及对表头/数据单元格的批量格式设置（一组 `officecli batch` 的 `set` 命令）
- 为各试验项目书_\* 工作表的A列（确认）设置数据验证下拉列表（`officecli add ... --type validation`，`type: list`，选项为"✓ / 空白"）。由于 officecli 无法操作 Excel 原生复选框（表单控件），故以此方式代替
- 通过 `officecli save` 保存，并通过 `officecli close` 关闭常驻进程
- 输出路径：优先使用 spec.json 的 `outputFile`；若未指定，默认为 `docs/test-specs/xlsx/<spec.key>-test.xlsx`

若有命令执行失败，会输出到标准错误并以非零状态退出（仅 `/Sheet1` 的删除失败会被忽略，因为无害）。

HTML（面向无 officecli 的环境）：

```bash
node .github/skills/test-spec-generator/scripts/build-test-spec-html.js <spec.json路径> [--out <output.html>]
```

- 可直接使用与 xlsx 版相同的 spec.json（输入兼容）
- 不使用 officecli，仅通过 Node 的 `fs` 生成一个自包含的 HTML 文件
- 前提条件工作表不以 `<table>` 形式呈现，而是转换为嵌套的 `<ol>`/`<ul>` 列表（将每行开头的空单元格数量视为缩进层级；若同一层级的连续项目全部带有 `1)` `2)` ... 编号前缀，则使用 `<ol>` 并去除前缀，否则使用 `<ul>` 并去除开头的 `・`，以避免列表标记与原文本重复显示；转换规则详见 [reference/spec-schema.md](reference/spec-schema.md)）。其余工作表（集计・试验观点一览・试验项目书_\*）因表格形式更易读，仍保持 `<table>`
- 试验项目书_\* 工作表的第一列（A列）是供测试人员边阅读边记录确认状态的"确认"列（xlsx 与 HTML 布局一致——该列原本是 xlsx 侧的空白间隔列，现已改用为确认用途）。HTML 中会放置一个含"-"（未确认）／OK／NG 三个选项的 `<select>`（不使用复选框，因为复选框无法区分"确认为OK"与"确认为NG"）。**选择 NG 的行会以红色背景高亮显示**（通过 `change` 事件为该行的 `<tr>` 添加/移除 `confirm-ng` 类，因为仅靠 CSS 的 `:has()` 无法实时响应 `<select>` 的选中值）。**选择 OK 或 NG 时，会自动将当天日期（`YYYY-MM-DD`）填入"测试日期"列的单元格**（每次更改选项都会重新获取日期）。选择状态与测试日期会保存到浏览器的 `localStorage` 中，因此页面重新加载后仍会保留（由于不经过服务器也不使用 officecli，该状态仅保存在当前浏览器内，不会在不同设备或用户之间共享；日期使用浏览器本地时间，取决于测试人员设备的设置）。原有的"结果"・"确认者"・"确认日期"列已删除，因其职责已与本"确认"列（OK/NG）及自动填充的"测试日期"列重复。若仍需要另外的正式确认记录（谁进行了确认），请另行准备测试管理台账。集计与测试观点一览工作表没有该确认列，因此不受影响
- 输出为单个文件，包含目录、各工作表标题，以及支持亮/暗主题的 CSS
- 输出路径：优先使用 spec.json 的 `outputFileHtml`；若未指定，默认为 `docs/test-specs/html/<spec.key>-test.html`

若需同时生成两种格式，对同一份 spec.json 分别执行两个脚本即可（同时指定 `outputFile` 与 `outputFileHtml` 可避免路径冲突）。

### 7. 验证

```bash
officecli view <output.xlsx> text   # xlsx 的情况
```

xlsx 可通过文本视图确认内容。若需严格核对表头颜色、字体等外观，可用 `officecli get <output.xlsx> "/<工作表>/<单元格>" --json` 与模板的相同单元格进行比对。

HTML 可直接在浏览器中打开，或通过 grep/Read 确认生成的 `<table>` 行数・列标题。

## 输出结构（工作表构成）

| 工作表 | 内容 | 生成来源 |
|---|---|---|
| 前提条件 | 测试概要、测试环境、所需主数据、注意事项 | 根据规格书的业务需求、通用定义手动整理 |
| 集计 | 各工作表的项目数汇总 | 生成脚本自动汇总 |
| 试验观点一覧 | 验收标准（AC-\*）按功能、画面、优先级列出 | 由 business-requirements.md 的验收标准表转换而来 |
| 试验项目书_\<画面名\> | 按画面的详细操作/预期结果（容器型：分类/画面仅在每个区块首行记录） | 由 system-requirements.md 的画面一览及验收标准按画面细化而来 |

列结构详情及 spec.json 全部字段见 [reference/spec-schema.md](reference/spec-schema.md)。

## 文件结构

```
test-spec-generator/
├── SKILL.md                          # 本文件
├── scripts/
│   ├── lib/
│   │   └── spec-tables.js            # spec.json → 表格数据的转换逻辑（两种输出共用）
│   ├── build-test-spec.js            # 由 spec.json 一次性生成 xlsx（使用 officecli）
│   ├── build-test-spec-html.js       # 由 spec.json 一次性生成自包含 HTML（不使用 officecli）
│   └── theme-tint.js                 # 主题色+tint → 实际十六进制值的转换工具
├── reference/
│   ├── spec-schema.md                # 两个脚本共用的 spec.json 全部字段
│   ├── officecli-cheatsheet.md       # officecli 命令速查表・故障排查
│   └── officecli-fill-color.md       # 主题色+tint 的陷阱与实际十六进制值计算方法
└── examples/
    └── equip-001.spec.json           # 实际生成资料所用的 spec 示例（内部备品借用系统）
```

## 默认输出目录

生成物默认按格式分目录保存到 **`docs/test-specs/xlsx/`** / **`docs/test-specs/html/`** 下（相对于项目根目录）。文件名由 spec.json 顶层字段 `spec.key`（功能ID，如 `equip-001`）组装为 `<spec.key>-test.<扩展名>`。

```
docs/test-specs/
├── xlsx/
│   └── <功能ID>-test.xlsx   # xlsx 输出（build-test-spec.js，优先使用 spec.outputFile）
└── html/
    └── <功能ID>-test.html   # HTML 输出（build-test-spec-html.js，优先使用 spec.outputFileHtml）
```

同一功能若同时生成 xlsx 与 HTML，会分别落入各自格式目录，例如 `docs/test-specs/xlsx/equip-001-test.xlsx` 与 `docs/test-specs/html/equip-001-test.html`（不再按功能ID单独建目录）。

可通过在 spec.json 中指定 `outputFile` / `outputFileHtml` 覆盖此默认值（`--out` 参数优先级更高）。本技能早期版本输出到 `test/` 目录，之后改为 `docs/test-specs/<功能ID>/<功能ID>.xxx`，但该路径中功能ID重复出现显得冗余，因此改为按格式分目录 + `<功能ID>-test.<扩展名>` 的命名方式。

## 禁止事项：不得发布到 Artifacts（claude.ai 的外部公开功能）

**严禁将生成的测试观点一览表・测试项目书输出或发布到 Artifact 工具（claude.ai 上发布 HTML/Markdown 的功能），或仓库之外的其他外部托管服务。**

- 测试项目书包含业务系统的规格与验收标准，属于内部资料，不一定适合对外公开。项目方针禁止将资料随意放置到外部服务器
- Artifact 默认为非公开（仅创建者可见），但无论默认可见性如何，**在仓库之外生成成果物副本**这件事本身——可通过分享菜单向第三方共享、会签发URL——就违反了本项目的方针
- 若需要向用户展示生成结果，不要将其制作成 Artifact、截图，或上传到外部服务，而应**告知仓库内的文件路径**（如 `docs/test-specs/html/<功能ID>-test.html`）供用户本地打开，或通过 `officecli view` / Read 工具展示文本内容
- 若不慎已发布为 Artifact，由于 Artifact 工具没有删除（unpublish）功能，必须由用户自行从 `claude.ai/code/artifacts` 手动删除（AI 无法撤回）。发布前务必先停下来重新考虑。

## 注意事项

- **覆盖既有资料**：若 `outputFile`/`outputFileHtml` 指向已存在的文件，两个脚本都会覆盖该文件（`build-test-spec.js` 会跳过 `officecli create`，直接对既有文件重新执行 `batch`；`build-test-spec-html.js` 则直接覆盖）。这可能破坏既有的手动编辑内容，因此以既有文件为目标时应先与用户确认。
- **对已存在的 xlsx 重新执行 `build-test-spec.js` 可能因数据验证重复而失败**：与 `set` 不同，为各试验项目书_\* 工作表的确认列（A列）添加的数据验证规则（`add ... --type validation`）并非幂等操作——若对已存在规则的单元格区域再次 `add`，会报 `DataValidation sqref '...' overlaps existing validation` 错误，导致整个 batch 失败。修改 spec.json（例如前提条件的行结构）后重新生成时，应**先删除目标 xlsx**，或输出到不同的文件名。
- **不保证列宽・格式完全一致**：officecli 的读写并非完全可逆（尤其是 fill 的 tint、边框颜色的细微差异等）。若需要严格的外观一致性，生成后务必与模板逐单元格核对。HTML 输出本身就不以还原 xlsx 精确边框・格式为设计目标（仅沿用表格结构与表头颜色；前提条件工作表会转换为列表而非表格）。
- **前提条件转列表是启发式转换**：`prerequisiteRows` 原本是为 xlsx 单元格对齐而编写的数据，HTML 转换时将"行首空单元格数量"视为缩进层级来构建 `<ol>`/`<ul>`。仅当同一层级的一组连续项目**全部**带有 `1)`/`2)`/... 前缀时才会转换为 `<ol>`（并去除前缀）；否则转换为 `<ul>`（并去除开头的 `・`）——若一组内编号与非编号项目混杂，则会整体退回 `<ul>`，编号前缀会作为普通文本保留。此外，若一行中有多个非空单元格，会以"标签: 值"形式拼接，因此原本意图表示表格的行（例如模块列表的表头行）转换后可能显得不自然。生成后请目视检查前提条件部分，若有不自然之处，请直接调整 `prerequisiteRows` 的行内容。
- **spec.json 不支持多语言**：生成的 xlsx/HTML 仅为日语。若需要多语言测试项目书，应按语言分别准备 spec.json 并分别执行脚本。

## 职责划分

| 技能 | 用途 |
|---|---|
| **test-spec-generator**（本技能） | 生成 xlsx/HTML 格式的测试观点一览表・测试项目书 |
| `jssp-playwright-test` | 针对可运行的 JSSP 画面（html + js）生成 E2E 测试代码 |
| `jssp-jest-test` | 生成函数容器（js）的单元测试 |

测试项目书是"供人工手动执行的测试步骤书"，与 `jssp-playwright-test` / `jssp-jest-test` 生成的自动化测试代码是不同的产物。两者都需要时可组合使用（例如先制作测试观点一览表，再据此确认自动化测试用例的覆盖度）。
