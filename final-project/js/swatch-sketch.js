function cleanupContainers() {
    const webContainer = document.getElementById('web-p5-container');
    const mobileContainer = document.getElementById('mobile-p5-container');
    
    if (webContainer) {
        while (webContainer.firstChild) {
            webContainer.removeChild(webContainer.firstChild);
        }
    }
    if (mobileContainer) {
        while (mobileContainer.firstChild) {
            mobileContainer.removeChild(mobileContainer.firstChild);
        }
    }
}

function initDesktop() {
    let menuVisible = false;
    let hoveredStack = -1;
    let hoveredCard = -1;
    let cardLiftAmount = 0;
    let colors = ColorManager.getSwatchColors();
    const maxLiftAmount = 15;
    const easeSpeed = 0.4;

    const container = document.getElementById('web-p5-container');
    if (!container) return;

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    function setCanvasSize() {
        canvas.width = Math.min(window.innerWidth, 1200);
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
            colors = Array(32).fill('#FFFFFF');
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
        const cardWidth = 150;
        const cardHeight = 55;
        const cardOverlap = -15;
        const stackHeight = 200;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        drawRoundRect(x + 4, y + 4, cardWidth, stackHeight, 8);
        ctx.fill();

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgb(240, 240, 240)';
        drawRoundRect(x, y, cardWidth, stackHeight, 8);
        ctx.fill();
        ctx.stroke();

        for (let i = 0; i < 4; i++) {
            let cardY = y + (i * (cardHeight + cardOverlap)) + 6;
            let isHovered = (stackIndex === hoveredStack && i === hoveredCard);
            let liftAmount = isHovered ? cardLiftAmount : 0;
            let extraHeight = isHovered ? 10 : 0;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            drawRoundRect(x + 10, cardY + 2 - liftAmount, cardWidth - 20, cardHeight + extraHeight, 6);
            ctx.fill();

            ctx.fillStyle = stackColors[3-i] || '#FFFFFF';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;
            drawRoundRect(x + 10, cardY - liftAmount, cardWidth - 20, cardHeight + extraHeight, 6);
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
                    ColorManager.setLastColor(color);
                    window.location.href = `library.html?color=${encodeURIComponent(color)}`;
                }, 100);
            }
        }
        animate();
    }

    function draw() {
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cardWidth = 150;
        const stackHeight = 200;
        const gapBetweenColumns = 60;
        const gapBetweenStacks = 40;
        const marginX = 20;
        const marginTop = 20;
        const marginBottom = 140;

        const numColumns = Math.min(Math.floor((canvas.width - (marginX * 2 + 100)) / (cardWidth + gapBetweenColumns)), 4);
        const totalWidth = (numColumns * cardWidth) + ((numColumns - 1) * gapBetweenColumns);
        const totalHeight = (stackHeight * 2) + gapBetweenStacks;

        const startX = (canvas.width - totalWidth) / 2;
        const startY = marginTop + ((canvas.height - marginTop - marginBottom - totalHeight) / 2);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        drawRoundRect(marginX + 4, marginTop + 4, canvas.width - (marginX * 2) - 8, canvas.height - marginTop - marginBottom - 8, 12);
        ctx.fill();

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#F0FFF0';
        drawRoundRect(marginX, marginTop, canvas.width - (marginX * 2), canvas.height - marginTop - marginBottom, 12);
        ctx.fill();
        ctx.stroke();

        for (let col = 0; col < numColumns; col++) {
            const columnX = startX + (col * (cardWidth + gapBetweenColumns));
            drawCardStack(columnX, startY, colors.slice(col * 8, col * 8 + 4), col * 2);
            drawCardStack(columnX, startY + stackHeight + gapBetweenStacks, colors.slice(col * 8 + 4, col * 8 + 8), col * 2 + 1);
        }

        drawMenu();
        drawRefreshButton();

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

        if (mouseX > refreshButton.x && mouseX < refreshButton.x + refreshButton.width &&
            mouseY > refreshButton.y && mouseY < refreshButton.y + refreshButton.height) {
            colors = Array(32).fill('#FFFFFF');
            ColorManager.setSwatchColors(colors);
        }

        if (hoveredStack !== -1 && hoveredCard !== -1) {
            const colorIndex = hoveredStack * 4 + (3 - hoveredCard);
            const selectedColor = colors[colorIndex];
            drawBorderAndNavigate(selectedColor);
        }
    });

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        menuVisible = (mouseX < 100 && mouseY > canvas.height - 100);

        hoveredStack = -1;
        hoveredCard = -1;

        const cardWidth = 150;
        const cardHeight = 55;
        const cardOverlap = -15;
        const stackHeight = 200;
        const gapBetweenColumns = 60;
        const gapBetweenStacks = 40;
        const numColumns = Math.min(Math.floor((canvas.width - 100) / (cardWidth + gapBetweenColumns)), 4);
        const totalWidth = (numColumns * cardWidth) + ((numColumns - 1) * gapBetweenColumns);
        const totalHeight = (stackHeight * 2) + gapBetweenStacks;
        const startX = (canvas.width - totalWidth) / 2;
        const startY = (canvas.height - totalHeight) / 2;

        for (let col = 0; col < numColumns; col++) {
            const columnX = startX + (col * (cardWidth + gapBetweenColumns));
            for (let stack = 0; stack < 2; stack++) {
                const stackY = startY + (stack * (stackHeight + gapBetweenStacks));
                if (mouseX > columnX && mouseX < columnX + cardWidth && mouseY > stackY && mouseY < stackY + stackHeight) {
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
    draw();
}

function initMobile() {
    let menuVisible = false;
    let hoveredStack = -1;
    let hoveredCard = -1;
    let cardLiftAmount = 0;
    const maxLiftAmount = 15;
    const easeSpeed = 0.4;
    let colors = ColorManager.getSwatchColors();

    const container = document.getElementById('mobile-p5-container');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 430;
    canvas.height = 932;
    container.appendChild(canvas);

    const refreshButton = {
        x: canvas.width - 80,
        y: canvas.height - 130,
        width: 70,
        height: 30,
        label: 'refresh'
    };

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
            localStorage.setItem('swatchColors', JSON.stringify(colors));
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

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        drawRoundRect(x + 4, y + 4, cardWidth, stackHeight, 8);
        ctx.fill();

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgb(240, 240, 240)';
        drawRoundRect(x, y, cardWidth, stackHeight, 8);
        ctx.fill();
        ctx.stroke();

        for (let i = 0; i < 4; i++) {
            let cardY = y + (i * (cardHeight + cardOverlap)) + 6;
            let clipHeight = min(cardHeight - 8, (y + stackHeight) - cardY);
            if (clipHeight > 0) {
                let isHovered = (stackIndex === hoveredStack && i === hoveredCard);
                let liftAmount = isHovered ? cardLiftAmount : 0;
                let extraHeight = isHovered ? 10 : 0;

                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                drawRoundRect(x + 10, cardY + 2 - liftAmount, cardWidth - 20, clipHeight + extraHeight, 6);
                ctx.fill();

                ctx.lineWidth = 1.5;
                ctx.strokeStyle = '#000';
                ctx.fillStyle = stackColors[3-i];
                drawRoundRect(x + 10, cardY - liftAmount, cardWidth - 20, clipHeight + extraHeight, 6);
                ctx.fill();
                ctx.stroke();
            }
        }
    }

    function drawRefreshButton() {
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(refreshButton.label, refreshButton.x + refreshButton.width/2, refreshButton.y + refreshButton.height/2);
    }

    function resetColorSwatches() {
        colors = Array(8).fill('#FFFFFF');
        ColorManager.setSwatchColors(colors);
        localStorage.setItem('swatchColors', JSON.stringify(colors));
        draw();
    }

    function draw() {
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        drawRoundRect(24, 24, canvas.width-44, canvas.height-164, 12);
        ctx.fill();

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#F0FFF0';
        drawRoundRect(20, 20, canvas.width-40, canvas.height-160, 12);
        ctx.fill();
        ctx.stroke();

        const cardWidth = canvas.width - 280;
        const stackHeight = 200;
        const gapBetweenStacks = 40;
        const totalHeight = (stackHeight * 2) + gapBetweenStacks;
        const startY = (canvas.height - totalHeight) / 2 - 50;
        const startX = (canvas.width - cardWidth) / 2;

        drawCardStack(startX, startY, colors.slice(0, 4), 0);
        drawCardStack(startX, startY + stackHeight + gapBetweenStacks, colors.slice(4, 8), 1);

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

        if (hoveredStack !== -1 && hoveredCard !== -1) {
            cardLiftAmount = lerp(cardLiftAmount, maxLiftAmount, easeSpeed);
        } else {
            cardLiftAmount = lerp(cardLiftAmount, 0, easeSpeed);
        }

        drawRefreshButton();
        requestAnimationFrame(draw);
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
                    ColorManager.setLastColor(color);
                    window.location.href = `library.html?color=${encodeURIComponent(color)}`;
                }, 100);
            }
        }
        animate();
    }

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
            if (mouseX > startX && mouseX < startX + cardWidth && mouseY > stackY && mouseY < stackY + stackHeight) {
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

        if (mouseX > refreshButton.x && mouseX < refreshButton.x + refreshButton.width &&
            mouseY > refreshButton.y && mouseY < refreshButton.y + refreshButton.height) {
            resetColorSwatches();
        }

        const cardWidth = canvas.width - 280;
        const cardHeight = 55;
        const cardOverlap = -15;
        const stackHeight = 200;
        const gapBetweenStacks = 40;
        const totalHeight = (stackHeight * 2) + gapBetweenStacks;
        const startY = (canvas.height - totalHeight) / 2 - 50;
        const startX = (canvas.width - cardWidth) / 2;

        for (let stackIndex = 0; stackIndex < 2; stackIndex++) {
            let stackY = startY + (stackIndex * (stackHeight + gapBetweenStacks));
            if (mouseX > startX && mouseX < startX + cardWidth && mouseY > stackY && mouseY < stackY + stackHeight) {
                for (let cardIndex = 0; cardIndex < 4; cardIndex++) {
                    let cardY = stackY + (cardIndex * (cardHeight + cardOverlap)) + 6;
                    if (mouseY > cardY && mouseY < cardY + cardHeight) {
                        const colorIndex = stackIndex * 4 + (3 - cardIndex);
                        const selectedColor = colors[colorIndex];
                        drawBorderAndNavigate(selectedColor);
                        return;
                    }
                }
            }
        }
    });

    initializeColors();
    draw();
}

window.addEventListener('load', function() {
    cleanupContainers();
    if (window.innerWidth >= 992) {
        initDesktop();
    } else {
        initMobile();
    }
});

let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        cleanupContainers();
        if (window.innerWidth >= 992) {
            initDesktop();
        } else {
            initMobile();
        }
    }, 250);
});