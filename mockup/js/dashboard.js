// Dashboard functionality for Student Management System
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
            requestDate: "2025-06-01T09:15:00",
            requestEndDate: "2025-06-06T17:00:00",
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
            requestDate: "2025-05-28T08:30:00",
            requestEndDate: "2025-05-31T16:30:00",
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
            requestDate: "2025-06-05T10:00:00",
            requestEndDate: "2025-06-13T18:00:00",
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
            requestDate: "2025-06-08T07:45:00",
            requestEndDate: "2025-06-15T15:30:00",
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
            requestDate: "2025-05-25T11:20:00",
            requestEndDate: "2025-05-29T14:45:00",
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
            requestDate: "2025-06-10T13:00:00",
            requestEndDate: "2025-06-16T16:00:00",
            requestDays: 6,
            requestReason: "Study abroad preparation",
            avatar: "FH"
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

    // Helper function to format date with time
    function formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('da-DK', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    // Helper function to calculate precise duration
    function calculateDuration(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffMs = end - start;
        
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        let duration = '';
        if (days > 0) {
            duration += `${days} day${days !== 1 ? 's' : ''}`;
        }
        if (hours > 0) {
            if (duration) duration += ', ';
            duration += `${hours} hour${hours !== 1 ? 's' : ''}`;
        }
        if (minutes > 0 && days === 0) {
            if (duration) duration += ', ';
            duration += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        }
        
        return duration || '0 minutes';
    }

    // Track current view
    let currentView = 'Students';

    // Initialize the application
    init();

    function init() {
        renderStudents(studentsData);
        setupEventListeners();
        setupNavigation();
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
    }

    function setupNavigation() {
        navSections.forEach(section => {
            section.addEventListener('click', function() {
                // Remove active class from all sections
                navSections.forEach(s => s.classList.remove('active'));
                // Add active class to clicked section
                this.classList.add('active');
                
                // Handle navigation based on section
                const sectionText = this.querySelector('span').textContent;
                currentView = sectionText; // Update current view
                
                if (sectionText === 'Anmodninger') {
                    // Filter to show only students with pending requests
                    const pendingStudents = studentsData.filter(student => student.status === 'pending');
                    renderStudents(pendingStudents);
                } else if (sectionText === 'Students') {
                    // Show all students
                    renderStudents(studentsData);
                }
            });
        });
    }

    function handleSearch(e) {
        const query = e.target.value.trim();
        
        if (query === '') {
            searchResults.style.display = 'none';
            // Restore the appropriate view based on current navigation
            if (currentView === 'Anmodninger') {
                const pendingStudents = studentsData.filter(student => student.status === 'pending');
                renderStudents(pendingStudents);
            } else {
                renderStudents(studentsData);
            }
            return;
        }

        // Perform fuzzy search
        const results = fuse.search(query);
        const searchResultsData = results.map(result => result.item);
        
        // Update search dropdown
        updateSearchDropdown(searchResultsData, query);
        
        // Update main grid
        renderStudents(searchResultsData);
    }

    function updateSearchDropdown(results, query) {
        searchResults.innerHTML = '';
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">No students found</div>';
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
        if (students.length === 0) {
            studentsGrid.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }

        studentsGrid.style.display = 'grid';
        noResults.style.display = 'none';
        
        // Use detailed cards for Anmodninger (requests) view, simple cards for Students view
        const cardFunction = currentView === 'Anmodninger' ? createDetailedStudentCard : createStudentCard;
        studentsGrid.innerHTML = students.map(student => cardFunction(student)).join('');
        
        // Add event listeners to action buttons
        setupCardEventListeners();
    }

    function createStudentCard(student) {
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
                    ${student.status === 'pending' ? `
                        <div class="card-action">
                            <button class="btn btn-outline-primary btn-sm" onclick="viewDetails('${student.id}')">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    function createDetailedStudentCard(student) {
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
                        <span class="detail-value">${formatDateTime(student.requestEndDate)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Requested:</span>
                        <span class="detail-value">${calculateDuration(student.requestDate, student.requestEndDate)}</span>
                    </div>
                </div>
                
                <div class="student-card-footer">
                    <div class="days-remaining">
                        ${daysSinceRequest} days ago • Ends: ${formatDateTime(student.requestEndDate)}
                    </div>
                    <div class="action-buttons">
                        ${student.status === 'pending' ? `
                            <button class="btn btn-success btn-sm" onclick="approveRequest('${student.id}')">
                                <i class="bi bi-check"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="denyRequest('${student.id}')">
                                <i class="bi bi-x"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-outline-primary btn-sm" onclick="viewDetails('${student.id}')">
                            <i class="bi bi-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function setupCardEventListeners() {
        // Add click handlers to student cards
        document.querySelectorAll('.student-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger card click if clicking on buttons
                if (e.target.closest('.action-buttons')) return;
                
                const studentId = card.dataset.studentId;
                viewDetails(studentId);
            });
        });
    }

    // Global functions for button actions
    window.approveRequest = function(studentId) {
        const student = studentsData.find(s => s.id === studentId);
        if (student) {
            student.status = 'approved';
            // Refresh the appropriate view
            if (currentView === 'Anmodninger') {
                const pendingStudents = studentsData.filter(student => student.status === 'pending');
                renderStudents(pendingStudents);
            } else {
                renderStudents(studentsData);
            }
            showNotification(`Request approved for ${student.name}`, 'success');
        }
    };

    window.denyRequest = function(studentId) {
        const student = studentsData.find(s => s.id === studentId);
        if (student) {
            student.status = 'denied';
            // Refresh the appropriate view
            if (currentView === 'Anmodninger') {
                const pendingStudents = studentsData.filter(student => student.status === 'pending');
                renderStudents(pendingStudents);
            } else {
                renderStudents(studentsData);
            }
            showNotification(`Request denied for ${student.name}`, 'warning');
        }
    };

    window.viewDetails = function(studentId) {
        const student = studentsData.find(s => s.id === studentId);
        if (student) {
            showStudentModal(student);
        }
    };

    function showNotification(message, type = 'info') {
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
                                <h4 class="mb-1">${student.name}</h4>
                                <p class="text-muted mb-2">${student.id}</p>
                                <span class="status-badge status-${student.status}" style="font-size: 0.9rem; padding: 6px 12px;">${student.status}</span>
                            </div>
                            <div class="col-md-8">
                                <div class="mb-4">
                                    <h6 class="text-primary mb-3"><i class="bi bi-person-circle me-2"></i>Student Information</h6>
                                    <div class="row">
                                        <div class="col-6">
                                            <small class="text-muted">Email</small>
                                            <div class="fw-medium">${student.email}</div>
                                        </div>
                                        <div class="col-3">
                                            <small class="text-muted">Course</small>
                                            <div class="fw-medium">${student.course}</div>
                                        </div>
                                        <div class="col-3">
                                            <small class="text-muted">Year</small>
                                            <div class="fw-medium">${student.year}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mb-4">
                                    <h6 class="text-primary mb-3"><i class="bi bi-calendar-range me-2"></i>Vacation Request</h6>
                                    <div class="row">
                                        <div class="col-4">
                                            <small class="text-muted">Start Date & Time</small>
                                            <div class="fw-medium">${formatDateTime(student.requestDate)}</div>
                                        </div>
                                        <div class="col-4">
                                            <small class="text-muted">End Date & Time</small>
                                            <div class="fw-medium">${formatDateTime(student.requestEndDate)}</div>
                                        </div>
                                        <div class="col-4">
                                            <small class="text-muted">Duration</small>
                                            <div class="fw-medium">${calculateDuration(student.requestDate, student.requestEndDate)}</div>
                                        </div>
                                    </div>
                                    <div class="mt-3">
                                        <small class="text-muted">Reason</small>
                                        <div class="fw-medium">${student.requestReason}</div>
                                    </div>
                                </div>
                                
                                <div class="alert alert-light border">
                                    <small class="text-muted">Total Vacation Days Available</small>
                                    <div class="fw-medium">${student.vacationDays} days</div>
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
});
