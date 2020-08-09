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
// USING CONSTRUCTOR FUNCTION OR CLASS DEFINITION...
//   processUnits[0] = new puHeatExchanger(0); // [] and () index # must match
// OR USING OBJECT
//   processUnits[0] = puHeatExchanger; // puHeatExchanger is an object
//   processUnits[0].unitIndex = 0; // assign unitIndex to match processUnits index
// then object cleared for garbage collection, e.g.,
//   puHeatExchanger = null; // puHeatExchanger is an object
// WARNING: if reorder unit index numbers, then need to edit
//   those numbers in each unit's getInputs method

// processUnits: [0] reactor feed, [1] reactor, [2] feed to jacket, [3] jacket, [4] controller

processUnits[0] = {
  //
  unitIndex : 0, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'reactor feed',

  // for other info shared with other units and objects, see public properties
  // and search for controller. & interfacer. & plotter. & simParams. & plotInfo

  // *******************************************
  //  define INPUT CONNECTIONS from other units
  // *******************************************

  // SPECIAL - none for this unit
  updateInputs : function() {}, // required, called by main controller object

  // *******************************************
  //  define OUTPUT CONNECTIONS to other units
  // *******************************************

  flowRate : 0, // (m3/s), feed flow rate, output to unit 1
  conc : 0, // (mol/m3), feed conc, output to unit 1
  Tfeed : 300, // (K), feed T, output to unit 1

  // *******************************************

  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS...
  // SEE dataInputs array in initialize() method for input field ID's

  // define arrays to hold info for variables
  // these will be filled with values in method initialize()
  dataHeaders : [], // variable names
  dataInputs : [], // input field ID's
  dataUnits : [],
  dataMin : [],
  dataMax : [],
  dataDefault : [],
  dataValues : [],

  ssCheckSum : 0, // used to check for steady state
  residenceTime : 0, // for timing checks for steady state check

  initialize : function() {
    //
    let v = 0;
    this.dataHeaders[v] = 'feedFlowRate';
    this.dataInputs[v] = 'input_field_enterFeedFlowRate';
    this.dataUnits[v] = 'm3/s';
    this.dataMin[v] = 0.0001;
    this.dataMax[v] = 1;
    this.dataDefault[v] = 0.05;
    //
    v = 1;
    this.dataHeaders[v] = 'feedConc';
    this.dataInputs[v] = 'input_field_enterFeedConc';
    this.dataUnits[v] = 'mol/m3';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1000;
    this.dataDefault[v] = 0;
    //
    v = 2;
    this.dataHeaders[v] = 'feedTemp';
    this.dataInputs[v] = 'input_field_enterFeedTTemp';
    this.dataUnits[v] = 'K';
    this.dataMin[v] = 200;
    this.dataMax[v] = 500;
    this.dataDefault[v] = 300;
    // END OF INPUT VARS
    // record number of input variables, varCount
    // used, e.g., in copy data to table
    //
    this.varCount = v;
    //
  }, // END of initialize()

  // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***

  reset : function(){
    //
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.

    this.updateUIparams(); // this first, then set other values as needed

    // set state variables not set by updateUIparams() to initial settings

    // need to directly set controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.ssFlag = false;
    // set to zero ssCheckSum used to check for steady state by this unit
    this.ssCheckSum = 0;
  },

  updateUIparams : function(){
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();
    // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
    this.ssCheckSum = 1;

    // check input fields for new values
    // function getInputValue() is defined in file process_interfacer.js
    // getInputValue(unit # in processUnits object, variable # in dataInputs array)
    // see variable numbers above in initialize()
    // note: this.dataValues.[pVar]
    //   is only used in copyData() to report input values
    //
    let unum = this.unitIndex;
    //
    this.flowRate = this.dataValues[0] = interfacer.getInputValue(unum,0);
    this.conc = this.dataValues[1] = interfacer.getInputValue(unum,1);
    this.Tfeed = this.dataValues[2] = interfacer.getInputValue(unum,2);

  }, // END updateUIparams

  updateState : function() {
    //
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE
    //
    // WARNING: this method must NOT contain references to other units!
    //          get info from other units ONLY in updateInputs() method
    //
    // check for change in overall main time step simTimeStep
    this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;
    //
    // nothing to do here for this unit
    //
  }, // end updateState method

  updateDisplay : function(){
    // nothing to do here for this unit
  }, // END of updateDisplay()

  checkForSteadyState : function() {
    // required - called by controller object
    // returns ssFlag, true if this unit at SS, false if not
    // *IF* NOT used to check for SS *AND* another unit IS checked,
    // which can not be at SS, *THEN* return ssFlag = true to calling unit
    // HOWEVER, if this unit has UI inputs, need to be able to return false
    let ssFlag = true;
    // this.ssCheckSum set != 0 on updateUIparams() execution
    if (this.ssCheckSum != 0) {
      ssFlag = false;
    }
    this.ssCheckSum = 0;
    return ssFlag;
  } // END OF checkForSteadyState()

}; // END unit 0, reactor feed

