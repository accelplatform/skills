/**
 * ノード進捗情報オブジェクト。
 *
 * ノードの進捗情報を格納するオブジェクトです。
 * 使用される箇所によって、取得された進捗ファイル情報 XML「progress.xml」から該当するノード情報がマッピングされます。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/NodeProgressInfo/index.html
 */
interface NodeProgressInfo {
  // --- NOT NULL プロパティ ---

  /** 権限者コード */
  readonly authUserCode: string;
  /** ノードID */
  readonly nodeId: string;
  /** 開始日（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  readonly startDate: string;
  /** タスクステータス */
  readonly status: TaskStatus;

  // --- NULLABLE プロパティ ---

  /** 権限者会社コード */
  readonly authCompanyCode?: string;
  /** 権限者組織コード */
  readonly authOrgzCode?: string;
  /** 権限者組織セットコード */
  readonly authOrgzSetCode?: string;
  /** コメント */
  readonly comment?: string;
  /** 終了日（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  readonly endDate?: string;
  /** 実行者コード */
  readonly executeUserCode?: string;
  /** 操作者コード */
  readonly operateUserCode?: string;
  /** 処理時間 */
  readonly processTime?: string;
}
