// Design, text, images and code by Richard K. Herz, 2017-2021
// Copyrights held by Richard K. Herz
// Licensed for use under the GNU General Public License v3.0
// https://www.gnu.org/licenses/gpl-3.0.en.html

// gene$(1) is increment of angle rotation (degrees, 0 points right, + is CCW)
// gene$(2) is generation length change factor df for new shoot off major bud B
// gene$(3) is generation length change factor df for new shoot off minor bud b
// gene$(4 on) are growth instructions

// F = make one step forward of length d drawing line
// J = jump, by making one step forward of length d not drawing line
// + = rotate by increment of angle rotation specified by gene$(1)
// - = rotate by NEGATIVE of increment of angle rotation specified by gene$(1)
// [ = remember this x,y coordinate and direction (angle)
// ] = return to x,y coordinate and direction (angle) of [ of this [] pair
// B = major bud location, after following this set of instructions
//     return to each new bud location and repeat entire set of instructions
// b = minor bud location, after following this set of instructions
//     return to each new bud location and repeat entire set of instructions

function openThisLab() {
  // WARNING: can only alter HTML if this function called by
  //          onload property in BODY TAG (not onload in page header)
} // END OF function openThisLab

// these are used by function eraseSVG to remove all svg elements on display before
// drawing a new set of images - if covered but not removed, they take up
// memory and increase processing time
// the svg element id's are updated in fNewSVGline when new lines are added
// the data object gets re-initialized if add more than one image to display
// so make these vars independent to keep track of all svg elements on display
let globalSVGidNumber = -1; // increment in fNewSVGline such that 1st used is zero
let globalSVGidPrefix = 'svg-';

let data = {
  initialize : function() {
    data.x1 = 100;
    data.y1 = 100;
    data.a = 0; // angle bud points
    data.d = 10; // length of first shoot
    data.budType = 2; // major (B) = 2, minor (b) = 1
    data.color = 'green';
    data.width = '4px';
    data.pi = Math.pi;
    data.degTOrad = Math.PI / 180;
    data.gravSwitch = 0; // off = 0, on = 1
    data.gravFac = 8;
    data['gene'] = new Array();

    // console.log('data initialize, new array gene length = ' + data['gene'].length);
    // console.log("data['gene'][0] = " + data['gene'][0]);
    data['gene'][0] = 0;
    // console.log("data['gene'][0] = " + data['gene'][0]);

    // arrays data['newGen'] and data['lastGen'] contain bud info (loc, angle, type...)
    // reverse indexes from TB and LiveCode to this >> data['newGen'][0-4][bud#]
    // so don't have to specify number buds here, which is different for different
    // genes and increase in number each generation
    let alen = 5;
    data['newGen'] = new Array(alen); // create array of length 5
    for (i = 0; i < alen; i++) {
      data['newGen'][i] = []; // add index
    }
    data['lastGen'] = new Array(alen);
    for (i = 0; i < alen; i++) {
      data['lastGen'][i] = []; // add index
    }

  } // END of function data.initialize()
} // END of object data

function updateBody() {
  // called in body tag onload so can alter HTML elements
  // console.log('enter updateBody');
  // data.initialize();
  // fBracken();
  // updateDisplay();
  // console.log('end updateBody');
} // END OF function updateBody

function fEraseSVG() {
  // called by onclick of erase button and fSelectZoo()

  // console.log('ENTER function eraseSVG')
  // console.log('globalSVGidNumber = ' + globalSVGidNumber);

  // globalSVGidNumber and globalSVGidPrefix are used here to remove all svg
  // elements on display before drawing a new set of images
  // if covered but not removed, they take up memory and increase processing time
  // the svg element id's are updated in fNewSVGline when new lines are added
  // the data object gets re-initialized if add more than one image to display
  // so make these vars independent to keep track of all svg elements on display

  if (globalSVGidNumber >= 0) {
    let tSVGid;
    let tSVG;
    let parent;
    // globalSVGidNumber ranges from 0 to number elements-1
    for (i = 0; i < 1+globalSVGidNumber; i++) {
      tSVGid = globalSVGidPrefix + i;
      tSVG = document.getElementById(tSVGid);
      parent = tSVG.parentNode;
      parent.removeChild(tSVG);
    } // END OF for
    globalSVGidNumber = -1;
  } // END OF if

  // console.log('globalSVGidNumber = ' + globalSVGidNumber);
  // console.log('END OF function eraseSVG')

} // END OF function fEraseSVG

