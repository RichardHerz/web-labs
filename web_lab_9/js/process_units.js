/*
  Design, text, images and code by Richard K. Herz, 2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// This file defines objects that represent process units

// ------------ PROCESS UNIT OBJECT DEFINITIONS ----------------------

// EACH PROCESS UNIT DEFINITION MUST CONTAIN AT LEAST THESE 7 FUNCTIONS:
//  initialize, reset, updateUIparams, updateInputs, updateState,
//  updateDisplay, checkForSteadyState
// THESE FUNCTION DEFINITIONS MAY BE EMPTY BUT MUST BE PRESENT
//
// EACH PROCESS UNIT DEFINITION MUST DEFINE the variable residenceTime

// -------------------------------------------------------------------

let processUnits = new Object();
// assign process unit objects to this object
// as indexed child objects in order to allow object controller
// to access them in a repeat with numeric index
// the numeric order of process units does not affect the simulation
// contents must be only the process units as child objects
// child objects optionally can be defined in separate script files, which
// makes them easier to edit,
// then inserted into processUnits, e.g.,
// USING CONSTRUCTOR FUNCTION...
//   processUnits[0] = new puHeatExchanger(0); // [] and () index # must match
// OR USING OBJECT
//   processUnits[0] = puHeatExchanger; // puHeatExchanger is an object
//   processUnits[0].unitIndex = 0; // assign unitIndex to match processUnits index
// then object cleared for garbage collection, e.g.,
//   puHeatExchanger = null; // puHeatExchanger is an object
// WARNING: if reorder unit index numbers, then need to edit
//   those numbers in each unit's private inputs array

// ADD PROCESS FEED USING OBJECT CONSTRUCTOR IN FILE puFEED.js
processUnits[0] = new puFEED(0);

// ADD CSTRs USING OBJECT CONSTRUCTOR IN FILE puCSTR.js
let numRxrs = 4;
for (let i = 1; i <= numRxrs; i += 1) {
  processUnits[i] = new puCSTR(i);
}

let copier = {

  copyConversionData : function(plotIndex) {
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
    let tVarLen = plotInfo[plotIndex]['var'].length; // length for loops below
    console.log('new tVarLen = ' + tVarLen);

    tText = '<p>Web Labs at ReactorLab.net &nbsp; &gt; &nbsp;' + simParams.title + '</p>';

    // list current input values

    let timeTOround = controller.simTime;
    if (simParams.labType == 'Dynamic') {
      tText += '<p>Simulation time of data capture = ' + timeTOround.toFixed(3) + ' s <br>';
    } else {
      // Single or Profile labType
      // WARNING: must have simParams vars imTimeStep = 1 and simStepRepeats = 1
      // for simtime to equal # runs between resets
      tText += '<p>Total runs at time of data capture = ' + timeTOround.toFixed(0) + '<br>';
    }

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

    // NOTE: plotInfo object for lab has varShow option for each variable listed but
    // copyData tabulates all variables in plotInfo regardless of the varShow value
    // FROM process_plot_info.js
    //    varShow values are 'show' to show on plot and legend,
    //    'tabled' to not show on plot nor legend but list in copy data table
    //    and any other value, e.g., 'hide' to not show on plot but do show in legend
    //    varShow value can be changed by javascript if want to show/hide curve with checkbox
    //    e.g., plotInfo[pnum]['varShow'][vnum] = 'show';

    // column headers
    tText += '<p>';
    // first, x-axis variable name for table
    tText += plotInfo[plotIndex]['xAxisTableLabel'] + tItemDelimiter;
    // then other column names for y-axis variables
    for (v = 0; v < tVarLen; v += 1) {
      tText += plotInfo[plotIndex]['varLabel'][v];
      tText += ' (' + plotInfo[plotIndex]['varDataUnits'][v] + ')';
      if (v < (tVarLen - 1)) {
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
      //
      // OLD version - get thisNumPts from plotInfo
      // WARNING - thisNumPts may have been deleted from some labs plotInfo
      // let thisNumPts = 1 + plotInfo[plotIndex]['numberPoints'];
      // console.log('old thisNumPts = ' + thisNumPts);
      //
      // NEW version - get thisNumPts from length of data array
      // all unit vars in one plot must have same data array length
      varUnitIndex = plotInfo[plotIndex]['varUnitIndex'][0];
      console.log('new varUnitIndex = ' + varUnitIndex);
      let thisNumPts = processUnits[varUnitIndex][dataName][0].length;
      console.log('new thisNumPts = ' + thisNumPts);
      //
      // NEW
      let tableData = plotter.getPlotData(plotIndex);
      console.log('tableData = ' + tableData);
      //
      // NEW - all plotInfo[pnum]['var'][vnum] = 0 for this plot,
      // e.g.,
      // vnum = 3; // 4th variable
      // plotInfo[pnum]['varUnitIndex'][vnum] = 4; // value is index of unit in processUnits object
      // plotInfo[pnum]['var'][vnum] = 0; // value is variable index in unit's plot data array
      //

      console.log('tableData[3][0][1] ' + formatNum(tableData[3][0][1]) );
      // console.log('tableData[3][1][1] ' + formatNum(tableData[3][1][1]) );

      for (k = 0; k < thisNumPts; k += 1) {
        // first get x value in [k][0], get it from ['var'][0]
        // x values should be same for all units for this plot
        varUnitIndex = plotInfo[plotIndex]['varUnitIndex'][0]; // index of unit
        varIndex = plotInfo[plotIndex]['var'][0]; // index of var to plot in unit data array
        tText += formatNum(processUnits[varUnitIndex][dataName][varIndex][k][0]) + tItemDelimiter;
          // get y value for each variable in [k][1]
          for (v = 0; v < tVarLen; v += 1) {
            // varIndex = plotInfo[plotIndex]['var'][v];
            // varUnitIndex = plotInfo[plotIndex]['varUnitIndex'][v];
            // tText += formatNum(processUnits[varUnitIndex][dataName][varIndex][k][1]); // [k][1] is y value
            // NEW
            console.log('v = ' + v);
            tText += formatNum(tableData[v][k][1]); // [k][1] is y value
            // tText += formatNum(tableData[v][k][1]); // [k][1] is y value
            //
            if (v < (tVarLen - 1)) {tText += tItemDelimiter;}
          }
        tText += '<br>'; // use <br> not <p> or get empty line between each row
      }
    } else {
      alert('unknown plot type');
      return;
    }

    /*

    plotInfo[pnum]['varUnitIndex'][vnum] = 1; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 0; // value is variable index in unit's plot data array

    // get data for plot
    for (v = 0; v < numVar; v += 1) {

      // get unit index and array name for this variable
      varUnitIndex = plotInfo[plotInfoNum]['varUnitIndex'][v];
      // get number n of variable listed in unit's data array
      n = varNumbers[v];
    ....

    // scale y-axis values if scale factor not equal to 1
    for (v = 0; v < numVar; v += 1) {
      sf = plotInfo[plotInfoNum]['varYscaleFactor'][v];
      thisNumPts = plotData[v].length;
      if (sf != 1) {
        for (p = 0; p < thisNumPts; p += 1) {
          plotData[v][p][1] = sf * plotData[v][p][1];
        }
      }
    }
    */

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
    } // END of sub function formatNum of copyConversionData

  }, // END of function copyConversionData

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

} // END of object copier

