# Sample Calendar Screen Template

## Overview

A screen that displays a monthly calendar with holidays, public holidays, and colors based on the calendar selected by the logged-in user.
- Retrieves the user's calendar settings (`calendarId`), first day of week (`firstDayOfWeek`), and locale (`locale`) from `AccountContext`
- Previous/next month navigation and a "This Month" button for month navigation
- Calendar grid dynamically arranges columns according to `firstDayOfWeek`
- Displays holiday/public holiday names in calendar cells (i18n locale support)
- Displays per-weekday color settings as a legend

## File Structure

```
src/main/jssp/src/sample_calendar/view/
  └── index.js              # Function container
  └── index.html            # Presentation page

src/main/conf/routing-jssp-config/
  └── sample_calendar.xml   # Routing configuration
```

---

## Function Container (sample_calendar/view/index.js)

```javascript
/**
 * Sample Calendar Screen
 *
 * @file index.js
 * @description Displays a calendar with holidays, public holidays, and colors
 *              based on the calendar selected by the logged-in user.
 */

// ========================================
// Bind Variables (for presentation page integration)
// ========================================
let $title = 'Calendar';
let $subTitle = 'Sample';
let $data = '{}';

// ========================================
// Entry Point
// ========================================
/**
 * Entry point for screen display.
 * Executed first when the screen URL is accessed.
 *
 * @param {Object} request - Request object
 */
function init(request) {
  let response = main(request);
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

// ========================================
// Main Processing
// ========================================
/**
 * Executes main processing.
 *
 * @param {Object} request - Request parameters
 * @return {Object} Processing result
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
    logger.error('Request parameter validation failed. {}', e.message);
    transferErrorPage('E001', 'Invalid request parameters.');
    return response;
  }

  try {
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('An error occurred while displaying the calendar screen. {}', e.message);
    transferErrorPage('E002', 'An unexpected error occurred.');
    return response;
  }

  return response;
}

// ========================================
// Validation
// ========================================
/**
 * Validates request parameters.
 *
 * @param {Object} request - Request parameters
 * @throws {Error} On validation error
 */
function validateRequest(request) {
  validateYearParam(request);
  validateMonthParam(request);
}

/**
 * Validates the year parameter.
 *
 * @param {Object} request - Request parameters
 * @throws {Error} On validation error
 */
function validateYearParam(request) {
  let yearParam = request['year'];
  if (yearParam === undefined || yearParam === null || yearParam === '') {
    return;
  }
  let year = parseInt(yearParam, 10);
  if (isNaN(year) || year < 1900 || year > 9999) {
    throw new Error('year must be an integer between 1900 and 9999.');
  }
}

/**
 * Validates the month parameter.
 *
 * @param {Object} request - Request parameters
 * @throws {Error} On validation error
 */
function validateMonthParam(request) {
  let monthParam = request['month'];
  if (monthParam === undefined || monthParam === null || monthParam === '') {
    return;
  }
  let month = parseInt(monthParam, 10);
  if (isNaN(month) || month < 1 || month > 12) {
    throw new Error('month must be an integer between 1 and 12.');
  }
}

// ========================================
// Business Logic
// ========================================
/**
 * Executes the main business logic processing.
 *
 * @param {Object} request - Request parameters
 * @return {Object} Processing result
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
 * Determines the year to display.
 *
 * @param {Object} request - Request parameters
 * @param {Date} today - Today's date
 * @return {number} Display year
 */
function resolveYear(request, today) {
  let yearParam = request['year'];
  if (yearParam !== undefined && yearParam !== null && yearParam !== '') {
    return parseInt(yearParam, 10);
  }
  return today.getFullYear();
}

/**
 * Determines the month to display.
 *
 * @param {Object} request - Request parameters
 * @param {Date} today - Today's date
 * @return {number} Display month (1-12)
 */
function resolveMonth(request, today) {
  let monthParam = request['month'];
  if (monthParam !== undefined && monthParam !== null && monthParam !== '') {
    return parseInt(monthParam, 10);
  }
  return today.getMonth() + 1;
}

/**
 * Retrieves the calendar name.
 *
 * @param {string} calendarId - Calendar ID
 * @param {string} locale - Locale ID
 * @return {string} Calendar name
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
 * Retrieves weekday information for the calendar.
 *
 * @param {string} calendarId - Calendar ID
 * @return {Array} Array of weekday information
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
 * Retrieves day information summaries for the specified month.
 *
 * @param {string} calendarId - Calendar ID
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @param {number} firstDayOfWeek - First day of week (0=Sun to 6=Sat)
 * @param {Date} today - Today's date
 * @param {string} locale - Locale ID
 * @return {Array} Array of day information
 */
function getMonthDays(calendarId, year, month, firstDayOfWeek, today, locale) {
  let manager = new CalendarInfoManager();

  // Grid start: go back to the firstDayOfWeek of the previous month
  let firstOfMonth = new Date(year, month - 1, 1);
  let startDow = firstOfMonth.getDay();
  let startOffset = (startDow - firstDayOfWeek + 7) % 7;
  let gridStart = new Date(year, month - 1, 1 - startOffset);

  // Grid end: extend to the last weekday (day before firstDayOfWeek) in the next month
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

    // Extract i18n-aware names from dayInfos, fall back to dayInfoNames
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
 * Retrieves the display name list from a DayInfoSummary.
 * Prefers dayInfos[j].i18n.dayInfoName[locale], falls back to dayInfoNames.
 *
 * @param {DayInfoSummary} summary - Day information summary
 * @param {string} locale - Locale ID
 * @return {string[]} Array of day information names
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
// Error Page Transition
// ========================================
/**
 * Displays an error message full-screen when an error occurs.
 *
 * @param {String} code - Error code
 * @param {String} message - Error message
 */
function transferErrorPage(code, message) {
  let param = {
    title: 'A system error has occurred',
    message: [code, message].join('\n')
  };
  Transfer.toErrorPage(param);
}
```

