/**
 * 案件操作権限者情報オブジェクト。
 *
 * 案件操作を行う権限者のユーザ情報とその権限情報を保存します。
 * 処理結果を格納する際に、このオブジェクトには案件のステータス（未完了案件、完了案件）によって、
 * データベーステーブル「imw_t_actv_matter_handle_user」（未完了案件）もしくは
 * 「imw_t_cpl_matter_handle_user」（完了案件）のデータが設定されます。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * このオブジェクトは値を取得する時にのみ使用しますので、全て任意項目となります。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/MatterHandleAuthUserInfo/index.html
 */
interface MatterHandleAuthUserInfo {
  // --- NOT NULL プロパティ ---

  /** ロケールID */
  readonly localeId: string;
  /** ユーザコード */
  readonly userCode: string;

  // --- NULLABLE プロパティ ---

  /** 処理対象者変更可否フラグ（'0': 否 / '1': 可） */
  readonly changeUserFlag?: FlagStatus;
  /** 動的処理ノード削除可否フラグ（'0': 否 / '1': 可） */
  readonly deleteDynamicNodeFlag?: FlagStatus;
  /** 処理対象者展開可否フラグ（'0': 否 / '1': 可） */
  readonly expandUserFlag?: FlagStatus;
  /** 操作レベル */
  readonly handleLevel?: HandleLevel;
  /** 案件操作後進可否フラグ（'0': 否 / '1': 可） */
  readonly handleMoveBackwardFlag?: FlagStatus;
  /** 案件操作前進可否フラグ（'0': 否 / '1': 可） */
  readonly handleMoveForwardFlag?: FlagStatus;
  /** 案件操作終了可否フラグ（'0': 否 / '1': 可） */
  readonly handleTerminateFlag?: FlagStatus;
  /** 横配置ノード設定可否フラグ（'0': 否 / '1': 可） */
  readonly horizontalNodeConfigFlag?: FlagStatus;
  /** 保留解除可否フラグ（'0': 否 / '1': 可） */
  readonly reserveCancelFlag?: FlagStatus;
  /** 動的処理ノード復活可否フラグ（'0': 否 / '1': 可） */
  readonly undeleteDynamicNodeFlag?: FlagStatus;
  /** ユーザ名 */
  readonly userName?: string;
  /** 縦配置ノード設定可否フラグ（'0': 否 / '1': 可） */
  readonly verticalNodeConfigFlag?: FlagStatus;
}
