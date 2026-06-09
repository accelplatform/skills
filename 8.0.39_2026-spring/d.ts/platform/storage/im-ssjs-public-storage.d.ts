/**
 * PublicStorage アクセスクラス。
 *
 * storage/public ディレクトリ内のファイル・フォルダにアクセスします。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/PublicStorage/index.html
 */
declare class PublicStorage {
  /**
   * 指定したパスを示す、PublicStorage クラスのインスタンスを作成します。
   *
   * @param path パブリックストレージのパス
   */
  constructor(path: string);

  /**
   * 指定した親・子のパスを示す、PublicStorage クラスのインスタンスを作成します。
   *
   * @param parent 親フォルダのパス
   * @param child 子フォルダのパス
   */
  constructor(parent: string, child: string);

  /**
   * 指定した Storage と同じパスを示す、PublicStorage クラスのインスタンスを作成します。
   *
   * @param storage パブリックストレージ
   */
  constructor(storage: PublicStorage);

  /**
   * 指定した親・子のパスを示す、PublicStorage クラスのインスタンスを作成します。
   *
   * @param parent 親のパブリックストレージ
   * @param child 子フォルダのパス
   */
  constructor(parent: PublicStorage, child: string);

  /**
   * 文字列を指定されたキャラセットで変換し追記します。
   *
   * @param src 追記する文字列
   * @param charsetName キャラセット名（省略時は UTF-8）
   * @return 成功した場合 true、失敗した場合 false
   */
  append(src: string, charsetName?: string): boolean;

  /**
   * 追記用としてパスをバイナリで開きます。
   * callback が渡された場合、処理完了後に close が自動実行されます。
   *
   * @param callback コールバック関数。エラー時は第 2 引数に Error が渡されます
   * @return ByteWriter オブジェクト
   */
  appendAsBinary(callback?: Function): ByteWriter;

  /**
   * 追記用としてパスをテキストで開きます。
   * callback が渡された場合、処理完了後に close が自動実行されます。
   *
   * @param callback コールバック関数。エラー時は第 2 引数に Error が渡されます
   * @param charsetName キャラセット名
   * @return TextWriter オブジェクト
   */
  appendAsText(callback?: Function, charsetName?: string): TextWriter;

  /**
   * ファイルまたはディレクトリをコピーします。
   *
   * @param to コピー先の PublicStorage
   * @param overwrite true の場合、コピー先に同名ファイルが存在すると上書きします
   * @return 成功した場合 true、失敗した場合 false
   */
  copy(to: PublicStorage, overwrite?: boolean): boolean;

  /**
   * 書き込み用としてパスをバイナリで開きます。
   * callback が渡された場合、処理完了後に close が自動実行されます。
   *
   * @param callback コールバック関数。エラー時は第 2 引数に Error が渡されます
   * @return ByteWriter オブジェクト
   */
  createAsBinary(callback?: Function): ByteWriter;

  /**
   * 書き込み用としてパスをテキストで開きます。
   * callback が渡された場合、処理完了後に close が自動実行されます。
   *
   * @param callback コールバック関数。エラー時は第 2 引数に Error が渡されます
   * @param charsetName キャラセット名
   * @return TextWriter オブジェクト
   */
  createAsText(callback?: Function, charsetName?: string): TextWriter;

  /**
   * ディレクトリ配下のディレクトリパスコレクションを取得します。
   *
   * @param recursive true の場合、再帰的に探索します
   * @return ディレクトリパスの配列。ディレクトリでない場合 null
   */
  directories(recursive?: boolean): string[];

  /**
   * ディレクトリ内のディレクトリを示す PublicStorage コレクションを取得します。
   *
   * @param recursive true の場合、再帰的に探索します
   * @return PublicStorage の配列
   */
  directoriesStorages(recursive?: boolean): PublicStorage[];

  /**
   * ファイルまたはディレクトリが存在するかを判定します。
   *
   * @return 存在する場合 true
   */
  exists(): boolean;

  /**
   * ディレクトリ配下のファイルパスコレクションを取得します。
   *
   * @param recursive true の場合、再帰的に探索します
   * @return ファイルパスの配列
   */
  files(recursive?: boolean): string[];

  /**
   * ディレクトリ内のファイルを示す PublicStorage コレクションを取得します。
   *
   * @param recursive true の場合、再帰的に探索します
   * @return PublicStorage の配列
   */
  filesStorages(recursive?: boolean): PublicStorage[];

  /**
   * 正規化したパスを返します。
   *
   * @return 正規化されたパス文字列
   */
  getCanonicalPath(): string;

