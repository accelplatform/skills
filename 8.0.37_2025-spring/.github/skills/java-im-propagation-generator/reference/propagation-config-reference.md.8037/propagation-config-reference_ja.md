# IM-Propagation 設定ファイル リファレンス（Java 版）

intra-mart Accel Platform コアソース（`im_propagation` モジュール）の設定ファイルリファレンス・XSD 定義に基づく。記憶や推測で要素・属性を補わないこと。

IM-Propagation には3種類の設定ファイルがある。

| 設定ファイル | 役割 | 配置先（プロジェクト側） | 単一/複数 |
|---|---|---|---|
| `propagation-senders-config` | データ送信時、`source`+`operationType` から使用する `Encoder` を解決する | `src/main/conf/propagation-senders-config/{任意名}.xml` | 複数ファイル可 |
| `propagation-receivers-config` | データ受信時、`source`+`operationType` から使用する `Decoder`/`Procedure` を解決する | `src/main/conf/propagation-receivers-config/{任意名}.xml` | 複数ファイル可 |
| `propagation-config` | IM-Propagation 全体の動作設定（デッドロック検知等） | `src/main/conf/propagation-config.xml` | 単一ファイル |

いずれもビルド時に `WEB-INF/conf/` 配下へそのままの相対構造でコピーされる。**パッケージ階層は作らず、指定ディレクトリ直下にファイルを直置きすること。**

## `propagation-senders-config`

- 名前空間: `http://www.intra-mart.jp/propagation/senders-config`
- ルート要素: `propagation-senders-config`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<propagation-senders-config xmlns="http://www.intra-mart.jp/propagation/senders-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/propagation/senders-config propagation-senders-config.xsd">
  <sender source="jp.co.example.module.SampleData" operationType="DATA_CREATED">
    <encoder class="jp.co.example.module.propagation.encoder.SampleEncoder">
      <params>
        <param key="customKey">customValue</param>
      </params>
    </encoder>
    <required-procedure class="jp.co.example.module.propagation.procedure.RequiredCheckProcedure" />
  </sender>
</propagation-senders-config>
```

### 要素・属性一覧

| 要素/属性 | 必須 | 説明 |
|---|---|---|
| `sender`（要素） | 必須（1つ以上） | 送信対象の定義。子要素として `encoder`（必須・1つ）、`required-procedure`（任意・複数可）を持つ |
| `sender/@source` | 必須 | 送信元データの完全修飾クラス名。`PropagationManager#send()` に渡すデータ（または明示指定する `dataClass`）のクラスと一致させる |
| `sender/@operationType` | 必須 | 操作種別。`OperationType` の標準定数、または独自の文字列 |
| `encoder`（要素） | 必須（1つ） | 使用する `Encoder` 実装の定義 |
| `encoder/@class` | 必須 | `AbstractEncoder`（または `Encoder` インタフェース）を実装したクラスの完全修飾クラス名 |
| `encoder/params/param`（要素） | 任意 | `Encoder` へ渡すカスタムパラメータ。`AbstractEncoder#getParamValue(key)` 等で参照する |
| `encoder/params/param/@key` | `param` 使用時必須 | パラメータのキー |
| `required-procedure`（要素） | 任意（複数可） | 送信前に必ず実行しておくべき `Procedure` を宣言する（同期的な事前検証等の用途） |
| `required-procedure/@class` | `required-procedure` 使用時必須 | 実行する `Procedure` 実装の完全修飾クラス名 |

- 同一 `source`+`operationType` の組み合わせに対して複数の `sender` 要素を定義すると、該当する全ての `Encoder` が呼び出される

## `propagation-receivers-config`

- 名前空間: `http://www.intra-mart.jp/propagation/receivers-config`
- ルート要素: `propagation-receivers-config`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<propagation-receivers-config xmlns="http://www.intra-mart.jp/propagation/receivers-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/propagation/receivers-config propagation-receivers-config.xsd">
  <receiver source="jp.co.example.module.SampleData" operationType="DATA_CREATED">
    <decoder class="jp.co.example.other_module.propagation.decoder.SampleDecoder">
      <params>
        <param key="customKey">customValue</param>
      </params>
    </decoder>
    <procedure class="jp.co.example.other_module.propagation.procedure.SampleProcedure" />
  </receiver>
