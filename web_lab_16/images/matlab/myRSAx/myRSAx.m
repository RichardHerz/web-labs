% simple RSA public key encryption example
% Richard K. Herz, www.reactorlab.net, github.com/RichardHerz 

% THIS IS A TEST VERSION which works in single integers 
% function myRSAx_F takes in and returns one integer

%{
Quick summary of RSA public key encryption: 
the public and private keys are generated from two secret coprimes p & q 
m is original plain text message converted to an integer 
where m < n = p*q
e is chosen coprime with phi(n) = (p-1)*(q-1) 
d is the modular inverse of e such that e*d = 1 (mod phi(n)) 
the public key is [n,e] 
c is the message encoded with the public key 
c = m^e (mod n) 
the private key is [n,d] 
the plain text message integer is recovered in this way
m = c^d (mod n)
  = m^(e*d) (mod n)
  = m^(1+k*phi(n)) (mod n) where k is an integer
  = m * (m^(phi(n)))^k (mod n)
  = m * 1^k (mod n)
since m^phi(n) (mod n) = 1, by the Euler-Fermat theorem
  = m 
%}

%% MAKE KEYS 

clear all
clc
% https://en.wikipedia.org/wiki/RSA_(cryptosystem)
% WARNING: other combinations can either give same keys or have errors
% see check below for errors and also look to make sure keys differ
% 13, 37 have different keys and no errors for ascii 1-480 
% 19, 37 have different keys and no errors for ascii 1-480
% 67, 37 have different keys and no errors for ascii 1-480
% 67, 47 have different keys and no errors for ascii 1-480
% 67, 53 have different keys and no errors for ascii 1-480
% 71, 53 have different keys and no errors for ascii 1-480
% 73, 53 have different keys and no errors for ascii 1-480
% 499, 491 have different keys and no errors for ascii 1-480
% 839, 997 have different keys and no errors for ascii 1-480
%  but take a long time to check all phi-1 values, so wait
p = 839; % first prime
q = 997; % second prime
n = p*q;
% hacker, to get d knowing n & e, would have to factor n to get the
% two primes p & q but this is very hard to do for large p & q 
% See 21:30 & 37.20 at https://youtu.be/QSlWzKNbKrU
phi = (p-1)*(q-1);
% NOTE: wikipedia says to use lcm(p-1,q-1) which also worked 
% See "Using lambda(n) instead of phi(n)" at https://www.di-mgt.com.au/rsa_theory.html 
lambda = lcm( (p-1), (q-1) );

% % xxx TEST
% phi = lambda;
% fprintf('>>> TEST FAKE phi = %g <<< \n',phi)

fprintf('p = %i, q = %i \n',p,q)
fprintf('n = %i, phi = %i, lambda = %i \n',n,phi,lambda)
ep = primes(phi); % phi not in list because it's a multiple
% eliminate p and q from list to impede hacker but not necessary
i = find( (ep ~= p) & (ep ~= q) );
ep = ep(i);
% need value whose greatest common divisor with phi(n) = 1
% this criterion is required in order to get modular inverse below
% here get the smallest but use others for other unique keys with these p,q
% at least for one example, get both smaller keys than using largest value
%    so less computation during encryption-decryption 
% at least getting smallest here provides faster encryption which is good
%    for web clients sending encrypted info to fast server 
i = 1;
while (gcd(ep(i),phi) ~= 1)
    i = i+1;
    if (i > length(ep))
        disp('WARNING: no GCD found')
        break
    end
end
e = ep(i);
fprintf('GCD search: i = %i, ep(i) = %i \n',i,ep(i));
% find modular inverse d of e such that mod(e*d,phi) = 1
% use brute force here but check out extended Euclidean algorithm 
% e.g., at 11:20 of https://youtu.be/Z8M2BTscoD4 
d = 1; % initialize
while (round(mod(e*d,phi)) ~= 1)
    d = d+1;
end
tm = mod(e*d,phi); % check
fprintf('GCD(d,phi) = % g \n',gcd(d,phi))
pk = [n,e];
sk = [n,d];
fprintf('public key is: %i , %i \n',n,e)
fprintf('private (secret) key is: %i , %i \n',n,d) 
    
% SET MESSAGE, which will be encoded character by character here 

% m = '[ ,$]0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

m = 65;

fprintf('original message: %g \n',m)

% ENCRYPT 

c = myRSAx_F(m, pk);
fprintf('encrypted message: ')
fprintf('%g ',c)
fprintf('\n')

% DECRYPT 

md = myRSAx_F(c, sk);
fprintf('decrypted message: ')
fprintf('%g ',md)
fprintf('\n')



%% CHECK OF KEY UNIQUENESS AND ACCURACY 

fprintf('\nCHECK KEY UNIQUENESS ABOVE \n')
fprintf('CHECK ACCURACY BELOW \n')
% fprintf('ASCII, message, decrypt, encoded message \n')
fprintf('SHOWING ONLY MESSAGES THAT DO NOT COME BACK CORRECTLY \n')
% 33 is first ASCII code with visible display
% pk(1)-1 is max ASCII code that can be encrypted with this key

% set max ASCII value to check 
tmax = pk(1)-1;

% tmax = 20

% WARNING: ASCII may have a maximum value for which function char()
%          below returns a value 

% if (tmax > 480)
%     tmax = 480;
% end

fprintf('messages 2 - %i checked \n',tmax)
fprintf('message, coded, recovered \n')

% note, message as number 1 comes back encoded as 1, 
% since 1 to any power = 1

for i = 2:tmax

    % SET MESSAGE 
    
    ms = i;
    
%     ms = char(i);
%     fprintf('original message: %g \n',ms)

    % ENCRYPT 

    c = myRSAx_F(ms, pk);
%     fprintf('encrypted message: %g \n',c)

    % DECRYPT 

    m = myRSAx_F(c, sk);
%     fprintf('decrypted message: %g \n',m);

    if ((ms ~= m) || (c == m))
     fprintf('>>>>>> %i %i %i \n',ms,c,m)
    end

end % end of repeat through message values 
fprintf('message, coded, recovered \n')
