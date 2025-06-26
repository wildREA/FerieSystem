// Discord-style Key Container Component JavaScript
class KeyContainer {
    constructor() {
        this.keyInput = document.getElementById('key_value');
        this.visibilityBtn = document.getElementById('visibility');
        this.generateBtn = document.getElementById('generate_key');
        this.keyStatus = document.getElementById('key_status');
        this.keyContainer = document.querySelector('.key-container');
        this.keyDisplay = document.querySelector('.key-display');
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
    
    toggleKeyInput() {
        if (!this.currentKey) return;
        
        const isInputVisible = this.keyInput.style.display !== 'none';
        this.keyInput.style.display = isInputVisible ? 'none' : 'block';
        
        if (!isInputVisible) {
            this.keyInput.focus();
            this.keyInput.select();
        }
    }
    
    toggleVisibility() {
        if (!this.currentKey) return;
        
        this.isVisible = !this.isVisible;
        this.updateKeyDisplay();
        this.updateVisibilityButton();
    }
    
    updateVisibilityButton() {
        const icon = this.visibilityBtn.querySelector('i');
        if (this.isVisible) {
            icon.className = 'fas fa-eye-slash';
            this.visibilityBtn.title = 'Hide Key';
        } else {
            icon.className = 'fas fa-eye';
            this.visibilityBtn.title = 'Show Key';
        }
    }
    
    updateStatus() {
        if (this.currentKey) {
            this.keyStatus.textContent = 'Key ready • Click to view';
            this.keyStatus.classList.add('has-key');
        } else {
            this.keyStatus.textContent = 'No key generated';
            this.keyStatus.classList.remove('has-key');
        }
    }
    
    updateKeyDisplay() {
        if (!this.currentKey) return;
        
        if (this.isVisible) {
            this.keyInput.value = this.currentKey;
            this.keyInput.classList.remove('hidden-key');
        } else {
            this.keyInput.value = this.currentKey;
            this.keyInput.classList.add('hidden-key');
        }
    }
    
    generateKey() {
        // Show loading state
        this.keyContainer.classList.add('generating');
        this.keyStatus.textContent = 'Generating key...';
        this.generateBtn.disabled = true;
        
        // Simulate API call delay
        setTimeout(() => {
            this.currentKey = this.createRandomKey();
            this.isVisible = false; // Hide by default for security
            this.updateKeyDisplay();
            this.updateVisibilityButton();
            this.updateStatus();
            
            // Show visibility button and update UI
            this.visibilityBtn.style.display = 'flex';
            this.generateBtn.querySelector('i').className = 'fas fa-sync-alt';
            this.generateBtn.title = 'Regenerate Key';
            
            // Remove loading state
            this.keyContainer.classList.remove('generating');
            this.generateBtn.disabled = false;
            
            // Show success message
            this.showToast('New API key generated successfully!', 'success');
        }, 1000);
    }
    
    createRandomKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const segments = [];
        
        // Generate key in format: XXXX-XXXX-XXXX-XXXX-XXXX
        for (let i = 0; i < 5; i++) {
            let segment = '';
            for (let j = 0; j < 4; j++) {
                segment += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            segments.push(segment);
        }
        
        return segments.join('-');
    }
    
    async copyToClipboard() {
        if (!this.currentKey) return;
        
        try {
            await navigator.clipboard.writeText(this.currentKey);
            this.showToast('API key copied to clipboard!', 'success');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = this.currentKey;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('API key copied to clipboard!', 'success');
        }
    }
    
    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add toast styles if not already present
        if (!document.getElementById('toast-styles')) {
            const toastStyles = document.createElement('style');
            toastStyles.id = 'toast-styles';
            toastStyles.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background-color: #222941;
                    border: 1px solid #2c3142;
                    border-radius: 6px;
                    padding: 12px 16px;
                    color: #ffffff;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 14px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
                    z-index: 10000;
                    opacity: 0;
                    transform: translateX(100%);
                    transition: all 0.3s ease;
                }
                .toast.show {
                    opacity: 1;
                    transform: translateX(0);
                }
                .toast-success {
                    border-left: 4px solid #28a745;
                }
                .toast-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .toast-content i {
                    color: #28a745;
                }
            `;
            document.head.appendChild(toastStyles);
        }
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KeyContainer();
});
