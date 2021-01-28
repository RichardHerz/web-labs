function fGetKeys() {

  console.log('enter main function fGetKeys');

  let pf = document.getElementById('input_field_enter_p');
  let qf = document.getElementById('input_field_enter_q');

  let p = pf.value;
  let q = qf.value;

  let n = p*q;
  let phi = (p-1)*(q-1);
  console.log('phi = ' + phi);
  let ep = primes(phi);
  console.log('ep = ' + ep);

  // find a random value in primes that is coprime with phi
  // this produces different keys every run
  // if desire same key, let i = 1 or other start
  // then increment i inside while loop
  // (or write own random function where can fix seed)
  let eplen = ep.length;
  let j = 0; // counter so random pick loop won't run forever
  let jfac = 5; // factor * eplen to limit random pick loop to run
  let i = Math.floor(Math.random() * eplen);
  // let i = 1;
  while (gcd_two_numbers(ep[i],phi) != 1) {
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
  console.log('GCD e = ' + e);

  // find modular inverse d of e such that mod(e*d,phi) = 1
  // use brute force here but check out extended Euclidean algorithm
  // e.g., at 11:20 of https://youtu.be/Z8M2BTscoD4
  let d = 1; // initialize
  while (Math.round(e*d % phi) != 1) {
      d++;
  }
  tm = e*d % phi; // check
  console.log('d = ' + d + ', check e*d % phi = 1 ?=? ' + tm);

  let pk = [n,e];
  let sk = [n,d];
  console.log('pk = ' + pk);
  console.log('sk = ' + sk);

  // need to return keys or put them in fields
  document.getElementById('field_public_key_0').innerHTML = pk[0];
  document.getElementById('field_public_key_1').innerHTML = pk[1];
  document.getElementById('field_private_key_0').innerHTML = sk[0];
  document.getElementById('field_private_key_1').innerHTML = sk[1];

  document.getElementById('field_n_value').innerHTML = pk[0];

} // END of function fGetKeys

function fEncode() {
  let pk0 = document.getElementById('field_public_key_0').innerHTML;
  let pk1 = document.getElementById('field_public_key_1').innerHTML;
  let pk = [];
  pk[0] = Number(pk0); // convert string to number
  pk[1] = Number(pk1);
  console.log('in fEncode, pk = ' + pk);
  let mf = document.getElementById('input_field_enter_numeric_message');
  let m = mf.value;
  let c = myRSA_F(m,pk);
  console.log('in fEncode, c = ' + c);
  document.getElementById('field_encoded_message').innerHTML = c;
} // END of function fEncode

function fDecode() {
  let sk0 = document.getElementById('field_private_key_0').innerHTML;
  let sk1 = document.getElementById('field_private_key_1').innerHTML;
  let sk = [];
  sk[0] = Number(sk0); // convert string to number
  sk[1] = Number(sk1);
  console.log('in fDecode, sk = ' + sk);
  let cf = document.getElementById('field_encoded_message').innerHTML;
  let c = Number(cf);
  let m = myRSA_F(c,sk);
  console.log('in fDecode, m = ' + m);
  document.getElementById('field_decoded_message').innerHTML = m;
} // END of function fDecode

function myRSA() {

  console.log('enter main function myRSA');

  let p = 13;
  let q = 37;
  let n = p*q;
  let phi = (p-1)*(q-1);
  console.log('phi = ' + phi);
  let ep = primes(phi);
  console.log('ep = ' + ep);

  // find a random value in primes that is coprime with phi
  // this produces different keys every run
  // if desire same key, let i = 1 or other start
  // then increment i inside while loop
  // (or write own random function where can fix seed)
  let eplen = ep.length;
  let j = 0; // counter so random pick loop won't run forever
  let jfac = 5; // factor * eplen to limit random pick loop to run
  let i = Math.floor(Math.random() * eplen);
  // let i = 1;
  while (gcd_two_numbers(ep[i],phi) != 1) {
    i = Math.floor(Math.random() * eplen);
    // break out if don't find GCD within loop limit for random pick
    j++;
    if (j > jfac * eplen) {
      console.log('in function myRSA, no GCD found');
      break;
    }
    // i = i++;
    // // break out if start at fixed i and don't find GCD
    // if (i > ep.length) {
    //   console.log('in function myRSA, no GCD found');
    //   break;
    // }
  }
  let e = ep[i];
  console.log('GCD e = ' + e);

  // find modular inverse d of e such that mod(e*d,phi) = 1
  // use brute force here but check out extended Euclidean algorithm
  // e.g., at 11:20 of https://youtu.be/Z8M2BTscoD4
  let d = 1; // initialize
  while (Math.round(e*d % phi) != 1) {
      d++;
  }
  tm = e*d % phi; // check
  console.log('d = ' + d + ', check e*d % phi = 1 ?=? ' + tm);

  let pk = [n,e];
  let sk = [n,d];
  console.log('pk = ' + pk);
  console.log('sk = ' + sk);

  // test a message
  let m = 65;
  console.log('m = ' + m);

  // encrypt
  let c = myRSA_F(m,pk);
  console.log('c = ' + c);

  // decrypt
  let md = myRSA_F(c,sk);
  console.log('md = ' + md);

} // END of function myRSA

function gcd_two_numbers(x, y) {
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
} // END of function gcd_two_numbers

function primes(max) {
  // thanks to vitaly-t on stackoverflow
  console.log('enter function primes');
  let value = 1;
  let result = [];
  while (value < max) {
      value = nextPrime(value);
      result.push(value);
  }
  let tlast = result[result.length - 1];
  if (tlast > max) {
    result.pop();
  }
  return result;
} // END of function primes

function nextPrime(value) {
  // thanks to vitaly-t on stackoverflow
  console.log('enter function nextPrime');
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
} // END of function nextPrime

function myRSA_F(m,key) {
  // return r = m^key[1] mod key[0]
  // using modular exponentiation

  console.log('enter function myRSA_F');
  console.log('m = ' + m);
  console.log('key[0] = ' + key[0]);
  console.log('key[1] = ' + key[1]);

  // convert key(2) to binary char array
  // so we know which terms we will need in modular exponentiation below
  let b = key[1].toString(2); // (2) means provide binary

  // get results in array p of successive squares of m mod key(1)
  let p = [m];
  for (i = 1; i < b.length; i++) {
    p[i] = p[i-1]**2 % key[0]; // % is modulus operator
  }

  console.log('length b = ' + b.length);
  console.log('b = ' + b);
  console.log('length p = ' + p.length);
  console.log('p = ' + p);

  // compute result using the p(i) required by key(2)
  // use only the powers-of-two of bit values in b == '1'
  // increasing index in p is higher power-of-two
  // increasing index in b is lower power-of-two
  // access b from high-index 2^0 bit to low-index, highest-power bit
  // to match p(i) powers
  let blen = b.length;
  let r = 1; // initialize product
  for (i = 0; i < blen; i++) {
    if (b.substr(blen - 1 - i, 1) == '1') {
      r = r % key[0] * p[i] % key[0];
      r = r % key[0];
    }
  }
  console.log('end function myRSA_F, r = ' + r);
  return r;
} // END of function myRSA_F
