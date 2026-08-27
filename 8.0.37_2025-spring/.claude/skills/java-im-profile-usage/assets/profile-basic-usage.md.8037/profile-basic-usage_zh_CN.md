# User Profile Image API 基本使用模式（Java 版）

关于 `UserProfileImageManager` / `UserImage` / `UserImageFileInfo` 的签名与内部行为，请参考
`reference/profile-api-reference.md`。这里展示典型的调用模式。

**用户基本信息（姓名・所属等）的操作，以及 IM-LogicDesigner 的逻辑流程要素不在本技能范围内。** 这里仅涉及"用户头像图片"的获取・注册・删除。

## 模式1: 头像图片的获取（Stream 形式・单个）

用于画面的下载 API 等，将图片二进制数据原样输出到响应的场景。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.user.UserProfileImageManager;
import jp.co.intra_mart.foundation.master.user.factory.UserProfileImageManagerFactory;
import jp.co.intra_mart.foundation.master.user.model.UserImageFileInfo;

import jp.co.example.foo.exception.ProfileImageAcquisitionException;

/**
 * 提供用户头像图片的获取处理。
 */
public class ProfileImageQueryService {

    /**
     * 以 Stream 形式获取头像图片。<br>
     * 图片未注册时返回 NoImage。
     *
     * @param userCd 用户代码
     * @param imageSizeType 图片种类（im-master-config.xml 中定义的键名。为 null 时为 original 尺寸）
     * @return 头像图片信息
     * @throws ProfileImageAcquisitionException 头像图片获取失败时抛出
     */
    public UserImageFileInfo getProfileImage(final String userCd, final String imageSizeType)
            throws ProfileImageAcquisitionException {
        final UserProfileImageManager userProfileImageManager = UserProfileImageManagerFactory.getFactory().getService();
        try {
            return userProfileImageManager.getUserProfileImageStream(userCd, imageSizeType);
        } catch (final BizApiException e) {
            throw new ProfileImageAcquisitionException("头像图片获取失败: userCd=" + userCd, e);
        }
    }
}
```

- 实现应通过 `UserProfileImageManagerFactory.getFactory().getService()` 获取。不要直接 `new` `UserProfileImageManagerImpl`
- `UserImageFileInfo#getFile()` 返回的 `InputStream` 由调用方负责在读取完毕后关闭（应使用 `try-with-resources`）

## 模式2: 头像图片的获取（Stream 形式・多个）

用于在列表画面等场景中批量获取多个用户的图片。请注意未注册的用户不会包含在结果中。

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
 * 提供用户头像图片的批量获取处理。
 */
public class ProfileImageBatchQueryService {

    /**
     * 以 Stream 形式获取多个用户的头像图片。<br>
     * 图片未注册的用户不会包含在返回的 Map 中（调用方须考虑该缺失情况）。
     *
     * @param userCds 用户代码列表
     * @param imageSizeType 图片种类
     * @return 以用户代码为键的头像图片信息 Map（不含未注册的用户）
     * @throws ProfileImageAcquisitionException 头像图片获取失败时抛出
     */
    public Map<String, UserImageFileInfo> getProfileImages(final List<String> userCds, final String imageSizeType)
            throws ProfileImageAcquisitionException {
        final UserProfileImageManager userProfileImageManager = UserProfileImageManagerFactory.getFactory().getService();
        try {
            return userProfileImageManager.getUserProfileImagesStream(userCds, imageSizeType);
        } catch (final BizApiException e) {
            throw new ProfileImageAcquisitionException("头像图片批量获取失败: userCds=" + userCds, e);
        }
    }
}
```

- 单个获取系方法（`getUserProfileImageStream()`）在未注册时返回 NoImage，而多个获取系方法（`getUserProfileImagesStream()`）会将未注册的用户从结果中排除。**两者行为不同，须注意**，调用方应在"`userCds` 的件数与返回 Map 的件数可能不一致"这一前提下进行处理

## 模式3: 头像图片 URL 的获取（单个）

用于列表画面的 `<img>` 标签等，以 URL 引用方式显示图片的场景。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.user.UserProfileImageManager;
import jp.co.intra_mart.foundation.master.user.factory.UserProfileImageManagerFactory;

import jp.co.example.foo.exception.ProfileImageAcquisitionException;

/**
 * 提供用户头像图片 URL 的获取处理。
 */
public class ProfileImageUrlQueryService {

    /**
     * 获取头像图片 URL。<br>
     * 获取到的 URL 会以用户代码与图片种类为键进行缓存。
     *
     * @param userCd 用户代码
     * @param imageSizeType 图片种类
     * @return 头像图片 URL
     * @throws ProfileImageAcquisitionException 头像图片 URL 获取失败时抛出
     */
    public String getProfileImageUrl(final String userCd, final String imageSizeType)
            throws ProfileImageAcquisitionException {
        final UserProfileImageManager userProfileImageManager = UserProfileImageManagerFactory.getFactory().getService();
        try {
            return userProfileImageManager.getUserProfileImageURL(userCd, imageSizeType);
        } catch (final BizApiException e) {
            throw new ProfileImageAcquisitionException("头像图片 URL 获取失败: userCd=" + userCd, e);
        }
    }
}
```

- 获取结果会以用户代码・图片种类为单位进行缓存。若在更新图片（`setUserProfileImage*`）后画面侧仍继续引用旧 URL，可能会显示旧图片，因此应注意更新后重新获取的时机

## 模式4: 头像图片的删除

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.user.UserProfileImageManager;
import jp.co.intra_mart.foundation.master.user.factory.UserProfileImageManagerFactory;

import jp.co.example.foo.exception.ProfileImageDeletionException;

