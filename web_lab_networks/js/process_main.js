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

function clearFlowsheet() {
  console.log('enter clearFlowsheet');
  interfacer.resetThisLab(); // stops run timer
  // Remove all units from the scene
  // loop down (if up, early units get deleted from list & index shifts)
  while (unitList.length > 0) {
    const theObject = unitList[unitList.length - 1];
    console.log(`  Removing unit: ${theObject}`);
    removeUnit(theObject); // also removes connected pipes
  }
  // Optionally, clear other related arrays if needed
  // unitCountList.length = 0;
  // unitXlist.length = 0;
  // unitYlist.length = 0;
  // processUnits.length = 0;
  console.log('exit clearFlowsheet');
} // END OF FUNCTION clearFlowsheet

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
  const objY = 70; // height of each object in palette
  const sepY = 6; // vertical separation between objects 
  const sepX = 16; // left margin of objects in palette 
  // unit count tU for palette object is zero and 
  // must be specified in function argument because
  // function buildFeed is also used for all scene objects
  const tU = 0; 
  //---------------------- 
  el.innerHTML += buildFeed(tU, sepX, sepY);
  //---------------------- 
  el.innerHTML += buildCSTR(tU, sepX, 14+sepY+(sepY+objY));
  //---------------------- 
  el.innerHTML += buildPFR(tU, sepX, 14+sepY+2*(sepY+objY));
  //---------------------- 
  el.innerHTML += buildMixer(tU, sepX, 14+sepY+3*(sepY+objY));
  //---------------------- 
  el.innerHTML += buildSplitter(tU, sepX, 6+sepY+4*(sepY+objY));
  //---------------------- 
  el.innerHTML += buildTank(tU, sepX, sepY+5*(sepY+objY));
  //---------------------- 
  console.log('exit buildPalette()');
} // END OF FUNCTION buildPalette

function paletteObjectClicked(event, theObject) {
  console.log('enter paletteObjectClicked, theObject = ' + theObject);
  paletteObject = theObject; // used in sceneDivClicked
  clickedID = event.target.id;
  // Use Alt/Option key to trigger addingUnit mode
  const modkey = event.getModifierState("Alt"); // Alt is Option on Mac
  if (modkey) {
    addingUnit = true; // toggles to false in sceneDivClicked()
    // Set cursor style for clicked element and scene
    const elClicked = document.getElementById(clickedID);
    const elScene = document.getElementById("div_scene");
    if (elClicked) elClicked.style.cursor = "copy";
    if (elScene) elScene.style.cursor = "copy";
  }
  console.log('exit paletteObjectClicked');
} // END OF FUNCTION paletteObjectClicked

function sceneDivClicked(event) {
  console.log('enter sceneDivClicked');

  // Handle pipe removal if user clicks off an object while piping
  if (isPiping) {
    if (svg && pipe) {
      svg.removeChild(pipe);
    }
    isPiping = false;
    portOUTid = null;
    portINid = null;
    portOUTunitID = null;
    event.stopPropagation();
    return;
  }

  // Handle adding a new unit to the scene
  if (addingUnit) {
    console.log('  addingUnit true, toggle to false, add unit to scene');
    addingUnit = false;

    unitCount += 1;
    unitCountList.push(unitCount);

    console.log('  unitCount = ' + unitCount);

    // Get click coordinates relative to sceneDiv
    const rect = event.target.getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left);
    const y = Math.round(event.clientY - rect.top);

    console.log('  x, y = ' + x + ', ' + y);

    let el = document.getElementById("div_scene");
    let unitID;
    unitXlist.push(x);
    unitYlist.push(y);

    // Add the selected unit type
    switch (paletteObject) {
      case 'feed':
        el.innerHTML += buildFeed(unitCount, x, y);
        unitID = `feed_${unitCount}`;
        unitList.push(unitID);
        params = [1, 10];
        processUnits.push(new Feed(unitCount, unitID, x, y, params));
        break;
      case 'cstr':
        el.innerHTML += buildCSTR(unitCount, x, y);
        unitID = `cstr_${unitCount}`;
        unitList.push(unitID);
        params = [0.01, 100, 1];
        processUnits.push(new CSTR(unitCount, unitID, x, y, params));
        break;
      case 'pfr':
        el.innerHTML += buildPFR(unitCount, x, y);
        unitID = `pfr_${unitCount}`;
        unitList.push(unitID);
        params = [0.01, 100, 1];
        processUnits.push(new PFR(unitCount, unitID, x, y, params));
        break;
      case 'mixer':
        el.innerHTML += buildMixer(unitCount, x, y);
        unitID = `mixer_${unitCount}`;
        unitList.push(unitID);
        params = [];
        processUnits.push(new Mixer(unitCount, unitID, x, y, params));
        break;
      case 'splitter':
        el.innerHTML += buildSplitter(unitCount, x, y);
        unitID = `splitter_${unitCount}`;
        unitList.push(unitID);
        params = [0.5];
        processUnits.push(new Splitter(unitCount, unitID, x, y, params));
        break;
      case 'tank':
        el.innerHTML += buildTank(unitCount, x, y);
        unitID = `tank_${unitCount}`;
        unitList.push(unitID);
        params = [];
        processUnits.push(new Tank(unitCount, unitID, x, y, params));
        break;
      default:
        console.warn('Unknown paletteObject:', paletteObject);
        break;
    }

    // Reset cursor styles
    el.style.cursor = "default";
    const clickedEl = document.getElementById(clickedID);
    if (clickedEl) clickedEl.style.cursor = "default";

    reportStatus('at end sceneDivClicked');
  }
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

  // Remove all pipes connected to this unit
  removeConnectedPipes(objectUnit, portINunitList, portINlist);
  removeConnectedPipes(objectUnit, portOUTunitList, portINlist);

  // Remove the unit's DOM element
  const el = document.getElementById(objectUnit);
  if (el) el.remove();

  // Remove from arrays
  removeFromArray(unitList, objectUnit);
  removeFromArray(unitCountList, objectUnit);
  removeFromArray(unitXlist, objectUnit);
  removeFromArray(unitYlist, objectUnit);

  // Remove from processUnits
  const indexToRemove = processUnits.findIndex(unit => unit && unit.unitID === objectUnit);
  if (indexToRemove !== -1) processUnits.splice(indexToRemove, 1);

  reportStatus('removeUnit after removing an object');
} // END OF FUNCTION removeUnit 

