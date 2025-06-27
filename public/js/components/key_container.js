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
        
        this.init();
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
        if (!this.currentKey) return;
        
        try {
            await navigator.clipboard.writeText(this.currentKey);
        } catch (err) {
            // Fallback for older browsers
            this.fallbackCopyToClipboard(this.currentKey);
        }
    }

    /**
     * Fallback method for copying to clipboard in older browsers
     */
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KeyContainer();
});
