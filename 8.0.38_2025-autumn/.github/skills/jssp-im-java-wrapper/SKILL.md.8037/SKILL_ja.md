---
name: jssp-im-java-wrapper
description: JSSP（スクリプト開発モデル）から自作の Java 処理を呼び出すためのラッパークラス（JSSP API）を新規作成する。`jp.co.intra_mart.system.javascript.ScriptableObject` を継承したラッパークラス（静的関数型 `@JSStaticFunction` / インスタンス型 `@JSConstructor`・`@JSFunction`）、`conf/products/initializer/initializer-<モジュールID>.xml` による JSSP グローバルオブジェクトへの登録、d.ts 型定義の作成手順を提供する。JSSP から Java のクラス・メソッドを呼び出したい、Java の処理を JSSP API として公開したい、`Packages` を使わずに Java を呼び出したい、NewLock のような JSSP API を自作したい、と言及されたときに使用。ラッパーから呼び出す Java 側の業務処理そのものは `java-im-architecture` 等の Java スキルで実装すること。JSSP の標準 API（d.ts）や既存スキルで実現できない処理（例：Apache POI による Excel 操作）に限って使用し、d.ts の API で実現できる処理には使用しないこと。
allowed-tools: Bash, Read, Write, Edit, Glob
---

# JSSP 用 Java API ラッパー作成スキル

## 目的

JSSP のファンクションコンテナから Java の処理を呼び出すために、Java 側にラッパークラスを実装し、JSSP のグローバルオブジェクト（JSSP API）として登録する。
intra-mart 標準の JSSP API も同じ仕組みで実装されている（例: JSSP の `NewLock` は、Java の `NewLock` を呼び出すラッパークラス `NewLockObject` を登録したもの）。

JSSP から Java クラスを `Packages.*` で直接参照する方法は `.github/instructions/jssp-function-container.instructions.md` で禁止されているため、Java の処理を JSSP から使う場合は本スキルの方法で実装する。

## 使用の判断基準

ラッパーの作成は、**JSSP の標準 API（d.ts に定義された SSJS API）や既存のスキルでは実現できない処理に限る**。

- 対象になる例: Apache POI による Excel ファイルの読み書きなど、JSSP の API に同等の機能が無い Java ライブラリの利用
- 対象にならない例: DB アクセス、ストレージ、HTTP 通信、メール送信など、d.ts に API がある処理（d.ts の API を使う）
- 対象になるか判断できない場合は、ラッパーを作成する前にユーザに確認する

## 生成対象

| 成果物 | 配置先 | 内容 |
|-------|-------|------|
| ラッパークラス（.java） | `src/main/java/{パッケージ}/javascript/{名前}Object.java` | `ScriptableObject` を継承し、JSSP から呼び出すメソッドを公開する |
| 登録ファイル（.xml） | `src/main/conf/products/initializer/initializer-{モジュールID の末尾}.xml` | ラッパークラスを `<api-class>` で JSSP に登録する |
| 型定義（.d.ts） | `d.ts/custom/{名前}.d.ts` | JSSP 側の型チェック（`check-types.sh`）用の宣言 |

- ラッパーから呼び出す Java 側の処理（業務ロジック）は、既存の Java API を使うか、Java スキル（`java-im-architecture` 等）で別途実装する
- ラッパーを呼び出す JSSP の画面・API は、`jssp-page-generator` 等の通常の手順で作成する

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `.github/instructions/java-code-style.instructions.md` / `.github/instructions/java-naming.instructions.md` / `.github/instructions/java-javadoc.instructions.md` | 🟢 必読 — ラッパークラス（.java）の実装 |
| `.github/instructions/java-architecture.instructions.md` | 🟡 ラッパーから呼び出す Java 側の業務処理を新規に実装する場合 |
| `.github/instructions/jssp-function-container.instructions.md` / `.github/instructions/jssp-code-style.instructions.md` | 🟡 ラッパーを呼び出す JSSP 側を実装する場合 |

## 完成品サンプル・リファレンス

- `assets/java-wrapper-sample.md` - 静的関数型・インスタンス型のラッパー、登録ファイル、d.ts、JSSP からの呼び出し例の完成品一式
- `reference/wrapper-reference.md` - 登録ファイルの仕様、アノテーション、JavaScript と Java の間の型変換、例外の扱い

## 実装手順

### ステップ 1: 公開する API を設計する

