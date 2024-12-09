let shapes = [];
let gridCells = [];
let defaultColor = '#f58cbb';
let input;
let grainDensity = 0.8; // Controls how dense the grain effect is
let grainSize = 1.4;    // Controls size of individual grains

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('p5-container');
    pixelDensity(0.3);
    
    createGrid();
    createShapes();
    
    input = document.getElementById('color-input');
    input.addEventListener('input', handleColorInput);
    input.value = defaultColor;
    
    noStroke();
    smooth();
    frameRate(30);
}

function draw() {
    clear();
    background(255);
    
    // Draw grid cells
    gridCells.forEach(cell => {
        let cellColor = color(defaultColor);
        cellColor.setAlpha(cell.alpha);
        fill(cellColor);
        rect(cell.x, cell.y, cell.width, cell.height, 10);
    });
    
    // Draw organic shapes in white
    fill(255);
    shapes.forEach(shape => {
        push();
        translate(shape.x, shape.y);
        rotate(shape.rotation);
        
        switch(shape.type) {
            case 'star':
                drawStar(0, 0, shape.size/3, shape.size/2);
                break;
            case 'flower':
                drawFlower(0, 0, shape.size);
                break;
            case 'softstar':
                drawSoftStar(0, 0, shape.size/2);
                break;
        }
        pop();
    });
    
    // Apply grain effect
    loadPixels();
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (random() < grainDensity) {
                let index = (x + y * width) * 4;
                let noiseVal = noise(x * grainSize, y * grainSize) * 50;
                pixels[index] = pixels[index] - noiseVal;
                pixels[index + 1] = pixels[index + 1] - noiseVal;
                pixels[index + 2] = pixels[index + 2] - noiseVal;
            }
        }
    }
    updatePixels();
    
    noLoop();
}

function createGrid() {
    const baseSize = 250;
    const cols = ceil(width / baseSize) + 1;
    const rows = ceil(height / baseSize) + 1;
    
    gridCells = [];
    for (let i = 0; i < cols * rows; i++) {
        let isWide = random() > 0.7;
        let isTall = random() > 0.7;
        
        gridCells.push({
            x: (i % cols) * baseSize + random(-30, 30),
            y: floor(i / cols) * baseSize + random(-30, 30),
            width: isWide ? baseSize * random(1.5, 2.5) : baseSize * random(0.6, 1.2),
            height: isTall ? baseSize * random(1.5, 2.5) : baseSize * random(0.6, 1.2),
            alpha: random(150, 220)
        });
    }
}

function createShapes() {
    shapes = [];
    for (let i = 0; i < 20; i++) {
        shapes.push({
            x: random(width),
            y: random(height),
            size: random(30, 60),
            type: random(['star', 'flower', 'softstar']),
            rotation: random(TWO_PI),
            noiseOffset: random(1000)
        });
    }
}

function drawStar(x, y, radius1, radius2) {
    beginShape();
    for (let i = 0; i < 10; i++) {
        let angle = TWO_PI * i / 10;
        let r = (i % 2 === 0) ? radius2 : radius1;
        let px = x + cos(angle) * r;
        let py = y + sin(angle) * r;
        curveVertex(px, py);
    }
    endShape(CLOSE);
}

function drawFlower(x, y, size) {
    for (let i = 0; i < 6; i++) {
        push();
        rotate(i * TWO_PI / 6);
        ellipse(size/3, 0, size/2, size/4);
        pop();
    }
}

function drawSoftStar(x, y, size) {
    beginShape();
    for (let angle = 0; angle < TWO_PI; angle += 0.1) {
        let r = size * (0.8 + sin(angle * 3) * 0.2);
        let px = x + cos(angle) * r;
        let py = y + sin(angle) * r;
        curveVertex(px, py);
    }
    endShape(CLOSE);
}

function handleColorInput(e) {
    let newColor = e.target.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
        defaultColor = newColor;
        createGrid();
        createShapes();
        draw();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    createGrid();
    createShapes();
    draw();
}