# Highcharts 图表类型与模块一览

## 基础图表（仅需 highcharts.js）

| chart.type | 说明 | 用途 |
|-----------|------|------|
| `line` | 折线图 | 时序趋势 |
| `spline` | 平滑折线图 | 连续数据趋势 |
| `area` | 面积图 | 累计量・构成比趋势 |
| `areaspline` | 平滑面积图 | 连续累计趋势 |
| `column` | 柱状图 | 按类别比较 |
| `bar` | 条形图 | 按类别比较（横向） |
| `pie` | 饼图 | 构成比・占比 |
| `scatter` | 散点图 | 两变量间的相关性 |

## 扩展图表（需要 highcharts-more.js）

```html
<script src="highcharts/9.3.2/highcharts-more.js"></script>
```

| chart.type | 说明 | 用途 |
|-----------|------|------|
| `gauge` | 仪表盘 | KPI 达成率 |
| `boxplot` | 箱线图 | 数据分布 |
| `waterfall` | 瀑布图 | 增减明细 |
| `bubble` | 气泡图 | 三变量关系 |
| `columnrange` | 范围柱状图 | 最小值～最大值范围 |
| `polar` | 雷达图 | 多轴评估 |

## 需要额外模块的图表

| 图表 | 所需模块 |
|---------|--------------|
| 热力图 | `modules/heatmap.js` |
| 树状图 | `modules/treemap.js` |
| 实心仪表盘 | `modules/solid-gauge.js` |
| 漏斗图 | `modules/funnel.js` |
| 桑基图 | `modules/sankey.js` |
| 导出（图片/PDF） | `modules/exporting.js` |
| 离线导出 | `modules/offline-exporting.js` |

额外模块的路径位于 `highcharts/9.3.2/modules/` 目录下。

```html
<script src="highcharts/9.3.2/modules/exporting.js"></script>
```
