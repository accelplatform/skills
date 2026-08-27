# User Profile Image API Basic Usage Patterns (Java Version)

For the signatures and internal behavior of `UserProfileImageManager` / `UserImage` / `UserImageFileInfo`, see
`reference/profile-api-reference.md`. Here we show typical call patterns.

**Operating on basic user information (name, affiliation, etc.) and the IM-LogicDesigner logic flow elements are out of scope for this skill.** The only thing covered here is retrieving, registering, and deleting a "user's profile image."

## Pattern 1: Retrieving a Profile Image (Stream Form, Single)

Assumes use cases such as a screen download API where the image binary is written directly to the response.

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.user.UserProfileImageManager;
import jp.co.intra_mart.foundation.master.user.factory.UserProfileImageManagerFactory;
import jp.co.intra_mart.foundation.master.user.model.UserImageFileInfo;

import jp.co.example.foo.exception.ProfileImageAcquisitionException;

/**
 * Provides processing for retrieving a user's profile image.
 */
public class ProfileImageQueryService {

    /**
     * Retrieves the profile image in Stream form.<br>
     * NoImage is returned when the image is unregistered.
     *
     * @param userCd User code
     * @param imageSizeType The image type (a key name defined in im-master-config.xml; the original size when null)
     * @return The profile image information
     * @throws ProfileImageAcquisitionException If retrieving the profile image fails
     */
    public UserImageFileInfo getProfileImage(final String userCd, final String imageSizeType)
            throws ProfileImageAcquisitionException {
        final UserProfileImageManager userProfileImageManager = UserProfileImageManagerFactory.getFactory().getService();
        try {
            return userProfileImageManager.getUserProfileImageStream(userCd, imageSizeType);
        } catch (final BizApiException e) {
            throw new ProfileImageAcquisitionException("Failed to retrieve the profile image: userCd=" + userCd, e);
        }
    }
}
```

- Obtain the implementation from `UserProfileImageManagerFactory.getFactory().getService()`. Never instantiate `UserProfileImageManagerImpl` directly with `new`
- The caller is responsible for closing the `InputStream` returned by `UserImageFileInfo#getFile()` after reading it (use `try-with-resources`)

## Pattern 2: Retrieving Profile Images (Stream Form, Multiple)

Assumes use cases such as fetching multiple users' images together for a list screen. Note that unregistered users are not included in the result.

```java
package jp.co.example.foo.service;

import java.util.List;
import java.util.Map;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.user.UserProfileImageManager;
import jp.co.intra_mart.foundation.master.user.factory.UserProfileImageManagerFactory;
import jp.co.intra_mart.foundation.master.user.model.UserImageFileInfo;

import jp.co.example.foo.exception.ProfileImageAcquisitionException;

/**
 * Provides processing for bulk-retrieving users' profile images.
 */
public class ProfileImageBatchQueryService {

    /**
     * Retrieves multiple users' profile images in Stream form.<br>
     * Users whose image is unregistered are not included in the returned map (the caller must account for the omission).
     *
     * @param userCds The list of user codes
     * @param imageSizeType The image type
     * @return A map of profile image information keyed by user code (unregistered users are not included)
     * @throws ProfileImageAcquisitionException If retrieving the profile images fails
     */
    public Map<String, UserImageFileInfo> getProfileImages(final List<String> userCds, final String imageSizeType)
            throws ProfileImageAcquisitionException {
        final UserProfileImageManager userProfileImageManager = UserProfileImageManagerFactory.getFactory().getService();
        try {
            return userProfileImageManager.getUserProfileImagesStream(userCds, imageSizeType);
        } catch (final BizApiException e) {
            throw new ProfileImageAcquisitionException("Failed to bulk-retrieve the profile images: userCds=" + userCds, e);
        }
    }
}
```

- The single-retrieval method (`getUserProfileImageStream()`) returns NoImage when the image is unregistered, but the multiple-retrieval method (`getUserProfileImagesStream()`) excludes unregistered users from the result. **Be aware that the behavior differs**, and have the caller handle the case where the number of entries in the returned map does not match the number of `userCds` requested

## Pattern 3: Retrieving a Profile Image URL (Single)

Assumes use cases such as displaying the image via URL reference in an `<img>` tag on a list screen.

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.user.UserProfileImageManager;
import jp.co.intra_mart.foundation.master.user.factory.UserProfileImageManagerFactory;

import jp.co.example.foo.exception.ProfileImageAcquisitionException;

/**
 * Provides processing for retrieving a user's profile image URL.
 */
public class ProfileImageUrlQueryService {

    /**
     * Retrieves the profile image URL.<br>
     * The retrieved URL is cached, keyed by the user code and image type.
     *
     * @param userCd User code
     * @param imageSizeType The image type
     * @return The profile image URL
     * @throws ProfileImageAcquisitionException If retrieving the profile image URL fails
     */
    public String getProfileImageUrl(final String userCd, final String imageSizeType)
            throws ProfileImageAcquisitionException {
        final UserProfileImageManager userProfileImageManager = UserProfileImageManagerFactory.getFactory().getService();
        try {
            return userProfileImageManager.getUserProfileImageURL(userCd, imageSizeType);
        } catch (final BizApiException e) {
            throw new ProfileImageAcquisitionException("Failed to retrieve the profile image URL: userCd=" + userCd, e);
        }
    }
}
```

- The retrieval result is cached per user code and image type. Immediately after updating an image (`setUserProfileImage*`), the screen side may keep referencing the old URL, so pay attention to the timing of re-fetching after the update

## Pattern 4: Deleting a Profile Image

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.user.UserProfileImageManager;
import jp.co.intra_mart.foundation.master.user.factory.UserProfileImageManagerFactory;

import jp.co.example.foo.exception.ProfileImageDeletionException;

/**
 * Provides processing for deleting a user's profile image.
 */
public class ProfileImageDeletionService {

    /**
     * Deletes the profile image.
     *
     * @param userCd User code
     * @return The number of deletions
     * @throws ProfileImageDeletionException If deleting the profile image fails
     */
    public int deleteProfileImage(final String userCd) throws ProfileImageDeletionException {
        final UserProfileImageManager userProfileImageManager = UserProfileImageManagerFactory.getFactory().getService();
        try {
            return userProfileImageManager.deleteUserProfileImage(userCd);
        } catch (final BizApiException e) {
            throw new ProfileImageDeletionException("Failed to delete the profile image: userCd=" + userCd, e);
        }
    }
}
```