function fSelectZooStart() {
  // called by html element select id='selectZoo'
  // when select new creature, function defining new creature will use its
  // default maxGen
  // after creature is drawn first time, then user can change maxGen
  document.getElementById("selectMaxGen").value = 'select';
  fSelectZooFinish();
} // END OF function fSelectZooStart

function fSelectZooFinish() {

  fEraseSVG();
  data.initialize();

  let zoo = document.getElementById("selectZoo").value;
  // Bracken, Gasket, Dragon, Koch6, Islands, TestDNA

  $.post("../webAppRunLog.lc",{webAppNumber: "000, Artificial Zoo, " + zoo});

  // console.log('fSelectZoo, before switch, data.maxGen = ' + data.maxGen);

  switch (zoo) {
    case 'select':
      // do nothing, return
      // this is value of select menu when page first loads
      // fSelectZooFinish gets called when user selects maxgen
      // but don't want to do anything if no zoo creature selected
      return;
    case 'Bracken':
      fBracken();
      break;
    case 'Gasket':
      fSierpinski();
      break;
    case 'Dragon':
      fDragon();
      break;
    case 'Koch6':
      fKoch6();
      break;
    case 'Islands':
      fIslands();
      break;
    case 'Test':
      fTestDNA();
      break;
    default:
      // bad selection
  } // END OF switch

  if (zoo == 'select') {
    document.getElementById('field_gene').innerHTML = "";
  } else {
    document.getElementById('field_gene').innerHTML = "gene: " + data['gene'];
    document.getElementById('field_status').innerHTML = 'growing...';
    window.document.body.style.cursor = 'wait'; // sets the cursor shape to wait
  }

  // console.log('just before setTimeout');

  // need to call updateDisplay after a delay in which I can
  // update notice fields and the select menu button label can change
  // and can show a wait progress cursor
  window.setTimeout(updateDisplay, 500);

  // console.log('leave function fSelectZoo');

} // END OF function fSelectZoo

function fSelectMaxGen() {

  let temp = document.getElementById("selectMaxGen").value;
  if (temp == 'select') {
    return;
  }

  data.maxGen = temp;

  console.log('fSelectMaxGen, data.maxGen = ' + data.maxGen);

  fSelectZooFinish();

  console.log('fSelectMaxGen, after fSelectZoo, data.maxGen = ' + data.maxGen);

} // END OF function fSelectMaxGen

function updateDisplay() {

  console.log('updateDisplay, data.maxGen = ' + data.maxGen);

  // call fGrow with timeout so can see each generation drawn separately
  // at end of fGrow when last gen drawn, wait cursor and notice field are cleared
  let timestep = 500;
  for (let thisGen = 0; thisGen < data.maxGen; thisGen++) {
    window.setTimeout(fGrow, timestep*thisGen, thisGen);
  }

} // END OF function updateDisplay

