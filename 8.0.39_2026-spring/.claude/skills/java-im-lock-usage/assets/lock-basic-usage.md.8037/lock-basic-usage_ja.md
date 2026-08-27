# Lock API 基本利用パターン（Java 版）

`NewLock` のシグネチャ・内部動作は `reference/lock-api-reference.md` を参照。ここでは典型的な呼び出しパターンを示す。

## パターン1: 通常ロック（`lock()`、メソッド内で完結する排他制御）

メソッド内で確実にロック取得・解放を完結させる基本形。`try`/`finally` で解放漏れを防ぐ。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.service.client.information.NewLock;

/**
 * カウンタの更新処理を提供します。
 */
public class CounterService {

    /**
     * カウンタを1件加算します。<br>
     * 分散環境（複数アプリケーションサーバ構成）でも、同一カウンタIDに対する更新が直列化されることを保証します。
     *
     * @param counterId カウンタID
     */
    public void increment(final String counterId) {
        final NewLock lock = new NewLock("counter:" + counterId);
        lock.lock();
        try {
            // カウンタ値の読み込み・加算・書き込み等、排他制御が必要な処理
        } finally {
            lock.unlock();
        }
    }
}
```

- `lock()` はロックが取得できるまで無限に待機する。タイムアウトが必要な場合はパターン2の `tryLock(long, TimeUnit)` を使う
- `lock()` 呼び出し**直後**から `try` を開始し、`finally` で必ず `unlock()` する。`lock()` 自体は例外を投げないため `try` の外で呼んでよいが、`lock()` の後の処理で例外が起きても解放されるよう `finally` は必須

## パターン2: タイムアウト付き通常ロック（`tryLock(long, TimeUnit)`）

ロック取得の待ち時間に上限を設けたい場合に使う。取得失敗時は業務例外にラップするか、呼び出し元に失敗を伝える。

```java
package jp.co.example.foo.service;

import java.util.concurrent.TimeUnit;

import jp.co.intra_mart.foundation.service.client.information.NewLock;

import jp.co.example.foo.exception.CounterLockTimeoutException;

/**
 * カウンタの更新処理を提供します。
 */
public class CounterService {

    private static final long LOCK_TIMEOUT_SECONDS = 10L;

    /**
     * カウンタを1件加算します。<br>
     * ロック取得に失敗した場合（{@value #LOCK_TIMEOUT_SECONDS}秒以内に取得できなかった場合）は例外をスローします。
     *
     * @param counterId カウンタID
     * @throws CounterLockTimeoutException ロック取得がタイムアウトした場合
     */
    public void increment(final String counterId) throws CounterLockTimeoutException {
        final NewLock lock = new NewLock("counter:" + counterId);
        if (!lock.tryLock(LOCK_TIMEOUT_SECONDS, TimeUnit.SECONDS)) {
            throw new CounterLockTimeoutException("カウンタの更新がロック取得タイムアウトにより失敗しました: counterId=" + counterId);
        }
        try {
            // カウンタ値の読み込み・加算・書き込み等、排他制御が必要な処理
        } finally {
            lock.unlock();
        }
    }
}
```

- `tryLock(timeout, unit)` が `false` を返した場合は**ロックを取得できていない**ため、`unlock()` を呼んではならない（対応する `try`/`finally` の外で失敗ハンドリングする）
- `LockControlRuntimeException`（非チェック例外）が送出される可能性もあるため、必要に応じて `catch` する

## パターン3: `run(Runnable)` ユーティリティ（ロック取得〜解放を1呼び出しに集約）

ロック内で行う処理が単純な場合、`lock()`/`unlock()` を明示的に書かずに済む。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.service.client.information.NewLock;

public class CounterService {

    public void increment(final String counterId) {
        final NewLock lock = new NewLock("counter:" + counterId);
        lock.run(() -> {
            // カウンタ値の読み込み・加算・書き込み等、排他制御が必要な処理
        });
    }
}
```

