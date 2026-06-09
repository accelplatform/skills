/**
 * ファイルアーカイブ（圧縮・展開）API。
 *
 * 圧縮ファイル内のファイル名は「UTF-8」で扱われます。
 * ディレクトリ名やファイル名に日本語などのマルチバイト文字が含まれている場合、
 * 展開に失敗または文字化け等が発生するケースがあるため、動作保証外となります。
 * 例えば、Windowsなどの「UTF-8」に対応していない OS やアーカイバでファイルを扱う場合、文字化けが発生します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Archiver/index.html
 */
declare class Archiver {
  /**
   * ZIP ファイルを展開します（File）。
   *
   * @param arg 展開パラメータオブジェクト
   * @return 展開先の File オブジェクト。ZIP ファイルでない場合は undefined
   */
  static unzip(arg: Archiver.UnzipArgFile): File | undefined;

  /**
   * ZIP ファイルを展開します（PublicStorage）。
   *
   * @param arg 展開パラメータオブジェクト
   * @return 展開先の PublicStorage オブジェクト。ZIP ファイルでない場合は undefined
   */
  static unzip(arg: Archiver.UnzipArgPublicStorage): PublicStorage | undefined;

  /**
   * ZIP ファイルを展開します（バイナリ文字列から File へ）。
   *
   * @param arg 展開パラメータオブジェクト
   * @return 展開先の File オブジェクト。ZIP ファイルでない場合は undefined
   */
  static unzip(arg: Archiver.UnzipArgBinaryToFile): File | undefined;

  /**
   * ZIP ファイルを展開します（バイナリ文字列から PublicStorage へ）。
   *
   * @param arg 展開パラメータオブジェクト
   * @return 展開先の PublicStorage オブジェクト。ZIP ファイルでない場合は undefined
   */
  static unzip(arg: Archiver.UnzipArgBinaryToPublicStorage): PublicStorage | undefined;

  /**
   * 指定されたファイルやディレクトリを ZIP 形式で圧縮します（File）。
   *
   * @param arg 圧縮パラメータオブジェクト
   * @return 圧縮ファイルの File オブジェクト
   */
  static zip(arg: Archiver.ZipArgFile): File;

  /**
   * 指定されたファイルやディレクトリを ZIP 形式で圧縮します（File 配列）。
   *
   * @param arg 圧縮パラメータオブジェクト
   * @return 圧縮ファイルの File オブジェクト
   */
  static zip(arg: Archiver.ZipArgFileArray): File;

  /**
   * 指定されたファイルやディレクトリを ZIP 形式で圧縮します（PublicStorage）。
   *
   * @param arg 圧縮パラメータオブジェクト
   * @return 圧縮ファイルの PublicStorage オブジェクト
   */
  static zip(arg: Archiver.ZipArgPublicStorage): PublicStorage;

  /**
   * 指定されたファイルやディレクトリを ZIP 形式で圧縮します（PublicStorage 配列）。
   *
   * @param arg 圧縮パラメータオブジェクト
   * @return 圧縮ファイルの PublicStorage オブジェクト
   */
  static zip(arg: Archiver.ZipArgPublicStorageArray): PublicStorage;

  /**
   * 指定されたファイルやディレクトリを ZIP 形式で圧縮し、バイナリ文字列を返します（File）。
   *
   * @param arg 圧縮パラメータオブジェクト
   * @return 圧縮されたバイナリ文字列
   */
  static zip(arg: Archiver.ZipArgFileNoDest): string;

  /**
   * 指定されたファイルやディレクトリを ZIP 形式で圧縮し、バイナリ文字列を返します（File 配列）。
   *
   * @param arg 圧縮パラメータオブジェクト
   * @return 圧縮されたバイナリ文字列
   */
  static zip(arg: Archiver.ZipArgFileArrayNoDest): string;

  /**
   * 指定されたファイルやディレクトリを ZIP 形式で圧縮し、バイナリ文字列を返します（PublicStorage）。
   *
   * @param arg 圧縮パラメータオブジェクト
   * @return 圧縮されたバイナリ文字列
   */
  static zip(arg: Archiver.ZipArgPublicStorageNoDest): string;

  /**
   * 指定されたファイルやディレクトリを ZIP 形式で圧縮し、バイナリ文字列を返します（PublicStorage 配列）。
   *
   * @param arg 圧縮パラメータオブジェクト
   * @return 圧縮されたバイナリ文字列
   */
  static zip(arg: Archiver.ZipArgPublicStorageArrayNoDest): string;

  /**
   * バイナリ文字列を ZIP 形式で圧縮します（出力先: File）。
   *
   * @param arg 圧縮パラメータオブジェクト
   * @return 圧縮ファイルの File オブジェクト
   */
  static zip(arg: Archiver.ZipArgBinaryToFile): File;

  /**
   * バイナリ文字列を ZIP 形式で圧縮します（出力先: PublicStorage）。
   *
   * @param arg 圧縮パラメータオブジェクト
   * @return 圧縮ファイルの PublicStorage オブジェクト
   */
  static zip(arg: Archiver.ZipArgBinaryToPublicStorage): PublicStorage;

  /**
   * バイナリ文字列を ZIP 形式で圧縮し、バイナリ文字列を返します。
   *
   * @param arg 圧縮パラメータオブジェクト
   * @return 圧縮されたバイナリ文字列
   */
  static zip(arg: Archiver.ZipArgBinaryNoDest): string;
}