function fGrow(thisGen) {

  // console.log('enter function fGrow, thisGen = ' + thisGen);

  // display thisGen from 1 since variable thisGen starts at 0
  let gennum = thisGen+1;
  document.getElementById('field_status').innerHTML = 'growing generation ' + gennum;

  // put 0 into newBud -- incremented below with each new bud formed
  // put 1 into oldBud -- incremented below before end of do-loop
  let newBud = -1; // was 0 in TB,LC - here so array index = 0 after 1st increment
  let oldBud = 0; // was 1 in TB, LC

  // copy newGen to lastGen
  // THIS ARRAY COPY TAKES INSIGNIFICANT TIME COMPARED TO APPENDING SVG LINES
  //  as determined in tests alternately calling fGrowEven and fGrowOdd and
  //  having those alternatively read one and write one of data['newGen'] or data['lastGen']
  for (i = 0; i < 5; i++) {
    for (j in data['newGen'][i]) {
      data['lastGen'][i][j] = data['newGen'][i][j];
    }
  }

  // newGen and lastGen arrays contain only info on buds: their x,y start loc,
  // their angles, length info, budType (1,2)
  // each has unique info for their generation only
  // after array copy lastGen << newGen
  // lastGen has buds from gen currently being read, i.e., thisGen = 0; thisGen < data.maxGen;
  // and newGen is updated below with the buds that will grow the next generation

  // the number of buds in thisGen = (# buds in gene)^thisGen
  // e.g., for bracken with 3 buds in gene, thisGen = 0 has 1 bud = 3^0
  // for thisGen = 1 has 3 buds = 3^1, for thisGen = 2 has 9 buds = 3^2
  // for thisGen = 7 (last of 8 generations) has 2187 buds = 3^7
  // the number of line segments in thisGen is # buds * # F's (6 in bracken)

  // data['lastGen'] elements (arrays) are the descriptions of buds in the current
  // generation being grown, i.e., x,y loc, angle, length info, budType
  // data['lastGen'][4] elements are bud type, 1 = "b", 2 = "B"

  while ((data['lastGen'][4][oldBud] == 1) || (data['lastGen'][4][oldBud] == 2)) {

    // xxx declare these above while

    // read next bud from lastGen
    let tX = data['lastGen'][0][oldBud];
    let tY = data['lastGen'][1][oldBud];
    let tA = data['lastGen'][2][oldBud]; // angle
    let tD = data['lastGen'][3][oldBud]; // length parent shoot
    let tBudType = data['lastGen'][4][oldBud]; // xxx use or need data.budType?

    let tArot = data.gene[0];
    let tMajorChange = data.gene[1];
    let tMinorChange = data.gene[2];
    let xOLD = [];
    let yOLD = [];
    let aOLD = [];

    if (tBudType == 2) {
      tD = tD * tMajorChange;
    } else {
      tD = tD * tMinorChange;
    }

    if (data.gravSwitch == 1) {

      // get angle off zero so gravity can take effect
      while (tA < 0) {
        tA = tA + 360;
      }

      // repeat until tA is not 90
      //    -- BASIC FUNCTION: rnd returns value from 0 to less than 1
      //    -- LC random(upperLimit) returns integer between 1 and upperLimit
      //    put (random(1001)-1)/1000 into rnd
      //    put tA + 1*(1 - 2*rnd) into tA
      // end repeat
      while (tA == 90){
        tA = tA + (1 - 2 * Math.random());
      }

      // add effect of gravity, a = 90 is straight up
      if ( (tA > 90) && (tA < (270 - data.gravFac)) ) {
        tA = tA + data.gravFac;
      } else if ( (tA > (270 + data.gravFac)) && (tA < 360) ) {
        tA = tA - data.gravFac;
      } else if ( (tA > 0) && (tA < 90) ) {
        tA = tA - data.gravFac;
      } // END OF if ( (tA > 90) ...

    } // END OF if (data.gravSwitch == 1)

    // initialize bracket counters
    let right_bracket = -1; // so array index = 0 after first increment
    let left_bracket = -1;

    let ng = 0;

    // repeat while gene$[ng] is not empty
    while (data.gene[ng]) {

      // console.log( 'fGrow: ng = ' + ng );
      // console.log( 'fGrow: while (data.gene[ng]), data.gene[ng] = ' + data.gene[ng] );

      switch (data.gene[ng]) {
        case 'F':
          // console.log('case F');
          result = fFgene(tX,tY,tA,tD,data.color,data.width);
          tX = result[0];
          tY = result[1];
          break;
        case 'J':
          // console.log('case J');
          result = fJgene(tX,tY,tA,tD);
          tX = result[0];
          tY = result[1];
          break;
        case '[':
          // console.log('case [');
          // remember this x,y coordinate and direction (angle)
          left_bracket = left_bracket + 1;
          xOLD[left_bracket] = tX;
          yOLD[left_bracket] = tY;
          aOLD[left_bracket] = tA;
          break;
        case ']':
          // console.log('case ]');
          right_bracket = right_bracket + 1;
          let theOne = left_bracket - right_bracket;
          tX = xOLD[theOne];
          tY = yOLD[theOne];
          tA = aOLD[theOne];
          if (right_bracket == left_bracket) {
            // matched all pairs so far, reset counters
            right_bracket = -1; // so array index = 0 after first increment
            left_bracket = -1;
          }
          break;
        case '+':
          // console.log('case +');
          tA = tA + tArot;
          break;
        case '-':
          // console.log('case -');
          tA = tA - tArot;
          break;
        case 'B':
          // console.log('case B');
          // no break, falls through and B vs. b considered in IF below
        case 'b':
          // console.log('case b');
          if (thisGen < data.maxGen) {
            // record this x,y coordinate as a new bud
            newBud = newBud + 1;
            data['newGen'][0][newBud] = tX;
            data['newGen'][1][newBud] = tY;
            data['newGen'][2][newBud] = tA;
            data['newGen'][3][newBud] = tD;
            if (data['gene'][ng] == 'B') {
              data['newGen'][4][newBud] = 2;
            } else {
              data['newGen'][4][newBud] = 1;
            }
          } // END OF if (thisGen < data.maxGen)
          break;
        default:
          // console.log('while default');
          // bad gene
       } // END OF switch

       ng = ng + 1;

    } // END OF while (data.gene[ng])

    oldBud = oldBud + 1; // increment so read next old bud

  } // END OF while ((data['lastGen'][4][oldBud] ...

  if (thisGen == data.maxGen-1) {
    window.document.body.style.cursor = ""; // sets the cursor shape to default
    document.getElementById('field_status').innerHTML = '';
  }

} // END OF function fGrow

