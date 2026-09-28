# ワークフロー 処理対象者プラグインテンプレート（Java / JavaEE 開発モデル）

## 概要

IM-Workflow の処理対象者プラグインを Java で実装するテンプレート。案件処理時にノードの処理対象者を動的に決定する。

インタフェース `jp.co.intra_mart.foundation.workflow.listener.IWorkflowAuthorityExecEventListener` を実装する。このインタフェースは `IWorkflowAuthorityEventListener`（`getTargetUserList` を定義）→ `IWorkflowEventListener`（`getDisplayName` を定義）という継承階層を持ち、**実装すべきメソッドは合計3つ**（`execute` / `getTargetUserList` / `getDisplayName`）。JSSP 版の3関数構成（`execute` / `getDisplayName` / `getTargetUserList`）と実質的に対応する。

## 実装インタフェース

| 項目 | 値 |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.listener.IWorkflowAuthorityExecEventListener` |
| 継承元 | `IWorkflowAuthorityEventListener` → `IWorkflowEventListener` |

| メソッド（定義元） | シグネチャ | 用途 |
|---|---|---|
| `execute`（`IWorkflowAuthorityExecEventListener`） | `List<UserDataModel> execute(WorkflowAuthorityParameter workflowParam, WorkflowMatterParameter matterParam) throws WorkflowException` | 案件処理時に処理対象者を展開する（JSSP 版の `execute` 相当） |
| `getTargetUserList`（`IWorkflowAuthorityEventListener`） | `Map<String, TargetUserModel[]> getTargetUserList(WorkflowAuthorityParameter workflowParam, WorkflowMatterParameter matterParam, WorkflowSortCondition[] sort) throws WorkflowException` | 対象者状況確認画面用に、ロケール別の処理対象ユーザ一覧を返す（JSSP 版の `getTargetUserList` 相当） |
| `getDisplayName`（`IWorkflowEventListener`） | `Map<String, String> getDisplayName(WorkflowParameter workflowParam) throws WorkflowException` | プラグインの表示名をロケール別に返す（JSSP 版の `getDisplayName` 相当） |

`WorkflowAuthorityParameter` / `WorkflowMatterParameter` / `UserDataModel` / `TargetUserModel` のフィールド一覧は [reference/parameter-reference.md](../reference/parameter-reference.md) を参照。

## 登録方法（重要）

処理対象者プラグインは、他のワークフロー連携プログラム（アクション処理・到達処理等）とは異なり、ワークフロー定義のインポート XML に FQCN を直接書く方式ではない。`plugin.xml`（`PluginManager` が管理するプラグイン登録ファイル）による登録が必要。配置場所・XML 構造・`configPage`（設定画面）の要否は `.claude/skills/base-im-workflow-generator/reference/java-class-registration.md` の「処理対象者プラグイン（カスタム実装）の登録」を参照すること。**このクラスを実装しただけでは動作しない。**

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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.exception.WorkflowException;
import jp.co.intra_mart.foundation.workflow.listener.IWorkflowAuthorityExecEventListener;
import jp.co.intra_mart.foundation.workflow.listener.model.TargetUserModel;
import jp.co.intra_mart.foundation.workflow.listener.model.WorkflowSortCondition;
import jp.co.intra_mart.foundation.workflow.listener.param.WorkflowAuthorityParameter;
import jp.co.intra_mart.foundation.workflow.listener.param.WorkflowMatterParameter;
import jp.co.intra_mart.foundation.workflow.listener.param.WorkflowParameter;
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

    /**
     * ロケール別に処理対象ユーザリストを取得します（対象者状況確認画面用）。
     *
     * @param workflowParam ワークフローパラメータ
     * @param matterParam 案件情報パラメータ
     * @param sort ソート情報モデル
     * @return Map ロケールIDをキーにした処理対象ユーザリスト
     * @throws WorkflowException ワークフロー例外
     */
    @Override
    public Map<String, TargetUserModel[]> getTargetUserList(final WorkflowAuthorityParameter workflowParam,
            final WorkflowMatterParameter matterParam, final WorkflowSortCondition[] sort) throws WorkflowException {
        // TODO: execute と同じ処理対象者決定ロジックを、TargetUserModel（ロケール別）で返却してください
        return new HashMap<>();
    }

    /**
     * プラグインの表示名をロケール別に取得します。
     *
     * @param workflowParam ワークフローパラメータ
     * @return Map ロケールIDをキーにした表示名
     * @throws WorkflowException ワークフロー例外
     */
    @Override
    public Map<String, String> getDisplayName(final WorkflowParameter workflowParam) throws WorkflowException {
        final Map<String, String> result = new HashMap<>();
        result.put("ja", "{機能名の表示名}");
        result.put("en", "{Feature Display Name}");
        result.put("zh_CN", "{机能名的显示名}");
        return result;
    }
}
```

## 生成時の注意事項

- `workflowParam.getTargetCodes()` は引戻し・差戻し・案件操作によるノード移動で到達した場合に、当該ノードへ最後に処理したユーザコードの配列が渡される。前回処理者による再処理待ち状態を実現する場合はこれを処理対象者に採用する（JSSP 版と同じ考え方）
- `UserDataModel` の所属組織情報（`OrgzDataModel[]`）は担当組織の選択肢になる。組織を意識させない業務であれば省略可
- `getTargetUserList` は `execute` と処理対象者の決定ロジックを揃えること（対象者状況確認画面に表示される一覧が実際の処理対象者と食い違わないようにするため）
- `getDisplayName` の戻り値は `plugin.xml` の `<authority name="...">` にリソースキーを指定した場合の多言語化メッセージプロパティとは別に、インタフェース経由でも表示名を返却できる。**両方を用意する必要はなく、`plugin.xml` の `name` 属性（`%` で始まるリソースキー）が一般的**。`getDisplayName` はプラットフォームが必要とする場面（対象者状況確認画面等）で呼び出される
