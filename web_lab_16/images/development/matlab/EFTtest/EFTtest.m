% Richard K. Herz, www.ReactorLab.net, github.com/RichardHerz 
%
% test example of the Euler-Fermat Theorem used in RSA encryption 
%
% Euler-Fermat Theorem at 
% https://www.di-mgt.com.au/number_theory.html#eulerfermat
% If n is a positive integer and m is any integer with gcd(m,n) = 1, 
% then a^?(n) mod n = 1, where n = p*q and ?(n) = (p-1)*(q-1)
% Rewritten, If n is a positive integer and m is any integer with 
% gcd(m,n) = 1, then m^((p-1)(q-1)) mod (pq) = 1  

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
q = pr(length(pr)-2); % pick another one 

% p = 5 % pick another example 
% q = 7 % pick another example

n = p*q;
lamda = (p-1)*(q-1);

m = 5432; % this is plain text message here

fprintf('message m = %i, n = %i \n',m,n)

% check m < n
if (m < p)
    disp('m < n GOOD')
else
    disp('m >= n BAD')
end

% check gcd(m,p) = 1
if (gcd(m,p) == 1)
    disp('gcd(m,p) == 1 GOOD for p')
else
    disp('gcd(m,p) ~= 1 BAD for p')
end

% check gcd(m,q) = 1
if (gcd(m,q) == 1)
    disp('gcd(m,q) == 1 GOOD for q')
else
    disp('gcd(m,q) ~= 1 BAD for q')
end

%% check result r = m^(p-1) mod p ?=? 1 

fprintf('\nTest p, check result m^(p-1) mod p ?=? 1 \n\n')

r = EFTtest_F(m,(p-1),p);

if (r == 1)
    fprintf('Test of p GOOD, result of m^(p-1) mod p = 1 ?=? %g \n\n',r)
else
    fprintf('Test of p BAD, result not 1 \n\n')
end

%% check result r = m^(q-1) mod q ?=? 1 

fprintf('Test q, check result m^(q-1) mod q ?=? 1 \n\n')

r = EFTtest_F(m,(q-1),q);

if (r == 1)
    fprintf('Test of q GOOD, result of m^(q-1) mod q = 1 ?=? %g \n\n',r)
else
    fprintf('Test of q BAD, result not 1 \n\n')
end

%% check result m^((p-1)(q-1)) mod (pq) = 1

fprintf('Test phi,pq, check result m^((p-1)(q-1)) mod (pq) = 1 ?=? m \n\n')

r = EFTtest_F(m,(p-1)*(q-1),p*q);

if (r == 1)
    fprintf('Test phi,pq GOOD, m^((p-1)(q-1)) mod (pq) = 1 ?=? %g \n\n',r)
else
    fprintf('Test phi,pq BAD, result not 1 \n\n')
end

