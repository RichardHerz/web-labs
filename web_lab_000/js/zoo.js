function openThisLab() {
  data.initialize();
  // WARNING: can only alter HTML if this function called by
  //          onload property in BODY TAG (not onload in page header)
}

let data = {
  // QUESTION: I apparently need the initialize method called by openThisLab
  //           in regular web labs but do I need it here?
  // ANSWER: Yes I do need initialize method: tried without it and doesn't work
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
    data.maxGen = 3;
    data.gravSwitch = 0; // off = 0, on = 1
    data['gene'] = new Array();

    // console.log('data initialize, new array gene length = ' + data['gene'].length);
    // console.log("data['gene'][0] = " + data['gene'][0]);
    data['gene'][0] = 0;
    // console.log("data['gene'][0] = " + data['gene'][0]);

    // reverse indexes from TB and LiveCode to data['newGen'][0-4][gen#]
    // so don't have to specify number generations here
    let alen = 5;
    data['newGen'] = new Array(alen); // create array of length 5
    for (i = 0; i < alen; i++) {

      // console.log("i in data['newGen'], i = " + i);

      data['newGen'][i] = []; // add index
    }

    // console.log( "data['newGen'][0] = " + data['newGen'][0] );

    data['lastGen'] = new Array(alen);
    for (i = 0; i < alen; i++) {
      data['lastGen'][i] = new Array();
    }

  } // END of function data.initialize()
} // END of object data

function updateBody() {
  // called in body tag onload so can alter HTML elements
  // jQuery JS library needs to have been loaded for next line to work
  $.post("../webAppRunLog.lc",{webAppNumber: "000, Artificial Zoo"});
  updateDisplay();
} // END of function updateBody()

function updateDisplay() {

  let result = [];

  // // test F gene
  // let a = 30; // angle in degrees
  // let d = 100; // distance, length of line
  // let color = 'green';
  // let width = '3px';
  // let id = '';
  // result = fFgene(data.x1,data.y1,a,d,color,width,id);
  // data.x1 = result[0];
  // data.y1 = result[1];
  //
  // // test J gene
  // a = 45;
  // d = 50;
  // result = fJgene(data.x1,data.y1,a,d);
  // data.x1 = result[0];
  // data.y1 = result[1];
  //
  // // test F gene
  // a = -45; // angle in degrees
  // d = 50; // distance, length of line
  // result = fFgene(data.x1,data.y1,a,d,data.color,data.width,data.id);
  // data.x1 = result[0];
  // data.y1 = result[1];

  // xxx should return result from fTestDNA and assign to data['gene']
  // xxx and not do internally to function

  // fTestDNA();
  // // console.log( "after fTestDNA(), data['gene'] = " + data['gene'] );
  // data.color = 'blue';
  // data.width = '1px';
  // for(let thisGen = 0; thisGen < data.maxGen; thisGen++) {
  //   // console.log('updateDisplay: fGrow(thisGen) call, thisGen = ' + thisGen );
  //   fGrow(thisGen);
  //   // console.log('updateDisplay: after fGrow(thisGen) call' );
  // }

  fSierpinski();
  data.color = 'red';
  data.width = '1px';
  for(let thisGen = 0; thisGen < data.maxGen; thisGen++) {
    // console.log('updateDisplay: fGrow(thisGen) call, thisGen = ' + thisGen );
    fGrow(thisGen);
    // console.log('updateDisplay: after fGrow(thisGen) call' );
  }

} // END of updateDisplay method

