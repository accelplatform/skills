# 受信側実装パターン（Decoder / Procedure）

`Decoder`/`Procedure`/`AbstractProcedure`/`AbstractSessionableProcedure` のシグネチャ・内部動作は `reference/propagation-api-reference.md` を参照。ここでは典型的な実装パターンを示す。

## 実装順序

1. データモデル（受信先の POJO。送信側と同一クラスである必要はない）
2. Decoder（`AbstractDecoder` 継承。GenericModel → データモデルの変換）
3. Procedure（`AbstractProcedure` または `AbstractSessionableProcedure` 継承。業務処理の実行）
4. 受信設定ファイル（`propagation-receivers-config`）

**`source`/`operationType` は送信側の値（自作モジュールの場合は送信設定ファイル、intra-mart 標準データの場合は `assets/standard-listener-usage.md` の一覧）と完全一致させること。**

## パターン1: Decoder の実装

```java
package jp.co.intra_mart.sample.notify.propagation.decoder;

import jp.co.intra_mart.foundation.propagation.exception.ConvertException;
import jp.co.intra_mart.foundation.propagation.receiver.AbstractDecoder;

import jp.co.intra_mart.sample.leave.propagation.LeaveApprovedGeneric;
import jp.co.intra_mart.sample.notify.propagation.LeaveApprovedNotifyData;

/**
 * LeaveApprovedGeneric を通知処理用データに変換する Decoder。
 */
public class LeaveApprovedDecoder extends AbstractDecoder<LeaveApprovedGeneric, LeaveApprovedNotifyData> {

    @Override
    public LeaveApprovedNotifyData decode(final LeaveApprovedGeneric generic) throws ConvertException {
        if (generic == null || generic.getApplicationId() == null) {
            throw new ConvertException("受信データの必須項目が不足しています。");
        }

        final LeaveApprovedNotifyData data = new LeaveApprovedNotifyData();
        data.setApplicationId(generic.getApplicationId());
        data.setApplicantUserCd(generic.getApplicantUserCd());
        data.setApprovedDate(generic.getApprovedDate());
        return data;
    }

    @Override
    public Class<LeaveApprovedGeneric> getGenericDataClass() {
        return LeaveApprovedGeneric.class;
    }
}
```

- 変換に失敗した場合は `ConvertException`（のサブクラス）を送出する。`PropagationManagerException` を送出してはならない
- `getGenericDataClass()` は受信する `GenericModel` の `Class` オブジェクトを返す
- `AbstractEncoder` 同様、`getParamKeys()`/`getParamValue(String)`/`getParamValues(String)` で受信設定ファイルの `param` を参照できる

## パターン2: Procedure の実装（DBトランザクションに乗せる通常パターン）

DB 更新等、送信元と同一トランザクションで完結する業務処理には `AbstractProcedure` を使う。

```java
package jp.co.intra_mart.sample.notify.propagation.procedure;

import jp.co.intra_mart.foundation.propagation.code.EventStatus;
import jp.co.intra_mart.foundation.propagation.exception.ProcedureException;
import jp.co.intra_mart.foundation.propagation.model.EmptyObject;
import jp.co.intra_mart.foundation.propagation.model.ReceiveParameter;
import jp.co.intra_mart.foundation.propagation.model.ReceiveResult;
import jp.co.intra_mart.foundation.propagation.receiver.AbstractProcedure;

import jp.co.intra_mart.sample.notify.entity.NotifyEntity;
import jp.co.intra_mart.sample.notify.propagation.LeaveApprovedNotifyData;
import jp.co.intra_mart.sample.notify.repository.NotifyRepository;

/**
 * 休暇申請承認完了通知を受信し、通知テーブルへ登録する Procedure。
 */
public class LeaveApprovedProcedure extends AbstractProcedure<LeaveApprovedNotifyData, EmptyObject> {

    private final NotifyRepository notifyRepository;

    public LeaveApprovedProcedure() {
        this.notifyRepository = new NotifyRepository();
    }

    @Override
    public ReceiveResult<EmptyObject> onReceive(final ReceiveParameter parameter,
            final LeaveApprovedNotifyData data) throws ProcedureException {
        try {
            final NotifyEntity entity = new NotifyEntity();
            entity.setApplicationId(data.getApplicationId());
            entity.setUserCd(data.getApplicantUserCd());
            entity.setMessage("休暇申請が承認されました。");
            notifyRepository.insert(entity);

            return new ReceiveResult<EmptyObject>(EventStatus.SUCCEEDED);
        } catch (final RuntimeException e) {
            throw new ProcedureException("通知登録処理に失敗しました。", e);
        }
    }
}
```

