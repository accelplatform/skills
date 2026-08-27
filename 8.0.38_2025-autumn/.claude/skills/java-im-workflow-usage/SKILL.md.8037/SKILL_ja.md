---
name: java-im-workflow-usage
description: intra-mart IM-Workflow 連携プログラムを Java（JavaEE 開発モデル）で新規生成する。アクション処理（申請・承認・否認・差戻し等）、到達処理、案件開始/終了処理、分岐・結合条件処理、処理対象者プラグイン、案件削除/退避リスナーの実装パターンを提供する。Java でワークフロー処理を作りたい、Java でアクション処理を実装したい、JavaEE開発モデルでワークフロー連携、と言及されたときに使用。JSSP（スクリプト開発モデル）で同等の処理を作る場合は jssp-im-workflow-usage を使うこと。画面（申請/承認/確認画面）は本スキルの対象外で、現状は jssp-im-workflow-usage が生成する JSSP 画面のまま据え置く。
allowed-tools: Bash, Read, Write, Glob
---

# IM-Workflow Java 連携プログラム生成支援スキル

## 目的

intra-mart Accel Platform の IM-Workflow が提供する **JavaEE 開発モデル**（`jp.co.intra_mart.foundation.workflow.plugin.process.*` 配下の抽象クラス、および `jp.co.intra_mart.foundation.workflow.listener.*` 配下のリスナーインタフェース）を使い、ワークフローのバッチ的処理（アクション処理・到達処理・案件開始/終了処理・分岐条件処理・処理対象者プラグイン・各種リスナー）を Java で新規生成するためのスキルセット。

**画面（申請/承認/確認画面）は対象外。** IM-Workflow の画面は現状 JSSP（`jssp-im-workflow-usage`）のまま据え置く前提。本スキルは画面を持たない「処理プログラム」のみを扱う。

## JSSP 版との違い（重要）

JSSP 版（`jssp-im-workflow-usage`）と Java 版は、同じ拡張ポイントに対する **2つの独立した実行系統**（スクリプト実行 / Java クラス実行）であり、実装モデルが根本的に異なる。表面的に似せて生成すると実機で動かないため、必ず本ドキュメントの型・シグネチャに従うこと。

| 観点 | JSSP 版 | Java 版 |
|------|---------|---------|
| 実装単位 | 1 ファイルに 17 関数（`apply`, `approve`, ... ）を定義 | 1 クラスが抽象クラスを継承し、必要な処理タイミングのメソッドを **オーバーライド**（未使用分は継承元の空実装のまま） |
| 戻り値 | `{resultFlag, message, data}` の Object を自前で組み立てて返却 | メソッドの戻り値そのもの（`String` / `boolean` / `void`）。**失敗は例外 (`throw new Exception(...)`) で表現する**。`resultFlag`/`message` に相当する構造体は存在しない |
| エラー通知 | `result.resultFlag = false; result.message = e.message;` | メソッドの `throws Exception` をそのまま伝播させる（ワークフローエンジン側で捕捉しエラー扱いになる） |
| 登録方法 | インポート用 XML の `plugins[].parameter` に **JSSP ファイルパス**（拡張子なし） | インポート用 XML の `plugins[].parameter` に **実装クラスの完全修飾名（FQCN）** |
| 配置 | `src/main/jssp/src/{機能名}/workflow/...` | `src/main/java/{basePackage}/{機能名}/workflow/...`（コンパイルされ Java 実行環境のクラスパス上に配置される必要がある） |
| コーディング規約 | `.claude/rules/` 配下の jssp 系規約一式 | `.claude/rules/` 配下の java 系規約一式（`java-naming.md` / `java-code-style.md` / `java-javadoc.md` / `java-logging.md`） |

**このスキルが生成するのはあくまで Java ソースファイル（`.java`）である。** ワークフロー定義側のインポート用 XML（`plugins[].parameter` に FQCN を設定する部分）は `base-im-workflow-generator` の Java 対応セクション（「Java クラス実行（JavaEE 開発モデル）を登録する場合」）を参照して生成すること。

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `.claude/rules/java-naming.md` | 🟢 **必読** — パッケージ・クラス・メソッド命名 |
| `.claude/rules/java-code-style.md` | 🟢 **必読** — `final` ローカル変数、文字列リテラル等 |
| `.claude/rules/java-javadoc.md` | 🟢 **必読** — クラス/メソッド JavaDoc |
| `.claude/rules/java-logging.md` | 🟡 ログ実装時（`Logger.getLogger(XxxClass.class)`） |
| `.claude/rules/jssp-error-handling.md` | 🟡 **考え方のみ参考にする**（エラーコード体系の思想。実装は Java の例外機構に読み替える） |

`jssp-*` の規約（`jssp-code-style.md` 等）はこのスキルの対象外（Java ファイルには適用しない）。

## 生成対象とテンプレート

### アクション処理・到達処理・案件処理

