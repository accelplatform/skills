# IM-共通マスタ（ユーザ・会社・組織）実装パターン（Java 版）

`UserManager`/`CompanyManager` を使った実装パターン集。メソッドの正確なシグネチャは `reference/user-manager-api-reference.md`/`reference/company-manager-api-reference.md` を参照すること。

## 共通事項: マネージャの生成

```java
// 現在ログイン中のユーザを更新者・デフォルトロケールとして使う（推奨）
final UserManager userManager = new UserManager();
final CompanyManager companyManager = new CompanyManager();
```

`UserManager`/`CompanyManager` のコンストラクタ、および以下で扱うほぼ全メソッドは検査例外 `jp.co.intra_mart.foundation.exception.BizApiException` を送出する。呼び出し元でハンドリングすること。

## 検索条件（`AppCmnSearchCondition`）の基本

`list*`/`search*`/`count*`/`total*` 系メソッドは `AppCmnSearchCondition` を条件として受け取る。`AppCmnSearchCondition` は `SearchCondition` を継承しており、対象カラムは `addCondition(String columnName, Object value[, Operator operator])`（`SearchCondition` 由来）にカラム名の文字列を渡して指定する。カラム名は、対象テーブルに対応する列挙型（`ImmUserColumn`/`ImmCompanyColumn`/`ImmDepartmentColumn`/`ImmCompanyPostColumn` 等、いずれも `ImmTableColumn` を実装）の `toString()`（実際のDBカラム名を返す）から取得する。

```java
import jp.co.intra_mart.foundation.database.Operator;
import jp.co.intra_mart.foundation.master.common.search.AppCmnSearchCondition;
import jp.co.intra_mart.foundation.master.user.model.ImmUserColumn;

final AppCmnSearchCondition condition = new AppCmnSearchCondition();
// 完全一致（Operator省略時は EQ 相当）。ImmUserColumn は SearchTarget ではなく ImmTableColumn の実装であり、toString() で文字列化してから渡す
condition.addCondition(ImmUserColumn.USER_CD.toString(), "user001");
// 部分一致（LIKE）。ワイルドカードは呼び出し側で組み立てる
condition.addCondition(ImmUserColumn.USER_NAME.toString(), "%" + keyword + "%", Operator.LIKE);
```

**注意: `ImmUserColumn` 等は `AppCmnSearchCondition` が持つ `SearchTarget` 引数版の `addCondition(SearchTarget, Object[, Operator])` には渡せない（`ImmTableColumn` と `SearchTarget` は無関係の別インタフェース/enum）。** 必ず `toString()` で文字列化し、`SearchCondition` 由来の `addCondition(String, Object[, Operator])` を使うこと。

## パターン1: ユーザの取得

```java
import java.util.Date;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.user.UserManager;
import jp.co.intra_mart.foundation.master.user.model.User;

public class UserLookupService {

    public User findByUserCd(final String userCd) throws BizApiException {
        final UserManager userManager = new UserManager();
        final User keyHolder = new User();
        keyHolder.setUserCd(userCd);
        // date に現在日時を渡すと、その日付時点で有効な期間のユーザ情報を取得する
        return userManager.getUser(keyHolder, new Date());
    }
}
```

- `User` は `IUserBizKey` を実装しているため、`userCd` だけをセットした `User` インスタンスをそのまま検索キーとして渡せる
- 対象ユーザが存在しない期間・日付を指定した場合、`getUser` は例外を送出せず `null` を返す

## パターン2: ユーザの検索（キーワード検索・ページング）

```java
import java.util.Date;
import java.util.Locale;

import jp.co.intra_mart.foundation.database.Operator;
import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.common.search.AppCmnSearchCondition;
import jp.co.intra_mart.foundation.master.user.UserManager;
import jp.co.intra_mart.foundation.master.user.model.ImmUserColumn;
import jp.co.intra_mart.foundation.master.user.model.UserListNode;

public class UserSearchService {

    public UserListNode[] searchByName(final String keyword, final int page, final int pageSize) throws BizApiException {
        final UserManager userManager = new UserManager();

        final AppCmnSearchCondition condition = new AppCmnSearchCondition();
        condition.addCondition(ImmUserColumn.USER_NAME.toString(), "%" + keyword + "%", Operator.LIKE);

        final int start = (page - 1) * pageSize + 1; // start は1始まり
        return userManager.listUser(condition, new Date(), Locale.JAPANESE, start, pageSize);
    }
}
```

- `count` に `0` を指定すると全件取得（ページング無し）
- `locale` は必須。省略すると全言語の国際化情報を取得する `getUser` 系とは異なり、検索系は明示的なロケール指定が必須

## パターン3: ユーザの新規登録・更新（`setUser`）

