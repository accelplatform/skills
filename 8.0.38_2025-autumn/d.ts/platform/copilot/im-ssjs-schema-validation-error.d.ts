/**
 * スキーマバリデーションエラー情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/SchemaValidationError/index.html
 */
interface SchemaValidationError {
  /** スキーマ内の評価パス */
  readonly evaluationPath: string;
  /** エラーメッセージ */
  readonly message: string;
  /** バリデーション失敗したプロパティ名 */
  readonly propertyName: string;
  /** エラー種別 */
  readonly type: string;
  /** 詳細エラーコード */
  readonly validationCode: string;
  /** バリデーション失敗した値 */
  readonly value: string;
}
