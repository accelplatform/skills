# Vector Store API Reference (Java Edition)

Based on the actual class definitions of the `im_copilot`/`im_copilot_core` modules (`jp.co.intra_mart.foundation.copilot.vectorstore.*`). Do not supplement methods/attributes from memory or guesswork.

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

- Call in the order `VectorStoreBuilder.builder()` → `useDefault()` → `category(...)` → `embedder(...)` → `useScoreNormalize(...)` → `build()`
- **`useDefault()` resets the `embedder` field to `null` internally.** Always call `embedder(...)` **after** `useDefault()` (calling it before means it gets wiped out by `useDefault()`)
- The category (`category`) is a logical partition of data within the same vector store. Both registration (`add`/`deleteAll`) and search (`hybridSearch`, etc.) are scoped to the specified category
- Vectors registered under the same category must have a uniform dimensionality. The dimensionality determines which storage column the vector is stored in, so if dimensionality is mixed, a search will not hit data of a different dimensionality

## `VectorStore`

```java
package jp.co.intra_mart.foundation.copilot.vectorstore;

public interface VectorStore {
    void add(List<Document> documents) throws VectorStoreException;
    void deleteAll() throws VectorStoreException;

    // Since 8.0.3
    default void deleteByOriginSourceId(String originSourceId, boolean prefixMatch) throws VectorStoreException;

    // Since 8.0.5 (partial update/merge of indexed metadata)
    default void updateIndexedMetadataByOriginSourceId(String originSourceId,
            Map<String, Object> indexMetadataUpdates, List<String> deleteKeys) throws VectorStoreException;

    // Since 8.0.5 (listing, count, and full scan)
    default List<ListedDocument> list(String originSourceId, String searchText, int limit, int offset) throws VectorStoreException;
    default long count(String originSourceId, String searchText) throws VectorStoreException;
    default void scanAll(String originSourceId, Consumer<? super ScannedDocument> consumer) throws VectorStoreException;

    // Representative overload (many other combinations of vector/query × keywords × operator × reranker × threshold × topK × filterGroups also exist)
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

- **`add`**: Registers document information (chunks) to the vector database. If `Document.getVector()` is unset, it is vectorized internally using the `Embedder` specified via `VectorStoreBuilder.embedder(...)` before being registered
- **`deleteAll`**: Deletes all document information in the category specified by `VectorStoreBuilder.category(...)`. When re-indexing (a full rebuild), the basic pattern is to call `add(...)` after `deleteAll()`
- **`hybridSearch`**: Combines vector similarity search and keyword search, then merges the results (rank fusion) with a `Reranker`. Call it via either the `query` (text, automatically vectorized internally) or `vector` (the vector itself specified directly) family of overloads. The commonly used 3-argument version is `hybridSearch(String query, Reranker reranker, Integer topK)`
- **`similaritySearch`**: Vector similarity search only (no keyword search)
- **`keywordSearch`**: Keyword search only (no vector search)
- `topK` is the maximum number of search results, `ThresholdFilterExpression` is a filter by score threshold, and `LogicalOperator` specifies `AND`/`OR` between keywords
- `list`/`count`/`scanAll`/`updateIndexedMetadataByOriginSourceId`/`deleteByOriginSourceId`, added in 8.0.5, may all throw `UnsupportedOperationException` depending on the vector store implementation (Solr, etc.) — since the `default` methods' default implementations throw an unsupported exception by design, a feature not overridden by the implementation cannot be used

## `Document`/`ScoredDocument`

```java
package jp.co.intra_mart.foundation.copilot.vectorstore.document;

public interface Document extends RegisterContent {
    <T> T getMetadata(Class<T> clazz) throws DocumentConversionException;
    void setMetadata(Object metadata) throws DocumentConversionException;
    void setText(String text);
    void setVector(List<Double> vector);
    default void setOriginSourceId(String originSourceId); // Since 8.0.3
    default void setIndexedMetadata(Map<String, Object> indexedMetadata); // Since 8.0.5
}

public interface ScoredDocument extends ScoredContent {
    Map<String, Object> getIndexedMetadata(); // Since 8.0.5
}
```

`RegisterContent`/`ScoredContent`/`Content` (`jp.co.intra_mart.foundation.vectorstore.document`, provided by the `im_copilot_base` module) are the base interfaces, providing the following methods.

```java
public interface Content {
    String getMetadata(); // JSON string
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

**There is no need to implement `Document` yourself.** The platform provides a standard implementation, `jp.co.intra_mart.system.copilot.vectorstore.document.StandardRegistrationDocument` (a `public` no-argument constructor plus various setters, with all of `Document`'s methods implemented). Use it as-is for registration purposes.

```java
final Document document = new StandardRegistrationDocument();
document.setText(chunkText);
document.setMetadata(myMetadataObject); // JSON-serialized by Jackson and restorable via getMetadata(Class)
```

For search results (`ScoredDocument`), use the instance returned by the platform as-is (no need to implement it yourself). Retrieve equivalent information to `getText()`/`getMetadata(Class)` via the `Content`/`ScoredContent` methods (since `ScoredDocument` itself does not have `getMetadata(Class)`, if needed you must deserialize `getMetadata()` (a JSON string) yourself).

## `Embedder`

```java
package jp.co.intra_mart.foundation.copilot.vectorstore.embedder;

public interface Embedder {
    List<Float> generate(String text) throws EmbedderException;
}
```

**The platform does not provide a default implementation of `Embedder`.** On the application side, you need to prepare a thin adapter wrapping `jp.co.intra_mart.foundation.copilot.action.embeddings.EmbeddingsAction` (see `reference/chat-action-api-reference.md`) (see `assets/rag-basic-usage.md`).

## `Reranker`

```java
package jp.co.intra_mart.foundation.copilot.vectorstore.reranker;

public interface Reranker {
    List<? extends RewritableScoredContent> rerank(
            List<? extends RewritableScoredContent> documentList1,
            List<? extends RewritableScoredContent> documentList2) throws VectorStoreException;
}
```

The platform provides a standard implementation based on RRF (Reciprocal Rank Fusion).

```java
package jp.co.intra_mart.system.copilot.vectorstore.reranker;

public class StandardRrfReranker implements Reranker {
    public StandardRrfReranker(); // No-argument constructor
}
```

Pass it directly to `hybridSearch`'s `reranker` argument, as in `VectorStore.hybridSearch(query, new StandardRrfReranker(), topK)`.

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
    // Builder: .chunkSize(int) .chunkOverlap(int) .keepSeparator(boolean) .build()
}
```

- The method name for splitting text is **`splitText(String)`**, not `split(String)` (easy to mix up, so watch out)
- The default values for `chunkSize`/`chunkOverlap` are `4000`/`200` respectively (`Builder.Default`). These values are used when left unspecified
