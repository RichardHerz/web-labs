'use strict';

/*
Design, text, images and code by Richard . Herz, 2024-2025
Copyrights held by Richard . Herz
Licensed for use under the GNU General Public License v3.0
https://www.gnu.org/licenses/gpl-3.0.en.html 
*/

// DECLARE GLOBAL VARIABLES
let addingUnit = false; // toggles for option key down (true) or not (false) on click
let unitCount = 0; // number of units placed on scene including those removed 
let clickedID; // used to identify object clicked
let paletteObject; // assigned in paletteObjectClicked, used in sceneDivClicked
let isPiping = false;
let portOUT = null;
let portIN = null;
let portOUTid = null;
let portINid = null;
let portOUTunitID = null;
let portINunitID = null;
let params = []; // unit parameters
let portOUTlist = [];
let portINlist = [];
let portOUTunitList = [];
let portINunitList = [];
let svg = null;
let svgNS = "http://www.w3.org/2000/svg";
let pipe = null; // svg element
let pipeID = null;
let pipeIDlist = [];

// processUnits holds an object for each unit currently on display
// in web labs, used this >> let processUnits = new Object();
// but here use an array to hold the unit objects so can
// delete objects for units removed from scene with array method 
let processUnits = [];
// NOTE: unitList is used in unit update functions 
//       unitCountList only used below in reportStatus() for 
//       ease of access during debugging 
//       both pieces of info can be obtained from object's entry in processUnits array 
let unitCountList = []; // unitCount values of units currently on display
let unitList = []; // ID's of unit objects currently on display
let unitXlist = []; // x,y locations of units in scene
let unitYlist = []; //    for restoring saved flowsheet

document.addEventListener('DOMContentLoaded', function() {

  const divScene = document.getElementById('div_scene');
  if (divScene) {
    divScene.addEventListener('click', function(event) {
      sceneDivClicked(event);
    });
  } else {
    console.error('scene div not found in the document');
  }

  const clearButton = document.getElementById('button_clear');
  if (clearButton) {
    clearButton.addEventListener('click', clearFlowsheet);
  } else {
      console.error('Clear button not found in the document');
  }
  
  const stepButton = document.getElementById('Step');
  if (stepButton) {
    stepButton.addEventListener('click', updateInputsAndState);
  } else {
      console.error('Step button not found in the document');
  }
  
  const exportButton = document.getElementById('Export');
  if (exportButton) {
    // exportFLowSheet in file export_flowsheet.js
    exportButton.addEventListener('click', exportFlowsheet);
  } else {
      console.error('exportButton button not found in the document');
  }

  const importButton = document.getElementById('Import');
  if (importButton) {
    // importFLowSheet in file export_flowsheet.js
    importButton.addEventListener('click', importFlowsheet);
  } else {
    console.error('importButton button not found in the document');
  }

}); // END OF BLOCK adding eventListeners for main html elements

// export flowsheet to browser cookie to save when page closed
window.onbeforeunload = function() {
  console.log('UNLOAD enter window.onbeforeunload ');
  console.log('  export flowsheet to browser cookie');
  exportFlowsheet();
  console.log('UNLOAD after call to exportFlowsheet() ');

  // NOTE: CAN ALSO ADD FUNCTION CALL ON WEB LINKS BACK TO WEB LABS 

  // return true line below puts up a browser alert
  // asking whether or not you want to leave the page 

  // return true; // << XXX deactivated

  // a custom alert() is not allowed while unloading a page 
  // since browser puts up its own alert with return true
 
}; // END OF window.onbeforeunload

// // THIS DOES SAME THING AS window.onbeforeunload()
// window.addEventListener('beforeunload', () => {
//   console.log('HIT ON window.addEventListener beforeunload ');
//   // alert() not allowed while unloading a page 
// });

// clear flowsheet of all units and pipes
function clearFlowsheet() {
  console.log('enter clearFlowsheet');
  interfacer.resetThisLab(); // stops run timer
  const nmax = unitList.length;
  if (nmax > 0) {
    // loop down (if up, early units get deleted from list & index shifts)
    for (let n = nmax-1; n >= 0; n--) {
      let theObject = unitList[n];
      console.log(`  theObject, ${theObject} = unitList[${n}]`);
      removeUnit(theObject);
    }
  }
  console.log('exit clearFlowsheet');
} // END OF FUNCTION clearFlowsheet

