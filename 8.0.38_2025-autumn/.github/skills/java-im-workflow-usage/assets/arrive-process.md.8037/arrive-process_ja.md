# ワークフロー 到達処理テンプレート（Java / JavaEE 開発モデル）

## 概要

IM-Workflow の到達処理を Java で実装するテンプレート。ノードへの到達時（次の処理者への引き継ぎ時）に実行され、主にメール通知の送信可否を制御する。

抽象クラス `jp.co.intra_mart.foundation.workflow.plugin.process.arrive.ArriveProcessEventListener` を継承し、`execute` メソッドをオーバーライドする。

## 継承元クラス

| 項目 | 値 |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.plugin.process.arrive.ArriveProcessEventListener` |
| 種別 | 抽象クラス |
| パラメータクラス | `jp.co.intra_mart.foundation.workflow.plugin.process.arrive.ArriveProcessParameter` |
| メソッド | `execute(ArriveProcessParameter parameter)` |
| 戻り値 | `boolean`（`true`: 標準のメール送信可 / `false`: メール送信不可。既定実装は `true`） |

`ArriveProcessParameter` のフィールド一覧（前ノードの処理者情報等を含む）は [reference/parameter-reference.md](../reference/parameter-reference.md) を参照。

## ファイル構成

```
src/main/java/{basePackageのパス}/{機能名}/workflow/arrive/
  └── {Feature}ArriveProcess.java
```

---

## 到達処理クラス（{Feature}ArriveProcess.java）

```java
package {basePackage}.{機能名}.workflow.arrive;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.plugin.process.arrive.ArriveProcessEventListener;
import jp.co.intra_mart.foundation.workflow.plugin.process.arrive.ArriveProcessParameter;

/**
 * {機能名} ワークフロー 到達処理クラス。<br>
 * ノードへの到達時に実行されます。標準のメール送信可否を制御します。<br>
 * このクラスの処理中では DB トランザクションを張らないでください。
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}ArriveProcess extends ArriveProcessEventListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}ArriveProcess.class);

    /**
     * ノードへの到達時に実行されます。
     *
     * @param parameter ワークフローパラメータ
     * @return boolean 標準のメール送信可否（true: 送信可能 / false: 送信不可）
     * @throws Exception 例外が発生
     */
    @Override
    public boolean execute(final ArriveProcessParameter parameter) throws Exception {
        LOGGER.info("Started arrive process. matterNumber=" + parameter.getMatterNumber()
            + ", nodeId=" + parameter.getNodeId());

        // TODO: ここで到達時のビジネスロジックを実装してください
        //
        // 利用可能な主要パラメータ:
        //   parameter.getNodeId()             - 到達先ノードID
        //   parameter.getPreNodeId()          - 前ノードID
        //   parameter.getPreNodeExecUserCd()  - 前ノード処理実行者コード
        //   parameter.getPreNodeProcessComment() - 前ノード処理コメント

        // 標準のメール送信を行う場合は true、独自通知に置き換える等で抑止する場合は false を返す
        return true;
    }
}
```

## 生成時の注意事項

- 戻り値 `false` は標準のメール通知を抑止する。独自の通知処理（メール以外の通知など）を実装した上で `false` を返すユースケースが典型
- `execute` 内で例外が送出されると到達処理自体が失敗扱いになる。通知の付随処理で例外が起きても案件処理を止めたくない場合は、内部で `try-catch` して握りつぶし、ログ出力に留めるかを設計判断すること（無条件の握りつぶしは推奨しない。ログには必ず記録する）
- このクラスの処理中では DB トランザクションを張らないこと
