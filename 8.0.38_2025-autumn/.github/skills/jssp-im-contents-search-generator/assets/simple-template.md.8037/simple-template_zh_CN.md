# 检索结果模板 模板

## 概述

从 IM-ContentsSearch 标准检索画面调用的、用于显示自定义内容检索结果的模板。
iAP 对检索结果中的每条内容逐一调用 `init(request)` 的机制。
模板本身不调用检索 API（被动实现）。

## 文件结构

```
src/main/jssp/src/im_contents_search/template/
├── {功能名}.js     # 模板（功能容器）
└── {功能名}.html   # 模板（演示页）
```

---

## {功能名}.js（功能容器）

```javascript
let $data = '{}';

// ========================================
// 入口点
// ========================================
/**
 * IM-ContentsSearch 对每条检索结果逐一调用的入口点。
 * 从 request 参数构建 response 对象，并以 JSON 字符串形式绑定到 $data。
 *
 * @param {Object} request - 请求参数（检索结果内容）
 *   request.id              - 内容 ID（例："{功能名}_001"）
 *   request.id_original     - 源数据的主键
 *   request.title           - 标题
 *   request.url             - Crawler 中设置的 URL
 *   request.record_date     - 更新日期时间（Date 类型）
 *   request.snippets        - 高亮摘要（Array<String>）※iAP 内部生成
 *   request.typeBreadcrumbs - TYPE 层次结构面包屑导航 ※iAP 内部生成
 *   // 仅存在在 require-dynamic-fields 中声明的字段
 *   request.category        - 动态字段（STRING）
 *   request.price           - 动态字段（INT）
 */
function init(request) {
  // 执行主处理
  let response = main(request);

  // 以 JSON 格式存储到 $data
  // 将 JSON 内的 </script> 中的 '/' 全部替换为 '\/' 以防止标签闭合问题
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

// ========================================
// 主处理
// ========================================
/**
 * 执行主处理。
 *
 * @param {Object} request - 请求参数
 * @return {Object} 处理结果
 */
function main(request) {
  let logger = Logger.getLogger();
  let response = {
    result: null,
    error: {
      code: '',                 // 错误代码
      message: ''               // 错误消息
    }
  };

  try {
    // 执行业务逻辑主处理
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('显示检索结果模板时发生错误。{}', e.message);
    response.error.code = 'E001';
    response.error.message = '发生了意外错误。';
    return response;
  }

  return response;
}

// ========================================
// 业务逻辑
// ========================================
/**
 * 执行业务逻辑主处理。
 *
 * @param {Object} request - 请求参数
 * @return {Object} 处理结果
 */
function processBusinessLogic(request) {
  return {
    id:          request.id,
    originalId:  request.id_original,
    title:       request.title || '',
    detailUrl:   request.url + '/' + (request.id_original || ''),
    recordDate:  formatDate(request.record_date),
    breadcrumbs: request.typeBreadcrumbs || '',
    category:    request.category || '',
    price:       formatPrice(request.price),
    snippets:    request.snippets || [],
    labels: {
      category: MessageManager.getMessage('CAP.Z.APP.{功能名大写}.CONTENTSSEARCH.FIELD_NAME.CATEGORY'),
      price:    MessageManager.getMessage('CAP.Z.APP.{功能名大写}.CONTENTSSEARCH.FIELD_NAME.PRICE')
    }
  };
}

// ========================================
// 工具函数
// ========================================
/**
 * 将日期转换为标准日期格式。
 *
 * @param {Date} date - 要转换的日期
 * @returns {String} 格式化后的日期字符串
 */
function formatDate(date) {
  if (isBlank(date)) {
    return '';
  }
  return AccountDateTimeFormatter.format(
    date,
    'IM_DATETIME_FORMAT_DATE_STANDARD',
    'IM_DATETIME_FORMAT_TIME_TIMESTAMP'
  );
}

/**
 * 将价格（INT 类型动态字段）转换为整数字符串。
 *
 * @param {*} price - 要转换的价格值
 * @returns {String} 整数字符串，或空字符串
 */
function formatPrice(price) {
  if (isNull(price)) {
    return '';
  }
  return String(price);
}
```

**`request` 对象的属性：**

标准字段（始终存在）：

| 属性 | 类型 | 说明 |
|----------|----|------|
| `request.id` | String | 内容 ID（格式为 `"{功能名}_主键值"`） |
| `request.id_original` | String | 源数据的主键 |
| `request.title` | String | Crawler 中通过 `setTitle()` 设置的值 |
| `request.url` | String | Crawler 中通过 `setUrl()` 设置的值 |
| `request.type` | String | 内容 TYPE |
| `request.record_date` | Date | Crawler 中通过 `setRecordDate()` 设置的值 |

> 通过 `addText()` 设置的 `text` 和通过 `addAttachment()` 设置的 `attachment` **不包含在 request 对象中**。

iAP 生成字段（始终存在）：

| 属性 | 类型 | 说明 |
|----------|----|------|
| `request.typeBreadcrumbs` | String | TYPE 层次结构面包屑导航 |
| `request.snippets` | Array\<String\> | 高亮摘要 |

动态字段（仅 `<require-dynamic-fields>` 中声明的字段存在）：

| 属性 | 类型 | 说明 |
|----------|----|------|
| `request.{键名}` | 类型相关 | 以与 `Fields.*.toField("{键名}")` 的键名一致的属性名引用 |

---

