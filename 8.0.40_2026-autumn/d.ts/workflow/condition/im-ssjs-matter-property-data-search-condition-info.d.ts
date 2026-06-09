/**
 * 案件プロパティ一覧情報検索条件クラス。
 *
 * MatterPropertyDataManager#getMatterPropertyDataList() 等の検索条件として使用します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/MatterPropertyDataSearchConditionInfo/index.html
 */
declare class MatterPropertyDataSearchConditionInfo {
  /** あいまい検索の対象項目：案件プロパティ使用種別（一覧） */
  static readonly DETAIL_TABLE_FLAG: 'matterPropertyTypeListPattern';
  /** あいまい検索の対象項目：案件プロパティ名 */
  static readonly DISPLAY_NAME: 'matterPropertyName';
  /** あいまい検索の対象項目：案件プロパティ使用種別（IMBox） */
  static readonly IMBOX_FLAG: 'matterPropertyTypeImBoxTpl';
  /** あいまい検索の対象項目：案件プロパティの型種別 */
  static readonly KEY_TYPE: 'matterPropertyModelType';
  /** あいまい検索の対象項目：案件プロパティ使用種別（メール） */
  static readonly MAIL_FLAG: 'matterPropertyTypeMailTemplate';
  /** あいまい検索の対象項目：案件プロパティキー */
  static readonly MATTER_PROPERTY_KEY: 'matterPropertyKey';
  /** あいまい検索の対象項目：備考 */
  static readonly NOTE: 'note';
  /** あいまい検索の対象項目：案件プロパティ使用種別（ルール） */
  static readonly RULE_FLAG: 'matterPropertyTypeRule';

  /**
   * 案件プロパティ一覧情報検索条件クラスのインスタンスを生成します。
   */
  constructor();

  /** レコードの取得件数 */
  count?: number;
  /** あいまい検索の対象項目 */
  likeSearchCondition?: string;
  /** あいまい検索の値 */
  likeSearchValue?: string;
  /** ロケールID */
  localeId?: string;
  /** 案件プロパティ使用種別 */
  matterPropertyType?: string;
  /** レコードの取得位置 */
  offset?: number;
  /** ソート条件情報オブジェクトの配列 */
  orderByList?: OrderByInfo[];
}
