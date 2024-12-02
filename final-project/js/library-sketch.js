window.addEventListener('load', function() {
    if (window.innerWidth >= 992) {
        initDesktop();
    } else {
        initMobile();
    }
});

function initDesktop() {
    let currentColorScheme = 0;
    let isComplementary = true;
    let isMonochromatic = false;
    let isTriadic = false;
    let isSplitComplementary = false;
    let menuVisible = true;

    let currentSwatches = [];
    let generateButton;
    let saveButton;
    let leftMargin = 20;
    let rightMargin = 20;
    let topMargin = 20;
    let bottomMargin = 140;
    let col60, col30, col10;

    const urlParams = new URLSearchParams(window.location.search);
    const colorFromURL = urlParams.get('color');
    let baseColor = colorFromURL || ColorManager.getLastColor();

    const container = document.getElementById('web-p5-container');
    if (!container) return;

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const baseWidth = 430;
    const baseHeight = 932;
    const baseColumns = 5;
    const columnIncrement = 50;

    function setCanvasSize() {
        const extraWidth = Math.max(0, window.innerWidth - baseWidth);
        const extraColumns = Math.floor(extraWidth / columnIncrement);
        const totalColumns = baseColumns + extraColumns;
        canvas.width = baseWidth + (extraColumns * columnIncrement);
        canvas.height = baseHeight;
        generateSwatches(totalColumns);
        draw();
    }

    function generateSwatches(columns) {
        currentSwatches = [];
        let [col60Hex, col30Hex, col10Hex] = generateColorPalette();
        let availableWidth = baseWidth - (leftMargin + rightMargin);
        let dim = availableWidth / baseColumns;
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
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const availableWidth = canvas.width - (leftMargin + rightMargin);
        const fullColumnWidth = baseWidth - (leftMargin + rightMargin);

        function hasEnoughSpaceForColumn(x) {
            return x + fullColumnWidth <= canvas.width - rightMargin;
        }

        for (let row of currentSwatches) {
            for (let swatch of row) {
                if (!hasEnoughSpaceForColumn(swatch.x)) {
                    break;
                }
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.fillRect(swatch.x + 4, swatch.y + 4, swatch.size, swatch.size);
                ctx.fillStyle = swatch.color;
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(swatch.x, swatch.y, swatch.size, swatch.size, 12);
                ctx.fill();
                ctx.stroke();
            }
        }

        drawButton(generateButton, col30.hex());
        // drawButton(saveButton, col60.hex());
        drawMenu();
    }

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

        ColorManager.updateLibraryColor(col60.hex());
        return [col60.hex(), col30.hex(), col10.hex()];
    }

    function createButtons() {
        let availableWidth = 430 - (leftMargin + rightMargin);
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
        ctx.fillStyle = '#000';
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

    function drawBorderAndNavigate(color) {
        const cardWidth = canvas.width - 280;
        const totalHeight = 440;
        const startY = (canvas.height - totalHeight) / 2 - 50;
        const startX = (canvas.width - cardWidth) / 2;
        let opacity = 0;
        const animationDuration = 1000;
        const startTime = Date.now();
    
        function animate() {
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;
            opacity = Math.min(elapsedTime / animationDuration, 1);
    
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            draw();
    
            ctx.fillStyle = color;
            ctx.globalAlpha = opacity;
            drawRoundRect(startX, startY, cardWidth, totalHeight, 12);
            ctx.fill();
            ctx.globalAlpha = 1;
    
            if (opacity < 1) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => {
                    // Ensure both lastHexcode and currentLibraryColor are set
                    ColorManager.setLastColor(color);
                    window.location.href = `library.html?color=${encodeURIComponent(color)}`;
                }, 100);
            }
        }
        animate();
    }

    isComplementary = true;
    createButtons();
    generateColorPalette();
    setCanvasSize();

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        menuVisible = (mouseX < 100 && mouseY > canvas.height - 100);
        draw();
    });

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Add menu navigation
        if (menuVisible) {
            if (y < canvas.height - 50 && y > canvas.height - 70) {
                window.location.href = 'swatches.html';
            } else if (y < canvas.height - 70 && y > canvas.height - 90) {
                window.location.href = 'library.html';
            } else if (y < canvas.height - 90 && y > canvas.height - 110) {
                window.location.href = 'index.html';
            }
            return; // Add this to prevent other click handlers from firing when clicking menu
        }
        
        if (x > generateButton.x && x < generateButton.x + generateButton.width &&
            y > generateButton.y && y < generateButton.y + generateButton.height) {
            currentColorScheme = (currentColorScheme + 1) % 4;
            isComplementary = false;
            isMonochromatic = false;
            isTriadic = false;
            isSplitComplementary = false;

            switch(currentColorScheme) {
                case 0: isComplementary = true; break;
                case 1: isMonochromatic = true; break;
                case 2: isTriadic = true; break;
                case 3: isSplitComplementary = true; break;
            }
            setCanvasSize();
        }
        
        if (hoveredStack !== -1 && hoveredCard !== -1) {
            const colorIndex = hoveredStack * 4 + (3 - hoveredCard);
            const selectedColor = colors[colorIndex];
            ColorManager.setLastColor(selectedColor);
            drawBorderAndNavigate(selectedColor);
        }
    });

    container.appendChild(canvas);
}

