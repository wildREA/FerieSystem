// Dashboard functionality
document.addEventListener("DOMContentLoaded", function() {
    // Initialize sidebar interactivity
    const sidebarItems = document.querySelectorAll('.sidebar ul li');
    
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            sidebarItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
        });
    });

    // Animation for bars in charts
    const animateBars = () => {
        document.querySelectorAll('.bar').forEach(bar => {
            const currentHeight = parseInt(bar.style.height);
            const randomChange = Math.random() * 20 - 10; // Random number between -10 and 10
            let newHeight = currentHeight + randomChange;
            
            // Keep within bounds
            if (newHeight < 20) newHeight = 20;
            if (newHeight > 95) newHeight = 95;
            
            bar.style.height = `${newHeight}%`;
            bar.style.transition = 'height 0.5s ease';
        });
    };
    
    // Simulate real-time data updates
    setInterval(animateBars, 2000);
    
    // Chart cards interaction
    const chartCards = document.querySelectorAll('.chart-card');
    
    chartCards.forEach(card => {
        // Add hover effect
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
            this.style.transition = 'transform 0.3s, box-shadow 0.3s';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
        
        // Close button functionality
        const closeBtn = card.querySelector('.actions button:last-child');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';
                card.style.transition = 'opacity 0.3s, transform 0.3s';
                
                setTimeout(() => {
                    card.parentNode.style.display = 'none';
                }, 300);
            });
        }
    });
    
    // Simulate loading data on page load
    simulateLoading();
});

// Function to simulate data loading
function simulateLoading() {
    const chartContents = document.querySelectorAll('.chart-content');
    
    chartContents.forEach(chart => {
        chart.style.opacity = '0';
    });
    
    // Gradually show charts one by one
    chartContents.forEach((chart, index) => {
        setTimeout(() => {
            chart.style.opacity = '1';
            chart.style.transition = 'opacity 0.5s ease';
        }, 300 * index);
    });
}
