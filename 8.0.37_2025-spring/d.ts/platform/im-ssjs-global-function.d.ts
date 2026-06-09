/**
 * グローバル関数。
 *
 * intra-mart SSJS プラットフォームで直接使用可能な関数群です。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/GlobalFunction/index.html
 */

/**
 * execute() の戻り値
 */
interface ExecuteResult {
  /** 標準出力ストリーム */
  readonly output: string;
  /** エラー出力ストリーム */
  readonly error: string;
  /** 終了コード（0: 正常終了） */
  readonly exit: number;
}

/**
 * オブジェクトのコピーを作成します。
 * プロトタイプやスコープの情報が完全にはコピーされない場合があります。
 *
 * @deprecated 代替メソッドはありません
 * @param object コピー対象のオブジェクト
 * @return コピーされたオブジェクト
 */
declare function duplicate<T>(object: T): T;

/**
 * システム出力にメッセージを出力します。
 * 初期設定ではシステムログおよび標準出力に送信されます。
 * 出力先はロギング設定に依存します。
 *
 * @param message 出力するメッセージ
 */
declare function echo(message: string): void;

/**
 * システムコールを実行します。
 * コマンドは独立したプロセスとして実行され、完了するまで待機します。
 *
 * @param command 実行するシステムコマンド
 * @return 実行結果オブジェクト（output: 標準出力, error: エラー出力, exit: 終了コード）
 */
declare function execute(command: string): ExecuteResult;

/**
 * 現在のプログラムの実行を中断し、別のプログラムを起動します。
 * arg は遷移先の init() 関数の引数として渡されます。
 *
 * 注意: try...catch 文の中では使用できません。
 *
 * @param url 遷移先の URL
 * @param arg 引数オブジェクト
 */
declare function forward(url: string, arg?: { [key: string]: any }): void;

/**
 * ガベージコレクションを実行します。
 *
 * @deprecated システム全体が一時的にロックする場合があるため、特別な理由がない限り使用しないでください
 */
declare function garbageCollector(): void;

/**
 * メッセージダイジェストを生成します。
 *
 * @param algorithm ダイジェストアルゴリズム
 * @param value ダイジェスト対象のデータ
 * @return メッセージダイジェスト文字列
 */
declare function getMessageDigest(algorithm: 'MD2' | 'MD5' | 'SHA-1', value: string): string;

/**
 * JS ファイルを読み込んで実行します。
 * 引数は遷移先の init() 関数に渡されます。
 *
 * @param path JS ファイルのパス（拡張子なし）
 * @param args init() 関数に渡す引数（複数指定可）
 * @return 対象の init() 関数の戻り値
 */
declare function include(path: string, ...args: any[]): unknown;

/**
 * 値が配列型かどうかを判定します。
 *
 * @param target 判定対象の値
 * @return 配列の場合 true
 */
declare function isArray(target: any): target is any[];

/**
 * 指定されたモジュールID のモジュールが有効かどうかを判定します。
 *
 * @param moduleId モジュールID
 * @return モジュールが有効な場合 true
 */
declare function isAvailableModule(moduleId: string): boolean;

/**
 * 値が空かどうかを判定します。
 * 空文字、null、false、undefined の場合に true を返します。
 *
 * @param target 判定対象の値
 * @return 空の場合 true
 */
declare function isBlank(target: any): boolean;

/**
 * 値が Boolean 型かどうかを判定します。
 *
 * @param target 判定対象の値
 * @return Boolean 型の場合 true
 */
declare function isBoolean(target: any): target is boolean;

/**
 * 値が Date 型かどうかを判定します。
 *
 * @param target 判定対象の値
 * @return Date 型の場合 true
 */
declare function isDate(target: any): target is Date;

/**
 * 2つの値が等しいかどうかを判定します。
 * 参照比較ではなく、内部構造で比較します。
 *
 * @param a 比較する値1
 * @param b 比較する値2
 * @return 等しい場合 true
 */
declare function isEqual(a: any, b: any): boolean;

/**
 * 値が false かどうかを判定します。
 * Boolean 型かつ偽の場合にのみ true を返します。
 *
 * @param object 判定対象の値
 * @return Boolean 型かつ偽の場合 true
 */
declare function isFalse(object: any): boolean;

/**
 * 値が関数型かどうかを判定します。
 *
 * @param target 判定対象の値
 * @return 関数型の場合 true
 */
declare function isFunction(target: any): target is Function;

/**
 * 値が null かどうかを判定します。
 *
 * @param target 判定対象の値
 * @return null の場合 true
 */
declare function isNull(target: any): boolean;

/**
 * 値が Number 型かどうかを判定します。
 *
 * @param target 判定対象の値
 * @return Number 型の場合 true
 */
declare function isNumber(target: any): target is number;

/**
 * 値が Object 型かどうかを判定します（null は含みません）。
 *
 * @param target 判定対象の値
 * @return Object 型の場合 true
 */
declare function isObject(target: any): target is object;

/**
 * 値が String 型かどうかを判定します。
 *
 * @param target 判定対象の値
 * @return String 型の場合 true
 */
declare function isString(target: any): target is string;

/**
 * 値が true かどうかを判定します。
 * Boolean 型かつ真の場合にのみ true を返します。
 *
 * @param object 判定対象の値
 * @return Boolean 型かつ真の場合 true
 */
declare function isTrue(object: any): boolean;

/**
 * 値が undefined かどうかを判定します。
 *
 * @param target 判定対象の値
 * @return undefined の場合 true
 */
declare function isUndefined(target: any): target is undefined;

/**
 * JS ファイルを読み込み、その変数や関数にアクセス可能にします。
 * 複数ファイルを読み込む場合はカンマ区切りで指定します。
 *
 * @param path JS ファイルのパス（拡張子なし）
 */
declare function load(path: string): void;

/**
 * 文字列を MD5 で暗号化します。
 *
 * @deprecated getMessageDigest('MD5', value) を使用してください
 * @param value 暗号化する文字列
 * @return 暗号化された文字列
 */
declare function mdv(value: string): string;

/**
 * 指定された URL にリダイレクトします。
 *
 * 注意: try...catch 文の中では使用できません。
 *
 * @param url リダイレクト先の URL
 */
declare function redirect(url: string): void;

/**
 * 呼び出し元のプロトコルを維持してリダイレクトします。
 * 内部 URL の場合、スクリプトモデルプログラムには '.jssp' 拡張子が必要です。
 *
 * @param url リダイレクト先の URL
 * @param args リダイレクト引数
 */
declare function secureRedirect(url: string, args?: any): void;

/**
 * 実行を中断し、ソースをバイナリデータとしてブラウザに送信します。
 * 自動変換は行われません。HTTP レスポンスヘッダを含める必要があります。
 * セッション管理は除外されます。
 *
 * 注意: try...catch 文の中では使用できません。
 * レスポンスが既にコミットされている場合は効果がありません。
 *
 * @param stream ブラウザに送信するソース
 */
declare function transmission(stream: string): void;