processUnits[1] = {
  //
  unitIndex : 1, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'reactor',

  // for other info shared with other units and objects, see public properties
  // and search for controller. & interfacer. & plotter. & simParams. & plotInfo

  // *******************************************
  //  define INPUT CONNECTIONS from other units
  // *******************************************

  // define this unit's variables that are to receive input values from other units

  flowRate : 0, // will get flowRate from unit 0 in updateInputs
  concIn : 0, // will get concIn from unit 0 in updateInputs, feed
  Tfeed : 0, // will get Tfeed from unit 0 in updateInputs, feed
  Tj : 0, // will get Tj from unit 3 in updateInputs, jacket
  UA : 0, // will get UA from unit 3 in updateInputs

  updateInputs : function() {
    this.flowRate = processUnits[0].flowRate;
    this.concIn = processUnits[0].conc;
    this.Tfeed = processUnits[0].Tfeed
    this.Tj = processUnits[3].Tj;
    this.UA = processUnits[3].UA;
    // update residence time used in controller.checkForSteadyState()
    this.residenceTime = this.vol / this.flowRate;
  },

  // *******************************************
  //  define OUTPUT CONNECTIONS to other units
  // *******************************************

  Trxr : 300, // (K), output to unit 4

  // *******************************************

  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS...
  // SEE dataInputs array in initialize() method for input field ID's

  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, used in updateDisplay() method
  displayReactorContents: '#div_PLOTDIV_reactorContents',

  // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***
  // ***   EXCEPT TO HTML ID'S IN method initialize(), array dataInputs    ***

  // define main parameters
  // values will be set in method intialize()
  k300 : 5e-6, // (1/s), reaction rate coefficient value at 300 K
  Ea : 200, // (kJ/mol), reaction activation energy
  delH : -250, // (kJ/mol), reaction heat of reaction (exothermic < 0)

  // define variables to hold outputs
  initialTrxr : 300, // (K)
  initialCa : 0, // (mol/m3)
  Ca : 0, // (mol/m3), reactant concentration

  // define arrays to hold info for variables
  // these will be filled with values in method initialize()
  dataHeaders : [], // variable names
  dataInputs : [], // input field ID's
  dataUnits : [],
  dataMin : [],
  dataMax : [],
  dataDefault : [],
  dataValues : [],

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  // profileData : [], // for profile plots, plot script requires this name
  stripData : [], // for strip chart plots, plot script requires this name
  // colorCanvasData : [], // for color canvas plots, plot script requires this name

  // allow this unit to take more than one step within one main loop step in updateState method
  unitStepRepeats : 1,
  unitTimeStep : simParams.simTimeStep / this.unitStepRepeats,

  ssCheckSum : 0, // used to check for steady state
  residenceTime : 0, // for timing checks for steady state check

  // define variables which will not be plotted nor saved in copy data table

  // parameters for essentially irreversible first-order reaction
  Rg : 8.3144598E-3, // (kJ/mol/K), ideal gas constant
  rho : 1000, // (kg/m3), reactant liquid density
  Cp : 2.0, // (kJ/kg/K), reactant liquid heat capacity
  vol : 0.1, // (m3), volume of reactor contents = constant with flow rate

  initialize : function() {
    //
    let v = 0;
    this.dataHeaders[v] = 'k300';
    this.dataInputs[v] = 'input_field_enterk300';
    this.dataUnits[v] = '1/s';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1;
    this.dataDefault[v] = 5.0e-6;
    //
    v = 1;
    this.dataHeaders[v] = 'Ea';
    this.dataInputs[v] = 'input_field_enterEa';
    this.dataUnits[v] = 'kJ/mol';
    this.dataMin[v] = 0;
    this.dataMax[v] = 500;
    this.dataDefault[v] = 200
    //
    v = 2;
    this.dataHeaders[v] = 'delH';
    this.dataInputs[v] = 'input_field_enterdelH';
    this.dataUnits[v] = 'kJ/mol';
    this.dataMin[v] = -400;
    this.dataMax[v] = 400;
    this.dataDefault[v] = -250
    //
    // END OF INPUT VARS
    // record number of input variables, varCount
    // used, e.g., in copy data to table
    //
    this.varCount = v;
    //
    // OUTPUT VARS
    //
    v = 3;
    this.dataHeaders[v] = 'Trxr';
    this.dataUnits[v] =  'K';
    this.dataMin[v] = 200;
    this.dataMax[v] = 500;
    //
    v = 4;
    this.dataHeaders[v] = 'Ca';
    this.dataUnits[v] =  'mol/m3';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1000;
    //
  }, // END of initialize()

  // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***

  reset : function() {
    //
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.

    this.updateUIparams(); // this first, then set other values as needed

    // set state variables not set by updateUIparams() to initial settings

    // need to directly set controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.ssFlag = false;

    // set to zero ssCheckSum used to check for steady state by this unit
    this.ssCheckSum = 0;

    this.Trxr = this.initialTrxr; // (K)
    this.Ca = this.initialCa; // (mol/m3), reactant conc

    // each unit has its own data arrays for plots and canvases

    // initialize strip chart data array
    // initPlotData(numStripVars,numStripPts)
    let numStripVars = 2; // Trxr & Ca here
    let numStripPts = plotInfo[0]['numberPoints'];
    this.stripData = plotter.initPlotData(numStripVars,numStripPts);

    let kn = 0;
    for (k = 0; k <= numStripPts; k += 1) {
      kn = k * simParams.simTimeStep * simParams.simStepRepeats;
      // x-axis values
      // x-axis values will not change during sim
      // XXX change to get number vars for this plotInfo variable
      //     so can put in repeat - or better yet, a function
      //     and same for y-axis below
      // first index specifies which variable in plot data array
      this.stripData[0][k][0] = kn;
      this.stripData[1][k][0] = kn;
      // y-axis values
      this.stripData[0][k][1] = this.dataMin[3];
      this.stripData[1][k][1] = this.dataMin[4];
    }

  }, // END reset method

  updateUIparams : function() {
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();
    // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
    this.ssCheckSum = 1;

    // check input fields for new values
    // function getInputValue() is defined in file process_interfacer.js
    // getInputValue(unit # in processUnits object, variable # in dataInputs array)
    // see variable numbers above in initialize()
    // note: this.dataValues.[pVar]
    //   is only used in copyData() to report input values
    //
    let unum = this.unitIndex;
    //
    this.k300 = this.dataValues[0] = interfacer.getInputValue(unum, 0);
    this.Ea = this.dataValues[1] = interfacer.getInputValue(unum, 1);
    this.delH = this.dataValues[2] = interfacer.getInputValue(unum, 2);

  }, // END updateUIparams()

  updateState : function() {
    //
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE
    //
    // WARNING: this method must NOT contain references to other units!
    //          get info from other units ONLY in updateInputs() method
    //
    // check for change in overall main time step simTimeStep
    this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

    let krxn = this.k300 * Math.exp(-(this.Ea/this.Rg)*(1/this.Trxr- 1/300));
    let rate = -krxn * this.Ca;
    let invTau = this.flowRate / this.vol; // inverse of space time = space velocity

    let dCdt = invTau * (this.concIn - this.Ca) + rate;
    let dC = this.unitTimeStep * dCdt;
    // update conc
    this.Ca = this.Ca + dC;
    if (this.Ca < 0){this.Ca = 0;}

    let dTdt = invTau*(this.Tfeed - this.Trxr) + rate*this.delH/(this.rho*this.Cp) +
               (this.Tj - this.Trxr) * this.UA /(this.vol*this.rho*this.Cp);
    let dTrxr = this.unitTimeStep * dTdt;
    // update Trxr
    this.Trxr = this.Trxr + dTrxr;

  }, // end updateState method

  updateDisplay : function() {

    // update color of reactor contents on web page
    let el = document.querySelector(this.displayReactorContents);
    // reactant is blue, product is red, this.Ca is reactant conc
    // xxx assume here max conc is 400 but should make it a variable
    let concB = Math.round(this.Ca/400 * 255);
    let concR = 255 - concB;
    let concColor = "rgb(" + concR + ", 0, " + concB + ")";
    // alert("concColor = " + concColor); // check results
    // "background-color" in index.css did not work
    el.style.backgroundColor = concColor;

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    let numStripPoints = plotInfo[0]['numberPoints'];
    let numStripVars = 2; // only the variables from this unit

    // handle reactor T
    v = 0;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [ 0, this.Trxr] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // handle reactant conc
    v = 1;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [ 0, this.Ca ] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // re-number the x-axis values to equal time values
    // so they stay the same after updating y-axis values
    let timeStep = simParams.simTimeStep * simParams.simStepRepeats;
    for (v = 0; v < numStripVars; v += 1) {
      for (p = 0; p <= numStripPoints; p += 1) { // note = in p <= numStripPoints
        // note want p <= numStripPoints so get # 0 to  # numStripPoints of points
        // want next line for newest data at max time
        this.stripData[v][p][0] = p * timeStep;
        // want next line for newest data at zero time
        // this.stripData[v][p][0] = (numStripPoints - p) * timeStep;
      }
    }

  }, // END of updateDisplay()

  checkForSteadyState : function() {
    // required - called by controller object
    // *IF* NOT used to check for SS *AND* another unit IS checked,
    // which can not be at SS, *THEN* return ssFlag = true to calling unit
    // returns ssFlag, true if this unit at SS, false if not
    // uses and sets this.ssCheckSum
    // this.ssCheckSum can be set by reset() and updateUIparams()
    // check for SS in order to save CPU time when sim is at steady state
    // check for SS by checking for any significant change in array end values
    // but wait at least one residence time after the previous check
    // to allow changes to propagate down unit
    //
    // use reactant conc at oldest time on plot in check
    // as well as current conc this.Ca in crt check
    // in order to help ensure strip plot update doesn't stop unless plot flat
    // AND use width of strip plot for residence time in updateInputs
    // BUT NOT foolproof, e.g., with
    // 1 K up then down changes in manual Tj at certain times
    //
    // multiply all numbers by a factor to get desired number significant
    // figures to left decimal point so toFixed() does not return string "0.###"
    // WARNING: too many sig figs will prevent detecting steady state
    //
    let rc = 1.0e1 * this.stripData[1][0][1]; // oldest reactant conc in rxr conc plot
    let rt = 1.0e1 * this.Tj;
    let lt = 1.0e1 * this.Trxr;
    let lc = 1.0e1 * this.Ca;
    rc = rc.toFixed(0); // strings
    rt = rt.toFixed(0);
    lt = lt.toFixed(0);
    lc = lc.toFixed(0);
    // concatenate strings
    let newCheckSum = rc +'.'+ rt +'.'+ lt +'.'+ lc;
    //
    let oldSScheckSum = this.ssCheckSum;
    let ssFlag = false;
    if (newCheckSum == oldSScheckSum) {ssFlag = true;}
    this.ssCheckSum = newCheckSum; // save current value for use next time

    // console.log('oldSScheckSum = ' + oldSScheckSum);
    // console.log('newCheckSum = ' + newCheckSum + ', ssFlag = ' + ssFlag);

    return ssFlag;
  } // END checkForSteadyState method

}; // END unit 1, reactor

