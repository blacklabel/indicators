(function (HC) {

    var merge = HC.merge,
        UNDEFINED;
    
    Indicator.ema = {
        getDefaultOptions: function(){
            return {
                period: 4 * 24 * 3600 * 1000 // 4 days
            };
        },
        getValues: function(chart, series, options) {
            var range = 0,
                xVal = series.xData,
                yVal = series.yData,
                yValLen = yVal ? yVal.length : 0,
                points = [[xVal[0], yVal[0]]],
                utils = this.utils,
                unit = options.params.periodUnit,
                period = options.params.period,
                periodUnited = utils.periodTransform(period,unit),
                EMApercent = (2 / (periodUnited + 1)),
                calEMA = 0,
                EMA = [],
                point,i;


           for(i = 1; i < yValLen; i++ ){
              if(period <= range) {
                  point = utils.populateAverage(points, xVal, yVal, i, period, EMApercent,calEMA);
                  calEMA = point[1]; 
                  EMA.push(point);
              }
              range = utils.accumulateAverage(points, xVal, yVal, i);      
           }
           
           EMA.push(utils.populateAverage(points, xVal, yVal, i, period, EMApercent,calEMA));
           
           return EMA;
        }, 
        getGraph: function(chart, series, options, values) {
           var path = [],
               attrs = {},
               xAxis = series.xAxis,
               yAxis = series.yAxis,
               ema = values,
               emaLen = ema.length,
               emaX,
               emaY;
               
           attrs = merge({
               'stroke-width': 2,
               stroke: 'red',
               dashstyle: 'Dash'
           },  options.styles);  
           
           path.push('M', xAxis.toPixels(ema[0][0]), yAxis.toPixels(ema[0][1])); 
               
           for(var i = 1; i < emaLen; i++){
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
            accumulateAverage: function(points, xVal, yVal, i){ 
                var pLen = points.push([xVal[i], yVal[i]]);
                    range = points[pLen - 1][0] - points[0][0]; 
                return range;
            },
            populateAverage: function(points, xVal, yVal, i, period, EMApercent,calEMA){
                var pLen = points.length,
                    x = xVal[i-1],
                    prevPoint = calEMA === 0 ? yVal[i-2] : calEMA,
                    y;

                y = ((yVal[i-1] * EMApercent) + (prevPoint * (1 - EMApercent)));

                return [x, y];
            }
        }
    }
})(Highcharts)
