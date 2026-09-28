# IM-共通マスタ（法人・取引先・品目カテゴリ・品目・通貨）実装パターン（Java 版）

`CorporationManager`/`CustomerManager`/`ItemCategoryManager`/`ItemManager`/`CurrencyManager` を使った実装パターン集。メソッドの正確なシグネチャは `reference/corporation-manager-api-reference.md`/`reference/customer-manager-api-reference.md`/`reference/item-category-manager-api-reference.md`/`reference/item-manager-api-reference.md`/`reference/currency-manager-api-reference.md` を参照すること。

## 共通事項: マネージャの生成

```java
// 現在ログイン中のユーザを更新者・デフォルトロケールとして使う（推奨）
final CorporationManager corporationManager = new CorporationManager();
final CustomerManager customerManager = new CustomerManager();
final ItemCategoryManager itemCategoryManager = new ItemCategoryManager();
final ItemManager itemManager = new ItemManager();
final CurrencyManager currencyManager = new CurrencyManager();
```

5クラスとも検査例外 `jp.co.intra_mart.foundation.exception.BizApiException` を送出する。呼び出し元でハンドリングすること。

## パターン1: 法人の取得・新規登録

```java
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.corporation.CorporationManager;
import jp.co.intra_mart.foundation.master.corporation.model.Corporation;
import jp.co.intra_mart.foundation.master.corporation.model.CorporationBizKey;
import jp.co.intra_mart.foundation.master.corporation.model.ICorporationElement;

public class CorporationService {

    private static final Date FAR_FUTURE_DATE = buildFarFutureDate();

    private static Date buildFarFutureDate() {
        final Calendar calendar = Calendar.getInstance();
        calendar.set(3000, Calendar.JANUARY, 1, 0, 0, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    public Corporation find(final String companyCd, final String corporationCd) throws BizApiException {
        final CorporationManager corporationManager = new CorporationManager();
        final CorporationBizKey keyHolder = new CorporationBizKey();
        keyHolder.setCompanyCd(companyCd);
        keyHolder.setCorporationCd(corporationCd);
        // 基準日を指定する版は対象が存在しない場合 null を返す
        return corporationManager.getCorporation(keyHolder, new Date());
    }

    public void register(final String companyCd, final String corporationCd, final String corporationName) throws BizApiException {
        final CorporationManager corporationManager = new CorporationManager();

        final Corporation corporation = new Corporation();
        corporation.setCompanyCd(companyCd);
        corporation.setCorporationCd(corporationCd);
        // termCd を設定しない = 新規登録
        corporation.setStartDate(new Date());
        corporation.setEndDate(FAR_FUTURE_DATE);

        final Locale locale = Locale.JAPANESE;
        corporation.setDefaultLocale(locale);
        final ICorporationElement element = corporation.createLocaleElement();
        element.setCorporationName(corporationName);
        corporation.putLocaleElement(locale, element);

        corporationManager.setCorporation(corporation); // termCd 有無で新規/更新判定（User と同じパターン）
    }
}
```

- `getCorporation(bizKey, date)` は対象が存在しない場合 `null` を返す
- 新規登録時は `startDate`/`endDate` の設定が必須（`User`/`Department` と同じ制約）。多言語情報の登録手順（`setDefaultLocale`→`createLocaleElement()`→`putLocaleElement`）も同様

## パターン2: 法人と取引先の紐付け

```java
import java.util.Calendar;
import java.util.Date;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.common.model.Term;
import jp.co.intra_mart.foundation.master.corporation.CorporationManager;
import jp.co.intra_mart.foundation.master.corporation.model.ICorporationBizKey;
import jp.co.intra_mart.foundation.master.customer.model.ICustomerBizKey;

public class CorporationCustomerAssignmentService {

    private static final Date FAR_FUTURE_DATE = buildFarFutureDate();

    private static Date buildFarFutureDate() {
        final Calendar calendar = Calendar.getInstance();
        calendar.set(3000, Calendar.JANUARY, 1, 0, 0, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    public void assign(final ICustomerBizKey customerBizKey, final ICorporationBizKey corporationBizKey) throws BizApiException {
        final CorporationManager corporationManager = new CorporationManager();

        final Term term = new Term();
        term.setStartDate(new Date());
        term.setEndDate(FAR_FUTURE_DATE);

        // termCd 未設定 = 新規所属
        corporationManager.setCorporationAttach(customerBizKey, corporationBizKey, term);
    }

    public void unassign(final ICustomerBizKey customerBizKey, final ICorporationBizKey corporationBizKey) throws BizApiException {
        final CorporationManager corporationManager = new CorporationManager();
        corporationManager.removeCorporationAttach(customerBizKey, corporationBizKey);
    }
}
```

