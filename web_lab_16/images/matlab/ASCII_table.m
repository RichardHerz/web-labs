clc
fprintf('\nASCII table \n')
for i = 33 : 298-64
    str = [num2str(i) ' ' char(i) ' '...
    num2str(i+32) ' ' char(i+32) ' '...
    num2str(i+64) ' ' char(i+64)];
    disp(str)
end