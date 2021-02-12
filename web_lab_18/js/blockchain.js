function openThisLab() {
  data.initialize();
  // WARNING: can only alter HTML if this function called by
  //          onload property in BODY TAG (not onload in page header)
}

let data = {
  // QUESTION: I apparently need the initialize method called by openThisLab
  //           in regular web labs but do I need it here?
  // ANSWER: Yes I do need initialize method: tried without it and doesn't work
  initialize : function() {
    data['people'] = new Object();
    data['people'][0] = 'Priya';
    data['people'][1] = 'Tinashe';
    data['people'][2] = 'Chen';
    data['people'][3] = 'Zahra';
    data['people'][4] = 'Bob';
    data['miner'] = new Object();
    data['miner'] = 1; // index of the one miner in group
    data['address'] = new Object();
    data['address'][0] = '8fca7b9ab6fac411b2443c1303d3bc56';
    data['address'][1] = 'f157bab61715d2bca9d81ada45bad57c';
    data['address'][2] = '263f99c540f4168132cc5fee5726b5ce';
    data['address'][3] = 'bf61f561918f37cf441fb8a6a1094b7a';
    data['address'][4] = '9412daed1e0bd204f652677a80192ea9';
    data['balance'] = new Object();
    data['balance'][0] = '50';
    data['balance'][1] = '50';
    data['balance'][2] = '50';
    data['balance'][3] = '50';
    data['balance'][4] = '50';
    data['transaction'] = new Object();
    data['transaction']['pending'] = 0; // # pending transactions
    data['transaction']['pendingMax'] = 4; // # needed for provisional block
    // data['transaction'][0] etc. hold pending trans hashes for Merkle tree
  } // END of function data.initialize()
} // END of object data

function updateBody() {
  // called in body tag onload so can alter HTML elements
  updatePeople();
  updateSelectMenus();
}

function updatePeople() {
  // called by updateBody() and addTransToPending()
  let minerIndex = data['miner'];
  let tText = '';
  let ol = Object.keys(data['people']);
  let len = ol.length
  for (let i=0; i<len; i++) {
    tText += data['people'][i];
    if (i == minerIndex) {tText += ' - Miner';}
    tText += '<br>';
    tText += 'Address: ' + data['address'][i] + '<br>';
    tText += 'Balance: ' + data['balance'][i] + '<br>';
    if (i < len-1) {tText += '------------------------ <br>';}
  }
  el = document.getElementById('div_TEXTDIV_people');
  el.innerHTML = tText;
} // END of function updatePeopleDiv

function updateSelectMenus(){
  // called by updateBody()
  let ol = Object.keys(data['people']);
  let len = ol.length
  let person;
  tText = '<option value="-1">Select...</option> <br>';
  for (let i=0; i<len; i++) {
    person = data['people'][i];
    tText += '<option value="' + i + '">' + person + '</option> <br>';
  }
  el = document.getElementById('select_From_menu');
  el.innerHTML = tText;
  el = document.getElementById('select_To_menu');
  el.innerHTML = tText;
} // END of function updateSelectMenus

function transFrom(sel) {
  let tSel = Number(sel);
  let el = document.getElementById('div_TEXTDIV_transaction');
  let str = el.innerHTML;
  let startPos;
  let endPos;
  let newStr;
  if (tSel >= 0) {
    let newPerson = data['address'][tSel];
    startPos = str.indexOf('From:');
    endPos = str.indexOf('<br>',startPos);
    let oldPerson = str.substring(startPos, endPos);
    newStr = str.replace(oldPerson, 'From: ' + newPerson);
    el.innerHTML = newStr;
  } else {
      startPos = str.indexOf('From:');
      endPos = str.indexOf('<br>',startPos);
      let oldPerson = str.substring(startPos, endPos);
      newStr = str.replace(oldPerson, 'From: ');
      el.innerHTML = newStr;
      el = document.getElementById('select_From_menu');
      el.value = '-1';
  } // END of if (tSel >= 0)
} // END of function transFrom

function transTo(sel) {
  let tSel = Number(sel);
  let el = document.getElementById('div_TEXTDIV_transaction');
  let str = el.innerHTML;
  let startPos;
  let endPos;
  let newStr;
  if (tSel >= 0) {
    let newPerson = data['address'][tSel];
    startPos = str.indexOf('To:');
    endPos = str.indexOf('<br>',startPos);
    let oldPerson = str.substring(startPos, endPos);
    newStr = str.replace(oldPerson, 'To: ' + newPerson);
    el.innerHTML = newStr;
  } else {
      startPos = str.indexOf('To:');
      endPos = str.indexOf('<br>',startPos);
      let oldPerson = str.substring(startPos, endPos);
      newStr = str.replace(oldPerson, 'To: ');
      el.innerHTML = newStr;
      el = document.getElementById('select_To_menu');
      el.value = '-1';
  } // END of if (tSel >= 0)
} // END of function transTo

