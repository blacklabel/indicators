<script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
<script src="http://code.highcharts.com/highcharts.js"></script>
<script src="./bubble-dragAdrop.js"></script>

# Indicators - Highstock module

Go to project page to see this module in action: [http://blacklabel.github.io/indicators/](http://blacklabel.github.io/indicators/)


<div id="chart" style="height: 300px"></div>
<script>
$.getJSON('http://www.highcharts.com/samples/data/jsonp.php?filename=aapl-ohlcv.json&callback=?', function(data) {
    window.chart = new Highcharts.Chart('StockChart',{
        chart:{
            type: 'candlestick'
        },
        indicators: [{
            id: 'AAPL',
            type: 'sma',
            params: {
                period: 5,
            }
        }, {
            id: 'AAPL',
            type: 'ema',
            params: {
                period: 5,
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
        tooltip:{
            enabledIndicators: true
        },
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
</script>

### Requirements

* Plugin requires the latest Highstock (tested with 1.3.9)

### Installation

* Like any other Highcharts module (e.g. exporting), add `<script>` tag pointing to `indicators.js` below Highcharts script tag.

### Code

The latest code is available on github: [https://github.com/blacklabel/indicators/](https://github.com/blacklabel/indicators/)

### Usage and demos
```
indicators: [{
            id: 'AAPL',
            type: 'sma',
            params: {
                period: 5,
            }
        }, {
            id: 'AAPL',
            type: 'ema',
            params: {
                period: 5,
                index: 0
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
tooltip:{
    enabledIndicators: true
},
```

### Parameters
* id - id of serie
* type - type of indicator (sma, ema, atr, rsi)
* styles - color, style, width
* yAxis - options for additional yAxis (atr, rsi)
* index - parameter for ohlc / candlestick / arearange - index of value which should be calculated. I.e open has index 0
* enabledIndicators - show indicators in tooltip

### Demo

Demos are available at project's github page: [http://blacklabel.github.io/indicators/](http://blacklabel.github.io/indicators/)