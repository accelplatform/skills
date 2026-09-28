# Role API リファレンス（Java 版）

intra-mart Accel Platform コアソース（`im_admin_base` モジュール）の実クラス定義に基づく。記憶や推測でメソッドを補わないこと。

## パッケージ構成

```
jp.co.intra_mart.foundation.admin.role
└── RoleInfoManager             … 公開 API。ロールの登録・更新・削除・階層・カテゴリ管理・検索を提供

jp.co.intra_mart.foundation.admin.role.model
├── RoleInfo                    … ロール情報モデル（Serializable）
└── RoleInfoListItem            … searchRoleInfosByCategoryAndRoleName の返却型（Serializable, 8.0.37〜）

jp.co.intra_mart.foundation.admin.exception
└── AdminException              … RoleInfoManager の全メソッドがスローするチェック例外（FoundationException のサブクラス）
```

## `RoleInfoManager` クラス

```java
package jp.co.intra_mart.foundation.admin.role;

public class RoleInfoManager {

    /**
     * インスタンスを作成します。
     */
    public RoleInfoManager();

    /**
     * ロール情報を新規登録します。
     * @param roleInfo 登録するロール情報
     * @throws AdminException 登録に失敗した場合
     */
    public void addRoleInfo(final RoleInfo roleInfo) throws AdminException;

    /**
     * ロールにサブロールを追加します（ロールサマリを再作成します）。
     * @param roleId 親ロールID
     * @param subRoleId 追加するサブロールID
     * @throws AdminException 追加に失敗した場合
     */
    public void addSubRoleInfo(final String roleId, final String subRoleId) throws AdminException;

    /**
     * 保有ロール（ネスト展開済み）が、指定したロール群のいずれかを内包しているか判定します。
     * @param nestRoleIds ネストしたロールも含めてチェックする対象のロールID配列
     * @param roleIds 直接一致のみでチェックする対象のロールID配列
     * @return nestRoleIds の中に roleIds のいずれかが含まれれば true
     * @throws AdminException 判定に失敗した場合
     */
    public boolean certify(final String[] nestRoleIds, final String[] roleIds) throws AdminException;

    /**
     * 指定したロールIDが存在するか判定します。
     * @param roleId ロールID
     * @return 存在する場合 true
     * @throws AdminException 判定に失敗した場合
     */
    public boolean contains(final String roleId) throws AdminException;

    /**
     * 指定したカテゴリが存在するか判定します。
     * @param category カテゴリ
     * @return 存在する場合 true
     * @throws AdminException 判定に失敗した場合
     */
    public boolean containsCategory(final String category) throws AdminException;

    /**
     * 全ロールに対して、指定したロール名が存在するか判定します。
     * @param roleName ロール名
     * @return 存在する場合 true
     * @throws AdminException 判定に失敗した場合
     */
    public boolean containsRoleName(final String roleName) throws AdminException;

    /**
     * 第2引数で指定したロールを除いて、指定したロール名が存在するか判定します。
     * @param roleName ロール名
     * @param exceptRoleId 判定対象から除外するロールID
     * @return 存在する場合 true
     * @throws AdminException 判定に失敗した場合
     */
    public boolean containsRoleName(final String roleName, final String exceptRoleId) throws AdminException;

    /**
     * 全カテゴリを削除します。
     * @throws AdminException 削除に失敗した場合
     */
    public void deleteCategories() throws AdminException;

    /**
     * 指定したカテゴリを削除します。
     * @param category カテゴリ
     * @throws AdminException 削除に失敗した場合
     */
    public void deleteCategory(final String category) throws AdminException;

    /**
     * 指定したロールを削除します。
     * @param roleId ロールID
     * @throws AdminException 削除に失敗した場合
     */
    public void deleteRoleInfo(final String roleId) throws AdminException;

    /**
     * 全ロールを削除します。
     * @throws AdminException 削除に失敗した場合
     */
    public void deleteRoleInfos() throws AdminException;

    /**
     * ロールから指定したサブロールを削除します（ロールサマリを再作成します）。
     * @param roleId 親ロールID
     * @param subRoleId 削除するサブロールID
     * @throws AdminException 削除に失敗した場合
     */
    public void deleteSubRoleInfo(final String roleId, final String subRoleId) throws AdminException;

    /**
     * ロールに属する全サブロールを削除します（ロールサマリを再作成します）。
     * @param roleId 親ロールID
     * @throws AdminException 削除に失敗した場合
     */
    public void deleteSubRoleInfos(final String roleId) throws AdminException;

    /**
     * ネストした親ロールも含めて、指定したロールの全親ロールIDを取得します。
     * @param roleId ロールID
     * @return 全親ロールIDのリスト
     * @throws AdminException 取得に失敗した場合
     */
    public List<String> getAllParentRoleIds(final String roleId) throws AdminException;

    /**
     * ネストしたサブロールも含めて、指定したロールの全サブロールIDを取得します。
     * @param roleId ロールID
     * @return 全サブロールIDのリスト
     * @throws AdminException 取得に失敗した場合
     */
    public List<String> getAllSubRoleIds(final String roleId) throws AdminException;

    /**
     * 重複を除いた全カテゴリを取得します。
     * @return カテゴリのリスト
     * @throws AdminException 取得に失敗した場合
     */
    public List<String> getCategories() throws AdminException;

    /**
     * 指定したカテゴリに属するロール件数を取得します。
     * @param category カテゴリ
     * @return ロール件数
     * @throws AdminException 取得に失敗した場合
     * @deprecated {@link #getRoleInfoCountByCategory(String)} を使用してください。
     */
    @Deprecated
    public int getCategoryCount(final String category) throws AdminException;

    /**
     * 1階層上の親ロールIDのみを取得します（ネストは展開しません）。
     * @param roleId ロールID
     * @return 1階層上の親ロールIDのリスト
     * @throws AdminException 取得に失敗した場合
     */
    public List<String> getParentRoleIds(final String roleId) throws AdminException;

    /**
     * 全ロールIDを取得します。
     * @return ロールIDのリスト
     * @throws AdminException 取得に失敗した場合
     */
    public List<String> getRoleIds() throws AdminException;

    /**
     * 指定したロールIDのロール情報を取得します。
     * @param roleId ロールID
     * @return ロール情報。ロールが存在しない場合は null（例外はスローされません）
     * @throws AdminException 取得処理自体に失敗した場合
     */
    public RoleInfo getRoleInfo(final String roleId) throws AdminException;

    /**
     * 全ロール件数を取得します。
     * @return ロール件数
     * @throws AdminException 取得に失敗した場合
     */
    public int getRoleInfoCount() throws AdminException;

    /**
     * 指定したカテゴリに属するロール件数を取得します。
     * @param category カテゴリ
     * @return ロール件数
     * @throws AdminException 取得に失敗した場合
     */
    public int getRoleInfoCountByCategory(final String category) throws AdminException;

    /**
     * 全ロール情報を取得します。
     * @return ロール情報のリスト
     * @throws AdminException 取得に失敗した場合
     */
    public List<RoleInfo> getRoleInfos() throws AdminException;

    /**
     * 指定したカテゴリに属するロール情報を取得します。
     * @param category カテゴリ
     * @return ロール情報のリスト
     * @throws AdminException 取得に失敗した場合
     */
    public List<RoleInfo> getRoleInfosByCategory(final String category) throws AdminException;

    /**
     * 指定したロールID群のロール情報を取得します。
     * @param roleIds ロールID（可変長引数）
     * @return ロール情報のリスト
     * @throws AdminException 取得に失敗した場合
     */
    public List<RoleInfo> getRoleInfosByRoleIds(final String... roleIds) throws AdminException;

    /**
     * 1階層下のサブロールIDのみを取得します（ネストは展開しません）。
     * @param roleId ロールID
     * @return 1階層下のサブロールIDのリスト
     * @throws AdminException 取得に失敗した場合
     */
    public List<String> getSubRoleIds(final String roleId) throws AdminException;

    /**
     * 指定した日時以降の更新有無を判定します。
     * @param date 判定基準日時
     * @return 常に true
     * @throws AdminException 判定に失敗した場合
     * @deprecated 常に true を返す実装のため、実質的に判定手段として機能しません。
     */
    @Deprecated
    public boolean isUpdate(final Date date) throws AdminException;

    /**
     * 指定したカテゴリに属する全ロールのカテゴリ名を一括更新します（破壊的操作）。
     * @param oldCategory 変更前カテゴリ名
     * @param newCategory 変更後カテゴリ名
     * @throws AdminException 更新に失敗した場合
     */
    public void moveCategory(final String oldCategory, final String newCategory) throws AdminException;

    /**
     * ロールIDのワイルドカード検索を行います（* は0文字以上、? は1文字に一致）。
     * @param roleId 検索条件（ワイルドカード可）
     * @return 該当するロール情報のリスト
     * @throws AdminException 検索に失敗した場合
     */
    public List<RoleInfo> searchRoleInfosByRoleId(final String roleId) throws AdminException;

    /**
     * ロール名のワイルドカード検索を行います（* は0文字以上、? は1文字に一致）。
     * @param roleName 検索条件（ワイルドカード可）
     * @return 該当するロール情報のリスト
     * @throws AdminException 検索に失敗した場合
     */
    public List<RoleInfo> searchRoleInfosByRoleName(final String roleName) throws AdminException;

    /**
     * ロール情報を更新します。
     * @param roleInfo 更新するロール情報
     * @throws AdminException 更新に失敗した場合
     */
    public void updateRoleInfo(final RoleInfo roleInfo) throws AdminException;

    /**
     * 指定したカテゴリ・ロール名条件に該当するロール件数を取得します。
     * @param category カテゴリ（検索条件）
     * @param roleName ロール名（検索条件）
     * @param locale 表示名解決に使用するロケール
     * @return 該当するロール件数
     * @throws AdminException 取得に失敗した場合
     * @since 8.0.37
     */
    public int getRoleInfoCountByCategoryAndRoleName(final String category, final String roleName, final Locale locale) throws AdminException;

    /**
     * 指定したカテゴリ・ロール名条件でロール情報を検索し、ページネーション・ソートを行って取得します。
     * @param category カテゴリ（検索条件）
     * @param roleName ロール名（検索条件）
     * @param locale 表示名解決に使用するロケール
     * @param limit 取得件数の上限
     * @param offset 取得開始位置（0始まり）
     * @param sortIndex ソート対象カラム（category / role_name / display_name のいずれか）
     * @param sortOrder ソート順（ASC / DESC）
     * @return 該当するロール情報リスト項目のリスト
     * @throws AdminException 検索に失敗した場合
     * @since 8.0.37
     */
    public List<RoleInfoListItem> searchRoleInfosByCategoryAndRoleName(final String category, final String roleName,
            final Locale locale, final int limit, final int offset, final String sortIndex, final String sortOrder) throws AdminException;

    /**
     * ロールサマリの再作成を行わずにサブロールを追加します（大量データの一括更新等パフォーマンス最適化用の軽量版）。
     * このメソッドを使用した場合、呼び出し側で別途 {@link #regenerateRoleSummary()} を呼び出す必要があります。
     * @param roleId 親ロールID
     * @param subRoleId 追加するサブロールID
     * @throws AdminException 追加に失敗した場合
     * @since 8.0.37
     */
    public void addSubRoleInfoWithoutCreatingSummary(final String roleId, final String subRoleId) throws AdminException;

    /**
     * ロールサマリの再作成を行わずにサブロールを削除します。
     * このメソッドを使用した場合、呼び出し側で別途 {@link #regenerateRoleSummary()} を呼び出す必要があります。
     * @param roleId 親ロールID
     * @param subRoleId 削除するサブロールID
     * @throws AdminException 削除に失敗した場合
     * @since 8.0.37
     */
    public void deleteSubRoleInfoWithoutCreatingSummary(final String roleId, final String subRoleId) throws AdminException;

    /**
     * ロールサマリの再作成を行わずに、ロールに属する全サブロールを削除します。
     * このメソッドを使用した場合、呼び出し側で別途 {@link #regenerateRoleSummary()} を呼び出す必要があります。
     * @param roleId 親ロールID
     * @throws AdminException 削除に失敗した場合
     * @since 8.0.37
     */
    public void deleteSubRoleInfosWithoutCreatingSummary(final String roleId) throws AdminException;

    /**
     * 全ロールのロールサマリを再作成します。
     * {@code WithoutCreatingSummary} 系メソッドで階層を更新した後、必ず1回呼び出してロールサマリを整合させること。
     * @throws AdminException 再作成に失敗した場合
     * @since 8.0.37
     */
    public void regenerateRoleSummary() throws AdminException;
}
```

