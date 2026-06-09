---
paths:
  - "src/main/jssp/**/*.html"
---

# IMART imuiCalendar 标签参考

## 概述

`<imart type="imuiCalendar">` 是提供日期选择日历组件的标签。
与文本框联动，可以从日历中选择日期并输入。

### 显示模式

| 模式 | `floatable` | 行为 | 推荐 |
|------|------------|------|------|
| **浮动模式** | `true` | 文本框获得焦点或点击按钮时显示日历 | **标准（始终使用此模式）** |
| 内联模式 | `false` | 日历始终显示在标签位置 | 仅用于多日选择等特殊用途 |

**重要：日期输入表单必须指定 `floatable="true"`。**
省略 `floatable` 将变为内联显示，无法呈现文本框+日历图标的标准UI。

## 属性列表

### 主要属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| floatable | Boolean | false | 显示模式。`true` = 浮动，`false` = 内联 |
| altField | String | - | 联动的文本框元素的选择器 |
| format | String | AccountContext 的输入日期格式 | 日期格式。`yyyy/MM/dd` 等 |
| id | String | 自动生成 | 内联模式时日历元素的ID |
| defaultDate | String/Date | 服务器的今天 | 初始显示日期 |
| minDate | String/Number/Date | 1970/01/01 | 可选择的最小日期 |
| maxDate | String/Number/Date | 2999/12/31 | 可选择的最大日期 |

### 显示控制属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| showOn | String | `both` | 日历显示触发器：`focus`、`button`、`both` |
| showButtonPanel | Boolean | false | 显示按钮面板（今天/关闭） |
| showAnim | String | `fadeIn` | 显示动画：`show`、`slideDown`、`fadeIn`、`""` |
| buttonImage | String | `ui/images/calendar_btn.png` | 日历按钮的图标图片路径 |
| buttonImageOnly | Boolean | true | 仅显示图片（false时在按钮内显示图片） |
| numberOfMonths | Number/Array | 1 | 显示月数。可以数组形式指定 `[行, 列]` |
| changeMonth | Boolean | false | 通过下拉列表选择月份 |
| changeYear | Boolean | false | 通过下拉列表选择年份 |
| yearRange | String | `c-10:c+10` | 年份下拉列表的范围。相对：`c-10:c+10`，绝对：`2010:2020` |
| firstDayOfWeek | Number | AccountContext 的值 | 每周的起始日。0（周日）到 6（周六） |
| disabled | Boolean | false | 禁用日历 |

### 多日选择属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| multiSelectable | Boolean | false | 多日选择模式（仅内联模式） |
| validTerms | Array | undefined | 可选择期间的数组。`[{start: "yyyy/MM/dd", end: "yyyy/MM/dd"}, ...]` |

### 事件属性

| 属性 | 类型 | 说明 |
|------|------|------|
| onSelect | String(function) | 选择日期时执行的函数名 |
| onClose | String(function) | 关闭日历时执行的函数名 |
| onChangeMonthYear | String(function) | 年月变更后执行的函数名 |
| beforeShow | String(function) | 显示日历前执行的函数名 |
| beforeShowDay | String(function) | 显示各日期单元格前执行的函数名 |

### i18n 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| closeText | String | 关闭按钮的文本 |
| currentText | String | 今天按钮的文本 |
| prevText | String | 上月图标的工具提示 |
| nextText | String | 下月图标的工具提示 |
| appendText | String | 显示在文本框旁边的消息 |
| buttonText | String | 日历显示按钮的标题 |
| dayNames | Array | 星期的完整名称数组（周日到周六） |
| dayNamesMin | Array | 星期的最短名称数组（用于日历头部） |
| dayNamesShort | Array | 星期的缩写名称数组 |
| monthNames | Array | 月份的完整名称数组 |
| monthNamesShort | Array | 月份的缩写名称数组 |

## 日期格式

### 替换字符

| 字符 | 输出 | 示例 |
|------|------|------|
| `yyyy` | 4位年份 | 2012 |
| `yy` | 年份后2位 | 12 |
| `MM` | 补零月份 | 08 |
| `M` | 月份 | 8 |
| `dd` | 补零日期 | 09 |
| `d` | 日期 | 9 |
| `EEEE` | 星期完整名称 | Thursday |
| `E` | 星期缩写名称 | Thu |

