/**
 * 案件プロパティ情報オブジェクト。
 *
 * 案件プロパティの定義情報を保持します。
 * MatterPropertyDataManager の各メソッドに引数として渡す、または取得結果として受け取ります。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/MatterPropertyDataInfo/index.html
 */
interface MatterPropertyDataInfo {
  // --- 条件付き必須項目 ---
  // **更新 API 使用時**: いずれか1つ以上必須
  // **削除 API 使用時**: いずれか1つ以上必須

  /** 案件プロパティキー */
  matterPropertyKey?: string;
  /** ロケールID */
  localeId?: string;

  // --- 任意項目 ---

  /** 表示位置種別 */
  alignType?: string;
  /** カレンダー表示フラグ（'0': 非表示 / '1': 表示） */
  calendarFlag?: FlagStatus;
  /** カンマ区切り表示フラグ（'0': カンマ区切り表示しない / '1': カンマ区切り表示する） */
  commaSeparatedFlag?: FlagStatus;
  /** 案件プロパティキー型種別 */
  matterPropertyModelType?: string;
  /** 案件プロパティ名 */
  matterPropertyName?: string;
  /** 案件プロパティ使用種別（ImBox置換文字列）の使用有無（'0': 使用無 / '1': 使用有） */
  matterPropertyTypeImBoxTemplate?: FlagStatus;
  /** 案件プロパティ使用種別（一覧パターン）の使用有無（'0': 使用無 / '1': 使用有） */
  matterPropertyTypeListPattern?: FlagStatus;
  /** 案件プロパティ使用種別（メール置換文字列）の使用有無（'0': 使用無 / '1': 使用有） */
  matterPropertyTypeMailTemplate?: FlagStatus;
  /** 案件プロパティ使用種別（ルール条件）の使用有無（'0': 使用無 / '1': 使用有） */
  matterPropertyTypeRule?: FlagStatus;
  /** 備考 */
  note?: string;
  /** 検索範囲種別 */
  searchRangeType?: string;
  /** 更新カウンタ */
  updateCount?: string;
}

interface MatterPropertyDataInfoForCreate extends MatterPropertyDataInfo {
  // --- 条件付き必須項目 ---
  // **新規作成 API 使用時**: 必須

  /** ロケールID */
  localeId: string;
  /** 案件プロパティキー */
  matterPropertyKey: string;
  /** 案件プロパティキー型種別 */
  matterPropertyModelType: string;
  /** 案件プロパティ名 */
  matterPropertyName: string;
  /** 案件プロパティ使用種別（ImBox置換文字列）の使用有無（'0': 使用無 / '1': 使用有） */
  matterPropertyTypeImBoxTemplate: FlagStatus;
  /** 案件プロパティ使用種別（一覧パターン）の使用有無（'0': 使用無 / '1': 使用有） */
  matterPropertyTypeListPattern: FlagStatus;
  /** 案件プロパティ使用種別（メール置換文字列）の使用有無（'0': 使用無 / '1': 使用有） */
  matterPropertyTypeMailTemplate: FlagStatus;
  /** 案件プロパティ使用種別（ルール条件）の使用有無（'0': 使用無 / '1': 使用有） */
  matterPropertyTypeRule: FlagStatus;
}
