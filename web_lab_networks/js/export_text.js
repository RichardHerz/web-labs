'use strict';

/*
Design, text, images and code by Richard K. Herz, 2024-2025
Copyrights held by Richard K. Herz
Licensed for use under the GNU General Public License v3.0
https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// NOTE BOTH EXPORT & IMPORT SCRIPTS ARE CONTAINED IN THIS FILE 

function exportAsText() {
    console.log('enter exportAsText');

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
        + '<br>' + 'exportParams: ' + JSON.stringify(exportParams)
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

    console.log('exit exportAsText');
    
} // END FUNCTION exportAsText