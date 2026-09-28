/**
 * 外部ユーザコンテキストオブジェクト。
 *
 * 外部ユーザに関する情報を保持するアクセスコンテキストです。
 * Web 実行環境でのみ取得可能です。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ExternalUserContext/index.html
 */
interface ExternalUserContext {
  /** 外部ユーザかどうか。外部ユーザの場合 true */
  readonly externalUser: boolean;
}
