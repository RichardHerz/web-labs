/*
  Design, text, images and code by Richard K. Herz, 2017-2020
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

let simParams = {
  //
  // ----- DEFINE LAB-SPECIFIC SIMULATION PARAMETERS ---------
  //
  // process unit objects USE object simParams:
  //    GET simParams.simTimeStep
  //
  // OBJECT controller USES in object simParams the following:
  //    function updateCurrentRunCountDisplay()
  //    function checkForSteadyState()
  //    variables simTimeStep, simStepRepeats, updateDisplayTimingMs

  title : 'Batch Reactor, isothermal, nth order reaction', // title of simulation

  // valid values for labType are 'Dynamic' (default), or any other value
  // if not specified or set to '', 0, or false, then gets set to 'Dynamic' in controller
  // if then set to 'Dynamic', then controller.updateProcess is called repeatedly on Run
  // if is set to any other value, controller.updateProcess is called once on Run
  labType : 'Static',

  runButtonID : "button_runButton", // for functions to run, reset, copy data
  // URLs for methods updateRunCount and updateCurrentRunCountDisplay below
  runLoggerURL : "../webAppRunLog.lc",
  runCurrrentRunCountURL : "../webAppCurrentCount.lc",

  // all units use simParams.simTimeStep, getting it at each step in unit updateInputs()
  // see method changeSimTimeStep() below to change simTimeStep value
  // WARNING: DO NOT CHANGE simTimeStep BETWEEN display updates

  simStepRepeats : 1, // integer number of unit updates between display updates
  simTimeStep : 1, // time step value, simulation time, of main repeat
  simTimeUnits : 's',

  // individual units may do more steps in one unit updateState()
  // see individual units for any unitTimeStep and unitStepRepeats

  // set updateDisplayTimingMs to 50 ms because runs too fast on fast desktop
  // and 50 ms gives about same speed as 0 ms on my laptop
  updateDisplayTimingMs : 100, // real time milliseconds between display updates

  // set oldDataFlag to 1 initially so copy data buttons don't run script before
  // any data is present - set simParams.oldDataFlag = 0 in unit updateState
  // to activate copy data buttons
  oldDataFlag : 1, // 0 for no old data, 1 for old data on plot

  changeSimTimeStep : function(factor) {
    // WARNING: do not change simTimeStep except immediately before or after a
    // display update in order to maintain sync between sim time and real time
    this.simTimeStep = factor * this.simTimeStep;
  },

  // WARNING: NEED LITERAL, e.g., "field_run_counter" in methods below
  //      e.g., this.runCounterFieldID does NOT work

  updateRunCount : function() {
    // WARNING: NEED LITERAL, e.g., "field_run_counter" below
    //      e.g., this.runCounterFieldID does NOT work
    //
    // currently using simTime as runCount ( run count )
    if (controller.simTime < 2) {
      $.post(this.runLoggerURL,{webAppNumber: "13, Batch reactor, isothermal, nth order reaction"})
        .done(
          function(data) {
            // document.getElementById("field_run_counter").innerHTML = "<i>Total runs = " + data + "</i>";
          } // END OF function(data)
        ) // END OF .done(
    } // END OF if (controller.simTime < 2)
  }, // END OF updateRunCount

  updateCurrentRunCountDisplay : function() {
    // WARNING: NEED LITERAL, e.g., "field_run_counter" below
    //      e.g., this.runCounterFieldID does NOT work
    // $.post(this.runCurrrentRunCountURL) .done(function(data) {
      // document.getElementById("field_run_counter").innerHTML = "<i>Total runs = " + data + "</i>"; } );
  },

  // SPECIAL - LAB TYPE NOT DYNAMIC
  // assume only one unit and one plot type 'single' in this lab
  // these xVar, yVar values should agree with initial selected values in html
  // can't use document.getElementById() because this script loads before html
  xVar : 6,
  yVar : 8,
  // called onchange of html select element id='selectXvar'
  selectXvar : function() {
        this.xVar = document.getElementById("selectXvar").value;
        let unum = 0; // unit index, assume only one unit on this page
        let pnum = 1; // plot index, assume only one plot type 'single' on this page
        plotInfo[pnum]['xAxisMin'] = processUnits[unum]['dataMin'][this.xVar];
        plotInfo[pnum]['xAxisMax'] = processUnits[unum]['dataMax'][this.xVar];
        let data = plotter.getPlotData(pnum);
        plotter.plotArrays['plotFlag'][pnum] = 0; // force axes redraw
        plotter.plotPlotData(data, pnum);
  },
  // called onchange of html select element id='selectYvar'
  selectYvar : function() {
        this.yVar = document.getElementById("selectYvar").value;
        let unum = 0; // unit index, assume only one unit on this page
        let pnum = 1; // plot index, assume only one plot type 'single' on this page
        plotInfo[pnum]['yLeftAxisMin'] = processUnits[unum]['dataMin'][this.yVar];
        plotInfo[pnum]['yLeftAxisMax'] = processUnits[unum]['dataMax'][this.yVar];
        let data = plotter.getPlotData(pnum);
        plotter.plotArrays['plotFlag'][pnum] = 0; // force axes redraw
        plotter.plotPlotData(data, pnum);
  },

}; // END simParams object
