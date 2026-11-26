# RAG 实现模式（Java 版）

使用 `VectorStore`/`ActionFactory` 实现 RAG（检索增强生成）的模式集合。方法的准确签名请参照 `reference/vectorstore-api-reference.md`/`reference/chat-action-api-reference.md`。

RAG 大致分为两个阶段。

1. **数据准备阶段**：对文档进行分块・向量化并登录到向量存储（由作业调度器定期执行）
2. **查询应答阶段**：对用户的提问检索向量存储，基于检索结果生成回答（通过 Assistant 实现）

## 模式 1：`Embedder` 适配器与 `Document` 的实现

由于平台不提供 `Embedder` 的默认实现，需要先准备一个包装 `EmbeddingsAction` 的适配器。

```java
import java.util.ArrayList;
import java.util.List;

import jp.co.intra_mart.foundation.copilot.action.ActionFactory;
import jp.co.intra_mart.foundation.copilot.action.embeddings.EmbeddingsAction;
import jp.co.intra_mart.foundation.copilot.action.embeddings.EmbeddingsOption;
import jp.co.intra_mart.foundation.copilot.exception.CopilotServiceActionException;
import jp.co.intra_mart.foundation.copilot.exception.CopilotServiceConfigurationException;
import jp.co.intra_mart.foundation.copilot.vectorstore.embedder.Embedder;
import jp.co.intra_mart.foundation.copilot.vectorstore.embedder.exception.EmbedderException;

public class EmbeddingsActionEmbedder implements Embedder {

    private final String modelName;

    public EmbeddingsActionEmbedder(final String modelName) {
        this.modelName = modelName;
    }

    @Override
    public List<Float> generate(final String text) throws EmbedderException {
        try {
            final EmbeddingsAction action = ActionFactory.getFactory().getEmbeddingsAction();
            final float[] vector = action.execute(text, EmbeddingsOption.builder().model(modelName).build());
            final List<Float> result = new ArrayList<>(vector.length);
            for (final float value : vector) {
                result.add(value);
            }
            return result;
        } catch (final CopilotServiceConfigurationException | CopilotServiceActionException e) {
            throw new EmbedderException(e.getMessage(), e);
        }
    }
}
```

要登录的文档（`Document`）也需自行实现。该类只保存各个字段，元数据通过 Jackson 转换为 JSON 字符串保存（因为 `Content.getMetadata()` 的约定是返回 JSON 字符串）。

```java
import java.io.IOException;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jp.co.intra_mart.foundation.copilot.vectorstore.document.Document;
import jp.co.intra_mart.foundation.copilot.vectorstore.document.exception.DocumentConversionException;

public class RegistrationDocument implements Document {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private String text;

    /** 元数据（JSON 字符串） */
    private String metadata;

    private List<Double> vector;

    private String originSourceId;

    private Map<String, Object> indexedMetadata;

    @Override
    public String getText() {
        return text;
    }

    @Override
    public void setText(final String text) {
        this.text = text;
    }

    @Override
    public String getMetadata() {
        return metadata;
    }

    @Override
    public <T> T getMetadata(final Class<T> type) throws DocumentConversionException {
        if (metadata == null) {
            return null;
        }
        try {
            return OBJECT_MAPPER.readValue(metadata, type);
        } catch (final IOException e) {
            throw new DocumentConversionException("无法转换元数据。type=" + type.getName(), e);
        }
    }

    @Override
    public void setMetadata(final Object metadata) throws DocumentConversionException {
        if (metadata == null) {
            this.metadata = null;
            return;
        }
        try {
            this.metadata = OBJECT_MAPPER.writeValueAsString(metadata);
        } catch (final JsonProcessingException e) {
            throw new DocumentConversionException("无法将元数据转换为 JSON。", e);
        }
    }

    @Override
    public List<Double> getVector() {
        return vector;
    }

    @Override
    public void setVector(final List<Double> vector) {
        this.vector = vector;
    }

    @Override
    public String getOriginSourceId() {
        return originSourceId;
    }

    @Override
    public void setOriginSourceId(final String originSourceId) {
        this.originSourceId = originSourceId;
    }

    @Override
    public Map<String, Object> getIndexedMetadata() {
        return indexedMetadata;
    }

    @Override
    public void setIndexedMetadata(final Map<String, Object> indexedMetadata) {
        this.indexedMetadata = indexedMetadata;
    }
}
```

