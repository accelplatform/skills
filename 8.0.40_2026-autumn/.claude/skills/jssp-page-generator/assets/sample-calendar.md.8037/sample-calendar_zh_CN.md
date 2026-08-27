# 示例日历画面模板

## 概述

根据登录用户选择的日历，显示反映休假日、节假日及颜色设置的月度日历画面。
- 从 `AccountContext` 获取用户的日历设置（`calendarId`）、一周开始日（`firstDayOfWeek`）和区域设置（`locale`）
- 支持上月/下月导航及"本月"按钮切换月份
- 日历表格根据 `firstDayOfWeek` 动态排列列顺序
- 在日历单元格中显示节假日/休假日名称（支持 i18n 区域设置）
- 以图例形式显示每周各天的颜色设置

## 文件结构

```
src/main/jssp/src/sample_calendar/view/
  └── index.js              # 函数容器
  └── index.html            # 展示页面

src/main/conf/routing-jssp-config/
  └── sample_calendar.xml   # 路由配置
```

---

## 函数容器（sample_calendar/view/index.js）

```javascript
/**
 * 示例日历画面
 *
 * @file index.js
 * @description 根据登录用户选择的日历，显示反映休假日、节假日及颜色的日历。
 */

// ========================================
// 绑定变量（用于展示页面联动）
// ========================================
let $title = '日历';
let $subTitle = '示例';
let $data = '{}';

// ========================================
// 入口点
// ========================================
/**
 * 画面显示的入口点。
 * 访问画面 URL 时首先执行。
 *
 * @param {Object} request - 请求对象
 */
function init(request) {
  let response = main(request);
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
      code: '',
      message: ''
    }
  };

  try {
    validateRequest(request);
  } catch (e) {
    logger.error('请求参数验证失败。{}', e.message);
    transferErrorPage('E001', '请求参数无效。');
    return response;
  }

  try {
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('显示日历画面时发生错误。{}', e.message);
    transferErrorPage('E002', '发生了意外错误。');
    return response;
  }

  return response;
}

// ========================================
// 验证
// ========================================
/**
 * 验证请求参数。
 *
 * @param {Object} request - 请求参数
 * @throws {Error} 验证错误时抛出
 */
function validateRequest(request) {
  validateYearParam(request);
  validateMonthParam(request);
}

/**
 * 验证 year 参数。
 *
 * @param {Object} request - 请求参数
 * @throws {Error} 验证错误时抛出
 */
function validateYearParam(request) {
  let yearParam = request['year'];
  if (yearParam === undefined || yearParam === null || yearParam === '') {
    return;
  }
  let year = parseInt(yearParam, 10);
  if (isNaN(year) || year < 1900 || year > 9999) {
    throw new Error('year 请指定 1900 至 9999 之间的整数。');
  }
}

/**
 * 验证 month 参数。
 *
 * @param {Object} request - 请求参数
 * @throws {Error} 验证错误时抛出
 */
function validateMonthParam(request) {
  let monthParam = request['month'];
  if (monthParam === undefined || monthParam === null || monthParam === '') {
    return;
  }
  let month = parseInt(monthParam, 10);
  if (isNaN(month) || month < 1 || month > 12) {
    throw new Error('month 请指定 1 至 12 之间的整数。');
  }
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
  let accountContext = Contexts.getAccountContext();
  let calendarId = accountContext.calendarId;
  let firstDayOfWeek = accountContext.firstDayOfWeek;
  let locale = accountContext.locale;

  let today = new Date();
  let year = resolveYear(request, today);
  let month = resolveMonth(request, today);

  let calendarName = getCalendarName(calendarId, locale);
  let weekDays = getWeekDayInfos(calendarId);
  let days = getMonthDays(calendarId, year, month, firstDayOfWeek, today, locale);

  return {
    calendarId: calendarId,
    calendarName: calendarName,
    year: year,
    month: month,
    firstDayOfWeek: firstDayOfWeek,
    weekDays: weekDays,
    days: days,
    today: {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    }
  };
}

/**
 * 确定显示的年份。
 *
 * @param {Object} request - 请求参数
 * @param {Date} today - 今天的日期
 * @return {number} 显示年份
 */
function resolveYear(request, today) {
  let yearParam = request['year'];
  if (yearParam !== undefined && yearParam !== null && yearParam !== '') {
    return parseInt(yearParam, 10);
  }
  return today.getFullYear();
}

/**
 * 确定显示的月份。
 *
 * @param {Object} request - 请求参数
 * @param {Date} today - 今天的日期
 * @return {number} 显示月份（1〜12）
 */
function resolveMonth(request, today) {
  let monthParam = request['month'];
  if (monthParam !== undefined && monthParam !== null && monthParam !== '') {
    return parseInt(monthParam, 10);
  }
  return today.getMonth() + 1;
}

/**
 * 获取日历名称。
 *
 * @param {string} calendarId - 日历 ID
 * @param {string} locale - 区域设置 ID
 * @return {string} 日历名称
 */
function getCalendarName(calendarId, locale) {
  let manager = new CalendarInfoManager();
  let result = manager.getCalendarInfo(calendarId);
  if (result.error || !result.data) {
    return calendarId;
  }
  let calendarInfo = result.data;
  if (calendarInfo.i18n && calendarInfo.i18n.calendarName) {
    let i18nName = calendarInfo.i18n.calendarName[locale] || calendarInfo.calendarName;
    return i18nName || calendarId;
  }
  return calendarInfo.calendarName || calendarId;
}

/**
 * 获取日历的星期信息。
 *
 * @param {string} calendarId - 日历 ID
 * @return {Array} 星期信息数组
 */
function getWeekDayInfos(calendarId) {
  let manager = new CalendarInfoManager();
  let result = manager.getCalendarWeekDayInfos(calendarId);
  if (result.error || !result.data) {
    return [];
  }
  let weekDayList = [];
  for (let i = 0; i < result.data.length; i++) {
    let weekDayInfo = result.data[i];
    weekDayList.push({
      dayOfWeek: weekDayInfo.dayOfWeek,
      color: weekDayInfo.color || '',
      holiday: weekDayInfo.holiday
    });
  }
  return weekDayList;
}

/**
 * 获取指定月份的日期信息摘要。
 *
 * @param {string} calendarId - 日历 ID
 * @param {number} year - 年
 * @param {number} month - 月（1〜12）
 * @param {number} firstDayOfWeek - 一周开始日（0=周日〜6=周六）
 * @param {Date} today - 今天的日期
 * @param {string} locale - 区域设置 ID
 * @return {Array} 日期信息数组
 */
function getMonthDays(calendarId, year, month, firstDayOfWeek, today, locale) {
  let manager = new CalendarInfoManager();

  // 表格开始日：追溯到 firstDayOfWeek 对应的上月日期
  let firstOfMonth = new Date(year, month - 1, 1);
  let startDow = firstOfMonth.getDay();
  let startOffset = (startDow - firstDayOfWeek + 7) % 7;
  let gridStart = new Date(year, month - 1, 1 - startOffset);

  // 表格结束日：延伸到最后一个星期（firstDayOfWeek 的前一天）的下月日期
  let lastOfMonth = new Date(year, month, 0);
  let endDow = lastOfMonth.getDay();
  let lastDayOfWeek = (firstDayOfWeek + 6) % 7;
  let endOffset = (lastDayOfWeek - endDow + 7) % 7;
  let gridEnd = new Date(year, month - 1, lastOfMonth.getDate() + endOffset);

  let result = manager.getDayInfoSummariesOnTerm(calendarId, gridStart, gridEnd);
  if (result.error || !result.data) {
    return [];
  }

  let todayYear = today.getFullYear();
  let todayMonth = today.getMonth() + 1;
  let todayDay = today.getDate();

  let dayList = [];
  for (let i = 0; i < result.data.length; i++) {
    let summary = result.data[i];
    let d = summary.currentDate;
    let dYear = d.getFullYear();
    let dMonth = d.getMonth() + 1;
    let dDay = d.getDate();

    // 从 dayInfos 提取支持 i18n 的名称，以 dayInfoNames 作为备用
    let dayInfoNames = resolveDayInfoNames(summary, locale);

    dayList.push({
      year: dYear,
      month: dMonth,
      day: dDay,
      dayOfWeek: d.getDay(),
      isCurrentMonth: (dYear === year && dMonth === month),
      isToday: (dYear === todayYear && dMonth === todayMonth && dDay === todayDay),
      isHoliday: summary.isHoliday,
      color: summary.color || '',
      dayInfoNames: dayInfoNames
    });
  }
  return dayList;
}

/**
 * 从 DayInfoSummary 获取用于显示的日期信息名称列表。
 * 优先使用 dayInfos 的 i18n 区域设置名称，备用 dayInfoNames。
 *
 * @param {DayInfoSummary} summary - 日期信息摘要
 * @param {string} locale - 区域设置 ID
 * @return {string[]} 日期信息名称数组
 */
function resolveDayInfoNames(summary, locale) {
  let names = [];

  if (summary.dayInfos && summary.dayInfos.length > 0) {
    for (let j = 0; j < summary.dayInfos.length; j++) {
      let dayInfo = summary.dayInfos[j];
      let name = '';
      if (dayInfo.i18n && dayInfo.i18n.dayInfoName) {
        name = dayInfo.i18n.dayInfoName[locale] || dayInfo.dayInfoName || '';
      } else {
        name = dayInfo.dayInfoName || '';
      }
      if (name) {
        names.push(name);
      }
    }
  }

  if (names.length === 0 && summary.dayInfoNames) {
    for (let j = 0; j < summary.dayInfoNames.length; j++) {
      if (summary.dayInfoNames[j]) {
        names.push(summary.dayInfoNames[j]);
      }
    }
  }

  return names;
}

// ========================================
// 错误页面跳转
// ========================================
/**
 * 发生错误时全屏显示错误信息。
 *
 * @param {String} code - 错误代码
 * @param {String} message - 错误信息
 */
function transferErrorPage(code, message) {
  let param = {
    title: '发生了系统错误',
    message: [code, message].join('\n')
  };
  Transfer.toErrorPage(param);
}
```

