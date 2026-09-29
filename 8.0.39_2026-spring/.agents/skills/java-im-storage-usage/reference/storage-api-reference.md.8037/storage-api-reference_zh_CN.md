# Storage API 参考手册（Java 版）

本文基于 intra-mart Accel Platform 核心源码（`im_core_base` 模块）中的实际类定义编写。不可凭记忆或推测补充方法。

## 包结构

```
jp.co.intra_mart.foundation.service.client.file
├── Storage<T extends Storage<T>>          … 接口。定义所有 I/O 方法
├── AbstractStorage<T extends Storage<T>>  … Storage 的通用实现（委托给 delegate）
├── PublicStorage extends AbstractStorage<PublicStorage>
├── SessionScopeStorage extends AbstractStorage<SessionScopeStorage>
├── SystemStorage extends AbstractStorage<SystemStorage>
├── SynchronizedPublicStorage / SynchronizedSystemStorage  … 同步版（仅在需要多线程互斥控制时使用）
├── AbstractSynchronizedStorage
└── StoragenameFilter / StorageFilter      … 用于 list/listStorages 的过滤接口
```

`PublicStorage` / `SessionScopeStorage` / `SystemStorage` 三个类均继承自 `AbstractStorage`，实际的 I/O 处理委托给内部的 `delegate`（通过反射生成的实现类）。**应用代码中不会直接操作 `delegate`。**三者的区别仅在于构造函数中解析出的「根路径」。

## 构造函数

### PublicStorage

```java
// storage/public 之下
public PublicStorage(CharSequence path)
public PublicStorage(CharSequence parent, CharSequence child)
public PublicStorage(PublicStorage parent, CharSequence child)
```

内部通过 `new StorageInformation().getPublicStorageRootPath()` 解析根路径。

### SystemStorage

```java
// storage/system 之下
public SystemStorage(CharSequence path)
public SystemStorage(CharSequence parent, CharSequence child)
public SystemStorage(SystemStorage parent, CharSequence child)
```

内部通过 `new StorageInformation().getSystemStorageRootPath()` 解析根路径。

### SessionScopeStorage

```java
// 按会话 ID 划分的临时区域之下
public SessionScopeStorage(CharSequence path)
public SessionScopeStorage(CharSequence parent, CharSequence child)
public SessionScopeStorage(SessionScopeStorage parent, CharSequence child)
```

内部动态决定根路径：
1. 在 `SessionAttributeResolver` 中设置会话作用域存储使用标志（`SessionScopeStorage.class.getName() + ".useStorage"`）
2. 通过 `SessionIdResolver.get().resolve()` 获取会话 ID
3. 若已注册 `SessionScopeStorageResolver`（SPI），则优先使用其根路径
4. 否则使用 `StorageInformation` 的临时区域根路径 + 会话 ID

**调用方无需关心会话 ID 或解析器。** 只需调用构造函数，即可自动解析出与当前请求所属会话关联的专用区域。

## Storage&lt;T&gt; 接口的通用常量

| 常量 | 类型 | 内容 |
|------|-----|------|
| `FILE_SEPARATOR_CHAR` | `char` | 文件分隔符字符。**始终固定为 `'/'`**（在 `jp.co.intra_mart.system.service.client.file.StorageInformation` 中定义为 `public static final char FILE_SEPARATOR_CHAR = '/';`，由 `Storage<T>` 重新公开） |
| `FILE_SEPARATOR` | `String` | 文件分隔符字符串。**始终固定为 `"/"`**（即 `String.valueOf(FILE_SEPARATOR_CHAR)`） |
| `CHARSET` | `Charset` | 基于平台设置的默认字符集 |

### 关于路径分隔符的注意事项（实现时必读）

