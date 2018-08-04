/*
  Design, text, images and code by Richard K. Herz, 2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

let reactor = {

  updateDisplayTimingMs : 100,
  reactantConcInitial : 1,
  reactImgCounter : 0,
  reactTimeSteps : 0,
  Trxr : 0,
  RateConst : 0,
  currentImage: '', // set in fChangeImage()
  stateFlag : 1,

  // STATES, saved in stateFlag
  // 1 - full - allow start reaction or start empty
  // 2 - reacting - only allow continued reaction
  // 3 - reacted - only allow start emptying
  // 4 - emptying - only allow continued emptying
  // 5 - empty - only allow start filling
  // 6 - filling - only allow continued filling

  openThisLab : function() {

    let el = document.querySelector("#div_PLOTDIV_reactor_contents");
    el.style.top = "129px";
    el.style.height = "70px";
    el.style.backgroundColor = "rgb(0,0,255)";

    reactor.fInitializePlot();

  }, // END OF function openThisLab

  fInitializePlot : function() {

    // THESE GLOBAL VARS ARE DEFINED IN process_plot_info.js
    //   let numProfileVars = 2; // or other value
    //   let numProfilePts = 100; // or other value
    //   let profileData

    let x = 0;
    let k = 0;
    for (k=0; k<=numProfilePts; k+=1) {

      // x-axis values
      x = 100 * k/numProfilePts;
      profileData[0][k][0] = x;
      profileData[1][k][0] = x;

      // y-axis values
      //   reactant conc
      profileData[0][k][1] = -1; // -1 because want pts off plot at start
      //   product conc
      profileData[1][k][1] = -1;
    }

    reactor.fUpdatePlot();

  }, // END OF function fInitializePlot

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
    reactor.currentImage = imgName; // used during filling and emptying
  }, // END OF function fChangeImage

  fillReactor : function() {

    // console.log('at fillReactor, stateFlag = ' + reactor.stateFlag);

    if (reactor.stateFlag !=5 && reactor.stateFlag !=6) {
      // console.log('in fillReactor, if (reactor.stateFlag !=5 && reactor.stateFlag !=6) is true, returning');
      return;
    }
    reactor.stateFlag = 6;

    // get time at start of repeating fillReactor
    startDate = new Date(); // need this here
    startMs = startDate.getTime();

    if (reactor.currentImage != "#image_reactor_fill") {
      reactor.fChangeImage("#image_reactor_fill");
    }

    // put this before change height & color or change each onclick
    // both two lines below work by themselves and don't require jquery
    let el = document.querySelector("#div_PLOTDIV_reactor_contents");
    // let el = document.getElementById("div_PLOTDIV_reactor_contents");
    // get current top and height
    let top = parseFloat(el.style.top); // convert, e.g., "100px" to 100
    let height = parseFloat(el.style.height); // convert, e.g., "100px" to 100
    // return if already full
    if (height >= 70) {
      reactor.stateFlag = 1;
      reactor.fChangeImage("#image_reactor_mix_00");
      // console.log('in fillReactor, if (height >= 70) is true, returning');
      return;
    }

    // reset reactantConc
    reactor.reactantConc = reactor.reactantConcInitial;

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

    // console.log('at emptyReactor, stateFlag = ' + reactor.stateFlag);

    if (reactor.stateFlag == 1 || reactor.stateFlag == 3 || reactor.stateFlag == 4) {
      // console.log('in emptyReactor, if (reactor.stateFlag == 1 or 3 or 4 is true, continue');
      // OK to start emptying, continue
    } else {
      // console.log('in emptyReactor, if (reactor.stateFlag == 1 or 3 or 4 NOT true, returning');
      // not OK to start emptying
      return;
    }
    reactor.stateFlag = 4;

    // console.log('in emptyReactor, reactor.stateFlag (4?) = ' + reactor.stateFlag);

    // get time at start of repeating emptyReactor
    startDate = new Date(); // need this here
    startMs = startDate.getTime();

    if (reactor.currentImage != "#image_reactor_empty") {
      reactor.fChangeImage("#image_reactor_empty");
    }

    // both two lines below work by themselves and don't require jquery
    let el = document.querySelector("#div_PLOTDIV_reactor_contents");
    // let el = document.getElementById("div_PLOTDIV_reactor_contents");
    let top = parseFloat(el.style.top); // convert, e.g., "100px" to 100
    let height = parseFloat(el.style.height); // convert, e.g., "100px" to 100

    // put this before change height or get height change each onclick
    if (height > 2) {
      // console.log('in emptyReactor, if (height > 2) is true');
    } else {
      // console.log('in emptyReactor, if (height > 2) is NOT true');
      // reactor full, set flag to allow reaction
      reactor.stateFlag = 5;
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

  fGetTrxr : function() {
    let varInputID = 'input_field_Trxr';
    if (reactor.stateFlag == 2) {
      // don't allow changes while reacting
      // replace to old (current) value
      document.getElementById(varInputID).value = reactor.Trxr;
      return;
    }
    let varValueOLD = reactor.Trxr; // so don't clear plot below if same value
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

    if (varValue == varValueOLD) {
      // keep plot
    } else {
      reactor.fInitializePlot();
    }
    // only return value here, do not set to Trxr
    // in case called when not to be used
    // onclick in input field calls this and want input validation but don't change Trxr
    // return and use when this function called at start of reaction
    return(varValue);
  },

  updateRunCount : function() {
    $.post("http://reactorlab.net/web_labs/webAppRunLog.lc", {webAppNumber: "home_reactor"});
  },

  reactReactor : function() {

    // console.log('at reactReactor, reactor.stateFlag = ' + reactor.stateFlag);

    if (reactor.stateFlag != 1) {
      // console.log('at reactReactor, if (reactor.stateFlag != 1) is true, returning');
      return;
    }
    // set stateFlag ONLY AFTER get Trxr from input field
    // AND AFTER initialize
    // only get reactor T here at start
    // ignore user changes in middle of rxn
    reactor.Trxr = reactor.fGetTrxr();
    reactor.fInitializePlot();

    reactor.stateFlag = 2;
    reactor.reactantConc = reactor.reactantConcInitial;
    reactor.reactTimeSteps = 0;
    reactor.updateRunCount();

    // y-axis values
    //   reactant conc
    profileData[0][0][1] = reactor.reactantConc;
    //   product conc
    profileData[1][0][1] = 0;

    reactor.fUpdatePlot();

    // compute RateConst here only
    let Rg = 8.31446e-3; // (kJ/K/mol), ideal gas constant
    let Ea = 34; // (kJ/mol)
    let EaOverRg = Ea / Rg;
    let EaOverRg300 = EaOverRg / 300;
    let Kf300 = 0.15;
    reactor.RateConst = Kf300 * Math.exp(EaOverRg300 - EaOverRg/reactor.Trxr);

    // ready to go to next step and react
    reactor.reactReactorContinue();
  },

  reactReactorContinue : function() {

    // console.log('at reactReactorContinue, stateFlag = ' + reactor.stateFlag);

    if (reactor.stateFlag != 2) {
      // console.log('in reactReactorContinue, if (reactor.stateFlag != 2) is true, returning');
      return;
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
    // *** NEW - when reach number points in plot
    // put this before change reaction or get reaction change each onclick
    if (reactor.reactTimeSteps >= numProfilePts) {
      reactor.fChangeImage("#image_reactor_mix_00");
      reactor.stateFlag = 3;
      // console.log('in reactReactorContinue, if (reactor.reactTimeSteps >= numProfilePts) is true, returning');
      return;
    }

    // console.log('in reactReactorContinue, reactor.reactTimeSteps = ' + reactor.reactTimeSteps);

    // both two lines below work by themselves and don't require jquery
    let el = document.querySelector("#div_PLOTDIV_reactor_contents");
    // let el = document.getElementById("div_PLOTDIV_reactor_contents");

    // step reaction
    reactor.reactTimeSteps = reactor.reactTimeSteps + 1;
    let dt = 0.075;
    reactor.reactantConc = reactor.reactantConc - reactor.RateConst * reactor.reactantConc * dt;

    // console.log('in reactReactorContinue, reactor.RateConst = ' + reactor.RateConst);
    // console.log('in reactReactorContinue, reactor.reactantConc = ' + reactor.reactantConc);

    // compute color for this reactantConc
    let B = Math.round(255*reactor.reactantConc/reactor.reactantConcInitial); // Blue = reactant
    let R = 255 - B; // Red = product
    let colorString = "rgb(" + R + ", 0, " + B + ")";

    // set color for this reactantConc
    el.style.backgroundColor = colorString; // backgroundColor NOT background-color

    // y-axis values
    //   reactant conc
    profileData[0][reactor.reactTimeSteps][1] = reactor.reactantConc;
    //   product conc
    profileData[1][reactor.reactTimeSteps][1] = reactor.reactantConcInitial - reactor.reactantConc;

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
