# サンプルカレンダー画面テンプレート

## 概要

ログインユーザが選択しているカレンダーに基づいて、休日・祝日・色が反映された月次カレンダーを表示する画面。
- ユーザのカレンダー設定（`calendarId`）・週の開始曜日（`firstDayOfWeek`）・ロケール（`locale`）を `AccountContext` から取得
- 前月・翌月ナビゲーション、「今月」ボタンによる月移動
- カレンダーグリッドは `firstDayOfWeek` に対応した動的な列配置
- 祝日名・休日名をカレンダーセルに表示（i18n ロケール対応）
- 曜日ごとの色設定を凡例として表示

## ファイル構成

```
src/main/jssp/src/sample_calendar/view/
  └── index.js              # ファンクションコンテナ
  └── index.html            # プレゼンテーションページ

src/main/conf/routing-jssp-config/
  └── sample_calendar.xml   # ルーティング設定
```

---

## ファンクションコンテナ（sample_calendar/view/index.js）

```javascript
/**
 * サンプルカレンダー画面
 *
 * @file index.js
 * @description ログインユーザが選択しているカレンダーに基づいて休日・祝日・色を反映したカレンダーを表示します。
 */

// ========================================
// バインド変数（プレゼンテーションページ連携用）
// ========================================
let $title = 'カレンダー';
let $subTitle = 'サンプル';
let $data = '{}';

// ========================================
// エントリーポイント
// ========================================
/**
 * 画面表示のエントリーポイントです。
 * 画面のURLにアクセスされたとき、最初に実行されます。
 *
 * @param {Object} request - リクエストオブジェクト
 */
function init(request) {
  let response = main(request);
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

// ========================================
// メイン処理
// ========================================
/**
 * メイン処理を実行します。
 *
 * @param {Object} request - リクエストパラメータ
 * @return {Object} 処理結果
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
    logger.error('リクエストパラメータのバリデーションに失敗しました。{}', e.message);
    transferErrorPage('E001', 'リクエストパラメータが不正です。');
    return response;
  }

  try {
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('カレンダー画面の表示中にエラーが発生しました。{}', e.message);
    transferErrorPage('E002', '予期しないエラーが発生しました。');
    return response;
  }

  return response;
}

// ========================================
// バリデーション
// ========================================
/**
 * リクエストパラメータの検証を行います。
 *
 * @param {Object} request - リクエストパラメータ
 * @throws {Error} バリデーションエラー時
 */
function validateRequest(request) {
  validateYearParam(request);
  validateMonthParam(request);
}

/**
 * year パラメータを検証します。
 *
 * @param {Object} request - リクエストパラメータ
 * @throws {Error} バリデーションエラー時
 */
function validateYearParam(request) {
  let yearParam = request['year'];
  if (yearParam === undefined || yearParam === null || yearParam === '') {
    return;
  }
  let year = parseInt(yearParam, 10);
  if (isNaN(year) || year < 1900 || year > 9999) {
    throw new Error('year は 1900 〜 9999 の整数で指定してください。');
  }
}

/**
 * month パラメータを検証します。
 *
 * @param {Object} request - リクエストパラメータ
 * @throws {Error} バリデーションエラー時
 */
function validateMonthParam(request) {
  let monthParam = request['month'];
  if (monthParam === undefined || monthParam === null || monthParam === '') {
    return;
  }
  let month = parseInt(monthParam, 10);
  if (isNaN(month) || month < 1 || month > 12) {
    throw new Error('month は 1 〜 12 の整数で指定してください。');
  }
}

// ========================================
// ビジネスロジック
// ========================================
/**
 * ビジネスロジックのメイン処理を実行します。
 *
 * @param {Object} request - リクエストパラメータ
 * @return {Object} 処理結果
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
 * 表示対象の年を決定します。
 *
 * @param {Object} request - リクエストパラメータ
 * @param {Date} today - 今日の日付
 * @return {number} 表示年
 */
function resolveYear(request, today) {
  let yearParam = request['year'];
  if (yearParam !== undefined && yearParam !== null && yearParam !== '') {
    return parseInt(yearParam, 10);
  }
  return today.getFullYear();
}

/**
 * 表示対象の月を決定します。
 *
 * @param {Object} request - リクエストパラメータ
 * @param {Date} today - 今日の日付
 * @return {number} 表示月（1〜12）
 */
function resolveMonth(request, today) {
  let monthParam = request['month'];
  if (monthParam !== undefined && monthParam !== null && monthParam !== '') {
    return parseInt(monthParam, 10);
  }
  return today.getMonth() + 1;
}

/**
 * カレンダー名を取得します。
 *
 * @param {string} calendarId - カレンダーID
 * @param {string} locale - ロケールID
 * @return {string} カレンダー名
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
 * カレンダーの曜日情報を取得します。
 *
 * @param {string} calendarId - カレンダーID
 * @return {Array} 曜日情報の配列
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
 * 指定月の日付情報サマリを取得します。
 *
 * @param {string} calendarId - カレンダーID
 * @param {number} year - 年
 * @param {number} month - 月（1〜12）
 * @param {number} firstDayOfWeek - 週の開始曜日（0=日曜〜6=土曜）
 * @param {Date} today - 今日の日付
 * @param {string} locale - ロケールID
 * @return {Array} 日付情報の配列
 */
function getMonthDays(calendarId, year, month, firstDayOfWeek, today, locale) {
  let manager = new CalendarInfoManager();

  // グリッド開始日: firstDayOfWeek の曜日まで前月に遡る
  let firstOfMonth = new Date(year, month - 1, 1);
  let startDow = firstOfMonth.getDay();
  let startOffset = (startDow - firstDayOfWeek + 7) % 7;
  let gridStart = new Date(year, month - 1, 1 - startOffset);

  // グリッド終了日: グリッドの最終曜日（firstDayOfWeek の前日）まで翌月に延ばす
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

    // dayInfos から i18n 対応の名称を抽出し、dayInfoNames をフォールバックとする
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
 * DayInfoSummary から表示用の日付情報名リストを取得します。
 * dayInfos の i18n ロケール名を優先し、フォールバックとして dayInfoNames を使用します。
 *
 * @param {DayInfoSummary} summary - 日付情報サマリ
 * @param {string} locale - ロケールID
 * @return {string[]} 日付情報名の配列
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
// エラーページ遷移
// ========================================
/**
 * エラーが発生したときにエラーメッセージを全画面に表示します。
 *
 * @param {String} code - エラーコード
 * @param {String} message - エラーメッセージ
 */
function transferErrorPage(code, message) {
  let param = {
    title: 'システムエラーが発生しました',
    message: [code, message].join('\n')
  };
  Transfer.toErrorPage(param);
}
```

