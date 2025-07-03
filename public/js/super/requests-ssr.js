function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        console.log('Copied to clipboard: ' + text);
        if (typeof window.showNotification === 'function') {
            window.showNotification('Copied to clipboard', 'success');
        }
    }).catch(function(err) {
        console.error('Could not copy text: ', err);
        if (typeof window.showNotification === 'function') {
            window.showNotification('Failed to copy to clipboard', 'danger');
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    const currentPageElement = document.getElementById('currentPage');
    
    if (currentPageElement && currentPageElement.value === 'requests') {
        initRequestsPage();
    }
    
    function initRequestsPage() {
        setupToggleButtons();
        setupSearch();
        
        const searchQuery = localStorage.getItem('searchQuery');
        if (searchQuery) {
            const searchInput = document.getElementById('studentSearch');
            if (searchInput) {
                searchInput.value = searchQuery;
                handleSearch({ target: searchInput });
                localStorage.removeItem('searchQuery');
            }
        }
    }
    
    function setupToggleButtons() {
        const activeRequestsBtn = document.getElementById("activeRequestsBtn");
        const inactiveRequestsBtn = document.getElementById("inactiveRequestsBtn");
        const approvedRequestsGrid = document.getElementById("approvedRequestsGrid");
        const completedRequestsGrid = document.getElementById("completedRequestsGrid");
        const noApprovedResults = document.getElementById("noApprovedResults");
        
        if (!activeRequestsBtn || !inactiveRequestsBtn) return;
        
        activeRequestsBtn.addEventListener('click', function() {
            activeRequestsBtn.classList.add("btn-primary", "active");
            activeRequestsBtn.classList.remove("btn-outline-primary");
            inactiveRequestsBtn.classList.add("btn-outline-primary");
            inactiveRequestsBtn.classList.remove("btn-primary", "active");
            
            if (approvedRequestsGrid) {
                approvedRequestsGrid.style.display = 'grid';
            }
            if (completedRequestsGrid) {
                completedRequestsGrid.style.display = 'none';
            }
            
            const hasActiveRequests = approvedRequestsGrid && approvedRequestsGrid.children.length > 0;
            if (noApprovedResults) {
                noApprovedResults.style.display = hasActiveRequests ? 'none' : 'block';
            }
        });
        
        inactiveRequestsBtn.addEventListener('click', function() {
            inactiveRequestsBtn.classList.add("btn-primary", "active");
            inactiveRequestsBtn.classList.remove("btn-outline-primary");
            activeRequestsBtn.classList.add("btn-outline-primary");
            activeRequestsBtn.classList.remove("btn-primary", "active");
            
            if (approvedRequestsGrid) {
                approvedRequestsGrid.style.display = 'none';
            }
            if (completedRequestsGrid) {
                completedRequestsGrid.style.display = 'grid';
            }
            
            const hasCompletedRequests = completedRequestsGrid && completedRequestsGrid.children.length > 0;
            if (noApprovedResults) {
                noApprovedResults.style.display = hasCompletedRequests ? 'none' : 'block';
            }
        });
    }
    
    function setupSearch() {
        const searchInput = document.getElementById('studentSearch');
        const searchResults = document.getElementById('searchResults');
        
        if (!searchInput) return;
        
        let searchTimeout;
        
        if (!document.getElementById('searchLoading')) {
            const loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'searchLoading';
            loadingIndicator.className = 'search-loading';
            loadingIndicator.innerHTML = '<i class="bi bi-search"></i>';
            searchInput.parentNode.style.position = 'relative';
            searchInput.parentNode.appendChild(loadingIndicator);
        }
        
        searchInput.addEventListener('input', function(event) {
            clearTimeout(searchTimeout);
            
            const loadingIndicator = document.getElementById('searchLoading');
            if (loadingIndicator) {
                loadingIndicator.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i>';
                loadingIndicator.style.opacity = '1';
            }
            
            searchTimeout = setTimeout(() => {
                handleSearch(event);
                
                setTimeout(() => {
                    if (loadingIndicator) {
                        loadingIndicator.innerHTML = '<i class="bi bi-search"></i>';
                        loadingIndicator.style.opacity = '0.5';
                    }
                }, 200);
            }, 300);
        });
        
        searchInput.addEventListener('focus', showSearchResults);
        searchInput.addEventListener('blur', hideSearchResults);
        
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                hideSearchResults();
            }
        });
    }
    
    function handleSearch(event) {
        const query = event.target.value.toLowerCase().trim();
        const studentsGrid = document.getElementById('studentsGrid');
        const noResults = document.getElementById('noResults');
        const searchResults = document.getElementById('searchResults');
        
        if (!studentsGrid) return;
        
        const requestCards = studentsGrid.querySelectorAll('.request-card, .student-card');
        let visibleCount = 0;
        let matchingCards = [];
        
        requestCards.forEach(card => {
            const studentName = card.querySelector('.student-info h4')?.textContent.toLowerCase() || '';
            const status = card.querySelector('.status-badge, .request-status-badge')?.textContent.toLowerCase() || '';
            const reason = card.querySelector('.detail-value')?.textContent.toLowerCase() || '';
            
            const matches = query === '' || 
                           studentName.includes(query) || 
                           status.includes(query) || 
                           reason.includes(query);
            
            if (matches) {
                card.style.display = 'block';
                visibleCount++;
                matchingCards.push({
                    name: card.querySelector('.student-info h4')?.textContent || '',
                    status: card.querySelector('.status-badge, .request-status-badge')?.textContent || '',
                    element: card
                });
            } else {
                card.style.display = 'none';
            }
        });
        
        if (noResults) {
            noResults.style.display = visibleCount === 0 && query !== '' ? 'block' : 'none';
        }
        
        if (query && searchResults) {
            showSearchSuggestions(matchingCards.slice(0, 5), query);
        } else if (searchResults) {
            searchResults.style.display = 'none';
        }
    }
    
    function showSearchSuggestions(matches, query) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;
        
        if (matches.length === 0) {
            searchResults.style.display = 'none';
            return;
        }
        
        const suggestions = matches.map((match, index) => `
            <div class="search-result-item" onclick="selectSearchResult('${match.name}')">
                <div class="search-result-name">${highlightText(match.name, query)}</div>
                <div class="search-result-status">${match.status}</div>
            </div>
        `).join('');
        
        searchResults.innerHTML = suggestions;
        searchResults.style.display = 'block';
    }
    
    function highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    function showSearchResults() {
        const searchResults = document.getElementById('searchResults');
        const searchInput = document.getElementById('studentSearch');
        
        if (searchResults && searchInput && searchInput.value.trim()) {
            searchResults.style.display = 'block';
        }
    }
    
    function hideSearchResults() {
        setTimeout(() => {
            const searchResults = document.getElementById('searchResults');
            if (searchResults) {
                searchResults.style.display = 'none';
            }
        }, 150);
    }
    
    window.selectSearchResult = function(studentName) {
        const studentsGrid = document.getElementById('studentsGrid');
        if (!studentsGrid) return;
        
        const allCards = studentsGrid.querySelectorAll('.request-card, .student-card');
        let targetCard = null;
        
        allCards.forEach(card => {
            const cardName = card.querySelector('.student-info h4')?.textContent || '';
            if (cardName === studentName) {
                targetCard = card;
            }
        });
        
        if (targetCard) {
            allCards.forEach(card => card.style.display = 'none');
            
            targetCard.style.display = 'block';
            
            const searchInput = document.getElementById('studentSearch');
            if (searchInput) {
                searchInput.value = studentName;
            }
            
            hideSearchResults();
            
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };
    
    window.viewDetails = function(requestId) {
        console.log('Viewing details for request:', requestId);
        console.log('Looking for selector:', `[data-request-id="${requestId}"]`);
        
        const requestCard = document.querySelector(`[data-request-id="${requestId}"]`);
        console.log('Found request card:', requestCard);
        
        if (!requestCard) {
            const alternativeCard = document.querySelector(`[data-student-id="${requestId}"]`);
            console.log('Alternative card found:', alternativeCard);
            
            if (alternativeCard) {
                handleRequestCard(alternativeCard, requestId);
                return;
            }
            
            window.showNotification('Request not found', 'danger');
            console.error('No request card found for ID:', requestId);
            return;
        }
        
        handleRequestCard(requestCard, requestId);
    };
    
    function handleRequestCard(requestCard, requestId) {
        const studentName = requestCard.querySelector('.student-info h4')?.textContent || 'N/A';
        
        let status = 'N/A';
        const statusElement = requestCard.querySelector('.status-badge, .request-status-badge');
        if (statusElement) {
            status = statusElement.textContent.trim();
        }
        
        if (status === 'N/A') {
            if (requestCard.closest('#studentsGrid')) {
                status = 'Pending';
            } 
            else if (requestCard.closest('#approvedRequestsGrid')) {
                status = 'Active';
            }
            else if (requestCard.closest('#completedRequestsGrid')) {
                status = 'Completed';
            }
        }
        
        const reason = requestCard.querySelector('.detail-value')?.textContent || 'N/A';
        
        const userId = requestCard.getAttribute('data-user-id') || 
                       requestCard.querySelector('.student-id')?.textContent ||
                       requestCard.getAttribute('data-request-id');
        
        const dateBlocks = requestCard.querySelectorAll('.date-block');
        let startDate = 'N/A', endDate = 'N/A', days = 'N/A';
        
        if (dateBlocks.length > 0) {
            dateBlocks.forEach(block => {
                const label = block.querySelector('.date-label')?.textContent;
                const value = block.querySelector('.date-value')?.textContent;
                
                if (label === 'Start Date') startDate = value;
                if (label === 'End Date') endDate = value;
                if (label === 'Days') days = value;
            });
        } else {
            const detailRows = requestCard.querySelectorAll('.detail-row');
            detailRows.forEach(row => {
                const label = row.querySelector('.detail-label')?.textContent;
                const value = row.querySelector('.detail-value')?.textContent;
                
                if (label === 'Start Date:' || label?.includes('Start')) startDate = value;
                if (label === 'End Date:' || label?.includes('End')) endDate = value;
                if (label === 'Requested:' || label?.includes('Requested')) days = value;
            });
            
            if (reason === 'N/A') {
                const reasonElement = requestCard.querySelector('.student-details .detail-value');
                if (reasonElement) reason = reasonElement.textContent;
            }
        }
        
        const numDays = parseInt(days) || 0;
        const ffCost = numDays * 8;
        
        let timePeriod = 'N/A';
        let startTime = '09:00', endTime = '17:00';
        
        if (startDate !== 'N/A' && endDate !== 'N/A') {
            try {
                const start = new Date(startDate);
                const end = new Date(endDate);
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                timePeriod = `${diffDays} calendar days`;
                
                startTime = '09:00 AM';
                endTime = '17:00 PM';
            } catch (e) {
                timePeriod = 'Unable to calculate';
            }
        }
        
        let requestSubmitted = 'N/A';
        const daysRemainingText = requestCard.querySelector('.days-remaining')?.textContent;
        if (daysRemainingText && daysRemainingText.includes('days ago')) {
            const daysAgo = daysRemainingText.match(/(\d+) days ago/);
            if (daysAgo) {
                const submissionDate = new Date();
                submissionDate.setDate(submissionDate.getDate() - parseInt(daysAgo[1]));
                submissionDate.setHours(Math.floor(Math.random() * 8) + 9);
                submissionDate.setMinutes(Math.floor(Math.random() * 60));
                requestSubmitted = submissionDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric'
                }) + ' at ' + submissionDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        }
        
        console.log('Extracted data:', { requestId, studentName, status, reason, startDate, endDate, days: numDays, ffCost, timePeriod, requestSubmitted, startTime, endTime, userId });
        
        createDetailModal({
            requestId,
            studentName,
            status,
            reason,
            startDate,
            endDate,
            days: numDays,
            ffCost,
            timePeriod,
            requestSubmitted,
            startTime,
            endTime,
            userId
        });
    }
    
    function createDetailModal(data) {
        const existingModal = document.getElementById('requestDetailModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modalHTML = createModalHTML(data, { loading: true });
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = new bootstrap.Modal(document.getElementById('requestDetailModal'));
        modal.show();
        
        if (data.userId) {
            fetchUserAbsoluteBalance(data.userId).then(balanceData => {
                updateModalWithBalance(balanceData);
            }).catch(error => {
                console.error('Error fetching absolute balance:', error);
                updateModalWithBalance({ error: true });
            });
        } else {
            updateModalWithBalance({ error: true });
        }
        
        document.getElementById('requestDetailModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    async function fetchUserAbsoluteBalance(userId) {
        try {
            const response = await fetch(`/api/user-absolute-balance?user_id=${encodeURIComponent(userId)}`);
            const data = await response.json();
            
            if (data.success) {
                return data.balance;
            } else {
                throw new Error(data.error || 'Failed to fetch absolute balance');
            }
        } catch (error) {
            console.error('Absolute balance fetch error:', error);
            throw error;
        }
    }

    async function fetchUserBalance(userId) {
        try {
            const response = await fetch(`/api/user-balance?user_id=${encodeURIComponent(userId)}`);
            const data = await response.json();
            
            if (data.success) {
                return data.balance;
            } else {
                throw new Error(data.error || 'Failed to fetch balance');
            }
        } catch (error) {
            console.error('Balance fetch error:', error);
            throw error;
        }
    }
    
    function updateModalWithBalance(balanceData) {
        const balanceContainer = document.getElementById('modalBalanceContainer');
        if (!balanceContainer) return;
        
        if (balanceData.error) {
            balanceContainer.innerHTML = `
                <div class="text-center py-2">
                    <small class="text-muted">
                        <i class="bi bi-exclamation-triangle me-1"></i>
                        Balance information unavailable
                    </small>
                </div>
            `;
            return;
        }
        
        balanceContainer.innerHTML = `
            <div class="text-center py-3">
                <label class="form-label fw-bold d-block" style="color: #a0a7b5; font-size: 0.9rem;">Available Vacation Hours</label>
                <h3 style="color: #28a745; margin-bottom: 8px;">${balanceData.currentBalance} hours</h3>
            </div>
        `;
    }
    
    function createModalHTML(data, options = {}) {
        const isLoading = options.loading || false;
        
        return `
            <div class="modal fade" id="requestDetailModal" tabindex="-1" aria-labelledby="requestDetailModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content" style="background-color: #1a1f2c; border: 1px solid #2c3142;">
                        <div class="modal-header" style="background-color: #222941; border-bottom: 1px solid #2c3142;">
                            <h5 class="modal-title" style="color: #ffffff;" id="requestDetailModalLabel">
                                <i class="bi bi-calendar-check me-2" style="color: #007bff;"></i>
                                Request Details
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" style="background-color: #1a1f2c; color: #ffffff;">
                            <div class="row">
                                <div class="col-md-6 mb-4">
                                    <div class="card h-100" style="background-color: #222941; border: 1px solid #2c3142;">
                                        <div class="card-header" style="background-color: #302241; border-bottom: 1px solid #2c3142;">
                                            <h6 class="mb-0" style="color: #ffffff;"><i class="bi bi-person-fill me-2"></i>Student Information</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="mb-3">
                                                <label class="form-label fw-bold" style="color: #a0a7b5;">Name:</label>
                                                <p class="mb-0 selectable-text" style="color: #ffffff; cursor: pointer;" onclick="copyToClipboard('${data.studentName}')">
                                                    ${data.studentName}
                                                </p>
                                            </div>
                                            <div class="mb-0">
                                                <label class="form-label fw-bold" style="color: #a0a7b5;">Status:</label>
                                                <p class="mb-0" style="color: #ffffff; font-size: 0.8rem;">
                                                    <span class="${getStatusBadgeBootstrap(data.status)}">${data.status.toUpperCase()}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-6 mb-4">
                                    <div class="card h-100" style="background-color: #222941; border: 1px solid #2c3142;">
                                        <div class="card-header" style="background-color: #302241; border-bottom: 1px solid #2c3142;">
                                            <h6 class="mb-0" style="color: #ffffff;"><i class="bi bi-wallet2 me-2"></i>Vacation Balance</h6>
                                        </div>
                                        <div class="card-body" id="modalBalanceContainer">
                                            ${isLoading ? `
                                                <div class="text-center py-3">
                                                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                                                        <span class="visually-hidden">Loading...</span>
                                                    </div>
                                                    <p class="mb-0 mt-2 text-muted">Loading balance...</p>
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-12 mb-4">
                                    <div class="card" style="background-color: #222941; border: 1px solid #2c3142;">
                                        <div class="card-header" style="background-color: #302241; border-bottom: 1px solid #2c3142;">
                                            <h6 class="mb-0" style="color: #ffffff;"><i class="bi bi-clock-history me-2"></i>Timeline</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="text-center py-2">
                                                <label class="form-label fw-bold d-block" style="color: #a0a7b5;">Submitted</label>
                                                <h6 style="color: #ffffff; margin-bottom: 2px;">${data.requestSubmitted}</h6>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-12 mb-4">
                                    <div class="card" style="background-color: #222941; border: 1px solid #2c3142;">
                                        <div class="card-header" style="background-color: #302241; border-bottom: 1px solid #2c3142;">
                                            <h6 class="mb-0" style="color: #ffffff;"><i class="bi bi-calendar-range-fill me-2"></i>Vacation Period</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="row text-center">
                                                <div class="col-md-4 mb-3 mb-md-0">
                                                    <div class="border-end" style="border-color: #2c3142 !important;">
                                                        <label class="form-label fw-bold d-block" style="color: #a0a7b5;">Start Date & Time</label>
                                                        <h6 style="color: #28a745; margin-bottom: 2px;">${data.startDate}</h6>
                                                        <small style="color: #007bff;">${data.startTime}</small>
                                                    </div>
                                                </div>
                                                <div class="col-md-4 mb-3 mb-md-0">
                                                    <div class="border-end" style="border-color: #2c3142 !important;">
                                                        <label class="form-label fw-bold d-block" style="color: #a0a7b5;">End Date & Time</label>
                                                        <h6 style="color: #dc3545; margin-bottom: 2px;">${data.endDate}</h6>
                                                        <small style="color: #007bff;">${data.endTime}</small>
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <label class="form-label fw-bold d-block" style="color: #a0a7b5;">FF Cost</label>
                                                    <h6 style="color: #ffc107; margin-bottom: 2px;">${data.ffCost} FF</h6>
                                                    <small style="color: #a0a7b5;">(${data.days} × 8 FF/day)</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-12">
                                    <div class="card" style="background-color: #222941; border: 1px solid #2c3142;">
                                        <div class="card-header" style="background-color: #302241; border-bottom: 1px solid #2c3142;">
                                            <h6 class="mb-0" style="color: #ffffff;"><i class="bi bi-chat-square-text-fill me-2"></i>Reason</h6>
                                        </div>
                                        <div class="card-body">
                                            <blockquote class="blockquote mb-0">
                                                <p class="mb-0 fst-italic" style="color: #ffffff; border-left: 3px solid #007bff; padding-left: 15px;">"${data.reason}"</p>
                                            </blockquote>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer" style="background-color: #222941; border-top: 1px solid #2c3142;">
                            <small style="color: #a0a7b5;" class="me-auto">
                                <i class="bi bi-info-circle me-1"></i>
                                Last updated: ${new Date().toLocaleString()}
                            </small>
                            <button type="button" class="btn" style="background-color: #2c3142; border: 1px solid #007bff; color: #ffffff;" data-bs-dismiss="modal">
                                <i class="bi bi-x-lg me-1"></i>Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function getStatusBadgeBootstrap(status) {
        switch (status.toLowerCase()) {
            case 'pending': return 'text-warning bg-transparent';
            case 'approved': return 'text-success bg-transparent';
            case 'active': return 'text-success bg-transparent';
            case 'completed': return 'text-secondary bg-transparent';
            case 'rejected': return 'text-danger bg-transparent';
            case 'denied': return 'text-danger bg-transparent';
            default: return 'text-secondary bg-transparent';
        }
    }
    
    window.approveRequestFromModal = function(requestId) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('requestDetailModal'));
        modal.hide();
        window.approveRequest(requestId);
    };
    
    window.denyRequestFromModal = function(requestId) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('requestDetailModal'));
        modal.hide();
        window.denyRequest(requestId);
    };
    
    window.showNotification = function(message, type = 'info') {
        let notificationContainer = document.getElementById('notificationContainer');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notificationContainer';
            notificationContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
            document.body.appendChild(notificationContainer);
        }

        const notification = document.createElement('div');
        const typeColors = {
            'success': { bg: '#28a745', icon: 'bi-check-circle-fill' },
            'danger': { bg: '#dc3545', icon: 'bi-exclamation-triangle-fill' },
            'info': { bg: '#007bff', icon: 'bi-info-circle-fill' },
            'warning': { bg: '#ffc107', icon: 'bi-exclamation-triangle-fill' }
        };
        
        const config = typeColors[type] || typeColors['info'];
        
        notification.className = 'alert fade show mb-2';
        notification.style.cssText = `
            background: linear-gradient(135deg, ${config.bg}dd, ${config.bg}bb);
            color: white;
            border: 1px solid ${config.bg};
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            backdrop-filter: blur(10px);
            transform: translateX(100%);
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            padding: 12px 16px;
            position: relative;
            overflow: hidden;
        `;
        
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi ${config.icon} me-2" style="font-size: 1.1rem;"></i>
                <span style="flex: 1;">${message}</span>
                <button type="button" class="btn-close btn-close-white ms-2" style="font-size: 0.8rem;" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
            <div style="position: absolute; bottom: 0; left: 0; height: 3px; background: white; width: 100%; animation: progress 3s linear forwards;"></div>
        `;
        
        if (!document.getElementById('notificationStyles')) {
            const style = document.createElement('style');
            style.id = 'notificationStyles';
            style.textContent = `
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `;
            document.head.appendChild(style);
        }
        
        notificationContainer.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 3000);
    };
    
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const activeModal = document.querySelector('.modal.show');
            if (activeModal) {
                const modalInstance = bootstrap.Modal.getInstance(activeModal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
        }
        
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            const searchInput = document.getElementById('studentSearch');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
            const searchInput = document.getElementById('studentSearch');
            if (searchInput && !event.defaultPrevented) {
                event.preventDefault();
                searchInput.focus();
                searchInput.select();
            }
        }
    });
    
    const searchInput = document.getElementById('studentSearch');
    if (searchInput) {
        searchInput.setAttribute('title', 'Search requests (Ctrl+K or Ctrl+F)');
        if (!searchInput.placeholder.includes('Ctrl+K')) {
            searchInput.placeholder += ' (Ctrl+K)';
        }
    }
});

window.approveRequest = function(requestId) {
    Swal.fire({
        title: 'Approve Request',
        text: 'Are you sure you want to approve this vacation request?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="bi bi-check-circle me-1"></i> Yes, approve it!',
        cancelButtonText: '<i class="bi bi-x-circle me-1"></i> Cancel',
        background: '#1a1f2c',
        color: '#ffffff',
        customClass: {
            popup: 'border border-secondary',
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-secondary'
        },
        buttonsStyling: false
    }).then((result) => {
        if (result.isConfirmed) {
            performApproveRequest(requestId);
        }
    });
};

function performApproveRequest(requestId) {
    Swal.fire({
        title: 'Processing...',
        text: 'Approving the request, please wait.',
        icon: 'info',
        allowOutsideClick: false,
        showConfirmButton: false,
        background: '#1a1f2c',
        color: '#ffffff',
        customClass: {
            popup: 'border border-secondary'
        },
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    fetch('/api/approve-request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request_id: requestId })
    })
    .then(response => response.json())
    .then(data => {
        Swal.close();
        if (data.success) {
            window.showNotification(data.message, 'success');
            
            // Refresh notifications
            if (window.notificationManager) {
                window.notificationManager.refresh();
            }
            
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            window.showNotification(data.message || 'Error approving request', 'danger');
        }
    })
    .catch(error => {
        Swal.close();
        console.error('Error:', error);
        window.showNotification('Error approving request', 'danger');
    });
}

window.denyRequest = function(requestId) {
    Swal.fire({
        title: 'Deny Request',
        text: 'Are you sure you want to deny this vacation request?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="bi bi-x-circle me-1"></i> Yes, deny it!',
        cancelButtonText: '<i class="bi bi-arrow-left me-1"></i> Cancel',
        background: '#1a1f2c',
        color: '#ffffff',
        customClass: {
            popup: 'border border-secondary',
            confirmButton: 'btn btn-danger',
            cancelButton: 'btn btn-secondary'
        },
        buttonsStyling: false
    }).then((result) => {
        if (result.isConfirmed) {
            performDenyRequest(requestId);
        }
    });
};

function performDenyRequest(requestId) {
    Swal.fire({
        title: 'Processing...',
        text: 'Denying the request, please wait.',
        icon: 'info',
        allowOutsideClick: false,
        showConfirmButton: false,
        background: '#1a1f2c',
        color: '#ffffff',
        customClass: {
            popup: 'border border-secondary'
        },
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    fetch('/api/deny-request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request_id: requestId })
    })
    .then(response => response.json())
    .then(data => {
        Swal.close();
        if (data.success) {
            window.showNotification(data.message, 'success');
            
            // Refresh notifications
            if (window.notificationManager) {
                window.notificationManager.refresh();
            }
            
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            window.showNotification(data.message || 'Error denying request', 'danger');
        }
    })
    .catch(error => {
        Swal.close();
        console.error('Error:', error);
        window.showNotification('Error denying request', 'danger');
    });
};
