/**
 * 外部システム連携用のデータベースアクセスクラス。
 *
 * シェアードデータソースを使用してデータベースにアクセスします。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/SharedDatabase/index.html
 */
declare class SharedDatabase {
  /** 接続ID */
  readonly connectId: string;
  /** JNDI 名 */
  readonly dataSourceName: string;
  /** データベース名（'Oracle', 'PostgreSQL', 'SQLServer'） */
  readonly databaseName: string;

  /**
   * SharedDatabase クラスのインスタンスを生成します。
   *
   * @param dataSourceId 接続ID
   */
  constructor(dataSourceId: string);

  /**
   * SQL を実行します。
   *
   * @param sql SQL 文
   * @param params パラメータ配列
   * @return データベースアクセス処理結果
   */
  execute(sql: string, params?: SharedDatabase.DbParameters): DatabaseResult;

  /**
   * 2WaySQL テンプレートで SQL を実行します。
   *
   * @param path テンプレートファイルパス（`src/main/jssp/src/` 起点の絶対パス、拡張子 `.sql` は付けない。例: `/content/sql/select_content`）
   * @param params パラメータオブジェクト
   * @return データベースアクセス処理結果
   */
  executeByTemplate(path: string, params?: SharedDatabase.SQLParameter): DatabaseResult;

  /**
   * ストアドプロシージャ／ファンクションを実行します。
   *
   * @param sql SQL 文
   * @param params パラメータ配列
   * @return データベースアクセス処理結果
   */
  executeCallable(sql: string, params?: SharedDatabase.DbParameters): DatabaseResult;

  /**
   * ページネーション付き SELECT クエリを実行します。
   *
   * @param sql SQL 文
   * @param start 開始位置
   * @param length 取得件数
   * @param params パラメータ配列
   * @return データベースアクセス処理結果
   */
  fetch(sql: string, start: number, length: number, params?: SharedDatabase.DbParameters): DatabaseResult;

  /**
   * 2WaySQL テンプレートでページネーション付き SELECT を実行します。
   *
   * @param path テンプレートファイルパス（`src/main/jssp/src/` 起点の絶対パス、拡張子 `.sql` は付けない。例: `/content/sql/select_content`）
   * @param start 開始位置
   * @param length 取得件数
   * @param params パラメータオブジェクト
   * @return データベースアクセス処理結果
   */
  fetchByTemplate(path: string, start: number, length: number, params?: SharedDatabase.SQLParameter): DatabaseResult;

  /**
   * BLOB/InputStream データを ByteReader として取得します。
   *
   * @param tableName テーブル名
   * @param columnName カラム名
   * @param condition WHERE 条件
   * @param params 条件パラメータ配列
   * @param callback コールバック関数
   * @return データベースアクセス処理結果
   */
  getByteReader(tableName: string, columnName: string, condition: string, params?: SharedDatabase.DbParameters, callback?: Function): DatabaseResult;

  /**
   * データベースメタデータを取得します。
   *
   * @return data に DatabaseMetaData を含む DatabaseResult
   */
  getMetaData(): DatabaseResult;

  /**
   * CLOB/Reader データを TextReader として取得します。
   *
   * @param tableName テーブル名
   * @param columnName カラム名
   * @param condition WHERE 条件
   * @param params 条件パラメータ配列
   * @param callback コールバック関数
   * @return データベースアクセス処理結果
   */
  getTextReader(tableName: string, columnName: string, condition: string, params?: SharedDatabase.DbParameters, callback?: Function): DatabaseResult;

  /**
   * レコードを挿入します。
   *
   * @param tableName テーブル名
   * @param insertData 挿入データオブジェクト
   * @return データベースアクセス処理結果
   */
  insert(tableName: string, insertData: SharedDatabase.RecordData): DatabaseResult;

  /**
   * CLOB テキスト含有設定を確認します。
   */
  isIncludeClobData(): boolean;

  /**
   * BigDecimal 取得設定を確認します。
   */
  isUseBigDecimal(): boolean;

  /**
   * レコードを削除します。
   *
   * @param tableName テーブル名
   * @param condition WHERE 条件
   * @param params 条件パラメータ配列
   * @return データベースアクセス処理結果
   */
  remove(tableName: string, condition: string, params?: SharedDatabase.DbParameters): DatabaseResult;

  /**
   * SELECT クエリを実行します。
   *
   * @param sql SQL 文
   * @param params パラメータ配列
   * @param length 最大取得行数（0 で全件）
   * @return データベースアクセス処理結果
   */
  select(sql: string, params?: SharedDatabase.DbParameters, length?: number): DatabaseResult;

  /**
   * CLOB テキストを結果に含めるかを設定します。
   *
   * @param includeClobData 含める場合 true
   */
  setIncludeClobData(includeClobData: boolean): void;

  /**
   * decimal/numeric カラムを BigDecimal で取得するかを設定します。
   *
   * @param useBigDecimal BigDecimal で取得する場合 true
   */
  setUseBigDecimal(useBigDecimal: boolean): void;

  /**
   * レコードを更新します。
   *
   * @param tableName テーブル名
   * @param updateData 更新データオブジェクト
   * @param condition WHERE 条件
   * @param params 条件パラメータ配列
   * @return データベースアクセス処理結果
   */
  update(tableName: string, updateData: SharedDatabase.RecordData, condition: string, params?: SharedDatabase.DbParameters): DatabaseResult;
}

declare namespace SharedDatabase {
  type DbParameters = DbParameter[];
  type SQLParameter = { [key: string]: any };
  type RecordData = { [columnName: string]: any };
}
