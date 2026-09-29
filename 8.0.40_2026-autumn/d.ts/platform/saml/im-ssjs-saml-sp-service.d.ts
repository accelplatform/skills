/**
 * SAML SP サービスクラス。
 *
 * SAML プロファイルのリクエスト・レスポンス処理を実行します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/SAMLSpService/index.html
 */
declare class SAMLSpService {
  /**
   * SAML SP サービスクラスのインスタンスを生成します。
   */
  constructor();

  /**
   * プロファイルのリクエスト処理を実行します。
   * パラメータに request と profId は必須です。
   *
   * @param samlParameters SAML パラメータ
   * @return data に IdP 遷移先情報（SAMLSpServiceRequestModel）を格納した ResultObject
   */
  executeRequestProfile(samlParameters: SAMLParameter): ResultObject<SAMLSpServiceRequestModel>;

  /**
   * プロファイルのレスポンス処理を実行します。
   * パラメータに request と profId は必須です。
   *
   * @param samlParameters SAML パラメータ
   * @return data に IdP 遷移先情報（SAMLSpServiceRequestModel）を格納した ResultObject
   */
  executeResponseProfile(samlParameters: SAMLParameter): ResultObject<SAMLSpServiceRequestModel>;
}
