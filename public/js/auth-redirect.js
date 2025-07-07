/**
 * Authentication redirect logic for the auth page
 * Checks if user is already authenticated and redirects accordingly
 * 
 * Following software craftsmanship practices:
 * - Single responsibility principle
 * - Clear function naming
 * - Error handling
 * - Separation of concerns
 * - Loading states for better UX
 */

class AuthRedirectManager {
    constructor() {
        this.isChecking = false;
        this.loadingElement = null;
        this.init();
    }

    /**
     * Initialize the authentication check
     */
    init() {
        // Only run on the auth page to avoid unnecessary API calls
        if (this.isAuthPage()) {
            this.createLoadingIndicator();
            this.checkAuthenticationStatus();
        }
    }

    /**
     * Check if we're currently on the auth page
     * @returns {boolean} True if on auth page
     */
    isAuthPage() {
        return window.location.pathname === '/auth' || 
               window.location.pathname.endsWith('/auth');
    }

    /**
     * Create a subtle loading indicator during auth check
     */
    createLoadingIndicator() {
        // Only show loading if check takes longer than 200ms
        setTimeout(() => {
            if (this.isChecking) {
                this.showLoadingState();
            }
        }, 200);
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm && !this.loadingElement) {
            this.loadingElement = document.createElement('div');
            this.loadingElement.className = 'auth-check-loading';
            this.loadingElement.innerHTML = '<div style="text-align: center; padding: 10px; opacity: 0.7;">' + __('checking_auth_status') + '</div>';
            loginForm.style.opacity = '0.6';
            loginForm.parentNode.insertBefore(this.loadingElement, loginForm);
        }
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        if (this.loadingElement) {
            this.loadingElement.remove();
            this.loadingElement = null;
        }
        
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.style.opacity = '1';
        }
    }

    /**
     * Check user's authentication status and redirect if needed
     */
    async checkAuthenticationStatus() {
        // Prevent multiple simultaneous checks
        if (this.isChecking) {
            return;
        }

        this.isChecking = true;

        try {
            const response = await this.makeAuthCheckRequest();
            
            if (response.authenticated) {
                this.handleAuthenticatedUser(response.userType);
            } else {
                // Not authenticated, hide loading and show login form
                this.hideLoadingState();
            }
        } catch (error) {
            console.warn('Auth check failed:', error.message);
            // If auth check fails, hide loading and show login form (fail safe)
            this.hideLoadingState();
        } finally {
            this.isChecking = false;
        }
    }

    /**
     * Make the authentication check API request
     * @returns {Promise<Object>} Authentication status response
     */
    async makeAuthCheckRequest() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        try {
            const response = await fetch('/api/auth-status', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Authentication check timed out');
            }
            
            throw error;
        }
    }

    /**
     * Handle authenticated user by redirecting to appropriate dashboard
     * @param {string} userType - The type of user ('standard' or 'super')
     */
    handleAuthenticatedUser(userType) {
        const redirectUrl = this.getRedirectUrl(userType);
        
        if (redirectUrl) {
            // Show redirect message briefly before redirecting
            this.showRedirectMessage(userType, redirectUrl);
            
            // Use replace() instead of assign() to prevent back button issues
            setTimeout(() => {
                window.location.replace(redirectUrl);
            }, 1000);
        } else {
            console.warn(`Unknown user type: ${userType}. Staying on auth page.`);
            this.hideLoadingState();
        }
    }

    /**
     * Show redirect message to user
     * @param {string} userType - The user type
     * @param {string} redirectUrl - The redirect URL
     */
    showRedirectMessage(userType) {
        const container = document.querySelector('.login-form .container .content');
        if (container) {
            const message = document.createElement('div');
            message.className = 'alert alert-success';
            message.style.cssText = 'background-color: #dff0d8; border: 1px solid #d6e9c6; color: #3c763d; padding: 15px; border-radius: 4px; margin-bottom: 20px; text-align: center;';
            
            const dashboardName = userType === 'super' ? 'admin dashboard' : 'dashboard';
            message.innerHTML = `Already logged in! Redirecting to ${dashboardName}...`;
            
            container.insertBefore(message, container.firstChild);
        }
    }

    /**
     * Get the appropriate redirect URL based on user type
     * @param {string} userType - The type of user
     * @returns {string|null} The redirect URL or null if unknown user type
     */
    getRedirectUrl(userType) {
        const redirectMap = {
            'standard': '/dashboard',
            'super': '/students'
        };

        return redirectMap[userType] || null;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AuthRedirectManager();
});
