class Splitter {

    constructor(unitCount, unitID) {
        console.log('enter class Splitter constructor');

        this.unitCount = unitCount;
        this.unitID = unitID;

        // default reaction parameters 
        this.topFraction = 0.5;

        // timing parameters
        this.unitStepRepeats = 1; 
        this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;
        this.residenceTime = 1; // required, used for checkForSteadyState

        console.log('  this class unitID = ' + this.unitID);
        const fieldID= "splitter_num_" + this.unitCount;
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
                },
                two: {
                    flowrate: 0,
                    concentration: 0
                }
            }
        };

        this.updateState(); // updates display of conc 

    } // END OF FUNCTION constructor 

    initialize() {
        console.log(`enter class ${this.unitID} initialize method`);
    } // END OF FUNCTION initialize 

    reset() {
        console.log(`enter class ${this.unitID} reset method`);
        this.portData.inputs.one.concentration = 0;
        this.portData.inputs.one.flowrate = 0;
        this.portData.outputs.one.concentration = 0;
        this.portData.outputs.one.flowrate = 0;
        this.portData.outputs.two.concentration = 0;
        this.portData.outputs.two.flowrate = 0;
        const el = document.getElementById('splitter_info_' + this.unitCount); 
        el.innerHTML = `c = 0<br>f = 0`;
    } // END OF FUNCTION reset 

    updateUIparams() {
        console.log(`enter class ${this.unitID} updateUIparams method`);
    } // END OF FUNCTION updateUIparams 

    updateDisplay() {
        console.log(`enter class ${this.unitID} updateDisplay method`);
    } // END OF FUNCTION updateDisplay 

    checkForSteadyState() {
        console.log(`enter class ${this.unitID} checkForSteadyState method`);
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

        // XXX TEMP DEV
        ssFlag = false; 

        return ssFlag;
    } // END OF FUNCTION checkForSteadyState 

    setParameters(pTopFraction, pNotUsed) {
        // this function called by modal popup script in popup.js
        console.log(`enter SPLITTER SETPARAMS, pTopFraction, pNotUsed = ${pTopFraction}, ${pNotUsed}`);
        this.topFraction = pTopFraction;
    }

    param_btn_clicked() {
        console.log('splitter_btn_one_clicked');
        console.log('  display modal dialog to get params');

        const modal = document.getElementById('numberModal');
  
        // Store the unitID as a data attribute
        modal.dataset.unitID = this.unitID;

        // Set default values for the form inputs
        document.getElementById('firstNumber').value = this.topFraction;  // default rate constant
        document.getElementById('secondNumber').value = 0; // default not used
        // XXX WARNING; WHILE THIS INPUT NOT USED STILL NEED A NUMERICAL VALUE 
        //          OR GET WARNING IN popup.js 

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
            targetLabel.textContent = "Enter split to top port (e.g. 0.5):";
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
            labelByQuery.textContent = "(not used)";
            console.log('second label updated');
        } else {
            console.error('second label not found');
        }

    } // END OF FUNCTION splitter_btn_one_clicked

    initialize() {
        console.log('enter class splitter initialize method');
        console.log('  this class unitID = ' + this.unitID);
        console.log('  this.unitCount = ' + this.unitCount);
    } // END OF FUNCTION initialize 

    reportInputStatus() {
        console.log('---- enter reportInputStatus in splitter ----');
        const in1flow = this.portData.inputs.one.flowrate;
        console.log('  in1flow = ' + in1flow);
        const in1conc = this.portData.inputs.one.concentration;
        console.log('  in1conc = ' + in1conc);
        // splitter has only one input
        console.log('---- exit reportInputStatus in splitter ----');
    } // END OF FUNCTION reportInputStatus

    updateInputs() {
        console.log('enter class splitter updateInputs method');
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

            const inputID = "splitter_input_" + inputKey + '_' + this.unitCount;
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
                console.log('  connected upstream output portOutID = ' + portOutID);
                // want portData.outputs. and one or two
                // so need to get one or two from end of tOutID
                // so need to parse tOutID 
                // in "splitter_outputs_one_${zz}" want item [2] 
                // (counting index from 0) for the "one" for example
                const portOutNum = portOutID.split("_")[2];
                console.log('  upstream portOutNum, one or two = ' + portOutNum);

                const portOutName = "_" + portOutNum;
                console.log('  portOutName of upstream output port = ' + portOutName); 

                const portOutUnitID = portOUTunitList[portInUnitIndex];
                console.log('  portOutUnitID of upstream output = ' + portOutUnitID);
 
                console.log('  unitList = ' + unitList);
                const portOutUnitIndex = unitList.findIndex(finderFunc);
                function finderFunc(thisOne) {
                  return thisOne == portOutUnitID;
                }
                console.log('  portOutUnitIndex of upstream output in unitList = ' + portOutUnitIndex);

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

        console.log('just before end of upateInputs in splitter');
        this.reportInputStatus();
        console.log('end of upateInputs in splitter');

    } // END OF updateInputs()

    updateState() {

        console.log('enter class splitter updateState method');

        console.log('  this class unitID = ' + this.unitID);
        console.log('  this.unitCount = ' + this.unitCount);
   
        this.reportInputStatus();

        const in1flow = this.portData.inputs.one.flowrate;
        console.log('  in1flow = ' + in1flow);
 
        const in1conc = this.portData.inputs.one.concentration;
        console.log('  in1conc = ' + in1conc);

        // SPLITTER HAS ONLY ONE INPUT

        this.portData.outputs.one.concentration = in1conc; 
        console.log('  this.portData.outputs.one.concentration = ' + 
            this.portData.outputs.one.concentration);

        this.portData.outputs.two.concentration = in1conc; 
        console.log('  this.portData.outputs.two.concentration = ' + 
            this.portData.outputs.two.concentration);

        this.portData.outputs.one.flowrate = this.topFraction * in1flow;
        console.log('  this.portData.outputs.one.flowrate = ' + 
            this.portData.outputs.one.flowrate);

        this.portData.outputs.two.flowrate = (1 - this.topFraction) * in1flow;
        console.log('  this.portData.outputs.two.flowrate = ' + 
            this.portData.outputs.two.flowrate);

        // want to update innerHTML text displayed in div id="splitter_info_${zz}"
        const el = document.getElementById('splitter_info_' + this.unitCount); 
        
        console.log('  splitter thisConc = ' + in1conc);
        console.log('  splitter TOP flowrate = ' + this.portData.outputs.one.flowrate);
        console.log('  splitter BTM flowrate = ' + this.portData.outputs.two.flowrate);

        const topFlow = this.portData.outputs.one.flowrate;
        const btmFlow = this.portData.outputs.two.flowrate; 

        const roundedTopFlow = Math.round(topFlow * 100) / 100;
        const roundedBtmFlow = Math.round(btmFlow * 100) / 100;

        console.log('  split roundedTopFlow = ' + roundedTopFlow);
        console.log('  split roundedBtmFlow = ' + roundedBtmFlow);

        el.innerHTML = `f = ${roundedTopFlow} <br> f = ${roundedBtmFlow}`;

        this.reportInputStatus();
        console.log('end of updateState in splitter');
 
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


