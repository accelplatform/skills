# IM-共通マスタ グループ系（パブリック/プライベート/会社/法人）実装パターン（Java 版）

`PublicGroupManager`/`PrivateGroupManager`/`CompanyGroupManager`/`CorporationGroupManager` を使った実装パターン集。メソッドの正確なシグネチャは `reference/` 配下の各リファレンスを参照すること。

## 共通事項: マネージャの生成

```java
// 現在ログイン中のユーザを更新者・デフォルトロケールとして使う（推奨）
final PublicGroupManager publicGroupManager = new PublicGroupManager();
final PrivateGroupManager privateGroupManager = new PrivateGroupManager();
final CompanyGroupManager companyGroupManager = new CompanyGroupManager();
final CorporationGroupManager corporationGroupManager = new CorporationGroupManager();
```

4クラスとも検査例外 `jp.co.intra_mart.foundation.exception.BizApiException` を送出する。呼び出し元でハンドリングすること。

## 検索条件（`AppCmnSearchCondition`）の基本

`java-im-master-usage` の `UserManager`/`CompanyManager` と同じ設計。`list*`/`search*`/`count*`/`total*` 系メソッドに渡す `AppCmnSearchCondition` のカラム指定は、対応する列挙型（`ImmPublicGroupColumn`/`ImmCompanyGroupColumn`/`ImmCorporationGroupColumn` 等、いずれも `ImmTableColumn` を実装）の `toString()`（実際のDBカラム名を返す）から取得する。

```java
import jp.co.intra_mart.foundation.database.Operator;
import jp.co.intra_mart.foundation.master.common.search.AppCmnSearchCondition;
import jp.co.intra_mart.foundation.master.company_group.model.ImmCompanyGroupColumn;

final AppCmnSearchCondition condition = new AppCmnSearchCondition();
condition.addCondition(ImmCompanyGroupColumn.COMPANY_GROUP_CD.toString(), "group001");
condition.addCondition(ImmCompanyGroupColumn.COMPANY_GROUP_NAME.toString(), "%" + keyword + "%", Operator.LIKE);
```

**列挙型は `AppCmnSearchCondition` の `SearchTarget` 引数版オーバーロードには渡せない。** 必ず `toString()` で文字列化してから `addCondition(String, Object[, Operator])` を使う。

## パターン1: パブリックグループの取得・検索

```java
import java.util.Date;
import java.util.Locale;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.public_group.PublicGroupManager;
import jp.co.intra_mart.foundation.master.public_group.model.PublicGroup;
import jp.co.intra_mart.foundation.master.public_group.model.PublicGroupBizKey;

public class PublicGroupLookupService {

    public PublicGroup find(final String publicGroupSetCd, final String publicGroupCd) throws BizApiException {
        final PublicGroupManager publicGroupManager = new PublicGroupManager();
        final PublicGroupBizKey keyHolder = new PublicGroupBizKey();
        keyHolder.setPublicGroupSetCd(publicGroupSetCd);
        keyHolder.setPublicGroupCd(publicGroupCd);
        // date に現在日時を渡すと、その日付時点で有効な期間のパブリックグループ情報を取得する
        return publicGroupManager.getPublicGroup(keyHolder, new Date(), Locale.JAPANESE);
    }
}
```

- 対象が存在しない場合、`getPublicGroup` は例外を送出せず `null` を返す
- `PublicGroupBizKey` は `IPublicGroupBizKey` の軽量実装クラス。コード（`publicGroupSetCd`/`publicGroupCd`）だけをセットしてキーとして渡せる

## パターン2: パブリックグループの階層（ツリー）取得

```java
import java.util.Date;
import java.util.Locale;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.public_group.PublicGroupManager;
import jp.co.intra_mart.foundation.master.public_group.model.IPublicGroupSetBizKey;
import jp.co.intra_mart.foundation.master.public_group.model.PublicGroupTreeNode;

public class PublicGroupTreeService {

    public PublicGroupTreeNode getTree(final IPublicGroupSetBizKey publicGroupSetBizKey) throws BizApiException {
        final PublicGroupManager publicGroupManager = new PublicGroupManager();
        return publicGroupManager.getTree(publicGroupSetBizKey, new Date(), Locale.JAPANESE);
    }
}
```

- パブリックグループセット全体のツリーは `getTree`、特定パブリックグループを起点とした部分木は `getBranch` を使う
- パブリックグループはカテゴリ（`PublicGroupCategory`/`CategoryItem` 相当）・ロール（`PublicGroupRole`）の管理機能を持つ点が他のグループ系クラスとの違い。詳細は `reference/public-group-manager-api-reference.md` を参照

## パターン3: プライベートグループの新規登録・ユーザ紐付け

```java
import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.private_group.PrivateGroupManager;
import jp.co.intra_mart.foundation.master.private_group.model.PrivateGroup;
import jp.co.intra_mart.foundation.master.private_group.model.PrivateGroupBizKey;
import jp.co.intra_mart.foundation.master.user.model.User;

public class PrivateGroupService {

    public void register(final String privateGroupCd, final String ownerUserCd, final String groupName) throws BizApiException {
        final PrivateGroupManager privateGroupManager = new PrivateGroupManager();

        final PrivateGroup privateGroup = new PrivateGroup();
        privateGroup.setPrivateGroupCd(privateGroupCd);
        privateGroup.setUserCd(ownerUserCd); // 所有者コード（IPrivateGroupBizKey の userCd は「所有者」を意味する）
        privateGroup.setPrivateGroupName(groupName);

        privateGroupManager.setPrivateGroup(privateGroup);
    }

    public void addMember(final String privateGroupCd, final String ownerUserCd, final User member, final int sortKey) throws BizApiException {
        final PrivateGroupManager privateGroupManager = new PrivateGroupManager();

        final PrivateGroupBizKey privateGroupBizKey = new PrivateGroupBizKey();
        privateGroupBizKey.setPrivateGroupCd(privateGroupCd);
        privateGroupBizKey.setUserCd(ownerUserCd);

        privateGroupManager.setUserAttach(privateGroupBizKey, member, sortKey);
    }

    public void removeMember(final String privateGroupCd, final String ownerUserCd, final User member) throws BizApiException {
        final PrivateGroupManager privateGroupManager = new PrivateGroupManager();

        final PrivateGroupBizKey privateGroupBizKey = new PrivateGroupBizKey();
        privateGroupBizKey.setPrivateGroupCd(privateGroupCd);
        privateGroupBizKey.setUserCd(ownerUserCd);

        privateGroupManager.removeUserAttach(privateGroupBizKey, member);
    }
}
```