---

## 展示页面（sample_calendar/view/index.html）

```html
<!-- 页头 -->
<imart type="head">
  <!-- 标题 -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- 样式 -->
  <style>
    /* ===== 日历导航 ===== */
    .calendar-nav {
      display: flex;
      align-items: center;
      gap: 0.75em;
      margin-bottom: 1em;
    }
    .calendar-nav-title {
      font-size: 1.6rem;
      font-weight: 700;
      min-width: 9em;
      text-align: center;
      letter-spacing: 0.03em;
      color: var(--imds-color-text, #1a1a2e);
    }
    /* ===== 日历名称徽章 ===== */
    .calendar-name-badge {
      display: inline-block;
      font-size: 0.78rem;
      font-weight: 500;
      padding: 0.25em 0.9em;
      border-radius: 2em;
      background: var(--imds-color-primary, #005BAC);
      color: #fff;
      margin-left: 0.6em;
      vertical-align: middle;
      letter-spacing: 0.04em;
    }
    /* ===== 日历表格 ===== */
    .calendar-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      table-layout: fixed;
      /* 从视口高度减去页头/导航/图例的高度，使表格充满画面 */
      height: calc(100vh - 160px);
      min-height: 400px;
    }
    .calendar-table th {
      padding: 0.65em 0;
      text-align: center;
      font-weight: 600;
      font-size: 0.9rem;
      letter-spacing: 0.06em;
      background: #f0f4f8;
      border-bottom: 2px solid var(--imds-color-primary, #005BAC);
    }
    .calendar-table td {
      vertical-align: top;
      border-right: 1px solid var(--imds-color-border, #e4e8ed);
      border-bottom: 1px solid var(--imds-color-border, #e4e8ed);
      /* height: 1% 使表格高度按行数均等分配 */
      height: 1%;
      min-height: 4em;
      padding: 0.5em 0.6em;
      cursor: default;
      transition: background 0.12s ease;
    }
    .calendar-table td:first-child {
      border-left: 1px solid var(--imds-color-border, #e4e8ed);
    }
    .calendar-table tbody tr:last-child td {
      border-bottom: 2px solid var(--imds-color-border, #e4e8ed);
    }
    .calendar-table td:not(.is-other-month):hover {
      background: rgba(0, 91, 172, 0.05);
    }
    /* 日期数字 */
    .calendar-cell-day {
      font-size: 2rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.4em;
      height: 1.4em;
      border-radius: 50%;
      line-height: 1;
      transition: background 0.12s ease, color 0.12s ease;
    }
    .calendar-cell-day.is-today {
      background: var(--imds-color-primary, #005BAC);
      color: #fff;
    }
    /* 节假日/休假日名称 */
    .calendar-cell-info {
      font-size: 1rem;
      font-weight: 500;
      margin-top: 0.15em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    /* 非当月单元格 */
    .calendar-table td.is-other-month {
      background: #f7f8fa;
      opacity: 0.55;
    }
    /* 休假日单元格 */
    .calendar-table td.is-holiday {
      background: linear-gradient(160deg, #fff4f4 0%, #fff 80%);
    }
    /* ===== 图例 ===== */
    .calendar-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5em 1.25em;
      margin-bottom: 0.75em;
      font-size: 0.85rem;
      padding: 0.5em 0.85em;
      background: #fafbfc;
      border: 1px solid var(--imds-color-border, #e4e8ed);
      border-radius: 6px;
    }
    .calendar-legend:empty {
      display: none;
    }
    .calendar-legend-item {
      display: flex;
      align-items: center;
      gap: 0.4em;
    }
    .calendar-legend-dot {
      width: 0.75em;
      height: 0.75em;
      border-radius: 50%;
      display: inline-block;
      border: 1px solid rgba(0,0,0,0.12);
      flex-shrink: 0;
    }
  </style>
  <!-- 客户端脚本（将 $data 通过 IIFE 作用域化，而不放入全局作用域） -->
  <script>
  (function($data) {
  document.addEventListener('DOMContentLoaded', () => {

    if ($data.error && $data.error.code) {
      imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      return;
    }

    const data = $data.result;
    if (!data) {
      return;
    }

    // 星期名称（中文）
    const WEEK_DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];

    // 星期信息映射（dayOfWeek -> {color, holiday}）
    const weekDayMap = {};
    (data.weekDays || []).forEach((wd) => {
      weekDayMap[wd.dayOfWeek] = wd;
    });

    // 根据 firstDayOfWeek 排列的星期顺序列表
    function getOrderedWeekDays(firstDayOfWeek) {
      const ordered = [];
      for (let i = 0; i < 7; i++) {
        const dow = (firstDayOfWeek + i) % 7;
        ordered.push({
          dayOfWeek: dow,
          name: WEEK_DAY_NAMES[dow],
          color: weekDayMap[dow] ? (weekDayMap[dow].color || '') : '',
          holiday: weekDayMap[dow] ? weekDayMap[dow].holiday : false
        });
      }
      return ordered;
    }

    // 渲染星期标题
    function renderWeekDayHeaders(orderedWeekDays) {
      const thead = document.querySelector('#calendar-table thead tr');
      if (!thead) { return; }
      thead.innerHTML = '';
      orderedWeekDays.forEach((wd) => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.style.color = wd.color || '';
        th.textContent = wd.name;
        thead.appendChild(th);
      });
    }

    // 渲染日期单元格
    function renderDays(calendarData, orderedWeekDays) {
      const tbody = document.querySelector('#calendar-table tbody');
      if (!tbody) { return; }
      tbody.innerHTML = '';

      const days = calendarData.days || [];
      const colCount = orderedWeekDays.length;
      const rowCount = Math.ceil(days.length / colCount);

      for (let r = 0; r < rowCount; r++) {
        const tr = document.createElement('tr');
        for (let c = 0; c < colCount; c++) {
          const idx = r * colCount + c;
          if (idx >= days.length) {
            tr.appendChild(document.createElement('td'));
            continue;
          }
          const day = days[idx];
          const td = document.createElement('td');

          if (!day.isCurrentMonth) {
            td.className = 'is-other-month';
          } else if (day.isHoliday) {
            td.className = 'is-holiday';
          }

          // 日期数字 span
          const daySpan = document.createElement('span');
          daySpan.className = 'calendar-cell-day' + (day.isToday ? ' is-today' : '');

          // 颜色优先级：DayInfoSummary.color → 星期颜色
          let cellColor = day.color;
          if (!cellColor && weekDayMap[day.dayOfWeek]) {
            cellColor = weekDayMap[day.dayOfWeek].color || '';
          }
          if (cellColor && !day.isToday) {
            daySpan.style.color = cellColor;
          }

          daySpan.textContent = String(day.day);
          td.appendChild(daySpan);

          // 节假日/休假日名称
          if (day.dayInfoNames && day.dayInfoNames.length > 0) {
            const infoDiv = document.createElement('div');
            infoDiv.className = 'calendar-cell-info';
            infoDiv.style.color = cellColor || '';
            infoDiv.title = day.dayInfoNames.join('、');
            infoDiv.textContent = day.dayInfoNames[0];
            td.appendChild(infoDiv);
          }

          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }
    }

    // 渲染导航标题
    function renderNavTitle(calendarData) {
      const titleEl = document.getElementById('nav-title');
      if (titleEl) {
        titleEl.textContent = calendarData.year + '年' + calendarData.month + '月';
      }
      const nameEl = document.getElementById('calendar-name');
      if (nameEl) {
        nameEl.textContent = calendarData.calendarName || calendarData.calendarId || '';
      }
    }

    // 生成上月/下月 URL
    function buildMonthUrl(year, month) {
      return 'sample/sample_calendar?year=' + year + '&month=' + month;
    }

    // 导航按钮事件
    function setupNavigation(calendarData) {
      const prevBtn = document.getElementById('btn-prev-month');
      const nextBtn = document.getElementById('btn-next-month');
      const todayBtn = document.getElementById('btn-today');

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          let y = calendarData.year;
          let m = calendarData.month - 1;
          if (m < 1) { m = 12; y -= 1; }
          location.href = buildMonthUrl(y, m);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          let y = calendarData.year;
          let m = calendarData.month + 1;
          if (m > 12) { m = 1; y += 1; }
          location.href = buildMonthUrl(y, m);
        });
      }
      if (todayBtn) {
        todayBtn.addEventListener('click', () => {
          // 不带查询参数跳转 → 服务器端使用系统日期的年月
          location.href = 'sample/sample_calendar';
        });
      }
    }

    // 渲染图例（各星期的颜色）
    function renderLegend(orderedWeekDays) {
      const legendEl = document.getElementById('calendar-legend');
      if (!legendEl) { return; }
      legendEl.innerHTML = '';

      orderedWeekDays.forEach((wd) => {
        if (!wd.color) { return; }
        const item = document.createElement('span');
        item.className = 'calendar-legend-item';

        const dot = document.createElement('span');
        dot.className = 'calendar-legend-dot';
        dot.style.background = wd.color;

        const label = document.createElement('span');
        label.textContent = '周' + wd.name + (wd.holiday ? '（休假日）' : '');
        label.style.color = wd.color;

        item.appendChild(dot);
        item.appendChild(label);
        legendEl.appendChild(item);
      });
    }

    // 入口点
    const firstDayOfWeek = typeof data.firstDayOfWeek === 'number' ? data.firstDayOfWeek : 0;
    const orderedWeekDays = getOrderedWeekDays(firstDayOfWeek);

    renderNavTitle(data);
    renderWeekDayHeaders(orderedWeekDays);
    renderDays(data, orderedWeekDays);
    renderLegend(orderedWeekDays);
    setupNavigation(data);
  });
  })(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
  </script>
</imart>

<!-- 整个页面的容器（配置在 intra-mart 主题的 imui-container 内部，因此不附加 id） -->
<div class="imds-container">
  <!-- 页头 -->
  <header class="imds-header">
    <div class="imds-header-icon">
      <span class="imds-icon-wrapper is-large">
        <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
      </span>
    </div>
    <div class="imds-header-title">
      <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
      <h1>
        <imart type="string" value=$title escapeXml="true" escapeJs="false"></imart>
        <span id="calendar-name" class="calendar-name-badge"></span>
      </h1>
    </div>
  </header>

  <!-- 主要内容 -->
  <main>
    <div class="imds-py-3">
      <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4">

        <!-- 月份导航 -->
        <div class="calendar-nav imds-mb-3">
          <button type="button" id="btn-prev-month" class="imds-button is-ghost" title="上月">
            <span class="imds-icon"><i class="fa-solid fa-angle-left" aria-hidden="true"></i></span>
          </button>
          <span id="nav-title" class="calendar-nav-title"></span>
          <button type="button" id="btn-next-month" class="imds-button is-ghost" title="下月">
            <span class="imds-icon"><i class="fa-solid fa-angle-right" aria-hidden="true"></i></span>
          </button>
          <button type="button" id="btn-today" class="imds-button is-outlined">本月</button>
        </div>

        <!-- 图例 -->
        <div id="calendar-legend" class="calendar-legend imds-mb-2"></div>

        <!-- 日历表格 -->
        <div class="imds-table">
          <div class="imds-table-inner">
            <table id="calendar-table" class="calendar-table" aria-label="日历">
              <thead>
                <tr></tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>

      </section>
    </div>
  </main>
</div>
```

