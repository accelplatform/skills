---
name: java-im-propagation-generator
description: intra-mart 固有のモジュール間データ連携 API（`jp.co.intra_mart.foundation.propagation.*`、`im_propagation` モジュール）を Java（JavaEE 開発モデル）で使用し、`PropagationManager` によるデータ送信、`Encoder`/`GenericModel`（送信側）、`Decoder`/`Procedure`（受信側）、送受信設定ファイル（`propagation-senders-config`/`propagation-receivers-config`/`propagation-config`）の一式を新規作成するためのスキルセット。intra-mart が標準で送信するデータ（テナント・アカウント・ロール・IM-Authz・メニュー・カレンダー・ジョブネット等の変更通知）を独自モジュールで受信するリスナー実装、および IM-Box（アプリ通知・ウォッチ）等intra-mart標準機能へのデータ送信の実装パターンも提供する。Java でモジュール間データ連携をしたい、`PropagationManager`/`Encoder`/`Decoder`/`Procedure` を使いたい、IM-Propagation でデータを送受信したい、intra-mart 標準の変更通知（テナント作成・ロール更新等）を受け取るリスナーを作りたい、と言及されたときに使用。JSSP（スクリプト開発モデル）向けの同等 API は提供されていない。
---

# IM-Propagation（モジュール間データ連携）実装支援スキル（Java 版）

## 目的

intra-mart Accel Platform が提供する **JavaEE 開発モデル**向けのモジュール間データ連携 API（IM-Propagation、`jp.co.intra_mart.foundation.propagation.*`）を使い、以下を新規実装するためのスキルセット。

1. 独自モジュールから他モジュール（または intra-mart 標準機能）へのデータ送信（送信側一式）
2. 他モジュール（または intra-mart 標準機能）から送信されたデータを独自モジュールで受信する処理（受信側一式）
3. 送受信の対応関係を定義する設定ファイル一式

IM-Propagation は「モジュール A が、モジュール B の実装（クラス）を知らなくても、データの変更・イベントを非同期的でなく同一トランザクション内で伝達できる」ための疎結合な連携基盤である。送信側は受信側の実装クラスを一切参照しない（設定ファイルの `source`（データモデルの完全修飾クラス名）と `operationType` の組み合わせのみで結びつく）。

## 基本概念（最重要）

IM-Propagation の登場人物は送信側3点・受信側3点、計6点のクラスと3種類の設定ファイルで構成される。

```
送信側                                                    受信側
──────                                                    ──────
① データモデル（POJO）                                    ④ データモデル（POJO、①と同一クラスである必要はない）
② GenericModel（AbstractGeneric 継承。送受信で共有する restorable な直列化データ）
③ Encoder（① → ②へ変換）                                  ⑤ Decoder（② → ④へ変換）
                                                           ⑥ Procedure（④を受け取り業務処理を実行）

PropagationManager#send(operationType, dataClass, data, resultClass)
  → propagation-senders-config.xml で source(①のFQCN)+operationType から Encoder を解決 → ② を生成
  → propagation-receivers-config.xml で source(①のFQCN)+operationType から Decoder/Procedure を解決
  → Decoder が ② → ④ に変換 → Procedure#onReceive(parameter, ④) が業務処理を実行
```

- **`GenericModel`（`AbstractGeneric` 継承）が送受信間で実際にやり取りされる唯一のデータ形式。** 送信側の元データ（①）・受信側の復元データ（④）はモジューク内部でのみ使われ、外部には一切公開されない
- **送信側は受信側の実装クラス（Decoder/Procedure）を一切知らない。** 結びつきは `propagation-senders-config.xml`/`propagation-receivers-config.xml` の `source`（データモデルの完全修飾クラス名）+`operationType` の組み合わせのみで行われ、Java コード上のリスナー登録は不要
- **`source` に指定するデータモデルの FQCN は、いわば「トピック名」に相当する識別子であり、事後の変更が困難。** モジュールID・機能名を含む安定した命名にすること（例: `jp.co.intra_mart.sample.leave.propagation.LeaveApprovedData`）
- `PropagationManager` はデータ送信のエントリポイントであり、`begin()`/`send()`/`decide()`/`abort()` によるセッション制御（多くの場合 DB トランザクションと連動）を提供する。詳細シグネチャは `reference/propagation-api-reference.md` を参照

