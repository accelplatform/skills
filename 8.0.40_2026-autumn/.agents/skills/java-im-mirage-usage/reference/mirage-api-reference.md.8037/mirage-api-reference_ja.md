# im_mirage API リファレンス（Java 版）

intra-mart Accel Platform コアソース（`im_mirage` モジュール、`jp.co.intra_mart.mirage.*`）の実クラス定義に基づく。記憶や推測でメソッド・属性を補わないこと。

## パッケージ構成

```
jp.co.intra_mart.mirage.annotation
├── Table       … エンティティクラスに付与、テーブル名を指定
├── Column      … フィールド/メソッドに付与、カラム名を指定
├── PrimaryKey  … 主キーであることを表す。GenerationType（列挙）を持つ
├── Transient   … マッピング対象外にするプロパティ指定
└── In / InOut / Out / ResultSet … ストアドプロシージャ呼び出し時のパラメータ方向指定

jp.co.intra_mart.mirage
├── SqlManager (インタフェース)         … SQL実行の中核 API
├── SqlManagerImpl                      … SqlManager の標準実装（IntramartSqlManager が継承）
└── IterationCallback<T, R>             … 大量データを逐次処理する際のコールバック

jp.co.intra_mart.mirage.ext
└── IntramartSqlManager extends SqlManagerImpl … intra-mart向け拡張（SQLファイルのDB方言解決を追加）

jp.co.intra_mart.mirage.ext.dao
├── DAO<T> (インタフェース)             … DAOの基底インタフェース
├── BaseDAO<T> implements DAO<T>        … protected IntramartSqlManager sqlManager フィールドを保持
├── AbstractDAO<T> extends BaseDAO<T>   … insert/update/delete/find の共通実装（監査項目自動設定）
└── DAOFactory                          … DAOインスタンスの取得・キャッシュ・自動リリースを担う唯一の入口

jp.co.intra_mart.mirage.ext.session
├── SessionTemplate                     … begin/commit/rollback/release を自動化するテンプレート
└── SessionCallback<T, E extends Exception> … SessionTemplate に渡すコールバックインタフェース

jp.co.intra_mart.mirage.ext.util
└── EntityHelper                        … 監査項目（createUserCd/createDate/recordUserCd/recordDate）の自動設定

jp.co.intra_mart.mirage.dialect / jp.co.intra_mart.mirage.ext.dialect
└── Dialect実装（Oracle/PostgreSQL/SQLServer 等）… SQLファイルのDB方言解決に使用
```

## エンティティアノテーション

### `@Table`

```java
package jp.co.intra_mart.mirage.annotation;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface Table {
    String name();   // マッピング先のテーブル名（必須）
}
```

未指定時は `NameConverter` によりクラス名から自動変換されるが、本プロジェクトでは明示指定を必須とする（`.agents/requirements/java-entity/AGENTS.md` 参照）。

### `@Column`

```java
package jp.co.intra_mart.mirage.annotation;

@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Column {
    String name();   // マッピング先のカラム名（必須）
}
```

### `@PrimaryKey`

```java
package jp.co.intra_mart.mirage.annotation;

@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface PrimaryKey {
    GenerationType generationType();   // 主キー生成方式（必須）
    String generator() default "";     // 生成器の識別子（APPLICATION以外で使用）

    enum GenerationType {
        APPLICATION,   // アプリケーション側でID生成（本プロジェクトで使用するのはこれのみ）
        IDENTITY,      // DB側のIDENTITY/AUTO_INCREMENTに依存
        SEQUENCE       // DB側のSEQUENCEに依存
    }
}
```

`.agents/requirements/java-entity/AGENTS.md` により、本プロジェクトでは `GenerationType.APPLICATION` 以外の使用を禁止している。

## DAO 層

### `DAO<T>` / `BaseDAO<T>`

```java
package jp.co.intra_mart.mirage.ext.dao;

public interface DAO<T> {
}

public abstract class BaseDAO<T> implements DAO<T> {
    protected IntramartSqlManager sqlManager;   // DAOFactory がリフレクション経由で注入する
}
```