- `final` でない通常のクラス（継承可能）
- 全メソッドが `AdminException`（チェック例外）を宣言する。`throws` を伝播させるか、呼び出し側で `catch` して業務例外にラップする
- `getRoleInfo(roleId)` のみ、対象が存在しない場合に例外ではなく **`null` を返す**設計になっている点に注意（他の `get`/`search` 系メソッドは該当なしの場合、空リストを返す）

## `RoleInfo` モデル

```java
package jp.co.intra_mart.foundation.admin.role.model;

import java.io.IOException;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class RoleInfo implements Serializable {

    /** カテゴリ */
    private String category;

    /** 表示名（key: ロケール、value: 表示名） */
    private final Map<Locale, String> displayName = new HashMap<Locale, String>();

    /** 備考 */
    private String notes;

    /** ロールID */
    private String roleId;

    /** ロール名 */
    private String roleName;

    /**
     * インスタンスを作成します。ロールIDは Identifier により自動採番されます。
     * @throws IOException 自動採番に失敗した場合
     */
    public RoleInfo() throws IOException;

    /**
     * ロールIDを指定してインスタンスを作成します。ロール名はロールIDと同値になります。
     * @param roleId ロールID
     */
    public RoleInfo(final String roleId);

    /**
     * ロールID・ロール名を指定してインスタンスを作成します。
     * @param roleId ロールID
     * @param roleName ロール名
     */
    public RoleInfo(final String roleId, final String roleName);

    // category / notes / roleId / roleName に対応する標準的な getter / setter
    // displayName は Map<Locale, String> を直接返す getter / ロケール単位で設定する setter を持つ

    /**
     * ロールIDの一致で等価性を判定します。
     * @param object 比較対象オブジェクト
     * @return ロールIDが一致する場合 true
     */
    @Override
    public boolean equals(final Object object);
}
```

