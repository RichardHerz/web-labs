function puBioReactor(pUnitIndex) {
  // constructor function for process unit
  //
  // for other info shared with other units and objects, see public properties
  // and search for controller. & interfacer. & plotter. & simParams. & plotInfo

  // *****************************************
  //       define INPUT CONNECTIONS
  // *****************************************

  // define this unit's variables that are to receive input values from other units
  let flowRate = 0; // input flow rate from feed process unit
  let feedConc = 0; // input conc from feed process unit

  this.updateInputs = function() {
    flowRate = processUnits[0].flowRate;
    feedConc = processUnits[0].conc;
    // residence time used in controller.checkForSteadyState()
    this.residenceTime = 1 / flowRate; // volume fixed at 1 m3
  }

  // *******************************************
  //  define OUTPUT CONNECTIONS to other units
  // *******************************************

  // biomass in reactor, need > 0 initially or no growth
  this.biomass = 1; // output biomass to process unit puBioRxrController

  // *****************************************
  //        define PRIVATE properties
  // *****************************************

  // unitIndex may be used in this object's updateUIparams method
  const unitIndex = pUnitIndex; // index of this unit as child in parent object processUnits
  // allow this unit to take more than one step within one main loop step in updateState method
  const unitStepRepeats = 1;
  let unitTimeStep = simParams.simTimeStep / unitStepRepeats;
  let ssCheckSum = 0; // used in checkForSteadyState method

  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, see updateDisplay below
  const theDisplayReactorContentsID = "#div_PLOTDIV_reactorContents";

  // define additional internal variables
  let conc = 0; // substrate conc in reactor
  // rate parameters
  let muMax = 0;
  let ks = 0;
  let alpha = 0;
  let beta = 0;
  let gamma = 0;

  // *****************************************
  //         define PUBLIC properties
  // *****************************************

  this.name = 'process unit Bioreactor'; // used by interfacer.copyData()
  this.residenceTime = 0; // used by controller.checkForSteadyState()

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
  this.dataDefault = [];
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
    v = 0;
    this.dataHeaders[v] = 'muMax'; // Wu & Chang 2007, muMax = 0.3
    this.dataInputs[v] = 'input_field_enter_MUmax';
    this.dataUnits[v] = 'm3/kg/h'; // in Wu & Chang 2007 was 1/h
    this.dataMin[v] = 0.01;
    this.dataMax[v] = 10;
    this.dataDefault[v] = 0.3;
    //
    v = 1;
    this.dataHeaders[v] = 'ks';  // Wu & Chang 2007, ks = 1.75
    this.dataInputs[v] = 'input_field_enter_ks';
    this.dataUnits[v] = 'kg/m3';
    this.dataMin[v] = 0.01;
    this.dataMax[v] = 10;
    this.dataDefault[v] = 1.75;
    //
    v = 2;
    this.dataHeaders[v] = 'alpha';  // Wu & Chang 2007, alpha = 0.01
    this.dataInputs[v] = 'input_field_enter_alpha';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1;
    this.dataDefault[v] = 0.01;
    //
    v = 3;
    this.dataHeaders[v] = 'beta';  // Wu & Chang 2007, beta = 0.03
    this.dataInputs[v] = 'input_field_enter_beta';
    this.dataUnits[v] = 'm3/kg';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1;
    this.dataDefault[v] = 0.03;
    //
    v = 4;
    this.dataHeaders[v] = 'gamma'; // Wu & Chang 2007, gamma = 0.1
    this.dataInputs[v] = 'input_field_enter_gamma';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 2;
    this.dataDefault[v] = 0.5;
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
    v = 5;
    this.dataHeaders[v] = 'Biomass Conc';
    this.dataUnits[v] =  'kg/m3';
    this.dataMin[v] = 0;
    this.dataMax[v] = 30;
    //
    v = 6;
    this.dataHeaders[v] = 'Substrate Conc';
    this.dataUnits[v] =  'kg/m3';
    this.dataMin[v] = 0;
    this.dataMax[v] = 30;
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

    // need to directly set controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.ssFlag = false;

    // set to zero ssCheckSum used to check for steady state by this unit
    ssCheckSum = 0;

    this.biomass = 1.322; // biomass in reactor, need > 0 initially or no growth
    conc = 0.3;

    // each unit has its own data arrays for plots and canvases

    // initialize strip chart data array
    // initPlotData(numStripVars,numStripPts)
    const numStripVars = 2; // substrate conc, biomass conc in reactor
    const numStripPts = plotInfo[0]['numberPoints'];
    this.stripData = plotter.initPlotData(numStripVars,numStripPts);

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
    muMax = this.dataValues[0] = interfacer.getInputValue(unum, 0);
    ks = this.dataValues[1] = interfacer.getInputValue(unum, 1);
    alpha = this.dataValues[2] = interfacer.getInputValue(unum, 2);
    beta = this.dataValues[3] = interfacer.getInputValue(unum, 3);
    gamma = this.dataValues[4] = interfacer.getInputValue(unum, 4);

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

     // XXX equations from paper but does NOT seem dimensionlly consistent...
     // XXX only dimensionally consistent if units of MUmax are m3/kg/h not 1/h....
    let rxrVolume = 1; // (m3)
    let G = muMax * conc / (ks + conc); // biomass growth rate

    let Y = (alpha + beta * conc); // partial yield function
    Y = Math.pow(Y,gamma); // complete yield function
    let D = flowRate / rxrVolume; // dilution rate = space velocity

    // console.log('RXR updateState, flowRate = '+flowRate);

    let dCdt = D * (feedConc - conc) - (G / Y) * this.biomass;
    let dC = unitTimeStep * dCdt;
    let newConc = conc + dC;

    let dBdt = (G - D) * this.biomass;
    let dB = unitTimeStep * dBdt;
    let newBiomass = this.biomass + dB;

    if (newConc < 0){newConc = 0;}
    if (newBiomass < 0){newBiomass = 0;}

    conc = newConc;
    this.biomass = newBiomass;

  } // END of updateState() method

  this.updateDisplay = function() {
    // update display elements which only depend on this process unit
    // except do all plotting at main controller updateDisplay
    // since some plots may contain data from more than one process unit

    let el = document.querySelector(theDisplayReactorContentsID);

    const colorMax = 240;
    const biomassMax = this.dataMax[5];
    let cValue = Math.round((this.biomass)/biomassMax * colorMax);
    let concR = colorMax - cValue;
    let concG = colorMax;
    let concB = colorMax - cValue;;

    let concColor = "rgb(" + concR + ", " + concG + ", " + concB + ")";
    // "background-color" in index.css did not work
    el.style.backgroundColor = concColor;

    // console.log('updateDisplay, el.style.backgroundColor = ' + el.style.backgroundColor);

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    let tempArray = [];
    let numStripPoints = plotInfo[0]['numberPoints'];
    let numStripVars = 2; // only the variables from this unit

    // handle biomass
    v = 0;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,this.biomass] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // handle conc
    v = 1;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,conc] );
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
    // use conc at oldest time on plot in check
    // as well as current conc in crt check
    // in order to help ensure strip plot update doesn't stop unless plot flat
    // AND use width of strip plot for residence time in updateInputs
    // BUT NOT foolproof, e.g., with
    // 1 K up then down changes at certain times
    //
    // multiply all numbers by a factor to get desired number significant
    // figures to left decimal point so toFixed() does not return string "0.###"
    // WARNING: too many sig figs will prevent detecting steady state
    //
    let unum = unitIndex;
    let rc = 1.0e2 * this.stripData[unum][0][1]; // oldest biomass conc in rxr conc plot
    let rt = 1.0e2 * this.biomass;
    let lc = 1.0e2 * this.stripData[unum][1][1]; // oldest substrate conc in rxr conc plot
    let lt = 1.0e2 * conc;
    rc = rc.toFixed(0); // strings
    rt = rt.toFixed(0);
    lc = lc.toFixed(0);
    lt = lt.toFixed(0);
    // concatenate strings
    let newCheckSum = rc +'.'+ rt +'.'+ lt +'.'+ lc;
    //
    let oldSScheckSum = ssCheckSum;
    let ssFlag = false;
    if (newCheckSum == oldSScheckSum) {ssFlag = true;}
    ssCheckSum = newCheckSum; // save current value for use next time

    // console.log('simTime = ' + controller.simTime);
    // console.log('  oldSScheckSum = ' + oldSScheckSum);
    // console.log('    newCheckSum = ' + newCheckSum + ', ssFlag = ' + ssFlag);

    return ssFlag;
  } // END checkForSteadyState method

} // END of puBioReactor
