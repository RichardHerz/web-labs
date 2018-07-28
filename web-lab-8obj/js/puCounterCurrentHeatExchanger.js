/*
  Design, text, images and code by Richard K. Herz, 2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// EACH PROCESS UNIT DEFINITION MUST CONTAIN AT LEAST THESE 7 FUNCTIONS:
// initialize, reset, updateUIparams, updateInputs, updateState,
//   updateDisplay, checkForSteadyState
// THESE FUNCTION DEFINITIONS MAY BE EMPTY BUT MUST BE PRESENT

let puCounterCurrentHeatExchanger = {
  unitIndex : 1, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'Counter-Current Heat Exchanger',

  //  SUMMARY OF DEPENDENCIES
  //
  //  THIS OBJECT HAS MULTIPLE I/O CONNECTIONS TO HTML
  //
  //  USES FROM OBJECT simParams the following:
  //    GETS simParams.simTimeStep, SETS simParams.ssFlag
  //  OBJECT simParams USES FROM THIS OBJECT:
  //    residenceTime
  //  OBJECT plotInfo USES FROM THIS OBJECT:
  //    numNodes, and possibly others
  //  USES FROM OBJECT puAdiabaticPackedBedPFR, here as processUnits[0], the following:
  //    numNodes, residenceTime, Trxr[]
  //    reactor outlet T is heat exchanger hot inlet T
  //  OBJECT puAdiabaticPackedBedPFR, here as processUnits[0],
  //    USES FROM THIS UNIT:
  //      Tcold[] - heat exchanger cold outlet T is reactor inlet T
  //  CALLS TO FUNCTIONS HERE ARE SENT BY THE FOLLOWING EXTERNAL FUNCTIONS:
  //    initialize() sent by openThisLab() in main.js
  //    reset() sent by resetThisLab() in interface.js
  //    updateInputs() & updateState() sent by updateProcessUnits() in main.js
  //    updateDisplay() sent by updateDisplay() in main.js
  //    updateUIparams() sent by updateUIparams() in main.js
  //    checkForSteadyState() sent by checkForSteadyState() in simParams object
  //  THE FOLLOWING EXTERNAL FUNCTIONS USE VALUES FROM THIS OBJECT:
  //    copyData() in copy_data.js uses name, varCount, dataHeaders[],
  //        dataUnits[], dataValues[], profileData[], stripData[]
  //    getInputValue() in interface.js uses dataInputs[], dataInitial[],
  //        dataMin[], dataMax[]
  //    getPlotData() uses profileData[], stripData[]
  //    plotColorCanvasPlot() in spacetime.js uses colorCanvasData[]

  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, used in updateInputs() method
  getInputs : function() {
    let inputs = [];
    let nn = processUnits[0].numNodes; // numNodes my differ from this unit's
    inputs[0] = processUnits[0]['Trxr'][nn]; // nn from above, RXR T out = HX TinHot
    inputs[1] = processUnits[0].residenceTime; // match RXR time to HX time
    return inputs;
  },

  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS...
  // SEE dataInputs array in initialize() method for input field ID's

  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, used in updateDisplay() method
  displayHotLeftT: 'field_hot_left_T',
  displayHotRightT: 'field_hot_right_T',
  displayColdLeftT: 'field_cold_left_T',
  displayColdRightT: 'field_cold_right_T',
  displayColdLeftArrow : '#field_cold_left_arrow', // needs # with ID
  displayColdRightArrow : '#field_cold_right_arrow', // needs # with ID

  // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***
  // ***   EXCEPT TO HTML ID'S IN method initialize(), array dataInputs    ***

  // define main inputs
  // values will be set in method intialize()
  TinHot : 0,
  TinCold : 0,
  Flowrate : 0,
  FlowHot : 0,
  FlowCold : 0,
  CpHot : 0,
  CpCold : 0,
  Ucoef : 0,
  Area : 0,
  Diam : 0,
  VarCount : 0, // number of input variables

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
  Thot : [],
  Tcold : [],

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

  // check for any changes to simTimeStep and simStepRepeats if change numNodes
  // numNodes is accessed in process_plot_info.js
  numNodes : 200,

  FluidDensity : 1000.0, // kg/m3, fluid density specified to be that of water

  ssCheckSum : 0, // used to check for steady state
  residenceTime : 0, // for timing checks for steady state check
  // residenceTime is an input to this unit from RXR & is set in updateInputs()
  // residenceTime is used in this unit's updateState()


  initialize : function() {
    //
    let v = 0;
    // *** input field reactor flow is m3/s, whereas heat exchanger flow is kg/s ***
    this.dataHeaders[v] = 'Flowrate';
    this.dataInputs[v] = 'input_field_Flowrate';
    this.dataUnits[v] = 'm3/s';
    this.dataMin[v] = 0;
    this.dataMax[v] = 10;
    this.dataInitial[v] = 5.0e-3;
    this.Flowrate = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Flowrate; // current input value for reporting
    //
    v = 1;
    this.dataHeaders[v] = 'System Tin';
    this.dataInputs[v] = 'input_field_Tin';
    this.dataUnits[v] = 'K';
    this.dataMin[v] = 320;
    this.dataMax[v] = 380;
    this.dataInitial[v] = this.dataMin[v];
    this.Tin = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.Tin; // current input value for reporting
    //
    v = 2;
    this.dataHeaders[v] = 'UAcoef';
    // NOTE: dataInputs example where field ID name differs from variable name
    this.dataInputs[v] = 'input_field_UA';
    this.dataUnits[v] = 'kW/K';
    this.dataMin[v] = 0;
    this.dataMax[v] = 60;
    this.dataInitial[v] = 20;
    this.UAcoef = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.UAcoef; // current input value for reporting
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table
    this.VarCount = v;
    //
    // OUTPUT VARS
    //

    // *** SPECIAL - NEED TO MATCH FLOW RATE DIMENSIONAL UNITS BETWEEN PROCESS UNITS ***
    this.FlowHot = this.Flowrate; // m3/s in reactor
    // *** input field reactor flow is m3/s, whereas heat exchanger flow is kg/s ***
    this.FlowHot = this.FluidDensity * this.FlowHot; // kg/s = kg/m3 * m3/s
    this.FlowCold = this.FlowHot;

  }, // END of initialize()

  // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***

  reset : function() {

    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset(), which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered

    this.updateUIparams(); // this first, then set other values as needed

    // set state variables not set by updateUIparams() to initial settings

    // set to zero ssCheckSum used to check for steady state
    this.ssCheckSum = 0;

    this.TinCold = this.Tin;
    this.TinHot = this.Tin;

    this.FlowHot = this.Flowrate; // input field is (m3/s)
    // *** input field reactor flow is m3/s, whereas heat exchanger flow is kg/s ***
    this.FlowHot = this.FluidDensity * this.FlowHot; // (kg/s) = kg/m3 * m3/s
    this.FlowCold = this.FlowHot;

    // initialize profile data array
    // initPlotData(numProfileVars,numProfilePts)
    this.profileData = plotterFlot.initPlotData(2,this.numNodes); // holds data for static profile plots

    // // initialize strip chart data array
    // // initPlotData(numStripVars,numStripPts)
    // this.stripData = plotterFlot.initPlotData(numStripVars,numStripPts); // holds data for scrolling strip chart plots

    // initialize local array to hold color-canvas data, e.g., space-time data -
    // initColorCanvasArray(numVars,numXpts,numYpts)
    this.colorCanvasData = initColorCanvasArray(2,this.numNodes,1);

    let tInit = 320; // this.Tin; // initial system inlet T
    for (k = 0; k <= this.numNodes; k += 1) {
      this.Thot[k] = tInit;
      this.Tcold[k] = tInit;
    }

    let kn = 0;
    for (k=0; k<=this.numNodes; k+=1) {
      kn = k/this.numNodes;
      // x-axis values
      // x-axis values will not change during sim
      // XXX change to get number vars for this array
      //     so can put in repeat - or better yet, a function
      //     and same for y-axis below
      // first index specifies which variable
      this.profileData[0][k][0] = kn;
      this.profileData[1][k][0] = kn;
      // y-axis values
      this.profileData[0][k][1] = 320; // this.Tin;
      this.profileData[1][k][1] = 320; // this.Tin;
    }

     // update display
    this.updateDisplay();

  }, // end reset

  updateUIparams : function() {
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition
    // need to directly set simParams.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    simParams.ssFlag = false;

    // set to zero ssCheckSum used to check for steady state by this unit
    this.ssCheckSum = 0;

    // check input fields for new values
    // function getInputValue() is defined in file process_interface.js
    // getInputValue(unit index in processUnits, let index in input arrays)
    // see variable numbers above in initialize()
    // note: processUnits[pUnitIndex]['dataValues'][pVar]
    //   is only used in copyData() to report input values
    //
    let unum = this.unitIndex;
    //
    this.Flowrate = this.dataValues[0] = interface.getInputValue(unum, 0);
    this.Tin = this.dataValues[1] = interface.getInputValue(unum, 1);
    this.UAcoef = this.dataValues[2] = interface.getInputValue(unum, 2);

    // *** input field reactor flow is m3/s, whereas heat exchanger flow is kg/s ***
    this.FlowHot = this.Flowrate * this.FluidDensity; // (kg/s) = (m3/s) * (kg/m3)
    this.FlowCold = this.FlowHot;

    // also update ONLY inlet T's on ends of heat exchanger in case sim is paused
    // outlet T's not defined on first entry into page
    // but do not do full updateDisplay

    this.TinCold = this.Tin;
    // *** FOR HX coupled to RXR, let RXR set TinHot display field
    document.getElementById(this.displayColdLeftT).innerHTML = this.TinCold.toFixed(1) + ' K';

  }, // END of updateUIparams()

  updateInputs : function() {
    //
    // GET INPUT CONNECTION VALUES FROM OTHER UNITS FROM PREVIOUS TIME STEP,
    //   SINCE updateInputs IS CALLED BEFORE updateState IN EACH TIME STEP
    // SPECIFY REFERENCES TO INPUTS ABOVE in this unit definition

    // check for change in overall main time step simTimeStep
    this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

    // *** GET INFO FROM REACTOR ***
    // get array of current input values to this unit from other units
    let inputs = this.getInputs();
    this.TinHot = inputs[0]; // HX TinHot = RXR T out
    this.residenceTime = inputs[1]; // match RXR time to HX time

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

    // *** NEW FOR ADIABATIC RXR + HX ***
    // fix Cp's here
    CpHot = 2.24; // kJ/kg/K
    CpCold = CpHot;

    // this HX uses length for integration
    // so need to make some assumptions to obtain HX length
    // residenceTime is obtained in updateInputs() from reactor
    let Volume = this.residenceTime * this.Flowrate; // use Flowrate (m3/s)
    let Diam = 0.1; // (m), arbitrary, fix so can get length for integratino
    let Length = Volume * 4.0 / Math.PI / Math.pow(Diam, 2); // (m)

    let Ax = Math.PI * Math.pow(Diam, 2) / 4.0; // (m2), cross-sectional area for flow
    let VelocHot = this.Flowrate / Ax; // (m/s), linear fluid velocity
    let VelocCold = VelocHot;

    // this.UAcoef from UI input has units of (kW/K)
    let Awall = Math.PI * Diam * Length; // (m2)
    let Ucoef = this.UAcoef / Awall; // (kW/m2/K)

    // note XferCoefHot = U * (wall area per unit length) / (rho * Cp * Ax)
    let XferCoefHot = Ucoef * (Awall / Length) / (this.FluidDensity * CpHot * Ax);
    let XferCoefCold = XferCoefHot;

    // *** FOR RXR + HX USE ZERO TURBULENT DISPERSION COEFFICIENT ***
    // *** will get effective dispersion due to finite difference approx ***
    let DispHot = 0.0;
    let DispCold = DispHot;

    let dz = Length / this.numNodes; // (m), distance between nodes
    let VelocHotOverDZ = VelocHot / dz; // precompute to save time in loop
    let VelocColdOverDZ = VelocCold / dz; // precompute to save time in loop
    let DispHotOverDZ2 = DispHot / Math.pow(dz, 2);  // precompute to save time in loop
    let DispColdOverDZ2 = DispCold / Math.pow(dz, 2);  // precompute to save time in loop

    let i = 0; // index for step repeats
    let n = 0; // index for nodes
    let ThotN = 0.0;
    let ThotNm1 = 0.0;
    let ThotNp1 = 0.0;
    let TcoldN = 0.0;
    let TcoldNm1 = 0.0;
    let TcoldNp1 = 0.0;
    let dThotDT = 0.0;
    let dTcoldDT = 0.0;
    let minTinCold = this.dataMin[1];
    let maxTinHot = this.dataMax[0];

    let ThotNew = []; // temporary new values for this updateState
    let TcoldNew = [];

    // this unit can take multiple steps within one outer main loop repeat step
    for (i=0; i<this.unitStepRepeats; i+=1) {

      // do node at hot inlet end
      n = 0;

      ThotNew[0] = this.TinHot;
      TcoldNew[0] = this.Tcold[1];

      // internal nodes
      for (n = 1; n < this.numNodes; n += 1) {

        // internal nodes include dispersion terms

        ThotN = this.Thot[n];
        ThotNm1 = this.Thot[n-1];
        ThotNp1 = this.Thot[n+1];
        dThotDT = VelocHotOverDZ*(ThotNm1-ThotN) + XferCoefHot*(TcoldN-ThotN)
                      // + DispHotOverDZ2 * (ThotNp1 - 2.0 * ThotN + ThotNm1)
                    ; // deactivate dispersion calc for speed, save for future use

        TcoldN = this.Tcold[n];
        TcoldNm1 = this.Tcold[n-1];
        TcoldNp1 = this.Tcold[n+1];
        dTcoldDT = VelocColdOverDZ*(TcoldNp1-TcoldN) + XferCoefCold*(ThotN-TcoldN)
                      // + DispHotOverDZ2 * (ThotNp1 - 2.0 * ThotN + ThotNm1)
                    ; // deactivate dispersion calc for speed, save for future use

        ThotN = ThotN + dThotDT * this.unitTimeStep;
        TcoldN = TcoldN + dTcoldDT * this.unitTimeStep;

        ThotNew[n] = ThotN;
        TcoldNew[n] = TcoldN;

      } // end repeat through internal nodes

      // do node at hot outlet end

      n = this.numNodes;

      ThotNew[n] = this.Thot[n - 1];
      TcoldNew[n] = this.TinCold;

      // finished updating all nodes

      // copy new to current
      this.Thot = ThotNew;
      this.Tcold = TcoldNew;

    } // END of FOR REPEAT for (i=0; i<this.unitStepRepeats; i+=1)

  }, // END of updateState()

  updateDisplay : function() {
    // update display elements which only depend on this process unit
    // except do all plotting at main controller updateDisplay
    // since some plots may contain data from more than one process unit

    // note use .toFixed(n) method of object to round number to n decimal points

    let n = 0; // used as index

    document.getElementById(this.displayHotLeftT).innerHTML = this.Thot[this.numNodes].toFixed(1) + ' K';
    document.getElementById(this.displayHotRightT).innerHTML = this.Thot[0].toFixed(1) + ' K';

    // NOTE: HX cold out T (right) and RXR T in will not agree except at SS
    // and HX hot in T (right) and RXR T out with not agree except at SS
    // because RXR T in doesn't get set to HX cold out until start of next time step
    // and HX hot in doesn't get set to RXR out until start of next time step
    // decide not to force match in display so that display agrees with copy data

    document.getElementById(this.displayColdLeftT).innerHTML = this.TinCold.toFixed(1) + ' K';
    document.getElementById(this.displayColdRightT).innerHTML = this.Tcold[0].toFixed(1) + ' K';

    // HANDLE PROFILE PLOT DATA

    // copy variable values to profileData array which holds data for plotting

    // XXX CONSIDER RE-ORDERING LAST TWO INDEXES IN profileData SO CAN USE
    //     SIMPLE ASSIGNMENT FOR ALL Y VALUES, e.g.,
    // profileData[0][1][n] = y;

    for (n=0; n<=this.numNodes; n+=1) {
      this.profileData[0][n][1] = this.Thot[n]; // or d'less (this.Thot[n] - this.TinCold) / (this.TinHot - this.TinCold);
      this.profileData[1][n][1] = this.Tcold[n]; // or d'less (this.Tcold[n] - this.TinCold) / (this.TinHot - this.TinCold);
    }

    // HANDLE COLOR CANVAS DATA >> HERE IS HOT AND COLD SIDES OF EXCHANGER
    // FOR HEAT EXCHANGER
    // the data vs. node is horizontal, not vertical
    // and vertical strip is all the same
    // so when initialize colorCanvasData array, take this into account
    // FOR HEAT EXCHANGER - COLOR CANVAS DOES NOT SCROLL WITH TIME
    // SO DO NOT SHIFT AND PUSH DATA LIKE DO IN SCROLLING CANVAS

    // colorCanvasData[v][x][y]
    for (n=0; n<=this.numNodes; n+=1) {
      this.colorCanvasData[0][n][0] = this.Thot[n];
      this.colorCanvasData[1][n][0] = this.Tcold[n];
    }

    // FOR HEAT EXCHANGER - DO NOT USE STRIP CHART YET
    // HANDLE STRIP CHART DATA

  }, // END of updateDisplay()

  checkForSteadyState : function() {
    // required - called by simParams
    // if not used to check for SS, return ssFlag = true to calling unit
    // returns ssFlag, true if this unit at SS, false if not
    // uses and sets this.ssCheckSum
    // this.ssCheckSum can be set by reset() and updateUIparams()
    // check for SS in order to save CPU time when sim is at steady state
    // check for SS by checking for any significant change in array end values
    // but wait at least one residence time after the previous check
    // to allow changes to propagate down unit
    //
    // here use HX end T's to check for SS
    // found need 2 * residenceTime to reach SS
    // when starting up at system T in = 350 K
    // and now HX res time arbitrarily set to = RXR res time
    //
    let nn = this.numNodes;
    let hlt = 1.0e5 * this.Thot[nn].toFixed(1);
    let hrt = 1.0e1 * this.Thot[0].toFixed(1);
    let clt = 1.0e-3 * this.Tcold[nn].toFixed(1);
    let crt = 1.0e-7 * this.Tcold[0].toFixed(1);
    // NOTE: newCheckSum = hlt0hrt0.clt0crt0 << 16 digits, 4 each for 4 end T's
    let newCheckSum = hlt + hrt + clt  + crt;
    let oldSScheckSum = this.ssCheckSum;
    let ssFlag = false;
    if (newCheckSum == oldSScheckSum) {ssFlag = true;}
    this.ssCheckSum = newCheckSum; // save current value for use next time
    return ssFlag;
  } // END OF checkForSteadyState()

} // END let puHeatExchanger