- Storage API 的路径分隔符**与操作系统无关，始终为 `/`**。即使运行环境为 Windows，也不会变成 `\`
- **不要使用依赖操作系统的 Java 标准 `File.separator` / `File.separatorChar`。** 误用会导致在 Windows 环境下产生非预期的路径
- 拼接路径时，优先使用无需直接处理分隔符的 **`PublicStorage(parent, child)` 等双参数构造函数**
- 若必须通过字符串拼接来构建路径，不要硬编码 `"/"`，而应使用 `Storage.FILE_SEPARATOR` 常量

## 方法列表

除 `getName()` / `getParent()` / `getPath()` / `equals()` / `hashCode()` / `compareTo()` 外，其余方法均 `throws IOException`。

### 路径・属性获取

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `getName()` | `String` | 该存储所表示的文件/目录名称 |
| `getPath()` | `String` | 路径名字符串 |
| `getParent()` | `String` | 父路径 |
| `getCanonicalPath()` | `String` | 规范化后的路径（解析 `.` `..`，裁剪首尾分隔符） |
| `getRelativePath(T target)` | `String` | 该存储与 `target` 之间的相对路径 |
| `getRootStorage()` | `T` | 根存储 |
| `getParentStorage()` | `T`（若该存储为根则为 `null`） | 父存储 |
| `resolve(CharSequence other)` | `T` | 相对于该存储的相对存储 |

### 存在确认・种类判定

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `exists()` | `boolean` | 文件/目录是否存在 |
| `isDirectory()` | `boolean` | 是否为目录 |
| `isFile()` | `boolean` | 是否为普通文件 |
| `lastModified()` | `long` | 最后更新时间（自 epoch 起的毫秒数；不存在时为 `0L`） |
| `length()` | `long` | 文件大小（字节；不存在时为 `0L`） |

### 列表获取

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `list()` | `Collection<String>` | 下级文件＋目录的相对路径（非递归，等同于 `list(false)`） |
| `list(boolean recursive)` | `Collection<String>` | 同上（可指定是否递归） |
| `list(StoragenameFilter<T> filter)` | `Collection<String>` | 仅返回满足过滤条件的项（非递归） |
| `listStorages()` / `listStorages(boolean)` / `listStorages(StoragenameFilter<T>)` / `listStorages(StorageFilter<T>)` | `Collection<T>` | 以上各方法的 `Storage` 对象版本 |
| `directories()` / `directories(boolean recursive)` | `Collection<String>` | 仅下级目录 |
| `directoriesStorages()` / `directoriesStorages(boolean)` | `Collection<T>` | 同上的 `Storage` 对象版本 |
| `files()` / `files(boolean recursive)` | `Collection<String>` | 仅下级文件 |
| `filesStorages()` / `filesStorages(boolean)` | `Collection<T>` | 同上的 `Storage` 对象版本 |

以上方法在「该存储不表示目录，或目录为空」时，均返回空集合或 `null`（具体因方法而异，需留意各自的 JavaDoc）。

### 读取

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `read()` | `String` | 以标准字符集获取内容字符串 |
| `read(String charsetName)` | `String` | 以指定字符集名称获取 |
| `read(Charset charset)` | `String` | 以指定 `Charset` 获取 |
| `load()` | `byte[]` | 以字节数组获取内容 |
| `open()` | `InputStream` | 获取输入流。**调用方必须关闭** |

### 写入

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `write(CharSequence src)` | `void` | 以标准字符集写入（覆盖） |
| `write(CharSequence src, String charsetName)` | `void` | 以指定字符集名称写入 |
| `write(CharSequence src, Charset charset)` | `void` | 以指定 `Charset` 写入 |
| `save(byte[] byteArray)` | `void` | 写入字节数组 |
| `append(CharSequence src)` / `append(CharSequence src, String charsetName)` / `append(CharSequence src, Charset charset)` | `void` | 追加写入字符串 |
| `create()` | `OutputStream` | 获取输出流（新建/覆盖）。**调用方必须关闭** |
| `append()` | `OutputStream` | 以追加模式获取输出流。**调用方必须关闭** |

### 目录・文件操作

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `makeDirectories()` | `boolean` | 创建目录（包含所需的父目录） |
| `move(CharSequence newPath)` | `boolean` | 移动文件/目录 |
| `remove()` | `boolean` | 删除（非递归） |
| `remove(boolean recursive)` | `boolean` | 删除（`true` 为递归删除） |
| `copy(T to, boolean overwrite)` | `void` | 复制到 `to`。目录情况下按合并方式处理（详见 JavaDoc 中的分支说明，注意同名文件夹的处理） |

### 比较

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `compareTo(T storage)` | `int` | 字典序比较（`Comparable` 实现） |
| `equals(Object obj)` | `boolean` | 相等性判定 |
| `hashCode()` | `int` | 哈希码 |

## `copy()` 的分支规格（原 JavaDoc 摘要）

- 该实例不存在时: `IOException`（`FileNotFoundException`）
- 该实例为文件时
  - `to` 不存在: 复制到 `to`
  - `to` 为文件: 遵循 `overwrite` 参数
  - `to` 为目录: `IOException`
- 该实例为目录时
  - `to` 不存在: 创建 `to` 目录并复制
  - `to` 为文件: `IOException`
  - `to` 为目录且下级存在文件/文件夹: 遵循 `overwrite`（若存在同名层级的文件夹则为 `IOException`）
  - `to` 为目录且下级为空: 直接复制
  - `to` 一侧存在与复制源不一致的文件: 不作任何处理（合并行为；若想删除，需事先在 `to` 一侧调用 `remove(true)`）
