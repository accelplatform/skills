# IM-Propagation API リファレンス（Java 版）

intra-mart Accel Platform コアソース（`im_propagation` モジュール）の実クラス定義・Javadoc に基づく。記憶や推測でメソッドを補わないこと。

## パッケージ構成

```
jp.co.intra_mart.foundation.propagation
├── PropagationManager          … データ送信のエントリポイント（インタフェース）
├── PropagationManagerFactory   … PropagationManager を取得するファクトリ（抽象クラス）
├── Encoder<D, G>                … データモデル → GenericModel 変換インタフェース
├── Decoder<G, D>                … GenericModel → データモデル変換インタフェース
└── Procedure<D, R>              … 受信データの業務処理インタフェース

jp.co.intra_mart.foundation.propagation.sender
└── AbstractEncoder<D, G extends Serializable>     … Encoder の抽象実装（送信側が継承する）

jp.co.intra_mart.foundation.propagation.receiver
├── AbstractDecoder<G extends Serializable, D>              … Decoder の抽象実装（受信側が継承する）
├── AbstractProcedure<D, R extends Serializable>            … Procedure の抽象実装（DBトランザクション相乗り）
└── AbstractSessionableProcedure<D, R extends Serializable> … Procedure の抽象実装（独自ライフサイクル制御）

jp.co.intra_mart.foundation.propagation.model
├── SendResult<R extends Serializable>     … send() の戻り値
├── ReceiveResult<R extends Serializable>  … onReceive() の戻り値
├── ReceiveParameter                        … onReceive() に渡されるパラメータ
├── InitializeParameter / InitializeResult  … onInitialize() の引数/戻り値
├── PrepareParameter / PrepareResult        … onPrepare() の引数/戻り値
├── DecideParameter / DecideResult          … onDecide() の引数/戻り値
├── AbortParameter / AbortResult            … onAbort() の引数/戻り値
├── EmptyObject                              … 戻り値が不要な場合のプレースホルダ
└── generic
    ├── AbstractGeneric                      … GenericModel の基底クラス
    └── imbox
        ├── GenericSendNoticeThread / GenericSendNoticeMessage
        ├── GenericSendWatchThread / GenericSendWatchMessage
        ├── GenericWatch / GenericUnwatch     … IM-Box 標準の GenericModel

jp.co.intra_mart.foundation.propagation.code
├── OperationType    … operationType の標準定数
└── EventStatus      … 受信処理結果ステータスの列挙型

jp.co.intra_mart.foundation.propagation.exception
└── （例外階層。後述）
```

## `PropagationManager` インタフェース

```java
package jp.co.intra_mart.foundation.propagation;

public interface PropagationManager {

    /** セッションを開始します。実行コンテキストにDBトランザクションが無ければ新規に開始します。 */
    void begin() throws BeginException;

    /**
     * データを送信します（送信元データのクラスを実データから自動判定）。
     * @param operationType 操作種別
     * @param data 送信元データ
     * @param resultClass 受信側からの戻り値のクラス（不要な場合は EmptyObject.class）
     */
    <D, R extends Serializable> SendResult<R> send(String operationType, D data, Class<R> resultClass)
            throws SendException;

    /**
     * データを送信します（送信元データのクラスを明示的に指定）。
     * データがインタフェース/親クラスを実装しており、実クラスと異なる型で source を解決したい場合に使う。
     */
    <D, R extends Serializable> SendResult<R> send(String operationType, Class<D> dataClass, D data,
            Class<R> resultClass) throws SendException;

    /** セッションを確定（コミット）します。受信側に commit を通知します。既に終了済みの場合は何もしません。 */
    void decide() throws DecideException;

    /** セッションをロールバックします。受信側に abort を通知します。既に終了済みの場合は何もしません。 */
    void abort();

    /**
     * Callable を実行し、begin/decide/abort を自動化します。
     * 戻り値が null または例外送出時は abort、それ以外は decide を呼びます。
     */
    <V> V execute(Callable<V> caller) throws Exception;

    /** リソースを解放します。複数回呼び出しても安全です。 */
    void close();
}
```

- `send()` の `operationType` は `OperationType` クラスの標準定数、または独自の文字列定数を使う
- `dataClass`/`data`（または `data.getClass()`）は、送信設定ファイル（`propagation-senders-config`）の `sender` 要素の `source` 属性と一致させる
- `resultClass` は `java.io.Serializable` を実装している必要がある。戻り値が不要な場合は `EmptyObject.class` を使う

