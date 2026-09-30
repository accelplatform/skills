# 基本文件操作模式（Java 版）

以下以 `PublicStorage` 为例说明，`SessionScopeStorage` / `SystemStorage` 除构造函数外 API 完全相同。

## 推荐模式: try-with-resources

与 JSSP 版不同，Java 版不存在回调方式。`open()` / `create()` / `append()` 直接返回流，因此**必须使用 `try-with-resources` 关闭**。

### 读取文本文件

```java
package jp.co.intra_mart.sample.storage;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import jp.co.intra_mart.foundation.service.client.file.PublicStorage;
import jp.co.intra_mart.foundation.service.client.file.Storage;

/**
 * 文件读取工具类。
 * @author INTRAMART
 */
public final class FileReadUtil {

    private FileReadUtil() {
    }

    /**
     * 逐行读取文本文件。
     * @param filePath 相对于存储根路径的相对路径
     * @return 行的列表
     * @throws IOException 读取失败时
     */
    public static java.util.List<String> readLines(final String filePath) throws IOException {
        final PublicStorage storage = new PublicStorage(filePath);
        final java.util.List<String> lines = new java.util.ArrayList<String>();

        try (InputStream in = storage.open();
                InputStreamReader isr = new InputStreamReader(in, Storage.CHARSET);
                BufferedReader reader = new BufferedReader(isr)) {
            String line;
            while ((line = reader.readLine()) != null) {
                lines.add(line);
            }
        }

        return lines;
    }

    /**
     * 将小容量文本文件一次性作为字符串获取。
     * <p>大容量文件请使用 {@link #readLines(String)}。</p>
     * @param filePath 相对于存储根路径的相对路径
     * @return 文件内容
     * @throws IOException 读取失败时
     */
    public static String readAll(final String filePath) throws IOException {
        final PublicStorage storage = new PublicStorage(filePath);
        return storage.read();
    }
}
```

### 写入文本文件

```java
/**
 * 写入文本文件(新建/覆盖)。
 * @param filePath 相对于存储根路径的相对路径
 * @param content 要写入的内容
 * @throws IOException 写入失败时
 */
public static void writeText(final String filePath, final String content) throws IOException {
    final PublicStorage storage = new PublicStorage(filePath);
    storage.write(content);
}

/**
 * 向文本文件追加内容。
 * @param filePath 相对于存储根路径的相对路径
 * @param content 要追加的内容
 * @throws IOException 追加失败时
 */
public static void appendText(final String filePath, final String content) throws IOException {
    final PublicStorage storage = new PublicStorage(filePath);
    storage.append(content);
}
```

### 二进制文件的读写（直接操作流的情况）

```java
import java.io.OutputStream;

/**
 * 写入二进制文件。
 * @param filePath 相对于存储根路径的相对路径
 * @param data 二进制数据
 * @throws IOException 写入失败时
 */
public static void writeBinary(final String filePath, final byte[] data) throws IOException {
    final PublicStorage storage = new PublicStorage(filePath);

    // 少量数据使用 save() 更简洁
    storage.save(data);
}

/**
 * 以流的方式复制大容量二进制文件。
 * @param srcPath 复制源的相对路径
 * @param destPath 复制目标的相对路径
 * @throws IOException 复制失败时
 */
public static void copyLargeFile(final String srcPath, final String destPath) throws IOException {
    final PublicStorage src = new PublicStorage(srcPath);
    final PublicStorage dest = new PublicStorage(destPath);

    try (InputStream in = src.open();
            OutputStream out = dest.create()) {
        final byte[] buffer = new byte[8192];
        int len;
        while ((len = in.read(buffer)) != -1) {
            out.write(buffer, 0, len);
        }
    }
}
```

使用 `Storage#copy(T to, boolean overwrite)` 可以一行实现与上述等效的复制（参见 `reference/storage-api-reference.md` 中 `copy()` 的分支规格）。

```java
public static void copyFile(final String srcPath, final String destPath) throws IOException {
    final PublicStorage src = new PublicStorage(srcPath);
    final PublicStorage dest = new PublicStorage(destPath);
    src.copy(dest, true); // true: 允许覆盖
}
```

## 文件操作

```java
/**
 * 移动文件。
 */
public static void moveFile(final String srcPath, final String destPath) throws IOException {
    final PublicStorage storage = new PublicStorage(srcPath);
    storage.move(destPath);
}

/**
 * 删除文件(仅在存在时)。
 */
public static void deleteFile(final String filePath) throws IOException {
    final PublicStorage storage = new PublicStorage(filePath);
    if (storage.exists()) {
        storage.remove();
    }
}

/**
 * 递归删除目录(仅在存在时)。
 */
public static void deleteDirectory(final String dirPath) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    if (storage.exists() && storage.isDirectory()) {
        storage.remove(true); // true: 递归删除
    }
}
```

## 获取文件信息

```java
/**
 * 获取文件信息。
 */
public static java.util.Map<String, Object> getFileInfo(final String filePath) throws IOException {
    final PublicStorage storage = new PublicStorage(filePath);
    final java.util.Map<String, Object> info = new java.util.HashMap<String, Object>();
    info.put("exists", storage.exists());
    info.put("isFile", storage.isFile());
    info.put("isDirectory", storage.isDirectory());
    info.put("size", storage.length());
    info.put("lastModified", storage.lastModified());
    return info;
}
```

## 注意事项

- `read()` / `load()` 会将文件整体读入内存。大容量文件应使用 `open()` 进行流式处理（`BufferedReader#readLine()` 等）
- 路径始终以相对于根路径的相对路径指定（不可使用绝对路径）
- 将用户输入用于文件名、路径时，需进行路径穿越攻击对策（去除或拒绝 `..` 及分隔符）
