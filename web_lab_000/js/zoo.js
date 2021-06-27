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
    data.x1 = 10;
    data.y1 = 10;
    data.x2 = 100;
    data.y2 = 100;
    data.color = 'green';
    data.width = '4px';
    data.pi = Math.pi;
    data.degTOrad = Math.PI / 180;
    // examples from Lab 00
    //   angle = angleDeg * degTOrad; // convert user input in degrees to radians
    //   accel = gravity * Math.sin(-angle); // update accel for angle changes

    // data['version'] = new Object();
    // data['version'] = 'TedTok_01';
    // data['target'] = new Object();
    // data['target'] = '3';
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

  let a = 30; // angle in degrees
  let d = 100; // distance, length of line
  let color = 'green';
  let width = 3;
  let id = '';
  result = fFgene(data.x1,data.y1,a,d,color,width,id);
  data.x1 = result[0];
  data.y1 = result[1];

  console.log('result = ' + result);
  console.log('data.x1 = ' + data.x1);
  console.log('data.y1 = ' + data.y1);

  a = -45; // angle in degrees
  d = 50; // distance, length of line
  color = 'blue';
  width = 1;
  id = '';
  result = fFgene(data.x1,data.y1,a,d,color,width,id);
  data.x1 = result[0];
  data.y1 = result[1];

} // END of updateDisplay method

function newSVGline(x1,y1,x2,y2,color,width,id) {

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

} // END OF function newSVGline

function fFgene(x1,y1,a,d,color,width,id) {

   // draw a line of length d at angle a from x,y
   // angles specified in degrees but JS functions need radians
   let arad = a * data.degTOrad;
   let dx = d * Math.cos(arad);
   let dy = d * Math.sin(arad);

  dx = Math.round(dx);
  dy = Math.round(dy);
  let x2 = x1 + dx;
  let y2 = y1 + dy;

  newSVGline(x1,y1,x2,y2,color,width,id); // ,color,width,id);

  let result = [];
  result[0] = x2;
  result[1] = y2;
  return result

} // END OF function fFgene
