# ConfigurationLoader API 基本利用パターン（Java 版）

`ConfigurationLoader` のシグネチャ・内部動作、ファイル配置規則は `reference/configuration-loader-api-reference.md` を参照。ここでは、外部 API 連携設定（エンドポイント URL・タイムアウト・API キー）を例に、設定クラス・XSD スキーマ・XML 設定ファイル・呼び出しコードの一式を示す。

## 1. 設定クラス（JAXB POJO）

`@XmlAccessorType(XmlAccessType.FIELD)` でフィールドに直接アノテーションを付与するスタイルが、プラットフォーム標準設定クラス（`ServerContextConfig` 等）と同じ構造で分かりやすい。**`@XmlType` の `factoryClass`/`factoryMethod` は省略不可**（後述の `ObjectFactory` を参照する必要がある。省略すると `check-jaxb-format-plugin` によりビルドエラーになる）。

```java
package jp.co.example.foo.configuration;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

/**
 * 外部連携APIの接続設定を表します。
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "endpointUrl",
    "timeoutMillis",
    "apiKey"
}, factoryClass = ObjectFactory.class, factoryMethod = "createExternalApiConfig")
@XmlRootElement(name = "external-api-config", namespace = "http://example.com/foo/configuration/external-api-config")
public class ExternalApiConfig {

    @XmlElement(name = "endpoint-url", namespace = "http://example.com/foo/configuration/external-api-config", required = true)
    protected String endpointUrl;

    @XmlElement(name = "timeout-millis", namespace = "http://example.com/foo/configuration/external-api-config", required = true)
    protected int timeoutMillis;

    @XmlElement(name = "api-key", namespace = "http://example.com/foo/configuration/external-api-config")
    protected String apiKey;

    public String getEndpointUrl() {
        return endpointUrl;
    }

    public void setEndpointUrl(final String endpointUrl) {
        this.endpointUrl = endpointUrl;
    }

    public int getTimeoutMillis() {
        return timeoutMillis;
    }

    public void setTimeoutMillis(final int timeoutMillis) {
        this.timeoutMillis = timeoutMillis;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(final String apiKey) {
        this.apiKey = apiKey;
    }
}
```

- `namespace` は設定クラス固有の URI であれば形式は自由だが、XSD スキーマの `targetNamespace` と完全に一致させる
- `required = true` を付けたフィールドに対応する XML 要素が欠けていた場合、スキーマ検証でエラーになる（`ConfigurationException`）
- ロジックは持たせない（getter/setter のみ）。設定値を使った処理は呼び出し側に書く

## 2. `ObjectFactory`（`factoryClass`/`factoryMethod` の実体、省略不可）

同一パッケージに配置する。ファクトリメソッドは **`static`** でなければビルドエラーになる。

```java
package jp.co.example.foo.configuration;

import javax.xml.bind.annotation.XmlRegistry;

/**
 * このパッケージの設定クラスに対する JAXB ファクトリを提供します。
 */
@XmlRegistry
public class ObjectFactory {

    /**
     * {@link ExternalApiConfig} の新規インスタンスを生成します。
     * @return {@link ExternalApiConfig}
     */
    public static ExternalApiConfig createExternalApiConfig() {
        return new ExternalApiConfig();
    }
}
```

設定クラスを複数追加する場合も `ObjectFactory` は1パッケージにつき1個でよい。`createXxx()` を設定クラスの数だけ追加する。

## 3. XSD スキーマ

`src/main/schema/` 配下に**パッケージ階層を作らずファイル直置き**で配置する（例: `src/main/schema/external-api-config.xsd`）。`src/main/schema/` はビルド時に `WEB-INF/schema/` へそのままの相対構造でコピーされるため、パッケージ階層を作って配置すると `SchemaNotFoundException` になる。ファイル名は「ファイルパスの導出規則」（`reference/configuration-loader-api-reference.md`）に従い `external-api-config.xsd`。`targetNamespace` は設定クラスの `namespace` 属性と一致させる。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns="http://example.com/foo/configuration/external-api-config"
    targetNamespace="http://example.com/foo/configuration/external-api-config"
    elementFormDefault="qualified">

    <xs:element name="external-api-config">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="endpoint-url" type="xs:string" />
                <xs:element name="timeout-millis" type="xs:int" />
                <xs:element name="api-key" type="xs:string" minOccurs="0" />
            </xs:sequence>
        </xs:complexType>
    </xs:element>

</xs:schema>
```

- `xs:sequence` の要素順は、設定クラスの `@XmlType(propOrder = {...})` と一致させる
- 任意項目（`required = false`）は `minOccurs="0"` を付ける

## 4. XML 設定ファイル

デプロイ時に確定させる設定は `src/main/conf/external-api-config.xml` に配置する（`src/main/webapp/WEB-INF/conf/` ではない。`WEB-INF/conf/` 配下にそのままコピーされ、ファイル名はパッケージ階層を作らずベースファイル名のみ）。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<external-api-config xmlns="http://example.com/foo/configuration/external-api-config">
    <endpoint-url>https://api.example.com/v1</endpoint-url>
    <timeout-millis>5000</timeout-millis>
    <api-key>dummy-api-key</api-key>
</external-api-config>
```