**このスキルが扱うのは Java ソースファイル（`.java`）と設定ファイル（`WEB-INF/conf/propagation-*-config/*.xml`・`WEB-INF/conf/propagation-config.xml`）のみ。** JSSP（`.js`）向けの同等 SSJS API は提供されていない。

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **必読** — パッケージ・クラス・メソッド・変数命名 |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **必読** — `final` ローカル変数、文字列リテラル等 |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **必読** — クラス/メソッド JavaDoc |
| `.agents/requirements/java-logging/AGENTS.md` | 🟡 ログ実装時（`Procedure` 内でのエラーログ出力等） |

`.agents/requirements` 配下には IM-Propagation 専用の規約は存在しない。データモデル・`GenericModel`・`Encoder`/`Decoder`/`Procedure` の構造・命名は `assets/sender-usage.md`/`assets/receiver-usage.md` のパターンに従う。

`jssp-*` の規約はこのスキルの対象外（Java ファイルには適用しない）。

## API 概要

`PropagationManager`（`jp.co.intra_mart.foundation.propagation` パッケージ）は `PropagationManagerFactory.getInstance().getPropagationManager()` で取得する。送信側は `AbstractEncoder<D, G>`（`jp.co.intra_mart.foundation.propagation.sender` パッケージ）、受信側は `AbstractDecoder<G, D>` と `AbstractProcedure<D, R>`/`AbstractSessionableProcedure<D, R>`（いずれも `jp.co.intra_mart.foundation.propagation.receiver` パッケージ）を継承して実装する。共有データ型は `AbstractGeneric`（`jp.co.intra_mart.foundation.propagation.model.generic` パッケージ）を継承する。全クラスの詳細シグネチャ・例外階層は `reference/propagation-api-reference.md` を、設定ファイルの XML 要素・属性・XSD 名前空間は `reference/propagation-config-reference.md` を必ず参照すること（記憶や推測で書かない）。

## 生成対象とテンプレート

### 独自データを送信する（送信側）

| 生成対象 | 継承/実装元 | テンプレート | 配置先目安 |
|---------|------------|------------|-----------|
| データモデル（送信元 POJO） | なし（通常の POJO） | `assets/sender-usage.md` | `{機能名}/propagation/` |
| GenericModel | `AbstractGeneric`（抽象クラス継承） | `assets/sender-usage.md` | `{機能名}/propagation/` |
| Encoder | `AbstractEncoder<D, G>`（抽象クラス継承） | `assets/sender-usage.md` | `{機能名}/propagation/encoder/` |
| 送信処理（`PropagationManager` 呼び出し） | なし（呼び出しコード） | `assets/sender-usage.md` | サービスクラス等、業務処理を行うクラス内 |
| 送信設定ファイル | `propagation-senders-config` | `assets/sender-usage.md` | `WEB-INF/conf/propagation-senders-config/{任意名}.xml` |

### 他モジュール・intra-mart 標準機能からのデータを受信する（受信側）

| 生成対象 | 継承/実装元 | テンプレート | 配置先目安 |
|---------|------------|------------|-----------|
| データモデル（受信先 POJO） | なし（通常の POJO） | `assets/receiver-usage.md` | `{機能名}/propagation/` |
| Decoder | `AbstractDecoder<G, D>`（抽象クラス継承） | `assets/receiver-usage.md` | `{機能名}/propagation/decoder/` |
| Procedure（DB処理向け） | `AbstractProcedure<D, R>`（抽象クラス継承） | `assets/receiver-usage.md` | `{機能名}/propagation/procedure/` |
| Procedure（DB以外のリソース・独自トランザクション制御が必要な場合） | `AbstractSessionableProcedure<D, R>`（抽象クラス継承） | `assets/receiver-usage.md` | `{機能名}/propagation/procedure/` |
| 受信設定ファイル | `propagation-receivers-config` | `assets/receiver-usage.md` | `WEB-INF/conf/propagation-receivers-config/{任意名}.xml` |

### intra-mart 標準データの送受信（標準リスナー）

| 用途 | テンプレート |
|------|------------|
| intra-mart が標準で送信するデータ（テナント・アカウント・ロール・IM-Authz・メニュー・カレンダー・ジョブネット・Salesforce連携・Wiki等の変更通知）を独自モジュールで受信する | `assets/standard-listener-usage.md` |
| IM-Box（アプリ通知・ウォッチ登録/解除）等、intra-mart 標準機能が用意する受信処理（`GenericModel`）へ独自モジュールからデータを送信する | `assets/standard-listener-usage.md` |

### リファレンス

