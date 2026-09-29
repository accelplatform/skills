/**
 * 案件確認履歴情報オブジェクト。
 *
 * 案件で確認を行なったノードの履歴を保存するオブジェクトです。
 * 処理結果を格納する際に、このオブジェクトには案件のステータス（未完了、完了、過去）によって、
 * データベーステーブル「imw_t_confirm」（未完了）、「imw_t_cpl_matter_confirm」（完了）もしくは
 * 「imw_ayyyymm_matter_confirm」（過去）のデータが設定されます。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/MatterCnfmHistoryInfo/index.html
 */
interface MatterCnfmHistoryInfo {
  // --- NOT NULL プロパティ ---

  /** 到達日時（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  readonly arrivedDate: string;
  /** 確認日時（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  readonly confirmDate: string;
  /** ロケールID */
  readonly localeId: string;
  /** 連番 */
  readonly no: string;
  /** ノードID */
  readonly nodeId: string;
  /** 確認者コード */
  readonly userCode: string;

  // --- NULLABLE プロパティ ---

  /** 確認者会社コード */
  readonly companyCode?: string;
  /** 確認者会社名 */
  readonly companyName?: string;
  /** 確認コメント */
  readonly confirmComment?: string;
  /** 確認者組織コード */
  readonly orgzCode?: string;
  /** 確認者組織名 */
  readonly orgzName?: string;
  /** 確認者組織セットコード */
  readonly orgzSetCode?: string;
  /** 確認者名 */
  readonly userName?: string;
}
