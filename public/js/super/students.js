// Students page JavaScript functionality
document.addEventListener("DOMContentLoaded", function() {
    let studentsData = [];
    let fuse = null;
    
    init();

    function init() {
        console.log('Initializing students page...');
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

        // Student card click handlers
        setupStudentCardClickHandlers();

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

    function setupStudentCardClickHandlers() {
        // Use event delegation for dynamically created student cards
        const studentsGrid = document.getElementById('studentsGrid');
        console.log('Setting up student card click handlers', studentsGrid);
        if (studentsGrid) {
            studentsGrid.addEventListener('click', function(event) {
                console.log('Click detected on students grid', event.target);
                const studentCard = event.target.closest('.student-card');
                console.log('Found student card:', studentCard);
                if (studentCard) {
                    const studentId = studentCard.dataset.studentId;
                    console.log('Student ID:', studentId);
                    console.log('Available students:', studentsData);
                    
                    let student = studentsData.find(s => s.id === studentId);
                    console.log('Found student data:', student);
                    
                    // If student not found in array, extract data from the card itself
                    if (!student) {
                        console.log('Student not found in studentsData, extracting from card');
                        student = extractStudentFromCard(studentCard);
                        console.log('Extracted student data:', student);
                    }
                    
                    if (student) {
                        showStudentDetailModal(student);
                    } else {
                        console.error('Student data not found for ID:', studentId);
                        showToast('Student data not available', 'error');
                    }
                } else {
                    console.log('Click was not on a student card');
                }
            });
        } else {
            console.error('Students grid not found!');
        }
    }

    function extractStudentFromCard(card) {
        try {
            return {
                id: card.dataset.studentId,
                name: card.querySelector('.student-name')?.textContent?.trim() || 'Unknown',
                email: card.querySelector('.student-email')?.textContent?.trim() || 'No email',
                course: card.querySelector('.course')?.textContent?.trim() || 'N/A',
                year: card.querySelector('.year')?.textContent?.replace('Year ', '')?.trim() || 'N/A',
                avatar: card.querySelector('.student-avatar')?.textContent?.trim() || 'U'
            };
        } catch (error) {
            console.error('Error extracting student data from card:', error);
            return null;
        }
    }

    function showStudentDetailModal(student) {
        const modalBackdrop = document.createElement("div");
        modalBackdrop.className = "modal-backdrop fade show";
        modalBackdrop.style.zIndex = "1040";

        const modal = document.createElement("div");
        modal.className = "modal fade show";
        modal.style.display = "block";
        modal.style.zIndex = "1050";
        modal.innerHTML = createStudentModalHTML(student);

        document.body.appendChild(modalBackdrop);
        document.body.appendChild(modal);

        // Store references for cleanup
        window.currentStudentModal = modal;
        window.currentStudentModalBackdrop = modalBackdrop;

        // Load student's FF balance
        window.loadStudentFFBalance(student.id);
    }

    function createStudentModalHTML(student) {
        return `
            <div class="modal-dialog modal-lg">
                <div class="modal-content" style="background-color: #232838;">
                    <div class="modal-header">
                        <h5 class="modal-title">Student Information</h5>
                        <button type="button" class="btn-close" onclick="closeStudentModal()"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4 text-center">
                                <div class="student-avatar-large" style="width: 80px; height: 80px; font-size: 32px; margin: 0 auto 15px; background-color: #0d6efd; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
                                    ${escapeHtml(student.avatar)}
                                </div>
                                <h4 class="mb-1 non-selectable">${escapeHtml(student.name)}</h4>
                                <p class="text-muted mb-2 selectable-text">${escapeHtml(student.id || 'N/A')}</p>
                                <div class="status-badge">
                                    <span class="badge bg-success">Active</span>
                                </div>
                            </div>
                            <div class="col-md-8">
                                <div class="mb-3">
                                    <h6 class="text-primary mb-2"><i class="bi bi-person-circle me-2"></i>Contact Information</h6>
                                    <div class="row">
                                        <div class="col-12">
                                            <small class="text-muted">Email</small>
                                            <div class="fw-medium selectable-text" style="cursor: pointer;" onclick="copyToClipboard('${escapeHtml(student.email)}')">
                                                ${escapeHtml(student.email)}
                                                <i class="bi bi-clipboard ms-1" style="font-size: 0.8rem; opacity: 0.7;"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- FF Balance Management Section -->
                                <div class="mb-3">
                                    <h6 class="text-primary mb-2"><i class="bi bi-wallet2 me-2"></i>FF Hours Management</h6>
                                    <div class="ff-balance-container p-3" style="border: 1px solid #007bff; border-radius: 8px;">
                                        <div class="text-center mb-2">
                                            <small class="text-muted">Current FF Balance</small>
                                            <h3 class="mb-0" id="studentFFBalance" style="color: #28a745;">
                                                <div class="spinner-border spinner-border-sm text-primary" role="status">
                                                    <span class="visually-hidden">Loading...</span>
                                                </div>
                                            </h3>
                                        </div>
                                        <div class="ff-management-controls">
                                            <div class="input-group mb-2">
                                                <input type="number" class="form-control" id="ffHoursInput" placeholder="Enter hours" min="1" max="1000" style="background-color: transparent; border-color: #007bff; color: white;">
                                                <span class="input-group-text" style="background-color: transparent; border-color: #007bff; color: #a0a7b5;">hours</span>
                                            </div>
                                            <div class="d-flex gap-2">
                                                <button class="btn btn-outline-success btn-sm flex-fill" onclick="adjustStudentFF('${escapeHtml(student.id)}', 'add')">
                                                    <i class="bi bi-plus-circle me-1"></i> Add Hours
                                                </button>
                                                <button class="btn btn-outline-warning btn-sm flex-fill" onclick="adjustStudentFF('${escapeHtml(student.id)}', 'subtract')">
                                                    <i class="bi bi-dash-circle me-1"></i> Remove Hours
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Quick Actions Section -->
                                <div class="mb-2">
                                    <h6 class="text-primary mb-2"><i class="bi bi-lightning me-2"></i>Quick Actions</h6>
                                    <div class="d-flex gap-2 flex-wrap">
                                        <button class="btn btn-outline-light btn-sm" onclick="viewStudentRequests('${escapeHtml(student.id)}')">
                                            <i class="bi bi-file-earmark-text me-1"></i> View Requests
                                        </button>
                                        <button class="btn btn-outline-info btn-sm" onclick="sendStudentMessage('${escapeHtml(student.id)}')">
                                            <i class="bi bi-envelope me-1"></i> Send Message
                                        </button>
                                        <button class="btn btn-outline-warning btn-sm" onclick="viewStudentHistory('${escapeHtml(student.id)}')">
                                            <i class="bi bi-clock-history me-1"></i> View History
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="closeStudentModal()">Close</button>
                    </div>
                </div>
            </div>
        `;
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

    // Make showToast globally available
    window.showToast = showToast;

    // Expose functions globally for button onclick handlers
    window.refreshStudentsData = refreshStudentsData;
});

// Global functions for student modal
window.closeStudentModal = function() {
    if (window.currentStudentModal) {
        document.body.removeChild(window.currentStudentModal);
        window.currentStudentModal = null;
    }
    if (window.currentStudentModalBackdrop) {
        document.body.removeChild(window.currentStudentModalBackdrop);
        window.currentStudentModalBackdrop = null;
    }
};

window.loadStudentFFBalance = function(studentId) {
    fetch(`/api/student-balance?id=${studentId}`)
        .then(response => response.json())
        .then(data => {
            const balanceElement = document.getElementById('studentFFBalance');
            if (balanceElement) {
                if (data.success) {
                    balanceElement.innerHTML = `${data.balance} hours`;
                } else {
                    balanceElement.innerHTML = `<span class="text-warning">Error loading balance</span>`;
                }
            }
        })
        .catch(error => {
            console.error('Error loading student balance:', error);
            const balanceElement = document.getElementById('studentFFBalance');
            if (balanceElement) {
                balanceElement.innerHTML = `<span class="text-danger">Failed to load</span>`;
            }
        });
};

window.adjustStudentFF = function(studentId, action) {
    closeStudentModal(); 
    const hoursInput = document.getElementById('ffHoursInput');
    const hours = parseInt(hoursInput.value);
    
    if (!hours || hours <= 0) {
        showToast('Please enter a valid number of hours', 'error');
        return;
    }
    
    // Show the FF hours modal instead of confirm dialog
    showFFModal(studentId, action, hours);
};

// Global functions for FF Hours modal
window.showFFModal = function(studentId, action, hours) {
    const modal = document.getElementById('ffHoursModal');
    const title = document.querySelector('.ff-hours-modal .modal-title');
    const message = document.querySelector('.ff-hours-modal .modal-message');
    
    // Update content based on add/remove action
    if (action === 'add') {
        title.textContent = 'Add FF Hours';
        message.textContent = `Are you sure you want to add ${hours} hours to this student's FF balance?`;
    } else {
        title.textContent = 'Remove FF Hours';
        message.textContent = `Are you sure you want to remove ${hours} hours from this student's FF balance?`;
    }
    
    modal.style.display = 'block';
    modal.dataset.studentId = studentId;
    modal.dataset.action = action;
    modal.dataset.hours = hours;
    
    // Focus on the reason input
    document.getElementById('ffReason').focus();
};

window.closeFFModal = function() {
    const modal = document.getElementById('ffHoursModal');
    modal.style.display = 'none';
    document.getElementById('ffReason').value = '';
};

window.confirmFFAdjustment = function() {
    const modal = document.getElementById('ffHoursModal');
    const reason = document.getElementById('ffReason').value.trim();
    const studentId = modal.dataset.studentId;
    const action = modal.dataset.action;
    const hours = parseInt(modal.dataset.hours);
    
    if (!reason) {
        showToast('Please provide a reason for the adjustment.', 'error');
        return;
    }
    
    // Close modal
    closeFFModal();
    
    // Show loading state
    const addBtn = document.querySelector('button[onclick*="add"]');
    const removeBtn = document.querySelector('button[onclick*="subtract"]');
    if (addBtn) addBtn.disabled = true;
    if (removeBtn) removeBtn.disabled = true;
    
    fetch('/api/adjust-student-ff', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            student_id: studentId,
            action: action,
            hours: hours,
            reason: reason
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(`Successfully ${action === 'add' ? 'added' : 'removed'} ${hours} hours`, 'success');
            // Refresh the balance display
            window.loadStudentFFBalance(studentId);
            // Clear the input
            const hoursInput = document.getElementById('ffHoursInput');
            if (hoursInput) hoursInput.value = '';
        } else {
            showToast(data.message || `Failed to ${action === 'add' ? 'add' : 'remove'} hours`, 'error');
        }
    })
    .catch(error => {
        console.error('Error adjusting FF hours:', error);
        showToast(`Error ${action === 'add' ? 'adding' : 'removing'} hours`, 'error');
    })
    .finally(() => {
        // Reset button states
        if (addBtn) addBtn.disabled = false;
        if (removeBtn) removeBtn.disabled = false;
    });
};

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('ffHoursModal');
    if (event.target === modal) {
        closeFFModal();
    }
});

