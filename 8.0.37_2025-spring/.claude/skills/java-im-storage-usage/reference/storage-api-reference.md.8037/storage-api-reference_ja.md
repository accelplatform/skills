# Storage API リファレンス（Java 版）

intra-mart Accel Platform コアソース（`im_core_base` モジュール）の実クラス定義に基づく。記憶や推測でメソッドを補わないこと。

## パッケージ構成

```
jp.co.intra_mart.foundation.service.client.file
├── Storage<T extends Storage<T>>          … インタフェース。全 I/O メソッドを定義
├── AbstractStorage<T extends Storage<T>>  … Storage の共通実装（delegate へ委譲）
├── PublicStorage extends AbstractStorage<PublicStorage>
├── SessionScopeStorage extends AbstractStorage<SessionScopeStorage>
├── SystemStorage extends AbstractStorage<SystemStorage>
├── SynchronizedPublicStorage / SynchronizedSystemStorage  … 同期版（マルチスレッド排他制御が必要な場合のみ）
├── AbstractSynchronizedStorage
└── StoragenameFilter / StorageFilter      … list/listStorages のフィルタ用インタフェース
```

`PublicStorage` / `SessionScopeStorage` / `SystemStorage` は 3 クラスとも `AbstractStorage` を継承し、実際の I/O 処理は内部の `delegate`（リフレクションで生成される実装クラス）に委譲される。**アプリケーションコードから `delegate` を直接扱うことはない。**3クラスの違いはコンストラクタで解決される「ルートパス」のみ。

## コンストラクタ

### PublicStorage

```java
// storage/public 配下
public PublicStorage(CharSequence path)
public PublicStorage(CharSequence parent, CharSequence child)
public PublicStorage(PublicStorage parent, CharSequence child)
```

内部で `new StorageInformation().getPublicStorageRootPath()` をルートパスとして解決する。

### SystemStorage

```java
// storage/system 配下
public SystemStorage(CharSequence path)
public SystemStorage(CharSequence parent, CharSequence child)
public SystemStorage(SystemStorage parent, CharSequence child)
```

内部で `new StorageInformation().getSystemStorageRootPath()` をルートパスとして解決する。

### SessionScopeStorage

```java
// セッションID単位の一時領域配下
public SessionScopeStorage(CharSequence path)
public SessionScopeStorage(CharSequence parent, CharSequence child)
public SessionScopeStorage(SessionScopeStorage parent, CharSequence child)
```

内部でルートパスを動的に決定する：
1. `SessionAttributeResolver` にセッションスコープストレージ使用フラグ（`SessionScopeStorage.class.getName() + ".useStorage"`）を立てる
2. `SessionIdResolver.get().resolve()` でセッションIDを取得
3. `SessionScopeStorageResolver`（SPI）が登録されていればそちらのルートパスを優先
4. なければ `StorageInformation` の一時領域ルートパス + セッションID を使う

**呼び出し側でセッションIDやリゾルバを意識する必要はない。** コンストラクタを呼ぶだけで、実行中のリクエストに紐づくセッション専用領域が自動的に解決される。

## Storage&lt;T&gt; インタフェースの共通定数

| 定数 | 型 | 内容 |
|------|-----|------|
| `FILE_SEPARATOR_CHAR` | `char` | ファイルセパレータ文字。**常に `'/'` 固定**（`jp.co.intra_mart.system.service.client.file.StorageInformation` で `public static final char FILE_SEPARATOR_CHAR = '/';` と定義され、`Storage<T>` が再公開） |
| `FILE_SEPARATOR` | `String` | ファイルセパレータ文字列。**常に `"/"` 固定**（`String.valueOf(FILE_SEPARATOR_CHAR)`） |
| `CHARSET` | `Charset` | プラットフォーム設定に基づく既定キャラセット |

### パス区切り文字に関する注意（実装時必読）

