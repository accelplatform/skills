# ConfigurationLoader API リファレンス（Java 版）

intra-mart Accel Platform コアソース（`im_core_base` / `im_core_impl` モジュール）の実クラス定義に基づく。記憶や推測でメソッドを補わないこと。

## パッケージ構成

```
jp.co.intra_mart.foundation.config
├── ConfigurationLoader             … 公開 API。設定の読込/保存/キャッシュクリアのエントリポイント
├── ConfigurationService            … ConfigurationLoader が委譲するサービスインタフェース（内部実装用）
├── Instance                        … インスタンス管理の列挙型（SINGLETON/PROTOTYPE）
├── ConfigurationException          … 設定に関する検査例外の基底クラス
├── ConfigurationRuntimeException   … 設定に関する実行時例外
├── SourceNotFoundException         … ConfigurationException のサブクラス。XML 設定ファイルが見つからない場合
└── SchemaNotFoundException         … ConfigurationException のサブクラス。XSD スキーマが見つからない場合

jp.co.intra_mart.system.config（im_core_impl モジュール、標準実装。通常のアプリケーション開発では直接参照しない）
└── XMLConfigurationService         … ConfigurationService の標準実装（JAXB + XML）
```

## `ConfigurationLoader` クラス

```java
package jp.co.intra_mart.foundation.config;

public final class ConfigurationLoader {

    /** リソース検索時の suffix を指定するためのシステムプロパティキー. */
    public static final String SUFFIX_KEY = ConfigurationLoader.class.getName() + ".suffix";
    // 実際の値: "jp.co.intra_mart.foundation.config.ConfigurationLoader.suffix"

    private ConfigurationLoader() { } // インスタンス化不可

    /**
     * 内部に保持している設定のクリアを行います。
     * このメソッドを呼び出した場合、クラスタに含まれるノードが持つ設定のクリアが行われます。
     */
    public static void clearCache(Class<?> configurationClass) throws ConfigurationException;

    /**
     * 設定クラスに対応したスキーマを取得します。存在しない場合は ConfigurationException（SchemaNotFoundException）。
     */
    public static <T> Schema findSchema(Class<T> configurationClass) throws ConfigurationException;
    public static <T> Schema findSchema(Class<T> configurationClass, ClassLoader classLoader) throws ConfigurationException;

    /**
     * 設定の読込みを行います。Instance.SINGLETON（既定）の場合、clearCache() を呼ばない限り同一インスタンスを返します。
     */
    public static <T> T load(Class<T> configurationClass) throws ConfigurationException;
    public static <T> T load(Class<T> configurationClass, ClassLoader classLoader) throws ConfigurationException;
    public static <T> T load(Class<T> configurationClass, Instance instance) throws ConfigurationException;
    public static <T> T load(Class<T> configurationClass, Instance instance, ClassLoader classLoader) throws ConfigurationException;

    /**
     * 同一設定クラスに対応する複数の XML ファイルをすべて読み込みます。
     */
    public static <T> Collection<T> loadAll(Class<T> configurationClass) throws ConfigurationException;
    public static <T> Collection<T> loadAll(Class<T> configurationClass, ClassLoader classLoader) throws ConfigurationException;
    public static <T> Collection<T> loadAll(Class<T> configurationClass, Instance instance) throws ConfigurationException;
    public static <T> Collection<T> loadAll(Class<T> configurationClass, Instance instance, ClassLoader classLoader) throws ConfigurationException;

    /**
     * 設定の保存を行います。SystemStorage の "conf/{name}{suffix}.xml" にのみ書き込みます。
     * 内部で管理されている読込済みキャッシュのクリアは行いません（別途 clearCache() が必要）。
     */
    public static <T> void save(T configuration) throws ConfigurationException;
}
```

- `final` クラスかつコンストラクタが `private`。継承・インスタンス化不可、全メソッド `static`
- `load()`/`loadAll()`/`save()`/`clearCache()`/`findSchema()` いずれも検査例外 `ConfigurationException` を送出する（`throws` 宣言必須）
- `classLoader` を省略したオーバーロードは `Thread.currentThread().getContextClassLoader()` を使う
- `instance` を省略したオーバーロードは `Instance.SINGLETON` を使う（**既定はキャッシュされる**）

## `Instance` 列挙型

```java
package jp.co.intra_mart.foundation.config;

public enum Instance {
    /** 呼び出される毎に毎回生成されます. */
    PROTOTYPE,
    /** アプリケーションの開始から終了まで保持されます. */
    SINGLETON
}
```