// Close modal with Escape key
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('ffHoursModal');
        if (modal.style.display === 'block') {
            closeFFModal();
        }
    }
});

// Global functions for student modal
window.closeStudentModal = function() {
    if (window.currentStudentModal) {
        document.body.removeChild(window.currentStudentModal);
        window.currentStudentModal = null;
    }
    if (window.currentStudentModalBackdrop) {
        document.body.removeChild(window.currentStudentModalBackdrop);
        window.currentStudentModalBackdrop = null;
    }
};

window.loadStudentFFBalance = function(studentId) {
    fetch(`/api/student-balance?id=${studentId}`)
        .then(response => response.json())
        .then(data => {
            const balanceElement = document.getElementById('studentFFBalance');
            if (balanceElement) {
                if (data.success) {
                    balanceElement.innerHTML = `${data.balance} hours`;
                } else {
                    balanceElement.innerHTML = `<span class="text-warning">Error loading balance</span>`;
                }
            }
        })
        .catch(error => {
            console.error('Error loading student balance:', error);
            const balanceElement = document.getElementById('studentFFBalance');
            if (balanceElement) {
                balanceElement.innerHTML = `<span class="text-danger">Failed to load</span>`;
            }
        });
};

window.adjustStudentFF = function(studentId, action) {
    const hoursInput = document.getElementById('ffHoursInput');
    const hours = parseInt(hoursInput.value);
    
    if (!hours || hours <= 0) {
        showToast('Please enter a valid number of hours', 'error');
        return;
    }

    window.closeStudentModal();
    // Show the FF hours modal instead of confirm dialog
    showFFModal(studentId, action, hours);
};

