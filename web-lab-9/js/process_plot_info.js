/*
  Design, text, images and code by Richard K. Herz, 2017-2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// THIS FILE USED FOR DEFINITION OF PLOTS: PROFILE, STRIP CHART, & COLOR CANVAS

// WARNING: in units, local data array names for plotting must be
//          'profileData' for ['type'] = 'profile'
//          'stripData' for ['type'] = 'strip'
//          'colorCanvasData' for ['type'] = 'canvas'

// WE CURRENTLY USE FLOT.JS FOR PLOTTING PROFILE & STRIP PLOTS
// some options below such as plotDataSeriesColors are optional for flot.js
// and flot.js will use default values for those options

// ------- DECLARE PARENT OBJECT TO HOLD PLOT INFO --------

// the object properties are used by plotting functions
// in file process_plotter.js
// more than one plot can be put one one web page by
// defining multiple object children, where the first index
// plotsObj[0] is the plot number index (starting at 0)
//
// method initialize() below places the plot definitions into plotsObj
//
var plotsObj = {

  // after the openThisLab() function in _main.js calls method initialize()
  // here, this object will contain a child object for each plot
  //
  // method initialize() is run after each process units initialize() method
  // is run by openThisLab() so that it can use values from the units,
  // e.g., processUnits[unum]['dataMin'][1]; // [1] is TinCold
  //
  // in _main.js, the function updateDisplay() uses the length of plotsObj
  // after subtracting 1 for method initialize, in order to plot all the plots;
  // if you add another method, you need to update the length correction
  // in updateDisplay()

  initialize : function() {
    //
    // WARNING: some of these object properties may be changed during
    //          operation of the program, e.g., show, scale
    //
    // --------- below are plots for the reactor ----------------
    //
    let unum = 0; // useful when only one unit in plot, processUnits[unum]
    //
    // plot 0 info
    let pnum = 0;
    plotsObj[pnum] = new Object();
    plotsObj[pnum]['type'] = 'profile';
    plotsObj[pnum]['title'] = 'Reactor Profiles';
    plotsObj[pnum]['canvas'] = '#div_PLOTDIV_PFR_plot'; // flot.js wants ID with prefix #
    plotsObj[pnum]['numberPoints'] = processUnits[unum]['numNodes']; // should match numNodes in process unit
    // plot has numberPoints + 1 pts!
    plotsObj[pnum]['xAxisLabel'] = 'Position in Reactor';
    plotsObj[pnum]['xAxisTableLabel'] = 'Position'; // label for copy data table
    // xAxisShow false does not show numbers, nor label, nor grid for x-axis
    // might be better to cover numbers if desire not to show numbers
    plotsObj[pnum]['xAxisShow'] = 1; // 0 false, 1 true
    plotsObj[pnum]['xAxisMin'] = 0;
    plotsObj[pnum]['xAxisMax'] = 1;
    plotsObj[pnum]['xAxisReversed'] = 0; // 0 false, 1 true, when true, xmax on left
    plotsObj[pnum]['yLeftAxisLabel'] = 'Trxr (K)'; // or d'less (T - TinCold)/(TinHot - TinCold)
    plotsObj[pnum]['yLeftAxisMin'] = 320; // XXX processUnits[unum]['dataMin'][9]; // [9] is Trxr
    plotsObj[pnum]['yLeftAxisMax'] = 420; // XXX processUnits[unum]['dataMax'][9];
    plotsObj[pnum]['yRightAxisLabel'] = 'Ca (mol/m3)';
    plotsObj[pnum]['yRightAxisMin'] = 0;
    plotsObj[pnum]['yRightAxisMax'] = 550; // processUnits[unum]['Cain'];
    plotsObj[pnum]['plotLegendShow'] = 1;  // Boolean, '' or 0 for no show, 1 or "show"
    plotsObj[pnum]['plotLegendPosition'] = 'nw';
    plotsObj[pnum]['plotGridBgColor'] = 'white';
    // colors can be specified rgb, rgba, hex, and color names
    // for flot.js colors, only basic color names appear to work, e.g., white, blue, red
    // for all html color names to hex see http://www.color-hex.com
    // for all color names to hex see https://www.w3schools.com/colors/colors_picker.asp
    plotsObj[pnum]['plotDataSeriesColors'] = ['#ff6347','#1e90ff']; // optional, in variable order 0, 1, etc.
    // ['#ff6347','#1e90ff'] is Tomato and DodgerBlue
    //
    // SET UP ARRAYS TO HOLD INFO FOR EACH VARIABLE on plot and/or copy data table
    // WARNING: all below with prefix 'var' must have same number of child objects,
    // one for each variable placed on plot in _plotter.js
    plotsObj[pnum]['varUnitIndex'] = new Array();
    plotsObj[pnum]['var'] = new Array();
    plotsObj[pnum]['varLabel'] = new Array();
    plotsObj[pnum]['varDataUnits'] = new Array();
    plotsObj[pnum]['varShow'] = new Array();
    plotsObj[pnum]['varYaxis'] = new Array();
    plotsObj[pnum]['varYscaleFactor'] = new Array();
    //
    // ADD SETTINGS FOR EACH VARIABLE
    //
    let vnum = 0; // 1st variable
    plotsObj[pnum]['varUnitIndex'][0] = unum; // value is index of unit in processUnits object
    plotsObj[pnum]['var'][vnum] = 0; // value is variable index in plot data array
    plotsObj[pnum]['varLabel'][vnum] = 'Trxr';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotsObj[pnum]['varDataUnits'][vnum] = processUnits[unum]['dataUnits'][9]; // 1st var
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotsObj[pnum]['varShow'][vnum] = 'show';
    plotsObj[pnum]['varYaxis'][vnum] = 'left';
    plotsObj[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 1; // 2nd variable
    plotsObj[pnum]['varUnitIndex'][1] = unum;
    plotsObj[pnum]['var'][vnum] = 1;
    plotsObj[pnum]['varLabel'][vnum] = 'Ca';
    plotsObj[pnum]['varDataUnits'][vnum] = processUnits[unum]['dataUnits'][10];
    plotsObj[pnum]['varShow'][vnum] = 'show';
    plotsObj[pnum]['varYaxis'][vnum] = 'right';
    plotsObj[pnum]['varYscaleFactor'][vnum] = 1;
    //
    // plot 1 info
    pnum = 1;
    plotsObj[pnum] = new Object();
    plotsObj[pnum]['type'] = 'canvas';
    plotsObj[pnum]['title'] = 'reactor color canvas';
    plotsObj[pnum]['canvas'] = 'canvas_CANVAS_reactor'; // without prefix #
    // for canvas type, all data comes from one process unit and one local array
    plotsObj[pnum]['varUnitIndex'] = unum; // index of unit in processUnits object
    plotsObj[pnum]['var'] = 0; // variable number in array spaceTimeData, 0, 1, etc.
    // varTimePts & varSpacePts must match values used in unit array colorCanvasData
    plotsObj[pnum]['varTimePts'] = processUnits[unum]['numNodes'];
    plotsObj[pnum]['varSpacePts'] = 1;
    plotsObj[pnum]['varValueMin'] = 320; // processUnits[unum]['dataMin'][9]; // [9] is Trxr
    plotsObj[pnum]['varValueMax'] = 420; // processUnits[unum]['dataMax'][9];
    plotsObj[pnum]['xAxisReversed'] = 0; // 0 false, 1 true, when true, xmax on left
    //
    // --------- below are plots for the heat exchanger ----------------
    //
    unum = 1; // useful when only one unit in plot, processUnits[unum]
    //
    // plot 2 info
    pnum = 2;
    plotsObj[pnum] = new Object();
    plotsObj[pnum]['type'] = 'profile';
    plotsObj[pnum]['title'] = 'Heat Exchanger Temperature Profiles';
    plotsObj[pnum]['canvas'] = '#div_PLOTDIV_T_plot'; // flot.js wants ID with prefix #
    plotsObj[pnum]['numberPoints'] = processUnits[unum]['numNodes'];
    // plot has numberPoints + 1 pts!
    plotsObj[pnum]['xAxisLabel'] = 'Position in Heat Exchanger';
    plotsObj[pnum]['xAxisTableLabel'] = 'Position'; // label for copy data table
    // xAxisShow false does not show numbers, nor label, nor grid for x-axis
    // might be better to cover numbers if desire not to show numbers
    plotsObj[pnum]['xAxisShow'] = 1; // 0 false, 1 true
    plotsObj[pnum]['xAxisMin'] = 0;
    plotsObj[pnum]['xAxisMax'] = 1;
    plotsObj[pnum]['xAxisReversed'] = 1; // 0 false, 1 true, when true, xmax on left
    plotsObj[pnum]['yLeftAxisLabel'] = 'T (K)'; // or d'less (T - TinCold)/(TinHot - TinCold)
    plotsObj[pnum]['yLeftAxisMin'] = 320; // processUnits[unum]['dataMin'][1]; // [1] is TinCold
    plotsObj[pnum]['yLeftAxisMax'] = 450; // processUnits[unum]['dataMax'][0]; // [0] is TinHot
    plotsObj[pnum]['yRightAxisLabel'] = 'yRight';
    plotsObj[pnum]['yRightAxisMin'] = 0;
    plotsObj[pnum]['yRightAxisMax'] = 1;
    plotsObj[pnum]['plotLegendPosition'] = "nw";
    plotsObj[pnum]['plotLegendShow'] = 0;  // Boolean, '' or 0 for no show, 1 or "show"
    plotsObj[pnum]['plotGridBgColor'] = 'white';
    // colors can be specified rgb, rgba, hex, and color names
    // for flot.js colors, only basic color names appear to work, e.g., white, blue, red
    // for all html color names to hex see http://www.color-hex.com
    // for all color names to hex see https://www.w3schools.com/colors/colors_picker.asp
    plotsObj[pnum]['plotDataSeriesColors'] = ['#ff6347','#1e90ff']; // optional, in variable order 0, 1, etc.
    // ['#ff6347','#1e90ff'] is Tomato and DodgerBlue
    //
    // SET UP ARRAYS TO HOLD INFO FOR EACH VARIABLE on plot and/or copy data table
    // WARNING: all below with prefix 'var' must have same number of child objects,
    // one for each variable placed on plot in _plotter.js
    plotsObj[pnum]['varUnitIndex'] = new Array();
    plotsObj[pnum]['var'] = new Array();
    plotsObj[pnum]['varLabel'] = new Array();
    plotsObj[pnum]['varDataUnits'] = new Array();
    plotsObj[pnum]['varShow'] = new Array();
    plotsObj[pnum]['varYaxis'] = new Array();
    plotsObj[pnum]['varYscaleFactor'] = new Array();
    //
    // ADD SETTINGS FOR EACH VARIABLE
    //
    vnum = 0; // 1st variable
    plotsObj[pnum]['varUnitIndex'][vnum] = unum; // value is index of unit in processUnits object
    plotsObj[pnum]['var'][vnum] = 0; // value is variable index in plot data array
    // varlabel is used in plot legend
    plotsObj[pnum]['varLabel'][vnum] = 'Thot'; // 1st var
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotsObj[pnum]['varDataUnits'][vnum] = 'K';
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotsObj[pnum]['varShow'][vnum] = 'show'; // 1st var
    plotsObj[pnum]['varYaxis'][vnum] = 'left'; // 1st var
    plotsObj[pnum]['varYscaleFactor'][vnum] = 1; // 1st var
    //
    vnum = 1; // 2nd variable
    plotsObj[pnum]['varUnitIndex'][vnum] = unum;
    plotsObj[pnum]['var'][vnum] = 1;
    plotsObj[pnum]['varLabel'][vnum] = 'Tcold';
    plotsObj[pnum]['varDataUnits'][vnum] = 'K';
    plotsObj[pnum]['varShow'][vnum] = 'show';
    plotsObj[pnum]['varYaxis'][vnum] = 'left';
    plotsObj[pnum]['varYscaleFactor'][vnum] = 1;

    // plot 3 info
    pnum = 3;
    plotsObj[pnum] = new Object();
    plotsObj[pnum]['type'] = 'canvas';
    plotsObj[pnum]['title'] = 'hot side color canvas';
    plotsObj[pnum]['canvas'] = 'canvas_CANVAS_hot'; // without prefix #
    // for canvas type, all data comes from one process unit and one local array
    plotsObj[pnum]['varUnitIndex'] = unum; // index of unit in processUnits object
    plotsObj[pnum]['var'] = 0; // variable number in data array for plot; 0, 1, etc.
    // varTimePts & varSpacePts must match values used in unit array colorCanvasData
    plotsObj[pnum]['varTimePts'] = processUnits[unum]['numNodes'];
    plotsObj[pnum]['varSpacePts'] = 1;
    plotsObj[pnum]['varValueMin'] = 320; // processUnits[unum]['dataMin'][1]; // [1] is TinCold
    plotsObj[pnum]['varValueMax'] = 450; // processUnits[unum]['dataMax'][0]; // [0] is TinHot
    plotsObj[pnum]['xAxisReversed'] = 1; // 0 false, 1 true, when true, xmax on left

    // plot 4 info
    pnum = 4;
    plotsObj[pnum] = new Object();
    plotsObj[pnum]['type'] = 'canvas';
    plotsObj[pnum]['title'] = 'cold side color canvas';
    plotsObj[pnum]['canvas'] = 'canvas_CANVAS_cold'; // without prefix #
    // for canvas type, all data comes from one process unit and one local array
    plotsObj[pnum]['varUnitIndex'] = unum; // index of unit in processUnits object
    plotsObj[pnum]['var'] = 1; // variable number in array for plot: 0, 1, etc.
    // varTimePts & varSpacePts must match values used in unit array colorCanvasData
    plotsObj[pnum]['varTimePts'] = processUnits[unum]['numNodes'];
    plotsObj[pnum]['varSpacePts'] = 1;
    plotsObj[pnum]['varValueMin'] = 320; // processUnits[unum]['dataMin'][1]; // [1] is TinCold
    plotsObj[pnum]['varValueMax'] = 450; // processUnits[unum]['dataMax'][0]; // [0] is TinHot
    plotsObj[pnum]['xAxisReversed'] = 1; // 0 false, 1 true, when true, xmax on left

  }, // end initialize method of plotsObj

} // end plotsObj