---

## Presentation Page (sample_calendar/view/index.html)

```html
<!-- Header -->
<imart type="head">
  <!-- Title -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- Bind variable for presentation page integration -->
  <script>const $data = <imart type="string" value=$data escapeXml="false" escapeJs="false" />;</script>
  <!-- Styles -->
  <style>
    /* ===== Calendar Navigation ===== */
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
    /* ===== Calendar Name Badge ===== */
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
    /* ===== Calendar Grid ===== */
    .calendar-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      table-layout: fixed;
      /* Stretch table to fill viewport height minus header/nav/legend */
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
      /* height: 1% distributes table height evenly across rows */
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
    /* Date number */
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
    /* Holiday / public holiday name */
    .calendar-cell-info {
      font-size: 1rem;
      font-weight: 500;
      margin-top: 0.15em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    /* Cells outside the current month */
    .calendar-table td.is-other-month {
      background: #f7f8fa;
      opacity: 0.55;
    }
    /* Holiday cell */
    .calendar-table td.is-holiday {
      background: linear-gradient(160deg, #fff4f4 0%, #fff 80%);
    }
    /* ===== Legend ===== */
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
  <!-- Client-side script -->
  <script>
  document.addEventListener('DOMContentLoaded', () => {

    if ($data.error && $data.error.code) {
      imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      return;
    }

    const data = $data.result;
    if (!data) {
      return;
    }

    // Weekday names (English)
    const WEEK_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Month names (English)
    const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];

    // Weekday info map (dayOfWeek -> {color, holiday})
    const weekDayMap = {};
    (data.weekDays || []).forEach((wd) => {
      weekDayMap[wd.dayOfWeek] = wd;
    });

    // Ordered weekday list adjusted for firstDayOfWeek
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

    // Render weekday headers
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

    // Render day cells
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

          // Date number span
          const daySpan = document.createElement('span');
          daySpan.className = 'calendar-cell-day' + (day.isToday ? ' is-today' : '');

          // Color priority: DayInfoSummary.color → weekday color
          let cellColor = day.color;
          if (!cellColor && weekDayMap[day.dayOfWeek]) {
            cellColor = weekDayMap[day.dayOfWeek].color || '';
          }
          if (cellColor && !day.isToday) {
            daySpan.style.color = cellColor;
          }

          daySpan.textContent = String(day.day);
          td.appendChild(daySpan);

          // Holiday / public holiday name
          if (day.dayInfoNames && day.dayInfoNames.length > 0) {
            const infoDiv = document.createElement('div');
            infoDiv.className = 'calendar-cell-info';
            infoDiv.style.color = cellColor || '';
            infoDiv.title = day.dayInfoNames.join(', ');
            infoDiv.textContent = day.dayInfoNames[0];
            td.appendChild(infoDiv);
          }

          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }
    }

    // Render navigation title
    function renderNavTitle(calendarData) {
      const titleEl = document.getElementById('nav-title');
      if (titleEl) {
        titleEl.textContent = MONTH_NAMES[calendarData.month - 1] + ' ' + calendarData.year;
      }
      const nameEl = document.getElementById('calendar-name');
      if (nameEl) {
        nameEl.textContent = calendarData.calendarName || calendarData.calendarId || '';
      }
    }

    // Build previous/next month URL
    function buildMonthUrl(year, month) {
      return 'sample/sample_calendar?year=' + year + '&month=' + month;
    }

    // Navigation button events
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
          // Navigate without query params → server uses system date
          location.href = 'sample/sample_calendar';
        });
      }
    }

    // Render legend (colors per weekday)
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
        label.textContent = wd.name + (wd.holiday ? ' (Holiday)' : '');
        label.style.color = wd.color;

        item.appendChild(dot);
        item.appendChild(label);
        legendEl.appendChild(item);
      });
    }

    // Entry point
    const firstDayOfWeek = typeof data.firstDayOfWeek === 'number' ? data.firstDayOfWeek : 0;
    const orderedWeekDays = getOrderedWeekDays(firstDayOfWeek);

    renderNavTitle(data);
    renderWeekDayHeaders(orderedWeekDays);
    renderDays(data, orderedWeekDays);
    renderLegend(orderedWeekDays);
    setupNavigation(data);
  });
  </script>
</imart>

<!-- Full-page container -->
<div id="container">
  <div class="imds-container">
    <!-- Header -->
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

    <!-- Main content -->
    <main>
      <div class="imds-py-3">
        <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4">

          <!-- Month navigation -->
          <div class="calendar-nav imds-mb-3">
            <button type="button" id="btn-prev-month" class="imds-button is-ghost" title="Previous Month">
              <span class="imds-icon"><i class="fa-solid fa-angle-left" aria-hidden="true"></i></span>
            </button>
            <span id="nav-title" class="calendar-nav-title"></span>
            <button type="button" id="btn-next-month" class="imds-button is-ghost" title="Next Month">
              <span class="imds-icon"><i class="fa-solid fa-angle-right" aria-hidden="true"></i></span>
            </button>
            <button type="button" id="btn-today" class="imds-button is-outlined">This Month</button>
          </div>

          <!-- Legend -->
          <div id="calendar-legend" class="calendar-legend imds-mb-2"></div>

          <!-- Calendar grid -->
          <div class="imds-table">
            <div class="imds-table-inner">
              <table id="calendar-table" class="calendar-table" aria-label="Calendar">
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
</div>
```

