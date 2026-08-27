# im_mirage 基本利用パターン（Java 版）

各クラス・アノテーションの属性・シグネチャは `reference/mirage-api-reference.md` を参照。ここでは典型的な実装パターンを示す。

## アーキテクチャと責務分担（最重要）

Repository・Service・Endpoint（Web API Maker、`java-im-web-api-maker-usage` の対象）の責務とトランザクション境界は以下の通り。

| 層 | 呼び出す相手 | トランザクション境界 | 責務 |
|---|---|---|---|
| Repository | DAO | `SessionTemplate.execute` で自ら境界を張る | DAO と密結合。書き込み系（insert/update/delete）は基本的に1件（1 Entity）単位で処理する。SELECT（取得）のみ、条件一致した全件をリストで返してよい |
| Service | Repository（複数可） | **複数の Repository メソッドを1つの操作としてまとめる場合のみ**、`SessionTemplate.execute` で自ら境界を張る | 単一の Repository メソッド呼び出しだけで完結する場合は、その Repository への薄いラッパーとなる（この場合 Service 側に `SessionTemplate` は不要） |
| Endpoint | Service | 持たない（`SessionTemplate` を直接使わない） | URL アクセス時の最初のエントリポイント。パラメータ変換のみを行い、`SessionTemplate`/`DAOFactory` を直接扱わない |

- **Service が `SessionTemplate.execute` で自らトランザクション境界を張るのは、複数の Repository メソッド呼び出しを1つの操作としてまとめる場合のみ。** 単一の Repository メソッドを呼ぶだけの薄いラッパーであれば、Repository 側の `SessionTemplate.execute` だけで十分であり、Service 側で重ねて境界を張る必要はない
- **複数 Repository を横断する場合、`SessionTemplate` はネスト呼び出しを検知し、外側（Service）で開始済みのトランザクション内で呼ばれた内側（Repository）の `execute` は commit/rollback を行わず外側に委ねる設計のため、`Service → Repository → DAO` と多段に `SessionTemplate.execute` が重なっても1つのトランザクションとして扱われる**（詳細は「パターン6: トランザクション管理」参照）
- **Repository が単一 Entity と 1:1 対応しない「ドメインモデル」を返す設計にする場合、Entity ⇔ モデルの相互変換は Repository の責務とする。** 本ページのコード例は簡略化のため Entity をそのまま Service 層へ返しているが、要件に応じてモデル変換を追加してよい

## パターン1: エンティティクラス

`.claude/rules/java-entity.md` の規約（publicフィールド・引数なしコンストラクタ・監査項目4フィールド）に従う。

```java
package jp.co.example.foo.entity;

import java.math.BigDecimal;
import java.sql.Timestamp;

import jp.co.intra_mart.mirage.annotation.Column;
import jp.co.intra_mart.mirage.annotation.PrimaryKey;
import jp.co.intra_mart.mirage.annotation.PrimaryKey.GenerationType;
import jp.co.intra_mart.mirage.annotation.Table;

/**
 * 発注情報エンティティ。<br>
 * テーブル名 {@code foo_order} の {@code foo_} は本ドキュメント全体で用いるプレースホルダ企業名
 * （パッケージ {@code jp.co.example.foo} と同一）に由来する接頭辞であり、ドメインを表す語ではないため
 * クラス名からは省略している（本パターン末尾「クラス名とテーブル名の対応」参照）。
 */
@Table(name = "foo_order")
public class OrderEntity {

    @PrimaryKey(generationType = GenerationType.APPLICATION)
    @Column(name = "order_id")
    public String orderId;

    @Column(name = "customer_name")
    public String customerName;

    @Column(name = "amount")
    public BigDecimal amount;

    @Column(name = "status")
    public String status;

    @Column(name = "create_user_cd")
    public String createUserCd;

    @Column(name = "create_date")
    public Timestamp createDate;

    @Column(name = "record_user_cd")
    public String recordUserCd;

    @Column(name = "record_date")
    public Timestamp recordDate;
}
```