function updateInputsAndState() {
  // called by button Step on this web page
  const nmax = 1;
  for (let n = 0; n < nmax; n++) {
    runUpdateInputs();
    runUpdateState();
  }
} // END OF FUNCTION runInitialize

function runUpdateInputs() {
  // called by button upIn on this web page
  for (let u in processUnits) {
    console.log('>>>> run  updateInputs(), u = ' + u);
    console.log('  unitID = ' + processUnits[u].unitID);
    processUnits[u].updateInputs(u);
  }
} // END OF FUNCTION runUpdateInputs 

function runUpdateState() {
  // called by button upSt on this web page
  for (let u in processUnits) {
    console.log('>>>> run updateState(), u = ' + u);
    console.log('  unitID = ' + processUnits[u].unitID);
    // processUnits[u].getPortCount();
    processUnits[u].updateState(u);
  }
} // END OF FUNCTION runUpdateState 

function param_btn_clicked(event, tUnitCount) {
  // XXX this gets unit's unitCount but note that input
  //     & output btn clicks get unitID...
  //     both seem to work...
  const tUnit = processUnits.find(unit => unit && unit.unitCount === tUnitCount);
  if (tUnit) {
    tUnit.param_btn_clicked();
  } else {
    console.error(`No unit found with unitCount ${tUnitCount}`);
  }
  event.stopPropagation(); // stops event bubbling up to unit
} // END OF FUNCTION param_btn_clicked 

function findProcessUnitIndex(searchUnitID) {
  // called by units in their updateInputs()
  // also called by popup.js 
  console.log('enter findProcessUnitIndex, searchUnitID = ' + searchUnitID);
  const index = processUnits.findIndex(unit => unit && 
    unit.unitID === searchUnitID);
    console.log('  index found = ' + index);
    console.log('  processUnits unit ID = ' + processUnits[index].unitID);
  return index; // returns -1 if not found
} // END OF FUNCTION findProcessUnitIndex 

function buildPalette() {
  console.log('enter buildPalette()');
  let el = document.getElementById("div_palette");
  // currently, each palette object is 60px high with 10px separation
  const objY = 60; // height of each object in palette
  const sepY = 10; // vertical separation between objects 
  const sepX = 16; // left margin of objects in palette 
  // unit count tU for palette object is zero and 
  // must be specified in function argument because
  // function buildFeed is also used for all scene objects
  const tU = 0; 
  //---------------------- 
  el.innerHTML += buildFeed(tU, sepX, sepY);
  //---------------------- 
  el.innerHTML += buildCSTR(tU, sepX, sepY+(sepY+objY));
  //---------------------- 
  el.innerHTML += buildPFR(tU, sepX, sepY+2*(sepY+objY));
  //---------------------- 
  el.innerHTML += buildMixer(tU, sepX, sepY+3*(sepY+objY));
  //---------------------- 
  el.innerHTML += buildSplitter(tU, sepX, sepY+4*(sepY+objY));
  //---------------------- 
  el.innerHTML += buildTank(tU, sepX, sepY+5*(sepY+objY));
  //---------------------- 
  console.log('exit buildPalette()');
} // END OF FUNCTION buildPalette

function paletteObjectClicked(event, theObject) {
  console.log('enter paletteObjectClicked, theObject = ' + theObject);
  paletteObject = theObject; // used in sceneDivClicked
  clickedID = event.target.id;
  let modkey = event.getModifierState("Alt"); // Alt is Option on Mac
  if (modkey) {
    addingUnit = true; // toggles to false in sceneDivClicked()
    let el = document.getElementById(clickedID);
    el.style.cursor = "copy";
    el = document.getElementById("div_scene");
    el.style.cursor = "copy";
  }
  console.log('exit paletteObjectClicked');
} // END OF FUNCTION paletteObjectClicked

