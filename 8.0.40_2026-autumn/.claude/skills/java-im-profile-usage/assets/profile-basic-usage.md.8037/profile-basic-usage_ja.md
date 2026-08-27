# User Profile Image API 基本利用パターン（Java 版）

`UserProfileImageManager` / `UserImage` / `UserImageFileInfo` のシグネチャ・内部動作は
`reference/profile-api-reference.md` を参照。ここでは典型的な呼び出しパターンを示す。

**ユーザ基本情報（氏名・所属等）の操作、および IM-LogicDesigner のロジックフロー要素はこのスキルの対象外である。** ここで扱うのは「ユーザのプロファイル画像」の取得・登録・削除のみ。

## パターン1: プロファイル画像の取得（Stream形式・単数）

画面のダウンロード API 等、レスポンスへ画像バイナリをそのまま出力する用途を想定。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.user.UserProfileImageManager;
import jp.co.intra_mart.foundation.master.user.factory.UserProfileImageManagerFactory;
import jp.co.intra_mart.foundation.master.user.model.UserImageFileInfo;

import jp.co.example.foo.exception.ProfileImageAcquisitionException;

/**
 * ユーザプロファイル画像の取得処理を提供します。
 */
public class ProfileImageQueryService {

    /**
     * プロファイル画像をStream形式で取得します。<br>
     * 画像が未登録の場合はNoImageが返却されます。
     *
     * @param userCd ユーザコード
     * @param imageSizeType 画像種別（im-master-config.xmlで定義されたキー名。null の場合 original サイズ）
     * @return プロファイル画像情報
     * @throws ProfileImageAcquisitionException プロファイル画像の取得に失敗した場合
     */
    public UserImageFileInfo getProfileImage(final String userCd, final String imageSizeType)
            throws ProfileImageAcquisitionException {
        final UserProfileImageManager userProfileImageManager = UserProfileImageManagerFactory.getFactory().getService();
        try {
            return userProfileImageManager.getUserProfileImageStream(userCd, imageSizeType);
        } catch (final BizApiException e) {
            throw new ProfileImageAcquisitionException("プロファイル画像の取得に失敗しました: userCd=" + userCd, e);
        }
    }
}
```

- 実装は `UserProfileImageManagerFactory.getFactory().getService()` から取得する。`UserProfileImageManagerImpl` を直接 `new` しない
- `UserImageFileInfo#getFile()` が返す `InputStream` は呼び出し側で読了後にクローズする責務がある（`try-with-resources` を使う）

## パターン2: プロファイル画像の取得（Stream形式・複数）

複数ユーザの画像を一覧画面等でまとめて取得する用途を想定。未登録ユーザは結果に含まれない点に注意。

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
 * ユーザプロファイル画像の一括取得処理を提供します。
 */
public class ProfileImageBatchQueryService {

