class NotificationManager {
    constructor() {
        this.refreshInterval = 30000; // 30 seconds
        this.isActive = true;
        this.failureCount = 0;
        this.maxFailures = 3;
        this.init();
    }

    init() {
        this.updateNotifications();
        this.startPeriodicUpdates();
        this.handleVisibilityChange();
    }

    async updateNotifications() {
        console.log('NotificationManager: updateNotifications called on page:', window.location.pathname);
        
        try {
            const response = await fetch('/api/notifications');
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.log('User not authenticated, redirecting to login');
                    window.location.href = '/auth';
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Get response text first to inspect it
            const responseText = await response.text();
            
            // Check if response looks like JSON
            if (!responseText.trim().startsWith('{') && !responseText.trim().startsWith('[')) {
                console.error('Non-JSON response received:', responseText.substring(0, 200));
                
                // If it looks like HTML (redirect page), don't show error to user
                if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                    console.error('Received HTML response, likely a redirect or error page');
                    return;
                }
                
                throw new Error('Invalid response format - expected JSON but got: ' + responseText.substring(0, 100));
            }

            // Try to parse JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                console.error('Response text:', responseText);
                throw new Error('Failed to parse JSON response: ' + parseError.message);
            }
            
            console.log('NotificationManager: Received data:', data);
            
            if (data.success && data.notifications) {
                this.updateBadges(data.notifications);
                this.failureCount = 0; // Reset failure count on success
            } else if (data.error) {
                console.error('API error:', data.error);
                if (data.error.includes('not authenticated')) {
                    window.location.href = '/auth';
                }
            }
        } catch (error) {
            console.error('Failed to update notifications:', error);
            this.failureCount++;
            
            // If we've failed too many times, try to fall back to page-specific logic
            if (this.failureCount >= this.maxFailures) {
                console.warn('Too many notification API failures, falling back to page-specific logic');
                this.handleFallback();
            }
            
            // Only show user-visible error for network issues, not parsing issues
            if (error.message.includes('Failed to fetch')) {
                console.warn('Network error updating notifications - will retry on next interval');
            }
        }
    }

    updateBadges(notifications) {
        const pendingCount = notifications.pendingRequests || 0;
        
        // Update all notification badges
        const badges = document.querySelectorAll('.notification-badge');
        badges.forEach(badge => {
            // Only update if the badge is meant for pending requests
            if (pendingCount > 0) {
                badge.textContent = pendingCount;
                badge.style.display = 'inline-block';
                // Add a small delay to prevent glitchy appearance
                badge.style.opacity = '0';
                setTimeout(() => {
                    badge.style.opacity = '1';
                }, 50);
            } else {
                badge.style.display = 'none';
            }
        });

        // Update specific badge IDs if they exist
        const requestsBadge = document.getElementById('requestsBadge');
        if (requestsBadge) {
            if (pendingCount > 0) {
                requestsBadge.textContent = pendingCount;
                requestsBadge.style.display = 'inline-block';
                requestsBadge.style.opacity = '0';
                setTimeout(() => {
                    requestsBadge.style.opacity = '1';
                }, 50);
            } else {
                requestsBadge.style.display = 'none';
            }
        }

        // Trigger custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('notificationsUpdated', {
            detail: { notifications }
        }));
    }

    startPeriodicUpdates() {
        this.intervalId = setInterval(() => {
            if (this.isActive) {
                this.updateNotifications();
            }
        }, this.refreshInterval);
    }

    handleVisibilityChange() {
        document.addEventListener('visibilitychange', () => {
            this.isActive = !document.hidden;
            
            if (this.isActive) {
                // Update immediately when page becomes visible
                this.updateNotifications();
            }
        });
    }

    destroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    handleFallback() {
        // Try to determine notification count from page content
        try {
            // For standard users, count pending request cards if on requests page
            const pendingCards = document.querySelectorAll('.request-card .status-badge.status-pending, .status-badge:contains("pending")');
            if (pendingCards.length > 0) {
                this.updateBadges({ pendingRequests: pendingCards.length });
                return;
            }
            
            // For super users, try to count from students grid
            const studentsGrid = document.getElementById('studentsGrid');
            if (studentsGrid) {
                const pendingRequests = studentsGrid.querySelectorAll('[data-status="pending"], .status-pending');
                this.updateBadges({ pendingRequests: pendingRequests.length });
                return;
            }
            
            // If we can't determine from page, hide badges
            console.warn('Could not determine notification count from page content');
            this.updateBadges({ pendingRequests: 0 });
        } catch (error) {
            console.error('Fallback handling failed:', error);
            this.updateBadges({ pendingRequests: 0 });
        }
    }

    // Manual refresh method for use after operations that might change notification counts
    refresh() {
        this.updateNotifications();
    }
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    window.notificationManager = new NotificationManager();
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}
