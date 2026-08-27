# User Profile Image API リファレンス（Java 版）

intra-mart Accel Platform コアソース（`im_master-main` モジュール）の実クラス定義に基づく。記憶や推測でメソッドを補わないこと。

## パッケージ構成

```
jp.co.intra_mart.foundation.master.user
└── UserProfileImageManager             … 公開 API。interface（@since 8.0.26）

jp.co.intra_mart.foundation.master.user.factory
└── UserProfileImageManagerFactory      … UserProfileImageManager の実装を生成するファクトリ

jp.co.intra_mart.foundation.master.user.model
├── UserImage                           … プロファイル画像の登録用モデル（IUserBizKey 実装）
├── UserImageFileInfo                   … プロファイル画像の取得結果モデル（Stream 形式）
└── IUserBizKey                         … ユーザコードを持つビジネスキー共通インタフェース（@since 7.2）

jp.co.intra_mart.foundation.exception
└── BizApiException                     … チェック例外。UserProfileImageManager の全メソッドがスロー
```

## `UserProfileImageManager` インタフェース

```java
package jp.co.intra_mart.foundation.master.user;

/**
 * ユーザのプロファイル画像を操作するインタフェースです。
 * @since 8.0.26
 */
public interface UserProfileImageManager {

    /**
     * プロファイル画像をStream形式で取得します。<br>
     * 画像が存在しない場合はNoImageを取得します。<br>
     * 画像種別には、im-master-config.xmlで定義された画像ファイルのサイズを表すキー名を指定します。指定しない場合はoriginalサイズで取得します。
     */
    UserImageFileInfo getUserProfileImageStream(String userCd, String imageSizeType) throws BizApiException;

    /**
     * 複数のプロファイル画像をStream形式で取得します。<br>
     * 画像が存在しない場合は結果に含めません。
     */
    Map<String, UserImageFileInfo> getUserProfileImagesStream(List<String> userCds, String imageSizeType) throws BizApiException;

    /**
     * プロファイル画像をURL形式で取得します。<br>
     * 画像が存在しない場合はNoImageを取得します。<br>
     * 取得した画像URLはユーザコードと画像種別をキーにキャッシュされます。
     */
    String getUserProfileImageURL(String userCd, String imageSizeType) throws BizApiException;

    /**
     * 複数のプロファイル画像をデータURL形式で取得します。<br>
     * 画像が未登録、もしくは画像URLのキャッシュが存在しない場合はマップに含まれません。
     */
    Map<String, String> getUserProfileImagesURL(List<String> userCds, String imageSizeType) throws BizApiException;

    /** プロファイル画像を削除します。戻り値は削除件数。 */
    int deleteUserProfileImage(String userCd) throws BizApiException;

    /**
     * プロファイル画像を登録します。<br>
     * 対応する拡張子はjpg(jpeg)、pngです。
     * @param file データURL形式の画像ファイル（base64形式）
     * @return 登録件数
     */
    int setUserProfileImageURL(String userCd, String filename, String file) throws BizApiException;

    /**
     * プロファイル画像を登録します。<br>
     * 対応する拡張子はjpg(jpeg)、pngです。
     * @param userImage ユーザプロファイル画像情報
     * @return 登録件数
     */
    int setUserProfileImage(UserImage userImage) throws BizApiException;
}
```

- 引数・戻り値の詳細な null 許容/例外条件は、実装（`UserProfileImageManagerImpl`）依存の部分がありインタフェースの JavaDoc からは判別できない箇所がある。境界値の挙動（存在しない `imageSizeType` を指定した場合等）は実装確認または実機検証を推奨する

## `UserProfileImageManagerFactory` クラス

```java
package jp.co.intra_mart.foundation.master.user.factory;

/**
 * {@link UserProfileImageManager} の実装を生成します。
 * @since 8.0.26
 */
public class UserProfileImageManagerFactory {

    @ProvideFactory
    public static UserProfileImageManagerFactory getFactory() {
        return new UserProfileImageManagerFactory();
    }

    @ProvideService
    public UserProfileImageManager getService() {
        return new UserProfileImageManagerImpl();
    }
}
```

