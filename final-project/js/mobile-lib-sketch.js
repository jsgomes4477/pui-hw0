// <script src="https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.4.2/chroma.min.js"></script>
let menuVisible = true;
let currentSwatches = []; // To store the current swatch colors
let generateButton;
let saveButton;
let currentColorScheme = 0; // To track which color scheme is active
let leftMargin = 20;
let rightMargin = 20;
let topMargin = 20;
let bottomMargin = 140;
let col60, col30, col10;
let testImg;
// let baseColor = '#FF5733';
let baseColor = '#f58cbb'; //works well for this color
let isComplementary = false;
let isMonochromatic = false;
let isTriadic = false;
let isSplitComplementary = false;
let mobileCanvas;

function preload() {
    testImg = loadImage('holding_dandelion.jpg'); // Use exact filename as uploaded
}

function setup() {
    mobileCanvas = createCanvas(430, 932);
    mobileCanvas.parent('mobile-p5-container');
    
    // Initialize color scheme first
    isComplementary = true;
    generateColorPalette();
    
    createGenerateButton();
    createSaveButton();
    generateSwatches();
    noLoop();
}

function draw() {
  background(255);
	// image(bgImage, 0, 0, width, height);
	
  noStroke();
  // Draw stored swatches with paint swatch styling
  for (let row of currentSwatches) {
    for (let swatch of row) {
      // Draw shadow effect
      fill(0, 0, 0);
      rect(swatch.x + 4, swatch.y + 4, swatch.size, swatch.size, 12);
      
      // Draw main swatch
      strokeWeight(2);
      stroke(0);
      fill(swatch.color);
      rect(swatch.x, swatch.y, swatch.size, swatch.size, 12);
    }
  }
  
	// Button main color
  strokeWeight(2);
  stroke(0);
  fill(col30.hex());
  rect(generateButton.x, generateButton.y, 
       generateButton.width, generateButton.height, 12);
  
  // Button text
  noStroke();
  fill(0);
  textSize(18);
  textAlign(CENTER, CENTER);
  text(generateButton.label, 
       generateButton.x + generateButton.width/2, 
       generateButton.y + generateButton.height/2);
	
	// Save button main color
	strokeWeight(2);
	stroke(0);
	fill(col60.hex()); // Changed from col30 to col60
	rect(saveButton.x, saveButton.y, 
			 saveButton.width, saveButton.height, 12);

	// Save button text
	noStroke();
	fill(0);
	textSize(18);
	textAlign(CENTER, CENTER);
	text(saveButton.label, 
			 saveButton.x + saveButton.width/2, 
			 saveButton.y + saveButton.height/2);
  
  // Draw menu (rest of the code remains the same)
  noStroke();
  textSize(24);
  textAlign(LEFT);
  text('MENU', 15, height - 30);
  
  if (menuVisible) {
    textSize(18);
    text('SWATCHES', 15, height - 60);
    text('LIBRARY', 15, height - 80);
    text('HOME', 15, height - 100);
  }
}

function createSaveButton() {
  let availableWidth = width - (leftMargin + rightMargin);
  let dim = availableWidth/5;
  
  // Position button on the two leftmost squares of the bottom row
  let buttonX = leftMargin; // Start at leftmost position
  let lastRowY = height - bottomMargin - dim + 9; // Calculate Y position of last row in grid
  let buttonWidth = dim * 2; // Width of two grid squares
  
  saveButton = {
    x: buttonX,
    y: lastRowY,
    width: buttonWidth,
    height: dim,
    label: 'save'
  };
}

function createGenerateButton() {
  let leftMargin = 20;
  let rightMargin = 20;
  let availableWidth = width - (leftMargin + rightMargin);
  let dim = availableWidth/5;
  
  // Position button on the two rightmost squares three rows down
  let buttonX = leftMargin + (5-2) * dim; // Second to last column
  let buttonY = topMargin + 3 * dim;      // Three rows down
  let buttonWidth = dim * 2;              // Span two grid squares
  
  generateButton = {
    x: buttonX,
    y: buttonY,
    width: buttonWidth,
    height: dim,
    label: 'generate'
  };
}

function thresholdColor(color) {
  let rgb = chroma(color).rgb();
  let hsl = chroma(rgb).hsl();
  
  // Threshold saturation and lightness
  hsl[1] = Math.min(hsl[1], 0.80); // Reduce saturation to avoid neon
  hsl[2] = Math.min(hsl[2], 0.65); // Reduce lightness for bright colors
  
  return chroma.hsl(...hsl);
}

function generateColorPalette() {
  let baseHex = thresholdColor(baseColor);
  let flipHeuristic = Math.random() > 0.5;
  let baseL = chroma(baseHex).get('hsl.l');
  let isMidToned = baseL > 0.4 && baseL < 0.6;

  if (isComplementary) {
    col60 = baseHex;
    col30 = chroma(baseHex).set('hsl.h', '+180');
    col10 = chroma.mix(col60, col30, 0.5).saturate(1);
  } else if (isMonochromatic) {
    col60 = baseHex;
    if (isMidToned && flipHeuristic) {
      col30 = chroma(baseHex).set('hsl.l', '*1.5');
      col10 = chroma(baseHex).set('hsl.l', '*0.15');
    } else {
      col30 = chroma(baseHex).brighten(2);
      col10 = chroma(baseHex).darken(2);
    }
  } else if (isTriadic) {
    col60 = baseHex;
    col30 = chroma(baseHex).set('hsl.h', '+120');
    col10 = chroma(baseHex).set('hsl.h', '+240');
  } else if (isSplitComplementary) {
    col60 = baseHex;
    col30 = chroma(baseHex).set('hsl.h', '+150');
    col10 = chroma(baseHex).set('hsl.h', '+210');
  } else {
    col60 = baseHex;
    col30 = chroma(baseHex).set('hsl.h', '+180');
    col10 = chroma.mix(col60, col30, 0.5).saturate(1);
  }

  return [col60.hex(), col30.hex(), col10.hex()];
}

