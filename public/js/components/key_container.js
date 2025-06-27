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
        this.generateBtn.addEventListener('click', () => this.generateKey());

        // Initial state
        this.keyStatus.textContent = 'No key generated';
    }

    toggleVisibility() {
        if (!this.isVisible) {
            this.isVisible = true;
            console.log("Visible state: " + this.isVisible);
            // Change icon to eye when visible
            this.visibilityIcon.className = 'bi bi-eye';
            // Change title to "Hide" when visible
            this.visibilityBtn.title = 'Hide';
        } else {
            this.isVisible = false;
            console.log("Invisible state: " + this.isVisible);
            // Change icon to eye-slash-fill when hidden
            this.visibilityIcon.className = 'bi bi-eye-slash-fill';
            // Change title to "Show" when hidden
            this.visibilityBtn.title = 'Show';
        }
    }

    generateKey() {
        this.currentKey = Math.random().toString(36).substring(2, 10).toUpperCase();
        this.keyStatus.textContent = this.currentKey;
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
