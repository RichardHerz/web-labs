document.addEventListener('DOMContentLoaded', function() {

  // Variables to store the two numbers
  let firstNumber;
  let secondNumber;

  // DOM Elements
  const modal = document.getElementById('numberModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const numberForm = document.getElementById('numberForm');
  const firstNumberInput = document.getElementById('firstNumber');
  const secondNumberInput = document.getElementById('secondNumber');
  const firstNumberError = document.getElementById('firstNumberError');
  const secondNumberError = document.getElementById('secondNumberError');

  // Hide the modal when cancel is clicked
  cancelBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      resetForm();
  });

  // Handle form submission
  numberForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;

      // Validate first number - allow floating point
      const firstVal = parseFloat(firstNumberInput.value);
      console.log('  form firstVal = ' + firstVal); 
      if (firstNumberInput.value === '' || isNaN(firstVal)) {
          firstNumberError.style.display = 'block';
          isValid = false;
      } else {
          firstNumberError.style.display = 'none';
      }

      // Validate second number - allow floating point
      const secondVal = parseFloat(secondNumberInput.value);
      if (secondNumberInput.value === '' || isNaN(secondVal)) {
          secondNumberError.style.display = 'block';
          isValid = false;
      } else {
          secondNumberError.style.display = 'none';
      }

      // If valid, assign values and hide modal
      if (isValid) {
          firstNumber = firstVal;
          secondNumber = secondVal;

          // Get the unit unitID from the modal's data attribute 
          const unitID = modal.dataset.unitID;

          // and call class setParameters function
 
          const unitIndex = findProcessUnitIndex(unitID);

          if (unitIndex !== -1) {
              processUnits[unitIndex].setParameters(firstNumber, secondNumber);

              console.log('  GOOD first, secondNumber = ' + firstNumber +', ' + secondNumber);
          } else {
              console.log('  ERROR no unitIndex from modal.dataset & search');
          }

          // Hide modal
          modal.style.display = 'none';
          resetForm();

          console.log('First Number:', firstNumber);
          console.log('Second Number:', secondNumber);
      }
  });

  // Reset form and error messages
  function resetForm() {
      numberForm.reset();
      firstNumberError.style.display = 'none';
      secondNumberError.style.display = 'none';
  }

}); // END OF BLOCK adding eventListeners for main html elements