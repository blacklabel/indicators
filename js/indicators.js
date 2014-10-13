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
				merge = HC.merge,
        mathMax = Math.max;

		
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
						//s.indicators = null;
				}
		}

		HC.isArray = function(obj) {
			return Object.prototype.toString.call(obj) === '[object Array]';
		};

		HC.isObject = function(obj) {
			return typeof obj === 'object';
		};

		HC.splat = function (obj) {
			return HC.isArray(obj) ? obj : [obj];
		};

		
		/***
		
		Wrappers:
		
		***/
		
		/*
		*  Remove corresponding indicators for series
		*/
		HC.wrap(HC.Series.prototype, 'update', function(proceed, redraw, animation) {
				var tempIndics = [],
						s = this,
						tmpAxis;
						
				if(s.indicators) {
						each(s.indicators, function(el, i) {
								tempIndics.push(el.options);
								el.destroy();
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
				this.chart.updateHeightAxes(20, false);
				proceed.call(this, redraw, animation);
		});
		
		/*
		*  Force redraw for indicator when new point is added
		*/
		HC.wrap(HC.Series.prototype, 'addPoint', function(proceed, options, redraw, shift, animation) {
				var tempIndics = [],
						s = this;
						
				if(s.indicators) {
						each(s.indicators, function(el, i) {
								tempIndics.push(el.options);
								el.destroy();
						});
						s.indicators = null;
				}
				proceed.call(this, options, redraw, shift, animation);
				
				s = this;

				each(tempIndics, function(el, i){
						s.chart.addIndicator(el);
				});
		});
		
		
		/*
		*  Set visibility for all indicators to be the same as series
		*/
		HC.wrap(HC.Series.prototype, 'setVisible', function(proceed, vis, redraw) {
				var newVis = vis === UNDEFINED ? !this.visible : vis;

				proceed.call(this, newVis, true);
				if(this.indicators) { 
					HC.each(this.indicators, function(ind, i) {
						ind.setVisible(newVis, redraw);
					});
				}				
		});
		
		/*
		*  Force redraw for indicator with new point options, like value
		*/
		HC.wrap(HC.Point.prototype, 'update', function(proceed, options, redraw) {
				var tempIndics = [],
						s = this;
						
				if(s.indicators) {
						each(s.indicators, function(el, i) {
								tempIndics.push(el.options);
								el.destroy();
						});
						s.indicators = null;
				}
				proceed.call(this, options, redraw);
				
				s = this;

				each(tempIndics, function(el, i){
						s.chart.addIndicator(el);
				});
		});
		
		/*
		*  Force redraw for indicator when one of points is removed
		*/
		HC.wrap(HC.Point.prototype, 'remove', function(proceed, options, redraw, animation) {
				forceRedraw(this.series);
				proceed.call(this, options, redraw);
		});
		
    /*
    *  Set flag for hasData when indicator has own axis
    */
    HC.wrap(HC.Axis.prototype, 'render', function(p) {
    		if(this.indicator && !this.indicator.visible) {
    			this.hasData = false;
    		}
    		p.call(this);
    });

    /*
		*		Tooltip formatter content
		*/
		HC.wrap(HC.Tooltip.prototype, 'defaultFormatter',function (proceed, options, redraw) {

			var points 		 = this.points || HC.splat(this),
					series 		 = points[0].series,
					chart 		 = series.chart,
					tooltipOptions = chart.tooltip.options,
					indicators = chart.indicators.allItems,
					x 			   = this.x,
					t 				 = series.tooltipHeaderFormatter !== UNDEFINED ? series.tooltipHeaderFormatter : 
												(series.tooltipFooterHeaderFormatter !== UNDEFINED ? series.tooltipFooterHeaderFormatter : 
											  	(chart.tooltip.tooltipFooterHeaderFormatter	!== UNDEFINED ? chart.tooltip.tooltipFooterHeaderFormatter : chart.tooltip.tooltipHeaderFormatter)),  // version 1.x vs 2.0.x vs 2.1.x
					s;

			// build the header
			s = [t.call(chart.tooltip, points[0])];

			// build the values
			each(points, function (item) {
					series = item.series;
					s.push((series.tooltipFormatter && series.tooltipFormatter(item)) ||
					item.point.tooltipFormatter(series.tooltipOptions.pointFormat));
			});

			if(indicators && indicators !== UNDEFINED && tooltipOptions.enabledIndicators) {
				// build the values of indicators

				$.each(indicators,function(i,ind) {
					if(typeof(ind.values) === 'undefined' || ind.visible === false) {
						return;
					}

					$.each(ind.currentPoints,function(j,val){
						if(val[0] === x) {
							s.push('<span style="font-weight:bold;color:' + ind.graph.element.attributes.stroke.value + ';">' + ind.options.type.toUpperCase() + '</span>: ' + HC.numberFormat(val[1],3) + '<br/>');
						}
					});
				});
			}

			// build the footer
			s.push(tooltipOptions.footerFormat || '');
			return s.join('');

		});
		

		/***
		
		Add legend items:
		
		***/
		
		
		/* 
		* Add indicators to legend
		*/
		HC.wrap(HC.Legend.prototype, 'getAllItems', function(p) {
				var allItems = p.call(this),
						indicators = this.chart.indicators;
				if(indicators) {
						HC.each(indicators.allItems, function(e, i) {
								if(e.options.showInLegend) {
										allItems.push(e);
								}
						});
				}
				return allItems;
		});
		
		
		/*
		* Render indicator
		*/
		HC.wrap(HC.Legend.prototype, 'renderItem', function(p, item) {
				if(item instanceof Indicator) {
						var series = item.series;
						item.series = null;
						item.color = item.graph.stroke;
						p.call(this, item);
						item.series = series;
				} else {
						p.call(this, item);
				}
		});
		
		/*
		* Update positioning in legend
		*/
		HC.wrap(HC.Legend.prototype, 'positionItem', function(p, item) {
					p.call(this, item);
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
				if(!Indicator.prototype[options.type]) error("Indicator: " + options.type + " not found!");
				options.params = merge({}, Indicator.prototype[options.type].getDefaultOptions(), options.params);
	
				this.chart = chart;
				this.options = options;
				this.series = chart.get(options.id);
				this.name = options.type;
				this.visible = options.visible === UNDEFINED ? true : options.visible;

				var cropShoulder = this.series.cropShoulder,
						maxPeriod;
	
				if(this.options.params.period > cropShoulder || cropShoulder === UNDEFINED) {
					maxPeriod = this.options.params.period;
					extend(this.series, {
						cropShoulder: maxPeriod + 2
					});
				}

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
						visible = options.visible,
						pointsBeyondExtremes,
						arrayValues,
						extremes;

				if(!indicator.visible) return;		
						
				if (!group) {
						indicator.group = group = renderer.g().add(chart.indicators.group);
						indicator.group.clip(chart.indicators.clipPath);
				}
				if(!series) {
						error('Series not found');
						return false;
				} else if(!graph) {
						this.pointsBeyondExtremes = pointsBeyondExtremes = this.groupPoints(series);
						arrayValues = Indicator.prototype[options.type].getValues(chart, series, options, pointsBeyondExtremes);
						if(!arrayValues) { //#6 - create dummy data 
							arrayValues = {
								values: [[]],
								xData: [[]],
								yData: [[]]
							};
						}
						this.values = this.currentPoints = arrayValues.values;
						this.xData = arrayValues.xData;
						this.yData = arrayValues.yData;
						this.graph = graph = Indicator.prototype[options.type].getGraph(chart, series, options, this.values);
						
							if(graph) {
								graph.add(group);
							}
							if(indicator.options.Axis) {
									indicator.options.Axis.indicator = indicator;
							}
				}
				chart.legend.render();
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
						visible = options.visible,
						axis = options.Axis,
						pointsBeyondExtremes,
						arrayValues,
						extremes;
						
				if(!this.visible) return;				

				this.pointsBeyondExtremes = pointsBeyondExtremes = this.groupPoints(series);
				arrayValues = Indicator.prototype[options.type].getValues(chart, series, options, pointsBeyondExtremes);
                   
				if(!arrayValues) { //#6 - create dummy data 
						arrayValues = {
								values: [[]],
								xData: [[]],
								yData: [[]]
						}
				}
				this.values = this.currentPoints = arrayValues.values;
				this.xData = arrayValues.xData;
				this.yData = arrayValues.yData;
				if(graph) {
						graph.destroy();
				}

				this.graph = graph = Indicator.prototype[options.type].getGraph(chart, series, options, this.values);
				
				if(graph) {
						graph.add(group);
				}
			},	
			
			/*
			* Group points to allow calculation before extremes
			*/
			groupPoints: function(series){
					var points = [[], []];
					if(series.currentDataGrouping) {
							var start = end = series.cropStart,
									length = series.cropShoulder,
									xMax = series.xData[end],
									range = series.currentDataGrouping.totalRange,
									xMin = xMax - range,
									processedXData = [],
									processedYData = [],
									actX = series.xData[0],
									preGroupedPoints = [],
									groupedPoint,
									pLen = 0,
									i = 0;
									
							if(series.currentDataGrouping.totalRange == series.closestPointRange) {
							// we don't need grouping, since one point is the same as grouped point
								points[0] = series.xData.slice(end - length, end);
								points[1] = series.yData.slice(end - length, end);
							} else {
								// group points
								while(length >= 0 && end > 0){
										//get points in range
										preGroupedPoints = this.gatherPoints(series.xData, series.yData, xMin, xMax, end);
										pLen = preGroupedPoints.x.length; 
										if(pLen > 0){
												length --;
												groupedPoint = this.groupPoint(preGroupedPoints, series);
												points[0].push(groupedPoint[0][0]);
												points[1].push(groupedPoint[1][0]);
										}
										// change extremes for next range
										end -= pLen;
										xMax = xMin;
										xMin -= range;
								}
								if(points[0].length > 0) {
										points.sort(function(a,b) { return a[0][0] - b[0][0]; });
								}
							}
					} 
					return points;
					
			},
			
			/*
			* Group points into array for grouping
			*/
			gatherPoints: function(xData, yData, min, max, end){
					var x = [],
							y = [],
							middle = [max - (max - min) / 2];
					
					while(end >= 0 && max > min) {
								end--;
								max = max - (max - xData[end]); 
								x.push(xData[end]);
								y.push(yData[end]);
					}
					return {x: x, y: y, middle: middle};
			},
			
			
			/*
			* Group points to get grouped points beyond extremes
			*/
			groupPoint: function(points, series) {
				var grouped = series.groupData.apply(series, [points.x, points.y, points.middle, series.options.dataGrouping.approximation ]);
				return grouped;
			},
			
			/*
			* Destroy the indicator
			*/
			destroy: function (redraw) {
				var indicator = this,
						chart = this.chart,
						allItems = chart.indicators.allItems,
						index = allItems.indexOf(indicator),
						Axis = this.options.Axis;
				
				if (index > -1) {
					allItems.splice(index, 1);
				}

				//remove axis
				if(Axis) {
					Axis.remove();
					chart.updateHeightAxes(20, false);
				}
				
				if (indicator.group) {
					// TO TEST: do we need to destroy graph, or group will be enough? - Looks fine.
					indicator.group.destroy();
					indicator.group = null;
				}
				indicator = null;
				chart.redraw(redraw);
			},
			
			/*
			* setState for indicator?
			*/
			setState: function(state) {
				
			},
			
			/*
			* Hide or show indicator
			*/
			setVisible: function(vis, redraw) {
				var indicator = this,
						oldVis = indicator.visible,
						newVis,
						method;
				
				if(vis === UNDEFINED) {
						newVis = oldVis ? false : true;
						method = oldVis ? 'hide' : 'show';
				} else {
						newVis = vis;
						method = vis ? 'show' : 'hide';
				}	
				
				if(!this.series.visible) {
					if(!this.visible) return;
					newVis = false;
				}
				
				if (this.options.showInLegend) {
						this.chart.legend.colorizeItem(this, newVis);
				}
				this.visible = newVis;
				
				// hide axis by resetting extremes
				if(this.options.Axis) {
						if(this.visible) {
							this.options.Axis.hasData = true;
							this.options.Axis.render();
						} else {
							this.options.Axis.hasData = false;
							this.options.Axis.render();
							
						}
				}
				indicator[method]();
				indicator.redraw();
			}, 
			
			/*
			* Draw symbol in legend - should be simple line
			*/ 
			
			drawLegendSymbol: function(legend) {
					var options = this.options,
							markerOptions = options.marker,
							radius,
							legendOptions = legend.options,
							legendSymbol,
							symbolWidth = legend.symbolWidth,
							renderer = this.chart.renderer,
							legendItemGroup = this.legendGroup,
							verticalCenter = legend.baseline - Math.round(renderer.fontMetrics(legendOptions.itemStyle.fontSize, this.legendItem).b * 0.3),
							attr;
				
					// Draw the line
					attr = {
						'stroke-width': options.lineWidth || 2
					};
					if (options.dashStyle) {
						attr.dashstyle = options.dashStyle;
					}
					this.legendLine = renderer.path([
						'M',
						0,
						verticalCenter,
						'L',
						symbolWidth,
						verticalCenter
					])
					.attr(attr)
					.add(legendItemGroup);
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
					this.visible = false;
			},
			
			/*
			* Show the indicator
			*/
			show: function() {
					this.group.show();
					this.visible = true;
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
					chart.redraw(redraw);
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
				},
				/*
				 * updates axes and returns new and normalized height for each of them. 
				 */
				updateHeightAxes: function(topDiff, add) {
						var chart = this,
								chYxis = chart.yAxis,
                len = calcLen = chYxis.length,
                i = 0,
                sum = chart.chartHeight - chart.plotTop - chart.marginBottom, //workaround until chart.plotHeight will return real value
                indexWithoutNav = 0,
                newHeight,
                top;
                
            // when we want to remove axis, e.g. after indicator remove
            if(!add) calcLen--;    
            
						newHeight = (sum - (calcLen-1) * topDiff) / calcLen;
            //update all axis
            for (;i < len; i++) {
                var yAxis = chYxis[i];
                
                if(yAxis.options.id !== 'navigator-y-axis') {
                		top = chart.plotTop + indexWithoutNav * (topDiff + newHeight);
                        
                    chYxis[i].update({
                        top: top,
                        height: newHeight
                    },false);
                		indexWithoutNav++;
                } 
            }
            return newHeight;
				}
		});
		
		// Add yAxis as pane
		extend(Axis.prototype, {
				/* 
				 * When new indicator is added, sometimes we need new pane. 
				 * Note: It automatically scales all of other axes.
				 */
				addAxisPane: function(chart, userOptions) {
						var topDiff = 20,
								height = chart.updateHeightAxes(topDiff, true),
								defaultOptions = {
										labels: {
												align: 'left',
												x: 2,
												y: -2
										},
										offset: 0,
										height: height,
										top: chart.plotTop + (chart.yAxis.length - 1) * (topDiff + height),
										min: 0,
										max: 100
								},
								options = merge(defaultOptions,userOptions),
								yIndex;
							
						//add new axis
						chart.preventIndicators = true;
						chart.addAxis(options, false, true, false);
						yIndex = chart.yAxis.length - 1;
						/* HC.each(chart.yAxis, function(axis, ind) {
								axis.isDirty = true;
								axis.isDirtyExtremes = true;
								axis.redraw();
						}); */
						//chart.yAxis[yIndex].render();
						return yIndex;
				},
				
				minInArray: function(arr) {
						return arr.reduce(function(min, arr) {
								return Math.min(min, arr[1]);
						}, Infinity);
				},
				maxInArray: function(arr) {
						return arr.reduce(function(max, arr) {
								return Math.max(max, arr[1]);
						}, -Infinity);
				}
		});
		
		// Initialize on chart load
		Chart.prototype.callbacks.push(function (chart) {
        var options = chart.options.indicators,
        		optionsLen = options ? options.length : 0,
        		i = 0,
        		clipPath,
						group,
						exportingFlag = true, 
						clipBox = {
								x: chart.plotLeft,
								y: chart.plotTop,
								width: chart.plotWidth,
								height: chart.plotHeight
						};
        
        clipPath = chart.renderer.clipRect(clipBox);   
        group = chart.renderer.g("indicators");
        group.attr({
        		zIndex: 2
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
        
        for(i = 0; i < optionsLen; i++) {
        		chart.addIndicator(options[i], false);
        		if((chart.get(options[i].id).data.length - 1) <= options[i].params.period)
        			exportingFlag = false;
        }
        
				 // update indicators after chart redraw
				Highcharts.addEvent(chart, 'redraw', function () {
						if(!chart.preventIndicators) {
							chart.redrawIndicators();
						}
						chart.preventIndicators = false;
				});
				  
				if(exportingFlag) {
						chart.isDirtyLegend = true;
					  chart.series[0].isDirty = true;
					 	chart.series[0].isDirtyData = true;
					 	chart.redraw(false);
				}
		});


})(Highcharts);
