# サンプルカレンダー画面テンプレート

## 概要

ログインユーザが選択しているカレンダーに基づいて、休日・祝日・色が反映された月次カレンダーを表示する画面。
- ユーザのカレンダー設定（`calendarId`）・週の開始曜日（`firstDayOfWeek`）・ロケール（`locale`）を `AccountContext` から取得
- 前月・翌月ナビゲーション、「今月」ボタンによる月移動
- カレンダーグリッドは `firstDayOfWeek` に対応した動的な列配置
- 祝日名・休日名をカレンダーセルに表示（i18n ロケール対応）
- 曜日ごとの色設定を凡例として表示

### imds テンプレートとの対応

- ページ骨格は `jssp-imds-theme` スキルの一覧画面テンプレート `assets/imds-list-page.md` のレイアウト制御パターンに準拠する
- セル背景の装飾色クラス（`is-gray` / `is-red`）は `jssp-imds-theme` スキルの `reference/imds-html-table.md` を参照する

## ファイル構成

```
src/main/jssp/src/sample/sample_calendar/view/
  ├── index.js              # ファンクションコンテナ
  └── index.html            # プレゼンテーションページ

src/main/conf/routing-jssp-config/
  └── sample_calendar.xml   # ルーティング設定
```

---

## ファンクションコンテナ（sample/sample_calendar/view/index.js）

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
  let startDayOfWeek = firstOfMonth.getDay();
  let startOffset = (startDayOfWeek - firstDayOfWeek + 7) % 7;
  let gridStart = new Date(year, month - 1, 1 - startOffset);

  // グリッド終了日: グリッドの最終曜日（firstDayOfWeek の前日）まで翌月に延ばす
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

    // dayInfos から i18n 対応の名称を抽出し、dayInfoNames をフォールバックとする
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

## プレゼンテーションページ（sample/sample_calendar/view/index.html）

