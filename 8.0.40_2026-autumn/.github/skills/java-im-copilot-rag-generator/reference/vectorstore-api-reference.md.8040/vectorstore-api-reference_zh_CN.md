# 向量存储 API 参考（Java 版）

基于 `im_copilot`/`im_copilot_core` 模块（`jp.co.intra_mart.foundation.copilot.vectorstore.*`）的实际类定义。不要凭记忆或推测补充方法・属性。

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

- 按 `VectorStoreBuilder.builder()` → `useDefault()` → `category(...)` → `embedder(...)` → `useScoreNormalize(...)` → `build()` 的顺序调用
- **`useDefault()` 内部会将 `embedder` 字段重置为 `null`。** `embedder(...)` 必须在 `useDefault()` **之后**调用（先调用会被 `useDefault()` 覆盖清空）
- 类别（`category`）是同一向量存储内数据的逻辑划分。登录（`add`/`deleteAll`）・检索（`hybridSearch` 等）均限定在指定的类别范围内
- 登录到同一类别的向量应统一维度数。维度数决定了向量的存储列，若维度数混用，检索时无法命中其他维度的数据

## `VectorStore`

```java
package jp.co.intra_mart.foundation.copilot.vectorstore;

public interface VectorStore {
    void add(List<Document> documents) throws VectorStoreException;
    void deleteAll() throws VectorStoreException;

    // 8.0.3〜
    default void deleteByOriginSourceId(String originSourceId, boolean prefixMatch) throws VectorStoreException;

    // 8.0.5〜（带索引元数据的部分更新・合并）
    default void updateIndexedMetadataByOriginSourceId(String originSourceId,
            Map<String, Object> indexMetadataUpdates, List<String> deleteKeys) throws VectorStoreException;

    // 8.0.5〜（获取一览・获取件数・全件扫描）
    default List<ListedDocument> list(String originSourceId, String searchText, int limit, int offset) throws VectorStoreException;
    default long count(String originSourceId, String searchText) throws VectorStoreException;
    default void scanAll(String originSourceId, Consumer<? super ScannedDocument> consumer) throws VectorStoreException;

    // 代表性的重载（此外还存在 vector/query × keywords × operator × reranker × threshold × topK × filterGroups 的多种组合）
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

- **`add`**：将文档信息（分块）登录到向量数据库。当 `Document.getVector()` 未设置时，内部会使用 `VectorStoreBuilder.embedder(...)` 中指定的 `Embedder` 先进行向量化再登录
- **`deleteAll`**：删除 `VectorStoreBuilder.category(...)` 指定类别下的全部文档信息。重建索引（全量重刷）时，基本模式是先调用 `deleteAll()` 再调用 `add(...)`
- **`hybridSearch`**：组合向量相似检索与关键词检索，通过 `Reranker` 对结果进行整合（排序融合）。可通过 `query`（文本，内部自动向量化）或 `vector`（直接指定向量本体）两种方式之一调用。常用的三参数版本为 `hybridSearch(String query, Reranker reranker, Integer topK)`
- **`similaritySearch`**：仅向量相似检索（不含关键词检索）
- **`keywordSearch`**：仅关键词检索（不含向量检索）
- `topK` 为检索结果的最大件数，`ThresholdFilterExpression` 为基于评分阈值的过滤条件，`LogicalOperator` 为关键词之间的 `AND`/`OR` 指定
- 8.0.5 新增的 `list`/`count`/`scanAll`/`updateIndexedMetadataByOriginSourceId`/`deleteByOriginSourceId`，根据向量存储实现（Solr 等）不同均可能抛出 `UnsupportedOperationException`（因为 `default` 方法的默认实现设计为抛出不支持异常，实现方未重写的功能将无法使用）

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

`RegisterContent`/`ScoredContent`/`Content`（`jp.co.intra_mart.foundation.vectorstore.document`，由 `im_copilot_base` 模块提供）为基础接口，提供以下方法。

```java
public interface Content {
    String getMetadata(); // JSON 字符串
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

**无需自行实现 `Document`。** 平台提供标准实现 `jp.co.intra_mart.system.copilot.vectorstore.document.StandardRegistrationDocument`（`public` 无参构造函数 + 各类 setter，已实现 `Document` 的全部方法）。登录用途直接使用该实现即可。

```java
final Document document = new StandardRegistrationDocument();
document.setText(chunkText);
document.setMetadata(myMetadataObject); // 通过 Jackson 序列化为 JSON，可通过 getMetadata(Class) 还原
```

检索结果（`ScoredDocument`）直接使用平台返回的实例（无需自行实现）。相当于 `getText()`・`getMetadata(Class)` 的信息获取使用 `Content`/`ScoredContent` 的方法（由于 `ScoredDocument` 本身不具有 `getMetadata(Class)`，如有需要须自行对 `getMetadata()`（JSON 字符串）进行反序列化）。

## `Embedder`

```java
package jp.co.intra_mart.foundation.copilot.vectorstore.embedder;

public interface Embedder {
    List<Float> generate(String text) throws EmbedderException;
}
```

**平台不提供 `Embedder` 的默认实现。** 应用侧需要准备一个包装了 `jp.co.intra_mart.foundation.copilot.action.embeddings.EmbeddingsAction`（参见 `reference/chat-action-api-reference.md`）的轻量适配器（参见 `assets/rag-basic-usage.md`）。

## `Reranker`

```java
package jp.co.intra_mart.foundation.copilot.vectorstore.reranker;

public interface Reranker {
    List<? extends RewritableScoredContent> rerank(
            List<? extends RewritableScoredContent> documentList1,
            List<? extends RewritableScoredContent> documentList2) throws VectorStoreException;
}
```

平台提供基于 RRF（Reciprocal Rank Fusion）的标准实现。

```java
package jp.co.intra_mart.system.copilot.vectorstore.reranker;

public class StandardRrfReranker implements Reranker {
    public StandardRrfReranker(); // 无参构造函数
}
```

如 `VectorStore.hybridSearch(query, new StandardRrfReranker(), topK)` 所示，直接将其传入 `hybridSearch` 的 `reranker` 参数使用。

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
    // 构建器：.chunkSize(int) .chunkOverlap(int) .keepSeparator(boolean) .build()
}
```

- 分割文本的方法名为 **`splitText(String)`**，而非 `split(String)`（容易混淆，需注意）
- `chunkSize`/`chunkOverlap` 的默认值分别为 `4000`/`200`（`Builder.Default`）。未指定时采用该值
