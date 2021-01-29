function fListPrimes() {

  let tText = "<p>";
  tText += "3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71";
  tText += "73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151";
  tText += "157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233";
  tText += "239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317";
  tText += "331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419";
  tText += "421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503";
  tText += "509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607";
  tText += "613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701";
  tText += "709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811";
  tText += "821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911";
  tText += "919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997";

  // terminate string that holds the data
  tText += "</p>";

  // for window.open, see http://www.w3schools.com/jsref/met_win_open.asp
  //
  // NOTE: window.open VERSION BELOW OPENS NEW POPUP WINDOW - MAY GET HIDDEN
  //       BEHIND FULL SCREEN BROWSER IF USER CLICKS ON PAGE BEFORE POPUP OPENS
  let dataWindow = window.open('', 'Primes',
        'height=600, left=20, resizable=1, scrollbars=1, top=40, width=600');
  //
  // NOTE: window.open VERSION BELOW OPENS NEW TAB IN SAME BROWSER WINDOW
  //       NEED TO ADD TOOLTIP TO BTN AND/OR TEXT OR LINK ON COPY DATA TAB...
  // let dataWindow = window.open('',
  //       'height=600, left=20, resizable=1, scrollbars=1, top=40, width=600');

  dataWindow.document.writeln('<html><head><title>Primes</title></head>' +
         '<body>' +
         tText +
         '</body></html>');
  dataWindow.document.close();
} // END of function fListPrimes

function fListGetKeys() {

  let tText = "<p>";
  tText += "function fGetKeys() { <br><br>";

  tText += "  let pf = document.getElementById('input_field_enter_p'); <br>";
  tText += "let qf = document.getElementById('input_field_enter_q'); <br>";
  tText += "let p = pf.value; <br>";
  tText += "let q = qf.value;  <br><br>";

  tText += "let n = p*q; <br>";
  tText += "let phi = (p-1)*(q-1); <br>";
  tText += "let ep = fPrimes(phi); <br><br>";

  tText += "// find a random value in primes that is coprime with phi <br>";
  tText += "// this produces different keys every run <br>";
  tText += "// if desire same key, let i = 1 or other start <br>";
  tText += "// then increment i inside while loop <br>";
  tText += "// (or write own random function where can fix seed) <br>";
  tText += "let eplen = ep.length; <br>";
  tText += "let j = 0; // counter so random pick loop won't run forever <br>";
  tText += "let jfac = 5; // factor * eplen to limit random pick loop to run <br>";
  tText += "let i = Math.floor(Math.random() * eplen); <br>";
  tText += "// let i = 1; <br>";
  tText += "while (fGCD_two_numbers(ep[i],phi) != 1) { <br>";
  tText += "&nbsp; &nbsp; i = Math.floor(Math.random() * eplen); <br>";
  tText += "&nbsp; &nbsp; // break out if don't find GCD within loop limit for random pick <br>";
  tText += "&nbsp; &nbsp; j++; <br>";
  tText += "&nbsp; &nbsp; if (j > jfac * eplen) { <br>";
  tText += "&nbsp; &nbsp; &nbsp; &nbsp; break; <br>";
  tText += "&nbsp; &nbsp; } <br>";
  tText += "} <br>";
  tText += "let e = ep[i]; <br><br>";

  tText += "// find modular inverse d of e such that mod(e*d,phi) = 1 <br>";
  tText += "// use brute force here but check out extended Euclidean algorithm <br>";
  tText += "// e.g., at 11:20 of https://youtu.be/Z8M2BTscoD4 <br>";
  tText += "let d = 1; // initialize <br>";
  tText += "while (Math.round(e*d % phi) != 1) { <br>";
  tText += "&nbsp; &nbsp; d++; <br>";
  tText += "} <br><br>";

  tText += "let pk = [n,e]; <br>";
  tText += "let sk = [n,d]; <br><br>";

  tText += "// update display <br>";
  tText += "document.getElementById('field_public_key_0').innerHTML = pk[0]; <br>";
  tText += "document.getElementById('field_public_key_1').innerHTML = pk[1]; <br>";
  tText += "document.getElementById('field_private_key_0').innerHTML = sk[0]; <br>";
  tText += "document.getElementById('field_private_key_1').innerHTML = sk[1]; <br><br>";

  tText += "document.getElementById('field_n_value').innerHTML = n; <br>";
  tText += "document.getElementById('field_phi_value').innerHTML = phi; <br>";
  tText += "document.getElementById('field_n_message_max').innerHTML = n; <br><br>";

  tText += "document.getElementById('field_encoded_message').innerHTML = ''<br>";
  tText += "document.getElementById('field_decoded_message').innerHTML = ''; <br><br>";

  tText += "} // END of function fGetKeys <br>";

  // terminate string that holds the data
  tText += "</p>";

  // for window.open, see http://www.w3schools.com/jsref/met_win_open.asp
  //
  // NOTE: window.open VERSION BELOW OPENS NEW POPUP WINDOW - MAY GET HIDDEN
  //       BEHIND FULL SCREEN BROWSER IF USER CLICKS ON PAGE BEFORE POPUP OPENS
  let dataWindow = window.open('', 'fGetKeys()',
        'height=600, left=20, resizable=1, scrollbars=1, top=40, width=600');
  //
  // NOTE: window.open VERSION BELOW OPENS NEW TAB IN SAME BROWSER WINDOW
  //       NEED TO ADD TOOLTIP TO BTN AND/OR TEXT OR LINK ON COPY DATA TAB...
  // let dataWindow = window.open('',
  //       'height=600, left=20, resizable=1, scrollbars=1, top=40, width=600');

  dataWindow.document.writeln('<html><head><title>fGetKeys()</title></head>' +
         '<body>' +
         tText +
         '</body></html>');
  dataWindow.document.close();

} // END of Function fListGetKeys
