# Highcharts 設定パターン集

## 縦棒グラフ（column）

```javascript
Highcharts.chart('container-id', {
  chart: { type: 'column' },
  title: { text: 'タイトル' },
  xAxis: {
    categories: ['カテゴリ1', 'カテゴリ2', 'カテゴリ3']
  },
  yAxis: {
    title: { text: 'Y軸ラベル' }
  },
  tooltip: {
    valueSuffix: ' 千円'
  },
  plotOptions: {
    column: {
      dataLabels: { enabled: true }
    }
  },
  series: [
    { name: 'シリーズA', data: [100, 200, 300] },
    { name: 'シリーズB', data: [150, 250, 350] }
  ]
});
```

## 折れ線グラフ（line）

```javascript
Highcharts.chart('container-id', {
  chart: { type: 'line' },
  title: { text: '月次推移' },
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
    { name: '受注', data: [10, 15, 12, 18, 22, 20] },
    { name: '出荷', data: [8, 12, 10, 16, 20, 18] }
  ]
});
```

## 円グラフ（pie）

```javascript
Highcharts.chart('container-id', {
  chart: { type: 'pie' },
  title: { text: '構成比' },
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
    name: '割合',
    data: [
      { name: '完了', y: 45, color: '#2ECC71' },
      { name: '進行中', y: 35, color: '#F39C12' },
      { name: '未着手', y: 20, color: '#BDC3C7' }
    ]
  }]
});
```

## 複合グラフ（棒 + 折れ線）

```javascript
Highcharts.chart('container-id', {
  title: { text: '売上と利益率' },
  xAxis: {
    categories: ['1月', '2月', '3月', '4月', '5月', '6月']
  },
  yAxis: [
    { title: { text: '売上（千円）' } },
    { title: { text: '利益率（%）' }, opposite: true }
  ],
  series: [
    { type: 'column', name: '売上', data: [1000, 1200, 1100, 1400, 1300, 1500], yAxis: 0 },
    { type: 'line', name: '利益率', data: [12, 15, 13, 18, 16, 20], yAxis: 1 }
  ]
});
```

## 共通スタイル設定

プロジェクト全体でテーマを統一する場合は、個別チャート描画前に `Highcharts.setOptions()` を呼ぶ。

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
    loading: '読み込み中...',
    noData: '表示するデータがありません'
  }
});
```

## レスポンシブ対応

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
  // ...その他の設定
});
```
