---
name: jssp-im-java-wrapper
description: 新建用于从 JSSP（脚本开发模型）调用自定义 Java 处理的包装类（JSSP API）。提供继承 `jp.co.intra_mart.system.javascript.ScriptableObject` 的包装类（静态函数型 `@JSStaticFunction` / 实例型 `@JSConstructor`・`@JSFunction`）、通过 `conf/products/initializer/initializer-<模块ID>.xml` 注册为 JSSP 全局对象、以及创建 d.ts 类型定义的步骤。当用户提到想从 JSSP 调用 Java 的类・方法、想将 Java 处理作为 JSSP API 公开、想不使用 `Packages` 调用 Java、想自制类似 NewLock 的 JSSP API 时使用。从包装类调用的 Java 端业务处理本身请使用 `java-im-architecture` 等 Java 技能实现。仅限于 JSSP 标准 API（d.ts）或现有技能无法实现的处理（例：使用 Apache POI 操作 Excel）时使用，对于可通过 d.ts 的 API 实现的处理不要使用。
---

# JSSP 用 Java API 包装类创建技能

## 目的

为了从 JSSP 的函数容器调用 Java 处理，在 Java 端实现包装类，并将其注册为 JSSP 的全局对象（JSSP API）。
intra-mart 标准的 JSSP API 也是以相同机制实现的（例：JSSP 的 `NewLock` 就是注册了调用 Java `NewLock` 的包装类 `NewLockObject`）。

`.agents/requirements/jssp-function-container/AGENTS.md` 禁止从 JSSP 通过 `Packages.*` 直接引用 Java 类，因此从 JSSP 使用 Java 处理时，请按本技能的方法实现。

## 使用的判断标准

**仅限于 JSSP 标准 API（d.ts 中定义的 SSJS API）或现有技能无法实现的处理**，才创建包装类。

- 适用的示例：使用 Apache POI 读写 Excel 文件等，JSSP 的 API 中没有同等功能的 Java 库的使用
- 不适用的示例：DB 访问、存储、HTTP 通信、发送邮件等 d.ts 中已有 API 的处理（请使用 d.ts 的 API）
- 无法判断是否适用时，在创建包装类之前先与用户确认

## 生成对象

| 成果物 | 存放位置 | 内容 |
|-------|-------|------|
| 包装类（.java） | `src/main/java/{包}/javascript/{名称}Object.java` | 继承 `ScriptableObject`，公开从 JSSP 调用的方法 |
| 注册文件（.xml） | `src/main/conf/products/initializer/initializer-{模块 ID 的末尾}.xml` | 通过 `<api-class>` 将包装类注册到 JSSP |
| 类型定义（.d.ts） | `d.ts/custom/{名称}.d.ts` | 用于 JSSP 端类型检查（`check-types.sh`）的声明 |

- 从包装类调用的 Java 端处理（业务逻辑），使用现有 Java API，或通过 Java 技能（`java-im-architecture` 等）另行实现
- 调用包装类的 JSSP 画面・API，按 `jssp-page-generator` 等常规步骤创建

## 应参考的规约

