// PARTIAL FROM PROCESS CONTROLLER 

  checkForSteadyState : function() {

  // NOTE for these notes: 
  // residenceTime is a required variable for all process units 
  // checkForSteadyState looks for largest residenceTime in process 
  // and after interval of two times the largest residenceTime
  // the controller calls every unit's checkForSteadyState 

// EXAMPLE FROM LAB 7

  ssCheckSum : 0, // used to check for steady state
  residenceTime : 0, // for timing checks for steady state check
  // residenceTime is set in this unit's updateUIparams()

  reset : function() {
    //
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.

    this.updateUIparams(); // this first, then set other values as needed
// ETC... 

// NOTE: should also send interfacer.updateUIparams() which then 
//       sends updateUIparams() to all units, then have that method 
//       in each unit recompute its residence time and maybe (check) 
//       set its ssCheckSum 
//       want all units to use updateUIparams in case feed flow or conc 
//       gets changed, e.g., and need to change residence time in a reactor 


  updateUIparams : function() {
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // need to reset controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.resetSSflagsFalse();
    // set ssCheckSum != 0 used in checkForSteadyState() method to check for SS
    this.ssCheckSum = 1;
    // ETC... 

    // ... 

    // residence time used for timing checks for steady state
    // use this for now but should consider voidFrac and Cp's...
    this.residenceTime = this.Wcat / this.densCat / this.Flowrate;

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
    let nn = this.numNodes;
    let hlt = 1.0e1 * this.Trxr[nn];
    let hrt = 1.0e1 * this.Trxr[0];
    let clt = 1.0e1 * this.Ca[nn];
    let crt = 1.0e1 * this.Ca[0];
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
