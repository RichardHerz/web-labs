'use strict';

/*
Design, text, images and code by Richard K. Herz, 2024-2025
Copyrights held by Richard K. Herz
Licensed for use under the GNU General Public License v3.0
https://www.gnu.org/licenses/gpl-3.0.en.html
*/

/*
ReactorLab.net Web Labs process unit (Javascript object)
required variable: 
    residenceTime // used in checkForSteadyState()
required methods:
    initialize() // called by controller.openThisLab()
    reset() // called by interfacer.resetThisLab()
    updateUIparams() // called by interfacer.updateUIparams() or HTML inputs
    updateInputs() // called by controller.updateProcessUnits()
    updateState() // called by controller.updateProcessUnits()
    updateDisplay() // called by controller.updateDisplay()
    checkForSteadyState() // called by controller.checkForSteadyState()
*/

class PFR {

    constructor(unitCount, unitID, sceneX, sceneY, params) {
        console.log('enter class PFR constructor');

        this.unitCount = unitCount;
        this.unitID = unitID;
        this.sceneX = sceneX; // for save & reload flowsheet
        this.sceneY = sceneY;

        // default reaction parameters 
        this.rateConstant = params[0];
        this.volume = params[1];
        this.rxnOrder = params[2];
        this.params = params; // for flowsheet export/import
        console.log('construct PFR, this rateConstant = '+ this.rateConstant);
        console.log('construct PFR, this volume = '+ this.volume);
        console.log('construct PFR, this rxnOrder = '+ this.rxnOrder);
        console.log('construct PFR, this params = '+ this.params);

        this.numCells = 20;
        // WARNING: as the above 3 params and flowrate change 
        //          the time step to prevent numerical 
        //          oscillation changes 
        this.conc = new Array(this.numCells + 1).fill(0);
        console.log('  this.conc in PFR = ' + this.conc);

        // timing parameters
        this.unitStepRepeats = 10; 
        this.unitTimeStep = simParams.simTimeStep/this.unitStepRepeats;
        this.residenceTime = 1; // XXX TEMPORARY, required, used for checkForSteadyState

        console.log('  this class unitID = ' + this.unitID);
        const fieldID= "pfr_num_" + this.unitCount;
        console.log('  fieldID = ' + fieldID);
        const el = document.getElementById(fieldID);
        if (el) {
            el.innerHTML = this.unitCount;
        } else {
            console.error(`Element with ID ${this.fieldID} not found.`);
        }

        this.portData = {
            inputs: {
                one: {
                    flowrate: 0,
                    concentration: 0
                }
            },
            outputs: {
                one: {
                    flowrate: 0,
                    concentration: 0
                }
            }
        };

        this.updateState(); // updates display of conc 

    } // END OF FUNCTION constructor 

    initialize() {
        // this lab's initialization is accomplished by 
        // the constructor function, so nothing is done here
        // but this function is required to remain here
    } // END OF FUNCTION initialize 