processUnits[2] = {
  //
  unitIndex : 2, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'feed to heat transfer jacket',

  // for other info shared with other units and objects, see public properties
  // and search for controller. & interfacer. & plotter. & simParams. & plotInfo

  // *******************************************
  //  define INPUT CONNECTIONS from other units
  // *******************************************

  // define this unit's variables that are to receive input values from other units
  command : 0,

  updateInputs : function() {
    this.command = processUnits[4].command;
  },

  // *******************************************
  //  define OUTPUT CONNECTIONS to other units
  // *******************************************

  initialFlowRate : 1, // (m3/s), heat transfer liquid flow rate
  flowRate : this.initialFlowRate,

  initialTjIn : 350, // (K)
  TjIn : this.initialTjIn,

  // *******************************************

  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS...
  // SEE dataInputs array in initialize() method for input field ID's

  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, used in updateDisplay() method
  // *** e.g., displayReactorLeftConc: 'field_reactor_left_conc',

  // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***
  // ***   EXCEPT TO HTML ID'S IN method initialize(), array dataInputs    ***

  // define arrays to hold info for variables
  // these will be filled with values in method initialize()
  dataHeaders : [], // variable names
  dataInputs : [], // input field ID's
  dataUnits : [],
  dataMin : [],
  dataMax : [],
  dataDefault : [],
  dataValues : [],

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  // profileData : [], // for profile plots, plot script requires this name
  stripData : [], // for strip chart plots, plot script requires this name
  // colorCanvasData : [], // for color canvas plots, plot script requires this name

  ssCheckSum : 0, // used to check for steady state
  residenceTime : 0, // for timing checks for steady state check
  // residenceTime is set in this unit's updateUIparams()

  initialize : function() {
    //
    let v = 0;
    this.dataHeaders[v] = 'jacketFlowrate';
    this.dataInputs[v] = 'input_field_enterJacketFlowRate';
    this.dataUnits[v] = 'm3/s';
    this.dataMin[v] = 1e-7;
    this.dataMax[v] = 1;
    this.dataDefault[v] = 1;
    //
    // END OF INPUT VARS
    // record number of input variables, varCount
    // used, e.g., in copy data to table
    //
    this.varCount = v;
    //
    v = 1;
    this.dataHeaders[v] = 'jacketInletT';
    this.dataInputs[v] = '';
    this.dataUnits[v] = 'K';
    this.dataMin[v] = 200;
    this.dataMax[v] = 500;
    this.dataDefault[v] = 348;
    this.dataValues[v] = 200;
    //
  }, // END of initialize()

  // initialize : function() {
  //   //
  //   let v = 0;
  //   this.dataHeaders[v] = 'jacketInletT';
  //   this.dataInputs[v] = '';
  //   this.dataUnits[v] = 'K';
  //   this.dataMin[v] = 200;
  //   this.dataMax[v] = 500;
  //   this.dataDefault[v] = 348;
  //   this.dataValues[v] = 200;
  //       //
  //   v = 1;
  //   this.dataHeaders[v] = 'jacketFlowrate';
  //   this.dataInputs[v] = 'input_field_enterJacketFlowRate';
  //   this.dataUnits[v] = 'm3/s';
  //   this.dataMin[v] = 1e-7;
  //   this.dataMax[v] = 1;
  //   this.dataDefault[v] = 1;
  //   //
  //   // END OF INPUT VARS
  //   // record number of input variables, varCount
  //   // used, e.g., in copy data to table
  //   //
  //   this.varCount = v;
  //   //
  // }, // END of initialize()

  reset : function(){
    //
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.

    this.updateUIparams(); // this first, then set other values as needed

    // set state variables not set by updateUIparams() to initial settings

    this.TjIn = this.initialTjIn;

    // each unit has its own data arrays for plots and canvases

    // initialize strip chart data array
    // initPlotData(numStripVars,numStripPts)
    let numStripVars = 1; // jacket inlet T here
    let numStripPts = plotInfo[0]['numberPoints'];
    this.stripData = plotter.initPlotData(numStripVars,numStripPts);

    let kn = 0;
    for (k = 0; k <= numStripPts; k += 1) {
      kn = k * simParams.simTimeStep * simParams.simStepRepeats;
      // x-axis values
      // x-axis values will not change during sim
      // XXX change to get number vars for this plotInfo variable
      //     so can put in repeat - or better yet, a function
      //     and same for y-axis below
      // first index specifies which variable in plot data array
      this.stripData[0][k][0] = kn;
      // y-axis values
      this.stripData[0][k][1] = this.dataMin[1];
    }

  }, // END reset method

  updateUIparams : function() {
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();
    // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
    this.ssCheckSum = 1;

    // check input fields for new values
    // function getInputValue() is defined in file process_interfacer.js
    // getInputValue(unit # in processUnits object, variable # in dataInputs array)
    // see variable numbers above in initialize()
    // note: this.dataValues.[pVar]
    //   is only used in copyData() to report input values
    //
    let unum = this.unitIndex;

    // get jacket flow rate from input fields
    this.flowRate = this.dataValues[0] = interfacer.getInputValue(unum, 0);

  }, // END of updateUIparams()

  updateState : function(){
    //
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE
    //
    // WARNING: this method must NOT contain references to other units!
    //          get info from other units ONLY in updateInputs() method

    // get feed T from controller command
    this.TjIn = this.command;

  }, // end updateState method

  updateDisplay : function(){
    // update display elements which only depend on this process unit
    // except do all plotting at main controller updateDisplay
    // since some plots may contain data from more than one process unit

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    let numStripPoints = plotInfo[0]['numberPoints'];

    // handle jacket inlet T
    v = 0;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [ 0, this.TjIn ] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // re-number the x-axis values to equal time values
    // so they stay the same after updating y-axis values
    let timeStep = simParams.simTimeStep * simParams.simStepRepeats;
    v = 0; // just one var in this display method, so don't need repeat
    // to do all vars, for (v = 0; v < numStripVariables; v += 1)
    for (p = 0; p <= numStripPoints; p += 1) { // note = in p <= numStripPoints
      // note want p <= numStripPoints so get # 0 to  # numStripPoints of points
      // want next line for newest data at max time
      this.stripData[v][p][0] = p * timeStep;
      // want next line for newest data at zero time
      // this.stripData[v][p][0] = (numStripPoints - p) * timeStep;
    }

  }, // END of updateDisplay()

  checkForSteadyState : function() {
    // required - called by controller object
    // returns ssFlag, true if this unit at SS, false if not
    // *IF* NOT used to check for SS *AND* another unit IS checked,
    // which can not be at SS, *THEN* return ssFlag = true to calling unit
    // HOWEVER, if this unit has UI inputs, need to be able to return false
    let ssFlag = true;
    // this.ssCheckSum set != 0 on updateUIparams() execution
    if (this.ssCheckSum != 0) {
      ssFlag = false;
    }
    this.ssCheckSum = 0;
    return ssFlag;
  } // END OF checkForSteadyState()

}; // END unit 2, feed to jacket

