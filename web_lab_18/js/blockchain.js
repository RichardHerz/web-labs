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
    data['version'] = new Object();
    data['version'] = 'TedTok_01';
    data['target'] = new Object();
    data['target'] = '3';
    data['header'] = new Object();
    data['header'] = '';
    data['people'] = new Object();
    data['people'][0] = 'Priya';
    data['people'][1] = 'Tinashe';
    data['people'][2] = 'Lily';
    data['people'][3] = 'Zahra';
    data['people'][4] = 'Bob';
    data['address'] = new Object();
    data['address'][0] = '8fca7b9ab6fac411b2443c1303d3bc56';
    data['address'][1] = 'f157bab61715d2bca9d81ada45bad57c';
    data['address'][2] = '263f99c540f4168132cc5fee5726b5ce';
    data['address'][3] = 'bf61f561918f37cf441fb8a6a1094b7a';
    data['address'][4] = '9412daed1e0bd204f652677a80192ea9';
    data['balance'] = new Object();
    // starting balances after genesis block
    data['balance'][0] = '50';
    data['balance'][1] = '50';
    data['balance'][2] = '50';
    data['balance'][3] = '50';
    data['balance'][4] = '50';
    data['transaction'] = new Object();
    data['transaction']['numPending'] = 0; // number of pending transactions
    data['transaction']['pendingList'] = ''; // actual list of pending trans
    // data['transaction'][0] etc. hold pending trans hashes for Merkle tree
    // do not use keys to get number trans because old ones not removed
    data['block'] = new Object();
    data['block']['reward'] = 0.99;
    data['block']['number'] = 0;
    data['block']['previous'] = '00000000000000000000000000000000'; // 32 zeros
  } // END of function data.initialize()
} // END of object data

function updateBody() {
  // called in body tag onload so can alter HTML elements
  updatePeople();
  updateSelectMenus();
  updateChainHeader();
  updateChainGenesis();
}

