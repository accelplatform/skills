# シンプルウィザード画面テンプレート

## 概要

シンプルなウィザードを表現する画面構成の、プレゼンテーションページ（HTML 部分のみ）のテンプレート。
imds のステッパーを利用して、ボタンを押すたびに次の画面が表示される。

## テンプレート

```html
<!-- ページ全体のコンテナ（intra-mart テーマの imui-container の内側に配置されるため id は付与しない） -->
<div class="imds-container">
  <!-- ヘッダ -->
  <header class="imds-header">
    <div class="imds-header-title">
      <p>${サンプル}</p>
      <h1>${サンプル} インポート</h1>
    </div>
  </header>

  <!-- メインコンテンツ -->
  <main class="sample-layout-main">
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
    <section class="imds-py-6 imds-px-8 imds-scrollbar">
      <div class="imds-message is-outlined is-info imds-mb-5">
        <div class="imds-message-title">
          <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
          <p>ファイルを選択</p>
        </div>
        <div class="imds-message-content">
          <p>${サンプル}のエクスポートデータをインポートします。</p>
          <p>ファイルを選択して、内容の確認へボタンをクリックしてください。</p>
          <p>インポートできるファイル形式は、XXXXXXのみです。</p>
        </div>
      </div>
      <div class="imds-file-upload">
        <div class="imds-file-upload-drop-area">
          <input type="file" />
          <span class="imds-icon"><i class="fa-solid fa-file-arrow-up"></i></span>
          <p class="imds-file-upload-message">ここにファイルをドラッグ＆ドロップしてください</p>
          <p class="imds-file-upload-text">または</p>
          <button type="button" class="imds-button is-outlined is-small is-primary">ファイルを選択</button>
        </div>
      </div>
      <button type="button" class="imds-button is-primary imds-mt-7">内容の確認へ</button>
    </section>
  </main>
</div>
```

## 注意事項

- ステッパークリック時の画面表示切替は、別途 JavaScript で実装すること
