let webCanvas, mobileCanvas;

function setup() {
    // Create canvases that fill their containers
    webCanvas = createCanvas(windowWidth, windowHeight);
    webCanvas.parent('web-p5-container');

    mobileCanvas = createCanvas(windowWidth, windowHeight);
    mobileCanvas.parent('mobile-p5-container');

    windowResized();
}

function windowResized() {
    if (windowWidth >= 992) { // Bootstrap's lg breakpoint
        resizeCanvas(windowWidth, windowHeight);
        webCanvas.show();
        mobileCanvas.hide();
    } else {
        resizeCanvas(windowWidth, windowHeight);
        webCanvas.hide();
        mobileCanvas.show();
    }
}

// Main page for JS multi page and web/mobile logic