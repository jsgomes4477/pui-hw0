const ColorManager = {
    setLastColor: function(hexcode) {
        localStorage.setItem('lastHexcode', hexcode);
        localStorage.setItem('currentLibraryColor', hexcode);
        
        let swatchColors = this.getSwatchColors();
        if (!swatchColors.includes(hexcode)) {
            const emptyIndex = swatchColors.indexOf('#FFFFFF');
            if (emptyIndex !== -1) {
                swatchColors[emptyIndex] = hexcode;
            } else {
                swatchColors.push(hexcode);
                if (swatchColors.length > 8) {
                    swatchColors.shift();
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