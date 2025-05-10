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

    const popupMessage = 
        'unitCountList: ' + unitCountList.join(', ')
        + '<br>' + 'unitList: ' + unitList.join(', ')
        + '<br>' + 'unitXlist: ' + unitXlist.join(', ')
        + '<br>' + 'unitYlist: ' + unitYlist.join(', ')
        + '<br>' + 'portOUTlist: ' + portOUTlist.join(', ')
        + '<br>' + 'portINlist: ' + portINlist.join(', ')
        + '<br>' + 'portOUTunitList: ' + portOUTunitList.join(', ')
        + '<br>' + 'portINunitList: ' + portINunitList.join(', ')
        + '<br>' + 'pipeIDlist: ' + pipeIDlist.join(', ')
        ; // end popupMessage

    try {
        // Attempt to open popup window
        let dataWindow = window.open('', 'Copy data',
            'height=600, left=20, resizable=1, scrollbars=1, top=40, width=600');
        
        // Check if window was successfully created
        if (dataWindow === null) {
            console.error('Popup window was blocked. Please allow popups for this site.');
            alert('Please allow popups for this site to view the data.');
            return;
        }
        
        // Write content to window
        dataWindow.document.writeln('<html><head><title>Copy data</title></head>' +
                '<body>' +
                popupMessage +
                '</body></html>');
        dataWindow.document.close();
    
    } catch (error) {
        console.error('Error creating popup window:', error);
        alert('Error creating popup window. Please check console for details.');
    }

    // Set cookie with array data
    document.cookie = "arrayData=" + encodeURIComponent(popupMessage) + ";max-age=3600";
    console.log('Array data saved to cookie');

    console.log('exit exportFlowSheet');
    
} // END FUNCTION exportFlowSheet 

function importFlowSheet() {
    console.log('enter importFlowSheet');

    // Function to get cookie by name
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Try to get saved arrays from cookie
    const savedArrays = getCookie('arrayData');
    if (savedArrays) {
        const decodedData = decodeURIComponent(savedArrays);
        const cookieLines = decodedData.split('<br>');
        
        // these UNIT arrays are globals declared in process_main.js
        unitCountList = cookieLines[0].replace('unitCountList: ', '').split(', ');
        unitList = cookieLines[1].replace('unitList: ', '').split(', ');
        unitXlist = cookieLines[2].replace('unitXlist: ', '').split(', ');
        unitYlist = cookieLines[3].replace('unitYlist: ', '').split(', ');

        // these PIPE arrays are globals declared in process_main.js
        // only portINlist and portOUTlist are used to draw the pipes 
        // IMPORTANT >> this sim needs all 5 imported to do other things
        portOUTlist = cookieLines[4].replace('portOUTlist: ', '').split(', ');
        portINlist = cookieLines[5].replace('portINlist: ', '').split(', ');
        portOUTunitList = cookieLines[6].replace('portOUTunitList: ', '').split(', ');
        portINunitList = cookieLines[7].replace('portINunitList: ', '').split(', ');
        pipeIDlist = cookieLines[8].replace('pipeIDlist: ', '').split(', ');

    } else {
        console.log('No saved arrays found in cookie');
    }

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
    
        placeUnitsOnImport(unitID, unitObject, unitCount, x, y);

    }; // END OF for loop to place units 

    // unitCount should be the last value from loop
    // but to be sure 
    unitCount = unitCountList[nmax-1];
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

function placeUnitsOnImport(unitID, unitObject, unitCount, x, y) {
    console.log('enter placeUnitsOnImport');
    const el = document.getElementById("div_scene"); 
    // see similar switch in process_main.js as user builds flowsheet manually
    switch (unitObject) {
        case 'feed':
            el.innerHTML += buildFeed(unitCount, x, y);
            processUnits.push(new Feed(unitCount, unitID, x, y) );
            console.log('    add new unit to processUnits[], unitCount = ' + unitCount);
            break;
        case 'cstr':
            el.innerHTML += buildCSTR(unitCount, x, y);
            processUnits.push(new CSTR(unitCount, unitID, x, y) );
            console.log('add new unit to processUnits[], unitCount = ' + unitCount);
            break;
        case 'pfr':
            el.innerHTML += buildPFR(unitCount, x, y);
            processUnits.push(new PFR(unitCount, unitID, x, y) );
            console.log('  add new unit to processUnits[], unitCount = ' + unitCount);
            break;
        case 'mixer':
            el.innerHTML += buildMixer(unitCount, x, y);
            processUnits.push(new Mixer(unitCount, unitID, x, y) );;
            console.log('  add new unit to processUnits[], unitCount = ' + unitCount);
            break;
        case 'splitter':
            el.innerHTML += buildSplitter(unitCount, x, y);
            processUnits.push(new Splitter(unitCount, unitID, x, y) );
            console.log('  add new unit to processUnits[], unitCount = ' + unitCount);
            break;
        case 'tank':
            el.innerHTML += buildTank(unitCount, x, y);
            processUnits.push(new Tank(unitCount, unitID, x, y) );
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

