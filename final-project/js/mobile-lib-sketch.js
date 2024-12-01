document.addEventListener('DOMContentLoaded', function() {
    // Original global variables
    let menuVisible = true;
    let currentSwatches = [];
    let generateButton;
    let saveButton;
    let currentColorScheme = 0;
    let leftMargin = 20;
    let rightMargin = 20;
    let topMargin = 20;
    let bottomMargin = 140;
    let col60, col30, col10;
    let baseColor = '#f58cbb';
    let isComplementary = false;
    let isMonochromatic = false;
    let isTriadic = false;
    let isSplitComplementary = false;

    // Canvas setup
    const container = document.getElementById('mobile-p5-container');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 430;
    canvas.height = 932;
    container.appendChild(canvas);

    // Your original color functions
    function thresholdColor(color) {
        let rgb = chroma(color).rgb();
        let hsl = chroma(rgb).hsl();
        hsl[1] = Math.min(hsl[1], 0.80);
        hsl[2] = Math.min(hsl[2], 0.65);
        return chroma.hsl(...hsl);
    }

    function generateColorPalette() {
        let baseHex = thresholdColor(baseColor);
        let flipHeuristic = Math.random() > 0.5;
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
        } else {
            col60 = baseHex;
            col30 = chroma(baseHex).set('hsl.h', '+180');
            col10 = chroma.mix(col60, col30, 0.5).saturate(1);
        }
        return [col60.hex(), col30.hex(), col10.hex()];
    }

    function createButtons() {
        let availableWidth = canvas.width - (leftMargin + rightMargin);
        let dim = availableWidth/5;
        
        generateButton = {
            x: leftMargin + (5-2) * dim,
            y: topMargin + 3 * dim,
            width: dim * 2,
            height: dim,
            label: 'generate'
        };
        
        saveButton = {
            x: leftMargin,
            y: canvas.height - bottomMargin - dim + 9,
            width: dim * 2,
            height: dim,
            label: 'save'
        };
    }

    function generateSwatches() {
        currentSwatches = [];
        let [col60Hex, col30Hex, col10Hex] = generateColorPalette();
        
        let availableWidth = canvas.width - (leftMargin + rightMargin);
        let dim = availableWidth/5;
        
        for (let y = topMargin; y < canvas.height - bottomMargin; y += dim) {
            let row = [];
            for (let x = leftMargin; x < canvas.width - rightMargin; x += dim) {
                let rand = Math.random() * 100;
                let swatchColor;
                if (rand < 60) {
                    swatchColor = col60Hex;
                } else if (rand < 90) {
                    swatchColor = col30Hex;
                } else {
                    swatchColor = col10Hex;
                }
                row.push({x, y, color: swatchColor, size: dim});
            }
            currentSwatches.push(row);
        }
    }

    function draw() {
        // Clear canvas
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw swatches
        for (let row of currentSwatches) {
            for (let swatch of row) {
                // Shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.fillRect(swatch.x + 4, swatch.y + 4, swatch.size, swatch.size);

                // Swatch
                ctx.fillStyle = swatch.color;
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(swatch.x, swatch.y, swatch.size, swatch.size, 12);
                ctx.fill();
                ctx.stroke();
            }
        }

        // Draw buttons
        drawButton(generateButton, col30.hex());
        drawButton(saveButton, col60.hex());

        // Draw menu
        drawMenu();
    }

    function drawButton(button, color) {
        ctx.fillStyle = color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(button.x, button.y, button.width, button.height, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(button.label, button.x + button.width/2, button.y + button.height/2);
    }

    function drawMenu() {
        ctx.fillStyle = '#000000';
        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('MENU', 15, canvas.height - 30);

        if (menuVisible) {
            ctx.font = '18px Arial';
            ctx.fillText('SWATCHES', 15, canvas.height - 60);
            ctx.fillText('LIBRARY', 15, canvas.height - 80);
            ctx.fillText('HOME', 15, canvas.height - 100);
        }
    }

    // Initialize
    isComplementary = true;
    createButtons();
    generateColorPalette();
    generateSwatches();
    draw();

    // Event Listeners
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        let previousMenuState = menuVisible;
        menuVisible = (x < 100 && y > canvas.height - 100);

        if (previousMenuState !== menuVisible) {
            draw();
        }
    });

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (x > generateButton.x && x < generateButton.x + generateButton.width &&
            y > generateButton.y && y < generateButton.y + generateButton.height) {
            currentColorScheme = (currentColorScheme + 1) % 4;
            isComplementary = false;
            isMonochromatic = false;
            isTriadic = false;
            isSplitComplementary = false;
            
            switch(currentColorScheme) {
                case 0:
                    isComplementary = true;
                    break;
                case 1:
                    isMonochromatic = true;
                    break;
                case 2:
                    isTriadic = true;
                    break;
                case 3:
                    isSplitComplementary = true;
                    break;
            }
            generateSwatches();
            draw();
        }

        if (menuVisible) {
            if (y < canvas.height - 50 && y > canvas.height - 70) {
                window.location.href = 'swatches.html';
            } else if (y < canvas.height - 70 && y > canvas.height - 90) {
                window.location.href = 'library.html';
            } else if (y < canvas.height - 90 && y > canvas.height - 110) {
                window.location.href = 'index.html';
            }
        }
    });
});