- `@PrimaryKey` の `generationType` は本プロジェクトでは `GenerationType.APPLICATION` のみ使用する（`.claude/rules/java-entity.md` 参照）
- 監査項目4フィールドは必ず含める。値の設定は DAO 側（`AbstractDAO`）が自動で行うため、エンティティ側では宣言のみでよい

### クラス名とテーブル名の対応（努力目標。強制ルールではない）

**大半のテーブルでは、テーブル名（スネークケース）をそのままパスカルケース変換した名前が基本になる**（例: `order_status_history` → `OrderStatusHistoryEntity`）。**これは強制ルールではなく、実装時に意識してほしい努力目標。** 対応関係を機械的に強制すると、モジュール接頭辞や略号を含むテーブル名がそのままクラス名に混入し、かえって可読性を損なう場合があるため、その場合のみ可読性を優先した意訳を認める。

- 例: `foo_order` → `OrderEntity`（`foo_` は本ドキュメント共通のプレースホルダ企業名接頭辞であり、ドメインを表す語ではないため省略。実プロジェクトでの `b_m_`/`b_t_` 等のモジュール接頭辞も同様に扱ってよい）
- 例: `b_m_account_b` → `AccountBasicInfoEntity`（略号 `b_m_account_b` は素直な変換では意味が読み取りにくいため、意味の通る英語名に意訳）
- プレフィックスの除去・略号の意訳を行った場合でも、`@Table(name = "...")` に実テーブル名を明記し、クラス JavaDoc にもテーブル名を記載することで、テーブル名からクラス名への対応関係を追跡可能にしておく（本ページのパターン1の例、実装済みの `AccountBasicInfoEntity` を参照）

## パターン2: DAOクラス（基本CRUD、`AbstractDAO` 継承のみ）

独自クエリが不要な場合、`AbstractDAO` を継承するだけで insert/update/delete/find が使える。

```java
package jp.co.example.foo.dao;

import jp.co.intra_mart.mirage.ext.dao.AbstractDAO;
import jp.co.example.foo.entity.OrderEntity;

/**
 * foo_order を操作する DAO です。
 */
public class OrderDAO extends AbstractDAO<OrderEntity> {
}
```

**DAO は `new` で直接使わず、必ず `DAOFactory` 経由かつ `SessionTemplate.execute(SessionCallback)` のトランザクション境界内で呼び出す。** 呼び出し側の具体的な実装（`OrderRepository`/`StandardOrderRepository`）は「パターン6: トランザクション管理と Repository 層」を参照。

- `AbstractDAO` が提供する基本メソッド: `insert`/`insertBatch`/`update`/`updateBatch`/`delete`/`deleteBatch`/`find(Object... ids)`
- `find` の引数は主キーの値（複合主キーの場合は宣言順に複数指定）

## パターン3: DAOクラス（独自クエリ、2WaySQL の SQLファイルを使用）

一覧検索・集計等、基本CRUDでは表現できないクエリは SQLファイル + `sqlManager` の呼び出しで実装する。

```java
package jp.co.example.foo.dao;

import java.util.List;

import jp.co.intra_mart.mirage.ext.dao.AbstractDAO;
import jp.co.example.foo.entity.OrderEntity;

/**
 * foo_order を操作する DAO です。
 */
public class OrderDAO extends AbstractDAO<OrderEntity> {

    /** SQLファイルパス（クラスパス起点） */
    private static final String SQL_PATH = "jp/co/example/foo/dao/";

    /** ステータス別発注一覧取得SQL */
    private static final String SELECT_ORDERS_BY_STATUS = "select_orders_by_status.sql";

    /** 発注件数取得SQL */
    private static final String SELECT_ORDER_COUNT = "select_order_count.sql";

    /**
     * ステータスを指定して発注一覧を取得します。
     * @param status 検索対象のステータス（null の場合は全件）
     * @return 発注一覧
     */
    public List<OrderEntity> findByStatus(final String status) {
        final OrderEntity param = new OrderEntity();
        param.status = status;
        return super.sqlManager.getResultList(OrderEntity.class, SQL_PATH.concat(SELECT_ORDERS_BY_STATUS), param);
    }

    /**
     * ステータス別の発注件数を取得します。
     * @param status 検索対象のステータス
     * @return 件数
     */
    public int countByStatus(final String status) {
        final OrderEntity param = new OrderEntity();
        param.status = status;
        return super.sqlManager.getCount(SQL_PATH.concat(SELECT_ORDER_COUNT), param);
    }
}
```

