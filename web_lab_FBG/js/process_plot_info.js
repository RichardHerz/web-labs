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

  // BOTH LINES BELOW WORK (Flanagan, 6.10.5, 7th ed., p. 149)
  // initialize : function() {
  initialize() {

    // let unum = 0; // useful when only one unit in plot, processUnits[unum]

    // SPECIAL - ['type'] can = 'canvas' or 'profile' or 'strip' or other
    // if other, AS IS HERE, then plotting not called by controller and
    // must be called by unit

    // plot 0 info
    let pnum = 0;
    let unum = 0;
    plotInfo[pnum] = new Object();
    plotInfo[pnum]['type'] = 'canvas';
    plotInfo[pnum]['title'] = 'Bed_0';
    plotInfo[pnum]['canvas'] = 'canvas_CANVAS_bed_0'; // without prefix #
    // for canvas type, all data comes from one process unit and one local array
    plotInfo[pnum]['varUnitIndex'] = 0; // index of unit in processUnits object
    plotInfo[pnum]['var'] = 0; // variable number in array spaceTimeData, 0, 1, etc.
    // varTimePts & varSpacePts must match values used in unit array colorCanvasData
    plotInfo[pnum]['varTimePts'] = processUnits[unum]['numNodes'];
    plotInfo[pnum]['varSpacePts'] = processUnits[unum]['numNodes'];
    plotInfo[pnum]['varValueMin'] = 0; // processUnits[unum]['dataMin'][1];
    plotInfo[pnum]['varValueMax'] = 100;
    //
    // plot 1 info
    pnum = 1;
    unum = 1;
    plotInfo[pnum] = new Object();
    plotInfo[pnum]['type'] = 'canvas';
    plotInfo[pnum]['title'] = 'Bed_1';
    plotInfo[pnum]['canvas'] = 'canvas_CANVAS_bed_1'; // without prefix #
    // for canvas type, all data comes from one process unit and one local array
    plotInfo[pnum]['varUnitIndex'] = unum; // index of unit in processUnits object
    plotInfo[pnum]['var'] = 0; // variable number in array spaceTimeData, 0, 1, etc.
    // varTimePts & varSpacePts must match values used in unit array colorCanvasData
    plotInfo[pnum]['varTimePts'] = processUnits[unum]['numNodes'];
    plotInfo[pnum]['varSpacePts'] = processUnits[unum]['numNodes'];
    plotInfo[pnum]['varValueMin'] = 0; // processUnits[unum]['dataMin'][1];
    plotInfo[pnum]['varValueMax'] = 100;
    //
  } // END initialize method

} // END object plotInfo
