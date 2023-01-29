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

  // COORDINATE AND ANGLE SYSTEM
  // 2D x,y coordinates, positive y is up, positive x points downwind to right
  // zero angle points toward positive x at zero y
  // positive angle is CCW

  // HERE DELCARE CONSTANTS & VARIABLES WE WISH TO CARRY BETWEEN UPDATES

  // NOTE - COMPUTE FOR POSITIVE VERTICAL COORDINATE y POINTING UP
  // THEN TRANSFORM FOR SCREEN VERTICAL COORD POINTING DOWN IN updateDisplay

  const gravity = -9.8; // (m/s2)
  const pi = Math.PI; // used in reset & updateState
  const degTOrad = Math.PI / 180; // used in updateUIparams

  const wingArea = 1; // (m2)
  const gliderMass = 1; // (kg)
  const airDens = 1.2; // (kg/m3), https://en.wikipedia.org/wiki/Density_of_air

  let windProfileOption = 0;
  let gliderSpeed = 1; // (m/s), magnitude of glider velocity vector
  let gliderAngle = 0.9 * pi; // (rad), CCW angle of glider from x axis
  let yGliderLoc = 30; // (m), glider altitude
  let xGliderLoc = 30; // (m), glider ground position

  // // THIS UNIT ALSO HAS A CHECKBOX INPUT
  // let inputCheckBoxVectors = "checkbox_vec";
  // THIS UNIT ALSO HAS A DISPLAY FIELD FOR simTime
  let displayTimeField = "field_time";

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
    // this.varCount = v;
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

    // WARNING: DOUBLE-CHECK ANGLE SIGNS AND VECTOR DIRECTIONS!!

    // https://www.embibe.com/exams/scalene-triangle-formula/

    // gliderAngle is angle of glider heading relative to coordinate system
    // downwind heading is -pi/2 <= gliderAngle <= pi/2
    // upwind heading is pi/2 <= gliderAngle <= -pi/2
    // angle of true wind = zero relative to coordinate system & constant

    // ensure gliderAngle between 0 and 2*pi
    if (gliderAngle < 0) {
      gliderAngle = gliderAngle + 2 * pi;
    } else if (gliderAngle > (2 * pi)) {
      gliderAngle = gliderAngle - 2 * pi;
    }

    // get quadrant into which glider points
    let quad;
    if (gliderAngle >= 0 && gliderAngle < 0.5*pi ) {
      quad = 1;
    } else if (gliderAngle >= 0.5*pi && gliderAngle < pi) {
      quad = 2;
    } else if (gliderAngle >= pi && gliderAngle < 1.5*pi) {
      quad = 3;
    } else if (gliderAngle >= 1.5*pi && gliderAngle < 0) {
      quad = 4;
    }

    let attackAngle;
    let appWindSpeed;
    let alpha;
    let beta;
    let tanAlpha;
    let xV;
    let yV;
    let xGliderSpeed;
    let yGliderSpeed;

    let trueWindSpeed = this.getTrueWindSpeed(yGliderLoc, windProfileOption);

    // SEE FOR APPARENT WIND
    //     https://www.sailbetter.com/apparent-wind/
    //     http://www.phys.unsw.edu.au/~jw/sailing.html

    // MY VECTOR CONSTRUCTION follows that in https://www.sailbetter.com/apparent-wind/
    //    is to put heat of V (gliderSpeed vector) or "boat speed WIND" to head of glider
    //    then head of W (trueWindSpeed vector) to tail of V
    //    then tail of A (apparent wind vector) at tail of W to A head at head of glider

    // VECTOR CONSTRUCTION in http://www.phys.unsw.edu.au/~jw/sailing.html
    //    is to put tail of V or "boat speed" to head of glider
    //    then put tail of W at tail of V
    //    then A tail at head of V to A head at head of W

    // BOTH CONSTRUCTIONS RESULT IN THE SAME APPARENT WIND VECTOR

    // >>> WARNING: these might only work for glider speed xV > wind speed <<<

    // for now at least, handle each direction quadrant separately
    // then look for similarities which may allow combining some or all
    //
    // angle beta such that both sin and cos > 0 but
    // x and y glider speed components may be < 0, so adjust for each quad
    // and xV and yV should be > 0 for my vector construction
    //
    switch (quad) {
      case 1:
        beta = gliderAngle;
        xGliderSpeed = gliderSpeed * Math.cos(beta); // should be + x direction
        yGliderSpeed = gliderSpeed * Math.sin(beta); // should be + y direction
        xV = Math.abs(xGliderSpeed);
        yV = Math.abs(yGliderSpeed);
        tanAlpha = yV / (xV - trueWindSpeed);
        alpha = Math.atan(tanAlpha); // alpha = beta + attackAngle
        attackAngle = alpha - beta;
        break;
      case 2:
        beta = pi - gliderAngle;
        xGliderSpeed = gliderSpeed * Math.cos(beta) * -1; // should be - x direction
        yGliderSpeed = gliderSpeed * Math.sin(beta); // should be + y direction
        xV = Math.abs(xGliderSpeed);
        yV = Math.abs(yGliderSpeed);
        tanAlpha = yV / (xV + trueWindSpeed);
        alpha = Math.atan(tanAlpha); // alpha = beta - attackAngle
        attackAngle = beta - alpha;
        break;
      case 3:
        beta = gliderAngle - pi;
        xGliderSpeed = gliderSpeed * Math.cos(beta) * -1; // should be - x direction
        yGliderSpeed = gliderSpeed * Math.sin(beta) * -1; // should be - y direction
        xV = Math.abs(xGliderSpeed);
        yV = Math.abs(yGliderSpeed);
        tanAlpha = yV / (xV + trueWindSpeed);
        alpha = Math.atan(tanAlpha); // alpha = beta - attackAngle
        attackAngle = beta - alpha;
        break;
      case 4:
        beta = 2 * pi - gliderAngle;
        xGliderSpeed = gliderSpeed * Math.cos(beta); // should be + x direction
        yGliderSpeed = gliderSpeed * Math.sin(beta) * -1; // should be - y direction
        xV = Math.abs(xGliderSpeed);
        yV = Math.abs(yGliderSpeed);
        tanAlpha = yV / (xV - trueWindSpeed);
        alpha = Math.atan(tanAlpha); // alpha = beta + attackAngle
        attackAngle = alpha - beta;
        break;
      default:
        // code block
    }
    appWindSpeed = yV / Math.sin(alpha);

    // call functions to get lift and drag coeff's using attack angle
    // then from square of airspeed Aw^2 and coeff's, get lift and drag forces
    // these are vectors relative to the glider's body, so need to get x,y components
    //
    let tempFactor = 0.5 * wingArea * airDens * appWindSpeed**2;
    let liftForce = tempFactor * this.getLiftCoeff(attackAngle);
    let dragForce = tempFactor * this.getDragCoeff(attackAngle);
    //
    // now need to get x and y components of these vectors
    // lift is normal to glider direction, drag parallel to glider direction
    //

    let xLiftForce; // (kg-m/s2)
    let yLiftForce;
    let xDragForce;
    let yDragForce;
    switch (quad) {
      case 1:
        beta = gliderAngle;
        xLiftForce = liftForce * Math.sin(beta) * -1; // should be - x direction
        yLiftForce = liftForce * Math.cos(beta); // should be + y direction
        xDragForce = dragForce * Math.cos(beta) * -1; // should be - x direction
        yDragForce = dragForce * Math.sin(beta) * -1; // should be - y direction
        break;
      case 2:
        beta = pi - gliderAngle;
        xLiftForce = liftForce * Math.sin(beta); // should be + x direction
        yLiftForce = liftForce * Math.cos(beta); // should be + y direction
        xDragForce = dragForce * Math.cos(beta); // should be + x direction
        yDragForce = dragForce * Math.sin(beta) * -1; // should be - y direction
        break;
      case 3:
        beta = gliderAngle - pi;
        xLiftForce = liftForce * Math.sin(beta) * -1; // should be - x direction
        yLiftForce = liftForce * Math.cos(beta); // should be + y direction
        xDragForce = dragForce * Math.cos(beta); // should be + x direction
        yDragForce = dragForce * Math.sin(beta); // should be + y direction
        break;
      case 4:
        beta = 2 * pi - gliderAngle;
        xLiftForce = liftForce * Math.sin(beta); // should be + x direction
        yLiftForce = liftForce * Math.cos(beta); // should be + y direction
        xDragForce = dragForce * Math.cos(beta) * -1; // should be - x direction
        yDragForce = dragForce * Math.sin(beta); // should be + y direction
        break;
      default:
        // code block
    }

    // force (kg-m/s2) = gliderMass (kg) * acceleration (m/s2)
    // acceleration = force / gliderMass

    let xLiftAccel = xLiftForce / gliderMass; // (m/s2)
    let yLiftAccel = yLiftForce / gliderMass;
    let xDragAccel = xDragForce / gliderMass;
    let yDragAccel = yDragForce / gliderMass;
    let xGravAccel = 0;
    let yGravAccel = 0.1 * gravity; // xxx

    // STEP IN TIME TO UPDATE SPEED, LOCATION AND ANGLE
    // See my Zotero ref: Numerical integration in dynamic soaring...
    // new_velocity = old_velocity + acceleration * delta_time;
    // new_position = position + new_velocity * delta_time;
    let gliderSpeed_OLD = gliderSpeed; // for diagnostic reporting
    let xGliderSpeed_OLD = xGliderSpeed;
    let yGliderSpeed_OLD = yGliderSpeed;
    let xSpeedDelta = (xLiftAccel + xDragAccel + xGravAccel) * unitTimeStep;
    let ySpeedDelta = (yLiftAccel + yDragAccel + yGravAccel) * unitTimeStep;
    xGliderSpeed = xGliderSpeed + xSpeedDelta;
    yGliderSpeed = yGliderSpeed + ySpeedDelta;
    gliderSpeed = Math.sqrt(xGliderSpeed**2 + yGliderSpeed**2);

    let xLocDelta = xGliderSpeed * unitTimeStep;
    let yLocDelta = yGliderSpeed * unitTimeStep;
    xGliderLoc = xGliderLoc + xLocDelta;
    yGliderLoc = yGliderLoc + yLocDelta;

