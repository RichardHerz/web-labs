function buildMixer(zz,x,y) {
  
    console.log('enter function buildMixer, zz,x,y = ' + zz +', '+ x +', '+ y);

    // NOTE the back-ticks ` required at start and end of template string buildText
  
    buildText = ` 

    <style>
        #mixer_${zz} {
            // position: absolute;
            position: absolute;
            top: ${y}px;
            left: ${x}px;
        }
    </style>
    
    `; // END buildText << NOTE BACK-TICK BEFORE SEMICOLON 

    if (zz == 0) {
        console.log('buildText if (zz == 0), zz = ' + zz); 
        buildText += ` 
            <div id="mixer_${zz}" class="mixer" 
                onclick="paletteObjectClicked(event, 'mixer' )" > 
                <div id="mixer_input_one_${zz}" class="mixer_input_one"></div>
                <div id="mixer_input_two_${zz}" class="mixer_input_two"></div>
                <div id="mixer_output_one_${zz}" class="mixer_output_one"></div>
                <div id="mixer_info_${zz}" class="mixer_info">info</div>
                <div id="mixer_type_${zz}" class="mixer_type">MIX</div>
                <div id="mixer_num_${zz}" class="mixer_num">0</div>
            </div>
        `; // END buildText << NOTE BACK-TICK BEFORE SEMICOLON  
    } else {
        console.log('buildText ELSE, zz = ' + zz); 
        buildText += ` 
           <div id="mixer_${zz}" class="mixer" 
                onclick="sceneObjectClicked(event, ${zz}, 'mixer_${zz}' )" > 
                <div id="mixer_input_one_${zz}" class="portIN mixer_input_one"
                    onclick="input_clicked(event, mixer_${zz})">
                </div>
                <div id="mixer_input_two_${zz}" class="portIN mixer_input_two" 
                    onclick="input_clicked(event, mixer_${zz})">
                </div>
                <div title="opt-alt click to add pipe" id="mixer_output_one_${zz}" class="portOUT mixer_output_one"
                    onclick="output_clicked(event, mixer_${zz})">
                </div>
                <div id="mixer_info_${zz}" class="mixer_info">info</div>
                <div id="mixer_type_${zz}" class="mixer_type">MIX</div>
                <div id="mixer_num_${zz}" class="mixer_num">1</div>
                </button>
            </div>
        `; // END buildText << NOTE BACK-TICK BEFORE SEMICOLON  
    }
    
    // console.log(' BUILDTEXT = ' + buildText);
    console.log('at end function buildMixer');
    
    return buildText;
    } // END OF FUNCTION buildMixer