---

## 路由配置（sample_calendar.xml）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<routing-jssp-config
    xmlns="http://www.intra-mart.jp/router/routing-jssp-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/router/routing-jssp-config routing-jssp-config.xsd">

  <!-- 日历画面 -->
  <file-mapping path="/sample/sample_calendar" page="sample_calendar/view/index">
    <authz uri="service://sample/sample_calendar" action="execute" />
  </file-mapping>

</routing-jssp-config>
```

---

## 实现注意事项

### 1. Rhino 的 Java 数组限制：不能使用 `.map()` / `.filter()`

`CalendarInfoManager` 各方法返回的 `result.data` 是 Java 数组（`java.lang.Object[]`），而非 JavaScript 的 `Array`。

```javascript
// NG：对 Java 数组使用 .map() 会报 "Cannot find default value for object" 错误
let names = result.data.map((item) => item.dayInfoName);

// OK：使用 for 循环处理
let names = [];
for (let i = 0; i < result.data.length; i++) {
  names.push(result.data[i].dayInfoName);
}
```

### 2. `getDayInfoSummariesOnMonth` 不支持 `firstDayOfWeek`

`CalendarInfoManager.getDayInfoSummariesOnMonth()` 始终返回**以周日为起始**的固定表格。
无论 `firstDayOfWeek` 值为何，都固定从周日开始，无法支持以周一等为起始日的配置。

应改用 `getDayInfoSummariesOnTerm(calendarId, startDate, endDate)`，在服务器端计算表格范围。

```javascript
// 表格开始日：追溯到 firstDayOfWeek 对应的上月日期
let firstOfMonth = new Date(year, month - 1, 1);
let startDow = firstOfMonth.getDay();
let startOffset = (startDow - firstDayOfWeek + 7) % 7;
let gridStart = new Date(year, month - 1, 1 - startOffset);

