// Requests page specific functionality

// Mock requests data
const requestsData = [
    {
        id: "REQ001",
        startDate: "2025-06-15T09:00:00",
        endDate: "2025-06-20T17:00:00",
        reason: "Family vacation",
        status: "pending",
        submitDate: "2025-06-10T10:15:00",
        hours: 40,
        isShortNotice: false
    },
    {
        id: "REQ002",
        startDate: "2025-05-20T09:00:00",
        endDate: "2025-05-23T17:00:00",
        reason: "Medical appointment",
        status: "approved",
        submitDate: "2025-05-15T14:20:00",
        hours: 32
    },
    {
        id: "REQ003",
        startDate: "2025-03-10T09:00:00",
        endDate: "2025-03-14T17:00:00",
        reason: "Spring break",
        status: "approved",
        submitDate: "2025-03-01T09:45:00",
        hours: 40
    },
    {
        id: "REQ004",
        startDate: "2025-07-01T09:00:00",
        endDate: "2025-07-08T17:00:00",
        reason: "Summer break",
        status: "denied",
        submitDate: "2025-06-05T09:45:00",
        hours: 56,
        denyReason: "Overlaps with mandatory courses"
    }
];

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
            const pendingCount = requestsData.filter(r => r.status === 'pending').length;
            requestsBadge.textContent = pendingCount;
            requestsBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
        }
    }
};

document.addEventListener("DOMContentLoaded", function() {
    
    const statusFilter = document.getElementById('statusFilter');

    init();

    function init() {
        setupEventListeners();
        renderAllRequests();
        StudentUtils.updateRequestsBadge();
    }

    function setupEventListeners() {
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
