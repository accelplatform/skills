# 送信側実装パターン（PropagationManager / Encoder / GenericModel）

`PropagationManager`/`Encoder`/`AbstractGeneric` のシグネチャ・内部動作は `reference/propagation-api-reference.md` を参照。ここでは典型的な実装パターンを示す。

## 実装順序

1. データモデル（送信元の POJO。既存の業務エンティティをそのまま使ってもよい）
2. GenericModel（`AbstractGeneric` 継承。データモデルから変換した後の直列化データ）
3. Encoder（`AbstractEncoder` 継承。データモデル → GenericModel の変換）
4. 送信設定ファイル（`propagation-senders-config`）
5. `PropagationManager` 呼び出しコード（業務処理を行うサービスクラス等）

## パターン1: GenericModel の定義

`AbstractGeneric` を継承し、送信したいフィールドを定義する。継承元の `executeTenantId`/`executeUserCd`/`ownerTenantId`/`ownerUserCd` は自動的に利用可能（明示的に設定しない場合は `PropagationManager` 側が実行コンテキストから補完する）。

```java
package jp.co.intra_mart.sample.leave.propagation;

import jp.co.intra_mart.foundation.propagation.model.generic.AbstractGeneric;

/**
 * 休暇申請の承認完了を伝達するための GenericModel。
 */
public class LeaveApprovedGeneric extends AbstractGeneric {

    private static final long serialVersionUID = 1L;

    private String applicationId;
    private String applicantUserCd;
    private String approvedDate;

    public String getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(final String applicationId) {
        this.applicationId = applicationId;
    }

    public String getApplicantUserCd() {
        return applicantUserCd;
    }

    public void setApplicantUserCd(final String applicantUserCd) {
        this.applicantUserCd = applicantUserCd;
    }

    public String getApprovedDate() {
        return approvedDate;
    }

    public void setApprovedDate(final String approvedDate) {
        this.approvedDate = approvedDate;
    }
}
```

- `AbstractGeneric` は `Serializable` を実装済みだが、フィールドを追加するクラス側でも `serialVersionUID` を明示すること
- フィールドの型は `Serializable` を実装した型のみ使用できる（プリミティブ・ラッパー型・`String`・日付型等）
- 受信側は必ずしも同じ `GenericModel` クラスを使う必要はないが、フィールド名・型が乖離すると復元時にデータが失われるため、共有ライブラリ等で同一クラスを参照する構成が最も安全

## パターン2: Encoder の実装

```java
package jp.co.intra_mart.sample.leave.propagation.encoder;

import jp.co.intra_mart.foundation.propagation.exception.ConvertException;
import jp.co.intra_mart.foundation.propagation.sender.AbstractEncoder;

import jp.co.intra_mart.sample.leave.entity.LeaveApplicationEntity;
import jp.co.intra_mart.sample.leave.propagation.LeaveApprovedGeneric;

/**
 * 休暇申請エンティティを LeaveApprovedGeneric に変換する Encoder。
 */
public class LeaveApprovedEncoder extends AbstractEncoder<LeaveApplicationEntity, LeaveApprovedGeneric> {

    @Override
    public LeaveApprovedGeneric encode(final LeaveApplicationEntity data) throws ConvertException {
        if (data == null || data.getApplicationId() == null) {
            throw new ConvertException("変換元データの必須項目が不足しています。");
        }

        final LeaveApprovedGeneric generic = new LeaveApprovedGeneric();
        generic.setApplicationId(data.getApplicationId());
        generic.setApplicantUserCd(data.getApplicantUserCd());
        generic.setApprovedDate(data.getApprovedDate());
        return generic;
    }

    @Override
    public Class<LeaveApprovedGeneric> getGenericDataClass() {
        return LeaveApprovedGeneric.class;
    }
}
```

- 変換に失敗した場合（必須項目の欠落・型変換エラー等）は `ConvertException`（のサブクラス）を送出する。`PropagationManagerException` を送出してはならない
- `getGenericDataClass()` は生成する `GenericModel` の `Class` オブジェクトをそのまま返す（フレームワークが内部でクラス解決に使用する）
- 送信設定ファイルの `param` 要素でカスタムパラメータを渡したい場合、`AbstractEncoder#getParamKeys()`/`getParamValue(String)`/`getParamValues(String)` で参照できる（`setParamValuesMap` はフレームワークが自動的に呼び出すため実装不要）

## パターン3: 送信設定ファイル

`WEB-INF/conf/propagation-senders-config/{任意名}.xml`（プロジェクトの `src/main/conf/propagation-senders-config/` 配下）に配置する。`source` にはデータモデル（Encoder の型パラメータ `D`）の完全修飾クラス名を指定する。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<propagation-senders-config xmlns="http://www.intra-mart.jp/propagation/senders-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/propagation/senders-config propagation-senders-config.xsd">
  <sender source="jp.co.intra_mart.sample.leave.entity.LeaveApplicationEntity"
          operationType="DATA_UPDATED">
    <encoder class="jp.co.intra_mart.sample.leave.propagation.encoder.LeaveApprovedEncoder" />
  </sender>
