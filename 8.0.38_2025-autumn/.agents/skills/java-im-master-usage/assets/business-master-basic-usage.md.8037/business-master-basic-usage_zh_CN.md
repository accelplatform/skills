# IM-通用主数据（法人・往来单位・品目分类・品目・货币）实现模式（Java 版）

使用 `CorporationManager`/`CustomerManager`/`ItemCategoryManager`/`ItemManager`/`CurrencyManager` 的实现模式集。方法的准确签名请参照 `reference/corporation-manager-api-reference.md`/`reference/customer-manager-api-reference.md`/`reference/item-category-manager-api-reference.md`/`reference/item-manager-api-reference.md`/`reference/currency-manager-api-reference.md`。

## 通用事项：管理器的创建

```java
// 使用当前登录用户作为更新者・默认区域设置（推荐）
final CorporationManager corporationManager = new CorporationManager();
final CustomerManager customerManager = new CustomerManager();
final ItemCategoryManager itemCategoryManager = new ItemCategoryManager();
final ItemManager itemManager = new ItemManager();
final CurrencyManager currencyManager = new CurrencyManager();
```

这 5 个类均会抛出受检异常 `jp.co.intra_mart.foundation.exception.BizApiException`。请在调用方进行处理。

## 模式 1：法人的获取・新建

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
        // 指定基准日期的重载版本，若目标不存在则返回 null
        return corporationManager.getCorporation(keyHolder, new Date());
    }

    public void register(final String companyCd, final String corporationCd, final String corporationName) throws BizApiException {
        final CorporationManager corporationManager = new CorporationManager();

        final Corporation corporation = new Corporation();
        corporation.setCompanyCd(companyCd);
        corporation.setCorporationCd(corporationCd);
        // 不设置 termCd = 新建
        corporation.setStartDate(new Date());
        corporation.setEndDate(FAR_FUTURE_DATE);

        final Locale locale = Locale.JAPANESE;
        corporation.setDefaultLocale(locale);
        final ICorporationElement element = corporation.createLocaleElement();
        element.setCorporationName(corporationName);
        corporation.putLocaleElement(locale, element);

        corporationManager.setCorporation(corporation); // 根据 termCd 是否存在判定新建/更新（与 User 相同的模式）
    }
}
```

- `getCorporation(bizKey, date)` 在目标不存在时返回 `null`
- 新建时须设置 `startDate`/`endDate`（与 `User`/`Department` 相同的限制）。多语言信息的注册步骤（`setDefaultLocale` → `createLocaleElement()` → `putLocaleElement`）也遵循相同模式

## 模式 2：法人与往来单位的关联

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

        // termCd 未设置 = 新建归属
        corporationManager.setCorporationAttach(customerBizKey, corporationBizKey, term);
    }

    public void unassign(final ICustomerBizKey customerBizKey, final ICorporationBizKey corporationBizKey) throws BizApiException {
        final CorporationManager corporationManager = new CorporationManager();
        corporationManager.removeCorporationAttach(customerBizKey, corporationBizKey);
    }
}
```

- `setCorporationAttach` 的参数顺序为 `(customerBizKey, corporationBizKey, term)`。与 `CompanyManager#setUserAttach` 相同，`term` 参数不可传入 `null`
- 法人⇔往来单位的交叉检索使用 `getCorporationWithCustomer`/`getCustomerWithCorporation` 等方法（参照 `reference/corporation-manager-api-reference.md`）

## 模式 3：往来单位检索（限定公司代码・分页）

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

        final int start = (page - 1) * pageSize + 1; // start 从 1 开始
        // CustomerManager/ItemManager 的 search/list/count/total 第一个参数为 companyCd
        return customerManager.search(companyCd, condition, new Date(), Locale.JAPANESE, start, pageSize);
    }
}
```

- **`CustomerManager`/`ItemManager` 的方法名较为通用（`get`/`set`/`remove`/`list`/`search`/`count`/`total`），不含实体名称。** 请勿与 `UserManager`/`CompanyManager`（`getUser`/`setDepartment` 等）混淆
- `search`/`list`/`count`/`total` 的第一个参数始终为 `companyCd`（检索目标公司代码）

## 模式 4：品目分类的层级获取与品目的关联检索

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
     * 获取属于指定品目分类的品目列表。
     */
    public ItemListNode[] listItemsInCategory(final IItemCategoryBizKey categoryBizKey) throws BizApiException {
        final ItemCategoryManager itemCategoryManager = new ItemCategoryManager();
        return itemCategoryManager.getItemWithCategory(categoryBizKey, new Date(), Locale.JAPANESE);
    }
}
```

