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
  // beta = pi - angle of glider with respect to true wind
  let beta = (pi - gliderAngle);
  // gliderSpeed = magnitude of glider velocity vector
  let xGliderSpeed = gliderSpeed * Math.cos(beta);
  let yGliderSpeed = gliderSpeed * Math.sin(beta); // (m/s)

  let trueWindSpeed = this.getTrueWindSpeed(yGliderLoc, windProfileOption);

  // gamma = pi - angle of apparent wind relative to coordinate system
  // attackAngle = angle of glider relative to apparent wind = (beta - gamma)

  // NEW - remove x & y GliderLoc & use x & y GliderSpeed from above
  let gamma = Math.atan( (yGliderSpeed) / (trueWindSpeed + xGliderSpeed) );

  // OLD - not sure why x & y GliderLoc here
  // let gamma = Math.atan( (yGliderLoc + gliderSpeed * Math.sin(beta)) /
  //             (trueWindSpeed + (xGliderLoc - gliderSpeed * Math.cos(beta))) );

  // beta - gamma is angle of attack of glider to apparent wind
  let attackAngle = (beta - gamma);

  let appWindSpeed = yGliderSpeed / Math.sin(gamma);
  // let appWindSpeed = (yGliderLoc + yGliderSpeed) / Math.sin(gamma);
  // let appWindSpeed = (yGliderLoc + gliderSpeed * Math.sin(beta)) / Math.sin(gamma);

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
  // WARNING - need to check and correct angle signs
  //           and vector directions with respect to x,y coordinate system
  //
  let delta = 90 - beta;
  let xLiftForce = liftForce * Math.cos(delta); // (kg-m/s2)
  let yLiftForce = liftForce * Math.sin(delta);
  let xDragForce = dragForce * Math.cos(beta);
  let yDragForce = dragForce * Math.sin(beta);

  // force = gliderMass * acceleration
  // acceleration = force / gliderMass

  let xLiftAccel = xLiftForce / gliderMass; // (m/s2)
  let yLiftAccel = yLiftForce / gliderMass;
  let yDragAccel = yDragForce / gliderMass;
  let xDragAccel = xDragForce / gliderMass;
  let xGravAccel = 0;
  let yGravAccel = gravity;

  // STEP IN TIME TO UPDATE SPEED, LOCATION AND ANGLE
  // See my Zotero ref: Numerical integration in dynamic soaring...
  // new_velocity = old_velocity + acceleration * delta_time;
  // new_position = position + new_velocity * delta_time;
  xGliderSpeed = xGliderSpeed + (xLiftAccel + xDragAccel + xGravAccel) * unitTimeStep;
  yGliderSpeed = yGliderSpeed + (yLiftAccel + yDragAccel + yGravAccel) * unitTimeStep;
  xGliderLoc = xGliderLoc + xGliderSpeed * unitTimeStep;
  yGliderLoc = yGliderLoc + yGliderSpeed * unitTimeStep;

  // *** TO DO - need user-controlled elevators for attack angle adjustment ***

} // END of updateState method

this.getTrueWindSpeed = function(pAltitude,pOption) {
  // need different option cases
  // miles per hour number approx double m/s number
  let wind = 10 + 6 * pAltitude; // (m/s)
  return wind;
} // END of getTrueWindSpeed

this.getLiftCoeff = function(pAttackAngle) {
  let liftCoeff = 0.5;
  return liftCoeff;
} // END of getLiftCoeff

this.getDragCoeff = function(pAttackAngle) {
  let dragCoeff = 0.5;
  return dragCoeff;
} // END of getDragCoeff

this.updateDisplay = function() {

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
