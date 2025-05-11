'use strict';

/*
Design, text, images and code by Richard K. Herz, 2024-2025
Copyrights held by Richard K. Herz
Licensed for use under the GNU General Public License v3.0
https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// NOTE BOTH EXPORT & IMPORT SCRIPTS ARE CONTAINED IN THIS FILE 

function exportFlowSheet() {
    console.log('enter exportFlowSheet');

    // now need to generate a params array 
    // which includes params array from each unit in scene
    let exportParams = [];
    let numUnits = unitList.length;
    for (let n = 0; n < numUnits; n++) {
        exportParams[n] = processUnits[n].params
    }
    console.log('  make exportParams[0][0] = ' + exportParams[0][0]);
    console.log('  make exportParams[0][1] = ' + exportParams[0][1]);
    console.log('  make exportParams[1][0] = ' + exportParams[1][0]);
    console.log('  make exportParams[1][1] = ' + exportParams[1][1]);

    // Create a single object with all arrays
    const flowsheetData = {
        unitCountList,
        unitList,
        unitXlist,
        unitYlist,
        portOUTlist,
        portINlist,
        portOUTunitList,
        portINunitList,
        pipeIDlist,
        exportParams
    };

    // Add these debug lines before JSON.stringify
    console.log('Array dimensions check:');
    console.log('exportParams (2D):', exportParams);
    console.log('unitList (1D):', unitList);
    console.log('Full flowsheetData:', flowsheetData);

    // Convert to JSON string
    const jsonString = JSON.stringify(flowsheetData);
    // Add this to verify JSON conversion worked
    console.log('Parsed back:', JSON.parse(jsonString));
    
    // Store in cookie
    document.cookie = "flowsheetData=" + encodeURIComponent(jsonString) + ";max-age=3600";
    console.log('  flowsheetData saved to cookie');

    console.log('exit exportFlowSheet');
    
} // END FUNCTION exportFlowSheet 

// Function to get cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function importFlowSheet() {
    console.log('enter importFlowSheet');

    let exportParams = [];
    // other arrays are globals declared in process_main.js

    const savedData = getCookie('flowsheetData');
    if (savedData) {
        // Parse JSON string back to object
        const flowsheetData = JSON.parse(decodeURIComponent(savedData));
        
        // Verify flowsheetData exists and has expected structure
        if (!flowsheetData) {
            console.error('Error: flowsheetData is null or undefined');
            return;
        }

        // Restore all arrays, maintaining original structure
        ({
            unitCountList,
            unitList,
            unitXlist,
            unitYlist,
            portOUTlist,
            portINlist,
            portOUTunitList,
            portINunitList,
            pipeIDlist,
            exportParams
        } = flowsheetData);

        // Verify critical arrays were restored
        console.log('Restored arrays:');
        console.log('unitList:', unitList);
        console.log('exportParams (2D):', exportParams);
    } else {
        console.error('No saved flowsheet data found in cookie');
        return;
    }

    console.log('  get exportParams[0][0] = ' + exportParams[0][0]);
    console.log('  get exportParams[0][1] = ' + exportParams[0][1]);
    console.log('  get exportParams[1][0] = ' + exportParams[1][0]);
    console.log('  get exportParams[1][1] = ' + exportParams[1][1]);

    // now use these arrays to rebuild from a blank scene 

    // processUnits[] and unitCount are globals set in process_main.js 
    const nmax = unitList.length;
    // const el = document.getElementById("div_scene");
 
    for (let n = 0; n < nmax; n++) {

        let unitID = unitList[n];
        // split() returns an array, even when asking for just one element 
        // so need to add [0] to get the first element of that one element array
        let unitObject = unitID.split("_", 1)[0];
        console.log('  in for, unitObject = ' + unitObject);
        let unitCount = unitCountList[n]; // declared in process_main.js 
        let x = unitXlist[n];
        let y = unitYlist[n];
        let params = exportParams[n];
    
        placeUnitsOnImport(unitID, unitObject, unitCount, x, y, params);

    }; // END OF for loop to place units 

    // unitCount is the last value from loop
    // process_main.js needs this value of unitCount to add units
    // correctly after this import
    // // 
    // // so don't need to do below to get unitCount but leave this here as warning
    // // about getting last element in an array which will itself be an array
    // // and not a scalar & if don't then get future elements as 21, 211, 2111, etc.
    // // so need to add [0] to get the value of that 1st element of the one element array
    // unitCount = unitCountList[nmax-1][0];
    //  // 
    console.log('  final unitCount = ' + unitCount);

    // now draw the pipes 
    const jmax = portINlist.length;
    for (let j = 0; j < jmax; j++) {
        portINid = portINlist[j];
        portOUTid = portOUTlist[j];
        drawPipeOnImport(portINid, portOUTid);
    }; // END OF for loop to draw pipes 

    console.log('exit importFlowSheet');
} // END OF FUNCTION importFlowSheet

function placeUnitsOnImport(unitID, unitObject, unitCount, x, y, params) {
    console.log('enter placeUnitsOnImport');
    const el = document.getElementById("div_scene"); 
    // see similar switch in process_main.js as user builds flowsheet manually
    switch (unitObject) {
        case 'feed':
            el.innerHTML += buildFeed(unitCount, x, y);
            processUnits.push(new Feed(unitCount, unitID, x, y, params));
            console.log('    add new unit to processUnits[], unitCount = ' + unitCount);
            break;
        case 'cstr':
            el.innerHTML += buildCSTR(unitCount, x, y);
            processUnits.push(new CSTR(unitCount, unitID, x, y, params));
            console.log('add new unit to processUnits[], unitCount = ' + unitCount);
            break;
        case 'pfr':
            el.innerHTML += buildPFR(unitCount, x, y);
            processUnits.push(new PFR(unitCount, unitID, x, y, params));
            console.log('  add new unit to processUnits[], unitCount = ' + unitCount);
            break;
        case 'mixer':
            el.innerHTML += buildMixer(unitCount, x, y);
            processUnits.push(new Mixer(unitCount, unitID, x, y, params));
            console.log('  add new unit to processUnits[], unitCount = ' + unitCount);
            break;
        case 'splitter':
            el.innerHTML += buildSplitter(unitCount, x, y);
            processUnits.push(new Splitter(unitCount, unitID, x, y, params));
            console.log('  add new unit to processUnits[], unitCount = ' + unitCount);
            break;
        case 'tank':
            el.innerHTML += buildTank(unitCount, x, y);
            processUnits.push(new Tank(unitCount, unitID, x, y, params));
            console.log('  add new unit to processUnits[], unitCount = ' + unitCount);
            break;
        default:
            console.log('  switch DEFAULT in importFlowSheet, unitObject = ' + unitObject);
    }; // END OF SWITCH
    console.log('exit placeUnitsOnImport');
} // END OF FUNCTION placeUnitsOnImport

function drawPipeOnImport(portINid, portOUTid) {

    console.log('enter drawPipeOnImport');
    console.log('  portOUTid = ' + portOUTid);
    console.log('  portINid = ' + portINid);
  
    const divScene = document.getElementById('div_scene');
    const divOUT = document.getElementById(portOUTid);
  
    const divSceneRect = divScene.getBoundingClientRect();
    const divOUTRect = divOUT.getBoundingClientRect();
  
    // Calculate center relative to divScene's top-left corner
    const nudge = -4; // nudge to center pipe on div
    const x1 = Math.round(nudge + divOUTRect.left - divSceneRect.left + divOUTRect.width / 2);
    const y1 = Math.round(nudge + divOUTRect.top - divSceneRect.top + divOUTRect.height / 2);
  
    const svg = document.getElementById("svg_pipes");
  
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
  
    const pipeID = 'pipe_' + portOUTid; // also used in other functions & pipeIDlist[]
  
    pipe.setAttribute('id', pipeID);
    // add ID to pipeIDlist when pipe fixed to an input 
  
    const thisID = document.getElementById(portOUTid);
    console.log('  >>>> svg thisID = ' + thisID.id);
  
    // end pipe at center of portIN
    const divIN = document.getElementById(portINid);
    const divINRect = divIN.getBoundingClientRect();
    // Calculate center relative to divScene's top-left corner
    const x2 = Math.round(nudge + divINRect.left - divSceneRect.left + divINRect.width / 2);
    const y2 = Math.round(nudge + divINRect.top - divSceneRect.top + divINRect.height / 2);
    pipe.setAttribute('x2', x2);
    pipe.setAttribute('y2', y2);

    pipe.setAttribute('stroke', 'black');
    pipe.setAttribute('stroke-width', '3');
    pipe.setAttribute('marker-end', 'url(#arrowhead)');  // Add arrowhead
  
    svg.appendChild(pipe);
   
    reportStatus('end drawPipeOnImport()');
    console.log('just before end drawPipeOnImport()');
  
  } // END OF FUNCTION drawPipeOnImport

