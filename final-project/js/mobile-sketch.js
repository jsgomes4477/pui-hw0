let inputBox;
let errorDiv;
let menuVisible = false;
let currentColor = '#FFFFFF';
let arrowHovered = false;
let mobileCanvas;

function setup() {
    mobileCanvas = createCanvas(430, 932);
    mobileCanvas.parent('mobile-p5-container');

    // Create and position input box
    inputBox = createInput('#');
    inputBox.parent('mobile-p5-container');
    inputBox.position(width/2 - 140, height/2 - 20);
    inputBox.input(handleInput);

    // Create error message div
    errorDiv = createDiv('');
    errorDiv.parent('mobile-p5-container');
    errorDiv.class('error-message');
    errorDiv.position(width/2 - 140, height/2 + 30);

    noLoop();
}

function draw() {
    // Set background to current color
    background(currentColor);

    // Draw white info rectangle at bottom
    noStroke();
    fill(255);
    rect(2, height-200, width-4, 198);

    // Draw arrow if color is set
    if (currentColor !== '#FFFFFF') {
        drawArrow();
    }

    // Draw "HEXCODE:" text
    fill(0);
    textSize(28);
    textAlign(CENTER, CENTER);
    text('hexcode:', width/2, height/2 - 60);

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

    // Draw black border (always do this last)
    noFill();
    strokeWeight(4);
    stroke(0);
    rect(2, 2, width-4, height-4);
}

function drawArrow() {
    push();
    translate(width/2, height-280); // Moved higher above white box
    stroke(0);
    strokeWeight(2);
    fill(arrowHovered ? 150 : 0);
    
    // New arrow design
    beginShape();
    vertex(-20, 0);    // Left point
    vertex(0, 20);     // Bottom point
    vertex(20, 0);     // Right point
    vertex(10, 0);     // Right inner point
    vertex(10, -15);   // Right top point
    vertex(-10, -15);  // Left top point
    vertex(-10, 0);    // Left inner point
    endShape(CLOSE);
    pop();
}

function mouseWheel(event) {
    if (currentColor !== '#FFFFFF') {
        window.location.href = 'library.html';
        return false;
    }
}

function handleInput() {
    let hexValue = inputBox.value();
    let hexRegex = /^#[0-9A-Fa-f]{6}$/;

    if (hexRegex.test(hexValue)) {
        currentColor = hexValue;
        errorDiv.html('');
        redraw();
    } else if (hexValue.length === 7) {
        errorDiv.html('Please enter a valid hex code (e.g., #FF0000)');
    }
}

function mouseMoved() {
    // Menu hover check
    if (mouseX < 100 && mouseY > height - 100) {
        menuVisible = true;
    } else {
        menuVisible = false;
    }
    
    // Arrow hover check - updated hit area for new arrow
    if (currentColor !== '#FFFFFF') {
        let arrowX = width/2;
        let arrowY = height-280;
        arrowHovered = (mouseX > arrowX - 20 && mouseX < arrowX + 20 && 
                       mouseY > arrowY - 15 && mouseY < arrowY + 20);
    }
    redraw();
}

function mousePressed() {
    if (arrowHovered && currentColor !== '#FFFFFF') {
        window.location.href = 'library.html';
    }
    
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
    resizeCanvas(430, 932);
    inputBox.position(width/2 - 140, height/2 - 20);
    errorDiv.position(width/2 - 140, height/2 + 30);
}

// This is done in p5.js, sketch is for the home page of mobile version