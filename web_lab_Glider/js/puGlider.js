function puGlider(pUnitIndex) {
  // constructor function for process unit
  //
  // for other info shared with other units and objects, see public properties
  // and search for controller. & interfacer. & plotter. & simParams. & plotInfo

  // *******************************************
  //  define INPUT CONNECTIONS from other units
  // *******************************************

  // define variables that are to receive input values from other units
  //   none here

  this.updateInputs = function() {
    // none here
  } // END of updateInputs() method

  // *******************************************
  //  define OUTPUT CONNECTIONS to other units
  // *******************************************

  // none here

  // *******************************************
  //        define PRIVATE properties
  // *******************************************

  const unitIndex = pUnitIndex; // index of this unit as child in parent object processUnits
  // unitIndex may be used in this unit's updateUIparams method
  // allow this unit to take more than one step within one main loop step in updateState method
  const unitStepRepeats = 1;
  let unitTimeStep = simParams.simTimeStep / unitStepRepeats;

  const gravity = 9.8; // (m/s2), // used in updateState & updateDisplay
  const pi = Math.PI; // used in reset & updateState
  const degTOrad = Math.PI / 180; // used in updateUIparams

  let gliderSpeed = 0; // (m/s), in 2D, xy plane
  let windSpeed = 0; // (m/s), wind flow is horizontal
  let airSpeed = 0; // (m/s), apparent wind speed
  let angleDeg = 0; // (degree), attack angle
  let angle = 0; // (radian), attack angle
  let liftFac = 0; // lift factor
  let dragFac = 0; // drag factor

  // // THIS UNIT ALSO HAS A CHECKBOX INPUT
  // let inputCheckBoxVectors = "checkbox_vec";
  // // THIS UNIT ALSO HAS A DISPLAY FIELD FOR simTime
  // let displayTimeField = "field_time";

  // *******************************************
  //         define PUBLIC properties
  // *******************************************

  this.name = 'process unit Glider'; // used by interfacer.copyData()
  this.residenceTime = 10; // used by controller.checkForSteadyState()

  // define arrays to hold data for plots, color canvas
  // these arrays will be used by plotter object
  // these will be filled with initial values in method reset
  //
  // this.profileData = []; // for profile plots, plot script requires this name
  // this.stripData = []; // for strip chart plots, plot script requires this name
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
    // let v = 0;
    // this.dataHeaders[v] = 'velocity';
    // this.dataInputs[v] = 'input_field_initial_velocity';
    // this.dataUnits[v] = 'm/s';
    // this.dataMin[v] = -10;
    // this.dataMax[v] = 10;
    // this.dataDefault[v] = 1;
    // //
    // v = 1;
    // this.dataHeaders[v] = 'angle';
    // this.dataInputs[v] = "input_field_theta";
    // this.dataUnits[v] = 'degree';
    // this.dataMin[v] = -180;
    // this.dataMax[v] = 180;
    // this.dataDefault[v] = 90;
    //
    // END OF INPUT VARS
    // record number of input variables, varCount
    // used, e.g., in copy data to table
    //
    this.varCount = v;
    //
    // OPTIONAL - add entries for output variables if want to use min-max to
    //            constrain values in updateState or dimensional units in plotInfo
    //
  } // END of initialize method

  this.reset = function() {
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.

    this.updateUIparams(); // this first, then set other values as needed

    // set state variables not set by updateUIparams to initial settings

    // update display
    this.updateDisplay();

  } // END of reset method

  this.updateUIparams = function() {
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();

    // check input fields for new values
    // function getInputValue is defined in file process_interfacer.js
    // getInputValue(unit # in processUnits object, variable # in dataInputs array)
    // see variable numbers above in initialize
    // note: this.dataValues.[pVar]
    //   is only used in copyData to report input values

    let unum = unitIndex;
    // velocity = this.dataValues[0] = interfacer.getInputValue(unum, 0);
    // angleDeg = this.dataValues[1] = interfacer.getInputValue(unum, 1);
    // fricFrac = this.dataValues[2] = interfacer.getInputValue(unum, 2);

  } // END of updateUIparams method

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

    // I am using static 2D cartesian frame of reference
    // at each time step update x & y components of position, speed, forces, etc.
    // and check for conditions to turn, which would change signs
    // for each x and y d_dt, consider: speed, drag, lift, and gravity
    // drag and lift are varying forces (kg-m/s2) = mass (kg) * accel (m/s2)
    // gravity is a constant acceleration (d2y/dt2, m/s2)
    //
    // SEE MY ZOTERO REF: Numerical integration in dynamic soaring...
    // new_velocity = old_velocity + acceleration * delta_time;
    // new_position = position + new_velocity * delta_time;
    //
    // LIFT & DRAG FORCES are functions of angle of attack with respect
    //   to the apparent wind direction, where Vair is apparent air speed
    // FORCE = coeffic * Area * 0.5 * fluid_density * Vair^2
    //
    // u here is magnitude (speed) of glider velocity vector in x,y space
    // zero angle points along x-axis to right, with positive angle CCW
    // alpha is angle of direction of glider in x,y space
    // beta is 180 - alpha in degrees here
    // y-length of glider speed vector = u * sin(beta), x-length = u * cos(beta)
    // Tw is magnitude of true wind, whose direction is always zero degrees here
    // Aw is magnitude of apparent wind at glider...
    //   which should be glider's airspeed
    // 180 - gamma is angle of apparent wind
    // beta - gamma is angle of attack of glider to apparent wind
    // x0 and y0 is current glider location
    // gamma = arctan( (y0 + u*sin(beta)) / (Tw + (x0 - u*cos(beta)) )
    // Aw = (y0 + u*sin(beta)) / sin(gamma)
    //
    // call functions to get lift and drag coeff's using beta-gamma attack angle
    // from square of airspeed Aw^2 and coeff's, get lift and drag forces
    // these are vectors relative to the glider's body, so need to get x,y components
    //



    // ====== OLD BELOW FROM PENDULUM LAB ==========
    // accel = gravity * Math.sin(-angle);
    // let newVelocity = velocity + accel * unitTimeStep;
    // // apply friction
    // let friction = fricFrac * velocity;
    // newVelocity = newVelocity - friction * unitTimeStep;
    //
    // let angularVelocity = velocity * radius; // (radian/s)
    // let newAngle = angle + angularVelocity * unitTimeStep;
    //
    // // correct angle if pendulum goes past top in CCW direction
    // if (newAngle > pi) {
    //   newAngle = -pi + newAngle % pi;  // % is JS modulo operator,
    // }
    //
    // // update current values
    // angle = newAngle;
    // velocity = newVelocity;

  } // END of updateState method

  this.updateDisplay = function() {

    // UNDER DEVELOPMENT

  } // END of updateDisplay method

  this.updateDisplayPENDULUM = function() {

    document.getElementById(displayTimeField).innerHTML =  controller.simTime.toFixed(2);

    const pixPerMeter = 200; // (px/m)
    const rpix = radius * pixPerMeter; // (px), pixel length of rod-radius
    const xc = 300; // (px), x location of center of rotation
    const yc = 300; // 250; // (px), y location of center of rotation

    // coordinates for bobANDrod
    let x = xc + rpix * Math.sin(angle);
    let y = yc + rpix * Math.cos(angle);

    // coordinates for velocVector
    let pixFac = 0.15;
    let xv = x + pixFac * pixPerMeter * velocity * Math.cos(angle);
    let yv = y - pixFac * pixPerMeter * velocity * Math.sin(angle);
    // velocVector is x,y to xv,yv

    // coordinates for accelVector
    pixFac = 0.05;
    let xa = x + pixFac * pixPerMeter * accel * Math.cos(angle);
    let ya = y - pixFac * pixPerMeter * accel * Math.sin(angle);
    // accelVector is x,y to xa,ya

    // coordinates for accelVectorDown
    //   component of tangential accel that is gravity pulling down
    let tDownY = y + pixFac * pixPerMeter * gravity;
    // accelVectorDown is x,y to x,tDownY

    // coordinates for accelVectorRod
    //   component of tangential accel that is rod holding bob (radial accel)
    //   with rod in tension when bob below horizontal and
    //   rod in compression when bob above horizontal
    let tRod = gravity * Math.cos(angle);
    let dX = pixFac * pixPerMeter * (tRod * Math.sin(angle));
    let dY = pixFac * pixPerMeter * (tRod * Math.cos(angle));
    // accelVectorRod is x,y to x-dX,y-dY

    // Set new vector positions
    //   bobANDrod is xc,yc to x,y
    //   velocVector is x,y to xv,yv
    //   accelVector is x,y to xa,ya
    //   accelVectorDown is x,y to x,tDownY
    //   accelVectorRod is x,y to x-dX,y-dY

    // http://tutorials.jenkov.com/svg/

    let svgElement = document.getElementById("bobANDrod");
    let xs = xc;
    let xe = x;
    let ys = yc;
    let ye = y;
    svgElement.setAttribute("d", "M" + xs + "," + ys + " L" + xe + "," + ye );

    svgElement = document.getElementById("velocVector");
    xs = x;
    xe = xv;
    ys = y;
    ye = yv;
    svgElement.setAttribute("d", "M" + xs + "," + ys + " L" + xe + "," + ye );

    svgElement = document.getElementById("accelVector");
    xs = x;
    xe = xa;
    ys = y;
    ye = ya;
    svgElement.setAttribute("d", "M" + xs + "," + ys + " L" + xe + "," + ye );

    svgElement = document.getElementById("accelVectorDown");
    xs = x;
    xe = x;
    ys = y;
    ye = tDownY;
    svgElement.setAttribute("d", "M" + xs + "," + ys + " L" + xe + "," + ye );

    svgElement = document.getElementById("accelVectorRod");
    xs = x;
    xe = x-dX;
    ys = y;
    ye = y-dY;
    svgElement.setAttribute("d", "M" + xs + "," + ys + " L" + xe + "," + ye );

  } // END of updateDisplayPENDULUM method

  this.checkForSteadyState = function() {
    // required - called by controller object
    // returns ssFlag, true if this unit at SS, false if not
    // *IF* NOT used to check for SS *AND* another unit IS checked,
    // which can not be at SS, *THEN* return ssFlag = true to calling unit
    // HOWEVER, if this unit has UI inputs, need to be able to return false

    let ssFlag = false;

    // // need narrow ranges for this check, not == 0
    // // do not check at the top, unstable SS
    // let mmax = 0.0001;
    // let mmin = -mmax;
    // if ((angle > mmin) && (angle < mmax)) {
    //   if ((velocity > mmin) && (velocity < mmax)) {
    //     if ((accel > mmin) && (accel < mmax)) {
    //       ssFlag = true;
    //       // console.log('SS zeroed, ssFlag to true');
    //     }
    //   }
    // }

    // if (ssFlag == false) {
    //   console.log('SS not zeroed');
    //   console.log('angle, veloc, accel = ' +angle+ ', ' +velocity+ ', '+accel);
    // }

    return ssFlag;
  } // END of checkForSteadyState method

} // END of puPendulum
