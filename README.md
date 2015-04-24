<script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
<script src="http://code.highcharts.com/highcharts.js"></script>
<script src="./bubble-dragAdrop.js"></script>

# Indicators - Highstock module

Indicators available in this plugin: **SMA, EMA, ATR, RSI**. You can use these indicators for free.

We also have other indicators available: **Bollinger Bands, MACD, Momentum, CCI, Stochastic.** <br>
If you're are interested in purchasing them, developing new indicators or any other tools, please contact us at: <a href="mailto:start@blacklabel.pl"> start@blacklabel.pl </a>

You may also want to check our other demo here: http://demo.blacklabel.pl.

Go to project page to see this module in action: [http://blacklabel.github.io/indicators/](http://blacklabel.github.io/indicators/)


<div id="chart" style="height: 300px"></div>
<script>
$.getJSON('http://www.highcharts.com/samples/data/jsonp.php?filename=aapl-ohlcv.json&callback=?', function(data) {
    window.chart = new Highcharts.Chart('StockChart',{
        chart:{
            type: 'candlestick'
        },
        indicators: [{
            id: 'AAPL',
            type: 'sma',
            params: {
                period: 5,
            }
        }, {
            id: 'AAPL',
            type: 'ema',
            params: {
                period: 5,
                index: 0 //optional parameter for ohlc / candlestick / arearange - index of value
            },
            styles: {
                strokeWidth: 2,
                stroke: 'green',
                dashstyle: 'solid'
            }
        }, {
            id: 'AAPL',
            type: 'atr',
            params: {
                period: 14,
            },
            styles: {
                strokeWidth: 2,
                stroke: 'orange',
                dashstyle: 'solid'
            },
            yAxis: {
                lineWidth:2,
                title: {
                    text:'My ATR title'
                }
            }   
        }, {
            id: 'AAPL',
            type: 'rsi',
            params: {
                period: 14,
                overbought: 70,
                oversold: 30
            },
            styles: {
                strokeWidth: 2,
                stroke: 'black',
                dashstyle: 'solid'
            },
            yAxis: {
                lineWidth:2,
                title: {
                    text:'My RSI title'
                }
            }   
        }],
        tooltip:{
            enabledIndicators: true
        },
        series: [{
            cropThreshold: 0,
            id: 'AAPL',
            name: 'AAPL',
            data: data,
            tooltip: {
                valueDecimals: 2
            }
        }]
});
</script>

### Requirements

* Plugin requires the latest Highstock (supported since v 2.0.5)

### Installation

* Like any other Highcharts module (e.g. exporting), add `<script>` tag pointing to `indicators.js` below Highcharts script tag.

### Code

The latest code is available on github: [https://github.com/blacklabel/indicators/](https://github.com/blacklabel/indicators/)

### Usage and demos
```
indicators: [{
            id: 'AAPL',
            type: 'sma',
            params: {
                period: 5,
            },
            tooltip:{
                pointFormat: '<span style="color: {point.color}; ">pointFormat SMA: </span> {point.y}<br>'
            },
        }, {
            id: 'AAPL',
            type: 'ema',
            params: {
                period: 5,
                index: 0
            },
            styles: {
                strokeWidth: 2,
                stroke: 'green',
                dashstyle: 'solid'
            }
        }, {
            id: 'AAPL',
            type: 'atr',
            params: {
                period: 14,
            },
            styles: {
                strokeWidth: 2,
                stroke: 'orange',
                dashstyle: 'solid'
            },
            yAxis: {
                lineWidth:2,
                title: {
                    text:'My ATR title'
                }
            }   
        }, {
            id: 'AAPL',
            type: 'rsi',
            params: {
                period: 14,
                overbought: 70,
                oversold: 30
            },
            styles: {
                strokeWidth: 2,
                stroke: 'black',
                dashstyle: 'solid'
            },
            yAxis: {
                lineWidth:2,
                title: {
                    text:'My RSI title'
                }
            }   
}],
tooltip:{
    enabledIndicators: true
},
```

### Parameters
<table>
  <thead>
    <tr>
      <th align="left">Property</th>
      <th align="left">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td align="left">id</td><td align="left">id of series
    <tr><td align="left">type</td><td align="left">type of indicator (one of: 'sma', 'ema', 'atr', 'rsi')</td></tr>
    <tr><td align="left">showInLegend</td><td align="left">determines if indicator should be visible in the legend. Defaults to false.</td></tr>
		<tr><td align="left">name</td><td align="left">name is used in legend and tooltip to display indicator. By default it's the same as type.</td></tr>
    <tr><td align="left">styles</td><td align="left">color, dashstyle, width etc. for a indicator line</td></tr>
    <tr><td align="left">yAxis (ATR/RSI)</td><td align="left">yAxis object like in Highcharts, options for additional yAxis</td></tr>
    <tr><td align="left">params</td><td align="left">config options for indicator</td></tr>
    <tr><td align="left">params.period (SMA/EMA/ATR/RSI)</td><td align="left">base perdiod for indicator (it's number of points to be calculated). Defaults to 14.</td></tr>
    <tr><td align="left">params.index (SMA/EMA)</td><td align="left">y-value index. Useful when using candlestick/ohlc/range series to determine which value (open/high/low/close) should be used in indicator. Defaults to 0.</td></tr>
    <tr><td align="left">params.overbought (RSI)</td><td align="left">overbought value between 0-100. Defaults to 70.</td></tr>
    <tr><td align="left">params.oversold (RSI)</td><td align="left">oversold value between 0-100. Defaults to 30.</td></tr>
    <tr><td align="left">tooltip.enabledIndicators</td><td align="left">true/false, show indicators in tooltip. Disabled by default.</td></tr>
    <tr><td align="left">tooltip.pointFormat</td><td align="left">point.color and point.y return values from indicator. Disabled by default.</td></tr>
  </tbody>
</table>


###Chart.indicators 

<table>
	<thead>
		<tr>
			<th align="left"> Method/Property </th>
			<th align="left"> Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td align="left"> chart.addIndicator(options, [redraw]) </td>
			<td align="left"> Add new indicator with given options. Optionally redraw chart.</td>
		</tr>
		<tr>
			<td align="left"> chart.indicators.allItems     </td>
			<td align="left"> Array containing all indicators.</td>
		</tr>
		<tr>
			<td align="left"> chart.alignAxes (1.0.9+) </td>
			<td align="left"> When idicator requires separate yAxis (like ATR or RSI) then indicators plugin will update heights of the axes to fit plotting area. Disable it and set `yAxis.top` and `yAxis.height` when you want different heights for the y-axes. Defaults to `true`. <b>Note:<b> When disabled, top and height options need to be set for all axes for better view.</td>
		</tr>
	</tbody>
</table>


###Indicator object

<table>
	<thead>
		<tr>
			<th align="left"> Method                   </th>
			<th align="left"> Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td align="left"> indicator.update(options) </td>
			<td align="left"> Update indicator with given options</td>
		</tr>
		<tr>
			<td align="left"> indicator.destroy()       </td>
			<td align="left"> Destroy indicator</td>
		</tr>
		<tr>
			<td align="left"> indicator.setVisible(true|false)       </td>
			<td align="left"> Hide or show indicator.</td>
		</tr>
	</tbody>
</table>

### Demo

Demos are available at project's github page: [http://blacklabel.github.io/indicators/](http://blacklabel.github.io/indicators/)