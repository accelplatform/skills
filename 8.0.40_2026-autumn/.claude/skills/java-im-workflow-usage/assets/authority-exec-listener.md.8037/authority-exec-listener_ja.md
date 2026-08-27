# ワークフロー 処理対象者プラグインテンプレート（Java / JavaEE 開発モデル）

## 概要

IM-Workflow の処理対象者プラグインを Java で実装するテンプレート。案件処理時にノードの処理対象者を動的に決定する。

インタフェース `jp.co.intra_mart.foundation.workflow.listener.IWorkflowAuthorityExecEventListener` を実装する。JSSP 版の `execute` / `getDisplayName` / `getTargetUserList` の3関数構成とは異なり、**Java 版インタフェースは処理対象者の取得（`execute` 相当）のみを定義する**。

## 実装インタフェース

| 項目 | 値 |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.listener.IWorkflowAuthorityExecEventListener` |
| 継承元 | `IWorkflowAuthorityEventListener`（マーカーインタフェース） |
| メソッド | `List<UserDataModel> execute(WorkflowAuthorityParameter workflowParam, WorkflowMatterParameter matterParam)` |
| 例外 | `throws WorkflowException` |

`WorkflowAuthorityParameter` / `WorkflowMatterParameter` / `UserDataModel` のフィールド一覧は [reference/parameter-reference.md](../reference/parameter-reference.md) を参照。

## ファイル構成

```
src/main/java/{basePackageのパス}/{機能名}/workflow/plugin/
  └── {Feature}AuthorityExecListener.java
```

---

## 処理対象者プラグインクラス（{Feature}AuthorityExecListener.java）

```java
package {basePackage}.{機能名}.workflow.plugin;

import java.util.ArrayList;
import java.util.List;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.exception.WorkflowException;
import jp.co.intra_mart.foundation.workflow.listener.IWorkflowAuthorityExecEventListener;
import jp.co.intra_mart.foundation.workflow.listener.param.WorkflowAuthorityParameter;
import jp.co.intra_mart.foundation.workflow.listener.param.WorkflowMatterParameter;
import jp.co.intra_mart.foundation.workflow.plugin.authority.im_master.model.UserDataModel;

/**
 * {機能名} ワークフロー 処理対象者プラグインクラス。<br>
 * 案件処理時にノードの処理対象者を動的に決定します。
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}AuthorityExecListener implements IWorkflowAuthorityExecEventListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}AuthorityExecListener.class);

    /**
     * 処理対象者を展開します。
     *
     * @param workflowParam ワークフローパラメータ
     * @param matterParam 案件情報パラメータ
     * @return List 処理対象者のユーザ展開情報
     * @throws WorkflowException ワークフロー例外
     */
    @Override
    public List<UserDataModel> execute(final WorkflowAuthorityParameter workflowParam,
            final WorkflowMatterParameter matterParam) throws WorkflowException {
        LOGGER.info("Resolving authority target users. nodeId=" + matterParam.getNodeId());

        final List<UserDataModel> targetUsers = new ArrayList<>();

        // TODO: ここで処理対象者を決定するビジネスロジックを実装してください
        //
        // workflowParam.getTargetCodes() が null でない場合:
        //   引戻し・差戻し・案件操作によるノード移動で到達している。
        //   前回の処理者コードが渡されるため、これを処理対象者に採用することで
        //   再処理待ち状態を実現できる。
        //
        // final UserDataModel user = new UserDataModel();
        // user.setUserCode("aoyagi");
        // user.setUserName("青柳 辰巳");
        // user.setLocaleId("ja");
        // targetUsers.add(user);

        return targetUsers;
    }
}
```

## 生成時の注意事項

- `workflowParam.getTargetCodes()` は引戻し・差戻し・案件操作によるノード移動で到達した場合に、当該ノードへ最後に処理したユーザコードの配列が渡される。前回処理者による再処理待ち状態を実現する場合はこれを処理対象者に採用する（JSSP 版と同じ考え方）
- `UserDataModel` の所属組織情報（`OrgzDataModel[]`）は担当組織の選択肢になる。組織を意識させない業務であれば省略可
- プラグインの表示名（JSSP 版の `getDisplayName` 相当）・対象者状況確認一覧（JSSP 版の `getTargetUserList` 相当）が Java 版インタフェースにも存在するかは、プラットフォームのバージョンにより異なる可能性がある。**実装前に dev-knowledge で `IWorkflowAuthorityEventListener` の継承関係を確認すること**（記憶で「メソッドが無い」と断定しない）