  /**
   * ファイルまたはディレクトリの名前を返します。
   *
   * @return ファイル名またはディレクトリ名
   */
  getName(): string;

  /**
   * 親パスを返します。
   *
   * @return 親ディレクトリのパス文字列
   */
  getParent(): string;

  /**
   * 親の PublicStorage を返します。
   *
   * @return 親ディレクトリの PublicStorage
   */
  getParentStorage(): PublicStorage;

  /**
   * パス名文字列を返します。
   *
   * @return パス文字列
   */
  getPath(): string;

  /**
   * 対象の PublicStorage からの相対パスを返します。
   *
   * @param target 基準となる PublicStorage
   * @return 相対パス文字列
   */
  getRelativePath(target: PublicStorage): string;

  /**
   * ルートの PublicStorage を返します。
   *
   * @return ルートディレクトリの PublicStorage
   */
  getRootStorage(): PublicStorage;

  /**
   * ディレクトリであるかを判定します。
   *
   * @return ディレクトリの場合 true
   */
  isDirectory(): boolean;

  /**
   * 通常のファイルであるかを判定します。
   *
   * @return ファイルの場合 true
   */
  isFile(): boolean;

  /**
   * ファイルの最終更新時刻をミリ秒で返します。
   *
   * @return 最終更新時刻（ミリ秒）
   */
  lastModified(): number;

  /**
   * ファイルの長さをバイト単位で返します。
   *
   * @return ファイルサイズ（バイト）
   */
  length(): number;

  /**
   * ディレクトリ配下のファイルおよびディレクトリパスコレクションを取得します。
   *
   * @param filterOrRecursive Boolean の場合は再帰探索フラグ、Function の場合はフィルタ関数
   * @return パスの配列
   */
  list(filterOrRecursive?: boolean | ((path: string) => boolean)): string[];

  /**
   * ディレクトリ内のファイルおよびディレクトリを示す PublicStorage コレクションを取得します。
   *
   * @param filterOrRecursive Boolean の場合は再帰探索フラグ、Function の場合はフィルタ関数
   * @return PublicStorage の配列
   */
  listStorages(filterOrRecursive?: boolean | ((path: string) => boolean)): PublicStorage[];

  /**
   * ストレージ内容を取得します。
   *
   * @deprecated openAsText() または openAsBinary() を使用してください
   * @return ファイル内容の文字列
   */
  load(): string;

  /**
   * ディレクトリを生成します。
   * 必要に応じて親ディレクトリも含めて作成します。
   *
   * @return 成功した場合 true、失敗した場合 false
   */
  makeDirectories(): boolean;

  /**
   * ファイルを移動します。
   *
   * @param newPath 新しいパス
   * @return 成功した場合 true、失敗した場合 false
   */
  move(newPath: string): boolean;

  /**
   * 読み込み用としてパスをバイナリで開きます。
   * callback が渡された場合、処理完了後に close が自動実行されます。
   *
   * @param callback コールバック関数。エラー時は第 2 引数に Error が渡されます
   * @return ByteReader オブジェクト
   */
  openAsBinary(callback?: Function): ByteReader;

  /**
   * 読み込み用としてパスをテキストで開きます。
   * callback が渡された場合、処理完了後に close が自動実行されます。
   *
   * @param callback コールバック関数。エラー時は第 2 引数に Error が渡されます
   * @param charsetName キャラセット名
   * @return TextReader オブジェクト
   */
  openAsText(callback?: Function, charsetName?: string): TextReader;

  /**
   * ストレージ内容を文字列として取得します。
   *
   * @deprecated openAsText() を使用してください
   * @param charsetName キャラセット名
   * @return ファイル内容の文字列
   */
  read(charsetName?: string): string;

  /**
   * ファイルまたはディレクトリを削除します。
   *
   * @param recursive true の場合、ディレクトリを再帰的に削除します
   * @return 成功した場合 true、失敗した場合 false
   */
  remove(recursive?: boolean): boolean;

  /**
   * 相対パスを解決した PublicStorage を返します。
   *
   * @param other 相対パス
   * @return 解決された PublicStorage
   */
  resolve(other: string): PublicStorage;

  /**
   * ファイルに内容を書き込みます。
   *
   * @deprecated createAsBinary() を使用してください
   * @param byteStream ファイルの中身
   * @return 成功した場合 true、失敗した場合 false
   */
  save(byteStream: string): boolean;

  /**
   * 文字列を指定されたキャラセットで変換し書き込みます。
   *
   * @param src 書き込む文字列
   * @param charsetName キャラセット名（省略時は UTF-8）
   * @return 成功した場合 true、失敗した場合 false
   */
  write(src: string, charsetName?: string): boolean;
}
