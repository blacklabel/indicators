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
						styles: {
								strokeWidth: 2,
								dashstyle: 'solid'
						}
				},{
						id: 'first',
						type: 'ema',
						params: {
							period: 4 * 24 * 3600 * 1000,
							periodUnit: 'day' // year, month, week, day, hour, minute, second, millisecond	
						},
						styles: {
								strokeWidth: 2,
								stroke: 'green',
								dashstyle: 'solid'
						}
				}],
				series: [{
						id: 'first',
						pointStart: Date.UTC(2013, 0, 1),
						pointInterval: 24 * 3600 * 1000,  //one day
						data: [16, 17, 17, 10, 17, 18, 17, 17, 17]
				}]
		};
		
		//var chart = new Highcharts.StockChart(options);


/*
 * 2.1 ADVANCED CHART
 */
 var adv_options = {
						indicators: [{
								id: 'AAPL',
								type: 'sma',
								params: {
										period: 15 * 24 * 3600 * 1000	
								}
						},{
								id: 'AAPL',
								type: 'ema',
								params: {
										period: 15 * 24 * 3600 * 1000,
										periodUnit: 'day', // year, month, week, day, hour, minute, second, millisecond	
										index: 0 //optional parameter for ohlc / candlestick / arearange - index of value
								},
								styles: {
										strokeWidth: 2,
										stroke: 'green',
										dashstyle: 'solid'
								}
						}],
						rangeSelector: {
							selected: 1
						},
            plotOptions: {
                series: {
                    dataGrouping: { 
                        enabled: false
                    }
                }
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


/* demo
$.getJSON('http://www.highcharts.com/samples/data/jsonp.php?filename=aapl-c.json&callback=?', function(data) {

			adv_options.series[0].type = 'line';
  		adv_options.series[0].data = data;

			$('#container-advanced').highcharts('StockChart', $.extend({},adv_options));
});*/

/*
 * 2.2 ADVANCED CHART - OHLC
 */

/*$.getJSON('http://www.highcharts.com/samples/data/jsonp.php?filename=aapl-ohlc.json&callback=?', function(data) {

			adv_options.indicators[1].params.index = 2;
			adv_options.series[0].type = 'ohlc';
  		adv_options.series[0].data = data;

			$('#container-ohlc').highcharts('StockChart', $.extend({},adv_options));
});*/

/*
 * 2.3 ADVANCED CHART - CANDLESTICK
 */

/* $.getJSON('http://www.highcharts.com/samples/data/jsonp.php?filename=aapl-ohlc.json&callback=?', function(data) {

  		adv_options.indicators[0].params.index = 1;
			adv_options.series[0].type = 'candlestick';
  		adv_options.series[0].data = data;

			$('#container-candlestick').highcharts('StockChart', $.extend({},adv_options));
});*/

/*
 * 2.4 ADVANCED CHART - CANDLESTICK - ATR
 */

$.get('csv/csvtest.csv',function(data) { 

	

	adv_options.series[0].type = 'candlestick';
	adv_options.indicators.push({
								id: 'AAPL',
								type: 'atr',
								params: {
										period: 13 * 24 * 3600 * 1000,
										periodUnit: 'day' // year, month, week, day, hour, minute, second, millisecond	
								},
								styles: {
										strokeWidth: 2,
										stroke: 'orange',
										dashstyle: 'solid'
								}
	});

	//adv_options.indicators.reverse();

  // Split the lines
    var lines = data.split('\n'),
    		time = (new Date()).getTime();

    $.each(lines, function(lineNo, line) {

        var items = line.split(';');

        adv_options.series[0].data.push([time, parseFloat(items[0]), parseFloat(items[0]),parseFloat(items[1]),parseFloat(items[2])]);
        time += (24 * 3600 * 1000);
    });
  
	$('#container-candlestick-atr').highcharts('StockChart', $.extend({},adv_options));
});

/*
 * 2.5 ADVANCED CHART - AREARANGE
 */

  /*$.getJSON('http://www.highcharts.com/samples/data/jsonp.php?filename=range.json&callback=?', function(data) {

  		adv_options.indicators[1].params.index = 1;
			adv_options.series[0].type = 'arearange';
  		adv_options.series[0].data = data;

			$('#container-arearange').highcharts('StockChart', $.extend({},adv_options));
});*/



});
