'use strict';

/*
Design, text, images and code by Richard K. Herz, 2024-2025
Copyrights held by Richard K. Herz
Licensed for use under the GNU General Public License v3.0
https://www.gnu.org/licenses/gpl-3.0.en.html
*/

function buildFeed(zz,x,y) {
  
    console.log('enter function buildFeed, zz,x,y = ' + zz +', '+ x +', '+ y);

    // NOTE the back-ticks ` required at start and end of template string buildText
  
    let buildText = ` 

    <style>
        #feed_${zz} {
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
            <div id="feed_${zz}" class="feed" 
                onclick="paletteObjectClicked(event, 'feed' )" > 
                <div id="feed_output_one_${zz}" class="feed_output_one"></div>
                <div id="feed_info_${zz}" class="feed_info">info</div>
                <div id="feed_type_${zz}" class="feed_type">FEED</div>
                <div id="feed_num_${zz}" class="feed_num">0</div>
                <button id="feed_btn_one_${zz}" class="param_btn"></button>
            </div>
        `; // END buildText << NOTE BACK-TICK BEFORE SEMICOLON  
    } else {
        console.log('buildText ELSE, zz = ' + zz); 
        buildText += ` 
           <div id="feed_${zz}" class="feed" 
                onclick="sceneObjectClicked(event, ${zz}, 'feed_${zz}')" > 
                <div title="opt-alt click to add pipe" id="feed_output_one_${zz}" class="portOUT feed_output_one"
                    onclick="output_clicked(event, feed_${zz})">
                </div>
                <div id="feed_info_${zz}" class="feed_info">info</div>
                <div id="feed_type_${zz}" class="feed_type">FEED</div>
                <div id="feed_num_${zz}" class="feed_num">1</div>
                <button title="view, edit params" id="feed_btn_one_${zz}" class="param_btn" 
                    onclick="param_btn_clicked(event, ${zz})">
                </button>
            </div>
        `; // END buildText << NOTE BACK-TICK BEFORE SEMICOLON  
    }
    
    // console.log(' BUILDTEXT = ' + buildText);
    console.log('at end function buildFeed');
    
    return buildText;
} // END OF FUNCTION buildFeed
