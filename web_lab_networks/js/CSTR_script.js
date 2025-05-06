// process unit (object)
// 	required methods:
//      initialize() // called by controller.openThisLab()
// 		reset() // called by interfacer.resetThisLab()
// 		updateUIparams() // called by interfacer.updateUIparams() or HTML inputs
// 		updateInputs() // called by controller.updateProcessUnits()
// 		updateState() // called by controller.updateProcessUnits()
// 		updateDisplay() // called by controller.updateDisplay()
// 		checkForSteadyState() // called by controller.checkForSteadyState()

class CSTR {

    constructor(unitCount, unitID) {
        console.log('enter class CSTR constructor');

        this.unitCount = unitCount;
        this.unitID = unitID;

        // default reaction parameters 
        this.rateConstant = 0;
        this.volume = 10;

        // timing parameters
        this.unitStepRepeats = 10;
        this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;
        this.residenceTime = 1; // required, used for checkForSteadyState

        console.log('  this class unitID = ' + this.unitID);
        const fieldID = "cstr_num_" + this.unitCount;
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
                },
                two: {
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
        this.portData.inputs.two.concentration = 0;
        this.portData.inputs.two.flowrate = 0;
        this.portData.outputs.one.concentration = 0;
        this.portData.outputs.one.flowrate = 0;
        const el = document.getElementById('cstr_info_' + this.unitCount);
        el.innerHTML = `c = 0<br>f = 0`;
    } // END OF FUNCTION reset 

    updateUIparams() {
        // console.log(`enter class ${this.unitID} updateUIparams method`);    //
        // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
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

    setParameters(pRateConstant, pVolume) {
        // this function called by modal popup script in popup.js
        console.log('enter CSTR SETPARAMS, rateConst, vol = ' + pRateConstant + ', ' + pVolume);
        this.rateConstant = pRateConstant;
        this.volume = pVolume;
    }

    param_btn_clicked() {
        console.log('cstr_btn_one_clicked');
        console.log('  display modal dialog to get params');

        const modal = document.getElementById('numberModal');

        // Store the unitID as a data attribute
        modal.dataset.unitID = this.unitID;

        // Set default values for the form inputs
        document.getElementById('firstNumber').value = this.rateConstant;  // default rate constant
        document.getElementById('secondNumber').value = this.volume; // default volume

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
            targetLabel.textContent = "Enter rate constant:";
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
            labelByQuery.textContent = "Enter reactor volume:";
            console.log('second label updated');
        } else {
            console.error('second label not found');
        }

    } // END OF FUNCTION cstr_btn_one_clicked

    reportInputStatus() {
        // console.log('---- enter reportInputStatus in CSTR ----');
        // const in1flow = this.portData.inputs.one.flowrate;
        // console.log('  in1flow = ' + in1flow);
        // const in1conc = this.portData.inputs.one.concentration;
        // console.log('  in1conc = ' + in1conc);
        // const in2flow = this.portData.inputs.two.flowrate;
        // console.log('  in2flow = ' + in2flow);
        // const in2conc = this.portData.inputs.two.concentration;
        // console.log('  in2conc = ' + in2conc);
        // console.log('---- exit reportInputStatus in CSTR ----');
    } // END OF FUNCTION reportInputStatus

    updateInputs() {
        console.log('enter class CSTR updateInputs method');
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

            const inputID = "cstr_input_" + inputKey + '_' + this.unitCount;
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
                // in "cstr_outputs_one_${zz}" want item [2] 
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

                // const out2conc = processUnits[outputPUindex].portData.outputs.two.concentration;
                // console.log('  upstream out2conc = ' + out2conc);
                // const out2flow = processUnits[outputPUindex].portData.outputs.two.flowrate;
                // console.log('  upstream out2flow = ' + out2flow);

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

        }); // END OF repeat through Object.keys

        console.log('just before end of upateInputs in CSTR');
        this.reportInputStatus();
        console.log('end of upateInputs in CSTR');

    } // END OF updateInputs()

    updateState() {

        console.log('enter class CSTR updateState method');

        console.log('  this class unitID = ' + this.unitID);
        console.log('  this.unitCount = ' + this.unitCount);

        this.reportInputStatus();

        const in1flow = this.portData.inputs.one.flowrate;
        const in1conc = this.portData.inputs.one.concentration;
        const in2flow = this.portData.inputs.two.flowrate;
        const in2conc = this.portData.inputs.two.concentration;
        const out1conc = this.portData.outputs.one.concentration;

        // console.log('  in1flow = ' + in1flow);
        // console.log('  in1conc = ' + in1conc);
        // console.log('  in2flow = ' + in2flow);
        // console.log('  in2conc = ' + in2conc);
        // const out1flow = this.portData.outputs.one.flowrate; 
        // console.log('  out1flow = ' + out1flow);
        // console.log('  out1conc = ' + out1conc);

        //  MIX BOTH INPUTS 

        const totalINflow = in1flow + in2flow;
        console.log('  totalINflow = ' + totalINflow);

        let inMIXEDconc = 0;
        if (totalINflow > 0) {
            inMIXEDconc = (in1conc * in1flow + in2conc * in2flow) / totalINflow;
        }
        console.log('  inMIXEDconc = ' + inMIXEDconc);

        if (this.volume == 0) {
            console.log('ERROR cstr volume = 0 will get div by zero');
        }

        const dcdt = (totalINflow / this.volume) * (inMIXEDconc - out1conc)
            - this.rateConstant * out1conc;

        // console.log(`  CHECK totalINflow = ${totalINflow}`);
        // console.log(`  CHECK vol = ${this.volume}`);
        // console.log(`  CHECK inMIXEDconc = ${inMIXEDconc}`);
        // console.log(`  CHECK out1conc = ${out1conc}`);
        // console.log(`  CHECK k = ${this.rateConstant}`);
        // console.log(`  CHECK dcdt =  ${dcdt}` );

        // console.log(`  CHECK (totalINflow / vol) =  ${(totalINflow / this.volume)}` );
        // console.log(`  CHECK (inMIXEDconc - out1conc) =  ${(inMIXEDconc - out1conc)}` );
        // console.log(`  CHECK k * inMIXEDconc =  ${this.rateConstant * inMIXEDconc}` );

        const cnew = out1conc + dcdt * this.unitTimeStep;
        console.log('  cnew = ' + cnew);

        this.portData.outputs.one.concentration = cnew;
        console.log('  this.portData.outputs.one.concentration = ' +
            this.portData.outputs.one.concentration);

        // for no volume accumulation, set outlet flowrate to total input flowrate
        // note that this may also be done in updateInputs()
        this.portData.outputs.one.flowrate = totalINflow;
        console.log('  this.portData.outputs.one.flowrate = ' +
            this.portData.outputs.one.flowrate);

        // want to update innerHTML text displayed in div id="cstr_info_${zz}"
        const el = document.getElementById('cstr_info_' + this.unitCount);

        const thisConc = cnew;
        const thisFlow = totalINflow;

        console.log('  CSTR thisConc = ' + thisConc);
        console.log('  CSTR flowrate = ' + thisFlow);

        const roundedConc = Math.round(thisConc * 100) / 100;
        const roundedFlow = Math.round(thisFlow * 100) / 100;

        console.log('  CSTR roundedConc = ' + roundedConc);
        console.log('  CSTR flowrate = ' + roundedFlow);

        el.innerHTML = `c = ${roundedConc}<br>f = ${roundedFlow}`;

        this.reportInputStatus();
        console.log('  near end updateState, out 1 conc = ' + this.portData.outputs.one.concentration);
        console.log('end of updateState in CSTR');

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


