const ColorManager = {
    setLastColor: function(hexcode) {
        localStorage.setItem('lastHexcode', hexcode);
        localStorage.setItem('currentLibraryColor', hexcode);
        
        // Add the new color to swatches if it's not already there
        let swatchColors = this.getSwatchColors();
        
        if (!swatchColors.includes(hexcode)) {
            const emptyIndex = swatchColors.indexOf('#FFFFFF'); // Find first empty slot
            if (emptyIndex !== -1) {
                swatchColors[emptyIndex] = hexcode; // Replace with new color
            } else {
                swatchColors.push(hexcode); // If no empty slot, push new color
                if (swatchColors.length > 8) {
                    swatchColors.shift(); // Remove the oldest color if we exceed 8
                }
            }
            localStorage.setItem('swatchColors', JSON.stringify(swatchColors));
        }
    },

    setSwatchColors: function(newColors) {
        localStorage.setItem('swatchColors', JSON.stringify(newColors));
    },
    
    getLastColor: function() {
        return localStorage.getItem('currentLibraryColor') || localStorage.getItem('lastHexcode') || '#f58cbb';
    },
    
    getSwatchColors: function() {
        return JSON.parse(localStorage.getItem('swatchColors') || '[]');
    },

    updateLibraryColor: function(hexcode) {
        localStorage.setItem('currentLibraryColor', hexcode);
    }
};