function fNewSVGline(x1,y1,x2,y2,color,width) {

  // console.log('enter function fNewSVGline');

  // first need to set reference to svg namespace
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Namespaces_Crash_Course
  // https://oreillymedia.github.io/Using_SVG/extras/ch03-namespaces.html
  // 2000 version used by examples in both links listed below
  //   let svgNS = 'http://www.w3.org/2000/svg';
  //   http://tutorials.jenkov.com/svg/
  //   see answer by thatOneGuy at
  //     https://stackoverflow.com/questions/35134131/svg-adding-a-line-with-javascript
  //
  // for this example, see answer by thatOneGuy at
  //   https://stackoverflow.com/questions/35134131/svg-adding-a-line-with-javascript
  let svgNS = 'http://www.w3.org/2000/svg';
  let newLine = document.createElementNS(svgNS,'line');
  newLine.setAttribute('x1',x1);
  newLine.setAttribute('y1',y1);
  newLine.setAttribute('x2',x2);
  newLine.setAttribute('y2',y2);
  newLine.setAttribute("stroke", color);
  newLine.setAttribute("stroke-width", width);
  // increment id - need id if later want to delete image on display
  globalSVGidNumber = globalSVGidNumber + 1;
  let svgID = globalSVGidPrefix + globalSVGidNumber;
  newLine.setAttribute('id',svgID);
  $("svg").append(newLine);

} // END OF function fNewSVGline

