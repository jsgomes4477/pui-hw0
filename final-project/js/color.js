const ColorManager = {
    setColor: function(hexcode) {
        localStorage.setItem('currentColor', hexcode);
    },
    
    getColor: function() {
        return localStorage.getItem('currentColor') || '#f58cbb';
    }
};