- 品目分类的 CRUD 使用 `getCategory`/`setCategory`/`removeCategory`（方法名中为 `Category`，而非 `ItemCategory`）。层级（树形）获取与 `Department`/`CorporationGroup` 采用相同形式的 `getTree`/`getBranch`
- 品目⇔品目分类的归属关系通过 `getItemWithCategory`/`getCategoryWithItem` 系交叉检索方法群获取（没有专用的「赋予归属」方法，其结构是分别检索品目、品目分类各自在主数据注册时记录的关联信息）。详情请参照 `reference/item-category-manager-api-reference.md`

## 模式 5：品目的新建

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

        itemManager.set(item); // 根据 termCd 是否存在判定新建/更新
    }
}
```

`Item` 的国际化信息（`IItemElement`）仅有 `itemName`/`itemSearchName`/`itemShortName`/`notes` 4 个字段，是不含地址・联系方式类字段的最小化结构。

## 模式 6：货币汇率的注册・获取

**`Currency`/`CurrencyConversion`/`CurrencyPrecision` 是不含期间管理的简单 upsert（`set*` 返回 `void`），而只有 `CurrencyRate` 具有期间管理，其 `setCurrencyRate` 会返回 `ITerm[]`。** 请注意不要混淆。

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
        currencyRate.setStartDate(new Date()); // 新建时必须设置 startDate/endDate（与 User 相同的限制）
        currencyRate.setEndDate(FAR_FUTURE_DATE);
        currencyRate.setRate(rate);

        currencyManager.setCurrencyRate(currencyRate); // 根据 termCd 是否存在判定新建/更新，返回 ITerm[]
    }

    public CurrencyRate findRate(final String companyCd, final String currencyConversionCd,
            final String currencyCd, final String baseCurrencyCd, final Date date) throws BizApiException {
        final CurrencyManager currencyManager = new CurrencyManager();

        final CurrencyRateBizKey keyHolder = new CurrencyRateBizKey();
        keyHolder.setCompanyCd(companyCd);
        keyHolder.setCurrencyConversionCd(currencyConversionCd);
        keyHolder.setCurrencyCd(currencyCd);
        keyHolder.setBaseCurrencyCd(baseCurrencyCd);

        // 目标不存在时返回 null
        return currencyManager.getCurrencyRate(keyHolder, date);
    }
}
```

- `CurrencyRate` 的业务键由 `companyCd`/`currencyConversionCd`/`currencyCd`/`baseCurrencyCd` 4 个要素构成
- 注册 `Currency`（货币本体）・`CurrencyPrecision`（精度）时使用 `setCurrency`/`setCurrencyPrecision`（均为 `void`。由于不存在期间的概念，无需设置 `startDate`/`endDate`）

## 注意事项

- **`CorporationManager` 与 `CorporationGroupManager`（法人集团）是不同的类。** 请勿混淆其包名・导入语句（`jp.co.intra_mart.foundation.master.corporation` 与 `jp.co.intra_mart.foundation.master.corporation_group` 是不同的包）
- **`CustomerManager`/`ItemManager` 的 CRUD・检索方法名较为通用（不含目标对象名称）。** `search`/`list`/`count`/`total` 的第一个参数为 `companyCd`，这一点也与其他类不同
- **`ItemCategoryManager` 的方法名表述为 `Category`（而非 `ItemCategory`）。** 如 `getCategory`/`setCategory`/`getCategorySet`/`setCategoryInclusion` 所示，类名・模型类名与方法名的表述方式不同
- **在货币相关的 4 个实体（`Currency`/`CurrencyConversion`/`CurrencyPrecision`/`CurrencyRate`）中，仅 `CurrencyRate` 具有期间管理。** 其余 3 个的 `set*` 均返回 `void`，属于简单 upsert，不存在 `startDate`/`endDate` 的概念
- 单体获取系方法（`get*`/`getCorporation`/`get`（Customer/Item）/`getCurrency*`）在目标不存在时均不会抛出异常，而是返回 `null`（或空数组）。调用方必须始终进行 null 检查
- 这 5 个类均会抛出受检异常 `BizApiException`。调用方必须声明 `throws` 或使用 `try-catch` 处理
