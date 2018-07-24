/*
  Design, text, images and code by Richard K. Herz, 2017-2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// SEE PLOT DEFINITIONS IN FILE process_plot_info.js

function copyData(plotIndex){
  // plotIndex is the index of the plotsObj object of the desired plot to copy
  // as specified in process_plot_info.js

  // if sim is running, pause the sim
  // copy grabs what is showing on plot when copy button clicked
  // so want user to be able to take screenshot to compare with data copied
  // this will let last updateDisplay of updateProcess finish before sim pauses 
  let runningFlag = simParams.runningFlag;
  if (runningFlag) {
    runThisLab(); // toggles running state
  }

  let n; // index
  let v; // variable index
  let k; // points index
  let numUnits;
  let numVar;
  let varIndex; // index of selected variable in unit local data array
  let varUnitIndex; // index of unit from which variable is to be obtained
  let tText; // we will put the data into this variable
  let tItemDelimiter = ', &nbsp;'
  let tVarLabelLen = plotsObj[plotIndex]['varLabel'].length; // length for loops below

  tText = '<p>Web Labs at ReactorLab.net &nbsp; &gt; &nbsp;' + simParams.title + '</p>';

  // list current input values
  tText += '<p>Simulation time of data capture = ' + simParams.simTime + ' s <br>';
  tText += 'Values of input parameters at time of data capture:<br>';
  // list inputs for all units since, other units may affect these results
  numUnits = Object.keys(processUnits).length;
  for (n = 0; n < numUnits; n += 1) {
    tText += '* ' + processUnits[n]['name'] + '<br>';
    numVar = processUnits[n]['VarCount'];
    for (v = 0; v <= numVar; v += 1) { // NOTE: <=
      tText += '&nbsp; &nbsp;' + processUnits[n]['dataHeaders'][v] + ' = '
              + processUnits[n]['dataValues'][v] + '&nbsp;'
              + processUnits[n]['dataUnits'][v] + '<br>';
    }
  }
  tText += '</p>';

  tText += '<p>' + plotsObj[plotIndex]['title'] + '</p>';

  // column headers
  tText += '<p>';
  // first, x-axis variable name for table
  tText += plotsObj[plotIndex]['xAxisTableLabel'] + tItemDelimiter;
  // then other column names for y-axis variables
  for (v = 0; v < tVarLabelLen; v += 1) {
    tText += plotsObj[plotIndex]['varLabel'][v];
    tText += ' (' + plotsObj[plotIndex]['varDataUnits'][v] + ')';
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

  let plotType = plotsObj[plotIndex]['type']; // profile or strip
  let dataName = plotType + 'Data'; // profileData or stripData
  if ((plotType == 'profile') || (plotType == 'strip')) {
    // repeat to make each line in table for each data point
    for (k = 0; k <= plotsObj[plotIndex]['numberPoints']; k += 1) {
      // first get x value in [k][0], get it from ['var'][0]
      // x values should be same for all units for this plot
      varIndex = plotsObj[plotIndex]['var'][0];
      varUnitIndex = plotsObj[plotIndex]['varUnitIndex'][0];
      tText += formatNum(processUnits[varUnitIndex][dataName][varIndex][k][0]) + tItemDelimiter;
        // get y value for each variable in [k][1]
        for (v = 0; v < tVarLabelLen; v += 1) {
          varIndex = plotsObj[plotIndex]['var'][v];
          varUnitIndex = plotsObj[plotIndex]['varUnitIndex'][v];
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

  // for window.open, see http://www.w3schools.com/jsref/met_win_open.asp
  dataWindow = window.open('', 'Copy data',
        'height=600, left=20, resizable=1, scrollbars=1, top=40, width=600');
  dataWindow.document.writeln('<html><head><title>Copy data</title></head>' +
         '<body>' +
         tText +
         '</body></html>');
  dataWindow.document.close();

 } // end of function copyData

 // ----- FUNCTIONS TO COPY DATA TO TABLE ---------

 function formatNum(n) {
   let nn = n;
   if ((nn > 1000) || (nn < -1000)) {
     nn = nn.toExponential(3);
   } else if ((nn > 100) || (nn < -100)) {
   	nn = nn.toFixed(1);
   } else if ((nn > 10) || (nn < -10)) {
     nn = nn.toFixed(2);
   } else if ((nn > 1) || (nn < -1)) {
   	nn = nn.toFixed(3);
   } else if ((nn > 0.01) || (nn < -0.01)) {
     nn = nn.toFixed(4);
   } else {
     nn = nn.toExponential(3);
   }
   return nn;
 } // END of function formatNum
