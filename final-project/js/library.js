let mainBuffer;
let blurBuffer;
let shapes = [];
let backgroundColor;
const SHAPE_STORAGE_KEY = 'libraryShapes';
let grainDensity = 0.8;
let grainSize = 0.4;
let hoveredShape = null;
let selectedShape = null;
let transitionOpacity = 0;

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('p5-container');
    pixelDensity(0.5);
    
    // Create buffers
    mainBuffer = createGraphics(width, height);
    blurBuffer = createGraphics(width, height);
    
    // Get palette colors
    const palette = ColorManager.getLastPalette();
    backgroundColor = palette ? palette.col60 : '#f58cbb';
    
    // Load existing shapes or create new ones
    const savedShapes = localStorage.getItem(SHAPE_STORAGE_KEY);
    if (savedShapes) {
        shapes = JSON.parse(savedShapes);
    } else {
        createInitialShapes();
    }
    setupKeyboardNavigation();
    setupTypewriter();
    noStroke();
    smooth();
    frameRate(30);
}

function draw() {
    // Clear everything first
    clear();
    
    // Draw to main buffer
    mainBuffer.clear();
    mainBuffer.background(backgroundColor);
    
    // Draw shapes
    shapes.forEach(shape => {
        mainBuffer.fill(shape.color);
        
        // Add focus/hover indicator for filled shapes
        if ((shape === hoveredShape || shape.hasFocus) && shape.filled) {
            mainBuffer.strokeWeight(3);
            mainBuffer.stroke(255);
            // Add additional visual focus indicator
            if (shape.hasFocus) {
                mainBuffer.strokeWeight(5);
                mainBuffer.stroke(0, 150, 255);
            }
        } else {
            mainBuffer.noStroke();
        }
        
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

        // Add aria-live region for screen readers
        if (shape.filled) {
            const shapeRegion = document.createElement('div');
            shapeRegion.setAttribute('aria-live', 'polite');
            shapeRegion.setAttribute('role', 'status');
            shapeRegion.style.position = 'absolute';
            shapeRegion.style.left = '-9999px';
            shapeRegion.textContent = `Color swatch with hex code ${shape.color}`;
            document.body.appendChild(shapeRegion);
            setTimeout(() => document.body.removeChild(shapeRegion), 1000);
        }
    });
    
    // Apply blur effect
    blurBuffer.clear();
    blurBuffer.image(mainBuffer, 0, 0);
    blurBuffer.filter(BLUR, 0.0001);
    
    // Draw final content
    image(blurBuffer, 0, 0);
    
    // Apply grain effect
    loadPixels();
    for (let x = 0; x < width; x += 2) {
        for (let y = 0; y < height; y += 2) {
            if (random() < grainDensity) {
                let index = (x + y * width) * 4;
                let noiseVal = noise(x * grainSize, y * grainSize) * 50;
                pixels[index] = pixels[index] - noiseVal;
                pixels[index + 1] = pixels[index + 1] - noiseVal;
                pixels[index + 2] = pixels[index + 2] - noiseVal;
                
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

function createInitialShapes() {
    // Fixed number of shapes based on screen width
    let numShapes;
    if (width < 768) {
        numShapes = 5;
    } else if (width < 1024) {
        numShapes = 10;
    } else {
        numShapes = 14;
    }
    
    const cols = Math.ceil(Math.sqrt(numShapes));
    const rows = Math.ceil(numShapes / cols);
    const cellWidth = width / (cols + 1); // Add padding by using +1
    const cellHeight = height / (rows + 1);
    const padding = cellWidth * 0.1; // Reduced padding to 10%
    
    // Create all shapes at once in a grid
    for (let i = 0; i < numShapes; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        
        // Calculate position with tighter spacing
        const x = cellWidth * (col + 0.5) + random(-padding, padding);
        const y = cellHeight * (row + 0.5) + random(-padding, padding);
        
        shapes.push({
            x: x,
            y: y,
            size: random(250, 300),
            type: random(['star', 'flower', 'softstar']),
            rotation: random(TWO_PI),
            color: '#FFFFFF',
            filled: false,
            tabIndex: i + 3,
            ariaLabel: `Color swatch ${i + 1}`,
            role: 'button'
        });
    }
    saveShapes();
}

function updateShapeColors(newColor) {
    const unfilled = shapes.find(shape => !shape.filled);
    if (unfilled) {
        unfilled.color = newColor;
        unfilled.filled = true;
        updateAriaLiveRegion(`Shape filled with color ${newColor}`);
        saveShapes();
        draw();
    }
}

function saveShapes() {
    localStorage.setItem(SHAPE_STORAGE_KEY, JSON.stringify(shapes));
}

function drawStar(g, x, y, radius1, radius2) {
    g.beginShape();
    for (let i = 0; i < 10; i++) {
        let angle = TWO_PI * i / 10;
        let r = (i % 2 === 0) ? radius2 : radius1;
        let px = x + cos(angle) * r;
        let py = y + sin(angle) * r;
        g.vertex(px, py);
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
        g.vertex(px, py);
    }
    g.endShape(CLOSE);
}

function resetLibraryShapes() {
    shapes.forEach(shape => {
        shape.color = '#FFFFFF';
        shape.filled = false;
    });
    saveShapes();
    draw();
}

function drawBorderAndNavigate(color) {
    let startTime = millis();
    const animationDuration = 1000;
    
    function animate() {
        const elapsed = millis() - startTime;
        transitionOpacity = min(elapsed / animationDuration, 1);
        
        // Draw regular content
        draw();
        
        // Draw overlay
        mainBuffer.push();
        mainBuffer.fill(color);
        mainBuffer.noStroke();
        mainBuffer.rect(0, 0, width, height);
        mainBuffer.pop();
        
        if (transitionOpacity < 1) {
            requestAnimationFrame(animate);
        } else {
            setTimeout(() => {
                window.location.href = `index.html?color=${encodeURIComponent(color)}`;
            }, 100);
        }
    }
    
    animate();
}

function mousePressed() {
    // Find clicked shape
    shapes.forEach(shape => {
        if (shape.filled && isMouseOverShape(shape)) {
            selectedShape = shape;
            drawBorderAndNavigate(shape.color);
        }
    });
}

function mouseMoved() {
    // Find hovered shape
    hoveredShape = null;
    shapes.forEach(shape => {
        if (shape.filled && isMouseOverShape(shape)) {
            hoveredShape = shape;
            loop(); // Redraw to show highlight
        }
    });
    if (!hoveredShape) {
        loop(); // Redraw to remove highlight
    }
}

function isMouseOverShape(shape) {
    const d = dist(mouseX, mouseY, shape.x, shape.y);
    return d < shape.size/2;
}

function setupKeyboardNavigation() {
    let currentFocusIndex = -1;
    const backButton = document.querySelector('.back-button');
    const resetButton = document.querySelector('.library-refresh-button');
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            
            // Get all focusable elements
            const focusableElements = [
                backButton,
                resetButton,
                ...shapes.filter(shape => shape.filled)
            ];
            
            // Move focus to next element
            currentFocusIndex = (currentFocusIndex + 1) % focusableElements.length;
            
            // Reset shape focus states
            shapes.forEach(shape => shape.hasFocus = false);
            
            // Focus the current element
            const currentElement = focusableElements[currentFocusIndex];
            if (currentElement instanceof HTMLElement) {
                currentElement.focus();
            } else {
                // It's a shape
                currentElement.hasFocus = true;
                draw();
            }
        }
        
        if (e.key === 'Enter') {
            const focusedShape = shapes.find(shape => shape.hasFocus);
            if (focusedShape && focusedShape.filled) {
                drawBorderAndNavigate(focusedShape.color);
            }
        }
    });
}

function setupTypewriter() {
    // Check if this is the first visit to library page
    if (sessionStorage.getItem('hasVisitedLibrary')) {
        return;
    }
    sessionStorage.setItem('hasVisitedLibrary', 'true');

    const instructions = document.getElementById('instructions');
    instructions.innerHTML = '';

    const lines = [
        'here you will find a history',
        'of all the colors you have chosen so far,',
        'click on one to navigate back',
        'to that color scheme or',
        'click refresh to start a new palette'
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

function updateAriaLiveRegion(message) {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('class', 'visually-hidden');
    liveRegion.textContent = message;
    document.body.appendChild(liveRegion);
    setTimeout(() => document.body.removeChild(liveRegion), 1000);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    mainBuffer = createGraphics(width, height);
    blurBuffer = createGraphics(width, height);
    
    // Only create initial shapes if none exist
    if (shapes.length === 0) {
        createInitialShapes();
    }
    
    let targetShapes;
    if (width < 768) {
        targetShapes = 5;
    } else if (width < 1024) {
        targetShapes = 10;
    } else {
        targetShapes = 14;
    }
    
    const cols = Math.ceil(Math.sqrt(targetShapes));
    const rows = Math.ceil(targetShapes / cols);
    const cellWidth = width / cols;
    const cellHeight = height / rows;
    const padding = cellWidth * 0.2;
    const shapeSize = Math.min(cellWidth, cellHeight) * 0.6;
    
    // Update existing shapes' positions and sizes
    shapes.forEach((shape, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        
        shape.x = cellWidth * col + padding + random(cellWidth - 2 * padding);
        shape.y = cellHeight * row + padding + random(cellHeight - 2 * padding);
        shape.size = shapeSize;
        
        // Update visibility
        shape.visible = (
            shape.x >= -shape.size && 
            shape.x <= width + shape.size && 
            shape.y >= -shape.size && 
            shape.y <= height + shape.size
        );
    });
    
    saveShapes();
    draw();
}