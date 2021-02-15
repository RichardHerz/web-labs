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
    // WARNING: the total number of coins listed here may be stated in About text
    data['balance'][0] = '10';
    data['balance'][1] = '10';
    data['balance'][2] = '10';
    data['balance'][3] = '10';
    data['balance'][4] = '10';
    data['transaction'] = new Object();
    data['transaction']['numPending'] = 0; // number of pending transactions
    data['transaction']['pendingList'] = ''; // actual list of pending trans
    // data['transaction'][0] etc. hold pending trans hashes for Merkle tree
    // do not use keys to get number trans because old ones not removed
    data['block'] = new Object();
    data['block']['reward'] = 0.99;
    data['block']['number'] = 0;
    data['block']['previous'] = '00000000000000000000000000000000'; // 32 zeros
    data['sep'] = new Object();
    data['sep'][0] = '<span style="color:magenta;">----------------------</span><br>';
    data['sep'][1] = '<span style="color:blue;">============================================</span><br>';
    data['minedBlock'] = new Object;
    data['minedBlock'] = '';
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
  // called by updateBody(), addTransToPending(), updateChain()
  let tText = '';
  let ol = Object.keys(data['people']);
  let len = ol.length
  for (let i=0; i<len; i++) {
    tText += data['people'][i] + '<br>';
    tText += 'Address: ' + data['address'][i] + '<br>';
    tText += 'Balance: ' + data['balance'][i] + '<br>';
    if (i < len-1) {
      tText += data['sep'][0];
    }
  }
  el = document.getElementById('div_TEXTDIV_people');
  el.innerHTML = tText;
}

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
    if (i < len-1) {tText += data['sep'][0];}
  }
  el.innerHTML = tText;
} // END of function updateChainHeader

