/**
 * SOAP クライアントクラス。
 *
 * SOAP/WSDL ベースの Web サービスを呼び出すためのクラスです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/SOAPClient/index.html
 */
declare class SOAPClient {
  /**
   * URL で指定した WSDL から、SOAPClient クラスのインスタンスを生成します。
   *
   * @param wsdlUrl WSDL の URL
   * @param serviceName サービス名
   * @param portName ポート名
   * @param endpoint エンドポイント URL
   */
  constructor(wsdlUrl: string, serviceName?: string, portName?: string, endpoint?: string);

  /**
   * File オブジェクトで指定した WSDL から、SOAPClient クラスのインスタンスを生成します。
   *
   * @param wsdlOnAppRuntime WSDL ファイル
   * @param serviceName サービス名
   * @param portName ポート名
   * @param endpoint エンドポイント URL
   */
  constructor(wsdlOnAppRuntime: File, serviceName?: string, portName?: string, endpoint?: string);

  /**
   * パブリックストレージの WSDL から、SOAPClient クラスのインスタンスを生成します。
   *
   * @param wsdlOnStorage WSDL ストレージ
   * @param serviceName サービス名
   * @param portName ポート名
   * @param endpoint エンドポイント URL
   */
  constructor(wsdlOnStorage: PublicStorage, serviceName?: string, portName?: string, endpoint?: string);

  /**
   * Axis2 のリソースをクリーンアップします。
   */
  cleanup(): void;

  /**
   * 利用可能なオペレーション名の配列を返却します。
   *
   * @return オペレーション名の配列
   */
  getOperationNames(): string[];

  /**
   * Web サービス呼び出しのサンプルコードを返却します。
   *
   * @param operationName オペレーション名
   * @return サンプルコード文字列
   */
  getSampleCode(operationName?: string): string;

  /**
   * SOAP メッセージの文字セットを設定します。
   *
   * @param charset 文字セット名（デフォルト: UTF-8）
   */
  setCharacterSetEncoding(charset: string): void;

  /**
   * MTOM の有効・無効を設定します。
   *
   * @param bool 有効にする場合 true
   */
  setEnableMTOM(bool: boolean): void;

  /**
   * タイムアウト値を設定します。
   *
   * @param timeOutInMilliSeconds タイムアウト値（ミリ秒）
   */
  setTimeOutInMilliSeconds(timeOutInMilliSeconds: number): void;

  /** オペレーション呼び出し（動的メソッド） */
  [operationName: string]: (...args: any[]) => any;
}
