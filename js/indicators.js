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
						s.indicators = null;
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
					t 				 = series.tooltipHeaderFormatter !== UNDEFINED ? series : chart.tooltip,
					s;

			// build the header
			s = [t.tooltipHeaderFormatter(points[0])];

			// build the values
			each(points, function (item) {
					series = item.series;
					s.push((series.tooltipFormatter && series.tooltipFormatter(item)) ||
					item.point.tooltipFormatter(series.tooltipOptions.pointFormat));
			});

			if(indicators && indicators !== UNDEFINED && tooltipOptions.enabledIndicators) {
				// build the values of indicators

				$.each(indicators,function(i,ind) {
					if(typeof(ind.values) === 'undefined' || ind.options.visible === false) 
						return;

					$.each(ind.currentPoints,function(j,val){
						if(val[0] === x) 
							s.push('<span style="font-weight:bold;color:' + ind.graph.element.attributes['stroke'].value + ';">' + ind.options.type.toUpperCase() + '</span>: ' + HC.numberFormat(val[1],3) + '<br/>');
						
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
				if(!Indicator.prototype[options.type]) error("Indicator: " + options.type + " not found!");
				options.params = merge({}, Indicator.prototype[options.type].getDefaultOptions(), options.params);
	
				this.chart = chart;
				this.options = options;
				this.series = chart.get(options.id);

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
						if(arrayValues) {
							this.values = this.currentPoints = arrayValues.values;
							this.xData = arrayValues.xData;
							this.yData = arrayValues.yData;
							this.graph = graph = Indicator.prototype[options.type].getGraph(chart, series, options, this.values);
							
								if(graph) {
									graph.add(group);
								}
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
						visible = options.visible,
						axis = options.Axis,
						pointsBeyondExtremes,
						arrayValues,
						extremes;

				this.pointsBeyondExtremes = pointsBeyondExtremes = this.groupPoints(series);
				arrayValues = Indicator.prototype[options.type].getValues(chart, series, options, pointsBeyondExtremes);

				if(arrayValues) {
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
			destroy: function () {
				var indicator = this,
						chart = this.chart,
						allItems = chart.indicators.allItems,
						index = allItems.indexOf(indicator),
						Axis = this.options.Axis;
				
				if (index > -1) {
					allItems.splice(index, 1);
				}

				//remove axis
				if(Axis)
					Axis.remove();
				
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
				},
				forceRedrawChart: function () {
					var chart = this,
     					axes = chart.axes,
				      series = chart.series,
				      pointer = chart.pointer,
				      legend = chart.legend,
				      redrawLegend = chart.isDirtyLegend,
				      hasStackedSeries,
				      hasDirtyStacks,
				      isDirtyBox = chart.isDirtyBox, // todo: check if it has actually changed?
				      seriesLength = series.length,
				      i = seriesLength,
				      serie,
				      renderer = chart.renderer,
				      isHiddenChart = renderer.isHidden(),
				      afterRedraw = [];
				    
				    if (isHiddenChart) {
				      chart.cloneRenderTo();
				    }

				    // Adjust title layout (reflow multiline text)
				    chart.layOutTitles();

				    // link stacked series
				    while (i--) {
				      serie = series[i];

				      if (serie.options.stacking) {
				        hasStackedSeries = true;
				        
				        if (serie.isDirty) {
				          hasDirtyStacks = true;
				          break;
				        }
				      }
				    }
				    if (hasDirtyStacks) { // mark others as dirty
				      i = seriesLength;
				      while (i--) {
				        serie = series[i];
				        if (serie.options.stacking) {
				          serie.isDirty = true;
				        }
				      }
				    }

				    // handle updated data in the series
				    each(series, function (serie) {
				      if (serie.isDirty) { // prepare the data so axis can read it
				        if (serie.options.legendType === 'point') {
				          redrawLegend = true;
				        }
				      }
				    });

				    // handle added or removed series
				    if (redrawLegend && legend.options.enabled) { // series or pie points are added or removed
				      // draw legend graphics
				      legend.render();

				      chart.isDirtyLegend = false;
				    }

				    // reset stacks
				    if (hasStackedSeries) {
				      chart.getStacks();
				    }


				    if (chart.hasCartesianSeries) {
				      if (!chart.isResizing) {

				        // reset maxTicks
				        chart.maxTicks = null;

				        // set axes scales
				        each(axes, function (axis) {
				          axis.setScale();
				        });
				      }

				      chart.adjustTickAmounts();
				      chart.getMargins();

				      // If one axis is dirty, all axes must be redrawn (#792, #2169)
				      each(axes, function (axis) {
				        if (axis.isDirty) {
				          isDirtyBox = true;
				        }
				      });

				      // redraw axes
				      each(axes, function (axis) {
				        
				        // Fire 'afterSetExtremes' only if extremes are set
				        if (axis.isDirtyExtremes) { // #821
				          axis.isDirtyExtremes = false;
				          afterRedraw.push(function () { // prevent a recursive call to chart.redraw() (#1119)
				            fireEvent(axis, 'afterSetExtremes', extend(axis.eventArgs, axis.getExtremes())); // #747, #751
				            delete axis.eventArgs;
				          });
				        }
				        
				        if (isDirtyBox || hasStackedSeries) {
				          axis.redraw();
				        }
				      });


				    }
				    // the plot areas size has changed
				    if (isDirtyBox) {
				      chart.drawChartBox();
				    }


				    // redraw affected series
				    each(series, function (serie) {
				      if (serie.isDirty && serie.visible &&
				          (!serie.isCartesian || serie.xAxis)) { // issue #153
				        serie.redraw();
				      }
				    });

				    // move tooltip or reset
				    if (pointer && pointer.reset) {
				      pointer.reset(true);
				    }

				    // redraw if canvas
				    renderer.draw();

				    // fire the event
				    //HC.fireEvent(chart, 'redraw'); // jQuery breaks this when calling it from addEvent. Overwrites chart.redraw
				    
				    if (isHiddenChart) {
				      chart.cloneRenderTo(true);
				    }
				    
				    // Fire callbacks that are put on hold until after the redraw
				    each(afterRedraw, function (callback) {
				      callback.call();
				    });
				}
		});
		
		// Add yAxis as pane
		extend(Axis.prototype, {
			addAxisPane: function(chart, userOptions) {

            var defaultOptions = {
	            	labels: {
	            		align: 'left',
	            		x: 2,
	            		y: -2
	            	},
            		offset: 0,
                height: 250,
                top: 0,
                min: 0,
                max: 100
            }
            
            var chYxis = chart.yAxis,
                len = chYxis.length,
                top = chYxis[0].top,
                topDiff = top / 2, 
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
        		chart.addIndicator(options[i]);
        		if((chart.get(options[i].id).data.length - 1) <= options[i].params.period)
        			exportingFlag = false;
        }
        
				// update indicators after chart redraw
				 chart.redrawIndicators();
				 Highcharts.addEvent(chart, 'redraw', function () {
						chart.redrawIndicators();
				 });
				  
				 if(exportingFlag) {
					  chart.series[0].isDirty = true;
					 	chart.series[0].isDirtyData = true;
					 	chart.redraw();
				 }
		});


})(Highcharts);
