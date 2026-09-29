/**
 * 代理先情報オブジェクト。
 *
 * 特定ユーザ代理先一覧の取得結果を保存します。
 * データベーステーブル「imw_t_act」のデータが設定されます。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/TargetPersActInfo/index.html
 */
interface TargetPersActInfo {
  // --- NOT NULL プロパティ ---

  /** 連番 */
  readonly no: string;

  // --- NULLABLE プロパティ ---

  /** 申請権限（'0': 権限なし / '1': 権限付与） */
  readonly applyAuth?: FlagStatus;
  /** 承認権限（'0': 権限なし / '1': 権限付与） */
  readonly approveAuth?: FlagStatus;
  /** 拡張ポイントID */
  readonly extensionPointId?: string;
  /** 代理期間終了日（'yyyy/MM/dd' 形式の文字列） */
  readonly limitDate?: string;
  /** 備考 */
  readonly note?: string;
  /** 代理元ユーザコード */
  readonly originalActUserCode?: string;
  /** パラメータ */
  readonly parameter?: string;
  /** プラグインID */
  readonly pluginId?: string;
  /** 代理期間開始日（'yyyy/MM/dd' 形式の文字列） */
  readonly startDate?: string;
  /** 代理先ユーザコード */
  readonly targetActUserCode?: string;
}
