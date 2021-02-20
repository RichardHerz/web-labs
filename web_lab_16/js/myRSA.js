function fClearFields() {
  document.getElementById('field_public_key_0').innerHTML = '';
  document.getElementById('field_public_key_1').innerHTML = '';
  document.getElementById('field_private_key_0').innerHTML = '';
  document.getElementById('field_private_key_1').innerHTML = '';
  document.getElementById('field_n_value').innerHTML = '';
  document.getElementById('field_phi_value').innerHTML = '';
  document.getElementById('field_n_message_max').innerHTML = '';
  document.getElementById('field_encoded_message').innerHTML = '';
  document.getElementById('field_encoded_message_hex').innerHTML = '';
  document.getElementById('field_decoded_message').innerHTML = '';
}

function fGetRandomPQ() {
  // uses function fClearFields()
  fClearFields();
  // WARNING: prMin in fPrimes must be a prime!!!
  let prMin = 1009; // WARNING: must be a prime number!!!
  let prMax = 10000;
  let pr = fGetPrimesInRange(prMin, prMax);
  let prLen = pr.length;
  let i = Math.floor(Math.random() * prLen);
  let p = pr[i];
  let j = Math.floor(Math.random() * prLen);
  while (j == i) {
    j = Math.floor(Math.random() * prLen);
  }
  let q = pr[j];
  // console.log('p = ' + p + ', q = ' + q);
  document.getElementById('input_field_enter_p').value = p;
  document.getElementById('input_field_enter_q').value = q;
} // END of function fGetRandomPQ

function fGetKeys() {
  // uses functions fClearFields(), fGetPrimes() and fGCD_two_numbers()
  // console.log('enter main function fGetKeys');
  // DEVELOPMENT
  // declare variables
  // for use in development timing checks below
  let timerDate;
  let timerStart;
  let timerEnd;
  let timerElapsed;

  fClearFields();

  let pf = document.getElementById('input_field_enter_p');
  let qf = document.getElementById('input_field_enter_q');

  let p = pf.value;
  let q = qf.value;

  let n = p*q;
  let phi = (p-1)*(q-1);

  // get array of primes ep from which to select e

  timerDate = new Date();
  timerStart = timerDate.getTime();

  let ep = fGetPrimes(phi); // computes & returns primes from 3 to phi
  let eplen = ep.length;

  timerDate = new Date();
  timerEnd = timerDate.getTime();
  timerElapsed = timerEnd - timerStart;
  console.log('TIME (ms) to get PRIMES = ' + timerElapsed);

  // find a random value in primes that is coprime with phi
  // this produces different keys every run
  // if desire same key, let i = 1 or other start
  // then increment i inside while loop
  // (or write own random function where can fix seed)

  timerDate = new Date();
  timerStart = timerDate.getTime();
  // // console.log('timerStart = ' + timerStart);
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
      // console.log('in function fGetKeys, no GCD found');
      break;
    }
  } // END of while loop

  let e = ep[i];

  timerDate = new Date();
  timerEnd = timerDate.getTime();
  // // console.log('timerEnd = ' + timerEnd);
  timerElapsed = timerEnd - timerStart;
  // console.log('TIME (ms) to get GCD = ' + timerElapsed);

  // console.log('GCD e = ' + e);

  timerDate = new Date();
  timerStart = timerDate.getTime();
  // // console.log('timerStart = ' + timerStart);
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
  // // console.log('timerEnd = ' + timerEnd);
  timerElapsed = timerEnd - timerStart;
  // console.log('TIME (ms) to get MOD INVERSE d = ' + timerElapsed);

  tm = e*d % phi; // check
  // console.log('d = ' + d + ', check e*d % phi = 1 ?=? ' + tm);

  let pk = [n,e]; // public key
  let sk = [n,d]; // private (secret) key

  // console.log('pk = ' + pk);
  // console.log('sk = ' + sk);

  // update display
  document.getElementById('field_public_key_0').innerHTML = pk[0];
  document.getElementById('field_public_key_1').innerHTML = pk[1];
  document.getElementById('field_private_key_0').innerHTML = sk[0];
  document.getElementById('field_private_key_1').innerHTML = sk[1];

  document.getElementById('field_n_value').innerHTML = n;
  document.getElementById('field_phi_value').innerHTML = phi;
  document.getElementById('field_n_message_max').innerHTML = n;

  document.getElementById('field_encoded_message').innerHTML = '';
  document.getElementById('field_encoded_message_hex').innerHTML = '';
  document.getElementById('field_decoded_message').innerHTML = '';

} // END of function fGetKeys

function fEncode() {
  // uses function fModExp()
  let pk0 = document.getElementById('field_public_key_0').innerHTML;
  let pk1 = document.getElementById('field_public_key_1').innerHTML;
  let pk = [];
  pk[0] = Number(pk0); // convert string to number
  pk[1] = Number(pk1);
  // console.log('in fEncode, pk = ' + pk);
  let mf = document.getElementById('input_field_enter_numeric_message');
  let m = mf.value;
  let c = fModExp(m,pk);
  // console.log('in fEncode, c = ' + c);
  chex = c.toString(16); // toString(16) base 16, means return hex
  document.getElementById('field_encoded_message').innerHTML = c;
  document.getElementById('field_encoded_message_hex').innerHTML = chex;
  document.getElementById('field_decoded_message').innerHTML = '';
} // END of function fEncode

