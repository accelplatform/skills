# RAG 実装パターン（Java 版）

`VectorStore`/`ActionFactory` を使った RAG（検索拡張生成）の実装パターン集。メソッドの正確なシグネチャは `reference/vectorstore-api-reference.md`/`reference/chat-action-api-reference.md` を参照すること。

RAG は大きく2つのフェーズに分かれる。

1. **データ準備フェーズ**: 文書を分割・ベクトル化してベクトルストアへ登録する（ジョブスケジューラで定期実行）
2. **クエリ応答フェーズ**: ユーザの質問に対しベクトルストアを検索し、検索結果を踏まえて回答を生成する（Assistant で実装）

## パターン1: `Embedder` アダプタの実装

プラットフォームは `Embedder` の既定実装を提供しないため、`EmbeddingsAction` をラップするアダプタをまず用意する。

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

## パターン2: データ準備ジョブ（文書の分割・ベクトル化・登録）

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

        // チャンク分割器。メソッド名は splitText（split ではない）
        final TextSplitter textSplitter = RecursiveCharacterTextSplitter.builder()
                .chunkOverlap(chunkOverlap)
                .chunkSize(chunkSize)
                .keepSeparator(false)
                .build();

        final VectorStore vectorStore;
        try {
            final Embedder embedder = new EmbeddingsActionEmbedder(TEXT_EMBEDDING_MODEL_NAME);
            // useDefault() は embedder フィールドをリセットするため、必ず embedder(...) より前に呼ぶ
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
            // 全件洗い替え（再インデックス）のパターン：まず対象カテゴリを全削除
            vectorStore.deleteAll();

            // 実際のドキュメント読み込み・テキスト抽出は、対象ファイル形式に応じてアプリ側で実装する
            // （PDF/Word/テキスト等からのテキスト抽出はプラットフォームの範囲外。詳細は「注意事項」参照）
            for (final String documentText : loadDocumentTexts(parentStorage)) {
                final List<String> chunkTexts = textSplitter.splitText(documentText);

                final List<Document> documents = new ArrayList<>();
                for (final String chunkText : chunkTexts) {
                    // StandardRegistrationDocument はプラットフォーム提供の Document 標準実装
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
        // アプリ側で実装：ディレクトリ配下のファイルを走査し、各ファイルのテキストを返す
        throw new UnsupportedOperationException("実装例では省略");
    }
}
```

- `getParameterAsInteger`/`getParameter` は `BaseJob` の提供するジョブパラメータ取得メソッド（ジョブスケジューラ定義XMLの `<parameters>` と対応する）
- 全文検索対応のファイル（PDF・Word・テキスト等）からのテキスト抽出自体はプラットフォームが直接の高水準APIを提供する領域ではないため、対象ファイル形式に応じてアプリ側で実装する（詳細は「注意事項」参照）

## パターン3: クエリ応答 Assistant（ハイブリッド検索 + ストリーミング回答）

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
            // AssistantResponseWriter は AutoCloseable であり close() が IOException を宣言するため、
            // try-with-resources を使う場合はこの例外もあわせて捕捉する必要がある
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

- パラメータクラス `T` は `AssistantParameter` を使う（`java-im-copilot-agent-generator` の Assistant 登録の契約と同一。独自 POJO にするとチャットUIでプロンプトを入力できなくなる）
- `hybridSearch(query, reranker, topK)` は内部でクエリテキストを自動的にベクトル化する（`Embedder` を使う）ため、呼び出し側で明示的にベクトル化する必要はない
- ジョブ側とAssistant側で `VectorStoreBuilder` の設定（`category`/`embedder`/`useScoreNormalize`）を一致させること。不一致があるとカテゴリの取り違えやスコア基準のズレにつながる

## 注意事項

- **`Document` は自前実装しない。** `StandardRegistrationDocument`（プラットフォーム提供の標準実装）をそのまま使う
- **`TextSplitter` の分割メソッドは `splitText(String)`。** `split(String)` という名前のメソッドは存在しない
- **`VectorStoreBuilder.useDefault()` は `embedder(...)` より先に呼ぶこと。** 後から呼ぶと設定した `Embedder` がリセットされる
- **`Embedder` の既定実装はプラットフォームに存在しない。** `EmbeddingsAction` をラップしたアダプタ（パターン1）を必ず自前実装する
- **`AssistantResponseWriter` は `close()` が `IOException` を宣言する。** try-with-resources で使う場合、暗黙の `close()` 呼び出し分の例外も catch する必要がある
- ファイルからのテキスト抽出（PDF・Word等のパース）自体は、本スキルが扱う「ベクトルストア・チャットアクション」API の範囲外。既存の文書パーサライブラリ、またはプラットフォームが提供する別モジュールを利用すること
- ベクトルストアの実バックエンド（Solr・RDB等）はテナント環境設定に依存し、アプリ実装側では意識しない。`list`/`count`/`scanAll`/`updateIndexedMetadataByOriginSourceId`/`deleteByOriginSourceId`（8.0.5〜）はバックエンドによっては `UnsupportedOperationException` になりうるため、利用前に対象環境での対応状況を確認すること
