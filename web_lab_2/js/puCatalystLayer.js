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

let puCatalystLayer = {
  //
  // ************************************************************
  // NOTE: this single unit could have been split into 3 units:
  //       feed, mixing cell, catalyst layer
  //       but choose to keep as one unit here
  // ************************************************************

  unitIndex : 0, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'catalyst layer',

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

  // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS...
  // SEE dataInputs array in initialize() method for input field ID's
  //
  // THIS UNIT ALSO HAS A CHECKBOX INPUT
  inputCheckBoxFeed : 'checkbox_on',
  // THIS UNIT ALSO HAS RADIO BUTTON INPUTS
  inputModel01 : 'radio_Model_1', // model 1 is AS > B + S
  inputModel02 : 'radio_Model_2', // model 2 is AS + S > B + 2S
  inputRadioConstant : 'radio_Constant',
  inputRadioSine : 'radio_Sine',
  inputRadioSquare : 'radio_Square',

  // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS
  // see updateUIparams and updateDisplay methods below
  displayKrxn : 'field_Krxn',
  displayAveRate : 'field_aveRate',
  displayAveConversion : 'field_aveConversion',

  // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***
  // ***   EXCEPT TO HTML ID'S IN method initialize(), array dataInputs    ***

  // define main inputs
  // values will be set in method initialize()
  Cmax : 0,
  CmaxSlider : 0,
  Kflow : 0,
  Kads : 0,
  Kdiff : 0,
  Alpha : 0,
  Phi : 0,
  Period : 0,
  Duty : 0,
  Bscale : 1,

  // define arrays to hold info for variables
  // these will be filled with values in method initialize()
  dataHeaders : [], // variable names
  dataInputs : [], // input field ID's
  dataUnits : [],
  dataMin : [],
  dataMax : [],
  dataDefault : [],
  dataValues : [],

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  profileData : [], // for profile plots, plot script requires this name
  stripData : [], // for strip chart plots, plot script requires this name
  colorCanvasData : [], // for color canvas plots, plot script requires this name

  // define arrays to hold working data
  y : [], // reactant gas in catalyst layer
  y2 : [], // product gas in catalyst layer

  // XXX inlet conc need to be here for updateDisplay?
  cinNew : 0,
  cinOld : 0,

  // define the main variables which will not be plotted or save-copy data
  //   none here

  // WARNING: have to change simTimeStep and simStepRepeats if change numNodes
  // WARNING: numNodes is accessed  in process_plot_info.js
  numNodes : 50,

  // numStripPts used for strip charts and also color canvas
  // this value is also accessed by plotter_plot_info.js
  numStripPts : 80,

  // WARNING: IF INCREASE NUM NODES IN CATALYST LAYER BY A FACTOR THEN HAVE TO
  // REDUCE size of time steps FOR NUMERICAL STABILITY BY SQUARE OF THE FACTOR
  // AND INCREASE step repeats BY SAME FACTOR IF WANT SAME SIM TIME BETWEEN
  // DISPLAY UPDATES

  // allow this unit to take more than one step within one main loop step in updateState method
  // WARNING: see special handling for dt in this case in this unit's updateInputs method
  unitStepRepeats : 1200,
  unitTimeStep : simParams.simTimeStep / this.unitStepRepeats,

  // kinetic model
  Model : 2, // use integers 1,2 - used in Math.pow(), selects rate determining step

  // for sine or square cycling with variable duty time
  Shape : 'sine',
  cycleTime : 0,
  frequency : 0, // update in updateUIparams
  sineFunc : 0,
  sineFuncOLD : 0,

  // variables for average rate
  AinSum : 0,
  BoutSum : 0,
  BoutCounter : 0,
  aveRate  : 0,
  aveConversion : 0,

  ssCheckSum : 0, // used to check for steady state
  residenceTime : 0, // for timing checks for steady state check
  // residenceTime is set in this unit's updateUIparams()

  initialize : function() {

    let v = 0;
    this.dataHeaders[v] = 'Cmax';
    this.dataInputs[v] = 'input_setCmax_value';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1;
    this.dataDefault[v] = 0;
    //
    v = 1;
    this.dataHeaders[v] = 'CmaxSlider';
    this.dataInputs[v] = 'range_setCmax_slider';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 1;
    this.dataDefault[v] = 0;
    v = 2;
    this.dataHeaders[v] = 'Kflow';
    this.dataInputs[v] = 'input_field_enterKflow';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0.001;
    this.dataMax[v] = 10;
    this.dataDefault[v] = 2.5;
    v = 3;
    this.dataHeaders[v] = 'Kads';
    this.dataInputs[v] = 'input_field_enterKads';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 100;
    this.dataDefault[v] = 1;
    v = 4;
    this.dataHeaders[v] = 'Kdiff';
    this.dataInputs[v] = 'input_field_enterKdiff';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0.0001;
    this.dataMax[v] = 1;
    this.dataDefault[v] = 0.003;
    v = 5;
    this.dataHeaders[v] = 'Phi'; // Thiele Modulus
    this.dataInputs[v] = 'input_field_enterThieleMod';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0.001;
    this.dataMax[v] = 1000;
    this.dataDefault[v] = 34;
    v = 6;
    this.dataHeaders[v] = 'Alpha';
    this.dataInputs[v] = 'input_field_enterAlpha';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0.001;
    this.dataMax[v] = 1000;
    this.dataDefault[v] = 10;
    v = 7;
    this.dataHeaders[v] = 'Period';
    this.dataInputs[v] = 'input_field_enterCyclePeriod';
    this.dataUnits[v] = '';
    this.dataMin[v] = 100;
    this.dataMax[v] = 1000;
    this.dataDefault[v] = 500;
    v = 8;
    this.dataHeaders[v] = 'Duty'; // percent on, duty cycle for square cycling
    this.dataInputs[v] = 'input_field_enterDuty';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 100;
    this.dataDefault[v] = 50;
    v = 9;
    this.dataHeaders[v] = 'Bscale'; // percent on, duty cycle for square cycling
    this.dataInputs[v] = 'input_field_enterBscale';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 10;
    this.dataDefault[v] = 4;
    //
    // END OF INPUT VARS
    // record number of input variables, varCount
    // used, e.g., in copy data to table in _plotter.js
    this.varCount = v;
    //
    // OUTPUT VARS
    //

  }, // END of method initialize

  reset : function() {
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.

    this.updateUIparams(); // this first, then set other values as needed

    // set state variables not set by updateUIparams to initial settings

    // XXX constants below should be converted to variables here & in plot info

    // initialize profile data array
    // initPlotData(numProfileVars,numProfilePts)
    this.profileData = plotter.initPlotData(4,this.numNodes); // holds data for static profile plots
    // the 4 vars are A, B, AS, rate

    // initialize strip chart data array
    // initPlotData(numStripVars,numStripPts)
    this.stripData = plotter.initPlotData(3,80); // holds data for scrolling strip chart plots
    // the 3 vars are Ain, Aout, Bout

    // initialize local array to hold color-canvas data, e.g., space-time data -
    // plotter.initColorCanvasArray(numVars,numXpts,numYpts)
    this.colorCanvasData = plotter.initColorCanvasArray(1,80,this.numNodes);
    // the 1 var is rate, numXpts should match strip chart this.numStripPts

    for (k = 0; k <= this.numNodes; k += 1) {
      this.y[k] = 0;
      this.y2[k] = 0;
    }

    let kn = 0;
    for (k=0; k<=this.numNodes; k+=1) {
      kn = k/this.numNodes;
      // x-axis values
      // x-axis values will not change during sim
      // XXX change to get number vars for this plotInfo variable
      //     so can put in repeat - or better yet, a function
      //     and same for y-axis below
      this.profileData[0][k][0] = kn;
      this.profileData[1][k][0] = kn;
      this.profileData[2][k][0] = kn;
      this.profileData[3][k][0] = kn;
      // y-axis values
      this.profileData[0][k][1] = 0;
      this.profileData[1][k][1] = 0;
      this.profileData[2][k][1] = 0;
      this.profileData[3][k][1] = 0;
    }

    // WARNING - if change a value to see initialization here
    // then reset it to zero below this line or will get results at this node
    // document.getElementById("dev01").innerHTML = "RESET time = " + controller.simTime.toFixed(0) + "; y = " + y[0];

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

    // residenceTime of this unit required to check for steady state in controller object
    // SPECIAL this unit prob never at SS and checkForSteadyState below
    // always returns false so set a large number here
    this.residenceTime = 100;

    // updateUIparams gets called on page load but not new range and input
    // updates, so need to call updateUIfeedInput here
    this.updateUIfeedInput();
    // console.log('updateUIparams: this.Cmax = ' + this.Cmax);
    //

    // check input fields for new values
    // function getInputValue() is defined in file process_interfacer.js
    // getInputValue(unit # in processUnits object, variable # in dataInputs array)
    // see variable numbers above in initialize()
    // note: this.dataValues.[pVar]
    //   is only used in copyData() to report input values
    //
    let unum = this.unitIndex;
    //
    // SPECIAL for this unit methods updateUIfeedInput and updateUIfeedSlider
    //         below get Cmax slider and field value for [0] and [1]
    this.Kflow = this.dataValues[2] = interfacer.getInputValue(unum, 2);
    this.Kads = this.dataValues[3] = interfacer.getInputValue(unum, 3);
    this.Kdiff = this.dataValues[4] = interfacer.getInputValue(unum, 4);
    this.Phi = this.dataValues[5] = interfacer.getInputValue(unum, 5);
    this.Alpha = this.dataValues[6] = interfacer.getInputValue(unum, 6);
    this.Period = this.dataValues[7] = interfacer.getInputValue(unum, 7);
    this.Duty = this.dataValues[8] = interfacer.getInputValue(unum, 8);
    this.Bscale = this.dataValues[9] = interfacer.getInputValue(unum, 9);

    // update cycling frequency
    this.frequency = 2 * Math.PI / this.Period;

    // change input y-axis scale factor for plotting of B out
    // B out is in plot 3, variable 1
    plotInfo[3]['varYscaleFactor'][1] = this.Bscale;

    // sf = plotInfo[plotInfoNum]['varYscaleFactor'][v];

    // RADIO BUTTONS & CHECK BOX
    // at least for now, do not check existence of UI element as above

    // Model radio buttons - selects rate determing step
    let m01 = document.querySelector('#' + this.inputModel01);
    let m02 = document.querySelector('#' + this.inputModel02);
    if (m01.checked) {
      this.Model = 1;
    } else {
      this.Model = 2;
    }

    // Input Shape radio buttons
    let el0 = document.querySelector('#' + this.inputRadioConstant);
    let el1 = document.querySelector('#' + this.inputRadioSine);
    let el2 = document.querySelector('#' + this.inputRadioSquare);
    let el3 = document.querySelector('#' + this.inputCheckBoxFeed);
    if (el2.checked) {
      this.Shape = 'square';
    } else if (el1.checked) {
      this.Shape = 'sine';
    } else {
      // assume constant checked
      if (el3.checked) {
        this.Shape = 'constant';
      } else {
        this.Shape = 'off';
      }
    }

    // console.log('updateUIparams, this.Shape = ' + this.Shape);

    let Krxn = Math.pow(this.Phi, 2)*this.Kdiff/0.3/this.Alpha/this.Kads;
    // note eps is local to updateState, so use 0.3 here
    document.getElementById(this.displayKrxn).innerHTML = Krxn.toFixed(4);

    // console.log('Phi = ' + this.Phi);
    // console.log('Kdiff = ' + this.Kdiff);
    // console.log('Alpha = ' + this.Alpha);
    // console.log('Kads = ' + this.Kads);
    // console.log('Krxn = ' + Krxn);

    // reset average rate after any change
    this.AinSum = 0;
    this.BoutSum = 0;
    this.BoutCounter = 0;
    this.aveRate = 0;
    this.aveConversion = 0;

  }, // END updateUIparams

  updateUIfeedInput : function() {
    // SPECIAL FOR THIS UNIT
    // called in HTML input element
    // [0] is field, [1] is slider
    // get field value
    let unum = 0;
    this.Cmax = this.dataValues[0] = interfacer.getInputValue(unum, 0);
      // update slider position
    document.getElementById(this.dataInputs[1]).value = this.Cmax;
    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();
    // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
    this.ssCheckSum = 1;
}, // END method updateUIfeedInput()

  updateUIfeedSlider : function() {
    // SPECIAL FOR THIS UNIT
    // called in HTML input element
    // [0] is field, [1] is slider
    // get slider value
    let unum = 0;
    this.Cmax = this.dataValues[1] = interfacer.getInputValue(unum, 1);
    // update field display
    document.getElementById(this.dataInputs[0]).value = this.Cmax;
    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();
    // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
    this.ssCheckSum = 1;
  }, // END method updateUIfeedSlider()

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
    // check for change in overall main time step simTimeStep
    this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

    // document.getElementById("dev01").innerHTML = "UPDATE time = " + controller.simTime.toFixed(0) + "; y = " + this.y[20];

    let eps = 0.3; // layer void fraction, constant
    let Vratio = 2; // layer-pellet/cell volume ratio Vp/Vc, keep constant
    let phaseShift = 1.5 * Math.PI; // keep constant

    // compute these products outside of repeat

    // compute 0 to this.numNodes points, therefore this.numNodes divisions
    let dz = 1/this.numNodes; // dless distance between nodes in layer

    let inverseDz2 = Math.pow(1/dz, 2);
    let KflowCell = this.Kflow*Vratio; // Q/Vc/k-1 = (Q/Vp/k-1)*(Vp/Vc)
    let KdOeps = this.Kdiff / eps;
    let KdOepsOAlpha = KdOeps / this.Alpha;
    let dtKdOepsOAlpha = this.unitTimeStep * KdOepsOAlpha;
    let dtKdOeps = this.unitTimeStep * KdOeps;
    let Phi2 = Math.pow(this.Phi, 2);
    let flowFactor = this.Kflow / this.Alpha / eps; // for aveRate

    // console.log('inverseDz2 = ' + inverseDz2);
    // console.log('KflowCell = ' + KflowCell);
    // console.log('KdOeps = ' + KdOeps);
    // console.log('KdOepsOAlpha = ' + KdOepsOAlpha);
    // console.log('dtKdOepsOAlpha = ' + dtKdOepsOAlpha);
    // console.log('dtKdOeps = ' + dtKdOeps);
    // console.log('Phi2 = ' + Phi2);
    // console.log('flowFactor = ' + flowFactor);

    let secondDeriv = 0;
    let D2 = 0;
    let Phi2overD2 = 0;
    let tNewFac = 0;
    let i = 0; // used as index
    let k = 0; // used as index
    let flowRate = 0;
    let diffRate = 0;

    let yNew = [];
    let y2New = [];
    let caNew = 0;
    let cbNew = 0;

    // document.getElementById("dev01").innerHTML = "UPDATE time = " + controller.simTime.toFixed(0) + "; y = " + inverseDz2;

    // this unit takes multiple steps within one outer main loop repeat step
    for (i=0; i<this.unitStepRepeats; i+=1) {

      // boundary condition at inner sealed face
      k = 0;

      D2 = Math.pow((1 + this.Kads * this.y[k]), this.Model); // this.Model should be 1 or 2
      Phi2overD2 = Phi2 / D2;
      secondDeriv = ( 2 * this.y[k+1] - 2 * this.y[k] ) * inverseDz2;

      tNewFac = 1 / (1/this.Alpha + this.Kads/D2); // to allow any Alpha (as long as quasi-equil established)
      // replaces (D2/Kads) which is for large Alpha

      yNew[k] = this.y[k] + dtKdOepsOAlpha * tNewFac * ( secondDeriv - Phi2overD2 * this.y[k] ); // for LARGE ALPHA

      // console.log('k = 0');
      // console.log("D2 = " + D2);
      // console.log("Phi2overD2 = " + Phi2overD2);
      // console.log("secondDeriv = " + secondDeriv);
      // console.log("tNewFac = " + tNewFac);
      // console.log("this.y[k+1] = " + this.y[k+1]);
      // console.log("this.y[k] = " + this.y[k]);
      // console.log("yNew[k] = " + yNew[k]);

      // now do for y2
      secondDeriv = ( 2*this.y2[k+1] - 2*this.y2[k] ) * inverseDz2;
      y2New[k] = this.y2[k]  + dtKdOeps * ( secondDeriv + Phi2overD2 * this.y[k] );

      // internal nodes
      for (k = 1; k < this.numNodes; k += 1) {

          D2 = Math.pow(( 1 + this.Kads * this.y[k] ), this.Model); // this.Model should be 1 or 2
          Phi2overD2 = Phi2 / D2;
          secondDeriv = ( this.y[k-1] - 2*this.y[k] + this.y[k+1] ) * inverseDz2;

          tNewFac = 1 / (1/this.Alpha + this.Kads/D2); // to allow any Alpha (as long as quasi-equil established)
          // replaces D2/Kads which is for large Alpha

          yNew[k] = this.y[k]  + dtKdOepsOAlpha * tNewFac * ( secondDeriv - Phi2overD2 * this.y[k] ); // for LARGE ALPHA

          // now do for y2
          secondDeriv = ( this.y2[k-1] - 2*this.y2[k] + this.y2[k+1] ) * inverseDz2;
          y2New[k] = this.y2[k]  + dtKdOeps * ( secondDeriv + Phi2overD2 * this.y[k] );

      } // end repeat

      // k = this.numNodes - 1; // <<<< TEMPORARY FOR CONSOLE.LOG
      // console.log('k = this.numNodes - 1;');
      // console.log("D2 = " + D2);
      // console.log("Phi2overD2 = " + Phi2overD2);
      // console.log("secondDeriv = " + secondDeriv);
      // console.log("tNewFac = " + tNewFac);
      // console.log("this.y[k+1] = " + this.y[k+1]);
      // console.log("this.y[k] = " + this.y[k]);
      // console.log("yNew[k] = " + yNew[k]);

      // boundary condition at outer bulk face

      k = this.numNodes;

      // reactant A feed to reactor
      this.sineFuncOLD = this.sineFunc; // need for square cycle with duty fraction
      this.sineFunc = 0.5 * (1 + Math.sin( this.frequency * controller.simTime  + phaseShift) );

      // XXX controller.simTime does not change within this repeat!!!!

      // console.log('updateState, frequency = ' + this.frequency);
      // console.log('updateState, controller.simTime = ' + controller.simTime);
      // console.log('updateState, phaseShift = ' + phaseShift);
      // console.log('updateState, sineFunc = ' + this.sineFunc);

      // NEW FOR SQUARE CYCLING WITH DUTY CYCLE
      this.cycleTime = this.cycleTime + this.unitTimeStep;

      this.cinOld = this.cinNew;

      switch(this.Shape) {
        case 'off':
          this.cinNew = 0;
          break;
        case 'constant':
          this.cinNew = this.Cmax;
          break;
        case 'sine':
          this.cinNew = this.Cmax * this.sineFunc;
          break;
        case 'square':
          if (this.sineFuncOLD <= 0.5 && this.sineFunc > 0.5) {
            // we are entering new cycle
            // start timer and switch cin
            this.cycleTime = 0;
            this.cinNew = this.Cmax;
          } else {
            // within sine cycle
            // check cycleTime to see what to do
            if (this.cycleTime < this.Duty/100 * this.Period) {
              // do nothing
            } else {
              this.cinNew = 0;
            }
          }
          break;
        default:
          this.cinNew = this.Cmax;
      }

      // force this.cinNew to be a number, if not, then
      // 0 and 1 values get treated as text when summing for aveConversion
      this.cinNew = Number(this.cinNew);

      // compute average rate and conversion
      // need to update only after complete cycles or get values
      // always changing - and works OK for constant feed as well
      if (this.sineFuncOLD <= 0.5 && this.sineFunc > 0.5) {
        // we are entering new cycle
        // start timer
        this.cycleTime = 0;
        // compute averages only after complete cycles
        if (this.BoutCounter > 0) {
          // compute ave d'ess TOF = ave B formed per site per unit d'less time
          this.aveRate = flowFactor * this.BoutSum / this.BoutCounter;
        }
        if (this.AinSum > 0) {
          this.aveConversion = this.BoutSum / this.AinSum;
        }
        // reset variables used to compute averages
        this.AinSum = 0;
        this.BoutSum = 0;
        this.BoutCounter = 0;
      } else {
        // we are in a cycle so update variables used to compute averages
        this.AinSum = this.AinSum + this.cinNew;
        this.BoutSum = this.BoutSum + cbNew;
        this.BoutCounter = this.BoutCounter + 1;
      }

      // WARNING: do not use stripData for concentrations used in computations
      // because they are only updated after this repeat of unitStepRepeats is done

      // reactant A balance in mixing cell with diffusion in/out of layer
      flowRate = KflowCell * (this.cinOld - this.y[k]);
      diffRate = this.Kdiff*Vratio*this.numNodes*(this.y[k]-this.y[k-1]);
      dcadt = flowRate - diffRate;
      caNew = this.y[k] + dcadt * this.unitTimeStep;
      yNew[k] = caNew;

      // product B balance in mixing cell with diffusion in/out of layer
      flowRate = KflowCell * (0 - this.y2[k]);
      diffRate = this.Kdiff*Vratio*this.numNodes*(this.y2[k]-this.y2[k-1]);
      dcbdt = flowRate - diffRate;
      cbNew = this.y2[k] + dcbdt * this.unitTimeStep;

      // document.getElementById("dev02").innerHTML = "flowRate = " + flowRate + "; diffRate = " + diffRate;
      // document.getElementById("dev02").innerHTML = "this.y2[k] = " + this.y2[k] + "; dcbdt * this.unitTimeStep = " + dcbdt * this.unitTimeStep;

      y2New[k] = cbNew;

       // document.getElementById("dev01").innerHTML = "UPDATE BOUNDARY time = " + controller.simTime.toFixed(0) + "; y = " +  yNew[k].toFixed(3);

       // copy temp y and y2 to current y and y2
      this.y = yNew;
      this.y2 = y2New;

    } // END NEW FOR REPEAT for (i=0; i<this.unitStepRepeats; i+=1)

    // console.log('after repeat, cinOld = ' + this.cinOld);
    // console.log('after repeat, cinNew = ' + this.cinNew);
    // console.log('after repeat, caNew = ' + caNew);
    // console.log('after repeat, y = ' + this.y);

  }, // end updateState method

  updateDisplay : function() {

    let k; // used as index
    let v; // used as index
    let s; // used as index
    let t; // used as index
    let tempArray = []; // for shifting data in strip chart plots
    let tempSpaceData = []; // for shifting data in color canvas plots

    // display average rate and average conversion
    document.getElementById(this.displayAveRate).innerHTML = this.aveRate.toExponential(3);
    document.getElementById(this.displayAveConversion).innerHTML = this.aveConversion.toFixed(4);

    // HANDLE PROFILE PLOT DATA

    // copy y values to profileData array which holds data for plotting

    // XXX CONSIDER RE-ORDERING LAST TWO INDEXES IN profileData SO CAN USE
    //     SIMPLE ASSIGNMENT FOR ALL Y VALUES, e.g.,
    // this.profileData[0][1][k] = y;

    for (k=0; k<=this.numNodes; k+=1) {
      this.profileData[0][k][1] = this.y[k];
      this.profileData[1][k][1] = this.y2[k];
      // update arrays for coverage and rate
      // note that these values are computed above in repeat to get reactant and
      // product gas conc but no need to update coverage and rate arrays inside repeat
      // since this sim assumes pseudo-SS between reactant gas and coverage
      this.profileData[2][k][1] = this.Kads * this.y[k] / (1 + this.Kads * this.y[k]); // coverage
      this.profileData[3][k][1] = this.Kads * this.y[k] / Math.pow( (1 + this.Kads * this.y[k]), this.Model); // rate, this.Model should be 1 or 2
    }

    // HANDLE STRIP CHART DATA

    // copy gas in and out data to stripData array
    // update plotData with new data

    // handle cin - feed of reactant gas to mixing cell
    v = 0;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x,y] pair array at end
    tempArray.push( [ 0, this.cinNew ] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // handle ca - reactant in mixing cell gas
    v = 1;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x,y] pair array at end
    // this.y[this.numNodes] is A in mixing cell
    tempArray.push( [ 0, this.y[this.numNodes] ] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // handle cb - product gas in mixing cell gas
    v = 2;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x,y] pair array at end
    // this.y2[this.numNodes] is B in mixing cell
    tempArray.push( [ 0, this.y2[this.numNodes] ] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // re-number the x-axis values to equal time values
    // so they stay the same after updating y-axis values

    let numStripVars = 3; // xxx change to use var value
    let timeStep = simParams.simTimeStep * simParams.simStepRepeats;
    for (v = 0; v < numStripVars; v += 1) {
      for (p = 0; p <= this.numStripPts; p += 1) { // note = in p <= this.numStripPts
        // note want p <= this.numStripPts so get # 0 to  # this.numStripPts of points
        // want next line for newest data at max time
        this.stripData[v][p][0] = p * timeStep;
        // want next line for newest data at zero time
        // this.stripData[v][p][0] = (this.numStripPts - p) * timeStep;
      }
    }

    // HANDLE SPACE-TIME DATA

    // colorCanvasData[v][t][s] - variable, time, space (profile in layer)
    // get 2D array for one variable at a time
    v = 0; // first variable = rate
    tempArray = this.colorCanvasData[v];
    // get rate profile data, variable 3 in profileData array
    // NOTE array index [this.numNodes-k] to flip plot vertically
    for (k = 0; k <= this.numNodes; k += 1) {
      tempSpaceData[this.numNodes-k] = this.profileData[3][k][1]; // use rate computed above
    }

    // update the colorCanvasData array
    // NOTE: used this.numStripPts so same time span as strip plots in this lab
    for (t = 0; t < this.numStripPts; t += 1) { // NOTE < this.numStripPts, don't do last one here
      for (s = 0; s <= this.numNodes; s +=1) { // NOTE <= this.numNodes
        tempArray[t][s] = tempArray[t+1][s];
      }
    }

    // now update the last time
    for (s = 0; s <= this.numNodes; s +=1) { // NOTE <= this.numNodes
      tempArray[this.numStripPts][s] = tempSpaceData[s];
    }
    // update the variable being processed
    this.colorCanvasData[v] = tempArray;

  }, // END updateDisplay method

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
    // multiply all numbers by a factor to get desired number significant
    // figures to left decimal point so toFixed() does not return string "0.###"
    // WARNING: too many sig figs will prevent detecting steady state
    //
    let rc = 1.0e3 * this.y[1]; // reactant at center of layer
    let rt = 1.0e3 * this.y[this.numNodes]; // reactant at outer surface layer
    let lt = 1.0e3 * this.y2[0]; // product at center of layer
    let lc = 1.0e3 * this.y2[this.numNodes]; // product at outer surface layer
    rc = rc.toFixed(0); // strings
    rt = rt.toFixed(0);
    lt = lt.toFixed(0);
    lc = lc.toFixed(0);
    // concatenate strings
    let newCheckSum = rc +'.'+ rt +'.'+ lt +'.'+ lc;
    //
    let oldSScheckSum = this.ssCheckSum;
    let ssFlag = false;
    if (newCheckSum == oldSScheckSum) {ssFlag = true;}
    this.ssCheckSum = newCheckSum; // save current value for use next time

    // console.log('simTime = ' + controller.simTime);
    // console.log('  oldSScheckSum = ' + oldSScheckSum);
    // console.log('    newCheckSum = ' + newCheckSum + ', ssFlag = ' + ssFlag);

    return ssFlag;
  } // END checkForSteadyState method

}; // END object puCatalystLayer
