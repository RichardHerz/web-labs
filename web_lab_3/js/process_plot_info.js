  /*
    Design, text, images and code by Richard K. Herz, 2017-2018
    Copyrights held by Richard K. Herz
    Licensed for use under the GNU General Public License v3.0
    https://www.gnu.org/licenses/gpl-3.0.en.html
  */

  // WARNING: number plot points here should match number plot points in
  //          unit that generates the plot data
  // where number plot points + 1 for origin are plotted

  // THIS FILE USED FOR DEFINITION OF PROFILE, STRIP CHART & COLOR CANVAS PLOTS

  // COMMON VALUES FOR PROFILE PLOTS (static x,y plots)
  // these vars used several places below in this file
  var numProfileVars = 0;
  var numProfilePts = 0;

  // COMMON VALUES FOR STRIP CHART PLOTS (scrolling x,y plots)
  // these vars used several places below in this file
  var numStripVars = 4; // plotting 3 but 4th (jacket T) is saved for copy button
  var numStripPts = 100;

  // COMMON VALUES FOR SPACE-TIME, COLOR-CANVAS PLOTS
  // if want square canvas 'pixels' set time/space pt ratio = canvas width/height ratio
  // these vars used several places below in this file
  var numSpaceTimeVars = 0;
  var numTimePts = 0;
  var numSpacePts = 0; // 0 for one, number is numSpacePts + 1

  // WE CURRENTLY USE FLOT.JS FOR PLOTTING PROFILE & STRIP PLOTS
  // some options below such as plotDataSeriesColors are optional for flot.js
  // and flot.js will use default values for those options

  // DECLARE PARENT OBJECT TO HOLD PLOT INFO
  // the object properties are used by plotting functions
  // in file process_plotter.js
  // more than one plot can be put one one web page by
  // defining multiple object children, where the first index
  // plotsObj[0] is the plot number index (starting at 0)
  //
  var plotsObj = new Object();
    //
    // USE THIS TO GET NUMBER OF plots, i.e., top-level children of plotsObj
    //    Object.keys(plotsObj).length;
    // except this will include any additional top level children
    //
    // WARNING: some of these object properties may be changed during
    //          operation of the program, e.g., show, scale

    // plot 0 info
  plotsObj[0] = new Object();
  plotsObj[0]['type'] = 'strip';
  plotsObj[0]['title'] = 'Reactor Conditions'; // displayed in copyData() table
  plotsObj[0]['canvas'] = '#div_PLOTDIV_plotData';
  plotsObj[0]['numberPoints'] = numStripPts;
  // plot has numberPoints + 1 pts!
  plotsObj[0]['xAxisLabel'] = '< recent time | earlier time (s) >';
  plotsObj[0]['xAxisTableLabel'] = 'Time'; // label for copy data table
  // xAxisShow false does not show numbers, nor label, nor grid for x-axis
  // might be better to cover numbers if desire not to show numbers
  plotsObj[0]['xAxisShow'] = 1; // 0 false, 1 true
  plotsObj[0]['xAxisMin'] = 0;
  plotsObj[0]['xAxisMax'] = numStripPts * simParams.simTimeStep * simParams.simStepRepeats;
  plotsObj[0]['xAxisReversed'] = 1; // 0 false, 1 true, when true, xmax on left
  plotsObj[0]['yLeftAxisLabel'] = 'Reactant Concentration';
  plotsObj[0]['yLeftAxisMin'] = 0;
  plotsObj[0]['yLeftAxisMax'] = 400;
  plotsObj[0]['yRightAxisLabel'] = 'Temperature (K)';
  plotsObj[0]['yRightAxisMin'] = 300;
  plotsObj[0]['yRightAxisMax'] = 400;
  plotsObj[0]['plotLegendPosition'] = "ne";
  plotsObj[0]['plotLegendShow'] = 1;  // Boolean, '' or 0 for no show, 1 or "show"
  plotsObj[0]['plotGridBgColor'] = 'white';
  // colors can be specified rgb, rgba, hex, and color names
  // for flot.js colors, only basic color names appear to work, e.g., white, blue, red
  // for all html color names to hex see http://www.color-hex.com
  // for all color names to hex see https://www.w3schools.com/colors/colors_picker.asp
  plotsObj[0]['plotDataSeriesColors'] = ['blue','red','#919191']; // optional, in variable order 0, 1, etc.
  // ['#1e90ff','#ff6347','#919191'] is DodgerBlue, Tomato, Tin (metal Tin)
  plotsObj[0]['var'] = new Array();
    // VALUES are data array var # to be put on plot & legend + those only in data table
    // these values may not start at 0, e.g., one plot has 0,1, another has 2,3
    plotsObj[0]['var'][0] = 0;
    plotsObj[0]['var'][1] = 1;
    plotsObj[0]['var'][2] = 2;
    plotsObj[0]['var'][3] = 3;
  plotsObj[0]['varLabel'] = new Array();
    // list labels in 'varLabel' in order of corresonding 'var' VALUES above
    plotsObj[0]['varLabel'][0] = 'Reactant conc.'; // 1st var
    plotsObj[0]['varLabel'][1] = 'Reactor T';
    plotsObj[0]['varLabel'][2] = 'Jacket inlet T';
    plotsObj[0]['varLabel'][3] = 'Jacket T';
  plotsObj[0]['varShow'] = new Array();
  // values are 'show' to show on plot and legend,
  // 'tabled' to not show on plot nor legend but list in copy data table
  // and any other value, e.g., 'hide' to not show on plot but do show in legend
  // value can be changed by javascript if want to show/hide curve with checkbox
    plotsObj[0]['varShow'][0] = 'show'; // 1st var
    plotsObj[0]['varShow'][1] = 'show';
    plotsObj[0]['varShow'][2] = 'show';
    // jacket T isn't being plotted but will be added to table by copy data button
    plotsObj[0]['varShow'][3] = 'tabled';
  plotsObj[0]['varYaxis'] = new Array();
    plotsObj[0]['varYaxis'][0] = 'left'; // 1st var
    plotsObj[0]['varYaxis'][1] = 'right';
    plotsObj[0]['varYaxis'][2] = 'right';
  plotsObj[0]['varYscaleFactor'] = new Array();
    plotsObj[0]['varYscaleFactor'][0] = 1; // 1st var
    plotsObj[0]['varYscaleFactor'][1] = 1;
    plotsObj[0]['varYscaleFactor'][2] = 1;
  // ALTERNATIVE to separate arrays for variable number, show, axis
  //    might be to have one array per variable equal to an array of info...?
  //

  // DEFINE plotFlag ARRAY so don't have to generate entire
  // profile or strip plot everytime want to just change data and not axes, etc.
  // for example, for 4 plots on page, this ran in 60% of time for full refresh
  // plotFlag array used in function plotPlotData
  //
  // WARNING: plotFlag ARRAY MUST BE DEFINED AFTER ALL plotsObj CHILDREN
  //
  var npl = Object.keys(plotsObj).length; // number of plots
  var p; // used as index
  var plotFlag = [0];
  for (p = 1; p < npl; p += 1) {
    plotFlag.push(0);
  }

  function initPlotData(numVars,numPlotPoints) {
    // returns 3D array to hold x,y scatter plot data for multiple variables
    // inputs are list of variables and # of x,y point pairs per variable
    // returns array with all elements for plot filled with zero
    //    index 1 specifies the variable [0 to numVars-1],
    //    index 2 specifies the data point pair [0 to & including numPlotPoints]
    //    index 3 specifies x or y in x,y data point pair [0 & 1]
    var v;
    var p;
    var plotDataStub = new Array();
    for (v = 0; v < numVars; v += 1) {
      plotDataStub[v] = new Array();
      for (p = 0; p <= numPlotPoints; p += 1) { // NOTE = AT p <=
        plotDataStub[v][p] = new Array();
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
    //    plotDataStub [v] [p+1] = new Array();
    // Then can do
    //    plotDataStub [v] [p+1] [0] = 0;
    //    plotDataStub [v] [p+1] [1] = 0; // etc.
  } // end function initPlotData

  function initSpaceTimeArray(numVars,numTimePts,numSpacePts) {
    // returns 3D array to hold data for multiple variables for SPACE-TIME plots
    // returns array with all elements for plot filled with zero
    //    index 1 specifies the variable [0 to numVars-1]
    //    index 2 specifies the time point [0 to & including numTimePoints]
    //    index 3 specifies the space point [0 to & including numSpacePoints]
    //    the element value at plotDataStub[v][t][s] will be the conc or rate
    //      to be shown for that variable at that time at that space location
    var v;
    var s;
    var t;
    var plotDataStub = new Array();
    for (v = 0; v < numVars; v += 1) {
      plotDataStub[v] = new Array();
        for (t = 0; t <= numTimePts; t += 1) { // NOTE = AT t <=
        plotDataStub[v][t] = new Array();
        for (s = 0; s <= numSpacePts; s += 1) { // NOTE = AT s <=
          plotDataStub[v][t][s] = 0;
        }
      }
    }
    // document.getElementById("dev01").innerHTML = "hello";
    return plotDataStub;
  } // end function initSpaceTimeArray

  // initialize profile data array - must follow function initPlotData in this file
  var profileData = initPlotData(numProfileVars,numProfilePts); // holds data for static profile plots

  // initialize strip chart data array
  var stripData = initPlotData(numStripVars,numStripPts); // holds data for scrolling strip chart plots

  // initialize space-time, color-canvas data array -
  // must follow function initSpaceTimeArray in this file
  var spaceTimeData = initSpaceTimeArray(numSpaceTimeVars,numTimePts,numSpacePts);