- `PrivateGroup` は `ITerm` を実装しないため、`User`/`Department` のような `termCd` 有無での新規/更新判定は行われない。新規/更新いずれの場合も同じ `setPrivateGroup`/`setUserAttach` を呼び出し、対象データの存在有無は内部（拡張ポイント側）で判定される
- `IPrivateGroupBizKey` のビジネスキーは「プライベートグループコード + 所有者コード」の組。`userCd` は一般的な「操作対象ユーザ」ではなく「グループの所有者」を意味する点に注意

## パターン4: 会社グループの取得・検索

```java
import java.util.Date;
import java.util.Locale;

import jp.co.intra_mart.foundation.database.Operator;
import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.common.search.AppCmnSearchCondition;
import jp.co.intra_mart.foundation.master.company_group.CompanyGroupManager;
import jp.co.intra_mart.foundation.master.company_group.model.CompanyGroupListNode;
import jp.co.intra_mart.foundation.master.company_group.model.ImmCompanyGroupColumn;

public class CompanyGroupSearchService {

    public CompanyGroupListNode[] searchByName(final String keyword, final int page, final int pageSize) throws BizApiException {
        final CompanyGroupManager companyGroupManager = new CompanyGroupManager();

        final AppCmnSearchCondition condition = new AppCmnSearchCondition();
        condition.addCondition(ImmCompanyGroupColumn.COMPANY_GROUP_NAME.toString(), "%" + keyword + "%", Operator.LIKE);

        final int start = (page - 1) * pageSize + 1; // start は1始まり
        return companyGroupManager.searchCompanyGroup(condition, new Date(), Locale.JAPANESE, start, pageSize);
    }
}
```

- 検索系（`list*`/`search*`/`count*`）は `locale` が必須
- 会社グループと会社（`Company`）の関連付けは `setCompanyAttach`/`removeCompanyAttach` で操作する（`java-im-master-usage` の `setUserAttach` と同じ設計思想）

## パターン5: 法人グループの取得・検索（会社コード限定）

```java
import java.util.Date;
import java.util.Locale;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.corporation_group.CorporationGroupManager;
import jp.co.intra_mart.foundation.master.corporation_group.model.CorporationGroup;
import jp.co.intra_mart.foundation.master.corporation_group.model.CorporationGroupBizKey;
import jp.co.intra_mart.foundation.master.corporation_group.model.CorporationGroupSet;

public class CorporationGroupService {

    public CorporationGroup find(final String companyCd, final String corporationGroupSetCd, final String corporationGroupCd) throws BizApiException {
        final CorporationGroupManager corporationGroupManager = new CorporationGroupManager();

        final CorporationGroupBizKey keyHolder = new CorporationGroupBizKey();
        keyHolder.setCompanyCd(companyCd);
        keyHolder.setCorporationGroupSetCd(corporationGroupSetCd);
        keyHolder.setCorporationGroupCd(corporationGroupCd);

        return corporationGroupManager.getCorporationGroup(keyHolder, new Date());
    }

    /**
     * 指定した会社に属する法人グループセットのみを取得する。
     * 引数なし版の getCorporationGroupSetAll() は全会社の法人グループセットを取得する点に注意。
     */
    public CorporationGroupSet[] listSetsByCompany(final String companyCd) throws BizApiException {
        final CorporationGroupManager corporationGroupManager = new CorporationGroupManager();
        return corporationGroupManager.getCorporationGroupSetAll(companyCd);
    }
}
```

- 法人グループのビジネスキーは `companyCd`/`corporationGroupSetCd`/`corporationGroupCd` の3要素（会社グループより1要素多い）
- `getCorporationGroupSetAll()`（引数なし、全会社対象）と `getCorporationGroupSetAll(String companyCd)`（会社限定）の2種類のオーバーロードを混同しない

## 注意事項

- **単体取得系（`get*`）は対象が存在しない場合、例外を送出せず `null` を返す。** 呼び出し側で必ず null チェックを行う
- **4クラスの機能範囲は同一ではない。** パブリックグループのみカテゴリ・ロール・ツリー機能を持ち、プライベートグループはカテゴリ・ロール・ツリー機能を持たずユーザ紐付け中心の最小構成である
- **プライベートグループの新規/更新判定は `termCd` の有無ではない。** `PrivateGroup` は `ITerm` を実装せず、判定は拡張ポイント側（`PrivateGroupWriter`）が対象データの存在有無を見て行う
- **法人グループのモデルは会社グループと異なり `companyCd` を追加で保持する。** ビジネスキーの要素数が異なる点に注意する
- 検索系（`list*`/`search*`/`count*`）に渡す `AppCmnSearchCondition` のカラム指定は、対応する列挙型の `toString()` で文字列化してから渡す
- 4クラスとも検査例外 `BizApiException` を送出する。呼び出し元で必ず `throws` 宣言または `try-catch` する
