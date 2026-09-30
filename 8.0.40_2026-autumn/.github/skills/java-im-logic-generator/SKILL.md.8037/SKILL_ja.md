---
name: java-im-logic-generator
description: intra-mart IM-LogicDesigner のフロー要素（タスク）を Java（JavaEE 開発モデル）で新規実装する。カテゴリクラス（ElementCategory）、フロー要素クラス（Task 継承 + @LogicFlowElement）、メタデータクラス（FlowElementMetadata）、拡張パッケージの登録（ElementScanPackageFactory + META-INF/services）の実装パターンを提供する。Java で IM-LogicDesigner のタスクを作りたい、独自のロジックフロー要素を実装したい、カスタムタスクを追加したい、JavaEE 開発モデルで IM-LogicDesigner を拡張したい、と言及されたときに使用。ロジックフロー定義（flow_definition.json）自体の生成は jssp-im-logic-generator、JSSP 画面から既存フローを呼び出す実装は jssp-im-logic-usage を使うこと。マッピング関数・EL関数・フロートリガの実装は対象外。
allowed-tools: Bash, Read, Write, Glob
---

# IM-LogicDesigner Java フロー要素実装支援スキル

## 目的

intra-mart Accel Platform の IM-LogicDesigner が提供する拡張ポイント（`jp.co.intra_mart.foundation.logic.element.*` 配下の抽象クラス・インタフェース）を使い、ロジックフローのパレットに表示される **独自タスク（フロー要素）** を Java で新規実装するためのスキルセット。

## 対象範囲外

IM-LogicDesigner の拡張ポイントは複数あるが、本スキルが対象とするのは **フロー要素（タスク）の実装のみ**。以下は対象外。

| 対象外の機能 | 使うスキル/対応 |
|------------|----------------|
| ロジックフロー定義（`flow_definition.json`）自体の作成 | `jssp-im-logic-generator` |
| JSSP 画面から既存のロジックフロー API を呼び出す実装 | `jssp-im-logic-usage` |
| マッピング関数（`@MappingFunction`） | 対象外（本スキルでは扱わない） |
| EL関数（`@ELFunction` / `@ProvideELFunction`） | 対象外（本スキルでは扱わない） |
| フロートリガ（`@TriggerEvent`） | 対象外（本スキルでは扱わない） |

## 実装するクラス一覧

フロー要素を1つ追加するには、以下のクラスをこの順で作成する。カテゴリは他のタスクと共用できるため、既存カテゴリがあれば新規作成は不要。

| クラス | 役割 | 継承/実装元 |
|-------|------|------------|
| カテゴリクラス | パレット上のカテゴリ（グループ）を定義。使い回し可 | `ElementCategory` インタフェース実装 |
| 引数クラス | フロー要素の入力値（マッピング元） | 制約なし（JavaBeans 準拠の POJO） |
| 戻り値クラス | フロー要素の出力値（マッピング先） | 制約なし（JavaBeans 準拠の POJO） |
| フロー要素クラス | タスクの実処理本体。`@LogicFlowElement` を付与 | `Task<メタデータ, 引数, 戻り値>` 継承 |
| メタデータクラス | パレット表示名・アイコン・プロパティのメタ情報 | `FlowElementMetadata` 継承 |
| パッケージ指定クラス | 拡張パッケージをプラットフォームに登録（プロジェクトに1つあれば足りる） | `ElementScanPackageFactory` インタフェース実装 |

詳細な API（メソッドシグネチャ全量）は `reference/flow-element-api.md` を参照すること。**記憶や推測で実装しない。**

## 実装手順

1. ユーザの要件をヒアリング（タスク名・所属カテゴリ・入出力パラメータ・プロパティ・ベースパッケージ）
2. 拡張パッケージが未登録のプロジェクトであれば、`reference/registration-and-packaging.md` に従い `ElementScanPackageFactory` 実装クラスと `META-INF/services` プロバイダ構成ファイルを作成する（プロジェクトに既存のものがあれば流用し、新規作成しない）
3. カテゴリクラスを作成、または既存カテゴリを再利用する
4. 引数クラス・戻り値クラスを作成する（使用可能な型は `reference/flow-element-api.md` の型一覧を参照）
5. フロー要素クラス（`Task` 継承）を作成し、`@LogicFlowElement` を付与する
6. メタデータクラス（`FlowElementMetadata` 継承）を作成し、フロー要素クラスをコンストラクタに渡す
7. プロパティ（デザイナ画面で事前設定する値）が必要な場合は `reference/flow-element-api.md` の「プロパティの追加」に従い実装する
8. 後処理（リソース開放等）が必要な場合は `FlowElementCloser` を実装する
9. `.github/instructions/java-naming.instructions.md` / `.github/instructions/java-code-style.instructions.md` / `.github/instructions/java-javadoc.instructions.md` に準拠しているか確認する

## 最小実装例

以下は最小構成（プロパティ・後処理なし）の例。プロパティ・後処理を含む完全な例は `reference/flow-element-api.md` を参照。

