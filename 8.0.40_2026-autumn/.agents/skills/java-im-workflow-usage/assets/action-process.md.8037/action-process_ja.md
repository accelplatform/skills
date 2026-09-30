# ワークフロー アクション処理テンプレート（Java / JavaEE 開発モデル）

## 概要

IM-Workflow のアクション処理を Java で実装するテンプレート。
画面を持たず、ワークフローの各処理（申請・承認・否認・差戻し等）のタイミングで実行される。

抽象クラス `jp.co.intra_mart.foundation.workflow.plugin.process.action.ActionProcessEventListener` を継承し、実装したい処理タイミングのメソッドのみを `@Override` する。**継承元は全メソッドに空実装（`return null;` 等）を持つため、使わないメソッドをオーバーライドする必要はない。**

**注意**: このクラスの処理中では DB トランザクションを張らないこと。

## 継承元クラス

| 項目 | 値 |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.plugin.process.action.ActionProcessEventListener` |
| 種別 | 抽象クラス（`public abstract class`） |
| パラメータクラス | `jp.co.intra_mart.foundation.workflow.plugin.process.action.ActionProcessParameter` |
| ユーザパラメータ | `java.util.Map<String, Object>`（画面の hidden フィールドの name/value。**値はすべて `String`**） |

## ファイル構成

```
src/main/java/{basePackageのパス}/{機能名}/workflow/action/
  └── {Feature}ActionProcess.java
```

---

## オーバーライド可能なメソッド一覧

| メソッド名 | 処理タイミング | 戻り値 | data 返却（案件番号） |
|-----------|--------------|--------|----------------------|
| `apply` | 申請 | `String` | あり（`null` 以外を返すと案件番号を上書き） |
| `reapply` | 再申請 | `String` | あり |
| `applyFromTempSave` | 申請（一時保存案件） | `String` | あり |
| `applyFromUnapply` | 申請（未申請状態案件） | `String` | あり |
| `discontinue` | 取止め | `void` | なし |
| `pullBack` | 引戻し | `void` | なし |
| `sendBackToPullBack` | 差戻し後引戻し | `void` | なし |
| `approve` | 承認 | `void` | なし |
| `approveEnd` | 承認終了 | `void` | なし |
| `deny` | 否認 | `void` | なし |
| `sendBack` | 差戻し | `void` | なし |
| `reserve` | 保留 | `void` | なし |
| `reserveCancel` | 保留解除 | `void` | なし |
| `matterHandle` | 案件操作 | `void` | なし |
| `tempSaveCreate` | 一時保存（新規登録） | `void` | なし |
| `tempSaveUpdate` | 一時保存（更新） | `void` | なし |
| `tempSaveDelete` | 一時保存（削除） | `void` | なし |

全メソッド共通のシグネチャ:

```java
public {戻り値型} {メソッド名}(final ActionProcessParameter parameter, final Map<String, Object> userParameter) throws Exception
```

`ActionProcessParameter` のフィールド一覧は [reference/parameter-reference.md](../reference/parameter-reference.md) を参照。

---

## アクション処理クラス（{Feature}ActionProcess.java）

```java
package {basePackage}.{機能名}.workflow.action;

import java.util.Map;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.plugin.process.action.ActionProcessEventListener;
import jp.co.intra_mart.foundation.workflow.plugin.process.action.ActionProcessParameter;

