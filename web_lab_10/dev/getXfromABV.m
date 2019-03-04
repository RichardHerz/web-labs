function x = getXfromABV(abv)

% given x find abv % 

coef = [6.3733e-12 -1.5614e-09 1.4834e-07 -6.1903e-06 1.3610e-04 2.3484e-03 1.8731e-04];
x = polyval(coef,abv);