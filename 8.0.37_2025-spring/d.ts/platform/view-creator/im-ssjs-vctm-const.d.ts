/**
 * ViewCreator / TableMaintenance 共通定数クラス。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/VCTMConst/index.html
 */
declare class VCTMConst {
  // カラム型定数

  /** 文字列（1） */
  static readonly COLUMN_TYPES_STRING: 1;
  /** 数値（2） */
  static readonly COLUMN_TYPES_NUMBER: 2;
  /** 日付（3） */
  static readonly COLUMN_TYPES_DATE: 3;
  /** タイムスタンプ（4） */
  static readonly COLUMN_TYPES_TIMESTAMP: 4;
  /** バイナリ（5） */
  static readonly COLUMN_TYPES_BINARY: 5;
  /** 真偽値（6） */
  static readonly COLUMN_TYPES_BOOLEAN: 6;

  // パス定数

  /** 共通ライブラリパス */
  static readonly COMMON_JS: 'vc_tm_common/common/common';
  /** テーブル定義インポートファイル一時ディレクトリパス */
  static readonly TABLE_INFO_IMPORTFILE_SESSION_STORAGE_PATH: 'vc_tm_common/tableinfo/importfiles';

  // 出力先フラグ

  /** ダウンロード（1） */
  static readonly TYPE_DOWNLOAD: 1;
  /** ストレージ（2） */
  static readonly TYPE_STORAGE: 2;
}
