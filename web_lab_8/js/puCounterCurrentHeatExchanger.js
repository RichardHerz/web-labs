/*
  Design, text, images and code by Richard K. Herz, 2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// ------------ PROCESS UNIT OBJECT DEFINITIONS ----------------------

// EACH PROCESS UNIT DEFINITION MUST CONTAIN AT LEAST THESE 7 FUNCTIONS:
//  initialize, reset, updateUIparams, updateInputs, updateState,
//  updateDisplay, checkForSteadyState
// THESE FUNCTION DEFINITIONS MAY BE EMPTY BUT MUST BE PRESENT
//
// EACH PROCESS UNIT DEFINITION MUST DEFINE the variable residenceTime

// -------------------------------------------------------------------

let puCounterCurrentHeatExchanger = {
  unitIndex : 0, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'Counter-Current Heat Exchanger',

  //  SUMMARY OF DEPENDENCIES
  //
  //  THIS OBJECT HAS MULTIPLE I/O CONNECTIONS TO HTML
  //
  //  USES FROM OBJECT simParams the following:
  //    GETS simParams.simTimeStep
  //  OBJECT controller USES FROM THIS OBJECT:
  //    variable residenceTime
  //  OBJECT plotInfo USES FROM THIS OBJECT:
  //    numNodes, and possibly others
  //  USES FROM OBJECT puAdiabaticPackedBedPFR, here as processUnits[0], the following:
  //    numNodes, residenceTime, Trxr[]
  //    reactor outlet T is heat exchanger hot inlet T
  //  OBJECT puAdiabaticPackedBedPFR, here as processUnits[0],
  //    USES FROM THIS UNIT:
  //      Tcold[] - heat exchanger cold outlet T is reactor inlet T
  //  CALLS TO FUNCTIONS HERE ARE SENT BY THE FOLLOWING EXTERNAL FUNCTIONS:
  //    initialize() sent by openThisLab() in object controller
  //    reset() sent by resetThisLab() in object controller
  //    updateInputs() & updateState() sent by updateProcessUnits() in object controller
  //    updateDisplay() sent by updateDisplay() in object controller
  //    updateUIparams() sent by updateUIparams() in object controller
  //    checkForSteadyState() sent by checkForSteadyState() in object controller
  //  THE FOLLOWING EXTERNAL FUNCTIONS USE VALUES FROM THIS OBJECT:
  //    copyData() in object interfacer uses name, varCount, dataHeaders[],
  //        dataUnits[], dataValues[], profileData[], stripData[]
  //    getInputValue() in object interfacer uses dataInputs[], dataInitial[],
  //        dataMin[], dataMax[]
  //    getPlotData() in object plotFlot uses profileData[], stripData[]
  //    plotColorCanvasPlot() in object plotter uses colorCanvasData[]

  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, used in updateInputs() method
  //
  // define inputs array, which is processed in this unit's updateInputs method
  // where sourceVarNameString is name of a public var in source unit without 'this.'
  // where thisUnitVarNameString is variable name in this unit, and to be, e.g.,
  //        'privateVarName' for private var, and
  //        'this.publicVarName' for public var
  // inputs[i] = [sourceUnitIndexNumber,sourceVarNameString,thisUnitVarNameString]
  inputs : [
    [0,'Tout','this.TinHot'],
    [0,'residenceTime','this.residenceTime']
  ],

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
  ToutCold : 0,
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
    this.dataInitial[v] = 340;
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
    //
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.

    this.updateUIparams(); // this first, then set other values as needed

    // set state variables not set by updateUIparams() to initial settings

    // this.dataMin[1] is, e.g., 320
    // this.dataInitial[1] is, e.g., 340
    this.TinCold = this.dataInitial[1]; // bottom left of HX
    this.TinHot = this.dataMin[1]; // top right of HX
    this.ToutCold = this.dataMin[1]; // btm right of HX output to RXR inlet

    this.FlowHot = this.Flowrate; // input field is (m3/s)
    // *** input field reactor flow is m3/s, whereas heat exchanger flow is kg/s ***
    this.FlowHot = this.FluidDensity * this.FlowHot; // (kg/s) = kg/m3 * m3/s
    this.FlowCold = this.FlowHot;

    // initialize profile data array
    // initPlotData(numProfileVars,numProfilePts)
    this.profileData = plotter.initPlotData(2,this.numNodes); // holds data for static profile plots

    // // initialize strip chart data array
    // // initPlotData(numStripVars,numStripPts)
    let numStripVars = 4; // the 4 end T's of the heat exchanger
    let numStripPts = plotInfo[5]['numberPoints'];
    this.stripData = plotter.initPlotData(numStripVars,numStripPts); // holds data for scrolling strip chart plots

    // initialize local array to hold color-canvas data, e.g., space-time data -
    // plotter.initColorCanvasArray(numVars,numXpts,numYpts)
    this.colorCanvasData = plotter.initColorCanvasArray(2,this.numNodes,1);

    // this.dataMin[1] is, e.g., 320
    // this.dataInitial[1] is, e.g., 340
    for (k = 0; k <= this.numNodes; k += 1) {
      this.Thot[k] = this.dataMin[1];
      this.Tcold[k] = this.dataMin[1];
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
      // this.dataMin[1] is, e.g., 320
      // this.dataInitial[1] is, e.g., 340
      this.profileData[0][k][1] = this.dataMin[1];
      this.profileData[1][k][1] = this.dataMin[1];
    }

    let timeStep = simParams.simTimeStep * simParams.simStepRepeats;
    for (k=0; k<=numStripPts; k+=1) {
      // x-axis values
      // x-axis values will not change during sim
      // XXX change to get number vars for this array
      //     so can put in repeat - or better yet, a function
      //     and same for y-axis below
      // first index specifies which variable
      this.stripData[0][k][0] = k * timeStep;
      this.stripData[1][k][0] = k * timeStep;
      this.stripData[2][k][0] = k * timeStep;
      this.stripData[3][k][0] = k * timeStep;
      // y-axis values
      // this.dataMin[1] is, e.g., 320
      // this.dataInitial[1] is, e.g., 340
      this.stripData[0][k][1] = this.dataMin[1];
      this.stripData[1][k][1] = this.dataMin[1];
      this.stripData[2][k][1] = this.dataMin[1];
      this.stripData[3][k][1] = this.dataMin[1];
    }

     // update display
    this.updateDisplay();

  }, // end reset

  updateUIparams : function() {
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();
    // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
    this.ssCheckSum = 1;

    // check input fields for new values
    // function getInputValue() is defined in file process_interfacer.js
    // getInputValue(unit # in processUnits object, variable # in dataInputs array)
    // see variable numbers above in initialize()
    // note: processUnits[pUnitIndex]['dataValues'][pVar]
    //   is only used in copyData() to report input values
    //
    let unum = this.unitIndex;
    //
    this.Flowrate = this.dataValues[0] = interfacer.getInputValue(unum, 0);
    this.Tin = this.dataValues[1] = interfacer.getInputValue(unum, 1);
    this.UAcoef = this.dataValues[2] = interfacer.getInputValue(unum, 2);

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
    // GET INPUT CONNECTION VALUES FROM OTHER PROCESS UNITS
    // SPECIFY REFERENCES TO INPUTS ABOVE WHERE DEFINE inputs[] ARRAY
    //
    for (let i = 0; i < this.inputs.length; i++) {
      let sourceValue = processUnits[this.inputs[i][0]][this.inputs[i][1]]; // string
      let thisVar = this.inputs[i][2]; // string
      eval(thisVar + ' = ' + sourceValue);
    }

    // check for change in overall main time step simTimeStep
    this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

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
    for (i = 0; i < this.unitStepRepeats; i++) {

      // do node at hot inlet end
      n = 0;

      ThotNew[0] = this.TinHot;
      TcoldNew[0] = this.Tcold[1];

      // internal nodes
      for (n = 1; n < this.numNodes; n++) {

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

    this.ToutCold = this.Tcold[0]; // to use as inlet T to reactor

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

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    let numStripPoints = plotInfo[5]['numberPoints'];
    let numStripVars = 4; // only the variables from this unit
    let nn = this.numNodes;

    // handle System Inlet T
    v = 0;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [ 0, this.Tcold[nn] ] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // handle Reactor Inlet T
    v = 1;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [ 0, this.Tcold[0] ] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // handle Reactor Outlet T
    v = 2;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [ 0, this.Thot[0] ] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // handle System Outlet T
    v = 3;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [ 0, this.Thot[nn] ] );
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
    // here use HX end T's to check for SS
    // found need 2 * residenceTime to reach SS
    // when starting up at system T in = 350 K
    // and now HX res time arbitrarily set to = RXR res time
    //
    // multiply all numbers by a factor to get desired number significant
    // figures to left decimal point so toFixed() does not return string "0.###"
    // WARNING: too many sig figs will prevent detecting steady state
    //
    let nn = this.numNodes;
    let hlt = 1.0e1 * this.Thot[nn];
    let hrt = 1.0e1 * this.Thot[0];
    let clt = 1.0e1 * this.Tcold[nn];
    let crt = 1.0e1 * this.Tcold[0];
    hlt = hlt.toFixed(0); // string
    hrt = hrt.toFixed(0);
    clt = clt.toFixed(0);
    crt = crt.toFixed(0);
    // concatenate strings
    let newCheckSum = hlt +'.'+ hrt +'.'+ clt  +'.'+ crt;
    let oldSScheckSum = this.ssCheckSum;
    // console.log('OLD CHECKSUM = ' + oldSScheckSum);
    // console.log('NEW CHECKSUM = ' + newCheckSum);
    let ssFlag = false;
    if (newCheckSum == oldSScheckSum) {ssFlag = true;}
    this.ssCheckSum = newCheckSum; // save current value for use next time
    return ssFlag;
  } // END checkForSteadyState method

} // END let puHeatExchanger