- `reference/propagation-api-reference.md` — `PropagationManager`/`PropagationManagerFactory`/`Encoder`/`Decoder`/`Procedure`/`AbstractGeneric`/`ReceiveResult`/`EventStatus`/`OperationType`/例外階層の全メソッド・シグネチャ（プラットフォーム API の実クラス定義に基づく。記憶で書かない）
- `reference/propagation-config-reference.md` — `propagation-senders-config`/`propagation-receivers-config`/`propagation-config` の XML 要素・属性・XSD 名前空間・配置場所の詳細

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「Java でモジュール間のデータ連携を実装して」
- 「`PropagationManager` を使ってデータを送信したい」
- 「Encoder/GenericModel を使って独自データを送る処理を作って」
- 「Decoder/Procedure を使って他モジュールからのデータを受信する処理を作って」
- 「送信設定ファイル（`propagation-senders-config`）/受信設定ファイル（`propagation-receivers-config`）を作って」
- 「テナント作成・ロール更新等、intra-mart 標準の変更通知を受け取るリスナーを実装して」
- 「IM-Box のウォッチ登録を独自モジュールから行いたい」

「Java で」「JavaEE 開発モデルで」等の明示がなくても、IM-Propagation に相当する JSSP（スクリプト開発モデル）向け SSJS API は存在しないため、常に本スキルの対象として扱ってよい。

## 実装手順

1. ユーザの要件をヒアリング
   - 自モジュールが送信側か受信側か（両方の場合もある）
   - 送信側の場合: 送信するデータの内容、送信タイミング（DB更新と同一トランザクションにするか）、`operationType`（`reference/propagation-api-reference.md` の標準定数から選ぶか、独自の文字列にするか）
   - 受信側の場合: 受信対象が「他の独自モジュール」か「intra-mart 標準データ」か（後者は `source`/`operationType` が固定のため `assets/standard-listener-usage.md` の一覧から選ぶ）、受信データの処理内容がDBトランザクションに乗せられるか（乗せられない場合は `AbstractSessionableProcedure` を検討）
2. 送信側を実装する場合、`assets/sender-usage.md` を参照し、データモデル → `GenericModel`（`AbstractGeneric` 継承）→ `Encoder`（`AbstractEncoder` 継承）→ `PropagationManager` 呼び出しコード → 送信設定ファイルの順に実装（メソッドのシグネチャは `reference/propagation-api-reference.md` を必ず参照し、記憶や推測で書かない）
3. 受信側を実装する場合、`assets/receiver-usage.md` を参照し、`Decoder`（`AbstractDecoder` 継承）→ `Procedure`（`AbstractProcedure` または `AbstractSessionableProcedure` 継承）→ 受信設定ファイルの順に実装。**`source`/`operationType` は送信側（自作の場合は手順2、intra-mart 標準データの場合は `assets/standard-listener-usage.md` の一覧）と完全一致させる**。**`Decoder<G, D>` の `G` に指定するクラスに `public` な引数なしコンストラクタが存在するか、実装前に必ず確認する**（無い場合に受信登録すると送信元の処理自体が壊れる。「注意事項」参照）。**intra-mart 標準データを受信する場合は、`G` にドメインモデルクラスを直接使わず、`jp.co.intra_mart.foundation.propagation.model.generic` パッケージの対応する `Generic*` クラスを使う**（`assets/standard-listener-usage.md` の対応表を参照し、検証用環境での事前確認も行う）
4. `GenericModel` のクラス・フィールド構成は送信側・受信側で完全に同一クラスである必要はないが、フィールド名・型が大きく乖離すると復元時にデータが失われる。送受信間で同じ `GenericModel` クラス（共有ライブラリ等に配置）を使うか、フィールド構成を意識して個別に定義するかをユーザと合意する
5. `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか確認

## 配置規約

### ベースパッケージ・ディレクトリ

プロジェクトに既存の Java パッケージ規約があればそれに従う。無い場合、`.agents/requirements/java-naming/AGENTS.md` の例に倣い、以下を既定とする。**既定はあくまでデフォルトであり、ユーザの明示指定があればそちらを優先する。**

```
{basePackage}.{機能名}.propagation
{basePackage}.{機能名}.propagation.encoder    … Encoder 実装（送信側のみ）
{basePackage}.{機能名}.propagation.decoder    … Decoder 実装（受信側のみ）
{basePackage}.{機能名}.propagation.procedure  … Procedure 実装（受信側のみ）
```

例: 機能名 `leave`（休暇申請）、ベースパッケージ `jp.co.intra_mart.sample` の場合

```
jp.co.intra_mart.sample.leave.propagation            -> LeaveApprovedData.java（データモデル）
                                                         LeaveApprovedGeneric.java（GenericModel）
