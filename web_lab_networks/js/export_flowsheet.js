 'use strict';

/*
Design, text, images and code by Richard K. Herz, 2024-2025
Copyrights held by Richard K. Herz
Licensed for use under the GNU General Public License v3.0
https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// XXX WARNING: on import, need to set the variable unitCount to the
//              last value in unitCountList so new units can be added 
//              after import without confusion 
//              AND CHECK FOR OTHER VARS 
// SEE THESE LINES in process_main.js 
//   unitCount += 1;
//   unitCountList.push(unitCount); // only used in reportStatus() for debugging 

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
        
        // these arrays are globals declared in process_main.js
        unitCountList = cookieLines[0].replace('unitCountList: ', '').split(', ');
        unitList = cookieLines[1].replace('unitList: ', '').split(', ');
        unitXlist = cookieLines[2].replace('unitXlist: ', '').split(', ');
        unitYlist = cookieLines[3].replace('unitYlist: ', '').split(', ');
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
    let nmax = unitList.length;
    let el = document.getElementById("div_scene");
 
    for (let n = 0; n < nmax; n++) {

        // repeat through all elements to process the first 4 arrays
        // get unitObject from unitList element using unitID.split("_", 1)
        // get unitCount, x and y
        // save last value of unitCount

        let unitID = unitList[n];
        // split() returns an array, even when asking for just one element 
        // so need to add [0] to get the first element of that one element array
        let unitObject = unitID.split("_", 1)[0];
        console.log('  in for, unitObject = ' + unitObject);
        let unitCount = unitCountList[n]; // declared in process_main.js 
        let x = unitXlist[n];
        let y = unitYlist[n];

        // see similar switch in process_main.js as user builds flowsheet manually
        switch (unitObject) {
            case 'feed':
                el.innerHTML += buildFeed(unitCount, x, y);
                processUnits.push(new Feed(unitCount, unitID, x, y) );
                console.log('add new unit to processUnits[], unitCount = ' + unitCount);
                break;
            case 'cstr':
                el.innerHTML += buildCSTR(unitCount, x, y);
                processUnits.push(new CSTR(unitCount, unitID, x, y) );
                console.log('add new unit to processUnits[], unitCount = ' + unitCount);
                break;
            case 'pfr':
                el.innerHTML += buildPFR(unitCount, x, y);
                processUnits.push(new PFR(unitCount, unitID, x, y) );
                console.log('add new unit to processUnits[], unitCount = ' + unitCount);
                break;
            case 'mixer':
                el.innerHTML += buildMixer(unitCount, x, y);
                processUnits.push(new Mixer(unitCount, unitID, x, y) );;
                console.log('add new unit to processUnits[], unitCount = ' + unitCount);
                break;
            case 'splitter':
                el.innerHTML += buildSplitter(unitCount, x, y);
                processUnits.push(new Splitter(unitCount, unitID, x, y) );
                console.log('add new unit to processUnits[], unitCount = ' + unitCount);
                break;
            case 'tank':
                el.innerHTML += buildTank(unitCount, x, y);
                processUnits.push(new Tank(unitCount, unitID, x, y) );
                console.log('add new unit to processUnits[], unitCount = ' + unitCount);
                break;
            default:
                console.log('switch DEFAULT in importFlowSheet, unitObject = ' + unitObject);
        }; // END OF SWITCH

    }; // END OF for loop 

    // unitCount should be the last value from loop
    // but to be sure 
    unitCount = unitCountList[nmax-1];
    console.log('  final unitCount = ' + unitCount);

    console.log('exit importFlowSheet');
} // END FUNCTION importFlowSheet

