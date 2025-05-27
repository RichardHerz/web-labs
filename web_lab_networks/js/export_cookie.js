'use strict';

/*
Design, text, images and code by Richard K. Herz, 2024-2025
Copyrights held by Richard K. Herz
Licensed for use under the GNU General Public License v3.0
https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// NOTE BOTH EXPORT & IMPORT SCRIPTS ARE CONTAINED IN THIS FILE 

function exportFlowsheet() {
    console.log('enter exportFlowsheet');
 
    if (main.unitCount == 0) {
        // clear cookie so old version does not
        // load on return
        clearFlowsheetCookie();
        console.log('  clear flowsheetData cookie');
        console.log('  RETURN FROM exportFlowsheet, no units!');
        return;
    }

    // now need to generate a params array 
    // which includes params array from each unit in scene
    let exportParams = [];
    let numUnits = main.unitList.length;
    for (let n = 0; n < numUnits; n++) {
        exportParams[n] = processUnits[n].params
    }

    // // WARNING: THIS LOG REQUIRES TWO UNITS WITH TWO PARAMS
    // // OR GET ERROR
    // console.log('  make exportParams[0][0] = ' + exportParams[0][0]);
    // console.log('  make exportParams[0][1] = ' + exportParams[0][1]);
    // console.log('  make exportParams[1][0] = ' + exportParams[1][0]);
    // console.log('  make exportParams[1][1] = ' + exportParams[1][1]);

    // Create a single object with all arrays
    const flowsheetData = {
        unitCountList: main.unitCountList,
        unitList: main.unitList,
        unitXlist: main.unitXlist,
        unitYlist: main.unitYlist,
        portOUTlist: main.portOUTlist,
        portINlist: main.portINlist,
        portOUTunitList: main.portOUTunitList,
        portINunitList: main.portINunitList,
        pipeIDlist: main.pipeIDlist,
        exportParams: exportParams
    };

    // Add these debug lines before JSON.stringify
    console.log('Array dimensions check:');
    console.log('main.unitList (1D):', main.unitList);
    console.log('exportParams (2D):', exportParams);
    console.log('Full flowsheetData:', flowsheetData);

    // Convert to JSON string
    const jsonString = JSON.stringify(flowsheetData);
    // Add this to verify JSON conversion worked
    console.log('Parsed back:', JSON.parse(jsonString));

    // Store in cookie, 
    // where max-age=34560000 seconds is max allowable 400 days
    document.cookie = "flowsheetData=" + encodeURIComponent(jsonString) + ";max-age=34560000";
    console.log('  flowsheetData saved to cookie');

    console.log('exit exportFlowsheet');

} // END FUNCTION exportFlowsheet 

// FUNCTION TO CLEAR FLOWSHEET COOKIE
function clearFlowsheetCookie() {
    console.log('enter clearFlowsheetCookie');

    const flowsheetData = 'none';
    // Convert to JSON string
    const jsonString = JSON.stringify(flowsheetData);
    // Add this to verify JSON conversion worked
    console.log('  parsed back: ', JSON.parse(jsonString));

    // Store in cookie, 
    // where max-age=34560000 seconds is max allowable 400 days
    document.cookie = "flowsheetData=" + encodeURIComponent(jsonString) + ";max-age=34560000";
    console.log(`  flowsheetData = 'none' saved to cookie`);

    // // SUGGESTION FROM COPILOT CHATGPT-4.1 
    // // Try to clear with path=/ (site-wide)
    // document.cookie = "flowsheetData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // // Also try to clear without path (current directory)
    // document.cookie = "flowsheetData=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    console.log('exit clearFlowsheetCookie');
} // END OF FUNCTION clearFlowsheetCookie 

// Function to get cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function importFlowsheet() {
    console.log('enter importFlowsheet');

    let exportParams = [];
    // other arrays are declared in process_main.js

    const savedData = getCookie('flowsheetData');
    if (savedData) {
        // Parse JSON string back to object
        const flowsheetData = JSON.parse(decodeURIComponent(savedData));

        // Verify flowsheetData exists and has expected structure
        if (!flowsheetData) {
            console.log('  oops! flowsheetData is null or undefined');
            return;
        }

        if (flowsheetData === 'none') {
            console.log(`  oops! flowsheetData is 'none' `);
            return;
        }

        // Restore all arrays, maintaining original structure
        main.unitCountList    = flowsheetData.unitCountList;
        main.unitList         = flowsheetData.unitList;
        main.unitXlist        = flowsheetData.unitXlist;
        main.unitYlist        = flowsheetData.unitYlist;
        main.portOUTlist      = flowsheetData.portOUTlist;
        main.portINlist       = flowsheetData.portINlist;
        main.portOUTunitList  = flowsheetData.portOUTunitList;
        main.portINunitList   = flowsheetData.portINunitList;
        main.pipeIDlist       = flowsheetData.pipeIDlist;
        exportParams          = flowsheetData.exportParams;

        // Verify critical arrays were restored
        console.log('Restored arrays:');
        console.log('main.unitList:', main.unitList);
        console.log('exportParams (2D):', exportParams);
    } else {
        console.log('  oops! no saved flowsheet data found in cookie');
        return;
    }

    // now use these arrays to rebuild from a blank scene 

    // processUnits[] is a global set in process_main.js 
    const nmax = main.unitList.length;
    // const el = document.getElementById("div_scene");

    for (let n = 0; n < nmax; n++) {

        let unitID = main.unitList[n];
        // split() returns an array, even when asking for just one element 
        // so need to add [0] to get the first element of that one element array
        let unitObject = unitID.split("_", 1)[0];
        console.log('  in for, unitObject = ' + unitObject);
        let thisUnitCount = main.unitCountList[n];
        let x = main.unitXlist[n];
        let y = main.unitYlist[n];
        let params = exportParams[n];

        placeUnitsOnImport(unitID, unitObject, thisUnitCount, x, y, params);

    }; // END OF for loop to place units 

    // final value of main.unitCount is the last value from loop
    // XXX console.log('  final unitCount = ' + main.unitCountList[n]);

    // now draw the pipes 
    const jmax = main.portINlist.length;
    for (let j = 0; j < jmax; j++) {
        let portINid = main.portINlist[j];
        let portOUTid = main.portOUTlist[j];
        drawPipeOnImport(portINid, portOUTid);
    }; // END OF for loop to draw pipes 

    console.log('exit importFlowsheet');
} // END OF FUNCTION importFlowsheet

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
            console.log('  switch DEFAULT in importFlowsheet, unitObject = ' + unitObject);
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
        const defs = document.createElementNS(main.svgNS, "defs");
        const marker = document.createElementNS(main.svgNS, "marker");
        marker.setAttribute("id", "arrowhead");
        marker.setAttribute("markerWidth", "5");    // changed from 10 to 5
        marker.setAttribute("markerHeight", "3.5"); // changed from 7 to 3.5
        marker.setAttribute("refX", "4.5");         // changed from 9 to 4.5
        marker.setAttribute("refY", "1.75");        // changed from 3.5 to 1.75
        marker.setAttribute("orient", "auto");

        const polygon = document.createElementNS(main.svgNS, "polygon");
        polygon.setAttribute("points", "0 0, 5 1.75, 0 3.5"); // changed from "0 0, 10 3.5, 0 7"
        polygon.setAttribute("fill", "black");

        marker.appendChild(polygon);
        defs.appendChild(marker);
        svg.appendChild(defs);
    }

    // Create pipe element, as svg line, with arrowhead
    const pipe = document.createElementNS(main.svgNS, "line");
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

    main.reportStatus('end drawPipeOnImport()');
    console.log('just before end drawPipeOnImport()');

} // END OF FUNCTION drawPipeOnImport

