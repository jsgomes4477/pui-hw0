let shapes = [];
let gridCells = [];
let defaultColor;
let input;
let grainDensity = 0.8;
let grainSize = 0.4;
let mainBuffer; // Buffer for main content
let blurBuffer; // Buffer for blur effect

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('p5-container');
    pixelDensity(0.9);

    // Get saved color or use default
    defaultColor = ColorManager.getColor() || 'f58cbb';
    
    // Create buffers
    mainBuffer = createGraphics(width, height);
    blurBuffer = createGraphics(width, height);
    
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
    
    // Draw to main buffer
    mainBuffer.clear();
    mainBuffer.background(255);

    // Draw grid cells
    gridCells.forEach(cell => {
        let cellColor = color(defaultColor);
        cellColor.setAlpha(cell.alpha);
        mainBuffer.fill(cellColor);
        mainBuffer.noStroke();
        
        mainBuffer.beginShape();
        
        // Number of points per edge for smoother curves
        const pointsPerEdge = 15;
        const stepX = cell.width / pointsPerEdge;
        const stepY = cell.height / pointsPerEdge;
        
        // Top edge
        for(let i = 0; i <= pointsPerEdge; i++) {
            let x = cell.x + (i * stepX);
            let noiseVal = noise(x * 0.02, cell.y * 0.02, frameCount * 0.01) * 20;
            mainBuffer.curveVertex(x + random(-3, 3), cell.y + noiseVal);
        }
        
        // Right edge
        for(let i = 0; i <= pointsPerEdge; i++) {
            let y = cell.y + (i * stepY);
            let noiseVal = noise((cell.x + cell.width) * 0.02, y * 0.02, frameCount * 0.01) * 20;
            mainBuffer.curveVertex(cell.x + cell.width + noiseVal, y + random(-3, 3));
        }
        
        // Bottom edge
        for(let i = pointsPerEdge; i >= 0; i--) {
            let x = cell.x + (i * stepX);
            let noiseVal = noise(x * 0.02, (cell.y + cell.height) * 0.02, frameCount * 0.01) * 20;
            mainBuffer.curveVertex(x + random(-3, 3), cell.y + cell.height + noiseVal);
        }
        
        // Left edge
        for(let i = pointsPerEdge; i >= 0; i--) {
            let y = cell.y + (i * stepY);
            let noiseVal = noise(cell.x * 0.02, y * 0.02, frameCount * 0.01) * 20;
            mainBuffer.curveVertex(cell.x + noiseVal, y + random(-3, 3));
        }
        
        // Add extra control points to smooth corners
        mainBuffer.curveVertex(cell.x + random(-6, 6), cell.y + noise(cell.x * 0.02, cell.y * 0.02) * 20);
        mainBuffer.curveVertex(cell.x + random(-6, 6), cell.y + noise(cell.x * 0.02, cell.y * 0.02) * 20);
        
        mainBuffer.endShape(CLOSE);
    });
    
    // Draw organic shapes in white
    mainBuffer.fill(255);
    shapes.forEach(shape => {
        mainBuffer.push();
        mainBuffer.translate(shape.x, shape.y);
        mainBuffer.rotate(shape.rotation);
        
        switch(shape.type) {
            case 'star':
                drawStar(mainBuffer, 0, 0, shape.size/3, shape.size/2);
                break;
            case 'flower':
                drawFlower(mainBuffer, 0, 0, shape.size);
                break;
            case 'softstar':
                drawSoftStar(mainBuffer, 0, 0, shape.size/2);
                break;
        }
        mainBuffer.pop();
    });
    
    // Apply blur effect
    blurBuffer.clear();
    blurBuffer.image(mainBuffer, 0, 0);
    blurBuffer.filter(BLUR, 0.0001);
    
    // Draw blurred content
    image(blurBuffer, 0, 0);
    
    // Apply grain effect
    loadPixels();
    for (let x = 0; x < width; x += 2) { // Optimize by processing every other pixel
        for (let y = 0; y < height; y += 2) {
            if (random() < grainDensity) {
                let index = (x + y * width) * 4;
                let noiseVal = noise(x * grainSize, y * grainSize) * 50;
                pixels[index] = pixels[index] - noiseVal;
                pixels[index + 1] = pixels[index + 1] - noiseVal;
                pixels[index + 2] = pixels[index + 2] - noiseVal;
                
                // Apply to neighboring pixels for better performance
                for(let dx = 0; dx < 2; dx++) {
                    for(let dy = 0; dy < 2; dy++) {
                        let ni = ((x + dx) + (y + dy) * width) * 4;
                        if(ni < pixels.length) {
                            pixels[ni] = pixels[index];
                            pixels[ni + 1] = pixels[index + 1];
                            pixels[ni + 2] = pixels[index + 2];
                        }
                    }
                }
            }
        }
    }
    updatePixels();
    
    noLoop();
}

function createGrid() {
    const baseSize = 300;
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

function drawStar(g, x, y, radius1, radius2) {
    g.beginShape();
    for (let i = 0; i < 10; i++) {
        let angle = TWO_PI * i / 10;
        let r = (i % 2 === 0) ? radius2 : radius1;
        let px = x + cos(angle) * r;
        let py = y + sin(angle) * r;
        g.curveVertex(px, py);
    }
    g.endShape(CLOSE);
}

function drawFlower(g, x, y, size) {
    for (let i = 0; i < 6; i++) {
        g.push();
        g.rotate(i * TWO_PI / 6);
        g.ellipse(size/3, 0, size/2, size/4);
        g.pop();
    }
}

function drawSoftStar(g, x, y, size) {
    g.beginShape();
    for (let angle = 0; angle < TWO_PI; angle += 0.1) {
        let r = size * (0.8 + sin(angle * 3) * 0.2);
        let px = x + cos(angle) * r;
        let py = y + sin(angle) * r;
        g.curveVertex(px, py);
    }
    g.endShape(CLOSE);
}

function handleColorInput(e) {
    let newColor = e.target.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
        defaultColor = newColor;
        ColorManager.setColor(newColor);
        createGrid();
        createShapes();
        draw();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    mainBuffer = createGraphics(width, height);
    blurBuffer = createGraphics(width, height);
    createGrid();
    createShapes();
    draw();
}