# ディレクトリ操作パターン（Java 版）

## ディレクトリ作成

```java
package jp.co.intra_mart.sample.storage;

import java.io.IOException;

import jp.co.intra_mart.foundation.service.client.file.PublicStorage;

/**
 * ディレクトリ作成ユーティリティ。
 */
public final class DirectoryUtil {

    private DirectoryUtil() {
    }

    /**
     * ディレクトリを作成します（親ディレクトリも含めて作成）。
     * @param dirPath ストレージルートからの相対パス
     * @return 作成に成功した場合は true
     * @throws IOException 作成に失敗した場合
     */
    public static boolean createDirectory(final String dirPath) throws IOException {
        final PublicStorage storage = new PublicStorage(dirPath);
        return storage.makeDirectories();
    }
}
```

## ファイル・ディレクトリ一覧取得

```java
import java.util.Collection;

/**
 * ファイル一覧を取得します（非再帰）。
 */
public static Collection<String> listFiles(final String dirPath) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    return storage.files();
}

/**
 * ファイル一覧を取得します（再帰）。
 */
public static Collection<String> listFilesRecursive(final String dirPath) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    return storage.files(true);
}

/**
 * ディレクトリ一覧を取得します。
 */
public static Collection<String> listDirectories(final String dirPath) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    return storage.directories();
}

/**
 * ファイル・ディレクトリ両方の一覧を取得します。
 */
public static Collection<String> listAll(final String dirPath) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    return storage.list();
}
```

## `Storage` オブジェクトとして一覧取得（後続処理でそのまま個々のファイルを操作したい場合）

```java
import java.util.Collection;

/**
 * ディレクトリ配下のファイルを Storage オブジェクトとして取得し、
 * それぞれのサイズを取得します。
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

## フィルタを使った一覧取得

```java
import jp.co.intra_mart.foundation.service.client.file.StoragenameFilter;

/**
 * 拡張子で絞り込んだファイル一覧を取得します。
 * @param dirPath ストレージルートからの相対パス
 * @param extension 拡張子（例: ".csv"）
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

`StoragenameFilter<T>#accept(T dir, String name)` のシグネチャは `reference/storage-api-reference.md` を確認せずに推測で書かないこと（バージョンにより微妙にシグネチャが異なる場合があるため、実装時は必ず `find_symbol` 等で最新定義を確認する）。

## 存在チェック

```java
/**
 * ファイルの存在チェック。
 */
public static boolean fileExists(final String filePath) throws IOException {
    final PublicStorage storage = new PublicStorage(filePath);
    return storage.exists() && storage.isFile();
}

/**
 * ディレクトリの存在チェック。
 */
public static boolean directoryExists(final String dirPath) throws IOException {
    final PublicStorage storage = new PublicStorage(dirPath);
    return storage.exists() && storage.isDirectory();
}
```
