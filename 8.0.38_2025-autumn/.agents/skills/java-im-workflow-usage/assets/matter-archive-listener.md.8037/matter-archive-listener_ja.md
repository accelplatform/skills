# ワークフロー 案件退避処理リスナーテンプレート（Java / JavaEE 開発モデル）

## 概要

完了案件を過去案件テーブルへ退避（アーカイブ）する際に実行されるリスナーを Java で実装するテンプレート。案件削除リスナーと同様、引数は `Parameter` オブジェクトではなく個別の文字列値として渡される。

**注意**: このクラスの処理中では DB トランザクションを張らないこと。

## 実装インタフェース

| 項目 | 値 |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.listener.IWorkflowMatterArchiveListener` |
| メソッド | `void execute(String loginGroupId, String localeId, String systemMatterId, String userDataId)` |
| 例外 | `throws WorkflowException` |

## ファイル構成

```
src/main/java/{basePackageのパス}/{機能名}/workflow/
  └── {Feature}MatterArchiveListener.java
```

---

## 案件退避処理リスナー（{Feature}MatterArchiveListener.java）

```java
package {basePackage}.{機能名}.workflow;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.exception.WorkflowException;
import jp.co.intra_mart.foundation.workflow.listener.IWorkflowMatterArchiveListener;

/**
 * {機能名} ワークフロー 案件退避処理リスナークラス。<br>
 * 完了案件を過去案件テーブルへ退避（アーカイブ）する際に実行されます。<br>
 * このクラスの処理中では DB トランザクションを張らないでください。
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}MatterArchiveListener implements IWorkflowMatterArchiveListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}MatterArchiveListener.class);

    /**
     * 案件退避処理を実行します。
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
        LOGGER.info("Started matter archive process. systemMatterId=" + systemMatterId);

        // TODO: ここで案件退避時のビジネスロジックを実装してください
        //
        // 主な用途:
        //   - 独自テーブルのデータを過去案件用テーブルへ移行
        //   - 外部システムへのアーカイブ通知
        //   - 添付ファイル等の関連リソースの退避
    }
}
```

## 生成時の注意事項

- このクラスの処理中では DB トランザクションを張らないこと
- 案件削除リスナー（`matter-delete-listener.md`）とは目的が異なる。削除リスナーは「データを消す」処理、退避リスナーは「データを移す」処理