- Storage API のパス区切り文字は **OS に依存せず常に `/`**。実行環境が Windows でも `\` にはならない
- **Java 標準の `File.separator` / `File.separatorChar`（OS 依存）は使用しないこと。** 誤って使うと Windows 環境で意図しないパスになる
- パスを組み立てる際は、区切り文字を直接扱わずに済む **`PublicStorage(parent, child)` 等の2引数コンストラクタ**を優先する
- 文字列結合でパスを組み立てる必要がある場合は、`"/"` をハードコードせず `Storage.FILE_SEPARATOR` 定数を使う

## メソッド一覧

すべて `throws IOException`（`getName()` / `getParent()` / `getPath()` / `equals()` / `hashCode()` / `compareTo()` を除く）。

### パス・属性取得

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `getName()` | `String` | このストレージが示すファイル/ディレクトリの名前 |
| `getPath()` | `String` | パス名文字列 |
| `getParent()` | `String` | 親パス |
| `getCanonicalPath()` | `String` | 正規化したパス（`.` `..` を解釈、先頭・末尾セパレータをトリム） |
| `getRelativePath(T target)` | `String` | このストレージと `target` との相対パス |
| `getRootStorage()` | `T` | ルートストレージ |
| `getParentStorage()` | `T`（このストレージがルートなら `null`） | 親ストレージ |
| `resolve(CharSequence other)` | `T` | このストレージからの相対ストレージ |

### 存在確認・種別判定

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `exists()` | `boolean` | ファイル/ディレクトリが存在するか |
| `isDirectory()` | `boolean` | ディレクトリか |
| `isFile()` | `boolean` | 普通のファイルか |
| `lastModified()` | `long` | 最終更新時刻（エポックミリ秒。存在しない場合 `0L`） |
| `length()` | `long` | ファイルサイズ（バイト。存在しない場合 `0L`） |

### 一覧取得

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `list()` | `Collection<String>` | 配下のファイル＋ディレクトリの相対パス（非再帰。`list(false)` と同義） |
| `list(boolean recursive)` | `Collection<String>` | 同上（再帰指定可） |
| `list(StoragenameFilter<T> filter)` | `Collection<String>` | フィルタ条件を満たすもののみ（非再帰） |
| `listStorages()` / `listStorages(boolean)` / `listStorages(StoragenameFilter<T>)` / `listStorages(StorageFilter<T>)` | `Collection<T>` | 上記の `Storage` オブジェクト版 |
| `directories()` / `directories(boolean recursive)` | `Collection<String>` | 配下のディレクトリのみ |
| `directoriesStorages()` / `directoriesStorages(boolean)` | `Collection<T>` | 同上の `Storage` オブジェクト版 |
| `files()` / `files(boolean recursive)` | `Collection<String>` | 配下のファイルのみ |
| `filesStorages()` / `filesStorages(boolean)` | `Collection<T>` | 同上の `Storage` オブジェクト版 |

いずれも「このストレージがディレクトリを示さない場合、または空の場合」は空コレクションまたは `null` を返す（メソッドにより異なるので個別 JavaDoc に留意）。

### 読み込み

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `read()` | `String` | 標準キャラセットで内容を文字列取得 |
| `read(String charsetName)` | `String` | 指定キャラセット名で取得 |
| `read(Charset charset)` | `String` | 指定 `Charset` で取得 |
| `load()` | `byte[]` | 内容をバイト配列で取得 |
| `open()` | `InputStream` | 入力ストリームを取得。**呼び出し側でクローズ必須** |

### 書き込み

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `write(CharSequence src)` | `void` | 標準キャラセットで書き込み（上書き） |
| `write(CharSequence src, String charsetName)` | `void` | 指定キャラセット名で書き込み |
| `write(CharSequence src, Charset charset)` | `void` | 指定 `Charset` で書き込み |
| `save(byte[] byteArray)` | `void` | バイト配列を書き込み |
| `append(CharSequence src)` / `append(CharSequence src, String charsetName)` / `append(CharSequence src, Charset charset)` | `void` | 文字列を追記 |
| `create()` | `OutputStream` | 出力ストリームを取得（新規/上書き）。**呼び出し側でクローズ必須** |
| `append()` | `OutputStream` | 出力ストリームを追記モードで取得。**呼び出し側でクローズ必須** |

### ディレクトリ・ファイル操作

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `makeDirectories()` | `boolean` | 必要な親ディレクトリを含めてディレクトリを作成 |
| `move(CharSequence newPath)` | `boolean` | ファイル/ディレクトリを移動 |
| `remove()` | `boolean` | 削除（非再帰） |
| `remove(boolean recursive)` | `boolean` | 削除（`true` で再帰削除） |
| `copy(T to, boolean overwrite)` | `void` | `to` へコピー。ディレクトリの場合はマージ的に動作（詳細は JavaDoc の分岐仕様を参照。同名フォルダの扱い等に注意） |

### 比較

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `compareTo(T storage)` | `int` | 語彙的比較（`Comparable` 実装） |
| `equals(Object obj)` | `boolean` | 等価判定 |
| `hashCode()` | `int` | ハッシュコード |

## `copy()` の分岐仕様（原文 JavaDoc 要約）

- このインスタンスが存在しない場合: `IOException`（`FileNotFoundException`）
- このインスタンスがファイルの場合
  - `to` が存在しない: `to` へコピー
  - `to` がファイル: `overwrite` 引数に従う
  - `to` がディレクトリ: `IOException`
- このインスタンスがディレクトリの場合
  - `to` が存在しない: `to` ディレクトリを作成してコピー
  - `to` がファイル: `IOException`
  - `to` がディレクトリかつ配下にファイル/フォルダが存在: `overwrite` に従う（同名階層のフォルダが存在する場合は `IOException`）
  - `to` がディレクトリかつ配下が空: そのままコピー
  - `to` 側に、コピー元と一致しないファイルが存在する場合: 何もしない（マージ動作。削除したい場合は事前に `to` 側で `remove(true)` を呼ぶ）