</propagation-senders-config>
```

- `source` は `PropagationManager#send()` に渡す `data`（または明示的に指定する `dataClass`）の完全修飾クラス名と一致させる
- `operationType` は `reference/propagation-api-reference.md` の `OperationType` 標準定数（`DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED`/`PROC_STARTED`/`PROC_COMPLETED` 等）を優先的に使う。独自の業務イベントを表す場合のみ独自の文字列定数を定義する
- `encoder` 要素にカスタムパラメータを渡したい場合、`<encoder class="...">` の子要素として `<params><param key="...">値</param></params>` を追加する
- 同一 `source`+`operationType` の組み合わせで複数の `sender` を定義すると、複数の Encoder が呼び出される（用途がある場合のみ使用）

## パターン4: `PropagationManager` によるデータ送信

### 基本形（`begin`/`send`/`decide`/`abort`）

```java
package jp.co.intra_mart.sample.leave.service;

import jp.co.intra_mart.foundation.propagation.PropagationManager;
import jp.co.intra_mart.foundation.propagation.PropagationManagerFactory;
import jp.co.intra_mart.foundation.propagation.exception.PropagationException;
import jp.co.intra_mart.foundation.propagation.model.EmptyObject;
import jp.co.intra_mart.foundation.propagation.model.SendResult;

import jp.co.intra_mart.sample.leave.entity.LeaveApplicationEntity;

/**
 * 休暇申請の承認完了を通知します。
 */
public class LeaveApprovalService {

    public void notifyApproved(final LeaveApplicationEntity entity) throws PropagationException {
        final PropagationManager manager = PropagationManagerFactory.getInstance().getPropagationManager();
        try {
            manager.begin();

            // ここで DB 更新処理（承認ステータスの保存等）を行う

            final SendResult<EmptyObject> result =
                    manager.send("DATA_UPDATED", entity, EmptyObject.class);

            manager.decide();
        } finally {
            manager.abort();
            manager.close();
        }
    }
}
```

- `begin()` はセッションを開始し、実行コンテキストに DB トランザクションが無ければ新規に開始する。**業務上の DB 更新処理は `begin()` の後・`decide()` の前に行う**（同一トランザクション内に収めるため）
- `abort()` は `decide()` 済みのセッションに対して呼んでも安全（何もしない）ため、常に `finally` に置いてよい
- 戻り値が不要な場合、`resultClass` には `jp.co.intra_mart.foundation.propagation.model.EmptyObject` を指定する
- `close()` はリソース解放のため、`abort()`/`decide()` の後に必ず呼ぶ（複数回呼んでも安全）

### `execute(Callable)` を使う形（begin/decide/abort を自動化）

```java
final PropagationManager manager = PropagationManagerFactory.getInstance().getPropagationManager();
try {
    manager.execute(() -> {
        // DB 更新処理
        return manager.send("DATA_UPDATED", entity, EmptyObject.class);
    });
} finally {
    manager.close();
}
```

- `execute()` は内部で `begin()` を行い、`Callable` が正常な値を返せば `decide()`、`null` を返すか例外を送出すれば `abort()` を自動的に呼ぶ
- `send()` 自体は検査例外 `SendException` を送出しうる。`Callable#call()` の `throws Exception` にそのまま乗せられるため、呼び出し側で個別に try-catch する必要は薄い

### セッション管理不要なケース（DB トランザクションと連動させない単発送信）

```java
final PropagationManager manager = PropagationManagerFactory.getInstance().getPropagationManager();
try {
    manager.send("DATA_UPDATED", entity, EmptyObject.class);
} finally {
    manager.close();
}
```

- `begin()`/`decide()` を呼ばずに `send()` のみを呼ぶことも可能。ただし、DB 更新と同一トランザクションで完結させたい場合（受信側の `AbstractProcedure` がホストのトランザクションに相乗りする前提の場合）は必ず `begin()`/`decide()` で囲むこと

## アンチパターン（避けること）

```java
// NG: begin() したセッションを decide()/abort()/close() のいずれでも終了させていない
manager.begin();
manager.send("DATA_UPDATED", entity, EmptyObject.class);
manager.decide();
// close() を呼んでいない（リソースリークの原因になりうる）

// NG: Encoder が変換失敗時に ConvertException 以外を投げている
@Override
public LeaveApprovedGeneric encode(final LeaveApplicationEntity data) {
    return new LeaveApprovedGeneric(); // 必須項目のチェックをせず不完全なデータを返す

// NG: source に指定するFQCNを、実際に send() へ渡すデータのクラスと一致させていない
// （sender 要素の source が LeaveApplicationEntity なのに、
//   send("DATA_UPDATED", someOtherClassInstance, EmptyObject.class) を呼んでいる）

// NG: operationType を送信設定ファイルと呼び出しコードで一致させていない（例: 設定は"DATA_UPDATED"、コードは"UPDATED"）
manager.send("UPDATED", entity, EmptyObject.class);
```
