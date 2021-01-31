% Richard K. Herz, www.ReactorLab.net, github.com/RichardHerz 
%
% test example of Fermat's Little Theorem used in RSA encryption 
%
% Fermat's Little Theorem used in Second Proof at 
% https://www.di-mgt.com.au/number_theory.html#flt 
% Rewritten here with a replaced by m: If p is a prime and m is any integer, 
% then m^(p) mod p = m. If gcd(m,p) = 1, then m^(p-1) mod p = 1 

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

clear all
clc

% need prime number p such that (p-1) as modulus > than message m
pr = primes(10000); % get array so easy to pick example, 1 is not included 
p = pr(length(pr)); % pick the largest one in array 

% p = 5 % pick another example 

m = 5432; % this is plain text message here

fprintf('message m = %i, prime p = %i \n',m,p)

% check m < p
if (m < p)
    disp('m < p GOOD')
else
    disp('m >= p BAD')
end

% check gcd(m,p) = 1
if (gcd(m,p) == 1)
    disp('gcd(m,p) == 1 GOOD for Test 1')
else
    disp('gcd(m,p) ~= 1 BAD for Test 1')
end

%% check result r = m^(p-1) mod p ?=? 1 

fprintf('\nTest 1, check result m^(p-1) mod p ?=? 1 \n\n')

r = FLTtest_F(m,(p-1),p);

if (r == 1)
    fprintf('Test 1 GOOD, result of m^(p-1) mod p = 1 ?=? %g \n\n',r)
else
    fprintf('Test 1 BAD, result not 1 \n\n')
end

%% check result r = m^p mod p ?=? m

fprintf('Test 2, check result m^p mod p ?=? m \n\n')

r = FLTtest_F(m,p,p);

if (r == m)
    fprintf('Test 2 GOOD, result of m^p mod p = m ?=? %g \n\n',r)
else
    fprintf('Test 2 BAD, result not m \n\n')
end