- 3種類のコンストラクタの使い分け:
  - `RoleInfo()`: ロールIDを `Identifier` で自動採番したい場合。**`IOException`（チェック例外）をスローする**唯一のコンストラクタ
  - `RoleInfo(roleId)`: ロールIDを明示指定したい場合。ロール名はロールIDと同じ値で初期化される（別途 `setRoleName()` で上書き可能）
  - `RoleInfo(roleId, roleName)`: ロールID・ロール名の両方を明示指定したい場合
  - 引数ありの2種類のコンストラクタは例外を投げない
- `displayName` は単一の `String` ではなく `Map<Locale, String>` である点に注意。ロケールごとに異なる表示名を保持できる
- `equals()` はロールIDの一致のみで判定する（他フィールドは比較対象に含まれない）

## `RoleInfoListItem` モデル

`searchRoleInfosByCategoryAndRoleName` の返却型。SSJS 版 d.ts（`d.ts/tenant/object/im-ssjs-role-info-list-item.d.ts`）と対応するフィールド構成。

```java
package jp.co.intra_mart.foundation.admin.role.model;

import java.io.Serializable;

public class RoleInfoListItem implements Serializable {

    /** カテゴリ */
    private String category;

    /** 表示名（引数で指定したロケールにより解決済みの単一文字列） */
    private String displayName;

    /** ロールID */
    private String roleId;

    /** ロール名 */
    private String roleName;

    // category / displayName / roleId / roleName に対応する標準的な getter / setter
}
```

- `RoleInfo` の `displayName` が `Map<Locale, String>` であるのに対し、`RoleInfoListItem` の `displayName` は `searchRoleInfosByCategoryAndRoleName` 呼び出し時に指定した `Locale` で**解決済みの単一 `String`**である点が異なる。一覧表示用に整形済みのデータを表す
- 検索・ページネーション専用の読み取りモデルであり、`RoleInfoManager` へこのオブジェクトを直接渡す更新系メソッドは存在しない（更新する場合は `RoleInfo` を使う）

## `AdminException`

```java
package jp.co.intra_mart.foundation.admin.exception;

public class AdminException extends FoundationException {
    // RoleInfoManager の全メソッドがスローするチェック例外
}
```

- `jp.co.intra_mart.foundation.exception.FoundationException` を継承したチェック例外
- `RoleInfoManager` の全メソッド（コンストラクタを除く）がこの例外を宣言する
- 呼び出し側は `throws` で伝播させるか、業務例外にラップして `catch` する。握りつぶし（空の `catch` ブロック）は禁止（`assets/role-basic-usage.md` のアンチパターンを参照）
