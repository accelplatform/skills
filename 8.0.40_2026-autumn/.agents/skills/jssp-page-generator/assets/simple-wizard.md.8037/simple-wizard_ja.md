# シンプルウィザード画面テンプレート

## 概要

シンプルなウィザードを表現する画面構成の、プレゼンテーションページ（HTML 部分のみ）のテンプレート。
imds のステッパーでインポート工程（ファイルを選択 → 内容の確認 → インポート結果）を示し、ステップ1（ファイルを選択）の画面を表示する。ファイルを選択すると選択済みファイル一覧が表示され、「内容の確認へ」ボタンが有効になる。

### imds テンプレートとの対応

- 画面構成は `jssp-imds-theme` スキルのインポート画面テンプレート `assets/imds-import-screen.md` のステップ1に準拠する
- ステップ2（内容の確認）・ステップ3（インポート結果）の構成は、同テンプレートを参照すること

## テンプレート

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
  </style>
  <!-- プレゼンテーションページのスクリプト -->
  <script>
  (function() {
    document.addEventListener('DOMContentLoaded', () => {
      // インポートできるファイルの拡張子
      const ACCEPT_EXTENSION = '.zip';

      const dropArea = document.getElementById('file-drop-area');
      const fileInput = document.getElementById(':importFile:');
      const fileList = document.getElementById('uploaded-file-list');
      const fileListBody = document.getElementById('uploaded-file-list-body');
      const toConfirmButton = document.getElementById('to-confirm-button');

      // ファイルサイズを表示用の文字列に変換
      function formatFileSize(size) {
        if (size >= 1024 * 1024) {
          return (size / (1024 * 1024)).toFixed(1) + 'MB';
        }
        return Math.max(1, Math.ceil(size / 1024)) + 'KB';
      }

      // 選択済みファイル一覧を描画し、「内容の確認へ」ボタンの活性を切り替える
      function renderFileList() {
        const file = fileInput.files.length > 0 ? fileInput.files[0] : null;
        fileListBody.textContent = '';
        fileList.style.display = file ? '' : 'none';
        toConfirmButton.disabled = !file;
        if (!file) {
          return;
        }

        const tr = document.createElement('tr');

        const nameCell = document.createElement('td');
        const nameWrapper = document.createElement('span');
        nameWrapper.innerHTML = '<span class="imds-icon is-gray-light imds-file-upload-file-icon"><i class="fa-regular fa-file"></i></span>';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'imds-file-upload-name';
        nameSpan.textContent = file.name;
        nameWrapper.appendChild(nameSpan);
        nameCell.appendChild(nameWrapper);
        tr.appendChild(nameCell);

        const sizeCell = document.createElement('td');
        sizeCell.className = 'imds-file-upload-size';
        const sizeSpan = document.createElement('span');
        sizeSpan.textContent = formatFileSize(file.size);
        sizeCell.appendChild(sizeSpan);
        tr.appendChild(sizeCell);

        const deleteCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'imds-button is-ghost';
        deleteButton.title = '削除';
        deleteButton.innerHTML = '<span class="imds-icon"><i class="fa-regular fa-circle-xmark"></i></span>';
        deleteButton.addEventListener('click', () => {
          fileInput.value = '';
          renderFileList();
        });
        deleteCell.appendChild(deleteButton);
        tr.appendChild(deleteCell);

        fileListBody.appendChild(tr);
      }

      // 拡張子を検証してファイルを確定する（accept 属性はドラッグ＆ドロップには適用されないため、ここで検証する）
      function selectFiles(files) {
        if (files.length > 0 && !files[0].name.toLowerCase().endsWith(ACCEPT_EXTENSION)) {
          fileInput.value = '';
          imuiShowErrorMessage('インポートできるファイル形式は、zip のみです。');
        } else if (files !== fileInput.files) {
          fileInput.files = files;
        }
        renderFileList();
      }

      // 「ファイルを選択」ボタン押下で、非表示の input[type="file"] を開く
      document.getElementById('file-select-button').addEventListener('click', () => {
        fileInput.click();
      });
      fileInput.addEventListener('change', () => {
        selectFiles(fileInput.files);
      });

      // ドラッグ＆ドロップでファイルを受け付ける
      dropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
      });
      dropArea.addEventListener('drop', (event) => {
        event.preventDefault();
        selectFiles(event.dataTransfer.files);
      });

      // TODO: ファイルのアップロード、ステップ2（内容の確認）への切替を実装すること
      toConfirmButton.addEventListener('click', () => {
      });

      renderFileList();
    });
  })();
  </script>
