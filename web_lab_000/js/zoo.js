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

  newSVGline(10,10,100,100,'green','l1');

} // END of updateDisplay method

function newSVGline(x1,y1,x2,y2,color,id) {

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
  newLine.setAttribute('id',id);
  newLine.setAttribute('x1',x1);
  newLine.setAttribute('y1',y1);
  newLine.setAttribute('x2',x2);
  newLine.setAttribute('y2',y2);
  newLine.setAttribute("stroke", color)
  $("svg").append(newLine);

}
