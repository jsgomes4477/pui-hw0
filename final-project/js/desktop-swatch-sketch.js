// desktop-sketch.js (similar structure for other desktop files)
function setupDesktop() {
    // Desktop-specific setup
}

function drawDesktop() {
    // Desktop-specific drawing
}

if (window.innerWidth >= 992) { // Bootstrap's lg breakpoint
    setupDesktop();
    drawDesktop();
}