// Global functions for FF Hours modal
window.showFFModal = function(studentId, action, hours) {
    const modal = document.getElementById('ffHoursModal');
    const title = document.querySelector('.ff-hours-modal .modal-title');
    const message = document.querySelector('.ff-hours-modal .modal-message');
    
    // Update content based on add/remove action
    if (action === 'add') {
        title.textContent = 'Add FF Hours';
        message.textContent = `Are you sure you want to add ${hours} hours to this student's FF balance?`;
    } else {
        title.textContent = 'Remove FF Hours';
        message.textContent = `Are you sure you want to remove ${hours} hours from this student's FF balance?`;
    }
    
    modal.style.display = 'block';
    modal.dataset.studentId = studentId;
    modal.dataset.action = action;
    modal.dataset.hours = hours;
    
    // Focus on the reason input
    document.getElementById('ffReason').focus();
};

window.closeFFModal = function() {
    const modal = document.getElementById('ffHoursModal');
    modal.style.display = 'none';
    document.getElementById('ffReason').value = '';
};

window.confirmFFAdjustment = function() {
    const modal = document.getElementById('ffHoursModal');
    const reason = document.getElementById('ffReason').value.trim();
    const studentId = modal.dataset.studentId;
    const action = modal.dataset.action;
    const hours = parseInt(modal.dataset.hours);
    
    if (!reason) {
        showToast('Please provide a reason for the adjustment.', 'error');
        return;
    }
    
    // Close modal
    closeFFModal();
    
    // Show loading state
    const addBtn = document.querySelector('button[onclick*="add"]');
    const removeBtn = document.querySelector('button[onclick*="subtract"]');
    if (addBtn) addBtn.disabled = true;
    if (removeBtn) removeBtn.disabled = true;
    
    fetch('/api/adjust-student-ff', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            student_id: studentId,
            action: action,
            hours: hours,
            reason: reason
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(`Successfully ${action === 'add' ? 'added' : 'removed'} ${hours} hours`, 'success');
            // Refresh the balance display
            window.loadStudentFFBalance(studentId);
            // Clear the input
            const hoursInput = document.getElementById('ffHoursInput');
            if (hoursInput) hoursInput.value = '';
        } else {
            showToast(data.message || `Failed to ${action === 'add' ? 'add' : 'remove'} hours`, 'error');
        }
    })
    .catch(error => {
        console.error('Error adjusting FF hours:', error);
        showToast(`Error ${action === 'add' ? 'adding' : 'removing'} hours`, 'error');
    })
    .finally(() => {
        // Reset button states
        if (addBtn) addBtn.disabled = false;
        if (removeBtn) removeBtn.disabled = false;
    });
};

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('ffHoursModal');
    if (event.target === modal) {
        closeFFModal();
    }
});

