/**
 * データベースユーティリティ API。
 *
 * データベース周りの情報を取得するためのユーティリティクラスです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/DatabaseUtil/index.html
 */
declare class DatabaseUtil {
  /** DB2 */
  static readonly DBTYPE_DB2: number;
  /** SAP HANA */
  static readonly DBTYPE_HANA: number;
  /** Oracle */
  static readonly DBTYPE_ORACLE: number;
  /** PostgreSQL */
  static readonly DBTYPE_POSTGRESQL: number;
  /** SQLServer */
  static readonly DBTYPE_SQLSERVER: number;

  /** バイナリ型 */
  static readonly TYPE_BINARY: number;
  /** 日付型 */
  static readonly TYPE_DATE: number;
  /** 数値型 */
  static readonly TYPE_NUMBER: number;
  /** 文字列型 */
  static readonly TYPE_STRING: number;
  /** タイムスタンプ型 */
  static readonly TYPE_TIMESTAMP: number;

  /**
   * 指定されたテーブルが存在するかを判定します。
   *
   * @param connectId データベース接続ID
   * @param tableName テーブル名
   * @return テーブルが存在する場合 true
   */
  static checkTableExist(connectId: string, tableName: string): boolean;

  /**
   * テーブルのフィールドコメントを取得します。
   *
   * @param connectId データベース接続ID
   * @param tableName テーブル名
   * @return フィールド名をキー、コメントを値としたオブジェクト
   */
  static getColumnComment(connectId: string, tableName: string): DatabaseUtil.ColumnComment;

  /**
   * テーブルのカラム情報を取得します。
   *
   * @param connectId データベース接続ID
   * @param tableName テーブル名
   * @param includeForeignKey 外部キー情報を含める場合 true（デフォルト: false）
   * @return カラム情報
   */
  static getDatabaseColumns(connectId: string, tableName: string, includeForeignKey?: boolean): DatabaseUtil.Result<DatabaseUtil.DatabaseColumns[]>;

  /**
   * データベースの種別を取得します。
   *
   * @param connectId データベース接続ID
   * @return データベース種別（DBTYPE_ORACLE 等の定数値）
   */
  static getDbType(connectId: string): number;

  /**
   * 外部キーを持つフィールド名を取得します。
   *
   * @param connectId データベース接続ID
   * @param tableName テーブル名
   * @return 外部キーフィールド名情報
   */
  static getFKColumnNames(connectId: string, tableName: string): DatabaseUtil.Result<string[]>;

  /**
   * 主キーフィールド名を取得します。
   *
   * @param connectId データベース接続ID
   * @param tableName テーブル名
   * @return 主キーフィールド名情報
   */
  static getPKColumnNames(connectId: string, tableName: string): DatabaseUtil.Result<string[]>;

  /**
   * データベース内の全テーブルのコメントを取得します。
   *
   * @param connectId データベース接続ID
   * @return テーブル名をキー、コメントを値としたオブジェクト
   */
  static getTableComment(connectId: string): DatabaseUtil.Result<DatabaseUtil.TableComment>;

  /**
   * データベース内の全テーブル名を取得します。
   *
   * @param connectId データベース接続ID
   * @return テーブル名情報
   */
  static getTableNames(connectId: string): DatabaseUtil.Result<string[]>;

  /**
   * データベース内の全ビュー名を取得します。
   *
   * @param connectId データベース接続ID
   * @return ビュー名情報
   */
  static getViewNames(connectId: string): DatabaseUtil.Result<string[]>;

  /**
   * フィールドにコメントを設定します。
   *
   * @param connectId データベース接続ID
   * @param tableName テーブル名
   * @param columnName カラム名
   * @param comment コメント
   * @return 処理結果
   */
  static setColumnComment(connectId: string, tableName: string, columnName: string, comment: string): DatabaseUtil.Result<DatabaseUtil.Empty>;

  /**
   * テーブルにコメントを設定します。
   *
   * @param connectId データベース接続ID
   * @param tableName テーブル名
   * @param comment コメント
   * @return 処理結果
   */
  static setTableComment(connectId: string, tableName: string, comment: string): DatabaseUtil.Result<DatabaseUtil.Empty>;
}

declare namespace DatabaseUtil {
  type ColumnComment = { [columnName: string]: string };

  type Result<T> = Result.Success<T> | Result.Failure<T>;

  namespace Result {
    type Success<T> = T & {
      readonly data: T;
      readonly error: false;
      readonly errorCode?: string;
      readonly errorMessage?: string;
    };

    type Failure<T> = {
      readonly className: string;
      readonly data?: unknown;
      readonly error: true;
      readonly errorCode?: string;
      readonly errorMessage: string;
      readonly stackTrace: string;
      readonly localizedMessage: string;
      readonly sqlState?: string;
    };
  }

  type Empty = {};

  type DatabaseColumns = {
    columnName: string;
    columnType: number;
    foreignKey: boolean;
    index: number;
    nullable: boolean;
    precision: number;
    primaryKey: boolean;
    scale: number;
  }

  type TableComment = { [tableName: string]: string };
}