- `getService()` が返す実装は `jp.co.intra_mart.system.master.user.impl.UserProfileImageManagerImpl`。呼び出し側は `UserProfileImageManager`（インタフェース型）で受け取り、実装クラスに直接依存しないこと
- `@ProvideFactory` / `@ProvideService`（`jp.co.intra_mart.foundation.web_api_maker.annotation`）はプラットフォーム側のファクトリ解決機構に用いられるアノテーションであり、呼び出し側で意識する必要はない

## `UserImage` モデル（登録用）

```java
package jp.co.intra_mart.foundation.master.user.model;

/**
 * ユーザプロファイル画像情報を保持します。
 * @since 8.0.20
 */
public class UserImage implements IUserBizKey {

    private String userCd;
    private Storage<?> storage; // jp.co.intra_mart.foundation.service.client.file.Storage

    public Storage<?> getStorage();
    /** プロファイル画像を配置したストレージをセットします。 */
    public void setStorage(final Storage<?> storage);

    @Override
    public String getUserCd();
    @Override
    public void setUserCd(final String userCd);
}
```

- `storage` に設定する `Storage<?>` の取得・クローズは `java-im-storage-usage` スキルの管轄（`PublicStorage`/`SessionScopeStorage`/`SystemStorage`）

## `UserImageFileInfo` モデル（取得結果用）

```java
package jp.co.intra_mart.foundation.master.user.model;

/**
 * ユーザプロファイル画像の画像情報を保持します。
 * @since 8.0.20
 */
public class UserImageFileInfo {

    private String mimeType;
    private InputStream file;

    /** プロファイル画像ファイルを取得します。 */
    public InputStream getFile();
    public void setFile(final InputStream file);

    /** MIMEタイプを取得します。 */
    public String getMimeType();
    public void setMimeType(final String mimeType);
}
```

- `getFile()` が返す `InputStream` は呼び出し側で読了後にクローズする責務がある（`try-with-resources` を使う）

## `IUserBizKey` インタフェース

```java
package jp.co.intra_mart.foundation.master.user.model;

/**
 * ユーザビジネスキー情報を扱うインターフェース
 * @since 7.2
 */
public interface IUserBizKey {

    @NotNullValidation
    @LengthValidation(min = 1)
    @ValidationName("%im-master.api.user.caption.user-cd")
    public String getUserCd();

    public void setUserCd(String userCd);
}
```

- `@NotNullValidation` / `@LengthValidation(min = 1)` が付与されており、`userCd` は必須・1文字以上であることが期待されている（`jp.co.intra_mart.foundation.validation.annotation` パッケージのバリデーションアノテーション）

## 例外の扱い

```java
package jp.co.intra_mart.foundation.exception;

/**
 * im-BizAPI例外クラス。
 * im-BizAPIで例外が発生した場合にスローされます。
 * @since 7.2
 */
public class BizApiException extends FoundationException {
    public BizApiException();
    public BizApiException(String message);
    public BizApiException(Throwable cause);
    public BizApiException(String message, Throwable cause);
    public BizApiException(String errorCode, String message, Throwable cause);
    public BizApiException(String errorCode, String message, Collection<String> subMessage, Throwable cause);

    /** 例外コードを取得します。 */
    public String getErrorCode();
    /** メッセージのリストを取得します。 */
    public Collection<String> getSubMessage();
}
```

- `UserProfileImageManager` の全メソッドは `BizApiException`（チェック例外）をスローする。呼び出し側は必ず `try`/`catch` するか、`throws` 宣言で呼び出し元に伝播させること
- `errorCode` / `subMessage` はエラーハンドリングでの詳細情報付加に使える（コンストラクタで未指定の場合、`errorCode` は `null`、`subMessage` は空の `ArrayList`）
