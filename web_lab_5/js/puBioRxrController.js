function puBioRxrController(pUnitIndex) {
  // constructor function for process unit
  //
  // for other info shared with other units and objects, see public properties
  // and search for controller. & interfacer. & plotter. & simParams. & plotInfo

  // *****************************************
  //       define INPUT CONNECTIONS
  // *****************************************

  // define this unit's variables that are to receive input values from other units
  let processVariable = 0; // input process variable to be controlled

  this.updateInputs = function() {
    processVariable = processUnits[1].biomass;
  }

  // *******************************************
  //  define OUTPUT CONNECTIONS to other units
  // *******************************************

  this.command = 0; // output command from this controller unit

  // *******************************************
  //        define PRIVATE properties
  // *******************************************

  // unitIndex may be used in this object's updateUIparams method
  const unitIndex = pUnitIndex; // index of this unit as child in parent object processUnits
  // allow this unit to take more than one step within one main loop step in updateState method
  const unitStepRepeats = 1;
  let unitTimeStep = simParams.simTimeStep / unitStepRepeats;
  let ssCheckSum = 0; // used in checkForSteadyState method

  // local variables used by controller process unit
  let setPoint = 0;
  let gain = 0; // controller gain
  let resetTime = 0; // controller reset time
  let manualBias = 0;
  let manualCommand = 0;
  let errorIntegral = 0;
  let mode = "manual"; // auto or manual, see changeMode() below

  // *******************************************
  //         define PUBLIC properties
  // *******************************************

  this.name = 'process unit Bioreactor Controller'; // used by interfacer.copyData()
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
  this.dataInitial = [];
  this.dataValues = [];

  // *****************************************
  //        define PRIVILEGED methods
  // *****************************************

  this.initialize = function() {
    //
    // ADD ENTRIES FOR UI PARAMETER INPUTS FIRST, then output vars below
    //
    let v = 0;
    this.dataHeaders[v] = 'set point';
    this.dataInputs[v] = 'input_field_enterSetpoint';
    this.dataUnits[v] = 'kg/m3';
    this.dataMin[v] = 0;
    this.dataMax[v] = 30;
    this.dataInitial[v] = 5;
    setPoint = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = setPoint; // current input oalue for reporting
    //
    v = 1;
    this.dataHeaders[v] = 'gain';
    this.dataInputs[v] = 'input_field_enterGain';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 2;
    this.dataInitial[v] = 0.1;
    gain = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = gain; // current input oalue for reporting
    //
    v = 2;
    this.dataHeaders[v] = 'reset time';
    this.dataInputs[v] = 'input_field_enterResetTime';
    this.dataUnits[v] = 'h';
    this.dataMin[v] = 0;
    this.dataMax[v] = 100;
    this.dataInitial[v] = 5;
    resetTime = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = resetTime; // current input oalue for reporting
    //
    v = 3;
    this.dataHeaders[v] = 'manualCommand';
    this.dataInputs[v] = 'input_field_enterSubstrateFeedConc';
    this.dataUnits[v] = 'kg/m3';
    this.dataMin[v] = 0;
    this.dataMax[v] = 40;
    this.dataInitial[v] = 30;
    manualCommand = this.dataInitial[v];
    this.dataValues[v] = manualCommand;
    //
    // SPECIAL - SET CHECKED OF RADIO BUTTONS TO MATCH THIS SETTING
    // PAGE RELOAD DOES NOT CHANGE CHECKED BUT DOES CALL initialize
    document.getElementById("radio_controllerAUTO").checked = false;
    document.getElementById("radio_controllerMANUAL").checked = true;
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table
    //
    // special, use v-1 to not report manualCommand in copy data table header
    // but need manualCommand as input var to get from html input
    this.VarCount = v-1;
    //
    // OPTIONAL - add entries for output variables if want to use min-max to
    //            constrain values in updateState or dimensional units in plotInfo
    //
    v = 4;
    this.dataHeaders[v] = 'command';
    this.dataUnits[v] =  'kg/m3';
    this.dataMin[v] = 0;
    this.dataMax[v] = this.dataMax[3];

  } // END of initialize() method

  this.reset = function() {
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
    ssCheckSum = 0;

    // set state variables not set by updateUIparams to initial settings
    errorIntegral = 0;
    this.command = this.dataInitial[3]; // initial manual command

    // XXX should this reset mode to manual?

    // each unit has its own data arrays for plots and canvases

    // initialize strip chart data array
    // initPlotData(numStripVars,numStripPts)
    const numStripVars = 2; // setPoint, command
    const numStripPts = plotInfo[0]['numberPoints'];
    this.stripData = plotter.initPlotData(numStripVars,numStripPts);

    // update display
    this.updateDisplay();

  } // END of reset() method

  this.changeMode = function(){
    let el = document.querySelector("#radio_controllerAUTO");
    if (el.checked){
      mode = "auto";
      manualBias = this.command; // for "bumpless transfer"
    } else {
      mode = "manual";
    }

    // zero errorIntegral on all changeModes
    errorIntegral = 0;

    // need to reset controller.ssFlag to false to get sim to run
     // after change in UI params when previously at steady state
     controller.resetSSflagsFalse();
     // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
     ssCheckSum = 1;

  } // END of changeMode() method

  this.updateUIparams = function() {
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // need to reset controller.ssFlag to false to get sim to run
     // after change in UI params when previously at steady state
     controller.resetSSflagsFalse();
     // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
     ssCheckSum = 1;

    // check input fields for new values
    // function getInputValue() is defined in file process_interfacer.js
    // getInputValue(unit # in processUnits object, variable # in dataInputs array)
    // see variable numbers above in initialize()
    // note: this.dataValues.[pVar]
    //   is only used in copyData() to report input values
    //
    let unum = unitIndex;
    //
    setPoint = this.dataValues[0] = interfacer.getInputValue(unum, 0);
    gain = this.dataValues[1] = interfacer.getInputValue(unum, 1);
    resetTime = this.dataValues[2] = interfacer.getInputValue(unum, 2);
    manualCommand = this.dataValues[3] = interfacer.getInputValue(unum, 3);

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

    // compute new value of PI controller command
    // manual bias set to current command when switching to auto in changeMode()
    let error = setPoint - processVariable;
    this.command = manualBias + gain *
                  (error + (1/resetTime) * errorIntegral);

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
      errorIntegral = errorIntegral + error * unitTimeStep; // update integral of error
    }

    if (mode == "manual"){
      // replace command with value entered in input in page
      // let el = document.querySelector("#enterJacketFeedTTemp");
      // this.command = el.value;
      this.command = manualCommand;
    } else {
      // in auto mode, use command computed above
    }

    // console.log('errorIntegral = '+errorIntegral);
    // console.log('this.command = '+this.command);

  } // END of updateState() method

  this.updateDisplay = function() {

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    let tempArray = [];
    const numStripPoints = plotInfo[0]['numberPoints'];
    const numStripVars = 2; // only the variables from this unit

    // handle setPoint
    v = 0;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,setPoint] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // handle command
    v = 1;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,this.command] );
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
    // returns ssFlag, true if this unit at SS, false if not
    // *IF* NOT used to check for SS *AND* another unit IS checked,
    // which can not be at SS, *THEN* return ssFlag = true to calling unit
    // HOWEVER, if this unit has UI inputs, need to be able to return false
    let ssFlag = true;
    // ssCheckSum set != 0 on updateUIparams() execution
    if (ssCheckSum != 0) {
      ssFlag = false;
    }
    ssCheckSum = 0;
    return ssFlag;
  } // END of checkForSteadyState() method

} // END of puBioRxrController
