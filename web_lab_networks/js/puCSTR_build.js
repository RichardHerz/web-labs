'use strict';

/*
Design, text, images and code by Richard K. Herz, 2024-2025
Copyrights held by Richard K. Herz
Licensed for use under the GNU General Public License v3.0
https://www.gnu.org/licenses/gpl-3.0.en.html
*/

function buildCSTR(zz,x,y) {

    console.log('enter function buildCSTR, zz,x,y = ' + zz +', '+ x +', '+ y);

    // NOTE the back-ticks ` required at start and end of template string buildText
  
    let buildText = ` 

    <style>
        #cstr_${zz} {
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
            <div id="cstr_${zz}" class="cstr" 
                onclick="paletteObjectClicked(event, 'cstr' )" > 
                <div id="cstr_input_one_${zz}" class="cstr_input_one"></div>
                <div id="cstr_input_two_${zz}" class="cstr_input_two"></div>
                <div id="cstr_output_one_${zz}" class="cstr_output_one"></div>
                <div id="cstr_info_${zz}" class="cstr_info">info</div>
                <div id="cstr_type_${zz}" class="cstr_type">CSTR</div>
                <div id="cstr_num_${zz}" class="cstr_num">0</div>
                <button id="cstr_btn_one_${zz}" class="param_btn"></button>
                <img id="cstr_img_${zz}" class="cstr_img" src="images/CSTR_0.jpg" alt="CSTR">
            </div>
        `; // END buildText << NOTE BACK-TICK BEFORE SEMICOLON  
    } else {
        console.log('buildText ELSE, zz = ' + zz); 
        buildText += ` 
           <div id="cstr_${zz}" class="cstr" 
                onclick="sceneObjectClicked(event, 'cstr_${zz}' )" > 
                <div id="cstr_input_one_${zz}" class="portIN cstr_input_one"
                    onclick="input_clicked(event, cstr_${zz})">
                </div>
                <div id="cstr_input_two_${zz}" class="portIN cstr_input_two" 
                    onclick="input_clicked(event, cstr_${zz})">
                </div>
                <div title="opt-alt click to add pipe" id="cstr_output_one_${zz}" class="portOUT cstr_output_one"
                    onclick="output_clicked(event, cstr_${zz})">
                </div>
                <div id="cstr_info_${zz}" class="cstr_info">info</div>
                <div id="cstr_type_${zz}" class="cstr_type">CSTR</div>
                <div id="cstr_num_${zz}" class="cstr_num">1</div>
                <button title="view, edit params" id="cstr_btn_one_${zz}" class="param_btn" 
                    onclick="param_btn_clicked(event, ${zz})">
                </button>
               <img id="cstr_img_${zz}" class="cstr_img" src="images/CSTR_0.jpg" alt="CSTR">
             </div>
        `; // END buildText << NOTE BACK-TICK BEFORE SEMICOLON  
    }
    
    // console.log(' BUILDTEXT = ' + buildText);
    console.log('at end function buildCSTR');
    
    return buildText;
} // END OF FUNCTION buildCSTR