jp.co.intra_mart.sample.leave.propagation.encoder    -> LeaveApprovedEncoder.java
jp.co.intra_mart.sample.leave.propagation.decoder    -> LeaveApprovedDecoder.java
jp.co.intra_mart.sample.leave.propagation.procedure  -> LeaveApprovedProcedure.java
```

### 設定ファイル配置先

```
src/main/conf/propagation-senders-config/{任意名}.xml     … 送信設定（src/main/webapp/WEB-INF/conf/ ではない）
src/main/conf/propagation-receivers-config/{任意名}.xml   … 受信設定
src/main/conf/propagation-config.xml                       … 全体設定（デッドロック検知等。単一ファイル）
```

いずれもビルド時に `WEB-INF/conf/` 配下へそのままの相対構造でコピーされる（パッケージ階層は作らずファイル直置き）。

### クラス命名

`.agents/requirements/java-naming/AGENTS.md` のパスカルケース規則に従う。サフィックスは役割に対応させる:

| 役割 | サフィックス | 例 |
|------|------------|-----|
| GenericModel | `Generic` | `LeaveApprovedGeneric` |
| Encoder | `Encoder` | `LeaveApprovedEncoder` |
| Decoder | `Decoder` | `LeaveApprovedDecoder` |
| Procedure | `Procedure` | `LeaveApprovedProcedure` |

**配置先パスの優先順位:** ユーザーがプロンプトで配置先パッケージ・パスを明示的に指定した場合は、その指示を最優先する。本スキルの既定はあくまでデフォルトである。

## 注意事項

- **【最重要】`Decoder<G, D>` の `G`（GenericModel）に指定するクラスは、必ず `public` な引数なしコンストラクタを持たなければならない。** IM-Propagation は GenericModel の受け渡しに `Serializable` ではなく内部的に JSON ベースの変換を用いており、受信側はリフレクション（引数なしコンストラクタ）でクラスを再構築してから `decode()` に渡すため。**引数なしコンストラクタが無いクラスを `G` として受信登録すると、受信側の実装に関わらず送信元の処理自体が `SendException` で失敗する。** 送信元が intra-mart 標準機能の場合、標準機能全体が使用不能になる重大な影響が生じる。`jp.co.intra_mart.foundation.admin.account.model.AccountInfo`（`public AccountInfo(String userCd)` の1引数コンストラクタしか持たない）はこの要件を満たさない
- **intra-mart 標準データを受信する場合、`G` には `AccountInfo` 等の管理系 API のドメインモデルクラスを直接指定せず、`jp.co.intra_mart.foundation.propagation.model.generic` パッケージが提供する公式の `Generic*` クラス（`GenericAccount`/`GenericTenant`/`GenericRole` 等）を使うこと。** `source` 属性（ルーティング用）はドメインモデルクラスの FQCN のまま、`G`（実際に JSON から再構築されるクラス）だけを対応する `Generic*` クラスに差し替える。`AccountInfo` → `GenericAccount` の組み合わせで正常に受信できる。詳細は `reference/propagation-api-reference.md` の「`jp.co.intra_mart.foundation.propagation.model.generic` パッケージ」、`assets/standard-listener-usage.md` の対応表を参照。対応する `Generic*` クラスが見つからない場合のみ、本パッケージの要件（引数なしコンストラクタ等）を満たす独自ミラークラスを検討し、本番相当の環境にいきなり配置せず検証用環境で先に確認すること
- **`PropagationManager` のセッション（`begin()` で開始したもの）は必ず `decide()`/`abort()`/`close()` のいずれかで終了させること。** 終了させずに放置すると、DB トランザクションが終了しない、または以後の `PropagationManagerFactory` 経由の取得がハングする等の重大な不具合につながる。`abort()` は `finally` ブロックに置くのが定石（`decide()` 済みの場合は何もしない安全な実装のため、二重呼び出しを恐れる必要はない）
- **`Encoder`/`Decoder` は変換失敗時に `ConvertException`（のサブクラス）を、`Procedure` は処理失敗時に `ProcedureException`（のサブクラス）を送出すること。** `PropagationManagerException` はフレームワーク内部用の例外であり、アプリケーションコード（Encoder/Decoder/Procedure の実装）から送出してはならない
- **`operationType` は送信側・受信側で文字列として完全一致させる。** 標準定数（`OperationType` クラス、`DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED`/`PROC_STARTED`/`PROC_COMPLETED` 等）を優先的に使い、独自の操作を表す場合のみ独自の文字列定数を定義する
- **`source` 属性に指定するデータモデルの FQCN は事後の変更が困難。** クラス名変更（リファクタリング等）を行う際は、稼働中の送信設定・受信設定ファイル双方の更新が必要になる点をユーザに周知する
- **受信側の Procedure がDBトランザクションを必要とする通常の業務処理であれば `AbstractProcedure` を使う。** ホスト側（送信元）のトランザクションに相乗りするため、Procedure 内で独自にトランザクションを開始・終了する必要はない
- **受信側の処理がDB以外のリソース（外部API呼び出し・ファイル操作等）を扱い、コミット前に判定・確定処理を独自に行いたい場合は `AbstractSessionableProcedure` を使う。** `onInitialize` → `onReceive` → `onPrepare` → `onDecide`/`onAbort` の2相コミット的なライフサイクルで実装する
- `propagation-config.xml`（`each-thread-sleep`/`max-thread-sleep`）はデッドロック検知のためのスリープ時間設定であり、通常のアプリケーション開発では変更不要。値を変更する場合はユーザに意図を確認する
- **intra-mart 標準データを受信する場合、`source`/`operationType` は `assets/standard-listener-usage.md` の一覧記載の値と完全一致させること。** 独自に類推した値を使うと、受信設定ファイルが機能せず何のエラーも出ないまま受信処理が呼ばれない状態になる
- **IM-Box 等 intra-mart 標準機能へ送信する場合、対応する受信側（Decoder/Procedure）は intra-mart 側に実装済みのため、アプリケーション側で受信設定ファイルを作成する必要はない。** 送信側の一式（データモデル・標準提供の `GenericModel`・送信設定ファイル）のみを実装する

## 生成後の確認

自動検証スクリプトではなく、以下の項目を手動で確認する。

1. 送信設定ファイルの `source`/`operationType` と、受信設定ファイルの `source`/`operationType`（または intra-mart 標準データの場合は `assets/standard-listener-usage.md` 記載の値）が完全一致しているか
2. `Encoder`/`Decoder` が変換失敗時に `ConvertException`（のサブクラス）を、`Procedure` が処理失敗時に `ProcedureException`（のサブクラス）を送出しているか（`PropagationManagerException` を誤って送出していないか）
3. `PropagationManager` のセッション（`begin()`）が、すべての実行経路（正常系・例外系）で `decide()`/`abort()`/`close()` のいずれかにより確実に終了しているか
4. `GenericModel`（`AbstractGeneric` 継承）のクラスが `Serializable` を正しく実装し、`serialVersionUID` が定義されているか
5. **`Decoder<G, D>` の `G` に指定したクラスが `public` な引数なしコンストラクタを持っているか（独自クラスに追加のコンストラクタを定義した場合は特に要確認）。intra-mart 標準データを受信する場合、`G` にドメインモデルクラスを直接使わず `jp.co.intra_mart.foundation.propagation.model.generic` パッケージの対応する `Generic*` クラスを使っているか、本番相当の環境へ配置する前に検証用環境で動作確認したか**
6. 受信側の Procedure が DB トランザクションを必要とするか否かで `AbstractProcedure`/`AbstractSessionableProcedure` を適切に選択しているか
7. 設定ファイルの配置先が `src/main/conf/propagation-senders-config/`・`src/main/conf/propagation-receivers-config/`（`src/main/webapp/WEB-INF/conf/` ではない）になっているか
8. `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか
9. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない。プロジェクトに Java 向けのコードレビュー・セキュリティチェックスキルが別途存在する場合はそちらを利用する

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| **Java（JavaEE 開発モデル）での IM-Propagation 送受信実装（`PropagationManager`/`Encoder`/`Decoder`/`Procedure`/設定ファイル）** | **本スキル** |
| JSSP（スクリプト開発モデル）での同等実装 | 対応する SSJS 版 API は提供されていない（本スキルの対象外） |
| IM-Workflow のアクション処理・到達処理等（IM-Propagation とは独立した拡張機構） | `java-im-workflow-usage`（Java）/`jssp-im-workflow-usage`（JSSP） |
| IM-共通マスタ（ユーザ・組織等）自体の CRUD | `java-im-master-usage`。IM-共通マスタの変更通知を IM-Propagation で受信する場合は本スキルと併用 |
