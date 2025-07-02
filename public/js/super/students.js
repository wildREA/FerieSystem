// Students page JavaScript functionality
document.addEventListener("DOMContentLoaded", function() {
    let studentsData = [];
    let fuse = null;
    
    init();

    function init() {
        setupEventListeners();
        initializeSearch();
        loadStudentsData();
        
        // Refresh notifications when notification manager is available
        if (window.notificationManager) {
            window.notificationManager.refresh();
        }
    }

    function setupEventListeners() {
        // Update the sidebar logo to navigate to students page
        const logo = document.querySelector(".sidebar .logo");
        if (logo) {
            logo.addEventListener("click", function () {
                window.location.href = "/students";
            });
        }

        // Search functionality
        const searchInput = document.getElementById("studentSearch");
        if (searchInput) {
            searchInput.addEventListener("input", handleSearch);
        }

        // Listen for notifications updated event
        window.addEventListener('notificationsUpdated', function(event) {
            console.log('Notifications updated:', event.detail.notifications);
        });

        // Listen for request approval/denial events to refresh data
        window.addEventListener('requestStatusChanged', function() {
            refreshStudentsData();
        });
    }

    function initializeSearch() {
        // Initialize Fuse.js for fuzzy search
        const fuseOptions = {
            keys: ['name', 'email', 'course', 'username'],
            threshold: 0.3,
            includeScore: true
        };
        
        // Will be initialized when data is loaded
        fuse = null;
    }

    function loadStudentsData() {
        // First, try to extract data from server-side rendered content
        const studentCards = document.querySelectorAll('.student-card');
        if (studentCards.length > 0) {
            studentsData = extractStudentsFromDOM();
            initializeFuseSearch();
        }
        
        // Also fetch fresh data from API for any updates
        refreshStudentsData();
    }

    function extractStudentsFromDOM() {
        const studentCards = document.querySelectorAll('.student-card');
        const students = [];
        
        studentCards.forEach(card => {
            const student = {
                id: card.dataset.studentId,
                name: card.querySelector('.student-name')?.textContent || '',
                email: card.querySelector('.student-email')?.textContent || '',
                course: card.querySelector('.course')?.textContent || 'N/A',
                year: card.querySelector('.year')?.textContent?.replace('Year ', '') || 'N/A',
                vacationDays: parseInt(card.querySelector('.stat-value')?.textContent || '0'),
                avatar: card.querySelector('.student-avatar')?.textContent || 'U'
            };
            
            // Extract request info if available
            const requestInfo = card.querySelector('.request-info');
            if (requestInfo) {
                const statusElement = card.querySelector('[class*="status-"]');
                const status = statusElement ? statusElement.className.match(/status-(\w+)/)?.[1] : null;
                
                student.latestRequest = {
                    status: status,
                    dates: card.querySelector('.request-dates')?.textContent?.trim() || '',
                    reason: card.querySelector('.request-reason')?.textContent?.trim() || ''
                };
            }
            
            students.push(student);
        });
        
        return students;
    }

    function refreshStudentsData() {
        fetch('/api/students')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    studentsData = data.data;
                    initializeFuseSearch();
                    renderStudents(studentsData);
                    updateNotificationBadges();
                } else {
                    console.error('Failed to fetch students:', data.message);
                    showToast('Failed to load students data', 'error');
                }
            })
            .catch(error => {
                console.error('Error fetching students:', error);
                showToast('Error loading students data', 'error');
            });
    }

    function initializeFuseSearch() {
        if (studentsData.length > 0) {
            const fuseOptions = {
                keys: ['name', 'email', 'course', 'username'],
                threshold: 0.3,
                includeScore: true
            };
            fuse = new Fuse(studentsData, fuseOptions);
        }
    }

    function handleSearch(event) {
        const query = event.target.value.trim();
        
        if (query === '') {
            // Show all students
            renderStudents(studentsData);
            hideNoResults();
        } else {
            // Perform fuzzy search
            if (fuse) {
                const results = fuse.search(query);
                const filteredStudents = results.map(result => result.item);
                
                if (filteredStudents.length > 0) {
                    renderStudents(filteredStudents);
                    hideNoResults();
                } else {
                    renderStudents([]);
                    showNoResults();
                }
            }
        }
    }

    function renderStudents(students) {
        const studentsGrid = document.getElementById('studentsGrid');
        if (!studentsGrid) return;
        
        if (students.length === 0) {
            studentsGrid.innerHTML = `
                <div class="no-students text-center py-5">
                    <i class="bi bi-people fs-1 text-muted"></i>
                    <h4 class="mt-3 text-muted">No students found</h4>
                    <p class="text-muted">No students match your search criteria</p>
                </div>
            `;
            return;
        }
        
        studentsGrid.innerHTML = students.map(student => createStudentCard(student)).join('');
    }

    function createStudentCard(student) {
        const latestRequest = student.latestRequest;
        
        return `
            <div class="student-card" data-student-id="${escapeHtml(student.id)}">
                <div class="student-header">
                    <div class="student-avatar">
                        ${escapeHtml(student.avatar)}
                    </div>
                    <div class="student-info">
                        <h4 class="student-name">${escapeHtml(student.name)}</h4>
                        <p class="student-email">${escapeHtml(student.email)}</p>
                        <div class="student-meta">
                            <span class="course">${escapeHtml(student.course)}</span>
                            ${student.year !== 'N/A' ? `<span class="year">Year ${escapeHtml(student.year)}</span>` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="student-stats">
                    <div class="stat">
                        <span class="stat-label">Vacation Days</span>
                        <span class="stat-value">${escapeHtml(student.vacationDays)}</span>
                    </div>
                    ${latestRequest ? `
                        <div class="stat">
                            <span class="stat-label">Latest Request</span>
                            <span class="stat-value status-${escapeHtml(latestRequest.status)}">
                                ${capitalizeFirst(escapeHtml(latestRequest.status))}
                            </span>
                        </div>
                    ` : ''}
                </div>
                
                ${latestRequest ? `
                    <div class="request-info">
                        <div class="request-dates">
                            <i class="bi bi-calendar"></i>
                            ${escapeHtml(latestRequest.startDate)} - 
                            ${escapeHtml(latestRequest.endDate)}
                            <span class="request-days">(${escapeHtml(latestRequest.days)} days)</span>
                        </div>
                        <div class="request-reason">
                            <i class="bi bi-chat-left-text"></i>
                            ${escapeHtml(latestRequest.reason)}
                        </div>
                        ${latestRequest.status === 'pending' ? `
                            <div class="request-actions">
                                <button class="btn btn-success btn-sm" onclick="approveRequest('${escapeHtml(latestRequest.id)}')">
                                    <i class="bi bi-check-circle"></i> Approve
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="denyRequest('${escapeHtml(latestRequest.id)}')">
                                    <i class="bi bi-x-circle"></i> Deny
                                </button>
                            </div>
                        ` : ''}
                    </div>
                ` : `
                    <div class="no-requests">
                        <i class="bi bi-inbox"></i>
                        <span>No recent requests</span>
                    </div>
                `}
            </div>
        `;
    }

    function showNoResults() {
        const noResults = document.getElementById('noResults');
        if (noResults) {
            noResults.style.display = 'block';
        }
    }

    function hideNoResults() {
        const noResults = document.getElementById('noResults');
        if (noResults) {
            noResults.style.display = 'none';
        }
    }

    function updateNotificationBadges() {
        if (!studentsData) return;
        
        // Count pending requests
        const pendingCount = studentsData.filter(student => 
            student.latestRequest && student.latestRequest.status === 'pending'
        ).length;
        
        // Update all notification badges
        const notificationBadges = document.querySelectorAll(".notification-badge");
        notificationBadges.forEach(badge => {
            if (pendingCount > 0) {
                badge.textContent = pendingCount;
                badge.style.display = "inline-block";
            } else {
                badge.style.display = "none";
            }
        });
    }

    // Helper functions
    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        const div = document.createElement('div');
        div.textContent = text.toString();
        return div.innerHTML;
    }

    function capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function showToast(message, type = 'info') {
        // Implementation depends on your toast system
        console.log(`Toast (${type}): ${message}`);
        
        // If you have a toast system, call it here
        if (window.notificationManager && window.notificationManager.showToast) {
            window.notificationManager.showToast(message, type);
        }
    }

    // Expose functions globally for button onclick handlers
    window.refreshStudentsData = refreshStudentsData;
});