```html
<!-- ヘッダ -->
<imart type="head">
  <!-- タイトル -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- テーマごとに異なるコンテンツ表示領域の高さ・幅を制御する CSS -->
  <link rel="stylesheet" type="text/css" href="im_design_system/theme/css/theme-conditional-layout.css" />
  <!-- プレゼンテーションページの独自スタイル -->
  <style>
    /* レイアウト制御用スタイル */
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
    /* 月次カレンダーグリッド（imds に該当コンポーネントが無いため日付セルの描画のみ独自に定義する） */
    #calendar-table {
      table-layout: fixed;
      height: 100%;
    }
    #calendar-table td {
      vertical-align: top;
      /* height: 1% にすることでテーブルの高さを行数で均等分配する */
      height: 1%;
    }
    /* 日付番号 */
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
    /* 今日の日付（丸背景の色は画面ごとに調整してよい） */
    .calendar-cell-day-today {
      background: #005BAC;
      color: #fff;
    }
    /* 当月以外の日付は文字を薄く表示する */
    .calendar-cell-muted {
      opacity: 0.55;
    }
    /* 祝日名・休日名 */
    .calendar-cell-info {
      font-size: 1rem;
    }
    /* 凡例の色見本（曜日ごとの色を動的に設定する） */
    .calendar-legend-dot {
      width: 0.75em;
      height: 0.75em;
      border-radius: 50%;
      display: inline-block;
      border: 1px solid rgba(0, 0, 0, 0.12);
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
    (data.weekDays || []).forEach((weekDay) => {
      weekDayMap[weekDay.dayOfWeek] = weekDay;
    });

    // 週の開始曜日に合わせた曜日順序リスト
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

    // 曜日ヘッダ描画
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

    // 日付セル描画
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

          // セル背景色は imds テーブルの装飾色クラスで指定する（当月以外: グレー、休日: 赤）
          if (!day.isCurrentMonth) {
            td.className = 'is-gray';
          } else if (day.isHoliday) {
            td.className = 'is-red';
          }

          // 日付番号のスパン
          const daySpan = document.createElement('span');
          daySpan.className = 'calendar-cell-day has-text-weight-bold' + (day.isToday ? ' calendar-cell-day-today' : '') + (day.isCurrentMonth ? '' : ' calendar-cell-muted');

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
            infoDiv.className = 'calendar-cell-info imds-line-clamp-1 imds-mt-1' + (day.isCurrentMonth ? '' : ' calendar-cell-muted');
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
      const titleElement = document.getElementById('nav-title');
      if (titleElement) {
        titleElement.textContent = calendarData.year + '年' + calendarData.month + '月';
      }
      const nameElement = document.getElementById('calendar-name');
      if (nameElement) {
        nameElement.textContent = calendarData.calendarName || calendarData.calendarId || '';
      }
    }

    // 前月・翌月 URL 生成
    function buildMonthUrl(year, month) {
      return 'sample/sample_calendar?year=' + year + '&month=' + month;
    }

    // ナビゲーションボタンイベント
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
          // クエリパラメータなしで遷移 → サーバ側でシステム日付の年月を使用
          location.href = 'sample/sample_calendar';
        });
      }
    }

    // 凡例描画（曜日ごとの色）
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
        label.textContent = weekDay.name + '曜日' + (weekDay.holiday ? '（休日）' : '');
        label.style.color = weekDay.color;

        item.appendChild(dot);
        item.appendChild(label);
        legendElement.appendChild(item);
      });

      // 色設定のある曜日が 1 つも無い場合は凡例を非表示のままにする
      legendElement.style.display = legendElement.hasChildNodes() ? 'flex' : 'none';
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

<!-- ページ全体のコンテナ（intra-mart テーマの imui-container の内側に配置されるため id は付与しない） -->
<div class="imds-container pgstyle-layout-container">
  <!-- ヘッダ -->
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
    <!-- カレンダー名（ヘッダの Tag） -->
    <div class="imds-header-additional">
      <span class="imds-tag is-blue is-rounded"><span id="calendar-name"></span></span>
    </div>
  </header>

  <!-- メインコンテンツ -->
  <main class="pgstyle-layout-main">
    <div class="imds-px-3 imds-py-2 pgstyle-table-wrapper pgstyle-layout-content imds-scrollbar">
      <!-- 月ナビゲーション -->
      <div class="imds-mb-2" style="display: flex; align-items: center; gap: 0.75em;">
        <button type="button" id="prev-month-button" class="imds-button is-ghost" title="前月" aria-label="前月">
          <span class="imds-icon"><i class="fa-solid fa-angle-left" aria-hidden="true"></i></span>
        </button>
        <span id="nav-title" class="has-text-weight-bold has-text-centered" style="font-size: 1.6rem; min-width: 9em;"></span>
        <button type="button" id="next-month-button" class="imds-button is-ghost" title="翌月" aria-label="翌月">
          <span class="imds-icon"><i class="fa-solid fa-angle-right" aria-hidden="true"></i></span>
        </button>
        <button type="button" id="this-month-button" class="imds-button is-outlined">今月</button>
      </div>
      <!-- 凡例（色設定のある曜日が無い場合は非表示のまま） -->
      <div id="calendar-legend" class="imds-mb-2 imds-px-3 imds-py-2 imds-border-1 has-background-color-gray" style="display: none; flex-wrap: wrap; gap: 0.5em 1.25em; font-size: 0.85rem;"></div>
      <!-- カレンダーグリッド -->
      <div class="imds-table is-area-bordered is-bordered is-sticky" style="height: 100%">
        <div class="imds-table-inner">
          <table id="calendar-table" aria-label="カレンダー">
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

## ルーティング設定（sample_calendar.xml）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<routing-jssp-config
    xmlns="http://www.intra-mart.jp/router/routing-jssp-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/router/routing-jssp-config routing-jssp-config.xsd">

  <!-- カレンダー画面 -->
  <file-mapping path="/sample/sample_calendar" page="sample/sample_calendar/view/index">
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
let startDayOfWeek = firstOfMonth.getDay();
let startOffset = (startDayOfWeek - firstDayOfWeek + 7) % 7;
let gridStart = new Date(year, month - 1, 1 - startOffset);

// グリッド終了日：最終曜日（firstDayOfWeek の前日）まで翌月に延ばす
let lastOfMonth = new Date(year, month, 0);
let endDayOfWeek = lastOfMonth.getDay();
let lastDayOfWeek = (firstDayOfWeek + 6) % 7;
let endOffset = (lastDayOfWeek - endDayOfWeek + 7) % 7;
let gridEnd = new Date(year, month - 1, lastOfMonth.getDate() + endOffset);

let result = manager.getDayInfoSummariesOnTerm(calendarId, gridStart, gridEnd);
```

### 3. `setFirstDayOfWeek` は使用禁止

`CalendarInfoManager` に `setFirstDayOfWeek` に相当するメソッドは公開 API として存在しない。
仮に存在しても呼び出すとユーザのカレンダー設定を変更してしまうため、使用してはならない。

### 4. URL は `<base>` タグ基準の相対パスを使う

`<imart type="head">` によって `<base href="http://host/imart/">` タグが注入される。
クエリパラメータのみ（例: `?year=2026&month=4`）の URL は `<base>` 基準で解釈されるため、意図しないホーム画面への遷移が発生する。

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

今日の日付（`isToday`）の場合は色設定を無視し、丸背景＋白文字（`calendar-cell-day-today`）で表示する。
セルの背景色は独自 CSS ではなく imds テーブルの装飾色クラス（当月以外: `is-gray`、休日: `is-red`）で指定する。

### 7. 参照する d.ts

| d.ts ファイル | 参照する内容 |
|---|---|
| `d.ts/tenant/im-ssjs-calendar-info-manager.d.ts` | `CalendarInfoManager` のメソッド定義 |
| `d.ts/tenant/object/im-ssjs-day-info-summary.d.ts` | `DayInfoSummary`（`dayInfos`, `dayInfoNames`, `isHoliday`, `color`, `currentDate`） |
| `d.ts/tenant/object/im-ssjs-day-info.d.ts` | `DayInfo`（`dayInfoName`, `i18n`） |
| `d.ts/tenant/object/im-ssjs-day-info-i18n.d.ts` | `DayInfoI18N`（`dayInfoName: { [localeId: string]: string }`） |
| `d.ts/tenant/object/im-ssjs-week-day-info.d.ts` | `WeekDayInfo`（`dayOfWeek`, `color`, `holiday`） |
