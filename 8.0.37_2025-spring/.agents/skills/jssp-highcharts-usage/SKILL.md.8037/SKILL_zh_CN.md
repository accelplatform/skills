---
name: jssp-highcharts-usage
description: 在 intra-mart JSSP 表示页面中使用 Highcharts 绘制图表的技能集。提供折线图、柱状图、饼图、散点图、面积图等绘制模式及数据联动方法。在提及显示图表、绘制图表、数据可视化、仪表盘、添加图表时使用。imart type="chart" 是遗留功能，新开发的图表必须使用本技能。
---

■■ 参考规则 清单（必须） ■■

实施前必须确认以下内容。有未确认项目时不得开始。

- [ ] [jssp-accessibility](../../../requirements/jssp-accessibility/AGENTS.md) 已参考并理解内容
- [ ] [jssp-overview](../../../requirements/jssp-overview/AGENTS.md) 已参考并理解内容
- [ ] [jssp-presentation-page](../../../requirements/jssp-presentation-page/AGENTS.md) 已参考并理解内容
- [ ] [jssp-security](../../../requirements/jssp-security/AGENTS.md) 已参考并理解内容


# Highcharts 图表绘制技能

## 目的

在 intra-mart Accel Platform 的 JSSP 表示页面中，使用 Highcharts 库绘制交互式图表的技能集。

**重要**:
`<imart type="chart">` 是遗留功能，已不推荐使用。新开发必须使用 Highcharts。

## 使用时机

当用户提出以下类型的请求时：
- "显示图表"
- "绘制图表"
- "用图表可视化数据"
- "在仪表盘中添加图表"
- "创建折线图 / 柱状图 / 饼图"

## 参考资料

- `reference/chart-types.md` - 可用图表类型及所需模块列表
- `reference/chart-patterns.md` - 各图表类型的配置模式及通用设置

## 实现步骤

1. 根据用户需求确定图表类型
2. 在 `reference/chart-types.md` 中确认所需模块
3. 在 `reference/chart-patterns.md` 中参照对应图表的配置模式
4. 在函数容器中构建图表数据并包含在 `$data` 中
5. 在表示页面中加载 Highcharts，并在 `DOMContentLoaded` 内进行绘制

## 库的加载

在 `<imart type="head">` 内加载 Highcharts 库。以 9.3.2 版本为基准。

```html
<imart type="head">
  <!-- Highcharts 库 -->
  <script src="highcharts/9.3.2/highcharts.js"></script>
  <!-- Highcharts 附加模块（按需使用） -->
  <script src="highcharts/9.3.2/highcharts-more.js"></script>
</imart>
```

## 基本实现模式

### 函数容器（.js）

将图表数据包含在 `$data` 绑定变量中传递给客户端。

```javascript
function processBusinessLogic(request) {
  return {
    salesChart: {
      categories: ['1月', '2月', '3月'],
      series: [
        { name: '产品A', data: [3200, 3800, 4100] }
      ]
    }
  };
}
```

### 表示页面（.html）

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  const chartData = $data.result.salesChart;
  Highcharts.chart('sales-chart', {
    chart: { type: 'column' },
    title: { text: '月度销售趋势' },
    xAxis: { categories: chartData.categories },
    yAxis: { title: { text: '销售额（千元）' } },
    series: chartData.series
  });
});
</script>

<!-- 图表容器：必须指定 height -->
<div id="sales-chart" style="width: 100%; height: 400px;"></div>
```

## 注意事项

- 图表容器必须明确指定 `height`（没有高度则无法渲染）
- 图表的初始化必须在 `DOMContentLoaded` 事件内进行
- 在同一页面中放置多个图表时，确保各容器的 `id` 不重复
- 不要将用户输入值直接用于图表标题或标签（防止 XSS）
- 编码规范的详情请参考 jssp-page-generator 的 reference 目录