    reset() {
        // console.log(`enter class ${this.unitID} reset method`);
        this.portData.inputs.one.concentration = 0;
        this.portData.inputs.one.flowrate = 0;
        this.conc = new Array(this.numCells + 1).fill(0);
        this.portData.outputs.one.concentration = 0;
        this.portData.outputs.one.flowrate = 0;
        const el = document.getElementById('pfr_info_' + this.unitCount); 
        el.innerHTML = 'c = 0<br>f = 0';
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

    setParameters(pRateConstant, pVolume, pRxnOrder) {
        // this function called by modal popup script in popup.js
        console.log('enter PFR SETPARAMS, k, vol, order = ' + pRateConstant + ', ' + pVolume+ ', ' + pRxnOrder);
        this.rateConstant = pRateConstant;
        this.volume = pVolume;
        this.rxnOrder = pRxnOrder;
        // params array used for flowsheet export/import
        this.params[0] = pRateConstant;
        this.params[1] = pVolume;
        this.params[2] = pRxnOrder;
    }

    param_btn_clicked() {
        console.log('pfr_btn_one_clicked');
        console.log('  display modal dialog to get params');

        const modal = document.getElementById('numberModal');
  
        // Store the unitID as a data attribute
        modal.dataset.unitID = this.unitID;

        // Set default values for the form inputs
        document.getElementById('firstNumber').value = this.rateConstant;  // default rate constant
        document.getElementById('secondNumber').value = this.volume; // default volume
        document.getElementById('thirdNumber').value = this.rxnOrder; // default volume

        // Show the modal first
        modal.style.display = 'flex';

        // show second input
        document.getElementById('group_second').style.display = 'block';
        // show third input
        document.getElementById('group_third').style.display = 'block';

        let labelById = false;
        labelById = document.getElementById('firstNumLabel');
        if (labelById) {
            console.log('label found by ID:', labelById);
            labelById.textContent = "Enter rate constant:";
        } else {
            console.log('label not found by ID');
        }

       labelById = document.getElementById('secondNumLabel');
        if (labelById) {
            console.log('label found by ID:', labelById);
            labelById.textContent = "Enter reactor volume:";
        } else {
            console.log('label not found by ID');
        }

        labelById = document.getElementById('thirdNumLabel');
        if (labelById) {
            console.log('label found by ID:', labelById);
            labelById.textContent = "Enter reaction order (0, 1 or 2):";
        } else {
            console.log('label not found by ID');
        }

    } // END OF FUNCTION pfr_btn_one_clicked

    initialize() {
        console.log('enter class PFR initialize method');
        console.log('  this class unitID = ' + this.unitID);
        console.log('  this.unitCount = ' + this.unitCount);
    } // END OF FUNCTION initialize 

    reportInputStatus() {
        // console.log('---- enter reportInputStatus in PFR ----');
        // const in1flow = this.portData.inputs.one.flowrate;
        // console.log('  in1flow = ' + in1flow);
        // const in1conc = this.portData.inputs.one.concentration;
        // console.log('  in1conc = ' + in1conc);
        // console.log('---- exit reportInputStatus in PFR ----');
    } // END OF FUNCTION reportInputStatus

    updateInputs() {
        console.log('enter class PFR updateInputs method');
        console.log('  this class unitID = ' + this.unitID);
        console.log('  this.unitCount = ' + this.unitCount);

        this.reportInputStatus();

        // for each input, find if connected to an output 
        // and, if so, replace this input data with the
        // connected output data, assuming that all
        // ports in the project have the same data types 
        Object.keys(this.portData.inputs).forEach(inputKey => {

            // Do something with each input
            console.log('  processing this.portData.inputs, inputKey = ' + inputKey); 

            const inputID = "pfr_input_" + inputKey + '_' + this.unitCount;
            console.log('  this inputID = ' + inputID); 

            const portInNum = inputKey;
            console.log('  portInNum = ' + portInNum);

            // now search for inputID in portINlist[] 
            // which is filled in process_main.js 
            // in this project, only one connection to each of two inputs 
            // if found, get the connected outputID and
            // copy the data from the output to this input

            // get index of input's unit in portINunitList
            let portInUnitIndex = -1;
            portInUnitIndex = portINlist.findIndex(finderFunc);
            function finderFunc(thisOne) {
                return thisOne == inputID;
            }; 

            if (portInUnitIndex == -1) {
                console.log('  this input has NO connection to an output');
            } else {
                console.log('this input HAS a connection to an output');
                // copy portData from output to this input
                // get ID of output port
                const portOutID = portOUTlist[portInUnitIndex];
                console.log('  connected output portOutID = ' + portOutID);
                // want portData.outputs. and one or two
                // so need to get one or two from end of tOutID
                // so need to parse tOutID 
                // in "pfr_outputs_one_${zz}" want item [2] 
                // (counting index from 0) for the "one" for example
                const portOutNum = portOutID.split("_")[2];
                console.log('  portOutNum, one or two = ' + portOutNum);

                // const portOutName = "_" + portOutNum;
                // console.log('  portOutName of upstream output port = ' + portOutName); 

                const portOutUnitID = portOUTunitList[portInUnitIndex];
                console.log('  portOutUnitID of upstream output = ' + portOutUnitID);
 
                console.log('  unitList = ' + unitList);
                const portOutUnitIndex = unitList.findIndex(finderFunc);
                function finderFunc(thisOne) {
                  return thisOne == portOutUnitID;
                }
                console.log('  portOutUnitIndex of upstream output in unitList= ' + portOutUnitIndex);

                const tNumKeys = Object.keys(processUnits).length;
                console.log('  num index keys processUnits array = ' + tNumKeys);

                // function findProcessUnitIndex() is in main file process_main.js
                const outputPUindex = findProcessUnitIndex(portOutUnitID);
                console.log('  outputPUindex in processUnits[] = ' + outputPUindex);
                console.log('  portOutUnitID using this index = ' + processUnits[outputPUindex].unitID);

                // NOTE the two ways of addressing propeties of outputPUunit below
                // METHOD 1
                //   const outputPUunit = processUnits[outputPUindex];
                //   let out1conc = outputPUunit.portData.outputs.one.concentration;
                //  METHOD 1
                //   out1conc = processUnits[outputPUindex].portData.outputs.one.concentration;
 
                // const out1conc = processUnits[outputPUindex].portData.outputs.one.concentration;
                // console.log('  upstream out1conc = ' + out1conc);
                // const out1flow = processUnits[outputPUindex].portData.outputs.one.flowrate;
                // console.log('  upstream out1flow = ' + out1flow);

                console.log('B4 copy in << out');
                this.reportInputStatus();

                // this copies ALL the properties to portInNum from portOutNum
                // but relies on both in and out ports having same properties
                // e.g., flowrate and concentration
                if (this.portData.inputs[portInNum]) {
                    console.log(`  this.portData.inputs[${portInNum}] DOES exist!`);      
                    Object.keys(this.portData.inputs[portInNum]).forEach(property => {
                        const value = this.portData.inputs[portInNum][property];
                        console.log(`Property: ${property}, Value: ${value}`);
                        this.portData.inputs[portInNum][property] = 
                            processUnits[outputPUindex].portData.outputs[portOutNum][property];
                    });
                } else {
                    console.log(`  this.portData.inputs[${portInNum}] does NOT exist!`);
                }
                
                console.log('After copy in << out');
                this.reportInputStatus();
                
            } // END OF if (portInUnitIndex != -1)

        } ); // END OF repeat through Object.keys

        console.log('just before end of upateInputs in PFR');
        this.reportInputStatus();
        console.log('end of upateInputs in PFR');

    } // END OF updateInputs()

    updateState() {

        console.log('enter class PFR updateState method');

        console.log('  this class unitID = ' + this.unitID);
        console.log('  this.unitCount = ' + this.unitCount);
   
        this.reportInputStatus();

        const in1flow = this.portData.inputs.one.flowrate;
        const in1conc = this.portData.inputs.one.concentration;
 
        // console.log('  in1flow = ' + in1flow);
        // console.log('  in1conc = ' + in1conc);
        // const out1flow = this.portData.outputs.one.flowrate; 
        // const out1conc = this.portData.outputs.one.concentration;
        // console.log('  out1flow = ' + out1flow);
        // console.log('  out1conc = ' + out1conc);

        const totalINflow = in1flow;
        console.log('  totalINflow = ' + totalINflow);

        let inMIXEDconc = in1conc;
        console.log('  inMIXEDconc = ' + inMIXEDconc);

        if (this.volume == 0) {
            console.log('ERROR pfr volume = 0 will get div by zero');
        }

        const flowFac = totalINflow / (this.volume / this.numCells); 
        let dcdt = new Array(this.numCells + 1).fill(0);

        // first, compute rate of change in each cell
        this.conc[0] = inMIXEDconc;
        for (let n = 1; n <= this.numCells; n++) {
            dcdt[n] = flowFac * (this.conc[n-1] - this.conc[n]) 
                      - this.rateConstant * this.conc[n]**this.rxnOrder;
        }

        // second, update conc in each cell
        for (let n = 1; n <= this.numCells; n++) {
            this.conc[n] = this.conc[n] + dcdt[n] * this.unitTimeStep;
        }

        const cnew = this.conc[this.numCells];

        console.log('  cnew = ' + cnew);

        this.portData.outputs.one.concentration = cnew; 
        console.log('  this.portData.outputs.one.concentration = ' + 
            this.portData.outputs.one.concentration);

        // for no volume accumulation, set outlet flowrate to total input flowrate
        // note that this may also be done in updateInputs()
        this.portData.outputs.one.flowrate = totalINflow;
        console.log('  this.portData.outputs.one.flowrate = ' + 
            this.portData.outputs.one.flowrate);

        // want to update innerHTML text displayed in div id="pfr_info_${zz}"
        const el = document.getElementById('pfr_info_' + this.unitCount); 
        
        console.log('  PFR thisConc = ' + cnew);
        console.log('  PFR flowrate = ' + totalINflow);

        const roundedConc = Math.round(cnew * 100) / 100;
        const roundedFlow = Math.round(totalINflow * 100) / 100;

        console.log('  PFR roundedConc = ' + roundedConc);
        console.log('  PFR flowrate = ' + roundedFlow);

        el.innerHTML = `c = ${roundedConc}<br>f = ${roundedFlow}`;

        this.reportInputStatus();
        console.log('  near end updateState, out 1 conc = ' + this.portData.outputs.one.concentration);
        console.log('end of updateState in PFR');
 
    } // END OF updateState()

    getPortCount() {
        console.log('enter getPortCount');
        const keyLen = Object.keys(this.portData).length; 
        console.log('  keyLen = ' + keyLen);
        return keyLen;
    }

    // getOutputPortCount() {
    //     console.log('enter getOutputPortCount');
    //     const keyLen = Object.keys(this.portData).length; 
    //     console.log('  keyLen = ' + keyLen);
    //     return keyLen; 
    // }
       
    // You can also count properties in a specific port
    getInputPortPropertyCount(portName) {
        if (this.portData.inputs[portName]) {
            return Object.keys(this.portData.inputs[portName]).length;
        } else {
            throw new Error(`Port name "${portName}" does not exist in inputs.`);
        }
    }

} // END OF CLASS 


