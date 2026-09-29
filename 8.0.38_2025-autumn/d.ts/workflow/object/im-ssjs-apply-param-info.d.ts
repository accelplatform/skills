/**
 * 申請用パラメータ情報オブジェクト。
 *
 * 案件の申請処理を行う際に必要なパラメータデータを保持します。
 * ApplyManager#apply() に引数として渡します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ApplyParamInfo/index.html
 */
interface ApplyParamInfo {
  // --- 必須項目 ---

  /** 申請権限者コード（最大100バイト） */
  applyAuthUserCode: string;
  /** 申請基準日（'yyyy/MM/dd' 形式） */
  applyBaseDate: string;
  /** 申請実行者コード（最大100バイト） */
  applyExecuteUserCode: string;
  /** フローID（最大20バイト） */
  flowId: string;
  /** 案件名（最大200バイト） */
  matterName: string;

  // --- 任意項目 ---

  /** 動的・確認ノード設定情報の配列 */
  DCNodeConfigModels?: DynamicAndCnfmNodeConfigInfo[];
  /** 横配置・縦配置ノード設定情報の配列 */
  HVNodeConfigModels?: HorizontalAndVerticalNodeConfigInfo[];
  /** 権限者会社コード（最大100バイト） */
  applyAuthCompanyCode?: string;
  /** 権限者組織コード（最大100バイト） */
  applyAuthOrgzCode?: string;
  /** 権限者組織セットコード（最大100バイト） */
  applyAuthOrgzSetCode?: string;
  /** 分岐先選択情報の配列 */
  branchSelectModels?: BranchSelectInfo[];
  /** 案件番号（最大20バイト） */
  matterNumber?: string;
  /** 根回し情報 */
  nego?: NegoModelInfo;
  /** 優先度（最大1バイト） */
  priorityLevel?: PriorityLevel;
  /** 処理コメント（最大2000バイト） */
  processComment?: string;
  /** 添付ファイル一時領域ディレクトリキー */
  tempDirKey?: string;
  /** ユーザデータID（最大20バイト） */
  userDataId?: string;
}