function sceneDivClicked(event) {
  console.log('enter sceneDivClicked');

  if (isPiping) {
    // user drawing pipe but clicked off an object 
    // want to delete the pipe before connection
    svg.removeChild(pipe);
    // Reset variables for next pipe
    isPiping = false;
    portOUTid = null;
    portINid = null;
    portOUTunitID = null;
    event.stopPropagation(); // stops event bubbling up to unit
  } // END OF if (isPiping)

  if (addingUnit) {

    console.log('  addingUnit true, toggle to false, add unit to scene');

    addingUnit = false; // toggles to true in paletteDivClicked() 

    // increment unitCount and add to unitCountList array
    unitCount += 1;
    unitCountList.push(unitCount); // only used in reportStatus() for debugging 

    console.log('  unitCount = ' + unitCount);

    // get x,y coordinates of click in sceneDiv
    // note both rect and event.clientX & Y vary with page scroll
    // but their difference is independent of page scroll 
    // so x,y are relative to sceneDiv
    // use as input arguments to build units for placing 
    // and unit objects for save & reload flowsheet 
    const rect = event.target.getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left);
    const y = Math.round(event.clientY - rect.top);

    console.log('  x, y = ' + x + ', ' + y);

    let el = document.getElementById("div_scene");

    // NEED SWITCH BLOCK USING global var paletteObject 
    let unitID;
    unitXlist.push(x);
    unitYlist.push(y);
    switch (paletteObject) {
      case 'feed':
        el.innerHTML += buildFeed(unitCount, x, y);
        unitID = 'feed_' + unitCount;
        unitList.push(unitID); // used in unit update functions
        // add an object to processUnits[] for this new unit
        params = [10, 10]; // default flowrate, concentration
        processUnits.push(new Feed(unitCount, unitID, x, y, params) );
        console.log('add new unit to processUnits[], unitCount = ' + unitCount);
        break;
      case 'cstr':
        console.log('sceneDivClicked before call buildCSTR, unitCount = ' + unitCount);
        el.innerHTML += buildCSTR(unitCount, x, y);
        // add unit ID to list of units on display
        unitID = 'cstr_' + unitCount;
        unitList.push(unitID); // used in unit update functions
        // add an object to processUnits[] for this new unit
        params = [0, 100, 1]; // default rate constant, volume != 0, order = 1 or 2
        processUnits.push(new CSTR(unitCount, unitID, x, y, params) );
        console.log('add new unit to processUnits[], unitCount = ' + unitCount);
        break;
      case 'pfr':
        console.log('sceneDivClicked before call buildPFR, unitCount = ' + unitCount);
        el.innerHTML += buildPFR(unitCount, x, y);
        // add unit ID to list of units on display
        unitID = 'pfr_' + unitCount;
        unitList.push(unitID); // used in unit update functions
        // add an object to processUnits[] for this new unit
        params = [0, 100, 1]; // default rate constant, volume != 0, order = 1 or 2
        processUnits.push(new PFR(unitCount, unitID, x, y, params) );
        console.log('add new unit to processUnits[], unitCount = ' + unitCount);
        break;
      case 'mixer':
        el.innerHTML += buildMixer(unitCount, x, y);
        unitID = 'mixer_' + unitCount;
        unitList.push(unitID); // used in unit update functions
        // add an object to processUnits[] for this new unit
        params = [];
        processUnits.push(new Mixer(unitCount, unitID, x, y, params) );;
        console.log('add new unit to processUnits[], unitCount = ' + unitCount);
        break;
      case 'splitter':
        el.innerHTML += buildSplitter(unitCount, x, y);
        unitID = 'splitter_' + unitCount;
        unitList.push(unitID); // used in unit update functions
        // add an object to processUnits[] for this new unit
        params = [0.5]; // default fraction to upper output port
        processUnits.push(new Splitter(unitCount, unitID, x, y, params) );
        console.log('add new unit to processUnits[], unitCount = ' + unitCount);
        break;
      case 'tank':
        el.innerHTML += buildTank(unitCount, x, y);
        unitID = 'tank_' + unitCount;
        unitList.push(unitID); // used in unit update functions
        // add an object to processUnits[] for this new unit
        params = [];
        processUnits.push(new Tank(unitCount, unitID, x, y, params) );
        console.log('add new unit to processUnits[], unitCount = ' + unitCount);
        break;
      default:
        console.log('switch DEFAULT in sceneDivClicked');
    }; // END OF SWITCH

    el.style.cursor = "default";

    el = document.getElementById(clickedID);
    el.style.cursor = "default";

    reportStatus('at end sceneDivClicked'); 

  } // END OF if (addingUnit) 

} // END OF FUNCTION sceneDivClicked

function checkCursor(event) {
  console.log('enter checkCursor, event = ' + event);
  let el = document.getElementById(event.target.id);
  if (addingUnit) {
    el.style.cursor = "copy";
  } else {
    el.style.cursor = "default";
  }
} // END OF FUNCTION checkCursor