function updateChainGenesis() {

  let el = document.getElementById('div_TEXTDIV_blockchain_body');
  el.html = ''; // clear any old before filling

  // DO GENESIS TRANSACTIONS 1st - NEED HASHES FOR MERKLE ROOT & BLOCK HASH
  let tTrans ='';
  let tHash = '';
  let p = Object.keys(data['people']);
  let np = p.length
  for (let i=0; i<np; i++) {
    tTrans += 'To: ' + data['address'][i] + '<br>';
    tTrans += "Amount: " + data['balance'][i] + "<br>";
    tHash = fMD2(tTrans);
    data['transaction'][i] = tHash; // save, need for Merkle tree
    tTrans += "Hash: " + tHash + '<br>';
    if (i < np-1) {tTrans += data['sep'][0];}
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
  let result = fBlockMiner(theader,ttarget);
  let newDate = result[0];
  let newNonce = result[1];
  let newHash = result[2];
  theader += 'Date: ' + newDate + '<br>';
  theader += 'Target: ' + ttarget + '<br>';
  theader += 'Nonce: ' + newNonce + '<br>';
  theader += 'Hash: ' + newHash + '<br>';
  theader += data['sep'][0];
  data['block']['previous'] = newHash;

  let tText = '';
  tText += theader;
  tText += 'Number transactions: ' + np + '<br>';
  tText += data['sep'][0];
  tText += tTrans;
  tText += data['sep'][1];

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

  let newText = '';
  newText += 'From: ' + tFrom + '<br>';
  newText += 'To: ' + tTo + '<br>';
  newText += 'Amount: ' + pAmt + '<br>';
  let d = new Date(); // or let d = Date.now() for ms since Jan 1, 1970
  newText += 'Date: ' + d + '<br>';
  let tHash = fMD2(newText);
  newText += 'Hash: ' + tHash + '<br>';

  if (data['transaction']['numPending'] != 0) {
    newText += '----------------------' + '<br>';
  }

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
  let np = data['transaction']['numPending'];
  np += 1;
  data['transaction']['numPending'] = np;
  console.log('addTransToPending, np after increment = ' + np);
  // SAVE HASH FOR MERKLE TREE IN PENDING BLOCK
  data['transaction'][np] = tHash; //save [0] for miner's block reward
  console.log('new hash of verified trans = ' + data['transaction'][np-1]);

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

  // XXX HAVE TO PREVENT THIS RUNNING AGAIN BEFORE
  // XXX IT HAS BEEN VERIFIED AND ADDED TO BLOCKCHAIN

  // BLOCK HEADER CONTENTS
  // ---
  // version
  // previous hash
  // merkle root: PENDING
  // time: pending (when miner starts the mining)
  // target: 3
  // nonce: PENDING
  // Hash : PENDING
  // ---
  // TRANSACTIONS
  // ---
  // Number transactions: including miner reward
  // ---
  // Miner reward to: PENDING
  // Amount: 0.99
  // Hash: PENDING
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

  if (data['transaction']['numPending'] < 2) {
    console.log('not minimum 2 transactions, exit buildBlock');
    return;
  }

  // UPDATE BLOCK NUMBER
  let bc = data['block']['number'];
  bc += 1;
  data['block']['number'] = bc;

  let pendcolor = '<span style="color:blue;">pending</span> <br>';
  let tHeader = 'Version: ' + data['version'] + '<br>';
  tHeader += 'Block number: ' + bc + '<br>';
  tHeader += 'Previous hash: ' + data['block']['previous'] + '<br>';
  tHeader += 'Merkle root: ' + pendcolor;
  tHeader += 'Date: ' + pendcolor;
  tHeader += 'Target: ' + data['target'] + '<br>';
  tHeader += 'Nonce: ' + pendcolor;
  tHeader += 'Hash: ' + pendcolor;
  tHeader += data['sep'][0];
  let np = 1 + data['transaction']['numPending']; // add 1 for miner's reward
  tHeader += 'Number transactions: ' + np + '<br>';
  tHeader += data['sep'][0];
  tHeader += 'Miner reward to: ' + pendcolor;
  tHeader += 'Amount: ' + data['block']['reward'] + '<br>';
  tHeader += 'Hash: ' + pendcolor;
  tHeader += data['sep'][0];
  // WRAP UP
  el = document.getElementById('div_TEXTDIV_provisional_block');
  let el2 = document.getElementById('div_TEXTDIV_transactions_pending');
  let ttrans = el2.innerHTML;

  el.innerHTML = tHeader + ttrans;
  data['transaction']['pendingList'] = ttrans;
  el2.innerHTML = '';

  console.log('exit buildBlock');
} // END of function buildBlock

function getMerkleRoot() {
  //
  // USES data['transaction']['numPending']
  // USES data['transaction'][i]
  //
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
  let np = data['transaction']['numPending'];
  console.log('enter getMerkleRoot, np = ' + np);
  if (np > 0) {
    // smells like something could do recursively...
    while (np >= 1) {
      for (i = 0; i < np; i += 2) {
        console.log('enter for, np = ' + np);
        if (i == np-1) {
          // i lands on np-1 only when np is odd
          // hash i + i
          data['transaction'][i] = fMD2(data['transaction'][i] + data['transaction'][i]);
        } else {
          // hash i + i
          data['transaction'][i] = fMD2(data['transaction'][i] + data['transaction'][i]);
        } // END of if (i == np-1)
        // update np
        if (np == 1) {
          // done, so this will end repeats and return
          np = 0;
          console.log('set np = 0');
        } else if ((np % 2) == 0) {
          // np is even
          np = np/2;
        } else {
          // np is odd and > 1
          np = (np + 1)/2;
        } // END of if (np == 1)
      } // END of for (i = 0; i < np; i += 2)
    } // END of while (np >= 2)
    // merkle root is in data['transaction'][0]
    return data['transaction'][0];
  } else {
    return -99;
  } // END of if (np > 0)
} // END of function getMerkleRoot

function mineBlock() {
  // called by HTML input button id="button_mine_block"
  // calls function fBlockMiner, which is in another JS file

  // CHECK TO MAKE SURE OK TO RUN THIS FUNCTION
  let el = document.getElementById('div_TEXTDIV_mined_block');
  let elcont = el.innerHTML;
  elcont = Number(elcont);
  let elcontlen = elcont.length;
  console.log('elcontlen = ' + elcontlen + ', elcont = ' + elcont);
  if (elcont !== 0) {
    console.log('mined block still pending, can not build new block, exit mineBlock');
    return;
  }

  // REBUILD HEADER, NOW WITH MERKLE ROOT & DATE
  let theader = 'Version: ' + data['version'] + '<br>';
  theader += 'Block number: ' + data['block']['number'] + '<br>';
  theader += 'Previous hash: ' + data['block']['previous'] + '<br>';

  // save b&w, no color version for adding to final blockchain
  let bwHeader = theader;

  // ADD MINER REWARD TRANSACTION BEFORE MERKLE HASHING
  // pick random user as miner
  let p = Object.keys(data['people']);
  let np = p.length
  let minerIndex = Math.floor(Math.random() * np); // random 0 to np-1
  let treward = 'Miner reward to: <span style="color:blue;">' + data['address'][minerIndex] + '</span><br>';
  treward += 'Amount: ' + data['block']['reward'] + '<br>';
  let minerHash = fMD2(treward);
  treward += 'Hash: <span style="color:blue;">' + minerHash + '</span><br>';
  treward += data['sep'][0];
  console.log('mineBlock, treward = ' + treward);
  //save minerHash so getMerkleRoot can use it
  data['transaction'][0] = minerHash;

  // save b&w, no color version for adding to final blockchain
  let bwReward = 'Miner reward to: ' + data['address'][minerIndex] + '<br>';
  bwReward += 'Amount: ' + data['block']['reward'] + '<br>';
  bwReward += 'Hash: ' + minerHash + '<br>';


  // ADD MINER REWARD TO MINER'S BALANCE
  let ttarget = data['target'];
  let tb = data['balance'][minerIndex];
  let br = data['block']['reward'];
  tb = Number(tb);
  br = Number(br);
  tb = tb + br;
  data['balance'][minerIndex] = tb;

  // get Merkle root
  // xxx for now, temporarily change numPending...
  np = data['transaction']['numPending']; // np declared above
  console.log('mineBlock, original np = ' + np);
  np += 1;
  console.log('mineBlock, incremented np = ' + np);
  data['transaction']['numPending'] = np; // use below before clearing at end
  let mr = getMerkleRoot();
  // xxx better to pass ['numPending'] to getMerkleRoot as param...
  theader += 'Merkle root: <span style="color:blue;">' + mr + '</span><br>';

  // MINE BLOCK TO GET HASH
  let result = fBlockMiner(theader,ttarget);
  let newDate = result[0];
  let newNonce = result[1];
  let newHash = result[2];
  theader += 'Date: <span style="color:blue;">' + newDate + '</span><br>';
  theader += 'Target: ' + ttarget + '<br>';
  theader += 'Nonce: <span style="color:blue;">' + newNonce + '</span><br>';
  theader += 'Hash: <span style="color:blue;">' + newHash + '</span><br>';
  theader += data['sep'][0];
  data['block']['previous'] = newHash;

  bwHeader += 'Merkle root: ' + mr + '<br>';
  bwHeader += 'Date: ' + newDate + '<br>';
  bwHeader += 'Target: ' + ttarget + '<br>';
  bwHeader += 'Nonce: ' + newNonce + '<br>';
  bwHeader += 'Hash: ' + newHash + '<br>';
  bwHeader += data['sep'][0];

  let tText = '';
  tText += theader;
  console.log('mineBlock, tText incremented np = ' + np);
  tText += 'Number transactions: ' + np + '<br>';
  tText += data['sep'][0];
  // append block reward
  console.log('before append block reward');
  console.log('tText = ' + tText);
  console.log('treward = ' + treward);
  tText += treward;
  console.log('after append block reward');
  console.log('tText = ' + tText);
  tText += data['transaction']['pendingList'];
  console.log("after append data['transaction']['pendingList']");
  console.log('tText = ' + tText);
  tText += data['sep'][1]; // =====

  console.log('minBlock, before el.innerHTML = tText;');
  console.log('tText = ' + tText);
  el.innerHTML = tText;

  //save b&w no color version for final blockchain
  let bwText = '';
  bwText += bwHeader;
  bwText += 'Number transactions: ' + np + '<br>';
  bwText += data['sep'][0];
  bwText += bwReward;
  bwText += data['sep'][0]; // =====
  bwText += data['transaction']['pendingList'];
  bwText += data['sep'][1]; // =====
  data['minedBlock'] = bwText;

  // NOTE: block number already updated in buildBlock
  // save hash for next block
  data['block']['previous'] = newHash;
  console.log("data['block']['previous']" + newHash);

  // // ** LEAVE IT FOR NOW SO USER CAN SEE WHAT IS NEW **
  // // ** CLEAR WHEN MINED BLOCK ADDED TO CHAIN **
  // // CLEAR PROVISIONAL BLOCK DISPLAY
  // el = document.getElementById('div_TEXTDIV_provisional_block');
  // el.innerHTML = '';

  // CLEAR NUMBER PENDING
  data['transaction']['numPending'] = 0;

} // END of function mineBlock

function updateChain() {
  updateChainHeader();
  updatePeople(); // to update balance for miner of this block
  // we are going to pre-pend the new mined block

  // add b&w no color version of mined block to blockchain
  let tText = data['minedBlock'];
  let el = document.getElementById('div_TEXTDIV_blockchain_body');
  tText += el.innerHTML;
  el.innerHTML = tText;

  // clear provisional block display, which was saved with color
  // highlights so user could compare provisional and mined blocks
  el = document.getElementById('div_TEXTDIV_provisional_block');
  el.innerHTML = '';

  // clear mined block display
  el = document.getElementById('div_TEXTDIV_mined_block');
  el.innerHTML = '';

} // END of function updateChain
