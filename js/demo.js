$(function () {
/*
 * 2.1 ADVANCED CHART
 */
 var adv_options = {
						indicators: [{
								id: 'AAPL',
								type: 'sma',
								params: {
										period: 14,
								}
						},{
								id: 'AAPL',
								type: 'ema',
								params: {
										period: 14,
										periodUnit: 'day', // year, month, week, day, hour, minute, second, millisecond	
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
						yAxis:{
								title:{
									text: 'aaa'
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

$.getJSON('http://www.highcharts.com/samples/data/jsonp.php?filename=aapl-ohlcv.json&callback=?', function(data) {
//$.getJSON('http://www.highcharts.com/samples/data/jsonp.php?filename=aapl-c.json&callback=?', function(data) {

			adv_options.series[0].type = 'candlestick';
  		adv_options.series[0].data = data;

			$('#container-advanced').highcharts('StockChart', adv_options);
});



});
