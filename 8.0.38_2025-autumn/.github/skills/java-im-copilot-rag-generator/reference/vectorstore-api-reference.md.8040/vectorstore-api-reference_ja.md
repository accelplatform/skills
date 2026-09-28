# ベクトルストア API リファレンス（Java 版）

`im_copilot`/`im_copilot_core` モジュール（`jp.co.intra_mart.foundation.copilot.vectorstore.*`）の実クラス定義に基づく。記憶や推測でメソッド・属性を補わないこと。

## `VectorStoreBuilder`

```java
package jp.co.intra_mart.foundation.copilot.vectorstore.builder;

public final class VectorStoreBuilder {
    public static VectorStoreBuilder builder() throws VectorStoreException;
    public VectorStore build() throws VectorStoreException;
    public VectorStoreBuilder category(String category) throws VectorStoreException;
    public VectorStoreBuilder embedder(Embedder embedder) throws VectorStoreException;
    public VectorStoreBuilder locale(Locale locale) throws VectorStoreException;
    public VectorStoreBuilder useDefault() throws VectorStoreException;
    public VectorStoreBuilder useScoreNormalize(boolean useScoreNormalize) throws VectorStoreException;
}
```

- `VectorStoreBuilder.builder()` → `useDefault()` → `category(...)` → `embedder(...)` → `useScoreNormalize(...)` → `build()` の順で呼び出す
- **`useDefault()` は内部で `embedder` フィールドを `null` にリセットする。** `embedder(...)` は必ず `useDefault()` の**後**に呼び出すこと（先に呼ぶと `useDefault()` で握りつぶされる）
- カテゴリ（`category`）は同一ベクトルストア内でのデータの論理的な区分。登録（`add`/`deleteAll`）・検索（`hybridSearch` 等）はいずれも指定したカテゴリの範囲に閉じる
- 同一カテゴリに登録するベクトルは次元数を統一すること。次元数はベクトルの格納先列を決めるため、次元数混在時は検索で他次元のデータがヒットしない

## `VectorStore`

```java
package jp.co.intra_mart.foundation.copilot.vectorstore;

public interface VectorStore {
    void add(List<Document> documents) throws VectorStoreException;
    void deleteAll() throws VectorStoreException;

    // 8.0.3〜
    default void deleteByOriginSourceId(String originSourceId, boolean prefixMatch) throws VectorStoreException;

    // 8.0.5〜（インデックス付きメタデータの部分更新・マージ）
    default void updateIndexedMetadataByOriginSourceId(String originSourceId,
            Map<String, Object> indexMetadataUpdates, List<String> deleteKeys) throws VectorStoreException;

    // 8.0.5〜（一覧取得・件数取得・全件走査）
    default List<ListedDocument> list(String originSourceId, String searchText, int limit, int offset) throws VectorStoreException;
    default long count(String originSourceId, String searchText) throws VectorStoreException;
    default void scanAll(String originSourceId, Consumer<? super ScannedDocument> consumer) throws VectorStoreException;

    // 代表的なオーバーロード（他に vector/query × keywords × operator × reranker × threshold × topK × filterGroups の組み合わせが多数存在）
    List<ScoredDocument> hybridSearch(String query, List<String> keywords, LogicalOperator operator,
            Reranker reranker, ThresholdFilterExpression threshold, Integer topK) throws VectorStoreException;
    default List<ScoredDocument> hybridSearch(String query, Reranker reranker, Integer topK) throws VectorStoreException;
    default List<ScoredDocument> hybridSearch(String query) throws VectorStoreException;

    List<ScoredDocument> keywordSearch(List<String> keywords, LogicalOperator operator,
            ThresholdFilterExpression threshold, Integer topK) throws VectorStoreException;
    default List<ScoredDocument> keywordSearch(String keyword) throws VectorStoreException;

    List<ScoredDocument> similaritySearch(List<Double> vector, ThresholdFilterExpression threshold, Integer topK) throws VectorStoreException;
    List<ScoredDocument> similaritySearch(String query, ThresholdFilterExpression threshold, Integer topK) throws VectorStoreException;
    default List<ScoredDocument> similaritySearch(String query) throws VectorStoreException;
}
```

- **`add`**: 文書情報（チャンク）をベクトルデータベースに登録する。`Document.getVector()` が未設定の場合、内部で `VectorStoreBuilder.embedder(...)` に指定した `Embedder` を使ってベクトル化してから登録する
- **`deleteAll`**: `VectorStoreBuilder.category(...)` で指定したカテゴリの文書情報を全件削除する。再インデックス（全件洗い替え）時は `deleteAll()` の後に `add(...)` を呼ぶパターンが基本
- **`hybridSearch`**: ベクトル類似検索とキーワード検索を組み合わせ、`Reranker` で結果を統合（ランク融合）する。`query`（テキスト、内部で自動ベクトル化）または `vector`（ベクトル本体を直接指定）のいずれかの系統で呼び出す。よく使う3引数版は `hybridSearch(String query, Reranker reranker, Integer topK)`
- **`similaritySearch`**: ベクトル類似検索のみ（キーワード検索なし）
- **`keywordSearch`**: キーワード検索のみ（ベクトル検索なし）
- `topK` は検索結果の最大件数、`ThresholdFilterExpression` はスコアしきい値によるフィルタ、`LogicalOperator` はキーワード同士の `AND`/`OR` 指定
- 8.0.5 で追加された `list`/`count`/`scanAll`/`updateIndexedMetadataByOriginSourceId`/`deleteByOriginSourceId` は、いずれもベクトルストア実装（Solr 等）によっては `UnsupportedOperationException` になりうる（`default` メソッドの既定実装が未サポート例外を投げる設計のため、実装側でオーバーライドされていない機能は使えない）

