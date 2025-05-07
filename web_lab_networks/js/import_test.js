'use strict';

function testme() {
    
// Method 1: direct array declaration
const fruitArray = ['apple', 'banana', 'orange', 'mango', 'pear'];

// Method 2: using split() on a comma-delimited string
const treeString = 'oak, maple, pine, birch, redwood, palm';
const treeArray = treeString.split(',').map(item => item.trim());

// Method 3: using split() with a one-line string
const fishArray = 'salmon,tuna,trout,cod,bass'.split(',');

// Test output
console.log('Fruits:', fruitArray);
console.log('Trees:', treeArray);
console.log('Fish:', fishArray);

// Create formatted string for popup
const popupMessage = 
  'new_Fruits: ' + fruitArray.join(', ') + '<br>' +
  'new_Trees: ' + treeArray.join(', ') + '<br>' +
  'new_Fish: ' + fishArray.join(', ');

// Split message into lines and create new arrays
const lines = popupMessage.split('<br>');
const new_Fruits = lines[0].replace('new_Fruits: ', '').split(', ');
const new_Trees = lines[1].replace('new_Trees: ', '').split(', ');
const new_Fish = lines[2].replace('new_Fish: ', '').split(', ');

// Test the new arrays
console.log('New Fruits:', new_Fruits);
console.log('New Trees:', new_Trees);
console.log('New Fish:', new_Fish);

// Function to get cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Try to get saved arrays from cookie
const savedArrays = getCookie('arrayData');
if (savedArrays) {
    const decodedData = decodeURIComponent(savedArrays);
    const cookieLines = decodedData.split('<br>');
    
    const cookie_Fruits = cookieLines[0].replace('new_Fruits: ', '').split(', ');
    const cookie_Trees = cookieLines[1].replace('new_Trees: ', '').split(', ');
    const cookie_Fish = cookieLines[2].replace('new_Fish: ', '').split(', ');

    console.log('Retrieved from cookie:');
    console.log('Cookie Fruits:', cookie_Fruits);
    console.log('Cookie Trees:', cookie_Trees);
    console.log('Cookie Fish:', cookie_Fish);
} else {
    console.log('No saved arrays found in cookie');
}

try {
    // Attempt to open popup window
    let dataWindow = window.open('', 'Copy data',
        'height=600, left=20, resizable=1, scrollbars=1, top=40, width=600');
    
    // Check if window was successfully created
    if (dataWindow === null) {
      console.error('Popup window was blocked. Please allow popups for this site.');
      alert('Please allow popups for this site to view the data.');
      return;
    }
  
    // Write content to window
    dataWindow.document.writeln('<html><head><title>Copy data</title></head>' +
         '<body>' +
         popupMessage +
         '</body></html>');
    dataWindow.document.close();

    // Set cookie with array data
    document.cookie = "arrayData=" + encodeURIComponent(popupMessage) + ";max-age=3600";

    // Get cookie data and create new arrays
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('arrayData='))
      ?.split('=')[1];

    if (cookieValue) {
      const decodedData = decodeURIComponent(cookieValue);
      const cookieLines = decodedData.split('<br>');
      
      const cookie_Fruits = cookieLines[0].replace('new_Fruits: ', '').split(', ');
      const cookie_Trees = cookieLines[1].replace('new_Trees: ', '').split(', ');
      const cookie_Fish = cookieLines[2].replace('new_Fish: ', '').split(', ');

      // Test the arrays from cookie
      console.log('Cookie Fruits:', cookie_Fruits);
      console.log('Cookie Trees:', cookie_Trees);
      console.log('Cookie Fish:', cookie_Fish);
    }

} catch (error) {
    console.error('Error creating popup window:', error);
    alert('Error creating popup window. Please check console for details.');
}

} // END OF FUNCTION testme