| 生成対象 | 継承/実装元 | テンプレート | 配置先目安 |
|---------|------------|------------|-----------|
| アクション処理（申請・承認・否認・差戻し等 全17メソッド） | `ActionProcessEventListener`（抽象クラス継承） | `assets/action-process.md` | `{機能名}/workflow/action/` |
| 到達処理 | `ArriveProcessEventListener`（抽象クラス継承） | `assets/arrive-process.md` | `{機能名}/workflow/arrive/` |
| 案件開始処理 | `MatterStartProcessEventListener`（抽象クラス継承） | `assets/matter-start-process.md` | `{機能名}/workflow/` |
| 案件終了処理（トランザクションあり/なし） | `MatterEndProcessEventListener`（抽象クラス継承） | `assets/matter-end-process.md` | `{機能名}/workflow/` |
| 分岐条件・結合条件 | `RuleConditionEventListener`（抽象クラス継承） | `assets/rule-condition.md` | `{機能名}/workflow/rule/` |

### プラグイン・リスナー

| 生成対象 | 継承/実装元 | テンプレート | 配置先目安 |
|---------|------------|------------|-----------|
| 処理対象者プラグイン | `IWorkflowAuthorityExecEventListener`（インタフェース実装） | `assets/authority-exec-listener.md` | `{機能名}/workflow/plugin/` |
| 未完了/完了/過去案件削除リスナー | `IWorkflowActvMatterDeleteListener` 等（インタフェース実装） | `assets/matter-delete-listener.md` | `{機能名}/workflow/` |
| 案件退避処理リスナー | `IWorkflowMatterArchiveListener`（インタフェース実装） | `assets/matter-archive-listener.md` | `{機能名}/workflow/` |

### リファレンス

- `reference/parameter-reference.md` — 各処理で受け取るパラメータクラスのフィールド一覧（プラットフォーム API の実クラス定義に基づく。記憶で書かない）
- `reference/registration-and-packaging.md` — パッケージ構成・配置規約・インポート用 XML への登録方法・実行時クラスパスへの配置に関する注意

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「ワークフローのアクション処理を Java で作成して」
- 「JavaEE 開発モデルで到達処理を実装して」
- 「案件開始処理を Java クラスで追加して」
- 「分岐条件を Java で実装して」
- 「処理対象者プラグインを Java クラスで実装して」
- 「案件削除リスナーを Java で追加して」

「Java で」「JavaEE 開発モデルで」等の明示がなく、単に「ワークフローのアクション処理を作って」とだけ依頼された場合は **JSSP 版（`jssp-im-workflow-usage`）をデフォルトとする**。プロジェクトの既存実装が Java 中心（`src/main/java` 配下に業務ロジックが多数存在する等）である場合のみ、Java 版が適切かユーザに確認する。

## 実装手順

1. ユーザの要件をヒアリング（処理種別・機能名・ビジネスロジック内容・配置先パッケージ）
2. 該当する `assets/` テンプレートを参照してクラスを生成
   - **未使用のメソッドは継承元のデフォルト実装のまま残す**（空の `return null;` / `return true;` / 何もしない）。アクション処理で実装しないメソッド（例: `reserve` を使わない）まで無理に埋めない
   - パラメータクラスのフィールドは `reference/parameter-reference.md` を必ず参照する（記憶や推測で `getXxx()` を書かない）
3. パッケージ・配置先パスを決定（下記「配置規約」参照）
4. `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか確認
5. インポート用 XML 側の `plugins[].parameter` に生成したクラスの FQCN を設定する必要がある旨をユーザに案内する（`base-im-workflow-generator` の Java 対応セクション参照。本スキルは XML 自体は生成しない）

## 配置規約

### ベースパッケージ

プロジェクトに既存の Java パッケージ規約があればそれに従う。無い場合、`.claude/rules/java-naming.md` の例（`jp.co.intra_mart.sample.service` 等）に倣い、以下を既定とする。**既定はあくまでデフォルトであり、ユーザの明示指定があればそちらを優先する。**

```
{basePackage}.{機能名}.workflow.{種別}
```

例: 機能名 `leave`（休暇申請）、ベースパッケージ `jp.co.intra_mart.sample` の場合

```
jp.co.intra_mart.sample.leave.workflow.action    -> LeaveActionProcess.java
jp.co.intra_mart.sample.leave.workflow.arrive    -> LeaveArriveProcess.java
jp.co.intra_mart.sample.leave.workflow.rule      -> LeaveBranchRule.java
jp.co.intra_mart.sample.leave.workflow.plugin    -> LeaveAuthorityExecListener.java
jp.co.intra_mart.sample.leave.workflow           -> LeaveMatterStartProcess.java
                                                     LeaveMatterEndProcess.java
                                                     LeaveMatterArchiveListener.java
                                                     LeaveActiveMatterDeleteListener.java
