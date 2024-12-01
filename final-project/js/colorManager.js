const ColorManager = {
    setLastColor: function(hexcode) {
        localStorage.setItem('lastHexcode', hexcode);
        // Also store this as the current library color
        localStorage.setItem('currentLibraryColor', hexcode);
    },
    
    getLastColor: function() {
        // For library page, prioritize the current library color
        return localStorage.getItem('currentLibraryColor') || localStorage.getItem('lastHexcode') || '#f58cbb';
    },
    
    addToSwatches: function(hexcode) {
        let colors = JSON.parse(localStorage.getItem('swatchColors') || '[]');
        if (colors.length < 8) {
            colors.push(hexcode);
            localStorage.setItem('swatchColors', JSON.stringify(colors));
        }
    },
    
    getSwatchColors: function() {
        return JSON.parse(localStorage.getItem('swatchColors') || '[]');
    },

    // Add this method to update library color specifically
    updateLibraryColor: function(hexcode) {
        localStorage.setItem('currentLibraryColor', hexcode);
    }
};