/*
  Design, text, images and code by Richard K. Herz, 2017-2020
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// *** THIS VERSION OF OBJECT plotter USES THE FLOT.JS LIBRARY
// *** FOR X-Y PLOTS
//
// *** SPECIFICALLY, FUNCTION plotPlotData HERE IS SPECIFIC TO FLOT.JS
//
// *** TO USE ANOTHER LIBRARY, WRITE ANOTHER VERSION IN A DIFFERENT FILE
// *** COMPONENTS (functions, objects) NAMES SHOULD STAY SAME BUT
// *** definitions of those components will change

let plotter = {
  // plotting with the flot.js library AND ALSO
  // generates the color canvas plots indpendently of flot.js or other libaries
  // USES OBJECT plotInfo in file process_plot_info.js

  // --------- DEFINE CHILD OBJECT plotArrays ---------------

  plotArrays : {
    // ----- OBJECT USED TO HOLD PLOT DEFINITIONS BETWEEN DISPLAY UPDATES ---
    //
    // DEFINE plot array used to save complete description of plot between updates
    // plot array used in function plotPlotData as this.plotArrays['plot'][pIndex]
    plot : [],

    // DEFINE plotFlag array so don't have to generate entire plot
    // everytime want to just change data and not axes, etc.
    // for example, for 4 plots on page, this ran in 60% of time for full refresh
    // plotFlag array used in function plotPlotData as this.plotArrays['plotFlag'][pIndex]
    //
    plotFlag : [], // tells whether or not to update only curves or complete plot

    initialize : function() {
      // called by controller.openThisLab()
      // uses length of plotInfo so must be called after plotInfo has been initialized
      let npl = Object.keys(plotInfo).length; // number of plots
      this.plotFlag = [0];
      for (p = 1; p < npl; p += 1) {
        this.plotFlag.push(0);
      }
    } // END of method initialize()

  }, // END of plotArrays (child object of parent object plotter)

  // --------- DEFINE METHODS ---------------

  // ------ START OF NEW FOR LAB TYPE SINGLE - UNDER CONSTRUCTION -----

  getPlotData : function(plotIndex) {
    //
    // input argument plotIndex refers to index of plot in object plotInfo
    // which is defined in file process_plot_info.js
    //
    // uses plotInfo object defined in process_plot_info.js

    let v; // used as index to select the variable
    let p; // used as index to select data point pair
    let n; // used as index
    let sf = 1; // scale factor used below and possibly modified
    let thisNumPts; // used a couple places below with array .length
    let dataName;
    let varNumbers = plotInfo[plotIndex]['var'];
    let numVar = varNumbers.length;

    let xVar; // used for plot type single
    let yVar; // used for plot type single
    // not sure why this IF did not seem to work...
    // needed to get separately in two places below...
    // if (plotInfo[plotIndex]['type'] == 'single') {
      // let xVar = simParams.xVar;
      // let yVar = simParams.yVar;
    // }

    // initialize plotData array, which will be loaded with variable values below
    // this does full initialization for all points for all variables
    // WARNING: you must do full initialization for plots which involve more
    //          than one variable per unit but do it here for all plots
    let plotData = []; // this function will fill and return plotData
    let plotType = plotInfo[plotIndex]['type']; // profile or strip
    dataName = plotType + 'Data';
    if ((plotType == 'profile') || (plotType == 'strip') || (plotType == 'single')) {
      v = 0;
      n = varNumbers[v];
      varUnitIndex = plotInfo[plotIndex]['varUnitIndex'][v];
      thisNumPts = processUnits[varUnitIndex][dataName][n].length;
      plotData = this.initPlotData(numVar, thisNumPts-1); // note thisNumPts-1
    } else {
      alert('in getPlotData, unknown plot type');
    }

    // get data for plot and load into plotData array
    for (v = 0; v < numVar; v += 1) {

      // get unit index and array name for this variable
      varUnitIndex = plotInfo[plotIndex]['varUnitIndex'][v];
      // get number n of variable listed in unit's data array
      n = varNumbers[v];
      // copy variable in array from unit
      // need to do this separately for each variable because they
      // may be from different units

      sf = plotInfo[plotIndex]['varYscaleFactor'][v];
      if (sf != 1) {
        // WARNING - with sf != 1 you want to modify values but not original
        // values and so need an independent copy with copy by value
        // you can't make independent copy simply using the next line
        //    NO >> plotData[v] = processUnits[varUnitIndex]['stripData'][n];
        // this just references plotData to orig data and any changes in
        // plotData, e.g., scaling a var, will change orig data, and that
        // change will be present the next time the scale is applied, etc.
        // so have to copy data arrays element by element to get independent copy
        if (plotInfo[plotIndex]['type'] == 'profile') {
          // requires units' local array name to be profileData
          // get actual length of profileData - may change in labs which add
          // x,y plot pairs as generated at irregular times and locations
          thisNumPts = processUnits[varUnitIndex]['profileData'][n].length;
            for (p = 0; p < thisNumPts; p += 1) {
            plotData[v][p][0] = processUnits[varUnitIndex]['profileData'][n][p][0];
            plotData[v][p][1] = processUnits[varUnitIndex]['profileData'][n][p][1];
          }
        } else if (plotInfo[plotIndex]['type'] == 'strip') {
          // requires units' local array name to be stripData
          // xxx for (p = 0; p <= numPlotPoints; p += 1) { // NOTE = AT p <=
          thisNumPts = processUnits[varUnitIndex]['stripData'][n].length;
          for (p = 0; p < thisNumPts; p += 1) {
            plotData[v][p][0] = processUnits[varUnitIndex]['stripData'][n][p][0];
            plotData[v][p][1] = processUnits[varUnitIndex]['stripData'][n][p][1];
          }
        } else if (plotInfo[plotIndex]['type'] == 'single') {
          // SPECIAL FOR PLOT TYPE SINGLE
          // v in this FOR should only be 0
          xVar = simParams.xVar;
          yVar = simParams.yVar;
          dataName = 'singleData';
          thisNumPts = processUnits[varUnitIndex][dataName][n].length;
          for (p = 0; p < thisNumPts; p += 1) {
            plotData[v][p][0] = processUnits[varUnitIndex][dataName][xVar][p][0];
            plotData[v][p][1] = processUnits[varUnitIndex][dataName][yVar][p][1];
          }
        } else {
          alert('in getPlotData, unknown plot type');
        }
      } else {
        // scale factor sf = 1 so won't be changing original data
        // and so can copy by reference (rather than by value when sf != 1)
        // XXX check to see if this is any faster than copy all by value...
        if (plotInfo[plotIndex]['type'] == 'profile') {
          plotData[v] = processUnits[varUnitIndex]['profileData'][n];
        } else if (plotInfo[plotIndex]['type'] == 'strip') {
          plotData[v] = processUnits[varUnitIndex]['stripData'][n];
        } else if (plotInfo[plotIndex]['type'] == 'single') {
          // SPECIAL FOR PLOT TYPE SINGLE
          // v in this FOR should only be 0
          // EVEN WITH sf = 1 HAVE TO COPY x and y by value since separate vars
          xVar = simParams.xVar;
          yVar = simParams.yVar;
          dataName = 'singleData';
          thisNumPts = processUnits[varUnitIndex][dataName][n].length;
          for (p = 0; p < thisNumPts; p += 1) {
            plotData[v][p][0] = processUnits[varUnitIndex][dataName][xVar][p][0];
            plotData[v][p][1] = processUnits[varUnitIndex][dataName][yVar][p][0];
          }
        } else {
          alert('in getPlotData, unknown plot type');
        }
      }

    } // END OF for (v = 0; v < numVar; v += 1)

    // scale y-axis values if scale factor not equal to 1
    for (v = 0; v < numVar; v += 1) {
      sf = plotInfo[plotIndex]['varYscaleFactor'][v];
      thisNumPts = plotData[v].length;
      if (sf != 1) {
        for (p = 0; p < thisNumPts; p += 1) {
          plotData[v][p][1] = sf * plotData[v][p][1];
        }
      }
    }

    return plotData;

  }, // END OF function getPlotData

  plotPlotData: function(pData,pIndex) {

    // PLOTTING WITH THE FLOT LIBRARY - THIS plotPlotData OBJECT AND
    // ITS METHODS DEPEND ON JQUERY.JS AND JQUERY.FLOT.JS FOR PLOTTING

    // SEE WEB SITE OF flot.js
    //     http://www.flotcharts.org/
    // SEE DOCUMENTATION FOR flot.js
    //     https://github.com/flot/flot/blob/master/API.md
    // axisLabels REQUIRES LIBRARY flot.axislabels.js, SEE
    //     https://github.com/markrcote/flot-axislabels

    // input pData holds the data to plot
    // input pIndex is index of plot in plotInfo

    // get info about the variables

    let plotList = plotInfo[pIndex]['var'];
    // plotList is array whose elements are the values of the
    // first index in pData array which holds the x,y values to plot

    let k = 0; // used as index in plotList
    let v = 0; // value of element k in plotList
    let vLabel = []; // array to hold variable names for plot legend
    let yAxis = []; // array to hold y-axis, "left" or "right"
    let vShow = []; // array to hold "show", "tabled", or empty or other, e.g., "hide"
    plotList.forEach(fGetAxisData);
    function fGetAxisData(v,k) {
  	  // v = value of element k of plotList array
      // k is index of plotList array
      yAxis[k] = plotInfo[pIndex]['varYaxis'][k];
      vShow[k] = plotInfo[pIndex]['varShow'][k];
      vLabel[k] = plotInfo[pIndex]['varLabel'][k];
    }

    // put data in form needed by flot.js

    // NOTE: plotInfo object for lab has varShow option for each variable listed
    // COMMENT FROM process_plot_info.js
    //    varShow values are 'show' to show on plot and legend,
    //    'tabled' to not show on plot nor legend but list in copy data table
    //    and any other value, e.g., 'hide' to not show on plot but do show in legend
    //    varShow value can be changed by javascript if want to show/hide curve with checkbox
    //    e.g., plotInfo[pnum]['varShow'][vnum] = 'show';
    // interfacer.copyData tabulates all variables in plotInfo regardless of the varShow value

    let plotCanvasHtmlID = plotInfo[pIndex]['canvas'];

    let dataToPlot = [];
    let numVar = plotList.length;
    let numToShow = 0; // index for variables to show on plot
    // KEEP numToShow as well as for index k because not all k vars will show!
    // only variables with property "show" will appear on plot
    for (k = 0; k < numVar; k += 1) {
      // add object for each plot variable to array dataToPlot
      // e.g., { data: y1Data, label: y1DataLabel, yaxis: 1 }
      let newobj = {};
      if (vShow[k] === 'show') {
        //
        // NOTE: THIS CHECK OF "SHOW" COULD BE MOVED UP INTO
        // getPlotData FUNCTION WHERE DATA SELECTED TO PLOT
        // SINCE BOTH FUNCTIONS ARE CALLED EACH PLOT UPDATE
        // AS LONG AS YOU DO NOT ALSO USE getPlotData IN copyData methods, which
        // is not good idea anyway since create duplicate array there not needed
        // pData is not full profileData nor full stripData
        // pData has the variables specified in plotInfo[pIndex]['var']
        // now want to select the vars in pData with "show" property true
        // *BUT* see "else" condition below
        newobj.data = pData[k];
        newobj.label = vLabel[k];
        if (yAxis[k] === 'right') {newobj.yaxis = 1;} else {newobj.yaxis = 2;}
        dataToPlot[k] = newobj;
      } else if (vShow[k] == 'tabled') {
        // do not plot this variable and do not add to legend
      } else {
        // do not plot this variable
        // *BUT* need to add one point in case no vars on this axis to show
        // in which case no axis labels will show without this point
        newobj.data = [plotInfo[pIndex]['xAxisMax'],plotInfo[pIndex]['yLeftAxisMax']];
        newobj.label = vLabel[k];
        if (yAxis[k] === 'right') {newobj.yaxis = 1;} else {newobj.yaxis = 2;}
        dataToPlot[k] = newobj;
      }
    } // END OF for (k = 0; k < numVar; k += 1) {

    // set up the plot axis labels and plot legend

    let xShow = plotInfo[pIndex]['xAxisShow'];
    let xLabel = plotInfo[pIndex]['xAxisLabel'];
    let xMin= plotInfo[pIndex]['xAxisMin'];
    let xMax = plotInfo[pIndex]['xAxisMax'];
    let yLeftLabel = plotInfo[pIndex]['yLeftAxisLabel'];
    let yLeftMin = plotInfo[pIndex]['yLeftAxisMin'];
    let yLeftMax = plotInfo[pIndex]['yLeftAxisMax'];
    let yRightLabel = plotInfo[pIndex]['yRightAxisLabel'];
    let yRightMin = plotInfo[pIndex]['yRightAxisMin'];
    let yRightMax = plotInfo[pIndex]['yRightAxisMax'];
    let plotLegendPosition = plotInfo[pIndex]['plotLegendPosition'];
    let plotLegendShow = plotInfo[pIndex]['plotLegendShow']; // Boolean 0,1
    let plotGridBgColor = plotInfo[pIndex]['plotGridBgColor'];
    let plotDataSeriesColors = plotInfo[pIndex]['plotDataSeriesColors'];
    // check if want lines and/or points shown
    // default is lines only
    let plotDataPoints = false;
    let plotDataLines = true;
    if (typeof plotInfo[pIndex]['plotDataPoints'] == 'undefined') {
      plotDataPoints = false; // default is false
    } else {
      plotDataPoints = plotInfo[pIndex]['plotDataPoints'];
    }
    if (typeof plotInfo[pIndex]['plotDataLines'] == 'undefined') {
      plotDataLines = true; // default is true
    } else {
      plotDataLines = plotInfo[pIndex]['plotDataLines'];
    }

    let options = {
      // axisLabels REQUIRES LIBRARY flot.axislabels.js, SEE
      //     https://github.com/markrcote/flot-axislabels
      axisLabels : {show: true},
      xaxes: [ { show: xShow, min: xMin, max: xMax, axisLabel: xLabel } ],
      yaxes: [
      // yaxis object listed first is "yaxis: 1" in dataToPlot, second is 2
        {position: 'right', min: yRightMin, max: yRightMax, axisLabel: yRightLabel },
        {position: 'left', min: yLeftMin, max: yLeftMax, axisLabel: yLeftLabel },
      ],
      legend: { show: plotLegendShow, position: plotLegendPosition },
      grid: { backgroundColor: plotGridBgColor },
      series: {
        lines: { show: plotDataLines },
        points: { show: plotDataPoints, radius: 2 }
      },
      colors: plotDataSeriesColors
    };

    // check if want to reverse data left-right on x-axis
    // when reversed, xmax is on left, xmin on right
    if (plotInfo[pIndex]['xAxisReversed']) {
      options.xaxis = {
        transform: function (v) { return -v; },
        inverseTransform: function (v) { return -v; }
      };
    }

    // only draw plot with axes and all options the first time
    // after that just setData and re-draw
    //
    // this.plotArrays['plot'] array saves data for each plot between display updates
    // this.plotArrays['plotFlag'] array tells whether or not to redraw axes & labels
    //
    // for example, for 4 plots on page, this ran in 60% of time for full refresh
    // see plotter.plotArrays.initialize() for intialization of plot and plotFlag arrays

    if (this.plotArrays['plotFlag'][pIndex] == 0) {
      this.plotArrays['plotFlag'][pIndex] = 1;
      this.plotArrays['plot'][pIndex] = $.plot($(plotCanvasHtmlID), dataToPlot, options);
    } else {
      this.plotArrays['plot'][pIndex].setData(dataToPlot);
      this.plotArrays['plot'][pIndex].draw();
    }

  }, // END OF function plotPlotData

  initPlotData : function(numVars,numPlotPoints) {
    // returns 3D array to hold x,y scatter plot data for multiple variables
    // inputs are list of variables and # of x,y point pairs per variable
    // numPlotPoints + 1 elements are generated for plot origin pt
    // returns array with all elements for plot filled with zero
    //    index 1 specifies the variable [0 to numVars-1],
    //    index 2 specifies the data point pair [0 to & including numPlotPoints]
    //    index 3 specifies x or y in x,y data point pair [0 & 1]
    //
    let v;
    let p;
    let plotDataStub = [];
    for (v = 0; v < numVars; v += 1) {
      plotDataStub[v] = [];
      for (p = 0; p <= numPlotPoints; p += 1) { // NOTE = AT p <=
        plotDataStub[v][p] = [];
        plotDataStub[v][p][0] = 0;
        plotDataStub[v][p][1] = 0;
      }
    }
    return plotDataStub;
    // Note above initialize values for
    //    plotDataStub [0 to numVars-1] [0 to numPlotPoints] [0 & 1]
    // If want later outside this constructor to add new elements,
    // then you can do easily for 3rd index, e.g.,
    //    plotDataStub [v] [p] [2] = 0;
    // But can NOT do assignment for [v] [p+1] [0] since p+1 element does not yet
    // exist, where here p = numPlotPoints+1.
    // Would have to first create new p+1 array
    //    plotDataStub [v] [p+1] = [];
    // Then can do
    //    plotDataStub [v] [p+1] [0] = 0;
    //    plotDataStub [v] [p+1] [1] = 0; // etc.
  }, // END function initPlotData

  // *** FUNCTIONS BELOW ARE INDEPENDENT OF FLOT.JS AND OTHER LIBRARIES ***

  plotColorCanvasPlot : function(pIndex) {
    // FOR PLOT AND REPLOT OF ENTIRE CANVAS
    // USE plotColorCanvasPixelList for plot and replot of specified pixels
    // generates color plot on html canvas element
    // USES OBJECT plotInfo
    // input argument pIndex refers to plot info in child pIndex
    // of object plotInfo
    // USES function jetColorMap()
    // use this to plot space-time plots as well as other color canvas plots
    // see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial

    let canvasID = plotInfo[pIndex]['canvas'];
    let canvas = document.getElementById(canvasID);
    let context = canvas.getContext('2d');

    // copy data from unit local array colorCanvasData to local array colorCanvasData
    let varUnitIndex = plotInfo[pIndex]['varUnitIndex'];
    // v is the index number of the one variable to plot on the canvas
    // where 0 is first, 1 is second, etc.
    let v = plotInfo[pIndex]['var'];

    // next line REQUIRES unit object array to be named colorCanvasData
    let colorCanvasData = processUnits[varUnitIndex]['colorCanvasData'][v];

    let t;
    let s;
    let r;
    let g;
    let b;
    let jet;
    let x;
    let y;
    // below we have to convert computed color values
    // to text string for fillStyle below, so get pieces ready
    let tColor1 = 'rgb(';
    let tColor2;
    let tColor3;
    let tColor4;
    let tColor5 = ')';
    let tPixels = canvas.width; // canvas width, height set in HTML canvas element
    let sPixels = canvas.height;
    let numTimePts = plotInfo[pIndex]['varTimePts'];
    let numSpacePts = plotInfo[pIndex]['varSpacePts'];
    let tPixelsPerPoint = tPixels/(numTimePts+1); // pixels per point, note +1
    let sPixelsPerPoint = sPixels/numSpacePts; // pixels per point
    // remember these pixels are HTML pixels, not screen pixels
    // do not round these values - if round you will not fill canvas completely
    let minVarVal = plotInfo[pIndex]['varValueMin'];
    let maxVarVal = plotInfo[pIndex]['varValueMax'];
    let scaledVarVal; // holds variable value scaled 0-1 by minVarVal & maxVarVal

    for (t = 0; t <= numTimePts; t += 1) { // NOTE = at t <=
      for (s = 0; s < numSpacePts; s += 1) {
        scaledVarVal = (colorCanvasData[t][s] - minVarVal) / (maxVarVal - minVarVal);
        jet = this.jetColorMap(scaledVarVal); // scaledVarVal should be scaled 0 to 1
        r = jet[0];
        g = jet[1];
        b = jet[2];
        // we have to convert computed color values to string for fillStyle
        tColor2 = r.toString();
        tColor3 = g.toString();
        tColor4 = b.toString();
        tColor = tColor1.concat(tColor2,',',tColor3,',',tColor4,tColor5);
        context.fillStyle = tColor;
        if (plotInfo[pIndex]['xAxisReversed']) {
          // swap directions in plot from that in colorCanvasData array
          x = tPixelsPerPoint * (numTimePts - t);
        } else {
          x = tPixelsPerPoint * t;
        }
        y = sPixelsPerPoint * s;
        // draw colored rectangle on canvas to represent this data point
        context.fillRect(x,y,tPixelsPerPoint,sPixelsPerPoint);
      } // end of inner FOR repeat
    } // end of outer FOR repeat

  }, // END of function plotColorCanvasPlot

  jetColorMap : function(n) {
    // input n should be value between 0 and 1
    // rgb output array values will be 0-255 to match MATLAB's jet colormap
    //
    // ANOTHER WAY would be a look up table - would that be faster?
    //
    let r;
    let g;
    let b;
    if (n<0) {n = 0;}
    if (n>1) {n = 1;}
    // would not need to round input to integers with IF statements
    // EXCEPT if don't round then can get rgb values > 1.0 at end of IF
    // so would then need to add more IF statements to check - SO ROUND NOW
    let n64 = Math.round(1 + 63*n); // n64 = 1 when n = 0; n64 = 64 when n = 1
    if (n64 >= 1 && n64 < 9) {
      r = 0;
      g = 0;
      b = (n64-1)/7*0.4375 + 0.5625;
    } else if (n64 >= 9 && n64 < 25) {
      r = 0;
      g = (n64-9)/15*0.9375 + 0.0625;
      b = 1;
    } else if (n64 >= 25 && n64 < 41) {
      r = (n64-25)/15*0.9375 + 0.0625;
      g = 1;
      b = -(n64-25)/15*0.9375 + 0.9375;
    } else if (n64 >= 41 && n64 < 57) {
      r = 1;
      g = -(n64-41)/15*0.9375 + 0.9375;
      b = 0;
    } else if (n64 >= 57 && n64 <= 64) {
      r = -(n64-57)/7*0.4375 + 0.9375;
      g = 0;
      b = 0;
    } else {
      // out of bounds - give output for zero input
      r = 0;
      g = 0;
      b = 0.5625;
    } // end of IF structure
    // but we must round output to integers after converting to 0-255
    r = Math.round(r*255);
    g = Math.round(g*255);
    b = Math.round(b*255);
    return [r,g,b];
  }, // END of function jetColorMap

  initColorCanvasArray : function(numVars,numXpts,numYpts) {
    // used by units to initialize local data arrays
    // returns 3D array to hold data for multiple variables for COLOR CANVAS
    // plots, e.g., space-time plots
    // returns array with all elements for plot filled with zero
    //    index 1 specifies the variable [0 to numVars-1]
    //    index 2 specifies the x-axis (time) point [0 to & INCLUDING numXpts]
    //    index 3 specifies the y-axis (space) point [0 to numYpts-1]
    //    the element value at plotDataStub[v][x][y] will be the value
    //      to be shown for that variable at that x,y location
    let v;
    let x;
    let y;
    let plotDataStub = [];
    for (v = 0; v < numVars; v += 1) {
      plotDataStub[v] = [];
        for (x = 0; x <= numXpts; x += 1) { // NOTE = AT <=
        plotDataStub[v][x] = [];
        for (y = 0; y < numYpts; y += 1) {
          plotDataStub[v][x][y] = 0;
        }
      }
    }
    return plotDataStub;
  }, // END of function initColorCanvasArray

  plotColorCanvasPixelList : function(pIndex,xLocArray,yLocArray,small) {
    // FOR REPLOT OF LIMITED NUMBER OF PIXELS ON CANVAS
    // USE plotColorCanvasPlot for plot and replot of entire canvas
    // input argument pIndex refers to plot info in child pIndex
    //   of object plotInfo
    // input arguments xLocArray & yLocArray contain x,y and old x,y locations
    //   needing replot and must be 1-element arrays if only 1 value, not scalar
    // input argument small with value 1 (true) fills with 1 pixel smaller than
    //   original on all sides (requires orig pixels to be at least 3x3)
    //   because was getting ghosting of dark pixels in ant swarm project
    // SEE "if (colorCanvasData[t][s] < 0)" for pixels marked negative
    //    as used in ant swarm project
    // USES OBJECT plotInfo and PROCESS UNIT's colorCanvasData array
    // USES function jetColorMap()
    // use this to plot space-time plots as well as other color canvas plots
    // see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial

    let canvasID = plotInfo[pIndex]['canvas'];
    let canvas = document.getElementById(canvasID);
    let context = canvas.getContext('2d');

    // copy data from unit local array colorCanvasData to local array colorCanvasData
    let varUnitIndex = plotInfo[pIndex]['varUnitIndex'];
    // v is the index number of the one variable to plot on the canvas
    // where 0 is first, 1 is second, etc.
    let v = plotInfo[pIndex]['var'];

    // next line REQUIRES unit object array to be named colorCanvasData
    let colorCanvasData = processUnits[varUnitIndex]['colorCanvasData'][v];

    let t;
    let s;
    let r;
    let g;
    let b;
    let jet;
    let x;
    let y;
    // below we have to convert computed color values
    // to text string for fillStyle below, so get pieces ready
    let tColor1 = 'rgb(';
    let tColor2;
    let tColor3;
    let tColor4;
    let tColor5 = ')';
    let tPixels = canvas.width; // canvas width, height set in HTML canvas element
    let sPixels = canvas.height;
    let numTimePts = plotInfo[pIndex]['varTimePts'];
    let numSpacePts = plotInfo[pIndex]['varSpacePts'];
    let tPixelsPerPoint = tPixels/(numTimePts+1); // pixels per point, note +1
    let sPixelsPerPoint = sPixels/numSpacePts; // pixels per
    // remember these pixels are HTML pixels, not screen pixels
    // do not round these values - if round you will not fill canvas completely
    let minVarVal = plotInfo[pIndex]['varValueMin'];
    let maxVarVal = plotInfo[pIndex]['varValueMax'];
    let scaledVarVal; // holds variable value scaled 0-1 by minVarVal & maxVarVal

    // repeat through all old and new x,y locations
    for (i=0; i < xLocArray.length; i +=1) {
      t = xLocArray[i];
      s = yLocArray[i];

      if (colorCanvasData[t][s] < 0) {
        // old location with orig value but marked as negative for replot
        // so do not plot with "small" pixel below
        scaledVarVal = ( - colorCanvasData[t][s] - minVarVal) / (maxVarVal - minVarVal);
      } else {
        // new location
        scaledVarVal = (colorCanvasData[t][s] - minVarVal) / (maxVarVal - minVarVal);
      }

      jet = this.jetColorMap(scaledVarVal); // scaledVarVal should be scaled 0 to 1
      r = jet[0];
      g = jet[1];
      b = jet[2];
      // we have to convert computed color values to string for fillStyle
      tColor2 = r.toString();
      tColor3 = g.toString();
      tColor4 = b.toString();
      tColor = tColor1.concat(tColor2,',',tColor3,',',tColor4,tColor5);
      context.fillStyle = tColor;
      if (plotInfo[pIndex]['xAxisReversed']) {
        // swap directions in plot from that in colorCanvasData array
        x = tPixelsPerPoint * (numTimePts - t);
      } else {
        x = tPixelsPerPoint * t;
      }
      y = sPixelsPerPoint * s;

      if (colorCanvasData[t][s] >= 0) {
        // not marked negative for replot of original canvas data
        // so check if want to fill this rect one pixel smaller on each side to
        // reduce ghosting in ant swarm project when over write old marked point
        if ((small == 1) && (tPixelsPerPoint >= 3) && (sPixelsPerPoint >= 3)) {
          // PixelsPerPoint must be >= 3 for this to work
          context.fillRect(x+1,y+1,tPixelsPerPoint-2,sPixelsPerPoint-2);
        } else {
          context.fillRect(x,y,tPixelsPerPoint,sPixelsPerPoint);
        }
      } else {
        // marked negative so do replot of original data in old marked location
        context.fillRect(x,y,tPixelsPerPoint,sPixelsPerPoint);
      }

    } // END for (i=0; i < xLocArray.length; i +=1)

  }, // END of function plotColorCanvasPixelList

}; // END of object plotter