**新規登録時（`termCd` 未設定時）は `startDate`/`endDate` の両方の設定が必須。** 未設定のまま `setUser` を呼ぶと `BizApiException`（「開始日にnullが設定されています」等）が送出される。設定する日付は、システム開始日（固定値 `1900/01/01`）〜システム終了日（既定値 `3000/01/01`。拡張ポイント `jp.co.intra_mart.master.config.system_end_date` で変更可）の範囲内である必要がある。

```java
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.user.UserManager;
import jp.co.intra_mart.foundation.master.user.model.IUserElement;
import jp.co.intra_mart.foundation.master.user.model.User;

public class UserRegistrationService {

    /** 期限を設けない場合の終了日として使うプロジェクト共通の「遠い将来日」（システム終了日の既定値と同じ）。 */
    private static final Date FAR_FUTURE_DATE = buildFarFutureDate();

    private static Date buildFarFutureDate() {
        final Calendar calendar = Calendar.getInstance();
        calendar.set(3000, Calendar.JANUARY, 1, 0, 0, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    public void register(final String userCd, final String userName) throws BizApiException {
        final UserManager userManager = new UserManager();

        final User user = new User();
        user.setUserCd(userCd);
        // termCd を設定しない = 新規登録として扱われる
        user.setStartDate(new Date()); // 新規登録時は startDate/endDate の設定が必須
        user.setEndDate(FAR_FUTURE_DATE);

        final Locale locale = Locale.JAPANESE;
        user.setDefaultLocale(locale);
        final IUserElement element = user.createLocaleElement();
        element.setUserName(userName);
        user.putLocaleElement(locale, element);

        userManager.setUser(user); // 新規登録（termCd 未設定のため）
    }

    public void updateName(final String userCd, final Date baseDate, final String newName) throws BizApiException {
        final UserManager userManager = new UserManager();

        final User keyHolder = new User();
        keyHolder.setUserCd(userCd);

        // 更新時も startDate/endDate の設定が必須なため、現在登録されている値を取得して引き継ぐ
        // （未設定のままでは、対象データと指定データの開始日・終了日が一致しないとみなされ BizApiException が送出される）
        final User current = userManager.getUser(keyHolder, baseDate);

        final User user = new User();
        user.setUserCd(userCd);
        user.setTermCd(current.getTermCd()); // termCd を設定 = 更新として扱われる
        user.setStartDate(current.getStartDate());
        user.setEndDate(current.getEndDate());

        final Locale locale = Locale.JAPANESE;
        user.setDefaultLocale(locale);
        final IUserElement element = user.createLocaleElement();
        element.setUserName(newName);
        user.putLocaleElement(locale, element);

        userManager.setUser(user);
    }
}
```

- **新規登録か更新かは `termCd` の有無だけで自動判定される。** 呼び出し側で明示的に「新規登録メソッド」「更新メソッド」を使い分ける必要はない
- **新規登録時（`termCd` 未設定時）・更新時（`termCd` 設定時）のいずれも `startDate`/`endDate` の設定が必須。** 更新時に未設定（null）のままだと、対象データに格納されている値との不一致とみなされ「対象データと指定されたデータの開始日、終了日が異なります」という `BizApiException` が送出される。更新時は、登録時に使用した値、または現在登録されている値（`get*` で取得）と同じ値を明示的に設定すること
- 更新の場合、`setUser` に渡す `User` は更新したいフィールドだけでなく、変更しないフィールドも含めて構築する必要がある（部分更新ではなく全体を渡す方式。既存データを事前に `getUser` で取得し、必要な値だけ変更してから `setUser` に渡すパターンが安全）
- 期間そのもの（開始日・終了日）を変更したい場合は `setUser` ではなく `moveTermUser`/`separateTermUser`/`mergeForwardTermUser`/`mergeBackwardTermUser` を使う

## パターン4: 会社の取得・更新（新規作成は不可）

**`updateCompany` は既存の会社レコードの更新専用であり、新規の会社を作成することはできない。** 標準実装は `company_cd` を条件とした SQL の `UPDATE` のみを発行し、対象が存在しない場合は例外を送出せず何も更新せずに終了する（会社が作成されないまま処理が正常終了したように見えるため、特に注意が必要）。新規の会社を用意する必要がある場合は、`importData`（インポート機能）またはテナントセットアップ資材経由での投入をユーザに確認すること。