## `PropagationManagerFactory` クラス

```java
package jp.co.intra_mart.foundation.propagation;

public abstract class PropagationManagerFactory {

    /** ファクトリインスタンスを取得します。 */
    public static PropagationManagerFactory getInstance();

    /** PropagationManager を取得します。 */
    public abstract PropagationManager getPropagationManager();
}
```

- 呼び出しは常に `PropagationManagerFactory.getInstance().getPropagationManager()` の形をとる

## `Encoder<D, G>` / `AbstractEncoder<D, G>`

```java
package jp.co.intra_mart.foundation.propagation;

public interface Encoder<D, G> {
    G encode(D data) throws ConvertException;
    Class<G> getGenericDataClass();
    void setParamValuesMap(Map<String, List<String>> map);
}
```

```java
package jp.co.intra_mart.foundation.propagation.sender;

public abstract class AbstractEncoder<D, G extends Serializable> implements Encoder<D, G> {

    /** データモデル(D) を GenericModel(G) に変換します。変換失敗時は ConvertException を送出します。 */
    public abstract G encode(D data) throws ConvertException;

    /** 生成する GenericModel の Class オブジェクトを返します。 */
    public abstract Class<G> getGenericDataClass();

    /** フレームワークが自動的に呼び出します。アプリケーションコードから呼ぶ必要はありません。 */
    public void setParamValuesMap(Map<String, List<String>> map);

    /** 送信設定ファイルの param 要素の key 一覧を取得します。 */
    protected Set<String> getParamKeys();

    /** 指定した key の param 値（先頭1件）を取得します。 */
    protected String getParamValue(String key);

    /** 指定した key の param 値（複数件）を取得します。 */
    protected List<String> getParamValues(String key);
}
```

- 実装クラスは `encode`/`getGenericDataClass` の2つを必ずオーバーライドする
- `getParamKeys`/`getParamValue`/`getParamValues` は送信設定ファイルの `<encoder class="..."><params><param key="...">値</param></params></encoder>` に対応する

## `Decoder<G, D>` / `AbstractDecoder<G, D>`

```java
package jp.co.intra_mart.foundation.propagation;

public interface Decoder<G, D> {
    D decode(G generic) throws ConvertException;
    Class<G> getGenericDataClass();
    void setParamValuesMap(Map<String, List<String>> map);
}
```

```java
package jp.co.intra_mart.foundation.propagation.receiver;

public abstract class AbstractDecoder<G extends Serializable, D> implements Decoder<G, D> {

    /** GenericModel(G) をデータモデル(D) に変換します。変換失敗時は ConvertException を送出します。 */
    public abstract D decode(G generic) throws ConvertException;

    /** 受信する GenericModel の Class オブジェクトを返します。 */
    public abstract Class<G> getGenericDataClass();

    // setParamValuesMap / getParamKeys / getParamValue / getParamValues は AbstractEncoder と同様
}
```

## `Procedure<D, R>` / `AbstractProcedure<D, R>` / `AbstractSessionableProcedure<D, R>`

```java
package jp.co.intra_mart.foundation.propagation;

public interface Procedure<D, R> {
    ReceiveResult<R> onReceive(ReceiveParameter parameter, D data) throws ProcedureException, PropagationManagerException;
    InitializeResult onInitialize(InitializeParameter parameter);
    PrepareResult onPrepare(PrepareParameter parameter);
    DecideResult onDecide(DecideParameter parameter) throws ProcedureException;
    AbortResult onAbort(AbortParameter parameter);
    void setParamValuesMap(Map<String, List<String>> map);
}
```