// Request approval/denial functions (global scope for onclick handlers)
window.approveRequest = function(requestId) {
    if (!requestId) {
        console.error('No request ID provided');
        return;
    }
    
    // Show loading state
    const button = event.target.closest('button');
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="bi bi-hourglass-split"></i> Approving...';
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
            // Show success message
            if (window.notificationManager && window.notificationManager.showToast) {
                window.notificationManager.showToast('Request approved successfully', 'success');
            }
            
            // Refresh data
            window.refreshStudentsData();
            
            // Trigger notification refresh
            window.dispatchEvent(new CustomEvent('requestStatusChanged'));
        } else {
            console.error('Failed to approve request:', data.message);
            if (window.notificationManager && window.notificationManager.showToast) {
                window.notificationManager.showToast('Failed to approve request', 'error');
            }
        }
    })
    .catch(error => {
        console.error('Error approving request:', error);
        if (window.notificationManager && window.notificationManager.showToast) {
            window.notificationManager.showToast('Error approving request', 'error');
        }
    })
    .finally(() => {
        // Reset button state
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="bi bi-check-circle"></i> Approve';
        }
    });
};

window.denyRequest = function(requestId) {
    if (!requestId) {
        console.error('No request ID provided');
        return;
    }
    
    // Show loading state
    const button = event.target.closest('button');
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="bi bi-hourglass-split"></i> Denying...';
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
            // Show success message
            if (window.notificationManager && window.notificationManager.showToast) {
                window.notificationManager.showToast('Request denied successfully', 'success');
            }
            
            // Refresh data
            window.refreshStudentsData();
            
            // Trigger notification refresh
            window.dispatchEvent(new CustomEvent('requestStatusChanged'));
        } else {
            console.error('Failed to deny request:', data.message);
            if (window.notificationManager && window.notificationManager.showToast) {
                window.notificationManager.showToast('Failed to deny request', 'error');
            }
        }
    })
    .catch(error => {
        console.error('Error denying request:', error);
        if (window.notificationManager && window.notificationManager.showToast) {
            window.notificationManager.showToast('Error denying request', 'error');
        }
    })
    .finally(() => {
        // Reset button state
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="bi bi-x-circle"></i> Deny';
        }
    });
};
