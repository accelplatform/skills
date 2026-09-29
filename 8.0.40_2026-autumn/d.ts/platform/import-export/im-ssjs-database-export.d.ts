/**
 * データベースエクスポート処理クラス。
 *
 * データベースのレコードを CSV 形式でエクスポートします。
 * 複数テーブルの場合は ZIP 圧縮されます。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/DatabaseExport/index.html
 */
declare class DatabaseExport {
  /**
   * データベースエクスポート処理クラスのインスタンスを生成します。
   */
  constructor();

  /**
   * エクスポート対象のテーブルを追加します。
   *
   * @param src テーブル名またはテーブル名の配列
   * @return error にテーブル追加処理結果を格納したオブジェクト
   */
  add(src: string | string[]): DatabaseExport.Result<DatabaseExport.Empty>;

  /**
   * エクスポートを実行し、指定された File に出力します。
   *
   * @param connectId データベース接続ID
   * @param file 出力先ファイル
   * @return error にエクスポート処理結果を格納したオブジェクト
   */
  execute(connectId: string, file: File): DatabaseExport.Result<DatabaseExport.Empty>;

  /**
   * エクスポートを実行し、ByteWriter に出力します。
   *
   * @param connectId データベース接続ID
   * @param writer 出力先 ByteWriter
   * @return error にエクスポート処理結果を格納したオブジェクト
   */
  execute(connectId: string, writer: ByteWriter): DatabaseExport.Result<DatabaseExport.Empty>;

  /**
   * エクスポートを実行し、データをメモリ上に返却します。
   *
   * @deprecated エクスポートファイルのサイズが大きい場合、このメソッドはメモリ領域を圧迫する可能性があります
   * @param connectId データベース接続ID
   * @return data にエクスポートされたファイルデータを格納したオブジェクト
   */
  execute(connectId: string): DatabaseExport.Result<DatabaseExport.Stream>;

  /**
   * 自動生成されたエクスポートファイル名を返却します。
   * execute() の後に使用してください。
   *
   * @return ファイル名文字列
   */
  getDefaultExportFileName(): string;

  /**
   * デフォルトのフェッチサイズを取得します。
   *
   * @return フェッチサイズ
   */
  static getDefaultFetchSize(): number;

  /**
   * エクスポートオプションを XML 文字列で取得します。
   *
   * @return XML 文字列。失敗した場合 null
   */
  getExportOptionsXmlString(): string | null;

  /**
   * 実行の進捗情報を取得します。
   *
   * @deprecated 代替メソッドはありません
   * @param uniqueKey 一意キー
   * @return 進捗情報オブジェクト
   */
  static getMonitor(uniqueKey: string): DatabaseExport.Result<DatabaseExport.Monitor>;

  /**
   * インポート設定をエクスポートファイルに含めます。ZIP 圧縮が強制されます。
   *
   * @param importOptionsXml インポート設定 XML
   * @return data にインポート設定の追加処理結果を格納したオブジェクト
   */
  includeImportOptions(importOptionsXml: string): DatabaseExport.Result<DatabaseExport.Empty>;

  /**
   * エンコーディング情報をエクスポート出力に含めるかを設定します。
   *
   * @param isInclude true で含める（デフォルト: false）
   */
  setExportFileEncordingSetting(isInclude?: boolean): void;

  /**
   * エクスポート設定を XML 文字列で設定します。
   *
   * @param exportOptionsXml エクスポート設定 XML
   * @return data にオプション設定処理結果を格納したオブジェクト
   */
  setExportOptionsXmlString(exportOptionsXml: string): DatabaseExport.Result<DatabaseExport.Empty>;

  /**
   * 実行状況監視用のキーを設定します。
   *
   * @param uniqueKey 一意キー
   */
  setMonitor(uniqueKey: string): void;
}

declare namespace DatabaseExport {
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
      stackTrace: string;
      localizedMessage: string;
      sqlState?: string;
    };
  }

  type Empty = {};

  type Stream = {
    stream: string;
    string: string;
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
}