```

### ファイル配置先

```
src/main/java/{basePackageのパス区切り}/{機能名}/workflow/{種別}/{ClassName}.java
```

`{種別}` ディレクトリの対応（JSSP 版の `.claude/rules/jssp-file-structure.md` の `workflow/` 配下慣例に合わせている）:

| 処理 | サブディレクトリ |
|------|----------------|
| アクション処理 | `action/` |
| 到達処理 | `arrive/` |
| 分岐条件・結合条件 | `rule/` |
| 処理対象者プラグイン | `plugin/` |
| 案件開始/終了処理、各種削除/退避リスナー | 直下（サブディレクトリなし） |

### クラス命名

`.claude/rules/java-naming.md` のパスカルケース規則に従う。サフィックスは処理種別に対応させる:

| 処理 | サフィックス | 例 |
|------|------------|-----|
| アクション処理 | `ActionProcess` | `LeaveActionProcess` |
| 到達処理 | `ArriveProcess` | `LeaveArriveProcess` |
| 案件開始処理 | `MatterStartProcess` | `LeaveMatterStartProcess` |
| 案件終了処理 | `MatterEndProcess` | `LeaveMatterEndProcess` |
| 分岐条件 | `BranchRule` | `LeaveBranchRule` |
| 結合条件 | `UnionRule` | `LeaveUnionRule` |
| 処理対象者プラグイン | `AuthorityExecListener` | `LeaveAuthorityExecListener` |
| 未完了案件削除リスナー | `ActiveMatterDeleteListener` | `LeaveActiveMatterDeleteListener` |
| 完了案件削除リスナー | `CompletedMatterDeleteListener` | `LeaveCompletedMatterDeleteListener` |
| 過去案件削除リスナー | `ArchivedMatterDeleteListener` | `LeaveArchivedMatterDeleteListener` |
| 案件退避処理リスナー | `MatterArchiveListener` | `LeaveMatterArchiveListener` |

**配置先パスの優先順位:** ユーザーがプロンプトで配置先パッケージ・パスを明示的に指定した場合は、その指示を最優先する。本スキルの既定はあくまでデフォルトである。

## 注意事項

- アクション処理・案件開始/終了処理・分岐条件処理のプログラム中では **DB トランザクションを張らないこと**（JSSP 版と同じ制約。エンジン側でトランザクション制御されている）
- **未実装のオーバーライドメソッドは書かない。** 継承元の抽象クラスが空実装（`return null;` 等）を提供しているため、使わない処理タイミングのメソッドをオーバーライドで埋める必要はない。オーバーライドするのは実際にビジネスロジックを実装するメソッドのみ
- 失敗時は `throw new Exception("メッセージ")` あるいはより具体的な例外クラスを投げる。JSSP 版のような `result.resultFlag = false` 相当の構造体は存在しない
- 例外メッセージは `.claude/rules/java-javadoc.md` の規約に従い日本語で説明的に記述する
- 案件終了処理はトランザクションあり/なしで **同じクラス**（`MatterEndProcessEventListener` 継承）を使う。どちらの拡張ポイントに登録するかは登録側（インポート用 XML）で切り替える
- 分岐条件・結合条件も **同じクラス**（`RuleConditionEventListener` 継承）を使う。どちらの拡張ポイントに登録するかは登録側で切り替える
- 案件削除リスナー（未完了/完了/過去）は実装するインタフェースが異なる（`IWorkflowActvMatterDeleteListener` / `IWorkflowCplMatterDeleteListener` / `IWorkflowArcMatterDeleteListener`）。**過去案件削除（`IWorkflowArcMatterDeleteListener`）だけ `execute` の引数が5つ**（`archiveMonth` が末尾に追加される）で、他の2種（4引数）とはシグネチャが異なる。4引数のまま実装すると `@Override` を付けていても抽象メソッド未実装のコンパイルエラーになる。詳細は `assets/matter-delete-listener.md` を参照
- クラスは実行時にクラスローダー経由でインスタンス化される（`Class.newInstance()` 相当）。**引数なしコンストラクタが必要**（明示的に書かなくても暗黙のデフォルトコンストラクタで満たされるが、`private` コンストラクタにしないこと）

## 生成後の確認

JSSP 版のような専用検証スクリプト（`validate-workflow-code.js` 相当）は現時点で未整備。以下を手動で確認する。

1. 継承元クラス・実装インタフェースの FQCN が `reference/parameter-reference.md` の記載と一致しているか
2. オーバーライドしたメソッドのシグネチャ（引数型・戻り値型・`throws`）が抽象クラス/インタフェースの定義と完全一致しているか（`@Override` を付けてコンパイラに検証させること）
3. `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか
4. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない。プロジェクトに Java 向けのコードレビュー・セキュリティチェックスキルが別途存在する場合はそちらを利用する

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| ワークフロー定義（contents/route/flow）のインポート用 XML 生成 | `base-im-workflow-generator` |
| XML の `plugins[].parameter` に JSSP スクリプトパスを設定 | `base-im-workflow-generator`（既定） |
| XML の `plugins[].parameter` に Java クラス FQCN を設定 | `base-im-workflow-generator`（Java 対応セクション） |
| JSSP 実装（`.js`）の実体を配置 | `jssp-im-workflow-usage` |
| **Java 実装（`.java`）の実体を配置** | **本スキル** |
| 申請/承認/確認画面（`.html` + `.js`） | `jssp-im-workflow-usage`（本スキルの対象外） |
