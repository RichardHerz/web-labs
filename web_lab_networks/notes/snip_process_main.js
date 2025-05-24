function updateInputsAndState() {
  // called by button Step on this web page
  const nmax = 1;
  for (let n = 0; n < nmax; n++) {
    runUpdateInputs();
    runUpdateState();
  }
} // END OF FUNCTION runInitialize

function runUpdateInputs() {
  // called by button upIn on this web page
  for (let u in processUnits) {
    console.log('>>>> run  updateInputs(), u = ' + u);
    console.log('  unitID = ' + processUnits[u].unitID);
    processUnits[u].updateInputs(u);
  }
} // END OF FUNCTION runUpdateInputs 

function runUpdateState() {
  // called by button upSt on this web page
  for (let u in processUnits) {
    console.log('>>>> run updateState(), u = ' + u);
    console.log('  unitID = ' + processUnits[u].unitID);
    // processUnits[u].getPortCount();
    processUnits[u].updateState(u);
  }
} // END OF FUNCTION runUpdateState 