```java
package jp.co.intra_mart.foundation.propagation.receiver;

// DB トランザクションに相乗りする通常の受信処理向け
public abstract class AbstractProcedure<D, R extends Serializable> implements Procedure<D, R> {

    /** 受信データを処理します。DBトランザクションはホスト（送信元）側が制御するため、独自に begin/commit しません。 */
    public abstract ReceiveResult<R> onReceive(ReceiveParameter parameter, D data)
            throws ProcedureException, PropagationManagerException;

    // onInitialize/onPrepare/onDecide/onAbort は「未実装」相当のデフォルト実装を継承（オーバーライド不要）
}

// DB 以外のリソースを扱う・独自のコミット判定が必要な受信処理向け
public abstract class AbstractSessionableProcedure<D, R extends Serializable> implements Procedure<D, R> {

    /** トランザクション開始時に一度だけ呼ばれます。 */
    public InitializeResult onInitialize(InitializeParameter parameter);

    /** データ受信の都度呼ばれます。この時点では処理を確定させません。 */
    public abstract ReceiveResult<R> onReceive(ReceiveParameter parameter, D data)
            throws ProcedureException, PropagationManagerException;

    /** コミット前に呼ばれ、確定可能かどうかを判断します。 */
    public PrepareResult onPrepare(PrepareParameter parameter);

    /** コミット時に呼ばれ、実際の確定処理（副作用の実行）を行います。 */
    public DecideResult onDecide(DecideParameter parameter) throws ProcedureException;

    /** ロールバック時に呼ばれ、後始末を行います。 */
    public AbortResult onAbort(AbortParameter parameter);

    /** セッション内であることを検証するユーティリティメソッド。 */
    protected void checkInSession(ReceiveParameter parameter) throws ProcedureException;

    // setParamValuesMap / getParamKeys / getParamValue / getParamValues も提供
}
```

- **`AbstractProcedure` は `onReceive` のみをオーバーライドする。** それ以外のライフサイクルメソッドは「未実装」を意味するデフォルト実装を継承する
- **`AbstractSessionableProcedure` は必要なライフサイクルメソッドのみをオーバーライドしてよい。** 例えば初期化処理が不要なら `onInitialize` はオーバーライドせず、継承元のデフォルト実装のままにする
- 両クラスとも実行時にクラスローダー経由でインスタンス化されるため、**引数なしコンストラクタが必須**（`private` コンストラクタにしないこと）

## パラメータ・結果クラス（すべて `jp.co.intra_mart.foundation.propagation.model` パッケージ）

| クラス | コンストラクタ | 主なメソッド |
|---|---|---|
| `SendResult<R>` | `SendResult()` | `addProcedureStatus(ProcedureStatus)` / `addResponse(R)` / `List<ProcedureStatus> getProcedureStatus()` / `List<R> getResponses()` |
| `ReceiveResult<R>` | `ReceiveResult(EventStatus)` / `ReceiveResult(EventStatus, R)` / `ReceiveResult(EventStatus, R, String message)` | `getStatus()` / `getResponse()` / `getMessage()` |
| `ReceiveParameter` | `ReceiveParameter(String dataId, String operationType, String source, boolean inSession)` | `getDataId()` / `getOperationType()` / `getSource()` / `isInSession()` |
| `InitializeParameter` | `InitializeParameter()` | なし |
| `InitializeResult` | `InitializeResult(EventStatus)` / `InitializeResult(EventStatus, String message)` | `getStatus()` / `getMessage()` |
| `PrepareParameter` | `PrepareParameter()` | なし |
| `PrepareResult` | `PrepareResult(EventStatus)` / `PrepareResult(EventStatus, String message)` | `getStatus()` / `getMessage()` |
| `DecideParameter` | `DecideParameter()` | なし |
| `DecideResult` | `DecideResult(EventStatus)` / `DecideResult(EventStatus, String message)` | `getStatus()` / `getMessage()` |
| `AbortParameter` | `AbortParameter()` | なし |
| `AbortResult` | `AbortResult(EventStatus)` / `AbortResult(EventStatus, String message)` | `getStatus()` / `getMessage()` |
| `EmptyObject` | `EmptyObject()` | なし（`Serializable` のプレースホルダ） |

- いずれも `java.io.Serializable` を実装している
- `Initialize`/`Prepare`/`Decide`/`Abort` の各 `Parameter` クラスには引数なしコンストラクタ以外の公開メソッドは無い（フレームワーク内部でのみ利用）

## `AbstractGeneric`（GenericModel の基底クラス）

```java
package jp.co.intra_mart.foundation.propagation.model.generic;

public abstract class AbstractGeneric implements Serializable {

    public String getExecuteTenantId();
    public void setExecuteTenantId(String executeTenantId);

    public String getExecuteUserCd();
    public void setExecuteUserCd(String executeUserCd);

    public String getOwnerTenantId();
    public void setOwnerTenantId(String ownerTenantId);

    public String getOwnerUserCd();
    public void setOwnerUserCd(String ownerUserCd);
}
```

