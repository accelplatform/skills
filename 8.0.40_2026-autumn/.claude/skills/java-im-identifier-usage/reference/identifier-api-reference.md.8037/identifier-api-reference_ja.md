# Identifier API リファレンス（Java 版）

intra-mart Accel Platform コアソース（`im_core_base` / `im_core_impl` モジュール）の実クラス定義に基づく。記憶や推測でメソッドを補わないこと。

## パッケージ構成

```
jp.co.intra_mart.foundation.service.client.information
├── Identifier          … 公開 API。一意 ID 取得のエントリポイント
└── IdentifierSpi        … Identifier のサービスプロバイダインタフェース（内部実装差し替え用の抽象クラス）

jp.co.intra_mart.system.service.information
├── SystemIdProvider     … システム全体で一意な ID（システム ID）を提供するインタフェース
└── SystemIdProviderImpl … SystemIdProvider の標準実装（im_core_impl モジュール、Server Manager と通信）

jp.co.intra_mart.common.aid.jdk.util
└── UniqueIdGenerator    … IdentifierSpi の標準実装が内部で使うユーティリティ（時刻 + シーケンス番号による ID 生成）
```

## `Identifier` クラス

```java
package jp.co.intra_mart.foundation.service.client.information;

public final class Identifier {

    public Identifier();

    /**
     * 分散環境などの場合も含めてシステム一意が保証されたIDを取得します。
     * 生成される文字列の長さは 15 バイトです。
     * @return ユニークID
     * @throws IOException Server Manager との通信エラー
     */
    public String get() throws IOException;

    /**
     * アプリケーションサーバ内で一意となるIDを作成します。
     * アプリケーションサーバ内に閉じた処理を行う以外の用途では利用しないでください。
     * 通常、ユニークなIDを取得したい場合は get() を利用してください。
     * @return ユニークID
     */
    public static String make();
}
```

- `final` クラス。継承不可
- インスタンスは状態を持たない（フィールドを持たない）。`get()` を呼ぶ場合のみインスタンス化が必要
- クラス初期化時（static イニシャライザ）に、`ServiceLoader` 経由で `SystemIdProvider` の実装を検出し、`ConfigurationLoader` で `identifier-config.xml`（後述）を読み込んで `IdentifierSpi` の実装インスタンスを決定する。**アプリケーション開発者がこの初期化プロセスを直接扱うことはない**

### `get()` の内部動作

```
get() {
    return make().concat(Identifier.provider.getSystemId());
}
```

`make()` で生成した 13 バイトの文字列に、`SystemIdProvider#getSystemId()` が返す 2 バイトのシステム ID を連結し、15 バイトの文字列として返す。`getSystemId()` は Server Manager と通信してシステム全体で一意な ID を取得するため、通信エラー時に `IOException` を送出する。

### `make()` の内部動作

```
make() {
    return identifierSpi.generate();
}
```

`IdentifierSpi#generate()` に委譲する。既定の実装（`identifier-config.xml` で `generator-class` が指定されていない場合）は、内部で匿名クラスとして以下のように定義されている:

```java
private static IdentifierSpi newDefaultProviderInstance() {
    return new IdentifierSpi() {
        @Override
        String generate() {
            return UniqueIdGenerator.getUniqueId();
        }
    };
}
```

すなわち既定実装では `make()` は `UniqueIdGenerator.getUniqueId()` の呼び出しに相当する。

## `IdentifierSpi` クラス（サービスプロバイダインタフェース）

```java
package jp.co.intra_mart.foundation.service.client.information;

public abstract class IdentifierSpi {

    public IdentifierSpi();

    /**
     * Identifier#get() の実装を提供します。
     * 一意性を保証されたＩＤを取得します。生成される文字列の長さは 13 バイトです。
     * @return 一意なID
     */
    abstract String generate();
}
```

- パッケージプライベートな抽象メソッド `generate()` を実装することで、`make()` の生成アルゴリズムを差し替えられる
- `generate()` がパッケージプライベートのため、**アプリケーション側で独自の `IdentifierSpi` 実装を作ることは事実上不可**（同一パッケージ内でしか継承・実装できない）。カスタマイズは `identifier-config.xml` の `generator-class` にプラットフォーム内の別実装クラスを指定する形でのみ行う（通常のアプリケーション開発では不要）

## `SystemIdProvider` インタフェース

```java
package jp.co.intra_mart.system.service.information;

public interface SystemIdProvider {

    /**
     * システムで一意のIDを返却します。
     * @return 一意のID
     * @throws IOException IDの取得に失敗した場合にスローされます。
     */
    String getSystemId() throws IOException;
}
```

