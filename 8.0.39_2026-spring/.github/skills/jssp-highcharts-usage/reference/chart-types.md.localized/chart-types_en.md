# Highcharts Chart Types and Modules Reference

## Basic Charts (highcharts.js only)

| chart.type | Description | Use Case |
|-----------|------|------|
| `line` | Line chart | Time-series trends |
| `spline` | Smooth line chart | Continuous data trends |
| `area` | Area chart | Cumulative volume / composition trends |
| `areaspline` | Smooth area chart | Continuous cumulative trends |
| `column` | Column chart | Comparison by category |
| `bar` | Bar chart | Comparison by category (horizontal) |
| `pie` | Pie chart | Composition ratio / proportions |
| `scatter` | Scatter plot | Correlation between two variables |

## Extended Charts (requires highcharts-more.js)

```html
<script src="highcharts/9.3.2/highcharts-more.js"></script>
```

| chart.type | Description | Use Case |
|-----------|------|------|
| `gauge` | Gauge | KPI achievement rate |
| `boxplot` | Box plot | Data distribution |
| `waterfall` | Waterfall chart | Breakdown of increases and decreases |
| `bubble` | Bubble chart | Relationship among three variables |
| `columnrange` | Column range chart | Min-to-max range |
| `polar` | Radar chart | Multi-axis evaluation |

## Charts Requiring Additional Modules

| Chart | Required Module |
|---------|--------------|
| Heatmap | `modules/heatmap.js` |
| Treemap | `modules/treemap.js` |
| Solid Gauge | `modules/solid-gauge.js` |
| Funnel | `modules/funnel.js` |
| Sankey | `modules/sankey.js` |
| Export (Image/PDF) | `modules/exporting.js` |
| Offline Export | `modules/offline-exporting.js` |

Additional module paths are under `highcharts/9.3.2/modules/`.

```html
<script src="highcharts/9.3.2/modules/exporting.js"></script>
```
