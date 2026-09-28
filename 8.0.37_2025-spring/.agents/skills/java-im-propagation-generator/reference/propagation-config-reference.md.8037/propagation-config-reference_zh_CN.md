# IM-Propagation 配置文件参考手册（Java 版）

基于 intra-mart Accel Platform 核心源代码（`im_propagation` 模块）的配置文件参考手册与 XSD 定义。不要凭记忆或猜测补充元素・属性。

IM-Propagation 共有 3 种配置文件。

| 配置文件 | 作用 | 存放位置（项目侧） | 单一/多个 |
|---|---|---|---|
| `propagation-senders-config` | 发送数据时，根据 `source`+`operationType` 解析要使用的 `Encoder` | `src/main/conf/propagation-senders-config/{任意名}.xml` | 可有多个文件 |
| `propagation-receivers-config` | 接收数据时，根据 `source`+`operationType` 解析要使用的 `Decoder`/`Procedure` | `src/main/conf/propagation-receivers-config/{任意名}.xml` | 可有多个文件 |
| `propagation-config` | IM-Propagation 整体的行为设置（死锁检测等） | `src/main/conf/propagation-config.xml` | 单一文件 |

以上文件在构建时都会按原有相对结构原样复制到 `WEB-INF/conf/` 下。**不创建包层级，直接将文件放置在指定目录下。**

## `propagation-senders-config`

- 命名空间：`http://www.intra-mart.jp/propagation/senders-config`
- 根元素：`propagation-senders-config`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<propagation-senders-config xmlns="http://www.intra-mart.jp/propagation/senders-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/propagation/senders-config propagation-senders-config.xsd">
  <sender source="jp.co.example.module.SampleData" operationType="DATA_CREATED">
    <encoder class="jp.co.example.module.propagation.encoder.SampleEncoder">
      <params>
        <param key="customKey">customValue</param>
      </params>
    </encoder>
    <required-procedure class="jp.co.example.module.propagation.procedure.RequiredCheckProcedure" />
  </sender>
</propagation-senders-config>
```

### 元素・属性一览

| 元素/属性 | 是否必需 | 说明 |
|---|---|---|
| `sender`（元素） | 必需（1个以上） | 发送对象的定义。子元素包含 `encoder`（必需・1个）、`required-procedure`（可选・可多个） |
| `sender/@source` | 必需 | 发送源数据的完全限定类名。必须与传给 `PropagationManager#send()` 的数据（或显式指定的 `dataClass`）的类一致 |
| `sender/@operationType` | 必需 | 操作类型。`OperationType` 的标准常量，或自定义字符串 |
| `encoder`（元素） | 必需（1个） | 要使用的 `Encoder` 实现的定义 |
| `encoder/@class` | 必需 | 实现了 `AbstractEncoder`（或 `Encoder` 接口）的类的完全限定类名 |
| `encoder/params/param`（元素） | 可选 | 传给 `Encoder` 的自定义参数，通过 `AbstractEncoder#getParamValue(key)` 等引用 |
| `encoder/params/param/@key` | 使用 `param` 时必需 | 参数的键 |
| `required-procedure`（元素） | 可选（可多个） | 声明发送前必须执行的 `Procedure`（例如用于同步的前置校验） |
| `required-procedure/@class` | 使用 `required-procedure` 时必需 | 要执行的 `Procedure` 实现的完全限定类名 |

- 若为同一 `source`+`operationType` 组合定义多个 `sender` 元素，则所有匹配的 Encoder 都会被调用

## `propagation-receivers-config`

- 命名空间：`http://www.intra-mart.jp/propagation/receivers-config`
- 根元素：`propagation-receivers-config`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<propagation-receivers-config xmlns="http://www.intra-mart.jp/propagation/receivers-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/propagation/receivers-config propagation-receivers-config.xsd">
  <receiver source="jp.co.example.module.SampleData" operationType="DATA_CREATED">
    <decoder class="jp.co.example.other_module.propagation.decoder.SampleDecoder">
      <params>
        <param key="customKey">customValue</param>
      </params>
    </decoder>
    <procedure class="jp.co.example.other_module.propagation.procedure.SampleProcedure" />
  </receiver>
</propagation-receivers-config>
```

### 元素・属性一览

| 元素/属性 | 是否必需 | 说明 |
|---|---|---|
| `receiver`（元素） | 必需（1个以上） | 接收对象的定义。子元素包含 `decoder`（必需・1个）、`procedure`（必需・1个） |
| `receiver/@source` | 必需 | **发送方**数据模型的完全限定类名。必须与发送配置文件中的 `sender/@source` 一致（不是接收方数据模型的 FQCN） |
| `receiver/@operationType` | 必需 | 操作类型。必须与发送配置文件中的 `sender/@operationType` 一致 |
| `decoder`（元素） | 必需（1个） | 要使用的 `Decoder` 实现的定义 |
| `decoder/@class` | 必需 | 实现了 `AbstractDecoder`（或 `Decoder` 接口）的类的完全限定类名 |
| `decoder/params/param`（元素） | 可选 | 传给 `Decoder` 的自定义参数 |
| `procedure`（元素） | 必需（1个） | 要使用的 `Procedure` 实现的定义 |
| `procedure/@class` | 必需 | 实现了 `AbstractProcedure`/`AbstractSessionableProcedure`（或 `Procedure` 接口）的类的完全限定类名 |
| `procedure/params/param`（元素） | 可选 | 传给 `Procedure` 的自定义参数 |

- 可以为同一 `source`+`operationType` 组合定义多个 `receiver` 元素（使多个自定义模块能够各自独立接收同一份发送数据）。处理顺序不作保证，但每个 `receiver` 是互斥处理的（一次一个线程）

## `propagation-config`

- 单一文件。项目侧的存放位置为 `src/main/conf/propagation-config.xml`（会被复制到 `WEB-INF/conf/propagation-config.xml`）
- 用于配置 IM-Propagation 的整体行为（死锁检测所用的休眠时间）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<propagation-config xmlns="http://www.intra-mart.jp/propagation/config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/propagation/config propagation-config.xsd">
  <each-thread-sleep>100</each-thread-sleep>
  <max-thread-sleep>1000</max-thread-sleep>
</propagation-config>
```

| 元素 | 类型 | 默认值 | 范围 | 说明 |
|---|---|---|---|---|
| `each-thread-sleep` | integer（毫秒） | `100` | `0`〜`1000` | 当同一数据处理类被其他线程锁定时，每次等待的时间 |
| `max-thread-sleep` | integer（毫秒） | `1000` | `0`〜`60000` | 判定为死锁之前的最大等待时间 |

- 检测到死锁时发送会失败，`PropagationManager#send()` 会抛出 `SendException`。应将发送方设计为捕获 `SendException` 并调用 `abort()`（通过 `abort()` 会调用接收方的 `onAbort`）
- 通常的应用开发中无需更改本文件的数值。如需更改，应先向用户告知其影响范围（租户整体的 IM-Propagation 处理速度）后再进行

## 关于存放位置的通用注意事项

- 应存放在项目的 `src/main/conf/` 下（**不是** `src/main/webapp/WEB-INF/conf/`）。构建时会按原有相对结构复制到 `WEB-INF/conf/` 下
- `propagation-senders-config`/`propagation-receivers-config` 下的文件名可任意指定（多个模块可各自放置独立的文件；建议包含模块 ID・功能名以避免文件名冲突）
- 由于会进行 XSD 校验，命名空间・元素名・属性名必须准确书写。若指定了错误的命名空间，配置文件本身将无法加载
