
document.addEventListener("DOMContentLoaded", function() {
    // Initialize dashboard
    init();

    function init() {
        updateStatCardBorderColor();
    }

 

    function updateStatCardBorderColor() {
        const balanceCard = document.getElementById('balanceCard');
        const valueElement = balanceCard?.querySelector('.value');
        
        if (valueElement) {
            const valueText = valueElement.textContent;
            // Extract numeric value from text like "128 timer 30 minutter"
            const numericMatch = valueText.match(/^(-?\d+)/);
            
            if (numericMatch) {
                const numericValue = parseInt(numericMatch[1]);
                
                // Remove existing color classes
                balanceCard.classList.remove('blue', 'green', 'red');
                
                // Add appropriate color class based on value
                if (numericValue > 0) {
                    balanceCard.classList.add('green');
                } else if (numericValue < 0) {
                    balanceCard.classList.add('red');
                } else {
                    balanceCard.classList.add('blue');
                }
            }
        }
    }
});