SQLファイル（`src/main/resources` 配下に、DAOクラスと同じパッケージパスで配置する。上記の例では `src/main/resources/jp/co/example/foo/dao/select_orders_by_status.sql`）:

```sql
SELECT
  order_id,
  customer_name,
  amount,
  status
FROM
  foo_order
/*BEGIN*/
WHERE
  /*IF status != null*/
  status = /*status*/'dummy'
  /*END*/
/*END*/
ORDER BY
  order_id
```

- **SQLファイルは `src/main/java` ではなく `src/main/resources` 配下に置く。** DAOクラスと同じパッケージパス（`sqlPath` 定数の相対パス）を `src/main/resources` 配下に再現する。`src/main/java` にだけ置くとビルド後の実行時クラスパスに含まれず、`resource: xxx.sql is not found.` エラーになる（`.java` と `.sql` が同じディレクトリに同居しているように見えるプラットフォーム標準機能のソースツリーは、ビルド前のリポジトリ構成であり、Maven 標準レイアウトの `src/main/resources` とは別物）
- パラメータはエンティティ、または任意の JavaBean・`Map<String, Object>` を渡せる。SQL内のプレースホルダ名（`/*status*/` 等）とプロパティ名/キー名を一致させる
- 2WaySQL の基本構文（`/*IF*/`/`/*BEGIN*/`/`/*param*/'dummy'`）は JSSP 側（`.claude/rules/jssp-2way-sql.md`）と共通。ダミー値の役割・LIKE検索時のエスケープ方針も同様の考え方が適用できる

## パターン4: `/*FOR*/` ループ構文（im_mirage 専用）

JSSP のスクリプト開発モデルでは非対応だが、im_mirage では IN句の動的生成等に使用できる。

```sql
SELECT
  order_id,
  customer_name
FROM
  foo_order
WHERE
  order_id IN (
    /*FOR orderId : orderIds*/
    /*orderId*/'dummy'
    /*IF orderId_has_next*/, /*END*/
    /*END*/
  )
```

```java
public List<OrderEntity> findByIds(final List<String> orderIds) {
    final java.util.Map<String, Object> param = new java.util.HashMap<String, Object>();
    param.put("orderIds", orderIds);
    return super.sqlManager.getResultList(OrderEntity.class, SQL_PATH.concat("select_orders_by_ids.sql"), param);
}
```

## パターン5: DB方言別 SQLファイル

DB製品ごとに構文差分がある場合のみ、方言別ファイルを追加する（全方言分を機械的に複製する必要はない）。

```
src/main/resources/jp/co/example/foo/dao/
├── select_orders_by_status.sql            … ベースファイル（PostgreSQL 等、差分が無い場合はこれが使われる）
├── select_orders_by_status_oracle.sql     … Oracle 固有の構文が必要な場合のみ追加
└── select_orders_by_status_sqlserver.sql  … SQLServer 固有の構文が必要な場合のみ追加
```

- 実行時、`SqlManager` は稼働中の DB 方言に応じて `<ベース名>_<方言名>.sql` を優先的に探索し、無ければベースファイルにフォールバックする
- 方言名は `oracle`/`postgre`/`sqlserver`（`reference/mirage-api-reference.md` 参照）

## パターン6: トランザクション管理と Repository 層（`SessionTemplate`/`SessionCallback`、推奨パターン）

