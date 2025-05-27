'use strict';

/*
Design, text, images and code by Richard K. Herz, 2024-2025
Copyrights held by Richard K. Herz
Licensed for use under the GNU General Public License v3.0
https://www.gnu.org/licenses/gpl-3.0.en.html
*/

const expImpText = {

    // XXX WARNING - UNDER CONSTRUCTION *** 

    // METHODS: 
        // exportAsText 

    exportAsText: function() {
        console.log('enter expImpText.exportAsText');

        // now need to generate a params array 
        // which includes params array from each unit in scene
        let exportParams = [];
        let numUnits = main.unitList.length;
        for (let n = 0; n < numUnits; n++) {
            exportParams[n] = processUnits[n].params
        }

        // // WARNING: THIS LOG REQUIRES TWO UNITS WITH TWO PARAMS
        // // OR GET ERROR
        console.log('  make exportParams[0][0] = ' + exportParams[0][0]);
        console.log('  make exportParams[0][1] = ' + exportParams[0][1]);
        console.log('  make exportParams[1][0] = ' + exportParams[1][0]);
        console.log('  make exportParams[1][1] = ' + exportParams[1][1]);

        const popupMessage = 
            'main.unitCountList: ' + main.unitCountList.join(', ')
            + '<br>' + 'main.unitList: ' + main.unitList.join(', ')
            + '<br>' + 'main.unitXlist: ' + main.unitXlist.join(', ')
            + '<br>' + 'main.unitYlist: ' + main.unitYlist.join(', ')
            + '<br>' + 'main.portOUTlist: ' + main.portOUTlist.join(', ')
            + '<br>' + 'main.portINlist: ' + main.portINlist.join(', ')
            + '<br>' + 'main.portOUTunitList: ' + main.portOUTunitList.join(', ')
            + '<br>' + 'main.portINunitList: ' + main.portINunitList.join(', ')
            + '<br>' + 'main.pipeIDlist: ' + main.pipeIDlist.join(', ')
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

        console.log('exit expImpText.exportAsText');
        
    }, // END FUNCTION exportAsText

} // END OBJECT LITERAL expImpText