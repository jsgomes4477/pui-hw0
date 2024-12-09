function handleAccessibleContainer() {
    // Clean up and prepare containers
    const mainContent = document.getElementById('main-content');
    const webContainer = document.getElementById('web-p5-container');
    const mobileContainer = document.getElementById('mobile-p5-container');
    
    // Clean up existing containers
    [webContainer, mobileContainer].forEach(container => {
        if (container) {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }
    });

    // Select appropriate container based on window width
    const container = window.innerWidth >= 992 ? webContainer : mobileContainer;
    
    if (!container) return;
    
    // Set ARIA attributes for accessibility
    container.setAttribute('role', 'application');
    container.setAttribute('aria-label', 'Color picker canvas');
    
    // Ensure container is visible
    container.style.display = 'block';
    container.style.visibility = 'visible';
    container.removeAttribute('aria-hidden');
    
    // Set main content landmark for screen readers
    if (mainContent) {
        mainContent.setAttribute('aria-live', 'polite');
    }
    
    return container;
}

// Add this after your existing handleAccessibleContainer function
function setupAccessibleInteractions(canvas, container) {
    // Make canvas focusable
    canvas.setAttribute('tabindex', '0');
    canvas.setAttribute('role', 'application');
    canvas.setAttribute('aria-label', 'Color selection canvas');

    // Add keyboard navigation
    canvas.addEventListener('keydown', handleKeyboardNavigation);
    
    // Add ARIA live region
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    container.appendChild(liveRegion);

    return liveRegion;
}

// Add this function for keyboard navigation
function handleKeyboardNavigation(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        if (menuVisible) {
            const rect = this.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height - 70;
            
            const event = new MouseEvent('click', {
                clientX: rect.left + centerX,
                clientY: rect.top + centerY
            });
            this.dispatchEvent(event);
        }
    }
    
    if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        menuVisible = true;
        draw();
    }
}

function initDesktop() {
    let menuVisible = false;
    let currentColor = '#f58cbb';
    let inputBox;
    let errorDiv;
    
    const container = handleAccessibleContainer();
    if (!container) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Base dimensions for aspect ratio
    const baseWidth = 430;
    const baseHeight = 932;
    
    // Set canvas size maintaining aspect ratio
    canvas.width = baseWidth;
    canvas.height = baseHeight;
    
    // Center the canvas in the container - only for home page
    const totalWidth = canvas.width;
    const startX = (window.innerWidth - totalWidth) / 2;
    container.classList.add('home-desktop');
    
    container.appendChild(canvas);
    
    // Create and position input box
    inputBox = document.createElement('input');
    inputBox.value = '#';
    inputBox.className = 'color-input';
    inputBox.setAttribute('aria-label', 'Color hex code input');

    // Create error message div
    errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    container.appendChild(errorDiv);

    function draw() {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw main color swatch with shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(24, 24, canvas.width-48, canvas.height-240, 12);

        // Draw main color swatch
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.fillStyle = currentColor;
        ctx.beginPath();
        ctx.roundRect(20, 20, canvas.width-40, canvas.height-236, 12);
        ctx.fill();
        ctx.stroke();

        // Draw "HEXCODE:" text
        ctx.fillStyle = '#000';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('enter a hexcode', canvas.width/2 - 70, canvas.height/2 - 80);

        // Draw menu
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

    function handleInput() {
        let hexValue = inputBox.value;
        let hexRegex = /^#[0-9A-Fa-f]{6}$/;
        
        if (hexRegex.test(hexValue)) {
            currentColor = hexValue;
            ColorManager.setLastColor(hexValue);
            errorDiv.innerHTML = '';
            updateAccessibleStatus(hexValue);
            draw();
        } else if (hexValue.length === 7) {
            errorDiv.innerHTML = 'Please enter a valid hex code (e.g., #FF0000)';
            updateAccessibleStatus('Invalid color code entered');
        }
    }

    inputBox.addEventListener('input', handleInput);
    currentColor = ColorManager.getLastColor();

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        menuVisible = (mouseX < 100 && mouseY > canvas.height - 100);
        draw();
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
    });

    draw();
}

function initMobile() {
    let menuVisible = false;
    let currentColor = '#f58cbb';
    let inputBox;
    let errorDiv;

    const container = handleAccessibleContainer();
    if (!container) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 430;
    canvas.height = 932;
    container.appendChild(canvas);

    // Create and position input box
    inputBox = document.createElement('input');
    inputBox.value = '#';
    inputBox.style.fontSize = '18px';
    inputBox.style.padding = '8px';
    inputBox.style.borderRadius = '12px';
    inputBox.style.border = '2px solid black';
    inputBox.style.width = '280px';
    inputBox.style.textAlign = 'left';  // Add this line
    inputBox.style.position = 'absolute';
    inputBox.style.left = `${canvas.width/2 - 130}px`;
    inputBox.style.top = `${canvas.height/2 - 150}px`;
    inputBox.setAttribute('aria-label', 'Color hex code input');
    container.appendChild(inputBox);

    // Create error message div
    errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.position = 'absolute';
    errorDiv.style.left = `${canvas.width/2 - 140}px`;
    errorDiv.style.top = `${canvas.height/2 + 30}px`;
    errorDiv.style.fontFamily = 'Arial';
    errorDiv.style.color = 'red';
    container.appendChild(errorDiv);

    function draw() {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw main color swatch with shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(24, 24, canvas.width-48, canvas.height-240, 12);

        // Draw main color swatch
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.fillStyle = currentColor;
        ctx.beginPath();
        ctx.roundRect(20, 20, canvas.width-40, canvas.height-236, 12);
        ctx.fill();
        ctx.stroke();

        // Draw "HEXCODE:" text
        ctx.fillStyle = '#000';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('enter a hexcode', canvas.width/2 - 70, canvas.height/2 - 80);

        // Draw menu
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

    function handleInput() {
        let hexValue = inputBox.value;
        let hexRegex = /^#[0-9A-Fa-f]{6}$/;
        
        if (hexRegex.test(hexValue)) {
            currentColor = hexValue;
            ColorManager.setLastColor(hexValue);
            errorDiv.innerHTML = '';
            updateAccessibleStatus(hexValue);
            draw();
        } else if (hexValue.length === 7) {
            errorDiv.innerHTML = 'Please enter a valid hex code (e.g., #FF0000)';
            updateAccessibleStatus('Invalid color code entered');
        }
    }

    inputBox.addEventListener('input', handleInput);
    currentColor = ColorManager.getLastColor();

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        menuVisible = (mouseX < 100 && mouseY > canvas.height - 100);
        draw();
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
    });

    currentColor = ColorManager.getLastColor();
    draw();
}

window.addEventListener('load', function() {
    const container = handleAccessibleContainer();
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
        const container = handleAccessibleContainer();
        if (window.innerWidth >= 992) {
            initDesktop();
        } else {
            initMobile();
        }
    }, 250);
});