# ワークフロー 分岐条件・結合条件テンプレート（Java / JavaEE 開発モデル）

## 概要

IM-Workflow のユーザプログラム方式の分岐条件・結合条件判定を Java で実装するテンプレート。分岐ノードでのルート選択、または結合ノードでの同期待ち解除を判定する。

抽象クラス `jp.co.intra_mart.foundation.workflow.plugin.rule.condition.RuleConditionEventListener` を継承し、`execute` メソッドをオーバーライドする。

**分岐条件・結合条件のどちらも実装するクラスは同一**（`RuleConditionEventListener` 継承）。どちらの拡張ポイントに登録するかは、インポート用 XML 側（`base-im-workflow-generator`）で切り替える。

## 継承元クラス

| 項目 | 値 |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.plugin.rule.condition.RuleConditionEventListener` |
| 種別 | 抽象クラス |
| パラメータクラス | `jp.co.intra_mart.foundation.workflow.plugin.rule.condition.RuleConditionParameter` |
| メソッド | `execute(RuleConditionParameter parameter)` |
| 戻り値 | `boolean`（分岐条件: `true`=当該ルートへ遷移 / `false`=遷移しない。結合条件: `true`=同期完了として次へ進む / `false`=待機継続。既定実装は `true`） |

`RuleConditionParameter` のフィールド一覧は [reference/parameter-reference.md](../reference/parameter-reference.md) を参照。案件プロパティを条件判定に使う場合は、案件プロパティ取得 API の存在を dev-knowledge で確認してから実装すること（記憶で書かない）。

## ファイル構成

```
src/main/java/{basePackageのパス}/{機能名}/workflow/rule/
  └── {Feature}BranchRule.java      # 分岐条件の場合
  └── {Feature}UnionRule.java       # 結合条件の場合
```

---

## 分岐条件クラス（{Feature}BranchRule.java）

```java
package {basePackage}.{機能名}.workflow.rule;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.plugin.rule.condition.RuleConditionEventListener;
import jp.co.intra_mart.foundation.workflow.plugin.rule.condition.RuleConditionParameter;

/**
 * {機能名} ワークフロー 分岐条件クラス。<br>
 * 分岐ノードでのルート選択可否を判定します。
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}BranchRule extends RuleConditionEventListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}BranchRule.class);

    /**
     * 分岐条件判定として実行されます。
     *
     * @param parameter ワークフローパラメータ
     * @return boolean ルート遷移可否（true: 遷移 / false: 停滞）
     * @throws Exception 例外が発生
     */
    @Override
    public boolean execute(final RuleConditionParameter parameter) throws Exception {
        // TODO: ここで分岐条件判定のビジネスロジックを実装してください
        //
        // 例: 合計金額が5万円を超える場合のみ true を返す等
        //   parameter.getSystemMatterId() - システム案件ID
        //   parameter.getNodeId()         - 分岐ノードID

        return true;
    }
}
```

## 生成時の注意事項

- 分岐条件・結合条件は判定ロジックが異なるだけでクラスの型は共通。用途に応じてクラス名（`BranchRule` / `UnionRule`）とファイル配置を使い分ける
- `execute` は複数の分岐先候補ノードそれぞれに対して個別に呼び出される（1回の呼び出しで1ルートの可否のみ判定する）ため、判定ロジックはステートレスに保つこと