## {功能名}.html（演示页）

```html
<div>
  <h3 class="imcs-content-detail-title">
    <a target="_blank"></a>
  </h3>

  <div class="imcs-content-detail-subtitle">
    <span class="imcs-content-detail-subtitle-date"></span>
    <span class="imcs-content-detail-subtitle-breadcrumbs"></span>
  </div>

  <div class="imcs-content-detail-option">
    <div class="imcs-content-detail-option-row">
      <div class="imcs-content-detail-option-cell">
        <span class="imcs-content-detail-option-label"></span>
        <span class="imcs-content-detail-option-value"></span>
      </div>
    </div>
    <div class="imcs-content-detail-option-row">
      <div class="imcs-content-detail-option-cell">
        <span class="imcs-content-detail-option-label"></span>
        <span class="imcs-content-detail-option-value"></span>
      </div>
    </div>
  </div>

  <div class="imcs-content-detail-snippets"></div>

  <script type="text/javascript">
    (function($data) {
      const container = document.currentScript.parentElement;

      if ($data.error.code) {
        container.style.display = 'none';
        return;
      }

      const result = $data.result;

      // 标题·链接
      const anchor = container.querySelector('.imcs-content-detail-title a');
      anchor.href = result.detailUrl;
      anchor.textContent = result.title;

      // 日期
      container.querySelector('.imcs-content-detail-subtitle-date').textContent = result.recordDate;
      // 面包屑导航
      container.querySelector('.imcs-content-detail-subtitle-breadcrumbs').textContent = result.breadcrumbs;

      // 附加信息项
      const optionRows = container.querySelectorAll('.imcs-content-detail-option-row');
      const categoryCell = optionRows[0].querySelector('.imcs-content-detail-option-cell');
      categoryCell.querySelector('.imcs-content-detail-option-label').textContent = result.labels.category;
      categoryCell.querySelector('.imcs-content-detail-option-value').textContent = result.category;

      const priceCell = optionRows[1].querySelector('.imcs-content-detail-option-cell');
      priceCell.querySelector('.imcs-content-detail-option-label').textContent = result.labels.price;
      priceCell.querySelector('.imcs-content-detail-option-value').textContent = result.price;

      // 摘要（高亮文本）
      const snippetsContainer = container.querySelector('.imcs-content-detail-snippets');
      result.snippets.forEach(function(snippet) {
        const span = document.createElement('span');
        span.innerHTML = snippet;
        snippetsContainer.appendChild(span);
      });
    })(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
  </script>
</div>
```

**HTML CSS 类的作用：**

| CSS 类 | 说明 |
|-----------|------|
| `imcs-content-detail-title` | 检索结果标题行 |
| `imcs-content-detail-subtitle` | 副标题行（日期·TYPE 面包屑导航） |
| `imcs-content-detail-subtitle-date` | 日期文本 |
| `imcs-content-detail-option` | 附加信息区域（动态字段的显示） |
| `imcs-content-detail-option-row` | 附加信息的单行 |
| `imcs-content-detail-option-cell` | 标签 + 值的单元格 |
| `imcs-content-detail-option-label` | 字段标签 |
| `imcs-content-detail-option-value` | 字段值 |
| `imcs-content-detail-snippets` | 摘要（高亮文本）显示区域 |

**XSS 防护（DOM API 的使用区分）：**

| 值 | DOM API | 原因 |
|---|---------|------|
| `$data.result.title` / 动态字段值 | `textContent` | 用户来源数据 → 自动转义 |
| `$data.result.detailUrl` | `a.href = ...` | 对 href 属性赋值时被解析为 URL |
| `$data.result.breadcrumbs`（typeBreadcrumbs） | `textContent` | iAP 生成的 TYPE 层次结构面包屑导航（纯文本格式） |
| 摘要（snippet） | `innerHTML` | iAP 用 `<b>` 标签标记关键词的文本（标记部分以外已进行净化处理） |

> `innerHTML` 不得用于用户来源数据。`innerHTML` 的使用仅限于 `snippets`。

---

## 消息属性

### caption.properties（默认·与英语相同）

```properties
CAP.Z.APP.{功能名大写}.CONTENTSSEARCH.FIELD_NAME.CATEGORY=Category
CAP.Z.APP.{功能名大写}.CONTENTSSEARCH.FIELD_NAME.PRICE=Price
```

### caption_ja.properties（日语 — 以 Unicode 转义格式编写）

```properties
CAP.Z.APP.{功能名大写}.CONTENTSSEARCH.FIELD_NAME.CATEGORY=カテゴリ
CAP.Z.APP.{功能名大写}.CONTENTSSEARCH.FIELD_NAME.PRICE=価格
```

### caption_en.properties（英语）

```properties
CAP.Z.APP.{功能名大写}.CONTENTSSEARCH.FIELD_NAME.CATEGORY=Category
CAP.Z.APP.{功能名大写}.CONTENTSSEARCH.FIELD_NAME.PRICE=Price
```

### caption_zh_CN.properties（中文简体 — 以 Unicode 转义格式编写）

```properties
CAP.Z.APP.{功能名大写}.CONTENTSSEARCH.FIELD_NAME.CATEGORY=类别
CAP.Z.APP.{功能名大写}.CONTENTSSEARCH.FIELD_NAME.PRICE=价格
```

**注意：** 日语和中文消息属性文件必须使用 Unicode 转义格式（`\uXXXX`）编写。
