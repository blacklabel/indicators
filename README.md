
# Indicators - Highstock module

Indicators available in this plugin: **SMA, EMA, ATR, RSI**. You can use these indicators for free.

We also have other indicators available: **Bollinger Bands, MACD, Momentum, CCI, Stochastic, Rate of Change (ROC), Accumulation / distribution (AD), Ichimoku Cloud (Kinko Hyo), Pivot Points, ZigZag, Weighted Moving Average (WMA), Price Envelopes.** <br>
If you're are interested in purchasing them, developing new indicators or any other tools, please contact us at: <a href="mailto:start@blacklabel.pl"> start@blacklabel.pl </a>

You may also want to check our other demo here: http://demo.blacklabel.pl.

Go to project page to see this module in action: [http://blacklabel.github.io/indicators/](http://blacklabel.github.io/indicators/)


### Requirements

* Version 2.0+ requires the latest Highstock (v2.1.5+)
* Version 1.1 requires Highstock v2.1.5
* Version <1.1 supported since Highstock v1.3.9 to Highstock v2.1.4

### Versions

* 2.x - Improved logic for calculations and performance. Values are based on initial points, not grouped. When points are grouped by `dataGrouping` then indicators values are grouped too.
* 1.x - Initial version of Indicators.js. Calculations are based on grouped points (aka `dataGrouping`)

### Installation

* Like any other Highcharts module (e.g. exporting), add `<script>` tag pointing to `indicators.js` below Highcharts script tag. Then attach all required indicators (like `ema.js`, `rsi.js`).


* For BOWER users:

```
bower install highcharts-indicators
```

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
      <th align="left">Type</th>
      <th align="left">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td align="left">id</td><td>String</td><td align="left">id of series</td></tr>
    <tr><td align="left">type</td><td>String</td><td align="left">type of indicator (one of: <code>sma</code>, <code>ema</code>, <code>atr</code>, <code>rsi</code>)</td></tr>
    <tr><td align="left">showInLegend</td><td>Boolean</td><td align="left">determines if indicator should be visible in the legend. Defaults to <code>false</code>.</td></tr>
		<tr><td align="left">name</td><td>String</td><td align="left">name is used in legend and tooltip to display indicator. By default it's the same as type.</td></tr>
    <tr><td align="left">styles</td><td>Object</td><td align="left">color, dashstyle, width etc. for a indicator line</td></tr>
    <tr><td align="left">yAxis (ATR/RSI)</td><td>Object</td><td align="left">yAxis object like in Highcharts, options for additional yAxis</td></tr>
    <tr><td align="left">params</td><td>Object</td><td align="left">config options for indicator</td></tr>    
    <tr><td align="left">params.approximation (SMA/EMA/ATR/RSI)</td><td>String/Function</td><td align="left">The same property as in <code>dataGrouping.approximation</code> for Highstock. Supported since version <b>2.0.0</b>. Defaults to <code>"average"</code>.</td></tr>
    <tr><td align="left">params.period (SMA/EMA/ATR/RSI)</td><td>Number</td><td align="left">base period for indicator (it's number of points to be calculated). Defaults to <code>14</code>.</td></tr>
    <tr><td align="left">params.index (SMA/EMA)</td><td>Number</td><td align="left">y-value index. Useful when using candlestick/ohlc/range series to determine which value (open/high/low/close) should be used in indicator. Defaults to <code>0</code>.</td></tr>
    <tr><td align="left">params.overbought (RSI)</td><td>Number</td><td align="left">overbought value between 0-100. Defaults to <code>70</code>.</td></tr>
    <tr><td align="left">params.oversold (RSI)</td><td>Number</td><td align="left">oversold value between 0-100. Defaults to <code>30</code>.</td></tr>
		<tr>
			<td align="left">tooltip.pointFormat</td>
			<td align="left"> String </td>
			<td align="left"> <code>point.color</code> and <code>point.y</code> return values from indicator. Disabled by default.</td>
		</tr>
  </tbody>
</table>


###New options/methods in Chart:


<table>
	<thead>
		<tr>
			<th align="left"> Method                       </th>
			<th align="left"> Version: </th>
			<th align="left"> Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td align="left"> chart.addIndicator(options, [redraw]) </td>
			<td align="left"> v 1.0.0+ </td>
			<td align="left"> Add new indicator with given options. Optionally redraw chart.</td>
		</tr>
		<tr>
			<td align="left"> chart.indicators.allItems     </td>
			<td align="left"> v 1.0.0+ </td>
			<td align="left"> Array containing all indicators.</td>
		</tr>
		<tr>
			<td align="left"> chart.alignAxes </td>
			<td align="left"> v 1.0.9+ </td>
			<td align="left"> <code>true</code>/<code>false</code>. When idicator requires separate yAxis (like ATR or RSI) then indicators plugin will update heights of the axes to fit plotting area. Disable it and set <code>yAxis.top</code> and <code>yAxis.height</code> when you want different heights for the y-axes. Defaults to <code>true</code>. <b>Note:<b> When disabled, top and height options need to be set for all axes for better view.</td>
		</tr>
		<tr>
			<td align="left"> tooltip.enabledIndicators</td>
			<td align="left"> v 1.0.0+ </td>
			<td align="left"> <code>true</code>/<code>false</code>, show indicators in tooltip. Disabled by default.</td>
		</tr>
		<tr>
			<td align="left"> Highcharts.approximations</td>
			<td align="left"> v 2.0.0+ </td>
			<td align="left"> Object containing built-in approximations (functions) in Highstock. For more details see <code>dataGrouping.approximation</code></td>
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
