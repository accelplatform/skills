# Highcharts 配置模式集

## 柱状图（column）

```javascript
Highcharts.chart('container-id', {
  chart: { type: 'column' },
  title: { text: '标题' },
  xAxis: {
    categories: ['类别1', '类别2', '类别3']
  },
  yAxis: {
    title: { text: 'Y轴标签' }
  },
  tooltip: {
    valueSuffix: ' 千元'
  },
  plotOptions: {
    column: {
      dataLabels: { enabled: true }
    }
  },
  series: [
    { name: '系列A', data: [100, 200, 300] },
    { name: '系列B', data: [150, 250, 350] }
  ]
});
```

## 折线图（line）

```javascript
Highcharts.chart('container-id', {
  chart: { type: 'line' },
  title: { text: '月度趋势' },
  xAxis: {
    categories: ['1月', '2月', '3月', '4月', '5月', '6月']
  },
  yAxis: {
    title: { text: '件数' }
  },
  tooltip: {
    shared: true,
    crosshairs: true
  },
  series: [
    { name: '订单', data: [10, 15, 12, 18, 22, 20] },
    { name: '发货', data: [8, 12, 10, 16, 20, 18] }
  ]
});
```

## 饼图（pie）

```javascript
Highcharts.chart('container-id', {
  chart: { type: 'pie' },
  title: { text: '构成比例' },
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
    name: '比例',
    data: [
      { name: '已完成', y: 45, color: '#2ECC71' },
      { name: '进行中', y: 35, color: '#F39C12' },
      { name: '未开始', y: 20, color: '#BDC3C7' }
    ]
  }]
});
```

## 组合图（柱状图 + 折线图）

```javascript
Highcharts.chart('container-id', {
  title: { text: '销售额与利润率' },
  xAxis: {
    categories: ['1月', '2月', '3月', '4月', '5月', '6月']
  },
  yAxis: [
    { title: { text: '销售额（千元）' } },
    { title: { text: '利润率（%）' }, opposite: true }
  ],
  series: [
    { type: 'column', name: '销售额', data: [1000, 1200, 1100, 1400, 1300, 1500], yAxis: 0 },
    { type: 'line', name: '利润率', data: [12, 15, 13, 18, 16, 20], yAxis: 1 }
  ]
});
```

## 全局样式设置

若要在整个项目中统一应用主题，请在渲染各图表之前调用 `Highcharts.setOptions()`。

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
    loading: '加载中...',
    noData: '暂无数据'
  }
});
```

## 响应式适配

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
  // ...其他设置
});
```