// Close modal with Escape key
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('ffHoursModal');
        if (modal.style.display === 'block') {
            closeFFModal();
        }
    }
});

// Global functions for student modal
window.closeStudentModal = function() {
    if (window.currentStudentModal) {
        document.body.removeChild(window.currentStudentModal);
        window.currentStudentModal = null;
    }
    if (window.currentStudentModalBackdrop) {
        document.body.removeChild(window.currentStudentModalBackdrop);
        window.currentStudentModalBackdrop = null;
    }
};

window.viewStudentRequests = function(studentId) {
    // Close the student modal first
    closeStudentModal();
    // Navigate to requests page with student filter
    window.location.href = `/requests?student=${studentId}`;
};

window.sendStudentMessage = function(studentId) {
    showToast('Message functionality not implemented yet', 'info');
    // TODO: Implement student messaging functionality
};

window.viewStudentHistory = function(studentId) {
    showToast('Loading transaction history...', 'info');
    
    // Fetch student transaction history
    fetch(`/api/student-transactions?id=${studentId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showTransactionHistoryModal(data.transactions, data.student_name);
        } else {
            showToast('Could not load transaction history', 'error');
        }
    })
    .catch(error => {
        console.error('Error loading transaction history:', error);
        showToast('Error loading transaction history', 'error');
    });
};

function showTransactionHistoryModal(transactions, studentName) {
    const modalBackdrop = document.createElement("div");
    modalBackdrop.className = "modal-backdrop fade show";
    modalBackdrop.style.zIndex = "1040";

    const modal = document.createElement("div");
    modal.className = "modal fade show";
    modal.style.display = "block";
    modal.style.zIndex = "1050";
    modal.innerHTML = createTransactionHistoryModalHTML(transactions, studentName);

    document.body.appendChild(modalBackdrop);
    document.body.appendChild(modal);

    // Store references for cleanup
    window.currentTransactionModal = modal;
    window.currentTransactionModalBackdrop = modalBackdrop;
}

function createTransactionHistoryModalHTML(transactions, studentName) {
    let transactionRows = '';
    
    if (transactions && transactions.length > 0) {
        transactionRows = transactions.map(transaction => `
            <div class="transaction-item d-flex justify-content-between align-items-center py-3 border-bottom">
                <div class="transaction-info">
                    <div class="transaction-date small text-muted">${formatDate(transaction.date)}</div>
                    <div class="transaction-description">${escapeHtml(transaction.description)}</div>
                </div>
                <div class="transaction-amount ${transaction.amount > 0 ? 'text-success' : 'text-danger'}">
                    ${transaction.amount > 0 ? '+' : ''}${transaction.amount}ff
                </div>
            </div>
        `).join('');
    } else {
        transactionRows = '<div class="text-muted text-center py-4">No transactions found</div>';
    }

    return `
        <div class="modal-dialog modal-lg">
            <div class="modal-content" style="background-color: #232838;">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="bi bi-clock-history me-2"></i>Transaction History - ${escapeHtml(studentName)}
                    </h5>
                    <button type="button" class="btn-close" onclick="closeTransactionModal()"></button>
                </div>
                <div class="modal-body">
                    <div class="transaction-history">
                        ${transactionRows}
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeTransactionModal()">Close</button>
                </div>
            </div>
        </div>
    `;
}

window.closeTransactionModal = function() {
    if (window.currentTransactionModal) {
        document.body.removeChild(window.currentTransactionModal);
        window.currentTransactionModal = null;
    }
    if (window.currentTransactionModalBackdrop) {
        document.body.removeChild(window.currentTransactionModalBackdrop);
        window.currentTransactionModalBackdrop = null;
    }
};

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