</propagation-receivers-config>
```

### 要素・属性一覧

| 要素/属性 | 必須 | 説明 |
|---|---|---|
| `receiver`（要素） | 必須（1つ以上） | 受信対象の定義。子要素として `decoder`（必須・1つ）、`procedure`（必須・1つ）を持つ |
| `receiver/@source` | 必須 | **送信側**データモデルの完全修飾クラス名。送信設定ファイルの `sender/@source` と一致させる（受信側データモデルのFQCNではない） |
| `receiver/@operationType` | 必須 | 操作種別。送信設定ファイルの `sender/@operationType` と一致させる |
| `decoder`（要素） | 必須（1つ） | 使用する `Decoder` 実装の定義 |
| `decoder/@class` | 必須 | `AbstractDecoder`（または `Decoder` インタフェース）を実装したクラスの完全修飾クラス名 |
| `decoder/params/param`（要素） | 任意 | `Decoder` へ渡すカスタムパラメータ |
| `procedure`（要素） | 必須（1つ） | 使用する `Procedure` 実装の定義 |
| `procedure/@class` | 必須 | `AbstractProcedure`/`AbstractSessionableProcedure`（または `Procedure` インタフェース）を実装したクラスの完全修飾クラス名 |
| `procedure/params/param`（要素） | 任意 | `Procedure` へ渡すカスタムパラメータ |

- 同一 `source`+`operationType` の組み合わせに対して複数の `receiver` 要素を定義できる（複数の独自モジュールが同じ送信データを個別に受信できる）。処理順序は保証されないが、各 `receiver` は排他的に（1スレッドずつ）処理される

## `propagation-config`

- 単一ファイル。プロジェクト側の配置先は `src/main/conf/propagation-config.xml`（`WEB-INF/conf/propagation-config.xml` にコピーされる）
- IM-Propagation 全体の動作（デッドロック検知のためのスリープ時間）を設定する

```xml
<?xml version="1.0" encoding="UTF-8"?>
<propagation-config xmlns="http://www.intra-mart.jp/propagation/config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/propagation/config propagation-config.xsd">
  <each-thread-sleep>100</each-thread-sleep>
  <max-thread-sleep>1000</max-thread-sleep>
</propagation-config>
```

| 要素 | 型 | 既定値 | 範囲 | 説明 |
|---|---|---|---|---|
| `each-thread-sleep` | integer（ミリ秒） | `100` | `0`〜`1000` | 同一データ処理クラスが別スレッドにロックされている場合の1回あたりの待機時間 |
| `max-thread-sleep` | integer（ミリ秒） | `1000` | `0`〜`60000` | デッドロックと判定するまでの最大待機時間 |

- デッドロックが検知されると送信は失敗し、`PropagationManager#send()` が `SendException` を送出する。送信側は `SendException` を捕捉し `abort()` を呼ぶ設計にすること（`abort()` により受信側の `onAbort` が呼ばれる）
- 通常のアプリケーション開発でこのファイルの値を変更する必要はない。変更する場合は影響範囲（テナント全体の IM-Propagation 処理速度）をユーザに周知した上で行う

## 配置場所に関する共通の注意

- プロジェクトの `src/main/conf/` 配下（`src/main/webapp/WEB-INF/conf/` **ではない**）に配置する。ビルド時に `WEB-INF/conf/` 配下へ相対構造そのままでコピーされる
- `propagation-senders-config`/`propagation-receivers-config` 配下のファイル名は任意（複数モジュールが独立したファイルを配置してよい。ファイル名の衝突を避けるためモジュールID・機能名を含めることを推奨）
- XSD による検証が行われるため、名前空間・要素名・属性名を正確に記述すること。誤った名前空間を指定すると設定ファイル自体が読み込まれない
