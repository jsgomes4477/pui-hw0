const ColorManager = {
    setLastColor: function(hexcode) {
        localStorage.setItem('lastHexcode', hexcode);
    },
    
    getLastColor: function() {
        return localStorage.getItem('lastHexcode') || '#f58cbb';
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
    }
};