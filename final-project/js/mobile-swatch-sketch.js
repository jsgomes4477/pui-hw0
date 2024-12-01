document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let menuVisible = false;
    let hoveredStack = -1;
    let hoveredCard = -1;
    let cardLiftAmount = 0;
    const maxLiftAmount = 15;
    const easeSpeed = 0.4;
    let colors = ColorManager.getSwatchColors();

    // Canvas setup
    const container = document.getElementById('mobile-p5-container');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 430;
    canvas.height = 932;
    container.appendChild(canvas);

    // Helper functions
    function lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }

    function min(a, b) {
        return Math.min(a, b);
    }

    function initializeColors() {
        const storedColors = localStorage.getItem('swatchColors');
        if (storedColors) {
            colors = JSON.parse(storedColors);
        } else {
            colors = Array(8).fill('#FFFFFF');
        }
        
        const lastHexcode = localStorage.getItem('lastHexcode');
        if (lastHexcode) {
            const emptyIndex = colors.findIndex(color => color === '#FFFFFF');
            if (emptyIndex !== -1) {
                colors[emptyIndex] = lastHexcode;
                localStorage.setItem('swatchColors', JSON.stringify(colors));
                localStorage.removeItem('lastHexcode');
            }
        }
    }

    function drawRoundRect(x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    function drawCardStack(x, y, stackColors, stackIndex) {
        const cardWidth = canvas.width - 280;
        const cardHeight = 55;
        const cardOverlap = -15;
        const stackHeight = 200;

        // Draw stack holder shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        drawRoundRect(x + 4, y + 4, cardWidth, stackHeight, 8);
        ctx.fill();

        // Draw stack holder
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgb(240, 240, 240)';
        drawRoundRect(x, y, cardWidth, stackHeight, 8);
        ctx.fill();
        ctx.stroke();

        // Draw cards
        for (let i = 0; i < 4; i++) {
            let cardY = y + (i * (cardHeight + cardOverlap)) + 6;
            let clipHeight = min(cardHeight - 8, (y + stackHeight) - cardY);
            
            if (clipHeight > 0) {
                let isHovered = (stackIndex === hoveredStack && i === hoveredCard);
                let liftAmount = isHovered ? cardLiftAmount : 0;
                let extraHeight = isHovered ? 10 : 0;

                // Card shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                drawRoundRect(x + 10, cardY + 2 - liftAmount, cardWidth - 20, clipHeight + extraHeight, 6);
                ctx.fill();

                // Card
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = '#000';
                ctx.fillStyle = stackColors[3-i];
                drawRoundRect(x + 10, cardY - liftAmount, cardWidth - 20, clipHeight + extraHeight, 6);
                ctx.fill();
                ctx.stroke();
            }
        }
    }

    function draw() {
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Background shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        drawRoundRect(24, 24, canvas.width-44, canvas.height-164, 12);
        ctx.fill();

        // Main background
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#F0FFF0';
        drawRoundRect(20, 20, canvas.width-40, canvas.height-160, 12);
        ctx.fill();
        ctx.stroke();

        // Layout constants
        const cardWidth = canvas.width - 280;
        const stackHeight = 200;
        const gapBetweenStacks = 40;
        const totalHeight = (stackHeight * 2) + gapBetweenStacks;
        const startY = (canvas.height - totalHeight) / 2 - 50;
        const startX = (canvas.width - cardWidth) / 2;

        // Draw stacks
        drawCardStack(startX, startY, colors.slice(0, 4), 0);
        drawCardStack(startX, startY + stackHeight + gapBetweenStacks, colors.slice(4, 8), 1);

        // Menu drawing code 
        ctx.fillStyle = '#000';
        ctx.font = '24px Arial'; // Menu title
        ctx.textAlign = 'left';
        ctx.fillText('MENU', 15, canvas.height - 30);

        if (menuVisible) {
            ctx.font = '18px Arial'; // Menu items - same size as home page
            ctx.fillText('SWATCHES', 15, canvas.height - 60);
            ctx.fillText('LIBRARY', 15, canvas.height - 80);
            ctx.fillText('HOME', 15, canvas.height - 100);
        }
        // Update animation
        if (hoveredStack !== -1 && hoveredCard !== -1) {
            cardLiftAmount = lerp(cardLiftAmount, maxLiftAmount, easeSpeed);
        } else {
            cardLiftAmount = lerp(cardLiftAmount, 0, easeSpeed);
        }

        requestAnimationFrame(draw);
    }

    // Event Listeners
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        menuVisible = (mouseX < 100 && mouseY > canvas.height - 100);

        const cardWidth = canvas.width - 280;
        const cardHeight = 55;
        const cardOverlap = -15;
        const stackHeight = 200;
        const gapBetweenStacks = 40;
        const totalHeight = (stackHeight * 2) + gapBetweenStacks;
        const startY = (canvas.height - totalHeight) / 2 - 50;
        const startX = (canvas.width - cardWidth) / 2;

        hoveredStack = -1;
        hoveredCard = -1;

        for (let stackIndex = 0; stackIndex < 2; stackIndex++) {
            let stackY = startY + (stackIndex * (stackHeight + gapBetweenStacks));
            if (mouseX > startX && mouseX < startX + cardWidth && 
                mouseY > stackY && mouseY < stackY + stackHeight) {
                hoveredStack = stackIndex;
                for (let cardIndex = 0; cardIndex < 4; cardIndex++) {
                    let cardY = stackY + (cardIndex * (cardHeight + cardOverlap)) + 6;
                    if (mouseY > cardY && mouseY < cardY + cardHeight + 10) {
                        hoveredCard = cardIndex;
                        break;
                    }
                }
                break;
            }
        }
    });

    canvas.addEventListener('click', (event) => {
        if (menuVisible) {
            const rect = canvas.getBoundingClientRect();
            const mouseY = event.clientY - rect.top;
            
            if (mouseY < canvas.height - 50 && mouseY > canvas.height - 70) {
                window.location.href = 'swatches.html';
            } else if (mouseY < canvas.height - 70 && mouseY > canvas.height - 90) {
                window.location.href = 'library.html';
            } else if (mouseY < canvas.height - 90 && mouseY > canvas.height - 110) {
                window.location.href = 'index.html';
            }
        }
    });

    // Initialize and start animation
    initializeColors();
    draw();
});