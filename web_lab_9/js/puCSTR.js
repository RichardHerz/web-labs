function puCSTR(pUnitIndex) {
  // constructor function for process unit

  // for other info shared with other units and objects, see public properties
  // and search for controller. & interfacer. & plotter. & simParams. & plotInfo

  // *******************************************
  //  define INPUT CONNECTIONS from other units
  // *******************************************

  // define this unit's variables that are to receive input values from other units
  let concIn = 0; // conc from upstream CSTR
  let feed = 0; // feed to first CSTR to calc this unit's conversion

  this.updateInputs = function() {
    concIn = processUnits[pUnitIndex - 1].conc; // upstream cstr conc to this unit
    feed = processUnits[0].conc; // feed unit 0 conc to calc this unit's conversion
  }

  // *******************************************
  //  define OUTPUT CONNECTIONS to other units
  // *******************************************

  this.conc = 0; // output conc inside this reactor to next reactor

  // *******************************************
  //        define PRIVATE properties
  // *******************************************

  // unitIndex may be used in this object's updateUIparams method
  const unitIndex = pUnitIndex; // index of this unit as child in parent object processUnits
  // allow this unit to take more than one step within one main loop step in updateState method
  const unitStepRepeats = 1;
  let unitTimeStep = simParams.simTimeStep / unitStepRepeats;
  let ssCheckSum = 0; // used in checkForSteadyState method

  let conversion = 0;
  // reaction rate will be obtained from object reactionRate in process_units.js
  let rxnRate = 0;
  let rateBranchOLD = 1; // 1 for high, 0 for low

  // *******************************************
  //         define PUBLIC properties
  // *******************************************

  this.name = 'process unit CSTR'; // used by interfacer.copyData()
  this.residenceTime = 100; // used by controller.checkForSteadyState()

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  //
  this.profileData = []; // for profile plots, plot script requires this name
  this.stripData = []; // for strip chart plots, plot script requires this name
  // this.colorCanvasData = []; // for color canvas, plot script requires this name

  // SPECIAL - THESE ARE NOT USED IN CSTR UNITS - NO DIRECT INPUTS FROM HTML
  // // define arrays to hold info for variables
  // // all used in interfacer.getInputValue() &/or interfacer.copyData() &/or plotInfo obj
  // // these will be filled with values in method initialize()
  // this.dataHeaders = []; // variable names
  // this.dataInputs = []; // input field ID's
  // this.dataUnits = [];
  // this.dataMin = [];
  // this.dataMax = [];
  // this.dataDefault = [];
  // this.dataValues = [];

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
    // SPECIAL - nothing needed for this unit
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table
    //
    // SPECIAL - not used this unit: this.VarCount = v;
    //
    // OPTIONAL - add entries for output variables if want to use min-max to
    //            constrain values in updateState or dimensional units in plotInfo
    //
  } // END initialize method

  this.reset = function() {
    //
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.

    this.updateUIparams(); // this first, then set other values as needed

    // set state variables not set by updateUIparams() to initial settings

    this.conc = 0;
    conversion = 0;

    // each unit has its own data arrays for plots and canvases

    // initialize strip chart data array
    // initPlotData(numStripVars,numStripPts)
    const numStripVars = 2; // conc, conversion
    const numStripPts = plotInfo[0]['numberPoints'];
    this.stripData = plotter.initPlotData(numStripVars,numStripPts);

    // initialize profile data array
    // initPlotData(numProfileVars,numProfilePts)
    // SPECIAL CASE - this will be points vs. feed conc so do not fill points
    const numProfileVars = 2; // conversion, rate
    const numProfilePts = 0; // 0+1 points will be filled here
    this.profileData = plotter.initPlotData(numProfileVars,numProfilePts);
    // SPECIAL CASE - move initial [0,0] x,y points off plots
    // order of 3 indices is var, point, x-y
    this.profileData[0][0][0] = -1;
    this.profileData[0][0][1] = -1;
    this.profileData[1][0][0] = -1;
    this.profileData[1][0][1] = -1;
    // update display
    this.updateDisplay();

  } // end reset

  this.updateUIparams = function() {
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();
    // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
    ssCheckSum = 1;

    // SPECIAL - no UI params for this unit

  } // END of updateUIparams()

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

    const Kflow = 0.014; // Kflow in Lab 2 = Q/Vp/k-1 = 0.04 in Lab 2
    // WARNING: Kflow value may be mentioned in HTML text
    const Vratio = 2; // Vratio in Lab 2 = Vp/Vc = 2 in Lab 2
    const eps = 0.3; // void fraction in pellet (catalyst layer)
    const alpha = 10; // surface-to-gas capacity ratio = 10 in Lab 2

    // check for SS on high branch at Kflow = 0.04 and cin = 0.5 appears to give
    // same results here in Rxr 1 as in Lab 2, where TOF rate = 8.061e-4 and
    // conv = 0.129 but should double check exact numbers
    // change feed conc from low conc ss up to 0.5 to get on high branch

    // this unit may take multiple steps within one outer main loop repeat step
    for (let i = 0; i < unitStepRepeats; i += 1) {
      let conc = this.conc;
      // rate is average d'less turnover frequency in catalyst layer (pellet)
      // here assumes catalyst at pseudo-steady-state whereas Lab 2 computed
      // cell and surface dynamics
      // get rate from reactionRate object defined in file process_units.js
      let rxnRateReturn = reactionRate.getRxnRate(conc,rateBranchOLD);
      rxnRate = rxnRateReturn[0];
      rateBranchOLD = rxnRateReturn[1];
      let dcdt = Kflow * Vratio * (concIn - conc) + rxnRate * eps * alpha * Vratio;
      let newConc = conc + dcdt * unitTimeStep;

      // for 0.001 conc increment in rate vs conc table
      // round toFixed(4) to get SS check to work at low conc, since currently
      // only define rate at 0.001 steps of conc and conc oscillates at
      // small conc when conc is computed with higher significant figures
      let newConcStr = newConc.toFixed(4); // toFixed returns string
      this.conc = Number(newConcStr);

    } // END OF for (let i = 0; i < unitStepRepeats; i += 1)

    if (feed > 0) {
      conversion = 1 - this.conc / feed;
    } else {
      conversion = 0;
    }
    if (conversion < 0) {
      conversion = 0;
    }
    if (conversion > 1) {
      conversion = 1;
    }

  } // END of updateState()

  this.updateDisplay = function() {
    // update display elements which only depend on this process unit
    // except do all plotting at main controller updateDisplay
    // since some plots may contain data from more than one process unit

    // SPECIAL - see profileData updates in checkForSteadyState()

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    let tempArray = [];
    const numStripPoints = plotInfo[0]['numberPoints'];
    const numStripVars = 2; // only the variables from this unit

    // handle reactor conc
    v = 0;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,this.conc] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // XXX not needed if do not show dynamic converison strip chart plot
    // XXX also at array initialization only need 1 var for conc
    // XXX and above here at numStripVars
    // handle conversion
    v = 1;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,conversion] );
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
    // here conc ranges from 0 to 1
    let rcs = 1.0e4 * concIn;
    let lcs = 1.0e4 * this.conc;
    rcs = rcs.toFixed(0); // string
    lcs = lcs.toFixed(0); // string
    let newCheckSum = rcs +'.'+ lcs; // concatenate strings, add +'.'+ if desire
    let oldSScheckSum = ssCheckSum;
    let ssFlag = false;
    if (newCheckSum == oldSScheckSum) {ssFlag = true;}
    ssCheckSum = newCheckSum; // save current value for use next time

    // SPECIAL - update profileData here and not in updateDisplay()
    if ((ssFlag == true) && (controller.ssStartTime == 0)) {
      // this unit at steady state && first time all units are at steady state
      // note ssStartTime will be changed != 0 after this check

      if (feed > 0) {
        // only add SS values when feed conc > 0

        // handle SS conversion
        v = 0;
        tempArray = this.profileData[v]; // work on one plot variable at a time
        if (tempArray[0][0] <= 0) {
          // shift deletes 1st [x,y] pair created on array initialization
          tempArray.shift();
        }
        // add the new [x,y] pair array at end
        // feed conc to first CSTR, this CSTR's conversion
        tempArray.push( [feed,conversion] );
        // update the variable being processed
        this.profileData[v] = tempArray;

        // handle SS rate
        //
        v = 1;
        tempArray = this.profileData[v]; // work on one plot variable at a time
        if (tempArray[0][0] <= 0) {
          // shift deletes 1st [x,y] pair created on array initialization
          tempArray.shift();
        }
        // add the new [x,y] pair array at end
        // feed conc to first CSTR, this CSTR's conversion
        let thisRate = -rxnRate;
        tempArray.push( [this.conc,thisRate] );
        // update the variable being processed
        this.profileData[v] = tempArray;

      } // END OF if (feed > 0)

    } // END OF if ((ssFlag == true) && (controller.ssStartTime == 0))

    return ssFlag;
  } // END OF checkForSteadyState()

} // END puCSTR
