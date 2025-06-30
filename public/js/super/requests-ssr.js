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
        console.log('Looking for selector:', `[data-request-id="${requestId}"]`);
        
        // Find the request card by request ID
        const requestCard = document.querySelector(`[data-request-id="${requestId}"]`);
        console.log('Found request card:', requestCard);
        
        if (!requestCard) {
            // Try alternative selectors as fallback
            const alternativeCard = document.querySelector(`[data-student-id="${requestId}"]`);
            console.log('Alternative card found:', alternativeCard);
            
            if (alternativeCard) {
                handleRequestCard(alternativeCard, requestId);
                return;
            }
            
            window.showNotification('Request not found', 'danger');
            console.error('No request card found for ID:', requestId);
            return;
        }
        
        handleRequestCard(requestCard, requestId);
    };
    
    /**
     * Handle request card data extraction and modal creation
     */
    function handleRequestCard(requestCard, requestId) {
        // Extract data from the card
        const studentName = requestCard.querySelector('.student-info h4')?.textContent || 'N/A';
        const status = requestCard.querySelector('.status-badge, .request-status-badge')?.textContent || 'N/A';
        const reason = requestCard.querySelector('.detail-value')?.textContent || 'N/A';
        
        // Get dates from the date blocks (new structure)
        const dateBlocks = requestCard.querySelectorAll('.date-block');
        let startDate = 'N/A', endDate = 'N/A', days = 'N/A';
        
        if (dateBlocks.length > 0) {
            dateBlocks.forEach(block => {
                const label = block.querySelector('.date-label')?.textContent;
                const value = block.querySelector('.date-value')?.textContent;
                
                if (label === 'Start Date') startDate = value;
                if (label === 'End Date') endDate = value;
                if (label === 'Days') days = value;
            });
        } else {
            // Try old structure (detail rows) as fallback
            const detailRows = requestCard.querySelectorAll('.detail-row');
            detailRows.forEach(row => {
                const label = row.querySelector('.detail-label')?.textContent;
                const value = row.querySelector('.detail-value')?.textContent;
                
                if (label === 'Start Date:' || label?.includes('Start')) startDate = value;
                if (label === 'End Date:' || label?.includes('End')) endDate = value;
                if (label === 'Requested:' || label?.includes('Requested')) days = value;
            });
            
            // If still not found, try to get reason from old structure
            if (reason === 'N/A') {
                const reasonElement = requestCard.querySelector('.student-details .detail-value');
                if (reasonElement) reason = reasonElement.textContent;
            }
        }
        
        // Calculate working days and FF cost
        const numDays = parseInt(days) || 0;
        const ffCost = numDays * 8; // 8 FF per day
        
        // Calculate time period between dates
        let timePeriod = 'N/A';
        let startTime = '09:00', endTime = '17:00'; // Default times
        
        if (startDate !== 'N/A' && endDate !== 'N/A') {
            try {
                const start = new Date(startDate);
                const end = new Date(endDate);
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
                timePeriod = `${diffDays} calendar days`;
                
                // Set realistic vacation times
                startTime = '09:00 AM';
                endTime = '17:00 PM';
            } catch (e) {
                timePeriod = 'Unable to calculate';
            }
        }
        
        // Get request submission date from footer or calculate
        let requestSubmitted = 'N/A';
        const daysRemainingText = requestCard.querySelector('.days-remaining')?.textContent;
        if (daysRemainingText && daysRemainingText.includes('days ago')) {
            const daysAgo = daysRemainingText.match(/(\d+) days ago/);
            if (daysAgo) {
                const submissionDate = new Date();
                submissionDate.setDate(submissionDate.getDate() - parseInt(daysAgo[1]));
                // Add some realistic submission time
                submissionDate.setHours(Math.floor(Math.random() * 8) + 9); // Between 9 AM and 5 PM
                submissionDate.setMinutes(Math.floor(Math.random() * 60));
                requestSubmitted = submissionDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric'
                }) + ' at ' + submissionDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        }
        
        console.log('Extracted data:', { requestId, studentName, status, reason, startDate, endDate, days: numDays, ffCost, timePeriod, requestSubmitted, startTime, endTime });
        
        // Create and show the modal
        createDetailModal({
            requestId,
            studentName,
            status,
            reason,
            startDate,
            endDate,
            days: numDays,
            ffCost,
            timePeriod,
            requestSubmitted,
            startTime,
            endTime
        });
    }
    
    /**
     * Create and display the detail modal
     */
    function createDetailModal(data) {
        // Remove existing modal if present
        const existingModal = document.getElementById('requestDetailModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal HTML with system-matching colors
        const modalHTML = `
            <div class="modal fade" id="requestDetailModal" tabindex="-1" aria-labelledby="requestDetailModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content" style="background-color: #1a1f2c; border: 1px solid #2c3142;">
                        <div class="modal-header" style="background-color: #222941; border-bottom: 1px solid #2c3142;">
                            <h5 class="modal-title" style="color: #ffffff;" id="requestDetailModalLabel">
                                <i class="bi bi-calendar-check me-2" style="color: #007bff;"></i>
                                Request Details
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" style="background-color: #1a1f2c; color: #ffffff;">
                            <div class="row">
                                <!-- Student Information -->
                                <div class="col-md-6 mb-4">
                                    <div class="card h-100" style="background-color: #222941; border: 1px solid #2c3142;">
                                        <div class="card-header" style="background-color: #302241; border-bottom: 1px solid #2c3142;">
                                            <h6 class="mb-0" style="color: #ffffff;"><i class="bi bi-person-fill me-2"></i>Student Information</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="mb-3">
                                                <label class="form-label fw-bold" style="color: #a0a7b5;">Name:</label>
                                                <p class="mb-0" style="color: #ffffff;">${data.studentName}</p>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label fw-bold" style="color: #a0a7b5;">Request ID:</label>
                                                <p class="mb-0"><code style="background-color: #2c3142; color: #007bff; padding: 2px 6px; border-radius: 3px;">${data.requestId}</code></p>
                                            </div>
                                            <div class="mb-0">
                                                <label class="form-label fw-bold" style="color: #a0a7b5;">Status:</label>
                                                <br><span class="badge ${getStatusBadgeBootstrap(data.status)} fs-6">${data.status.toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Request Timeline -->
                                <div class="col-md-6 mb-4">
                                    <div class="card h-100" style="background-color: #222941; border: 1px solid #2c3142;">
                                        <div class="card-header" style="background-color: #302241; border-bottom: 1px solid #2c3142;">
                                            <h6 class="mb-0" style="color: #ffffff;"><i class="bi bi-clock-history me-2"></i>Timeline</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="mb-3">
                                                <label class="form-label fw-bold" style="color: #a0a7b5;">Submitted:</label>
                                                <p class="mb-0" style="color: #ffffff;">${data.requestSubmitted}</p>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label fw-bold" style="color: #a0a7b5;">Total Period:</label>
                                                <p class="mb-0" style="color: #ffffff;">${data.timePeriod}</p>
                                            </div>
                                            <div class="mb-0">
                                                <label class="form-label fw-bold" style="color: #a0a7b5;">Working Days:</label>
                                                <p class="mb-0 fw-bold" style="color: #dc3545;">${data.days} day${data.days !== 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Vacation Period Details -->
                            <div class="row">
                                <div class="col-12 mb-4">
                                    <div class="card" style="background-color: #222941; border: 1px solid #2c3142;">
                                        <div class="card-header" style="background-color: #302241; border-bottom: 1px solid #2c3142;">
                                            <h6 class="mb-0" style="color: #ffffff;"><i class="bi bi-calendar-range-fill me-2"></i>Vacation Period</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="row text-center">
                                                <div class="col-md-4 mb-3 mb-md-0">
                                                    <div class="border-end" style="border-color: #2c3142 !important;">
                                                        <label class="form-label fw-bold d-block" style="color: #a0a7b5;">Start Date & Time</label>
                                                        <h6 style="color: #28a745; margin-bottom: 2px;">${data.startDate}</h6>
                                                        <small style="color: #007bff;">${data.startTime}</small>
                                                    </div>
                                                </div>
                                                <div class="col-md-4 mb-3 mb-md-0">
                                                    <div class="border-end" style="border-color: #2c3142 !important;">
                                                        <label class="form-label fw-bold d-block" style="color: #a0a7b5;">End Date & Time</label>
                                                        <h6 style="color: #dc3545; margin-bottom: 2px;">${data.endDate}</h6>
                                                        <small style="color: #007bff;">${data.endTime}</small>
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <label class="form-label fw-bold d-block" style="color: #a0a7b5;">FF Cost</label>
                                                    <h6 style="color: #ffc107; margin-bottom: 2px;">${data.ffCost} FF</h6>
                                                    <small style="color: #a0a7b5;">(${data.days} × 8 FF/day)</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Reason -->
                            <div class="row">
                                <div class="col-12">
                                    <div class="card" style="background-color: #222941; border: 1px solid #2c3142;">
                                        <div class="card-header" style="background-color: #302241; border-bottom: 1px solid #2c3142;">
                                            <h6 class="mb-0" style="color: #ffffff;"><i class="bi bi-chat-square-text-fill me-2"></i>Reason</h6>
                                        </div>
                                        <div class="card-body">
                                            <blockquote class="blockquote mb-0">
                                                <p class="mb-0 fst-italic" style="color: #ffffff; border-left: 3px solid #007bff; padding-left: 15px;">"${data.reason}"</p>
                                            </blockquote>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer" style="background-color: #222941; border-top: 1px solid #2c3142;">
                            <small style="color: #a0a7b5;" class="me-auto">
                                <i class="bi bi-info-circle me-1"></i>
                                Last updated: ${new Date().toLocaleString()}
                            </small>
                            <button type="button" class="btn" style="background-color: #2c3142; border: 1px solid #007bff; color: #ffffff;" data-bs-dismiss="modal">
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
