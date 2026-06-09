/**
 * ショートカットマネージャ。
 *
 * ショートカット情報の参照、更新を行います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/ShortCutManager/index.html
 */
declare class ShortCutManager {
  /**
   * ショートカットマネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * システム日付に指定日数を加算した日付を返します。
   *
   * @param countDays 加算する日数
   * @return 加算後の日付
   */
  addValidEndDate(countDays: number): Date;

  /**
   * ショートカット情報を登録します。
   *
   * @param shortCutInfo ショートカット情報
   * @return 新規登録されたショートカットID
   */
  createShortCut(shortCutInfo: ShortCutInfo): string;

  /**
   * 指定ID のショートカット情報を削除します。
   *
   * @param shortCutId ショートカットID
   * @return 成功した場合 true、失敗した場合 false
   */
  deleteShortCut(shortCutId: string): boolean;

  /**
   * エラー時の表示ページパスを取得します。
   *
   * @return エラーページパス
   */
  getErrorPage(): string;

  /**
   * メインページのパスを取得します。
   *
   * @return メインページパス
   */
  getMainPage(): string;

  /**
   * 指定ID のショートカット情報を取得します。
   *
   * @param shortCutId ショートカットID
   * @return ショートカット情報
   */
  getShortCutInfo(shortCutId: string): ShortCutInfo;

  /**
   * ユーザがショートカットにアクセス可能かを判定します。
   *
   * @param shortCutInfo ショートカット情報
   * @param userId ユーザID
   * @return アクセス可能な場合 true
   */
  isAllowUser(shortCutInfo: ShortCutInfo, userId: string): boolean;

  /**
   * 指定日付で無効なショートカットを削除します。
   *
   * @param verifyDate 検証日付
   * @return 削除された件数
   */
  verifyShortCut(verifyDate: Date): number;
}
