---
name: java-im-configuration-generator
description: intra-mart 固有の設定ファイル管理 API（`jp.co.intra_mart.foundation.config.ConfigurationLoader`、`im_core_base` モジュール）を Java（JavaEE 開発モデル）で使用し、JAXB ベースの独自設定クラス・XSD スキーマ・XML 設定ファイルの三点セットを新規作成するためのスキルセット。`ConfigurationLoader.load`/`loadAll`/`save`/`clearCache` の使い分け、`Instance`（`SINGLETON`/`PROTOTYPE`）によるキャッシュ制御、設定ファイルの配置場所（SystemStorage の `conf/`・`WEB-INF/conf`・クラスパス）とクラス名からファイル名への変換規則、`check-jaxb-format-plugin` が要求する `ObjectFactory`（`factoryClass`/`factoryMethod`）の実装パターンを提供する。Java で独自の設定ファイルを読み込みたい、`ConfigurationLoader` を使いたい、XML ベースのアプリケーション設定を用意したい、JavaEE 開発モデルで設定ファイルを新規作成したい、と言及されたときに使用。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart ConfigurationLoader API 実装支援スキル（Java 版）

## 目的

intra-mart Accel Platform が提供する **JavaEE 開発モデル**向けの設定ファイル管理 API（`jp.co.intra_mart.foundation.config.ConfigurationLoader`）を使い、アプリケーション独自の XML 設定ファイルを新規に定義・読込・保存する実装を支援するスキルセット。

**このスキルが扱うのは Java ソースファイル（`.java`）、XML スキーマ（`.xsd`）、XML 設定ファイル（`.xml`）の三点セットのみ。** プラットフォーム標準の設定ファイル（`server-context-config.xml` 等）自体の変更は対象外（プラットフォーム全体の設定であり、通常のアプリケーション開発では扱わない）。

## 基本概念（最重要）

`ConfigurationLoader` で読み込む独自設定は、常に次の3点セットで構成される。**このスキルはこの3点セットを一括で生成する。**

```
① 設定クラス（JAXB アノテーション付き Java POJO）  … Java コードから見た設定の型
② XSD スキーマ（.xsd）                              … ②③の妥当性検証、①との対応関係の宣言
③ XML 設定ファイル（.xml）                          … 実際の設定値（実行時に配置）
```

`ConfigurationLoader` はこの3点を対応付けて読み込む薄いファサードであり、設定クラス自体にロジックは持たせない（getter/setter のみの POJO）。

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `.claude/rules/java-naming.md` | 🟢 **必読** — パッケージ・クラス・メソッド・変数命名 |
| `.claude/rules/java-code-style.md` | 🟢 **必読** — `final` ローカル変数、文字列リテラル等 |
| `.claude/rules/java-javadoc.md` | 🟢 **必読** — クラス/メソッド JavaDoc |

`.claude/rules` 配下には JAXB 設定クラス・XSD スキーマの命名/構造に関する専用規約は存在しない。設定クラスの構造・命名は `assets/configuration-basic-usage.md` のパターンに従う。

`jssp-*` の規約はこのスキルの対象外（Java ファイルには適用しない）。JSSP（スクリプト開発モデル）には `ConfigurationLoader` に相当する SSJS 版 API は提供されていない。

## API 概要

`ConfigurationLoader` クラスは `jp.co.intra_mart.foundation.config` パッケージに属する `final` クラス（インスタンス化不可、全メソッドが `static`）。

| メソッド | 用途 |
|---------|------|
| `load(Class<T>)` / `load(Class<T>, Instance)` / `load(Class<T>, ClassLoader)` / `load(Class<T>, Instance, ClassLoader)` | 設定を1件読み込む |
| `loadAll(Class<T>)` / `loadAll(Class<T>, Instance)` / `loadAll(Class<T>, ClassLoader)` / `loadAll(Class<T>, Instance, ClassLoader)` | 同一設定クラスに対応する複数の XML ファイルをすべて読み込む |
| `save(T configuration)` | 設定インスタンスを XML として永続化する（SystemStorage の `conf/` 配下にのみ書き込む） |
| `clearCache(Class<?>)` | `Instance.SINGLETON` でキャッシュされた読込済みインスタンスをクラスタ全体でクリアする |
| `findSchema(Class<T>)` / `findSchema(Class<T>, ClassLoader)` | 対応する XSD スキーマを取得する（通常のアプリケーション開発では直接呼ぶ必要はない） |