if (controller.simTime > 0) {
    console.log('------------------------');
    console.log('simTime = ' + controller.simTime);
    console.log('gliderAngle = ' + gliderAngle);
    console.log('quad = ' + quad);
    console.log('xV = ' + xV);
    console.log('yV = ' + yV);
    console.log('beta = ' + beta);
    console.log('alpha = ' + alpha);
    console.log('attackAngle = ' + attackAngle);
    console.log('trueWindSpeed = ' + trueWindSpeed);
    console.log('appWindSpeed = ' + appWindSpeed);
    console.log('liftForce = ' + liftForce);
    console.log('xLiftForce = ' + xLiftForce);
    console.log('yLiftForce = ' + yLiftForce);
    console.log('dragForce = ' + dragForce);
    console.log('xDragForce = ' + xDragForce);
    console.log('yDragForce = ' + yDragForce);

    console.log('gliderSpeed_OLD = ' + gliderSpeed_OLD);
    console.log('xGliderSpeed_OLD = ' + xGliderSpeed_OLD);
    console.log('yGliderSpeed_OLD = ' + yGliderSpeed_OLD);

    console.log('xSpeedDelta = ' + xSpeedDelta);
    console.log('ySpeedDelta = ' + ySpeedDelta);

    console.log('gliderSpeed = ' + gliderSpeed);
    console.log('xGliderSpeed = ' + xGliderSpeed);
    console.log('yGliderSpeed = ' + yGliderSpeed);
    console.log('xLocDelta = ' + xLocDelta);
    console.log('yLocDelta = ' + yLocDelta);
    console.log('xGliderLoc = ' + xGliderLoc);
    console.log('yGliderLoc = ' + yGliderLoc);
}

    // *** TO DO - need user-controlled elevators for attack angle adjustment ***

  } // END of updateState method

  this.getTrueWindSpeed = function(pAltitude,pOption) {
    // need different option cases
    // miles per hour number approx double m/s number
    let wind = 0.2 ; // + 0.1 * pAltitude; // (m/s)
    return wind;
  } // END of getTrueWindSpeed

  this.getLiftCoeff = function(pAttackAngle) {
    let liftCoeff = 0.3;
    return liftCoeff;
  } // END of getLiftCoeff

  this.getDragCoeff = function(pAttackAngle) {
    let dragCoeff = 0.1;
    return dragCoeff;
  } // END of getDragCoeff

  this.updateDisplay = function() {

    document.getElementById(displayTimeField).innerHTML =  controller.simTime.toFixed(2);

    // https://jenkov.com/tutorials/svg/path-element.html

    const pixPerMeter = 10; // (px/m)

    const y0 = 0; // (px), y location of y = 0
    const x0 = 0; // (px), x location of x = 0

    // coordinates for glider
    let xs = x0 + xGliderLoc * pixPerMeter; // (px)
    let ys = y0 + yGliderLoc * pixPerMeter;

    // NOTE - y COMPUTED ABOVE FOR POSITIVE VERTICAL COORDINATE POINTS UP
    //        NOW TRANSFORM BELOW FOR SVG VERTICAL COORDINATE POINTING DOWN
    // yHeight = height in index's <svg id="svg_glider" width="600" height="600">
    const yHeight = 600; // (px)
    ys = yHeight - ys;

    svgElement = document.getElementById("glider");
    // with lowercase "el" lxe,ye is relative to path start at xs,ys
    // compute ending xe,ye with gliderAngle
    // use constants during development
    let xe = 10;
    let ye = 10;
    svgElement.setAttribute("d", "M" + xs + "," + ys + " l" + xe + "," + ye );

  } // END of updateDisplay method

  this.checkForSteadyState = function() {
    // required - called by controller object
    // returns ssFlag, true if this unit at SS, false if not
    // *IF* NOT used to check for SS *AND* another unit IS checked,
    // which can not be at SS, *THEN* return ssFlag = true to calling unit
    // HOWEVER, if this unit has UI inputs, need to be able to return false

    let ssFlag = false;

    // // // BELOW FROM PENDULUM AS EXAMPLE
    // // //
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