function fFinishGene(geneTail) {

  for (g = 0; g < geneTail.length; g++ ) {
    // CAN NOT USE THIS, apparently g is string here >> for (g in geneTail) {
    data['gene'][g+3] = geneTail.substr(g, 1);

    // // console.log('fFinishGene 1: g, substr = ' + g + ', ' + geneTail.substr(g, 1) );
    // let x = g+3;
    // // console.log("fFinishGene 1: data['gene'][" + x + "] = " + data['gene'][g+3] );

  }

  // for (i in data['gene']) {
  //   // THIS WORKS HERE: for (i in data['gene'])
  //   // console.log("fFinishGene 2 : data['gene'][" + i + "] = " + data['gene'][i] );
  // }

  // reset d to increase d so 1st line drawn equal to d value set above
  // since scale factor will be applied 1st time d used

  if (data.budType == 2) {
    data.d = data.d/data.gene[1];
  } else {
    data.d = data.d/data.gene[2];
  }

} // END OF function fFinishGene

function fFgene(x1,y1,a,d,color,width) {

   // draw a line of length d at angle a from x1,y1
   // angles specified in degrees but JS functions need radians
   let arad = a * data.degTOrad;
   let dx = d * Math.cos(arad);
   let dy = d * Math.sin(arad);

  dx = Math.round(dx);
  dy = Math.round(dy);
  let x2 = x1 + dx;
  let y2 = y1 - dy;

  fNewSVGline(x1,y1,x2,y2,color,width);

  let result = [];
  result[0] = x2;
  result[1] = y2;
  return result

} // END OF function fFgene

function fJgene(x1,y1,a,d) {

   // jump length d at angle a from x1,y1
   // angles specified in degrees but JS functions need radians
   let arad = a * data.degTOrad;
   let dx = d * Math.cos(arad);
   let dy = d * Math.sin(arad);

  dx = Math.round(dx);
  dy = Math.round(dy);
  let x2 = x1 + dx;
  let y2 = y1 - dy;

  let result = [];
  result[0] = x2;
  result[1] = y2;
  return result

} // END OF function fJgene

// ------- ZOO ANIMAL DEFINITIONS BELOW --------------

function fBracken() {
  // 45, 0.8, 0.4, "FF[+Fb]F[-Fb]FB"

  // specify initial bud
  data.x1 = 350;
  data.y1 = 500;
  data.a = 91; // angle bud points
  data.d = 35; // length of first shoot
  data.budType = 2; // major (B) = 2, minor (b) = 1

  let mg = document.getElementById("selectMaxGen").value;
  if (mg == 'select') {
    data.maxGen = 8;
    document.getElementById("selectMaxGen").value = data.maxGen;
  }

  data.gravSwitch = 1; // off = 0, on = 1
  data.gravFac = 8;

  data.color = 'green';
  data.width = '4px';

  // specify gene
  data['gene'][0] = 45;
  data['gene'][1] = 0.8;
  data['gene'][2] = 0.4;
  // let temp = 'FF[+Fb]F[-Fb]FB';
  let temp = 'FF[+Fb]F[-Fb]FB';
  fFinishGene(temp);

  // copy initial bud specifications to newGen array
   let newBud = 0;
   data['newGen'][0][newBud] = data.x1;
   data['newGen'][1][newBud] = data.y1;
   data['newGen'][2][newBud] = data.a;
   data['newGen'][3][newBud] = data.d;
   data['newGen'][4][newBud] = data.budType;

} // END OF function fBracken

function fBracken2() {
  // 45, 0.8, 0.4, "FF[+Fb]F[-Fb]FB"

  // specify initial bud
  data.x1 = 300;
  data.y1 = 600;
  data.a = 91; // angle bud points
  data.d = 35; // length of first shoot
  data.budType = 2; // major (B) = 2, minor (b) = 1

  let mg = document.getElementById("selectMaxGen").value;
  if (mg == 'select') {
    data.maxGen = 4;
    document.getElementById("selectMaxGen").value = data.maxGen;
  }

  data.gravSwitch = 1; // off = 0, on = 1
  data.gravFac = 8;

  // specify gene
  data['gene'][0] = 45;
  data['gene'][1] = 0.4;
  data['gene'][2] = 0.8;
  // let temp = 'FF[+Fb]F[-Fb]FB';
  let temp = 'FF[+Fb]F[-Fb]FB';
  fFinishGene(temp);

  // copy initial bud specifications to newGen array
   let newBud = 0;
   data['newGen'][0][newBud] = data.x1;
   data['newGen'][1][newBud] = data.y1;
   data['newGen'][2][newBud] = data.a;
   data['newGen'][3][newBud] = data.d;
   data['newGen'][4][newBud] = data.budType;

} // END OF function fBracken2