    /**
     * 複数ユーザのプロファイル画像をStream形式で取得します。<br>
     * 画像が未登録のユーザは戻り値のマップに含まれません（呼び出し元で欠落を考慮すること）。
     *
     * @param userCds ユーザコードのリスト
     * @param imageSizeType 画像種別
     * @return ユーザコードをキーとしたプロファイル画像情報のマップ（未登録ユーザは含まれない）
     * @throws ProfileImageAcquisitionException プロファイル画像の取得に失敗した場合
     */
    public Map<String, UserImageFileInfo> getProfileImages(final List<String> userCds, final String imageSizeType)
            throws ProfileImageAcquisitionException {
        final UserProfileImageManager userProfileImageManager = UserProfileImageManagerFactory.getFactory().getService();
        try {
            return userProfileImageManager.getUserProfileImagesStream(userCds, imageSizeType);
        } catch (final BizApiException e) {
            throw new ProfileImageAcquisitionException("プロファイル画像の一括取得に失敗しました: userCds=" + userCds, e);
        }
    }
}
```

- 単数取得系（`getUserProfileImageStream()`）は未登録時に NoImage を返すが、複数取得系（`getUserProfileImagesStream()`）は未登録ユーザを結果から除外する。**挙動が異なる点に注意**し、呼び出し元で `userCds` の件数と戻り値マップの件数が一致しない前提でハンドリングすること

## パターン3: プロファイル画像URLの取得（単数）

一覧画面の `<img>` タグ等、URL参照で画像を表示する用途を想定。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.user.UserProfileImageManager;
import jp.co.intra_mart.foundation.master.user.factory.UserProfileImageManagerFactory;

import jp.co.example.foo.exception.ProfileImageAcquisitionException;

/**
 * ユーザプロファイル画像URLの取得処理を提供します。
 */
public class ProfileImageUrlQueryService {

    /**
     * プロファイル画像URLを取得します。<br>
     * 取得したURLはユーザコードと画像種別をキーにキャッシュされます。
     *
     * @param userCd ユーザコード
     * @param imageSizeType 画像種別
     * @return プロファイル画像URL
     * @throws ProfileImageAcquisitionException プロファイル画像URLの取得に失敗した場合
     */
    public String getProfileImageUrl(final String userCd, final String imageSizeType)
            throws ProfileImageAcquisitionException {
        final UserProfileImageManager userProfileImageManager = UserProfileImageManagerFactory.getFactory().getService();
        try {
            return userProfileImageManager.getUserProfileImageURL(userCd, imageSizeType);
        } catch (final BizApiException e) {
            throw new ProfileImageAcquisitionException("プロファイル画像URLの取得に失敗しました: userCd=" + userCd, e);
        }
    }
}
```

- 取得結果はユーザコード・画像種別単位でキャッシュされる。画像を更新（`setUserProfileImage*`）した直後に画面側で古いURLを参照し続ける可能性があるため、更新後の再取得タイミングに注意する

## パターン4: プロファイル画像の削除

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.user.UserProfileImageManager;
import jp.co.intra_mart.foundation.master.user.factory.UserProfileImageManagerFactory;

import jp.co.example.foo.exception.ProfileImageDeletionException;

/**
 * ユーザプロファイル画像の削除処理を提供します。
 */
public class ProfileImageDeletionService {

    /**
     * プロファイル画像を削除します。
     *
     * @param userCd ユーザコード
     * @return 削除件数
     * @throws ProfileImageDeletionException プロファイル画像の削除に失敗した場合
     */
    public int deleteProfileImage(final String userCd) throws ProfileImageDeletionException {
        final UserProfileImageManager userProfileImageManager = UserProfileImageManagerFactory.getFactory().getService();
        try {
            return userProfileImageManager.deleteUserProfileImage(userCd);
        } catch (final BizApiException e) {
            throw new ProfileImageDeletionException("プロファイル画像の削除に失敗しました: userCd=" + userCd, e);
        }
    }
}
```

## パターン5: プロファイル画像の登録（データURL形式）

アップロードフォームからbase64データURLを直接受け取るケースを想定。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.user.UserProfileImageManager;
import jp.co.intra_mart.foundation.master.user.factory.UserProfileImageManagerFactory;

import jp.co.example.foo.exception.ProfileImageRegistrationException;

/**
 * ユーザプロファイル画像の登録処理を提供します（データURL形式）。
 */
public class ProfileImageUrlRegistrationService {

    /**
     * プロファイル画像を登録します。<br>
     * 対応する拡張子はjpg(jpeg)、pngです。
     *
     * @param userCd ユーザコード
     * @param filename 画像ファイル名
     * @param dataUrl データURL形式の画像ファイル（base64形式）
     * @return 登録件数
     * @throws ProfileImageRegistrationException プロファイル画像の登録に失敗した場合
     */
    public int registerProfileImage(final String userCd, final String filename, final String dataUrl)
            throws ProfileImageRegistrationException {
        final UserProfileImageManager userProfileImageManager = UserProfileImageManagerFactory.getFactory().getService();
        try {
            return userProfileImageManager.setUserProfileImageURL(userCd, filename, dataUrl);
        } catch (final BizApiException e) {
            throw new ProfileImageRegistrationException("プロファイル画像の登録に失敗しました: userCd=" + userCd, e);
        }
    }
}
```

