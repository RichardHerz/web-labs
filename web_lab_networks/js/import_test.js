'use strict';

function testme() {
  // Method 1: direct array declaration
  const fruitArray = ['apple', 'banana', 'orange', 'mango', 'pear'];

  // Method 2: using split() on a comma-delimited string
  const treeString = 'oak, maple, pine, birch, redwood, palm';
  const treeArray = treeString.split(',').map(item => item.trim());

  // Method 3: using split() with a one-line string
  const fishArray = 'salmon,tuna,trout,cod,bass'.split(',');

  // Test output of original arrays
  console.log('Fruits:', fruitArray);
  console.log('Trees:', treeArray);
  console.log('Fish:', fishArray);

  // Create formatted string for popup
  const popupMessage = 
      'new_Fruits: ' + fruitArray.join(', ') + '<br>' +
      'new_Trees: ' + treeArray.join(', ') + '<br>' +
      'new_Fish: ' + fishArray.join(', ');

 // Split popupMessage into three arrays
 const messageLines = popupMessage.split('<br>');
 const new_Fruits = messageLines[0].replace('new_Fruits: ', '').split(', ');
 const new_Trees = messageLines[1].replace('new_Trees: ', '').split(', ');
 const new_Fish = messageLines[2].replace('new_Fish: ', '').split(', ');

 // Verify the new arrays
 console.log('Split message arrays:');
 console.log('new_Fruits:', new_Fruits);
 console.log('new_Trees:', new_Trees);
 console.log('new_Fish:', new_Fish);

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

  } catch (error) {
      console.error('Error creating popup window:', error);
      alert('Error creating popup window. Please check console for details.');
  }

  // Set cookie with array data
  document.cookie = "arrayData=" + encodeURIComponent(popupMessage) + ";max-age=3600";
  console.log('Array data saved to cookie');

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

} // END OF FUNCTION testme