processUnits[3] = {
  //
  unitIndex : 3, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'heat transfer jacket',

  // for other info shared with other units and objects, see public properties
  // and search for controller. & interfacer. & plotter. & simParams. & plotInfo

  // *******************************************
  //  define INPUT CONNECTIONS from other units
  // *******************************************

  // define this unit's variables that are to receive input values from other units

  Trxr    : 0, // will get Trxr from unit 1 in updateInputs
  TjIn    : 0, // will get TjIn from unit 2 in updateInputs
  flowRate  : 0, // will get flowRate from unit 3 in updateInputs

  updateInputs : function() {
    this.Trxr = processUnits[1].Trxr;
    this.TjIn = processUnits[2].TjIn;
    this.flowRate = processUnits[2].flowRate;
    // residence time used in controller.checkForSteadyState()
    this.residenceTime = this.vol / this.flowRate;
  },

  // *******************************************
  //  define OUTPUT CONNECTIONS to other units
  // *******************************************

  initialTj : 350,
  Tj : this.initialTj, // output to unit 1

  // *******************************************

  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS...
  // SEE dataInputs array in initialize() method for input field ID's

  // variables defined here are available to all functions inside this unit

  vol       : 0.02, // (m3), heat transfer jacket volume
  rho       : 1000, // (kg/m3), heat transfer liquid density
  Cp        : 2.0, // (kJ/kg/K), heat transfer liquid heat capacity

  // define arrays to hold info for variables
  // these will be filled with values in method initialize()
  dataHeaders : [], // variable names
  dataInputs : [], // input field ID's
  dataUnits : [],
  dataMin : [],
  dataMax : [],
  dataDefault : [],
  dataValues : [],

  // define arrays to hold output variables
  // these will be filled with initial values in method reset()
  // *** e.g., Trxr : [],

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  stripData : [], // for strip chart plots, plot script requires this name

  // allow this unit to take more than one step within one main loop step in updateState method
  unitStepRepeats : 1,
  unitTimeStep : simParams.simTimeStep / this.unitStepRepeats,

  ssCheckSum : 0, // used to check for steady state
  residenceTime : 0, // for timing checks for steady state check
  // residenceTime is set in this unit's updateUIparams()

  initialize : function() {
    //
    let v = 0;
    this.dataHeaders[v] = 'UA';
    this.dataInputs[v] = 'input_field_enterjacketUA';
    this.dataUnits[v] = 'kJ/s/K';
    this.dataMin[v] = 0;
    this.dataMax[v] = 100;
    this.dataDefault[v] = 20;
    //
    // END OF INPUT VARS
    // record number of input variables, varCount
    // used, e.g., in copy data to table
    //
    this.varCount = v;
    //
    // OUTPUT VARS
    //
    v = 1;
    this.dataHeaders[v] = 'Tj';
    this.dataUnits[v] =  'K';
    this.dataMin[v] = 200;
    this.dataMax[v] = 500;
    //
  }, // END initialize()

  reset : function(){
    //
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.

    this.updateUIparams(); // this first, then set other values as needed

    // set state variables not set by updateUIparams() to initial settings

    // need to directly set controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.ssFlag = false;

    // set to zero ssCheckSum used to check for steady state by this unit
    this.ssCheckSum = 0;

    // set state variables not set by updateUIparams to initial settings
    this.Tj = this.initialTj;

    // each unit has its own data arrays for plots and canvases

    // initialize strip chart data array
    // initPlotData(numStripVars,numStripPts)
    let numStripVars = 1; // jacket T here
    let numStripPts = plotInfo[0]['numberPoints'];
    this.stripData = plotter.initPlotData(numStripVars,numStripPts);

    let kn = 0;
    for (k = 0; k <= numStripPts; k += 1) {
      kn = k * simParams.simTimeStep * simParams.simStepRepeats;
      // x-axis values
      // x-axis values will not change during sim
      // XXX change to get number vars for this plotInfo variable
      //     so can put in repeat - or better yet, a function
      //     and same for y-axis below
      // first index specifies which variable in plot data array
      this.stripData[0][k][0] = kn;
      // y-axis values
      this.stripData[0][k][1] = this.dataMin[1];
    }

  }, // END reset method

  updateUIparams : function() {
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();
    // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
    this.ssCheckSum = 1;

    // check input fields for new values
    // function getInputValue() is defined in file process_interfacer.js
    // getInputValue(unit # in processUnits object, variable # in dataInputs array)
    // see variable numbers above in initialize()
    // note: this.dataValues.[pVar]
    //   is only used in copyData() to report input values
    //
    let unum = this.unitIndex;
    //
    this.UA = this.dataValues[0] = interfacer.getInputValue(unum, 0);

  }, // END updateUIparams method

  updateState : function() {
    //
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE
    //
    // WARNING: this method must NOT contain references to other units!
    //          get info from other units ONLY in updateInputs() method
    //
    // check for change in overall main time step simTimeStep
    this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

    let invTau = this.flowRate/ this.vol;

    let dTdt = invTau*(this.TjIn - this.Tj) +
               (this.Trxr- this.Tj) * this.UA/(this.vol*this.rho*this.Cp);
    this.Tj = this.Tj + this.unitTimeStep * dTdt;

  }, // END updateState method

  updateDisplay : function(){
    // update display elements which only depend on this process unit
    // except do all plotting at main controller updateDisplay
    // since some plots may contain data from more than one process unit

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    let numStripPoints = plotInfo[0]['numberPoints'];

    // handle Tj
    v = 0;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [ 0, this.Tj ] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // re-number the x-axis values to equal time values
    // so they stay the same after updating y-axis values
    let timeStep = simParams.simTimeStep * simParams.simStepRepeats;
    v = 0; // just one var in this display method, so don't need repeat
    // to do all vars, for (v = 0; v < numStripVariables; v += 1)
    for (p = 0; p <= numStripPoints; p += 1) { // note = in p <= numStripPoints
      // note want p <= numStripPoints so get # 0 to  # numStripPoints of points
      // want next line for newest data at max time
      this.stripData[v][p][0] = p * timeStep;
      // want next line for newest data at zero time
      // this.stripData[v][p][0] = (numStripPoints - p) * timeStep;
    }

  }, // END updateDisplay()

  checkForSteadyState : function() {
    // required - called by controller object
    // returns ssFlag, true if this unit at SS, false if not
    // *IF* NOT used to check for SS *AND* another unit IS checked,
    // which can not be at SS, *THEN* return ssFlag = true to calling unit
    // HOWEVER, if this unit has UI inputs, need to be able to return false
    let ssFlag = true;
    // this.ssCheckSum set != 0 on updateUIparams() execution
    if (this.ssCheckSum != 0) {
      ssFlag = false;
    }
    this.ssCheckSum = 0;
    return ssFlag;
  } // END checkForSteadyState()

}; // END unit 3, jacket

