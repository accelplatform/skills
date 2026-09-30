/**
 * 案件添付ファイル情報オブジェクト。
 *
 * 案件で処理時に添付したファイル情報を保存するオブジェクトです。
 * 処理結果を格納する際に、このオブジェクトには案件のステータス（未完了、完了、過去）によって、
 * データベーステーブル「imw_t_actv_matter_attach_file」（未完了）、「imw_t_cpl_matter_attach_file」（完了）もしくは
 * 「imw_ayyyymm_matter_attach_file」（過去）のデータが設定されます。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/MatterAttachFileInfo/index.html
 */
interface MatterAttachFileInfo {
  // --- NOT NULL プロパティ ---

  /** 権限者コード */
  readonly authUserCode: string;
  /** 登録日時（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  readonly createDateTime: string;
  /** ストレージ下ファイルパス */
  readonly filePath: string;
  /** ファイルサイズ */
  readonly fileSize: string;
  /** ロケールID */
  readonly localeId: string;
  /** 実ファイル名 */
  readonly realFileName: string;
  /** システムファイル名 */
  readonly systemFileName: string;

  // --- NULLABLE プロパティ ---

  /** 権限者名 */
  readonly authUserName?: string;
}
