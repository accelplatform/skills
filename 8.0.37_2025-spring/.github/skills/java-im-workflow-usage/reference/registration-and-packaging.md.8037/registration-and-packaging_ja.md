# 登録方法・パッケージ配置に関する注意

## ワークフロー定義への登録

生成した Java クラスは、それ単体では実行されない。IM-Workflow のルート/フロー定義（ノードのプラグイン設定）に、実装クラスの **完全修飾名（FQCN）** を登録することで初めて呼び出される。

登録先は JSSP 版で `scriptPath`（拡張子なしのファイルパス）を設定していたのと同じ `plugins[].parameter` 項目であり、そこに **FQCN の文字列** を設定する点のみが異なる。

```xml
<!-- JSSP 版（scriptPath） -->
<parameter type="string">sample/leave/workflow/action/action_process</parameter>

<!-- Java 版（FQCN） -->
<parameter type="string">jp.co.intra_mart.sample.leave.workflow.action.LeaveActionProcess</parameter>
```

XML 生成自体は `base-im-workflow-generator` の担当。本スキルは Java ソースの実体のみを生成する。JSSP 版の `pluginId`（`{exPointId}.pluginScriptExecutor`）に対応する Java 側の `pluginId` は **`{exPointId}.pluginJavaExecutor`**（実機でJavaクラス実行として登録・エクスポートしたXMLで確認済み。アクション処理・案件開始/終了処理・分岐条件・案件削除（未完了/完了/過去）・案件退避処理の8種で確認済み）。詳細・未確認の拡張ポイント一覧は `.github/skills/base-im-workflow-generator/reference/java-class-registration.md` を参照。到達処理・結合条件・処理対象者プラグインは同じ命名規則が推定されるが未確認のため、使用前に実機で1度確認すること。

## 実行時クラスパスへの配置

Java クラスは IM-Workflow エンジンの実行時クラスローダー（`Thread.currentThread().getContextClassLoader()`）経由でロードされる。そのため、コンパイル済みの `.class`（または JAR）が **アプリケーションサーバの実行時クラスパス上に存在する必要がある**。JSSP のようにソースファイルを配置するだけでは動作しない。

具体的な配置方法（WEB-INF/lib への JAR 配置、または OSGi バンドルモジュールとしての配置等）はプロジェクトのビルド構成に依存するため、本スキルの対象外。プロジェクトの既存 Java モジュールのビルド・デプロイ手順に従うこと。既存の Java モジュールが存在しない場合は、ユーザーに以下を確認する:

1. Java ソースをどの Maven モジュール（または新規モジュール）に追加するか
2. ビルド成果物（JAR）をどうデプロイ環境へ反映するか

## クラスのインスタンス化条件

登録された FQCN は `Class.newInstance()` 相当（リフレクション）でインスタンス化される。そのため:

- **引数なしコンストラクタが必須**（コンストラクタを明示的に書かない場合は暗黙のデフォルトコンストラクタで満たされる。`private` コンストラクタや、引数ありコンストラクタしか持たないクラスにしないこと）
- クラスは `public` でなければならない
- インスタンス生成のたびに状態がクリアされる前提で実装する（フィールドに前回呼び出し時の状態を持ち越さない。ステートレスに書く）

## パッケージ構成の考え方

`.github/instructions/java-naming.instructions.md` の「パッケージ構成」節はレイヤ単位（`entity` / `service` / `repository` 等）の分割を示しているが、ワークフロー連携プログラムは JSSP 版が機能単位（`{機能名}/workflow/...`）でディレクトリを分けている慣例に合わせ、**機能単位のサブパッケージ配下に処理種別ディレクトリを設ける**構成を採用する（`SKILL.md` の「配置規約」参照）。プロジェクトに既存のパッケージ構成規約がある場合はそれを優先する。
