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
  // contents must be only the process units as child objects
  // children optionally can be defined in separate script files, e.g., as puHeatExchanger,
  // then inserted into processUnits, e.g., processUnits[0] = puHeatExchanger,
  // then cleared for garbage collection, e.g., puHeatExchanger = null;
  // units defined in separate files makes them easier to edit

// load process unit objects into this object
// as indexed objects in order to allow object controller
// to access them in a repeat with numeric index

processUnits[0] = {
  unitIndex : 0, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'reactor feed',

  // SUMMARY OF DEPENDENCIES

  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, used in updateInputs() method
  getInputs : function() {
    let inputs = [];
    // *** e.g., inputs[0] = processUnits[1]['Tcold'][0]; // HX T cold out = RXR Tin
    return inputs;
  },

  // USES OBJECT simParams
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   unit 1 USES unit 0 rate
  //   unit 1 USES unit 0 conc
  //   unit 1 USES unit 0 TTemp
  //   [0] reactor feed, [1] reactor, [2] feed to jacket, [3] jacket, [4] controller
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, see updateInputs below
  //   none
  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS, see updateUIparams below

  // define main parameters
  // values will be set in method intialize()
  flowRate : 0, // (m3/s), feed flow rate
  conc : 0, // (mol/m3)
  TTemp : 300, // (K), TTemp = temperature

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
    this.dataInitial[v] = 0.005;
    this.flowRate = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.flowRate; // current input value for reporting
    //
    let v = 1;
    this.dataHeaders[v] = 'feedConc';
    this.dataInputs[v] = 'input_field_enterFeedConc';
    this.dataUnits[v] = 'mol/m3';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1000;
    this.dataInitial[v] = 400;
    this.conc = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.conc; // current input value for reporting
    //
    let v = 2;
    this.dataHeaders[v] = 'feedTemp';
    this.dataInputs[v] = 'input_field_enterFeedTTemp';
    this.dataUnits[v] = 'K';
    this.dataMin[v] = 200;
    this.dataMax[v] = 500;
    this.dataInitial[v] = 300;
    this.TTemp = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.TTemp; // current input value for reporting
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table
    //
    this.VarCount = v;
    //
    // OUTPUT VARS
    //
    // v = 7;
    // this.dataHeaders[v] = 'Trxr';
    // this.dataUnits[v] =  'K';
    // // Trxr dataMin & dataMax can be changed in updateUIparams()
    // this.dataMin[v] = 200;
    // this.dataMax[v] = 500;
    //
  }, // END of initialize()

  // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***

  reset : function(){
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

    // need to directly set controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.ssFlag = false;

    // set to zero ssCheckSum used to check for steady state by this unit
    this.ssCheckSum = 0;

    // check input fields for new values
    // function getInputValue() is defined in file process_interface.js
    // getInputValue(unit index in processUnits, let index in input arrays)
    // see variable numbers above in initialize()
    // note: this.dataValues.[pVar]
    //   is only used in copyData() to report input values
    //
    let unum = this.unitIndex;
    //
    this.flowRate = this.dataValues[0] = interface.getInputValue(unum,0);
    this.conc = this.dataValues[1] = interface.getInputValue(unum,1);
    this.TTemp = this.dataValues[2] = interface.getInputValue(unum,2);

}, END updateUIparams

  updateInputs : function(){
    // GET INPUT CONNECTION VALUES FROM OTHER UNITS FROM PREVIOUS TIME STEP,
    // SINCE updateInputs IS CALLED BEFORE updateState IN EACH TIME STEP
    //    none for this unit
  },

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
    // nothing to do here for this unit
    //
  }, // end updateState method

  updateDisplay : function(){
    // empty
  }, // END of updateDisplay()

  checkForSteadyState : function() {
    // required - called by controller object
    // if not used to check for SS, return ssFlag = true to calling unit
    // returns ssFlag, true if this unit at SS, false if not
    // uses and sets this.ssCheckSum
    // this.ssCheckSum can be set by reset() and updateUIparams()
    // check for SS in order to save CPU time when sim is at steady state
    // check for SS by checking for any significant change in array end values
    // but wait at least one residence time after the previous check
    // to allow changes to propagate down unit
    //
    let ssFlag = true;
    return ssFlag;
  } // END OF checkForSteadyState()

}; // END unit 0

