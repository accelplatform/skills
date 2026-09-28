# Lock API リファレンス（Java 版）

intra-mart Accel Platform コアソース（`im_core_base` / `im_servlets` モジュール）の実クラス定義に基づく。記憶や推測でメソッドを補わないこと。

## パッケージ構成

```
jp.co.intra_mart.foundation.service.client.information
├── NewLock                     … 公開 API。java.util.concurrent.locks.Lock を実装
├── LockControlException        … チェック例外（LockController 内部で使用）
└── LockControlRuntimeException … 非チェック例外（NewLock の public メソッドが実際にスローするのはこちら）

jp.co.intra_mart.system.service.client.information
├── LockController               … ロック制御の SPI インタフェース
└── LocalLockController          … LockController の既定実装（ServiceLoader で他実装が見つからない場合に使用）

jp.co.intra_mart.system.servlet.filter
└── RequestScopeLockReleaseFilter … リクエストスコープロックの自動解放を行うプラットフォーム標準フィルタ（im_servlets モジュール）
```

このバージョンのコーパスには旧 `Lock` クラス（"New" が付かないもの）は存在しない。`NewLock` が現行の唯一の実装。

## `NewLock` クラス

```java
package jp.co.intra_mart.foundation.service.client.information;

public class NewLock implements Lock, Serializable {

    /**
     * ロックをするためのインスタンスを作ります。
     * @param id ロックＩＤ
     * @exception NullPointerException 引数が null
     */
    public NewLock(final CharSequence id);

    /** このインスタンスの表すロックＩＤを返します。 */
    public String getName();

    /** ロックフラグを立てます。取得できるまで無限に待機します。 */
    @Override
    public void lock();

    /** 実装上は lock() を呼ぶだけ。実質的な割り込み対応はされていない。 */
    @Override
    public void lockInterruptibly() throws InterruptedException;

    /** 即座に成否判定（待機なし）。 */
    @Override
    public boolean tryLock();

    /**
     * タイムアウト付きでロックを取得します。timeout に 0 を指定した場合は lock() と同義。
     * @param timeout ロック開始要求の待ち時間
     * @param unit 待ち時間の単位
     * @return ロックの設定に成功した場合 true
     */
    @Override
    public boolean tryLock(final long timeout, final TimeUnit unit);

    /** ロックを解除します。 */
    @Override
    public void unlock();

    /** 未サポート。呼び出すと UnsupportedOperationException をスローする。 */
    @Override
    public Condition newCondition();

    /**
     * ロックを獲得し処理を行います（lock() → runnable.run() → finally unlock() を1メソッドにまとめたユーティリティ）。
     * @param runnable ロック獲得中に行う処理
     */
    public void run(final Runnable runnable);

    /**
     * タイムアウト付きでロックを獲得し処理を行います。
     * @return 処理が行われた場合 true、タイムアウト等で行われなかった場合 false
     */
    public boolean run(final Runnable runnable, final long timeout, final TimeUnit unit);

    /**
     * lock() 相当だが、現在のリクエストが終了する際（レスポンス返却時）にロックが自動解除される。
     * 自動解除は RequestScopeLockReleaseFilter が行う。
     * @since 7.0.3
     */
    public void lockRequestScope();

    /** tryLock() 相当のリクエストスコープ版。 @since 7.0.3 */
    public boolean tryLockRequestScope();

    /** tryLock(timeout, unit) 相当のリクエストスコープ版。 @since 7.0.3 */
    public boolean tryLockRequestScope(final long timeout, final TimeUnit unit);

    /**
     * 現在のスレッドに紐付いたロックを全て解除します。
     * @return 紐づいたロックが存在しない場合 null。それ以外は解除に失敗したロックIDのリスト（全て成功時は空リスト）
     */
    public static synchronized List<String> releaseCurrentThread();

    /**
     * 現在のリクエストに紐付いたロックを全て解除します。
     * @deprecated RequestScopeLockReleaseFilter 専用。アプリケーションコードから直接呼び出さないこと。
     */
    @Deprecated
    public static synchronized List<String> releaseRequestScope();
}
```