- `setCorporationAttach` の引数順は `(customerBizKey, corporationBizKey, term)`。`CompanyManager#setUserAttach` と同様、`term` 引数に `null` は渡せない
- 法人⇔取引先のクロス検索は `getCorporationWithCustomer`/`getCustomerWithCorporation` 等を使う（`reference/corporation-manager-api-reference.md` 参照）

## パターン3: 取引先の検索（会社コード限定・ページング）

```java
import java.util.Date;
import java.util.Locale;

import jp.co.intra_mart.foundation.database.Operator;
import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.common.search.AppCmnSearchCondition;
import jp.co.intra_mart.foundation.master.customer.CustomerManager;
import jp.co.intra_mart.foundation.master.customer.model.CustomerListNode;
import jp.co.intra_mart.foundation.master.customer.model.ImmCustomerColumn;

public class CustomerSearchService {

    public CustomerListNode[] searchByName(final String companyCd, final String keyword, final int page, final int pageSize) throws BizApiException {
        final CustomerManager customerManager = new CustomerManager();

        final AppCmnSearchCondition condition = new AppCmnSearchCondition();
        condition.addCondition(ImmCustomerColumn.CUSTOMER_NAME.toString(), "%" + keyword + "%", Operator.LIKE);

        final int start = (page - 1) * pageSize + 1; // start は1始まり
        // CustomerManager/ItemManager は search/list/count/total の第一引数が companyCd
        return customerManager.search(companyCd, condition, new Date(), Locale.JAPANESE, start, pageSize);
    }
}
```

- **`CustomerManager`/`ItemManager` はメソッド名が汎用（`get`/`set`/`remove`/`list`/`search`/`count`/`total`）で、エンティティ名を含まない。** `UserManager`/`CompanyManager`（`getUser`/`setDepartment` 等）と混同しないこと
- `search`/`list`/`count`/`total` の第一引数は必ず `companyCd`（検索対象会社コード）

## パターン4: 品目カテゴリの階層取得と品目の紐付け検索

```java
import java.util.Date;
import java.util.Locale;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.item.model.IItemBizKey;
import jp.co.intra_mart.foundation.master.item.model.ItemListNode;
import jp.co.intra_mart.foundation.master.item_category.ItemCategoryManager;
import jp.co.intra_mart.foundation.master.item_category.model.ItemCategoryTreeNode;
import jp.co.intra_mart.foundation.master.item_category.model.IItemCategoryBizKey;

public class ItemCategoryService {

    public ItemCategoryTreeNode getCategoryTree(final jp.co.intra_mart.foundation.master.item_category.model.IItemCategorySetBizKey setBizKey) throws BizApiException {
        final ItemCategoryManager itemCategoryManager = new ItemCategoryManager();
        return itemCategoryManager.getTree(setBizKey, new Date(), Locale.JAPANESE);
    }

    /**
     * 指定した品目カテゴリに属する品目の一覧を取得する。
     */
    public ItemListNode[] listItemsInCategory(final IItemCategoryBizKey categoryBizKey) throws BizApiException {
        final ItemCategoryManager itemCategoryManager = new ItemCategoryManager();
        return itemCategoryManager.getItemWithCategory(categoryBizKey, new Date(), Locale.JAPANESE);
    }
}
```

- 品目カテゴリの CRUD は `getCategory`/`setCategory`/`removeCategory`（`ItemCategory` ではなく `Category` 表記）。階層（ツリー）取得は `Department`/`CorporationGroup` と同型の `getTree`/`getBranch`
- 品目⇔品目カテゴリの所属は `getItemWithCategory`/`getCategoryWithItem` 系のクロス検索メソッド群で取得する（専用の「所属付与」メソッドは無く、品目・品目カテゴリそれぞれのマスタ登録時の紐付け情報を検索する構造）。詳細は `reference/item-category-manager-api-reference.md` を参照

## パターン5: 品目の新規登録

```java
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.item.ItemManager;
import jp.co.intra_mart.foundation.master.item.model.IItemElement;
import jp.co.intra_mart.foundation.master.item.model.Item;

public class ItemRegistrationService {

    private static final Date FAR_FUTURE_DATE = buildFarFutureDate();

    private static Date buildFarFutureDate() {
        final Calendar calendar = Calendar.getInstance();
        calendar.set(3000, Calendar.JANUARY, 1, 0, 0, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    public void register(final String companyCd, final String itemCd, final String itemName) throws BizApiException {
        final ItemManager itemManager = new ItemManager();

        final Item item = new Item();
        item.setCompanyCd(companyCd);
        item.setItemCd(itemCd);
        item.setStartDate(new Date());
        item.setEndDate(FAR_FUTURE_DATE);

        final Locale locale = Locale.JAPANESE;
        item.setDefaultLocale(locale);
        final IItemElement element = item.createLocaleElement();
        element.setItemName(itemName);
        item.putLocaleElement(locale, element);

        itemManager.set(item); // termCd 有無で新規/更新判定
    }
}
```

