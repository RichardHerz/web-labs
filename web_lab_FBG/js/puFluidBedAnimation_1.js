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
//    see class definition at bottom this file
//    used to construct new objects in processUnits[0].initialize() below
// ===================================================================

let puFluidBedAnimation_1 = {
  //
  unitIndex : 1, // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  name : 'Bed 1 Animation',

  plotIndex : 1, // see process_plot_info.js

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

  // DEFINE MAIN PARAMETERS
  // values will be set in method initialize()

  N : 0, // (d'less), number of particles to construct

  // define arrays to hold info for variables
  // these will be filled with values in method initialize()
  dataHeaders : [], // variable names
  dataInputs : [], // input field ID's
  dataUnits : [],
  dataMin : [],
  dataMax : [],
  dataDefault : [],
  dataValues : [],

  // define arrays to hold output variables
  // these will be filled with initial values in method reset()

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  // profileData : [], // for profile plots, plot script requires this name
  // stripData : [], // for strip chart plots, plot script requires this name
  colorCanvasData : [], // for color canvas plots, plot script requires this name
  origColorCanvasData : [], // save orig for clearing old object positions

  // allow this unit to take more than one step within one main loop step in updateState method
  // WARNING: see special handling for time step in this unit's updateInputs method
  unitStepRepeats : 1,
  unitTimeStep : simParams.simTimeStep / this.unitStepRepeats,

  // WARNING: IF INCREASE NUM NODES IN HEAT EXCHANGER BY A FACTOR THEN HAVE TO
  // REDUCE size of time steps FOR NUMERICAL STABILITY BY SQUARE OF THE FACTOR
  // AND INCREASE step repeats BY SAME FACTOR IF WANT SAME SIM TIME BETWEEN
  // DISPLAY UPDATES

  // define variables which will not be plotted nor saved in copy data table
  //   none here

  // WARNING: numNodes is accessed in process_plot_info.js
  numNodes : 100,

  ssCheckSum : 0, // used to check for steady state
  residenceTime : 0, // for timing checks for steady state check
  // residenceTime is set in this unit's updateUIparams()

  ants : [], // the little dot objects swarming around the arena

  // BOTH LINES BELOW WORK (Flanagan, 6.10.5, 7th ed., p. 149)
  // initialize : function() {
  initialize() {
    //
    let v = 0;
    this.dataHeaders[v] = 'N'; // number swarm objects
    this.dataInputs[v] = 'input_field_input';
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 200;
    this.dataDefault[v] = 200;
    //
    // END OF INPUT VARS
    // record number of input variables, varCount
    // used, e.g., in copy data to table
    //
    this.varCount = v;
    //
    // OUTPUT VARS
    //
    // v = 7;
    // this.dataHeaders[v] = 'Trxr';
    // this.dataUnits[v] =  'K';
    // // Trxr dataMin & dataMax can be changed in updateUIparams()
    // this.dataMin[v] = 200;
    // this.dataMax[v] = 500;
    //

    // make a bunch of new particles
    for (i = 0; i < this.N; i += 1) {
      // need initial x,y,dx,dy
      let xi = Math.round(this.numNodes*Math.random());
      let yi = Math.round(this.numNodes*Math.random());
      let dd = 4;
      // let dx = Math.round(-dd + 2 * dd * Math.random());
      // let dy = Math.round(-dd + 2 * dd * Math.random());
      // now allow decimal dx and dy to allow more angles of movement
      let dx = -dd + 2 * dd * Math.random();
      let dy = -dd + 2 * dd * Math.random();
      // NOTE: can get dx and/or dy = 0
      //        so get dead obj if both = 0 or move only in one direction
      //        reduce simParams.updateDisplayTimingMs to see this
      //        so can either check for 0's and set to 1 or
      //        repeat setting randomly until not 0
      this.ants[i] = new Particle_1(xi,yi,dx,dy);
    }

  }, // END of initialize()

  // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***

  reset : function(){
    //
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.

    this.updateUIparams(); // this first, then set other values as needed

    // SPECIAL this lab, need to initialize to get different
    // distribution of ants
    this.initialize();

    // set state variables not set by updateUIparams() to initial settings

    // initialize local array to hold color-canvas data, e.g., space-time data -
    // plotter.initColorCanvasArray(numVars,numXpts,numYpts)
    this.colorCanvasData = plotter.initColorCanvasArray(1,this.numNodes,this.numNodes+1);
    // also need to init the backup copy for clearing old object positions
    this.origColorCanvasData = plotter.initColorCanvasArray(1,this.numNodes,this.numNodes+1);

    // // SYMMETRICAL ABOUT BOTH TOP-LEFT TO BTM-RIGHT DIAGONAL AND
    // //     BTM-LEFT TO TOP-RIGHT DIAGONAL
    // // INITIALIZE array colorCanvasData
    // // x = 0 is at left, xmax is at right of color canvas display
    // // y = 0 is at top, ymax is at bottom
    // let xymax = this.numNodes;
    // let invxymax2 = 1/(xymax * xymax);
    // for (let x = 0; x <= xymax; x += 1) {
    //   for (let y = 0; y <= xymax; y += 1) {
    //     if (x < xymax - y) {
    //       this.colorCanvasData[0][x][y] = 100*(xymax-x)*(xymax-y)*invxymax2;
    //     } else {
    //       this.colorCanvasData[0][x][y] = 100*(x*y)*invxymax2;
    //     }
    //   }
    // }

    // SYMMETRICAL ABOUT TOP-LEFT TO BTM-RIGHT DIAGONAL ONLY
    // INITIALIZE array colorCanvasData
    // x = 0 is at left, xmax is at right of color canvas display
    // y = 0 is at top, ymax is at bottom
    let xymax = this.numNodes;
    let xymax2 = xymax * xymax;
    for (let x = 0; x <= xymax; x += 1) {
      for (let y = 0; y <= xymax; y += 1) {
        this.colorCanvasData[0][x][y] = 100*(x*y)/xymax2;
      }
    }

    // PLOT THIS
    plotter.plotColorCanvasPlot(this.plotIndex);

    // make backup copies so can clear old object positions
    // next line does not work because copy not made...
    //    this.origColorCanvasData = this.colorCanvasData;
    // since they are still the same object
    // so need to initialize all elements separately
    for (let x = 0; x <= this.numNodes; x += 1) {
      for (let y = 0; y <= this.numNodes; y += 1) {
        this.origColorCanvasData[0][x][y] = this.colorCanvasData[0][x][y];
      }
    }

  }, // END reset method

  updateUIparams : function(){
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
    // note: this.dataValues.[pVar]
    //   is only used in copyData() to report input values
    //
    let unum = this.unitIndex;
    //
    this.N = this.dataValues[0] = interfacer.getInputValue(unum,0);

    this.N = 200; // xxx <<< was 200

  }, // END updateUIparams

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

    // have one adjustable param from HTML UI at this point, N

    for (let i = 0; i < this.N; i += 1) {
      this.ants[i].move();
    }

  }, // end updateState method

  updateDisplay : function(){

    // update colorCanvasData array
    // x = 0 is at left, xmax is at right of color canvas display
    // y = 0 is at top, ymax is at bottom

    if (plotInfo[0]['type'] == 'canvas') {

      // WARNING: if plot type is canvas, then plotting of entire array
      // will be done by controller updateState and overwrite any plotting here
      // if plot type is not canvas (nor profile, strip), then
      // will use and keep plotting here and not replot in controller

      // WARNING: DO EACH TRANSFER IN A SEPARATE REPEAT OR
      //          CAN GET EXTRA, DEAD MARKED CELLS AFTER TWO OBJECTS SIT
      //          ON SAME CELL - THESE DEAD CELLS PERSIST UNTIL
      //          AN OBJECT PASSES OVER

      for (let i = 0; i < this.N; i += 1) {
        // reset old positions to original values in current array
        let x = this.ants[i].oldXi;
        let y = this.ants[i].oldYi;
        this.colorCanvasData[0][x][y] = this.origColorCanvasData[0][x][y];
      }

      for (let i = 0; i < this.N; i += 1) {
        // mark new positions in current array
        let x = this.ants[i].xi;
        let y = this.ants[i].yi;
        this.colorCanvasData[0][x][y] = 100;
      }

    } else {

      // plot type is NOT canvas (nor profile, strip), so now
      // will use and keep plotting here and not replot in controller

      // need to repeat steps here and not put outside IF because
      // have to be done in correct order and mark new positions after
      // old positions marked negative

      for (let i = 0; i < this.N; i += 1) {
        // reset old positions to original values in current array
        // but now mark with NEGATIVE number to show it should be replotted
        // without "small" pixels
        let x = this.ants[i].oldXi;
        let y = this.ants[i].oldYi;
        this.colorCanvasData[0][x][y] = - this.origColorCanvasData[0][x][y];
      }

      for (let i = 0; i < this.N; i += 1) {
        // mark new positions in current array
        let x = this.ants[i].xi;
        let y = this.ants[i].yi;
        this.colorCanvasData[0][x][y] = 100;
      }

      // if plot type is not canvas and use plotter.plotColorCanvasPixelList()
      // then save oldXi, xi, oldYi, yi
      // so pixel list plotter only has to replot those elements
      let xLocArray = [];
      let yLocArray = [];
      for (let i = 0; i < this.N; i += 1) {
        xLocArray.push(this.ants[i].oldXi);
        yLocArray.push(this.ants[i].oldYi);
        xLocArray.push(this.ants[i].xi);
        yLocArray.push(this.ants[i].yi);
      }

      // plotter.plotColorCanvasPixelList uses colorCanvasData
      // last (4th) input argument is "small" and set to 1 (true) for replotting
      // 1 pixel inside on all sides because of ghosting of old marked ants
      // (requires orig pixels to be at least 3x3)
      plotter.plotColorCanvasPixelList(0,xLocArray,yLocArray,1);

      // change negative elements at old positions (with original but negative
      // value) back to original positive values
      // but DOUBLE-CHECK they are negative so don't change a new object
      // placed at another object's old location
      for (let i = 0; i < this.N; i += 1) {
        let x = this.ants[i].oldXi;
        let y = this.ants[i].oldYi;
        if (this.colorCanvasData[0][x][y] < 0) {
          this.colorCanvasData[0][x][y]  = - this.colorCanvasData[0][x][y];
        }
      }

    } // END if (plotInfo[0]['type'] == 'canvas')

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
    // NOTE: this is the only unit, so return false
    let ssFlag = false;
    return ssFlag;
  } // END OF checkForSteadyState()

} // END process unit

