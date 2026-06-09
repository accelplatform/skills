/**
 * SQL パラメータクラス。
 *
 * データベース操作時の SQL パラメータを管理します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/DbParameter/index.html
 */
declare class DbParameter {
  /** null 値（ストアドプロシージャ用） */
  static readonly NULL: number;
  /** 文字列型 */
  static readonly TYPE_STRING: number;
  /** 数値型 */
  static readonly TYPE_NUMBER: number;
  /** 日付型 */
  static readonly TYPE_DATE: number;
  /** タイムスタンプ型 */
  static readonly TYPE_TIMESTAMP: number;
  /** 時刻型 */
  static readonly TYPE_TIME: number;
  /** ブーリアン型 */
  static readonly TYPE_BOOLEAN: number;
  /** バイナリ型 */
  static readonly TYPE_BINARY: number;
  /** BLOB 型 */
  static readonly TYPE_BLOB: number;
  /** CLOB 型 */
  static readonly TYPE_CLOB: number;
  /** NVARCHAR 型 */
  static readonly TYPE_NSTRING: number;
  /** CHAR 型 */
  static readonly TYPE_CHAR: number;
  /** BIGINT 型（ストアドプロシージャ用） */
  static readonly TYPE_BIGINT: number;
  /** INTEGER 型（ストアドプロシージャ用） */
  static readonly TYPE_INTEGER: number;
  /** SMALLINT 型（ストアドプロシージャ用） */
  static readonly TYPE_SMALLINT: number;
  /** REAL 型（ストアドプロシージャ用） */
  static readonly TYPE_REAL: number;
  /** NUMERIC 型（ストアドプロシージャ用） */
  static readonly TYPE_NUMERIC: number;
  /** REF_CURSOR 型（OUT パラメータ用） */
  static readonly TYPE_CURSOR: number;
  /** 不明な型 */
  static readonly TYPE_OBJECT: number;

  /**
   * DbParameter クラスのインスタンスを生成します。
   *
   * @param data パラメータ値
   * @param type データベース型
   */
  constructor(data: any, type: number);

  /**
   * BIGINT パラメータを作成します。
   * ストアドファンクション／プロシージャのパラメータ専用です。
   *
   * @param arg パラメータ値
   * @return DbParameter インスタンス
   */
  static bigint(arg: number | string): DbParameter;

  /**
   * BINARY パラメータを作成します。
   * `new DbParameter(arg, DbParameter.TYPE_BINARY)` と同値です。
   *
   * @param arg パラメータ値（Number[] または ByteReader）
   * @return DbParameter インスタンス
   */
  static binary(arg: number[] | ByteReader): DbParameter;

  /**
   * BLOB パラメータを作成します。
   * `new DbParameter(arg, DbParameter.TYPE_BLOB)` と同値です。
   *
   * @param arg ByteReader
   * @return DbParameter インスタンス
   */
  static blob(arg: ByteReader): DbParameter;

  /**
   * BOOLEAN パラメータを作成します。
   * `new DbParameter(arg, DbParameter.TYPE_BOOLEAN)` と同値です。
   *
   * @param arg 真偽値
   * @return DbParameter インスタンス
   */
  static boolean(arg: boolean): DbParameter;

  /**
   * CHAR パラメータを作成します。
   * ストアドファンクション／プロシージャのパラメータ専用です。
   *
   * @param arg パラメータ値
   * @return DbParameter インスタンス
   */
  static char(arg: string): DbParameter;

  /**
   * CLOB パラメータを作成します。
   * `new DbParameter(arg, DbParameter.TYPE_CLOB)` と同値です。
   *
   * @param arg TextReader
   * @return DbParameter インスタンス
   */
  static clob(arg: TextReader): DbParameter;

  /**
   * DATE パラメータを作成します。
   * `new DbParameter(arg, DbParameter.TYPE_DATE)` と同値です。
   *
   * @param arg 日付
   * @return DbParameter インスタンス
   */
  static date(arg: Date): DbParameter;

  /**
   * INTEGER パラメータを作成します。
   * ストアドファンクション／プロシージャのパラメータ専用です。
   *
   * @param arg パラメータ値
   * @return DbParameter インスタンス
   */
  static integer(arg: number | string): DbParameter;

  /**
   * IN もしくは INOUT パラメータであるかどうかを判別します。
   *
   * @return IN または INOUT の場合 true
   */
  isParamIn(): boolean;

  /**
   * OUT もしくは INOUT パラメータであるかどうかを判別します。
   *
   * @return OUT または INOUT の場合 true
   */
  isParamOut(): boolean;

  /**
   * NVARCHAR パラメータを作成します。
   * `new DbParameter(arg, DbParameter.TYPE_NSTRING)` と同値です。
   *
   * @param arg 文字列
   * @return DbParameter インスタンス
   */
  static nstring(arg: string): DbParameter;

  /**
   * NUMBER パラメータを作成します。
   * `new DbParameter(arg, DbParameter.TYPE_NUMBER)` と同値です。
   * BigDecimal にも対応しています。
   *
   * @param arg 数値
   * @return DbParameter インスタンス
   */
  static number(arg: number | string): DbParameter;

  /**
   * NUMERIC パラメータを作成します。
   * ストアドファンクション／プロシージャのパラメータ専用です。
   * BigDecimal にも対応しています。
   *
   * @param arg パラメータ値
   * @return DbParameter インスタンス
   */
  static numeric(arg: number | string): DbParameter;

  /**
   * ストアドプロシージャ／ファンクション用の IN パラメータとしてマークします。
   *
   * @return this（メソッドチェーン用）
   */
  paramIn(): DbParameter;

  /**
   * ストアドプロシージャ／ファンクション用の INOUT パラメータとしてマークします。
   *
   * @return this（メソッドチェーン用）
   */
  paramInOut(): DbParameter;

  /**
   * 指定した型の OUT パラメータを作成します。
   *
   * @param type データベース型（DbParameter.TYPE_* 定数）
   * @return DbParameter インスタンス
   */
  static paramOut(type: number): DbParameter;

  /**
   * ストアドプロシージャ／ファンクション用の OUT パラメータとしてマークします。
   *
   * @return this（メソッドチェーン用）
   */
  paramOut(): DbParameter;

  /**
   * REAL パラメータを作成します。
   * ストアドファンクション／プロシージャのパラメータ専用です。
   *
   * @param arg パラメータ値
   * @return DbParameter インスタンス
   */
  static real(arg: number | string): DbParameter;

  /**
   * SMALLINT パラメータを作成します。
   * ストアドファンクション／プロシージャのパラメータ専用です。
   *
   * @param arg パラメータ値
   * @return DbParameter インスタンス
   */
  static smallint(arg: number | string): DbParameter;

  /**
   * STRING パラメータを作成します。
   * `new DbParameter(arg, DbParameter.TYPE_STRING)` と同値です。
   *
   * @param arg 文字列
   * @return DbParameter インスタンス
   */
  static string(arg: string): DbParameter;

  /**
   * TIME パラメータを作成します。
   * `new DbParameter(arg, DbParameter.TYPE_TIME)` と同値です。
   *
   * @param arg 時刻
   * @return DbParameter インスタンス
   */
  static time(arg: Date): DbParameter;

  /**
   * TIMESTAMP パラメータを作成します。
   * `new DbParameter(arg, DbParameter.TYPE_TIMESTAMP)` と同値です。
   *
   * @param arg タイムスタンプ
   * @return DbParameter インスタンス
   */
  static timestamp(arg: Date): DbParameter;
}
