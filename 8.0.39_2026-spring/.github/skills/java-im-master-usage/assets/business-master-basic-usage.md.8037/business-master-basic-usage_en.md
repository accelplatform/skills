# IM Common Master (Corporation / Customer / Item Category / Item / Currency) Implementation Patterns (Java)

A collection of implementation patterns using `CorporationManager`/`CustomerManager`/`ItemCategoryManager`/`ItemManager`/`CurrencyManager`. Refer to `reference/corporation-manager-api-reference.md`/`reference/customer-manager-api-reference.md`/`reference/item-category-manager-api-reference.md`/`reference/item-manager-api-reference.md`/`reference/currency-manager-api-reference.md` for exact method signatures.

## Common: Creating a Manager

```java
// Use the currently logged-in user as the updater and default locale (recommended)
final CorporationManager corporationManager = new CorporationManager();
final CustomerManager customerManager = new CustomerManager();
final ItemCategoryManager itemCategoryManager = new ItemCategoryManager();
final ItemManager itemManager = new ItemManager();
final CurrencyManager currencyManager = new CurrencyManager();
```

All five classes throw the checked exception `jp.co.intra_mart.foundation.exception.BizApiException`. Handle it at the call site.

## Pattern 1: Retrieving/Creating a Corporation

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
        // The overload that takes a base date returns null when the target does not exist
        return corporationManager.getCorporation(keyHolder, new Date());
    }

    public void register(final String companyCd, final String corporationCd, final String corporationName) throws BizApiException {
        final CorporationManager corporationManager = new CorporationManager();

        final Corporation corporation = new Corporation();
        corporation.setCompanyCd(companyCd);
        corporation.setCorporationCd(corporationCd);
        // Not setting termCd = creation
        corporation.setStartDate(new Date());
        corporation.setEndDate(FAR_FUTURE_DATE);

        final Locale locale = Locale.JAPANESE;
        corporation.setDefaultLocale(locale);
        final ICorporationElement element = corporation.createLocaleElement();
        element.setCorporationName(corporationName);
        corporation.putLocaleElement(locale, element);

        corporationManager.setCorporation(corporation); // Creation vs. update decided by termCd presence (same pattern as User)
    }
}
```

- `getCorporation(bizKey, date)` returns `null` when the target does not exist
- On creation, `startDate`/`endDate` must be set (the same constraint as `User`/`Department`). The registration steps for multilingual information (`setDefaultLocale` → `createLocaleElement()` → `putLocaleElement`) also follow the same pattern

## Pattern 2: Linking a Corporation and a Customer

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

        // termCd not set = a new attachment
        corporationManager.setCorporationAttach(customerBizKey, corporationBizKey, term);
    }

    public void unassign(final ICustomerBizKey customerBizKey, final ICorporationBizKey corporationBizKey) throws BizApiException {
        final CorporationManager corporationManager = new CorporationManager();
        corporationManager.removeCorporationAttach(customerBizKey, corporationBizKey);
    }
}
```

- The argument order for `setCorporationAttach` is `(customerBizKey, corporationBizKey, term)`. As with `CompanyManager#setUserAttach`, the `term` argument cannot be `null`
- Use `getCorporationWithCustomer`/`getCustomerWithCorporation`, etc. for cross-searching corporations and customers (see `reference/corporation-manager-api-reference.md`)

## Pattern 3: Searching Customers (Scoped to a Company Code, Paged)

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

        final int start = (page - 1) * pageSize + 1; // start is 1-based
        // For CustomerManager/ItemManager, the first argument of search/list/count/total is companyCd
        return customerManager.search(companyCd, condition, new Date(), Locale.JAPANESE, start, pageSize);
    }
}
```

- **`CustomerManager`/`ItemManager` use generic method names (`get`/`set`/`remove`/`list`/`search`/`count`/`total`) that do not include the entity name.** Do not confuse them with `UserManager`/`CompanyManager` (`getUser`/`setDepartment`, etc.)
- The first argument of `search`/`list`/`count`/`total` is always `companyCd` (the target company code)

## Pattern 4: Retrieving an Item Category Hierarchy and Searching Linked Items

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
     * Retrieves the list of items belonging to the given item category.
     */
    public ItemListNode[] listItemsInCategory(final IItemCategoryBizKey categoryBizKey) throws BizApiException {
        final ItemCategoryManager itemCategoryManager = new ItemCategoryManager();
        return itemCategoryManager.getItemWithCategory(categoryBizKey, new Date(), Locale.JAPANESE);
    }
}
```