- **`AbstractProcedure` はクラスローダー経由でインスタンス化される（引数なしコンストラクタが必須）。** `private` コンストラクタにしないこと
- `onReceive()` 内で自前のトランザクション制御（begin/commit 相当）を行ってはならない。送信元がホストするトランザクションに相乗りする前提のため、DB 更新はそのまま実行してよい
- 処理結果は `EventStatus`（`SUCCEEDED`/`NOT_AFFECTED`/`NOT_IMPLEMENTED`/`FAILED`）を指定した `ReceiveResult` で返す。戻り値が不要な場合は型パラメータに `EmptyObject` を使う
- 処理に失敗した場合は `ProcedureException`（のサブクラス）を送出する。送出すると送信元の `decide()` が失敗し、送信元セッション全体がロールバックされる（`abort()` 経由で他の受信者にも通知される）

## パターン3: Procedure の実装（DB以外のリソースを扱う場合）

外部 API 呼び出し・ファイル操作等、DB トランザクションに乗せられない処理や、コミット前に独自の確定判断が必要な処理には `AbstractSessionableProcedure` を使う。

```java
package jp.co.intra_mart.sample.notify.propagation.procedure;

import jp.co.intra_mart.foundation.propagation.code.EventStatus;
import jp.co.intra_mart.foundation.propagation.exception.ProcedureException;
import jp.co.intra_mart.foundation.propagation.model.*;
import jp.co.intra_mart.foundation.propagation.receiver.AbstractSessionableProcedure;

import jp.co.intra_mart.sample.notify.propagation.LeaveApprovedNotifyData;

/**
 * 休暇申請承認完了を外部システムへ通知する Procedure（外部API呼び出しのため独自の確定処理を持つ）。
 */
public class LeaveApprovedExternalNotifyProcedure
        extends AbstractSessionableProcedure<LeaveApprovedNotifyData, EmptyObject> {

    private String pendingPayload;

    @Override
    public InitializeResult onInitialize(final InitializeParameter parameter) {
        // トランザクション開始時に一度だけ呼ばれる初期化処理（必要な場合のみオーバーライド）
        return new InitializeResult(EventStatus.SUCCEEDED);
    }

    @Override
    public ReceiveResult<EmptyObject> onReceive(final ReceiveParameter parameter,
            final LeaveApprovedNotifyData data) throws ProcedureException {
        // この時点では外部送信を確定させない（ペイロードの組み立てのみ行う）
        this.pendingPayload = buildPayload(data);
        return new ReceiveResult<EmptyObject>(EventStatus.SUCCEEDED);
    }

    @Override
    public PrepareResult onPrepare(final PrepareParameter parameter) {
        // コミット前の最終確認（外部システムが到達可能か等）。問題なければ準備完了を返す
        return new PrepareResult(EventStatus.SUCCEEDED);
    }

    @Override
    public DecideResult onDecide(final DecideParameter parameter) throws ProcedureException {
        try {
            sendToExternalSystem(pendingPayload);
            return new DecideResult(EventStatus.SUCCEEDED);
        } catch (final RuntimeException e) {
            throw new ProcedureException("外部システムへの通知送信に失敗しました。", e);
        }
    }

    @Override
    public AbortResult onAbort(final AbortParameter parameter) {
        // 送信元セッションがロールバックされた場合の後始末（今回は特に処理なし）
        this.pendingPayload = null;
        return new AbortResult(EventStatus.SUCCEEDED);
    }

    private String buildPayload(final LeaveApprovedNotifyData data) {
        return data.getApplicationId() + ":" + data.getApplicantUserCd();
    }

    private void sendToExternalSystem(final String payload) {
        // 外部APIへのHTTP呼び出し等（実装は割愛）
    }
}
```