DB更新処理は必ず `SessionTemplate.execute(SessionCallback)` のトランザクション境界内で実行する。プラットフォーム標準機能（IM-Wiki 等）では「Repository インタフェース + Standard実装クラス」で DAO 呼び出しをカプセル化しており、業務ロジック（Service層）から DAO を直接呼び出さず Repository を経由させることで、DB アクセスの詳細をドメイン層から隠蔽できる。**DAO を `new` で直接生成したり、`SessionTemplate` でラップせずに `DAOFactory` から取得した DAO を呼び出したりしない。**

```java
package jp.co.example.foo.repository;

import java.util.List;

import jp.co.example.foo.entity.OrderEntity;

/**
 * 発注情報の永続化を担う Repository インタフェース。
 */
public interface OrderRepository {
    void register(OrderEntity order);
    List<OrderEntity> findByStatus(String status);
}
```

```java
package jp.co.example.foo.repository;

import java.util.List;

import jp.co.intra_mart.mirage.ext.dao.DAOFactory;
import jp.co.intra_mart.mirage.ext.session.SessionCallback;
import jp.co.intra_mart.mirage.ext.session.SessionTemplate;
import jp.co.intra_mart.mirage.session.Session;

import jp.co.example.foo.dao.OrderDAO;
import jp.co.example.foo.entity.OrderEntity;

/**
 * {@link OrderRepository} の標準実装クラス。
 */
public class StandardOrderRepository implements OrderRepository {

    @Override
    public void register(final OrderEntity order) {
        SessionTemplate.execute(new SessionCallback<Void, RuntimeException>() {
            @Override
            public Void execute(final Session session) {
                final OrderDAO dao = DAOFactory.getTenantDatabaseDAO(OrderDAO.class);
                dao.insert(order);   // createUserCd/createDate が自動設定される
                return null;
            }
        });
    }

    @Override
    public List<OrderEntity> findByStatus(final String status) {
        return SessionTemplate.execute(new SessionCallback<List<OrderEntity>, RuntimeException>() {
            @Override
            public List<OrderEntity> execute(final Session session) {
                final OrderDAO dao = DAOFactory.getTenantDatabaseDAO(OrderDAO.class);
                return dao.findByStatus(status);
            }
        });
    }
}
```

- `SessionTemplate.execute(...)` は `begin`/`commit`/`rollback`/`release` を自動的に行う。コールバック内で例外が発生すると自動的にロールバックされる
- 既にトランザクション中（ネスト呼び出し）の場合は、内側の `execute` は commit/rollback を行わず外側に委ねる（`SessionTemplate` が自動判定する）
- 参照系のみの処理でも `SessionTemplate.execute` でラップするのが標準パターン（コネクション取得・解放を統一するため）
- Repository はさらに上位の Service クラス（ビジネスロジック層）から呼び出す想定で、DAO は Repository の内部実装詳細として隠蔽する。具体的な Service クラスの実装は「パターン7: Service層」を参照

### Repository のファクトリクラス（`ServiceLoaderUtil`、推奨）

呼び出し側で `new StandardOrderRepository()` と直接生成せず、ファクトリクラス経由で取得する。`jp.co.intra_mart.common.aid.jdk.java.util.ServiceLoaderUtil` の `loadTopPriority` を使うと、`META-INF/services/<インタフェースのFQN>` に優先度の高い実装クラスを登録するだけで差し替え可能な拡張ポイントになる（未登録時は既定実装にフォールバックする）。

```java
package jp.co.example.foo.repository;

import jp.co.intra_mart.common.aid.jdk.java.util.ServiceLoaderUtil;

/**
 * {@link OrderRepository} のインスタンスを取得するファクトリクラス。
 */
public final class OrderRepositoryFactory {

    private static final class LazyHolder {
        private static final OrderRepository INSTANCE = createInstance();

        private static OrderRepository createInstance() {
            final OrderRepository topPriority = ServiceLoaderUtil.loadTopPriority(OrderRepository.class);
            return topPriority != null ? topPriority : new StandardOrderRepository();
        }
    }

    private OrderRepositoryFactory() {
    }

    /**
     * {@link OrderRepository} のインスタンスを取得します。
     * @return Repository インスタンス
     */
    public static OrderRepository getInstance() {
        return LazyHolder.INSTANCE;
    }
}
```