いずれも検査例外 `ConfigurationException`（`Exception` 継承）を送出する。全メソッドのシグネチャ・`Instance` 列挙型（`SINGLETON`/`PROTOTYPE`）・例外階層・内部の設定ファイル検索順位は `reference/configuration-loader-api-reference.md` を必ず参照すること（記憶や推測で書かない）。

## 設定ファイルの配置規則（最重要）

### ファイル名の決定規則

設定クラスの単純名（PascalCase）から、大文字の直前にハイフンを挿入してすべて小文字化した名前が、XML/XSD のベースファイル名になる。

例: `ExternalApiConfig` → `external-api-config`（`external-api-config.xml` / `external-api-config.xsd`）

### 配置先ディレクトリ

XML 設定ファイルは、開発時とプラットフォーム標準運用のいずれでも、以下の優先順位で検索される（上が優先）。**アプリケーション開発でよく使うのは 2 と 4。**

| 優先順位 | 検索場所 | 用途 |
|---------|---------|------|
| 1 | SystemStorage の `conf/{name}.xml` | `ConfigurationLoader.save()` の書き込み先。管理画面等から動的に更新する設定向け |
| 2 | `WEB-INF/conf/{name}.xml`（プロジェクトの `src/main/conf/` 配下。**`src/main/webapp/WEB-INF/conf/` ではない**。パッケージ階層を作らずファイル直置き） | デプロイ時に確定させたい環境固有設定向け。**このスキルで生成する設定の既定配置先** |
| 3 | `WEB-INF/conf/{name}/` フォルダ配下の複数 `.xml`（ファイル名昇順で XML の子要素をマージ） | 1つの設定を複数ファイルに分割して配置したい場合（プラグイン等による追記） |
| 4 | クラスパス上の `{設定クラスのパッケージを/区切りにしたディレクトリ}/{name}.xml`（`src/main/resources/` 配下、または設定クラスと同じ `src/main/java/` 配下に配置） | モジュール同梱のデフォルト設定・開発時のサンプル設定向け |

**優先順位1（SystemStorage）と2（WEB-INF/conf）を同一設定に対して併用しない。** `WEB-INF/conf/{name}.xml` が存在する状態で `ConfigurationLoader.save()` を使って SystemStorage の `conf/` 配下に新しい値を書き込んでも、その後の `load()` は `clearCache()` を呼んでも（`Instance.PROTOTYPE` で読んでも）`WEB-INF/conf/` 側の値を返し続け、`save()` の内容は反映されない。`WEB-INF/conf/{name}.xml` を取り除くと SystemStorage 側の値が正しく参照される。すなわち、**デプロイ時固定の設定は `WEB-INF/conf/{name}.xml` のみ、管理画面等から動的に更新する設定は `save()`（`WEB-INF/conf/{name}.xml` を配置しない）のみ、と用途ごとに完全に分ける**こと。

XSD スキーマは以下の優先順位で検索される。

| 優先順位 | 検索場所 |
|---------|---------|
| 1 | `WEB-INF/schema/{name}.xsd`（プロジェクトの `src/main/schema/` 配下。**パッケージ階層を作らずファイル直置き**。このスキルで生成する設定の既定配置先） |
| 2 | クラスパス上の `{設定クラスのパッケージを/区切りにしたディレクトリ}/{name}.xsd`（設定クラスと同じパッケージ階層でコンパイル済みリソースとして配置） |

**`src/main/schema/` はビルド時に `WEB-INF/schema/` へそのままの相対構造でコピーされるため、パッケージ階層を作って配置すると優先順位1・2のどちらにも一致せず `SchemaNotFoundException` になる。** 必ずファイル直置きにすること。優先順位2（クラスパス）は、プラットフォーム標準設定（`ServerContextConfig` 等）のように、設定クラスと同じ Java パッケージにコンパイル済みリソースとして同梱されているケース向けであり、通常のアプリケーション開発（webapp モジュール）では使わない。

**XSD スキーマは必須。** 対応する `.xsd` が見つからない場合は `SchemaNotFoundException`（`load`/`loadAll`/`save` すべてで発生しうる）。

