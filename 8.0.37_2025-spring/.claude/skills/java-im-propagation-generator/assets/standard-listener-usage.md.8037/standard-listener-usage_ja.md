# intra-mart 標準データの送受信パターン（標準リスナー）

intra-mart Accel Platform は、自身が標準機能として更新するデータの変更通知を IM-Propagation 経由で送信しており、独自モジュールはこれを「受信側」として受け取れる。また、IM-Box 等 intra-mart 標準機能が用意する受信処理（Decoder/Procedure 実装済み）へ、独自モジュールが「送信側」としてデータを送ることもできる。いずれも `source`/`operationType` の組み合わせが固定されているため、独自に類推せず本ファイルの一覧値をそのまま使うこと。

## パターン1: intra-mart 標準の変更通知を受信する

実装方法は「他の独自モジュールから送信されたデータを受信する」場合と全く同じ（`assets/receiver-usage.md` 参照）。異なるのは、受信設定ファイルの `source`/`operationType` に、送信元である intra-mart 標準機能が使用する固定値を指定する点、および `Decoder<G, D>` の `G` に **intra-mart が IM-Propagation 専用に提供する共通モデルクラス**を指定する点である。

### 【最重要】`G` には管理系 API のドメインモデルクラスを直接使わず、`jp.co.intra_mart.foundation.propagation.model.generic` パッケージの `Generic*` クラスを使う

`jp.co.intra_mart.foundation.propagation.model.generic` パッケージには、`AbstractGeneric` 継承の共通モデルクラスが約30種類提供されている（`GenericAccount`/`GenericTenant`/`GenericRole`/`GenericAdministrator`/`GenericAuthzResource`/`GenericAuthzPolicy`/`GenericAuthzResourceGroup`/`GenericAuthzSubjectGroup`/`GenericMenuGroup`/`GenericMenuItem`/`GenericCalendar`/`GenericDay`/`GenericJobnet`/`GenericJobnetTrigger`/`GenericUpdatedTenant` 等）。このパッケージの Javadoc には、伝搬データを格納するクラスが満たすべき要件が明記されている（原文に基づく要約）。

1. 総称型（ジェネリクス）を使用しないこと
2. 単純な getter/setter で構成されたシリアライズ可能なクラスであること
3. 引数が0個のコンストラクタが用意されていること
4. フィールドの型が、プリミティブ型、または伝搬機能内で直列化データと相互変換可能なクラス・インタフェースを実装したクラスに限定されていること（`BigDecimal`/`BigInteger`/`Calendar`/`Collection`/`Date`/`List`/`Locale`/`Map`/`String`/`TimeZone`/`URI`/`URL`/`UUID` 等とそのラッパー・配列を含む）

`jp.co.intra_mart.foundation.admin.account.model.AccountInfo` 等、IM-共通マスタや各種管理 API が提供するドメインモデルクラスは、**上記の要件（特に3番目の「引数なしコンストラクタ」）を満たすとは限らない。** `AccountInfo` は `public AccountInfo(String userCd)` の1引数コンストラクタしか持たず、この要件を満たさない。これを `Decoder<G, D>` の `G` に直接指定して受信登録すると、以下の重大な不具合が発生する。

- IM-Propagation は GenericModel の受け渡しに Java 標準シリアライズではなく **JSON（JSONIC ライブラリ）ベースの変換**を用いており、受信側は `Decoder#getGenericDataClass()` が返すクラスを JSON からリフレクション（引数なしコンストラクタ）で再構築する
- 引数なしコンストラクタを持たない `AccountInfo` をこの再構築に使おうとすると `NoSuchMethodException` → `JSONException` → `SendException` となり、**受信側の実装が正しいかどうかに関係なく、送信元である intra-mart 標準機能側（アカウント更新処理そのもの）が失敗する**
- 結果として、その受信設定ファイルが配置されている限り、**テナント全体でアカウント情報の更新ができなくなる**（「受信できない」だけでなく「送信元の標準機能が壊れる」という重大な影響）

**この問題は、`G` に `AccountInfo` の代わりに `jp.co.intra_mart.foundation.propagation.model.generic.GenericAccount` を指定することで解消する。** `GenericAccount` は上記4要件を満たすよう設計された、intra-mart 提供の公式クラスである。

**したがって、intra-mart 標準データを受信する場合は、常に以下の方針に従うこと。**