呼び出し側（Service 層）は `new StandardOrderRepository()` ではなく `OrderRepositoryFactory.getInstance()` を使う。

```java
private final OrderRepository orderRepository = OrderRepositoryFactory.getInstance();
```

- **`ServiceLoaderUtil.loadPriority(Class)` は登録された全実装を優先度（`@Priority`）順の `Collection` として返す。** 単一インスタンスだけが欲しい場合は、先頭要素を取り出す `loadTopPriority(Class)`（`jp.co.intra_mart.common.aid.jdk.java.util.ServiceLoaderUtil`。登録が無ければ `null`）を使う。`Collection` を返す `loadPriority` をそのまま Repository 取得に使うと呼び出し側で毎回先頭要素を取り出す処理が必要になり冗長なため、単一実装の解決には `loadTopPriority` が適している
- `META-INF/services/jp.co.example.foo.repository.OrderRepository` ファイルに実装クラスの完全修飾名を1行記載すると、Java 標準の `ServiceLoader` 機構で検出される。優先度を明示したい場合は実装クラスに `@jp.co.intra_mart.common.annotation.Priority(値)` を付与する（値が大きいほど優先度が高い。未指定の実装は `@Priority` 指定済みの実装より優先度が低い）
- `META-INF/services` への登録が無い場合は `StandardOrderRepository` にフォールバックする。この仕組みにより、他モジュール（プラグイン等）が優先度の高い実装を登録するだけで、呼び出し側のコードを変更せずに差し替えられる
- 同じパターンで `OrderItemRepositoryFactory` も実装する（コードはパターン2と同様のため省略）

## パターン7: Service層（複数 Repository の呼び出しと同一トランザクション）

Service は Repository を呼び出すビジネスロジック層。**複数の Repository（＝複数テーブル）を横断する操作を同一トランザクションにまとめたい場合のみ、Service 自身が `SessionTemplate.execute` で境界を張る。** 単一の Repository メソッドを呼ぶだけの場合は、Repository 側の境界だけで十分であり、Service 側で重ねて `SessionTemplate` を使う必要はない。

```java
package jp.co.example.foo.repository;

import jp.co.example.foo.entity.OrderItemEntity;

/**
 * 発注明細情報の永続化を担う Repository インタフェース。
 */
public interface OrderItemRepository {
    void register(OrderItemEntity item);
}
```

```java
package jp.co.example.foo.repository;

import jp.co.intra_mart.mirage.ext.dao.DAOFactory;
import jp.co.intra_mart.mirage.ext.session.SessionCallback;
import jp.co.intra_mart.mirage.ext.session.SessionTemplate;
import jp.co.intra_mart.mirage.session.Session;

import jp.co.example.foo.dao.OrderItemDAO;
import jp.co.example.foo.entity.OrderItemEntity;

/**
 * {@link OrderItemRepository} の標準実装クラス。
 * DAO 実装（{@code OrderItemDAO extends AbstractDAO<OrderItemEntity>}）はパターン2と同様のため省略する。
 */
public class StandardOrderItemRepository implements OrderItemRepository {

    @Override
    public void register(final OrderItemEntity item) {
        SessionTemplate.execute(new SessionCallback<Void, RuntimeException>() {
            @Override
            public Void execute(final Session session) {
                final OrderItemDAO dao = DAOFactory.getTenantDatabaseDAO(OrderItemDAO.class);
                dao.insert(item);
                return null;
            }
        });
    }
}
```

**Service も Repository と同様に「インタフェース + Standard実装クラス + ファクトリクラス」に分割する。** 呼び出し側（Endpoint）は `OrderService` インタフェースにのみ依存し、`OrderServiceFactory.getInstance()` で実装を取得する。

