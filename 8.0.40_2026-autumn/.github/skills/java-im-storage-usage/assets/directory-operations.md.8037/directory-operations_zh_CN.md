# 目录操作模式（Java 版）

## 创建目录

```java
package jp.co.intra_mart.sample.storage;

import java.io.IOException;

import jp.co.intra_mart.foundation.service.client.file.PublicStorage;

/**
 * 目录创建工具类。
 */
public final class DirectoryUtil {

    private DirectoryUtil() {
    }

    /**
     * 创建目录(包含父目录一并创建)。
     * @param dirPath 相对于存储根路径的相对路径
     * @return 创建成功时返回 true
     * @throws IOException 创建失败时
     */
    public static boolean createDirectory(final String dirPath) throws IOException {
        final PublicStorage storage = new PublicStorage(dirPath);
        return storage.makeDirectories();
    }
}
```

## 获取文件・目录列表

```java
import java.util.Collection;

/**
 * 获取文件列表(非递归)。
 */
public static Collection<String> listFiles(final String dirPath) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    return storage.files();
}

/**
 * 获取文件列表(递归)。
 */
public static Collection<String> listFilesRecursive(final String dirPath) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    return storage.files(true);
}

/**
 * 获取目录列表。
 */
public static Collection<String> listDirectories(final String dirPath) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    return storage.directories();
}

/**
 * 获取文件与目录的完整列表。
 */
public static Collection<String> listAll(final String dirPath) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    return storage.list();
}
```

## 以 `Storage` 对象获取列表（希望在后续处理中直接操作各个文件时）

```java
import java.util.Collection;

/**
 * 将目录下的文件以 Storage 对象获取，
 * 并分别取得各自的大小。
 */
public static java.util.Map<String, Long> listFileSizes(final String dirPath) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    final Collection<PublicStorage> files = storage.filesStorages(true);

    final java.util.Map<String, Long> sizes = new java.util.LinkedHashMap<String, Long>();
    for (final PublicStorage file : files) {
        sizes.put(file.getPath(), file.length());
    }
    return sizes;
}
```

## 使用过滤器获取列表

```java
import jp.co.intra_mart.foundation.service.client.file.StoragenameFilter;

/**
 * 按扩展名过滤获取文件列表。
 * @param dirPath 相对于存储根路径的相对路径
 * @param extension 扩展名（例如: ".csv"）
 */
public static Collection<String> listFilesByExtension(final String dirPath, final String extension) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    return storage.list(new StoragenameFilter<PublicStorage>() {
        @Override
        public boolean accept(final PublicStorage dir, final String name) {
            return name.endsWith(extension);
        }
    });
}
```

`StoragenameFilter<T>#accept(T dir, String name)` 的签名切勿在不确认 `reference/storage-api-reference.md` 的情况下凭推测编写（因版本不同签名可能存在细微差异，实现时务必通过 `find_symbol` 等方式确认最新定义）。

## 存在性检查

```java
/**
 * 检查文件是否存在。
 */
public static boolean fileExists(final String filePath) throws IOException {
    final PublicStorage storage = new PublicStorage(filePath);
    return storage.exists() && storage.isFile();
}

/**
 * 检查目录是否存在。
 */
public static boolean directoryExists(final String dirPath) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    return storage.exists() && storage.isDirectory();
}
```
