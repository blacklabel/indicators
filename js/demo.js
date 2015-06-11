$(function () {
	/*
	* 2.1 ADVANCED CHART
	*/
	var adv_options = {
			indicators: [{
					id: 'AAPL',
					type: 'sma',
					name: 'SMA',
					tooltip:{
							pointFormat: '<span style="color: {point.color}; ">SMA value: </span> {point.y}<br>'
					},
					params: {
							period: 14
					},
					showInLegend: true
			}, {
					id: 'AAPL',
					type: 'ema',
					params: {
							period: 14,
							index: 0 //optional parameter for ohlc / candlestick / arearange - index of value
					},
					styles: {
							strokeWidth: 2,
							stroke: 'green',
							dashstyle: 'solid'
					},
					showInLegend: true
			},{
					id: 'AAPL',
					type: 'atr',
					params: {
							period: 14
					},
					styles: {
							strokeWidth: 2,
							stroke: 'orange',
							dashstyle: 'solid'
					},
					yAxis: {
							lineWidth: 2,
							title: {
									text:'ATR'
							}
					},
					showInLegend: true
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
							lineWidth: 2,
							title: {
									text:'RSI'
							}
					},
					showInLegend: true
			}],
			yAxis:{
					opposite: false,
					title: {
							text: 'DATA SMA EMA',
							x: -4
					},
					lineWidth: 2,
					labels:{
							x: 22
					}
			},
			rangeSelector: {
					selected: 0
			},
			tooltip:{
					enabledIndicators: true
			},
			series: [{
					cropThreshold: 0,
					id: 'AAPL',
					name: 'AAPL',
					data: [],
					tooltip: {
							valueDecimals: 2
					}
			}]
	};

	$.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=aapl-ohlcv.json&callback=?', function(data) {
	//$.getJSON('http://www.highcharts.com/samples/data/jsonp.php?filename=aapl-c.json&callback=?', function(data) {
	
			adv_options.series[0].type = 'candlestick';
			adv_options.series[0].data = data;
	
			$('#container-advanced').highcharts('StockChart', adv_options);
	});
});