function sceneObjectClicked(event, objectUnit) {
  console.log('enter sceneObjectClicked');

  // WARNING: input argument objectUnit must be specified as a string in _build file, e.g., 
  // 'feed_${zz}' in onclick="sceneObjectClicked(event, ${zz}, 'feed_${zz}')" 

  // when removing this unit, also 
  // remove any and all pipes connected to this unit

  if (!addingUnit) {
    console.log('  addingUnit is false');
    // delete unit from display 
    // addingUnit might be true if click on existing object to add new overlapping one
    let modkey = event.getModifierState("Alt"); // Alt is Option on Mac
    console.log('  modkey = ' + modkey);
    if (modkey) { 
      removeUnit(objectUnit);
    }
  }
} // END OF FUNCTION sceneObjectClicked

function removeUnit(objectUnit) {
  console.log('enter removeUnit, objectUnit = ' + objectUnit); 

  // THIS CAN CALL removePipe()

  reportStatus('  search for pipes to remove then remove object');

  console.log('  sceneObjectClicked, top pipe search *IN*');
  const MAX_ITERATIONS = 2; // max of two input ports per unit
  let iterCount = 0;
  let tIndex = 0;
  while (tIndex != -1) {
    if (iterCount >= MAX_ITERATIONS) {
      console.log('  ERROR Maximum iterations reached in pipe removal');
      break;
    }
    // get index of objectUnit in portINunitList
    tIndex = portINunitList.findIndex(finderFunc);
    function finderFunc(thisOne) {
      return thisOne == objectUnit;
    }
    // if found, remove the pipe
    if (tIndex != -1) {
      console.log('  remove pipe portINlist[tIndex] = ' + portINlist[tIndex]);
      removePipe(portINlist[tIndex]);
    }
    iterCount++;
  } // END OF LOOP while (tIndex != -1)

  console.log('  removeUnit, bottom pipe search *IN*');

  // search index of object to be deleted in list of pipe OUT units
  // if there, remove the pipe
  // since two outputs, unit may be listed for pipe to each output
  // repeat until tIndex = -1
  console.log('  removeUnit, top pipe search *OUT*');
  iterCount = 0;
  tIndex = 0;
  while (tIndex != -1) {
    if (iterCount >= MAX_ITERATIONS) {
      console.log('  ERROR Maximum iterations reached in pipe removal');
      break;
    }
    // get index of objectUnit in portOUTunitList
    tIndex = portOUTunitList.findIndex(finderFunc);
    function finderFunc(thisOne) {
      return thisOne == objectUnit;
    }
    // if found, remove the pipe
    if (tIndex != -1) {
      console.log('    remove portINlist[tIndex] = ' + portINlist[tIndex]);
      reportStatus('  removeUnit before removePipe(portINlist[tIndex])');
      removePipe(portINlist[tIndex]);
    }
    iterCount++;
  } // END OF LOOP while (tIndex != -1)

  console.log('  removeUnit, bottom pipe search *OUT*');

  let tNumKeys = Object.keys(processUnits).length;
  console.log('  before removing object, num keys processUnits = ' + tNumKeys);

  // WARNING: input argument objectUnit must be specified as a string in _build file, e.g., 
  // 'feed_${zz}' in onclick="sceneObjectClicked(event, ${zz}, 'feed_${zz}')" 

  console.log('  before removing object, objectUnit = ' + objectUnit);

  reportStatus('  removeUnit before el.remove() removing an object');
  const el = document.getElementById(objectUnit);
  el.remove();

  console.log('  objectUnit before removing from list = ' + objectUnit);

  // delete the unit from the lists 
  // need array index to delete unit ID from unitList array 
  tIndex = unitList.findIndex(finderFunc); // used in unit update functions
  function finderFunc(thisOne) {
    return thisOne == objectUnit;
  }
  console.log('  remove object from lists, tIndex = ' + tIndex);
  unitCountList.splice(tIndex, 1);
  unitList.splice(tIndex, 1);
  unitXlist.splice(tIndex, 1);
  unitYlist.splice(tIndex, 1); 

  // copilot suggested the following to remove object from processUnits 
  let indexToRemove = processUnits.findIndex(unit => {
    // Check if unit exists before trying to access its properties
    return unit && unit.unitID === objectUnit;
  });
  if (indexToRemove !== -1) {
    console.log('  indexToRemove = ' + indexToRemove);
    processUnits.splice(indexToRemove, 1);
    // After splicing, filter out any undefined units
    processUnits = processUnits.filter(unit => unit !== undefined);
  }

  reportStatus('  removeUnit after removing an object');
  tNumKeys = Object.keys(processUnits).length;
  console.log('  after removing object, num keys processUnits = ' + tNumKeys);
  if (tNumKeys) {
    console.log('  for each key puKey of processUnits, get unitID');
    Object.keys(processUnits).forEach(puKey => { 
      console.log('putKey = ' + puKey);
      console.log('unitID = ' + processUnits[puKey].unitID);
    });
  }

  console.log('exit removeUnit');

} // END OF FUNCTION removeUnit

