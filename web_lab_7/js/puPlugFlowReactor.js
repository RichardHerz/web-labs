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

let puPlugFlowReactor = {
  unitIndex : 0, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'Plug Flow Reactor',

  // SUMMARY OF DEPENDENCIES
  //
  //  THIS OBJECT HAS MULTIPLE I/O CONNECTIONS TO HTML
  //
  //  USES FROM OBJECT simParams
  //    GETS simParams.simTimeStep
  //  OBJECT plotInfo USES FROM THIS OBJECT:
  //    numNodes, and possibly others
  //  OBJECT controller USES FROM THIS OBJECT:
  //    variable residenceTime
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
  //   none

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
  // values will be set in method initialize()
  Kf300 : 0,
  Ea : 0,
  DelH : 0,
  Wcat : 0,
  Cain : 0,
  Flowrate : 0,
  Tin : 0,
  UAcoef : 0,
  Tjacket : 0,

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
  TrxrNew : [], // 'New' hold intermediate values during updateState
  CaNew : [],

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  profileData : [], // for profile plots, plot script requires this name
  stripData : [], // for strip chart plots, plot script requires this name
  colorCanvasData : [], // for color canvas plots, plot script requires this name

  // allow this unit to take more than one step within one main loop step in updateState method
  // WARNING: see special handling for time step in this unit's updateInputs method
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

  // fluid Cp and both dens need to be accessible in updateUIparams()
  // Cp and dens for catalyst set in updateState()
  CpFluid : 2.24, // (kJ/kg/K)
  densFluid : 1000, // (kg/m3)
  densCat : 1000, // (kg/m3)

  initialize : function() {
    //
    let v = 0;
    this.dataHeaders[v] = 'Kf300';
    this.dataInputs[v] = 'input_field_Kf300';
    this.dataUnits[v] = 'm3/kg/s';
    this.dataMin[v] = 0;
    this.dataMax[v] = 10;
    this.dataInitial[v] = 1.0e-7;
    this.Kf300 = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Kf300; // current input value for reporting
    //
    v = 1;
    this.dataHeaders[v] = 'Ea';
    this.dataInputs[v] = 'input_field_Ea';
    this.dataUnits[v] = 'kJ/mol';
    this.dataMin[v] = 0;
    this.dataMax[v] = 200;
    this.dataInitial[v] = 100;
    this.Ea = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Ea; // current input value for reporting
    //
    v = 2;
    this.dataHeaders[v] = 'DelH';
    this.dataInputs[v] = 'input_field_DelH';
    this.dataUnits[v] = 'kJ/mol';
    this.dataMin[v] = -200;
    this.dataMax[v] = 200;
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
    this.dataMax[v] = 1000;
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
    this.dataInitial[v] = 4.0e-3;
    this.Flowrate = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Flowrate; // current input value for reporting
    //
    v = 6;
    this.dataHeaders[v] = 'Tin';
    this.dataInputs[v] = 'input_field_Tin';
    this.dataUnits[v] = 'K';
    this.dataMin[v] = 250;
    this.dataMax[v] = 400;
    this.dataInitial[v] = 350;
    this.Tin = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Tin; // current input value for reporting
    //
    v = 7;
    this.dataHeaders[v] = 'UAcoef';
    // NOTE: dataInputs example where field ID name differs from variable name
    this.dataInputs[v] = 'input_field_UA';
    this.dataUnits[v] = 'kW/kg/K';
    this.dataMin[v] = 0;
    this.dataMax[v] = 100;
    this.dataInitial[v] = 0.1;
    this.UAcoef = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.UAcoef; // current input value for reporting
    //
    v = 8;
    this.dataHeaders[v] = 'Tjacket';
    this.dataInputs[v] = 'input_field_Tjacket';
    this.dataUnits[v] = 'K';
    this.dataMin[v] = 250;
    this.dataMax[v] = 400;
    this.dataInitial[v] = 355;
    this.Tjacket = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Tjacket; // current input value for reporting
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table in _plotter.js
    this.VarCount = v;
    //
    // OUTPUT VARS
    //
    v = 9;
    this.dataHeaders[v] = 'Trxr';
    this.dataUnits[v] =  'K';
    // Trxr dataMin & dataMax can be changed in updateUIparams()
    this.dataMin[v] = 200;
    this.dataMax[v] = 500;
    v = 10;
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

    document.getElementById(this.displayReactorLeftT).innerHTML = this.Tin.toFixed(1) + ' K';
    document.getElementById(this.displayReactorRightT).innerHTML = this.Tin.toFixed(1) + ' K';

    document.getElementById(this.displayReactorLeftConc).innerHTML = this.Cain.toFixed(1);
    document.getElementById(this.displayReactorRightConc).innerHTML = 0.0 + ' mol/m<sup>3</sup>';

    for (k = 0; k <= this.numNodes; k += 1) {
      this.Trxr[k] = this.dataInitial[8]; // [8] is Tjacket
      this.TrxrNew[k] = this.dataInitial[8];
      this.Ca[k] = 0;
      this.CaNew[k] = 0;
    }

    // initialize profile data array
    // plotter.initPlotData(numProfileVars,numProfilePts)
    this.profileData = plotter.initPlotData(2,this.numNodes); // holds data for static profile plots

    // // initialize strip chart data array
    // // plotter.initPlotData(numStripVars,numStripPts)
    // this.stripData = plotter.initPlotData(numStripVars,numStripPts); // holds data for scrolling strip chart plots

    // initialize local array to hold color-canvas data, e.g., space-time data -
    // plotter.initColorCanvasArray(numVars,numXpts,numYpts)
    this.colorCanvasData = plotter.initColorCanvasArray(2,this.numNodes,1);

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
      this.profileData[0][k][1] = this.dataInitial[6]; // [6] is Tin
      this.profileData[1][k][1] = this.dataInitial[4]; // [4] is Cain
    }

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
    this.Tin = this.dataValues[6] = interfacer.getInputValue(unum, 6);
    this.UAcoef = this.dataValues[7] = interfacer.getInputValue(unum, 7);
    this.Tjacket = this.dataValues[8] = interfacer.getInputValue(unum, 8);

    // calc adiabatic delta T, positive for negative H (exothermic)
    let adiabDeltaT = -this.DelH * this.Cain / this.densFluid / this.CpFluid;

    // calc max possible T
    if(this.DelH < 0) {
      // exothermic
      if (this.Tjacket > this.Tin) {
        this.dataMax[9] = this.Tjacket + adiabDeltaT; // [9] is Trxr
      } else {
        this.dataMax[9] = this.Tin + adiabDeltaT;
      }
    } else {
      // endothermic
      if (this.Tjacket > this.Tin) {
        this.dataMax[9] = this.Tjacket;
      } else {
        this.dataMax[9] = this.Tin;
      }
    }

    // calc min possible T
    if(this.DelH > 0) {
      // endothermic
      if (this.Tjacket < this.Tin) {
        this.dataMin[9] = this.Tjacket + adiabDeltaT; // [9] is Trxr
      } else {
        this.dataMin[9] = this.Tin + adiabDeltaT;
      }
    } else {
      // exothermic
      if (this.Tjacket < this.Tin) {
        this.dataMin[9] = this.Tjacket;
      } else {
        this.dataMin[9] = this.Tin;
      }
    }

    // adjust axis of profile plot
    plotter['plotArrays']['plotFlag'][0] = 0;  // so axes will refresh
    plotInfo[0]['yLeftAxisMin'] = this.dataMin[9]; // [9] is Trxr
    plotInfo[0]['yLeftAxisMax'] = this.dataMax[9];
    plotInfo[0]['yRightAxisMin'] = 0;
    plotInfo[0]['yRightAxisMax'] = this.Cain;
    // adjust color span of spaceTime, color canvas plots
    plotInfo[1]['varValueMin'] = this.dataMin[9]; // [9] is Trxr
    plotInfo[1]['varValueMax'] = this.dataMax[9];
    plotInfo[2]['varValueMin'] = this.dataMin[9];
    plotInfo[2]['varValueMax'] = this.dataMax[9];

    // also update ONLY inlet values at inlet of reactor in case sim is paused
    // but do not do full updateDisplay
    document.getElementById(this.displayReactorLeftT).innerHTML = this.Tin.toFixed(1) + ' K';
    document.getElementById(this.displayReactorLeftConc).innerHTML = this.Cain.toFixed(1);

    // residence time used for timing checks for steady state
    // use this for now but should consider voidFrac and Cp's...
    this.residenceTime = this.Wcat / this.densCat / this.Flowrate;

    // // UPDATE UNIT TIME STEP AND UNIT REPEATS
    //
    // // FIRST, compute spaceTime = residence time between two nodes in hot tube, also
    // //                          = space time of equivalent single mixing cell
    // let spaceTime = (Length / this.numNodes) / VelocHot; // (s)
    //
    // // SECOND, estimate unitTimeStep
    // // do NOT change simParams.simTimeStep here
    // this.unitTimeStep = spaceTime / 15;
    //
    // // THIRD, get integer number of unitStepRepeats
    // this.unitStepRepeats = Math.round(simParams.simTimeStep / this.unitTimeStep);
    // // min value of unitStepRepeats is 1 or get divide by zero error
    // if (this.unitStepRepeats <= 0) {this.unitStepRepeats = 1;}
    //
    // // FOURTH and finally, recompute unitTimeStep with integer number unitStepRepeats
    // this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

  }, // end of updateUIparams()

  updateInputs : function() {
    //
    // GET INPUT CONNECTION VALUES FROM OTHER UNITS FROM PREVIOUS TIME STEP,
    //   SINCE updateInputs IS CALLED BEFORE updateState IN EACH TIME STEP
    // SPECIFY REFERENCES TO INPUTS ABOVE in this unit definition
    //   none
    // check for change in overall main time step simTimeStep
    this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;
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

    // CpFluid, densFluid, densCat are properties of puPlugFlowReactor
    let CpCat= 1.24; // (kJ/kg/K), catalyst heat capacity
    let voidFrac = 0.3; // bed void fraction
    let densBed = (1 - voidFrac) * this.densCat; // (kg/m3), bed density
    // assume fluid and catalyst at same T at each position in reactor
    let CpMean = voidFrac * this.CpFluid + (1 - voidFrac) * CpCat;

    let dW = this.Wcat / this.numNodes;
    let Rg = 8.31446e-3; // (kJ/K/mol), ideal gas constant
    let kT = 0; // will vary with T below
    let EaOverRg = this.Ea / Rg; // so not compute in loop below
    let EaOverRg300 = EaOverRg / 300; // so not compute in loop below

    let flowCoef = this.Flowrate * densBed / voidFrac / dW;
    let rxnCoef = densBed / voidFrac;

    let energyFlowCoef = this.Flowrate * this.densFluid * this.CpFluid / CpMean / dW;
    let energyXferCoef = this.UAcoef / CpMean;
    let energyRxnCoef = this.DelH / CpMean;

    // this unit can take multiple steps within one outer main loop repeat step
    for (i=0; i<this.unitStepRepeats; i+=1) {

      // do node at inlet end
      n = 0;

      TrxrN = this.Tin;
      CaN = this.Cain;

      this.TrxrNew[n] = TrxrN;
      this.CaNew[n] = CaN;

      // internal nodes
      for (n = 1; n < this.numNodes; n += 1) {

        kT = this.Kf300 * Math.exp(EaOverRg300 - EaOverRg/this.Trxr[n]);

        dCaDT = -flowCoef * (this.Ca[n] - this.Ca[n-1]) - rxnCoef * kT * this.Ca[n];
        dTrxrDT = - energyFlowCoef * (this.Trxr[n] - this.Trxr[n-1])
                  + energyXferCoef * (this.Tjacket - this.Trxr[n])
                  - energyRxnCoef * kT * this.Ca[n];

        CaN = this.Ca[n] + dCaDT * this.unitTimeStep;
        TrxrN = this.Trxr[n] + dTrxrDT * this.unitTimeStep;

        // CONSTRAIN TO BE IN BOUND
        if (TrxrN > this.dataMax[9]) {TrxrN = this.dataMax[9];} // [9] is Trxr
        if (TrxrN < this.dataMin[9]) {TrxrN = this.dataMin[9];}
        if (CaN < 0.0) {CaN = 0.0;}
        if (CaN > this.Cain) {CaN = this.Cain;}

        this.TrxrNew[n] = TrxrN;
        this.CaNew[n] = CaN;

      } // end repeat through internal nodes

      // do node at hot outlet end

      n = this.numNodes;

      kT = this.Kf300 * Math.exp(EaOverRg300 - EaOverRg/this.Trxr[n]);

      dCaDT = -flowCoef * (this.Ca[n] - this.Ca[n-1]) - rxnCoef * kT * this.Ca[n];
      dTrxrDT = - energyFlowCoef * (this.Trxr[n] - this.Trxr[n-1])
                + energyXferCoef * (this.Tjacket - this.Trxr[n])
                - energyRxnCoef * kT * this.Ca[n];

      CaN = this.Ca[n] + dCaDT * this.unitTimeStep;
      TrxrN = this.Trxr[n] + dTrxrDT * this.unitTimeStep;

      // CONSTRAIN TO BE IN BOUND
      if (TrxrN > this.dataMax[9]) {TrxrN = this.dataMax[9];} // [9] is Trxr
      if (TrxrN < this.dataMin[9]) {TrxrN = this.dataMin[9];}
      if (CaN < 0.0) {CaN = 0.0;}
      if (CaN > this.Cain) {CaN = this.Cain;}

      this.TrxrNew[n] = TrxrN;
      this.CaNew[n] = CaN;

      // finished updating all nodes

      // copy new to current
      this.Trxr = this.TrxrNew;
      this.Ca = this.CaNew;

    } // END NEW FOR REPEAT for (i=0; i<this.unitStepRepeats; i+=1)

  }, // end updateState method

  updateDisplay : function() {

    // note use .toFixed(n) method of object to round number to n decimal points

    let n = 0; // used as index

    document.getElementById(this.displayReactorLeftT).innerHTML = this.Tin.toFixed(1) + ' K';
    document.getElementById(this.displayReactorRightT).innerHTML = this.Trxr[this.numNodes].toFixed(1) + ' K';

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
      this.colorCanvasData[1][n][0] = this.Tjacket; // XXX should only do this once...
    }

  }, // end updateDisplay method

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
    // multiply all numbers by a factor to get desired number significant
    // figures to left decimal point so toFixed() does not return string "0.###"
    // WARNING: too many sig figs will prevent detecting steady state
    //
    let nn = this.numNodes;
    let hlt = 1.0e1 * this.Trxr[nn];
    let hrt = 1.0e1 * this.Trxr[0];
    let clt = 1.0e1 * this.Ca[nn];
    let crt = 1.0e1 * this.Ca[0];
    hlt = hlt.toFixed(0); // string
    hrt = hrt.toFixed(0);
    clt = clt.toFixed(0);
    crt = crt.toFixed(0);
    // concatenate strings
    let newCheckSum = hlt +'.'+ hrt +'.'+ clt  +'.'+ crt;
    let oldSScheckSum = this.ssCheckSum;
    // console.log('OLD CHECKSUM = ' + oldSScheckSum);
    // console.log('NEW CHECKSUM = ' + newCheckSum);
    let ssFlag = false;
    if (newCheckSum == oldSScheckSum) {ssFlag = true;}
    this.ssCheckSum = newCheckSum; // save current value for use next time
    return ssFlag;
  } // END checkForSteadyState method

}; // END puPlugFlowReactor object