function fSierpinski() {
  // 120,0.5,1,BFBF-FF-F[-B]F

  // specify initial bud
  data.x1 = 450;
  data.y1 = 350;
  data.a = 180; // angle bud points
  data.d = 200; // length of first shoot
  data.budType = 2; // major (B) = 2, minor (b) = 1

  let mg = document.getElementById("selectMaxGen").value;
  if (mg == 'select') {
    data.maxGen = 6;
    document.getElementById("selectMaxGen").value = data.maxGen;
  }

  data.gravSwitch = 0; // off = 0, on = 1
  data.gravFac = 16;

  data.color = 'blue';
  data.width = '3px';

  // specify gene
  data['gene'][0] = 120;
  data['gene'][1] = 0.5;
  data['gene'][2] = 1;
  let temp = 'BFBF-FF-F[-B]F';
  fFinishGene(temp);

  // copy initial bud specifications to newGen array
   let newBud = 0;
   data['newGen'][0][newBud] = data.x1;
   data['newGen'][1][newBud] = data.y1;
   data['newGen'][2][newBud] = data.a;
   data['newGen'][3][newBud] = data.d;
   data['newGen'][4][newBud] = data.budType;

} // END OF function fSierpinski

function fTestDNA() {

  // specify initial bud
  data.x1 = 300;
  data.y1 = 300;
  data.a = 0; // angle bud points
  data.d = 60; // length of first shoot
  data.budType = 2; // major (B) = 2, minor (b) = 1

  let mg = document.getElementById("selectMaxGen").value;
  if (mg == 'select') {
    data.maxGen = 10;
    document.getElementById("selectMaxGen").value = data.maxGen;
  }

  data.gravSwitch = 0; // off = 0, on = 1

  data.color = 'red';
  data.width = '2px';

  // specify gene
  data['gene'][0] = 45;
  data['gene'][1] = 0.8;
  data['gene'][2] = 0.4;
  let temp = 'F+F[-F]+FB';
  fFinishGene(temp);

  // copy initial bud specifications to newGen array
   let newBud = 0;
   data['newGen'][0][newBud] = data.x1;
   data['newGen'][1][newBud] = data.y1;
   data['newGen'][2][newBud] = data.a;
   data['newGen'][3][newBud] = data.d;
   data['newGen'][4][newBud] = data.budType;

} // END OF function fTestDNA

function fDragon() {

  // specify initial bud
  data.x1 = 150;
  data.y1 = 200;
  data.a = 0; // angle bud points
  data.d = 250;
  data.budType = 2; // major (B) = 2, minor (b) = 1

  let mg = document.getElementById("selectMaxGen").value;
  if (mg == 'select') {
    data.maxGen = 12;
    document.getElementById("selectMaxGen").value = data.maxGen;
  }

  data.gravSwitch = 0; // off = 0, on = 1

  data.color = 'red';
  data.width = '1px';

  // specify gene
  data['gene'][0] = 45;
  data['gene'][1] = 0.707; // 1/Math.sqrt(2) would need to be rounded for display
  data['gene'][2] = 1;
  let temp = '-BF++F----B';
  fFinishGene(temp);

  // copy initial bud specifications to newGen array
   let newBud = 0;
   data['newGen'][0][newBud] = data.x1;
   data['newGen'][1][newBud] = data.y1;
   data['newGen'][2][newBud] = data.a;
   data['newGen'][3][newBud] = data.d;
   data['newGen'][4][newBud] = data.budType;

} // END OF function fDragon

