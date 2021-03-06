% readings from Web Labs, Lab 2 - rxn & diff
% earlier data had conc as inlet to reactor 
% these are conc in reactor gas cell

% interpolate at this increment
inc = 0.001;

% col 1 is conc (0-1), col 2 is rate
dup = [0.000 0.000e+0 % process_interface.js:29:5
0.004 8.267e-5 % process_interface.js:29:5
0.008 1.574e-4
0.025 3.305e-4 % process_interface.js:29:5
0.039 4.103e-4
0.063 4.956e-4 % process_interface.js:29:5
0.088 5.557e-4
0.106 5.869e-4 % process_interface.js:29:5
0.124 6.133e-4
0.152 6.462e-4 % process_interface.js:29:5
0.198 6.889e-4 % process_interface.js:29:5
0.246 7.218e-4 % process_interface.js:29:5
0.294 7.484e-4 % process_interface.js:29:5
0.342 7.706e-4 % process_interface.js:29:5
0.391 7.896e-4 % at inlet 0.45
0.440 8.061e-4 % process_interface.js:29:5
0.488 8.206e-4 % process_interface.js:29:5
0.537 8.337e-4 % process_interface.js:29:5
0.587 8.454e-4 % process_interface.js:29:5
0.606 8.496e-4 % process_interface.js:29:5
0.626 8.527e-4 % at inlet = 0.69
0.636 8.518e-4]; % at inlet = 0.70, last on high branch

plot(dup(:,1),dup(:,2),'bo')
hold on
coef = polyfit(dup(:,1),dup(:,2),7);
cp = linspace(0,0.7,1000);
rp = polyval(coef,cp);
plot(cp,rp,'r')

ddn = [1.092 1.064e-4 % process_interface.js:29:5
1.042 1.119e-4 % process_interface.js:29:5
0.991 1.179e-4 % process_interface.js:29:5
0.941 1.247e-4 % process_interface.js:29:5
0.890 1.324e-4 % process_interface.js:29:5
0.839 1.412e-4 % process_interface.js:29:5
0.789 1.514e-4 % process_interface.js:29:5
0.738 1.633e-4 % process_interface.js:29:5
0.687 1.776e-4 % process_interface.js:29:5
0.635 1.952e-4 % process_interface.js:29:5
0.584 2.176e-4 % process_interface.js:29:5
0.531 2.481e-4 % at inlet = 0.55
0.510 2.640e-4 % process_interface.js:29:5
0.478 2.953e-4 % at inlet 0.50
0.467 3.089e-4 % at inlet 0.49
0.456 3.256e-4 % at inlet 0.48
0.444 3.473e-4 % at inlet 0.47
0.431 3.826e-4]; % at inlet 0.46, last on low branch
    
ddn = flip(ddn); % reverse order

plot(ddn(:,1),ddn(:,2),'bo')
coef = polyfit(ddn(:,1),ddn(:,2), 5);
cp = linspace(0.46,1.0,500);
rp = polyval(coef,cp);
plot(cp,rp,'r')

% how to generate in matlab interpolated points?
% for each pt to last-1
% get value for each 0.01 conc between
% that point and next pt in data 

% process HIGH branch
[r c] = size(dup);
dupp = [0 0];
counter = 0;
for j = 1:r-1
    % get conc and rate at end range
    dc1 = dup(j,1);
    dc2 = dup(j+1,1);
    dr1 = dup(j,2);
    dr2 = dup(j+1,2);
    % save start value for this range
    counter = counter + 1;
    dupp(counter,1) = dc1;
    dupp(counter,2) = dr1;
    % at increment for each value between
    for dc = dc1+inc:inc:dc2-inc
        % have dc, need rate
        dr = dr1 + (dr2-dr1)*(dc-dc1)/(dc2-dc1);
        % save interpolated value
        counter = counter + 1;
        dupp(counter,1) = dc;
        dupp(counter,2) = dr;
    end    
end
% save last value
counter = counter + 1;
dupp(counter,1) = dc2;
dupp(counter,2) = dr2;
[rh ch] = size(dupp)
plot(dupp(:,1),dupp(:,2),'r')

% process LOW branch
[r c] = size(ddn);
ddnp = [0 0];
counter = 0;
for j = 1:r-1
    % get conc and rate at end range
    dc1 = ddn(j,1);
    dc2 = ddn(j+1,1);
    dr1 = ddn(j,2);
    dr2 = ddn(j+1,2);
    % save start value for this range
    counter = counter + 1;
    ddnp(counter,1) = dc1;
    ddnp(counter,2) = dr1;
    % at increment for each value between
    for dc = dc1+inc:inc:dc2-inc
        % have dc, need rate
        dr = dr1 + (dr2-dr1)*(dc-dc1)/(dc2-dc1);
        % save interpolated value
        counter = counter + 1;
        ddnp(counter,1) = dc;
        ddnp(counter,2) = dr;
    end    
end
% save last value
counter = counter + 1;
ddnp(counter,1) = dc2;
ddnp(counter,2) = dr2;
[rl cl] = size(ddnp)
plot(ddnp(:,1),ddnp(:,2),'r')
ylabel('Rate')
xlabel('Reactant Concentration')
hold off

% SAVE RATES TO FILES
% as row vector, comma delimited for Javascript
rUp = dupp(:,2)';
rDown = ddnp(:,2)';
% dmlwrite default delimiter (dlm) is comma
dlmwrite('rateHIGH.txt',rUp)
dlmwrite('rateLOW.txt',rDown)