ルート要素の名前空間宣言（`xmlns="..."`）は XSD の `targetNamespace` と一致させる。API キー等の秘匿情報をリポジトリにコミットする実ファイルへ直接書く場合は、値をダミーにするか、環境固有の値は別途デプロイ時に差し替える運用にする。

## 5. `ConfigurationLoader` からの読込・保存

```java
package jp.co.example.foo.configuration;

import java.util.Collection;

import jp.co.intra_mart.foundation.config.ConfigurationException;
import jp.co.intra_mart.foundation.config.ConfigurationLoader;
import jp.co.intra_mart.foundation.config.Instance;

/**
 * {@link ConfigurationLoader} を利用した {@link ExternalApiConfig} の読み書きを提供します。
 */
public class ExternalApiConfigService {

    /**
     * 設定をキャッシュ付きで読み込みます（Instance.SINGLETON、既定）。<br>
     * デプロイ時に固定される設定など、実行中に変更されない値の取得に使います。
     *
     * @return 設定
     * @throws ConfigurationException 設定の読込みに失敗した場合
     */
    public ExternalApiConfig load() throws ConfigurationException {
        return ConfigurationLoader.load(ExternalApiConfig.class);
    }

    /**
     * 設定を呼び出しの都度再読込みします（Instance.PROTOTYPE）。<br>
     * 管理画面等から動的に更新される設定を、変更のたびに反映させたい場合に使います。
     *
     * @return 設定
     * @throws ConfigurationException 設定の読込みに失敗した場合
     */
    public ExternalApiConfig loadAlways() throws ConfigurationException {
        return ConfigurationLoader.load(ExternalApiConfig.class, Instance.PROTOTYPE);
    }

    /**
     * WEB-INF/conf/external-api-config/ フォルダに分割配置された設定をすべて読み込みます。
     *
     * @return 設定の一覧
     * @throws ConfigurationException 設定の読込みに失敗した場合
     */
    public Collection<ExternalApiConfig> loadAll() throws ConfigurationException {
        return ConfigurationLoader.loadAll(ExternalApiConfig.class);
    }

    /**
     * 設定を永続化し、Instance.SINGLETON のキャッシュをクリアします。<br>
     * clearCache() を呼ばないと、既に load() 済みのキャッシュには反映されません。
     *
     * @param config 設定
     * @throws ConfigurationException 保存またはキャッシュクリアに失敗した場合
     */
    public void save(final ExternalApiConfig config) throws ConfigurationException {
        ConfigurationLoader.save(config);
        ConfigurationLoader.clearCache(ExternalApiConfig.class);
    }
}
```

- `load()` を呼ぶ側は毎回 `ConfigurationException` の `try-catch`、または `throws` 宣言が必要
- 頻繁に呼び出す処理で `Instance.PROTOTYPE` を使うと、呼び出しのたびに XML 読込み・スキーマ検証が走るため、I/O コストが気になる場合は既定の `Instance.SINGLETON` + 更新時の明示的な `clearCache()` を検討する
- **`save()` を使う設定には `src/main/conf/{name}.xml` を配置しない。** `WEB-INF/conf/{name}.xml` が存在する状態で `save()` により SystemStorage に新しい値を書き込んでも、`clearCache()` 後の再読込み（`Instance.PROTOTYPE` でも同様）で反映されない。デプロイ時固定の設定（`WEB-INF/conf/`）と `save()` による動的更新設定は、別の設定クラスとして完全に分けて実装する

## アンチパターン（避けること）

```java
// NG: @XmlType に factoryClass/factoryMethod を指定しない
@XmlType(name = "", propOrder = { "endpointUrl" })
// check-jaxb-format-plugin によりビルドエラーになる

// NG: ObjectFactory のファクトリメソッドが static でない
public ExternalApiConfig createExternalApiConfig() { // static 修飾子がない
    return new ExternalApiConfig();
}
// check-jaxb-format-plugin によりビルドエラーになる

// NG: save() の後に clearCache() を呼ばない
ConfigurationLoader.save(config);
// この後 ConfigurationLoader.load(ExternalApiConfig.class) を呼んでも
// Instance.SINGLETON のキャッシュが残っているため、保存前の内容が返り続ける

// NG: XSD の targetNamespace と設定クラスの namespace 属性が不一致
// スキーマ検証エラー（ConfigurationException）または要素が読み取れない原因になる
```

NG: `src/main/schema/` にパッケージ階層を作って配置する（例: `src/main/schema/jp/co/example/foo/configuration/external-api-config.xsd`）。`WEB-INF/schema/` へそのまま相対構造がコピーされるため `SchemaNotFoundException` になる。ファイル直置きにすること。
