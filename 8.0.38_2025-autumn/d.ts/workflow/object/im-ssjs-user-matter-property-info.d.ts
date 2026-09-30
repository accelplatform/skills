/**
 * ユーザデータ案件プロパティ情報オブジェクト。
 *
 * ユーザデータに紐づく案件プロパティのキーと値を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/UserMatterPropertyInfo/index.html
 */
interface UserMatterPropertyInfo {
  // --- 条件付き必須項目 ---
  // **新規作成 API 使用時**: 必須
  // **更新 API 使用時**: いずれか1つ以上必須
  // **削除 API 使用時**: いずれか1つ以上必須

  /** 案件プロパティキー */
  matterPropertyKey?: string;
  /** ユーザデータID */
  userDataId?: string;

  // --- 任意項目 ---
  // TODO: API ドキュメントでは削除時必須項目扱いとなっているが、誤り

  /** 案件プロパティ値 */
  matterPropertyValue?: string;
}
