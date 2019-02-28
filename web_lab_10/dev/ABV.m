% Alcohol by volume (ABV) is vol of pure alcohol used to make mixture divided 
% by volume of mixture after mixing, which is reduced from sum of volumes
% of water and ethanol used because of nonideal mixing.
% ABV is proportional to specific gravity of mixture as measured
% by a hydrometer in ethanol-water mixure.

% Reference http://www.ddbst.com/en/EED/VE/VE0%20Ethanol%3BWater.php
% Excess Volume Data Set 947
% Components
% No. 	Formula 	Molar Mass 	CAS Registry Number 	Name
% 1 	C2H6O 	46.069 	64-17-5 	Ethanol
% 2 	H2O 	18.015 	7732-18-5 	Water
% Source
% Ott J.B.; Sipowska J.T.; Gruszkiewicz M.S.; Woolley A.T.: 
% Excess Volumes for (Ethanol + Water) at the Temperatures (298.15 and 348.15) K 
% and Pressures (0.4, 5, and 15) MPa and at the Temperature 323.15 K and 
% Pressures (5 and 15) MPa. 
% J.Chem.Thermodyn. 25 (1993) 307-318
% Temperature 	298.150 	K
% Pressure 	5.000 	bar
% Data Table
% Excess Volume [cm3/mol] 	x1 [mol/mol]
d = [0 0
-0.0600 	0.01610
-0.0830 	0.02170
-0.1410 	0.03340
-0.2040 	0.04560
-0.2720 	0.05850
-0.3420 	0.07200
-0.4220 	0.08630
-0.4990 	0.10150
-0.5750 	0.11740
-0.7470 	0.16180
-0.8770 	0.21370
-0.9550 	0.26190
-1.0080 	0.31780
-1.0370 	0.36580
-1.0430 	0.40120
-1.0400 	0.46060
-1.0230 	0.50500
-0.9910 	0.55400
-0.9360 	0.60820
-0.8650 	0.66870
-0.8110 	0.70160
-0.7550 	0.73650
-0.5920 	0.81300
-0.4850 	0.85510
-0.3520 	0.90010
-0.1910 	0.94820
0 1];

exvol = d(:,1);
x = d(:,2);

mw1 = 46.069; % molecular weight
mvol1 = 58.4; % cm3/mol
dens1 = 0.789; % g/cm3
mw2 = 18.015;
mvol2 = 18; 
dens2 = 1;

% get ABV (alcohol by volume) vs. mole fraction x (x1)
% basis 1 mol total
vol1 = x * mvol1;
vol2 = (1-x) * mvol2;
volSum = vol1 + vol2; 
volTot = volSum + exvol
abv = 100 * vol1 ./ volTot;
volPercent = 100 * vol1 ./ volSum;
plot(x,abv,'bo',[0 1],[0 100],'k',x,volPercent,'rx')
title('blue o = ABV %, red x = 100% * volume fraction ethanol')
ylabel('%')
xlabel('mole fraction ethanol in water')

n = 6;
format short e
coef = polyfit(x,abv,n)
yp = polyval(coef,x);
figure(2)
plot(x,yp,'k',x,abv,'bo',[0 1],[0 100],'k')
title('ABV vs. x from fit of ABV vs x - given x, find ABV')

n = 4;
format short e
coef2 = polyfit(abv,x,n)
xp = polyval(coef2,abv);
figure(3)
plot(xp,abv,'k',x,abv,'bo',[0 1],[0 100],'k')
title('ABV vs x from fit of x vs. ABV - given ABV, find x')