- 独自の `GenericModel` はこのクラスを継承し、送信したいフィールドを追加する（`serialVersionUID` の明示を推奨）
- `executeTenantId`/`executeUserCd`/`ownerTenantId`/`ownerUserCd` は実行コンテキストから自動的に補完されうる（明示的に設定しない場合の挙動は実装依存のため、必要な場合は明示的に設定する）

### GenericModel の復元方式（最重要）

`AbstractGeneric implements Serializable` という定義から、GenericModel の受け渡しには Java 標準のシリアライズ（`ObjectOutputStream`/`ObjectInputStream`）が使われると誤解しやすいが、**実際の内部実装は JSON（JSONIC ライブラリ、`net.arnx.jsonic`）ベースの変換である。** 受信側は `Decoder#getGenericDataClass()` が返すクラスを、JSON 文字列からリフレクション経由（`Class#getDeclaredConstructor()`、**引数なし**）でインスタンス化してから `decode()` に渡す。

このため、**`Decoder<G, D>` の `G` に指定するクラス（GenericModel）は、必ず `public` な引数なしコンストラクタを持たなければならない。** `Serializable` を実装しているだけでは不十分。

- 独自に作成する `GenericModel`（`AbstractGeneric` 継承クラス）は、明示的なコンストラクタを定義しなければ暗黙のデフォルトコンストラクタ（引数なし・`public`）が使えるため、通常は問題にならない。**独自コンストラクタを追加する場合は、必ず引数なしコンストラクタも残す**こと
- **intra-mart 標準の送信元データモデル（`jp.co.intra_mart.foundation.admin.account.model.AccountInfo` 等、管理系 API のドメインモデルクラス）をそのまま `G` として受信登録してはならない。** これらは元々 propagation 専用に設計されたクラスとは限らず、引数なしコンストラクタを持たない場合がある。`AccountInfo`（`public AccountInfo(String userCd)` の1引数コンストラクタしか持たない）はこの条件を満たさない
- 引数なしコンストラクタを持たないクラスを `G` として受信登録すると、**受信側の実装（Decoder/Procedure）が正しいかどうかに関わらず**、JSON 変換の時点で `NoSuchMethodException` → `JSONException` → `SendException` となり、**送信元の処理自体が失敗する。** 送信元が intra-mart 標準機能である場合、その標準機能全体（例: アカウント更新）が使用不能になるという重大な影響が生じる

### `jp.co.intra_mart.foundation.propagation.model.generic` パッケージ（intra-mart 標準データ受信用の公式 GenericModel 群）

intra-mart は、上記の問題（管理系 API のドメインモデルクラスが GenericModel の要件を満たさない）に対応するため、`jp.co.intra_mart.foundation.propagation.model.generic` パッケージで **`AbstractGeneric` 継承の共通モデルクラスを約30種類**公式に提供している（`GenericAccount`/`GenericTenant`/`GenericRole`/`GenericAdministrator`/`GenericAuthzResource`/`GenericAuthzPolicy`/`GenericAuthzResourceGroup`/`GenericAuthzSubjectGroup`/`GenericMenuGroup`/`GenericMenuItem`/`GenericCalendar`/`GenericDay`/`GenericJobnet`/`GenericJobnetTrigger`/`GenericUpdatedTenant` 等）。

このパッケージの Javadoc には、伝搬データを格納するクラスが満たすべき要件が明記されている:

1. 総称型（ジェネリクス）を使用しないこと
2. 単純な getter/setter で構成されたシリアライズ可能なクラスであること
3. 引数が0個のコンストラクタが用意されていること
4. フィールドの型が、プリミティブ型、または伝搬機能内で直列化データと相互変換可能なクラス・インタフェースを実装したクラスに限定されていること（`BigDecimal`/`BigInteger`/`Calendar`/`Collection`/`Date`/`List`/`Locale`/`Map`/`String`/`TimeZone`/`URI`/`URL`/`UUID` 等とそのラッパー・配列を含む）