- `sqlManager` フィールドは `DAOFactory` がリフレクションで設定する。DAO を `new` で直接生成すると `null` のままになり、呼び出し時に `NullPointerException` になる

### `AbstractDAO<T>`

```java
package jp.co.intra_mart.mirage.ext.dao;

public abstract class AbstractDAO<T> extends BaseDAO<T> {

    public int insert(T entity);              // EntityHelper.setCreateFields 後に sqlManager.insertEntity
    public int insertBatch(T... entities);     // 複数件の insert（内部で1件ずつ insertEntity）
    public int delete(T entity);               // sqlManager.deleteEntity
    public int deleteBatch(T... entities);      // sqlManager.deleteBatch
    public int update(T entity);                // EntityHelper.setRecordFields 後に sqlManager.updateEntity
    public int updateBatch(T... entities);       // sqlManager.updateBatch
    public T find(Object... ids);                 // sqlManager.findEntity(エンティティ型, ids)

    protected Class<T> getEntityType();            // ジェネリクスの型引数からエンティティ型を解決（内部利用）
}
```

- **`update`/`updateBatch` は部分更新ではなく、主キー以外の全カラムを SET 句に並べる。** 値を設定していないフィールドは `null` で上書きされる。`update` が設定するのは `recordUserCd`/`recordDate` のみで `createUserCd`/`createDate` は補完されないため、新規に組み立てた Entity を渡すと登録時の監査証跡が消える
- **更新時は `find()` で既存 Entity を取得し、変更点のみ反映してから `update` に渡す。** 一部カラムのみ更新する場合は SQLファイル＋`sqlManager.executeUpdate` を使う
- 独自クエリを追加する場合は `AbstractDAO<エンティティ型>` を継承した具象クラスに、`protected sqlManager` を使うメソッドを追加する

### `DAOFactory`

```java
package jp.co.intra_mart.mirage.ext.dao;

public final class DAOFactory {

    // テナントDB用のDAOインスタンスを取得する（スレッドローカルにキャッシュ）
    public static <T extends DAO<?>> T getTenantDatabaseDAO(Class<T> clazz);

    // シェアードDB用のDAOインスタンスを取得する（接続IDごとにキャッシュ）
    public static <T extends DAO<?>> T getSharedDatabaseDAO(Class<T> clazz, String connectId);
}
```

- いずれも `DAO<?>` を実装したクラスの `Class` オブジェクトを渡し、インスタンスを取得する
- 取得したインスタンスはスレッドローカルにキャッシュされ、セッション（`Session`）解放時に自動的に解放される。呼び出し側でキャッシュ管理を意識する必要はない
- コンストラクタは `private`。必ず本クラスの static メソッド経由で取得する

## `EntityHelper`（監査項目の自動設定、内部利用）

```java
package jp.co.intra_mart.mirage.ext.util;

public final class EntityHelper {
    public static final String CREATE_USER_CD_FIELD_NAME = "createUserCd";
    public static final String CREATE_DATE_FIELD_NAME = "createDate";
    public static final String RECORD_USER_CD_FIELD_NAME = "recordUserCd";
    public static final String RECORD_DATE_FIELD_NAME = "recordDate";

    public static <T> void setCreateFields(T... entities);   // 監査項目4項目すべてを、null の場合のみ設定
    public static <T> void setRecordFields(T... entities);   // record系2項目を常に設定（既存値を上書きする）
}
```

- `AbstractDAO#insert`/`update` から自動的に呼び出される。DAO 呼び出し側が直接呼ぶ必要はない
- `setCreateFields` は監査項目4項目すべてを対象とし、既に値が設定されているフィールドは上書きしない（`null` の場合のみ設定）。`setRecordFields` は record系2項目のみを対象とし、既存の値があっても常に上書きする
- **監査項目4フィールドを1つでも宣言していないエンティティを `AbstractDAO#insert`/`update` に渡すと `NullPointerException` になる。** `EntityHelper` は未宣言のプロパティに対して `null` が返る戻り値を `null` チェックせずに使用するため。`insert`/`insertBatch` は4項目すべてが、`update`/`updateBatch` は record系2項目が必須となる（`delete`/`deleteBatch` は監査項目に触れないため影響しない）。`.agents/requirements/java-entity/AGENTS.md` の「監査証跡フィールド（必須）」は、規約上の要求であると同時に実装上の強制要件でもある

