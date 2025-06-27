// Discord-style Key Container Com
class KeyContainer {
    constructor() {
        this.keyContainer = document.querySelector('.key-container');
        this.keyDisplay = document.querySelector('.key-display');
        this.keyStatus = document.getElementById('key_status');  // The key itself
        this.visibilityBtn = document.getElementById('visibility');
        this.generateBtn = document.getElementById('generate_key');
        this.visibilityIcon = this.visibilityBtn.querySelector('i');
        this.isVisible = false;
        this.currentKey = null; // Store the current key
        
        this.init();
        this.loadExistingKey();
    }

    async loadExistingKey() {
        try {
            const response = await fetch('/api/reg-key');
            
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
            console.error('Error fetching registration key:', error);
            this.currentKey = '';
            this.keyStatus.textContent = 'No key generated';
        }
    }
    
    init() {
        // Bind event listeners
        this.visibilityBtn.addEventListener('click', () => this.toggleVisibility());
        this.generateBtn.addEventListener('click', () => this.generateNewKey());
        this.keyStatus.addEventListener('click', () => this.copyToClipboard());

        // Initial state
        this.visibilityIcon.className = 'bi bi-eye-slash-fill';
        this.visibilityIcon.style.color = 'red';
        this.visibilityBtn.title = 'Show';
        
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

    async generateNewKey() {
        try {
            // Show loading state
            this.keyStatus.textContent = 'Generating...';
            this.generateBtn.disabled = true;

            const response = await fetch('/api/reg-key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
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
                throw new Error(data.error || 'Failed to generate key');
            }
        } catch (error) {
            console.error('Error generating new key:', error);
            this.keyStatus.textContent = 'Error generating key';
        } finally {
            // Re-enable the button
            this.generateBtn.disabled = false;
        }
    }

     async copyToClipboard() {
        if (!this.currentKey) return;
        
        try {
            await navigator.clipboard.writeText(this.currentKey);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = this.currentKey;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KeyContainer();
});