function fGrow(thisGen) {

  // console.log('enter function fGrow');

  // copy newGen to lastGen
  // newGen is initialized in the commands that specify the genes for this "zoo animal"
  // newGen is updated below when a bud gene is encountered
  // last 2 array indexes reversed here from LC and TB versions

  // xxx need to review this - do we have to copy everything?
  // can we copy by value or reference?
  // see https://holycoders.com/javscript-copy-array/
  // see https://orizens.com/blog/javascript-arrays-passing-by-reference-or-by-value/

  for (i = 0; i < 5; i++) {
    for (j in data['newGen'][i]) {
      data['lastGen'][i][j] = data['newGen'][i][j];
    }
  }

  // put 0 into newBud -- incremented below with each new bud formed
  // put 1 into oldBud -- incremented below before end of do-loop
  let newBud = -1; // was 0 in TB,LC - here so array index = 0 after 1st increment
  let oldBud = 0; // was 1 in TB, LC

  // bud type, 1 = "b", 2 = "B"

  // repeat while (lastGen[oldBud][5] = 1) or (lastGen[oldBud][5] = 2) -- repeat for all last buds

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

    if(tBudType == 2) {
      tD = tD * tMajorChange;
    } else {
      tD = tD * tMinorChange;
    }

    if(data.gravSwitch == 1) {

      // get angle off zero so gravity can take effect
      while(tA < 0) {
        tA = tA + 360;
      }

      // repeat until tA is not 90
      //    -- BASIC FUNCTION: rnd returns value from 0 to less than 1
      //    -- LC random(upperLimit) returns integer between 1 and upperLimit
      //    put (random(1001)-1)/1000 into rnd
      //    put tA + 1*(1 - 2*rnd) into tA
      // end repeat
      while(tA == 90){
        tA = tA + (1 - 2 * Math.random());
      }

      // add effect of gravity, a = 90 is straight up
      let factor = 4;
      if( (tA > 90) && (tA < (270 - factor)) ) {
        tA = tA + factor;
      } else if( (tA > (270 + factor)) && (tA < 360) ) {
        tA = tA - factor;
      } else if( (tA > 0) && (tA < 90) ) {
        tA = tA - factor;
      } // END OF if( (tA > 90) ...

    } // END OF if(data.gravSwitch == 1)

    // initialize bracket counters
    let right_bracket = -1; // so array index = 0 after first increment
    let left_bracket = -1;

    // put 4 into ng
    let ng = 0;

    // repeat while gene$[ng] is not empty
    while(data.gene[ng]) {

      // console.log( 'fGrow: ng = ' + ng );
      // console.log( 'fGrow: while(data.gene[ng]), data.gene[ng] = ' + data.gene[ng] );

      switch(data.gene[ng]) {
        case 'F':
          // console.log('case F');
          result = fFgene(tX,tY,tA,tD,data.color,data.width,data.id);
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
          if(right_bracket == left_bracket) {
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
          if(thisGen < data.maxGen) {
            // record this x,y coordinate as a new bud
            newBud = newBud + 1;
            data['newGen'][0][newBud] = tX;
            data['newGen'][1][newBud] = tY;
            data['newGen'][2][newBud] = tA;
            data['newGen'][3][newBud] = tD;
            if(data['gene'][ng] == 'B') {
              data['newGen'][4][newBud] = 2;
            } else {
              data['newGen'][4][newBud] = 1;
            }
          } // END OF if(thisGen < data.maxGen)
          break;
        default:
          // console.log('while default');
          // bad gene
       } // END OF switch

       ng = ng + 1;

    } // END OF while(data.gene[ng])

    oldBud = oldBud + 1; // increment so read next old bud

  } // END OF while ((data['lastGen'][4][oldBud] ...

} // END OF function fGrow

function fNewSVGline(x1,y1,x2,y2,color,width,id) {

  // console.log('enter function fNewSVGline, x1 = ' + x1);

  // SET REFERENCE TO SVG NAME SPACE
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Namespaces_Crash_Course
  // https://oreillymedia.github.io/Using_SVG/extras/ch03-namespaces.html
  // 2000 version used by examples in both links listed below
  //   let svgNS = 'http://www.w3.org/2000/svg';
  //   http://tutorials.jenkov.com/svg/
  //   see answer by thatOneGuy at
  //     https://stackoverflow.com/questions/35134131/svg-adding-a-line-with-javascript
  let svgNS = 'http://www.w3.org/2000/svg';

  // for this example, see answer by thatOneGuy at
  //   https://stackoverflow.com/questions/35134131/svg-adding-a-line-with-javascript
  let newLine = document.createElementNS(svgNS,'line');
  newLine.setAttribute('x1',x1);
  newLine.setAttribute('y1',y1);
  newLine.setAttribute('x2',x2);
  newLine.setAttribute('y2',y2);
  newLine.setAttribute("stroke", color);
  newLine.setAttribute("stroke-width", width);
  newLine.setAttribute('id',id);
  $("svg").append(newLine);

} // END OF function fNewSVGline

function fFinishGene(geneTail) {

  for (g = 0; g < geneTail.length; g++ ) {
    // CAN NOT USE THIS, g is string here: for (g in geneTail) {
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

  if(data.budType == 2) {
    data.d = data.d/data.gene[1];
  } else {
    data.d = data.d/data.gene[2];
  }

  // xxx display gene in web page

} // END OF function fFinishGene

function fSierpinski() {
  // 120,0.5,1,BFBF-FF-F[-B]F

  // specify initial bud
  data.x1 = 450;
  data.y1 = 350;
  data.a = 180; // angle bud points
  data.d = 200; // length of first shoot
  data.budType = 2; // major (B) = 2, minor (b) = 1

  data.maxGen = 4;
  data.gravSwitch = 0; // off = 0, on = 1

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
  data.x1 = 150;
  data.y1 = 150;
  data.a = 0; // angle bud points
  data.d = 20; // length of first shoot
  data.budType = 2; // major (B) = 2, minor (b) = 1

  data.maxGen = 3;
  data.gravSwitch = 0; // off = 0, on = 1

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

function fFgene(x1,y1,a,d,color,width,id) {

   // draw a line of length d at angle a from x1,y1
   // angles specified in degrees but JS functions need radians
   let arad = a * data.degTOrad;
   let dx = d * Math.cos(arad);
   let dy = d * Math.sin(arad);

  dx = Math.round(dx);
  dy = Math.round(dy);
  let x2 = x1 + dx;
  let y2 = y1 - dy;

  fNewSVGline(x1,y1,x2,y2,color,width,id); // ,color,width,id);

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
