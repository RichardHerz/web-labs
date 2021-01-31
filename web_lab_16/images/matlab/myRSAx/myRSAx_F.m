function r = myRSAx_F(m,key)
    %
    % result r = m^key(2) mod key(1)
    % input m is one integer, output r is one integer
    % input key(1) and key(2) are each one integer
    % use modular exponentiation algorithm 
    % since can't exponentiate directly with large numbers
    % here, only need to be able to square m and keep all significant figs

    % convert key(2) to binary char array
    % so we know which square terms in array p we need in modular exponentiation
    b = dec2bin(key(2));
    blen = length(b);
    
    % get results in array p of successive squares of m mod key(1)
    p(1) = m;
    for i = 2:blen
      p(i) = mod( p(i-1)^2 , key(1) );
    end
    
    % compute result using the p(i) required by key(2)
    % use only the powers-of-two of bit values in b = key(2)
    % increasing index in p is higher power-of-two
    % increasing index in b is lower power-of-two
    % flip order of b to match index of powers-of-two in p
    b = flip(b);

    % use only the powers-of-two of bit values in flipped b == '1'
    C = 1; % initialize product
    for i = 1:blen
      if (b(i) == '1')
         C = mod(C, key(1)) * mod(p(i), key(1));
         C = mod(C, key(1));
      end
    end
    r = C; % return r