| 规约 | 处理方式 |
|------|---------|
| `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 必读 — 实现包装类（.java） |
| `.agents/requirements/java-architecture/AGENTS.md` | 🟡 新实现从包装类调用的 Java 端业务处理时 |
| `.agents/requirements/jssp-function-container/AGENTS.md` / `.agents/requirements/jssp-code-style/AGENTS.md` | 🟡 实现调用包装类的 JSSP 端时 |

## 完成品示例・参考

- `assets/java-wrapper-sample.md` - 静态函数型・实例型包装类、注册文件、d.ts、从 JSSP 调用示例的完成品一套
- `reference/wrapper-reference.md` - 注册文件规格、注解、JavaScript 与 Java 之间的类型转换、异常处理

## 实现步骤

### 步骤 1：设计要公开的 API

1. 确定 **JSSP 端的名称**
   - 包装类的 `getClassName()` 返回的字符串即为 JSSP 的全局对象名（例：`"SampleDummy"` → 从 JSSP 调用 `SampleDummy.hello(...)`）
   - 名称不得与 `d.ts/platform/` / `d.ts/tenant/` 中已定义的标准 API 名重复
2. 选择**形式**

   | 形式 | 从 JSSP 的调用方式 | 适用场景 |
   |------|---------------------|---------------|
   | 静态函数型 | `SampleDummy.hello('name')` | 不持有状态的处理（与标准 `NewLock` 形式相同） |
   | 实例型 | `new SampleGreeter('prefix').greet('name')` | 保持生成时的参数或状态并调用多个方法的处理 |

3. **职责分离**：包装类专注于参数转换和调用 Java 处理，业务逻辑放在 Java 端的类中

### 步骤 2：实现包装类

以 `assets/java-wrapper-sample.md` 的代码为基础实现。

- 继承 `jp.co.intra_mart.system.javascript.ScriptableObject`
- 重写 `getClassName()`，返回步骤 1 中确定的 JSSP 端名称
- 静态函数型：将公开的方法定义为 `public static`，并添加 `@JSStaticFunction`
- 实例型：
  - 定义无参数的 `public` 构造函数
  - 定义添加了 `@JSConstructor` 的 `public static Object constructor(Context, Object[], Function, boolean)`，并返回生成的实例
  - 为公开的实例方法添加 `@JSFunction`
- 以 `Object` 类型接收参数时 Java 端的类型及转换方法，请参阅 `reference/wrapper-reference.md` 的「参数的类型转换」
- 使用 `ScriptableObject` 或注解无需添加 Maven 依赖（由项目的 parent pom 解决）

### 步骤 3：创建注册文件

在 `src/main/conf/products/initializer/` 中创建注册文件，并在 `<api-class>` 中写入包装类的完全限定名。

- 文件名为 `initializer-` ＋ **模块 ID 中最后一个 `.` 之后的部分** ＋ `.xml`（例：模块 ID `com.example.test-imds` → `initializer-test-imds.xml`）。模块 ID 请在 `module.xml` 的 `<id>` 中确认
- 每个模块 1 个文件。有多个包装类时，并列多个 `<api-class>`
- 格式请参阅 `reference/wrapper-reference.md` 的「注册文件」
- 在 jar 中放置 `system-install_*.xml` 的方法，不会注册项目模块的包装类

### 步骤 4：创建 d.ts 类型定义

在 `d.ts/custom/{名称}.d.ts` 中用 `declare class` 声明 JSSP 端的类型（示例见 `assets/java-wrapper-sample.md`）。
`check-types.sh` 会读取 `d.ts/**/*.d.ts`，若无声明，调用端的类型检查会报错。

### 步骤 5：构建与确认

1. 执行 `mvn -s settings.xml package`，确认构建成功（无编译错误）
   - 注册文件在构建时会通过 XML 模式进行验证
2. 若创建了调用包装类的 JSSP，按项目的必需步骤（`jssp-page-verifier` 等）进行验证
3. 部署后，**重启服务器**，再在 JSSP 画面上确认运行情况（注册文件在服务器启动时读取）

## 注意事项

- 从 JSSP 调用未注册的名称会出现 `ReferenceError: "{名称}" is not defined.`。此时请确认注册文件的文件名（模块 ID 的末尾）・存放位置・`<api-class>` 的完全限定名，以及是否已重启服务器
- 包装类抛出 Java 异常时，JSSP 端可以用 `try-catch` 捕获，`e.name` 为 `JavaException`，`e.message` 为 `{异常类的完全限定名}: {消息}`。若在 JSSP 画面上直接显示此消息会泄露内部信息，因此在业务画面中请替换为通用化的消息
- 不要在包装类中编写业务逻辑。包装类作为 Java 端处理的调用入口，Java 端的处理按照 Java 的测试和技能规约实现