function transAmount(amt) {
  let el = document.getElementById('div_TEXTDIV_transaction');
  let str = el.innerHTML;
  let startPos = str.indexOf('Amount:');
  let endPos = str.length - 1; // str.indexOf('<br>',startPos);
  let oldAmt = str.substring(startPos, endPos);
  let newStr = str.replace(oldAmt, 'Amount: ' + amt);
  el.innerHTML = newStr;
} // END of function transAmount

function transVerify() {
  // get info from inputs rather than display field
  //
  let el = document.getElementById('select_From_menu');
  let str = el.value;
  let tFromIndex = Number(str);
  let tFromAddress = data['address'][tFromIndex];
  //
  el = document.getElementById('select_To_menu');
  str = el.value;
  let tToIndex = Number(str);
  let tToAddress = data['address'][tToIndex];
  //
  el = document.getElementById('input_field_enter_amount');
  let tAmount = el.value;
  //
  // do some validation
  let tFlag1 = 0;
  let tFlag2 = 0;
  console.log('tFromAddress = ' + tFromAddress);
  console.log('tToAddress = ' + tToAddress);
  console.log('tAmount = ' + tAmount);
  if ( (tAmount > 0) & (tFromAddress != tToAddress) ) {
    console.log('OK transaction');
    tFlag1 = 1;
  } else {
    console.log('Fishy transaction');
  }
  // check if balance is sufficient
  let tAmountAvailable = data['balance'][tFromIndex];
  tAmountAvailable = Number(tAmountAvailable);
  if (tAmount <= tAmountAvailable) {
    console.log('has sufficient funds');
    tFlag2 = 1;
  } else {
    console.log('NOT sufficient funds');
  }

  if (tFlag1 & tFlag2) {
    addTransToPending(tFromIndex,tToIndex,tAmount);
  }

} // END of function transVerify

function addTransToPending(pFromIndex,pToIndex,pAmt) {

  // ADD TRANSACTION TO PENDING TRANSACTIONS
  let tFrom = data['address'][pFromIndex];
  let tTo = data['address'][pToIndex];
  let el = document.getElementById('div_TEXTDIV_transactions_pending');
  let oldText = el.innerHTML;
  let newText = 'From: ' + tFrom + '<br>';
  newText += 'To: ' + tTo + '<br>';
  newText += 'Amount: ' + pAmt + '<br>';
  let d = new Date(); // or let d = Date.now() for ms since Jan 1, 1970
  newText += 'Date: ' + d + '<br>';
  let tHash = fMD2(newText);
  newText += 'Hash: ' + tHash + '<br>';
  newText += '----------------------' + '<br>';
  el.innerHTML = newText + oldText;

  // UPDATE USER BALANCES IN data
  let fb = data['balance'][pFromIndex];
  fb = Number(fb);
  pAmt = Number(pAmt);
  fb -= pAmt;
  data['balance'][pFromIndex] = fb;
  let tb = data['balance'][pToIndex];
  tb = Number(tb);
  tb += pAmt;
  data['balance'][pToIndex] = tb;

  // UPDATE USER BALANCES IN WALLETS to fb, tb
  updatePeople();

  // UPDATE NUMBER TRANSACTIONS PENDING
  let p = data['transaction']['pending'];
  p += 1;
  // SAVE HASH FOR MERKLE TREE IN PENDING BLOCK
  data['transaction'][p-1] = tHash;
  console.log('new hash of verified trans = ' + data['transaction'][p-1]);
  if (p >= data['transaction']['pendingMax']) {
    // NOTIFY USER THEY CAN NOW BUILD PROVISIONAL BLOCK
  }

  // CLEAR TRANSACTION FIELD
  el = document.getElementById('div_TEXTDIV_transaction');
  newText = 'From: <br>';
  newText += 'To: <br>';
  newText += 'Amount: ';
  el.innerHTML = newText;

  // RESET TRANSACTION INPUTS
  el = document.getElementById('select_From_menu');
  el.value = -1;
  el = document.getElementById('select_To_menu');
  el.value = -1;
  el = document.getElementById('input_field_enter_amount');
  el.value = '';

} // END of function addTransToPending

function buildBlock() {
  // build provisional block
  // make Merkle tree and get root
  // create block header
  // append pending transaction field

  // MAKE MERKLE TREE and get root
  // assume number of transactions is data['transaction']['pendingMax']
  // and that is even number
  // do brute force for now
  let mt = [];
  mt[0] = fMD2(data['transaction'][0] + data['transaction'][1]);
  mt[1] = fMD2(data['transaction'][2] + data['transaction'][3]);
  mt[2] = fMD2(mt[0] + mt[1]);
  // mt[2] is Merkle root, at least for now
  console.log('mt[2] = ' + mt[2]);

}
