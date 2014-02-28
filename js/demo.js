$(function () {

/*
 * 1. DEFAULT CHART
 */
		var options = {
				chart: {
						renderTo: 'container-simple'
				},
				indicators: [{
						id: 'first',
						type: 'sma',
						params: {
							period: 5	
						},
						styles: {
								strokeWidth: 2,
								dashstyle: 'solid'
						}
				},{
						id: 'first',
						type: 'ema',
						params: {
							period: 10,
							periodUnit: 'day' // year, month, week, day, hour, minute, second, millisecond	
						},
						styles: {
								strokeWidth: 2,
								stroke: 'green',
								dashstyle: 'solid'
						}
				}],
				tooltip:{
					enabledIndicators: true
				},
				series: [{
						id: 'first',
						pointStart: Date.UTC(2013, 0, 1),
						pointInterval: 24 * 3600 * 1000,  //one day
						data: [16, 17, 17, 10, 17, 18, 17, 17, 17]
				}]
		};
		
		var chart = new Highcharts.StockChart(options,function(chart){
			console.log(chart.series[0].processedXData.length);
		});


/*
 * 2.1 ADVANCED CHART
 */
 var adv_options = {
						 chart: {
								events: {
									load: function() {
											console.log(this.series[0].data,this.series[0].processedYData); 
									}
								}
						 },
						indicators: [{
								id: 'AAPL',
								type: 'sma',
								params: {
										period: 5,
								}
						},{
								id: 'AAPL',
								type: 'ema',
								params: {
										period: 5,
										periodUnit: 'day', // year, month, week, day, hour, minute, second, millisecond	
										index: 0 //optional parameter for ohlc / candlestick / arearange - index of value
								},
								styles: {
										strokeWidth: 2,
										stroke: 'green',
										dashstyle: 'solid'
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
            plotOptions: {
                series: {
                    dataGrouping: { 
                        enabled: false
                    }
                }
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


$.getJSON('http://www.highcharts.com/samples/data/jsonp.php?filename=aapl-c.json&callback=?', function(data) {

			adv_options.series[0].type = 'line';
  		adv_options.series[0].data = data;

			$('#container-advanced').highcharts('StockChart', $.extend({},adv_options));
});


/*
 * 2.4 ADVANCED CHART - CANDLESTICK - ATR
 */

$.get('csv/csvtest.csv',function(data) { 
var adv_options = {
						 chart: {
								events: {
									load: function() {
											console.log(this.series[0].data,this.series[0].processedYData); 
									}
								}
						 },
						indicators: [{
								id: 'AAPL',
								type: 'sma',
								params: {
										period: 5,
								}
						},{
								id: 'AAPL',
								type: 'ema',
								params: {
										period: 5,
										periodUnit: 'day', // year, month, week, day, hour, minute, second, millisecond	
										index: 0 //optional parameter for ohlc / candlestick / arearange - index of value
								},
								styles: {
										strokeWidth: 2,
										stroke: 'green',
										dashstyle: 'solid'
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
            plotOptions: {
                series: {
                    dataGrouping: { 
                        enabled: false
                    }
                }
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
	adv_options.series[0].type = 'candlestick';
	adv_options.indicators.push({
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
	});

  // Split the lines
  var lines = data.split('\n'),
    	time = (new Date()).getTime();

  $.each(lines, function(lineNo, line) {

        var items = line.split(';');

        adv_options.series[0].data.push([time, parseFloat(items[0]), parseFloat(items[0]),parseFloat(items[1]),parseFloat(items[2])]);
        time += (24 * 3600 * 1000);
  });
  
	$('#container-candlestick-atr').highcharts('StockChart', $.extend({},adv_options),function(chart){
			console.log(chart.series[0].processedXData.length);
	});
});


});
