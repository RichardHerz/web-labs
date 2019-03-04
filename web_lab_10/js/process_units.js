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
// THESE FUNCTION DEFINITIONS MAY BE EMPTY IN SOME CASES BUT MUST BE PRESENT
//
// EACH PROCESS UNIT DEFINITION MUST DEFINE the variable residenceTime

// -------------------------------------------------------------------

let processUnits = new Object();
// assign process unit objects to this object
// as indexed child objects in order to allow object controller
// to access them in a repeat with numeric index
// the numeric order of process units does not affect the simulation
// contents must be only the process units as child objects
// child objects optionally can be defined in separate script files, which
// makes them easier to edit,
// then inserted into processUnits, e.g.,
// USING CONSTRUCTOR FUNCTION...
//   processUnits[0] = new puHeatExchanger(0); // [] and () index # must match
// OR USING OBJECT
//   processUnits[0] = puHeatExchanger; // puHeatExchanger is an object
//   processUnits[0].unitIndex = 0; // assign unitIndex to match processUnits index
// then object cleared for garbage collection, e.g.,
//   puHeatExchanger = null; // puHeatExchanger is an object
// WARNING: if reorder unit index numbers, then need to edit
//   those numbers in each unit's private inputs array

processUnits[0] = new puSpiritStill(0);

