(function (HC) {
		/***
		
		Each indicator requires mothods:
		
		- getDefaultOptions() 							- returns object with default parameters, like period etc.
		- getValues(chart, series, options) - returns array of calculated values for indicator
		- getGraph(chart, series, options) 	- returns path, or columns as SVG elemnts to add.
																					Doesn't add to chart via renderer! 
		
		***/
		
		/***
		indicators: [{
		    id: 'series-id',
		    type: 'sma',
		    params: {
		        period: 'x',
		        n: 'y'
		    },    
		    styles: {
		        lineWidth: 'x',
		        strokeColor: 'y'
		    }
		}]
		
		***/
		HC.Indicator.sma = {
				getDefaultOptions: function(){
						return {
								period: 4 * 24 * 3600 * 1000 // 5 days
						};
				},
				getValues: function(chart, series, options) {
						var range = 0,
							  xVal = series.processedXData,
							  yVal = series.processedYData,
							  yValLen = yVal.length,
							  points = [[xVal[0], yVal[0]]],
							  lastPointX = xVal[0],
							  SMA = [];
							 
					 
					 var sum = function(array) {
					 	 	var s = 0;
					 	 	for(var i in array) {
					 	 			s+= array[i][1];
					 	 	}
					 	 	return s;
					 };
					 
					 var accumulateAverage = function(i){
							var pLen = points.push([xVal[i], yVal[i]]);
									lastPointX = xVal[i];
									range = points[pLen - 1][0] - points[0][0]; 
					 };
					 
					 var populateAverage = function(i) {
					 	  var pLen = points.length,
					 	  		smaY = sum(points) / pLen,
					 	  		smaX = xVal[i-1];
					 	  		
					 	  SMA.push( [smaX, smaY] );
							range = points[pLen - 1][0] - points[1][0]; 
							while(points[points.length-1][0] - points[0][0] >= options.params.period) {
									points.shift(); 				// remove points until range < period
							}
					 };
					 
					 for(var i = 1; i < yValLen; i++ ){
					    if(options.params.period > range) {
					    		accumulateAverage(i);		// add actual point
					    } else {
					    		populateAverage(i);		  // we calculate new point, and remove first points
					    		accumulateAverage(i); 	// add actual point
					    }
					 }
					 populateAverage(yValLen);
					 
					 return SMA;
				}, 
				getGraph: function(chart, series, options) {
					 var path = [],
					 		 attrs = {
									 'stroke-width': 2,
									 stroke: 'red'
							 },
							 xAxis = series.xAxis,
							 yAxis = series.yAxis,
							 sma = this.getValues(chart, series, options),
							 smaLen = sma.length,
							 smaX,
							 smaY;
							 
						path.push('M', xAxis.toPixels(sma[0][0]), yAxis.toPixels(sma[0][1])); 
							 
					 for(var i = 1; i < smaLen; i++){
					 	 	smaX = sma[i][0];
					 	 	smaY = sma[i][1];
					 	 	
					 		path.push('L', xAxis.toPixels(smaX), yAxis.toPixels(smaY));
					 }
							 
					 return chart.renderer.path(path).attr(attrs);
				}
		}
		
})(Highcharts)
