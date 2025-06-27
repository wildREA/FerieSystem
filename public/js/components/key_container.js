// Discord-style Key Container Component JavaScript
class KeyContainer {
    constructor() {
        this.keyContainer = document.querySelector('.key-container');
        this.keyDisplay = document.querySelector('.key-display');
        this.keyStatus = document.getElementById('key_status');
        this.visibilityBtn = document.getElementById('visibility');
        this.generateBtn = document.getElementById('generate_key');
        this.visibilityIcon = this.visibilityBtn.querySelector('i');
        this.isVisible = false;
        this.currentKey = '';
        
        this.init();
    }
    
    init() {
        // Bind event listeners
        this.visibilityBtn.addEventListener('click', () => this.toggleVisibility());
        this.generateBtn.addEventListener('click', () => this.generateNewKey());
        this.keyStatus.addEventListener('click', () => this.copyToClipboard());

        // Initial state
        // WAIT A BIT WITH BLUR, FINISH API FIRST - this.keyStatus.style.filter = 'blur(4px)'; // Start with blurred text
        this.visibilityIcon.className = 'bi bi-eye-slash-fill'; // Start with eye-slash icon
        this.visibilityIcon.style.color = 'red'; // Set initial color to red
        this.visibilityBtn.title = 'Show'; // Set initial tooltip
        
        // Load existing key on initialization
        this.loadExistingKey();
    }

    toggleVisibility() {
        if (!this.isVisible) {
            this.showKey();
        } else {
            this.isVisible = false;
            console.log("Invisible state: " + this.isVisible);
            this.hideKey();
        }
    }

    showKey() {
        if (!this.currentKey) {
            this.keyStatus.textContent = 'No key generated';
            return;
        }

        // Remove blur from the keyStatus text
        this.keyStatus.style.filter = 'none';
        
        // Show the key in the keyStatus text
        this.isVisible = true;
        console.log("Visible state: " + this.isVisible);
        this.visibilityIcon.className = 'bi bi-eye';
        this.visibilityIcon.style.color = 'white';
        this.visibilityBtn.title = 'Hide';
    }

    hideKey() {
        // Blur the keyStatus text
        // this.keyStatus.style.filter = 'blur(4px)';

        // Update visibility state
        this.isVisible = false;
        this.visibilityIcon.className = 'bi bi-eye-slash-fill';
        this.visibilityIcon.style.color = 'red';
        this.visibilityBtn.title = 'Show';
    }

    async loadExistingKey() {
        try {
            const response = await fetch('/api/get-key', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success && data.key) {
                this.currentKey = data.key;
                this.keyStatus.textContent = data.key;
            } else {
                this.currentKey = '';
                this.keyStatus.textContent = 'No key generated';
            }
        } catch (error) {
            console.error('Error loading existing key:', error);
            this.currentKey = '';
            this.keyStatus.textContent = 'No key generated';
        }
    }

    async generateNewKey() {
        try {
            // Show loading state
            this.keyStatus.textContent = 'Generating...';
            this.generateBtn.disabled = true;

            const response = await fetch('/api/generate-key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                this.currentKey = data.key;
                this.keyStatus.textContent = data.key;
                this.showToast('New registration key generated successfully!', 'success');
            } else {
                throw new Error(data.error || 'Failed to generate key');
            }
        } catch (error) {
            console.error('Error generating key:', error);
            this.keyStatus.textContent = 'Error generating key';
            this.showToast('Failed to generate registration key', 'error');
        } finally {
            // Re-enable the button
            this.generateBtn.disabled = false;
        }
    }

    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            border-radius: 4px;
            z-index: 1000;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

     async copyToClipboard() {
        if (!this.currentKey) return;
        
        try {
            await navigator.clipboard.writeText(this.currentKey);
            this.showToast('Registration key copied to clipboard!', 'success');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = this.currentKey;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Registration key copied to clipboard!', 'success');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KeyContainer();
});
