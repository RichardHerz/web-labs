'use strict';

/*
Design, text, images and code by Richard K. Herz, 2024-2025
Copyrights held by Richard K. Herz
Licensed for use under the GNU General Public License v3.0
https://www.gnu.org/licenses/gpl-3.0.en.html
*/

/*
ReactorLab.net Web Labs process unit (Javascript object)
required methods:
    initialize() // called by controller.openThisLab()
    reset() // called by interfacer.resetThisLab()
    updateUIparams() // called by interfacer.updateUIparams() or HTML inputs
    updateInputs() // called by controller.updateProcessUnits()
    updateState() // called by controller.updateProcessUnits()
    updateDisplay() // called by controller.updateDisplay()
    checkForSteadyState() // called by controller.checkForSteadyState()
variable residenceTime is required, used in checkForSteadyState()
*/

class Feed {

    constructor(unitCount, unitID, sceneX, sceneY) {
        console.log('enter class Feed constructor');

        this.unitCount = unitCount;
        this.unitID = unitID;
        this.sceneX = sceneX; // for save & reload flowsheet
        this.sceneY = sceneY;

        // default reaction parameters 
        this.flowrate = 10;
        this.concentration = 10;

        // timing parameters 
        this.unitStepRepeats = 1; 
        this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;
        this.residenceTime = 1; // required, used for checkForSteadyState
       
        console.log('  this class unitID = ' + this.unitID);
        const fieldID= "feed_num_" + this.unitCount;
        console.log('  fieldID = ' + fieldID);
        const el = document.getElementById(fieldID);
        if (el) {
            el.innerHTML = this.unitCount;
        } else {
            console.error(`Element with ID ${this.fieldID} not found.`);
        }

        this.portData = {
            inputs: {
                // no inputs to feed
            },
            outputs: {
                one: {
                    flowrate: this.flowrate,
                    concentration: this.concentration
                }
            }
        };

        this.updateState(); // for feed just updates display of conc 

    } // END OF FUNCTION constructor 

    initialize() {
        // this lab's initialization is accomplished by 
        // the constructor function, so nothing is done here
        // but this function is required to remain here
    } // END OF FUNCTION initialize 

    reset() {
        // console.log(`enter class ${this.unitID} reset method`);
    } // END OF FUNCTION reset 

    updateUIparams() {
        // console.log(`enter class ${this.unitID} updateUIparams method`);
    } // END OF FUNCTION updateUIparams 

    updateDisplay() {
        // console.log(`enter class ${this.unitID} updateDisplay method`);
    } // END OF FUNCTION updateDisplay 

    checkForSteadyState() {
        // console.log(`enter class ${this.unitID} checkForSteadyState method`);
        // required - called by controller object
        // returns ssFlag, true if this unit at SS, false if not
        // *IF* NOT used to check for SS *AND* another unit IS checked,
        // which can not be at SS, *THEN* return ssFlag = true to calling unit
        // HOWEVER, if this unit has UI inputs, need to be able to return false
        let ssFlag = true;
        // this.ssCheckSum set != 0 on updateUIparams() execution
        if (this.ssCheckSum != 0) {
            ssFlag = false;
        }
        this.ssCheckSum = 0;
        ssFlag = false; // XXX TEMPORARY FOR DEVELOPMENT
        return ssFlag;
    } // END OF FUNCTION checkForSteadyState  

    setParameters(pFlow, pConc) {
        // this function called by modal popup script in popup.js
        console.log('enter FEED SETPARAMS, flow, vol = ' + pFlow + ', ' + pConc);
        this.flowrate = pFlow;
        this.concentration = pConc;
        // also set outputs for feed
        this.portData.outputs.one.flowrate = this.flowrate;
        this.portData.outputs.one.concentration = this.concentration;
        console.log('exit FEED SETPARAMS, flow, vol = ' + 
            this.portData.outputs.one.flowrate + ', ' + this.portData.outputs.one.concentration);
        this.updateState(); // for feed just updates display of conc 
    }

    // FROM ORIG FEED BUILD
    // <button id="feed_btn_one_${zz}" class="feed_btn_one" 
    //                 onclick="feed_btn_one_clicked(event, feed_${zz})"></button>