- Item category CRUD uses `getCategory`/`setCategory`/`removeCategory` (`Category`, not `ItemCategory`, in the method names). Hierarchy (tree) retrieval follows the same shape as `Department`/`CorporationGroup`: `getTree`/`getBranch`
- The item-to-item-category attachment is retrieved through cross-search method families such as `getItemWithCategory`/`getCategoryWithItem` (there is no dedicated "attach" method — the structure instead searches the linkage information recorded when each item and item category was registered). See `reference/item-category-manager-api-reference.md` for details

## Pattern 5: Creating an Item

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

        itemManager.set(item); // Creation vs. update decided by termCd presence
    }
}
```

`Item`'s internationalized information (`IItemElement`) is a minimal set with only four fields — `itemName`/`itemSearchName`/`itemShortName`/`notes` — and has no address- or contact-related fields.

## Pattern 6: Registering/Retrieving a Currency Rate

**`Currency`/`CurrencyConversion`/`CurrencyPrecision` are simple upserts with no term management (their `set*` methods return `void`), while only `CurrencyRate` has term management, and `setCurrencyRate` returns `ITerm[]`.** Be careful not to confuse the two.

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
        currencyRate.setStartDate(new Date()); // Required on creation (same constraint as User)
        currencyRate.setEndDate(FAR_FUTURE_DATE);
        currencyRate.setRate(rate);

        currencyManager.setCurrencyRate(currencyRate); // Creation vs. update decided by termCd presence; returns ITerm[]
    }

    public CurrencyRate findRate(final String companyCd, final String currencyConversionCd,
            final String currencyCd, final String baseCurrencyCd, final Date date) throws BizApiException {
        final CurrencyManager currencyManager = new CurrencyManager();

        final CurrencyRateBizKey keyHolder = new CurrencyRateBizKey();
        keyHolder.setCompanyCd(companyCd);
        keyHolder.setCurrencyConversionCd(currencyConversionCd);
        keyHolder.setCurrencyCd(currencyCd);
        keyHolder.setBaseCurrencyCd(baseCurrencyCd);

        // Returns null when the target does not exist
        return currencyManager.getCurrencyRate(keyHolder, date);
    }
}
```

- `CurrencyRate`'s business key consists of four elements: `companyCd`/`currencyConversionCd`/`currencyCd`/`baseCurrencyCd`
- To register `Currency` (the currency itself) or `CurrencyPrecision` (precision), use `setCurrency`/`setCurrencyPrecision` (both `void`; since there is no concept of a term, `startDate`/`endDate` do not need to be set)

## Notes

- **`CorporationManager` is a different class from `CorporationGroupManager` (corporation group).** Do not confuse their packages or import statements (`jp.co.intra_mart.foundation.master.corporation` and `jp.co.intra_mart.foundation.master.corporation_group` are separate packages)
- **`CustomerManager`/`ItemManager` use generic CRUD/search method names (they do not include the target entity's name).** `search`/`list`/`count`/`total` also differ from other classes in that their first argument is `companyCd`
- **`ItemCategoryManager`'s method names use the wording `Category` (not `ItemCategory`).** As in `getCategory`/`setCategory`/`getCategorySet`/`setCategoryInclusion`, the wording differs between the class/model class names and the method names
- **Of the four currency entities (`Currency`/`CurrencyConversion`/`CurrencyPrecision`/`CurrencyRate`), only `CurrencyRate` has term management.** The other three are simple upserts whose `set*` methods return `void`, with no concept of `startDate`/`endDate`
- The single-retrieval methods (`get*`/`getCorporation`/`get` for Customer/Item/`getCurrency*`) all return `null` (or an empty array) rather than throwing an exception when the target does not exist. The caller must always perform a null check
- All five classes throw the checked exception `BizApiException`. The caller must always declare `throws` or use a `try-catch` block
