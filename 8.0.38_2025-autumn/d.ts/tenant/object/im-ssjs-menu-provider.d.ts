/**
 * メニュープロバイダオブジェクト。
 *
 * 外部メニュープロバイダに関する設定情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/MenuProvider/index.html
 */
interface MenuProvider {
  /** 編集可能かどうか */
  editable: boolean;
  /** エンドポイント URL */
  endPoint: string;
  /** プロバイダID */
  id: string;
  /** ログイングループID（テナントID と同値） */
  loginGroup: string;
  /** パスワード */
  password: string;
  /** 匿名アクセスをサポートするかどうか */
  supportAnonymous: boolean;
  /** ポップアップを使用するかどうか */
  usePopup: boolean;
  /** ユーザ名 */
  user: string;
}
