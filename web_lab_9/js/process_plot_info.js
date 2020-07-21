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

    // SPECIAL FOR THIS LAB
    // SET HTML select TO MATCH SS CONVERSION PLOT 1 REACTOR VAR 0
    //      plotInfo[1]['varUnitIndex'][0] = 4;
    // ON RELOAD OF WINDOW AFTER FIRST LOAD
    document.getElementById("selectReactor").value = 4;

    // plot 0 info
    let pnum = 0;
    plotInfo[pnum] = new Object();
    plotInfo[pnum]['type'] = 'strip';
    plotInfo[pnum]['title'] = 'Reactant Concentration';
    plotInfo[pnum]['canvas'] = '#div_PLOTDIV_plotConcentration'; // flot.js wants ID with prefix #
    // set numberPoints < = than width of plot in HTML pixels for fast plotting
    let numPts = 563; // special - used below more than once
    // WARNING: require 'numberPoints' here because it is used in multiple units
    // to create data arrays of same length for this plot
    plotInfo[pnum]['numberPoints'] = numPts; // required, used in multiple units on this plot
    plotInfo[pnum]['xAxisLabel'] = '< recent time | earlier time >'; // label for copy data table
    plotInfo[pnum]['xAxisTableLabel'] = 'Time (s)'; // label for copy data table
    // xAxisShow false does not show numbers, nor label, nor grid for x-axis
    // might be better to cover numbers if desire not to show numbers
    plotInfo[pnum]['xAxisShow'] = 1; // 0 false, 1 true
    plotInfo[pnum]['xAxisMin'] = 0;
    // multiplier in line below is numberPoints for this plot
    plotInfo[pnum]['xAxisMax'] = numPts * simParams.simTimeStep * simParams.simStepRepeats; // numberPoints * ...
    plotInfo[pnum]['xAxisReversed'] = 1; // 0 false, 1 true, when true, xmax on left
    plotInfo[pnum]['yLeftAxisLabel'] = 'Reactant Concentration';
    plotInfo[pnum]['yLeftAxisMin'] = 0;
    plotInfo[pnum]['yLeftAxisMax'] = 1.2;
    plotInfo[pnum]['yRightAxisLabel'] = '';
    plotInfo[pnum]['yRightAxisMin'] = 0;
    plotInfo[pnum]['yRightAxisMax'] = 2;
    plotInfo[pnum]['plotLegendPosition'] = "ne";
    plotInfo[pnum]['plotLegendShow'] = 1;  // Boolean, '' or 0 for no show, 1 or "show"
    plotInfo[pnum]['plotGridBgColor'] = 'white';
    // colors can be specified rgb, rgba, hex, and color names
    // for flot.js colors, only basic color names appear to work, e.g., white, blue, red
    // for all html color names to hex see http://www.color-hex.com
    // for all color names to hex see https://www.w3schools.com/colors/colors_picker.asp
    // OLD
    // plotInfo[pnum]['plotDataSeriesColors'] = ['blue','red','#919191']; // optional, in variable order 0, 1, etc.
    // NEW
    plotInfo[pnum]['plotDataSeriesColors'] = ['blue','red','#919191','#1e90ff','#ff6347'];
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
    plotInfo[pnum]['varLabel'][vnum] = 'Feed';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = ''; // processUnits[1]['dataUnits'][4]; // 1st var
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
    plotInfo[pnum]['varLabel'][vnum] = 'Rxr 1';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = ''; // processUnits[1]['dataUnits'][4]; // 1st var
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 2; // 3rd variable
    plotInfo[pnum]['varUnitIndex'][vnum] = 2;
    plotInfo[pnum]['var'][vnum] = 0;
    plotInfo[pnum]['varLabel'][vnum] = 'Rxr 2';
    plotInfo[pnum]['varDataUnits'][vnum] = ''; // processUnits[1]['dataUnits'][3];
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 3; // 4th variable
    plotInfo[pnum]['varUnitIndex'][vnum] = 3;
    plotInfo[pnum]['var'][vnum] = 0;
    plotInfo[pnum]['varLabel'][vnum] = 'Rxr 3';
    plotInfo[pnum]['varDataUnits'][vnum] = ''; // processUnits[1]['dataUnits'][3];
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 4; // 5th variable
    plotInfo[pnum]['varUnitIndex'][vnum] = 4;
    plotInfo[pnum]['var'][vnum] = 0;
    plotInfo[pnum]['varLabel'][vnum] = 'Rxr 4';
    plotInfo[pnum]['varDataUnits'][vnum] = ''; // processUnits[1]['dataUnits'][3];
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    // plot 1 info
    pnum = 1;
    plotInfo[pnum] = new Object();
    plotInfo[pnum]['type'] = 'profile';
    plotInfo[pnum]['title'] = 'Steady-State Conversion after each reactor based on feed concentration';
    plotInfo[pnum]['canvas'] = '#div_PLOTDIV_plotSSconversion'; // flot.js wants ID with prefix #
    // plotInfo[pnum]['numberPoints'] not needed here since only one unit in this plot
    plotInfo[pnum]['xAxisLabel'] = 'System Feed Reactant Concentration';
    plotInfo[pnum]['xAxisTableLabel'] = 'Feed Conc'; // label for copy data table
    // xAxisShow false does not show numbers, nor label, nor grid for x-axis
    // might be better to cover numbers if desire not to show numbers
    plotInfo[pnum]['xAxisShow'] = 1; // 0 false, 1 true
    plotInfo[pnum]['xAxisMin'] = 0;
    plotInfo[pnum]['xAxisMax'] = 1.1;
    plotInfo[pnum]['xAxisReversed'] = 0; // 0 false, 1 true, when true, xmax on left
    plotInfo[pnum]['yLeftAxisLabel'] = 'Steady-State Conversion';
    plotInfo[pnum]['yLeftAxisMin'] = 0;
    plotInfo[pnum]['yLeftAxisMax'] = 1.1;
    plotInfo[pnum]['yRightAxisLabel'] = '';
    plotInfo[pnum]['yRightAxisMin'] = 0;
    plotInfo[pnum]['yRightAxisMax'] = 1;
    plotInfo[pnum]['plotLegendPosition'] = "ne";
    plotInfo[pnum]['plotLegendShow'] = 0;  // Boolean, '' or 0 for no show, 1 or "show"
    plotInfo[pnum]['plotGridBgColor'] = 'white';
    plotInfo[pnum]['plotDataPoints'] = 1; // 0 false, 1 true, default is false
    plotInfo[pnum]['plotDataLines'] = 0; // 0 false, 1 true, default is true
    // colors can be specified rgb, rgba, hex, and color names
    // for flot.js colors, only basic color names appear to work, e.g., white, blue, red
    // for all html color names to hex see http://www.color-hex.com
    // for all color names to hex see https://www.w3schools.com/colors/colors_picker.asp
    // OLD
    // plotInfo[pnum]['plotDataSeriesColors'] = ['blue','red','#919191']; // optional, in variable order 0, 1, etc.
    // NEW
    plotInfo[pnum]['plotDataSeriesColors'] = ['red','#919191','#1e90ff','#ff6347']; // optional, in variable order 0, 1, etc.
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
    // list all variables so can copy all to table but select which one
    // to show with show param
    //
    vnum = 0; // 1st variable
    plotInfo[pnum]['varUnitIndex'][vnum] = 1; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 0; // value is variable index in unit's plot data array
    plotInfo[pnum]['varLabel'][vnum] = 'Rxr 1';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = ''; // processUnits[1]['dataUnits'][4]; // 1st var
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'hide';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 1; // 2nd variable
    plotInfo[pnum]['varUnitIndex'][vnum] = 2; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 0; // value is variable index in unit's plot data array
    plotInfo[pnum]['varLabel'][vnum] = 'Rxr 2';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = ''; // processUnits[1]['dataUnits'][4]; // 1st var
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'hide';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 2; // 3rd variable
    plotInfo[pnum]['varUnitIndex'][vnum] = 3; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 0; // value is variable index in unit's plot data array
    plotInfo[pnum]['varLabel'][vnum] = 'Rxr 3';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = ''; // processUnits[1]['dataUnits'][4]; // 1st var
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'hide';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 3; // 4th variable
    plotInfo[pnum]['varUnitIndex'][vnum] = 4; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 0; // value is variable index in unit's plot data array
    plotInfo[pnum]['varLabel'][vnum] = 'Rxr 4';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = ''; // processUnits[1]['dataUnits'][4]; // 1st var
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //

    // plot 2 info
    pnum = 2;
    plotInfo[pnum] = new Object();
    plotInfo[pnum]['type'] = 'profile';
    plotInfo[pnum]['title'] = 'Steady-State Rate as average dimensionless turnover frequency at bulk conc in rxr';
    plotInfo[pnum]['canvas'] = '#div_PLOTDIV_plotSSrate'; // flot.js wants ID with prefix #
    // plotInfo[pnum]['numberPoints'] not needed here since only one unit in this plot
    plotInfo[pnum]['xAxisLabel'] = 'Reactant Concentration in Reactor';
    plotInfo[pnum]['xAxisTableLabel'] = 'Bulk conc in Rxr'; // label for copy data table
    // xAxisShow false does not show numbers, nor label, nor grid for x-axis
    // might be better to cover numbers if desire not to show numbers
    plotInfo[pnum]['xAxisShow'] = 1; // 0 false, 1 true
    plotInfo[pnum]['xAxisMin'] = 0;
    plotInfo[pnum]['xAxisMax'] = 1;
    plotInfo[pnum]['xAxisReversed'] = 0; // 0 false, 1 true, when true, xmax on left
    plotInfo[pnum]['yLeftAxisLabel'] = 'Steady-State Rate in Reactor';
    plotInfo[pnum]['yLeftAxisMin'] = 0;
    plotInfo[pnum]['yLeftAxisMax'] = 0.001;
    plotInfo[pnum]['yRightAxisLabel'] = '';
    plotInfo[pnum]['yRightAxisMin'] = 0;
    plotInfo[pnum]['yRightAxisMax'] = 1;
    plotInfo[pnum]['plotLegendPosition'] = "ne";
    plotInfo[pnum]['plotLegendShow'] = 1;  // Boolean, '' or 0 for no show, 1 or "show"
    plotInfo[pnum]['plotGridBgColor'] = 'white';
    plotInfo[pnum]['plotDataPoints'] = 1; // 0 false, 1 true, default is false
    plotInfo[pnum]['plotDataLines'] = 0; // 0 false, 1 true, default is true
    // colors can be specified rgb, rgba, hex, and color names
    // for flot.js colors, only basic color names appear to work, e.g., white, blue, red
    // for all html color names to hex see http://www.color-hex.com
    // for all color names to hex see https://www.w3schools.com/colors/colors_picker.asp
    // OLD
    // plotInfo[pnum]['plotDataSeriesColors'] = ['blue','red','#919191']; // optional, in variable order 0, 1, etc.
    // NEW
    plotInfo[pnum]['plotDataSeriesColors'] = ['red','#919191','#1e90ff','#ff6347']; // optional, in variable order 0, 1, etc.
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
    vnum = 0; // 1st variable
    plotInfo[pnum]['varUnitIndex'][vnum] = 1; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 1; // value is variable index in plot data array
    plotInfo[pnum]['varLabel'][vnum] = 'Rxr 1';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = ''; // processUnits[1]['dataUnits'][4]; // 1st var
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 1; // 2nd variable
    plotInfo[pnum]['varUnitIndex'][vnum] = 2; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 1; // value is variable index in plot data array
    plotInfo[pnum]['varLabel'][vnum] = 'Rxr 2';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = ''; // processUnits[1]['dataUnits'][4]; // 1st var
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 2; // 3rd variable
    plotInfo[pnum]['varUnitIndex'][vnum] = 3; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 1; // value is variable index in plot data array
    plotInfo[pnum]['varLabel'][vnum] = 'Rxr 3';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = ''; // processUnits[1]['dataUnits'][4]; // 1st var
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 3; // 4th variable
    plotInfo[pnum]['varUnitIndex'][vnum] = 4; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 1; // value is variable index in plot data array
    plotInfo[pnum]['varLabel'][vnum] = 'Rxr 4';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = ''; // processUnits[1]['dataUnits'][4]; // 1st var
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //

  }, // end initialize method of plotInfo

} // end plotInfo
