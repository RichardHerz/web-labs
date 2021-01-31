% simple RSA public key encryption example
% Richard K. Herz, www.reactorlab.net, github.com/RichardHerz

% WARNING: this encrypts single ASCII/UNICODE chars at a time which may
% be in an array of multiple char 
% ALSO only handles char with hex code equivalants of max of 
% variable hexlen in function myRSA5_F.m 
% WARNING: note that encoded value of even low value plain text char 
%          may be large value that needs large hexlen, especially
%          with large key values

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
% 499, 491 OK but need hexlen = 5 in function myRSA5_F
p = 499; % first prime
q = 491; % second prime
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
% fprintf('>>> TEST FAKE phi = %g \n',phi)

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
    
%% SET MESSAGE

m = '[ ,$]{|~}0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

fprintf('original message to ASCII 127: %s \n',m)

% ENCRYPT 

c = myRSA5_F(m, pk, 'pk');
fprintf('encrypted message: ')
fprintf('%s ',c)
fprintf('\n')

% DECRYPT 

m = myRSA5_F(c, sk, 'sk');
fprintf('decrypted message: ')
fprintf('%s ',m)
fprintf('\n')

%% CHECK OF KEY UNIQUENESS AND ACCURACY 

fprintf('\nCHECK KEY UNIQUENESS ABOVE, CHECK ACCURACY BELOW \n')
fprintf('ASCII, message, decrypt, encoded message \n')
fprintf('SHOWING ONLY CHAR THAT DO NOT COME BACK CORRECTLY \n')
% 33 is first ASCII/UNICODE code with visible display
% pk(1)-1 is max ASCII/UNICDOE code that can be encrypted with this key

% set max char value to check 
tmax = pk(1)-1; 

% from Help on char() 
% The integers from 32 to 127 correspond to printable ASCII characters. However, the 
% integers from 0 to 65535 also correspond to Unicode® characters. You can convert 
% integers to their corresponding Unicode representations using the char function. 
%
% only handles char with hex code equivalants of max of 
% variable hexlen in function fMyRSA_.m 
% hexlen value of 3 can handle unicode values up to 4095
% hexlen value of 4 can handle max unicode value of 65535 
% hexlen value of 5 can handle max code value of 1048575 
% WARNING: note that encoded value of even low value plain text char 
%          may be large value that needs large hexlen, especially
%          with large key values

if (tmax > 127)
    tmax = 127;
end

fprintf('ASCII 1 - %i checked \n',tmax)

for i = 1:tmax

    % SET MESSAGE 

    % now want to encode a message
    % convert message i as code to an ASCII/UNICODE char 
    ms = char(i);
%     fprintf('original message: %s \n',ms)

    % ENCRYPT 

    c = myRSA5_F(ms, pk, 'pk');
%     fprintf('encrypted message by fMyRSA: %s \n',num2str(c))

    % DECRYPT 

    m = myRSA5_F(c, sk, 'sk');
%     fprintf('decrypted message by fMyRSA: %s \n',m);

    if (ms ~= m)
     fprintf('%i %s %s %i \n',i,ms,m,c)
    end

end % end of repeat through ascii values 