- **`source` 属性には、引き続き送信元データの完全修飾クラス名（例: `AccountInfo` の FQCN）を指定する。** これはルーティング用の識別子であり、変更不要
- **`Decoder<G, D>` の `G`、および `getGenericDataClass()` の戻り値には、`source` のクラスではなく、`jp.co.intra_mart.foundation.propagation.model.generic` パッケージ配下の対応する `Generic*` クラスを指定する**（下表「使用する Generic クラス」列を参照）
- 対応する `Generic*` クラスが見つからない、または存在が確認できない場合は、**独自に `AbstractGeneric` 継承のミラークラスを自作する**（本パッケージの4要件を満たすように設計する）ことでも回避できるが、intra-mart 公式クラスが存在する場合は必ずそちらを優先する（フィールド追加・仕様変更に追従してもらえるため）
- `source` のドメインモデルクラス（`AccountInfo` 等）を直接 `G` に指定してはならない。管理系 API のモデルクラスは IM-Propagation の要件を満たすことを保証されていない

### 標準の送信元一覧

| カテゴリ | `source`（送信元データの完全修飾クラス名） | `operationType` | 使用する Generic クラス（`jp.co.intra_mart.foundation.propagation.model.generic` 配下） |
|---|---|---|---|
| テナントセットアップ完了 | `jp.co.intra_mart.system.service.provider.updater.propagation.UpdatedTenant` | `PROC_COMPLETED` | `GenericUpdatedTenant` |
| テナント情報 | `jp.co.intra_mart.foundation.admin.tenant.model.TenantInfo` | `DATA_CREATING`/`DATA_CREATED`/`DATA_UPDATING`/`DATA_UPDATED`/`DATA_DELETING`/`DATA_DELETED` | `GenericTenant` |
| システム管理者情報 | `jp.co.intra_mart.foundation.admin.tenant.model.Administrator` | 上記と同じ組 | `GenericAdministrator` |
| アカウント情報 | `jp.co.intra_mart.foundation.admin.account.model.AccountInfo` | 上記と同じ組 | **`GenericAccount`（下記実装例参照）** |
| ロール | `jp.co.intra_mart.foundation.admin.role.model.RoleInfo` | 上記と同じ組 | `GenericRole` |
| IM-Authz リソースグループ | `jp.co.intra_mart.foundation.authz.model.resources.ResourceGroup` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED` | `GenericAuthzResourceGroup` |
| IM-Authz リソース | `jp.co.intra_mart.foundation.authz.model.resources.Resource` | `DATA_CREATED`/`DATA_DELETED` | `GenericAuthzResource` |
| IM-Authz サブジェクトグループ | `jp.co.intra_mart.foundation.authz.model.subjects.SubjectGroup` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED` | `GenericAuthzSubjectGroup` |
| IM-Authz ポリシー | `jp.co.intra_mart.foundation.authz.model.policies.Policy` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED` | `GenericAuthzPolicy` |
| メニューグループ | `jp.co.intra_mart.foundation.menu.model.MenuGroup` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED` | `GenericMenuGroup` |
| メニュー項目 | `jp.co.intra_mart.system.menu.propagation.HierarchicalMenuItem` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED` | `GenericMenuItem` |
| カレンダー情報 | `jp.co.intra_mart.foundation.calendar.model.CalendarInfo` | `DATA_CREATING`/`DATA_CREATED`/`DATA_UPDATING`/`DATA_UPDATED`/`DATA_DELETING`/`DATA_DELETED` | `GenericCalendar` |
| 休日情報 | `jp.co.intra_mart.foundation.calendar.model.DayInfo` | 上記と同じ組 | `GenericDay` |
| ジョブネット定義 | `jp.co.intra_mart.foundation.job_scheduler.model.jobnet.Jobnet` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED` | `GenericJobnet` |
| ジョブネット実行完了 | `jp.co.intra_mart.system.job_scheduler.propagation.CompletedJobnetInfoModel` | `PROC_COMPLETED` | `GenericJobnet`（`Status`/`StartDate`/`EndDate` 等、定義情報と実行結果情報の両方を1クラスで表現する） |
| Salesforce 監視対象オブジェクト | `jp.co.intra_mart.foundation.salesforce.streaming.model.SalesforceEventNotification` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED`/`DATA_UN_DELETED` | `jp.co.intra_mart.foundation.propagation.model.generic` パッケージ内に対応するクラスは見つからなかった。実装前に個別に Javadoc を確認すること |
| Wiki コンテンツ | `jp.co.intra_mart.foundation.wiki.logic.trigger.WikiContentsInfo` | `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED` | `jp.co.intra_mart.foundation.propagation.model.generic` パッケージ内に対応するクラスは見つからなかった。実装前に個別に Javadoc を確認すること |

### 実装例（アカウント情報の更新を受信する。`GenericAccount` を使用）

```java
package jp.co.intra_mart.sample.audit.propagation.decoder;

