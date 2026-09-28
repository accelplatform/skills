# IM-BPM 导入规格

在租户环境搭建时，创建 IM-BPM 流程设计器的项目，并上传 BPMN 文件。由于 Importer 的标准段中没有 IM-BPM 专用元素，因此通过扩展导入 JS（`doImport`）进行导入。

> **关于通信方式的说明**：BPM 的 REST API（`/api/bpm/webdesigner/...`）在扩展导入 JS 的执行上下文中会出现认证错误而无法使用，因此改为通过 `ProjectFactory` / `ResourceFactory` 获取作为 REST API 实体的 Java 实现类（`ProjectResourceImpl` / `ResourceResourceImpl`，位于 `im_activiti_web_designer` 模块），并通过 Rhino 的 LiveConnect 直接调用。由于实现方法内部的授权检查仍然存在，因此执行用户需要具备 BPM 项目的编辑・部署权限。

> **关于实现状况的说明**：本文档所描述的 `bpmImport`，目前尚未被 `.github/skills/jssp-tenant-setup-generator/scripts/build-setup-import.js`（`workflowImport` / `logicImport` 的实现来源）所支持。当前即使运行该构建脚本，也不会从 `bpmImport` 段输出任何生成物。若要按照本文档的内容生成，需要在构建脚本侧进行相应支持，或手动追加 `<extends-import-class>`。

## 目录

