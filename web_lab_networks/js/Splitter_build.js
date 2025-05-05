function buildSplitter(zz,x,y) {
  
    console.log('enter function buildSplitter, zz,x,y = ' + zz +', '+ x +', '+ y);

    // NOTE the back-ticks ` required at start and end of template string buildText
  
    buildText = ` 

    <style>
        #splitter_${zz} {
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
            <div id="splitter_${zz}" class="splitter" 
                onclick="paletteObjectClicked(event, 'splitter' )" > 
                <div id="splitter_input_one_${zz}" class="splitter_input_one"></div>
                <div id="splitter_output_one_${zz}" class="splitter_output_one"></div>
                <div id="splitter_output_two_${zz}" class="splitter_output_two"></div>
                <div id="splitter_info_${zz}" class="splitter_info">info</div>
                <div id="splitter_type_${zz}" class="splitter_type">SPLIT</div>
                <div id="splitter_num_${zz}" class="splitter_num">0</div>
                <button id="splitter_btn_one_${zz}" class="param_btn"></button>
            </div>
        `; // END buildText << NOTE BACK-TICK BEFORE SEMICOLON  
    } else {
        console.log('buildText ELSE, zz = ' + zz); 
        buildText += ` 
           <div id="splitter_${zz}" class="splitter" 
                onclick="sceneObjectClicked(event, ${zz}, 'splitter_${zz}' )" > 
                <div id="splitter_input_one_${zz}" class="portIN splitter_input_one"
                    onclick="input_clicked(event, splitter_${zz})">
                </div>
                <div title="opt-alt click to add pipe" id="splitter_output_one_${zz}" class="portOUT splitter_output_one"
                    onclick="output_clicked(event, splitter_${zz})">
                </div>
                <div title="opt-alt click to add pipe" id="splitter_output_two_${zz}" class="portOUT splitter_output_two"
                    onclick="output_clicked(event, splitter_${zz})">
                </div>
                <div id="splitter_info_${zz}" class="splitter_info">info</div>
                <div id="splitter_type_${zz}" class="splitter_type">SPLIT</div>
                <div id="splitter_num_${zz}" class="splitter_num">1</div>
                </button>
                <button title="view, edit params" id="splitter_btn_one_${zz}" class="param_btn" 
                    onclick="param_btn_clicked(event, ${zz})">
                </button>
            </div>
        `; // END buildText << NOTE BACK-TICK BEFORE SEMICOLON  
    }
    
    // console.log(' BUILDTEXT = ' + buildText);
    console.log('at end function buildSplitter');
    
    return buildText;
    } // END OF FUNCTION buildSplitter
