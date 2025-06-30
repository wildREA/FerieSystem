// Requests page specific functionality

document.addEventListener("DOMContentLoaded", function() {
    // Reference to the current page element
    const currentPageElement = document.getElementById('currentPage');
    
    // Only initialize if we are on the requests page
    if (currentPageElement && currentPageElement.value === 'requests') {
        initRequestsPage();
    }
    
    /**
     * Initialize the requests page functionality
     */
    function initRequestsPage() {
        // Set up the approved requests toggle functionality
        setupApprovedRequestsToggle();
        
        // Check if we have a search query stored in localStorage from redirect
        const searchQuery = localStorage.getItem('searchQuery');
        if (searchQuery) {
            // Get the search input field
            const searchInput = document.getElementById('studentSearch');
            if (searchInput) {
                // Set the search input value
                searchInput.value = searchQuery;
                // Trigger the search function if available
                if (typeof window.handleSearch === 'function') {
                    // Create a synthetic event with the searchInput as target
                    const event = new Event('input', {
                        bubbles: true,
                        cancelable: true,
                    });
                    
                    // Add the target property to the event
                    Object.defineProperty(event, 'target', {
                        value: searchInput,
                        enumerable: true
                    });
                    
                    window.handleSearch(event);
                }
                
                // Clear the localStorage item to prevent future redirects
                localStorage.removeItem('searchQuery');
            }
        }
    }
    
    /**
     * Set up toggle functionality for active/inactive approved requests
     */
    function setupApprovedRequestsToggle() {
        const activeBtn = document.getElementById('activeRequestsBtn');
        const inactiveBtn = document.getElementById('inactiveRequestsBtn');
        
        if (activeBtn && inactiveBtn) {
            activeBtn.addEventListener('click', function() {
                if (!activeBtn.classList.contains('active')) {
                    activeBtn.classList.add('active');
                    activeBtn.classList.remove('btn-outline-primary');
                    activeBtn.classList.add('btn-primary');
                    
                    inactiveBtn.classList.remove('active');
                    inactiveBtn.classList.remove('btn-primary');
                    inactiveBtn.classList.add('btn-outline-primary');
                    
                    // Show active requests, hide inactive ones
                    toggleApprovedRequests(true);
                }
            });
            
            inactiveBtn.addEventListener('click', function() {
                if (!inactiveBtn.classList.contains('active')) {
                    inactiveBtn.classList.add('active');
                    inactiveBtn.classList.remove('btn-outline-primary');
                    inactiveBtn.classList.add('btn-primary');
                    
                    activeBtn.classList.remove('active');
                    activeBtn.classList.remove('btn-primary');
                    activeBtn.classList.add('btn-outline-primary');
                    
                    // Show inactive requests, hide active ones
                    toggleApprovedRequests(false);
                }
            });
        }
    }
    
    /**
     * Toggle between active and inactive approved requests
     * @param {boolean} showActive - Whether to show active requests
     */
    function toggleApprovedRequests(showActive) {
        const approvedCards = document.querySelectorAll('#approvedRequestsGrid .request-card');
        const noApprovedResults = document.getElementById('noApprovedResults');
        let visibleCount = 0;
        
        approvedCards.forEach(card => {
            const isActive = card.classList.contains('active') || card.classList.contains('pending-start');
            const isInactive = card.classList.contains('inactive');
            
            if ((showActive && isActive) || (!showActive && isInactive)) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show/hide no results message
        if (noApprovedResults) {
            noApprovedResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }
});

/**
 * Approve a student's vacation request
 * @param {string} requestId - The ID of the request being approved
 */
window.approveRequest = function(requestId) {
    if (!requestId) {
        console.error('Request ID is required');
        return;
    }
    
    // Make API call to approve the request
    fetch('/api/requests/approve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            requestId: requestId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success notification
            if (typeof window.showNotification === 'function') {
                window.showNotification('Request has been approved', 'success');
            } else {
                alert('Request has been approved');
            }
            
            // Reload the page to show updated data
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            // Show error notification
            if (typeof window.showNotification === 'function') {
                window.showNotification(data.error || 'Failed to approve request', 'danger');
            } else {
                alert(data.error || 'Failed to approve request');
            }
        }
    })
    .catch(error => {
        console.error('Error approving request:', error);
        if (typeof window.showNotification === 'function') {
            window.showNotification('An error occurred while approving the request', 'danger');
        } else {
            alert('An error occurred while approving the request');
        }
    });
};

/**
 * Deny a student's vacation request
 * @param {string} requestId - The ID of the request being denied
 */
window.denyRequest = function(requestId) {
    if (!requestId) {
        console.error('Request ID is required');
        return;
    }
    
    // Make API call to deny the request
    fetch('/api/requests/deny', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            requestId: requestId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success notification
            if (typeof window.showNotification === 'function') {
                window.showNotification('Request has been denied', 'warning');
            } else {
                alert('Request has been denied');
            }
            
            // Reload the page to show updated data
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            // Show error notification
            if (typeof window.showNotification === 'function') {
                window.showNotification(data.error || 'Failed to deny request', 'danger');
            } else {
                alert(data.error || 'Failed to deny request');
            }
        }
    })
    .catch(error => {
        console.error('Error denying request:', error);
        if (typeof window.showNotification === 'function') {
            window.showNotification('An error occurred while denying the request', 'danger');
        } else {
            alert('An error occurred while denying the request');
        }
    });
};