class Particle_1 {

  constructor(newX, newY, newDX, newDY) {
    // x = 0 is at left, xmax is at right of color canvas display
    // y = 0 is at top, ymax is at bottom
    // 1st 4 can be decimal to allow for more movement angles
    this.x  = newX;
    this.y = newY;
    this.dx = newDX;
    this.dy = newDY;
    this.xi = newX;
    this.yi = newY;
    this.oldXi = newX;
    this.oldYi = newY;
  } // END constructor

  // 2nd 4 must be integer for colorCanvasData array indexes
  // need to do rounding here because need to save old x,y to
  // clear old position on color canvas display

  // NOTE: this does NOT work here >>  this.move = function() {
  move() {

    let xmax = processUnits[0].numNodes;
    let ymax = -1 + processUnits[0].numNodes;
    // save current position so can clear it on color canvas display
    this.oldXi = this.xi;
    this.oldYi = this.yi;
    // update x and y
    let xnew = this.x + this.dx;
    // xxx add to dy to get all to fall toward bottom <<<<
    // let ynew = this.y + this.dy;
    let ynew = this.y + this.dy + -5 * Math.random();
    // bounce if hit walls
    // here specular reflection - real ants may not do this!
    if (xnew > xmax) {
      xnew = 2 * xmax - xnew;
      this.dx = -this.dx; // reverse direction
    } else if (xnew < 0) {
      xnew = -xnew;
      this.dx = -this.dx; // reverse direction
    }
    this.x = xnew;
    if (ynew > ymax) {
      // xxx send back into top <<<
      ynew = 2*ymax - ynew;
      this.dy = -this.dy; // reverse direction
      // ynew = 0; // xxx
    } else if (ynew < 0) {
      // xxx send back into bottom <<<
      // ynew = -ynew;
      // this.dy = -this.dy; // reverse direction
      ynew = ymax; // xxx
    }
    this.y = ynew;
    // floor to integer for array indexes since allow decimal dx and dy
    this.xi = Math.floor(this.x);
    this.yi = Math.floor(this.y);
  } // END this move method
} // END OF class definition
