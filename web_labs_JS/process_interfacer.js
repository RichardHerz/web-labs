/*
  Design, text, images and code by Richard K. Herz, 2017-2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

let interfacer = {
  // OBJECT interfacer handles UI controls and input fields in HTML
  // unit objects may write directly to output fields or other elements

  timerID : 0, // used by setInterval & clearInterval in runThisLab & resetThisLab

  quizInputArray : [],

  runThisLab : function() {
    // TOGGLES between running (button label 'Pause') & paused (button label 'Run')
    // REQUIRES run button id='button_runButton' & display labels be 'Run' & 'Pause'
    // USES OBJECTS simParams, controller
    //
    let el = document.getElementById('button_runButton');
    if (el.value == 'Run') {

      // button label is 'Run' & was clicked, so start running
      controller.ssFlag = false; // unit sets true when sim reaches steady state
      simParams.updateRunCount();

      if (simParams.labType == 'Dynamic') {
        // change button label to 'Pause'
        el.value = 'Pause'; // REQUIRES run button id="button_runButton"
        // repeat calling updateProcess to run lab - use no () after .updateProcess
        this.timerID = setInterval(controller.updateProcess,simParams.updateDisplayTimingMs);
      } else {
        // lapType is Single or Profile
        // update process once
        controller.updateProcess();
      }

    } else {
      // button label is 'Pause' & was clicked, so stop running
      // sim will stop after last updateProcess and its updateDisplay finishes
      clearInterval(this.timerID);
      el.value = 'Run'; // REQUIRES run button id="button_runButton"
    }
  }, // END OF function runThisLab

  resetThisLab : function() {
    // REQUIRES run button id='button_runButton' & display labels be 'Run' & 'Pause'
    // CALLED BY UI RESET BUTTON DEFINED IN HTML
    // USES OBJECTS simParams, controller
    //
    clearInterval(this.timerID);
    controller.resetSimTime();
    // reset all units
    let numUnits = Object.keys(processUnits).length; // number of units
    for (n = 0; n < numUnits; n += 1) {
      processUnits[n].reset();
    }
    controller.resetSSflagsFalse();
    controller.updateDisplay();
    let el = document.getElementById('button_runButton');
    el.value = 'Run';
    // do NOT update process nor display again here (will take one step)
  }, // END OF function resetThisLab

  getInputValue : function(u,v) {
    // GET INPUT VALUE - CALLED IN UNITS updateUIparams()
    // USES OBJECT processUnits
    let varInputID = processUnits[u]['dataInputs'][v];
    let varDefault = processUnits[u]['dataDefault'][v];
    let varMin = processUnits[u]['dataMin'][v];
    let varMax = processUnits[u]['dataMax'][v];
    let varValue; // set below
    // have to get any quiz vars from array and not html input field
    let qflag = false;
    if (processUnits[u]['dataQuizInputs']) {
      // unit has array dataQuizInputs, now check which vars are quiz vars
      if (processUnits[u]['dataQuizInputs'][v]) {
        // is quiz variable - do not display input value
        qflag = true;
        varValue = this.quizInputArray[u][v];
      }
    }
    if (qflag == false) {
      // not a quiz variable
      // get the contents of the input from html input field
      if (document.getElementById(varInputID)) {
        // the input exists so get the value and make sure it is within range
        varValue = document.getElementById(varInputID).value;
        varValue = Number(varValue); // force any number as string to numeric number
        if (isNaN(varValue)) {varValue = varDefault;} // handle e.g., 259x, xxx
        if (varValue < varMin) {varValue = varMin;}
        if (varValue > varMax) {varValue = varMax;}
        //
        varValue = this.formatNumToNum(varValue);
        // OK to put formatted number as STRING returned by toExponential() into field...
        document.getElementById(varInputID).value = varValue;
        // BUT need to return value as NUMBER to calling unit...
        varValue = Number(varValue);
      } else {
        // this 'else' is in case there is no input on the web page yet in order to
        // allow for independence and portability of this process unit
        varValue = varDefault;
      }
    }
    return varValue;
  }, // END of getInputValue()

  updateUIparams : function() {
    // User changed an input
    // Update user-entered inputs from UI to ALL units.
    // Could be called from onclick or onchange in HTML element, if desired.
    // Alternative: in HTML input tag onchange, send updateUIparams() to
    // specific unit involved in that input.
    //
    let numUnits = Object.keys(processUnits).length; // number of units
    for (n = 0; n < numUnits; n += 1) {
      processUnits[n].updateUIparams();
    }
  },  // END OF function updateUIparams

  initializeQuizArrays : function() {
    // called by controller.openThisLab
    // initialize a 2D array to hold quiz input values
    // first index length must be fixed and here is number of process units
    // second index length can be changed later and
    // values are undefined or quiz input value
    let arrayStub = [];
    let numUnits = Object.keys(processUnits).length;
    for (u = 0; u < numUnits; u += 1) {
      arrayStub[u] = [];
    }
    return arrayStub;
  }, // END OF function initializeQuizArrays

  initializeQuizVars : function(u,qv) {
    // inputs are unit index, array of quiz variable indexes in that unit
    let v;
    let qval;
    for (n = 0; n < qv.length; n += 1) {
      v = qv[n];
      processUnits[u]['dataQuizInputs'][v] = true; // checked in interfacer.copyData
      qval = processUnits[u]['dataMin'][v] // line continues below...
        + Math.random() // line continues below...
        * (processUnits[u]['dataMax'][v] - processUnits[u]['dataMin'][v]);
      // XXX trouble with this for DelH heat of reaction - get ave = 0
      // format number so don't get zillions of places after decimal place
      // digits in small numbers won't affect answer check & will format on display
      if (Math.abs(qval) >= 10){
        qval = Math.round(qval);
      } else if (Math.abs(qval) >= 1) {
        qval = qval.toFixed(1); // toFixed returns qval as STRING
        qval = Number(qval); // so convert back to Number
      }
      // put u,v,qval into quizInputArray
      // and not html input field so user can't inspect html for qval
      this.quizInputArray[u][v] = qval;
    }
  }, // END OF function initializeQuizVars

  checkQuizAnswer : function(u,v) {
    // CALLED BY UI ??? BUTTONS OVERLAYING QUIZ VAR INPUT FIELDS
    // argument is process unit index, var index in unit's dataHeaders[]
    let txt;
    let varName = processUnits[u]['dataHeaders'][v];
    let inputFieldName = "input_field_" + varName;
    let varAnswer = prompt("Please enter value of " + varName + ": ");
    if (varAnswer == null || varAnswer == "") {
      txt = "User cancelled the prompt.";
    } else {
      varAnswer = Number(varAnswer);
      let varValue = this.quizInputArray[u][v];
      varValue = this.formatNumToNum(varValue);
      txt = "You entered: " + varAnswer + " correct is " + varValue;
      if ((varAnswer >= 0.8 * varValue) && (varAnswer <= 1.2 * varValue)){
        alert("Good! " + txt);
        // put the value in the input field
        let el = document.getElementById(processUnits[u]['dataInputs'][v]);
        el.value = varValue;
        // set the visiblity of overlay button to hidden
        let bname = "button_quiz_" + varName;
        document.getElementById(bname).style.visibility = "hidden";
        // change element value from true to 'answered' in order
        // to show value & mark as answered quiz variable in copyData table
        // note 'answered' evaluates as true, so need to test for 'answered'
        processUnits[u]['dataQuizInputs'][v] = 'answered';
        // put value into processUnits[u]['dataValues'][v] for copyData
        processUnits[u]['dataValues'][v] = varValue;
      } else {
        alert(varAnswer + " not within +/- 20%. Try again.");
      }
    }
  }, // END OF function checkQuizAnswer

  copyData : function(plotIndex) {
    // CALLED BY UI COPY DATA BUTTONS DEFINED IN HTML
    // copies data from plot to new browser tab or popup window - see below
    //
    // USES OBJECTS plotInfo, controller, interfacer, simParams
    // plotIndex is the index in object plotInfo of the desired plot to copy
    // USES internal function formatNum
    // REQUIRES run button id='button_runButton' & display labels be 'Run' & 'Pause'

    // if sim is running, pause the sim
    // copy grabs what is showing on plot when copy button clicked
    // so want user to be able to take screenshot to compare with data copied
    // this will let last updateDisplay of updateProcess finish before sim pauses
    let el = document.getElementById('button_runButton');
    if (el.value == 'Pause') {
      // button label is 'Pause', lab is running, call runThisLab to toggle to stop running
      interfacer.runThisLab(); // toggles running state
    }

    let n; // index
    let v; // variable index
    let k; // points index
    let numUnits;
    let numVar;
    let varValue;
    let varIndex; // index of selected variable in unit local data array
    let varUnitIndex; // index of unit from which variable is to be obtained
    let tText; // we will put the data into this variable
    let tItemDelimiter = ', &nbsp;';
    let tVarLabelLen = plotInfo[plotIndex]['varLabel'].length; // length for loops below

    tText = '<p>Web Labs at ReactorLab.net &nbsp; &gt; &nbsp;' + simParams.title + '</p>';

    // list current input values
    let timeTOround = controller.simTime;
    tText += '<p>Simulation time of data capture = ' + timeTOround.toFixed(3) + ' s <br>';
    tText += 'Values of input parameters at time of data capture:<br>';
    // list inputs for all units since, other units may affect these results
    numUnits = Object.keys(processUnits).length;
    for (n = 0; n < numUnits; n += 1) {
      tText += '* ' + processUnits[n]['name'] + '<br>';
      numVar = processUnits[n]['VarCount'];
      for (v = 0; v <= numVar; v += 1) { // NOTE: <=
        if (processUnits[n]['dataQuizInputs']) {
          // unit has array dataQuizInputs, now check which vars are quiz vars
          if (processUnits[n]['dataQuizInputs'][v]) {
            // note 'answered' evaluates as true, so need to test for 'answered'
            if (processUnits[n]['dataQuizInputs'][v] == 'answered'){
              // is a ANSWERED quiz variable - display input value
              varValue = processUnits[n]['dataValues'][v];
              varValue = this.formatNumToNum(varValue);
              tText += '&nbsp; &nbsp;' + processUnits[n]['dataHeaders'][v] + ' = '
                      + varValue + '&nbsp;'
                      + processUnits[n]['dataUnits'][v] + ' * ANSWERED * <br>';
            } else {
            // is an UNKNOWN quiz variable - do not display input value
            tText += '&nbsp; &nbsp;' + processUnits[n]['dataHeaders'][v] + ' = '
                    + '???' + '&nbsp;'
                    + processUnits[n]['dataUnits'][v] + ' * UNKNOWN * <br>';
            }
          } else {
            // is not a quiz variable - display input value
            varValue = processUnits[n]['dataValues'][v];
            varValue = this.formatNumToNum(varValue);
            tText += '&nbsp; &nbsp;' + processUnits[n]['dataHeaders'][v] + ' = '
                    + varValue + '&nbsp;'
                    + processUnits[n]['dataUnits'][v] + '<br>';
          }
        } else {
            // unit does NOT have array dataQuizInputs, so show all input values
            varValue = processUnits[n]['dataValues'][v];
            varValue = this.formatNumToNum(varValue);
            tText += '&nbsp; &nbsp;' + processUnits[n]['dataHeaders'][v] + ' = '
                    + varValue + '&nbsp;'
                    + processUnits[n]['dataUnits'][v] + '<br>';
        }
      }
    }
    tText += '</p>';

    tText += '<p>' + plotInfo[plotIndex]['title'] + '</p>';

    // column headers
    tText += '<p>';
    // first, x-axis variable name for table
    tText += plotInfo[plotIndex]['xAxisTableLabel'] + tItemDelimiter;
    // then other column names for y-axis variables
    for (v = 0; v < tVarLabelLen; v += 1) {
      tText += plotInfo[plotIndex]['varLabel'][v];
      tText += ' (' + plotInfo[plotIndex]['varDataUnits'][v] + ')';
      if (v < (tVarLabelLen - 1)) {
        tText += tItemDelimiter;
      }
    }
    tText += '</p>';

    // data values must be numbers for .toFixed(2) to work, use Number() conversion
    // when getting values from input fields
    //    index 1 specifies the variable [0 to numVars-1],
    //    index 2 specifies the data point pair [0 to & including numPlotPoints]
    //    index 3 specifies x or y in x,y data point pair [0 & 1]

    // initiate string that holds the data table
      tText += '<p>';

    let plotType = plotInfo[plotIndex]['type']; // profile or strip
    let dataName = plotType + 'Data'; // profileData or stripData
    if ((plotType == 'profile') || (plotType == 'strip')) {
      // repeat to make each line in table for each data point
      for (k = 0; k <= plotInfo[plotIndex]['numberPoints']; k += 1) {
        // first get x value in [k][0], get it from ['var'][0]
        // x values should be same for all units for this plot
        varIndex = plotInfo[plotIndex]['var'][0];
        varUnitIndex = plotInfo[plotIndex]['varUnitIndex'][0];
        tText += formatNum(processUnits[varUnitIndex][dataName][varIndex][k][0]) + tItemDelimiter;
          // get y value for each variable in [k][1]
          for (v = 0; v < tVarLabelLen; v += 1) {
            varIndex = plotInfo[plotIndex]['var'][v];
            varUnitIndex = plotInfo[plotIndex]['varUnitIndex'][v];
            tText += formatNum(processUnits[varUnitIndex][dataName][varIndex][k][1]); // [k][1] is y value
            if (v < (tVarLabelLen - 1)) {tText += tItemDelimiter;}
          }
        tText += '<br>'; // use <br> not <p> or get empty line between each row
      }
    } else {
      alert('unknown plot type');
      return;
    }

    // terminate string that holds the data table
    tText += '</p>';

    //
    // for window.open, see http://www.w3schools.com/jsref/met_win_open.asp
    //
    // NOTE: window.open VERSION BELOW OPENS NEW POPUP WINDOW - MAY GET HIDDEN
    //       BEHIND FULL SCREEN BROWSER IF USER CLICKS ON PAGE BEFORE POPUP OPENS
    dataWindow = window.open('', 'Copy data',
          'height=600, left=20, resizable=1, scrollbars=1, top=40, width=600');
    //
    // NOTE: window.open VERSION BELOW OPENS NEW TAB IN SAME BROWSER WINDOW
    //       NEED TO ADD TOOLTIP TO BTN AND/OR TEXT OR LINK ON COPY DATA TAB...
    // dataWindow = window.open('',
    //       'height=600, left=20, resizable=1, scrollbars=1, top=40, width=600');
    //

    dataWindow.document.writeln('<html><head><title>Copy data</title></head>' +
           '<body>' +
           tText +
           '</body></html>');
    dataWindow.document.close();

    function formatNum(nn) {
      // use this to get fixed number of digits in each column of table
      // returns number as STRING
      if (isNaN(nn)) {
        return nn;
      }
      // nn is a number so format with number methods
      if ((nn > 1000) || (nn < -1000)) {
        nn = nn.toExponential(4);
      } else if ((nn > 100) || (nn < -100)) {
       nn = nn.toFixed(2);
      } else if ((nn > 10) || (nn < -10)) {
        nn = nn.toFixed(3);
      } else if ((nn >= 1) || (nn < -1)) {
       nn = nn.toFixed(3);
      } else if ((nn > 0.01) || (nn < -0.01)) {
        nn = nn.toFixed(4);
      } else {
        nn = nn.toExponential(4);
      }
      return nn;
    } // END of sub function formatNum of copyData

  }, // END of function copyData

  formatNumToNum : function(varValue) {
    // returns number as NUMBER
    varValue = Number(varValue); // if string input, toExponential throws error
    if (varValue == 0) {
      // do nothing, otherwise in else if below, get 0.000e+00
      } else if (Math.abs(varValue) < 1.0e-3) {
        varValue = varValue.toExponential(2); // toExponential() returns STRING
      } else if (Math.abs(varValue) >= 9.999e+3) {
        varValue = varValue.toExponential(2); // toExponential() returns STRING
    }
    varValue = Number(varValue); // return as number
    return varValue;
  } // END of function formatNumToNum

}; // END OF OBJECT interfacer