/**
 * View details of a specific request
 * @param {string} requestId - The ID of the request to view
 */
window.viewRequestDetails = function(requestId) {
    // This function can be expanded to show a modal with detailed request information
    // For now, we'll just log the request ID
    console.log('Viewing details for request:', requestId);
    
    // You can add a modal here similar to the student details modal
    // For demonstration, we'll show a simple alert
    alert('Request details functionality can be implemented here for request ID: ' + requestId);
};

/**
 * Load and display all requests for superuser management
 */
window.loadRequests = function() {
    fetch('/api/requests')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Process and display the requests
            displayRequests(data.data);
        } else {
            console.error('Failed to load requests:', data.error);
            if (typeof window.showNotification === 'function') {
                window.showNotification(data.error || 'Failed to load requests', 'danger');
            }
        }
    })
    .catch(error => {
        console.error('Error loading requests:', error);
        if (typeof window.showNotification === 'function') {
            window.showNotification('An error occurred while loading requests', 'danger');
        }
    });
};

/**
 * Display requests in the UI
 * @param {Array} requests - Array of request objects
 */
function displayRequests(requests) {
    const pendingGrid = document.getElementById('studentsGrid');
    const approvedGrid = document.getElementById('approvedRequestsGrid');
    const noResults = document.getElementById('noResults');
    const noApprovedResults = document.getElementById('noApprovedResults');
    
    if (!pendingGrid || !approvedGrid) {
        console.error('Required DOM elements not found');
        return;
    }
    
    // Separate requests by status
    const pendingRequests = requests.filter(req => req.status === 'pending');
    const approvedRequests = requests.filter(req => req.status === 'approved');
    const deniedRequests = requests.filter(req => req.status === 'denied');
    
    // Display pending requests
    if (pendingRequests.length > 0) {
        pendingGrid.innerHTML = pendingRequests.map(request => createRequestCard(request, 'pending')).join('');
        if (noResults) noResults.style.display = 'none';
    } else {
        pendingGrid.innerHTML = '';
        if (noResults) noResults.style.display = 'block';
    }
    
    // Display approved requests
    if (approvedRequests.length > 0) {
        approvedGrid.innerHTML = approvedRequests.map(request => createRequestCard(request, 'approved')).join('');
        if (noApprovedResults) noApprovedResults.style.display = 'none';
    } else {
        approvedGrid.innerHTML = '';
        if (noApprovedResults) noApprovedResults.style.display = 'block';
    }
}

/**
 * Create HTML for a request card
 * @param {Object} request - Request object
 * @param {string} section - 'pending' or 'approved'
 * @returns {string} HTML string for the request card
 */
function createRequestCard(request, section) {
    const startDate = new Date(request.start_datetime).toLocaleDateString();
    const endDate = new Date(request.end_datetime).toLocaleDateString();
    const startTime = new Date(request.start_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const endTime = new Date(request.end_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const statusBadge = request.status === 'pending' ? 
        '<span class="badge bg-warning text-dark">Pending</span>' :
        request.status === 'approved' ? 
        '<span class="badge bg-success">Approved</span>' :
        '<span class="badge bg-danger">Denied</span>';
    
    const actionButtons = section === 'pending' ? `
        <div class="mt-3">
            <button class="btn btn-success btn-sm me-2" onclick="approveRequest('${request.id}')">
                <i class="bi bi-check-circle"></i> Approve
            </button>
            <button class="btn btn-danger btn-sm" onclick="denyRequest('${request.id}')">
                <i class="bi bi-x-circle"></i> Deny
            </button>
        </div>
    ` : '';
    
    return `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="card-title mb-0">${request.name || request.username}</h6>
                    ${statusBadge}
                </div>
                <p class="card-text mb-1">
                    <strong>Type:</strong> ${request.request_type}
                </p>
                <p class="card-text mb-1">
                    <strong>Duration:</strong> ${startDate} ${startTime} - ${endDate} ${endTime}
                </p>
                <p class="card-text mb-1">
                    <strong>Total Hours:</strong> ${request.total_hours}
                </p>
                ${request.reason ? `<p class="card-text mb-1"><strong>Reason:</strong> ${request.reason}</p>` : ''}
                <p class="card-text">
                    <small class="text-muted">Submitted: ${new Date(request.created_at).toLocaleDateString()}</small>
                </p>
                ${actionButtons}
            </div>
        </div>
    `;
}

// Load requests when the page loads
document.addEventListener("DOMContentLoaded", function() {
    const currentPageElement = document.getElementById('currentPage');
    
    if (currentPageElement && currentPageElement.value === 'requests') {
        // Load requests after a short delay to ensure all elements are ready
        setTimeout(() => {
            if (typeof window.loadRequests === 'function') {
                window.loadRequests();
            }
        }, 100);
    }
});