</imart>

<!-- ページ全体のコンテナ（intra-mart テーマの imui-container の内側に配置されるため id は付与しない） -->
<div class="imds-container pgstyle-layout-container">
  <!-- ヘッダ -->
  <header class="imds-header">
    <div class="imds-header-icon">
      <span class="imds-icon-wrapper is-large">
        <span class="imds-icon is-medium"><i class="fa-solid fa-file-import"></i></span>
      </span>
    </div>
    <div class="imds-header-title">
      <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
      <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
    </div>
  </header>

  <!-- メインコンテンツ -->
  <main class="pgstyle-layout-main">
    <div class="imds-stepper">
      <ul>
        <li class="imds-stepper-step is-active">
          <button disabled><span>1.ファイルを選択</span></button>
        </li>
        <li class="imds-stepper-step">
          <button disabled><span>2.内容の確認</span></button>
        </li>
        <li class="imds-stepper-step">
          <button disabled><span>3.インポート結果</span></button>
        </li>
      </ul>
    </div>
    <section class="imds-py-4 imds-px-6 pgstyle-layout-content imds-scrollbar">
      <div class="imds-message is-outlined is-info imds-mb-4">
        <div class="imds-message-title">
          <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
          <p>ファイルを選択</p>
        </div>
        <div class="imds-message-content">
          <p>${サンプル}のエクスポートデータをインポートします。</p>
          <p>ファイルを選択して、内容の確認へボタンをクリックしてください。</p>
          <p>インポートできるファイル形式は、zip のみです。</p>
        </div>
      </div>
      <div class="imds-file-upload">
        <div class="imds-file-upload-drop-area" id="file-drop-area">
          <input type="file" id=":importFile:" accept=".zip" />
          <span class="imds-icon"><i class="fa-solid fa-file-arrow-up"></i></span>
          <p class="imds-file-upload-message">ここにファイルをドラッグ＆ドロップしてください</p>
          <p class="imds-file-upload-text">または</p>
          <button type="button" id="file-select-button" class="imds-button is-outlined is-small is-primary">ファイルを選択</button>
        </div>
      </div>
      <!-- 選択済みファイル一覧（ファイル選択時に JavaScript で行を生成する） -->
      <div class="imds-file-upload-list" id="uploaded-file-list" style="display: none;">
        <table>
          <tbody id="uploaded-file-list-body"></tbody>
        </table>
      </div>
      <button type="button" id="to-confirm-button" class="imds-button is-primary imds-mt-7" style="min-width: 8em;" disabled>
        内容の確認へ
      </button>
    </section>
  </main>
</div>
```

## 注意事項

- ファンクションコンテナで `$title`（例: `'${サンプル}インポート'`）/ `$subTitle` をバインド変数として定義すること
- `${サンプル}` はデータ種別名のプレースホルダー。インポートできるファイル形式（`accept` 属性・`ACCEPT_EXTENSION`・補足メッセージ）も実装対象に合わせて変更すること
- ステッパーのボタンは `disabled` のため、ステッパーのクリックによるステップ切替は行わない。ファイルのアップロードと、「内容の確認へ」ボタン押下時のステップ切替（`is-active` / `is-completed` の付け替えと表示内容の切替）は別途 JavaScript で実装すること
- 「内容の確認へ」ボタンはファイルの選択が完了するまで `disabled` にし、削除ボタンで一覧が空になったら再度 `disabled` に戻す
- `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` は機能ごとに置き換えるプレースホルダーではない固定クラス名である。`height: 100%` ベースのため `theme-conditional-layout.css` の読み込みを削除しないこと
