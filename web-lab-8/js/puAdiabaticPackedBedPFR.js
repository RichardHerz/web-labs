/*
  Design, text, images and code by Richard K. Herz, 2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// copy line below for display of development values
// document.getElementById('field_output_field').innerHTML = dTrxrDT; // yyy

puAdiabaticPackedBedPFR = {
  unitIndex : 0, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'Adiabatic Packed Bed PFR',
  //
  // USES OBJECT simParam
  //    simParams.simTimeStep, simParams.ssFlag
  // OBJECT simParams USES the following from this process unit
  //    variables SScheck, residenceTime, numNodes

  // **** WHEN RXR COUPLED TO HX *****
  //    all flow rates are the same in reactor and heat exchanger
  // OUTPUT CONNECTIONS FROM THIS UNIT TO OTHER UNITS
  //    reactor outlet T to heat exchanger hot inlet T
  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, see updateInputs below
  //    heat exchanger cold out T is reactor inlet T

  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, used in updateInputs() method
  refExchangerColdOutTemp : "processUnits[1]['Tcold'][0]", // note ' in string

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

  // *** FOR ADIABATIC RXR just define Tjacket for no error
  // of omission in equations
  // but heat transfer term multiplying this is set to zero
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

  // also see simParams.ssFlag and simParams.SScheck
  SScheck : 0, // for saving steady state check number of array end values
  // for timing checks for steady state check
  residenceTime : 1,

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
    // used, e.g., in copy data to table in _plotter.js
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

    // *** heat exchanger needs reactor outlet T for HX hot inlet T ***
    for (k = 0; k <= this.numNodes; k += 1) {
      this.Ca[k] = this.dataInitial[4]; // [4] is Cain
      this.CaNew[k] = this.dataInitial[4]; // [4] is Cain
      this.Trxr[k] = this.dataInitial[6]; // [6] is TinHX
      this.TrxrNew[k] = this.dataInitial[6]; // [6] is TinHX
    }

    // update residenceTime, which is needed by HX to match that of RXR
    // in case any change in Wcat or Flowrate
    let densBed = this.densCat * (1 - this.voidFrac);
    this.residenceTime = this.Wcat * this.voidFrac / densBed / this.Flowrate;

  }, // END of initialize()

  reset : function() {

    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.
    this.updateUIparams(); // this first, then set other values as needed
    // set state variables not set by updateUIparams to initial settings

    // this.command.value = this.initialCommand;
    // this.errorIntegral = this.initialErrorIntegral;

    simParams.ssFlag = false;
    this.SScheck = 0; // reset steady state check number of array end values

    for (k = 0; k <= this.numNodes; k += 1) {
      this.Ca[k] = this.dataInitial[4]; // [4] is Cain
      this.CaNew[k] = this.dataInitial[4]; // [4] is Cain
      this.Trxr[k] = this.dataInitial[6]; // [6] is TinHX
      this.TrxrNew[k] = this.dataInitial[6]; // [6] is TinHX
    }

    // initialize profile data array - must follow function initPlotData in this file
    // initPlotData(numProfileVars,numProfilePts)
    this.profileData = initPlotData(2,this.numNodes); // holds data for static profile plots

    // // initialize strip chart data array
    // // initPlotData(numStripVars,numStripPts)
    // this.stripData = initPlotData(numStripVars,numStripPts); // holds data for scrolling strip chart plots

    // initialize local array to hold color-canvas data, e.g., space-time data -
    // initColorCanvasArray(numVars,numXpts,numYpts)
    // *** FOR ADIABATIC RXR, numVars = 1 since don't show jacket canvas
    this.colorCanvasData = initColorCanvasArray(1,this.numNodes,1);

    var kn = 0;
    for (k = 0; k <= this.numNodes; k += 1) {
      kn = k/this.numNodes;
      // x-axis values
      // x-axis values will not change during sim
      // XXX change to get number vars for this plotsObj variable
      //     so can put in repeat - or better yet, a function
      //     and same for y-axis below
      // first index specifies which variable
      this.profileData[0][k][0] = kn;
      this.profileData[1][k][0] = kn;
      // y-axis values
      this.profileData[0][k][1] = this.dataInitial[6]; // [6] is TinHX
      this.profileData[1][k][1] = this.dataInitial[4]; // [4] is Cain
    }

    // update display
    this.display();

  }, // end reset

  updateUIparams : function() {
    //
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    //
    // The following IF structures provide for unit independence
    // such that when input doesn't exist, you get "initial" value
    //
    // // EXAMPLE FOR SETTING VALUE OF AN OBJECT WITH MULTIPLE properties
    // //   THUS set value of this.setPoint.value
    // if (document.getElementById(this.inputSetPoint)) {
    //   let tmpFunc = new Function("return " + this.inputSetPoint + ".value;");
    //   this.setPoint.value = tmpFunc();
    // } else {
    //   this.setPoint.value = this.initialSetPoint;
    // }
    //
    // // EXAMPLE SETTING VALUE OF SIMPLE VARIABLE (no .value = )
    // if (document.getElementById(this.inputCmax)) {
    //   let tmpFunc = new Function("return " + this.inputCmax + ".value;");
    //   this.Cmax = tmpFunc();
    // } else {
    //   this.Cmax= this.initialCmax;
    // }
    //
    // // EXAMPLE OF SETTING VALUE FROM RANGE SLIDER
    // // update the readout field of range slider
    // if (document.getElementById(this.inputSliderReadout)) {
    //   document.getElementById(this.inputSliderReadout).innerHTML = this.Cmax;

    // set simParams.ssFlag to false
    simParams.ssFlag = false;

    // set SScheck checksum used to check for SS to zero
    this.SScheck = 0;

    // check input fields for new values
    // function getInputValue() is defined in file process_interface.js
    // getInputValue(unit index in processUnits, var index in input arrays)
    //
    let unum = this.unitIndex;
    //
    this.Kf300 = getInputValue(unum, 0);
    this.Ea = getInputValue(unum, 1);
    this.DelH = getInputValue(unum, 2);
    this.Wcat = getInputValue(unum, 3);
    this.Cain = getInputValue(unum, 4);
    this.Flowrate = getInputValue(unum, 5);

    // TinHX only used in reactor on initialization and reset of reactor plot
    this.TinHX = getInputValue(unum, 6);

    // update residenceTime, which is needed by HX to match that of RXR
    // in case any change in Wcat or Flowrate
    let densBed = this.densCat * (1 - this.voidFrac);
    this.residenceTime = this.Wcat * this.voidFrac / densBed / this.Flowrate;

  }, // END of updateUIparams()

  updateInputs : function() {
    //
    // SPECIFY REFERENCES TO INPUTS ABOVE in this unit definition
    //
    // GET INPUT CONNECTION VALUES FROM OTHER UNITS FROM PREVIOUS TIME STEP,
    // SINCE updateInputs IS CALLED BEFORE updateState IN EACH TIME STEP
    //

    //
    // The following TRY-CATCH structures provide for unit independence
    // such that when input doesn't exist, you get "initial" value
    //
    // try {
    // //   let tmpFunc = new Function("return " + this.inputPV + ";");
    // //   this.PV = tmpFunc();
    // //   // note: can't test for definition of this.inputVAR because any
    // //   // definition is true BUT WHEN try to get value of bad input
    // //   // to see if value is undefined then get "uncaught reference" error
    // //   // that the value of the bad input specified is undefined,
    // //   // which is why use try-catch structure here
    // }
    // catch(err) {
    // //   this.PV = this.initialPV;
    // }

    // check for change in overall main time step simTimeStep
    this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

    // *** GET REACTOR INLET T FROM COLD OUT OF HEAT EXCHANGER ***
    eval('this.Tin = ' + this.refExchangerColdOutTemp + ';');

    // *** UPDATE MIN-MAX T FOR ADIABATIC REACTOR ***
    // calc adiabatic delta T, positive for negative H (exothermic)
    var adiabDeltaT = -this.DelH * this.Cain / this.densFluid / this.CpFluid;
    var varMinMaxT = 7; // 7 is Trxr used for constraint during integration
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

    var i = 0; // index for step repeats
    var n = 0; // index for nodes
    var TrxrN = 0;
    var dTrxrDT = 0;
    var CaN = 0;
    var dCaDT = 0;
    var varMinMaxT = 7; // 7 is Trxr used for constraint during integration

    // CpFluid, voidFrac, densCat and densFluid properties of puPlugFlowReactor
    var CpCat= 1.24; // (kJ/kg/K), catalyst heat capacity
    var densBed = (1 - this.voidFrac) * this.densCat; // (kg/m3), bed density
    // assume fluid and catalyst at same T at each position in reactor
    var CpMean = this.voidFrac * this.CpFluid + (1 - this.voidFrac) * CpCat;

    var dW = this.Wcat / this.numNodes;
    var Rg = 8.31446e-3; // (kJ/K/mol), ideal gas constant
    var kT = 0; // will vary with T below
    var EaOverRg = this.Ea / Rg; // so not compute in loop below
    var EaOverRg300 = EaOverRg / 300; // so not compute in loop below

    var flowCoef = this.Flowrate * densBed / this.voidFrac / dW;
    var rxnCoef = densBed / this.voidFrac;

    var energyFlowCoef = this.Flowrate * this.densFluid * this.CpFluid / CpMean / dW;

    // *** FOR ADIABATIC RXR + HX, no heat transfer to rxr walls ***
    var energyXferCoef = 0;
    // var energyXferCoef = this.UAcoef / CpMean;

    // *** FOR ADIABATIC RXR
    // also need to define this.Tjacket for no error of omission
    // in full equations below but value is irrelevant
    // with energyXferCoef = 0

    var energyRxnCoef = this.DelH / CpMean;

    // this unit can take multiple steps within one outer main loop repeat step
    for (i=0; i<this.unitStepRepeats; i+=1) {

      // do node at inlet node
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

        // // CONSTRAIN TO BE IN BOUND
        // if (TrxrN > this.dataMax[varMinMaxT]) {TrxrN = this.dataMax[varMinMaxT];}
        // if (TrxrN < this.dataMin[varMinMaxT]) {TrxrN = this.dataMin[varMinMaxT];}
        // if (CaN < 0.0) {CaN = 0.0;}
        // if (CaN > this.Cain) {CaN = this.Cain;}

        this.TrxrNew[n] = TrxrN;
        this.CaNew[n] = CaN;

      } // end repeat through internal nodes

      // do node at outlet node

      n = this.numNodes;

      kT = this.Kf300 * Math.exp(EaOverRg300 - EaOverRg/this.Trxr[n]);

      dCaDT = -flowCoef * (this.Ca[n] - this.Ca[n-1]) - rxnCoef * kT * this.Ca[n];
      dTrxrDT = - energyFlowCoef * (this.Trxr[n] - this.Trxr[n-1])
                + energyXferCoef * (this.Tjacket - this.Trxr[n])
                - energyRxnCoef * kT * this.Ca[n];

      CaN = this.Ca[n] + dCaDT * this.unitTimeStep;
      TrxrN = this.Trxr[n] + dTrxrDT * this.unitTimeStep;

      // // CONSTRAIN TO BE IN BOUND
      // if (TrxrN > this.dataMax[varMinMaxT]) {TrxrN = this.dataMax[varMinMaxT];}
      // if (TrxrN < this.dataMin[varMinMaxT]) {TrxrN = this.dataMin[varMinMaxT];}
      // if (CaN < 0.0) {CaN = 0.0;}
      // if (CaN > this.Cain) {CaN = this.Cain;}

      this.TrxrNew[n] = TrxrN;
      this.CaNew[n] = CaN;

      // finished updating all nodes

      // copy new to current
      this.Trxr = this.TrxrNew;
      this.Ca = this.CaNew;

    } // END NEW FOR REPEAT for (i=0; i<this.unitStepRepeats; i+=1)

  }, // END of updateState()

  checkSSvalues : function() {
    // not implemented
  }, // END of checkSSvalues()

  display : function() {

    // note use .toFixed(n) method of object to round number to n decimal points

    var n = 0; // used as index

    // document.getElementById(this.displayReactorLeftT).innerHTML = this.Tin.toFixed(1) + ' K';
    document.getElementById(this.displayReactorLeftT).innerHTML = this.Trxr[0].toFixed(1) + ' K';
    document.getElementById(this.displayReactorRightT).innerHTML = this.Trxr[this.numNodes].toFixed(1) + ' K';

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

  } // END of display()

}; // END var puPlugFlowReactor
