/**
 * ユーザ一時保存案件情報オブジェクト。
 *
 * 一時案件情報の取得処理で、処理結果である案件情報を保存するためのオブジェクトです。
 * データベーステーブル「imw_t_temporary_save」のデータが設定されます。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/TempSaveMatterInfo/index.html
 */
interface TempSaveMatterInfo {
  // --- NOT NULL プロパティ ---

  /** 権限者コード */
  readonly authUserCode: string;
  /** フローID */
  readonly flowId: string;
  /** フローバージョンID */
  readonly flowVersionId: string;
  /** 申請ノードID */
  readonly nodeId: string;
  /** 保存日（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  readonly saveDate: string;
  /** ユーザデータID */
  readonly userDataId: string;

  // --- NULLABLE プロパティ ---

  /** 代理フラグ（'0': 代理設定なし / '1': 代理設定あり） */
  readonly actFlag?: FlagStatus;
  /** 申請基準日（'yyyy/MM/dd' 形式の文字列） */
  readonly applyBaseDate?: string;
  /** 権限者名 */
  readonly authUserName?: string;
  /** フロー名 */
  readonly flowName?: string;
  /** 案件名 */
  readonly matterName?: string;
  /** ユーザデータ案件プロパティオブジェクトの配列 */
  readonly matterProperty?: UserMatterPropertyInfo[];
  /** 処理コメント */
  readonly processComment?: string;
  /** 保存ユーザコード */
  readonly saveUserCode?: string;
}
