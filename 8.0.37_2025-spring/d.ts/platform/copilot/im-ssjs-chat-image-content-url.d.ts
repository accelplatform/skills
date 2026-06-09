/**
 * 画像 DataURL 情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ChatImageContentUrl/index.html
 */
interface ChatImageContentUrl {
  /** 画像の詳細性レベル */
  detail?: ChatImageContentUrl.Detail;
  /** Base64 エンコード形式の DataURL */
  url: string;
}

declare namespace ChatImageContentUrl {
  type Detail = 'auto' | 'low' | 'high';
}
