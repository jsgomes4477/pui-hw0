const MenuManager = {
    init: function(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.menuVisible = false;
        this.setupEventListeners();
    },

    setupEventListeners: function() {
        this.canvas.addEventListener('mousemove', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            
            // Increased detection area
            this.menuVisible = (mouseX < 120 && mouseY > this.canvas.height - 120);
            this.draw();
        });

        this.canvas.addEventListener('click', (event) => {
            if (!this.menuVisible) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const mouseY = event.clientY - rect.top;
            
            if (mouseY < this.canvas.height - 50 && mouseY > this.canvas.height - 70) {
                window.location.href = 'swatches.html';
            } else if (mouseY < this.canvas.height - 70 && mouseY > this.canvas.height - 90) {
                window.location.href = 'library.html';
            } else if (mouseY < this.canvas.height - 90 && mouseY > this.canvas.height - 110) {
                window.location.href = 'index.html';
            }
        });
    },

    draw: function() {
        // Draw menu
        this.ctx.fillStyle = '#000';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('MENU', 15, this.canvas.height - 30);

        if (this.menuVisible) {
            this.ctx.font = '18px Arial';
            this.ctx.fillText('SWATCHES', 15, this.canvas.height - 60);
            this.ctx.fillText('LIBRARY', 15, this.canvas.height - 80);
            this.ctx.fillText('HOME', 15, this.canvas.height - 100);
        }
    }
};