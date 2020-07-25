/*
  Design, text, images and code by Richard K. Herz, 2017-2020
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// INSTRUCTIONS:
//     READ THE WIKI PAGE FOR THIS FILE AT OUR GITHUB SITE
//     https://github.com/RichardHerz/web-labs/wiki/process_plot_info

let plotInfo = {

  initialize : function() {

    let unum = 0; // useful when only one unit in plot, processUnits[unum]

    // plot 0 info
    let pnum = 0;
    plotInfo[pnum] = new Object();
    plotInfo[pnum]['type'] = 'single';
    plotInfo[pnum]['title'] = 'Batch history';
    plotInfo[pnum]['canvas'] = '#div_PLOTDIV_plotData'; // flot.js wants ID with prefix #
    // plotInfo[pnum]['numberPoints'] not needed here since only one unit in this plot

    // SPECIAL FOR LAB TYPE SINGLE
    // xVar and yVar selected by HTML menu buttons
    let xVar = simParams.xVar;
    let yVar = simParams.yVar;

    plotInfo[pnum]['xAxisLabel'] = processUnits[unum]['dataHeaders'][xVar];
    plotInfo[pnum]['xAxisTableLabel'] = processUnits[unum]['dataHeaders'][xVar];

    // xAxisShow false does not show numbers, nor label, nor grid for x-axis
    // might be better to cover numbers if desire not to show numbers
    plotInfo[pnum]['xAxisShow'] = 1; // 0 false, 1 true
    plotInfo[pnum]['xAxisMin'] = processUnits[unum]['dataMin'][xVar];
    plotInfo[pnum]['xAxisMax'] = processUnits[unum]['dataMax'][xVar]

    plotInfo[pnum]['xAxisReversed'] = 0; // 0 false, 1 true, when true, xmax on left
    plotInfo[pnum]['yLeftAxisLabel'] = processUnits[unum]['dataHeaders'][yVar];
    plotInfo[pnum]['yLeftAxisMin'] = processUnits[unum]['dataMin'][yVar];
    plotInfo[pnum]['yLeftAxisMax'] = processUnits[unum]['dataMax'][yVar];

    plotInfo[pnum]['yRightAxisLabel'] = '';
    plotInfo[pnum]['yRightAxisMin'] = 0;
    plotInfo[pnum]['yRightAxisMax'] = 1;

// xxx 0 not working to not show legend...
    plotInfo[pnum]['plotLegendShow'] = 0;  // Boolean, '' or 0 for no show, 1 or "show"

    plotInfo[pnum]['plotLegendPosition'] = 'nw';
    plotInfo[pnum]['plotGridBgColor'] = 'white';
    // colors can be specified rgb, rgba, hex, and color names
    // for flot.js colors, only basic color names appear to work, e.g., white, blue, red
    // for all html color names to hex see http://www.color-hex.com
    // for all color names to hex see https://www.w3schools.com/colors/colors_picker.asp
    plotInfo[pnum]['plotDataSeriesColors'] = ['#420420','#1e90ff']; // optional, in variable order 0, 1, etc.
    // ['#ff6347','#1e90ff'] is Tomato and DodgerBlue, #420420 is black

    // SPECIAL FOR LAB TYPE SINGLE
    plotInfo[pnum]['plotDataPoints'] = 1; // 0 false, 1 true, default is false
    plotInfo[pnum]['plotDataLines'] = 0; // 0 false, 1 true, default is true

    //
    // SET UP ARRAYS TO HOLD INFO FOR EACH VARIABLE on plot and/or copy data table
    // WARNING: all below with prefix 'var' must have same number of child objects,
    // one for each variable placed on plot
    plotInfo[pnum]['varUnitIndex'] = [];
    plotInfo[pnum]['var'] = [];
    plotInfo[pnum]['varLabel'] = [];
    plotInfo[pnum]['varDataUnits'] = [];
    plotInfo[pnum]['varShow'] = [];
    plotInfo[pnum]['varYaxis'] = [];
    plotInfo[pnum]['varYscaleFactor'] = [];

    //
    // ADD SETTINGS FOR EACH VARIABLE
    //
    // XXX SPECIAL FOR LAB TYPE SINGLE
    //     list one variable for now
    //     later set values from plot menu buttons
    //
    vnum = 0; // 1st variable
    // XXX SPECIAL for lab type single - use 1st variable as xVar
    plotInfo[pnum]['varUnitIndex'][vnum] = unum;
    plotInfo[pnum]['var'][vnum] = yVar;
    plotInfo[pnum]['varLabel'][vnum] = processUnits[unum]['dataHeaders'][yVar];
    plotInfo[pnum]['varDataUnits'][vnum] = processUnits[unum]['dataUnits'][yVar];
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
  } // end initialize method of plotInfo

}; // end of object plotInfo
