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
		
		
		
		var UNDEFINED,
				Chart = HC.Chart,
				Axis = HC.Axis,
				extend = HC.extend,
				each = HC.each,
				merge = HC.merge;
		
		function error(name) {
				if(window.console){
						console.error(name);
				}
		}
		
		function forceRedraw(s){
				if(s.indicators) {
						each(s.indicators, function(el, i) {
								el.isDirty = true;
						});
						s.indicators = null;
				}
		}

		HC.isArray = function(obj) {
			return Object.prototype.toString.call(obj) === '[object Array]';
		}

		HC.isObject = function(obj) {
			return typeof obj === 'object';
		}

		HC.splat = function (obj) {
			return HC.isArray(obj) ? obj : [obj];
		}

		
		/***
		
		Wrappers:
		
		***/
		
		
		/*
		*  Remove corresponding indicators for series
		*/
		HC.wrap(HC.Series.prototype, 'update', function(proceed, redraw, animation) {
				var tempIndics = [],
						s = this;
						
				if(s.indicators) {
						each(s.indicators, function(el, i) {
								tempIndics.push(merge({}, el.options));
						});
				}
				proceed.call(this, redraw, animation);
				
				s = this;
				each(tempIndics, function(el, i){
						s.chart.addIndicator(el);
				});
		});
		

		
		/*
		*  Remove corresponding indicators for series
		*/
		HC.wrap(HC.Series.prototype, 'remove', function(proceed, redraw, animation) {
				var s = this;
				if(s.indicators) {
						each(s.indicators, function(el, i) {
								el.destroy();
						});
						s.indicators = null;
				}
				proceed.call(this, redraw, animation);
		});
		
		/*
		*  Force redraw for indicator with new data
		*/
		HC.wrap(HC.Series.prototype, 'setData', function(proceed, redraw, animation) {
				forceRedraw(this);
				proceed.call(this, redraw, animation);
		});
		
		/*
		*  Force redraw for indicator when new point is added
		*/
		HC.wrap(HC.Series.prototype, 'addPoint', function(proceed, options, redraw, shift, animation) {
				forceRedraw(this);
				proceed.call(this, options, redraw, shift, animation);
		});
		
		/*
		*  Force redraw for indicator with new point options, like value
		*/
		HC.wrap(HC.Point.prototype, 'update', function(proceed, options, redraw) {
				forceRedraw(this.series);
				proceed.call(this, options, redraw);
		});
		
		/*
		*  Force redraw for indicator when one of points is removed
		*/
		HC.wrap(HC.Point.prototype, 'remove', function(proceed, redraw, animation) {
				forceRedraw(this.series);
				proceed.call(this, options, redraw);
		});
		

		/*
		*		Set flag for navigator yAxis
		*/
    HC.wrap(HC.Scroller.prototype, 'init', function (proceed) {
    	proceed.call(this);
      this.yAxis.isNavigator = true;
    });

    /*
		*		Tooltip formatter content
		*/
		HC.wrap(HC.Tooltip.prototype, 'defaultFormatter',function (proceed, options, redraw) {

			var points 		 = this.points || HC.splat(this),
					series 		 = points[0].series,
					chart 		 = series.chart,
					tooltipOptions = chart.tooltip.options,
					indicators = series.indicators,
					x 			   = this.x,
					s;

			// build the header
			s = [series.tooltipHeaderFormatter(points[0])];

			// build the values
			each(points, function (item) {
					series = item.series;
					s.push((series.tooltipFormatter && series.tooltipFormatter(item)) ||
					item.point.tooltipFormatter(series.tooltipOptions.pointFormat));
			});

			if(tooltipOptions.enabledIndicators) {
				// build the values of indicators
				$.each(indicators,function(i,ind){
					if(typeof(ind.values) === 'undefined') 
						return;

					$.each(ind.values,function(j,val){
						if(val[0] === x) 
							s.push(ind.options.type.toLowerCase() + ': ' + HC.numberFormat(val[1],2) + '<br/>');
					});
				});
			}

			// build the footer
			s.push(tooltipOptions.footerFormat || '');
			return s.join('');

		});

		/***
		
		Indicator Class:
		
		***/
				
		Indicator = Indicator = function () {
			this.init.apply(this, arguments);
		};
		
		Indicator.prototype = {
			/* 
			* Initialize the indicator
			*/
			init: function (chart, options) {
				// set default params, when not specified in params
				if(!Indicator[options.type]) error("Indicator not found!");
				options.params = merge({}, Indicator[options.type].getDefaultOptions(), options.params);
				
				this.chart = chart;
				this.options = options;
				this.series = chart.get(options.id);
				if(!this.series.indicators) {
						this.series.indicators = [];
				}
				this.series.indicators.push(this);
			},
			
			/*
			* Render the indicator
			*/
			render: function (redraw) {
				var indicator = this,
						chart = this.chart,
						renderer = chart.renderer,
						graph = this.graph,
						group = this.group,
						options = this.options,
						series = this.series,
						arrayValues,
						extremes;
						
				if (!group) {
						indicator.group = group = renderer.g().add();
						indicator.group.clip(chart.indicators.clipPath);
				}
				if(!series) {
						error('Series not found');
						return false;
				} else if(!graph) {
						arrayValues = Indicator[options.type].getValues(chart, series, options);
						if(arrayValues) {
							this.values = arrayValues.values;
							this.xData = arrayValues.xData;
							this.yData = arrayValues.yData;
							extremes = this.getXExtremes();
							this.currentPoints = this.values.slice(extremes.min, extremes.max);
							this.graph = graph = Indicator[options.type].getGraph(chart, series, options, this.currentPoints);
							graph.add(group);
						}
				}
			},

			/*
			* Redraw the indicator 
			*/
			redraw: function () {
				var options = this.options,
						chart = this.chart,
						series = this.series,
						graph = this.graph,
						group = this.group,
						isDirty = this.isDirty,
						arrayValues,
						extremes;
						
				if(graph) {
						graph.destroy();
				}
				
				if(this.values && !isDirty) {
						extremes = this.getXExtremes();
						this.currentPoints = this.values.slice(extremes.min, extremes.max);
						this.graph = graph = Indicator[options.type].getGraph(chart, series, options, this.currentPoints);
						// shouldn't be attr({ d: path }); ?
						graph.add(group);
				} else {
						arrayValues = Indicator[options.type].getValues(chart, series, options);
						if(arrayValues) {
							this.values = arrayValues.values;
							this.xData = arrayValues.xData;
							this.yData = arrayValues.yData;
							extremes = this.getXExtremes();
							this.currentPoints = this.values.slice(extremes.min, extremes.max);
							this.graph = graph = Indicator[options.type].getGraph(chart, series, options, this.currentPoints);
							graph.add(group);
						}
				}
			},	
			
			/*
			* Get x-extremes for indicator to draw path only within plotting area
			*/
			getXExtremes: function(){
				var xData = this.xData,
						xAxis = this.xAxis || this.series.xAxis,
						len = xData.length,
						xMin = xAxis.min,
						xMax = xAxis.max,
						i = 0,
						min = 0,
						max = 0;
				
				while(i < len){
					if(xData[i] >= xMin) {
						min = i;
						i = len;
					}
					i++;
				}
				while(i > 0){
					if(xData[i] <= xMax) {
						max = i;
						i = 0;
					}
					i--;
				}
				min = min < 3 ? 0 : min - 2;
				max = max > len - 4 ? len + 1 : max + 3;
				
				return {
						min: min,
						max: max
				}
			},
			
			/*
			* Destroy the indicator
			*/
			destroy: function () {
				var indicator = this,
						chart = this.chart,
						allItems = chart.indicators.allItems,
						index = allItems.indexOf(indicator);
				
				if (index > -1) {
					allItems.splice(index, 1);
				}
				
				if (indicator.group) {
					// TO DO: do we need to destroy graph, or goup will be enough?
					indicator.group.destroy();
					indicator.group = null;
				}
				indicator = null;
			},
			
			/*
			* Update the indicator with a given options
			*/
			update: function (options, redraw) {
				extend(this.options, options);
				
				this.render(redraw);
			},
			
			/*
			* Hide the indicator
			*/
			hide: function() {
					this.group.hide();
			},
			
			/*
			* Show the indicator
			*/
			show: function() {
					this.group.show();
			}
		};
		
		
	
		// Add indicator methods to chart prototype
		extend(Chart.prototype, {
				/*
				* Adding indicator to the chart
				*/
				addIndicator: function (options, redraw) {
					var chart = this,
							indicators = chart.indicators.allItems,
							item;
					
					item = new Indicator(chart, options);
					indicators.push(item);
					item.render(redraw);
				},
				/*
				 * Redraw all indicators, method used in chart events
				 */
				redrawIndicators: function () {
						var chart = this,
								clipPath = chart.indicators.clipPath;
        
						clipPath.attr({
								x: chart.plotLeft,
								y: chart.plotTop,
								width: chart.plotWidth,
								height: chart.plotHeight
						});   
						each(this.indicators.allItems, function (indicator) {
									indicator.redraw();
						});
				}
		});
		
		// Add yAxis as pane
		extend(Axis.prototype, {
			addAxisPane: function(chart, userOptions) {
            var defaultOptions = {
            	  title:{
            	  	text:'ATR'
            	  },
            	  labels:{
            	  	x: -8,
									y: -2
            	  },
                offset: -25,
                height: 250,
                top: 0,
                min: 0,
                max: 100
            }
            
            var chYxis = chart.yAxis,
                len = chYxis.length,
                top = chYxis[0].top,
                topDiff = len > 2 ? chYxis[1].top - chYxis[0].top - chYxis[0].options.height : top,
                options = merge(defaultOptions,userOptions),
                i = sum = 0,
                hp = [],
                lastTop;
            
            //calculate height
            for (i = 0; i < len; i++) {
                if(!chYxis[i].isNavigator) 
                     sum += chYxis[i].height;
            };
            
            //update all axis
            for (i = 0; i < len; i++) {
                var yAxis = chYxis[i];
                
                if(!yAxis.isNavigator) {

                    var yAxisHeight = yAxis.height,
                        paneHeight = options.height,
                        hPercent = paneHeight / sum,
                        diffHeight, newHeight;
                    
                    if(hPercent > 0.5) {
                    	paneHeight = (yAxisHeight / 2);
                    	hPercent = paneHeight / sum;
                    }

                    diffHeight = sum * hPercent * (yAxisHeight / sum), 
                    newHeight = yAxisHeight - diffHeight - (topDiff / (len - 1));
                    options.height = paneHeight;

                    if(i > 0) {
                        var prevP = chYxis[i-1].isNavigator ? chYxis[i-2] : chYxis[i-1], 
                            prevH = prevP.options.height,
                            prevOldH = prevP.height;
                        
                        top = prevP.options.top + prevH + topDiff;
                    } 
                    
                    lastTop = top + newHeight + topDiff;
                    chYxis[i].update({
                        top: top,
                        height: newHeight
                    },false);
                }
            }
            
            //add new axis
            options.top = lastTop;
            chart.addAxis(options);

            return (chart.yAxis.length - 1);
			},
			minInArray: function(arr) {
				return arr.reduce(function (p, v) {
			    return ( p < v ? p : v );
			  })[1];
			},
			maxInArray: function(arr) {
				return arr.reduce(function (p, v) {
			    return ( p > v ? p : v );
			  })[1];
			}
		});
		
		// Initialize on chart load
		Chart.prototype.callbacks.push(function (chart) {
        var options = chart.options.indicators,
        		optionsLen = options ? options.length : 0,
        		clipPath,
						group,
						clipBox = {
								x: chart.plotLeft,
								y: chart.plotTop,
								width: chart.plotWidth,
								height: chart.plotHeight
						};
        
        clipPath = chart.renderer.clipRect(clipBox);   
        group = chart.renderer.g("indicators");
        group.attr({
        		zIndex: 7
        });
        group.clip(clipPath);
        group.add();
        
        if(!chart.indicators) chart.indicators = {};
        
        // initialize empty array for indicators
        if(!chart.indicators.allItems) chart.indicators.allItems = [];
        
        
        // link chart object to indicators
        chart.indicators.chart = chart;
        
        // link indicators group element to the chart
        chart.indicators.group = group;
        
        // add clip path to indicators
        chart.indicators.clipPath = clipPath;
        
       for(var i = 0; i < optionsLen; i++) {
        		chart.addIndicator(options[i]);
       }
        
				// update indicators after chart redraw
			 chart.redrawIndicators();
			 Highcharts.addEvent(chart, 'redraw', function () {
					chart.redrawIndicators();
			 });
		});


})(Highcharts);