let reactionRate = {
  // properties and method of this object supply reaction rate to CSTRs
  // same kinetics for all CSTRs
  //
  // rateHIGH is high branch of average steady-state reaction rate (d'less turnover frequency)
  // from Reactor Lab Web Labs, Lab 2, diffusion-reaction at default conditions
  // model 2 when entering lab (as positive numbers until returned by getRxnRate)
  // where these conc are the gas conc in the reactor mixing cell over the catalyst layer (not feed)
  // rateHIGH has 637 elements at 0.001 conc resolution from 0.000 through 0.636
  // used in getRxnRate() method below
  rateHIGH : [0,2.0668e-05,4.1335e-05,6.2003e-05,8.267e-05,0.00010135,0.00012003,0.00013872,0.0001574,0.00016758,0.00017776,0.00018795,0.00019813,0.00020831,0.00021849,0.00022868,0.00023886,0.00024904,0.00025922,0.00026941,0.00027959,0.00028977,0.00029995,0.00031014,0.00032032,0.0003305,0.0003362,0.0003419,0.0003476,0.0003533,0.000359,0.0003647,0.0003704,0.0003761,0.0003818,0.0003875,0.0003932,0.0003989,0.0004046,0.0004103,0.00041385,0.00041741,0.00042096,0.00042452,0.00042807,0.00043162,0.00043518,0.00043873,0.00044229,0.00044584,0.0004494,0.00045295,0.0004565,0.00046006,0.00046361,0.00046717,0.00047072,0.00047428,0.00047783,0.00048138,0.00048494,0.00048849,0.00049205,0.0004956,0.000498,0.00050041,0.00050281,0.00050522,0.00050762,0.00051002,0.00051243,0.00051483,0.00051724,0.00051964,0.00052204,0.00052445,0.00052685,0.00052926,0.00053166,0.00053406,0.00053647,0.00053887,0.00054128,0.00054368,0.00054608,0.00054849,0.00055089,0.0005533,0.0005557,0.00055743,0.00055917,0.0005609,0.00056263,0.00056437,0.0005661,0.00056783,0.00056957,0.0005713,0.00057303,0.00057477,0.0005765,0.00057823,0.00057997,0.0005817,0.00058343,0.00058517,0.0005869,0.00058837,0.00058983,0.0005913,0.00059277,0.00059423,0.0005957,0.00059717,0.00059863,0.0006001,0.00060157,0.00060303,0.0006045,0.00060597,0.00060743,0.0006089,0.00061037,0.00061183,0.0006133,0.00061447,0.00061565,0.00061682,0.000618,0.00061918,0.00062035,0.00062153,0.0006227,0.00062387,0.00062505,0.00062623,0.0006274,0.00062858,0.00062975,0.00063093,0.0006321,0.00063327,0.00063445,0.00063563,0.0006368,0.00063797,0.00063915,0.00064032,0.0006415,0.00064267,0.00064385,0.00064503,0.0006462,0.00064713,0.00064806,0.00064898,0.00064991,0.00065084,0.00065177,0.0006527,0.00065363,0.00065455,0.00065548,0.00065641,0.00065734,0.00065827,0.0006592,0.00066012,0.00066105,0.00066198,0.00066291,0.00066384,0.00066477,0.00066569,0.00066662,0.00066755,0.00066848,0.00066941,0.00067033,0.00067126,0.00067219,0.00067312,0.00067405,0.00067498,0.0006759,0.00067683,0.00067776,0.00067869,0.00067962,0.00068055,0.00068147,0.0006824,0.00068333,0.00068426,0.00068519,0.00068612,0.00068704,0.00068797,0.0006889,0.00068959,0.00069027,0.00069096,0.00069164,0.00069233,0.00069301,0.0006937,0.00069438,0.00069507,0.00069575,0.00069644,0.00069713,0.00069781,0.0006985,0.00069918,0.00069987,0.00070055,0.00070124,0.00070192,0.00070261,0.00070329,0.00070398,0.00070466,0.00070535,0.00070604,0.00070672,0.00070741,0.00070809,0.00070878,0.00070946,0.00071015,0.00071083,0.00071152,0.0007122,0.00071289,0.00071358,0.00071426,0.00071495,0.00071563,0.00071632,0.000717,0.00071769,0.00071837,0.00071906,0.00071974,0.00072043,0.00072111,0.0007218,0.00072235,0.00072291,0.00072346,0.00072402,0.00072457,0.00072512,0.00072568,0.00072623,0.00072679,0.00072734,0.0007279,0.00072845,0.000729,0.00072956,0.00073011,0.00073067,0.00073122,0.00073177,0.00073233,0.00073288,0.00073344,0.00073399,0.00073455,0.0007351,0.00073565,0.00073621,0.00073676,0.00073732,0.00073787,0.00073843,0.00073898,0.00073953,0.00074009,0.00074064,0.0007412,0.00074175,0.0007423,0.00074286,0.00074341,0.00074397,0.00074452,0.00074507,0.00074563,0.00074618,0.00074674,0.00074729,0.00074785,0.0007484,0.00074886,0.00074933,0.00074979,0.00075025,0.00075071,0.00075117,0.00075164,0.0007521,0.00075256,0.00075302,0.00075349,0.00075395,0.00075441,0.00075488,0.00075534,0.0007558,0.00075626,0.00075672,0.00075719,0.00075765,0.00075811,0.00075857,0.00075904,0.0007595,0.00075996,0.00076043,0.00076089,0.00076135,0.00076181,0.00076227,0.00076274,0.0007632,0.00076366,0.00076412,0.00076459,0.00076505,0.00076551,0.00076597,0.00076644,0.0007669,0.00076736,0.00076782,0.00076829,0.00076875,0.00076921,0.00076967,0.00077014,0.0007706,0.00077099,0.00077138,0.00077176,0.00077215,0.00077254,0.00077293,0.00077331,0.0007737,0.00077409,0.00077448,0.00077487,0.00077525,0.00077564,0.00077603,0.00077642,0.0007768,0.00077719,0.00077758,0.00077797,0.00077836,0.00077874,0.00077913,0.00077952,0.00077991,0.00078029,0.00078068,0.00078107,0.00078146,0.00078184,0.00078223,0.00078262,0.00078301,0.0007834,0.00078378,0.00078417,0.00078456,0.00078495,0.00078533,0.00078572,0.00078611,0.0007865,0.00078689,0.00078727,0.00078766,0.00078805,0.00078844,0.00078882,0.00078921,0.0007896,0.00078994,0.00079027,0.00079061,0.00079095,0.00079128,0.00079162,0.00079196,0.00079229,0.00079263,0.00079297,0.0007933,0.00079364,0.00079398,0.00079431,0.00079465,0.00079499,0.00079532,0.00079566,0.000796,0.00079633,0.00079667,0.00079701,0.00079734,0.00079768,0.00079802,0.00079836,0.00079869,0.00079903,0.00079937,0.0007997,0.00080004,0.00080038,0.00080071,0.00080105,0.00080139,0.00080172,0.00080206,0.0008024,0.00080273,0.00080307,0.00080341,0.00080374,0.00080408,0.00080442,0.00080475,0.00080509,0.00080543,0.00080576,0.0008061,0.0008064,0.0008067,0.00080701,0.00080731,0.00080761,0.00080791,0.00080821,0.00080852,0.00080882,0.00080912,0.00080942,0.00080973,0.00081003,0.00081033,0.00081063,0.00081093,0.00081124,0.00081154,0.00081184,0.00081214,0.00081244,0.00081275,0.00081305,0.00081335,0.00081365,0.00081395,0.00081426,0.00081456,0.00081486,0.00081516,0.00081546,0.00081577,0.00081607,0.00081637,0.00081667,0.00081697,0.00081728,0.00081758,0.00081788,0.00081818,0.00081849,0.00081879,0.00081909,0.00081939,0.00081969,0.00082,0.0008203,0.0008206,0.00082087,0.00082113,0.0008214,0.00082167,0.00082194,0.0008222,0.00082247,0.00082274,0.00082301,0.00082327,0.00082354,0.00082381,0.00082408,0.00082434,0.00082461,0.00082488,0.00082514,0.00082541,0.00082568,0.00082595,0.00082621,0.00082648,0.00082675,0.00082702,0.00082728,0.00082755,0.00082782,0.00082809,0.00082835,0.00082862,0.00082889,0.00082916,0.00082942,0.00082969,0.00082996,0.00083022,0.00083049,0.00083076,0.00083103,0.00083129,0.00083156,0.00083183,0.0008321,0.00083236,0.00083263,0.0008329,0.00083317,0.00083343,0.0008337,0.00083393,0.00083417,0.0008344,0.00083464,0.00083487,0.0008351,0.00083534,0.00083557,0.00083581,0.00083604,0.00083627,0.00083651,0.00083674,0.00083698,0.00083721,0.00083744,0.00083768,0.00083791,0.00083815,0.00083838,0.00083861,0.00083885,0.00083908,0.00083932,0.00083955,0.00083978,0.00084002,0.00084025,0.00084049,0.00084072,0.00084095,0.00084119,0.00084142,0.00084166,0.00084189,0.00084212,0.00084236,0.00084259,0.00084283,0.00084306,0.00084329,0.00084353,0.00084376,0.000844,0.00084423,0.00084446,0.0008447,0.00084493,0.00084517,0.0008454,0.00084562,0.00084584,0.00084606,0.00084628,0.00084651,0.00084673,0.00084695,0.00084717,0.00084739,0.00084761,0.00084783,0.00084805,0.00084827,0.00084849,0.00084872,0.00084894,0.00084916,0.00084938,0.0008496,0.00084975,0.00084991,0.00085007,0.00085022,0.00085038,0.00085053,0.00085069,0.00085084,0.000851,0.00085115,0.00085131,0.00085146,0.00085162,0.00085177,0.00085193,0.00085208,0.00085224,0.00085239,0.00085255,0.0008527,0.00085261,0.00085252,0.00085243,0.00085234,0.00085225,0.00085216,0.00085207,0.00085198,0.00085189,0.0008518],

  // rateLOW is low branch of average steady-state reaction rate (d'less turnover frequency)
  // from Reactor Lab Web Labs, Lab 2, diffusion-reaction at default conditions
  // model 2 when entering lab (as positive numbers until returned by getRxnRate)
  // where these conc are the gas conc in the reactor mixing cell over the catalyst layer (not feed)
  // rateLOW has 662 elements at 0.001 conc resolution from 0.431 through 1.092
  // used in getRxnRate() method below
  rateLOW : [0.0003826,0.00037988,0.00037717,0.00037445,0.00037174,0.00036902,0.00036631,0.00036359,0.00036088,0.00035816,0.00035545,0.00035273,0.00035002,0.0003473,0.00034549,0.00034368,0.00034188,0.00034007,0.00033826,0.00033645,0.00033464,0.00033283,0.00033102,0.00032922,0.00032741,0.0003256,0.00032408,0.00032256,0.00032105,0.00031953,0.00031801,0.00031649,0.00031497,0.00031345,0.00031194,0.00031042,0.0003089,0.00030766,0.00030643,0.00030519,0.00030395,0.00030272,0.00030148,0.00030025,0.00029901,0.00029777,0.00029654,0.0002953,0.00029432,0.00029334,0.00029237,0.00029139,0.00029041,0.00028943,0.00028845,0.00028748,0.0002865,0.00028552,0.00028454,0.00028356,0.00028258,0.00028161,0.00028063,0.00027965,0.00027867,0.00027769,0.00027672,0.00027574,0.00027476,0.00027378,0.0002728,0.00027183,0.00027085,0.00026987,0.00026889,0.00026791,0.00026693,0.00026596,0.00026498,0.000264,0.00026324,0.00026249,0.00026173,0.00026097,0.00026021,0.00025946,0.0002587,0.00025794,0.00025719,0.00025643,0.00025567,0.00025491,0.00025416,0.0002534,0.00025264,0.00025189,0.00025113,0.00025037,0.00024961,0.00024886,0.0002481,0.00024752,0.00024695,0.00024637,0.0002458,0.00024522,0.00024465,0.00024407,0.0002435,0.00024292,0.00024235,0.00024177,0.00024119,0.00024062,0.00024004,0.00023947,0.00023889,0.00023832,0.00023774,0.00023717,0.00023659,0.00023602,0.00023544,0.00023486,0.00023429,0.00023371,0.00023314,0.00023256,0.00023199,0.00023141,0.00023084,0.00023026,0.00022968,0.00022911,0.00022853,0.00022796,0.00022738,0.00022681,0.00022623,0.00022566,0.00022508,0.00022451,0.00022393,0.00022335,0.00022278,0.0002222,0.00022163,0.00022105,0.00022048,0.0002199,0.00021933,0.00021875,0.00021818,0.0002176,0.00021716,0.00021672,0.00021628,0.00021584,0.0002154,0.00021496,0.00021453,0.00021409,0.00021365,0.00021321,0.00021277,0.00021233,0.00021189,0.00021145,0.00021101,0.00021057,0.00021013,0.00020969,0.00020925,0.00020882,0.00020838,0.00020794,0.0002075,0.00020706,0.00020662,0.00020618,0.00020574,0.0002053,0.00020486,0.00020442,0.00020398,0.00020355,0.00020311,0.00020267,0.00020223,0.00020179,0.00020135,0.00020091,0.00020047,0.00020003,0.00019959,0.00019915,0.00019871,0.00019827,0.00019784,0.0001974,0.00019696,0.00019652,0.00019608,0.00019564,0.0001952,0.00019486,0.00019452,0.00019418,0.00019385,0.00019351,0.00019317,0.00019283,0.00019249,0.00019215,0.00019182,0.00019148,0.00019114,0.0001908,0.00019046,0.00019012,0.00018978,0.00018945,0.00018911,0.00018877,0.00018843,0.00018809,0.00018775,0.00018742,0.00018708,0.00018674,0.0001864,0.00018606,0.00018572,0.00018538,0.00018505,0.00018471,0.00018437,0.00018403,0.00018369,0.00018335,0.00018302,0.00018268,0.00018234,0.000182,0.00018166,0.00018132,0.00018098,0.00018065,0.00018031,0.00017997,0.00017963,0.00017929,0.00017895,0.00017862,0.00017828,0.00017794,0.0001776,0.00017732,0.00017704,0.00017676,0.00017648,0.0001762,0.00017592,0.00017564,0.00017536,0.00017508,0.0001748,0.00017452,0.00017424,0.00017395,0.00017367,0.00017339,0.00017311,0.00017283,0.00017255,0.00017227,0.00017199,0.00017171,0.00017143,0.00017115,0.00017087,0.00017059,0.00017031,0.00017003,0.00016975,0.00016947,0.00016919,0.00016891,0.00016863,0.00016835,0.00016807,0.00016779,0.00016751,0.00016723,0.00016695,0.00016666,0.00016638,0.0001661,0.00016582,0.00016554,0.00016526,0.00016498,0.0001647,0.00016442,0.00016414,0.00016386,0.00016358,0.0001633,0.00016307,0.00016283,0.0001626,0.00016237,0.00016213,0.0001619,0.00016167,0.00016143,0.0001612,0.00016097,0.00016073,0.0001605,0.00016027,0.00016003,0.0001598,0.00015957,0.00015933,0.0001591,0.00015887,0.00015863,0.0001584,0.00015817,0.00015793,0.0001577,0.00015747,0.00015723,0.000157,0.00015677,0.00015653,0.0001563,0.00015607,0.00015583,0.0001556,0.00015537,0.00015513,0.0001549,0.00015467,0.00015443,0.0001542,0.00015397,0.00015373,0.0001535,0.00015327,0.00015303,0.0001528,0.00015257,0.00015233,0.0001521,0.00015187,0.00015163,0.0001514,0.0001512,0.00015099,0.00015079,0.00015058,0.00015038,0.00015018,0.00014997,0.00014977,0.00014956,0.00014936,0.00014916,0.00014895,0.00014875,0.00014854,0.00014834,0.00014814,0.00014793,0.00014773,0.00014752,0.00014732,0.00014712,0.00014691,0.00014671,0.0001465,0.0001463,0.0001461,0.00014589,0.00014569,0.00014548,0.00014528,0.00014508,0.00014487,0.00014467,0.00014446,0.00014426,0.00014406,0.00014385,0.00014365,0.00014344,0.00014324,0.00014304,0.00014283,0.00014263,0.00014242,0.00014222,0.00014202,0.00014181,0.00014161,0.0001414,0.0001412,0.00014103,0.00014085,0.00014068,0.00014051,0.00014034,0.00014016,0.00013999,0.00013982,0.00013965,0.00013947,0.0001393,0.00013913,0.00013896,0.00013878,0.00013861,0.00013844,0.00013827,0.00013809,0.00013792,0.00013775,0.00013758,0.0001374,0.00013723,0.00013706,0.00013689,0.00013671,0.00013654,0.00013637,0.0001362,0.00013602,0.00013585,0.00013568,0.00013551,0.00013533,0.00013516,0.00013499,0.00013482,0.00013464,0.00013447,0.0001343,0.00013413,0.00013395,0.00013378,0.00013361,0.00013344,0.00013326,0.00013309,0.00013292,0.00013275,0.00013257,0.0001324,0.00013225,0.0001321,0.00013195,0.0001318,0.00013165,0.00013149,0.00013134,0.00013119,0.00013104,0.00013089,0.00013074,0.00013059,0.00013044,0.00013029,0.00013014,0.00012998,0.00012983,0.00012968,0.00012953,0.00012938,0.00012923,0.00012908,0.00012893,0.00012878,0.00012863,0.00012847,0.00012832,0.00012817,0.00012802,0.00012787,0.00012772,0.00012757,0.00012742,0.00012727,0.00012712,0.00012696,0.00012681,0.00012666,0.00012651,0.00012636,0.00012621,0.00012606,0.00012591,0.00012576,0.00012561,0.00012545,0.0001253,0.00012515,0.000125,0.00012485,0.0001247,0.00012456,0.00012443,0.00012429,0.00012416,0.00012402,0.00012388,0.00012375,0.00012361,0.00012348,0.00012334,0.0001232,0.00012307,0.00012293,0.0001228,0.00012266,0.00012252,0.00012239,0.00012225,0.00012212,0.00012198,0.00012184,0.00012171,0.00012157,0.00012144,0.0001213,0.00012116,0.00012103,0.00012089,0.00012076,0.00012062,0.00012048,0.00012035,0.00012021,0.00012008,0.00011994,0.0001198,0.00011967,0.00011953,0.0001194,0.00011926,0.00011912,0.00011899,0.00011885,0.00011872,0.00011858,0.00011844,0.00011831,0.00011817,0.00011804,0.0001179,0.00011778,0.00011766,0.00011755,0.00011743,0.00011731,0.00011719,0.00011708,0.00011696,0.00011684,0.00011672,0.00011661,0.00011649,0.00011637,0.00011625,0.00011614,0.00011602,0.0001159,0.00011578,0.00011566,0.00011555,0.00011543,0.00011531,0.00011519,0.00011508,0.00011496,0.00011484,0.00011472,0.00011461,0.00011449,0.00011437,0.00011425,0.00011414,0.00011402,0.0001139,0.00011378,0.00011366,0.00011355,0.00011343,0.00011331,0.00011319,0.00011308,0.00011296,0.00011284,0.00011272,0.00011261,0.00011249,0.00011237,0.00011225,0.00011214,0.00011202,0.0001119,0.00011179,0.00011168,0.00011157,0.00011146,0.00011135,0.00011124,0.00011113,0.00011102,0.00011091,0.0001108,0.00011069,0.00011058,0.00011047,0.00011036,0.00011025,0.00011014,0.00011003,0.00010992,0.00010981,0.0001097,0.00010959,0.00010948,0.00010937,0.00010926,0.00010915,0.00010904,0.00010893,0.00010882,0.00010871,0.0001086,0.00010849,0.00010838,0.00010827,0.00010816,0.00010805,0.00010794,0.00010783,0.00010772,0.00010761,0.0001075,0.00010739,0.00010728,0.00010717,0.00010706,0.00010695,0.00010684,0.00010673,0.00010662,0.00010651,0.0001064],

  getRxnRate : function(pConc,pRateBranchOLD) {
    // USES properties rateLOW, rateHIGH
    // getRxnRate provides rate of formation of reactant from Reactor Lab
    // Web Labs, Lab 2, reaction-diffusion at default lab entry conditions, model 2,
    // as the average dimensionless turnover frequency in the catalyst layer
    // vs. dimensionless reactant concentration in the mixing cell over the layer
    // convert from conc 0-1 to c = 0 to 100
    //    for use of c in array indexes
    // return rate as negative value for reactant conversion
    // for 0.001 conc resolution
    let c = Math.round(1000*pConc); // 0 to 100
    if (c < 0) {
      c = 0;
    } else if (c > 1000) {
      c = 1000;
    }
    // determine rate branch, high vs. low
    let rate = 0.0;
    let rateBranchNEW = 1;
    const cLowBreak = 431; // for 0.001 conc resolution
    const cHighBreak = 636; // for 0.001 conc resolution
    // first do easy decisions
    if (c < cLowBreak) {
      // on high branch
      rate = this.rateHIGH[c];
      rateBranchNEW = 1; // 0 is low branch, 1 is high branch
    } else if (c > cHighBreak) {
      // on low branch
      rate = this.rateLOW[c-cLowBreak];
      rateBranchNEW = 0;
    } else if (pRateBranchOLD == 0) {
      // in middle range and last on low branch, so still on low branch
      // on low branch
      rate = this.rateLOW[c-cLowBreak];
      rateBranchNEW = 0;
    } else if (pRateBranchOLD == 1) {
      // in middle range and last on high branch, so still on high rateBranch
      rate = this.rateHIGH[c];
      rateBranchNEW = 1;
    } else {
      // should not get here
      rate = 0.0;
      rateBranchNEW = 1;
    }
    // return rate as negative value for reactant conversion
    return [-rate,rateBranchNEW]

  } // END of getRxnRate() method

} // END of object reactionRate
