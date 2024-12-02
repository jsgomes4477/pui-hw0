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
            const cardWidth = 150; // Fixed width
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
            ctx.fillStyle = '#000000';
            ctx.font = '18px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(refreshButton.label, refreshButton.x + refreshButton.width/2, refreshButton.y + refreshButton.height/2);
        }

        function draw() {
            ctx.fillStyle = '#FFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        
            // Fixed dimensions
            const cardWidth = 150;
            const stackHeight = 200;
            const gapBetweenColumns = 60;
            const gapBetweenStacks = 40;
            const marginX = 20;
            const marginTop = 20;
            const marginBottom = 140;
        
            // Calculate number of columns based on width
            const numColumns = Math.min(Math.floor((canvas.width - (marginX * 2 + 100)) / (cardWidth + gapBetweenColumns)), 4);
            
            // Calculate total width needed for all columns
            const totalWidth = (numColumns * cardWidth) + ((numColumns - 1) * gapBetweenColumns);
            const totalHeight = (stackHeight * 2) + gapBetweenStacks;
            
            // Center everything
            const startX = (canvas.width - totalWidth) / 2;
            const startY = marginTop + ((canvas.height - marginTop - marginBottom - totalHeight) / 2);
        
            // Draw background shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            drawRoundRect(marginX + 4, marginTop + 4, canvas.width - (marginX * 2) - 8, 
                         canvas.height - marginTop - marginBottom - 8, 12);
            ctx.fill();
        
            // Draw main background
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.fillStyle = '#F0FFF0';
            drawRoundRect(marginX, marginTop, canvas.width - (marginX * 2), 
                         canvas.height - marginTop - marginBottom, 12);
            ctx.fill();
            ctx.stroke();
        
            // Draw columns
            for (let col = 0; col < numColumns; col++) {
                const columnX = startX + (col * (cardWidth + gapBetweenColumns));
                drawCardStack(columnX, startY, colors.slice(col * 8, col * 8 + 4), col * 2);
                drawCardStack(columnX, startY + stackHeight + gapBetweenStacks, 
                             colors.slice(col * 8 + 4, col * 8 + 8), col * 2 + 1);
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

        canvas.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
        
            if (menuVisible) {
                if (mouseY < canvas.height - 50 && mouseY > canvas.height - 70) {
                    window.location.href = 'swatches.html';
                } else if (mouseY < canvas.height - 70 && mouseY > canvas.height - 90) {
                    window.location.href = 'library.html';
                } else if (mouseY < canvas.height - 90 && mouseY > canvas.height - 110) {
                    window.location.href = 'index.html';
                }
            }
        
            // Handle refresh button click
            if (mouseX > refreshButton.x && mouseX < refreshButton.x + refreshButton.width &&
                mouseY > refreshButton.y && mouseY < refreshButton.y + refreshButton.height) {
                colors = Array(8).fill('#FFFFFF');
                ColorManager.setSwatchColors(colors);
            }
        });

        canvas.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            
            menuVisible = (mouseX < 100 && mouseY > canvas.height - 100);
            
            // Update hover states
            hoveredStack = -1;
            hoveredCard = -1;
            
            const cardWidth = 150;
            const stackHeight = 200;
            const gapBetweenColumns = 60;
            const gapBetweenStacks = 40;
            const numColumns = Math.min(Math.floor((canvas.width - 100) / (cardWidth + gapBetweenColumns)), 4);
            const totalWidth = (numColumns * cardWidth) + ((numColumns - 1) * gapBetweenColumns);
            const startX = (canvas.width - totalWidth) / 2;
            const startY = (canvas.height - totalHeight) / 2;
        
            // Check hover for each column
            for (let col = 0; col < numColumns; col++) {
                const columnX = startX + (col * (cardWidth + gapBetweenColumns));
                for (let stack = 0; stack < 2; stack++) {
                    const stackY = startY + (stack * (stackHeight + gapBetweenStacks));
                    if (mouseX > columnX && mouseX < columnX + cardWidth && 
                        mouseY > stackY && mouseY < stackY + stackHeight) {
                        hoveredStack = col * 2 + stack;
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
            }
        });

        initializeColors();
        draw(); // Start the animation loop
    }

    // Initialize desktop version if screen is wide enough
    if (window.innerWidth >= 440) { //changed this from 992
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