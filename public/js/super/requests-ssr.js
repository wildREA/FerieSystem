// Enhanced requests page functionality for server-side rendered data

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
        setupToggleButtons();
        setupSearch();
        
        // Check if we have a search query stored in localStorage from redirect
        const searchQuery = localStorage.getItem('searchQuery');
        if (searchQuery) {
            const searchInput = document.getElementById('studentSearch');
            if (searchInput) {
                searchInput.value = searchQuery;
                handleSearch({ target: searchInput });
                localStorage.removeItem('searchQuery');
            }
        }
    }
    
    /**
     * Setup toggle buttons for active/completed approved requests
     */
    function setupToggleButtons() {
        const activeRequestsBtn = document.getElementById("activeRequestsBtn");
        const inactiveRequestsBtn = document.getElementById("inactiveRequestsBtn");
        const approvedRequestsGrid = document.getElementById("approvedRequestsGrid");
        const completedRequestsGrid = document.getElementById("completedRequestsGrid");
        const noApprovedResults = document.getElementById("noApprovedResults");
        
        if (!activeRequestsBtn || !inactiveRequestsBtn) return;
        
        // Active requests button click
        activeRequestsBtn.addEventListener('click', function() {
            // Update button styles
            activeRequestsBtn.classList.add("btn-primary", "active");
            activeRequestsBtn.classList.remove("btn-outline-primary");
            inactiveRequestsBtn.classList.add("btn-outline-primary");
            inactiveRequestsBtn.classList.remove("btn-primary", "active");
            
            // Show active requests, hide completed
            if (approvedRequestsGrid) {
                approvedRequestsGrid.style.display = 'grid';
            }
            if (completedRequestsGrid) {
                completedRequestsGrid.style.display = 'none';
            }
            
            // Check if active requests are empty
            const hasActiveRequests = approvedRequestsGrid && approvedRequestsGrid.children.length > 0;
            if (noApprovedResults) {
                noApprovedResults.style.display = hasActiveRequests ? 'none' : 'block';
            }
        });
        
        // Inactive/completed requests button click
        inactiveRequestsBtn.addEventListener('click', function() {
            // Update button styles
            inactiveRequestsBtn.classList.add("btn-primary", "active");
            inactiveRequestsBtn.classList.remove("btn-outline-primary");
            activeRequestsBtn.classList.add("btn-outline-primary");
            activeRequestsBtn.classList.remove("btn-primary", "active");
            
            // Show completed requests, hide active
            if (approvedRequestsGrid) {
                approvedRequestsGrid.style.display = 'none';
            }
            if (completedRequestsGrid) {
                completedRequestsGrid.style.display = 'grid';
            }
            
            // Check if completed requests are empty
            const hasCompletedRequests = completedRequestsGrid && completedRequestsGrid.children.length > 0;
            if (noApprovedResults) {
                noApprovedResults.style.display = hasCompletedRequests ? 'none' : 'block';
            }
        });
    }
    
    /**
     * Setup search functionality
     */
    function setupSearch() {
        const searchInput = document.getElementById('studentSearch');
        const searchResults = document.getElementById('searchResults');
        
        if (!searchInput) return;
        
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('focus', showSearchResults);
        searchInput.addEventListener('blur', hideSearchResults);
        
        // Close search results when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                hideSearchResults();
            }
        });
    }
    
    /**
     * Handle search input
     */
    function handleSearch(event) {
        const query = event.target.value.toLowerCase().trim();
        const studentsGrid = document.getElementById('studentsGrid');
        const noResults = document.getElementById('noResults');
        const searchResults = document.getElementById('searchResults');
        
        if (!studentsGrid) return;
        
        const requestCards = studentsGrid.querySelectorAll('.request-card, .student-card');
        let visibleCount = 0;
        let matchingCards = [];
        
        requestCards.forEach(card => {
            const studentName = card.querySelector('.student-info h4')?.textContent.toLowerCase() || '';
            const status = card.querySelector('.status-badge, .request-status-badge')?.textContent.toLowerCase() || '';
            const reason = card.querySelector('.detail-value')?.textContent.toLowerCase() || '';
            
            const matches = query === '' || 
                           studentName.includes(query) || 
                           status.includes(query) || 
                           reason.includes(query);
            
            if (matches) {
                card.style.display = 'block';
                visibleCount++;
                matchingCards.push({
                    name: card.querySelector('.student-info h4')?.textContent || '',
                    status: card.querySelector('.status-badge, .request-status-badge')?.textContent || '',
                    element: card
                });
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show/hide no results message
        if (noResults) {
            noResults.style.display = visibleCount === 0 && query !== '' ? 'block' : 'none';
        }
        
        // Update search suggestions
        if (query && searchResults) {
            showSearchSuggestions(matchingCards.slice(0, 5), query);
        } else if (searchResults) {
            searchResults.style.display = 'none';
        }
    }
    
    /**
     * Show search suggestions
     */
    function showSearchSuggestions(matches, query) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;
        
        if (matches.length === 0) {
            searchResults.style.display = 'none';
            return;
        }
        
        const suggestions = matches.map((match, index) => `
            <div class="search-result-item" onclick="selectSearchResult('${match.name}')">
                <div class="search-result-name">${highlightText(match.name, query)}</div>
                <div class="search-result-status">${match.status}</div>
            </div>
        `).join('');
        
        searchResults.innerHTML = suggestions;
        searchResults.style.display = 'block';
    }
    
    /**
     * Highlight matching text in search results
     */
    function highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    /**
     * Show search results dropdown
     */
    function showSearchResults() {
        const searchResults = document.getElementById('searchResults');
        const searchInput = document.getElementById('studentSearch');
        
        if (searchResults && searchInput && searchInput.value.trim()) {
            searchResults.style.display = 'block';
        }
    }
    
    /**
     * Hide search results dropdown
     */
    function hideSearchResults() {
        setTimeout(() => {
            const searchResults = document.getElementById('searchResults');
            if (searchResults) {
                searchResults.style.display = 'none';
            }
        }, 150);
    }
    
    /**
     * Select a search result
     */
    window.selectSearchResult = function(studentName) {
        const studentsGrid = document.getElementById('studentsGrid');
        if (!studentsGrid) return;
        
        // Find the card by student name
        const allCards = studentsGrid.querySelectorAll('.request-card, .student-card');
        let targetCard = null;
        
        allCards.forEach(card => {
            const cardName = card.querySelector('.student-info h4')?.textContent || '';
            if (cardName === studentName) {
                targetCard = card;
            }
        });
        
        if (targetCard) {
            // Hide all cards first
            allCards.forEach(card => card.style.display = 'none');
            
            // Show only the selected card
            targetCard.style.display = 'block';
            
            // Update search input
            const searchInput = document.getElementById('studentSearch');
            if (searchInput) {
                searchInput.value = studentName;
            }
            
            // Hide search results
            hideSearchResults();
            
            // Scroll to the card
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };
    
    /**
     * Global view details function
     */
    window.viewDetails = function(requestId) {
        console.log('Viewing details for request:', requestId);
        
        // Find the request card by request ID
        const requestCard = document.querySelector(`[data-request-id="${requestId}"]`);
        if (!requestCard) {
            window.showNotification('Request not found', 'danger');
            return;
        }
        
        // Extract data from the card
        const studentName = requestCard.querySelector('.student-info h4')?.textContent || 'N/A';
        const status = requestCard.querySelector('.status-badge, .request-status-badge')?.textContent || 'N/A';
        const reason = requestCard.querySelector('.detail-value')?.textContent || 'N/A';
        
        // Get dates from the date blocks
        const dateBlocks = requestCard.querySelectorAll('.date-block');
        let startDate = 'N/A', endDate = 'N/A', days = 'N/A';
        
        dateBlocks.forEach(block => {
            const label = block.querySelector('.date-label')?.textContent;
            const value = block.querySelector('.date-value')?.textContent;
            
            if (label === 'Start Date') startDate = value;
            if (label === 'End Date') endDate = value;
            if (label === 'Days') days = value;
        });
        
        // If date blocks not found, try alternative selectors
        if (startDate === 'N/A') {
            const detailRows = requestCard.querySelectorAll('.detail-row');
            detailRows.forEach(row => {
                const label = row.querySelector('.detail-label')?.textContent;
                const value = row.querySelector('.detail-value')?.textContent;
                
                if (label === 'Start Date:') startDate = value;
                if (label === 'End Date:') endDate = value;
                if (label === 'Requested:') days = value;
            });
        }
        
        // Calculate working days and FF cost
        const numDays = parseInt(days) || 0;
        const ffCost = numDays * 8; // 8 FF per day
        
        // Create and show the modal
        createDetailModal({
            requestId,
            studentName,
            status,
            reason,
            startDate,
            endDate,
            days: numDays,
            ffCost
        });
    };
    
    /**
     * Create and display the detail modal
     */
    function createDetailModal(data) {
        // Remove existing modal if present
        const existingModal = document.getElementById('requestDetailModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal HTML
        const modalHTML = `
            <div class="modal fade" id="requestDetailModal" tabindex="-1" aria-labelledby="requestDetailModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="requestDetailModalLabel">
                                <i class="bi bi-calendar-check me-2"></i>
                                Vacation Request Details
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <!-- Student Information -->
                                <div class="col-md-6 mb-4">
                                    <div class="card h-100">
                                        <div class="card-header bg-light">
                                            <h6 class="mb-0"><i class="bi bi-person me-2"></i>Student Information</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="mb-3">
                                                <label class="form-label fw-bold">Name:</label>
                                                <p class="mb-0">${data.studentName}</p>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label fw-bold">Request ID:</label>
                                                <p class="mb-0"><code>${data.requestId}</code></p>
                                            </div>
                                            <div class="mb-0">
                                                <label class="form-label fw-bold">Status:</label>
                                                <span class="badge ${getStatusBadgeBootstrap(data.status)} fs-6">${data.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Request Details -->
                                <div class="col-md-6 mb-4">
                                    <div class="card h-100">
                                        <div class="card-header bg-light">
                                            <h6 class="mb-0"><i class="bi bi-calendar-range me-2"></i>Request Details</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="mb-3">
                                                <label class="form-label fw-bold">Start Date:</label>
                                                <p class="mb-0">${data.startDate}</p>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label fw-bold">End Date:</label>
                                                <p class="mb-0">${data.endDate}</p>
                                            </div>
                                            <div class="mb-0">
                                                <label class="form-label fw-bold">Duration:</label>
                                                <p class="mb-0">${data.days} working day${data.days !== 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- FF Cost Information -->
                            <div class="row">
                                <div class="col-12 mb-4">
                                    <div class="card">
                                        <div class="card-header bg-warning text-dark">
                                            <h6 class="mb-0"><i class="bi bi-currency-exchange me-2"></i>Ferie Fradrag (FF) Usage</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="row text-center">
                                                <div class="col-md-4">
                                                    <div class="border-end">
                                                        <h4 class="text-primary mb-1">${data.days}</h4>
                                                        <small class="text-muted">Working Days</small>
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <div class="border-end">
                                                        <h4 class="text-warning mb-1">${data.ffCost}</h4>
                                                        <small class="text-muted">FF Required</small>
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <h4 class="text-info mb-1">8</h4>
                                                    <small class="text-muted">FF per Day</small>
                                                </div>
                                            </div>
                                            <hr>
                                            <div class="alert alert-info mb-0">
                                                <i class="bi bi-info-circle me-2"></i>
                                                <strong>Calculation:</strong> ${data.days} days × 8 FF/day = <strong>${data.ffCost} FF total</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Reason -->
                            <div class="row">
                                <div class="col-12">
                                    <div class="card">
                                        <div class="card-header bg-light">
                                            <h6 class="mb-0"><i class="bi bi-chat-text me-2"></i>Reason for Request</h6>
                                        </div>
                                        <div class="card-body">
                                            <p class="mb-0">${data.reason}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            ${data.status === 'pending' ? `
                                <button type="button" class="btn btn-success me-2" onclick="approveRequestFromModal('${data.requestId}')">
                                    <i class="bi bi-check-circle me-1"></i>Approve Request
                                </button>
                                <button type="button" class="btn btn-danger me-2" onclick="denyRequestFromModal('${data.requestId}')">
                                    <i class="bi bi-x-circle me-1"></i>Deny Request
                                </button>
                            ` : ''}
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="bi bi-x-lg me-1"></i>Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to document
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('requestDetailModal'));
        modal.show();
        
        // Clean up when modal is hidden
        document.getElementById('requestDetailModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    /**
     * Get Bootstrap badge class for status
     */
    function getStatusBadgeBootstrap(status) {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-warning text-dark';
            case 'approved': return 'bg-success';
            case 'active': return 'bg-success';
            case 'completed': return 'bg-secondary';
            case 'rejected': return 'bg-danger';
            case 'denied': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }
    
    /**
     * Approve request from modal
     */
    window.approveRequestFromModal = function(requestId) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('requestDetailModal'));
        modal.hide();
        window.approveRequest(requestId);
    };
    
    /**
     * Deny request from modal
     */
    window.denyRequestFromModal = function(requestId) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('requestDetailModal'));
        modal.hide();
        window.denyRequest(requestId);
    };
    
    /**
     * Show notification
     */
    window.showNotification = function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    };
});

/**
 * Approve a student's vacation request
 */
window.approveRequest = function(requestId) {
    if (!confirm('Are you sure you want to approve this request?')) {
        return;
    }
    
    fetch('/api/approve-request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request_id: requestId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.showNotification(data.message, 'success');
            // Reload the page to show updated data
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            window.showNotification(data.message || 'Error approving request', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        window.showNotification('Error approving request', 'danger');
    });
};

/**
 * Deny a student's vacation request
 */
window.denyRequest = function(requestId) {
    if (!confirm('Are you sure you want to deny this request?')) {
        return;
    }
    
    fetch('/api/deny-request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request_id: requestId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.showNotification(data.message, 'success');
            // Reload the page to show updated data
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            window.showNotification(data.message || 'Error denying request', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        window.showNotification('Error denying request', 'danger');
    });
};
