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
							this.graph = graph = Indicator[options.type].getGraph(chart, series, options, this.values.slice(extremes.min, extremes.max));
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
						this.graph = graph = Indicator[options.type].getGraph(chart, series, options, this.values.slice(extremes.min, extremes.max));
						// shouldn't be attr({ d: path }); ?
						graph.add(group);
				} else {
						arrayValues = Indicator[options.type].getValues(chart, series, options);
						if(arrayValues) {
							this.values = arrayValues.values;
							this.xData = arrayValues.xData;
							this.yData = arrayValues.yData;
							extremes = this.getXExtremes();
							this.graph = graph = Indicator[options.type].getGraph(chart, series, options, this.values.slice(extremes.min, extremes.max));
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
						min,
						max;
				
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
				max = max > len - 4 ? len : max + 3;
				
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
						each(this.indicators.allItems, function (indicator) {
									indicator.redraw();
						});
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
			 Highcharts.addEvent(chart, 'redraw', function () {
						chart.redrawIndicators();
			 });
		});
})(Highcharts);