- ライフサイクルは `onInitialize`（トランザクション開始時に一度）→ `onReceive`（データ受信の都度）→ `onPrepare`（コミット前の確定可否判断）→ `onDecide`（確定処理）/`onAbort`（ロールバック時の後始末）の順に呼ばれる、2相コミットに近い構造
- **`onReceive()` の時点では処理を確定させないこと。** 実際の副作用（外部API呼び出し等）は `onDecide()` で行う。送信元がその後 `abort()` した場合、`onReceive()` で確定済みの副作用は取り消せないため
- 未使用のライフサイクルメソッドは継承元のデフォルト実装のまま残してよい（無理にすべてオーバーライドする必要はない）
- `checkInSession(ReceiveParameter)` は必要に応じてセッション状態を検証するユーティリティメソッドとして利用できる

## パターン4: 受信設定ファイル

`WEB-INF/conf/propagation-receivers-config/{任意名}.xml`（プロジェクトの `src/main/conf/propagation-receivers-config/` 配下）に配置する。`source` には**送信側**のデータモデルの完全修飾クラス名を指定する（受信側データモデルのFQCNではない点に注意）。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<propagation-receivers-config xmlns="http://www.intra-mart.jp/propagation/receivers-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/propagation/receivers-config propagation-receivers-config.xsd">
  <receiver source="jp.co.intra_mart.sample.leave.entity.LeaveApplicationEntity"
            operationType="DATA_UPDATED">
    <decoder class="jp.co.intra_mart.sample.notify.propagation.decoder.LeaveApprovedDecoder" />
    <procedure class="jp.co.intra_mart.sample.notify.propagation.procedure.LeaveApprovedProcedure" />
  </receiver>
</propagation-receivers-config>
```

- `source`/`operationType` は送信側の値と完全一致させる（送信設定ファイルの `sender` 要素の `source`/`operationType`、または intra-mart 標準データの場合は `assets/standard-listener-usage.md` の一覧値）
- 同一 `source`+`operationType` に対して複数の `receiver` 要素を定義してもよい（同じ送信データを複数の独自モジュールが個別に受信できる）。処理順序は保証されないが、各 `receiver` は排他的に（1スレッドずつ）処理される
- `decoder`/`procedure` それぞれの子要素として `<params><param key="...">値</param></params>` を追加すれば、`AbstractDecoder`/`AbstractProcedure`（`AbstractSessionableProcedure` も同様）内でカスタムパラメータを参照できる

## アンチパターン(避けること)

```java
// NG: AbstractProcedure#onReceive() 内で自前のトランザクション制御を行っている
// （ホストのトランザクションに相乗りする前提のため、独自の commit/rollback は不要かつ有害）

// NG: AbstractSessionableProcedure#onReceive() の時点で外部APIへの送信等、取り消せない副作用を確定させている
// （onAbort() で取り消せず、送信元がロールバックしてもデータ不整合が残る）

// NG: 受信設定ファイルの source に受信側データモデルのFQCNを指定している
// （source には常に送信側データモデルのFQCNを指定する）
<receiver source="jp.co.intra_mart.sample.notify.propagation.LeaveApprovedNotifyData" ...>

// NG: Decoder/Procedure がコンパイルエラーにならない範囲で ConvertException/ProcedureException 以外の
// PropagationManagerException を送出している（フレームワーク内部用の例外のため誤用しない）
```
