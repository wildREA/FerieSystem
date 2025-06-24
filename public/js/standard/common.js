// Common data and utilities shared across all pages
// Student data (this would typically come from an API)
const studentData = {
    id: "STU001",
    name: "Emma Nielsen",
    email: "emma.nielsen@student.dk",
    course: "Computer Science",
    year: 3,
    totalVacationHours: 200 // 25 days * 8 hours = 200 hours total
};

// Mock requests data with simplified, realistic hours
const requestsData = [
    {
        id: "REQ001",
        startDate: "2025-06-15T09:00:00",
        endDate: "2025-06-20T17:00:00",
        reason: "Family vacation",
        status: "pending",
        submitDate: "2025-06-10T10:15:00",
        hours: 40, // 5 days * 8 hours
        isShortNotice: false
    },
    {
        id: "REQ002",
        startDate: "2025-05-20T09:00:00",
        endDate: "2025-05-23T17:00:00",
        reason: "Medical appointment",
        status: "approved",
        submitDate: "2025-05-15T14:20:00",
        hours: 32 // 4 days * 8 hours
    },
    {
        id: "REQ003",
        startDate: "2025-03-10T09:00:00",
        endDate: "2025-03-14T17:00:00",
        reason: "Spring break",
        status: "approved",
        submitDate: "2025-03-01T09:45:00",
        hours: 40 // 5 days * 8 hours
    },
    {
        id: "REQ004",
        startDate: "2025-07-01T09:00:00",
        endDate: "2025-07-08T17:00:00",
        reason: "Summer break",
        status: "denied",
        submitDate: "2025-06-05T09:45:00",
        hours: 56, // 7 days * 8 hours
        denyReason: "Overlaps with mandatory courses"
    },
];

// Balance history data - only shows actual deductions/allocations
const balanceHistory = [
    {
        date: "2025-05-23",
        description: "Vacation Request Approved - Medical appointment",
        amount: -24,
        type: "deduction"
    },
    {
        date: "2025-04-17",
        description: "Vacation Request Approved - Personal leave",
        amount: -16,
        type: "deduction"
    },
    {
        date: "2025-01-01",
        description: "Annual Allocation",
        amount: 200,
        type: "allocation"
    }
];

