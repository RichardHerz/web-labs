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

  // *** IMPROVE: for getX and getY, only need to fit input data through
  // *** max x,y seen in distillation
  // ***
  // *** also maybe fit deviation from x=y diagonal for easier poly fit...

  // *** IMPROVE: for getX2 during distill know direction x,y moving, so
  // *** start from last solution to new solution & only from start on reset,
  // *** where can also use better method of solution

  // object with ethanol-water vapor-liquid equilibrium info
  // the key component is ethanol, x and y are mole fractions of ethanol

  getY : function(x) {
    // return y given x
    // use a quick fit to get started...
    // polynomial fit in MATLAB for ethanol in water-ethanol mix at P = 1.01325 bar
    // of data from http://vle-calc.com/
    // 1.0e+03 * (-0.2951    1.2922   -2.3519    2.3051   -1.3187    0.4478   -0.0882    0.0098    0.0000)
    let c = [-0.2951,1.2922,-2.3519,2.3051,-1.3187,0.4478,-0.0882,0.0098,0.0000];
    let y = 0;
    let n = 8; // order of poly
    for (i = 0; i < n+1; i++) {
      y = y + 1.0e+03 * c[i] * Math.pow(x,n-i);
    }
    return y;
  }, // END function getY

  getT : function(x) {
    // return T (deg C) given x
    // use a quick fit to get started...
    // polynomial fit in MATLAB for ethanol in water-ethanol mix at P = 1.01325 bar
    // of data from http://vle-calc.com/
    // 1.0e+04 * (0.5932   -2.6458    4.9219   -4.9565    2.9390   -1.0490    0.2229   -0.0279    0.0100)
    let c = [0.5932,-2.6458,4.9219,-4.9565,2.9390,-1.0490,0.2229,-0.0279,0.0100];
    let T = 0;
    let n = 8; // order of poly
    for (i = 0; i < n+1; i++) {
      T = T + 1.0e+04 * c[i] * Math.pow(x,n-i);
    }
    return T;
  }, // END function getT

  getX2 : function(y,r) {
    // return y2 and x2 given y = y1 and r = recycle ratio
    // same equation rearranged below
    // from total mol and light key mol bal around neck
    // y2 - (y - r*x2)/ (1-r) = 0 ... LHS < 0 for x2 = y2 = 0
    // y - (1-r)*y2 - r*x2 = 0 ... LHS > 0 for x2 = y2 = 0
    let x2 = 0;
    let y2 = 0;
    // NOTE: dy/dx large at low x so difference of inc = 0.01 will give
    // stepped y (and T) at low x, but check timing for small inc
    let inc = 0.001;
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
    // Alcohol by volume (ABV) is vol of pure alcohol used to make mixture divided
    // by volume of mixture after mixing, which is reduced from sum of volumes
    // of water and ethanol used because of nonideal mixing.
    // ABV is proportional to specific gravity of mixture as measured
    // by a hydrometer in ethanol-water mixure.
    // Reference http://www.ddbst.com/en/EED/VE/VE0%20Ethanol%3BWater.php
    // Excess Volume Data Set 947
    // perform polynomial fit in MATLAB
    let c = [-5.9441e+01,2.9458e+02,-6.2361e+02,7.4758e+02,-5.8137e+02,3.2225e+02,7.4575e-03];
    let abv = 0;
    let n = 6; // order of poly
    for (i = 0; i < n+1; i++) {
      abv = abv + c[i] * Math.pow(x,n-i);
    }
    return abv;
  }, // END function getABV

  getXfromABV : function(abv) {
    // returns mole fraction of vapor or liquid given percent Alcohol by Volume
    // Alcohol by volume (ABV) is vol of pure alcohol used to make mixture divided
    // by volume of mixture after mixing, which is reduced from sum of volumes
    // of water and ethanol used because of nonideal mixing.
    // ABV is proportional to specific gravity of mixture as measured
    // by a hydrometer in ethanol-water mixure.
    // Reference http://www.ddbst.com/en/EED/VE/VE0%20Ethanol%3BWater.php
    // Excess Volume Data Set 947
    // perform polynomial fit in MATLAB
    let c = [2.1892e-08,-2.9368e-06,1.6496e-04,7.7197e-04,7.1373e-03];
    let x = 0;
    let n = 4; // order of poly
    for (i = 0; i < n+1; i++) {
      x = x + c[i] * Math.pow(x,n-i);
    }
    return x;
  } // END function getXfromABV

} // END object equil