## パターン6: プロファイル画像の登録（Storage経由）

`SessionScopeStorage` にアップロード済みの一時ファイルを、そのままプロファイル画像として登録する例。`Storage<?>` の取得・クローズは `java-im-storage-usage` の規約に従う。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.user.UserProfileImageManager;
import jp.co.intra_mart.foundation.master.user.factory.UserProfileImageManagerFactory;
import jp.co.intra_mart.foundation.master.user.model.UserImage;
import jp.co.intra_mart.foundation.service.client.file.SessionScopeStorage;

import jp.co.example.foo.exception.ProfileImageRegistrationException;

/**
 * ユーザプロファイル画像の登録処理を提供します（Storage経由）。
 */
public class ProfileImageStorageRegistrationService {

    /**
     * 一時領域にアップロード済みの画像ファイルを、プロファイル画像として登録します。<br>
     * 対応する拡張子はjpg(jpeg)、pngです。
     *
     * @param userCd ユーザコード
     * @param tempFilePath アップロード済み一時ファイルの相対パス（SessionScopeStorage 基準）
     * @return 登録件数
     * @throws ProfileImageRegistrationException プロファイル画像の登録に失敗した場合
     */
    public int registerProfileImage(final String userCd, final String tempFilePath) throws ProfileImageRegistrationException {
        final UserImage userImage = new UserImage();
        userImage.setUserCd(userCd);
        userImage.setStorage(new SessionScopeStorage(tempFilePath));

        final UserProfileImageManager userProfileImageManager = UserProfileImageManagerFactory.getFactory().getService();
        try {
            return userProfileImageManager.setUserProfileImage(userImage);
        } catch (final BizApiException e) {
            throw new ProfileImageRegistrationException("プロファイル画像の登録に失敗しました: userCd=" + userCd, e);
        }
    }
}
```

- `SessionScopeStorage` は一時領域であり、利用後は明示的な削除が必要（`java-im-storage-usage` の「生成後の確認」参照）。登録処理成功後に一時ファイルを削除するかどうかは業務要件に応じて判断する
- `UserImage` のコンストラクタ引数は無く、`setUserCd()` / `setStorage()` で設定する（`IUserBizKey#getUserCd()` に `@NotNullValidation` が付与されているため、`userCd` は必須）

## アンチパターン（避けること）

```java
// NG: UserProfileImageManagerImpl を直接 new する
final UserProfileImageManager userProfileImageManager = new UserProfileImageManagerImpl();
// 必ず UserProfileImageManagerFactory.getFactory().getService() を経由すること

// NG: 複数取得系の戻り値マップが全ユーザ分揃っている前提でアクセスする
final Map<String, UserImageFileInfo> images = userProfileImageManager.getUserProfileImagesStream(userCds, null);
for (final String userCd : userCds) {
    final UserImageFileInfo info = images.get(userCd);
    info.getFile(); // 未登録ユーザは images に含まれないため NullPointerException になりうる
}

// NG: BizApiException を握りつぶす
try {
    userProfileImageManager.deleteUserProfileImage(userCd);
} catch (final BizApiException e) {
    // 何もしない（原因不明のまま処理が続行される）
}

// NG: UserImageFileInfo#getFile() の InputStream をクローズしない
final UserImageFileInfo info = userProfileImageManager.getUserProfileImageStream(userCd, null);
final InputStream in = info.getFile();
// 読み込み後に in.close() されていない（リソースリーク）。try-with-resources を使うこと

// NG: jpg/png 以外の拡張子でファイルを登録しようとする
userProfileImageManager.setUserProfileImageURL(userCd, "avatar.gif", dataUrl);
// 対応拡張子は jpg(jpeg)/png のみ
```
