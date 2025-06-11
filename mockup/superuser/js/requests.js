// Requests page specific functionality

document.addEventListener("DOMContentLoaded", function() {
    // References to DOM elements
    const activeRequestsBtn = document.getElementById('activeRequestsBtn');
    const inactiveRequestsBtn = document.getElementById('inactiveRequestsBtn');
    const approvedRequestsGrid = document.getElementById('approvedRequestsGrid');
    const noApprovedResults = document.getElementById('noApprovedResults');
    
    // Reference to the current page element
    const currentPageElement = document.getElementById('currentPage');
    
    // Only initialize if we are on the requests page
    if (currentPageElement && currentPageElement.value === 'requests' && 
        activeRequestsBtn && inactiveRequestsBtn) {
        
        initRequestsPage();
    }
    
    /**
     * Initialize the requests page functionality
     */
    function initRequestsPage() {
        // Set up event listeners for toggle buttons
        setupToggleButtons();
        
        // Show active requests by default
        toggleApprovedRequestsView('active');
    }
    
    /**
     * Set up the toggle buttons event listeners
     */
    function setupToggleButtons() {
        // Add click event to Active requests button
        activeRequestsBtn.addEventListener('click', function() {
            toggleApprovedRequestsView('active');
        });
        
        // Add click event to Inactive/Completed requests button
        inactiveRequestsBtn.addEventListener('click', function() {
            toggleApprovedRequestsView('inactive');
        });
    }
    
    /**
     * Toggle between active and inactive approved requests
     * @param {string} view - 'active' or 'inactive'
     */
    function toggleApprovedRequestsView(view) {
        // Update button styles - toggle active class
        if (view === 'active') {
            activeRequestsBtn.classList.add('btn-primary');
            activeRequestsBtn.classList.remove('btn-outline-primary');
            inactiveRequestsBtn.classList.add('btn-outline-primary');
            inactiveRequestsBtn.classList.remove('btn-primary');
        } else {
            inactiveRequestsBtn.classList.add('btn-primary');
            inactiveRequestsBtn.classList.remove('btn-outline-primary');
            activeRequestsBtn.classList.add('btn-outline-primary');
            activeRequestsBtn.classList.remove('btn-primary');
        }
        
        // Get the student data from the main dashboard.js file
        const studentsData = window.getStudentsData ? window.getStudentsData() : [];
        
        if (!studentsData.length) {
            console.error('Student data not available');
            return;
        }
        
        // Today's date for comparing request dates
        const today = new Date("2025-06-11"); // Using current date
        
        // Filter approved requests based on active status
        const approvedStudents = studentsData.filter(student => student.status === 'approved');
        
        // Determine if requests are active (end date is in the future) or inactive (completed)
        let filteredRequests;
        if (view === 'active') {
            filteredRequests = approvedStudents.filter(student => {
                const endDate = new Date(student.requestEndDate);
                return endDate >= today;
            });
        } else {
            filteredRequests = approvedStudents.filter(student => {
                const endDate = new Date(student.requestEndDate);
                return endDate < today;
            });
        }
        
        renderApprovedRequests(filteredRequests, view);
    }
    
    /**
     * Render the approved requests in the grid
     * @param {Array} requests - The requests to render
     * @param {string} status - 'active' or 'inactive'
     */
    function renderApprovedRequests(requests, status) {
        if (!approvedRequestsGrid) return;
        
        if (requests.length === 0) {
            approvedRequestsGrid.style.display = 'none';
            noApprovedResults.style.display = 'block';
            return;
        }

        approvedRequestsGrid.style.display = 'grid';
        noApprovedResults.style.display = 'none';
        
        approvedRequestsGrid.innerHTML = requests.map(request => createApprovedRequestCard(request, status)).join('');
    }
    
    /**
     * Create an HTML card for an approved request
     * @param {Object} request - The request data
     * @param {string} status - 'active' or 'inactive'
     * @returns {string} HTML string for the request card
     */
    function createApprovedRequestCard(request, status) {
        const startDate = new Date(request.requestDate);
        const endDate = new Date(request.requestEndDate);
        const today = new Date("2025-06-11"); // Using current date
        
        // Calculate days remaining (for active requests) or days since completion (for inactive)
        let timeDescription;
        if (status === 'active') {
            const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
            timeDescription = `${daysRemaining} days remaining`;
        } else {
            const daysSinceCompletion = Math.ceil((today - endDate) / (1000 * 60 * 60 * 24));
            timeDescription = `Completed ${daysSinceCompletion} days ago`;
        }
        
        return `
            <div class="request-card ${status}" data-request-id="${request.id}">
                <span class="request-status-badge ${status}">${status === 'active' ? 'Active' : 'Completed'}</span>
                
                <div class="student-header">
                    <div class="student-avatar status-approved" style="width: 40px; height: 40px;">
                        ${request.avatar}
                    </div>
                    <div class="student-info">
                        <h4>${request.name}</h4>
                        <p class="student-id">${request.id}</p>
                    </div>
                </div>
                
                <div class="request-dates mt-3">
                    <div class="date-block">
                        <div class="date-label">Start Date</div>
                        <div class="date-value">${startDate.toLocaleDateString()}</div>
                    </div>
                    <div class="date-block">
                        <div class="date-label">End Date</div>
                        <div class="date-value">${endDate.toLocaleDateString()}</div>
                    </div>
                    <div class="date-block">
                        <div class="date-label">Days</div>
                        <div class="date-value">${request.requestDays}</div>
                    </div>
                </div>
                
                <div class="mt-3">
                    <div class="detail-label">Reason:</div>
                    <div class="detail-value">${request.requestReason}</div>
                </div>
                
                <div class="mt-3 text-end">
                    <small class="text-muted">${timeDescription}</small>
                </div>
                
                <div class="mt-3 d-flex justify-content-end">
                    <button class="btn btn-sm btn-outline-primary" onclick="viewDetails('${request.id}')">
                        <i class="bi bi-eye"></i> Details
                    </button>
                </div>
            </div>
        `;
    }
});
