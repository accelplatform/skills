---
name: jssp-highcharts-usage
description: intra-mart JSSP プレゼンテーションページで Highcharts を使ったグラフ・チャートを描画するためのスキルセット。折れ線グラフ、棒グラフ、円グラフ、散布図、エリアチャート等の描画パターンとデータ連携方法を提供する。グラフを表示、チャートを描画、データを可視化、ダッシュボード、グラフを追加、と言及されたときに使用。imart type="chart" はレガシーなので、新規開発のグラフには必ずこのスキルを使うこと。
---

# Highcharts グラフ描画スキル

## 目的

intra-mart Accel Platform の JSSP プレゼンテーションページにおいて、Highcharts ライブラリを使用してインタラクティブなグラフ・チャートを描画するためのスキルセット。

**重要**:
`<imart type="chart">` はレガシー機能であり非推奨。新規開発では必ず Highcharts を使用する。

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「グラフを表示して」
- 「チャートを描画して」
- 「データをグラフで可視化して」
- 「ダッシュボードにグラフを追加して」
- 「折れ線グラフ / 棒グラフ / 円グラフを作成して」

## リファレンス参照先

- `reference/chart-types.md` - 利用可能なチャート種類と必要モジュール一覧
- `reference/chart-patterns.md` - チャート種別ごとの設定パターンと共通設定

## 実装手順

1. ユーザの要件からチャート種類を特定する
2. `reference/chart-types.md` で必要モジュールを確認する
3. `reference/chart-patterns.md` で該当チャートの設定パターンを参照する
4. ファンクションコンテナでグラフデータを `$data` に含めて構築する
5. プレゼンテーションページで Highcharts を読み込み、`DOMContentLoaded` 内で描画する

## ライブラリの読み込み

Highcharts ライブラリは `<imart type="head">` 内で読み込む。バージョンは 9.3.2 を基準とする。

```html
<imart type="head">
  <!-- Highcharts ライブラリ -->
  <script src="highcharts/9.3.2/highcharts.js"></script>
  <!-- Highcharts 追加モジュール（必要に応じて） -->
  <script src="highcharts/9.3.2/highcharts-more.js"></script>
</imart>
```

## 基本的な実装パターン

### ファンクションコンテナ（.js）

グラフ用データを `$data` バインド変数に含めてクライアントに渡す。

```javascript
function processBusinessLogic(request) {
  return {
    salesChart: {
      categories: ['1月', '2月', '3月'],
      series: [
        { name: '製品A', data: [3200, 3800, 4100] }
      ]
    }
  };
}
```

### プレゼンテーションページ（.html）

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  const chartData = $data.result.salesChart;
  Highcharts.chart('sales-chart', {
    chart: { type: 'column' },
    title: { text: '月次売上推移' },
    xAxis: { categories: chartData.categories },
    yAxis: { title: { text: '売上（千円）' } },
    series: chartData.series
  });
});
</script>

<!-- グラフコンテナ: 必ず height を指定する -->
<div id="sales-chart" style="width: 100%; height: 400px;"></div>
```

## 注意事項

- グラフコンテナには必ず `height` を明示的に指定する（高さがないと描画されない）
- グラフの初期化は必ず `DOMContentLoaded` イベント内で行う
- 複数グラフを同一ページに配置する場合、各コンテナの `id` が重複しないようにする
- ユーザ入力値をグラフのタイトルやラベルに直接使用しない（XSS 防止）
- コーディング規約の詳細は jssp-page-generator の reference 配下を参照
