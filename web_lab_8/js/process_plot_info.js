/*
  Design, text, images and code by Richard K. Herz, 2017-2020
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// INSTRUCTIONS:
//     READ INFO FOR THIS FILE AT THE WIKI PAGE FOR THIS FILE AT OUR GITHUB SITE
//         https://github.com/RichardHerz/web-labs/wiki/process_plot_info

let plotInfo = {

  // after the controller.openThisLab() function in process_controller.js calls
  // method initialize() here, this object will contain a child object for each plot
  //
  // in process_controller.js, the function controller.updateDisplay() uses the
  // length of plotInfo after subtracting 1 for method initialize, in order to
  // plot all the plots; if you add another method, you need to update the
  // length correction in controller.updateDisplay()
  //
  // method plotInfo.initialize() is run after all process units' initialize()
  // methods are run by controller.openThisLab() so that it can use values from
  // the units, e.g., processUnits[unum]['dataMin'][1];
  // all units' reset() methods are then called after all initialize calls
  // so units' reset methods can use all info in plotInfo

  initialize : function() {
    //
    // WARNING: some of these object properties may be changed during
    //          operation of the program, e.g., show, scale
    //

    let unum = 0; // useful when only one unit in plot, processUnits[unum]

    // plot 0 info
    let pnum = 0;
    plotInfo[pnum] = new Object();
    plotInfo[pnum]['type'] = 'profile';
    plotInfo[pnum]['title'] = 'Reactor Profiles';
    plotInfo[pnum]['canvas'] = '#div_PLOTDIV_PFR_plot'; // flot.js wants ID with prefix #
    plotInfo[pnum]['xAxisLabel'] = 'Position in Reactor';
    plotInfo[pnum]['xAxisTableLabel'] = 'Position'; // label for copy data table
    // xAxisShow false does not show numbers, nor label, nor grid for x-axis
    // might be better to cover numbers if desire not to show numbers
    plotInfo[pnum]['xAxisShow'] = 1; // 0 false, 1 true
    plotInfo[pnum]['xAxisMin'] = 0;
    plotInfo[pnum]['xAxisMax'] = 1;
    plotInfo[pnum]['xAxisReversed'] = 0; // 0 false, 1 true, when true, xmax on left
    plotInfo[pnum]['yLeftAxisLabel'] = 'Trxr (K)'; // or d'less (T - TinCold)/(TinHot - TinCold)
    plotInfo[pnum]['yLeftAxisMin'] = 320; // XXX processUnits[unum]['dataMin'][9]; // [9] is Trxr
    plotInfo[pnum]['yLeftAxisMax'] = 420; // XXX processUnits[unum]['dataMax'][9];
    plotInfo[pnum]['yRightAxisLabel'] = 'Ca (mol/m3)';
    plotInfo[pnum]['yRightAxisMin'] = 0;
    plotInfo[pnum]['yRightAxisMax'] = 550; // processUnits[unum]['Cain'];
    plotInfo[pnum]['plotLegendShow'] = 1;  // Boolean, '' or 0 for no show, 1 or "show"
    plotInfo[pnum]['plotLegendPosition'] = 'nw';
    plotInfo[pnum]['plotGridBgColor'] = 'white';
    // colors can be specified rgb, rgba, hex, and color names
    // for flot.js colors, only basic color names appear to work, e.g., white, blue, red
    // for all html color names to hex see http://www.color-hex.com
    // for all color names to hex see https://www.w3schools.com/colors/colors_picker.asp
    plotInfo[pnum]['plotDataSeriesColors'] = ['#ff6347','#1e90ff']; // optional, in variable order 0, 1, etc.
    // ['#ff6347','#1e90ff'] is Tomato and DodgerBlue
    //
    // SET UP ARRAYS TO HOLD INFO FOR EACH VARIABLE on plot and/or copy data table
    // WARNING: all below with prefix 'var' must have same number of child objects,
    // one for each variable placed on plot
    plotInfo[pnum]['varUnitIndex'] = new Array();
    plotInfo[pnum]['var'] = new Array();
    plotInfo[pnum]['varLabel'] = new Array();
    plotInfo[pnum]['varDataUnits'] = new Array();
    plotInfo[pnum]['varShow'] = new Array();
    plotInfo[pnum]['varYaxis'] = new Array();
    plotInfo[pnum]['varYscaleFactor'] = new Array();
    //
    // ADD SETTINGS FOR EACH VARIABLE
    //
    let vnum = 0; // 1st variable
    plotInfo[pnum]['varUnitIndex'][0] = unum; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 0; // value is variable index in plot data array
    plotInfo[pnum]['varLabel'][vnum] = 'Trxr';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = processUnits[unum]['dataUnits'][7]; // 1st var
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 1; // 2nd variable
    plotInfo[pnum]['varUnitIndex'][1] = unum;
    plotInfo[pnum]['var'][vnum] = 1;
    plotInfo[pnum]['varLabel'][vnum] = 'Ca';
    plotInfo[pnum]['varDataUnits'][vnum] = processUnits[unum]['dataUnits'][8];
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'right';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    // plot 1 info
    pnum = 1;
    plotInfo[pnum] = new Object();
    plotInfo[pnum]['type'] = 'canvas';
    plotInfo[pnum]['title'] = 'reactor color canvas';
    plotInfo[pnum]['canvas'] = 'canvas_CANVAS_reactor'; // without prefix #
    // for canvas type, all data comes from one process unit and one local array
    plotInfo[pnum]['varUnitIndex'] = unum; // index of unit in processUnits object
    plotInfo[pnum]['var'] = 0; // variable number in array spaceTimeData, 0, 1, etc.
    // varTimePts & varSpacePts must match values used in unit array colorCanvasData
    plotInfo[pnum]['varTimePts'] = processUnits[unum]['numNodes'];
    plotInfo[pnum]['varSpacePts'] = 1;
    plotInfo[pnum]['varValueMin'] = 320; // processUnits[unum]['dataMin'][9]; // [9] is Trxr
    plotInfo[pnum]['varValueMax'] = 420; // processUnits[unum]['dataMax'][9];
    plotInfo[pnum]['xAxisReversed'] = 0; // 0 false, 1 true, when true, xmax on left

    // --------- below are plots for the heat exchanger ----------------

    unum = 1; // useful when only one unit in plot, processUnits[unum]

    // plot 2 info
    pnum = 2;
    plotInfo[pnum] = new Object();
    plotInfo[pnum]['type'] = 'profile';
    plotInfo[pnum]['title'] = 'Heat Exchanger Temperature Profiles';
    plotInfo[pnum]['canvas'] = '#div_PLOTDIV_T_plot'; // flot.js wants ID with prefix #
    plotInfo[pnum]['xAxisLabel'] = 'Position in Heat Exchanger';
    plotInfo[pnum]['xAxisTableLabel'] = 'Position'; // label for copy data table
    // xAxisShow false does not show numbers, nor label, nor grid for x-axis
    // might be better to cover numbers if desire not to show numbers
    plotInfo[pnum]['xAxisShow'] = 1; // 0 false, 1 true
    plotInfo[pnum]['xAxisMin'] = 0;
    plotInfo[pnum]['xAxisMax'] = 1;
    plotInfo[pnum]['xAxisReversed'] = 1; // 0 false, 1 true, when true, xmax on left
    plotInfo[pnum]['yLeftAxisLabel'] = 'T (K)'; // or d'less (T - TinCold)/(TinHot - TinCold)
    plotInfo[pnum]['yLeftAxisMin'] = 320; // processUnits[unum]['dataMin'][1]; // [1] is TinCold
    plotInfo[pnum]['yLeftAxisMax'] = 450; // processUnits[unum]['dataMax'][0]; // [0] is TinHot
    plotInfo[pnum]['yRightAxisLabel'] = 'yRight';
    plotInfo[pnum]['yRightAxisMin'] = 0;
    plotInfo[pnum]['yRightAxisMax'] = 1;
    plotInfo[pnum]['plotLegendPosition'] = "nw";
    plotInfo[pnum]['plotLegendShow'] = 0;  // Boolean, '' or 0 for no show, 1 or "show"
    plotInfo[pnum]['plotGridBgColor'] = 'white';
    // colors can be specified rgb, rgba, hex, and color names
    // for flot.js colors, only basic color names appear to work, e.g., white, blue, red
    // for all html color names to hex see http://www.color-hex.com
    // for all color names to hex see https://www.w3schools.com/colors/colors_picker.asp
    plotInfo[pnum]['plotDataSeriesColors'] = ['#ff6347','#1e90ff']; // optional, in variable order 0, 1, etc.
    // ['#ff6347','#1e90ff'] is Tomato and DodgerBlue
    //
    // SET UP ARRAYS TO HOLD INFO FOR EACH VARIABLE on plot and/or copy data table
    // WARNING: all below with prefix 'var' must have same number of child objects,
    // one for each variable placed on plot
    plotInfo[pnum]['varUnitIndex'] = new Array();
    plotInfo[pnum]['var'] = new Array();
    plotInfo[pnum]['varLabel'] = new Array();
    plotInfo[pnum]['varDataUnits'] = new Array();
    plotInfo[pnum]['varShow'] = new Array();
    plotInfo[pnum]['varYaxis'] = new Array();
    plotInfo[pnum]['varYscaleFactor'] = new Array();
    //
    // ADD SETTINGS FOR EACH VARIABLE
    //
    vnum = 0; // 1st variable
    plotInfo[pnum]['varUnitIndex'][vnum] = unum; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 0; // value is variable index in plot data array
    // varlabel is used in plot legend
    plotInfo[pnum]['varLabel'][vnum] = 'Thot'; // 1st var
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = 'K';
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'show'; // 1st var
    plotInfo[pnum]['varYaxis'][vnum] = 'left'; // 1st var
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1; // 1st var
    //
    vnum = 1; // 2nd variable
    plotInfo[pnum]['varUnitIndex'][vnum] = unum;
    plotInfo[pnum]['var'][vnum] = 1;
    plotInfo[pnum]['varLabel'][vnum] = 'Tcold';
    plotInfo[pnum]['varDataUnits'][vnum] = 'K';
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;

    // plot 3 info
    pnum = 3;
    plotInfo[pnum] = new Object();
    plotInfo[pnum]['type'] = 'canvas';
    plotInfo[pnum]['title'] = 'hot side color canvas';
    plotInfo[pnum]['canvas'] = 'canvas_CANVAS_hot'; // without prefix #
    // for canvas type, all data comes from one process unit and one local array
    plotInfo[pnum]['varUnitIndex'] = unum; // index of unit in processUnits object
    plotInfo[pnum]['var'] = 0; // variable number in data array for plot; 0, 1, etc.
    // varTimePts & varSpacePts must match values used in unit array colorCanvasData
    plotInfo[pnum]['varTimePts'] = processUnits[unum]['numNodes'];
    plotInfo[pnum]['varSpacePts'] = 1;
    plotInfo[pnum]['varValueMin'] = 320; // processUnits[unum]['dataMin'][1]; // [1] is TinCold
    plotInfo[pnum]['varValueMax'] = 450; // processUnits[unum]['dataMax'][0]; // [0] is TinHot
    plotInfo[pnum]['xAxisReversed'] = 1; // 0 false, 1 true, when true, xmax on left

    // plot 4 info
    pnum = 4;
    plotInfo[pnum] = new Object();
    plotInfo[pnum]['type'] = 'canvas';
    plotInfo[pnum]['title'] = 'cold side color canvas';
    plotInfo[pnum]['canvas'] = 'canvas_CANVAS_cold'; // without prefix #
    // for canvas type, all data comes from one process unit and one local array
    plotInfo[pnum]['varUnitIndex'] = unum; // index of unit in processUnits object
    plotInfo[pnum]['var'] = 1; // variable number in array for plot: 0, 1, etc.
    // varTimePts & varSpacePts must match values used in unit array colorCanvasData
    plotInfo[pnum]['varTimePts'] = processUnits[unum]['numNodes'];
    plotInfo[pnum]['varSpacePts'] = 1;
    plotInfo[pnum]['varValueMin'] = 320; // processUnits[unum]['dataMin'][1]; // [1] is TinCold
    plotInfo[pnum]['varValueMax'] = 450; // processUnits[unum]['dataMax'][0]; // [0] is TinHot
    plotInfo[pnum]['xAxisReversed'] = 1; // 0 false, 1 true, when true, xmax on left

    // --------- below is the strip chart plot of heat exchanger end T's ----------------

    unum = 1; // useful when only one unit in plot, processUnits[unum]
    // first 4 vars here from HX unit 1, 5th var from reactor unit 0

    // plot 5 info
    pnum = 5;
    plotInfo[pnum] = new Object();
    plotInfo[pnum]['type'] = 'strip';
    plotInfo[pnum]['title'] = 'Temperature history';
    plotInfo[pnum]['canvas'] = '#div_PLOTDIV_strip_plot'; // flot.js wants ID with prefix #
    // set numberPoints < = than width of plot in HTML pixels for fast plotting
    let npts = 400; // special so can use value below at xAxisMax
    // WARNING: require 'numberPoints' here because it is used in multiple units
    // to create data arrays of same length for this plot
    plotInfo[pnum]['numberPoints'] = npts; // special, required since multiple units on this plot
    plotInfo[pnum]['xAxisLabel'] = '< recent time | earlier time (s) >';
    plotInfo[pnum]['xAxisTableLabel'] = 'Time (s)'; // label for copy data table
    // xAxisShow false does not show numbers, nor label, nor grid for x-axis
    // might be better to cover numbers if desire not to show numbers
    plotInfo[pnum]['xAxisShow'] = 1; // 0 false, 1 true
    plotInfo[pnum]['xAxisMin'] = 0;
    plotInfo[pnum]['xAxisMax'] = npts * simParams.simTimeStep * simParams.simStepRepeats; // numberPoints * ...
    plotInfo[pnum]['xAxisReversed'] = 1; // 0 false, 1 true, when true, xmax on left
    plotInfo[pnum]['yLeftAxisLabel'] = 'T (K)'; // or d'less (T - TinCold)/(TinHot - TinCold)
    plotInfo[pnum]['yLeftAxisMin'] = 320; // processUnits[unum]['dataMin'][1]; // [1] is TinCold
    plotInfo[pnum]['yLeftAxisMax'] = 450; // processUnits[unum]['dataMax'][0]; // [0] is TinHot
    plotInfo[pnum]['yRightAxisLabel'] = 'Rxr Out Conc (mol/m3)';
    plotInfo[pnum]['yRightAxisMin'] = 0;
    plotInfo[pnum]['yRightAxisMax'] = 600;
    plotInfo[pnum]['plotLegendPosition'] = "nw";
    plotInfo[pnum]['plotLegendShow'] = 0;  // Boolean, '' or 0 for no show, 1 or "show"
    plotInfo[pnum]['plotGridBgColor'] = 'white';
    // colors can be specified rgb, rgba, hex, and color names
    // for flot.js colors, only basic color names appear to work, e.g., white, blue, red
    // for all html color names to hex see http://www.color-hex.com
    // for all color names to hex see https://www.w3schools.com/colors/colors_picker.asp
    // plotInfo[pnum]['plotDataSeriesColors'] = ['#ff6347','#1e90ff']; // optional, in variable order 0, 1, etc.
    // ['#ff6347','#1e90ff'] is Tomato and DodgerBlue
    //
    // SET UP ARRAYS TO HOLD INFO FOR EACH VARIABLE on plot and/or copy data table
    // WARNING: all below with prefix 'var' must have same number of child objects,
    // one for each variable placed on plot
    plotInfo[pnum]['varUnitIndex'] = new Array();
    plotInfo[pnum]['var'] = new Array();
    plotInfo[pnum]['varLabel'] = new Array();
    plotInfo[pnum]['varDataUnits'] = new Array();
    plotInfo[pnum]['varShow'] = new Array();
    plotInfo[pnum]['varYaxis'] = new Array();
    plotInfo[pnum]['varYscaleFactor'] = new Array();
    //
    // ADD SETTINGS FOR EACH VARIABLE
    //
    vnum = 0; // 1st variable
    plotInfo[pnum]['varUnitIndex'][vnum] = unum; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 0; // value is variable index in plot data array
    // varlabel is used in plot legend
    plotInfo[pnum]['varLabel'][vnum] = 'Sys In'; // 1st var
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = 'K';
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'show'; // 1st var
    plotInfo[pnum]['varYaxis'][vnum] = 'left'; // 1st var
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1; // 1st var
    //
    vnum = 1; // 2nd variable
    plotInfo[pnum]['varUnitIndex'][vnum] = unum;
    plotInfo[pnum]['var'][vnum] = 1;
    plotInfo[pnum]['varLabel'][vnum] = 'Rxr In';
    plotInfo[pnum]['varDataUnits'][vnum] = 'K';
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 2; // 3rd variable
    plotInfo[pnum]['varUnitIndex'][vnum] = unum;
    plotInfo[pnum]['var'][vnum] = 2;
    plotInfo[pnum]['varLabel'][vnum] = 'Rxr Out';
    plotInfo[pnum]['varDataUnits'][vnum] = 'K';
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 3; // 4th variable
    plotInfo[pnum]['varUnitIndex'][vnum] = unum;
    plotInfo[pnum]['var'][vnum] = 3;
    plotInfo[pnum]['varLabel'][vnum] = 'Sys Out';
    plotInfo[pnum]['varDataUnits'][vnum] = 'K';
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;

    vnum = 4; // 5th variable - SPECIAL - UNIT INDEX 0 IS REACTOR
    plotInfo[pnum]['varUnitIndex'][vnum] = 0; // conc from reactor
    plotInfo[pnum]['var'][vnum] = 0;
    plotInfo[pnum]['varLabel'][vnum] = 'Ca-out';
    plotInfo[pnum]['varDataUnits'][vnum] = 'mol/m3';
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'right';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;

  }, // end initialize method of plotInfo

} // end plotInfo