---

## Routing Configuration (sample_calendar.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<routing-jssp-config
    xmlns="http://www.intra-mart.jp/router/routing-jssp-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/router/routing-jssp-config routing-jssp-config.xsd">

  <!-- Default authorization setting -->
  <authz-default mapper="welcome-all" />

  <!-- Calendar screen -->
  <file-mapping path="/sample/sample_calendar" page="sample_calendar/view/index">
  </file-mapping>

</routing-jssp-config>
```

---

## Implementation Notes

### 1. Rhino Java Array Restriction: `.map()` / `.filter()` Cannot Be Used

`result.data` returned by `CalendarInfoManager` methods is a Java array (`java.lang.Object[]`), not a JavaScript `Array`.

```javascript
// NG: Using .map() on a Java array causes "Cannot find default value for object"
let names = result.data.map((item) => item.dayInfoName);

// OK: Use a for loop
let names = [];
for (let i = 0; i < result.data.length; i++) {
  names.push(result.data[i].dayInfoName);
}
```

### 2. `getDayInfoSummariesOnMonth` Does Not Support `firstDayOfWeek`

`CalendarInfoManager.getDayInfoSummariesOnMonth()` always returns a fixed grid starting on **Sunday**.
Regardless of the `firstDayOfWeek` value, it always starts on Sunday, so Monday-first or other configurations are not supported.

Instead, use `getDayInfoSummariesOnTerm(calendarId, startDate, endDate)` and calculate the grid range on the server side.

```javascript
// Grid start: go back to the firstDayOfWeek of the previous month
let firstOfMonth = new Date(year, month - 1, 1);
let startDow = firstOfMonth.getDay();
let startOffset = (startDow - firstDayOfWeek + 7) % 7;
let gridStart = new Date(year, month - 1, 1 - startOffset);

