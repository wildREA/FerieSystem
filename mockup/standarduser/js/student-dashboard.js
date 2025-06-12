// Student Dashboard functionality
document.addEventListener("DOMContentLoaded", function() {
    // Student data (this would typically come from an API)
    const studentData = {
        id: "STU001",
        name: "Emma Nielsen",
        email: "emma.nielsen@student.dk",
        course: "Computer Science",
        year: 3,
        totalVacationHours: 200, // 25 days * 8 hours
        usedHours: 64, // 8 days * 8 hours
        pendingHours: 16, // 2 days * 8 hours
        remainingHours: 136 // 17 days * 8 hours
    };

    // Mock requests data
    const requestsData = [
        {
            id: "REQ001",
            startDate: "2025-06-01T09:00:00",
            endDate: "2025-06-06T17:00:00",
            reason: "Family vacation",
            status: "pending",
            submitDate: "2025-05-28T10:15:00",
            hours: 40
        },
        {
            id: "REQ002",
            startDate: "2025-05-20T08:30:00",
            endDate: "2025-05-23T16:30:00",
            reason: "Medical appointment",
            status: "approved",
            submitDate: "2025-05-15T14:20:00",
            hours: 24
        },
        {
            id: "REQ003",
            startDate: "2025-07-01T10:00:00",
            endDate: "2025-07-08T18:00:00",
            reason: "Summer break",
            status: "denied",
            submitDate: "2025-06-05T09:45:00",
            hours: 56,
            denyReason: "Overlaps with mandatory courses"
        }
    ];

    // Balance history data
    const balanceHistory = [
        {
            date: "2025-05-23",
            description: "Vacation Request Approved - Medical appointment",
            amount: -24,
            type: "deduction"
        },
        {
            date: "2025-04-15",
            description: "Vacation Request Approved - Personal leave",
            amount: -16,
            type: "deduction"
        },
        {
            date: "2025-03-10",
            description: "Vacation Request Approved - Family emergency",
            amount: -24,
            type: "deduction"
        },
        {
            date: "2025-01-01",
            description: "Annual Allocation",
            amount: 200,
            type: "allocation"
        }
    ];

    // DOM elements
    const navSections = document.querySelectorAll('.nav-section');
    const contentSections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    
    // Form elements
    const newRequestForm = document.getElementById('newRequestForm');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const requestReasonInput = document.getElementById('requestReason');
    const requestDurationSpan = document.getElementById('requestDuration');
    const balanceAfterRequestSpan = document.getElementById('balanceAfterRequest');
    const statusFilter = document.getElementById('statusFilter');

    // Initialize the application
    init();

    function init() {
        updateStudentInfo();
        updateDashboardStats();
        setupEventListeners();
        renderRecentRequests();
        renderAllRequests();
        renderBalanceHistory();
        setupNavigation();
        updateProgressBars();
    }

    function updateStudentInfo() {
        document.getElementById('studentName').textContent = studentData.name;
        document.getElementById('headerUserName').textContent = studentData.name.toUpperCase();
    }

    function updateDashboardStats() {
        document.getElementById('totalBalance').textContent = Math.round(studentData.totalVacationHours / 8);
        document.getElementById('usedDays').textContent = Math.round(studentData.usedHours / 8);
        document.getElementById('pendingRequests').textContent = Math.round(studentData.pendingHours / 8);
        document.getElementById('remainingDays').textContent = Math.round(studentData.remainingHours / 8);
        document.getElementById('requestsBadge').textContent = requestsData.filter(r => r.status === 'pending').length;

        // Update balance section
        document.getElementById('balanceTotal').textContent = Math.round(studentData.totalVacationHours / 8);
        document.getElementById('balanceUsed').textContent = Math.round(studentData.usedHours / 8);
        document.getElementById('balancePending').textContent = Math.round(studentData.pendingHours / 8);
        document.getElementById('balanceRemaining').textContent = `${studentData.remainingHours}ff (${Math.round(studentData.remainingHours / 8)} days)`;
        document.getElementById('balanceAfterRequest').textContent = `${studentData.remainingHours}ff`;
    }

    function updateProgressBars() {
        const totalHours = studentData.totalVacationHours;
        const usedPercent = (studentData.usedHours / totalHours) * 100;
        const pendingPercent = (studentData.pendingHours / totalHours) * 100;

        document.getElementById('usedProgressBar').style.width = usedPercent + '%';
        document.getElementById('usedProgressBar').textContent = `Used: ${studentData.usedHours}ff (${Math.round(studentData.usedHours / 8)} days)`;
        
        document.getElementById('pendingProgressBar').style.width = pendingPercent + '%';
        document.getElementById('pendingProgressBar').textContent = `Pending: ${studentData.pendingHours}ff (${Math.round(studentData.pendingHours / 8)} days)`;
    }

    function setupEventListeners() {
        // Form submission
        newRequestForm.addEventListener('submit', handleRequestSubmission);
        
        // Date change listeners for duration calculation
        startDateInput.addEventListener('change', calculateRequestDuration);
        endDateInput.addEventListener('change', calculateRequestDuration);
        
        // Time change listeners
        document.getElementById('startHour').addEventListener('change', calculateRequestDuration);
        document.getElementById('startMinute').addEventListener('change', calculateRequestDuration);
        document.getElementById('endHour').addEventListener('change', calculateRequestDuration);
        document.getElementById('endMinute').addEventListener('change', calculateRequestDuration);
        
        // Status filter
        statusFilter.addEventListener('change', filterRequests);
        
        // Real-time form validation
        document.getElementById('requestReason').addEventListener('input', validateForm);
        
        // Update form when dates change to check 48-hour advance notice
        startDateInput.addEventListener('change', checkAdvanceNotice);
        document.getElementById('startHour').addEventListener('change', checkAdvanceNotice);
        document.getElementById('startMinute').addEventListener('change', checkAdvanceNotice);
    }

    function setupNavigation() {
        navSections.forEach(section => {
            section.addEventListener('click', function() {
                const sectionText = this.querySelector('span').textContent;
                switchToSection(getSectionId(sectionText));
                
                // Update active nav
                navSections.forEach(s => s.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    function getSectionId(sectionText) {
        const sectionMap = {
            'Dashboard': 'dashboardSection',
            'New Request': 'newRequestSection',
            'My Requests': 'requestsSection',
            'Balance': 'balanceSection'
        };
        return sectionMap[sectionText] || 'dashboardSection';
    }

    function switchToSection(sectionId) {
        // Hide all sections
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        document.getElementById(sectionId).classList.add('active');
        
        // Update page title and subtitle
        updatePageHeader(sectionId);
    }

    function updatePageHeader(sectionId) {
        const headerMap = {
            'dashboardSection': {
                title: 'Dashboard',
                subtitle: 'Welcome back, manage your vacation requests'
            },
            'newRequestSection': {
                title: 'New Request',
                subtitle: 'Submit a new vacation request'
            },
            'requestsSection': {
                title: 'My Requests',
                subtitle: 'View and track your vacation requests'
            },
            'balanceSection': {
                title: 'Balance',
                subtitle: 'View your vacation day balance and usage history'
            }
        };
        
        const header = headerMap[sectionId];
        if (header) {
            pageTitle.textContent = header.title;
            pageSubtitle.textContent = header.subtitle;
        }
    }

    function calculateRequestDuration() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const startHour = document.getElementById('startHour').value;
        const startMinute = document.getElementById('startMinute').value;
        const endHour = document.getElementById('endHour').value;
        const endMinute = document.getElementById('endMinute').value;
        
        // Reset displays
        document.getElementById('requestDuration').textContent = 'Please select dates';
        document.getElementById('workingDays').textContent = '0ff';
        document.getElementById('balanceAfterRequest').textContent = studentData.remainingHours + 'ff';
        
        // Hide warnings
        document.getElementById('balanceWarning').style.display = 'none';
        document.getElementById('balanceError').style.display = 'none';
        
        if (!startDate || !endDate) {
            return;
        }
        
        // Create full datetime objects
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (startHour && startMinute) {
            start.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
        }
        
        if (endHour && endMinute) {
            end.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);
        }
        
        if (end <= start) {
            document.getElementById('requestDuration').textContent = 'End must be after start';
            document.getElementById('requestDuration').style.color = '#dc3545';
            return;
        }
        
        // Calculate working hours and weekend hours
        const result = calculateWorkingHours(start, end);
        const totalHours = result.workingHours;
        const totalCalendarDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        
        // Update display
        document.getElementById('requestDuration').textContent = `${totalCalendarDays} calendar day${totalCalendarDays !== 1 ? 's' : ''}`;
        document.getElementById('requestDuration').style.color = '#ffffff';
        document.getElementById('workingDays').textContent = `${totalHours}ff (${Math.round(totalHours / 8)} days)`;
        
        // Update duration calculator display
        const durationCalculator = document.getElementById('durationCalculator');
        if (durationCalculator) {
            document.getElementById('totalCalendarDays').textContent = totalCalendarDays;
            document.getElementById('calculatedWorkingHours').textContent = `${totalHours}ff`;
            document.getElementById('finalHoursDeduction').textContent = `${totalHours}ff`;
            durationCalculator.style.display = 'block';
        }
        
        // Calculate balance after request
        const balanceAfter = studentData.remainingHours - totalHours;
        const balanceElement = document.getElementById('balanceAfterRequest');
        balanceElement.textContent = `${balanceAfter}ff (${Math.round(balanceAfter / 8)} days)`;
        
        // Update balance display colors and warnings
        if (balanceAfter < 0) {
            balanceElement.className = 'summary-value insufficient';
            document.getElementById('balanceError').style.display = 'block';
        } else if (balanceAfter <= 24) { // Less than 3 days (24 hours)
            balanceElement.className = 'summary-value warning';
            document.getElementById('balanceWarning').style.display = 'block';
        } else {
            balanceElement.className = 'summary-value good';
        }
        
        // Update current balance display
        document.getElementById('currentBalance').textContent = `${studentData.remainingHours}ff (${Math.round(studentData.remainingHours / 8)} days)`;
        
        // Update preview
        updateRequestPreview();
        
        // Check advance notice
        checkAdvanceNotice();
    }
    
    function calculateWorkingHours(startDate, endDate) {
        let current = new Date(startDate);
        let workingHours = 0;
        
        const end = new Date(endDate);
        
        while (current < end) {
            const dayOfWeek = current.getDay();
            const nextDay = new Date(current);
            nextDay.setDate(current.getDate() + 1);
            nextDay.setHours(0, 0, 0, 0);
            
            // Calculate end time for this day
            const dayEnd = nextDay > end ? end : nextDay;
            
            // Skip if we're past the end date
            if (current >= end) break;
            
            // Only count working days (Monday-Friday)
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                // Working day
                if (!isHoliday(current)) {
                    const dayHours = Math.max(0, (dayEnd - current) / (1000 * 60 * 60));
                    workingHours += Math.min(8, dayHours); // Cap at 8 hours per day
                }
            }
            
            // Move to next day
            current = new Date(nextDay);
        }
        
        return { 
            workingHours: Math.round(workingHours)
        };
    }
    
    function checkAdvanceNotice() {
        const startDate = startDateInput.value;
        const startHour = document.getElementById('startHour').value;
        const startMinute = document.getElementById('startMinute').value;
        
        // Remove existing advance notice warning
        const existingWarning = document.getElementById('advanceNoticeWarning');
        if (existingWarning) {
            existingWarning.remove();
        }
        
        if (!startDate || !startHour || !startMinute) {
            return;
        }
        
        const requestStart = new Date(`${startDate}T${startHour}:${startMinute}:00`);
        const now = new Date();
        const hoursDifference = (requestStart - now) / (1000 * 60 * 60);
        
        if (hoursDifference < 48) {
            // Create advance notice warning
            const warningHtml = `
                <div id="advanceNoticeWarning" class="alert alert-warning mt-3">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    <strong>Short Notice:</strong> This request is less than 48 hours in advance. 
                    You can still submit it, but approval may be denied.
                    <small class="d-block mt-1">Time until request: ${Math.round(hoursDifference)} hours</small>
                </div>
            `;
            
            // Insert after the request summary card
            const summaryCard = document.querySelector('.col-lg-4 .card');
            summaryCard.insertAdjacentHTML('afterend', warningHtml);
        }
    }
    
    function isHoliday(date) {
        // Simplified holiday check - you can expand this with a proper holiday API or list
        const holidays = [
            '2025-01-01', // New Year's Day
            '2025-12-25', // Christmas
            '2025-12-24', // Christmas Eve
            // Add more holidays as needed
        ];
        
        const dateString = date.toISOString().split('T')[0];
        return holidays.includes(dateString);
    }
    
    function updateRequestPreview() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const startHour = document.getElementById('startHour').value;
        const startMinute = document.getElementById('startMinute').value;
        const endHour = document.getElementById('endHour').value;
        const endMinute = document.getElementById('endMinute').value;
        
        const previewDiv = document.getElementById('requestPreview');
        
        if (startDate && endDate && startHour && startMinute && endHour && endMinute) {
            const startDateTime = `${formatDate(startDate)} at ${startHour}:${startMinute}`;
            const endDateTime = `${formatDate(endDate)} at ${endHour}:${endMinute}`;
            
            document.getElementById('previewStart').textContent = startDateTime;
            document.getElementById('previewEnd').textContent = endDateTime;
            document.getElementById('previewType').textContent = 'Vacation Request';
            
            previewDiv.style.display = 'block';
        } else {
            previewDiv.style.display = 'none';
        }
    }
    
    function validateForm() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const reason = document.getElementById('requestReason').value;
        const submitBtn = document.querySelector('button[type="submit"]');
        
        // Basic validation
        let isValid = true;
        
        if (!startDate) {
            startDateInput.classList.add('is-invalid');
            isValid = false;
        } else {
            startDateInput.classList.remove('is-invalid');
            startDateInput.classList.add('is-valid');
        }
        
        if (!endDate) {
            endDateInput.classList.add('is-invalid');
            isValid = false;
        } else {
            endDateInput.classList.remove('is-invalid');
            endDateInput.classList.add('is-valid');
        }
        
        if (!reason || reason.trim().length < 10) {
            document.getElementById('requestReason').classList.add('is-invalid');
            isValid = false;
        } else {
            document.getElementById('requestReason').classList.remove('is-invalid');
            document.getElementById('requestReason').classList.add('is-valid');
        }
        
        // Enable/disable submit button
        submitBtn.disabled = !isValid;
        
        return isValid;
    }

    function handleRequestSubmission(e) {
        e.preventDefault();
        
        // Validate form first
        if (!validateForm()) {
            showNotification('Please fill in all required fields correctly', 'warning');
            return;
        }
        
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const startHour = document.getElementById('startHour').value;
        const startMinute = document.getElementById('startMinute').value;
        const endHour = document.getElementById('endHour').value;
        const endMinute = document.getElementById('endMinute').value;
        const reason = document.getElementById('requestReason').value;
        
        // Create full datetime strings
        const startDateTime = `${startDate}T${startHour}:${startMinute}:00`;
        const endDateTime = `${endDate}T${endHour}:${endMinute}:00`;
        
        const start = new Date(startDateTime);
        const end = new Date(endDateTime);
        
        if (end <= start) {
            showNotification('End date must be after start date', 'danger');
            return;
        }
        
        // Calculate working hours
        const result = calculateWorkingHours(start, end);
        const workingHours = result.workingHours;
        
        if (workingHours > studentData.remainingHours) {
            showNotification('Request exceeds available vacation hours', 'danger');
            return;
        }
        
        // Check if it's a short notice request
        const now = new Date();
        const hoursDifference = (start - now) / (1000 * 60 * 60);
        const isShortNotice = hoursDifference < 48;
        
        let confirmMessage = `Submit vacation request for ${workingHours}ff (${Math.round(workingHours / 8)} days)?`;
        if (isShortNotice) {
            confirmMessage += '\n\nNote: This is a short notice request (less than 48 hours in advance).';
        }
        
        // Show confirmation dialog
        if (!confirm(confirmMessage)) {
            return;
        }
        
        // Create new request
        const newRequest = {
            id: 'REQ' + String(requestsData.length + 1).padStart(3, '0'),
            startDate: startDateTime,
            endDate: endDateTime,
            reason: reason,
            status: 'pending',
            submitDate: new Date().toISOString(),
            hours: workingHours,
            isShortNotice: isShortNotice,
            totalCalendarDays: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        };
        
        requestsData.unshift(newRequest);
        
        // Update student data
        studentData.pendingHours += workingHours;
        studentData.remainingHours -= workingHours;
        
        // Update UI
        updateDashboardStats();
        updateProgressBars();
        renderRecentRequests();
        renderAllRequests();
        
        // Reset form
        resetForm();
        
        let successMessage = 'Request submitted successfully!';
        if (isShortNotice) {
            successMessage += ' (Short notice - may take longer to approve)';
        }
        showNotification(successMessage, 'success');
        
        // Switch to requests view
        switchToSection('requestsSection');
        navSections.forEach(s => s.classList.remove('active'));
        document.querySelector('.nav-section:nth-child(3)').classList.add('active');
    }

    function resetForm() {
        newRequestForm.reset();
        
        // Reset all form controls
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        document.getElementById('startHour').value = '09';
        document.getElementById('startMinute').value = '00';
        document.getElementById('endHour').value = '17';
        document.getElementById('endMinute').value = '00';
        document.getElementById('requestReason').value = '';
        
        // Reset validation classes
        document.querySelectorAll('.form-control').forEach(control => {
            control.classList.remove('is-valid', 'is-invalid');
        });
        
        // Reset summary displays
        document.getElementById('requestDuration').textContent = 'Please select dates';
        document.getElementById('workingDays').textContent = '0ff';
        document.getElementById('balanceAfterRequest').textContent = studentData.remainingHours + 'ff';
        document.getElementById('balanceAfterRequest').className = 'summary-value';
        
        // Hide duration calculator
        const durationCalculator = document.getElementById('durationCalculator');
        if (durationCalculator) {
            durationCalculator.style.display = 'none';
        }
        
        // Hide preview and warnings
        document.getElementById('requestPreview').style.display = 'none';
        document.getElementById('balanceWarning').style.display = 'none';
        document.getElementById('balanceError').style.display = 'none';
        
        // Remove advance notice warning
        const advanceWarning = document.getElementById('advanceNoticeWarning');
        if (advanceWarning) {
            advanceWarning.remove();
        }
        
        // Enable submit button
        document.querySelector('button[type="submit"]').disabled = false;
    }
    
    function previewRequest() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const startHour = document.getElementById('startHour').value;
        const startMinute = document.getElementById('startMinute').value;
        const endHour = document.getElementById('endHour').value;
        const endMinute = document.getElementById('endMinute').value;
        const reason = document.getElementById('requestReason').value;
        
        if (!startDate || !endDate || !startHour || !startMinute || !endHour || !endMinute || !reason) {
            showNotification('Please fill in all fields to preview the request', 'warning');
            return;
        }
        
        const start = new Date(`${startDate}T${startHour}:${startMinute}:00`);
        const end = new Date(`${endDate}T${endHour}:${endMinute}:00`);
        
        if (end <= start) {
            showNotification('End date must be after start date', 'danger');
            return;
        }
        
        const result = calculateWorkingHours(start, end);
        const workingHours = result.workingHours;
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        
        // Check advance notice
        const now = new Date();
        const hoursDifference = (start - now) / (1000 * 60 * 60);
        const isShortNotice = hoursDifference < 48;
        
        const previewHtml = `
            <div class="modal fade" id="requestPreviewModal" tabindex="-1" aria-labelledby="requestPreviewModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content bg-dark">
                        <div class="modal-header">
                            <h5 class="modal-title text-white" id="requestPreviewModalLabel">Request Preview</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${isShortNotice ? `
                                <div class="alert alert-warning">
                                    <i class="bi bi-exclamation-triangle me-2"></i>
                                    <strong>Short Notice:</strong> This request is less than 48 hours in advance.
                                </div>
                            ` : ''}
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 class="text-primary">Request Details</h6>
                                    <div class="preview-detail">
                                        <strong>Type:</strong> Vacation Request
                                    </div>
                                    <div class="preview-detail">
                                        <strong>Start:</strong> ${formatDate(startDate)} at ${startHour}:${startMinute}
                                    </div>
                                    <div class="preview-detail">
                                        <strong>End:</strong> ${formatDate(endDate)} at ${endHour}:${endMinute}
                                    </div>
                                    <div class="preview-detail">
                                        <strong>Reason:</strong> ${reason}
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="text-primary">Duration Breakdown</h6>
                                    <div class="preview-detail">
                                        <strong>Total Calendar Days:</strong> ${totalDays}
                                    </div>
                                    <div class="preview-detail">
                                        <strong>Working Hours:</strong> ${workingHours}ff (${Math.round(workingHours / 8)} days)
                                    </div>
                                    <div class="preview-detail">
                                        <strong>Balance After:</strong> ${studentData.remainingHours - workingHours}ff (${Math.round((studentData.remainingHours - workingHours) / 8)} days)
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-success" onclick="document.getElementById('newRequestForm').dispatchEvent(new Event('submit'));" data-bs-dismiss="modal">Submit Request</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('requestPreviewModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', previewHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('requestPreviewModal'));
        modal.show();
        
        // Clean up modal after hiding
        document.getElementById('requestPreviewModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    function renderRecentRequests() {
        const recentRequestsList = document.getElementById('recentRequestsList');
        const recentRequests = requestsData.slice(0, 3);
        
        if (recentRequests.length === 0) {
            recentRequestsList.innerHTML = `
                <div class="no-requests">
                    <i class="bi bi-calendar-x"></i>
                    <p>No recent requests</p>
                </div>
            `;
            return;
        }
        
        recentRequestsList.innerHTML = recentRequests.map(request => `
            <div class="recent-request-item">
                <div class="recent-request-info">
                    <div class="recent-request-dates">
                        ${formatDate(request.startDate)} - ${formatDate(request.endDate)}
                    </div>
                    <div class="recent-request-reason">${request.reason}</div>
                </div>
                <div class="status-badge status-${request.status}">${request.status}</div>
            </div>
        `).join('');
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
                        ${formatDate(request.startDate)} - ${formatDate(request.endDate)}
                    </div>
                    <div class="status-badge status-${request.status}">${request.status}</div>
                </div>
                <div class="request-details">
                    <div class="detail-row">
                        <span class="detail-label">Duration:</span>
                        <span class="detail-value">${request.hours}ff (${Math.round(request.hours / 8)} day${Math.round(request.hours / 8) !== 1 ? 's' : ''})</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Submitted:</span>
                        <span class="detail-value">${formatDate(request.submitDate)}</span>
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

    function renderBalanceHistory() {
        const balanceHistoryContainer = document.getElementById('balanceHistory');
        
        balanceHistoryContainer.innerHTML = balanceHistory.map(entry => `
            <div class="balance-history-item">
                <div class="history-info">
                    <div class="history-date">${formatDate(entry.date)}</div>
                    <div class="history-description">${entry.description}</div>
                </div>
                <div class="history-amount ${entry.amount > 0 ? 'positive' : 'negative'}">
                    ${entry.amount > 0 ? '+' : ''}${entry.amount}ff (${Math.round(Math.abs(entry.amount) / 8)} day${Math.round(Math.abs(entry.amount) / 8) !== 1 ? 's' : ''})
                </div>
            </div>
        `).join('');
    }

    function filterRequests() {
        renderAllRequests();
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

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
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }

    // Global function to switch sections (called from HTML)
    window.switchToSection = switchToSection;
    window.resetForm = resetForm;
    window.previewRequest = previewRequest;

    // Add some nice animations on load
    setTimeout(() => {
        const cards = document.querySelectorAll('.request-card, .card');
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