- `SINGLETON`: 初回読込み時のインスタンスをプロセス内にキャッシュし、以後同一インスタンスを返す。`clearCache(Class)` を呼ぶまでファイルの変更は反映されない
- `PROTOTYPE`: 呼び出すたびに XML ファイルを再読込みする。設定変更を都度反映したい場合に使うが、頻繁に呼ぶ処理では I/O コストに注意

## 例外クラス階層

```
java.lang.Exception
└── ConfigurationException                … 検査例外。load/loadAll/save/clearCache/findSchema が送出しうる
    ├── SourceNotFoundException           … 対応する .xml が見つからない場合
    └── SchemaNotFoundException           … 対応する .xsd が見つからない場合

java.lang.RuntimeException
└── ConfigurationRuntimeException         … 実行時例外。ConfigurationService 実装のロード失敗、
                                              SystemStorage への書き込み失敗（ディレクトリ作成失敗等）で送出される
```

いずれもメッセージ付き・原因例外（`Throwable cause`）付きコンストラクタを持つ標準的な例外クラス。

## 標準実装（`XMLConfigurationService`）の内部動作

`ConfigurationLoader` は内部で `ConfigurationService` インタフェースの実装（既定は `jp.co.intra_mart.system.config.XMLConfigurationService`、`im_core_impl` モジュール）に処理を委譲する。実装クラスはシステムプロパティ `jp.co.intra_mart.foundation.config.ConfigurationService`（インタフェースの完全修飾名）で差し替え可能だが、**通常のアプリケーション開発では既定の XML 実装をそのまま使う。**

### ファイルパスの導出規則（`SourcePath`）

設定クラスの単純名から、以下のアルゴリズムでベースファイル名を導出する（大文字の直前にハイフンを挿入し、全体を小文字化）。

```java
// 例: ExternalApiConfig → external-api-config
final StringBuilder name = new StringBuilder();
for (final char c : clazz.getSimpleName().toCharArray()) {
    if (Character.isUpperCase(c)) {
        if (name.length() != 0) name.append('-');
        name.append(Character.toLowerCase(c));
    } else {
        name.append(c);
    }
}
```

ディレクトリ部分は設定クラスのパッケージ名を `/` 区切りに変換したもの（例: `jp.co.example.foo.config` → `jp/co/example/foo/config`）。

### XML 設定ファイルの検索順位（`load()`/`loadAll()` 共通の前半）

1. **SystemStorage**: `conf/{name}{suffix}.xml`
2. **`WEB-INF/conf/{name}{suffix}.xml`**（サーブレットコンテキストの実ファイル）
3. **`WEB-INF/conf/{name}{suffix}/` フォルダ**配下の `*.xml`（ファイル名昇順でソート）
   - `load()`（単数）: フォルダ内の全ファイルを XPath (`/*/*`) で子要素をマージし、**1つの設定として読み込む**
   - `loadAll()`（複数）: フォルダ内の各ファイルを**マージせず、独立した設定インスタンスとして配列で返す**
4. **クラスパス**: 指定された `ClassLoader` → 設定クラスの `ClassLoader` → `XMLConfigurationService` 自身の `ClassLoader` の順に `{directory}/{name}{suffix}.xml` を検索

いずれの場所にも見つからない場合は `SourceNotFoundException`（`ConfigurationException` のサブクラス）。

**補足**: 上記の順位は1（SystemStorage）が最優先だが、`save()` で SystemStorage に書き込んだ後に `WEB-INF/conf/{name}.xml`（2）が同時に存在するケースでは、`clearCache()` を呼んでも `Instance.PROTOTYPE` で読んでも2（`WEB-INF/conf/`）側の値が返り続ける。`WEB-INF/conf/{name}.xml` を取り除くと1（SystemStorage）側が正しく参照される。「save()の書き込み先」の項も参照。

### XSD スキーマの検索順位（`load()`/`loadAll()`/`save()` 共通）

1. **`WEB-INF/schema/{name}.xsd`**（サーブレットコンテキストの実ファイル。パッケージ階層は作らずファイル直置き）
2. **クラスパス**: `{directory}/{name}.xsd`（設定クラスと同じパッケージ階層）

見つからない場合は `SchemaNotFoundException`。**スキーマは省略不可**（`Unmarshaller`/`Marshaller` にスキーマを設定した上で検証しながら読み書きする実装のため）。

### `save()` の書き込み先

