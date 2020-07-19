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

  initialize : function() {
    //
    // WARNING: some of these object properties may be changed during
    //          operation of the program, e.g., show, scale
    //

    let unum = 0; // useful when only one unit in plot, processUnits[unum]

    // type can be 'canvas' or 'profile' or 'strip' or other
    // if other, then plotting not called by controller and must be called by unit

    // plot 0 info
     pnum = 0;
    plotInfo[pnum] = new Object();
    plotInfo[pnum]['type'] = 'special';
    plotInfo[pnum]['title'] = 'arena';
    plotInfo[pnum]['canvas'] = 'canvas_CANVAS_arena'; // without prefix #
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
