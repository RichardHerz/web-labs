function puWaterTank01(pUnitIndex) {
  // constructor function for process unit
  //
  // for other info shared with other units and objects, see public properties
  // and search for controller. & interfacer. & plotter. & simParams. & plotInfo

  // *******************************************
  //  define INPUT CONNECTIONS from other units
  // *******************************************

  // define this unit's variables that are to receive input values from other units
  let flowRateIN = 0; // input flow rate from feed process unit

  this.updateInputs = function() {
    flowRateIN = processUnits[0].flowRate;
  }

  // *******************************************
  //  define OUTPUT CONNECTIONS to other units
  // *******************************************

  this.flowRateOUT = 0; // output water flow rate from this tank

  // *******************************************
  //        define PRIVATE properties
  // *******************************************

  const unitIndex = pUnitIndex; // index of this unit as child in parent object processUnits
  // unitIndex may be used in this unit's updateUIparams method

  // SPECIAL - DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, see updateDisplay below
  const theDisplayWaterDivID = "#div_water_1";
  // theDisplayWaterDivBtm = SUM orig CSS file specs of top+height pixels for water div
  const theDisplayWaterDivBtm = 232; // PIXELS, bottom of html water div IN PIXELS

  // allow this unit to take more than one step within one main loop step in updateState method
  const unitStepRepeats = 1;
  let unitTimeStep = simParams.simTimeStep / unitStepRepeats;
  let ssCheckSum = 0; // used in this.checkForSteadyState() method

  let level = 0; // water level in this process unit

  // *******************************************
  //         define PUBLIC properties
  // *******************************************

  this.name = 'process unit Water Tank 1'; // used by interfacer.copyData()
  this.residenceTime = 0; // used by controller.checkForSteadyState()

  // define arrays to hold info for variables
  // all used in interfacer.getInputValue() &/or interfacer.copyData() &/or plotInfo obj
  // these will be filled with values in method initialize()
  this.dataHeaders = []; // variable names
  this.dataInputs = []; // HTML field ID's of input parameters
  this.dataUnits = [];
  this.dataMin = [];
  this.dataMax = [];
  this.dataDefault = [];
  this.dataValues = [];

  // define arrays to hold data for plots, color canvas
  // these arrays will be used by plotter object
  // these will be filled with initial values in method reset()
  //
  // this.profileData = []; // for profile plots, plot script requires this name
  this.stripData = []; // for strip chart plots, plot script requires this name
  // this.colorCanvasData = []; // for color canvas, plot script requires this name

  // *******************************************
  //         define PRIVATE functions
  // *******************************************

  // *****************************************
  //        define PRIVILEGED methods
  // *****************************************

  this.initialize = function() {
    //
    // ADD ENTRIES FOR UI PARAMETER INPUTS FIRST, then output vars below
    //
    // SPECIAL - in this unit no UI inputs - input only from feed & controller
    //
    // OPTIONAL - add entries for output variables if want to use min-max to
    //            constrain values in updateState or dimensional units in plotInfo
    //
  } // END of initialize() method

  this.reset = function() {
    //
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.

    this.updateUIparams(); // this first, then set other values as needed

    // set state variables not set by updateUIparams() to initial settings

    this.residenceTime = 10;  // used in controller.checkForSteadyState() method

    // each unit has its own data arrays for plots and canvases

    // initialize strip chart data array
    // initPlotData(numStripVars,numStripPts)
    let numStripVars = 1; // level01
    let numStripPts = plotInfo[0]['numberPoints'];
    this.stripData = plotter.initPlotData(numStripVars,numStripPts);

    // update display
    this.updateDisplay();

  } // END of reset() method

  this.updateUIparams = function() {
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition
    //
    // SPECIAL - NONE FOR THIS UNIT

    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();
    // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
    ssCheckSum = 1;

  } // END of updateUIparams() method

  this.updateState = function() {
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
    unitTimeStep = simParams.simTimeStep / unitStepRepeats;

    // compute new value of level
    // here have normally open valve
    // increasing command to valve results in decreasing valve coefficient

    const diam = 2; // m, diameter of tank
    const Ax = Math.pow(diam,2) / 4 * Math.PI; // cross sectional area of tank
    const maxValveCoeff = 1.45; // 0-3
    let newCoef = maxValveCoeff;

    if (newCoef > maxValveCoeff) {
      newCoef = maxValveCoeff;
    }
    if (newCoef < 0) {
      newCoef = 0;
    }

    this.flowRateOUT = newCoef * Math.pow(level,0.5);

    // this.flowRateOUT = 0.01; // xxx test

    let exprValue = level + unitTimeStep / Ax * (flowRateIN - this.flowRateOUT );

    // make sure within limits
    // see puWaterController function updateInputs, maxSPvalue, minSPvalue
    if (exprValue > 3){exprValue = 3}
    if (exprValue < 0){exprValue = 0}

    // set new value
    level = exprValue;

  } // END of updateState() method

  this.updateDisplay = function() {
    // update display elements which only depend on this process unit
    // except do all plotting at main controller updateDisplay
    // since some plots may contain data from more than one process unit

    // SET LEVEL OF WATER IN TANK
    //    css top & left sets top-left of water rectangle
    //    from top of browser window - can't use css bottom because
    //    that is from bottom of browser window (not bottom rect from top window)
    //    and bottom of browser window can be moved by user,
    //    so must compute new top value to keep bottom of water rect
    //    constant value from top of browser window
    const pixPerHtUnit = 28.5; // 28.5 for 2 m diam, 2 m high
    let newHt = pixPerHtUnit * level;
    let origBtm = theDisplayWaterDivBtm;
    let el = document.querySelector(theDisplayWaterDivID);
    el.style.height = newHt + "px";
    el.style.top = (origBtm - newHt) + "px";

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    let tempArray = [];
    let numStripPoints = plotInfo[0]['numberPoints'];
    const numStripVars = 1; // only the variables from this unit

    // handle level
    v = 0;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,level] );
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

  this.checkForSteadyState = function() {
    // required - called by controller object
    // *IF* NOT used to check for SS *AND* another unit IS checked,
    // which can not be at SS, *THEN* return ssFlag = true to calling unit
    // returns ssFlag, true if this unit at SS, false if not
    // uses and sets ssCheckSum
    // ssCheckSum can be set by reset() and updateUIparams()
    // check for SS in order to save CPU time when sim is at steady state
    // check for SS by checking for any significant change in array end values
    // but wait at least one residence time after the previous check
    // to allow changes to propagate down unit
    //
    // multiply all numbers by a factor to get desired number significant
    // figures to left decimal point so toFixed() does not return string "0.###"
    // WARNING: too many sig figs will prevent detecting steady state
    //
    let rc = 1.0e3 * flowRateIN;
    let lt = 1.0e3 * level;
    rc = rc.toFixed(0); // strings
    lt = lt.toFixed(0);
    // concatenate strings
    let newCheckSum = rc +'.'+ lt;
    //
    let oldSScheckSum = ssCheckSum;
    let ssFlag = false;
    if (newCheckSum == oldSScheckSum) {ssFlag = true;}
    ssCheckSum = newCheckSum; // save current value for use next time
    //
    return ssFlag;
  } // END checkForSteadyState method

} // END of puWaterTank01
