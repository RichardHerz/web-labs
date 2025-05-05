class Tank {

    constructor(unitCount, unitID) {
        console.log('enter class Tank constructor');

        this.unitCount = unitCount;
        this.unitID = unitID;

        // SPECIAL FOR TANK, which has no outlet port
        this.tankVolume = 0;
        this.tankConc = 0;

        // timing parameters
        this.unitStepRepeats = 1; 
        this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;
        this.residenceTime = 1; // required, used for checkForSteadyState
       
        console.log('  this class unitID = ' + this.unitID);
        const fieldID= "tank_num_" + this.unitCount;
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
        this.portData.inputs.two.concentration = 0;
        this.portData.inputs.two.flowrate = 0;
        this.tankVolume = 0;
        this.tankConc = 0;
        const el = document.getElementById('tank_info_' + this.unitCount);
        el.innerHTML = `c = 0<br>V = 0`;
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

    setParameters() {
        // no params for Tank
    }

    param_btn_clicked() {
        // no params for Tank
    } // END OF FUNCTION tank_btn_one_clicked

    initialize() {
        console.log('enter class Tank initialize method');
        console.log('  this class unitID = ' + this.unitID);
        console.log('  this.unitCount = ' + this.unitCount);
    } // END OF FUNCTION initialize 

    reportInputStatus() {
        // console.log('---- enter reportInputStatus in Tank ----');
        // const in1flow = this.portData.inputs.one.flowrate;
        // console.log('  in1flow = ' + in1flow);
        // const in1conc = this.portData.inputs.one.concentration;
        // console.log('  in1conc = ' + in1conc);
        // const in2flow = this.portData.inputs.two.flowrate;
        // console.log('  in2flow = ' + in2flow);
        // const in2conc = this.portData.inputs.two.concentration;
        // console.log('  in2conc = ' + in2conc);
        // console.log('---- exit reportInputStatus in Tank ----');
    } // END OF FUNCTION reportInputStatus

    updateInputs() {
        console.log('enter class Tank updateInputs method');
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

            const inputID = "tank_input_" + inputKey + '_' + this.unitCount;
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
                // in "tank_outputs_one_${zz}" want item [2] 
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

        console.log('just before end of upateInputs in Tank');
        this.reportInputStatus();
        console.log('end of upateInputs in Tank');

    } // END OF updateInputs()

    updateState() {

        console.log('enter class Tank updateState method');

        console.log('  this class unitID = ' + this.unitID);
        console.log('  this.unitCount = ' + this.unitCount);
   
        this.reportInputStatus();

        const in1flow = this.portData.inputs.one.flowrate;
        const in1conc = this.portData.inputs.one.concentration;
        const in2flow = this.portData.inputs.two.flowrate;
        const in2conc = this.portData.inputs.two.concentration;

        // console.log('  in1flow = ' + in1flow);
        // console.log('  in1conc = ' + in1conc);
        // console.log('  in2flow = ' + in2flow);
        // console.log('  in2conc = ' + in2conc);

        //  MIX BOTH INPUTS 

        const totalINflow = in1flow + in2flow;
        console.log('  totalINflow = ' + totalINflow);

        let inMIXEDconc = 0;
        if (totalINflow > 0) {
            inMIXEDconc = (in1conc * in1flow + in2conc * in2flow) / totalINflow;
        }
        console.log('  inMIXEDconc = ' + inMIXEDconc);

        console.log(`  CHECK this.tankConc = ${this.tankConc}`);
        console.log(`  CHECK this.tankVolume = ${this.tankVolume}`);

        const oldMol = this.tankConc * this.tankVolume;

        const inputMol = inMIXEDconc * totalINflow * this.unitTimeStep;
        const newMol = oldMol + inputMol; 
 
        console.log(`  CHECK oldMol = ${oldMol}`);
        console.log(`  CHECK inputMol = ${inputMol}`);
        console.log(`  CHECK newMol = ${newMol}`);

        this.tankVolume = this.tankVolume + totalINflow * this.unitTimeStep;
        
        console.log(`  CHECK this.tankVolume = ${this.tankVolume}`);
     
        if (this.tankVolume > 0) {
            this.tankConc = newMol / this.tankVolume;
        } else {
            this.tankConc = 0;
        }

        console.log(`  CHECK this.tankConc = ${this.tankConc}`);

        // want to update innerHTML text displayed in div id="tank_info_${zz}"
        const el = document.getElementById('tank_info_' + this.unitCount); 

        const newConc = this.tankConc;
        const newVol = this.tankVolume;
        
        console.log('  tank newConc = ' + newConc);
        console.log('  tank newVol = ' + newVol);

        const roundedConc = Math.round(newConc * 100) / 100;
        const roundedVol = Math.round(newVol);

        console.log('  tank roundedConc = ' + roundedConc);
        console.log('  tank roundedVol = ' + roundedVol);

        el.innerHTML = `c = ${roundedConc}<br>V = ${roundedVol}`;

        this.reportInputStatus();
        console.log('end of updateState in Tank');
 
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


