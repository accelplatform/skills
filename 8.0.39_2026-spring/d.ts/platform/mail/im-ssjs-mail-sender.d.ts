/**
 * メール送信クラス。
 *
 * SMTP によるメール送信機能を提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/MailSender/index.html
 */
declare class MailSender {
  /**
   * MailSender クラスのインスタンスを作成します。
   *
   * @param localeId ロケールID（省略時はデフォルト）
   * @param serverId SMTP サーバID（省略時はデフォルト）
   */
  constructor(localeId?: string, serverId?: string);

  /**
   * 添付ファイルを追加します。
   *
   * @param filename ファイル名
   * @param file ストレージオブジェクト
   */
  addAttachment(filename: string, file: Storage): void;

  /**
   * Bcc アドレスを追加します。
   *
   * @param address メールアドレス
   * @param personal 宛先名
   */
  addBcc(address: string, personal?: string): void;

  /**
   * Cc アドレスを追加します。
   *
   * @param address メールアドレス
   * @param personal 宛先名
   */
  addCc(address: string, personal?: string): void;

  /**
   * カスタムメールヘッダを追加します。
   *
   * @param name ヘッダ名
   * @param value ヘッダ値
   */
  addHeader(name: string, value: string): void;

  /**
   * HTML メール用インライン画像を追加します。
   *
   * @param filename ファイル名
   * @param storage ストレージオブジェクト
   * @param contentId Content-ID
   */
  addHTMLImage(filename: string, storage: Storage, contentId: string): void;

  /**
   * 返信先アドレスを追加します。
   *
   * @param replyTo 返信先メールアドレス
   */
  addReplyTo(replyTo: string): void;

  /**
   * 宛先（To）アドレスを追加します。
   *
   * @param address メールアドレス
   * @param personal 宛先名
   */
  addTo(address: string, personal?: string): void;

  /**
   * エラーメッセージを取得します。
   *
   * @return エラーメッセージ文字列
   */
  getErrorMessage(): string;

  /**
   * メールを送信します。
   *
   * @return 成功した場合 true、失敗した場合 false
   */
  send(): boolean;

  /**
   * 送信元アドレスを設定します。
   *
   * @param address メールアドレス
   * @param personal 送信者名
   */
  setFrom(address: string, personal?: string): void;

  /**
   * HTML 形式の本文を設定します。
   *
   * @param html HTML 本文
   */
  setHTML(html: string): void;

  /**
   * メール件名を設定します。
   *
   * @param subject 件名
   */
  setSubject(subject: string): void;

  /**
   * テキスト本文を設定します。
   *
   * @param text 本文テキスト
   */
  setText(text: string): void;
}
