# 基本的なファイル操作パターン（Java 版）

`PublicStorage` を例に記載するが、`SessionScopeStorage` / `SystemStorage` もコンストラクタ以外は同じ API。

## 推奨パターン: try-with-resources

JSSP 版と異なり Java 版にコールバック方式は存在しない。`open()` / `create()` / `append()` はストリームをそのまま返すため、**必ず `try-with-resources` でクローズする**。

### テキストファイル読み込み

```java
package jp.co.intra_mart.sample.storage;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import jp.co.intra_mart.foundation.service.client.file.PublicStorage;
import jp.co.intra_mart.foundation.service.client.file.Storage;

/**
 * ファイル読み込みユーティリティ。
 * @author INTRAMART
 */
public final class FileReadUtil {

    private FileReadUtil() {
    }

    /**
     * テキストファイルを 1 行ずつ読み込みます。
     * @param filePath ストレージルートからの相対パス
     * @return 行のリスト
     * @throws IOException 読み込みに失敗した場合
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
     * 少量のテキストファイルを一括で文字列として取得します。
     * <p>大容量ファイルには {@link #readLines(String)} を使用してください。</p>
     * @param filePath ストレージルートからの相対パス
     * @return ファイル内容
     * @throws IOException 読み込みに失敗した場合
     */
    public static String readAll(final String filePath) throws IOException {
        final PublicStorage storage = new PublicStorage(filePath);
        return storage.read();
    }
}
```

### テキストファイル書き込み

```java
/**
 * テキストファイルを書き込みます（新規作成/上書き）。
 * @param filePath ストレージルートからの相対パス
 * @param content 書き込む内容
 * @throws IOException 書き込みに失敗した場合
 */
public static void writeText(final String filePath, final String content) throws IOException {
    final PublicStorage storage = new PublicStorage(filePath);
    storage.write(content);
}

/**
 * テキストファイルに追記します。
 * @param filePath ストレージルートからの相対パス
 * @param content 追記する内容
 * @throws IOException 追記に失敗した場合
 */
public static void appendText(final String filePath, final String content) throws IOException {
    final PublicStorage storage = new PublicStorage(filePath);
    storage.append(content);
}
```

### バイナリファイルの読み書き（ストリームを直接扱う場合）

```java
import java.io.OutputStream;

/**
 * バイナリファイルを書き込みます。
 * @param filePath ストレージルートからの相対パス
 * @param data バイナリデータ
 * @throws IOException 書き込みに失敗した場合
 */
public static void writeBinary(final String filePath, final byte[] data) throws IOException {
    final PublicStorage storage = new PublicStorage(filePath);

    // 少量データは save() の方が簡潔
    storage.save(data);
}

/**
 * 大容量バイナリファイルをストリームでコピーします。
 * @param srcPath コピー元の相対パス
 * @param destPath コピー先の相対パス
 * @throws IOException コピーに失敗した場合
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

`Storage#copy(T to, boolean overwrite)` を使えば上記と同等のコピーを 1 行で実装できる（`reference/storage-api-reference.md` の `copy()` 分岐仕様を参照）。

```java
public static void copyFile(final String srcPath, final String destPath) throws IOException {
    final PublicStorage src = new PublicStorage(srcPath);
    final PublicStorage dest = new PublicStorage(destPath);
    src.copy(dest, true); // true: 上書き許可
}
```

## ファイル操作

```java
/**
 * ファイルを移動します。
 */
public static void moveFile(final String srcPath, final String destPath) throws IOException {
    final PublicStorage storage = new PublicStorage(srcPath);
    storage.move(destPath);
}

/**
 * ファイルを削除します（存在する場合のみ）。
 */
public static void deleteFile(final String filePath) throws IOException {
    final PublicStorage storage = new PublicStorage(filePath);
    if (storage.exists()) {
        storage.remove();
    }
}

/**
 * ディレクトリを再帰削除します（存在する場合のみ）。
 */
public static void deleteDirectory(final String dirPath) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    if (storage.exists() && storage.isDirectory()) {
        storage.remove(true); // true: 再帰削除
    }
}
```

## ファイル情報取得

```java
/**
 * ファイル情報を取得します。
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

## 注意事項

- `read()` / `load()` はファイル全体をメモリに読み込む。大容量ファイルは `open()` によるストリーム処理（`BufferedReader#readLine()` 等）を使う
- パスは常にルートからの相対パスで指定する（絶対パス不可）
- ユーザ入力をファイル名・パスに使う場合はパストラバーサル対策（`..` や区切り文字の除去・拒否）を行う
