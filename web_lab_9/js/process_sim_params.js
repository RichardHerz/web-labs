/*
  Design, text, images and code by Richard K. Herz, 2017-2018
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
  //
  // OBJECT controller CAN CHANGE in object simParams the following:
  //    variable simTimeStep in method controller.changeSimTimeStep
  //

  title : 'catalytic CSTRs in series', // title of simulation

  runButtonID : "button_runButton", // for functions to run, reset, copy data
  // URLs for methods updateRunCount and updateCurrentRunCountDisplay below
  runLoggerURL : "../webAppRunLog.lc",
  runCurrrentRunCountURL : "../webAppCurrentCount.lc",

  // all units use simParams.simTimeStep, getting it at each step in unit updateInputs()
  // see method simParams.changeSimTimeStep() below to change simTimeStep value
  // WARNING: DO NOT CHANGE simTimeStep BETWEEN display updates

  simStepRepeats : 10, // integer number of unit updates between display updates
  // SPECIAL - this lab use simStepRepeats = 10, with smaller get probs with SS conversion plot...
  simTimeStep : 8, // time step value, simulation time, of main repeat

  // individual units may do more steps in one unit updateState()
  // see individual units for any unitTimeStep and unitStepRepeats

  // set updateDisplayTimingMs to 50 ms because runs too fast on fast desktop
  // and 50 ms gives about same speed as 0 ms on my laptop
  updateDisplayTimingMs : 30, // real time milliseconds between display updates

  // WARNING: NEED LITERAL, e.g., "field_run_counter" in methods below
  //      e.g., this.runCounterFieldID does NOT work

  updateRunCount : function() {

    // console.log('sim_params, updateRunCount deactivated');

    // WARNING: NEED LITERAL, e.g., "field_run_counter" below
    //      e.g., this.runCounterFieldID does NOT work
    //
    $.post(this.runLoggerURL,{webAppNumber: "9, CSTRs in Series"})
      .done(
        function(data) {
          // document.getElementById("field_run_counter").innerHTML = "<i>Total runs = " + data + "</i>";
        } // END OF function(data)
      ) // END OF .done(
  }, // END OF updateRunCount

  updateCurrentRunCountDisplay : function() {
    // WARNING: NEED LITERAL, e.g., "field_run_counter" below
    //      e.g., this.runCounterFieldID does NOT work
    // $.post(this.runCurrrentRunCountURL) .done(function(data) {
      // document.getElementById("field_run_counter").innerHTML = "<i>Total runs = " + data + "</i>"; } );
  },

  // // ORIG
  // // SPECIAL FOR THIS LAB - SELECT REACTOR FOR SS CONVERSION PLOT
  // // called onchange of html select element id='selectReactor'
  // selectReactor : function() {
  //       let p = 1; // plot number
  //       let rxr = document.getElementById("selectReactor").value;
  //       plotInfo[p]['varUnitIndex'][0] = rxr;
  //       // document.getElementById("demo").innerHTML = "You selected: " + rxr;
  //       let data = plotter.getPlotData(p);
  //       plotter.plotPlotData(data,p);
  // }

  // NEW
  // SPECIAL FOR THIS LAB - SELECT REACTOR FOR SS CONVERSION PLOT
  // called onchange of html select element id='selectReactor'
  selectReactor : function() {
        let plotIndex = 1;
        let rxr = document.getElementById("selectReactor").value;
        let vnum = rxr - 1; // plot variable index 
        // NEW
        // hide all vars first
        for (v = 0; v < 4; v += 1) {
          plotInfo[plotIndex]['varShow'][v] = 'hide';
        }
        plotInfo[plotIndex]['varShow'][vnum] = 'show';
        // document.getElementById("demo").innerHTML = "You selected: " + rxr;
        let data = plotter.getPlotData(plotIndex);
        plotter.plotPlotData(data,plotIndex);
  }

}; // END simParams object
