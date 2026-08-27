# 编码规约

本目录存放 intra-mart Accel Platform 脚本开发（JSSP）项目的编码规约。

## 规约适用的优先级（最重要）

1. **规格书优先**：成果物的内容遵循 `spec/*.md` 等规格书。规格书中明示的内容优先于本规约。
2. **规约作为兜底**：仅在规格书未明示的事项上，将本规约作为默认值适用。
3. **避免过度适用**：规约只是「最低保护栏」，不是「达成目标」。不要从规约推断规格书未提及的额外要求。
   - 特别是**依赖业务需求的规约**（无障碍严格度、字符数上限、复杂错误代码体系等），在规格书无明确指示时应保持最小适用。
   - 「以防万一」地全规约厚涂会导致维护者无法判断「为什么这样实现」。

## 规约的参考方针

各规约文件开头标注了 **适用范围**。请参考下表的 **适用范围标签**，仅对当前任务相关的规约使用 `Read` 工具读取。与任务无关的规约（例如：无 DB 操作的画面无需 `jssp-2way-sql.md`）无需读取。

### 适用范围标签图例

| 标签 | 含义 | 处理方式 |
|------|------|---------|
| 🟢 **始终** | 适用于所有 JSSP 实现 | 必须参考 |
| 🟡 **上下文依赖** | 仅在使用相关功能的实现中适用 | 不含相关功能时可跳过 |
| 🟠 **业务需求依赖** | 仅在规格书有明确指示时厚涂适用，无指示时最小化 | 先确认规格书，再决定是否读取 |

## 规约文件一览（一行摘要 + 适用范围标签）

### 面向 JSSP（脚本开发模型）

| 文件 | 一行摘要 | 适用范围 |
|------|---------|---------|
| `jssp-overview.md` | 项目概述与技术栈 | 🟢 始终 |
| `jssp-file-structure.md` | 目录结构与文件命名 | 🟢 始终 |
| `jssp-code-style.md` | `let` / 字符串字面量 / 运算符 | 🟢 始终（`.js` 生成时） |
| `jssp-naming.md` | 文件名・函数名・变量名 | 🟢 始终 |
| `jssp-function-container.md` | `init()` 结构・验证・IM 通用主数据 API | 🟢 函数容器（`.js`）生成时 |
| `jssp-presentation-page.md` | 展示页面（`.html`）结构・验证・id 命名规约 | 🟢 展示页面（`.html`）生成时 |
| `jssp-error-handling.md` | try-catch / 响应结构 / 错误代码 | 🟢 始终 |
| `jssp-security.md` | XSS / CSRF / 输入验证 | 🟢 始终（处理用户输入时） |
| `jssp-logging.md` | 日志级别 / 敏感信息脱敏 / 占位符 | 🟡 实现日志时 |
| `jssp-2way-sql.md` | 2WaySQL / `DbParameter` / 事务 | 🟡 **仅在 DB 操作时**（使用 `db.executeByTemplate` / `db.execute` 时） |
| `jssp-testing.md` | 单元测试（jest-on-rhino） | 🟡 编写测试时 |
| `jssp-performance.md` | 编译器设置 / session.js | 🟡 性能调优时 |
| `jssp-accessibility.md` | ARIA / WCAG 2.1 AA / 屏幕阅读器 | 🟠 **业务需求依赖** — 仅在规格书有明确要求时厚涂适用；无要求时保持基本（`imdsConfirm`、基础 `aria-label` 等） |

### 面向 Java（JavaEE 开发模型）

| 文件 | 一行摘要 | 适用范围 |
|------|---------|---------|
| `java-architecture.md` | 分层结构 / 依赖规则 / 异常层次 / 工厂模式 | 🟢 始终（Java 实现时） |
| `java-service-layer.md` | 服务层（Service）实现规则 / 事务边界 / 异常转换 | 🟢 始终（`service` 包实现时） |
| `java-entity.md` | Entity 类（Mirage ORM）设计规约 / 审计字段 | 🟡 生成 Entity 类（`entity` 包）时 |
| `java-code-style.md` | `final` / 字符串字面量 / `equals()` / 禁止 raw type | 🟢 始终（`.java` 生成时） |
| `java-naming.md` | 包・类・方法・变量的命名规约 | 🟢 始终 |
| `java-javadoc.md` | 类・方法的 JavaDoc 编写规约 | 🟢 始终 |
| `java-logging.md` | 日志级别 / 敏感信息脱敏 / 按异常类型判断日志级别 | 🟡 实现日志时 |

## 本地化

各规约文件在 `*.md.<version>/` 下都有本地化版本（`*_en.md`、`*_zh_CN.md`）。
根据项目区域设置自动切换。
