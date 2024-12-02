// Only run this code if we're on desktop
if (window.innerWidth >= 992) {
    let inputBox;
    let errorDiv;
    let menuVisible = false;
    let currentColor = '#f58cbb';
    let desktopCanvas;
    let colorSwatches = []; // Changed from randomSwatches to match function names

    function setup() {
        // Create canvas in the web container only
        desktopCanvas = createCanvas(windowWidth, windowHeight);
        desktopCanvas.parent('web-p5-container');

        // Create and position input box
        inputBox = createInput('#');
        inputBox.position(width/2 - 140, height/2 - 20);
        inputBox.input(handleInput);
        inputBox.style('font-size', '18px');
        inputBox.style('padding', '8px');
        inputBox.style('border-radius', '12px');
        inputBox.style('border', '2px solid black');
        inputBox.style('width', '280px');
        
        // Create error message div
        errorDiv = createDiv('');
        errorDiv.class('error-message');
        errorDiv.position(width/2 - 140, height/2 + 30);
        errorDiv.style('font-family', 'Arial');
        errorDiv.style('color', 'red');

        currentColor = getLastEnteredColor();
        initializeColorSwatches(); // Changed to match function name
        
        loop();
    }

    function draw() {
        background(255);
        
        // Draw color swatches
        drawColorSwatches();
        
        // Draw main color swatch with shadow
        noStroke();
        fill(0, 0, 0, 20);
        rect(width/2 - 152, height/2 - 152, 304, 304, 12);
        
        // Draw main color swatch
        strokeWeight(2);
        stroke(0);
        fill(currentColor);
        rect(width/2 - 150, height/2 - 150, 300, 300, 12);
        
        // Draw "enter a hexcode" text
        fill(0);
        noStroke();
        textSize(18);
        textAlign(CENTER, CENTER);
        text('enter a hexcode', width/2, height/2 - 80);
        
        // Draw menu
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
      
      function initializeColorSwatches() {
        let numSwatches = floor(map(windowWidth, 992, 1920, 4, 6, true));
        for (let i = 0; i < numSwatches; i++) {
          colorSwatches.push(color(random(255), random(255), random(255)));
        }
      }
      
      function drawColorSwatches() {
        let swatchSize = 100;
        let spacing = 20;
        let totalWidth = colorSwatches.length * (swatchSize + spacing) - spacing;
        let startX = (width - totalWidth) / 2;
      
        for (let i = 0; i < colorSwatches.length; i++) {
          fill(colorSwatches[i]);
          stroke(0);
          strokeWeight(2);
          rect(startX + i * (swatchSize + spacing), 50, swatchSize, swatchSize, 12);
        }
      }
      
      function getLastEnteredColor() {
        return localStorage.getItem('currentLibraryColor') || '#f58cbb';
      }
      
      function handleInput() {
        let hexValue = inputBox.value();
        let hexRegex = /^#[0-9A-Fa-f]{6}$/;
        
        if (hexRegex.test(hexValue)) {
          currentColor = hexValue;
          ColorManager.setLastColor(hexValue);
          errorDiv.html('');
        } else if (hexValue.length === 7) {
          errorDiv.html('Please enter a valid hex code (e.g., #FF0000)');
        }
      }
      
      function mouseMoved() {
        menuVisible = (mouseX < 100 && mouseY > height - 100);
      }
      
      function mousePressed() {
        if (menuVisible) {
          if (mouseY < height - 50 && mouseY > height - 70) {
            window.location.href = 'swatches.html';
          } else if (mouseY < height - 70 && mouseY > height - 90) {
            window.location.href = 'library.html';
          } else if (mouseY < height - 90 && mouseY > height - 110) {
            window.location.href = 'index.html';
          }
        }
      }
      
      function windowResized() {
        resizeCanvas(windowWidth, windowHeight);
        inputBox.position(width/2 - 140, height/2 - 20);
        errorDiv.position(width/2 - 140, height/2 + 30);
        
        // Reinitialize color swatches on window resize
        colorSwatches = [];
        initializeColorSwatches();
      }
}