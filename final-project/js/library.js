let mainBuffer;
let shapes = [];
let backgroundColor;
const SHAPE_STORAGE_KEY = 'libraryShapes';

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('p5-container');
    
    // Get palette colors
    const palette = ColorManager.getLastPalette();
    backgroundColor = palette ? palette.col60 : '#f58cbb';

    const resetButton = document.querySelector('.library-refresh-button');
    if (resetButton) {
        resetButton.addEventListener('click', resetLibraryShapes);
    }
    
    // Load existing shapes or create new ones
    const savedShapes = localStorage.getItem(SHAPE_STORAGE_KEY);
    if (savedShapes) {
        shapes = JSON.parse(savedShapes);
    } else {
        createInitialShapes();
    }
    
    noStroke();
    frameRate(30);
}

function createInitialShapes() {
    const numShapes = constrain(floor(width * height / 200000), 4, 12);
    
    // Get the last palette
    const palette = ColorManager.getLastPalette();
    const colors = palette ? [palette.col60, palette.col30, palette.col10] : ['#FFFFFF'];
    
    for (let i = 0; i < numShapes; i++) {
        shapes.push({
            x: random(width * 0.2, width * 0.8),
            y: random(height * 0.2, height * 0.8),
            size: random(150, 300),
            type: random(['star', 'flower', 'softstar']),
            rotation: random(TWO_PI),
            color: i < colors.length ? colors[i % colors.length] : '#FFFFFF',
            filled: i < colors.length
        });
    }
    saveShapes();
}

function draw() {
    background(backgroundColor);
    
    // Draw shapes
    shapes.forEach(shape => {
        fill(shape.color);
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
    
    noLoop();
}

function updateShapeColors(newColor) {
    const palette = ColorManager.getLastPalette();
    if (!palette) return;

    // Find first unfilled shape
    const unfilled = shapes.find(shape => !shape.filled);
    if (unfilled) {
        const colors = [palette.col60, palette.col30, palette.col10];
        unfilled.color = random(colors);
        unfilled.filled = true;
        saveShapes();
        draw();
    }
}

function saveShapes() {
    localStorage.setItem(SHAPE_STORAGE_KEY, JSON.stringify(shapes));
}

// Drawing functions remain the same
function drawStar(x, y, radius1, radius2) {
    beginShape();
    for (let i = 0; i < 10; i++) {
        let angle = TWO_PI * i / 10;
        let r = (i % 2 === 0) ? radius2 : radius1;
        let px = x + cos(angle) * r;
        let py = y + sin(angle) * r;
        vertex(px, py);
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
        vertex(px, py);
    }
    endShape(CLOSE);
}

function resetLibraryShapes() {
    shapes.forEach(shape => {
        shape.color = '#FFFFFF';
        shape.filled = false;
    });
    saveShapes();
    draw();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    // Calculate new number of shapes needed
    const newNumShapes = constrain(floor(width * height / 200000), 4, 12);
    
    if (newNumShapes > shapes.length) {
        // Add new shapes while preserving existing ones
        const additionalShapes = newNumShapes - shapes.length;
        for (let i = 0; i < additionalShapes; i++) {
            shapes.push({
                x: random(width * 0.2, width * 0.8),
                y: random(height * 0.2, height * 0.8),
                size: random(150, 300),
                type: random(['star', 'flower', 'softstar']),
                rotation: random(TWO_PI),
                color: '#FFFFFF',
                filled: false
            });
        }
    } else if (newNumShapes < shapes.length) {
        // Remove unfilled shapes first, then filled ones if necessary
        const shapesToRemove = shapes.length - newNumShapes;
        for (let i = 0; i < shapesToRemove; i++) {
            const unfilledIndex = shapes.findIndex(shape => !shape.filled);
            if (unfilledIndex !== -1) {
                shapes.splice(unfilledIndex, 1);
            } else {
                shapes.pop();
            }
        }
    }
    
    saveShapes();
    draw();
}