- `Lock` インタフェースおよび `Serializable` を実装
- コンストラクタは `id` が `null` の場合 `NullPointerException` をスローする
- **公開メソッドが実際にスローする例外はすべて非チェック例外（`LockControlRuntimeException`）。** `throws` 宣言は不要
- 内部的にはスレッド単位の待ち行列（`CopyOnWriteArrayList<Thread>`）で順序制御した上で、`LockController` 経由でDBベースのロックモニタを取得する二段構えの実装になっている（アプリケーション開発者が意識する必要はない）
- リトライ間隔は既定 5ms（`RETRY_INTERVAL`）。システムプロパティ `NewLock.calculateQueueTime=true` で待ち時間を動的補正する仕組みがあるが、通常は意識不要

## `LockController` インタフェース（SPI）

```java
package jp.co.intra_mart.system.service.client.information;

public interface LockController extends Serializable {

    void lock(String id) throws LockControlException;

    boolean tryLock(String id, long timeout) throws LockControlException;

    boolean unlock(String id) throws LockControlException;

    boolean isLocked(String id) throws LockControlException;

    Collection<LockCondition> getCondition() throws LockControlException;
}
```

- `NewLock` の static イニシャライザで `ServiceLoaderUtil.loadFirst(LockController.class)` により実装が検出される。見つからない場合は既定実装 `LocalLockController` が使われる
- アプリケーション開発者がこのインタフェースを直接実装・利用することは通常ない

## `LockControlException` / `LockControlRuntimeException`

```java
package jp.co.intra_mart.foundation.service.client.information;

public class LockControlException extends Exception { /* LockController 内部で使用するチェック例外 */ }

public class LockControlRuntimeException extends RuntimeException {
    /* NewLock の public メソッド（lock/tryLock/unlock 等）が LockControlException を
       キャッチしてラップし直す際に使用する非チェック例外。実際にアプリケーションコードが
       catch する対象はこちら。 */
}
```

## `RequestScopeLockReleaseFilter`（プラットフォーム標準フィルタ）

```java
package jp.co.intra_mart.system.servlet.filter;

public class RequestScopeLockReleaseFilter extends AbstractFilter {

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain)
            throws ServletException, IOException {
        // 既に実行済みでなければ...
        try {
            chain.doFilter(request, response);
        } finally {
            // NewLock#lockRequestScope() / tryLockRequestScope() で開始したロックを全て解除
            final List<String> errorLockIdList = NewLock.releaseRequestScope();
            // 解除に失敗したロックIDがあればデバッグログ出力
        }
    }
}
```

- `im_servlets` モジュールが提供するプラットフォーム標準フィルタで、`lockRequestScope()` / `tryLockRequestScope()` で取得したロックをレスポンス返却時に一括解除する
- **アプリケーション側でこのフィルタを新規に登録する必要はない。** プラットフォームの標準フィルタチェーンに組み込まれている前提で `lockRequestScope()` 系メソッドを使ってよい
- `NewLock.releaseRequestScope()`（`@Deprecated`）はこのフィルタの内部実装専用。アプリケーションコードから呼び出してはならない

## 実プラットフォームコードでの利用例（挙動の参考）

`jp.co.intra_mart.system.workflow.plugin.numbering.SimpleNumberCounterEvent#getNumber()`（`im_workflow_core` モジュール、ワークフローの採番プラグイン。`PublicStorage` 上のカウンタファイルを排他制御しながらインクリメントする）:

```java
final String countfilePath = directoryPath + SEPARATOR + COUNT_FILE_NAME;
final PublicStorage counterFile = new PublicStorage(countfilePath);

// アプリケーションロック処理
NewLock lock = new NewLock(loginGroupId + ":" + countfilePath);
if (!lock.tryLockRequestScope(timeoutLimit, TimeUnit.SECONDS)) {
    // ロックタイムアウト時間内で失敗した場合は例外返却
    throw new WorkflowPluginException("IMW.PLG.ERR.9051");
}

try {
    // counterFile を読み込み、インクリメントして書き戻す
    ...
} finally {
    if (lock != null) {
        // ロックの解除（リクエストスコープロックでも早期解放したい場合は明示的に unlock() してよい）
        lock.unlock();
    }
}
```

この例が示す通り、リクエストスコープロックを使う場合でも `finally` で明示的に `unlock()` することは可能かつ推奨される（自動解放はあくまで「呼び忘れ・例外パスでの解放漏れ」に対する保険であり、早期解放を妨げるものではない）。ロックIDは `loginGroupId + ":" + 対象ファイルパス` のように、排他制御したい対象を一意に表す文字列を組み立てて使っている。
