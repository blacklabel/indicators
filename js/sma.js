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
		
		var merge = HC.merge;
		
		Indicator.sma = {
				getDefaultOptions: function(){
						return {
								period: 4 * 24 * 3600 * 1000 // 4 days
						};
				},
				getValues: function(chart, series, options) {
						var utils = this.utils,
                params = options.params,
                unit = params.periodUnit,
                period = params.period,
                xVal = series.xData,
                yVal = series.yData,
                yValLen = yVal ? yVal.length : 0,
                range = 0,
                xValue = xVal[0],
                SMA = [],
                point,i,index,points,yValue;

            //switch index for OHLC / Candlestick / Arearange
           if(Object.prototype.toString.call(yVal[0]) === '[object Array]') {
              index = params.index ? params.index : 0;
              yValue = yVal[0][index];
           } else {
              index = -1;
              yValue = yVal[0];
           }

           points = [[xValue, yValue]];
					 
					 for(var i = 1; i < yValLen; i++ ){
					 	
					    if(period <= range) {
					    	SMA.push(this.utils.populateAverage(points, xVal, yVal, i, period, index));
              }

              range = this.utils.accumulateAverage(points, xVal, yVal, i, index);	
					 }
					 SMA.push(this.utils.populateAverage(points, xVal, yVal, i, period, index));

					 return SMA;
				}, 
				getGraph: function(chart, series, options, values) {
					 var path = [],
					 		 attrs = {},
							 xAxis = series.xAxis,
							 yAxis = series.yAxis,
							 sma = values,
							 smaLen = sma.length,
							 smaX,
							 smaY;
							 
					 attrs = merge({
							 'stroke-width': 2,
							 stroke: 'red',
							 dashstyle: 'Dash'
					 },  options.styles);	 
					 
					 path.push('M', xAxis.toPixels(sma[0][0]), yAxis.toPixels(sma[0][1])); 
							 
					 for(var i = 1; i < smaLen; i++){
					 	 	smaX = sma[i][0];
					 	 	smaY = sma[i][1];
					 	 	
					 		path.push('L', xAxis.toPixels(smaX), yAxis.toPixels(smaY));
					 }
							 
					 return chart.renderer.path(path).attr(attrs);
				},
				utils: {
						accumulateAverage: function(points, xVal, yVal, i, index){ 
								var xValue = xVal[i],
                    yValue = index < 0 ? yVal[i] : yVal[i][index],
                    pLen =  points.push([xValue, yValue]);
                    range = points[pLen - 1][0] - points[0][0]; 

                return range;
						},
						populateAverage: function(points, xVal, yVal, i, period, index){
								var pLen = points.length,
										smaY = this.sumArray(points) / pLen,
										smaX = xVal[i-1];
										
								while(points[points.length-1][0] - points[0][0] >= period) {
										points.shift(); 				// remove points until range < period
								}
								
								pLen = points.length;
								range = points[pLen - 1][0] - points[1][0]; 
								
								return [smaX, smaY];
						},
						sumArray: function(array){
							  // reduce VS loop => reduce
								return array.reduce(function(prev, cur) {
										return [null, prev[1] + cur[1]];
								})[1];
						}
				}
		}
})(Highcharts)