// Data management object to handle request operations
const DataManager = {
    init() {
        // Initialize any data management setup if needed
        // This would be where you'd set up API connections in a real app
    },

    async addRequest(newRequest) {
        try {
            // Prepare data for API call (match what the backend expects)
            const requestData = {
                requestType: 'vacation', // Default to vacation for now
                startDate: newRequest.startDate.split('T')[0], // Extract just the date part
                endDate: newRequest.endDate.split('T')[0],     // Extract just the date part  
                reason: newRequest.reason
            };

            // Make API call to submit request
            const response = await fetch('/api/submit-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Add the request to local data with the server response
                const serverRequest = {
                    ...newRequest,
                    id: result.data.id, // Use server-generated ID
                    status: result.data.status || 'pending'
                };
                requestsData.push(serverRequest);
                
                // Update request badges and other UI elements
                StudentUtils.updateRequestsBadge();
                
                return { success: true, data: result.data };
            } else {
                throw new Error(result.error || 'Failed to submit request');
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            throw error;
        }
    },

    updateRequest(requestId, updatedData) {
        // Find and update an existing request
        const requestIndex = requestsData.findIndex(r => r.id === requestId);
        if (requestIndex !== -1) {
            requestsData[requestIndex] = { ...requestsData[requestIndex], ...updatedData };
        }
    },

    getRequest(requestId) {
        // Get a specific request by ID
        return requestsData.find(r => r.id === requestId);
    }
};

// Common utility functions
const StudentUtils = {
    // Calculate accurate vacation hours based on requests (simplified)
    calculateVacationHours() {
        // Only count approved requests as "used" - pending and denied don't count
        const approvedRequests = requestsData.filter(r => r.status === 'approved');
        const pendingRequests = requestsData.filter(r => r.status === 'pending');
        
        // Sum up hours from approved requests (actually used)
        const usedHours = approvedRequests.reduce((sum, r) => sum + r.hours, 0);
        
        // Sum up hours from pending requests (not yet used, but reserved)
        const pendingHours = pendingRequests.reduce((sum, r) => sum + r.hours, 0);
        
        // Calculate remaining hours (total - used)
        const remainingHours = studentData.totalVacationHours - usedHours;
        
        return {
            totalHours: studentData.totalVacationHours,     // 200 hours (25 days)
            usedHours: usedHours,                           // Currently: 72 hours (32 + 40 approved)
            pendingHours: pendingHours,                     // Currently: 40 hours (1 pending request)
            remainingHours: remainingHours                  // Currently: 128 hours (200 - 72)
        };
    },

    // Update student name in header and sidebar
    updateStudentInfo() {
        const studentNameEl = document.getElementById('studentName');
        const headerUserNameEl = document.getElementById('headerUserName');
        
        if (studentNameEl) {
            studentNameEl.textContent = studentData.name;
        }
        if (headerUserNameEl) {
            headerUserNameEl.textContent = studentData.name.toUpperCase();
        }

        // Update requests badge
        this.updateRequestsBadge();
    },

    // Update requests badge count
    updateRequestsBadge() {
        const requestsBadge = document.getElementById('requestsBadge');
        if (requestsBadge) {
            const pendingCount = requestsData.filter(r => r.status === 'pending').length;
            requestsBadge.textContent = pendingCount;
            requestsBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
        }
    },

    // Setup navigation links
    setupNavigation() {
        const navSections = document.querySelectorAll('.nav-section');
        navSections.forEach(section => {
            section.addEventListener('click', function() {
                const sectionText = this.querySelector('span').textContent;
                const targetPage = StudentUtils.getPageUrl(sectionText);
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                
                if (targetPage && targetPage !== currentPage) {
                    window.location.href = targetPage;
                }
            });
        });

        // Add logo click to go to dashboard
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.addEventListener('click', function() {
                window.location.href = '/dashboard';
            });
        }
    },

    // Map section names to page URLs
    getPageUrl(sectionText) {
        const pageMap = {
            'Dashboard': 'index.php?route=/dashboard',
            'New Request': 'index.php?route=/new-request',
            'My Requests': 'index.php?route=/requests'
        };
        return pageMap[sectionText];
    },

    // Format date string
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Show notification
    showNotification(message, type = 'info') {
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
    },

    // Calculate working hours between dates (precise calculation)
    calculateWorkingHours(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Working hours: 8:00 AM to 5:00 PM (9 hours per day)
        const workingStartHour = 8;
        const workingEndHour = 17;
        const maxDailyHours = workingEndHour - workingStartHour; // 9 hours
        
        let totalWorkingHours = 0;
        const current = new Date(start);
        
        while (current < end) {
            const dayOfWeek = current.getDay();
            
            // Skip weekends (Saturday = 6, Sunday = 0)
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                let dayStart, dayEnd;
                
                // Determine start time for this day
                if (current.toDateString() === start.toDateString()) {
                    // First day - use actual start time, but not before working hours
                    const startHour = Math.max(start.getHours(), workingStartHour);
                    const startMinute = start.getHours() >= workingStartHour ? start.getMinutes() : 0;
                    dayStart = startHour + (startMinute / 60);
                } else {
                    // Other days - start at beginning of working hours
                    dayStart = workingStartHour;
                }
                
                // Determine end time for this day
                if (current.toDateString() === end.toDateString()) {
                    // Last day - use actual end time, but not after working hours
                    const endHour = Math.min(end.getHours(), workingEndHour);
                    const endMinute = end.getHours() <= workingEndHour ? end.getMinutes() : 0;
                    dayEnd = endHour + (endMinute / 60);
                } else {
                    // Other days - end at end of working hours
                    dayEnd = workingEndHour;
                }
                
                // Calculate hours for this day (ensure positive)
                const dailyHours = Math.max(0, dayEnd - dayStart);
                totalWorkingHours += dailyHours;
            }
            
            // Move to next day
            current.setDate(current.getDate() + 1);
            current.setHours(0, 0, 0, 0); // Reset time to midnight
        }
        
        // Round to 1 decimal place for clean display
        totalWorkingHours = Math.round(totalWorkingHours * 10) / 10;
        
        return { 
            workingHours: Math.max(0.1, totalWorkingHours) // Minimum 0.1 hours (6 minutes)
        };
    },

    // Check if date is a holiday
    isHoliday(date) {
        // Simplified holiday check - you can expand this with a proper holiday API or list
        const holidays = [
            '2025-01-01', // New Year's Day
            '2025-12-25', // Christmas
            '2025-12-24', // Christmas Eve
            // Add more holidays as needed
        ];
        
        const dateString = date.toISOString().split('T')[0];
        return holidays.includes(dateString);
    },

    // Add entrance animations
    addEntranceAnimations() {
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
    }
};

// Common initialization for all pages
document.addEventListener("DOMContentLoaded", function() {
    // Initialize data first
    DataManager.init();
    
    StudentUtils.updateStudentInfo();
    StudentUtils.setupNavigation();
    StudentUtils.addEntranceAnimations();
});