import jp.co.intra_mart.foundation.propagation.exception.ConvertException;
import jp.co.intra_mart.foundation.propagation.model.generic.GenericAccount;
import jp.co.intra_mart.foundation.propagation.receiver.AbstractDecoder;

import jp.co.intra_mart.sample.audit.propagation.AccountAuditData;

/**
 * intra-mart 標準の GenericAccount を監査記録用データに変換する Decoder。
 */
public class AccountInfoDecoder extends AbstractDecoder<GenericAccount, AccountAuditData> {

    @Override
    public AccountAuditData decode(final GenericAccount generic) throws ConvertException {
        final AccountAuditData data = new AccountAuditData();
        data.setUserCd(generic.getUserCd());
        data.setLocked(generic.getLockDate() != null);
        return data;
    }

    @Override
    public Class<GenericAccount> getGenericDataClass() {
        return GenericAccount.class;
    }
}
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<propagation-receivers-config xmlns="http://www.intra-mart.jp/propagation/receivers-config">
  <!-- source は送信元データ（AccountInfo）の FQCN のまま。G（decoder が実際に受け取るクラス）だけ GenericAccount にする -->
  <receiver source="jp.co.intra_mart.foundation.admin.account.model.AccountInfo"
            operationType="DATA_UPDATED">
    <decoder class="jp.co.intra_mart.sample.audit.propagation.decoder.AccountInfoDecoder" />
    <procedure class="jp.co.intra_mart.sample.audit.propagation.procedure.AccountAuditProcedure" />
  </receiver>
</propagation-receivers-config>
```

- **`source` 属性は送信元データ（`AccountInfo`）の FQCN のまま変更しない。** `G` として使うクラス（`GenericAccount`）とは独立している
- `GenericAccount` の主なフィールド: `userCd`/`password`/`locale`/`timeZoneId`/`calendarId`/`encoding`/`firstDayOfWeek`/`dateTimeFormats`（`Map<String, String>`）/`themeIds`（`Map<String, String>`）/`loginFailureCount`/`lockDate`（`Date`）/`validStartDate`（`Date`）/`validEndDate`（`Date`）/`notes`、および `AbstractGeneric` 継承の4フィールド（`executeTenantId`/`executeUserCd`/`ownerTenantId`/`ownerUserCd`）
- 送信側（intra-mart 本体）の設定・実装は変更できない。受信側（本スキルが生成する Decoder/Procedure + 受信設定ファイル）のみを実装すればよい

## パターン2: IM-Box（アプリ通知・ウォッチ）へデータを送信する

IM-Box が提供する標準の `GenericModel`（`jp.co.intra_mart.foundation.propagation.model.generic.imbox` パッケージ）を使うと、独自モジュールから「送信側」としてデータを送るだけで、IM-Box 側の標準実装（受信設定・Decoder・Procedure は intra-mart 側に実装済み）が処理してくれる。**この用途では受信設定ファイルを新規作成する必要はない。**

### 標準の GenericModel 一覧

| 用途 | GenericModel（`jp.co.intra_mart.foundation.propagation.model.generic.imbox` 配下） | `operationType` | 説明 |
|---|---|---|---|
| アプリ通知（スレッド単位） | `GenericSendNoticeThread` | `SEND_NOTICE_THREAD` | スレッド単位のアプリ通知を送信 |
| アプリ通知（メッセージ単位） | `GenericSendNoticeMessage` | `SEND_NOTICE_MESSAGE` | メッセージ単位のアプリ通知を送信 |
| ウォッチ通知（スレッド単位） | `GenericSendWatchThread` | `SEND_WATCH_THREAD` | スレッド単位のウォッチ通知を送信 |
| ウォッチ通知（メッセージ単位） | `GenericSendWatchMessage` | `SEND_WATCH_MESSAGE` | メッセージ単位のウォッチ通知を送信 |
| ウォッチ登録 | `GenericWatch` | `WATCH` | ウォッチを新規登録 |
| ウォッチ解除 | `GenericUnwatch` | `UNWATCH` | ウォッチを解除 |

`GenericWatch`/`GenericUnwatch` の主なフィールド:

- `GenericWatch`: `applicationCd`（アプリケーションコード）/`watchUserCd`（ウォッチ登録するユーザコード）/`mapTargets`（`Map<String, String>`。ウォッチ対象を識別するキー・値の組）
- `GenericUnwatch`: `applicationCd`/`unwatchUserCd`（ウォッチ解除するユーザコード）/`mapTargets`

### 実装例（ウォッチの登録）

**Encoder は不要。** IM-Box 標準の `GenericModel`（`GenericWatch`）をそのまま組み立てて `PropagationManager#send()` に渡すだけでよい。

