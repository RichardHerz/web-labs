/*
  Design, text, images and code by Richard K. Herz, 2017-2020
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

let interfacer = {
  // OBJECT interfacer handles UI controls and input fields in HTML
  // unit objects may write directly to output fields or other elements

  timerID : 0, // used by setInterval & clearInterval in runThisLab & resetThisLab

  runThisLab : function() {
    // TOGGLES between running (button label 'Pause') & paused (button label 'Run')
    // REQUIRES run button id='button_runButton' & display labels be 'Run' & 'Pause'
    // USES OBJECTS simParams, controller
    //
    let el = document.getElementById('button_runButton');
    if (el.value == 'Run') {

      // button label is 'Run' & was clicked, so start running
      controller.resetSSflagsFalse(); // gets set true when sim reaches steady state

      if (simParams.labType == 'Dynamic') {
        // change button label to 'Pause'
        el.value = 'Pause'; // REQUIRES run button id="button_runButton"
        // repeat calling updateProcess to run Dynamic labtype - no () after .updateProcess
        this.timerID = setInterval(controller.updateProcess,simParams.updateDisplayTimingMs);
      } else {
        // lapType is Static or other non-Dynamic
        // update process once
        controller.updateProcess();
      }

      simParams.updateRunCount();

    } else {
      // button label is 'Pause' & was clicked, so stop running
      // sim will stop after last updateProcess and its updateDisplay finishes
      clearInterval(this.timerID);
      el.value = 'Run'; // REQUIRES run button id="button_runButton"
    } // END OF if (el.value == 'Run')

  }, // END OF function runThisLab

  resetThisLab : function() {
    // REQUIRES run button id='button_runButton' & display labels be 'Run' & 'Pause'
    // CALLED BY UI RESET BUTTON DEFINED IN HTML
    // USES OBJECTS simParams, controller
    //
    clearInterval(this.timerID);
    controller.resetSimTime();
    // reset all units
    for (let u in processUnits) {
      processUnits[u].reset();
    }
    controller.resetSSflagsFalse();
    controller.updateDisplay();
    let el = document.getElementById('button_runButton');
    el.value = 'Run';
    // do NOT update process nor display again here (will take one step)

    let txt = 'The Reactor Lab provides interactive '
      + 'simulations for active learning. The web site is '
      + '<a href="https://reactorlab.net/">ReactorLab.net</a>. '
      + 'The lab is provided free of charge and code is open source and available '
      + 'at <a href="https://github.com/RichardHerz">our GitHub site</a>. '
      + 'The code is structured to allow fast construction of new simulations of reactors and other systems. '
      + 'The author of Reactor Lab is Richard K. Herz, emeritus professor of chemical engineering '
      + 'at the University of California, San Diego, <a href="https://ucsd.edu/">UCSD</a>, '
      + 'in the <a href="http://nanoengineering.ucsd.edu/">Department of NanoEngineering</a>. '
      + 'Please let us know if you use the Lab or the code. Thanks! '
      + '<a href="mailto:rherz@ucsd.edu?subject=Reactor Lab">rherz@ucsd.edu</a>';
    document.getElementById('div_rlnoticetext').innerHTML = txt;
    // see web_labs_CSS/common.css file for formatting on page

  }, // END OF function resetThisLab

  getInputValue : function(u,v) {

    // console.log('--- enter interfacer getInputValue ---');

    // GET INPUT VALUE - CALLED IN UNITS updateUIparams()
    // USES OBJECT processUnits

    // XXX TEST DOT NOTATION
    // let varInputID = processUnits[u]['dataInputs'][v]; // ORIG WORKS
    // let varInputID = processUnits[u].dataInputs[v]; // THIS WORKS
    // processUnits[u].dataInputs.v does *NOT* work

    let varInputID = processUnits[u]['dataInputs'][v];

    // console.log('  varInputID = ' + varInputID);

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

        // console.log('   varValue = ' + varValue);

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

        // console.log('  default varValue = ' + varValue);

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
    for (let u in processUnits) {
      processUnits[u].updateUIparams();
    }
  },  // END OF function updateUIparams

  initializeQuizVars : function(u,qv) {
    // inputs are unit index, array of quiz variable indexes in that unit
    let v;
    let vmin;
    let vmax;
    let qval;
    this.quizInputArray = initializeQuizArray(); // subfunction of this function
    for (let n in qv) {
      v = qv[n];
      processUnits[u]['dataQuizInputs'][v] = true; // checked in interfacer.copyData
      vmin = processUnits[u]['dataMin'][v];
      vmax = processUnits[u]['dataMax'][v];
      if (vmin < 0) {
        // assume variable with potentially negative values is heat of reaction
        // use a log-normal distribution in order to shift distribution
        // towards negative (exothermic) values
        //
        // WARNING: this causes problem when quiz var is negative reaction
        //          order or negative temperature (in F or C)
        //          alternative is to check var name but that can change...
        //
        qval = randomLogNormal(vmin,vmax); // see subfunction below
      } else {
        // other variables get a uniform distribution between vmin and vmax
        qval = vmin + Math.random() * (vmax - vmin);
      }
      // format number so don't get zillions of places after decimal place
      // digits in small numbers won't affect answer check & will format on display
      if (Math.abs(qval) >= 10){
        qval = Math.round(qval);
      } else if (Math.abs(qval) >= 1) {
        qval = qval.toFixed(1); // toFixed returns qval as STRING
        qval = Number(qval); // so convert back to Number
      }
      this.quizInputArray[u][v] = qval;
    }

    function initializeQuizArray() {
      // initialize a 2D array to hold quiz input values
      // first index length must be fixed and here is number of process units
      // second index length can be changed later and
      // values are undefined or quiz input value
      let arrayStub = [];
      for (let u in processUnits) {
        arrayStub[u] = [];
      }
      return arrayStub;
    } // END OF sub function initializeQuizArray

    function randomLogNormal(vmin,vmax) {
      // return values will have close to a log-normal distribution
      // skewed toward vmin >> see Box-Muller transform
      let sigma = 0.5; // std deviation
      let mu = 0.5; // mean
      let u; let v; let x; let y;
      let zmax = 5;
      let z = 1 + zmax;
      // z's will have a log-normal distribution but clipped at zmax value
      // so z's will be 0 to zmax skewed towards zero
      while (z > zmax) {
        u = Math.random();
        v = Math.random();
        // u's and v's have uniform distributions
        x = Math.sqrt( -2.0 * Math.log(u) ) * Math.cos(2.0 * Math.PI * v);
        // x's have a normal distribution
        y = x*sigma + mu;
        z = Math.exp(y);
      }
      // return random value between vmin and vmax with log-normal distribution
      return (z/zmax)*(vmax - vmin) + vmin;
    } // END OF sub function randomLogNormal

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
      // heats of rxn can be < 0 so compare absolute values
      let absVarAnswer = Math.abs(varAnswer);
      let absVarValue = Math.abs(varValue);
      if ((absVarAnswer >= 0.8 * absVarValue) && (absVarAnswer <= 1.2 * absVarValue)){
        alert("Good work! " + txt);
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

    // if oldDataFlag is true, return so script will not continue
    // if simParams.oldDataFlag not set by lab, script will continue
    if (simParams.oldDataFlag == 1) {
      return;
    }

    // if sim is running, pause the sim
    // copy grabs what is showing on plot when copy button clicked
    // so want user to be able to take screenshot to compare with data copied
    // this will let last updateDisplay of updateProcess finish before sim pauses
    let el = document.getElementById('button_runButton');
    if (el.value == 'Pause') {
      // button label is 'Pause', lab is running, call runThisLab to toggle to stop running
      interfacer.runThisLab(); // toggles running state
    }

    let u; // unit index
    let v; // variable index
    let p; // points index
    let numUnits;
    let numVar;
    let varValue;
    let varIndex; // index of selected variable in unit local data array
    let varUnitIndex; // index of unit from which variable is to be obtained
    let tText; // we will put the data into this variable
    let tItemDelimiter = ', &nbsp;';
    let tVarLen = plotInfo[plotIndex]['var'].length; // length for loops below

    tText = '<p>Web Labs at ReactorLab.net &nbsp; &gt; &nbsp;' + simParams.title + '</p>';

    // list current input values

    let timeTOround = controller.simTime;
    let timeUnits = '&nbsp;' ;
    if (simParams.simTimeUnits) {
      timeUnits += simParams.simTimeUnits;
    } else {
      // add default seconds
      timeUnits += 's';
    }
    if (simParams.labType == 'Dynamic') {
      tText += '<p>Simulation time of data capture = ' + timeTOround.toFixed(3)
               + timeUnits + '<br>';
    } else {
      // WARNING: must have simParams vars imTimeStep = 1 and simStepRepeats = 1
      // for simtime to equal # runs between resets
      tText += '<p>Total runs at time of data capture = ' + timeTOround.toFixed(0) + '<br>';
    }

    tText += 'Values of input parameters at time of data capture:<br>';
    // list inputs for all units since, other units may affect these results
    for (u in processUnits) {
      tText += '* ' + processUnits[u]['name'] + '<br>';
      numVar = processUnits[u]['varCount'];
      for (v = 0; v <= numVar; v++) { // NOTE: <=
        if (processUnits[u]['dataQuizInputs']) {
          // unit has array dataQuizInputs, now check which vars are quiz vars
          if (processUnits[u]['dataQuizInputs'][v]) {
            // note 'answered' evaluates as true, so need to test for 'answered'
            if (processUnits[u]['dataQuizInputs'][v] == 'answered'){
              // is a ANSWERED quiz variable - display input value
              varValue = processUnits[u]['dataValues'][v];
              varValue = this.formatNumToNum(varValue);
              tText += '&nbsp; &nbsp;' + processUnits[u]['dataHeaders'][v] + ' = '
                      + varValue + '&nbsp;'
                      + processUnits[u]['dataUnits'][v] + ' * ANSWERED * <br>';
            } else {
            // is an UNKNOWN quiz variable - do not display input value
            tText += '&nbsp; &nbsp;' + processUnits[u]['dataHeaders'][v] + ' = '
                    + '???' + '&nbsp;'
                    + processUnits[u]['dataUnits'][v] + ' * UNKNOWN * <br>';
            }
          } else {
            // is not a quiz variable - display input value
            varValue = processUnits[u]['dataValues'][v];
            varValue = this.formatNumToNum(varValue);
            tText += '&nbsp; &nbsp;' + processUnits[u]['dataHeaders'][v] + ' = '
                    + varValue + '&nbsp;'
                    + processUnits[u]['dataUnits'][v] + '<br>';
          }
        } else {
            // unit does NOT have array dataQuizInputs, so show all input values
            varValue = processUnits[u]['dataValues'][v];
            varValue = this.formatNumToNum(varValue);
            tText += '&nbsp; &nbsp;' + processUnits[u]['dataHeaders'][v] + ' = '
                    + varValue + '&nbsp;'
                    + processUnits[u]['dataUnits'][v] + '<br>';
        }
      }
    }
    tText += '</p>';

    tText += '<p>' + plotInfo[plotIndex]['title'] + '</p>';

    // NOTE: plotInfo object for lab has varShow option for each variable listed but
    // copyData tabulates all variables in plotInfo regardless of the varShow value
    // FROM process_plot_info.js
    //    varShow values are 'show' to show on plot and legend,
    //    'tabled' to not show on plot nor legend but list in copy data table
    //    and any other value, e.g., 'hide' to not show on plot but do show in legend
    //    varShow value can be changed by javascript if want to show/hide curve with checkbox
    //    e.g., plotInfo[pnum]['varShow'][vnum] = 'show';

    // data values must be numbers for .toFixed(2) to work, use Number() conversion
    // when getting values from input fields
    //    index 1 specifies the variable [0 to numVars-1],
    //    index 2 specifies the data point pair [0 to & including numPlotPoints]
    //    index 3 specifies x or y in x,y data point pair [0 & 1]

    // initiate string that holds the data table
      tText += '<p>';

    let plotType = plotInfo[plotIndex]['type']; // profile or strip or single
    let dataName = plotType + 'Data'; // profileData or stripData
    if ((plotType == 'profile') || (plotType == 'strip')) {
      // column headers
      tText += '<p>';
      // first, x-axis variable name for table
      tText += plotInfo[plotIndex]['xAxisTableLabel'] + tItemDelimiter;
      // then other column names for y-axis variables
      for (v = 0; v < tVarLen; v++) {
        tText += plotInfo[plotIndex]['varLabel'][v];

        // tText += ' (' + plotInfo[plotIndex]['varDataUnits'][v] + ')';
        let tUnits = plotInfo[plotIndex]['varDataUnits'][v];
        if (tUnits != '') {
          tText += ' (' + plotInfo[plotIndex]['varDataUnits'][v] + ')';
        }

        if (v < (tVarLen - 1)) {
          tText += tItemDelimiter;
        }
      }
      tText += '</p>';
      // repeat to make each line in table for each data point
      // all unit vars in one plot must have same data array length
      varUnitIndex = plotInfo[plotIndex]['varUnitIndex'][0];
      let thisNumPts = processUnits[varUnitIndex][dataName][0].length;
      //
      for (p = 0; p < thisNumPts; p++) {
        // first get x value in [p][0], get it from ['var'][0]
        // x values should be same for all units for this plot
        varIndex = plotInfo[plotIndex]['var'][0];
        varUnitIndex = plotInfo[plotIndex]['varUnitIndex'][0];
        tText += formatNum(processUnits[varUnitIndex][dataName][varIndex][p][0]) + tItemDelimiter;
          // get y value for each variable in [p][1]
          for (v = 0; v < tVarLen; v++) {
            varIndex = plotInfo[plotIndex]['var'][v];
            varUnitIndex = plotInfo[plotIndex]['varUnitIndex'][v];
            tText += formatNum(processUnits[varUnitIndex][dataName][varIndex][p][1]); // [p][1] is y value
            if (v < (tVarLen - 1)) {tText += tItemDelimiter;}
          }
        tText += '<br>'; // use <br> not <p> or get empty line between each row
      }
    } else if (plotType == 'single'){
      varUnitIndex = plotInfo[plotIndex]['varUnitIndex'][0];
      let dataName = 'singleData';
      let thisNumPts = processUnits[varUnitIndex][dataName][0].length;
      tVarLen = processUnits[varUnitIndex].singleData.length;
      tVarLen = tVarLen - 1; // assume runCount is last & is special col 1
      // column headers
      tText += '<p>';
      // first, run count
      tText += 'run #' + tItemDelimiter;
      // then other column names for y-axis variables
      for (v = 0; v < tVarLen; v++) {
        if (processUnits[varUnitIndex]['dataSwitcher'][v] == 1) {
          tText += processUnits[varUnitIndex]['dataHeaders'][v];
          let tUnits = processUnits[varUnitIndex]['dataUnits'][v];
          if (tUnits != '') {
            tText += ' (' + tUnits + ')';
          }
          if (v < (tVarLen - 1)) {
            tText += tItemDelimiter;
          }
        } // END OF if (processUnits[varUnitIndex]['dataSwitcher'][v] = 1)
      } // END OF for (v = 0; v < tVarLen; v++)
      tText += '</p>';
      // repeat to make each line in table for each data point
      // all unit vars in one plot must have same data array length
      for (p = 0; p < thisNumPts; p++) {
        // in first column, list the run count (formatNum throws error for it)
        tText += processUnits[varUnitIndex][dataName][tVarLen][p][0] + tItemDelimiter;
        // for lab type 'single' get x value for each variable in [p][0]
        for (v = 0; v < tVarLen; v++) {
          if (processUnits[varUnitIndex]['dataSwitcher'][v] == 1) {
            tText += formatNum(processUnits[varUnitIndex][dataName][v][p][0]);
            if (v < (tVarLen - 1)) {tText += tItemDelimiter;}
          }
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
    let dataWindow = window.open('', 'Copy data',
          'height=600, left=20, resizable=1, scrollbars=1, top=40, width=600');
    //
    // NOTE: window.open VERSION BELOW OPENS NEW TAB IN SAME BROWSER WINDOW
    //       NEED TO ADD TOOLTIP TO BTN AND/OR TEXT OR LINK ON COPY DATA TAB...
    // let dataWindow = window.open('',
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
  }, // END of function formatNumToNum

}; // END OF OBJECT interfacer
