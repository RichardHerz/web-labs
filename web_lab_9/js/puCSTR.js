function puCSTR(pUnitIndex) {
  // constructor function for CSTR process units

  this.unitIndex = pUnitIndex; // index of this unit as child in processUnits parent object
  // unitIndex used in this object's updateUIparams() method
  this.name = 'process unit CSTR constructor';

  // SUMMARY OF DEPENDENCIES

  // INPUT CONNECTIONS TO THIS UNIT FROM OTHER UNITS, used in updateInputs() method
  this.getInputs = function() {
    let inputs = [];
    // *** e.g., inputs[0] = processUnits[1]['Tcold'][0]; // HX T cold out = RXR Tin
    inputs[0] = processUnits[this.unitIndex - 1]['conc'];
    inputs[1] = processUnits[0]['conc']; // feed conc
    return inputs;
  }

  // define arrays to hold data for plots, color canvas
  // these will be filled with initial values in method reset()
  profileData = []; // for profile plots, plot script requires this name
  stripData = []; // for strip chart plots, plot script requires this name

  // // INPUT CONNECTIONS TO THIS UNIT FROM HTML UI CONTROLS...
  // // SEE dataInputs array in initialize() method for input field ID's
  //
  // // DISPLAY CONNECTIONS FROM THIS UNIT TO HTML UI CONTROLS, used in updateDisplay() method
  // // *** e.g., displayReactorLeftConc: 'field_reactor_left_conc',
  //
  // // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***
  // // ***   EXCEPT TO HTML ID'S IN method initialize(), array dataInputs    ***
  //
  // // define main inputs
  // // values will be set in method intialize()
  // // *** e.g., Kf300 : 0, // forward rate coefficient value at 300 K
  //
  // // define arrays to hold info for variables
  // // these will be filled with values in method initialize()
  // dataHeaders : [], // variable names
  // dataInputs : [], // input field ID's
  // dataUnits : [],
  // dataMin : [],
  // dataMax : [],
  // dataInitial : [],
  // dataValues : [],
  //
  // // define arrays to hold output variables
  // // these will be filled with initial values in method reset()
  // // *** e.g., Trxr : [],
  //
  // // define arrays to hold data for plots, color canvas
  // // these will be filled with initial values in method reset()
  // profileData : [], // for profile plots, plot script requires this name
  // stripData : [], // for strip chart plots, plot script requires this name
  // colorCanvasData : [], // for color canvas plots, plot script requires this name

  // allow this unit to take more than one step within one main loop step in updateState method
  this.unitStepRepeats = 1;
  this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

  // define variables which will not be plotted nor saved in copy data table
  this.feed = 0; // feed to first reactor
  this.concIn = 0; // conc entering this reactor
  this.conc = 0; // conc inside this reactor
  this.conversion = 0;
  this.rxnRate = 0;
  // rateBranchOLD = 1 for high, 0 for low
  this.rateBranchOLD = 1;

  this.ssCheckSum = 0; // used to check for steady state
  this.residenceTime = 100; // for timing checks for steady state check
  // residenceTime is set in this unit's updateUIparams()

  // rateHIGH is high branch of reaction rate from Reactor Lab Web Labs, lab 2, rxn-diff
  // at default conditions when entering lab (as positive numbers until returned by getRxnRate)
  // where these conc are the gas conc in the reactor mixing cell over the catalyst layer (not feed)
  // rateHIGH has 637 elements at 0.001 conc resolution from 0.000 through 0.636
  // used in getRxnRate() method below
  this.rateHIGH = [0,2.0668e-05,4.1335e-05,6.2003e-05,8.267e-05,0.00010135,0.00012003,0.00013872,0.0001574,0.00016758,0.00017776,0.00018795,0.00019813,0.00020831,0.00021849,0.00022868,0.00023886,0.00024904,0.00025922,0.00026941,0.00027959,0.00028977,0.00029995,0.00031014,0.00032032,0.0003305,0.0003362,0.0003419,0.0003476,0.0003533,0.000359,0.0003647,0.0003704,0.0003761,0.0003818,0.0003875,0.0003932,0.0003989,0.0004046,0.0004103,0.00041385,0.00041741,0.00042096,0.00042452,0.00042807,0.00043162,0.00043518,0.00043873,0.00044229,0.00044584,0.0004494,0.00045295,0.0004565,0.00046006,0.00046361,0.00046717,0.00047072,0.00047428,0.00047783,0.00048138,0.00048494,0.00048849,0.00049205,0.0004956,0.000498,0.00050041,0.00050281,0.00050522,0.00050762,0.00051002,0.00051243,0.00051483,0.00051724,0.00051964,0.00052204,0.00052445,0.00052685,0.00052926,0.00053166,0.00053406,0.00053647,0.00053887,0.00054128,0.00054368,0.00054608,0.00054849,0.00055089,0.0005533,0.0005557,0.00055743,0.00055917,0.0005609,0.00056263,0.00056437,0.0005661,0.00056783,0.00056957,0.0005713,0.00057303,0.00057477,0.0005765,0.00057823,0.00057997,0.0005817,0.00058343,0.00058517,0.0005869,0.00058837,0.00058983,0.0005913,0.00059277,0.00059423,0.0005957,0.00059717,0.00059863,0.0006001,0.00060157,0.00060303,0.0006045,0.00060597,0.00060743,0.0006089,0.00061037,0.00061183,0.0006133,0.00061447,0.00061565,0.00061682,0.000618,0.00061918,0.00062035,0.00062153,0.0006227,0.00062387,0.00062505,0.00062623,0.0006274,0.00062858,0.00062975,0.00063093,0.0006321,0.00063327,0.00063445,0.00063563,0.0006368,0.00063797,0.00063915,0.00064032,0.0006415,0.00064267,0.00064385,0.00064503,0.0006462,0.00064713,0.00064806,0.00064898,0.00064991,0.00065084,0.00065177,0.0006527,0.00065363,0.00065455,0.00065548,0.00065641,0.00065734,0.00065827,0.0006592,0.00066012,0.00066105,0.00066198,0.00066291,0.00066384,0.00066477,0.00066569,0.00066662,0.00066755,0.00066848,0.00066941,0.00067033,0.00067126,0.00067219,0.00067312,0.00067405,0.00067498,0.0006759,0.00067683,0.00067776,0.00067869,0.00067962,0.00068055,0.00068147,0.0006824,0.00068333,0.00068426,0.00068519,0.00068612,0.00068704,0.00068797,0.0006889,0.00068959,0.00069027,0.00069096,0.00069164,0.00069233,0.00069301,0.0006937,0.00069438,0.00069507,0.00069575,0.00069644,0.00069713,0.00069781,0.0006985,0.00069918,0.00069987,0.00070055,0.00070124,0.00070192,0.00070261,0.00070329,0.00070398,0.00070466,0.00070535,0.00070604,0.00070672,0.00070741,0.00070809,0.00070878,0.00070946,0.00071015,0.00071083,0.00071152,0.0007122,0.00071289,0.00071358,0.00071426,0.00071495,0.00071563,0.00071632,0.000717,0.00071769,0.00071837,0.00071906,0.00071974,0.00072043,0.00072111,0.0007218,0.00072235,0.00072291,0.00072346,0.00072402,0.00072457,0.00072512,0.00072568,0.00072623,0.00072679,0.00072734,0.0007279,0.00072845,0.000729,0.00072956,0.00073011,0.00073067,0.00073122,0.00073177,0.00073233,0.00073288,0.00073344,0.00073399,0.00073455,0.0007351,0.00073565,0.00073621,0.00073676,0.00073732,0.00073787,0.00073843,0.00073898,0.00073953,0.00074009,0.00074064,0.0007412,0.00074175,0.0007423,0.00074286,0.00074341,0.00074397,0.00074452,0.00074507,0.00074563,0.00074618,0.00074674,0.00074729,0.00074785,0.0007484,0.00074886,0.00074933,0.00074979,0.00075025,0.00075071,0.00075117,0.00075164,0.0007521,0.00075256,0.00075302,0.00075349,0.00075395,0.00075441,0.00075488,0.00075534,0.0007558,0.00075626,0.00075672,0.00075719,0.00075765,0.00075811,0.00075857,0.00075904,0.0007595,0.00075996,0.00076043,0.00076089,0.00076135,0.00076181,0.00076227,0.00076274,0.0007632,0.00076366,0.00076412,0.00076459,0.00076505,0.00076551,0.00076597,0.00076644,0.0007669,0.00076736,0.00076782,0.00076829,0.00076875,0.00076921,0.00076967,0.00077014,0.0007706,0.00077099,0.00077138,0.00077176,0.00077215,0.00077254,0.00077293,0.00077331,0.0007737,0.00077409,0.00077448,0.00077487,0.00077525,0.00077564,0.00077603,0.00077642,0.0007768,0.00077719,0.00077758,0.00077797,0.00077836,0.00077874,0.00077913,0.00077952,0.00077991,0.00078029,0.00078068,0.00078107,0.00078146,0.00078184,0.00078223,0.00078262,0.00078301,0.0007834,0.00078378,0.00078417,0.00078456,0.00078495,0.00078533,0.00078572,0.00078611,0.0007865,0.00078689,0.00078727,0.00078766,0.00078805,0.00078844,0.00078882,0.00078921,0.0007896,0.00078994,0.00079027,0.00079061,0.00079095,0.00079128,0.00079162,0.00079196,0.00079229,0.00079263,0.00079297,0.0007933,0.00079364,0.00079398,0.00079431,0.00079465,0.00079499,0.00079532,0.00079566,0.000796,0.00079633,0.00079667,0.00079701,0.00079734,0.00079768,0.00079802,0.00079836,0.00079869,0.00079903,0.00079937,0.0007997,0.00080004,0.00080038,0.00080071,0.00080105,0.00080139,0.00080172,0.00080206,0.0008024,0.00080273,0.00080307,0.00080341,0.00080374,0.00080408,0.00080442,0.00080475,0.00080509,0.00080543,0.00080576,0.0008061,0.0008064,0.0008067,0.00080701,0.00080731,0.00080761,0.00080791,0.00080821,0.00080852,0.00080882,0.00080912,0.00080942,0.00080973,0.00081003,0.00081033,0.00081063,0.00081093,0.00081124,0.00081154,0.00081184,0.00081214,0.00081244,0.00081275,0.00081305,0.00081335,0.00081365,0.00081395,0.00081426,0.00081456,0.00081486,0.00081516,0.00081546,0.00081577,0.00081607,0.00081637,0.00081667,0.00081697,0.00081728,0.00081758,0.00081788,0.00081818,0.00081849,0.00081879,0.00081909,0.00081939,0.00081969,0.00082,0.0008203,0.0008206,0.00082087,0.00082113,0.0008214,0.00082167,0.00082194,0.0008222,0.00082247,0.00082274,0.00082301,0.00082327,0.00082354,0.00082381,0.00082408,0.00082434,0.00082461,0.00082488,0.00082514,0.00082541,0.00082568,0.00082595,0.00082621,0.00082648,0.00082675,0.00082702,0.00082728,0.00082755,0.00082782,0.00082809,0.00082835,0.00082862,0.00082889,0.00082916,0.00082942,0.00082969,0.00082996,0.00083022,0.00083049,0.00083076,0.00083103,0.00083129,0.00083156,0.00083183,0.0008321,0.00083236,0.00083263,0.0008329,0.00083317,0.00083343,0.0008337,0.00083393,0.00083417,0.0008344,0.00083464,0.00083487,0.0008351,0.00083534,0.00083557,0.00083581,0.00083604,0.00083627,0.00083651,0.00083674,0.00083698,0.00083721,0.00083744,0.00083768,0.00083791,0.00083815,0.00083838,0.00083861,0.00083885,0.00083908,0.00083932,0.00083955,0.00083978,0.00084002,0.00084025,0.00084049,0.00084072,0.00084095,0.00084119,0.00084142,0.00084166,0.00084189,0.00084212,0.00084236,0.00084259,0.00084283,0.00084306,0.00084329,0.00084353,0.00084376,0.000844,0.00084423,0.00084446,0.0008447,0.00084493,0.00084517,0.0008454,0.00084562,0.00084584,0.00084606,0.00084628,0.00084651,0.00084673,0.00084695,0.00084717,0.00084739,0.00084761,0.00084783,0.00084805,0.00084827,0.00084849,0.00084872,0.00084894,0.00084916,0.00084938,0.0008496,0.00084975,0.00084991,0.00085007,0.00085022,0.00085038,0.00085053,0.00085069,0.00085084,0.000851,0.00085115,0.00085131,0.00085146,0.00085162,0.00085177,0.00085193,0.00085208,0.00085224,0.00085239,0.00085255,0.0008527,0.00085261,0.00085252,0.00085243,0.00085234,0.00085225,0.00085216,0.00085207,0.00085198,0.00085189,0.0008518];

  // rateLOW is low branch of reaction rate from Reactor Lab Web Labs, lab 2, rxn-diff
  // at default conditions when entering lab (as positive numbers until returned by getRxnRate)
  // where these conc are the gas conc in the reactor mixing cell over the catalyst layer (not feed)
  // rateLOW has 662 elements at 0.001 conc resolution from 0.431 through 1.092
  // used in getRxnRate() method below
  this.rateLOW = [0.0003826,0.00037988,0.00037717,0.00037445,0.00037174,0.00036902,0.00036631,0.00036359,0.00036088,0.00035816,0.00035545,0.00035273,0.00035002,0.0003473,0.00034549,0.00034368,0.00034188,0.00034007,0.00033826,0.00033645,0.00033464,0.00033283,0.00033102,0.00032922,0.00032741,0.0003256,0.00032408,0.00032256,0.00032105,0.00031953,0.00031801,0.00031649,0.00031497,0.00031345,0.00031194,0.00031042,0.0003089,0.00030766,0.00030643,0.00030519,0.00030395,0.00030272,0.00030148,0.00030025,0.00029901,0.00029777,0.00029654,0.0002953,0.00029432,0.00029334,0.00029237,0.00029139,0.00029041,0.00028943,0.00028845,0.00028748,0.0002865,0.00028552,0.00028454,0.00028356,0.00028258,0.00028161,0.00028063,0.00027965,0.00027867,0.00027769,0.00027672,0.00027574,0.00027476,0.00027378,0.0002728,0.00027183,0.00027085,0.00026987,0.00026889,0.00026791,0.00026693,0.00026596,0.00026498,0.000264,0.00026324,0.00026249,0.00026173,0.00026097,0.00026021,0.00025946,0.0002587,0.00025794,0.00025719,0.00025643,0.00025567,0.00025491,0.00025416,0.0002534,0.00025264,0.00025189,0.00025113,0.00025037,0.00024961,0.00024886,0.0002481,0.00024752,0.00024695,0.00024637,0.0002458,0.00024522,0.00024465,0.00024407,0.0002435,0.00024292,0.00024235,0.00024177,0.00024119,0.00024062,0.00024004,0.00023947,0.00023889,0.00023832,0.00023774,0.00023717,0.00023659,0.00023602,0.00023544,0.00023486,0.00023429,0.00023371,0.00023314,0.00023256,0.00023199,0.00023141,0.00023084,0.00023026,0.00022968,0.00022911,0.00022853,0.00022796,0.00022738,0.00022681,0.00022623,0.00022566,0.00022508,0.00022451,0.00022393,0.00022335,0.00022278,0.0002222,0.00022163,0.00022105,0.00022048,0.0002199,0.00021933,0.00021875,0.00021818,0.0002176,0.00021716,0.00021672,0.00021628,0.00021584,0.0002154,0.00021496,0.00021453,0.00021409,0.00021365,0.00021321,0.00021277,0.00021233,0.00021189,0.00021145,0.00021101,0.00021057,0.00021013,0.00020969,0.00020925,0.00020882,0.00020838,0.00020794,0.0002075,0.00020706,0.00020662,0.00020618,0.00020574,0.0002053,0.00020486,0.00020442,0.00020398,0.00020355,0.00020311,0.00020267,0.00020223,0.00020179,0.00020135,0.00020091,0.00020047,0.00020003,0.00019959,0.00019915,0.00019871,0.00019827,0.00019784,0.0001974,0.00019696,0.00019652,0.00019608,0.00019564,0.0001952,0.00019486,0.00019452,0.00019418,0.00019385,0.00019351,0.00019317,0.00019283,0.00019249,0.00019215,0.00019182,0.00019148,0.00019114,0.0001908,0.00019046,0.00019012,0.00018978,0.00018945,0.00018911,0.00018877,0.00018843,0.00018809,0.00018775,0.00018742,0.00018708,0.00018674,0.0001864,0.00018606,0.00018572,0.00018538,0.00018505,0.00018471,0.00018437,0.00018403,0.00018369,0.00018335,0.00018302,0.00018268,0.00018234,0.000182,0.00018166,0.00018132,0.00018098,0.00018065,0.00018031,0.00017997,0.00017963,0.00017929,0.00017895,0.00017862,0.00017828,0.00017794,0.0001776,0.00017732,0.00017704,0.00017676,0.00017648,0.0001762,0.00017592,0.00017564,0.00017536,0.00017508,0.0001748,0.00017452,0.00017424,0.00017395,0.00017367,0.00017339,0.00017311,0.00017283,0.00017255,0.00017227,0.00017199,0.00017171,0.00017143,0.00017115,0.00017087,0.00017059,0.00017031,0.00017003,0.00016975,0.00016947,0.00016919,0.00016891,0.00016863,0.00016835,0.00016807,0.00016779,0.00016751,0.00016723,0.00016695,0.00016666,0.00016638,0.0001661,0.00016582,0.00016554,0.00016526,0.00016498,0.0001647,0.00016442,0.00016414,0.00016386,0.00016358,0.0001633,0.00016307,0.00016283,0.0001626,0.00016237,0.00016213,0.0001619,0.00016167,0.00016143,0.0001612,0.00016097,0.00016073,0.0001605,0.00016027,0.00016003,0.0001598,0.00015957,0.00015933,0.0001591,0.00015887,0.00015863,0.0001584,0.00015817,0.00015793,0.0001577,0.00015747,0.00015723,0.000157,0.00015677,0.00015653,0.0001563,0.00015607,0.00015583,0.0001556,0.00015537,0.00015513,0.0001549,0.00015467,0.00015443,0.0001542,0.00015397,0.00015373,0.0001535,0.00015327,0.00015303,0.0001528,0.00015257,0.00015233,0.0001521,0.00015187,0.00015163,0.0001514,0.0001512,0.00015099,0.00015079,0.00015058,0.00015038,0.00015018,0.00014997,0.00014977,0.00014956,0.00014936,0.00014916,0.00014895,0.00014875,0.00014854,0.00014834,0.00014814,0.00014793,0.00014773,0.00014752,0.00014732,0.00014712,0.00014691,0.00014671,0.0001465,0.0001463,0.0001461,0.00014589,0.00014569,0.00014548,0.00014528,0.00014508,0.00014487,0.00014467,0.00014446,0.00014426,0.00014406,0.00014385,0.00014365,0.00014344,0.00014324,0.00014304,0.00014283,0.00014263,0.00014242,0.00014222,0.00014202,0.00014181,0.00014161,0.0001414,0.0001412,0.00014103,0.00014085,0.00014068,0.00014051,0.00014034,0.00014016,0.00013999,0.00013982,0.00013965,0.00013947,0.0001393,0.00013913,0.00013896,0.00013878,0.00013861,0.00013844,0.00013827,0.00013809,0.00013792,0.00013775,0.00013758,0.0001374,0.00013723,0.00013706,0.00013689,0.00013671,0.00013654,0.00013637,0.0001362,0.00013602,0.00013585,0.00013568,0.00013551,0.00013533,0.00013516,0.00013499,0.00013482,0.00013464,0.00013447,0.0001343,0.00013413,0.00013395,0.00013378,0.00013361,0.00013344,0.00013326,0.00013309,0.00013292,0.00013275,0.00013257,0.0001324,0.00013225,0.0001321,0.00013195,0.0001318,0.00013165,0.00013149,0.00013134,0.00013119,0.00013104,0.00013089,0.00013074,0.00013059,0.00013044,0.00013029,0.00013014,0.00012998,0.00012983,0.00012968,0.00012953,0.00012938,0.00012923,0.00012908,0.00012893,0.00012878,0.00012863,0.00012847,0.00012832,0.00012817,0.00012802,0.00012787,0.00012772,0.00012757,0.00012742,0.00012727,0.00012712,0.00012696,0.00012681,0.00012666,0.00012651,0.00012636,0.00012621,0.00012606,0.00012591,0.00012576,0.00012561,0.00012545,0.0001253,0.00012515,0.000125,0.00012485,0.0001247,0.00012456,0.00012443,0.00012429,0.00012416,0.00012402,0.00012388,0.00012375,0.00012361,0.00012348,0.00012334,0.0001232,0.00012307,0.00012293,0.0001228,0.00012266,0.00012252,0.00012239,0.00012225,0.00012212,0.00012198,0.00012184,0.00012171,0.00012157,0.00012144,0.0001213,0.00012116,0.00012103,0.00012089,0.00012076,0.00012062,0.00012048,0.00012035,0.00012021,0.00012008,0.00011994,0.0001198,0.00011967,0.00011953,0.0001194,0.00011926,0.00011912,0.00011899,0.00011885,0.00011872,0.00011858,0.00011844,0.00011831,0.00011817,0.00011804,0.0001179,0.00011778,0.00011766,0.00011755,0.00011743,0.00011731,0.00011719,0.00011708,0.00011696,0.00011684,0.00011672,0.00011661,0.00011649,0.00011637,0.00011625,0.00011614,0.00011602,0.0001159,0.00011578,0.00011566,0.00011555,0.00011543,0.00011531,0.00011519,0.00011508,0.00011496,0.00011484,0.00011472,0.00011461,0.00011449,0.00011437,0.00011425,0.00011414,0.00011402,0.0001139,0.00011378,0.00011366,0.00011355,0.00011343,0.00011331,0.00011319,0.00011308,0.00011296,0.00011284,0.00011272,0.00011261,0.00011249,0.00011237,0.00011225,0.00011214,0.00011202,0.0001119,0.00011179,0.00011168,0.00011157,0.00011146,0.00011135,0.00011124,0.00011113,0.00011102,0.00011091,0.0001108,0.00011069,0.00011058,0.00011047,0.00011036,0.00011025,0.00011014,0.00011003,0.00010992,0.00010981,0.0001097,0.00010959,0.00010948,0.00010937,0.00010926,0.00010915,0.00010904,0.00010893,0.00010882,0.00010871,0.0001086,0.00010849,0.00010838,0.00010827,0.00010816,0.00010805,0.00010794,0.00010783,0.00010772,0.00010761,0.0001075,0.00010739,0.00010728,0.00010717,0.00010706,0.00010695,0.00010684,0.00010673,0.00010662,0.00010651,0.0001064];

  this.getRxnRate = function(conc) {
    // getRxnRate provides rate of formation of reactant per arbitrary mass
    //    catalyst from Reactor Lab Web Labs, lab 2, reaction-diffusion
    // USES this.rateBranchOLD, this.rateLOW, this.rateHIGH
    // convert from conc 0-1 to c = 0 to 100
    //    for use of c in array indexes
    // return rate as negative value for reactant conversion

    // for 0.001 conc resolution
    let c = Math.round(1000*conc); // 0 to 100
    if (c < 0) {
      c = 0;
    } else if (c > 1000) {
      c = 1000;
    }

    // determine rate branch, high vs. low
    let rate = 0;
    let cLowBreak = 431; // for 0.001 conc resolution
    let cHighBreak = 636; // for 0.001 conc resolution
    // first do easy decisions
    if (c < cLowBreak) {
      // on high branch
      rate = this.rateHIGH[c];
      this.rateBranchOLD = 1; // 0 is low branch, 1 is high branch
    } else if (c > cHighBreak) {
      // on low branch
      rate = this.rateLOW[c-cLowBreak];
      this.rateBranchOLD = 0;
    } else if (this.rateBranchOLD == 0) {
      // in middle range and last on low branch, so still on low branch
      // on low branch
      rate = this.rateLOW[c-cLowBreak];
      this.rateBranchOLD = 0;
    } else if (this.rateBranchOLD == 1) {
      // in middle range and last on high branch, so still on high rateBranch
      rate = this.rateHIGH[c];
      this.rateBranchOLD = 1;
    } else {
      // should not get here
      rate = 0.0;
      this.rateBranchOLD = 1;
    }

    // console.log('getRxnRate, unit = ' + this.unitIndex + ', c = ' + c + ', rate = ' + rate + ', branch = ' + this.rateBranchOLD);
    // return rate as negative value for reactant conversion
    return -rate;
  } // END getRxnRate() method

  this.initialize = function() {
    //
    // let v = 0;
    // this.dataHeaders[v] = 'Kf300';
    // this.dataInputs[v] = 'input_field_Kf300';
    // this.dataUnits[v] = 'm3/kg/s';
    // this.dataMin[v] = 0;
    // this.dataMax[v] = 1;
    // this.dataInitial[v] = 1.0e-7;
    // this.Kf300 = this.dataInitial[v]; // dataInitial used in getInputValue()
    // this.dataValues[v] = this.Kf300; // current input value for reporting
    //
    // END OF INPUT VARS
    // record number of input variables, VarCount
    // used, e.g., in copy data to table
    //
    // *** use v-1 here since TinHX only used to initialize & reset plots

    // to use this prob have to define this.VarCount above this function first...
    // this.VarCount = v-1;

    // OUTPUT VARS
    //
    // v = 7;
    // this.dataHeaders[v] = 'Trxr';
    // this.dataUnits[v] =  'K';
    // // Trxr dataMin & dataMax can be changed in updateUIparams()
    // this.dataMin[v] = 200;
    // this.dataMax[v] = 500;
    //

  } // END initialize method

  // *** NO LITERAL REFERENCES TO OTHER UNITS OR HTML ID'S BELOW THIS LINE ***

  this.reset = function() {
    //
    // On 1st load or reload page, the html file fills the fields with html file
    // values and calls reset, which needs updateUIparams to get values in fields.
    // On click reset button but not reload page, unless do something else here,
    // reset function will use whatever last values user has entered.

    this.updateUIparams(); // this first, then set other values as needed

    // set state variables not set by updateUIparams() to initial settings

    // need to directly set controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.ssFlag = false;

    // set to zero ssCheckSum used to check for steady state by this unit
    this.ssCheckSum = 0;

    this.conc = 0;
    this.conversion = 0;

    // each unit has its own data arrays for plots and canvases

    // initialize strip chart data array
    // initPlotData(numStripVars,numStripPts)
    let numStripVars = 2; // conc, conversion
    let numStripPts = plotInfo[0]['numberPoints'];
    this.stripData = plotter.initPlotData(numStripVars,numStripPts);

    // initialize profile data array
    // initPlotData(numProfileVars,numProfilePts)
    // SPECIAL CASE - this will be points vs. feed conc so do not fill points
    let numProfileVars = 2; // conversion, rate
    let numProfilePts = 0; // 0+1 points will be filled here
    this.profileData = plotter.initPlotData(numProfileVars,numProfilePts);
    // SPECIAL CASE - move initial [0,0] x,y points of plots
    this.profileData[0] = [-1,-1];
    this.profileData[1] = [-1,-1];
    // console.log('this.profileData[0] = ' + this.profileData[0]);

    // update display
    this.updateDisplay();

  } // end reset

  this.updateUIparams = function() {
    //
    // GET INPUT PARAMETER VALUES FROM HTML UI CONTROLS
    // SPECIFY REFERENCES TO HTML UI COMPONENTS ABOVE in this unit definition

    // need to directly set controller.ssFlag to false to get sim to run
    // after change in UI params when previously at steady state
    controller.ssFlag = false;

    // set to zero ssCheckSum used to check for steady state by this unit
    this.ssCheckSum = 0;

    // check input fields for new values
    // function getInputValue() is defined in file process_interface.js
    // getInputValue(unit index in processUnits, let index in input arrays)
    // see variable numbers above in initialize()
    // note: this.dataValues.[pVar]
    //   is only used in copyData() to report input values
    //
    let unum = this.unitIndex;
    //
    // *** e.g., this.Kf300 = this.dataValues[0] = interface.getInputValue(unum, 0);

  } // END of updateUIparams()

  this.updateInputs = function() {
    //
    // GET INPUT CONNECTION VALUES FROM OTHER UNITS FROM PREVIOUS TIME STEP,
    //   SINCE updateInputs IS CALLED BEFORE updateState IN EACH TIME STEP
    // SPECIFY REFERENCES TO INPUTS ABOVE in this unit definition

    // check for change in overall main time step simTimeStep
    this.unitTimeStep = simParams.simTimeStep / this.unitStepRepeats;

    // get array of current input values to this unit from other units
    let inputs = this.getInputs();
    this.concIn = inputs[0]; // conc from upstream CSTR
    this.feed = inputs[1]; // feed to first CSTR

    // console.log('updateInputs, CSTR = ' + this.unitIndex + ', concIn = ' + this.concIn);

  } // END of updateInputs()

  this.updateState = function() {
    //
    // BEFORE REPLACING PREVIOUS STATE VARIABLE VALUE WITH NEW VALUE, MAKE
    // SURE THAT VARIABLE IS NOT ALSO USED TO UPDATE ANOTHER STATE VARIABLE HERE -
    // IF IT IS, MAKE SURE PREVIOUS VALUE IS USED TO UPDATE THE OTHER
    // STATE VARIABLE
    //
    // WARNING: this method must NOT contain references to other units!
    //          get info from other units ONLY in updateInputs() method

    let flowrate = 1;
    let volume = 100;
    // rateMultiplier multiplies rate from getRxnRate below
    // getRxnRate provides rate of formation of reactant per arbitrary mass
    //    catalyst from Reactor Lab Web Labs, lab 2, reaction-diffusion
    let rateMultiplier = 2;

    // this unit may take multiple steps within one outer main loop repeat step
    for (let i = 0; i < this.unitStepRepeats; i += 1) {
      let conc = this.conc;
      this.rxnRate = rateMultiplier * this.getRxnRate(conc);
      // console.log('updateState, unit = ' + this.unitIndex + ', conc = ' + conc + ', rxnRate = ' + rxnRate + ', branch = ' + this.rateBranchOLD);
      let dcdt = flowrate/volume * (this.concIn - conc) + this.rxnRate;
      // console.log('updateState, unit = ' + this.unitIndex + ', dcdt = ' + dcdt);
      let newConc = conc + dcdt * this.unitTimeStep;

      // // for 0.01 conc increment
      // // round toFixed(3) to get ss check to work at low conc, since currently
      // // only define rate at 0.01 steps of conc and conc oscillates at
      // // small conc (consider change to finer resolution or continuous function)
      // // but when lower input to near zero input, min conc in rxrs is 0.0040 with
      // // current input, which shows in checksum as 40, because dcdt each step
      // // then too small to change conc at 3rd position to right decimal point
      // // so be careful when computing conversion after lower to zero input...
      // let newConcStr = newConc.toFixed(3); // toFixed returns string
      // this.conc = Number(newConcStr);
      // //

      // for 0.001 conc increment
      // round toFixed(4) to get ss check to work at low conc, since currently
      // only define rate at 0.001 steps of conc and conc oscillates at
      // small conc (consider change to finer resolution or continuous function)
      // but when lower input to near zero input, min conc in rxrs is xxx with
      // current input, which shows in checksum as 40, because dcdt each step
      // then too small to change conc at 4th position to right decimal point
      // so be careful when computing conversion after lower to zero input...
      let newConcStr = newConc.toFixed(4); // toFixed returns string
      this.conc = Number(newConcStr);

    } // END OF for (let i = 0; i < this.unitStepRepeats; i += 1)

    if (this.feed > 0) {
      this.conversion = 1 - this.conc / this.feed;
    } else {
      this.conversion = 0;
    }
    if (this.conversion < 0) {
      this.conversion = 0;
    }

    // // simple first-order rate
    // let krate = 0.04;
    // let Kads = 1 * 0.0872; // 0.0872 for max conc = 100, Kads * C/2 = 4.36
    //   // this unit may take multiple steps within one outer main loop repeat step
    // for (let i = 0; i < this.unitStepRepeats; i += 1) {
    //   let C = this.conc;
    //   let rxnRate = - krate * C / Math.pow((1 + Kads * C),2);
    //   let dcdt = flowrate/volume * (this.concIn - this.conc) + rxnRate;
    //   this.conc = this.conc + dcdt * this.unitTimeStep;
    // }

    // console.log('leave updateState, CSTR = ' + this.unitIndex + ', conc = ' + this.conc);

  } // END of updateState()

  this.updateDisplay = function() {
    // update display elements which only depend on this process unit
    // except do all plotting at main controller updateDisplay
    // since some plots may contain data from more than one process unit

    // HANDLE STRIP CHART DATA

    let v = 0; // used as index
    let p = 0; // used as index
    let tempArray = [];
    let numStripPoints = plotInfo[0]['numberPoints'];
    let numStripVars = 2; // only the variables from this unit

    // handle reactor conc
    v = 0;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,this.conc] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // XXX not needed if do not show dynamic converison strip chart plot
    // XXX also at array initialization only need 1 var for conc
    // XXX and above here at numStripVars
    // handle conversion
    v = 1;
    tempArray = this.stripData[v]; // work on one plot variable at a time
    // delete first and oldest element which is an [x,y] pair array
    tempArray.shift();
    // add the new [x.y] pair array at end
    tempArray.push( [0,this.conversion] );
    // update the variable being processed
    this.stripData[v] = tempArray;

    // re-number the x-axis values to equal time values
    // so they stay the same after updating y-axis values
    let timeStep = simParams.simTimeStep * simParams.simStepRepeats;
    for (v = 0; v < numStripVars; v += 1) {
      for (p = 0; p <= numStripPoints; p += 1) { // note = in p <= numStripPoints
        // note want p <= numStripPoints so get # 0 to  # numStripPoints of points
        // want next line for newest data at max time
        this.stripData[v][p][0] = p * timeStep;
        // want next line for newest data at zero time
        // this.stripData[v][p][0] = (numStripPoints - p) * timeStep;
      }
    }

  } // END of updateDisplay()

  this.checkForSteadyState = function() {
    // required - called by controller object
    // *IF* NOT used to check for SS *AND* another unit IS checked,
    // which can not be at SS, *THEN* return ssFlag = true to calling unit
    // returns ssFlag, true if this unit at SS, false if not
    // uses and sets this.ssCheckSum
    // this.ssCheckSum can be set by reset() and updateUIparams()
    // check for SS in order to save CPU time when sim is at steady state
    // check for SS by checking for any significant change in array end values
    // but wait at least one residence time after the previous check
    // to allow changes to propagate down unit
    //
    // multiply all numbers by a factor to get desired number significant
    // figures to left decimal point so toFixed() does not return string "0.###"
    // WARNING: too many sig figs will prevent detecting steady state
    //
    // here conc ranges from 0 to 1
    let rcs = 1.0e4 * this.concIn;
    let lcs = 1.0e4 * this.conc;
    rcs = rcs.toFixed(0); // string
    lcs = lcs.toFixed(0); // string
    let newCheckSum = rcs +'.'+ lcs; // concatenate strings, add +'.'+ if desire
    let oldSScheckSum = this.ssCheckSum;
    // console.log('unit ' + this.unitIndex + ', oldSScheckSum = ' + oldSScheckSum);
    // console.log('unit ' + this.unitIndex + ', newCheckSum = ' + newCheckSum);
    let ssFlag = false;
    if (newCheckSum == oldSScheckSum) {ssFlag = true;}
    this.ssCheckSum = newCheckSum; // save current value for use next time

    // SPECIAL FOR THIS UNIT
    if ((ssFlag == true) && (controller.ssStartTime == 0)) {
      // this unit at steady state && first time all units are at steady state
      // note ssStartTime will be changed != 0 after this check

      // handle SS conversion
      v = 0;
      tempArray = this.profileData[v]; // work on one plot variable at a time
      if (tempArray[0][0] <= 0) {
        // shift deletes 1st [x,y] pair created on array initialization
        tempArray.shift();
      }
      // add the new [x,y] pair array at end
      // feed conc to first CSTR, this CSTR's conversion
      if (processUnits[0].conc > 0) {
        // only add conversion when feed conc > 0
        tempArray.push( [processUnits[0].conc,this.conversion] );
      }
      // update the variable being processed
      this.profileData[v] = tempArray;

      // handle SS rate
      //
      v = 1;
      tempArray = this.profileData[v]; // work on one plot variable at a time
      if (tempArray[0][0] <= 0) {
        // shift deletes 1st [x,y] pair created on array initialization
        tempArray.shift();
      }
      // add the new [x,y] pair array at end
      // feed conc to first CSTR, this CSTR's conversion
      let thisRate = -100 * this.rxnRate;
      tempArray.push( [this.conc,thisRate] );
      // update the variable being processed
      this.profileData[v] = tempArray;

    } // END OF if ((ssFlag == true) && (controller.ssStartTime == 0))

    return ssFlag;
  } // END OF checkForSteadyState()

} // END puCSTR
