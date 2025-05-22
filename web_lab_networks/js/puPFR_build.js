'use strict';

/*
Design, text, images and code by Richard K. Herz, 2024-2025
Copyrights held by Richard K. Herz
Licensed for use under the GNU General Public License v3.0
https://www.gnu.org/licenses/gpl-3.0.en.html
*/

function buildPFR(zz,x,y) {
  
    console.log('enter function buildPFR, zz,x,y = ' + zz +', '+ x +', '+ y);

    // NOTE the back-ticks ` required at start and end of template string buildText
  
    let buildText = ` 

    <style>
        #pfr_${zz} {
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
            <div id="pfr_${zz}" class="pfr" 
                onclick="paletteObjectClicked(event, 'pfr' )" > 
                <div id="pfr_input_one_${zz}" class="pfr_input_one"></div>
                <div id="pfr_output_one_${zz}" class="pfr_output_one"></div>
                <div id="pfr_info_${zz}" class="pfr_info">info</div>
                <div id="pfr_type_${zz}" class="pfr_type">PFR</div>
                <div id="pfr_num_${zz}" class="pfr_num">0</div>
                <button id="pfr_btn_one_${zz}" class="param_btn"></button>
                <img id="pfr_img_${zz}" class="pfr_img" src="images/PFR_02.png" alt="PFR">
            </div>
        `; // END buildText << NOTE BACK-TICK BEFORE SEMICOLON  
    } else {
        console.log('buildText ELSE, zz = ' + zz); 
        buildText += ` 
           <div id="pfr_${zz}" class="pfr" 
                onclick="sceneObjectClicked(event, 'pfr_${zz}' )" > 
                <div id="pfr_input_one_${zz}" class="portIN pfr_input_one"
                    onclick="input_clicked(event, pfr_${zz})">
                </div>
                <div title="opt-alt click to add pipe" id="pfr_output_one_${zz}" class="portOUT pfr_output_one"
                    onclick="output_clicked(event, pfr_${zz})">
                </div>
                <div id="pfr_info_${zz}" class="pfr_info">info</div>
                <div id="pfr_type_${zz}" class="pfr_type">PFR</div>
                <div id="pfr_num_${zz}" class="pfr_num">1</div>
                <button title="view, edit params" id="pfr_btn_one_${zz}" class="param_btn" 
                    onclick="param_btn_clicked(event, ${zz})">
                </button>
               <img id="pfr_img_${zz}" class="pfr_img" src="images/PFR_02.png" alt="PFR">
             </div>
        `; // END buildText << NOTE BACK-TICK BEFORE SEMICOLON  
    }
    
    // console.log(' BUILDTEXT = ' + buildText);
    console.log('at end function buildPFR');
    
    return buildText;
} // END OF FUNCTION buildPFR
