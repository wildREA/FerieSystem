// Discord-style Key Container Component JavaScript
class KeyContainer {
    constructor() {
        this.visibilityBtn = document.getElementById('visibility');
        this.generateBtn = document.getElementById('generate_key');
        this.keyStatus = document.getElementById('key_status');
        this.keyContainer = document.querySelector('.key-container');
        this.keyDisplay = document.querySelector('.key-display');
        this.keyCode = document.querySelector('.key-code');
        this.isVisible = false;
        this.currentKey = '';
        
        this.init();
    }
    
    init() {
        // Bind event listeners
        this.visibilityBtn.addEventListener('click', () => this.toggleVisibility());
        this.generateBtn.addEventListener('click', () => this.toggleVisibility());

        // Initial state
        this.keyStatus.textContent = 'No key generated';
    }

    toggleVisibility() {
        if (!this.isVisible) {
            console.log("Visible (state: " + this.isVisible + ")");
            this.isVisible = true;
        } else {
            console.log("Invisible (state: " + this.isVisible + ")");
            this.isVisible = false;
        }
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
