/**
 * ノード種別。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/com/imwCodeList.html#NodeType
 */
declare const NodeType: {
  /** 開始ノード */
  readonly nodeTyp_Start: '0';
  /** 終了ノード */
  readonly nodeTyp_End: '1';
  /** 申請ノード */
  readonly nodeTyp_Apply: '2';
  /** 承認ノード */
  readonly nodeTyp_Approve: '3';
  /** 動的処理ノード */
  readonly nodeTyp_Dynamic: '4';
  /** システムノード */
  readonly nodeTyp_System: '5';
  /** 確認ノード */
  readonly nodeTyp_Confirm: '6';
  /** 同期開始ノード */
  readonly nodeTyp_Sync_Start: '7';
  /** 同期終了ノード */
  readonly nodeTyp_Sync_End: '8';
  /** 分岐開始ノード */
  readonly nodeTyp_Branch_Start: '9';
  /** 分岐終了ノード */
  readonly nodeTyp_Branch_End: '10';
  /** 横配置ノード */
  readonly nodeTyp_Horizontal: '11';
  /** 縦配置ノード */
  readonly nodeTyp_Vertical: '12';
  /** テンプレート置換ノード */
  readonly nodeTyp_Template: '13';
  /** テンプレート開始ノード */
  readonly nodeTyp_Template_Start: '14';
  /** テンプレート終了ノード */
  readonly nodeTyp_Template_End: '15';
  /** コメント */
  readonly nodeTyp_Comment: '16';
  /** スイムレーン */
  readonly nodeTyp_Swimlane: '17';
};

type NodeType = (typeof NodeType)[keyof typeof NodeType];
