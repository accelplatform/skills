# ワークフロー 案件開始処理テンプレート（Java / JavaEE 開発モデル）

## 概要

IM-Workflow の案件開始処理（案件開始拡張処理）を Java で実装するテンプレート。案件が新規に開始されたタイミングで実行される。

抽象クラス `jp.co.intra_mart.foundation.workflow.plugin.process.matter_start.MatterStartProcessEventListener` を継承し、`execute` メソッドをオーバーライドする。

## 継承元クラス

| 項目 | 値 |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.plugin.process.matter_start.MatterStartProcessEventListener` |
| 種別 | 抽象クラス |
| パラメータクラス | `jp.co.intra_mart.foundation.workflow.plugin.process.matter_start.MatterStartProcessParameter` |
| メソッド | `execute(MatterStartProcessParameter parameter)` |
| 戻り値 | `void` |

`MatterStartProcessParameter` のフィールド一覧は [reference/parameter-reference.md](../reference/parameter-reference.md) を参照。

## ファイル構成

```
src/main/java/{basePackageのパス}/{機能名}/workflow/
  └── {Feature}MatterStartProcess.java
```

---

## 案件開始処理クラス（{Feature}MatterStartProcess.java）

```java
package {basePackage}.{機能名}.workflow;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.plugin.process.matter_start.MatterStartProcessEventListener;
import jp.co.intra_mart.foundation.workflow.plugin.process.matter_start.MatterStartProcessParameter;

/**
 * {機能名} ワークフロー 案件開始処理クラス。<br>
 * 案件の新規開始時に実行されます。<br>
 * このクラスの処理中では DB トランザクションを張らないでください。
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}MatterStartProcess extends MatterStartProcessEventListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}MatterStartProcess.class);

    /**
     * 案件開始拡張処理として実行されます。
     *
     * @param parameter 案件開始処理パラメータ
     * @throws Exception 例外が発生
     */
    @Override
    public void execute(final MatterStartProcessParameter parameter) throws Exception {
        LOGGER.info("Started matter start process. flowId=" + parameter.getFlowId());

        // TODO: ここで案件開始時のビジネスロジックを実装してください
        //
        // 利用可能な主要パラメータ:
        //   parameter.getRouteId()  - ルートID
        //   parameter.getFlowId()   - フローID
        //   parameter.getUserDataId() - ユーザデータID
    }
}
```

## 生成時の注意事項

- このクラスの処理中では DB トランザクションを張らないこと
- 案件開始処理は「案件が開始された」ことをトリガに実行される。申請処理（`apply` アクション処理）とは別のタイミングであることに注意する
