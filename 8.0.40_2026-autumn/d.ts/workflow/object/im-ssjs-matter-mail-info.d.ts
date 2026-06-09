/**
 * 案件メール定義情報オブジェクト。
 *
 * 各ノードで処理種別によって使用されるメール情報を保存するオブジェクトです。
 * 案件フロー情報オブジェクト（MatterFlowInfo）の最終結果通知メール、参照依頼メールや
 * 案件ノード設定情報オブジェクト（MatterNodeConfigInfo）の各メール定義情報を保存します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/MatterMailInfo/index.html
 */
interface MatterMailInfo {
  // --- NULLABLE プロパティ ---

  /** メール設定ID */
  readonly mailId?: string;
  /** メールテンプレートパス */
  readonly mailTemplatePath?: string;
  /** メール種別 */
  readonly mailType?: MailType;
}
