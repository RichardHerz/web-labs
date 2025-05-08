 'use strict';

/*
Design, text, images and code by Richard K. Herz, 2024-2025
Copyrights held by Richard K. Herz
Licensed for use under the GNU General Public License v3.0
https://www.gnu.org/licenses/gpl-3.0.en.html
*/
 
function exportFlowSheet() {

    // ARRAYS TO SAVE 
    // unitCountList = []; // unitCount values of units currently on display
    // unitList = []; // ID's of unit objects currently on display
    // unitXlist
    // unitYlist // for placing units in scene
    // portOUTlist = []; 
    // portINlist = [];
    // portOUTunitList = []; // 
    // portINunitList = [];
    // pipeIDlist = [];

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
    
} // END FUNCTION exportState 

