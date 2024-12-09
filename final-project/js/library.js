function setup() {
}

function draw() {
    clear();
    background(255);
    
    // Drawing code will go here
    
    noLoop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    mainBuffer = createGraphics(width, height);
    blurBuffer = createGraphics(width, height);
    draw();
}