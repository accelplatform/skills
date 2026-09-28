/**
 * 起票用パラメータ情報オブジェクト。
 *
 * 案件の起票処理を行う際に必要なパラメータデータを保持します。
 * ApplyManager#draft() に引数として渡します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/DraftParamInfo/index.html
 */
interface DraftParamInfo {
  // --- 必須項目 ---

  /** フローID（最大20バイト） */
  flowId: string;
  /** 案件名（最大200バイト） */
  matterName: string;
  /** 申請基準日（'yyyy/MM/dd' 形式） */
  applyBaseDate: string;
  /** 起票者コード（最大100バイト） */
  draftUserCode: string;

  // --- 任意項目 ---

  /** ユーザデータID（最大20バイト） */
  userDataId?: string;
  /** 案件番号（最大20バイト） */
  matterNumber?: string;
  /** 優先度（最大1バイト） */
  priorityLevel?: PriorityLevel;
  /** 処理対象者情報（プラグイン情報）オブジェクトの配列 */
  applyUserPlugin?: PluginInfo[];
}
