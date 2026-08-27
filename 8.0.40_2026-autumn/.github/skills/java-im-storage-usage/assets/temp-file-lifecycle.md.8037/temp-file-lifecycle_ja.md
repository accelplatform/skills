# 一時ファイル運用パターン（SessionScopeStorage）

`SessionScopeStorage` は実行中のセッションに紐づく一時領域を扱う。**永続化されないが、自動削除タイミングを保証する記述はプラットフォームコード側になく、利用側で確実に削除する運用が前提**（`im_workflow_core` の `WorkflowAttachFileUtil` にも同様の運用注意がコメントとして明記されている）。

## 基本パターン: 一時ファイルの保存・読み込み・削除

```java
package jp.co.intra_mart.sample.storage;

import java.io.IOException;

import jp.co.intra_mart.foundation.service.client.file.SessionScopeStorage;

/**
 * 一時ファイル操作ユーティリティ。
 */
public final class TempFileUtil {

    private TempFileUtil() {
    }

    /**
     * 一時ファイルを保存します。
     * @param tempPath セッションスコープストレージルートからの相対パス
     * @param content 保存する内容
     * @throws IOException 保存に失敗した場合
     */
    public static void saveTempFile(final String tempPath, final String content) throws IOException {
        final SessionScopeStorage storage = new SessionScopeStorage(tempPath);
        storage.write(content);
    }

    /**
     * 一時ファイルを読み込みます。
     * @param tempPath セッションスコープストレージルートからの相対パス
     * @return ファイルが存在しない場合は null
     * @throws IOException 読み込みに失敗した場合
     */
    public static String readTempFile(final String tempPath) throws IOException {
        final SessionScopeStorage storage = new SessionScopeStorage(tempPath);
        if (!storage.exists()) {
            return null;
        }
        return storage.read();
    }

    /**
     * 一時ファイルを削除します。
     * @param tempPath セッションスコープストレージルートからの相対パス
     * @throws IOException 削除に失敗した場合
     */
    public static void removeTempFile(final String tempPath) throws IOException {
        final SessionScopeStorage storage = new SessionScopeStorage(tempPath);
        if (storage.exists()) {
            storage.remove(storage.isDirectory());
        }
    }
}
```

## 推奨パターン: 処理完了後・例外時ともに確実に削除する

一時ファイルを使う処理は、正常終了・異常終了どちらでも `finally` で削除する。

```java
import jp.co.intra_mart.foundation.service.client.file.SessionScopeStorage;

/**
 * アップロードされたバイナリを一時領域に保存し、加工処理を行った後、
 * 成否によらず一時ファイルを削除します。
 * @param uploadData アップロードされたバイナリデータ
 * @throws IOException 入出力エラーが発生した場合
 * @throws SomeBusinessException 加工処理に失敗した場合
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

## 一時領域から永続領域への確定保存

アップロード直後は `SessionScopeStorage` に一時保存し、業務的に確定したタイミングで `PublicStorage` へコピーしてから一時ファイルを削除する、という 2 段階の運用が一般的（`WorkflowAttachFileUtil` の `getTempDirPathOnSessionScopeStorage` / `getTempDirPathOnPublicStorage` の使い分けと同じ考え方）。

```java
import jp.co.intra_mart.foundation.service.client.file.PublicStorage;
import jp.co.intra_mart.foundation.service.client.file.SessionScopeStorage;

/**
 * 一時領域のファイルを永続領域へ確定保存します。
 * @param tempPath セッションスコープストレージ上の一時ファイルパス
 * @param publicPath パブリックストレージ上の保存先パス
 * @throws IOException 入出力エラーが発生した場合
 */
public static void commitToPublicStorage(final String tempPath, final String publicPath) throws IOException {
    final SessionScopeStorage tempStorage = new SessionScopeStorage(tempPath);
    final PublicStorage publicStorage = new PublicStorage(publicPath);

    try {
        tempStorage.copy(publicStorage, true); // true: 上書き許可
    } finally {
        if (tempStorage.exists()) {
            tempStorage.remove();
        }
    }
}
```

## 注意事項

- 一時ファイル名にタイムスタンプやユニークIDを含め、同一セッション内での衝突を避ける（例: `System.currentTimeMillis()` やアップロード元のファイル名をそのまま使わない）
- ユーザ入力（アップロード元のファイル名等）をそのまま一時ファイルパスに使う場合は、パストラバーサル対策（`..` や区切り文字の除去）を必ず行う
- 一時ファイルはディスクを消費し続けるため、**業務処理が完了したら速やかに削除する**。長時間ジョブや異常終了時にも削除されるよう `try-finally` を徹底する
