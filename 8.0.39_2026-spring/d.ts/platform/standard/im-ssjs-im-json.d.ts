/**
 * JSON 関連 API。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ImJson/index.html
 */
declare class ImJson {
  /** インデント文字列（' '） */
  static readonly INDENT_STRING: ' ';
  /** JSON パースエラーメッセージ（'parseJSON Error'） */
  static readonly PARSE_JSON_ERROR_MESSAGE: 'parseJSON Error';

  /** 型注釈: Array */
  static readonly TYPE_ARRAY: string;
  /** 型注釈: BigDecimal */
  static readonly TYPE_BIG_DECIMAL: string;
  /** 型注釈: BigInteger */
  static readonly TYPE_BIG_INTEGER: string;
  /** 型注釈: Boolean */
  static readonly TYPE_BOOLEAN: string;
  /** 型注釈: Date */
  static readonly TYPE_DATE: string;
  /** 型注釈: Function */
  static readonly TYPE_FUNCTION: string;
  /** 型注釈: Java オブジェクト */
  static readonly TYPE_JAVA: string;
  /** 型注釈: Null */
  static readonly TYPE_NULL: string;
  /** 型注釈: Number */
  static readonly TYPE_NUMBER: string;
  /** 型注釈: Object */
  static readonly TYPE_OBJECT: string;
  /** 型注釈: String */
  static readonly TYPE_STRING: string;
  /** 型注釈: Undefined */
  static readonly TYPE_UNDEFINED: string;
  /** 型注釈: Unknown（型判定不能） */
  static readonly TYPE_UNKNOWN: string;
  /** 型注釈: XML */
  static readonly TYPE_XML: string;

  /**
   * JSON 文字列の構文を検証します。
   *
   * @param jsonString JSON 文字列
   * @return 有効な場合 true
   */
  static checkJSONString(jsonString: string): boolean;

  /**
   * JSON 文字列を JavaScript オブジェクトに変換します。
   *
   * @param jsonString JSON 文字列
   * @return JavaScript オブジェクト
   * @throws SyntaxError 変換失敗時
   */
  static parseJSON(jsonString: string): ImJson.Data;

  /**
   * JavaScript オブジェクトを JSON 文字列に変換します。
   * debug=true の場合、戻り値は checkJSONString() で検証できません。
   *
   * @param value 変換するオブジェクト
   * @param debug true の場合、インデントと型注釈を付加
   * @return JSON 文字列
   */
  static toJSONString(value: ImJson.Data, debug?: boolean): string;
}

declare namespace ImJson {
  type Data = any;
}