let equil = {
  // object with ethanol-water, vapor-liquid equilibrium functions
  // the key component is ethanol, x and y are mole fractions of ethanol

  // *** IMPROVE: for getX2 during distill know direction x,y moving, so
  // *** start from last solution to new solution & only from start on reset,
  // *** where can also use better method of solution

  getY : function(x) {
    // return y given x
    // data from http://vle-calc.com/ for ethanol in water-ethanol mix at P = 1.01325 bar
    // perform polynomial fit in MATLAB with addition of 5 duplicate end points
    // at each end for weighting in fit
    // let c = [-3.2694e+02,1.4346e+03,-2.6134e+03,2.5591e+03,-1.4589e+03,4.9155e+02,-9.5447e+01,1.0357e+01,3.8238e-03];
    // set last coef to zero so returns y=0 with input of x=0
    let c = [-3.2694e+02,1.4346e+03,-2.6134e+03,2.5591e+03,-1.4589e+03,4.9155e+02,-9.5447e+01,1.0357e+01,0.00];
    let n = c.length; // order of poly + 1
    let y = 0;
    for (i = 0; i < n; i++) {
      y = y + c[i] * Math.pow(x,n-1-i);
    }
    return y;
  }, // END function getY

  getT : function(x) {
    // return T (deg C) given x
    // data from http://vle-calc.com/ for ethanol in water-ethanol mix at P = 1.01325 bar
    // perform polynomial fit in MATLAB with addition of 5 duplicate end points
    // at each end for weighting in fit
    // let c = [4.5855e+03,-2.0995e+04,4.0116e+04,-4.1540e+04,2.5375e+04,-9.3550e+03,2.0597e+03,-2.6803e+02,9.9981e+01];
    // set last coef to 100 so returns normal boiling point of water, 100 C when x=0
    let c = [4.5855e+03,-2.0995e+04,4.0116e+04,-4.1540e+04,2.5375e+04,-9.3550e+03,2.0597e+03,-2.6803e+02,100.00];
    let n = c.length; // order of poly + 1
    let T = 0;
    for (i = 0; i < n; i++) {
      T = T + c[i] * Math.pow(x,n-1-i);
    }
    return T;
  }, // END function getT

  getX2 : function(y,r) {
    // return y2 and x2 given y = y1 and r = recycle ratio
    // same equation rearranged below
    // from total mol and light key mol bal around neck
    // y2 - (y - r*x2)/ (1-r) = 0 ... LHS < 0 for x2 = y2 = 0
    // y - (1-r)*y2 - r*x2 = 0 ... LHS > 0 for x2 = y2 = 0
    // NOTE: dy/dx large at low x so difference of inc = 0.01 will give
    // stepped y (and T) at low x, but check timing for small inc
    let inc = 0.001;
    let x2 = -inc; // so start at x2=0 in repeat & still can go to zero ABV
    let y2 = 0;
    let lhs = 1; // any initial value > 0
    // pick an x2 value, use getY(x) to get y2 value, get lhs to zero
    // use a quick fix to get started... ALSO see *** IMPROVE above
    while (lhs > 0) {
      x2 = x2 + inc;
      y2 = this.getY(x2);
      lhs = y - (1-r) * y2 - r * x2;
    }
    return x2;
  }, // END function getX2

  getABV : function(x) {
    // returns percent Alcohol by Volume given mole fraction of vapor or liquid
    // Alcohol by volume (ABV) is 100% * vol of pure alcohol used to make mixture divided
    // by volume of mixture after mixing, which is reduced from sum of volumes
    // of water and ethanol used because of nonideal mixing.
    // ABV is proportional to specific gravity of mixture as measured
    // by a hydrometer in ethanol-water mixure.
    // Reference http://www.ddbst.com/en/EED/VE/VE0%20Ethanol%3BWater.php
    // Excess Volume Data Set 947
    // perform polynomial fit in MATLAB with addition of 5 duplicate end points
    // at each end for weighting in fit - no signif change if only fit excess vol
    // let c = [-6.1179e+01,3.0022e+02,-6.3062e+02,7.5176e+02,-5.8258e+02,3.2240e+02,2.0980e-03];
    // set last coef to zero so returns 0% ABV with input of x=0
    let c = [-6.1179e+01,3.0022e+02,-6.3062e+02,7.5176e+02,-5.8258e+02,3.2240e+02,0.00];
    let n = c.length; // order of poly + 1
    let abv = 0;
    for (i = 0; i < n; i++) {
      abv = abv + c[i] * Math.pow(x,n-1-i);
    }
    return abv;
  }, // END function getABV

  getXfromABV : function(abv) {
    // returns mole fraction of vapor or liquid given percent Alcohol by Volume
    // Alcohol by volume (ABV) is 100% * vol of pure alcohol used to make mixture divided
    // by volume of mixture after mixing, which is reduced from sum of volumes
    // of water and ethanol used because of nonideal mixing.
    // ABV is proportional to specific gravity of mixture as measured
    // by a hydrometer in ethanol-water mixure.
    // Reference http://www.ddbst.com/en/EED/VE/VE0%20Ethanol%3BWater.php
    // Excess Volume Data Set 947
    // perform polynomial fit in MATLAB with addition of 5 duplicate end points
    // at each end for weighting in fit - no signif change if only fit excess vol
    // let c = [6.3733e-12,-1.5614e-09,1.4834e-07,-6.1903e-06,1.3610e-04,2.3484e-03,1.8731e-04];
    // set last coef to zero so returns x=0 with input of 0% ABV
    let c = [6.3733e-12,-1.5614e-09,1.4834e-07,-6.1903e-06,1.3610e-04,2.3484e-03,0.00];
    let n = c.length; // order of poly + 1
    let x = 0;
    for (i = 0; i < n; i++) {
      x = x + c[i] * Math.pow(x,n-1-i);
    }
    return x;
  }, // END function getXfromABV

  getVol : function(m,x) {
    // returns total volume given total moles and x
    // component 1 is ethanol, 2 is water
    let mvol1 = 58.4; // cm3/mol
    let mvol2 = 18; // cm3/mol
    // poly fit of excess volume data in MATLAB
    // Reference http://www.ddbst.com/en/EED/VE/VE0%20Ethanol%3BWater.php
    // Excess Volume Data Set 947
    let c = [-3.5934e+01,1.1074e+02,-1.2392e+02,5.7648e+01,-3.5647e+00,-4.9827e+00,7.8556e-03];
    let n = c.length; // order of poly + 1
    let dv = 0; // delta vol, excess vol
    for (i = 0; i < n; i++) {
      dv = dv + c[i] * Math.pow(x,n-1-i);
    }
    let v1 = m * x * mvol1/1000; // liters alcohol = mol * cm3/mol / (cm3/liter)
    let v2 = m * (1-x) * mvol2/1000; // liters water = mol * cm3/mol / (cm3/liter)
    let vol = v1 + v2; // total vol before correction
    vol = vol + m * dv / 1000; // liters = mol * cm3/mol / (cm3/liter)
  } // END function getVol

} // END object equil