## 模式 2：数据准备作业（文档的分块・向量化・登录）

```java
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.copilot.assistant.splitter.RecursiveCharacterTextSplitter;
import jp.co.intra_mart.foundation.copilot.assistant.splitter.TextSplitter;
import jp.co.intra_mart.foundation.copilot.vectorstore.VectorStore;
import jp.co.intra_mart.foundation.copilot.vectorstore.builder.VectorStoreBuilder;
import jp.co.intra_mart.foundation.copilot.vectorstore.document.Document;
import jp.co.intra_mart.foundation.copilot.vectorstore.embedder.Embedder;
import jp.co.intra_mart.foundation.job_scheduler.BaseJob;
import jp.co.intra_mart.foundation.job_scheduler.JobResult;
import jp.co.intra_mart.foundation.job_scheduler.exception.JobExecuteException;
import jp.co.intra_mart.foundation.service.client.file.PublicStorage;
import jp.co.intra_mart.foundation.service.client.file.Storage;
import jp.co.intra_mart.foundation.vectorstore.core.exception.VectorStoreException;

public class RagProcessingPipelineJob extends BaseJob {

    private static final Logger LOGGER = Logger.getLogger(RagProcessingPipelineJob.class);

    private static final String VECTOR_STORE_CATEGORY = "sample_rag";

    private static final String TEXT_EMBEDDING_MODEL_NAME = "text-embedding-3-small";

    @Override
    public JobResult execute() throws JobExecuteException {
        final int chunkOverlap = getParameterAsInteger("chunkOverlap", 100);
        final int chunkSize = getParameterAsInteger("chunkSize", 2000);
        final String storageRootPath = getParameter("storageRootPath");

        final Storage<?> parentStorage = new PublicStorage(storageRootPath);
        try {
            if (!parentStorage.exists() || !parentStorage.isDirectory()) {
                return JobResult.error("目标目录不存在: " + storageRootPath);
            }
        } catch (final IOException e) {
            return JobResult.error("访问目标目录失败: " + e.getLocalizedMessage());
        }

        // 分块器。方法名为 splitText（不是 split）
        final TextSplitter textSplitter = RecursiveCharacterTextSplitter.builder()
                .chunkOverlap(chunkOverlap)
                .chunkSize(chunkSize)
                .keepSeparator(false)
                .build();

        final VectorStore vectorStore;
        try {
            final Embedder embedder = new EmbeddingsActionEmbedder(TEXT_EMBEDDING_MODEL_NAME);
            // useDefault() 会重置 embedder 字段，因此必须在 embedder(...) 之前调用
            vectorStore = VectorStoreBuilder.builder()
                    .useDefault()
                    .category(VECTOR_STORE_CATEGORY)
                    .embedder(embedder)
                    .useScoreNormalize(true)
                    .build();
        } catch (final VectorStoreException e) {
            return JobResult.error("初始化向量存储失败: " + e.getLocalizedMessage());
        }

        try {
            // 全量重刷（重建索引）模式：先将目标类别全部删除
            vectorStore.deleteAll();

            // 实际的文档读取・文本提取需根据目标文件格式在应用侧自行实现
            // （从 PDF/Word/文本等提取文本不在平台范围内，详见「注意事项」）
            for (final String documentText : loadDocumentTexts(parentStorage)) {
                final List<String> chunkTexts = textSplitter.splitText(documentText);

                final List<Document> documents = new ArrayList<>();
                for (final String chunkText : chunkTexts) {
                    // RegistrationDocument 是模式 1 中实现的 Document
                    final Document document = new RegistrationDocument();
                    document.setText(chunkText);
                    documents.add(document);
                }
                vectorStore.add(documents);
            }
        } catch (final VectorStoreException e) {
            return JobResult.error("注册到向量存储失败: " + e.getLocalizedMessage());
        }

        LOGGER.info("Completed RAG processing pipeline job");
        return JobResult.success("RAG processing pipeline completed successfully");
    }

    private List<String> loadDocumentTexts(final Storage<?> parentStorage) {
        // 应用侧实现：遍历目录下的文件，返回各文件的文本
        throw new UnsupportedOperationException("实现示例中省略");
    }
}
```