// Grid end: extend to the last weekday (day before firstDayOfWeek)
let lastOfMonth = new Date(year, month, 0);
let endDow = lastOfMonth.getDay();
let lastDayOfWeek = (firstDayOfWeek + 6) % 7;
let endOffset = (lastDayOfWeek - endDow + 7) % 7;
let gridEnd = new Date(year, month - 1, lastOfMonth.getDate() + endOffset);

let result = manager.getDayInfoSummariesOnTerm(calendarId, gridStart, gridEnd);
```

### 3. `setFirstDayOfWeek` Must Not Be Used

There is no `setFirstDayOfWeek` equivalent as a public API on `CalendarInfoManager`.
Even if it existed, calling it would change the user's calendar settings, so it must not be used.

### 4. Use Relative Paths Based on the `<base>` Tag

The `<imart type="head">` tag injects a `<base href="http://host/imart/">` tag.
URLs with only query parameters (e.g., `?year=2026&month=4`) are resolved relative to `<base>`, causing unintended navigation to the home screen.

```javascript
// NG: Query only → resolves to imart/?year=2026&month=4 based on <base>
location.href = '?year=' + year + '&month=' + month;

// OK: Always include the routing path (without the leading /)
location.href = 'sample/sample_calendar?year=' + year + '&month=' + month;

// OK: "This Month" button (no query) → server uses system date
location.href = 'sample/sample_calendar';
```

### 5. How to Retrieve Holiday Names: `dayInfos` → `dayInfoNames` Fallback

`DayInfoSummary.dayInfoNames` (string array) may be empty depending on the environment.
Prefer the i18n field of `dayInfos` (`DayInfo[]`) and fall back to `dayInfoNames`.

```javascript
function resolveDayInfoNames(summary, locale) {
  let names = [];

  // Preferred: dayInfos[j].i18n.dayInfoName[locale] → dayInfos[j].dayInfoName
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

  // Fallback: dayInfoNames (use if not empty)
  if (names.length === 0 && summary.dayInfoNames) {
    for (let j = 0; j < summary.dayInfoNames.length; j++) {
      if (summary.dayInfoNames[j]) { names.push(summary.dayInfoNames[j]); }
    }
  }

  return names;
}
```

### 6. Color Priority

The text color of a date cell is determined in the following priority order:

1. `DayInfoSummary.color` (color setting for a specific date)
2. Per-weekday color (`weekDayMap[dayOfWeek].color`)

For today's date (`isToday`), color settings are ignored and the primary color background with white text is used.

### 7. Referenced d.ts Files

| d.ts File | Referenced Content |
|---|---|
| `d.ts/tenant/im-ssjs-calendar-info-manager.d.ts` | `CalendarInfoManager` method definitions |
| `d.ts/tenant/object/im-ssjs-day-info-summary.d.ts` | `DayInfoSummary` (`dayInfos`, `dayInfoNames`, `isHoliday`, `color`, `currentDate`) |
| `d.ts/tenant/object/im-ssjs-day-info.d.ts` | `DayInfo` (`dayInfoName`, `i18n`) |
| `d.ts/tenant/object/im-ssjs-day-info-i18n.d.ts` | `DayInfoI18N` (`dayInfoName: { [localeId: string]: string }`) |
| `d.ts/tenant/object/im-ssjs-week-day-info.d.ts` | `WeekDayInfo` (`dayOfWeek`, `color`, `holiday`) |
