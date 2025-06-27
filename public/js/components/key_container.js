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
            const response = await fetch('/api/reg-key/');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            if (!data.key) {
            this.keyStatus.textContent = 'No key generated';
            }
            
            this.currentKey = data.key;
            // this.keyStatus.textContent = this.isVisible ? data.key : '••••••••••••••••';  Implement the tagged text after key works
            this.keyStatus.textContent = data.key;
        } catch (error) {
            console.error('Error fetching registration key:', error);
            this.keyStatus.textContent = 'Error loading key';
            
            setTimeout(() => {
            this.keyStatus.textContent = 'No key generated';
            }, 2000);
        }
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
        this.loadExistingKey();  // Load existing key on initialization if any
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
            const response = await fetch('/api/reg-key/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            if (data.error) {
                this.showToast(data.error, 'error');
                return;
            }

            this.currentKey = data.key;
            this.keyStatus.textContent = this.isVisible ? data.key : '••••••••••••••••'; // Update key display
        } catch (error) {
            console.error('Error generating new key:', error);
        }
    }

     async copyToClipboard() {
        if (!this.currentKey) return;
        
        try {
            await navigator.clipboard.writeText(this.currentKey);
            // Success/Failure UI here
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = this.currentKey;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            // Success/Failure UI here
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KeyContainer();
});
