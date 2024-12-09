const ColorManager = {
    setLastColor: function(hexcode) {
        localStorage.setItem('lastHexcode', hexcode);
        localStorage.setItem('currentLibraryColor', hexcode);
        
        // Add the new color to library shapes if not already there
        const shapes = JSON.parse(localStorage.getItem('libraryShapes') || '[]');
        const unfilled = shapes.find(shape => !shape.filled);
        if (unfilled) {
            unfilled.color = hexcode;  // Use the actual hexcode instead of random palette color
            unfilled.filled = true;
            localStorage.setItem('libraryShapes', JSON.stringify(shapes));
        }
    },
    
    getLastColor: function() {
        const palette = this.getLastPalette();
        return palette ? palette.col60 : '#f58cbb';
    },
    
    setColor: function(hexcode) {
        localStorage.setItem('currentColor', hexcode);
        this.setLastColor(hexcode);
    },
    
    getColor: function() {
        return localStorage.getItem('currentColor') || '#f58cbb';
    },

    generateAndSaveColorPalette: function(hexcode) {
        const baseHex = this.thresholdColor(hexcode);
        const palette = {
            col60: baseHex,
            col30: chroma(baseHex).set('hsl.h', '+180').hex(),
            col10: chroma.mix(baseHex, chroma(baseHex).set('hsl.h', '+180'), 0.5).saturate(1).hex()
        };
        localStorage.setItem('lastPalette', JSON.stringify(palette));
    },

    getLastPalette: function() {
        return JSON.parse(localStorage.getItem('lastPalette'));
    },

    thresholdColor: function(color) {
        let rgb = chroma(color).rgb();
        let hsl = chroma(rgb).hsl();
        hsl[1] = Math.min(hsl[1], 0.80);
        hsl[2] = Math.min(hsl[2], 0.65);
        return chroma.hsl(...hsl).hex();
    }
};