# Highcharts Configuration Patterns

## Column Chart (column)

```javascript
Highcharts.chart('container-id', {
  chart: { type: 'column' },
  title: { text: 'Title' },
  xAxis: {
    categories: ['Category 1', 'Category 2', 'Category 3']
  },
  yAxis: {
    title: { text: 'Y-Axis Label' }
  },
  tooltip: {
    valueSuffix: ' thousand yen'
  },
  plotOptions: {
    column: {
      dataLabels: { enabled: true }
    }
  },
  series: [
    { name: 'Series A', data: [100, 200, 300] },
    { name: 'Series B', data: [150, 250, 350] }
  ]
});
```

## Line Chart (line)

```javascript
Highcharts.chart('container-id', {
  chart: { type: 'line' },
  title: { text: 'Monthly Trend' },
  xAxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  },
  yAxis: {
    title: { text: 'Count' }
  },
  tooltip: {
    shared: true,
    crosshairs: true
  },
  series: [
    { name: 'Orders', data: [10, 15, 12, 18, 22, 20] },
    { name: 'Shipments', data: [8, 12, 10, 16, 20, 18] }
  ]
});
```

## Pie Chart (pie)

```javascript
Highcharts.chart('container-id', {
  chart: { type: 'pie' },
  title: { text: 'Composition Ratio' },
  tooltip: {
    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
  },
  plotOptions: {
    pie: {
      allowPointSelect: true,
      dataLabels: {
        enabled: true,
        format: '<b>{point.name}</b>: {point.percentage:.1f}%'
      }
    }
  },
  series: [{
    name: 'Ratio',
    data: [
      { name: 'Completed', y: 45, color: '#2ECC71' },
      { name: 'In Progress', y: 35, color: '#F39C12' },
      { name: 'Not Started', y: 20, color: '#BDC3C7' }
    ]
  }]
});
```

## Combined Chart (Column + Line)

```javascript
Highcharts.chart('container-id', {
  title: { text: 'Sales and Profit Margin' },
  xAxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  },
  yAxis: [
    { title: { text: 'Sales (thousand yen)' } },
    { title: { text: 'Profit Margin (%)' }, opposite: true }
  ],
  series: [
    { type: 'column', name: 'Sales', data: [1000, 1200, 1100, 1400, 1300, 1500], yAxis: 0 },
    { type: 'line', name: 'Profit Margin', data: [12, 15, 13, 18, 16, 20], yAxis: 1 }
  ]
});
```

## Global Style Settings

To apply a consistent theme across the entire project, call `Highcharts.setOptions()` before rendering individual charts.

```javascript
Highcharts.setOptions({
  colors: ['#4A90D9', '#2ECC71', '#F39C12', '#E74C3C', '#9B59B6', '#1ABC9C'],
  chart: {
    style: {
      fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif"
    }
  },
  credits: {
    enabled: false
  },
  lang: {
    thousandsSep: ',',
    decimalPoint: '.',
    loading: 'Loading...',
    noData: 'No data to display'
  }
});
```

## Responsive Design

```javascript
Highcharts.chart('container-id', {
  chart: { type: 'column' },
  responsive: {
    rules: [{
      condition: {
        maxWidth: 500
      },
      chartOptions: {
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom'
        }
      }
    }]
  },
  // ...other settings
});
```
