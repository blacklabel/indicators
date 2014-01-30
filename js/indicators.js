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
				
		HC.Indicator = Indicator = function () {
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
			},
			
			/*
			* Render the indicator
			*/
			render: function (redraw) {
				var indicator = this,
						chart = this.chart,
						renderer = chart.renderer,
						group = this.group,
						graph = this.graph,
						options = this.options,
						series = this.series;
					
				if (!group) {
						group = indicator.group = renderer.g();
				}
				
				if(!series) {
						error('Series not found');
						return false;
				} else if(!graph) {
						this.graph = graph = Indicator[options.type].getGraph(chart, series, options);
				}
				graph.add(/* group */);
			},
			
			/*
			* Redraw the indicator 
			*/
			redraw: function () {
				var options = this.options,
						chart = this.chart,
						series = this.series,
						group = this.group,
						graph = this.graph;
						
				if(graph)
						graph.destroy();
				
				this.graph = graph = Indicator[options.type].getGraph(chart, series, options);
				graph.add();
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
        group.add();
        group.clip(clipPath);
        
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
