///////////////////////////// Constants & Classes ///////////////////////////

const opts = { //object for all possible price options
    glazing: ['Keep original', 'Sugar milk', 'Vanilla milk', 'Double chocolate'],
    glazingPrice: [0.0, 0.0, 0.5, 1.5],
    packSize: [1, 3, 6, 12],
    packSizeMult: [1, 3, 5, 10],
};

class Roll { //defines the class of for rolls users pick
    constructor(rollType, rollGlazing, packSize, basePrice) {
        this.type = rollType;
        this.glazing =  rollGlazing;
        this.size = packSize;
        this.basePrice = basePrice;
    }
}

///////////////////////// Multi Page Error Handling ////////////////////////


function initDetailPage() {
   
    /////////////////////////// URL Parsing ////////////////////////////////

    //cart array that stores cart times
    let cart = [];

    //gets query string from URL, list of search params
    const queryString = window.location.search;

    //use query string to create a URLSearchParams object
    const params = new URLSearchParams(queryString);

    //access roll name by using the "get" method
    const rollType = params.get('roll');

    //roll details from dictionary
    const rollDetails = rolls[rollType];

    // roll price
    const rollPrice = rollDetails.basePrice;

    //image path
    const rollImage = rollDetails.imageFile;

    //updates header text
    const headerElem = document.querySelector('.tag-line');
    headerElem.innerText = rollType + " Cinnamon Roll";

    //updates image
    const newRollImg = document.querySelector('.big-border');
    newRollImg.src = '../assets/products/' + rollImage;

    //updates roll price
    const newRollPrice = document.querySelector('.price');
    newRollPrice.innerText = '$' + rollPrice.toFixed(2);

    ///////////////////////// Calculating Price ////////////////////////////////

    let selectedGlazingPrice = 0.0; //default value of selection
    let selectedPackNum = 1; //default value for pack size selection

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
        const basePrice = rollPrice; // base price dependent on URL parsing
        const totalPrice = (basePrice + selectedGlazingPrice) * selectedPackNum;

        // Updates the price on the page
        document.querySelector('.price').textContent = `$${totalPrice.toFixed(2)}`; 
    }

    //Event handler for when users add new items to their carts
    function onCartChange (event) {
        
        const newRoll = new Roll(
            rollType,
            document.querySelector('select[name="glazings"]').value,
            document.querySelector('select[name="packs"]').value,
            rollPrice,
        );
        cart.push(newRoll); //creates a new instance for a roll and adds to cart

        console.log(cart); //prints entire cart array to console for new every item
    }

    //Event listener that detects a change for the cart button
    document.querySelector('.cart-button').addEventListener('click', onCartChange);

  }
  
  function initCartPage() {
    
    ///////////////////////////// Add to Cart //////////////////////////////

    function updateManual(roll) { //new version of previous update() function
        let glazingIdx = opts.glazing.indexOf(roll.glazing);
        let glazingPrice = opts.glazingPrice[glazingIdx];
        let sizeIdx = opts.packSize.indexOf(parseInt(roll.size));
        let sizeMult = opts.packSizeMult[sizeIdx];
        let totalPrice = (roll.basePrice + glazingPrice) * sizeMult;

        return totalPrice.toFixed(2); //fixes floating point errors in JS
    }

    //New roll instances (cart start)
    const roll1 = new Roll("Original", 'Sugar milk', 1, 2.49);
    const roll2 = new Roll("Walnut", 'Vanilla milk', 12, 3.49);
    const roll3 = new Roll("Raisin", 'Sugar milk', 3, 2.99);
    const roll4 = new Roll("Apple", 'Keep original', 3, 3.49);

    //Manual price calculation from above
    const roll1_price = updateManual(roll1);
    const roll2_price = updateManual(roll2);
    const roll3_price = updateManual(roll3);
    const roll4_price = updateManual(roll4);

    // Get the template element for cart items
    const cartTemplate = document.querySelector('template.entire-item');

    const roll1_clone = cartTemplate.content.cloneNode(true);
    const roll2_clone = cartTemplate.content.cloneNode(true);
    const roll3_clone = cartTemplate.content.cloneNode(true);
    const roll4_clone = cartTemplate.content.cloneNode(true);

    function newCartItem(clone, roll, roll_price) {
        const img = clone.querySelector(".bordered-img");
        
        img.src = `../assets/products/${roll.imageFile}`;
        img.alt = `image of the ${roll.type} cinnamon roll`;

        clone.querySelector('.type-desc').textContent = 
            `${roll.type} Cinnamon Roll`;

        clone.querySelector('.glazing-desc').textContent = `Glazing: ${roll.glazing}`;

        clone.querySelector('.size-desc').textContent = `Pack Size: ${roll.size}`;

        clone.querySelector('.cart-price p').textContent = `$${roll_price}`;

        const container = document.querySelector('.entire-cart');
        container.insertBefore(clone, container.querySelector('.checkout-space'));
    }

    //Calling function above to display each new roll
    newCartItem(roll1_clone, roll1, roll1_price);
    newCartItem(roll2_clone, roll2, roll2_price);
    newCartItem(roll3_clone, roll3, roll3_price);
    newCartItem(roll4_clone, roll4, roll4_price);
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    if (document.body.id === 'detail-page') {
      initDetailPage();
    } else if (document.body.id === 'cart-page') {
      initCartPage();
    }
  });

///////////////////////////////// References //////////////////////////////

// By Jenna Gomes
// referenced example from GitHub in hw notes:
// https://github.com/CMU-PUI-2024/pui-materials/blob/main/in-lab-examples/puinote-lab04/select-example/app.js
// indexOf documentation:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
// how i formatted my event listeners documentation (in example of simple):
// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
// how to use a dictionary in JSON:
// https://www.geeksforgeeks.org/how-to-access-and-process-nested-objects-arrays-or-json/
// how to parse URLS;
// https://github.com/CMU-PUI-2024/pui-materials/tree/main/in-lab-examples/puinote-lab04/url-params