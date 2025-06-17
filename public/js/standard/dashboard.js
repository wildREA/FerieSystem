// Dashboard page specific functionality
document.addEventListener("DOMContentLoaded", function() {
    
    // Initialize dashboard
    init();

    function init() {
        updateDashboardStats();
        renderRecentRequests();
        updateProgressBars();
        setupBalanceModal();
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
});