### `SUFFIX_KEY` によるファイルの出し分け

システムプロパティ `jp.co.intra_mart.foundation.config.ConfigurationLoader.suffix` を設定すると、`{name}-{suffix}.xml` を優先的に検索する（例: `-Djp.co.intra_mart.foundation.config.ConfigurationLoader.suffix=dev` → `external-api-config-dev.xml`）。環境ごとに異なる設定ファイルを配布したい場合に使う。通常のアプリケーション開発では意識不要。

## 生成対象とテンプレート

| 生成対象 | テンプレート | 内容 |
|---------|------------|------|
| 設定クラス（JAXB POJO）+ `ObjectFactory` | `assets/configuration-basic-usage.md` | `@XmlRootElement`/`@XmlType`/`@XmlElement` の付与パターン、`check-jaxb-format-plugin` が要求する `factoryClass`/`factoryMethod` の実装 |
| XSD スキーマ | `assets/configuration-basic-usage.md` | 設定クラスのフィールドに対応する `xs:element` 定義 |
| XML 設定ファイルのサンプル | `assets/configuration-basic-usage.md` | `WEB-INF/conf/` 配下への配置例 |
| `ConfigurationLoader` 呼び出しコード（読込・保存） | `assets/configuration-basic-usage.md` | `load()`/`loadAll()`/`save()`+`clearCache()` の呼び出しパターン |

### リファレンス

- `reference/configuration-loader-api-reference.md` — `ConfigurationLoader`/`Instance`/例外クラス階層の全メソッド・シグネチャ、設定ファイル・スキーマの検索順位の内部実装に基づく詳細（プラットフォーム実クラス定義に基づく。記憶で書かない）

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「Java で独自の設定ファイルを読み込む処理を作って」
- 「JavaEE 開発モデルで ConfigurationLoader を使いたい」
- 「XML でアプリケーション設定を管理したい」
- 「プラグインの動作設定を外部ファイル化したい」
- 「設定ファイルの検索順序・配置場所を知りたい」

「Java で」「JavaEE 開発モデルで」等の明示がない場合は、プロジェクトの既存実装がどちらのモデルかをユーザに確認する。JSSP（プロコード）向けには `ConfigurationLoader` に相当する SSJS 版 API は存在しない。

## 実装手順