`Item` の国際化情報（`IItemElement`）は `itemName`/`itemSearchName`/`itemShortName`/`notes` の4項目のみで、住所・連絡先系フィールドを持たない最小構成。

## パターン6: 通貨レートの登録・取得

**`Currency`/`CurrencyConversion`/`CurrencyPrecision` は期間管理を持たない単純な upsert（`set*` が `void`）だが、`CurrencyRate` のみ期間管理を持ち `setCurrencyRate` は `ITerm[]` を返す。** 混同しないよう注意する。

```java
import java.util.Calendar;
import java.util.Date;

import jp.co.intra_mart.foundation.exception.BizApiException;
import jp.co.intra_mart.foundation.master.currency.CurrencyManager;
import jp.co.intra_mart.foundation.master.currency.model.CurrencyRate;
import jp.co.intra_mart.foundation.master.currency.model.CurrencyRateBizKey;

public class CurrencyRateService {

    private static final Date FAR_FUTURE_DATE = buildFarFutureDate();

    private static Date buildFarFutureDate() {
        final Calendar calendar = Calendar.getInstance();
        calendar.set(3000, Calendar.JANUARY, 1, 0, 0, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    public void registerRate(final String companyCd, final String currencyConversionCd,
            final String currencyCd, final String baseCurrencyCd, final java.math.BigDecimal rate) throws BizApiException {
        final CurrencyManager currencyManager = new CurrencyManager();

        final CurrencyRate currencyRate = new CurrencyRate();
        currencyRate.setCompanyCd(companyCd);
        currencyRate.setCurrencyConversionCd(currencyConversionCd);
        currencyRate.setCurrencyCd(currencyCd);
        currencyRate.setBaseCurrencyCd(baseCurrencyCd);
        currencyRate.setStartDate(new Date()); // 新規登録時は startDate/endDate が必須（User と同じ制約）
        currencyRate.setEndDate(FAR_FUTURE_DATE);
        currencyRate.setRate(rate);

        currencyManager.setCurrencyRate(currencyRate); // termCd 有無で新規/更新判定。ITerm[] を返す
    }

    public CurrencyRate findRate(final String companyCd, final String currencyConversionCd,
            final String currencyCd, final String baseCurrencyCd, final Date date) throws BizApiException {
        final CurrencyManager currencyManager = new CurrencyManager();

        final CurrencyRateBizKey keyHolder = new CurrencyRateBizKey();
        keyHolder.setCompanyCd(companyCd);
        keyHolder.setCurrencyConversionCd(currencyConversionCd);
        keyHolder.setCurrencyCd(currencyCd);
        keyHolder.setBaseCurrencyCd(baseCurrencyCd);

        // 対象が存在しない場合 null が返る
        return currencyManager.getCurrencyRate(keyHolder, date);
    }
}
```

- `CurrencyRate` のビジネスキーは `companyCd`/`currencyConversionCd`/`currencyCd`/`baseCurrencyCd` の4要素
- `Currency`（通貨本体）・`CurrencyPrecision`（精度）を登録する場合は `setCurrency`/`setCurrencyPrecision`（いずれも `void`。期間の概念が無いため `startDate`/`endDate` の設定は不要）

## 注意事項

- **`CorporationManager` は `CorporationGroupManager`（法人グループ）とは別クラス。** パッケージ・インポート文を混同しないこと（`jp.co.intra_mart.foundation.master.corporation` と `jp.co.intra_mart.foundation.master.corporation_group` は別パッケージ）
- **`CustomerManager`/`ItemManager` は CRUD・検索メソッド名が汎用（対象名を含まない）。** `search`/`list`/`count`/`total` は第一引数が `companyCd` である点も他クラスと異なる
- **`ItemCategoryManager` はメソッド名の表記が `Category`（`ItemCategory` ではなく）である。** `getCategory`/`setCategory`/`getCategorySet`/`setCategoryInclusion` のように、クラス名・モデルクラス名とメソッド名で表記が異なる
- **通貨4エンティティ（`Currency`/`CurrencyConversion`/`CurrencyPrecision`/`CurrencyRate`）のうち、期間管理を持つのは `CurrencyRate` のみ。** 他の3つは `set*` が `void` を返す単純な upsert であり、`startDate`/`endDate` の概念が無い
- 単体取得系（`get*`/`getCorporation`/`get`（Customer/Item）/`getCurrency*`）は、いずれも対象が存在しない場合に例外を送出せず `null`（または空配列）を返す。呼び出し側で必ず null チェックを行う
- 5クラスとも検査例外 `BizApiException` を送出する。呼び出し元で必ず `throws` 宣言または `try-catch` する