function initMobile() {
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

    const urlParams = new URLSearchParams(window.location.search);
    const colorFromURL = urlParams.get('color');
    let baseColor = colorFromURL || ColorManager.getLastColor();
    let isComplementary = false;
    let isMonochromatic = false;
    let isTriadic = false;
    let isSplitComplementary = false;

    const container = document.getElementById('mobile-p5-container');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 430;
    canvas.height = 932;
    container.appendChild(canvas);

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

        ColorManager.updateLibraryColor(col60.hex());
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
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let row of currentSwatches) {
            for (let swatch of row) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.fillRect(swatch.x + 4, swatch.y + 4, swatch.size, swatch.size);
                ctx.fillStyle = swatch.color;
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(swatch.x, swatch.y, swatch.size, swatch.size, 12);
                ctx.fill();
                ctx.stroke();
            }
        }

        drawButton(generateButton, col30.hex());
        drawButton(saveButton, col60.hex());

        ctx.fillStyle = '#000';
        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('MENU', 15, canvas.height - 30);

        if (menuVisible) {
            ctx.font = '18px Arial';
            ctx.fillText('SWATCHES', 15, canvas.height - 60);
            ctx.fillText('LIBRARY', 15, canvas.height - 80);
            ctx.fillText('HOME', 15, canvas.height - 100);
        }

        printColorHexCodes();
        requestAnimationFrame(draw);
    }

    function printColorHexCodes() {
        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        let yPosition = canvas.height - bottomMargin + 10;
        ctx.fillText(`${col60.hex().substring(1)}`, canvas.width-rightMargin*3, yPosition + 16);
        ctx.fillText(`${col30.hex().substring(1)}`, canvas.width-rightMargin*3, yPosition + 32);
        ctx.fillText(`${col10.hex().substring(1)}`, canvas.width-rightMargin*3, yPosition + 48);
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

    isComplementary = true;
    createButtons();
    generateColorPalette();
    generateSwatches();
    draw();

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        menuVisible = (mouseX < 100 && mouseY > canvas.height - 100);
    });

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
    
        // Add menu navigation
        if (menuVisible) {
            if (y < canvas.height - 50 && y > canvas.height - 70) {
                window.location.href = 'swatches.html';
            } else if (y < canvas.height - 70 && y > canvas.height - 90) {
                window.location.href = 'library.html';
            } else if (y < canvas.height - 90 && y > canvas.height - 110) {
                window.location.href = 'index.html';
            }
            return; // Add this to prevent other click handlers from firing when clicking menu
        }

        if (x > generateButton.x && x < generateButton.x + generateButton.width &&
            y > generateButton.y && y < generateButton.y + generateButton.height) {
            currentColorScheme = (currentColorScheme + 1) % 4;
            isComplementary = false;
            isMonochromatic = false;
            isTriadic = false;
            isSplitComplementary = false;

            switch(currentColorScheme) {
                case 0: isComplementary = true; break;
                case 1: isMonochromatic = true; break;
                case 2: isTriadic = true; break;
                case 3: isSplitComplementary = true; break;
            }
            generateSwatches();
        }
    });
}

let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        if (window.innerWidth >= 992) {
            initDesktop();
        } else {
            initMobile();
        }
    }, 250);
});