/**
 * {機能名} ワークフロー アクション処理クラス。<br>
 * ワークフローの各処理タイミング（申請・承認・否認・差戻し等）で実行されます。<br>
 * このクラスの処理中では DB トランザクションを張らないでください。
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}ActionProcess extends ActionProcessEventListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}ActionProcess.class);

    /**
     * 申請処理を行った場合に実行されます。
     *
     * @param parameter ワークフローパラメータ
     * @param userParameter ユーザパラメータ
     * @return String 案件番号（サイズ：20バイト）
     * @throws Exception 例外が発生
     */
    @Override
    public String apply(final ActionProcessParameter parameter, final Map<String, Object> userParameter) throws Exception {
        LOGGER.info("Started apply process. systemMatterId=" + parameter.getSystemMatterId());
        final String matterNumber = createMatterNumber();
        processBusinessLogic("apply", parameter, userParameter);
        LOGGER.info("Completed apply process. systemMatterId=" + parameter.getSystemMatterId());
        return matterNumber;
    }

    /**
     * 承認処理を行った場合に実行されます。
     *
     * @param parameter ワークフローパラメータ
     * @param userParameter ユーザパラメータ
     * @throws Exception 例外が発生
     */
    @Override
    public void approve(final ActionProcessParameter parameter, final Map<String, Object> userParameter) throws Exception {
        processBusinessLogic("approve", parameter, userParameter);
    }

    /**
     * 否認処理を行った場合に実行されます。
     *
     * @param parameter ワークフローパラメータ
     * @param userParameter ユーザパラメータ
     * @throws Exception 例外が発生
     */
    @Override
    public void deny(final ActionProcessParameter parameter, final Map<String, Object> userParameter) throws Exception {
        processBusinessLogic("deny", parameter, userParameter);
    }

    /**
     * 差戻し処理を行った場合に実行されます。
     *
     * @param parameter ワークフローパラメータ
     * @param userParameter ユーザパラメータ
     * @throws Exception 例外が発生
     */
    @Override
    public void sendBack(final ActionProcessParameter parameter, final Map<String, Object> userParameter) throws Exception {
        processBusinessLogic("sendBack", parameter, userParameter);
    }

    /**
     * 案件番号を採番します。
     *
     * @return String 採番された案件番号
     * @throws Exception 採番に失敗した場合
     */
    private String createMatterNumber() throws Exception {
        // TODO: 採番方法をプロジェクトの方針に合わせて実装してください
        // JavaEE 開発モデルには JSSP 版の WorkflowNumberingManager に相当する
        // 標準 API の有無をプラットフォームのバージョンに応じて確認すること
        throw new UnsupportedOperationException("案件番号の採番ロジックが未実装です。");
    }

    /**
     * ビジネスロジックのメイン処理を実行します。
     * 各アクションメソッドから呼び出されます。
     *
     * @param actionType アクション種別
     * @param parameter ワークフローパラメータ
     * @param userParameter ユーザパラメータ
     * @throws Exception 例外が発生
     */
    private void processBusinessLogic(final String actionType, final ActionProcessParameter parameter,
            final Map<String, Object> userParameter) throws Exception {
        // TODO: ここで actionType に応じたビジネスロジックを実装してください
        //
        // 利用可能な主要パラメータ:
        //   parameter.getSystemMatterId()  - システム案件ID
        //   parameter.getUserDataId()      - ユーザデータID
        //   parameter.getAuthUserCd()      - 処理権限者コード
        //   parameter.getExecUserCd()      - 処理実行者コード
        //   parameter.getProcessComment()  - 処理コメント
        //
        // userParameter の値はすべて String 型。数値として扱う場合は変換すること。
    }
}
```

---

## 案件プロパティ・独自テーブルへの保存について

JSSP 版と同様、案件プロパティ（`UserActvMatterPropertyValue` 相当）またはプロジェクト独自テーブルへの保存で申請データを永続化する。JavaEE 開発モデルにおける案件プロパティ操作 API は、プラットフォームのバージョンに応じて `d.ts`（JSSP 用）に相当する Java API リファレンスが存在しないため、**dev-knowledge（ソースコード検索）で該当 API クラスの存在を確認してから実装すること**。記憶や推測で存在しない API を呼び出さない。

独自テーブルへの保存を選ぶ場合は、`parameter.getSystemMatterId()` または `parameter.getUserDataId()` を外部キーとして使用する。

## 生成時の注意事項

### `@Override` を必ず付ける

シグネチャの取り違え（引数の型・個数・戻り値型の誤り）はコンパイルエラーにならず「オーバーロードした別メソッドを追加しただけ」になり、ワークフローエンジンから呼び出されない不具合になる。`@Override` を付けることでコンパイラに継承元との一致を検証させる。

### userParameter の値は全て文字列型

`userParameter`（画面フォームから渡されるユーザデータ）の値は **全て `String` 型**（`Map<String, Object>` だが実体は `String`）。数値として扱う場合は `Integer.parseInt(...)` / `new BigDecimal(...)` 等で変換してから使用すること。

### 案件番号の採番は必須（apply系メソッド）

`apply` / `applyFromTempSave` / `applyFromUnapply` は `null` 以外の `String` を返すと案件番号が更新される。仕様書で採番方法の指定がない場合、プロジェクトの採番方式（プラットフォーム API または独自シーケンス）を確認してから実装すること。**JSSP 版の `WorkflowNumberingManager.getNumber()` に相当する Java API が同一かどうかは dev-knowledge で確認すること。**

### apply / applyFromUnapply でのデータ保存

`apply` 内でユーザデータ（業務テーブル）に INSERT する場合、引き戻し後の再申請（`applyFromUnapply`）では既にデータが存在することに注意する。`apply` に処理を委譲する実装にする場合、UPSERT（存在チェック後の INSERT/UPDATE 切り替え）にすること。JSSP 版 `simple-action-process.md` の「apply / applyFromUnapply でのデータ保存」セクションと同じ考え方。

### 例外は具体的なメッセージを添えて送出する

```java
// NG: メッセージなし
throw new Exception();

// OK: トラブルシューティングに必要な情報を含める（日本語、.agents/requirements/java-javadoc/AGENTS.md 準拠）
throw new IllegalStateException(
    "案件番号の採番に失敗しました。systemMatterId=" + parameter.getSystemMatterId());
```