function fKoch6() {

  // specify initial bud
  data.x1 = 140;
  data.y1 = 260;
  data.a = 60; // angle bud points
  data.d = 100;
  data.budType = 2; // major (B) = 2, minor (b) = 1

  let mg = document.getElementById("selectMaxGen").value;
  if (mg == 'select') {
    data.maxGen = 4;
    document.getElementById("selectMaxGen").value = data.maxGen;
  }

  data.gravSwitch = 0; // off = 0, on = 1

  data.color = 'DodgerBlue';
  data.width = '1px';

  // specify gene
  data['gene'][0] = 60;
  data['gene'][1] = 0.333; // 1/3 would need to be rounded for display
  data['gene'][2] = 0.333;
  // note: lots of repetition, anyway to reduce, e.g., by adding []...
  let temp = 'BF+BF--BF+BF--BF+BF--BF+BF--BF+BF--BF+BF';
  fFinishGene(temp);

  // copy initial bud specifications to newGen array
   let newBud = 0;
   data['newGen'][0][newBud] = data.x1;
   data['newGen'][1][newBud] = data.y1;
   data['newGen'][2][newBud] = data.a;
   data['newGen'][3][newBud] = data.d;
   data['newGen'][4][newBud] = data.budType;

} // END OF function fKoch6

function fIslands() {

  // console.log('enter fIslands');
  // let selGenVal = document.getElementById("selectMaxGen").value;
  // console.log('fIslands, selGenVal = ' + selGenVal);
  // console.log('fIslands, maxGen = ' + data.maxGen);

  // specify initial bud
  data.x1 = 400;
  data.y1 = 350;
  data.a = 90; // angle bud points
  data.d = 40;
  data.budType = 2; // major (B) = 2, minor (b) = 1

  let mg = document.getElementById("selectMaxGen").value;
  if (mg == 'select') {
    data.maxGen = 2;
    document.getElementById("selectMaxGen").value = data.maxGen;
  }

  data.gravSwitch = 0; // off = 0, on = 1

  data.color = 'DodgerBlue';
  data.width = '1px';

  // specify gene
  data['gene'][0] = 90;
  data['gene'][1] = 0.15;
  data['gene'][2] = 1;
  // note: lots of repetition, anyway to reduce, e.g., by adding []...
  let temp = 'BF+J-BFBF+BF+BFBF+BFJ+BFBF-J+BFBF-BF-BFBF-BFJ-BFBFBF';

  fFinishGene(temp);

  // THIS LAB HAS MORE THAN ONE STARTING LOCATION

  let newBud;
  let tFac = 0.9; // << NOTE: this differs greatly from other versions

  // NOTE: TB version has screen y direction reversed from LC and here

  // NOTE: I had to adjst tFac and data.d values to get the four segments
  //       to match up at corners of the square...

  // copy initial bud specifications to newGen array
  newBud = 0;
  data['newGen'][0][newBud] = data.x1;
  data['newGen'][1][newBud] = data.y1;
  data['newGen'][2][newBud] = data.a;
  data['newGen'][3][newBud] = data.d;
  data['newGen'][4][newBud] = data.budType;

  newBud = 1;
  data['newGen'][0][newBud] = data.x1;
  data['newGen'][1][newBud] = data.y1 - tFac*data.d;
  data['newGen'][2][newBud] = 2 * data.a;
  data['newGen'][3][newBud] = data.d;
  data['newGen'][4][newBud] = data.budType;

  newBud = 2;
  data['newGen'][0][newBud] = data.x1 - tFac*data.d;
  data['newGen'][1][newBud] = data.y1 - tFac*data.d;
  data['newGen'][2][newBud] = 3 * data.a;
  data['newGen'][3][newBud] = data.d;
  data['newGen'][4][newBud] = data.budType;

  newBud = 3;
  data['newGen'][0][newBud] = data.x1 - tFac*data.d;
  data['newGen'][1][newBud] = data.y1;
  data['newGen'][2][newBud] = 0;
  data['newGen'][3][newBud] = data.d;
  data['newGen'][4][newBud] = data.budType;

} // END OF function fIslands
