# 拡張パッケージの登録・配置に関する注意

## 拡張パッケージの指定

IM-LogicDesigner の全ての拡張機能（フロー要素・マッピング関数・EL関数・フロートリガ）は、プラットフォームが起動時にクラスパスを走査して自動読み込みする。走査対象のパッケージは明示的に指定する必要があり、指定を行うクラスを実装する。

指定されたパッケージは、サブパッケージを含めて拡張機能が検索される。**検索対象の範囲が広いと起動時の解析に時間がかかる**ため、指定するパッケージは最小限の範囲にとどめること。

パッケージを指定するクラスは `jp.co.intra_mart.system.logic.factory.ElementScanPackageFactory` インタフェースを実装する。

```java
package org.example.logicdesigner;

import java.util.Arrays;
import java.util.Collection;

import jp.co.intra_mart.system.logic.factory.ElementScanPackageFactory;

public class MyPackageFactory implements ElementScanPackageFactory {

    @Override
    public Collection<String> getTargetPackages() {
        return Arrays.asList("org.example.logicdesigner");
    }
}
```

- `getTargetPackages()` の戻り値に、走査対象としたいパッケージ名を文字列で列挙する
- 以降に作成するフロー要素・カテゴリ・メタデータクラスは、ここで指定したパッケージ配下（サブパッケージ含む）に配置する

## ServiceLoader プロバイダ構成ファイルの配置

作成したパッケージ指定クラスは `java.util.ServiceLoader` を利用して読み込まれるサービスプロバイダとして扱われる。そのため、クラスパス上に以下のプロバイダ構成ファイルを配置する必要がある。

```
src/main/resources/META-INF/services/jp.co.intra_mart.system.logic.factory.ElementScanPackageFactory
```

ファイルの内容には、作成したパッケージ指定クラスの完全修飾名（FQCN）を1行で記述する。

```
org.example.logicdesigner.MyPackageFactory
```

**このファイルはプロジェクトに1つあれば足りる。** 複数のフロー要素・タスクを同一パッケージ配下に追加する場合、`ElementScanPackageFactory` の実装クラスとこのプロバイダ構成ファイルを再度作成する必要はない。プロジェクトに既存のものがあれば、そのパッケージ配下にクラスを追加すればよい。

## 実行時クラスパスへの配置

作成した Java クラス（カテゴリ・フロー要素・メタデータ・パッケージ指定クラス）は、コンパイル済みの `.class`（または JAR）が **アプリケーションサーバの実行時クラスパス上に存在する必要がある**。ソースファイルを配置するだけでは動作しない。

具体的な配置方法（WEB-INF/lib への JAR 配置、または OSGi バンドルモジュールとしての配置等）はプロジェクトのビルド構成に依存するため、本スキルの対象外。プロジェクトの既存 Java モジュールのビルド・デプロイ手順に従うこと。既存の Java モジュールが存在しない場合は、ユーザーに以下を確認する。

1. Java ソースをどの Maven モジュール（または新規モジュール）に追加するか
2. ビルド成果物（JAR）をどうデプロイ環境へ反映するか

## IM-Workflow の Java 連携との違い

`java-im-workflow-usage` が生成する Java クラスは、ワークフロー定義（インポート用 XML）の `plugins[].parameter` に実装クラスの FQCN を文字列で登録することで初めて呼び出される。

一方、本スキルが対象とするフロー要素は **`@LogicFlowElement` アノテーションと `ElementScanPackageFactory` による自動スキャン** で読み込まれる。XML 等へ FQCN を個別登録する手順は存在しない。走査対象パッケージ配下に `@LogicFlowElement` を付与したクラスを配置すれば、起動時に自動的にパレットへ反映される。

## クラスのインスタンス化条件

フロー要素クラスはロジックフロー実行のたびにインスタンスが生成される（ただし繰り返し等で同一フロー要素が呼び出される場合は再利用される）。`Task` のコンストラクタは `ElementContext` を引数に取るため、IM-Workflow の Java 連携（引数なしコンストラクタが必須）とは異なり、**引数なしコンストラクタを用意する必要はない**。
