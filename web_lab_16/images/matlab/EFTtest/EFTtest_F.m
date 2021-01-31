function r = EFTtest_F(m,p,n) 
% modular inverse algorithm 
% since can't exponentiate directly with large numbers
% here, only need to be able to square m and keep all significant figs
% inputs are integers
% return result integer r = m^p mod n

% convert exponent p to binary char array
% so we know which terms we will need in modular inverse below
b = dec2bin(p);
fprintf('binary equivalent of exponent = %g = %s \n\n',p,b)
b = flip(b); % so can use increasing loop variable below
% WARNING: do not use str2num to convert b in order to use "if b(i)" 
%          boolean below, since provides no encyrption

mx = m;
for i = 2:length(b)
    mx(i) = mod( mx(i-1)^2 , n );
end
r = 1; % initialize product
for i = 1:length(b)
    if (b(i) == '1') % WARNING: use this, do not use "if b(i)" boolean
       r = mod(r,n) * mod(mx(i),n);
       r = mod(r,n);
    end
end
% return r 