- [在 spec.json 中的指定](#在-specjson-中的指定)
- [生成物](#生成物)
  - [复制处理](#复制处理)
- [扩展导入 JS 的处理内容](#扩展导入-js-的处理内容)
  - [异常处理](#异常处理)
- [Java 直接调用详情](#java-直接调用详情)
  - [项目存在性检查](#项目存在性检查)
  - [新建项目](#新建项目)
  - [BPMN 资源存在性检查](#bpmn-资源存在性检查)
    - [resourceName 的计算](#resourcename-的计算)
  - [BPMN 上传／更新](#bpmn-上传更新)
    - [BPMN 文本转换](#bpmn-文本转换)
- [必须版本](#必须版本)
- [版本升级运维](#版本升级运维)
- [注意事项](#注意事项)
- [执行时机](#执行时机)
- [相关 reference](#相关-reference)

## 在 spec.json 中的指定

```json
"bpmImport": {
  "projectId": "any-app",
  "projectName": "Any App",
  "files": [
    "01_sample.bpmn",
    "02_other.bpmn"
  ]
}
```

| 字段 | 类型 | 内容 |
|---|---|---|
| `bpmImport.projectId` | string | 流程设计器的项目 ID。初始值提示为 artifactId，由用户确认 |
| `bpmImport.projectName` | string | 流程设计器的项目名。初始值提示为 pom.xml 中的 `<name>`，由用户确认 |
| `bpmImport.files` | string[] | 列举已复制到 `src/main/storage/system/products/import/basic/<key>/<version>/` 下的 BPMN 文件名。复制源为 `doc/<BPM 流程名>-prompt/`（在 SKILL.md 生成步骤的需求确认环节中选择并复制）。可指定多个，将按指定顺序上传 |

省略时，或 `files` 为空数组时，不输出任何内容。

## 生成物

以下内容并非由 build 脚本生成，而是**按照 SKILL.md 的生成步骤（步骤 2～3），由本技能直接生成与追加**（关于尚未支持的详情，参见开头的「关于实现状况的说明」）。

| 类别 | 路径 |
|---|---|
| 导入用 BPMN（复制） | `src/main/storage/system/products/import/basic/<key>/<version>/<file>.bpmn` |
| 扩展导入 JS | `src/main/jssp/src/<key>/initialize/<version>/<key>_bpm_import.js` |
| 对 import-config.xml 的追加 | 在 `<extends-import>` 段中追加 `<extends-import-class>` 行（手动追加） |

与 IM-Workflow / IM-LogicDesigner 相同，BPMN 文件会被复制到 `storage/system`。执行 `doImport` 时，将从 `SystemStorage` 读取该文件，并直接调用 Java 类来创建项目、执行上传。

### 复制处理

将从 `doc/<BPM 流程名>-prompt/` 下选中的 BPMN 文件复制到 `src/main/storage/system/products/import/basic/<key>/<version>/<file>.bpmn`。不设置子目录，直接平铺放置于 `<version>/` 之下（在 SKILL.md 生成步骤的需求确认环节中执行）。

## 扩展导入 JS 的处理内容

> **变量声明使用 `var`**：虽然 `.github/instructions/jssp-code-style.instructions.md` 推荐使用 `let`，但扩展导入 JS 在 Rhino 的 ES5 兼容上下文中执行，无法使用 `let` / `const` / 箭头函数（参见 `.github/skills/jssp-tenant-setup-generator/reference/extends-import.md` 的「实现上的约束」）。本文档中的示例也全部统一使用 `var`。

```
doImport(tenantId)
  ├ checkProjectExists(projectId)
  │    直接调用 ProjectService.isExistProject(projectId)（boolean）
  │    ├ true ：项目已存在 → 跳转到 BPMN 上传
  │    └ false：项目不存在 → 转到 createProject()
  ├ createProject()
  │    组装 ProjectRequest，调用 ProjectFactory.getInstance().getProjectResource().post(projectRequest, null)
  └ for each file:
       uploadOrUpdateBpmnFile()
         ├ 通过 SystemStorage('products/import/basic/<key>/<version>/<file>.bpmn') 获取文件（byte[]）
         ├ 将获取的 byte[] 转换为 UTF-8 字符串（用作 processDefinition 字符串。详情参见「BPMN 文本转换」）
         ├ 计算 resourceName（从文件名中去除扩展名，并附加 ResourceType.DEFINITION.getExtension()="`.bpmn`"）
         ├ ★ 存在性检查 ★
         │    直接调用 ResourceService.getActiveResource(projectId, "DEFINITION", resourceName)
         │    ├ 非 null：存在现有资源 → 将返回值（ResourceEntity）的 recordDate 设置到 ResourceRequest 中……更新
         │    └ null  ：不存在现有资源 → 不设置 recordDate                                    ……新增登记
         └ 组装 ResourceRequest，调用 ResourceFactory.getInstance().getResourceResource().post(resourceRequest, null, null)
              （使用 post(ResourceRequest,...) 重载版本。理由参见「BPMN 上传／更新」「注意事项」）
```

### 异常处理

用 try-catch 覆盖整个 `doImport`，**在将错误消息输出到日志后重新 throw**（遵循 `.github/skills/jssp-tenant-setup-generator/reference/extends-import.md` 的「异常处理必须以 try/catch 覆盖，用 Logger 记录后重新 throw」）。通过重新 throw，Importer 整体会被视为失败，从而使 BPMN 未能导入这一事实体现在搭建结果中。不得将其吞掉。

不要以文件为单位 catch；一旦某个文件上传失败，就**不再处理后续文件而中断**。

```javascript
function doImport(tenantId) {
  var logger = Logger.getLogger('<key>.initialize.bpm');
  var index;

  logger.info('[<key>] BPM import started. tenantId={}', tenantId);

  try {
    if (!checkProjectExists(PROJECT_ID)) {
      createProject(PROJECT_ID, PROJECT_NAME);
      logger.info('[<key>] BPM project created. projectId={}', PROJECT_ID);
    }

    for (index = 0; index < BPMN_FILES.length; index += 1) {
      uploadOrUpdateBpmnFile(PROJECT_ID, BPMN_FILES[index]);
      logger.info('[<key>] BPMN imported. file={}', BPMN_FILES[index]);
    }
  } catch (error) {
    logger.error('[<key>] BPM import failed. error={}', toErrorMessage(error));
    throw error;   // 为使 Importer 整体被视为失败而重新 throw
  }

  logger.info('[<key>] BPM import completed. fileCount={}', BPMN_FILES.length);
}

/**
 * 从异常中取出用于日志输出的消息。
 *
 * @param {*} error 异常
 * @return {string} 日志用消息
 */
function toErrorMessage(error) {
  if (error && error.javaException && error.javaException.getMessage) {
    return String(error.javaException.getMessage());
  }
  if (error && error.getMessage) {
    return String(error.getMessage());
  }
  return String(error && (error.message || error));
}
```

由于 `ActivitiWebDesignerException` 是 Java 异常，在 Rhino 中可能被包装为 `JavaException` 后被 catch。直接调用 `error.getMessage()` 可能得到 `undefined`，因此应如上所示，通过优先引用 `error.javaException` 的辅助函数来获取消息。

## Java 直接调用详情

### 项目存在性检查

| 项目 | 内容 |
|---|---|
| 类 | `jp.co.intra_mart.activiti.webdesigner.service.ProjectService` |
| 方法 | `public static boolean isExistProject(String projectId)` |
| 返回值 | `true`：项目已存在 → 转到 BPMN 上传／`false`：项目不存在 → 转到项目创建 |

### 新建项目

| 项目 | 内容 |
|---|---|
| 获取来源 | `jp.co.intra_mart.activiti.webdesigner.rest.service.api.project.ProjectFactory#getInstance().getProjectResource()`（返回 `ProjectResourceImpl` 的单例实例，类型为 `ProjectResource` 接口） |
| 方法 | `public void post(ProjectRequest projectRequest, HttpServletRequest request)` |
| `request` 参数 | 方法内部不会引用该参数，因此可安全地以 `null` 调用 |

`ProjectRequest`（`jp.co.intra_mart.activiti.webdesigner.rest.service.api.project.ProjectRequest`，Lombok `@Data` Bean）的组装：

| setter | 值 |
|---|---|
| `setProjectId(String)` | `<projectId>` |
| `setProjectName(String)` | `<projectName>` |
| `setSortNumber(int)` | `0` |
| `setLocalizes(Map<Locale, ProjectLocalize>)` | 空的 `java.util.HashMap`（内部的 `ProjectService.insertLocal` / `ImBpmWebDesignerProjectResource.registerResource` 已对空 map 及 null 做过检查，因此不会因此产生 `NullPointerException`） |

成功时无返回值（`void`）。失败时会抛出 `ActivitiWebDesignerException`（项目 ID/名称必填检查、权限检查等）。

### BPMN 资源存在性检查

| 项目 | 内容 |
|---|---|
| 类 | `jp.co.intra_mart.activiti.webdesigner.service.ResourceService` |
| 方法 | `public static ResourceEntity getActiveResource(String projectId, String resourceType, String resourceName)` |
| 参数 | `projectId`＝项目 ID／`resourceType`＝`ResourceType.DEFINITION.getValue()`（`"DEFINITION"`）／`resourceName`＝参见下方「resourceName 的计算」 |
| 返回值 | 若同一 `projectId`+`resourceType`+`resourceName` 组合下，存在当前处于激活状态（位于 `start_active_time`～`end_active_time` 范围内）的资源，则返回 `ResourceEntity`；不存在则返回 `null` |

不存在与 `ProjectService.isExistProject` 相当的、以资源为单位、返回 boolean 的专用存在性检查方法。是否存在通过本方法的返回值是否为 `null` 来判定。需要注意的是，资源的实质识别单位是 `projectId`+`resourceType`+`resourceName` 的组合，而非 `ResourceEntity.resourceId`（按版本新分配的内部键）。

`ResourceEntity`（`jp.co.intra_mart.activiti.webdesigner.mirage.resource.ResourceEntity`）拥有 `resourceId` / `projectId` / `resourceType` / `resourceName` / `recordDate`（继承自父类 `WebDesignerEntity`，类型为 `java.sql.Timestamp`）等 public 字段。更新时，将该 `recordDate` 原样传递给后述的 `ResourceRequest.setRecordDate()`。

#### resourceName 的计算

`resourceName` 根据上传文件名，按照与实现（`ResourceResourceImpl.java` 中 `resourceType==null` 分支）相同的逻辑计算：去除扩展名后，附加 `ResourceType.DEFINITION.getExtension()`（`".bpmn"`）。

```javascript
var ResourceType = Packages.jp.co.intra_mart.activiti.webdesigner.common.ResourceType;
var extension = String(ResourceType.DEFINITION.getExtension());
var dotIndex = fileName.lastIndexOf('.');
var baseName = dotIndex > -1 ? fileName.substring(0, dotIndex) : fileName;
var resourceName = baseName + extension;
```

### BPMN 上传／更新

| 项目 | 内容 |
|---|---|
| 获取来源 | `jp.co.intra_mart.activiti.webdesigner.rest.service.api.resource.ResourceFactory#getInstance().getResourceResource()`（返回 `ResourceResourceImpl` 的单例实例，类型为 `ResourceResource` 接口） |
| 方法 | `public ResourceResponse post(ResourceRequest resourceRequest, HttpServletRequest request, HttpServletResponse response)` |

> **注意**：`post(AttachmentFile file, ..., Long recordDate, ...)` 重载版本（固定以 `resourceType=null` 调用的旧方式）内部完全不引用 `recordDate` 参数，因此无法用于更新（若已存在同名资源，必定会导致 `MSG_E_BPM_DESIGNER_RESOURCE_CREATED` 异常）。新增登记和更新均应统一采用本节所述的 `ResourceRequest` 方式。

`ResourceRequest`（`jp.co.intra_mart.activiti.webdesigner.rest.service.api.resource.ResourceRequest`，Lombok `@Data` Bean）的组装：

| setter | 值 |
|---|---|
| `setProjectId(String)` | `<projectId>` |
| `setResourceType(String)` | `ResourceType.DEFINITION.getValue()`（`"DEFINITION"`） |
| `setResourceName(String)` | 上述「resourceName 的计算」中求得的值 |
| `setDescription(String)` | `""` |
| `setProcessDefinition(String)` | BPMN 的内容（下方「BPMN 文本转换」中得到的字符串） |
| `setIsRegisterEvenInNG(Boolean)` | `false`（当模式／流程校验不通过时，不进行登记，而是抛出异常） |
| `setIsValidateProcess(Boolean)` | `false`（不进行流程有效性校验，仅进行模式校验。与现有 `post(AttachmentFile,...)` 路径的默认值相同） |
| `setRecordDate(Timestamp)` | **仅当存在现有资源时**，设置在「BPMN 资源存在性检查」中获取到的 `ResourceEntity.recordDate`（即更新）。不存在现有资源时不调用该方法，保持未设置状态（即新增登记） |

`request` / `response` 参数在此调用路径中不会被引用，因此可安全地以 `null` 调用。

返回值为 `ResourceResponse`（上传／更新后的资源信息，包含新分配的 `resourceId`）。失败时会抛出 `ActivitiWebDesignerException`（详情参见「注意事项」）。

「更新」的本质并非通过 UPDATE 语句进行覆盖，而是**基于乐观锁的版本化管理**：传入 `recordDate` 调用 `post` 后，现有资源会被 `suspend`（更新 `end_active_time`，即归档为历史记录），并以新的 `resourceId` 插入新版本。

#### BPMN 文本转换

`ResourceRequest.setProcessDefinition(String)` 接收的是**字符串**形式的 BPMN 内容（不使用 `AttachmentFile`）。`SystemStorage` 中虽然存在以字符串返回整个文件的 `read(charsetName)` / `load()`，但**两者均为 `@deprecated`**；而非 deprecated 的 `openAsText()` 所返回的 `TextReader` 又没有全文读取方法（仅有 `readLine()` / `eachLine()` / `read(buffer, offset, length)` / `transferTo()`）。因此需要对 `openAsBinary()` 获取的 `ByteReader`，向按照 `SystemStorage#length()` 得到的文件大小预先分配好的缓冲区循环调用 `read(buffer, offset, length)` 进行读取（由于以空数组调用 `read()` 会始终返回 0 字节这一陷阱，因此必须预先分配缓冲区），并将得到的字节序列转换为 UTF-8 字符串。

另外，`length()` 是 **`SystemStorage` 一侧**的方法（文件大小），而非 `ByteReader` 的方法。`ByteReader` 中不存在 `length()`。

调用方：

```javascript
var storage = new SystemStorage('products/import/basic/<key>/<version>/<file>.bpmn');
if (!storage.exists()) {
  throw new Error('BPMN file does not exist in SystemStorage: ' + storage.getPath());
}
request.setProcessDefinition(convertBytesToText(readAllBytes(storage)));
```

辅助函数的实现（原样定义在 `<key>_bpm_import.js` 中）：

```javascript
/**
 * 读取 SystemStorage 的全部字节。
 *
 * @param {SystemStorage} storage 读取对象
 * @return {number[]} 全部字节（0～255 的 Number 数组）
 */
function readAllBytes(storage) {
  var reader = storage.openAsBinary();
  var length = Number(storage.length());
  var buffer = createZeroFilledBuffer(length);
  var offset = 0;
  var readLength;

  try {
    while (offset < length) {
      readLength = reader.read(buffer, offset, length - offset);
      if (readLength <= 0) {
        break;
      }
      offset += readLength;
    }
  } finally {
    reader.close();
  }

  if (offset !== length) {
    throw new Error('Failed to read complete BPMN file. expected=' + length + ', actual=' + offset);
  }
  return buffer;
}

/**
 * 生成指定长度的零初始化缓冲区。
 * 由于以空数组传给 ByteReader#read() 会始终只能读到 0 字节，因此必须预先分配。
 *
 * @param {number} length 缓冲区长度
 * @return {number[]} 零初始化缓冲区
 */
function createZeroFilledBuffer(length) {
  var buffer = [];
  var index;

  for (index = 0; index < length; index += 1) {
    buffer.push(0);
  }
  return buffer;
}

/**
 * 将字节序列转换为 UTF-8 字符串。
 *
 * @param {number[]} bytes 字节序列
 * @return {string} UTF-8 文本
 */
function convertBytesToText(bytes) {
  // ActivitiUtils.getSystemXmlEncoding() 的实现固定为 'UTF-8'，因此直接使用字面值转换
  return String(new Packages.java.lang.String(
    bytes,
    Packages.java.nio.charset.StandardCharsets.UTF_8
  ));
}
```

实现注记：

| 项目 | 内容 |
|---|---|
| `reader.read()` 的返回值 | 读取到的字节数／EOF 时为 `-1`／失败时为 `null` 这三种值（`d.ts/platform/storage/im-ssjs-byte-reader.d.ts`）。`readLength <= 0` 可同时捕获 `-1` 与 `null`（数值比较时会转换为 `0`，故条件成立）两种情况并跳出循环 |
| 读取不足的检测 | 跳出循环后判定 `offset !== length`，若不一致则抛出异常。无论因 EOF 还是读取失败而中途结束，都不会将不完整的 BPMN 传给 `setProcessDefinition()` |
| `Number(storage.length())` | 用 `Number()` 包装返回值，确保后续的比较与加法均为 JS 的数值运算 |
| `reader.close()` | 在 `finally` 中必定执行 |
| 内存消耗 | 会将整个文件展开到内存中。BPMN 通常为数十～数百 KB，因此不成问题 |
| 传给 `convertBytesToText()` 的参数 | `readAllBytes()` 返回的是 0～255 的 Number 数组。由于 LiveConnect 会自动将 JavaScript 的 Number 数组转换为 Java 的 `byte[]`，因此与 `new java.io.ByteArrayInputStream(bytes)` 等用法相同，也可直接传给 `new java.lang.String(bytes, charset)` |

## 必须版本

请留意以下几点。

| 项目 | 内容 |
|---|---|
| 依赖类 | `ProjectService` / `ResourceService` / `ProjectFactory` / `ResourceFactory` / `ProjectResourceImpl` / `ResourceResourceImpl` / `ResourceRequest` / `ResourceEntity` / `ResourceType`（均为 `im_activiti_web_designer` 模块内的非公开实现类） |
| 兼容性风险 | 上述类并非如 REST API 那样的公开契约，intra-mart 版本升级时方法签名或内部逻辑可能在无预告的情况下被更改或删除。版本变化时应重新核对实际源代码 |
| `SystemStorage` | 仍继续用于读取 BPMN 文件 |

## 版本升级运维

多 config 运维的基本方针（`configNumber` 的递增、仅记述差异、不侵犯现有文件的原则）遵循 `.github/skills/jssp-tenant-setup-generator/reference/multi-config.md`。

本技能特有的对象文件有以下两个：
- 复制目标 BPMN（`<version>/<file>.bpmn`）
- `<key>_bpm_import.js`（`<version>/<key>_bpm_import.js`）

## 注意事项

| 项目 | 内容 |
|---|---|
| 需要授权权限 | 虽然 REST 层的注解（`@Secured`/`@Authz`）会被绕过，但实现方法内部的授权检查（`ImBpmWebDesignerProjectResource.isEditAuthzResource` 等）依然存在。租户环境搭建的执行上下文（导入执行用户）需要具备 BPM 项目的编辑权限。不要直接使用低层级 API（如 `ResourceService.terminateInsert` 等），否则会绕过该授权检查 |
| 项目已存在的情况 | 若 `ProjectService.isExistProject` 返回 `true`，则跳过项目创建，仅执行 BPMN 上传（包含新增登记／更新的判定） |
| BPMN 重复上传（新增登记／更新的判定） | 若 `ResourceService.getActiveResource(projectId, resourceType, resourceName)` 的返回值为 `null`，则新增登记；若非 `null`，则将其 `recordDate` 传给 `ResourceRequest.setRecordDate()` 进行更新。详情参见「BPMN 资源存在性检查」「BPMN 上传／更新」。若不传递 `recordDate` 而对已存在资源执行 `post`，会导致 `MSG_E_BPM_DESIGNER_RESOURCE_CREATED` 异常 |
| 乐观锁错误 | 若传给 `setRecordDate()` 的值，与 `post` 执行时活动资源的实际 `recordDate` 不一致（例如导入执行期间其他用户或其他进程更新了同一资源），会导致 `MSG_E_BPM_DESIGNER_RESOURCE_UPDATED` 异常。在租户环境搭建的执行上下文中通常不会发生，但应作为意外错误进行捕获 |
| BPMN 文件路径 | `files` 中仅指定文件名（不含路径分隔符）。仅以已复制到 `src/main/storage/system/products/import/basic/<key>/<version>/` 下的文件为对象（复制源为 `doc/<BPM 流程名>-prompt/`） |
| 事务 | 由于 `ProjectResourceImpl.post` / `ResourceResourceImpl.post` 内部会开启各自的事务（Mirage 的 `SessionTemplate`），因此不要在 `doImport` 一侧用 `Transaction.begin` 包裹 |
| 异常处理 | 由于不再有基于 HTTP 状态码的成败判定，应用 try-catch 覆盖整个 `doImport`，在将错误消息输出到日志后**重新 throw**，使 Importer 整体被视为失败（不得吞掉）。某个文件上传失败时，不再处理后续文件而中断。实现请参见「扩展导入 JS 的处理内容」的「异常处理」。主要异常代码有 `MSG_E_BPM_DESIGNER_PROJECT_IS_NOT_PERMIT`（无编辑权限）、`MSG_E_BPM_DESIGNER_PROJECT_DELETED`（项目不存在）、`MSG_E_BPM_DESIGNER_RESOURCE_CREATED`（存在性检查遗漏）、`MSG_E_BPM_DESIGNER_RESOURCE_UPDATED`（乐观锁冲突）、`MSG_E_BPM_DESIGNER_RESOURCE_PROCESS_DEFINITION_CHECK_NG`（模式／流程校验不通过）、`MSG_E_BPM_DESIGNER_RESOURCE_NAME_MAX_LENGTH`（资源名长度超限） |
| 内部 API 依赖风险 | 调用对象均为非公开的内部实现类。应在目标版本上进行动作确认，并在 intra-mart 版本升级时重新核对本文档的前提条件（签名、参数含义） |

## 执行时机

`<extends-import>` 段的执行时机及调用顺序，参见 `.github/skills/jssp-tenant-setup-generator/reference/extends-import.md`。同时使用 `extendsImport` / `workflowImport` / `logicImport` 时，`<extends-import-class>` 的输出顺序遵循 `.github/skills/jssp-tenant-setup-generator/reference/logic-import.md` 中的顺序图。

`bpmImport`（`<key>_bpm_import.js`）不包含在上述自动输出中（原因参见开头的「关于实现状况的说明」）。手动追加时，应添加在现有 `<extends-import-class>` 行（`extendsImport` → `workflowImport` → `logicImport`）的**之后**。

## 相关 reference

- `.github/skills/jssp-tenant-setup-generator/reference/extends-import.md`：扩展导入 JS 整体规格
- `.github/skills/jssp-tenant-setup-generator/reference/workflow-import.md`：IM-Workflow 导入（同类功能）
- `.github/skills/jssp-tenant-setup-generator/reference/logic-import.md`：IM-LogicDesigner 导入（同类功能）
  - 其中也有同名的 `readAllBytes()`，但那边采用 `ByteReader#eachBytes` + `java.io.ByteArrayOutputStream` 取得 Java `byte[]` 的方式。本技能采用「BPMN 文本转换」的 `read(buffer, offset, length)` 方式，请勿将两者混淆
- `.github/skills/jssp-tenant-setup-generator/reference/import-config.md`：import-`<artifactId>`-config-`<N>`.xml 的结构（`<extends-import>` 段）
