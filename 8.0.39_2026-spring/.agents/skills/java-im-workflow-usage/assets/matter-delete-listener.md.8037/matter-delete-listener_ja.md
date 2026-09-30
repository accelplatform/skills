# ワークフロー 案件削除リスナーテンプレート（Java / JavaEE 開発モデル）

## 概要

未完了案件・完了案件・過去案件の削除時に実行されるリスナーを Java で実装するテンプレート。実装するインタフェースは3種類とも異なり、**過去案件削除のみメソッドシグネチャが異なる**（`archiveMonth` 引数が追加される）点に注意。

他のワークフロー処理と異なり、引数は `Parameter` オブジェクトではなく **個別の文字列値** として渡される点に注意（JSSP 版と同じ設計）。

**注意**: このクラスの処理中では DB トランザクションを張らないこと。

## 実装インタフェース一覧

| 削除対象 | FQCN | メソッドシグネチャ |
|---------|------|------|
| 未完了案件削除 | `jp.co.intra_mart.foundation.workflow.listener.IWorkflowActvMatterDeleteListener` | `execute(String, String, String, String)`（4引数） |
| 完了案件削除 | `jp.co.intra_mart.foundation.workflow.listener.IWorkflowCplMatterDeleteListener` | `execute(String, String, String, String)`（4引数） |
| **過去案件削除** | `jp.co.intra_mart.foundation.workflow.listener.IWorkflowArcMatterDeleteListener` | **`execute(String, String, String, String, String)`（5引数。`archiveMonth` が末尾に追加される）** |

**未完了案件削除・完了案件削除の共通メソッド:**

```java
void execute(String loginGroupId, String localeId, String systemMatterId, String userDataId) throws WorkflowException;
```

| 引数名 | 型 | 説明 |
|--------|------|------|
| loginGroupId | String | ログイングループID（テナントIDと同値） |
| localeId | String | ロケールID |
| systemMatterId | String | システム案件ID |
| userDataId | String | ユーザデータID |

**過去案件削除のメソッド（引数が1つ多い）:**

```java
void execute(String loginGroupId, String localeId, String systemMatterId, String userDataId, String archiveMonth) throws WorkflowException;
```

| 引数名 | 型 | 説明 |
|--------|------|------|
| loginGroupId | String | ログイングループID（テナントIDと同値） |
| localeId | String | ロケールID |
| systemMatterId | String | システム案件ID |
| userDataId | String | ユーザデータID |
| **archiveMonth** | **String** | **アーカイブ年月（`yyyyMM` 形式）。過去案件は年月単位でテーブルが分かれる（`imw_ayyyymm_matter_user_data` 等）ため、削除対象を特定するために渡される** |

**シグネチャ不一致に関する注意（重要）:** 過去案件削除リスナーを未完了/完了案件削除リスナーと同じ4引数のまま実装すると、`@Override` を付けていてもコンパイラは「オーバーロードした別メソッドを追加しただけ」と解釈し、`execute` が未実装として扱われてコンパイルエラー（抽象メソッド未実装）になる。3種類とも同一シグネチャだと思い込んで実装しないこと。

## ファイル構成

```
src/main/java/{basePackageのパス}/{機能名}/workflow/
  └── {Feature}ActiveMatterDeleteListener.java     # 未完了案件削除（4引数）
  └── {Feature}CompletedMatterDeleteListener.java  # 完了案件削除（4引数）
  └── {Feature}ArchivedMatterDeleteListener.java   # 過去案件削除（5引数）
```

---

## 未完了案件削除リスナー（{Feature}ActiveMatterDeleteListener.java）

```java
package {basePackage}.{機能名}.workflow;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.exception.WorkflowException;
import jp.co.intra_mart.foundation.workflow.listener.IWorkflowActvMatterDeleteListener;

/**
 * {機能名} ワークフロー 未完了案件削除リスナークラス。<br>
 * 未完了案件が削除される際に実行されます。<br>
 * このクラスの処理中では DB トランザクションを張らないでください。
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}ActiveMatterDeleteListener implements IWorkflowActvMatterDeleteListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}ActiveMatterDeleteListener.class);

    /**
     * 未完了案件削除処理を実行します。
     *
     * @param loginGroupId ログイングループID
     * @param localeId ロケールID
     * @param systemMatterId システム案件ID
     * @param userDataId ユーザデータID
     * @throws WorkflowException ワークフロー例外
     */
    @Override
    public void execute(final String loginGroupId, final String localeId, final String systemMatterId,
            final String userDataId) throws WorkflowException {
        LOGGER.info("Started active matter delete process. systemMatterId=" + systemMatterId);

        // TODO: ここで未完了案件削除時のビジネスロジックを実装してください
        //
        // 主な用途:
        //   - 独自テーブルに保持している申請データの削除
        //   - 添付ファイル等の関連リソースの削除
    }
}
```

完了案件削除も同じ4引数の構造で、実装インタフェース（`IWorkflowCplMatterDeleteListener`）とクラス名のみ差し替える。

## 過去案件削除リスナー（{Feature}ArchivedMatterDeleteListener.java）— 5引数版

```java
package {basePackage}.{機能名}.workflow;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.exception.WorkflowException;
import jp.co.intra_mart.foundation.workflow.listener.IWorkflowArcMatterDeleteListener;

/**
 * {機能名} ワークフロー 過去案件削除リスナークラス。<br>
 * 過去案件が削除される際に実行されます。<br>
 * このクラスの処理中では DB トランザクションを張らないでください。
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}ArchivedMatterDeleteListener implements IWorkflowArcMatterDeleteListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}ArchivedMatterDeleteListener.class);

    /**
     * 過去案件削除処理を実行します。
     *
     * <p>他の案件削除リスナー（未完了案件・完了案件）と異なり、過去案件は年月単位で
     * アーカイブテーブルが分かれているため、{@code archiveMonth}（アーカイブ年月）が
     * 追加の引数として渡される。</p>
     *
     * @param loginGroupId ログイングループID
     * @param localeId ロケールID
     * @param systemMatterId システム案件ID
     * @param userDataId ユーザデータID
     * @param archiveMonth アーカイブ年月（yyyyMM形式）
     * @throws WorkflowException ワークフロー例外
     */
    @Override
    public void execute(final String loginGroupId, final String localeId, final String systemMatterId,
            final String userDataId, final String archiveMonth) throws WorkflowException {
        LOGGER.info("Started archived matter delete process. systemMatterId=" + systemMatterId
            + ", archiveMonth=" + archiveMonth);

        // TODO: ここで過去案件削除時のビジネスロジックを実装してください
        //
        // 主な用途:
        //   - 独自テーブルに保持している申請データの削除（archiveMonth 単位のテーブルを使っている場合は特に必須）
        //   - 添付ファイル等の関連リソースの削除
    }
}
```

## 生成時の注意事項

- 3種類とも「削除される案件のデータをどう後始末するか」という同じ性質の処理。案件プロパティ以外に独自テーブルへ保存したデータがある場合、削除リスナー側でも合わせて削除しないとデータが残り続ける
- **過去案件削除（`IWorkflowArcMatterDeleteListener`）だけ引数が5つ（`archiveMonth` 追加）。** 他の2種と同じ4引数のまま実装すると、`@Override` を付けていても抽象メソッド未実装のコンパイルエラーになる（オーバーロードとして扱われ、インタフェースの `execute` が実装されていない状態になるため）
- `throws WorkflowException` のみが宣言されている点に注意。`ActionProcessEventListener` 系（`throws Exception`）とは異なる
- このクラスの処理中では DB トランザクションを張らないこと