## `SqlManager`（SQL実行の中核インタフェース）

```java
package jp.co.intra_mart.mirage;

public interface SqlManager {

    // --- SQLファイル（2WaySQL）実行系 ---
    int getCount(String sqlPath);
    int getCount(String sqlPath, Object param);
    <T> List<T> getResultList(Class<T> clazz, String sqlPath);
    <T> List<T> getResultList(Class<T> clazz, String sqlPath, Object param);
    <T> T getSingleResult(Class<T> clazz, String sqlPath);
    <T> T getSingleResult(Class<T> clazz, String sqlPath, Object param);
    <T, R> R iterate(Class<T> clazz, IterationCallback<T, R> callback, String sqlPath);
    <T, R> R iterate(Class<T> clazz, IterationCallback<T, R> callback, String sqlPath, Object param);
    int executeUpdate(String sqlPath);
    int executeUpdate(String sqlPath, Object param);

    // --- エンティティCRUD ---
    int insertEntity(Object entity);
    <T> int insertBatch(T... entities);
    <T> int insertBatch(List<T> entities);
    int updateEntity(Object entity);
    <T> int updateBatch(T... entities);
    <T> int updateBatch(List<T> entities);
    int deleteEntity(Object entity);
    <T> int deleteBatch(T... entities);
    <T> int deleteBatch(List<T> entities);
    <T> T findEntity(Class<T> clazz, Object... id);

    // --- ストアドプロシージャ/ファンクション呼び出し ---
    void call(String procedureName);
    void call(String procedureName, Object parameter);
    <T> T call(Class<T> resultClass, String functionName);
    <T> T call(Class<T> resultClass, String functionName, Object param);
    <T> List<T> callForList(Class<T> resultClass, String functionName);
    <T> List<T> callForList(Class<T> resultClass, String functionName, Object param);

    // --- 素のSQL文字列実行系（2WaySQLではない。"?" プレースホルダを使用） ---
    <T> List<T> getResultListBySql(Class<T> clazz, String sql);
    <T> List<T> getResultListBySql(Class<T> clazz, String sql, Object... params);
    <T> T getSingleResultBySql(Class<T> clazz, String sql);
    <T> T getSingleResultBySql(Class<T> clazz, String sql, Object... params);
    <T, R> R iterateBySql(Class<T> clazz, IterationCallback<T, R> callback, String sql);
    <T, R> R iterateBySql(Class<T> clazz, IterationCallback<T, R> callback, String sql, Object... params);
    int executeUpdateBySql(String sql);
    int executeUpdateBySql(String sql, Object... params);
}
```

- **SQLファイル系（`sqlPath` 引数）と `xxxBySql` 系（`sql` 引数）を混同しない。** 前者はクラスパス上の 2WaySQL ファイルへのパス、後者は SQL 文そのもの（プレースホルダは `?`、2WaySQL のコメント構文は使えない）
- `param` にはエンティティ・任意の JavaBean・`Map<String, Object>` のいずれも渡せる。SQL内のプレースホルダ名とプロパティ名/キー名を一致させる

### `getSingleResult`/`findEntity` の戻り値仕様（JPA と異なる）

単一結果を返す API（`getSingleResult`/`getSingleResultBySql`/`findEntity`、および `AbstractDAO#find`）は、すべて内部で同一の実装に集約される。JPA の `getSingleResult` とは挙動が異なる。

| 状況 | 挙動 |
|------|------|
| 0件 | 例外にならず `null` を返す |
| 2件以上 | 例外にならず ResultSet の先頭1行を返す（残りは捨てられる） |