// 表格结束日：延伸到最后一个星期（firstDayOfWeek 的前一天）
let lastOfMonth = new Date(year, month, 0);
let endDow = lastOfMonth.getDay();
let lastDayOfWeek = (firstDayOfWeek + 6) % 7;
let endOffset = (lastDayOfWeek - endDow + 7) % 7;
let gridEnd = new Date(year, month - 1, lastOfMonth.getDate() + endOffset);

let result = manager.getDayInfoSummariesOnTerm(calendarId, gridStart, gridEnd);
```

### 3. 禁止使用 `setFirstDayOfWeek`

`CalendarInfoManager` 没有 `setFirstDayOfWeek` 这样的公开 API。
即使存在，调用后也会修改用户的日历设置，因此禁止使用。

### 4. URL 使用基于 `<base>` 标签的相对路径

`<imart type="head">` 标签会注入 `<base href="http://host/imart/">` 标签。
仅包含查询参数的 URL（如 `?year=2026&month=4`）会基于 `<base>` 解析，导致意外跳转到首页。

```javascript
// NG：仅查询参数 → 基于 <base> 变为 imart/?year=2026&month=4
location.href = '?year=' + year + '&month=' + month;

// OK：必须包含路由配置的 path（去掉开头的 /）
location.href = 'sample/sample_calendar?year=' + year + '&month=' + month;