    param_btn_clicked() {
        console.log('feed_btn_one_clicked');
        console.log('  display modal dialog to get params');

       const modal = document.getElementById('numberModal');

       // Store the unitID as a data attribute
       modal.dataset.unitID = this.unitID;

       // Set default values for the form inputs
        document.getElementById('firstNumber').value = this.flowrate;  // default flowrate
        document.getElementById('secondNumber').value = this.concentration; // default conc

        // Show the modal first
        modal.style.display = 'flex';

        // Try multiple ways to get the label
        console.log('Debugging label selection:');

        // NOTE: both methods below work when id given for form label
        // Claude 3.5 sonnet in copilot says: 
        // Either method can be used reliably, though using 
        // getElementById() is slightly more efficient if you have 
        // the ID available.

        // Method 1: by ID
        let labelById = false;
        labelById = document.getElementById('firstNumLabel');
        if (labelById) {
            console.log('label found by ID:', labelById);
        } else {
            console.log('label not found by ID');
        }

        // Method 2: by query selector
        let labelByQuery = false;
        labelByQuery = document.querySelector('label[for="firstNumber"]');
        if (labelByQuery) {
            console.log('label found by query:', labelByQuery);
        } else {
            console.log('label not found by query:', labelByQuery);
        }

        // Try updating whichever one exists
        const targetLabel = labelById || labelByQuery;
        if (targetLabel) {
            targetLabel.textContent = "Enter flow rate:";
            console.log('Label updated');
        } else {
            console.error('Label not found by any method');
        }

        // now second number label only by query 
        // Method 2: by query selector
        labelByQuery = false;
        labelByQuery = document.querySelector('label[for="secondNumber"]');
        if (labelByQuery) {
            console.log('label found by query:', labelByQuery);
        } else {
            console.log('label not found by query:', labelByQuery);
        }

        if (labelByQuery) {
            labelByQuery.textContent = "Enter reactant concentration:";
            console.log('second label updated');
        } else {
            console.error('second label not found');
        }

    } // END OF FUNCTION feed_btn_one_clicked 

    initialize() {
        console.log('enter class Feed initialize method');
        console.log('  this class unitID = ' + this.unitID);
        console.log('  this.unitCount = ' + this.unitCount);
    } // END OF FUNCTION initialize 

    updateInputs() {
        // argument u is the index of this object in processUnits[]
        console.log('enter class Feed updateInputs method');
        console.log('  this class unitID = ' + this.unitID);
        console.log('  this.unitCount = ' + this.unitCount);
        console.log('  NO INPUTS TO UPDATE IN CLASS FEED');
    } // END OF updateInputs()

    updateState() {
        console.log('enter class Feed updateState method');
        console.log('  this class unitID = ' + this.unitID);
        console.log('  this.unitCount = ' + this.unitCount);
        // want to update innerHTML text displayed in div id="feed_info_${zz}"
        const elName = 'feed_info_' + this.unitCount;
        console.log('  feed elName = ' + elName);
        const el = document.getElementById(elName); 

        const thisConc = this.portData.outputs.one.concentration;
        const thisFlow = this.portData.outputs.one.flowrate;
        
        console.log('  feed thisConc = ' + thisConc);
        console.log('  feed flowrate = ' + thisFlow);

        const roundedConc = Math.round(thisConc * 100) / 100;
        const roundedFlow = Math.round(thisFlow * 100) / 100;

        console.log('  feed roundedConc = ' + roundedConc);
        console.log('  feed flowrate = ' + roundedFlow);

        el.innerHTML = `c = ${roundedConc}<br>f = ${roundedFlow}`;
    }

    // NO INPUTS IN FEED OBJECT 
    getInputPortCount() {
        console.log('enter getInputPortCount');
        const keyLen = Object.keys(this.portData.inputs).length; 
        console.log('  keyLen = ' + keyLen);
        return keyLen;
    }

    getPortCount() {
        console.log('enter getPortCount');
        const keyLen = Object.keys(this.portData).length; 
        console.log('  keyLen = ' + keyLen);
        return keyLen; 
    }
    
    // NO INPUTS IN FEED OBJECT 
    // You can also count properties in a specific port
    getInputPortPropertyCount(portName) {
        if (this.portData.inputs[portName]) {
            return Object.keys(this.portData.inputs[portName]).length;
        } else {
            throw new Error(`Port name "${portName}" does not exist in inputs.`);
        }
    }

} // END OF CLASS 
