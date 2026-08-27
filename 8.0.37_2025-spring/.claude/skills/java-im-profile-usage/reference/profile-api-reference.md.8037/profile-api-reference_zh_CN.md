# User Profile Image API 参考手册（Java 版）

基于 intra-mart Accel Platform 核心源码（`im_master-main` 模块）的实际类定义。请勿凭记忆或推测补充方法。

## 包结构

```
jp.co.intra_mart.foundation.master.user
└── UserProfileImageManager             … 公开 API。interface（@since 8.0.26）

jp.co.intra_mart.foundation.master.user.factory
└── UserProfileImageManagerFactory      … 生成 UserProfileImageManager 实现的工厂

jp.co.intra_mart.foundation.master.user.model
├── UserImage                           … 头像图片的注册用模型（实现 IUserBizKey）
├── UserImageFileInfo                   … 头像图片的获取结果模型（Stream 形式）
└── IUserBizKey                         … 持有用户代码的业务键通用接口（@since 7.2）

jp.co.intra_mart.foundation.exception
└── BizApiException                     … 受检异常。UserProfileImageManager 的全部方法均会抛出
```

## `UserProfileImageManager` 接口

```java
package jp.co.intra_mart.foundation.master.user;

/**
 * 操作用户头像图片的接口。
 * @since 8.0.26
 */
public interface UserProfileImageManager {

    /**
     * 以 Stream 形式获取头像图片。<br>
     * 图片不存在时获取 NoImage。<br>
     * 图片种类应指定 im-master-config.xml 中定义的、表示图片文件尺寸的键名。未指定时以 original 尺寸获取。
     */
    UserImageFileInfo getUserProfileImageStream(String userCd, String imageSizeType) throws BizApiException;

    /**
     * 以 Stream 形式获取多个头像图片。<br>
     * 图片不存在时不会包含在结果中。
     */
    Map<String, UserImageFileInfo> getUserProfileImagesStream(List<String> userCds, String imageSizeType) throws BizApiException;

    /**
     * 以 URL 形式获取头像图片。<br>
     * 图片不存在时获取 NoImage。<br>
     * 获取到的图片 URL 会以用户代码与图片种类为键进行缓存。
     */
    String getUserProfileImageURL(String userCd, String imageSizeType) throws BizApiException;

    /**
     * 以数据 URL 形式获取多个头像图片。<br>
     * 图片未注册，或图片 URL 的缓存不存在时，不会包含在 Map 中。
     */
    Map<String, String> getUserProfileImagesURL(List<String> userCds, String imageSizeType) throws BizApiException;

    /** 删除头像图片。返回值为删除件数。 */
    int deleteUserProfileImage(String userCd) throws BizApiException;

    /**
     * 注册头像图片。<br>
     * 对应的扩展名为 jpg(jpeg)、png。
     * @param file 数据 URL 形式的图片文件（base64 形式）
     * @return 注册件数
     */
    int setUserProfileImageURL(String userCd, String filename, String file) throws BizApiException;

    /**
     * 注册头像图片。<br>
     * 对应的扩展名为 jpg(jpeg)、png。
     * @param userImage 用户头像图片信息
     * @return 注册件数
     */
    int setUserProfileImage(UserImage userImage) throws BizApiException;
}
```

- 参数・返回值的详细 null 容许/异常条件中，有一部分依赖于实现（`UserProfileImageManagerImpl`），无法仅从接口的 JavaDoc 判断。边界值的行为（指定不存在的 `imageSizeType` 时等）建议通过实现确认或实机验证

## `UserProfileImageManagerFactory` 类

```java
package jp.co.intra_mart.foundation.master.user.factory;

/**
 * 生成 {@link UserProfileImageManager} 的实现。
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

- `getService()` 返回的实现为 `jp.co.intra_mart.system.master.user.impl.UserProfileImageManagerImpl`。调用方应以 `UserProfileImageManager`（接口类型）接收，不要直接依赖实现类
- `@ProvideFactory` / `@ProvideService`（`jp.co.intra_mart.foundation.web_api_maker.annotation`）是用于平台侧工厂解析机制的注解，调用方无需在意

## `UserImage` 模型（用于注册）

```java
package jp.co.intra_mart.foundation.master.user.model;

/**
 * 保存用户头像图片信息。
 * @since 8.0.20
 */
public class UserImage implements IUserBizKey {

    private String userCd;
    private Storage<?> storage; // jp.co.intra_mart.foundation.service.client.file.Storage

    public Storage<?> getStorage();
    /** 设置存放头像图片的存储区。 */
    public void setStorage(final Storage<?> storage);

    @Override
    public String getUserCd();
    @Override
    public void setUserCd(final String userCd);
}
```

- 设置到 `storage` 的 `Storage<?>` 的获取・关闭属于 `java-im-storage-usage` 技能的管辖范围（`PublicStorage`/`SessionScopeStorage`/`SystemStorage`）

## `UserImageFileInfo` 模型（用于获取结果）

```java
package jp.co.intra_mart.foundation.master.user.model;

/**
 * 保存用户头像图片的图片信息。
 * @since 8.0.20
 */
public class UserImageFileInfo {

    private String mimeType;
    private InputStream file;

    /** 获取头像图片文件。 */
    public InputStream getFile();
    public void setFile(final InputStream file);

    /** 获取 MIME 类型。 */
    public String getMimeType();
    public void setMimeType(final String mimeType);
}
```

- `getFile()` 返回的 `InputStream` 由调用方负责在读取完毕后关闭（应使用 `try-with-resources`）

## `IUserBizKey` 接口

```java
package jp.co.intra_mart.foundation.master.user.model;

/**
 * 处理用户业务键信息的接口
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

- 附加了 `@NotNullValidation` / `@LengthValidation(min = 1)`，表明 `userCd` 应为必填且长度在 1 个字符以上（`jp.co.intra_mart.foundation.validation.annotation` 包下的校验注解）

## 异常的处理

```java
package jp.co.intra_mart.foundation.exception;

/**
 * im-BizAPI 异常类。
 * 当 im-BizAPI 中发生异常时抛出。
 * @since 7.2
 */
public class BizApiException extends FoundationException {
    public BizApiException();
    public BizApiException(String message);
    public BizApiException(Throwable cause);
    public BizApiException(String message, Throwable cause);
    public BizApiException(String errorCode, String message, Throwable cause);
    public BizApiException(String errorCode, String message, Collection<String> subMessage, Throwable cause);

    /** 获取异常代码。 */
    public String getErrorCode();
    /** 获取消息列表。 */
    public Collection<String> getSubMessage();
}
```

- `UserProfileImageManager` 的全部方法均会抛出 `BizApiException`（受检异常）。调用方必须 `try`/`catch`，或通过 `throws` 声明将其传播给调用者
- `errorCode` / `subMessage` 可用于在错误处理中附加详细信息（构造函数未指定时，`errorCode` 为 `null`，`subMessage` 为空的 `ArrayList`）
