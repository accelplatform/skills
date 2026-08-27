# 临时文件管理模式（SessionScopeStorage）

`SessionScopeStorage` 用于处理与执行中的会话相绑定的临时区域。**虽不会被持久化，但平台代码侧并未保证自动删除的时机，因此前提是由使用方确保删除**（`im_workflow_core` 的 `WorkflowAttachFileUtil` 中也以注释形式明确写有相同的运用注意事项）。

## 基本模式: 临时文件的保存・读取・删除

```java
package jp.co.intra_mart.sample.storage;

import java.io.IOException;

import jp.co.intra_mart.foundation.service.client.file.SessionScopeStorage;

/**
 * 临时文件操作工具类。
 */
public final class TempFileUtil {

    private TempFileUtil() {
    }

    /**
     * 保存临时文件。
     * @param tempPath 相对于会话作用域存储根路径的相对路径
     * @param content 要保存的内容
     * @throws IOException 保存失败时
     */
    public static void saveTempFile(final String tempPath, final String content) throws IOException {
        final SessionScopeStorage storage = new SessionScopeStorage(tempPath);
        storage.write(content);
    }

    /**
     * 读取临时文件。
     * @param tempPath 相对于会话作用域存储根路径的相对路径
     * @return 文件不存在时返回 null
     * @throws IOException 读取失败时
     */
    public static String readTempFile(final String tempPath) throws IOException {
        final SessionScopeStorage storage = new SessionScopeStorage(tempPath);
        if (!storage.exists()) {
            return null;
        }
        return storage.read();
    }

    /**
     * 删除临时文件。
     * @param tempPath 相对于会话作用域存储根路径的相对路径
     * @throws IOException 删除失败时
     */
    public static void removeTempFile(final String tempPath) throws IOException {
        final SessionScopeStorage storage = new SessionScopeStorage(tempPath);
        if (storage.exists()) {
            storage.remove(storage.isDirectory());
        }
    }
}
```

## 推荐模式: 无论处理完成还是发生异常，都确保删除

使用临时文件的处理，无论正常结束还是异常结束，都应在 `finally` 中删除。

```java
import jp.co.intra_mart.foundation.service.client.file.SessionScopeStorage;

/**
 * 将上传的二进制数据保存到临时区域，进行加工处理后，
 * 无论成功与否都删除临时文件。
 * @param uploadData 上传的二进制数据
 * @throws IOException 发生输入输出错误时
 * @throws SomeBusinessException 加工处理失败时
 */
public void processUploadedFile(final byte[] uploadData) throws IOException, SomeBusinessException {
    final String tempPath = "upload/" + System.currentTimeMillis() + ".tmp";
    final SessionScopeStorage tempStorage = new SessionScopeStorage(tempPath);

    try {
        tempStorage.save(uploadData);
        doBusinessProcess(tempStorage);
    } finally {
        if (tempStorage.exists()) {
            tempStorage.remove();
        }
    }
}
```

## 从临时区域到持久区域的确定保存

通常的运用方式为两阶段：上传后先在 `SessionScopeStorage` 中临时保存，待业务上确定的时机再复制到 `PublicStorage`，然后删除临时文件（与 `WorkflowAttachFileUtil` 中 `getTempDirPathOnSessionScopeStorage` / `getTempDirPathOnPublicStorage` 的使用区分思路相同）。

```java
import jp.co.intra_mart.foundation.service.client.file.PublicStorage;
import jp.co.intra_mart.foundation.service.client.file.SessionScopeStorage;

/**
 * 将临时区域中的文件确定保存至持久区域。
 * @param tempPath 会话作用域存储上的临时文件路径
 * @param publicPath 公共存储上的保存目标路径
 * @throws IOException 发生输入输出错误时
 */
public static void commitToPublicStorage(final String tempPath, final String publicPath) throws IOException {
    final SessionScopeStorage tempStorage = new SessionScopeStorage(tempPath);
    final PublicStorage publicStorage = new PublicStorage(publicPath);

    try {
        tempStorage.copy(publicStorage, true); // true: 允许覆盖
    } finally {
        if (tempStorage.exists()) {
            tempStorage.remove();
        }
    }
}
```

## 注意事项

- 在临时文件名中包含时间戳或唯一 ID，以避免同一会话内发生冲突（例如：不要直接使用 `System.currentTimeMillis()` 或上传源文件名）
- 将用户输入（如上传源文件名）直接用作临时文件路径时，必须进行路径穿越攻击对策（去除 `..` 及分隔符）
- 临时文件会持续占用磁盘空间，**业务处理完成后应尽快删除**。为确保在长时间运行的任务或异常结束时也能删除，应严格使用 `try-finally`
