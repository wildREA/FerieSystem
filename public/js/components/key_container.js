// Key Container Component JavaScript
class KeyContainer {
    constructor() {
        this.keyInput = document.getElementById('key_value');
        this.visibilityBtn = document.getElementById('visibility');
        this.generateBtn = document.getElementById('generate_key');
        this.isVisible = false;
        this.currentKey = '';
        
        this.init();
    }
    
    init() {
        // Bind event listeners
        this.visibilityBtn.addEventListener('click', () => this.toggleVisibility());
        this.generateBtn.addEventListener('click', () => this.generateKey());
        this.keyInput.addEventListener('click', () => this.copyToClipboard());
        
        // Initial state
        this.updateVisibilityButton();
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
        this.keyInput.classList.add('generating');
        this.generateBtn.disabled = true;
        
        // Simulate API call delay
        setTimeout(() => {
            this.currentKey = this.createRandomKey();
            this.isVisible = true; // Show key by default when generated
            this.updateKeyDisplay();
            this.updateVisibilityButton();
            
            // Remove loading state
            this.keyInput.classList.remove('generating');
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
