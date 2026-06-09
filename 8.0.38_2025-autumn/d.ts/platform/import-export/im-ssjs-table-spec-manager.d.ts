/**
 * テーブル仕様マネージャ。
 *
 * DDL 定義に含まれないテーブル・フィールドの拡張仕様（論理名、説明等）を管理します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/TableSpecManager/index.html
 */
declare class TableSpecManager {
  /**
   * テーブル情報オブジェクトを全て XML 文字列で抽出します。
   *
   * @param ignoreTextareaFlag true でテキストエリア情報を除外（デフォルト: false）
   * @return XML 文字列。失敗した場合 null
   */
  static exportXml(ignoreTextareaFlag?: boolean): string | null;

  /**
   * 指定された物理名に対応するテーブル情報オブジェクトを取得します。
   *
   * @param tableName テーブル物理名
   * @return テーブル情報オブジェクト
   */
  static getInfo(tableName: string): TableSpecManager.TableSpec;

  /**
   * テーブル情報を XML 形式で一括インポートします。
   *
   * @param xmlString XML 文字列
   * @return data に XML インポート処理結果を格納したオブジェクト
   */
  static importXml(xmlString: string): TableSpecManager.Result<TableSpecManager.Empty>;

  /**
   * テーブル情報を登録または更新します。
   *
   * @param table テーブル情報オブジェクト
   * @return data にテーブル情報の登録・更新処理結果を格納したオブジェクト
   */
  static setInfo(table: TableSpecManager.TableSpec): TableSpecManager.Result<TableSpecManager.Empty>;
}

declare namespace TableSpecManager {
  type Result<T> = Result.Success<T> | Result.Failure<T>;

  namespace Result {
    type Success<T> = T & {
      className?: string;
      error: false;
      errorCode?: string;
      errorMessage?: string;
    };

    type Failure<T> = {
      className: string;
      error: true;
      errorCode?: string;
      errorMessage: string;
      localizedMessage: string;
      sqlState?: string;
      stackTrace: string;
    };
  }

  type Empty = {};

  interface FieldSpec {
    /** カラム物理名 */
    columnName: string;
    /** 多言語対応の表示名・備考 */
    i18n: {
      [localeId: string]: {
        /** 表示名 */
        caption: string;
        /** 備考 */
        note?: string;
      };
    };
    /** テキストエリアフラグ */
    textarea: boolean;
  }

  interface TableSpec {
    /** フィールド仕様の配列 */
    fields: FieldSpec[];
    /** 多言語対応の表示名・備考 */
    i18n: {
      [localeId: string]: {
        /** 表示名 */
        caption: string;
        /** 備考 */
        note?: string;
      };
    };
    /** テーブル物理名 */
    tableName: string;
  }
}