function updatePeople() {
  // called by updateBody() and addTransToPending()
  let tText = '';
  let ol = Object.keys(data['people']);
  let len = ol.length
  for (let i=0; i<len; i++) {
    tText += data['people'][i] + '<br>';
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

function updateChainHeader() {
  // called by updateBody() and updateChain()
  let el = document.getElementById('div_TEXTDIV_blockchain_header');
  el.innerHTML = ''; // clear any old before filling
  let tText = '';
  let ol = Object.keys(data['people']);
  let len = ol.length
  for (let i=0; i<len; i++) {
    tText += 'Address: ' + data['address'][i] + '<br>';
    tText += 'Balance: ' + data['balance'][i] + '<br>';
    if (i < len-1) {tText += '------------------------ <br>';}
  }
  el.innerHTML = tText;
} // END of function updateChainHeader

function updateChainGenesis() {

  let el = document.getElementById('div_TEXTDIV_blockchain_body');
  el.html = ''; // clear any old before filling

  // DO GENESIS TRANSACTIONS 1st - NEED HASHES FOR MERKLE ROOT & BLOCK HASH
  let tTrans ='';
  let tHash = '';
  let sep = '------------------------ <br>';
  let p = Object.keys(data['people']);
  let np = p.length
  for (let i=0; i<np; i++) {
    tTrans += 'To: ' + data['address'][i] + '<br>';
    tTrans += "Amount: " + data['balance'][i] + "<br>";
    tHash = fMD2(tTrans);
    data['transaction'][i] = tHash; // save, need for Merkle tree
    tTrans += "Hash: " + tHash + '<br>';
    if (i < np-1) {tTrans += sep;}
  }

  let theader = 'Version: ' + data['version'] + '<br>';
  theader += 'Block number: ' + data['block']['number'] + '<br>';
  theader += 'Previous hash: ' + data['block']['previous'] + '<br>';
  // get Merkle root
  data['transaction']['numPending'] = np;
  let mr = getMerkleRoot();
  // xxx better to pass ['numPending'] to getMerkleRoot as param...
  // xxx so don't have to remember to reset to zero below
  theader += 'Merkle root: ' + mr + '<br>';
  // data['header'] = theader;

  // MINE GENESIS BLOCK TO GET HASH
  let ttarget = data['target'];
  let result = fMiner(theader,ttarget);
  let newDate = result[0];
  let newNonce = result[1];
  let newHash = result[2];
  theader += 'Date: ' + newDate + '<br>';
  theader += 'Target: ' + ttarget + '<br>';
  theader += 'Nonce: ' + newNonce + '<br>';
  theader += 'Hash: ' + newHash + '<br>';
  theader += sep;
  data['block']['previous'] = newHash;

  let tText = '';
  tText += theader;
  tText += 'Number transactions: ' + np + '<br>';
  tText += sep;
  tText += tTrans;
  tText += '======================== <br>';
  tText += '======================== <br>';

  el.innerHTML = tText;

  // xxx reset numPending to zero for use after genesis block
  data['transaction']['numPending'] = 0;

} // END of updateChainGenesis

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
  if ((tAmount > 0) && (tAmount <= tAmountAvailable)) {
    console.log('has sufficient funds');
    tFlag2 = 1;
  } else {
    console.log('NOT sufficient funds or zero');
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
  // xxx for now, numPending is without miner's block reward
  let p = data['transaction']['numPending'];
  p += 1;
  data['transaction']['numPending'] = p;
  // SAVE HASH FOR MERKLE TREE IN PENDING BLOCK
  // xxx was data['transaction'][p-1] but save [0] for miner's block reward
  data['transaction'][p] = tHash;
  console.log('new hash of verified trans = ' + data['transaction'][p-1]);

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

// function buildBlock() {
//
//   // XXX HAVE TO PREVENT THIS RUNNING AGAIN BEFORE
//   // XXX IT HAS BEEN VERIFIED AND ADDED TO BLOCKCHAIN
//
//   // BLOCK HEADER CONTENTS
//   // ---
//   // version
//   // previous hash
//   // merkle root: pending
//   // time: pending (when miner starts the mining)
//   // target: 3
//   // nonce: pending
//   // Hash : pending
//   // ---
//   // TRANSACTIONS
//   // ---
//   // Number transactions: including miner reward
//   // ---
//   // Miner reward to: pending
//   // Amount: 0.99
//   // Hash: pending
//   // ---
//   // List of other transactions
//
//   console.log('enter buildBlock');
//
//   let el = document.getElementById('div_TEXTDIV_provisional_block');
//   let elcont = el.innerHTML;
//   elcont = Number(elcont);
//
//   let elcontlen = elcont.length;
//   console.log('elcontlen = ' + elcontlen + ', elcont = ' + elcont);
//
//   if (elcont !== 0) {
//     console.log('block still pending, can not build new block, exit buildBlock');
//     return;
//   }
//
//   if (data['transaction']['numPending'] == 0) {
//     console.log('no transactions, exit buildBlock');
//     return;
//   }
//
//   // select random user as miner
//   let p = Object.keys(data['people']);
//   let np = p.length;
//   let minerIndex = Math.floor(Math.random() * np); // returns a random integer from 0 to np-1
//   let coinbase = "";
//   coinbase += "Miner reward to: " + data['address'][minerIndex] + "<br>";
//   coinbase += "Amount: " + data['block']['reward'] + "<br>";
//   let cbhash = fMD2(coinbase);
//   data['transaction'][0] = cbhash;
//   data['transaction']['numPending'] += 1;
//   coinbase += 'ID: ' + cbhash + '<br>';
//
//   // GET MERKLE ROOT OF TRANSACTIONS
//   console.log("data['transaction'][0] = " + data['transaction'][0]);
//   let merkleRoot = getMerkleRoot();
//   console.log('merkleRoot = ' + merkleRoot);
//   console.log("root ?= data..[0] = " + data['transaction'][0]);
//
//   // UPDATE BLOCK NUMBER
//   let bc = data['block']['number'];
//   bc += 1;
//   data['block']['number'] = bc;
//
//   let tHeader = 'Version: ' + data['version'] + '<br>';
//   tHeader += 'Block number: ' + bc + '<br>';
//   tHeader += 'Previous hash: ' + data['block']['previous'] + '<br>';
//   tHeader += 'Number transactions: ' + data['transaction']['numPending'] + '<br>';
//   tHeader += 'Merkle root: ' + merkleRoot + '<br>';
//   let d = new Date(); // or let d = Date.now() for ms since Jan 1, 1970
//   tHeader += 'Date: ' + d + '<br>';
//   tHeader += 'Target: ' + data['target'] + '<br>';
//   data['header'] = tHeader;
//
//   // WRAP UP
//   el = document.getElementById('div_TEXTDIV_provisional_block');
//   let el2 = document.getElementById('div_TEXTDIV_transactions_pending');
//   let ttrans = el2.innerHTML;
//   let sep = '---------------------------<br>';
//   el.innerHTML = tHeader + sep + coinbase + sep + ttrans;
//   data['transaction']['pendingList'] = ttrans;
//   data['transaction']['numPending'] = 0;
//   el2.innerHTML = '';
//
//   console.log('exit buildBlock');
// } // END of function buildBlock

function buildBlock() {

  // XXX HAVE TO PREVENT THIS RUNNING AGAIN BEFORE
  // XXX IT HAS BEEN VERIFIED AND ADDED TO BLOCKCHAIN

  // BLOCK HEADER CONTENTS
  // ---
  // version
  // previous hash
  // merkle root: pending
  // time: pending (when miner starts the mining)
  // target: 3
  // nonce: pending
  // Hash : pending
  // ---
  // TRANSACTIONS
  // ---
  // Number transactions: including miner reward
  // ---
  // Miner reward to: pending
  // Amount: 0.99
  // Hash: pending
  // ---
  // List of other transactions

  console.log('enter buildBlock');

  let el = document.getElementById('div_TEXTDIV_provisional_block');
  let elcont = el.innerHTML;
  elcont = Number(elcont);

  let elcontlen = elcont.length;
  console.log('elcontlen = ' + elcontlen + ', elcont = ' + elcont);

  if (elcont !== 0) {
    console.log('block still pending, can not build new block, exit buildBlock');
    return;
  }

  if (data['transaction']['numPending'] == 0) {
    console.log('no transactions, exit buildBlock');
    return;
  }

  // UPDATE BLOCK NUMBER
  let bc = data['block']['number'];
  bc += 1;
  data['block']['number'] = bc;

  let sep = '---------------------------<br>';
  let tHeader = 'Version: ' + data['version'] + '<br>';
  tHeader += 'Block number: ' + bc + '<br>';
  tHeader += 'Previous hash: ' + data['block']['previous'] + '<br>';
  tHeader += 'Merkle root: pending <br>';
  tHeader += 'Date: pending <br>';
  tHeader += 'Target: ' + data['target'] + '<br>';
  tHeader += 'Nonce: pending <br>';
  tHeader += 'Hash: pending <br>';
  tHeader += sep;
  let np = 1 + data['transaction']['numPending']; // add 1 for miner's reward
  tHeader += 'Number transactions: ' + data['transaction']['numPending'] + '<br>';
  tHeader += sep;
  tHeader += 'Miner reward to: pending <br>';
  tHeader += 'Amount: pending <br>';
  tHeader += 'Hash: pending <br>';
  tHeader += sep;
  // WRAP UP
  el = document.getElementById('div_TEXTDIV_provisional_block');
  let el2 = document.getElementById('div_TEXTDIV_transactions_pending');
  let ttrans = el2.innerHTML;

  el.innerHTML = tHeader + ttrans;
  data['transaction']['pendingList'] = ttrans;
  data['transaction']['numPending'] = 0;
  el2.innerHTML = '';

  console.log('exit buildBlock');
} // END of function buildBlock

function getMerkleRoot() {
  // Merkle root of transaction hashes included in block header
  //   because only block header hash sent to next block in chain
  //   so Merkle root in block header hash can verify tansactions not changed
  // data['transaction'][0] etc. hold pending transaction hashes for Merkle tree
  //
  // WARNING: once this is called, data['transaction'][0] holds Merkle root
  //          and other [i] hold intermediate values...
  //
  // COULD UPDATE by operating on a copy of data['transaction'][0] etc.
  //
  let pm = data['transaction']['numPending'];
  console.log('enter getMerkleRoot, pm = ' + pm);
  if (pm > 0) {
    // smells like something could do recursively...
    while (pm >= 1) {
      for (i = 0; i < pm; i += 2) {
        console.log('enter for, pm = ' + pm);
        if (i == pm-1) {
          // i lands on pm-1 only when pm is odd
          // hash i + i
          data['transaction'][i] = fMD2(data['transaction'][i] + data['transaction'][i]);
        } else {
          // hash i + i
          data['transaction'][i] = fMD2(data['transaction'][i] + data['transaction'][i]);
        } // END of if (i == pm-1)
        // update pm
        if (pm == 1) {
          // done, so this will end repeats and return
          pm = 0;
          console.log('set pm = 0');
        } else if ((pm % 2) == 0) {
          // pm is even
          pm = pm/2;
        } else {
          // pm is odd and > 1
          pm = (pm + 1)/2;
        } // END of if (pm == 1)
      } // END of for (i = 0; i < pm; i += 2)
    } // END of while (pm >= 2)
    // merkle root is in data['transaction'][0]
    return data['transaction'][0];
  } else {
    return -99;
  } // END of if (pm > 0)
} // END of function getMerkleRoot

function mineBlock() {

  let el = document.getElementById('div_TEXTDIV_mined_block');
  let elcont = el.innerHTML;
  elcont = Number(elcont);

  let elcontlen = elcont.length;
  console.log('elcontlen = ' + elcontlen + ', elcont = ' + elcont);

  if (elcont !== 0) {
    console.log('mined block still pending, can not build new block, exit mineBlock');
    return;
  }

  let theader = data['header'];
  let ttarget = data['target'];
  let result = fMiner(theader,ttarget);
  let newHeader = result[0];
  let newHash = result[1];
  newHeader += '<br>Hash: ' + newHash + '<br>';
  newHeader += '---------------------------<br>';

  // NOTE: block number already updated in buildBlock
  // save hash for next block
  data['block']['previous'] = newHash;
  console.log("data['block']['previous']" + newHash);

  let pending = data['transaction']['pendingList'];

  el = document.getElementById('div_TEXTDIV_mined_block');
  el.innerHTML = newHeader + pending;

  el = document.getElementById('div_TEXTDIV_provisional_block');
  el.innerHTML = '';

} // END of function mineBlock

function updateChain() {
  updateChainHeader();
  // we are going to pre-pend the new mined block
  let el = document.getElementById('div_TEXTDIV_mined_block');
  let tText = el.innerHTML;
  el.innerHTML = ''; // clear mined block display
  el = document.getElementById('div_TEXTDIV_blockchain_body');
  tText += el.innerHTML;
  el.innerHTML = tText;
} // END of function updateCthain
