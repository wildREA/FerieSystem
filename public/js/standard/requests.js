// Requests page specific functionality
document.addEventListener("DOMContentLoaded", function() {
    
    const statusFilter = document.getElementById('statusFilter');

    // Initialize requests page
    init();

    function init() {
        setupEventListeners();
        renderAllRequests();
    }

    function setupEventListeners() {
        // Status filter
        if (statusFilter) {
            statusFilter.addEventListener('change', filterRequests);
        }
    }

    function renderAllRequests() {
        const requestsGrid = document.getElementById('requestsGrid');
        let filteredRequests = requestsData;
        
        // Apply status filter
        const selectedStatus = statusFilter.value;
        if (selectedStatus !== 'all') {
            filteredRequests = requestsData.filter(request => request.status === selectedStatus);
        }
        
        if (filteredRequests.length === 0) {
            requestsGrid.innerHTML = `
                <div class="no-requests">
                    <i class="bi bi-calendar-x"></i>
                    <h4>No requests found</h4>
                    <p>No requests match your current filter</p>
                </div>
            `;
            return;
        }
        
        requestsGrid.innerHTML = filteredRequests.map(request => `
            <div class="request-card">
                <div class="request-header">
                    <div class="request-dates">
                        ${StudentUtils.formatDate(request.startDate)} - ${StudentUtils.formatDate(request.endDate)}
                    </div>
                    <div class="status-badge status-${request.status}">${request.status}</div>
                </div>
                <div class="request-details">
                    <div class="detail-row">
                        <span class="detail-label">Duration:</span>
                        <span class="detail-value">${request.hours}ff (${(request.hours / 8).toFixed(1)} day${(request.hours / 8).toFixed(1) !== '1.0' ? 's' : ''})</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Submitted:</span>
                        <span class="detail-value">${StudentUtils.formatDate(request.submitDate)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Request ID:</span>
                        <span class="detail-value">${request.id}</span>
                    </div>
                    ${request.isShortNotice ? `
                        <div class="detail-row">
                            <span class="detail-label">Notice:</span>
                            <span class="detail-value text-warning">Short Notice</span>
                        </div>
                    ` : ''}
                </div>
                <div class="request-reason">
                    <strong>Reason:</strong> ${request.reason}
                </div>
                ${request.status === 'denied' && request.denyReason ? `
                    <div class="alert alert-danger mt-2">
                        <strong>Denied:</strong> ${request.denyReason}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    function updateRequestCount() {
        console.log("Updating request count...");
    }

    function filterRequests() {
        renderAllRequests();
        // Call function to update the request count
        updateRequestCount();
    }
});
