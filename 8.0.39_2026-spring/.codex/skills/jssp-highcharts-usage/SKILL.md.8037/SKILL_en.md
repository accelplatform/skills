---
name: jssp-highcharts-usage
description: A skill set for rendering graphs and charts using Highcharts in intra-mart JSSP presentation pages. Provides rendering patterns and data integration methods for line charts, bar charts, pie charts, scatter plots, area charts, and more. Use when mentioning displaying a graph, rendering a chart, visualizing data, dashboard, or adding a graph. imart type="chart" is legacy, so always use this skill for graphs in new development.
---

■■ Required Rules Checklist (Mandatory) ■■

Confirm the following before starting implementation. Do not proceed if any item is unchecked.

- [ ] [jssp-accessibility](../../../requirements/jssp-accessibility/AGENTS.md) has been read and understood
- [ ] [jssp-overview](../../../requirements/jssp-overview/AGENTS.md) has been read and understood
- [ ] [jssp-presentation-page](../../../requirements/jssp-presentation-page/AGENTS.md) has been read and understood
- [ ] [jssp-security](../../../requirements/jssp-security/AGENTS.md) has been read and understood


# Highcharts Graph Rendering Skill

## Purpose

A skill set for rendering interactive graphs and charts using the Highcharts library in intra-mart Accel Platform JSSP presentation pages.

**Important**:
`<imart type="chart">` is a legacy feature and deprecated. Always use Highcharts for new development.

## When to Use

When the user makes requests such as:
- "Display a graph"
- "Render a chart"
- "Visualize data with a graph"
- "Add a graph to the dashboard"
- "Create a line chart / bar chart / pie chart"

## References

- `reference/chart-types.md` - List of available chart types and required modules
- `reference/chart-patterns.md` - Configuration patterns and common settings per chart type

## Implementation Steps

1. Identify the chart type from the user's requirements
2. Check the required modules in `reference/chart-types.md`
3. Refer to the configuration pattern for the relevant chart in `reference/chart-patterns.md`
4. Build the graph data in the function container, including it in `$data`
5. Load Highcharts in the presentation page and render it inside `DOMContentLoaded`

## Loading the Library

Load the Highcharts library inside `<imart type="head">`. Use version 9.3.2 as the baseline.

```html
<imart type="head">
  <!-- Highcharts library -->
  <script src="highcharts/9.3.2/highcharts.js"></script>
  <!-- Highcharts additional modules (as needed) -->
  <script src="highcharts/9.3.2/highcharts-more.js"></script>
</imart>
```

## Basic Implementation Pattern

### Function Container (.js)

Pass graph data to the client by including it in the `$data` bind variable.

```javascript
function processBusinessLogic(request) {
  return {
    salesChart: {
      categories: ['Jan', 'Feb', 'Mar'],
      series: [
        { name: 'Product A', data: [3200, 3800, 4100] }
      ]
    }
  };
}
```

### Presentation Page (.html)

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  const chartData = $data.result.salesChart;
  Highcharts.chart('sales-chart', {
    chart: { type: 'column' },
    title: { text: 'Monthly Sales Trend' },
    xAxis: { categories: chartData.categories },
    yAxis: { title: { text: 'Sales (thousands)' } },
    series: chartData.series
  });
});
</script>

<!-- Chart container: always specify height -->
<div id="sales-chart" style="width: 100%; height: 400px;"></div>
```

## Notes

- Always explicitly specify `height` on the chart container (without height, it will not render)
- Always initialize the chart inside the `DOMContentLoaded` event
- When placing multiple charts on the same page, ensure each container's `id` is unique
- Do not use user input values directly in chart titles or labels (XSS prevention)
- For details on coding conventions, refer to the reference directory under jssp-page-generator
