function fGetRandomPQ() {
  // WARNING: prMin in fPrimes must be a prime!!!
  let prMin = 1009; // WARNING: must be a prime number!!!
  let prMax = 10000;
  let pr = fPrimes(prMin, prMax);
  let prLen = pr.length;
  let i = Math.floor(Math.random() * prLen);
  let p = pr[i];
  let j = Math.floor(Math.random() * prLen);
  while (j == i) {
    j = Math.floor(Math.random() * prLen);
  }
  let q = pr[j];
  console.log('p = ' + p + ', q = ' + q);
  document.getElementById('input_field_enter_p').value = p;
  document.getElementById('input_field_enter_q').value = q;
} // END of function fGetRandomPQ

function fGetKeys() {
  // uses functions fPrimes() and fGCD_two_numbers()
  console.log('enter main function fGetKeys');

  // DEVELOPMENT
  // declare variables
  // for use in development timing checks below
  let timerDate;
  let timerStart;
  let timerEnd;
  let timerElapsed;

  let pf = document.getElementById('input_field_enter_p');
  let qf = document.getElementById('input_field_enter_q');

  let p = pf.value;
  let q = qf.value;

  let n = p*q;
  let phi = (p-1)*(q-1);

  timerDate = new Date();
  timerStart = timerDate.getTime();
  // console.log('timerStart = ' + timerStart);

  // get array of primes ep from which to select e
  let ep =[]; // declare ep
  let eplen; // declare eplen
  let pLim = 25000000;
  if (phi > pLim) {
    let ep1 = fPrimesList();
    let ep2 = fPrimes(pLim, phi); // this function listed below in this file
    ep = ep.concat(ep1, ep2);
    eplen = ep.length;
  } else {
    // get from pre-generated list in file primesList.js
    // only to this limit so this is very fast
    // MATLAB primes(25000000) returns 1,565,927 primes from 2 to 24999983 (6.3%)
    ep = fPrimesList(); // this function in file primesList.js
    // need to estimate eplen because won't need all those in this array
    eplen = ep.length; // TEMPORARY FOR NOW
    // coefficients of 3rd order polynomial fit of fraction of primes >2 in list
    // vs. natural log of max number in list - coefficients from fit in MATLAB
    let coef = [-0.000099758947246, 0.004513664869385, -0.073043961967510, 0.490056200524824];
    let plog = Math.log(phi);
    let pfrac = coef[0]*plog**3 + coef[1]*plog**2 + coef[2]*plog + coef[3];
    pfrac = 0.99*pfrac; // lower a little so don't overshoot length estimate
    eplen = Math.round(pfrac*phi);
    console.log('eplen calc = ' + eplen)
  }

  timerDate = new Date();
  timerEnd = timerDate.getTime();
  // console.log('timerEnd = ' + timerEnd);
  timerElapsed = timerEnd - timerStart;
  console.log('TIME (ms) to get PRIMES = ' + timerElapsed);

  // console.log('ep = ' + ep); // WARNING: THIS LOGGING IS VERY SLOW WITH LONG LIST

  // find a random value in primes that is coprime with phi
  // this produces different keys every run
  // if desire same key, let i = 1 or other start
  // then increment i inside while loop
  // (or write own random function where can fix seed)

  timerDate = new Date();
  timerStart = timerDate.getTime();
  // console.log('timerStart = ' + timerStart);
  // PUT PROCESS TO TIME HERE

  let j = 0; // counter so random pick loop won't run forever
  let jfac = 5; // factor * eplen to limit random pick loop to run
  let i = Math.floor(Math.random() * eplen);
  // let i = 1;
  // add condition (ep[i] < phi) because estimating length of primes above
  while ( (fGCD_two_numbers(ep[i],phi) != 1) && (ep[i] < phi) ) {
    i = Math.floor(Math.random() * eplen);
    // break out if don't find GCD within loop limit for random pick
    j++;
    if (j > jfac * eplen) {
      console.log('in function fGetKeys, no GCD found');
      break;
    }
    // i = i++;
    // // break out if start at fixed i and don't find GCD
    // if (i > ep.length) {
    //   console.log('in function fGetKeys, no GCD found');
    //   break;
    // }
  }
  let e = ep[i];

  timerDate = new Date();
  timerEnd = timerDate.getTime();
  // console.log('timerEnd = ' + timerEnd);
  timerElapsed = timerEnd - timerStart;
  console.log('TIME (ms) to get GCD = ' + timerElapsed);

  console.log('GCD e = ' + e);

  timerDate = new Date();
  timerStart = timerDate.getTime();
  // console.log('timerStart = ' + timerStart);
  // PUT PROCESS TO TIME HERE

  // find modular inverse d of e such that mod(e*d,phi) = 1
  // use brute force here but check out extended Euclidean algorithm
  // e.g., at 11:20 of https://youtu.be/Z8M2BTscoD4
  let d = 1; // initialize
  while (Math.round(e*d % phi) != 1) {
      d++;
  }

  timerDate = new Date();
  timerEnd = timerDate.getTime();
  // console.log('timerEnd = ' + timerEnd);
  timerElapsed = timerEnd - timerStart;
  console.log('TIME (ms) to get MOD INVERSE d = ' + timerElapsed);

  tm = e*d % phi; // check
  console.log('d = ' + d + ', check e*d % phi = 1 ?=? ' + tm);

  let pk = [n,e]; // public key
  let sk = [n,d]; // private (secret) key

  console.log('pk = ' + pk);
  console.log('sk = ' + sk);

  // update display
  document.getElementById('field_public_key_0').innerHTML = pk[0];
  document.getElementById('field_public_key_1').innerHTML = pk[1];
  document.getElementById('field_private_key_0').innerHTML = sk[0];
  document.getElementById('field_private_key_1').innerHTML = sk[1];

  document.getElementById('field_n_value').innerHTML = n;
  document.getElementById('field_phi_value').innerHTML = phi;
  document.getElementById('field_n_message_max').innerHTML = n;

  document.getElementById('field_encoded_message').innerHTML = '';
  document.getElementById('field_decoded_message').innerHTML = '';

} // END of function fGetKeys

