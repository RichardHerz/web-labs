function puFEED(pUnitIndex) {
  // constructor function for process unit

  // for other info shared with other units and objects, see public properties
  // and search for controller. & interfacer. & plotter. & simParams. & plotInfo

  // *******************************************
  //  define INPUT CONNECTIONS from other units
  // *******************************************

  // SPECIAL - none for this unit - only inputs from HTML UI
  this.updateInputs = function() {}

  // *******************************************
  //  define OUTPUT CONNECTIONS to other units
  // *******************************************

  this.conc = 0; // output feed conc to first CSTR

  // *******************************************
  //        define PRIVATE properties
  // *******************************************

  // unitIndex may be used in this object's updateUIparams method
  const unitIndex = pUnitIndex; // index of this unit as child in parent object processUnits
  // allow this unit to take more than one step within one main loop step in updateState method
  const unitStepRepeats = 1;
  let unitTimeStep = simParams.simTimeStep / unitStepRepeats;
  let ssCheckSum = 0; // used in checkForSteadyState method

  // CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS
  // **** currently use these but also see IDs in initialize method, where
  // **** they are not currently used - which is best?
  let thisConcSliderID = 'range_setFeedConc_slider';
  let thisConcFieldID = 'input_setFeedConc_value';

  // *******************************************
  //         define PUBLIC properties
  // *******************************************

  this.name = 'feed';
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

  // *******************************************
  //         define PRIVATE functions
  // *******************************************

  // *****************************************
  //        define PRIVILEGED methods
  // *****************************************

  this.initialize = function() {

    // console.log('enter this.initialize, this unitIndex = ' + unitIndex); // xxx

    //
    // ADD ENTRIES FOR UI PARAMETER INPUTS FIRST, then output vars below
    //
    let v = 0;
    this.dataHeaders[v] = 'Feed Conc';
    this.dataInputs[v] = 'range_setFeedConc_slider';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1;
    this.dataInitial[v] = 0;
    this.conc = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.conc; // current input oalue for reporting
    //
    v = 1;
    this.dataHeaders[v] = 'Feed Conc';
    this.dataInputs[v] = 'input_setFeedConc_value';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1;
    this.dataInitial[v] = 0;
    this.conc = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.conc; // current input oalue for reporting
    //
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table
    //
    this.VarCount = v;
    //
    // OPTIONAL - add entries for output variables if want to use min-max to
    //            constrain values in updateState or dimensional units in plotInfo
    //

  } // END of initialize()

  this.reset = function(){

    // console.log('enter this.reset, this unitIndex = ' + unitIndex); // xxx

    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.

    this.updateUIparams(); // this first, then set other values as needed

    // set state variables not set by updateUIparams() to initial settings

    // each unit has its own data arrays for plots and canvases

    // initialize strip chart data array
    // initPlotData(numStripVars,numStripPts)
    const numStripVars = 1; // conc
    const numStripPts = plotInfo[0]['numberPoints'];
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
      this.stripData[0][k][1] = 0;
    }

    // update display
    this.updateDisplay();

  } // end reset() method

  this.updateUIparams = function(){

  // console.log('enter this.updateUIparams, this unitIndex = ' + unitIndex); // xxx

    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();
    // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
    ssCheckSum = 1;

    this.updateUIfeedInput();

  } // END updateUIparams

  this.updateUIfeedInput = function() {
    // SPECIAL FOR THIS UNIT
    // called in HTML input element so must be a publc method
    let unum = unitIndex;
    this.conc = this.dataValues[1] = interfacer.getInputValue(unum, 1);
    // alert('input: this.conc = ' + this.conc);
    // update position of the range slider
    if (document.getElementById(thisConcSliderID)) {
      // alert('input, slider exists');
      document.getElementById(thisConcSliderID).value = this.conc;
    }
    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();
    // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
    ssCheckSum = 1;
  }, // END method updateUIfeedInput()

  this.updateUIfeedSlider = function() {
    // SPECIAL FOR THIS UNIT
    // called in HTML input element so must be a publc method
    let unum = unitIndex;
    this.conc = this.dataValues[0] = interfacer.getInputValue(unum, 0);
    // update input field display
    // alert('slider: this.conc = ' + this.conc);
    if (document.getElementById(thisConcFieldID)) {
      document.getElementById(thisConcFieldID).value = this.conc;
    }
    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();
    // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
    ssCheckSum = 1;
  } // END method updateUIfeedSlider()

  this.updateState = function() {
    //
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE
    //
    // WARNING: this method must NOT contain references to other units!
    //          get info from other units ONLY in updateInputs() method

    // SPECIAL - FEED UNIT - state set by HTML inputs - no actions here

  } // end updateState method

  this.updateDisplay = function() {

  // console.log('enter this.updateDisplay, this unitIndex = ' + unitIndex); // xxx

    // update display elements which only depend on this process unit
    // except do all plotting at main controller updateDisplay
    // since some plots may contain data from more than one process unit

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    const numStripPoints = plotInfo[0]['numberPoints'];
    const numStripVars = 1; // only the variables from this unit

    // handle feed conc
    v = 0;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [ 0, this.conc] );
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

  } // END of updateDisplay()

  this.checkForSteadyState = function() {

  // console.log('enter this.checkForSteadyState, this unitIndex = ' + unitIndex); // xxx

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
  } // END OF checkForSteadyState()

} // END unit FEED