function removeConnectedPipes(objectUnit, unitList, pipeList) {
  let tIndex;
  while ((tIndex = unitList.findIndex(u => u === objectUnit)) !== -1) {
    removePipe(pipeList[tIndex]);
  }
}

function removeFromArray(arr, value) {
  const idx = arr.indexOf(value);
  if (idx !== -1) arr.splice(idx, 1);
}

function removePipe(pPortINid) {
  console.log('enter removePipe');
  console.log('  pPortINid = ' + pPortINid);
  reportStatus('removePipe on enter removePipe(pPortINid');

  const svg = document.getElementById("svg_pipes");
  if (!svg) {
    console.error('  ERROR: id svg_pipes does not exist, so RETURN');
    return;
  }

  // Find the index of the pipe to remove
  const tIndex = portINlist.findIndex(thisOne => thisOne === pPortINid);
  if (tIndex === -1) {
    console.warn(`  WARNING: pPortINid ${pPortINid} not found in portINlist`);
    return;
  }

  const pipeIdToRemove = pipeIDlist[tIndex];
  if (!pipeIdToRemove) {
    console.warn(`  WARNING: No pipeID found at index ${tIndex}`);
    return;
  }

  // Remove the SVG pipe element if it exists
  const pipeElement = document.getElementById(pipeIdToRemove);
  if (pipeElement) {
    pipeElement.remove();
    console.log(`  Removed SVG pipe element with id ${pipeIdToRemove}`);
  } else {
    console.warn(`  WARNING: SVG pipe element with id ${pipeIdToRemove} not found`);
  }

  // Remove associated data from all lists
  portOUTlist.splice(tIndex, 1);
  portINlist.splice(tIndex, 1);
  portINunitList.splice(tIndex, 1);
  portOUTunitList.splice(tIndex, 1);
  pipeIDlist.splice(tIndex, 1);

  // Reset pipe-related globals
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

  if (!divScene || !divOUT) {
    console.error('div_scene or portOUT element not found');
    return;
  }

  const divSceneRect = divScene.getBoundingClientRect();
  const divOUTRect = divOUT.getBoundingClientRect();

  // Calculate center relative to divScene's top-left corner
  const nudge = -4; // nudge to center pipe on div
  const x1 = Math.round(nudge + divOUTRect.left - divSceneRect.left + divOUTRect.width / 2);
  const y1 = Math.round(nudge + divOUTRect.top - divSceneRect.top + divOUTRect.height / 2);

  svg = document.getElementById("svg_pipes");
  if (!svg) {
    console.error('SVG element with id "svg_pipes" not found');
    return;
  }

  // Ensure SVG is on top and does not block pointer events
  svg.style.zIndex = '1000';
  svg.style.pointerEvents = 'none';

  // Create marker definition if it doesn't exist
  if (!document.getElementById("arrowhead")) {
    const defs = document.createElementNS(svgNS, "defs");
    const marker = document.createElementNS(svgNS, "marker");
    marker.setAttribute("id", "arrowhead");
    marker.setAttribute("markerWidth", "5");
    marker.setAttribute("markerHeight", "3.5");
    marker.setAttribute("refX", "4.5");
    marker.setAttribute("refY", "1.75");
    marker.setAttribute("orient", "auto");

    const polygon = document.createElementNS(svgNS, "polygon");
    polygon.setAttribute("points", "0 0, 5 1.75, 0 3.5");
    polygon.setAttribute("fill", "black");

    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);
  }

  // Create pipe element, as svg line, with arrowhead
  pipe = document.createElementNS(svgNS, "line");
  pipeID = 'pipe_' + portOUTid;
  pipe.setAttribute('id', pipeID);
  pipe.setAttribute('x1', x1);
  pipe.setAttribute('y1', y1);

  // Calculate pipe end position relative to scene div
  const x2 = Math.round(nudge + event.clientX - divSceneRect.left);
  const y2 = Math.round(nudge + event.clientY - divSceneRect.top);
  pipe.setAttribute('x2', x2);
  pipe.setAttribute('y2', y2);

  pipe.setAttribute('stroke', 'black');
  pipe.setAttribute('stroke-width', '3');
  pipe.setAttribute('marker-end', 'url(#arrowhead)');

  svg.appendChild(pipe);

  document.addEventListener('mousemove', updatePipe);

  reportStatus('end drawPipe()');
  console.log('just before end drawPipe()');
} // END OF FUNCTION drawPipe