declare namespace Archiver {
  interface UnzipArgFile {
    /** 展開する ZIP ファイルパス（File オブジェクト） */
    src: File;
    /** 展開先ディレクトリパス（File オブジェクト）。既存のファイル・ディレクトリは削除されます */
    dest: File;
  }

  interface UnzipArgPublicStorage {
    /** 展開する ZIP ファイルパス（PublicStorage オブジェクト） */
    src: PublicStorage;
    /** 展開先ディレクトリパス（PublicStorage オブジェクト）。既存のファイル・ディレクトリは削除されます */
    dest: PublicStorage;
  }

  interface UnzipArgBinaryToFile {
    /** 展開する ZIP ファイルのバイナリ文字列 */
    src: string;
    /** 展開先ディレクトリパス（File オブジェクト）。既存のファイル・ディレクトリは削除されます */
    dest: File;
  }

  interface UnzipArgBinaryToPublicStorage {
    /** 展開する ZIP ファイルのバイナリ文字列 */
    src: string;
    /** 展開先ディレクトリパス（PublicStorage オブジェクト）。既存のファイル・ディレクトリは削除されます */
    dest: PublicStorage;
  }

  interface ZipArgFile {
    /** 圧縮するファイルまたはディレクトリパス（File オブジェクト） */
    src: File;
    /** 圧縮ファイルの出力先パス（File オブジェクト）。既存のファイル・ディレクトリは削除されます */
    dest: File;
    /**
     * フィルタ関数。false を返すと対象ファイルを圧縮対象から除外します。
     *
     * @param target 評価対象の File オブジェクト
     * @return false で除外、それ以外で圧縮対象に含める
     */
    filter?: (target: File) => boolean;
  }

  interface ZipArgFileArray {
    /** 圧縮するファイルまたはディレクトリの配列（File オブジェクト） */
    src: File[];
    /** 圧縮ファイルの出力先パス（File オブジェクト）。既存のファイル・ディレクトリは削除されます */
    dest: File;
    /**
     * フィルタ関数。false を返すと対象ファイルを圧縮対象から除外します。
     *
     * @param target 評価対象の File オブジェクト
     * @return false で除外、それ以外で圧縮対象に含める
     */
    filter?: (target: File) => boolean;
  }

  interface ZipArgPublicStorage {
    /** 圧縮するファイルまたはディレクトリパス（PublicStorage オブジェクト） */
    src: PublicStorage;
    /** 圧縮ファイルの出力先パス（PublicStorage オブジェクト）。既存のファイル・ディレクトリは削除されます */
    dest: PublicStorage;
  }

  interface ZipArgPublicStorageArray {
    /** 圧縮するファイルまたはディレクトリの配列（PublicStorage オブジェクト） */
    src: PublicStorage[];
    /** 圧縮ファイルの出力先パス（PublicStorage オブジェクト）。既存のファイル・ディレクトリは削除されます */
    dest: PublicStorage;
  }

  interface ZipArgFileNoDest {
    /** 圧縮するファイルまたはディレクトリパス（File オブジェクト） */
    src: File;
    /**
     * フィルタ関数。false を返すと対象ファイルを圧縮対象から除外します。
     *
     * @param target 評価対象の File オブジェクト
     * @return false で除外、それ以外で圧縮対象に含める
     */
    filter?: (target: File) => boolean;
  }

  interface ZipArgFileArrayNoDest {
    /** 圧縮するファイルまたはディレクトリの配列（File オブジェクト） */
    src: File[];
    /**
     * フィルタ関数。false を返すと対象ファイルを圧縮対象から除外します。
     *
     * @param target 評価対象の File オブジェクト
     * @return false で除外、それ以外で圧縮対象に含める
     */
    filter?: (target: File) => boolean;
  }

  interface ZipArgPublicStorageNoDest {
    /** 圧縮するファイルまたはディレクトリパス（PublicStorage オブジェクト） */
    src: PublicStorage;
  }

  interface ZipArgPublicStorageArrayNoDest {
    /** 圧縮するファイルまたはディレクトリの配列（PublicStorage オブジェクト） */
    src: PublicStorage[];
  }

  interface ZipArgBinaryToFile {
    /** 圧縮するファイルのバイナリ文字列（File#load() や RequestParameter#getValueAsStream() の戻り値） */
    src: string;
    /** バイナリ文字列を圧縮する際のファイル名 */
    srcFileName: string;
    /** 圧縮ファイルの出力先パス（File オブジェクト）。既存のファイル・ディレクトリは削除されます */
    dest: File;
  }

  interface ZipArgBinaryToPublicStorage {
    /** 圧縮するファイルのバイナリ文字列（File#load() や RequestParameter#getValueAsStream() の戻り値） */
    src: string;
    /** バイナリ文字列を圧縮する際のファイル名 */
    srcFileName: string;
    /** 圧縮ファイルの出力先パス（PublicStorage オブジェクト）。既存のファイル・ディレクトリは削除されます */
    dest: PublicStorage;
  }

  interface ZipArgBinaryNoDest {
    /** 圧縮するファイルのバイナリ文字列（File#load() や RequestParameter#getValueAsStream() の戻り値） */
    src: string;
    /** バイナリ文字列を圧縮する際のファイル名 */
    srcFileName: string;
  }
}