```java
package jp.co.example.foo.service;

import java.util.List;

import jp.co.example.foo.entity.OrderEntity;
import jp.co.example.foo.entity.OrderItemEntity;

/**
 * 発注情報のビジネスロジックを提供する Service インタフェース。
 */
public interface OrderService {
    void register(OrderEntity order, List<OrderItemEntity> items);
    List<OrderEntity> findByStatus(String status);
}
```

```java
package jp.co.example.foo.service;

import java.util.List;

import jp.co.intra_mart.mirage.ext.session.SessionCallback;
import jp.co.intra_mart.mirage.ext.session.SessionTemplate;
import jp.co.intra_mart.mirage.session.Session;

import jp.co.example.foo.entity.OrderEntity;
import jp.co.example.foo.entity.OrderItemEntity;
import jp.co.example.foo.repository.OrderItemRepository;
import jp.co.example.foo.repository.OrderItemRepositoryFactory;
import jp.co.example.foo.repository.OrderRepository;
import jp.co.example.foo.repository.OrderRepositoryFactory;

/**
 * {@link OrderService} の標準実装クラス。
 */
public class StandardOrderService implements OrderService {

    private final OrderRepository orderRepository = OrderRepositoryFactory.getInstance();
    private final OrderItemRepository orderItemRepository = OrderItemRepositoryFactory.getInstance();

    /**
     * 発注ヘッダと発注明細を同一トランザクションで登録します。<br>
     * {@link OrderRepository}（foo_order テーブル）と {@link OrderItemRepository}（foo_order_item テーブル）
     * という複数 Repository を横断する操作のため、Service 自身が {@code SessionTemplate.execute} で
     * トランザクション境界を張り、Repository 側の {@code SessionTemplate.execute}（ネスト呼び出し）は
     * この境界に合流する。
     *
     * @param order 発注ヘッダ
     * @param items 発注明細一覧
     */
    @Override
    public void register(final OrderEntity order, final List<OrderItemEntity> items) {
        SessionTemplate.execute(new SessionCallback<Void, RuntimeException>() {
            @Override
            public Void execute(final Session session) {
                orderRepository.register(order);
                for (final OrderItemEntity item : items) {
                    orderItemRepository.register(item);
                }
                return null;
            }
        });
    }

    /**
     * 単一の Repository メソッドを呼ぶだけの場合、Service は薄いラッパーとなる。<br>
     * この場合は Repository 側（{@code StandardOrderRepository#findByStatus}）が既に
     * {@code SessionTemplate.execute} で境界を張っているため、Service 側で重ねて
     * トランザクション境界を張る必要はない。
     *
     * @param status 検索対象のステータス
     * @return 発注一覧
     */
    @Override
    public List<OrderEntity> findByStatus(final String status) {
        return orderRepository.findByStatus(status);
    }
}
```

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.common.aid.jdk.java.util.ServiceLoaderUtil;

/**
 * {@link OrderService} のインスタンスを取得するファクトリクラス。<br>
 * 実装パターンは {@code OrderRepositoryFactory}（パターン6参照）と同様。
 */
public final class OrderServiceFactory {

    private static final class LazyHolder {
        private static final OrderService INSTANCE = createInstance();

        private static OrderService createInstance() {
            final OrderService topPriority = ServiceLoaderUtil.loadTopPriority(OrderService.class);
            return topPriority != null ? topPriority : new StandardOrderService();
        }
    }

    private OrderServiceFactory() {
    }

