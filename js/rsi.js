(function (HC) {
		/***
		
		Each indicator requires mothods:
		
		- getDefaultOptions() 											- returns object with default parameters, like period etc.
		- getValues(chart, series, options) 				- returns array of calculated values for indicator
		- getGraph(chart, series, options, values) 	- returns path, or columns as SVG elements to add.
																									Doesn't add to chart via renderer! 
		
		***/
		
		/***
		indicators: [{
		    id: 'series-id',
		    type: 'rsi',
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
		
		var UNDEFINED,
				merge = HC.merge,
				isArray = HC.isArray,
        addAxisPane = HC.Axis.prototype.addAxisPane;
		
		Indicator.prototype.rsi = {
				getDefaultOptions: function(){
						return {
								period: 5,
								overbought: 70,
								oversold: 30
						};
				},
				getValues: function(chart, series, options, points) {
						var utils = this.utils,
                params = options.params,
                period = params.period,
                xVal = points[0].concat(series.processedXData),
                yVal = points[1].concat(series.processedYData),
                yValLen = yVal ? yVal.length : 0,
                EMA = Indicator.prototype.ema,
                EMApercent = (2 / (period + 1)),
                calEMAGain = 0,
                calEMALoss = 0,
                range = 1,
                RSI = [],
                xData = [],
                yData = [],
                index = 4,
                gain = [],
                loss = [],
                RSIPoint, change, RS, avgGain, avgLoss;
             
           // atr requires close value     
           if(!isArray(yVal[0]) || yVal[0].length != 4 || EMA === UNDEFINED) {
              return;
           }
           
           // accumulate first N-points
           while(range < period){
           	 	change = parseFloat((yVal[range][3] - yVal[range - 1][3]).toFixed(4));
           	 	gain.push(change > 0 ? change : 0);
           	 	loss.push(change < 0 ? Math.abs(change) : 0);
           	 	range ++;
           }
           
           for(i = period - 1; i < yValLen; i++ ){
           	 	 var len;
           	 	 
           	 	 change = parseFloat((yVal[i][3] - yVal[i - 1][3]).toFixed(4));
							 gain.push(change > 0 ? change : 0);
							 len = loss.push(change < 0 ? Math.abs(change) : 0) - 1; // better than loss.length
           	 	 
           	 	 // EMA for loss and gains
           	 	 avgGain = EMA.utils.populateAverage([], gain, [ yVal[i-1], [utils.sumArray(gain) / len] ], 2, EMApercent, calEMAGain, 0);
           	 	 avgLoss = EMA.utils.populateAverage([], gain, [ yVal[i-1], [utils.sumArray(loss) / len] ], 2, EMApercent, calEMALoss, 0);
           	    
           	 	 // relative strengh
							 RS = avgGain[1] / avgLoss[1];
							 // calculate RSI value
							 RSIPoint = 100 - (100 / (1 + RS));
							 
							 RSI.push([xVal[i], RSIPoint]);
							 xData.push(xVal[i]);
							 yData.push(RSIPoint);	
							 
							 // remove first point from array
							 gain.shift();
							 loss.shift();
							 
							 calEMAGain = avgGain[1]; 
							 calEMALoss = avgLoss[1]; 
					 }
					 
					 return {
					 	 values: RSI,
					 	 xData: xData,
					 	 yData: yData
					 };
				}, 
        getGraph: function(chart, series, options, values) {
           var path = [],
               attrs = {},
               xAxis = series.xAxis,
               atr = values,
               atrLen = atr.length,
               defaultOptions,
               userOptions,
               yAxis,
               index,
               atrX,
               atrY,
               i;

					 defaultOptions = {
							 min: 0,
							 tickInterval: 25,
							 plotLines: [{
							 		value: options.params.overbought,
							 		color: 'orange',
							 		width: 1
							 }, {
							 	  value: options.params.oversold,
							 		color: 'orange',
							 		width: 1
							 }],
							 max: 100,
							 title: {
							 	 	text: 'RSI'
							 }
					 };

           userOptions = merge(defaultOptions, options.yAxis);
           
           if(options.Axis === UNDEFINED) {
             index = addAxisPane(chart,userOptions); 
             options.Axis = chart.yAxis[index];
           }

           yAxis = options.Axis;

           attrs = merge({
               'stroke-width': 2,
               stroke: 'red',
               dashstyle: 'Dash'
           },  options.styles);  
           
           path.push('M', xAxis.toPixels(atr[0][0]), yAxis.toPixels(atr[0][1])); 
               
           for(i = 0; i < atrLen; i++) {
              atrX = atr[i][0];
              atrY = atr[i][1];
              path.push('L', xAxis.toPixels(atrX), yAxis.toPixels(atrY));
           }

           return chart.renderer.path(path).attr(attrs);
        },
				utils: {
						sumArray: function(array){
							  // reduce VS loop => reduce
								return array.reduce(function(prev, cur) {
										return prev + cur;
								});
						}
				}
		};
})(Highcharts);
