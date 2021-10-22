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

  title : 'Water Tank Level Control', // title of simulation

  // valid values for labType are 'Dynamic' or any other value
  // if set to 'Dynamic', then controller.updateProcess is called repeatedly on Run
  // by interacer.runThisLab
  // if is set to any other value, controller.updateProcess is called once on Run
  // by interacer.runThisLab
  labType : 'Dynamic',

  runButtonID : "button_runButton", // required for interfacer object methods
  // URLs for methods updateRunCount and updateCurrentRunCountDisplay below
  runLoggerURL : "../webAppRunLog.lc",
  runCurrrentRunCountURL : "../webAppCurrentCount.lc",

  // all units use simParams.simTimeStep, getting it at each step in unit updateInputs()

  // WARNING: DO NOT CHANGE simTimeStep BETWEEN display updates

  // WARNING: CHECK FOR NUMERICAL INSTABILITY CAUSED BY EULER METHOD TIME STEPPING
  //          reduce simTimeStep until no further change in results

  simStepRepeats : 4, // integer number of unit updates between display updates
  simTimeStep : 0.025, // time step value, simulation time, of main repeat

  // individual units may do more steps in one unit updateState()
  // see individual units for any unitTimeStep and unitStepRepeats

  // set updateDisplayTimingMs to 50 ms because runs too fast on fast desktop
  // and 50 ms gives about same speed as 0 ms on my laptop
  updateDisplayTimingMs : 120, // real time milliseconds between display updates

  // WARNING: NEED LITERAL, e.g., "field_run_counter" in methods below
  //      e.g., this.runCounterFieldID does NOT work

  updateRunCount : function() {

    // console.log('sim_params, updateRunCount deactivated');

    // WARNING: NEED LITERAL, e.g., "field_run_counter" below
    //      e.g., this.runCounterFieldID does NOT work
    //
    $.post(this.runLoggerURL,{webAppNumber: "1, Water Tank Level Control"})
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

}; // END simParams object
