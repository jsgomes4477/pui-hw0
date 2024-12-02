// Wait for DOM to load before initializing desktop version
window.addEventListener('load', function() {
    // Only initialize if we're in desktop mode
    function initDesktop() {
        // Global variables
        let menuVisible = false;
        let hoveredStack = -1;
        let hoveredCard = -1;
        let cardLiftAmount = 0;
        let colors = ColorManager.getSwatchColors();
        const maxLiftAmount = 15;
        const easeSpeed = 0.4;

        // Get container and create canvas
        const container = document.getElementById('web-p5-container');
        if (!container) return; // Safety check

        // Remove any existing canvas
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set initial canvas size
        function setCanvasSize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        setCanvasSize();
        container.appendChild(canvas);

        const refreshButton = {
            x: canvas.width - 80,
            y: canvas.height - 130,
            width: 70,
            height: 30,
            label: 'refresh'
        };

        function initializeColors() {
            const storedColors = localStorage.getItem('swatchColors');
            if (storedColors) {
                colors = JSON.parse(storedColors);
            } else {
                colors = Array(8).fill('#FFFFFF');
                localStorage.setItem('swatchColors', JSON.stringify(colors));
            }
        }

        function drawRoundRect(x, y, width, height, radius) {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.arcTo(x + width, y, x + width, y + height, radius);
            ctx.arcTo(x + width, y + height, x, y + height, radius);
            ctx.arcTo(x, y + height, x, y, radius);
            ctx.arcTo(x, y, x + width, y, radius);
            ctx.closePath();
        }

        function drawCardStack(x, y, stackColors, stackIndex) {
            const cardWidth = Math.min(canvas.width - 280, 800);
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
                let isHovered = (stackIndex === hoveredStack && i === hoveredCard);
                let liftAmount = isHovered ? cardLiftAmount : 0;

                // Card shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                drawRoundRect(x + 10, cardY + 2 - liftAmount, cardWidth - 20, cardHeight, 6);
                ctx.fill();

                // Card
                ctx.fillStyle = stackColors[3-i] || '#FFFFFF';
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1.5;
                drawRoundRect(x + 10, cardY - liftAmount, cardWidth - 20, cardHeight, 6);
                ctx.fill();
                ctx.stroke();
            }
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

        function drawRefreshButton() {
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            drawRoundRect(refreshButton.x, refreshButton.y, refreshButton.width, refreshButton.height, 8);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#000000';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(refreshButton.label, refreshButton.x + refreshButton.width/2, refreshButton.y + refreshButton.height/2);
        }

        function draw() {
            ctx.fillStyle = '#FFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Calculate dynamic layout
            const cardWidth = Math.min(canvas.width - 280, 800);
            const stackHeight = 200;
            const gapBetweenStacks = 40;
            const numStacks = Math.floor(canvas.height > 1920 ? 5 : 4);
            const totalHeight = (stackHeight * numStacks) + (gapBetweenStacks * (numStacks - 1));
            const startY = (canvas.height - totalHeight) / 2;
            const startX = (canvas.width - cardWidth) / 2;

            // Draw background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            drawRoundRect(24, 24, canvas.width-48, canvas.height-48, 12);
            ctx.fill();

            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.fillStyle = '#F0FFF0';
            drawRoundRect(20, 20, canvas.width-40, canvas.height-40, 12);
            ctx.fill();
            ctx.stroke();

            // Draw stacks
            for (let i = 0; i < numStacks; i++) {
                const stackY = startY + (i * (stackHeight + gapBetweenStacks));
                const colorSlice = colors.slice(i * 4, (i + 1) * 4);
                drawCardStack(startX, stackY, colorSlice, i);
            }

            drawMenu();
            drawRefreshButton();

            // Update animation
            if (hoveredStack !== -1 && hoveredCard !== -1) {
                cardLiftAmount += (maxLiftAmount - cardLiftAmount) * easeSpeed;
            } else {
                cardLiftAmount += (0 - cardLiftAmount) * easeSpeed;
            }

            requestAnimationFrame(draw);
        }

        // Animation loop
        function animate() {
            if (window.innerWidth >= 992) {
                draw();
                requestAnimationFrame(animate);
            }
        }

        // Start animation
        animate();
    }

    // Initialize desktop version if screen is wide enough
    if (window.innerWidth >= 992) {
        initDesktop();
    }

    // Handle resize events
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            if (window.innerWidth >= 992) {
                initDesktop();
            }
        }, 250); // Debounce resize events
    });
});