- `getParameterAsInteger`/`getParameter` 是 `BaseJob` 提供的作业参数获取方法（与作业调度器定义 XML 中的 `<parameters>` 对应）
- 从支持全文检索的文件（PDF・Word・文本等）中提取文本本身，并非平台直接提供高层级 API 的领域，需根据目标文件格式在应用侧自行实现（详见「注意事项」）

## 模式 3：查询应答 Assistant（混合检索 + 流式回答）

```java
import java.util.ArrayList;
import java.util.List;

import jp.co.intra_mart.foundation.copilot.action.ActionFactory;
import jp.co.intra_mart.foundation.copilot.action.chat.ChatAction;
import jp.co.intra_mart.foundation.copilot.action.chat.ChatMessage;
import jp.co.intra_mart.foundation.copilot.action.chat.ChatOption;
import jp.co.intra_mart.foundation.copilot.assistant.AbstractCopilotAssistant;
import jp.co.intra_mart.foundation.copilot.assistant.AssistantType;
import jp.co.intra_mart.foundation.copilot.assistant.annotation.Assistant;
import jp.co.intra_mart.foundation.copilot.assistant.exception.CopilotAssistantException;
import jp.co.intra_mart.foundation.copilot.assistant.message.AssistantMessage;
import jp.co.intra_mart.foundation.copilot.assistant.model.AssistantParameter;
import jp.co.intra_mart.foundation.copilot.assistant.model.AssistantResult;
import jp.co.intra_mart.foundation.copilot.assistant.response.AssistantResponseWriter;
import jp.co.intra_mart.foundation.copilot.exception.CopilotServiceActionException;
import jp.co.intra_mart.foundation.copilot.exception.CopilotServiceConfigurationException;
import jp.co.intra_mart.foundation.copilot.vectorstore.VectorStore;
import jp.co.intra_mart.foundation.copilot.vectorstore.builder.VectorStoreBuilder;
import jp.co.intra_mart.foundation.copilot.vectorstore.document.ScoredDocument;
import jp.co.intra_mart.foundation.copilot.vectorstore.embedder.Embedder;
import jp.co.intra_mart.foundation.vectorstore.core.exception.VectorStoreException;

@Assistant(id = "rag_assistant", name = "RAG Assistant",
        type = AssistantType.STANDARD, listEnable = true, storeMessage = false)
public class RagAssistant extends AbstractCopilotAssistant<AssistantParameter> {

    private static final String VECTOR_STORE_CATEGORY = "sample_rag";

    private static final String TEXT_EMBEDDING_MODEL_NAME = "text-embedding-3-small";

    private static final int RETRIEVAL_COUNT = 3;

    @Override
    protected AssistantResult doExecute(final AssistantParameter parameter) throws CopilotAssistantException {
        if (parameter.getMessage() == null || parameter.getMessage().getContents() == null) {
            throw new CopilotAssistantException("message is required");
        }
        final String userMessage = String.valueOf(parameter.getMessage().getContents());

        final ChatAction chatAction;
        try {
            chatAction = ActionFactory.getFactory().getChatAction();
        } catch (final CopilotServiceConfigurationException e) {
            throw new CopilotAssistantException("获取聊天操作失败: " + e.getMessage(), e);
        }

        final List<ScoredDocument> searchResults;
        try {
            searchResults = searchVectorStore(userMessage);
        } catch (final VectorStoreException e) {
            throw new CopilotAssistantException("检索向量存储失败: " + e.getMessage(), e);
        }

        final StringBuilder context = new StringBuilder();
        for (final ScoredDocument document : searchResults) {
            context.append("## source:\n").append(document.getText()).append('\n');
        }

        final List<ChatMessage> messages = ChatMessage.builder()
                .newMessage().withRole("system").addTextContent("请参考以下检索结果回答用户的问题。\n" + context)
                .newMessage().withRole("user").addTextContent(userMessage)
                .build();

        final ChatOption option = ChatOption.builder().build();

        try (AssistantResponseWriter writer = getAssistantContext().getResponseWriter()) {
            final StringBuilder answer = new StringBuilder();
            chatAction.execute(messages, option, chunk -> {
                if (chunk.getDelta() != null && chunk.getDelta().getContent() != null) {
                    answer.append(chunk.getDelta().getContent());
                }
            });
            writer.writeResponse(AssistantResult.builder()
                    .message(new AssistantMessage("assistant", answer.toString()))
                    .finishReason("stop")
                    .build());
        } catch (final CopilotServiceActionException | java.io.IOException e) {
            // AssistantResponseWriter 是 AutoCloseable，且 close() 声明抛出 IOException，
            // 使用 try-with-resources 时也需要捕获这个异常
            throw new CopilotAssistantException("聊天执行失败: " + e.getMessage(), e);
        }

        return null;
    }

    private List<ScoredDocument> searchVectorStore(final String query) throws CopilotAssistantException, VectorStoreException {
        final Embedder embedder = new EmbeddingsActionEmbedder(TEXT_EMBEDDING_MODEL_NAME);

        final VectorStore vectorStore = VectorStoreBuilder.builder()
                .useDefault()
                .category(VECTOR_STORE_CATEGORY)
                .embedder(embedder)
                .useScoreNormalize(true)
                .build();

        // 不传入 Reranker 时，使用 RRF（Reciprocal Rank Fusion）整合结果
        return vectorStore.hybridSearch(query, RETRIEVAL_COUNT);
    }
}
```

