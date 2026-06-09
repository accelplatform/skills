/**
 * タスク権限者組織情報オブジェクト。
 *
 * 未完了案件に対する処理権限者の所属組織情報を保持します。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ActvExecutableUserOrgzInfo/index.html
 */
interface ActvExecutableUserOrgzInfo {
  // --- NOT NULL プロパティ ---

  /** 権限者コード */
  readonly authUserCode: string;
  /** ロケールID */
  readonly localeId: string;
  /** 連番 */
  readonly no: string;
  /** ノードID */
  readonly nodeId: string;
  /** システム案件ID */
  readonly systemMatterId: string;

  // --- NULLABLE プロパティ ---

  /** 権限者会社コード */
  readonly authCompanyCode?: string;
  /** 権限者会社名 */
  readonly authCompanyName?: string;
  /** 権限者組織コード */
  readonly authOrganizationCode?: string;
  /** 権限者組織名 */
  readonly authOrganizationName?: string;
  /** 権限者組織セットコード */
  readonly authOrganizationSetCode?: string;
}
