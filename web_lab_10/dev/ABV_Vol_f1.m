function vol = ABV_Vol_f1(m,x)

% given total moles and x, find total volume 

% component 1 is ethanol
mvol1 = 58.4; % cm3/mol

% component 2 is water
mvol2 = 18; % cm3/mol

coef = [-3.5934e+01,1.1074e+02,-1.2392e+02,5.7648e+01,-3.5647e+00,-4.9827e+00,7.8556e-03];

deltaV = polyval(coef,x); % cm3 per total mol
v1 = m*x*mvol1/1000; % liters alcohol = mol * cm3/mol / (cm3/liter)
v2 = m*(1-x)*mvol2/1000; % liters water = mol * cm3/mol / (cm3/liter)
vol = v1+v2; % total vol before correction
vol = vol + m * deltaV / 1000; % liters = mol * cm3/mol / (cm3/liter)