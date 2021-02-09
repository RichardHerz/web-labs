function openThisLab() {
  data.initialize();
  // WARNING: can only alter HTML if this function called by
  //          onload property in BODY TAG (not onload in page header)
  // let el = document.getElementById('div_TEXTDIV_transactions_pending');
  // el.innerHTML = data['people'][0];
}

let data = {
  initialize : function() {
    data['people'] = new Object();
    data['people'][0] = 'Priya';
    data['people'][1] = 'Tinashe';
    data['people'][2] = 'Chen';
    data['people'][3] = 'Zahra';
    data['people'][4] = 'Bob';
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
  } // END of function data.initialize()
} // END of object data

function transFrom(sel) {
  let tSel = Number(sel);
  let el = document.getElementById('div_TEXTDIV_transaction');
  let str = el.innerHTML;
  let startPos;
  let endPos;
  let newStr;
  if (tSel >= 0) {
    let newPerson = data['people'][tSel];
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
    let newPerson = data['people'][tSel];
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