function removePipe(pPortINid) {
  console.log('enter removePipe');
  console.log('  pPortINid = ' + pPortINid);
  reportStatus('removePipe on enter removePipe(pPortINid');

  svg = document.getElementById("svg_pipes");
  // Check if SVG container exists, if not exit
  if (!svg) {
    console.log('  ERROR id svg_pipes does not exist, so RETURN');
    return;
  }

  // get index of pPortINid in portINlist
  const tIndex = portINlist.findIndex(finderFunc);
  function finderFunc(thisOne) {
    return thisOne == pPortINid;
  }
  console.log('  index of pPortINid in portINlist, tIndex = ' + tIndex);

  const temp = portOUTlist[tIndex];
  console.log('  portOUTid in portOUTlist at this index = ' + temp);

  // now use index to get corresponding units
  const thisID = pipeIDlist[tIndex];
  console.log('  pipeID in pipeIDList at tIndex = ' + thisID);

  reportStatus('>>>>> removePipe() just before remove pipe <<<<<');

  // remove pipe

  // this seems more reliable than svg.removeChild(pipeChild)
  // pipeID set in drawPipe()
  console.log('  before document.getElementById(pipeID).remove(), pipeID = ' + thisID);
  document.getElementById(thisID).remove();

  // svg.removeChild() failed when add two unit03, add pipe between, 
  // add 3rd unit03, then try to delete pipe or delete first unit03
  // both using pipeObject or pipeChild had same problem 

  // remove deleted elements from lists
  portOUTlist.splice(tIndex, 1);
  portINlist.splice(tIndex, 1);
  portINunitList.splice(tIndex, 1);
  portOUTunitList.splice(tIndex, 1);
  pipeIDlist.splice(tIndex, 1);

  // Reset variables for next pipe
  isPiping = false;
  portOUTid = null;
  portINid = null;
  portOUTunitID = null;
  pipeID = null;

  reportStatus('end of removePipe()');
  console.log('just before end removePipe');

} // END OF FUNCTION removePipe