`save(T configuration)` は **`SystemStorage` の `conf/{name}{suffix}.xml` にのみ**書き込む（`WEB-INF/conf/` やクラスパスには書き込まない）。親ディレクトリが存在しない場合は自動作成する。書き込み失敗時は `ConfigurationRuntimeException`（`IOException` 起因）、マーシャリング失敗時は `ConfigurationException`（`JAXBException` 起因、失敗した場合は書き込みかけのファイルを削除してから例外を送出）。

**`save()` はキャッシュをクリアしない。** `Instance.SINGLETON` で読み込んだ既存キャッシュに反映したい場合は、`save()` の後に明示的に `ConfigurationLoader.clearCache(configurationClass)` を呼ぶ必要がある。

**`WEB-INF/conf/{name}.xml` が存在する状態で `save()`+`clearCache()` を使うと、新しい値が反映されない。** `save()` は SystemStorage の `conf/` にのみ書き込むが、`WEB-INF/conf/{name}.xml` が同時に存在する設定に対して `clearCache()` 後に `load()`（`Instance.PROTOTYPE` で読んでも同様）を呼んでも、SystemStorage 側の新しい値ではなく `WEB-INF/conf/` 側の値が返り続ける。`WEB-INF/conf/{name}.xml` を配置しない状態であれば SystemStorage の値が正しく参照される。「配置先の優先順位」の表だけからは SystemStorage が優先されるように読めるが、両方が同一設定に対して存在するケースでは異なる挙動を示すため、**デプロイ時固定の設定（`WEB-INF/conf/`）と `save()` による動的更新設定は、同一の設定に対して併用しないこと。**

### `clearCache()` の挙動

- 既定（本番相当の動作）: `ApplicationInitializerProxy` 経由で `ClearCacheTask` をクラスタの全ノードに配信し、各ノードのキャッシュをクリアする
- システムプロパティ `jp.co.intra_mart.foundation.config.ConfigurationLoader.local=true` が指定されている場合: 自ノードのメモリ上キャッシュのみをクリアする（クラスタ配信は行わない）。単体テストや単一プロセスの開発環境での利用を想定

### `SUFFIX_KEY` によるファイル名の変化

システムプロパティ `ConfigurationLoader.SUFFIX_KEY`（実体は `jp.co.intra_mart.foundation.config.ConfigurationLoader.suffix`）に空でない文字列を設定すると、`load()`/`loadAll()`/`save()` すべてで、検索・書き込み対象のファイル名が `{name}-{suffix}.xml` に変わる（スキーマファイル名 `{name}.xsd` には suffix は付与されない）。

## JAXB 設定クラスの必須構造（`check-jaxb-format-plugin` による制約）

intra-mart の Maven ビルド（`jp.co.intra_mart.maven:check-jaxb-format-plugin`）は、`ConfigurationLoader` で読み込む設定クラスに対して以下を静的検証し、満たさない場合はビルドエラーにする。

- `@XmlType` アノテーションに `factoryClass` と `factoryMethod` の両方を指定すること
- `factoryMethod` で指定した名前のメソッドが `factoryClass` に存在し、かつ **`static`** であること

このため、設定クラスを追加する際は必ず同一パッケージに `@XmlRegistry` を付与した `ObjectFactory` クラスを用意し、`public static T createXxx()` 形式の静的ファクトリメソッドを実装する（プラットフォーム標準設定クラス（`ServerContextConfig` 等）も同じ構造を取っている）。

```java
@XmlType(name = "", propOrder = { ... }, factoryClass = ObjectFactory.class, factoryMethod = "createExternalApiConfig")
@XmlRootElement(name = "external-api-config", namespace = "...")
public class ExternalApiConfig { ... }

@XmlRegistry
public class ObjectFactory {
    public static ExternalApiConfig createExternalApiConfig() {
        return new ExternalApiConfig();
    }
}
```

具体的な実装例は `assets/configuration-basic-usage.md` を参照。

## プラットフォーム実装での利用例（挙動の参考）

`jp.co.intra_mart.system.platform.ServerContext`（`im_core_base` モジュール）:

```java
final ServerContextConfig config = ConfigurationLoader.load(ServerContextConfig.class);
```

`jp.co.intra_mart.system.core.colors.SystemColorPattern`（`im_tags` モジュール）は、毎回最新の内容を反映したいテーマ関連設定に `Instance.PROTOTYPE` を明示的に指定している:

```java
final SystemColorPatternConfig config = ConfigurationLoader.load(SystemColorPatternConfig.class, Instance.PROTOTYPE);
```

このように、**通常は既定の `Instance.SINGLETON` で十分だが、管理画面等からの変更を都度反映する必要がある設定には `Instance.PROTOTYPE` が使われている**点が実プラットフォームコードから読み取れる。
