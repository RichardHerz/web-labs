function c = primeLen(m)

p = primes(m);
plen = length(p)-1;
pf = plen/m;

c = pf;

%     for i = 100000:100000:m
%         % get fraction of i that are primes > 2
%         p = primes(i);
%         plen = length(p)-1; % primes also returns 2
%         pf(i,1) = i;
%         pf(i,2) = plen/i;
%         
%         i
%         
%     end
%     
%     % fit to a polynomial 
%     c = polyfit(pf(:,1),pf(:,2),2);
    
    % return coefficients
    
    