processUnits[1] = {
  unitIndex : 1, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'reactor',

  // SUMMARY OF DEPENDENCIES
  //
  // USES OBJECT simParams
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   unit 4 USES unit 1 TTemp
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, see updateInputs below
  //   unit 1 USES unit 0 rate // flow rate
  //   unit 1 USES unit 0 conc
  //   unit 1 USES unit 0 TTemp // TTemp = temperature
  //   unit 1 USES unit 3 TTemp
  //   unit 1 USES unit 3 UA
  //   [0] reactor feed, [1] reactor, [2] feed to jacket, [3] jacket, [4] controller

  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, used in updateInputs() method
  getInputs : function() {
    let inputs = [];
    inputs[0] = processUnits[0].flowRate;
    inputs[1] = processUnits[0].conc;
    inputs[2] = processUnits[0].TTemp;
    inputs[3] = processUnits[3].TTemp;
    inputs[4] = processUnits[3].UA;
    return inputs;
  },

  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS...
  // SEE dataInputs array in initialize() method for input field ID's

  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, used in updateDisplay() method
  // *** e.g., displayReactorLeftConc: 'field_reactor_left_conc',

  // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***
  // ***   EXCEPT TO HTML ID'S IN method initialize(), array dataInputs    ***

  // define main parameters
  // values will be set in method intialize()
  k300 : 5e-6, // (1/s), reaction rate coefficient value at 300 K
  Ea : 200, // (kJ/mol), reaction activation energy
  delH : -250, // (kJ/mol), reaction heat of reaction (exothermic < 0)

  // define arrays to hold info for variables
  // these will be filled with values in method initialize()
  dataHeaders : [], // variable names
  dataInputs : [], // input field ID's
  dataUnits : [],
  dataMin : [],
  dataMax : [],
  dataInitial : [],
  dataValues : [],

  // define arrays to hold output variables
  // these will be filled with initial values in method reset()
  // *** e.g., Trxr : [],
  TTemp : [], // (K), TTemp = temperature in Kelvin
  conc : [], // (mol/m3), reactant concentration

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  profileData : [], // for profile plots, plot script requires this name
  stripData : [], // for strip chart plots, plot script requires this name
  colorCanvasData : [], // for color canvas plots, plot script requires this name

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

  flowRate  : 0, // will get flowRate from unit 0 in updateInputs
  concIn    : 0, // will get concIn from unit 0 in updateInputs
  TTemp0    : 0, // will get TTemp0 from unit 0 in updateInputs
  TTemp3    : 0, // will get TTemp3 from unit 3 in updateInputs
  UA        : 0, // will get UA from unit 3 in updateInputs

  initialize : function() {
    //
    let v = 0;
    this.dataHeaders[v] = 'k300';
    this.dataInputs[v] = 'input_field_enterk300';
    this.dataUnits[v] = '1/s';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1;
    this.dataInitial[v] = 5e-6;
    this.k300 = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.k300; // current input value for reporting
    //
    let v = 1;
    this.dataHeaders[v] = 'Ea';
    this.dataInputs[v] = 'input_field_enterEa';
    this.dataUnits[v] = 'kJ/mol';
    this.dataMin[v] = 0;
    this.dataMax[v] = 500;
    this.dataInitial[v] = 200
    this.Ea = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Ea; // current input value for reporting
    //
    let v = 2;
    this.dataHeaders[v] = 'delH';
    this.dataInputs[v] = 'input_field_enterdelH';
    this.dataUnits[v] = 'kJ/mol';
    this.dataMin[v] = -400;
    this.dataMax[v] = 400;
    this.dataInitial[v] = -250
    this.delH = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.delH; // current input value for reporting
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table
    //
    this.VarCount = v;
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
    this.dataHeaders[v] = 'conc';
    this.dataUnits[v] =  'mol/m3';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1000;
    //
  }, // END of initialize()

  // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***

  reset : function() {

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

    // XXX ??? these are computation inputs as well as outputs
    // XXX ??? where are arrays filled ??
    // set state variables not set by updateUIparams to initial settings
    this.TTemp = this.initialTTemp; // (K), TTemp = temperature in Kelvin
    this.conc = this.initialConc;
  },

  updateUIparams : function() {
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // need to directly set controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.ssFlag = false;

    // set to zero ssCheckSum used to check for steady state by this unit
    this.ssCheckSum = 0;

    // check input fields for new values
    // function getInputValue() is defined in file process_interface.js
    // getInputValue(unit index in processUnits, let index in input arrays)
    // see variable numbers above in initialize()
    // note: this.dataValues.[pVar]
    //   is only used in copyData() to report input values
    //
    let unum = this.unitIndex;
    //
    this.k300 = this.dataValues[0] = interface.getInputValue(unum, 0);
    this.Ea = this.dataValues[1] = interface.getInputValue(unum, 1);
    this.delH = this.dataValues[2] = interface.getInputValue(unum, 2);

  }, // END updateUIparams()

  updateInputs : function() {
    //
    // GET INPUT CONNECTION VALUES FROM OTHER UNITS FROM PREVIOUS TIME STEP,
    //   SINCE updateInputs IS CALLED BEFORE updateState IN EACH TIME STEP
    // SPECIFY REFERENCES TO INPUTS ABOVE in this unit definition

    // check for change in overall main time step simTimeStep
    this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

    // *** GET REACTOR INLET T FROM COLD OUT OF HEAT EXCHANGER ***
    // get array of current input values to this unit from other units
    let inputs = this.getInputs();
    this.flowRate = inputs[0];
    this.concIn = inputs[1];
    this.TTemp0 = inputs[2];
    this.TTemp3 = inputs[3];
    this.UA = inputs[4];

  }, // END updateInputs()

  updateState : function() {
    //
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE
    //
    // WARNING: this method must NOT contain references to other units!
    //          get info from other units ONLY in updateInputs() method

    let krxn = this.k300 * Math.exp(-(this.Ea/this.Rg)*(1/this.TTemp - 1/300));
    let rate = -krxn * this.conc;
    let invTau = this.flowRate / this.vol; // inverse of space time = space velocity

    let dCdt = invTau * (this.concIn - this.conc) + rate;
    let dC = this.unitTimeStep * dCdt;
    // update conc
    this.conc = this.conc + dC;
    if (this.conc < 0){this.conc = 0;}

    let dTdt = invTau*(this.TTemp0 - this.TTemp) + rate*this.delH/(this.rho*this.Cp) +
               (this.TTemp3 - this.TTemp) * this.UA /(this.vol*this.rho*this.Cp);
    let dTTemp = this.unitTimeStep * dTdt;
    // update TTemp
    this.TTemp = this.TTemp + dTTemp;

  }, // end updateState method

  updateDisplay : function() {

    // document.getElementById("demo01").innerHTML = "processUnits[0].flowRate = " + this.rate;
    let el = document.querySelector("#div_PLOTDIV_reactorContents");
    // reactant is blue, product is red, this.conc is reactant conc
    // xxx assume here max conc is 400 but should make it a variable
    let concB = Math.round((this.conc)/400 * 255);
    let concR = 255 - concB;
    let concColor = "rgb(" + concR + ", 0, " + concB + ")";
    // alert("concColor = " + concColor); // check results
    // "background-color" in index.css did not work
    el.style.backgroundColor = concColor;

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    let numStripPoints = plotsObj[0]['numberPoints'];

    // XXX see if can make actions below for strip chart into general function

    // handle reactant conc
    v = 0;
    tempArray = stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [ 0, this.conc ] );
    // update the variable being processed
    stripData[v] = tempArray;

    // handle reactor T
    v = 1;
    tempArray = stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [ 0, this.TTemp ] );
    // update the variable being processed
    stripData[v] = tempArray;

    // re-number the x-axis values to equal time values
    // so they stay the same after updating y-axis values
    let timeStep = simParams.simTimeStep * simParams.simStepRepeats;
    for (v = 0; v < 2; v += 1) {
      // only need to do for vars 0 and 1 in this display method
      // to do all vars, for (v = 0; v < numStripVariables; v += 1)
      for (p = 0; p <= numStripPoints; p += 1) { // note = in p <= numStripPoints
        // note want p <= numStripPoints so get # 0 to  # numStripPoints of points
        // want next line for newest data at max time
        stripData[v][p][0] = p * timeStep;
        // want next line for newest data at zero time
        // stripData[v][p][0] = (numStripPoints - p) * timeStep;
      }
    }

  }, // END of updateDisplay()

  checkForSteadyState : function() {
    // required - called by controller object
    // if not used to check for SS, return ssFlag = true to calling unit
    // returns ssFlag, true if this unit at SS, false if not
    // uses and sets this.ssCheckSum
    // this.ssCheckSum can be set by reset() and updateUIparams()
    // check for SS in order to save CPU time when sim is at steady state
    // check for SS by checking for any significant change in array end values
    // but wait at least one residence time after the previous check
    // to allow changes to propagate down unit
    //
    let ssFlag = true;
    return ssFlag;
  } // END OF checkForSteadyState()

}; // END unit 1

