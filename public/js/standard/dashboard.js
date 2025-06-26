// Dashboard page specific functionality

// Student data and utility functions for dashboard
const studentData = {
    id: "STU001",
    name: "Emma Nielsen",
    email: "emma.nielsen@student.dk",
    course: "Computer Science",
    year: 3,
    totalVacationHours: 200
};

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

// Utility functions for dashboard
const StudentUtils = {
    calculateVacationHours() {
        const approvedRequests = requestsData.filter(r => r.status === 'approved');
        const pendingRequests = requestsData.filter(r => r.status === 'pending');
        
        const usedHours = approvedRequests.reduce((sum, r) => sum + r.hours, 0);
        const pendingHours = pendingRequests.reduce((sum, r) => sum + r.hours, 0);
        const remainingHours = studentData.totalVacationHours - usedHours;
        
        return {
            totalHours: studentData.totalVacationHours,
            usedHours: usedHours,
            pendingHours: pendingHours,
            remainingHours: remainingHours
        };
    },

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
    
    // Initialize dashboard
    init();

    function init() {
        updateDashboardStats();
        renderRecentRequests();
        updateProgressBars();
        setupBalanceModal();
        updateStatCardBorderColor();
        StudentUtils.updateRequestsBadge();
    }

    function setupBalanceModal() {
        // Update modal when it's shown
        const balanceModal = document.getElementById('balanceModal');
        if (balanceModal) {
            balanceModal.addEventListener('show.bs.modal', function() {
                renderModalBalanceHistory();
            });
        }
    }

    function renderModalBalanceHistory() {
        // DISABLED: Balance history is now hardcoded in HTML
        // const modalBalanceHistoryContainer = document.getElementById('modalBalanceHistory');
        
        // if (modalBalanceHistoryContainer) {
        //     modalBalanceHistoryContainer.innerHTML = balanceHistory.map(entry => `
        //         <div class="balance-history-item">
        //             <div class="history-info">
        //                 <div class="history-date">${StudentUtils.formatDate(entry.date)}</div>
        //                 <div class="history-description">${entry.description}</div>
        //             </div>
        //             <div class="history-amount ${entry.amount > 0 ? 'positive' : 'negative'}">
        //                 ${entry.amount > 0 ? '+' : ''}${entry.amount}ff (${Math.round(Math.abs(entry.amount) / 8)} day${Math.round(Math.abs(entry.amount) / 8) !== 1 ? 's' : ''})
        //             </div>
        //         </div>
        //     `).join('');
        // }
    }

    function updateDashboardStats() {
        // DISABLED: Values are now hardcoded in HTML
        // Get accurate vacation hour calculations
        // const vacationHours = StudentUtils.calculateVacationHours();
        
        // Helper function to safely update element
        // function safeUpdate(id, value) {
        //     const element = document.getElementById(id);
        //     if (element) {
        //         element.textContent = value;
        //     }
        // }

        // safeUpdate('totalBalance', `${vacationHours.totalHours}ff`);
        // safeUpdate('pendingRequests', `${vacationHours.pendingHours}ff`);
        // safeUpdate('remainingDays', `${vacationHours.remainingHours}ff`);
        // safeUpdate('requestsBadge', requestsData.filter(r => r.status === 'pending').length);
    }

    function updateProgressBars() {
        // DISABLED: Progress bars and values are now hardcoded in HTML
        // Get accurate vacation hour calculations
        // const vacationHours = StudentUtils.calculateVacationHours();
        // const totalHours = vacationHours.totalHours;
        // const usedPercent = (vacationHours.usedHours / totalHours) * 100;
        // const pendingPercent = (vacationHours.pendingHours / totalHours) * 100;

        // const usedBar = document.getElementById('usedProgressBar');
        // const pendingBar = document.getElementById('pendingProgressBar');

        // if (usedBar) {
        //     usedBar.style.width = usedPercent + '%';
        //     usedBar.textContent = `Used: ${vacationHours.usedHours}ff`;
        // }
        
        // if (pendingBar) {
        //     pendingBar.style.width = pendingPercent + '%';
        //     pendingBar.textContent = `Pending: ${vacationHours.pendingHours}ff`;
        // }
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
                        ${StudentUtils.formatDate(request.startDate)} - ${StudentUtils.formatDate(request.endDate)}
                    </div>
                    <div class="recent-request-reason">${request.reason}</div>
                </div>
                <div class="status-badge status-${request.status}">${request.status}</div>
            </div>
        `).join('');
    }

    function updateStatCardBorderColor() {
        const balanceCard = document.getElementById('balanceCard');
        const valueElement = balanceCard?.querySelector('.value');
        
        if (valueElement) {
            const valueText = valueElement.textContent;
            // Extract numeric value from text like "128 timer 30 minutter"
            const numericMatch = valueText.match(/^(-?\d+)/);
            
            if (numericMatch) {
                const numericValue = parseInt(numericMatch[1]);
                
                // Remove existing color classes
                balanceCard.classList.remove('blue', 'green', 'red');
                
                // Add appropriate color class based on value
                if (numericValue > 0) {
                    balanceCard.classList.add('green');
                } else if (numericValue < 0) {
                    balanceCard.classList.add('red');
                } else {
                    balanceCard.classList.add('blue');
                }
            }
        }
    }
});
