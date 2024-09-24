let selectedGlazingPrice = 0.0; //default value of selection
let selectedPackNum = 1; //default value for pack size selection

const opts = { //object for all possible price options
    glazing: ['Keep original', 'Sugar milk', 'Vanilla milk', 'Double chocolate'],
    glazingPrice: [0.0, 0.0, 0.5, 1.5],
    packSize: [1, 3, 6, 12],
    packSizeMult: [1, 3, 5, 10],
};

// Event handler for changes detected with glazings dropdown menu
function onGlazeChange(event) {
    const selectedGlazing = event.target.value;  // gets user input for current glazing option
    const glazingIdx = opts.glazing.indexOf(selectedGlazing); // finds index of that glazing
    selectedGlazingPrice = opts.glazingPrice[glazingIdx]; // get price change from list
    updatePrice(); //makes a call to update the prce shown on screen
}

// Event handler for changes detected with pack size dropdown menu
function onPackChange(event) {
    const selectedPackSize = event.target.value;  // gets user input for current pack size
    const packIdx = opts.packSize.indexOf(parseInt(selectedPackSize)); // finds index for size
    selectedPackNum = opts.packSizeMult[packIdx]; // gets corresponding pack size multiplier
    updatePrice(); //makes a call to to update the prce shown on screen
}

// Event listener for glazing dropdown (uses change and target.value from class)
document.querySelector('select[name="glazings"]').addEventListener('change', onGlazeChange);

// Event listener for pack size dropdown
document.querySelector('select[name="packs"]').addEventListener('change', onPackChange);

// Updates the price by doing the calculations based on pack and glazing options
function updatePrice() {
    const basePrice = 2.49; // base price for original cinnamon roll
    const totalPrice = (basePrice + selectedGlazingPrice) * selectedPackNum;

    // Updates the price on the page
    document.querySelector('.price').textContent = `$${totalPrice.toFixed(2)}`; 
}


// By Jenna Gomes
// referenced example from GitHub in hw notes:
// https://github.com/CMU-PUI-2024/pui-materials/blob/main/in-lab-examples/puinote-lab04/select-example/app.js
// indexOf documentation:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
// how i formatted my event listeners documentation (in example of simple):
// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener