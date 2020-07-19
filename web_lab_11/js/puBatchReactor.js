/*
  Design, text, images and code by Richard K. Herz, 2017-2020
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

let puBatchReactor = {
  unitIndex : 0, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'Batch Reactor',

  // for other info shared with other units and objects, see public properties
  // and search for controller. & interfacer. & plotter. & simParams. & plotInfo

  // *******************************************
  //  define INPUT CONNECTIONS from other units
  // *******************************************

  // SPECIAL - none for this unit
  updateInputs : function() {}, // required, called by main controller object

  // *******************************************
  //  define OUTPUT CONNECTIONS to other units
  // *******************************************

    // SPECIAL - none for this unit

  // *******************************************

  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS, see updateUIparams below
  // SEE dataInputs array in initialize() method for input field ID's

  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, used in updateDisplay() method
  cA_output_field_ID : "field_cA_final",
  conversion_output_field_ID  : "field_conversion_final",
  displayReactorContents: '#div_PLOTDIV_reactorContents', // need # because selecting CSS

  // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***
  // ***   EXCEPT TO HTML ID'S IN method initialize(), array dataInputs    ***

  // define main inputs
  // values will be set in method initialize() calling method updateUIparams()
  Tin : 0, // Temperature
  cAin : 1, // initial reactant concentration
  cA_final : 1, // final reactant concentration
  Vol : 0, // volume of reactor contents
  t_final : 0,
  k_300 : 0, // forward rate constant at 300 K
  Ea : 0, // activation energy
  nth : 0, // reaction order (-1, 0, 1, 2)

  // define arrays to hold info for variables
  // these will be filled with values below in method initialize()
  dataHeaders : [], // variable names for display - may differ from internal names
  dataInputs : [], // input field ID's
  dataUnits : [],
  dataMin : [],
  dataMax : [],
  dataDefault : [],
  dataValues : [],

  // define arrays to hold output variables
  // these will be filled with initial values in method reset()
  cA : [],
  time : [],

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  profileData : [], // for profile plots, plot script requires this name

  // define variables which will not be plotted nor saved in copy data table
  //   none here

  // WARNING: numNodes is accessed in process_plot_info.js
  numPlotPoints : 200, // THIS IS REALLY PLOT POINTS FOR PROFILE & STRIP PLOTS

  initialize : function() {
    //
    let v = 0;
    this.dataHeaders[v] = 'k_300';
    this.dataInputs[v] = 'input_field_RateConstant';
    this.dataUnits[v] = '(units depend on order)';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1000;
    this.dataDefault[v] = 1.0e-7;
    //
    v = 1;
    this.dataHeaders[v] = 'Ea';
    this.dataInputs[v] = 'input_field_ActivationEnergy';
    this.dataUnits[v] = 'kJ/mol';
    this.dataMin[v] = 0;
    this.dataMax[v] = 200;
    this.dataDefault[v] = 100;
    //
    v = 2;
    this.dataHeaders[v] = 'Reaction Order';
    this.dataInputs[v] = 'input_field_ReactionOrder';
    this.dataUnits[v] = '';
    this.dataMin[v] = -1;
    this.dataMax[v] = 2;
    this.dataDefault[v] = 1;
    //
    v = 3;
    this.dataHeaders[v] = 'Temperature';
    this.dataInputs[v] = 'input_field_Temperature';
    this.dataUnits[v] = 'K';
    this.dataMin[v] = 50;
    this.dataMax[v] = 500;
    this.dataDefault[v] = 300;
    //
    v = 4;
    this.dataHeaders[v] = 'cA_init';
    this.dataInputs[v] = 'input_field_Concentration';
    this.dataUnits[v] = 'mol/m3';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1000;
    this.dataDefault[v] = 500;
    //
    v = 5;
    this.dataHeaders[v] = 'Volume';
    this.dataInputs[v] = 'input_field_Volume';
    this.dataUnits[v] = 'm3';
    this.dataMin[v] = 0;
    this.dataMax[v] = 10000;
    this.dataDefault[v] = 4.0e-3;
    //
    v = 6;
    this.dataHeaders[v] = 't_final';
    this.dataInputs[v] = 'input_field_ReactionTime';
    this.dataUnits[v] = 's';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1000;
    this.dataDefault[v] = 100;
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table in _plotter.js
    this.VarCount = v;
    //
    // OUTPUT VARS
    //
    v = 7;
    this.dataHeaders[v] = 'cA_final';
    this.dataUnits[v] =  'mol/m3';
    this.dataMin[v] = 0;
    this.dataMax[v] = this.dataMax[4]; // [4] is cA_init
    //
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

    for (k = 0; k <= this.numNodes; k += 1) {
      this.cA[k] = this.cAin;
    }

    // initialize profile data array
    // plotter.initPlotData(numProfileVars,numProfilePts)
    this.profileData = plotter.initPlotData(1,this.numPlotPoints); // holds data for static profile plots

    // // initialize strip chart data array
    // // plotter.initPlotData(numStripVars,numStripPts)
    // this.stripData = plotter.initPlotData(numStripVars,numStripPts); // holds data for scrolling strip chart plots

    // // initialize local array to hold color-canvas data, e.g., space-time data -
    // // plotter.initColorCanvasArray(numVars,numXpts,numYpts)
    // this.colorCanvasData = plotter.initColorCanvasArray(2,this.numNodes,1);

    let kn;
    for (k = 0; k <= this.numPlotPoints; k += 1) {
      kn = k;
      // x-axis values
      // x-axis values will not change during sim
      // XXX change to get number vars for this plotInfo variable
      //     so can put in repeat - or better yet, a function
      //     and same for y-axis below
      // first index specifies which variable
      this.profileData[0][k][0] = kn;
      // y-axis values
      this.profileData[0][k][1] = 0; // this.dataDefault[4]; // [4] is cAin
    }

  }, // end reset

  updateUIparams : function() {
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // // need to reset controller.ssFlag to false to get sim to run
    // // after change in UI params when previously at steady state
    // controller.resetSSflagsFalse();

    // check input fields for new values
    // function getInputValue() is defined in file process_interfacer.js
    // getInputValue(unit # in processUnits object, variable # in dataInputs array)
    // see variable numbers above in initialize()
    // note: this.dataValues.[pVar]
    //   is only used in copyData() to report input values
    //
    let unum = this.unitIndex;
    //
    this.k_300 = this.dataValues[0] = interfacer.getInputValue(unum, 0);
    this.Ea = this.dataValues[1] = interfacer.getInputValue(unum, 1);
    this.nth = this.dataValues[2] = interfacer.getInputValue(unum, 2);
    this.Tin = this.dataValues[3] = interfacer.getInputValue(unum, 3);
    this.cAin = this.dataValues[4] = interfacer.getInputValue(unum, 4);
    this.Vol= this.dataValues[5] = interfacer.getInputValue(unum, 5);
    this.t_final = this.dataValues[6] = interfacer.getInputValue(unum, 6);

    // ensure order nth has values -1,0,1,2
    let x = Math.round(this.nth);
    if (x < -1) {
      x = -1;
    } else if (x > 2) {
      x = 2;
    }
    this.nth = x;
    document.getElementById(this.dataInputs[2]).value = this.nth;

    // // adjust axis of profile plot
    plotter['plotArrays']['plotFlag'][0] = 0;  // so axes will refresh
    plotInfo[0]['xAxisMax'] = this.t_final;

    // plotInfo[0]['yLeftAxisMin'] = this.dataMin[9]; // [9] is Trxr
    // plotInfo[0]['yLeftAxisMax'] = this.dataMax[9];
    // plotInfo[0]['yRightAxisMin'] = 0;
    // plotInfo[0]['yRightAxisMax'] = this.cAin;
    // // adjust color span of spaceTime, color canvas plots
    // plotInfo[1]['varValueMin'] = this.dataMin[9]; // [9] is Trxr
    // plotInfo[1]['varValueMax'] = this.dataMax[9];
    // plotInfo[2]['varValueMin'] = this.dataMin[9];
    // plotInfo[2]['varValueMax'] = this.dataMax[9];

    // // also update ONLY inlet values at inlet of reactor in case sim is paused
    // // but do not do full updateDisplay
    // document.getElementById(this.displayReactorLeftT).innerHTML = this.Tin.toFixed(1) + ' K';
    // document.getElementById(this.displayReactorLeftConc).innerHTML = this.cAin.toFixed(1);

    // // residence time used for timing checks for steady state
    // // use this for now but should consider voidFrac and Cp's...
    // this.residenceTime = this.Wcat / this.densCat / this.Flowrate;

    // // UPDATE UNIT TIME STEP AND UNIT REPEATS
    //
    // // FIRST, compute spaceTime = residence time between two nodes in hot tube, also
    // //                          = space time of equivalent single mixing cell
    // let spaceTime = (Length / this.numNodes) / VelocHot; // (s)
    //
    // // SECOND, estimate unitTimeStep
    // // do NOT change simParams.simTimeStep here
    // this.unitTimeStep = spaceTime / 15;
    //
    // // THIRD, get integer number of unitStepRepeats
    // this.unitStepRepeats = Math.round(simParams.simTimeStep / this.unitTimeStep);
    // // min value of unitStepRepeats is 1 or get divide by zero error
    // if (this.unitStepRepeats <= 0) {this.unitStepRepeats = 1;}
    //
    // // FOURTH and finally, recompute unitTimeStep with integer number unitStepRepeats
    // this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

  }, // end of updateUIparams()

  updateState : function() {
    //
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE
    //
    // WARNING: this method must NOT contain references to other units!
    //          get info from other units ONLY in updateInputs() method
    //

    let Rg = 8.31446e-3; // (kJ/K/mol), ideal gas constant
    let EaOverRg = this.Ea / Rg;

    // this reactor is ISOTHERMAL so only need to compute k at reaction T once
    kT = this.k_300 * Math.exp(EaOverRg/300 - EaOverRg/this.Tin);

    // plot will have numPlotPoints + 1 points - see process_plot_info.js
    for (j=0; j<=this.numPlotPoints; j+=1) {
      this.time[j] =  this.t_final * j/this.numPlotPoints;
      this.cA[j] = this.reactBATCHnthSS(this.time[j],kT,this.nth,this.cAin);
    }

    this.cA_final = this.cA[this.numPlotPoints];

    // change cA final output field to visible only after 1st run
    document.getElementById(this.cA_output_field_ID).style.visibility = 'visible';

    // change conversion final output field to visible only after 1st run
    document.getElementById(this.conversion_output_field_ID).style.visibility = 'visible';

  }, // end updateState method

  updateDisplay : function() {

    // note use .toFixed(n) method of object to round number to n decimal points
    let txt = 'cA final (mol/m<sup>3</sup>) = ' + this.cA_final.toFixed(1);
    document.getElementById(this.cA_output_field_ID).innerHTML = txt;

    // note use .toFixed(n) method of object to round number to n decimal points
    let conversion_final = 100 * (1 - this.cA_final / this.cAin);
    txt = 'Conversion final (%) = ' + conversion_final.toFixed(1);
    document.getElementById(this.conversion_output_field_ID).innerHTML = txt;

    // WARNING: must have simParams vars imTimeStep = 1 and simStepRepeats = 1
    // for simtime to equal # runs between resets
    document.getElementById("field_run_count").innerHTML = "Total runs = " + controller.simTime.toFixed(0);

    // set reactor contents color to final color
    let el = document.querySelector(this.displayReactorContents);
    // el.style.backgroundColor = "rgb(0,0,255)";
    // compute color for this reactantConc
    let cafinal = this.cA_final;
    if (controller.simTime == 0) {cafinal = this.cAin;}
    let B = Math.round(255 * cafinal / this.cAin); // Blue = reactant
    let R = 255 - B; // Red = product
    let colorString = "rgb(" + R + ", 0, " + B + ")";
    // set color for this reactantConc
    el.style.backgroundColor = colorString; // backgroundColor NOT background-color

    // HANDLE PROFILE PLOT DATA

    // XXX CONSIDER RE-ORDERING LAST TWO INDEXES IN profileData SO CAN USE
    //     SIMPLE ASSIGNMENT FOR ALL Y VALUES, e.g.,
    // profileData[0][1][n] = y;

    // set x-axis max on plot
    plotInfo[0]['xAxisMax'] = this.t_final;

    // fill array for profile plot
    for (j=0; j<=this.numPlotPoints; j+=1) {
      this.profileData[0][j][0] = this.time[j];
      this.profileData[0][j][1] = this.cA[j];
    }

  }, // end updateDisplay method

  checkForSteadyState : function() {
    let ssFlag = false;
    return ssFlag;
  }, // END checkForSteadyState method

  reactBATCHnthSS : function(t,k,n,cAin) {
    // returns conc at time t
    let cA;
    switch(n) {
      case -1:
        let x = ( Math.pow(cAin,2) - 2 * k * t );
        if (x > 0) {
          cA = Math.sqrt(x);
        } else {
          cA = 0;
        }
        break;
      case 0:
        cA = (cAin - k * t);
        if (cA < 0) {cA = 0};
        break;
      case 1:
        cA = cAin * Math.exp(-k * t);
        break;
      case 2:
        cA = cAin / (1 + cAin * k * t);
        break;
      default:
        cA = cAin;
    }
    return cA
  } // END reactBATCHnthSS method

}; // END puBatchReactor object
