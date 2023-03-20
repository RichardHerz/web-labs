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
  let ssCheckSum = 0; // used in checkForSteadyState method

  // COORDINATE AND ANGLE SYSTEM
  // 2D x,y coordinates, positive y is up, positive x points downwind to right
  // zero angle points toward positive x at zero y
  // positive angle is CCW

  // HERE DECLARE CONSTANTS & VARIABLES WE WISH TO CARRY BETWEEN UPDATES

  // NOTE - COMPUTE FOR POSITIVE VERTICAL COORDINATE y POINTING UP
  // THEN TRANSFORM FOR SCREEN VERTICAL COORD POINTING DOWN IN updateDisplay

  const gravity = -9.8; // (m/s2)
  const pi = Math.PI; // used in reset & updateState
  const degTOrad = Math.PI / 180; // used in updateUIparams
  const radTOdeg = 180 / Math.PI; // used in updateUIparams

  const wingArea = 1; // (m2)
  const gliderMass = 4; // (kg)
  const airDens = 1.2; // (kg/m3), https://en.wikipedia.org/wiki/Density_of_air

  let windProfileOption = 0;
  let gliderSpeed = 16; // (m/s), magnitude of glider velocity vector
  let gliderAngle = 0.95 * pi; // (rad), CCW angle of glider from x axis
  let yGliderLoc = 50; // (m), glider altitude
  let xGliderLoc = 30; // (m), glider ground position

  // CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS
  let displayTimeField = 'field_time';
  let thisGliderAngleSliderID = 'range_setGliderAngle_slider';
  let thisGliderAngleFieldID = 'input_setGliderAngle_value';

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

  // *****************************************
  //         define PRIVATE functions
  // *****************************************

  // *****************************************
  //        define PRIVILEGED methods
  // *****************************************

  this.initialize = function() {

    // console.log('enter this.initialize, this unitIndex = ' + unitIndex); // xxx

    //
    // ADD ENTRIES FOR UI PARAMETER INPUTS FIRST, then output vars below
    //
    let v = 0;
    this.dataHeaders[v] = 'Glider Angle';
    this.dataInputs[v] = thisGliderAngleSliderID;
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 2;
    this.dataDefault[v] = 0.8;
    //
    v = 1;
    this.dataHeaders[v] = 'Glider Angle';
    this.dataInputs[v] = thisGliderAngleFieldID;
    this.dataUnits[v] = '';
    this.dataMin[v] = 0;
    this.dataMax[v] = 2;
    this.dataDefault[v] = 0.8;
    //
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

  } // END of initialize()

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

  this.updateUIparams = function(){

  // console.log('enter this.updateUIparams, this unitIndex = ' + unitIndex); // xxx

    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();
    // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
    ssCheckSum = 1;

    this.updateUIgliderAngle();

  } // END updateUIparams

  this.updateState = function() {

    if (yGliderLoc <= 0) {
      interfacer.resetThisLab();
      return;
    }

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
    let quad = 0;
    if (gliderAngle >= 0 && gliderAngle < 0.5*pi ) {
      quad = 1;
    } else if (gliderAngle >= 0.5*pi && gliderAngle < pi) {
      quad = 2;
    } else if (gliderAngle >= pi && gliderAngle < 1.5*pi) {
      quad = 3;
    } else if (gliderAngle >= 1.5*pi && gliderAngle <= 2*pi) {
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
      console.log('in set speed and attack, bad quad = ' + quad);
    }

    // prevent divide by zero in calculation of appWindSpeed
    // which can happen at gliderAngle = 0 or pi
    if (Math.sin(alpha) > 0) {
      appWindSpeed = yV / Math.sin(alpha);
    } else {
      if (quad == 1 || quad == 4) {
        appWindSpeed = gliderSpeed - trueWindSpeed;
      } else if (quad == 2 || quad == 3) {
        appWindSpeed = gliderSpeed + trueWindSpeed;
      }
    }

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
      console.log('in set Lift and Drag, bad quad = ' + quad);
    }

    // force (kg-m/s2) = gliderMass (kg) * acceleration (m/s2)
    // acceleration = force / gliderMass

    let xLiftAccel = xLiftForce / gliderMass; // (m/s2)
    let yLiftAccel = yLiftForce / gliderMass;
    let xDragAccel = xDragForce / gliderMass;
    let yDragAccel = yDragForce / gliderMass;
    let xGravAccel = 0;
    let yGravAccel = gravity;

    // STEP IN TIME TO UPDATE SPEED, LOCATION AND ANGLE
    // See my Zotero ref: Numerical integration in dynamic soaring...
    // new_velocity = old_velocity + acceleration * delta_time;
    // new_position = position + new_velocity * delta_time;

    // _OLD for diagnostic reporting
    let gliderSpeed_OLD = gliderSpeed;
    let xGliderSpeed_OLD = xGliderSpeed;
    let yGliderSpeed_OLD = yGliderSpeed;

    let xSpeedDelta = (xLiftAccel + xDragAccel + xGravAccel) * unitTimeStep;
    let ySpeedDelta = (yLiftAccel + yDragAccel + yGravAccel) * unitTimeStep;
    xGliderSpeed = xGliderSpeed + xSpeedDelta;
    yGliderSpeed = yGliderSpeed + ySpeedDelta;
    gliderSpeed = Math.sqrt( xGliderSpeed ** 2 + yGliderSpeed ** 2 );

    let xLocDelta = xGliderSpeed * unitTimeStep;
    let yLocDelta = yGliderSpeed * unitTimeStep;
    xGliderLoc = xGliderLoc + xLocDelta;
    yGliderLoc = yGliderLoc + yLocDelta;

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
    console.log('xLiftAccel = ' + xLiftAccel);
    console.log('yLiftAccel = ' + yLiftAccel);
    console.log('dragForce= ' + dragForce);
    console.log('xDragAccel = ' + xDragAccel);
    console.log('yDragAccel = ' + yDragAccel);
    console.log('xGravAccel = ' + xGravAccel);
    console.log('yGravAccel = ' + yGravAccel);

    // console.log('gliderSpeed_OLD = ' + gliderSpeed_OLD);
    // console.log('xGliderSpeed_OLD = ' + xGliderSpeed_OLD);
    // console.log('yGliderSpeed_OLD = ' + yGliderSpeed_OLD);

    console.log('xSpeedDelta = ' + xSpeedDelta);
    console.log('ySpeedDelta = ' + ySpeedDelta);

    console.log('gliderSpeed = ' + gliderSpeed);
    console.log('xGliderSpeed = ' + xGliderSpeed);
    console.log('yGliderSpeed = ' + yGliderSpeed);
    console.log('xLocDelta = ' + xLocDelta);
    console.log('yLocDelta = ' + yLocDelta);
    console.log('xGliderLoc = ' + xGliderLoc);
    console.log('yGliderLoc = ' + yGliderLoc);

  } // END of updateState method

  this.getTrueWindSpeed = function(pAltitude,pOption) {
    // need different option cases
    // miles per hour number approx double m/s number
    let wind = 0 + 0.1 * pAltitude; // (m/s)
    return wind;
  } // END of getTrueWindSpeed

  this.getLiftCoeff = function(pAttackAngle) {
    // 3rd order polynomial fit to Clark Y airfoil at aspect ratio 6
    // from plot at https://en.wikipedia.org/wiki/Airfoil
    const a = pAttackAngle;
    const c = [-16.43065980602643, 2.95705979090091, 4.25610006314189, 0.32243504749002];
    let liftCoeff = c[3]+c[2]*a+c[1]*a**2+c[0]*a**3;
    if (liftCoeff < 0) {liftCoeff = 0}
    return liftCoeff;
  } // END of getLiftCoeff

  this.getDragCoeff = function(pAttackAngle) {
    // 3rd order polynomial fit to Clark Y airfoil at aspect ratio 6
    // from plot at https://en.wikipedia.org/wiki/Airfoil
    const a = pAttackAngle;
    const c = [20.92506969082500, -1.14454109889221, 0.77909063646772, 0.1280667244844];
    let dragCoeff = c[3]+c[2]*a+c[1]*a**2+c[0]*a**3;
    if (dragCoeff < 0) {dragCoeff = 0}
    return dragCoeff;
  } // END of getDragCoeff

  this.updateUIgliderAngle = function() {
    // console.log('*** ENTER updateUIgliderAngle ***');
    // SPECIAL FOR THIS UNIT
    // called in HTML input element so must be a publc method
    let unum = unitIndex;
    let gliderAngleRaw = this.dataValues[1] = interfacer.getInputValue(unum, 1);
    gliderAngle = pi * gliderAngleRaw;
    // console.log('*** in updateUIgliderAngle, gliderAngle = ' + gliderAngle);
    // alert('input: this.conc = ' + this.conc);
    // update position of the range slider
    if (document.getElementById(thisGliderAngleSliderID)) {
      // alert('input, slider exists');
      document.getElementById(thisGliderAngleSliderID).value = gliderAngleRaw;
    }
    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();
    // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
    ssCheckSum = 1;
    this.updateDisplay();
  }, // END method updateUIgliderAngle()

  this.updateUIgliderAngleSlider = function() {
    // console.log('*** ENTER updateUIgliderAngleSlider ***')
    // SPECIAL FOR THIS UNIT
    // called in HTML input element so must be a publc method
    let unum = unitIndex;
    let gliderAngleRaw = this.dataValues[0] = interfacer.getInputValue(unum, 0);
    gliderAngle = pi * gliderAngleRaw;
    // console.log('*** in updateUIgliderAngleSlider, gliderAngle = ' + gliderAngle);
    // update input field display
    // alert('slider: this.conc = ' + this.conc);
    if (document.getElementById(thisGliderAngleFieldID)) {
      document.getElementById(thisGliderAngleFieldID).value = gliderAngleRaw;
    }
    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();
    // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
    ssCheckSum = 1;
    this.updateDisplay();
  } // END method updateUIgliderAngleSlider()

  this.updateDisplay = function() {

    document.getElementById(displayTimeField).innerHTML =  controller.simTime.toFixed(2);

    // https://jenkov.com/tutorials/svg/path-element.html

    const pixPerMeter = 1; // (px/m)

    const y0 = 10; // (px), y location of y = 0
    const x0 = 300; // (px), x location of x = 0

    // coordinates for glider point
    let xp = x0 + xGliderLoc * pixPerMeter; // (px)
    let yp = y0 + yGliderLoc * pixPerMeter;

    // COMPUTE AND SET NEW POLYGON POINTS FOR GLIDER IMAGE
    // AT NEW LOCATION AND DIRECTION OF GLIDER

    // get quadrant into which glider points
    let quad = 0;
    if (gliderAngle >= 0 && gliderAngle < 0.5*pi ) {
      quad = 1;
    } else if (gliderAngle >= 0.5*pi && gliderAngle < pi) {
      quad = 2;
    } else if (gliderAngle >= pi && gliderAngle < 1.5*pi) {
      quad = 3;
    } else if (gliderAngle >= 1.5*pi && gliderAngle <= 2*pi) {
      quad = 4;
    }

    const L = 30; // (px), Length of glider body
    const F = 10; // (px), height of glider tail Fin
    let beta; // (radians)
    let alpha;
    let xt; // (px), tail x
    let yt;
    let xf; // (px), fin x
    let yf;
    switch (quad) {
      case 1:
        beta = gliderAngle;
        alpha = 0.5 * pi - beta;
        xt = xp - L * Math.cos(beta);
        yt = yp - L * Math.sin(beta);
        xf = xt - F * Math.cos(alpha);
        yf = yt + F * Math.sin(alpha);
        break;
      case 2:
        beta = pi - gliderAngle;
        alpha = 0.5 * pi - beta;
        xt = xp + L * Math.cos(beta);
        yt = yp - L * Math.sin(beta);
        xf = xt + F * Math.cos(alpha);
        yf = yt + F * Math.sin(alpha);
        break;
      case 3:
        beta = gliderAngle - pi;
        alpha = 0.5 * pi - beta;
        xt = xp + L * Math.cos(beta);
        yt = yp + L * Math.sin(beta);
        xf = xt - F * Math.cos(alpha);
        yf = yt + F * Math.sin(alpha);
        break;
      case 4:
        beta = 2 * pi - gliderAngle;
        alpha = 0.5 * pi - beta;
        xt = xp - L * Math.cos(beta);
        yt = yp + L * Math.sin(beta);
        xf = xt + F * Math.cos(alpha);
        yf = yt + F * Math.sin(alpha);
        break;
      default:
        console.log('in updateDisplay, bad quad = ' + quad);
    }

    // console.log('---- updateDisplay -----');
    // console.log('quad = ' + quad);
    // console.log('beta = ' + beta);
    // console.log('alpha = ' + alpha);
    // console.log('xt = ' + xt);
    // console.log('yt = ' + yt);
    // console.log('xf = ' + xf);
    // console.log('yf = ' + yf);


    // NOTE - y COMPUTED ABOVE FOR POSITIVE VERTICAL COORDINATE POINTS UP
    //        NOW TRANSFORM BELOW FOR SVG VERTICAL COORDINATE POINTING DOWN
    // yHeight = height in index's <svg id="svg_glider" width="600" height="600">
    const yHeight = 600; // (px)
    yp = yHeight - yp;
    yt = yHeight - yt;
    yf = yHeight - yf;

    svgElement = document.getElementById("glider");

    // SEE P. 37 OF O'REILLY BOOK 'JAVASCRIPT' TO SEE 'TEMPLATE LITERALS'
    // USE BACK TICKS & ${} to include variable values into strings
    svgElement.setAttribute( 'points' , `${xp},${yp} ${xt},${yt} ${xf},${yf}` );

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
