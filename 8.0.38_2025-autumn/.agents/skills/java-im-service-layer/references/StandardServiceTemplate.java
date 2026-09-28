package {packageName}.domain.service;

import java.util.List;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.mirage.ext.session.SessionTemplate;

import {packageName}.domain.exception.RepositoryException;
import {packageName}.domain.exception.{ServiceName}ServiceException;
import {packageName}.domain.model.{EntityName};
import {packageName}.domain.repository.{EntityName}Repository;
import {packageName}.domain.repository.{EntityName}RepositoryFactory;
import {packageName}.infrastructure.dao.{EntityName}SearchCriteria;

/**
 * {ServiceName}サービスの標準実装。<br>
 * ビジネスロジックを実装し、リポジトリ操作をオーケストレーションする。
 * @author {author}
 * @version {version}
 */
public class Standard{ServiceName}Service implements {ServiceName}Service {

    private static final Logger LOGGER = Logger.getLogger(Standard{ServiceName}Service.class);

    private final {EntityName}Repository {entityName}Repository;

    // ========== コンストラクタ ==========

    /**
     * デフォルトコンストラクタ。<br>
     * RepositoryFactory 経由でリポジトリを取得する。
     */
    public Standard{ServiceName}Service() {
        try {
            this.{entityName}Repository =
                    {EntityName}RepositoryFactory.getInstance().get{EntityName}Repository();
        } catch (RepositoryException e) {
            throw new RuntimeException(
                    "{EntityName}Repository の初期化に失敗しました", e);
        }
    }

    /**
     * テスト用コンストラクタ。<br>
     * 依存性注入によりモックリポジトリを渡せる。
     * @param {entityName}Repository リポジトリ
     */
    Standard{ServiceName}Service(final {EntityName}Repository {entityName}Repository) {
        this.{entityName}Repository = {entityName}Repository;
    }

    // ========== ビジネス操作 ==========

    @Override
    public {EntityName} process{EntityName}(final {EntityName} input)
            throws {ServiceName}ServiceException {
        // 1. バリデーション（トランザクション開始前に実行）
        validateInput(input);

        // 2. トランザクション境界 — サービス層が所有する
        //    SessionCallback<T, E> の E は1種類の検査例外にしか推論されないため、
        //    ラムダ内で発生する検査例外はその場（各リポジトリ呼び出し直後）で
        //    {ServiceName}ServiceException に変換してから投げる。これによりラムダから
        //    伝播する検査例外が {ServiceName}ServiceException 1種類に揃い、
        //    SessionTemplate.execute() を try/catch で囲む必要がなくなる。
        return SessionTemplate.execute(s -> {
            // 3. 既存データの取得
            final {EntityName} existing;
            try {
                existing = {entityName}Repository.findById(input.get{EntityName}Id());
            } catch (RepositoryException e) {
                LOGGER.error("Failed to find {entityName}: {entityName}Id="
                        + input.get{EntityName}Id(), e);
                throw new {ServiceName}ServiceException(
                        "{EntityName}の検索に失敗しました: " + e.getMessage(), e);
            }
            if (existing == null) {
                throw new {ServiceName}ServiceException(
                        "対象が見つかりません: {entityName}Id=" + input.get{EntityName}Id());
            }

            // 4. ビジネスルールの適用
            if (!existing.isEditable()) {
                throw new {ServiceName}ServiceException(
                        "編集不可の状態です: status=" + existing.getStatus());
            }

            // 5. 保存
            try {
                {entityName}Repository.save(input);
            } catch (RepositoryException e) {
                LOGGER.error("Failed to save {entityName}: {entityName}Id="
                        + input.get{EntityName}Id(), e);
                throw new {ServiceName}ServiceException(
                        "{EntityName}の保存に失敗しました: " + e.getMessage(), e);
            }

            LOGGER.info("Processed {entityName}: {entityName}Id=" + input.get{EntityName}Id());
            return input;
        });
    }

    @Override
    public {EntityName} findById(final String {entityName}Id)
            throws {ServiceName}ServiceException {
        try {
            return {entityName}Repository.findById({entityName}Id);
        } catch (RepositoryException e) {
            LOGGER.error("Failed to find {entityName}: {entityName}Id=" + {entityName}Id, e);
            throw new {ServiceName}ServiceException(
                    "{EntityName}の検索に失敗しました: {entityName}Id=" + {entityName}Id, e);
        }
    }

    @Override
    public List<{EntityName}> findByCondition(final {EntityName}SearchCriteria criteria)
            throws {ServiceName}ServiceException {
        try {
            return {entityName}Repository.findByCondition(criteria);
        } catch (RepositoryException e) {
            LOGGER.error("Failed to find {entityName} list", e);
            throw new {ServiceName}ServiceException(
                    "{EntityName}の一覧取得に失敗しました", e);
        }
    }

    @Override
    public void remove(final String {entityName}Id)
            throws {ServiceName}ServiceException {
        try {
            SessionTemplate.execute(s -> {
                {entityName}Repository.remove({entityName}Id);
                LOGGER.info("Removed {entityName}: {entityName}Id=" + {entityName}Id);
                return null;
            });
        } catch (RepositoryException e) {
            LOGGER.error("Failed to remove {entityName}: {entityName}Id=" + {entityName}Id, e);
            throw new {ServiceName}ServiceException(
                    "{EntityName}の削除に失敗しました: {entityName}Id=" + {entityName}Id, e);
        }
    }

    // ========== バリデーション ==========

    /**
     * 入力値のバリデーションを行う。<br>
     * トランザクション開始前（SessionTemplate.execute の外側）で実行する。
     * @param input 入力モデル
     * @throws {ServiceName}ServiceException バリデーション失敗時
     */
    private void validateInput(final {EntityName} input) throws {ServiceName}ServiceException {
        if (input == null) {
            throw new {ServiceName}ServiceException("入力が null です");
        }
        if (input.get{EntityName}Id() == null || input.get{EntityName}Id().isEmpty()) {
            throw new {ServiceName}ServiceException("{EntityName}ID は必須です");
        }
    }
}