- `ResultSet#next()` を1回しか呼ばないため、**件数の一意性は保証されない**。一意性が必要なクエリでは、主キー／一意制約で担保するか、`getResultList` で取得して件数を検証する
- `ORDER BY` の無いクエリが複数件ヒットした場合、どの1件が返るかは DB の返却順に依存する
- **戻り値は必ず `null` チェックする**

### `getCount` に渡す SQLファイルの制約

`getCount` は渡された SQL を Dialect の `getCountSql` で `SELECT COUNT(*) FROM (<渡した SQL>)` のようにサブクエリへ丸ごと包む。

- **`SELECT COUNT(*)` を書いてはいけない。** `SELECT COUNT(*) FROM (SELECT COUNT(*) ...)` となり、**例外を出さずに常に `1` を返す**。リスト取得と同じ形の SELECT を渡すこと
- **`ORDER BY` を書いてはいけない。** サブクエリの内側に入るため、SQLServer では構文エラーになる

## `IntramartSqlManager`（intra-mart向け拡張、DAOが実際に使うクラス）

```java
package jp.co.intra_mart.mirage.ext;

public class IntramartSqlManager extends SqlManagerImpl {
    // SqlManager のSQLファイル系メソッドをオーバーライドし、
    // getSqlPathWithDialect(sqlPath) で方言別ファイルに解決してから実行する
}
```

### SQLファイルの DB方言解決ロジック

`sqlPath`（例: `jp/co/example/foo/dao/select_orders.sql`）に対し、稼働中DBの方言名を使って `<ファイル名>_<方言名>.<拡張子>` を組み立て、クラスパス上に存在すればそちらを使用し、存在しなければ元の `sqlPath` にフォールバックする。

| DB製品 | 方言名（ファイル名サフィックス） |
|------|------|
| Oracle | `oracle` |
| PostgreSQL | `postgre` |
| SQLServer | `sqlserver` |

例: `select_orders.sql` に対して `select_orders_oracle.sql` が存在すれば Oracle 環境ではそちらが優先される。差分が無いDB製品向けにはファイルを作成しなくてよい（ベースファイルにフォールバックする）。

## `SessionTemplate` / `SessionCallback`（トランザクション管理）

```java
package jp.co.intra_mart.mirage.ext.session;

public class SessionTemplate {
    // begin → callback.execute(session) → commit（例外時 rollback）→ release を自動実行する
    public static <T, E extends Exception> T execute(SessionCallback<T, E> callback) throws E;
}

public interface SessionCallback<T, E extends Exception> {
    T execute(Session session) throws E;
}
```

- 既にトランザクション中（`IntramartSession#inTransaction()` が true）の場合、内側の `execute` は commit/rollback を行わず外側のトランザクションに委ねる（ネスト呼び出し対応）
- コールバック内で例外が発生すると自動的にロールバックされ、例外はそのまま呼び出し元に伝播する
- `finally` で必ず `session.release()` が呼ばれる（`SQLRuntimeException` は握りつぶされる設計）

## `ServiceLoaderUtil`（Repository/Service ファクトリでの実装差し替え）

`im_mirage` 自体の API ではなく、プラットフォーム共通のユーティリティ（`im_jdk_assist` モジュール）。Repository/Service のファクトリクラスで、`META-INF/services` に登録された実装への差し替えを可能にするために使用する。

```java
package jp.co.intra_mart.common.aid.jdk.java.util;

public final class ServiceLoaderUtil {

    // 登録された全実装を @Priority の降順（未指定は最後）でソートして返す。結果はキャッシュされる
    public static <S> Collection<S> loadPriority(Class<S> service);
    public static <S> Collection<S> loadPriority(Class<S> service, ClassLoader classLoader);   // キャッシュされない

    // loadPriority の結果から先頭（優先度最高）のみを返す。登録が無ければ null
    public static <S> S loadTopPriority(Class<S> service);
    public static <S> S loadTopPriority(Class<S> service, ClassLoader classLoader);

    // 標準の ServiceLoader#load をそのまま呼び出す（優先度ソートなし、結果はキャッシュされない）
    public static <S> ServiceLoader<S> load(Class<S> service);
}
```

