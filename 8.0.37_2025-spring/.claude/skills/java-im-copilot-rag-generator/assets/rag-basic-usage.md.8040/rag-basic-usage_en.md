# RAG Implementation Patterns (Java Edition)

A collection of implementation patterns for RAG (Retrieval-Augmented Generation) using `VectorStore`/`ActionFactory`. For exact method signatures, refer to `reference/vectorstore-api-reference.md`/`reference/chat-action-api-reference.md`.

RAG is broadly divided into two phases.

1. **Data preparation phase**: Split and vectorize documents, then register them to the vector store (run periodically via the job scheduler)
2. **Query response phase**: Search the vector store for the user's question and generate an answer based on the search results (implemented via an Assistant)

## Pattern 1: Implementing an `Embedder` Adapter

Since the platform does not provide a default implementation of `Embedder`, first prepare an adapter wrapping `EmbeddingsAction`.

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

## Pattern 2: Data Preparation Job (Document Splitting, Vectorization, Registration)

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
import jp.co.intra_mart.system.copilot.vectorstore.document.StandardRegistrationDocument;

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
                return JobResult.error("対象ディレクトリが存在しません: " + storageRootPath);
            }
        } catch (final IOException e) {
            return JobResult.error("対象ディレクトリへのアクセスに失敗しました: " + e.getLocalizedMessage());
        }

        // Chunk splitter. The method name is splitText (not split)
        final TextSplitter textSplitter = RecursiveCharacterTextSplitter.builder()
                .chunkOverlap(chunkOverlap)
                .chunkSize(chunkSize)
                .keepSeparator(false)
                .build();

        final VectorStore vectorStore;
        try {
            final Embedder embedder = new EmbeddingsActionEmbedder(TEXT_EMBEDDING_MODEL_NAME);
            // useDefault() resets the embedder field, so it must always be called before embedder(...)
            vectorStore = VectorStoreBuilder.builder()
                    .useDefault()
                    .category(VECTOR_STORE_CATEGORY)
                    .embedder(embedder)
                    .useScoreNormalize(true)
                    .build();
        } catch (final VectorStoreException e) {
            return JobResult.error("ベクトルストアの初期化に失敗しました: " + e.getLocalizedMessage());
        }

        try {
            // Full rebuild (re-indexing) pattern: first delete everything in the target category
            vectorStore.deleteAll();

            // Actual document loading and text extraction should be implemented on the application side according to the target file format
            // (Text extraction from PDF/Word/text files, etc. is outside the platform's scope. See "Notes" for details)
            for (final String documentText : loadDocumentTexts(parentStorage)) {
                final List<String> chunkTexts = textSplitter.splitText(documentText);

                final List<Document> documents = new ArrayList<>();
                for (final String chunkText : chunkTexts) {
                    // StandardRegistrationDocument is the platform-provided standard implementation of Document
                    final Document document = new StandardRegistrationDocument();
                    document.setText(chunkText);
                    documents.add(document);
                }
                vectorStore.add(documents);
            }
        } catch (final VectorStoreException e) {
            return JobResult.error("ベクトルストアへの登録に失敗しました: " + e.getLocalizedMessage());
        }

        LOGGER.info("Completed RAG processing pipeline job");
        return JobResult.success("RAG processing pipeline completed successfully");
    }

    private List<String> loadDocumentTexts(final Storage<?> parentStorage) {
        // Implement on the application side: scan the files under the directory and return the text of each file
        throw new UnsupportedOperationException("実装例では省略");
    }
}
```

- `getParameterAsInteger`/`getParameter` are job parameter retrieval methods provided by `BaseJob` (corresponding to `<parameters>` in the job scheduler definition XML)
- Text extraction itself from files subject to full-text search (PDF, Word, text, etc.) is not an area for which the platform provides a direct high-level API, so implement it on the application side according to the target file format (see "Notes" for details)

## Pattern 3: Query Response Assistant (Hybrid Search + Streaming Answer)

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
import jp.co.intra_mart.system.copilot.vectorstore.reranker.StandardRrfReranker;

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
            throw new CopilotAssistantException("チャットアクションの取得に失敗しました: " + e.getMessage(), e);
        }

        final List<ScoredDocument> searchResults;
        try {
            searchResults = searchVectorStore(userMessage);
        } catch (final VectorStoreException e) {
            throw new CopilotAssistantException("ベクトルストアの検索に失敗しました: " + e.getMessage(), e);
        }

        final StringBuilder context = new StringBuilder();
        for (final ScoredDocument document : searchResults) {
            context.append("## source:\n").append(document.getText()).append('\n');
        }

        final List<ChatMessage> messages = ChatMessage.builder()
                .newMessage().withRole("system").addTextContent("以下の検索結果を参考にユーザの質問に回答してください。\n" + context)
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
            // AssistantResponseWriter is AutoCloseable, and its close() declares IOException,
            // so when using try-with-resources you must also catch this exception for the implicit close() call
            throw new CopilotAssistantException("チャット実行に失敗しました: " + e.getMessage(), e);
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

        return vectorStore.hybridSearch(query, new StandardRrfReranker(), RETRIEVAL_COUNT);
    }
}
```

- The parameter class `T` uses `AssistantParameter` (the same contract as the Assistant registration in `java-im-copilot-agent-generator` — a bespoke POJO leaves the chat UI unable to accept a prompt)
- `hybridSearch(query, reranker, topK)` automatically vectorizes the query text internally (using the `Embedder`), so the caller does not need to vectorize it explicitly
- Make sure the `VectorStoreBuilder` settings (`category`/`embedder`/`useScoreNormalize`) match between the job side and the Assistant side. A mismatch leads to category mix-ups or discrepancies in score criteria

## Notes

- **Do not implement `Document` yourself.** Use `StandardRegistrationDocument` (the platform-provided standard implementation) as-is
- **`TextSplitter`'s split method is `splitText(String)`.** There is no method named `split(String)`
- **Call `VectorStoreBuilder.useDefault()` before `embedder(...)`.** Calling it afterward resets the `Embedder` you set
- **There is no default implementation of `Embedder` in the platform.** You must always implement an adapter wrapping `EmbeddingsAction` yourself (Pattern 1)
- **`AssistantResponseWriter`'s `close()` declares `IOException`.** When using try-with-resources, you must also catch the exception from the implicit `close()` call
- Text extraction from files (parsing PDF, Word, etc.) itself is out of scope for the "vector store / chat action" API handled by this skill. Use an existing document parser library, or another module provided by the platform
- The vector store's actual backend (Solr, an RDB, etc.) depends on the tenant environment configuration and is not something the application implementation needs to be aware of. `list`/`count`/`scanAll`/`updateIndexedMetadataByOriginSourceId`/`deleteByOriginSourceId` (since 8.0.5) may throw `UnsupportedOperationException` depending on the backend, so check the support status in the target environment before use
