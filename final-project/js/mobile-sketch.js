let inputBox;
let errorDiv;
let menuVisible = false;
let currentColor = '#FFFFFF';

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
    if (mouseX < 100 && mouseY > height - 100) {
    menuVisible = true;
    } else {
    menuVisible = false;
    }
    redraw();
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
    resizeCanvas(430, 932);
    inputBox.position(width/2, height/2);
    errorDiv.position(width/2 - 140, height/2 + 30);
}

// This is p5.js