```java
package jp.co.intra_mart.sample.leave.service;

import java.util.HashMap;
import java.util.Map;

import jp.co.intra_mart.foundation.propagation.PropagationManager;
import jp.co.intra_mart.foundation.propagation.PropagationManagerFactory;
import jp.co.intra_mart.foundation.propagation.exception.PropagationException;
import jp.co.intra_mart.foundation.propagation.model.EmptyObject;
import jp.co.intra_mart.foundation.propagation.model.generic.imbox.GenericWatch;

/**
 * 休暇申請案件を IM-Box のウォッチに登録します。
 */
public class LeaveWatchService {

    public void registerWatch(final String applicationCd, final String userCd, final String applicationId)
            throws PropagationException {
        final GenericWatch watch = new GenericWatch();
        watch.setApplicationCd(applicationCd);
        watch.setWatchUserCd(userCd);

        final Map<String, String> targets = new HashMap<String, String>();
        targets.put("applicationId", applicationId);
        watch.setMapTargets(targets);

        final PropagationManager manager = PropagationManagerFactory.getInstance().getPropagationManager();
        try {
            manager.execute(() -> manager.send("WATCH", GenericWatch.class, watch, EmptyObject.class));
        } catch (final Exception e) {
            throw new PropagationException("ウォッチ登録に失敗しました。", e);
        } finally {
            manager.close();
        }
    }
}
```

対応する送信設定ファイル:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<propagation-senders-config xmlns="http://www.intra-mart.jp/propagation/senders-config">
  <sender source="jp.co.intra_mart.foundation.propagation.model.generic.imbox.GenericWatch"
          operationType="WATCH">
    <!-- GenericWatch 自体が既に GenericModel であるため、変換を行わない Encoder（恒等変換）を実装して登録する -->
    <encoder class="jp.co.intra_mart.sample.leave.propagation.encoder.GenericWatchIdentityEncoder" />
  </sender>
</propagation-senders-config>
```

- `PropagationManager#send()` は必ず Encoder を介して `GenericModel` に変換する仕組みのため、送信するデータが**既に** `GenericModel`（`GenericWatch` 等）である場合でも、恒等変換（そのまま返す）を行う `Encoder` を実装し、送信設定ファイルに登録する必要がある
- 恒等変換 Encoder の実装例:

```java
package jp.co.intra_mart.sample.leave.propagation.encoder;

import jp.co.intra_mart.foundation.propagation.exception.ConvertException;
import jp.co.intra_mart.foundation.propagation.sender.AbstractEncoder;
import jp.co.intra_mart.foundation.propagation.model.generic.imbox.GenericWatch;

/**
 * 既に GenericModel であるデータをそのまま送信するための恒等変換 Encoder。
 */
public class GenericWatchIdentityEncoder extends AbstractEncoder<GenericWatch, GenericWatch> {

    @Override
    public GenericWatch encode(final GenericWatch data) throws ConvertException {
        return data;
    }

    @Override
    public Class<GenericWatch> getGenericDataClass() {
        return GenericWatch.class;
    }
}
```

## 注意事項

- **標準の `source`/`operationType` は本ファイル記載の値と完全一致させること。** 一致しない場合、送信設定・受信設定ファイルの読み込み自体は成功するが、データが実際には流れず、エラーも出力されないまま「何も起きない」状態になる
- **intra-mart 標準データを受信する場合、`Decoder<G, D>` の `G` には管理系 API のドメインモデルクラス（`AccountInfo`/`TenantInfo`/`RoleInfo` 等）を直接指定せず、上表の「使用する Generic クラス」列に記載した `jp.co.intra_mart.foundation.propagation.model.generic` パッケージのクラスを使うこと。** ドメインモデルクラスを直接使うと、引数なしコンストラクタの欠如等により送信元（intra-mart 標準機能）自体が破壊されるおそれがある。`AccountInfo` はこの典型例である
- **`Generic*` クラスも intra-mart 提供のクラスをそのまま使う。** フィールドを増やす等のカスタマイズはできない
- **IM-Box 等、標準機能への送信で使う `GenericModel`（`GenericWatch` 等）も intra-mart 提供のクラスをそのまま使う。** フィールドを増やす等のカスタマイズはできない
- 本ファイルに記載のない intra-mart 標準データ（新しいバージョンで追加された送信元等）を利用したい場合は、該当バージョンの IM-Propagation 設定一覧（`im_propagation_configuration_list`）と `jp.co.intra_mart.foundation.propagation.model.generic` パッケージの Javadoc を確認し、`source`/`operationType`/対応する `Generic*` クラスを正確に特定してから実装すること