---

## プレゼンテーションページ（sample_calendar/view/index.html）

```html
<!-- ヘッダ -->
<imart type="head">
  <!-- タイトル -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- スタイル -->
  <style>
    /* ===== カレンダーナビゲーション ===== */
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
    /* ===== カレンダー名バッジ ===== */
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
    /* ===== カレンダーグリッド ===== */
    .calendar-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      table-layout: fixed;
      /* ビューポート高さからヘッダ・ナビ・凡例分を引いてテーブルを画面いっぱいに広げる */
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
      /* height: 1% にすることでテーブルの高さを行数で均等分配する */
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
    /* 日付番号 */
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
    /* 祝日名・休日名 */
    .calendar-cell-info {
      font-size: 1rem;
      font-weight: 500;
      margin-top: 0.15em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    /* 当月以外のセル */
    .calendar-table td.is-other-month {
      background: #f7f8fa;
      opacity: 0.55;
    }
    /* 休日セル */
    .calendar-table td.is-holiday {
      background: linear-gradient(160deg, #fff4f4 0%, #fff 80%);
    }
    /* ===== 凡例 ===== */
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
  <!-- クライアントサイドスクリプト（$data をグローバル領域に置かず IIFE でスコープ化する） -->
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

    // 曜日名（日本語）
    const WEEK_DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

    // 曜日情報マップ（dayOfWeek -> {color, holiday}）
    const weekDayMap = {};
    (data.weekDays || []).forEach((wd) => {
      weekDayMap[wd.dayOfWeek] = wd;
    });

    // 週の開始曜日に合わせた曜日順序リスト
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

    // 曜日ヘッダ描画
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

    // 日付セル描画
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

          // 日付番号のスパン
          const daySpan = document.createElement('span');
          daySpan.className = 'calendar-cell-day' + (day.isToday ? ' is-today' : '');

          // 色の決定: DayInfoSummary.color → 曜日色 の優先順
          let cellColor = day.color;
          if (!cellColor && weekDayMap[day.dayOfWeek]) {
            cellColor = weekDayMap[day.dayOfWeek].color || '';
          }
          if (cellColor && !day.isToday) {
            daySpan.style.color = cellColor;
          }

          daySpan.textContent = String(day.day);
          td.appendChild(daySpan);

          // 日付情報名（休日名・祝日名）
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

    // ナビゲーションタイトル描画
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

    // 前月・翌月 URL 生成
    function buildMonthUrl(year, month) {
      return 'sample/sample_calendar?year=' + year + '&month=' + month;
    }

    // ナビゲーションボタンイベント
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
          // クエリパラメータなしで遷移 → サーバ側でシステム日付の年月を使用
          location.href = 'sample/sample_calendar';
        });
      }
    }

    // 凡例描画（曜日ごとの色）
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
        label.textContent = wd.name + '曜日' + (wd.holiday ? '（休日）' : '');
        label.style.color = wd.color;

        item.appendChild(dot);
        item.appendChild(label);
        legendEl.appendChild(item);
      });
    }

    // エントリーポイント
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

<!-- ページ全体のコンテナ -->
<div id="container">
  <div class="imds-container">
    <!-- ヘッダ -->
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

    <!-- メインコンテンツ -->
    <main>
      <div class="imds-py-3">
        <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4">

          <!-- 月ナビゲーション -->
          <div class="calendar-nav imds-mb-3">
            <button type="button" id="btn-prev-month" class="imds-button is-ghost" title="前月">
              <span class="imds-icon"><i class="fa-solid fa-angle-left" aria-hidden="true"></i></span>
            </button>
            <span id="nav-title" class="calendar-nav-title"></span>
            <button type="button" id="btn-next-month" class="imds-button is-ghost" title="翌月">
              <span class="imds-icon"><i class="fa-solid fa-angle-right" aria-hidden="true"></i></span>
            </button>
            <button type="button" id="btn-today" class="imds-button is-outlined">今月</button>
          </div>

          <!-- 凡例 -->
          <div id="calendar-legend" class="calendar-legend imds-mb-2"></div>

          <!-- カレンダーグリッド -->
          <div class="imds-table">
            <div class="imds-table-inner">
              <table id="calendar-table" class="calendar-table" aria-label="カレンダー">
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

## ルーティング設定（sample_calendar.xml）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<routing-jssp-config
    xmlns="http://www.intra-mart.jp/router/routing-jssp-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/router/routing-jssp-config routing-jssp-config.xsd">

  <!-- カレンダー画面 -->
  <file-mapping path="/sample/sample_calendar" page="sample_calendar/view/index">
    <authz uri="service://sample/sample_calendar" action="execute" />
  </file-mapping>

</routing-jssp-config>
```