function generateSwatches() {
  currentSwatches = []; // Clear previous swatches
  
  let [col60Hex, col30Hex, col10Hex] = generateColorPalette();
  let col60 = color(col60Hex);
  let col30 = color(col30Hex);
  let col10 = color(col10Hex);
  // colorMode(RGB, 255); 
	// let col60 = color(255, 215, 15);
	// let col30 = color(234, 104, 9);
	// let col10 = color(0, 12, 13);
  // let col60 = color(random(200,255));
  // let col30 = color(random(120,140));
  // let col10 = color(random(10,30));
  
  // Calculate grid positions and colors once
  let availableWidth = width - (leftMargin + rightMargin);
  let dim = availableWidth/5;
  
  for (let y = topMargin; y < height - bottomMargin; y += dim){
    let row = [];
    for (let x = leftMargin; x < width - rightMargin; x += dim){
      let rand = random(100);
      let swatchColor;
      if (rand < 60){
        swatchColor = col60; 
      } else if (rand < 90){
        swatchColor = col30; 
      } else {
        swatchColor = col10; 
      }
      row.push({x, y, color: swatchColor, size: dim});
    }
    currentSwatches.push(row);
  }
}

function findConsecutiveSquares() {
  // First draw the image that will show through
  image(testImg, 0, 0, width, height);
  
  // Check horizontal consecutive squares
  for (let i = 0; i < currentSwatches.length; i++) {
    for (let j = 0; j < currentSwatches[i].length - 2; j++) {
      let swatch1 = currentSwatches[i][j];
      let swatch2 = currentSwatches[i][j + 1];
      let swatch3 = currentSwatches[i][j + 2];
      
      if (colorMatch(swatch1.color, swatch2.color) && 
          colorMatch(swatch2.color, swatch3.color)) {
        swatch1.color = color(0, 0);  // Set alpha to 0
        swatch2.color = color(0, 0);
        swatch3.color = color(0, 0);
      }
    }
  }
  
  // Check vertical consecutive squares
  for (let i = 0; i < currentSwatches.length - 2; i++) {
    for (let j = 0; j < currentSwatches[i].length; j++) {
      let swatch1 = currentSwatches[i][j];
      let swatch2 = currentSwatches[i + 1][j];
      let swatch3 = currentSwatches[i + 2][j];
      
      if (colorMatch(swatch1.color, swatch2.color) && 
          colorMatch(swatch2.color, swatch3.color)) {
        swatch1.color = color(0, 0);
        swatch2.color = color(0, 0);
        swatch3.color = color(0, 0);
      }
    }
  }
}

function colorMatch(col1, col2) {
  return red(col1) === red(col2) && 
         green(col1) === green(col2) && 
         blue(col1) === blue(col2);
}

function saveColorScheme() {
  let schemeData = {
    baseColor: baseColor,
    colorScheme: currentColorScheme,
    colors: {
      col60: col60.hex(),
      col30: col30.hex(),
      col10: col10.hex()
    },
    swatches: currentSwatches.map(row => 
      row.map(swatch => ({
        x: swatch.x,
        y: swatch.y,
        color: red(swatch.color) + ',' + 
               green(swatch.color) + ',' + 
               blue(swatch.color),
        size: swatch.size
      }))
    )
  };
  
  saveJSON(schemeData, 'colorScheme.json');
}

function mouseMoved() {
  let previousMenuState = menuVisible;
  if (mouseX < 100 && mouseY > height - 100) {
    menuVisible = true;
  } else {
    menuVisible = false;
  }
  
  // Only redraw if menu state changed
  if (previousMenuState !== menuVisible) {
    redraw();
  }
}

function mousePressed() {
  // Check if button was clicked
  if (mouseX > generateButton.x && mouseX < generateButton.x + generateButton.width &&
      mouseY > generateButton.y && mouseY < generateButton.y + generateButton.height) {
    // Cycle through color schemes
    currentColorScheme = (currentColorScheme + 1) % 4;
    
    // Reset all flags
    isComplementary = false;
    isMonochromatic = false;
    isTriadic = false;
    isSplitComplementary = false;
    
    // Set the active scheme
    switch(currentColorScheme) {
      case 0:
        isComplementary = true;
        break;
      case 1:
        isMonochromatic = true;
        break;
      case 2:
        isTriadic = true;
        break;
      case 3:
        isSplitComplementary = true;
        break;
    }
    
    generateSwatches();
  }
	
	// Check if save button was clicked
  if (mouseX > saveButton.x && mouseX < saveButton.x + saveButton.width &&
      mouseY > saveButton.y && mouseY < saveButton.y + saveButton.height) {
    saveColorScheme();
  }
}