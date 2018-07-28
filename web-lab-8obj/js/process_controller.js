/*
  Design, text, images and code by Richard K. Herz, 2017-2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// NOTE: move window.onload to <script> tag in HTML file
// since object controller not defined when above or below controller{} here
// // DISPLAY INITIAL STATE ON OPEN WINDOW
// window.onload = controller.openThisLab; // can NOT use () after openThisLab

let controller = {

  // OBJECT controller contains functions that run the simulation time stepping

  // SUMMARY OF DEPENDENCIES
  //
  // function interface.runThisLab() USES FROM THIS OBJECT function runSimulation()
  //
  // USES in object interface the function interface.resetThisLab()
  //
  // USES in object simParams the following:
  //    function updateCurrentRunCountDisplay()
  //    function checkForSteadyState()
  //    function updateSimTime()
  //    variables runningFlag, ssFlag, simStepRepeats, processUnits
  //    variables updateDisplayTimingMs
  //
  // USES object plotInfo defined in file process_plot_info.js
  //
  // USES in object plotter the functions
  //    getPlotData(), plotPlotData(), plotArrays.initialize()
  //
  // USES in file process_spacetime.js the function plotColorCanvasPlot()

  openThisLab : function() {
    // initialize variables in each process unit
    let numUnits = Object.keys(processUnits).length; // number of units
    for (n = 0; n < numUnits; n += 1) {
      processUnits[n].initialize();
    }
    // initialize plotInfo to define plots after initialize units
    plotInfo.initialize();
    // initialize plot arrays after initialize plotInfo
    plotter.plotArrays.initialize();
    interface.resetThisLab(); // defined in file process_interface.js
    simParams.updateCurrentRunCountDisplay();
  }, // END OF function openThisLab

  runSimulation : function() {

    // CALLED BY function runThisLab ON CLICK OF RUN-PAUSE BUTTON

    // HERE, THE INTEGRATION TIME STEP SIZE MUST BE CONSTANT WITHIN ONE DISPLAY
    // INTERVAL TO MAINTAIN CORRESPONDENCE BETWEEN SIM TIME AND REAL TIME
    // FOR A DIFFERENT CASE WHERE THE INTEGRATION TIME STEP SIZE CAN VARY
    // BETWEEN updateProcessUnits YOU NEED
    // THE MORE COMPLEX TIMING METHOD USED IN dynamic-process-v2.livecode

    // updateDisplayTimingMs is real time milliseconds between display updates
    let updateDisplayTimingMs = simParams.updateDisplayTimingMs;
    let startDate = new Date(); // need this here
    let startMs;
    let currentMs;
    let elapsedMs;
    // updateMs is computed below in function updateProcess to be real time
    // between finish last display update and start next update process
    let updateMs = 0; // initialize as zero for first call immediately below

    // first call to updateProcess, which then calls itself
    // use setTimeout, since updateProcess by itself does not work
    // NOTE: updateProcess() is a sub function of controller.runSimulation()
    // and therefore do not use prefix of this. or controller.
    // () optional at end of updateProcess here
    setTimeout(updateProcess(), updateMs);

    function updateProcess() {

      let runningFlag = simParams.runningFlag;
      if (!runningFlag) {
        // exit if runningFlag is not true
        // runningFlag can become not true by click of RUN-PAUSE, RESET or COPY DATA buttons
        return;
      }

      // update simTime = simulation time elapsed
      simParams.updateSimTime();

      // do NOT return here when ssFlag goes true at steady statement
      // because then simTime will not update since this function will not call itself again
      // DO return at top of updateProcessUnits and updateDisplay which are called below here
      // such that this updateProcess function always completes normally and calls itself again

      // get time at start of repeating updateProcessUnits
      startDate = new Date(); // need this here
      startMs = startDate.getTime();

      // repeating updateProcessUnits must finish before
      // latest real time at which updateDisplay must occur in order
      // to maintain correspondence between sim time and real time
      //

      // NOTE: updateProcessUnits() and updateDisplay() are members
      // of top level of controller object and not of this subfunction
      // updateProcess() inside controller.runSimulation()
      // which calls them, so need controller. prefix
      //controller.updateProcessUnits() & controller.updateDisplay()

      for (i = 0; i < simParams.simStepRepeats; i += 1) {
        controller.updateProcessUnits();
      }

      // get time at end of repeating updateProcessUnits and call
      // to updateDisplay from updateDisplay function return value
      currentMs = controller.updateDisplay();

      // Adjust wait until next updateProcess to allow for time taken
      // to do updateProcessUnits and updateDisplay.
      // In order to respond to user input, do not need updateMs > 0.
      // BUT DO NEED updateMs > 0 to keep sync between sim time and real time.
      elapsedMs = currentMs - startMs;
      updateMs = updateDisplayTimingMs - elapsedMs;

      // // DISPLAY TIMING DATA DURING DEVELOPMENT - PERCENT TIME IDLE
      // // NEED TO EDIT INDEX.HTML TO ACTIVATE "field_output_field"
      // let tIdleTime = 100*(1-elapsedMs/updateMs);
      // tIdleTime = Number(tIdleTime).toPrecision(2);
      // document.getElementById("field_output_field").innerHTML = "% idle = " + tIdleTime + "&nbsp;&nbsp;";

      // END updateProcess WITH CALL TO ITSELF AFTER updateMs WAIT
      setTimeout(updateProcess, updateMs);  // updateMs

    } // END OF function updateProcess (inside function runSimulation)

  }, // END OF function runSimulation

  updateProcessUnits : function() {

    // DO COMPUTATIONS TO UPDATE STATE OF PROCESS
    // step all units but do not display

    if (simParams.ssFlag) {
      // exit if simParams.ssFlag true
      // checkForSteadyState() at end of updateDisplay() in this file
      return;
    }

    let numUnits = Object.keys(processUnits).length; // number of units

    // FIRST, have all units update their unit input connections
    for (n = 0; n < numUnits; n += 1) {
      processUnits[n].updateInputs();
    }

    // NOTE: UI params are updated whenever UI changes by HTML input actions

    // SECOND, have all units update their state
    for (n = 0; n < numUnits; n += 1) {
        processUnits[n].updateState();
    }

  }, // END OF function updateProcessUnits

  updateDisplay : function() {

    if (simParams.ssFlag) {
      // exit if simParams.ssFlag true
      // BUT FIRST MUST DO THIS (also done below at end normal update)
      // RETURN REAL TIME OF THIS DISPLAY UPDATE (milliseconds)
      // or, if do not do here, simTime will race ahead
      let thisDate = new Date();
      let thisMs = thisDate.getTime();
      return thisMs;
    }

    let numUnits = Object.keys(processUnits).length; // number of units

    // display all units but do not step
    for (n = 0; n < numUnits; n += 1) {
      processUnits[n].updateDisplay();
    }

    // GET AND PLOT ALL PLOTS defined in object plotInfo in process_plot_info.js
    let numPlots = Object.keys(plotInfo).length;
    numPlots = numPlots - 1; // subtract method initialize(), which is counted in length
    let p; // used as index
    let data;
    for (p = 0; p < numPlots; p += 1) {
      if (plotInfo[p]['type'] == 'canvas') {
        // space-time, color-canvas plot
        plotColorCanvasPlot(p); // defined in file process_spacetime.js
      } else {
        // profile (static x,y) or strip chart (scolling x,y)
        data = plotter.getPlotData(p);
        plotter.plotPlotData(data,p);
      }
    }

    // check and set simParams.ssFlag to true if at steady state
    // do this here in updateDisplay rather than each process update
    // so that don't suspend before a final display update of the steady state
    simParams.checkForSteadyState();

    // RETURN REAL TIME OF THIS DISPLAY UPDATE (milliseconds)
    let thisDate = new Date();
    let thisMs = thisDate.getTime();
    return thisMs;

  },  // END OF function updateDisplay

  updateUIparams : function() {

    // User changed an input
    // Update user-entered inputs from UI to ALL units.
    // Could be called from onclick or onchange in HTML element, if desired.
    // Alternative: in HTML input tag onchange, send updateUIparams() to
    // specific unit involved in that input.

    let numUnits = Object.keys(processUnits).length; // number of units
    for (n = 0; n < numUnits; n += 1) {
      processUnits[n].updateUIparams();
    }

  }  // END OF function updateUIparams

} // END OF OBJECT controller
