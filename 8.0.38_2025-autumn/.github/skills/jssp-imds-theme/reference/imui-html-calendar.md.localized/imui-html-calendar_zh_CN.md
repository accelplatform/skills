---
paths:
  - "src/main/jssp/**/*.html"
---

# imuiCalendar

## 基本信息

imuiCalendar 是用于日期选择的日历组件。
标准使用浮动显示（与文本框联动的弹出窗口）。

**重要：日期输入必须指定 `floatable="true"`。**
内联显示（`floatable="false"`）仅限于多日期选择等特殊用途，通常表单输入中不使用。

- 来源URL: https://api.intra-mart.jp/iap/apilist-jssp-tagdoc/doc/pc/imuiCalendar/index.html
- 标签类型: imart 标签（`<imart type="imuiCalendar" />`）

日历组件是定义在 imui 主题中而非 imds 的组件，但也可在 imds 中使用。

## 属性参考

| 属性 | 类型 | 说明 | 默认值 | 必须/可选 |
|------|-----|------|-----------|----------------|
| floatable | Boolean | 显示模式（true: 浮动 / false: 内联） | - | 必须 |
| altField | String | 浮动时联动目标文本框的CSS选择器 | - | 浮动时必须 |
| id | String | 内联显示时的日历元素ID | 自动生成 | 可选 |
| format | String | 日期格式（例：`yyyy/MM/dd`） | AccountContext设置值 | 可选 |
| defaultDate | String/Date | 初始显示日期 | 服务器日期 | 可选 |
| minDate | String/Date | 可选择的最小日期 | 1970/01/01 | 可选 |
| maxDate | String/Date | 可选择的最大日期 | 2999/12/31 | 可选 |
| calendarId | String | 使用的日历ID | 默认日历 | 可选 |
| changeMonth | Boolean | 显示月份选择下拉框 | false | 可选 |
| changeYear | Boolean | 显示年份选择下拉框 | false | 可选 |
| firstDayOfWeek | Number | 一周的开始曜日（0=周日～6=周六） | 账户设置值 | 可选 |
| multiSelectable | Boolean | 多日期选择（仅限内联显示） | false | 可选 |
| showButtonPanel | Boolean | 显示按钮面板 | false | 可选 |

## 日期格式

格式字符串只能使用年月日（不支持时分秒）。

| 格式字符 | 说明 | 示例 |
|-----------------|------|-----|
| yyyy | 4位年份 | 2026 |
| MM | 2位月份（补零） | 03 |
| dd | 2位日期（补零） | 24 |
| M | 月份（不补零） | 3 |
| d | 日期（不补零） | 24 |

## HTML 代码片段

### 浮动显示（与文本框联动）

最常见的使用模式。将文本框与日历组合使用。

```html
<input type="text" id="sample-date" class="imds-textbox" style="max-width: 10em;" />
<imart type="imuiCalendar" floatable="true" altField="#sample-date" format="yyyy/MM/dd" />
```

### 内联显示

直接在页面上嵌入日历。

```html
<imart type="imuiCalendar" id="sample-calendar" floatable="false" />
```

### 格式和范围指定

```html
<input type="text" id="sample-date" class="imds-textbox" style="max-width: 10em;" />
<imart type="imuiCalendar" floatable="true" altField="#sample-date" format="yyyy/MM/dd" minDate="2020/01/01" maxDate="2030/12/31" />
```

### 用 imds-field 包裹的情况

```html
<div class="imds-field">
  <div class="imds-field-control">
    <input type="text" id="sample-date" class="imds-textbox" name="sampleDate" value="" style="max-width: 10em;" />
    <imart type="imuiCalendar" floatable="true" altField="#sample-date" format="yyyy/MM/dd" />
  </div>
  <span class="imds-error-text" for="sample-date">在此处显示错误消息。</span>
</div>
```

## CSJS API（客户端 JavaScript）

可使用 jQuery 操作日历。
jQuery 已由主题库加载，无需单独添加 `<script>` 标签。

```javascript
// 获取当前选择的日期
$('#sample-calendar').imuiCalendar('getDate');

// 设置日期
$('#sample-calendar').imuiCalendar('setDate', targetDate);

// 更改选项（例：更改日历ID）
$('#sample-calendar').imuiCalendar('option', 'calendarId', value);
```

## 实现注意事项

- **日期输入请使用 imuiCalendar 而非 `<input type="date">`**
  （因为它与 intra-mart 的日历设置和语言环境联动）
- 浮动显示时，`altField` 指定联动目标**显示用文本框**的CSS选择器。不可指定隐藏字段（因为日历图标的显示位置取决于 altField 元素）
- HTML的书写顺序应为「**显示用文本框 → `<imart type="imuiCalendar">` → 隐藏字段**」。反过来会导致日历图标显示在文本框左侧
- `altField` 的选择器中ID含有冒号等特殊字符时，需用 `\\` 进行转义（例：`altField="#\\:myDate\\:"`）
- 格式中必须包含年月日全部内容。缺少任何一个，文本框的输入将无法反映到日历
- 多日期选择（`multiSelectable`）仅可在内联显示中使用
- 文本框宽度请根据日期格式用 `max-width` 指定（`yyyy/MM/dd` 格式约为 `10em`）
- 在输入表单中使用时，用 Field（`imds-field`）进行包裹

## 日期时间输入（日期 + 时刻的组合）

输入「日期时间」时，不要让用户在单个文本框中手动输入，而应**将日期和时刻字段分开**。

| 元素 | 使用组件 | 备注 |
|------|---------|------|
| 日期部分 | `<imart type="imuiCalendar">` | 指定 `format="yyyy-MM-dd"`（便于API联动） |
| 时刻部分 | `<input type="time">` | 使用 `step="900"` 限制为15分钟单位 |

### HTML 标记示例

```html
<div class="imds-field-inline">
  <input type="text" id=":startDate:" class="imds-textbox" style="max-width: 10em;" />
  <imart type="imuiCalendar" floatable="true" altField="#\\:startDate\\:" format="yyyy-MM-dd" />
  <input type="time" id=":startTime:" class="imds-textbox" step="900" style="max-width: 8em;" />
</div>
```

### 值的读取（API发送时）

```javascript
const startAt = document.getElementById(':startDate:').value + ' ' + document.getElementById(':startTime:').value + ':00';
// → "2026-04-21 10:00:00"
```

### 值的初始设置（编辑画面设置现有数据时）

将从API以 `"YYYY-MM-DD HH:mm:ss"` 格式接收的值分割后分别设置。

```javascript
function setDateTimeFields(dateFieldId, timeFieldId, dateTimeStr) {
  if (!dateTimeStr) return;
  const parts = dateTimeStr.split(' ');
  document.getElementById(dateFieldId).value = parts[0];
  document.getElementById(timeFieldId).value = parts[1].substring(0, 5);
}
// 使用示例
setDateTimeFields(':startDate:', ':startTime:', result.startAt);
```

### 验证

```javascript
if (!document.getElementById(':startDate:').value) {
  errors.push({ name: 'startDate', message: '请输入开始日期。' });
}
if (!document.getElementById(':startTime:').value) {
  errors.push({ name: 'startTime', message: '请输入开始时刻。' });
}
```
