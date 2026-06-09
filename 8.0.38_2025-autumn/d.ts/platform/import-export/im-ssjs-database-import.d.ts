/**
 * データベースインポート処理クラス。
 *
 * CSV ファイルまたは ZIP アーカイブからデータベースにレコードをインポートします。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/DatabaseImport/index.html
 */
declare class DatabaseImport {
  /**
   * データベースインポート処理クラスのインスタンスを生成します。
   */
  constructor();

  /**
   * インポートデータをファイルから追加します（CSV または ZIP 形式）。
   *
   * @param file インポートファイル
   * @return error にファイル追加処理結果を格納したオブジェクト
   */
  add(file: File): DatabaseImport.Result<DatabaseImport.Empty>;

  /**
   * インポートデータを文字列から追加します。
   *
   * @deprecated add(File) を使用してください
   * @param src データ文字列
   * @param fileName ファイル名
   * @return error にデータ追加処理結果を格納したオブジェクト
   */
  add(src: string, fileName: string): DatabaseImport.Result<DatabaseImport.Empty>;

  /**
   * インポートデータを文字列から追加します。
   *
   * @deprecated add(File) を使用してください
   * @param src データ文字列
   * @param fileName ファイル名
   * @return error にデータ追加処理結果を格納したオブジェクト
   */
  addString(src: string, fileName: string): DatabaseImport.Result<DatabaseImport.Empty>;

  /**
   * インポートを実行します。
   *
   * @param connectId データベース接続ID
   * @param isArray 配列フラグ
   * @return 実行結果
   */
  execute(connectId: string, isArray?: boolean): DatabaseImport.Result<DatabaseImport.Tables>;

  /**
   * インポートオプションを XML 文字列で取得します。
   *
   * @return XML 文字列
   */
  getImportOptionsXmlString(): string;

  /**
   * 実行の進捗情報を取得します。
   *
   * @deprecated 代替メソッドはありません
   * @param uniqueKey 一意キー
   * @return 進捗情報オブジェクト
   */
  static getMonitor(uniqueKey: string): DatabaseImport.Result<DatabaseImport.Monitor>;

  /**
   * 削除通知を生成します。
   *
   * @deprecated 代替メソッドはありません
   * @return 削除通知の配列
   */
  static listenerDelete(): string[];

  /**
   * エラー通知を生成します。
   *
   * @deprecated 代替メソッドはありません
   * @param message エラーメッセージ
   * @return エラー通知の配列
   */
  static listenerError(message: string): string[];

  /**
   * スキップ通知を生成します。
   *
   * @deprecated 代替メソッドはありません
   * @return スキップ通知の配列
   */
  static listenerSkip(): string[];

  /**
   * 終了通知を生成します。
   *
   * @deprecated 代替メソッドはありません
   * @param message メッセージ
   * @return 終了通知の配列
   */
  static listenerTerminate(message: string): string[];

  /**
   * 明示的ファイル要求を設定します。
   *
   * @param explicitFile 明示的ファイル要求フラグ
   */
  setExplicitFile(explicitFile: boolean): void;

  /**
   * インポート設定を行います。
   *
   * @deprecated setImportOptionsXmlString を使用してください
   * @param config 設定文字列
   */
  setImportConfig(config: string): void;

  /**
   * インポートオプションを XML 文字列で設定します。
   *
   * @param xml インポートオプション XML
   * @return data にオプション設定処理結果を格納した ResultObject
   */
  setImportOptionsXmlString(xml: string): DatabaseImport.ImportOptions;

  /**
   * リスナーパスを設定します。
   *
   * @deprecated 代替メソッドはありません
   * @param pagePath リスナーページパス
   */
  setListener(pagePath: string): void;

  /**
   * 実行状況監視用のキーを設定します。
   *
   * @deprecated 代替メソッドはありません
   * @param uniqueKey 一意キー
   */
  setMonitor(uniqueKey: string): void;
}

declare namespace DatabaseImport {
  type Result<T> = Result.Success<T> | Result.Failure<T>;

  namespace Result {
    type Success<T> = T & {
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

  type Tables = {
    tables: {
      deleteCount: number;
      error: boolean;
      errorCount: number;
      errorLines: {
        message: string;
        exceptionClass: string;
        tableName: string;
        lineNumber: number;
        fieldValues: { [columnName: string]: string };
      }[];
      hasErrorLines: boolean;
      hasTransactionErrors: boolean;
      insertCount: number;
      overMaxError: boolean;
      tableName: string;
      transactionErrors: {
        message: string;
        exceptionClass: string;
        tableName: string;
      }[];
      updateCount: number;
    }[];
  };

  type Monitor = {
    complete: boolean;
    lineNumber: number;
    tableName: string;
    tables: {
      complete: boolean;
      errorLineNumbers: number[];
      errorMessages: string[];
      successCount: number;
      totalCount: number;
      transactionErrorMessages: string[];
    }[];
  };

  type ImportOptions = Result<DatabaseImport.Empty> & {
    fatalError: boolean;
  };
}