- 参数类 `T` 使用 `AssistantParameter`（与 `java-im-copilot-agent-generator` 的 Assistant 注册约定相同。使用自定义 POJO 会导致聊天界面无法输入提示词）
- `hybridSearch(query, topK)` 内部会自动对查询文本进行向量化（使用 `Embedder`），调用方无需显式向量化
- 应使作业侧与 Assistant 侧的 `VectorStoreBuilder` 设置（`category`/`embedder`/`useScoreNormalize`）保持一致。不一致会导致类别错配或评分基准偏差

## 注意事项

- **`Document` 需自行实现（模式 1）。** `jp.co.intra_mart.system.*` 下的实现类属于非公开 API，不要使用
- **`TextSplitter` 的分割方法为 `splitText(String)`。** 不存在名为 `split(String)` 的方法
- **`VectorStoreBuilder.useDefault()` 应在 `embedder(...)` 之前调用。** 若之后调用，已设置的 `Embedder` 会被重置
- **平台不存在 `Embedder` 的默认实现。** 必须自行实现一个包装 `EmbeddingsAction` 的适配器（模式 1）
- **`AssistantResponseWriter` 的 `close()` 声明抛出 `IOException`。** 使用 try-with-resources 时，需要一并捕获隐式 `close()` 调用所产生的异常
- 从文件中提取文本（解析 PDF・Word 等）本身不在本技能所涉及的「向量存储・聊天动作」API 范围内，应使用现有的文档解析库，或平台提供的其他模块
- 向量存储的实际后端（Solr・关系数据库等）依赖于租户环境设置，应用实现侧无需关心。`list`/`count`/`scanAll`/`updateIndexedMetadataByOriginSourceId`/`deleteByOriginSourceId`（8.0.5〜）根据后端不同可能抛出 `UnsupportedOperationException`，使用前需确认目标环境的支持情况