```java
import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.company.CompanyManager;
import jp.co.intra_mart.foundation.master.company.model.Company;

public class CompanyService {

    public Company find(final String companyCd) throws BizApiException {
        final CompanyManager companyManager = new CompanyManager();
        final Company keyHolder = new Company();
        keyHolder.setCompanyCd(companyCd);
        return companyManager.getCompany(keyHolder);
    }

    /**
     * 既存の会社のソートキーを更新する。
     * 対象の companyCd が未登録の場合、例外は発生しないが更新も行われない点に注意。
     */
    public void updateSortKey(final String companyCd, final int sortKey) throws BizApiException {
        final CompanyManager companyManager = new CompanyManager();
        final Company company = new Company();
        company.setCompanyCd(companyCd);
        company.setSortKey(sortKey);
        companyManager.updateCompany(company);
    }
}
```

**注意: `Company` は会社コード・ソートキー等のみを持ち、多言語の会社名フィールドを持たない。** 会社名の表示が必要な場合、組織（`Department`）側で名称を管理する設計にするか、プロジェクト独自の拡張を検討する（`reference/company-manager-api-reference.md` の `Company` モデルの制約を参照）。

## パターン5: 組織の新規登録・更新と階層取得

**`DepartmentSet` も `Company` と同じ制約を持ち、`updateDepartmentSet` は既存レコードの更新専用（新規作成不可）。** `Department`/`CompanyPost` は `set*` パターンで新規登録可能だが、新規登録時は `startDate`/`endDate` の設定が必須（パターン3参照）。

```java
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.company.CompanyManager;
import jp.co.intra_mart.foundation.master.company.model.Department;
import jp.co.intra_mart.foundation.master.company.model.DepartmentTreeNode;
import jp.co.intra_mart.foundation.master.company.model.IDepartmentElement;
import jp.co.intra_mart.foundation.master.company.model.IDepartmentSetBizKey;

public class DepartmentService {

    private static final Date FAR_FUTURE_DATE = buildFarFutureDate();

    private static Date buildFarFutureDate() {
        final Calendar calendar = Calendar.getInstance();
        calendar.set(3000, Calendar.JANUARY, 1, 0, 0, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    /**
     * 組織を登録する。事前に対象の DepartmentSet が（インポート等で）作成済みであることが前提。
     */
    public void register(final String companyCd, final String departmentSetCd, final String departmentCd, final String departmentName) throws BizApiException {
        final CompanyManager companyManager = new CompanyManager();

        final Department department = new Department();
        department.setCompanyCd(companyCd);
        department.setDepartmentSetCd(departmentSetCd);
        department.setDepartmentCd(departmentCd);
        // termCd を設定しない = 新規登録
        department.setStartDate(new Date()); // 新規登録時は startDate/endDate の設定が必須
        department.setEndDate(FAR_FUTURE_DATE);

        final Locale locale = Locale.JAPANESE;
        department.setDefaultLocale(locale);
        final IDepartmentElement element = department.createLocaleElement();
        element.setDepartmentName(departmentName);
        department.putLocaleElement(locale, element);

        companyManager.setDepartment(department); // User と同じく termCd 有無で新規/更新判定
    }

    public DepartmentTreeNode getOrganizationTree(final IDepartmentSetBizKey departmentSetBizKey) throws BizApiException {
        final CompanyManager companyManager = new CompanyManager();
        return companyManager.getTree(departmentSetBizKey, new Date(), Locale.JAPANESE);
    }
}
```

- `setDepartment` の新規/更新判定は `setUser` と同様、`termCd` の有無による。新規登録時は `startDate`/`endDate` の設定も必須
- **`DepartmentSet` は `updateDepartmentSet` 1メソッドのみを持ち、既存レコードの更新専用（新規作成不可）。** `Department` を登録する前提として、参照先の `DepartmentSet` が（インポート等の手段で）事前に作成済みである必要がある
- 組織階層の全体構造が必要な場合は `getTree`、特定組織を起点とした部分木は `getBranch` を使う（`reference/company-manager-api-reference.md` 参照）

## パターン6: ユーザの組織所属（主所属フラグ）

**`setUserAttach` の `term` 引数に `null` は渡せない。** 内部で常に `startDate`/`endDate` の非 null チェックが行われるため（新規付与・更新のいずれでも必須）、`jp.co.intra_mart.foundation.master.common.model.Term` のインスタンスを生成し、日付を設定した上で渡す。

```java
import java.util.Calendar;
import java.util.Date;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.common.model.Term;
import jp.co.intra_mart.foundation.master.company.CompanyManager;
import jp.co.intra_mart.foundation.master.company.model.Department;
import jp.co.intra_mart.foundation.master.user.model.User;

public class UserDepartmentAssignmentService {

    private static final Date FAR_FUTURE_DATE = buildFarFutureDate();

    private static Date buildFarFutureDate() {
        final Calendar calendar = Calendar.getInstance();
        calendar.set(3000, Calendar.JANUARY, 1, 0, 0, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    public void assignAsMainDepartment(final Department department, final User user) throws BizApiException {
        final CompanyManager companyManager = new CompanyManager();

        // term に null は渡せない。startDate/endDate を設定した Term を生成する（termCd は未設定 = 新規付与）
        final Term term = new Term();
        term.setStartDate(new Date());
        term.setEndDate(FAR_FUTURE_DATE);

        companyManager.setUserAttach(department, user, term, true); // isDepartmentMain = true（主所属）
    }

    public void unassign(final Department department, final User user) throws BizApiException {
        final CompanyManager companyManager = new CompanyManager();
        companyManager.removeUserAttach(department, user);
    }
}
```

