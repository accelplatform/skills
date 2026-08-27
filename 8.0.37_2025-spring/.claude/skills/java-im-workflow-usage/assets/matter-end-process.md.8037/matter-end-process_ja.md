# ワークフロー 案件終了処理テンプレート（Java / JavaEE 開発モデル）

## 概要

IM-Workflow の案件終了処理（案件終了拡張処理）を Java で実装するテンプレート。案件が完了したタイミングで実行され、主にメール通知の送信可否を制御する。

抽象クラス `jp.co.intra_mart.foundation.workflow.plugin.process.matter_end.MatterEndProcessEventListener` を継承し、`execute` メソッドをオーバーライドする。

**トランザクションあり/なしの2つの拡張ポイントが存在するが、実装するクラスは同一**（`MatterEndProcessEventListener` 継承）。どちらの拡張ポイントに登録するかは、インポート用 XML 側（`base-im-workflow-generator`）で切り替える。

## 継承元クラス

| 項目 | 値 |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.plugin.process.matter_end.MatterEndProcessEventListener` |
| 種別 | 抽象クラス |
| パラメータクラス | `jp.co.intra_mart.foundation.workflow.plugin.process.matter_end.MatterEndProcessParameter` |
| メソッド | `execute(MatterEndProcessParameter parameter)` |
| 戻り値 | `boolean`（`true`: 標準のメール送信可 / `false`: メール送信不可。既定実装は `true`） |

`MatterEndProcessParameter` のフィールド一覧（最終処理者情報・メール/IMBox 置換情報を含む）は [reference/parameter-reference.md](../reference/parameter-reference.md) を参照。

## ファイル構成

```
src/main/java/{basePackageのパス}/{機能名}/workflow/
  └── {Feature}MatterEndProcess.java
```

---

## 案件終了処理クラス（{Feature}MatterEndProcess.java）

```java
package {basePackage}.{機能名}.workflow;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.plugin.process.matter_end.MatterEndProcessEventListener;
import jp.co.intra_mart.foundation.workflow.plugin.process.matter_end.MatterEndProcessParameter;

/**
 * {機能名} ワークフロー 案件終了処理クラス。<br>
 * 案件の完了時に実行されます。標準のメール送信可否を制御します。<br>
 * このクラスの処理中では DB トランザクションを張らないでください。
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}MatterEndProcess extends MatterEndProcessEventListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}MatterEndProcess.class);

    /**
     * 案件終了処理として実行されます。
     *
     * @param parameter ワークフローパラメータ
     * @return boolean 標準のメール送信可否（true: 送信可能 / false: 送信不可）
     * @throws Exception 例外が発生
     */
    @Override
    public boolean execute(final MatterEndProcessParameter parameter) throws Exception {
        LOGGER.info("Started matter end process. lastProcessNodeId=" + parameter.getLastProcessNodeId());

        // TODO: ここで案件終了時のビジネスロジックを実装してください
        //
        // 利用可能な主要パラメータ:
        //   parameter.getLastAuthUserCd()  - 最終処理権限者コード
        //   parameter.getLastExecUserCd()  - 最終処理実行者コード
        //   parameter.getLastResultStatus() - 最終処理結果ステータス

        return true;
    }
}
```

## 生成時の注意事項

- トランザクションあり/なしのどちらの拡張ポイントに登録するかは実装クラス側では区別しない。登録先の選択はインポート用 XML 側の責務
- このクラスの処理中では DB トランザクションを張らないこと（トランザクションありの拡張ポイントでも、エンジン側が制御するため自前で `begin/commit` しない）
