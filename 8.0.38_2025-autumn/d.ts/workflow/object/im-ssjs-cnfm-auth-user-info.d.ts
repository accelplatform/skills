/**
 * 確認処理権限者情報オブジェクト。
 *
 * 確認を行う権限者のユーザ情報と付加情報を保存します。
 * このオブジェクトには案件のステータス（未完了、完了）によって、
 * データベーステーブル「imw_t_confirm_user」（未完了）もしくは
 * 「imw_t_cpl_matter_confirm_user」（完了）のデータが設定されます。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/CnfmAuthUserInfo/index.html
 */
interface CnfmAuthUserInfo {
  // --- NOT NULL プロパティ ---

  /** 権限者コード */
  readonly userCode: string;

  // --- NULLABLE プロパティ ---

  /** 確認済みフラグ（'0': 未確認 / '1': 確認済） */
  readonly confirmCplFlag?: FlagStatus;
  /** 権限者名 */
  readonly userName?: string;
}