processUnits[2] = {
  unitIndex : 2, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'feed to heat transfer jacket',

  // SUMMARY OF DEPENDENCIES
  //
  // USES OBJECT simParams
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   unit 3 USES unit 2 rate
  //   unit 3 USES unit 2 TTemp // TTemp = temperature
  //   [0] reactor feed, [1] reactor, [2] feed to jacket, [3] jacket, [4] controller
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, see updateInputs below
  //   unit 2 USES processUnits[4].command
  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS, see updateUIparams below

  // variables defined here are available to all functions inside this unit

  initialRate : 1, // (m3/s), heat transfer liquid flow rate
  rate : this.initialRate,

  initialTTemp : 350, // (K), TTemp = temperature
  TTemp : this.initialTTemp,

  command : 0, // get command from unit 5 in updateInputs

  reset : function(){
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.
    this.updateUIparams(); // this first, then set other values as needed
    // this.rate set by updateUIparams
    // set state variables not set by updateUIparams to initial settings
    this.TTemp = this.initialTTemp;
  },  // << COMMAS ARE REQUIRED AT END OF EACH OBJECT PROPERTY & FUNCTION EXCEPT LAST ONE (NO ;)

  updateUIparams : function(){
    this.rate = Number(input_field_enterJacketFlowRate.value);
  },

  updateInputs : function(){
    // GET INPUT CONNECTION VALUES FROM OTHER UNITS FROM PREVIOUS TIME STEP,
    // SINCE updateInputs IS CALLED BEFORE updateState IN EACH TIME STEP
    this.command = processUnits[4].command;
  },

  updateState : function(){
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE

    // get feed T from controller command
    this.TTemp = this.command;

  }, // end updateState method

  updateDisplay : function(){
    // document.getElementById("demo01").innerHTML = "processUnits[0].flowRate = " + this.rate;

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    let numStripPoints = plotsObj[0]['numberPoints'];

    // XXX see if can make actions below for strip chart into general function

    // handle jacket inlet T
    v = 2;
    tempArray = stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [ 0, this.TTemp ] );
    // update the variable being processed
    stripData[v] = tempArray;

    // re-number the x-axis values to equal time values
    // so they stay the same after updating y-axis values
    let timeStep = simParams.simTimeStep * simParams.simStepRepeats;
    v = 2; // just one var in this display method, so don't need repeat
    // to do all vars, for (v = 0; v < numStripVariables; v += 1)
    for (p = 0; p <= numStripPoints; p += 1) { // note = in p <= numStripPoints
      // note want p <= numStripPoints so get # 0 to  # numStripPoints of points
      // want next line for newest data at max time
      stripData[v][p][0] = p * timeStep;
      // want next line for newest data at zero time
      // stripData[v][p][0] = (numStripPoints - p) * timeStep;
    }

  }, // END of updateDisplay()

  checkForSteadyState : function() {
    // required - called by controller object
    // if not used to check for SS, return ssFlag = true to calling unit
    // returns ssFlag, true if this unit at SS, false if not
    // uses and sets this.ssCheckSum
    // this.ssCheckSum can be set by reset() and updateUIparams()
    // check for SS in order to save CPU time when sim is at steady state
    // check for SS by checking for any significant change in array end values
    // but wait at least one residence time after the previous check
    // to allow changes to propagate down unit
    //
    let ssFlag = true;
    return ssFlag;
  } // END OF checkForSteadyState()

}; // END unit 2

