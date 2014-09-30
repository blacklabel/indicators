$(function () {
/*
 * 2.1 ADVANCED CHART AAAA
 */
 var adv_options = {
						chart: {
								borderWidth: 5,
								borderColor: '#e8eaeb',
								borderRadius: 0,
								backgroundColor: '#f7f7f7'
						},
						title: {
								style: {
										'fontSize': '1em'
								},
								useHTML: true,
								x: -27,
								y: 8,
								text: '<span class="chart-title">SMA, EMA, ATR, RSI indicators <span class="chart-href"> <a href="http://www.blacklabel.pl/highcharts" target="_blank"> Black Label </a> </span> <span class="chart-subtitle">plugin by </span></span>'	
						},
						indicators: [{
								id: 'AAPL',
								type: 'sma',
								params: {
										period: 14
								}
						},{
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
								}
						}, {
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
									lineWidth:2,
									title: {
										text:'ATR'
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
											text:'RSI'
										}
								}	
						}],
						yAxis:{
							opposite:false,
								title:{
									text: 'DATA SMA EMA',
									x: -4
								},
								lineWidth: 2,
								labels:{
									x:22
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
