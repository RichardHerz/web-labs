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

let puBatchReactorNthOrder = {
  unitIndex : 0, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'Batch Reactor - nth order reaction',

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
  cA_output_field_ID_profile : "field_cA_final_profile",
  conversion_output_field_ID_profile  : "field_conversion_final_profile",
  old_data_notice_ID_profile : "field_old_data_notice_profile",
  old_data_notice_ID_single : "field_old_data_notice_single",
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
  conversion : 0,
  runCount : 0,

  // define arrays to hold info for variables
  // these will be filled with values below in method initialize()
  dataHeaders : [], // variable names for display - may differ from internal names
  dataInputs : [], // input field ID's
  dataUnits : [],
  dataMin : [],
  dataMax : [],
  dataDefault : [],
  dataValues : [],

  // SPECIAL FOR PLOT TYPE SINGLE
  dataValuesORIG : [],

  // define arrays to hold output variables for profile plot
  // these will be filled with initial values in method reset()
  cA : [],
  time : [],

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  profileData : [], // for profile plots, plot script requires this name

  // SPECIAL FOR PLOT TYPE SINGLE - will be loaded in reset()
  singleData : [], // for single point plots, plot script requires this name
  dataSwitcher : [], // for copy data - list only inputs in table that changed

  // define variables which will not be plotted nor saved in copy data table
  //   none here

  // numPlotPoints can be defined here and not plotInfo because there is only one unit
  // on the one plot and plotter uses length of public plot data arrays created here
  numPlotPoints : 200, // THIS IS PLOT POINTS FOR PROFILE & STRIP PLOTS

  initialize : function() {
    //
    let v = 0;
    this.dataHeaders[v] = 'k_300K';
    this.dataInputs[v] = 'input_field_RateConstant';
    this.dataUnits[v] = 'units depend on order';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1;
    this.dataDefault[v] = 1.0e-2;
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
    this.dataHeaders[v] = 'order';
    this.dataInputs[v] = 'input_field_ReactionOrder';
    this.dataUnits[v] = '';
    this.dataMin[v] = -1;
    this.dataMax[v] = 2;
    this.dataDefault[v] = 1;
    //
    v = 3;
    this.dataHeaders[v] = 'T';
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
    this.dataMax[v] = 10;
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
    v = 8;
    this.dataHeaders[v] = 'conversion';
    this.dataUnits[v] = "%";
    this.dataMin[v] = 0;
    this.dataMax[v] = 100;
    //

    // initialize profile data array
    // plotter.initPlotData(numProfileVars,numProfilePts)
    this.profileData = plotter.initPlotData(1,this.numPlotPoints); // holds data for static profile plots

  }, // END of initialize()

  // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***

  reset : function() {
    //
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.

    this.updateUIparams(); // this first, then set other values as needed

    // clear plot type profile data sources,
    // since profileData array gets reloaded in updateDisplay
    for (p = 0; p <= this.numPlotPoints; p += 1) {
      this.time[p] =  0;
      this.cA[p] = 0;
    }

    // SPECIAL FOR PLOT TYPE 'single' - save all input and output vars and runCount
    const numSingleVars = 10;
    const numSinglePts = 0; // 0+1 points will be filled here
    this.singleData = plotter.initPlotData(numSingleVars,numSinglePts);
    // SPECIAL CASE - move initial [0,0] x,y points off plots
    // order of 3 indices is var, point, x-y
    for (v = 0; v < numSingleVars; v += 1) {
      this.singleData[v][0][0] = -1;
      this.singleData[v][0][1] = -1;
    }

    // SPECIAL FOR PLOT TYPE 'single'
    // dataSwitcher is array with 0's for unchanged inputs, 1's for changed
    // inputs and 1's for all outputs - inputs may change in updateUIparams()
    let tlen = this.VarCount; // last v of inputs, which start at v=0
    for (v = 0; v <= tlen; v += 1) {
      this.dataSwitcher[v] = 0;
    }
    // want to always list outputs
    tleno = this.dataHeaders.length;
    for (v = tlen+1; v < tleno; v += 1){
      this.dataSwitcher[v] = 1;
    }

    this.runCount = 0;
    this.cA_final = this.cAin;
    this.conversion = 0;

    // set oldDataFlag = 1 on reset to deactivate copy data buttons
    // since no runs made and plots have been cleared
    simParams.oldDataFlag = 1; // 0 for no old data, 1 for old data on plot
    // but clear fields since plots have been cleard
    document.getElementById(this.old_data_notice_ID_profile).innerHTML = '';
    document.getElementById(this.old_data_notice_ID_single).innerHTML = '';

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

    // SPECIAL FOR PLOT TYPE SINGLE
    // need to get which values have changed, so save original values
    this.dataValuesORIG[0] = this.k_300;
    this.dataValuesORIG[1] = this.Ea;
    this.dataValuesORIG[2] = this.nth;
    this.dataValuesORIG[3] = this.Tin;
    this.dataValuesORIG[4] = this.cAin;
    this.dataValuesORIG[5] = this.Vol;
    this.dataValuesORIG[6] = this.t_final;

    let unum = this.unitIndex;
    //
    this.k_300 = this.dataValues[0] = interfacer.getInputValue(unum, 0);
    this.Ea = this.dataValues[1] = interfacer.getInputValue(unum, 1);
    this.nth = this.dataValues[2] = interfacer.getInputValue(unum, 2);
    this.Tin = this.dataValues[3] = interfacer.getInputValue(unum, 3);
    this.cAin = this.dataValues[4] = interfacer.getInputValue(unum, 4);
    this.Vol = this.dataValues[5] = interfacer.getInputValue(unum, 5);
    this.t_final = this.dataValues[6] = interfacer.getInputValue(unum, 6);

    // SPECIAL FOR PLOT TYPE SINGLE
    // dataSwitcher is array with 0's for unchanged inputs, 1's for changed
    // inputs and 1's for all outputs - inputs may change in updateUIparams()
    for (v = 0; v < 7; v += 1) {
      if (this.dataValuesORIG[v] != this.dataValues[v]) {
        this.dataSwitcher[v] = 1;
        if (controller.simTime > 0) {
          simParams.oldDataFlag = 1; // 0 for no old data, 1 for old data on plot
        }
      }
    }
    if (simParams.oldDataFlag == 1) {
      // 0 for no old data, 1 for old data on plot
      document.getElementById(this.old_data_notice_ID_profile).innerHTML = 'Old Data';
      document.getElementById(this.old_data_notice_ID_single).innerHTML = 'Old Data';
    }
    // xxx I tried to wait some delay before displaying old run notices in case
    // user makes an immediate run so don't get flash of notice BUT
    // THIS HAD NO DELAY BEFORE DISPLAY: setTimeout(this.displayOldRunNotice(), 2000);
    // where the lines above were in the function AND if delay worked, function would need
    // to have had a check that simParams.oldDataFlag was still = 1 when it executed...

    // SPECIAL for cA vs. time profile plot
    // if t_final value changes, set values so
    // plot axes redraw with new x axis max for new t_final
    v = 6; // 6 for t_final
    if (this.dataValuesORIG[v] != this.dataValues[v]) {
      let plotIndex = 0;
      plotInfo[plotIndex]['xAxisMax'] = this.t_final;
      // force axis redraw
      plotter['plotArrays']['plotFlag'][plotIndex] = 0;
    }

    // ensure order nth has values -1,0,1,2
    let x = Math.round(this.nth);
    if (x < -1) {
      x = -1;
    } else if (x > 2) {
      x = 2;
    }
    this.nth = x;
    document.getElementById(this.dataInputs[2]).value = this.nth;

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

    // SPECIAL FOR PLOT TYPE SINGLE - compute final values
    this.cA_final = this.reactBATCHnthSS(this.t_final,kT,this.nth,this.cAin);
    this.conversion = 100 * (1 - this.cA_final / this.cAin);

    // change cA final output field to visible only after 1st run
    document.getElementById(this.cA_output_field_ID).style.visibility = 'visible';

    // change conversion final output field to visible only after 1st run
    document.getElementById(this.conversion_output_field_ID).style.visibility = 'visible';

    // change cA final output field to visible only after 1st run
    document.getElementById(this.cA_output_field_ID_profile).style.visibility = 'visible';

    // change conversion final output field to visible only after 1st run
    document.getElementById(this.conversion_output_field_ID_profile).style.visibility = 'visible';

    simParams.oldDataFlag = 0; // 0 for no old data, 1 for old data on plot
    document.getElementById(this.old_data_notice_ID_profile).innerHTML = '';
    document.getElementById(this.old_data_notice_ID_single).innerHTML = '';

  }, // end updateState method

  updateDisplay : function() {

    // note use .toFixed(n) method of object to round number to n decimal points
    let txt = 'cA final (mol/m<sup>3</sup>) = ' + this.cA_final.toFixed(1);
    document.getElementById(this.cA_output_field_ID).innerHTML = txt;

    // note use .toFixed(n) method of object to round number to n decimal points
    txt = 'Conversion final (%) = ' + this.conversion.toFixed(1);
    document.getElementById(this.conversion_output_field_ID).innerHTML = txt;

    // note use .toFixed(n) method of object to round number to n decimal points
    txt = 'cA final (mol/m<sup>3</sup>) = ' + this.cA_final.toFixed(1);
    document.getElementById(this.cA_output_field_ID_profile).innerHTML = txt;

    // note use .toFixed(n) method of object to round number to n decimal points
    txt = 'Conversion final (%) = ' + this.conversion.toFixed(1);
    document.getElementById(this.conversion_output_field_ID_profile).innerHTML = txt;

    // WARNING: must have simParams vars imTimeStep = 1 and simStepRepeats = 1
    // for simtime to equal # runs between resets
    this.runCount = controller.simTime.toFixed(0); // use next & a line below
    document.getElementById("field_run_count").innerHTML = "Total runs = " + this.runCount;

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

    // in updateUIparams, have already prepared to change x-axis max
    // after change in t_final on next plot redraw

    // fill array for profile plot
    for (j=0; j<=this.numPlotPoints; j+=1) {
      this.profileData[0][j][0] = this.time[j];
      this.profileData[0][j][1] = this.cA[j];
    }

    // SPECIAL FOR PLOT TYPE SINGLEd
    // reset on open lab adds -1,-1 points in first element of array
    // then don't want updateDisplay on open lab and
    // before any runs made to add points
    if (this.runCount > 0) {
      let tx;
      const ty = 0; // arbitrary value - single plot just gets tx
      const numSingleVars = 10; // xxx get this from a property
      for (v = 0; v < numSingleVars; v += 1) {
        tempArray = this.singleData[v]; // work on one plot variable at a time
        // delete first x,y pair 0,0 on 1st run
        if (this.runCount == 1) {tempArray.shift();}
        if (v == 0) {tx = this.k_300}
        else if (v == 1) {tx = this.Ea}
        else if (v == 2) {tx = this.nth}
        else if (v == 3) {tx = this.Tin}
        else if (v == 4) {tx = this.cAin}
        else if (v == 5) {tx = this.Vol}
        else if (v == 6) {tx = this.t_final}
        else if (v == 7) {tx = this.cA_final}
        else if (v == 8) {tx = this.conversion}
        else if (v == 9) {tx = this.runCount}
        // add the new [x,y] pair array at end
        tempArray.push( [tx,ty] );
        // update the variable being processed
        this.singleData[v] = tempArray;
      }
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
  }, // END reactBATCHnthSS method

}; // END puBatchReactor object