/**
 * 提供用户头像图片的删除处理。
 */
public class ProfileImageDeletionService {

    /**
     * 删除头像图片。
     *
     * @param userCd 用户代码
     * @return 删除件数
     * @throws ProfileImageDeletionException 头像图片删除失败时抛出
     */
    public int deleteProfileImage(final String userCd) throws ProfileImageDeletionException {
        final UserProfileImageManager userProfileImageManager = UserProfileImageManagerFactory.getFactory().getService();
        try {
            return userProfileImageManager.deleteUserProfileImage(userCd);
        } catch (final BizApiException e) {
            throw new ProfileImageDeletionException("头像图片删除失败: userCd=" + userCd, e);
        }
    }
}
```

## 模式5: 头像图片的注册（数据 URL 形式）

假设从上传表单直接接收 base64 数据 URL 的场景。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.user.UserProfileImageManager;
import jp.co.intra_mart.foundation.master.user.factory.UserProfileImageManagerFactory;

import jp.co.example.foo.exception.ProfileImageRegistrationException;

/**
 * 提供用户头像图片的注册处理（数据 URL 形式）。
 */
public class ProfileImageUrlRegistrationService {

    /**
     * 注册头像图片。<br>
     * 对应的扩展名为 jpg(jpeg)、png。
     *
     * @param userCd 用户代码
     * @param filename 图片文件名
     * @param dataUrl 数据 URL 形式的图片文件（base64 形式）
     * @return 注册件数
     * @throws ProfileImageRegistrationException 头像图片注册失败时抛出
     */
    public int registerProfileImage(final String userCd, final String filename, final String dataUrl)
            throws ProfileImageRegistrationException {
        final UserProfileImageManager userProfileImageManager = UserProfileImageManagerFactory.getFactory().getService();
        try {
            return userProfileImageManager.setUserProfileImageURL(userCd, filename, dataUrl);
        } catch (final BizApiException e) {
            throw new ProfileImageRegistrationException("头像图片注册失败: userCd=" + userCd, e);
        }
    }
}
```

## 模式6: 头像图片的注册（通过 Storage）

将已上传至 `SessionScopeStorage` 的临时文件直接注册为头像图片的示例。`Storage<?>` 的获取・关闭应遵循 `java-im-storage-usage` 的规约。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.user.UserProfileImageManager;
import jp.co.intra_mart.foundation.master.user.factory.UserProfileImageManagerFactory;
import jp.co.intra_mart.foundation.master.user.model.UserImage;
import jp.co.intra_mart.foundation.service.client.file.SessionScopeStorage;

import jp.co.example.foo.exception.ProfileImageRegistrationException;

/**
 * 提供用户头像图片的注册处理（通过 Storage）。
 */
public class ProfileImageStorageRegistrationService {

    /**
     * 将已上传至临时区域的图片文件注册为头像图片。<br>
     * 对应的扩展名为 jpg(jpeg)、png。
     *
     * @param userCd 用户代码
     * @param tempFilePath 已上传临时文件的相对路径（以 SessionScopeStorage 为基准）
     * @return 注册件数
     * @throws ProfileImageRegistrationException 头像图片注册失败时抛出
     */
    public int registerProfileImage(final String userCd, final String tempFilePath) throws ProfileImageRegistrationException {
        final UserImage userImage = new UserImage();
        userImage.setUserCd(userCd);
        userImage.setStorage(new SessionScopeStorage(tempFilePath));

        final UserProfileImageManager userProfileImageManager = UserProfileImageManagerFactory.getFactory().getService();
        try {
            return userProfileImageManager.setUserProfileImage(userImage);
        } catch (final BizApiException e) {
            throw new ProfileImageRegistrationException("头像图片注册失败: userCd=" + userCd, e);
        }
    }
}
```

- `SessionScopeStorage` 属于临时区域，使用后须显式删除（参见 `java-im-storage-usage` 的"生成后的确认"）。是否在注册处理成功后删除临时文件，应根据业务需求判断
- `UserImage` 没有带参数的构造函数，须通过 `setUserCd()` / `setStorage()` 进行设置（由于 `IUserBizKey#getUserCd()` 附加了 `@NotNullValidation`，`userCd` 为必填项）

## 反模式（应避免）

```java
// NG: 直接 new UserProfileImageManagerImpl
final UserProfileImageManager userProfileImageManager = new UserProfileImageManagerImpl();
// 必须经由 UserProfileImageManagerFactory.getFactory().getService() 获取

// NG: 假设多个获取系方法的返回 Map 中已齐备全部用户数据后进行访问
final Map<String, UserImageFileInfo> images = userProfileImageManager.getUserProfileImagesStream(userCds, null);
for (final String userCd : userCds) {
    final UserImageFileInfo info = images.get(userCd);
    info.getFile(); // 未注册的用户不会包含在 images 中，可能导致 NullPointerException
}

// NG: 吞没 BizApiException
try {
    userProfileImageManager.deleteUserProfileImage(userCd);
} catch (final BizApiException e) {
    // 什么都不做（在原因不明的情况下继续处理）
}

// NG: 不关闭 UserImageFileInfo#getFile() 返回的 InputStream
final UserImageFileInfo info = userProfileImageManager.getUserProfileImageStream(userCd, null);
final InputStream in = info.getFile();
// 读取完毕后未调用 in.close()（资源泄漏）。应使用 try-with-resources

// NG: 尝试以 jpg/png 以外的扩展名注册文件
userProfileImageManager.setUserProfileImageURL(userCd, "avatar.gif", dataUrl);
// 对应的扩展名仅限 jpg(jpeg)/png
```
