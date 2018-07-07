/*
  Design, text, images and code by Richard K. Herz, 2017-2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// ----- OBJECT TO CONTAIN & SET SIMULATION & PLOT PARAMETERS ---------

var simParams = {
  //
  // file process_main.js uses in object simParams the following:
  //    function updateCurrentRunCountDisplay()
  //    function checkForSteadyState()
  //    function updateSimTime()
  //    variables runningFlag, ssFlag, simStepRepeats, processUnits
  //    variables updateDisplayTimingMs
  //
  // simParams uses the following from process unit puHeatExchanger
  //    variables SScheck, residenceTime, numNodes
  //
  // simParams uses the following global variables:
  //    Thot and Tcold used in function checkForSteadyState()

  title : 'Packed Bed PFR + Heat Exchanger', // title of simulation

  // ssFlag new for process with one unit - rethink for multiple-unit processes
  // unit's updateState can set ssFlag true when unit reaches steady state
  // REDUCES CPU LOAD ONLY when return from top of process_main.js functions
  // updateProcessUnits and updateDisplay but NOT from top of unit functions here
  ssFlag : false, // steady state flag set true when sim reaches steady state
  // also see below in simParams the var oldSimTime
  // also see in process unit the vars SScheck and residenceTime

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
  simTimeStep : 0.5, // time step value, simulation time, of main repeat

  // individual units may do more steps in one unit updateState()
  // see individual units for any unitTimeStep and unitStepRepeats

  // set updateDisplayTimingMs to 50 ms because runs too fast on fast desktop
  // and 50 ms gives about same speed as 0 ms on my laptop
  updateDisplayTimingMs : 50, // real time milliseconds between display updates

  simTime : 0, // (s), time, initialize simulation time, also see resetSimTime
  oldSimTime : 0, // (s), used to check for steady state

  updateRunCount : function() {
    // need literal "field_run_counter" below - this.runCounterFieldID does NOT work
    //
    // WARNING: runLoggerURL logger script checks for "rxn-diff" literal
    //
    $.post(this.runLoggerURL,{webAppNumber: "8, Plug Flow Reactor + Heat Exchanger"})
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
    // check in order to save CPU time when sim is at steady state
    // check for SS by checking for any significant change in array end values
    // but wait at least one residence time after the previous check
    // to allow changes to propagate down unit
    // open OS Activity Monitor of CPU load to see effect of this
    //
    // use HX [1] end T's to check for SS
    var unum = 1; // unit number, [1] is heat exchanger in this lab
    //
    // found need 2 * processUnits[unum].residenceTime to reach SS
    // when starting up at system T in = 350 K
    // and now HX res time arbitrarily set to = RXR res time
    if (this.simTime >= this.oldSimTime + 2 * processUnits[unum].residenceTime) {
      var nn = processUnits[unum].numNodes;
      var hlt = 1.0e5 * processUnits[unum]['Thot'][nn].toFixed(1);
      var hrt = 1.0e1 * processUnits[unum]['Thot'][0].toFixed(1);
      var clt = 1.0e-3 * processUnits[unum]['Tcold'][nn].toFixed(1);
      var crt = 1.0e-7 * processUnits[unum]['Tcold'][0].toFixed(1);
      // NOTE: SScheck = hlt0hrt0.clt0crt0 << 16 digits, 4 each for 4 end T's
      var SScheck = hlt + hrt + clt  + crt;
      var oldSScheck = processUnits[unum].SScheck;
      if (SScheck == oldSScheck) {
        // set ssFlag
        simParams.ssFlag = true;
        // WARNING - call in line below has alerts - TESTING ONLY
        // processUnits[unum].checkSSvalues(); // WARNING - has alerts - TESTING ONLY
      } // end if (SScheck == oldSScheck)
      // save current values as the old values
      // processUnits[unum]['SScheck'] = SScheck;
      processUnits[unum].SScheck = SScheck;
      simParams.oldSimTime = simParams.simTime;
    } // END OF if (simParams.simTime >= simParams.oldSimTime + processUnits[unum]['residenceTime'])

  }, // END OF checkForSteadyState()

}; // END var simParams
