let puTEMPLATE = {
  unitIndex : 0, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'process unit template',

  // SUMMARY OF DEPENDENCIES

  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, used in updateInputs() method
  getInputs : function() {
    let inputs = [];
    // *** e.g., inputs[0] = processUnits[1]['Tcold'][0]; // HX T cold out = RXR Tin
    return inputs;
  },

  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS...
  // SEE dataInputs array in initialize() method for input field ID's

  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, used in updateDisplay() method
  // *** e.g., displayReactorLeftConc: 'field_reactor_left_conc',

  // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***
  // ***   EXCEPT TO HTML ID'S IN method initialize(), array dataInputs    ***

  // define main inputs
  // values will be set in method intialize()
  // *** e.g., Kf300 : 0, // forward rate coefficient value at 300 K

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
  profileData : [], // for profile plots, plot script requires this name
  stripData : [], // for strip chart plots, plot script requires this name
  colorCanvasData : [], // for color canvas plots, plot script requires this name

  // allow this unit to take more than one step within one main loop step in updateState method
  unitStepRepeats : 100,
  unitTimeStep : simParams.simTimeStep / this.unitStepRepeats,

  // WARNING: IF INCREASE NUM NODES BY A FACTOR THEN HAVE TO
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

  initialize : function() {
    //
    // let v = 0;
    // this.dataHeaders[v] = 'Kf300';
    // this.dataInputs[v] = 'input_field_Kf300';
    // this.dataUnits[v] = 'm3/kg/s';
    // this.dataMin[v] = 0;
    // this.dataMax[v] = 1;
    // this.dataDefault[v] = 1.0e-7;
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
    // v = 7;
    // this.dataHeaders[v] = 'Trxr';
    // this.dataUnits[v] =  'K';
    // // Trxr dataMin & dataMax can be changed in updateUIparams()
    // this.dataMin[v] = 200;
    // this.dataMax[v] = 500;
    //

  }, // END initialize method

  // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***

  reset : function() {
    //
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.

    this.updateUIparams(); // this first, then set other values as needed

    // set state variables not set by updateUIparams() to initial settings

    // need to set controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();

    // set to zero ssCheckSum used to check for steady state by this unit
    this.ssCheckSum = 0;

    for (k = 0; k <= this.numNodes; k += 1) {
      this.Ca[k] = this.dataDefault[4]; // [4] is Cain
      this.Trxr[k] = this.dataDefault[6]; // [6] is TinHX
    }

    // initialize profile data array
    // initPlotData(numProfileVars,numProfilePts)
    this.profileData = plotter.initPlotData(2,this.numNodes); // holds data for static profile plots

    // // initialize strip chart data array
    // // initPlotData(numStripVars,numStripPts)
    // this.stripData = plotter.initPlotData(numStripVars,numStripPts); // holds data for scrolling strip chart plots

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
      this.profileData[0][k][1] = this.dataDefault[6]; // [6] is TinHX
      this.profileData[1][k][1] = this.dataDefault[4]; // [4] is Cain
    }

    // update display
    this.updateDisplay();

  }, // end reset

  updateUIparams : function() {
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // need to set controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();

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
    // *** e.g., this.Kf300 = this.dataValues[0] = interface.getInputValue(unum, 0);

  }, // END of updateUIparams()

  updateInputs : function() {
    //
    // GET INPUT CONNECTION VALUES FROM OTHER UNITS FROM PREVIOUS TIME STEP,
    //   SINCE updateInputs IS CALLED BEFORE updateState IN EACH TIME STEP
    // SPECIFY REFERENCES TO INPUTS ABOVE in this unit definition

    // check for change in overall main time step simTimeStep
    this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

    // get array of current input values to this unit from other units
    let inputs = this.getInputs();
    this.Tin = inputs[0]; // RXR Tin = HX T cold out

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

  }, // END of updateState()

  updateDisplay : function() {
    // update display elements which only depend on this process unit
    // except do all plotting at main controller updateDisplay
    // since some plots may contain data from more than one process unit

    // note use .toFixed(n) method of object to round number to n decimal points

    let n = 0; // used as index

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
    // *** RXR NOT USED TO CHECK FOR SS IN THIS LAB - HX is checked ***
    //
    let ssFlag = true;
    return ssFlag;
  } // END OF checkForSteadyState()

}; // END puTEMPLATE
