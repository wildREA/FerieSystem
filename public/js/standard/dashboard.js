// Utility functions for dashboard
const StudentUtils = {
    calculateVacationHours() {
        const approvedRequests = requestsData.filter(r => r.status === 'approved');
        const pendingRequests = requestsData.filter(r => r.status === 'pending');
        
        const usedHours = approvedRequests.reduce((sum, r) => sum + r.hours, 0);
        const pendingHours = pendingRequests.reduce((sum, r) => sum + r.hours, 0);
        const remainingHours = studentData.totalVacationHours - usedHours;
        
        return {
            totalHours: studentData.totalVacationHours,
            usedHours: usedHours,
            pendingHours: pendingHours,
            remainingHours: remainingHours
        };
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    updateRequestsBadge() {
        const requestsBadge = document.getElementById('requestsBadge');
        if (requestsBadge) {
            const pendingCount = requestsData.filter(r => r.status === 'pending').length;
            requestsBadge.textContent = pendingCount;
            requestsBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
        }
    }
};

document.addEventListener("DOMContentLoaded", function() {
    // Initialize dashboard
    init();

    function init() {
        renderRecentRequests();
        updateStatCardBorderColor();
        StudentUtils.updateRequestsBadge();
    }

 

    function renderRecentRequests() {
        const recentRequestsList = document.getElementById('recentRequestsList');
        const recentRequests = requestsData.slice(0, 3);
        
        if (recentRequests.length === 0) {
            recentRequestsList.innerHTML = `
                <div class="no-requests">
                    <i class="bi bi-calendar-x"></i>
                    <p>No recent requests</p>
                </div>
            `;
            return;
        }
        
        recentRequestsList.innerHTML = recentRequests.map(request => `
            <div class="recent-request-item">
                <div class="recent-request-info">
                    <div class="recent-request-dates">
                        ${StudentUtils.formatDate(request.startDate)} - ${StudentUtils.formatDate(request.endDate)}
                    </div>
                    <div class="recent-request-reason">${request.reason}</div>
                </div>
                <div class="status-badge status-${request.status}">${request.status}</div>
            </div>
        `).join('');
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
