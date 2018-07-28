/*
  Design, text, images and code by Richard K. Herz, 2017-2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// ----------- HANDLE UI CONTROLS & INPUT FIELDS ------------------

function CheckRunThisLab() {
  console.log('enter CheckRunThisLab');
  simParams.toggleRunningFlag(); // toggle runningFlag true-false
  console.log('runningFlag = ' + simParams.runningFlag);
  let runningFlag = simParams.runningFlag;
  if (runningFlag) {
    console.log('if (runningFlag) is true');
    // start sim running again
    simParams.ssFlag = false; // unit sets true when sim reaches steady state
    button_runButton.value = 'Pause'; // REQUIRES run button id="button_runButton"
    console.log('just before: controller.runSimulation;');
    controller.runSimulation();
    // simParams.updateRunCount();
  } else {
    console.log('if (runningFlag) is NOT true');
    // // sim will stop after last updateProcess and its updateDisplay finishes
    // // so change run button label from pause to run
    button_runButton.value = 'Run'; // REQUIRES run button id="button_runButton"
  }
} // END OF function CheckRunThisLab

// HANDLE RUN-PAUSE BUTTON CLICK
function runThisLab() {
  console.log('enter runThisLab;');
  // uses object simParams from file process_units.js
  // CALLED BY UI RUN-PAUSE BUTTON DEFINED IN HTML
  // TOGGLE runningFlag FIRST before doing stuff below
  simParams.toggleRunningFlag(); // toggle runningFlag true-false
  // TOGGLE runningFlag FIRST before doing stuff below
  let runningFlag = simParams.runningFlag;
  if (runningFlag) {
    // start sim running again
    simParams.ssFlag = false; // unit sets true when sim reaches steady state
    button_runButton.value = 'Pause'; // REQUIRES run button id="button_runButton"
    console.log('just before: controller.runSimulation;');
    controller.runSimulation();
    simParams.updateRunCount();
  } else {
    // sim will stop after last updateProcess and its updateDisplay finishes
    // so change run button label from pause to run
    button_runButton.value = 'Run'; // REQUIRES run button id="button_runButton"
  }
} // END OF function runThisLab

// HANDLE RESET BUTTON CLICK
function resetThisLab() {
  // uses object simParams from file process_units.js
  // REQUIRES BELOW that run button id="button_runButton"
  simParams.stopRunningFlag();
  simParams.resetSimTime();
  simParams.ssFlag = false; // unit sets true when sim reaches steady state
  // reset all units
  let numUnits = Object.keys(processUnits).length; // number of units
  for (n = 0; n < numUnits; n += 1) {
    processUnits[n].reset();
  }
  controller.updateDisplay();
  button_runButton.value = 'Run'; // REQUIRES run button id="button_runButton"
  // do NOT update process nor display again here (will take one step)
} // END OF function resetThisLab

// GET INPUT VALUES FROM INPUT FIELDS - CALLED IN UNITS updateUIparams()
function getInputValue(pUnitIndex,pVar) {
  let varInputID = processUnits[pUnitIndex]['dataInputs'][pVar];
  let varInitial = processUnits[pUnitIndex]['dataInitial'][pVar];
  let varMin = processUnits[pUnitIndex]['dataMin'][pVar];
  let varMax = processUnits[pUnitIndex]['dataMax'][pVar];
  let varValue = 0; // set below
  // get the contents of the input and handle
  if (document.getElementById(varInputID)) {
    // the input exists so get the value and make sure it is within range
    varValue = document.getElementById(varInputID).value;
    varValue = Number(varValue); // force any number as string to numeric number
    if (isNaN(varValue)) {varValue = varInitial;} // handle e.g., 259x, xxx
    if (varValue < varMin) {varValue = varMin;}
    if (varValue > varMax) {varValue = varMax;}
    document.getElementById(varInputID).value = varValue;
  } else {
    // this 'else' is in case there is no input on the web page yet in order to
    // allow for independence and portability of this process unit
    varValue = varInitial;
  }
  return varValue
} // end of getInputValue()
