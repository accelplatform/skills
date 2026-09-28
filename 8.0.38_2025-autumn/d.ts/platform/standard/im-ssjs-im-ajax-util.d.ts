/**
 * ImAjax ライブラリの通信ユーティリティ API。
 *
 * AJAX リクエスト・レスポンスを扱う定数およびメソッドを提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ImAjaxUtil/index.html
 */
declare class ImAjaxUtil {
  /** ブラウザ識別子: Firefox ('Firefox') */
  static readonly IM_AJAX_USER_AGENT_FIREFOX: 'Firefox';
  /** ブラウザ識別子: Internet Explorer ('IE') */
  static readonly IM_AJAX_USER_AGENT_IE: 'IE';
  /** ブラウザ識別子: Netscape ('Netscape') */
  static readonly IM_AJAX_USER_AGENT_NETSCAPE: 'Netscape';
  /** ブラウザ識別子: Opera ('Opera') */
  static readonly IM_AJAX_USER_AGENT_OPERA: 'Opera';
  /** ブラウザ識別子: Safari ('Safari') */
  static readonly IM_AJAX_USER_AGENT_SAFARI: 'Safari';

  /** ImAjax 通信を識別するためのリクエストヘッダ名 ('x-jp-co-intra-mart-ajax-request') */
  static readonly REQUEST_HEADER_NAME_IM_AJAX_REQUEST: 'x-jp-co-intra-mart-ajax-request';
  /** ブラウザ種別を検出するためのリクエストヘッダ名 ('x-jp-co-intra-mart-ajax-user-agent') */
  static readonly REQUEST_HEADER_NAME_IM_AJAX_USER_AGENT: 'x-jp-co-intra-mart-ajax-user-agent';

  /** エラーコードを返却するためのレスポンスヘッダ名 ('x-jp-co-intra-mart-ajax-error-code') */
  static readonly RESPONSE_HEADER_NAME_IM_AJAX_ERROR_CODE: 'x-jp-co-intra-mart-ajax-error-code';
  /** エラーメッセージを返却するためのレスポンスヘッダ名 ('x-jp-co-intra-mart-ajax-error-message') */
  static readonly RESPONSE_HEADER_NAME_IM_AJAX_ERROR_MESSAGE: 'x-jp-co-intra-mart-ajax-error-message';

  /**
   * レスポンスヘッダにエラーコードとメッセージを設定します。
   * メッセージは現在のユーザのロケールで自動取得されます。
   *
   * @param errorCode エラーコード
   * @param messageArgs メッセージ引数
   */
  static setErrorResponseHeaders(errorCode: string, ...messageArgs: string[]): void;
}
