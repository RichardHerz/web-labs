/*
  Design, text, images and code by Richard K. Herz, 2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

let reactor = {

  updateDisplayTimingMs : 100,
  fillFlag : 0,
  emptyFlag : 0,
  reactFlag : 0,
  reactConc0 : 1,
  reactConc : 1,
  reactConcMIN : 0.1,
  reactImgCounter : 0,

  openThisLab : function() {

    let el = document.querySelector("#div_PLOTDIV_reactor_contents");
    el.style.top = "129px";
    el.style.height = "70px";
    el.style.backgroundColor = "rgb(0,0,255)";

  }, // END OF function openThisLab

  fChangeImage : function(imgName) {
    // first set all to hidden
    let tImage = document.querySelector("#image_reactor_fill");
    tImage.style.visibility = "hidden";
    tImage = document.querySelector("#image_reactor_mix_00");
    tImage.style.visibility = "hidden";
    tImage = document.querySelector("#image_reactor_mix_01");
    tImage.style.visibility = "hidden";
    tImage = document.querySelector("#image_reactor_empty");
    tImage.style.visibility = "hidden";
    // now set the chosen image to visible
    tImage = document.querySelector(imgName);
    tImage.style.visibility = "visible";
  },

  fillReactor : function() {

    if (reactor.emptyFlag == 1 || reactor.reactFlag == 1) {
      reactor.fillFlag = 0;
      return;
    } else {
      reactor.fillFlag = 1;
    }

    // get time at start of repeating fillReactor
    startDate = new Date(); // need this here
    startMs = startDate.getTime();

    reactor.fChangeImage("#image_reactor_fill");

    // put this before change height & color or change each onclick
    // both two lines below work by themselves and don't require jquery
    let el = document.querySelector("#div_PLOTDIV_reactor_contents");
    // let el = document.getElementById("div_PLOTDIV_reactor_contents");
    // get current top and height
    let top = parseFloat(el.style.top); // convert, e.g., "100px" to 100
    let height = parseFloat(el.style.height); // convert, e.g., "100px" to 100
    // return if already full
    if (height >= 70) {
      reactor.fillFlag = 0;
      reactor.fChangeImage("#image_reactor_mix_00");
      return;
    }

    // reset reactConc
    reactor.reactConc = reactor.reactConc0;

      // fill with blue reactant
    el.style.backgroundColor = "rgb(0, 0, 255)"; // backgroundColor NOT background-color

    el.style.top = top - 2 + 'px';
    height = height + 2;
    el.style.height = height + 'px';

    // CONTINUE fillReactor WITH CALL TO ITSELF AFTER updateMs WAIT
    let thisDate = new Date();
    let currentMs = thisDate.getTime();
    let elapsedMs = currentMs - startMs;
    let updateMs = reactor.updateDisplayTimingMs - elapsedMs;
    setTimeout(reactor.fillReactor, updateMs);  // reactor.fillReactor, updateMs

  }, // END OF function fillReactor

  emptyReactor : function() {

    if (reactor.fillFlag == 1 || reactor.reactFlag == 1) {
      reactor.emptyFlag = 0;
      return;
    } else {
      reactor.emptyFlag = 1;
    }

    // get time at start of repeating emptyReactor
    startDate = new Date(); // need this here
    startMs = startDate.getTime();

    reactor.fChangeImage("#image_reactor_empty");

    // both two lines below work by themselves and don't require jquery
    let el = document.querySelector("#div_PLOTDIV_reactor_contents");
    // let el = document.getElementById("div_PLOTDIV_reactor_contents");
    let top = parseFloat(el.style.top); // convert, e.g., "100px" to 100
    let height = parseFloat(el.style.height); // convert, e.g., "100px" to 100

    // put this before change height or get height change each onclick
    if (height <= 2) {
      reactor.emptyFlag = 0;
      reactor.fChangeImage("#image_reactor_mix_00");
      return;
    }

    el.style.top = top + 2 + 'px';
    height = height - 2;
    el.style.height = height + 'px';

    // CONTINUE emptyReactor WITH CALL TO ITSELF AFTER updateMs WAIT
    let thisDate = new Date();
    let currentMs = thisDate.getTime();
    let elapsedMs = currentMs - startMs;
    let updateMs = reactor.updateDisplayTimingMs - elapsedMs;
    setTimeout(reactor.emptyReactor, updateMs);  // reactor.emptyReactor, updateMs

  }, // END OF function emptyReactor

  reactReactor : function() {
    if (reactor.fillFlag == 1 || reactor.emptyFlag == 1) {
      reactor.reactFlag = 0;
      return;
    }
    reactor.updateRunCount();
    reactor.reactReactorContinue();
  },

  updateRunCount : function() {
    $.post("http://reactorlab.net/web_labs/webAppRunLog.lc", {webAppNumber: "home_reactor"});
  },

  reactReactorContinue : function() {

    if (reactor.fillFlag == 1 || reactor.emptyFlag == 1) {
      reactor.reactFlag = 0;
      return;
    } else {
      reactor.reactFlag = 1;
    }

    // get time at start of repeating
    startDate = new Date(); // need this here
    startMs = startDate.getTime();

   if (reactor.reactImgCounter < 2) {
      reactor.fChangeImage("#image_reactor_mix_00");
      reactor.reactImgCounter = reactor.reactImgCounter + 1;
    } else {
      reactor.fChangeImage("#image_reactor_mix_01");
      reactor.reactImgCounter = 0;
    }

    // >>> BREAK OUT WHEN REACTION DONE
    // put this before change reaction or get reaction change each onclick
    if (reactor.reactConc/reactor.reactConc0 <= reactor.reactConcMIN) {
      reactor.fChangeImage("#image_reactor_mix_00");
      reactor.reactFlag = 0;
      return;
    }

    // both two lines below work by themselves and don't require jquery
    let el = document.querySelector("#div_PLOTDIV_reactor_contents");
    // let el = document.getElementById("div_PLOTDIV_reactor_contents");

    // step reaction
    let k = 1;
    let dt = 0.075;
    reactor.reactConc = reactor.reactConc- k * reactor.reactConc* dt;

    // compute color for this reactConc
    let B = Math.round(255*reactor.reactConc/reactor.reactConc0); // Blue = reactant
    let R = 255 - B; // Red = product
    let colorString = "rgb(" + R + ", 0, " + B + ")";

    // set color for this reactConc
    el.style.backgroundColor = colorString; // backgroundColor NOT background-color

    // update x-y plot
    let data = plotter.getPlotData(0);
    plotter.plotPlotData(data,0);

    // CONTINUE WITH CALL TO ITSELF AFTER updateMs WAIT
    let thisDate = new Date();
    let currentMs = thisDate.getTime();
    let elapsedMs = currentMs - startMs;
    let updateMs = reactor.updateDisplayTimingMs - elapsedMs;
    setTimeout(reactor.reactReactorContinue, updateMs);  // reactor.reactReactorContinue, updateMs

  } // END OF function reactReactorContinue

} // END OF object reactor
