/**
 * JSON スキーマ検証クラス。
 *
 * JSON データを JSON スキーマに基づいて検証します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/JsonSchemaValidator/index.html
 */
declare class JsonSchemaValidator {
  /**
   * JSON スキーマ検証クラスのインスタンスを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   *
   * @param jsonSchema JSON スキーマオブジェクト
   */
  constructor(jsonSchema: JsonSchemaValidator.JsonSchema);

  /**
   * JSON スキーマ検証クラスのインスタンスを生成します。
   * フォーマット検証は行いません。
   *
   * @param jsonSchema JSON スキーマオブジェクト
   * @param localeId ロケールID
   */
  constructor(jsonSchema: JsonSchemaValidator.JsonSchema, localeId: string);

  /**
   * JSON スキーマ検証クラスのインスタンスを生成します。
   *
   * @param jsonSchema JSON スキーマオブジェクト
   * @param localeId ロケールID
   * @param formatAssertionsEnabled フォーマット検証有効フラグ
   */
  constructor(jsonSchema: JsonSchemaValidator.JsonSchema, localeId: string, formatAssertionsEnabled: boolean);

  /**
   * JSON 文字列がスキーマに適合するか検証します。
   *
   * @param json 検証対象の JSON 文字列
   * @return data にスキーマ適合結果を格納（true: 適合）
   */
  isValidJson(json: string): ResultObject<boolean>;

  /**
   * JSON 文字列を検証し、詳細なエラー情報を返します。
   *
   * @param json 検証対象の JSON 文字列
   * @return data に SchemaValidationError の配列を格納した ResultObject
   */
  validateJson(json: string): ResultObject<SchemaValidationError[]>;
}

declare namespace JsonSchemaValidator {
  type JsonSchema = object;
}
