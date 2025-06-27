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
        this.generateBtn.addEventListener('click', () => ());  // Unfinished (placeholder) line of code for key generation event listener
        this.keyStatus.addEventListener('click', () => this.copyToClipboard());

        // Initial state
        // WAIT A BIT WITH BLUR, FINISH API FIRST - this.keyStatus.style.filter = 'blur(4px)'; // Start with blurred text
        this.visibilityIcon.className = 'bi bi-eye-slash-fill'; // Start with eye-slash icon
        this.visibilityIcon.style.color = 'red'; // Set initial color to red
        this.visibilityBtn.title = 'Show'; // Set initial tooltip
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