function output_clicked(event, theUnit) {

  console.log('enter output_clicked');

  // Get port and unit IDs
  portOUT = event.target;
  portOUTid = portOUT.id;
  portOUTunitID = theUnit.id;

  // Check if this output port already has a pipe
  const tIndex = portOUTlist.findIndex(thisOne => thisOne === portOUTid);
  if (tIndex > -1) {
    // Don't start the pipe, this out port already has pipe
    event.stopPropagation();
    console.log('  RETURN port out already has pipe!');
    return;
  }

  // Only start piping if Alt/Option key is down, not already piping, and port is free
  const modkey = event.getModifierState("Alt"); // Alt is Option on Mac
  if (modkey && !isPiping && tIndex === -1) {
    isPiping = true;
    console.log('  set isPiping = true');
    console.log('  portOUTid = ' + portOUTid);

    drawPipe(event);
    reportStatus('output_clicked just after drawPipe(event)');
  }

  console.log('just before end output_clicked, stopPropagation');
  event.stopPropagation();
} // END OF FUNCTION output_clicked

function input_clicked(event, theUnit) {

  console.log('enter function input_clicked()');

  // Get port and unit IDs
  portIN = event.target;
  portINid = portIN.id;
  portINunitID = theUnit.id;

  console.log('  portINid = ' + portINid);
  console.log('  portINunitID = ' + portINunitID);
  console.log('  portOUTunitID = ' + portOUTunitID);

  if (isPiping) {
    // Prevent piping to the same unit
    if (portINunitID === portOUTunitID) {
      console.log('  port in on same unit as port out!');
      if (svg && pipe) {
        svg.removeChild(pipe);
      }
      // Reset piping state and globals
      isPiping = false;
      portOUTid = null;
      portINid = null;
      pipeID = null;
      portOUTunitID = null;
      portINunitID = null;
      document.removeEventListener('mousemove', updatePipe);
      event.stopPropagation();
      console.log('  RETURN clicked same unit, pipe removed');
      return;
    }

    // Prevent connecting to an input that already has a pipe
    const tIndex = portINlist.findIndex(id => id === portINid);
    if (tIndex > -1) {
      console.log('  port in already has pipe!');
      event.stopPropagation();
      console.log('  RETURN clicked port in already with pipe');
      return;
    }

    // Add pipe connections
    console.log('  just before drawPipe');
    console.log('  portOUTid = ' + portOUTid);
    console.log('  portINid = ' + portINid);
    portOUTlist.push(portOUTid);
    portINlist.push(portINid);
    portINunitList.push(portINunitID);
    portOUTunitList.push(portOUTunitID);
    pipeIDlist.push(pipeID); // pipeID set in drawPipe()

    document.removeEventListener('mousemove', updatePipe);

    // End pipe at center of portIN
    const divScene = document.getElementById('div_scene');
    const divIN = document.getElementById(portINid);
    const divSceneRect = divScene.getBoundingClientRect();
    const divINRect = divIN.getBoundingClientRect();
    const nudge = -4;
    const x2 = Math.round(nudge + divINRect.left - divSceneRect.left + divINRect.width / 2);
    const y2 = Math.round(nudge + divINRect.top - divSceneRect.top + divINRect.height / 2);
    pipe.setAttribute('x2', x2);
    pipe.setAttribute('y2', y2);

    // Reset variables for next pipe
    isPiping = false;
    portOUTid = null;
    portINid = null;
    pipeID = null;
    portOUTunitID = null;
    portINunitID = null;

    reportStatus('  function input_clicked() after pipe added');
  } else {
    // If not piping and Alt/Option key is down, remove pipe from this input
    const modkey = event.getModifierState("Alt");
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
  if (!divScene || !pipe) {
    console.warn('updatePipe: div_scene or pipe not found');
    return;
  }

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
