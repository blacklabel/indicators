$(function () {
		var options = {
				chart: {
						renderTo: 'container-simple'
				},
				indicators: [{
						id: 'first',
						type: 'sma'
				}],
				series: [{
						id: 'first',
						pointStart: Date.UTC(2013, 0, 1),
						pointInterval: 24 * 3600 * 1000,  //one day
						data: [16, 17, 17, 10, 17, 18, 17, 17, 17]
				}]
		};
		
		var chart = new Highcharts.StockChart(options);

		
		

		$.getJSON('http://www.highcharts.com/samples/data/jsonp.php?filename=aapl-c.json&callback=?', function(data) {
				// Create the chart
				$('#container-advanced').highcharts('StockChart', {
						indicators: [{
								id: 'AAPL',
								type: 'sma',
								params: {
										period: 3 * 30 * 24 * 3600 * 1000	
								}
						}],
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
		});

});