---

## 実装上の注意点

### 1. Rhino の Java 配列制約：`.map()` / `.filter()` は使用不可

`CalendarInfoManager` の各メソッドが返す `result.data` は Java の配列（`java.lang.Object[]`）であり、JavaScript の `Array` ではない。

```javascript
// NG: Java 配列に .map() を使うと "Cannot find default value for object" エラー
let names = result.data.map((item) => item.dayInfoName);

// OK: for ループで処理する
let names = [];
for (let i = 0; i < result.data.length; i++) {
  names.push(result.data[i].dayInfoName);
}
```

### 2. `getDayInfoSummariesOnMonth` は `firstDayOfWeek` に非対応

`CalendarInfoManager.getDayInfoSummariesOnMonth()` は常に **日曜始まり**の固定グリッドを返す。
`firstDayOfWeek` の値に関わらず日曜から始まるため、月曜始まり等の対応はできない。

代わりに `getDayInfoSummariesOnTerm(calendarId, startDate, endDate)` を使い、サーバ側でグリッド範囲を計算する。

```javascript
// グリッド開始日：firstDayOfWeek の曜日まで前月に遡る
let firstOfMonth = new Date(year, month - 1, 1);
let startDow = firstOfMonth.getDay();
let startOffset = (startDow - firstDayOfWeek + 7) % 7;
let gridStart = new Date(year, month - 1, 1 - startOffset);

// グリッド終了日：最終曜日（firstDayOfWeek の前日）まで翌月に延ばす
let lastOfMonth = new Date(year, month, 0);
let endDow = lastOfMonth.getDay();
let lastDayOfWeek = (firstDayOfWeek + 6) % 7;
let endOffset = (lastDayOfWeek - endDow + 7) % 7;
let gridEnd = new Date(year, month - 1, lastOfMonth.getDate() + endOffset);

let result = manager.getDayInfoSummariesOnTerm(calendarId, gridStart, gridEnd);
```

