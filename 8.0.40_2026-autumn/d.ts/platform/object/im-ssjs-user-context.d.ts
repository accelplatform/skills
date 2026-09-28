/**
 * ユーザコンテキストオブジェクト。
 *
 * ユーザに関する情報を保持するアクセスコンテキストです。
 * Web 実行環境でのみ取得可能です。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/UserContext/index.html
 */
interface UserContext {
  /** ユーザが所属する全ての組織 */
  readonly allDepartments: UserContext.Department[];
  /** ユーザが所属する全ての組織役職 */
  readonly allPosts: UserContext.DepartmentPost[];
  /** ユーザが所属する全ての会社 */
  readonly companyList: UserContext.Company[];
  /** カレント組織 */
  readonly currentDepartment: UserContext.Department;
  /** 会社別にユーザが所属する全ての組織 */
  readonly departmentByCompany: { [companyCd: string]: UserContext.Department[] };
  /** ユーザの主所属の組織 */
  readonly mainDepartment: UserContext.Department;
  /** ユーザの主所属の組織役職 */
  readonly mainPostList: UserContext.DepartmentPost[];
  /** 会社別にユーザが所属する全ての組織役職 */
  readonly postByCompany: { [companyCd: string]: UserContext.DepartmentPost[] };
  /** ユーザが所属する全てのパブリックグループ */
  readonly publicGroupList: UserContext.PublicGroup[];
  /** ユーザが所属する全てのパブリックグループ役割 */
  readonly publicGroupRoleList: UserContext.PublicGroupRole[];
  /** ユーザが所属するユーザ分類 */
  readonly userCategoryList: UserContext.UserCategory[];
  /** ユーザプロファイル */
  readonly userProfile: UserContext.UserProfile;
}

declare namespace UserContext {
  /**
   * 組織情報。
   * ロケール依存データはログインユーザのロケール → テナントロケール → システムロケールの順で解決される。
   * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/Department/index.html
   */
  interface Department {
    /** 会社コード */
    readonly companyCd: string;
    /** 組織コード */
    readonly departmentCd: string;
    /** 組織名フルパス */
    readonly departmentFullName: string;
    /** 組織名 */
    readonly departmentName: string;
    /** 組織検索名 */
    readonly departmentSearchName: string;
    /** 組織セットコード */
    readonly departmentSetCd: string;
    /** 組織略称 */
    readonly departmentShortName: string;
  }

  /**
   * 組織役職情報。
   * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/DepartmentPost/index.html
   */
  interface DepartmentPost {
    /** 会社コード */
    readonly companyCd: string;
    /** 組織コード */
    readonly departmentCd: string;
    /** 組織名フルパス */
    readonly departmentFullName: string;
    /** 組織名 */
    readonly departmentName: string;
    /** 組織検索名 */
    readonly departmentSearchName: string;
    /** 組織セットコード */
    readonly departmentSetCd: string;
    /** 組織略称 */
    readonly departmentShortName: string;
    /** 役職コード */
    readonly postCd: string;
    /** 役職名 */
    readonly postName: string;
    /** ランク */
    readonly rank: number;
  }

  /**
   * 会社情報。
   * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/Company/index.html
   */
  interface Company {
    /** 会社コード */
    readonly companyCd: string;
    /** 会社名 */
    readonly companyName: string;
    /** 会社検索名 */
    readonly companySearchName: string;
    /** 会社略称 */
    readonly companyShortName: string;
  }

  /**
   * パブリックグループ情報。
   * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/PublicGroup/index.html
   */
  interface PublicGroup {
    /** パブリックグループコード */
    readonly publicGroupCd: string;
    /** パブリックグループ名フルパス */
    readonly publicGroupFullName: string;
    /** パブリックグループ名 */
    readonly publicGroupName: string;
    /** パブリックグループ検索名 */
    readonly publicGroupSearchName: string;
    /** パブリックグループセットコード */
    readonly publicGroupSetCd: string;
    /** パブリックグループ略称 */
    readonly publicGroupShortName: string;
  }

  /**
   * パブリックグループ役割情報。
   * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/PublicGroupRole/index.html
   */
  interface PublicGroupRole {
    /** パブリックグループコード */
    readonly publicGroupCd: string;
    /** パブリックグループ名フルパス */
    readonly publicGroupFullName: string;
    /** パブリックグループ名 */
    readonly publicGroupName: string;
    /** パブリックグループ検索名 */
    readonly publicGroupSearchName: string;
    /** パブリックグループセットコード */
    readonly publicGroupSetCd: string;
    /** パブリックグループ略称 */
    readonly publicGroupShortName: string;
    /** ランク */
    readonly rank: number;
    /** 役割コード */
    readonly roleCd: string;
    /** 役割名 */
    readonly roleName: string;
  }

  /**
   * ユーザ分類情報。
   * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/UserCategory/index.html
   */
  interface UserCategory {
    /** 分類コード */
    readonly categoryCd: string;
    /** 分類項目コード */
    readonly categoryItemCd: string;
    /** 分類項目名 */
    readonly categoryItemName: string;
    /** 分類名 */
    readonly categoryName: string;
  }

  /**
   * ユーザプロファイル情報。
   * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/UserProfile/index.html
   */
  interface UserProfile {
    /** 住所1 */
    readonly address1: string;
    /** 住所2 */
    readonly address2: string;
    /** 住所3 */
    readonly address3: string;
    /** 国コード */
    readonly countryCd: string;
    /** メールアドレス1 */
    readonly emailAddress1: string;
    /** メールアドレス2 */
    readonly emailAddress2: string;
    /** 内線FAX番号 */
    readonly extensionFaxNumber: string;
    /** 内線番号 */
    readonly extensionNumber: string;
    /** FAX番号 */
    readonly faxNumber: string;
    /** 携帯メールアドレス */
    readonly mobileEmailAddress: string;
    /** 携帯電話番号 */
    readonly mobileNumber: string;
    /** 備考 */
    readonly notes: string;
    /** 性別 */
    readonly sex: string;
    /** 電話番号 */
    readonly telephoneNumber: string;
    /** URL */
    readonly url: string;
    /** ユーザコード */
    readonly userCd: string;
    /** ユーザ名 */
    readonly userName: string;
    /** ユーザ検索名 */
    readonly userSearchName: string;
    /** 郵便番号 */
    readonly zipCode: string;
  }
}