// OK："本月"按钮（无查询参数）→ 服务器端使用系统日期
location.href = 'sample/sample_calendar';
```

### 5. 节假日名称的获取方式：`dayInfos` → `dayInfoNames` 备用

`DayInfoSummary.dayInfoNames`（字符串数组）在某些环境下可能为空。
优先参考 `dayInfos`（`DayInfo[]`）的 i18n 字段，以 `dayInfoNames` 作为备用。

```javascript
function resolveDayInfoNames(summary, locale) {
  let names = [];

  // 优先：dayInfos[j].i18n.dayInfoName[locale] → dayInfos[j].dayInfoName
  if (summary.dayInfos && summary.dayInfos.length > 0) {
    for (let j = 0; j < summary.dayInfos.length; j++) {
      let dayInfo = summary.dayInfos[j];
      let name = '';
      if (dayInfo.i18n && dayInfo.i18n.dayInfoName) {
        name = dayInfo.i18n.dayInfoName[locale] || dayInfo.dayInfoName || '';
      } else {
        name = dayInfo.dayInfoName || '';
      }
      if (name) { names.push(name); }
    }
  }

  // 备用：dayInfoNames（非空时使用）
  if (names.length === 0 && summary.dayInfoNames) {
    for (let j = 0; j < summary.dayInfoNames.length; j++) {
      if (summary.dayInfoNames[j]) { names.push(summary.dayInfoNames[j]); }
    }
  }

  return names;
}
```

### 6. 颜色优先级

日期单元格的文字颜色按以下优先顺序决定：

1. `DayInfoSummary.color`（特定日期的颜色设置）
2. 各星期的颜色（`weekDayMap[dayOfWeek].color`）

今天的日期（`isToday`）忽略颜色设置，使用主题色背景＋白色文字。

### 7. 参考的 d.ts 文件

| d.ts 文件 | 参考内容 |
|---|---|
| `d.ts/tenant/im-ssjs-calendar-info-manager.d.ts` | `CalendarInfoManager` 的方法定义 |
| `d.ts/tenant/object/im-ssjs-day-info-summary.d.ts` | `DayInfoSummary`（`dayInfos`、`dayInfoNames`、`isHoliday`、`color`、`currentDate`） |
| `d.ts/tenant/object/im-ssjs-day-info.d.ts` | `DayInfo`（`dayInfoName`、`i18n`） |
| `d.ts/tenant/object/im-ssjs-day-info-i18n.d.ts` | `DayInfoI18N`（`dayInfoName: { [localeId: string]: string }`） |
| `d.ts/tenant/object/im-ssjs-week-day-info.d.ts` | `WeekDayInfo`（`dayOfWeek`、`color`、`holiday`） |