### 3. `setFirstDayOfWeek` は使用禁止

`CalendarInfoManager` に `setFirstDayOfWeek` に相当するメソッドは公開 API として存在しない。
仮に存在しても呼び出すとユーザのカレンダー設定を変更してしまうため、使用してはならない。

### 4. URL は `<base>` タグ基準の相対パスを使う

`<imart type="head">` によって `<base href="http://host/imart/">` タグが注入される。
クエリパラメータのみ（例: `?year=2026&month=4`）の URL は `<base>` 基準で解釈されるため、
意図しないホーム画面への遷移が発生する。

```javascript
// NG: クエリのみ → "<base>" 基準で imart/?year=2026&month=4 になる
location.href = '?year=' + year + '&month=' + month;

// OK: ルーティング設定の path（先頭 / を除いたもの）を必ず含める
location.href = 'sample/sample_calendar?year=' + year + '&month=' + month;

// OK: 「今月」ボタン（クエリなし）→ サーバ側でシステム日付を使用
location.href = 'sample/sample_calendar';
```

### 5. 祝日名の取得方法：`dayInfos` → `dayInfoNames` フォールバック

`DayInfoSummary.dayInfoNames`（文字列配列）は環境によって空の場合がある。
`dayInfos`（`DayInfo[]`）の i18n フィールドを優先的に参照し、フォールバックとして `dayInfoNames` を使用する。

```javascript
function resolveDayInfoNames(summary, locale) {
  let names = [];

  // 優先: dayInfos[j].i18n.dayInfoName[locale] → dayInfos[j].dayInfoName
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

  // フォールバック: dayInfoNames（空でなければ使用）
  if (names.length === 0 && summary.dayInfoNames) {
    for (let j = 0; j < summary.dayInfoNames.length; j++) {
      if (summary.dayInfoNames[j]) { names.push(summary.dayInfoNames[j]); }
    }
  }

  return names;
}
```

### 6. 色の優先順

日付セルの文字色は以下の優先順で決定する。

1. `DayInfoSummary.color`（特定日付の色設定）
2. 曜日ごとの色（`weekDayMap[dayOfWeek].color`）

今日の日付（`isToday`）の場合は色設定を無視し、プライマリカラーの背景＋白文字を使用する。

### 7. 参照する d.ts

| d.ts ファイル | 参照する内容 |
|---|---|
| `d.ts/tenant/im-ssjs-calendar-info-manager.d.ts` | `CalendarInfoManager` のメソッド定義 |
| `d.ts/tenant/object/im-ssjs-day-info-summary.d.ts` | `DayInfoSummary`（`dayInfos`, `dayInfoNames`, `isHoliday`, `color`, `currentDate`） |
| `d.ts/tenant/object/im-ssjs-day-info.d.ts` | `DayInfo`（`dayInfoName`, `i18n`） |
| `d.ts/tenant/object/im-ssjs-day-info-i18n.d.ts` | `DayInfoI18N`（`dayInfoName: { [localeId: string]: string }`） |
| `d.ts/tenant/object/im-ssjs-week-day-info.d.ts` | `WeekDayInfo`（`dayOfWeek`, `color`, `holiday`） |
