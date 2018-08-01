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
  reactTimeSteps : 0,
  Trxr : 0,
  RateConst : 0,

  openThisLab : function() {

    let el = document.querySelector("#div_PLOTDIV_reactor_contents");
    el.style.top = "129px";
    el.style.height = "70px";
    el.style.backgroundColor = "rgb(0,0,255)";

    reactor.fInitialize();

  }, // END OF function openThisLab

  fInitialize : function() {

    // THESE GLOBAL VARS ARE DEFINED IN process_plot_info.js
    //   let numProfileVars = 2; // or other value
    //   let numProfilePts = 100; // or other value
    //   let profileData

    let x = 0;
    let k = 0;
    for (k=0; k<=numProfilePts; k+=1) {

      // x-axis values
      x = k/numProfilePts;
      profileData[0][k][0] = x;
      profileData[1][k][0] = x;

      // y-axis values
      //   reactant conc
      profileData[0][k][1] = -1; // -1 because want pts off plot at start
      //   product conc
      profileData[1][k][1] = -1;
    }

    reactor.fUpdatePlot();

  }, // END OF function initialize

  fUpdatePlot : function() {
    // GET AND PLOT ALL PLOTS defined in plotsObj in process_plot_info
    // plots are specified in object plotsObj in file process_plot_info.js
    let npl = Object.keys(plotsObj).length; // number of plots
    let p; // used as index
    let data;
    for (p = 0; p < npl; p += 1) {
      data = getPlotData(p);
      plotPlotData(data,p);
    }
  }, // END OF function fUpdatePlot

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
  }, // END OF function fChangeImage

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
    // this function will stop with an internal return above when full
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
    if (reactor.fillFlag == 1 || reactor.emptyFlag == 1 || reactor.reactFlag == 1) {
      // note check on reactFlag - don't activate this again while reacting
      return;
    }
    reactor.reactFlag = 1;
    reactor.updateRunCount();
    reactor.fInitialize();
    reactor.reactTimeSteps = 0;

    // y-axis values
    //   reactant conc
    profileData[0][0][1] = reactor.reactConc0;
    //   product conc
    profileData[1][0][1] = 0;

    reactor.fUpdatePlot();

    // get reactor T here at start - ignore user changes in middle of rxn
    let varInputID = 'input_field_Trxr';
    let varValue = 0; // reaction T in (K)
    let varMin = 300;
    let varMax = 340;
    let varInitial = 320;
    if (document.getElementById(varInputID)) {
      // the input exists so get the value and make sure it is within range
      varValue = document.getElementById(varInputID).value;
      varValue = Number(varValue); // force any number as string to numeric number
      if (isNaN(varValue)) {varValue = varInitial;} // handle e.g., 259x, xxx
      if (varValue < varMin) {varValue = varMin;}
      if (varValue > varMax) {varValue = varMax;}
      document.getElementById(varInputID).value = varValue;
    } else {
      // this 'else' is in case there is no input on the web page yet in order to
      // allow for independence and portability of this process unit
      varValue = varInitial;
    }
    // finish getting Trxr
    reactor.Trxr = varValue;

    // compute RateConst here only
    let Rg = 8.31446e-3; // (kJ/K/mol), ideal gas constant
    let Ea = 34; // (kJ/mol)
    let EaOverRg = Ea / Rg;
    let EaOverRg300 = EaOverRg / 300;
    let Kf300 = 0.15;
    reactor.RateConst = Kf300 * Math.exp(EaOverRg300 - EaOverRg/reactor.Trxr);
    
    // console.log('T = ' + reactor.Trxr + ', k = ' + reactor.RateConst);

    // ready to go to next step and react
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

    // // >>> BREAK OUT WHEN REACTION DONE
    // // *** OLD - when conc drops to low value ***
    // // put this before change reaction or get reaction change each onclick
    // if (reactor.reactConc/reactor.reactConc0 <= reactor.reactConcMIN) {
    //   reactor.fChangeImage("#image_reactor_mix_00");
    //   reactor.reactFlag = 0;
    //   return;
    // }

    // >>> BREAK OUT WHEN REACTION DONE
    // *** NEW - when reach number points in plot
    // put this before change reaction or get reaction change each onclick
    if (reactor.reactTimeSteps >= numProfilePts) {
      reactor.fChangeImage("#image_reactor_mix_00");
      reactor.reactFlag = 0;
      return;
    }

    // both two lines below work by themselves and don't require jquery
    let el = document.querySelector("#div_PLOTDIV_reactor_contents");
    // let el = document.getElementById("div_PLOTDIV_reactor_contents");

    // step reaction
    reactor.reactTimeSteps = reactor.reactTimeSteps + 1;
    let dt = 0.075;
    reactor.reactConc = reactor.reactConc - reactor.RateConst * reactor.reactConc * dt;

    // compute color for this reactConc
    let B = Math.round(255*reactor.reactConc/reactor.reactConc0); // Blue = reactant
    let R = 255 - B; // Red = product
    let colorString = "rgb(" + R + ", 0, " + B + ")";

    // set color for this reactConc
    el.style.backgroundColor = colorString; // backgroundColor NOT background-color

    // y-axis values
    //   reactant conc
    profileData[0][reactor.reactTimeSteps][1] = reactor.reactConc;
    //   product conc
    profileData[1][reactor.reactTimeSteps][1] = reactor.reactConc0 - reactor.reactConc;

    // UPDATE PLOT
    reactor.fUpdatePlot();

    // CONTINUE WITH CALL TO ITSELF AFTER updateMs WAIT
    let thisDate = new Date();
    let currentMs = thisDate.getTime();
    let elapsedMs = currentMs - startMs;
    let updateMs = reactor.updateDisplayTimingMs - elapsedMs;
    setTimeout(reactor.reactReactorContinue, updateMs);  // reactor.reactReactorContinue, updateMs

  } // END OF function reactReactorContinue

} // END OF object reactor