### 特殊格式

| 模式 | 等价格式 | 示例 |
|------|---------|------|
| `ISO_8601` | `yyyy-MM-dd` | 2012-08-09 |
| `ATOM` | `yyyy-MM-dd` | 2012-08-09 |

## 使用示例

### 浮动模式（基本）

```html
<input type="text" id=":registrationDate:" class="imds-textbox" style="max-width: 10em;" />
<imart type="imuiCalendar" floatable="true" altField="#\\:registrationDate\\:" format="yyyy/MM/dd" />
```

### 内联模式

```html
<imart type="imuiCalendar" id="calendar" floatable="false" />
```

### 日期范围限制

```html
<input type="text" id=":targetDate:" class="imds-textbox" />
<imart type="imuiCalendar" floatable="true" altField="#\\:targetDate\\:" format="yyyy/MM/dd" minDate="2010/01/01" maxDate="2025/12/31" />
```

### 带年月下拉列表

```html
<input type="text" id=":birthDate:" class="imds-textbox" />
<imart type="imuiCalendar" floatable="true" altField="#\\:birthDate\\:" format="yyyy/MM/dd" changeYear="true" changeMonth="true" yearRange="1950:2025" />
```

### 指定可多选期间（函数容器 + HTML）

函数容器：
```javascript
let validTerms = [
    { start: '2012/01/01', end: '2012/01/04' },
    { start: '2012/01/07', end: '2012/01/10' }
];
```

HTML：
```html
<imart type="imuiCalendar" validTerms=validTerms />
```

## CSJS 方法

浮动模式使用 `altField` 的文本框，内联模式使用日历元素的ID作为选择器。

| 方法 | 说明 | 语法 |
|------|------|------|
| `getDate` | 获取选择的日期 | `$(selector).imuiCalendar('getDate')` → `Date` |
| `setDate` | 将日期设为选择状态 | `$(selector).imuiCalendar('setDate', date)` |
| `getSelection` | 获取多选的日期 | `$(selector).imuiCalendar('getSelection')` → `Date[]` |
| `setSelection` | 将多个日期设为选择状态 | `$(selector).imuiCalendar('setSelection', dates)` |
| `deleteSelection` | 取消多选的日期 | `$(selector).imuiCalendar('deleteSelection', dates)` |
| `show` | 显示日历 | `$(selector).imuiCalendar('show')` |
| `hide` | 隐藏日历 | `$(selector).imuiCalendar('hide')` |
| `enable` | 启用日历 | `$(selector).imuiCalendar('enable')` |
| `disable` | 禁用日历 | `$(selector).imuiCalendar('disable')` |
| `destroy` | 删除日历 | `$(selector).imuiCalendar('destroy')` |
| `refresh` | 重绘日历 | `$(selector).imuiCalendar('refresh')` |
| `option`（获取） | 获取选项值 | `$(selector).imuiCalendar('option', name)` |
| `option`（设置） | 设置选项值 | `$(selector).imuiCalendar('option', name, value)` |

## 事件回调

### onSelect

```javascript
window.onDateSelect = function(dateText, inst) {
    // dateText: 格式化的日期字符串
    // inst: jQueryUI Widget 实例
};
```

```html
<imart type="imuiCalendar" floatable="true" altField="#\\:date\\:" onSelect="onDateSelect" />
```

### onChangeMonthYear

```javascript
window.onMonthYearChange = function(year, month, inst) {
    // year: 年（Number），month: 月（Number），inst: jQueryObject
};
```

## 注意事项

- `altField` 的选择器中指定 `:fieldName:` 格式的ID时需要转义（`#\\:fieldName\\:`）
- `format` 中只能使用年（`y`）、月（`M`）、日（`d`）。不支持时分秒
- `multiSelectable` 只在内联模式（`floatable="false"`）下起作用
- 日历维护数据缓存在浏览器中，同一月份不会重新获取
- 事件属性需要以字符串形式指定全局作用域（`window`）可访问的函数名