```java
// カテゴリ
package org.example.logicdesigner.element;

import jp.co.intra_mart.foundation.logic.element.category.ElementCategory;

public class MyCategory implements ElementCategory {

    @Override
    public String getCategoryId() {
        return "my_category";
    }

    @Override
    public String getDisplayName() {
        return "サンプルカテゴリ";
    }

    @Override
    public int getSortNumber() {
        return 100;
    }
}
```

```java
// フロー要素
package org.example.logicdesigner.element;

import jp.co.intra_mart.foundation.logic.annotation.LogicFlowElement;
import jp.co.intra_mart.foundation.logic.element.ElementContext;
import jp.co.intra_mart.foundation.logic.element.Task;
import jp.co.intra_mart.foundation.logic.exception.FlowExecutionException;

@LogicFlowElement(id = "my_task", category = MyCategory.class, index = 100)
public class MyTask extends Task<MyTaskMetadata, MyParameter, MyResult> {

    public MyTask(ElementContext context) {
        super(context);
    }

    @Override
    public MyResult execute(MyParameter parameter) throws FlowExecutionException {
        MyResult result = new MyResult();
        result.setMessage("hello world.");
        return result;
    }
}
```

```java
// メタデータ
package org.example.logicdesigner.element;

import jp.co.intra_mart.foundation.logic.element.metadata.FlowElementMetadata;

public class MyTaskMetadata extends FlowElementMetadata {

    public MyTaskMetadata() {
        super(MyTask.class);
    }

    @Override
    public String getElementName() {
        return "サンプルタスク";
    }
}
```

- `@LogicFlowElement` の `id` には **`im_` で始まる文字列は指定できない**（プラットフォーム標準タスクとの衝突を避けるため予約されている）。カテゴリの `getCategoryId()` も同様。
- 引数・戻り値クラスは getter/setter を持つ JavaBeans 準拠の POJO として作成する（`reference/flow-element-api.md` 参照）。

## 配置規約

プロジェクトに既存の Java パッケージ規約があればそれに従う。無い場合、`.github/instructions/java-naming.instructions.md` の例に倣い、以下を既定とする。**既定はあくまでデフォルトであり、ユーザの明示指定があればそちらを優先する。**

```
{basePackage}.logicdesigner.element
```

```
src/main/java/{basePackageのパス区切り}/logicdesigner/element/{ClassName}.java
```

パッケージ指定クラス（`ElementScanPackageFactory` 実装）はプロジェクトに1つあれば足りるため、`{basePackage}.logicdesigner` 直下に配置する。

## 注意事項

- フロー要素はロジックフロー実行のたびにインスタンスが生成される。ただし繰り返し（ループ）内で同一フロー要素が呼び出される場合はインスタンスが再利用されるため、フィールドに前回実行時の状態を持ち越さないこと
- カテゴリクラスは複数のフロー要素で共用できる。タスクを追加するたびに新規カテゴリを作らない
- フロー要素・メタデータクラスは `@LogicFlowElement` アノテーションを起点にプラットフォームが起動時に自動読み込みする。IM-Workflow の Java 連携（`java-im-workflow-usage`）のように XML へ FQCN を登録する手順は不要
- `execute` メソッドの失敗は `FlowExecutionException`（`throws` 宣言済み）で表現する
- 実行時クラスパスへの配置が必要な点は他の Java 拡張と同様。詳細は `reference/registration-and-packaging.md` を参照

## 参照

- `reference/flow-element-api.md` — 引数/戻り値/プロパティの型一覧、`Task` / `FlowElementMetadata` / `ElementProperty` 等の API シグネチャ全量、プロパティ追加・後処理の完全な実装例
- `reference/registration-and-packaging.md` — 拡張パッケージの登録（`ElementScanPackageFactory` + `META-INF/services`）、実行時クラスパスへの配置に関する注意

## 生成後の確認

自動検証スクリプトではなく、以下の項目を手動で確認する。

1. `@LogicFlowElement` の `id` / カテゴリの `getCategoryId()` が `im_` で始まっていないか
2. `Task<メタデータ, 引数, 戻り値>` の3つの型パラメータと、メタデータクラスのコンストラクタに渡すフロー要素クラスが一致しているか
3. 引数・戻り値・プロパティに使用した型が `reference/flow-element-api.md` の使用可能型一覧に含まれているか（`Collection`/`List` を使う場合は `@TypeHint` を付与しているか）
4. `.github/instructions/java-naming.instructions.md` / `.github/instructions/java-code-style.instructions.md` / `.github/instructions/java-javadoc.instructions.md` に準拠しているか
5. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| ロジックフロー定義（`flow_definition.json`）・ルーティング定義の生成 | `jssp-im-logic-generator` |
| JSSP 画面から既存ロジックフロー API を呼び出す実装 | `jssp-im-logic-usage` |
| **独自タスク（フロー要素）の Java 実装** | **本スキル** |