## `Document`/`ScoredDocument`

```java
package jp.co.intra_mart.foundation.copilot.vectorstore.document;

public interface Document extends RegisterContent {
    <T> T getMetadata(Class<T> clazz) throws DocumentConversionException;
    void setMetadata(Object metadata) throws DocumentConversionException;
    void setText(String text);
    void setVector(List<Double> vector);
    default void setOriginSourceId(String originSourceId); // 8.0.3〜
    default void setIndexedMetadata(Map<String, Object> indexedMetadata); // 8.0.5〜
}

public interface ScoredDocument extends ScoredContent {
    Map<String, Object> getIndexedMetadata(); // 8.0.5〜
}
```

`RegisterContent`/`ScoredContent`/`Content`（`jp.co.intra_mart.foundation.vectorstore.document`、`im_copilot_base` モジュール提供）が基底インタフェースで、以下のメソッドを提供する。

```java
public interface Content {
    String getMetadata(); // JSON文字列
    String getText();
    String getOriginSourceId();
    Map<String, Object> getIndexedMetadata();
}
public interface RegisterContent extends Content {
    List<Double> getVector();
}
public interface ScoredContent extends Content {
    String getId();
    Double getScore();
}
```

**`Document` を自前実装する必要はない。** プラットフォームが標準実装 `jp.co.intra_mart.system.copilot.vectorstore.document.StandardRegistrationDocument`（`public` 引数なしコンストラクタ + 各種 setter、`Document` の全メソッドを実装済み）を提供している。登録用途はこれをそのまま使う。

```java
final Document document = new StandardRegistrationDocument();
document.setText(chunkText);
document.setMetadata(myMetadataObject); // Jackson でJSONシリアライズされ getMetadata(Class) で復元可能
```

検索結果（`ScoredDocument`）はプラットフォームが返すインスタンスをそのまま使う（自前実装は不要）。`getText()`・`getMetadata(Class)` 相当の情報取得は `Content`/`ScoredContent` のメソッドで行う（`ScoredDocument` 自体は `getMetadata(Class)` を持たないため、必要な場合は `getMetadata()`（JSON文字列）を自前でデシリアライズする）。

## `Embedder`

```java
package jp.co.intra_mart.foundation.copilot.vectorstore.embedder;

public interface Embedder {
    List<Float> generate(String text) throws EmbedderException;
}
```

**プラットフォームは `Embedder` の既定実装を提供しない。** アプリ側で `jp.co.intra_mart.foundation.copilot.action.embeddings.EmbeddingsAction`（`reference/chat-action-api-reference.md` 参照）をラップした薄いアダプタを用意する（`assets/rag-basic-usage.md` 参照）。

## `Reranker`

```java
package jp.co.intra_mart.foundation.copilot.vectorstore.reranker;

public interface Reranker {
    List<? extends RewritableScoredContent> rerank(
            List<? extends RewritableScoredContent> documentList1,
            List<? extends RewritableScoredContent> documentList2) throws VectorStoreException;
}
```

プラットフォームは RRF（Reciprocal Rank Fusion）による標準実装を提供する。

```java
package jp.co.intra_mart.system.copilot.vectorstore.reranker;

public class StandardRrfReranker implements Reranker {
    public StandardRrfReranker(); // 引数なしコンストラクタ
}
```

`VectorStore.hybridSearch(query, new StandardRrfReranker(), topK)` のように、`hybridSearch` の `reranker` 引数へそのまま渡して使う。

## `TextSplitter`/`RecursiveCharacterTextSplitter`

```java
package jp.co.intra_mart.foundation.copilot.assistant.splitter;

public abstract class TextSplitter {
    public abstract List<String> splitText(String text);
}
```

```java
package jp.co.intra_mart.foundation.copilot.assistant.splitter;

// Lombok @SuperBuilder
public class RecursiveCharacterTextSplitter extends TextSplitter {
    public static RecursiveCharacterTextSplitterBuilder<?, ?> builder();
    // ビルダー: .chunkSize(int) .chunkOverlap(int) .keepSeparator(boolean) .build()
}
```

- テキストを分割するメソッド名は **`splitText(String)`** であり、`split(String)` ではない（取り違えやすいので注意）
- `chunkSize`/`chunkOverlap` の既定値はそれぞれ `4000`/`200`（`Builder.Default`）。未指定時はこの値になる