function drawPipe(event) {

  console.log('enter drawPipe');
  console.log('  portOUTid = ' + portOUTid);

  const divScene = document.getElementById('div_scene');
  const divOUT = document.getElementById(portOUTid);

  const divSceneRect = divScene.getBoundingClientRect();
  const divOUTRect = divOUT.getBoundingClientRect();

  // Calculate center relative to divScene's top-left corner
  const nudge = -4; // nudge to center pipe on div
  const x1 = Math.round(nudge + divOUTRect.left - divSceneRect.left + divOUTRect.width / 2);
  const y1 = Math.round(nudge + divOUTRect.top - divSceneRect.top + divOUTRect.height / 2);

  svg = document.getElementById("svg_pipes");

  // setting z-index in CSS file didn't work
  // next pipe works to put pipes on top of scene objects
  svg.style.zIndex = '1000'; // Add z-index to ensure SVG is on top
  // but also need to disable pointer events for svg
  // so clicks go to objects in scene and not stop on svg
  svg.style.pointerEvents = 'none';

  console.log('  just before create pipe element');

  // Create marker definition if it doesn't exist
  if (!document.getElementById("arrowhead")) {
    const defs = document.createElementNS(svgNS, "defs");
    const marker = document.createElementNS(svgNS, "marker");
    marker.setAttribute("id", "arrowhead");
    marker.setAttribute("markerWidth", "5");    // changed from 10 to 5
    marker.setAttribute("markerHeight", "3.5"); // changed from 7 to 3.5
    marker.setAttribute("refX", "4.5");         // changed from 9 to 4.5
    marker.setAttribute("refY", "1.75");        // changed from 3.5 to 1.75
    marker.setAttribute("orient", "auto");

    const polygon = document.createElementNS(svgNS, "polygon");
    polygon.setAttribute("points", "0 0, 5 1.75, 0 3.5"); // changed from "0 0, 10 3.5, 0 7"
    polygon.setAttribute("fill", "black");

    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);
  }

  // Create pipe element, as svg line, with arrowhead
  pipe = document.createElementNS(svgNS, "line");
  pipe.setAttribute('x1', x1);
  pipe.setAttribute('y1', y1);

  pipeID = 'pipe_' + portOUTid; // also used in other functions & pipeIDlist[]

  pipe.setAttribute('id', pipeID);
  // add ID to pipeIDlist when pipe fixed to an input 

  const thisID = document.getElementById(portOUTid);
  console.log('  >>>> svg thisID = ' + thisID.id);

  // Calculate pipe end position relative to scene div, accounting for scroll
  const x2 = Math.round(nudge + event.clientX - divSceneRect.left);
  const y2 = Math.round(nudge + event.clientY - divSceneRect.top);
  pipe.setAttribute('x2', x2);
  pipe.setAttribute('y2', y2);

  console.log('  pipe start x1, y1 = ' + x1 + ', ' + y1);
  console.log('  pipe start x2, y2 = ' + x2 + ', ' + y2);

  pipe.setAttribute('stroke', 'black');
  pipe.setAttribute('stroke-width', '3');
  pipe.setAttribute('marker-end', 'url(#arrowhead)');  // Add arrowhead

  svg.appendChild(pipe);

  document.addEventListener('mousemove', updatePipe);

  reportStatus('end drawpipe()');
  console.log('just before end drawPipe()');

} // END OF FUNCTION drawPipe

function output_clicked(event, theUnit) {

  console.log('enter output_clicked');

  // USE OF THE TWO INPUT ARGUMENTS in output_clicked() 
  // (1) event.target is used to get portOUT, then 
  //     portOUT.id is used to get portOUTid, then 
  //     portOUTid is used to search for the index of the port in portOUTlist 
  //  event is also used to stopPropagation 
  //  event is also used in line drawPipe(event) 
  // (2) theUnit.id is used to get portOUTunitID 
  //     portOUTunitID is not used in again in output_clicked() 
  //     BUT it is a global and is used several times in input_clicked() 

  portOUT = event.target;
  portOUTid = portOUT.id;
  portOUTunitID = theUnit.id;

  // do not start line if port out already has a pipe 
  // search for portOUT in portOUTlist
  const tIndex = portOUTlist.findIndex(finderFunc);
  function finderFunc(thisOne) {
    return thisOne == portOUTid;
  }
  // if tIndex = -1 then continue, else port out already has a pipe 
  if (tIndex > -1) {
    // don't start the pipe, this out port already has a pipe
    event.stopPropagation(); // stops event bubbling up to unit
    console.log('  RETURN port out already has pipe!')
    return;
  }

  // if mod key down & not already piping & no pipe in port, then
  // set isPiping to true and draw pipe
  let modkey = event.getModifierState("Alt"); // Alt is Option on Mac // NEW PIPE
  if (modkey && !isPiping && (tIndex == -1)) {
    isPiping = true;

    console.log('  set isPiping = true');
    console.log('  portOUTid = ' + portOUTid)

    drawPipe(event);
    reportStatus('output_clicked just after drawPipe(event)');
  }

  console.log('just before end output_clicked, stopPropagation');
  event.stopPropagation(); // stops event bubbling up to unit

} // END OF FUNCTION output_clicked

