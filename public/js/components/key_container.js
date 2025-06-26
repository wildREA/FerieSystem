// Discord-style Key Container Component JavaScript
class KeyContainer {
    constructor() {
        this.keyInput = document.getElementById('key_value');
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
        this.visibilityBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleVisibility();
        });
        this.generateBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.generateKey();
        });
        this.keyInput.addEventListener('click', () => this.copyToClipboard());
        this.keyDisplay.addEventListener('click', () => this.toggleKeyInput());
        
        // Initial state
        this.updateVisibilityButton();
        this.updateStatus();
    }

    toggleVisibility() {
        let visible = false

        if (!visible) {
            console.log("Visible")
            visibi = true;
        } else {
            console.log("Invisible")
            visibi = false;
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