- `run(Runnable)` は内部で `lock()` → `runnable.run()` → `finally unlock()` を行うため、解放漏れの心配がない
- `Runnable#run()` はチェック例外を宣言できないため、ラムダ内で `throws` が必要な処理を呼ぶ場合は `try-catch` して非チェック例外にラップする必要がある。処理が複雑な場合はパターン1・2の明示的な `try`/`finally` の方が読みやすいことが多い

## パターン4: リクエストスコープロック（`lockRequestScope()` / `tryLockRequestScope()`）

ロック取得箇所と解放箇所が離れている、または複数メソッドにまたがってロックを保持し続けたい場合に使う。プラットフォーム標準の `RequestScopeLockReleaseFilter` がレスポンス返却時に自動解除するため、明示的な `unlock()` は必須ではないが、早期解放したい場合は呼んでよい。

```java
package jp.co.example.foo.service;

import java.util.concurrent.TimeUnit;

import jp.co.intra_mart.foundation.service.client.information.NewLock;

import jp.co.example.foo.exception.OrderProcessingLockTimeoutException;

/**
 * 受注処理をリクエスト単位で排他制御します。
 */
public class OrderProcessingLockService {

    private static final long LOCK_TIMEOUT_SECONDS = 10L;

    /**
     * 受注処理のロックを取得します。<br>
     * 取得したロックは、レスポンス返却時にプラットフォーム標準の RequestScopeLockReleaseFilter が自動解除します。
     * 後続の複数メソッド呼び出しにまたがってロックを保持したい場合に使用します。
     *
     * @param orderId 受注ID
     * @throws OrderProcessingLockTimeoutException ロック取得がタイムアウトした場合
     */
    public void acquireLock(final String orderId) throws OrderProcessingLockTimeoutException {
        final NewLock lock = new NewLock("order-processing:" + orderId);
        if (!lock.tryLockRequestScope(LOCK_TIMEOUT_SECONDS, TimeUnit.SECONDS)) {
            throw new OrderProcessingLockTimeoutException("受注処理のロック取得がタイムアウトしました: orderId=" + orderId);
        }
        // ここでは unlock() を呼ばない（自動解放に任せる）
        // 早期に解放したい場合のみ、対応する箇所で lock.unlock() を呼ぶ
    }
}
```

- `NewLock.releaseRequestScope()`（静的メソッド）は `RequestScopeLockReleaseFilter` 専用の内部 API（`@Deprecated`）のため、**アプリケーションコードから直接呼び出さない**
- リクエストスコープロックの保持期間はレスポンス返却までであり、意図せず長時間ロックを保持し続けないよう、本当に複数箇所にまたがる要件があるかを見極める

## アンチパターン（避けること）

```java
// NG: unlock() を try/finally で囲んでいない（処理中の例外で解放されない）
final NewLock lock = new NewLock("counter:" + counterId);
lock.lock();
doSomething(); // ここで例外が発生すると unlock() が呼ばれず、ロックが残り続ける
lock.unlock();

// NG: tryLock() の戻り値を確認せずに処理を進める
final NewLock lock = new NewLock("counter:" + counterId);
lock.tryLock(); // 戻り値（成否）を無視
doSomething();  // ロックを取得できていないのに排他制御されているつもりで処理してしまう

// NG: NewLock.releaseRequestScope() をアプリケーションコードから直接呼び出す
NewLock.releaseRequestScope(); // @Deprecated かつ RequestScopeLockReleaseFilter 専用

// NG: ロックIDの粒度が粗すぎる（無関係な処理まで直列化される）
final NewLock lock = new NewLock("application-lock"); // アプリケーション全体で1つの固定ID

// NG: 単一 JVM 内で完結する処理に NewLock を使う（DB通信のオーバーヘッドが不要）
// 分散環境での一意性が要件でなければ java.util.concurrent.locks.ReentrantLock 等で十分
```
