class puBioRxrFeed {

  constructor(pUnitIndex) {
    this.unitIndex = pUnitIndex; // index of this unit as child in processUnits parent object
    // unitIndex used in this object's updateUIparams() method
  }

  // *****************************************
  //    define and get INPUT CONNECTIONS
  // *****************************************

  updateInputs() {
    this.concCommand = processUnits[2].command;
  }

  // for other info shared with other units and objects, see public properties
  // and search for controller. & interfacer. & plotter. & simParams. & plotInfo

  initialize() {

  // *****************************************
  //       define INPUT CONNECTIONS
  // *****************************************

  // define this unit's variables that are to receive input values from other units
  this.concCommand = 0; // input command from controller process unit

  // *******************************************
  //  define OUTPUT CONNECTIONS to other units
  // *******************************************

  this.conc = 0; // output feed conc to puBioReactor unit
  this.flowRate = 0; // output feed flow rate to puBioReactor unit

  // *******************************************
  //        define PRIVATE properties
  // *******************************************

  // let unitIndex = pUnitIndex; // index of this unit as child in processUnits parent object
  // // unitIndex used in this object's updateUIparams() method

  // allow this unit to take more than one step within one main loop step in updateState method
  const unitStepRepeats = 1;
  let unitTimeStep = simParams.simTimeStep / unitStepRepeats;
  this.ssCheckSum = 0; // used in checkForSteadyState() method

  // *******************************************
  //         define PUBLIC properties
  // *******************************************

  this.name = 'process unit Bioreactor Feed';
  this.residenceTime = 0; // used by controller.checkForSteadyState()

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  //
  // this.profileData = []; // for profile plots, plot script requires this name
  this.stripData = []; // for strip chart plots, plot script requires this name
  // this.colorCanvasData = []; // for color canvas, plot script requires this name

  // define arrays to hold info for variables
  // all used in interfacer.getInputValue() &/or interfacer.copyData() &/or plotInfo obj
  // these will be filled with values in method initialize()
  this.dataHeaders = []; // variable names
  this.dataInputs = []; // input field ID's
  this.dataUnits = [];
  this.dataMin = [];
  this.dataMax = [];
  this.dataDefault = [];
  this.dataValues = [];

  // *****************************************
  //         define PRIVATE functions
  // *****************************************

  // *****************************************
  //        define PRIVILEGED methods
  // *****************************************


    //
    // ADD ENTRIES FOR UI PARAMETER INPUTS FIRST, then output vars below
    //
    let v = 0;
    this.dataHeaders[v] = 'Flow Rate';
    this.dataInputs[v] = 'input_field_enterFeedFlowRate';
    this.dataUnits[v] = 'm3/h';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1;
    this.dataDefault[v] = 0.2;
    //
    // END OF INPUT VARS
    // record number of input variables, varCount
    // used, e.g., in copy data to table
    //
    this.varCount = v;
    //
    // OPTIONAL - add entries for output variables if want to use min-max to
    //            constrain values in updateState or dimensional units in plotInfo
    //

  } // END of initialize() method

reset() {
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

    // each unit has its own data arrays for plots and canvases

    // initialize strip chart data array
    // initPlotData(numStripVars,numStripPts)
    const numStripVars = 2; // flowRate, conc
    const numStripPts = plotInfo[0]['numberPoints'];
    this.stripData = plotter.initPlotData(numStripVars,numStripPts);

    // update display
    this.updateDisplay();

  } // END of reset() method

  updateUIparams() {
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // need to reset controller.ssFlag to false to get sim to run
     // after change in UI params when previously at steady state
     controller.resetSSflagsFalse();
     // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
     this.ssCheckSum = 1;

    // function getInputValue() is defined in file process_interfacer.js
    // getInputValue(unit # in processUnits object, variable # in dataInputs array)
    // see variable numbers above in initialize()
    // note: this.dataValues.[pVar]
    //   is only used in copyData() to report input values
    //
    let unum = this.unitIndex;
    //
    this.flowRate = this.dataValues[0] = interfacer.getInputValue(unum, 0);

  } // END of updateUIparams() method

updateState() {
    //
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE
    //
    // WARNING: this method must NOT contain references to other units!
    //          get info from other units ONLY in updateInputs() method

    this.conc = this.concCommand;

  } // END of updateState() method

  updateDisplay() {
    // update disply elements which only depend on this process unit
    // except do all plotting at main controller updateDisplay
    // since some plots may contain data from more than one process unit

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    let tempArray = [];
    const numStripPoints = plotInfo[0]['numberPoints'];
    const numStripVars = 2; // only the variables from this unit

    // handle flowRate
    v = 0;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,this.flowRate] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // handle conc
    v = 1;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,this.conc] );
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

  } // END of updateDisplay() method

  checkForSteadyState() {
    // required - called by controller object
    // returns ssFlag, true if this unit at SS, false if not
    // *IF* NOT used to check for SS *AND* another unit IS checked,
    // which can not be at SS, *THEN* return ssFlag = true to calling unit
    // HOWEVER, if this unit has UI inputs, need to be able to return false
    let ssFlag = true;
    // ssCheckSum set != 0 on updateUIparams() execution
    if (this.ssCheckSum != 0) {
      ssFlag = false;
    }
    this.ssCheckSum = 0;
    return ssFlag;
  } // END of checkForSteadyState() method

} // END of puBioRxrFeed