    /**
     * {@link OrderService} のインスタンスを取得します。
     * @return Service インスタンス
     */
    public static OrderService getInstance() {
        return LazyHolder.INSTANCE;
    }
}
```

- Service が複数の Repository を横断する場合、Service 自身のトランザクション境界内で各 Repository のメソッドを呼び出す。Repository 側の `SessionTemplate.execute` はネスト呼び出しとして検知され、外側（Service）のコミット/ロールバックに合流する
- **単一の Repository メソッドを呼ぶだけの Service メソッド（例: `findByStatus`）では、`SessionTemplate.execute` は不要。** Repository 側の境界だけで完結するため、Service 側で重ねて境界を張ると冗長になる。Service が `SessionTemplate` を使うのは、複数の Repository メソッド呼び出しを1つの操作としてまとめたい場合のみ
- Repository の書き込み系メソッド（`insert`/`update`/`delete` 相当）は基本的に1件（1 Entity）を単位として実装する。複数件をまとめて扱いたい場合は、Service 層でループしながら複数回 Repository を呼び出す（本パターンの `register` メソッドを参照）か、`insertBatch` 等のバッチ系メソッドを使う
- Endpoint（Web API Maker）は `OrderService` インタフェースのみに依存し、`OrderServiceFactory.getInstance()` でインスタンスを取得する。`SessionTemplate`/`DAOFactory` は直接扱わない（`java-im-web-api-maker-usage` を参照）

## パターン8: アンチパターン集（避けること）

```java
// NG: DAO を new で直接生成する
OrderDAO dao = new OrderDAO();  // sqlManager フィールドが未設定のまま NullPointerException になる

// NG: 監査項目を手動で設定する
order.createUserCd = "system";  // AbstractDAO#insert が自動設定するため不要かつ二重設定のリスク
order.createDate = new java.sql.Timestamp(System.currentTimeMillis());
dao.insert(order);

// NG: SqlManager の SQLファイル系メソッドと xxxBySql 系メソッドを混同する
sqlManager.getResultList(OrderEntity.class, "SELECT * FROM foo_order", param);
// → 第2引数はSQLファイルパスとして解釈される。SQL文字列を直接渡したい場合は getResultListBySql を使う

// NG: トランザクション境界の外で更新系処理を実行する
OrderDAO dao = DAOFactory.getTenantDatabaseDAO(OrderDAO.class);
dao.insert(order);  // SessionTemplate.execute でラップされていない

// NG: JSSP の 2WaySQL ファイルをそのまま Java 側に流用する（/*FOR*/ の有無以外にも、
// パラメータの渡し方（オブジェクト/Map/Bean）や呼び出し API が異なるため、書き直しが必要）

// NG: 複数 Repository を横断する処理なのに、Service がトランザクション境界を張らない
// → orderRepository.register と orderItemRepository.register がそれぞれ別トランザクションで
//    コミットされてしまい、片方だけ成功する不整合が起こり得る
public void register(final OrderEntity order, final List<OrderItemEntity> items) {
    orderRepository.register(order);          // Repository 内で独立にコミットされる
    for (final OrderItemEntity item : items) {
        orderItemRepository.register(item);   // 別トランザクションでコミットされる
    }
}

// NG: Endpoint（Web API Maker）が SessionTemplate/DAOFactory を直接扱う
// → トランザクション境界の所有者が Service 層でなくなり、責務が Endpoint に漏れ出す
@Path("/foo/orders/{orderId}")
@GET
public OrderEntity get(@Variable(name = "orderId") final String orderId) {
    return SessionTemplate.execute(new SessionCallback<OrderEntity, RuntimeException>() {
        public OrderEntity execute(final Session session) {
            return DAOFactory.getTenantDatabaseDAO(OrderDAO.class).find(orderId);
        }
    });
}

// NG: Repository/Service を new StandardXxx() で直接生成する
// → ファクトリクラス（ServiceLoaderUtil.loadTopPriority による拡張ポイント）を経由しないため、
//    呼び出し側が具象クラスに依存してしまい、優先度の高い実装への差し替えができなくなる
private final OrderRepository orderRepository = new StandardOrderRepository();  // OrderRepositoryFactory.getInstance() を使う

// NG: 単一実装の取得に loadPriority（Collection を返す）をそのまま使う
// → 先頭要素を取り出す処理が呼び出し側ごとに重複する。単一インスタンスが欲しい場合は loadTopPriority を使う
final Collection<OrderRepository> repositories = ServiceLoaderUtil.loadPriority(OrderRepository.class);
final OrderRepository repository = repositories.isEmpty() ? new StandardOrderRepository() : repositories.iterator().next();
```