function fEncode() {
  // uses function fModExp()
  let pk0 = document.getElementById('field_public_key_0').innerHTML;
  let pk1 = document.getElementById('field_public_key_1').innerHTML;
  let pk = [];
  pk[0] = Number(pk0); // convert string to number
  pk[1] = Number(pk1);
  console.log('in fEncode, pk = ' + pk);
  let mf = document.getElementById('input_field_enter_numeric_message');
  let m = mf.value;
  let c = fModExp(m,pk);
  console.log('in fEncode, c = ' + c);
  document.getElementById('field_encoded_message').innerHTML = c;
    document.getElementById('field_decoded_message').innerHTML = '';
} // END of function fEncode

function fDecode() {
  // uses function fModExp()
  let sk0 = document.getElementById('field_private_key_0').innerHTML;
  let sk1 = document.getElementById('field_private_key_1').innerHTML;
  let sk = [];
  sk[0] = Number(sk0); // convert string to number
  sk[1] = Number(sk1);
  console.log('in fDecode, sk = ' + sk);
  let cf = document.getElementById('field_encoded_message').innerHTML;
  let c = Number(cf);
  let m = fModExp(c,sk);
  console.log('in fDecode, m = ' + m);
  document.getElementById('field_decoded_message').innerHTML = m;
} // END of function fDecode

function fGCD_two_numbers(x, y) {
  // thanks to w3resource
  if ((typeof x !== 'number') || (typeof y !== 'number'))
    return false;
  x = Math.abs(x);
  y = Math.abs(y);
  while(y) {
    let t = y;
    y = x % y;
    x = t;
  }
  return x;
} // END of function fGCD_two_numbers

function fPrimes(min, max) {
  // WARNING: input min must be a prime number!!!
  // thanks to vitaly-t on stackoverflow
  // uses function fNextPrime()
  // console.log('enter function primes');
  let value = min;
  let result = [];
  while (value < max) {
      value = fNextPrime(value);
      result.push(value);
  }
  let tlast = result[result.length - 1];
  if (tlast > max) {
    result.pop();
  }
  return result;
} // END of function primes

function fNextPrime(value) {
  // WARNING: input value must be a prime number!!!
  // thanks to vitaly-t on stackoverflow
  // console.log('enter function fNextPrime');
  if (value > 2) {
      let i;
      let q;
      do {
          i = 3;
          value += 2;
          q = Math.floor(Math.sqrt(value));
          while (i <= q && value % i) {
              i += 2;
          }
      } while (i <= q);
      return value;
  }
  return value === 2 ? 3 : 2;
} // END of function fNextPrime

function fModExp(m,key) {
  //
  // return r = m**key[1] % key[0], where ** is exponentiate and % is mod
  // using modular exponentiation

  console.log('enter function fModExp');
  console.log('m = ' + m);
  console.log('key[0] = ' + key[0]);
  console.log('key[1] = ' + key[1]);

  // convert key[2] to binary char array
  // so we know which terms we will need in modular exponentiation below
  let b = key[1].toString(2); // toString(2) means return binary representation

  // get results in array p of successive squares of m mod key[0]
  let p = [m];
  for (i = 1; i < b.length; i++) {
    p[i] = p[i-1]**2 % key[0];
  }

  console.log('length b = ' + b.length);
  console.log('b = ' + b);
  console.log('length p = ' + p.length);
  console.log('p = ' + p);

  // compute result using the p[i] required by key[1]
  // use only the powers-of-two of bit values in b == '1'
  // increasing index in p is higher power-of-two
  // increasing index in b is lower power-of-two
  // access b from high-index 2**0 bit to low-index, highest-power bit
  // to match p[i] powers
  let blen = b.length;
  let r = 1; // initialize product
  for (i = 0; i < blen; i++) {
    if (b.substr(blen - 1 - i, 1) == '1') {
      r = r % key[0] * p[i] % key[0];
      r = r % key[0];
    }
  }
  console.log('end function fModExp, r = ' + r);
  return r;
} // END of function fModExp