## Pattern 5: Registering a Profile Image (Data URL Form)

Assumes a case where a base64 data URL is received directly from an upload form.

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.user.UserProfileImageManager;
import jp.co.intra_mart.foundation.master.user.factory.UserProfileImageManagerFactory;

import jp.co.example.foo.exception.ProfileImageRegistrationException;

/**
 * Provides processing for registering a user's profile image (data URL form).
 */
public class ProfileImageUrlRegistrationService {

    /**
     * Registers the profile image.<br>
     * Supported extensions are jpg (jpeg) and png.
     *
     * @param userCd User code
     * @param filename The image file name
     * @param dataUrl The image file in data URL form (base64 form)
     * @return The number of registrations
     * @throws ProfileImageRegistrationException If registering the profile image fails
     */
    public int registerProfileImage(final String userCd, final String filename, final String dataUrl)
            throws ProfileImageRegistrationException {
        final UserProfileImageManager userProfileImageManager = UserProfileImageManagerFactory.getFactory().getService();
        try {
            return userProfileImageManager.setUserProfileImageURL(userCd, filename, dataUrl);
        } catch (final BizApiException e) {
            throw new ProfileImageRegistrationException("Failed to register the profile image: userCd=" + userCd, e);
        }
    }
}
```

## Pattern 6: Registering a Profile Image (via Storage)

An example of registering a temporary file already uploaded to `SessionScopeStorage` as-is, as the profile image. Follow the `java-im-storage-usage` conventions for obtaining and closing the `Storage<?>`.

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.user.UserProfileImageManager;
import jp.co.intra_mart.foundation.master.user.factory.UserProfileImageManagerFactory;
import jp.co.intra_mart.foundation.master.user.model.UserImage;
import jp.co.intra_mart.foundation.service.client.file.SessionScopeStorage;

import jp.co.example.foo.exception.ProfileImageRegistrationException;

/**
 * Provides processing for registering a user's profile image (via Storage).
 */
public class ProfileImageStorageRegistrationService {

    /**
     * Registers an image file already uploaded to the temporary area as the profile image.<br>
     * Supported extensions are jpg (jpeg) and png.
     *
     * @param userCd User code
     * @param tempFilePath The relative path of the uploaded temporary file (relative to SessionScopeStorage)
     * @return The number of registrations
     * @throws ProfileImageRegistrationException If registering the profile image fails
     */
    public int registerProfileImage(final String userCd, final String tempFilePath) throws ProfileImageRegistrationException {
        final UserImage userImage = new UserImage();
        userImage.setUserCd(userCd);
        userImage.setStorage(new SessionScopeStorage(tempFilePath));

        final UserProfileImageManager userProfileImageManager = UserProfileImageManagerFactory.getFactory().getService();
        try {
            return userProfileImageManager.setUserProfileImage(userImage);
        } catch (final BizApiException e) {
            throw new ProfileImageRegistrationException("Failed to register the profile image: userCd=" + userCd, e);
        }
    }
}
```

- `SessionScopeStorage` is a temporary area and requires explicit deletion after use (see the "Post-Generation Checks" section of `java-im-storage-usage`). Whether to delete the temporary file after the registration succeeds should be decided based on business requirements
- `UserImage` has no constructor argument; set its fields via `setUserCd()` / `setStorage()` (`userCd` is required because `@NotNullValidation` is attached to `IUserBizKey#getUserCd()`)

## Anti-Patterns (Avoid These)

```java
// NG: Instantiating UserProfileImageManagerImpl directly with new
final UserProfileImageManager userProfileImageManager = new UserProfileImageManagerImpl();
// Always route it through UserProfileImageManagerFactory.getFactory().getService()

// NG: Accessing the returned map of the multiple-retrieval method assuming every user is present
final Map<String, UserImageFileInfo> images = userProfileImageManager.getUserProfileImagesStream(userCds, null);
for (final String userCd : userCds) {
    final UserImageFileInfo info = images.get(userCd);
    info.getFile(); // Unregistered users are not included in images, so this can throw a NullPointerException
}

// NG: Swallowing BizApiException
try {
    userProfileImageManager.deleteUserProfileImage(userCd);
} catch (final BizApiException e) {
    // Do nothing (processing continues with the cause unknown)
}

// NG: Not closing the InputStream from UserImageFileInfo#getFile()
final UserImageFileInfo info = userProfileImageManager.getUserProfileImageStream(userCd, null);
final InputStream in = info.getFile();
// in.close() is not called after reading (resource leak). Use try-with-resources

// NG: Attempting to register a file with an extension other than jpg/png
userProfileImageManager.setUserProfileImageURL(userCd, "avatar.gif", dataUrl);
// Only jpg (jpeg)/png are supported
```
