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

    const span = 1000; // for x-axis span in number points, used in two places below

    // plot 0 info
    let pnum = 0;
    plotInfo[pnum] = new Object();
    plotInfo[pnum]['type'] = 'strip';
    plotInfo[pnum]['title'] = 'Water Tank Level Control';
    plotInfo[pnum]['canvas'] = '#div_PLOTDIV_plotData'; // flot.js wants ID with prefix #
    // set numberPoints < = than width of plot in HTML pixels for fast plotting
    plotInfo[pnum]['numberPoints'] = span; // WARNING: value used below in ['xAxisMax']
    plotInfo[pnum]['xAxisLabel'] = '< recent time | earlier time (min) >'; // label for copy data table
    plotInfo[pnum]['xAxisTableLabel'] = 'Time (min)'; // label for copy data table
    // xAxisShow false does not show numbers, nor label, nor grid for x-axis
    // might be better to cover numbers if desire not to show numbers
    plotInfo[pnum]['xAxisShow'] = 1; // 0 false, 1 true
    plotInfo[pnum]['xAxisMin'] = 0;
    // multiplier in line below is numberPoints for this plot
    plotInfo[pnum]['xAxisMax'] = span * simParams.simTimeStep * simParams.simStepRepeats; // numberPoints * ...
    plotInfo[pnum]['xAxisReversed'] = 1; // 0 false, 1 true, when true, xmax on left
    plotInfo[pnum]['yLeftAxisLabel'] = 'Inlet Flow Rate';
    plotInfo[pnum]['yLeftAxisMin'] = 0;
    plotInfo[pnum]['yLeftAxisMax'] = 3;
    plotInfo[pnum]['yRightAxisLabel'] = 'Water Level - Controller Command';
    plotInfo[pnum]['yRightAxisMin'] = 0;
    plotInfo[pnum]['yRightAxisMax'] = 3;
    plotInfo[pnum]['plotLegendPosition'] = "nw";
    plotInfo[pnum]['plotLegendShow'] = 1;  // Boolean, '' or 0 for no show, 1 or "show"
    plotInfo[pnum]['plotGridBgColor'] = 'white';
    // colors can be specified rgb, rgba, hex, and color names
    // for flot.js colors, only basic color names appear to work, e.g., white, blue, red
    // for all html color names to hex see http://www.color-hex.com
    // for all color names to hex see https://www.w3schools.com/colors/colors_picker.asp
    plotInfo[pnum]['plotDataSeriesColors'] = ['blue','red','#919191','orange']; // optional, in variable order 0, 1, etc.
    // ['#1e90ff','#ff6347','#919191'] is DodgerBlue, Tomato, Tin (metal Tin)
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
    plotInfo[pnum]['varUnitIndex'][vnum] = 0; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 0; // value is variable index in plot data array
    plotInfo[pnum]['varLabel'][vnum] = 'Flow Rate';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = 'm3/s'; // processUnits[1]['dataUnits'][4]; // 1st var
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 1; // 2nd variable
    plotInfo[pnum]['varUnitIndex'][vnum] = 1; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 0; // value is variable index in plot data array
    plotInfo[pnum]['varLabel'][vnum] = 'Level Tank 1';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = 'm'; // processUnits[1]['dataUnits'][4]; // 1st var
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'right';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 2; // 3rd variable
    plotInfo[pnum]['varUnitIndex'][vnum] = 2; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 0; // value is variable index in plot data array
    plotInfo[pnum]['varLabel'][vnum] = 'Level Tank 2';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = 'm'; // processUnits[1]['dataUnits'][4]; // 1st var
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'right';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 3; // 4th variable
    plotInfo[pnum]['varUnitIndex'][vnum] = 3;
    plotInfo[pnum]['var'][vnum] = 0;
    plotInfo[pnum]['varLabel'][vnum] = 'Set Point';
    plotInfo[pnum]['varDataUnits'][vnum] = 'm';
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'right';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 4; // 5th variable
    plotInfo[pnum]['varUnitIndex'][vnum] = 3;
    plotInfo[pnum]['var'][vnum] = 1;
    plotInfo[pnum]['varLabel'][vnum] = 'Command';
    plotInfo[pnum]['varDataUnits'][vnum] = '0-1';
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'right';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;

  }, // end initialize method of plotInfo

} // end plotInfo
