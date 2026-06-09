declare namespace Module {
  /**
   * LDAP アクセスオブジェクト。
   *
   * LDAP サーバへの属性値の追加・変更・削除・検索機能を提供します。
   *
   * @since 8.0.37 (2025 Spring)
   * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Module.ldap/index.html
   */
  namespace ldap {
    interface LdapEnv {
      /** LDAP サーバ URL */
      url: string;
      /** コンテキストファクトリ */
      factory?: string;
      /** 認証用 DN */
      dn?: string;
      /** 認証用パスワード */
      pwd?: string;
    }

    interface LdapResult {
      /** エラーフラグ（成功時 false） */
      readonly error: boolean;
      /** エラーメッセージ */
      readonly message: string;
      /** 取得データ */
      readonly data?: unknown;
    }

    /**
     * LDAP に属性値を追加します。
     *
     * @param dn DN
     * @param name 属性名
     * @param value 属性値
     * @param env 接続情報
     */
    function add(dn: string, name: string, value: string, env: LdapEnv): LdapResult;

    /**
     * LDAP から属性値を削除します。
     *
     * @param dn DN
     * @param name 属性名
     * @param value 属性値（undefined で全値対象）
     * @param env 接続情報
     */
    function del(dn: string, name: string, value: string | undefined, env: LdapEnv): LdapResult;

    /**
     * DN にマッチする属性値を取得します。
     *
     * @param dn DN
     * @param env 接続情報
     */
    function get(dn: string, env: LdapEnv): LdapResult;

    /**
     * 属性値を新しい値に置き換えます。
     *
     * @param dn DN
     * @param id 属性名
     * @param newVal 新しい属性値
     * @param oldVal 旧属性値（undefined で全値対象）
     * @param env 接続情報
     */
    function modify(dn: string, id: string, newVal: string, oldVal: string | undefined, env: LdapEnv): LdapResult;

    /**
     * RFC 2254 フィルタ形式で属性値を検索します。
     *
     * @param dn DN
     * @param filter 検索フィルタ
     * @param env 接続情報
     */
    function search(dn: string, filter: string, env: LdapEnv): LdapResult;
  }
}
