/**
 * デバッグ情報出力 API。
 *
 * ブラウザ、コンソール、ファイルへの出力 API を提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Debug/index.html
 */
declare class Debug {
  /**
   * 変数情報をブラウザ画面に表示します。
   * このメソッド実行後、処理は停止します。
   *
   * 注意: try...catch 文の中では使用できません。
   *
   * @param args 表示対象となる変数
   */
  static browse(...args: any[]): void;

  /**
   * オブジェクトの内容を JSON 形式でコンソールに出力します。
   *
   * JSON の正式形式でないプロパティは表示されません。
   * Array 型オブジェクトに設定されたプロパティは表示されません。
   *
   * @param args 表示対象となる変数
   */
  static console(...args: any[]): void;

  /**
   * メッセージをコンソールに出力します。
   *
   * @param message メッセージ
   */
  static print(message: string): void;

  /**
   * メッセージをファイルに書き込みます。
   * ホームディレクトリ（デフォルトは WEB-INF 直下）の debug.txt に追記されます。
   *
   * @param message メッセージ
   */
  static write(message: string): void;
}