- `Identifier` クラスの static イニシャライザで `ServiceLoader.load(SystemIdProvider.class)` により検出される SPI 実装
- 標準実装は `im_core_impl` モジュールの `SystemIdProviderImpl`（Server Manager と通信してシステム全体で一意な ID を取得する）
- アプリケーション開発者がこのインタフェースを直接実装・利用することは通常ない

## `UniqueIdGenerator` ユーティリティ

```java
package jp.co.intra_mart.common.aid.jdk.util;

public class UniqueIdGenerator {

    /**
     * ユニークなＩＤを作成します。
     * 現在のプロセスに対して一意性を保証するＩＤを生成します。
     * ＩＤは時間情報およびこのクラスが持つシーケンス番号から構成されています。
     * これによりメソッド呼び出しの度に異なる文字列を生成しＩＤとして返します。
     * 生成される文字列の長さは 13 です。
     * 本メソッドは、IDの一意性を保障する為に synchronized メソッドとなっています。
     * @return ユニークＩＤ
     */
    public static synchronized String getUniqueId();
}
```

- ID の構成: `yyyyMMddHHmmssSSS` 形式の現在時刻を 36 進数変換した文字列 + 36 進数 2 桁のシーケンス番号（`00`〜`zz`、呼び出しのたびにインクリメント、上限到達で `00` に循環）
- `synchronized` メソッドのため、同一 JVM 内での呼び出しはスレッドセーフだが、高頻度連続呼び出し時にロック競合のボトルネックになりうる
- **アプリケーション開発者がこのクラスを直接呼び出す必要はない。** `Identifier.make()` 経由で利用する

## `identifier-config.xml`（プラットフォーム設定）

```xml
<identifier-config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns="http://intra-mart.co.jp/foundation/identifier/identifier-config"
    xsi:schemaLocation="http://intra-mart.co.jp/foundation/identifier/identifier-config ...">
    <!-- generator-class を指定すると make() のアルゴリズムを差し替えられる（既定は未指定） -->
</identifier-config>
```

- `generator-class` 要素（省略可）に `IdentifierSpi` を実装したプラットフォーム内クラスの完全修飾名を指定すると、`make()` の生成アルゴリズムを差し替えられる
- 未指定の場合は `newDefaultProviderInstance()`（`UniqueIdGenerator.getUniqueId()` を呼ぶ既定実装）が使われる
- クラスのロードに失敗した場合（`ClassNotFoundException` / `InstantiationException` / `IllegalAccessException`）は `ConfigurationRuntimeException`（実行時例外）が送出され、`Identifier` クラスの初期化自体が失敗する
- **通常のアプリケーション開発ではこの設定ファイルを編集しない。** プラットフォーム全体の ID 生成アルゴリズムに関わる設定のため、変更が必要な場合はユーザに意図を確認した上で慎重に対応する

## 実プラットフォームコードでの利用例（挙動の参考）

`jp.co.intra_mart.system.workflow.engine.tool.EngineNumberingUtil#createNewNumber()`（`im_workflow_core` モジュール、ワークフローの案件番号採番処理）:

```java
public static String createNewNumber() throws EngineException {

    String newNum = null;

    if (UnitModeUtil.getInstance().isUTMode()) {
        // 単体テストモード等、Server Manager に接続できない実行環境向けのフォールバック
        newNum = Identifier.make();
    } else {
        final Identifier id = new Identifier();
        try {
            newNum = id.get();
        } catch (final IOException e) {
            throw new EngineException("IMW.SRV.ERR.0664", e);
        }
    }

    return newNum != null ? newNum : "N/A";
}
```

この例が示す通り、業務データの採番（ここでは案件番号）には原則 `get()` を使い、通常のアプリケーション実行環境（Server Manager と通信可能な環境）を前提とする。`make()` へのフォールバックは、Server Manager に接続できない特殊な実行環境（単体テスト等）に限定した対応であり、通常の業務ロジックの分岐として模倣するものではない。

他に `make()` のみを使う実プラットフォームコードの例:
- `jp.co.intra_mart.system.logic.log.LogContext#executionId`（`im_logic_impl`、IM-LogicDesigner のフロー実行 ID。プロセス内トレース用途）
- `jp.co.intra_mart.imbox.internal.util.DefaultIdGenerator#generate()`（`imbox_core`、内部 ID 生成）
- `jp.co.intra_mart.system.javascript.imapi.IdentifierObject`（`im_jssp`、JSSP の SSJS 版 Identifier オブジェクトのブリッジ実装。JSSP 側から `make()` 相当の ID を取得する際の内部実装）

いずれも「単一プロセス内で完結する識別子で十分」なケースであり、分散環境での重複回避が要件になる業務データの主キー・伝票番号等とは性質が異なる点に注意する。