`jp.co.intra_mart.foundation.propagation.model.generic` パッケージの各クラスはこの4要件を満たすよう設計されている。**intra-mart 標準データを受信する場合は、`source` 属性には引き続き送信元データ（例: `AccountInfo`）の FQCN を指定しつつ、`Decoder<G, D>` の `G` にはドメインモデルクラスではなく対応する `Generic*` クラス（例: `GenericAccount`）を指定すること。** `source`（ルーティング用の識別子）と `G`（実際に JSON から再構築されるクラス）は独立した概念であるため、この組み合わせが可能である。`AccountInfo` → `GenericAccount` の組み合わせで正常に受信できる。詳細な対応表は `assets/standard-listener-usage.md` を参照。

## `OperationType`（標準定数）

```java
package jp.co.intra_mart.foundation.propagation.code;

public final class OperationType {
    public static final String DATA_CREATED;
    public static final String DATA_UPDATED;
    public static final String DATA_DELETED;
    public static final String DATA_UN_DELETED;   // 8.0.9 以降
    public static final String PROC_STARTED;
    public static final String PROC_SUSPENDED;
    public static final String PROC_RESUMED;
    public static final String PROC_ABORTED;
    public static final String PROC_COMPLETED;
    public static final String PROC_FAILED;
    public static final String REQUEST_SEND;
    public static final String REQUEST_COMMAND;
    public static final String REQUEST_NOTIFY;
    public static final String REQUEST_SEARCH;
}
```

- データの CRUD 系イベントには `DATA_*`、プロセス（バッチ・ジョブ等）の状態遷移には `PROC_*`、任意のリクエスト系イベントには `REQUEST_*` を使い分ける
- 独自の業務イベントで標準定数に該当するものが無い場合のみ、独自の文字列定数を定義する

## `EventStatus`（受信結果ステータス）

```java
package jp.co.intra_mart.foundation.propagation.code;

public enum EventStatus {
    UNDEFINED,
    SUCCEEDED,
    NOT_AFFECTED,
    NOT_IMPLEMENTED,
    FAILED
}
```

| 値 | 意味 |
|---|---|
| `SUCCEEDED` | 処理成功 |
| `NOT_AFFECTED` | 処理対象が存在しない等、影響が無かった |
| `NOT_IMPLEMENTED` | 該当のライフサイクル処理が未実装（`AbstractProcedure`/`AbstractSessionableProcedure` のデフォルト実装が返す値） |
| `FAILED` | 処理失敗 |
| `UNDEFINED` | 未定義 |

## 例外階層（`jp.co.intra_mart.foundation.propagation.exception`）

| クラス | 用途 |
|---|---|
| `PropagationException` | IM-Propagation 全体の基底例外 |
| `PropagationManagerException` | `PropagationManager` 内部エラー。**Encoder/Decoder/Procedure の実装から送出してはならない** |
| `PropagationRuntimeException` | 回復不能なランタイム例外 |
| `BeginException` | `begin()` の失敗 |
| `SendException` | `send()` の失敗（デッドロック検知含む） |
| `DecideException` | `decide()` の失敗 |
| `SessionException` | セッション全般の失敗 |
| `SessionRequiredException` | トランザクション外でのデータ処理試行 |
| `DatabaseException` | DB 関連の失敗 |
| `ConvertException` | `Encoder`/`Decoder` が変換失敗時に送出する（アプリケーション向け） |
| `ProcedureException` | `Procedure` が処理失敗時に送出する（アプリケーション向け） |

**実装ガイドライン:** `Encoder`/`Decoder` は `ConvertException`（のサブクラス）を、`Procedure` は `ProcedureException`（のサブクラス）を送出する。`PropagationManagerException` 系はフレームワーク内部専用であり、アプリケーションコードから送出してはならない。

## セッションリークのトラブルシューティング

`begin()` で開始したセッションは、`decide()`/`abort()`/`close()` のいずれかで必ず終了させること。終了させないまま放置すると、DB トランザクションが終了しない、または以後 IM-Propagation を利用する箇所全体がハングする等の重大な不具合につながる。

診断手順（付録より）:

1. `WEB-INF/conf/log/im_logger.xml` で該当ロガーのログレベルを `trace` に設定し、再起動・事象再現を行う
2. ログから `"primary already used, use secondary"` というメッセージを検索する
3. 上記メッセージの直前に出力されている `"use primary"` のスタックトレースを遡り、対応する `PropagationManagerFactoryImpl.getPropagationManager` の呼び出し元を特定する
4. 特定した呼び出し元で `decide()`/`abort()`/`close()` のいずれかが確実に呼ばれるよう修正する
