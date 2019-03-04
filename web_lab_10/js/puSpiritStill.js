function puSpiritStill(pUnitIndex) {
  // constructor function for process unit
  //
  // for other info shared with other units and objects, see public properties
  // and search for controller. & interfacer. & plotter. & simParams. & plotInfo

  // *****************************************
  //       define INPUT CONNECTIONS
  // *****************************************

  // define this unit's variables that are to receive input values from other units
  // let flowRate = 0; // input flow rate from feed process unit

  this.updateInputs = function() {
    // flowRate = processUnits[0].flowRate;
  }

  // *******************************************
  //  define OUTPUT CONNECTIONS to other units
  // *******************************************

  // this.biomass = 1; // output biomass to process unit puBioRxrController

  // *****************************************
  //        define PRIVATE properties
  // *****************************************

  // unitIndex may be used in this object's updateUIparams method
  const unitIndex = pUnitIndex; // index of this unit as child in parent object processUnits
  // allow this unit to take more than one step within one main loop step in updateState method
  const unitStepRepeats = 1;
  let unitTimeStep = simParams.simTimeStep / unitStepRepeats;
  let ssCheckSum = 0; // used in checkForSteadyState method

  // CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS
  // **** currently use these but also see IDs in initialize method, where
  // **** they are not currently used - which is best?
  const thisSteamSliderID = 'range_steamSlider';
  const thisSteamFieldID = 'input_field_enterSteam';
  const thisProductPercentFieldID = 'field_productPercent';

  // define additional internal variables
  let x = 0; // ethanol molar conc in pot liquid
  const x0 = 0.12; // initial ethanol molar conc in feed to pot, see in reset()
  let y = 0; // ethanol molar conc in pot vapor
  let y2 = 0; // ethanol molar conc in neck vapor
  let x2 = 0; // ethanol molar conc in recycled neck liquid
  let refluxRatio = 0.25;
  const m0 = 100; // (mol), initial total moles liquid charged to pot
  let m = m0; // (mol), total moles liquid in pot
  let vol0 = 0; // can't call equi.getVol() yet, do in reset
  let vrate = 0; // (mol/s), vapor product flow rate from neck
  let pT = 0; // (deg C), pot temperature
  let nT = 0; // (deg C), neck temperature

  // *****************************************
  //         define PUBLIC properties
  // *****************************************

  this.name = 'process unit Spirit Still'; // used by interfacer.copyData()
  this.residenceTime = 0; // used by controller.checkForSteadyState()

  this.steam = 0;

  // define arrays to hold data for plots, color canvas
  // these arrays will be used by plotter object
  // these will be filled with initial values in method reset
  //
  // this.profileData = []; // for profile plots, plot script requires this name
  this.stripData = []; // for strip chart plots, plot script requires this name
  // this.colorCanvasData = []; // for color canvas, plot script requires this name

  // define arrays to hold info for variables
  // all used in interfacer.getInputValue() &/or interfacer.copyData() &/or plotInfo obj
  // these will be filled with values in method initialize
  this.dataHeaders = []; // variable names
  this.dataInputs = []; // HTML field ID's of input parameters
  this.dataUnits = [];
  this.dataMin = [];
  this.dataMax = [];
  this.dataInitial = [];
  this.dataValues = [];

  // *****************************************
  //         define PRIVATE functions
  // *****************************************

  // *****************************************
  //        define PRIVILEGED methods
  // ******************************************

  this.initialize = function() {
    //
    // ADD ENTRIES FOR UI PARAMETER INPUTS FIRST, then output vars below
    //
    let v = 0;
    this.dataHeaders[v] = 'Steam';
    this.dataInputs[v] = 'range_steamSlider'; // id of input
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 100;
    this.dataInitial[v] = 0;
    this.steam = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.steam; // current input oalue for reporting
    //
    v = 1;
    this.dataHeaders[v] = 'Steam';
    this.dataInputs[v] = 'input_field_enterSteam';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 100;
    this.dataInitial[v] = 0;
    this.steam = this.dataInitial[v]; // dataInitial used in getInputValue()
    this.dataValues[v] = this.steam; // current input oalue for reporting
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
    // v = 2;
    // this.dataHeaders[v] = 'Biomass Conc';
    // this.dataUnits[v] =  'kg/m3';
    // this.dataMin[v] = 0;
    // this.dataMax[v] = 30;
    //
  } // END of initialize()

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

    // each unit has its own data arrays for plots and canvases

    // initialize strip chart data array
    // initPlotData(numStripVars,numStripPts)
    const numStripVars = 6; // m/m0, x, y, y2, pT, nT
    const numStripPts = plotInfo[0]['numberPoints'];
    this.stripData = plotter.initPlotData(numStripVars,numStripPts);

    if (document.getElementById(thisSteamSliderID)) {
      document.getElementById(thisSteamSliderID).value = this.dataInitial[0];
    }
    if (document.getElementById(thisSteamFieldID)) {
      document.getElementById(thisSteamFieldID).value = this.dataInitial[1];
    }

    m = m0; // initial total moles charged to pot, m0 set above
    x = x0; // initial mole fraction ethanol charged to pot
    vol0 = equil.getVol(m,x); // (liters), volume liquid in pot
    y = equil.getY(x);
    x2 = equil.getX2(y,refluxRatio);
    y2 = equil.getY(x2);
    pT = equil.getT(x);
    nT = equil.getT(x2);

    // update display
    this.updateDisplay();

  } // END of reset() method

  this.updateUIparams = function() {
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // need to reset controller.ssFlag to false to get sim to run
     // after change in UI params when previously at steady state
     controller.resetSSflagsFalse();
     // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
     ssCheckSum = 1;

    // function getInputValue() is defined in file process_interfacer.js
    // getInputValue(unit # in processUnits object, variable # in dataInputs array)
    // see variable numbers above in initialize()
    // note: this.dataValues.[pVar]
    //   is only used in copyData() to report input values
    //
    let unum = unitIndex;
    //
    // muMax = this.dataValues[0] = interfacer.getInputValue(unum, 0);

    this.updateUIsteamInput();

  } // END of updateUIparams() method

  this.updateUIsteamInput = function() {
    // SPECIAL FOR THIS UNIT
    // called in HTML input element so must be a publc method
    let unum = unitIndex;
    this.steam = this.dataValues[1] = interfacer.getInputValue(unum, 1);
    // alert('inputfield: this.steam = ' + this.steam);
    // update position of the range slider
    if (document.getElementById(thisSteamSliderID)) {
      document.getElementById(thisSteamSliderID).value = this.steam;
    }
    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();
    // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
    ssCheckSum = 1;
  }, // END method updateUIfeedInput()

  this.updateUIsteamSlider = function() {
    // SPECIAL FOR THIS UNIT
    // called in HTML input element so must be a publc method
    let unum = unitIndex;
    this.steam = this.dataValues[0] = interfacer.getInputValue(unum, 0);
    // update input field display
    // alert('slider: this.steam = ' + this.steam);
    if (document.getElementById(thisSteamFieldID)) {
      document.getElementById(thisSteamFieldID).value = this.steam;
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
    //
    // check for change in overall main time step simTimeStep
    unitTimeStep = simParams.simTimeStep / unitStepRepeats;

    // see reset method for initialization of values
    vrate = 0.001 * this.steam;
    let j = 0; // index
    let dxdt = 0;
    let dmdt = 0;

    for (j = 0; j < unitStepRepeats; j++) {
      if (m > 0) {
        // xxx m * dx/dt = - vrate * y2 ?????
        // xxx rate change mol in pot = rate mol leaving...?
        // xxx check vrate definition
        dxdt = -vrate * y2 / m;
        // WAS dxdt = (vrate / m) * (x - y2);
        dmdt = -vrate;
        x = x + dxdt * unitTimeStep;
        m = m + dmdt * unitTimeStep;
        // update variables for new x
        y = equil.getY(x);
        x2 = equil.getX2(y,refluxRatio);
        y2 = equil.getY(x2);
        pT = equil.getT(x);
        nT = equil.getT(x2);
      }
    }

  } // END of updateState() method

  this.updateDisplay = function() {
    // update display elements which only depend on this process unit
    // except do all plotting at main controller updateDisplay
    // since some plots may contain data from more than one process unit

    // display ABV of vapor product
    let abv = equil.getABV(y2).toFixed(1);
    document.getElementById(thisProductPercentFieldID).innerHTML = abv;

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    let tempArray = [];
    let numStripPoints = plotInfo[0]['numberPoints'];
    let numStripVars = 6; // only the variables from this unit

    // // handle m/m0
    // v = 0;
    // tempArray = this.stripData[v]; // work on one plot variable at a time
    // // delete first and oldest element which is an [x,y] pair array
    // tempArray.shift();
    // // add the new [x.y] pair array at end
    // tempArray.push( [0,m/m0] );
    // // update the variable being processed
    // this.stripData[v] = tempArray;

    // handle vol/vol0
    v = 0;
    let vol = equil.getVol(m,x);
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,vol/vol0] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // handle x
    v = 1;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,x] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // handle y
    v = 2;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,y] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // handle y2
    v = 3;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,y2] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // handle pT
    v = 4;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,pT] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // handle nT
    v = 5;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,nT] );
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
    let ssFlag = false;
    return ssFlag;
  } // END checkForSteadyState method

} // END of puSpiritStill