1. **JSSP 側の名前**を決める
   - ラッパークラスの `getClassName()` が返す文字列が、JSSP のグローバルオブジェクト名になる（例: `"SampleDummy"` → JSSP から `SampleDummy.hello(...)`）
   - `d.ts/platform/` / `d.ts/tenant/` に定義済みの標準 API 名と重複しない名前にする
2. **形式**を選ぶ

   | 形式 | JSSP からの呼び出し方 | 向いている用途 |
   |------|---------------------|---------------|
   | 静的関数型 | `SampleDummy.hello('name')` | 状態を持たない処理（標準の `NewLock` と同じ形式） |
   | インスタンス型 | `new SampleGreeter('prefix').greet('name')` | 生成時の引数や状態を保持して複数のメソッドを呼び出す処理 |

3. **責務を分ける**: ラッパーは引数の変換と Java 処理の呼び出しに専念し、業務ロジックは Java 側のクラスに置く

### ステップ 2: ラッパークラスを実装する

`assets/java-wrapper-sample.md` のコードをベースに実装する。

- `jp.co.intra_mart.system.javascript.ScriptableObject` を継承する
- `getClassName()` をオーバーライドし、ステップ 1 で決めた JSSP 側の名前を返す
- 静的関数型: 公開するメソッドを `public static` で定義し、`@JSStaticFunction` を付与する
- インスタンス型:
  - 引数なしの `public` コンストラクタを定義する
  - `@JSConstructor` を付与した `public static Object constructor(Context, Object[], Function, boolean)` を定義し、生成したインスタンスを返す
  - 公開するインスタンスメソッドに `@JSFunction` を付与する
- 引数を `Object` 型で受け取る場合の Java 側の型と変換方法は `reference/wrapper-reference.md` の「引数の型変換」を参照する
- `ScriptableObject` やアノテーションを使うための Maven 依存の追加は不要（プロジェクトの parent pom で解決される）

### ステップ 3: 登録ファイルを作成する

`src/main/conf/products/initializer/` に登録ファイルを作成し、ラッパークラスの完全修飾名を `<api-class>` に記述する。

- ファイル名は `initializer-` ＋ **モジュール ID の最後の `.` より後ろの部分** ＋ `.xml`（例: モジュール ID `com.example.test-imds` → `initializer-test-imds.xml`）。モジュール ID は `module.xml` の `<id>` で確認する
- 1 モジュールにつき 1 ファイル。ラッパークラスが複数ある場合は `<api-class>` を並べる
- 書式は `reference/wrapper-reference.md` の「登録ファイル」を参照する
- jar の中に `system-install_*.xml` を置く方法では、プロジェクトのモジュールのラッパークラスは登録されない

### ステップ 4: d.ts 型定義を作成する

`d.ts/custom/{名前}.d.ts` に `declare class` で JSSP 側の型を宣言する（例は `assets/java-wrapper-sample.md`）。
`check-types.sh` は `d.ts/**/*.d.ts` を読み込むため、宣言が無いと呼び出し側の型チェックでエラーになる。

### ステップ 5: ビルドと確認

1. `mvn -s settings.xml package` を実行し、ビルドが成功する（コンパイルエラーが無い）ことを確認する
   - 登録ファイルはビルド時に XML スキーマで検証される
2. ラッパーを呼び出す JSSP を作成した場合は、プロジェクトの必須手順（`jssp-page-verifier` 等）で検証する
3. デプロイ後、**サーバを再起動**してから JSSP の画面で動作を確認する（登録ファイルはサーバ起動時に読み込まれる）

## 注意事項

- 登録されていない名前を JSSP から呼び出すと `ReferenceError: "{名前}" is not defined.` になる。この場合は登録ファイルのファイル名（モジュール ID の末尾）・配置先・`<api-class>` の完全修飾名と、サーバの再起動を確認する
- ラッパーから Java の例外がスローされると、JSSP 側では `try-catch` で捕捉でき、`e.name` は `JavaException`、`e.message` は `{例外クラスの完全修飾名}: {メッセージ}` になる。JSSP の画面にこのメッセージをそのまま表示すると内部情報が出るため、業務画面では一般化したメッセージに置き換えること
- ラッパークラスに業務ロジックを書き込まない。ラッパーは Java 側の処理の呼び出し口とし、Java 側の処理は Java のテストやスキルの規約に従って実装する
