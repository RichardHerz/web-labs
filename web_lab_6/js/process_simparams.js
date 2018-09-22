/*
  Design, text, images and code by Richard K. Herz, 2017-2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

let simParams = {
  //
  // ----- OBJECT TO CONTAIN & SET GENERAL SIMULATION PARAMETERS ---------
  //
  // process unit objects USE object simParams:
  //    GET simParams.simTimeStep, SET simParams.ssFlag
  //
  // OBJECT controller USES in object simParams the following:
  //    function updateCurrentRunCountDisplay()
  //    function checkForSteadyState()
  //    function updateSimTime()
  //    variables runningFlag, ssFlag, simStepRepeats
  //    variable updateDisplayTimingMs
  //
  // simParams uses variable residenceTime from process unit puHeatExchanger
  //

  title : 'Heat Exchanger', // title of simulation

  // ssFlag set to true in checkForSteadyState() in simParams when
  //           sim reaches steady state
  // ssFlag set to false in runThisLab() and resetThisLab() in main.js
  // ssFlag set to false by updateUIparams() in each process unit
  ssFlag : false,

  runningFlag : false, // set runningFlag to false initially
  runButtonID : "button_runButton", // for functions to run, reset, copy data
  // URLs for methods updateRunCount and updateCurrentRunCountDisplay below
  runLoggerURL : "../webAppRunLog.lc",
  runCurrrentRunCountURL : "../webAppCurrentCount.lc",
  // warning: this.runCounterFieldID does NOT work below in logger URL methods
  // need literal field ID string in methods below
  runCounterFieldID : "field_run_counter", // not used, see 2 lines above

  // all units use simParams.simTimeStep, getting it at each step in unit updateInputs()
  // see method simParams.changeSimTimeStep() below to change simTimeStep value
  // WARNING: DO NOT CHANGE simTimeStep BETWEEN display updates

  simStepRepeats : 1, // integer number of unit updates between display updates
  simTimeStep : 2, // time step value, simulation time, of main repeat

  // individual units may do more steps in one unit updateState()
  // see individual units for any unitTimeStep and unitStepRepeats

  // set updateDisplayTimingMs to 50 ms because runs too fast on fast desktop
  // and 50 ms gives about same speed as 0 ms on my laptop
  updateDisplayTimingMs : 50, // real time milliseconds between display updates

  // simTime is changed in updateSimTime() and resetSimTime()
  // simTime & oldSimTime are used to in checkForSteadyState()
  simTime : 0, // (s)
  oldSimTime : 0, // (s)

  updateRunCount : function() {
    // need literal "field_run_counter" below - this.runCounterFieldID does NOT work
    //
    // WARNING: runLoggerURL logger script checks for "rxn-diff" literal
    //
    $.post(this.runLoggerURL,{webAppNumber: "6, Heat Exchanger"})
      .done(
        function(data) {
          // document.getElementById("field_run_counter").innerHTML = "<i>Total runs = " + data + "</i>";
        } // END OF function(data)
      ) // END OF .done(
  }, // END OF updateRunCount

  updateCurrentRunCountDisplay : function() {
    // need literal "field_run_counter" below - this.runCounterFieldID does NOT work
    // $.post(this.runCurrrentRunCountURL) .done(function(data) {
      // document.getElementById("field_run_counter").innerHTML = "<i>Total runs = " + data + "</i>"; } );
  },

  resetSimTime : function() {
    this.simTime = 0;
  },

  updateSimTime : function() {
    this.simTime = this.simTime + this.simTimeStep;
  },

  // runningFlag value can change by click of RUN-PAUSE or RESET buttons
  // calling functions toggleRunningFlag and stopRunningFlag
  toggleRunningFlag : function() {
    this.runningFlag = !this.runningFlag;
  },

  stopRunningFlag : function() {
    this.runningFlag = false;
  },

  changeSimTimeStep : function(factor) {
    // WARNING: do not change simTimeStep except immediately before or after a
    // display update in order to maintain sync between sim time and real time
    this.simTimeStep = factor * this.simTimeStep;
  },

  checkForSteadyState : function() {
    // required - called by process_main.js
    // uses this.simTime
    // sets this.ssFlag and this.oldSimTime
    // calls each unit's own checkForSteadyState()
    // check for SS in order to save CPU time when sim is at steady state
    // check for SS by checking for any significant change in array end values
    // but wait at least one residence time after the previous check
    // to allow changes to propagate down unit
    // open OS Activity Monitor of CPU load to see effect of this
    //
    // FOR THIS LAB, exchanger is processUnits[0] and exchanger determines SS
    // found that should wait two times residence time between checks in this lab
    let resTime = processUnits[0]['residenceTime'];
    //
    if (this.simTime >= this.oldSimTime + 2 * resTime) {
      // get ssFlag from each unit
      let thisFlag = true; // changes to false if any unit not at steady state
      let numUnits = Object.keys(processUnits).length; // number of units
      for (let n = 0; n < numUnits; n += 1) {
        if (!processUnits[n].checkForSteadyState()){
          // result returned by unit is not true
          thisFlag = false;
        }
      }
      this.ssFlag = thisFlag;
      // save sim time of this check
      // do not save for every call of this function or will never enter IF & check
      this.oldSimTime = this.simTime;
    } // END of if (this.simTime >= this.oldSimTime + 2 * resTime)
  } // END checkForSteadyState method 

}; // END simParams object
