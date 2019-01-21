/*
  Design, text, images and code by Richard K. Herz, 2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// ------------ PROCESS UNIT OBJECT DEFINITIONS ----------------------

// EACH PROCESS UNIT DEFINITION MUST CONTAIN AT LEAST THESE 7 FUNCTIONS:
//  initialize, reset, updateUIparams, updateInputs, updateState,
//  updateDisplay, checkForSteadyState
// THESE FUNCTION DEFINITIONS MAY BE EMPTY BUT MUST BE PRESENT
//
// EACH PROCESS UNIT DEFINITION MUST DEFINE the variable residenceTime

// -------------------------------------------------------------------

let puAdiabaticPackedBedPFR = {
  unitIndex : 0, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'Adiabatic Packed Bed PFR',

  // SUMMARY OF DEPENDENCIES
  //
  //  THIS OBJECT HAS MULTIPLE I/O CONNECTIONS TO HTML
  //
  //  USES FROM OBJECT simParams the following:
  //    GETS simParams.simTimeStep
  //  OBJECT controller USES FROM THIS OBJECT:
  //    variable residenceTime
  //  USES FROM OBJECT puCounterCurrentHeatExchanger, here as processUnits[1], the following:
  //    Tcold[] - heat exchanger cold outlet T is reactor inlet T
  //  OBJECT plotInfo USES FROM THIS OBJECT:
  //    numNodes, and possibly others
  //  OBJECT puCounterCurrentHeatExchanger, here as processUnits[1],
  //    USES FROM THIS OBJECT:
  //      Trxr[] - reactor outlet T is heat exchanger hot inlet T
  //  CALLS TO FUNCTIONS HERE ARE SENT BY THE FOLLOWING EXTERNAL FUNCTIONS:
  //    initialize() sent by openThisLab() in object controller
  //    reset() sent by resetThisLab() in object controller
  //    updateInputs() & updateState() sent by updateProcessUnits() in object controller
  //    updateDisplay() sent by updateDisplay() in object controller
  //    updateUIparams() sent by updateUIparams() in object controller
  //    checkForSteadyState() sent by checkForSteadyState() in object controller
  //  THE FOLLOWING EXTERNAL FUNCTIONS USE VALUES FROM THIS OBJECT:
  //    copyData() in object interfacer uses name, varCount, dataHeaders[],
  //        dataUnits[], dataValues[], profileData[], stripData[]
  //    getInputValue() in object interfacer uses dataInputs[], dataInitial[],
  //        dataMin[], dataMax[]
  //    getPlotData() in object plotFlot uses profileData[], stripData[]
  //    plotColorCanvasPlot() in object plotter uses colorCanvasData[]

  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, used in updateInputs() method
  //
  // define inputs array, which is processed in this unit's updateInputs method
  // where sourceVarNameString is name of a public var in source unit without 'this.'
  // where thisUnitVarNameString is variable name in this unit, and to be, e.g.,
  //        'privateVarName' for private var, and
  //        'this.publicVarName' for public var
  // inputs[i] = [sourceUnitIndexNumber,sourceVarNameString,thisUnitVarNameString]
  inputs : [
    [1,'ToutCold','this.Tin']
  ],

  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS...
  // SEE dataInputs array in initialize() method for input field ID's

  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, used in updateDisplay() method
  displayReactorLeftConc: 'field_reactor_left_conc',
  displayReactorRightConc: 'field_reactor_right_conc',
  displayReactorLeftT: 'field_reactor_left_T',
  displayReactorRightT: 'field_reactor_right_T',
  // displayJacketLeftArrow : '#field_jacket_left_arrow', // needs # with ID

  // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***
  // ***   EXCEPT TO HTML ID'S IN method initialize(), array dataInputs    ***

  // define main inputs
  // values will be set in method intialize()
  Kf300 : 0, // forward rate coefficient value at 300 K
  Ea : 0, // activation energy
  DelH : 0, // heat of reaction
  Wcat : 0, // mass of catalyst
  Cain : 0, // inlet reactant concentration
  Flowrate : 0, // inlet volumetric flow rate

  // *** WHEN RXR COUPLED TO HX, THIS IS INLET T TO COLD SIDE HX ***
  TinHX : 0, // inlet T to heat exchanger cold side

  // *** WHEN RXR COUPLED TO HX, Tin IS RXR INLET T ***
  Tin : 0, // inlet T to reactor - to be obtained from HX cold outlet

  // *** WHEN RXR COUPLED TO HX, Tout IS RXR OUTLET T ***
  Tout : 0, // Tout from reactor will be input to hot side of HX

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
  Trxr : [],
  Ca : [],

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  profileData : [], // for profile plots, plot script requires this name
  stripData : [], // for strip chart plots, plot script requires this name
  colorCanvasData : [], // for color canvas plots, plot script requires this name

  // allow this unit to take more than one step within one main loop step in updateState method
  unitStepRepeats : 100,
  unitTimeStep : simParams.simTimeStep / this.unitStepRepeats,

  // WARNING: IF INCREASE NUM NODES IN HEAT EXCHANGER BY A FACTOR THEN HAVE TO
  // REDUCE size of time steps FOR NUMERICAL STABILITY BY SQUARE OF THE FACTOR
  // AND INCREASE step repeats BY SAME FACTOR IF WANT SAME SIM TIME BETWEEN
  // DISPLAY UPDATES

  // define variables which will not be plotted nor saved in copy data table
  //   none here

  // WARNING: have to check for any changes to simTimeStep and simStepRepeats if change numNodes
  // WARNING: numNodes is accessed in process_plot_info.js
  numNodes : 200,

  ssCheckSum : 0, // used to check for steady state
  residenceTime : 0, // for timing checks for steady state check
  // residenceTime is set in this unit's updateUIparams()
  // residenceTime is an output from this unit to HX unit

  CpFluid : 2.24, // (kJ/kg/K)
  densFluid : 1000, // (kg/m3)
  densCat : 1000, // (kg/m3)
  voidFrac : 0.3, // bed void fraction

  initialize : function() {
    //
    let v = 0;
    this.dataHeaders[v] = 'Kf300';
    this.dataInputs[v] = 'input_field_Kf300';
    this.dataUnits[v] = 'm3/kg/s';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1;
    this.dataInitial[v] = 1.0e-7;
    this.Kf300 = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Kf300; // current input value for reporting
    //
    v = 1;
    this.dataHeaders[v] = 'Ea';
    this.dataInputs[v] = 'input_field_Ea';
    this.dataUnits[v] = 'kJ/mol';
    this.dataMin[v] = 0;
    this.dataMax[v] = 100;
    this.dataInitial[v] = 100;
    this.Ea = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Ea; // current input value for reporting
    //
    v = 2;
    this.dataHeaders[v] = 'DelH';
    this.dataInputs[v] = 'input_field_DelH';
    this.dataUnits[v] = 'kJ/mol';
    this.dataMin[v] = -150;
    this.dataMax[v] = 150;
    this.dataInitial[v] = -125;
    this.DelH = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.DelH; // current input value for reporting
    //
    v = 3;
    this.dataHeaders[v] = 'Wcat';
    this.dataInputs[v] = 'input_field_Wcat';
    this.dataUnits[v] = 'kg';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1000;
    this.dataInitial[v] = 100;
    this.Wcat = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Wcat; // current input value for reporting
    //
    v = 4;
    this.dataHeaders[v] = 'Cain';
    this.dataInputs[v] = 'input_field_Cain';
    this.dataUnits[v] = 'mol/m3';
    this.dataMin[v] = 0;
    this.dataMax[v] = 550;
    this.dataInitial[v] = 500;
    this.Cain = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Cain; // current input value for reporting
    //
    v = 5;
    this.dataHeaders[v] = 'Flowrate';
    this.dataInputs[v] = 'input_field_Flowrate';
    this.dataUnits[v] = 'm3/s';
    this.dataMin[v] = 0;
    this.dataMax[v] = 10;
    this.dataInitial[v] = 5.0e-3;
    this.Flowrate = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Flowrate; // current input value for reporting
    //
    v = 6;
    // *** only used in reactor to initialize and reset plots
    this.dataHeaders[v] = 'System Tin';
    this.dataInputs[v] = 'input_field_Tin';
    this.dataUnits[v] = 'K';
    this.dataMin[v] = 320;
    this.dataMax[v] = 380;
    this.dataInitial[v] = this.dataMin[v];
    this.TinHX = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.TinHX; // current input value for reporting
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table
    //
    // *** use v-1 here since TinHX only used to initialize & reset plots
    this.VarCount = v-1;
    //
    // OUTPUT VARS
    //
    v = 7;
    this.dataHeaders[v] = 'Trxr';
    this.dataUnits[v] =  'K';
    // Trxr dataMin & dataMax can be changed in updateUIparams()
    this.dataMin[v] = 200;
    this.dataMax[v] = 500;
    v = 8;
    this.dataHeaders[v] = 'Ca';
    this.dataUnits[v] =  'mol/m3';
    this.dataMin[v] = 0;
    this.dataMax[v] = this.dataMax[4]; // [4] is Cain
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

    this.Tout = this.dataInitial[6]; // [6] is TinHX

    for (k = 0; k <= this.numNodes; k += 1) {
      this.Ca[k] = this.dataInitial[4]; // [4] is Cain
      this.Trxr[k] = this.dataInitial[6]; // [6] is TinHX
    }

    // initialize profile data array
    // initPlotData(numProfileVars,numProfilePts)
    this.profileData = plotter.initPlotData(2,this.numNodes); // holds data for static profile plots

    // // initialize strip chart data array
    // // initPlotData(numStripVars,numStripPts)
    let numStripVars = 1; // only outlet conc
    let numStripPts = plotInfo[5]['numberPoints'];
    this.stripData = plotter.initPlotData(numStripVars,numStripPts); // holds data for scrolling strip chart plots

    // initialize local array to hold color-canvas data, e.g., space-time data -
    // plotter.initColorCanvasArray(numVars,numXpts,numYpts)
    // *** FOR ADIABATIC RXR, numVars = 1 since don't show jacket canvas
    this.colorCanvasData = plotter.initColorCanvasArray(1,this.numNodes,1);

    let kn = 0;
    for (k = 0; k <= this.numNodes; k += 1) {
      kn = k/this.numNodes;
      // x-axis values
      // x-axis values will not change during sim
      // XXX change to get number vars for this plotInfo variable
      //     so can put in repeat - or better yet, a function
      //     and same for y-axis below
      // first index specifies which variable
      this.profileData[0][k][0] = kn;
      this.profileData[1][k][0] = kn;
      // y-axis values
      this.profileData[0][k][1] = this.dataInitial[6]; // [6] is TinHX
      this.profileData[1][k][1] = this.dataInitial[4]; // [4] is Cain
    }

    let timeStep = simParams.simTimeStep * simParams.simStepRepeats;
    for (k = 0; k <= numStripPts; k += 1) {
      // x-axis values
      // x-axis values will not change during sim
      // XXX change to get number vars for this plotInfo variable
      //     so can put in repeat - or better yet, a function
      //     and same for y-axis below
      // first index specifies which variable
      this.stripData[0][k][0] = k * timeStep;
      // y-axis values
      this.stripData[0][k][1] = this.dataInitial[4]; // [4] is Cain
    }

    // update display
    this.updateDisplay();

  }, // end reset

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
    this.Kf300 = this.dataValues[0] = interfacer.getInputValue(unum, 0);
    this.Ea = this.dataValues[1] = interfacer.getInputValue(unum, 1);
    this.DelH = this.dataValues[2] = interfacer.getInputValue(unum, 2);
    this.Wcat = this.dataValues[3] = interfacer.getInputValue(unum, 3);
    this.Cain = this.dataValues[4] = interfacer.getInputValue(unum, 4);
    this.Flowrate = this.dataValues[5] = interfacer.getInputValue(unum, 5);

    // TinHX only used in reactor on initialization and reset of reactor plot
    this.TinHX = this.dataValues[6] = interfacer.getInputValue(unum, 6);

    // update residenceTime, which is needed by HX to match that of RXR
    // in case any change in Wcat or Flowrate
    let densBed = this.densCat * (1 - this.voidFrac);
    this.residenceTime = this.Wcat * this.voidFrac / densBed / this.Flowrate;

  }, // END of updateUIparams()

  updateInputs : function() {
    //
    // GET INPUT CONNECTION VALUES FROM OTHER UNITS FROM PREVIOUS TIME STEP,
    //   SINCE updateInputs IS CALLED BEFORE updateState IN EACH TIME STEP
    // SPECIFY REFERENCES TO INPUTS ABOVE WHERE DEFINE inputs ARRAY

    for (let i = 0; i < this.inputs.length; i++) {
      let connection = this.inputs[i];
      let sourceUnit = connection[0];
      let sourceVar = connection[1];
      let thisVar = connection[2];
      let sourceValue = processUnits[sourceUnit][sourceVar];
      eval(thisVar + ' = ' + sourceValue);
      // NOTE: line above works for private AND public thisVar, where public has 'this.'
      //  line below works only for public thisVar, where thisVar has no 'this.'
      //  processUnits[unitIndex][thisVar] = sourceValue;
    }

    // check for change in overall main time step simTimeStep
    this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

    // *** UPDATE MIN-MAX T FOR ADIABATIC REACTOR ***
    // calc adiabatic delta T, positive for negative H (exothermic)
    let adiabDeltaT = -this.DelH * this.Cain / this.densFluid / this.CpFluid;
    let varMinMaxT = 7; // 7 is Trxr used for constraint during integration
    // calc max possible T
    if(this.DelH < 0) {
      // exothermic
      this.dataMax[varMinMaxT] = this.Tin + adiabDeltaT;
    } else {
      // endothermic
      this.dataMax[varMinMaxT] = this.Tin;
    }
    // calc min possible T
    if(this.DelH > 0) {
      // endothermic
      this.dataMin[varMinMaxT] = this.Tin + adiabDeltaT;
    } else {
      // exothermic
      this.dataMin[varMinMaxT] = this.Tin;
    }

  }, // END of updateInputs()

  updateState : function() {
    //
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE
    //
    // WARNING: this method must NOT contain references to other units!
    //          get info from other units ONLY in updateInputs() method

    let i = 0; // index for step repeats
    let n = 0; // index for nodes
    let TrxrN = 0;
    let dTrxrDT = 0;
    let CaN = 0;
    let dCaDT = 0;
    let varMinMaxT = 7; // 7 is Trxr used for constraint during integration

    // CpFluid, voidFrac, densCat and densFluid properties of puPlugFlowReactor
    let CpCat= 1.24; // (kJ/kg/K), catalyst heat capacity
    let densBed = (1 - this.voidFrac) * this.densCat; // (kg/m3), bed density
    // assume fluid and catalyst at same T at each position in reactor
    let CpMean = this.voidFrac * this.CpFluid + (1 - this.voidFrac) * CpCat;

    let dW = this.Wcat / this.numNodes;
    let Rg = 8.31446e-3; // (kJ/K/mol), ideal gas constant
    let kT = 0; // will vary with T below
    let EaOverRg = this.Ea / Rg; // so not compute in loop below
    let EaOverRg300 = EaOverRg / 300; // so not compute in loop below

    let flowCoef = this.Flowrate * densBed / this.voidFrac / dW;
    let rxnCoef = densBed / this.voidFrac;

    let energyFlowCoef = this.Flowrate * this.densFluid * this.CpFluid / CpMean / dW;
    let energyRxnCoef = this.DelH / CpMean;

    // *** FOR ADIABATIC RXR + HX, no heat transfer to rxr walls ***

    let TrxrNew = []; // temporary new values for this updateState
    let CaNew = [];

    // this unit can take multiple steps within one outer main loop repeat step
    for (i=0; i<this.unitStepRepeats; i+=1) {

      // do node at inlet node
      n = 0;

      TrxrN = this.Tin;
      CaN = this.Cain;

      TrxrNew[n] = TrxrN;
      CaNew[n] = CaN;

      // internal nodes
      for (n = 1; n < this.numNodes; n += 1) {

        kT = this.Kf300 * Math.exp(EaOverRg300 - EaOverRg/this.Trxr[n]);

        dCaDT = -flowCoef * (this.Ca[n] - this.Ca[n-1]) - rxnCoef * kT * this.Ca[n];
        dTrxrDT = - energyFlowCoef * (this.Trxr[n] - this.Trxr[n-1])
                  - energyRxnCoef * kT * this.Ca[n];

        CaN = this.Ca[n] + dCaDT * this.unitTimeStep;
        TrxrN = this.Trxr[n] + dTrxrDT * this.unitTimeStep;

        // // CONSTRAIN TO BE IN BOUND
        // if (TrxrN > this.dataMax[varMinMaxT]) {TrxrN = this.dataMax[varMinMaxT];}
        // if (TrxrN < this.dataMin[varMinMaxT]) {TrxrN = this.dataMin[varMinMaxT];}
        // if (CaN < 0.0) {CaN = 0.0;}
        // if (CaN > this.Cain) {CaN = this.Cain;}

        TrxrNew[n] = TrxrN;
        CaNew[n] = CaN;

      } // end repeat through internal nodes

      // do node at outlet node

      n = this.numNodes;

      kT = this.Kf300 * Math.exp(EaOverRg300 - EaOverRg/this.Trxr[n]);

      dCaDT = -flowCoef * (this.Ca[n] - this.Ca[n-1]) - rxnCoef * kT * this.Ca[n];
      dTrxrDT = - energyFlowCoef * (this.Trxr[n] - this.Trxr[n-1])
                - energyRxnCoef * kT * this.Ca[n];

      CaN = this.Ca[n] + dCaDT * this.unitTimeStep;
      TrxrN = this.Trxr[n] + dTrxrDT * this.unitTimeStep;

      // // CONSTRAIN TO BE IN BOUND
      // if (TrxrN > this.dataMax[varMinMaxT]) {TrxrN = this.dataMax[varMinMaxT];}
      // if (TrxrN < this.dataMin[varMinMaxT]) {TrxrN = this.dataMin[varMinMaxT];}
      // if (CaN < 0.0) {CaN = 0.0;}
      // if (CaN > this.Cain) {CaN = this.Cain;}

      TrxrNew[n] = TrxrN;
      CaNew[n] = CaN;

      // finished updating all nodes

      // copy new to current
      this.Trxr = TrxrNew;
      this.Ca = CaNew;

    } // END NEW FOR REPEAT for (i=0; i<this.unitStepRepeats; i+=1)

    this.Tout = this.Trxr[this.numNodes];

  }, // END of updateState()

  updateDisplay : function() {
    // update display elements which only depend on this process unit
    // except do all plotting at main controller updateDisplay
    // since some plots may contain data from more than one process unit

    // note use .toFixed(n) method of object to round number to n decimal points

    let n = 0; // used as index

    // document.getElementById(this.displayReactorLeftT).innerHTML = this.Tin.toFixed(1) + ' K';
    document.getElementById(this.displayReactorLeftT).innerHTML = this.Trxr[0].toFixed(1) + ' K';
    document.getElementById(this.displayReactorRightT).innerHTML = this.Tout.toFixed(1) + ' K';

    // NOTE: HX cold out T (right) and RXR T in will not agree except at SS
    // and HX hot in T (right) and RXR T out with not agree except at SS
    // because RXR T in doesn't get set to HX cold out until start of next time step
    // and HX hot in doesn't get set to RXR out until start of next time step
    // decide not to force match in display so that display agrees with copy data

    document.getElementById(this.displayReactorLeftConc).innerHTML = this.Cain.toFixed(1);
    document.getElementById(this.displayReactorRightConc).innerHTML = this.Ca[this.numNodes].toFixed(1) + ' mol/m<sup>3</sup>';;

    // HANDLE PROFILE PLOT DATA

    // copy variable values to profileData array which holds data for plotting

    // XXX CONSIDER RE-ORDERING LAST TWO INDEXES IN profileData SO CAN USE
    //     SIMPLE ASSIGNMENT FOR ALL Y VALUES, e.g.,
    // profileData[0][1][n] = y;

    for (n=0; n<=this.numNodes; n+=1) {
      this.profileData[0][n][1] = this.Trxr[n];
      this.profileData[1][n][1] = this.Ca[n];
    }

    // HANDLE COLOR CANVAS DATA - HERE FOR PFR TEMPERATURE vs. POSITION
    // the data vs. node is horizontal, not vertical
    // and vertical strip is all the same
    // so when initialize colorCanvasData array, take this into account
    // FOR PFR - COLOR CANVAS DOES NOT SCROLL WITH TIME
    // SO DO NOT SHIFT AND PUSH DATA LIKE DO IN SCROLLING CANVAS

    // colorCanvasData[v][x][y]
    for (n=0; n<=this.numNodes; n+=1) {
      this.colorCanvasData[0][n][0] = this.Trxr[n];
    }

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    let numStripPoints = plotInfo[5]['numberPoints'];
    let numStripVars = 1; // only the variables from this unit
    let nn = this.numNodes;

    // handle Rxr Outlet Conc
    v = 0;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [ 0, this.Ca[nn] ] );
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

}; // END let puPlugFlowReactor
