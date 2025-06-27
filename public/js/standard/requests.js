// Requests page specific functionality

// Utility functions
const StudentUtils = {
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
            // Count pending requests from the DOM
            const pendingCards = document.querySelectorAll('.request-card .status-badge.status-pending');
            const pendingCount = pendingCards.length;
            requestsBadge.textContent = pendingCount;
            requestsBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
        }
    }
};

document.addEventListener("DOMContentLoaded", function() {
    
    const statusFilter = document.getElementById('statusFilter');
    const requestsGrid = document.getElementById('requestsGrid');

    init();

    function init() {
        setupEventListeners();
        StudentUtils.updateRequestsBadge();
    }

    function setupEventListeners() {
        if (statusFilter) {
            statusFilter.addEventListener('change', filterRequests);
        }
    }

    function filterRequests() {
        const selectedStatus = statusFilter.value;
        const allRequestCards = document.querySelectorAll('.request-card');
        
        let visibleCount = 0;
        
        allRequestCards.forEach(card => {
            const statusBadge = card.querySelector('.status-badge');
            const requestStatus = statusBadge.textContent.trim();
            
            if (selectedStatus === 'all' || requestStatus === selectedStatus) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show/hide no requests message
        updateNoRequestsMessage(visibleCount);
        updateRequestCount();
    }

    function updateNoRequestsMessage(visibleCount) {
        let noRequestsDiv = document.querySelector('.no-requests');
        
        if (visibleCount === 0) {
            if (!noRequestsDiv) {
                noRequestsDiv = document.createElement('div');
                noRequestsDiv.className = 'no-requests';
                noRequestsDiv.innerHTML = `
                    <i class="bi bi-calendar-x"></i>
                    <h4>No requests found</h4>
                    <p>No requests match your current filter</p>
                `;
                requestsGrid.appendChild(noRequestsDiv);
            }
            noRequestsDiv.style.display = 'block';
        } else if (noRequestsDiv) {
            noRequestsDiv.style.display = 'none';
        }
    }

    function updateRequestCount() {
        console.log("Updating request count...");
    }
});