function fDecode() {
  // uses function fModExp()
  let sk0 = document.getElementById('field_private_key_0').innerHTML;
  let sk1 = document.getElementById('field_private_key_1').innerHTML;
  let sk = [];
  sk[0] = Number(sk0); // convert string to number
  sk[1] = Number(sk1);
  // console.log('in fDecode, sk = ' + sk);
  let cf = document.getElementById('field_encoded_message').innerHTML;
  let c = Number(cf);
  let m = fModExp(c,sk);
  // console.log('in fDecode, m = ' + m);
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

function fModExp(m,key) {
  //
  // return r = m**key[1] % key[0], where ** is exponentiate and % is mod
  // using modular exponentiation

  // console.log('enter function fModExp');
  // console.log('m = ' + m);
  // console.log('key[0] = ' + key[0]);
  // console.log('key[1] = ' + key[1]);

  // convert key[2] to binary char array
  // so we know which terms we will need in modular exponentiation below
  let b = key[1].toString(2); // toString(2) base 2, means return binary

  // get results in array p of successive squares of m mod key[0]
  let p = [m];
  for (i = 1; i < b.length; i++) {
    p[i] = p[i-1]**2 % key[0];
  }

  // console.log('length b = ' + b.length);
  // console.log('b = ' + b);
  // console.log('length p = ' + p.length);
  // console.log('p = ' + p);

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
  // console.log('end function fModExp, r = ' + r);
  return r;
} // END of function fModExp

function fGetPrimes(n) {
  // thanks to
  // https://www.geeksforgeeks.org/new-algorithm-to-generate-prime-numbers-from-1-to-nth-number/ 

  let count = 0; // count the primes

  let arr1 = new Array(n+1); // after this, can access indexes 0 to n
  let arr2 = new Array(n+1);

  // // arrayName.fill(value,startIndex,end);
  // arr1.fill(0,0,n+1); // after this, can access indexes 0 to n
  // arr2.fill(1,0,n+1);
  // inputs start and end are optional
  // default is start = startIndex = 0, end at length of array
  arr1.fill(0);
  arr2.fill(1);

  // 2 and 3 are primes
  arr1[2] = arr1[3] = 1;
  // arr2 are all 1's at this point

  // Update arr1[] to mark all the primes
  let d = 5;
  while (d <= n) {
    arr1[d] = 1;
    arr1[d+2] = 1;
    d += 6;
  }

  // Update arr2[] to mark all pseudo primes
  let i;
  let j;
  let temp1;
  let temp2;
  let temp3;
  let temp4;
  let flag;
  for(i = 5; i*i <= n; i += 6) {
    j = 0;
    while (1) {
      flag = 0;

      // Eqn 1
      temp1 = 6 * i * (j + 1) + i;
      // Equation 2
      temp2 = ((6 * i * j) + i * i);
      // Equation 3
      temp3 = ((6 * (i + 2) * j)
              + ((i + 2) * (i + 2)));
      // Equation 4
      temp4 = ((6 * (i + 2) * (j + 1))
              + ((i + 2) * (i + 2)) - 2 * (i + 2));

      // If obtained pseudo prime number <=n then its
      // corresponding index in arr2 is set to 0

      // Result of equation 1
      if (temp1 <= n) {
        arr2[temp1] = 0;
      }
      else {
        flag++;
      }

      // Result of equation 2
      if (temp2 <= n) {
        arr2[temp2] = 0;
      }
      else {
        flag++;
      }

      // Result of equation 3
      if (temp3 <= n) {
        arr2[temp3] = 0;
      }
      else {
        flag++;
      }

      // Result of equation 4
      if (temp4 <= n) {
        arr2[temp4] = 0;
      }
      else {
        flag++;
      }

      if (flag == 4) {
        break;
      }
      j++;
    } // END of while(1)
  } // END if for loop

  let aPrimes = []; // collect the prime values

  // // OPTIONAL - include 2 - but don't want 2 for current purposes
  // if (n >= 2) {
  //     count++;
  //     aPrimes.push(2);
  // }

  // Include 3
  if (n >= 3) {
      count++;
      aPrimes.push(3);
  }

  // If arr1[i] = 1 && arr2[i] = 1 then i is prime number
  // i.e. it is a prime which is not a pseudo prime
  for (let p = 5; p <= n; p = p + 6) {
    if (arr2[p] == 1 && arr1[p] == 1) {
      count++;
      aPrimes.push(p);
    }
    if (arr2[p + 2] == 1 && arr1[p + 2] == 1) {
      count++;
      aPrimes.push(p+2);
    }
  }

  console.log('fGetPrimes count = ' + count);
  // console.log('aPrimes = ' + aPrimes);

  return aPrimes;
} // END of function fGetPrimes

function fGetPrimesInRange(min, max) {
  // WARNING: input min must be a prime number!!!
  // used by fGetRandomPQ()
  // uses function fNextPrime()
  // thanks to vitaly-t on stackoverflow
  // // console.log('enter function primes');
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
} // END of function fGetPrimesInRange

function fNextPrime(value) {
  // WARNING: input value must be a prime number!!!
  // used by function fGetPrimesInRange()
  // thanks to vitaly-t on stackoverflow
  // // console.log('enter function fNextPrime');
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