```java
package jp.co.intra_mart.common.annotation;

@Retention(RetentionPolicy.RUNTIME)
@Target({ ElementType.TYPE })
public @interface Priority {
    int value();   // 値が大きいほど優先度が高い。未指定の実装より必ず優先される
}
```

- **単一インスタンスの取得には `loadTopPriority` を使う。** `loadPriority` は登録された全実装を `Collection` で返すメソッドで、複数実装を順に処理したい場合（拡張ポイントのチェイン等）に使う。Repository/Service のような「1つの実装を取得したい」ファクトリでは `loadTopPriority` の方が適切（`loadPriority(...).iterator().next()` と等価だが、空判定込みで簡潔）
- 実装クラスを `META-INF/services/<インタフェースの完全修飾名>` ファイルに1行（実装クラスの完全修飾名）記載すると、Java標準の `ServiceLoader` 機構で検出される
- 優先度を指定したい実装クラスには `@jp.co.intra_mart.common.annotation.Priority(値)` を付与する。`@Priority` が無い実装は、指定済みの実装より必ず優先度が低くなる
- `loadTopPriority`/`loadPriority`（`ClassLoader` を渡さないオーバーロード）の結果はキャッシュされる。動的にキャッシュをクリアしたい場合は `ServiceLoaderUtil.clearCache()` を使う

## 2WaySQL 構文（im_mirage 版）

| 構文 | 用途 | JSSP側（`.agents/requirements/jssp-2way-sql/AGENTS.md`）との差異 |
|------|------|------|
| `/*IF condition*/.../*END*/` | 条件分岐 | 同一 |
| `/*BEGIN*/.../*END*/` | オプショナルブロック | 同一 |
| `/*param*/'dummy'` | バインドプレースホルダ | 同一 |
| `IN /*param*/('dummy')` | `List`/配列を `(?, ?, ?)` へ展開（IN句の動的生成） | 同一 |
| `/*$param*/dummy` | 値の直接埋め込み。バインドしない | 同一 |
| `/*FOR item in list*/.../*END*/` | ループ | **im_mirage と LogicDesigner で使用可。JSSP（スクリプト開発モデル）では非対応** |

- **`/*FOR*/` の区切り子は、前後を半角スペースで挟んだ `in` または `IN`。** 区切りが一致しない場合は `TwoWaySQLException: For expression is invalid.` になる
- **`/*FOR*/` ブロック内で参照できるのは、ループ変数名に束ねられた要素1つだけ。** IN句の動的生成には `/*FOR*/` ではなく `IN /*param*/('dummy')` を使う
- **`IN /*param*/('dummy')` は、`null` と空リストのどちらでもバインド部分ごと出力されず、`IN` が裸で残って SQL が壊れる。** `/*IF list != null*/` だけでは空リストを止められないため、`/*IF list != null && list.size() > 0*/` のように両方を止めるガードで囲む（OGNL は `&&` を短絡評価するため、`null` でも `size()` は評価されず NPE にならない）
- **`/*$param*/dummy` は値をバインドせず、SQL 本文へそのまま連結する。動的なテーブル名・カラム名・ソート順にのみ使用し、値は必ずホワイトリスト検証する**（`.agents/requirements/jssp-2way-sql/AGENTS.md` と同じ扱い）。パーサが拒否するのは値に `;` が含まれる場合のみで、`OR 1=1 --` や `UNION SELECT ...` はそのまま SQL に入る。値をパラメータとして渡す場合は `/*param*/'dummy'` を使う
- **`/*$param*/` が辿るプロパティのドットは1段まで。** `/*$a.b.c*/` は `a.b` までを評価し、`.c` 以降は無視して `a.b` の文字列表現をそのまま埋め込む（例外にならない）
