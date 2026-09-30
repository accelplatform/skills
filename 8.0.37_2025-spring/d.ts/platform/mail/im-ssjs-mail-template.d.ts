/**
 * メールテンプレート API。
 *
 * メールテンプレートの取得・処理・保存機能を提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/MailTemplate/index.html
 */
declare class MailTemplate {
  /**
   * 指定されたメールテンプレートの情報を取得します。
   *
   * @param path テンプレートファイルの相対パス
   * @param localeId ロケールID
   * @return data にメールテンプレート情報（TemplateInfo）を格納した ResultObject
   */
  static getTemplate(path: string, localeId: string): ResultObject<TemplateInfo>;

  /**
   * メールテンプレートの処理を行います。
   * テンプレート変数をパラメータで置換した結果を返します。
   *
   * @param path テンプレートファイルの相対パス
   * @param localeId ロケールID
   * @param parameters テンプレート変数の置換パラメータ
   * @return data にテンプレート処理結果（ProcessResult）を格納した ResultObject
   */
  static process(path: string, localeId: string, parameters: MailTemplate.Parameters): ResultObject<MailTemplate.ProcessResult>;

  /**
   * 指定されたメールテンプレートの情報を保存します。
   *
   * @param path テンプレートファイルの相対パス
   * @param localeId ロケールID
   * @param template テンプレート情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  static saveTemplate(path: string, localeId: string, template: TemplateInfo): ResultObject<null>;
}

declare namespace MailTemplate {
  type Parameters = { [key: string]: string | number | boolean };

  interface ProcessResult {
    /** 送信元アドレス情報 */
    readonly from: TemplateAddressInfo;
    /** 宛先（To）アドレス情報の配列 */
    readonly to: TemplateAddressInfo[];
    /** Cc アドレス情報の配列 */
    readonly cc: TemplateAddressInfo[];
    /** Bcc アドレス情報の配列 */
    readonly bcc: TemplateAddressInfo[];
    /** 返信先アドレス情報の配列 */
    readonly replyTo: TemplateAddressInfo[];
    /** 件名 */
    readonly subject: string;
    /** メール本文情報 */
    readonly body: TemplateBodyInfo;
    /** ヘッダ情報の配列 */
    readonly headers: TemplateHeaderInfo[];
  }
}
