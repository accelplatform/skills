# Highcharts チャート種類・モジュール一覧

## 基本チャート（highcharts.js のみ）

| chart.type | 説明 | 用途 |
|-----------|------|------|
| `line` | 折れ線グラフ | 時系列の推移 |
| `spline` | 滑らかな折れ線 | 連続的なデータの推移 |
| `area` | 面グラフ | 累積量・構成比の推移 |
| `areaspline` | 滑らかな面グラフ | 連続的な累積推移 |
| `column` | 縦棒グラフ | カテゴリ別の比較 |
| `bar` | 横棒グラフ | カテゴリ別の比較（横向き） |
| `pie` | 円グラフ | 構成比・割合 |
| `scatter` | 散布図 | 2変数間の相関 |

## 拡張チャート（highcharts-more.js が必要）

```html
<script src="highcharts/9.3.2/highcharts-more.js"></script>
```

| chart.type | 説明 | 用途 |
|-----------|------|------|
| `gauge` | ゲージ | KPI の達成率 |
| `boxplot` | 箱ひげ図 | データの分布 |
| `waterfall` | ウォーターフォール | 増減の内訳 |
| `bubble` | バブルチャート | 3変数の関係性 |
| `columnrange` | 範囲棒グラフ | 最小〜最大の範囲 |
| `polar` | レーダーチャート | 多軸の評価 |

## 追加モジュールが必要なチャート

| チャート | 必要モジュール |
|---------|--------------|
| ヒートマップ | `modules/heatmap.js` |
| ツリーマップ | `modules/treemap.js` |
| ソリッドゲージ | `modules/solid-gauge.js` |
| ファネル | `modules/funnel.js` |
| サンキー | `modules/sankey.js` |
| エクスポート（画像/PDF） | `modules/exporting.js` |
| オフラインエクスポート | `modules/offline-exporting.js` |

追加モジュールのパスは `highcharts/9.3.2/modules/` 配下。

```html
<script src="highcharts/9.3.2/modules/exporting.js"></script>
```
