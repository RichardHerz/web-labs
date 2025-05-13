'use strict';

/*
Design, text, images and code by Richard K. Herz, 2024-2025
Copyrights held by Richard K. Herz
Licensed for use under the GNU General Public License v3.0
https://www.gnu.org/licenses/gpl-3.0.en.html
*/

function buildTank(zz,x,y) {
  
    console.log('enter function buildTank, zz,x,y = ' + zz +', '+ x +', '+ y);

    // NOTE the back-ticks ` required at start and end of template string buildText
  
    let buildText = ` 

    <style>
        #tank_${zz} {
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
            <div id="tank_${zz}" class="tank" 
                onclick="paletteObjectClicked(event, 'tank' )" > 
                <div id="tank_input_one_${zz}" class="tank_input_one"></div>
                <div id="tank_input_two_${zz}" class="tank_input_two"></div>
                <div id="tank_info_${zz}" class="tank_info">info</div>
                <div id="tank_type_${zz}" class="tank_type">TANK</div>
                <div id="tank_num_${zz}" class="tank_num">0</div>
            </div>
        `; // END buildText << NOTE BACK-TICK BEFORE SEMICOLON  
    } else {
        console.log('buildText ELSE, zz = ' + zz); 
        buildText += ` 
           <div id="tank_${zz}" class="tank" 
                onclick="sceneObjectClicked(event, 'tank_${zz}' )" > 
                <div id="tank_input_one_${zz}" class="portIN tank_input_one"
                    onclick="input_clicked(event, tank_${zz})">
                </div>
                <div id="tank_input_two_${zz}" class="portIN tank_input_two"
                    onclick="input_clicked(event, tank_${zz})">
                </div>
                <div id="tank_info_${zz}" class="tank_info">info</div>
                <div id="tank_type_${zz}" class="tank_type">TANK</div>
                <div id="tank_num_${zz}" class="tank_num">1</div>
            </div>
        `; // END buildText << NOTE BACK-TICK BEFORE SEMICOLON  
    }
    
    // console.log(' BUILDTEXT = ' + buildText);
    console.log('at end function buildTank');
    
    return buildText;
    } // END OF FUNCTION buildTank
