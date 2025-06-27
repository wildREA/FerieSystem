/**
 * Registration Key Container Component
 * Handles the display, generation, and visibility toggling of registration keys
 */
class KeyContainer {
    constructor() {
        this.keyContainer = document.querySelector('.key-container');
        this.keyDisplay = document.querySelector('.key-display');
        this.keyStatus = document.getElementById('key_status');
        this.visibilityBtn = document.getElementById('visibility');
        this.generateBtn = document.getElementById('generate_key');
        this.visibilityIcon = this.visibilityBtn.querySelector('i');
        this.isVisible = false;
        this.currentKey = null;
        this.toastQueue = new Set(); // Track active toasts
        this.maxToasts = 3;
        
        this.init();
        this.initToastContainer();
    }

    /**
     * Initialize toast notification container
     */
    initToastContainer() {
        // Create toast container if it doesn't exist
        if (!document.querySelector('.toast-container')) {
            const toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(toastContainer);
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'success', duration = 3000) {
        // Enforce maximum toast limit
        if (this.toastQueue.size >= this.maxToasts) {
            const oldestToast = this.toastQueue.values().next().value;
            this.removeToast(oldestToast);
        }

        const toastContainer = document.querySelector('.toast-container');
        const toast = document.createElement('div');
        
        // Add to queue tracking
        this.toastQueue.add(toast);
        
        // Toast styling
        const baseStyles = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 24px;
            margin-bottom: 12px;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(16px);
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            min-width: 320px;
            max-width: 400px;
            transform: translateX(100%);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: auto;
            cursor: pointer;
        `;

        // Type-specific styling
        const typeStyles = {
            success: 'background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);',
            error: 'background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);',
            info: 'background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);',
            warning: 'background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);'
        };

        toast.style.cssText = baseStyles + (typeStyles[type] || typeStyles.success);

        // Toast content with icon
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
            warning: '⚠'
        };

        toast.innerHTML = `
            <span style="
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                font-size: 12px;
                font-weight: bold;
            ">${icons[type] || icons.success}</span>
            <span style="flex: 1;">${message}</span>
        `;

        // Add to container
        toastContainer.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });

        // Create removal function
        const removeToastHandler = () => this.removeToast(toast);

        // Remove on click
        toast.addEventListener('click', removeToastHandler);

        // Auto remove after duration
        setTimeout(removeToastHandler, duration);

        return toast;
    }

    /**
     * Remove toast notification with proper cleanup
     */
    removeToast(toast) {
        if (!toast || !this.toastQueue.has(toast)) return;

        // Remove from tracking
        this.toastQueue.delete(toast);

        // Animate out
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';

        // Remove from DOM after animation
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    /**
     * Load existing registration key from the server
     */
    async loadExistingKey() {
        try {
            const response = await fetch('/api/reg-key');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch key: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.key) {
                this.setKey(data.key);
            } else {
                this.setKey(null);
            }
        } catch (error) {
            console.error('Error fetching registration key:', error);
            this.setKey(null);
        }
    }
    /**
     * Initialize component - set up event listeners and load existing key
     */
    init() {
        this.bindEvents();
        this.setInitialState();
        this.loadExistingKey();
    }

    /**
     * Bind event listeners to UI elements
     */
    bindEvents() {
        this.visibilityBtn.addEventListener('click', () => this.toggleVisibility());
        this.generateBtn.addEventListener('click', () => this.generateNewKey());
        this.keyStatus.addEventListener('click', () => this.copyToClipboard());
    }

    /**
     * Set initial UI state
     */
    setInitialState() {
        this.visibilityIcon.className = 'bi bi-eye-slash-fill';
        this.visibilityIcon.style.color = 'red';
        this.visibilityBtn.title = 'Show';
        this.keyStatus.style.filter = 'blur(4px)';
        
        // Set cursor pointer for clickable key status
        this.keyStatus.style.cursor = 'pointer';
        
        // Add hover effect for better UX
        this.keyStatus.addEventListener('mouseenter', () => {
            this.keyStatus.style.opacity = '0.8';
        });
        
        this.keyStatus.addEventListener('mouseleave', () => {
            this.keyStatus.style.opacity = '1';
        });
    }

    /**
     * Set the current key and update the display
     */
    setKey(key) {
        this.currentKey = key;
        this.keyStatus.textContent = key || 'No key generated';
    }

    /**
     * Toggle key visibility
     */
    toggleVisibility() {
        this.isVisible ? this.hideKey() : this.showKey();
    }

    /**
     * Show the registration key
     */
    showKey() {
        if (!this.currentKey) {
            return;
        }

        this.keyStatus.style.filter = 'none';
        this.isVisible = true;
        this.updateVisibilityIcon('bi bi-eye', 'white', 'Hide');
    }

    /**
     * Hide the registration key
     */
    hideKey() {
        this.keyStatus.style.filter = 'blur(4px)';
        this.isVisible = false;
        this.updateVisibilityIcon('bi bi-eye-slash-fill', 'red', 'Show');
    }

    /**
     * Update visibility icon appearance
     */
    updateVisibilityIcon(className, color, title) {
        this.visibilityIcon.className = className;
        this.visibilityIcon.style.color = color;
        this.visibilityBtn.title = title;
    }

    /**
     * Generate a new registration key
     */
    async generateNewKey() {
        try {
            this.setLoadingState(true);
            
            const response = await fetch('/api/reg-key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to generate key: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.success && data.key) {
                this.setKey(data.key);
            } else {
                throw new Error(data.error || 'Failed to generate key');
            }
        } catch (error) {
            console.error('Error generating new key:', error);
            this.keyStatus.textContent = 'Error generating key';
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Set loading state for the generate button
     */
    setLoadingState(isLoading) {
        if (isLoading) {
            this.keyStatus.textContent = 'Generating...';
            this.generateBtn.disabled = true;
        } else {
            this.generateBtn.disabled = false;
        }
    }

    /**
     * Copy the current key to clipboard
     */
    async copyToClipboard() {
        if (!this.currentKey) {
            this.showToast('No key available to copy', 'warning');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(this.currentKey);
            this.showToast('Registration key copied to clipboard', 'success');
        } catch (err) {
            // Fallback for older browsers
            try {
                this.fallbackCopyToClipboard(this.currentKey);
                this.showToast('Registration key copied to clipboard', 'success');
            } catch (fallbackErr) {
                console.error('Failed to copy to clipboard:', fallbackErr);
                this.showToast('Failed to copy key to clipboard', 'error');
            }
        }
    }

    /**
     * Fallback method for copying to clipboard in older browsers
     */
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.cssText = `
            position: fixed;
            top: -9999px;
            left: -9999px;
            opacity: 0;
            pointer-events: none;
        `;
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
            throw new Error('Fallback copy method failed');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KeyContainer();
});