1. ユーザの要件をヒアリング（設定項目一覧・型・必須/任意、更新頻度（デプロイ時固定か、管理画面等から動的に更新するか）、環境ごとに値を変えたいか）
2. 設定クラス名を決定（`XxxConfig` 命名を推奨、`.claude/rules/java-naming.md` に準拠）し、ファイル名（`external-api-config` 等）を「設定ファイルの配置規則」に従って導出
3. `assets/configuration-basic-usage.md` を参照して、設定クラス・`ObjectFactory`・XSD スキーマ・XML サンプルを実装（メソッドのシグネチャ・アノテーション属性は `reference/configuration-loader-api-reference.md` を必ず参照し、記憶や推測で書かない）
4. 動的更新が不要な設定は手順2で導出したファイル名で `src/main/conf/{name}.xml` に配置（`src/main/webapp/WEB-INF/conf/` ではない）。管理画面等から動的に更新する設定は `ConfigurationLoader.save()` を使うコードを実装（SystemStorage の `conf/` 配下に書き込まれる。運用担当者が直接編集するファイルではない）。**この2つは同一の設定に対して併用しない**（`WEB-INF/conf/{name}.xml` を配置すると `save()` の内容が反映されなくなる。「配置先ディレクトリ」参照）
5. XSD スキーマを `src/main/schema/{name}.xsd` に**パッケージ階層を作らず直置き**で配置（`WEB-INF/schema/` にそのままコピーされるため）
6. 呼び出し元（サービスクラス等）から `ConfigurationLoader.load()` で読み込むコードを実装。`Instance.SINGLETON`（既定）と `Instance.PROTOTYPE` のどちらを使うかは「注意事項」を参照して判断
7. `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか確認

## 注意事項

- **`ObjectFactory` と `factoryClass`/`factoryMethod` は省略できない。** intra-mart のビルド（`check-jaxb-format-plugin`）は、設定クラスの `@XmlType` に `factoryClass`/`factoryMethod` が指定されていないとビルドエラーにする。さらにファクトリメソッドは `static` でなければビルドエラーになる。設定クラスを追加するたびに、同一パッケージの `ObjectFactory` に対応する `static` 生成メソッドを追加すること
- **`load()` の既定（`Instance.SINGLETON`）はプロセス内キャッシュされる。** `clearCache()` を呼ばない限り、同一プロセス内では常に同じインスタンスが返る。設定変更を都度反映したい場合は `Instance.PROTOTYPE` を使うか、変更後に明示的に `clearCache()` を呼ぶ
- **`save()` は `conf/` 配下にのみ書き込む。** `WEB-INF/conf/` やクラスパスには書き込まれない。`save()` で保存した設定を読み直したい場合、`save()` 自体はキャッシュをクリアしないため、`save()` の直後に `clearCache()` を呼ぶ必要がある
- **`WEB-INF/conf/{name}.xml` が存在すると、`save()` で SystemStorage に書き込んだ新しい値は `clearCache()` を呼んでも反映されない。** `save()` による動的更新を使う設定には `WEB-INF/conf/{name}.xml` を配置しないこと（「配置先ディレクトリ」参照）
- **`clearCache()` はクラスタ全体（複数アプリケーションサーバ）に伝播する。** 単体テストや開発時のみメモリ上のキャッシュだけをクリアしたい場合は、システムプロパティ `jp.co.intra_mart.foundation.config.ConfigurationLoader.local=true` を指定した実行環境で呼び出す
- **`WEB-INF/conf/{name}/` フォルダを使った分割配置の挙動は `load()` と `loadAll()` で異なる。** `load()`（単数）はフォルダ内の複数 `.xml` をファイル名の昇順で1つの設定にマージしてから読み込む（1つの設定を機能単位で分割して配置できる）。`loadAll()` はフォルダ内の各 `.xml` を独立した設定インスタンスとして配列で返す（マージしない）。同じフォルダ構成でも呼び出すメソッドによって挙動が変わる
- **XSD スキーマの namespace は、設定クラスの `@XmlRootElement`/`@XmlElement` の `namespace` 属性と完全に一致させる。** 不一致があると、スキーマ検証エラー（`ConfigurationException`）または要素の読み取り漏れが発生する
- **`src/main/schema/` にパッケージ階層を作って配置しない。** ファイル直置きにしないと `SchemaNotFoundException`（メッセージは `{name}.xsd`）になる。「設定クラスと同じパッケージ階層で配置すればクラスパス上で見つかるはず」という類推は誤り
- `findSchema()` を通常のアプリケーション開発で直接呼び出す必要はない（`load()`/`save()` の内部でスキーマ検証のために使われる）

## 生成後の確認

自動検証スクリプト（JSSP 版の `validate-jssp-code.js` 相当）ではなく、以下の項目を手動で確認する。

1. 設定クラスを実際にコンパイルし、`check-jaxb-format-plugin` によるビルドエラー（`factoryClass`/`factoryMethod` 未指定・ファクトリメソッド非 `static`）が出ないこと
2. XSD スキーマの `targetNamespace` と、設定クラス・`ObjectFactory` の `namespace` 属性が一致していること
3. XML 設定ファイルが XSD スキーマに対して妥当であること
4. `save()` を使う場合、保存後に `clearCache()` を呼んでいること
5. `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか
6. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない。プロジェクトに Java 向けのコードレビュー・セキュリティチェックスキルが別途存在する場合はそちらを利用する

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| **Java（JavaEE 開発モデル）での独自 XML 設定ファイルの新規作成・読込・保存** | **本スキル** |
| プラットフォーム標準設定ファイル（`server-context-config.xml` 等）自体の変更 | 対象外。プラットフォーム全体設定のため、変更が必要な場合はユーザに意図を確認した上で慎重に対応する |
| メッセージプロパティファイル（`.properties`）による多言語化 | `java-im-message-usage` |
| Java でのファイル操作（`PublicStorage`/`SystemStorage` 等） | `java-im-storage-usage` |
| JSSP（スクリプト開発モデル）での設定管理 | 対応する SSJS 版 API は提供されていない（本スキルの対象外） |
