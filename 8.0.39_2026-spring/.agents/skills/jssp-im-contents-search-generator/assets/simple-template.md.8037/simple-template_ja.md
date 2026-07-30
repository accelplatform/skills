# 検索結果テンプレート テンプレート

## 概要

IM-ContentsSearch の標準検索画面から呼び出される、独自コンテンツの検索結果を表示するテンプレート。
iAP が検索結果の各コンテンツに対して `init(request)` を 1 件ずつ呼び出す仕組み。
テンプレート自体は検索 API を呼び出さない（受け身の実装）。

## ファイル構成

```
src/main/jssp/src/im_contents_search/template/
├── {機能名}.js     # テンプレート（ファンクションコンテナ）
└── {機能名}.html   # テンプレート（プレゼンテーションページ）
```

---

## {機能名}.js（ファンクションコンテナ）

```javascript
let $data = '{}';

// ========================================
// エントリーポイント
// ========================================
/**
 * IM-ContentsSearch が検索結果 1 件ごとに呼び出すエントリーポイントです。
 * request 引数から response オブジェクトを構築し、JSON 文字列として $data にバインドします。
 *
 * @param {Object} request - リクエストパラメータ（検索結果コンテンツ）
 *   request.id              - コンテンツ ID（例: "{機能名}_001"）
 *   request.id_original     - 元データの主キー
 *   request.title           - タイトル
 *   request.url             - クローラで設定した URL
 *   request.record_date     - 更新日時（Date 型）
 *   request.snippets        - ハイライト済みスニペット（Array<String>） ※iAP 内部生成
 *   request.typeBreadcrumbs - TYPE 階層のパンくず ※iAP 内部生成
 *   // require-dynamic-fields で宣言したフィールドのみ存在する
 *   request.category        - 動的フィールド（STRING）
 *   request.price           - 動的フィールド（INT）
 */
function init(request) {
  // メイン処理を実行
  let response = main(request);

  // JSON 形式で $data に格納
  // JSON 内の </script> を防ぐため '/' を '\/' に全置換する
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
      code: '',                 // エラーコード
      message: ''               // エラーメッセージ
    }
  };

  try {
    // ビジネスロジックのメイン処理を実行
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('検索結果テンプレートの表示中にエラーが発生しました。{}', e.message);
    response.error.code = 'E001';
    response.error.message = '予期しないエラーが発生しました。';
    return response;
  }

  return response;
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
      category: MessageManager.getMessage('CAP.Z.APP.{機能名大文字}.CONTENTSSEARCH.FIELD_NAME.CATEGORY'),
      price:    MessageManager.getMessage('CAP.Z.APP.{機能名大文字}.CONTENTSSEARCH.FIELD_NAME.PRICE')
    }
  };
}

// ========================================
// ユーティリティ
// ========================================
/**
 * 日付を標準日付フォーマットに変換します。
 *
 * @param {Date} date - 変換する日付
 * @returns {String} フォーマット済み日付文字列
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
 * 価格（INT 型動的フィールド）を整数文字列に変換します。
 *
 * @param {*} price - 変換する価格値
 * @returns {String} 整数文字列、または空文字
 */
function formatPrice(price) {
  if (isNull(price)) {
    return '';
  }
  return String(price);
}
```

**`request` オブジェクトのプロパティ:**

標準フィールド（常に存在）:

| プロパティ | 型 | 説明 |
|----------|----|------|
| `request.id` | String | コンテンツ ID（`"{機能名}_主キー値"` 形式） |
| `request.id_original` | String | 元データの主キー |
| `request.title` | String | クローラで `setTitle()` に設定した値 |
| `request.url` | String | クローラで `setUrl()` に設定した値 |
| `request.type` | String | コンテンツ TYPE |
| `request.record_date` | Date | クローラで `setRecordDate()` に設定した値 |

> `addText()` で設定した `text` と `addAttachment()` で設定した `attachment` は **含まれない**。

iAP 生成フィールド（常に存在）:

| プロパティ | 型 | 説明 |
|----------|----|------|
| `request.typeBreadcrumbs` | String | TYPE 階層のパンくず |
| `request.snippets` | Array\<String\> | ハイライト済みスニペット |

動的フィールド（`<require-dynamic-fields>` で宣言したもののみ存在）:

