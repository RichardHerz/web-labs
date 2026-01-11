'use strict';

/*
Design, text, images and code by Richard . Herz, 2024-2025
Copyrights held by Richard . Herz
Licensed for use under the GNU General Public License v3.0
https://www.gnu.org/licenses/gpl-3.0.en.html 
*/

// SEE LITERAL OBJECT main DEFINITION BELOW THESE
// document and window functions

document.addEventListener('DOMContentLoaded', function() {

  const divScene = document.getElementById('div_scene');
  if (divScene) {
    divScene.addEventListener('click', function(event) {
      main.sceneDivClicked(event);
    });
  } else {
    console.error('scene div not found in the document');
  }

  const clearButton = document.getElementById('button_clear');
  if (clearButton) {
    clearButton.addEventListener('click', main.clearFlowsheet.bind(main));
  } else {
    console.error('Clear button not found in the document');
  }

}); // END OF BLOCK adding eventListeners for main html elements

// export flowsheet to browser cookie to save when page closed
window.onbeforeunload = function() {

  console.log('UNLOAD enter window.onbeforeunload ');
  console.log('  export flowsheet to browser cookie');

  // THESE LINES PUT UP SYSTEM DIALOG 
  // BUT MUST ADD event TO FUNCTION ARGUMENT INPUT 
  // event.preventDefault(); // Not required, but recommended for clarity
  // event.returnValue = ''; // Required to trigger the dialog in most browsers

  expImpCookie.exportFlowsheet(); // exportFlowsheet() in file export_cookie.js 
  
  console.log('UNLOAD after call to exportFlowsheet() ');

  // NOTE: CAN ALSO ADD FUNCTION CALL ON WEB LINKS BACK TO WEB LABS 

  // return true line below puts up a browser alert
  // asking whether or not you want to leave the page 

  // return true; // << XXX deactivated

  // a custom alert() is not allowed while unloading a page 
  // since browser puts up its own alert with return true

  // // THIS DOES SAME THING AS window.onbeforeunload()
  // window.addEventListener('beforeunload', () => {
  //   console.log('HIT ON window.addEventListener beforeunload ');
  //   // alert() not allowed while unloading a page 
  // });

}; // END OF window.onbeforeunload

// DEFINE GLOBAL VARIABLE called by controller
// processUnits[] holds an object for each unit currently on display
// in web labs, used this >> let processUnits = new Object();
// but here use an array to hold the unit objects so can
// delete objects for units removed from scene with array method 
let processUnits = [];

