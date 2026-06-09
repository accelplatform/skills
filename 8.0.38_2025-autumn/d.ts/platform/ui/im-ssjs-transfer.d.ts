/**
 * 画面遷移ユーティリティ API。
 *
 * エラー・情報・警告メッセージ表示画面への遷移機能を提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Transfer/index.html
 */
declare class Transfer {
  /**
   * エラー表示画面に遷移します。
   *
   * @param param 遷移パラメータ（デフォルト status: 500）
   */
  static toErrorPage(param: Transfer.TransferParam): void;

  /**
   * 情報表示画面に遷移します。
   *
   * @param param 遷移パラメータ（デフォルト status: 200）
   */
  static toInformationPage(param: Transfer.TransferParam): void;

  /**
   * 警告表示画面に遷移します。
   *
   * @param param 遷移パラメータ（デフォルト status: 200）
   */
  static toWarningPage(param: Transfer.TransferParam): void;
}

declare namespace Transfer {
  interface TransferParam {
    /** ページタイトル */
    title?: string;
    /** メッセージ */
    message?: string;
    /** 補足メッセージ（文字列または文字列配列） */
    detail?: string | string[];
    /** 戻り先 URL */
    returnUrl?: string;
    /** 戻り先ボタンラベル */
    returnUrlLabel?: string;
    /** 遷移先に渡すパラメータ */
    parameter?: { [key: string]: any };
    /** HTTP レスポンスコード */
    status?: number;
  }
}