- `Department`/`User` はいずれも対応するビジネスキーインタフェース（`IDepartmentBizKey`/`IUserBizKey`）を実装しているため、コード（会社コード・組織セットコード・組織コード／ユーザコード）だけをセットしたインスタンスをそのまま渡せる
- `isDepartmentMain = true` で主所属として登録すると、既存の主所属が自動的に解除される（`reference/company-manager-api-reference.md` 参照）

## パターン7: 役職の新規登録・更新

**新規登録時（`termCd` 未設定時）は `startDate`/`endDate` の両方の設定が必須（パターン3参照）。**

```java
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.company.CompanyManager;
import jp.co.intra_mart.foundation.master.company.model.CompanyPost;
import jp.co.intra_mart.foundation.master.company.model.ICompanyPostElement;

public class CompanyPostService {

    private static final Date FAR_FUTURE_DATE = buildFarFutureDate();

    private static Date buildFarFutureDate() {
        final Calendar calendar = Calendar.getInstance();
        calendar.set(3000, Calendar.JANUARY, 1, 0, 0, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    public void register(final String companyCd, final String departmentSetCd, final String postCd, final String postName, final int rank) throws BizApiException {
        final CompanyManager companyManager = new CompanyManager();

        final CompanyPost companyPost = new CompanyPost();
        companyPost.setCompanyCd(companyCd);
        companyPost.setDepartmentSetCd(departmentSetCd);
        companyPost.setPostCd(postCd);
        companyPost.setRank(rank);
        // termCd を設定しない = 新規登録
        companyPost.setStartDate(new Date()); // 新規登録時は startDate/endDate の設定が必須
        companyPost.setEndDate(FAR_FUTURE_DATE);

        final Locale locale = Locale.JAPANESE;
        companyPost.setDefaultLocale(locale);
        final ICompanyPostElement element = companyPost.createLocaleElement();
        element.setPostName(postName);
        companyPost.putLocaleElement(locale, element);

        companyManager.setCompanyPost(companyPost); // termCd 有無で新規/更新判定
    }
}
```

## 注意事項

- **`Company`/`DepartmentSet` は `updateCompany`/`updateDepartmentSet` を持つが、これらは既存レコードの更新専用であり、新規作成はできない。** 標準実装は対象コードを条件とした SQL `UPDATE` のみを発行し、対象が存在しない場合は例外を送出せず何も更新せずに終了する。新規の会社・組織セットが必要な場合は、`importData` またはテナントセットアップ資材経由での投入が前提となる
- **`User`/`Department`/`CompanyPost` の新規登録・更新は、いずれも「専用の登録メソッド + 専用の更新メソッド」ではなく、`termCd` の有無で自動判定される単一メソッド（`set*`）に統一されている。** ただし **新規登録時（`termCd` 未設定時）は `startDate`/`endDate` の両方を明示的に設定する必要がある。** 未設定のまま呼び出すと `BizApiException` が送出される
- **`setUserAttach` の `term` 引数は `null` を許容しない。** 常に `startDate`/`endDate` を設定した `jp.co.intra_mart.foundation.master.common.model.Term` インスタンスを渡す必要がある（新規付与・更新のいずれでも必須）
- **多言語対応が必要なモデル（`User`/`Department`/`CompanyPost`）は、`setDefaultLocale` → `createLocaleElement()` → 各セッタ → `putLocaleElement(locale, element)` の手順を踏まないと、国際化情報（氏名・住所・組織名等）が保存されない。** キー項目（コード類）だけをセットして `set*` を呼んでも、名称等は空のまま登録される
- **`Company` モデルには多言語名称を保持するフィールドが無い。** 会社名の管理方法は要件に応じて別途設計する
- **検索系（`list*`/`search*`/`count*`）は `locale` が必須。** `getUser`/`getCompany` 等の単体取得系は `locale` を省略すると全言語の情報を取得する、という挙動の違いに注意する
- 期間そのもの（開始日・終了日）を変更したい場合は `set*` ではなく、各エンティティに対応する期間操作メソッド（`moveTerm*`/`separateTerm*`/`mergeForwardTerm*`/`mergeBackwardTerm*`）を使う
