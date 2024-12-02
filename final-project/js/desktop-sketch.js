let canvas;
let ctx;
let inputBox;
let errorDiv;
let menuVisible = false;
let currentColor = '#f58cbb';
let arrowHovered = false;
let currentWidth = 430;
let currentHeight = 932;

function setup() {
    canvas = createCanvas(currentWidth, currentHeight);
    canvas.parent('web-p5-container');
    ctx = canvas.drawingContext;

    inputBox = createInput('#');
    inputBox.position(width/2 - 130, height/2 - 100);
    inputBox.input(handleInput);
    inputBox.style('font-size', '18px');
    inputBox.style('padding', '8px');
    inputBox.style('border-radius', '12px');
    inputBox.style('border', '2px solid black');
    inputBox.style('width', '280px');
    
    errorDiv = createDiv('');
    errorDiv.class('error-message');
    errorDiv.position(width/2 - 140, height/2 + 80);
    errorDiv.style('font-family', 'Arial');
    errorDiv.style('color', 'red');

    currentColor = getLastEnteredColor();
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial call to set correct size
}

function draw() {
    clear();
    
    // Draw main color swatch with shadow
    noStroke();
    fill(0, 0, 0, 20);
    rect(24, 24, width-48, height-240, 12);
    
    // Draw main color swatch
    strokeWeight(2);
    stroke(0);
    fill(currentColor);
    rect(20, 20, width-40, height-136, 12);
    
    // Draw "HEXCODE:" text
    fill(0);
    noStroke();
    textSize(18);
    textAlign(CENTER, CENTER);
    text('enter a hexcode', width/2 - 70, height/2 - 30);
    
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

function resizeCanvas() {
    let newWidth = Math.floor(windowWidth / 100) * 100;
    if (Math.abs(newWidth - currentWidth) >= 100) {
        currentWidth = newWidth;
        currentHeight = Math.floor(currentWidth * 932 / 430);
        resizeCanvas(currentWidth, currentHeight);
        repositionElements();
        redraw();
    }
}

function repositionElements() {
    inputBox.position(width/2 - 140, height/2 - 20);
    errorDiv.position(width/2 - 140, height/2 + 30);
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
        redraw();
    } else if (hexValue.length === 7) {
        errorDiv.html('Please enter a valid hex code (e.g., #FF0000)');
    }
}

function mouseMoved() {
    menuVisible = mouseX < 100 && mouseY > height - 100;
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