| プロパティ | 型 | 説明 |
|----------|----|------|
| `request.{キー名}` | 型依存 | `Fields.*.toField("{キー名}")` のキー名と一致するプロパティ名で参照できる |

---

## {機能名}.html（プレゼンテーションページ）

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

      // タイトル・リンク
      const anchor = container.querySelector('.imcs-content-detail-title a');
      anchor.href = result.detailUrl;
      anchor.textContent = result.title;

      // 日付
      container.querySelector('.imcs-content-detail-subtitle-date').textContent = result.recordDate;
      // パンくず
      container.querySelector('.imcs-content-detail-subtitle-breadcrumbs').textContent = result.breadcrumbs;

      // オプション項目
      const optionRows = container.querySelectorAll('.imcs-content-detail-option-row');
      const categoryCell = optionRows[0].querySelector('.imcs-content-detail-option-cell');
      categoryCell.querySelector('.imcs-content-detail-option-label').textContent = result.labels.category;
      categoryCell.querySelector('.imcs-content-detail-option-value').textContent = result.category;

      const priceCell = optionRows[1].querySelector('.imcs-content-detail-option-cell');
      priceCell.querySelector('.imcs-content-detail-option-label').textContent = result.labels.price;
      priceCell.querySelector('.imcs-content-detail-option-value').textContent = result.price;

      // スニペット（ハイライト済みテキスト）
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

**HTML クラスの役割:**

| CSS クラス | 説明 |
|-----------|------|
| `imcs-content-detail-title` | 検索結果のタイトル行 |
| `imcs-content-detail-subtitle` | サブタイトル行（日付・TYPE パンくず） |
| `imcs-content-detail-subtitle-date` | 日付テキスト |
| `imcs-content-detail-option` | 追加情報領域（動的フィールドの表示） |
| `imcs-content-detail-option-row` | 追加情報の 1 行 |
| `imcs-content-detail-option-cell` | ラベル + 値のセル |
| `imcs-content-detail-option-label` | フィールドラベル |
| `imcs-content-detail-option-value` | フィールド値 |
| `imcs-content-detail-snippets` | スニペット（ハイライト済みテキスト）表示領域 |

**XSS 対策（DOM API の使い分け）:**

| 値 | DOM API | 理由 |
|---|---------|------|
| `$data.result.title` / 動的フィールド値 | `textContent` | ユーザ由来データ → 自動エスケープ |
| `$data.result.detailUrl` | `a.href = ...` | href プロパティへの代入は URL として解釈される |
| `$data.result.breadcrumbs`（typeBreadcrumbs） | `textContent` | iAP が生成した TYPE 階層のパンくず（プレーンテキスト形式） |
| スニペット（snippet） | `innerHTML` | iAP がキーワードを `<b>` タグでマークアップしたテキスト（マークアップ箇所以外はサニタイジングされている） |

> `innerHTML` はユーザ由来のデータには使用してはならない。`innerHTML` の使用は `snippets` のみに限定する。

---

## メッセージプロパティ

### caption.properties（デフォルト・英語と同一）

```properties
CAP.Z.APP.{機能名大文字}.CONTENTSSEARCH.FIELD_NAME.CATEGORY=Category
CAP.Z.APP.{機能名大文字}.CONTENTSSEARCH.FIELD_NAME.PRICE=Price
```

### caption_ja.properties（日本語 — Unicode エスケープ形式で記述）

```properties
CAP.Z.APP.{機能名大文字}.CONTENTSSEARCH.FIELD_NAME.CATEGORY=カテゴリ
CAP.Z.APP.{機能名大文字}.CONTENTSSEARCH.FIELD_NAME.PRICE=価格
```

### caption_en.properties（英語）

```properties
CAP.Z.APP.{機能名大文字}.CONTENTSSEARCH.FIELD_NAME.CATEGORY=Category
CAP.Z.APP.{機能名大文字}.CONTENTSSEARCH.FIELD_NAME.PRICE=Price
```

### caption_zh_CN.properties（中国語簡体字 — Unicode エスケープ形式）

```properties
CAP.Z.APP.{機能名大文字}.CONTENTSSEARCH.FIELD_NAME.CATEGORY=类别
CAP.Z.APP.{機能名大文字}.CONTENTSSEARCH.FIELD_NAME.PRICE=价格
```

**注意:** 日本語・中国語のメッセージプロパティファイルは必ず Unicode エスケープ形式（`\uXXXX`）で記述する。