processUnits[3] = {
  unitIndex : 3, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'heat transfer jacket',

  // SUMMARY OF DEPENDENCIES
  //
  // USES OBJECT simParams
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   unit 1 USES unit 3 TTemp // TTemp = temperature
  //   [0] reactor feed, [1] reactor, [2] feed to jacket, [3] jacket, [4] controller
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, see updateInputs below
  //   unit 3 USES unit 1 TTemp
  //   unit 3 USES unit 2 rate // flow rate
  //   unit 3 USES unit 2 TTemp
  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS, see updateUIparams below

  // variables defined here are available to all functions inside this unit

  vol       : 0.02, // (m3), heat transfer jacket volume
  rho       : 1000, // (kg/m3), heat transfer liquid density
  Cp        : 2.0, // (kJ/kg/K), heat transfer liquid heat capacity

  initialTTemp : 350, // (K), TTemp = temperature
  TTemp     : this.initialTTemp,

  flowRate  : 0, // will get flowRate from unit 3 in updateInputs
  TTemp2    : 0, // will get TTemp2 from unit 2 in updateInputs
  TTemp3    : 0, // will get TTemp3 from unit 3 in updateInputs

  reset : function(){
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.
    this.updateUIparams(); // this first, then set other values as needed
    // set state variables not set by updateUIparams to initial settings
    this.TTemp = this.initialTTemp;
  },  // << COMMAS ARE REQUIRED AT END OF EACH OBJECT PROPERTY & FUNCTION EXCEPT LAST ONE (NO ;)

  updateUIparams : function(){
    this.UA = Number(input_field_enterjacketUA.value); // (kJ/s/K), heat transfer area * coefficient
  },

  updateInputs : function(){
    // GET INPUT CONNECTION VALUES FROM OTHER UNITS FROM PREVIOUS TIME STEP,
    // SINCE updateInputs IS CALLED BEFORE updateState IN EACH TIME STEP
    this.flowRate = processUnits[2].rate;
    this.TTemp2 = processUnits[1].TTemp;
    this.TTemp3 = processUnits[2].TTemp;
  },

  updateState : function(){
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE

    let invTau = this.flowRate/ this.vol;

    let dTdt = invTau*(this.TTemp3 - this.TTemp) +
               (this.TTemp2- this.TTemp) * this.UA/(this.vol*this.rho*this.Cp);
    let dTTemp = simParams.simTimeStep * dTdt;
    // update TTemp
    this.TTemp = this.TTemp + dTTemp;

  }, // end updateState method

  updateDisplay : function(){
    // document.getElementById("demo01").innerHTML = "processUnits[0].flowRate = " + this.rate;

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    let numStripPoints = plotsObj[0]['numberPoints'];

    // XXX see if can make actions below for strip chart into general function

    // handle jacket T
    v = 3;
    tempArray = stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [ 0, this.TTemp ] );
    // update the variable being processed
    stripData[v] = tempArray;

    // re-number the x-axis values to equal time values
    // so they stay the same after updating y-axis values
    let timeStep = simParams.simTimeStep * simParams.simStepRepeats;
    v = 3; // just one var in this display method, so don't need repeat
    // to do all vars, for (v = 0; v < numStripVariables; v += 1)
    for (p = 0; p <= numStripPoints; p += 1) { // note = in p <= numStripPoints
      // note want p <= numStripPoints so get # 0 to  # numStripPoints of points
      // want next line for newest data at max time
      stripData[v][p][0] = p * timeStep;
      // want next line for newest data at zero time
      // stripData[v][p][0] = (numStripPoints - p) * timeStep;
    }
  }, // END of updateDisplay()

  checkForSteadyState : function() {
    // required - called by controller object
    // if not used to check for SS, return ssFlag = true to calling unit
    // returns ssFlag, true if this unit at SS, false if not
    // uses and sets this.ssCheckSum
    // this.ssCheckSum can be set by reset() and updateUIparams()
    // check for SS in order to save CPU time when sim is at steady state
    // check for SS by checking for any significant change in array end values
    // but wait at least one residence time after the previous check
    // to allow changes to propagate down unit
    //
    let ssFlag = true;
    return ssFlag;
  } // END OF checkForSteadyState()

}; // END unit 3

