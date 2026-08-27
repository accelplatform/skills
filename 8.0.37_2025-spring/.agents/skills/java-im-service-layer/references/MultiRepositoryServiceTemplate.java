package {packageName}.domain.service;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.mirage.ext.session.SessionTemplate;

import {packageName}.domain.exception.RepositoryException;
import {packageName}.domain.exception.{ServiceName}ServiceException;
import {packageName}.domain.model.{EntityNameA};
import {packageName}.domain.model.{EntityNameB};
import {packageName}.domain.repository.{EntityNameA}Repository;
import {packageName}.domain.repository.{EntityNameA}RepositoryFactory;
import {packageName}.domain.repository.{EntityNameB}Repository;
import {packageName}.domain.repository.{EntityNameB}RepositoryFactory;

/**
 * 複数リポジトリを1トランザクションで操作するサービスのテンプレート。<br>
 * SessionTemplate.execute() 内で複数リポジトリを呼び出し、
 * 整合性のある一括操作を実現する。
 * @author {author}
 * @version {version}
 */
public class Standard{ServiceName}Service implements {ServiceName}Service {

    private static final Logger LOGGER = Logger.getLogger(Standard{ServiceName}Service.class);

    private final {EntityNameA}Repository {entityNameA}Repository;
    private final {EntityNameB}Repository {entityNameB}Repository;

    /**
     * デフォルトコンストラクタ。
     */
    public Standard{ServiceName}Service() {
        try {
            this.{entityNameA}Repository =
                    {EntityNameA}RepositoryFactory.getInstance().get{EntityNameA}Repository();
            this.{entityNameB}Repository =
                    {EntityNameB}RepositoryFactory.getInstance().get{EntityNameB}Repository();
        } catch (RepositoryException e) {
            throw new RuntimeException("リポジトリの初期化に失敗しました", e);
        }
    }

    /**
     * テスト用コンストラクタ。
     */
    Standard{ServiceName}Service(
            final {EntityNameA}Repository {entityNameA}Repository,
            final {EntityNameB}Repository {entityNameB}Repository) {
        this.{entityNameA}Repository = {entityNameA}Repository;
        this.{entityNameB}Repository = {entityNameB}Repository;
    }

    /**
     * 2つのリポジトリを1トランザクションで操作する例。<br>
     * SessionTemplate.execute() のラムダ内で両リポジトリを呼び出すことで、
     * 片方が失敗した場合は自動ロールバックされる。
     */
    @Override
    public void processWithBothEntities(final {EntityNameA} entityA, final {EntityNameB} entityB)
            throws {ServiceName}ServiceException {
        validateInput(entityA, entityB);

        try {
            SessionTemplate.execute(s -> {
                // 同一トランザクション内で2リポジトリを操作
                {entityNameA}Repository.save(entityA);
                {entityNameB}Repository.save(entityB);

                LOGGER.info("Processed both entities: "
                        + "{entityNameA}Id=" + entityA.get{EntityNameA}Id()
                        + ", {entityNameB}Id=" + entityB.get{EntityNameB}Id());
                return null;
            });
        } catch (RepositoryException e) {
            LOGGER.error("Failed to process entities", e);
            throw new {ServiceName}ServiceException(
                    "複数エンティティの処理に失敗しました: " + e.getMessage(), e);
        }
    }

    private void validateInput(final {EntityNameA} entityA, final {EntityNameB} entityB)
            throws {ServiceName}ServiceException {
        if (entityA == null) {
            throw new {ServiceName}ServiceException("{EntityNameA} が null です");
        }
        if (entityB == null) {
            throw new {ServiceName}ServiceException("{EntityNameB} が null です");
        }
    }
}
