/*
  Design, text, images and code by Richard K. Herz, 2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// This file defines objects that represent process units

// ------------ PROCESS UNIT OBJECT DEFINITIONS ----------------------

// EACH PROCESS UNIT DEFINITION MUST CONTAIN AT LEAST THESE 7 FUNCTIONS:
//  initialize, reset, updateUIparams, updateInputs, updateState,
//  updateDisplay, checkForSteadyState
// THESE FUNCTION DEFINITIONS MAY BE EMPTY BUT MUST BE PRESENT
//
// EACH PROCESS UNIT DEFINITION MUST DEFINE the variable residenceTime

// -------------------------------------------------------------------

// ===================================================================
// SPECIAL FOR THIS LAB
//    see class Tree definition at bottom this file
//    used to construct new trees in processUnits[0].initialize() below
// ===================================================================

let processUnits = new Object();

processUnits[0] = {
  //
  unitIndex : 0, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'Forest',

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

    // SPECIAL - none for this unit

  // *******************************************

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  // profileData : [], // for profile plots, plot script requires this name
  // stripData : [], // for strip chart plots, plot script requires this name
  colorCanvasData : [], // for color canvas plots, plot script requires this name

  // allow this unit to take more than one step within one main loop step in updateState method
  // WARNING: see special handling for time step in this unit's updateInputs method
  unitStepRepeats : 1,
  unitTimeStep : simParams.simTimeStep / this.unitStepRepeats,

  // define variables which will not be plotted nor saved in copy data table
  //   none here

  // WARNING: numNodes is accessed in process_plot_info.js
  numNodes : 100,

  ssCheckSum : 0, // used to check for steady state
  mtotOld : 0, // used to check for steady state
  residenceTime : 0, // for timing checks for steady state check
  // residenceTime is set in this unit's updateUIparams()

  windSpeed : 2, // 0,1,2 = off,med,high, see method changeWindSpeed(ws) below

  trees : [], // will get filled below in initialize

  // BOTH LINES BELOW WORK (Flanagan, 6.10.5, 7th ed., p. 149)
  // initialize : function() {
  initialize() {

    let xymax = this.numNodes; // for square field

    // initialize trees as a 2D array
    this.trees = [];
    for (x = 0; x <= xymax; x++) {
      this.trees[x] = [];
    }
    // make a bunch of new trees
    for (x = 0; x <= xymax; x++) {
      for (y = 0; y <= xymax; y++) {
        this.trees[x][y] = new Tree(x,y);
      }
    }

    // SET AN IGNITION POINT
    this.trees[20][20].temperature = 600;

  }, // END of initialize()

  reset : function(){
    //
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.

    this.updateUIparams(); // this first, then set other values as needed

    this.initialize();

    // set state variables not set by updateUIparams() to initial settings

    // initialize local array to hold color-canvas data, e.g., space-time data -
    // plotter.initColorCanvasArray(numVars,numXpts,numYpts)
    this.colorCanvasData = plotter.initColorCanvasArray(1,this.numNodes,this.numNodes+1);

    // INITIALIZE array colorCanvasData
    // x = 0 is at left, xmax is at right of color canvas display
    // y = 0 is at top, ymax is at bottom
    let xymax = this.numNodes;
    for (let x = 0; x <= xymax; x++) {
      for (let y = 0; y <= xymax; y++) {
        this.colorCanvasData[0][x][y] = 0;
      }
    }

    // PLOT THIS
    plotter.plotColorCanvasPlot(0);

  }, // END reset method

  updateUIparams : function(){
    // nothing here
  }, // END updateUIparams

  changeWindSpeed : function(ws) {
    this.windSpeed = ws;
console.log('changeWindSpeed, ws = ' + ws);
  },

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

    // first, get rates of change of mass and temperature over field
    // at current state
    let xymax = this.numNodes;
    for (let x = 0; x <= xymax; x++) {
      for (let y = 0; y <= xymax; y++) {
        this.trees[x][y].updateRates(this.windSpeed);
      }
    }

    // second, update mass and temperature state
    for (let x = 0; x <= xymax; x++) {
      for (let y = 0; y <= xymax; y++) {
        this.trees[x][y].updateState();
      }
    }

  }, // end updateState method

  updateDisplay : function(){

    // update colorCanvasData array
    // x = 0 is at left, xmax is at right of color canvas display
    // y = 0 is at top, ymax is at bottom

    // check plotInfo[pnum]['varValueMax']

    let xymax = this.numNodes;
    for (let x = 0; x <= xymax; x++) {
      for (let y = 0; y <= xymax; y++) {
        // this.colorCanvasData[0][x][y] = this.trees[x][y].mass;
        this.colorCanvasData[0][x][y] = this.trees[x][y].temperature;
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

    let ssFlag = false;

    // // WARNING: this doesn't work, mass at corners doesn't go to zero
    // //    XXX   and T goes to NaN
    // //
    // // at least one of corners will be last to burn
    // let xymax = this.numNodes - 1;
    // let mCheck = this.trees[1][1].temperature +
    //              this.trees[1][xymax].temperature +
    //              this.trees[xymax][1].temperature +
    //              this.trees[xymax][xymax].temperature;
    // if (mCheck < 300){
    //   ssFlag = true;
    // }
    //
    // console.log('mCheck = ' + mCheck);
    // if (ssFlag == true) {console.log('at SS');}

    // WARNING: need to initialize  mtotOld at top this unit
    //
    // check mass left
    let xymax = this.numNodes;
    let mtot = 0;
    for (x = 0; x <= xymax; x++) {
      for (y = 0; y <= xymax; y++) {
        mtot += this.trees[x][y].mass;
      }
    }
    // console.log('mtot = ' + mtot);
    if (mtot == this.mtotOld){
      ssFlag = true;
    } else {
      this.mtotOld = mtot;
    }

    if (ssFlag == true) {interfacer.resetThisLab();}

    return ssFlag;
  } // END OF checkForSteadyState()

}; // END unit 0

class Tree {

  constructor(newX, newY) {
    // x = 0 is at left, xmax is at right of color canvas display
    // y = 0 is at top, ymax is at bottom
    this.x  = newX;
    this.y = newY;
    this.temperature = 300;
    this.mass = 10;
  } // END Tree constructor

  updateRates(windSpeed) {

    // constants
    // could make some variable through constructor arguments for faster testing
    const mbr = -2;  // kg/s, mass burn rate
    const u0 = 2000; // kJ/kg, combustible energy mass density
    const tempi = 310; // K, ignition temperature
    const cp = 1; // kJ/kg/K, mass heat capacity
    const alpha = 1e-9; // radiation coeffic
    const beta = 1e-1; // convection coeffic
    // need energy loss to atmosphere or get adiabatic system that never cools
    const gamma = 1e-2; // energy loss to atmosphere

    // BASE SET OF PARAMS
    //     const mbr = -2;  // kg/s, mass burn rate
    //     const u0 = 2000; // kJ/kg, combustible energy mass density
    //     const tempi = 310; // K, ignition temperature
    //     const cp = 1; // kJ/kg/K, mass heat capacity
    //     const alpha = 1e-9; // radiation coeffic
    //     const beta = 1e-1; // convection coeffic
    //     // need energy loss to atmosphere or get adiabatic system that never cools
    //     const gamma = 1e-2; // energy loss to atmosphere

    // update burn rate and mass
    if (this.temperature >= tempi && this.mass > 0) {
      this.dm_dt = mbr; // kg/s, mass burning rate
    } else {
      this.dm_dt = 0; // not ignited or no mass left
    }

    // scan neighbors and compute rate of temperature change, dtemp_dt
    let xymax = processUnits[0].numNodes;
    let xxx; // so don't modify loop var xx in loop!
    let yyy;
    let rr = 0; // radiant inputs accumulated below
    let cc = 0; // convective inputs accumulated below
    // just check 8 nearest neigbors for now and count corners equally
    for (let xx = this.x - 1; xx <= this.x + 1; xx++) {
      for (let yy = this.y - 1; yy <= this.y + 1; yy++) {
        // check if at boundaries
        // use zero-flux BC for now
        xxx = xx;
        yyy = yy;
        if (xxx < 0) {
          xxx = 1;
        } else if (xxx > xymax) {
          xxx = xymax - 1;
        }
        if (yyy < 0) {
          yyy = 1;
        } else if (yyy > xymax) {
          yyy = xymax - 1;
        }

        // add contribution of neighbor to convective input
        cc = cc + beta * (processUnits[0]['trees'][xxx][yyy].temperature - this.temperature);

        // fake wind alters convection in one direction
        let wind = (windSpeed / 2) * 40.00; // if gets too big will extinguish field (40.0 does near end)
        if ( xxx == (this.x - 1) && yyy == (this.y - 1) ) {
          cc = cc + wind * beta * (processUnits[0]['trees'][xxx][yyy].temperature - this.temperature);
        }

        // add contribution of neighbor to radiant input
        rr = rr + alpha * (processUnits[0]['trees'][xxx][yyy].temperature**4 -  this.temperature**4);

      } // END OF inner for repeat
    } // END OF outer for repeat

    this.dtemp_dt = (1/this.mass/cp) * ( rr + cc - u0 * this.dm_dt - gamma * (this.temperature - 300) );

  } // END OF class Ant updateRates method

  updateState() {

    // constants
    // could make some variable through constructor arguments for faster testing
    const dt = 3.0e-3; // s, time step
    // also see process_plot_info.js for graphic's min and max values
    const minT = 300;
    const maxT = 1000;

    // BASE SET OF PARAMS
    //    const dt = 3.0e-3; // s, time step

    this.mass = this.mass + this.dm_dt * dt;

    this.temperature = this.temperature + this.dtemp_dt * dt;

    if (this.temperature > maxT) {this.temperature = maxT;}

    // need this constraint or can get stable red-blue patterns
    // in center reminiscent of "game of life"
    if (this.mass <= 0) {
      this.mass = 0;
      this.temperature = minT;
    }

  } // END OF updateState method of class Ant
} // END OF class Ant definition
