(function (HC) {

  /***
    
    Each indicator requires mothods:
    
    - getDefaultOptions()               - returns object with default parameters, like period etc.
    - getValues(chart, series, options) - returns array of calculated values for indicator
    - getGraph(chart, series, options)  - returns path, or columns as SVG elemnts to add.
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

    var merge   = HC.merge,
        isArray = HC.isArray,
        UNDEFINED;
    
    Indicator.ema = {
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
                periodUnited = utils.periodTransform(period,unit),
                EMApercent = (2 / (periodUnited + 1)),
                calEMA = range = 0,
                xValue = xVal[0],
                yValue = yVal[0],
                EMA = [],
                xData = [],
                yData = [],
                point,i,index,points,yValue;

           //switch index for OHLC / Candlestick / Arearange
           if(isArray(yVal[0])) {
              index  = params.index ? params.index : 0;
              yValue = yVal[0][index];
           } else {
              index  = -1;
           }

           points = [[xValue, yValue]];

           for(i = 1; i < yValLen; i++){
              range = utils.accumulateAverage(points, xVal, yVal, i, index);      
              if(period <= range) {
									EMAPoint = utils.populateAverage(points, xVal, yVal, i, EMApercent, calEMA, index);
									EMA.push(EMAPoint);
									xData.push(EMAPoint[0]);
									yData.push(EMAPoint[1]);
                  calEMA = EMAPoint[1]; 
              }
           }
           
					 EMAPoint = utils.populateAverage(points, xVal, yVal, i, EMApercent, calEMA, index);
					 EMA.push(EMAPoint);
					 xData.push(EMAPoint[0]);
					 yData.push(EMAPoint[1]);
					 

           return {
           	 values: EMA,
           	 xData: xData,
           	 yData: yData
           };
        }, 
        getGraph: function(chart, series, options, values) {
           var path   = [],
               attrs  = {},
               xAxis  = series.xAxis,
               yAxis  = series.yAxis,
               ema    = values,
               emaLen = ema.length,
               emaX,
               emaY,
               i;
               
           attrs = merge({
               'stroke-width': 2,
               stroke: 'red',
               dashstyle: 'Dash'
           },  options.styles);  
           
           path.push('M', xAxis.toPixels(ema[0][0]), yAxis.toPixels(ema[0][1])); 
               
           for(i = 0; i < emaLen; i++){
              emaX = ema[i][0];
              emaY = ema[i][1];
              
              path.push('L', xAxis.toPixels(emaX), yAxis.toPixels(emaY));
           }

           return chart.renderer.path(path).attr(attrs);
        },
        utils: {
            periodTransform: function(period,unit) {
              switch(unit) {
                  case 'second':
                    period = period / 1000;
                    break;
                  case 'minute':
                    period = period / (60000);
                    break;
                  case 'hour':
                    period = period / (3600000);
                    break;
                  case 'day':
                    period = period / (86400000);
                    break;
                  case 'week':
                    period = period / (604800000);
                    break;
                  case 'month':
                    period = period / (2678400000);
                    break;
                  case 'year':
                    period = period / (31536000000);
                    break;
                };

                return period;
            },
            accumulateAverage: function(points, xVal, yVal, i, index){ 
                var xValue = xVal[i],
                    yValue = index < 0 ? yVal[i] : yVal[i][index],
                    pLen   = points.push([xValue, yValue]);
                    range  = points[pLen - 1][0] - points[0][0]; 

                return range;
            },
            populateAverage: function(points, xVal, yVal, i, EMApercent, calEMA, index){
                var pLen       = points.length,
                    x          = xVal[i-1],
                    yValuePrev = index < 0 ? yVal[i-2] : yVal[i-2][index],
                    yValue     = index < 0 ? yVal[i-1] : yVal[i-1][index],
                    prevPoint,y;

                prevPoint = calEMA === 0 ? yValuePrev : calEMA;
                y = ((yValue * EMApercent) + (prevPoint * (1 - EMApercent)));

                return [x, y];
            }
        }
    }
})(Highcharts)
