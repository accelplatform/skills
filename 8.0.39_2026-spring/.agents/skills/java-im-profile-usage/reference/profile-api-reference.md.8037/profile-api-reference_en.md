# User Profile Image API Reference (Java Version)

Based on the actual class definitions in the intra-mart Accel Platform core source (`im_master-main` module). Do not supplement methods from memory or guesswork.

## Package Structure

```
jp.co.intra_mart.foundation.master.user
└── UserProfileImageManager             … Public API. interface (@since 8.0.26)

jp.co.intra_mart.foundation.master.user.factory
└── UserProfileImageManagerFactory      … Factory that creates the implementation of UserProfileImageManager

jp.co.intra_mart.foundation.master.user.model
├── UserImage                           … Model used to register a profile image (implements IUserBizKey)
├── UserImageFileInfo                   … Model for profile image retrieval results (Stream form)
└── IUserBizKey                         … Common interface for business keys holding a user code (@since 7.2)

jp.co.intra_mart.foundation.exception
└── BizApiException                     … Checked exception thrown by every method of UserProfileImageManager
```

## `UserProfileImageManager` Interface

```java
package jp.co.intra_mart.foundation.master.user;

/**
 * An interface for operating on a user's profile image.
 * @since 8.0.26
 */
public interface UserProfileImageManager {

    /**
     * Retrieves the profile image in Stream form.<br>
     * Retrieves NoImage when the image does not exist.<br>
     * For the image type, specify the key name representing an image file size defined in im-master-config.xml.
     * If not specified, the original size is retrieved.
     */
    UserImageFileInfo getUserProfileImageStream(String userCd, String imageSizeType) throws BizApiException;

    /**
     * Retrieves multiple profile images in Stream form.<br>
     * Images that do not exist are not included in the result.
     */
    Map<String, UserImageFileInfo> getUserProfileImagesStream(List<String> userCds, String imageSizeType) throws BizApiException;

    /**
     * Retrieves the profile image in URL form.<br>
     * Retrieves NoImage when the image does not exist.<br>
     * The retrieved image URL is cached, keyed by the user code and image type.
     */
    String getUserProfileImageURL(String userCd, String imageSizeType) throws BizApiException;

    /**
     * Retrieves multiple profile images in data URL form.<br>
     * Not included in the map when the image is unregistered, or when no cache of the image URL exists.
     */
    Map<String, String> getUserProfileImagesURL(List<String> userCds, String imageSizeType) throws BizApiException;

    /** Deletes the profile image. The return value is the number of deletions. */
    int deleteUserProfileImage(String userCd) throws BizApiException;

    /**
     * Registers the profile image.<br>
     * Supported extensions are jpg (jpeg) and png.
     * @param file The image file in data URL form (base64 form)
     * @return The number of registrations
     */
    int setUserProfileImageURL(String userCd, String filename, String file) throws BizApiException;

    /**
     * Registers the profile image.<br>
     * Supported extensions are jpg (jpeg) and png.
     * @param userImage The user profile image information
     * @return The number of registrations
     */
    int setUserProfileImage(UserImage userImage) throws BizApiException;
}
```

- The detailed null-acceptance/exception conditions for the arguments and return values include parts that depend on the implementation (`UserProfileImageManagerImpl`) and cannot be determined from the interface's JavaDoc alone. For boundary-value behavior (e.g., specifying an `imageSizeType` that does not exist), checking the implementation or verifying on an actual environment is recommended

## `UserProfileImageManagerFactory` Class

```java
package jp.co.intra_mart.foundation.master.user.factory;

/**
 * Creates an implementation of {@link UserProfileImageManager}.
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

- The implementation returned by `getService()` is `jp.co.intra_mart.system.master.user.impl.UserProfileImageManagerImpl`. Callers should receive it as the `UserProfileImageManager` interface type and must not depend directly on the implementation class
- `@ProvideFactory` / `@ProvideService` (`jp.co.intra_mart.foundation.web_api_maker.annotation`) are annotations used by the platform's factory resolution mechanism, and callers do not need to be aware of them

## `UserImage` Model (for Registration)

```java
package jp.co.intra_mart.foundation.master.user.model;

/**
 * Holds user profile image information.
 * @since 8.0.20
 */
public class UserImage implements IUserBizKey {

    private String userCd;
    private Storage<?> storage; // jp.co.intra_mart.foundation.service.client.file.Storage

    public Storage<?> getStorage();
    /** Sets the storage where the profile image is located. */
    public void setStorage(final Storage<?> storage);

    @Override
    public String getUserCd();
    @Override
    public void setUserCd(final String userCd);
}
```

- Obtaining and closing the `Storage<?>` set on `storage` falls under the jurisdiction of the `java-im-storage-usage` skill (`PublicStorage`/`SessionScopeStorage`/`SystemStorage`)

## `UserImageFileInfo` Model (for Retrieval Results)

```java
package jp.co.intra_mart.foundation.master.user.model;

/**
 * Holds image information for a user's profile image.
 * @since 8.0.20
 */
public class UserImageFileInfo {

    private String mimeType;
    private InputStream file;

    /** Retrieves the profile image file. */
    public InputStream getFile();
    public void setFile(final InputStream file);

    /** Retrieves the MIME type. */
    public String getMimeType();
    public void setMimeType(final String mimeType);
}
```

- The caller is responsible for closing the `InputStream` returned by `getFile()` after reading it (use `try-with-resources`)

## `IUserBizKey` Interface

```java
package jp.co.intra_mart.foundation.master.user.model;

/**
 * An interface for handling user business key information.
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

- `@NotNullValidation` / `@LengthValidation(min = 1)` are attached, so `userCd` is expected to be required and at least one character long (validation annotations from the `jp.co.intra_mart.foundation.validation.annotation` package)

## Exception Handling

```java
package jp.co.intra_mart.foundation.exception;

/**
 * The im-BizAPI exception class.
 * Thrown when an exception occurs in im-BizAPI.
 * @since 7.2
 */
public class BizApiException extends FoundationException {
    public BizApiException();
    public BizApiException(String message);
    public BizApiException(Throwable cause);
    public BizApiException(String message, Throwable cause);
    public BizApiException(String errorCode, String message, Throwable cause);
    public BizApiException(String errorCode, String message, Collection<String> subMessage, Throwable cause);

    /** Retrieves the exception code. */
    public String getErrorCode();
    /** Retrieves the list of messages. */
    public Collection<String> getSubMessage();
}
```

- Every method of `UserProfileImageManager` throws `BizApiException` (a checked exception). Callers must either `try`/`catch` it or declare `throws` to propagate it to the caller
- `errorCode` / `subMessage` can be used to attach detailed information during error handling (when not specified in the constructor, `errorCode` is `null` and `subMessage` is an empty `ArrayList`)