function input_clicked(event, theUnit) {

  console.log('enter function input_clicked()');

  // USE OF THE TWO INPUT ARGUMENTS IN input_clicked() 
  // (1) event is used to stopPropagation several times 
  // event.target is used to get portIN, then 
  //   portIN.id is used to get portINid 
  // event.getModifierState is used to get modKey 
  // (2) theUnit.id is used to get portInUnitID, 
  // then portInUnitID is used in these lines 
  //     if (portINunitID == portOUTunitID) { 
  //     portINunitList.push(portINunitID); 
  //     portINunitID = null; 

  // if piping, set isPiping to false and draw pipe
  // if not piping and mod key down, remove pipe
  // if not piping and no mod key, do nothing

  portIN = event.target;
  portINid = portIN.id;
  portINunitID = theUnit.id;

  console.log('  portINid = ' + portINid);
  console.log('  portINunitID = ' + portINunitID);
  console.log('  portOUTunitID = ' + portOUTunitID);

  if (isPiping) {
    isPiping = false;

    if (portINunitID == portOUTunitID) {
      console.log('  port in on same unit as port out!')
      // don't allow pipe to same unit
      // don't end the pipe, user needs to click on empty scene to remove
      event.stopPropagation(); // stops event bubbling up to unit
      console.log('  RETURN clicked same unit');
      return;
    }

    // do not end pipe if port in already has a pipe 
    // search for portIN in portINlist
    const tIndex = portINlist.findIndex(finderFunc);
    function finderFunc(thisOne) {
      return thisOne == portINid;
    }
    // if tIndex = -1 then continue, else port in already has a pipe 
    if (tIndex > -1) {
      console.log('  port in already has pipe!');
      event.stopPropagation(); // stops event bubbling up to unit
      console.log('  RETURN clicked port in already with pipe');
      return;
    };

    // drawPipe at end sets portIN and portOUT to null
    // add output and input ports to lists
    console.log('  just before drawPipe');
    console.log('  portOUTid = ' + portOUTid);
    console.log('  portINid = ' + portINid);
    portOUTlist.push(portOUTid);
    portINlist.push(portINid);
    portINunitList.push(portINunitID);
    portOUTunitList.push(portOUTunitID);
    // set svg pipe id so not same as portOUT's ID 
    //   avoid confusion, e.g., when computing portOUT center 
    pipeIDlist.push(pipeID); // pipeID set in drawPipe()

    document.removeEventListener('mousemove', updatePipe);

    // end pipe at center of portIN
    const divScene = document.getElementById('div_scene');
    const divIN = document.getElementById(portINid);
    const divSceneRect = divScene.getBoundingClientRect();
    const divINRect = divIN.getBoundingClientRect();
    // Calculate center relative to divScene's top-left corner
    const nudge = -4; // nudge to center pipe on div
    const x2 = Math.round(nudge + divINRect.left - divSceneRect.left + divINRect.width / 2);
    const y2 = Math.round(nudge + divINRect.top - divSceneRect.top + divINRect.height / 2);
    pipe.setAttribute('x2', x2);
    pipe.setAttribute('y2', y2);

    // Reset variables for next pipe
    // Reset variables for next pipe
    isPiping = false;
    portOUTid = null;
    portINid = null;
    pipeID = null;
    portOUTunitID = null;
    portINunitID = null;

    reportStatus('  function input_clicked() after pipe added');

  } else {
    let modkey = event.getModifierState("Alt"); // Alt is Option on Mac
    if (modkey) {
      reportStatus('  function input_clicked() just before removePipe');
      removePipe(portINid);
      reportStatus('  function input_clicked() just after removePipe');
    }
  }

  reportStatus('end of function input_clicked()');
  console.log('just before end function input_clicked(), stopPropagation');
  event.stopPropagation(); // stops event bubbling up to unit

} // END OF FUNCTION input_clicked 

function updatePipe(event) {
  const divScene = document.getElementById('div_scene');
  const divSceneRect = divScene.getBoundingClientRect();
  const nudge = -4; // match nudge used in drawPipe

  // Calculate position relative to scene div, accounting for scroll
  const x2 = Math.round(nudge + event.clientX - divSceneRect.left);
  const y2 = Math.round(nudge + event.clientY - divSceneRect.top);

  pipe.setAttribute('x2', x2);
  pipe.setAttribute('y2', y2);
}// END OF FUNCTION updatePipe 

function reportStatus(caller) {
  // console.log('--- reportStatus in ' + caller + ' ---------');
  // console.log('  unitCountList = ' + unitCountList);
  // console.log('  unitList = ' + unitList);
  // console.log('  pipeIDlist = ' + pipeIDlist);
  // console.log('  portOUTlist = ' + portOUTlist);
  // console.log('  portOUTunitList = ' + portOUTunitList);
  // console.log('  portINlist = ' + portINlist);
  // console.log('  portINunitList = ' + portINunitList);
  // console.log('---- end reportStatus ---------');
} // END OF FUNCTION reportStatus
