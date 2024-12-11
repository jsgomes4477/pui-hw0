let shapes = [];
let gridCells = [];
let defaultColor;
let input;
let grainDensity = 0.8;
let grainSize = 0.4;
let mainBuffer; // Buffer for main content
let blurBuffer; // Buffer for blur effect
let col60, col30, col10;
let isComplementary = true;
let isMonochromatic = false;
let isTriadic = false;
let isSplitComplementary = false;
let refreshButton;
let refreshShape;
let refreshShapeColor;
let refreshShapeRotation = 0;

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('p5-container');
    pixelDensity(0.9);

    // Get saved color or use default
    defaultColor = ColorManager.getColor() || 'f58cbb';
    
    // Create buffers
    mainBuffer = createGraphics(width, height);
    blurBuffer = createGraphics(width, height);
    
    generateColorPalette();
    createGrid();
    createShapes();
    // createRefreshButton();
    setupTypewriter();
    
    input = document.getElementById('color-input');
    input.addEventListener('input', handleColorInput);
    input.value = defaultColor;
    
    noStroke();
    smooth();
    frameRate(30);
}

function draw() {
    // Draw to main buffer
    mainBuffer.clear();
    mainBuffer.background(255);

    // Draw grid cells
    gridCells.forEach(cell => {
        let cellColor = color(cell.color);
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

function thresholdColor(color) {
    let rgb = chroma(color).rgb();
    let hsl = chroma(rgb).hsl();
    hsl[1] = Math.min(hsl[1], 0.80);
    hsl[2] = Math.min(hsl[2], 0.65);
    return chroma.hsl(...hsl);
}

function generateColorPalette() {
    let baseHex = thresholdColor(defaultColor);
    let flipHeuristic = random() > 0.5;
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
    }
}

function createGrid() {
    generateColorPalette();
    const baseSize = 300;
    const cols = ceil(width / baseSize) + 1;
    const rows = ceil(height / baseSize) + 1;
    
    gridCells = [];
    for (let i = 0; i < cols * rows; i++) {
        let rand = random(100);
        let cellColor;
        
        if (rand < 60) {
            cellColor = col60.hex();
        } else if (rand < 90) {
            cellColor = col30.hex();
        } else {
            cellColor = col10.hex();
        }
        
        gridCells.push({
            x: (i % cols) * baseSize + random(-30, 30),
            y: floor(i / cols) * baseSize + random(-30, 30),
            width: random() > 0.7 ? baseSize * random(1.5, 2.5) : baseSize * random(0.6, 1.2),
            height: random() > 0.7 ? baseSize * random(1.5, 2.5) : baseSize * random(0.6, 1.2),
            alpha: random(150, 220),
            color: cellColor
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

function drawStitches(g, x, y, w, h, spacing = 8) {
    g.push();
    g.stroke(255);
    g.strokeWeight(2);
    for(let i = 0; i < w*2 + h*2; i += spacing) {
      let px, py;
      if(i < w) {
        px = x + i;
        py = y;
      } else if(i < w + h) {
        px = x + w;
        py = y + (i - w);
      } else if(i < w*2 + h) {
        px = x + w - (i - (w + h));
        py = y + h;
      } else {
        px = x;
        py = y + h - (i - (w*2 + h));
      }
      g.line(px, py, px, py + 3);
    }
    g.pop();
}  

function setupTypewriter() {
    // Check if this is the first visit to home page
    if (sessionStorage.getItem('hasVisitedHome')) {
        return;
    }
    sessionStorage.setItem('hasVisitedHome', 'true');

    const instructions = document.getElementById('instructions');
    instructions.innerHTML = '';

    const lines = [
        'welcome to your crazy interactive',
        'color picker tool peruse complementary,',
        'monochromatic, triadic, and',
        'split-complementary color schemes',
        'by simply inserting a hex code',
        'of a great color and clicking refresh!'
    ];

    lines.forEach(line => {
        const container = document.createElement('div');
        container.className = 'typewriter-line-container';
        
        const background = document.createElement('div');
        background.className = 'typewriter-background';
        
        const p = document.createElement('p');
        p.className = 'typewriter-line';
        p.textContent = line;
        
        container.appendChild(background);
        container.appendChild(p);
        instructions.appendChild(container);
    });

    let currentLine = 0;
    const interval = setInterval(() => {
        if (currentLine < lines.length) {
            instructions.children[currentLine].classList.add('visible');
            currentLine++;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                instructions.classList.add('fade-out');
                setTimeout(() => {
                    if (instructions && instructions.parentNode) {
                        instructions.parentNode.removeChild(instructions);
                    }
                }, 2000);
            }, 4500);
        }
    }, 800);
}

function cycleColorScheme() {
    if (isComplementary) {
        isComplementary = false;
        isMonochromatic = true;
    } else if (isMonochromatic) {
        isMonochromatic = false;
        isTriadic = true;
    } else if (isTriadic) {
        isTriadic = false;
        isSplitComplementary = true;
    } else {
        isSplitComplementary = false;
        isComplementary = true;
    }
    
    generateColorPalette();
    createGrid();
    createShapes();
    updateRefreshShapeColor();
    draw();
}

function updateRefreshShapeColor() {
    let rand = random(100);
    if (rand < 60) {
        refreshShapeColor = col60;
    } else if (rand < 90) {
        refreshShapeColor = col30;
    } else {
        refreshShapeColor = col10;
    }
}

function updateColorMode(hexColor) {
    // Calculate relative luminance using chroma.js
    const luminance = chroma(hexColor).get('hsl.l');

    document.documentElement.removeAttribute('data-theme');

    if (luminance < 0.5) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

// Modify your existing handleColorInput function
function handleColorInput(e) {
    let newColor = e.target.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
        defaultColor = newColor;
        ColorManager.setColor(newColor);
        updateColorMode(newColor);
        generateColorPalette();
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