processUnits[4] = {
  //
  unitIndex : 4, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'reactor temperature controller',

  // for other info shared with other units and objects, see public properties
  // and search for controller. & interfacer. & plotter. & simParams. & plotInfo

  // *******************************************
  //  define INPUT CONNECTIONS from other units
  // *******************************************

  // define this unit's variables that are to receive input values from other units

  Trxr : 0, // will get Trxr from unit 1 in updateInputs

  updateInputs : function() {
    this.Trxr = processUnits[1].Trxr;
  },

  // *******************************************
  //  define OUTPUT CONNECTIONS to other units
  // *******************************************

  command : 0, // output to unit 2

  // *******************************************

  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS...
  // SEE dataInputs array in initialize() method for input field ID's

  // NOTE: this unit has a special method, changeMode, to handle UI radio buttons

  // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***
  // ***   EXCEPT TO HTML ID'S IN method initialize(), array dataInputs    ***

  // define main inputs
  // values will be set in method intialize()
  resetTime   : 30, // integral mode reset time
  gain				: 300, // controller gain
  setPoint		: 340, // (K) desired reactor temperature
  manualCommand : 348, // (K)
  manualBias  : 300, // (K), command at zero error
  initialCommand  : 300, // controller command signal (coef for unit_2)
  errorIntegral   : 0, // integral error
  mode : "manual", // auto or manual, see changeMode() below

  // define arrays to hold info for variables
  // these will be filled with values in method initialize()
  dataHeaders : [], // variable names
  dataInputs : [], // input field ID's
  dataUnits : [],
  dataMin : [],
  dataMax : [],
  dataDefault : [],
  dataValues : [],

  // allow this unit to take more than one step within one main loop step in updateState method
  unitStepRepeats : 1,
  unitTimeStep : simParams.simTimeStep / this.unitStepRepeats,

  ssCheckSum : 0, // used to check for steady state
  residenceTime : 0, // for timing checks for steady state check
  // residenceTime is set in this unit's updateUIparams()

  initialize : function() {
    //
    let v = 0;
    this.dataHeaders[v] = 'resetTime';
    this.dataInputs[v] = 'input_field_enterResetTime';
    this.dataUnits[v] = 's';
    this.dataMin[v] = 0;
    this.dataMax[v] = 100;
    this.dataDefault[v] = 30;
    //
    v = 1;
    this.dataHeaders[v] = 'gain';
    this.dataInputs[v] = 'input_field_enterGain';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1000;
    this.dataDefault[v] = 300;
    //
    v = 2;
    this.dataHeaders[v] = 'setPoint';
    this.dataInputs[v] = 'input_field_enterSetpoint';
    this.dataUnits[v] = 'K';
    this.dataMin[v] = 300;
    this.dataMax[v] = 500;
    this.dataDefault[v] = 340;
    //
    v = 3;
    this.dataHeaders[v] = 'manualCommand';
    this.dataInputs[v] = 'input_field_enterJacketFeedTTemp';
    this.dataUnits[v] = 'K';
    this.dataMin[v] = 200;
    this.dataMax[v] = 450;
    this.dataDefault[v] = 348;
    //
    // SPECIAL - SET CHECKED OF RADIO BUTTONS TO MATCH THIS SETTING
    // PAGE RELOAD DOES NOT CHANGE CHECKED BUT DOES CALL initialize
    document.getElementById("radio_controllerAUTO").checked = false;
    document.getElementById("radio_controllerMANUAL").checked = true;
    //
    // END OF INPUT VARS
    // record number of input variables, varCount
    // used, e.g., in copy data to table
    //
    // SPECIAL - use v-1 to not report manualCommand in copy data table header
    //           but need manualCommand as input var to get from html input
    this.varCount = v-1;
    //
    // OUTPUT VARS
    //
    v = 4;
    this.dataHeaders[v] = 'command';
    this.dataUnits[v] =  'K';
    this.dataMin[v] = 300;
    this.dataMax[v] = 450;
    //
  }, // END initialize method

  reset : function() {
    //
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.

    this.updateUIparams(); // this first, then set other values as needed

    // set state variables not set by updateUIparams() to initial settings

    // need to directly set controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.ssFlag = false;

    // set to zero ssCheckSum used to check for steady state by this unit
    this.ssCheckSum = 0;

    // set state variables not set by updateUIparams to initial settings
    this.errorIntegral = 0;
    this.command = this.initialCommand;

  },  // END reset method

  changeMode : function(){
    let el = document.querySelector("#radio_controllerAUTO");
    if (el.checked){
      this.mode = "auto";
      this.manualBias = this.command; // for "bumpless transfer"
    } else {
      this.mode = "manual";
    }

    // zero errorIntegral on all changeModes
    this.errorIntegral = 0;

    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();
    // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
    this.ssCheckSum = 1;

  }, // end changeMode function

  updateUIparams : function() {
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();
    // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
    this.ssCheckSum = 1;

    // check input fields for new values
    // function getInputValue() is defined in file process_interfacer.js
    // getInputValue(unit # in processUnits object, variable # in dataInputs array)
    // see variable numbers above in initialize()
    // note: this.dataValues.[pVar]
    //   is only used in copyData() to report input values
    //
    let unum = this.unitIndex;
    //
    this.resetTime = this.dataValues[0] = interfacer.getInputValue(unum, 0);
    this.gain = this.dataValues[1] = interfacer.getInputValue(unum, 1);
    this.setPoint = this.dataValues[2] = interfacer.getInputValue(unum, 2);
    this.manualCommand = this.dataValues[3] = interfacer.getInputValue(unum, 3);

  }, // END updateUIparams method

  updateState : function() {
    //
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE
    //
    // WARNING: this method must NOT contain references to other units!
    //          get info from other units ONLY in updateInputs() method
    //
    // check for change in overall main time step simTimeStep
    this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

    // compute new value of PI controller command
    // manual bias set to current command when switching to auto in changeMode()
    let error = this.setPoint - this.Trxr;
    this.command = this.manualBias + this.gain *
                  (error + (1/this.resetTime) * this.errorIntegral);

    // stop integration at command limits
    // to prevent integral windup
    let v = 4; // 4 is command
    if (this.command > this.dataMax[v]){
      this.command = this.dataMax[v];
    } else if (this.command < this.dataMin[v]){
      this.command = this.dataMin[v];
    } else {
      // not at limit, OK to update integral of error
      // update errorIntegral only after it is used above to update this.command
      this.errorIntegral = this.errorIntegral + error * simParams.simTimeStep; // update integral of error
    }

    if (this.mode == "manual"){
      // replace command with value entered in input in page
      // let el = document.querySelector("#enterJacketFeedTTemp");
      // this.command = el.value;
      this.command = this.manualCommand;
    } else {
      // in auto mode, use command computed above
    }

  }, // end updateState method

  updateDisplay : function(){
    // nothing to do here
  }, // END of updateDisplay()

  checkForSteadyState : function() {
    // required - called by controller object
    // returns ssFlag, true if this unit at SS, false if not
    // *IF* NOT used to check for SS *AND* another unit IS checked,
    // which can not be at SS, *THEN* return ssFlag = true to calling unit
    // HOWEVER, if this unit has UI inputs, need to be able to return false
    let ssFlag = true;
    // this.ssCheckSum set != 0 on updateUIparams() execution
    if (this.ssCheckSum != 0) {
      ssFlag = false;
    }
    this.ssCheckSum = 0;
    return ssFlag;
  } // END OF checkForSteadyState()

}; // END unit 4, controller