// DEFINE OBJECT main WITH MAIN FUNCTIONS FOR THE SIM
const main = {

  // METHODS: 
    // clearFlowsheet 
    // param_btn_clicked 
    // findProcessUnitIndex 
    // buildPalette 
    // paletteObjectClicked 
    // sceneDivClicked 
    // checkCursor 
    // sceneObjectClicked 
    // removeUnit 
    // removeConnectedPipes 
    // removeFromArray 
    // removePipe 
    // drawPipe 
    // output_clicked 
    // input_clicked 
    // updatePipe 
    // reportStatus 

  // DECLARE VARIABLES USED THROUGHOUT main OBJECT
  addingUnit: false, // toggles for option key down (true) or not (false) on click
  unitCount: 0, // number of units placed on scene including those removed 
  clickedID: undefined, // used to identify object clicked
  paletteObject: undefined, // assigned in paletteObjectClicked, used in sceneDivClicked
  isPiping: false,
  portOUT: null,
  portIN: null,
  portOUTid: null,
  portINid: null,
  portOUTunitID: null,
  portINunitID: null,
  params: [], // unit parameters
  portOUTlist: [],
  portINlist: [],
  portOUTunitList: [],
  portINunitList: [],
  svg: null,
  svgNS: "http://www.w3.org/2000/svg",
  pipe: null, // svg element
  pipeID: null,
  pipeIDlist: [],
  updatePipeHandler: null,

  // NOTE: unitList[] is used in unit update functions 
  //       unitCountList[] only used below in reportStatus() for 
  //       ease of access during debugging 
  //       both pieces of info can be obtained from object's entry in processUnits array 
  unitList: [], // ID's of unit objects currently on display
  unitCountList: [], // unitCount values of units currently on display
  unitXlist: [], // x locations of units for restoring scene
  unitYlist: [], // y locations of units for restoring  scene

  clearFlowsheet: function() {
    console.log('enter clearFlowsheet');
    interfacer.resetThisLab(); // stops run timer
    // Remove all units from the scene
    // loop down (if up, early units get deleted from list & index shifts)
    while (this.unitList.length > 0) {
      const theObject = this.unitList[this.unitList.length - 1];
      console.log(`  Removing unit: ${theObject}`);
      this.removeUnit(theObject); // also removes connected pipes
    }
    // Clear other related arrays to fully reset state
    processUnits.length = 0; // clear global processUnits array
    this.unitCountList.length = 0;
    this.unitXlist.length = 0;
    this.unitYlist.length = 0;
    this.portOUTlist.length = 0;
    this.portINlist.length = 0;
    this.portOUTunitList.length = 0;
    this.portINunitList.length = 0;
    this.pipeIDlist.length = 0;

    // clear flowsheet cookie
    expImpCookie.clearFlowsheetCookie(); // in export_cookie.js

    console.log('exit clearFlowsheet');
  }, // END OF FUNCTION clearFlowsheet

  param_btn_clicked: function(event, tUnitCount) {
    // processUnits array is a project global also called by the controller
    const tUnit = processUnits.find(unit => unit && unit.unitCount === tUnitCount);
    if (tUnit) {
      tUnit.param_btn_clicked();
    } else {
      console.error(`No unit found with unitCount ${tUnitCount}`);
    }
    event.stopPropagation(); // stops event bubbling up to unit
  }, // END OF FUNCTION param_btn_clicked 

  findProcessUnitIndex: function(searchUnitID) {
    console.log('enter findProcessUnitIndex, searchUnitID = ' + searchUnitID);
    // processUnits array is a project global also called by the controller
    const index = processUnits.findIndex(unit => unit && unit.unitID === searchUnitID);
    if (index !== -1) {
      console.log('  index found = ' + index);
      console.log('  processUnits unit ID = ' + processUnits[index].unitID);
    }
    return index; // returns -1 if not found
  }, // END OF FUNCTION findProcessUnitIndex 

  buildPalette: function() {
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
    el.insertAdjacentHTML('beforeend', buildFeed(tU, sepX, sepY));
    //----------------------
    el.insertAdjacentHTML('beforeend', buildCSTR(tU, sepX, 14+sepY+(sepY+objY)));
    //----------------------
    el.insertAdjacentHTML('beforeend', buildPFR(tU, sepX, 14+sepY+2*(sepY+objY)));
    //----------------------
    el.insertAdjacentHTML('beforeend', buildMixer(tU, sepX, 14+sepY+3*(sepY+objY)));
    //----------------------
    el.insertAdjacentHTML('beforeend', buildSplitter(tU, sepX, 6+sepY+4*(sepY+objY)));
    //----------------------
    el.insertAdjacentHTML('beforeend', buildTank(tU, sepX, sepY+5*(sepY+objY)));
    //---------------------- 
    console.log('exit buildPalette()');
  }, // END OF FUNCTION buildPalette

  paletteObjectClicked: function(event, theObject) {
    console.log('enter paletteObjectClicked, theObject = ' + theObject);
    this.paletteObject = theObject; // used in sceneDivClicked
    this.clickedID = event.target.id;
    // Use Alt/Option key to trigger addingUnit mode
    const modkey = event.getModifierState("Alt"); // Alt is Option on Mac
    if (modkey) {
      this.addingUnit = true; // toggles to false in sceneDivClicked()
      // Set cursor style for clicked element and scene
      const elClicked = document.getElementById(this.clickedID);
      const elScene = document.getElementById("div_scene");
      if (elClicked) elClicked.style.cursor = "copy";
      if (elScene) elScene.style.cursor = "copy";
    }
    console.log('exit paletteObjectClicked');
  }, // END OF FUNCTION paletteObjectClicked

  sceneDivClicked: function(event) {
    console.log('enter sceneDivClicked');

    // Handle pipe removal if user clicks off an object while piping
    if (this.isPiping) {
      if (this.svg && this.pipe) {
        this.svg.removeChild(this.pipe);
      }
      this.isPiping = false;
      this.portOUTid = null;
      this.portINid = null;
      console.log(`  before set null this.portOUTunitID = ${this.portOUTunitID}`);
      this.portOUTunitID = null;
      console.log(`  after set this.portOUTunitID to null`);
      event.stopPropagation();
      return;
    }

    // Handle adding a new unit to the scene
    if (this.addingUnit) {
      console.log('  addingUnit true, toggle to false, add unit to scene');
      this.addingUnit = false;

      this.unitCount += 1;
      this.unitCountList.push(this.unitCount);

      console.log('  unitCount = ' + this.unitCount);

      // Get click coordinates relative to sceneDiv
      const rect = event.target.getBoundingClientRect();
      const x = Math.round(event.clientX - rect.left);
      const y = Math.round(event.clientY - rect.top);

      console.log('  x, y = ' + x + ', ' + y);

      let el = document.getElementById("div_scene");
      let unitID;
      this.unitXlist.push(x);
      this.unitYlist.push(y);

      // Add the selected unit type
      switch (this.paletteObject) {
        case 'feed':
          el.insertAdjacentHTML('beforeend', buildFeed(this.unitCount, x, y));
          unitID = `feed_${this.unitCount}`;
          this.unitList.push(unitID);
          this.params = [1, 10];
          // processUnits array is a project global also called by the controller
          processUnits.push(new Feed(this.unitCount, unitID, x, y, this.params));
          break;
        case 'cstr':
          el.insertAdjacentHTML('beforeend', buildCSTR(this.unitCount, x, y));
          unitID = `cstr_${this.unitCount}`;
          this.unitList.push(unitID);
          this.params = [0.01, 100, 1];
          // processUnits array is a project global also called by the controller
          processUnits.push(new CSTR(this.unitCount, unitID, x, y, this.params));
          break;
        case 'pfr':
          el.insertAdjacentHTML('beforeend', buildPFR(this.unitCount, x, y));
          unitID = `pfr_${this.unitCount}`;
          this.unitList.push(unitID);
          this.params = [0.01, 100, 1];
          // processUnits array is a project global also called by the controller
          processUnits.push(new PFR(this.unitCount, unitID, x, y, this.params));
          break;
        case 'mixer':
          el.insertAdjacentHTML('beforeend', buildMixer(this.unitCount, x, y));
          unitID = `mixer_${this.unitCount}`;
          this.unitList.push(unitID);
          this.params = [];
          // processUnits array is a project global also called by the controller
          processUnits.push(new Mixer(this.unitCount, unitID, x, y, this.params));
          break;
        case 'splitter':
          el.insertAdjacentHTML('beforeend', buildSplitter(this.unitCount, x, y));
          unitID = `splitter_${this.unitCount}`;
          this.unitList.push(unitID);
          this.params = [0.5];
          // processUnits array is a project global also called by the controller
          processUnits.push(new Splitter(this.unitCount, unitID, x, y, this.params));
          break;
        case 'tank':
          el.insertAdjacentHTML('beforeend', buildTank(this.unitCount, x, y));
          unitID = `tank_${this.unitCount}`;
          this.unitList.push(unitID);
          this.params = [];
          // processUnits array is a project global also called by the controller
          processUnits.push(new Tank(this.unitCount, unitID, x, y, this.params));
          break;
        default:
          console.warn('Unknown paletteObject:', this.paletteObject);
          break;
      }

      // Reset cursor styles
      el.style.cursor = "default";
      const clickedEl = document.getElementById(this.clickedID);
      if (clickedEl) clickedEl.style.cursor = "default";

      this.reportStatus('at end sceneDivClicked');
    }
  }, // END OF FUNCTION sceneDivClicked

  checkCursor: function(event) {
    console.log('enter checkCursor, event = ' + event);
    let el = document.getElementById(event.target.id);
    if (this.addingUnit) {
      el.style.cursor = "copy";
    } else {
      el.style.cursor = "default";
    }
  }, // END OF FUNCTION checkCursor

  sceneObjectClicked: function(event, objectUnit) {
    console.log('enter sceneObjectClicked');

    // WARNING: input argument objectUnit must be specified as a string in _build file, e.g., 
    // 'feed_${zz}' in onclick="sceneObjectClicked(event, ${zz}, 'feed_${zz}')" 

    // when removing this unit, also 
    // remove any and all pipes connected to this unit

    if (!this.addingUnit) {
      console.log('  addingUnit is false');
      // delete unit from display 
      // addingUnit might be true if click on existing object to add new overlapping one
      let modkey = event.getModifierState("Alt"); // Alt is Option on Mac
      console.log('  modkey = ' + modkey);
      if (modkey) { 
        this.removeUnit(objectUnit);
      }
    }
  }, // END OF FUNCTION sceneObjectClicked

  removeUnit: function(objectUnit) {
    console.log('enter removeUnit, objectUnit = ' + objectUnit);

    // Remove all pipes connected to this unit
    this.removeConnectedPipes(objectUnit, this.portINunitList, this.portINlist);
    this.removeConnectedPipes(objectUnit, this.portOUTunitList, this.portINlist);

    // Remove the unit's DOM element
    const el = document.getElementById(objectUnit);
    if (el) el.remove();

    // Remove from arrays
    this.removeFromArray(this.unitList, objectUnit);
    this.removeFromArray(this.unitCountList, objectUnit);
    this.removeFromArray(this.unitXlist, objectUnit);
    this.removeFromArray(this.unitYlist, objectUnit);

    // Remove from processUnits
    // processUnits array is a project global also called by the controller
    const indexToRemove = processUnits.findIndex(unit => unit && unit.unitID === objectUnit);
    if (indexToRemove !== -1) processUnits.splice(indexToRemove, 1);

    this.reportStatus('removeUnit after removing an object');
  }, // END OF FUNCTION removeUnit 

  removeConnectedPipes: function(objectUnit, unitList, pipeList) {
    let tIndex;
    while ((tIndex = unitList.findIndex(u => u === objectUnit)) !== -1) {
      this.removePipe(pipeList[tIndex]);
    }
  },

  removeFromArray: function(arr, value) {
    const idx = arr.indexOf(value);
    if (idx !== -1) arr.splice(idx, 1);
  },

  removePipe: function(pPortINid) {
    console.log('enter removePipe');
    console.log('  pPortINid = ' + pPortINid);
    this.reportStatus('removePipe on enter removePipe(pPortINid');

    const svg = document.getElementById("svg_pipes");
    if (!svg) {
      console.error('  ERROR: id svg_pipes does not exist, so RETURN');
      return;
    }

    // Find the index of the pipe to remove
    const tIndex = this.portINlist.findIndex(thisOne => thisOne === pPortINid);
    if (tIndex === -1) {
      console.warn(`  WARNING: pPortINid ${pPortINid} not found in portINlist`);
      return;
    }

    const pipeIdToRemove = this.pipeIDlist[tIndex];
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
    this.portOUTlist.splice(tIndex, 1);
    this.portINlist.splice(tIndex, 1);
    this.portINunitList.splice(tIndex, 1);
    this.portOUTunitList.splice(tIndex, 1);
    this.pipeIDlist.splice(tIndex, 1);

    // Reset pipe-related globals
    this.isPiping = false;
    this.portOUTid = null;
    this.portINid = null;
    console.log(`  before set null this.portOUTunitID = ${this.portOUTunitID}`);
    this.portOUTunitID = null;
    console.log(`  after set this.portOUTunitID to null`);
    this.pipeID = null;

    this.reportStatus('end of removePipe()');
    console.log('just before end removePipe');
  }, // END OF FUNCTION removePipe

  drawPipe: function(event) {
    console.log('enter drawPipe');
    console.log('  portOUTid = ' + this.portOUTid);

    const divScene = document.getElementById('div_scene');
    const divOUT = document.getElementById(this.portOUTid);

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

    this.svg = document.getElementById("svg_pipes");
    if (!this.svg) {
      console.error('SVG element with id "svg_pipes" not found');
      return;
    }

    // Ensure SVG is on top and does not block pointer events
    this.svg.style.zIndex = '1000';
    this.svg.style.pointerEvents = 'none';

    // Create marker definition if it doesn't exist
    if (!document.getElementById("arrowhead")) {
      const defs = document.createElementNS(this.svgNS, "defs");
      const marker = document.createElementNS(this.svgNS, "marker");
      marker.setAttribute("id", "arrowhead");
      marker.setAttribute("markerWidth", "5");
      marker.setAttribute("markerHeight", "3.5");
      marker.setAttribute("refX", "4.5");
      marker.setAttribute("refY", "1.75");
      marker.setAttribute("orient", "auto");

      const polygon = document.createElementNS(this.svgNS, "polygon");
      polygon.setAttribute("points", "0 0, 5 1.75, 0 3.5");
      polygon.setAttribute("fill", "black");

      marker.appendChild(polygon);
      defs.appendChild(marker);
      this.svg.appendChild(defs);
    }

    // Create pipe element, as svg line, with arrowhead
    this.pipe = document.createElementNS(this.svgNS, "line");
    this.pipeID = 'pipe_' + this.portOUTid;
    this.pipe.setAttribute('id', this.pipeID);
    this.pipe.setAttribute('x1', x1);
    this.pipe.setAttribute('y1', y1);

    // Calculate pipe end position relative to scene div
    const x2 = Math.round(nudge + event.clientX - divSceneRect.left);
    const y2 = Math.round(nudge + event.clientY - divSceneRect.top);
    this.pipe.setAttribute('x2', x2);
    this.pipe.setAttribute('y2', y2);

    this.pipe.setAttribute('stroke', 'black');
    this.pipe.setAttribute('stroke-width', '3');
    this.pipe.setAttribute('marker-end', 'url(#arrowhead)');

    this.svg.appendChild(this.pipe);

    // Store the bound handler once
    if (!this.updatePipeHandler) {
      this.updatePipeHandler = this.updatePipe.bind(this);
    }
    document.addEventListener('mousemove', this.updatePipeHandler);

    this.reportStatus('end drawPipe()');
    console.log('just before end drawPipe()');
  }, // END OF FUNCTION drawPipe

  output_clicked: function(event, theUnit) {
    console.log('enter output_clicked');
    console.log(`  the unit = ${theUnit}`);
    console.log(`  the unit.id = ${theUnit.id}`);
 
    // Get port and unit IDs
    this.portOUT = event.target;
    this.portOUTid = this.portOUT.id;
    this.portOUTunitID = theUnit.id;
   console.log(`  this.portOUTunitID = ${this.portOUTunitID}`);
 
    // Check if this output port already has a pipe
    const tIndex = this.portOUTlist.findIndex(thisOne => thisOne === this.portOUTid);
    if (tIndex > -1) {
      // Don't start the pipe, this out port already has pipe
      event.stopPropagation();
      console.log('  RETURN port out already has pipe!');
      return;
    }

    // Only start piping if Alt/Option key is down, not already piping, and port is free
    const modkey = event.getModifierState("Alt"); // Alt is Option on Mac
    if (modkey && !this.isPiping && tIndex === -1) {
      this.isPiping = true;
      console.log('  set isPiping = true');
      console.log('  portOUTid = ' + this.portOUTid);

      this.drawPipe(event);
      this.reportStatus('output_clicked just after drawPipe(event)');
    }

    console.log('just before end output_clicked, stopPropagation');
    event.stopPropagation();
  }, // END OF FUNCTION output_clicked

  input_clicked: function(event, theUnit) {
    console.log('enter function input_clicked()');
    console.log(`  the unit.id = ${theUnit.id}`);

    // Get port and unit IDs
    this.portIN = event.target;
    this.portINid = this.portIN.id;
    this.portINunitID = theUnit.id;

    console.log('  this.portINid = ' + this.portINid);
    console.log('  this.portINunitID = ' + this.portINunitID);
    console.log('  this.portOUTunitID = ' + this.portOUTunitID);

    if (this.isPiping) {
      // Prevent piping to the same unit
      if (this.portINunitID === this.portOUTunitID) {
        console.log('  port in on same unit as port out!');
        if (this.svg && this.pipe) {
          this.svg.removeChild(this.pipe);
        }
        // Reset piping state and globals
        this.isPiping = false;
        this.portOUTid = null;
        this.portINid = null;
        this.pipeID = null;
        console.log(`  before set null this.portOUTunitID = ${this.portOUTunitID}`);
        this.portOUTunitID = null;
        console.log(`  after set this.portOUTunitID to null`);
        this.portINunitID = null;
        document.removeEventListener('mousemove', this.updatePipe.bind(this));
        event.stopPropagation();
        console.log('  RETURN clicked same unit, pipe removed');
        return;
      }

      // Prevent connecting to an input that already has a pipe
      const tIndex = this.portINlist.findIndex(id => id === this.portINid);
      if (tIndex > -1) {
        console.log('  port in already has pipe!');
        event.stopPropagation();
        console.log('  RETURN clicked port in already with pipe');
        return;
      }

      // Add pipe connections
      console.log('  just before drawPipe');
      console.log('  portOUTid = ' + this.portOUTid);
      console.log('  portINid = ' + this.portINid);
      this.portOUTlist.push(this.portOUTid);
      this.portINlist.push(this.portINid);
      this.portINunitList.push(this.portINunitID);
      this.portOUTunitList.push(this.portOUTunitID);
      this.pipeIDlist.push(this.pipeID); // pipeID set in drawPipe()

      // Remove the event listener using the stored handler
      if (this.updatePipeHandler) {
        document.removeEventListener('mousemove', this.updatePipeHandler);
      }
      // End pipe at center of portIN
      const divScene = document.getElementById('div_scene');
      const divIN = document.getElementById(this.portINid);
      const divSceneRect = divScene.getBoundingClientRect();
      const divINRect = divIN.getBoundingClientRect();
      const nudge = -4;
      const x2 = Math.round(nudge + divINRect.left - divSceneRect.left + divINRect.width / 2);
      const y2 = Math.round(nudge + divINRect.top - divSceneRect.top + divINRect.height / 2);
      this.pipe.setAttribute('x2', x2);
      this.pipe.setAttribute('y2', y2);

      // Reset variables for next pipe
      this.isPiping = false;
      this.portOUTid = null;
      this.portINid = null;
      this.pipeID = null;
      console.log(`  before set null this.portOUTunitID = ${this.portOUTunitID}`);
      this.portOUTunitID = null;
      console.log(`  after set this.portOUTunitID to null`);
      this.portINunitID = null;

      this.reportStatus('  function input_clicked() after pipe added');
    } else {
      // If not piping and Alt/Option key is down, remove pipe from this input
      const modkey = event.getModifierState("Alt");
      if (modkey) {
        if (this.updatePipeHandler) {
          document.removeEventListener('mousemove', this.updatePipeHandler);
        }
        this.reportStatus('  function input_clicked() just before removePipe');
        this.removePipe(this.portINid);
        this.reportStatus('  function input_clicked() just after removePipe');
      }
    }

    this.reportStatus('end of function input_clicked()');
    console.log('just before end function input_clicked(), stopPropagation');
    event.stopPropagation(); // stops event bubbling up to unit

  }, // END OF FUNCTION input_clicked 

  updatePipe: function(event) {
    const divScene = document.getElementById('div_scene');
    if (!divScene || !this.pipe) {
      console.warn('updatePipe: div_scene or pipe not found');
      return;
    }

    const divSceneRect = divScene.getBoundingClientRect();
    const nudge = -4; // match nudge used in drawPipe

    // Calculate position relative to scene div, accounting for scroll
    const x2 = Math.round(nudge + event.clientX - divSceneRect.left);
    const y2 = Math.round(nudge + event.clientY - divSceneRect.top);

    this.pipe.setAttribute('x2', x2);
    this.pipe.setAttribute('y2', y2);
  },// END OF FUNCTION updatePipe 

  reportStatus: function(caller) {
    // console.log('--- reportStatus in ' + caller + ' ---------');
    // console.log('  unitCountList = ' + this.unitCountList);
    // console.log('  unitList = ' + this.unitList);
    // console.log('  pipeIDlist = ' + this.pipeIDlist);
    // console.log('  portOUTlist = ' + this.portOUTlist);
    // console.log('  portOUTunitList = ' + this.portOUTunitList);
    // console.log('  portINlist = ' + this.portINlist);
    // console.log('  portINunitList = ' + this.portINunitList);
    // console.log('---- end reportStatus ---------');
  }, // END OF FUNCTION reportStatus

} // END OF OBJECT LITERAL main DEFINITION
