# Sample Calendar Screen Template

## Overview

A screen that displays a monthly calendar with holidays, public holidays, and colors based on the calendar selected by the logged-in user.
- Retrieves the user's calendar settings (`calendarId`), first day of week (`firstDayOfWeek`), and locale (`locale`) from `AccountContext`
- Previous/next month navigation and a "This Month" button for month navigation
- Calendar grid dynamically arranges columns according to `firstDayOfWeek`
- Displays holiday/public holiday names in calendar cells (i18n locale support)
- Displays per-weekday color settings as a legend

### Correspondence with imds Templates

- The page skeleton follows the layout control pattern of the list page template `assets/imds-list-page.md` in the `jssp-imds-theme` skill
- For the decorative color classes for cell backgrounds (`is-gray` / `is-red`), see `reference/imds-html-table.md` in the `jssp-imds-theme` skill

## File Structure

```
src/main/jssp/src/sample/sample_calendar/view/
  ├── index.js              # Function container
  └── index.html            # Presentation page

src/main/conf/routing-jssp-config/
  └── sample_calendar.xml   # Routing configuration
```

---

## Function Container (sample/sample_calendar/view/index.js)

```javascript
/**
 * Sample Calendar Screen
 *
 * @file index.js
 * @description Displays a calendar with holidays, public holidays, and colors based on the calendar selected by the logged-in user.
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
  let startDayOfWeek = firstOfMonth.getDay();
  let startOffset = (startDayOfWeek - firstDayOfWeek + 7) % 7;
  let gridStart = new Date(year, month - 1, 1 - startOffset);

  // Grid end: extend to the last weekday (day before firstDayOfWeek) in the next month
  let lastOfMonth = new Date(year, month, 0);
  let endDayOfWeek = lastOfMonth.getDay();
  let lastDayOfWeek = (firstDayOfWeek + 6) % 7;
  let endOffset = (lastDayOfWeek - endDayOfWeek + 7) % 7;
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
    let currentDate = summary.currentDate;
    let dateYear = currentDate.getFullYear();
    let dateMonth = currentDate.getMonth() + 1;
    let dateDay = currentDate.getDate();

    // Extract i18n-aware names from dayInfos, fall back to dayInfoNames
    let dayInfoNames = resolveDayInfoNames(summary, locale);

    dayList.push({
      year: dateYear,
      month: dateMonth,
      day: dateDay,
      dayOfWeek: currentDate.getDay(),
      isCurrentMonth: (dateYear === year && dateMonth === month),
      isToday: (dateYear === todayYear && dateMonth === todayMonth && dateDay === todayDay),
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

## Presentation Page (sample/sample_calendar/view/index.html)

```html
<!-- Header -->
<imart type="head">
  <!-- Title -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- CSS that controls the height/width of the content area, which differs per theme -->
  <link rel="stylesheet" type="text/css" href="im_design_system/theme/css/theme-conditional-layout.css" />
  <!-- Presentation page custom styles -->
  <style>
    /* Layout control styles */
    .pgstyle-layout-container {
      grid-template-rows: 5rem minmax(0, 1fr);
      grid-template-columns: 100%;
      height: 100%;
      display: grid;
    }
    .pgstyle-layout-container > .imds-header {
      grid-row: 1 / 2;
    }
    .pgstyle-layout-main {
      flex-direction: column;
      grid-row: 2 / 3;
      height: 100%;
      display: flex;
    }
    .pgstyle-layout-content {
      flex: 1 0 0;
      overflow: auto;
    }
    .pgstyle-table-wrapper {
      display: flex;
      flex-direction: column;
    }
    /* Monthly calendar grid (imds has no equivalent component, so only the date cell rendering is custom) */
    #calendar-table {
      table-layout: fixed;
      height: 100%;
    }
    #calendar-table td {
      vertical-align: top;
      /* height: 1% distributes table height evenly across rows */
      height: 1%;
    }
    /* Date number */
    .calendar-cell-day {
      font-size: 2rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.4em;
      height: 1.4em;
      border-radius: 50%;
      line-height: 1;
    }
    /* Today's date (the circle background color may be adjusted per screen) */
    .calendar-cell-day-today {
      background: #005BAC;
      color: #fff;
    }
    /* Dates outside the current month are shown with faded text */
    .calendar-cell-muted {
      opacity: 0.55;
    }
    /* Holiday / public holiday name */
    .calendar-cell-info {
      font-size: 1rem;
    }
    /* Legend color swatch (the per-weekday color is set dynamically) */
    .calendar-legend-dot {
      width: 0.75em;
      height: 0.75em;
      border-radius: 50%;
      display: inline-block;
      border: 1px solid rgba(0, 0, 0, 0.12);
      flex-shrink: 0;
    }
  </style>
  <!-- Client-side script (scope $data via an IIFE instead of leaving it in the global scope) -->
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

    // Weekday names (English)
    const WEEK_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Weekday info map (dayOfWeek -> {color, holiday})
    const weekDayMap = {};
    (data.weekDays || []).forEach((weekDay) => {
      weekDayMap[weekDay.dayOfWeek] = weekDay;
    });

    // Ordered weekday list adjusted for firstDayOfWeek
    function getOrderedWeekDays(firstDayOfWeek) {
      const ordered = [];
      for (let i = 0; i < 7; i++) {
        const dayOfWeek = (firstDayOfWeek + i) % 7;
        ordered.push({
          dayOfWeek: dayOfWeek,
          name: WEEK_DAY_NAMES[dayOfWeek],
          color: weekDayMap[dayOfWeek] ? (weekDayMap[dayOfWeek].color || '') : '',
          holiday: weekDayMap[dayOfWeek] ? weekDayMap[dayOfWeek].holiday : false
        });
      }
      return ordered;
    }

    // Render weekday headers
    function renderWeekDayHeaders(orderedWeekDays) {
      const headerRow = document.querySelector('#calendar-table thead tr');
      if (!headerRow) { return; }
      headerRow.textContent = '';
      orderedWeekDays.forEach((weekDay) => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.style.color = weekDay.color || '';
        th.textContent = weekDay.name;
        headerRow.appendChild(th);
      });
    }

    // Render day cells
    function renderDays(calendarData, orderedWeekDays) {
      const tbody = document.querySelector('#calendar-table tbody');
      if (!tbody) { return; }
      tbody.textContent = '';

      const days = calendarData.days || [];
      const columnCount = orderedWeekDays.length;
      const rowCount = Math.ceil(days.length / columnCount);

      for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const tr = document.createElement('tr');
        for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
          const dayIndex = rowIndex * columnCount + columnIndex;
          if (dayIndex >= days.length) {
            tr.appendChild(document.createElement('td'));
            continue;
          }
          const day = days[dayIndex];
          const td = document.createElement('td');

          // Cell background uses imds table decorative color classes (outside current month: gray, holiday: red)
          if (!day.isCurrentMonth) {
            td.className = 'is-gray';
          } else if (day.isHoliday) {
            td.className = 'is-red';
          }

          // Date number span
          const daySpan = document.createElement('span');
          daySpan.className = 'calendar-cell-day has-text-weight-bold' + (day.isToday ? ' calendar-cell-day-today' : '') + (day.isCurrentMonth ? '' : ' calendar-cell-muted');

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
            infoDiv.className = 'calendar-cell-info imds-line-clamp-1 imds-mt-1' + (day.isCurrentMonth ? '' : ' calendar-cell-muted');
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
      const titleElement = document.getElementById('nav-title');
      if (titleElement) {
        titleElement.textContent = new Date(calendarData.year, calendarData.month - 1, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      }
      const nameElement = document.getElementById('calendar-name');
      if (nameElement) {
        nameElement.textContent = calendarData.calendarName || calendarData.calendarId || '';
      }
    }

    // Build previous/next month URL
    function buildMonthUrl(year, month) {
      return 'sample/sample_calendar?year=' + year + '&month=' + month;
    }

    // Navigation button events
    function setupNavigation(calendarData) {
      const prevButton = document.getElementById('prev-month-button');
      const nextButton = document.getElementById('next-month-button');
      const todayButton = document.getElementById('this-month-button');

      if (prevButton) {
        prevButton.addEventListener('click', () => {
          let year = calendarData.year;
          let month = calendarData.month - 1;
          if (month < 1) { month = 12; year -= 1; }
          location.href = buildMonthUrl(year, month);
        });
      }
      if (nextButton) {
        nextButton.addEventListener('click', () => {
          let year = calendarData.year;
          let month = calendarData.month + 1;
          if (month > 12) { month = 1; year += 1; }
          location.href = buildMonthUrl(year, month);
        });
      }
      if (todayButton) {
        todayButton.addEventListener('click', () => {
          // Navigate without query params → server uses system date
          location.href = 'sample/sample_calendar';
        });
      }
    }

    // Render legend (colors per weekday)
    function renderLegend(orderedWeekDays) {
      const legendElement = document.getElementById('calendar-legend');
      if (!legendElement) { return; }
      legendElement.textContent = '';

      orderedWeekDays.forEach((weekDay) => {
        if (!weekDay.color) { return; }
        const item = document.createElement('span');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '0.4em';

        const dot = document.createElement('span');
        dot.className = 'calendar-legend-dot';
        dot.style.background = weekDay.color;

        const label = document.createElement('span');
        label.textContent = weekDay.name + (weekDay.holiday ? ' (Holiday)' : '');
        label.style.color = weekDay.color;

        item.appendChild(dot);
        item.appendChild(label);
        legendElement.appendChild(item);
      });

      // Keep the legend hidden when no weekday has a color setting
      legendElement.style.display = legendElement.hasChildNodes() ? 'flex' : 'none';
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
  })(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
  </script>
</imart>

<!-- Full-page container (no id is added, since it is placed inside the intra-mart theme's <div id="imui-container">) -->
<div class="imds-container pgstyle-layout-container">
  <!-- Header -->
  <header class="imds-header">
    <div class="imds-header-icon">
      <span class="imds-icon-wrapper is-large">
        <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
      </span>
    </div>
    <div class="imds-header-title">
      <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
      <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
    </div>
    <!-- Calendar name (Tag in the header) -->
    <div class="imds-header-additional">
      <span class="imds-tag is-blue is-rounded"><span id="calendar-name"></span></span>
    </div>
  </header>

  <!-- Main content -->
  <main class="pgstyle-layout-main">
    <div class="imds-px-3 imds-py-2 pgstyle-table-wrapper pgstyle-layout-content imds-scrollbar">
      <!-- Month navigation -->
      <div class="imds-mb-2" style="display: flex; align-items: center; gap: 0.75em;">
        <button type="button" id="prev-month-button" class="imds-button is-ghost" title="Previous Month" aria-label="Previous Month">
          <span class="imds-icon"><i class="fa-solid fa-angle-left" aria-hidden="true"></i></span>
        </button>
        <span id="nav-title" class="has-text-weight-bold has-text-centered" style="font-size: 1.6rem; min-width: 9em;"></span>
        <button type="button" id="next-month-button" class="imds-button is-ghost" title="Next Month" aria-label="Next Month">
          <span class="imds-icon"><i class="fa-solid fa-angle-right" aria-hidden="true"></i></span>
        </button>
        <button type="button" id="this-month-button" class="imds-button is-outlined">This Month</button>
      </div>
      <!-- Legend (stays hidden when no weekday has a color setting) -->
      <div id="calendar-legend" class="imds-mb-2 imds-px-3 imds-py-2 imds-border-1 has-background-color-gray" style="display: none; flex-wrap: wrap; gap: 0.5em 1.25em; font-size: 0.85rem;"></div>
      <!-- Calendar grid -->
      <div class="imds-table is-area-bordered is-bordered is-sticky" style="height: 100%">
        <div class="imds-table-inner">
          <table id="calendar-table" aria-label="Calendar">
            <thead>
              <tr></tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
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

  <!-- Calendar screen -->
  <file-mapping path="/sample/sample_calendar" page="sample/sample_calendar/view/index">
    <authz uri="service://sample/sample_calendar" action="execute" />
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
let startDayOfWeek = firstOfMonth.getDay();
let startOffset = (startDayOfWeek - firstDayOfWeek + 7) % 7;
let gridStart = new Date(year, month - 1, 1 - startOffset);

// Grid end: extend to the last weekday (day before firstDayOfWeek)
let lastOfMonth = new Date(year, month, 0);
let endDayOfWeek = lastOfMonth.getDay();
let lastDayOfWeek = (firstDayOfWeek + 6) % 7;
let endOffset = (lastDayOfWeek - endDayOfWeek + 7) % 7;
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

For today's date (`isToday`), color settings are ignored and the date is shown with a circle background and white text (`calendar-cell-day-today`).
Cell background colors are specified with the imds table decorative color classes (outside the current month: `is-gray`, holiday: `is-red`) instead of custom CSS.

### 7. Referenced d.ts Files

| d.ts File | Referenced Content |
|---|---|
| `d.ts/tenant/im-ssjs-calendar-info-manager.d.ts` | `CalendarInfoManager` method definitions |
| `d.ts/tenant/object/im-ssjs-day-info-summary.d.ts` | `DayInfoSummary` (`dayInfos`, `dayInfoNames`, `isHoliday`, `color`, `currentDate`) |
| `d.ts/tenant/object/im-ssjs-day-info.d.ts` | `DayInfo` (`dayInfoName`, `i18n`) |
| `d.ts/tenant/object/im-ssjs-day-info-i18n.d.ts` | `DayInfoI18N` (`dayInfoName: { [localeId: string]: string }`) |
| `d.ts/tenant/object/im-ssjs-week-day-info.d.ts` | `WeekDayInfo` (`dayOfWeek`, `color`, `holiday`) |
