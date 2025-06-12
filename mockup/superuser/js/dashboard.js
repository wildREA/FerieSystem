// Dashboard functionality for Student Management System
// Create a global variable to store student data that can be accessed by other scripts
window.studentsData = [];

document.addEventListener("DOMContentLoaded", function() {
    // Hardcoded student data
    const studentsData = [
        {
            id: "STU001",
            name: "Emma Nielsen",
            email: "emma.nielsen@student.dk",
            course: "Computer Science",
            year: 3,
            status: "pending",
            vacationDays: 25,
            requestDate: "2025-06-01",
            requestEndDate: "2025-06-16",
            requestDays: 5,
            requestReason: "Family vacation",
            avatar: "EN"
        },
        {
            id: "STU002", 
            name: "Lars Andersen",
            email: "lars.andersen@student.dk",
            course: "Engineering",
            year: 2,
            status: "approved",
            vacationDays: 30,
            requestDate: "2025-05-28",
            requestEndDate: "2025-05-31",
            requestDays: 3,
            requestReason: "Medical appointment",
            avatar: "LA"
        },
        {
            id: "STU003",
            name: "Sofia Larsen",
            email: "sofia.larsen@student.dk", 
            course: "Business Administration",
            year: 1,
            status: "denied",
            vacationDays: 20,
            requestDate: "2025-06-05",
            requestEndDate: "2025-06-13",
            requestDays: 8,
            requestReason: "Summer internship",
            avatar: "SL"
        },
        {
            id: "STU004",
            name: "Mikkel Jensen",
            email: "mikkel.jensen@student.dk",
            course: "Mathematics",
            year: 4,
            status: "pending",
            vacationDays: 25,
            requestDate: "2025-06-08",
            requestEndDate: "2025-06-15",
            requestDays: 7,
            requestReason: "Conference attendance",
            avatar: "MJ"
        },
        {
            id: "STU005",
            name: "Anna Pedersen",
            email: "anna.pedersen@student.dk",
            course: "Psychology",
            year: 2,
            status: "approved",
            vacationDays: 30,
            requestDate: "2025-05-25",
            requestEndDate: "2025-05-29",
            requestDays: 4,
            requestReason: "Personal leave",
            avatar: "AP"
        },
        {
            id: "STU006",
            name: "Frederik Hansen",
            email: "frederik.hansen@student.dk",
            course: "Computer Science", 
            year: 3,
            status: "pending",
            vacationDays: 25,
            requestDate: "2025-06-10",
            requestEndDate: "2025-06-16",
            requestDays: 6,
            requestReason: "Study abroad preparation",
            avatar: "FH"
        },
        // Add more approved requests for better demonstration
        {
            id: "STU007",
            name: "Jacob Møller",
            email: "jacob.moller@student.dk",
            course: "Economics",
            year: 2,
            status: "approved",
            vacationDays: 28,
            requestDate: "2025-06-12",
            requestEndDate: "2025-06-20",
            requestDays: 8,
            requestReason: "Family wedding",
            avatar: "JM"
        },
        {
            id: "STU008",
            name: "Sara Schmidt",
            email: "sara.schmidt@student.dk",
            course: "Computer Science",
            year: 3,
            status: "approved",
            vacationDays: 25,
            requestDate: "2025-06-04",
            requestEndDate: "2025-06-09",
            requestDays: 5,
            requestReason: "Tech conference",
            avatar: "SS"
        },
        {
            id: "STU009",
            name: "Thomas Nielsen",
            email: "thomas.nielsen@student.dk",
            course: "Physics",
            year: 4,
            status: "approved",
            vacationDays: 30,
            requestDate: "2025-05-20",
            requestEndDate: "2025-05-26",
            requestDays: 6,
            requestReason: "Research trip",
            avatar: "TN"
        },
        {
            id: "STU010",
            name: "Maria Johansen",
            email: "maria.johansen@student.dk",
            course: "Arts",
            year: 1,
            status: "approved",
            vacationDays: 25,
            requestDate: "2025-06-15",
            requestEndDate: "2025-06-25",
            requestDays: 10,
            requestReason: "Art exhibition abroad",
            avatar: "MJ"
        }
    ];

    // Initialize Fuse.js for fuzzy search
    const fuseOptions = {
        keys: ['name', 'email', 'course', 'id'],
        threshold: 0.4,
        includeScore: true
    };
    const fuse = new Fuse(studentsData, fuseOptions);

    // DOM elements
    const studentsGrid = document.getElementById('studentsGrid');
    const searchInput = document.getElementById('studentSearch');
    const searchResults = document.getElementById('searchResults');
    const noResults = document.getElementById('noResults');
    const navSections = document.querySelectorAll('.nav-section');
    
    // Approved requests elements
    const approvedRequestsGrid = document.getElementById('approvedRequestsGrid');
    const noApprovedResults = document.getElementById('noApprovedResults');
    const activeRequestsBtn = document.getElementById('activeRequestsBtn');
    const inactiveRequestsBtn = document.getElementById('inactiveRequestsBtn');
    
    // Today's date for comparing request dates
    const today = new Date("2025-06-11"); // Using the specified date from context
    
    // Get current page
    const currentPage = document.getElementById('currentPage')?.value || 'students';

    // Initialize the application
    init();

    function init() {
        // Check if we're on a page that needs student rendering
        const studentsGrid = document.getElementById('studentsGrid');
        
        // Load different data based on the current page
        if (currentPage === 'students' && studentsGrid) {
            // Show all students
            renderStudents(studentsData);
        } else if (currentPage === 'requests' && studentsGrid) {
            // Show only pending requests in the main grid
            const pendingStudents = studentsData.filter(student => student.status === 'pending');
            renderStudents(pendingStudents);
            
            // Initialize approved requests section
            if (approvedRequestsGrid) {
                initializeApprovedRequestsSection();
            }
        }
        
        setupEventListeners();
    }

    function setupEventListeners() {
        // Search functionality
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim()) {
                searchResults.style.display = 'block';
            }
        });

        // Hide search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-wrapper')) {
                searchResults.style.display = 'none';
            }
        });
        
        // Set up keyboard navigation for search results
        searchInput.addEventListener('keydown', handleSearchNavigation);
        
        // Update the sidebar logo to navigate to home
        const logo = document.querySelector('.sidebar .logo');
        if (logo) {
            logo.addEventListener('click', function() {
                window.location.href = 'students.html';
            });
        }
        
        // Set up toggle buttons for approved requests
        if (activeRequestsBtn && inactiveRequestsBtn) {
            activeRequestsBtn.addEventListener('click', () => {
                toggleApprovedRequestsView('active');
            });
            
            inactiveRequestsBtn.addEventListener('click', () => {
                toggleApprovedRequestsView('inactive');
            });
        }
    }
    
    /**
     * Initialize the approved requests section
     */
    function initializeApprovedRequestsSection() {
        // By default show active approved requests
        toggleApprovedRequestsView('active');
    }
    
    /**
     * Toggle between active and inactive approved requests
     * @param {string} view - 'active' or 'inactive'
     */
    function toggleApprovedRequestsView(view) {
        // Update button styles - properly handle both btn-primary/btn-outline-primary and active class
        if (view === 'active') {
            // Set active button styling
            activeRequestsBtn.classList.add('btn-primary', 'active');
            activeRequestsBtn.classList.remove('btn-outline-primary');
            
            // Set inactive button styling
            inactiveRequestsBtn.classList.add('btn-outline-primary');
            inactiveRequestsBtn.classList.remove('btn-primary', 'active');
        } else {
            // Set active button styling
            inactiveRequestsBtn.classList.add('btn-primary', 'active');
            inactiveRequestsBtn.classList.remove('btn-outline-primary');
            
            // Set inactive button styling
            activeRequestsBtn.classList.add('btn-outline-primary');
            activeRequestsBtn.classList.remove('btn-primary', 'active');
        }
        
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
    
    // Track currently selected search result index
    let selectedSearchResultIndex = -1;
    
    /**
     * Handles keyboard navigation within search results
     * Allows navigating through search results using up/down arrow keys
     * and selecting with Enter
     * @param {KeyboardEvent} e - The keyboard event
     */
    function handleSearchNavigation(e) {
        const resultItems = searchResults.querySelectorAll('.search-result-item');
        
        // Only handle navigation if search results are visible and there are results
        if (searchResults.style.display !== 'block' || resultItems.length === 0) {
            return;
        }
        
        // Handle arrow up/down navigation
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault(); // Prevent cursor movement in the input
            
            // Remove highlight from currently selected item
            resultItems.forEach(item => item.classList.remove('selected'));
            
            // Update the selected index based on arrow key
            if (e.key === 'ArrowDown') {
                selectedSearchResultIndex = (selectedSearchResultIndex < resultItems.length - 1) 
                    ? selectedSearchResultIndex + 1 
                    : 0;
            } else if (e.key === 'ArrowUp') {
                selectedSearchResultIndex = (selectedSearchResultIndex > 0) 
                    ? selectedSearchResultIndex - 1 
                    : resultItems.length - 1;
            }
            
            // Highlight the newly selected item
            const selectedItem = resultItems[selectedSearchResultIndex];
            selectedItem.classList.add('selected');
            
            // Make sure the selected item is visible in the dropdown
            selectedItem.scrollIntoView({ block: 'nearest' });
        }
        
        // Handle Enter key to select the currently highlighted item
        if (e.key === 'Enter' && selectedSearchResultIndex >= 0) {
            e.preventDefault();
            resultItems[selectedSearchResultIndex].click();
        }
    }

    function handleSearch(e) {
        const query = e.target.value.trim();
        const searchResults = document.getElementById('searchResults');
        
        if (!searchResults) {
            console.warn('searchResults element not found on this page');
            return;
        }
        
        if (query === '') {
            searchResults.style.display = 'none';
            
            // Show appropriate data based on current page
            if (currentPage === 'students') {
                renderStudents(studentsData);
            } else if (currentPage === 'requests') {
                const pendingStudents = studentsData.filter(student => student.status === 'pending');
                renderStudents(pendingStudents);
                
                // Keep the approved requests section intact
                if (activeRequestsBtn && activeRequestsBtn.classList.contains('btn-primary')) {
                    toggleApprovedRequestsView('active');
                } else if (inactiveRequestsBtn) {
                    toggleApprovedRequestsView('inactive');
                }
            }
            return;
        }

        // Perform fuzzy search on the appropriate dataset
        let dataToSearch = studentsData;
        if (currentPage === 'requests') {
            dataToSearch = studentsData.filter(student => student.status === 'pending');
        }
        
        const fuseForCurrentPage = new Fuse(dataToSearch, fuseOptions);
        const results = fuseForCurrentPage.search(query);
        const searchResultsData = results.map(result => result.item);
        
        // Update search dropdown
        updateSearchDropdown(searchResultsData, query);
        
        // Update main grid
        renderStudents(searchResultsData);
        
        // Keep the approved requests section visible if on requests page
        if (currentPage === 'requests' && approvedRequestsGrid) {
            if (activeRequestsBtn && activeRequestsBtn.classList.contains('btn-primary')) {
                toggleApprovedRequestsView('active');
            } else {
                toggleApprovedRequestsView('inactive');
            }
        }
    }

    function updateSearchDropdown(results, query) {
        searchResults.innerHTML = '';
        // Reset the selected index when updating dropdown
        selectedSearchResultIndex = -1;
        
        const noResultsMessage = currentPage === 'students' ? 'No students found' : 'No requests found';
        
        if (results.length === 0) {
            searchResults.innerHTML = `<div class="search-result-item">${noResultsMessage}</div>`;
        } else {
            results.slice(0, 5).forEach(student => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.innerHTML = `
                    <div class="student-avatar status-${student.status}" style="width: 30px; height: 30px; font-size: 12px; margin-right: 10px;">
                        ${student.avatar}
                    </div>
                    <div>
                        <div style="font-weight: 600;">${highlightMatch(student.name, query)}</div>
                        <div style="font-size: 12px; color: #6c757d;">${student.course} - Year ${student.year}</div>
                    </div>
                `;
                
                item.addEventListener('click', () => {
                    searchInput.value = student.name;
                    searchResults.style.display = 'none';
                    renderStudents([student]);
                    highlightStudentCard(student.id);
                });
                
                // Add mouseover event to update selectedSearchResultIndex
                item.addEventListener('mouseover', () => {
                    // Remove highlight from all items
                    searchResults.querySelectorAll('.search-result-item').forEach((el, idx) => {
                        if (el === item) selectedSearchResultIndex = idx;
                        el.classList.remove('selected');
                    });
                    item.classList.add('selected');
                });
                
                searchResults.appendChild(item);
            });
        }
        
        searchResults.style.display = 'block';
    }

    function highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    function highlightStudentCard(studentId) {
        // Remove existing highlights
        document.querySelectorAll('.student-card.highlighted').forEach(card => {
            card.classList.remove('highlighted');
        });
        
        // Add highlight to specific card
        setTimeout(() => {
            const targetCard = document.querySelector(`[data-student-id="${studentId}"]`);
            if (targetCard) {
                targetCard.classList.add('highlighted');
                targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }

    function renderStudents(students) {
        // Get studentsGrid element and check if it exists
        const studentsGrid = document.getElementById('studentsGrid');
        const noResults = document.getElementById('noResults');
        
        // If studentsGrid doesn't exist on this page, exit the function
        if (!studentsGrid) {
            console.warn('studentsGrid element not found on this page');
            return;
        }
        
        if (students.length === 0) {
            studentsGrid.style.display = 'none';
            if (noResults) {
                noResults.style.display = 'block';
            }
            return;
        }

        studentsGrid.style.display = 'grid';
        if (noResults) {
            noResults.style.display = 'none';
        }
        
        // Use the appropriate card creation function based on the current page
        if (currentPage === 'students') {
            studentsGrid.innerHTML = students.map(student => createStudentsCard(student)).join('');
        } else if (currentPage === 'requests') {
            studentsGrid.innerHTML = students.map(student => createRequestsCard(student)).join('');
        }
        
        // Add event listeners to action buttons
        setupCardEventListeners();
    }

    function createRequestsCard(student) {
        const requestDate = new Date(student.requestDate);
        const requestEndDate = new Date(student.requestEndDate);
        const today = new Date();
        const daysSinceRequest = Math.floor((today - requestDate) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="student-card" data-student-id="${student.id}">
                <div class="student-header">
                    <div class="student-avatar status-${student.status}">
                        ${student.avatar}
                    </div>
                    <div class="student-info">
                        <h4>${student.name}</h4>
                        <p class="student-id">${student.id}</p>
                    </div>
                </div>
                
                <div class="student-details">
                    <div class="detail-row">
                        <span class="detail-label">Course:</span>
                        <span class="detail-value">${student.course}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Year:</span>
                        <span class="detail-value">${student.year}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="status-badge status-${student.status}">${student.status}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Request End Date:</span>
                        <span class="detail-value">${requestEndDate.toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Requested:</span>
                        <span class="detail-value">${student.requestDays} days</span>
                    </div>
                </div>
                
                <div class="student-card-footer">
                    <div class="days-remaining">
                        ${daysSinceRequest} days ago • Ends: ${requestEndDate.toLocaleDateString()}
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-outline-primary btn-sm" onclick="viewDetails('${student.id}')">
                            <i class="bi bi-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function createStudentsCard(student) {
        const requestDate = new Date(student.requestDate);
        const requestEndDate = new Date(student.requestEndDate);
        const today = new Date();
        const daysSinceRequest = Math.floor((today - requestDate) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="student-card" data-student-id="${student.id}">
                <div class="student-header">
                    <div class="student-avatar status-${student.status}">
                        ${student.avatar}
                    </div>
                    <div class="student-info">
                        <h4>${student.name}</h4>
                        <p class="student-id">${student.id}</p>
                    </div>
                </div>
            </div>
        `;
    }

    function setupCardEventListeners() {
        // Add click handlers to student cards
        const studentCards = document.querySelectorAll('.student-card');
        
        if (studentCards.length === 0) {
            return; // No cards to set up listeners for
        }
        
        studentCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger card click if clicking on buttons
                if (e.target.closest('.action-buttons')) return;
                
                const studentId = card.dataset.studentId;
                viewDetails(studentId);
            });
        });
    }

    // Global functions for button actions
    window.viewDetails = function(studentId) {
        const student = studentsData.find(s => s.id === studentId);
        if (student) {
            showStudentModal(student);
        }
    };

    window.showNotification = function(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    function showStudentModal(student) {
        // Create modal backdrop
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop fade show';
        modalBackdrop.style.zIndex = '1040';
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal fade show';
        modal.style.display = 'block';
        modal.style.zIndex = '1050';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Student Details - ${student.name}</h5>
                        <button type="button" class="btn-close" onclick="closeModal()"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4 text-center">
                                <div class="student-avatar status-${student.status}" style="width: 80px; height: 80px; font-size: 32px; margin: 0 auto 15px;">
                                    ${student.avatar}
                                </div>
                                <h4 class="mb-1 non-selectable">${student.name}</h4>
                                <p class="text-muted mb-2 selectable-text">${student.id}</p>
                            </div>
                            <div class="col-md-8">
                                <div class="mb-4">
                                    <h6 class="text-primary mb-3"><i class="bi bi-person-circle me-2"></i>Student Information</h6>
                                    <div class="row">
                                        <div class="col-6">
                                            <small class="text-muted">Email</small>
                                            <div class="fw-medium selectable-text">${student.email}</div>
                                        </div>
                                        <div class="col-3">
                                            <small class="text-muted">Course</small>
                                            <div class="fw-medium selectable-text">${student.course}</div>
                                        </div>
                                        <div class="col-3">
                                            <small class="text-muted">Year</small>
                                            <div class="fw-medium selectable-text">${student.year}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Vacation Request Information -->
                                <div class="mb-4">
                                    <h6 class="text-primary mb-3"><i class="bi bi-calendar-check me-2"></i>Vacation Request Details</h6>
                                    <div class="row mb-3">
                                        <div class="col-3">
                                            <small class="text-muted">Start Date</small>
                                            <div class="fw-medium selectable-text">${new Date(student.requestDate).toLocaleDateString()}</div>
                                        </div>
                                        <div class="col-3">
                                            <small class="text-muted">End Date</small>
                                            <div class="fw-medium selectable-text">${new Date(student.requestEndDate).toLocaleDateString()}</div>
                                        </div>
                                        <div class="col-3">
                                            <small class="text-muted">Duration</small>
                                            <div class="fw-medium selectable-text">${student.requestDays} days</div>
                                        </div>
                                        <div class="col-3">
                                            <small class="text-muted">Status</small>
                                            <div class="status-badge status-${student.status}">${student.status}</div>
                                        </div>
                                    </div>
                                    
                                    <div class="alert alert-light border mb-3">
                                        <small class="text-muted d-block mb-1">Request Reason</small>
                                        <div class="selectable-text">${student.requestReason}</div>
                                    </div>
                                </div>
                                
                                <!-- Additional Student Information -->
                                <div class="mb-4">
                                    <h6 class="text-primary mb-3"><i class="bi bi-info-circle me-2"></i>Additional Information</h6>
                                    <div class="row">
                                        <div class="col-6">
                                            <small class="text-muted">Total Vacation Days Available</small>
                                            <div class="fw-medium selectable-text">${student.vacationDays} days</div>
                                        </div>
                                        <div class="col-6">
                                            <small class="text-muted">Previous Requests This Year</small>
                                            <div class="fw-medium selectable-text">
                                                <span class="badge bg-success me-1">Approved: 2</span>
                                                <span class="badge bg-danger me-1">Denied: 1</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Notes Section -->
                                <div class="mb-4">
                                    <h6 class="text-primary mb-3"><i class="bi bi-journal-text me-2"></i>Administrative Notes</h6>
                                    <div class="alert alert-light border mb-0">
                                        <textarea class="form-control border-0 bg-transparent" placeholder="Add notes about this student here..." rows="2"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        ${student.status === 'pending' ? `
                            <button type="button" class="btn btn-success" onclick="approveRequest('${student.id}'); closeModal();">
                                <i class="bi bi-check"></i> Approve
                            </button>
                            <button type="button" class="btn btn-danger" onclick="denyRequest('${student.id}'); closeModal();">
                                <i class="bi bi-x"></i> Deny
                            </button>
                        ` : ''}
                        
                        <a href="requests.html" class="btn btn-primary" onclick="localStorage.setItem('searchQuery', '${student.name}');">
                            <i class="bi bi-list-check"></i> View All Requests
                        </a>
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalBackdrop);
        document.body.appendChild(modal);
        
        // Store references for cleanup
        window.currentModal = modal;
        window.currentModalBackdrop = modalBackdrop;
    }

    window.closeModal = function() {
        if (window.currentModal) {
            window.currentModal.remove();
        }
        if (window.currentModalBackdrop) {
            window.currentModalBackdrop.remove();
        }
        window.currentModal = null;
        window.currentModalBackdrop = null;
    };

    // Close modal on backdrop click
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            closeModal();
        }
    });

    // Add some nice animations on load
    setTimeout(() => {
        const cards = document.querySelectorAll('.student-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 100);

    // Iterate through requests by amount and return the number of requests to .notification-badge
    const requestAmount = studentsData.filter(student => student.status === 'pending').length;
    const notificationBadge = document.querySelector('.notification-badge');
    
    if (notificationBadge) {
        notificationBadge.textContent = requestAmount > 0 ? requestAmount : '';
        notificationBadge.style.display = requestAmount > 0 ? 'block' : 'none';
    }
});