processUnits[4] = {
  unitIndex : 4, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'reactor temperature controller',

  // SUMMARY OF DEPENDENCIES
  // USES OBJECT simParams
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //   unit 2 USES processUnits[4].command - manipulated variable
  //   [0] reactor feed, [1] reactor, [2] feed to jacket, [3] jacket, [4] controller
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, see updateInputs below
  //   unit 4 USES unit 1 TTemp - controlled variable
  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS, see updateUIparams below

  // variables defined here are available to all functions inside this unit

  setPoint		: 330, // (K) desired reactor temperature
  gain				: 100, // controller gain
  resetTime   : 3, // integral mode reset time
  manualBias  : 300, // (K), command at zero error
  initialCommand  : 300, // controller command signal (coef for unit_2)
  command         : this.initialCommand,
  errorIntegral   : 0, // integral error

  mode        : "manual", // auto or manual, see changeMode() below
  manualCommand : 348,

  TTemp2  : 0, // will get TTemp2 from unit 2 in updateInputs

  reset : function(){
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.
    this.updateUIparams(); // this first, then set other values as needed
    // set state variables not set by updateUIparams to initial settings
    this.errorIntegral = 0;
    this.command = this.initialCommand;
  },  // << COMMAS ARE REQUIRED AT END OF EACH OBJECT PROPERTY & FUNCTION EXCEPT LAST ONE (NO ;)

  changeMode : function(){
    // below does not work when html input tag id="input.radio_controllerAUTO"
    // use instead id="radio_controllerAUTO" - same for MANUAL & AUTO
    let el = document.querySelector("#radio_controllerAUTO");
    let el2 = document.querySelector("#enterJacketFeedTTemp");
    if (el.checked){
      // alert("controller in AUTO mode");
      this.mode = "auto"
      // TWO LINES BELOW USED WHEN TOGGLE THIS INPUT HIDDEN-VISIBLE
      //   el2.type = "hidden";
      //   document.getElementById("enterJacketFeedTTempLABEL").style.visibility = "hidden";
    } else {
      // alert("controller in MANUAL mode");
      this.mode = "manual"
      // TWO LINES BELOW USED WHEN TOGGLE THIS INPUT HIDDEN-VISIBLE
      //   el2.type = "input";
      //   document.getElementById("enterJacketFeedTTempLABEL").style.visibility = "visible";
    }
  }, // end changeMode function

  updateUIparams : function(){
    this.resetTime = Number(input_field_enterResetTime.value);
    this.gain = Number(input_field_enterGain.value);
    this.setPoint = Number(input_field_enterSetpoint.value);
    // at least for input below, value returned is not a number, probably text
    // so convert this and others to numbers
    // noticed problem in process_units copyData function, .toFixed(2) didn't work
    // MAYBE RELATED TO HOW INPUT DEFINED IN HTML???
    this.manualCommand = Number(input_field_enterJacketFeedTTemp.value);
  },

  updateInputs : function(){
    // GET INPUT CONNECTION VALUES FROM OTHER UNITS FROM PREVIOUS TIME STEP,
    // SINCE updateInputs IS CALLED BEFORE updateState IN EACH TIME STEP
    this.TTemp2 = processUnits[1].TTemp;
  },

  updateState : function(){
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE

    // compute new value of PI controller command
    let error = this.setPoint - this.TTemp2;
    this.command = this.manualBias + this.gain *
                  (error + (1/this.resetTime) * this.errorIntegral);

    // stop integration at command limits
    // to prevent integral windup
    if (this.command > 450){
      this.command = 450;
    } else if (this.command < 200){
      this.command = 200;
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
    // document.getElementById("demo05").innerHTML = "processUnits[4].command = " + this.command;
  }, // END of updateDisplay()

  checkForSteadyState : function() {
    // required - called by controller object
    // if not used to check for SS, return ssFlag = true to calling unit
    // returns ssFlag, true if this unit at SS, false if not
    // uses and sets this.ssCheckSum
    // this.ssCheckSum can be set by reset() and updateUIparams()
    // check for SS in order to save CPU time when sim is at steady state
    // check for SS by checking for any significant change in array end values
    // but wait at least one residence time after the previous check
    // to allow changes to propagate down unit
    //
    let ssFlag = true;
    return ssFlag;
  } // END OF checkForSteadyState()

}; // END unit 4
